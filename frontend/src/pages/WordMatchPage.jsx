import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Container, Spinner, Row, Col, Badge, Progress } from 'reactstrap';
import { 
  Zap, Trophy, RotateCcw, Play, Clock, Star, Volume2, VolumeX, 
  Flame, ChevronLeft, CheckCircle2, Sparkles, Award, Shield, Target,
  Layers, SlidersHorizontal, Check, BookOpen, AlertCircle, Eye,
  ArrowRight, Heart, BarChart3, Shuffle, RefreshCw, Sprout
} from 'lucide-react';
import { vocabService, speakJapanese, lessonService, srsService } from '../services/api';
import { sounds } from '../services/sounds';
import { useApp } from '../context/AppContext';
import confetti from 'canvas-confetti';

const GAME_DURATION = 60;
const PAIRS_COUNT = 5;

const PRESET_BUNDLES = [
  { label: 'Bài 1–5', desc: 'Cơ bản N5', lessons: [1, 2, 3, 4, 5] },
  { label: 'Bài 6–10', desc: 'Đời sống & Ăn uống', lessons: [6, 7, 8, 9, 10] },
  { label: 'Bài 11–15', desc: 'Thời gian & Địa điểm', lessons: [11, 12, 13, 14, 15] },
  { label: 'Bài 16–20', desc: 'Thể Te & Hành động', lessons: [16, 17, 18, 19, 20] },
  { label: 'Bài 21–25', desc: 'Ngữ pháp nâng cao', lessons: [21, 22, 23, 24, 25] },
  { label: 'Tất cả 25 bài', desc: '1,589 từ Minna', lessons: Array.from({ length: 25 }, (_, i) => i + 1) }
];

const WordMatchPage = ({ initialLesson = 1, onNavigate, onSelectLesson }) => {
  const { user, awardGardenWater } = useApp();
  const [selectedLessons, setSelectedLessons] = useState(() => new Set([initialLesson || 1]));
  const [selectionMode, setSelectionMode] = useState('single'); // 'single' | 'multi'
  const [gameMode, setGameMode] = useState('standard'); // 'standard' (60s) | 'blitz' (30s) | 'relax' (90s)
  const [lessons, setLessons] = useState([]);
  const [gameState, setGameState] = useState('setup'); // 'setup' | 'playing' | 'result'
  const [loading, setLoading] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Gameplay state
  const [allPairs, setAllPairs] = useState([]);
  const [leftCards, setLeftCards] = useState([]);
  const [rightCards, setRightCards] = useState([]);
  const [selectedLeft, setSelectedLeft] = useState(null);
  const [selectedRight, setSelectedRight] = useState(null);
  const [matchedPairs, setMatchedPairs] = useState(new Set());
  const [wrongPair, setWrongPair] = useState(null);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [initialDuration, setInitialDuration] = useState(GAME_DURATION);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [totalMatched, setTotalMatched] = useState(0);
  const [totalWrong, setTotalWrong] = useState(0);
  const [rounds, setRounds] = useState(0);
  const [floatingNotification, setFloatingNotification] = useState(null);
  const [shakeIds, setShakeIds] = useState(new Set());
  const [correctIds, setCorrectIds] = useState(new Set());
  const [matchedHistory, setMatchedHistory] = useState([]); // List of matched words for result review
  const [gardenPlanted, setGardenPlanted] = useState(false);
  const [highScore, setHighScore] = useState(() => parseInt(localStorage.getItem('word_match_highscore') || '0'));
  
  // Speed reflex tracking
  const lastMatchTimeRef = useRef(Date.now());
  const timerRef = useRef(null);
  const processingRef = useRef(false);

  const isFeverMode = combo >= 4;

  // Load lessons list
  useEffect(() => {
    lessonService.getLessons().then(r => setLessons(r.data || [])).catch(() => {});
  }, []);

  useEffect(() => {
    if (initialLesson) {
      setSelectedLessons(new Set([initialLesson]));
    }
  }, [initialLesson]);

  const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);

  const handleToggleLesson = (num) => {
    if (selectionMode === 'single') {
      setSelectedLessons(new Set([num]));
      onSelectLesson?.(num);
    } else {
      setSelectedLessons(prev => {
        const next = new Set(prev);
        if (next.has(num)) {
          if (next.size > 1) next.delete(num);
        } else {
          next.add(num);
        }
        return next;
      });
    }
  };

  const applyPreset = (presetLessons) => {
    setSelectionMode('multi');
    setSelectedLessons(new Set(presetLessons));
  };

  const loadNextRound = useCallback(async () => {
    try {
      const lessonsParam = Array.from(selectedLessons).join(',');
      // Send both lesson and lessons to guarantee compatibility with all server versions
      const res = await vocabService.getVocabularies({ lessons: lessonsParam, lesson: lessonsParam });
      let rawList = Array.isArray(res.data) ? res.data : (res.data?.data || []);

      // Strict client-side lesson filter: only keep vocabularies that strictly belong to selected lessons
      const validLessonSet = new Set(Array.from(selectedLessons).map(Number));
      let allVocabs = rawList.filter(v => {
        const lNum = Number(v.lesson_number ?? v.lesson_id);
        return validLessonSet.has(lNum);
      });

      // If backend returned empty for multi-lesson query, use rawList filtered
      if (!allVocabs.length && rawList.length) {
        allVocabs = rawList.filter(v => {
          const lNum = Number(v.lesson_number ?? v.lesson_id);
          return validLessonSet.size === 0 || validLessonSet.has(lNum);
        });
      }

      if (!allVocabs.length) return;

      const selected = shuffle(allVocabs).slice(0, PAIRS_COUNT);
      setAllPairs(selected);

      const hasRealKanji = (str) => Boolean(str && /[\u4E00-\u9FAF\u3400-\u4DBF]/.test(str));

      const leftItems = selected.map(v => {
        const hasKj = hasRealKanji(v.kanji);
        const text = hasKj ? v.kanji : (v.clean_kana || v.kana || v.word || '');
        const reading = hasKj ? (v.clean_kana || v.kana || v.reading || '') : '';
        return { 
          id: v.id, 
          text, 
          reading, 
          pairId: v.id, 
          side: 'left',
          rawItem: v
        };
      });

      const rightItems = shuffle(selected.map(v => {
        const text = v.clean_vietnamese || v.vietnamese || v.meaning || '';
        return { 
          id: `r-${v.id}`, 
          text, 
          pairId: v.id, 
          side: 'right',
          rawItem: v
        };
      }));

      setLeftCards(leftItems);
      setRightCards(rightItems);
      setMatchedPairs(new Set());
      setSelectedLeft(null);
      setSelectedRight(null);
      setWrongPair(null);
      setShakeIds(new Set());
      setCorrectIds(new Set());
      setRounds(r => r + 1);
      lastMatchTimeRef.current = Date.now();
      processingRef.current = false;
    } catch (err) {
      console.error('loadNextRound error:', err);
      processingRef.current = false;
    }
  }, [selectedLessons]);

  const startGame = async () => {
    setLoading(true);
    setScore(0);
    setCombo(0);
    setMaxCombo(0);
    setTotalMatched(0);
    setTotalWrong(0);
    setRounds(0);
    setMatchedHistory([]);

    const duration = gameMode === 'blitz' ? 30 : gameMode === 'relax' ? 90 : 60;
    setInitialDuration(duration);
    setTimeLeft(duration);
    setGameState('playing');
    await loadNextRound();
    setLoading(false);
  };

  // Timer Countdown
  useEffect(() => {
    if (gameState !== 'playing') return;
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          setGameState('result');
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [gameState]);

  // Handle Matching Logic
  useEffect(() => {
    if (!selectedLeft || !selectedRight || processingRef.current) return;
    processingRef.current = true;

    if (selectedLeft.pairId === selectedRight.pairId) {
      // ✅ Correct match
      const now = Date.now();
      const matchSpeedSec = ((now - lastMatchTimeRef.current) / 1000).toFixed(1);
      lastMatchTimeRef.current = now;

      if (soundEnabled) {
        sounds.playCombo?.(combo + 1);
        speakJapanese(selectedLeft.text);
      }

      const newMatchedPairs = new Set([...matchedPairs, selectedLeft.pairId]);
      setMatchedPairs(newMatchedPairs);
      setCorrectIds(prev => new Set([...prev, selectedLeft.id, selectedRight.id]));

      // Save to review history
      if (selectedLeft.rawItem) {
        setMatchedHistory(prev => {
          if (prev.some(p => p.id === selectedLeft.rawItem.id)) return prev;
          return [...prev, selectedLeft.rawItem];
        });
      }

      const newCombo = combo + 1;
      const newMaxCombo = Math.max(maxCombo, newCombo);
      const isSuperSpeed = matchSpeedSec <= 1.4 && totalMatched > 0;
      
      const basePoints = 10;
      const comboBonus = newCombo > 1 ? (newCombo - 1) * 5 : 0;
      const speedBonus = isSuperSpeed ? 5 : 0;
      let roundGained = basePoints + comboBonus + speedBonus;
      if (newCombo >= 4) {
        roundGained = Math.round(roundGained * 1.5); // 1.5x Fever
      }

      setCombo(newCombo);
      setMaxCombo(newMaxCombo);
      setScore(s => s + roundGained);
      setTotalMatched(t => t + 1);

      let notifyText = `+${roundGained} ĐIỂM`;
      if (newCombo >= 4) {
        notifyText = `FEVER x${newCombo}! +${roundGained}`;
      } else if (newCombo > 1) {
        notifyText = `COMBO x${newCombo}! +${roundGained}`;
      }
      if (isSuperSpeed) {
        notifyText += ` • Phản xạ ${matchSpeedSec}s!`;
      }
      setFloatingNotification({ text: notifyText, id: Date.now() });
      setTimeout(() => setFloatingNotification(null), 850);

      setTimeout(() => {
        setSelectedLeft(null);
        setSelectedRight(null);

        if (newMatchedPairs.size === PAIRS_COUNT) {
          confetti({
            particleCount: 55,
            spread: 65,
            origin: { y: 0.55 },
            colors: ['#2563eb', '#10b981', '#f59e0b', '#ec4899']
          });
          setTimeout(() => {
            loadNextRound();
          }, 350);
        } else {
          processingRef.current = false;
        }
      }, 240);
    } else {
      // ❌ Wrong match
      if (soundEnabled) {
        sounds.playWrong?.();
      }
      setCombo(0);
      setTotalWrong(t => t + 1);
      setWrongPair({ left: selectedLeft.id, right: selectedRight.id });
      setShakeIds(new Set([selectedLeft.id, selectedRight.id]));

      setTimeout(() => {
        setWrongPair(null);
        setShakeIds(new Set());
        setSelectedLeft(null);
        setSelectedRight(null);
        processingRef.current = false;
      }, 480);
    }
  }, [selectedLeft, selectedRight, combo, matchedPairs, maxCombo, soundEnabled, totalMatched, loadNextRound]);

  // High score record and daily quest completion + Garden water reward
  useEffect(() => {
    if (gameState === 'result') {
      const today = new Date().toISOString().slice(0, 10);
      try {
        localStorage.setItem('hyper_match_played_today', today);
      } catch {}

      // Award garden water drops based on score!
      const dropsEarned = Math.max(15, Math.min(60, Math.floor(score / 5) + 10));
      if (awardGardenWater) {
        awardGardenWater(dropsEarned, 'Nối từ siêu tốc', matchedHistory);
      }

      if (score > highScore) {
        setHighScore(score);
        localStorage.setItem('word_match_highscore', String(score));
        confetti({ particleCount: 110, spread: 90, origin: { y: 0.45 } });
      }
    }
  }, [gameState, score, highScore, matchedHistory, awardGardenWater]);

  const handlePlantMatchedToGarden = async () => {
    if (!matchedHistory.length || gardenPlanted) return;
    try {
      if (user) {
        for (const v of matchedHistory) {
          await srsService.recordReview({ vocab_id: v.id, correct: true }).catch(() => {});
        }
      } else {
        const GUEST_STORAGE_KEY = 'hyper_guest_garden_srs';
        const raw = localStorage.getItem(GUEST_STORAGE_KEY);
        const currentGuest = raw ? JSON.parse(raw) : [];
        const existingIds = new Set(currentGuest.map(g => g.vocab_id || g.id));
        const now = new Date();
        const nextDate = now.toISOString();

        matchedHistory.forEach(v => {
          if (!existingIds.has(v.id)) {
            currentGuest.push({
              id: v.id,
              vocab_id: v.id,
              level: 1,
              next_review_date: nextDate,
              last_reviewed_at: now.toISOString(),
              word: v.kanji || v.clean_kana || v.kana || '',
              kanji: v.kanji || '',
              reading: v.kanji ? (v.clean_kana || v.kana || '') : '',
              romaji: v.romaji || '',
              meaning: v.clean_vietnamese || v.vietnamese || '',
              usage_note: v.usage_note || '',
              example_jp: v.example_jp || '',
              example_vi: v.example_vi || '',
              lesson_number: v.lesson_number || 1
            });
          }
        });
        localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(currentGuest));
      }
      if (awardGardenWater) {
        awardGardenWater(30, 'Nuôi cây từ Nối từ siêu tốc', matchedHistory);
      }
      setGardenPlanted(true);
      sounds.playLevelUp?.();
      confetti({ particleCount: 65, spread: 75, origin: { y: 0.6 } });
    } catch (e) {
      console.error('Garden planting error:', e);
    }
  };

  const timerColor = timeLeft <= 10 ? '#ef4444' : timeLeft <= 20 ? '#f59e0b' : '#10b981';
  const timerPct = initialDuration > 0 ? (timeLeft / initialDuration) * 100 : 0;

  const handleLeftClick = (card) => {
    if (matchedPairs.has(card.pairId) || processingRef.current) return;
    if (soundEnabled) sounds.playPop?.();
    setSelectedLeft(prev => prev?.id === card.id ? null : card);
  };

  const handleRightClick = (card) => {
    if (matchedPairs.has(card.pairId) || processingRef.current) return;
    if (soundEnabled) sounds.playPop?.();
    setSelectedRight(prev => prev?.id === card.id ? null : card);
  };

  const selectedCountText = useMemo(() => {
    const arr = Array.from(selectedLessons).sort((a, b) => a - b);
    if (arr.length === 1) return `Bài ${arr[0]}`;
    if (arr.length === 25) return 'Tất cả 25 bài (1,589 từ)';
    return `${arr.length} bài đã chọn (Bài ${arr.slice(0, 3).join(', ')}${arr.length > 3 ? '...' : ''})`;
  }, [selectedLessons]);

  // ─── 1. FLAGSHIP SETUP SCREEN ───
  if (gameState === 'setup') {
    return (
      <div className="wm-page">
        <Container className="py-3 py-lg-4" style={{ maxWidth: 720 }}>
          {/* Back button */}
          <div className="mb-3">
            <button
              type="button"
              onClick={() => onNavigate?.('home')}
              className="app-btn-secondary"
              style={{ height: '36px', padding: '0 14px', fontSize: '12.5px' }}
            >
              <ChevronLeft size={16} />
              <span>Trang chủ</span>
            </button>
          </div>

          {/* Hero Banner */}
          <div className="wm-hero-arena mb-3.5 p-4 rounded-4 text-center position-relative overflow-hidden">
            <div className="wm-hero-lightning mb-2 d-inline-flex p-3 rounded-circle">
              <Zap size={34} className="text-warning" />
            </div>
            <div className="app-header-tag d-inline-flex mb-2" style={{ background: 'rgba(245, 158, 11, 0.2)', color: '#fbbf24', borderColor: 'rgba(251, 191, 36, 0.3)' }}>
              <Zap size={12} />
              <span>SPEED MATCH • PHẢN XẠ NHẬT NGỮ</span>
            </div>
            <h1 className="wm-hero-title mb-1.5 fw-black text-white">NỐI TỪ SIÊU TỐC</h1>
            <p className="wm-hero-subtitle text-white text-opacity-80 mx-auto mb-3" style={{ maxWidth: 520, fontSize: 13.5 }}>
              Kích thích phản xạ nhận diện mặt chữ trong <strong>0.5 giây</strong>. Loại bỏ thói quen dịch nhẩm trong đầu, biến việc ghi nhớ thành trò chơi kích thích trí nhớ dài hạn!
            </p>

            <div className="d-flex align-items-center justify-content-center gap-2 flex-wrap">
              <div className="wm-badge-pill">
                <Clock size={13} className="text-warning" />
                <span>60s Tốc Độ</span>
              </div>
              <div className="wm-badge-pill">
                <Flame size={13} className="text-danger" />
                <span>Fever Mode 1.5x</span>
              </div>
              <div className="wm-badge-pill">
                <Trophy size={13} className="text-warning" />
                <span>Kỷ lục: {highScore > 0 ? `${highScore.toLocaleString()} đ` : 'Chưa có'}</span>
              </div>
            </div>
          </div>

          {/* Mode & Duration Config Card */}
          <div className="wm-setup-card mb-3.5">
            <div className="d-flex align-items-center justify-content-between mb-2.5 flex-wrap gap-2">
              <div className="d-flex align-items-center gap-2">
                <SlidersHorizontal size={16} className="text-primary" />
                <span className="fw-bold text-dark" style={{ fontSize: 13.5 }}>Chế Độ Thời Gian:</span>
              </div>
              <div className="d-flex align-items-center gap-1.5 bg-light p-1 rounded-pill border">
                {[
                  { id: 'blitz', label: 'Chớp Nhoáng (30s)' },
                  { id: 'standard', label: 'Tiêu Chuẩn (60s)' },
                  { id: 'relax', label: 'Thư Giãn (90s)' }
                ].map(m => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setGameMode(m.id)}
                    className={`btn btn-sm rounded-pill px-2.5 py-1 small fw-bold ${gameMode === m.id ? 'btn-primary text-white shadow-xs' : 'btn-light text-muted'}`}
                    style={{ fontSize: 11.5 }}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Scope Selection Header */}
            <div className="d-flex align-items-center justify-content-between pt-2.5 border-top mb-2.5 flex-wrap gap-2">
              <div className="d-flex align-items-center gap-2">
                <Layers size={16} className="text-primary" />
                <span className="fw-bold text-dark" style={{ fontSize: 13.5 }}>Phạm Vi Bài Học:</span>
                <span className="badge bg-primary bg-opacity-10 text-primary rounded-pill px-2.5 py-0.5 small fw-bold">
                  {selectedCountText}
                </span>
              </div>

              {/* Single vs Multi Mode Switch */}
              <div className="d-flex align-items-center gap-1 bg-light p-1 rounded-pill border">
                <button
                  type="button"
                  className={`btn btn-sm rounded-pill px-2.5 py-0.5 small ${selectionMode === 'single' ? 'btn-primary text-white shadow-xs fw-bold' : 'btn-light text-muted'}`}
                  style={{ fontSize: 11.5 }}
                  onClick={() => {
                    setSelectionMode('single');
                    const first = Array.from(selectedLessons)[0] || 1;
                    setSelectedLessons(new Set([first]));
                  }}
                >
                  1 Bài
                </button>
                <button
                  type="button"
                  className={`btn btn-sm rounded-pill px-2.5 py-0.5 small ${selectionMode === 'multi' ? 'btn-primary text-white shadow-xs fw-bold' : 'btn-light text-muted'}`}
                  style={{ fontSize: 11.5 }}
                  onClick={() => setSelectionMode('multi')}
                >
                  Nhiều Bài
                </button>
              </div>
            </div>

            {/* Presets Row */}
            {selectionMode === 'multi' && (
              <div className="mb-2.5">
                <div className="d-flex align-items-center justify-content-between mb-1.5 flex-wrap gap-1">
                  <small className="text-muted fw-semibold" style={{ fontSize: 11 }}>
                    Gói chọn bài nhanh:
                  </small>
                  <div className="d-flex align-items-center gap-1.5">
                    <button
                      type="button"
                      className="btn btn-sm btn-link p-0 text-primary text-decoration-none fw-bold"
                      style={{ fontSize: 11 }}
                      onClick={() => setSelectedLessons(new Set(Array.from({ length: 25 }, (_, i) => i + 1)))}
                    >
                      Chọn tất cả 25 bài
                    </button>
                    <span className="text-muted" style={{ fontSize: 10 }}>•</span>
                    <button
                      type="button"
                      className="btn btn-sm btn-link p-0 text-secondary text-decoration-none"
                      style={{ fontSize: 11 }}
                      onClick={() => setSelectedLessons(new Set([1]))}
                    >
                      Chỉ chọn Bài 1
                    </button>
                  </div>
                </div>
                <div className="d-flex gap-1.5 flex-wrap">
                  {PRESET_BUNDLES.map(preset => {
                    const isAll = preset.lessons.every(l => selectedLessons.has(l));
                    return (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => applyPreset(preset.lessons)}
                        className={`btn btn-sm rounded-pill px-2.5 py-1 small d-inline-flex align-items-center gap-1 ${
                          isAll
                            ? 'btn-outline-primary border-2 fw-bold bg-primary bg-opacity-10'
                            : 'btn-outline-secondary'
                        }`}
                        style={{ fontSize: 11 }}
                      >
                        {isAll && <Check size={11} />}
                        <span>{preset.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 25 Lesson Grid Buttons */}
            <div className="wm-lesson-grid">
              {Array.from({ length: 25 }, (_, i) => i + 1).map(num => {
                const isSelected = selectedLessons.has(num);
                return (
                  <button
                    key={num}
                    type="button"
                    onClick={() => handleToggleLesson(num)}
                    className={`wm-lesson-btn ${isSelected ? 'active' : ''}`}
                    title={`Bài ${num}`}
                  >
                    <span>{num}</span>
                    {isSelected && selectionMode === 'multi' && (
                      <span className="wm-lesson-check-dot"><Check size={8} strokeWidth={3} /></span>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="text-center mt-2.5">
              <small className="text-muted" style={{ fontSize: 11.5 }}>
                {selectionMode === 'single'
                  ? 'Đang ở chế độ 1 bài. Bấm vào bài học để chọn bài thi đấu.'
                  : 'Đang ở chế độ nhiều bài. Chạm để chọn hoặc bỏ chọn bất kỳ sự kết hợp nào.'}
              </small>
            </div>
          </div>

          {/* Gameplay Instructions */}
          <div className="wm-rules-card mb-4">
            <div className="fw-bold text-dark small mb-1.5 d-flex align-items-center gap-1.5">
              <Sparkles size={14} className="text-warning" />
              <span>Cơ chế trò chơi:</span>
            </div>
            <div className="wm-rule">
              <span className="wm-rule-icon"><Target size={14} className="text-primary" /></span>
              <span>Chạm <strong>từ tiếng Nhật</strong> bên trái rồi chạm ngay <strong>nghĩa tiếng Việt</strong> tương ứng bên phải.</span>
            </div>
            <div className="wm-rule">
              <span className="wm-rule-icon"><Flame size={14} className="text-danger" /></span>
              <span>Ghép đúng liên tiếp tích <strong>Combo</strong>. Từ Combo x4 mở khóa <strong>Fever Mode</strong> thưởng điểm gấp rưỡi!</span>
            </div>
            <div className="wm-rule">
              <span className="wm-rule-icon"><Zap size={14} className="text-warning" /></span>
              <span>Ghép xong 5 cặp, hệ thống tự động tải vòng tiếp theo ngay lập tức không có độ trễ!</span>
            </div>
          </div>

          {/* Start Button */}
          <button type="button" onClick={startGame} className="wm-start-btn">
            <Play size={20} />
            Bắt đầu thi đấu ({selectedCountText})
          </button>
        </Container>
      </div>
    );
  }

  // ─── 2. FLAGSHIP PLAYING SCREEN ───
  if (gameState === 'playing') {
    return (
      <div className={`wm-page ${isFeverMode ? 'wm-fever-active' : ''}`}>
        {loading && (
          <div className="wm-loading-overlay">
            <Spinner color="primary" />
          </div>
        )}

        {/* Floating Combo Toast Notification */}
        {floatingNotification && (
          <div key={floatingNotification.id} className="wm-floating-combo">
            {floatingNotification.text}
          </div>
        )}

        <Container className="py-2 py-md-3" style={{ maxWidth: 760 }}>
          {/* Top Bar with Exit Button & Audio Toggle */}
          <div className="d-flex align-items-center justify-content-between mb-2 px-1">
            <button
              type="button"
              onClick={() => {
                clearInterval(timerRef.current);
                setGameState('setup');
              }}
              className="garden-back-btn p-0"
              style={{ fontSize: 12.5 }}
            >
              <ChevronLeft size={16} /> Thoát game
            </button>

            <div className="d-flex align-items-center gap-2">
              <button
                type="button"
                className="btn btn-sm btn-light rounded-pill border p-1 px-2.5 d-flex align-items-center gap-1"
                style={{ fontSize: 11, color: '#64748b' }}
                onClick={() => setSoundEnabled(s => !s)}
                title="Bật/Tắt âm thanh"
              >
                {soundEnabled ? <Volume2 size={13} className="text-primary" /> : <VolumeX size={13} className="text-danger" />}
                <span>{soundEnabled ? 'Bật âm' : 'Tắt âm'}</span>
              </button>
              <span className="badge bg-white text-secondary border rounded-pill px-2.5 py-1" style={{ fontSize: 11 }}>
                Vòng {rounds}
              </span>
            </div>
          </div>

          {/* HUD Header Bar */}
          <div className="wm-hud">
            <div className="wm-hud-stat">
              <Trophy size={16} className="text-warning" />
              <span>{score.toLocaleString()} đ</span>
            </div>

            {/* Circular Timer Ring */}
            <div className="wm-timer-wrap">
              <div
                className={`wm-timer-ring ${timeLeft <= 10 ? 'wm-pulse-timer' : ''}`}
                style={{ borderColor: timerColor }}
              >
                <Clock size={14} style={{ color: timerColor }} />
                <span style={{ color: timerColor, fontSize: 18, fontWeight: 900 }}>
                  {timeLeft}s
                </span>
              </div>
            </div>

            <div className={`wm-hud-stat ${isFeverMode ? 'wm-fever-badge' : ''}`}>
              <Flame size={16} className={isFeverMode ? 'text-danger' : 'text-warning'} />
              <span>{combo > 0 ? `Combo x${combo}` : selectedCountText}</span>
            </div>
          </div>

          {/* Dynamic Timer Progress Bar */}
          <div className="wm-timer-bar-wrap">
            <div className="wm-timer-bar" style={{ width: `${timerPct}%`, background: timerColor }} />
          </div>

          {/* Fever Mode Banner */}
          {isFeverMode && (
            <div className="wm-fever-banner mb-2.5">
              <Flame size={15} />
              <span>FEVER MODE 1.5X ĐIỂM SỨC MẠNH!</span>
              <Flame size={15} />
            </div>
          )}

          {/* Match Arena Grid */}
          <div className="wm-match-grid">
            {/* Left: Japanese Column */}
            <div className="wm-card-col">
              <div className="wm-col-label">Tiếng Nhật</div>
              {leftCards.map(card => {
                const isSelected = selectedLeft?.id === card.id;
                const isMatched = matchedPairs.has(card.pairId);
                const isWrong = shakeIds.has(card.id);
                return (
                  <button
                    key={card.id}
                    type="button"
                    className={`wm-card wm-card-left 
                      ${isSelected ? 'is-selected' : ''} 
                      ${isMatched ? 'is-matched' : ''} 
                      ${isWrong ? 'wm-shake' : ''}`}
                    onClick={() => handleLeftClick(card)}
                  >
                    <div className="wm-card-jp">{card.text}</div>
                    {card.reading && card.reading !== card.text && (
                      <div className="wm-card-reading">{card.reading}</div>
                    )}
                    {isMatched && <CheckCircle2 size={15} className="wm-check-icon" />}
                  </button>
                );
              })}
            </div>

            {/* Right: Vietnamese Column */}
            <div className="wm-card-col">
              <div className="wm-col-label">Nghĩa Tiếng Việt</div>
              {rightCards.map(card => {
                const isSelected = selectedRight?.id === card.id;
                const isMatched = matchedPairs.has(card.pairId);
                const isWrong = shakeIds.has(card.id);
                return (
                  <button
                    key={card.id}
                    type="button"
                    className={`wm-card wm-card-right 
                      ${isSelected ? 'is-selected' : ''} 
                      ${isMatched ? 'is-matched' : ''} 
                      ${isWrong ? 'wm-shake' : ''}`}
                    onClick={() => handleRightClick(card)}
                  >
                    <div className="wm-card-vi">{card.text}</div>
                    {isMatched && <CheckCircle2 size={15} className="wm-check-icon" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Round completion dots */}
          <div className="wm-round-progress">
            {leftCards.map(card => (
              <div
                key={card.pairId}
                className={`wm-dot ${matchedPairs.has(card.pairId) ? 'wm-dot-done' : ''}`}
              />
            ))}
          </div>
        </Container>
      </div>
    );
  }

  // ─── 3. FLAGSHIP RESULT & REVIEW SCREEN ───
  const accuracy = totalMatched + totalWrong > 0 ? Math.round((totalMatched / (totalMatched + totalWrong)) * 100) : 0;
  const isNewRecord = score >= highScore && score > 0;

  return (
    <div className="wm-page">
      <Container className="py-4 py-lg-5" style={{ maxWidth: 640 }}>
        <div className="wm-result-card">
          {isNewRecord ? (
            <>
              <div className="wm-result-badge new-record">KỶ LỤC MỚI CỦA BẠN!</div>
              <h2 className="wm-result-score highlight">{score.toLocaleString()}</h2>
            </>
          ) : (
            <>
              <div className="wm-result-badge">Tổng Điểm Trận Đấu</div>
              <h2 className="wm-result-score">{score.toLocaleString()}</h2>
            </>
          )}
          <p className="wm-result-label">điểm phản xạ ({selectedCountText})</p>

          <div className="wm-result-stats">
            <div className="wm-stat-item">
              <CheckCircle2 size={18} color="#10b981" />
              <div>
                <div className="wm-stat-val">{totalMatched}</div>
                <div className="wm-stat-key">Cặp ghép đúng</div>
              </div>
            </div>
            <div className="wm-stat-item">
              <Flame size={18} color="#f97316" />
              <div>
                <div className="wm-stat-val">x{maxCombo}</div>
                <div className="wm-stat-key">Combo cao nhất</div>
              </div>
            </div>
            <div className="wm-stat-item">
              <Star size={18} color="#f59e0b" />
              <div>
                <div className="wm-stat-val">{accuracy}%</div>
                <div className="wm-stat-key">Độ chính xác</div>
              </div>
            </div>
            <div className="wm-stat-item">
              <Zap size={18} color="#2563eb" />
              <div>
                <div className="wm-stat-val">{rounds}</div>
                <div className="wm-stat-key">Vòng hoàn thành</div>
              </div>
            </div>
          </div>

          <div className="wm-result-actions mb-3.5">
            <button type="button" onClick={startGame} className="wm-start-btn">
              <RotateCcw size={18} />
              Chơi lại ngay
            </button>

            {matchedHistory.length > 0 && (
              <button
                type="button"
                onClick={handlePlantMatchedToGarden}
                disabled={gardenPlanted}
                className={`btn rounded-4 py-2.5 px-3 fw-bold d-flex align-items-center justify-content-center gap-2 ${
                  gardenPlanted
                    ? 'btn-success text-white'
                    : 'btn-outline-success bg-success bg-opacity-10 border-2'
                }`}
              >
                <Sprout size={18} />
                <span>
                  {gardenPlanted
                    ? `Đã gieo ${matchedHistory.length} từ vào Vườn Trí Nhớ!`
                    : `Gieo ${matchedHistory.length} từ này vào Vườn Cây Trí Nhớ`}
                </span>
              </button>
            )}

            <div className="d-flex gap-2">
              <button type="button" onClick={() => setGameState('setup')} className="wm-secondary-btn flex-fill">
                <ChevronLeft size={16} />
                Đổi bài & chế độ
              </button>
              <button
                type="button"
                onClick={() => onNavigate?.('garden')}
                className="btn btn-outline-secondary rounded-4 px-3 d-flex align-items-center gap-1.5 small fw-semibold"
                style={{ fontSize: 13 }}
              >
                <Sprout size={15} className="text-success" />
                Vườn Cây
              </button>
            </div>

            <button
              type="button"
              onClick={() => onNavigate?.('home')}
              className="btn btn-link text-decoration-none text-secondary small py-1"
            >
              Về Trang chủ
            </button>
          </div>

          {/* Matched Vocab Review List */}
          {matchedHistory.length > 0 && (
            <div className="text-start mt-3 pt-3 border-top">
              <div className="d-flex align-items-center justify-content-between mb-2">
                <span className="fw-bold small text-dark d-flex align-items-center gap-1.5">
                  <BookOpen size={14} className="text-primary" />
                  <span>Từ vựng đã rèn luyện trong ván ({matchedHistory.length} từ):</span>
                </span>
                <small className="text-muted">Chạm loa để nghe lại</small>
              </div>
              <div className="wm-history-list d-flex flex-column gap-1.5" style={{ maxHeight: 220, overflowY: 'auto' }}>
                {matchedHistory.map(v => (
                  <div key={v.id} className="p-2 rounded-3 border bg-light d-flex align-items-center justify-content-between">
                    <div>
                      <span className="fw-bold text-dark me-2" style={{ fontFamily: 'Noto Sans JP, sans-serif' }}>
                        {v.kanji || v.clean_kana || v.kana}
                      </span>
                      {v.kanji && v.kana && (
                        <small className="text-muted me-2">({v.clean_kana || v.kana})</small>
                      )}
                      <small className="text-secondary">{v.clean_vietnamese || v.vietnamese}</small>
                    </div>
                    <button
                      type="button"
                      className="btn btn-sm btn-link p-0 text-primary"
                      onClick={() => speakJapanese(v.kanji || v.clean_kana || v.kana)}
                      title="Phát âm Tokyo"
                    >
                      <Volume2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Container>
    </div>
  );
};

export default WordMatchPage;
