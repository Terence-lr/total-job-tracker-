import React, { useState } from 'react';
import { Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { Menu as MenuIcon, X, Briefcase, BarChart3 } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import clsx from 'clsx';

const MobileNavigation: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: BarChart3 },
    { name: 'Applications', href: '/jobs', icon: Briefcase },
    { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  ];

  return (
    <div className="md:hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
      >
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <MenuIcon className="h-6 w-6" />
        )}
      </button>

      <Transition
        show={isOpen}
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <div className="absolute top-16 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-lg">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setIsOpen(false)}
                  className={clsx(
                    'flex items-center px-3 py-2 rounded-md text-base font-medium',
                    isActive
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  )}
                >
                  <item.icon className="w-5 h-5 mr-3" />
                  {item.name}
                </Link>
              );
            })}
          </div>
        </div>
      </Transition>
    </div>
  );
};

export default MobileNavigation;
