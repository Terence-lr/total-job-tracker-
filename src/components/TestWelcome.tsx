import React from 'react';

const TestWelcome: React.FC = () => {
  console.log('TestWelcome component is rendering');
  
  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: 'red', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      color: 'white',
      fontSize: '2rem',
      fontWeight: 'bold'
    }}>
      <div>
        <h1>TEST WELCOME PAGE</h1>
        <p>If you can see this, the component is working!</p>
      </div>
    </div>
  );
};

export default TestWelcome;
