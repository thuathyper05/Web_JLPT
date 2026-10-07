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
  Spinner,
  Input
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
  Volume2,
  TrendingUp,
  Search,
  Star
} from 'lucide-react';
import { lessonService, progressService } from '../services/api';
import { useApp } from '../context/AppContext';
import Logo from '../components/Logo';

const HomePage = ({ onNavigate, onSelectLesson }) => {
  const { user, guestProgress } = useApp();
  const [lessons, setLessons] = useState([]);
  const [stats, setStats] = useState(null);
  const [lessonSearch, setLessonSearch] = useState('');
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

  const filteredLessons = lessons.filter(l => {
    if (!lessonSearch.trim()) return true;
    const q = lessonSearch.toLowerCase();
    return (
      l.title.toLowerCase().includes(q) ||
      `bài ${l.lesson_number}`.includes(q) ||
      `bai ${l.lesson_number}`.includes(q)
    );
  });

  if (loading) {
    return (
      <Container className="text-center py-5">
        <Spinner color="primary" />
        <p className="mt-2 text-muted">Đang tải hệ thống HYPER JLPT...</p>
      </Container>
    );
  }

  return (
    <Container className="py-3 py-md-4">
      {/* High-End Hero Banner */}
      <div
        className="p-4 p-md-5 mb-4 rounded-4 shadow-lg text-white position-relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #2563eb 100%)',
          border: '1px solid rgba(255,255,255,0.1)'
        }}
      >
        {/* Subtle background glow effect */}
        <div
          className="position-absolute"
          style={{
            top: '-50px',
            right: '-50px',
            width: '280px',
            height: '280px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(56, 189, 248, 0.25) 0%, rgba(37, 99, 235, 0) 70%)',
            pointerEvents: 'none'
          }}
        />

        <Row className="align-items-center position-relative" style={{ zIndex: 1 }}>
          <Col lg={8}>
            <div className="d-inline-flex align-items-center bg-white bg-opacity-20 px-3 py-1 rounded-pill mb-3 text-white small fw-bold">
              <Sparkles size={14} className="me-1 text-warning" /> Nền tảng Học Từ vựng Tiếng Nhật N5 Toàn diện
            </div>
            <h1 className="fw-black mb-2 display-5 tracking-tight text-white">
              HYPER JLPT N5
            </h1>
            <h4 className="fw-medium opacity-90 mb-3 fs-5 text-light">
              Giáo trình chuẩn Minna no Nihongo 25 Bài • 1,589 Từ vựng
            </h4>
            <p className="lead opacity-80 mb-4 fs-6" style={{ maxWidth: '640px' }}>
              Học độc lập từng bài, Flashcard 3D tự động phát âm chuẩn bản xứ, luyện gõ Kana thông minh và làm bài trắc nghiệm tính điểm thời gian thực.
            </p>
            <div className="d-flex flex-wrap gap-2">
              <Button
                color="warning"
                className="fw-black px-4 py-2 text-dark shadow-sm d-flex align-items-center rounded-pill"
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
                className="fw-bold px-4 py-2 text-white border-white border-opacity-60 d-flex align-items-center rounded-pill hover-bg"
                style={{ gap: '8px' }}
                onClick={() => onNavigate('flashcard')}
              >
                <Layers size={18} />
                <span>Thẻ Flashcard 3D</span>
              </Button>
            </div>
          </Col>

          <Col lg={4} className="d-none d-lg-block text-center">
            <div className="bg-white bg-opacity-10 p-4 rounded-4 border border-white border-opacity-20 shadow-sm glass-effect text-white">
              <Logo size={46} showText={false} />
              <div className="fs-3 fw-black text-warning mt-2 mb-0">25 BÀI N5</div>
              <div className="text-white text-opacity-75 small mb-3">Toàn bộ 1,589 Từ vựng</div>
              <div className="row g-2 text-center">
                <div className="col-6">
                  <div className="bg-white bg-opacity-15 p-2 rounded-3">
                    <div className="fw-black fs-5">100%</div>
                    <div className="small text-white-50" style={{ fontSize: '11px' }}>Phát âm chuẩn</div>
                  </div>
                </div>
                <div className="col-6">
                  <div className="bg-white bg-opacity-15 p-2 rounded-3">
                    <div className="fw-black fs-5">Kana IME</div>
                    <div className="small text-white-50" style={{ fontSize: '11px' }}>Tự chuyển Hiragana</div>
                  </div>
                </div>
              </div>
            </div>
          </Col>
        </Row>
      </div>

      {/* Metrics Summary Cards */}
      {stats && (
        <Row className="g-2 g-md-3 mb-4">
          <Col xs={6} md={3}>
            <Card className="jlpt-card border-0 shadow-sm h-100">
              <CardBody className="p-3 d-flex align-items-center">
                <div className="bg-primary bg-opacity-10 text-primary p-2 p-md-3 rounded-circle me-2 me-md-3">
                  <BookOpen size={22} />
                </div>
                <div>
                  <div className="text-muted small" style={{ fontSize: '12px' }}>Đã học</div>
                  <div className="fs-5 fs-md-4 fw-bold text-dark">
                    {stats.studied_vocabularies} <span className="text-muted fs-7 fw-normal">/ {stats.total_vocabularies}</span>
                  </div>
                </div>
              </CardBody>
            </Card>
          </Col>

          <Col xs={6} md={3}>
            <Card className="jlpt-card border-0 shadow-sm h-100">
              <CardBody className="p-3 d-flex align-items-center">
                <div className="bg-success bg-opacity-10 text-success p-2 p-md-3 rounded-circle me-2 me-md-3">
                  <CheckCircle size={22} />
                </div>
                <div>
                  <div className="text-muted small" style={{ fontSize: '12px' }}>Đã nhớ vững</div>
                  <div className="fs-5 fs-md-4 fw-bold text-success">
                    {stats.mastered_count}
                  </div>
                </div>
              </CardBody>
            </Card>
          </Col>

          <Col xs={6} md={3}>
            <Card className="jlpt-card border-0 shadow-sm h-100">
              <CardBody className="p-3 d-flex align-items-center">
                <div className="bg-danger bg-opacity-10 text-danger p-2 p-md-3 rounded-circle me-2 me-md-3">
                  <Zap size={22} />
                </div>
                <div>
                  <div className="text-muted small" style={{ fontSize: '12px' }}>Cần ôn lại</div>
                  <div className="fs-5 fs-md-4 fw-bold text-danger">
                    {stats.needs_review_count}
                  </div>
                </div>
              </CardBody>
            </Card>
          </Col>

          <Col xs={6} md={3}>
            <Card className="jlpt-card border-0 shadow-sm h-100">
              <CardBody className="p-3 d-flex align-items-center">
                <div className="bg-warning bg-opacity-10 text-warning p-2 p-md-3 rounded-circle me-2 me-md-3">
                  <Award size={22} />
                </div>
                <div>
                  <div className="text-muted small" style={{ fontSize: '12px' }}>Độ chính xác</div>
                  <div className="fs-5 fs-md-4 fw-bold text-dark">
                    {stats.accuracy_rate}%
                  </div>
                </div>
              </CardBody>
            </Card>
          </Col>
        </Row>
      )}

      {/* Methods Feature Row */}
      <h5 className="fw-bold mb-3 text-navy-dark d-flex align-items-center gap-2">
        <Sparkles size={18} className="text-primary" />
        <span>Chế độ luyện tập chuyên sâu</span>
      </h5>
      <Row className="g-3 mb-4">
        <Col md={3} xs={6}>
          <Card
            className="jlpt-card border-0 shadow-sm h-100 text-center"
            style={{ cursor: 'pointer' }}
            onClick={() => onNavigate('lessons')}
          >
            <CardBody className="p-3 p-md-4">
              <div className="bg-primary bg-opacity-10 text-primary mx-auto p-3 rounded-circle mb-2" style={{ width: '56px', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <BookOpen size={26} />
              </div>
              <h6 className="fw-bold mb-1">Học theo bài</h6>
              <p className="text-muted small mb-0 d-none d-sm-block">Từng từ hoặc dạng bảng không lẫn lộn</p>
            </CardBody>
          </Card>
        </Col>

        <Col md={3} xs={6}>
          <Card
            className="jlpt-card border-0 shadow-sm h-100 text-center"
            style={{ cursor: 'pointer' }}
            onClick={() => onNavigate('flashcard')}
          >
            <CardBody className="p-3 p-md-4">
              <div className="bg-info bg-opacity-10 text-info mx-auto p-3 rounded-circle mb-2" style={{ width: '56px', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Layers size={26} />
              </div>
              <h6 className="fw-bold mb-1">Flashcard 3D</h6>
              <p className="text-muted small mb-0 d-none d-sm-block">Tiếng Việt ➔ Tiếng Nhật & Audio</p>
            </CardBody>
          </Card>
        </Col>

        <Col md={3} xs={6}>
          <Card
            className="jlpt-card border-0 shadow-sm h-100 text-center"
            style={{ cursor: 'pointer' }}
            onClick={() => onNavigate('quiz')}
          >
            <CardBody className="p-3 p-md-4">
              <div className="bg-success bg-opacity-10 text-success mx-auto p-3 rounded-circle mb-2" style={{ width: '56px', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CheckSquare size={26} />
              </div>
              <h6 className="fw-bold mb-1">Trắc nghiệm</h6>
              <p className="text-muted small mb-0 d-none d-sm-block">4 dạng câu hỏi tính điểm tự động</p>
            </CardBody>
          </Card>
        </Col>

        <Col md={3} xs={6}>
          <Card
            className="jlpt-card border-0 shadow-sm h-100 text-center"
            style={{ cursor: 'pointer' }}
            onClick={() => onNavigate('practice')}
          >
            <CardBody className="p-3 p-md-4">
              <div className="bg-warning bg-opacity-10 text-warning mx-auto p-3 rounded-circle mb-2" style={{ width: '56px', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Keyboard size={26} />
              </div>
              <h6 className="fw-bold mb-1">Luyện gõ Kana</h6>
              <p className="text-muted small mb-0 d-none d-sm-block">Không gợi ý, tự gõ chuyển Kana</p>
            </CardBody>
          </Card>
        </Col>
      </Row>

      {/* 25 Lessons Grid with instant search */}
      <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
        <h5 className="fw-bold text-navy-dark mb-0 d-flex align-items-center gap-2">
          <BookOpen size={18} className="text-primary" />
          <span>Danh sách 25 Bài học Minna no Nihongo N5</span>
        </h5>
        <div className="d-flex align-items-center gap-2">
          <Input
            type="text"
            placeholder="Lọc bài học..."
            value={lessonSearch}
            onChange={(e) => setLessonSearch(e.target.value)}
            className="form-control-sm"
            style={{ width: '160px' }}
          />
          <Badge color="primary" pill className="px-3 py-1 fs-7">
            25 Bài toàn tập
          </Badge>
        </div>
      </div>

      <Row className="g-3">
        {filteredLessons.map((lesson) => (
          <Col md={6} lg={4} key={lesson.id}>
            <Card
              className="jlpt-card border-0 shadow-sm h-100"
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
                  <span className="small text-primary fw-semibold d-flex align-items-center gap-1">
                    Vào học <ArrowRight size={14} />
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
