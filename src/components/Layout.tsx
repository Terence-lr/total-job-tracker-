import React, { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Briefcase, 
  BarChart3, 
  FileText, 
  Award, 
  Plus, 
  Settings, 
  User, 
  LogOut,
  Menu,
  X,
  ChevronDown
} from 'lucide-react';

export function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [showMenu, setShowMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const navigationItems = [
    { path: '/dashboard', label: 'Dashboard', icon: Briefcase },
    { path: '/applications', label: 'Applications', icon: FileText },
    { path: '/analytics', label: 'Analytics', icon: BarChart3 },
    { path: '/job-offers', label: 'Job Offers', icon: Award },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-black">
      {/* Enhanced Navigation */}
      <nav className="bg-gray-900/95 backdrop-blur-xl border-b border-gray-800/50 sticky top-0 z-50 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo Section */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="flex items-center space-x-2"
            >
              <Link 
                to="/dashboard" 
                className="group flex items-center space-x-3 text-red-500 font-bold text-xl hover:text-red-400 transition-all duration-300 cursor-pointer"
              >
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  whileTap={{ scale: 0.95 }}
                  className="relative"
                >
                  <div className="absolute inset-0 bg-red-500/20 rounded-full blur-lg group-hover:bg-red-400/30 transition-all duration-300"></div>
                  <Briefcase className="w-8 h-8 relative z-10" />
                </motion.div>
                <motion.span 
                  className="relative group-hover:text-red-400 transition-colors duration-300"
                  whileHover={{ x: 2 }}
                >
                  JobTracker Pro
                </motion.span>
              </Link>
            </motion.div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1">
              {navigationItems.map((item, index) => {
                const Icon = item.icon;
                return (
                  <motion.div
                    key={item.path}
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <Link
                      to={item.path}
                      className={`group relative px-4 py-2 rounded-lg transition-all duration-300 ${
                        isActive(item.path)
                          ? 'text-white bg-red-600/20 border border-red-500/30'
                          : 'text-gray-300 hover:text-white hover:bg-gray-800/50'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <Icon className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
                        <span className="font-medium">{item.label}</span>
                      </div>
                      
                      {/* Hover Effect */}
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-transparent rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        whileHover={{ scale: 1.02 }}
                      />
                      
                      {/* Active Indicator */}
                      {isActive(item.path) && (
                        <motion.div
                          className="absolute bottom-0 left-1/2 w-1 h-1 bg-red-500 rounded-full"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ duration: 0.3 }}
                        />
                      )}
                    </Link>
                  </motion.div>
                );
              })}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-4">
              {/* Add Job Button */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <Link 
                  to="/dashboard?addJob=true" 
                  className="group relative bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-2.5 rounded-xl font-semibold hover:from-red-500 hover:to-red-600 transition-all duration-300 shadow-lg hover:shadow-red-500/25 cursor-pointer overflow-hidden"
                >
                  <div className="flex items-center space-x-2 relative z-10">
                    <motion.div
                      whileHover={{ rotate: 90 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Plus className="w-4 h-4" />
                    </motion.div>
                    <span>Add Job</span>
                  </div>
                  
                  {/* Shimmer Effect */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12"
                    initial={{ x: '-100%' }}
                    whileHover={{ x: '100%' }}
                    transition={{ duration: 0.6 }}
                  />
                </Link>
              </motion.div>

              {/* Settings Dropdown */}
              <div className="relative">
                <motion.button 
                  onClick={() => setShowMenu(!showMenu)}
                  className="group flex items-center space-x-2 px-4 py-2 rounded-lg text-gray-300 hover:text-white hover:bg-gray-800/50 transition-all duration-300"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Settings className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
                  <span className="hidden sm:block">Settings</span>
                  <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${showMenu ? 'rotate-180' : ''}`} />
                </motion.button>

                <AnimatePresence>
                  {showMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-2 w-56 bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-xl shadow-2xl overflow-hidden"
                    >
                      <div className="py-2">
                        <Link 
                          to="/profile" 
                          className="group flex items-center space-x-3 px-4 py-3 text-gray-300 hover:bg-gray-800/50 hover:text-white transition-all duration-300"
                          onClick={() => setShowMenu(false)}
                        >
                          <User className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
                          <span>Profile</span>
                        </Link>
                        <Link 
                          to="/settings" 
                          className="group flex items-center space-x-3 px-4 py-3 text-gray-300 hover:bg-gray-800/50 hover:text-white transition-all duration-300"
                          onClick={() => setShowMenu(false)}
                        >
                          <Settings className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
                          <span>Settings</span>
                        </Link>
                        <div className="border-t border-gray-700/50 my-1" />
                        <button 
                          onClick={() => {
                            setShowMenu(false);
                            handleSignOut();
                          }}
                          className="group flex items-center space-x-3 px-4 py-3 text-gray-300 hover:bg-red-900/50 hover:text-red-400 transition-all duration-300 w-full text-left"
                        >
                          <LogOut className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Mobile Menu Button */}
              <motion.button
                className="md:hidden p-2 text-gray-300 hover:text-white hover:bg-gray-800/50 rounded-lg transition-all duration-300"
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {showMobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </motion.button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {showMobileMenu && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden bg-gray-900/95 backdrop-blur-xl border-t border-gray-800/50"
            >
              <div className="px-4 py-4 space-y-2">
                {navigationItems.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <motion.div
                      key={item.path}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      <Link
                        to={item.path}
                        className={`group flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-300 ${
                          isActive(item.path)
                            ? 'text-white bg-red-600/20 border border-red-500/30'
                            : 'text-gray-300 hover:text-white hover:bg-gray-800/50'
                        }`}
                        onClick={() => setShowMobileMenu(false)}
                      >
                        <Icon className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                        <span className="font-medium">{item.label}</span>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Main Content */}
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Outlet />
      </motion.main>
    </div>
  );
}
