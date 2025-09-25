import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';
import { CheckCircle, AlertCircle, Loader } from 'lucide-react';

const EmailConfirmation: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const handleEmailConfirmation = async () => {
      try {
        // Get URL parameters - Supabase uses different parameter names
        const access_token = searchParams.get('access_token');
        const refresh_token = searchParams.get('refresh_token');
        const type = searchParams.get('type');
        const token_hash = searchParams.get('token_hash');

        // Also check URL fragment (hash) for tokens
        const hash = window.location.hash;
        const hashParams = new URLSearchParams(hash.substring(1));
        const hashAccessToken = hashParams.get('access_token');
        const hashRefreshToken = hashParams.get('refresh_token');
        const hashType = hashParams.get('type');

        console.log('Email confirmation params:', { 
          access_token, 
          refresh_token, 
          type, 
          token_hash,
          hashAccessToken,
          hashRefreshToken,
          hashType,
          fullHash: hash
        });

        // Handle different Supabase confirmation URL formats
        // Check both query params and hash params
        const finalAccessToken = access_token || hashAccessToken;
        const finalRefreshToken = refresh_token || hashRefreshToken;
        const finalType = type || hashType;

        if (finalAccessToken && finalRefreshToken) {
          // Modern Supabase format - tokens are in URL (either query or hash)
          const { data, error } = await supabase.auth.setSession({
            access_token: finalAccessToken,
            refresh_token: finalRefreshToken
          });

          if (error) {
            console.error('Session error:', error);
            setStatus('error');
            setMessage('Email confirmation failed. The link may have expired or already been used.');
            return;
          }

          if (data.user) {
            setStatus('success');
            setMessage('Email confirmed successfully! You can now sign in to your account.');
            
            // Redirect to success page after 1 second
            setTimeout(() => {
              console.log('Redirecting to success page...');
              navigate('/email-confirmed-success');
            }, 1000);
          }
        } else if (token_hash && finalType === 'signup') {
          // Legacy format - verify OTP
          const { data, error } = await supabase.auth.verifyOtp({
            token_hash,
            type: 'signup'
          });

          if (error) {
            console.error('OTP verification error:', error);
            setStatus('error');
            setMessage('Email confirmation failed. The link may have expired or already been used.');
            return;
          }

          if (data.user) {
            setStatus('success');
            setMessage('Email confirmed successfully! You can now sign in to your account.');
            
            // Redirect to success page after 1 second
            setTimeout(() => {
              console.log('Redirecting to success page...');
              navigate('/email-confirmed-success');
            }, 1000);
          }
        } else {
          setStatus('error');
          setMessage('Invalid confirmation link. Please try signing up again.');
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
    <div className="min-h-screen flex items-center justify-center bg-black py-6 sm:py-12 px-3 sm:px-4 lg:px-8">
      <div className="max-w-md w-full space-y-6 sm:space-y-8">
        <div className="bg-gray-900 rounded-xl p-4 sm:p-6 lg:p-8 border border-gray-700 shadow-2xl">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              {getStatusIcon()}
            </div>
            
            <h2 className={`text-2xl sm:text-3xl font-extrabold ${getStatusColor()}`}>
              {status === 'loading' && 'Confirming your email...'}
              {status === 'success' && 'Email Confirmed!'}
              {status === 'error' && 'Confirmation Failed'}
            </h2>
            
            <p className="mt-4 text-sm sm:text-base text-gray-400 leading-relaxed">
              {message}
            </p>

            {status === 'success' && (
              <div className="mt-6 space-y-4">
                <p className="text-xs sm:text-sm text-gray-500">
                  Redirecting to sign in page in 3 seconds...
                </p>
                
                <button
                  onClick={() => navigate('/login', { 
                    state: { 
                      message: 'Email confirmed successfully! You can now sign in.' 
                    } 
                  })}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2.5 sm:py-3 px-4 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-900 min-h-[48px] text-sm sm:text-base"
                >
                  Continue to Sign In
                </button>
              </div>
            )}

            {status === 'error' && (
              <div className="mt-6 space-y-3">
                <button
                  onClick={() => navigate('/signup')}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2.5 sm:py-3 px-4 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-900 min-h-[48px] text-sm sm:text-base"
                >
                  Try Signing Up Again
                </button>
                
                <button
                  onClick={() => navigate('/login')}
                  className="w-full bg-gray-800 hover:bg-gray-700 text-white font-semibold py-2.5 sm:py-3 px-4 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-gray-900 min-h-[48px] text-sm sm:text-base"
                >
                  Go to Sign In
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailConfirmation;
