import React from 'react';

const VoxCroftLogo = () => {
  return (
    <div style={{ 
      position: 'absolute', 
      bottom: '80%', 
      left: '7%', 
      transform: 'translate(-50%, 50%)', 
      zIndex: 1000, 
      backgroundColor: 'rgba(255, 255, 255, 0.9)', 
      padding: '15px', 
      borderRadius: '8px', 
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)', 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      gap: '5px' 
    }}> 
      <img 
        src="C:/Users/user/Documents/GISProject/emotion-map/public/Logo.png"  // Ensure this matches exactly
        alt="VoxCroft Logo" 
        onError={(e) => {
          console.error('Image failed to load', e);
          // Optionally, replace with a fallback
          (e.target as HTMLImageElement).style.display = 'none';
        }}
        style={{ 
          width: '120px', 
          height: 'auto', 
          objectFit: 'contain', 
          marginBottom: '5px',
          backgroundColor: 'gray' // Temporary to help visualize
        }} 
      /> 
      <h2 style={{ 
        margin: 0, 
        fontSize: '2.6em', 
        fontWeight: 'bold', 
        color: 'red' 
      }}> 
        VoxCroft 
      </h2> 
      <span style={{ 
        fontSize: '1.3em', 
        color: '#666' 
      }}> 
        Emotion Analytics 
      </span> 
    </div>
  );
};

export default VoxCroftLogo;