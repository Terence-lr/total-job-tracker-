import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { AlertCircle } from 'lucide-react';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const { login, error, clearError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    // Check for success message from email confirmation
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      // Clear the state to prevent showing the message again on refresh
      navigate(location.pathname, { replace: true });
    }
  }, [location, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      return;
    }

    try {
      setIsLoading(true);
      clearError();
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      // Error is handled by the auth context
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <main className="container section--tight">
      <div className="login-wrap">
        <div className="card login-card stack" style={{["--stack-gap" as any]:"24px"}}>
          <h1 className="login-title text-center text-3xl font-extrabold text-var(--text)">
            Sign in to your account
          </h1>
          <p className="login-sub text-center text-var(--muted)">
            Or{' '}
            <Link
              to="/signup"
              className="font-medium text-var(--accent) hover:text-var(--accent-2) link-underline"
            >
              create a new account
            </Link>
          </p>
          
          <form className="stack" style={{["--stack-gap" as any]:"24px"}} onSubmit={handleSubmit}>
            {error && (
              <div className="card p-4 border-var(--err)">
                <div className="flex">
                  <AlertCircle className="h-5 w-5 text-var(--err)" />
                  <div className="ml-3">
                    <p className="text-sm text-var(--err)">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {successMessage && (
              <div className="card p-4 border-var(--ok)">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-var(--ok)" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-var(--ok)">{successMessage}</p>
                  </div>
                </div>
              </div>
            )}
            
            <div className="form-group">
              <label htmlFor="email">Email address</label>
              <div className="input">
                <span className="input__icon">📧</span>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                />
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="input" style={{ gridTemplateColumns: '28px 1fr 28px' }}>
                <span className="input__icon">🔒</span>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  className="input__icon cursor-halo"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="text-sm">
                <Link
                  to="/forgot-password"
                  className="font-medium text-var(--accent) hover:text-var(--accent-2) link-underline"
                >
                  Forgot your password?
                </Link>
              </div>
            </div>

            <div className="btn-row">
              <button
                type="submit"
                disabled={isLoading || !email || !password}
                className="btn btn-primary cursor-halo disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Signing in...
                  </div>
                ) : (
                  'Sign in'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
};

export default Login;
