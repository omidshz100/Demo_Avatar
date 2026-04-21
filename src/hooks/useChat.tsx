import { createContext, useContext, useEffect, useState } from "react";

const backendUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";

export interface MouthCue {
  start: number;
  end: number;
  value: string;
}

export interface LipSyncData {
  mouthCues: MouthCue[];
}

export interface ChatMessage {
  text: string;
  audio: string;
  animation: string;
  facialExpression: string;
  lipsync: LipSyncData;
}

interface ChatContextType {
  chat: (message: string) => Promise<void>;
  message: ChatMessage | null;
  onMessagePlayed: () => void;
  loading: boolean;
  cameraZoomed: boolean;
  setCameraZoomed: (zoomed: boolean) => void;
}

const ChatContext = createContext<ChatContextType | null>(null);

export const ChatProvider = ({ children }: { children: React.ReactNode }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [message, setMessage] = useState<ChatMessage | null>(null);
  const [loading, setLoading] = useState(false);
  const [cameraZoomed, setCameraZoomed] = useState(true);

  const chat = async (userMessage: string) => {
    setLoading(true);
    try {
      const response = await fetch(`${backendUrl}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage }),
      });

      if (!response.ok) {
        throw new Error(`Chat request failed: ${response.status}`);
      }

      const json = await response.json();
      const resp: ChatMessage[] = Array.isArray(json?.messages)
        ? json.messages
        : [];
      setMessages((prev) => [...prev, ...resp]);
    } catch (error) {
      console.error("Chat request failed", error);
    } finally {
      setLoading(false);
    }
  };

  const onMessagePlayed = () => {
    setMessages((prev) => prev.slice(1));
  };

  useEffect(() => {
    if (messages.length > 0) {
      setMessage(messages[0]);
      console.log("Current message:", messages[0]);
    } else {
      setMessage(null);
      console.log("No messages");
    }
  }, [messages]);

  return (
    <ChatContext.Provider
      value={{ chat, message, onMessagePlayed, loading, cameraZoomed, setCameraZoomed }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = (): ChatContextType => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
};
