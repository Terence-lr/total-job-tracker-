import React, { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [showMenu, setShowMenu] = useState(false);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-black">
      <nav className="bg-gray-900/95 backdrop-blur-md border-b border-gray-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <Link to="/dashboard" className="flex items-center space-x-2 text-red-500 font-bold text-xl hover:text-red-400 transition-colors">
                <span className="text-2xl">💼</span>
                <span>JobTracker Pro</span>
              </Link>
              <Link to="/dashboard" className={`text-gray-300 hover:text-white transition-colors ${location.pathname === '/dashboard' ? 'text-white font-semibold' : ''}`}>
                Dashboard
              </Link>
              <Link to="/applications" className={`text-gray-300 hover:text-white transition-colors ${location.pathname === '/applications' ? 'text-white font-semibold' : ''}`}>
                Applications
              </Link>
              <Link to="/analytics" className={`text-gray-300 hover:text-white transition-colors ${location.pathname === '/analytics' ? 'text-white font-semibold' : ''}`}>
                Analytics
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link 
                to="/dashboard?addJob=true" 
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                + Add Job
              </Link>
              <div className="relative">
                <button onClick={() => setShowMenu(!showMenu)} className="text-gray-300 hover:text-white transition-colors">
                  ⚙️ Settings
                </button>
                {showMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-gray-900 border border-gray-700 rounded-lg shadow-xl">
                    <Link to="/profile" className="block px-4 py-3 text-gray-300 hover:bg-gray-800 hover:text-white transition-colors rounded-t-lg">Profile</Link>
                    <Link to="/settings" className="block px-4 py-3 text-gray-300 hover:bg-gray-800 hover:text-white transition-colors">Settings</Link>
                    <button onClick={handleSignOut} className="block w-full text-left px-4 py-3 text-gray-300 hover:bg-gray-800 hover:text-white transition-colors rounded-b-lg">
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>
      <Outlet />
    </div>
  );
}
