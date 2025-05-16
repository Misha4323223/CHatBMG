import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const OPENAI_MODEL = "gpt-4o";

const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || "sk-" // Fallback to avoid immediate error
});

interface Message {
  role: string;
  content: string;
}

export async function generateChatResponse(prompt: string, history: Message[] = []): Promise<string> {
  try {
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === "your_openai_api_key_here") {
      throw new Error("OPENAI_API_KEY is not configured");
    }

    // Format the conversation history for OpenAI
    const messages: Message[] = [
      {
        role: "system",
        content: "Вы - полезный ассистент. Отвечайте на вопросы пользователя четко и по делу. Будьте дружелюбны и информативны."
      },
      ...history,
      { role: "user", content: prompt }
    ];

    const response = await openai.chat.completions.create({
      model: OPENAI_MODEL,
      messages: messages,
      temperature: 0.7,
      max_tokens: 1000,
    });

    return response.choices[0].message.content || "Извините, я не смог сгенерировать ответ.";
  } catch (error: any) {
    console.error("OpenAI API Error:", error);
    
    if (error.response) {
      console.error(error.response.status);
      console.error(error.response.data);
    }
    
    // Return user-friendly error message
    if (error.message.includes("API key")) {
      return "Ошибка конфигурации API. Пожалуйста, проверьте настройки API-ключа.";
    } else {
      return "Извините, произошла ошибка при обработке вашего запроса. Пожалуйста, попробуйте снова позже.";
    }
  }
}
