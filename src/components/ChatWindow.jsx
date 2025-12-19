import React, { useState, useContext, useRef, useEffect } from 'react';
import { AppContext } from '../App';
import { generateResponse } from '../services/persona';
import { callBytezAPI } from '../services/api';
import { queue } from '../services/queue';
import { saveMessage } from '../services/storage';

export default function ChatWindow() {
const { messages, setMessages, mood, showThoughts, updateMood } = useContext(AppContext);
const [input, setInput] = useState('');
const [loading, setLoading] = useState(false);
const scrollRef = useRef(null);

useEffect(() => {
scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
}, [messages]);

const sendMessage = async (text) => {
if (!text.trim()) return;

const userMessage = { id: Date.now(), text, sender: 'user', timestamp: new Date() };
setMessages(prev => [...prev, userMessage]);
setInput('');
setLoading(true);

updateMood(5); // Increase mood on engagement

try {
  await queue.add(async () => {
    const response = await callBytezAPI('text', {
      model: 'NousResearch/Hermes-2-Pro-Llama-3-8B',
      messages: [...messages, userMessage].map(m => ({
        role: m.sender === 'user' ? 'user' : 'assistant',
        content: m.text
      }))
    });

    const persona = generateResponse(text, mood, showThoughts);
    
    const aiMessage = {
      id: Date.now() + 1,
      text: persona,
      sender: 'shafiya',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, aiMessage]);
    await saveMessage(userMessage);
    await saveMessage(aiMessage);
  });
} catch (err) {
  console.error('Error:', err);
  const errorMsg = {
    id: Date.now() + 2,
    text: mood < 30 ? 'tum ignore kar rahe ho mujhe 😤' : 'sorry jaan, kuch gadbad ho gaya',
    sender: 'shafiya',
    timestamp: new Date()
  };
  setMessages(prev => [...prev, errorMsg]);
} finally {
  setLoading(false);
}
};

return (
<div style={chatContainerStyle}>
<div style={messagesStyle}>
{messages.map(msg => (
<div
key={msg.id}
style={{
...messageStyle,
alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
background: msg.sender === 'user' ? '#ff6b9d' : '#2a2a2a'
}}
>
<p style={{ margin: 0, wordWrap: 'break-word' }}>{msg.text}</p>
<small style={{ fontSize: '10px', opacity: 0.7, marginTop: '4px' }}>
{msg.timestamp.toLocaleTimeString()}
</small>
</div>
))}
<div ref={scrollRef} />
</div>

  <div style={inputContainerStyle}>
    <input
      type="text"
      value={input}
      onChange={(e) => setInput(e.target.value)}
      onKeyPress={(e) => e.key === 'Enter' && sendMessage(input)}
      placeholder="Message Shafiya..."
      style={inputStyle}
      disabled={loading}
    />
    <button
      onClick={() => sendMessage(input)}
      disabled={loading}
      style={{
        ...buttonStyle,
        opacity: loading ? 0.5 : 1
      }}
    >
      {loading ? '⏳' : '📤'}
    </button>
  </div>
</div>
);
}

const chatContainerStyle = {
display: 'flex',
flexDirection: 'column',
height: '100%',
background: '#121212'
};

const messagesStyle = {
flex: 1,
overflowY: 'auto',
display: 'flex',
flexDirection: 'column',
gap: '10px',
padding: '15px',
WebkitOverflowScrolling: 'touch',
contain: 'layout style paint'
};

const messageStyle = {
padding: '12px 15px',
borderRadius: '12px',
maxWidth: '80%',
wordWrap: 'break-word',
animation: 'slideIn 0.2s ease'
};

const inputContainerStyle = {
display: 'flex',
gap: '10px',
padding: '15px',
background:

'rgba(30, 30, 30, 0.95)',
borderTop: '1px solid rgba(255, 255, 255, 0.1)'
};

const inputStyle = {
flex: 1,
padding: '12px 15px',
background: 'rgba(255, 255, 255, 0.1)',
border: 'none',
borderRadius: '20px',
color: '#ffffff',
fontSize: '14px',
outline: 'none'
};

const buttonStyle = {
padding: '12px 20px',
background: '#ff6b9d',
color: '#121212',
border: 'none',
borderRadius: '20px',
fontSize: '16px',
cursor: 'pointer',
fontWeight: 'bold'
};
