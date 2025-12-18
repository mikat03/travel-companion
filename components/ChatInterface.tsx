
import React, { useState, useRef, useEffect } from 'react';
import { gemini } from '../services/geminiService';
import { Message } from '../types';

const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Welcome to Kyoto. The air is crisp today. Shall we explore the hidden moss gardens of Arashiyama, or perhaps find the best local matcha?",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      let location = undefined;
      try {
        const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject);
        });
        location = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
      } catch (e) {}

      const result = await gemini.generateTravelAdvice(input, location, messages);
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: result.text,
        timestamp: new Date(),
        groundingUrls: result.sources
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: "I've lost the signal briefly. Even the best guides need a moment. Try again?",
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div ref={scrollRef} className="flex-1 space-y-6 pb-24">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-4 duration-500`}>
            <div className={`max-w-[85%] p-5 rounded-[2rem] shadow-xl backdrop-blur-2xl border ${
              msg.role === 'user' 
              ? 'bg-slate-900/90 text-white border-white/10 rounded-tr-none' 
              : 'bg-white/40 text-slate-800 border-white/50 rounded-tl-none'
            }`}>
              <p className="text-sm font-medium leading-relaxed tracking-tight">{msg.content}</p>
              
              {msg.groundingUrls && msg.groundingUrls.length > 0 && (
                <div className="mt-4 pt-4 border-t border-black/5 flex flex-wrap gap-2">
                  {msg.groundingUrls.map((chunk: any, i: number) => {
                    const url = chunk.web?.uri || chunk.maps?.uri;
                    if (!url) return null;
                    return (
                      <a key={i} href={url} target="_blank" rel="noreferrer" className="text-[10px] bg-white/50 px-3 py-1.5 rounded-full hover:bg-white/80 transition-all font-bold uppercase tracking-wider flex items-center gap-2">
                        <i className={`fa-solid ${chunk.maps ? 'fa-map' : 'fa-link'}`}></i>
                        Source
                      </a>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white/30 backdrop-blur-xl border border-white/40 p-5 rounded-[2rem] rounded-tl-none flex items-center gap-1">
              <span className="w-1 h-1 bg-slate-600 rounded-full animate-bounce"></span>
              <span className="w-1 h-1 bg-slate-600 rounded-full animate-bounce delay-100"></span>
              <span className="w-1 h-1 bg-slate-600 rounded-full animate-bounce delay-200"></span>
            </div>
          </div>
        )}
      </div>

      {/* Floating Input Panel */}
      <div className="sticky bottom-4 left-0 right-0 z-20">
        <div className="bg-white/60 backdrop-blur-3xl border border-white/50 rounded-[2.5rem] p-2 flex items-center gap-2 shadow-[0_20px_50px_rgba(0,0,0,0.05)]">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Tell me a story about this place..."
            className="flex-1 bg-transparent border-none px-6 py-4 text-sm focus:ring-0 placeholder:text-slate-400 font-medium"
          />
          <button
            onClick={handleSend}
            disabled={isLoading}
            className="bg-slate-900 text-white w-14 h-14 rounded-full flex items-center justify-center hover:scale-105 active:scale-95 disabled:opacity-50 transition-all shadow-xl shadow-slate-900/30"
          >
            <i className="fa-solid fa-arrow-up text-lg"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
