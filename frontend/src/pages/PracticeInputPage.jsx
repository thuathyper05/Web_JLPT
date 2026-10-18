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
  Spinner,
  Modal,
  ModalBody
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
  ChevronDown,
  Zap,
  Target,
  Flame,
  LayoutGrid,
  Check,
  RefreshCw,
  Trophy,
  ArrowRight,
  X
} from 'lucide-react';
import * as wanakana from 'wanakana';
import { vocabService, speakJapanese } from '../services/api';
import { sounds } from '../services/sounds';
import { useApp } from '../context/AppContext';
import { awardGardenWater } from '../services/gardenRewards';
import confetti from 'canvas-confetti';

const hasRealKanji = (str) => /[\u4E00-\u9FAF\u3400-\u4DBF]/.test(str || '');

// Smart normalization for matching Vietnamese meanings
const normalizeVi = (str) => {
  return (str || '')
    .toLowerCase()
    .trim()
    .replace(/[.,!?:;"'()\[\]{}]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
};

const checkVietnameseMatch = (userInput, targetMeaning) => {
  if (!userInput || !targetMeaning) return false;
  const u = normalizeVi(userInput);
  const t = normalizeVi(targetMeaning);
  if (u === t) return true;

  // Split multiple meanings by slash, comma, semicolon, dash, or parenthesis
  const parts = targetMeaning
    .split(/[\/,;—–()]/)
    .map(normalizeVi)
    .filter(Boolean);

  if (parts.includes(u)) return true;

  // Partial phrase matching for definitions like "người kia (vị kia)"
  return parts.some(p => p === u || p.startsWith(u + ' ') || p.endsWith(' ' + u));
};

const checkKanaMatch = (userInput, targetKana) => {
  if (!userInput || !targetKana) return false;
  const cleanInput = (userInput || '').trim().replace(/[［\[］\]]/g, '');
  const cleanTarget = (targetKana || '').trim().replace(/[［\[］\]]/g, '');
  return cleanInput === cleanTarget;
};

const PracticeInputPage = ({ initialLesson = 1, onNavigate }) => {
  const { updateProgress } = useApp();
  const [lessonNum, setLessonNum] = useState(initialLesson);
  const [vocabList, setVocabList] = useState([]);
  const [loading, setLoading] = useState(true);

  // 2 Core Practice Modes: 'jp_to_vi' (Nhật -> Việt) | 'vi_to_jp' (Việt -> Nhật)
  const [practiceMode, setPracticeMode] = useState('jp_to_vi'); 

  // View Layout: 'zen' (Tập trung từng từ) | 'grid' (Danh sách tất cả)
  const [viewLayout, setViewLayout] = useState('zen');

  // IME Wanakana switch (only used when typing Japanese Kana in 'vi_to_jp' mode)
  const [autoKana, setAutoKana] = useState(true);

  // Lesson Picker Modal state (eliminates dropdown glitches on mobile)
  const [lessonModalOpen, setLessonModalOpen] = useState(false);

  // Zen Mode Navigation & Effects
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
  }, [zenIndex, viewLayout, loading, practiceMode]);

  const getCleanKana = (item) => {
    const raw = item.clean_kana || item.kana || '';
    return raw.replace(/[［\[］\]]/g, '').trim();
  };

  const getCleanVietnamese = (item) => {
    return (item.clean_vietnamese || item.vietnamese || '').trim();
  };

  const handleInputChange = (id, rawValue, item) => {
    let finalValue = rawValue;

    // Apply Wanakana ONLY if practiceMode is 'vi_to_jp' (typing Japanese Kana) and autoKana is active
    if (practiceMode === 'vi_to_jp' && autoKana) {
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

    // Instant match check
    let isInstantMatch = false;
    if (practiceMode === 'vi_to_jp') {
      isInstantMatch = checkKanaMatch(trimmedInput, getCleanKana(item));
    } else {
      isInstantMatch = checkVietnameseMatch(trimmedInput, getCleanVietnamese(item));
    }

    if (isInstantMatch) {
      if (checkResults[id] !== true) {
        setCheckResults(prev => ({ ...prev, [id]: true }));
        sounds.playCorrect();
        speakJapanese(getCleanKana(item));
        updateProgress(id, 'mastered', true).catch(() => {});
        awardGardenWater(2, 'Luyện gõ đúng', [item]);
        setCombo(prev => prev + 1);
        setFloatingXp(true);
        setTimeout(() => setFloatingXp(false), 850);

        // In Zen mode, auto-advance smoothly
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

  // Evaluate on Enter or Check trigger
  const handleEvaluate = (id, item) => {
    const val = (userInputs[id] || '').trim();
    if (!val) return;

    if (checkResults[id] === true) {
      // Already correct, move to next word in Zen mode
      if (viewLayout === 'zen' && zenIndex < vocabList.length - 1) {
        setZenIndex(prev => prev + 1);
      }
      return;
    }

    let isCorrect = false;
    if (practiceMode === 'vi_to_jp') {
      isCorrect = checkKanaMatch(val, getCleanKana(item));
    } else {
      isCorrect = checkVietnameseMatch(val, getCleanVietnamese(item));
    }

    setCheckResults(prev => ({ ...prev, [id]: isCorrect }));

    if (isCorrect) {
      sounds.playCorrect();
      speakJapanese(getCleanKana(item));
      updateProgress(id, 'mastered', true).catch(() => {});
      awardGardenWater(2, 'Luyện gõ đúng', [item]);
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
      awardGardenWater(25, 'Hoàn thành bài luyện gõ', vocabList);
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
      {/* ── 1. UNIFIED SYSTEMIC PAGE HEADER ── */}
      <div className="app-page-header">
        <div className="d-flex justify-content-between align-items-start flex-wrap gap-3">
          <div>
            <div className="app-header-tag">
              <Keyboard size={13} />
              <span>LUYỆN GÕ PHẢN XẠ • MINNA NO NIHONGO</span>
            </div>
            <h1 className="app-header-title">
              Luyện Gõ Từ Vựng
            </h1>
            <p className="app-header-subtitle">
              Phản xạ song ngữ gõ Romaji chuyển Hiragana hoặc gõ nghĩa Tiếng Việt, tăng tốc độ truy xuất trí nhớ.
            </p>
          </div>

          {/* Right Action Pills: Custom Lesson Picker + IME + Reset */}
          <div className="d-flex align-items-center gap-2 flex-wrap ms-auto">
            <button
              type="button"
              onClick={() => { sounds.playFlip?.(); setLessonModalOpen(true); }}
              className="app-btn-secondary"
              style={{ height: '38px', padding: '0 16px', fontSize: '13px' }}
              title="Bấm để chọn bài học Minna no Nihongo"
            >
              <BookOpen size={14} className="text-primary" />
              <span>Bài {lessonNum < 10 ? `0${lessonNum}` : lessonNum}</span>
              <ChevronDown size={13} className="text-muted ms-1" />
            </button>

            {/* IME Auto-Kana Toggle (Visible when in vi_to_jp mode) */}
            {practiceMode === 'vi_to_jp' && (
              <button
                type="button"
                onClick={() => setAutoKana(!autoKana)}
                className={`btn btn-sm rounded-pill px-3 py-1 fw-bold border d-flex align-items-center gap-1.5 ${
                  autoKana ? 'btn-primary text-white shadow-xs' : 'btn-light text-muted'
                }`}
                style={{ fontSize: '12px', height: '38px' }}
                title="Tự động biến Romaji thành Hiragana/Katakana khi gõ"
              >
                <span
                  className="rounded-circle d-inline-block"
                  style={{
                    width: 6,
                    height: 6,
                    backgroundColor: autoKana ? '#ffffff' : '#94a3b8'
                  }}
                />
                <span>IME {autoKana ? 'Bật' : 'Tắt'}</span>
              </button>
            )}

            {/* Reset Button */}
            <button
              type="button"
              onClick={handleReset}
              className="app-icon-btn"
              title="Làm lại bài này từ đầu"
            >
              <RotateCcw size={16} />
            </button>
          </div>
        </div>

        {/* Row 2: 2 Core Practice Modes & View Mode Switcher */}
        <div className="d-flex justify-content-between align-items-center gap-2 flex-wrap pt-2 border-top border-slate-100">
          {/* Mode Switcher: Nhìn Nhật -> Gõ Việt vs Nhìn Việt -> Gõ Nhật */}
          <div className="segmented-control" style={{ padding: '3px' }}>
            <button
              type="button"
              onClick={() => {
                if (practiceMode !== 'jp_to_vi') {
                  sounds.playFlip?.();
                  setPracticeMode('jp_to_vi');
                  handleReset();
                }
              }}
              className={`segmented-item py-1.5 px-3.5 ${practiceMode === 'jp_to_vi' ? 'active' : ''}`}
              style={{ fontSize: '12.5px' }}
            >
              <span className="fw-bold">
                Nhìn tiếng Nhật ➔ Gõ tiếng Việt
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (practiceMode !== 'vi_to_jp') {
                  sounds.playFlip?.();
                  setPracticeMode('vi_to_jp');
                  handleReset();
                }
              }}
              className={`segmented-item py-1.5 px-3.5 ${practiceMode === 'vi_to_jp' ? 'active' : ''}`}
              style={{ fontSize: '12.5px' }}
            >
              <span className="fw-bold">
                Nhìn tiếng Việt ➔ Gõ tiếng Nhật
              </span>
            </button>
          </div>

          {/* View Mode Toggle: Zen Focus vs Grid List */}
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
        <div style={{ maxWidth: '640px', margin: '0 auto', width: '100%' }}>
          {currentZenWord && (
            <div
              className={`zen-focus-card position-relative ${
                zenShake ? 'shake-anim' : ''
              }`}
            >
              {/* Floating +10 XP Celebration */}
              {floatingXp && (
                <div className="floating-xp-badge">
                  +10 XP · Đã Thành Thạo!
                </div>
              )}

              <div className="text-center">
                {/* Top Badge Row */}
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div className="d-flex align-items-center gap-1.5">
                    <span className="badge bg-light text-secondary border fw-bold px-2.5 py-1" style={{ fontSize: '11px' }}>
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
                    onClick={() => speakJapanese(getCleanKana(currentZenWord))}
                    className="btn btn-sm btn-light rounded-circle border p-1 text-primary audio-btn d-flex align-items-center justify-content-center"
                    style={{ width: 34, height: 34 }}
                    title="Nghe phát âm chuẩn Tokyo"
                  >
                    <Volume2 size={16} />
                  </button>
                </div>

                {/* Prompt Display */}
                <div className="my-3 my-sm-4">
                  {practiceMode === 'jp_to_vi' ? (
                    <>
                      {/* PROMPT: JAPANESE WORD (KANJI + KANA) */}
                      {currentZenWord.kanji && hasRealKanji(currentZenWord.kanji) ? (
                        <>
                          <h1 className="zen-kanji-title">
                            {currentZenWord.kanji}
                          </h1>
                          <div className="zen-kana-sub">
                            {getCleanKana(currentZenWord)}
                          </div>
                        </>
                      ) : (
                        <h1 className="zen-kanji-title" style={{ fontSize: 'clamp(2rem, 7vw, 3rem)' }}>
                          {getCleanKana(currentZenWord)}
                        </h1>
                      )}
                    </>
                  ) : (
                    <>
                      {/* PROMPT: VIETNAMESE MEANING */}
                      <h2 className="zen-meaning-display">
                        {getCleanVietnamese(currentZenWord)}
                      </h2>

                      {/* Subtle Kanji reference (if exists, without noisy 'Hán tự:' label) */}
                      {currentZenWord.kanji && hasRealKanji(currentZenWord.kanji) && (
                        <div className="mt-2">
                          <span
                            className="badge bg-light text-secondary border font-monospace fw-bold px-3 py-1 rounded-pill"
                            style={{ fontSize: '13.5px', letterSpacing: '0.04em' }}
                          >
                            {currentZenWord.kanji}
                          </span>
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* Interactive Typing Input Box */}
                <div className="my-3 position-relative" style={{ maxWidth: '420px', margin: '0 auto' }}>
                  <Input
                    innerRef={zenInputRef}
                    type="text"
                    autoFocus
                    placeholder={
                      practiceMode === 'jp_to_vi'
                        ? 'Gõ nghĩa Tiếng Việt (VD: tôi)...'
                        : 'Gõ Romaji (VD: watashi ➔ わたし)...'
                    }
                    value={userInputs[currentZenWord.id] || ''}
                    onChange={(e) => handleInputChange(currentZenWord.id, e.target.value, currentZenWord)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleEvaluate(currentZenWord.id, currentZenWord);
                      } else if (e.key === 'Tab') {
                        e.preventDefault();
                        handleRevealAnswer(currentZenWord.id);
                      }
                    }}
                    className={`text-center fw-bold shadow-xs ${
                      practiceMode === 'vi_to_jp' ? 'font-monospace' : ''
                    } ${
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
                      letterSpacing: practiceMode === 'vi_to_jp' ? '0.04em' : 'normal'
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

                {/* Revealed Answer Pill (Minimalist & Clean) */}
                {revealedIds[currentZenWord.id] && (
                  <div className="mb-3 px-3 py-1.5 rounded-pill bg-primary bg-opacity-10 border border-primary border-opacity-25 d-inline-flex align-items-center gap-2 animate-fade-in">
                    <span className="fw-black text-primary fs-6 font-monospace">
                      {practiceMode === 'jp_to_vi'
                        ? getCleanVietnamese(currentZenWord)
                        : getCleanKana(currentZenWord)}
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
                    title="Xem gợi ý đáp án (Phím Tab)"
                  >
                    {revealedIds[currentZenWord.id] ? <EyeOff size={13} /> : <Eye size={13} />}
                    <span>{revealedIds[currentZenWord.id] ? 'Ẩn đáp án' : 'Xem đáp án'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleEvaluate(currentZenWord.id, currentZenWord)}
                    className="btn btn-sm btn-primary rounded-pill px-4 py-1.5 fw-bold shadow-xs d-flex align-items-center gap-1"
                    style={{ fontSize: '12px' }}
                  >
                    <Check size={14} />
                    <span>Kiểm tra (Enter)</span>
                  </button>
                </div>
              </div>
            </div>
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
              Dùng phím <strong>Enter</strong> để kiểm tra & chuyển tiếp
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
                const cleanKana = getCleanKana(item);
                const cleanMeaning = getCleanVietnamese(item);
                const isRevealed = revealedIds[item.id];

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

                          {practiceMode === 'jp_to_vi' ? (
                            /* Prompt: Japanese word -> User types Vietnamese */
                            <div className="min-w-0">
                              <span className="fw-black text-navy-dark font-monospace fs-5 d-block">
                                {item.kanji && hasRealKanji(item.kanji) ? item.kanji : cleanKana}
                              </span>
                              {item.kanji && hasRealKanji(item.kanji) && (
                                <span className="small text-primary font-monospace fw-bold d-block" style={{ fontSize: '12px' }}>
                                  {cleanKana}
                                </span>
                              )}
                            </div>
                          ) : (
                            /* Prompt: Vietnamese meaning -> User types Japanese */
                            <div className="min-w-0">
                              <span className="fw-bold text-dark text-truncate d-block" style={{ fontSize: '13.5px' }}>
                                {cleanMeaning}
                              </span>
                              {item.kanji && hasRealKanji(item.kanji) && (
                                <span className="badge bg-slate-100 text-slate-700 border font-monospace px-2 py-0.5" style={{ fontSize: '11.5px' }}>
                                  {item.kanji}
                                </span>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Speaker Button */}
                        <button
                          type="button"
                          onClick={() => speakJapanese(cleanKana)}
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
                          placeholder={
                            practiceMode === 'jp_to_vi'
                              ? 'Gõ nghĩa tiếng Việt...'
                              : 'Gõ Kana...'
                          }
                          value={userInputs[item.id] || ''}
                          onChange={(e) => handleInputChange(item.id, e.target.value, item)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleEvaluate(item.id, item);
                          }}
                          onBlur={() => {
                            if ((userInputs[item.id] || '').trim()) handleEvaluate(item.id, item);
                          }}
                          className={`fw-bold flex-grow-1 ${
                            practiceMode === 'vi_to_jp' ? 'font-monospace' : ''
                          } ${
                            res === true ? 'is-valid' : res === false ? 'is-invalid' : ''
                          }`}
                          style={{
                            height: '38px',
                            borderRadius: '10px',
                            fontSize: '13.5px'
                          }}
                        />

                        {/* Evaluate Check button */}
                        <button
                          type="button"
                          onClick={() => handleEvaluate(item.id, item)}
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

                      {/* Revealed Hint Pill (Clean & Minimalist) */}
                      {isRevealed && (
                        <div className="p-1.5 rounded-2 bg-light border small text-dark d-flex align-items-center gap-1.5 animate-fade-in" style={{ fontSize: '11.5px' }}>
                          <span className="fw-bold text-primary">
                            {practiceMode === 'jp_to_vi' ? cleanMeaning : cleanKana}
                          </span>
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

      {/* ── 3. VISUAL 25-LESSON SELECTOR MODAL (100% BUG-FREE & RESPONSIVE) ── */}
      <Modal
        isOpen={lessonModalOpen}
        toggle={() => setLessonModalOpen(!lessonModalOpen)}
        centered
        className="jlpt-modal"
        style={{ maxWidth: '460px' }}
      >
        <ModalBody className="p-0 rounded-4 overflow-hidden bg-white shadow-xl border-0">
          {/* Header */}
          <div
            className="p-3 text-white d-flex justify-content-between align-items-center"
            style={{ background: 'linear-gradient(135deg, #091224 0%, #1e3a8a 100%)' }}
          >
            <div className="d-flex align-items-center gap-2">
              <div
                className="d-flex align-items-center justify-content-center rounded-circle"
                style={{ width: 32, height: 32, background: 'rgba(255,255,255,0.14)' }}
              >
                <BookOpen size={16} />
              </div>
              <div>
                <h6 className="fw-bold mb-0 text-white" style={{ fontSize: '14.5px' }}>
                  Chọn Bài Học Luyện Gõ
                </h6>
                <small className="text-white text-opacity-70" style={{ fontSize: '11px' }}>
                  25 Bài Minna no Nihongo N5
                </small>
              </div>
            </div>
            <button
              type="button"
              className="btn-close btn-close-white"
              onClick={() => setLessonModalOpen(false)}
              aria-label="Đóng"
              style={{ fontSize: '10px' }}
            />
          </div>

          {/* 5x5 Grid of 25 Lessons */}
          <div className="p-3 bg-light">
            <div className="row g-2">
              {Array.from({ length: 25 }, (_, i) => i + 1).map((n) => {
                const isSelected = lessonNum === n;
                return (
                  <div className="col-3 col-sm-2" key={n}>
                    <button
                      type="button"
                      onClick={() => {
                        sounds.playCorrect?.();
                        setLessonNum(n);
                        setLessonModalOpen(false);
                      }}
                      className={`btn w-100 p-2 rounded-3 fw-bold d-flex flex-column align-items-center justify-content-center transition-all ${
                        isSelected
                          ? 'btn-primary text-white shadow-sm'
                          : 'btn-white bg-white text-dark border'
                      }`}
                      style={{
                        height: '52px',
                        borderColor: isSelected ? 'var(--primary)' : 'var(--slate-200)',
                        fontSize: '12px'
                      }}
                    >
                      <span style={{ fontSize: '10px', opacity: isSelected ? 0.85 : 0.6 }}>Bài</span>
                      <span className="fw-black" style={{ fontSize: '14px' }}>
                        {n < 10 ? `0${n}` : n}
                      </span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </ModalBody>
      </Modal>
    </Container>
  );
};

export default PracticeInputPage;
