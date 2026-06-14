require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const { initDatabase, runQuery, getQuery, allQuery } = require("./database/db");

const app = express();
const PORT = process.env.PORT || 5000;

const db = initDatabase();
console.log("✅ SQLite database initialized");

app.locals.db = db;
app.locals.runQuery = runQuery;
app.locals.getQuery = getQuery;
app.locals.allQuery = allQuery;

// CORS — reads allowed origins from .env so no code change needed per environment
const allowedOrigins = (process.env.ALLOWED_ORIGINS || "http://localhost:3000")
  .split(",")
  .map((o) => o.trim());

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (curl, Postman, server-to-server)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      callback(new Error(`CORS blocked: ${origin}`));
    },
    credentials: true,
  }),
);

app.use(express.json());

const authRoutes = require("./routes/auth")(app);
const linksRoutes = require("./routes/links")(app);
const adminRoutes = require("./routes/admin")(app);

app.use("/api/auth", authRoutes);
app.use("/api/links", linksRoutes);
app.use("/api/admin", adminRoutes);

app.get("/api/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

async function setupAdmin() {
  const adminEmail = process.env.ADMIN_EMAIL || "admin@im-solutions.com";
  const adminPassword = process.env.ADMIN_PASSWORD || "Admin123!";

  try {
    const existingAdmin = await getQuery(
      db,
      "SELECT id FROM users WHERE email = ?",
      [adminEmail],
    );

    if (!existingAdmin) {
      const salt = await bcrypt.genSalt(10);
      const password_hash = await bcrypt.hash(adminPassword, salt);
      await runQuery(
        db,
        `INSERT INTO users
           (email, password_hash, full_name, role, department, is_active, must_change_password)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          adminEmail,
          password_hash,
          "System Administrator",
          "admin",
          "management",
          1,
          0,
        ],
      );
      console.log("✅ Default admin user created");
      console.log(`   Email: ${adminEmail}`);
      console.log("   ⚠️  CHANGE THIS PASSWORD AFTER FIRST LOGIN!");
    } else {
      console.log("✅ Admin user already exists");
    }
  } catch (err) {
    console.error("Error setting up admin:", err.message);
  }
}

async function startServer() {
  await setupAdmin();
  app.listen(PORT, () => {
    console.log(`\n🚀 Server running on port ${PORT}`);
    console.log(`📍 API URL: http://localhost:${PORT}`);
    console.log(`🔐 Auth: http://localhost:${PORT}/api/auth/login`);
    console.log(`\n💡 Test: curl http://localhost:${PORT}/api/health\n`);
  });
}

startServer();
module.exports = app;
