# Job Application Tracker

A professional, full-stack job application tracking application built with React, TypeScript, Firebase, and deployed on Vercel. Track your job applications with ease and maintain a comprehensive record of your job search progress.

## 🚀 Features

- **User Authentication**: Secure email/password authentication with Firebase Auth
- **Job Application Management**: Create, read, update, and delete job applications
- **Advanced Filtering**: Filter by status, search by company/position, date range filtering
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **User Data Isolation**: Each user can only access their own job applications
- **Professional UI**: Clean, modern interface suitable for portfolio demonstration
- **Real-time Updates**: Instant updates when managing job applications
- **Password Reset**: Secure password reset functionality

## 🛠️ Tech Stack

- **Frontend**: React 18 with TypeScript
- **Styling**: Tailwind CSS
- **Authentication**: Firebase Auth
- **Database**: Cloud Firestore
- **Icons**: Lucide React
- **Routing**: React Router v6
- **Deployment**: Vercel
- **Build Tool**: Create React App

## 📋 Job Application Fields

Each job application tracks:
- Company name
- Position title
- Application date
- Current status (Applied, Interview, Offer, Rejected, Withdrawn)
- Salary information
- Job posting URL
- Personal notes
- Automatic timestamps (created/updated)

## 🚀 Quick Start

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Firebase account
- Git

### Installation

1. **Clone the repository:**
   ```bash
   git clone <your-repository-url>
   cd job-tracker
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up Firebase:**
   - Follow the detailed guide in [FIREBASE_SETUP.md](./FIREBASE_SETUP.md)
   - Copy `env.example` to `.env` and fill in your Firebase configuration

4. **Start the development server:**
   ```bash
   npm start
   ```

5. **Open your browser:**
   Navigate to `http://localhost:3000`

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory with your Firebase configuration:

```env
REACT_APP_FIREBASE_API_KEY=your-api-key
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=123456789
REACT_APP_FIREBASE_APP_ID=your-app-id
```

### Firebase Security Rules

Ensure your Firestore security rules are configured correctly:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /jobApplications/{document} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }
  }
}
```

## 📱 Usage

### Getting Started

1. **Create an Account**: Sign up with your email and password
2. **Add Job Applications**: Click "Add Job Application" to start tracking
3. **Update Status**: Edit applications to update their status as you progress
4. **Search and Filter**: Use the search bar and filters to find specific applications
5. **Track Progress**: Monitor your job search statistics on the dashboard

### Key Features

- **Dashboard Overview**: See statistics for all your applications
- **Status Tracking**: Track applications through different stages
- **Search Functionality**: Find applications by company, position, or notes
- **Date Filtering**: Filter applications by application date range
- **Responsive Design**: Access your tracker on any device

## 🚀 Deployment

### Deploy to Vercel

1. **Follow the deployment guide**: [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md)
2. **Configure environment variables** in Vercel dashboard
3. **Update Firebase authorized domains** with your Vercel URL
4. **Test all functionality** on the deployed site

### Build for Production

```bash
npm run build
```

This creates an optimized production build in the `build` folder.

## 🧪 Testing

Run the test suite:

```bash
npm test
```

## 📁 Project Structure

```
src/
├── components/
│   ├── auth/           # Authentication components
│   ├── jobs/           # Job application components
│   ├── Dashboard.tsx   # Main dashboard
│   └── ProtectedRoute.tsx
├── contexts/
│   └── AuthContext.tsx # Authentication context
├── firebase/
│   └── config.ts       # Firebase configuration
├── services/
│   └── jobService.ts   # Firestore operations
├── types/
│   └── job.ts          # TypeScript interfaces
├── App.tsx             # Main app component
└── index.tsx           # App entry point
```

## 🔒 Security Features

- **User Authentication**: Secure Firebase Auth integration
- **Data Isolation**: Users can only access their own data
- **Input Validation**: Client-side form validation
- **Error Handling**: Comprehensive error handling and user feedback
- **Security Rules**: Firestore security rules prevent unauthorized access

## 🎨 UI/UX Features

- **Modern Design**: Clean, professional interface
- **Responsive Layout**: Works on all device sizes
- **Loading States**: Visual feedback during operations
- **Error Messages**: Clear, actionable error messages
- **Success Feedback**: Confirmation messages for actions
- **Accessibility**: Keyboard navigation and screen reader support

## 🐛 Troubleshooting

### Common Issues

1. **Authentication Errors**: Check Firebase configuration and authorized domains
2. **Build Failures**: Ensure all dependencies are installed
3. **Database Errors**: Verify Firestore security rules
4. **Deployment Issues**: Check environment variables in Vercel

### Getting Help

- Check the browser console for error messages
- Verify Firebase configuration
- Review the setup guides
- Check Firebase and Vercel documentation

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- Firebase for authentication and database services
- Vercel for hosting and deployment
- React team for the amazing framework
- Tailwind CSS for the utility-first CSS framework
- Lucide for the beautiful icons

## 📞 Support

If you encounter any issues or have questions:

1. Check the troubleshooting section
2. Review the setup guides
3. Check the browser console for errors
4. Verify your Firebase configuration

---

**Happy job hunting! 🎯**