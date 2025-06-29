-- Add new fields for manual features
ALTER TABLE participants 
ADD COLUMN IF NOT EXISTS qr_id VARCHAR(50) UNIQUE,
ADD COLUMN IF NOT EXISTS food_fulfilled BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS food_fulfilled_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS manually_added BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS loops_contact_id VARCHAR(255);

-- Create index for QR ID lookups
CREATE INDEX IF NOT EXISTS idx_participants_qr_id ON participants(qr_id);
CREATE INDEX IF NOT EXISTS idx_participants_food_fulfilled ON participants(food_fulfilled);

-- Function to generate random QR ID
CREATE OR REPLACE FUNCTION generate_qr_id() RETURNS VARCHAR(50) AS $$
DECLARE
    chars TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    result TEXT := 'HAD-';
    i INTEGER;
BEGIN
    FOR i IN 1..8 LOOP
        result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
    END LOOP;
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Update existing participants to have QR IDs
UPDATE participants 
SET qr_id = generate_qr_id() 
WHERE qr_id IS NULL;
