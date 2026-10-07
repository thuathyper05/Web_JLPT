import React, { useState } from 'react';
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

function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [selectedLesson, setSelectedLesson] = useState(1);
  const [searchModalOpen, setSearchModalOpen] = useState(false);

  const handleSelectLesson = (lessonNum) => {
    setSelectedLesson(lessonNum);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return (
          <HomePage
            onNavigate={(tab) => setActiveTab(tab)}
            onSelectLesson={handleSelectLesson}
          />
        );
      case 'lessons':
        return (
          <LessonStudyPage
            selectedLesson={selectedLesson}
            onSelectLesson={handleSelectLesson}
            onNavigate={(tab) => setActiveTab(tab)}
          />
        );
      case 'flashcard':
        return <FlashcardPage initialLesson={selectedLesson} />;
      case 'quiz':
        return (
          <QuizPage
            initialLesson={selectedLesson}
            onNavigate={(tab) => setActiveTab(tab)}
          />
        );
      case 'practice':
        return <PracticeInputPage initialLesson={selectedLesson} />;
      case 'review':
        return <ReviewWrongPage onNavigate={(tab) => setActiveTab(tab)} />;
      case 'favorites':
        return (
          <FavoritesPage
            onNavigate={(tab) => setActiveTab(tab)}
            onSelectLesson={handleSelectLesson}
          />
        );
      case 'notes':
        return (
          <NotesPage
            onNavigate={(tab) => setActiveTab(tab)}
            onSelectLesson={handleSelectLesson}
          />
        );
      case 'dashboard':
        return (
          <DashboardPage
            onSelectLesson={handleSelectLesson}
            onNavigate={(tab) => setActiveTab(tab)}
          />
        );
      default:
        return (
          <HomePage
            onNavigate={(tab) => setActiveTab(tab)}
            onSelectLesson={handleSelectLesson}
          />
        );
    }
  };

  return (
    <div className="d-flex flex-column min-vh-100 bg-light">
      {/* Top Navbar */}
      <NavbarComponent
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenSearch={() => setSearchModalOpen(true)}
      />

      {/* Global Search Modal */}
      <SearchModal
        isOpen={searchModalOpen}
        toggle={() => setSearchModalOpen(!searchModalOpen)}
        onSelectLesson={(lessonNum) => {
          setSelectedLesson(lessonNum);
          setActiveTab('lessons');
        }}
      />

      {/* Main Content Area */}
      <main className="flex-grow-1 pb-5 mb-5 mb-lg-0">
        {renderContent()}
      </main>

      {/* Desktop Footer */}
      <footer className="bg-white border-top py-4 text-center text-muted small d-none d-lg-block">
        <div className="container">
          <p className="mb-1 fw-semibold text-dark">
            Hệ thống Website Hỗ trợ Học & Ôn tập Từ vựng Tiếng Nhật N5 (Minna no Nihongo)
          </p>
          <p className="mb-0 text-secondary">
            Bản quyền © 2026. Thiết kế theo tiêu chuẩn giáo trình Minna no Nihongo 25 bài toàn tập với 1,589 từ vựng.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
