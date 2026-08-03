const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const router = express.Router();
const auth = require("../middleware/auth");

// At the top, add require for crypto and the email service
const crypto = require('crypto');
const { sendVerificationEmail } = require('../utils/emailService');

// --- Helper to generate verification token (expires in 24h) ---
const generateVerificationToken = () => {
  return {
    token: crypto.randomBytes(32).toString('hex'),
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
  };
};

module.exports = (app) => {
  const { runQuery, getQuery } = app.locals;
  const db = app.locals.db;

  // ── REGISTER (admin-only in practice; route kept for flexibility) ──────────
router.post("/register", async (req, res) => {
  const { email, password, full_name, role, department } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
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

    // Generate verification token (expires in 24h)
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
        department,
        verificationToken,
        tokenExpiresAt,
      ],
    );

    // Send verification email (don't block on error, but log it)
    try {
      await sendVerificationEmail(email, verificationToken);
    } catch (emailErr) {
      console.error("Failed to send verification email:", emailErr);
    }

    // Do NOT issue a token yet – user must verify email first.
    res.json({
      message:
        "Registration successful. Please check your email to verify your account before logging in.",
      userId: result.lastID,
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
        `SELECT id, email, password_hash, role, department, full_name, must_change_password,is_verified
         FROM users WHERE email = ? AND is_active = 1`,
        [email],
      );

      if (!user)
        return res.status(401).json({ message: "Invalid credentials" });

      const isMatch = await bcrypt.compare(password, user.password_hash);
      if (!isMatch)
        return res.status(401).json({ message: "Invalid credentials" });

      // Check if user's email is verified
      if (user.is_verified !== 1) {
        return res.status(403).json({
          message:
            "Please verify your email before logging in. Check your inbox for the verification link.",
          needsVerification: true,
        });
      }
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


router.get("/verify-email", async (req, res) => {
  const { token } = req.query;
  if (!token)
    return res.status(400).json({ message: "Verification token missing" });

  try {
    const user = await getQuery(
      db,
      "SELECT id, verification_token, token_expires_at FROM users WHERE verification_token = ?",
      [token],
    );
    if (!user)
      return res.status(400).json({ message: "Invalid or expired token" });

    const now = new Date();
    const expiresAt = new Date(user.token_expires_at);
    if (now > expiresAt) {
      return res
        .status(400)
        .json({ message: "Token expired. Request a new verification email." });
    }

    // Mark user as verified and clear token
    await runQuery(
      db,
      "UPDATE users SET is_verified = 1, verification_token = NULL, token_expires_at = NULL WHERE id = ?",
      [user.id],
    );

    res.json({ message: "Email verified successfully! You can now log in." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});


router.post("/resend-verification", async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: "Email is required" });

  try {
    const user = await getQuery(
      db,
      "SELECT id, email, is_verified FROM users WHERE email = ? AND is_active = 1",
      [email],
    );
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.is_verified === 1)
      return res.status(400).json({ message: "Email already verified" });

    // Generate new token
    const newToken = crypto.randomBytes(32).toString("hex");
    const newExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    await runQuery(
      db,
      "UPDATE users SET verification_token = ?, token_expires_at = ? WHERE id = ?",
      [newToken, newExpiry, user.id],
    );

    await sendVerificationEmail(email, newToken);
    res.json({ message: "Verification email resent. Check your inbox." });
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
