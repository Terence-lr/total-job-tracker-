-- CREATE JOB OFFERS TABLE
-- Run this in Supabase SQL Editor to create the job offers table

-- Step 1: Create the job_offers table
CREATE TABLE IF NOT EXISTS job_offers (
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

-- Step 2: Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_job_offers_user_id ON job_offers(user_id);
CREATE INDEX IF NOT EXISTS idx_job_offers_original_job_id ON job_offers(original_job_id);
CREATE INDEX IF NOT EXISTS idx_job_offers_status ON job_offers(status);
CREATE INDEX IF NOT EXISTS idx_job_offers_offer_date ON job_offers(offer_date);

-- Step 3: Add RLS (Row Level Security) policies
ALTER TABLE job_offers ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own job offers
CREATE POLICY "Users can view their own job offers" ON job_offers
  FOR SELECT USING (auth.uid() = user_id);

-- Policy: Users can insert their own job offers
CREATE POLICY "Users can insert their own job offers" ON job_offers
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own job offers
CREATE POLICY "Users can update their own job offers" ON job_offers
  FOR UPDATE USING (auth.uid() = user_id);

-- Policy: Users can delete their own job offers
CREATE POLICY "Users can delete their own job offers" ON job_offers
  FOR DELETE USING (auth.uid() = user_id);

-- Step 4: Add trigger to update updated_at timestamp
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

-- Step 5: Add function to automatically create job offer when job status changes to 'Offer'
CREATE OR REPLACE FUNCTION create_job_offer_from_job()
RETURNS TRIGGER AS $$
BEGIN
  -- Only create offer if status changed to 'Offer' and it's a new offer
  IF NEW.status = 'Offer' AND (OLD.status IS NULL OR OLD.status != 'Offer') THEN
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

-- Step 6: Create trigger to automatically create job offers
CREATE TRIGGER trigger_create_job_offer
  AFTER UPDATE ON jobs
  FOR EACH ROW
  EXECUTE FUNCTION create_job_offer_from_job();

-- Step 7: Verify table creation
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM information_schema.columns 
WHERE table_name = 'job_offers'
ORDER BY ordinal_position;

-- Step 8: Test the table with a sample query
SELECT COUNT(*) as total_offers FROM job_offers;
