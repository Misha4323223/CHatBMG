import express from 'express';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { generateMockResponse } from './mock-openai.js';

// Получаем путь к текущему файлу и директории
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static('public'));
app.use(express.static('./'));
app.use(express.json());

app.post('/api/chat', async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Проверяем наличие API ключа
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === '') {
      console.log('OpenAI API key is missing or invalid, using mock response');
      const mockResponse = await generateMockResponse(message);
      return res.json({ message: mockResponse });
    }

    try {
      // Если есть API ключ, пробуем использовать его
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
        console.error('OpenAI API Error, using mock response instead');
        const mockResponse = await generateMockResponse(message);
        return res.json({ message: mockResponse });
      }

      const data = await response.json();
      res.json({ message: data.choices[0].message.content });
    } catch (error) {
      console.error('Error with OpenAI API, using mock response instead:', error);
      const mockResponse = await generateMockResponse(message);
      return res.json({ message: mockResponse });
    }
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