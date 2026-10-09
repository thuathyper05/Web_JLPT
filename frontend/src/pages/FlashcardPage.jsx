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
  Spinner
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
  Shuffle,
  RefreshCw,
  Info,
  Zap,
  BookOpen,
  VolumeX,
  Sparkles,
  ArrowRightLeft
} from 'lucide-react';
import { vocabService, speakJapanese } from '../services/api';
import { sounds } from '../services/sounds';
import { useApp } from '../context/AppContext';
import confetti from 'canvas-confetti';

const FlashcardPage = ({ initialLesson = 1 }) => {
  const { toggleFavorite, isFavorite, updateProgress } = useApp();
  const [lessonNum, setLessonNum] = useState(initialLesson);
  const [cards, setCards] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [loading, setLoading] = useState(true);
  const [cardDirection, setCardDirection] = useState('vi_to_jp'); // 'vi_to_jp' | 'jp_to_vi'
  const [autoPlayAudio, setAutoPlayAudio] = useState(true);
  const [masteredIds, setMasteredIds] = useState(new Set());
  const [reviewIds, setReviewIds] = useState(new Set());
  const [sessionDone, setSessionDone] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionAnim, setTransitionAnim] = useState(''); // 'slide-mastered' | 'slide-review' | ''
  const [cardTilt, setCardTilt] = useState({ x: 0, y: 0 });
  const [floatingXp, setFloatingXp] = useState(false);

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

  const fetchCards = useCallback(async (lesson) => {
    setLoading(true);
    setIsFlipped(false);
    setCurrentIndex(0);
    setMasteredIds(new Set());
    setReviewIds(new Set());
    setSessionDone(false);
    setIsTransitioning(false);
    setTransitionAnim('');
    try {
      const params = lesson === 'all' ? {} : { lesson: parseInt(lesson) };
      const res = await vocabService.getVocabularies(params);
      setCards(res.data);
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
  const cleanKana = currentCard ? (currentCard.clean_kana || currentCard.kana) : '';

  // Auto-play pronunciation when card becomes active or flips to Japanese
  useEffect(() => {
    if (!currentCard || !autoPlayAudio || loading || sessionDone || isTransitioning) return;

    if (cardDirection === 'jp_to_vi' && !isFlipped) {
      speakJapanese(cleanKana);
    } else if (cardDirection === 'vi_to_jp' && isFlipped) {
      speakJapanese(cleanKana);
    }
  }, [currentIndex, isFlipped, cardDirection, autoPlayAudio, currentCard, cleanKana, loading, sessionDone, isTransitioning]);

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
    if (remembered) {
      sounds.playCorrect();
      setMasteredIds((prev) => new Set(prev).add(currentCard.id));
      setFloatingXp(true);
      setTimeout(() => setFloatingXp(false), 850);
      updateProgress(currentCard.id, 'mastered', true).catch(() => {});
    } else {
      sounds.playWrong();
      setReviewIds((prev) => new Set(prev).add(currentCard.id));
      updateProgress(currentCard.id, 'needs_review', false).catch(() => {});
    }

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
  }, [currentCard, currentIndex, cards.length, isTransitioning, sessionDone, updateProgress]);

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

  // Retry ONLY wrong cards (Bug fixed: previously shuffled everything)
  const handleRetryWrongOnly = () => {
    if (reviewIds.size === 0) return;
    sounds.playFlip();
    const wrongCards = cards.filter((c) => reviewIds.has(c.id));
    if (wrongCards.length > 0) {
      setCards(wrongCards);
      setCurrentIndex(0);
      setIsFlipped(false);
      setMasteredIds(new Set());
      setReviewIds(new Set());
      setSessionDone(false);
    }
  };

  // Restart full lesson
  const handleRestart = () => {
    sounds.playFlip();
    fetchCards(lessonNum);
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
    <Container className="py-3 py-md-4" style={{ maxWidth: '780px' }}>
      {/* ── 1. Top Header Box & Configuration ── */}
      <div className="page-header-box mb-2 p-2 p-md-3">
        {/* Desktop Header */}
        <div className="d-none d-md-flex justify-content-between align-items-center flex-wrap gap-2.5 mb-3">
          <div className="d-flex align-items-center gap-3">
            <div
              className="d-flex align-items-center justify-content-center rounded-3 text-white shadow-sm flex-shrink-0"
              style={{
                width: '46px',
                height: '46px',
                background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)'
              }}
            >
              <Layers size={24} />
            </div>
            <div>
              <h5 className="fw-bold mb-0 text-navy-dark">Thẻ Nhớ Flashcard 3D</h5>
              <small className="text-muted">Lật thẻ 2 chiều · Tự động phát âm chuẩn Tokyo</small>
            </div>
          </div>

          <div className="d-flex align-items-center gap-2">
            <Input
              type="select"
              value={lessonNum}
              onChange={(e) => setLessonNum(e.target.value)}
              className="fw-bold form-control-sm rounded-pill"
              style={{ fontSize: '13px', minWidth: '140px' }}
            >
              <option value="all">Toàn bộ 25 bài ({cards.length > 0 && lessonNum === 'all' ? cards.length : '1,589'} từ)</option>
              {Array.from({ length: 25 }, (_, i) => i + 1).map((n) => (
                <option key={n} value={n}>
                  Bài {n < 10 ? `0${n}` : n}
                </option>
              ))}
            </Input>

            <button
              type="button"
              onClick={handleShuffle}
              title="Trộn ngẫu nhiên thứ tự thẻ"
              className="btn btn-sm btn-light border rounded-circle p-1 audio-btn d-flex align-items-center justify-content-center"
              style={{ width: '32px', height: '32px' }}
            >
              <Shuffle size={15} className="text-secondary" />
            </button>

            <button
              type="button"
              onClick={() => {
                sounds.playFlip();
                setAutoPlayAudio(!autoPlayAudio);
              }}
              title={autoPlayAudio ? 'Tắt tự động phát âm' : 'Bật tự động phát âm'}
              className={`btn btn-sm rounded-pill px-2.5 py-1 d-flex align-items-center gap-1 border ${
                autoPlayAudio ? 'btn-primary text-white' : 'btn-light text-muted'
              }`}
              style={{ fontSize: '12px' }}
            >
              {autoPlayAudio ? <Volume2 size={13} /> : <VolumeX size={13} />}
              <span className="d-none d-sm-inline">{autoPlayAudio ? 'Âm thanh: Bật' : 'Âm thanh: Tắt'}</span>
            </button>
          </div>
        </div>

        {/* Mobile Header: Ultra-compact 1-Row layout (Under 40px) */}
        <div className="d-flex d-md-none align-items-center justify-content-between gap-1.5">
          <Input
            type="select"
            value={lessonNum}
            onChange={(e) => setLessonNum(e.target.value)}
            className="fw-bold form-control-sm rounded-pill border"
            style={{ fontSize: '12px', flex: 1, minWidth: 0, height: '34px', paddingLeft: '10px' }}
          >
            <option value="all">25 bài ({cards.length})</option>
            {Array.from({ length: 25 }, (_, i) => i + 1).map((n) => (
              <option key={n} value={n}>
                Bài {n < 10 ? `0${n}` : n}
              </option>
            ))}
          </Input>

          {/* Quick Direction Toggle Pill */}
          <button
            type="button"
            onClick={() => {
              setCardDirection(cardDirection === 'vi_to_jp' ? 'jp_to_vi' : 'vi_to_jp');
              setIsFlipped(false);
              sounds.playFlip();
            }}
            className="btn btn-sm btn-light border rounded-pill px-2 d-flex align-items-center gap-1"
            style={{ fontSize: '11px', height: '34px', whiteSpace: 'nowrap' }}
            title="Đổi chiều lật thẻ"
          >
            <ArrowRightLeft size={11} className="text-primary" />
            <span>{cardDirection === 'vi_to_jp' ? '🇻🇳 ➔ 🇯🇵' : '🇯🇵 ➔ 🇻🇳'}</span>
          </button>

          {/* Audio toggle button */}
          <button
            type="button"
            onClick={() => {
              sounds.playFlip();
              setAutoPlayAudio(!autoPlayAudio);
            }}
            className={`btn btn-sm rounded-circle p-0 d-flex align-items-center justify-content-center border ${
              autoPlayAudio ? 'btn-primary' : 'btn-light'
            }`}
            style={{ width: '34px', height: '34px', flexShrink: 0 }}
            title={autoPlayAudio ? 'Tắt phát âm' : 'Bật phát âm'}
          >
            {autoPlayAudio ? <Volume2 size={14} /> : <VolumeX size={14} />}
          </button>

          {/* Shuffle button */}
          <button
            type="button"
            onClick={handleShuffle}
            className="btn btn-sm btn-light border rounded-circle p-0 d-flex align-items-center justify-content-center"
            style={{ width: '34px', height: '34px', flexShrink: 0 }}
            title="Trộn ngẫu nhiên"
          >
            <Shuffle size={13} className="text-secondary" />
          </button>
        </div>

        {/* Direction Switcher (Desktop Only) */}
        <div className="d-none d-md-flex justify-content-center">
          <div className="segmented-control shadow-xs">
            <button
              type="button"
              onClick={() => {
                setCardDirection('vi_to_jp');
                setIsFlipped(false);
                sounds.playFlip();
              }}
              className={`segmented-item ${cardDirection === 'vi_to_jp' ? 'active' : ''}`}
            >
              <span>🇻🇳 Tiếng Việt ➔ 🇯🇵 Tiếng Nhật</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setCardDirection('jp_to_vi');
                setIsFlipped(false);
                sounds.playFlip();
              }}
              className={`segmented-item ${cardDirection === 'jp_to_vi' ? 'active' : ''}`}
            >
              <span>🇯🇵 Tiếng Nhật ➔ 🇻🇳 Tiếng Việt</span>
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
          <div style={{ fontSize: '64px', lineHeight: 1 }} className="mb-2">
            🎉
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
                <small className="text-muted fw-semibold" style={{ fontSize: '11.5px' }}>
                  ✓ Đã thuộc
                </small>
              </div>
            </div>
            <div className="col-4">
              <div className="p-3 rounded-3 bg-light border text-center h-100">
                <div className="fs-3 fw-black" style={{ color: '#ef4444' }}>
                  {reviewIds.size}
                </div>
                <small className="text-muted fw-semibold" style={{ fontSize: '11.5px' }}>
                  ✗ Cần ôn lại
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
                <span>Chỉ ôn {reviewIds.size} từ chưa nhớ</span>
              </Button>
            )}
          </div>
        </div>
      ) : (
        /* ── 4. Active Card Study Screen ── */
        <>
          {/* Progress Header Bar */}
          <div className="mb-3">
            <div className="d-flex justify-content-between align-items-center mb-1.5">
              <span className="text-muted fw-semibold small" style={{ fontSize: '12.5px' }}>
                Thẻ <strong className="text-dark">{currentIndex + 1}</strong> / {cards.length}
              </span>
              <div className="d-flex align-items-center gap-3">
                <span className="small fw-bold" style={{ color: '#10b981', fontSize: '12px' }}>
                  ✓ {masteredIds.size} đã nhớ
                </span>
                <span className="small fw-bold" style={{ color: '#ef4444', fontSize: '12px' }}>
                  ✗ {reviewIds.size} chưa nhớ
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
                +10 XP ✨ Đã nhớ!
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
                      {cardDirection === 'vi_to_jp' ? '🇻🇳 Việt ➔ Nhật' : '🇯🇵 Nhật ➔ Việt'}
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
                      <span
                        className="d-inline-block small fw-bold text-uppercase tracking-wider mb-2"
                        style={{ color: '#94a3b8', fontSize: '11.5px', letterSpacing: '0.08em' }}
                      >
                        Ý Nghĩa Tiếng Việt
                      </span>
                      <h2
                        className="fw-black text-navy-dark mb-0"
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
                      <span
                        className="d-inline-block small fw-bold text-uppercase tracking-wider mb-2"
                        style={{ color: '#94a3b8', fontSize: '11.5px', letterSpacing: '0.08em' }}
                      >
                        Từ Vựng Tiếng Nhật
                      </span>
                      {currentCard.kanji && currentCard.kanji !== '–' && currentCard.kanji !== '-' && (
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
                      )}
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
                      ✓ Đáp án chi tiết
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
                      {currentCard.kanji && currentCard.kanji !== '–' && currentCard.kanji !== '-' && (
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
                      )}
                      <div
                        className="fw-bold text-white font-monospace"
                        style={{ fontSize: 'clamp(1.4rem, 5vw, 2.2rem)' }}
                      >
                        {cleanKana}
                      </div>
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
                      {currentCard.kanji && currentCard.kanji !== '–' && currentCard.kanji !== '-' && (
                        <div className="small text-white text-opacity-75 mb-1" style={{ fontSize: '15px' }}>
                          <strong className="text-warning font-monospace fs-5">{currentCard.kanji}</strong> ({cleanKana})
                        </div>
                      )}

                      <div
                        className="p-3 rounded-3 text-white my-2"
                        style={{
                          background: 'rgba(255, 255, 255, 0.14)',
                          border: '1px solid rgba(255, 255, 255, 0.25)'
                        }}
                      >
                        <span className="small text-white text-opacity-75 d-block mb-1" style={{ fontSize: '11px' }}>
                          NGHĨA TIẾNG VIỆT
                        </span>
                        <h4 className="fw-black mb-0 text-white" style={{ fontSize: 'clamp(1.2rem, 5vw, 1.8rem)' }}>
                          {cleanVietnamese}
                        </h4>
                      </div>

                      {currentCard.usage_note && (
                        <div className="small text-white text-opacity-80 mt-2" style={{ fontSize: '12px' }}>
                          💡 {currentCard.usage_note}
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* Bottom Assessment Hint */}
                <div className="text-center pt-2 border-top border-white border-opacity-15">
                  <span className="small text-white text-opacity-75" style={{ fontSize: '12px' }}>
                    Đánh giá: Phím <strong>1 (Chưa nhớ)</strong> • Phím <strong>2 (Đã nhớ)</strong>
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
                <span>Chưa nhớ</span>
                <span className="badge bg-black bg-opacity-25 rounded-pill small fw-normal d-none d-sm-inline" style={{ fontSize: '10px' }}>
                  Phím 1 / ←
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
                <span>Đã nhớ</span>
                <span className="badge bg-black bg-opacity-25 rounded-pill small fw-normal d-none d-sm-inline" style={{ fontSize: '10px' }}>
                  Phím 2 / →
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
    </Container>
  );
};

export default FlashcardPage;
