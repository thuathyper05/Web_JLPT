import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { vocabService, speakJapanese } from '../services/api';
import { sounds } from '../services/sounds';
import * as wanakana from 'wanakana';
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
  ArrowRight
} from 'lucide-react';

export default function PracticePage() {
  const { selectedLesson, setSelectedLesson, recordWordProgress, askAi } = useApp();

  const [lessonChoice, setLessonChoice] = useState(selectedLesson ? String(selectedLesson) : '1');
  const [words, setWords] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [feedback, setFeedback] = useState(null); // 'correct' | 'wrong' | null
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(true);

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
      } catch (err) {
        console.error('Fetch practice words error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchWords();
  }, [lessonChoice]);

  const handleShuffle = () => {
    sounds.playFlip();
    const shuffled = [...words].sort(() => Math.random() - 0.5);
    setWords(shuffled);
    setCurrentIndex(0);
    setUserInput('');
    setFeedback(null);
  };

  const currentWord = words[currentIndex];

  const handleInputChange = (e) => {
    const val = e.target.value;
    // Auto convert Romaji to Hiragana using wanakana
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
      setStreak((prev) => prev + 1);
      recordWordProgress(currentWord.id, 'mastered');

      setTimeout(() => {
        handleNext();
      }, 700);
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
    } else {
      sounds.playLevelUp();
    }
  };

  const handleReset = () => {
    sounds.playFlip();
    setCurrentIndex(0);
    setUserInput('');
    setFeedback(null);
    setScore(0);
    setStreak(0);
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto pb-16 animate-in fade-in duration-300">
      {/* ── 1. HEADER BANNER ── */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-pink-100 shadow-sm relative overflow-hidden text-center sm:text-left">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-50 text-pink-700 font-extrabold text-[11px] uppercase tracking-wider mb-2.5">
          <Keyboard size={13} className="text-pink-600" />
          <span>PHẢN XẠ BÀN PHÍM • MINNA NO NIHONGO</span>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-snug mb-1">
              Luyện Gõ Tiếng Nhật (Romaji sang Kana)
            </h1>
            <p className="text-xs text-slate-500 mb-0">
              Gõ Romaji máy tự chuyển thành Hiragana, rèn phản xạ tư duy từ vựng N5 tức thì.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={lessonChoice}
              onChange={(e) => {
                sounds.playFlip();
                setLessonChoice(e.target.value);
              }}
              className="px-3 py-1.5 rounded-xl border border-pink-200 bg-pink-50/50 text-xs font-bold text-slate-800 cursor-pointer"
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
              className="p-2 rounded-xl border border-pink-200 bg-pink-50/50 text-pink-700 hover:bg-pink-100 transition-colors cursor-pointer"
              title="Xáo trộn thứ tự từ vựng"
            >
              <Shuffle size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* ── 2. MAIN PRACTICE CARD ── */}
      {loading ? (
        <div className="py-20 text-center">
          <div className="w-10 h-10 border-4 border-pink-200 border-t-pink-600 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs font-bold text-slate-400">Đang tải từ vựng...</p>
        </div>
      ) : currentWord ? (
        <div className="p-8 rounded-3xl bg-white border border-pink-100 shadow-lotus space-y-6 text-center">
          {/* Progress & Streak */}
          <div className="flex justify-between items-center text-xs font-bold text-slate-400">
            <span>Từ {currentIndex + 1} / {words.length}</span>
            <div className="flex items-center gap-3">
              {streak >= 2 && (
                <span className="flex items-center gap-1 text-amber-600 font-bold">
                  <Flame size={14} fill="#f59e0b" />
                  <span>Chuỗi {streak}</span>
                </span>
              )}
              <span className="text-emerald-600 font-extrabold">{score} đúng</span>
            </div>
          </div>

          {/* Prompt: Vietnamese Meaning */}
          <div className="space-y-2 py-4">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Nghĩa tiếng Việt (Bài {currentWord.lesson_number})
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-pink-700">
              {currentWord.clean_vietnamese || currentWord.vietnamese}
            </h2>
            {currentWord.kanji && (
              <div className="font-jp text-slate-500 text-sm font-semibold">
                Gợi ý chữ Hán: 「{currentWord.kanji}」
              </div>
            )}
          </div>

          {/* Typing Form */}
          <form onSubmit={handleCheck} className="max-w-md mx-auto space-y-3">
            <div className="relative">
              <input
                type="text"
                autoFocus
                placeholder="Gõ Romaji (ví dụ: watashi)..."
                value={userInput}
                onChange={handleInputChange}
                disabled={feedback === 'correct'}
                className={`w-full px-5 py-3.5 rounded-2xl border text-center font-jp font-bold text-lg focus:outline-none focus:ring-4 transition-all ${
                  feedback === 'correct'
                    ? 'border-emerald-500 bg-emerald-50/50 text-emerald-700 ring-emerald-200'
                    : feedback === 'wrong'
                    ? 'border-rose-500 bg-rose-50/50 text-rose-700 ring-rose-200'
                    : 'border-pink-200 bg-pink-50/30 text-slate-900 focus:ring-pink-500/20 focus:border-pink-500'
                }`}
              />
            </div>

            {/* Feedback alert */}
            {feedback === 'wrong' && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold animate-in fade-in flex items-center justify-between">
                <span>Đáp án đúng là: 「{currentWord.clean_kana || currentWord.kana}」</span>
                <button
                  type="button"
                  onClick={() => speakJapanese(currentWord.clean_kana || currentWord.kana)}
                  className="p-1 rounded-lg bg-rose-100 hover:bg-rose-200 text-rose-800 transition-colors"
                  title="Nghe phát âm"
                >
                  <Volume2 size={14} />
                </button>
              </div>
            )}

            <div className="flex gap-2.5">
              <button
                type="submit"
                disabled={!userInput.trim() || feedback === 'correct'}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-pink-600 to-rose-500 hover:from-pink-500 hover:to-rose-600 text-white font-extrabold text-sm shadow-lotus transition-transform active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                Kiểm tra [Enter]
              </button>

              {feedback === 'wrong' && (
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm cursor-pointer"
                >
                  Bỏ qua
                </button>
              )}
            </div>
          </form>

          {/* AI Hint Button */}
          <div className="pt-2">
            <button
              type="button"
              onClick={() =>
                askAi('explain_vocab', currentWord, `AI Gợi Ý: ${currentWord.clean_vietnamese || currentWord.vietnamese}`)
              }
              className="inline-flex items-center gap-1.5 text-xs font-bold text-pink-600 hover:underline cursor-pointer"
            >
              <Sparkles size={14} />
              <span>Xem mẹo ghi nhớ AI cho từ này</span>
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
