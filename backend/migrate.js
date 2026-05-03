const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("./database/imsolutions.db");
const links = require("./data/links").dashboardLinks;

db.serialize(() => {
  // Create tables if not exist
  db.run(`CREATE TABLE IF NOT EXISTS dashboards (
    id INTEGER PRIMARY KEY,
    title TEXT,
    description TEXT,
    url TEXT,
    category TEXT,
    icon TEXT,
    backgroundColor TEXT,
    tags TEXT
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS user_dashboard_access (
    user_id INTEGER,
    dashboard_id INTEGER,
    PRIMARY KEY (user_id, dashboard_id)
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS role_category_access (
    role TEXT,
    category TEXT,
    PRIMARY KEY (role, category)
  )`);

  // Clear and repopulate dashboards from your static data
  db.run("DELETE FROM dashboards");
  const stmt = db.prepare(
    `INSERT INTO dashboards (id, title, description, url, category, icon, backgroundColor, tags) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
  );
  links.forEach((l) => {
    stmt.run(
      l.id,
      l.title,
      l.description,
      l.url,
      l.category,
      l.icon,
      l.backgroundColor,
      JSON.stringify(l.tags),
    );
  });
  stmt.finalize();

  // Insert default role-category access
  db.run(`INSERT OR IGNORE INTO role_category_access (role, category) VALUES 
    ('hr', 'Employee KPI'),
    ('seo_leader', 'SEO'),
    ('account_manager', 'Client Requests')
  `);

  // Ensure management department can see all categories (for top_management role)
  db.run(`INSERT OR IGNORE INTO department_access (department, allowed_category) VALUES 
    ('management','SEO'),
    ('management','Client Requests'),
    ('management','Forms'),
    ('management','Employee KPI')
  `);

  console.log("✅ Migration completed");
  db.close();
});
