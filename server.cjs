const express = require('express');
// Динамический импорт fetch
let fetch;
(async () => {
  fetch = (await import('node-fetch')).default;
})();
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static('public'));
app.use(express.static('./'));  // Чтобы index.html был доступен в корне
app.use(express.json());

app.post('/api/chat', async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Проверяем наличие API ключа
    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ 
        error: 'OpenAI API key is missing',
        message: 'API ключ OpenAI не настроен на сервере.' 
      });
    }

    // Запрос к OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "Вы - полезный ассистент. Отвечайте на вопросы пользователя четко и по делу."
          },
          {
            role: "user",
            content: message
          }
        ],
        temperature: 0.7,
        max_tokens: 500
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API Error:', errorData);
      return res.status(response.status).json({ 
        error: 'Error from OpenAI API',
        message: 'Ошибка при запросе к API OpenAI. Попробуйте позже.' 
      });
    }

    const data = await response.json();
    res.json({ message: data.choices[0].message.content });
  } catch (error) {
    console.error('Error processing request:', error);
    res.status(500).json({ 
      error: 'Server error',
      message: 'Произошла ошибка на сервере. Попробуйте позже.' 
    });
  }
});

app.get('/', (req, res) => {
  res.sendFile('index-simple.html', { root: __dirname });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});