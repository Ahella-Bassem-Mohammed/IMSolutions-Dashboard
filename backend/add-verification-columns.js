const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("./database/imsolutions.db");

db.serialize(() => {
  db.run("ALTER TABLE users ADD COLUMN is_verified BOOLEAN DEFAULT 0");
  db.run("ALTER TABLE users ADD COLUMN verification_token TEXT");
  db.run("ALTER TABLE users ADD COLUMN reset_token TEXT");
  db.run("ALTER TABLE users ADD COLUMN reset_expires DATETIME");
  console.log("✅ Verification columns added");
  db.close();
});
