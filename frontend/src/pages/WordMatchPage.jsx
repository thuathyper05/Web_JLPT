import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { vocabService, speakJapanese } from '../services/api';
import { sounds } from '../services/sounds';
import {
  Zap,
  Clock,
  RotateCcw,
  Trophy,
  Flame,
  CheckCircle2,
  Sparkles,
  Volume2,
  ArrowRight,
  HelpCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function WordMatchPage() {
  const { selectedLesson, setSelectedLesson, recordWordProgress, askAi } = useApp();

  const [lessonFilter, setLessonFilter] = useState(selectedLesson ? String(selectedLesson) : '1');
  const [gameState, setGameState] = useState('setup'); // 'setup' | 'playing' | 'result'
  const [timeLeft, setTimeLeft] = useState(60);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [roundsCompleted, setRoundsCompleted] = useState(0);

  const [poolWords, setPoolWords] = useState([]);
  const [leftCards, setLeftCards] = useState([]);
  const [rightCards, setRightCards] = useState([]);
  const [selectedLeft, setSelectedLeft] = useState(null);
  const [selectedRight, setSelectedRight] = useState(null);
  const [matchedIds, setMatchedIds] = useState(new Set());

  const timerRef = useRef(null);

  // Load a 6-word batch into matching board
  const loadRound = (words) => {
    const shuffled = [...words].sort(() => Math.random() - 0.5).slice(0, 6);

    const left = shuffled
      .map((w) => ({
        id: w.id,
        text: w.kanji || w.clean_kana || w.kana,
        audio: w.clean_kana || w.kana || w.kanji,
        meaning: w.clean_vietnamese || w.vietnamese
      }))
      .sort(() => Math.random() - 0.5);

    const right = shuffled
      .map((w) => ({
        id: w.id,
        text: w.clean_vietnamese || w.vietnamese
      }))
      .sort(() => Math.random() - 0.5);

    setLeftCards(left);
    setRightCards(right);
    setSelectedLeft(null);
    setSelectedRight(null);
    setMatchedIds(new Set());
  };

  const startGame = async () => {
    sounds.playFlip();
    try {
      const params = lessonFilter === 'all' ? {} : { lesson: parseInt(lessonFilter) };
      const res = await vocabService.getVocabularies(params);
      const allWords = res.data?.data || [];
      if (allWords.length < 6) return;

      setPoolWords(allWords);
      setScore(0);
      setCombo(0);
      setRoundsCompleted(0);
      setTimeLeft(60);
      loadRound(allWords);
      setGameState('playing');
    } catch (err) {
      console.error('Start word match error:', err);
    }
  };

  // Timer countdown
  useEffect(() => {
    if (gameState !== 'playing') return;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          setGameState('result');
          sounds.playLevelUp();
          confetti({ particleCount: 120, spread: 80, origin: { y: 0.5 } });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [gameState]);

  // Match logic
  useEffect(() => {
    if (!selectedLeft || !selectedRight) return;

    if (selectedLeft.id === selectedRight.id) {
      sounds.playCorrect();
      speakJapanese(selectedLeft.audio);
      const newMatched = new Set([...matchedIds, selectedLeft.id]);
      setMatchedIds(newMatched);
      setScore((prev) => prev + 10 + combo * 2);
      setCombo((prev) => prev + 1);
      recordWordProgress(selectedLeft.id, 'mastered');

      // Clear selection
      setSelectedLeft(null);
      setSelectedRight(null);

      // Check if current 6 cards are all matched: chuyen sang next round with +5s bonus!
      if (newMatched.size >= leftCards.length) {
        sounds.playLevelUp();
        setTimeLeft((prev) => prev + 5);
        setRoundsCompleted((r) => r + 1);
        setTimeout(() => {
          loadRound(poolWords);
        }, 350);
      }
    } else {
      sounds.playWrong();
      setCombo(0);
      const leftElem = selectedLeft;
      const rightElem = selectedRight;
      setSelectedLeft(null);
      setSelectedRight(null);
    }
  }, [selectedLeft, selectedRight, matchedIds, leftCards, combo, poolWords, recordWordProgress]);

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16 animate-in fade-in duration-300">
      {/* ── 1. HEADER BANNER ── */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-pink-100 shadow-sm relative overflow-hidden">
        <div className="absolute right-4 top-2 text-pink-100/50 font-jp font-black text-8xl pointer-events-none select-none">
          結
        </div>

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-50 text-pink-700 font-extrabold text-[11px] uppercase tracking-wider mb-2.5">
            <Zap size={13} className="text-pink-600" />
            <span>MINI-GAME PHẢN XẠ • GHÉP TỪ 60S</span>
          </div>

          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-snug mb-1.5">
            Nối Từ Tiếng Nhật - Ý Nghĩa
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-2xl mb-0">
            Nhanh mắt nhanh tay ghép cặp từ tiếng Nhật với nghĩa tiếng Việt tương ứng trước khi hết giờ.
          </p>
        </div>
      </div>

      {/* ── 2. SETUP STATE ── */}
      {gameState === 'setup' && (
        <div className="p-8 sm:p-12 rounded-3xl bg-white border border-pink-100 shadow-lotus text-center space-y-6">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-tr from-pink-600 to-rose-500 text-white flex items-center justify-center shadow-lotus">
            <Zap size={36} />
          </div>

          <div className="space-y-2 max-w-md mx-auto">
            <h2 className="text-2xl font-black text-slate-900">Luật chơi 60 Giây</h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              Nhấn 1 thẻ tiếng Nhật ở cột trái, sau đó nhấn nghĩa tiếng Việt ở cột phải. Mỗi chuỗi nối đúng liên tiếp (combo) sẽ nhân đôi điểm thưởng. Nối hết 6 từ sẽ được thưởng thêm 5 giây!
            </p>
          </div>

          <div className="max-w-xs mx-auto">
            <label className="block text-xs font-bold text-slate-700 mb-1.5 text-left">
              Chọn phạm vi bài học:
            </label>
            <select
              value={lessonFilter}
              onChange={(e) => setLessonFilter(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-pink-200 text-xs font-bold text-slate-800 bg-white"
            >
              <option value="all">Tất cả bài học (1.512 từ vựng)</option>
              {Array.from({ length: 25 }, (_, i) => i + 1).map((n) => (
                <option key={n} value={n}>
                  Bài {n < 10 ? `0${n}` : n}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={startGame}
            className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-pink-600 via-rose-500 to-pink-500 text-white font-extrabold text-sm shadow-lotus hover:scale-105 active:scale-95 transition-all cursor-pointer inline-flex items-center gap-2"
          >
            <Zap size={18} />
            <span>Bắt đầu chơi ngay [60s]</span>
          </button>
        </div>
      )}

      {/* ── 3. PLAYING STATE ── */}
      {gameState === 'playing' && (
        <div className="space-y-4">
          {/* Dashboard HUD */}
          <div className="p-4 rounded-2xl bg-white border border-pink-100 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-2 text-rose-600 font-black text-sm">
              <Clock size={18} className="animate-pulse" />
              <span>{timeLeft}s còn lại</span>
            </div>

            <div className="flex items-center gap-4">
              {combo >= 2 && (
                <div className="flex items-center gap-1 text-amber-500 font-extrabold text-xs">
                  <Flame size={16} fill="#f59e0b" />
                  <span>Combo x{combo}</span>
                </div>
              )}
              <div className="text-slate-900 font-black text-base">
                Điểm: <span className="text-pink-600">{score}</span>
              </div>
            </div>
          </div>

          {/* 2 Columns Board */}
          <div className="grid grid-cols-2 gap-4">
            {/* Left Col: Japanese */}
            <div className="space-y-2.5">
              <div className="text-center text-[10.5px] font-black text-slate-400 uppercase tracking-wider">
                TIẾNG NHẬT
              </div>
              {leftCards.map((card) => {
                const isMatched = matchedIds.has(card.id);
                const isSelected = selectedLeft?.id === card.id;
                return (
                  <button
                    key={card.id}
                    type="button"
                    disabled={isMatched}
                    onClick={() => {
                      if (!isMatched) {
                        sounds.playFlip();
                        setSelectedLeft(card);
                      }
                    }}
                    className={`w-full p-4 rounded-2xl font-jp font-bold text-sm sm:text-base border transition-all text-center cursor-pointer ${
                      isMatched
                        ? 'opacity-30 bg-slate-100 text-slate-400 border-slate-200 line-through'
                        : isSelected
                        ? 'bg-pink-600 text-white border-pink-600 shadow-lotus scale-102 ring-4 ring-pink-200'
                        : 'bg-white border-pink-100/90 text-slate-800 hover:border-pink-300 hover:bg-pink-50/30 shadow-sm'
                    }`}
                  >
                    {card.text}
                  </button>
                );
              })}
            </div>

            {/* Right Col: Vietnamese */}
            <div className="space-y-2.5">
              <div className="text-center text-[10.5px] font-black text-slate-400 uppercase tracking-wider">
                Ý NGHĨA TIẾNG VIỆT
              </div>
              {rightCards.map((card) => {
                const isMatched = matchedIds.has(card.id);
                const isSelected = selectedRight?.id === card.id;
                return (
                  <button
                    key={card.id}
                    type="button"
                    disabled={isMatched}
                    onClick={() => {
                      if (!isMatched) {
                        sounds.playFlip();
                        setSelectedRight(card);
                      }
                    }}
                    className={`w-full p-4 rounded-2xl font-bold text-xs sm:text-sm border transition-all text-center cursor-pointer ${
                      isMatched
                        ? 'opacity-30 bg-slate-100 text-slate-400 border-slate-200 line-through'
                        : isSelected
                        ? 'bg-rose-500 text-white border-rose-500 shadow-lotus scale-102 ring-4 ring-rose-200'
                        : 'bg-white border-pink-100/90 text-slate-800 hover:border-pink-300 hover:bg-pink-50/30 shadow-sm'
                    }`}
                  >
                    {card.text}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── 4. RESULT STATE ── */}
      {gameState === 'result' && (
        <div className="p-8 sm:p-12 rounded-3xl bg-white border border-pink-100 shadow-lotus text-center space-y-6">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-amber-50 text-amber-500 flex items-center justify-center border border-amber-200 shadow-sm">
            <Trophy size={40} />
          </div>

          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Hết giờ</span>
            <h2 className="text-3xl font-black text-slate-900">
              Tổng điểm của bạn: <span className="text-pink-600">{score} điểm</span>
            </h2>
            <p className="text-xs text-slate-500">
              Bạn đã hoàn thành xuất sắc {roundsCompleted} lượt ghép từ liên tiếp!
            </p>
          </div>

          <div className="flex justify-center gap-3">
            <button
              type="button"
              onClick={startGame}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-pink-600 to-rose-500 text-white font-bold text-xs sm:text-sm shadow-lotus hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center gap-2"
            >
              <RotateCcw size={16} />
              <span>Chơi lại ván mới</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
