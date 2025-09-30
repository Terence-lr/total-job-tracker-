-- FIX JOB OFFERS SCHEMA MISMATCH
-- This fixes the critical issue where job_offers table references INTEGER but jobs.id is UUID

-- Step 1: Check current schema
SELECT 
  table_name, 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_name IN ('jobs', 'job_offers')
ORDER BY table_name, ordinal_position;

-- Step 2: Drop the existing trigger and function to avoid conflicts
DROP TRIGGER IF EXISTS trigger_create_job_offer ON jobs;
DROP FUNCTION IF EXISTS create_job_offer_from_job();

-- Step 3: Fix the job_offers table schema
-- First, drop the foreign key constraint
ALTER TABLE job_offers DROP CONSTRAINT IF EXISTS job_offers_original_job_id_fkey;

-- Change the column type from INTEGER to UUID
ALTER TABLE job_offers ALTER COLUMN original_job_id TYPE UUID USING original_job_id::text::uuid;

-- Recreate the foreign key constraint with correct types
ALTER TABLE job_offers 
ADD CONSTRAINT job_offers_original_job_id_fkey 
FOREIGN KEY (original_job_id) REFERENCES jobs(id) ON DELETE CASCADE;

-- Step 4: Recreate the function with proper UUID handling
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

-- Step 5: Recreate the trigger
CREATE TRIGGER trigger_create_job_offer
  AFTER UPDATE ON jobs
  FOR EACH ROW
  EXECUTE FUNCTION create_job_offer_from_job();

-- Step 6: Verify the fix
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

-- Step 7: Test the trigger with a sample update (optional)
-- UPDATE jobs SET status = 'Offer' WHERE id = (SELECT id FROM jobs LIMIT 1);
-- SELECT * FROM job_offers WHERE original_job_id = (SELECT id FROM jobs LIMIT 1);



