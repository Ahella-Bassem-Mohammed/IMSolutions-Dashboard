const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const router = express.Router();
const auth = require("../middleware/auth");

module.exports = (app) => {
  const { runQuery, getQuery } = app.locals;
  const db = app.locals.db;

  // ── REGISTER (admin-only in practice; route kept for flexibility) ──────────
  router.post("/register", async (req, res) => {
    const { email, password, full_name, role, department } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }
    try {
      const existing = await getQuery(
        db,
        "SELECT id FROM users WHERE email = ?",
        [email],
      );
      if (existing)
        return res.status(400).json({ message: "User already exists" });

      const salt = await bcrypt.genSalt(10);
      const password_hash = await bcrypt.hash(password, salt);
      const result = await runQuery(
        db,
        `INSERT INTO users (email, password_hash, full_name, role, department, is_active, must_change_password)
         VALUES (?, ?, ?, ?, ?, 1, 1)`,
        [email, password_hash, full_name, role || "viewer", department],
      );

      const token = jwt.sign(
        {
          id: result.lastID,
          email,
          role: role || "viewer",
          department: department || null,
          must_change_password: true,
        },
        process.env.JWT_SECRET,
        { expiresIn: "24h" },
      );

      res.json({
        token,
        user: {
          id: result.lastID,
          email,
          role: role || "viewer",
          department,
          must_change_password: true,
        },
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  });

  // ── LOGIN ──────────────────────────────────────────────────────────────────
  router.post("/login", async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }
    try {
      const user = await getQuery(
        db,
        `SELECT id, email, password_hash, role, department, full_name, must_change_password
         FROM users WHERE email = ? AND is_active = 1`,
        [email],
      );

      if (!user)
        return res.status(401).json({ message: "Invalid credentials" });

      const isMatch = await bcrypt.compare(password, user.password_hash);
      if (!isMatch)
        return res.status(401).json({ message: "Invalid credentials" });

      // Audit log
      await runQuery(
        db,
        "INSERT INTO audit_log (user_id, action, ip_address, user_agent) VALUES (?, ?, ?, ?)",
        [
          user.id,
          "login",
          req.ip || "unknown",
          req.headers["user-agent"] || "unknown",
        ],
      );

      const mustChange = user.must_change_password === 1;

      const token = jwt.sign(
        {
          id: user.id,
          email: user.email,
          role: user.role,
          department: user.department,
          must_change_password: mustChange,
        },
        process.env.JWT_SECRET,
        { expiresIn: "24h" },
      );

      res.json({
        token,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          department: user.department,
          full_name: user.full_name,
          must_change_password: mustChange,
        },
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  });

  // ── VERIFY token ───────────────────────────────────────────────────────────
  router.get("/verify", async (req, res) => {
    const token =
      req.headers["x-auth-token"] ||
      req.headers["authorization"]?.replace("Bearer ", "");

    if (!token) return res.json({ valid: false });

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await getQuery(
        db,
        "SELECT id, email, role, department, full_name, must_change_password FROM users WHERE id = ? AND is_active = 1",
        [decoded.id],
      );
      if (!user) return res.json({ valid: false });

      res.json({
        valid: true,
        user: {
          ...user,
          must_change_password: user.must_change_password === 1,
        },
      });
    } catch (err) {
      res.json({ valid: false });
    }
  });

  // ── CHANGE PASSWORD (authenticated user changes their own password) ─────────
  router.post("/change-password", auth, async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res
        .status(400)
        .json({ message: "Both current and new password are required" });
    }
    if (newPassword.length < 8) {
      return res
        .status(400)
        .json({ message: "New password must be at least 8 characters" });
    }

    try {
      const user = await getQuery(
        db,
        "SELECT id, password_hash FROM users WHERE id = ?",
        [req.user.id],
      );

      const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
      if (!isMatch) {
        return res
          .status(401)
          .json({ message: "Current password is incorrect" });
      }

      const salt = await bcrypt.genSalt(10);
      const password_hash = await bcrypt.hash(newPassword, salt);

      await runQuery(
        db,
        "UPDATE users SET password_hash = ?, must_change_password = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
        [password_hash, req.user.id],
      );

      // Audit
      await runQuery(
        db,
        "INSERT INTO audit_log (user_id, action, ip_address, user_agent) VALUES (?, ?, ?, ?)",
        [
          req.user.id,
          "password_changed",
          req.ip || "unknown",
          req.headers["user-agent"] || "unknown",
        ],
      );

      // Issue a fresh token with must_change_password = false
      const fresh = await getQuery(
        db,
        "SELECT id, email, role, department, full_name FROM users WHERE id = ?",
        [req.user.id],
      );
      const token = jwt.sign(
        {
          id: fresh.id,
          email: fresh.email,
          role: fresh.role,
          department: fresh.department,
          must_change_password: false,
        },
        process.env.JWT_SECRET,
        { expiresIn: "24h" },
      );

      res.json({
        message: "Password changed successfully",
        token,
        user: { ...fresh, must_change_password: false },
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  });

  return router;
};
