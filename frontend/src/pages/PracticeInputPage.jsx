import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  Keyboard,
  Languages,
  BookOpen,
  Volume2,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Sparkles,
  Eye,
  EyeOff,
  ChevronLeft,
  ChevronRight,
  Zap,
  Target,
  Flame,
  LayoutGrid,
  Check,
  RefreshCw,
  Trophy,
  ArrowRight
} from 'lucide-react';
import * as wanakana from 'wanakana';
import { vocabService, speakJapanese } from '../services/api';
import { sounds } from '../services/sounds';
import { useApp } from '../context/AppContext';
import { awardGardenWater } from '../services/gardenRewards';
import confetti from 'canvas-confetti';

const hasRealKanji = (str) => /[\u4E00-\u9FAF\u3400-\u4DBF]/.test(str || '');

const PracticeInputPage = ({ initialLesson = 1, onNavigate }) => {
  const { updateProgress } = useApp();
  const [lessonNum, setLessonNum] = useState(initialLesson);
  const [vocabList, setVocabList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Practice Modes
  const [inputMode, setInputMode] = useState('vi_to_jp'); // 'vi_to_jp' | 'jp_to_jp'
  const [viewLayout, setViewLayout] = useState('zen'); // 'zen' (single word focus) | 'grid' (all words list)
  const [autoKana, setAutoKana] = useState(true);

  // Zen Mode Navigation
  const [zenIndex, setZenIndex] = useState(0);
  const [zenShake, setZenShake] = useState(false);
  const [floatingXp, setFloatingXp] = useState(false);
  const [combo, setCombo] = useState(0);

  // User input records & validation
  const [userInputs, setUserInputs] = useState({});
  const [checkResults, setCheckResults] = useState({});
  const [revealedIds, setRevealedIds] = useState({});
  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'unanswered' | 'wrong' | 'correct'

  const zenInputRef = useRef(null);

  useEffect(() => {
    if (initialLesson) setLessonNum(initialLesson);
  }, [initialLesson]);

  useEffect(() => {
    fetchLessonVocab(lessonNum);
  }, [lessonNum]);

  const fetchLessonVocab = async (lesson) => {
    setLoading(true);
    setUserInputs({});
    setCheckResults({});
    setRevealedIds({});
    setZenIndex(0);
    setCombo(0);
    try {
      const res = await vocabService.getVocabularies({ lesson: parseInt(lesson) });
      const data = Array.isArray(res.data) ? res.data : (res.data?.data || []);
      setVocabList(data);
    } catch (err) {
      console.error('Error fetching practice vocab:', err);
    } finally {
      setLoading(false);
    }
  };

  // Auto-focus input in Zen Mode
  useEffect(() => {
    if (viewLayout === 'zen' && zenInputRef.current && !loading) {
      zenInputRef.current.focus();
    }
  }, [zenIndex, viewLayout, loading]);

  // Clean target Kana string for matching
  const getCleanExpected = (item) => {
    const raw = item.clean_kana || item.kana || '';
    return raw.replace(/[［\[］\]]/g, '').trim();
  };

  const handleInputChange = (id, rawValue, expectedKana) => {
    let finalValue = rawValue;
    if (autoKana) {
      finalValue = wanakana.toKana(rawValue, { IMEMode: true });
    }

    setUserInputs(prev => ({ ...prev, [id]: finalValue }));

    const trimmedInput = finalValue.trim();
    if (!trimmedInput) {
      setCheckResults(prev => {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      });
      return;
    }

    const cleanExpected = expectedKana.replace(/[［\[］\]]/g, '').trim();

    // Instant match check: If typed exactly the expected Kana, mark success immediately!
    if (trimmedInput === cleanExpected || trimmedInput === expectedKana.trim()) {
      if (checkResults[id] !== true) {
        setCheckResults(prev => ({ ...prev, [id]: true }));
        sounds.playCorrect();
        speakJapanese(cleanExpected);
        updateProgress(id, 'mastered', true).catch(() => {});
        awardGardenWater(2, 'Luyện gõ đúng');
        setCombo(prev => prev + 1);
        setFloatingXp(true);
        setTimeout(() => setFloatingXp(false), 850);

        // In Zen mode, smoothly auto-advance to next word after short delay
        if (viewLayout === 'zen') {
          setTimeout(() => {
            setZenIndex(prev => {
              if (prev < vocabList.length - 1) return prev + 1;
              return prev;
            });
          }, 360);
        }
      }
    }
  };

  // Evaluate word on Enter, Tab or Check trigger
  const handleEvaluate = (id, expectedKana) => {
    const val = (userInputs[id] || '').trim();
    if (!val) return;
    if (checkResults[id] === true) {
      // Already correct, move to next word in Zen mode
      if (viewLayout === 'zen' && zenIndex < vocabList.length - 1) {
        setZenIndex(prev => prev + 1);
      }
      return;
    }

    const cleanExpected = expectedKana.replace(/[［\[］\]]/g, '').trim();
    const isCorrect = val === cleanExpected || val === expectedKana.trim();

    setCheckResults(prev => ({ ...prev, [id]: isCorrect }));

    if (isCorrect) {
      sounds.playCorrect();
      speakJapanese(cleanExpected);
      updateProgress(id, 'mastered', true).catch(() => {});
      awardGardenWater(2, 'Luyện gõ đúng');
      setCombo(prev => prev + 1);
      setFloatingXp(true);
      setTimeout(() => setFloatingXp(false), 850);

      if (viewLayout === 'zen' && zenIndex < vocabList.length - 1) {
        setTimeout(() => setZenIndex(prev => prev + 1), 320);
      }
    } else {
      sounds.playWrong();
      setCombo(0);
      setZenShake(true);
      setTimeout(() => setZenShake(false), 450);
      updateProgress(id, 'needs_review', false).catch(() => {});
    }
  };

  const handleRevealAnswer = (id) => {
    sounds.playFlip();
    setRevealedIds(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleReset = () => {
    sounds.playFlip();
    setUserInputs({});
    setCheckResults({});
    setRevealedIds({});
    setZenIndex(0);
    setCombo(0);
  };

  // Metrics
  const total = vocabList.length;
  const answeredCount = Object.keys(checkResults).length;
  const correctCount = Object.values(checkResults).filter(Boolean).length;
  const wrongCount = answeredCount - correctCount;
  const accuracyRate = answeredCount > 0 ? Math.round((correctCount / answeredCount) * 100) : 0;
  const progressPercent = total > 0 ? Math.round((answeredCount / total) * 100) : 0;

  // Session completion celebration
  useEffect(() => {
    if (total > 0 && answeredCount === total && correctCount === total) {
      sounds.playComplete();
      awardGardenWater(25, 'Hoàn thành bài luyện gõ');
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch {}
    }
  }, [correctCount, answeredCount, total]);

  // Filtered list for grid view
  const filteredVocabList = vocabList.filter(item => {
    const res = checkResults[item.id];
    if (activeFilter === 'correct') return res === true;
    if (activeFilter === 'wrong') return res === false;
    if (activeFilter === 'unanswered') return res === undefined;
    return true;
  });

  const currentZenWord = vocabList[zenIndex];

  return (
    <Container className="py-2.5 py-md-4" style={{ maxWidth: '920px' }}>
      {/* ── 1. LUXURY MINIMALIST HEADER & CONTROLS ── */}
      <div
        className="p-3 p-md-3.5 mb-3 rounded-4 bg-white shadow-xs border"
        style={{ borderColor: 'var(--slate-200)' }}
      >
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2.5 mb-2.5">
          {/* Branding & Title */}
          <div className="d-flex align-items-center gap-2.5">
            <div
              className="d-flex align-items-center justify-content-center rounded-3 text-white shadow-xs flex-shrink-0"
              style={{
                width: 38,
                height: 38,
                background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)'
              }}
            >
              <Keyboard size={20} />
            </div>
            <div>
              <div className="d-flex align-items-center gap-1.5">
                <h5 className="fw-black text-navy-dark mb-0 tracking-tight" style={{ fontSize: '16px' }}>
                  Luyện Gõ Tiếng Nhật
                </h5>
                <Badge color="primary" pill className="px-2 py-0.5 fw-bold" style={{ fontSize: '10px' }}>
                  Bài {lessonNum < 10 ? `0${lessonNum}` : lessonNum}
                </Badge>
              </div>
              <small className="text-muted" style={{ fontSize: '11.5px' }}>
                Phản xạ gõ Romaji ➔ Kana trực tiếp
              </small>
            </div>
          </div>

          {/* Top Action Pills: Lesson Selector + Mode + Reset */}
          <div className="d-flex align-items-center gap-1.5 ms-auto flex-wrap">
            {/* Lesson Select Pill */}
            <div className="d-flex align-items-center gap-1 bg-light rounded-pill px-2 py-1 border">
              <span className="small text-muted fw-bold" style={{ fontSize: '11px' }}>Bài:</span>
              <Input
                type="select"
                value={lessonNum}
                onChange={(e) => setLessonNum(parseInt(e.target.value))}
                className="form-control-sm border-0 bg-transparent fw-bold p-0 pe-3"
                style={{ fontSize: '12px', width: 'auto', cursor: 'pointer', boxShadow: 'none' }}
              >
                {Array.from({ length: 25 }, (_, i) => i + 1).map((n) => (
                  <option key={n} value={n}>
                    Bài {n < 10 ? `0${n}` : n}
                  </option>
                ))}
              </Input>
            </div>

            {/* IME Auto-Kana Toggle */}
            <button
              type="button"
              onClick={() => setAutoKana(!autoKana)}
              className={`btn btn-sm rounded-pill px-2.5 py-1 fw-bold border d-flex align-items-center gap-1 ${
                autoKana ? 'btn-primary text-white shadow-xs' : 'btn-light text-muted'
              }`}
              style={{ fontSize: '11.5px' }}
              title="Tự động biến Romaji thành Hiragana khi gõ"
            >
              <span
                className="rounded-circle d-inline-block"
                style={{
                  width: 5,
                  height: 5,
                  backgroundColor: autoKana ? '#ffffff' : '#94a3b8'
                }}
              />
              <span>IME {autoKana ? 'Bật' : 'Tắt'}</span>
            </button>

            {/* Reset Button */}
            <button
              type="button"
              onClick={handleReset}
              className="btn btn-sm btn-light rounded-circle border p-1 d-flex align-items-center justify-content-center"
              style={{ width: 30, height: 30 }}
              title="Làm lại từ đầu"
            >
              <RotateCcw size={13} className="text-secondary" />
            </button>
          </div>
        </div>

        {/* Row 2: Segmented Switchers (Prompt Type + Zen/Grid View) */}
        <div className="d-flex justify-content-between align-items-center gap-2 flex-wrap pt-2 border-top border-slate-100">
          {/* Prompt Mode: Nghĩa -> Kana vs Kanji -> Kana */}
          <div className="segmented-control" style={{ padding: '2px' }}>
            <button
              type="button"
              onClick={() => {
                if (inputMode !== 'vi_to_jp') {
                  setInputMode('vi_to_jp');
                  handleReset();
                }
              }}
              className={`segmented-item py-1 px-2.5 ${inputMode === 'vi_to_jp' ? 'active' : ''}`}
              style={{ fontSize: '12px' }}
            >
              <span className="d-inline-flex align-items-center gap-1">
                <Languages size={13} />
                <span>Nghĩa ➔ Kana</span>
              </span>
            </button>
            <button
              type="button"
              onClick={() => {
                if (inputMode !== 'jp_to_jp') {
                  setInputMode('jp_to_jp');
                  handleReset();
                }
              }}
              className={`segmented-item py-1 px-2.5 ${inputMode === 'jp_to_jp' ? 'active' : ''}`}
              style={{ fontSize: '12px' }}
            >
              <span className="d-inline-flex align-items-center gap-1">
                <BookOpen size={13} />
                <span>Kanji ➔ Kana</span>
              </span>
            </button>
          </div>

          {/* View Mode: Zen Focus vs Grid View */}
          <div className="d-flex align-items-center gap-1 bg-light rounded-pill p-0.5 border">
            <button
              type="button"
              onClick={() => setViewLayout('zen')}
              className={`btn btn-sm rounded-pill py-0.5 px-2.5 fw-bold ${
                viewLayout === 'zen' ? 'btn-primary text-white shadow-xs' : 'text-muted border-0 bg-transparent'
              }`}
              style={{ fontSize: '11.5px' }}
            >
              <Target size={12} className="me-1" />
              <span>Từng từ</span>
            </button>
            <button
              type="button"
              onClick={() => setViewLayout('grid')}
              className={`btn btn-sm rounded-pill py-0.5 px-2.5 fw-bold ${
                viewLayout === 'grid' ? 'btn-primary text-white shadow-xs' : 'text-muted border-0 bg-transparent'
              }`}
              style={{ fontSize: '11.5px' }}
            >
              <LayoutGrid size={12} className="me-1" />
              <span>Tất cả</span>
            </button>
          </div>
        </div>

        {/* Row 3: 4 Clean Metrics Bar */}
        <div className="row g-1.5 mt-2 text-center">
          <div className="col-3">
            <div className="p-1.5 rounded-3 bg-light border">
              <small className="text-muted d-block" style={{ fontSize: '10px' }}>Đã làm</small>
              <span className="fw-black text-navy-dark" style={{ fontSize: '13px' }}>
                {answeredCount}/{total}
              </span>
            </div>
          </div>
          <div className="col-3">
            <div className="p-1.5 rounded-3 border" style={{ background: '#ecfdf5', borderColor: '#a7f3d0', color: '#059669' }}>
              <small className="d-block" style={{ fontSize: '10px' }}>Chính xác</small>
              <span className="fw-black" style={{ fontSize: '13px' }}>{correctCount}</span>
            </div>
          </div>
          <div className="col-3">
            <div className="p-1.5 rounded-3 border" style={{ background: '#fef2f2', borderColor: '#fecaca', color: '#dc2626' }}>
              <small className="d-block" style={{ fontSize: '10px' }}>Chưa đúng</small>
              <span className="fw-black" style={{ fontSize: '13px' }}>{wrongCount}</span>
            </div>
          </div>
          <div className="col-3">
            <div className="p-1.5 rounded-3 border" style={{ background: '#eff6ff', borderColor: '#bfdbfe', color: '#2563eb' }}>
              <small className="d-block" style={{ fontSize: '10px' }}>Độ chuẩn</small>
              <span className="fw-black" style={{ fontSize: '13px' }}>{accuracyRate}%</span>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-2.5">
          <Progress
            value={progressPercent}
            color="primary"
            style={{ height: '4px', borderRadius: '4px', background: 'var(--slate-100)' }}
          />
        </div>
      </div>

      {/* ── 2. MAIN PRACTICE WORKSPACE ── */}
      {loading ? (
        <div className="text-center py-5">
          <Spinner color="primary" />
          <p className="mt-2 text-muted small">Đang chuẩn bị từ vựng Bài {lessonNum}...</p>
        </div>
      ) : vocabList.length === 0 ? (
        <div className="p-5 text-center bg-white rounded-4 border shadow-xs">
          <BookOpen size={40} className="text-muted mb-2 opacity-50" />
          <h6 className="fw-bold text-navy-dark">Không có từ vựng nào trong bài này</h6>
        </div>
      ) : viewLayout === 'zen' ? (
        /* ── WORKSPACE A: ZEN FOCUS MODE (SINGLE CARD TYPING) ── */
        <div style={{ maxWidth: '640px', margin: '0 auto' }}>
          {currentZenWord && (
            <Card
              className={`border-0 shadow-sm rounded-4 position-relative overflow-hidden ${
                zenShake ? 'shake-anim' : ''
              }`}
              style={{
                background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
                border: '1px solid var(--slate-200)',
                boxShadow: '0 10px 30px rgba(15, 23, 42, 0.06)'
              }}
            >
              {/* Floating +10 XP Celebration */}
              {floatingXp && (
                <div className="floating-xp-badge">
                  +10 XP ✨ Chính xác!
                </div>
              )}

              <CardBody className="p-3.5 p-sm-4 text-center">
                {/* Top Badge Row */}
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div className="d-flex align-items-center gap-1.5">
                    <span className="badge bg-light text-secondary border fw-bold px-2 py-1" style={{ fontSize: '11px' }}>
                      Từ {zenIndex + 1} / {total}
                    </span>
                    {combo >= 2 && (
                      <span className="badge bg-warning bg-opacity-20 text-dark fw-bold px-2 py-1 d-inline-flex align-items-center gap-1" style={{ fontSize: '11px' }}>
                        <Flame size={12} className="text-danger" />
                        <span>Streak x{combo}</span>
                      </span>
                    )}
                  </div>

                  {/* Audio Tokyo Pronunciation Button */}
                  <button
                    type="button"
                    onClick={() => speakJapanese(getCleanExpected(currentZenWord))}
                    className="btn btn-sm btn-light rounded-circle border p-1 text-primary audio-btn d-flex align-items-center justify-content-center"
                    style={{ width: 34, height: 34 }}
                    title="Nghe phát âm chuẩn Tokyo"
                  >
                    <Volume2 size={16} />
                  </button>
                </div>

                {/* Prompt Display */}
                <div className="my-3 my-sm-4">
                  {inputMode === 'vi_to_jp' ? (
                    <>
                      {/* Vietnamese Meaning Prompt */}
                      <h3
                        className="fw-black text-navy-dark mb-1 tracking-tight"
                        style={{
                          fontSize: 'clamp(1.4rem, 4.5vw, 2.1rem)',
                          lineHeight: '1.3'
                        }}
                      >
                        {currentZenWord.clean_vietnamese || currentZenWord.vietnamese}
                      </h3>

                      {/* Kanji Hint (if exists) */}
                      {currentZenWord.kanji && hasRealKanji(currentZenWord.kanji) && (
                        <div className="mt-1">
                          <span
                            className="badge bg-light text-navy-dark border font-monospace fw-bold px-2.5 py-1"
                            style={{ fontSize: '14px', letterSpacing: '0.04em' }}
                          >
                            Hán tự: {currentZenWord.kanji}
                          </span>
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      {/* Kanji Prompt */}
                      <h1
                        className="fw-black text-navy-dark font-monospace mb-1 tracking-tight"
                        style={{
                          fontSize: 'clamp(2rem, 7vw, 3.2rem)',
                          fontFamily: "'Noto Sans JP', 'Hiragino Sans', 'Yu Gothic', sans-serif"
                        }}
                      >
                        {currentZenWord.kanji && hasRealKanji(currentZenWord.kanji)
                          ? currentZenWord.kanji
                          : (currentZenWord.clean_kana || currentZenWord.kana)}
                      </h1>

                      {/* Vietnamese Meaning Subtitle */}
                      <div className="text-muted fw-semibold" style={{ fontSize: '14.5px' }}>
                        {currentZenWord.clean_vietnamese || currentZenWord.vietnamese}
                      </div>
                    </>
                  )}
                </div>

                {/* Interactive Typing Input Box */}
                <div className="my-3 position-relative" style={{ maxWidth: '420px', margin: '0 auto' }}>
                  <Input
                    innerRef={zenInputRef}
                    type="text"
                    autoFocus
                    placeholder="Gõ đáp án Kana (VD: arigatou)..."
                    value={userInputs[currentZenWord.id] || ''}
                    onChange={(e) => handleInputChange(currentZenWord.id, e.target.value, getCleanExpected(currentZenWord))}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleEvaluate(currentZenWord.id, getCleanExpected(currentZenWord));
                      } else if (e.key === 'Tab') {
                        e.preventDefault();
                        handleRevealAnswer(currentZenWord.id);
                      }
                    }}
                    className={`text-center fw-bold font-monospace shadow-xs ${
                      checkResults[currentZenWord.id] === true
                        ? 'is-valid'
                        : checkResults[currentZenWord.id] === false
                        ? 'is-invalid'
                        : ''
                    }`}
                    style={{
                      height: '52px',
                      fontSize: 'clamp(17px, 4.5vw, 21px)',
                      borderRadius: '14px',
                      borderColor:
                        checkResults[currentZenWord.id] === true
                          ? '#10b981'
                          : checkResults[currentZenWord.id] === false
                          ? '#ef4444'
                          : '#cbd5e1',
                      background:
                        checkResults[currentZenWord.id] === true
                          ? '#ecfdf5'
                          : checkResults[currentZenWord.id] === false
                          ? '#fef2f2'
                          : '#ffffff',
                      letterSpacing: '0.04em'
                    }}
                  />

                  {/* Right Status Badge inside Input */}
                  {checkResults[currentZenWord.id] === true && (
                    <div className="position-absolute end-0 top-50 translate-middle-y me-3 text-success">
                      <CheckCircle2 size={20} />
                    </div>
                  )}
                  {checkResults[currentZenWord.id] === false && (
                    <div className="position-absolute end-0 top-50 translate-middle-y me-3 text-danger">
                      <XCircle size={20} />
                    </div>
                  )}
                </div>

                {/* Revealed Answer Pill (Minimal & Clean) */}
                {revealedIds[currentZenWord.id] && (
                  <div className="mb-3 p-2 rounded-3 bg-light border d-inline-flex align-items-center gap-2 animate-fade-in">
                    <span className="small text-muted fw-bold">Đáp án:</span>
                    <span className="fw-bold text-primary font-monospace fs-6">
                      {getCleanExpected(currentZenWord)}
                    </span>
                    <span className="text-muted small fst-italic">
                      [{currentZenWord.romaji}]
                    </span>
                  </div>
                )}

                {/* Zen Action Toolbar */}
                <div className="d-flex justify-content-center align-items-center gap-2 pt-2 border-top border-slate-100 flex-wrap">
                  <button
                    type="button"
                    onClick={() => handleRevealAnswer(currentZenWord.id)}
                    className="btn btn-sm btn-light rounded-pill px-3 py-1.5 fw-semibold border text-muted d-flex align-items-center gap-1"
                    style={{ fontSize: '12px' }}
                    title="Xem gợi ý cách đọc (Phím Tab)"
                  >
                    {revealedIds[currentZenWord.id] ? <EyeOff size={13} /> : <Eye size={13} />}
                    <span>{revealedIds[currentZenWord.id] ? 'Ẩn gợi ý' : 'Xem gợi ý'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleEvaluate(currentZenWord.id, getCleanExpected(currentZenWord))}
                    className="btn btn-sm btn-primary rounded-pill px-4 py-1.5 fw-bold shadow-xs d-flex align-items-center gap-1"
                    style={{ fontSize: '12px' }}
                  >
                    <Check size={14} />
                    <span>Kiểm tra (Enter)</span>
                  </button>
                </div>
              </CardBody>
            </Card>
          )}

          {/* Zen Navigation Controls (Prev / Next) */}
          <div className="d-flex justify-content-between align-items-center mt-3 px-1">
            <button
              type="button"
              disabled={zenIndex === 0}
              onClick={() => {
                sounds.playFlip();
                setZenIndex(prev => Math.max(0, prev - 1));
              }}
              className="btn btn-sm btn-light rounded-pill px-3 py-1.5 fw-bold border shadow-xs d-flex align-items-center gap-1"
              style={{ fontSize: '12px' }}
            >
              <ChevronLeft size={15} />
              <span>Từ trước</span>
            </button>

            <span className="text-muted small fw-semibold" style={{ fontSize: '12px' }}>
              Dùng phím <strong>Enter</strong> để kiểm tra và chuyển tiếp
            </span>

            <button
              type="button"
              disabled={zenIndex >= total - 1}
              onClick={() => {
                sounds.playFlip();
                setZenIndex(prev => Math.min(total - 1, prev + 1));
              }}
              className="btn btn-sm btn-light rounded-pill px-3 py-1.5 fw-bold border shadow-xs d-flex align-items-center gap-1"
              style={{ fontSize: '12px' }}
            >
              <span>Từ kế tiếp</span>
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      ) : (
        /* ── WORKSPACE B: CLEAN CARD GRID VIEW (ALL WORDS IN LESSON) ── */
        <>
          {/* Filter Chips Bar */}
          <div className="d-flex align-items-center gap-1.5 mb-3 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
            <button
              type="button"
              onClick={() => setActiveFilter('all')}
              className={`btn btn-sm rounded-pill px-3 py-1 fw-bold border flex-shrink-0 ${
                activeFilter === 'all' ? 'btn-primary text-white shadow-xs' : 'btn-light text-muted'
              }`}
              style={{ fontSize: '12px' }}
            >
              Tất cả ({total})
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter('unanswered')}
              className={`btn btn-sm rounded-pill px-3 py-1 fw-bold border flex-shrink-0 ${
                activeFilter === 'unanswered' ? 'btn-primary text-white shadow-xs' : 'btn-light text-muted'
              }`}
              style={{ fontSize: '12px' }}
            >
              Chưa làm ({total - answeredCount})
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter('wrong')}
              className={`btn btn-sm rounded-pill px-3 py-1 fw-bold border flex-shrink-0 ${
                activeFilter === 'wrong' ? 'btn-danger text-white shadow-xs' : 'btn-light text-danger'
              }`}
              style={{ fontSize: '12px' }}
            >
              Cần sửa ({wrongCount})
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter('correct')}
              className={`btn btn-sm rounded-pill px-3 py-1 fw-bold border flex-shrink-0 ${
                activeFilter === 'correct' ? 'btn-success text-white shadow-xs' : 'btn-light text-success'
              }`}
              style={{ fontSize: '12px' }}
            >
              Đã đúng ({correctCount})
            </button>
          </div>

          {/* Cards Grid: 2 columns on desktop, 1 column on mobile */}
          <Row className="g-2.5">
            {filteredVocabList.length === 0 ? (
              <Col xs={12}>
                <div className="p-4 text-center text-muted small bg-white rounded-3 border">
                  Không có từ vựng nào khớp với bộ lọc
                </div>
              </Col>
            ) : (
              filteredVocabList.map((item, idx) => {
                const res = checkResults[item.id];
                const cleanExpected = getCleanExpected(item);
                const isRevealed = revealedIds[item.id];
                const cleanMeaning = item.clean_vietnamese || item.vietnamese;

                return (
                  <Col xs={12} md={6} key={item.id}>
                    <div
                      className="p-3 rounded-4 bg-white border shadow-xs d-flex flex-column gap-2 transition-all"
                      style={{
                        borderColor:
                          res === true
                            ? 'var(--success-border)'
                            : res === false
                            ? 'var(--danger-border)'
                            : 'var(--slate-200)',
                        background:
                          res === true
                            ? '#f0fdf4'
                            : res === false
                            ? '#fef2f2'
                            : '#ffffff'
                      }}
                    >
                      {/* Top Prompt Row */}
                      <div className="d-flex justify-content-between align-items-center">
                        <div className="d-flex align-items-center gap-1.5 min-w-0 flex-grow-1">
                          <span className="badge bg-light text-secondary border fw-bold flex-shrink-0" style={{ fontSize: '10.5px' }}>
                            #{idx + 1}
                          </span>

                          {inputMode === 'vi_to_jp' ? (
                            <div className="min-w-0">
                              <span className="fw-bold text-dark text-truncate d-block" style={{ fontSize: '13.5px' }}>
                                {cleanMeaning}
                              </span>
                              {item.kanji && hasRealKanji(item.kanji) && (
                                <span className="small text-muted font-monospace" style={{ fontSize: '11px' }}>
                                  Hán tự: <strong>{item.kanji}</strong>
                                </span>
                              )}
                            </div>
                          ) : (
                            <div className="min-w-0">
                              <span className="fw-black text-navy-dark font-monospace fs-5 d-block">
                                {item.kanji && hasRealKanji(item.kanji) ? item.kanji : cleanExpected}
                              </span>
                              <span className="small text-muted text-truncate d-block" style={{ fontSize: '11.5px' }}>
                                {cleanMeaning}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Speaker Button */}
                        <button
                          type="button"
                          onClick={() => speakJapanese(cleanExpected)}
                          className="btn btn-sm btn-light rounded-circle border p-1 text-primary audio-btn d-flex align-items-center justify-content-center flex-shrink-0 ms-2"
                          style={{ width: 30, height: 30 }}
                          title="Nghe phát âm chuẩn"
                        >
                          <Volume2 size={13} />
                        </button>
                      </div>

                      {/* Typing Input & Actions */}
                      <div className="d-flex align-items-center gap-1.5">
                        <Input
                          type="text"
                          placeholder="Gõ Kana..."
                          value={userInputs[item.id] || ''}
                          onChange={(e) => handleInputChange(item.id, e.target.value, cleanExpected)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleEvaluate(item.id, cleanExpected);
                          }}
                          onBlur={() => {
                            if ((userInputs[item.id] || '').trim()) handleEvaluate(item.id, cleanExpected);
                          }}
                          className={`fw-bold font-monospace flex-grow-1 ${
                            res === true ? 'is-valid' : res === false ? 'is-invalid' : ''
                          }`}
                          style={{
                            height: '38px',
                            borderRadius: '10px',
                            fontSize: '13.5px',
                            letterSpacing: '0.02em'
                          }}
                        />

                        {/* Evaluate Check button */}
                        <button
                          type="button"
                          onClick={() => handleEvaluate(item.id, cleanExpected)}
                          className="btn btn-sm btn-light border p-1 text-primary shadow-xs rounded-3 d-flex align-items-center justify-content-center flex-shrink-0"
                          style={{ width: 34, height: 34 }}
                          title="Kiểm tra"
                        >
                          <Check size={14} />
                        </button>

                        {/* Peek Hint button */}
                        <button
                          type="button"
                          onClick={() => handleRevealAnswer(item.id)}
                          className="btn btn-sm btn-light border p-1 text-muted shadow-xs rounded-3 d-flex align-items-center justify-content-center flex-shrink-0"
                          style={{ width: 34, height: 34 }}
                          title="Xem đáp án"
                        >
                          <Eye size={14} />
                        </button>
                      </div>

                      {/* Revealed Hint Pill */}
                      {isRevealed && (
                        <div className="p-1.5 rounded-2 bg-light border small text-dark d-flex align-items-center gap-1.5 animate-fade-in" style={{ fontSize: '11px' }}>
                          <span className="text-muted">Đáp án:</span>
                          <span className="fw-bold text-primary font-monospace">{cleanExpected}</span>
                          <span className="text-muted fst-italic">[{item.romaji}]</span>
                        </div>
                      )}
                    </div>
                  </Col>
                );
              })
            )}
          </Row>
        </>
      )}
    </Container>
  );
};

export default PracticeInputPage;
