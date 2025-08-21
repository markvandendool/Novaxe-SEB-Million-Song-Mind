import React, { useEffect } from 'react';

const TestPage = () => {
  useEffect(() => {
    console.log('🚨 TestPage mounted successfully!');
    console.log('🚨 Document body:', document.body);
    console.log('🚨 Document title:', document.title);
  }, []);

  return (
    <div style={{ 
      padding: '20px', 
      backgroundColor: '#ff0000',  // Bright red to be very visible
      minHeight: '100vh',
      color: 'white',
      fontSize: '24px'
    }}>
      <h1 style={{ 
        color: 'white', 
        fontSize: '48px', 
        margin: '20px 0',
        textShadow: '2px 2px 4px black'
      }}>
        🚨 EMERGENCY TEST PAGE 🚨
      </h1>
      <p style={{ 
        color: 'white', 
        fontSize: '24px',
        backgroundColor: 'black',
        padding: '20px',
        margin: '20px 0'
      }}>
        If you can see this RED PAGE, React is rendering!
      </p>
      <div style={{ 
        backgroundColor: 'yellow', 
        color: 'black', 
        padding: '20px', 
        margin: '20px 0',
        fontSize: '32px',
        fontWeight: 'bold',
        border: '5px solid black'
      }}>
        🟡 YELLOW ALERT BOX - MAXIMUM VISIBILITY
      </div>
      <div style={{ 
        backgroundColor: 'blue', 
        color: 'white', 
        padding: '20px', 
        margin: '20px 0',
        fontSize: '24px'
      }}>
        � BLUE BOX - Browser should show this
      </div>
    </div>
  );
};

export default TestPage;
