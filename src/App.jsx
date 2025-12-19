import React, { useState, useContext, createContext, useEffect } from 'react';
import Header from './components/Header';
import ChatWindow from './components/ChatWindow';
import CallSimulator from './components/CallSimulator';
import Gallery from './components/Gallery';
import Settings from './components/Settings';
import { initDB } from './services/storage';

export const AppContext = createContext();

export default function App() {
  const [currentPage, setCurrentPage] = useState('chat'); // chat, call, gallery, settings
  const [mood, setMood] = useState(50);
  const [showThoughts, setShowThoughts] = useState(false);
  const [messages, setMessages] = useState([]);
  const [onlineStatus, setOnlineStatus] = useState(navigator.onLine);

  useEffect(() => {
    initDB();
  }, []);

  useEffect(() => {
    const handleOnline = () => setOnlineStatus(true);
    const handleOffline = () => setOnlineStatus(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const updateMood = (delta) => {
    setMood(prev => Math.max(0, Math.min(100, prev + delta)));
  };

  const context = {
    mood,
    setMood,
    updateMood,
    showThoughts,
    setShowThoughts,
    messages,
    setMessages,
    onlineStatus
  };

  return (
    <AppContext.Provider value={context}>
      <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#121212' }}>
        <Header currentPage={currentPage} />
        
        <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          {currentPage === 'chat' && <ChatWindow />}
          {currentPage === 'call' && <CallSimulator />}
          {currentPage === 'gallery' && <Gallery />}
          {currentPage === 'settings' && <Settings />}
        </div>

        <nav style={navStyle}>
          <button onClick={() => setCurrentPage('chat')} style={getNavButtonStyle(currentPage === 'chat')}>💬</button>
          <button onClick={() => setCurrentPage('call')} style={getNavButtonStyle(currentPage === 'call')}>☎️</button>
          <button onClick={() => setCurrentPage('gallery')} style={getNavButtonStyle(currentPage === 'gallery')}>🖼️</button>
          <button onClick={() => setCurrentPage('settings')} style={getNavButtonStyle(currentPage === 'settings')}>⚙️</button>
        </nav>
      </div>
    </AppContext.Provider>
  );
}

const navStyle = {
  display: 'flex',
  justifyContent: 'space-around',
  alignItems: 'center',
  background: 'rgba(30, 30, 30, 0.95)',
  borderTop: '1px solid rgba(255, 255, 255, 0.1)',
  padding: '10px 0',
  fontSize: '24px'
};

const getNavButtonStyle = (active) => ({
  flex: 1,
  padding: '10px',
  background: active ? 'rgba(255, 107, 157, 0.2)' : 'transparent',
  color: active ? '#ff6b9d' : '#ffffff',
  border: 'none',
  fontSize: '20px',
  cursor: 'pointer',
  transition: 'all 0.2s'
});
