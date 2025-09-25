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
      <nav className="relative bg-gradient-to-r from-gray-900/98 via-gray-900/95 to-gray-900/98 backdrop-blur-2xl border-b border-red-500/20 sticky top-0 z-50 shadow-2xl">
        {/* Animated Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 via-transparent to-red-500/5 opacity-50"></div>
        
        {/* Subtle Grid Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(239, 68, 68, 0.3) 1px, transparent 0)`,
            backgroundSize: '20px 20px'
          }}></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-18">
            {/* Enhanced Logo Section */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="flex items-center space-x-3"
            >
              <Link 
                to="/dashboard" 
                className="group relative flex items-center space-x-3 text-red-500 font-bold text-xl hover:text-red-400 transition-all duration-300 cursor-pointer p-2 rounded-xl hover:bg-red-500/10"
              >
                {/* Enhanced Glow Effect */}
                <motion.div
                  whileHover={{ scale: 1.15, rotate: 8 }}
                  whileTap={{ scale: 0.9 }}
                  className="relative"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-red-500/30 to-red-400/30 rounded-full blur-xl group-hover:blur-2xl transition-all duration-500"></div>
                  <div className="absolute inset-0 bg-red-500/20 rounded-full blur-lg group-hover:bg-red-400/40 transition-all duration-300"></div>
                  <Briefcase className="w-9 h-9 relative z-10 drop-shadow-lg" />
                  
                  {/* Pulsing Ring */}
                  <motion.div
                    className="absolute inset-0 border-2 border-red-500/30 rounded-full"
                    animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                </motion.div>
                
                <div className="flex flex-col">
                  <motion.span 
                    className="relative group-hover:text-red-400 transition-colors duration-300 text-2xl font-extrabold tracking-tight"
                    whileHover={{ x: 3 }}
                  >
                    JobTracker
                  </motion.span>
                  <motion.span 
                    className="relative text-red-400/80 text-sm font-medium tracking-wider"
                    whileHover={{ x: 3 }}
                  >
                    PROFESSIONAL
                  </motion.span>
                </div>
                
                {/* Shimmer Effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 opacity-0 group-hover:opacity-100"
                  initial={{ x: '-100%' }}
                  whileHover={{ x: '100%' }}
                  transition={{ duration: 0.8 }}
                />
              </Link>
            </motion.div>

            {/* Enhanced Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-2">
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
                      className={`group relative px-5 py-3 rounded-xl transition-all duration-300 font-medium ${
                        isActive(item.path)
                          ? 'text-white bg-gradient-to-r from-red-600/30 to-red-500/20 border border-red-500/40 shadow-lg shadow-red-500/20'
                          : 'text-gray-300 hover:text-white hover:bg-gray-800/60 hover:shadow-lg'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <motion.div
                          whileHover={{ scale: 1.2, rotate: 5 }}
                          transition={{ duration: 0.2 }}
                        >
                          <Icon className="w-5 h-5 group-hover:text-red-400 transition-colors duration-300" />
                        </motion.div>
                        <span className="font-semibold tracking-wide">{item.label}</span>
                      </div>
                      
                      {/* Enhanced Hover Effect */}
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-red-500/15 via-red-400/10 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        whileHover={{ scale: 1.05 }}
                      />
                      
                      {/* Active Indicator with Glow */}
                      {isActive(item.path) && (
                        <motion.div
                          className="absolute -bottom-1 left-1/2 w-8 h-1 bg-gradient-to-r from-red-500 to-red-400 rounded-full shadow-lg shadow-red-500/50"
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ duration: 0.4 }}
                        />
                      )}
                      
                      {/* Shimmer Effect */}
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 opacity-0 group-hover:opacity-100"
                        initial={{ x: '-100%' }}
                        whileHover={{ x: '100%' }}
                        transition={{ duration: 0.6 }}
                      />
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
                  className="group relative bg-gradient-to-r from-red-600 via-red-700 to-red-600 text-white px-8 py-3 rounded-2xl font-bold hover:from-red-500 hover:via-red-600 hover:to-red-500 transition-all duration-300 shadow-2xl hover:shadow-red-500/40 cursor-pointer overflow-hidden border border-red-500/30"
                >
                  <div className="flex items-center space-x-3 relative z-10">
                    <motion.div
                      whileHover={{ rotate: 180, scale: 1.2 }}
                      transition={{ duration: 0.4 }}
                      className="relative"
                    >
                      <Plus className="w-5 h-5 drop-shadow-lg" />
                      {/* Pulsing Ring */}
                      <motion.div
                        className="absolute inset-0 border-2 border-white/30 rounded-full"
                        animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0.8, 0.5] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      />
                    </motion.div>
                    <span className="text-lg tracking-wide">Add Job</span>
                  </div>
                  
                  {/* Enhanced Shimmer Effect */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12"
                    initial={{ x: '-100%' }}
                    whileHover={{ x: '100%' }}
                    transition={{ duration: 0.8 }}
                  />
                  
                  {/* Glow Effect */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-red-400/20 to-red-600/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    whileHover={{ scale: 1.05 }}
                  />
                </Link>
              </motion.div>

              {/* Enhanced Settings Dropdown */}
              <div className="relative">
                <motion.button 
                  onClick={() => setShowMenu(!showMenu)}
                  className="group flex items-center space-x-3 px-5 py-3 rounded-xl text-gray-300 hover:text-white hover:bg-gray-800/60 transition-all duration-300 font-medium border border-gray-700/50 hover:border-red-500/30"
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
                      className="absolute right-0 mt-3 w-64 bg-gray-900/98 backdrop-blur-2xl border border-red-500/20 rounded-2xl shadow-2xl overflow-hidden"
                    >
                      {/* Header */}
                      <div className="px-6 py-4 border-b border-gray-700/50">
                        <h3 className="text-white font-bold text-lg">Account</h3>
                        <p className="text-gray-400 text-sm">Manage your profile and settings</p>
                      </div>
                      
                      <div className="py-3">
                        <Link 
                          to="/profile" 
                          className="group flex items-center space-x-4 px-6 py-4 text-gray-300 hover:bg-gradient-to-r hover:from-red-500/10 hover:to-transparent hover:text-white transition-all duration-300"
                          onClick={() => setShowMenu(false)}
                        >
                          <motion.div
                            whileHover={{ scale: 1.2, rotate: 5 }}
                            transition={{ duration: 0.2 }}
                            className="p-2 rounded-lg bg-gray-800/50 group-hover:bg-red-500/20 transition-colors duration-300"
                          >
                            <User className="w-5 h-5 group-hover:text-red-400 transition-colors duration-300" />
                          </motion.div>
                          <div>
                            <span className="font-semibold">Profile</span>
                            <p className="text-xs text-gray-500">Manage your information</p>
                          </div>
                        </Link>
                        
                        <Link 
                          to="/settings" 
                          className="group flex items-center space-x-4 px-6 py-4 text-gray-300 hover:bg-gradient-to-r hover:from-red-500/10 hover:to-transparent hover:text-white transition-all duration-300"
                          onClick={() => setShowMenu(false)}
                        >
                          <motion.div
                            whileHover={{ scale: 1.2, rotate: 5 }}
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
                            whileHover={{ scale: 1.2, rotate: 5 }}
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
              className="md:hidden bg-gradient-to-b from-gray-900/98 to-gray-900/95 backdrop-blur-2xl border-t border-red-500/20"
            >
              <div className="px-6 py-6 space-y-3">
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
                        className={`group flex items-center space-x-4 px-5 py-4 rounded-xl transition-all duration-300 font-medium ${
                          isActive(item.path)
                            ? 'text-white bg-gradient-to-r from-red-600/30 to-red-500/20 border border-red-500/40 shadow-lg shadow-red-500/20'
                            : 'text-gray-300 hover:text-white hover:bg-gray-800/60 hover:shadow-lg'
                        }`}
                        onClick={() => setShowMobileMenu(false)}
                      >
                        <motion.div
                          whileHover={{ scale: 1.2, rotate: 5 }}
                          transition={{ duration: 0.2 }}
                        >
                          <Icon className="w-6 h-6 group-hover:text-red-400 transition-colors duration-300" />
                        </motion.div>
                        <span className="font-semibold text-lg">{item.label}</span>
                        
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
