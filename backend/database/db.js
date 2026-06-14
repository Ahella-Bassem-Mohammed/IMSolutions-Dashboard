const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const fs = require("fs");

const dbPath = path.join(__dirname, "imsolutions.db");

function initDatabase() {
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

    // Migrate: add must_change_password if it doesn't exist yet
    db.run(
      "ALTER TABLE users ADD COLUMN must_change_password INTEGER DEFAULT 1",
      (err) => {
        if (err && !err.message.includes("duplicate column")) {
          // Column already exists — fine, ignore
        }
      },
    );
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
