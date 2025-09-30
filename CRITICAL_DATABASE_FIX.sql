-- CRITICAL DATABASE FIX - Run this EXACT sequence in Supabase SQL Editor
-- This will fix the date_applied column error and ensure complete alignment

-- Step 1: Check current column names
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'jobs';

-- Step 2: Add date_applied if it doesn't exist
ALTER TABLE jobs 
ADD COLUMN IF NOT EXISTS date_applied TIMESTAMP DEFAULT NOW();

-- Step 3: If you have any other date column, copy its data
UPDATE jobs 
SET date_applied = created_at 
WHERE date_applied IS NULL AND created_at IS NOT NULL;

-- Step 4: Ensure ALL required columns exist
ALTER TABLE jobs
ADD COLUMN IF NOT EXISTS id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS company TEXT NOT NULL,
ADD COLUMN IF NOT EXISTS position TEXT NOT NULL,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Applied',
ADD COLUMN IF NOT EXISTS salary TEXT,
ADD COLUMN IF NOT EXISTS job_url TEXT,
ADD COLUMN IF NOT EXISTS notes TEXT,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();

-- Step 5: Create user_profiles table for skills
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  skills TEXT[] DEFAULT '{}',
  resume_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Step 6: Enable RLS
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Step 7: Create policies for jobs
CREATE POLICY "Users can view own jobs" ON jobs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own jobs" ON jobs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own jobs" ON jobs
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own jobs" ON jobs
  FOR DELETE USING (auth.uid() = user_id);

-- Step 8: Create policies for profiles
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Step 9: Grant permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;



