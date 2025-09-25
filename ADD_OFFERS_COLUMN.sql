-- ADD OFFERS COLUMN TO JOBS TABLE
-- Run this in Supabase SQL Editor to add the offers column

-- Step 1: Check current table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'jobs'
ORDER BY ordinal_position;

-- Step 2: Add offers column if it doesn't exist
ALTER TABLE jobs 
ADD COLUMN IF NOT EXISTS offers TEXT;

-- Step 3: Add a comment to describe the column
COMMENT ON COLUMN jobs.offers IS 'Details about job offers received for this application';

-- Step 4: Verify the column was added
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'jobs' AND column_name = 'offers';

-- Step 5: Test the column with a sample query
SELECT id, company, position, status, offers, created_at
FROM jobs 
ORDER BY created_at DESC 
LIMIT 5;
