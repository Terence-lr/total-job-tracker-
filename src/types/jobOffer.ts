export interface JobOffer {
  id: string;
  original_job_id: string;
  company: string;
  position: string;
  offer_date: string;
  salary_amount?: number;
  salary_currency: string;
  salary_type: string;
  benefits?: string;
  start_date?: string;
  location?: string;
  remote_option: boolean;
  job_type?: string;
  offer_deadline?: string;
  notes?: string;
  status: JobOfferStatus;
  created_at: Date;
  updated_at: Date;
  user_id: string;
}

export type JobOfferStatus = 'pending' | 'accepted' | 'declined' | 'expired';

export interface CreateJobOffer {
  original_job_id: string;
  company: string;
  position: string;
  offer_date: string;
  salary_amount?: number;
  salary_currency?: string;
  salary_type?: string;
  benefits?: string;
  start_date?: string;
  location?: string;
  remote_option?: boolean;
  job_type?: string;
  offer_deadline?: string;
  notes?: string;
  status?: JobOfferStatus;
}

export interface UpdateJobOffer extends Partial<CreateJobOffer> {
  id: string;
}

export interface JobOfferComparison {
  id: string;
  company: string;
  position: string;
  salary_amount?: number;
  salary_currency: string;
  salary_type: string;
  benefits?: string;
  start_date?: string;
  location?: string;
  remote_option: boolean;
  job_type?: string;
  offer_deadline?: string;
  status: JobOfferStatus;
  offer_date: string;
}
