import React from 'react';
import { motion } from 'framer-motion';
import ProfessionalNavigation from './ProfessionalNavigation';
import Footer from './Footer';
import { pageVariants, pageTransition } from '../../lib/animations';

interface MainLayoutProps {
  children: React.ReactNode;
  className?: string;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children, className = '' }) => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <ProfessionalNavigation />
      
      <motion.main
        variants={pageVariants}
        initial="initial"
        animate="in"
        exit="out"
        transition={pageTransition}
        className={`flex-1 ${className}`}
      >
        {children}
      </motion.main>
      
      <Footer />
    </div>
  );
};

export default MainLayout;




