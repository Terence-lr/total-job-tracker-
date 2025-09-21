import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Lottie from 'lottie-react';
import '../styles/welcome.css';

const Welcome: React.FC = () => {
  const navigate = useNavigate();
  const [neonData, setNeonData] = useState<any>(null);
  const [openBriefcase, setOpenBriefcase] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mql.matches) {
      navigate('/login'); // accessibility: skip animation
      return;
    }
    
    fetch('/animations/neon-welcome.json')
      .then(r => r.json())
      .then(setNeonData);
  }, [navigate]);

  return (
    <main className="container section welcome">
      <div className="welcome__wrap">
        {neonData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="welcome__neon"
          >
            <Lottie animationData={neonData} loop autoplay style={{ width: 520 }} />
          </motion.div>
        )}

        <motion.button
          className="btn btn-primary welcome__start"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            setOpenBriefcase(true);
          }}
        >
          Start
        </motion.button>
      </div>

      {openBriefcase && (
        <BriefcaseTransition onComplete={() => navigate('/login')} />
      )}
    </main>
  );
};

// Inline BriefcaseTransition component
const BriefcaseTransition: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch('/animations/briefcase.json')
      .then(r => r.json())
      .then(setData);
    
    const timer = setTimeout(onComplete, 1400); // match animation length
    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!data) return null;

  return (
    <div className="briefcase__overlay">
      <Lottie animationData={data} loop={false} autoplay style={{ width: 420 }} />
      <motion.div
        initial={{ opacity: 0, scale: .96, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: .35, delay: .5 }}
        className="briefcase__card"
      />
    </div>
  );
};

export default Welcome;
