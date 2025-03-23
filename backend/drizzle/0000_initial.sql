-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username TEXT NOT NULL
);

-- Create risks table
CREATE TABLE IF NOT EXISTS risks (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    score INTEGER NOT NULL,
    category TEXT NOT NULL,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE
);

-- Create comments table
CREATE TABLE IF NOT EXISTS comments (
    id SERIAL PRIMARY KEY,
    risk_id INTEGER NOT NULL REFERENCES risks(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    comment TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Create risk_assignments table
CREATE TABLE IF NOT EXISTS risk_assignments (
    risk_id INTEGER NOT NULL REFERENCES risks(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    PRIMARY KEY (risk_id, user_id)
); 