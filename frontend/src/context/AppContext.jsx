export function getLocalYMD(d) {
  const date = d ? new Date(d) : new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getYesterdayYMD(d) {
  const date = d ? new Date(d) : new Date();
  date.setDate(date.getDate() - 1);
  return getLocalYMD(date);
}

// Normalize user shape across Google OAuth, Facebook, DB and LocalStorage
export function normalizeUser(u) {
  if (!u || typeof u !== 'object') return null;
  const avatar = u.avatar || u.avatar_url || '';
  const name = u.name || u.username || (u.email ? u.email.split('@')[0] : 'Học viên');
  return {
    ...u,
    name: name,
    username: u.username || name,
    avatar: avatar,
    avatar_url: avatar
  };
}

// Normalize word progress shape across multi-device sync
export function normalizeProgress(raw) {
  if (!raw || typeof raw !== 'object') return {};
  const normalized = {};
  const nowIso = new Date().toISOString();
  const entries = Object.entries(raw);
  for (let i = 0; i < entries.length; i++) {
    const k = entries[i][0];
    const v = entries[i][1];
    if (!v) continue;
    if (typeof v === 'string') {
      normalized[k] = { status: v, updated_at: nowIso };
    } else if (typeof v === 'object' && v.status) {
      normalized[k] = { status: v.status, updated_at: v.updated_at || nowIso };
    }
  }
  return normalized;
}

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
  const defaultGamification = {
    total_xp: 0,
    current_streak: 0,
    longest_streak: 0,
    level_tier: 'Tân Thủ N5',
    today_words_count: 0,
    target_per_day: 10,
    last_active_date: null,
    daily_study_counts: {}
  };

  const [gamification, setGamification] = useState(function () {
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
            target_per_day: parsed.target_per_day || 10,
            daily_study_counts: (parsed.daily_study_counts && typeof parsed.daily_study_counts === 'object') ? parsed.daily_study_counts : {}
          };
        }
      }
    } catch (err) {}
    return defaultGamification;
  });

  // Guest Progress: { [wordId]: { status: 'mastered' | 'needs_review', updated_at: string } }
  const [guestProgress, setGuestProgress] = useState(function() {
    try {
      const saved = localStorage.getItem('nihongo_guest_progress');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') return normalizeProgress(parsed);
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
            syncUserCloudProgress();
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
  useEffect(function () {
    const todayStr = getLocalYMD();
    const yesterdayStr = getYesterdayYMD();

    setGamification(function (prev) {
      const safePrev = (prev && typeof prev === 'object') ? prev : defaultGamification;
      const dailyCounts = Object.assign({}, safePrev.daily_study_counts || {});

      // Nạp lịch sử học từ guestProgress nếu dailyCounts trống
      if (Object.keys(dailyCounts).length === 0 && guestProgress && typeof guestProgress === 'object') {
        Object.values(guestProgress).forEach(function (item) {
          if (item && typeof item === 'object' && item.updated_at) {
            const d = getLocalYMD(new Date(item.updated_at));
            dailyCounts[d] = (dailyCounts[d] || 0) + 1;
          }
        });
      }

      const todayWords = dailyCounts[todayStr] || 0;
      let streak = safePrev.current_streak || 0;
      const cleanLastActive = safePrev.last_active_date ? String(safePrev.last_active_date).slice(0, 10) : null;

      if (!cleanLastActive) {
        streak = todayWords > 0 ? 1 : 0;
      } else if (cleanLastActive === todayStr) {
        if (todayWords > 0 && streak === 0) streak = 1;
      } else if (cleanLastActive === yesterdayStr) {
        // Đã học hôm qua: giữ nguyên chuỗi chờ học hôm nay
      } else {
        // Bị ngắt quãng quá 1 ngày: nếu hôm nay đã học thì bắt đầu 1, chưa học thì 0
        streak = todayWords > 0 ? 1 : 0;
      }

      const updated = {
        ...safePrev,
        current_streak: streak,
        today_words_count: todayWords,
        target_per_day: safePrev.target_per_day || 10,
        daily_study_counts: dailyCounts,
        last_active_date: todayWords > 0 ? todayStr : safePrev.last_active_date
      };
      try {
        localStorage.setItem('nihongo_gamification', JSON.stringify(updated));
      } catch (err) {}
      return updated;
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
            // Authoritative multi-device cloud sync
            syncUserCloudProgress();
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

  // Pull authoritative multi-device progress from cloud database
  const syncUserCloudProgress = async function () {
    try {
      const localProg = guestProgress || {};
      const localGam = gamification || {};
      // Call bidirectional sync endpoint with local data
      const res = await progressService.syncProgress({
        progress: localProg,
        gamification: localGam
      });
      if (res.data && res.data.success) {
        if (res.data.progress && typeof res.data.progress === 'object') {
          const normalized = normalizeProgress(res.data.progress);
          const mergedProg = Object.assign({}, localProg, normalized);
          setGuestProgress(mergedProg);
          try {
            localStorage.setItem('nihongo_guest_progress', JSON.stringify(mergedProg));
          } catch (err) {}
        }
        if (res.data.gamification) {
          const g = res.data.gamification;
          setGamification(function (prev) {
            const mergedCounts = Object.assign({}, prev.daily_study_counts || {});
            if (g.daily_study_counts && typeof g.daily_study_counts === 'object') {
              for (const [k, v] of Object.entries(g.daily_study_counts)) {
                mergedCounts[k] = Math.max(mergedCounts[k] || 0, parseInt(v, 10) || 0);
              }
            }
            const todayStr = getLocalYMD();
            const todayCount = mergedCounts[todayStr] || 0;
            const mergedGam = {
              ...prev,
              ...g,
              total_xp: Math.max(prev.total_xp || 0, g.total_xp || 0),
              current_streak: Math.max(prev.current_streak || 0, g.current_streak || 0),
              longest_streak: Math.max(prev.longest_streak || 0, g.longest_streak || 0),
              today_words_count: Math.max(prev.today_words_count || 0, g.today_words_count || 0, todayCount),
              target_per_day: g.target_per_day || prev.target_per_day || 10,
              daily_study_counts: mergedCounts,
              last_active_date: (todayCount > 0) ? todayStr : (g.last_active_date || prev.last_active_date)
            };
            try {
              localStorage.setItem('nihongo_gamification', JSON.stringify(mergedGam));
            } catch (err) {}
            return mergedGam;
          });
        }
      }
    } catch (err) {
      console.warn('Sync user cloud progress error:', err);
    }
  };

  const logout = () => {
    sounds.playFlip();
    localStorage.removeItem('nihongo_token');
    localStorage.removeItem('nihongo_cached_user');
    localStorage.removeItem('nihongo_guest_progress');
    localStorage.removeItem('nihongo_gamification');
    setUser(null);
    setGuestProgress({});
    setGamification({
      total_xp: 0,
      current_streak: 0,
      longest_streak: 0,
      level_tier: 'Tân Thủ N5',
      today_words_count: 0,
      last_active_date: null,
      daily_study_counts: {}
    });
  };

  // Record word progress with real streak and daily target tracking (học thì mới có chuỗi)
  const recordWordProgress = function (wordId, status) {
    const nowIso = new Date().toISOString();
    const todayStr = getLocalYMD();
    const yesterdayStr = getYesterdayYMD();

    setGuestProgress(function (prev) {
      const next = {
        ...prev,
        [wordId]: {
          status: status,
          updated_at: nowIso
        }
      };
      try {
        localStorage.setItem('nihongo_guest_progress', JSON.stringify(next));
      } catch (err) {}
      return next;
    });

    const xpGained = status === 'mastered' ? 15 : 5;

    setGamification(function (prev) {
      const dailyCounts = Object.assign({}, prev.daily_study_counts || {});
      dailyCounts[todayStr] = (dailyCounts[todayStr] || 0) + 1;
      const todayCount = dailyCounts[todayStr];

      let streak = prev.current_streak || 0;
      const cleanLastActive = prev.last_active_date ? String(prev.last_active_date).slice(0, 10) : null;

      if (cleanLastActive !== todayStr) {
        if (cleanLastActive === yesterdayStr && streak > 0) {
          streak += 1;
        } else {
          streak = 1;
        }
      } else if (streak === 0) {
        streak = 1;
      }

      const longest = Math.max(prev.longest_streak || 0, streak);

      const updated = {
        ...prev,
        total_xp: (prev.total_xp || 0) + xpGained,
        current_streak: streak,
        longest_streak: longest,
        today_words_count: todayCount,
        target_per_day: prev.target_per_day || 10,
        last_active_date: todayStr,
        daily_study_counts: dailyCounts
      };
      try {
        localStorage.setItem('nihongo_gamification', JSON.stringify(updated));
      } catch (err) {}
      return updated;
    });

    // Sync to backend with real-time multi-device cloud persistence
    progressService.recordTick({ vocabId: wordId, status: status, xp: xpGained })
      .then(function (tickRes) {
        if (tickRes.data && tickRes.data.gamification) {
          const serverGam = tickRes.data.gamification;
          setGamification(function (prev) {
            const mergedCounts = Object.assign({}, prev.daily_study_counts || {});
            if (serverGam.daily_study_counts && typeof serverGam.daily_study_counts === 'object') {
              for (const [k, v] of Object.entries(serverGam.daily_study_counts)) {
                mergedCounts[k] = Math.max(mergedCounts[k] || 0, parseInt(v, 10) || 0);
              }
            }
            const updated = {
              ...prev,
              ...serverGam,
              total_xp: Math.max(prev.total_xp || 0, serverGam.total_xp || 0),
              current_streak: Math.max(prev.current_streak || 0, serverGam.current_streak || 0),
              longest_streak: Math.max(prev.longest_streak || 0, serverGam.longest_streak || 0),
              today_words_count: Math.max(prev.today_words_count || 0, serverGam.today_words_count || 0),
              target_per_day: serverGam.target_per_day || prev.target_per_day || 10,
              daily_study_counts: mergedCounts,
              last_active_date: todayStr
            };
            try {
              localStorage.setItem('nihongo_gamification', JSON.stringify(updated));
            } catch (err) {}
            return updated;
          });
        }
      })
      .catch(function () {});
  };

  const setDailyTarget = function (num) {
    const target = Math.max(1, Math.min(100, parseInt(num, 10) || 10));
    sounds.playFlip();
    setGamification(function (prev) {
      const updated = { ...prev, target_per_day: target };
      try {
        localStorage.setItem('nihongo_gamification', JSON.stringify(updated));
      } catch (err) {}
      return updated;
    });
    progressService.setDailyTarget(target).catch(function () {});
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

    let safeAction = action || 'free_question';
    let safeContext = context;
    let safeTitle = defaultTitle;

    if (typeof action === 'string' && !context && action.length > 20) {
      safeAction = 'free_question';
      safeContext = { question: action };
    }

    // Pre-populate modal data with known context immediately so it displays instantly
    const initialData = typeof safeContext === 'object' && safeContext !== null ? { ...safeContext } : {};
    if (typeof safeContext === 'string') {
      initialData.word = safeContext;
    }

    setAiModal({
      isOpen: true,
      title: safeTitle,
      data: initialData,
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
        action: safeAction,
        context: safeContext,
        prompt: typeof safeContext === 'string' ? safeContext : (safeContext?.question || safeContext?.message || ''),
        userProgress,
        username: user?.username || 'Học viên'
      });

      if (res.data?.success) {
        const mergedData = {
          ...initialData,
          ...(res.data.data || {})
        };
        setAiModal({
          isOpen: true,
          title: res.data.data?.title || safeTitle,
          data: mergedData,
          loading: false
        });
        return res.data;
      } else {
        throw new Error('API return unsuccessful');
      }
    } catch (err) {
      console.warn('askAi query failed:', err);
      const wordKey = initialData.kanji || initialData.word || initialData.clean_kana || initialData.title || '';
      const fallbackData = {
        ...initialData,
        explanation: wordKey
          ? `AI Sensei hướng dẫn:\nKhi học 「${wordKey}」, hãy kết hợp đọc to thành tiếng theo ngữ điệu Tokyo và đặt từ vào câu hoàn chỉnh mỗi ngày.`
          : 'Trợ lý AI đang sẵn sàng hỗ trợ. Bạn có thể luyện nghe phát âm chuẩn Tokyo hoặc xem mẹo nhớ tượng hình để khắc sâu vào tiềm thức nhé!',
        nuance: initialData.clean_vietnamese || initialData.vietnamese
          ? `Ý nghĩa chuẩn xác: ${initialData.clean_vietnamese || initialData.vietnamese}.`
          : 'Từ vựng trọng tâm thường gặp trong đề thi năng lực tiếng Nhật JLPT.',
        mnemonic: initialData.kanji
          ? `Quan sát kỹ các nét của chữ Hán 「${initialData.kanji}」 để liên tưởng hình ảnh trực quan.`
          : 'Luyện lặp lại ngắt quãng (SRS) vào các khung giờ vàng trong ngày.',
        golden_rule: 'Học tiếng Nhật hiệu quả nhất là kết hợp lặp lại ngắt quãng và phát âm to rõ ràng!',
        example: initialData.example_jp ? {
          jp: initialData.example_jp,
          vi: initialData.example_vi || ''
        } : (wordKey ? { jp: `「${wordKey}」を勉強します。`, vi: `Học 「${wordKey}」 mỗi ngày.` } : null)
      };
      setAiModal({
        isOpen: true,
        title: safeTitle,
        data: fallbackData,
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
        setDailyTarget,
        getLocalYMD,
    syncUserCloudProgress,
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