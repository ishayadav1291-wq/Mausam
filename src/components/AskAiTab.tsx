import React, { useState, useRef, useEffect } from 'react';
import { CityLocation, PersonalizedWeatherFeed } from '../types';
import { Trash2, Send, ChevronLeft, ChevronRight } from 'lucide-react';

interface AskAiTabProps {
  currentCity: CityLocation;
  weatherData: PersonalizedWeatherFeed;
}

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

export const AskAiTab: React.FC<AskAiTabProps> = ({ currentCity, weatherData }) => {
  const getInitialMessage = (): Message => ({
    id: 'initial',
    sender: 'assistant',
    text: `Ask any question about today's weather in ${currentCity.name} (${weatherData.currentTempC}°C, ${weatherData.condition}). Answers are short and direct.`,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  });

  const [messages, setMessages] = useState<Message[]>([getInitialMessage()]);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const sliderRef = useRef<HTMLDivElement>(null);

  // Reset or update welcome message when city changes
  useEffect(() => {
    setMessages([getInitialMessage()]);
  }, [currentCity.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  const quickPrompts = [
    'Can I run outside now?',
    'Will it rain today?',
    'Do I need sunscreen?',
    'Is the air clean today?',
    'Any commute delays?'
  ];

  const handleSendPrompt = async (promptText: string) => {
    if (!promptText.trim() || isThinking) return;

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg: Message = {
      id: `user_${Date.now()}`,
      sender: 'user',
      text: promptText,
      timestamp: timeStr
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsThinking(true);

    // Call Gemini backend proxy or generate instant contextual answer matching reference video
    try {
      const response = await fetch('/api/gemini/maps-weather', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: promptText,
          location: `${currentCity.name}, ${currentCity.state}`
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.text) {
          setMessages((prev) => [
            ...prev,
            {
              id: `ai_${Date.now()}`,
              sender: 'assistant',
              text: data.text,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }
          ]);
          setIsThinking(false);
          return;
        }
      }
    } catch {
      // Fallback to crisp instant contextual weather answers
    }

    // Contextual responses matching video behavior
    setTimeout(() => {
      let reply = `Weather in ${currentCity.name} is ${weatherData.condition.toLowerCase()} with temperature around ${weatherData.currentTempC}°C.`;

      const pLower = promptText.toLowerCase();
      if (pLower.includes('run outside') || pLower.includes('workout') || pLower.includes('exercise')) {
        reply = `Best time to run is 6:00 to 8:00 AM while it is cool. Avoid midday heat (${weatherData.currentTempC}°C) and drink water often.`;
      } else if (pLower.includes('air clean') || pLower.includes('aqi') || pLower.includes('pollution')) {
        reply = `Weather is clear. Stay hydrated. (Air quality index: ${weatherData.health.aqi.current} AQI - ${weatherData.health.aqi.status}).`;
      } else if (pLower.includes('rain') || pLower.includes('umbrella')) {
        const rainProb = weatherData.events.fourteenDayOutlook[0]?.rainProb ?? 15;
        reply = rainProb > 40
          ? `Rain likelihood is ${rainProb}%. Carrying a compact umbrella is recommended.`
          : `No rain expected today. Sky remains ${weatherData.condition.toLowerCase()}.`;
      } else if (pLower.includes('sunscreen') || pLower.includes('uv')) {
        reply = `UV index is ${weatherData.health.uvIndex.current} (${weatherData.health.uvIndex.status}). Apply SPF 30+ sunscreen if out over 20 minutes.`;
      } else if (pLower.includes('commute') || pLower.includes('traffic') || pLower.includes('road')) {
        const visKm = (weatherData.commuter.visibility.distanceMeters / 1000).toFixed(1);
        reply = `Normal transit conditions (${weatherData.commuter.trafficWeatherCorrelation.impactLevel}). Delay index +${weatherData.commuter.trafficWeatherCorrelation.delayMinutes} mins. Visibility is ${visKm} km.`;
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `ai_${Date.now()}`,
          sender: 'assistant',
          text: reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
      setIsThinking(false);
    }, 750);
  };

  const handleClearChat = () => {
    setMessages([getInitialMessage()]);
  };

  const scrollSlider = (direction: 'left' | 'right') => {
    if (sliderRef.current) {
      const offset = direction === 'left' ? -150 : 150;
      sliderRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 text-slate-800">
      {/* Header matching video frame 0:46 */}
      <div className="p-3.5 bg-white border-b border-slate-200 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black text-sm shadow-xs">
            M
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 leading-tight">Ask Weather AI</h3>
            <span className="text-[11px] text-slate-500 font-medium">
              {currentCity.name} ({weatherData.currentTempC}°C, {weatherData.condition})
            </span>
          </div>
        </div>

        <button
          onClick={handleClearChat}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          title="Clear Conversation"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Messages Stream */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => {
          const isAi = msg.sender === 'assistant';
          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isAi ? 'items-start' : 'items-end'}`}
            >
              <div className="flex items-end gap-1.5 max-w-[85%]">
                {isAi && (
                  <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 font-bold text-[10px] flex items-center justify-center shrink-0 mb-1">
                    AI
                  </div>
                )}

                <div
                  className={`px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed shadow-2xs whitespace-pre-line ${
                    isAi
                      ? 'bg-white text-slate-800 border border-slate-200/90 rounded-bl-xs'
                      : 'bg-blue-600 text-white rounded-br-xs'
                  }`}
                >
                  {msg.text.replace(/\*\*/g, '')}
                </div>

                {!isAi && (
                  <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-bold text-[10px] flex items-center justify-center shrink-0 mb-1">
                    You
                  </div>
                )}
              </div>

              <span className="text-[10px] text-slate-400 mt-1 px-8">
                {msg.timestamp}
              </span>
            </div>
          );
        })}

        {/* Thinking Indicator */}
        {isThinking && (
          <div className="flex items-center gap-2 text-slate-500 text-xs px-2 animate-in fade-in">
            <div className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />
            <span className="italic text-[11px]">Checking weather details...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts Carousel Slider matching video frame 0:46 */}
      <div className="px-3 pt-2 bg-white/95 border-t border-slate-200/70 relative">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => scrollSlider('left')}
            className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 shrink-0 cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div
            ref={sliderRef}
            className="flex-1 flex items-center gap-2 overflow-x-auto no-scrollbar py-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
          >
            {quickPrompts.map((p, idx) => (
              <button
                key={idx}
                onClick={() => handleSendPrompt(p)}
                disabled={isThinking}
                className="px-3 py-1.5 rounded-full bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 text-xs font-semibold whitespace-nowrap transition-colors border border-slate-200/80 shrink-0 cursor-pointer"
              >
                {p}
              </button>
            ))}
          </div>

          <button
            onClick={() => scrollSlider('right')}
            className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 shrink-0 cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Input Bar matching video frame 0:46 */}
      <div className="p-3 bg-white border-t border-slate-200 shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendPrompt(input);
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your question..."
            disabled={isThinking}
            className="flex-1 px-4 py-2.5 rounded-full border border-slate-200 bg-slate-50 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white transition-all shadow-inner"
          />
          <button
            type="submit"
            disabled={!input.trim() || isThinking}
            className="w-9 h-9 rounded-full bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white flex items-center justify-center transition-colors shadow-xs cursor-pointer shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
