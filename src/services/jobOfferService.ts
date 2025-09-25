import { supabase } from '../lib/supabase';
import { JobOffer, CreateJobOffer, JobOfferComparison } from '../types/jobOffer';

// Get current user helper
const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

// Create a new job offer
export const createJobOffer = async (offerData: CreateJobOffer): Promise<string> => {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('job_offers')
      .insert([
        {
          ...offerData,
          user_id: currentUser.id
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      throw error;
    }
    
    console.log('Job offer created with ID:', data.id);
    return data.id;
  } catch (error) {
    console.error('Error creating job offer:', error);
    throw new Error('Failed to create job offer');
  }
};

// Get all job offers for the current user
export const getJobOffers = async (): Promise<JobOffer[]> => {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('job_offers')
      .select('*')
      .eq('user_id', currentUser.id)
      .order('offer_date', { ascending: false });

    if (error) {
      console.error('Error fetching job offers:', error);
      throw error;
    }
    
    const offers: JobOffer[] = (data || []).map(offer => ({
      id: offer.id,
      original_job_id: offer.original_job_id,
      company: offer.company,
      position: offer.position,
      offer_date: offer.offer_date,
      salary_amount: offer.salary_amount,
      salary_currency: offer.salary_currency || 'USD',
      salary_type: offer.salary_type || 'annual',
      benefits: offer.benefits || '',
      start_date: offer.start_date,
      location: offer.location || '',
      remote_option: offer.remote_option || false,
      job_type: offer.job_type || 'full-time',
      offer_deadline: offer.offer_deadline,
      notes: offer.notes || '',
      status: offer.status as any,
      created_at: new Date(offer.created_at),
      updated_at: new Date(offer.updated_at),
      user_id: offer.user_id
    }));
    
    console.log(`Retrieved ${offers.length} job offers for user ${currentUser.id}`);
    return offers;
  } catch (error) {
    console.error('Error getting job offers:', error);
    throw new Error('Failed to retrieve job offers');
  }
};

// Update a job offer
export const updateJobOffer = async (offerId: string, updates: Partial<JobOffer>): Promise<void> => {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('job_offers')
      .update(updates)
      .eq('id', offerId)
      .eq('user_id', currentUser.id);

    if (error) {
      console.error('Error updating job offer:', error);
      throw error;
    }
    
    console.log('Job offer updated successfully');
  } catch (error) {
    console.error('Error updating job offer:', error);
    throw new Error('Failed to update job offer');
  }
};

// Delete a job offer
export const deleteJobOffer = async (offerId: string): Promise<void> => {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('job_offers')
      .delete()
      .eq('id', offerId)
      .eq('user_id', currentUser.id);

    if (error) {
      console.error('Error deleting job offer:', error);
      throw error;
    }
    
    console.log('Job offer deleted successfully');
  } catch (error) {
    console.error('Error deleting job offer:', error);
    throw new Error('Failed to delete job offer');
  }
};

// Get job offers for comparison
export const getJobOffersForComparison = async (): Promise<JobOfferComparison[]> => {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('job_offers')
      .select('*')
      .eq('user_id', currentUser.id)
      .order('offer_date', { ascending: false });

    if (error) {
      console.error('Error fetching job offers for comparison:', error);
      throw error;
    }
    
    const offers: JobOfferComparison[] = (data || []).map(offer => ({
      id: offer.id,
      company: offer.company,
      position: offer.position,
      salary_amount: offer.salary_amount,
      salary_currency: offer.salary_currency || 'USD',
      salary_type: offer.salary_type || 'annual',
      benefits: offer.benefits || '',
      start_date: offer.start_date,
      location: offer.location || '',
      remote_option: offer.remote_option || false,
      job_type: offer.job_type || 'full-time',
      offer_deadline: offer.offer_deadline,
      status: offer.status as any,
      offer_date: offer.offer_date
    }));
    
    return offers;
  } catch (error) {
    console.error('Error getting job offers for comparison:', error);
    throw new Error('Failed to retrieve job offers for comparison');
  }
};

// Accept a job offer
export const acceptJobOffer = async (offerId: string): Promise<void> => {
  await updateJobOffer(offerId, { status: 'accepted' });
};

// Decline a job offer
export const declineJobOffer = async (offerId: string): Promise<void> => {
  await updateJobOffer(offerId, { status: 'declined' });
};
