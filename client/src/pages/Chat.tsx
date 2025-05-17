import React, { useState, useRef, useEffect } from 'react';

function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0,
      v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

const Chat: React.FC = () => {
  const [messages, setMessages] = useState<{ id: string; role: string; content: string }[]>([
    { id: generateUUID(), role: 'assistant', content: 'Привет! Чем могу помочь?' }
  ]);
  const [input, setInput] = useState('');
  const [accessToken, setAccessToken] = useState('');
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [parentMessageId, setParentMessageId] = useState<string>(generateUUID());
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || !accessToken.trim()) return;

    const userMessage = input.trim();
    const userMessageId = generateUUID();

    // Добавляем сообщение пользователя
    setMessages(prev => [...prev, { id: userMessageId, role: 'user', content: userMessage }]);
    setInput('');

    try {
      const body = {
        action: 'next',
        messages: [
          {
            id: userMessageId,
            role: 'user',
            content: {
              content_type: 'text',
              parts: [userMessage],
            },
          },
        ],
        model: 'gpt-4o-mini',
        conversation_id: conversationId,
        parent_message_id: parentMessageId,
      };

      const response = await fetch('https://chat.openai.com/backend-api/conversation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) throw new Error('Ошибка сети');

      const data = await response.json();

      // Извлекаем ответ
      const message = data.message;
      const botMessageContent = message?.content?.parts?.[0] || 'Извините, бот не ответил.';

      setMessages(prev => [...prev, { id: message.id, role: 'assistant', content: botMessageContent }]);

      // Обновляем conversationId и parentMessageId для следующего запроса
      setConversationId(data.conversation_id);
      setParentMessageId(message.id);
    } catch (error) {
      setMessages(prev => [...prev, { id: generateUUID(), role: 'assistant', content: 'Ошибка подключения к OpenAI через access token' }]);
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
        {messages.map(msg => (
          <div key={msg.id} style={{
            padding: '8px 12px',
            marginBottom: 8,
            backgroundColor: msg.role === 'user' ? '#d1e7dd' : '#e0f0ff',
            borderRadius: 20,
            maxWidth: '80%',
            wordBreak: 'break-word',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
            marginLeft: msg.role === 'user' ? 'auto' : undefined
          }}>
            {msg.content}
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