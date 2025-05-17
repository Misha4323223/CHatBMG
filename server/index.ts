import path from 'path';
import express from 'express';
import fetch from 'node-fetch';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';
import 'dotenv/config';

const app = express();
app.use(cors());
app.use(express.json());

// Роут для проверки работы сервера
app.get('/', (_req, res) => {
  res.sendFile(path.join(process.cwd(), 'public', 'index.html'));
});

// Роут для POST /api/chat с расширенным логированием
app.post('/api/chat', async (req, res) => {
  const { message, accessToken } = req.body;

  console.log('📥 /api/chat called. Body:', JSON.stringify(req.body));
  console.log(`📨 Message: "${message}"`);
  console.log(`🔑 Access Token length: ${accessToken ? accessToken.length : 0}`);

  if (!message || !accessToken) {
    console.warn('⚠️ Missing message or accessToken in request body');
    return res.status(400).json({ error: 'Message and accessToken are required' });
  }

  try {
    console.log('⏳ Sending request to ChatGPT endpoint...');
    const response = await fetch('https://chat.openai.com/backend-api/conversation', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        action: 'next',
        messages: [
          {
            id: uuidv4(),
            role: 'user',
            content: {
              content_type: 'text',
              parts: [message]
            }
          }
        ],
        model: 'text-davinci-002-render-sha',
        parent_message_id: uuidv4()
      })
    });

    console.log(`📫 Received response from ChatGPT: status ${response.status}`);
    if (!response.ok) {
      const errText = await response.text();
      console.error('❌ OpenAI error:', response.status, errText);
      return res.status(500).json({ error: `Ошибка при вызове ChatGPT: ${response.status}` });
    }

    const data = await response.json();
    console.log('✅ ChatGPT responded with data:', JSON.stringify(data));
    res.json(data);
  } catch (err) {
    console.error('💥 Server error while calling ChatGPT:', err);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

// ─── ПОДКЛЮЧАЕМ СТАТИКУ ─────────────────────────────────────────────────────────
app.use(express.static(path.join(process.cwd(), 'public')));
// ────────────────────────────────────────────────────────────────────────────────

// Запуск сервера на порту из env или 3000
const PORT = Number(process.env.PORT) || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});