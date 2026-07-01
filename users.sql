-- users.sql
-- SQLite schema for storing signup users

CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Example insert
-- INSERT INTO users (username, email, password) VALUES ('alice', 'alice@example.com', 'password123');
