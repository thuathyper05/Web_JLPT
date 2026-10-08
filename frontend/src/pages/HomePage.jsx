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
    <Container className="py-2 py-md-4">
      {/* 1. HERO BANNER WITH HYPER JAPAN BRANDING */}
      <div
        className="p-3 p-md-5 mb-3 mb-md-4 rounded-4 shadow-sm position-relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #091224 0%, #0f2552 45%, #1d4ed8 100%)',
          border: '1px solid rgba(255,255,255,0.15)',
          color: '#ffffff'
        }}
      >
        {/* Glow circles */}
        <div
          className="position-absolute d-none d-md-block"
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
              className="d-inline-flex align-items-center px-2.5 py-0.5 rounded-pill mb-2 text-white small fw-bold"
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.15)', border: '1px solid rgba(255,255,255,0.25)', fontSize: '11px' }}
            >
              <Sparkles size={12} className="me-1 text-warning" /> JLPT N5 Master System
            </div>

            <h1 className="fw-black mb-1 tracking-tight text-white" style={{ fontSize: 'clamp(1.75rem, 6vw, 3rem)', textShadow: '0 2px 8px rgba(0,0,0,0.4)' }}>
              HYPER <span style={{ color: '#ef4444' }}>JAPAN</span>
            </h1>

            <h6 className="fw-bold mb-2 text-warning" style={{ fontSize: 'clamp(0.85rem, 3vw, 1.15rem)', textShadow: '0 1px 4px rgba(0,0,0,0.3)' }}>
              25 Bài Minna no Nihongo • 1,589 Từ vựng • 80+ Kanji N5
            </h6>

            <p className="d-none d-md-block lead mb-3 fs-6 text-white text-opacity-90" style={{ maxWidth: '640px', lineHeight: '1.6' }}>
              Hệ thống học tiếng Nhật thông minh với lộ trình bài bản: Học từng từ có phát âm giọng Tokyo chuẩn, luyện Flashcard 3D, luyện gõ Kana không gợi ý và làm bài trắc nghiệm tính điểm chuẩn xác.
            </p>

            <div className="d-flex flex-wrap align-items-center gap-2 mt-2 mt-md-3">
              <button
                type="button"
                className="btn text-white fw-bold d-inline-flex align-items-center rounded-pill"
                style={{
                  gap: '6px',
                  padding: '9px 18px',
                  fontSize: '13.5px',
                  background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                  border: 'none',
                  boxShadow: '0 4px 14px rgba(239, 68, 68, 0.4)',
                  transition: 'all 0.2s ease'
                }}
                onClick={() => {
                  if (onSelectLesson) onSelectLesson(1);
                  onNavigate('lessons');
                }}
              >
                <span>Học Bài 01 ngay</span>
                <ArrowRight size={15} />
              </button>

              <button
                type="button"
                className="btn text-white fw-semibold d-inline-flex align-items-center rounded-pill"
                style={{
                  gap: '6px',
                  padding: '9px 14px',
                  fontSize: '13px',
                  backgroundColor: 'rgba(255, 255, 255, 0.12)',
                  border: '1px solid rgba(255, 255, 255, 0.22)',
                  backdropFilter: 'blur(10px)'
                }}
                onClick={() => onNavigate('kanji')}
              >
                <PenTool size={14} className="text-info" />
                <span>Chữ Hán</span>
              </button>

              <button
                type="button"
                className="btn text-white fw-semibold d-inline-flex align-items-center rounded-pill"
                style={{
                  gap: '6px',
                  padding: '9px 14px',
                  fontSize: '13px',
                  backgroundColor: 'rgba(255, 255, 255, 0.12)',
                  border: '1px solid rgba(255, 255, 255, 0.22)',
                  backdropFilter: 'blur(10px)'
                }}
                onClick={() => onNavigate('quiz')}
              >
                <CheckSquare size={14} style={{ color: '#fbbf24' }} />
                <span>Trắc nghiệm</span>
              </button>
            </div>
          </Col>

          {/* Right Logo Display Card (Desktop Only) */}
          <Col lg={4} className="d-none d-lg-block text-center">
            <div
              className="p-3.5 rounded-4 shadow-sm text-white"
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
                  style={{ width: '70px', height: '70px', objectFit: 'contain' }}
                />
              </div>

              <div className="fs-5 fw-black text-white mt-1 mb-0">HYPER JAPAN</div>
              <div className="small mb-2.5 text-warning fw-bold" style={{ fontSize: '11px' }}>Chuẩn N5 • 25 Bài Minna no Nihongo</div>

              <div className="row g-2 text-center">
                <div className="col-6">
                  <div className="p-1.5 rounded-3" style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}>
                    <div className="fw-black fs-6 text-white">1,589</div>
                    <div className="text-white text-opacity-75" style={{ fontSize: '10px' }}>Từ vựng N5</div>
                  </div>
                </div>
                <div className="col-6">
                  <div className="p-1.5 rounded-3" style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}>
                    <div className="fw-black fs-6 text-warning">80+</div>
                    <div className="text-white text-opacity-75" style={{ fontSize: '10px' }}>Hán tự Kanji</div>
                  </div>
                </div>
              </div>
            </div>
          </Col>
        </Row>
      </div>

      {/* 2. STATS & PROGRESS QUICK WIDGET (Compact 2x2 Grid on Mobile) */}
      {stats && (
        <Row className="g-2 g-md-3 mb-3 mb-md-4">
          <Col xs={6} lg={3}>
            <Card className="jlpt-card border-0 shadow-sm h-100 rounded-3">
              <CardBody className="p-2.5 p-md-3">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <small className="text-secondary fw-semibold text-uppercase" style={{ fontSize: '10px', letterSpacing: '0.04em' }}>Đã học</small>
                    <h4 className="fw-bold text-navy-dark mb-0 mt-0.5">{stats.studied_vocabularies}</h4>
                    <small className="text-muted" style={{ fontSize: '11px' }}>/ 1,589 từ</small>
                  </div>
                  <div className="d-flex align-items-center justify-content-center rounded-3 flex-shrink-0" style={{ width: '36px', height: '36px', background: '#eff6ff', color: '#2563eb' }}>
                    <BookOpen size={18} />
                  </div>
                </div>
              </CardBody>
            </Card>
          </Col>

          <Col xs={6} lg={3}>
            <Card className="jlpt-card border-0 shadow-sm h-100 rounded-3">
              <CardBody className="p-2.5 p-md-3">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <small className="text-secondary fw-semibold text-uppercase" style={{ fontSize: '10px', letterSpacing: '0.04em' }}>Đã thuộc</small>
                    <h4 className="fw-bold mb-0 mt-0.5" style={{ color: '#059669' }}>{stats.mastered_count}</h4>
                    <small className="fw-semibold" style={{ color: '#059669', fontSize: '11px' }}>
                      {Math.round((stats.mastered_count / stats.total_vocabularies) * 100)}% thuộc
                    </small>
                  </div>
                  <div className="d-flex align-items-center justify-content-center rounded-3 flex-shrink-0" style={{ width: '36px', height: '36px', background: '#ecfdf5', color: '#059669' }}>
                    <CheckCircle size={18} />
                  </div>
                </div>
              </CardBody>
            </Card>
          </Col>

          <Col xs={6} lg={3}>
            <Card className="jlpt-card border-0 shadow-sm h-100 rounded-3">
              <CardBody className="p-2.5 p-md-3">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <small className="text-secondary fw-semibold text-uppercase" style={{ fontSize: '10px', letterSpacing: '0.04em' }}>Cần ôn lại</small>
                    <h4 className="fw-bold mb-0 mt-0.5" style={{ color: '#dc2626' }}>{stats.needs_review_count}</h4>
                    <small style={{ fontSize: '11px' }}>
                      {stats.needs_review_count > 0 ? (
                        <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('review'); }} className="text-danger fw-semibold text-decoration-none">
                          Ôn từ sai ➔
                        </a>
                      ) : (
                        <span className="text-muted">Tốt</span>
                      )}
                    </small>
                  </div>
                  <div className="d-flex align-items-center justify-content-center rounded-3 flex-shrink-0" style={{ width: '36px', height: '36px', background: '#fef2f2', color: '#dc2626' }}>
                    <Flame size={18} />
                  </div>
                </div>
              </CardBody>
            </Card>
          </Col>

          <Col xs={6} lg={3}>
            <Card className="jlpt-card border-0 shadow-sm h-100 rounded-3">
              <CardBody className="p-2.5 p-md-3">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <small className="text-secondary fw-semibold text-uppercase" style={{ fontSize: '10px', letterSpacing: '0.04em' }}>Độ đúng</small>
                    <h4 className="fw-bold mb-0 mt-0.5" style={{ color: '#d97706' }}>{stats.accuracy_rate}%</h4>
                    <small className="text-muted" style={{ fontSize: '11px' }}>Tỷ lệ điểm</small>
                  </div>
                  <div className="d-flex align-items-center justify-content-center rounded-3 flex-shrink-0" style={{ width: '36px', height: '36px', background: '#fffbeb', color: '#d97706' }}>
                    <Award size={18} />
                  </div>
                </div>
              </CardBody>
            </Card>
          </Col>
        </Row>
      )}

      {/* 3. 6 FEATURE METHOD CARDS (2-Column Grid on Mobile) */}
      <div className="mb-3 mb-md-4">
        <div className="d-flex justify-content-between align-items-end mb-2">
          <div>
            <h5 className="fw-black text-navy-dark tracking-tight mb-0">Phương Pháp Rèn Luyện</h5>
            <small className="text-muted d-none d-sm-inline">Lộ trình học bài bản đạt chuẩn JLPT N5</small>
          </div>
        </div>

        <Row className="g-2 g-md-3">
          {features.map((feat) => {
            const IconComp = feat.icon;
            return (
              <Col xs={6} md={6} lg={4} key={feat.id}>
                <Card
                  className="jlpt-card border-0 shadow-sm h-100 rounded-3 cursor-pointer hover-shadow"
                  onClick={() => onNavigate(feat.id)}
                  style={{ cursor: 'pointer' }}
                >
                  <CardBody className="p-2.5 p-md-3 d-flex flex-column justify-content-between">
                    <div>
                      <div className="d-flex justify-content-between align-items-center mb-1.5">
                        <div
                          className="d-flex align-items-center justify-content-center rounded-3 text-white shadow-xs"
                          style={{ width: '34px', height: '34px', backgroundColor: feat.color }}
                        >
                          <IconComp size={17} />
                        </div>
                        <Badge color="light" pill className="border text-secondary px-1.5 py-0.5 d-none d-sm-inline" style={{ fontSize: '10px' }}>
                          {feat.badge}
                        </Badge>
                      </div>

                      <h6 className="fw-bold text-navy-dark mb-1" style={{ fontSize: 'clamp(12px, 3.5vw, 15px)' }}>{feat.title}</h6>
                      <p className="text-muted small mb-0 d-none d-md-block" style={{ fontSize: '12px', lineHeight: '1.4' }}>
                        {feat.desc}
                      </p>
                    </div>

                    <div className="d-flex align-items-center gap-1 text-primary fw-bold mt-1.5" style={{ fontSize: '11.5px' }}>
                      <span>Vào học</span>
                      <ArrowRight size={11} />
                    </div>
                  </CardBody>
                </Card>
              </Col>
            );
          })}
        </Row>
      </div>

      {/* 4. LESSON DIRECTORY (25 MINNA LESSONS - 2-Column Grid on Mobile) */}
      <div className="bg-white p-3 p-md-4 rounded-4 shadow-sm border mb-4">
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-2.5">
          <div>
            <h5 className="fw-black text-navy-dark mb-0">25 Bài Học Minna no Nihongo</h5>
            <small className="text-muted">Chọn bài để học từ vựng, flashcard hoặc trắc nghiệm</small>
          </div>

          <div className="position-relative flex-grow-1 flex-sm-grow-0" style={{ maxWidth: '240px' }}>
            <Input
              type="text"
              placeholder="Tìm bài..."
              value={lessonSearch}
              onChange={(e) => setLessonSearch(e.target.value)}
              className="form-control-sm rounded-pill pe-4"
              style={{ fontSize: '12px' }}
            />
            <Search size={13} className="position-absolute top-50 end-0 translate-middle-y me-2.5 text-muted" />
          </div>
        </div>

        <Row className="g-2 g-md-2.5">
          {filteredLessons.map((l) => (
            <Col xs={6} md={4} lg={3} key={l.id}>
              <div
                onClick={() => {
                  if (onSelectLesson) onSelectLesson(l.lesson_number);
                  onNavigate('lessons');
                }}
                className="p-2 p-md-2.5 rounded-3 border bg-light bg-opacity-50 hover-shadow transition-all cursor-pointer h-100 d-flex flex-column justify-content-between"
                style={{ cursor: 'pointer' }}
              >
                <div>
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <span className="badge rounded-pill bg-primary fw-bold px-1.5 py-0.5" style={{ fontSize: '10px' }}>
                      Bài {l.lesson_number < 10 ? `0${l.lesson_number}` : l.lesson_number}
                    </span>
                    <small className="text-muted fw-semibold" style={{ fontSize: '10.5px' }}>
                      {l.vocab_count} từ
                    </small>
                  </div>
                  <div className="fw-bold text-dark small text-truncate" title={l.title} style={{ fontSize: '11.5px', lineHeight: '1.3' }}>
                    {l.title}
                  </div>
                </div>
                <div className="d-flex align-items-center gap-1 text-primary small mt-1.5" style={{ fontSize: '10.5px' }}>
                  <span>Chi tiết</span>
                  <ArrowRight size={11} />
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
