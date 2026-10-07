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
  Spinner,
  FormGroup,
  Label
} from 'reactstrap';
import {
  Keyboard,
  Volume2,
  CheckCircle,
  XCircle,
  RotateCcw,
  Eye,
  EyeOff,
  Sparkles,
  HelpCircle
} from 'lucide-react';
import * as wanakana from 'wanakana';
import { vocabService, speakJapanese } from '../services/api';
import { sounds } from '../services/sounds';
import confetti from 'canvas-confetti';

const PracticeInputPage = ({ initialLesson = 1 }) => {
  const [lessonNum, setLessonNum] = useState(initialLesson);
  const [vocabList, setVocabList] = useState([]);
  const [userInputs, setUserInputs] = useState({});
  const [checkResults, setCheckResults] = useState({});
  const [autoKana, setAutoKana] = useState(true); // Tự động chuyển romaji -> hiragana khi gõ
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLessonVocab(lessonNum);
  }, [lessonNum]);

  const fetchLessonVocab = async (lesson) => {
    setLoading(true);
    setUserInputs({});
    setCheckResults({});
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
    // If autoKana is on, convert romaji keystrokes like 'ka' -> 'か' immediately
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

    // Direct check
    const isCorrect = trimmedInput === expectedKana.trim();
    setCheckResults(prev => ({
      ...prev,
      [id]: isCorrect
    }));

    if (isCorrect) {
      sounds.playCorrect();
      speakJapanese(expectedKana);
    }
  };

  const handleReset = () => {
    sounds.playFlip();
    setUserInputs({});
    setCheckResults({});
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

  return (
    <Container className="py-3 py-md-4">
      {/* Sticky Top Header with Stats */}
      <div className="bg-white p-3 p-md-4 rounded-4 shadow-sm border mb-4 sticky-top" style={{ top: '65px', zIndex: 1010 }}>
        <Row className="align-items-center g-3">
          <Col md={5}>
            <div className="d-flex align-items-center gap-2">
              <div className="bg-warning bg-opacity-10 text-dark p-2 rounded-circle">
                <Keyboard size={24} className="text-warning" />
              </div>
              <div>
                <h5 className="fw-bold mb-0 text-navy-dark">Luyện gõ đáp án Kana (Không gợi ý)</h5>
                <small className="text-muted">Tự nhớ và gõ Hiragana/Katakana. Tự động chấm thời gian thực!</small>
              </div>
            </div>
          </Col>

          <Col md={3}>
            <div className="d-flex align-items-center gap-2">
              <span className="small text-muted fw-semibold">Bài:</span>
              <Input
                type="select"
                value={lessonNum}
                onChange={(e) => setLessonNum(parseInt(e.target.value))}
                className="w-auto fw-bold"
                size="sm"
              >
                {Array.from({ length: 25 }, (_, i) => i + 1).map((n) => (
                  <option key={n} value={n}>
                    Bài {n < 10 ? `0${n}` : n}
                  </option>
                ))}
              </Input>

              <Button
                color="light"
                size="sm"
                onClick={() => setAutoKana(!autoKana)}
                title="Bật/Tắt gõ tiếng Nhật tự động"
                className={`d-flex align-items-center gap-1 ${autoKana ? 'text-primary fw-bold' : 'text-muted'}`}
              >
                <span>Kana IME</span>
              </Button>

              <Button color="light" size="sm" onClick={handleReset} title="Làm lại từ đầu">
                <RotateCcw size={15} />
              </Button>
            </div>
          </Col>

          <Col md={4}>
            <div className="d-flex justify-content-between text-center gap-2">
              <div className="bg-light p-2 rounded flex-fill">
                <div className="small text-muted" style={{ fontSize: '11px' }}>Đã gõ</div>
                <div className="fw-bold fs-6">{answeredCount} / {total}</div>
              </div>
              <div className="bg-success bg-opacity-10 text-success p-2 rounded flex-fill">
                <div className="small" style={{ fontSize: '11px' }}>Số câu đúng</div>
                <div className="fw-bold fs-6">{correctCount}</div>
              </div>
              <div className="bg-danger bg-opacity-10 text-danger p-2 rounded flex-fill">
                <div className="small" style={{ fontSize: '11px' }}>Số câu sai</div>
                <div className="fw-bold fs-6">{wrongCount}</div>
              </div>
              <div className="bg-primary bg-opacity-10 text-primary p-2 rounded flex-fill">
                <div className="small" style={{ fontSize: '11px' }}>Chính xác</div>
                <div className="fw-bold fs-6">{accuracyRate}%</div>
              </div>
            </div>
          </Col>
        </Row>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <Spinner color="primary" />
          <p className="mt-2 text-muted">Đang tải bảng luyện gõ Bài {lessonNum}...</p>
        </div>
      ) : (
        <Card className="jlpt-card border-0 shadow-sm">
          <CardBody className="p-0">
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th style={{ width: '50px' }} className="text-center">STT</th>
                    <th style={{ width: '180px' }}>Chữ Hán (Kanji)</th>
                    <th>Nghĩa Tiếng Việt</th>
                    <th style={{ minWidth: '220px' }}>
                      Nhập đáp án (Kana) ✍️
                      <small className="text-muted d-block fw-normal" style={{ fontSize: '10px' }}>
                        (Gõ romaji máy tự chuyển sang Hiragana)
                      </small>
                    </th>
                    <th style={{ width: '130px' }} className="text-center">Kết quả</th>
                    <th style={{ width: '60px' }} className="text-center">Nghe</th>
                  </tr>
                </thead>
                <tbody>
                  {vocabList.map((item, idx) => {
                    const result = checkResults[item.id];
                    const val = userInputs[item.id] || '';

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
                        <td className="fw-bold fs-5 text-dark font-monospace">{item.kanji || '–'}</td>
                        <td className="text-dark fw-medium">{item.vietnamese}</td>
                        <td>
                          <Input
                            type="text"
                            placeholder="Gõ Kana..."
                            value={val}
                            onChange={(e) => handleInputChange(item.id, e.target.value, item.kana)}
                            className={`fw-semibold ${
                              result === true ? 'is-valid' : result === false ? 'is-invalid' : ''
                            }`}
                            style={{ maxWidth: '240px' }}
                          />
                        </td>
                        <td className="text-center">
                          {result === true && (
                            <Badge color="success" pill className="px-3 py-1">
                              ✓ Đúng
                            </Badge>
                          )}
                          {result === false && (
                            <div>
                              <Badge color="danger" pill className="px-3 py-1">
                                ✕ Sai
                              </Badge>
                              <div className="text-danger small mt-1 font-monospace">({item.kana})</div>
                            </div>
                          )}
                          {result === undefined && (
                            <span className="text-muted small">—</span>
                          )}
                        </td>
                        <td className="text-center">
                          <Button
                            color="light"
                            size="sm"
                            className="p-1 rounded-circle"
                            onClick={() => speakJapanese(item.kana)}
                            title="Nghe phát âm"
                          >
                            <Volume2 size={16} className="text-primary" />
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
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
