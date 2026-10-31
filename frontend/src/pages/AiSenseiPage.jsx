import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { aiService, speakJapanese } from '../services/api';
import { sounds } from '../services/sounds';
import {
  Sparkles,
  MessageSquare,
  FileText,
  Calendar,
  Send,
  Volume2,
  CheckCircle2,
  ArrowRight,
  RotateCcw,
  Bot,
  User,
  HelpCircle,
  Clock
} from 'lucide-react';

export default function AiSenseiPage() {
  const { currentLevel, askAi, user, guestProgress, gamification, selectedLesson } = useApp();

  const [activeMode, setActiveMode] = useState('chat'); // 'chat' | 'sentence' | 'roadmap'
  
  // Chat state
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: 'Konnichiwa! (こんにちは!) Tôi là AI Sensei chuyên gia tiếng Nhật của bạn. Bạn muốn luyện đối thoại giao tiếp, giải đáp ngữ pháp, hay nhờ phân tích câu nào hôm nay?'
    }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  // Sentence analysis state
  const [sentenceInput, setSentenceInput] = useState('毎朝 7時に 起きます。');
  const [sentenceResult, setSentenceResult] = useState(null);
  const [sentenceLoading, setSentenceLoading] = useState(false);

  // Roadmap & User Diagnosis state
  const [targetDays, setTargetDays] = useState(30);
  const [targetHours, setTargetHours] = useState(0.5);
  const [roadmapResult, setRoadmapResult] = useState(null);
  const [roadmapLoading, setRoadmapLoading] = useState(false);

  // Send Chat message with real Gemini AI and personalized context
  const handleSendChat = async (e) => {
    e?.preventDefault();
    if (!chatInput.trim() || chatLoading) return;

    const userText = chatInput.trim();
    setMessages((prev) => [...prev, { sender: 'user', text: userText }]);
    setChatInput('');
    setChatLoading(true);
    sounds.playFlip();

    try {
      const masteredCount = Object.values(guestProgress || {}).filter((p) => p.status === 'mastered').length;
      const reviewWords = Object.keys(guestProgress || {}).filter((k) => guestProgress[k]?.status === 'needs_review');

      const res = await aiService.query({
        action: 'chat',
        prompt: userText,
        userProgress: {
          masteredCount,
          reviewWords,
          streak: gamification?.current_streak || 1,
          activeLesson: selectedLesson || 1
        },
        username: user?.username || 'Học viên'
      });
      if (res.data?.success) {
        sounds.playCorrect();
        const replyText = res.data.data?.explanation || res.data.data?.reply || res.data.data?.nuance || 'Tôi đã hiểu câu hỏi của bạn!';
        setMessages((prev) => [
          ...prev,
          {
            sender: 'ai',
            text: replyText,
            suggestions: res.data.data?.suggestions || []
          }
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: 'Rất tiếc, đường truyền AI đang bận. Bạn hãy thử lại hoặc xem lại từ vựng bài học nhé!'
        }
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  // Analyze Sentence
  const handleAnalyzeSentence = async (e) => {
    e?.preventDefault();
    if (!sentenceInput.trim() || sentenceLoading) return;

    sounds.playFlip();
    setSentenceLoading(true);
    try {
      const res = await aiService.query({ action: 'analyze_sentence', prompt: sentenceInput });
      if (res.data?.success) {
        sounds.playCorrect();
        setSentenceResult(res.data.data);
      }
    } catch {
      sounds.playWrong();
    } finally {
      setSentenceLoading(false);
    }
  };

  // Generate Personalized User Diagnosis & Roadmap
  const handleGenerateRoadmap = async () => {
    sounds.playFlip();
    setRoadmapLoading(true);
    try {
      const masteredCount = Object.values(guestProgress || {}).filter((p) => p.status === 'mastered').length;
      const reviewWords = Object.keys(guestProgress || {}).filter((k) => guestProgress[k]?.status === 'needs_review');

      const res = await aiService.query({
        action: 'user_diagnosis',
        prompt: `Phân tích tiến độ học tập thực tế và đề xuất lộ trình ${targetDays} ngày (mỗi ngày học ${targetHours} giờ)`,
        userProgress: {
          masteredCount,
          reviewWords,
          streak: gamification?.current_streak || 1,
          activeLesson: selectedLesson || 1
        },
        username: user?.username || 'Học viên'
      });
      if (res.data?.success) {
        sounds.playLevelUp();
        setRoadmapResult({
          aiAdvice: res.data.data?.explanation || res.data.data?.nuance,
          ...res.data.data
        });
      }
    } catch {
      sounds.playWrong();
    } finally {
      setRoadmapLoading(false);
    }
  };

  const quickPrompts = [
    'Phân biệt trợ từ に và で thế nào?',
    'Mẹo nhớ thể て (Te) Minna no Nihongo',
    'Cách chào hỏi khách hàng chuẩn văn hóa Nhật',
    'Cấu trúc ngữ pháp V-masu sang V-te kudasai'
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16 animate-in fade-in duration-300">
      {/* ── 1. HEADER BANNER ── */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-pink-100 shadow-sm relative overflow-hidden">
        <div className="absolute right-4 top-2 text-pink-100/50 font-jp font-black text-8xl pointer-events-none select-none">
          知
        </div>

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-50 text-pink-700 font-extrabold text-[11px] uppercase tracking-wider mb-2.5">
            <Sparkles size={13} className="text-pink-600" />
            <span>TRỢ LÝ THÔNG MINH - AI SENSEI</span>
          </div>

          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-snug mb-1.5">
            Trợ Lý AI Gia Sư Tiếng Nhật
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-2xl mb-4">
            Đồng hành cùng bạn 24/7: Giải đáp thắc mắc ngữ pháp, phân tích câu tùy ý, lập lộ trình cá nhân hóa và luyện đàm thoại tự nhiên.
          </p>

          {/* Mode Switcher */}
          <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-pink-50">
            <button
              type="button"
              onClick={() => { sounds.playFlip(); setActiveMode('chat'); }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeMode === 'chat'
                  ? 'bg-pink-600 text-white shadow-lotus'
                  : 'bg-pink-50/60 text-slate-600 hover:bg-pink-100/70 hover:text-pink-600'
              }`}
            >
              <MessageSquare size={15} />
              <span>Hỏi đáp & Đàm thoại</span>
            </button>

            <button
              type="button"
              onClick={() => { sounds.playFlip(); setActiveMode('sentence'); }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeMode === 'sentence'
                  ? 'bg-pink-600 text-white shadow-lotus'
                  : 'bg-pink-50/60 text-slate-600 hover:bg-pink-100/70 hover:text-pink-600'
              }`}
            >
              <FileText size={15} />
              <span>Phân tích ngữ pháp câu</span>
            </button>

            <button
              type="button"
              onClick={() => { sounds.playFlip(); setActiveMode('roadmap'); }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeMode === 'roadmap'
                  ? 'bg-pink-600 text-white shadow-lotus'
                  : 'bg-pink-50/60 text-slate-600 hover:bg-pink-100/70 hover:text-pink-600'
              }`}
            >
              <Calendar size={15} />
              <span>Lộ trình học cá nhân hóa</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── 2. MODE: CHAT & PRACTICE ── */}
      {activeMode === 'chat' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Main Chat Box */}
          <div className="lg:col-span-2 rounded-3xl bg-white border border-pink-100 shadow-sm flex flex-col h-[520px] overflow-hidden">
            {/* Messages Body */}
            <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-slate-50/30">
              {messages.map((m, idx) => (
                <div
                  key={idx}
                  className={`flex gap-3 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {m.sender === 'ai' && (
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-pink-600 to-rose-500 text-white flex items-center justify-center shrink-0 shadow-sm">
                      <Bot size={16} />
                    </div>
                  )}

                  <div className="max-w-[80%] space-y-2">
                    <div
                      className={`p-4 rounded-2xl text-xs leading-relaxed ${
                        m.sender === 'user'
                          ? 'bg-gradient-to-r from-pink-600 to-rose-500 text-white font-medium rounded-tr-none shadow-sm'
                          : 'bg-white border border-pink-100 text-slate-800 rounded-tl-none shadow-sm'
                      }`}
                    >
                      {m.text}
                    </div>

                    {m.sender === 'ai' && (
                      <button
                        type="button"
                        onClick={() => speakJapanese(m.text)}
                        className="text-[11px] text-pink-600 hover:text-pink-800 font-bold flex items-center gap-1 cursor-pointer pl-1"
                      >
                        <Volume2 size={13} />
                        <span>Nghe giọng đọc</span>
                      </button>
                    )}
                  </div>

                  {m.sender === 'user' && (
                    <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0">
                      <User size={16} />
                    </div>
                  )}
                </div>
              ))}

              {chatLoading && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-xl bg-pink-600 text-white flex items-center justify-center shrink-0 animate-pulse">
                    <Bot size={16} />
                  </div>
                  <div className="p-3.5 rounded-2xl bg-white border border-pink-100 text-xs text-slate-400 font-bold flex items-center gap-1.5 shadow-sm">
                    <span className="w-2 h-2 rounded-full bg-pink-500 animate-bounce" />
                    <span className="w-2 h-2 rounded-full bg-pink-500 animate-bounce delay-100" />
                    <span className="w-2 h-2 rounded-full bg-pink-500 animate-bounce delay-200" />
                    <span>AI Sensei đang soạn câu trả lời...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Input Bar */}
            <form onSubmit={handleSendChat} className="p-3.5 bg-white border-t border-pink-100 flex gap-2">
              <input
                type="text"
                placeholder="Nhập câu hỏi hoặc câu tiếng Nhật cần giải đáp..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-pink-200 text-xs focus:outline-none focus:ring-2 focus:ring-pink-500 bg-pink-50/20"
              />
              <button
                type="submit"
                disabled={!chatInput.trim() || chatLoading}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-pink-600 to-rose-500 text-white font-bold text-xs shadow-lotus hover:scale-105 active:scale-95 transition-all disabled:opacity-40 cursor-pointer flex items-center gap-1.5"
              >
                <Send size={14} />
                <span>Gửi</span>
              </button>
            </form>
          </div>

          {/* Quick Prompts Panel */}
          <div className="space-y-4">
            <div className="p-5 rounded-3xl bg-white border border-pink-100 shadow-sm space-y-3">
              <h3 className="font-extrabold text-xs text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <HelpCircle size={15} className="text-pink-600" />
                <span>GỢI Ý CÂU HỎI NHANH</span>
              </h3>
              <p className="text-[11px] text-slate-500">
                Nhấp vào câu hỏi bất kỳ để gửi ngay cho AI Sensei:
              </p>

              <div className="space-y-2">
                {quickPrompts.map((q, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setChatInput(q);
                    }}
                    className="w-full text-left p-3 rounded-xl border border-pink-100 bg-pink-50/30 hover:bg-pink-50 hover:border-pink-300 text-xs font-semibold text-slate-700 transition-all cursor-pointer flex items-center justify-between group"
                  >
                    <span>{q}</span>
                    <ArrowRight size={13} className="text-pink-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>
            </div>

            <div className="p-5 rounded-3xl bg-gradient-to-br from-pink-600 to-rose-600 text-white shadow-lotus space-y-2">
              <h4 className="font-black text-sm">Phương pháp học cùng AI</h4>
              <p className="text-xs text-white/90 leading-relaxed">
                Khi học một từ vựng mới, hãy yêu cầu AI đặt cho bạn 3 câu ví dụ thực tế liên quan đến sở thích cá nhân để tăng độ gắn kết cảm xúc với từ ngữ!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── 3. MODE: SENTENCE ANALYSIS ── */}
      {activeMode === 'sentence' && (
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-pink-100 shadow-sm space-y-6">
          <form onSubmit={handleAnalyzeSentence} className="space-y-3">
            <label className="block text-xs font-bold text-slate-700">
              Dán câu tiếng Nhật bất kỳ (có hoặc không có Kanji):
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={sentenceInput}
                onChange={(e) => setSentenceInput(e.target.value)}
                placeholder="Ví dụ: 私は 毎日 日本語を 勉強します。"
                className="flex-1 px-4 py-3 rounded-2xl border border-pink-200 text-sm font-jp font-semibold focus:outline-none focus:ring-2 focus:ring-pink-500 bg-pink-50/20"
              />
              <button
                type="submit"
                disabled={sentenceLoading}
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-pink-600 to-rose-500 text-white font-bold text-xs shadow-lotus hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center gap-2"
              >
                <Sparkles size={16} />
                <span>{sentenceLoading ? 'Đang phân tích...' : 'Phân tích câu'}</span>
              </button>
            </div>
          </form>

          {/* Result Card */}
          {sentenceResult && (
            <div className="p-6 rounded-2xl bg-pink-50/40 border border-pink-200 space-y-4 animate-in fade-in">
              <div className="flex justify-between items-center">
                <span className="px-3 py-1 rounded-full bg-pink-600 text-white font-black text-xs">
                  KẾT QUẢ PHÂN TÍCH AI
                </span>
                <button
                  type="button"
                  onClick={() => speakJapanese(sentenceResult.original)}
                  className="px-3 py-1 rounded-full bg-white text-pink-700 border border-pink-200 text-xs font-bold flex items-center gap-1.5 hover:bg-pink-50 transition-colors cursor-pointer"
                >
                  <Volume2 size={14} />
                  <span>Nghe phát âm chuẩn</span>
                </button>
              </div>

              <h3 className="text-2xl font-black font-jp text-slate-900">
                {sentenceResult.original}
              </h3>

              <div className="p-3.5 rounded-xl bg-white border border-pink-100 font-bold text-xs text-slate-800">
                {sentenceResult.translation}
              </div>

              {/* Breakdown Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {sentenceResult.breakdown?.map((b, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-white border border-pink-100 shadow-sm">
                    <span className="text-[10px] font-black text-pink-600 uppercase block mb-1">
                      {b.part}
                    </span>
                    <p className="text-xs font-bold text-slate-800 mb-1">{b.text}</p>
                    <span className="text-[11px] text-slate-500">{b.note}</span>
                  </div>
                ))}
              </div>

              <p className="text-xs text-slate-600 italic border-l-4 border-pink-500 pl-3 py-1">
                {sentenceResult.advice}
              </p>
            </div>
          )}
        </div>
      )}

      {/* ── 4. MODE: STUDY ROADMAP ── */}
      {activeMode === 'roadmap' && (
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-pink-100 shadow-sm space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Mục tiêu hoàn thành trong:
              </label>
              <select
                value={targetDays}
                onChange={(e) => setTargetDays(parseInt(e.target.value))}
                className="w-full px-4 py-2.5 rounded-xl border border-pink-200 text-xs font-bold text-slate-800 bg-white"
              >
                <option value={30}>30 Ngày (Cấp tốc - 1 tháng)</option>
                <option value={60}>60 Ngày (Tiêu chuẩn - 2 tháng)</option>
                <option value={90}>90 Ngày (Thong thả - 3 tháng)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Thời gian học mỗi ngày:
              </label>
              <select
                value={targetHours}
                onChange={(e) => setTargetHours(parseFloat(e.target.value))}
                className="w-full px-4 py-2.5 rounded-xl border border-pink-200 text-xs font-bold text-slate-800 bg-white"
              >
                <option value={0.5}>30 Phút / Ngày</option>
                <option value={1.0}>1 Giờ / Ngày</option>
                <option value={1.5}>1.5 Giờ / Ngày</option>
              </select>
            </div>
          </div>

          <button
            type="button"
            onClick={handleGenerateRoadmap}
            disabled={roadmapLoading}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-pink-600 to-rose-500 text-white font-bold text-xs sm:text-sm shadow-lotus hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <Sparkles size={16} />
            <span>{roadmapLoading ? 'AI đang thiết lập kế hoạch...' : 'Tạo Lộ Trình Học Cá Nhân Hóa'}</span>
          </button>

          {/* Roadmap Result */}
          {roadmapResult && (
            <div className="p-6 rounded-2xl bg-pink-50/40 border border-pink-200 space-y-4 animate-in fade-in">
              <div>
                <h3 className="text-xl font-black text-slate-900 mb-1">
                  {roadmapResult.title}
                </h3>
                <p className="text-xs text-pink-700 font-bold">{roadmapResult.target}</p>
              </div>

              <div className="space-y-3">
                {roadmapResult.phases?.map((p, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-white border border-pink-100 flex items-start gap-3">
                    <div className="w-7 h-7 rounded-lg bg-pink-100 text-pink-700 font-black text-xs flex items-center justify-center shrink-0">
                      {idx + 1}
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-slate-900">{p.phase}: {p.focus}</h4>
                      <p className="text-xs text-slate-600 mt-0.5 mb-0">{p.goal}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 rounded-xl bg-white border border-emerald-200 flex items-center gap-3 text-xs text-emerald-800 font-semibold">
                <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
                <span>Thói quen mỗi ngày: {roadmapResult.daily_routine}</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
