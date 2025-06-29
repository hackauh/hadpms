-- Clean up all existing sessions and start fresh
DELETE FROM user_sessions;

-- Verify the table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'user_sessions';

-- Test inserting a session manually to verify the table works
INSERT INTO user_sessions (email, session_token, expires_at) 
VALUES ('test@example.com', 'test-token-123', NOW() + INTERVAL '1 hour');

-- Verify the insert worked
SELECT * FROM user_sessions WHERE email = 'test@example.com';

-- Clean up the test session
DELETE FROM user_sessions WHERE email = 'test@example.com';
