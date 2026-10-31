import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService, progressService, aiService } from '../services/api';
import { sounds } from '../services/sounds';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [activeTab, setActiveTabState] = useState('home');
  const [selectedLesson, setSelectedLesson] = useState(1);
  const [currentLevel, setCurrentLevel] = useState('N5');
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Signature Page Transition Loader
  const [pageLoading, setPageLoading] = useState(true);
  const [loadingMessage, setLoadingMessage] = useState('Đang nạp dữ liệu...');

  // Auth Modal State
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register' | 'forgot'

  // XP Rewards Modal State
  const [xpModalOpen, setXpModalOpen] = useState(false);

  // Desktop Sidebar Collapse State
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    try {
      return localStorage.getItem('hyper_sidebar_collapsed') === 'true';
    } catch {
      return false;
    }
  });

  const toggleSidebarCollapse = () => {
    setSidebarCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('hyper_sidebar_collapsed', String(next));
      } catch {}
      return next;
    });
  };

  // User Perks & Purchased Items
  const [userPerks, setUserPerks] = useState(() => {
    try {
      const saved = localStorage.getItem('nihongo_user_perks');
      return saved ? JSON.parse(saved) : { streak_freeze: 1 };
    } catch {
      return { streak_freeze: 1 };
    }
  });

  // AI Explanation Modal State
  const [aiModal, setAiModal] = useState({
    isOpen: false,
    title: '',
    data: null,
    loading: false
  });

  // Gamification & Progress State
  const [gamification, setGamification] = useState(() => {
    try {
      const saved = localStorage.getItem('nihongo_gamification');
      return saved
        ? JSON.parse(saved)
        : {
            total_xp: 1240,
            current_streak: 12,
            longest_streak: 15,
            level_tier: 'Cao Thủ Kanji N5',
            today_words_count: 0
          };
    } catch {
      return {
        total_xp: 1240,
        current_streak: 12,
        longest_streak: 15,
        level_tier: 'Cao Thủ Kanji N5',
        today_words_count: 0
      };
    }
  });

  // Guest Progress: { [wordId]: { status: 'mastered' | 'needs_review', updated_at: string } }
  const [guestProgress, setGuestProgress] = useState(() => {
    try {
      const saved = localStorage.getItem('nihongo_guest_progress');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Favorites: { [wordId]: true }
  const [favorites, setFavorites] = useState(() => {
    try {
      const saved = localStorage.getItem('nihongo_favorites');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Initial App Load Spinner (Beside auth check)
  useEffect(() => {
    const timer = setTimeout(() => {
      setPageLoading(false);
    }, 550);
    return () => clearTimeout(timer);
  }, []);

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

  // Persist guest progress
  useEffect(() => {
    try {
      localStorage.setItem('nihongo_guest_progress', JSON.stringify(guestProgress));
    } catch {}
  }, [guestProgress]);

  // Persist favorites
  useEffect(() => {
    try {
      localStorage.setItem('nihongo_favorites', JSON.stringify(favorites));
    } catch {}
  }, [favorites]);

  // Persist gamification
  useEffect(() => {
    try {
      localStorage.setItem('nihongo_gamification', JSON.stringify(gamification));
    } catch {}
  }, [gamification]);

  // Persist user perks
  useEffect(() => {
    try {
      localStorage.setItem('nihongo_user_perks', JSON.stringify(userPerks));
    } catch {}
  }, [userPerks]);

  // Tab switch with sound and signature smooth transition loader
  const navigateTo = (tab, lessonId = null) => {
    sounds.playFlip();
    if (lessonId) setSelectedLesson(lessonId);

    // Trigger brief, fluid transition spinner
    setLoadingMessage(
      tab === 'lessons'
        ? 'Đang chuẩn bị giáo trình Minna...'
        : tab === 'kanji'
        ? 'Đang tải bảng chữ Hán Kanji...'
        : tab === 'particles'
        ? 'Đang nạp dữ liệu trợ từ...'
        : tab === 'garden'
        ? 'Đang chăm sóc vườn Bonsai...'
        : tab === 'practice'
        ? 'Đang nạp trường đấu gõ Kana...'
        : 'Đang chuyển trang...'
    );
    setPageLoading(true);

    setActiveTabState(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    setTimeout(() => {
      setPageLoading(false);
    }, 280);
  };

  // Change JLPT Level
  const changeLevel = (level) => {
    sounds.playFlip();
    setCurrentLevel(level);
    if (level === 'N5') {
      if (activeTab === 'level-coming-soon') {
        navigateTo('home');
      }
    } else {
      navigateTo('level-coming-soon');
    }
  };

  // Toggle favorite word
  const toggleFavorite = (wordId) => {
    sounds.playFlip();
    setFavorites((prev) => {
      const updated = { ...prev };
      if (updated[wordId]) {
        delete updated[wordId];
      } else {
        updated[wordId] = true;
      }
      return updated;
    });
  };

  const isFavorite = (wordId) => !favorites[wordId];

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

  // Spend XP on Rewards Shop
  const spendXp = (cost, itemId) => {
    if (gamification.total_xp < cost) return false;

    setGamification((prev) => ({
      ...prev,
      total_xp: prev.total_xp - cost
    }));

    setUserPerks((prev) => {
      const currentCount = prev[itemId] || 0;
      return {
        ...prev,
        [itemId]: typeof currentCount === 'number' ? currentCount + 1 : true
      };
    });

    return true;
  };

  // AI Assistant trigger from any screen with personalized user progress
  const askAi = async (action, context, defaultTitle = 'Trợ Lý AI Phân Tích') => {
    sounds.playFlip();
    setAiModal({
      isOpen: true,
      title: defaultTitle,
      data: null,
      loading: true
    });

    try {
      const masteredCount = Object.values(guestProgress).filter((p) => p.status === 'mastered').length;
      const reviewWords = Object.keys(guestProgress).filter((k) => guestProgress[k].status === 'needs_review');
      const userProgress = {
        masteredCount,
        reviewWords,
        streak: gamification?.current_streak || 1,
        activeLesson: selectedLesson || 1
      };

      const res = await aiService.query({
        action,
        context,
        userProgress,
        username: user?.username || 'Học viên'
      });
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
    } catch {
      setAiModal({
        isOpen: true,
        title: defaultTitle,
        data: {
          nuance:
            'Trợ lý AI đang sẵn sàng hỗ trợ. Bạn có thể luyện nghe phát âm chuẩn Tokyo hoặc xem mẹo nhớ tượng hình để khắc sâu vào tiềm thức nhé!',
          golden_rule:
            'Học tiếng Nhật hiệu quả nhất là kết hợp lặp lại ngắt quãng (SRS) và luyện phát âm thành tiếng!'
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
        setCurrentLevel: changeLevel,
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
        favorites,
        toggleFavorite,
        isFavorite,
        aiModal,
        askAi,
        closeAiModal,
        pageLoading,
        setPageLoading,
        loadingMessage,
        sidebarCollapsed,
        setSidebarCollapsed,
        toggleSidebarCollapse,
        xpModalOpen,
        setXpModalOpen,
        userPerks,
        spendXp
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);