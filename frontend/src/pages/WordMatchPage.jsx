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
  Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function WordMatchPage() {
  const { selectedLesson, setSelectedLesson, recordWordProgress } = useApp();

  const [gameState, setGameState] = useState('setup'); // 'setup' | 'playing' | 'result'
  const [timeLeft, setTimeLeft] = useState(60);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);

  const [leftCards, setLeftCards] = useState([]);
  const [rightCards, setRightCards] = useState([]);
  const [selectedLeft, setSelectedLeft] = useState(null);
  const [selectedRight, setSelectedRight] = useState(null);
  const [matchedIds, setMatchedIds] = useState(new Set());

  const timerRef = useRef(null);

  const startGame = async () => {
    sounds.playFlip();
    try {
      const res = await vocabService.getVocabularies({ lesson: selectedLesson });
      const allWords = res.data?.data || [];
      const shuffled = [...allWords].sort(() => Math.random() - 0.5).slice(0, 6);

      const left = shuffled.map((w) => ({
        id: w.id,
        text: w.kanji || w.clean_kana || w.kana,
        audio: w.clean_kana || w.kana || w.kanji
      })).sort(() => Math.random() - 0.5);

      const right = shuffled.map((w) => ({
        id: w.id,
        text: w.clean_vietnamese || w.vietnamese
      })).sort(() => Math.random() - 0.5);

      setLeftCards(left);
      setRightCards(right);
      setSelectedLeft(null);
      setSelectedRight(null);
      setMatchedIds(new Set());
      setScore(0);
      setCombo(0);
      setTimeLeft(60);
      setGameState('playing');
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (gameState !== 'playing') return;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          setGameState('result');
          sounds.playLevelUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [gameState]);

  // Match check
  useEffect(() => {
    if (!selectedLeft || !selectedRight) return;

    if (selectedLeft.id === selectedRight.id) {
      sounds.playCorrect();
      speakJapanese(selectedLeft.audio);
      setMatchedIds((prev) => new Set([...prev, selectedLeft.id]));
      setScore((prev) => prev + 10 + combo * 2);
      setCombo((prev) => prev + 1);
      recordWordProgress(selectedLeft.id, 'mastered');

      // Check if all matched
      if (matchedIds.size + 1 >= leftCards.length) {
        setTimeout(() => {
          setGameState('result');
          sounds.playLevelUp();
          confetti({ particleCount: 100, spread: 80, origin: { y: 0.5 } });
        }, 400);
      }
    } else {
      sounds.playWrong();
      setCombo(0);
    }

    setTimeout(() => {
      setSelectedLeft(null);
      setSelectedRight(null);
    }, 300);
  }, [selectedLeft, selectedRight]);

  return (
    <div className="space-y-6 max-w-3xl mx-auto pb-16 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-pink-100 shadow-sm relative overflow-hidden">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 text-amber-800 font-extrabold text-[11px] uppercase tracking-wider mb-2.5">
          <Zap size={13} className="text-amber-500" />
          <span>MINI-GAME 60S • PHẢN XẠ NHANH</span>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-snug mb-1">
              Nối Từ Siêu Tốc
            </h1>
            <p className="text-xs text-slate-500 mb-0">
              Ghép thẻ tiếng Nhật và ý nghĩa tiếng Việt tương ứng trong 60 giây, rèn tốc độ truy xuất trí nhớ.
            </p>
          </div>

          {gameState === 'setup' && (
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
          )}
        </div>
      </div>

      {/* SETUP */}
      {gameState === 'setup' && (
        <div className="p-8 sm:p-12 rounded-3xl bg-white border border-pink-100 shadow-lotus text-center space-y-5 max-w-md mx-auto">
          <div className="w-16 h-16 rounded-3xl bg-amber-50 text-amber-500 flex items-center justify-center mx-auto shadow-sm">
            <Zap size={32} />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900 mb-1">Sẵn Sàng Ghép Cặp?</h2>
            <p className="text-xs text-slate-500 mb-0">
              Bạn có 60 giây để nối đúng 6 cặp từ vựng của Bài {selectedLesson}.
            </p>
          </div>
          <button
            type="button"
            onClick={startGame}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-pink-600 via-rose-500 to-pink-500 text-white font-extrabold text-sm shadow-lotus hover:scale-105 active:scale-95 transition-all"
          >
            Bắt đầu ngay ⚡
          </button>
        </div>
      )}

      {/* PLAYING */}
      {gameState === 'playing' && (
        <div className="space-y-4">
          {/* Top Bar */}
          <div className="flex justify-between items-center px-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500">
                Điểm: <strong className="text-pink-600 text-sm">{score}</strong>
              </span>
              {combo >= 2 && (
                <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-xs font-bold animate-pulse">
                  <Flame size={13} fill="#f59e0b" />
                  <span>Combo x{combo}</span>
                </span>
              )}
            </div>

            <div className={`flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-extrabold border ${
              timeLeft <= 10
                ? 'bg-rose-50 text-rose-600 border-rose-200 animate-bounce'
                : 'bg-white text-slate-700 border-pink-100'
            }`}>
              <Clock size={14} />
              <span>{timeLeft}s</span>
            </div>
          </div>

          {/* 2 Columns: Japanese Cards & Vietnamese Cards */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {/* Left Col (Japanese) */}
            <div className="space-y-2.5">
              {leftCards.map((c) => {
                const isMatched = matchedIds.has(c.id);
                const isSelected = selectedLeft?.id === c.id;

                if (isMatched) {
                  return (
                    <div
                      key={c.id}
                      className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 font-jp font-bold text-center opacity-30 select-none"
                    >
                      ✓ {c.text}
                    </div>
                  );
                }

                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => { sounds.playFlip(); setSelectedLeft(c); }}
                    className={`w-full p-4 rounded-2xl border font-jp font-extrabold text-sm sm:text-base text-center transition-all active:scale-95 shadow-sm ${
                      isSelected
                        ? 'bg-pink-600 text-white border-pink-600 scale-105 shadow-lotus'
                        : 'bg-white border-pink-100 text-slate-900 hover:border-pink-300 hover:bg-pink-50/50'
                    }`}
                  >
                    {c.text}
                  </button>
                );
              })}
            </div>

            {/* Right Col (Vietnamese) */}
            <div className="space-y-2.5">
              {rightCards.map((c) => {
                const isMatched = matchedIds.has(c.id);
                const isSelected = selectedRight?.id === c.id;

                if (isMatched) {
                  return (
                    <div
                      key={c.id}
                      className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold text-xs sm:text-sm text-center opacity-30 select-none"
                    >
                      ✓ {c.text}
                    </div>
                  );
                }

                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => { sounds.playFlip(); setSelectedRight(c); }}
                    className={`w-full p-4 rounded-2xl border font-bold text-xs sm:text-sm text-center transition-all active:scale-95 shadow-sm ${
                      isSelected
                        ? 'bg-rose-500 text-white border-rose-500 scale-105 shadow-lotus'
                        : 'bg-white border-pink-100 text-slate-900 hover:border-pink-300 hover:bg-pink-50/50'
                    }`}
                  >
                    {c.text}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* RESULT */}
      {gameState === 'result' && (
        <div className="p-8 sm:p-12 rounded-3xl bg-white border border-pink-100 shadow-lotus text-center space-y-4 max-w-md mx-auto animate-in zoom-in-95">
          <div className="w-18 h-18 rounded-3xl bg-gradient-to-tr from-amber-500 to-pink-500 text-white flex items-center justify-center mx-auto shadow-lotus">
            <Trophy size={36} />
          </div>
          <h2 className="text-2xl font-black text-slate-900">Kết Thúc 60 Giây!</h2>
          <div className="p-4 rounded-2xl bg-pink-50/60 border border-pink-100">
            <span className="text-3xl font-black text-pink-600">{score}</span>
            <span className="text-xs text-slate-400 block font-bold mt-0.5">Tổng điểm phản xạ</span>
          </div>
          <button
            type="button"
            onClick={startGame}
            className="w-full py-3 rounded-2xl bg-pink-600 text-white font-extrabold text-sm shadow-lotus hover:bg-pink-700 transition-colors"
          >
            Chơi lại ngay
          </button>
        </div>
      )}
    </div>
  );
}
