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
  PenTool,
  Flame,
  ShieldCheck,
  Compass
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
        if (lessonRes.data && Array.isArray(lessonRes.data) && lessonRes.data.length > 0) {
          setLessons(lessonRes.data);
        } else {
          setLessons(Array.from({ length: 25 }, (_, i) => ({
            id: i + 1,
            lesson_number: i + 1,
            title: `Bài ${i + 1}`,
            description: `Từ vựng Minna no Nihongo Bài ${i + 1}`,
            vocab_count: 64
          })));
        }

        if (user) {
          const progRes = await progressService.getProgress();
          setStats(progRes.data.overall);
        } else {
          const studiedCount = Object.keys(guestProgress).length;
          const masteredCount = Object.values(guestProgress).filter(p => p.status === 'mastered').length;
          const needsReviewCount = Object.values(guestProgress).filter(p => p.status === 'needs_review').length;
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
        setLessons(Array.from({ length: 25 }, (_, i) => ({
          id: i + 1,
          lesson_number: i + 1,
          title: `Bài ${i + 1}`,
          description: `Từ vựng Minna no Nihongo Bài ${i + 1}`,
          vocab_count: 64
        })));
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
        <p className="mt-2 text-muted">Đang tải hệ thống HYPER JAPAN...</p>
      </Container>
    );
  }

  const features = [
    {
      id: 'lessons',
      title: '25 Bài Minna no Nihongo',
      desc: '1,589 từ vựng đầy đủ, phân theo từng bài độc lập có phát âm giọng Tokyo',
      icon: BookOpen,
      color: '#2563eb',
      badge: 'Cốt lõi'
    },
    {
      id: 'kanji',
      title: 'Học Chữ Hán Kanji',
      desc: '80+ Kanji N5 cơ bản với âm Hán-Việt, On/Kun, số nét và từ ghép thực tế',
      icon: PenTool,
      color: '#7c3aed',
      badge: 'N5 Trọng tâm'
    },
    {
      id: 'flashcard',
      title: 'Thẻ Nhớ Flashcard 3D',
      desc: 'Lật thẻ 2 chiều Việt ➔ Nhật hoặc Nhật ➔ Việt, tích hợp âm thanh tự động',
      icon: Layers,
      color: '#059669',
      badge: 'Trí nhớ sâu'
    },
    {
      id: 'practice',
      title: 'Luyện Gõ Không Gợi Ý',
      desc: 'Tự gõ Hiragana bằng Romaji máy tự chuyển đổi, tăng phản xạ ghi nhớ',
      icon: Keyboard,
      color: '#d97706',
      badge: 'Phản xạ gõ'
    },
    {
      id: 'quiz',
      title: 'Trắc Nghiệm JLPT N5',
      desc: 'Câu hỏi 4 lựa chọn A, B, C, D kiểm tra nghĩa từ, tiếng Nhật và đọc Kanji có chấm điểm tự động',
      icon: CheckSquare,
      color: '#dc2626',
      badge: 'Chấm điểm tự động'
    },
    {
      id: 'review',
      title: 'Ôn Tập Từ Sai',
      desc: 'Tự động tổng hợp các từ trả lời sai trong mọi chế độ để củng cố lỗ hổng',
      icon: Flame,
      color: '#ea580c',
      badge: 'Khắc phục điểm yếu'
    }
  ];

  return (
    <Container className="py-3 py-md-4">
      {/* 1. HERO BANNER WITH HYPER JAPAN BRANDING */}
      <div
        className="p-4 p-md-5 mb-4 rounded-4 shadow-lg position-relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #091224 0%, #0f2552 45%, #1d4ed8 100%)',
          border: '1px solid rgba(255,255,255,0.15)',
          color: '#ffffff'
        }}
      >
        {/* Glow circles */}
        <div
          className="position-absolute"
          style={{
            top: '-50px',
            right: '-50px',
            width: '360px',
            height: '360px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(239, 68, 68, 0.25) 0%, rgba(37, 99, 235, 0) 70%)',
            pointerEvents: 'none'
          }}
        />

        <Row className="align-items-center position-relative" style={{ zIndex: 1 }}>
          <Col lg={8}>
            <div
              className="d-inline-flex align-items-center px-3 py-1 rounded-pill mb-3 text-white small fw-bold"
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.15)', border: '1px solid rgba(255,255,255,0.25)' }}
            >
              <Sparkles size={14} className="me-1 text-warning" /> Nền Tảng Học Tiếng Nhật Toàn Diện • Cấp Độ {currentLevel}
            </div>

            <h1 className="fw-black mb-2 display-4 tracking-tight text-white" style={{ textShadow: '0 2px 8px rgba(0,0,0,0.4)' }}>
              HYPER <span style={{ color: '#ef4444' }}>JAPAN</span>
            </h1>

            <h4 className="fw-bold mb-3 fs-5" style={{ color: '#fbbf24', textShadow: '0 1px 4px rgba(0,0,0,0.3)' }}>
              Giáo trình chuẩn Minna no Nihongo 25 Bài • 1,589 Từ vựng • Chữ Hán Kanji N5
            </h4>

            <p className="lead mb-4 fs-6 text-white text-opacity-90" style={{ maxWidth: '640px', lineHeight: '1.6' }}>
              Hệ thống học tiếng Nhật thông minh với lộ trình bài bản: Học từng từ có phát âm giọng Tokyo chuẩn, luyện Flashcard 3D, luyện gõ Kana không gợi ý và làm bài trắc nghiệm tính điểm chuẩn xác.
            </p>

            <div className="d-flex flex-wrap align-items-center" style={{ gap: '14px' }}>
              <button
                type="button"
                className="btn text-white fw-bold d-inline-flex align-items-center rounded-pill"
                style={{
                  gap: '8px',
                  padding: '12px 24px',
                  fontSize: '14.5px',
                  background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                  border: 'none',
                  boxShadow: '0 4px 18px rgba(239, 68, 68, 0.42)',
                  transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 24px rgba(239, 68, 68, 0.55)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 18px rgba(239, 68, 68, 0.42)';
                }}
                onClick={() => {
                  if (onSelectLesson) onSelectLesson(1);
                  onNavigate('lessons');
                }}
              >
                <span>Bắt đầu Bài 01 ngay</span>
                <ArrowRight size={17} />
              </button>

              <button
                type="button"
                className="btn text-white fw-semibold d-inline-flex align-items-center rounded-pill"
                style={{
                  gap: '8px',
                  padding: '12px 22px',
                  fontSize: '14px',
                  backgroundColor: 'rgba(255, 255, 255, 0.12)',
                  border: '1px solid rgba(255, 255, 255, 0.22)',
                  backdropFilter: 'blur(10px)',
                  transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.38)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.12)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.22)';
                }}
                onClick={() => onNavigate('kanji')}
              >
                <PenTool size={16} className="text-info" />
                <span>Học Chữ Hán Kanji</span>
              </button>

              <button
                type="button"
                className="btn text-white fw-semibold d-inline-flex align-items-center rounded-pill"
                style={{
                  gap: '8px',
                  padding: '12px 22px',
                  fontSize: '14px',
                  backgroundColor: 'rgba(255, 255, 255, 0.12)',
                  border: '1px solid rgba(255, 255, 255, 0.22)',
                  backdropFilter: 'blur(10px)',
                  transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.38)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.12)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.22)';
                }}
                onClick={() => onNavigate('quiz')}
              >
                <CheckSquare size={16} style={{ color: '#fbbf24' }} />
                <span>Kiểm tra trắc nghiệm</span>
              </button>
            </div>
          </Col>

          {/* Right Logo Display Card */}
          <Col lg={4} className="d-none d-lg-block text-center">
            <div
              className="p-4 rounded-4 shadow-sm text-white"
              style={{
                backgroundColor: 'rgba(15, 23, 42, 0.75)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                backdropFilter: 'blur(12px)'
              }}
            >
              <div className="bg-white p-2 rounded-3 d-inline-block shadow-sm mb-2">
                <img
                  src="/logo.png"
                  alt="HYPER JAPAN"
                  style={{ width: '80px', height: '80px', objectFit: 'contain' }}
                />
              </div>

              <div className="fs-4 fw-black text-white mt-1 mb-0">HYPER JAPAN</div>
              <div className="small mb-3 text-warning fw-bold">Chuẩn N5 • 25 Bài Minna no Nihongo</div>

              <div className="row g-2 text-center">
                <div className="col-6">
                  <div className="p-2 rounded-3" style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}>
                    <div className="fw-black fs-5 text-white">1,589</div>
                    <div className="small text-white text-opacity-75" style={{ fontSize: '11px' }}>Từ vựng N5</div>
                  </div>
                </div>
                <div className="col-6">
                  <div className="p-2 rounded-3" style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}>
                    <div className="fw-black fs-5 text-warning">80+</div>
                    <div className="small text-white text-opacity-75" style={{ fontSize: '11px' }}>Hán tự Kanji</div>
                  </div>
                </div>
              </div>
            </div>
          </Col>
        </Row>
      </div>

      {/* 2. STATS & PROGRESS QUICK WIDGET */}
      {stats && (
        <Row className="g-3 mb-4">
          <Col sm={6} lg={3}>
            <Card className="jlpt-card border-0 shadow-sm h-100 rounded-3">
              <CardBody className="p-3.5">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <small className="text-secondary fw-semibold text-uppercase" style={{ fontSize: '11px', letterSpacing: '0.04em' }}>Đã học</small>
                    <h3 className="fw-bold text-navy-dark mb-0 mt-0.5">{stats.studied_vocabularies}</h3>
                    <small className="text-muted" style={{ fontSize: '12px' }}>/ 1,589 từ vựng</small>
                  </div>
                  <div className="d-flex align-items-center justify-content-center rounded-3" style={{ width: '42px', height: '42px', background: '#eff6ff', color: '#2563eb' }}>
                    <BookOpen size={20} />
                  </div>
                </div>
              </CardBody>
            </Card>
          </Col>

          <Col sm={6} lg={3}>
            <Card className="jlpt-card border-0 shadow-sm h-100 rounded-3">
              <CardBody className="p-3.5">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <small className="text-secondary fw-semibold text-uppercase" style={{ fontSize: '11px', letterSpacing: '0.04em' }}>Đã thuộc</small>
                    <h3 className="fw-bold text-emerald-600 mb-0 mt-0.5" style={{ color: '#059669' }}>{stats.mastered_count}</h3>
                    <small className="fw-semibold" style={{ color: '#059669', fontSize: '12px' }}>
                      {Math.round((stats.mastered_count / stats.total_vocabularies) * 100)}% thành thạo
                    </small>
                  </div>
                  <div className="d-flex align-items-center justify-content-center rounded-3" style={{ width: '42px', height: '42px', background: '#ecfdf5', color: '#059669' }}>
                    <CheckCircle size={20} />
                  </div>
                </div>
              </CardBody>
            </Card>
          </Col>

          <Col sm={6} lg={3}>
            <Card className="jlpt-card border-0 shadow-sm h-100 rounded-3">
              <CardBody className="p-3.5">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <small className="text-secondary fw-semibold text-uppercase" style={{ fontSize: '11px', letterSpacing: '0.04em' }}>Cần ôn tập</small>
                    <h3 className="fw-bold mb-0 mt-0.5" style={{ color: '#dc2626' }}>{stats.needs_review_count}</h3>
                    <small style={{ fontSize: '12px' }}>
                      {stats.needs_review_count > 0 ? (
                        <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('review'); }} className="text-danger fw-semibold text-decoration-none">
                          Ôn từ sai ngay ➔
                        </a>
                      ) : (
                        <span className="text-muted">Không có từ sai</span>
                      )}
                    </small>
                  </div>
                  <div className="d-flex align-items-center justify-content-center rounded-3" style={{ width: '42px', height: '42px', background: '#fef2f2', color: '#dc2626' }}>
                    <Flame size={20} />
                  </div>
                </div>
              </CardBody>
            </Card>
          </Col>

          <Col sm={6} lg={3}>
            <Card className="jlpt-card border-0 shadow-sm h-100 rounded-3">
              <CardBody className="p-3.5">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <small className="text-secondary fw-semibold text-uppercase" style={{ fontSize: '11px', letterSpacing: '0.04em' }}>Độ chính xác</small>
                    <h3 className="fw-bold mb-0 mt-0.5" style={{ color: '#d97706' }}>{stats.accuracy_rate}%</h3>
                    <small className="text-muted" style={{ fontSize: '12px' }}>Qua bài tập & trắc nghiệm</small>
                  </div>
                  <div className="d-flex align-items-center justify-content-center rounded-3" style={{ width: '42px', height: '42px', background: '#fffbeb', color: '#d97706' }}>
                    <Award size={20} />
                  </div>
                </div>
              </CardBody>
            </Card>
          </Col>
        </Row>
      )}

      {/* 3. 6 FEATURE METHOD CARDS */}
      <div className="mb-4">
        <h4 className="fw-black text-navy-dark tracking-tight mb-1">Phương Pháp Học Tập Đa Dạng</h4>
        <p className="text-muted small mb-3">Tối ưu hóa khả năng ghi nhớ dài hạn qua nhiều hình thức tương tác</p>

        <Row className="g-3">
          {features.map((feat) => {
            const IconComp = feat.icon;
            return (
              <Col md={6} lg={4} key={feat.id}>
                <Card
                  className="jlpt-card border-0 shadow-sm h-100 rounded-4 cursor-pointer hover-shadow"
                  onClick={() => onNavigate(feat.id)}
                  style={{ cursor: 'pointer' }}
                >
                  <CardBody className="p-4 d-flex flex-column justify-content-between">
                    <div>
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <div
                          className="d-flex align-items-center justify-content-center rounded-3 text-white shadow-sm"
                          style={{ width: '44px', height: '44px', backgroundColor: feat.color }}
                        >
                          <IconComp size={22} />
                        </div>
                        <Badge color="light" pill className="border text-secondary px-2.5 py-1">
                          {feat.badge}
                        </Badge>
                      </div>

                      <h5 className="fw-bold text-navy-dark mb-1">{feat.title}</h5>
                      <p className="text-muted small mb-3" style={{ lineHeight: '1.5' }}>
                        {feat.desc}
                      </p>
                    </div>

                    <div className="d-flex align-items-center gap-1 text-primary fw-bold small">
                      <span>Bắt đầu ngay</span>
                      <ArrowRight size={14} />
                    </div>
                  </CardBody>
                </Card>
              </Col>
            );
          })}
        </Row>
      </div>

      {/* 4. LESSON DIRECTORY (25 MINNA LESSONS) */}
      <div className="bg-white p-4 rounded-4 shadow-sm border mb-4">
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
          <div>
            <h4 className="fw-black text-navy-dark mb-0">Danh Sách 25 Bài Học Minna no Nihongo N5</h4>
            <small className="text-muted">Chọn một bài bất kỳ để bắt đầu học và luyện tập</small>
          </div>

          <div className="position-relative">
            <Input
              type="text"
              placeholder="Tìm theo số bài hoặc chủ đề..."
              value={lessonSearch}
              onChange={(e) => setLessonSearch(e.target.value)}
              className="form-control-sm rounded-pill pe-4"
              style={{ minWidth: '260px' }}
            />
            <Search size={14} className="position-absolute top-50 end-0 translate-middle-y me-2.5 text-muted" />
          </div>
        </div>

        <Row className="g-2.5">
          {filteredLessons.map((l) => (
            <Col sm={6} md={4} lg={3} key={l.id}>
              <div
                onClick={() => {
                  if (onSelectLesson) onSelectLesson(l.lesson_number);
                  onNavigate('lessons');
                }}
                className="p-3 rounded-3 border bg-light bg-opacity-50 hover-shadow transition-all cursor-pointer h-100 d-flex flex-column justify-content-between"
                style={{ cursor: 'pointer' }}
              >
                <div>
                  <div className="d-flex justify-content-between align-items-center mb-1.5">
                    <span className="badge rounded-pill bg-primary fw-bold px-2 py-0.5" style={{ fontSize: '11px' }}>
                      Bài {l.lesson_number < 10 ? `0${l.lesson_number}` : l.lesson_number}
                    </span>
                    <small className="text-muted fw-semibold" style={{ fontSize: '11px' }}>
                      {l.vocab_count} từ
                    </small>
                  </div>
                  <h6 className="fw-bold text-dark mb-1 small text-truncate" title={l.title}>
                    {l.title}
                  </h6>
                </div>
                <div className="d-flex align-items-center gap-1 text-primary small mt-2" style={{ fontSize: '11.5px' }}>
                  <span>Vào học</span>
                  <ArrowRight size={12} />
                </div>
              </div>
            </Col>
          ))}
        </Row>
      </div>
    </Container>
  );
};

export default HomePage;
