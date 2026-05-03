require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const { initDatabase, runQuery, getQuery, allQuery } = require("./database/db");

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize SQLite database
const db = initDatabase();
console.log("✅ SQLite database initialized");

// Make db available to routes
app.locals.db = db;
app.locals.runQuery = runQuery;
app.locals.getQuery = getQuery;
app.locals.allQuery = allQuery;

// Middleware
app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:3001"],
    credentials: true,
  }),
);
app.use(express.json());

// Import routes
const authRoutes = require("./routes/auth")(app);
const linksRoutes = require("./routes/links")(app);
const adminRoutes = require("./routes/admin")(app);

// Use routes
app.use("/api/auth", authRoutes);
app.use("/api/links", linksRoutes);
app.use("/api/admin", adminRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// Create default admin user if not exists
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
        "INSERT INTO users (email, password_hash, full_name, role, department, is_active) VALUES (?, ?, ?, ?, ?, ?)",
        [
          adminEmail,
          password_hash,
          "System Administrator",
          "admin",
          "management",
          1,
        ],
      );
      console.log("✅ Default admin user created");
      console.log(`   Email: ${adminEmail}`);
      console.log(`   Password: ${adminPassword}`);
      console.log("   ⚠️ CHANGE THIS PASSWORD AFTER FIRST LOGIN!");
    } else {
      console.log("✅ Admin user already exists");
    }
  } catch (err) {
    console.error("Error setting up admin:", err.message);
  }
}

// Start server
async function startServer() {
  await setupAdmin();
  app.listen(PORT, () => {
    console.log(`\n🚀 Server running on port ${PORT}`);
    console.log(`📍 API URL: http://localhost:${PORT}`);
    console.log(`🔐 Auth endpoint: http://localhost:${PORT}/api/auth/login`);
    console.log(
      `📊 Links endpoint: http://localhost:${PORT}/api/links (protected)`,
    );
    console.log(`\n💡 Test with: curl http://localhost:${PORT}/api/health\n`);
  });
}

startServer();

module.exports = app;
