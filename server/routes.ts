import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { nanoid } from "nanoid";
import { insertUserSchema, insertMessageSchema } from '@shared/schema';
import { createHash } from 'crypto';
import session from 'express-session';
import connectPg from "connect-pg-simple";
import { pool } from "./db";

// Функция хеширования пароля
function hashPassword(password: string): string {
  return createHash('sha256').update(password).digest('hex');
}

// Middleware для проверки аутентификации
const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ message: "Необходима авторизация" });
  }
  next();
};

// Расширяем тип сессии, чтобы добавить userId
declare module 'express-session' {
  interface SessionData {
    userId: number;
    sessionId?: string;
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Настройка сессий с PostgreSQL
  const PgSession = connectPg(session);
  app.use(
    session({
      store: new PgSession({
        pool: pool,
        tableName: "sessions",
        createTableIfMissing: false
      }),
      secret: process.env.SESSION_SECRET || "bmgii-chat-secret",
      resave: false,
      saveUninitialized: false,
      cookie: {
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 дней
        secure: process.env.NODE_ENV === "production"
      }
    })
  );

  // Маршрут для регистрации пользователя
  app.post('/api/register', async (req: Request, res: Response) => {
    try {
      const result = insertUserSchema.safeParse({
        username: req.body.username,
        password: hashPassword(req.body.password)
      });
      
      if (!result.success) {
        return res.status(400).json({ 
          error: 'Validation error', 
          details: result.error.format() 
        });
      }
      
      // Проверяем, существует ли пользователь
      const existingUser = await storage.getUserByUsername(result.data.username);
      if (existingUser) {
        return res.status(409).json({ 
          error: 'User already exists', 
          message: 'Пользователь с таким именем уже существует' 
        });
      }
      
      // Создаем пользователя
      const user = await storage.createUser(result.data);
      
      // Устанавливаем сессию
      req.session.userId = user.id;
      
      // Возвращаем данные пользователя (без пароля)
      const { password, ...userData } = user;
      res.status(201).json(userData);
    } catch (error) {
      console.error('Error creating user:', error);
      res.status(500).json({ 
        error: 'Server error',
        message: 'Ошибка при создании пользователя' 
      });
    }
  });
  
  // Маршрут для авторизации пользователя
  app.post('/api/login', async (req: Request, res: Response) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ 
          error: 'Validation error', 
          message: 'Имя пользователя и пароль обязательны' 
        });
      }
      
      // Ищем пользователя
      const user = await storage.getUserByUsername(username);
      if (!user || user.password !== hashPassword(password)) {
        return res.status(401).json({ 
          error: 'Authentication failed', 
          message: 'Неверное имя пользователя или пароль' 
        });
      }
      
      // Устанавливаем сессию
      req.session.userId = user.id;
      
      // Возвращаем данные пользователя (без пароля)
      const { password: _, ...userData } = user;
      res.json(userData);
    } catch (error) {
      console.error('Error authenticating user:', error);
      res.status(500).json({ 
        error: 'Server error',
        message: 'Ошибка при авторизации пользователя' 
      });
    }
  });
  
  // Маршрут для выхода из системы
  app.post('/api/logout', (req: Request, res: Response) => {
    req.session.destroy(err => {
      if (err) {
        return res.status(500).json({ 
          error: 'Server error',
          message: 'Ошибка при выходе из системы' 
        });
      }
      res.json({ success: true });
    });
  });
  
  // Маршрут для получения профиля пользователя
  app.get('/api/profile', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = req.session.userId as number;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ 
          error: 'User not found', 
          message: 'Пользователь не найден' 
        });
      }
      
      // Возвращаем данные пользователя (без пароля)
      const { password, ...userData } = user;
      res.json(userData);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      res.status(500).json({ 
        error: 'Server error',
        message: 'Ошибка при получении профиля пользователя' 
      });
    }
  });
  
  // Маршрут для обновления access токена
  app.post('/api/token', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = req.session.userId as number;
      const { accessToken } = req.body;
      
      if (!accessToken) {
        return res.status(400).json({ 
          error: 'Token required', 
          message: 'Access токен обязателен' 
        });
      }
      
      const user = await storage.updateUserAccessToken(userId, accessToken);
      
      if (!user) {
        return res.status(404).json({ 
          error: 'User not found', 
          message: 'Пользователь не найден' 
        });
      }
      
      // Возвращаем данные пользователя (без пароля)
      const { password, ...userData } = user;
      res.json(userData);
    } catch (error) {
      console.error('Error updating access token:', error);
      res.status(500).json({ 
        error: 'Server error',
        message: 'Ошибка при обновлении access токена' 
      });
    }
  });

  // API endpoint for chat (используется существующий endpoint)
  app.post('/api/chat', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = req.session.userId as number;
      const { message } = req.body;

      if (!message) {
        return res.status(400).json({ error: 'Message is required' });
      }

      // Generate a session ID if not already in the session
      if (!req.session.sessionId) {
        req.session.sessionId = nanoid();
      }

      const sessionId = req.session.sessionId;

      // Создаем сообщение пользователя
      const userMessage = await storage.createMessage({
        role: "user",
        content: message,
        sessionId,
        userId
      });
      
      // Получаем пользователя для проверки access token
      const user = await storage.getUser(userId);
      
      // Создаем ответ ассистента
      let botResponse = "Это тестовый ответ, так как access токен не настроен";
      
      // Если у пользователя есть access токен, отправляем запрос к API
      if (user?.accessToken) {
        try {
          // TODO: Реализовать интеграцию с внешним API с использованием токена
          botResponse = `Ответ с использованием access токена на запрос: ${message}`;
        } catch (error) {
          console.error('Error calling API with access token:', error);
          botResponse = "Произошла ошибка при обработке запроса с токеном";
        }
      }

      // Сохраняем ответ ассистента
      await storage.createMessage({
        role: "assistant",
        content: botResponse,
        sessionId,
        userId
      });

      // Return the response
      res.json({ message: botResponse });
    } catch (error) {
      console.error('Error processing chat request:', error);
      res.status(500).json({ 
        error: 'Error processing your request',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });
  
  // Маршрут для получения истории сообщений
  app.get('/api/messages', isAuthenticated, async (req: Request, res: Response) => {
    try {
      if (!req.session.sessionId) {
        return res.json([]);
      }
      
      const messages = await storage.getMessages(req.session.sessionId);
      res.json(messages);
    } catch (error) {
      console.error('Error fetching messages:', error);
      res.status(500).json({ 
        error: 'Server error',
        message: 'Ошибка при получении сообщений' 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
