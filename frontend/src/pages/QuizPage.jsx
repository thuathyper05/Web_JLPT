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
  Progress,
  Spinner,
  Alert
} from 'reactstrap';
import {
  CheckSquare,
  Volume2,
  Award,
  RefreshCw,
  CheckCircle,
  XCircle,
  ArrowRight,
  HelpCircle,
  Sparkles,
  Info
} from 'lucide-react';
import * as wanakana from 'wanakana';
import { quizService, speakJapanese } from '../services/api';
import { sounds } from '../services/sounds';
import confetti from 'canvas-confetti';

const QuizPage = ({ initialLesson = 1, onNavigate }) => {
  const [lessonNum, setLessonNum] = useState(initialLesson);
  const [questionCount, setQuestionCount] = useState(15);
  const [quizMode, setQuizMode] = useState('multiple_choice');

  const [quizState, setQuizState] = useState('setup');
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState([]);
  const [selectedOption, setSelectedOption] = useState(null);
  const [inputAnswer, setInputAnswer] = useState('');
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resultSummary, setResultSummary] = useState(null);

  const startQuiz = async () => {
    sounds.playFlip();
    setLoading(true);
    try {
      const params = {
        count: questionCount,
        mode: quizMode
      };
      if (lessonNum !== 'all') {
        params.lesson = parseInt(lessonNum);
      }

      const res = await quizService.getQuiz(params);
      setQuestions(res.data.questions);
      setCurrentIndex(0);
      setUserAnswers([]);
      setSelectedOption(null);
      setInputAnswer('');
      setIsAnswerSubmitted(false);
      setQuizState('playing');
    } catch (err) {
      console.error('Error starting quiz:', err);
    } finally {
      setLoading(false);
    }
  };

  const currentQ = questions[currentIndex];

  const handleCheckAnswer = () => {
    if (!currentQ || isAnswerSubmitted) return;

    let userAnswerText = '';
    let isCorrect = false;

    if (currentQ.type === 'kana_input') {
      userAnswerText = inputAnswer.trim();
      isCorrect = userAnswerText === currentQ.correct_answer.trim();
    } else {
      userAnswerText = selectedOption;
      isCorrect = selectedOption === currentQ.correct_answer;
    }

    if (isCorrect) {
      sounds.playCorrect();
    } else {
      sounds.playWrong();
    }

    const answerRecord = {
      question_id: currentQ.id,
      vocabulary_id: currentQ.vocabulary_id,
      question: currentQ.question,
      correct_answer: currentQ.correct_answer,
      user_answer: userAnswerText,
      is_correct: isCorrect,
      kanji: currentQ.kanji,
      kana: currentQ.clean_kana || currentQ.kana,
      vietnamese: currentQ.clean_vietnamese || currentQ.vietnamese,
      usage_note: currentQ.usage_note
    };

    setUserAnswers(prev => [...prev, answerRecord]);
    setIsAnswerSubmitted(true);

    // Phát âm tiếng Nhật chuẩn
    speakJapanese(currentQ.audio_text || currentQ.clean_kana || currentQ.kana);
  };

  const handleNextQuestion = () => {
    sounds.playFlip();
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedOption(null);
      setInputAnswer('');
      setIsAnswerSubmitted(false);
    } else {
      finishQuiz();
    }
  };

  const finishQuiz = async () => {
    setLoading(true);
    const correctCount = userAnswers.filter(a => a.is_correct).length;
    try {
      const submitRes = await quizService.submitQuiz({
        session_type: 'quiz',
        lesson_number: lessonNum === 'all' ? null : parseInt(lessonNum),
        total_questions: questions.length,
        correct_answers: correctCount,
        results: userAnswers
      });
      setResultSummary(submitRes.data);
      setQuizState('result');

      if ((correctCount / questions.length) >= 0.75) {
        sounds.playComplete();
        confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
      }
    } catch (err) {
      console.error('Error submitting quiz:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="py-3 py-md-4" style={{ maxWidth: '780px' }}>
      {/* 1. SETUP STATE */}
      {quizState === 'setup' && (
        <Card className="jlpt-card border-0 shadow-lg p-3 p-md-5">
          <div className="text-center mb-4">
            <div className="bg-success bg-opacity-10 text-success p-3 rounded-circle d-inline-flex mb-3">
              <CheckSquare size={36} />
            </div>
            <h3 className="fw-bold text-navy-dark">Kiểm tra Trắc nghiệm Từ vựng N5</h3>
            <p className="text-muted small">
              Đầy đủ 4 dạng câu hỏi: Chọn nghĩa tiếng Việt, Chọn từ tiếng Nhật, Đọc chữ Hán và Nhập Kana.
            </p>
          </div>

          <Row className="g-3 mb-4">
            <Col sm={6}>
              <label className="fw-semibold small text-muted mb-1">Chọn phạm vi bài học:</label>
              <Input
                type="select"
                value={lessonNum}
                onChange={(e) => setLessonNum(e.target.value)}
                className="py-2"
              >
                <option value="all">Toàn bộ N5 (25 bài)</option>
                {Array.from({ length: 25 }, (_, i) => i + 1).map((n) => (
                  <option key={n} value={n}>
                    Bài {n < 10 ? `0${n}` : n}
                  </option>
                ))}
              </Input>
            </Col>

            <Col sm={6}>
              <label className="fw-semibold small text-muted mb-1">Số lượng câu hỏi:</label>
              <Input
                type="select"
                value={questionCount}
                onChange={(e) => setQuestionCount(parseInt(e.target.value))}
                className="py-2"
              >
                <option value={10}>10 câu hỏi nhanh</option>
                <option value={15}>15 câu hỏi tiêu chuẩn</option>
                <option value={20}>20 câu hỏi luyện tập</option>
                <option value={30}>30 câu hỏi thử thách</option>
              </Input>
            </Col>
          </Row>

          <Button
            color="primary"
            size="lg"
            block
            className="py-3 fw-bold shadow-sm d-flex align-items-center justify-content-center gap-2"
            onClick={startQuiz}
            disabled={loading}
          >
            {loading ? <Spinner size="sm" /> : <Sparkles size={20} />}
            <span>Bắt đầu làm bài kiểm tra</span>
          </Button>
        </Card>
      )}

      {/* 2. PLAYING STATE */}
      {quizState === 'playing' && currentQ && (
        <>
          <div className="d-flex justify-content-between align-items-center mb-2">
            <Badge color="primary" pill className="px-3 py-1 fs-6">
              Câu {currentIndex + 1} / {questions.length}
            </Badge>
            <span className="text-muted small">
              Bài {currentQ.lesson_number} • {currentQ.prompt}
            </span>
          </div>

          <Progress
            value={((currentIndex + 1) / questions.length) * 100}
            color="success"
            className="mb-3"
            style={{ height: '6px' }}
          />

          <Card className="jlpt-card border-0 shadow-lg mb-3">
            <CardBody className="p-3 p-md-5">
              {/* Question Text */}
              <div className="text-center mb-4 pb-3 border-bottom">
                <span className="text-muted small d-block mb-1">
                  {currentQ.prompt}
                </span>
                <h2 className="fw-bold text-dark display-6 mb-2">
                  {currentQ.question}
                </h2>
                <Button
                  color="light"
                  size="sm"
                  className="rounded-pill px-3 py-1 text-primary d-inline-flex align-items-center gap-1 border"
                  onClick={() => speakJapanese(currentQ.audio_text || currentQ.clean_kana || currentQ.kana)}
                >
                  <Volume2 size={16} /> Nghe phát âm
                </Button>
              </div>

              {/* Multiple Choice Options */}
              {currentQ.type !== 'kana_input' ? (
                <div className="d-grid gap-2 gap-md-3">
                  {currentQ.options.map((option, idx) => {
                    let btnColor = 'outline-primary';
                    let extraClass = '';

                    if (isAnswerSubmitted) {
                      if (option === currentQ.correct_answer) {
                        btnColor = 'success';
                      } else if (option === selectedOption) {
                        btnColor = 'danger';
                      } else {
                        btnColor = 'outline-secondary';
                      }
                    } else if (selectedOption === option) {
                      btnColor = 'primary';
                    }

                    return (
                      <Button
                        key={idx}
                        color={btnColor}
                        className={`text-start py-3 px-3 px-md-4 rounded-3 d-flex justify-content-between align-items-center fs-6 fw-semibold ${extraClass}`}
                        onClick={() => !isAnswerSubmitted && setSelectedOption(option)}
                        disabled={isAnswerSubmitted}
                      >
                        <span>
                          <strong className="me-2 text-muted">
                            {String.fromCharCode(65 + idx)}.
                          </strong>
                          {option}
                        </span>
                        {isAnswerSubmitted && option === currentQ.correct_answer && (
                          <CheckCircle size={20} className="text-white" />
                        )}
                        {isAnswerSubmitted && option === selectedOption && option !== currentQ.correct_answer && (
                          <XCircle size={20} className="text-white" />
                        )}
                      </Button>
                    );
                  })}
                </div>
              ) : (
                /* Kana Input question */
                <div className="my-3">
                  <Input
                    type="text"
                    size="lg"
                    placeholder="Gõ Hiragana/Katakana (hỗ trợ chuyển tự động)..."
                    value={inputAnswer}
                    onChange={(e) => setInputAnswer(wanakana.toKana(e.target.value, { IMEMode: true }))}
                    disabled={isAnswerSubmitted}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !isAnswerSubmitted && inputAnswer.trim()) {
                        handleCheckAnswer();
                      }
                    }}
                    className={`py-3 text-center fw-bold fs-4 ${
                      isAnswerSubmitted 
                        ? (inputAnswer.trim() === currentQ.correct_answer.trim() ? 'is-valid' : 'is-invalid')
                        : ''
                    }`}
                  />
                  {isAnswerSubmitted && (
                    <div className="mt-3 text-center">
                      <span className="text-muted small">Đáp án đúng: </span>
                      <strong className="text-success fs-5">{currentQ.correct_answer}</strong>
                    </div>
                  )}
                </div>
              )}

              {/* POST-ANSWER EXPLANATION NOTE: Hiện chú thích sau khi trả lời */}
              {isAnswerSubmitted && currentQ.usage_note && (
                <div className="alert alert-info py-2 px-3 mt-3 d-flex align-items-center gap-2 small border-0 rounded-3">
                  <Info size={16} className="text-primary flex-shrink-0" />
                  <div>
                    <strong>Lưu ý ngữ pháp / ngữ cảnh:</strong> {currentQ.usage_note}
                  </div>
                </div>
              )}

              {/* Submit or Next Button */}
              <div className="mt-4 pt-3 border-top text-end">
                {!isAnswerSubmitted ? (
                  <Button
                    color="primary"
                    size="lg"
                    className="px-4 fw-bold"
                    disabled={currentQ.type === 'kana_input' ? !inputAnswer.trim() : !selectedOption}
                    onClick={handleCheckAnswer}
                  >
                    Kiểm tra đáp án
                  </Button>
                ) : (
                  <Button
                    color="success"
                    size="lg"
                    className="px-4 fw-bold d-inline-flex align-items-center gap-2"
                    onClick={handleNextQuestion}
                  >
                    <span>{currentIndex < questions.length - 1 ? 'Câu tiếp theo' : 'Xem kết quả'}</span>
                    <ArrowRight size={18} />
                  </Button>
                )}
              </div>
            </CardBody>
          </Card>
        </>
      )}

      {/* 3. RESULT STATE */}
      {quizState === 'result' && resultSummary && (
        <Card className="jlpt-card border-0 shadow-lg p-3 p-md-5">
          <div className="text-center mb-4">
            <div className="bg-warning bg-opacity-10 text-warning p-4 rounded-circle d-inline-flex mb-3">
              <Award size={48} />
            </div>
            <h2 className="fw-bold text-navy-dark">Kết quả bài kiểm tra</h2>
            <div className="display-4 fw-bold text-primary my-2">
              {resultSummary.correct_answers} / {resultSummary.total_questions}
            </div>
            <div className="fs-5 text-muted mb-2">
              Tỷ lệ chính xác: <strong>{resultSummary.score_percentage}%</strong>
            </div>
            <Badge color={resultSummary.score_percentage >= 80 ? 'success' : (resultSummary.score_percentage >= 60 ? 'warning' : 'danger')} className="fs-6 px-3 py-2">
              Đánh giá: {resultSummary.evaluation}
            </Badge>
          </div>

          <h5 className="fw-bold mb-3 border-bottom pb-2">Chi tiết từng câu:</h5>
          <div className="list-group mb-4" style={{ maxHeight: '350px', overflowY: 'auto' }}>
            {userAnswers.map((ans, i) => (
              <div
                key={i}
                className={`list-group-item d-flex justify-content-between align-items-center ${
                  ans.is_correct ? 'list-group-item-success' : 'list-group-item-danger'
                }`}
              >
                <div>
                  <div className="fw-bold">
                    Câu {i + 1}: {ans.question}
                  </div>
                  <small>
                    Bạn chọn: <strong>{ans.user_answer || '(Trống)'}</strong> | Đáp án: <strong>{ans.correct_answer}</strong>
                  </small>
                  {ans.usage_note && (
                    <div className="text-muted small mt-1">
                      💡 {ans.usage_note}
                    </div>
                  )}
                </div>
                <div className="d-flex align-items-center gap-1">
                  <Button
                    color="light"
                    size="sm"
                    className="p-1 rounded-circle"
                    onClick={() => speakJapanese(ans.kana)}
                  >
                    <Volume2 size={16} />
                  </Button>
                  {ans.is_correct ? <CheckCircle className="text-success" size={20} /> : <XCircle className="text-danger" size={20} />}
                </div>
              </div>
            ))}
          </div>

          <div className="d-flex justify-content-center gap-2 flex-wrap">
            <Button
              color="primary"
              size="lg"
              className="px-4 fw-bold d-flex align-items-center gap-2"
              onClick={() => setQuizState('setup')}
            >
              <RefreshCw size={18} /> Làm bài kiểm tra khác
            </Button>
            <Button
              color="secondary"
              outline
              size="lg"
              className="px-4"
              onClick={() => onNavigate('lessons')}
            >
              Quay lại bài học
            </Button>
          </div>
        </Card>
      )}
    </Container>
  );
};

export default QuizPage;
