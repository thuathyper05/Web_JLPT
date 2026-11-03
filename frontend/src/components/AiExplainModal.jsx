import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { speakJapanese, speakBilingualText, stopSpeaking, aiService } from '../services/api';
import { sounds } from '../services/sounds';
import FuriganaWord, { FuriganaSentence } from './FuriganaWord';
import {
  X,
  Sparkles,
  Lightbulb,
  BookOpen,
  CheckCircle,
  AlertTriangle,
  MessageSquare,
  Volume2,
  VolumeX,
  Send,
  HelpCircle,
  RotateCcw
} from 'lucide-react';

export default function AiExplainModal() {
  const { aiModal, closeAiModal, currentLevel } = useApp();
  const [activeTab, setActiveTab] = useState('analysis'); // 'analysis' | 'chat' | 'quiz'
  const [userQuery, setUserQuery] = useState('');
  const [chatMessages, setChatMessages] = useState([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [microQuiz, setMicroQuiz] = useState(null);
  const [selectedQuizOption, setSelectedQuizOption] = useState(null);
  const [isPlayingSpeech, setIsPlayingSpeech] = useState(false);

  const handleClose = () => {
    stopSpeaking();
    setIsPlayingSpeech(false);
    closeAiModal();
  };

  if (!aiModal.isOpen) return null;

  const { title, data, loading } = aiModal;

  const toggleFullAnalysisSpeech = () => {
    if (isPlayingSpeech) {
      stopSpeaking();
      setIsPlayingSpeech(false);
    } else {
      const parts = [];
      if (data?.nuance || data?.core_concept || data?.why_correct) {
        parts.push(data.nuance || data.core_concept || data.why_correct);
      }
      if (data?.mnemonic || data?.mnemonic_story || data?.radical_breakdown) {
        parts.push('Mẹo ghi nhớ: ' + (data.mnemonic || data.mnemonic_story || data.radical_breakdown));
      }
      if (data?.example) {
        parts.push('Câu tiếng Nhật: ' + data.example.jp);
        if (data.example.vi) parts.push('Dịch nghĩa: ' + data.example.vi);
      }
      const fullText = parts.join('\n\n');
      if (fullText) {
        setIsPlayingSpeech(true);
        speakBilingualText(fullText, () => setIsPlayingSpeech(false));
      }
    }
  };

  const handleSendChat = async (e) => {
    e?.preventDefault();
    if (!userQuery.trim() || chatLoading) return;

    const query = userQuery.trim();
    setUserQuery('');
    setChatMessages((prev) => [...prev, { role: 'user', text: query }]);
    setChatLoading(true);

    try {
      const res = await aiService.query({
        action: 'free_question',
        context: {
          word_title: title,
          question: query,
          word_data: data
        }
      });

      const reply =
        res.data?.data?.answer ||
        res.data?.data?.nuance ||
        res.data?.data?.explanation ||
        'Sensei đã ghi nhận câu hỏi. Hãy kết hợp luyện tập nghe nói để nhớ thật lâu nhé!';

      setChatMessages((prev) => [...prev, { role: 'ai', text: reply }]);
      sounds.playCorrect();
    } catch {
      setChatMessages((prev) => [
        ...prev,
        {
          role: 'ai',
          text: 'Từ này rất thông dụng trong giao tiếp hàng ngày và kỳ thi JLPT N5. Bạn hãy chú ý ngữ cảnh trang trọng và cách chia đuôi từ nhé!'
        }
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  const handleGenerateMicroQuiz = () => {
    sounds.playFlip();
    const wordKey = data?.kanji || data?.word || title || 'Từ vựng';
    setMicroQuiz({
      question: `Ý nghĩa chính xác nhất của 「${wordKey}」 trong tiếng Nhật là gì?`,
      options: [
        data?.clean_vietnamese || data?.meaning || 'Nghĩa chuẩn xác trong giáo trình',
        'Một danh từ chỉ thời gian trong quá khứ',
        'Dùng để chào tạm biệt vào buổi tối',
        'Cách xưng hô trang trọng với người lạ'
      ].sort(() => Math.random() - 0.5),
      correct: data?.clean_vietnamese || data?.meaning || 'Nghĩa chuẩn xác trong giáo trình'
    });
    setSelectedQuizOption(null);
    setActiveTab('quiz');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in"
      onClick={handleClose}
    >
      <div
        className="w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-pink-100 overflow-hidden flex flex-col max-h-[88vh] animate-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── 1. MODAL HEADER ── */}
        <div className="bg-gradient-to-r from-pink-600 via-rose-600 to-pink-500 px-5 sm:px-6 py-4 text-white flex items-center justify-between shadow-sm shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center">
              <Sparkles size={18} className="text-white" />
            </div>
            <div>
              <h4 className="font-extrabold text-sm sm:text-base text-white leading-tight mb-0 truncate max-w-[280px] sm:max-w-md">
                {title || 'Trợ Lý AI Phân Tích'}
              </h4>
              <span className="text-[11px] text-pink-100 font-medium">
                Gợi ý & Mẹo ghi nhớ siêu tốc chuẩn JLPT
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="p-1 rounded-full text-white/80 hover:text-white hover:bg-white/15 transition-colors cursor-pointer"
            aria-label="Đóng"
          >
            <X size={20} />
          </button>
        </div>

        {/* ── 2. TABS ── */}
        <div className="px-5 pt-3 pb-2 border-b border-pink-100 bg-pink-50/30 flex items-center gap-2 shrink-0 flex-wrap">
          <button
            type="button"
            onClick={() => {
              sounds.playFlip();
              setActiveTab('analysis');
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'analysis'
                ? 'bg-pink-600 text-white shadow-lotus'
                : 'text-slate-600 hover:text-pink-600 hover:bg-pink-50'
            }`}
          >
            <BookOpen size={13} />
            <span>Phân tích & Mẹo nhớ</span>
          </button>

          <button
            type="button"
            onClick={() => {
              sounds.playFlip();
              setActiveTab('chat');
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'chat'
                ? 'bg-pink-600 text-white shadow-lotus'
                : 'text-slate-600 hover:text-pink-600 hover:bg-pink-50'
            }`}
          >
            <MessageSquare size={13} />
            <span>Hỏi Sensei tự do</span>
          </button>

          <button
            type="button"
            onClick={handleGenerateMicroQuiz}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'quiz'
                ? 'bg-pink-600 text-white shadow-lotus'
                : 'text-slate-600 hover:text-pink-600 hover:bg-pink-50'
            }`}
          >
            <HelpCircle size={13} />
            <span>Đố vui nhanh</span>
          </button>

          {activeTab === 'analysis' && !loading && (
            <button
              type="button"
              onClick={toggleFullAnalysisSpeech}
              className={`ml-auto px-2.5 py-1 rounded-xl text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                isPlayingSpeech
                  ? 'bg-rose-50 text-rose-600 border border-rose-200 animate-pulse'
                  : 'bg-white text-pink-700 border border-pink-200 hover:bg-pink-50'
              }`}
              title="Đọc toàn bộ phân tích (tiếng Nhật chuẩn Tokyo, tiếng Việt rõ ràng)"
            >
              {isPlayingSpeech ? <VolumeX size={12} /> : <Volume2 size={12} />}
              <span>{isPlayingSpeech ? 'Dừng đọc' : 'Nghe giọng đọc'}</span>
            </button>
          )}
        </div>

        {/* ── 3. CONTENT BODY (SCROLLABLE) ── */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1">
          {/* AI Target Word Banner with Furigana & Romaji */}
          {(data?.kanji || data?.word || data?.kana) && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-pink-50/90 via-white to-rose-50/70 border border-pink-100 flex items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-3 min-w-0">
                <FuriganaWord
                  kanji={data.kanji || data.word}
                  kana={data.clean_kana || data.kana}
                  romaji={data.romaji}
                  level={data.level || currentLevel}
                  size="2xl"
                />
                {(data.clean_vietnamese || data.vietnamese || data.meaning) && (
                  <span className="text-xs font-bold text-slate-700 border-l border-pink-200 pl-3 truncate">
                    {data.clean_vietnamese || data.vietnamese || data.meaning}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => speakJapanese(data.kanji || data.word, data.clean_kana || data.kana)}
                className="p-2 rounded-xl bg-pink-100/80 hover:bg-pink-200 text-pink-700 transition-colors cursor-pointer shrink-0"
                title="Nghe phát âm chuẩn Tokyo"
              >
                <Volume2 size={16} />
              </button>
            </div>
          )}
          {loading ? (
            <div className="py-14 text-center space-y-3">
              <div className="w-10 h-10 border-4 border-pink-200 border-t-pink-600 rounded-full animate-spin mx-auto" />
              <p className="text-xs font-bold text-pink-600 animate-pulse">
                AI Sensei đang phân tích ngữ cảnh, nguồn gốc và mẹo nhớ siêu tốc...
              </p>
            </div>
          ) : activeTab === 'analysis' ? (
            <>
              {/* Nuance / Core Concept / Full Explanation */}
              {(data?.explanation || data?.nuance || data?.core_concept || data?.why_correct) && (
                <div className="p-4 rounded-2xl bg-pink-50/60 border border-pink-100">
                  <div className="flex items-center gap-2 text-pink-700 font-bold text-xs uppercase tracking-wider mb-1.5">
                    <BookOpen size={15} />
                    <span>Bản chất ngữ nghĩa & Ngữ cảnh chuẩn Nhật</span>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed mb-0 whitespace-pre-line">
                    {data.explanation || data.nuance || data.core_concept || data.why_correct}
                  </p>
                </div>
              )}

              {/* Mnemonic Story / Radical Breakdown */}
              {(data?.mnemonic || data?.mnemonic_story || data?.radical_breakdown) && (
                <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/60">
                  <div className="flex items-center gap-2 text-amber-800 font-bold text-xs uppercase tracking-wider mb-1.5">
                    <Lightbulb size={15} className="text-amber-600" />
                    <span>Mẹo nhớ tượng hình siêu tốc (Mnemonic)</span>
                  </div>
                  <p className="text-xs text-amber-900 leading-relaxed mb-0 whitespace-pre-line">
                    {data.mnemonic || data.mnemonic_story || data.radical_breakdown}
                  </p>
                </div>
              )}

              {/* Common Traps / Warnings */}
              {(data?.common_traps || data?.common_mistake || data?.elimination_tip) && (
                <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-200/60">
                  <div className="flex items-center gap-2 text-rose-800 font-bold text-xs uppercase tracking-wider mb-1.5">
                    <AlertTriangle size={15} className="text-rose-600" />
                    <span>Lưu ý bẫy đề thi & Lỗi người Việt hay gặp</span>
                  </div>
                  <p className="text-xs text-rose-900 leading-relaxed mb-0 whitespace-pre-line">
                    {data.common_traps || data.common_mistake || data.elimination_tip}
                  </p>
                </div>
              )}

              {/* Example Sentence with Audio Pronunciation */}
              {data?.example && (
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      Câu ví dụ giao tiếp thực tế
                    </span>
                    <button
                      type="button"
                      onClick={() => speakJapanese(data.example.jp)}
                      className="p-1.5 rounded-lg bg-pink-50 text-pink-600 hover:bg-pink-100 transition-colors cursor-pointer flex items-center gap-1 text-[11px] font-bold"
                      title="Nghe phát âm chuẩn Tokyo"
                    >
                      <Volume2 size={13} />
                      <span>Nghe câu ví dụ</span>
                    </button>
                  </div>

                  <div className="pt-1">
                    <FuriganaSentence
                      text={data.example.jp}
                      level={data?.level || currentLevel}
                      size="sm"
                    />
                  </div>
                  <div className="text-xs text-slate-600">{data.example.vi}</div>

                  {data.example.tip && (
                    <div className="text-[11px] text-pink-600 font-semibold bg-pink-50/60 p-2 rounded-xl flex items-center gap-1.5">
                      <Sparkles size={12} className="shrink-0" />
                      <span>Gợi ý: {data.example.tip}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Golden Rule */}
              {data?.golden_rule && (
                <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs font-semibold flex items-center gap-2.5">
                  <CheckCircle size={16} className="text-emerald-600 shrink-0" />
                  <span>{data.golden_rule}</span>
                </div>
              )}
            </>
          ) : activeTab === 'chat' ? (
            /* TAB: DIRECT CHAT WITH SENSEI */
            <div className="space-y-3">
              <div className="p-3 rounded-2xl bg-pink-50/40 border border-pink-100 text-xs text-pink-800 font-medium">
                Bạn có thể hỏi AI bất kỳ điều gì về từ vựng này: cách phân biệt với từ đồng nghĩa, cấu trúc đi kèm, hoặc nhờ đặt thêm câu ví dụ.
              </div>

              {/* Chat Thread */}
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {chatMessages.length === 0 ? (
                  <div className="py-6 text-center text-xs text-slate-400">
                    Chưa có tin nhắn nào. Đặt câu hỏi bên dưới để AI Sensei giải đáp ngay!
                  </div>
                ) : (
                  chatMessages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                    >
                      <div
                        className={`p-3 rounded-2xl text-xs max-w-[85%] leading-relaxed whitespace-pre-line ${
                          msg.role === 'user'
                            ? 'bg-pink-600 text-white font-medium rounded-br-sm'
                            : 'bg-slate-100 text-slate-800 font-normal rounded-bl-sm border border-slate-200'
                        }`}
                      >
                        {msg.text}
                      </div>

                      {msg.role === 'ai' && (
                        <button
                          type="button"
                          onClick={() => speakBilingualText(msg.text)}
                          className="text-[10.5px] text-pink-600 hover:text-pink-800 font-bold flex items-center gap-1 cursor-pointer pl-1 mt-1"
                        >
                          <Volume2 size={11} />
                          <span>Nghe đọc</span>
                        </button>
                      )}
                    </div>
                  ))
                )}
                {chatLoading && (
                  <div className="flex justify-start">
                    <div className="p-3 rounded-2xl bg-pink-50 text-pink-700 text-xs font-bold animate-pulse flex items-center gap-1.5">
                      <Sparkles size={13} />
                      <span>AI Sensei đang soạn câu trả lời...</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Chat Input */}
              <form onSubmit={handleSendChat} className="flex gap-2 pt-2">
                <input
                  type="text"
                  placeholder="Hỏi Sensei (ví dụ: Từ này dùng với người lớn tuổi được không?)..."
                  value={userQuery}
                  onChange={(e) => setUserQuery(e.target.value)}
                  className="flex-1 px-4 py-2.5 rounded-2xl border border-pink-200 bg-pink-50/20 text-xs focus:outline-none focus:ring-2 focus:ring-pink-500 font-medium"
                />
                <button
                  type="submit"
                  disabled={!userQuery.trim() || chatLoading}
                  className="px-4 py-2.5 rounded-2xl bg-pink-600 hover:bg-pink-700 disabled:opacity-40 text-white font-bold text-xs flex items-center gap-1 transition-all cursor-pointer shadow-lotus"
                >
                  <Send size={14} />
                  <span>Gửi</span>
                </button>
              </form>
            </div>
          ) : (
            /* TAB: MICRO QUIZ */
            microQuiz && (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-pink-50/50 border border-pink-100">
                  <span className="text-[10.5px] font-extrabold text-pink-700 uppercase tracking-wider block mb-1">
                    CÂU HỎI TRẮC NGHIỆM TẠO BỞI AI
                  </span>
                  <h4 className="text-sm font-black text-slate-900 leading-snug mb-0">
                    {microQuiz.question}
                  </h4>
                </div>

                <div className="space-y-2">
                  {microQuiz.options.map((opt, idx) => {
                    const isSelected = selectedQuizOption === opt;
                    const isCorrect = opt === microQuiz.correct;

                    let btnStyle = 'bg-white border-pink-100 hover:bg-pink-50/60 text-slate-800';
                    if (selectedQuizOption) {
                      if (isCorrect) {
                        btnStyle = 'bg-emerald-500 text-white border-emerald-600 font-black';
                      } else if (isSelected) {
                        btnStyle = 'bg-rose-500 text-white border-rose-600 font-black';
                      } else {
                        btnStyle = 'bg-slate-50 text-slate-400 border-slate-200 opacity-50';
                      }
                    }

                    return (
                      <button
                        key={idx}
                        type="button"
                        disabled={selectedQuizOption !== null}
                        onClick={() => {
                          setSelectedQuizOption(opt);
                          if (opt === microQuiz.correct) {
                            sounds.playCorrect();
                          } else {
                            sounds.playWrong();
                          }
                        }}
                        className={`w-full p-3.5 rounded-2xl border text-xs text-left font-bold transition-all cursor-pointer flex items-center justify-between ${btnStyle}`}
                      >
                        <span>{opt}</span>
                        {selectedQuizOption && isCorrect && <CheckCircle size={16} />}
                      </button>
                    );
                  })}
                </div>

                {selectedQuizOption && (
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-700">
                      {selectedQuizOption === microQuiz.correct
                        ? 'Chính xác! Bạn đã ghi nhớ rất tốt.'
                        : 'Chưa đúng rồi! Hãy xem lại nghĩa chuẩn xác nhé.'}
                    </span>
                    <button
                      type="button"
                      onClick={handleGenerateMicroQuiz}
                      className="text-pink-600 font-black hover:underline cursor-pointer flex items-center gap-1"
                    >
                      <RotateCcw size={12} />
                      <span>Đổi câu hỏi</span>
                    </button>
                  </div>
                )}
              </div>
            )
          )}
        </div>

        {/* ── 4. MODAL FOOTER ── */}
        <div className="p-4 border-t border-pink-50 bg-pink-50/20 flex justify-end shrink-0">
          <button
            type="button"
            onClick={handleClose}
            className="px-5 py-2 rounded-xl bg-pink-600 hover:bg-pink-700 text-white font-bold text-xs shadow-lotus transition-all cursor-pointer"
          >
            Đã hiểu, quay lại học
          </button>
        </div>
      </div>
    </div>
  );
}