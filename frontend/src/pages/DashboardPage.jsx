import React, { useState, useEffect } from 'react';
import {
  Container,
  Row,
  Col,
  Card,
  CardBody,
  Progress,
  Badge,
  Spinner,
  Button
} from 'reactstrap';
import {
  BarChart2,
  Award,
  CheckCircle,
  AlertCircle,
  Clock,
  BookOpen,
  TrendingUp,
  Flame,
  Target,
  Sparkles,
  Layers,
  CheckSquare,
  Keyboard,
  ShieldCheck,
  Zap,
  Trophy,
  Star,
  Users
} from 'lucide-react';
import { progressService, lessonService, vocabService, gamificationService } from '../services/api';
import { useApp } from '../context/AppContext';

const DashboardPage = ({ onSelectLesson, onNavigate }) => {
  const { user, guestProgress, progressVersion, gamification } = useApp();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(false);

  useEffect(() => {
    fetchDashboard();
    fetchLeaderboard();
  }, [user, guestProgress, progressVersion]);

  const fetchLeaderboard = async () => {
    setLoadingLeaderboard(true);
    try {
      const res = await gamificationService.getLeaderboard();
      if (res.data?.success && Array.isArray(res.data.leaderboard)) {
        setLeaderboard(res.data.leaderboard);
      }
    } catch (e) {
      console.warn('Leaderboard fetch note:', e.message);
    } finally {
      setLoadingLeaderboard(false);
    }
  };

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      if (user) {
        const res = await progressService.getProgress();
        setData(res.data);
      } else {
        // Build guest dashboard with real calculation
        const [lessonRes, vocabRes] = await Promise.all([
          lessonService.getLessons(),
          vocabService.getVocabularies({})
        ]);

        const allLessons = lessonRes.data;
        const allVocabs = vocabRes.data;

        // Group vocabularies by lesson
        const vocabByLesson = {};
        allVocabs.forEach(v => {
          if (!vocabByLesson[v.lesson_number]) vocabByLesson[v.lesson_number] = [];
          vocabByLesson[v.lesson_number].push(v);
        });

        // Compute per lesson progress
        const computedLessons = allLessons.map((l) => {
          const lVocabs = vocabByLesson[l.lesson_number] || [];
          const totalWords = lVocabs.length || l.vocab_count || 40;
          let studiedWords = 0;
          let masteredWords = 0;
          let needsReviewWords = 0;

          lVocabs.forEach(v => {
            const p = guestProgress[v.id];
            if (p) {
              studiedWords++;
              if (p.status === 'mastered') masteredWords++;
              if (p.status === 'needs_review') needsReviewWords++;
            }
          });

          const masteryPercent = totalWords > 0
            ? Math.round((masteredWords / totalWords) * 100 * 10) / 10
            : 0;

          return {
            lesson_number: l.lesson_number,
            title: l.title,
            total_words: totalWords,
            studied_words: studiedWords,
            mastered_words: masteredWords,
            needs_review_words: needsReviewWords,
            mastery_percent: masteryPercent
          };
        });

        const studiedCount = Object.keys(guestProgress).length;
        const masteredCount = Object.values(guestProgress).filter(p => p.status === 'mastered').length;
        const needsReviewCount = Object.values(guestProgress).filter(p => p.status === 'needs_review').length;
        const totalCorrect = Object.values(guestProgress).reduce((acc, curr) => acc + (curr.correct_count || 0), 0);
        const totalWrong = Object.values(guestProgress).reduce((acc, curr) => acc + (curr.wrong_count || 0), 0);
        const totalAnswers = totalCorrect + totalWrong;
        const accuracyRate = totalAnswers > 0 ? Math.round((totalCorrect / totalAnswers) * 100) : 0;

        setData({
          overall: {
            total_vocabularies: allVocabs.length || 1589,
            studied_vocabularies: studiedCount,
            mastered_count: masteredCount,
            needs_review_count: needsReviewCount,
            accuracy_rate: accuracyRate
          },
          lessons: computedLessons,
          recent_sessions: []
        });
      }
    } catch (err) {
      console.error('Error fetching dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container className="text-center py-5">
        <Spinner color="primary" />
        <p className="mt-2 text-muted">Đang phân tích tiến độ học tập toàn diện...</p>
      </Container>
    );
  }

  const { overall, lessons } = data;
  const overallMasteryPercent = overall.total_vocabularies > 0
    ? Math.round((overall.mastered_count / overall.total_vocabularies) * 100)
    : 0;

  // Gamification progress bar calculations
  const totalXp = gamification?.total_xp || 50;
  const nextXp = gamification?.next_tier_xp || 300;
  const minXp = gamification?.min_tier_xp || 0;
  const xpProgressPercent = Math.min(100, Math.max(0, Math.round(((totalXp - minXp) / (nextXp - minXp)) * 100)));

  return (
    <div className="app-shell" style={{ maxWidth: '1140px' }}>
      {/* ── 1. UNIFIED SYSTEMIC PAGE HEADER ── */}
      <div className="app-page-header mb-4">
        <div className="d-flex justify-content-between align-items-start flex-wrap gap-3">
          <div>
            <div className="app-header-tag">
              <BarChart2 size={13} />
              <span>BÁO CÁO TIẾN ĐỘ • GAMIFICATION HUB V2</span>
            </div>
            <h1 className="app-header-title">
              Trung Tâm Tiến Độ & Danh Hiệu Học Tập
            </h1>
            <p className="app-header-subtitle">
              Theo dõi chuỗi ngày kiên trì (Streak), điểm kinh nghiệm (XP), cấp bậc danh hiệu và huy hiệu thử thách.
            </p>
          </div>

          <div className="ms-auto">
            {!user ? (
              <span className="badge rounded-pill border px-3 py-2 text-secondary d-flex align-items-center gap-1.5 shadow-xs bg-white" style={{ fontSize: '12px' }}>
                <ShieldCheck size={14} className="text-success" />
                <span>Tiến độ lưu cục bộ (Khách)</span>
              </span>
            ) : (
              <span className="badge bg-success rounded-pill px-3 py-2 d-flex align-items-center gap-1.5 shadow-xs" style={{ fontSize: '12px' }}>
                <Sparkles size={14} />
                <span>Đã đồng bộ tài khoản ({user.username})</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── 2. GAMIFICATION SHOWCASE (STREAK & XP LEVEL TIER) ── */}
      <Row className="g-3 g-md-4 mb-4">
        {/* Streak Banner */}
        <Col md={6}>
          <div
            className="p-3.5 p-md-4 rounded-4 text-white position-relative overflow-hidden h-100 d-flex flex-column justify-content-between"
            style={{
              background: 'linear-gradient(135deg, #b45309 0%, #d97706 40%, #ef4444 100%)',
              boxShadow: '0 4px 16px rgba(217, 119, 6, 0.25)'
            }}
          >
            <div className="d-flex justify-content-between align-items-start mb-3">
              <div>
                <span className="badge rounded-pill bg-white bg-opacity-25 text-white fw-bold px-2.5 py-1 mb-2" style={{ fontSize: '11px' }}>
                  CHUỖI NGÀY LIÊN TIẾP
                </span>
                <div className="d-flex align-items-baseline gap-2">
                  <span className="fw-black" style={{ fontSize: '2.5rem', lineHeight: 1 }}>
                    {gamification?.current_streak || 1}
                  </span>
                  <span className="fs-5 fw-bold text-white text-opacity-90">ngày học</span>
                </div>
              </div>
              <div
                className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                style={{ width: '52px', height: '52px', background: 'rgba(255, 255, 255, 0.22)', backdropFilter: 'blur(8px)' }}
              >
                <Flame size={28} className="text-white" fill="#ffffff" />
              </div>
            </div>

            <div className="pt-2 border-top border-white border-opacity-20 d-flex justify-content-between align-items-center small text-white text-opacity-90">
              <span>Kỷ lục chuỗi: <strong>{gamification?.longest_streak || 1} ngày</strong></span>
              <span>Khiên bảo vệ: <strong>{gamification?.freeze_streak_count || 1}</strong></span>
            </div>
          </div>
        </Col>

        {/* XP & Level Tier Banner */}
        <Col md={6}>
          <div
            className="p-3.5 p-md-4 rounded-4 text-white position-relative overflow-hidden h-100 d-flex flex-column justify-content-between"
            style={{
              background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 50%, #4f46e5 100%)',
              boxShadow: '0 4px 16px rgba(37, 99, 235, 0.25)'
            }}
          >
            <div className="d-flex justify-content-between align-items-start mb-2.5">
              <div>
                <span className="badge rounded-pill bg-white bg-opacity-20 text-white fw-bold px-2.5 py-1 mb-2" style={{ fontSize: '11px' }}>
                  CẤP BẬC HỌC VIÊN
                </span>
                <h4 className="fw-black mb-0 text-white" style={{ fontSize: '1.4rem' }}>
                  {gamification?.level_tier || 'Mầm non N5'}
                </h4>
              </div>
              <div
                className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                style={{ width: '52px', height: '52px', background: 'rgba(255, 255, 255, 0.18)', backdropFilter: 'blur(8px)' }}
              >
                <Zap size={26} className="text-white" fill="#fde047" />
              </div>
            </div>

            {/* XP Progress Bar */}
            <div>
              <div className="d-flex justify-content-between align-items-center small mb-1 text-white text-opacity-90" style={{ fontSize: '12px' }}>
                <span>{totalXp} XP</span>
                <span>Mục tiêu tiếp: {nextXp} XP ({xpProgressPercent}%)</span>
              </div>
              <Progress
                value={xpProgressPercent}
                className="rounded-pill mb-2"
                style={{ height: '8px', background: 'rgba(255, 255, 255, 0.25)' }}
                barStyle={{ background: 'linear-gradient(90deg, #38bdf8, #facc15)' }}
              />
              <div className="d-flex justify-content-between align-items-center small text-white text-opacity-80" style={{ fontSize: '11px' }}>
                <span>Đá quý tích lũy: <strong>{gamification?.gems_count || 100} Gems</strong></span>
                <span>Học mỗi ngày +15 XP</span>
              </div>
            </div>
          </div>
        </Col>
      </Row>

      {/* ── 3. BADGES & ACHIEVEMENTS SHELF ── */}
      <div className="app-surface-card p-3.5 p-md-4 rounded-4 border bg-white shadow-xs mb-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div className="d-flex align-items-center gap-2">
            <Trophy size={18} className="text-warning" />
            <h6 className="fw-black text-navy-dark mb-0" style={{ fontSize: '15px' }}>
              Bộ Sưu Tập Huy Hiệu Thử Thách
            </h6>
          </div>
          <span className="small text-muted" style={{ fontSize: '12px' }}>
            {Array.isArray(gamification?.badges) ? gamification.badges.filter(b => b.unlocked).length : 1} / 6 Đã mở khóa
          </span>
        </div>

        <Row className="g-2.5 g-md-3">
          {(gamification?.badges || [
            { key: 'first_step', title: 'Bước đầu tiên', desc: 'Hoàn thành bài học tiếng Nhật đầu tiên', unlocked: true },
            { key: 'streak_3', title: 'Giữ lửa 3 ngày', desc: 'Học liên tục 3 ngày không nghỉ', unlocked: (gamification?.current_streak >= 3) },
            { key: 'streak_7', title: 'Chiến binh 7 ngày', desc: 'Duy trì chuỗi học tập trọn vẹn 1 tuần', unlocked: (gamification?.current_streak >= 7) },
            { key: 'streak_30', title: 'Kiên trì 30 ngày', desc: 'Thói quen vàng: 30 ngày liên tiếp', unlocked: (gamification?.current_streak >= 30) },
            { key: 'speed_demon', title: 'Phản xạ Thần tốc', desc: 'Ghép cặp nối từ 10/10 dưới 40 giây', unlocked: false },
            { key: 'kanji_explorer', title: 'Thám hiểm Chữ Hán', desc: 'Học và ghi nhớ 20 Kanji căn bản', unlocked: false }
          ]).map((b, idx) => (
            <Col xs={6} md={4} lg={2} key={b.key || idx}>
              <div
                className={`p-2.5 rounded-3 border text-center h-100 d-flex flex-column align-items-center justify-content-center transition-all ${
                  b.unlocked ? 'bg-amber-50 border-amber-200' : 'bg-slate-50 border-slate-200 opacity-60'
                }`}
                style={{
                  background: b.unlocked ? '#fffbeb' : '#f8fafc',
                  borderColor: b.unlocked ? '#fde68a' : '#e2e8f0',
                  minHeight: '105px'
                }}
                title={b.desc}
              >
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center mb-1.5"
                  style={{
                    width: '36px',
                    height: '36px',
                    background: b.unlocked ? '#fef3c7' : '#e2e8f0',
                    color: b.unlocked ? '#d97706' : '#94a3b8'
                  }}
                >
                  <Award size={18} />
                </div>
                <div className="fw-bold text-navy-dark text-truncate w-100" style={{ fontSize: '11.5px' }}>
                  {b.title}
                </div>
                <span className="small text-muted mt-0.5" style={{ fontSize: '10px' }}>
                  {b.unlocked ? 'Đạt được' : 'Chưa mở'}
                </span>
              </div>
            </Col>
          ))}
        </Row>
      </div>

      {/* ── 4. TOP KPI OVERVIEW CARDS ── */}
      <Row className="g-3 g-md-4 mb-4">
        <Col sm={6} lg={3}>
          <div className="app-metric-card h-100 p-3.5 text-center">
            <div className="app-metric-label mb-1">Tổng từ vựng N5</div>
            <div className="app-metric-value text-navy-dark mb-1">{overall.total_vocabularies}</div>
            <small className="text-muted" style={{ fontSize: '12px' }}>25 Bài Minna no Nihongo</small>
          </div>
        </Col>

        <Col sm={6} lg={3}>
          <div className="app-metric-card h-100 p-3.5 text-center">
            <div className="app-metric-label mb-1">Từ đã học</div>
            <div className="app-metric-value text-primary mb-1">{overall.studied_vocabularies}</div>
            <small className="text-muted" style={{ fontSize: '12px' }}>
              {Math.round((overall.studied_vocabularies / overall.total_vocabularies) * 100)}% toàn bộ giáo trình
            </small>
          </div>
        </Col>

        <Col sm={6} lg={3}>
          <div className="app-metric-card h-100 p-3.5 text-center">
            <div className="app-metric-label mb-1">Đã Thành Thạo</div>
            <div className="app-metric-value text-success mb-1">{overall.mastered_count}</div>
            <small className="text-success fw-semibold" style={{ fontSize: '12px' }}>{overallMasteryPercent}% tỷ lệ thành thạo</small>
          </div>
        </Col>

        <Col sm={6} lg={3}>
          <div className="app-metric-card h-100 p-3.5 text-center">
            <div className="app-metric-label mb-1">Cần ôn tập & từ sai</div>
            <div className="app-metric-value text-danger mb-1">{overall.needs_review_count}</div>
            <small className="text-danger fw-semibold" style={{ fontSize: '12px' }}>
              {overall.needs_review_count > 0 ? (
                <a
                  href="#"
                  onClick={(e) => { e.preventDefault(); onNavigate('review'); }}
                  className="text-danger text-decoration-none fw-bold"
                >
                  Ôn lại ngay
                </a>
              ) : (
                'Chưa có từ sai'
              )}
            </small>
          </div>
        </Col>
      </Row>

      {/* ── 5. LEADERBOARD PREVIEW (BẢNG VÀNG HỌC VIÊN) ── */}
      {leaderboard.length > 0 && (
        <div className="app-surface-card p-3.5 p-md-4 rounded-4 border bg-white shadow-xs mb-4">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div className="d-flex align-items-center gap-2">
              <Users size={18} className="text-primary" />
              <h6 className="fw-black text-navy-dark mb-0" style={{ fontSize: '15px' }}>
                Bảng Vàng Học Viên Chăm Chỉ Nhất
              </h6>
            </div>
            <span className="small text-muted" style={{ fontSize: '12px' }}>Cập nhật tự động</span>
          </div>

          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0" style={{ fontSize: '13px' }}>
              <thead>
                <tr className="text-muted small border-bottom">
                  <th style={{ width: '60px' }}>Hạng</th>
                  <th>Học viên</th>
                  <th>Danh hiệu</th>
                  <th className="text-center">Chuỗi</th>
                  <th className="text-end">Tổng XP</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.slice(0, 5).map((lUser) => (
                  <tr key={lUser.id}>
                    <td>
                      <span
                        className={`badge rounded-pill fw-bold ${
                          lUser.rank === 1 ? 'bg-warning text-dark' : lUser.rank === 2 ? 'bg-secondary text-white' : lUser.rank === 3 ? 'bg-danger text-white' : 'bg-light text-secondary border'
                        }`}
                        style={{ fontSize: '11px', minWidth: '24px' }}
                      >
                        #{lUser.rank}
                      </span>
                    </td>
                    <td className="fw-bold text-navy-dark">
                      {lUser.name}
                    </td>
                    <td>
                      <span className="badge bg-light text-secondary border rounded-pill px-2 py-0.5" style={{ fontSize: '11px' }}>
                        {lUser.level_tier}
                      </span>
                    </td>
                    <td className="text-center">
                      <span className="d-inline-flex align-items-center gap-1 text-warning fw-bold">
                        <Flame size={13} fill="#f59e0b" />
                        <span>{lUser.current_streak}d</span>
                      </span>
                    </td>
                    <td className="text-end fw-black text-primary">
                      {lUser.total_xp} XP
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── 6. OVERALL MILESTONE PROGRESS BAR ── */}
      <div className="app-surface-card p-4 mb-4 rounded-4 border bg-white shadow-xs">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <div className="d-flex align-items-center gap-2">
            <Target size={20} className="text-primary" />
            <h6 className="fw-bold mb-0 text-navy-dark">Tiến Độ Chinh Phục Cấp Độ JLPT N5</h6>
          </div>
          <span className="fw-bold fs-5 text-primary">{overallMasteryPercent}%</span>
        </div>

        <Progress
          value={overallMasteryPercent}
          color="success"
          className="mb-3 rounded-pill"
          style={{ height: '12px' }}
        />

        <div className="d-flex justify-content-between text-muted small px-1">
          <span>Khởi động (0%)</span>
          <span>Nửa chặng đường (50%)</span>
          <span>Sẵn sàng thi JLPT N5 (100%)</span>
        </div>
      </div>

      {/* ── 7. LESSON-BY-LESSON PROGRESS GRID ── */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="fw-bold text-navy-dark mb-0">Tiến độ chi tiết từng bài học (Bài 01 - 25):</h5>
        <span className="text-muted small">Nhấn vào bài để chuyển tới chế độ học</span>
      </div>

      <Row className="g-3 g-md-4">
        {lessons.map((lesson) => {
          const percent = lesson.mastery_percent || 0;
          let statusBadge = (
            <span className="badge rounded-pill bg-light text-muted border" style={{ fontSize: '11px' }}>
              Chưa học
            </span>
          );

          if (percent >= 90) {
            statusBadge = <span className="badge rounded-pill bg-success text-white" style={{ fontSize: '11px' }}>Xuất Sắc</span>;
          } else if (percent >= 50) {
            statusBadge = <span className="badge rounded-pill bg-primary text-white" style={{ fontSize: '11px' }}>Đang Tiến Bộ</span>;
          } else if (lesson.studied_words > 0) {
            statusBadge = <span className="badge rounded-pill bg-warning text-dark" style={{ fontSize: '11px' }}>Đang Rèn Luyện</span>;
          }

          return (
            <Col sm={6} lg={4} key={lesson.lesson_number}>
              <div
                className="app-surface-card h-100 p-3.5 cursor-pointer hover-shadow d-flex flex-column justify-content-between rounded-4 border bg-white shadow-xs"
                onClick={() => {
                  if (onSelectLesson) onSelectLesson(lesson.lesson_number);
                  onNavigate('lessons');
                }}
                style={{ cursor: 'pointer' }}
              >
                <div>
                  <div className="d-flex justify-content-between align-items-center mb-2.5">
                    <span className="badge rounded-pill bg-primary bg-opacity-10 text-primary fw-bold px-2.5 py-1" style={{ fontSize: '11.5px' }}>
                      Bài {lesson.lesson_number < 10 ? `0${lesson.lesson_number}` : lesson.lesson_number}
                    </span>
                    {statusBadge}
                  </div>

                  <h6 className="fw-bold text-dark mb-1.5 text-truncate" title={lesson.title} style={{ fontSize: '14px' }}>
                    {lesson.title}
                  </h6>
                </div>

                <div className="mt-2.5 pt-2 border-top border-slate-100">
                  <div className="d-flex justify-content-between align-items-center small text-muted mb-1.5">
                    <span style={{ fontSize: '11.5px' }}>
                      {lesson.mastered_words || 0} / {lesson.total_words} từ
                    </span>
                    <span className="fw-bold text-primary" style={{ fontSize: '12px' }}>{percent}%</span>
                  </div>

                  <Progress
                    value={percent}
                    color={percent >= 80 ? 'success' : percent >= 40 ? 'primary' : 'warning'}
                    className="rounded-pill"
                    style={{ height: '6px' }}
                  />
                </div>
              </div>
            </Col>
          );
        })}
      </Row>
    </div>
  );
};

export default DashboardPage;
