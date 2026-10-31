import React, { useState } from 'react';
import { useApp } from './context/AppContext';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import MobileBottomNav from './components/MobileBottomNav';
import AuthModal from './components/AuthModal';
import AiExplainModal from './components/AiExplainModal';
import AiChatBubble from './components/AiChatBubble';
import SignatureLoader from './components/SignatureLoader';

import DashboardPage from './pages/DashboardPage';
import LessonsPage from './pages/LessonsPage';
import KanjiPage from './pages/KanjiPage';
import ParticlesPage from './pages/ParticlesPage';
import FlashcardPage from './pages/FlashcardPage';
import QuizPage from './pages/QuizPage';
import PracticePage from './pages/PracticePage';
import WordMatchPage from './pages/WordMatchPage';
import GardenPage from './pages/GardenPage';
import NotebookPage from './pages/NotebookPage';
import DictionaryPage from './pages/DictionaryPage';
import AiSenseiPage from './pages/AiSenseiPage';
import SupportPage from './pages/SupportPage';
import LevelComingSoonPage from './pages/LevelComingSoonPage';

export default function App() {
  const { activeTab, pageLoading, loadingMessage } = useApp();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

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
      case 'flashcard':
        return <FlashcardPage />;
      case 'quiz':
        return <QuizPage />;
      case 'practice':
        return <PracticePage />;
      case 'wordmatch':
        return <WordMatchPage />;
      case 'garden':
        return <GardenPage />;
      case 'ai_sensei':
        return <AiSenseiPage />;
      case 'support':
        return <SupportPage />;
      case 'level-coming-soon':
        return <LevelComingSoonPage />;
      default:
        return <DashboardPage />;
    }
  };

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
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64 transition-all">
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
    </div>
  );
}