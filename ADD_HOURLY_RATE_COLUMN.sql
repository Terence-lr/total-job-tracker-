-- Add hourly_rate column to jobs table
ALTER TABLE jobs ADD COLUMN hourly_rate DECIMAL(10,2);

-- Add pay_type column to distinguish between salary and hourly
ALTER TABLE jobs ADD COLUMN pay_type VARCHAR(20) DEFAULT 'salary';

-- Update existing records to set pay_type based on salary field
UPDATE jobs 
SET pay_type = 'salary' 
WHERE salary IS NOT NULL AND salary != '';

-- Create a function to calculate gross salary from hourly rate
CREATE OR REPLACE FUNCTION calculate_gross_salary(hourly_rate DECIMAL, hours_per_week INTEGER DEFAULT 40, weeks_per_year INTEGER DEFAULT 52)
RETURNS DECIMAL AS $$
BEGIN
    RETURN hourly_rate * hours_per_week * weeks_per_year;
END;
$$ LANGUAGE plpgsql;

-- Create a function to calculate gross hourly rate from salary
CREATE OR REPLACE FUNCTION calculate_gross_hourly_rate(salary DECIMAL, hours_per_week INTEGER DEFAULT 40, weeks_per_year INTEGER DEFAULT 52)
RETURNS DECIMAL AS $$
BEGIN
    RETURN salary / (hours_per_week * weeks_per_year);
END;
$$ LANGUAGE plpgsql;

-- Add computed columns for auto-calculation
ALTER TABLE jobs ADD COLUMN calculated_salary DECIMAL(10,2);
ALTER TABLE jobs ADD COLUMN calculated_hourly_rate DECIMAL(10,2);

-- Create trigger to auto-calculate when hourly_rate is updated
CREATE OR REPLACE FUNCTION update_calculated_pay()
RETURNS TRIGGER AS $$
BEGIN
    -- If hourly_rate is provided, calculate salary
    IF NEW.hourly_rate IS NOT NULL AND NEW.hourly_rate > 0 THEN
        NEW.calculated_salary = calculate_gross_salary(NEW.hourly_rate);
        NEW.pay_type = 'hourly';
    END IF;
    
    -- If salary is provided, calculate hourly rate
    IF NEW.salary IS NOT NULL AND NEW.salary != '' THEN
        -- Extract numeric value from salary string (handle formats like "$50,000", "50k", etc.)
        DECLARE
            salary_numeric DECIMAL;
        BEGIN
            -- Remove common non-numeric characters and convert
            salary_numeric := CAST(REGEXP_REPLACE(NEW.salary, '[^0-9.]', '', 'g') AS DECIMAL);
            
            -- Handle 'k' suffix (multiply by 1000)
            IF LOWER(NEW.salary) LIKE '%k%' THEN
                salary_numeric := salary_numeric * 1000;
            END IF;
            
            -- Handle 'm' suffix (multiply by 1000000)
            IF LOWER(NEW.salary) LIKE '%m%' THEN
                salary_numeric := salary_numeric * 1000000;
            END IF;
            
            NEW.calculated_hourly_rate = calculate_gross_hourly_rate(salary_numeric);
            NEW.pay_type = 'salary';
        EXCEPTION
            WHEN OTHERS THEN
                -- If conversion fails, leave calculated_hourly_rate as NULL
                NULL;
        END;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER trigger_update_calculated_pay
    BEFORE INSERT OR UPDATE ON jobs
    FOR EACH ROW
    EXECUTE FUNCTION update_calculated_pay();

-- Update existing records to populate calculated fields
UPDATE jobs 
SET calculated_salary = calculate_gross_salary(CAST(REGEXP_REPLACE(salary, '[^0-9.]', '', 'g') AS DECIMAL))
WHERE salary IS NOT NULL AND salary != '' AND salary ~ '^[0-9]';

-- Add comments to columns
COMMENT ON COLUMN jobs.hourly_rate IS 'Hourly rate in dollars (e.g., 25.50)';
COMMENT ON COLUMN jobs.pay_type IS 'Type of pay: salary or hourly';
COMMENT ON COLUMN jobs.calculated_salary IS 'Auto-calculated gross annual salary from hourly rate';
COMMENT ON COLUMN jobs.calculated_hourly_rate IS 'Auto-calculated gross hourly rate from salary';
