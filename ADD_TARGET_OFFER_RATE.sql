-- ADD TARGET OFFER RATE TO PROFILES TABLE
-- Run this in Supabase SQL Editor to add the target offer rate field

-- Step 1: Check current profiles table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'profiles'
ORDER BY ordinal_position;

-- Step 2: Add target_offer_rate column if it doesn't exist
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS target_offer_rate INTEGER DEFAULT 20;

-- Step 3: Add a comment to describe the column
COMMENT ON COLUMN profiles.target_offer_rate IS 'User target job offer rate percentage (e.g., 20 for 20%)';

-- Step 4: Add constraint to ensure target rate is between 0 and 100
ALTER TABLE profiles 
ADD CONSTRAINT check_target_offer_rate 
CHECK (target_offer_rate >= 0 AND target_offer_rate <= 100);

-- Step 5: Update existing profiles to have a default target rate if they don't have one
UPDATE profiles 
SET target_offer_rate = 20 
WHERE target_offer_rate IS NULL;

-- Step 6: Verify the column was added
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' AND column_name = 'target_offer_rate';

-- Step 7: Test the column with a sample query
SELECT id, email, target_offer_rate, created_at
FROM profiles 
ORDER BY created_at DESC 
LIMIT 5;


