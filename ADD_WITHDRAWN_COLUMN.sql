-- ADD WITHDRAWN COLUMN TO JOBS TABLE
-- Run this in Supabase SQL Editor to add the withdrawn column

-- Step 1: Check current jobs table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'jobs'
ORDER BY ordinal_position;

-- Step 2: Add withdrawn column if it doesn't exist
ALTER TABLE jobs 
ADD COLUMN IF NOT EXISTS withdrawn BOOLEAN DEFAULT FALSE;

-- Step 3: Add a comment to describe the column
COMMENT ON COLUMN jobs.withdrawn IS 'Indicates if the job application was withdrawn by the user';

-- Step 4: Update existing records to set withdrawn = false for all current jobs
UPDATE jobs 
SET withdrawn = FALSE 
WHERE withdrawn IS NULL;

-- Step 5: Add constraint to ensure withdrawn is always a boolean
ALTER TABLE jobs 
ADD CONSTRAINT check_withdrawn_boolean 
CHECK (withdrawn IN (TRUE, FALSE));

-- Step 6: Create index for better performance when filtering by withdrawn status
CREATE INDEX IF NOT EXISTS idx_jobs_withdrawn ON jobs(withdrawn);

-- Step 7: Update the trigger to handle withdrawn status
-- First, drop the existing trigger if it exists
DROP TRIGGER IF EXISTS trigger_create_job_offer ON jobs;

-- Step 8: Recreate the trigger with withdrawn status handling
CREATE OR REPLACE FUNCTION create_job_offer_from_job()
RETURNS TRIGGER AS $$
BEGIN
  -- Only create offer if status changed to 'Offer' and it's a new offer
  -- AND the job is not withdrawn
  IF NEW.status = 'Offer' AND (OLD.status IS NULL OR OLD.status != 'Offer') 
     AND NEW.withdrawn = FALSE THEN
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
        NEW.offers,
        NULL,
        NULL,
        FALSE,
        'full-time',
        NULL,
        NEW.notes,
        'pending',
        NEW.user_id
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 9: Recreate the trigger
CREATE TRIGGER trigger_create_job_offer
  AFTER UPDATE ON jobs
  FOR EACH ROW
  EXECUTE FUNCTION create_job_offer_from_job();

-- Step 10: Verify the column was added
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'jobs' AND column_name = 'withdrawn';

-- Step 11: Test the column with a sample query
SELECT id, company, position, status, withdrawn, created_at
FROM jobs 
ORDER BY created_at DESC 
LIMIT 5;


