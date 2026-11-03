import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { vocabService, lessonService, speakJapanese } from '../services/api';
import { sounds } from '../services/sounds';
import FuriganaWord from '../components/FuriganaWord';
import {
  Layers,
  Volume2,
  VolumeX,
  Shuffle,
  Sparkles,
  Check,
  X,
  Trophy,
  AlertCircle,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Filter,
  CheckCircle2,
  Trash2
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function FlashcardPage() {
  const {
    currentLevel,
    selectedLesson,
    setSelectedLesson,
    recordWordProgress,
    resetWordProgress,
    guestProgress,
    askAi
  } = useApp();

  const [allCards, setAllCards] = useState([]);
  const [sessionCards, setSessionCards] = useState([]);
  const [lessonsList, setLessonsList] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [direction, setDirection] = useState('jp_to_vi'); // 'jp_to_vi' | 'vi_to_jp'
  const [cardFilter, setCardFilter] = useState('all'); // 'all' | 'unmastered' | 'needs_review' | 'mastered'
  const [autoAudio, setAutoAudio] = useState(true);
  const [loading, setLoading] = useState(true);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const activeLevel = currentLevel || 'N5';

  // 1. Fetch lessons list for activeLevel
  useEffect(() => {
    let isMounted = true;
    const fetchLessons = async () => {
      try {
        const res = await lessonService.getLessons({ level: activeLevel });
        const list = Array.isArray(res.data) ? res.data : [];
        if (isMounted) {
          setLessonsList(list);
          if (list.length > 0 && !list.some((l) => l.lesson_number === selectedLesson)) {
            setSelectedLesson(list[0].lesson_number);
          }
        }
      } catch (err) {
        console.error('Flashcard fetch lessons error:', err);
      }
    };
    fetchLessons();
    return () => {
      isMounted = false;
    };
  }, [activeLevel]);

  // 2. Fetch vocabulary cards for activeLevel and selectedLesson
  useEffect(() => {
    let isMounted = true;
    const fetchCards = async () => {
      if (!selectedLesson) return;
      setLoading(true);
      try {
        const res = await vocabService.getVocabularies({
          lesson: selectedLesson,
          level: activeLevel
        });
        const list = Array.isArray(res.data?.data) ? res.data.data : [];
        if (isMounted) {
          setAllCards(list);
          setSessionCards(list);
          setCardFilter('all');
          setCurrentIndex(0);
          setIsFlipped(false);
          setIsCompleted(false);
          setShowResetConfirm(false);
        }
      } catch (err) {
        console.error('Flashcard fetch cards error:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchCards();
    return () => {
      isMounted = false;
    };
  }, [selectedLesson, activeLevel]);

  // 3. Real-time categorized word lists derived directly from guestProgress
  const { masteredWords, reviewWords, unstudiedWords, unmasteredWords } = useMemo(() => {
    const mastered = [];
    const review = [];
    const unstudied = [];
    const unmastered = [];

    allCards.forEach((card) => {
      const status = guestProgress?.[card.id]?.status;
      if (status === 'mastered') {
        mastered.push(card);
      } else if (status === 'needs_review') {
        review.push(card);
        unmastered.push(card);
      } else {
        unstudied.push(card);
        unmastered.push(card);
      }
    });

    return {
      masteredWords: mastered,
      reviewWords: review,
      unstudiedWords: unstudied,
      unmasteredWords: unmastered
    };
  }, [allCards, guestProgress]);

  // 4. Switch study filter mode in real-time without reloading
  const applyFilter = useCallback(
    (mode) => {
      sounds.playFlip();
      setCardFilter(mode);
      setIsFlipped(false);
      setIsCompleted(false);
      setCurrentIndex(0);

      let targetList = allCards;
      if (mode === 'unmastered') {
        targetList = unmasteredWords.length > 0 ? unmasteredWords : allCards;
      } else if (mode === 'needs_review') {
        targetList = reviewWords.length > 0 ? reviewWords : allCards;
      } else if (mode === 'mastered') {
        targetList = masteredWords.length > 0 ? masteredWords : allCards;
      }

      setSessionCards(targetList);
    },
    [allCards, unmasteredWords, reviewWords, masteredWords]
  );

  // 5. Restart from scratch: Reset view to first card
  const handleRestartSession = useCallback(() => {
    sounds.playFlip();
    setCurrentIndex(0);
    setIsFlipped(false);
    setIsCompleted(false);
  }, []);

  // 6. Reset all progress for this lesson's words
  const handleResetLessonProgress = useCallback(() => {
    sounds.playFlip();
    const wordIds = allCards.map((w) => w.id);
    if (resetWordProgress) {
      resetWordProgress(wordIds);
    }
    setCardFilter('all');
    setSessionCards(allCards);
    setCurrentIndex(0);
    setIsFlipped(false);
    setIsCompleted(false);
    setShowResetConfirm(false);
  }, [allCards, resetWordProgress]);

  // 7. Shuffle active cards
  const handleShuffle = useCallback(() => {
    sounds.playFlip();
    const shuffled = [...sessionCards].sort(() => Math.random() - 0.5);
    setSessionCards(shuffled);
    setCurrentIndex(0);
    setIsFlipped(false);
    setIsCompleted(false);
  }, [sessionCards]);

  const currentCard = sessionCards[currentIndex] || sessionCards[0] || null;
  const currentCardStatus = currentCard ? guestProgress?.[currentCard.id]?.status || 'unstudied' : 'unstudied';

  // 8. Flip card
  const handleFlip = useCallback(() => {
    sounds.playFlip();
    setIsFlipped((prev) => {
      const nextState = !prev;
      if (nextState && currentCard) {
        speakJapanese(currentCard.kanji, currentCard.clean_kana || currentCard.kana);
      }
      return nextState;
    });
  }, [currentCard]);

  // 9. Answer: Mark card as 'mastered' or 'needs_review' in real-time
  const handleAnswer = useCallback(
    (status) => {
      if (!currentCard) return;

      if (status === 'mastered') {
        sounds.playCorrect();
      } else {
        sounds.playWrong();
      }

      // Saves instantly to local state, localStorage and backend
      recordWordProgress(currentCard.id, status);

      if (currentIndex < sessionCards.length - 1) {
        setIsFlipped(false);
        setCurrentIndex((prev) => prev + 1);

        if (autoAudio && direction === 'jp_to_vi') {
          setTimeout(() => {
            const nextWord = sessionCards[currentIndex + 1];
            if (nextWord) {
              speakJapanese(nextWord.kanji, nextWord.clean_kana || nextWord.kana);
            }
          }, 300);
        }
      } else {
        setIsCompleted(true);
        sounds.playLevelUp();
        confetti({ particleCount: 100, spread: 80, origin: { y: 0.5 } });
      }
    },
    [currentCard, currentIndex, sessionCards, autoAudio, direction, recordWordProgress]
  );

  // 10. Previous card
  const handlePrevCard = useCallback(() => {
    if (currentIndex > 0) {
      sounds.playFlip();
      setCurrentIndex((prev) => prev - 1);
      setIsFlipped(false);
    }
  }, [currentIndex]);

  // 11. Next card
  const handleNextCard = useCallback(() => {
    if (currentIndex < sessionCards.length - 1) {
      sounds.playFlip();
      setCurrentIndex((prev) => prev + 1);
      setIsFlipped(false);
    } else {
      setIsCompleted(true);
      sounds.playLevelUp();
      confetti({ particleCount: 100, spread: 80, origin: { y: 0.5 } });
    }
  }, [currentIndex, sessionCards.length]);

  // 12. Keyboard Navigation: Space (Flip), 1 (Needs review), 2 (Mastered), ArrowLeft/Right (Navigate)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      if (e.code === 'Space' || e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        e.preventDefault();
        handleFlip();
      } else if (e.key === '1') {
        e.preventDefault();
        handleAnswer('needs_review');
      } else if (e.key === '2') {
        e.preventDefault();
        handleAnswer('mastered');
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrevCard();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNextCard();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleFlip, handleAnswer, handlePrevCard, handleNextCard]);

  const fallbackLessons =
    activeLevel === 'N4'
      ? Array.from({ length: 25 }, (_, i) => i + 26)
      : Array.from({ length: 25 }, (_, i) => i + 1);

  const completionPercentage =
    allCards.length > 0 ? Math.round((masteredWords.length / allCards.length) * 100) : 0;

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16 animate-in fade-in duration-300">
      {/* ── 1. HEADER & CONTROLS ── */}
      <div className="p-5 sm:p-7 rounded-3xl bg-white border border-pink-100 shadow-sm relative overflow-hidden">
        <div className="absolute right-4 top-2 text-pink-100/40 font-jp font-black text-8xl pointer-events-none select-none">
          学
        </div>

        <div className="relative z-10 space-y-4">
          {/* Top Level and Lesson Title */}
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-50 text-pink-700 font-extrabold text-[11px] uppercase tracking-wider mb-2 border border-pink-100">
              <Layers size={13} className="text-pink-600" />
              <span>
                {activeLevel === 'N4'
                  ? 'MINNA NO NIHONGO II'
                  : activeLevel === 'N3'
                  ? 'SOUMATOME & SHINKANZEN N3'
                  : activeLevel === 'N2'
                  ? 'SOUMATOME & SHINKANZEN N2'
                  : activeLevel === 'N1'
                  ? 'THƯỢNG CẤP BÁC HỌC N1'
                  : 'MINNA NO NIHONGO I'}{' '}
                — BÀI {selectedLesson < 10 ? `0${selectedLesson}` : selectedLesson}
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-snug">
              Thẻ Nhớ Flashcard 3D ({activeLevel})
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Lật thẻ phản xạ hai chiều Nhật – Việt, lưu tiến độ tức thì theo thời gian thực.
            </p>
          </div>

          {/* Real-time Lesson Progress Stats Bar */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-pink-50/60 via-rose-50/40 to-slate-50/60 border border-pink-100/80 space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-bold">
              <div className="flex items-center gap-2">
                <span className="text-slate-700">Tiến độ bài học:</span>
                <span className="text-pink-600 font-extrabold">
                  {masteredWords.length} / {allCards.length} từ đã thuộc
                </span>
                <span className="text-slate-400 font-semibold">({completionPercentage}%)</span>
              </div>

              {/* Status Badges in Real-Time */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100/80 text-emerald-800 text-[11px] font-bold">
                  <Check size={11} className="stroke-[3]" />
                  <span>{masteredWords.length} Đã thuộc</span>
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-100/80 text-rose-800 text-[11px] font-bold">
                  <RotateCcw size={11} className="stroke-[2.5]" />
                  <span>{reviewWords.length} Cần ôn</span>
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[11px] font-bold">
                  <span>{unstudiedWords.length} Chưa học</span>
                </span>
              </div>
            </div>

            {/* Split Progress Track */}
            <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden flex">
              <div
                className="h-full bg-emerald-500 transition-all duration-300"
                style={{
                  width: `${(masteredWords.length / (allCards.length || 1)) * 100}%`
                }}
                title={`Đã thuộc: ${masteredWords.length}`}
              />
              <div
                className="h-full bg-rose-400 transition-all duration-300"
                style={{
                  width: `${(reviewWords.length / (allCards.length || 1)) * 100}%`
                }}
                title={`Cần ôn: ${reviewWords.length}`}
              />
            </div>
          </div>

          {/* Quick Action Buttons & Filters Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            {/* Filter Tabs: Real-time Selection */}
            <div className="flex items-center p-1 bg-slate-100/80 rounded-xl border border-slate-200/80 flex-wrap gap-1">
              <button
                type="button"
                onClick={() => applyFilter('all')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  cardFilter === 'all'
                    ? 'bg-white text-pink-700 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Tất cả ({allCards.length})
              </button>

              <button
                type="button"
                onClick={() => applyFilter('unmastered')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
                  cardFilter === 'unmastered'
                    ? 'bg-white text-rose-700 shadow-sm'
                    : 'text-slate-600 hover:text-rose-700'
                }`}
                title="Lọc các từ cần ôn hoặc chưa đánh giá"
              >
                <span>Chưa thuộc ({unmasteredWords.length})</span>
              </button>

              <button
                type="button"
                onClick={() => applyFilter('needs_review')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  cardFilter === 'needs_review'
                    ? 'bg-white text-rose-600 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Cần ôn ({reviewWords.length})
              </button>

              <button
                type="button"
                onClick={() => applyFilter('mastered')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  cardFilter === 'mastered'
                    ? 'bg-white text-emerald-700 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Đã thuộc ({masteredWords.length})
              </button>
            </div>

            {/* Quick Restart & Reset Buttons */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* Button: Làm lại từ đầu */}
              <button
                type="button"
                onClick={handleRestartSession}
                className="px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-pink-50 hover:border-pink-200 text-xs font-bold text-slate-700 hover:text-pink-700 flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm active:scale-95"
                title="Quay lại thẻ đầu tiên"
              >
                <RotateCcw size={13} className="text-pink-600" />
                <span>Làm lại từ đầu</span>
              </button>

              {/* Button: Làm từ chưa thuộc */}
              {unmasteredWords.length > 0 && cardFilter !== 'unmastered' && (
                <button
                  type="button"
                  onClick={() => applyFilter('unmastered')}
                  className="px-3.5 py-1.5 rounded-xl bg-rose-50 border border-rose-200 hover:bg-rose-100 text-xs font-extrabold text-rose-700 flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm active:scale-95"
                  title="Chỉ học các từ chưa thuộc hoặc cần ôn lại"
                >
                  <Filter size={13} className="text-rose-600" />
                  <span>Làm từ chưa thuộc ({unmasteredWords.length})</span>
                </button>
              )}

              {/* Reset Lesson Progress Trigger */}
              <button
                type="button"
                onClick={() => setShowResetConfirm(!showResetConfirm)}
                className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-rose-50 hover:border-rose-200 text-slate-500 hover:text-rose-600 transition-colors cursor-pointer"
                title="Xóa trạng thái bài này để học mới"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>

          {/* Reset Confirmation Tooltip/Panel */}
          {showResetConfirm && (
            <div className="p-3.5 rounded-2xl bg-rose-50/90 border border-rose-200 text-xs font-medium text-rose-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in">
              <div className="space-y-0.5">
                <span className="font-bold block">Bạn muốn đặt lại tiến độ Bài {selectedLesson}?</span>
                <span className="text-[11px] text-rose-700">
                  Thao tác này sẽ chuyển toàn bộ {allCards.length} từ về trạng thái Chưa học để bạn bắt đầu lại từ đầu.
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handleResetLessonProgress}
                  className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-sm transition-colors cursor-pointer"
                >
                  Xác nhận đặt lại
                </button>
                <button
                  type="button"
                  onClick={() => setShowResetConfirm(false)}
                  className="px-3 py-1.5 rounded-xl bg-white border border-rose-200 text-rose-800 font-bold text-xs hover:bg-rose-50 transition-colors cursor-pointer"
                >
                  Hủy
                </button>
              </div>
            </div>
          )}

          {/* Tool Settings Row: Direction, Lesson Picker, Audio, Shuffle */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-pink-50">
            {/* Direction Switch */}
            <div className="flex items-center p-1 bg-pink-50/70 rounded-xl border border-pink-100">
              <button
                type="button"
                onClick={() => {
                  sounds.playFlip();
                  setDirection('jp_to_vi');
                }}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  direction === 'jp_to_vi'
                    ? 'bg-white text-pink-600 shadow-sm'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Nhật sang Việt
              </button>
              <button
                type="button"
                onClick={() => {
                  sounds.playFlip();
                  setDirection('vi_to_jp');
                }}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  direction === 'vi_to_jp'
                    ? 'bg-white text-pink-600 shadow-sm'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Việt sang Nhật
              </button>
            </div>

            {/* Select Lesson & Audio/Shuffle Tools */}
            <div className="flex items-center gap-2">
              <select
                value={selectedLesson}
                onChange={(e) => setSelectedLesson(parseInt(e.target.value, 10))}
                className="px-3 py-1.5 rounded-xl border border-pink-200 bg-pink-50/50 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-pink-500 max-w-[200px] truncate cursor-pointer"
              >
                {lessonsList.length > 0
                  ? lessonsList.map((l) => (
                      <option key={l.lesson_number} value={l.lesson_number}>
                        Bài {l.lesson_number < 10 ? `0${l.lesson_number}` : l.lesson_number}: {l.title}
                      </option>
                    ))
                  : fallbackLessons.map((n) => (
                      <option key={n} value={n}>
                        Bài {n < 10 ? `0${n}` : n}
                      </option>
                    ))}
              </select>

              <button
                type="button"
                onClick={() => setAutoAudio(!autoAudio)}
                className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                  autoAudio
                    ? 'bg-pink-100 text-pink-600 border-pink-200'
                    : 'bg-white text-slate-400 border-slate-200'
                }`}
                title={autoAudio ? 'Tự động phát âm' : 'Tắt phát âm'}
              >
                {autoAudio ? <Volume2 size={16} /> : <VolumeX size={16} />}
              </button>

              <button
                type="button"
                onClick={handleShuffle}
                className="p-2 rounded-xl border border-slate-200 bg-white text-slate-500 hover:text-pink-600 hover:bg-pink-50 transition-colors cursor-pointer"
                title="Xáo trộn thứ tự thẻ"
              >
                <Shuffle size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── 2. FLASHCARD ARENA ── */}
      {loading ? (
        <div className="py-20 text-center bg-white rounded-3xl border border-pink-100 shadow-sm space-y-3">
          <div className="w-10 h-10 border-4 border-pink-200 border-t-pink-600 rounded-full animate-spin mx-auto" />
          <p className="text-xs font-bold text-slate-400">Đang chuẩn bị bộ thẻ Flashcard 3D...</p>
        </div>
      ) : isCompleted ? (
        /* ── COMPLETION SCREEN ── */
        <div className="p-8 sm:p-12 rounded-3xl bg-white border border-pink-100 shadow-lotus text-center space-y-5 max-w-lg mx-auto animate-in fade-in">
          <div className="w-20 h-20 rounded-3xl bg-pink-50 text-pink-600 flex items-center justify-center mx-auto shadow-inner border border-pink-100">
            <Trophy size={40} className="text-pink-600" />
          </div>

          <div className="space-y-1">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
              {completionPercentage === 100
                ? 'Xuất Sắc! Thuộc 100% Từ Vựng'
                : 'Hoàn Thành Lượt Học Thẻ!'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 max-w-xs mx-auto">
              Bạn vừa hoàn thành ôn tập bộ thẻ Bài {selectedLesson}.
            </p>
          </div>

          {/* Stats Breakdown */}
          <div className="grid grid-cols-3 gap-2 py-3 px-4 rounded-2xl bg-slate-50 border border-slate-100">
            <div>
              <span className="text-2xl font-black text-emerald-600 block">{masteredWords.length}</span>
              <span className="text-[11px] text-slate-400 block font-bold">Đã thuộc</span>
            </div>
            <div>
              <span className="text-2xl font-black text-rose-600 block">{reviewWords.length}</span>
              <span className="text-[11px] text-slate-400 block font-bold">Cần ôn</span>
            </div>
            <div>
              <span className="text-2xl font-black text-slate-600 block">{unstudiedWords.length}</span>
              <span className="text-[11px] text-slate-400 block font-bold">Chưa học</span>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="space-y-2.5 pt-2">
            {unmasteredWords.length > 0 && (
              <button
                type="button"
                onClick={() => applyFilter('unmastered')}
                className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-rose-600 to-pink-600 text-white font-extrabold text-sm shadow-lotus hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Filter size={16} />
                <span>Luyện tiếp từ chưa thuộc ({unmasteredWords.length} từ)</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => applyFilter('all')}
              className="w-full py-3 px-6 rounded-2xl bg-white border border-pink-200 hover:bg-pink-50 text-pink-700 font-extrabold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <RotateCcw size={14} />
              <span>Làm lại từ đầu (Toàn bộ {allCards.length} từ)</span>
            </button>
          </div>
        </div>
      ) : sessionCards.length === 0 ? (
        /* ── EMPTY STATE FOR CHOSEN FILTER ── */
        <div className="p-10 text-center bg-white rounded-3xl border border-pink-100 shadow-sm space-y-4 max-w-lg mx-auto">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-100">
            <CheckCircle2 size={32} />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-800">
              {cardFilter === 'unmastered' || cardFilter === 'needs_review'
                ? 'Không có từ nào trong danh sách cần ôn'
                : 'Chưa có từ vựng cho bộ lọc này'}
            </h3>
            <p className="text-xs text-slate-500">
              {cardFilter === 'unmastered' || cardFilter === 'needs_review'
                ? 'Bạn đã ghi nhớ xuất sắc các từ trong bài học này! Hãy bấm xem tất cả để củng cố lại.'
                : 'Hãy chuyển bộ lọc sang Tất cả từ để bắt đầu luyện thẻ flashcard.'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => applyFilter('all')}
            className="px-5 py-2.5 rounded-2xl bg-pink-600 text-white font-bold text-xs shadow-lotus hover:bg-pink-700 transition-colors cursor-pointer"
          >
            Học tất cả {allCards.length} từ của Bài {selectedLesson}
          </button>
        </div>
      ) : currentCard ? (
        /* ── ACTIVE CARD VIEW ── */
        <div className="space-y-4 max-w-2xl mx-auto">
          {/* Top Status & Real-time Indicator Bar */}
          <div className="flex justify-between items-center text-xs font-bold px-1 text-slate-500">
            <div className="flex items-center gap-2">
              <span>
                Thẻ <strong className="text-slate-900">{currentIndex + 1}</strong> / {sessionCards.length}
              </span>
              {cardFilter === 'unmastered' && (
                <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 text-[10px] font-bold border border-rose-100">
                  Chế độ: Từ chưa thuộc
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-emerald-600">{masteredWords.length} đã thuộc</span>
              <span className="text-slate-300">•</span>
              <span className="text-rose-600">{reviewWords.length} cần ôn</span>
            </div>
          </div>

          {/* Session Progress Bar */}
          <div className="w-full h-1.5 rounded-full bg-pink-100 overflow-hidden">
            <div
              className="h-full bg-pink-600 rounded-full transition-all duration-300"
              style={{ width: `${((currentIndex + 1) / sessionCards.length) * 100}%` }}
            />
          </div>

          {/* 3D Flipping Card Container */}
          <div
            onClick={handleFlip}
            className="perspective-1000 min-h-[340px] cursor-pointer select-none group"
          >
            <div
              className={`w-full min-h-[340px] rounded-3xl p-6 sm:p-8 bg-white border border-pink-100 shadow-lotus hover:shadow-lotus-lg transition-all duration-500 transform-style-preserve-3d flex flex-col justify-between text-center relative ${
                isFlipped ? 'rotate-y-180 bg-gradient-to-b from-white to-pink-50/40' : ''
              }`}
            >
              {/* ── FRONT OF CARD ── */}
              <div
                className={`backface-hidden flex flex-col justify-between h-full space-y-6 ${
                  isFlipped ? 'hidden' : 'flex'
                }`}
              >
                {/* Top Card HUD: Index & Real-time Status Badge */}
                <div className="flex justify-between items-center gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2.5 py-1 rounded-xl bg-pink-50 text-pink-700 font-extrabold text-[11px] border border-pink-100">
                      Bài {selectedLesson} - #{currentIndex + 1}
                    </span>

                    {/* Instant Real-Time Status Badge */}
                    {currentCardStatus === 'mastered' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-700 font-bold text-[11px] border border-emerald-200">
                        <Check size={12} className="stroke-[3]" />
                        <span>Đã thuộc</span>
                      </span>
                    ) : currentCardStatus === 'needs_review' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-rose-50 text-rose-700 font-bold text-[11px] border border-rose-200">
                        <RotateCcw size={12} className="stroke-[2.5]" />
                        <span>Cần ôn</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-50 text-slate-500 font-bold text-[11px] border border-slate-200">
                        <span>Chưa học</span>
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      askAi('explain_vocab', currentCard, `AI: ${currentCard.kanji || currentCard.kana}`);
                    }}
                    className="p-1.5 rounded-lg text-pink-600 bg-pink-50 hover:bg-pink-100 transition-colors cursor-pointer"
                    title="Hỏi AI Sensei"
                  >
                    <Sparkles size={16} />
                  </button>
                </div>

                {/* Center Word with Furigana & Romaji */}
                <div className="py-6 space-y-3">
                  {direction === 'jp_to_vi' ? (
                    <div className="flex flex-col items-center justify-center gap-2">
                      <FuriganaWord
                        kanji={currentCard.kanji}
                        kana={currentCard.clean_kana || currentCard.kana}
                        romaji={currentCard.romaji}
                        level={currentLevel}
                        size="5xl"
                      />
                      {currentCard.romaji && (
                        <span className="text-xs font-semibold text-slate-400 font-mono tracking-wider">
                          {currentCard.romaji}
                        </span>
                      )}
                    </div>
                  ) : (
                    <div className="text-3xl sm:text-4xl font-black text-slate-900">
                      {currentCard.clean_vietnamese || currentCard.vietnamese}
                    </div>
                  )}
                </div>

                {/* Footer Hint */}
                <div className="text-[10px] text-slate-400 font-medium">
                  Chạm thẻ hoặc nhấn <span className="font-bold text-pink-600">Space</span> để lật xem đáp án
                </div>
              </div>

              {/* ── BACK OF CARD ── */}
              <div
                className={`backface-hidden rotate-y-180 flex flex-col justify-between h-full space-y-6 ${
                  !isFlipped ? 'hidden' : 'flex'
                }`}
              >
                {/* Top Card HUD */}
                <div className="flex justify-between items-center gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-700 font-extrabold text-[11px] border border-emerald-100">
                      Đáp Án Chi Tiết
                    </span>

                    {/* Instant Status on Back */}
                    {currentCardStatus === 'mastered' ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                        <Check size={11} className="stroke-[3]" />
                        <span>Đã lưu: Thuộc</span>
                      </span>
                    ) : currentCardStatus === 'needs_review' ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-rose-100 text-rose-800 font-bold text-[10px]">
                        <RotateCcw size={11} className="stroke-[2.5]" />
                        <span>Đã lưu: Cần ôn</span>
                      </span>
                    ) : null}
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      speakJapanese(currentCard.kanji, currentCard.clean_kana || currentCard.kana);
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
                    {direction === 'jp_to_vi' ? (
                      currentCard.clean_vietnamese || currentCard.vietnamese
                    ) : (
                      <div className="flex flex-col items-center justify-center gap-1">
                        <FuriganaWord
                          kanji={currentCard.kanji}
                          kana={currentCard.clean_kana || currentCard.kana}
                          romaji={currentCard.romaji}
                          level={currentLevel}
                          size="4xl"
                        />
                        {currentCard.romaji && (
                          <span className="text-xs font-semibold text-slate-400 font-mono tracking-wider">
                            {currentCard.romaji}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {direction === 'jp_to_vi' && currentCard.kanji && currentCard.kanji !== '-' && currentCard.kanji !== '–' && (
                    <div className="flex flex-col items-center justify-center gap-1">
                      <FuriganaWord
                        kanji={currentCard.kanji}
                        kana={currentCard.clean_kana || currentCard.kana}
                        romaji={currentCard.romaji}
                        level={currentLevel}
                        size="xl"
                      />
                      {currentCard.romaji && (
                        <span className="text-xs font-semibold text-pink-500 font-mono tracking-wider">
                          {currentCard.romaji}
                        </span>
                      )}
                    </div>
                  )}

                  {currentCard.usage_note && (
                    <p className="text-xs text-slate-500 bg-white/80 p-2.5 rounded-xl border border-pink-100 max-w-sm mx-auto flex items-center justify-center gap-1.5">
                      <Sparkles size={13} className="text-pink-600 shrink-0" />
                      <span>{currentCard.usage_note}</span>
                    </p>
                  )}
                </div>

                {/* Footer Hint */}
                <div className="text-[10px] text-slate-400 font-medium">
                  Đánh giá ghi nhớ bằng 2 nút bên dưới hoặc phím 1 và 2
                </div>
              </div>
            </div>
          </div>

          {/* ── 3. BOTTOM EVALUATION & NAVIGATION CONTROLS ── */}
          <div className="space-y-3 pt-2">
            {/* Primary Action Buttons: Cần ôn lại vs Đã thành thạo */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleAnswer('needs_review')}
                className={`py-3.5 px-4 sm:px-6 rounded-2xl font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition-all hover:scale-[1.02] active:scale-95 cursor-pointer ${
                  currentCardStatus === 'needs_review'
                    ? 'bg-rose-700 text-white ring-4 ring-rose-200'
                    : 'bg-rose-600 hover:bg-rose-700 text-white'
                }`}
              >
                <X size={18} />
                <span>Cần ôn lại</span>
                <span className="opacity-80 text-xs hidden sm:inline">[Phím 1]</span>
              </button>

              <button
                type="button"
                onClick={() => handleAnswer('mastered')}
                className={`py-3.5 px-4 sm:px-6 rounded-2xl font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition-all hover:scale-[1.02] active:scale-95 cursor-pointer ${
                  currentCardStatus === 'mastered'
                    ? 'bg-emerald-700 text-white ring-4 ring-emerald-200'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                }`}
              >
                <Check size={18} />
                <span>Đã thành thạo</span>
                <span className="opacity-80 text-xs hidden sm:inline">[Phím 2]</span>
              </button>
            </div>

            {/* Secondary Navigation Row: Thẻ trước / Thẻ sau / Làm lại */}
            <div className="flex items-center justify-between text-xs font-bold text-slate-500 pt-1">
              <button
                type="button"
                onClick={handlePrevCard}
                disabled={currentIndex === 0}
                className={`px-3 py-1.5 rounded-xl border flex items-center gap-1 transition-colors ${
                  currentIndex === 0
                    ? 'opacity-40 cursor-not-allowed border-slate-200 bg-slate-50 text-slate-400'
                    : 'cursor-pointer border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                }`}
              >
                <ChevronLeft size={14} />
                <span>Thẻ trước</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleRestartSession}
                  className="px-2.5 py-1 rounded-lg text-slate-400 hover:text-pink-600 transition-colors cursor-pointer flex items-center gap-1"
                  title="Bắt đầu lại từ thẻ đầu tiên"
                >
                  <RotateCcw size={12} />
                  <span>Về đầu</span>
                </button>
              </div>

              <button
                type="button"
                onClick={handleNextCard}
                className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 flex items-center gap-1 cursor-pointer transition-colors"
              >
                <span>Thẻ tiếp</span>
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
