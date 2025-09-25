import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, ArrowRight } from 'lucide-react';

const EmailConfirmedSuccess: React.FC = () => {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    // Start countdown timer
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate('/login', { 
            state: { 
              message: 'Email confirmed successfully! You can now sign in.' 
            } 
          });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate]);

  const handleContinueNow = () => {
    navigate('/login', { 
      state: { 
        message: 'Email confirmed successfully! You can now sign in.' 
      } 
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black py-6 sm:py-12 px-3 sm:px-4 lg:px-8">
      <div className="max-w-md w-full space-y-6 sm:space-y-8">
        <div className="bg-gray-900 rounded-xl p-6 sm:p-8 lg:p-10 border border-gray-700 shadow-2xl">
          <div className="text-center">
            {/* Success Icon with Animation */}
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="w-20 h-20 sm:w-24 sm:h-24 bg-green-500/20 rounded-full flex items-center justify-center animate-pulse">
                  <CheckCircle className="w-12 h-12 sm:w-16 sm:h-16 text-green-500" />
                </div>
                {/* Success Ring Animation */}
                <div className="absolute inset-0 w-20 h-20 sm:w-24 sm:h-24 border-4 border-green-500/30 rounded-full animate-ping"></div>
              </div>
            </div>
            
            {/* Success Message */}
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white mb-4">
              Email Confirmed!
            </h1>
            
            <p className="text-sm sm:text-base text-gray-400 leading-relaxed mb-6">
              Your account has been successfully verified. You can now sign in to access your job tracker.
            </p>

            {/* Countdown Timer */}
            <div className="bg-gray-800 rounded-lg p-4 mb-6 border border-gray-600">
              <p className="text-xs sm:text-sm text-gray-300 mb-2">
                Redirecting to sign in page in:
              </p>
              <div className="text-2xl sm:text-3xl font-bold text-red-500">
                {countdown}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={handleContinueNow}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 sm:py-3.5 px-4 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-900 min-h-[48px] text-sm sm:text-base flex items-center justify-center space-x-2"
              >
                <span>Continue to Sign In</span>
                <ArrowRight className="w-4 h-4" />
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
