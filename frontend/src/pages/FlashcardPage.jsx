import React, { useState, useEffect, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { vocabService, speakJapanese } from '../services/api';
import { sounds } from '../services/sounds';
import FuriganaWord from '../components/FuriganaWord';
import {
  Layers,
  Volume2,
  VolumeX,
  Shuffle,
  RotateCw,
  Sparkles,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
  Trophy
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function FlashcardPage() {
  const { selectedLesson, setSelectedLesson, recordWordProgress, askAi } = useApp();

  const [cards, setCards] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [direction, setDirection] = useState('jp_to_vi'); // 'jp_to_vi' | 'vi_to_jp'
  const [autoAudio, setAutoAudio] = useState(true);
  const [loading, setLoading] = useState(true);
  const [masteredCount, setMasteredCount] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    const fetchCards = async () => {
      setLoading(true);
      try {
        const res = await vocabService.getVocabularies({ lesson: selectedLesson });
        const list = res.data?.data || [];
        setCards(list);
        setCurrentIndex(0);
        setIsFlipped(false);
        setMasteredCount(0);
        setReviewCount(0);
        setIsCompleted(false);
      } catch (err) {
        console.error('Flashcard fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCards();
  }, [selectedLesson]);

  const currentCard = cards[currentIndex];

  const handleFlip = useCallback(() => {
    sounds.playFlip();
    setIsFlipped((prev) => !prev);
  }, []);

  const handleAnswer = useCallback((status) => {
    if (!currentCard) return;

    if (status === 'mastered') {
      sounds.playCorrect();
      setMasteredCount((prev) => prev + 1);
    } else {
      sounds.playWrong();
      setReviewCount((prev) => prev + 1);
    }

    recordWordProgress(currentCard.id, status);

    if (currentIndex < cards.length - 1) {
      setIsFlipped(false);
      setCurrentIndex((prev) => prev + 1);

      if (autoAudio && direction === 'jp_to_vi') {
        setTimeout(() => {
          const nextWord = cards[currentIndex + 1];
          if (nextWord) speakJapanese(nextWord.kanji || nextWord.kana);
        }, 300);
      }
    } else {
      setIsCompleted(true);
      sounds.playLevelUp();
      confetti({ particleCount: 100, spread: 80, origin: { y: 0.5 } });
    }
  }, [currentCard, currentIndex, cards, autoAudio, direction, recordWordProgress]);

  // Keyboard Navigation: Space / 1 / 2
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      if (e.code === 'Space' || e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        e.preventDefault();
        handleFlip();
      } else if (e.key === '1' || e.key === 'ArrowLeft') {
        e.preventDefault();
        handleAnswer('needs_review');
      } else if (e.key === '2' || e.key === 'ArrowRight') {
        e.preventDefault();
        handleAnswer('mastered');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleFlip, handleAnswer]);

  const handleShuffle = () => {
    sounds.playFlip();
    const shuffled = [...cards].sort(() => Math.random() - 0.5);
    setCards(shuffled);
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16 animate-in fade-in duration-300">
      {/* ── 1. HEADER (MATCHES IMAGE 4) ── */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-pink-100 shadow-sm relative overflow-hidden">
        <div className="absolute right-4 top-2 text-pink-100/50 font-jp font-black text-8xl pointer-events-none select-none">
          学
        </div>

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-50 text-pink-700 font-extrabold text-[11px] uppercase tracking-wider mb-2.5">
            <Layers size={13} className="text-pink-600" />
            <span>THẺ NHỚ 3D • MINNA NO NIHONGO</span>
          </div>

          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-snug mb-1.5">
            Thẻ Nhớ Flashcard 3D
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-2xl mb-6">
            Lật thẻ phản xạ hai chiều Nhật – Việt, tự động phát âm giọng Tokyo.
          </p>

          {/* Controls Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-pink-50">
            {/* Direction Switch */}
            <div className="flex items-center p-1 bg-pink-50/70 rounded-xl border border-pink-100">
              <button
                type="button"
                onClick={() => { sounds.playFlip(); setDirection('jp_to_vi'); }}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  direction === 'jp_to_vi'
                    ? 'bg-white text-pink-600 shadow-sm'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Nhật sang Việt
              </button>
              <button
                type="button"
                onClick={() => { sounds.playFlip(); setDirection('vi_to_jp'); }}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  direction === 'vi_to_jp'
                    ? 'bg-white text-pink-600 shadow-sm'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Việt sang Nhật
              </button>
            </div>

            {/* Right Tools */}
            <div className="flex items-center gap-2">
              <select
                value={selectedLesson}
                onChange={(e) => setSelectedLesson(parseInt(e.target.value))}
                className="px-3 py-1.5 rounded-xl border border-pink-200 bg-pink-50/50 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-pink-500"
              >
                {Array.from({ length: 25 }, (_, i) => i + 1).map((n) => (
                  <option key={n} value={n}>
                    Bài {n < 10 ? `0${n}` : n}
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={() => setAutoAudio(!autoAudio)}
                className={`p-2 rounded-xl border transition-colors ${
                  autoAudio ? 'bg-pink-100 text-pink-600 border-pink-200' : 'bg-white text-slate-400 border-slate-200'
                }`}
                title={autoAudio ? 'Tự động phát âm' : 'Tắt phát âm'}
              >
                {autoAudio ? <Volume2 size={16} /> : <VolumeX size={16} />}
              </button>

              <button
                type="button"
                onClick={handleShuffle}
                className="p-2 rounded-xl border border-slate-200 bg-white text-slate-500 hover:text-pink-600 hover:bg-pink-50 transition-colors"
                title="Xáo trộn thứ tự thẻ"
              >
                <Shuffle size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── 2. FLASHCARD VIEW ── */}
      {loading ? (
        <div className="py-20 text-center">
          <div className="w-10 h-10 border-4 border-pink-200 border-t-pink-600 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs font-bold text-slate-400">Đang chuẩn bị bộ thẻ Flashcard 3D...</p>
        </div>
      ) : isCompleted ? (
        <div className="p-8 sm:p-12 rounded-3xl bg-white border border-pink-100 shadow-lotus text-center space-y-4 max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-3xl bg-pink-50 text-pink-600 flex items-center justify-center mx-auto shadow-inner">
            <Trophy size={32} />
          </div>
          <h2 className="text-2xl font-black text-slate-900">Hoàn Thành Bài Học!</h2>
          <p className="text-xs text-slate-500 max-w-xs mx-auto">
            Bạn đã ôn tập xong {cards.length} thẻ từ vựng Bài {selectedLesson}.
          </p>
          <div className="flex justify-center gap-6 py-2">
            <div>
              <span className="text-2xl font-black text-emerald-600">{masteredCount}</span>
              <span className="text-xs text-slate-400 block font-semibold">Đã thành thạo</span>
            </div>
            <div>
              <span className="text-2xl font-black text-rose-600">{reviewCount}</span>
              <span className="text-xs text-slate-400 block font-semibold">Cần ôn lại</span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              setCurrentIndex(0);
              setIsFlipped(false);
              setMasteredCount(0);
              setReviewCount(0);
              setIsCompleted(false);
            }}
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-pink-600 to-rose-500 text-white font-bold text-sm shadow-lotus hover:scale-105 transition-transform"
          >
            Học lại bài này
          </button>
        </div>
      ) : currentCard ? (
        <div className="space-y-4 max-w-2xl mx-auto">
          {/* Card counter and stats */}
          <div className="flex justify-between items-center text-xs font-bold px-1">
            <span className="text-slate-500">
              Thẻ <strong className="text-slate-900">{currentIndex + 1}</strong> / {cards.length}
            </span>
            <div className="flex items-center gap-3">
              <span className="text-emerald-600">{masteredCount} thành thạo</span>
              <span className="text-rose-600">{reviewCount} cần ôn</span>
            </div>
          </div>

          <div className="w-full h-1.5 rounded-full bg-pink-100 overflow-hidden">
            <div
              className="h-full bg-pink-600 rounded-full transition-all duration-300"
              style={{ width: `${((currentIndex + 1) / cards.length) * 100}%` }}
            />
          </div>

          {/* 3D Flipping Card Container */}
          <div
            onClick={handleFlip}
            className="perspective-1000 min-h-[340px] cursor-pointer select-none group"
          >
            <div
              className={`w-full min-h-[340px] rounded-3xl p-8 bg-white border border-pink-100 shadow-lotus hover:shadow-lotus-lg transition-all duration-500 transform-style-preserve-3d flex flex-col justify-between text-center relative ${
                isFlipped ? 'rotate-y-180 bg-gradient-to-b from-white to-pink-50/40' : ''
              }`}
            >
              {/* FRONT OF THE CARD */}
              <div className={`backface-hidden flex flex-col justify-between h-full space-y-6 ${isFlipped ? 'hidden' : 'flex'}`}>
                {/* Top Badge */}
                <div className="flex justify-between items-center">
                  <span className="px-2.5 py-1 rounded-lg bg-pink-100 text-pink-700 font-extrabold text-[11px]">
                    Bài {selectedLesson} • #{currentIndex + 1}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      askAi('explain_vocab', currentCard, `AI: ${currentCard.kanji || currentCard.kana}`);
                    }}
                    className="p-1.5 rounded-lg text-pink-600 bg-pink-50 hover:bg-pink-100 transition-colors"
                    title="Hỏi AI"
                  >
                    <Sparkles size={16} />
                  </button>
                </div>

                {/* Center Word with Furigana */}
                <div className="py-6 space-y-3">
                  {direction === 'jp_to_vi' ? (
                    <div className="flex justify-center items-center">
                      <FuriganaWord
                        kanji={currentCard.kanji}
                        kana={currentCard.clean_kana || currentCard.kana}
                        size="5xl"
                      />
                    </div>
                  ) : (
                    <div className="text-3xl sm:text-4xl font-black text-slate-900">
                      {currentCard.clean_vietnamese || currentCard.vietnamese}
                    </div>
                  )}
                </div>

                {/* Hint Footer */}
                <div className="text-xs text-slate-400 font-semibold">
                  Chạm thẻ hoặc nhấn <span className="font-bold text-pink-600">Space</span> để lật xem nghĩa
                </div>
              </div>

              {/* BACK OF THE CARD */}
              <div className={`backface-hidden rotate-y-180 flex flex-col justify-between h-full space-y-6 ${!isFlipped ? 'hidden' : 'flex'}`}>
                {/* Top Badge */}
                <div className="flex justify-between items-center">
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-700 font-extrabold text-[11px]">
                    Đáp Án Chi Tiết
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      speakJapanese(currentCard.kanji || currentCard.kana);
                    }}
                    className="p-1.5 rounded-lg text-pink-600 bg-pink-50 hover:bg-pink-100 transition-colors cursor-pointer"
                    title="Nghe lại phát âm"
                  >
                    <Volume2 size={16} />
                  </button>
                </div>

                {/* Center Translation & Details */}
                <div className="py-4 space-y-3">
                  <div className="text-2xl sm:text-3xl font-extrabold text-pink-700">
                    {direction === 'jp_to_vi'
                      ? (currentCard.clean_vietnamese || currentCard.vietnamese)
                      : (
                        <div className="flex justify-center">
                          <FuriganaWord
                            kanji={currentCard.kanji}
                            kana={currentCard.clean_kana || currentCard.kana}
                            size="4xl"
                          />
                        </div>
                      )}
                  </div>

                  {direction === 'jp_to_vi' && currentCard.kanji && (
                    <div className="flex justify-center">
                      <FuriganaWord
                        kanji={currentCard.kanji}
                        kana={currentCard.clean_kana || currentCard.kana}
                        size="xl"
                      />
                    </div>
                  )}

                  {currentCard.usage_note && (
                    <p className="text-xs text-slate-500 bg-white/80 p-2.5 rounded-xl border border-pink-100 max-w-sm mx-auto">
                      💡 {currentCard.usage_note}
                    </p>
                  )}
                </div>

                {/* Hint Footer */}
                <div className="text-xs text-slate-400 font-semibold">
                  Đánh giá ghi nhớ bằng 2 nút bên dưới hoặc phím 1 và 2
                </div>
              </div>
            </div>
          </div>

          {/* ── 3. BOTTOM EVALUATION BUTTONS (MATCHES IMAGE 4) ── */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              type="button"
              onClick={() => handleAnswer('needs_review')}
              className="py-3.5 px-6 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-sm transition-all hover:scale-[1.02] active:scale-95"
            >
              <X size={18} />
              <span>Cần ôn lại</span>
              <span className="opacity-80 text-xs">[1]</span>
            </button>

            <button
              type="button"
              onClick={() => handleAnswer('mastered')}
              className="py-3.5 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-sm transition-all hover:scale-[1.02] active:scale-95"
            >
              <Check size={18} />
              <span>Đã thành thạo</span>
              <span className="opacity-80 text-xs">[2]</span>
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
