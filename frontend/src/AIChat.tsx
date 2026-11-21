
import { useState, useRef, useEffect } from "react";

import {
  BrainCircuit,
  Send,
  Sparkles,
  User,
  Trash2,
  Loader2,
  MessageSquare,
  X,
  Minus,
} from "lucide-react";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import api from "./services/api";

// ========================================
// TYPES
// ========================================

interface Message {
  id: number;
  role: "user" | "assistant";
  content: string;
}

interface AIChatProps {
  mode?: "page" | "widget";
  onClose?: () => void;
  onMinimize?: () => void;
}

// ========================================
// STORAGE
// ========================================

const CHAT_STORAGE_KEY = "lifeos_ai_chat_history";

const loadChatHistory = (): Message[] => {
  try {
    const savedMessages = localStorage.getItem(CHAT_STORAGE_KEY);

    if (!savedMessages) {
      return [];
    }

    const parsedMessages = JSON.parse(savedMessages);

    if (!Array.isArray(parsedMessages)) {
      return [];
    }

    return parsedMessages.filter(
      (message): message is Message =>
        typeof message.id === "number" &&
        (message.role === "user" ||
          message.role === "assistant") &&
        typeof message.content === "string"
    );
  } catch (error) {
    console.error("Unable to load AI chat history:", error);
    return [];
  }
};

// ========================================
// AI CHAT COMPONENT
// ========================================

function AIChat({
  mode = "page",
  onClose,
  onMinimize,
}: AIChatProps) {
  const [messages, setMessages] = useState<Message[]>(
    loadChatHistory
  );

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const isWidget = mode === "widget";

  // ========================================
  // AUTO SCROLL TO LATEST MESSAGE
  // ========================================

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, loading]);

  // ========================================
  // SAVE CHAT HISTORY AUTOMATICALLY
  // ========================================

  useEffect(() => {
    try {
      localStorage.setItem(
        CHAT_STORAGE_KEY,
        JSON.stringify(messages)
      );
    } catch (error) {
      console.error("Unable to save AI chat history:", error);
    }
  }, [messages]);

  // ========================================
  // SEND MESSAGE TO AI
  // ========================================

  const sendMessage = async () => {
    const prompt = input.trim();

    if (!prompt || loading) {
      return;
    }

    const userMessage: Message = {
      id: Date.now(),
      role: "user",
      content: prompt,
    };

    setMessages((previous) => [
      ...previous,
      userMessage,
    ]);

    setInput("");
    setLoading(true);

    try {
      const response = await api.post("/ai/chat", {
        prompt,
      });

      const assistantMessage: Message = {
        id: Date.now() + 1,
        role: "assistant",
        content: response.data.response,
      };

      setMessages((previous) => [
        ...previous,
        assistantMessage,
      ]);
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.detail ||
        "Unable to connect to LifeOS AI. Please try again.";

      setMessages((previous) => [
        ...previous,
        {
          id: Date.now() + 1,
          role: "assistant",
          content: errorMessage,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // ========================================
  // CLEAR CHAT
  // ========================================

  const clearChat = () => {
    if (loading) {
      return;
    }

    setMessages([]);

    try {
      localStorage.removeItem(CHAT_STORAGE_KEY);
    } catch (error) {
      console.error("Unable to clear AI chat history:", error);
    }
  };

  // ========================================
  // RENDER
  // ========================================

  return (
    <div
      className={`ai-chat-page ${
        isWidget ? "ai-chat-widget" : ""
      }`}
    >
      {/* HEADER */}

      <div className="ai-chat-header">

        <div className="ai-chat-heading">

          <div className="ai-chat-icon">
            <BrainCircuit size={isWidget ? 21 : 25} />
          </div>

          <div>
            <h1>
              {isWidget
                ? "LifeOS AI"
                : "LifeOS AI Assistant"}
            </h1>

            <p>
              {isWidget
                ? "Your personal productivity companion"
                : "Your intelligent partner for productivity and personal growth."}
            </p>
          </div>

        </div>

        <div className="ai-chat-header-actions">

          {messages.length > 0 && (
            <button
              className="ai-clear-button"
              onClick={clearChat}
              disabled={loading}
              title="Clear chat"
              aria-label="Clear chat"
              type="button"
            >
              <Trash2 size={16} />

              {!isWidget && "Clear chat"}
            </button>
          )}

          {isWidget && (
            <>
              <button
                className="ai-widget-control"
                onClick={onMinimize}
                title="Minimize assistant"
                aria-label="Minimize assistant"
                type="button"
              >
                <Minus size={18} />
              </button>

              <button
                className="ai-widget-control"
                onClick={onClose}
                title="Close assistant"
                aria-label="Close assistant"
                type="button"
              >
                <X size={18} />
              </button>
            </>
          )}

        </div>

      </div>

      {/* CHAT CONTAINER */}

      <div className="ai-chat-container">

        {messages.length === 0 ? (

          /* WELCOME SCREEN */

          <div className="ai-welcome">

            <div className="ai-welcome-icon">
              <Sparkles size={32} />
            </div>

            <h2>
              How can I help you today?
            </h2>

            <p>
              Ask me about your tasks, goals, habits, planning,
              productivity, or personal growth.
            </p>

            {/* SUGGESTED PROMPTS */}

            <div className="ai-suggestions">

              {[
                "Help me plan my day",
                "How can I improve my productivity?",
                "Create a study schedule",
                "How do I build better habits?",
              ].map((suggestion) => (

                <button
                  key={suggestion}
                  onClick={() => {
                    setInput(suggestion);
                    inputRef.current?.focus();
                  }}
                  type="button"
                >
                  <MessageSquare size={16} />

                  {suggestion}
                </button>

              ))}

            </div>

          </div>

        ) : (

          /* CHAT MESSAGES */

          <div className="ai-messages">

            {messages.map((message) => (

              <div
                key={message.id}
                className={`ai-message ${
                  message.role === "user"
                    ? "user-message"
                    : "assistant-message"
                }`}
              >

                {/* AVATAR */}

                <div className="ai-message-avatar">

                  {message.role === "user" ? (
                    <User size={19} />
                  ) : (
                    <BrainCircuit size={19} />
                  )}

                </div>

                {/* MESSAGE CONTENT */}

                <div className="ai-message-content">

                  <strong>
                    {message.role === "user"
                      ? "You"
                      : "LifeOS AI"}
                  </strong>

                  <div className="ai-markdown">

                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                    >
                      {message.content}
                    </ReactMarkdown>

                  </div>

                </div>

              </div>

            ))}

            {/* AI THINKING INDICATOR */}

            {loading && (

              <div className="ai-message assistant-message">

                <div className="ai-message-avatar">
                  <BrainCircuit size={19} />
                </div>

                <div className="ai-message-content">

                  <strong>LifeOS AI</strong>

                  <p className="ai-thinking">

                    <Loader2
                      size={16}
                      className="ai-spinner"
                    />

                    Thinking...

                  </p>

                </div>

              </div>

            )}

            <div ref={messagesEndRef} />

          </div>

        )}

      </div>

      {/* MESSAGE INPUT */}

      <form
        className="ai-input-area"
        onSubmit={(event) => {
          event.preventDefault();
          sendMessage();
        }}
      >

        <input
          ref={inputRef}
          type="text"
          placeholder="Message LifeOS AI..."
          value={input}
          onChange={(event) => setInput(event.target.value)}
          disabled={loading}
        />

        <button
          type="submit"
          disabled={!input.trim() || loading}
          aria-label="Send message"
        >
          <Send size={19} />
        </button>

      </form>

      {/* DISCLAIMER */}

      <p className="ai-disclaimer">
        LifeOS AI can make mistakes. Verify important information.
      </p>

    </div>
  );
}

export default AIChat;
