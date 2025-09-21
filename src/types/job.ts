export interface JobApplication {
  id: string;
  company: string;
  position: string;
  dateApplied: string;
  status: JobStatus;
  salary?: string;
  notes?: string;
  jobUrl?: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export type JobStatus = 'Applied' | 'Interview' | 'Offer' | 'Rejected' | 'Withdrawn' | 'Archived';

export interface CreateJobApplication {
  company: string;
  position: string;
  dateApplied: string;
  status: JobStatus;
  salary?: string;
  notes?: string;
  jobUrl?: string;
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
