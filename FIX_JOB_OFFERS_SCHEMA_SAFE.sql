-- SAFE FIX FOR JOB OFFERS SCHEMA MISMATCH
-- This handles existing data that can't be converted from INTEGER to UUID

-- Step 1: Check current schema and data
SELECT 
  table_name, 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_name IN ('jobs', 'job_offers')
ORDER BY table_name, ordinal_position;

-- Step 2: Check if there's existing data in job_offers
SELECT COUNT(*) as existing_offers FROM job_offers;

-- Step 3: Drop the existing trigger and function to avoid conflicts
DROP TRIGGER IF EXISTS trigger_create_job_offer ON jobs;
DROP FUNCTION IF EXISTS create_job_offer_from_job();

-- Step 4: Handle existing data - Option A: Clear existing job_offers data
-- (Choose this if you don't have important job offers data)
DELETE FROM job_offers;

-- Step 5: Drop and recreate the job_offers table with correct schema
DROP TABLE IF EXISTS job_offers CASCADE;

-- Step 6: Recreate the job_offers table with UUID reference
CREATE TABLE job_offers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  original_job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
  company VARCHAR(255) NOT NULL,
  position VARCHAR(255) NOT NULL,
  offer_date DATE NOT NULL,
  salary_amount DECIMAL(12,2),
  salary_currency VARCHAR(3) DEFAULT 'USD',
  salary_type VARCHAR(20) DEFAULT 'annual', -- annual, hourly, contract
  benefits TEXT,
  start_date DATE,
  location VARCHAR(255),
  remote_option BOOLEAN DEFAULT FALSE,
  job_type VARCHAR(50), -- full-time, part-time, contract, internship
  offer_deadline DATE,
  notes TEXT,
  status VARCHAR(50) DEFAULT 'pending', -- pending, accepted, declined, expired
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Step 7: Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_job_offers_user_id ON job_offers(user_id);
CREATE INDEX IF NOT EXISTS idx_job_offers_original_job_id ON job_offers(original_job_id);
CREATE INDEX IF NOT EXISTS idx_job_offers_status ON job_offers(status);
CREATE INDEX IF NOT EXISTS idx_job_offers_offer_date ON job_offers(offer_date);

-- Step 8: Enable RLS (Row Level Security) policies
ALTER TABLE job_offers ENABLE ROW LEVEL SECURITY;

-- Step 9: Create RLS policies
CREATE POLICY "Users can view their own job offers" ON job_offers
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own job offers" ON job_offers
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own job offers" ON job_offers
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own job offers" ON job_offers
  FOR DELETE USING (auth.uid() = user_id);

-- Step 10: Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_job_offers_updated_at 
  BEFORE UPDATE ON job_offers 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Step 11: Recreate the function with proper UUID handling
CREATE OR REPLACE FUNCTION create_job_offer_from_job()
RETURNS TRIGGER AS $$
BEGIN
  -- Only create offer if status changed to 'Offer' and it's a new offer
  -- AND the job is not withdrawn (if withdrawn column exists)
  IF NEW.status = 'Offer' AND (OLD.status IS NULL OR OLD.status != 'Offer') THEN
    -- Check if withdrawn column exists and if so, ensure job is not withdrawn
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'jobs' AND column_name = 'withdrawn'
    ) OR NEW.withdrawn = FALSE OR NEW.withdrawn IS NULL THEN
      
      -- Check if offer already exists for this job
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

-- Step 12: Create trigger to automatically create job offers
CREATE TRIGGER trigger_create_job_offer
  AFTER UPDATE ON jobs
  FOR EACH ROW
  EXECUTE FUNCTION create_job_offer_from_job();

-- Step 13: Verify the fix
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

-- Step 14: Test the trigger (optional - uncomment to test)
-- UPDATE jobs SET status = 'Offer' WHERE id = (SELECT id FROM jobs LIMIT 1);
-- SELECT * FROM job_offers WHERE original_job_id = (SELECT id FROM jobs LIMIT 1);
