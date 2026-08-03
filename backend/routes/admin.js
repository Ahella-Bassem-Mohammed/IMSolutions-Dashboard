const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const { sendVerificationEmail } = require("../utils/emailService");

module.exports = (app) => {
  const { runQuery, getQuery, allQuery } = app.locals;
  const db = app.locals.db;

  const isAdmin = (req, res, next) => {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }
    next();
  };

  // ── USERS ──────────────────────────────────────────────────────────────────

  router.get("/users", auth, isAdmin, async (req, res) => {
    try {
      const users = await allQuery(
        db,
        `SELECT id, email, full_name, role, department, is_active, must_change_password, is_verified, created_at
         FROM users ORDER BY created_at DESC`,
      );
      res.json(users);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Create user — sends verification email; user must verify before login
  router.post("/users", auth, isAdmin, async (req, res) => {
    const { email, password, full_name, role, department } = req.body;
    if (!email || !password || !full_name) {
      return res
        .status(400)
        .json({ message: "email, password and full_name are required" });
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
      const verificationToken = crypto.randomBytes(32).toString("hex");
      const tokenExpiresAt = new Date(
        Date.now() + 24 * 60 * 60 * 1000,
      ).toISOString();

      const result = await runQuery(
        db,
        `INSERT INTO users (email, password_hash, full_name, role, department, is_active, must_change_password, is_verified, verification_token, token_expires_at)
         VALUES (?, ?, ?, ?, ?, 1, 1, 0, ?, ?)`,
        [
          email,
          password_hash,
          full_name,
          role || "viewer",
          department || null,
          verificationToken,
          tokenExpiresAt,
        ],
      );

      let emailSent = false;
      try {
        await sendVerificationEmail(email, verificationToken);
        emailSent = true;
      } catch (emailErr) {
        console.error("Failed to send verification email:", emailErr);
      }

      await runQuery(
        db,
        "INSERT INTO audit_log (user_id, action, detail, ip_address) VALUES (?, ?, ?, ?)",
        [req.user.id, "admin_created_user", email, req.ip],
      );

      res.json({
        message: emailSent
          ? "User created. A verification email has been sent."
          : "User created, but the verification email could not be sent. Use Resend Verification from the admin panel.",
        userId: result.lastID,
        emailSent,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Edit user (name, role, department, active status)
  router.put("/users/:id", auth, isAdmin, async (req, res) => {
    const { full_name, role, department, is_active } = req.body;
    try {
      await runQuery(
        db,
        `UPDATE users SET full_name=?, role=?, department=?, is_active=?, updated_at=CURRENT_TIMESTAMP
         WHERE id=?`,
        [full_name, role, department || null, is_active ? 1 : 0, req.params.id],
      );
      res.json({ message: "User updated" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  });

  router.delete("/users/:id", auth, isAdmin, async (req, res) => {
    if (String(req.user.id) === String(req.params.id)) {
      return res.status(400).json({ message: "You cannot delete your own admin account" });
    }

    try {
      const targetUser = await getQuery(
        db,
        "SELECT id, email FROM users WHERE id = ?",
        [req.params.id],
      );
      if (!targetUser) {
        return res.status(404).json({ message: "User not found" });
      }

      await runQuery(db, "DELETE FROM users WHERE id = ?", [req.params.id]);
      await runQuery(
        db,
        "INSERT INTO audit_log (user_id, action, detail, ip_address) VALUES (?, ?, ?, ?)",
        [req.user.id, "admin_deleted_user", targetUser.email, req.ip],
      );

      res.json({ message: "User deleted successfully" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Admin resets a user's password (forces must_change_password back to 1)
  router.post("/users/:id/reset-password", auth, isAdmin, async (req, res) => {
    const { newPassword } = req.body;
    if (!newPassword || newPassword.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });
    }
    try {
      const salt = await bcrypt.genSalt(10);
      const password_hash = await bcrypt.hash(newPassword, salt);
      await runQuery(
        db,
        "UPDATE users SET password_hash=?, must_change_password=1, updated_at=CURRENT_TIMESTAMP WHERE id=?",
        [password_hash, req.params.id],
      );

      await runQuery(
        db,
        "INSERT INTO audit_log (user_id, action, detail, ip_address) VALUES (?, ?, ?, ?)",
        [
          req.user.id,
          "admin_reset_password",
          `userId:${req.params.id}`,
          req.ip,
        ],
      );

      res.json({
        message:
          "Password reset. User will be prompted to change it on next login.",
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Resend verification email for an unverified user
  router.post("/users/:id/resend-verification", auth, isAdmin, async (req, res) => {
    try {
      const user = await getQuery(
        db,
        "SELECT id, email, is_verified FROM users WHERE id = ? AND is_active = 1",
        [req.params.id],
      );
      if (!user) return res.status(404).json({ message: "User not found" });
      if (user.is_verified === 1) {
        return res.status(400).json({ message: "Email already verified" });
      }

      const newToken = crypto.randomBytes(32).toString("hex");
      const newExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      await runQuery(
        db,
        "UPDATE users SET verification_token = ?, token_expires_at = ? WHERE id = ?",
        [newToken, newExpiry, user.id],
      );

      await sendVerificationEmail(user.email, newToken);

      await runQuery(
        db,
        "INSERT INTO audit_log (user_id, action, detail, ip_address) VALUES (?, ?, ?, ?)",
        [req.user.id, "admin_resend_verification", user.email, req.ip],
      );

      res.json({ message: `Verification email sent to ${user.email}` });
    } catch (err) {
      console.error(err);
      res.status(500).json({
        message: err.message?.includes("Invalid login")
          ? "Email could not be sent. Check EMAIL_USER and EMAIL_PASS in backend/.env"
          : "Failed to send verification email",
      });
    }
  });

  // ── DASHBOARDS ─────────────────────────────────────────────────────────────

  router.get("/dashboards", auth, isAdmin, async (req, res) => {
    const dashboards = await allQuery(
      db,
      "SELECT * FROM dashboards ORDER BY category, title",
    );
    res.json(dashboards);
  });

  router.post("/dashboards", auth, isAdmin, async (req, res) => {
    const { title, description, url, category, icon, backgroundColor, tags } =
      req.body;
    if (!title || !url || !category) {
      return res
        .status(400)
        .json({ message: "title, url and category are required" });
    }
    const result = await runQuery(
      db,
      "INSERT INTO dashboards (title, description, url, category, icon, backgroundColor, tags) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [
        title,
        description,
        url,
        category,
        icon || "🔗",
        backgroundColor || "#4CAF50",
        JSON.stringify(tags || []),
      ],
    );
    res.json({ id: result.lastID, message: "Dashboard added" });
  });

  router.put("/dashboards/:id", auth, isAdmin, async (req, res) => {
    const { title, description, url, category, icon, backgroundColor, tags } =
      req.body;
    await runQuery(
      db,
      "UPDATE dashboards SET title=?, description=?, url=?, category=?, icon=?, backgroundColor=?, tags=? WHERE id=?",
      [
        title,
        description,
        url,
        category,
        icon,
        backgroundColor,
        JSON.stringify(tags),
        req.params.id,
      ],
    );
    res.json({ message: "Dashboard updated" });
  });

  router.delete("/dashboards/:id", auth, isAdmin, async (req, res) => {
    await runQuery(db, "DELETE FROM dashboards WHERE id=?", [req.params.id]);
    res.json({ message: "Dashboard deleted" });
  });

  // ── USER–DASHBOARD ASSIGNMENTS ─────────────────────────────────────────────

  // Get dashboards assigned to a specific user
  router.get("/user-dashboards/:userId", auth, isAdmin, async (req, res) => {
    const dashboards = await allQuery(
      db,
      `SELECT d.* FROM dashboards d
       JOIN user_dashboard_access u ON u.dashboard_id = d.id
       WHERE u.user_id = ?
       ORDER BY d.category, d.title`,
      [req.params.userId],
    );
    res.json(dashboards);
  });

  // Assign a single dashboard to a user
  router.post("/assign-dashboard", auth, isAdmin, async (req, res) => {
    const { userId, dashboardId } = req.body;
    await runQuery(
      db,
      "INSERT OR IGNORE INTO user_dashboard_access (user_id, dashboard_id) VALUES (?, ?)",
      [userId, dashboardId],
    );
    res.json({ message: "Assigned" });
  });

  // Remove a single assignment
  router.delete("/assign-dashboard", auth, isAdmin, async (req, res) => {
    const { userId, dashboardId } = req.body;
    await runQuery(
      db,
      "DELETE FROM user_dashboard_access WHERE user_id=? AND dashboard_id=?",
      [userId, dashboardId],
    );
    res.json({ message: "Removed" });
  });

  // Bulk replace all assignments for a user at once
  router.post("/assign-dashboards-bulk", auth, isAdmin, async (req, res) => {
    const { userId, dashboardIds } = req.body;
    if (!userId) return res.status(400).json({ message: "userId required" });
    try {
      await runQuery(db, "DELETE FROM user_dashboard_access WHERE user_id=?", [
        userId,
      ]);
      for (const dashboardId of dashboardIds || []) {
        await runQuery(
          db,
          "INSERT OR IGNORE INTO user_dashboard_access (user_id, dashboard_id) VALUES (?, ?)",
          [userId, dashboardId],
        );
      }
      res.json({
        message: `Assigned ${(dashboardIds || []).length} dashboards to user ${userId}`,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  });

  // ── AUDIT LOG ──────────────────────────────────────────────────────────────

  router.get("/audit-log", auth, isAdmin, async (req, res) => {
    try {
      const logs = await allQuery(
        db,
        `SELECT a.id, a.action, a.detail, a.ip_address, a.created_at,
                u.email, u.full_name
         FROM audit_log a
         LEFT JOIN users u ON u.id = a.user_id
         ORDER BY a.created_at DESC
         LIMIT 200`,
      );
      res.json(logs);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  });

  return router;
};
