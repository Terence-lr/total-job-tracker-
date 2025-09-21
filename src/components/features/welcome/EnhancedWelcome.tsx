import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Briefcase, TrendingUp, Calendar, Clock, ArrowRight } from 'lucide-react';
import { fadeInUp, staggerContainer, staggerItem } from '../../../lib/animations';

interface StatCardProps {
  icon: React.ReactNode;
  value: string | number;
  label: string;
  delay?: number;
}

const StatCard: React.FC<StatCardProps> = ({ icon, value, label, delay = 0 }) => {
  return (
    <motion.div
      variants={staggerItem}
      initial="hidden"
      animate="visible"
      transition={{ delay }}
      className="signature-card p-6 text-center cursor-pointer group"
    >
      <div className="text-3xl mb-3 group-hover:scale-110 transition-transform duration-300">
        {icon}
      </div>
      <div className="text-2xl font-bold text-white mb-1">{value}</div>
      <div className="text-sm text-gray-400 uppercase tracking-wider">{label}</div>
    </motion.div>
  );
};

const EnhancedWelcome: React.FC = () => {
  const [stats, setStats] = useState({
    applications: 0,
    responseRate: 0,
    interviews: 0,
    avgTime: '--'
  });

  // Simulate loading stats
  useEffect(() => {
    const timer = setTimeout(() => {
      setStats({
        applications: 0,
        responseRate: 0,
        interviews: 0,
        avgTime: '--'
      });
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-gray-900 flex items-center justify-center relative overflow-hidden">
      {/* Grid Overlay */}
      <div className="grid-overlay" />
      
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="text-center z-10 px-8 max-w-4xl mx-auto"
      >
        {/* Logo Section */}
        <motion.div
          variants={fadeInUp}
          className="mb-12"
        >
          <motion.h1
            className="text-5xl font-black bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent uppercase tracking-wider mb-4"
            animate={{
              filter: [
                'drop-shadow(0 0 10px rgba(220, 38, 38, 0.5))',
                'drop-shadow(0 0 20px rgba(220, 38, 38, 0.8))',
                'drop-shadow(0 0 10px rgba(220, 38, 38, 0.5))'
              ]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
          >
            Job Tracker Pro
          </motion.h1>
          <p className="text-xl text-gray-400 mb-8">Your Career Command Center</p>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          variants={staggerContainer}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12 max-w-2xl mx-auto"
        >
          <StatCard
            icon={<Briefcase className="w-8 h-8 mx-auto" />}
            value={stats.applications}
            label="Applications"
            delay={0.1}
          />
          <StatCard
            icon={<TrendingUp className="w-8 h-8 mx-auto" />}
            value={`${stats.responseRate}%`}
            label="Response Rate"
            delay={0.2}
          />
          <StatCard
            icon={<Calendar className="w-8 h-8 mx-auto" />}
            value={stats.interviews}
            label="Interviews"
            delay={0.3}
          />
          <StatCard
            icon={<Clock className="w-8 h-8 mx-auto" />}
            value={stats.avgTime}
            label="Avg Time"
            delay={0.4}
          />
        </motion.div>

        {/* CTA Button */}
        <motion.div
          variants={fadeInUp}
          className="mb-8"
        >
          <Link to="/dashboard">
            <motion.button
              className="signature-btn inline-flex items-center gap-3"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Enter Dashboard
              <ArrowRight className="w-5 h-5" />
            </motion.button>
          </Link>
        </motion.div>

        {/* Loading Animation */}
        <motion.div
          variants={fadeInUp}
          className="flex justify-center"
        >
          <div className="loading-dots">
            <div className="loading-dot" />
            <div className="loading-dot" />
            <div className="loading-dot" />
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default EnhancedWelcome;
