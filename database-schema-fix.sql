-- Fixed Database Schema for Job Tracker
-- This fixes the column mismatches and missing columns

-- First, let's update the existing jobs table to match the TypeScript interface
ALTER TABLE jobs 
ADD COLUMN IF NOT EXISTS position TEXT,
ADD COLUMN IF NOT EXISTS date_applied DATE,
ADD COLUMN IF NOT EXISTS salary TEXT,
ADD COLUMN IF NOT EXISTS job_url TEXT,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Update existing records to copy title to position if position is null
UPDATE jobs SET position = title WHERE position IS NULL;

-- Make position NOT NULL after copying data
ALTER TABLE jobs ALTER COLUMN position SET NOT NULL;

-- Rename created_at to match TypeScript interface
ALTER TABLE jobs RENAME COLUMN created_at TO created_at;

-- Create indexes for new columns
CREATE INDEX IF NOT EXISTS idx_jobs_position ON jobs(position);
CREATE INDEX IF NOT EXISTS idx_jobs_date_applied ON jobs(date_applied);
CREATE INDEX IF NOT EXISTS idx_jobs_salary ON jobs(salary);

-- Update RLS policies to use correct column names
DROP POLICY IF EXISTS "Users can view own jobs" ON jobs;
DROP POLICY IF EXISTS "Users can insert own jobs" ON jobs;
DROP POLICY IF EXISTS "Users can update own jobs" ON jobs;
DROP POLICY IF EXISTS "Users can delete own jobs" ON jobs;

-- Recreate RLS policies with correct column names
CREATE POLICY "Users can view own jobs" ON jobs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own jobs" ON jobs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own jobs" ON jobs
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own jobs" ON jobs
  FOR DELETE USING (auth.uid() = user_id);

-- Fix the view to use correct column names
DROP VIEW IF EXISTS user_application_summary;
CREATE VIEW user_application_summary AS
SELECT 
    j.user_id,
    COUNT(*) as total_applications,
    COUNT(CASE WHEN j.status = 'Applied' THEN 1 END) as applied_count,
    COUNT(CASE WHEN j.status = 'Interview' THEN 1 END) as interview_count,
    COUNT(CASE WHEN j.status = 'Offer' THEN 1 END) as offer_count,
    COUNT(CASE WHEN j.status = 'Rejected' THEN 1 END) as rejected_count,
    AVG(CASE WHEN j.status IN ('Interview', 'Offer') THEN 1.0 ELSE 0.0 END) * 100 as response_rate,
    AVG(CASE WHEN j.status = 'Offer' THEN 1.0 ELSE 0.0 END) * 100 as offer_rate
FROM jobs j
GROUP BY j.user_id;

-- Fix RLS policies in database-enhancements.sql that reference wrong column names
-- Update application_events policies
DROP POLICY IF EXISTS "Users can view their own application events" ON application_events;
DROP POLICY IF EXISTS "Users can insert their own application events" ON application_events;

CREATE POLICY "Users can view their own application events" ON application_events
  FOR SELECT USING (
    application_id IN (
      SELECT id FROM jobs WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own application events" ON application_events
  FOR INSERT WITH CHECK (
    application_id IN (
      SELECT id FROM jobs WHERE user_id = auth.uid()
    )
  );

-- Grant permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

