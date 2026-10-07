import React, { useState, useEffect } from 'react';
import {
  Container,
  Row,
  Col,
  Card,
  CardBody,
  Button,
  Badge,
  Spinner
} from 'reactstrap';
import {
  RefreshCw,
  Volume2,
  CheckCircle,
  HelpCircle,
  BookOpen,
  ArrowRight
} from 'lucide-react';
import { vocabService, speakJapanese } from '../services/api';
import { useApp } from '../context/AppContext';

const ReviewWrongPage = ({ onNavigate }) => {
  const { user, guestProgress, updateProgress } = useApp();
  const [reviewList, setReviewList] = useState([]);
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
        // Collect guest review items
        const wrongIds = Object.keys(guestProgress).filter(
          id => guestProgress[id].status === 'needs_review' || guestProgress[id].wrong_count > 0
        );
        if (wrongIds.length === 0) {
          setReviewList([]);
        } else {
          // Fetch all and filter
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
    await updateProgress(vocabId, 'mastered', true);
    setReviewList(prev => prev.filter(v => v.id !== vocabId));
  };

  if (loading) {
    return (
      <Container className="text-center py-5">
        <Spinner color="primary" />
        <p className="mt-2 text-muted">Đang tải danh sách từ cần ôn tập...</p>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <div className="bg-white p-4 rounded-4 shadow-sm border mb-4 d-flex justify-content-between align-items-center flex-wrap gap-2">
        <div className="d-flex align-items-center gap-2">
          <div className="bg-danger bg-opacity-10 text-danger p-2 rounded-circle">
            <RefreshCw size={24} />
          </div>
          <div>
            <h4 className="fw-bold mb-0">Ôn tập từ vựng chưa nhớ & trả lời sai</h4>
            <p className="text-muted small mb-0">
              Tổng hợp những từ bạn từng làm sai trong trắc nghiệm, luyện gõ hoặc đánh dấu "Chưa nhớ"
            </p>
          </div>
        </div>

        <Badge color="danger" pill className="fs-6 px-3 py-2">
          {reviewList.length} từ cần cải thiện
        </Badge>
      </div>

      {reviewList.length === 0 ? (
        <Card className="jlpt-card border-0 shadow-sm p-5 text-center">
          <div className="bg-success bg-opacity-10 text-success p-3 rounded-circle d-inline-flex mx-auto mb-3">
            <CheckCircle size={40} />
          </div>
          <h4 className="fw-bold text-dark">Tuyệt vời! Không có từ vựng nào bị sai</h4>
          <p className="text-muted mb-4">
            Bạn đã ghi nhớ tốt tất cả các từ vựng đã học hoặc chưa bắt đầu làm bài kiểm tra.
          </p>
          <div>
            <Button color="primary" className="fw-bold px-4" onClick={() => onNavigate('lessons')}>
              Tiếp tục học bài mới
            </Button>
          </div>
        </Card>
      ) : (
        <Row className="g-3">
          {reviewList.map((item) => (
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
                      className="d-flex align-items-center gap-1"
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
