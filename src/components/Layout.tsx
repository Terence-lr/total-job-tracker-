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
      <nav className="relative bg-gradient-to-r from-gray-900/95 via-gray-900/90 to-gray-900/95 backdrop-blur-2xl border-b border-red-500/30 sticky top-0 z-50 shadow-2xl">
        {/* Enhanced Glass Effect Background */}
        <div className="absolute inset-0 bg-gradient-to-r from-red-500/8 via-transparent to-red-500/8"></div>
        
        {/* Subtle Grid Pattern */}
        <div className="absolute inset-0 opacity-15">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, rgba(239, 68, 68, 0.4) 1px, transparent 0)`,
            backgroundSize: '24px 24px'
          }}></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
          <div className="flex justify-between items-center h-20">
            {/* Enhanced Logo Section */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="flex items-center space-x-4"
            >
              <Link 
                to="/dashboard" 
                className="group relative flex items-center space-x-4 text-red-500 font-bold text-xl hover:text-red-400 transition-all duration-300 cursor-pointer p-3 rounded-xl hover:bg-red-500/10"
              >
                {/* Enhanced Glow Effect */}
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  whileTap={{ scale: 0.95 }}
                  className="relative p-2"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 to-red-400/20 rounded-full blur-lg group-hover:blur-xl transition-all duration-300"></div>
                  <Briefcase className="w-8 h-8 relative z-10 drop-shadow-lg" />
                </motion.div>
                
                <div className="flex flex-col space-y-1">
                  <motion.span 
                    className="relative group-hover:text-red-400 transition-colors duration-300 text-xl font-extrabold tracking-tight"
                    whileHover={{ x: 2 }}
                  >
                    JobTracker
                  </motion.span>
                  <motion.span 
                    className="relative text-red-400/70 text-xs font-medium tracking-wider"
                    whileHover={{ x: 2 }}
                  >
                    PROFESSIONAL
                  </motion.span>
                </div>
              </Link>
            </motion.div>

            {/* Enhanced Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-3">
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
                      className={`group relative px-6 py-3 rounded-xl transition-all duration-300 font-medium ${
                        isActive(item.path)
                          ? 'text-white bg-gradient-to-r from-red-600/25 to-red-500/15 border border-red-500/30 shadow-lg shadow-red-500/15'
                          : 'text-gray-300 hover:text-white hover:bg-gray-800/50 hover:shadow-lg'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <motion.div
                          whileHover={{ scale: 1.1, rotate: 3 }}
                          transition={{ duration: 0.2 }}
                        >
                          <Icon className="w-5 h-5 group-hover:text-red-400 transition-colors duration-300" />
                        </motion.div>
                        <span className="font-semibold tracking-wide">{item.label}</span>
                      </div>
                      
                      {/* Active Indicator */}
                      {isActive(item.path) && (
                        <motion.div
                          className="absolute -bottom-1 left-1/2 w-6 h-1 bg-gradient-to-r from-red-500 to-red-400 rounded-full shadow-lg shadow-red-500/40"
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ duration: 0.4 }}
                        />
                      )}
                    </Link>
                  </motion.div>
                );
              })}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-4">
              {/* Enhanced Add Job Button */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <Link 
                  to="/dashboard?addJob=true" 
                  className="group relative bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-3 rounded-xl font-bold hover:from-red-500 hover:to-red-600 transition-all duration-300 shadow-lg hover:shadow-red-500/30 cursor-pointer border border-red-500/20"
                >
                  <div className="flex items-center space-x-3 relative z-10">
                    <motion.div
                      whileHover={{ rotate: 90, scale: 1.1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Plus className="w-5 h-5 drop-shadow-lg" />
                    </motion.div>
                    <span className="font-semibold tracking-wide">Add Job</span>
                  </div>
                </Link>
              </motion.div>

              {/* Enhanced Settings Dropdown */}
              <div className="relative">
                <motion.button 
                  onClick={() => setShowMenu(!showMenu)}
                  className="group flex items-center space-x-3 px-5 py-3 rounded-xl text-gray-300 hover:text-white hover:bg-gray-800/50 transition-all duration-300 font-medium border border-gray-700/50 hover:border-red-500/30"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <motion.div
                    whileHover={{ rotate: 90, scale: 1.1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Settings className="w-5 h-5 group-hover:text-red-400 transition-colors duration-300" />
                  </motion.div>
                  <span className="hidden sm:block font-semibold tracking-wide">Settings</span>
                  <motion.div
                    animate={{ rotate: showMenu ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ChevronDown className="w-4 h-4 group-hover:text-red-400 transition-colors duration-300" />
                  </motion.div>
                </motion.button>

                <AnimatePresence>
                  {showMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-3 w-56 bg-gray-900/95 backdrop-blur-2xl border border-red-500/30 rounded-xl shadow-2xl overflow-hidden"
                    >
                      <div className="py-3">
                        <Link 
                          to="/settings" 
                          className="group flex items-center space-x-4 px-6 py-4 text-gray-300 hover:bg-gradient-to-r hover:from-red-500/10 hover:to-transparent hover:text-white transition-all duration-300"
                          onClick={() => setShowMenu(false)}
                        >
                          <motion.div
                            whileHover={{ scale: 1.1, rotate: 3 }}
                            transition={{ duration: 0.2 }}
                            className="p-2 rounded-lg bg-gray-800/50 group-hover:bg-red-500/20 transition-colors duration-300"
                          >
                            <Settings className="w-5 h-5 group-hover:text-red-400 transition-colors duration-300" />
                          </motion.div>
                          <div>
                            <span className="font-semibold">Settings</span>
                            <p className="text-xs text-gray-500">App preferences</p>
                          </div>
                        </Link>
                        
                        <div className="border-t border-gray-700/50 my-2" />
                        
                        <button 
                          onClick={() => {
                            setShowMenu(false);
                            handleSignOut();
                          }}
                          className="group flex items-center space-x-4 px-6 py-4 text-gray-300 hover:bg-gradient-to-r hover:from-red-900/20 hover:to-transparent hover:text-red-400 transition-all duration-300 w-full text-left"
                        >
                          <motion.div
                            whileHover={{ scale: 1.1, rotate: 3 }}
                            transition={{ duration: 0.2 }}
                            className="p-2 rounded-lg bg-gray-800/50 group-hover:bg-red-900/30 transition-colors duration-300"
                          >
                            <LogOut className="w-5 h-5 group-hover:text-red-400 transition-colors duration-300" />
                          </motion.div>
                          <div>
                            <span className="font-semibold">Sign Out</span>
                            <p className="text-xs text-gray-500">End your session</p>
                          </div>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Enhanced Mobile Menu Button */}
              <motion.button
                className="md:hidden p-3 text-gray-300 hover:text-white hover:bg-gray-800/60 rounded-xl transition-all duration-300 border border-gray-700/50 hover:border-red-500/30"
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <motion.div
                  animate={{ rotate: showMobileMenu ? 90 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {showMobileMenu ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </motion.div>
              </motion.button>
            </div>
          </div>
        </div>

        {/* Enhanced Mobile Navigation */}
        <AnimatePresence>
          {showMobileMenu && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden bg-gradient-to-b from-gray-900/95 to-gray-900/90 backdrop-blur-2xl border-t border-red-500/30"
            >
              <div className="px-6 py-6 space-y-2">
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
                        className={`group flex items-center space-x-4 px-5 py-3 rounded-xl transition-all duration-300 font-medium ${
                          isActive(item.path)
                            ? 'text-white bg-gradient-to-r from-red-600/25 to-red-500/15 border border-red-500/30 shadow-lg shadow-red-500/15'
                            : 'text-gray-300 hover:text-white hover:bg-gray-800/50 hover:shadow-lg'
                        }`}
                        onClick={() => setShowMobileMenu(false)}
                      >
                        <motion.div
                          whileHover={{ scale: 1.1, rotate: 3 }}
                          transition={{ duration: 0.2 }}
                        >
                          <Icon className="w-5 h-5 group-hover:text-red-400 transition-colors duration-300" />
                        </motion.div>
                        <span className="font-semibold">{item.label}</span>
                        
                        {/* Active Indicator */}
                        {isActive(item.path) && (
                          <motion.div
                            className="ml-auto w-2 h-2 bg-red-500 rounded-full"
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
