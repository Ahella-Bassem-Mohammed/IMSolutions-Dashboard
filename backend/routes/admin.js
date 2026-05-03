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

  // GET all users (admin only)
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

  // CREATE new user (admin only)
  router.post("/users", auth, isAdmin, async (req, res) => {
    const { email, password, full_name, role, department } = req.body;

    try {
      const existing = await getQuery(
        db,
        "SELECT id FROM users WHERE email = ?",
        [email],
      );
      if (existing) {
        return res.status(400).json({ message: "User already exists" });
      }

      const salt = await bcrypt.genSalt(10);
      const password_hash = await bcrypt.hash(password, salt);

      const result = await runQuery(
        db,
        "INSERT INTO users (email, password_hash, full_name, role, department, is_active) VALUES (?, ?, ?, ?, ?, ?)",
        [email, password_hash, full_name, role || "viewer", department, 1],
      );

      res.json({ message: "User created successfully", userId: result.lastID });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  });

  return router;
};
