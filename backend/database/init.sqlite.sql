-- IMSolutions Dashboard — SQLite schema
-- Run once to create / upgrade the database
-- Dashboard visibility model: explicit per-user assignment only.
-- admin / top_management roles see everything - everyone else sees
-- only dashboards assigned to them via user_dashboard_access.

CREATE TABLE IF NOT EXISTS users (
    id                   INTEGER PRIMARY KEY AUTOINCREMENT,
    email                TEXT UNIQUE NOT NULL,
    password_hash        TEXT NOT NULL,
    full_name            TEXT,
    role                 TEXT DEFAULT 'viewer',
    department           TEXT,
    is_active            INTEGER DEFAULT 1,
    must_change_password INTEGER DEFAULT 1,
    created_at           DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at           DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS dashboards (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    title           TEXT NOT NULL,
    description     TEXT,
    url             TEXT NOT NULL,
    category        TEXT NOT NULL,
    icon            TEXT DEFAULT '🔗',
    backgroundColor TEXT DEFAULT '#4CAF50',
    tags            TEXT DEFAULT '[]'
);

CREATE TABLE IF NOT EXISTS user_dashboard_access (
    user_id      INTEGER NOT NULL,
    dashboard_id INTEGER NOT NULL,
    PRIMARY KEY (user_id, dashboard_id),
    FOREIGN KEY (user_id)      REFERENCES users(id)      ON DELETE CASCADE,
    FOREIGN KEY (dashboard_id) REFERENCES dashboards(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS audit_log (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id    INTEGER,
    action     TEXT,
    detail     TEXT,
    ip_address TEXT,
    user_agent TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_users_email   ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role    ON users(role);
CREATE INDEX IF NOT EXISTS idx_audit_user_id ON audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_uda_user_id   ON user_dashboard_access(user_id);