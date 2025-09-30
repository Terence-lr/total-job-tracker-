import React from 'react';

const TestCallback: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black py-6 sm:py-12 px-3 sm:px-4 lg:px-8">
      <div className="max-w-md w-full space-y-6 sm:space-y-8">
        <div className="bg-gray-900 rounded-xl p-4 sm:p-6 lg:p-8 border border-gray-700 shadow-2xl">
          <div className="text-center">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white mb-4">
              Test Callback Page
            </h1>
            <p className="text-sm sm:text-base text-gray-400 mb-4">
              This page is working! The routing is functioning correctly.
            </p>
            <p className="text-xs text-gray-500">
              URL: {window.location.href}
            </p>
            <p className="text-xs text-gray-500">
              Hash: {window.location.hash}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestCallback;



