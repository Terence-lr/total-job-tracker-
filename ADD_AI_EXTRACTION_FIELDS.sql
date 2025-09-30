-- Add AI Extraction Fields to Jobs Table
-- Run this SQL in your Supabase SQL Editor

-- Add new columns for enhanced AI extraction
ALTER TABLE jobs 
ADD COLUMN IF NOT EXISTS hourly_rate DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS pay_type VARCHAR(20) DEFAULT 'salary',
ADD COLUMN IF NOT EXISTS calculated_salary DECIMAL(12,2),
ADD COLUMN IF NOT EXISTS calculated_hourly_rate DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS location VARCHAR(255),
ADD COLUMN IF NOT EXISTS employment_type VARCHAR(50);

-- Add comments for documentation
COMMENT ON COLUMN jobs.hourly_rate IS 'Hourly rate for hourly positions';
COMMENT ON COLUMN jobs.pay_type IS 'Type of pay: salary or hourly';
COMMENT ON COLUMN jobs.calculated_salary IS 'Calculated annual salary from hourly rate';
COMMENT ON COLUMN jobs.calculated_hourly_rate IS 'Calculated hourly rate from annual salary';
COMMENT ON COLUMN jobs.location IS 'Job location extracted by AI';
COMMENT ON COLUMN jobs.employment_type IS 'Employment type: Full-time, Part-time, Contract, etc.';

-- Create indexes for better performance on new fields
CREATE INDEX IF NOT EXISTS idx_jobs_pay_type ON jobs(pay_type);
CREATE INDEX IF NOT EXISTS idx_jobs_location ON jobs(location);
CREATE INDEX IF NOT EXISTS idx_jobs_employment_type ON jobs(employment_type);

-- Verify the new columns were added
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'jobs' 
  AND column_name IN ('hourly_rate', 'pay_type', 'calculated_salary', 'calculated_hourly_rate', 'location', 'employment_type')
ORDER BY column_name;
