import React, { useState, useEffect } from 'react';
import {
  Container,
  Row,
  Col,
  Card,
  CardBody,
  Button,
  Badge,
  Input,
  Spinner
} from 'reactstrap';
import {
  Keyboard,
  Volume2,
  CheckCircle,
  XCircle,
  RotateCcw,
  Sparkles,
  ArrowRightLeft,
  Check,
  Eye,
  Filter,
  Info
} from 'lucide-react';
import * as wanakana from 'wanakana';
import { vocabService, speakJapanese } from '../services/api';
import { sounds } from '../services/sounds';
import { useApp } from '../context/AppContext';
import confetti from 'canvas-confetti';

const PracticeInputPage = ({ initialLesson = 1 }) => {
  const { updateProgress } = useApp();
  const [lessonNum, setLessonNum] = useState(initialLesson);
  const [vocabList, setVocabList] = useState([]);
  const [userInputs, setUserInputs] = useState({});
  const [checkResults, setCheckResults] = useState({});
  const [revealedIds, setRevealedIds] = useState({});
  const [autoKana, setAutoKana] = useState(true);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'unanswered' | 'wrong' | 'correct'

  // Practice Mode: 'vi_to_jp' (Tiếng Việt -> Gõ Kana) or 'jp_to_jp' (Kanji -> Gõ Kana)
  const [inputMode, setInputMode] = useState('vi_to_jp');

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
    try {
      const res = await vocabService.getVocabularies({ lesson: parseInt(lesson) });
      setVocabList(res.data);
    } catch (err) {
      console.error('Error fetching practice vocab:', err);
    } finally {
      setLoading(false);
    }
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

    // Instant match check: If user typed the full correct word, immediately trigger SUCCESS!
    if (trimmedInput === cleanExpected || trimmedInput === expectedKana.trim()) {
      setCheckResults(prev => ({ ...prev, [id]: true }));
      sounds.playCorrect();
      speakJapanese(cleanExpected);
      updateProgress(id, 'mastered', true);
    }
  };

  // Evaluate on Enter, Blur, or Check Button click
  const handleEvaluate = (id, expectedKana) => {
    const val = (userInputs[id] || '').trim();
    if (!val) return;

    const cleanExpected = expectedKana.replace(/[［\[］\]]/g, '').trim();
    const isCorrect = val === cleanExpected || val === expectedKana.trim();

    setCheckResults(prev => ({ ...prev, [id]: isCorrect }));

    if (isCorrect) {
      sounds.playCorrect();
      speakJapanese(cleanExpected);
      updateProgress(id, 'mastered', true);
    } else {
      sounds.playWrong();
      updateProgress(id, 'needs_review', false);
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
  };

  // Statistics
  const total = vocabList.length;
  const answeredCount = Object.keys(checkResults).length;
  const correctCount = Object.values(checkResults).filter(Boolean).length;
  const wrongCount = answeredCount - correctCount;
  const accuracyRate = answeredCount > 0 ? Math.round((correctCount / answeredCount) * 100) : 0;

  useEffect(() => {
    if (total > 0 && answeredCount === total && correctCount === total) {
      sounds.playComplete();
      confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
    }
  }, [correctCount, answeredCount, total]);

  // Filtering vocab list
  const filteredVocabList = vocabList.filter(item => {
    const res = checkResults[item.id];
    if (activeFilter === 'correct') return res === true;
    if (activeFilter === 'wrong') return res === false;
    if (activeFilter === 'unanswered') return res === undefined;
    return true;
  });

  return (
    <Container className="py-3 py-md-4">
      {/* ── Top Header & Stats KPI Bar ── */}
      <div className="page-header-box mb-4">
        <Row className="align-items-center g-3">
          <Col lg={4}>
            <div className="d-flex align-items-center gap-3">
              <div
                className="d-flex align-items-center justify-content-center rounded-3 text-white shadow-sm flex-shrink-0"
                style={{
                  width: '46px',
                  height: '46px',
                  background: 'linear-gradient(135deg, #1e3a8a, #2563eb)'
                }}
              >
                <Keyboard size={24} />
              </div>
              <div>
                <h5 className="fw-bold mb-0 text-navy-dark">Luyện Gõ Đáp Án Kana</h5>
                <small className="text-muted">Tự nhớ và gõ tiếng Nhật không gợi ý</small>
              </div>
            </div>
          </Col>

          {/* Lesson selector & IME switch */}
          <Col lg={4}>
            <div className="d-flex align-items-center justify-content-lg-center gap-2">
              <span className="small text-muted fw-bold">Chọn bài:</span>
              <Input
                type="select"
                value={lessonNum}
                onChange={(e) => setLessonNum(parseInt(e.target.value))}
                className="w-auto fw-bold form-control-sm rounded-pill"
              >
                {Array.from({ length: 25 }, (_, i) => i + 1).map((n) => (
                  <option key={n} value={n}>
                    Bài {n < 10 ? `0${n}` : n}
                  </option>
                ))}
              </Input>

              <Button
                color={autoKana ? 'primary' : 'light'}
                size="sm"
                onClick={() => setAutoKana(!autoKana)}
                className={`rounded-pill px-3 fw-semibold border shadow-xs ${
                  autoKana ? 'text-white' : 'text-muted'
                }`}
                title="Tự động biến Romaji thành Hiragana"
              >
                IME {autoKana ? 'Bật (Auto Kana)' : 'Tắt'}
              </Button>

              <Button
                color="light"
                size="sm"
                onClick={handleReset}
                title="Làm lại từ đầu"
                className="rounded-circle border p-1 audio-btn"
                style={{ width: '32px', height: '32px' }}
              >
                <RotateCcw size={15} />
              </Button>
            </div>
          </Col>

          {/* KPI Mini Chips */}
          <Col lg={4}>
            <div className="d-flex justify-content-between text-center gap-1.5">
              <div className="bg-light p-2 rounded-3 flex-fill border">
                <div className="small text-muted" style={{ fontSize: '11px' }}>Đã làm</div>
                <div className="fw-bold fs-6 text-navy-dark">{answeredCount}/{total}</div>
              </div>
              <div className="p-2 rounded-3 flex-fill border" style={{ background: 'var(--success-subtle)', borderColor: 'var(--success-border)', color: 'var(--success)' }}>
                <div className="small" style={{ fontSize: '11px' }}>Đúng</div>
                <div className="fw-bold fs-6">{correctCount}</div>
              </div>
              <div className="p-2 rounded-3 flex-fill border" style={{ background: 'var(--danger-subtle)', borderColor: 'var(--danger-border)', color: 'var(--danger)' }}>
                <div className="small" style={{ fontSize: '11px' }}>Sai</div>
                <div className="fw-bold fs-6">{wrongCount}</div>
              </div>
              <div className="p-2 rounded-3 flex-fill border" style={{ background: 'var(--primary-subtle)', borderColor: 'var(--primary-border)', color: 'var(--primary)' }}>
                <div className="small" style={{ fontSize: '11px' }}>Chính xác</div>
                <div className="fw-bold fs-6">{accuracyRate}%</div>
              </div>
            </div>
          </Col>
        </Row>

        {/* Mode Switcher & Filter Pills */}
        <div className="mt-3 pt-3 border-top d-flex justify-content-between align-items-center flex-wrap gap-2">
          <div className="d-flex align-items-center gap-2">
            <span className="small text-muted fw-bold">Chế độ gõ:</span>
            <div className="segmented-control">
              <button
                type="button"
                onClick={() => {
                  if (inputMode !== 'vi_to_jp') {
                    setInputMode('vi_to_jp');
                    handleReset();
                    sounds.playFlip();
                  }
                }}
                className={`segmented-item ${inputMode === 'vi_to_jp' ? 'active' : ''}`}
              >
                <span>🇻🇳 Tiếng Việt ➔ 🇯🇵 Gõ Kana</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  if (inputMode !== 'jp_to_jp') {
                    setInputMode('jp_to_jp');
                    handleReset();
                    sounds.playFlip();
                  }
                }}
                className={`segmented-item ${inputMode === 'jp_to_jp' ? 'active' : ''}`}
              >
                <span>🈴 Kanji ➔ ✍️ Gõ Kana</span>
              </button>
            </div>
          </div>

          <div className="d-flex align-items-center gap-1.5 flex-wrap">
            <span className="small text-muted fw-bold me-1 d-flex align-items-center gap-1">
              <Filter size={13} /> Lọc:
            </span>
            <Button
              color={activeFilter === 'all' ? 'primary' : 'light'}
              size="sm"
              onClick={() => setActiveFilter('all')}
              className="rounded-pill px-2.5 py-1 fw-semibold border"
            >
              Tất cả ({total})
            </Button>
            <Button
              color={activeFilter === 'unanswered' ? 'secondary' : 'light'}
              size="sm"
              onClick={() => setActiveFilter('unanswered')}
              className="rounded-pill px-2.5 py-1 fw-semibold border"
            >
              Chưa gõ ({total - answeredCount})
            </Button>
            <Button
              color={activeFilter === 'wrong' ? 'danger' : 'light'}
              size="sm"
              onClick={() => setActiveFilter('wrong')}
              className="rounded-pill px-2.5 py-1 fw-semibold border"
            >
              Sai ({wrongCount})
            </Button>
            <Button
              color={activeFilter === 'correct' ? 'success' : 'light'}
              size="sm"
              onClick={() => setActiveFilter('correct')}
              className="rounded-pill px-2.5 py-1 fw-semibold border"
            >
              Đúng ({correctCount})
            </Button>
          </div>
        </div>
      </div>

      {/* ── Vocabulary Practice Table ── */}
      {loading ? (
        <div className="text-center py-5">
          <Spinner color="primary" />
          <p className="mt-2 text-muted small">Đang tải danh sách từ vựng Bài {lessonNum}...</p>
        </div>
      ) : (
        <Card className="jlpt-card border-0 shadow-sm rounded-4">
          <CardBody className="p-0">
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th style={{ width: '50px' }} className="text-center">STT</th>
                    {inputMode === 'vi_to_jp' ? (
                      <>
                        <th style={{ minWidth: '220px' }}>Nghĩa Tiếng Việt chuẩn</th>
                        <th style={{ width: '150px' }}>Chữ Hán</th>
                      </>
                    ) : (
                      <>
                        <th style={{ width: '160px' }}>Chữ Hán (Kanji)</th>
                        <th style={{ minWidth: '220px' }}>Nghĩa Tiếng Việt</th>
                      </>
                    )}
                    <th style={{ minWidth: '280px' }}>
                      Nhập đáp án Kana ✍️
                      <small className="text-muted d-block fw-normal" style={{ fontSize: '11px' }}>
                        (Gõ romaji tự động biến đổi thành Hiragana)
                      </small>
                    </th>
                    <th style={{ width: '120px' }} className="text-center">Kết quả</th>
                    <th style={{ width: '70px' }} className="text-center">Nghe</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredVocabList.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-5 text-muted">
                        Không có từ nào khớp với bộ lọc hiện tại
                      </td>
                    </tr>
                  ) : (
                    filteredVocabList.map((item, idx) => {
                      const result = checkResults[item.id];
                      const val = userInputs[item.id] || '';
                      const isRevealed = revealedIds[item.id];
                      const cleanMeaning = item.clean_vietnamese || item.vietnamese;
                      const cleanK = item.clean_kana || item.kana;

                      return (
                        <tr
                          key={item.id}
                          className={
                            result === true
                              ? 'table-success bg-opacity-25'
                              : result === false
                              ? 'table-danger bg-opacity-25'
                              : ''
                          }
                        >
                          <td className="text-center text-muted small">{idx + 1}</td>

                          {inputMode === 'vi_to_jp' ? (
                            <>
                              <td>
                                <span className="text-dark fw-bold">{cleanMeaning}</span>
                                {item.usage_note && (
                                  <small className="text-muted d-block mt-1" style={{ fontSize: '11px' }}>
                                    💡 {item.usage_note}
                                  </small>
                                )}
                              </td>
                              <td className="fw-bold fs-5 text-navy-dark font-monospace">
                                {item.kanji && item.kanji !== '–' && item.kanji !== '-' ? item.kanji : '—'}
                              </td>
                            </>
                          ) : (
                            <>
                              <td className="fw-bold fs-5 text-navy-dark font-monospace">
                                {item.kanji && item.kanji !== '–' && item.kanji !== '-' ? item.kanji : item.kana}
                              </td>
                              <td>
                                <span className="text-dark fw-semibold">{cleanMeaning}</span>
                                {item.usage_note && (
                                  <small className="text-muted d-block mt-1" style={{ fontSize: '11px' }}>
                                    💡 {item.usage_note}
                                  </small>
                                )}
                              </td>
                            </>
                          )}

                          <td>
                            <div className="d-flex align-items-center gap-1.5">
                              <Input
                                type="text"
                                placeholder="Gõ Kana..."
                                value={val}
                                onChange={(e) => handleInputChange(item.id, e.target.value, cleanK)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    handleEvaluate(item.id, cleanK);
                                  }
                                }}
                                onBlur={() => {
                                  if (val.trim()) {
                                    handleEvaluate(item.id, cleanK);
                                  }
                                }}
                                className={`fw-bold font-monospace ${
                                  result === true ? 'is-valid' : result === false ? 'is-invalid' : ''
                                }`}
                                style={{ maxWidth: '200px' }}
                              />
                              <Button
                                color="light"
                                size="sm"
                                className="border px-2 py-1 text-primary shadow-xs"
                                onClick={() => handleEvaluate(item.id, cleanK)}
                                title="Kiểm tra đáp án"
                              >
                                <Check size={14} />
                              </Button>
                              <Button
                                color="light"
                                size="sm"
                                className="border px-2 py-1 text-muted shadow-xs"
                                onClick={() => handleRevealAnswer(item.id)}
                                title="Xem đáp án gợi ý"
                              >
                                <Eye size={14} />
                              </Button>
                            </div>

                            {/* Revealed Hint Box */}
                            {isRevealed && (
                              <div className="mt-1.5 p-1.5 rounded-2 bg-light border small text-dark d-inline-flex align-items-center gap-2">
                                <span className="fw-bold text-primary font-monospace">{cleanK}</span>
                                <span className="text-muted fst-italic">[{item.romaji}]</span>
                              </div>
                            )}
                          </td>

                          <td className="text-center">
                            {result === true && (
                              <Badge color="success" pill className="px-2.5 py-1">
                                ✓ Chính xác
                              </Badge>
                            )}
                            {result === false && (
                              <Badge color="danger" pill className="px-2.5 py-1">
                                ✗ Chưa đúng
                              </Badge>
                            )}
                            {result === undefined && (
                              <span className="text-muted small">—</span>
                            )}
                          </td>

                          <td className="text-center">
                            <Button
                              color="light"
                              size="sm"
                              className="p-1.5 rounded-circle border text-primary audio-btn"
                              onClick={() => speakJapanese(cleanK)}
                              title="Nghe phát âm chuẩn"
                            >
                              <Volume2 size={15} />
                            </Button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </CardBody>
        </Card>
      )}
    </Container>
  );
};

export default PracticeInputPage;
