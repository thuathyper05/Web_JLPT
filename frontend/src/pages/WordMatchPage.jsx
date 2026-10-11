import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Container, Spinner } from 'reactstrap';
import { 
  Zap, Trophy, RotateCcw, Play, Clock, Star, Volume2, VolumeX, 
  Flame, ChevronLeft, CheckCircle, Sparkles, Award, Shield, Target
} from 'lucide-react';
import { vocabService, speakJapanese, lessonService } from '../services/api';
import { sounds } from '../services/sounds';
import { useApp } from '../context/AppContext';
import confetti from 'canvas-confetti';

const GAME_DURATION = 60;
const PAIRS_COUNT = 5;

const WordMatchPage = ({ initialLesson = 1, onNavigate, onSelectLesson }) => {
  const { user } = useApp();
  const [lessonNum, setLessonNum] = useState(initialLesson);
  const [lessons, setLessons] = useState([]);
  const [gameState, setGameState] = useState('setup'); // setup | playing | result
  const [loading, setLoading] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Game state
  const [allPairs, setAllPairs] = useState([]);
  const [leftCards, setLeftCards] = useState([]);
  const [rightCards, setRightCards] = useState([]);
  const [selectedLeft, setSelectedLeft] = useState(null);
  const [selectedRight, setSelectedRight] = useState(null);
  const [matchedPairs, setMatchedPairs] = useState(new Set());
  const [wrongPair, setWrongPair] = useState(null);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [totalMatched, setTotalMatched] = useState(0);
  const [totalWrong, setTotalWrong] = useState(0);
  const [rounds, setRounds] = useState(0);
  const [floatingNotification, setFloatingNotification] = useState(null);
  const [shakeIds, setShakeIds] = useState(new Set());
  const [correctIds, setCorrectIds] = useState(new Set());
  const [highScore, setHighScore] = useState(() => parseInt(localStorage.getItem('word_match_highscore') || '0'));
  
  // Speed reflex tracking
  const lastMatchTimeRef = useRef(Date.now());
  const timerRef = useRef(null);
  const processingRef = useRef(false);

  const isFeverMode = combo >= 4;

  // Load lessons
  useEffect(() => {
    lessonService.getLessons().then(r => setLessons(r.data || [])).catch(() => {});
  }, []);

  useEffect(() => {
    if (initialLesson) setLessonNum(initialLesson);
  }, [initialLesson]);

  const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);

  const loadNextRound = useCallback(async () => {
    try {
      const res = await vocabService.getVocabularies({ lesson: lessonNum });
      const allVocabs = Array.isArray(res.data) ? res.data : (res.data?.data || []);
      if (!allVocabs.length) return;

      const selected = shuffle(allVocabs).slice(0, PAIRS_COUNT);
      setAllPairs(selected);

      const leftItems = selected.map(v => {
        const text = v.kanji || v.clean_kana || v.kana || v.word || '';
        const reading = v.kanji ? (v.clean_kana || v.kana || v.reading || '') : '';
        return { id: v.id, text, reading, pairId: v.id, side: 'left' };
      });
      const rightItems = shuffle(selected.map(v => {
        const text = v.clean_vietnamese || v.vietnamese || v.meaning || '';
        return { id: `r-${v.id}`, text, pairId: v.id, side: 'right' };
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
  }, [lessonNum]);

  const startGame = async () => {
    setLoading(true);
    setScore(0);
    setCombo(0);
    setMaxCombo(0);
    setTotalMatched(0);
    setTotalWrong(0);
    setRounds(0);
    setTimeLeft(GAME_DURATION);
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

  // Handle Match Logic with Dopamine Effects
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

      const newCombo = combo + 1;
      const newMaxCombo = Math.max(maxCombo, newCombo);
      const isSuperSpeed = matchSpeedSec <= 1.4 && totalMatched > 0;
      
      // Points calculation: Base 10 + combo bonus + fever 2x + speed bonus
      const basePoints = 10;
      const comboBonus = newCombo > 1 ? (newCombo - 1) * 5 : 0;
      const speedBonus = isSuperSpeed ? 5 : 0;
      let roundGained = basePoints + comboBonus + speedBonus;
      if (newCombo >= 4) {
        roundGained = Math.round(roundGained * 1.5); // 1.5x Fever multiplier
      }

      setCombo(newCombo);
      setMaxCombo(newMaxCombo);
      setScore(s => s + roundGained);
      setTotalMatched(t => t + 1);

      // Floating notification
      let notifyText = `+${roundGained} ĐIỂM`;
      if (newCombo >= 4) {
        notifyText = `🔥 FEVER x${newCombo}! +${roundGained}`;
      } else if (newCombo > 1) {
        notifyText = `COMBO x${newCombo}! +${roundGained}`;
      }
      if (isSuperSpeed) {
        notifyText += ` ⚡ Phản xạ ${matchSpeedSec}s`;
      }
      setFloatingNotification({ text: notifyText, id: Date.now() });
      setTimeout(() => setFloatingNotification(null), 850);

      setTimeout(() => {
        setSelectedLeft(null);
        setSelectedRight(null);

        // Check if round complete
        if (newMatchedPairs.size === PAIRS_COUNT) {
          confetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.55 },
            colors: ['#2563eb', '#10b981', '#f59e0b', '#ec4899']
          });
          setTimeout(() => {
            loadNextRound();
          }, 350);
        } else {
          processingRef.current = false;
        }
      }, 260);
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
      }, 500);
    }
  }, [selectedLeft, selectedRight, combo, matchedPairs, maxCombo, soundEnabled, totalMatched, loadNextRound]);

  // Save High Score on Game Result
  useEffect(() => {
    if (gameState === 'result') {
      if (score > highScore) {
        setHighScore(score);
        localStorage.setItem('word_match_highscore', String(score));
        confetti({ particleCount: 100, spread: 90, origin: { y: 0.45 } });
      }
    }
  }, [gameState, score, highScore]);

  const timerColor = timeLeft <= 10 ? '#ef4444' : timeLeft <= 20 ? '#f59e0b' : '#10b981';
  const timerPct = (timeLeft / GAME_DURATION) * 100;

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

  // ─── SETUP SCREEN ───
  if (gameState === 'setup') {
    return (
      <div className="wm-page">
        <Container className="py-3 py-lg-4" style={{ maxWidth: 640 }}>
          <button
            type="button"
            onClick={() => onNavigate?.('home')}
            className="garden-back-btn mb-2.5"
          >
            <ChevronLeft size={18} /> Trang chủ
          </button>

          {/* Header */}
          <div className="text-center mb-4">
            <div className="wm-icon-badge mb-3">
              <Zap size={38} />
            </div>
            <div className="d-flex align-items-center justify-content-center gap-2 mb-1">
              <h1 className="wm-title mb-0">Nối Từ Siêu Tốc</h1>
              <span className="badge bg-warning bg-opacity-20 text-warning border border-warning border-opacity-30 rounded-pill px-2.5 py-1" style={{ fontSize: '11px', fontWeight: 800 }}>
                ⚡ Tốc độ 60s
              </span>
            </div>
            <p className="wm-subtitle">
              Kích thích phản xạ nhận diện mặt chữ trong <strong>0.5 giây</strong>. Loại bỏ thói quen dịch nhẩm, biến từ vựng thành phản xạ tự nhiên!
            </p>
          </div>

          {/* High Score Trophy */}
          {highScore > 0 && (
            <div className="wm-highscore-card mb-3.5">
              <div className="d-flex align-items-center gap-2">
                <Trophy size={20} className="text-warning flex-shrink-0" />
                <span>Kỷ lục đỉnh cao:</span>
              </div>
              <strong className="fs-5">{highScore.toLocaleString()} điểm</strong>
            </div>
          )}

          {/* Lesson Selector */}
          <div className="wm-setup-card mb-3.5">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <label className="wm-label mb-0">Chọn bài học Minna (1–25):</label>
              <span className="badge bg-primary bg-opacity-10 text-primary rounded-pill px-2 py-0.5" style={{ fontSize: '11px' }}>
                Đang chọn: Bài {lessonNum}
              </span>
            </div>
            <div className="wm-lesson-grid">
              {Array.from({ length: 25 }, (_, i) => i + 1).map(num => (
                <button
                  key={num}
                  type="button"
                  onClick={() => { setLessonNum(num); onSelectLesson?.(num); }}
                  className={`wm-lesson-btn ${lessonNum === num ? 'active' : ''}`}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>

          {/* How to Play Card */}
          <div className="wm-rules-card mb-4">
            <div className="fw-bold text-dark small mb-1 d-flex align-items-center gap-1.5">
              <Sparkles size={14} className="text-warning" />
              <span>Cơ chế trò chơi:</span>
            </div>
            <div className="wm-rule">
              <span className="wm-rule-icon">👆</span>
              <span>Chạm <strong>từ tiếng Nhật</strong> bên trái ➔ chạm ngay <strong>nghĩa tiếng Việt</strong> bên phải.</span>
            </div>
            <div className="wm-rule">
              <span className="wm-rule-icon">🔥</span>
              <span>Ghép đúng liên tiếp tích <strong>Combo</strong>. Đạt Combo x4 mở khóa <strong>Fever Mode</strong> thưởng điểm gấp rưỡi!</span>
            </div>
            <div className="wm-rule">
              <span className="wm-rule-icon">⏱️</span>
              <span>Đồng hồ <strong>60 giây</strong> đếm ngược. Ghép xong 5 cặp, hệ thống tự động tải vòng tiếp theo ngay lập tức!</span>
            </div>
          </div>

          <button type="button" onClick={startGame} className="wm-start-btn">
            <Play size={22} />
            Bắt đầu thi đấu ngay ⚡
          </button>
        </Container>
      </div>
    );
  }

  // ─── PLAYING SCREEN ───
  if (gameState === 'playing') {
    return (
      <div className={`wm-page ${isFeverMode ? 'wm-fever-active' : ''}`}>
        {loading && (
          <div className="wm-loading-overlay">
            <Spinner color="primary" />
          </div>
        )}

        {/* Floating Combo Notification */}
        {floatingNotification && (
          <div key={floatingNotification.id} className="wm-floating-combo">
            {floatingNotification.text}
          </div>
        )}

        <Container className="py-2.5 py-md-3" style={{ maxWidth: 740 }}>
          {/* Top Bar with Exit Button & Audio Toggle */}
          <div className="d-flex align-items-center justify-content-between mb-2 px-1">
            <button
              type="button"
              onClick={() => {
                clearInterval(timerRef.current);
                setGameState('setup');
              }}
              className="garden-back-btn p-0"
              style={{ fontSize: '12.5px' }}
            >
              <ChevronLeft size={16} /> Thoát trò chơi
            </button>

            <div className="d-flex align-items-center gap-2">
              <button
                type="button"
                className="btn btn-sm btn-light rounded-pill border p-1 px-2.5 d-flex align-items-center gap-1"
                style={{ fontSize: '11px', color: '#64748b' }}
                onClick={() => setSoundEnabled(s => !s)}
                title="Bật/Tắt âm thanh"
              >
                {soundEnabled ? <Volume2 size={13} className="text-primary" /> : <VolumeX size={13} className="text-danger" />}
                <span>{soundEnabled ? 'Âm thanh: Bật' : 'Tắt tiếng'}</span>
              </button>
              <span className="badge bg-white text-secondary border rounded-pill px-2.5 py-1" style={{ fontSize: '11px' }}>
                Vòng {rounds}
              </span>
            </div>
          </div>

          {/* HUD Bar */}
          <div className="wm-hud">
            <div className="wm-hud-stat">
              <Trophy size={16} className="text-warning" />
              <span>{score.toLocaleString()}</span>
            </div>

            {/* Circular Timer Ring */}
            <div className="wm-timer-wrap">
              <div
                className={`wm-timer-ring ${timeLeft <= 10 ? 'wm-pulse-timer' : ''}`}
                style={{ borderColor: timerColor }}
              >
                <Clock size={14} style={{ color: timerColor }} />
                <span style={{ color: timerColor, fontSize: '18px', fontWeight: 900 }}>
                  {timeLeft}s
                </span>
              </div>
            </div>

            <div className={`wm-hud-stat ${isFeverMode ? 'wm-fever-badge' : ''}`}>
              <Flame size={16} className={isFeverMode ? 'text-danger' : 'text-warning'} />
              <span>{combo > 0 ? `Combo x${combo}` : `Bài ${lessonNum}`}</span>
            </div>
          </div>

          {/* Dynamic Timer Bar */}
          <div className="wm-timer-bar-wrap">
            <div className="wm-timer-bar" style={{ width: `${timerPct}%`, background: timerColor }} />
          </div>

          {/* Fever Mode Glow Banner */}
          {isFeverMode && (
            <div className="wm-fever-banner mb-2.5">
              <Flame size={15} />
              <span>FEVER MODE 1.5X ĐIỂM SỨC MẠNH!</span>
              <Flame size={15} />
            </div>
          )}

          {/* Match Grid */}
          <div className="wm-match-grid">
            {/* Left: Japanese Column */}
            <div className="wm-card-col">
              <div className="wm-col-label">🇯🇵 Tiếng Nhật</div>
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
                    {isMatched && <CheckCircle size={15} className="wm-check-icon" />}
                  </button>
                );
              })}
            </div>

            {/* Right: Vietnamese Column */}
            <div className="wm-card-col">
              <div className="wm-col-label">🇻🇳 Tiếng Việt</div>
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
                    {isMatched && <CheckCircle size={15} className="wm-check-icon" />}
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

  // ─── RESULT SCREEN ───
  const accuracy = totalMatched + totalWrong > 0 ? Math.round((totalMatched / (totalMatched + totalWrong)) * 100) : 0;
  const isNewRecord = score >= highScore && score > 0;

  return (
    <div className="wm-page">
      <Container className="py-4 py-lg-5" style={{ maxWidth: 560 }}>
        <div className="wm-result-card">
          {isNewRecord ? (
            <>
              <div className="wm-result-badge new-record">🏆 KỶ LỤC MỚI CỦA BẠN!</div>
              <h2 className="wm-result-score highlight">{score.toLocaleString()}</h2>
            </>
          ) : (
            <>
              <div className="wm-result-badge">Tổng Điểm Trận Đấu</div>
              <h2 className="wm-result-score">{score.toLocaleString()}</h2>
            </>
          )}
          <p className="wm-result-label">điểm phản xạ</p>

          <div className="wm-result-stats">
            <div className="wm-stat-item">
              <CheckCircle size={18} color="#10b981" />
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

          <div className="wm-result-actions">
            <button type="button" onClick={startGame} className="wm-start-btn">
              <RotateCcw size={18} />
              Chơi lại ngay (60s)
            </button>
            <button type="button" onClick={() => setGameState('setup')} className="wm-secondary-btn">
              <ChevronLeft size={18} />
              Chọn bài học khác
            </button>
            <button
              type="button"
              onClick={() => onNavigate?.('home')}
              className="btn btn-link text-decoration-none text-secondary small py-1"
            >
              ← Về Trang chủ
            </button>
          </div>

          {!isNewRecord && highScore > 0 && (
            <p className="wm-record-note mt-2">
              <Trophy size={14} className="text-warning" /> Kỷ lục cao nhất: {highScore.toLocaleString()} điểm
            </p>
          )}
        </div>
      </Container>
    </div>
  );
};

export default WordMatchPage;
