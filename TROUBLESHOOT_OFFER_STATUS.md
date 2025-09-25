# Troubleshooting Job Status Change to "Offer"

## Issue Description
When changing job status to "Offer", users may experience errors or the status change may not work properly.

## Root Causes Identified

### 1. Database Schema Mismatch (CRITICAL)
- **Problem**: The `job_offers` table references `original_job_id INTEGER` but the `jobs` table uses `id UUID`
- **Impact**: Database trigger fails when trying to create job offers
- **Solution**: Run the `FIX_JOB_OFFERS_SCHEMA.sql` script

### 2. Missing Database Columns
- **Problem**: Some required columns may be missing from the jobs table
- **Impact**: Trigger function fails due to missing columns
- **Solution**: Ensure all required columns exist

### 3. Database Trigger Issues
- **Problem**: The trigger function may not handle all edge cases
- **Impact**: Job offers not created automatically
- **Solution**: Updated trigger function in the fix script

## Step-by-Step Fix

### Step 1: Run Database Schema Fix
```sql
-- Run this in Supabase SQL Editor
-- See FIX_JOB_OFFERS_SCHEMA.sql for complete script
```

### Step 2: Verify Database Schema
```sql
-- Check jobs table structure
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'jobs' 
ORDER BY ordinal_position;

-- Check job_offers table structure  
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'job_offers' 
ORDER BY ordinal_position;
```

### Step 3: Test the Fix
1. Change a job status to "Offer"
2. Check if a job offer is created in the `job_offers` table
3. Verify the celebration modal appears

## Common Error Messages and Solutions

### Error: "column 'original_job_id' is of type integer but expression is of type uuid"
**Solution**: Run the schema fix script to change the column type

### Error: "relation 'job_offers' does not exist"
**Solution**: Run the `CREATE_JOB_OFFERS_TABLE.sql` script first

### Error: "function create_job_offer_from_job() does not exist"
**Solution**: The trigger function was dropped, run the fix script to recreate it

### Error: "permission denied for table job_offers"
**Solution**: Check RLS policies and ensure user has proper permissions

## Verification Steps

1. **Check Database Schema**:
   ```sql
   SELECT 
     'jobs' as table_name,
     column_name, 
     data_type
   FROM information_schema.columns 
   WHERE table_name = 'jobs' AND column_name = 'id'
   UNION ALL
   SELECT 
     'job_offers' as table_name,
     column_name, 
     data_type
   FROM information_schema.columns 
   WHERE table_name = 'job_offers' AND column_name = 'original_job_id';
   ```

2. **Test Status Change**:
   - Go to Dashboard or Applications page
   - Change a job status to "Offer"
   - Check browser console for errors
   - Verify celebration modal appears
   - Check if job offer is created in database

3. **Check Browser Console**:
   - Open Developer Tools (F12)
   - Look for JavaScript errors
   - Check Network tab for failed API calls

## Prevention

1. **Always use UUID for job IDs** in new tables
2. **Test database triggers** after schema changes
3. **Verify RLS policies** are correctly set up
4. **Check column types** match between related tables

## Additional Debugging

If issues persist after running the fix:

1. **Check Supabase Logs**:
   - Go to Supabase Dashboard
   - Check Logs section for database errors

2. **Verify User Permissions**:
   ```sql
   -- Check if user can insert into job_offers
   SELECT * FROM job_offers WHERE user_id = auth.uid();
   ```

3. **Test Trigger Manually**:
   ```sql
   -- Update a job status to test trigger
   UPDATE jobs SET status = 'Offer' WHERE id = 'your-job-id';
   SELECT * FROM job_offers WHERE original_job_id = 'your-job-id';
   ```

## Contact Support

If the issue persists after following these steps:
1. Check Supabase logs for specific error messages
2. Verify all database scripts have been run successfully
3. Test with a fresh job application to isolate the issue
