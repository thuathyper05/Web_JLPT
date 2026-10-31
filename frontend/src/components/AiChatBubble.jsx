import React, { useState, useRef, useEffect } from 'react';
import { aiService } from '../services/api';
import { sounds } from '../services/sounds';
import { Sparkles, MessageSquare, X, Send, Bot, User, CornerDownLeft } from 'lucide-react';

export default function AiChatBubble() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: 'Konnichiwa! (こんにちは!) Tôi là AI Sensei của NihongoHub. Bạn có câu hỏi nào về từ vựng, ngữ pháp, kanji hay bài tập N5 hôm nay không?'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (textToSend) => {
    const q = textToSend || input;
    if (!q.trim() || loading) return;

    sounds.playFlip();
    const userMsg = { sender: 'user', text: q };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await aiService.query({ action: 'chat', prompt: q });
      if (res.data?.success && res.data.data?.reply) {
        sounds.playCorrect();
        setMessages((prev) => [
          ...prev,
          {
            sender: 'ai',
            text: res.data.data.reply,
            suggestions: res.data.data.suggestions
          }
        ]);
      } else {
        throw new Error();
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: 'Xin lỗi bạn, kết nối trợ lý AI đang gián đoạn một chút. Bạn có thể hỏi lại hoặc nhấn vào nút "Hỏi trợ lý AI" ngay trên từng bài học nhé!'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Trigger Button */}
      <div className="fixed right-4 bottom-20 lg:bottom-6 z-40">
        <button
          type="button"
          onClick={() => { sounds.playFlip(); setIsOpen(!isOpen); }}
          className="group relative flex items-center gap-2 px-4 py-3 rounded-full bg-gradient-to-r from-pink-600 via-rose-500 to-pink-500 text-white font-bold text-xs shadow-lotus-lg hover:scale-105 active:scale-95 transition-all"
          aria-label="Mở Trợ lý AI"
        >
          <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center animate-pulse">
            <Sparkles size={14} className="text-white" />
          </div>
          <span className="hidden sm:inline tracking-tight font-extrabold">Hỏi Trợ Lý AI</span>
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 absolute top-1 right-1 ring-2 ring-white" />
        </button>
      </div>

      {/* Expanded Chat Drawer / Popover Window */}
      {isOpen && (
        <div
          className="fixed right-4 bottom-24 lg:bottom-20 z-50 w-[calc(100vw-32px)] sm:w-96 bg-white rounded-3xl shadow-2xl border border-pink-100 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4"
          style={{ height: '480px', maxHeight: '75vh' }}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-pink-600 via-rose-500 to-pink-500 px-4 py-3 text-white flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
                <Bot size={18} className="text-white" />
              </div>
              <div>
                <h5 className="font-extrabold text-sm mb-0 text-white">AI Sensei</h5>
                <span className="text-[10.5px] text-pink-100 block -mt-0.5">
                  Gia sư tiếng Nhật thông minh 24/7
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10"
            >
              <X size={18} />
            </button>
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 p-3.5 overflow-y-auto space-y-3 bg-pink-50/20">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex gap-2 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.sender === 'ai' && (
                  <div className="w-6 h-6 rounded-full bg-pink-600 text-white flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">
                    AI
                  </div>
                )}
                <div
                  className={`max-w-[82%] px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed ${
                    m.sender === 'user'
                      ? 'bg-gradient-to-r from-pink-600 to-rose-500 text-white rounded-tr-sm shadow-sm'
                      : 'bg-white text-slate-800 border border-pink-100/80 rounded-tl-sm shadow-sm'
                  }`}
                >
                  <p className="mb-0 whitespace-pre-line">{m.text}</p>

                  {/* Suggestion Chips */}
                  {m.suggestions && m.suggestions.length > 0 && (
                    <div className="mt-2.5 pt-2 border-t border-pink-50 flex flex-wrap gap-1.5">
                      {m.suggestions.map((sug, sIdx) => (
                        <button
                          key={sIdx}
                          type="button"
                          onClick={() => handleSend(sug)}
                          className="px-2 py-1 rounded-lg bg-pink-50 hover:bg-pink-100 text-pink-700 text-[10.5px] font-semibold border border-pink-200/50 transition-colors text-left"
                        >
                          {sug}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex gap-2 items-center">
                <div className="w-6 h-6 rounded-full bg-pink-600 text-white flex items-center justify-center shrink-0 text-xs font-bold">
                  AI
                </div>
                <div className="bg-white border border-pink-100 px-3 py-2 rounded-2xl rounded-tl-sm shadow-sm text-xs text-pink-600 font-semibold flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-pink-500 animate-bounce" />
                  <span className="w-1.5 h-1.5 rounded-full bg-pink-500 animate-bounce [animation-delay:0.2s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-pink-500 animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Box */}
          <form
            onSubmit={(e) => { e.preventDefault(); handleSend(); }}
            className="p-2.5 border-t border-pink-100 bg-white flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Hỏi về từ vựng, ngữ pháp, kanji..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 px-3.5 py-2 rounded-xl bg-pink-50/50 border border-pink-200 text-xs focus:outline-none focus:ring-2 focus:ring-pink-500 focus:bg-white transition-all"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="w-8 h-8 rounded-xl bg-gradient-to-r from-pink-600 to-rose-500 text-white flex items-center justify-center shadow-lotus-sm disabled:opacity-40 transition-transform active:scale-95"
            >
              <Send size={14} />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
