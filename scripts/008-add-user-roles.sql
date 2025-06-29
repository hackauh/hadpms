-- Add user role field to participants table
ALTER TABLE participants 
ADD COLUMN IF NOT EXISTS user_role VARCHAR(50) DEFAULT 'participant';

-- Create index for user role
CREATE INDEX IF NOT EXISTS idx_participants_user_role ON participants(user_role);

-- Update existing participants to have 'participant' role if null
UPDATE participants 
SET user_role = 'participant' 
WHERE user_role IS NULL;
