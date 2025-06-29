-- Add additional fields specific to Hack Abu Dhabi
ALTER TABLE participants 
ADD COLUMN IF NOT EXISTS pronouns VARCHAR(50),
ADD COLUMN IF NOT EXISTS nickname VARCHAR(255),
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS city VARCHAR(255),
ADD COLUMN IF NOT EXISTS state_province VARCHAR(255),
ADD COLUMN IF NOT EXISTS zip_postal VARCHAR(20),
ADD COLUMN IF NOT EXISTS country VARCHAR(255),
ADD COLUMN IF NOT EXISTS whatsapp_number VARCHAR(50),
ADD COLUMN IF NOT EXISTS date_of_birth DATE,
ADD COLUMN IF NOT EXISTS nationality VARCHAR(255),
ADD COLUMN IF NOT EXISTS parent_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS parent_email VARCHAR(255),
ADD COLUMN IF NOT EXISTS emergency_phone VARCHAR(50),
ADD COLUMN IF NOT EXISTS medical_allergies TEXT,
ADD COLUMN IF NOT EXISTS how_heard VARCHAR(500),
ADD COLUMN IF NOT EXISTS age_certification BOOLEAN DEFAULT FALSE;

-- Create indexes for commonly searched fields
CREATE INDEX IF NOT EXISTS idx_participants_nationality ON participants(nationality);
CREATE INDEX IF NOT EXISTS idx_participants_city ON participants(city);
CREATE INDEX IF NOT EXISTS idx_participants_country ON participants(country);
