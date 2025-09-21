import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Welcome from './components/Welcome';
import Login from './components/features/auth/Login';
import Signup from './components/features/auth/Signup';
import ForgotPassword from './components/features/auth/ForgotPassword';
import EmailConfirmation from './components/features/auth/EmailConfirmation';
import EnhancedDashboard from './components/EnhancedDashboard';
import Profile from './components/Profile';
import Footer from './components/layouts/Footer';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App min-h-screen bg-var(--bg) flex flex-col">
          <Routes>
            <Route path="/welcome" element={<Welcome />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/auth/callback" element={<EmailConfirmation />} />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <EnhancedDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } 
            />
            <Route path="/" element={<Navigate to="/welcome" />} />
          </Routes>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
