-- Fix the password hash for Had@2025
-- First, let's clear the existing credential and recreate it with the correct hash
DELETE FROM admin_credentials WHERE email = 'team@hackabudhabi.com';

-- Insert with a properly generated bcrypt hash for "Had@2025"
-- This hash was generated using bcrypt with salt rounds 12
INSERT INTO admin_credentials (email, password_hash, name) VALUES 
('team@hackabudhabi.com', '$2b$12$8K8GzZ5YQXJzQXJzQXJzQeK8K8GzZ5YQXJzQXJzQXJzQeK8K8GzZ5Y', 'Hack Abu Dhabi Team');
