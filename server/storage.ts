import { 
  users, 
  chatMessages, 
  type User, 
  type InsertUser,
  type ChatMessage,
  type InsertMessage
} from "@shared/schema";
import { db } from "./db";
import { eq, and } from "drizzle-orm";

// Интерфейс для операций хранения
export interface IStorage {
  // Методы работы с пользователями
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserAccessToken(id: number, accessToken: string): Promise<User | undefined>;
  
  // Методы работы с сообщениями чата
  getMessages(sessionId: string): Promise<ChatMessage[]>;
  createMessage(message: InsertMessage): Promise<ChatMessage>;
}

// Реализация хранилища в памяти
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private messages: Map<string, ChatMessage[]>;
  currentUserId: number;
  currentMessageId: number;

  constructor() {
    this.users = new Map();
    this.messages = new Map();
    this.currentUserId = 1;
    this.currentMessageId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { 
      ...insertUser, 
      id, 
      accessToken: insertUser.accessToken || null, 
      createdAt: new Date(), 
      updatedAt: new Date() 
    };
    this.users.set(id, user);
    return user;
  }

  async updateUserAccessToken(id: number, accessToken: string): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser: User = {
      ...user,
      accessToken,
      updatedAt: new Date()
    };
    
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async getMessages(sessionId: string): Promise<ChatMessage[]> {
    return this.messages.get(sessionId) || [];
  }

  async createMessage(message: InsertMessage): Promise<ChatMessage> {
    const id = this.currentMessageId++;
    const newMessage: ChatMessage = {
      ...message,
      id,
      userId: message.userId || null,
      createdAt: new Date()
    };
    
    const sessionMessages = this.messages.get(message.sessionId) || [];
    sessionMessages.push(newMessage);
    this.messages.set(message.sessionId, sessionMessages);
    
    return newMessage;
  }
}

// Реализация хранилища с использованием базы данных
export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }
  
  async updateUserAccessToken(id: number, accessToken: string): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ 
        accessToken, 
        updatedAt: new Date() 
      })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async getMessages(sessionId: string): Promise<ChatMessage[]> {
    return await db
      .select()
      .from(chatMessages)
      .where(eq(chatMessages.sessionId, sessionId))
      .orderBy(chatMessages.createdAt);
  }

  async createMessage(message: InsertMessage): Promise<ChatMessage> {
    const [newMessage] = await db
      .insert(chatMessages)
      .values(message)
      .returning();
    return newMessage;
  }
}

// Выбираем реализацию хранилища в зависимости от наличия базы данных
export const storage = new DatabaseStorage();
