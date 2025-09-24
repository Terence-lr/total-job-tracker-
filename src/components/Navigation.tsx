import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Briefcase, User, LogOut, Plus, Moon, Sun } from 'lucide-react';

interface NavigationProps {
  onAddJob?: () => void;
}

const Navigation: React.FC<NavigationProps> = ({ onAddJob }) => {
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true); // Default to dark mode

  const handleLogout = async () => {
    try {
      await logout();
      setIsMobileMenuOpen(false);
    } catch (err) {
      console.error('Error logging out:', err);
    }
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    // Theme toggle logic can be extended here
  };

  return (
    <header className="bg-var(--panel) border-b border-var(--border) sticky top-0 z-50">
      <div className="container">
        <div className="flex justify-between items-center py-4">
          {/* Logo and Title */}
          <Link to="/dashboard" className="flex items-center space-x-3 cursor-halo">
            <Briefcase className="h-8 w-8 text-var(--accent)" />
            <h1 className="text-xl font-bold text-var(--text)">Job Tracker</h1>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {onAddJob && (
              <button
                onClick={onAddJob}
                className="btn btn-primary cursor-halo"
              >
                <Plus className="h-4 w-4" />
                Add Job
              </button>
            )}
            
            <button
              onClick={toggleTheme}
              className="btn btn-ghost cursor-halo"
              aria-label="Toggle theme"
            >
              {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            
            <div className="flex items-center text-sm text-var(--muted) px-3 py-2">
              <User className="h-4 w-4 mr-2" />
              <span className="truncate max-w-32">
                {user?.user_metadata?.display_name || user?.email}
              </span>
            </div>
            
            <button
              onClick={handleLogout}
              className="btn btn-ghost cursor-halo"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 cursor-halo"
            aria-label="Toggle mobile menu"
            aria-expanded={isMobileMenuOpen}
          >
            <div className="hamburger" aria-expanded={isMobileMenuOpen}>
              <div className="hamburger-bar"></div>
              <div className="hamburger-bar"></div>
              <div className="hamburger-bar"></div>
            </div>
          </button>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-var(--border) py-4">
            <div className="space-y-3">
              {onAddJob && (
                <button
                  onClick={() => {
                    onAddJob();
                    setIsMobileMenuOpen(false);
                  }}
                  className="btn btn-primary w-full cursor-halo"
                >
                  <Plus className="h-4 w-4" />
                  Add Job
                </button>
              )}
              
              <button
                onClick={toggleTheme}
                className="btn btn-ghost w-full cursor-halo"
              >
                {isDarkMode ? <Sun className="h-4 w-4 mr-2" /> : <Moon className="h-4 w-4 mr-2" />}
                {isDarkMode ? 'Light Mode' : 'Dark Mode'}
              </button>
              
              <div className="flex items-center text-sm text-var(--muted) px-3 py-2 border-t border-var(--border) pt-3">
                <User className="h-4 w-4 mr-2" />
                <span className="truncate">
                  {user?.user_metadata?.display_name || user?.email}
                </span>
              </div>
              
              <button
                onClick={handleLogout}
                className="btn btn-ghost w-full cursor-halo"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navigation;


