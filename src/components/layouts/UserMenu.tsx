import React from 'react';
import { Menu, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { User, Settings, LogOut, ChevronDown, Download, Upload, Bell, Shield, HelpCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const UserMenu: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <Menu as="div" className="relative">
      <div>
        <Menu.Button className="flex items-center space-x-2 text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-white" />
          </div>
          <span className="hidden md:block text-gray-700 font-medium">
            {user?.email?.split('@')[0] || 'User'}
          </span>
          <ChevronDown className="w-4 h-4 text-gray-400" />
        </Menu.Button>
      </div>
      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
          <div className="py-1">
            <Menu.Item>
              {({ active }) => (
                <button
                  onClick={() => navigate('/profile')}
                  className={`${
                    active ? 'bg-gray-100' : ''
                  } flex items-center w-full px-4 py-2 text-sm text-gray-700`}
                >
                  <User className="w-4 h-4 mr-3" />
                  Profile
                </button>
              )}
            </Menu.Item>
            <Menu.Item>
              {({ active }) => (
                <button
                  onClick={() => navigate('/settings')}
                  className={`${
                    active ? 'bg-gray-100' : ''
                  } flex items-center w-full px-4 py-2 text-sm text-gray-700`}
                >
                  <Settings className="w-4 h-4 mr-3" />
                  Settings
                </button>
              )}
            </Menu.Item>
            <div className="border-t border-gray-100 my-1"></div>
            <Menu.Item>
              {({ active }) => (
                <button
                  onClick={() => {/* TODO: Implement export functionality */}}
                  className={`${
                    active ? 'bg-gray-100' : ''
                  } flex items-center w-full px-4 py-2 text-sm text-gray-700`}
                >
                  <Download className="w-4 h-4 mr-3" />
                  Export Data
                </button>
              )}
            </Menu.Item>
            <Menu.Item>
              {({ active }) => (
                <button
                  onClick={() => {/* TODO: Implement import functionality */}}
                  className={`${
                    active ? 'bg-gray-100' : ''
                  } flex items-center w-full px-4 py-2 text-sm text-gray-700`}
                >
                  <Upload className="w-4 h-4 mr-3" />
                  Import Data
                </button>
              )}
            </Menu.Item>
            <Menu.Item>
              {({ active }) => (
                <button
                  onClick={() => {/* TODO: Implement notifications settings */}}
                  className={`${
                    active ? 'bg-gray-100' : ''
                  } flex items-center w-full px-4 py-2 text-sm text-gray-700`}
                >
                  <Bell className="w-4 h-4 mr-3" />
                  Notifications
                </button>
              )}
            </Menu.Item>
            <Menu.Item>
              {({ active }) => (
                <button
                  onClick={() => {/* TODO: Implement privacy settings */}}
                  className={`${
                    active ? 'bg-gray-100' : ''
                  } flex items-center w-full px-4 py-2 text-sm text-gray-700`}
                >
                  <Shield className="w-4 h-4 mr-3" />
                  Privacy & Security
                </button>
              )}
            </Menu.Item>
            <Menu.Item>
              {({ active }) => (
                <button
                  onClick={() => {/* TODO: Implement help/support */}}
                  className={`${
                    active ? 'bg-gray-100' : ''
                  } flex items-center w-full px-4 py-2 text-sm text-gray-700`}
                >
                  <HelpCircle className="w-4 h-4 mr-3" />
                  Help & Support
                </button>
              )}
            </Menu.Item>
            <div className="border-t border-gray-100 my-1"></div>
            <Menu.Item>
              {({ active }) => (
                <button
                  onClick={handleSignOut}
                  className={`${
                    active ? 'bg-gray-100' : ''
                  } flex items-center w-full px-4 py-2 text-sm text-gray-700`}
                >
                  <LogOut className="w-4 h-4 mr-3" />
                  Sign out
                </button>
              )}
            </Menu.Item>
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
};

export default UserMenu;
