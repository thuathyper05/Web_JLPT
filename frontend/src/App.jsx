import React, { useState, useEffect } from 'react';
import NavbarComponent from './components/NavbarComponent';
import SearchModal from './components/SearchModal';
import HomePage from './pages/HomePage';
import LessonStudyPage from './pages/LessonStudyPage';
import FlashcardPage from './pages/FlashcardPage';
import QuizPage from './pages/QuizPage';
import PracticeInputPage from './pages/PracticeInputPage';
import ReviewWrongPage from './pages/ReviewWrongPage';
import FavoritesPage from './pages/FavoritesPage';
import NotesPage from './pages/NotesPage';
import DashboardPage from './pages/DashboardPage';
import KanjiPage from './pages/KanjiPage';
import AdminPage from './pages/AdminPage';
import Logo from './components/Logo';
import { authService } from './services/api';
import {
  BookOpen,
  PenTool,
  Layers,
  CheckSquare,
  Keyboard,
  RefreshCw,
  Star,
  FileText,
  BarChart2,
  ShieldCheck,
  Sparkles,
  ExternalLink,
  ShieldAlert
} from 'lucide-react';

class AdminErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error('AdminPage error caught by ErrorBoundary:', error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-vh-100 d-flex align-items-center justify-content-center p-4 text-center" style={{ background: '#0b1120', color: '#fff' }}>
          <div style={{ maxWidth: '480px' }}>
            <div className="p-3 rounded-circle bg-danger bg-opacity-20 text-danger d-inline-flex mb-3">
              <ShieldAlert size={36} />
            </div>
            <h4 className="fw-bold mb-2">Đã xảy ra sự cố khi tải trang Quản trị</h4>
            <p className="text-secondary small mb-4" style={{ fontSize: '13px' }}>
              {this.state.error?.message || 'Có lỗi hệ thống trong quá trình hiển thị dữ liệu.'}
            </p>
            <div className="d-flex justify-content-center gap-2">
              <button
                className="btn btn-outline-light rounded-pill px-3 py-1.5 small"
                onClick={() => {
                  localStorage.removeItem('hyper_admin_token');
                  localStorage.removeItem('hyper_admin_user');
                  window.location.reload();
                }}
              >
                Xóa Cache Admin & Tải lại
              </button>
              <button
                className="btn btn-primary rounded-pill px-4 py-1.5 small fw-bold"
                onClick={() => {
                  this.setState({ hasError: false, error: null });
                  this.props.onBackToApp();
                }}
              >
                ← Quay lại trang học tập
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function App() {
  const checkIsAdmin = () => {
    if (typeof window === 'undefined') return false;
    return (
      window.location.pathname === '/admin' ||
      window.location.pathname.startsWith('/admin') ||
      window.location.search.includes('tab=admin') ||
      window.location.search.includes('admin') ||
      window.location.hash.includes('admin')
    );
  };

  const [isAdminRoute, setIsAdminRoute] = useState(checkIsAdmin);

  const [activeTab, setActiveTab] = useState('home');
  const [selectedLesson, setSelectedLesson] = useState(1);
  const [currentLevel, setCurrentLevel] = useState('N5');
  const [searchModalOpen, setSearchModalOpen] = useState(false);

  useEffect(() => {
    const handlePopState = () => {
      setIsAdminRoute(checkIsAdmin());
    };
    window.addEventListener('popstate', handlePopState);
    window.addEventListener('hashchange', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('hashchange', handlePopState);
    };
  }, []);

  // Catch OAuth redirect access tokens (e.g., from mobile Facebook or Google redirects)
  useEffect(() => {
    if (window.location.hash && window.location.hash.includes('access_token=')) {
      const params = new URLSearchParams(window.location.hash.substring(1));
      const accessToken = params.get('access_token');
      if (accessToken) {
        window.history.replaceState(null, '', window.location.pathname);
        fetch(`https://graph.facebook.com/me?fields=id,name,email,picture.type(large)&access_token=${accessToken}`)
          .then((r) => r.json())
          .then(async (fbUser) => {
            if (fbUser.id) {
              const res = await authService.facebookLogin({
                accessToken,
                userID: fbUser.id,
                userInfo: {
                  id: fbUser.id,
                  name: fbUser.name,
                  email: fbUser.email,
                  picture: fbUser.picture?.data?.url
                }
              });
              if (res.data?.token) {
                localStorage.setItem('jlpt_token', res.data.token);
                window.location.reload();
              }
            }
          })
          .catch((err) => console.error('OAuth hash token error:', err));
      }
    }
  }, []);

  const handleSelectLesson = (lessonNum) => {
    setSelectedLesson(lessonNum);
  };

  const handleChangeLevel = (lvl) => {
    setCurrentLevel(lvl);
  };

  const handleTabChange = (tab) => {
    if (tab === 'admin') {
      window.history.pushState({}, '', '/?tab=admin');
      setIsAdminRoute(true);
    } else {
      if (isAdminRoute) {
        setIsAdminRoute(false);
      }
      setActiveTab(tab);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return (
          <HomePage
            onNavigate={handleTabChange}
            onSelectLesson={handleSelectLesson}
            currentLevel={currentLevel}
          />
        );
      case 'lessons':
        return (
          <LessonStudyPage
            selectedLesson={selectedLesson}
            onSelectLesson={handleSelectLesson}
            onNavigate={handleTabChange}
          />
        );
      case 'kanji':
        return <KanjiPage currentLevel={currentLevel} />;
      case 'flashcard':
        return (
          <FlashcardPage
            initialLesson={selectedLesson}
            onNavigate={handleTabChange}
            onSelectLesson={handleSelectLesson}
          />
        );
      case 'quiz':
        return (
          <QuizPage
            initialLesson={selectedLesson}
            onNavigate={handleTabChange}
          />
        );
      case 'practice':
        return (
          <PracticeInputPage
            initialLesson={selectedLesson}
            onNavigate={handleTabChange}
            onSelectLesson={handleSelectLesson}
          />
        );
      case 'review':
        return <ReviewWrongPage onNavigate={handleTabChange} />;
      case 'favorites':
        return (
          <FavoritesPage
            onNavigate={handleTabChange}
            onSelectLesson={handleSelectLesson}
          />
        );
      case 'notes':
        return (
          <NotesPage
            onNavigate={handleTabChange}
            onSelectLesson={handleSelectLesson}
          />
        );
      case 'dashboard':
        return (
          <DashboardPage
            onSelectLesson={handleSelectLesson}
            onNavigate={handleTabChange}
          />
        );
      default:
        return (
          <HomePage
            onNavigate={handleTabChange}
            onSelectLesson={handleSelectLesson}
            currentLevel={currentLevel}
          />
        );
    }
  };

  if (isAdminRoute) {
    const handleBack = () => {
      window.history.pushState({}, '', '/');
      setIsAdminRoute(false);
      setActiveTab('home');
    };

    return (
      <AdminErrorBoundary onBackToApp={handleBack}>
        <AdminPage onBackToApp={handleBack} />
      </AdminErrorBoundary>
    );
  }

  return (
    <div className="d-flex flex-column min-vh-100" style={{ backgroundColor: 'var(--app-bg)' }}>
      {/* ── Sticky Navigation Bar ── */}
      <NavbarComponent
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        onOpenSearch={() => setSearchModalOpen(true)}
        currentLevel={currentLevel}
        onChangeLevel={handleChangeLevel}
      />

      {/* ── Global Search Modal ── */}
      <SearchModal
        isOpen={searchModalOpen}
        toggle={() => setSearchModalOpen(!searchModalOpen)}
        onSelectLesson={(lessonNum) => {
          setSelectedLesson(lessonNum);
          handleTabChange('lessons');
        }}
      />

      {/* ── Main Content Area with Smooth Page Transition ── */}
      <main className="flex-grow-1 page-transition" key={activeTab}>
        {renderContent()}
      </main>

      {/* ── Commercial High-End Footer (Desktop & Tablet) ── */}
      <footer
        className="mt-5 pt-5 pb-4 d-none d-lg-block"
        style={{
          background: 'linear-gradient(180deg, #091224 0%, #060c18 100%)',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          color: '#f8fafc'
        }}
      >
        <div className="container">
          <div className="row g-4 pb-4" style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
            {/* Col 1: Brand & Philosophy */}
            <div className="col-lg-4">
              <div className="mb-3">
                <Logo size={36} light={false} />
              </div>
              <p className="small mb-3" style={{ color: '#94a3b8', maxWidth: '340px', lineHeight: '1.65' }}>
                Hệ thống đào tạo và ôn tập tiếng Nhật thông minh theo chuẩn Minna no Nihongo N5.
                Cung cấp lộ trình học tập khoa học qua phát âm Tokyo chuẩn, Flashcard 3D và bài thi trắc nghiệm áp lực thực tế.
              </p>
              <div
                className="d-inline-flex align-items-center gap-2 px-3 py-1.5 rounded-pill small"
                style={{
                  background: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  color: '#e2e8f0',
                  fontSize: '12px'
                }}
              >
                <ShieldCheck size={14} className="text-success" />
                <span>Giáo trình Minna no Nihongo N5 chuẩn 25 bài</span>
              </div>
            </div>

            {/* Col 2: Core Learning Tracks */}
            <div className="col-lg-3 col-md-4">
              <h6
                className="fw-bold text-uppercase tracking-wider small mb-3"
                style={{ color: '#f8fafc', fontSize: '12px', letterSpacing: '0.06em' }}
              >
                Phương Pháp Học Tập
              </h6>
              <ul className="list-unstyled small d-flex flex-column gap-2 mb-0">
                {[
                  { id: 'lessons', label: '25 Bài học Minna', icon: BookOpen, color: '#3b82f6' },
                  { id: 'kanji', label: 'Chữ Hán Kanji N5', icon: PenTool, color: '#38bdf8' },
                  { id: 'flashcard', label: 'Thẻ nhớ Flashcard 3D', icon: Layers, color: '#10b981' },
                  { id: 'quiz', label: 'Trắc nghiệm JLPT ABCD', icon: CheckSquare, color: '#ef4444' },
                  { id: 'practice', label: 'Luyện gõ không gợi ý', icon: Keyboard, color: '#f59e0b' }
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <li key={item.id}>
                      <a
                        href="#"
                        onClick={(e) => { e.preventDefault(); setActiveTab(item.id); }}
                        className="text-decoration-none d-inline-flex align-items-center gap-2"
                        style={{ color: '#94a3b8', transition: 'color 0.15s ease' }}
                        onMouseOver={(e) => { e.currentTarget.style.color = '#ffffff'; }}
                        onMouseOut={(e) => { e.currentTarget.style.color = '#94a3b8'; }}
                      >
                        <Icon size={14} style={{ color: item.color }} />
                        <span>{item.label}</span>
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Col 3: Personal Notebooks */}
            <div className="col-lg-3 col-md-4">
              <h6
                className="fw-bold text-uppercase tracking-wider small mb-3"
                style={{ color: '#f8fafc', fontSize: '12px', letterSpacing: '0.06em' }}
              >
                Sổ Tay & Củng Cố
              </h6>
              <ul className="list-unstyled small d-flex flex-column gap-2 mb-0">
                {[
                  { id: 'review', label: 'Ôn tập từ làm sai', icon: RefreshCw, color: '#ef4444' },
                  { id: 'favorites', label: 'Từ vựng yêu thích', icon: Star, color: '#f59e0b' },
                  { id: 'notes', label: 'Sổ ghi chú cá nhân', icon: FileText, color: '#38bdf8' },
                  { id: 'dashboard', label: 'Báo cáo tiến độ học', icon: BarChart2, color: '#3b82f6' }
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <li key={item.id}>
                      <a
                        href="#"
                        onClick={(e) => { e.preventDefault(); setActiveTab(item.id); }}
                        className="text-decoration-none d-inline-flex align-items-center gap-2"
                        style={{ color: '#94a3b8', transition: 'color 0.15s ease' }}
                        onMouseOver={(e) => { e.currentTarget.style.color = '#ffffff'; }}
                        onMouseOut={(e) => { e.currentTarget.style.color = '#94a3b8'; }}
                      >
                        <Icon size={14} style={{ color: item.color }} />
                        <span>{item.label}</span>
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Col 4: Platform Standard */}
            <div className="col-lg-2 col-md-4">
              <h6
                className="fw-bold text-uppercase tracking-wider small mb-3"
                style={{ color: '#f8fafc', fontSize: '12px', letterSpacing: '0.06em' }}
              >
                Tiêu Chuẩn N5
              </h6>
              <div className="d-flex flex-column gap-2 small">
                <div
                  className="p-2 rounded-3 d-flex justify-content-between align-items-center"
                  style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.08)' }}
                >
                  <span style={{ color: '#94a3b8' }}>Từ vựng:</span>
                  <span className="fw-bold text-white">1,589 từ</span>
                </div>
                <div
                  className="p-2 rounded-3 d-flex justify-content-between align-items-center"
                  style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.08)' }}
                >
                  <span style={{ color: '#94a3b8' }}>Hán tự:</span>
                  <span className="fw-bold text-warning">80+ Kanji</span>
                </div>
                <div
                  className="p-2 rounded-3 d-flex justify-content-between align-items-center"
                  style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.08)' }}
                >
                  <span style={{ color: '#94a3b8' }}>Phát âm:</span>
                  <span className="fw-bold text-info">Tokyo Pitch</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Copyright & Status */}
          <div className="pt-3.5 d-flex justify-content-between align-items-center flex-wrap gap-2 small" style={{ color: '#64748b' }}>
            <div>
              © 2026 <strong className="text-white">HYPER JAPAN</strong>. Nền tảng học tiếng Nhật hiện đại. All rights reserved.
            </div>
            <div className="d-flex align-items-center gap-3">
              <span className="d-inline-flex align-items-center gap-1.5" style={{ color: '#10b981' }}>
                <span className="rounded-circle d-inline-block" style={{ width: 6, height: 6, background: '#10b981' }} />
                Hệ thống trực tuyến 24/7
              </span>
              <span>•</span>
              <span style={{ color: '#94a3b8' }}>Phiên bản 2.5 Pro</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
