import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { CheckCircle, AlertCircle, Loader } from 'lucide-react';

const EmailConfirmation: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const handleEmailConfirmation = async () => {
      try {
        const token = searchParams.get('token');
        const type = searchParams.get('type');

        if (!token || type !== 'signup') {
          setStatus('error');
          setMessage('Invalid confirmation link. Please try signing up again.');
          return;
        }

        // Verify the email confirmation token
        const { data, error } = await supabase.auth.verifyOtp({
          token_hash: token,
          type: 'signup'
        });

        if (error) {
          console.error('Email confirmation error:', error);
          setStatus('error');
          setMessage('Email confirmation failed. The link may have expired or already been used.');
          return;
        }

        if (data.user) {
          setStatus('success');
          setMessage('Email confirmed successfully! You can now sign in to your account.');
          
          // Redirect to login page after 3 seconds
          setTimeout(() => {
            navigate('/login', { 
              state: { 
                message: 'Email confirmed successfully! You can now sign in.' 
              } 
            });
          }, 3000);
        }
      } catch (error) {
        console.error('Email confirmation error:', error);
        setStatus('error');
        setMessage('An unexpected error occurred. Please try again.');
      }
    };

    handleEmailConfirmation();
  }, [searchParams, navigate]);

  const getStatusIcon = () => {
    switch (status) {
      case 'loading':
        return <Loader className="h-12 w-12 text-indigo-600 animate-spin" />;
      case 'success':
        return <CheckCircle className="h-12 w-12 text-green-600" />;
      case 'error':
        return <AlertCircle className="h-12 w-12 text-red-600" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'loading':
        return 'text-indigo-600';
      case 'success':
        return 'text-green-600';
      case 'error':
        return 'text-red-600';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            {getStatusIcon()}
          </div>
          
          <h2 className={`text-2xl font-bold ${getStatusColor()}`}>
            {status === 'loading' && 'Confirming your email...'}
            {status === 'success' && 'Email Confirmed!'}
            {status === 'error' && 'Confirmation Failed'}
          </h2>
          
          <p className="mt-4 text-gray-600">
            {message}
          </p>

          {status === 'success' && (
            <p className="mt-2 text-sm text-gray-500">
              Redirecting to sign in page in 3 seconds...
            </p>
          )}

          {status === 'error' && (
            <div className="mt-6 space-y-3">
              <button
                onClick={() => navigate('/signup')}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Try Signing Up Again
              </button>
              
              <button
                onClick={() => navigate('/login')}
                className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Go to Sign In
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmailConfirmation;
