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
  HelpCircle,
  Play
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function WordMatchPage() {
  const { selectedLesson, setSelectedLesson, recordWordProgress, askAi } = useApp();

  const [lessonFilter, setLessonFilter] = useState(selectedLesson ? String(selectedLesson) : '1');
  const [gameState, setGameState] = useState('setup'); // 'setup' | 'playing' | 'result'
  const [timeLeft, setTimeLeft] = useState(60);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [pairsCleared, setPairsCleared] = useState(0);
  const [roundsCompleted, setRoundsCompleted] = useState(0);

  // Cards state: 12 tiles (6 JP, 6 VN)
  const [tiles, setTiles] = useState([]);
  const [selectedTile, setSelectedTile] = useState(null);
  const [matchedIds, setMatchedIds] = useState(new Set());
  const [wrongTileIds, setWrongTileIds] = useState([]);
  const [poolWords, setPoolWords] = useState([]);
  const [missedWords, setMissedWords] = useState([]);

  const timerRef = useRef(null);

  // Load a round of 6 pairs (12 tiles shuffled across a responsive grid)
  const loadRound = (words) => {
    const shuffledPool = [...words].sort(() => Math.random() - 0.5);
    const chosen = shuffledPool.slice(0, 6);

    const generatedTiles = [];
    chosen.forEach((w) => {
      // Tile Japanese
      generatedTiles.push({
        uid: `${w.id}_jp`,
        wordId: w.id,
        type: 'jp',
        text: w.kanji || w.clean_kana || w.kana,
        subtext: w.kanji ? (w.clean_kana || w.kana) : '',
        audio: w.clean_kana || w.kana || w.kanji,
        fullWord: w
      });
      // Tile Vietnamese
      generatedTiles.push({
        uid: `${w.id}_vi`,
        wordId: w.id,
        type: 'vi',
        text: w.clean_vietnamese || w.vietnamese,
        subtext: '',
        audio: w.clean_kana || w.kana || w.kanji,
        fullWord: w
      });
    });

    // Shuffle the 12 tiles together in the grid!
    setTiles(generatedTiles.sort(() => Math.random() - 0.5));
    setSelectedTile(null);
    setMatchedIds(new Set());
    setWrongTileIds([]);
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
      setMaxCombo(0);
      setPairsCleared(0);
      setRoundsCompleted(0);
      setMissedWords([]);
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

  // Tile click handler
  const handleTileClick = (tile) => {
    if (matchedIds.has(tile.uid) || wrongTileIds.includes(tile.uid)) return;

    // Pronounce if Japanese tile
    if (tile.type === 'jp') {
      speakJapanese(tile.audio);
    }

    sounds.playFlip();

    // If nothing selected yet, select this tile
    if (!selectedTile) {
      setSelectedTile(tile);
      return;
    }

    // If tapped the same tile, deselect
    if (selectedTile.uid === tile.uid) {
      setSelectedTile(null);
      return;
    }

    // If tapped same type (e.g. JP with JP or VI with VI), switch selection
    if (selectedTile.type === tile.type) {
      setSelectedTile(tile);
      return;
    }

    // Check Match (different types, same wordId)
    if (selectedTile.wordId === tile.wordId) {
      // MATCH!
      sounds.playCorrect();
      const newMatched = new Set([...matchedIds, selectedTile.uid, tile.uid]);
      setMatchedIds(newMatched);
      setSelectedTile(null);

      // Score & combo
      const newCombo = combo + 1;
      setCombo(newCombo);
      setMaxCombo((prev) => Math.max(prev, newCombo));
      setScore((prev) => prev + 10 + newCombo * 5);
      setPairsCleared((p) => p + 1);
      recordWordProgress(tile.wordId, 'mastered');

      // Check if all 12 tiles in this round are matched (6 pairs = 12 tiles)
      if (newMatched.size >= 12) {
        sounds.playLevelUp();
        setTimeLeft((prev) => prev + 6); // +6s bonus time!
        setRoundsCompleted((r) => r + 1);
        setTimeout(() => {
          loadRound(poolWords);
        }, 350);
      }
    } else {
      // WRONG MATCH
      sounds.playWrong();
      setWrongTileIds([selectedTile.uid, tile.uid]);
      setCombo(0);
      recordWordProgress(tile.wordId, 'needs_review');

      // Record missed word for end-game review
      setMissedWords((prev) => {
        const exists = prev.some((w) => w.id === tile.wordId);
        return exists ? prev : [...prev, tile.fullWord];
      });

      // Clear selection after shake
      setTimeout(() => {
        setWrongTileIds([]);
        setSelectedTile(null);
      }, 500);
    }
  };

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
            <span>PHẢN XẠ NHANH • GHÉP TỪ 60S</span>
          </div>

          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-snug mb-1.5">
            Đấu Trường Nối Từ Tiếng Nhật
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-2xl mb-0">
            Khám phá lưới ô chữ thông minh, ghép đúng từ tiếng Nhật và nghĩa tiếng Việt tương ứng để kích hoạt chuỗi Combo điểm số.
          </p>
        </div>
      </div>

      {/* ── 2. SETUP SCREEN ── */}
      {gameState === 'setup' && (
        <div className="p-8 sm:p-12 rounded-3xl bg-white border border-pink-100 shadow-lotus text-center space-y-6 max-w-xl mx-auto">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-tr from-pink-600 via-rose-500 to-pink-500 text-white flex items-center justify-center shadow-lotus">
            <Zap size={36} />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-black text-slate-900">Luật chơi Lưới Ô Chữ 60s</h2>
            <p className="text-xs text-slate-500 leading-relaxed max-w-md mx-auto">
              Chạm vào 1 ô tiếng Nhật và 1 ô nghĩa tiếng Việt khớp nhau. Mỗi chuỗi nối đúng liên tiếp sẽ tăng bội số Combo. Dọn sạch 6 cặp sẽ tự động nạp thêm màn chơi mới và thưởng <strong>+6 giây</strong>!
            </p>
          </div>

          <div className="max-w-xs mx-auto text-left">
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Phạm vi từ vựng ôn tập:
            </label>
            <select
              value={lessonFilter}
              onChange={(e) => setLessonFilter(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-pink-200 text-xs font-bold text-slate-800 bg-white cursor-pointer"
            >
              <option value="all">Tất cả bài học (1.512 từ)</option>
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
            <Play size={18} fill="white" />
            <span>Bắt đầu ván đấu ngay</span>
          </button>
        </div>
      )}

      {/* ── 3. PLAYING SCREEN (RESPONSIVE GRID CARDS) ── */}
      {gameState === 'playing' && (
        <div className="space-y-4">
          {/* Top HUD Status Bar */}
          <div className="p-4 rounded-2xl bg-white border border-pink-100 shadow-sm flex items-center justify-between">
            {/* Timer */}
            <div className={`flex items-center gap-2 font-black text-sm ${timeLeft <= 10 ? 'text-rose-600 animate-pulse' : 'text-slate-800'}`}>
              <Clock size={18} className={timeLeft <= 10 ? 'text-rose-600' : 'text-pink-600'} />
              <span>{timeLeft}s còn lại</span>
            </div>

            {/* Middle: Combo flame */}
            {combo >= 2 && (
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 font-black text-xs animate-bounce">
                <Flame size={15} fill="#f59e0b" />
                <span>COMBO x{combo} (+{combo * 5} điểm)</span>
              </div>
            )}

            {/* Right: Score */}
            <div className="text-slate-700 font-extrabold text-sm">
              Điểm số: <span className="text-pink-600 font-black text-base">{score}</span>
            </div>
          </div>

          {/* Interactive Memory Tile Grid (4x3 on Desktop, 3x4 on Tablet, 2x6 on Mobile) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {tiles.map((tile) => {
              const isMatched = matchedIds.has(tile.uid);
              const isSelected = selectedTile?.uid === tile.uid;
              const isWrong = wrongTileIds.includes(tile.uid);

              return (
                <button
                  key={tile.uid}
                  type="button"
                  disabled={isMatched}
                  onClick={() => handleTileClick(tile)}
                  className={`min-h-[90px] sm:min-h-[105px] p-3 rounded-2xl border flex flex-col items-center justify-center text-center transition-all cursor-pointer select-none relative ${
                    isMatched
                      ? 'opacity-20 scale-95 bg-emerald-50 border-emerald-300 text-emerald-800 pointer-events-none'
                      : isWrong
                      ? 'bg-rose-100 border-rose-500 text-rose-800 animate-shake ring-4 ring-rose-200'
                      : isSelected
                      ? 'bg-gradient-to-tr from-pink-600 to-rose-500 text-white border-pink-600 shadow-lotus scale-105 ring-4 ring-pink-200/80 z-10'
                      : tile.type === 'jp'
                      ? 'bg-white border-pink-100/90 hover:border-pink-300 hover:bg-pink-50/40 text-slate-900 shadow-sm'
                      : 'bg-white border-purple-100/90 hover:border-purple-300 hover:bg-purple-50/40 text-slate-800 shadow-sm'
                  }`}
                >
                  {/* Badge tag on top */}
                  <span className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded mb-1 uppercase ${
                    isSelected
                      ? 'bg-white/20 text-white'
                      : tile.type === 'jp'
                      ? 'bg-pink-50 text-pink-700'
                      : 'bg-purple-50 text-purple-700'
                  }`}>
                    {tile.type === 'jp' ? 'Tiếng Nhật' : 'Nghĩa Việt'}
                  </span>

                  <span className={`font-bold leading-snug line-clamp-2 ${
                    tile.type === 'jp' ? 'font-jp text-base sm:text-lg' : 'text-xs sm:text-sm'
                  }`}>
                    {tile.text}
                  </span>

                  {tile.subtext && (
                    <span className={`text-[10px] font-jp font-semibold mt-0.5 ${
                      isSelected ? 'text-pink-100' : 'text-slate-400'
                    }`}>
                      {tile.subtext}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <p className="text-center text-[11px] text-slate-400 font-medium pt-2">
            Đã nối thành công: <strong className="text-pink-600 font-bold">{pairsCleared} cặp từ</strong> • Vòng chơi thứ {roundsCompleted + 1}
          </p>
        </div>
      )}

      {/* ── 4. RESULT SCREEN ── */}
      {gameState === 'result' && (
        <div className="p-8 sm:p-12 rounded-3xl bg-white border border-pink-100 shadow-lotus text-center space-y-6 max-w-xl mx-auto animate-in zoom-in-95">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-amber-50 text-amber-500 border border-amber-200 flex items-center justify-center shadow-sm">
            <Trophy size={40} />
          </div>

          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">KẾT QUẢ VÁN ĐẤU</span>
            <h2 className="text-3xl font-black text-slate-900">
              Tổng Điểm: <span className="text-pink-600">{score} điểm</span>
            </h2>
            <p className="text-xs text-slate-500">
              Bạn đã ghép chuẩn xác <strong>{pairsCleared} cặp từ</strong> qua <strong>{roundsCompleted} vòng</strong> với chuỗi Combo tối đa <strong>x{maxCombo}</strong>!
            </p>
          </div>

          {/* Missed Words Section */}
          {missedWords.length > 0 && (
            <div className="p-4 rounded-2xl bg-pink-50/40 border border-pink-100 text-left space-y-2">
              <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <HelpCircle size={14} className="text-pink-600" />
                <span>CÁC TỪ CẦN ÔN LẠI TỪ VÁN CHƠI:</span>
              </h4>
              <div className="space-y-1.5">
                {missedWords.slice(0, 4).map((w) => (
                  <div key={w.id} className="p-2 bg-white rounded-xl flex items-center justify-between text-xs">
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
