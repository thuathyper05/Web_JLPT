import React, { useState, useEffect } from 'react';
import {
  Container,
  Row,
  Col,
  Card,
  CardBody,
  Button,
  Badge,
  Progress,
  Spinner
} from 'reactstrap';
import {
  BookOpen,
  Layers,
  CheckSquare,
  Keyboard,
  ArrowRight,
  Sparkles,
  Zap,
  Award,
  CheckCircle,
  Volume2
} from 'lucide-react';
import { lessonService, progressService } from '../services/api';
import { useApp } from '../context/AppContext';

const HomePage = ({ onNavigate, onSelectLesson }) => {
  const { user, guestProgress } = useApp();
  const [lessons, setLessons] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const lessonRes = await lessonService.getLessons();
        setLessons(lessonRes.data);

        if (user) {
          const progRes = await progressService.getProgress();
          setStats(progRes.data.overall);
        } else {
          // Calculate stats from guest progress
          const studiedCount = Object.keys(guestProgress).length;
          const masteredCount = Object.values(guestProgress).filter(p => p.status === 'mastered').length;
          const needsReviewCount = Object.values(guestProgress).filter(p => p.status === 'needs_review' || p.wrong_count > 0).length;
          setStats({
            total_vocabularies: 1589,
            studied_vocabularies: studiedCount,
            mastered_count: masteredCount,
            needs_review_count: needsReviewCount,
            accuracy_rate: studiedCount > 0 ? Math.round((masteredCount / studiedCount) * 100) : 0
          });
        }
      } catch (err) {
        console.error('Error fetching home data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user, guestProgress]);

  if (loading) {
    return (
      <Container className="text-center py-5">
        <Spinner color="primary" />
        <p className="mt-2 text-muted">Đang tải giáo trình N5...</p>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      {/* Hero Banner */}
      <div
        className="p-4 p-md-5 mb-4 rounded-4 shadow-sm text-white"
        style={{
          background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 50%, #3b82f6 100%)',
        }}
      >
        <Row className="align-items-center">
          <Col lg={8}>
            <div className="d-inline-flex align-items-center bg-white bg-opacity-25 px-3 py-1 rounded-pill mb-3 text-white small fw-semibold">
              <Sparkles size={14} className="me-1 text-warning" /> Giáo trình Minna no Nihongo N5 Chuẩn
            </div>
            <h1 className="fw-bold mb-3 display-6">
              Hệ thống Học & Ôn tập Từ vựng Tiếng Nhật N5
            </h1>
            <p className="lead opacity-90 mb-4 fs-6" style={{ maxWidth: '650px' }}>
              Trọn bộ <strong>25 bài học</strong> với <strong>1,589 từ vựng đầy đủ</strong>. Học theo từng bài độc lập, luyện Flashcard 3D, làm trắc nghiệm 4 dạng câu hỏi, luyện gõ Kana và nghe phát âm chuẩn bản xứ!
            </p>
            <div className="d-flex flex-wrap gap-2">
              <Button
                color="warning"
                className="fw-bold px-4 py-2 text-dark shadow-sm d-flex align-items-center"
                style={{ gap: '8px' }}
                onClick={() => {
                  if (onSelectLesson) onSelectLesson(1);
                  onNavigate('lessons');
                }}
              >
                <span>Học ngay Bài 01</span>
                <ArrowRight size={18} />
              </Button>
              <Button
                color="light"
                outline
                className="fw-semibold px-4 py-2 text-white border-white d-flex align-items-center"
                style={{ gap: '8px' }}
                onClick={() => onNavigate('flashcard')}
              >
                <Layers size={18} />
                <span>Học Flashcard</span>
              </Button>
            </div>
          </Col>
          <Col lg={4} className="d-none d-lg-block text-center">
            <div className="bg-white bg-opacity-10 p-4 rounded-4 border border-white border-opacity-25">
              <div className="fs-1 fw-bold text-warning mb-1">25 Bài</div>
              <div className="text-white-50 small mb-3">Minna no Nihongo N5</div>
              <div className="row g-2 text-center">
                <div className="col-6">
                  <div className="bg-white bg-opacity-20 p-2 rounded">
                    <div className="fw-bold fs-5">1,589</div>
                    <div className="small text-white-50">Tổng từ vựng</div>
                  </div>
                </div>
                <div className="col-6">
                  <div className="bg-white bg-opacity-20 p-2 rounded">
                    <div className="fw-bold fs-5">100%</div>
                    <div className="small text-white-50">Âm thanh chuẩn</div>
                  </div>
                </div>
              </div>
            </div>
          </Col>
        </Row>
      </div>

      {/* Overview Statistics Cards */}
      {stats && (
        <Row className="g-3 mb-4">
          <Col sm={6} md={3}>
            <Card className="jlpt-card border-0 shadow-sm h-100">
              <CardBody className="d-flex align-items-center">
                <div className="bg-primary bg-opacity-10 text-primary p-3 rounded-circle me-3">
                  <BookOpen size={24} />
                </div>
                <div>
                  <div className="text-muted small">Từ vựng đã tiếp cận</div>
                  <div className="fs-4 fw-bold text-dark">
                    {stats.studied_vocabularies} <span className="text-muted fs-6 fw-normal">/ {stats.total_vocabularies}</span>
                  </div>
                </div>
              </CardBody>
            </Card>
          </Col>

          <Col sm={6} md={3}>
            <Card className="jlpt-card border-0 shadow-sm h-100">
              <CardBody className="d-flex align-items-center">
                <div className="bg-success bg-opacity-10 text-success p-3 rounded-circle me-3">
                  <CheckCircle size={24} />
                </div>
                <div>
                  <div className="text-muted small">Từ đã nhớ vững</div>
                  <div className="fs-4 fw-bold text-success">
                    {stats.mastered_count}
                  </div>
                </div>
              </CardBody>
            </Card>
          </Col>

          <Col sm={6} md={3}>
            <Card className="jlpt-card border-0 shadow-sm h-100">
              <CardBody className="d-flex align-items-center">
                <div className="bg-danger bg-opacity-10 text-danger p-3 rounded-circle me-3">
                  <Zap size={24} />
                </div>
                <div>
                  <div className="text-muted small">Từ cần ôn lại</div>
                  <div className="fs-4 fw-bold text-danger">
                    {stats.needs_review_count}
                  </div>
                </div>
              </CardBody>
            </Card>
          </Col>

          <Col sm={6} md={3}>
            <Card className="jlpt-card border-0 shadow-sm h-100">
              <CardBody className="d-flex align-items-center">
                <div className="bg-warning bg-opacity-10 text-warning p-3 rounded-circle me-3">
                  <Award size={24} />
                </div>
                <div>
                  <div className="text-muted small">Tỷ lệ chính xác</div>
                  <div className="fs-4 fw-bold text-dark">
                    {stats.accuracy_rate}%
                  </div>
                </div>
              </CardBody>
            </Card>
          </Col>
        </Row>
      )}

      {/* Learning Modes Quick Links */}
      <h4 className="fw-bold mb-3 text-navy-dark d-flex align-items-center" style={{ gap: '8px' }}>
        <Sparkles size={20} className="text-primary" />
        <span>Phương pháp học tập đa dạng</span>
      </h4>
      <Row className="g-3 mb-5">
        <Col md={3} sm={6}>
          <Card
            className="jlpt-card border-0 shadow-sm h-100"
            style={{ cursor: 'pointer' }}
            onClick={() => onNavigate('lessons')}
          >
            <CardBody className="text-center p-4">
              <div className="bg-primary bg-opacity-10 text-primary mx-auto p-3 rounded-circle mb-3" style={{ width: '60px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <BookOpen size={28} />
              </div>
              <h5 className="fw-bold mb-2">Học theo từng bài</h5>
              <p className="text-muted small mb-0">Học lần lượt từ Bài 01 đến 25, không trộn lẫn nội dung giữa các bài.</p>
            </CardBody>
          </Card>
        </Col>

        <Col md={3} sm={6}>
          <Card
            className="jlpt-card border-0 shadow-sm h-100"
            style={{ cursor: 'pointer' }}
            onClick={() => onNavigate('flashcard')}
          >
            <CardBody className="text-center p-4">
              <div className="bg-info bg-opacity-10 text-info mx-auto p-3 rounded-circle mb-3" style={{ width: '60px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Layers size={28} />
              </div>
              <h5 className="fw-bold mb-2">Thẻ nhớ Flashcard</h5>
              <p className="text-muted small mb-0">Lật thẻ 3D ghi nhớ Kanji, Kana, nghĩa tiếng Việt và tự đánh giá Đã nhớ / Chưa nhớ.</p>
            </CardBody>
          </Card>
        </Col>

        <Col md={3} sm={6}>
          <Card
            className="jlpt-card border-0 shadow-sm h-100"
            style={{ cursor: 'pointer' }}
            onClick={() => onNavigate('quiz')}
          >
            <CardBody className="text-center p-4">
              <div className="bg-success bg-opacity-10 text-success mx-auto p-3 rounded-circle mb-3" style={{ width: '60px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CheckSquare size={28} />
              </div>
              <h5 className="fw-bold mb-2">Bài trắc nghiệm</h5>
              <p className="text-muted small mb-0">4 dạng câu hỏi: Chọn nghĩa đúng, Chọn từ Nhật, Chọn cách đọc Kanji và chấm điểm tự động.</p>
            </CardBody>
          </Card>
        </Col>

        <Col md={3} sm={6}>
          <Card
            className="jlpt-card border-0 shadow-sm h-100"
            style={{ cursor: 'pointer' }}
            onClick={() => onNavigate('practice')}
          >
            <CardBody className="text-center p-4">
              <div className="bg-warning bg-opacity-10 text-warning mx-auto p-3 rounded-circle mb-3" style={{ width: '60px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Keyboard size={28} />
              </div>
              <h5 className="fw-bold mb-2">Luyện gõ Kana</h5>
              <p className="text-muted small mb-0">Nhập đáp án Hiragana/Katakana trực tiếp như bảng tính, kiểm tra tức thì đúng/sai.</p>
            </CardBody>
          </Card>
        </Col>
      </Row>

      {/* 25 Lessons Grid */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="fw-bold text-navy-dark mb-0 d-flex align-items-center" style={{ gap: '8px' }}>
          <BookOpen size={20} className="text-primary" />
          <span>Danh sách 25 Bài học Minna no Nihongo N5</span>
        </h4>
        <span className="badge bg-secondary text-white rounded-pill px-3 py-2">
          25 Bài toàn tập
        </span>
      </div>

      <Row className="g-3">
        {lessons.map((lesson) => (
          <Col md={6} lg={4} key={lesson.id}>
            <Card
              className="jlpt-card border-0 shadow-sm h-100 hover-shadow"
              style={{ cursor: 'pointer' }}
              onClick={() => {
                if (onSelectLesson) onSelectLesson(lesson.lesson_number);
                onNavigate('lessons');
              }}
            >
              <CardBody className="d-flex flex-column justify-content-between p-3">
                <div>
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <Badge color="primary" pill className="px-2 py-1 fs-7">
                      Bài {lesson.lesson_number < 10 ? `0${lesson.lesson_number}` : lesson.lesson_number}
                    </Badge>
                    <span className="text-muted small fw-medium">
                      {lesson.vocab_count} từ vựng
                    </span>
                  </div>
                  <h6 className="fw-bold text-dark mb-2" style={{ lineHeight: '1.4' }}>
                    {lesson.title}
                  </h6>
                </div>
                <div className="pt-2 border-top d-flex justify-content-between align-items-center mt-3">
                  <span className="small text-primary fw-semibold d-flex align-items-center" style={{ gap: '4px' }}>
                    Vào học ngay <ArrowRight size={14} />
                  </span>
                  <div className="d-flex gap-1">
                    <Button
                      color="light"
                      size="sm"
                      className="p-1 px-2 text-secondary rounded"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onSelectLesson) onSelectLesson(lesson.lesson_number);
                        onNavigate('flashcard');
                      }}
                      title="Học Flashcard bài này"
                    >
                      <Layers size={14} />
                    </Button>
                    <Button
                      color="light"
                      size="sm"
                      className="p-1 px-2 text-secondary rounded"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onSelectLesson) onSelectLesson(lesson.lesson_number);
                        onNavigate('quiz');
                      }}
                      title="Làm trắc nghiệm bài này"
                    >
                      <CheckSquare size={14} />
                    </Button>
                  </div>
                </div>
              </CardBody>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
};

export default HomePage;
