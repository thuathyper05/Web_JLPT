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
  MessageCircle,
  Minimize2,
  ChevronDown
} from 'lucide-react';
import { sendChatMessage, AI_SUGGESTIONS } from '../services/aiService';
import { speakJapanese } from '../services/api';
import { sounds } from '../services/sounds';

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
        text: 'Konnichiwa! Mình là **Sensei AI** — Trợ lý học tiếng Nhật thông minh của bạn tại HYPER JAPAN.\n\nMình có thể giải đáp chi tiết từ vựng, ngữ pháp 25 bài Minna, cách dùng trợ từ, phân tích Hán tự Kanji N5–N1, hoặc dịch câu tiếng Nhật. Bạn đang cần ôn phần nào hôm nay?',
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
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 110)}px`;
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
        .filter(m => m.id !== 'welcome')
        .slice(-8)
        .map(m => ({
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
      setMessages(prev => [...prev, assistantMsg]);
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
      {/* ── 1. Floating Trigger Bubble (Fixed Bottom Right) ── */}
      {!isOpen && (
        <div
          className="ai-chat-bubble-trigger animate-bounce-subtle"
          onClick={() => {
            sounds.playFlip?.();
            setIsOpen(true);
          }}
          title="Trò chuyện cùng Sensei AI • Trợ lý Nhật ngữ 24/7"
          role="button"
          tabIndex={0}
        >
          {/* Pulsing ring */}
          <div className="ai-bubble-ring" />
          
          <div className="ai-bubble-inner">
            <Sparkles size={22} className="text-white" />
            <span className="ai-online-dot" />
          </div>

          <div className="ai-bubble-tooltip d-none d-md-flex align-items-center gap-1.5">
            <span className="fw-bold" style={{ fontSize: '12px' }}>Hỏi Sensei AI</span>
            <span className="badge bg-warning text-dark fw-bold rounded-pill" style={{ fontSize: '9px', padding: '1px 5px' }}>
              PRO
            </span>
          </div>
        </div>
      )}

      {/* ── 2. Floating Chat Window / Bottom Drawer ── */}
      {isOpen && (
        <div className="ai-chat-window animate-scale-up">
          {/* Header */}
          <div className="ai-chat-header d-flex align-items-center justify-content-between p-3 text-white">
            <div className="d-flex align-items-center gap-2.5">
              <div className="ai-avatar-badge position-relative">
                <Bot size={20} className="text-white" />
                <span className="ai-online-dot-inner" />
              </div>
              <div>
                <div className="d-flex align-items-center gap-1.5">
                  <h6 className="fw-bold mb-0 text-white" style={{ fontSize: '14.5px', letterSpacing: '-0.01em' }}>
                    Sensei AI
                  </h6>
                  <span className="badge bg-white bg-opacity-20 text-white fw-bold rounded-pill" style={{ fontSize: '9px', padding: '2px 6px' }}>
                    JLPT 24/7
                  </span>
                </div>
                <div className="text-white text-opacity-75" style={{ fontSize: '11px' }}>
                  Trợ lý thông minh toàn năng
                </div>
              </div>
            </div>

            <div className="d-flex align-items-center gap-1">
              <button
                type="button"
                onClick={handleClearHistory}
                className="ai-header-btn"
                title="Xóa lịch sử chat"
              >
                <RotateCcw size={14} />
              </button>
              <button
                type="button"
                onClick={() => {
                  sounds.playFlip?.();
                  setIsOpen(false);
                }}
                className="ai-header-btn"
                title="Đóng cửa sổ chat"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Messages Body */}
          <div className="ai-chat-body p-3">
            {messages.map((m) => {
              const isUser = m.role === 'user';
              return (
                <div
                  key={m.id}
                  className={`d-flex mb-3 ${isUser ? 'justify-content-end' : 'justify-content-start'}`}
                >
                  {!isUser && (
                    <div className="ai-msg-avatar flex-shrink-0 me-2">
                      <Bot size={15} />
                    </div>
                  )}

                  <div className={`ai-msg-bubble ${isUser ? 'ai-user-bubble' : 'ai-assistant-bubble'}`}>
                    <div className="ai-msg-text" style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontSize: '13px', lineHeight: '1.55' }}>
                      {m.text}
                    </div>

                    {!isUser && /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/.test(m.text) && (
                      <div className="mt-2 pt-1.5 border-top border-slate-100 d-flex justify-content-end">
                        <button
                          type="button"
                          onClick={() => handleSpeakSnippet(m.text)}
                          className="btn btn-sm btn-link p-0 text-primary d-inline-flex align-items-center gap-1 text-decoration-none"
                          style={{ fontSize: '11px' }}
                          title="Nghe phát âm tiếng Nhật trong câu"
                        >
                          <Volume2 size={12} />
                          <span>Phát âm</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Typing Loader Indicator */}
            {isLoading && (
              <div className="d-flex mb-3 justify-content-start">
                <div className="ai-msg-avatar flex-shrink-0 me-2">
                  <Bot size={15} />
                </div>
                <div className="ai-msg-bubble ai-assistant-bubble d-flex align-items-center gap-1.5 py-2 px-3">
                  <span className="ai-typing-dot" />
                  <span className="ai-typing-dot" />
                  <span className="ai-typing-dot" />
                  <span className="small text-muted ms-1.5" style={{ fontSize: '11.5px' }}>
                    Sensei đang tra cứu tài liệu...
                  </span>
                </div>
              </div>
            )}

            {/* Error Message if any */}
            {errorMsg && (
              <div className="p-2 mb-2 rounded-3 bg-danger bg-opacity-10 border border-danger border-opacity-20 text-danger small text-center" style={{ fontSize: '11.5px' }}>
                {errorMsg}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompt Suggestions */}
          {messages.length <= 3 && !isLoading && (
            <div className="px-3 pb-2">
              <div className="small text-muted fw-bold mb-1.5 d-flex align-items-center gap-1" style={{ fontSize: '10.5px' }}>
                <Sparkles size={11} className="text-warning" />
                <span>Gợi ý câu hỏi phổ biến:</span>
              </div>
              <div className="ai-suggestions-slider d-flex gap-1.5 overflow-x-auto pb-1">
                {AI_SUGGESTIONS.slice(0, 3).map((sugg, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSend(sugg)}
                    className="ai-suggestion-chip flex-shrink-0"
                  >
                    {sugg}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Footer Area */}
          <div className="ai-chat-footer p-2.5 bg-white border-top">
            <div className="d-flex align-items-end gap-2 bg-light p-1.5 rounded-4 border focus-within-primary">
              <textarea
                ref={textareaRef}
                value={inputValue}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder="Hỏi Sensei về từ vựng, ngữ pháp N5–N1..."
                rows={1}
                className="ai-chat-input form-control border-0 bg-transparent p-1 shadow-none"
                style={{
                  resize: 'none',
                  fontSize: '13px',
                  maxHeight: '110px',
                  minHeight: '28px',
                  lineHeight: '1.4'
                }}
              />
              <button
                type="button"
                onClick={() => handleSend()}
                disabled={!inputValue.trim() || isLoading}
                className={`ai-send-btn ${inputValue.trim() && !isLoading ? 'is-active' : ''}`}
                title="Gửi câu hỏi (Enter)"
              >
                <Send size={15} />
              </button>
            </div>
            <div className="d-flex justify-content-between align-items-center px-1 mt-1 text-muted" style={{ fontSize: '10px' }}>
              <span>Sensei AI v3.8 Flash • Tiếng Nhật chuẩn quốc tế</span>
              <span>Nhấn Enter để gửi</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AiChatBubble;
