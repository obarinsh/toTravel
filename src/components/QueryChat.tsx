'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageCircle, X, Send, Loader2 } from 'lucide-react';
import { ChatMessage, Coordinates } from '@/types';

interface QueryChatProps {
  destination: string;
  hotelLocation?: Coordinates;
}

// Simple markdown parser for chat messages
function formatMessage(text: string): React.ReactNode {
  const lines = text.split('\n');
  
  return lines.map((line, lineIndex) => {
    const parts: React.ReactNode[] = [];
    let remaining = line;
    let partIndex = 0;
    
    while (remaining.length > 0) {
      const boldMatch = remaining.match(/\*\*(.+?)\*\*/);
      
      if (boldMatch && boldMatch.index !== undefined) {
        if (boldMatch.index > 0) {
          parts.push(<span key={`${lineIndex}-${partIndex++}`}>{remaining.slice(0, boldMatch.index)}</span>);
        }
        parts.push(<strong key={`${lineIndex}-${partIndex++}`} className="font-semibold">{boldMatch[1]}</strong>);
        remaining = remaining.slice(boldMatch.index + boldMatch[0].length);
      } else {
        parts.push(<span key={`${lineIndex}-${partIndex++}`}>{remaining}</span>);
        break;
      }
    }
    
    return (
      <span key={lineIndex}>
        {parts}
        {lineIndex < lines.length - 1 && <br />}
      </span>
    );
  });
}

export default function QueryChat({ destination, hotelLocation }: QueryChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          destination,
          query: input,
          hotelLocation,
        }),
      });

      const data = await response.json();

      if (data.response) {
        const assistantMessage: ChatMessage = {
          role: 'assistant',
          content: data.response,
        };
        setMessages((prev) => [...prev, assistantMessage]);
      }
    } catch (error) {
      console.error('Query error:', error);
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating chat button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            onClick={() => setIsOpen(true)}
            className="fixed bottom-8 right-8 w-16 h-16 text-white rounded-[2rem] shadow-warm-lg flex items-center justify-center z-40"
            style={{ backgroundColor: '#5C6B4A' }}
            title={`Ask about ${destination}`}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            <MessageCircle size={24} strokeWidth={1.5} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            className="fixed bottom-8 right-8 w-[400px] max-w-[calc(100vw-64px)] bg-card border border-border/50 rounded-[2rem] shadow-warm-lg z-50 flex flex-col max-h-[550px] overflow-hidden"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            {/* Header */}
            <div className="p-5 border-b border-border/50 flex items-center justify-between text-white rounded-t-[2rem]" style={{ backgroundColor: '#5C6B4A' }}>
              <div>
                <h3 className="font-heading font-semibold flex items-center gap-2">
                  <MessageCircle size={18} strokeWidth={1.5} />
                  Ask about {destination}
                </h3>
                <p className="text-sm text-white/70 font-body font-light mt-0.5">
                  Restaurants, activities, tips...
                </p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-white/10 rounded-full transition-colors duration-300"
              >
                <X size={18} strokeWidth={1.5} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 min-h-[220px] max-h-[320px]">
              {messages.length === 0 ? (
                <div className="text-center text-muted py-12">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: 'rgba(92, 107, 74, 0.1)' }}>
                    <MessageCircle size={24} style={{ color: '#5C6B4A' }} strokeWidth={1} />
                  </div>
                  <p className="font-heading font-medium text-foreground mb-1">Ask me anything about {destination}</p>
                  <p className="text-xs font-body font-light">e.g., &quot;Best local restaurants&quot; or &quot;Things to do at night&quot;</p>
                </div>
              ) : (
                messages.map((message, index) => (
                  <motion.div
                    key={index}
                    className={`${
                      message.role === 'user'
                        ? 'ml-auto text-white'
                        : 'bg-background'
                    } rounded-[1.5rem] p-4 max-w-[85%] ${
                      message.role === 'user' ? 'rounded-br-lg' : 'rounded-bl-lg'
                    }`}
                    style={message.role === 'user' ? { backgroundColor: '#5C6B4A' } : undefined}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="text-sm font-body font-light leading-relaxed">
                      {message.role === 'user' 
                        ? message.content 
                        : formatMessage(message.content)
                      }
                    </div>
                  </motion.div>
                ))
              )}
              {isLoading && (
                <motion.div 
                  className="bg-background rounded-[1.5rem] p-4 max-w-[85%] rounded-bl-lg"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <div className="flex gap-1.5">
                    <div className="w-2 h-2 bg-muted rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-muted rounded-full animate-bounce [animation-delay:0.1s]" />
                    <div className="w-2 h-2 bg-muted rounded-full animate-bounce [animation-delay:0.2s]" />
                  </div>
                </motion.div>
              )}
            </div>

            {/* Input */}
            <form onSubmit={handleSubmit} className="p-5 border-t border-border/50">
              <div className="flex gap-3">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type your question..."
                  className="flex-1 px-5 py-3 border border-border/50 rounded-full bg-background focus:outline-none focus:ring-2 focus:ring-secondary/30 focus:border-secondary/50 text-sm font-body font-light transition-all duration-300"
                  disabled={isLoading}
                  autoFocus
                />
                <motion.button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className="p-3 text-white rounded-full disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-300"
                  style={{ backgroundColor: '#5C6B4A' }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {isLoading ? (
                    <Loader2 size={18} className="animate-spin" strokeWidth={1.5} />
                  ) : (
                    <Send size={18} strokeWidth={1.5} />
                  )}
                </motion.button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
