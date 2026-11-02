import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService, progressService, aiService } from '../services/api';
import { sounds } from '../services/sounds';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [activeTab, setActiveTabState] = useState('home');
  const [selectedLesson, setSelectedLesson] = useState(1);
  const [currentLevel, setCurrentLevel] = useState(() => {
    try {
      return localStorage.getItem('nihongo_current_level') || 'N5';
    } catch {
      return 'N5';
    }
  });
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('nihongo_cached_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
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

  // Gamification & Progress State (Real Tracking: học thì mới có chuỗi)
  const [gamification, setGamification] = useState(() => {
    const defaultGamification = {
      total_xp: 0,
      current_streak: 0,
      longest_streak: 0,
      level_tier: 'Tân Thủ N5',
      today_words_count: 0,
      last_active_date: null,
      daily_study_counts: {}
    };
    try {
      const saved = localStorage.getItem('nihongo_gamification');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          if (parsed.current_streak === 12 && (!parsed.daily_study_counts || Object.keys(parsed.daily_study_counts).length === 0)) {
            parsed.current_streak = 0;
            parsed.total_xp = 0;
            parsed.longest_streak = 0;
          }
          return {
            ...defaultGamification,
            ...parsed,
            daily_study_counts: (parsed.daily_study_counts && typeof parsed.daily_study_counts === 'object') ? parsed.daily_study_counts : {}
          };
        }
      }
    } catch {}
    return defaultGamification;
  });

  // Guest Progress: { [wordId]: { status: 'mastered' | 'needs_review', updated_at: string } }
  const [guestProgress, setGuestProgress] = useState(() => {
    try {
      const saved = localStorage.getItem('nihongo_guest_progress');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') return parsed;
      }
    } catch {}
    return {};
  });

  // Favorites: { [wordId]: true }
  const [favorites, setFavorites] = useState(() => {
    try {
      const saved = localStorage.getItem('nihongo_favorites');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') return parsed;
      }
    } catch {}
    return {};
  });

  // Initial App Load Spinner (Beside auth check)
  useEffect(() => {
    const timer = setTimeout(() => {
      setPageLoading(false);
    }, 550);
    return () => clearTimeout(timer);
  }, []);

  // Handle Facebook OAuth Dialog hash redirect response (#access_token=...)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const hash = window.location.hash;
    if (hash && hash.includes('access_token=')) {
      const params = new URLSearchParams(hash.substring(1));
      const accessToken = params.get('access_token');
      if (accessToken) {
        window.history.replaceState(null, '', window.location.pathname);
        setPageLoading(true);
        setLoadingMessage('Đang đăng nhập bằng Facebook...');

        authService.socialLogin({
          provider: 'Facebook',
          accessToken
        }).then((res) => {
          if (res.data?.success) {
            sounds.playLevelUp();
            localStorage.setItem('nihongo_token', res.data.token);
            try { localStorage.setItem('nihongo_cached_user', JSON.stringify(res.data.user)); } catch {}
            setUser(res.data.user);
          }
        }).catch((err) => {
          console.error('Facebook OAuth hash login error:', err);
        }).finally(() => {
          setPageLoading(false);
        });
      }
    }
  }, []);

  // Check current auth status and daily streak on mount
  useEffect(() => {
    const todayStr = new Date().toISOString().slice(0, 10);
    const yesterdayStr = new Date(Date.now() - 86400000).toISOString().slice(0, 10);

    setGamification((prev) => {
      const safePrev = (prev && typeof prev === 'object') ? prev : {
        total_xp: 0,
        current_streak: 0,
        longest_streak: 0,
        level_tier: 'Tân Thủ N5',
        today_words_count: 0,
        last_active_date: null,
        daily_study_counts: {}
      };
      const dailyCounts = { ...(safePrev.daily_study_counts || {}) };

      // Nạp lịch sử học từ guestProgress nếu dailyCounts trống
      if (Object.keys(dailyCounts).length === 0 && guestProgress && typeof guestProgress === 'object') {
        Object.values(guestProgress).forEach((item) => {
          if (item && typeof item === 'object' && item.updated_at) {
            const d = item.updated_at.slice(0, 10);
            dailyCounts[d] = (dailyCounts[d] || 0) + 1;
          }
        });
      }

      const todayWords = dailyCounts[todayStr] || 0;
      let streak = safePrev.current_streak || 0;
      const lastActive = safePrev.last_active_date;

      if (!lastActive) {
        streak = todayWords > 0 ? 1 : 0;
      } else if (lastActive === todayStr) {
        // Đã học hôm nay: giữ nguyên chuỗi
      } else if (lastActive === yesterdayStr) {
        // Đã học hôm qua: giữ chuỗi chờ học hôm nay
      } else {
        // Bị ngắt quãng quá 1 ngày: chuỗi trở về 0
        streak = todayWords > 0 ? 1 : 0;
      }

      return {
        ...safePrev,
        current_streak: streak,
        today_words_count: todayWords,
        daily_study_counts: dailyCounts,
        last_active_date: todayWords > 0 ? todayStr : safePrev.last_active_date
      };
    });

    const initAuth = async () => {
      const token = localStorage.getItem('nihongo_token');
      if (token) {
        try {
          const res = await authService.getMe();
          if (res.data?.user) {
            setUser(res.data.user);
            try {
              localStorage.setItem('nihongo_cached_user', JSON.stringify(res.data.user));
            } catch {}
          }
        } catch {
          localStorage.removeItem('nihongo_token');
          localStorage.removeItem('nihongo_cached_user');
          setUser(null);
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

  // Change JLPT Level (Seamlessly loads real PostgreSQL data for N5 to N1)
  const changeLevel = (level) => {
    sounds.playLevelUp();
    setCurrentLevel(level);
    try {
      localStorage.setItem('nihongo_current_level', level);
    } catch {}
    if (level === 'N4') {
      setSelectedLesson(26);
    } else {
      setSelectedLesson(1);
    }
    if (activeTab === 'level-coming-soon') {
      navigateTo('home');
    } else {
      navigateTo(activeTab);
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
    localStorage.removeItem('nihongo_cached_user');
    setUser(null);
  };

  // Record word progress with real streak and daily target tracking (học thì mới có chuỗi)
  const recordWordProgress = (wordId, status) => {
    const nowIso = new Date().toISOString();
    const todayStr = nowIso.slice(0, 10);
    const yesterdayStr = new Date(Date.now() - 86400000).toISOString().slice(0, 10);

    setGuestProgress((prev) => ({
      ...prev,
      [wordId]: {
        status,
        updated_at: nowIso
      }
    }));

    const xpGained = status === 'mastered' ? 15 : 5;

    setGamification((prev) => {
      const dailyCounts = { ...(prev.daily_study_counts || {}) };
      dailyCounts[todayStr] = (dailyCounts[todayStr] || 0) + 1;
      const todayCount = dailyCounts[todayStr];

      let streak = prev.current_streak || 0;

      if (prev.last_active_date !== todayStr) {
        // Lần đầu học trong ngày hôm nay
        if (prev.last_active_date === yesterdayStr && streak > 0) {
          streak += 1;
        } else {
          // Bắt đầu chuỗi mới từ 1
          streak = 1;
        }
      } else if (streak === 0) {
        streak = 1;
      }

      const longest = Math.max(prev.longest_streak || 0, streak);

      return {
        ...prev,
        total_xp: (prev.total_xp || 0) + xpGained,
        current_streak: streak,
        longest_streak: longest,
        today_words_count: todayCount,
        last_active_date: todayStr,
        daily_study_counts: dailyCounts
      };
    });

    // Sync to backend if available
    progressService.recordTick({ vocabId: wordId, status, xp: xpGained }).catch(() => {});

  };

  // Reset progress for specified words (e.g. restart lesson from scratch)
  const resetWordProgress = (wordIds) => {
    if (!Array.isArray(wordIds) || wordIds.length === 0) return;
    setGuestProgress((prev) => {
      const next = { ...(prev || {}) };
      wordIds.forEach((id) => {
        delete next[id];
      });
      try {
        localStorage.setItem('nihongo_guest_progress', JSON.stringify(next));
      } catch {}
      return next;
    });

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
      const safeProgress = guestProgress && typeof guestProgress === 'object' ? guestProgress : {};
      const masteredCount = Object.values(safeProgress).filter((p) => p && typeof p === 'object' && p.status === 'mastered').length;
      const reviewWords = Object.keys(safeProgress).filter((k) => safeProgress[k] && typeof safeProgress[k] === 'object' && safeProgress[k].status === 'needs_review');
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
        return res.data;
      } else {
        throw new Error('API return unsuccessful');
      }
    } catch (err) {
      console.warn('askAi query failed:', err);
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
        resetWordProgress,
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