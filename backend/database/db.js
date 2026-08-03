const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const fs = require("fs");

const defaultDbPath = path.join(__dirname, "imsolutions.local.db");
const dbPath = process.env.DB_PATH
  ? path.resolve(process.env.DB_PATH)
  : defaultDbPath;

function ensureDatabaseDirectory() {
  fs.mkdirSync(path.dirname(dbPath), { recursive: true });
}

function initDatabase() {
  ensureDatabaseDirectory();
  const db = new sqlite3.Database(dbPath);

  const initSql = fs.readFileSync(
    path.join(__dirname, "init.sqlite.sql"),
    "utf8",
  );
  const statements = initSql
    .split(";")
    .map((s) => s.trim())
    .filter(Boolean);

  db.serialize(() => {
    db.run("PRAGMA foreign_keys = ON");

    statements.forEach((stmt) => {
      db.run(stmt, (err) => {
        if (err && !err.message.includes("already exists")) {
          console.warn("DB init warning:", err.message);
        }
      });
    });

    // Migrate: add columns if they don't exist yet
    const migrations = [
      "ALTER TABLE users ADD COLUMN must_change_password INTEGER DEFAULT 1",
      "ALTER TABLE users ADD COLUMN is_verified INTEGER DEFAULT 0",
      "ALTER TABLE users ADD COLUMN verification_token TEXT",
      "ALTER TABLE users ADD COLUMN token_expires_at DATETIME",
      "ALTER TABLE users ADD COLUMN reset_token TEXT",
      "ALTER TABLE users ADD COLUMN reset_expires DATETIME",
      "ALTER TABLE audit_log ADD COLUMN detail TEXT",
    ];
    migrations.forEach((sql) => {
      db.run(sql, (err) => {
        if (err && !err.message.includes("duplicate column")) {
          // Column already exists — fine, ignore
        }
      });
    });
  });

  return db;
}

function runQuery(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
}

function getQuery(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

function allQuery(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

module.exports = { initDatabase, runQuery, getQuery, allQuery };
