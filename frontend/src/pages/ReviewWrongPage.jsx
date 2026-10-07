import React, { useState, useEffect } from 'react';
import {
  Container,
  Row,
  Col,
  Card,
  CardBody,
  Button,
  Badge,
  Spinner,
  Input
} from 'reactstrap';
import {
  RefreshCw,
  Volume2,
  CheckCircle,
  HelpCircle,
  BookOpen,
  ArrowRight,
  Flame,
  Search
} from 'lucide-react';
import { vocabService, speakJapanese } from '../services/api';
import { useApp } from '../context/AppContext';
import { sounds } from '../services/sounds';

const ReviewWrongPage = ({ onNavigate }) => {
  const { user, guestProgress, updateProgress } = useApp();
  const [reviewList, setReviewList] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReviewItems();
  }, [user, guestProgress]);

  const fetchReviewItems = async () => {
    setLoading(true);
    try {
      if (user) {
        const res = await vocabService.getVocabularies({ status: 'needs_review' });
        setReviewList(res.data);
      } else {
        const wrongIds = Object.keys(guestProgress).filter(
          id => guestProgress[id].status === 'needs_review' || guestProgress[id].wrong_count > 0
        );
        if (wrongIds.length === 0) {
          setReviewList([]);
        } else {
          const res = await vocabService.getVocabularies({});
          const filtered = res.data.filter(v => wrongIds.includes(String(v.id)));
          setReviewList(filtered);
        }
      }
    } catch (err) {
      console.error('Error fetching review items:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkMastered = async (vocabId) => {
    sounds.playCorrect();
    await updateProgress(vocabId, 'mastered', true);
    setReviewList(prev => prev.filter(v => v.id !== vocabId));
  };

  const filteredItems = reviewList.filter(item => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      item.vietnamese?.toLowerCase().includes(q) ||
      item.kana?.toLowerCase().includes(q) ||
      item.kanji?.toLowerCase().includes(q) ||
      item.romaji?.toLowerCase().includes(q)
    );
  });

  if (loading) {
    return (
      <Container className="text-center py-5">
        <Spinner color="primary" />
        <p className="mt-2 text-muted">Đang tải danh sách từ cần ôn tập...</p>
      </Container>
    );
  }

  return (
    <Container className="py-3 py-md-4">
      <div className="bg-white p-4 rounded-4 shadow-sm border mb-4 d-flex justify-content-between align-items-center flex-wrap gap-3">
        <div className="d-flex align-items-center gap-2">
          <div className="bg-danger bg-opacity-10 text-danger p-2 rounded-circle">
            <Flame size={24} />
          </div>
          <div>
            <h4 className="fw-bold mb-0 text-navy-dark">Ôn tập từ chưa nhớ & trả lời sai</h4>
            <p className="text-muted small mb-0">
              Tự động lưu những từ bạn từng làm sai trong trắc nghiệm, luyện gõ hoặc đánh dấu "Chưa nhớ"
            </p>
          </div>
        </div>

        <div className="d-flex align-items-center gap-2">
          <Input
            type="text"
            placeholder="Tìm trong từ sai..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="form-control-sm w-auto"
          />
          <Badge color="danger" pill className="fs-6 px-3 py-2 rounded-pill">
            {reviewList.length} từ cần củng cố
          </Badge>
        </div>
      </div>

      {filteredItems.length === 0 ? (
        <Card className="jlpt-card border-0 shadow-sm p-5 text-center">
          <div className="bg-success bg-opacity-10 text-success p-3 rounded-circle d-inline-flex mx-auto mb-3">
            <CheckCircle size={40} />
          </div>
          <h4 className="fw-bold text-dark">
            {search ? 'Không có từ nào khớp với tìm kiếm' : 'Tuyệt vời! Bạn không còn từ nào bị sai'}
          </h4>
          <p className="text-muted mb-4">
            {search ? 'Thử tìm với từ khóa khác' : 'Bạn đã củng cố xuất sắc toàn bộ các từ vựng trước đó. Hãy tiếp tục học các bài tiếp theo nhé!'}
          </p>
          <div>
            <Button color="primary" className="fw-bold px-4 rounded-pill" onClick={() => onNavigate('lessons')}>
              Tiếp tục học bài mới
            </Button>
          </div>
        </Card>
      ) : (
        <Row className="g-3">
          {filteredItems.map((item) => (
            <Col md={6} lg={4} key={item.id}>
              <Card className="jlpt-card border-0 shadow-sm h-100">
                <CardBody className="d-flex flex-column justify-content-between p-3">
                  <div>
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <Badge color="secondary" pill>
                        Bài {item.lesson_number}
                      </Badge>
                      <Button
                        color="light"
                        size="sm"
                        className="p-1 rounded-circle"
                        onClick={() => speakJapanese(item.kana)}
                        title="Nghe phát âm"
                      >
                        <Volume2 size={16} className="text-primary" />
                      </Button>
                    </div>

                    <div className="mb-2">
                      {item.kanji && (
                        <h4 className="fw-bold text-dark mb-1 font-monospace">
                          {item.kanji}
                        </h4>
                      )}
                      <h5 className="text-primary fw-semibold mb-0">
                        {item.kana}
                      </h5>
                      <small className="text-muted fst-italic">[{item.romaji}]</small>
                    </div>

                    <div className="bg-light p-2 rounded small text-dark fw-medium mb-3">
                      {item.vietnamese}
                    </div>
                  </div>

                  <div className="pt-2 border-top d-flex justify-content-end">
                    <Button
                      color="success"
                      size="sm"
                      className="d-flex align-items-center gap-1 fw-semibold rounded-pill px-3"
                      onClick={() => handleMarkMastered(item.id)}
                    >
                      <CheckCircle size={14} /> Đã thuộc từ này
                    </Button>
                  </div>
                </CardBody>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
};

export default ReviewWrongPage;
