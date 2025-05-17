import React, { useState, useRef, useEffect } from 'react';

function generateUUID() {
  // простая генерация UUID для сообщений
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0,
      v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

const Chat: React.FC = () => {
  const [messages, setMessages] = useState<string[]>(['Привет! Чем могу помочь?']);
  const [input, setInput] = useState('');
  const [accessToken, setAccessToken] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || !accessToken.trim()) return;

    const userMessage = input.trim();
    setMessages(prev => [...prev, userMessage]);
    setInput('');

    try {
      const response = await fetch('https://chat.openai.com/backend-api/conversation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          action: 'next',
          messages: [
            {
              id: generateUUID(),
              role: 'user',
              content: {
                content_type: 'text',
                parts: [userMessage],
              },
            },
          ],
          model: 'gpt-4o-mini',
          conversation_id: null,
        }),
      });

      const data = await response.json();
      const botReply = data.choices?.[0]?.message?.content || 'Извините, бот не ответил.';

      setMessages(prev => [...prev, botReply]);
    } catch (error) {
      setMessages(prev => [...prev, 'Ошибка подключения к OpenAI через access token']);
      console.error(error);
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: '20px auto', fontFamily: 'Arial, sans-serif' }}>
      <h2 style={{ textAlign: 'center', color: '#0078d4' }}>Чат с BOOOMERANGS</h2>

      <input
        type="text"
        placeholder="Вставь Access Token OpenAI сюда"
        value={accessToken}
        onChange={e => setAccessToken(e.target.value)}
        style={{ width: '100%', marginBottom: 10, padding: 10, fontSize: 14 }}
      />

      <div style={{
        border: '1px solid #ccc',
        padding: 10,
        height: 350,
        overflowY: 'auto',
        marginBottom: 10,
        borderRadius: 8,
        backgroundColor: '#f9f9f9',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        {messages.map((msg, i) => (
          <div key={i} style={{
            padding: '8px 12px',
            marginBottom: 8,
            backgroundColor: '#e0f0ff',
            borderRadius: 20,
            maxWidth: '80%',
            wordBreak: 'break-word',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            {msg}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div style={{ display: 'flex' }}>
        <input
          type="text"
          placeholder="Напиши сообщение..."
          value={input}
          onChange={e => setInput(e.target.value)}
          style={{
            flexGrow: 1,
            padding: 10,
            borderRadius: 20,
            border: '1px solid #ccc',
            fontSize: 16,
            outline: 'none'
          }}
          onKeyDown={e => e.key === 'Enter' && sendMessage()}
          autoFocus
        />
        <button onClick={sendMessage} style={{
          marginLeft: 10,
          padding: '10px 20px',
          borderRadius: 20,
          backgroundColor: '#0078d4',
          color: 'white',
          border: 'none',
          fontWeight: 'bold',
          cursor: 'pointer',
          transition: 'background-color 0.3s'
        }}
          onMouseOver={e => (e.currentTarget.style.backgroundColor = '#005a9e')}
          onMouseOut={e => (e.currentTarget.style.backgroundColor = '#0078d4')}
        >
          Отправить
        </button>
      </div>
    </div>
  );
};

export default Chat;