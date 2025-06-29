-- Drop the complex OTP tables and create simple auth
DROP TABLE IF EXISTS auth_sessions;
DROP TABLE IF EXISTS admin_users;

-- Create simple admin credentials table
CREATE TABLE IF NOT EXISTS admin_credentials (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create sessions table for login tracking
CREATE TABLE IF NOT EXISTS user_sessions (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert the hardcoded admin credentials
-- Password: Had@2025 (hashed with bcrypt)
INSERT INTO admin_credentials (email, password_hash, name) VALUES 
('team@hackabudhabi.com', '$2a$12$LQv3c1yqBwEHXyvHrCVHNONHdgeHcz0hhQPiS3CsVMmidrHWOVgvW', 'Hack Abu Dhabi Team')
ON CONFLICT (email) DO UPDATE SET 
password_hash = EXCLUDED.password_hash,
name = EXCLUDED.name;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON user_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires ON user_sessions(expires_at);
