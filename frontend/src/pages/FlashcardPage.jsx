import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Container,
  Row,
  Col,
  Card,
  CardBody,
  Button,
  Badge,
  Input,
  Progress,
  Spinner,
  Modal,
  ModalBody
} from 'reactstrap';
import {
  Layers,
  RotateCw,
  Volume2,
  Star,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Shuffle,
  RefreshCw,
  Info,
  Zap,
  BookOpen,
  VolumeX,
  Sparkles,
  ArrowRightLeft,
  Trophy,
  RotateCcw
} from 'lucide-react';
import { vocabService, speakJapanese } from '../services/api';
import { hasRealKanji, getEffectiveKana, cleanKatakanaDisplay } from '../utils/katakanaNormalize';
import { sounds } from '../services/sounds';
import { useApp } from '../context/AppContext';
import confetti from 'canvas-confetti';

const FlashcardPage = ({ initialLesson = 1 }) => {
  const { toggleFavorite, isFavorite, updateProgress, awardGardenWater } = useApp();
  const [lessonNum, setLessonNum] = useState(initialLesson);
  const [allLessonCards, setAllLessonCards] = useState([]);
  const [cards, setCards] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [loading, setLoading] = useState(true);
  const [cardDirection, setCardDirection] = useState('jp_to_vi'); // 'jp_to_vi' | 'vi_to_jp'
  const [autoPlayAudio, setAutoPlayAudio] = useState(true);
  const [masteredIds, setMasteredIds] = useState(new Set());
  const [reviewIds, setReviewIds] = useState(new Set());
  const [sessionDone, setSessionDone] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionAnim, setTransitionAnim] = useState(''); // 'slide-mastered' | 'slide-review' | ''
  const [cardTilt, setCardTilt] = useState({ x: 0, y: 0 });
  const [floatingXp, setFloatingXp] = useState(false);
  const [deckMode, setDeckMode] = useState('all'); // 'all' | 'unlearned'
  const [savedProgressInfo, setSavedProgressInfo] = useState(null);
  const [lessonPickerOpen, setLessonPickerOpen] = useState(false);

  // Mobile Touch Swipe Handling
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const [touchDeltaX, setTouchDeltaX] = useState(0);
  const hasSwiped = useRef(false);

  const handleTouchStart = (e) => {
    if (e.touches && e.touches.length > 0) {
      touchStartX.current = e.touches[0].clientX;
      touchStartY.current = e.touches[0].clientY;
      hasSwiped.current = false;
    }
  };

  const handleTouchMove = (e) => {
    if (isTransitioning || sessionDone || !e.touches || e.touches.length === 0) return;
    const deltaX = e.touches[0].clientX - touchStartX.current;
    const deltaY = e.touches[0].clientY - touchStartY.current;
    if (Math.abs(deltaX) > 15 && Math.abs(deltaX) > Math.abs(deltaY)) {
      hasSwiped.current = true;
      setTouchDeltaX(Math.max(-90, Math.min(90, deltaX)));
    }
  };

  const handleMouseMove = (e) => {
    if (typeof window !== 'undefined' && window.innerWidth < 992) return;
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -6;
    const rotateY = ((x - centerX) / centerX) * 6;
    setCardTilt({ x: rotateX, y: rotateY });
  };

  const handleMouseLeave = () => {
    setCardTilt({ x: 0, y: 0 });
  };

  // Sync with initialLesson prop if changed externally
  useEffect(() => {
    if (initialLesson) {
      setLessonNum(initialLesson);
    }
  }, [initialLesson]);

  const fetchCards = useCallback(async (lesson, resumeMode = 'prompt') => {
    setLoading(true);
    setIsFlipped(false);
    setIsTransitioning(false);
    setTransitionAnim('');
    try {
      const params = lesson === 'all' ? {} : { lesson: parseInt(lesson) };
      const res = await vocabService.getVocabularies(params);
      const list = res.data || [];
      setAllLessonCards(list);
      setCards(list);
      setDeckMode('all');

      // Check saved progress in localStorage
      const storageKey = `hyper_fc_lesson_${lesson}`;
      const raw = localStorage.getItem(storageKey);
      let saved = null;
      if (raw) {
        try { saved = JSON.parse(raw); } catch {}
      }

      if (saved && (saved.currentIndex > 0 || (saved.reviewIds && saved.reviewIds.length > 0))) {
        setSavedProgressInfo(saved);
        if (resumeMode === 'resume') {
          setCurrentIndex(Math.min(saved.currentIndex || 0, Math.max(0, list.length - 1)));
          setMasteredIds(new Set(saved.masteredIds || []));
          setReviewIds(new Set(saved.reviewIds || []));
          setSessionDone(false);
        } else if (resumeMode === 'wrong_only' && saved.reviewIds && saved.reviewIds.length > 0) {
          const wrongSet = new Set(saved.reviewIds);
          const filtered = list.filter(c => wrongSet.has(c.id));
          if (filtered.length > 0) {
            setCards(filtered);
            setDeckMode('unlearned');
            setCurrentIndex(0);
            setMasteredIds(new Set());
            setReviewIds(new Set(saved.reviewIds));
            setSessionDone(false);
          }
        } else {
          // Auto resume if incomplete, else start from beginning
          if (saved.currentIndex < list.length) {
            setCurrentIndex(saved.currentIndex);
            setMasteredIds(new Set(saved.masteredIds || []));
            setReviewIds(new Set(saved.reviewIds || []));
            setSessionDone(false);
          } else {
            setCurrentIndex(0);
            setMasteredIds(new Set(saved.masteredIds || []));
            setReviewIds(new Set(saved.reviewIds || []));
            setSessionDone(true);
          }
        }
      } else {
        setSavedProgressInfo(null);
        setCurrentIndex(0);
        setMasteredIds(new Set());
        setReviewIds(new Set());
        setSessionDone(false);
      }
    } catch (err) {
      console.error('Error fetching flashcards:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCards(lessonNum);
  }, [lessonNum, fetchCards]);

  const currentCard = cards[currentIndex];
  const cleanVietnamese = currentCard ? (currentCard.clean_vietnamese || currentCard.vietnamese) : '';
  const cleanKana = currentCard ? getEffectiveKana(currentCard) : '';

  // Only play pronunciation when the card is flipped (khi lật thẻ mới nói)
  useEffect(() => {
    if (!currentCard || !autoPlayAudio || loading || sessionDone || isTransitioning) return;
    if (isFlipped) {
      speakJapanese(cleanKana);
    }
  }, [isFlipped, autoPlayAudio, currentCard, cleanKana, loading, sessionDone, isTransitioning]);

  // Flip the 3D card
  const handleFlip = useCallback(() => {
    if (isTransitioning || hasSwiped.current) return;
    sounds.playFlip();
    setIsFlipped((prev) => !prev);
  }, [isTransitioning]);

  // Answer card: Remembered vs Need Review (Locked against rapid multiple clicking)
  const handleAnswer = useCallback((remembered) => {
    if (isTransitioning || sessionDone || !currentCard) return;

    // 1. Immediately lock against any rapid clicks
    setIsTransitioning(true);
    setTransitionAnim(remembered ? 'slide-mastered' : 'slide-review');

    // 2. Play tactile sound and record state
    const nextMastered = remembered ? new Set(masteredIds).add(currentCard.id) : masteredIds;
    const nextReview = !remembered ? new Set(reviewIds).add(currentCard.id) : reviewIds;

    if (remembered) {
      sounds.playCorrect();
      setMasteredIds(nextMastered);
      setFloatingXp(true);
      setTimeout(() => setFloatingXp(false), 850);
      updateProgress(currentCard.id, 'mastered', true).catch(() => {});
    } else {
      sounds.playWrong();
      setReviewIds(nextReview);
      updateProgress(currentCard.id, 'needs_review', false).catch(() => {});
    }

    // Award garden water drops & record activity
    if (awardGardenWater) {
      awardGardenWater(2, 'Luyện Flashcard', [currentCard]);
    }

    // Persist progress to localStorage for resuming later
    const storageKey = `hyper_fc_lesson_${lessonNum}`;
    const nextIdx = currentIndex + 1;
    localStorage.setItem(storageKey, JSON.stringify({
      currentIndex: nextIdx,
      masteredIds: Array.from(nextMastered),
      reviewIds: Array.from(nextReview),
      total: cards.length,
      updatedAt: Date.now()
    }));

    // 3. Smooth automatic transition to the next card
    setTimeout(() => {
      if (currentIndex < cards.length - 1) {
        setIsFlipped(false);
        setCurrentIndex((prev) => prev + 1);
        setTransitionAnim('');
        setTimeout(() => {
          setIsTransitioning(false);
        }, 120);
      } else {
        sounds.playComplete();
        setSessionDone(true);
        setTransitionAnim('');
        setIsTransitioning(false);
        if (awardGardenWater) {
          awardGardenWater(20, `Hoàn thành Flashcard Bài ${lessonNum}`, cards);
        }
        try {
          const end = Date.now() + 1500;
          const colors = ['#2563eb', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'];
          (function frame() {
            confetti({ particleCount: 5, angle: 60, spread: 60, origin: { x: 0, y: 0.7 }, colors });
            confetti({ particleCount: 5, angle: 120, spread: 60, origin: { x: 1, y: 0.7 }, colors });
            if (Date.now() < end) requestAnimationFrame(frame);
          })();
        } catch {}
      }
    }, 280);
  }, [currentCard, currentIndex, cards, isTransitioning, sessionDone, updateProgress, awardGardenWater, masteredIds, reviewIds, lessonNum]);

  // Mobile Touch End (Swipe gesture trigger)
  const handleTouchEnd = () => {
    if (Math.abs(touchDeltaX) > 40) {
      if (touchDeltaX > 0) {
        handleAnswer(true);
      } else {
        handleAnswer(false);
      }
    }
    setTouchDeltaX(0);
    setTimeout(() => {
      hasSwiped.current = false;
    }, 120);
  };

  // Navigation: Next / Prev
  const handleNext = useCallback(() => {
    if (isTransitioning || currentIndex >= cards.length - 1) return;
    sounds.playFlip();
    setIsFlipped(false);
    setCurrentIndex((prev) => prev + 1);
  }, [currentIndex, cards.length, isTransitioning]);

  const handlePrev = useCallback(() => {
    if (isTransitioning || currentIndex <= 0) return;
    sounds.playFlip();
    setIsFlipped(false);
    setCurrentIndex((prev) => prev - 1);
  }, [currentIndex, isTransitioning]);

  // Replay Japanese speech
  const handleSpeak = useCallback((e) => {
    if (e) e.stopPropagation();
    if (cleanKana) {
      speakJapanese(cleanKana);
    }
  }, [cleanKana]);

  // Shuffle current cards
  const handleShuffle = () => {
    sounds.playFlip();
    const shuffled = [...cards].sort(() => Math.random() - 0.5);
    setCards(shuffled);
    setCurrentIndex(0);
    setIsFlipped(false);
    setSessionDone(false);
  };

  // Retry ONLY unlearned / wrong cards
  const handleRetryWrongOnly = () => {
    const wrongIds = reviewIds.size > 0 ? reviewIds : new Set(savedProgressInfo?.reviewIds || []);
    if (wrongIds.size === 0) return;
    sounds.playFlip();
    const sourceList = allLessonCards.length ? allLessonCards : cards;
    const wrongCards = sourceList.filter((c) => wrongIds.has(c.id));
    if (wrongCards.length > 0) {
      setCards(wrongCards);
      setDeckMode('unlearned');
      setCurrentIndex(0);
      setIsFlipped(false);
      setMasteredIds(new Set());
      setReviewIds(new Set(wrongIds));
      setSessionDone(false);
    }
  };

  // Resume saved progress
  const handleResumeSavedProgress = () => {
    if (!savedProgressInfo) return;
    sounds.playFlip();
    const targetIdx = Math.min(savedProgressInfo.currentIndex || 0, Math.max(0, cards.length - 1));
    setCurrentIndex(targetIdx);
    setMasteredIds(new Set(savedProgressInfo.masteredIds || []));
    setReviewIds(new Set(savedProgressInfo.reviewIds || []));
    setSessionDone(false);
    setSavedProgressInfo(null);
  };

  // Restart full lesson from Card 1
  const handleRestart = () => {
    sounds.playFlip();
    localStorage.removeItem(`hyper_fc_lesson_${lessonNum}`);
    setSavedProgressInfo(null);
    setCards(allLessonCards.length ? allLessonCards : cards);
    setDeckMode('all');
    setCurrentIndex(0);
    setMasteredIds(new Set());
    setReviewIds(new Set());
    setIsFlipped(false);
    setSessionDone(false);
  };

  // Keyboard navigation: Space (Flip), 1/ArrowLeft (Wrong), 2/ArrowRight (Correct), S/R (Sound)
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't intercept if an input is focused
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return;
      if (sessionDone || !currentCard || isTransitioning) return;

      if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault();
        handleFlip();
      } else if (e.key === '1' || e.key === 'ArrowLeft') {
        e.preventDefault();
        handleAnswer(false);
      } else if (e.key === '2' || e.key === 'ArrowRight') {
        e.preventDefault();
        handleAnswer(true);
      } else if (e.key === 's' || e.key === 'S' || e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        handleSpeak();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleFlip, handleAnswer, handleSpeak, sessionDone, currentCard]);

  if (loading) {
    return (
      <Container className="text-center py-5">
        <div
          style={{
            width: 54,
            height: 54,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 20px rgba(37,99,235,0.3)'
          }}
        >
          <Spinner color="light" size="sm" />
        </div>
        <h6 className="mt-3 fw-bold text-navy-dark">Đang chuẩn bị bộ thẻ Flashcard 3D...</h6>
        <p className="text-muted small">Nạp dữ liệu từ vựng & âm thanh Tokyo Pitch</p>
      </Container>
    );
  }

  if (!cards || cards.length === 0) {
    return (
      <Container className="py-3 py-md-4 text-center" style={{ maxWidth: '780px' }}>
        <div className="page-header-box text-center py-5">
          <Layers size={48} className="text-muted mb-3 opacity-50" />
          <h5 className="fw-bold text-navy-dark">Đang đồng bộ dữ liệu từ vựng...</h5>
          <p className="text-muted small mb-3">Hệ thống đang tải danh sách bài học hoặc bạn có thể thử lại.</p>
          <div className="d-flex justify-content-center gap-2">
            <Button color="primary" onClick={() => fetchCards(lessonNum)} className="rounded-pill px-4">
              <RefreshCw size={16} className="me-1" /> Tải lại dữ liệu
            </Button>
          </div>
        </div>
      </Container>
    );
  }

  const progressPercent = cards.length > 0
    ? Math.round(((currentIndex + (sessionDone ? 1 : 0)) / cards.length) * 100)
    : 0;

  return (
    <div className="app-shell" style={{ maxWidth: '820px' }}>
      {/* ── 1. UNIFIED SYSTEMIC PAGE HEADER ── */}
      <div className="app-page-header">
        <div className="d-flex justify-content-between align-items-start flex-wrap gap-3">
          <div>
            <div className="app-header-tag">
              <Layers size={13} />
              <span>THẺ NHỚ 3D • MINNA NO NIHONGO</span>
            </div>
            <h1 className="app-header-title">
              Thẻ Nhớ Flashcard 3D
            </h1>
            <p className="app-header-subtitle">
              Lật thẻ phản xạ 2 chiều Nhật – Việt, tự động phát âm giọng Tokyo và ghi nhớ từ vựng sâu sắc.
            </p>
          </div>

          {/* Unified Tool Controls */}
          <div className="d-flex align-items-center gap-2 flex-wrap ms-auto">
            {/* Lesson Picker Button */}
            <button
              type="button"
              onClick={() => setLessonPickerOpen(true)}
              className="app-btn-secondary"
              style={{ height: '38px', padding: '0 16px', fontSize: '13px' }}
              title="Chọn bài học Minna no Nihongo"
            >
              <BookOpen size={14} className="text-primary" />
              <span>{lessonNum === 'all' ? 'Toàn bộ 25 bài' : `Bài ${lessonNum < 10 ? `0${lessonNum}` : lessonNum}`}</span>
              <ChevronDown size={13} className="text-muted ms-1" />
            </button>

            {/* Audio Toggle */}
            <button
              type="button"
              onClick={() => {
                sounds.playFlip();
                setAutoPlayAudio(!autoPlayAudio);
              }}
              className={`app-icon-btn ${autoPlayAudio ? 'active' : ''}`}
              title={autoPlayAudio ? 'Tắt phát âm tự động' : 'Bật phát âm tự động'}
            >
              {autoPlayAudio ? <Volume2 size={16} /> : <VolumeX size={16} />}
            </button>

            {/* Shuffle Button */}
            <button
              type="button"
              onClick={handleShuffle}
              className="app-icon-btn"
              title="Trộn ngẫu nhiên thẻ"
            >
              <Shuffle size={16} />
            </button>
          </div>
        </div>

        {/* Direction Switcher Strip — 100% Unified, Zero Arrows */}
        <div className="d-flex justify-content-center mt-3 pt-3 border-top border-slate-100">
          <div className="app-direction-switcher">
            <button
              type="button"
              onClick={() => {
                if (cardDirection !== 'jp_to_vi') {
                  setCardDirection('jp_to_vi');
                  setIsFlipped(false);
                  sounds.playFlip();
                }
              }}
              className={`app-direction-btn ${cardDirection === 'jp_to_vi' ? 'is-active' : ''}`}
            >
              <span>Nhật sang Việt</span>
            </button>
            <button
              type="button"
              onClick={() => {
                if (cardDirection !== 'vi_to_jp') {
                  setCardDirection('vi_to_jp');
                  setIsFlipped(false);
                  sounds.playFlip();
                }
              }}
              className={`app-direction-btn ${cardDirection === 'vi_to_jp' ? 'is-active' : ''}`}
            >
              <span>Việt sang Nhật</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── 2. Empty State ── */}
      {cards.length === 0 ? (
        <div className="jlpt-card p-5 text-center bg-white rounded-4 border shadow-sm">
          <BookOpen size={48} className="text-muted mb-3 opacity-50" />
          <h5 className="fw-bold text-navy-dark">Không có thẻ nào trong bài học này</h5>
          <p className="text-muted small mb-3">Vui lòng chọn bài học khác hoặc chọn Toàn bộ 25 bài.</p>
          <Button color="primary" size="sm" className="rounded-pill px-4" onClick={() => setLessonNum('all')}>
            Xem tất cả từ vựng N5
          </Button>
        </div>
      ) : sessionDone ? (
        /* ── 3. Session Complete Celebration Card ── */
        <div className="jlpt-card p-4 p-md-5 text-center bg-white rounded-4 border shadow-sm animate-fade-up">
          <div className="d-flex justify-content-center mb-3">
            <div className="p-3 rounded-circle bg-warning bg-opacity-10 text-warning d-flex align-items-center justify-content-center shadow-xs" style={{ width: 68, height: 68 }}>
              <Trophy size={36} />
            </div>
          </div>
          <h3 className="fw-black text-navy-dark mb-1">Hoàn thành bộ thẻ Flashcard!</h3>
          <p className="text-muted small mb-4">
            Bạn đã ôn tập xong toàn bộ <strong>{cards.length}</strong> thẻ trong phiên học này.
          </p>

          <div className="row g-2 justify-content-center mb-4" style={{ maxWidth: '480px', margin: '0 auto' }}>
            <div className="col-4">
              <div className="p-3 rounded-3 bg-light border text-center h-100">
                <div className="fs-3 fw-black" style={{ color: '#10b981' }}>
                  {masteredIds.size}
                </div>
                <small className="text-muted fw-semibold d-flex align-items-center justify-content-center gap-1" style={{ fontSize: '11.5px' }}>
                  <Check size={13} className="text-success" /> Đã Thành Thạo
                </small>
              </div>
            </div>
            <div className="col-4">
              <div className="p-3 rounded-3 bg-light border text-center h-100">
                <div className="fs-3 fw-black" style={{ color: '#ef4444' }}>
                  {reviewIds.size}
                </div>
                <small className="text-muted fw-semibold d-flex align-items-center justify-content-center gap-1" style={{ fontSize: '11.5px' }}>
                  <RotateCcw size={13} className="text-danger" /> Cần ôn lại
                </small>
              </div>
            </div>
            <div className="col-4">
              <div className="p-3 rounded-3 bg-light border text-center h-100">
                <div className="fs-3 fw-black text-navy-dark">
                  {cards.length > 0 ? Math.round((masteredIds.size / cards.length) * 100) : 0}%
                </div>
                <small className="text-muted fw-semibold" style={{ fontSize: '11.5px' }}>
                  Tỷ lệ nhớ
                </small>
              </div>
            </div>
          </div>

          <div className="d-flex justify-content-center gap-2 flex-wrap">
            <Button
              color="primary"
              className="fw-bold rounded-pill px-4 py-2 shadow-sm d-flex align-items-center gap-2"
              onClick={handleRestart}
            >
              <RefreshCw size={16} />
              <span>Học lại bài này</span>
            </Button>

            {reviewIds.size > 0 && (
              <Button
                color="danger"
                outline
                className="fw-bold rounded-pill px-4 py-2 d-flex align-items-center gap-2"
                onClick={handleRetryWrongOnly}
              >
                <Zap size={16} />
                <span>Chỉ ôn {reviewIds.size} từ cần ôn lại</span>
              </Button>
            )}
          </div>
        </div>
      ) : (
        /* ── 4. Active Card Study Screen ── */
        <>
          {/* Saved Progress Resumption Banner */}
          {savedProgressInfo && savedProgressInfo.currentIndex > 0 && savedProgressInfo.currentIndex < cards.length && (
            <div className="d-flex align-items-center justify-content-between p-2.5 px-3 mb-2.5 rounded-3 bg-white border shadow-xs flex-wrap gap-2">
              <div className="d-flex align-items-center gap-2">
                <Sparkles size={14} className="text-warning flex-shrink-0" />
                <span className="small text-dark fw-medium" style={{ fontSize: '12px' }}>
                  Tiến độ đã lưu: <strong>Thẻ {savedProgressInfo.currentIndex + 1}/{savedProgressInfo.total || cards.length}</strong>
                  {savedProgressInfo.reviewIds?.length > 0 && (
                    <span className="text-danger ms-1">({savedProgressInfo.reviewIds.length} từ cần ôn lại)</span>
                  )}
                </span>
              </div>
              <div className="d-flex align-items-center gap-1.5 ms-auto">
                {savedProgressInfo.reviewIds?.length > 0 && (
                  <button
                    type="button"
                    onClick={handleRetryWrongOnly}
                    className="btn btn-sm btn-outline-danger rounded-pill px-2.5 py-0.5 fw-bold"
                    style={{ fontSize: '11px' }}
                  >
                    Ôn {savedProgressInfo.reviewIds.length} từ cần ôn lại
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleResumeSavedProgress}
                  className="btn btn-sm btn-primary text-white rounded-pill px-2.5 py-0.5 fw-bold"
                  style={{ fontSize: '11px' }}
                >
                  Tiếp tục học
                </button>
                <button
                  type="button"
                  onClick={handleRestart}
                  className="btn btn-sm btn-outline-secondary rounded-pill px-2 py-0.5"
                  style={{ fontSize: '11px' }}
                >
                  Làm lại từ đầu
                </button>
              </div>
            </div>
          )}

          {/* Progress Header Bar */}
          <div className="mb-3">
            <div className="d-flex justify-content-between align-items-center mb-1.5">
              <span className="text-muted fw-semibold small" style={{ fontSize: '12.5px' }}>
                Thẻ <strong className="text-dark">{currentIndex + 1}</strong> / {cards.length}
                {deckMode === 'unlearned' && (
                  <span className="badge bg-danger bg-opacity-10 text-danger ms-1.5 rounded-pill px-2 py-0.5 fw-bold" style={{ fontSize: '10.5px' }}>
                    Chế độ: Từ cần ôn lại
                  </span>
                )}
              </span>
              <div className="d-flex align-items-center gap-2.5">
                <span className="small fw-bold d-flex align-items-center gap-1" style={{ color: '#10b981', fontSize: '12px' }}>
                  <Check size={13} /> {masteredIds.size} đã thành thạo
                </span>
                <span className="small fw-bold d-flex align-items-center gap-1" style={{ color: '#ef4444', fontSize: '12px' }}>
                  <RotateCcw size={13} /> {reviewIds.size} cần ôn lại
                </span>
              </div>
            </div>
            <Progress
              value={progressPercent}
              style={{ height: '6px', borderRadius: '999px', backgroundColor: '#e2e8f0' }}
            >
              <div
                style={{
                  height: '100%',
                  width: `${progressPercent}%`,
                  borderRadius: '999px',
                  background: 'linear-gradient(90deg, #2563eb 0%, #10b981 100%)',
                  transition: 'width 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
                }}
              />
            </Progress>
          </div>

          {/* ── 3D FLIP CARD CONTAINER ── */}
          <div
            className={`flashcard-container mb-3 position-relative ${transitionAnim}`}
            onClick={handleFlip}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            style={{
              transform: touchDeltaX !== 0
                ? `translateX(${touchDeltaX * 0.45}px) rotateZ(${touchDeltaX * 0.05}deg)`
                : (cardTilt.x !== 0 || cardTilt.y !== 0)
                  ? `perspective(1200px) rotateX(${cardTilt.x}deg) rotateY(${cardTilt.y}deg)`
                  : undefined,
              transition: touchDeltaX !== 0 ? 'none' : 'transform 0.28s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.25s ease'
            }}
          >
            {/* Floating +10 XP badge */}
            {floatingXp && (
              <div className="floating-xp-badge">
                +10 XP · Đã Thành Thạo!
              </div>
            )}
            <div className={`flashcard-inner ${isFlipped ? 'is-flipped' : ''}`}>

              {/* ── CARD FRONT FACE ── */}
              <div className="flashcard-face flashcard-front">
                {/* Top Face Controls */}
                <div className="d-flex justify-content-between align-items-center">
                  <div className="d-flex align-items-center gap-1.5">
                    <Badge
                      pill
                      style={{
                        background: '#eff6ff',
                        color: '#2563eb',
                        border: '1px solid #bfdbfe',
                        fontSize: '12px',
                        fontWeight: 700,
                        padding: '4px 10px'
                      }}
                    >
                      Bài {currentCard.lesson_number} • #{currentIndex + 1}
                    </Badge>
                    <span className="badge rounded-pill bg-light text-muted border small" style={{ fontSize: '11px' }}>
                      {cardDirection === 'vi_to_jp' ? 'Việt sang Nhật' : 'Nhật sang Việt'}
                    </span>
                  </div>

                  <div className="d-flex align-items-center gap-1.5">
                    {/* Audio button on front when showing Japanese */}
                    {cardDirection === 'jp_to_vi' && (
                      <button
                        type="button"
                        onClick={handleSpeak}
                        title="Nghe phát âm chuẩn Tokyo"
                        className="btn btn-sm btn-light border rounded-circle p-1 audio-btn d-flex align-items-center justify-content-center"
                        style={{ width: '34px', height: '34px', color: '#2563eb' }}
                      >
                        <Volume2 size={17} />
                      </button>
                    )}

                    {/* Star Favorite Button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        sounds.playFlip();
                        toggleFavorite(currentCard);
                      }}
                      title="Lưu vào danh sách yêu thích"
                      className="btn btn-sm btn-light border rounded-circle p-1 audio-btn d-flex align-items-center justify-content-center"
                      style={{ width: '34px', height: '34px' }}
                    >
                      <Star
                        size={17}
                        fill={isFavorite(currentCard.id, currentCard.is_favorite) ? '#f59e0b' : 'none'}
                        color={isFavorite(currentCard.id, currentCard.is_favorite) ? '#f59e0b' : '#94a3b8'}
                      />
                    </button>
                  </div>
                </div>

                {/* Center Question Content */}
                <div className="text-center py-4 my-auto">
                  {cardDirection === 'vi_to_jp' ? (
                    <>
                      <h2
                        className="fw-black text-navy-dark mb-0 zen-meaning-display"
                        style={{
                          fontSize: 'clamp(1.5rem, 5.5vw, 2.3rem)',
                          lineHeight: '1.3',
                          wordBreak: 'break-word'
                        }}
                      >
                        {cleanVietnamese}
                      </h2>
                    </>
                  ) : (
                    <>
                      {Boolean(currentCard.kanji && hasRealKanji(currentCard.kanji)) ? (
                        <>
                          <div
                            className="fw-black mb-1 font-monospace"
                            style={{
                              fontSize: 'clamp(2.2rem, 8vw, 3.8rem)',
                              lineHeight: '1.1',
                              color: '#0f172a'
                            }}
                          >
                            {currentCard.kanji}
                          </div>
                          <div
                            className="fw-bold font-monospace"
                            style={{
                              fontSize: 'clamp(1.4rem, 5vw, 2.1rem)',
                              color: '#2563eb'
                            }}
                          >
                            {cleanKana}
                          </div>
                        </>
                      ) : (
                        <>
                          <div
                            className="fw-black font-monospace"
                            style={{
                              fontSize: 'clamp(2.2rem, 8vw, 3.8rem)',
                              lineHeight: '1.1',
                              color: /[\u30A0-\u30FF]/.test(cleanKana) ? '#d97706' : '#2563eb'
                            }}
                          >
                            {cleanKana}
                          </div>
                          
                        </>
                      )}
                    </>
                  )}
                </div>

                {/* Bottom Flip Indicator */}
                <div className="text-center pt-2 border-top">
                  <span
                    className="small text-muted d-inline-flex align-items-center gap-1.5 py-1 px-3 rounded-pill bg-light border"
                    style={{ fontSize: '11.5px' }}
                  >
                    <RotateCw size={12} className="text-primary" />
                    <span>Chạm thẻ hoặc nhấn <strong>Space</strong> để lật xem đáp án</span>
                  </span>
                </div>
              </div>

              {/* ── CARD BACK FACE ── */}
              <div className="flashcard-face flashcard-back">
                {/* Top Face Controls */}
                <div className="d-flex justify-content-between align-items-center">
                  <div className="d-flex align-items-center gap-1.5">
                    <Badge
                      pill
                      style={{
                        background: 'rgba(255, 255, 255, 0.18)',
                        color: '#ffffff',
                        fontSize: '12px',
                        fontWeight: 700,
                        padding: '4px 10px'
                      }}
                    >
                      Đáp án chi tiết
                    </Badge>
                  </div>

                  <div className="d-flex align-items-center gap-1.5">
                    <button
                      type="button"
                      onClick={handleSpeak}
                      title="Nghe phát âm chuẩn Tokyo"
                      className="btn btn-sm text-white rounded-circle p-1 audio-btn d-flex align-items-center justify-content-center"
                      style={{
                        width: '34px',
                        height: '34px',
                        background: 'rgba(255, 255, 255, 0.2)',
                        border: '1px solid rgba(255, 255, 255, 0.3)'
                      }}
                    >
                      <Volume2 size={17} />
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        sounds.playFlip();
                        toggleFavorite(currentCard);
                      }}
                      title="Lưu vào yêu thích"
                      className="btn btn-sm text-white rounded-circle p-1 audio-btn d-flex align-items-center justify-content-center"
                      style={{
                        width: '34px',
                        height: '34px',
                        background: 'rgba(255, 255, 255, 0.2)',
                        border: '1px solid rgba(255, 255, 255, 0.3)'
                      }}
                    >
                      <Star
                        size={17}
                        fill={isFavorite(currentCard.id, currentCard.is_favorite) ? '#fbbf24' : 'none'}
                        color={isFavorite(currentCard.id, currentCard.is_favorite) ? '#fbbf24' : '#ffffff'}
                      />
                    </button>
                  </div>
                </div>

                {/* Center Answer Content */}
                <div className="text-center py-3 my-auto">
                  {cardDirection === 'vi_to_jp' ? (
                    <>
                      {Boolean(currentCard.kanji && hasRealKanji(currentCard.kanji)) ? (
                        <>
                          <div
                            className="fw-black mb-1 font-monospace"
                            style={{
                              fontSize: 'clamp(2.2rem, 8vw, 3.8rem)',
                              color: '#fbbf24',
                              lineHeight: '1.15'
                            }}
                          >
                            {currentCard.kanji}
                          </div>
                          <div
                            className="fw-bold text-white font-monospace"
                            style={{ fontSize: 'clamp(1.4rem, 5vw, 2.2rem)' }}
                          >
                            {cleanKana}
                          </div>
                        </>
                      ) : (
                        <div
                          className="fw-black font-monospace"
                          style={{
                            fontSize: 'clamp(2.2rem, 8vw, 3.8rem)',
                            color: '#fbbf24',
                            lineHeight: '1.15'
                          }}
                        >
                          {cleanKana}
                        </div>
                      )}
                      <div className="small font-monospace text-white text-opacity-75 mt-1" style={{ fontSize: '13.5px' }}>
                        [{currentCard.romaji}]
                      </div>

                      {currentCard.usage_note && (
                        <div
                          className="mt-3 px-3 py-1.5 rounded-pill d-inline-flex align-items-center gap-1.5 small"
                          style={{
                            background: 'rgba(255, 255, 255, 0.15)',
                            border: '1px solid rgba(255, 255, 255, 0.25)',
                            color: '#f8fafc',
                            fontSize: '12px'
                          }}
                        >
                          <Info size={13} style={{ color: '#fbbf24' }} />
                          <span>{currentCard.usage_note}</span>
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      {Boolean(currentCard.kanji && hasRealKanji(currentCard.kanji)) ? (
                        <div className="small text-white text-opacity-75 mb-1" style={{ fontSize: '15px' }}>
                          <strong className="text-warning font-monospace fs-5">{currentCard.kanji}</strong> ({cleanKana})
                        </div>
                      ) : (
                        <div className="small text-white text-opacity-75 mb-1" style={{ fontSize: '15px' }}>
                          <strong className="text-warning font-monospace fs-5">{cleanKana}</strong>
                        </div>
                      )}

                      <div
                        className="p-3 rounded-3 text-white my-2"
                        style={{
                          background: 'rgba(255, 255, 255, 0.14)',
                          border: '1px solid rgba(255, 255, 255, 0.25)'
                        }}
                      >
                        <h4 className="fw-black mb-0 text-white zen-meaning-display" style={{ fontSize: 'clamp(1.2rem, 5vw, 1.8rem)', color: '#ffffff' }}>
                          {cleanVietnamese}
                        </h4>
                      </div>

                      {currentCard.usage_note && (
                        <div className="small text-white text-opacity-80 mt-2" style={{ fontSize: '12px' }}>
                          {currentCard.usage_note}
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* Bottom Assessment Hint */}
                <div className="text-center pt-2 border-top border-white border-opacity-15">
                  <span className="small text-white text-opacity-75" style={{ fontSize: '12px' }}>
                    Đánh giá: Phím <strong>1 (Cần Ôn Lại)</strong> • Phím <strong>2 (Đã Thành Thạo)</strong>
                  </span>
                </div>
              </div>

            </div>
          </div>

          {/* ── 5. Answer Assessment Buttons ── */}
          <Row className="g-2 g-md-3 mb-3">
            <Col xs={6}>
              <Button
                block
                color="danger"
                disabled={isTransitioning}
                onClick={() => handleAnswer(false)}
                className={`flashcard-answer-btn py-2.5 py-md-3 rounded-3 fw-bold d-flex align-items-center justify-content-center gap-2 shadow-sm border-0 ${
                  isTransitioning ? 'opacity-75 pe-none' : ''
                }`}
                style={{
                  background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                  fontSize: '14.5px'
                }}
              >
                <X size={18} />
                <span>Cần Ôn Lại</span>
                <span className="badge bg-black bg-opacity-25 rounded-pill small fw-normal d-none d-sm-inline" style={{ fontSize: '10px' }}>
                  Phím 1
                </span>
              </Button>
            </Col>

            <Col xs={6}>
              <Button
                block
                color="success"
                disabled={isTransitioning}
                onClick={() => handleAnswer(true)}
                className={`flashcard-answer-btn py-2.5 py-md-3 rounded-3 fw-bold d-flex align-items-center justify-content-center gap-2 shadow-sm border-0 ${
                  isTransitioning ? 'opacity-75 pe-none' : ''
                }`}
                style={{
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  fontSize: '14.5px'
                }}
              >
                <Check size={18} />
                <span>Đã Thành Thạo</span>
                <span className="badge bg-black bg-opacity-25 rounded-pill small fw-normal d-none d-sm-inline" style={{ fontSize: '10px' }}>
                  Phím 2
                </span>
              </Button>
            </Col>
          </Row>

          {/* ── 6. Bottom Navigation Controls ── */}
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 pt-2">
            <Button
              color="light"
              size="sm"
              disabled={currentIndex === 0 || isTransitioning}
              onClick={handlePrev}
              className="rounded-pill border px-3 fw-semibold d-inline-flex align-items-center gap-1 shadow-xs"
              style={{ fontSize: '12.5px' }}
            >
              <ChevronLeft size={15} />
              <span>Thẻ trước</span>
            </Button>

            <Button
              color="light"
              size="sm"
              disabled={isTransitioning}
              onClick={handleFlip}
              className="rounded-pill border px-3 fw-bold text-primary d-inline-flex align-items-center gap-1.5 shadow-xs"
              style={{ fontSize: '12.5px', background: '#eff6ff', borderColor: '#bfdbfe' }}
            >
              <RotateCw size={13} />
              <span>{isFlipped ? 'Lật lại mặt trước' : 'Lật xem đáp án'}</span>
            </Button>

            <Button
              color="light"
              size="sm"
              disabled={currentIndex === cards.length - 1 || isTransitioning}
              onClick={handleNext}
              className="rounded-pill border px-3 fw-semibold d-inline-flex align-items-center gap-1 shadow-xs"
              style={{ fontSize: '12.5px' }}
            >
              <span>Thẻ sau</span>
              <ChevronRight size={15} />
            </Button>
          </div>
        </>
      )}

      {/* ── LESSON PICKER MODAL (25 LESSONS GRID) ── */}
      <Modal
        isOpen={lessonPickerOpen}
        toggle={() => setLessonPickerOpen(false)}
        centered
        className="jlpt-modal"
      >
        <ModalBody className="p-3.5 p-md-4">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div>
              <h5 className="fw-black mb-0 text-navy-dark">Chọn Bài Học Flashcard</h5>
              <small className="text-muted">Chọn 1 trong 25 bài Minna no Nihongo hoặc toàn bộ</small>
            </div>
            <button
              type="button"
              onClick={() => setLessonPickerOpen(false)}
              className="btn btn-sm btn-light rounded-circle p-1"
              style={{ width: 30, height: 30 }}
            >
              <X size={16} />
            </button>
          </div>

          <button
            type="button"
            onClick={() => {
              sounds.playFlip?.();
              setLessonNum('all');
              setLessonPickerOpen(false);
            }}
            className={`btn w-100 mb-2.5 py-2 rounded-3 fw-bold border ${
              lessonNum === 'all' ? 'btn-primary text-white shadow-xs' : 'btn-light text-navy-dark'
            }`}
            style={{ fontSize: '13px' }}
          >
            <Sparkles size={14} className="me-1.5 text-warning" />
            <span>Toàn Bộ 25 Bài (1,589 Từ Vựng)</span>
          </button>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(5, 1fr)',
              gap: '6px',
              maxHeight: '280px',
              overflowY: 'auto'
            }}
          >
            {Array.from({ length: 25 }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => {
                  sounds.playFlip?.();
                  setLessonNum(n);
                  setLessonPickerOpen(false);
                }}
                className={`btn btn-sm py-2 px-1 rounded-3 fw-bold text-center border ${
                  lessonNum === n
                    ? 'btn-primary text-white shadow-xs'
                    : 'btn-white bg-white text-navy-dark hover-border'
                }`}
                style={{ fontSize: '12px' }}
              >
                Bài {n < 10 ? `0${n}` : n}
              </button>
            ))}
          </div>
        </ModalBody>
      </Modal>
    </div>
  );
};

export default FlashcardPage;

