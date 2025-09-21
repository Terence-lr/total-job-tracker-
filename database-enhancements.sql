-- Enhanced Database Schema for Advanced Features
-- Job Tracker Pro - Production Ready Schema

-- Application Events Table for tracking all application activities
CREATE TABLE IF NOT EXISTS application_events (
  id SERIAL PRIMARY KEY,
  application_id INT NOT NULL,
  event_type VARCHAR(50) NOT NULL,
  event_data JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (application_id) REFERENCES jobs(id) ON DELETE CASCADE
);

-- Company Research Table for storing company insights
CREATE TABLE IF NOT EXISTS company_research (
  id SERIAL PRIMARY KEY,
  company_name VARCHAR(255) NOT NULL UNIQUE,
  glassdoor_rating DECIMAL(2,1),
  linkedin_data JSONB,
  company_size VARCHAR(50),
  industry VARCHAR(100),
  headquarters VARCHAR(255),
  website VARCHAR(255),
  notes TEXT,
  research_date TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- User Profiles Table for AI matching
CREATE TABLE IF NOT EXISTS user_profiles (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  skills TEXT[],
  experience_years INTEGER,
  education_level VARCHAR(50),
  preferred_locations TEXT[],
  salary_expectation INTEGER,
  work_type_preferences TEXT[],
  industry_preferences TEXT[],
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Job Match Scores Table for AI analysis
CREATE TABLE IF NOT EXISTS job_match_scores (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL,
  job_id INT NOT NULL,
  overall_score INTEGER NOT NULL,
  skills_score INTEGER,
  experience_score INTEGER,
  location_score INTEGER,
  salary_score INTEGER,
  work_type_score INTEGER,
  match_insights JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
  UNIQUE(user_id, job_id)
);

-- Follow-up Reminders Table
CREATE TABLE IF NOT EXISTS follow_up_reminders (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL,
  application_id INT NOT NULL,
  reminder_type VARCHAR(50) NOT NULL,
  due_date TIMESTAMP NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  priority VARCHAR(10) DEFAULT 'medium',
  notes TEXT,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  FOREIGN KEY (application_id) REFERENCES jobs(id) ON DELETE CASCADE
);

-- Analytics Data Table for performance tracking
CREATE TABLE IF NOT EXISTS analytics_data (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL,
  metric_name VARCHAR(100) NOT NULL,
  metric_value DECIMAL(10,2),
  metric_data JSONB,
  date_recorded DATE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  UNIQUE(user_id, metric_name, date_recorded)
);

-- Job Search Goals Table
CREATE TABLE IF NOT EXISTS job_search_goals (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL,
  goal_type VARCHAR(50) NOT NULL,
  target_value INTEGER NOT NULL,
  current_value INTEGER DEFAULT 0,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Interview Preparation Table
CREATE TABLE IF NOT EXISTS interview_preparation (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL,
  application_id INT NOT NULL,
  interview_date TIMESTAMP,
  interview_type VARCHAR(50),
  preparation_notes TEXT,
  questions_prepared TEXT[],
  company_research TEXT,
  status VARCHAR(20) DEFAULT 'preparing',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  FOREIGN KEY (application_id) REFERENCES jobs(id) ON DELETE CASCADE
);

-- Network Contacts Table
CREATE TABLE IF NOT EXISTS network_contacts (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL,
  name VARCHAR(255) NOT NULL,
  company VARCHAR(255),
  position VARCHAR(255),
  email VARCHAR(255),
  linkedin_url VARCHAR(255),
  relationship_type VARCHAR(50),
  notes TEXT,
  last_contact_date DATE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_application_events_application_id ON application_events(application_id);
CREATE INDEX IF NOT EXISTS idx_application_events_event_type ON application_events(event_type);
CREATE INDEX IF NOT EXISTS idx_application_events_created_at ON application_events(created_at);

CREATE INDEX IF NOT EXISTS idx_company_research_company_name ON company_research(company_name);
CREATE INDEX IF NOT EXISTS idx_company_research_industry ON company_research(industry);

CREATE INDEX IF NOT EXISTS idx_job_match_scores_user_id ON job_match_scores(user_id);
CREATE INDEX IF NOT EXISTS idx_job_match_scores_job_id ON job_match_scores(job_id);
CREATE INDEX IF NOT EXISTS idx_job_match_scores_overall_score ON job_match_scores(overall_score);

CREATE INDEX IF NOT EXISTS idx_follow_up_reminders_user_id ON follow_up_reminders(user_id);
CREATE INDEX IF NOT EXISTS idx_follow_up_reminders_due_date ON follow_up_reminders(due_date);
CREATE INDEX IF NOT EXISTS idx_follow_up_reminders_status ON follow_up_reminders(status);

CREATE INDEX IF NOT EXISTS idx_analytics_data_user_id ON analytics_data(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_data_metric_name ON analytics_data(metric_name);
CREATE INDEX IF NOT EXISTS idx_analytics_data_date_recorded ON analytics_data(date_recorded);

CREATE INDEX IF NOT EXISTS idx_job_search_goals_user_id ON job_search_goals(user_id);
CREATE INDEX IF NOT EXISTS idx_job_search_goals_status ON job_search_goals(status);

CREATE INDEX IF NOT EXISTS idx_interview_preparation_user_id ON interview_preparation(user_id);
CREATE INDEX IF NOT EXISTS idx_interview_preparation_application_id ON interview_preparation(application_id);
CREATE INDEX IF NOT EXISTS idx_interview_preparation_interview_date ON interview_preparation(interview_date);

CREATE INDEX IF NOT EXISTS idx_network_contacts_user_id ON network_contacts(user_id);
CREATE INDEX IF NOT EXISTS idx_network_contacts_company ON network_contacts(company);

-- Row Level Security (RLS) Policies
ALTER TABLE application_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_research ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_match_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE follow_up_reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_search_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE interview_preparation ENABLE ROW LEVEL SECURITY;
ALTER TABLE network_contacts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for application_events
CREATE POLICY "Users can view their own application events" ON application_events
  FOR SELECT USING (
    application_id IN (
      SELECT id FROM jobs WHERE userId = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own application events" ON application_events
  FOR INSERT WITH CHECK (
    application_id IN (
      SELECT id FROM jobs WHERE userId = auth.uid()
    )
  );

-- RLS Policies for company_research
CREATE POLICY "Company research is publicly readable" ON company_research
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert company research" ON company_research
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- RLS Policies for user_profiles
CREATE POLICY "Users can view their own profile" ON user_profiles
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update their own profile" ON user_profiles
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own profile" ON user_profiles
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- RLS Policies for job_match_scores
CREATE POLICY "Users can view their own job match scores" ON job_match_scores
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own job match scores" ON job_match_scores
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- RLS Policies for follow_up_reminders
CREATE POLICY "Users can view their own follow-up reminders" ON follow_up_reminders
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own follow-up reminders" ON follow_up_reminders
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own follow-up reminders" ON follow_up_reminders
  FOR UPDATE USING (user_id = auth.uid());

-- RLS Policies for analytics_data
CREATE POLICY "Users can view their own analytics data" ON analytics_data
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own analytics data" ON analytics_data
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- RLS Policies for job_search_goals
CREATE POLICY "Users can view their own job search goals" ON job_search_goals
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own job search goals" ON job_search_goals
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own job search goals" ON job_search_goals
  FOR UPDATE USING (user_id = auth.uid());

-- RLS Policies for interview_preparation
CREATE POLICY "Users can view their own interview preparation" ON interview_preparation
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own interview preparation" ON interview_preparation
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own interview preparation" ON interview_preparation
  FOR UPDATE USING (user_id = auth.uid());

-- RLS Policies for network_contacts
CREATE POLICY "Users can view their own network contacts" ON network_contacts
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own network contacts" ON network_contacts
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own network contacts" ON network_contacts
  FOR UPDATE USING (user_id = auth.uid());

-- Functions for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for automatic timestamp updates
CREATE TRIGGER update_application_events_updated_at BEFORE UPDATE ON application_events
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_company_research_updated_at BEFORE UPDATE ON company_research
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_follow_up_reminders_updated_at BEFORE UPDATE ON follow_up_reminders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_job_search_goals_updated_at BEFORE UPDATE ON job_search_goals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_interview_preparation_updated_at BEFORE UPDATE ON interview_preparation
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_network_contacts_updated_at BEFORE UPDATE ON network_contacts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Sample data for testing (optional)
INSERT INTO company_research (company_name, glassdoor_rating, industry, company_size, headquarters) VALUES
('Google', 4.4, 'Technology', '10,001+ employees', 'Mountain View, CA'),
('Microsoft', 4.3, 'Technology', '10,001+ employees', 'Redmond, WA'),
('Apple', 4.2, 'Technology', '10,001+ employees', 'Cupertino, CA'),
('Amazon', 3.8, 'Technology', '10,001+ employees', 'Seattle, WA'),
('Meta', 4.1, 'Technology', '10,001+ employees', 'Menlo Park, CA');

-- Performance optimization views
CREATE VIEW user_application_summary AS
SELECT 
    j.userId,
    COUNT(*) as total_applications,
    COUNT(CASE WHEN j.status = 'Applied' THEN 1 END) as applied_count,
    COUNT(CASE WHEN j.status = 'Interview' THEN 1 END) as interview_count,
    COUNT(CASE WHEN j.status = 'Offer' THEN 1 END) as offer_count,
    COUNT(CASE WHEN j.status = 'Rejected' THEN 1 END) as rejected_count,
    AVG(CASE WHEN j.status IN ('Interview', 'Offer') THEN 1.0 ELSE 0.0 END) * 100 as response_rate,
    AVG(CASE WHEN j.status = 'Offer' THEN 1.0 ELSE 0.0 END) * 100 as offer_rate
FROM jobs j
GROUP BY j.userId;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

