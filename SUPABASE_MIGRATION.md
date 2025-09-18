# Firebase to Supabase Migration Guide

This guide will help you migrate your Job Application Tracker from Firebase to Supabase while keeping your existing UI.

## 🎯 Migration Overview

- **From**: Firebase Auth + Firestore
- **To**: Supabase Auth + PostgreSQL
- **UI**: Kept unchanged (React components remain the same)
- **Features**: Email/Password auth + Google OAuth + Job CRUD operations

## 📋 Prerequisites

- Supabase account (free tier available)
- Node.js and npm installed
- Git repository access

## 🚀 Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click "New Project"
3. Choose your organization
4. Enter project details:
   - **Name**: `job-tracker` (or your preferred name)
   - **Database Password**: Generate a strong password
   - **Region**: Choose closest to your users
5. Click "Create new project"
6. Wait for the project to be set up (2-3 minutes)

## 🗄️ Step 2: Set Up Database Schema

1. In your Supabase dashboard, go to **SQL Editor**
2. Click "New Query"
3. Copy and paste the contents of `supabase-schema.sql`
4. Click "Run" to execute the schema

This will create:
- `profiles` table for user data
- `jobs` table for job applications
- Row Level Security (RLS) policies
- Automatic profile creation trigger
- Performance indexes

## 🔐 Step 3: Configure Authentication

### Enable Email/Password Authentication
1. Go to **Authentication** → **Settings**
2. Under "Auth Providers", ensure **Email** is enabled
3. Configure email templates if needed

### Enable Google OAuth
1. Go to **Authentication** → **Providers**
2. Enable **Google** provider
3. Get OAuth credentials from [Google Cloud Console](https://console.cloud.google.com/):
   - Create a new project or select existing
   - Enable Google+ API
   - Create OAuth 2.0 credentials
   - Add authorized redirect URIs:
     - `https://your-project-ref.supabase.co/auth/v1/callback`
     - `http://localhost:3000/auth/callback` (for development)
4. Copy Client ID and Client Secret to Supabase
5. Save the configuration

### Configure Site URL
1. Go to **Authentication** → **URL Configuration**
2. Set **Site URL** to your production domain (e.g., `https://your-app.vercel.app`)
3. Add **Redirect URLs**:
   - `https://your-app.vercel.app/dashboard`
   - `http://localhost:3000/dashboard` (for development)

## 🔑 Step 4: Get API Keys

1. Go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (e.g., `https://your-project-ref.supabase.co`)
   - **Anon public key** (starts with `eyJ...`)

## ⚙️ Step 5: Configure Environment Variables

### Local Development
1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Update `.env` with your Supabase values:
   ```env
   VITE_SUPABASE_URL=https://your-project-ref.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```

### Vercel Production
1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add the following variables:
   ```
   VITE_SUPABASE_URL = https://your-project-ref.supabase.co
   VITE_SUPABASE_ANON_KEY = your-anon-key-here
   ```

## 🧪 Step 6: Test the Migration

### Local Testing
1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm start
   ```

3. Test the following features:
   - [ ] User registration with email/password
   - [ ] User login with email/password
   - [ ] Google OAuth sign-in
   - [ ] Password reset functionality
   - [ ] Job application CRUD operations
   - [ ] Search and filtering
   - [ ] User data isolation (RLS)

### Build Testing
1. Test the build process:
   ```bash
   npm run build
   ```

2. Verify environment variables:
   ```bash
   npm run verify-env
   ```

## 🚀 Step 7: Deploy to Vercel

1. Push your changes to GitHub:
   ```bash
   git add .
   git commit -m "Migrate from Firebase to Supabase"
   git push origin main
   ```

2. Vercel will automatically deploy the new version
3. Test the production deployment:
   - [ ] Authentication works
   - [ ] Job applications can be created/edited/deleted
   - [ ] Data isolation works correctly
   - [ ] Google OAuth works in production

## 🔍 Step 8: Verify Data Security

### Test Row Level Security (RLS)
1. Create two different user accounts
2. Add job applications with each account
3. Verify that:
   - Users can only see their own job applications
   - Users cannot access other users' data
   - All CRUD operations respect user ownership

### Check Database Policies
1. Go to **Authentication** → **Policies** in Supabase
2. Verify that RLS policies are active:
   - `Users can view own jobs`
   - `Users can insert own jobs`
   - `Users can update own jobs`
   - `Users can delete own jobs`

## 🗑️ Step 9: Clean Up Firebase (Optional)

Once you've verified that Supabase is working correctly:

1. **Backup Firebase data** (if needed)
2. **Disable Firebase project** or delete it
3. **Remove Firebase dependencies** from package.json
4. **Update documentation** to reflect Supabase usage

## 📊 Migration Benefits

### Performance Improvements
- **Faster queries** with PostgreSQL indexes
- **Better scalability** with connection pooling
- **Real-time subscriptions** for live updates

### Developer Experience
- **SQL queries** instead of NoSQL limitations
- **Better debugging** with SQL logs
- **Type safety** with generated types

### Cost Benefits
- **Free tier** includes 500MB database and 50,000 monthly active users
- **Predictable pricing** based on usage
- **No vendor lock-in** with open source PostgreSQL

## 🐛 Troubleshooting

### Common Issues

#### Authentication Errors
- **Issue**: "Invalid login credentials"
- **Solution**: Check that email/password authentication is enabled in Supabase

#### RLS Policy Errors
- **Issue**: "Row Level Security policy violation"
- **Solution**: Verify that RLS policies are correctly configured

#### Google OAuth Issues
- **Issue**: Google sign-in redirects to wrong URL
- **Solution**: Check authorized redirect URIs in Google Cloud Console

#### Environment Variable Issues
- **Issue**: "Missing Supabase environment variables"
- **Solution**: Run `npm run verify-env` to check configuration

### Debug Mode
Enable debug logging by adding to your `.env`:
```env
VITE_SUPABASE_DEBUG=true
```

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Auth Guide](https://supabase.com/docs/guides/auth)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Google OAuth Setup](https://supabase.com/docs/guides/auth/social-login/auth-google)

## ✅ Migration Checklist

- [ ] Supabase project created
- [ ] Database schema deployed
- [ ] Authentication providers configured
- [ ] Environment variables set
- [ ] Local testing completed
- [ ] Production deployment successful
- [ ] Data security verified
- [ ] Firebase cleanup completed

## 🎉 Success!

Your Job Application Tracker has been successfully migrated from Firebase to Supabase! The application now uses:

- **Supabase Auth** for user authentication
- **PostgreSQL** for data storage
- **Row Level Security** for data isolation
- **Google OAuth** for social login
- **Real-time capabilities** for live updates

The UI remains unchanged, providing a seamless experience for your users while benefiting from Supabase's powerful backend infrastructure.
