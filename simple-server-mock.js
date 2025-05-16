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
const PORT = process.env.PORT || 3001; // Используем другой порт, чтобы не конфликтовать с основным сервером

app.use(express.static('public'));
app.use(express.static('./'));  // Чтобы index.html был доступен в корне
app.use(express.json());

app.post('/api/chat', async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Используем имитацию для ответа
    const responseText = await generateMockResponse(message);
    res.json({ message: responseText });
    
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
  console.log(`Simple server with mock API is running on port ${PORT}`);
});