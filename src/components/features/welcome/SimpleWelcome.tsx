import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const SimpleWelcome: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-gray-900 flex items-center justify-center">
      <div className="text-center px-8 max-w-4xl mx-auto">
        <h1 className="text-5xl font-black bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent uppercase tracking-wider mb-4">
          Job Tracker Pro
        </h1>
        <p className="text-xl text-gray-400 mb-8">Your Career Command Center</p>
        
        <Link to="/dashboard">
          <button className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-lg font-medium inline-flex items-center gap-3 transition-colors">
            Enter Dashboard
            <ArrowRight className="w-5 h-5" />
          </button>
        </Link>
      </div>
    </div>
  );
};

export default SimpleWelcome;

