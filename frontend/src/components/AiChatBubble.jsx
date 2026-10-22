import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  X,
  Send,
  RotateCcw,
  Volume2,
  Bot,
  User,
  Compass,
  BookOpen,
  HelpCircle,
  PenTool,
  Languages,
  Zap
} from 'lucide-react';
import { sendChatMessage, AI_SUGGESTIONS } from '../services/aiService';
import { speakJapanese } from '../services/api';
import { sounds } from '../services/sounds';

const QUICK_CATEGORIES = [
  {
    icon: Compass,
    label: 'Trợ từ N5',
    color: '#8b5cf6',
    prompt: 'Phân biệt cách dùng trợ từ に và で khi chỉ địa điểm?'
  },
  {
    icon: BookOpen,
    label: 'Ngữ pháp Minna',
    color: '#2563eb',
    prompt: 'Giải thích cấu trúc ngữ pháp động từ thể Te (V-て + ください) trong Minna Bài 14?'
  },
  {
    icon: PenTool,
    label: 'Hán tự Kanji',
    color: '#059669',
    prompt: 'Mẹo nhớ nhanh 10 chữ Hán Kanji cơ bản nhất trong Minna no Nihongo?'
  },
  {
    icon: Languages,
    label: 'Dịch câu',
    color: '#d97706',
    prompt: 'Dịch câu này sang tiếng Nhật lịch sự: "Ngày mai tôi muốn đến trường lúc 8 giờ sáng"?'
  }
];

const AiChatBubble = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState(() => {
    try {
      const saved = localStorage.getItem('hyper_ai_chat_history');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return [
      {
        id: 'welcome',
        role: 'assistant',
        text: 'Konnichiwa! Mình là **Sensei AI** — Trợ lý học tiếng Nhật thông minh tại HYPER JAPAN.\n\nMình có thể giải đáp chi tiết từ vựng, ngữ pháp 25 bài Minna, cách dùng trợ từ, phân tích Hán tự Kanji N5–N1, hoặc dịch câu tiếng Nhật. Bạn đang cần ôn phần nào hôm nay?',
        timestamp: Date.now()
      }
    ];
  });

  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('hyper_ai_chat_history', JSON.stringify(messages));
    } catch {}
  }, [messages]);

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  // Adjust textarea height automatically
  const handleInputChange = (e) => {
    setInputValue(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 100)}px`;
    }
  };

  const handleSend = async (overrideText = null) => {
    const textToSend = (overrideText ?? inputValue).trim();
    if (!textToSend || isLoading) return;

    sounds.playFlip?.();
    setErrorMsg('');
    const userMsg = {
      id: `u-${Date.now()}`,
      role: 'user',
      text: textToSend,
      timestamp: Date.now()
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInputValue('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    setIsLoading(true);

    try {
      // Build history for API (filter out welcome)
      const apiHistory = newMessages
        .filter((m) => m.id !== 'welcome')
        .slice(-8)
        .map((m) => ({
          role: m.role,
          text: m.text
        }));

      // Call Gemini Assistant
      const reply = await sendChatMessage(apiHistory.slice(0, -1), textToSend);

      const assistantMsg = {
        id: `a-${Date.now()}`,
        role: 'assistant',
        text: reply,
        timestamp: Date.now()
      };

      sounds.playCorrect?.();
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      console.error('Chat error:', err);
      setErrorMsg(err.message || 'Không thể kết nối với Sensei AI. Vui lòng thử lại!');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClearHistory = () => {
    sounds.playFlip?.();
    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        text: 'Konnichiwa! Cuộc trò chuyện đã được làm mới. Hãy hỏi Sensei bất kỳ câu hỏi ngữ pháp hoặc tiếng Nhật nào nhé!',
        timestamp: Date.now()
      }
    ]);
    setErrorMsg('');
  };

  // Play pronunciation for Japanese snippets in answer
  const handleSpeakSnippet = (text) => {
    sounds.playFlip?.();
    const jpMatch = text.match(/[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]+/);
    if (jpMatch) {
      speakJapanese(jpMatch[0]);
    }
  };

  return (
    <>
      {/* ── 1. Compact Floating Trigger Bubble (Zero Text, Sleek & Minimal) ── */}
      {!isOpen && (
        <div
          className="ai-compact-bubble-trigger animate-bounce-subtle"
          onClick={() => {
            sounds.playFlip?.();
            setIsOpen(true);
          }}
          title="Sensei AI • Trợ lý Nhật ngữ 24/7"
          role="button"
          tabIndex={0}
          aria-label="Mở trợ lý AI"
        >
          {/* Subtle breathing pulse ring */}
          <div className="ai-compact-ring" />

          {/* Main button squircle */}
          <div className="ai-compact-core">
            <Sparkles size={20} className="text-white ai-sparkle-icon" />
            <span className="ai-live-dot" />
          </div>
        </div>
      )}

      {/* ── 2. Luxury Floating Chat Window ── */}
      {isOpen && (
        <div className="ai-luxury-window animate-scale-up">
          {/* Top Brand Header */}
          <div className="ai-luxury-header d-flex align-items-center justify-content-between p-3 text-white position-relative">
            <div className="d-flex align-items-center gap-2.5 min-w-0">
              <div className="ai-avatar-core position-relative flex-shrink-0">
                <Bot size={19} className="text-white" />
                <span className="ai-avatar-status-dot" />
              </div>

              <div className="min-w-0">
                <div className="d-flex align-items-center gap-1.5 flex-wrap">
                  <h6 className="fw-bold mb-0 text-white" style={{ fontSize: '14px', letterSpacing: '-0.01em' }}>
                    Sensei AI
                  </h6>
                  <span className="badge bg-primary bg-opacity-30 text-white border border-primary border-opacity-30 rounded-pill px-1.5 py-0.5" style={{ fontSize: '9px', fontWeight: 700 }}>
                    JLPT N5–N1
                  </span>
                </div>
                <div className="d-flex align-items-center gap-1 text-white text-opacity-75" style={{ fontSize: '11px' }}>
                  <span className="ai-pulse-green" />
                  <span>Trực tuyến • Sẵn sàng 24/7</span>
                </div>
              </div>
            </div>

            <div className="d-flex align-items-center gap-1.5 flex-shrink-0">
              <button
                type="button"
                onClick={handleClearHistory}
                className="ai-action-btn"
                title="Làm mới hội thoại"
              >
                <RotateCcw size={13} />
              </button>
              <button
                type="button"
                onClick={() => {
                  sounds.playFlip?.();
                  setIsOpen(false);
                }}
                className="ai-action-btn close-btn"
                title="Thu nhỏ cửa sổ"
              >
                <X size={15} />
              </button>
            </div>
          </div>

          {/* Messages Scroll Area */}
          <div className="ai-luxury-body p-3">
            {/* Quick Category Cards on Fresh Chat */}
            {messages.length <= 1 && (
              <div className="mb-3 p-2.5 rounded-3 border bg-white shadow-xs">
                <div className="d-flex align-items-center gap-1.5 text-muted small fw-bold mb-2" style={{ fontSize: '11px' }}>
                  <Zap size={13} className="text-warning" />
                  <span>Chủ đề gợi ý bắt đầu nhanh:</span>
                </div>
                <div className="row g-2">
                  {QUICK_CATEGORIES.map((cat, idx) => {
                    const IconComp = cat.icon;
                    return (
                      <div className="col-6" key={idx}>
                        <button
                          type="button"
                          onClick={() => handleSend(cat.prompt)}
                          className="ai-quick-cat-card w-100 text-start p-2 rounded-3 border text-dark transition-all"
                        >
                          <div className="d-flex align-items-center gap-1.5 mb-1">
                            <IconComp size={13} style={{ color: cat.color }} />
                            <span className="fw-bold small" style={{ fontSize: '11.5px' }}>{cat.label}</span>
                          </div>
                          <div className="text-muted text-truncate small" style={{ fontSize: '10.5px' }}>
                            {cat.prompt}
                          </div>
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Chat Messages */}
            {messages.map((m) => {
              const isUser = m.role === 'user';
              return (
                <div
                  key={m.id}
                  className={`d-flex mb-3 ${isUser ? 'justify-content-end' : 'justify-content-start'}`}
                >
                  {!isUser && (
                    <div className="ai-bubble-avatar flex-shrink-0 me-2">
                      <Bot size={14} />
                    </div>
                  )}

                  <div className={`ai-bubble-content ${isUser ? 'ai-bubble-user' : 'ai-bubble-ai'}`}>
                    <div className="ai-bubble-text" style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontSize: '12.8px', lineHeight: '1.6' }}>
                      {m.text}
                    </div>

                    {!isUser && /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/.test(m.text) && (
                      <div className="mt-2 pt-1.5 border-top border-slate-100 d-flex justify-content-end">
                        <button
                          type="button"
                          onClick={() => handleSpeakSnippet(m.text)}
                          className="btn btn-sm btn-link p-0 text-primary d-inline-flex align-items-center gap-1 text-decoration-none fw-semibold"
                          style={{ fontSize: '11px' }}
                          title="Nghe phát âm tiếng Nhật trong câu"
                        >
                          <Volume2 size={13} />
                          <span>Phát âm Tokyo</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Loading / Typing Wave Indicator */}
            {isLoading && (
              <div className="d-flex mb-3 justify-content-start">
                <div className="ai-bubble-avatar flex-shrink-0 me-2">
                  <Bot size={14} />
                </div>
                <div className="ai-bubble-content ai-bubble-ai d-flex align-items-center gap-2 py-2 px-3">
                  <div className="ai-wave-dots">
                    <span />
                    <span />
                    <span />
                  </div>
                  <span className="small text-muted" style={{ fontSize: '11.5px' }}>
                    Sensei đang soạn lời giải...
                  </span>
                </div>
              </div>
            )}

            {/* Error Banner */}
            {errorMsg && (
              <div className="p-2.5 mb-2.5 rounded-3 bg-danger bg-opacity-10 border border-danger border-opacity-25 text-danger small text-center" style={{ fontSize: '11.5px' }}>
                {errorMsg}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestions Horizontal Strip */}
          {!isLoading && messages.length > 1 && (
            <div className="px-3 py-1.5 bg-slate-50 border-top border-slate-100">
              <div className="d-flex gap-1.5 overflow-x-auto pb-0.5 no-scrollbar">
                {AI_SUGGESTIONS.slice(0, 3).map((sugg, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSend(sugg)}
                    className="ai-mini-chip flex-shrink-0"
                  >
                    {sugg}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Footer Area */}
          <div className="ai-luxury-footer p-2.5 bg-white border-top">
            <div className="d-flex align-items-end gap-2 bg-slate-50 p-1.5 rounded-4 border focus-within-active">
              <textarea
                ref={textareaRef}
                value={inputValue}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder="Nhập câu hỏi tiếng Nhật, ngữ pháp, Kanji..."
                rows={1}
                className="form-control border-0 bg-transparent p-1 shadow-none"
                style={{
                  resize: 'none',
                  fontSize: '13px',
                  maxHeight: '100px',
                  minHeight: '28px',
                  lineHeight: '1.4'
                }}
              />
              <button
                type="button"
                onClick={() => handleSend()}
                disabled={!inputValue.trim() || isLoading}
                className={`ai-send-action-btn ${inputValue.trim() && !isLoading ? 'is-ready' : ''}`}
                title="Gửi câu hỏi (Enter)"
              >
                <Send size={14} />
              </button>
            </div>
            <div className="d-flex justify-content-between align-items-center px-1 mt-1 text-muted" style={{ fontSize: '10px' }}>
              <span>Sensei AI • Chuẩn dữ liệu JLPT quốc tế</span>
              <span>Enter để gửi</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AiChatBubble;
