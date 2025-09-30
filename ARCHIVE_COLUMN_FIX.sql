-- ARCHIVE COLUMN FIX - Run this in Supabase SQL Editor
-- This ensures the archived column exists and is properly configured

-- Step 1: Check if archived column exists
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'jobs' AND column_name = 'archived';

-- Step 2: Add archived column if it doesn't exist
ALTER TABLE jobs 
ADD COLUMN IF NOT EXISTS archived BOOLEAN DEFAULT FALSE;

-- Step 3: Update any existing NULL values to FALSE
UPDATE jobs 
SET archived = FALSE 
WHERE archived IS NULL;

-- Step 4: Set NOT NULL constraint (optional, but recommended)
ALTER TABLE jobs 
ALTER COLUMN archived SET NOT NULL;

-- Step 5: Set default value for future inserts
ALTER TABLE jobs 
ALTER COLUMN archived SET DEFAULT FALSE;

-- Step 6: Verify the column exists and is properly configured
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'jobs' AND column_name = 'archived';

-- Step 7: Test the column with a sample query
SELECT id, company, position, archived, created_at
FROM jobs 
ORDER BY created_at DESC 
LIMIT 5;



