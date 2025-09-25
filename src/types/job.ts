export interface JobApplication {
  id: string;
  company: string;
  position: string;
  date_applied: string;
  status: JobStatus;
  salary?: string;
  notes?: string;
  job_url?: string;
  job_description?: string;
  archived?: boolean;
  user_id: string;
  created_at: Date;
  updated_at: Date;
}

export type JobStatus = 'Applied' | 'Interview' | 'Offer' | 'Rejected' | 'Withdrawn' | 'Archived';

export interface CreateJobApplication {
  company: string;
  position: string;
  date_applied: string;
  status: JobStatus;
  salary?: string;
  notes?: string;
  job_url?: string;
  job_description?: string;
  archived?: boolean;
}

export interface UpdateJobApplication extends Partial<CreateJobApplication> {
  id: string;
}

export interface JobFilters {
  status?: JobStatus | JobStatus[];
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  minSalary?: number;
  maxSalary?: number;
}
