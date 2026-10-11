import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Container, Spinner } from 'reactstrap';
import { Zap, Trophy, RotateCcw, Play, Clock, Star, Volume2, Flame, ChevronLeft, CheckCircle } from 'lucide-react';
import { vocabService, speakJapanese, lessonService } from '../services/api';
import { sounds } from '../services/sounds';
import { useApp } from '../context/AppContext';
import confetti from 'canvas-confetti';

const GAME_DURATION = 60;
const PAIRS_COUNT = 5;

// SRS level colors
const LEVEL_COLORS = ['#2563eb', '#10b981', '#f59e0b', '#8b5cf6'];

const WordMatchPage = ({ initialLesson = 1, onNavigate, onSelectLesson }) => {
  const { user } = useApp();
  const [lessonNum, setLessonNum] = useState(initialLesson);
  const [lessons, setLessons] = useState([]);
  const [gameState, setGameState] = useState('setup'); // setup | playing | result
  const [loading, setLoading] = useState(false);

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
  const [floatingCombo, setFloatingCombo] = useState(null);
  const [shakeIds, setShakeIds] = useState(new Set());
  const [correctIds, setCorrectIds] = useState(new Set());
  const [highScore, setHighScore] = useState(() => parseInt(localStorage.getItem('word_match_highscore') || '0'));

  const timerRef = useRef(null);
  const processingRef = useRef(false);

  // Load lessons
  useEffect(() => {
    lessonService.getLessons().then(r => setLessons(r.data || [])).catch(() => {});
  }, []);

  useEffect(() => {
    if (initialLesson) setLessonNum(initialLesson);
  }, [initialLesson]);

  const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);

  const loadNextRound = useCallback(async (currentScore, currentCombo, currentMaxCombo, currentTotal, currentWrong) => {
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
    await loadNextRound(0, 0, 0, 0, 0);
    setLoading(false);
  };

  // Timer
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

  // Handle match logic
  useEffect(() => {
    if (!selectedLeft || !selectedRight || processingRef.current) return;
    processingRef.current = true;

    if (selectedLeft.pairId === selectedRight.pairId) {
      // ✅ Correct match
      sounds.playCorrect?.() || (() => {})();
      speakJapanese(selectedLeft.text);

      const newMatchedPairs = new Set([...matchedPairs, selectedLeft.pairId]);
      setMatchedPairs(newMatchedPairs);
      setCorrectIds(prev => new Set([...prev, selectedLeft.id, selectedRight.id]));

      const newCombo = combo + 1;
      const newMaxCombo = Math.max(maxCombo, newCombo);
      const basePoints = 10;
      const comboBonus = newCombo > 1 ? (newCombo - 1) * 5 : 0;
      const gained = basePoints + comboBonus;

      setCombo(newCombo);
      setMaxCombo(newMaxCombo);
      setScore(s => s + gained);
      setTotalMatched(t => t + 1);

      if (newCombo > 1) {
        setFloatingCombo({ text: `+${gained} COMBO x${newCombo}!`, id: Date.now() });
        setTimeout(() => setFloatingCombo(null), 900);
      }

      setTimeout(() => {
        setSelectedLeft(null);
        setSelectedRight(null);
        // Check if round complete
        if (newMatchedPairs.size === PAIRS_COUNT) {
          // Confetti burst for round complete
          confetti({ particleCount: 60, spread: 70, origin: { y: 0.5 }, colors: ['#2563eb', '#10b981', '#f59e0b'] });
          setTimeout(() => {
            loadNextRound(score + gained, newCombo, newMaxCombo, totalMatched + 1, totalWrong);
          }, 400);
        } else {
          processingRef.current = false;
        }
      }, 300);
    } else {
      // ❌ Wrong match
      sounds.playWrong?.() || (() => {})();
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
      }, 600);
    }
  }, [selectedLeft, selectedRight]);

  // On result, save highscore
  useEffect(() => {
    if (gameState === 'result') {
      if (score > highScore) {
        setHighScore(score);
        localStorage.setItem('word_match_highscore', String(score));
        confetti({ particleCount: 120, spread: 100, origin: { y: 0.5 } });
      }
    }
  }, [gameState]);

  const timerColor = timeLeft <= 10 ? '#ef4444' : timeLeft <= 20 ? '#f59e0b' : '#10b981';
  const timerPct = (timeLeft / GAME_DURATION) * 100;

  const getCardStyle = (card, side) => {
    const isSelected = side === 'left' ? selectedLeft?.id === card.id : selectedRight?.id === card.id;
    const isMatched = matchedPairs.has(card.pairId);
    const isWrong = shakeIds.has(card.id);
    const isCorrect = correctIds.has(card.id) && isMatched;

    if (isMatched) return {
      background: 'linear-gradient(135deg, #10b981, #059669)',
      border: '2px solid #10b981',
      color: '#fff',
      transform: 'scale(0.95)',
      opacity: 0.7,
      pointerEvents: 'none'
    };
    if (isWrong) return {
      background: 'linear-gradient(135deg, #fef2f2, #fee2e2)',
      border: '2px solid #ef4444',
      color: '#dc2626',
      animation: 'wm-shake 0.5s ease',
    };
    if (isSelected) return {
      background: 'linear-gradient(135deg, #eff6ff, #dbeafe)',
      border: '2px solid #2563eb',
      color: '#1d4ed8',
      transform: 'scale(1.04)',
      boxShadow: '0 4px 20px rgba(37, 99, 235, 0.3)'
    };
    return {
      background: '#fff',
      border: '1.5px solid #e2e8f0',
      color: '#1e293b',
      cursor: 'pointer',
    };
  };

  const handleLeftClick = (card) => {
    if (matchedPairs.has(card.pairId) || processingRef.current) return;
    sounds.playFlip?.();
    setSelectedLeft(prev => prev?.id === card.id ? null : card);
  };

  const handleRightClick = (card) => {
    if (matchedPairs.has(card.pairId) || processingRef.current) return;
    sounds.playFlip?.();
    setSelectedRight(prev => prev?.id === card.id ? null : card);
  };

  // ─── SETUP SCREEN ───
  if (gameState === 'setup') {
    return (
      <div className="wm-page">
        <Container className="py-4 py-lg-5" style={{ maxWidth: 600 }}>
          {/* Header */}
          <div className="text-center mb-4">
            <div className="wm-icon-badge mb-3">
              <Zap size={36} />
            </div>
            <h1 className="wm-title">Nối Từ Siêu Tốc</h1>
            <p className="wm-subtitle">Ghép 5 cặp từ Nhật–Việt trong <strong>{GAME_DURATION} giây</strong>. Combo càng cao, điểm càng lớn!</p>
          </div>

          {/* High Score */}
          {highScore > 0 && (
            <div className="wm-highscore-card mb-4">
              <Trophy size={20} />
              <span>Kỷ lục của bạn:</span>
              <strong>{highScore.toLocaleString()} điểm</strong>
            </div>
          )}

          {/* Lesson Selector */}
          <div className="wm-setup-card mb-4">
            <label className="wm-label">Chọn bài học</label>
            <div className="wm-lesson-grid">
              {Array.from({ length: 25 }, (_, i) => i + 1).map(num => (
                <button
                  key={num}
                  onClick={() => { setLessonNum(num); onSelectLesson?.(num); }}
                  className={`wm-lesson-btn ${lessonNum === num ? 'active' : ''}`}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>

          {/* How to play */}
          <div className="wm-rules-card mb-4">
            <div className="wm-rule"><span className="wm-rule-icon">👆</span><span>Chạm <strong>1 từ tiếng Nhật</strong> bên trái</span></div>
            <div className="wm-rule"><span className="wm-rule-icon">✅</span><span>Chạm <strong>nghĩa tiếng Việt</strong> tương ứng bên phải</span></div>
            <div className="wm-rule"><span className="wm-rule-icon">⚡</span><span>Ghép đúng liên tục để tích <strong>Combo điểm</strong></span></div>
            <div className="wm-rule"><span className="wm-rule-icon">⏱️</span><span>Hoàn thành càng nhiều vòng trong <strong>{GAME_DURATION}s</strong> càng tốt</span></div>
          </div>

          <button onClick={startGame} className="wm-start-btn">
            <Play size={22} />
            Bắt đầu chơi
          </button>
        </Container>
      </div>
    );
  }

  // ─── PLAYING SCREEN ───
  if (gameState === 'playing') {
    return (
      <div className="wm-page">
        {loading && (
          <div className="wm-loading-overlay">
            <Spinner color="primary" />
          </div>
        )}

        {/* Floating Combo Notification */}
        {floatingCombo && (
          <div key={floatingCombo.id} className="wm-floating-combo">
            {floatingCombo.text}
          </div>
        )}

        <Container className="py-3 py-lg-4" style={{ maxWidth: 760 }}>
          {/* HUD */}
          <div className="wm-hud">
            <div className="wm-hud-stat">
              <Trophy size={16} />
              <span>{score.toLocaleString()}</span>
            </div>
            <div className="wm-timer-wrap">
              <div className="wm-timer-ring" style={{ '--timer-pct': `${timerPct}%`, '--timer-color': timerColor }}>
                <Clock size={13} style={{ color: timerColor }} />
                <span style={{ color: timerColor, fontSize: '18px', fontWeight: 800 }}>{timeLeft}</span>
              </div>
            </div>
            <div className="wm-hud-stat">
              {combo > 1 && <Flame size={16} style={{ color: '#f97316' }} />}
              <span>{combo > 1 ? `x${combo} Combo` : `Bài ${lessonNum}`}</span>
            </div>
          </div>

          {/* Timer progress bar */}
          <div className="wm-timer-bar-wrap">
            <div className="wm-timer-bar" style={{ width: `${timerPct}%`, background: timerColor }} />
          </div>

          {/* Match grid */}
          <div className="wm-match-grid">
            {/* Left: Japanese */}
            <div className="wm-card-col">
              <div className="wm-col-label">🇯🇵 Tiếng Nhật</div>
              {leftCards.map(card => (
                <button
                  key={card.id}
                  className={`wm-card wm-card-left ${shakeIds.has(card.id) ? 'wm-shake' : ''} ${matchedPairs.has(card.pairId) ? 'wm-matched' : ''}`}
                  style={getCardStyle(card, 'left')}
                  onClick={() => handleLeftClick(card)}
                >
                  <div className="wm-card-jp">{card.text}</div>
                  {card.reading && <div className="wm-card-reading">{card.reading}</div>}
                  {matchedPairs.has(card.pairId) && <CheckCircle size={16} className="wm-check-icon" />}
                </button>
              ))}
            </div>

            {/* Right: Vietnamese */}
            <div className="wm-card-col">
              <div className="wm-col-label">🇻🇳 Tiếng Việt</div>
              {rightCards.map(card => (
                <button
                  key={card.id}
                  className={`wm-card wm-card-right ${shakeIds.has(card.id) ? 'wm-shake' : ''} ${matchedPairs.has(card.pairId) ? 'wm-matched' : ''}`}
                  style={getCardStyle(card, 'right')}
                  onClick={() => handleRightClick(card)}
                >
                  <div className="wm-card-vi">{card.text}</div>
                  {matchedPairs.has(card.pairId) && <CheckCircle size={16} className="wm-check-icon" />}
                </button>
              ))}
            </div>
          </div>

          {/* Progress: current round */}
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
              <div className="wm-result-badge new-record">🏆 KỶ LỤC MỚI!</div>
              <h2 className="wm-result-score highlight">{score.toLocaleString()}</h2>
            </>
          ) : (
            <>
              <div className="wm-result-badge">Kết quả</div>
              <h2 className="wm-result-score">{score.toLocaleString()}</h2>
            </>
          )}
          <p className="wm-result-label">điểm</p>

          <div className="wm-result-stats">
            <div className="wm-stat-item">
              <CheckCircle size={18} color="#10b981" />
              <div>
                <div className="wm-stat-val">{totalMatched}</div>
                <div className="wm-stat-key">Cặp đúng</div>
              </div>
            </div>
            <div className="wm-stat-item">
              <Flame size={18} color="#f97316" />
              <div>
                <div className="wm-stat-val">x{maxCombo}</div>
                <div className="wm-stat-key">Combo max</div>
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
            <button onClick={startGame} className="wm-start-btn">
              <RotateCcw size={18} />
              Chơi lại
            </button>
            <button onClick={() => setGameState('setup')} className="wm-secondary-btn">
              <ChevronLeft size={18} />
              Chọn bài khác
            </button>
          </div>

          {!isNewRecord && highScore > 0 && (
            <p className="wm-record-note">
              <Trophy size={14} /> Kỷ lục: {highScore.toLocaleString()} điểm
            </p>
          )}
        </div>
      </Container>
    </div>
  );
};

export default WordMatchPage;
