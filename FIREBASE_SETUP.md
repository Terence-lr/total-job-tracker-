# Firebase Setup Guide

This guide will walk you through setting up Firebase for the Job Application Tracker. Follow these steps carefully to avoid authentication issues.

## Step 1: Create a New Firebase Project

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or "Add project"
3. Enter a project name (e.g., "job-tracker-app")
4. Choose whether to enable Google Analytics (optional)
5. Click "Create project"

## Step 2: Enable Authentication

1. In your Firebase project dashboard, click on "Authentication" in the left sidebar
2. Click "Get started"
3. Go to the "Sign-in method" tab
4. Click on "Email/Password" to enable it
5. Toggle "Enable" to ON
6. Click "Save"

## Step 3: Set Up Firestore Database

1. In your Firebase project dashboard, click on "Firestore Database" in the left sidebar
2. Click "Create database"
3. Choose "Start in test mode" (we'll configure security rules later)
4. Select a location for your database (choose the closest to your users)
5. Click "Done"

## Step 4: Configure Security Rules

1. In Firestore Database, go to the "Rules" tab
2. Replace the default rules with the following:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow users to read and write their own job applications
    match /jobApplications/{document} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }
  }
}
```

3. Click "Publish"

## Step 5: Get Firebase Configuration

1. In your Firebase project dashboard, click on the gear icon (⚙️) next to "Project Overview"
2. Select "Project settings"
3. Scroll down to "Your apps" section
4. Click on the web icon (</>) to add a web app
5. Enter an app nickname (e.g., "Job Tracker Web")
6. Check "Also set up Firebase Hosting" if you want (optional)
7. Click "Register app"
8. Copy the Firebase configuration object

## Step 6: Configure Environment Variables

1. In your project root, copy the `env.example` file to `.env`:
   ```bash
   cp env.example .env
   ```

2. Open the `.env` file and replace the placeholder values with your actual Firebase configuration:

```env
REACT_APP_FIREBASE_API_KEY=your-actual-api-key
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-actual-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your-actual-sender-id
REACT_APP_FIREBASE_APP_ID=your-actual-app-id
```

## Step 7: Configure Authorized Domains

1. In Firebase Console, go to Authentication > Settings
2. Scroll down to "Authorized domains"
3. Add your domains:
   - `localhost` (for development)
   - Your production domain (e.g., `your-app.vercel.app`)

## Step 8: Test Your Configuration

1. Start your development server:
   ```bash
   npm start
   ```

2. Try to create an account and log in
3. Check the browser console for any Firebase-related errors
4. Verify that you can create, read, update, and delete job applications

## Troubleshooting Common Issues

### Issue: "Firebase: Error (auth/operation-not-allowed)"
**Solution**: Make sure Email/Password authentication is enabled in Firebase Console > Authentication > Sign-in method

### Issue: "Firebase: Error (auth/invalid-api-key)"
**Solution**: Verify your API key in the `.env` file matches the one in Firebase Console

### Issue: "Firebase: Error (auth/unauthorized-domain)"
**Solution**: Add your domain to the authorized domains list in Firebase Console > Authentication > Settings

### Issue: "Firebase: Error (permission-denied)"
**Solution**: Check your Firestore security rules and ensure they match the rules provided above

### Issue: "Firebase: Error (auth/network-request-failed)"
**Solution**: Check your internet connection and verify Firebase project is active

## Security Best Practices

1. **Never commit your `.env` file** to version control
2. **Use environment variables** for all sensitive configuration
3. **Regularly review** your Firestore security rules
4. **Monitor** your Firebase usage in the console
5. **Set up billing alerts** if you expect high usage

## Next Steps

Once Firebase is configured correctly:
1. Test all authentication flows (signup, login, logout, password reset)
2. Test CRUD operations for job applications
3. Verify user data isolation (users can only see their own data)
4. Proceed with deployment to Vercel

## Support

If you encounter issues:
1. Check the browser console for detailed error messages
2. Verify all configuration values are correct
3. Ensure your Firebase project is active and not suspended
4. Check Firebase Console for any service outages
