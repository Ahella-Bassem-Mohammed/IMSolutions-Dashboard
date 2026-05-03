const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const router = express.Router();

module.exports = (app) => {
  const { runQuery, getQuery } = app.locals;
  const db = app.locals.db;

  // REGISTER new user
  router.post("/register", async (req, res) => {
    const { email, password, full_name, role, department } = req.body;

    try {
      // Check if user exists
      const existingUser = await getQuery(
        db,
        "SELECT id FROM users WHERE email = ?",
        [email],
      );
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const password_hash = await bcrypt.hash(password, salt);

      // Create user
      const result = await runQuery(
        db,
        "INSERT INTO users (email, password_hash, full_name, role, department, is_active) VALUES (?, ?, ?, ?, ?, ?)",
        [email, password_hash, full_name, role || "viewer", department, 1],
      );

      // Create token
      const token = jwt.sign(
        {
          id: result.lastID,
          email,
          role: role || "viewer",
          department: department || null,
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
          department: department || null,
        },
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  });

  // LOGIN
  router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    try {
      // Get user
      const user = await getQuery(
        db,
        "SELECT id, email, password_hash, role, department, full_name FROM users WHERE email = ? AND is_active = 1",
        [email],
      );

      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Check password
      const isMatch = await bcrypt.compare(password, user.password_hash);
      if (!isMatch) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Log audit
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

      // Create token
      const token = jwt.sign(
        {
          id: user.id,
          email: user.email,
          role: user.role,
          department: user.department,
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
        },
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  });

  // VERIFY token
  router.get("/verify", async (req, res) => {
    // Get token from header
    const token =
      req.headers["x-auth-token"] ||
      req.headers["authorization"]?.replace("Bearer ", "");

    if (!token) {
      return res.json({ valid: false });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await getQuery(
        db,
        "SELECT id, email, role, department FROM users WHERE id = ?",
        [decoded.id],
      );

      if (!user) {
        return res.json({ valid: false });
      }

      res.json({ valid: true, user });
    } catch (err) {
      res.json({ valid: false });
    }
  });

  return router;
};
