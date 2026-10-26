import React, { useState, useEffect } from 'react';
import {
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
  CheckSquare,
  Volume2,
  Award,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  RotateCcw,
  Sparkles,
  Zap,
  Target,
  Flame,
  Check,
  BookOpen,
  Info,
  Languages,
  Shuffle,
  ChevronRight,
  HelpCircle,
  Layers
} from 'lucide-react';
import { quizService, speakJapanese } from '../services/api';
import { normalizeQuizQuestion, cleanKatakanaDisplay, getEffectiveKana } from '../utils/katakanaNormalize';
import { sounds } from '../services/sounds';
import { useApp } from '../context/AppContext';
import confetti from 'canvas-confetti';

const hasRealKanji = (str) => /[\u4E00-\u9FAF\u3400-\u4DBF]/.test(str || '');

const QuizPage = ({ initialLesson = 1, onNavigate = () => {} }) => {
  const { updateProgress, awardGardenWater } = useApp();
  const [lessonNum, setLessonNum] = useState(initialLesson);
  const [questionCount, setQuestionCount] = useState(15);
  const [quizMode, setQuizMode] = useState('mixed'); // 'mixed' | 'jp_to_vi' | 'vi_to_jp' | 'kanji_to_reading'
  const [timerSetting, setTimerSetting] = useState('20'); // '20' | '15' | '30' | 'none'
  const [timeLeft, setTimeLeft] = useState(20);

  useEffect(() => {
    if (initialLesson) setLessonNum(initialLesson);
  }, [initialLesson]);

  const [quizState, setQuizState] = useState('setup'); // 'setup' | 'playing' | 'result'
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState([]);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resultSummary, setResultSummary] = useState(null);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [isNavigating, setIsNavigating] = useState(false);
  const [floatingXp, setFloatingXp] = useState(false);
  const [animatedScore, setAnimatedScore] = useState(0);
  const [showAdModal, setShowAdModal] = useState(false);
  const [adCountdown, setAdCountdown] = useState(3);
  const [pendingSummaryData, setPendingSummaryData] = useState(null);

  // Rewarded ad countdown before showing quiz scorecard
  useEffect(() => {
    let timer;
    if (showAdModal && adCountdown > 0) {
      timer = setTimeout(() => {
        setAdCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearTimeout(timer);
  }, [showAdModal, adCountdown]);

  // Animated Count-Up for Quiz Final Score
  useEffect(() => {
    if (quizState === 'result' && resultSummary) {
      const target = resultSummary.score_percentage || 0;
      let start = 0;
      const duration = 850;
      const startTime = performance.now();
      const step = (time) => {
        const progress = Math.min((time - startTime) / duration, 1);
        const current = Math.round(start + (target - start) * progress);
        setAnimatedScore(current);
        if (progress < 1) {
          requestAnimationFrame(step);
        }
      };
      requestAnimationFrame(step);
    }
  }, [quizState, resultSummary]);

  const hasTimer = timerSetting !== 'none';
  const timerDuration = parseInt(timerSetting) || 20;

  // Timer countdown per question
  useEffect(() => {
    let timer;
    if (quizState === 'playing' && hasTimer && !isAnswerSubmitted && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            handleTimeOut();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [quizState, hasTimer, isAnswerSubmitted, timeLeft]);

  // Keyboard shortcuts: 1, 2, 3, 4 to select, Enter to check / advance
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (quizState !== 'playing' || !currentQ) return;
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;

      if (!isAnswerSubmitted) {
        if (['1', '2', '3', '4'].includes(e.key)) {
          const idx = parseInt(e.key) - 1;
          if (currentQ.options && currentQ.options[idx]) {
            sounds.playFlip();
            setSelectedOption(currentQ.options[idx]);
          }
        }
        if (e.key === 'Enter' && selectedOption) {
          handleCheckAnswer();
        }
      } else {
        if (e.key === 'Enter' || e.key === ' ') {
          handleNextQuestion();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [quizState, isAnswerSubmitted, selectedOption, currentIndex, questions]);

  const handleTimeOut = () => {
    if (isAnswerSubmitted) return;
    sounds.playWrong();
    submitAnswerRecord('', false);
  };

  const startQuizWithConfig = async (overrideConfig = {}) => {
    setLoading(true);
    const targetLesson = overrideConfig.lesson ?? lessonNum;
    const targetCount = overrideConfig.count ?? questionCount;
    const targetMode = overrideConfig.mode ?? quizMode;
    const targetTimer = overrideConfig.timer ?? timerSetting;

    try {
      const res = await quizService.getQuiz({
        lesson: targetLesson,
        count: targetCount,
        mode: targetMode
      });
      const cleanQuestions = (res.data?.questions || []).map(normalizeQuizQuestion);
      setQuestions(cleanQuestions);
      setCurrentIndex(0);
      setUserAnswers([]);
      setSelectedOption(null);
      setIsAnswerSubmitted(false);
      setCurrentStreak(0);
      setTimeLeft(targetTimer === 'none' ? 0 : (parseInt(targetTimer) || 20));
      setQuizState('playing');
      sounds.playFlip();
    } catch (err) {
      console.error('Error starting quiz:', err);
      alert('Có lỗi khi tạo bài trắc nghiệm. Vui lòng thử lại!');
    } finally {
      setLoading(false);
    }
  };

  const currentQ = questions[currentIndex];

  const handleCheckAnswer = () => {
    if (!currentQ || isAnswerSubmitted || !selectedOption) return;
    setIsAnswerSubmitted(true);

    const isCorrect = selectedOption === currentQ.correct_answer;
    if (isCorrect) {
      sounds.playCorrect();
      setCurrentStreak((prev) => prev + 1);
      setFloatingXp(true);
      setTimeout(() => setFloatingXp(false), 850);
      if (typeof awardGardenWater === 'function') {
        awardGardenWater(2, 'Trắc nghiệm đúng');
      }
    } else {
      sounds.playWrong();
      setCurrentStreak(0);
    }

    submitAnswerRecord(selectedOption, isCorrect);
  };

  const submitAnswerRecord = (userAnswerText, isCorrect) => {
    if (currentQ.vocabulary_id) {
      updateProgress(currentQ.vocabulary_id, isCorrect ? 'mastered' : 'needs_review', isCorrect).catch(() => {});
    }

    const answerRecord = {
      question_id: currentQ.id,
      vocabulary_id: currentQ.vocabulary_id,
      prompt: currentQ.prompt,
      question: currentQ.question,
      correct_answer: currentQ.correct_answer,
      user_answer: userAnswerText,
      is_correct: isCorrect,
      kanji: currentQ.kanji,
      kana: currentQ.clean_kana || currentQ.kana,
      vietnamese: currentQ.clean_vietnamese || currentQ.vietnamese,
      usage_note: currentQ.usage_note
    };

    setUserAnswers((prev) => [...prev, answerRecord]);
    setIsAnswerSubmitted(true);

    // Speak correct answer
    speakJapanese(currentQ.audio_text || currentQ.clean_kana || currentQ.kana);
  };

  const handleNextQuestion = () => {
    if (isNavigating || loading) return;
    setIsNavigating(true);
    sounds.playFlip();

    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedOption(null);
      setIsAnswerSubmitted(false);
      setTimeLeft(timerDuration);
      setTimeout(() => setIsNavigating(false), 220);
    } else {
      finishQuiz();
    }
  };

  const finishQuiz = async () => {
    if (loading) return;
    setLoading(true);
    const correctCount = userAnswers.filter((a) => a.is_correct).length;
    try {
      const submitRes = await quizService.submitQuiz({
        session_type: 'quiz',
        lesson_number: lessonNum === 'all' ? null : parseInt(lessonNum),
        total_questions: questions.length,
        correct_answers: correctCount,
        results: userAnswers
      });

      setPendingSummaryData(submitRes.data);
      // Display short ad / sponsored transition modal (Google AdSense / Monetag UX)
      setShowAdModal(true);
      setAdCountdown(3);
    } catch (err) {
      console.error('Error submitting quiz:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleProceedToResult = () => {
    setShowAdModal(false);
    if (pendingSummaryData) {
      setResultSummary(pendingSummaryData);
    }
    setQuizState('result');

    const correctCount = userAnswers.filter((a) => a.is_correct).length;
    if ((correctCount / questions.length) >= 0.75) {
      sounds.playComplete();
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

    if (typeof awardGardenWater === 'function') {
      const bonus = Math.round(correctCount * 1.5) + 10;
      awardGardenWater(bonus, `Hoàn thành trắc nghiệm (${correctCount}/${questions.length})`);
    }
  };

  const handleRetryWrongOnly = () => {
    const wrongAnswers = userAnswers.filter((a) => !a.is_correct);
    if (wrongAnswers.length === 0) return;

    const wrongQList = questions.filter((q) =>
      wrongAnswers.some((w) => w.vocabulary_id === q.vocabulary_id)
    );

    if (wrongQList.length > 0) {
      setQuestions(wrongQList);
      setCurrentIndex(0);
      setUserAnswers([]);
      setSelectedOption(null);
      setIsAnswerSubmitted(false);
      setCurrentStreak(0);
      setTimeLeft(timerDuration);
      setQuizState('playing');
      sounds.playFlip();
    }
  };

  const modeCards = [
    {
      id: 'mixed',
      title: 'Đề Thi Tổng Hợp',
      sub: 'Chuẩn format JLPT N5',
      icon: Shuffle,
      color: '#2563eb',
      badge: 'Khuyên Dùng',
      desc: 'Xáo trộn ngẫu nhiên cả 3 dạng: xem từ đoán nghĩa, xem nghĩa chọn từ và đọc chữ Hán.'
    },
    {
      id: 'jp_to_vi',
      title: 'Nhật sang Việt',
      sub: 'Phản xạ đọc hiểu',
      icon: BookOpen,
      color: '#059669',
      badge: 'Cơ Bản',
      desc: 'Nhìn từ vựng tiếng Nhật (Kanji/Kana), chọn ý nghĩa tiếng Việt chuẩn xác nhất.'
    },
    {
      id: 'vi_to_jp',
      title: 'Việt sang Nhật',
      sub: 'Phản xạ diễn đạt',
      icon: Languages,
      color: '#d97706',
      badge: 'Ghi Nhớ',
      desc: 'Nhìn nghĩa tiếng Việt, truy xuất từ vựng tiếng Nhật và cách viết đúng.'
    },
    {
      id: 'kanji_to_reading',
      title: 'Hán tự & Từ vựng',
      sub: 'Đọc âm Kana',
      icon: Sparkles,
      color: '#7c3aed',
      badge: 'Chuyên Sâu',
      desc: 'Nhìn Hán tự và từ vựng N5, chọn cách đọc Kana (Hiragana/Katakana) chuẩn xác.'
    }
  ];

  return (
    <div className="app-shell" style={{ maxWidth: '860px' }}>
      {/* ── 1. SETUP STATE ── */}
      {quizState === 'setup' && (
        <>
          {/* System Page Header */}
          <div className="app-page-header">
            <div className="d-flex justify-content-between align-items-start flex-wrap gap-3">
              <div>
                <div className="app-header-tag">
                  <CheckSquare size={13} />
                  <span>TRẮC NGHIỆM ABCD • JLPT N5</span>
                </div>
                <h1 className="app-header-title">
                  Trắc Nghiệm JLPT N5
                </h1>
                <p className="app-header-subtitle">
                  Hệ thống 4 lựa chọn ABCD chuẩn format kỳ thi năng lực tiếng Nhật, tích hợp tính giờ phản xạ và giải thích đáp án chi tiết.
                </p>
              </div>

              <div className="d-flex align-items-center gap-2 ms-auto">
                <span className="badge bg-primary bg-opacity-10 text-primary fw-bold px-3 py-1.5 rounded-pill border border-primary border-opacity-20" style={{ fontSize: '11.5px' }}>
                  100% Khách Quan ABCD
                </span>
              </div>
            </div>
          </div>

          {/* Mode Selection Cards */}
          <div className="mb-3">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="small text-muted fw-bold text-uppercase tracking-wider" style={{ fontSize: '11px' }}>
                Chọn dạng câu hỏi
              </span>
              <span className="badge bg-slate-100 text-slate-700 border border-slate-200 rounded-pill px-2.5 py-0.5 small fw-semibold" style={{ fontSize: '10.5px' }}>
                4 định dạng chuẩn N5
              </span>
            </div>

            <Row className="g-2">
              {modeCards.map((m) => {
                const isSelected = quizMode === m.id;
                const IconComponent = m.icon;
                return (
                  <Col xs={6} md={3} key={m.id}>
                    <div
                      className={`p-2.5 rounded-3 border transition-all h-100 d-flex flex-column justify-content-between ${
                        isSelected
                          ? 'border-primary bg-primary bg-opacity-10 shadow-xs'
                          : 'bg-white border-slate-200 hover-shadow'
                      }`}
                      style={{
                        borderColor: isSelected ? '#2563eb' : '#e2e8f0',
                        cursor: 'pointer'
                      }}
                      onClick={() => {
                        sounds.playFlip();
                        setQuizMode(m.id);
                      }}
                    >
                      <div className="d-flex align-items-center justify-content-between mb-1.5">
                        <div
                          className="rounded-circle d-flex align-items-center justify-content-center"
                          style={{
                            background: isSelected ? '#2563eb' : '#f1f5f9',
                            color: isSelected ? '#ffffff' : m.color || '#64748b',
                            width: '28px',
                            height: '28px'
                          }}
                        >
                          <IconComponent size={14} strokeWidth={2.4} />
                        </div>
                        {isSelected ? (
                          <span className="badge bg-primary rounded-circle p-0.5 d-inline-flex align-items-center justify-content-center" style={{ width: 16, height: 16 }}>
                            <Check size={10} color="#fff" />
                          </span>
                        ) : (
                          <span className="badge bg-light text-muted border rounded-pill px-1.5 py-0.5" style={{ fontSize: '9.5px' }}>
                            {m.badge}
                          </span>
                        )}
                      </div>
                      <div>
                        <h6 className={`fw-bold mb-0 text-truncate ${isSelected ? 'text-primary' : 'text-dark'}`} style={{ fontSize: '12.5px' }}>
                          {m.title}
                        </h6>
                        <span className="text-muted small d-block text-truncate" style={{ fontSize: '10.5px' }}>
                          {m.sub}
                        </span>
                      </div>
                    </div>
                  </Col>
                );
              })}
            </Row>
          </div>

          {/* Test Parameters Settings Panel */}
          <Card className="jlpt-card border-0 shadow-sm p-3 p-md-4 rounded-4 bg-white mb-3 mb-md-4">
            <h6 className="fw-bold text-navy-dark mb-2.5 d-flex align-items-center gap-2" style={{ fontSize: '13.5px' }}>
              <Target size={15} className="text-primary" />
              <span>Tùy chỉnh thông số bài thi</span>
            </h6>

            <Row className="g-2.5">
              {/* Scope Selection */}
              <Col xs={12} md={4}>
                <label className="fw-semibold small text-secondary mb-1 d-block" style={{ fontSize: '11.5px' }}>
                  Phạm vi bài học
                </label>
                <Input
                  type="select"
                  value={lessonNum}
                  onChange={(e) => setLessonNum(e.target.value)}
                  className="py-1.5 rounded-3 fw-medium form-select"
                  style={{ fontSize: '13px' }}
                >
                  <option value="all">Toàn bộ 25 bài N5 (1,589 từ)</option>
                  {Array.from({ length: 25 }, (_, i) => i + 1).map((n) => (
                    <option key={n} value={n}>
                      Bài {n < 10 ? `0${n}` : n}
                    </option>
                  ))}
                </Input>
              </Col>

              {/* Question Count Selection */}
              <Col xs={12} md={4}>
                <label className="fw-semibold small text-secondary mb-1 d-block" style={{ fontSize: '11.5px' }}>
                  Số lượng câu hỏi
                </label>
                <div className="d-flex gap-1 flex-wrap">
                  {[15, 20, 30, 40, 'all'].map((cnt) => (
                    <button
                      key={cnt}
                      type="button"
                      onClick={() => { sounds.playFlip(); setQuestionCount(cnt); }}
                      className={`btn btn-sm flex-fill rounded-3 border fw-bold ${
                        questionCount === cnt
                          ? 'btn-primary text-white shadow-xs'
                          : 'btn-light text-dark'
                      }`}
                      style={{ fontSize: '11px', padding: '6px 4px' }}
                    >
                      {cnt === 'all' ? 'Toàn bài' : `${cnt} câu`}
                    </button>
                  ))}
                </div>
              </Col>

              {/* Timer Duration Selection */}
              <Col xs={12} md={4}>
                <label className="fw-semibold small text-secondary mb-1 d-block" style={{ fontSize: '11.5px' }}>
                  Thời gian bấm giờ / câu
                </label>
                <div className="d-flex gap-1">
                  {[
                    { id: '15', label: '15s' },
                    { id: '20', label: '20s' },
                    { id: '30', label: '30s' },
                    { id: 'none', label: '∞' }
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => { sounds.playFlip(); setTimerSetting(t.id); }}
                      className={`btn btn-sm flex-fill rounded-3 border fw-bold ${
                        timerSetting === t.id
                          ? 'btn-primary text-white'
                          : 'btn-light text-dark'
                      }`}
                      style={{ fontSize: '11.5px', padding: '6px 2px' }}
                      title={t.id === 'none' ? 'Không giới hạn thời gian' : `${t.id} giây mỗi câu`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </Col>
            </Row>

            {/* Launch CTA Button */}
            <div className="text-center pt-3 mt-2 border-top">
              <button
                type="button"
                className="btn text-white fw-bold d-inline-flex align-items-center justify-content-center gap-2 rounded-pill shadow-sm w-100 w-md-auto"
                style={{
                  background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                  padding: '11px 36px',
                  fontSize: '14.5px',
                  minWidth: '240px',
                  border: 'none',
                  boxShadow: '0 4px 18px rgba(37, 99, 235, 0.35)'
                }}
                onClick={() => startQuizWithConfig()}
                disabled={loading}
              >
                {loading ? <Spinner size="sm" /> : <Sparkles size={16} />}
                <span>Bắt đầu làm bài thi ngay</span>
              </button>
            </div>
          </Card>
        </>
      )}

      {/* ── 2. PLAYING STATE (ABCD MULTIPLE CHOICE) ── */}
      {quizState === 'playing' && currentQ && (
        <>
          {/* Top Status Bar */}
          <div className="d-flex justify-content-between align-items-center mb-2 flex-wrap gap-1.5">
            <div className="d-flex align-items-center gap-1.5">
              <Badge
                color="primary"
                pill
                className="px-2.5 py-1 fw-bold"
                style={{ fontSize: '11.5px' }}
              >
                Câu {currentIndex + 1} / {questions.length}
              </Badge>
              <Badge
                color="light"
                pill
                className="px-2 py-0.5 text-secondary border fw-semibold"
                style={{ fontSize: '11px' }}
              >
                Bài {currentQ.lesson_number}
              </Badge>
              {currentStreak >= 2 && (
                <Badge
                  color="warning"
                  pill
                  className="text-dark fw-bold px-2 py-0.5 d-flex align-items-center gap-1 combo-pulse"
                  style={{ fontSize: '11px' }}
                >
                  <Flame size={12} color="#dc2626" className="flame-icon" />
                  <span>Chuỗi {currentStreak}</span>
                </Badge>
              )}
            </div>

            {hasTimer && (
              <div
                className={`d-flex align-items-center gap-1 fw-bold px-2.5 py-0.5 rounded-pill ${
                  timeLeft <= 5 ? 'bg-danger text-white' : 'bg-white text-dark border shadow-xs'
                }`}
                style={{ fontSize: '12px' }}
              >
                <Clock size={13} />
                <span>{timeLeft}s</span>
              </div>
            )}
          </div>

          {/* Animated Progress Bar */}
          <Progress
            value={((currentIndex + 1) / questions.length) * 100}
            color="primary"
            className="mb-2.5 rounded-pill"
            style={{ height: '5px' }}
          />

          <Card className="jlpt-card border-0 shadow-sm mb-3 rounded-4 bg-white position-relative">
            <CardBody className="p-3 p-md-5 position-relative">
              {/* Floating +10 XP badge */}
              {floatingXp && (
                <div className="floating-xp-badge">
                  +10 XP · Đã Thành Thạo!
                </div>
              )}

              {/* Question Prompt Area */}
              <div className="text-center mb-3 mb-md-4 pb-2.5 pb-md-3 border-bottom">
                <span className="text-secondary small fw-semibold text-uppercase tracking-wider d-block mb-1.5" style={{ fontSize: '11px' }}>
                  {currentQ.prompt}
                </span>

                <div className="d-flex align-items-center justify-content-center gap-2">
                  <h2
                    className="fw-bold text-navy-dark mb-0 font-monospace"
                    style={{ fontSize: 'clamp(1.4rem, 5vw, 2.2rem)' }}
                  >
                    {cleanKatakanaDisplay(currentQ.question)}
                  </h2>
                  <Button
                    color="light"
                    size="sm"
                    className="p-1.5 rounded-circle border text-primary audio-btn"
                    onClick={() => speakJapanese(getEffectiveKana(currentQ) || currentQ.audio_text || currentQ.clean_kana || currentQ.kana)}
                    title="Nghe phát âm chuẩn Tokyo"
                  >
                    <Volume2 size={16} />
                  </Button>
                </div>
              </div>

              {/* 4 Options Grid (ABCD) */}
              <Row className="g-2.5 g-md-3 mb-3 mb-md-4">
                {currentQ.options?.map((opt, idx) => {
                  let choiceClass = 'quiz-choice-card';
                  if (isAnswerSubmitted) {
                    if (opt === currentQ.correct_answer) {
                      choiceClass += ' is-correct';
                    } else if (selectedOption === opt) {
                      choiceClass += ' is-wrong';
                    } else {
                      choiceClass += ' opacity-50 pe-none';
                    }
                  } else if (selectedOption === opt) {
                    choiceClass += ' is-selected';
                  }

                  return (
                    <Col xs={12} sm={6} key={idx}>
                      <div
                        onClick={() => {
                          if (!isAnswerSubmitted) {
                            sounds.playFlip();
                            setSelectedOption(opt);
                          }
                        }}
                        className={choiceClass}
                      >
                        <div className="quiz-choice-letter">
                          {String.fromCharCode(65 + idx)}
                        </div>
                        <div className="fs-6 fw-bold flex-grow-1 text-slate-800 font-monospace">
                          {cleanKatakanaDisplay(opt)}
                        </div>

                        {isAnswerSubmitted && opt === currentQ.correct_answer && (
                          <CheckCircle size={20} className="text-success flex-shrink-0" />
                        )}
                        {isAnswerSubmitted && selectedOption === opt && opt !== currentQ.correct_answer && (
                          <XCircle size={20} className="text-danger flex-shrink-0" />
                        )}
                      </div>
                    </Col>
                  );
                })}
              </Row>

              {/* Action Buttons */}
              <div className="d-flex justify-content-center">
                {!isAnswerSubmitted ? (
                  <button
                    type="button"
                    className="btn btn-primary px-4 px-md-5 py-2 py-md-2.5 fw-bold rounded-pill shadow-sm w-100 w-sm-auto"
                    style={{ minWidth: '200px', fontSize: '14px' }}
                    disabled={!selectedOption}
                    onClick={handleCheckAnswer}
                  >
                    Kiểm tra đáp án
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={isNavigating || loading}
                    className={`btn btn-primary px-4 px-md-5 py-2 py-md-2.5 fw-bold rounded-pill shadow-sm d-flex align-items-center justify-content-center gap-2 w-100 w-sm-auto ${
                      isNavigating || loading ? 'opacity-75 pe-none' : ''
                    }`}
                    style={{ minWidth: '200px', fontSize: '14px' }}
                    onClick={handleNextQuestion}
                  >
                    <span>
                      {currentIndex < questions.length - 1 ? 'Câu tiếp theo' : 'Xem kết quả bài thi'}
                    </span>
                    <ChevronRight size={16} />
                  </button>
                )}
              </div>

              {/* Post-Answer Detailed Explanation Card */}
              {isAnswerSubmitted && (
                <div
                  className="mt-4 p-3.5 rounded-3 border"
                  style={{
                    background: userAnswers[userAnswers.length - 1]?.is_correct ? 'var(--success-subtle)' : 'var(--slate-50)',
                    borderColor: userAnswers[userAnswers.length - 1]?.is_correct ? 'var(--success-border)' : 'var(--slate-200)'
                  }}
                >
                  <div className="d-flex align-items-center justify-content-between mb-2">
                    <div className="d-flex align-items-center gap-2">
                      {userAnswers[userAnswers.length - 1]?.is_correct ? (
                        <Badge color="success" pill className="d-flex align-items-center gap-1 px-2.5 py-1">
                          <CheckCircle size={13} /> Chính xác!
                        </Badge>
                      ) : (
                        <Badge color="danger" pill className="d-flex align-items-center gap-1 px-2.5 py-1">
                          <XCircle size={13} /> Chưa đúng
                        </Badge>
                      )}
                      <span className="small text-muted fw-bold">Giải thích chi tiết:</span>
                    </div>

                    <Button
                      color="light"
                      size="sm"
                      className="border rounded-circle p-1 audio-btn"
                      onClick={() => speakJapanese(getEffectiveKana(currentQ) || currentQ.clean_kana || currentQ.kana)}
                      title="Nghe phát âm chuẩn"
                    >
                      <Volume2 size={14} className="text-primary" />
                    </Button>
                  </div>

                  <div className="row g-2 small">
                    <div className="col-sm-6">
                      <span className="text-muted">Từ tiếng Nhật:</span>{' '}
                      <strong className="text-navy-dark font-monospace">{getEffectiveKana(currentQ) || currentQ.clean_kana || currentQ.kana}</strong>{' '}
                      {currentQ.kanji && hasRealKanji(currentQ.kanji) && `(${currentQ.kanji})`}
                    </div>
                    <div className="col-sm-6">
                      <span className="text-muted">Nghĩa tiếng Việt chuẩn:</span>{' '}
                      <strong className="text-success">{currentQ.clean_vietnamese || currentQ.vietnamese}</strong>
                    </div>
                  </div>

                  {currentQ.usage_note && (
                    <div className="small text-secondary mt-2 pt-2 border-top" style={{ fontSize: '12px' }}>
                      <strong>Ngữ cảnh sử dụng:</strong> {currentQ.usage_note}
                    </div>
                  )}
                </div>
              )}
            </CardBody>
          </Card>
        </>
      )}

      {/* ── 3. RESULT STATE (SCORE REPORT & REVIEW) ── */}
      {quizState === 'result' && resultSummary && (
        <Card className="jlpt-card border-0 shadow-sm p-4 p-md-5 rounded-4 text-center bg-white">
          <div className="mb-3">
            <div
              className="d-inline-flex align-items-center justify-content-center p-3 rounded-circle text-white shadow-sm mb-2"
              style={{
                width: '64px',
                height: '64px',
                background:
                  resultSummary.score_percentage >= 80
                    ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                    : resultSummary.score_percentage >= 50
                    ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
                    : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
              }}
            >
              <Award size={32} />
            </div>
            <h3 className="fw-bold text-navy-dark mb-1">Kết Quả Bài Thi Trắc Nghiệm</h3>
            <p className="text-muted small">{resultSummary.evaluation}</p>
          </div>

          <div className="display-4 fw-black text-primary mb-3">
            {animatedScore}%
          </div>

          <Row className="g-2 justify-content-center mb-4" style={{ maxWidth: '480px', margin: '0 auto' }}>
            <Col xs={4}>
              <div className="p-3 bg-light rounded-3 border">
                <div className="small text-muted" style={{ fontSize: '11px' }}>Tổng số câu</div>
                <div className="fw-bold fs-5 text-dark">{resultSummary.total_questions}</div>
              </div>
            </Col>
            <Col xs={4}>
              <div className="p-3 rounded-3 border" style={{ background: 'var(--success-subtle)', borderColor: 'var(--success-border)', color: 'var(--success)' }}>
                <div className="small" style={{ fontSize: '11px' }}>Số câu đúng</div>
                <div className="fw-bold fs-5">{resultSummary.correct_answers}</div>
              </div>
            </Col>
            <Col xs={4}>
              <div className="p-3 rounded-3 border" style={{ background: 'var(--danger-subtle)', borderColor: 'var(--danger-border)', color: 'var(--danger)' }}>
                <div className="small" style={{ fontSize: '11px' }}>Số câu sai</div>
                <div className="fw-bold fs-5">{resultSummary.wrong_answers}</div>
              </div>
            </Col>
          </Row>

          <div className="d-flex justify-content-center gap-2 flex-wrap mb-4">
            <button
              type="button"
              className="btn btn-primary fw-semibold px-4 rounded-pill shadow-xs"
              onClick={() => {
                setQuizState('setup');
                sounds.playFlip();
              }}
            >
              <RotateCcw size={15} className="me-1.5" /> Làm bài kiểm tra khác
            </button>

            {resultSummary.wrong_answers > 0 && (
              <button
                type="button"
                className="btn btn-outline-danger fw-semibold px-4 rounded-pill"
                onClick={handleRetryWrongOnly}
              >
                <RefreshCw size={15} className="me-1.5" /> Luyện lại {resultSummary.wrong_answers} câu sai
              </button>
            )}

            <button
              type="button"
              className="btn btn-light fw-semibold px-4 rounded-pill border text-secondary"
              onClick={() => onNavigate('review')}
            >
              Sổ tay từ cần ôn
            </button>
          </div>

          {/* Breakdown Review of each question */}
          <div className="text-start mt-4 pt-4 border-top">
            <h6 className="fw-bold text-navy-dark mb-3">Rà soát chi tiết từng câu hỏi:</h6>
            <div className="d-flex flex-column gap-2">
              {userAnswers.map((ans, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-3 border d-flex justify-content-between align-items-center flex-wrap gap-2 ${
                    ans.is_correct
                      ? 'bg-light border-slate-200'
                      : 'border-danger border-opacity-25'
                  }`}
                  style={{
                    backgroundColor: ans.is_correct ? '#ffffff' : 'var(--danger-subtle)'
                  }}
                >
                  <div className="d-flex align-items-center gap-2.5">
                    {ans.is_correct ? (
                      <CheckCircle size={18} className="text-success flex-shrink-0" />
                    ) : (
                      <XCircle size={18} className="text-danger flex-shrink-0" />
                    )}
                    <div>
                      <div className="fw-semibold text-dark small font-monospace">
                        Câu {idx + 1}: {ans.question}
                      </div>
                      <div className="small text-muted" style={{ fontSize: '12px' }}>
                        Bạn chọn: <strong className={ans.is_correct ? 'text-success' : 'text-danger'}>{ans.user_answer || '(Hết giờ/Để trống)'}</strong>
                        {!ans.is_correct && (
                          <> • Đáp án đúng: <strong className="text-success">{ans.correct_answer}</strong></>
                        )}
                      </div>
                    </div>
                  </div>

                  <Button
                    color="light"
                    size="sm"
                    className="p-1 rounded-circle border audio-btn"
                    onClick={() => speakJapanese(ans.kana)}
                    title="Nghe phát âm chuẩn Tokyo"
                  >
                    <Volume2 size={15} className="text-primary" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* ── SHORT AD / SPONSORED ANALYSIS TRANSITION MODAL (Google AdSense / Monetag UX) ── */}
      {showAdModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Đang chuẩn bị bảng điểm phân tích"
          className="fixed-top w-100 h-100 d-flex align-items-center justify-content-center"
          style={{
            zIndex: 99999,
            background: 'rgba(7, 12, 22, 0.85)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            padding: '16px'
          }}
        >
          <div
            className="bg-white rounded-4 shadow-xl border overflow-hidden p-3 p-md-4 text-center"
            style={{
              maxWidth: '460px',
              width: '100%',
              borderColor: 'var(--slate-200)',
              animation: 'scaleUp 0.22s ease-out'
            }}
          >
            {/* Top Badges */}
            <div className="d-flex align-items-center justify-content-between mb-2 pb-2 border-bottom border-slate-100">
              <span className="badge rounded-pill bg-primary bg-opacity-10 text-primary border border-primary border-opacity-20 fw-bold px-2.5 py-1" style={{ fontSize: '11px' }}>
                KẾT QUẢ THI TRẮC NGHIỆM
              </span>
              <span className="badge rounded-pill bg-slate-100 text-slate-500 border fw-semibold px-2 py-0.5" style={{ fontSize: '10px' }}>
                TÀI TRỢ
              </span>
            </div>

            <h5 className="fw-bold text-navy-dark mb-1" style={{ fontSize: '16.5px' }}>
              Đang Chuẩn Bị Bảng Điểm Phân Tích
            </h5>
            <p className="text-muted small mb-3" style={{ fontSize: '12.5px', lineHeight: '1.5' }}>
              Hệ thống đang đối chiếu đáp án và tổng hợp dữ liệu tiến độ Minna N5 của bạn.
            </p>

            {/* Sponsored / Ad Container Slot (Google AdSense & Monetag Ready) */}
            <div
              className="p-3 rounded-3 mb-3 text-start position-relative border"
              style={{
                background: 'linear-gradient(135deg, #f8fafc 0%, #eff6ff 100%)',
                borderColor: '#bfdbfe'
              }}
            >
              <div className="d-flex align-items-center justify-content-between mb-1.5">
                <div className="d-flex align-items-center gap-1.5">
                  <Sparkles size={14} className="text-warning flex-shrink-0" />
                  <span className="fw-bold small text-navy-dark" style={{ fontSize: '12px' }}>
                    HYPER JAPAN VIP PRO & DU HỌC
                  </span>
                </div>
                <span className="small text-muted" style={{ fontSize: '10.5px' }}>Quảng cáo đối tác</span>
              </div>

              {/* Slot for Google AdSense Responsive Unit */}
              <div className="adsense-quiz-slot d-none">
                <ins
                  className="adsbygoogle"
                  style={{ display: 'block', minHeight: '80px' }}
                  data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
                  data-ad-slot="XXXXXXXXXX"
                  data-ad-format="rectangle"
                />
              </div>

              <div className="small text-secondary mb-2" style={{ fontSize: '12px', lineHeight: '1.5' }}>
                Mở khóa trọn bộ 25 bài Minna, 75 câu trợ từ nâng cao, phòng thi ảo JLPT không giới hạn và Sensei AI 24/7.
              </div>

              <div className="d-flex align-items-center justify-content-between pt-2 border-top border-blue-100">
                <span className="fw-bold text-primary small" style={{ fontSize: '11.5px' }}>
                  Ưu đãi học viên chỉ 49k/tháng
                </span>
                <span className="badge bg-primary text-white rounded-pill px-2.5 py-1 fw-bold" style={{ fontSize: '11px' }}>
                  Khám phá ngay
                </span>
              </div>
            </div>

            {/* Countdown / CTA Action (Rule 6.1: 44px min touch target) */}
            <div className="d-flex flex-column gap-2">
              <Button
                color="primary"
                onClick={handleProceedToResult}
                className="w-100 py-2.5 fw-bold rounded-pill shadow-sm d-flex align-items-center justify-content-center gap-1.5 nav-btn-touch"
                style={{
                  fontSize: '13.5px',
                  minHeight: '44px'
                }}
              >
                {adCountdown > 0 ? (
                  <>
                    <Clock size={15} />
                    <span>Xem Bảng Điểm Phân Tích ({adCountdown}s)</span>
                  </>
                ) : (
                  <>
                    <span>Xem Bảng Điểm Phân Tích</span>
                    <ChevronRight size={16} />
                  </>
                )}
              </Button>

              {adCountdown > 0 && (
                <button
                  type="button"
                  onClick={handleProceedToResult}
                  className="btn btn-sm btn-link text-muted text-decoration-none py-1 nav-btn-touch"
                  style={{ fontSize: '11.5px', minHeight: '36px' }}
                  aria-label="Bỏ qua quảng cáo và xem điểm ngay"
                >
                  Bỏ qua quảng cáo và xem điểm
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizPage;
