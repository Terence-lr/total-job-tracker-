# Data Loading Troubleshooting Guide

## Issue: "Failed to load job applications" Error

### Root Cause
The error occurs due to a mismatch between the database schema and the TypeScript interfaces. The original database schema uses `title` column, but the application expects `position` column.

### Solution Steps

#### 1. Database Schema Migration
Run the migration script in your Supabase SQL Editor:

```sql
-- See database-migration-fix.sql for the complete script
```

#### 2. Verify Database Schema
After running the migration, verify your `jobs` table has these columns:
- `id` (UUID, Primary Key)
- `user_id` (UUID, Foreign Key to auth.users)
- `company` (TEXT, NOT NULL)
- `position` (TEXT, NOT NULL) - **This was `title` before**
- `date_applied` (DATE, NOT NULL) - **This was missing before**
- `status` (TEXT, NOT NULL, DEFAULT 'Applied')
- `salary` (TEXT, NULLABLE) - **This was missing before**
- `notes` (TEXT, NULLABLE)
- `job_url` (TEXT, NULLABLE) - **This was missing before**
- `created_at` (TIMESTAMPTZ, DEFAULT NOW())
- `updated_at` (TIMESTAMPTZ, DEFAULT NOW()) - **This was missing before**

#### 3. Check RLS Policies
Ensure Row Level Security policies are correctly set:

```sql
-- Users can only see their own jobs
CREATE POLICY "Users can view own jobs" ON jobs
  FOR SELECT USING (auth.uid() = user_id);
```

#### 4. Environment Variables
Verify your `.env` file has the correct Supabase credentials:

```env
REACT_APP_SUPABASE_URL=your_supabase_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
```

#### 5. Test Database Connection
You can test the connection by running this query in Supabase SQL Editor:

```sql
SELECT COUNT(*) FROM jobs WHERE user_id = auth.uid();
```

### Common Issues and Fixes

#### Issue 1: Column "position" does not exist
**Fix**: Run the migration script to add the `position` column and migrate data from `title`.

#### Issue 2: Column "date_applied" does not exist
**Fix**: Run the migration script to add the `date_applied` column.

#### Issue 3: RLS Policy blocking access
**Fix**: Ensure RLS policies are correctly configured for the `user_id` column.

#### Issue 4: User not authenticated
**Fix**: Check that the user is properly logged in and `auth.uid()` returns a valid UUID.

### Testing the Fix

1. **Build the application**: `npm run build`
2. **Start the development server**: `npm start`
3. **Login to the application**
4. **Check the browser console** for any remaining errors
5. **Verify data loads** in the dashboard

### Additional Debugging

If the issue persists, check:

1. **Browser Console**: Look for specific error messages
2. **Network Tab**: Check if API calls are being made
3. **Supabase Dashboard**: Verify the table structure and data
4. **Authentication**: Ensure the user is properly authenticated

### Files Modified

- `src/services/enhancedJobService.ts` - Updated to properly map database columns
- `database-migration-fix.sql` - Migration script to fix schema
- `database-schema-corrected.sql` - Corrected schema definition

### Next Steps

After running the migration:
1. Test the application locally
2. Deploy to production
3. Monitor for any remaining issues
4. Update documentation if needed

