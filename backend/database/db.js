const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const fs = require("fs");

const dbPath = path.join(__dirname, "imsolutions.db");

// Initialize database
function initDatabase() {
  const db = new sqlite3.Database(dbPath);

  // Read and execute init.sqlite.sql
  const initSql = fs.readFileSync(
    path.join(__dirname, "init.sqlite.sql"),
    "utf8",
  );
  const statements = initSql.split(";");

  db.serialize(() => {
    statements.forEach((statement) => {
      if (statement.trim()) {
        db.run(statement);
      }
    });
  });

  return db;
}

// Promise wrapper for sqlite3
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
