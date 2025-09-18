# Vercel Deployment Guide

This guide will walk you through deploying your Job Application Tracker to Vercel.

## Prerequisites

- Firebase project configured (see FIREBASE_SETUP.md)
- Git repository with your code
- Vercel account (free tier available)

## Step 1: Prepare Your Project

1. **Ensure your project builds successfully locally:**
   ```bash
   npm run build
   ```

2. **Test your application locally:**
   ```bash
   npm start
   ```

3. **Verify all features work:**
   - User registration and login
   - Job application CRUD operations
   - Search and filtering
   - Responsive design

## Step 2: Push to Git Repository

1. **Initialize git repository (if not already done):**
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Job Application Tracker"
   ```

2. **Create a repository on GitHub/GitLab/Bitbucket**

3. **Push your code:**
   ```bash
   git remote add origin <your-repository-url>
   git push -u origin main
   ```

## Step 3: Deploy to Vercel

### Option A: Deploy via Vercel Dashboard

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "New Project"
3. Import your Git repository
4. Vercel will automatically detect it's a React app
5. Configure environment variables (see Step 4)
6. Click "Deploy"

### Option B: Deploy via Vercel CLI

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel:**
   ```bash
   vercel login
   ```

3. **Deploy:**
   ```bash
   vercel
   ```

4. **Follow the prompts:**
   - Set up and deploy? `Y`
   - Which scope? Choose your account
   - Link to existing project? `N`
   - Project name: `job-tracker` (or your preferred name)
   - Directory: `./` (current directory)
   - Override settings? `N`

## Step 4: Configure Environment Variables

1. **In Vercel Dashboard:**
   - Go to your project
   - Click "Settings" tab
   - Click "Environment Variables"
   - Add each Firebase configuration variable:

   ```
   REACT_APP_FIREBASE_API_KEY = your-firebase-api-key
   REACT_APP_FIREBASE_AUTH_DOMAIN = your-project.firebaseapp.com
   REACT_APP_FIREBASE_PROJECT_ID = your-project-id
   REACT_APP_FIREBASE_STORAGE_BUCKET = your-project.appspot.com
   REACT_APP_FIREBASE_MESSAGING_SENDER_ID = your-sender-id
   REACT_APP_FIREBASE_APP_ID = your-app-id
   ```

2. **Via Vercel CLI:**
   ```bash
   vercel env add REACT_APP_FIREBASE_API_KEY
   vercel env add REACT_APP_FIREBASE_AUTH_DOMAIN
   vercel env add REACT_APP_FIREBASE_PROJECT_ID
   vercel env add REACT_APP_FIREBASE_STORAGE_BUCKET
   vercel env add REACT_APP_FIREBASE_MESSAGING_SENDER_ID
   vercel env add REACT_APP_FIREBASE_APP_ID
   ```

## Step 5: Update Firebase Authorized Domains

1. **Get your Vercel deployment URL:**
   - It will be something like `https://your-project.vercel.app`

2. **Add to Firebase Console:**
   - Go to Firebase Console > Authentication > Settings
   - Scroll to "Authorized domains"
   - Add your Vercel domain (e.g., `your-project.vercel.app`)

## Step 6: Redeploy with Environment Variables

1. **Trigger a new deployment:**
   ```bash
   vercel --prod
   ```

2. **Or push a new commit:**
   ```bash
   git commit --allow-empty -m "Trigger deployment with env vars"
   git push
   ```

## Step 7: Verify Deployment

1. **Visit your deployed URL**
2. **Test all functionality:**
   - [ ] User registration works
   - [ ] User login works
   - [ ] Password reset works
   - [ ] Job applications can be created
   - [ ] Job applications can be edited
   - [ ] Job applications can be deleted
   - [ ] Search and filtering work
   - [ ] Responsive design works on mobile
   - [ ] User data isolation works (users only see their own data)

## Step 8: Custom Domain (Optional)

1. **In Vercel Dashboard:**
   - Go to your project
   - Click "Settings" > "Domains"
   - Add your custom domain
   - Follow DNS configuration instructions

2. **Update Firebase authorized domains** with your custom domain

## Deployment Verification Checklist

### Authentication
- [ ] New users can register
- [ ] Existing users can log in
- [ ] Password reset emails are sent
- [ ] Users are redirected to dashboard after login
- [ ] Users are redirected to login when not authenticated

### Job Management
- [ ] Users can add new job applications
- [ ] Users can edit existing job applications
- [ ] Users can delete job applications
- [ ] Form validation works correctly
- [ ] All job fields are saved and displayed

### Search and Filtering
- [ ] Search by company name works
- [ ] Search by position works
- [ ] Search by notes works
- [ ] Filter by status works
- [ ] Date range filtering works
- [ ] Clear filters works

### Data Security
- [ ] Users can only see their own job applications
- [ ] Users cannot access other users' data
- [ ] All CRUD operations respect user ownership

### UI/UX
- [ ] Application is responsive on mobile
- [ ] Application is responsive on tablet
- [ ] Application is responsive on desktop
- [ ] Loading states are shown appropriately
- [ ] Error messages are user-friendly
- [ ] Success messages are shown

## Troubleshooting

### Build Failures
- Check that all dependencies are in `package.json`
- Verify TypeScript compilation passes
- Check for any linting errors

### Runtime Errors
- Check browser console for errors
- Verify environment variables are set correctly
- Check Firebase configuration

### Authentication Issues
- Verify Firebase authorized domains include your Vercel domain
- Check that Email/Password authentication is enabled
- Verify API keys are correct

### Database Issues
- Check Firestore security rules
- Verify database is in the correct region
- Check that collections are created properly

## Performance Optimization

1. **Enable Vercel Analytics** (optional)
2. **Set up Vercel Speed Insights** (optional)
3. **Configure caching headers** in `vercel.json`
4. **Optimize images** if you add any
5. **Use Vercel's Edge Functions** for server-side logic if needed

## Monitoring and Maintenance

1. **Set up monitoring:**
   - Vercel Analytics
   - Firebase Performance Monitoring
   - Error tracking (Sentry, etc.)

2. **Regular maintenance:**
   - Update dependencies
   - Monitor Firebase usage
   - Review security rules
   - Check for any security vulnerabilities

## Support

If you encounter issues:
1. Check Vercel deployment logs
2. Check browser console for errors
3. Verify Firebase configuration
4. Check Vercel documentation
5. Check Firebase documentation

## Next Steps

After successful deployment:
1. Share your application with potential users
2. Gather feedback and iterate
3. Add new features as needed
4. Monitor usage and performance
5. Consider upgrading to paid plans if needed
