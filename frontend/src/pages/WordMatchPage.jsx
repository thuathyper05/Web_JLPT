import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { vocabService, speakJapanese } from '../services/api';
import { sounds } from '../services/sounds';
import FuriganaWord from '../components/FuriganaWord';
import {
  Zap,
  Clock,
  RotateCcw,
  Trophy,
  Flame,
  CheckCircle2,
  Sparkles,
  Volume2,
  VolumeX,
  HelpCircle,
  Play,
  Heart,
  Coffee,
  Check,
  X,
  Lightbulb,
  Award,
  Star,
  Shuffle
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function WordMatchPage() {
  const { currentLevel, selectedLesson, recordWordProgress, askAi } = useApp();

  const [lessonFilter, setLessonFilter] = useState(selectedLesson ? String(selectedLesson) : '1');
  const [gameMode, setGameMode] = useState('relax'); // 'relax' | 'speed_60s' | 'survival'
  const [gameState, setGameState] = useState('setup'); // 'setup' | 'playing' | 'result'
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Stats & Progress
  const [timeLeft, setTimeLeft] = useState(60);
  const [lives, setLives] = useState(3);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [pairsCleared, setPairsCleared] = useState(0);
  const [roundsCompleted, setRoundsCompleted] = useState(0);
  const [hintsRemaining, setHintsRemaining] = useState(3);

  // Active cards in current round (5 pairs = 5 JP cards on left, 5 VI cards on right)
  const [jpCards, setJpCards] = useState([]);
  const [viCards, setViCards] = useState([]);
  const [selectedJp, setSelectedJp] = useState(null);
  const [selectedVi, setSelectedVi] = useState(null);
  const [matchedWordIds, setMatchedWordIds] = useState(new Set());
  const [wrongMatch, setWrongMatch] = useState({ jpId: null, viId: null });
  const [hintPair, setHintPair] = useState(null);

  // Pool of words and learning history
  const [poolWords, setPoolWords] = useState([]);
  const [missedWords, setMissedWords] = useState([]);

  const timerRef = useRef(null);

  // Load a set of 5 pairs displayed clearly in 2 parallel columns
  const loadRound = (words) => {
    const shuffled = [...words].sort(() => Math.random() - 0.5);
    const chosen = shuffled.slice(0, 5);

    // Left Column: Japanese Cards
    const leftColumn = chosen.map((w) => ({
      uid: `jp_${w.id}`,
      wordId: w.id,
      kanji: w.kanji,
      kana: w.clean_kana || w.kana,
      romaji: w.romaji,
      audio: w.clean_kana || w.kana || w.kanji,
      fullWord: w
    })).sort(() => Math.random() - 0.5);

    // Right Column: Vietnamese Meaning Cards
    const rightColumn = chosen.map((w) => ({
      uid: `vi_${w.id}`,
      wordId: w.id,
      meaning: w.clean_vietnamese || w.vietnamese,
      fullWord: w
    })).sort(() => Math.random() - 0.5);

    setJpCards(leftColumn);
    setViCards(rightColumn);
    setSelectedJp(null);
    setSelectedVi(null);
    setMatchedWordIds(new Set());
    setWrongMatch({ jpId: null, viId: null });
    setHintPair(null);
  };

  const startGame = async () => {
    sounds.playFlip();
    try {
      const params = lessonFilter === 'all'
        ? { level: currentLevel || 'N5' }
        : { lesson: parseInt(lessonFilter), level: currentLevel || 'N5' };
      const res = await vocabService.getVocabularies(params);
      const allWords = res.data?.data || [];
      if (allWords.length < 5) return;

      setPoolWords(allWords);
      setScore(0);
      setCombo(0);
      setMaxCombo(0);
      setPairsCleared(0);
      setRoundsCompleted(0);
      setMissedWords([]);
      setTimeLeft(60);
      setLives(3);
      setHintsRemaining(3);

      loadRound(allWords);
      setGameState('playing');
    } catch (err) {
      console.error('Start word match error:', err);
    }
  };

  // Timer countdown for speed_60s mode
  useEffect(() => {
    if (gameState !== 'playing' || gameMode !== 'speed_60s') return;

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
  }, [gameState, gameMode]);

  // Handle Japanese Card Click (Left Column)
  const handleJpClick = (card) => {
    if (matchedWordIds.has(card.wordId) || wrongMatch.jpId) return;

    if (soundEnabled) {
      speakJapanese(card.audio);
    }
    sounds.playFlip();

    // If same card clicked, deselect
    if (selectedJp?.wordId === card.wordId) {
      setSelectedJp(null);
      return;
    }

    setSelectedJp(card);

    // If a Vietnamese card was already selected, check match immediately!
    if (selectedVi) {
      evaluateMatch(card, selectedVi);
    }
  };

  // Handle Vietnamese Card Click (Right Column)
  const handleViClick = (card) => {
    if (matchedWordIds.has(card.wordId) || wrongMatch.viId) return;
    sounds.playFlip();

    // If same card clicked, deselect
    if (selectedVi?.wordId === card.wordId) {
      setSelectedVi(null);
      return;
    }

    setSelectedVi(card);

    // If a Japanese card was already selected, check match immediately!
    if (selectedJp) {
      evaluateMatch(selectedJp, card);
    }
  };

  // Evaluate matching logic
  const evaluateMatch = (jp, vi) => {
    if (jp.wordId === vi.wordId) {
      // MATCH SUCCESS!
      sounds.playCorrect();
      if (soundEnabled) {
        speakJapanese(jp.audio);
      }

      const nextMatched = new Set([...matchedWordIds, jp.wordId]);
      setMatchedWordIds(nextMatched);
      setSelectedJp(null);
      setSelectedVi(null);
      setHintPair(null);

      // Score and Combo Calculation
      const nextCombo = combo + 1;
      setCombo(nextCombo);
      setMaxCombo((prev) => Math.max(prev, nextCombo));
      const bonusScore = 10 + nextCombo * 5;
      setScore((prev) => prev + bonusScore);
      setPairsCleared((prev) => prev + 1);

      // Record study progress for real streak and daily target!
      recordWordProgress(jp.wordId, 'mastered');

      // Check if current round (5 pairs) is completed
      if (nextMatched.size >= 5) {
        sounds.playLevelUp();
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#ec4899', '#f43f5e', '#3b82f6', '#10b981']
        });

        if (gameMode === 'speed_60s') {
          setTimeLeft((prev) => prev + 6); // Bonus +6s
        }
        setRoundsCompleted((prev) => prev + 1);

        setTimeout(() => {
          loadRound(poolWords);
        }, 500);
      }
    } else {
      // WRONG MATCH
      sounds.playWrong();
      setWrongMatch({ jpId: jp.wordId, viId: vi.wordId });
      setCombo(0);
      recordWordProgress(jp.wordId, 'needs_review');

      // Record missed word for review
      setMissedWords((prev) => {
        const exists = prev.some((w) => w.id === jp.wordId);
        return exists ? prev : [...prev, jp.fullWord];
      });

      // Handle Survival Mode Lives
      if (gameMode === 'survival') {
        setLives((prev) => {
          const next = prev - 1;
          if (next <= 0) {
            setTimeout(() => {
              setGameState('result');
              sounds.playLevelUp();
              confetti({ particleCount: 80, spread: 70, origin: { y: 0.5 } });
            }, 600);
          }
          return Math.max(0, next);
        });
      }

      // Reset selection and shake after brief delay
      setTimeout(() => {
        setWrongMatch({ jpId: null, viId: null });
        setSelectedJp(null);
        setSelectedVi(null);
      }, 500);
    }
  };

  // Smart Hint: Highlights one un-matched pair
  const triggerHint = () => {
    if (hintsRemaining <= 0) return;
    const unmatched = jpCards.filter((card) => !matchedWordIds.has(card.wordId));
    if (unmatched.length === 0) return;

    sounds.playFlip();
    const target = unmatched[0];
    setHintPair(target.wordId);
    setHintsRemaining((prev) => prev - 1);

    setTimeout(() => {
      setHintPair(null);
    }, 2000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16 animate-in fade-in duration-300">
      {/* ── 1. HEADER BANNER ── */}
      <div className="p-6 sm:p-7 rounded-3xl bg-gradient-to-r from-slate-900 via-rose-950 to-slate-900 text-white relative overflow-hidden shadow-lg border border-pink-900/30">
        <div className="absolute right-4 top-2 text-white/5 font-jp font-black text-8xl pointer-events-none select-none">
          結
        </div>

        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/20 text-pink-300 font-extrabold text-[11px] uppercase tracking-wider border border-pink-400/30 backdrop-blur-md">
            <Zap size={13} className="text-pink-400" />
            <span>ĐẤU TRƯỜNG PHẢN XẠ - NỐI TỪ NHẬT VIỆT THẾ HỆ MỚI</span>
          </div>

          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-snug">
            Đấu Trường Nối Từ Tiếng Nhật
          </h1>
          <p className="text-xs sm:text-sm text-pink-100/80 max-w-2xl mb-0 leading-relaxed">
            Thiết kế 2 cột trực quan: Chạm từ tiếng Nhật ở cột trái và chọn nghĩa tiếng Việt ở cột phải. Trải nghiệm mượt mà, rèn luyện phản xạ không bao giờ nhàm chán.
          </p>
        </div>
      </div>

      {/* ── 2. SETUP SCREEN (EASY & WELCOMING) ── */}
      {gameState === 'setup' && (
        <div className="p-6 sm:p-10 rounded-3xl bg-white border border-pink-100 shadow-lotus text-center space-y-6 max-w-xl mx-auto">
          <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-3xl bg-gradient-to-tr from-pink-600 via-rose-500 to-pink-500 text-white flex items-center justify-center shadow-lotus">
            <Zap size={36} />
          </div>

          <div className="space-y-1.5">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Chọn Chế Độ Chơi Hứng Thú
            </h2>
            <p className="text-xs text-slate-500 leading-relaxed max-w-md mx-auto">
              Chỉ cần nối đúng từ tiếng Nhật với nghĩa tiếng Việt tương ứng. Chuỗi nối chuẩn liên tiếp kích hoạt Combo điểm số!
            </p>
          </div>

          {/* Mode Selector (3 Card Options) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
            <button
              type="button"
              onClick={() => { sounds.playFlip(); setGameMode('relax'); }}
              className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                gameMode === 'relax'
                  ? 'bg-pink-50/80 border-pink-500 ring-2 ring-pink-500/20 shadow-xs'
                  : 'bg-white border-slate-200 hover:border-pink-200 hover:bg-slate-50/50'
              }`}
            >
              <div className="flex items-center gap-1.5 text-pink-600 font-extrabold text-xs mb-1">
                <Coffee size={15} />
                <span>Luyện Thư Giãn</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-snug mb-0">
                Không áp lực giờ giấc, thảnh thơi vừa học vừa nghe phát âm Tokyo.
              </p>
            </button>

            <button
              type="button"
              onClick={() => { sounds.playFlip(); setGameMode('speed_60s'); }}
              className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                gameMode === 'speed_60s'
                  ? 'bg-pink-50/80 border-pink-500 ring-2 ring-pink-500/20 shadow-xs'
                  : 'bg-white border-slate-200 hover:border-pink-200 hover:bg-slate-50/50'
              }`}
            >
              <div className="flex items-center gap-1.5 text-rose-600 font-extrabold text-xs mb-1">
                <Clock size={15} />
                <span>Chạy Đua 60 Giây</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-snug mb-0">
                Đua tốc độ cùng thời gian, thưởng thêm +6 giây mỗi khi dọn sạch bàn.
              </p>
            </button>

            <button
              type="button"
              onClick={() => { sounds.playFlip(); setGameMode('survival'); }}
              className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                gameMode === 'survival'
                  ? 'bg-pink-50/80 border-pink-500 ring-2 ring-pink-500/20 shadow-xs'
                  : 'bg-white border-slate-200 hover:border-pink-200 hover:bg-slate-50/50'
              }`}
            >
              <div className="flex items-center gap-1.5 text-purple-600 font-extrabold text-xs mb-1">
                <Heart size={15} />
                <span>Sinh Tồn 3 Tim</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-snug mb-0">
                Thử thách phản xạ chính xác, cho phép tối đa 3 lần chọn sai.
              </p>
            </button>
          </div>

          {/* Lesson Scope Selector */}
          <div className="max-w-xs mx-auto text-left">
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Phạm vi bài học:
            </label>
            <select
              value={lessonFilter}
              onChange={(e) => setLessonFilter(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-pink-200 text-xs font-bold text-slate-800 bg-white cursor-pointer shadow-xs focus:outline-none focus:ring-2 focus:ring-pink-500"
            >
              <option value="all">Tất cả bài học (Cấp độ {currentLevel || 'N5'})</option>
              {(currentLevel === 'N4'
                ? Array.from({ length: 25 }, (_, i) => i + 26)
                : currentLevel === 'N3'
                ? Array.from({ length: 20 }, (_, i) => i + 1)
                : currentLevel === 'N2' || currentLevel === 'N1'
                ? Array.from({ length: 15 }, (_, i) => i + 1)
                : Array.from({ length: 25 }, (_, i) => i + 1)
              ).map((n) => (
                <option key={n} value={n}>
                  Bài {n < 10 ? `0${n}` : n}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={startGame}
            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-pink-600 via-rose-500 to-pink-500 text-white font-black text-sm shadow-lotus hover:scale-105 active:scale-95 transition-all cursor-pointer inline-flex items-center justify-center gap-2"
          >
            <Play size={18} fill="white" />
            <span>Vào đấu trường ngay</span>
          </button>
        </div>
      )}

      {/* ── 3. PLAYING SCREEN (DUAL COLUMN MATCH ARENA) ── */}
      {gameState === 'playing' && (
        <div className="space-y-4">
          {/* Top HUD Status Bar */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-white border border-pink-100 shadow-sm flex items-center justify-between gap-3 flex-wrap">
            {/* Mode Indicator */}
            <div className="flex items-center gap-2">
              {gameMode === 'speed_60s' && (
                <div className={`flex items-center gap-1.5 font-black text-sm ${timeLeft <= 10 ? 'text-rose-600 animate-pulse' : 'text-slate-800'}`}>
                  <Clock size={16} className={timeLeft <= 10 ? 'text-rose-600' : 'text-pink-600'} />
                  <span>{timeLeft}s còn lại</span>
                </div>
              )}

              {gameMode === 'survival' && (
                <div className="flex items-center gap-1.5 font-black text-xs text-rose-600">
                  <span className="text-slate-500 font-bold">Mạng:</span>
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Heart
                      key={i}
                      size={15}
                      className={i < lives ? 'text-rose-500 fill-rose-500' : 'text-slate-200 fill-slate-200'}
                    />
                  ))}
                </div>
              )}

              {gameMode === 'relax' && (
                <div className="flex items-center gap-1.5 font-bold text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200">
                  <Coffee size={14} />
                  <span>Luyện tập tự do</span>
                </div>
              )}
            </div>

            {/* Middle: Combo Fever Banner */}
            {combo >= 2 && (
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 font-black text-xs animate-bounce shadow-xs">
                <Flame size={14} fill="#f59e0b" />
                <span>COMBO x{combo} (+{combo * 5} điểm)</span>
              </div>
            )}

            {/* Right: Score & Hint & Audio Tools */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={triggerHint}
                disabled={hintsRemaining <= 0}
                className="px-2.5 py-1 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-700 font-bold text-xs flex items-center gap-1 transition-all disabled:opacity-40 cursor-pointer"
                title="Bấm để nhận gợi ý 1 cặp từ"
              >
                <Lightbulb size={13} className="text-amber-500 fill-amber-400" />
                <span>Gợi ý ({hintsRemaining})</span>
              </button>

              <button
                type="button"
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="p-1.5 rounded-xl bg-slate-50 hover:bg-pink-50 border border-slate-200 text-slate-600 hover:text-pink-600 transition-colors cursor-pointer"
                title={soundEnabled ? 'Tắt âm thanh' : 'Bật âm thanh'}
              >
                {soundEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
              </button>

              <div className="text-xs font-bold text-slate-700">
                Điểm: <span className="text-pink-600 font-black text-sm">{score}</span>
              </div>
            </div>
          </div>

          {/* DUAL COLUMN PLAYGROUND: LEFT (JAPANESE) VS RIGHT (VIETNAMESE) */}
          <div className="grid grid-cols-2 gap-3 sm:gap-6">
            {/* Column 1: Japanese Words */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between px-1">
                <span className="text-[11px] font-black text-pink-700 uppercase tracking-wider flex items-center gap-1">
                  <span>CỘT TIẾNG NHẬT</span>
                </span>
                <span className="text-[10px] text-slate-400 font-medium">Chạm để chọn & nghe</span>
              </div>

              <div className="space-y-2.5">
                {jpCards.map((card) => {
                  const isMatched = matchedWordIds.has(card.wordId);
                  const isSelected = selectedJp?.wordId === card.wordId;
                  const isWrong = wrongMatch.jpId === card.wordId;
                  const isHinted = hintPair === card.wordId;

                  return (
                    <button
                      key={card.uid}
                      type="button"
                      disabled={isMatched}
                      onClick={() => handleJpClick(card)}
                      className={`w-full min-h-[64px] sm:min-h-[72px] p-3 rounded-2xl border flex items-center justify-between text-left transition-all cursor-pointer relative select-none ${
                        isMatched
                          ? 'opacity-30 scale-95 bg-emerald-50 border-emerald-300 text-emerald-800 pointer-events-none'
                          : isWrong
                          ? 'bg-rose-100 border-rose-500 text-rose-800 animate-shake ring-4 ring-rose-200 shadow-sm'
                          : isHinted
                          ? 'bg-amber-50 border-amber-400 ring-4 ring-amber-200/80 animate-pulse text-amber-900'
                          : isSelected
                          ? 'bg-gradient-to-r from-pink-600 to-rose-500 text-white border-pink-600 shadow-lotus scale-[1.02] ring-4 ring-pink-200/80 z-10'
                          : 'bg-white border-pink-100 hover:border-pink-300 hover:bg-pink-50/40 text-slate-900 shadow-xs'
                      }`}
                    >
                      <div className="flex flex-col">
                        <FuriganaWord
                          kanji={card.kanji}
                          kana={card.kana}
                          size="base"
                          kanjiClassName={isSelected ? 'text-white' : 'text-slate-900 font-black'}
                          furiganaClassName={isSelected ? 'text-pink-100' : 'text-pink-600 font-bold'}
                        />
                        {card.romaji && (
                          <span className={`text-[10px] font-mono mt-0.5 ${isSelected ? 'text-pink-100' : 'text-slate-400'}`}>
                            {card.romaji}
                          </span>
                        )}
                      </div>

                      <div className="shrink-0 ml-2">
                        {isMatched ? (
                          <Check size={16} className="text-emerald-600 stroke-[3]" />
                        ) : isSelected ? (
                          <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                            <Volume2 size={13} className="text-white" />
                          </div>
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-pink-50 flex items-center justify-center text-pink-500">
                            <Volume2 size={12} />
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Column 2: Vietnamese Meanings */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between px-1">
                <span className="text-[11px] font-black text-purple-700 uppercase tracking-wider flex items-center gap-1">
                  <span>NGHĨA TIẾNG VIỆT</span>
                </span>
                <span className="text-[10px] text-slate-400 font-medium">Chạm để ghép đôi</span>
              </div>

              <div className="space-y-2.5">
                {viCards.map((card) => {
                  const isMatched = matchedWordIds.has(card.wordId);
                  const isSelected = selectedVi?.wordId === card.wordId;
                  const isWrong = wrongMatch.viId === card.wordId;
                  const isHinted = hintPair === card.wordId;

                  return (
                    <button
                      key={card.uid}
                      type="button"
                      disabled={isMatched}
                      onClick={() => handleViClick(card)}
                      className={`w-full min-h-[64px] sm:min-h-[72px] p-3 rounded-2xl border flex items-center justify-between text-left transition-all cursor-pointer relative select-none ${
                        isMatched
                          ? 'opacity-30 scale-95 bg-emerald-50 border-emerald-300 text-emerald-800 pointer-events-none'
                          : isWrong
                          ? 'bg-rose-100 border-rose-500 text-rose-800 animate-shake ring-4 ring-rose-200 shadow-sm'
                          : isHinted
                          ? 'bg-amber-50 border-amber-400 ring-4 ring-amber-200/80 animate-pulse text-amber-900'
                          : isSelected
                          ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white border-purple-600 shadow-lotus scale-[1.02] ring-4 ring-purple-200/80 z-10'
                          : 'bg-white border-purple-100 hover:border-purple-300 hover:bg-purple-50/40 text-slate-800 shadow-xs'
                      }`}
                    >
                      <span className="text-xs sm:text-sm font-bold leading-snug line-clamp-2">
                        {card.meaning}
                      </span>

                      <div className="shrink-0 ml-2">
                        {isMatched ? (
                          <Check size={16} className="text-emerald-600 stroke-[3]" />
                        ) : isSelected ? (
                          <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                            <Check size={13} className="text-white stroke-[2.5]" />
                          </div>
                        ) : null}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Footer Stats & Round Counter */}
          <div className="p-3 bg-white rounded-2xl border border-pink-100 text-center flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>
              Đã nối thành công: <strong className="text-pink-600 font-black">{pairsCleared} cặp từ</strong>
            </span>
            <span className="text-slate-400">
              Vòng chơi thứ <strong className="text-slate-700">{roundsCompleted + 1}</strong>
            </span>
          </div>
        </div>
      )}

      {/* ── 4. RESULT SCREEN (HIGH-END REWARD & REVIEW) ── */}
      {gameState === 'result' && (
        <div className="p-6 sm:p-10 rounded-3xl bg-white border border-pink-100 shadow-lotus text-center space-y-6 max-w-xl mx-auto animate-in zoom-in-95">
          <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-3xl bg-amber-50 text-amber-500 border border-amber-200 flex items-center justify-center shadow-sm">
            <Trophy size={40} />
          </div>

          <div className="space-y-1.5">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              KẾT QUẢ VÁN ĐẤU NỐI TỪ
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Tổng Điểm: <span className="text-pink-600">{score} điểm</span>
            </h2>
            <p className="text-xs text-slate-500 leading-relaxed max-w-md mx-auto">
              Bạn đã ghép chuẩn xác <strong>{pairsCleared} cặp từ</strong> qua <strong>{roundsCompleted} vòng</strong> với chuỗi Combo tối đa đạt <strong>x{maxCombo}</strong>!
            </p>
          </div>

          {/* Missed Words Section */}
          {missedWords.length > 0 && (
            <div className="p-4 rounded-2xl bg-pink-50/40 border border-pink-100 text-left space-y-2.5">
              <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <HelpCircle size={14} className="text-pink-600" />
                <span>CÁC TỪ CẦN ÔN LẠI TỪ VÁN ĐẤU:</span>
              </h4>
              <div className="space-y-1.5">
                {missedWords.slice(0, 4).map((w) => (
                  <div key={w.id} className="p-2.5 bg-white rounded-xl border border-pink-100 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-jp font-black text-slate-900 mr-2">{w.kanji || w.kana}</span>
                      <span className="text-slate-600">{w.clean_vietnamese || w.vietnamese}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => askAi('explain_vocab', w, `AI Mẹo Nhớ: ${w.kanji || w.kana}`)}
                      className="text-pink-600 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Sparkles size={12} />
                      <span>AI mẹo</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

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
