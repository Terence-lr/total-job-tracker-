// Database connection test utility
import { supabase } from '../lib/supabase';

export const testDatabaseConnection = async () => {
  try {
    console.log('Testing database connection...');
    
    // Test 1: Check if we can connect to Supabase
    const { data: { user } } = await supabase.auth.getUser();
    console.log('User authenticated:', !!user);
    
    if (!user) {
      console.error('No authenticated user found');
      return false;
    }
    
    // Test 2: Check if jobs table exists and has correct columns
    const { data, error } = await supabase
      .from('jobs')
      .select('id, company, position, date_applied, status, salary, job_url, notes, user_id, created_at, updated_at')
      .limit(1);
    
    if (error) {
      console.error('Database schema error:', error);
      console.error('This means the database columns are not set up correctly.');
      console.error('Please run the CRITICAL_DATABASE_FIX.sql script in Supabase SQL Editor.');
      return false;
    }
    
    console.log('Database connection successful!');
    console.log('Available columns:', data ? 'All required columns exist' : 'No data but table accessible');
    
    return true;
  } catch (error) {
    console.error('Database test failed:', error);
    return false;
  }
};

export const testJobCreation = async (testJobData: any) => {
  try {
    console.log('Testing job creation...');
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error('No authenticated user');
      return false;
    }
    
    const { data, error } = await supabase
      .from('jobs')
      .insert({
        user_id: user.id,
        company: testJobData.company || 'Test Company',
        position: testJobData.position || 'Test Position',
        date_applied: testJobData.date_applied || new Date().toISOString(),
        status: testJobData.status || 'Applied',
        salary: testJobData.salary || null,
        job_url: testJobData.job_url || null,
        notes: testJobData.notes || null
      })
      .select()
      .single();
    
    if (error) {
      console.error('Job creation test failed:', error);
      return false;
    }
    
    console.log('Job creation test successful!', data);
    
    // Clean up test data
    await supabase
      .from('jobs')
      .delete()
      .eq('id', data.id);
    
    return true;
  } catch (error) {
    console.error('Job creation test failed:', error);
    return false;
  }
};


