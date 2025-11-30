import React, { useState, useRef, useEffect } from 'react';
import { streamChatResponse } from '../services/geminiService';
import { ChatMessage } from '../types';
import { Send, User, Bot, StopCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const Chat: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: 'welcome', role: 'model', text: 'Hello! I am your AI Legal Tutor. How can I help you study today?', timestamp: Date.now() }
  ]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isStreaming) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsStreaming(true);

    const modelMsgId = (Date.now() + 1).toString();
    setMessages(prev => [...prev, { id: modelMsgId, role: 'model', text: '', timestamp: Date.now() }]);

    try {
      // Prepare history (excluding the very last empty model message we just added)
      const history = messages.map(m => ({ role: m.role, text: m.text }));
      
      let fullText = '';
      await streamChatResponse(history, userMsg.text, (chunk) => {
        fullText += chunk;
        setMessages(prev => 
          prev.map(m => m.id === modelMsgId ? { ...m, text: fullText } : m)
        );
      });
    } catch (error) {
      setMessages(prev => [...prev, { id: 'error', role: 'model', text: 'Sorry, I encountered an error.', timestamp: Date.now() }]);
    } finally {
      setIsStreaming(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-8rem)] flex flex-col bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-4 bg-juris-800 text-white flex items-center gap-3">
        <Bot size={24} />
        <div>
          <h2 className="font-bold">Juris Tutor</h2>
          <p className="text-xs text-juris-200">AI Study Assistant</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-gold-500 text-white' : 'bg-juris-700 text-white'}`}>
              {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
            </div>
            <div className={`max-w-[80%] rounded-2xl p-4 text-sm leading-relaxed shadow-sm ${
              msg.role === 'user' 
                ? 'bg-juris-600 text-white rounded-tr-none' 
                : 'bg-white text-gray-800 border border-gray-200 rounded-tl-none'
            }`}>
              {msg.role === 'model' ? (
                <div className="prose prose-sm max-w-none">
                  <ReactMarkdown>{msg.text}</ReactMarkdown>
                </div>
              ) : (
                msg.text
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-white border-t border-gray-200">
        <div className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask a legal question..."
            disabled={isStreaming}
            className="w-full pl-4 pr-12 py-3 bg-gray-100 border-none rounded-full focus:ring-2 focus:ring-juris-500 focus:outline-none focus:bg-white transition-all"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isStreaming}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-juris-600 hover:text-juris-800 disabled:opacity-30 transition-colors"
          >
            {isStreaming ? <StopCircle className="animate-pulse" /> : <Send size={20} />}
          </button>
        </div>
        <p className="text-center text-xs text-gray-400 mt-2">
          AI can make mistakes. Verify with your casebooks.
        </p>
      </div>
    </div>
  );
};

export default Chat;