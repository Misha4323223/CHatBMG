export interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export interface ChatRequest {
  message: string;
  history: {
    role: string;
    content: string;
  }[];
}

export interface ChatResponse {
  message: string;
  error?: string;
}
