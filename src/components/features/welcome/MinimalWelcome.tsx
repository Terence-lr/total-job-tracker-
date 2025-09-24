import React from 'react';
import { Link } from 'react-router-dom';

const MinimalWelcome: React.FC = () => {
  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#000000', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      color: 'white',
      textAlign: 'center',
      padding: '20px'
    }}>
      <div>
        <h1 style={{ 
          fontSize: '3rem', 
          fontWeight: 'bold', 
          marginBottom: '1rem',
          color: '#ffffff'
        }}>
          Job Tracker Pro
        </h1>
        <p style={{ 
          fontSize: '1.25rem', 
          color: '#9ca3af', 
          marginBottom: '2rem' 
        }}>
          Your Career Command Center
        </p>
        <Link to="/dashboard">
          <button style={{
            backgroundColor: '#dc2626',
            color: 'white',
            padding: '12px 24px',
            borderRadius: '8px',
            border: 'none',
            fontSize: '1rem',
            fontWeight: '500',
            cursor: 'pointer'
          }}>
            Enter Dashboard
          </button>
        </Link>
      </div>
    </div>
  );
};

export default MinimalWelcome;


