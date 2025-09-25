import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, ArrowRight, Loader2 } from 'lucide-react';

const EmailConfirmedSuccess: React.FC = () => {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(5);
  const [isRedirecting, setIsRedirecting] = useState(false);

  const redirectToLogin = useCallback(() => {
    setIsRedirecting(true);
    navigate('/login', { 
      state: { 
        message: 'Email confirmed successfully! You can now sign in.' 
      } 
    });
  }, [navigate]);

  useEffect(() => {
    // Start countdown timer
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          redirectToLogin();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [redirectToLogin]);

  const handleContinueNow = () => {
    if (isRedirecting) return;
    redirectToLogin();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black py-4 sm:py-6 lg:py-12 px-3 sm:px-4 lg:px-8">
      <div className="max-w-sm sm:max-w-md w-full space-y-4 sm:space-y-6">
        <div className="bg-gray-900 rounded-xl p-4 sm:p-6 lg:p-8 border border-gray-700 shadow-2xl">
          <div className="text-center">
            {/* Success Icon with Animation */}
            <div className="flex justify-center mb-4 sm:mb-6">
              <div className="relative">
                <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-green-500/20 rounded-full flex items-center justify-center animate-pulse">
                  <CheckCircle className="w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16 text-green-500" />
                </div>
                {/* Success Ring Animation */}
                <div className="absolute inset-0 w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 border-4 border-green-500/30 rounded-full animate-ping"></div>
              </div>
            </div>
            
            {/* Success Message */}
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white mb-3 sm:mb-4 leading-tight">
              Email Confirmed!
            </h1>
            
            <p className="text-xs sm:text-sm lg:text-base text-gray-400 leading-relaxed mb-4 sm:mb-6 px-2">
              Your account has been successfully verified. You can now sign in to access your job tracker.
            </p>

            {/* Countdown Timer */}
            <div className="bg-gray-800 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6 border border-gray-600">
              <p className="text-xs sm:text-sm text-gray-300 mb-1 sm:mb-2">
                Redirecting to sign in page in:
              </p>
              <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-red-500">
                {countdown}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 sm:space-y-3">
              <button
                onClick={handleContinueNow}
                disabled={isRedirecting}
                className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold py-2.5 sm:py-3 px-4 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-900 min-h-[44px] sm:min-h-[48px] text-sm sm:text-base flex items-center justify-center space-x-2"
              >
                {isRedirecting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Redirecting...</span>
                  </>
                ) : (
                  <>
                    <span>Continue to Sign In</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
              
              <p className="text-xs text-gray-500">
                Or wait for automatic redirect...
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailConfirmedSuccess;
