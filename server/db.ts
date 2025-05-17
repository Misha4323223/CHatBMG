import { drizzle } from "drizzle-orm/neon-serverless";
import { Pool } from "@neondatabase/serverless";
import * as schema from "./schema"; // схема таблиц

// Берём строку подключения из секрета (environment variable)
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL must be set."); // ошибка, если нет секрета
}

// Создаём пул соединений с базой
export const pool = new Pool({
  connectionString,
  // при необходимости можно добавить ssl, но Neon обычно уже настроен на это
});

// Инициализируем Drizzle ORM с пулом и схемой
export const db = drizzle(pool, { schema });