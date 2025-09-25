import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { Mail, Lock, User, Eye, EyeOff, AlertCircle } from 'lucide-react';

const Signup: React.FC = () => {
  const [formData, setFormData] = useState({
    displayName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const { signup, error, success, clearError, clearSuccess } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      return;
    }

    if (!formData.displayName || !formData.email || !formData.password) {
      return;
    }

    try {
      setIsLoading(true);
      clearError();
      clearSuccess();
      await signup(formData.email, formData.password, formData.displayName);
      // Don't navigate immediately - let user see the success message
    } catch (err) {
      // Error is handled by the auth context
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = formData.displayName && formData.email && formData.password && 
                     formData.confirmPassword && formData.password === formData.confirmPassword;

  return (
    <div className="min-h-screen flex items-center justify-center bg-black py-6 sm:py-12 px-3 sm:px-4 lg:px-8">
      <div className="max-w-md w-full space-y-6 sm:space-y-8">
        <div className="bg-gray-900 rounded-xl p-4 sm:p-6 lg:p-8 border border-gray-700 shadow-2xl">
          <div className="text-center">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight mb-3">
              Create your account
            </h2>
            <p className="text-sm sm:text-base text-gray-400 leading-relaxed">
              Or{' '}
              <Link
                to="/login"
                className="font-medium text-red-400 hover:text-red-300 transition-colors duration-200 underline underline-offset-2"
              >
                sign in to your existing account
              </Link>
            </p>
          </div>
          
          <form className="mt-6 sm:mt-8 space-y-4 sm:space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-3 sm:p-4 mb-4">
                <div className="flex items-start">
                  <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <div className="ml-2 sm:ml-3 min-w-0 flex-1">
                    <p className="text-xs sm:text-sm text-red-300 break-words leading-relaxed">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {success && (
              <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-3 sm:p-4 mb-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-0.5">
                    <svg className="h-4 w-4 sm:h-5 sm:w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-2 sm:ml-3 min-w-0 flex-1">
                    <p className="text-xs sm:text-sm text-green-300 break-words leading-relaxed">{success}</p>
                    <div className="mt-2">
                      <button
                        type="button"
                        onClick={() => navigate('/login')}
                        className="text-xs sm:text-sm font-medium text-green-400 hover:text-green-300 transition-colors duration-200 underline underline-offset-2"
                      >
                        Go to Sign In →
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div className="space-y-4 sm:space-y-6">
              <div>
                <label htmlFor="displayName" className="block text-sm font-medium text-gray-300 mb-2 leading-tight">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                    <User className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 flex-shrink-0" />
                  </div>
                  <input
                    id="displayName"
                    name="displayName"
                    type="text"
                    autoComplete="name"
                    required
                    value={formData.displayName}
                    onChange={handleChange}
                    className="w-full px-3 py-2.5 sm:py-3 pl-10 sm:pl-12 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm sm:text-base leading-normal"
                    placeholder="Enter your full name"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2 leading-tight">
                  Email address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                    <Mail className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 flex-shrink-0" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-3 py-2.5 sm:py-3 pl-10 sm:pl-12 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm sm:text-base leading-normal"
                    placeholder="Enter your email"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2 leading-tight">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                    <Lock className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 flex-shrink-0" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full px-3 py-2.5 sm:py-3 pl-10 sm:pl-12 pr-10 sm:pr-12 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm sm:text-base leading-normal"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-gray-300 transition-colors duration-200 min-w-[44px] min-h-[44px] z-20"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 flex-shrink-0" />
                    ) : (
                      <Eye className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 flex-shrink-0" />
                    )}
                  </button>
                </div>
                {formData.password && formData.password.length < 6 && (
                  <p className="mt-1 text-xs sm:text-sm text-red-400 leading-relaxed">Password must be at least 6 characters long</p>
                )}
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2 leading-tight">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                    <Lock className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 flex-shrink-0" />
                  </div>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full px-3 py-2.5 sm:py-3 pl-10 sm:pl-12 pr-10 sm:pr-12 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm sm:text-base leading-normal"
                    placeholder="Confirm your password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-gray-300 transition-colors duration-200 min-w-[44px] min-h-[44px] z-20"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 flex-shrink-0" />
                    ) : (
                      <Eye className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 flex-shrink-0" />
                    )}
                  </button>
                </div>
                {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                  <p className="mt-1 text-xs sm:text-sm text-red-400 leading-relaxed">Passwords do not match</p>
                )}
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading || !isFormValid}
                className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold py-3 sm:py-3.5 px-4 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 text-sm sm:text-base leading-normal min-h-[48px]"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2 flex-shrink-0"></div>
                    <span className="text-sm sm:text-base leading-normal">Creating account...</span>
                  </div>
                ) : (
                  <span className="leading-normal">Create account</span>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Signup;
