import React from 'react';

const Legend = () => {
  const emotionInfo = [
    { emotion: 'Anger', color: '#ff0000', description: 'High intensity anger reactions' },
    { emotion: 'Sadness', color: '#0000ff', description: 'Expressions of grief or sorrow' },
    { emotion: 'Joy', color: '#ffff00', description: 'Positive emotional responses' },
    { emotion: 'Fear', color: '#800080', description: 'Anxiety or concern' },
    { emotion: 'Anticipation', color: '#ffa500', description: 'Future-focused emotions' }
  ];

  return (
    <div style={{
      position: 'absolute',
      right: '20px',
      top: '20px',
      backgroundColor: 'white',
      padding: '15px',
      borderRadius: '8px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
      zIndex: 1000,
      maxWidth: '250px'
    }}>
      <h3 style={{ marginBottom: '10px', borderBottom: '2px solid #eee', paddingBottom: '5px' }}>
        Emotion Map Legend
      </h3>
      {emotionInfo.map(({ emotion, color, description }) => (
        <div key={emotion} style={{ marginBottom: '8px', display: 'flex', alignItems: 'center' }}>
          <div style={{
            width: '20px',
            height: '20px',
            backgroundColor: color,
            borderRadius: '50%',
            marginRight: '10px',
            border: '1px solid #333'
          }} />
          <div>
            <strong>{emotion}</strong>
            <div style={{ fontSize: '0.8em', color: '#666' }}>{description}</div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Legend;