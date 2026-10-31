import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { quizService, speakJapanese } from '../services/api';
import { sounds } from '../services/sounds';
import {
  CheckSquare,
  Shuffle,
  BookOpen,
  PenTool,
  Sparkles,
  Clock,
  RotateCcw,
  Volume2,
  CheckCircle2,
  XCircle,
  Trophy,
  Flame,
  ArrowRight
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function QuizPage() {
  const { selectedLesson, setSelectedLesson, recordWordProgress, askAi } = useApp();

  const [gameState, setGameState] = useState('setup'); // 'setup' | 'playing' | 'result'
  const [quizMode, setQuizMode] = useState('mixed'); // 'mixed' | 'jp_to_vi' | 'vi_to_jp' | 'kanji_to_reading'
  const [questionCount, setQuestionCount] = useState(10);
  const [timerSetting, setTimerSetting] = useState(20); // 10 | 20 | 30 | 0 (none)

  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState(20);
  const timerRef = useRef(null);

  const modeCards = [
    {
      id: 'mixed',
      title: 'Đề thi tổng hợp',
      badge: 'Tổng hợp',
      desc: 'Chuẩn format JLPT N5',
      icon: Shuffle,
    },
    {
      id: 'jp_to_vi',
      title: 'Nhật sang Việt',
      badge: 'Cơ bản',
      desc: 'Phản xạ đọc hiểu',
      icon: BookOpen,
    },
    {
      id: 'vi_to_jp',
      title: 'Việt sang Nhật',
      badge: 'Ghi nhớ',
      desc: 'Phản xạ diễn đạt',
      icon: PenTool,
    },
    {
      id: 'kanji_to_reading',
      title: 'Hán tự & Từ vựng',
      badge: 'Chuyên sâu',
      desc: 'Đọc âm Kana',
      icon: Sparkles,
    },
  ];

  const startQuiz = async () => {
    sounds.playFlip();
    try {
      const res = await quizService.generateQuiz({
        lesson: selectedLesson === 'all' ? 'all' : selectedLesson,
        count: questionCount,
        mode: quizMode,
      });

      if (res.data?.success && res.data.questions?.length > 0) {
        setQuestions(res.data.questions);
        setCurrentIndex(0);
        setScore(0);
        setStreak(0);
        setSelectedOption(null);
        setIsAnswerSubmitted(false);
        setGameState('playing');
        setTimeLeft(timerSetting > 0 ? timerSetting : 999);
      }
    } catch (err) {
      console.error('Quiz start error:', err);
    }
  };

  const currentQ = questions[currentIndex];

  // Timer Countdown
  useEffect(() => {
    if (gameState !== 'playing' || isAnswerSubmitted || timerSetting === 0) return;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleSelectOption('__TIMEOUT__');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [gameState, currentIndex, isAnswerSubmitted, timerSetting]);

  const handleSelectOption = (opt) => {
    if (isAnswerSubmitted) return;

    clearInterval(timerRef.current);
    setSelectedOption(opt);
    setIsAnswerSubmitted(true);

    const isCorrect = opt === currentQ.correct_answer;
    if (isCorrect) {
      sounds.playCorrect();
      setScore((prev) => prev + 1);
      setStreak((prev) => prev + 1);
      recordWordProgress(currentQ.id, 'mastered');
    } else {
      sounds.playWrong();
      setStreak(0);
      recordWordProgress(currentQ.id, 'needs_review');
    }
  };

  const handleNextQuestion = () => {
    sounds.playFlip();
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswerSubmitted(false);
      setTimeLeft(timerSetting > 0 ? timerSetting : 999);
    } else {
      setGameState('result');
      sounds.playLevelUp();
      confetti({ particleCount: 110, spread: 85, origin: { y: 0.5 } });
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16 animate-in fade-in duration-300">
      {/* ── 1. SETUP STATE (MATCHES IMAGE 5) ── */}
      {gameState === 'setup' && (
        <>
          {/* Header Banner */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white border border-pink-100 shadow-sm relative overflow-hidden">
            <div className="absolute right-4 top-2 text-pink-100/50 font-jp font-black text-8xl pointer-events-none select-none">
              学
            </div>

            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-50 text-pink-700 font-extrabold text-[11px] uppercase tracking-wider mb-2.5">
                <CheckSquare size={13} className="text-pink-600" />
                <span>TRẮC NGHIỆM ABCD - JLPT N5</span>
              </div>

              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-snug mb-1.5">
                Trắc Nghiệm JLPT N5
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 max-w-2xl mb-0">
                Hệ thống 4 lựa chọn ABCD chuẩn format kỳ thi năng lực tiếng Nhật, tích hợp bấm giờ phản xạ.
              </p>
            </div>
          </div>

          {/* CHỌN DẠNG CÂU HỎI */}
          <div className="space-y-3">
            <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">
              CHỌN DẠNG CÂU HỎI
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {modeCards.map((m) => {
                const Icon = m.icon;
                const isSelected = quizMode === m.id;
                return (
                  <div
                    key={m.id}
                    onClick={() => { sounds.playFlip(); setQuizMode(m.id); }}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'bg-pink-50/60 border-pink-500 shadow-lotus ring-2 ring-pink-500/20'
                        : 'bg-white border-pink-100/80 hover:border-pink-300 shadow-sm'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                        isSelected ? 'bg-pink-600 text-white' : 'bg-pink-50 text-pink-600'
                      }`}>
                        <Icon size={16} />
                      </div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase">
                        {m.badge}
                      </span>
                    </div>

                    <div>
                      <h4 className="font-extrabold text-xs text-slate-900 mb-0.5">
                        {m.title}
                      </h4>
                      <p className="text-[11px] text-slate-500 mb-0">
                        {m.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* TÙY CHỈNH THÔNG SỐ BÀI THI */}
          <div className="p-6 rounded-3xl bg-white border border-pink-100 shadow-sm space-y-6">
            <h3 className="text-sm font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center text-xs">◎</span>
              <span>Tùy chỉnh thông số bài thi</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {/* Scope of lesson */}
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-2">
                  Phạm vi bài học
                </label>
                <select
                  value={selectedLesson}
                  onChange={(e) => setSelectedLesson(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-pink-200 bg-pink-50/40 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-pink-500"
                >
                  <option value="all">Tất cả 25 bài (1,589 từ)</option>
                  {Array.from({ length: 25 }, (_, i) => i + 1).map((n) => (
                    <option key={n} value={n}>
                      Bài {n < 10 ? `0${n}` : n}
                    </option>
                  ))}
                </select>
              </div>

              {/* Number of questions */}
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-2">
                  Số lượng câu hỏi
                </label>
                <div className="flex gap-2">
                  {[5, 10, 20].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setQuestionCount(num)}
                      className={`flex-1 py-2 text-xs font-bold rounded-xl border transition-all ${
                        questionCount === num
                          ? 'bg-pink-600 text-white border-pink-600 shadow-sm'
                          : 'bg-white text-slate-700 border-pink-100 hover:bg-pink-50'
                      }`}
                    >
                      {num} câu
                    </button>
                  ))}
                </div>
              </div>

              {/* Timer per question */}
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-2">
                  Thời gian / câu
                </label>
                <div className="flex gap-2">
                  {[
                    { val: 10, label: '10s' },
                    { val: 20, label: '20s' },
                    { val: 30, label: '30s' },
                    { val: 0, label: '∞' }
                  ].map((t) => (
                    <button
                      key={t.val}
                      type="button"
                      onClick={() => setTimerSetting(t.val)}
                      className={`flex-1 py-2 text-xs font-bold rounded-xl border transition-all ${
                        timerSetting === t.val
                          ? 'bg-pink-600 text-white border-pink-600 shadow-sm'
                          : 'bg-white text-slate-700 border-pink-100 hover:bg-pink-50'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Start Button */}
            <button
              type="button"
              onClick={startQuiz}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-pink-600 via-rose-500 to-pink-500 hover:from-pink-500 hover:to-rose-600 text-white font-extrabold text-sm shadow-lotus hover:shadow-lotus-lg flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-95"
            >
              <Sparkles size={18} />
              <span>Bắt đầu làm bài thi ngay</span>
            </button>
          </div>
        </>
      )}

      {/* ── 2. PLAYING STATE ── */}
      {gameState === 'playing' && currentQ && (
        <div className="space-y-4 max-w-2xl mx-auto">
          {/* Top Bar: Progress + Timer + Streak */}
          <div className="flex justify-between items-center px-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-lg bg-pink-100 text-pink-700 font-extrabold text-xs">
                Câu {currentIndex + 1} / {questions.length}
              </span>
              <span className="text-xs font-semibold text-slate-400">
                Bài {currentQ.lesson_number}
              </span>
              {streak >= 2 && (
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-xs font-bold animate-pulse">
                  <Flame size={13} fill="#f59e0b" />
                  <span>Chuỗi {streak}</span>
                </span>
              )}
            </div>

            {timerSetting > 0 && (
              <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                timeLeft <= 5
                  ? 'bg-rose-50 text-rose-600 border-rose-200 animate-bounce'
                  : 'bg-white text-slate-600 border-pink-100'
              }`}>
                <Clock size={14} />
                <span>{timeLeft}s</span>
              </div>
            )}
          </div>

          <div className="w-full h-1.5 rounded-full bg-pink-100 overflow-hidden">
            <div
              className="h-full bg-pink-600 rounded-full transition-all duration-300"
              style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
            />
          </div>

          {/* Question Card */}
          <div className="p-8 rounded-3xl bg-white border border-pink-100 shadow-lotus space-y-6 text-center relative">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              {currentQ.prompt}
            </span>

            <div className="flex items-center justify-center gap-3">
              <h2 className="text-4xl sm:text-5xl font-black font-jp text-slate-900 tracking-wide">
                {currentQ.question}
              </h2>
              {currentQ.audio_text && (
                <button
                  type="button"
                  onClick={() => speakJapanese(currentQ.audio_text)}
                  className="w-9 h-9 rounded-full bg-pink-50 hover:bg-pink-100 text-pink-600 flex items-center justify-center transition-colors"
                >
                  <Volume2 size={18} />
                </button>
              )}
            </div>

            {/* 4 Options Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {currentQ.options.map((opt, idx) => {
                let btnStyle = 'bg-white border-pink-100 text-slate-800 hover:border-pink-300 hover:bg-pink-50/50';

                if (isAnswerSubmitted) {
                  if (opt === currentQ.correct_answer) {
                    btnStyle = 'bg-emerald-500 text-white border-emerald-600 shadow-md scale-[1.02]';
                  } else if (selectedOption === opt) {
                    btnStyle = 'bg-rose-500 text-white border-rose-600';
                  } else {
                    btnStyle = 'bg-slate-50 text-slate-400 border-slate-200 opacity-50';
                  }
                }

                return (
                  <button
                    key={idx}
                    type="button"
                    disabled={isAnswerSubmitted}
                    onClick={() => handleSelectOption(opt)}
                    className={`p-4 rounded-2xl border font-bold text-sm text-left flex items-center justify-between transition-all active:scale-95 ${btnStyle}`}
                  >
                    <span className="truncate pr-2">{opt}</span>
                    <span className="w-6 h-6 rounded-lg bg-black/5 flex items-center justify-center text-xs font-black shrink-0">
                      {String.fromCharCode(65 + idx)}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Explanation & AI Button after submit */}
            {isAnswerSubmitted && (
              <div className="p-4 rounded-2xl bg-pink-50/70 border border-pink-100 text-left space-y-2 animate-in fade-in">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-pink-700">Giải thích đáp án:</span>
                  <button
                    type="button"
                    onClick={() => askAi('explain_quiz', currentQ, `AI Giải Thích: ${currentQ.question}`)}
                    className="px-2.5 py-1 rounded-lg bg-white border border-pink-200 text-pink-700 text-xs font-bold flex items-center gap-1 hover:bg-pink-50 transition-colors"
                  >
                    <Sparkles size={13} className="text-pink-600" />
                    <span>Hỏi AI chi tiết</span>
                  </button>
                </div>
                <p className="text-xs text-slate-700 mb-0 leading-relaxed">
                  {currentQ.explanation}
                </p>
              </div>
            )}
          </div>

          {/* Next Button */}
          {isAnswerSubmitted && (
            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={handleNextQuestion}
                className="px-6 py-3 rounded-2xl bg-pink-600 hover:bg-pink-700 text-white font-bold text-sm shadow-lotus flex items-center gap-2 transition-all hover:scale-105"
              >
                <span>{currentIndex === questions.length - 1 ? 'Xem kết quả' : 'Câu tiếp theo'}</span>
                <ArrowRight size={16} />
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── 3. RESULT STATE ── */}
      {gameState === 'result' && (
        <div className="p-8 sm:p-12 rounded-3xl bg-white border border-pink-100 shadow-lotus text-center space-y-5 max-w-lg mx-auto animate-in zoom-in-95">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-pink-600 to-rose-500 text-white flex items-center justify-center mx-auto shadow-lotus">
            <Trophy size={40} />
          </div>

          <div>
            <h2 className="text-2xl font-black text-slate-900 mb-1">
              Hoàn Thành Bài Thi!
            </h2>
            <p className="text-xs text-slate-500">
              Bạn đã hoàn thành bài kiểm tra trắc nghiệm format JLPT N5.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-pink-50/50 border border-pink-100 flex justify-around">
            <div>
              <span className="text-3xl font-black text-pink-600">
                {Math.round((score / questions.length) * 100)}%
              </span>
              <span className="text-xs text-slate-400 block font-bold mt-0.5">Tỷ lệ đúng</span>
            </div>
            <div className="w-px bg-pink-200" />
            <div>
              <span className="text-3xl font-black text-emerald-600">
                {score}/{questions.length}
              </span>
              <span className="text-xs text-slate-400 block font-bold mt-0.5">Câu chính xác</span>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => setGameState('setup')}
              className="flex-1 py-3 rounded-2xl border border-pink-200 text-slate-700 font-bold text-xs hover:bg-pink-50 transition-colors"
            >
              Đổi thông số đề thi
            </button>
            <button
              type="button"
              onClick={startQuiz}
              className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-pink-600 to-rose-500 text-white font-bold text-xs shadow-lotus hover:scale-105 transition-transform"
            >
              Làm lại đề mới
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
