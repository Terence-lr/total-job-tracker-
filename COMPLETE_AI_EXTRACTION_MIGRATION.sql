-- Complete AI Extraction Migration for Job Tracker
-- Run this SQL in your Supabase SQL Editor to add all AI extraction fields

-- First, let's ensure we have the basic job structure
-- Add missing columns that might not exist yet
ALTER TABLE jobs 
ADD COLUMN IF NOT EXISTS position TEXT,
ADD COLUMN IF NOT EXISTS date_applied DATE DEFAULT CURRENT_DATE,
ADD COLUMN IF NOT EXISTS job_url TEXT,
ADD COLUMN IF NOT EXISTS salary TEXT,
ADD COLUMN IF NOT EXISTS job_description TEXT,
ADD COLUMN IF NOT EXISTS notes TEXT,
ADD COLUMN IF NOT EXISTS offers TEXT,
ADD COLUMN IF NOT EXISTS withdrawn BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Add AI extraction specific columns
ALTER TABLE jobs 
ADD COLUMN IF NOT EXISTS hourly_rate DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS pay_type VARCHAR(20) DEFAULT 'salary',
ADD COLUMN IF NOT EXISTS calculated_salary DECIMAL(12,2),
ADD COLUMN IF NOT EXISTS calculated_hourly_rate DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS location VARCHAR(255),
ADD COLUMN IF NOT EXISTS employment_type VARCHAR(50);

-- Add comments for documentation
COMMENT ON COLUMN jobs.position IS 'Job position/title';
COMMENT ON COLUMN jobs.date_applied IS 'Date when application was submitted';
COMMENT ON COLUMN jobs.job_url IS 'URL of the job posting';
COMMENT ON COLUMN jobs.salary IS 'Annual salary or salary range';
COMMENT ON COLUMN jobs.job_description IS 'Job description text';
COMMENT ON COLUMN jobs.notes IS 'User notes about the application';
COMMENT ON COLUMN jobs.offers IS 'Details about job offers received';
COMMENT ON COLUMN jobs.withdrawn IS 'Whether the application was withdrawn';
COMMENT ON COLUMN jobs.hourly_rate IS 'Hourly rate for hourly positions';
COMMENT ON COLUMN jobs.pay_type IS 'Type of pay: salary or hourly';
COMMENT ON COLUMN jobs.calculated_salary IS 'Calculated annual salary from hourly rate';
COMMENT ON COLUMN jobs.calculated_hourly_rate IS 'Calculated hourly rate from annual salary';
COMMENT ON COLUMN jobs.location IS 'Job location extracted by AI';
COMMENT ON COLUMN jobs.employment_type IS 'Employment type: Full-time, Part-time, Contract, etc.';

-- Create indexes for better performance on new fields
CREATE INDEX IF NOT EXISTS idx_jobs_position ON jobs(position);
CREATE INDEX IF NOT EXISTS idx_jobs_company ON jobs(company);
CREATE INDEX IF NOT EXISTS idx_jobs_date_applied ON jobs(date_applied);
CREATE INDEX IF NOT EXISTS idx_jobs_pay_type ON jobs(pay_type);
CREATE INDEX IF NOT EXISTS idx_jobs_location ON jobs(location);
CREATE INDEX IF NOT EXISTS idx_jobs_employment_type ON jobs(employment_type);
CREATE INDEX IF NOT EXISTS idx_jobs_hourly_rate ON jobs(hourly_rate);
CREATE INDEX IF NOT EXISTS idx_jobs_calculated_salary ON jobs(calculated_salary);

-- Update the updated_at column when any row is modified
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_jobs_updated_at ON jobs;
CREATE TRIGGER update_jobs_updated_at
    BEFORE UPDATE ON jobs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Verify the new columns were added
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'jobs' 
  AND column_name IN (
    'position', 'date_applied', 'job_url', 'salary', 'job_description', 
    'notes', 'offers', 'withdrawn', 'hourly_rate', 'pay_type', 
    'calculated_salary', 'calculated_hourly_rate', 'location', 'employment_type'
  )
ORDER BY column_name;

-- Show table structure
\d jobs;
