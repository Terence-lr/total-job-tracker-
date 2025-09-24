import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

// Define the shape of our context
interface AuthContextType {
  user: User | null;
  session: Session | null;
  signup: (email: string, password: string, displayName: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  loading: boolean;
  error: string | null;
  success: string | null;
  clearError: () => void;
  clearSuccess: () => void;
}

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Auth Provider component
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Clear error function
  const clearError = () => setError(null);
  
  // Clear success function
  const clearSuccess = () => setSuccess(null);

  // Helper function to handle Supabase auth errors
  const getErrorMessage = (error: any): string => {
    if (error.message) {
      if (error.message.includes('already registered')) {
        return 'This email is already registered. Please try logging in instead.';
      }
      if (error.message.includes('Invalid login credentials')) {
        return 'Invalid email or password. Please try again.';
      }
      if (error.message.includes('Password should be at least')) {
        return 'Password should be at least 6 characters long.';
      }
      if (error.message.includes('Invalid email')) {
        return 'Please enter a valid email address.';
      }
      if (error.message.includes('Too many requests')) {
        return 'Too many failed attempts. Please try again later.';
      }
      return error.message;
    }
    return 'An error occurred. Please try again.';
  };

  // Sign up function
  const signup = async (email: string, password: string, displayName: string): Promise<void> => {
    try {
      setError(null);
      setSuccess(null);
      setLoading(true);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: displayName,
          },
        },
      });

      if (error) throw error;
      
      console.log('User signed up successfully:', data.user?.id);
      
      // Show success message for email confirmation
      if (data.user && !data.user.email_confirmed_at) {
        setSuccess('Account created successfully! Please check your email inbox to confirm your account before signing in.');
      }
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      setError(errorMessage);
      console.error('Signup error:', error);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Login function
  const login = async (email: string, password: string): Promise<void> => {
    try {
      setError(null);
      setLoading(true);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      
      console.log('User logged in successfully:', data.user?.id);
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      setError(errorMessage);
      console.error('Login error:', error);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };


  // Logout function
  const logout = async (): Promise<void> => {
    try {
      setError(null);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      console.log('User logged out successfully');
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      setError(errorMessage);
      console.error('Logout error:', error);
      throw new Error(errorMessage);
    }
  };

  // Reset password function
  const resetPassword = async (email: string): Promise<void> => {
    try {
      setError(null);
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) throw error;
      
      console.log('Password reset email sent successfully');
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      setError(errorMessage);
      console.error('Password reset error:', error);
      throw new Error(errorMessage);
    }
  };

  // Set up auth state listener
  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      
      if (session?.user) {
        console.log('User authenticated:', session.user.id, session.user.email);
      } else {
        console.log('User not authenticated');
      }
    });

    // Cleanup subscription on unmount
    return () => subscription.unsubscribe();
  }, []);

  const value: AuthContextType = {
    user,
    session,
    signup,
    login,
    logout,
    resetPassword,
    loading,
    error,
    success,
    clearError,
    clearSuccess
  };

  return (
    <AuthContext.Provider value={value}>
      {loading ? (
        <div className="min-h-screen bg-black flex items-center justify-center">
          <div className="text-white text-lg">Loading...</div>
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
};
