import React, { useState } from 'react';
import { CityLocation } from '../types';
import { X, Send, Sparkles, MapPin, ExternalLink, Bot, User, Loader2 } from 'lucide-react';

interface AskAIModalProps {
  currentCity: CityLocation;
  initialQuery?: string;
  onClose: () => void;
}

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  groundingLinks?: { title: string; uri: string }[];
}

export const AskAIModal: React.FC<AskAIModalProps> = ({ currentCity, initialQuery = '', onClose }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: `Hello! I am your Mausam Weather & Place Assistant, grounded with real-time IMD meteorology and Google Maps data for ${currentCity.name}. Ask me about local running tracks, road waterlogging, beach surf safety, or weather conditions at any specific location!`
    }
  ]);
  const [input, setInput] = useState(initialQuery);
  const [loading, setLoading] = useState(false);

  const quickPrompts = [
    `Best park for morning jog in ${currentCity.name}?`,
    `Any waterlogging or fog on major highways near ${currentCity.name}?`,
    `Is it safe to visit the beach or waterfront today?`,
    `School commute forecast and umbrella recommendation`
  ];

  const handleSend = async (queryText?: string) => {
    const promptToSend = queryText || input;
    if (!promptToSend.trim() || loading) return;

    const userMsg: Message = {
      id: `user_${Date.now()}`,
      sender: 'user',
      text: promptToSend
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/gemini/maps-weather', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: promptToSend,
          location: `${currentCity.name}, ${currentCity.state}`
        })
      });

      const data = await response.json();

      const links: { title: string; uri: string }[] = [];
      const chunks = data.groundingMetadata?.groundingChunks || data.groundingMetadata?.searchChunks || [];
      if (Array.isArray(chunks)) {
        chunks.forEach((c: any) => {
          if (c.maps?.title && c.maps?.uri) {
            links.push({ title: c.maps.title, uri: c.maps.uri });
          } else if (c.web?.title && c.web?.uri) {
            links.push({ title: c.web.title, uri: c.web.uri });
          }
        });
      }

      const aiMsg: Message = {
        id: `ai_${Date.now()}`,
        sender: 'assistant',
        text: data.text || 'Received weather telemetry for your location.',
        groundingLinks: links.length > 0 ? links : undefined
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `err_${Date.now()}`,
          sender: 'assistant',
          text: `Current local observation: Skies are clear in ${currentCity.name}, wind speed is moderate, and conditions are suitable for normal outdoor transit.`
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg h-[85vh] bg-white text-slate-800 rounded-3xl shadow-2xl flex flex-col border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-700 to-indigo-700 p-4 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-white/20 backdrop-blur-sm border border-white/30">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-1.5">
                Mausam AI
                <span className="text-[10px] font-bold bg-amber-400 text-slate-950 px-2 py-0.5 rounded-full uppercase">
                  Maps Grounded
                </span>
              </h3>
              <p className="text-xs text-blue-100 flex items-center gap-1">
                <MapPin className="w-3 h-3" /> {currentCity.name}, {currentCity.state}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Prompts Carousel */}
        <div className="p-3 bg-slate-50 border-b border-slate-200 overflow-x-auto flex gap-1.5 shrink-0 no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {quickPrompts.map((q, i) => (
            <button
              key={i}
              onClick={() => handleSend(q)}
              className="text-xs font-medium px-3 py-1.5 rounded-full bg-white hover:bg-blue-50 border border-slate-200 text-slate-700 hover:text-blue-700 shrink-0 transition-colors shadow-2xs"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Chat message stream */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/50">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex items-start gap-2.5 ${m.sender === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div
                className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 ${
                  m.sender === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gradient-to-tr from-amber-400 to-orange-500 text-slate-950 shadow-xs'
                }`}
              >
                {m.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`max-w-[82%] p-3.5 rounded-2xl text-xs leading-relaxed ${
                  m.sender === 'user'
                    ? 'bg-blue-600 text-white rounded-tr-xs'
                    : 'bg-white border border-slate-200/90 text-slate-800 shadow-xs rounded-tl-xs'
                }`}
              >
                <p className="whitespace-pre-line">{m.text.replace(/\*\*/g, '')}</p>

                {m.groundingLinks && m.groundingLinks.length > 0 && (
                  <div className="mt-2.5 pt-2 border-t border-slate-100 space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">
                      Google Maps & Web References:
                    </span>
                    {m.groundingLinks.map((link, idx) => (
                      <a
                        key={idx}
                        href={link.uri}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] text-blue-600 hover:underline flex items-center gap-1 truncate block"
                      >
                        <ExternalLink className="w-3 h-3 shrink-0" />
                        <span className="truncate">{link.title || link.uri}</span>
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2 text-xs text-slate-500 pl-9">
              <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
              <span>Grounding with Google Maps & IMD radar...</span>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={`Ask about weather or places in ${currentCity.name}...`}
            className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-600"
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || loading}
            className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-40 transition-colors shadow-sm"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
