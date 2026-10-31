import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService, progressService, aiService } from '../services/api';
import { sounds } from '../services/sounds';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [activeTab, setActiveTab] = useState('home');
  const [selectedLesson, setSelectedLesson] = useState(1);
  const [currentLevel, setCurrentLevel] = useState('N5');
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Auth Modal State
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register' | 'forgot'

  // AI Explanation Modal State
  const [aiModal, setAiModal] = useState({
    isOpen: false,
    title: '',
    data: null,
    loading: false
  });

  // Gamification & Progress State
  const [gamification, setGamification] = useState({
    total_xp: 1240,
    current_streak: 12,
    longest_streak: 15,
    level_tier: 'Chiến Binh N5',
    today_words_count: 0
  });

  const [guestProgress, setGuestProgress] = useState(() => {
    try {
      const saved = localStorage.getItem('nihongo_guest_progress');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Check current auth status on mount
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('nihongo_token');
      if (token) {
        try {
          const res = await authService.getMe();
          if (res.data?.user) {
            setUser(res.data.user);
          }
        } catch {
          localStorage.removeItem('nihongo_token');
        }
      }
      setAuthLoading(false);
    };

    initAuth();
  }, []);

  // Save guest progress
  useEffect(() => {
    try {
      localStorage.setItem('nihongo_guest_progress', JSON.stringify(guestProgress));
    } catch {}
  }, [guestProgress]);

  // Tab switch with sound
  const navigateTo = (tab, lessonId = null) => {
    sounds.playFlip();
    if (lessonId) setSelectedLesson(lessonId);
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Open Auth modal
  const openAuth = (mode = 'login') => {
    sounds.playFlip();
    setAuthMode(mode);
    setAuthModalOpen(true);
  };

  const logout = () => {
    sounds.playFlip();
    localStorage.removeItem('nihongo_token');
    setUser(null);
  };

  // Record word progress
  const recordWordProgress = (wordId, status) => {
    setGuestProgress((prev) => ({
      ...prev,
      [wordId]: {
        status,
        updated_at: new Date().toISOString()
      }
    }));

    // Award XP
    const xpGained = status === 'mastered' ? 15 : 5;
    setGamification((prev) => ({
      ...prev,
      total_xp: prev.total_xp + xpGained,
      today_words_count: prev.today_words_count + 1
    }));

    // Sync to backend if available
    progressService.recordTick({ vocabId: wordId, status, xp: xpGained }).catch(() => {});
  };

  // AI Assistant trigger from any screen
  const askAi = async (action, context, defaultTitle = 'Trợ Lý AI Phân Tích') => {
    sounds.playFlip();
    setAiModal({
      isOpen: true,
      title: defaultTitle,
      data: null,
      loading: true
    });

    try {
      const res = await aiService.query({ action, context });
      if (res.data?.success) {
        setAiModal({
          isOpen: true,
          title: res.data.data?.title || defaultTitle,
          data: res.data.data,
          loading: false
        });
      } else {
        throw new Error('API return unsuccessful');
      }
    } catch (e) {
      setAiModal({
        isOpen: true,
        title: defaultTitle,
        data: {
          nuance: 'Trợ lý AI đang cập nhật dữ liệu. Hãy tham khảo phần phát âm chuẩn và các câu ví dụ thực tế của bài học nhé!',
          golden_rule: 'Học tiếng Nhật hiệu quả nhất là kết hợp lặp lại ngắt quãng (SRS) và luyện phát âm thành tiếng!'
        },
        loading: false
      });
    }
  };

  const closeAiModal = () => {
    setAiModal((prev) => ({ ...prev, isOpen: false }));
  };

  return (
    <AppContext.Provider
      value={{
        activeTab,
        setActiveTab: navigateTo,
        selectedLesson,
        setSelectedLesson,
        currentLevel,
        setCurrentLevel,
        user,
        setUser,
        logout,
        authLoading,
        authModalOpen,
        setAuthModalOpen,
        authMode,
        setAuthMode,
        openAuth,
        gamification,
        guestProgress,
        recordWordProgress,
        aiModal,
        askAi,
        closeAiModal
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
