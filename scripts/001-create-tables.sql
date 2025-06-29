-- Create participants table
CREATE TABLE IF NOT EXISTS participants (
    id SERIAL PRIMARY KEY,
    fillout_submission_id VARCHAR(255) UNIQUE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50),
    university VARCHAR(255),
    major VARCHAR(255),
    year_of_study VARCHAR(50),
    team_name VARCHAR(255),
    dietary_restrictions TEXT,
    t_shirt_size VARCHAR(10),
    github_username VARCHAR(255),
    linkedin_url VARCHAR(500),
    portfolio_url VARCHAR(500),
    experience_level VARCHAR(50),
    skills TEXT[],
    checked_in BOOLEAN DEFAULT FALSE,
    checked_in_at TIMESTAMP,
    checked_out BOOLEAN DEFAULT FALSE,
    checked_out_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster searches
CREATE INDEX IF NOT EXISTS idx_participants_email ON participants(email);
CREATE INDEX IF NOT EXISTS idx_participants_name ON participants(name);
CREATE INDEX IF NOT EXISTS idx_participants_checked_in ON participants(checked_in);
