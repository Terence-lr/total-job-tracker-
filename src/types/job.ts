export interface JobApplication {
  id: string;
  company: string;
  position: string;
  date_applied: string;
  status: JobStatus;
  salary?: string;
  hourly_rate?: number;
  pay_type?: 'salary' | 'hourly';
  calculated_salary?: number;
  calculated_hourly_rate?: number;
  notes?: string;
  job_url?: string;
  job_description?: string;
  offers?: string;
  withdrawn?: boolean;
  user_id: string;
  created_at: Date;
  updated_at: Date;
}

// New comprehensive job interface
export interface Job {
  id: string;
  user_id: string;
  company: string;
  position: string;
  salary?: string | null;
  hourly_rate?: string | null;
  job_url?: string | null;
  status: 'applied' | 'interview' | 'offer' | 'rejected';
  notes?: string | null;
  applied_date: string;
  created_at: string;
  updated_at?: string;
}

export interface JobFormData {
  company: string;
  position: string;
  salary?: string | null;
  hourly_rate?: string | null;
  job_url?: string | null;
  status: string;
  notes?: string | null;
  applied_date: string;
}

export type JobStatus = 'Applied' | 'Interview' | 'Offer' | 'Rejected' | 'Withdrawn' | 'Archived';

export interface CreateJobApplication {
  company: string;
  position: string;
  date_applied: string;
  status: JobStatus;
  salary?: string;
  hourly_rate?: number;
  pay_type?: 'salary' | 'hourly';
  calculated_salary?: number;
  calculated_hourly_rate?: number;
  notes?: string;
  job_url?: string;
  job_description?: string;
  offers?: string;
  withdrawn?: boolean;
}

export interface UpdateJobApplication extends Partial<CreateJobApplication> {
  id: string;
}

export interface JobFilters {
  status?: JobStatus | JobStatus[];
  search?: string;
  companySearch?: string;
  positionSearch?: string;
  dateFrom?: string;
  dateTo?: string;
  minSalary?: number;
  maxSalary?: number;
}
