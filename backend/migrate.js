// One-time / repeatable migration script.
// 1. Ensures schema is up to date (runs init.sqlite.sql)
// 2. Optionally seeds dashboards from ./data/links.js if it exists
//
// Run with: node migrate.js

const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const fs = require("fs");

const dbPath = path.join(__dirname, "database", "imsolutions.db");
const db = new sqlite3.Database(dbPath);

const initSqlPath = path.join(__dirname, "database", "init.sqlite.sql");
const initSql = fs.readFileSync(initSqlPath, "utf8");
const statements = initSql
  .split(";")
  .map((s) => s.trim())
  .filter(Boolean);

let links = [];
const linksPath = path.join(__dirname, "data", "links.js");
if (fs.existsSync(linksPath)) {
  links = require(linksPath).dashboardLinks || [];
}

db.serialize(() => {
  db.run("PRAGMA foreign_keys = ON");

  statements.forEach((stmt) => {
    db.run(stmt, (err) => {
      if (err) console.warn("Schema warning:", err.message);
    });
  });

  if (links.length > 0) {
    db.run("DELETE FROM dashboards", (err) => {
      if (err) console.warn("Could not clear dashboards:", err.message);
    });

    const stmt = db.prepare(
      `INSERT INTO dashboards (title, description, url, category, icon, backgroundColor, tags)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
    );
    links.forEach((l) => {
      stmt.run(
        l.title,
        l.description,
        l.url,
        l.category,
        l.icon,
        l.backgroundColor,
        JSON.stringify(l.tags || []),
      );
    });
    stmt.finalize();
    console.log(`✅ Seeded ${links.length} dashboards from data/links.js`);
  } else {
    console.log("ℹ️  No data/links.js found — skipping dashboard seed");
  }

  console.log("✅ Migration completed");
});

db.close();
