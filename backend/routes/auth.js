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
      // In your /login route, add:
      if (!user.is_verified) {
        return res
          .status(401)
          .json({ message: "Please verify your email before logging in" });
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

const crypto = require("crypto");
const {
  sendVerificationEmail,
  sendPasswordResetEmail,
} = require("../utils/email");

// REGISTER with email verification
router.post("/register", async (req, res) => {
  const { email, password, full_name, role, department } = req.body;
  try {
    const existing = await getQuery(
      db,
      "SELECT id FROM users WHERE email = ?",
      [email],
    );
    if (existing)
      return res.status(400).json({ message: "Email already registered" });

    const verification_token = crypto.randomBytes(32).toString("hex");
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    await runQuery(
      db,
      `INSERT INTO users (email, password_hash, full_name, role, department, is_active, is_verified, verification_token)
       VALUES (?, ?, ?, ?, ?, 1, 0, ?)`,
      [
        email,
        password_hash,
        full_name,
        role || "viewer",
        department,
        verification_token,
      ],
    );

    await sendVerificationEmail(email, verification_token);
    res.json({
      message:
        "Registration successful. Please check your email to verify your account.",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// VERIFY EMAIL
router.get("/verify-email", async (req, res) => {
  const { token } = req.query;
  try {
    const user = await getQuery(
      db,
      "SELECT id FROM users WHERE verification_token = ? AND is_verified = 0",
      [token],
    );
    if (!user) return res.status(400).send("Invalid or expired token");

    await runQuery(
      db,
      "UPDATE users SET is_verified = 1, verification_token = NULL WHERE id = ?",
      [user.id],
    );
    res.send("✅ Email verified! You can now log in.");
  } catch (err) {
    res.status(500).send("Verification failed");
  }
});

// FORGOT PASSWORD
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;
  const user = await getQuery(db, "SELECT id FROM users WHERE email = ?", [
    email,
  ]);
  if (!user) return res.status(404).json({ message: "Email not found" });

  const reset_token = crypto.randomBytes(32).toString("hex");
  const reset_expires = new Date(Date.now() + 3600000).toISOString(); // 1 hour

  await runQuery(
    db,
    "UPDATE users SET reset_token = ?, reset_expires = ? WHERE id = ?",
    [reset_token, reset_expires, user.id],
  );
  await sendPasswordResetEmail(email, reset_token);
  res.json({ message: "Password reset link sent to your email" });
});

// RESET PASSWORD
router.post("/reset-password", async (req, res) => {
  const { token, newPassword } = req.body;
  const user = await getQuery(
    db,
    'SELECT id FROM users WHERE reset_token = ? AND reset_expires > datetime("now")',
    [token],
  );
  if (!user)
    return res.status(400).json({ message: "Invalid or expired token" });

  const salt = await bcrypt.genSalt(10);
  const password_hash = await bcrypt.hash(newPassword, salt);
  await runQuery(
    db,
    "UPDATE users SET password_hash = ?, reset_token = NULL, reset_expires = NULL WHERE id = ?",
    [password_hash, user.id],
  );
  res.json({ message: "Password reset successfully" });
});
