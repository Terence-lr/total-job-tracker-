import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Briefcase, TrendingUp, Calendar, Clock } from 'lucide-react';

const Welcome: React.FC = () => {
  const [typewriterText, setTypewriterText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const navigate = useNavigate();

  const tagline = "Your Career Command Center";
  const isTyping = currentIndex < tagline.length;

  // Typewriter effect
  useEffect(() => {
    if (isTyping) {
      const timeout = setTimeout(() => {
        setTypewriterText(prev => prev + tagline[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, 100);
      return () => clearTimeout(timeout);
    }
  }, [currentIndex, isTyping, tagline]);

  // Stats data
  const stats = [
    {
      icon: Briefcase,
      value: "247",
      label: "Total Applications",
      delay: 0.2,
      direction: "left"
    },
    {
      icon: TrendingUp,
      value: "23%",
      label: "Response Rate",
      delay: 0.4,
      direction: "right"
    },
    {
      icon: Calendar,
      value: "12",
      label: "Interviews Scheduled",
      delay: 0.6,
      direction: "left"
    },
    {
      icon: Clock,
      value: "89",
      label: "Days Active",
      delay: 0.8,
      direction: "right"
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0
    }
  };

  const slideVariants = {
    hidden: (direction: string) => ({
      x: direction === "left" ? -100 : 100,
      opacity: 0
    }),
    visible: {
      x: 0,
      opacity: 1
    }
  };

  const shimmerVariants = {
    background: [
      "linear-gradient(45deg, #DC2626, #EF4444, #F87171, #DC2626)",
      "linear-gradient(45deg, #DC2626, #F87171, #EF4444, #DC2626)"
    ]
  };

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Glowing Red Grid Background */}
      <div className="absolute inset-0">
        <div className="grid-background">
          <div className="grid-overlay"></div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-8">
        <motion.div
          className="text-center max-w-6xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Logo */}
          <motion.div
            className="mb-8"
            variants={itemVariants}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-red-600 to-red-800 rounded-xl flex items-center justify-center shadow-2xl">
                <Briefcase className="w-8 h-8 text-white" />
              </div>
            </div>
          </motion.div>

          {/* Typewriter Tagline */}
          <motion.div
            className="mb-12"
            variants={itemVariants}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-4">
              <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                {typewriterText}
              </span>
              <motion.span
                className="inline-block w-1 h-16 bg-red-600 ml-2"
                animate={{ opacity: [0, 1, 0] }}
                transition={{ duration: 1, repeat: Infinity }}
              />
            </h1>
            <p className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
              Transform your job search into a strategic operation with advanced analytics, 
              automated follow-ups, and intelligent insights.
            </p>
          </motion.div>

          {/* Animated Stats Cards */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
            variants={containerVariants}
          >
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-6 hover:border-red-500/50 transition-all duration-300"
                variants={slideVariants}
                custom={stat.direction}
                initial="hidden"
                animate="visible"
                transition={{ delay: stat.delay, duration: 0.8, ease: "easeOut" }}
                whileHover={{ 
                  scale: 1.05,
                  boxShadow: "0 20px 40px rgba(220, 38, 38, 0.3)"
                }}
              >
                <div className="flex items-center justify-between mb-4">
                  <stat.icon className="w-8 h-8 text-red-500" />
                  <div className="text-3xl font-bold text-white">
                    {stat.value}
                  </div>
                </div>
                <div className="text-sm text-gray-400 font-medium">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Enter Dashboard Button */}
          <motion.div
            className="mb-16"
            variants={itemVariants}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <motion.button
              className="group relative px-12 py-4 bg-gradient-to-r from-red-600 to-red-700 text-white font-bold text-lg rounded-2xl shadow-2xl overflow-hidden"
              whileHover={{ 
                scale: 1.05,
                boxShadow: "0 25px 50px rgba(220, 38, 38, 0.4)"
              }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/dashboard')}
              animate={shimmerVariants}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <span className="relative z-10">ENTER DASHBOARD</span>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            </motion.button>
          </motion.div>

          {/* Loading Dots */}
          <motion.div
            className="flex justify-center space-x-2"
            variants={itemVariants}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            {[0, 1, 2].map((index) => (
              <motion.div
                key={index}
                className="w-3 h-3 bg-red-600 rounded-full"
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.5, 1, 0.5]
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: index * 0.2
                }}
              />
            ))}
          </motion.div>
        </motion.div>
      </div>

    </div>
  );
};

export default Welcome;
