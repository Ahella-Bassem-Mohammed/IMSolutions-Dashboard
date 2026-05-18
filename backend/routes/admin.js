const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const bcrypt = require("bcryptjs");

module.exports = (app) => {
  const { runQuery, getQuery, allQuery } = app.locals;
  const db = app.locals.db;

  // Middleware to check if user is admin
  const isAdmin = async (req, res, next) => {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }
    next();
  };

  // ---------- User management ----------
  router.get("/users", auth, isAdmin, async (req, res) => {
    try {
      const users = await allQuery(
        db,
        "SELECT id, email, full_name, role, department, is_active, created_at FROM users ORDER BY created_at DESC",
      );
      res.json(users);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  });

  router.post("/users", auth, isAdmin, async (req, res) => {
    const { email, password, full_name, role, department } = req.body;
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
        `INSERT INTO users (email, password_hash, full_name, role, department, is_active, is_verified)
   VALUES (?, ?, ?, ?, ?, 1, 1)`,
        [email, password_hash, full_name, role || "viewer", department],
      );
      res.json({ message: "User created successfully", userId: result.lastID });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  });

  // ---------- Dashboard management ----------
  router.get("/dashboards", auth, isAdmin, async (req, res) => {
    const dashboards = await allQuery(
      db,
      "SELECT * FROM dashboards ORDER BY category, id",
    );
    res.json(dashboards);
  });

  router.post("/dashboards", auth, isAdmin, async (req, res) => {
    const { title, description, url, category, icon, backgroundColor, tags } =
      req.body;
    const result = await runQuery(
      db,
      "INSERT INTO dashboards (title, description, url, category, icon, backgroundColor, tags) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [
        title,
        description,
        url,
        category,
        icon,
        backgroundColor,
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

  // ---------- User-dashboard assignments ----------
  // ------------------- User-dashboard assignments -------------------
  router.get("/user-dashboards/:userId", auth, isAdmin, async (req, res) => {
    const dashboards = await allQuery(
      db,
      `SELECT d.* FROM dashboards d
         JOIN user_dashboard_access u ON u.dashboard_id = d.id
         WHERE u.user_id = ?`,
      [req.params.userId],
    );
    res.json(dashboards);
  });

  router.post("/assign-dashboard", auth, isAdmin, async (req, res) => {
    const { userId, dashboardId } = req.body;
    await runQuery(
      db,
      "INSERT OR IGNORE INTO user_dashboard_access (user_id, dashboard_id) VALUES (?, ?)",
      [userId, dashboardId],
    );
    res.json({ message: "Assigned" });
  });

  router.delete("/assign-dashboard", auth, isAdmin, async (req, res) => {
    const { userId, dashboardId } = req.body;
    await runQuery(
      db,
      "DELETE FROM user_dashboard_access WHERE user_id=? AND dashboard_id=?",
      [userId, dashboardId],
    );
    res.json({ message: "Removed" });
  });

  return router;
};
