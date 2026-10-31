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
  ChevronRight,
  Flame
} from 'lucide-react';

export default function PracticePage() {
  const { selectedLesson, setSelectedLesson, recordWordProgress, askAi } = useApp();

  const [words, setWords] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [feedback, setFeedback] = useState(null); // 'correct' | 'wrong' | null
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    const fetchWords = async () => {
      try {
        const res = await vocabService.getVocabularies({ lesson: selectedLesson });
        setWords(res.data?.data || []);
        setCurrentIndex(0);
        setUserInput('');
        setFeedback(null);
      } catch (err) {
        console.error(err);
      }
    };
    fetchWords();
  }, [selectedLesson]);

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

    const isMatch = cleanUser === targetKana || wanakana.toHiragana(cleanUser) === wanakana.toHiragana(targetKana);

    if (isMatch) {
      sounds.playCorrect();
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
      {/* Header Banner */}
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

          <select
            value={selectedLesson}
            onChange={(e) => setSelectedLesson(parseInt(e.target.value))}
            className="px-3 py-1.5 rounded-xl border border-pink-200 bg-pink-50/50 text-xs font-bold text-slate-800"
          >
            {Array.from({ length: 25 }, (_, i) => i + 1).map((n) => (
              <option key={n} value={n}>
                Bài {n < 10 ? `0${n}` : n}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Practice Card */}
      {currentWord && (
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
              Nghĩa tiếng Việt
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
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold animate-in fade-in">
                Chưa chính xác! Đáp án đúng là: 「{currentWord.clean_kana || currentWord.kana}」
              </div>
            )}

            <div className="flex gap-2.5">
              <button
                type="submit"
                disabled={!userInput.trim() || feedback === 'correct'}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-pink-600 to-rose-500 hover:from-pink-500 hover:to-rose-600 text-white font-extrabold text-sm shadow-lotus transition-transform active:scale-95 disabled:opacity-50"
              >
                Kiểm tra [Enter]
              </button>

              {feedback === 'wrong' && (
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm"
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
              onClick={() => askAi('explain_vocab', currentWord, `AI Gợi Ý: ${currentWord.clean_vietnamese || currentWord.vietnamese}`)}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-pink-600 hover:underline"
            >
              <Sparkles size={14} />
              <span>Xem mẹo ghi nhớ AI cho từ này</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
