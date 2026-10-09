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
  BookOpen,
  Layers,
  CheckSquare,
  Keyboard,
  ArrowRight,
  Sparkles,
  Zap,
  Award,
  Volume2,
  TrendingUp,
  Search,
  Star,
  PenTool,
  Flame,
  ShieldCheck,
  Compass,
  PlayCircle,
  GraduationCap
} from 'lucide-react';
import { lessonService, progressService } from '../services/api';
import { useApp } from '../context/AppContext';
import Logo from '../components/Logo';
import { sounds } from '../services/sounds';

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
        <p className="mt-2 text-muted small">Đang nạp hệ thống HYPER JAPAN...</p>
      </Container>
    );
  }

  const features = [
    {
      id: 'lessons',
      title: '25 Bài Minna no Nihongo',
      desc: '1,589 từ vựng chuẩn Minna, học từng từ với phát âm Tokyo và ghi chú ngữ pháp chi tiết',
      icon: BookOpen,
      color: '#2563eb',
      bg: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
      badge: 'Cốt lõi'
    },
    {
      id: 'kanji',
      title: 'Học Chữ Hán Kanji N5',
      desc: '80+ Kanji thiết yếu với thứ tự nét, âm On/Kun, Hán-Việt và từ ghép ví dụ thực tế',
      icon: PenTool,
      color: '#7c3aed',
      bg: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
      badge: 'N5 Trọng tâm'
    },
    {
      id: 'flashcard',
      title: 'Thẻ Nhớ Flashcard 3D',
      desc: 'Lật thẻ 3D hai chiều Việt ➔ Nhật hoặc Nhật ➔ Việt, tích hợp âm thanh tự động',
      icon: Layers,
      color: '#059669',
      bg: 'linear-gradient(135deg, #059669, #047857)',
      badge: 'Trí nhớ sâu'
    },
    {
      id: 'practice',
      title: 'Luyện Gõ Phản Xạ',
      desc: 'Gõ Romaji máy tự chuyển đổi sang Hiragana, rèn phản xạ tư duy tiếng Nhật tức thì',
      icon: Keyboard,
      color: '#d97706',
      bg: 'linear-gradient(135deg, #d97706, #b45309)',
      badge: 'Phản xạ gõ'
    },
    {
      id: 'quiz',
      title: 'Trắc Nghiệm JLPT N5',
      desc: 'Bộ đề thi 4 lựa chọn ABCD bấm giờ sát với format bài thi năng lực Nhật ngữ thực tế',
      icon: CheckSquare,
      color: '#dc2626',
      bg: 'linear-gradient(135deg, #dc2626, #b91c1c)',
      badge: 'Thi thử ABCD'
    },
    {
      id: 'review',
      title: 'Kho Ôn Tập Từ Sai',
      desc: 'Tự động lưu và nhắc lại các từ bạn từng làm sai để khắc phục triệt để lỗ hổng',
      icon: Flame,
      color: '#ea580c',
      bg: 'linear-gradient(135deg, #ea580c, #c2410c)',
      badge: 'Khắc phục từ sai'
    }
  ];

  return (
    <Container className="py-2.5 py-md-4" style={{ maxWidth: '1240px', overflowX: 'hidden' }}>
      {/* ── 1. LUXURY TOKYO HERO BANNER ── */}
      <div
        className="p-3 p-sm-4 p-md-5 mb-3 mb-md-4 rounded-4 shadow-lg position-relative overflow-hidden"
        style={{
          background: 'radial-gradient(ellipse at top right, #1e3a8a 0%, #0f172a 50%, #030712 100%)',
          border: '1px solid rgba(255, 255, 255, 0.14)',
          color: '#ffffff'
        }}
      >
        {/* Japanese Calligraphy Background Watermark */}
        <div
          className="position-absolute pe-none user-select-none d-none d-sm-block"
          style={{
            top: '50%',
            right: '2%',
            transform: 'translateY(-50%)',
            fontSize: 'clamp(6rem, 16vw, 14rem)',
            fontWeight: 900,
            fontFamily: "'Noto Sans JP', sans-serif",
            color: 'rgba(255, 255, 255, 0.03)',
            lineHeight: 1,
            zIndex: 0
          }}
        >
          日本語
        </div>

        {/* Ambient Glow Orbs */}
        <div
          className="position-absolute pe-none"
          style={{
            top: '-60px',
            right: '-60px',
            width: '320px',
            height: '320px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(37, 99, 235, 0.28) 0%, transparent 70%)',
            filter: 'blur(40px)',
            zIndex: 0
          }}
        />

        {/* Content Container */}
        <div className="position-relative" style={{ zIndex: 1, maxWidth: '720px' }}>
          {/* Top Pill Badge */}
          <div className="d-inline-flex align-items-center gap-2 px-3 py-1.5 rounded-pill mb-3"
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.18)',
              fontSize: '12px'
            }}
          >
            <span className="badge rounded-pill bg-danger text-white px-2 py-0.5 fw-bold" style={{ fontSize: '10px' }}>
              JLPT N5 PRO
            </span>
            <span className="text-white text-opacity-90 fw-medium">
              Giáo trình Minna no Nihongo chuẩn 25 bài
            </span>
          </div>

          <h1
            className="fw-black mb-2.5 text-white tracking-tight"
            style={{
              fontSize: 'clamp(1.75rem, 5vw, 3rem)',
              lineHeight: '1.2'
            }}
          >
            Chinh Phục JLPT N5 <br className="d-none d-sm-inline" />
            <span style={{
              background: 'linear-gradient(135deg, #60a5fa 0%, #38bdf8 50%, #f43f5e 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              Hiệu Quả & Vững Vàng
            </span>
          </h1>

          <p
            className="mb-3.5 text-white text-opacity-80"
            style={{
              fontSize: 'clamp(13px, 3.2vw, 15px)',
              lineHeight: '1.6',
              maxWidth: '580px'
            }}
          >
            Nền tảng học từ vựng tiếng Nhật thông minh với phương pháp phản xạ đa giác quan:
            Flashcard 3D chuyển động, phát âm chuẩn Tokyo, trắc nghiệm bấm giờ thực tế và luyện gõ Romaji ➔ Hiragana.
          </p>

          {/* Action Buttons */}
          <div className="d-flex align-items-center gap-2 flex-wrap mb-3.5">
            <Button
              color="danger"
              size="lg"
              onClick={() => {
                sounds.playFlip();
                if (onSelectLesson) onSelectLesson(1);
                onNavigate('lessons');
              }}
              className="fw-bold px-4 py-2.5 rounded-pill shadow-lg d-flex align-items-center gap-2 border-0"
              style={{
                background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                fontSize: '14px'
              }}
            >
              <PlayCircle size={18} />
              <span>Bắt đầu Bài 01 ngay</span>
            </Button>

            <Button
              color="light"
              size="lg"
              onClick={() => {
                sounds.playFlip();
                onNavigate('flashcard');
              }}
              className="fw-bold px-3.5 py-2.5 rounded-pill border d-flex align-items-center gap-2"
              style={{
                background: 'rgba(255, 255, 255, 0.12)',
                borderColor: 'rgba(255, 255, 255, 0.25)',
                color: '#ffffff',
                fontSize: '14px',
                backdropFilter: 'blur(8px)'
              }}
            >
              <Layers size={17} />
              <span>Luyện Flashcard 3D</span>
            </Button>
          </div>

          {/* Quick Metrics Bar inside Hero */}
          <div className="row g-2 pt-2 border-top border-white border-opacity-15" style={{ maxWidth: '480px' }}>
            <div className="col-4">
              <div className="small text-white text-opacity-70" style={{ fontSize: '11px' }}>Tổng bài học</div>
              <div className="fw-black text-white fs-5">25 Bài</div>
            </div>
            <div className="col-4">
              <div className="small text-white text-opacity-70" style={{ fontSize: '11px' }}>Từ vựng N5</div>
              <div className="fw-black text-warning fs-5">1,589 Từ</div>
            </div>
            <div className="col-4">
              <div className="small text-white text-opacity-70" style={{ fontSize: '11px' }}>Chữ Hán Kanji</div>
              <div className="fw-black text-info fs-5">80+ Kanji</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── 2. USER PROGRESS KPI SUMMARY BAR ── */}
      {stats && (
        <Row className="g-2 g-md-3 mb-3 mb-md-4">
          <Col xs={6} lg={3}>
            <Card className="jlpt-card border-0 shadow-sm h-100 rounded-3">
              <CardBody className="p-2.5 p-md-3">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <small className="text-secondary fw-semibold text-uppercase" style={{ fontSize: '10.5px' }}>Đã học</small>
                    <h4 className="fw-black mb-0 text-primary mt-0.5">{stats.studied_vocabularies}</h4>
                    <small className="text-muted" style={{ fontSize: '11px' }}>/ 1,589 từ vựng</small>
                  </div>
                  <div className="d-flex align-items-center justify-content-center rounded-3 flex-shrink-0" style={{ width: '38px', height: '38px', background: '#eff6ff', color: '#2563eb' }}>
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
                    <small className="text-secondary fw-semibold text-uppercase" style={{ fontSize: '10.5px' }}>Đã thuộc làu</small>
                    <h4 className="fw-black mb-0 text-success mt-0.5">{stats.mastered_count}</h4>
                    <small className="text-muted" style={{ fontSize: '11px' }}>
                      {Math.round((stats.mastered_count / 1589) * 100)}% hoàn thành
                    </small>
                  </div>
                  <div className="d-flex align-items-center justify-content-center rounded-3 flex-shrink-0" style={{ width: '38px', height: '38px', background: '#ecfdf5', color: '#10b981' }}>
                    <Award size={18} />
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
                    <small className="text-secondary fw-semibold text-uppercase" style={{ fontSize: '10.5px' }}>Cần ôn lại</small>
                    <h4 className="fw-black mb-0 text-danger mt-0.5">{stats.needs_review_count}</h4>
                    <small style={{ fontSize: '11px' }}>
                      {stats.needs_review_count > 0 ? (
                        <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('review'); }} className="text-danger fw-bold text-decoration-none">
                          Ôn từ sai ➔
                        </a>
                      ) : (
                        <span className="text-muted">Hoàn hảo</span>
                      )}
                    </small>
                  </div>
                  <div className="d-flex align-items-center justify-content-center rounded-3 flex-shrink-0" style={{ width: '38px', height: '38px', background: '#fef2f2', color: '#ef4444' }}>
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
                    <small className="text-secondary fw-semibold text-uppercase" style={{ fontSize: '10.5px' }}>Tỷ lệ đúng</small>
                    <h4 className="fw-black mb-0 text-warning mt-0.5">{stats.accuracy_rate}%</h4>
                    <small className="text-muted" style={{ fontSize: '11px' }}>Độ ghi nhớ sâu</small>
                  </div>
                  <div className="d-flex align-items-center justify-content-center rounded-3 flex-shrink-0" style={{ width: '38px', height: '38px', background: '#fffbeb', color: '#f59e0b' }}>
                    <TrendingUp size={18} />
                  </div>
                </div>
              </CardBody>
            </Card>
          </Col>
        </Row>
      )}

      {/* ── 3. 6 CORE LEARNING METHODS ── */}
      <div className="mb-3 mb-md-4">
        <div className="d-flex justify-content-between align-items-center mb-2.5">
          <div>
            <h5 className="fw-black text-navy-dark tracking-tight mb-0" style={{ fontSize: '1.15rem' }}>
              Phương Pháp Học Tập Khoa Học
            </h5>
            <small className="text-muted">Lộ trình rèn luyện 4 kỹ năng ghi nhớ từ vựng N5</small>
          </div>
        </div>

        <Row className="g-2 g-md-3">
          {features.map((feat) => {
            const IconComp = feat.icon;
            return (
              <Col xs={6} md={6} lg={4} key={feat.id}>
                <Card
                  className="jlpt-card border-0 shadow-sm h-100 rounded-3 cursor-pointer hover-shadow"
                  onClick={() => {
                    sounds.playFlip();
                    onNavigate(feat.id);
                  }}
                  style={{ cursor: 'pointer', transition: 'all 0.2s ease' }}
                >
                  <CardBody className="p-3 d-flex flex-column justify-content-between">
                    <div>
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <div
                          className="d-flex align-items-center justify-content-center rounded-3 text-white shadow-xs"
                          style={{ width: '36px', height: '36px', background: feat.bg }}
                        >
                          <IconComp size={18} />
                        </div>
                        <Badge color="light" pill className="border text-secondary px-2 py-0.5 d-none d-sm-inline" style={{ fontSize: '10.5px' }}>
                          {feat.badge}
                        </Badge>
                      </div>

                      <h6 className="fw-bold text-navy-dark mb-1" style={{ fontSize: '14px' }}>
                        {feat.title}
                      </h6>
                      <p className="text-muted small mb-0 d-none d-md-block" style={{ fontSize: '12px', lineHeight: '1.45' }}>
                        {feat.desc}
                      </p>
                    </div>

                    <div className="d-flex align-items-center gap-1 text-primary fw-bold mt-2" style={{ fontSize: '12px' }}>
                      <span>Vào học</span>
                      <ArrowRight size={12} />
                    </div>
                  </CardBody>
                </Card>
              </Col>
            );
          })}
        </Row>
      </div>

      {/* ── 4. 25 LESSON DIRECTORY (REFINED RESPONSIVE AUTO-FIT GRID) ── */}
      <div className="bg-white p-3 p-md-4 rounded-4 shadow-sm border mb-4" style={{ width: '100%', maxWidth: '100%', overflow: 'hidden' }}>
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
          <div>
            <h5 className="fw-black text-navy-dark mb-0" style={{ fontSize: '1.15rem' }}>
              25 Bài Học Minna no Nihongo N5
            </h5>
            <small className="text-muted">Chọn bài học để bắt đầu học từ vựng, flashcard hoặc làm bài thi</small>
          </div>

          <div className="position-relative flex-grow-1 flex-sm-grow-0" style={{ maxWidth: '260px', width: '100%' }}>
            <Input
              type="text"
              placeholder="Tìm theo số bài, chủ đề..."
              value={lessonSearch}
              onChange={(e) => setLessonSearch(e.target.value)}
              className="form-control-sm rounded-pill pe-4"
              style={{ fontSize: '12.5px', background: '#f8fafc' }}
            />
            <Search size={14} className="position-absolute top-50 end-0 translate-middle-y me-2.5 text-muted" />
          </div>
        </div>

        {/* Responsive CSS Grid: auto-fills smoothly without horizontal overflow */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 260px), 1fr))',
            gap: '12px',
            width: '100%'
          }}
        >
          {filteredLessons.map((l) => (
            <div
              key={l.id}
              onClick={() => {
                sounds.playFlip();
                if (onSelectLesson) onSelectLesson(l.lesson_number);
                onNavigate('lessons');
              }}
              className="p-3 rounded-3 border bg-light bg-opacity-40 hover-shadow transition-all cursor-pointer d-flex flex-column justify-content-between"
              style={{
                cursor: 'pointer',
                borderColor: '#e2e8f0',
                transition: 'all 0.18s ease',
                minHeight: '110px'
              }}
            >
              <div>
                <div className="d-flex justify-content-between align-items-center mb-1.5">
                  <span
                    className="badge rounded-pill fw-bold px-2 py-0.5 text-white"
                    style={{
                      background: 'linear-gradient(135deg, #1e3a8a, #2563eb)',
                      fontSize: '11px'
                    }}
                  >
                    第{l.lesson_number}課 • Bài {l.lesson_number < 10 ? `0${l.lesson_number}` : l.lesson_number}
                  </span>
                  <span className="badge bg-white text-secondary border px-2 py-0.5 rounded-pill" style={{ fontSize: '11px' }}>
                    {l.vocab_count} từ
                  </span>
                </div>

                {/* Lesson Title with clean 2-line clamp and word break */}
                <div
                  className="fw-bold text-navy-dark"
                  title={l.title}
                  style={{
                    fontSize: '12.5px',
                    lineHeight: '1.45',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    wordBreak: 'break-word'
                  }}
                >
                  {l.title}
                </div>
              </div>

              <div className="d-flex align-items-center justify-content-between pt-2 mt-2 border-top border-slate-200 border-opacity-60 text-primary small fw-semibold" style={{ fontSize: '11.5px' }}>
                <span>Vào học bài</span>
                <ArrowRight size={13} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </Container>
  );
};

export default HomePage;
