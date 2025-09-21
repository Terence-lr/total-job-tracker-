-- Database Migration Script to Fix Job Tracker Schema Issues
-- This script will migrate from the old schema to the new schema
-- Run this in your Supabase SQL Editor

-- Step 1: Add missing columns to jobs table
ALTER TABLE jobs 
ADD COLUMN IF NOT EXISTS position TEXT,
ADD COLUMN IF NOT EXISTS date_applied DATE,
ADD COLUMN IF NOT EXISTS salary TEXT,
ADD COLUMN IF NOT EXISTS job_url TEXT,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Step 2: Migrate data from old columns to new columns
-- Copy title to position if position is null
UPDATE jobs SET position = title WHERE position IS NULL AND title IS NOT NULL;

-- Copy created_at to date_applied if date_applied is null
UPDATE jobs SET date_applied = created_at::DATE WHERE date_applied IS NULL;

-- Step 3: Make position NOT NULL after copying data
ALTER TABLE jobs ALTER COLUMN position SET NOT NULL;

-- Step 4: Make date_applied NOT NULL after copying data
ALTER TABLE jobs ALTER COLUMN date_applied SET NOT NULL;

-- Step 5: Create indexes for new columns
CREATE INDEX IF NOT EXISTS idx_jobs_position ON jobs(position);
CREATE INDEX IF NOT EXISTS idx_jobs_date_applied ON jobs(date_applied);
CREATE INDEX IF NOT EXISTS idx_jobs_salary ON jobs(salary);
CREATE INDEX IF NOT EXISTS idx_jobs_job_url ON jobs(job_url);

-- Step 6: Update RLS policies to ensure they're correct
DROP POLICY IF EXISTS "Users can view own jobs" ON jobs;
DROP POLICY IF EXISTS "Users can insert own jobs" ON jobs;
DROP POLICY IF EXISTS "Users can update own jobs" ON jobs;
DROP POLICY IF EXISTS "Users can delete own jobs" ON jobs;

-- Recreate RLS policies
CREATE POLICY "Users can view own jobs" ON jobs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own jobs" ON jobs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own jobs" ON jobs
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own jobs" ON jobs
  FOR DELETE USING (auth.uid() = user_id);

-- Step 7: Add updated_at trigger
CREATE OR REPLACE FUNCTION update_jobs_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_jobs_updated_at ON jobs;
CREATE TRIGGER update_jobs_updated_at BEFORE UPDATE ON jobs
    FOR EACH ROW EXECUTE FUNCTION update_jobs_updated_at_column();

-- Step 8: Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Step 9: Verify the schema
-- You can run this query to verify the schema is correct:
-- SELECT column_name, data_type, is_nullable 
-- FROM information_schema.columns 
-- WHERE table_name = 'jobs' 
-- ORDER BY ordinal_position;
