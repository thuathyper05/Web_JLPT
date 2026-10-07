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
  ButtonGroup
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
  ArrowRightLeft,
  Sparkles,
  Info
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

  // Card side preference: 'vi_to_jp' (Tiếng Việt -> lật ra Tiếng Nhật) or 'jp_to_vi'
  const [cardDirection, setCardDirection] = useState('vi_to_jp');

  // Stats for current session
  const [masteredIds, setMasteredIds] = useState(new Set());
  const [reviewIds, setReviewIds] = useState(new Set());

  useEffect(() => {
    fetchCards(lessonNum);
  }, [lessonNum]);

  const fetchCards = async (lesson) => {
    setLoading(true);
    setIsFlipped(false);
    setCurrentIndex(0);
    setMasteredIds(new Set());
    setReviewIds(new Set());

    try {
      const params = lesson === 'all' ? {} : { lesson: parseInt(lesson) };
      const res = await vocabService.getVocabularies(params);
      setCards(res.data);
    } catch (err) {
      console.error('Error fetching flashcards:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleShuffle = () => {
    sounds.playFlip();
    const shuffled = [...cards].sort(() => Math.random() - 0.5);
    setCards(shuffled);
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  const currentCard = cards[currentIndex];

  const handleFlip = () => {
    sounds.playFlip();
    const nextFlipped = !isFlipped;
    setIsFlipped(nextFlipped);

    if (currentCard) {
      const targetAudio = currentCard.clean_kana || currentCard.kana;
      if (cardDirection === 'vi_to_jp' && nextFlipped) {
        speakJapanese(targetAudio);
      } else if (cardDirection === 'jp_to_vi' && !nextFlipped) {
        speakJapanese(targetAudio);
      }
    }
  };

  const handleAnswer = async (remembered) => {
    if (!currentCard) return;

    if (remembered) {
      sounds.playCorrect();
      setMasteredIds(prev => new Set(prev).add(currentCard.id));
      await updateProgress(currentCard.id, 'mastered', true);
    } else {
      sounds.playWrong();
      setReviewIds(prev => new Set(prev).add(currentCard.id));
      await updateProgress(currentCard.id, 'needs_review', false);
    }

    if (currentIndex < cards.length - 1) {
      setIsFlipped(false);
      setCurrentIndex(currentIndex + 1);
    } else {
      sounds.playComplete();
      confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
    }
  };

  if (loading) {
    return (
      <Container className="text-center py-5">
        <Spinner color="primary" />
        <p className="mt-2 text-muted">Đang chuẩn bị bộ thẻ Flashcard...</p>
      </Container>
    );
  }

  const cleanVietnamese = currentCard ? (currentCard.clean_vietnamese || currentCard.vietnamese) : '';
  const cleanKana = currentCard ? (currentCard.clean_kana || currentCard.kana) : '';

  return (
    <Container className="py-3 py-md-4" style={{ maxWidth: '720px' }}>
      {/* Header controls & High-End Mode Switcher */}
      <div className="bg-white p-3 p-md-4 rounded-4 shadow-sm border mb-3">
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
          <div className="d-flex align-items-center gap-2">
            <div className="bg-primary bg-opacity-10 text-primary p-2 rounded-circle">
              <Layers size={22} />
            </div>
            <div>
              <h5 className="fw-bold mb-0 text-navy-dark">Thẻ Ghi Nhớ Flashcard 3D</h5>
              <small className="text-muted">Chạm thẻ để lật & tự động nghe phát âm</small>
            </div>
          </div>

          <div className="d-flex align-items-center gap-2">
            <Input
              type="select"
              value={lessonNum}
              onChange={(e) => setLessonNum(e.target.value)}
              className="w-auto fw-bold"
              size="sm"
            >
              <option value="all">Toàn bộ 25 bài N5</option>
              {Array.from({ length: 25 }, (_, i) => i + 1).map((n) => (
                <option key={n} value={n}>
                  Bài {n < 10 ? `0${n}` : n}
                </option>
              ))}
            </Input>
            <Button color="light" size="sm" onClick={handleShuffle} title="Trộn ngẫu nhiên thẻ" className="border">
              <Shuffle size={15} />
            </Button>
          </div>
        </div>

        {/* High-End Segmented Direction Switcher */}
        <div className="p-1 bg-light rounded-pill border d-flex justify-content-center">
          <div className="d-flex w-100 gap-1" style={{ maxWidth: '480px' }}>
            <button
              type="button"
              onClick={() => { setCardDirection('vi_to_jp'); setIsFlipped(false); sounds.playFlip(); }}
              className={`btn btn-sm flex-fill rounded-pill py-2 fw-bold transition-all ${
                cardDirection === 'vi_to_jp'
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-secondary hover-bg border-0'
              }`}
              style={{ fontSize: '0.85rem' }}
            >
              🇻🇳 Tiếng Việt ➔ 🇯🇵 Tiếng Nhật
            </button>
            <button
              type="button"
              onClick={() => { setCardDirection('jp_to_vi'); setIsFlipped(false); sounds.playFlip(); }}
              className={`btn btn-sm flex-fill rounded-pill py-2 fw-bold transition-all ${
                cardDirection === 'jp_to_vi'
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-secondary hover-bg border-0'
              }`}
              style={{ fontSize: '0.85rem' }}
            >
              🇯🇵 Tiếng Nhật ➔ 🇻🇳 Tiếng Việt
            </button>
          </div>
        </div>
      </div>

      {cards.length === 0 ? (
        <Card className="jlpt-card p-5 text-center">
          <p className="text-muted">Không có thẻ nào trong bài học này.</p>
        </Card>
      ) : (
        <>
          {/* Progress bar and counter */}
          <div className="mb-3">
            <div className="d-flex justify-content-between text-muted small mb-1 fw-semibold">
              <span>Thẻ {currentIndex + 1} / {cards.length}</span>
              <span>
                Đã nhớ: <strong className="text-success">{masteredIds.size}</strong> | Cần ôn: <strong className="text-danger">{reviewIds.size}</strong>
              </span>
            </div>
            <Progress
              value={((currentIndex + 1) / cards.length) * 100}
              color="primary"
              style={{ height: '6px', borderRadius: '3px' }}
            />
          </div>

          {/* Flashcard container with smooth 3D flip */}
          <div
            className="perspective-1000 mb-3"
            style={{ minHeight: '350px', cursor: 'pointer', userSelect: 'none' }}
            onClick={handleFlip}
          >
            <div
              className={`w-100 h-100 position-relative transform-style-3d ${
                isFlipped ? 'rotate-y-180' : ''
              }`}
              style={{
                transition: 'transform 0.45s cubic-bezier(0.4, 0, 0.2, 1)',
                minHeight: '350px'
              }}
            >
              {/* ===== MẶT TRƯỚC ===== */}
              <Card
                className="w-100 h-100 position-absolute top-0 start-0 backface-hidden border-0 shadow-lg rounded-4 d-flex flex-column justify-content-between p-4"
                style={{
                  background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                  border: '2px solid #e2e8f0',
                  minHeight: '350px'
                }}
              >
                <div className="d-flex justify-content-between align-items-center">
                  <Badge color="primary" pill className="px-3 py-1">
                    Bài {currentCard.lesson_number} • Thẻ #{currentIndex + 1}
                  </Badge>
                  <Button
                    color="light"
                    size="sm"
                    className="p-1 rounded-circle"
                    onClick={(e) => {
                      e.stopPropagation();
                      sounds.playFlip();
                      toggleFavorite(currentCard);
                    }}
                    title="Yêu thích"
                  >
                    <Star
                      size={18}
                      className={isFavorite(currentCard.id, currentCard.is_favorite) ? 'text-warning fill-warning' : 'text-muted'}
                      fill={isFavorite(currentCard.id, currentCard.is_favorite) ? '#f59e0b' : 'none'}
                    />
                  </Button>
                </div>

                {/* Content Front: Clean Meaning or Clean Japanese */}
                <div className="text-center my-auto py-3">
                  {cardDirection === 'vi_to_jp' ? (
                    /* Mặt trước: Tiếng Việt chuẩn (Không dính chú thích sách) */
                    <>
                      <div className="text-muted small fw-semibold text-uppercase tracking-wider mb-2">
                        Nghĩa Tiếng Việt
                      </div>
                      <div className="display-6 fw-bold text-navy-dark px-2" style={{ wordBreak: 'break-word', lineHeight: '1.3' }}>
                        {cleanVietnamese}
                      </div>
                      <div className="text-muted small mt-3">
                        👉 Chạm thẻ để lật xem cách đọc tiếng Nhật & nghe phát âm
                      </div>
                    </>
                  ) : (
                    /* Mặt trước: Tiếng Nhật (Kanji / Clean Kana) */
                    <>
                      {currentCard.kanji && currentCard.kanji !== '–' && currentCard.kanji !== '-' ? (
                        <>
                          <div className="display-3 fw-bold text-dark font-monospace mb-2">
                            {currentCard.kanji}
                          </div>
                          <div className="text-muted small">Nhấn để xem cách đọc & nghĩa tiếng Việt</div>
                        </>
                      ) : (
                        <>
                          <div className="display-4 fw-bold text-primary font-monospace mb-2">
                            {cleanKana}
                          </div>
                          <div className="text-muted small">Nhấn để xem Romaji & nghĩa</div>
                        </>
                      )}
                    </>
                  )}
                </div>

                <div className="text-center text-muted small d-flex align-items-center justify-content-center gap-1">
                  <RotateCw size={14} /> Chạm thẻ để lật mặt sau
                </div>
              </Card>

              {/* ===== MẶT SAU (LẬT RA) ===== */}
              <Card
                className="w-100 h-100 position-absolute top-0 start-0 backface-hidden rotate-y-180 border-0 shadow-lg rounded-4 d-flex flex-column justify-content-between p-4 text-white"
                style={{
                  background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)',
                  minHeight: '350px'
                }}
              >
                <div className="d-flex justify-content-between align-items-center">
                  <Badge color="light" text="dark" pill className="px-3 py-1 fw-bold">
                    Đáp án chuẩn • Mặt sau
                  </Badge>
                  <Button
                    color="light"
                    size="sm"
                    className="rounded-circle p-2 text-primary"
                    onClick={(e) => {
                      e.stopPropagation();
                      speakJapanese(cleanKana);
                    }}
                    title="Nghe lại phát âm"
                  >
                    <Volume2 size={18} />
                  </Button>
                </div>

                {/* Content Back */}
                <div className="text-center my-auto py-2">
                  {cardDirection === 'vi_to_jp' ? (
                    /* Mặt sau: Tiếng Nhật chuẩn */
                    <>
                      {currentCard.kanji && currentCard.kanji !== '–' && currentCard.kanji !== '-' && (
                        <div className="display-5 fw-bold text-warning font-monospace mb-1">
                          {currentCard.kanji}
                        </div>
                      )}
                      <div className="display-6 fw-bold mb-1 text-white">
                        {cleanKana}
                      </div>
                      <div className="text-white-50 fs-6 mb-2 fst-italic">
                        [{currentCard.romaji}]
                      </div>

                      {/* Chú thích sử dụng (nếu có) hiển thị tinh tế sau khi lật */}
                      {currentCard.usage_note && (
                        <div className="bg-white bg-opacity-20 py-1 px-3 rounded-pill d-inline-flex align-items-center gap-1 small text-white text-opacity-90 mb-2">
                          <Info size={13} className="text-warning" />
                          <span>Lưu ý: {currentCard.usage_note}</span>
                        </div>
                      )}
                    </>
                  ) : (
                    /* Mặt sau: Tiếng Việt chuẩn */
                    <>
                      {currentCard.kanji && currentCard.kanji !== '–' && currentCard.kanji !== '-' && (
                        <div className="fs-3 fw-bold text-warning font-monospace mb-1">
                          {currentCard.kanji}
                        </div>
                      )}
                      <div className="fs-4 fw-bold text-white mb-1">
                        {cleanKana} <span className="text-white-50 fs-6 fst-italic">[{currentCard.romaji}]</span>
                      </div>

                      <div className="bg-white bg-opacity-20 p-3 rounded-3 mt-2 mx-auto" style={{ maxWidth: '450px' }}>
                        <div className="fs-4 fw-bold text-white">
                          {cleanVietnamese}
                        </div>
                        {currentCard.usage_note && (
                          <div className="small text-white text-opacity-80 mt-1 border-top border-white border-opacity-25 pt-1">
                            💡 {currentCard.usage_note}
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>

                <div className="text-center text-white-50 small">
                  Đánh giá mức độ ghi nhớ của bạn ở dưới 👇
                </div>
              </Card>
            </div>
          </div>

          {/* Action buttons: Đã nhớ / Chưa nhớ */}
          <Row className="g-2 g-md-3 mb-3">
            <Col xs={6}>
              <Button
                color="danger"
                size="lg"
                block
                className="py-3 fw-bold d-flex align-items-center justify-content-center gap-2 shadow-sm rounded-3"
                onClick={() => handleAnswer(false)}
              >
                <X size={22} />
                <span>✕ Chưa nhớ</span>
              </Button>
            </Col>
            <Col xs={6}>
              <Button
                color="success"
                size="lg"
                block
                className="py-3 fw-bold d-flex align-items-center justify-content-center gap-2 shadow-sm rounded-3"
                onClick={() => handleAnswer(true)}
              >
                <Check size={22} />
                <span>✓ Đã nhớ</span>
              </Button>
            </Col>
          </Row>

          {/* Navigation Bar */}
          <div className="d-flex justify-content-between align-items-center">
            <Button
              color="secondary"
              outline
              size="sm"
              disabled={currentIndex === 0}
              onClick={() => {
                setIsFlipped(false);
                setCurrentIndex(currentIndex - 1);
              }}
              className="d-flex align-items-center gap-1"
            >
              <ChevronLeft size={16} /> Thẻ trước
            </Button>

            <Button
              color="light"
              size="sm"
              onClick={() => {
                sounds.playFlip();
                setIsFlipped(false);
                setCurrentIndex(0);
                setMasteredIds(new Set());
                setReviewIds(new Set());
              }}
              className="d-flex align-items-center gap-1 border"
            >
              <RefreshCw size={14} /> Học lại
            </Button>

            <Button
              color="secondary"
              outline
              size="sm"
              disabled={currentIndex === cards.length - 1}
              onClick={() => {
                setIsFlipped(false);
                setCurrentIndex(currentIndex + 1);
              }}
              className="d-flex align-items-center gap-1"
            >
              Thẻ sau <ChevronRight size={16} />
            </Button>
          </div>
        </>
      )}
    </Container>
  );
};

export default FlashcardPage;
