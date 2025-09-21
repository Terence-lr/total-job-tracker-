import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Briefcase, BarChart3, Plus } from 'lucide-react';
import UserMenu from './UserMenu';
import MobileNavigation from '../features/responsive/MobileNavigation';
import clsx from 'clsx';

const ProfessionalNavigation: React.FC = () => {
  const location = useLocation();

  const NavLink: React.FC<{ href: string; children: React.ReactNode; icon?: React.ReactNode }> = ({ 
    href, 
    children, 
    icon 
  }) => {
    const isActive = location.pathname === href;
    
    return (
      <Link
        to={href}
        className={clsx(
          'flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors',
          isActive
            ? 'bg-red-900/30 text-red-400'
            : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
        )}
      >
        {icon && <span className="w-4 h-4">{icon}</span>}
        <span>{children}</span>
      </Link>
    );
  };

  return (
    <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-md border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center space-x-4 lg:space-x-8">
            <Link 
              to="/dashboard" 
              className="flex items-center space-x-2 text-lg sm:text-xl font-bold text-white min-w-0"
            >
              <Briefcase className="w-5 h-5 sm:w-6 sm:h-6 text-red-600 flex-shrink-0" />
              <span className="truncate">JobTracker Pro</span>
            </Link>
            <nav className="hidden md:flex space-x-1">
              <NavLink href="/dashboard" icon={<BarChart3 />}>
                Dashboard
              </NavLink>
              <NavLink href="/jobs" icon={<Briefcase />}>
                Applications
              </NavLink>
              <NavLink href="/analytics" icon={<BarChart3 />}>
                Analytics
              </NavLink>
            </nav>
          </div>
          
          <div className="flex items-center space-x-2 sm:space-x-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="hidden sm:flex items-center space-x-2 bg-red-600 text-white px-3 sm:px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden lg:inline">Add Job</span>
            </motion.button>
            <MobileNavigation />
            <UserMenu />
          </div>
        </div>
      </div>
    </header>
  );
};

export default ProfessionalNavigation;
