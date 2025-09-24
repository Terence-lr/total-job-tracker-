import { supabase } from '../lib/supabase';

export const profileService = {
  async getProfile() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error && error.code === 'PGRST116') {
      // Profile doesn't exist, create one
      const { data: newProfile } = await supabase
        .from('user_profiles')
        .insert({ user_id: user.id, skills: [] })
        .select()
        .single();
      return newProfile;
    }

    return data;
  },

  async updateSkills(skills: string[]) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data } = await supabase
      .from('user_profiles')
      .upsert({
        user_id: user.id,
        skills: skills,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    return data;
  }
};
