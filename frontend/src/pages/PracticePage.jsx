import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { vocabService, speakJapanese } from '../services/api';
import { sounds } from '../services/sounds';
import * as wanakana from 'wanakana';
import FuriganaWord from '../components/FuriganaWord';
import {
  Keyboard,
  RotateCcw,
  Sparkles,
  Volume2,
  CheckCircle2,
  XCircle,
  Flame,
  Shuffle,
  HelpCircle,
  ChevronRight,
  Info,
  Zap,
  Ear,
  Eye,
  ArrowRight
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function PracticePage() {
  const { selectedLesson, setSelectedLesson, recordWordProgress, askAi } = useApp();

  const [lessonChoice, setLessonChoice] = useState(selectedLesson ? String(selectedLesson) : '1');
  const [practiceMode, setPracticeMode] = useState('vi_to_kana'); // 'vi_to_kana' | 'kanji_to_kana' | 'audio_to_kana'
  const [words, setWords] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [feedback, setFeedback] = useState(null); // 'correct' | 'wrong' | null
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showRomajiGuide, setShowRomajiGuide] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    const fetchWords = async () => {
      setLoading(true);
      try {
        const params = lessonChoice === 'all' ? {} : { lesson: parseInt(lessonChoice) };
        const res = await vocabService.getVocabularies(params);
        let list = res.data?.data || [];
        setWords(list);
        setCurrentIndex(0);
        setUserInput('');
        setFeedback(null);
        setShowHint(false);
      } catch (err) {
        console.error('Fetch practice words error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchWords();
  }, [lessonChoice]);

  const currentWord = words[currentIndex];

  // Auto-focus input on desktop/laptop on word change
  useEffect(() => {
    if (window.innerWidth > 768 && inputRef.current) {
      inputRef.current.focus();
    }
    if (practiceMode === 'audio_to_kana' && currentWord) {
      speakJapanese(currentWord.clean_kana || currentWord.kana || currentWord.kanji);
    }
  }, [currentIndex, practiceMode, currentWord]);

  const handleShuffle = () => {
    sounds.playFlip();
    const shuffled = [...words].sort(() => Math.random() - 0.5);
    setWords(shuffled);
    setCurrentIndex(0);
    setUserInput('');
    setFeedback(null);
    setShowHint(false);
  };

  const handleInputChange = (e) => {
    const val = e.target.value;
    // Auto convert Romaji to Hiragana in realtime using Wanakana
    const converted = wanakana.toHiragana(val);
    setUserInput(converted);
  };

  const handleCheck = (e) => {
    e?.preventDefault();
    if (!userInput.trim() || !currentWord || feedback !== null) return;

    const targetKana = (currentWord.clean_kana || currentWord.kana || '').trim();
    const cleanUser = userInput.trim();

    const isMatch =
      cleanUser === targetKana ||
      wanakana.toHiragana(cleanUser) === wanakana.toHiragana(targetKana);

    if (isMatch) {
      sounds.playCorrect();
      speakJapanese(currentWord.kanji || currentWord.clean_kana || currentWord.kana);
      setFeedback('correct');
      setScore((prev) => prev + 1);
      const newStreak = streak + 1;
      setStreak(newStreak);
      setMaxStreak((prev) => Math.max(prev, newStreak));
      recordWordProgress(currentWord.id, 'mastered');

      if (newStreak >= 5 && newStreak % 5 === 0) {
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
      }

      setTimeout(() => {
        handleNext();
      }, 750);
    } else {
      sounds.playWrong();
      setFeedback('wrong');
      setStreak(0);
      recordWordProgress(currentWord.id, 'needs_review');
    }
  };

  const handleNext = () => {
    sounds.playFlip();
    if (currentIndex < words.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setUserInput('');
      setFeedback(null);
      setShowHint(false);
    } else {
      sounds.playLevelUp();
      confetti({ particleCount: 100, spread: 80, origin: { y: 0.5 } });
    }
  };

  const romajiRules = [
    { kana: 'し (shi)', romaji: 'shi hoặc si' },
    { kana: 'ち (chi)', romaji: 'chi hoặc ti' },
    { kana: 'つ (tsu)', romaji: 'tsu hoặc tu' },
    { kana: 'ふ (fu)', romaji: 'fu hoặc hu' },
    { kana: 'ん (n)', romaji: 'nn hoặc n\'' },
    { kana: 'っ (âm ngắt)', romaji: 'gõ đúp phụ âm (ví dụ: matte sang まって)' }
  ];

  const targetKanaStr = currentWord?.clean_kana || currentWord?.kana || '';
  const firstKanaHint = targetKanaStr.charAt(0);

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16 animate-in fade-in duration-300">
      {/* ── 1. HEADER BANNER ── */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-pink-100 shadow-sm relative overflow-hidden">
        <div className="absolute right-4 top-2 text-pink-100/50 font-jp font-black text-8xl pointer-events-none select-none">
          打
        </div>

        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-50 text-pink-700 font-extrabold text-[11px] uppercase tracking-wider border border-pink-100">
            <Keyboard size={13} className="text-pink-600" />
            <span>PHẢN XẠ BÀN PHÍM • ROMAJI SANG HIRAGANA</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-snug">
                Luyện Gõ Tiếng Nhật (Romaji sang Kana)
              </h1>
              <p className="text-xs text-slate-500 mb-0 mt-0.5">
                Gõ ký tự Latinh (Romaji) máy tự chuyển thành Hiragana theo thời gian thực, rèn phản xạ chính tả cực nhanh.
              </p>
            </div>

            {/* Lesson Selector + Shuffle */}
            <div className="flex items-center gap-2 shrink-0">
              <select
                value={lessonChoice}
                onChange={(e) => {
                  sounds.playFlip();
                  setLessonChoice(e.target.value);
                }}
                className="px-3.5 py-2 rounded-xl border border-pink-200 bg-white text-xs font-bold text-slate-800 cursor-pointer shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
              >
                <option value="all">Tất cả bài học (1.512 từ)</option>
                {Array.from({ length: 25 }, (_, i) => i + 1).map((n) => (
                  <option key={n} value={n}>
                    Bài {n < 10 ? `0${n}` : n}
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={handleShuffle}
                className="p-2 rounded-xl border border-pink-200 bg-white text-pink-700 hover:bg-pink-50 transition-colors cursor-pointer shadow-sm"
                title="Xáo trộn ngẫu nhiên"
              >
                <Shuffle size={15} />
              </button>
            </div>
          </div>

          {/* Mode Tabs and Romaji guide button */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-pink-50">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-slate-400 mr-1 hidden sm:inline">Chế độ:</span>
              <button
                type="button"
                onClick={() => {
                  sounds.playFlip();
                  setPracticeMode('vi_to_kana');
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  practiceMode === 'vi_to_kana'
                    ? 'bg-pink-600 text-white shadow-lotus'
                    : 'bg-pink-50/60 text-slate-600 hover:bg-pink-100 hover:text-pink-600'
                }`}
              >
                Nghĩa Việt sang Kana
              </button>

              <button
                type="button"
                onClick={() => {
                  sounds.playFlip();
                  setPracticeMode('kanji_to_kana');
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  practiceMode === 'kanji_to_kana'
                    ? 'bg-pink-600 text-white shadow-lotus'
                    : 'bg-pink-50/60 text-slate-600 hover:bg-pink-100 hover:text-pink-600'
                }`}
              >
                Chữ Hán sang Kana
              </button>

              <button
                type="button"
                onClick={() => {
                  sounds.playFlip();
                  setPracticeMode('audio_to_kana');
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  practiceMode === 'audio_to_kana'
                    ? 'bg-pink-600 text-white shadow-lotus'
                    : 'bg-pink-50/60 text-slate-600 hover:bg-pink-100 hover:text-pink-600'
                }`}
              >
                <Ear size={13} />
                <span>Nghe âm sang Kana</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => setShowRomajiGuide(!showRomajiGuide)}
              className="text-xs font-bold text-slate-500 hover:text-pink-600 flex items-center gap-1 cursor-pointer ml-auto"
            >
              <Info size={13} />
              <span>Bảng mẹo gõ Romaji</span>
            </button>
          </div>
        </div>
      </div>

      {/* Romaji Typing Rules Helper Accordion */}
      {showRomajiGuide && (
        <div className="p-4 rounded-2xl bg-white border border-pink-100 shadow-sm space-y-2 animate-in fade-in">
          <div className="flex justify-between items-center text-xs font-black text-slate-800">
            <span>QUY TẮC GÕ KANA BẰNG BÀN PHÍM LATIN (ROMAJI):</span>
            <button
              type="button"
              onClick={() => setShowRomajiGuide(false)}
              className="text-slate-400 hover:text-slate-700 cursor-pointer text-xs"
            >
              Đóng
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {romajiRules.map((r, i) => (
              <div key={i} className="p-2 rounded-xl bg-pink-50/40 text-[11.5px] border border-pink-100/60">
                <strong className="text-pink-700 font-jp">{r.kana}:</strong> {r.romaji}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── 2. MAIN TYPING ARENA CARD ── */}
      {loading ? (
        <div className="py-20 text-center">
          <div className="w-10 h-10 border-4 border-pink-200 border-t-pink-600 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs font-bold text-slate-400">Đang chuẩn bị đề thi gõ...</p>
        </div>
      ) : currentWord ? (
        <div className="p-6 sm:p-10 rounded-3xl bg-white border border-pink-100 shadow-lotus space-y-6 text-center max-w-2xl mx-auto relative overflow-hidden">
          {/* Top Progress Bar across Card */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-pink-100">
            <div
              className="h-full bg-gradient-to-r from-pink-600 to-rose-500 transition-all duration-300"
              style={{ width: `${((currentIndex + 1) / words.length) * 100}%` }}
            />
          </div>

          {/* Top Status HUD */}
          <div className="flex justify-between items-center text-xs font-bold text-slate-400 pt-1">
            <span className="bg-pink-50 text-pink-700 px-3 py-1 rounded-full border border-pink-100">
              Bài {currentWord.lesson_number} • Từ {currentIndex + 1} / {words.length}
            </span>

            <div className="flex items-center gap-3">
              {streak >= 2 && (
                <span className="flex items-center gap-1 text-amber-500 font-black animate-pulse">
                  <Flame size={15} fill="#f59e0b" />
                  <span>Chuỗi {streak}</span>
                </span>
              )}
              <span className="text-emerald-600 font-black">{score} đúng</span>
            </div>
          </div>

          {/* Prompt Display Area */}
          <div className="space-y-2 py-4">
            {practiceMode === 'vi_to_kana' && (
              <>
                <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider block">
                  NGHĨA TIẾNG VIỆT
                </span>
                <h2 className="text-2xl sm:text-4xl font-black text-pink-700 leading-snug px-2">
                  {currentWord.clean_vietnamese || currentWord.vietnamese}
                </h2>
                {currentWord.kanji && (
                  <div className="font-jp text-slate-500 text-sm font-semibold pt-1 flex items-center justify-center gap-1.5">
                    <span>Chữ Hán:</span>
                    <FuriganaWord
                      kanji={currentWord.kanji}
                      kana={currentWord.clean_kana || currentWord.kana}
                      size="lg"
                    />
                  </div>
                )}
              </>
            )}

            {practiceMode === 'kanji_to_kana' && (
              <>
                <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider block">
                  ĐỌC CHỮ HÁN SANG HIRAGANA
                </span>
                <h2 className="text-4xl sm:text-5xl font-black font-jp text-slate-900">
                  {currentWord.kanji || currentWord.clean_kana || currentWord.kana}
                </h2>
                <div className="text-xs text-slate-500 font-semibold pt-1">
                  Nghĩa: {currentWord.clean_vietnamese || currentWord.vietnamese}
                </div>
              </>
            )}

            {practiceMode === 'audio_to_kana' && (
              <div className="space-y-3">
                <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider block">
                  NGHE PHÁT ÂM TOKYO & GÕ KANA
                </span>
                <button
                  type="button"
                  onClick={() => speakJapanese(currentWord.clean_kana || currentWord.kana || currentWord.kanji)}
                  className="w-18 h-18 sm:w-20 sm:h-20 mx-auto rounded-3xl bg-gradient-to-tr from-pink-600 to-rose-500 text-white flex items-center justify-center shadow-lotus hover:scale-105 active:scale-95 transition-all cursor-pointer"
                  title="Nhấn để nghe lại phát âm"
                >
                  <Volume2 size={36} />
                </button>
                <p className="text-xs text-slate-400">
                  Nhấn vào loa để nghe lại nếu chưa rõ
                </p>
              </div>
            )}
          </div>

          {/* Optional First Kana Hint */}
          {showHint && (
            <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold animate-in fade-in inline-flex items-center gap-1.5">
              <Eye size={14} className="text-amber-600" />
              <span>Gợi ý ký tự đầu: </span>
              <strong className="text-base font-jp text-pink-700 ml-1">「{firstKanaHint}」</strong>
            </div>
          )}

          {/* Typing Form */}
          <form onSubmit={handleCheck} className="max-w-md mx-auto space-y-3">
            <div className="relative">
              <input
                ref={inputRef}
                type="text"
                placeholder="Gõ Romaji (ví dụ: watashi)..."
                value={userInput}
                onChange={handleInputChange}
                disabled={feedback === 'correct'}
                className={`w-full px-5 py-3.5 rounded-2xl border text-center font-jp font-bold text-xl sm:text-2xl focus:outline-none focus:ring-4 transition-all ${
                  feedback === 'correct'
                    ? 'border-emerald-500 bg-emerald-50/70 text-emerald-800 ring-emerald-200'
                    : feedback === 'wrong'
                    ? 'border-rose-500 bg-rose-50/70 text-rose-800 ring-rose-200'
                    : 'border-pink-200 bg-pink-50/20 text-slate-900 focus:ring-pink-500/20 focus:border-pink-500'
                }`}
              />
            </div>

            {/* Wrong Answer Alert */}
            {feedback === 'wrong' && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold animate-in fade-in flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span>Chưa chính xác! Đáp án đúng là: </span>
                  <FuriganaWord
                    kanji={currentWord.kanji}
                    kana={currentWord.clean_kana || currentWord.kana}
                    size="base"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => speakJapanese(currentWord.clean_kana || currentWord.kana)}
                  className="p-1.5 rounded-lg bg-rose-100 hover:bg-rose-200 text-rose-800 transition-colors cursor-pointer"
                  title="Nghe cách đọc đúng"
                >
                  <Volume2 size={15} />
                </button>
              </div>
            )}

            {/* Buttons */}
            <div className="flex gap-2.5">
              <button
                type="submit"
                disabled={!userInput.trim() || feedback === 'correct'}
                className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-pink-600 via-rose-500 to-pink-500 hover:from-pink-500 hover:to-rose-600 text-white font-black text-sm shadow-lotus hover:shadow-lotus-lg transition-all active:scale-95 disabled:opacity-40 cursor-pointer"
              >
                Kiểm tra [Enter]
              </button>

              {feedback === 'wrong' && (
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-5 py-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm transition-colors cursor-pointer"
                >
                  Bỏ qua
                </button>
              )}
            </div>
          </form>

          {/* Quick First-character hint toggle & AI Memory Mnemonic Button */}
          <div className="pt-2 border-t border-pink-50 flex flex-wrap items-center justify-center gap-4">
            {!showHint && feedback !== 'wrong' && (
              <button
                type="button"
                onClick={() => setShowHint(true)}
                className="inline-flex items-center gap-1 text-xs font-bold text-slate-400 hover:text-amber-600 cursor-pointer transition-colors"
              >
                <HelpCircle size={13} />
                <span>Xem gợi ý chữ đầu</span>
              </button>
            )}

            <button
              type="button"
              onClick={() =>
                askAi(
                  'explain_vocab',
                  currentWord,
                  `AI Mẹo Nhớ Từ Vựng: ${currentWord.kanji || currentWord.kana}`
                )
              }
              className="inline-flex items-center gap-1.5 text-xs font-bold text-pink-600 hover:text-pink-800 hover:underline cursor-pointer"
            >
              <Sparkles size={14} />
              <span>Nhờ AI gợi ý mẹo nhớ & ví dụ</span>
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}