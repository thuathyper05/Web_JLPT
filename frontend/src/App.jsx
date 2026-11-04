import React, { useState } from 'react';
import { useApp } from './context/AppContext';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import MobileBottomNav from './components/MobileBottomNav';
import AuthModal from './components/AuthModal';
import AiExplainModal from './components/AiExplainModal';
import AiChatBubble from './components/AiChatBubble';
import SignatureLoader from './components/SignatureLoader';
import AppUpdateBanner from './components/AppUpdateBanner';

import DashboardPage from './pages/DashboardPage';
import LessonsPage from './pages/LessonsPage';
import KanjiPage from './pages/KanjiPage';
import ParticlesPage from './pages/ParticlesPage';
import FlashcardPage from './pages/FlashcardPage';
import ListeningPage from './pages/ListeningPage';
import QuizPage from './pages/QuizPage';
import PracticePage from './pages/PracticePage';
import WordMatchPage from './pages/WordMatchPage';
import GardenPage from './pages/GardenPage';
import NotebookPage from './pages/NotebookPage';
import DictionaryPage from './pages/DictionaryPage';
import AiSenseiPage from './pages/AiSenseiPage';
import SupportPage from './pages/SupportPage';
import ForumPage from './pages/ForumPage';
import LevelComingSoonPage from './pages/LevelComingSoonPage';
import AdminPage from './pages/AdminPage';

export default function App() {
  const { activeTab, pageLoading, loadingMessage, sidebarCollapsed } = useApp();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Dedicated Independent Admin Portal Routing
  const [isAdminPath, setIsAdminPath] = useState(() => {
    if (typeof window === 'undefined') return false;
    return (
      window.location.pathname === '/admin' ||
      window.location.pathname.startsWith('/admin/') ||
      window.location.hash.startsWith('#/admin')
    );
  });

  useEffect(() => {
    const handlePopState = () => {
      const checkAdmin =
        window.location.pathname === '/admin' ||
        window.location.pathname.startsWith('/admin/') ||
        window.location.hash.startsWith('#/admin');
      setIsAdminPath(checkAdmin);
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('hashchange', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('hashchange', handlePopState);
    };
  }, []);

  // When visiting standalone Admin Executive Control Center
  if (isAdminPath) {
    return <AdminPage />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return <DashboardPage />;
      case 'lessons':
        return <LessonsPage />;
      case 'kanji':
        return <KanjiPage />;
      case 'particles':
        return <ParticlesPage />;
      case 'dictionary':
        return <DictionaryPage />;
      case 'notebook':
        return <NotebookPage />;
      case 'listening':
        return <ListeningPage />;
      case 'flashcard':
        return <FlashcardPage />;
      case 'quiz':
        return <QuizPage />;
      case 'practice':
      case 'typing':
        return <PracticePage />;
      case 'wordmatch':
        return <WordMatchPage />;
      case 'garden':
        return <GardenPage />;
      case 'ai_sensei':
      case 'sensei':
        return <AiSenseiPage />;
      case 'support':
        return <SupportPage />;
      case 'forum':
        return <ForumPage />;
      case 'level-coming-soon':
        return <LevelComingSoonPage />;
      default:
        return <DashboardPage />;
    }
  };

  // When viewing forum as a standalone external-style news portal
  if (activeTab === 'forum') {
    return (
      <div className="min-h-screen bg-[#fcfcfd] text-slate-900 font-sans antialiased">
        {pageLoading && <SignatureLoader message={loadingMessage} />}
        <ForumPage />
        <AiChatBubble />
        <AiExplainModal />
        <AuthModal />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-appbg text-slate-800 flex relative">
      {/* ── BESPOKE TRANSITION / PAGE LOADER ── */}
      {pageLoading && <SignatureLoader message={loadingMessage} />}

      {/* ── 1. SIDEBAR (DESKTOP & MOBILE DRAWER) ── */}
      <Sidebar
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      {/* ── 2. MAIN CONTENT WRAPPER ── */}
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${sidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64'}`}>
        {/* Sticky Top Header */}
        <Header onOpenMobileMenu={() => setMobileSidebarOpen(true)} />

        {/* Dynamic View Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-24 lg:pb-12 max-w-7xl w-full mx-auto">
          {renderContent()}
        </main>
      </div>

      {/* ── 3. MOBILE BOTTOM NAVIGATION ── */}
      <MobileBottomNav onOpenMobileMenu={() => setMobileSidebarOpen(true)} />

      {/* ── 4. FLOATING AI CHAT BUBBLE ── */}
      <AiChatBubble />

      {/* ── 5. AI EXPLANATION MODAL ── */}
      <AiExplainModal />

      {/* ── 6. AUTHENTICATION MODAL ── */}
      <AuthModal />

      {/* ── 7. LIVE APP UPDATE NOTIFICATION BANNER ── */}
      <AppUpdateBanner />
    </div>
  );
}