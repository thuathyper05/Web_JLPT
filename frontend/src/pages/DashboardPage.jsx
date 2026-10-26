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
  ShieldCheck
} from 'lucide-react';
import { progressService, lessonService, vocabService } from '../services/api';
import { useApp } from '../context/AppContext';

const DashboardPage = ({ onSelectLesson, onNavigate }) => {
  const { user, guestProgress, progressVersion } = useApp();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, [user, guestProgress, progressVersion]);

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
        const accuracyRate = (totalCorrect + totalWrong) > 0
          ? Math.round((totalCorrect / (totalCorrect + totalWrong)) * 100)
          : (studiedCount > 0 ? Math.round((masteredCount / studiedCount) * 100) : 0);

        setData({
          overall: {
            total_vocabularies: 1589,
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

  return (
    <div className="app-shell" style={{ maxWidth: '1140px' }}>
      {/* ── 1. UNIFIED SYSTEMIC PAGE HEADER ── */}
      <div className="app-page-header">
        <div className="d-flex justify-content-between align-items-start flex-wrap gap-3">
          <div>
            <div className="app-header-tag">
              <BarChart2 size={13} />
              <span>BÁO CÁO TIẾN ĐỘ • THỐNG KÊ HỌC TẬP</span>
            </div>
            <h1 className="app-header-title">
              Bảng Theo Dõi Tiến Độ Học Tập
            </h1>
            <p className="app-header-subtitle">
              Thống kê chi tiết mức độ thành thạo và phản xạ ghi nhớ 1,589 từ vựng qua 25 bài học Minna no Nihongo.
            </p>
          </div>

          <div className="ms-auto">
            {!user ? (
              <span className="badge rounded-pill border px-3 py-2 text-secondary d-flex align-items-center gap-1.5 shadow-xs bg-white" style={{ fontSize: '12px' }}>
                <ShieldCheck size={14} className="text-success" />
                <span>Dữ liệu lưu cục bộ (Khách)</span>
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

      {/* 2. Top KPI Overview Cards */}
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

      {/* 3. Overall Milestone Progress Bar */}
      <div className="app-surface-card p-4 mb-4">
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

      {/* 4. Lesson-by-Lesson Progress Grid */}
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
                className="app-surface-card h-100 p-3.5 cursor-pointer hover-shadow d-flex flex-column justify-content-between"
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
