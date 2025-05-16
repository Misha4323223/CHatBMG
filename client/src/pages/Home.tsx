import Header from "@/components/Header";
import ChatContainer from "@/components/ChatContainer";
import { useState, useEffect } from "react";
import { Message } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isWaitingForResponse, setIsWaitingForResponse] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Add initial welcome message
    const welcomeMessage: Message = {
      role: "assistant",
      content: "Привет! Я ChatGPT. Чем я могу помочь вам сегодня? Задайте любой вопрос или попросите о помощи.",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages([welcomeMessage]);
  }, []);

  const sendMessage = async (content: string) => {
    if (!content.trim() || isWaitingForResponse) return;

    const userMessage: Message = {
      role: "user",
      content,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    // Update UI with user message
    setMessages(prev => [...prev, userMessage]);
    setIsWaitingForResponse(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          message: content,
          history: messages.map(({ role, content }) => ({ role, content }))
        }),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();
      
      const assistantMessage: Message = {
        role: "assistant",
        content: data.message,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось получить ответ от сервера. Попробуйте еще раз.",
        variant: "destructive"
      });
    } finally {
      setIsWaitingForResponse(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <Header />
      <ChatContainer 
        messages={messages}
        isWaitingForResponse={isWaitingForResponse}
        onSendMessage={sendMessage}
      />
    </div>
  );
}
