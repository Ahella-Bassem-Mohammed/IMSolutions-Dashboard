-- SQLite version - Run this once to create your database

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    full_name TEXT,
    role TEXT DEFAULT 'viewer',
    department TEXT,
    is_active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Department access rules table
CREATE TABLE IF NOT EXISTS department_access (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    department TEXT NOT NULL,
    allowed_category TEXT NOT NULL,
    UNIQUE(department, allowed_category)
);

-- Audit log table
CREATE TABLE IF NOT EXISTS audit_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    action TEXT,
    ip_address TEXT,
    user_agent TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Insert default department access rules
INSERT OR IGNORE INTO department_access (department, allowed_category) VALUES
    ('management', 'SEO'),
    ('management', 'Sales'),
    ('management', 'HR'),
    ('management', 'IT'),
    ('sales', 'Sales'),
    ('sales', 'SEO'),
    ('hr', 'HR'),
    ('it', 'IT'),
    ('marketing', 'SEO');

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_audit_log_user_id ON audit_log(user_id);