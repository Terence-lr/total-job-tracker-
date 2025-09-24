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
      <nav className="bg-gray-900 border-b border-gray-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <Link to="/dashboard" className="text-red-500 font-bold text-xl">
                💼 JobTracker Pro
              </Link>
              <Link to="/dashboard" className={`text-gray-300 hover:text-white ${location.pathname === '/dashboard' ? 'text-white' : ''}`}>
                Dashboard
              </Link>
              <Link to="/applications" className={`text-gray-300 hover:text-white ${location.pathname === '/applications' ? 'text-white' : ''}`}>
                Applications
              </Link>
              <Link to="/analytics" className={`text-gray-300 hover:text-white ${location.pathname === '/analytics' ? 'text-white' : ''}`}>
                Analytics
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/jobs/new" className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">
                + Add Job
              </Link>
              <div className="relative">
                <button onClick={() => setShowMenu(!showMenu)} className="text-gray-300 hover:text-white">
                  ⚙️ Settings
                </button>
                {showMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-lg">
                    <Link to="/profile" className="block px-4 py-2 text-gray-300 hover:bg-gray-700">Profile</Link>
                    <Link to="/settings" className="block px-4 py-2 text-gray-300 hover:bg-gray-700">Settings</Link>
                    <button onClick={handleSignOut} className="block w-full text-left px-4 py-2 text-gray-300 hover:bg-gray-700">
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
