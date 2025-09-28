-- RENAME OFFER COLUMN TO OFFERS
-- Run this in Supabase SQL Editor to rename the column to match frontend

-- Step 1: Check current column name
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'jobs' AND column_name IN ('offer', 'offers');

-- Step 2: Rename the column from 'offer' to 'offers'
ALTER TABLE jobs 
RENAME COLUMN offer TO offers;

-- Step 3: Add a comment to describe the column
COMMENT ON COLUMN jobs.offers IS 'Details about job offers received for this application';

-- Step 4: Verify the column was renamed
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'jobs' AND column_name = 'offers';

-- Step 5: Test the column with a sample query
SELECT id, company, position, status, offers, created_at
FROM jobs 
ORDER BY created_at DESC 
LIMIT 5;


