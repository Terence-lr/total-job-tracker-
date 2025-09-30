import { supabase } from '../lib/supabase';

export const jobService = {
  async createJobApplication(jobData: any) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Map frontend fields to EXACT database columns
    const { data, error } = await supabase
      .from('jobs')
      .insert({
        user_id: user.id,
        company: jobData.company,
        position: jobData.position,
        date_applied: jobData.date_applied || new Date().toISOString(),
        status: jobData.status || 'Applied',
        salary: jobData.salary || null,
        job_url: jobData.job_url || null,
        notes: jobData.notes || null
      })
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      throw error;
    }
    return data;
  },

  async getJobs() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .eq('user_id', user.id)
      .order('date_applied', { ascending: false });

    if (error) {
      console.error('Error fetching jobs:', error);
      return [];
    }
    return data || [];
  },

  async updateJobApplication(id: string, updates: any) {
    const { data, error } = await supabase
      .from('jobs')
      .update({
        company: updates.company,
        position: updates.position,
        status: updates.status,
        salary: updates.salary,
        job_url: updates.job_url,
        notes: updates.notes,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteJobApplication(id: string) {
    const { error } = await supabase
      .from('jobs')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};



