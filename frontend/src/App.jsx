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
import WordMatchPage from './pages/WordMatchPage';
import GardenPage from './pages/GardenPage';
import ParticlesPage from './pages/ParticlesPage';
import Logo from './components/Logo';
import WelcomeBannerModal from './components/WelcomeBannerModal';
import Footer from './components/Footer';
import AiChatBubble from './components/AiChatBubble';
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
  ExternalLink,
  ShieldAlert,
  Zap,
  Sprout
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
                Quay lại trang học tập
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
  const [refreshKey, setRefreshKey] = useState(0);
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
      setRefreshKey((k) => k + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
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
      case 'wordmatch':
        return (
          <WordMatchPage
            initialLesson={selectedLesson}
            onNavigate={handleTabChange}
            onSelectLesson={handleSelectLesson}
          />
        );
      case 'garden':
        return (
          <GardenPage
            onNavigate={handleTabChange}
          />
        );
      case 'particles':
        return (
          <ParticlesPage
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
      {/* ── Official Welcome Announcement Banner Modal ── */}
      <WelcomeBannerModal
        onExploreCourses={() => {
          handleTabChange('lessons');
        }}
      />

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
      <main className="flex-grow-1 page-transition" key={`${activeTab}-${refreshKey}`}>
        {renderContent()}
      </main>

      {/* ── Modern High-End Support Footer ── */}
      <Footer onNavigate={handleTabChange} />

      {/* ── Global Floating AI Assistant Bubble ── */}
      <AiChatBubble />
    </div>
  );
}

export default App;
