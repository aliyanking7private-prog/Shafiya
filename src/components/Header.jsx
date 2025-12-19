import React, { useContext } from 'react';
import { AppContext } from '../App';

export default function Header({ currentPage }) {
  const { mood, onlineStatus } = useContext(AppContext);

  const getMoodStatus = () => {
    if (mood < 30) return 'angry 😤';
    if (mood < 50) return 'upset 😔';
    if (mood < 70) return 'happy 😊';
    return 'in love 😍';
  };

  const getMoodColor = () => {
    if (mood < 30) return '#f44336';
    if (mood < 50) return '#ff9800';
    if (mood < 70) return '#2196f3';
    return '#ff6b9d';
  };

  return (
    <div style={headerStyle}>
      <div>
        <h1 style={{ fontSize: '20px', marginBottom: '5px' }}>Shafiya</h1>
        <p style={{ fontSize: '12px', color: '#b0b0b0' }}>
          {getMoodStatus()} • {onlineStatus ? '🟢 Online' : '🔴 Offline'}
        </p>
      </div>
      
      <div style={moodIndicatorStyle}>
        <div style={moodBarStyle}>
          <div 
            style={{
              width: `${mood}%`,
              height: '100%',
              background: getMoodColor(),
              transition: 'width 0.3s, background 0.3s',
              borderRadius: '2px'
            }}
          />
        </div>
        <span style={{ fontSize: '12px', color: '#b0b0b0' }}>{mood}%</span>
      </div>
    </div>
  );
}

const headerStyle = {
  background: 'rgba(30, 30, 30, 0.95)',
  padding: '15px 20px',
  borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center'
};

const moodIndicatorStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '5px'
};

const moodBarStyle = {
  width: '100px',
  height: '6px',
  background: 'rgba(255, 255, 255, 0.1)',
  borderRadius: '3px',
  overflow: 'hidden'
};
