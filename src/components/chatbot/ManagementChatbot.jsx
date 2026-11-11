import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  X,
  Send,
  Sparkles,
  Bot,
  User,
  ShieldCheck,
  Building2,
  Boxes,
  Clock,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Minimize2,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export const ManagementChatbot = () => {
  const { currentUser } = useAuth();
  const toast = useToast();

  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'bot',
      text: `Hello ${currentUser?.name || 'Administrator'}. I am the **SURGREADY Management Assistant**.\n\nI provide verified hospital operations data, case scheduling summaries, low-stock threshold alerts, and surgeon review progress directly from authorized hospital records.\n\nHow can I assist you with hospital operations today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      sources: ['St. Jude Medical Center Database', 'Hospital Inventory Ledger']
    }
  ]);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  // Strict Role Check: Render ONLY for verified 'management' role
  const userRole = (currentUser?.role || '').toLowerCase();
  if (userRole !== 'management') {
    return null; // Deny rendering for doctors, nurses, and patients
  }

  const suggestedQuestions = [
    'How many patient cases are scheduled this week?',
    'Which implants are low in stock or out of stock?',
    'Show pending surgeon reviews.',
    'Give me today’s hospital case summary.',
    'Show cases that require inventory attention.'
  ];

  const handleSendMessage = async (textToSend) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || isLoading) return;

    const userMsg = {
      id: 'msg-' + Date.now(),
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('http://127.0.0.1:8000/api/v1/chat/management-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          user_role: currentUser?.role || 'management',
          user_name: currentUser?.name || 'Management Director',
          user_email: currentUser?.email || 'management@stjude-health.org',
          hospital_id: 'HOSP-STJUDE-01'
        })
      });

      if (!response.ok) {
        if (response.status === 403) {
          throw new Error('Access Forbidden: Management permissions required.');
        }
        throw new Error(`Server returned status ${response.status}`);
      }

      const data = await response.json();
      const botMsg = {
        id: 'bot-' + Date.now(),
        sender: 'bot',
        text: data.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        sources: data.sources_consulted || [],
        dataPoints: data.data_points || {}
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.error('[Chatbot Error]', err);
      const errMsg = {
        id: 'err-' + Date.now(),
        sender: 'bot',
        text: `⚠️ **Error retrieving information:** ${err.message}. Please verify the backend service is running or check administrative permissions.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isError: true
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = () => {
    setMessages([
      {
        id: 'welcome-reset',
        sender: 'bot',
        text: `Conversation cleared. How can I assist you with hospital operations, inventory alerts, or patient case statuses?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
    toast.info('Conversation history reset.');
  };

  return (
    <>
      {/* Floating Action Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-indigo-700 via-indigo-800 to-blue-800 text-white font-bold shadow-xl hover:shadow-2xl hover:scale-105 transition-all border border-indigo-400/30 group animate-in fade-in"
          title="Open SURGREADY Management Assistant"
        >
          <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center">
            <Bot className="w-4 h-4 text-indigo-200 group-hover:rotate-12 transition-transform" />
          </div>
          <span className="text-xs tracking-tight">Management Assistant</span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        </button>
      )}

      {/* Slide-over / Modal Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-full max-w-lg h-[640px] max-h-[88vh] bg-white rounded-3xl shadow-2xl border border-slate-200/90 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-900 text-white flex items-center justify-between border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-500/30 border border-indigo-400/30 flex items-center justify-center text-indigo-200 shadow-xs">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-black tracking-tight">SURGREADY Assistant</h3>
                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-md bg-indigo-400/20 text-indigo-200 border border-indigo-400/30">
                    MANAGEMENT ONLY
                  </span>
                </div>
                <p className="text-[11px] text-slate-300">Live Hospital Operations & Inventory Intelligence</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleClearHistory}
                title="Clear Conversation"
                className="p-1.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                title="Minimize Chat"
                className="p-1.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Clinical & Role Security Badge Banner */}
          <div className="px-3.5 py-2 bg-indigo-50/80 border-b border-indigo-100 flex items-center justify-between text-[11px] text-indigo-950">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-600 flex-shrink-0" />
              <span>Verified Session: <strong className="font-semibold">{currentUser?.name}</strong></span>
            </div>
            <span className="font-mono text-[10px] text-indigo-700 bg-white px-2 py-0.5 rounded border border-indigo-200">
              Role: Management
            </span>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50/60">
            {messages.map((msg) => {
              const isUser = msg.sender === 'user';
              return (
                <div
                  key={msg.id}
                  className={`flex items-start gap-2.5 ${isUser ? 'flex-row-reverse' : ''}`}
                >
                  <div
                    className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs flex-shrink-0 shadow-xs ${
                      isUser
                        ? 'bg-blue-600 text-white'
                        : 'bg-indigo-950 text-indigo-200'
                    }`}
                  >
                    {isUser ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                  </div>

                  <div className={`max-w-[82%] space-y-1`}>
                    <div
                      className={`p-3.5 rounded-2xl text-xs leading-relaxed shadow-xs whitespace-pre-wrap ${
                        isUser
                          ? 'bg-brand-primary text-white rounded-tr-xs font-medium'
                          : msg.isError
                          ? 'bg-rose-50 text-rose-800 border border-rose-200 rounded-tl-xs'
                          : 'bg-white text-slate-800 border border-slate-200/80 rounded-tl-xs'
                      }`}
                    >
                      {msg.text}
                    </div>

                    {/* Sources Badge */}
                    {!isUser && msg.sources && msg.sources.length > 0 && (
                      <div className="flex flex-wrap gap-1 px-1">
                        {msg.sources.map((src, i) => (
                          <span
                            key={i}
                            className="text-[9px] font-semibold text-slate-400 bg-slate-100 px-1.5 py-0.2 rounded"
                          >
                            Source: {src}
                          </span>
                        ))}
                      </div>
                    )}

                    <span
                      className={`text-[9px] text-slate-400 block px-1 ${
                        isUser ? 'text-right' : 'text-left'
                      }`}
                    >
                      {msg.timestamp}
                    </span>
                  </div>
                </div>
              );
            })}

            {isLoading && (
              <div className="flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-xl bg-indigo-950 text-indigo-200 flex items-center justify-center text-xs flex-shrink-0">
                  <Bot className="w-3.5 h-3.5 animate-spin" />
                </div>
                <div className="p-3 bg-white border border-slate-200 rounded-2xl rounded-tl-xs text-xs text-slate-500 shadow-xs flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce" />
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce [animation-delay:0.2s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce [animation-delay:0.4s]" />
                  <span>Consulting hospital database records...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggested Prompt Chips */}
          <div className="px-3.5 py-2 bg-white border-t border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Suggested Questions:
            </span>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              {suggestedQuestions.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(q)}
                  disabled={isLoading}
                  className="px-2.5 py-1 text-[11px] font-medium bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 rounded-full border border-slate-200 whitespace-nowrap transition-colors flex-shrink-0"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          {/* Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 bg-white border-t border-slate-200 flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Ask about cases, low stock, surgeon reviews..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              disabled={isLoading}
              className="flex-1 px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              type="submit"
              disabled={!inputMessage.trim() || isLoading}
              className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white transition-colors flex items-center justify-center shadow-xs"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
};

