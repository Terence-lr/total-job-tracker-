-- COMPREHENSIVE DATABASE FIX FOR NEW JOBS
-- This ensures all required columns exist and are properly configured

-- Step 1: Check current schema
SELECT 
  table_name, 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'jobs'
ORDER BY ordinal_position;

-- Step 2: Add any missing columns to jobs table
ALTER TABLE jobs 
ADD COLUMN IF NOT EXISTS job_description TEXT,
ADD COLUMN IF NOT EXISTS offers TEXT,
ADD COLUMN IF NOT EXISTS withdrawn BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Step 3: Update existing records to have proper defaults
UPDATE jobs 
SET 
  job_description = COALESCE(job_description, ''),
  offers = COALESCE(offers, ''),
  withdrawn = COALESCE(withdrawn, FALSE),
  updated_at = COALESCE(updated_at, created_at)
WHERE 
  job_description IS NULL 
  OR offers IS NULL 
  OR withdrawn IS NULL 
  OR updated_at IS NULL;

-- Step 4: Ensure all columns have proper constraints
ALTER TABLE jobs 
ALTER COLUMN company SET NOT NULL,
ALTER COLUMN position SET NOT NULL,
ALTER COLUMN date_applied SET NOT NULL,
ALTER COLUMN status SET NOT NULL,
ALTER COLUMN withdrawn SET DEFAULT FALSE,
ALTER COLUMN created_at SET DEFAULT NOW(),
ALTER COLUMN updated_at SET DEFAULT NOW();

-- Step 5: Create trigger to automatically update updated_at
CREATE OR REPLACE FUNCTION update_jobs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_jobs_updated_at_trigger ON jobs;
CREATE TRIGGER update_jobs_updated_at_trigger
  BEFORE UPDATE ON jobs
  FOR EACH ROW
  EXECUTE FUNCTION update_jobs_updated_at();

-- Step 6: Verify job_offers table exists and is properly configured
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'job_offers') THEN
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

    -- Add indexes
    CREATE INDEX IF NOT EXISTS idx_job_offers_user_id ON job_offers(user_id);
    CREATE INDEX IF NOT EXISTS idx_job_offers_original_job_id ON job_offers(original_job_id);
    CREATE INDEX IF NOT EXISTS idx_job_offers_status ON job_offers(status);
    CREATE INDEX IF NOT EXISTS idx_job_offers_offer_date ON job_offers(offer_date);

    -- Enable RLS
    ALTER TABLE job_offers ENABLE ROW LEVEL SECURITY;

    -- Create RLS policies
    CREATE POLICY "Users can view their own job offers" ON job_offers
      FOR SELECT USING (auth.uid() = user_id);

    CREATE POLICY "Users can insert their own job offers" ON job_offers
      FOR INSERT WITH CHECK (auth.uid() = user_id);

    CREATE POLICY "Users can update their own job offers" ON job_offers
      FOR UPDATE USING (auth.uid() = user_id);

    CREATE POLICY "Users can delete their own job offers" ON job_offers
      FOR DELETE USING (auth.uid() = user_id);
  END IF;
END $$;

-- Step 7: Ensure job offer creation trigger exists
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

DROP TRIGGER IF EXISTS trigger_create_job_offer ON jobs;
CREATE TRIGGER trigger_create_job_offer
  AFTER UPDATE ON jobs
  FOR EACH ROW
  EXECUTE FUNCTION create_job_offer_from_job();

-- Step 8: Verify final schema
SELECT 
  'jobs' as table_name,
  column_name, 
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'jobs'
ORDER BY ordinal_position;

-- Step 9: Test with a sample job creation (optional)
-- This will help verify everything works
SELECT 'Database schema verification complete' as status;
