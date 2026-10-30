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
  ChevronRight,
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
  GraduationCap,
  Sprout
} from 'lucide-react';
import { lessonService, progressService } from '../services/api';
import { useApp } from '../context/AppContext';
import Logo from '../components/Logo';
import { sounds } from '../services/sounds';

const HomePage = ({ onNavigate, onSelectLesson, currentLevel = 'N5' }) => {
  const { user, guestProgress, progressVersion, onlineCount = 1, gamification } = useApp();
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
  }, [user, guestProgress, progressVersion]);

  const [lessonBundle, setLessonBundle] = useState('all'); // 'all' | 'b1_5' | 'b6_10' | 'b11_15' | 'b16_20' | 'b21_25'

  const filteredLessons = lessons.filter(l => {
    // Bundle filter
    if (lessonBundle === 'b1_5' && (l.lesson_number < 1 || l.lesson_number > 5)) return false;
    if (lessonBundle === 'b6_10' && (l.lesson_number < 6 || l.lesson_number > 10)) return false;
    if (lessonBundle === 'b11_15' && (l.lesson_number < 11 || l.lesson_number > 15)) return false;
    if (lessonBundle === 'b16_20' && (l.lesson_number < 16 || l.lesson_number > 20)) return false;
    if (lessonBundle === 'b21_25' && (l.lesson_number < 21 || l.lesson_number > 25)) return false;

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
      id: 'grammar',
      title: 'Ngữ Pháp Minna no Nihongo',
      desc: '55 cấu trúc mẫu câu chuẩn, phân tích công thức, câu ví dụ thực tế và lưu ý bẫy đề thi',
      icon: BookOpen,
      color: '#0ea5e9',
      bg: 'linear-gradient(135deg, #0ea5e9, #0284c7)',
      badge: 'Chuyên Đề Mới'
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
      desc: 'Lật thẻ 3D hai chiều Nhật sang Việt hoặc Việt sang Nhật, tích hợp âm thanh tự động',
      icon: Layers,
      color: '#059669',
      bg: 'linear-gradient(135deg, #059669, #047857)',
      badge: 'Ghi Nhớ Sâu'
    },
    {
      id: 'practice',
      title: 'Luyện Gõ Phản Xạ',
      desc: 'Gõ Romaji máy tự chuyển đổi sang Hiragana, rèn phản xạ tư duy tiếng Nhật tức thì',
      icon: Keyboard,
      color: '#d97706',
      bg: 'linear-gradient(135deg, #d97706, #b45309)',
      badge: 'Phản Xạ Gõ'
    },
    {
      id: 'quiz',
      title: 'Trắc Nghiệm JLPT N5',
      desc: 'Bộ đề thi 4 lựa chọn ABCD bấm giờ sát với format bài thi năng lực Nhật ngữ thực tế',
      icon: CheckSquare,
      color: '#dc2626',
      bg: 'linear-gradient(135deg, #dc2626, #b91c1c)',
      badge: 'Chuẩn Thi N5'
    },
    {
      id: 'wordmatch',
      title: 'Nối Từ Siêu Tốc',
      desc: 'Ghép cặp 10 thẻ Nhật–Việt trong 60 giây, tích combo điểm và rèn phản xạ nhanh',
      icon: Zap,
      color: '#f59e0b',
      bg: 'linear-gradient(135deg, #f59e0b, #d97706)',
      badge: 'Phản Xạ Nhanh'
    },
    {
      id: 'garden',
      title: 'Vườn Cây Trí Nhớ',
      desc: 'Mỗi từ vựng là một mầm cây phát triển qua 4 giai đoạn SRS để khắc ghi vĩnh viễn',
      icon: Sprout,
      color: '#10b981',
      bg: 'linear-gradient(135deg, #10b981, #059669)',
      badge: 'Bonsai SRS'
    },
    {
      id: 'particles',
      title: 'Luyện Trợ Từ N5 (助詞)',
      desc: 'Bách khoa 19 trợ từ căn bản, bí quyết phân biệt và 35+ câu trắc nghiệm thực chiến',
      icon: Compass,
      color: '#8b5cf6',
      bg: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
      badge: 'Chuyên Đề Mới'
    },
    {
      id: 'review',
      title: 'Kho Ôn Tập Từ Sai',
      desc: 'Tự động lưu và nhắc lại các từ bạn từng làm sai để khắc phục triệt để lỗ hổng',
      icon: Flame,
      color: '#ea580c',
      bg: 'linear-gradient(135deg, #ea580c, #c2410c)',
      badge: 'Khắc Phục Từ Khó'
    }
  ];

  return (
    <div className="app-shell" style={{ maxWidth: '1240px' }}>
      {/* ── 1. LUXURY TOKYO HERO BANNER ── */}
      <div
        className="p-4 p-sm-4 p-md-5 mb-4 rounded-4 shadow-lg position-relative overflow-hidden"
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
          <div className="d-inline-flex align-items-center gap-2 px-3 py-1.5 rounded-pill mb-3 flex-wrap"
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
            <span className="d-none d-sm-inline text-white text-opacity-35">•</span>
            <span className="d-inline-flex align-items-center gap-1.5" style={{ color: '#34d399', fontWeight: 600 }}>
              <span className="online-live-dot" />
              <span>{onlineCount} người đang học</span>
            </span>
            <span className="d-none d-sm-inline text-white text-opacity-35">•</span>
            <span className="d-inline-flex align-items-center gap-1.5 px-2 py-0.5 rounded-pill" style={{ background: 'rgba(245, 158, 11, 0.2)', border: '1px solid rgba(245, 158, 11, 0.45)', color: '#fbbf24', fontWeight: 700, fontSize: '11px' }}>
              <Flame size={12} fill="#f59e0b" />
              <span>Chuỗi {gamification?.current_streak || 1} ngày</span>
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
            Flashcard 3D chuyển động, phát âm chuẩn Tokyo, trắc nghiệm bấm giờ thực tế và luyện gõ Romaji chuyển đổi Hiragana.
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
              color="info"
              size="lg"
              onClick={() => {
                sounds.playFlip?.();
                onNavigate('grammar');
              }}
              className="fw-bold px-3.5 py-2.5 rounded-pill border-0 d-flex align-items-center gap-2 text-white shadow-md"
              style={{
                background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                fontSize: '14px'
              }}
            >
              <BookOpen size={17} />
              <span>Ngữ pháp 25 Bài</span>
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

      
      {/* ── 1.2. DAILY STUDY QUEST & STREAK HERO CARD (V2 GAMIFICATION) ── */}
      <div className="home-daily-quest-card">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
          {/* Left: Streak & Rank Badge */}
          <div className="d-flex align-items-center gap-3">
            <div
              className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
              style={{
                width: '46px',
                height: '46px',
                background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.28) 0%, rgba(239, 68, 68, 0.35) 100%)',
                border: '1.5px solid rgba(245, 158, 11, 0.6)',
                boxShadow: '0 0 16px rgba(245, 158, 11, 0.3)'
              }}
            >
              <Flame size={24} className="text-warning" fill="#f59e0b" />
            </div>
            <div>
              <div className="d-flex align-items-center gap-2 flex-wrap">
                <span className="fw-black text-white" style={{ fontSize: '15px' }}>
                  Chuỗi {gamification?.current_streak || 1} Ngày Liên Tiếp
                </span>
                <span
                  className="badge rounded-pill"
                  style={{
                    background: 'rgba(59, 130, 246, 0.25)',
                    border: '1px solid rgba(96, 165, 250, 0.4)',
                    color: '#93c5fd',
                    fontSize: '10.5px'
                  }}
                >
                  {gamification?.level_tier || 'Mầm non N5'}
                </span>
              </div>
              <div className="small text-white text-opacity-75 mt-0.5" style={{ fontSize: '12px' }}>
                Tổng tích lũy: <strong className="text-warning">{gamification?.total_xp || 50} XP</strong> • Cố lên, sắp lên cấp mới!
              </div>
            </div>
          </div>

          {/* Right: Quick Action Buttons */}
          <div className="d-flex align-items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => {
                sounds.playFlip?.();
                onNavigate('dashboard');
              }}
              className="btn btn-sm btn-outline-light rounded-pill px-3 py-1.5 fw-bold d-inline-flex align-items-center gap-1.5"
              style={{ fontSize: '12px', borderColor: 'rgba(255, 255, 255, 0.3)' }}
            >
              <Award size={14} className="text-warning" />
              <span>Kệ 6 Huy Hiệu</span>
            </button>

            <button
              type="button"
              onClick={() => {
                sounds.playFlip?.();
                onNavigate('lessons');
              }}
              className="btn btn-sm btn-primary rounded-pill px-3.5 py-1.5 fw-bold d-inline-flex align-items-center gap-1.5 border-0 shadow-sm"
              style={{
                fontSize: '12px',
                background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)'
              }}
            >
              <span>Tiếp tục học</span>
              <ChevronRight size={13} />
            </button>
          </div>
        </div>
      </div>

      {/* ── 1.5. NEW FLAGSHIP GAMES PROMO BANNER (COMPACT & SLEEK FOR ALL DEVICES) ── */}
      <div className="home-promo-section mb-4">
        <div className="d-flex align-items-center justify-content-between mb-2.5 px-0.5">
          <div className="d-flex align-items-center gap-2">
            <span className="beacon-blink-dot" />
            <span className="home-promo-mini-label">2 TÍNH NĂNG MỚI ĐỘT PHÁ</span>
          </div>
          <span className="home-promo-mini-sub d-none d-sm-inline">Phản xạ ghép thẻ 60s & Vườn Bonsai SRS</span>
        </div>

        <Row className="g-3 g-md-4">
          {/* Card 1: Nối Từ Siêu Tốc */}
          <Col xs={6} md={6}>
            <div 
              className="home-promo-card-compact home-promo-card-compact--rush"
              onClick={() => {
                sounds.playFlip?.();
                onNavigate('wordmatch');
              }}
            >
              {/* Top Row: Icon + Blinking Neon Badge */}
              <div className="d-flex align-items-center justify-content-between mb-1.5">
                <div className="home-promo-compact-icon home-promo-compact-icon--rush">
                  <Zap size={15} />
                </div>
                <span className="badge-new-blink badge-new-blink--rush">
                  MỚI
                </span>
              </div>

              {/* Title & Desktop Subtitle */}
              <div className="home-promo-compact-title">Nối Từ Siêu Tốc</div>
              <div className="home-promo-compact-sub d-none d-md-block mb-1.5">Ghép 10 thẻ trong 60s • Rèn phản xạ nhanh</div>

              {/* Bottom Row: Micro Pill + Action */}
              <div className="d-flex align-items-center justify-content-between mt-auto pt-1.5">
                <span className="home-promo-compact-sub">Phản Xạ 60s</span>
                <span className="home-promo-compact-cta home-promo-compact-cta--rush">
                  <span>Luyện ngay</span>
                  <ChevronRight size={12} />
                </span>
              </div>
            </div>
          </Col>

          {/* Card 2: Vườn Cây Trí Nhớ */}
          <Col xs={6} md={6}>
            <div 
              className="home-promo-card-compact home-promo-card-compact--garden"
              onClick={() => {
                sounds.playFlip?.();
                onNavigate('garden');
              }}
            >
              {/* Top Row: Icon + Blinking Neon Badge */}
              <div className="d-flex align-items-center justify-content-between mb-1.5">
                <div className="home-promo-compact-icon home-promo-compact-icon--garden">
                  <Sprout size={15} />
                </div>
                <span className="badge-new-blink badge-new-blink--garden">
                  MỚI
                </span>
              </div>

              {/* Title & Desktop Subtitle */}
              <div className="home-promo-compact-title">Vườn Cây Trí Nhớ</div>
              <div className="home-promo-compact-sub d-none d-md-block mb-1.5">Bonsai 4 cấp SRS • Ghi nhớ dài hạn</div>

              {/* Bottom Row: Micro Pill + Action */}
              <div className="d-flex align-items-center justify-content-between mt-auto pt-1.5">
                <span className="home-promo-compact-sub">Bonsai SRS</span>
                <span className="home-promo-compact-cta home-promo-compact-cta--garden">
                  <span>Trải nghiệm</span>
                  <ChevronRight size={12} />
                </span>
              </div>
            </div>
          </Col>
        </Row>
      </div>

      {/* ── 2. USER PROGRESS KPI SUMMARY BAR ── */}
      {stats && (
        <Row className="g-3 g-md-4 mb-4">
          <Col xs={6} lg={3}>
            <div className="app-metric-card h-100">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <div className="app-metric-label">Đã học</div>
                  <div className="app-metric-value text-primary">{stats.studied_vocabularies}</div>
                  <small className="text-muted" style={{ fontSize: '11px' }}>/ 1,589 từ vựng</small>
                </div>
                <div className="d-flex align-items-center justify-content-center rounded-3 flex-shrink-0" style={{ width: '42px', height: '42px', background: '#eff6ff', color: '#2563eb' }}>
                  <BookOpen size={20} />
                </div>
              </div>
            </div>
          </Col>

          <Col xs={6} lg={3}>
            <div className="app-metric-card h-100">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <div className="app-metric-label">Đã Thành Thạo</div>
                  <div className="app-metric-value text-success">{stats.mastered_count}</div>
                  <small className="text-muted" style={{ fontSize: '11px' }}>
                    {Math.round((stats.mastered_count / 1589) * 100)}% hoàn thành
                  </small>
                </div>
                <div className="d-flex align-items-center justify-content-center rounded-3 flex-shrink-0" style={{ width: '42px', height: '42px', background: '#ecfdf5', color: '#10b981' }}>
                  <Award size={20} />
                </div>
              </div>
            </div>
          </Col>

          <Col xs={6} lg={3}>
            <div className="app-metric-card h-100">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <div className="app-metric-label">Cần ôn lại</div>
                  <div className="app-metric-value text-danger">{stats.needs_review_count}</div>
                  <small style={{ fontSize: '11px' }}>
                    {stats.needs_review_count > 0 ? (
                      <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('review'); }} className="text-danger fw-bold text-decoration-none">
                        Ôn từ sai ngay
                      </a>
                    ) : (
                      <span className="text-muted">Hoàn hảo</span>
                    )}
                  </small>
                </div>
                <div className="d-flex align-items-center justify-content-center rounded-3 flex-shrink-0" style={{ width: '42px', height: '42px', background: '#fef2f2', color: '#ef4444' }}>
                  <Flame size={20} />
                </div>
              </div>
            </div>
          </Col>

          <Col xs={6} lg={3}>
            <div className="app-metric-card h-100">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <div className="app-metric-label">Tỷ lệ đúng</div>
                  <div className="app-metric-value text-warning">{stats.accuracy_rate}%</div>
                  <small className="text-muted" style={{ fontSize: '11px' }}>Độ ghi nhớ sâu</small>
                </div>
                <div className="d-flex align-items-center justify-content-center rounded-3 flex-shrink-0" style={{ width: '42px', height: '42px', background: '#fffbeb', color: '#f59e0b' }}>
                  <TrendingUp size={20} />
                </div>
              </div>
            </div>
          </Col>
        </Row>
      )}
      {/* ── 3. 6 CORE LEARNING METHODS ── */}
      <div className="mb-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            <h5 className="fw-black text-navy-dark tracking-tight mb-1" style={{ fontSize: '1.2rem' }}>
              Phương Pháp Học Tập Khoa Học
            </h5>
            <small className="text-muted">Lộ trình rèn luyện 4 kỹ năng ghi nhớ từ vựng N5</small>
          </div>
        </div>

        <Row className="g-3 g-md-4">
          {features.map((feat) => {
            const IconComp = feat.icon;
            return (
              <Col xs={6} md={6} lg={4} key={feat.id}>
                <div
                  className="app-surface-card h-100 p-3 p-md-3.5 d-flex flex-column justify-content-between"
                  onClick={() => {
                    sounds.playFlip();
                    onNavigate(feat.id);
                  }}
                  style={{ cursor: 'pointer' }}
                >
                  <div>
                    <div className="d-flex justify-content-between align-items-center mb-2.5">
                      <div
                        className="d-flex align-items-center justify-content-center rounded-3 text-white shadow-xs"
                        style={{ width: '40px', height: '40px', background: feat.bg }}
                      >
                        <IconComp size={20} />
                      </div>
                      {feat.id === 'wordmatch' ? (
                        <span className="badge-new-blink badge-new-blink--rush">MỚI</span>
                      ) : feat.id === 'garden' ? (
                        <span className="badge-new-blink badge-new-blink--garden">MỚI</span>
                      ) : (
                        <Badge color="light" pill className="border text-secondary px-2.5 py-1 d-none d-sm-inline" style={{ fontSize: '11px' }}>
                          {feat.badge}
                        </Badge>
                      )}
                    </div>

                    <h6 className="fw-bold text-navy-dark mb-1.5" style={{ fontSize: '14.5px' }}>
                      {feat.title}
                    </h6>
                    <p className="text-muted small mb-0 d-none d-md-block" style={{ fontSize: '12px', lineHeight: '1.5' }}>
                      {feat.desc}
                    </p>
                  </div>

                  <div className="d-flex align-items-center gap-1 text-primary fw-bold mt-3 pt-2 border-top border-slate-100" style={{ fontSize: '12.5px' }}>
                    <span>Vào học</span>
                    <ChevronRight size={14} />
                  </div>
                </div>
              </Col>
            );
          })}
        </Row>
      </div>

      {/* ── 4. 25 LESSON DIRECTORY (REFINED RESPONSIVE AUTO-FIT GRID) ── */}
      <div className="app-surface-card p-3.5 p-md-4 mb-4" style={{ width: '100%', maxWidth: '100%', overflow: 'hidden' }}>
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2.5 mb-3.5">
          <div>
            <h5 className="fw-black text-navy-dark mb-1" style={{ fontSize: '1.2rem' }}>
              25 Bài Học Minna no Nihongo N5
            </h5>
            <small className="text-muted">Chọn bài học để bắt đầu học từ vựng, flashcard hoặc làm bài thi</small>
          </div>

          <div className="position-relative flex-grow-1 flex-sm-grow-0" style={{ maxWidth: '280px', width: '100%' }}>
            <Input
              type="text"
              placeholder="Tìm theo số bài, chủ đề..."
              value={lessonSearch}
              onChange={(e) => setLessonSearch(e.target.value)}
              className="form-control-sm rounded-pill pe-4"
              style={{ fontSize: '12.5px', background: '#f8fafc', height: '36px' }}
            />
            <Search size={14} className="position-absolute top-50 end-0 translate-middle-y me-3 text-muted" />
          </div>
        </div>

        {/* Bundle Filter Tabs */}
        <div className="home-lesson-bundle-tabs mb-3">
          {[
            { id: 'all', label: 'Tất cả 25 bài' },
            { id: 'b1_5', label: 'Bài 1–5' },
            { id: 'b6_10', label: 'Bài 6–10' },
            { id: 'b11_15', label: 'Bài 11–15' },
            { id: 'b16_20', label: 'Bài 16–20' },
            { id: 'b21_25', label: 'Bài 21–25' }
          ].map(b => (
            <button
              key={b.id}
              type="button"
              className={`home-lesson-bundle-pill ${lessonBundle === b.id ? 'is-active' : ''}`}
              onClick={() => {
                sounds.playFlip?.();
                setLessonBundle(b.id);
              }}
            >
              {b.label}
            </button>
          ))}
        </div>

        {/* ── MOBILE VIEW: SLEEK COMPACT MICRO-CARDS (d-md-none) ── */}
        <div className="d-flex flex-column gap-2 d-md-none">
          {filteredLessons.map((l) => (
            <div
              key={l.id}
              onClick={() => {
                sounds.playFlip?.();
                if (onSelectLesson) onSelectLesson(l.lesson_number);
                onNavigate('lessons');
              }}
              className="home-lesson-micro-card"
            >
              <div className="d-flex align-items-center gap-2.5 min-w-0">
                <span
                  className="badge rounded-pill fw-bold text-white flex-shrink-0"
                  style={{
                    background: 'linear-gradient(135deg, #1e3a8a, #2563eb)',
                    fontSize: '11px',
                    padding: '4px 8px'
                  }}
                >
                  Bài {l.lesson_number < 10 ? `0${l.lesson_number}` : l.lesson_number}
                </span>
                <div
                  className="fw-bold text-navy-dark text-truncate"
                  style={{ fontSize: '12.5px' }}
                >
                  {l.title}
                </div>
              </div>

              <div className="d-flex align-items-center gap-1.5 flex-shrink-0">
                <span className="badge bg-light text-secondary border rounded-pill px-2 py-0.5" style={{ fontSize: '10.5px' }}>
                  {l.vocab_count} từ
                </span>
                <ChevronRight size={15} className="text-primary" />
              </div>
            </div>
          ))}
        </div>

        {/* ── DESKTOP VIEW: LUXURY RESPONSIVE GRID (d-none d-md-grid) ── */}
        <div
          className="d-none d-md-grid"
          style={{
            gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 260px), 1fr))',
            gap: '14px',
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
              className="p-3 rounded-3 border bg-white hover-shadow transition-all cursor-pointer d-flex flex-column justify-content-between"
              style={{
                cursor: 'pointer',
                borderColor: '#e2e8f0',
                transition: 'all 0.18s ease',
                minHeight: '116px'
              }}
            >
              <div>
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span
                    className="badge rounded-pill fw-bold px-2.5 py-1 text-white"
                    style={{
                      background: 'linear-gradient(135deg, #1e3a8a, #2563eb)',
                      fontSize: '11px'
                    }}
                  >
                    第{l.lesson_number}課 • Bài {l.lesson_number < 10 ? `0${l.lesson_number}` : l.lesson_number}
                  </span>
                  <span className="badge bg-light text-secondary border px-2 py-0.5 rounded-pill" style={{ fontSize: '11px' }}>
                    {l.vocab_count} từ
                  </span>
                </div>

                {/* Lesson Title with clean 2-line clamp and word break */}
                <div
                  className="fw-bold text-navy-dark"
                  title={l.title}
                  style={{
                    fontSize: '13px',
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

              <div className="d-flex align-items-center justify-content-between pt-2.5 mt-2.5 border-top border-slate-100 text-primary small fw-semibold" style={{ fontSize: '11.5px' }}>
                <span>Vào học bài</span>
                <ChevronRight size={14} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
