import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Briefcase, BarChart3, Plus } from 'lucide-react';
import UserMenu from './UserMenu';
import MobileNavigation from './responsive/MobileNavigation';
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
            ? 'bg-blue-100 text-blue-700'
            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
        )}
      >
        {icon && <span className="w-4 h-4">{icon}</span>}
        <span>{children}</span>
      </Link>
    );
  };

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center space-x-8">
            <Link 
              to="/dashboard" 
              className="flex items-center space-x-2 text-xl font-bold text-gray-900"
            >
              <Briefcase className="w-6 h-6 text-blue-600" />
              <span>JobTracker Pro</span>
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
          
          <div className="flex items-center space-x-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="hidden sm:flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add Job</span>
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
