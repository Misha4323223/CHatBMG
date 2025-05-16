import { useRef, useEffect } from "react";
import Message from "./Message";
import MessageInput from "./MessageInput";
import TypingIndicator from "./TypingIndicator";
import { Message as MessageType } from "@/lib/types";

interface ChatContainerProps {
  messages: MessageType[];
  isWaitingForResponse: boolean;
  onSendMessage: (message: string) => void;
}

export default function ChatContainer({ 
  messages, 
  isWaitingForResponse, 
  onSendMessage 
}: ChatContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages, isWaitingForResponse]);

  return (
    <div className="flex-1 overflow-hidden flex flex-col">
      <div 
        ref={containerRef}
        className="flex-1 overflow-y-auto scrollbar-hide px-4 py-2 space-y-4"
      >
        {messages.map((message, index) => (
          <Message key={index} message={message} />
        ))}
      </div>

      {isWaitingForResponse && <TypingIndicator />}

      <MessageInput 
        onSendMessage={onSendMessage} 
        disabled={isWaitingForResponse} 
      />
    </div>
  );
}
