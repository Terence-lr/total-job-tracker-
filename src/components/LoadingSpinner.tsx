import React from 'react';
import { motion } from 'framer-motion';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  fullScreen?: boolean;
  text?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  fullScreen = false, 
  text 
}) => {
  const sizeMap = {
    sm: 24,
    md: 48,
    lg: 64
  };

  const spinnerSize = sizeMap[size];

  const spinnerVariants = {
    spin: {
      rotate: 360
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1
    },
    exit: {
      opacity: 0
    }
  };

  const SpinnerContent = () => (
    <motion.div
      className="flex flex-col items-center justify-center"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <motion.div
        className="border-4 border-gray-300 border-t-red-600 rounded-full"
        style={{
          width: spinnerSize,
          height: spinnerSize
        }}
        variants={spinnerVariants}
        animate="spin"
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: "linear"
        }}
      />
      {text && (
        <motion.p 
          className="mt-4 text-gray-400 text-sm font-medium"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {text}
        </motion.p>
      )}
    </motion.div>
  );

  if (fullScreen) {
    return (
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        <SpinnerContent />
      </motion.div>
    );
  }

  return <SpinnerContent />;
};

export { LoadingSpinner };
