-- CONVERT JOBS TABLE FROM INTEGER TO UUID (FIXED VERSION)
-- This handles missing columns in your current schema

-- Step 1: Check current schema
SELECT 
  table_name, 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_name IN ('jobs', 'job_offers')
ORDER BY table_name, ordinal_position;

-- Step 2: Drop existing triggers and functions
DROP TRIGGER IF EXISTS trigger_create_job_offer ON jobs;
DROP FUNCTION IF EXISTS create_job_offer_from_job();

-- Step 3: Drop job_offers table if it exists
DROP TABLE IF EXISTS job_offers CASCADE;

-- Step 4: Create backup of jobs table
CREATE TABLE jobs_backup AS SELECT * FROM jobs;

-- Step 5: Drop and recreate jobs table with UUID
DROP TABLE jobs CASCADE;

CREATE TABLE jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  company TEXT NOT NULL,
  position TEXT NOT NULL,
  date_applied DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'Applied',
  salary TEXT,
  notes TEXT,
  job_url TEXT,
  job_description TEXT,
  offers TEXT,
  withdrawn BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 6: Restore data (only columns that exist in backup)
INSERT INTO jobs (user_id, company, position, date_applied, status, salary, notes, job_url, job_description, offers, withdrawn, created_at)
SELECT 
  user_id, 
  company, 
  position, 
  date_applied, 
  status, 
  salary, 
  notes, 
  job_url, 
  job_description, 
  offers, 
  withdrawn, 
  created_at
FROM jobs_backup;

-- Step 7: Drop backup table
DROP TABLE jobs_backup;

-- Step 8: Recreate RLS policies for jobs
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own jobs" ON jobs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own jobs" ON jobs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own jobs" ON jobs
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own jobs" ON jobs
  FOR DELETE USING (auth.uid() = user_id);

-- Step 9: Create job_offers table with UUID reference
CREATE TABLE job_offers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  original_job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
  company VARCHAR(255) NOT NULL,
  position VARCHAR(255) NOT NULL,
  offer_date DATE NOT NULL,
  salary_amount DECIMAL(12,2),
  salary_currency VARCHAR(3) DEFAULT 'USD',
  salary_type VARCHAR(20) DEFAULT 'annual',
  benefits TEXT,
  start_date DATE,
  location VARCHAR(255),
  remote_option BOOLEAN DEFAULT FALSE,
  job_type VARCHAR(50),
  offer_deadline DATE,
  notes TEXT,
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Step 10: Add indexes
CREATE INDEX IF NOT EXISTS idx_job_offers_user_id ON job_offers(user_id);
CREATE INDEX IF NOT EXISTS idx_job_offers_original_job_id ON job_offers(original_job_id);
CREATE INDEX IF NOT EXISTS idx_job_offers_status ON job_offers(status);
CREATE INDEX IF NOT EXISTS idx_job_offers_offer_date ON job_offers(offer_date);

-- Step 11: Enable RLS for job_offers
ALTER TABLE job_offers ENABLE ROW LEVEL SECURITY;

-- Step 12: Create RLS policies for job_offers
CREATE POLICY "Users can view their own job offers" ON job_offers
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own job offers" ON job_offers
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own job offers" ON job_offers
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own job offers" ON job_offers
  FOR DELETE USING (auth.uid() = user_id);

-- Step 13: Create trigger function
CREATE OR REPLACE FUNCTION create_job_offer_from_job()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'Offer' AND (OLD.status IS NULL OR OLD.status != 'Offer') THEN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'jobs' AND column_name = 'withdrawn'
    ) OR NEW.withdrawn = FALSE OR NEW.withdrawn IS NULL THEN
      
      IF NOT EXISTS (SELECT 1 FROM job_offers WHERE original_job_id = NEW.id) THEN
        INSERT INTO job_offers (
          original_job_id,
          company,
          position,
          offer_date,
          salary_amount,
          salary_currency,
          salary_type,
          benefits,
          start_date,
          location,
          remote_option,
          job_type,
          offer_deadline,
          notes,
          status,
          user_id
        ) VALUES (
          NEW.id,
          NEW.company,
          NEW.position,
          COALESCE(NEW.date_applied::DATE, CURRENT_DATE),
          CASE 
            WHEN NEW.salary ~ '^\$?[0-9,]+(\.[0-9]+)?$' THEN 
              CAST(REGEXP_REPLACE(NEW.salary, '[^0-9.]', '', 'g') AS DECIMAL)
            ELSE NULL
          END,
          'USD',
          'annual',
          COALESCE(NEW.offers, ''),
          NULL,
          NULL,
          FALSE,
          'full-time',
          NULL,
          COALESCE(NEW.notes, ''),
          'pending',
          NEW.user_id
        );
      END IF;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 14: Create trigger
CREATE TRIGGER trigger_create_job_offer
  AFTER UPDATE ON jobs
  FOR EACH ROW
  EXECUTE FUNCTION create_job_offer_from_job();

-- Step 15: Verify the fix
SELECT 
  'jobs' as table_name,
  column_name, 
  data_type
FROM information_schema.columns 
WHERE table_name = 'jobs' AND column_name = 'id'
UNION ALL
SELECT 
  'job_offers' as table_name,
  column_name, 
  data_type
FROM information_schema.columns 
WHERE table_name = 'job_offers' AND column_name = 'original_job_id';

-- Step 16: Check if we have any jobs data
SELECT COUNT(*) as total_jobs FROM jobs;



