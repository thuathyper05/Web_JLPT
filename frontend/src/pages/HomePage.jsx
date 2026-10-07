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
  Star,
  PenTool
} from 'lucide-react';
import { lessonService, progressService } from '../services/api';
import { useApp } from '../context/AppContext';
import Logo from '../components/Logo';

const HomePage = ({ onNavigate, onSelectLesson, currentLevel = 'N5' }) => {
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
      {/* High-End Hero Banner: Fixed all text colors to pure white and bright amber for 100% contrast */}
      <div
        className="p-4 p-md-5 mb-4 rounded-4 shadow-lg position-relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #091224 0%, #0f2552 50%, #1d4ed8 100%)',
          border: '1px solid rgba(255,255,255,0.15)',
          color: '#ffffff'
        }}
      >
        {/* Decorative background glow */}
        <div
          className="position-absolute"
          style={{
            top: '-60px',
            right: '-60px',
            width: '320px',
            height: '320px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(56, 189, 248, 0.22) 0%, rgba(37, 99, 235, 0) 70%)',
            pointerEvents: 'none'
          }}
        />

        <Row className="align-items-center position-relative" style={{ zIndex: 1 }}>
          <Col lg={8}>
            <div className="d-inline-flex align-items-center px-3 py-1 rounded-pill mb-3 text-white small fw-bold" style={{ backgroundColor: 'rgba(255, 255, 255, 0.18)', border: '1px solid rgba(255,255,255,0.25)' }}>
              <Sparkles size={14} className="me-1 text-warning" /> Nền tảng Học Tiếng Nhật Thông Minh • Cấp độ {currentLevel}
            </div>
            <h1 className="fw-black mb-2 display-5 tracking-tight text-white" style={{ textShadow: '0 2px 8px rgba(0,0,0,0.4)' }}>
              HYPER JLPT {currentLevel}
            </h1>
            <h4 className="fw-bold mb-3 fs-5" style={{ color: '#fbbf24', textShadow: '0 1px 4px rgba(0,0,0,0.3)' }}>
              Giáo trình chuẩn Minna no Nihongo 25 Bài • 1,589 Từ vựng • Chữ Hán Kanji
            </h4>
            <p className="lead mb-4 fs-6" style={{ color: '#f1f5f9', maxWidth: '640px', lineHeight: '1.6' }}>
              Học theo từng bài độc lập, thẻ nhớ Flashcard 3D tự động phát âm bản xứ, luyện gõ Kana thông minh và làm bài trắc nghiệm tính điểm thời gian thực.
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
                <span>Vào học Bài 01</span>
                <ArrowRight size={18} />
              </Button>
              <Button
                color="light"
                outline
                className="fw-bold px-4 py-2 text-white border-white d-flex align-items-center rounded-pill"
                style={{ gap: '8px', backgroundColor: 'rgba(255, 255, 255, 0.12)' }}
                onClick={() => onNavigate('kanji')}
              >
                <PenTool size={18} />
                <span>Học Chữ Hán Kanji</span>
              </Button>
            </div>
          </Col>

          {/* Right Card Widget */}
          <Col lg={4} className="d-none d-lg-block text-center">
            <div
              className="p-4 rounded-4 shadow-sm text-white"
              style={{
                backgroundColor: 'rgba(15, 23, 42, 0.65)',
                border: '1px solid rgba(255, 255, 255, 0.22)',
                backdropFilter: 'blur(10px)'
              }}
            >
              <Logo size={46} showText={false} />
              <div className="fs-3 fw-black text-warning mt-2 mb-0">25 BÀI N5</div>
              <div className="small mb-3" style={{ color: '#e2e8f0' }}>1,589 Từ vựng • 80+ Kanji</div>
              <div className="row g-2 text-center">
                <div className="col-6">
                  <div className="p-2 rounded-3" style={{ backgroundColor: 'rgba(255, 255, 255, 0.12)' }}>
                    <div className="fw-black fs-5 text-white">100%</div>
                    <div className="small" style={{ color: '#cbd5e1', fontSize: '11px' }}>Phát âm chuẩn</div>
                  </div>
                </div>
                <div className="col-6">
                  <div className="p-2 rounded-3" style={{ backgroundColor: 'rgba(255, 255, 255, 0.12)' }}>
                    <div className="fw-black fs-5 text-warning">Kana IME</div>
                    <div className="small" style={{ color: '#cbd5e1', fontSize: '11px' }}>Tự chuyển Hiragana</div>
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

      {/* Methods Feature Row including Kanji */}
      <h5 className="fw-bold mb-3 text-navy-dark d-flex align-items-center gap-2">
        <Sparkles size={18} className="text-primary" />
        <span>Chế độ luyện tập chuyên sâu</span>
      </h5>
      <Row className="g-3 mb-4">
        <Col md={2} xs={6} className="col-lg">
          <Card
            className="jlpt-card border-0 shadow-sm h-100 text-center"
            style={{ cursor: 'pointer' }}
            onClick={() => onNavigate('lessons')}
          >
            <CardBody className="p-3">
              <div className="bg-primary bg-opacity-10 text-primary mx-auto p-2 p-md-3 rounded-circle mb-2" style={{ width: '52px', height: '52px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <BookOpen size={24} />
              </div>
              <h6 className="fw-bold mb-1">Học theo bài</h6>
              <p className="text-muted small mb-0 d-none d-sm-block">25 bài N5 chuẩn</p>
            </CardBody>
          </Card>
        </Col>

        <Col md={2} xs={6} className="col-lg">
          <Card
            className="jlpt-card border-0 shadow-sm h-100 text-center border-primary"
            style={{ cursor: 'pointer', background: 'linear-gradient(180deg, #ffffff 0%, #f0fdf4 100%)' }}
            onClick={() => onNavigate('kanji')}
          >
            <CardBody className="p-3">
              <div className="bg-success bg-opacity-10 text-success mx-auto p-2 p-md-3 rounded-circle mb-2" style={{ width: '52px', height: '52px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <PenTool size={24} />
              </div>
              <h6 className="fw-bold mb-1 text-success">Chữ Hán Kanji</h6>
              <p className="text-muted small mb-0 d-none d-sm-block">Hán Việt & số nét</p>
            </CardBody>
          </Card>
        </Col>

        <Col md={2} xs={6} className="col-lg">
          <Card
            className="jlpt-card border-0 shadow-sm h-100 text-center"
            style={{ cursor: 'pointer' }}
            onClick={() => onNavigate('flashcard')}
          >
            <CardBody className="p-3">
              <div className="bg-info bg-opacity-10 text-info mx-auto p-2 p-md-3 rounded-circle mb-2" style={{ width: '52px', height: '52px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Layers size={24} />
              </div>
              <h6 className="fw-bold mb-1">Flashcard 3D</h6>
              <p className="text-muted small mb-0 d-none d-sm-block">Lật thẻ & âm thanh</p>
            </CardBody>
          </Card>
        </Col>

        <Col md={2} xs={6} className="col-lg">
          <Card
            className="jlpt-card border-0 shadow-sm h-100 text-center"
            style={{ cursor: 'pointer' }}
            onClick={() => onNavigate('quiz')}
          >
            <CardBody className="p-3">
              <div className="bg-success bg-opacity-10 text-success mx-auto p-2 p-md-3 rounded-circle mb-2" style={{ width: '52px', height: '52px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CheckSquare size={24} />
              </div>
              <h6 className="fw-bold mb-1">Trắc nghiệm</h6>
              <p className="text-muted small mb-0 d-none d-sm-block">4 dạng câu hỏi</p>
            </CardBody>
          </Card>
        </Col>

        <Col md={2} xs={6} className="col-lg">
          <Card
            className="jlpt-card border-0 shadow-sm h-100 text-center"
            style={{ cursor: 'pointer' }}
            onClick={() => onNavigate('practice')}
          >
            <CardBody className="p-3">
              <div className="bg-warning bg-opacity-10 text-warning mx-auto p-2 p-md-3 rounded-circle mb-2" style={{ width: '52px', height: '52px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Keyboard size={24} />
              </div>
              <h6 className="fw-bold mb-1">Luyện gõ Kana</h6>
              <p className="text-muted small mb-0 d-none d-sm-block">Nhìn nghĩa gõ Kana</p>
            </CardBody>
          </Card>
        </Col>
      </Row>

      {/* 25 Lessons Grid */}
      <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
        <h5 className="fw-bold text-navy-dark mb-0 d-flex align-items-center gap-2">
          <BookOpen size={18} className="text-primary" />
          <span>Danh sách 25 Bài học Minna no Nihongo {currentLevel}</span>
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
                      className="p-1 px-2 text-secondary rounded border"
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
                      className="p-1 px-2 text-secondary rounded border"
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
