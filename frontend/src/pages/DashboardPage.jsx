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
  Target
} from 'lucide-react';
import { progressService, lessonService } from '../services/api';
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
        // Build guest dashboard
        const lessonRes = await lessonService.getLessons();
        const allLessons = lessonRes.data;

        // Count per-lesson progress from guestProgress
        const lessonProgress = allLessons.map((l) => {
          let lMastered = 0;
          let lReview = 0;
          let lStudied = 0;

          return {
            lesson_number: l.lesson_number,
            title: l.title,
            total_words: l.vocab_count,
            mastery_percent: 0
          };
        });

        const studiedCount = Object.keys(guestProgress).length;
        const masteredCount = Object.values(guestProgress).filter(p => p.status === 'mastered').length;
        const needsReviewCount = Object.values(guestProgress).filter(p => p.status === 'needs_review' || p.wrong_count > 0).length;

        setData({
          overall: {
            total_vocabularies: 1589,
            studied_vocabularies: studiedCount,
            mastered_count: masteredCount,
            needs_review_count: needsReviewCount,
            accuracy_rate: studiedCount > 0 ? Math.round((masteredCount / studiedCount) * 100) : 0
          },
          lessons: allLessons.map(l => ({
            lesson_number: l.lesson_number,
            title: l.title,
            total_words: l.vocab_count,
            mastery_percent: 0
          })),
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
        <p className="mt-2 text-muted">Đang tính toán tiến độ học tập...</p>
      </Container>
    );
  }

  const { overall, lessons, recent_sessions } = data;

  return (
    <Container className="py-3 py-md-4">
      {/* Header Banner */}
      <div className="bg-white p-4 rounded-4 shadow-sm border mb-4">
        <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
          <div className="d-flex align-items-center gap-3">
            <div
              className="d-flex align-items-center justify-content-center rounded-circle"
              style={{
                width: '54px',
                height: '54px',
                background: 'linear-gradient(135deg, #1e3a8a, #3b82f6)',
                color: 'white'
              }}
            >
              <BarChart2 size={28} />
            </div>
            <div>
              <h4 className="fw-bold mb-1 text-navy-dark">Bảng Theo Dõi Tiến Độ JLPT N5</h4>
              <p className="text-muted small mb-0">
                {user ? (
                  <span>Đồng bộ thời gian thực với tài khoản <strong>{user.username}</strong> trên PostgreSQL</span>
                ) : (
                  <span>Chế độ tự do (Dữ liệu học tập đang lưu trên LocalStorage của máy bạn)</span>
                )}
              </p>
            </div>
          </div>
          {!user && (
            <Badge color="warning" className="text-dark p-2 px-3 fw-bold rounded-pill">
              💡 Đăng nhập để lưu tiến độ vĩnh viễn trên Cloud
            </Badge>
          )}
        </div>
      </div>

      {/* Progress Highlight Cards */}
      <Row className="g-3 mb-4">
        <Col sm={6} md={3}>
          <Card className="jlpt-card border-0 shadow-sm p-3">
            <div className="d-flex justify-content-between align-items-center text-muted small fw-semibold mb-1">
              <span>Đã học tiếp cận</span>
              <BookOpen size={16} className="text-primary" />
            </div>
            <div className="fs-3 fw-bold text-navy-dark">
              {overall.studied_vocabularies} <span className="fs-6 text-muted fw-normal">/ {overall.total_vocabularies}</span>
            </div>
            <Progress
              value={(overall.studied_vocabularies / overall.total_vocabularies) * 100}
              color="primary"
              className="mt-2"
              style={{ height: '5px' }}
            />
          </Card>
        </Col>

        <Col sm={6} md={3}>
          <Card className="jlpt-card border-0 shadow-sm p-3">
            <div className="d-flex justify-content-between align-items-center text-muted small fw-semibold mb-1">
              <span>Đã thuộc vững</span>
              <CheckCircle size={16} className="text-success" />
            </div>
            <div className="fs-3 fw-bold text-success">
              {overall.mastered_count} <span className="fs-6 text-muted fw-normal">từ</span>
            </div>
            <div className="small text-muted mt-2">
              Tỷ lệ nhớ: {overall.studied_vocabularies > 0 ? Math.round((overall.mastered_count / overall.studied_vocabularies) * 100) : 0}%
            </div>
          </Card>
        </Col>

        <Col sm={6} md={3}>
          <Card className="jlpt-card border-0 shadow-sm p-3">
            <div className="d-flex justify-content-between align-items-center text-muted small fw-semibold mb-1">
              <span>Từ cần ôn lại</span>
              <Flame size={16} className="text-danger" />
            </div>
            <div className="fs-3 fw-bold text-danger">
              {overall.needs_review_count} <span className="fs-6 text-muted fw-normal">từ</span>
            </div>
            <div className="small text-muted mt-2">
              Có sẵn trong mục Ôn tập sai
            </div>
          </Card>
        </Col>

        <Col sm={6} md={3}>
          <Card className="jlpt-card border-0 shadow-sm p-3">
            <div className="d-flex justify-content-between align-items-center text-muted small fw-semibold mb-1">
              <span>Độ chính xác</span>
              <Target size={16} className="text-warning" />
            </div>
            <div className="fs-3 fw-bold text-warning">
              {overall.accuracy_rate}%
            </div>
            <div className="small text-muted mt-2">
              Đánh giá từ bài kiểm tra
            </div>
          </Card>
        </Col>
      </Row>

      {/* Per-Lesson Progress Breakdown */}
      <h5 className="fw-bold mb-3 text-navy-dark">Tiến độ chi tiết từng bài (25 Bài Minna no Nihongo)</h5>
      <Card className="jlpt-card border-0 shadow-sm mb-4">
        <CardBody className="p-3">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th style={{ width: '80px' }}>Bài số</th>
                  <th>Chủ đề bài học</th>
                  <th style={{ width: '120px' }}>Số từ vựng</th>
                  <th style={{ width: '220px' }}>Mức độ thuộc</th>
                  <th style={{ width: '110px' }} className="text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {lessons.map((lesson) => {
                  const percent = parseFloat(lesson.mastery_percent || 0);
                  return (
                    <tr key={lesson.lesson_number}>
                      <td>
                        <Badge color="primary" pill className="px-2 py-1">
                          Bài {lesson.lesson_number < 10 ? `0${lesson.lesson_number}` : lesson.lesson_number}
                        </Badge>
                      </td>
                      <td className="fw-semibold text-dark">
                        {lesson.title}
                      </td>
                      <td className="text-muted small">
                        {lesson.total_words} từ
                      </td>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <Progress
                            value={percent}
                            color={percent >= 80 ? 'success' : (percent >= 50 ? 'primary' : 'warning')}
                            style={{ height: '8px', flex: 1, borderRadius: '4px' }}
                          />
                          <span className="small fw-bold text-muted" style={{ width: '45px' }}>
                            {percent}%
                          </span>
                        </div>
                      </td>
                      <td className="text-center">
                        <Button
                          color="light"
                          size="sm"
                          className="px-3 py-1 text-primary fw-bold rounded-pill"
                          onClick={() => {
                            if (onSelectLesson) onSelectLesson(lesson.lesson_number);
                            onNavigate('lessons');
                          }}
                        >
                          Vào học
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>

      {/* Recent Study Sessions */}
      {recent_sessions && recent_sessions.length > 0 && (
        <>
          <h5 className="fw-bold mb-3 text-navy-dark">Lịch sử bài kiểm tra gần đây</h5>
          <Card className="jlpt-card border-0 shadow-sm">
            <CardBody className="p-3">
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0 small">
                  <thead className="table-light">
                    <tr>
                      <th>Thời gian</th>
                      <th>Hình thức</th>
                      <th>Phạm vi</th>
                      <th>Số câu đúng</th>
                      <th>Điểm số</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recent_sessions.map((sess) => (
                      <tr key={sess.id}>
                        <td>{new Date(sess.created_at).toLocaleString('vi-VN')}</td>
                        <td className="fw-semibold">
                          {sess.session_type === 'quiz' ? 'Trắc nghiệm' : sess.session_type}
                        </td>
                        <td>{sess.lesson_number ? `Bài ${sess.lesson_number}` : 'Toàn bộ N5'}</td>
                        <td className="text-success fw-bold">
                          {sess.correct_answers} / {sess.total_questions} câu
                        </td>
                        <td>
                          <Badge color={sess.score_percentage >= 80 ? 'success' : (sess.score_percentage >= 60 ? 'primary' : 'danger')}>
                            {sess.score_percentage}%
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardBody>
          </Card>
        </>
      )}
    </Container>
  );
};

export default DashboardPage;
