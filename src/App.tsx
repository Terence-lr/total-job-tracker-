import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import { Layout } from './components/Layout';
import Welcome from './pages/Welcome';
import Login from './components/features/auth/Login';
import Signup from './components/features/auth/Signup';
import ForgotPassword from './components/features/auth/ForgotPassword';
import EmailConfirmation from './components/features/auth/EmailConfirmation';
import EnhancedDashboard from './components/EnhancedDashboard';
import Profile from './components/Profile';
import { Applications } from './pages/Applications';
import { Settings } from './pages/Settings';
import Footer from './components/layouts/Footer';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App min-h-screen bg-black flex flex-col">
          <Routes>
            <Route path="/welcome" element={<Welcome />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/auth/callback" element={<EmailConfirmation />} />
            <Route element={<Layout />}>
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <EnhancedDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/applications" 
                element={
                  <ProtectedRoute>
                    <Applications />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/analytics" 
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
              <Route 
                path="/settings" 
                element={
                  <ProtectedRoute>
                    <Settings />
                  </ProtectedRoute>
                } 
              />
            </Route>
            <Route path="/" element={<Navigate to="/welcome" />} />
          </Routes>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
