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
  ArrowRight,
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
  const { user, guestProgress } = useApp();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, [user, guestProgress]);

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
    <Container className="py-3 py-md-4">
      {/* 1. Header Banner */}
      <div className="bg-white p-4 rounded-4 shadow-sm border mb-4">
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
          <div className="d-flex align-items-center gap-3">
            <div
              className="d-flex align-items-center justify-content-center rounded-3 shadow-sm text-white"
              style={{
                width: '52px',
                height: '52px',
                background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)'
              }}
            >
              <BarChart2 size={28} />
            </div>
            <div>
              <h4 className="fw-bold mb-1 text-navy-dark">Bảng Theo Dõi Tiến Độ Học Tập N5</h4>
              <p className="text-muted small mb-0">
                Thống kê chi tiết mức độ ghi nhớ 1,589 từ vựng qua từng bài học Minna no Nihongo
              </p>
            </div>
          </div>

          <div>
            {!user ? (
              <Badge color="light" pill className="border px-3 py-2 text-secondary d-flex align-items-center gap-1">
                <ShieldCheck size={14} className="text-success" /> Dữ liệu lưu cục bộ (Khách)
              </Badge>
            ) : (
              <Badge color="success" pill className="px-3 py-2 d-flex align-items-center gap-1">
                <Sparkles size={14} /> Đã đồng bộ PostgreSQL ({user.username})
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* 2. Top KPI Overview Cards */}
      <Row className="g-3 mb-4">
        <Col sm={6} lg={3}>
          <Card className="jlpt-card border-0 shadow-sm h-100 rounded-4">
            <CardBody className="p-4 text-center">
              <div className="text-secondary small fw-medium mb-1">Tổng từ vựng N5</div>
              <h2 className="fw-bold text-navy-dark mb-1">{overall.total_vocabularies}</h2>
              <small className="text-muted" style={{ fontSize: '12px' }}>25 Bài Minna no Nihongo</small>
            </CardBody>
          </Card>
        </Col>

        <Col sm={6} lg={3}>
          <Card className="jlpt-card border-0 shadow-sm h-100 rounded-4">
            <CardBody className="p-4 text-center">
              <div className="text-secondary small fw-medium mb-1">Từ đã học</div>
              <h2 className="fw-bold text-primary mb-1">{overall.studied_vocabularies}</h2>
              <small className="text-muted" style={{ fontSize: '12px' }}>
                {Math.round((overall.studied_vocabularies / overall.total_vocabularies) * 100)}% toàn bộ giáo trình
              </small>
            </CardBody>
          </Card>
        </Col>

        <Col sm={6} lg={3}>
          <Card className="jlpt-card border-0 shadow-sm h-100 rounded-4">
            <CardBody className="p-4 text-center">
              <div className="text-secondary small fw-medium mb-1">Đã thuộc nhuần nhuyễn</div>
              <h2 className="fw-bold text-success mb-1">{overall.mastered_count}</h2>
              <small className="text-success fw-semibold" style={{ fontSize: '12px' }}>{overallMasteryPercent}% tỷ lệ thành thạo</small>
            </CardBody>
          </Card>
        </Col>

        <Col sm={6} lg={3}>
          <Card className="jlpt-card border-0 shadow-sm h-100 rounded-4">
            <CardBody className="p-4 text-center">
              <div className="text-secondary small fw-medium mb-1">Cần ôn tập & từ sai</div>
              <h2 className="fw-bold text-danger mb-1">{overall.needs_review_count}</h2>
              <small className="text-danger fw-semibold" style={{ fontSize: '12px' }}>
                {overall.needs_review_count > 0 ? (
                  <a
                    href="#"
                    onClick={(e) => { e.preventDefault(); onNavigate('review'); }}
                    className="text-danger text-decoration-none"
                  >
                    Ôn lại ngay ➔
                  </a>
                ) : (
                  'Chưa có từ sai'
                )}
              </small>
            </CardBody>
          </Card>
        </Col>
      </Row>

      {/* 3. Overall Milestone Progress Bar */}
      <Card className="jlpt-card border-0 shadow-sm p-4 rounded-4 mb-4">
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
      </Card>

      {/* 4. Lesson-by-Lesson Progress Grid */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="fw-bold text-navy-dark mb-0">Tiến độ chi tiết từng bài học (Bài 01 - 25):</h5>
        <span className="text-muted small">Nhấn vào bài để chuyển tới chế độ học</span>
      </div>

      <Row className="g-3">
        {lessons.map((lesson) => {
          const percent = lesson.mastery_percent || 0;
          let statusBadge = (
            <Badge color="light" pill className="border text-muted">
              Chưa học
            </Badge>
          );

          if (percent >= 90) {
            statusBadge = <Badge color="success" pill>Xuất sắc 🏆</Badge>;
          } else if (percent >= 50) {
            statusBadge = <Badge color="primary" pill>Đang tiến bộ 👍</Badge>;
          } else if (lesson.studied_words > 0) {
            statusBadge = <Badge color="warning" pill className="text-dark">Đang học 📖</Badge>;
          }

          return (
            <Col sm={6} lg={4} key={lesson.lesson_number}>
              <Card
                className="jlpt-card border-0 shadow-sm h-100 rounded-3 cursor-pointer hover-shadow"
                onClick={() => {
                  if (onSelectLesson) onSelectLesson(lesson.lesson_number);
                  onNavigate('lessons');
                }}
                style={{ cursor: 'pointer' }}
              >
                <CardBody className="p-3">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="badge rounded-pill bg-primary bg-opacity-10 text-primary fw-bold px-2.5 py-1">
                      Bài {lesson.lesson_number < 10 ? `0${lesson.lesson_number}` : lesson.lesson_number}
                    </span>
                    {statusBadge}
                  </div>

                  <h6 className="fw-bold text-dark mb-1 text-truncate" title={lesson.title}>
                    {lesson.title}
                  </h6>

                  <div className="d-flex justify-content-between align-items-center small text-muted mb-2">
                    <span>
                      {lesson.mastered_words || 0} / {lesson.total_words} từ
                    </span>
                    <span className="fw-bold text-primary">{percent}%</span>
                  </div>

                  <Progress
                    value={percent}
                    color={percent >= 80 ? 'success' : percent >= 40 ? 'primary' : 'warning'}
                    className="rounded-pill"
                    style={{ height: '6px' }}
                  />
                </CardBody>
              </Card>
            </Col>
          );
        })}
      </Row>
    </Container>
  );
};

export default DashboardPage;
