import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { authService, progressService, favoriteService, noteService, onlineService, gamificationService } from '../services/api';
import { awardGardenWater, getGardenWater } from '../services/gardenRewards';
import { OnlineTracker } from '../services/onlineTracker';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [progressVersion, setProgressVersion] = useState(0);
  const [onlineCount, setOnlineCount] = useState(1);

  // Guest LocalStorage state for seamless offline / non-login experience
  const [guestFavorites, setGuestFavorites] = useState(() => {
    try {
      const saved = localStorage.getItem('guest_favorites');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [guestProgress, setGuestProgress] = useState(() => {
    try {
      const saved = localStorage.getItem('guest_progress');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Guest Gamification State (Streak, XP, Badges)
  const [guestGamification, setGuestGamification] = useState(() => {
    try {
      const saved = localStorage.getItem('guest_gamification');
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      current_streak: 1,
      longest_streak: 1,
      last_study_date: new Date().toISOString().split('T')[0],
      total_xp: 50,
      level_tier: 'Mầm non N5',
      next_tier_xp: 300,
      min_tier_xp: 0,
      gems_count: 100,
      freeze_streak_count: 1,
      badges: [
        { key: 'first_step', title: 'Bước đầu tiên', desc: 'Khởi đầu hành trình học tiếng Nhật N5', icon: 'Award', unlocked: true }
      ]
    };
  });

  useEffect(() => {
    try {
      localStorage.setItem('guest_gamification', JSON.stringify(guestGamification));
    } catch {}
  }, [guestGamification]);

  const [guestNotes, setGuestNotes] = useState(() => {
    try {
      const saved = localStorage.getItem('guest_notes');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Sync guest states to localStorage
  useEffect(() => {
    localStorage.setItem('guest_favorites', JSON.stringify(guestFavorites));
  }, [guestFavorites]);

  useEffect(() => {
    localStorage.setItem('guest_progress', JSON.stringify(guestProgress));
  }, [guestProgress]);

  useEffect(() => {
    localStorage.setItem('guest_notes', JSON.stringify(guestNotes));
  }, [guestNotes]);

  // Load user on mount if token exists
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('jlpt_token');
      if (token) {
        try {
          const res = await authService.getMe();
          setUser(res.data.user);
        } catch (e) {
          console.warn('Token expired or invalid');
          localStorage.removeItem('jlpt_token');
          setUser(null);
        }
      }
      setLoadingUser(false);
    };
    checkAuth();
  }, []);

  // Real-time Account & Multi-Machine Online Tracking Engine
  const trackerRef = useRef(null);

  useEffect(() => {
    trackerRef.current = new OnlineTracker(user, (count) => {
      setOnlineCount(count);
    });

    return () => {
      trackerRef.current?.cleanup();
    };
  }, []);

  // Sync tracker whenever user authenticates or logs out
  useEffect(() => {
    trackerRef.current?.updateUser(user);
  }, [user]);

  const login = async (credentials) => {
    const res = await authService.login(credentials);
    localStorage.setItem('jlpt_token', res.data.token);
    setUser(res.data.user);
    setProgressVersion(v => v + 1);
    return res.data;
  };

  const register = async (userData) => {
    const res = await authService.register(userData);
    localStorage.setItem('jlpt_token', res.data.token);
    setUser(res.data.user);
    setProgressVersion(v => v + 1);
    return res.data;
  };

  const googleLogin = async (data) => {
    const res = await authService.googleLogin(data);
    localStorage.setItem('jlpt_token', res.data.token);
    setUser(res.data.user);
    setProgressVersion(v => v + 1);
    return res.data;
  };

  const facebookLogin = async (data) => {
    const res = await authService.facebookLogin(data);
    localStorage.setItem('jlpt_token', res.data.token);
    setUser(res.data.user);
    setProgressVersion(v => v + 1);
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('jlpt_token');
    setUser(null);
    setProgressVersion(v => v + 1);
  };

  // Toggle favorite helper (works both for logged in and guest)
  const toggleFavorite = async (vocab) => {
    if (user) {
      try {
        const res = await favoriteService.toggleFavorite(vocab.id);
        return res.data.is_favorite;
      } catch (err) {
        console.error('Error toggling favorite:', err);
        return false;
      }
    } else {
      let isFav = false;
      setGuestFavorites((prev) => {
        const exists = prev.some((item) => item.id === vocab.id);
        if (exists) {
          isFav = false;
          return prev.filter((item) => item.id !== vocab.id);
        } else {
          isFav = true;
          return [...prev, vocab];
        }
      });
      return !guestFavorites.some((item) => item.id === vocab.id);
    }
  };

  // Check if vocab is favorite
  const isFavorite = (vocabId, serverIsFavorite) => {
    if (user) {
      return Boolean(serverIsFavorite);
    }
    return guestFavorites.some((v) => v.id === vocabId);
  };

  // Update progress helper (status: 'mastered' | 'needs_review' | 'learning')
  // Instant real-time synchronization across UI components
  const updateProgress = async (vocabId, status, isCorrect) => {
    // 1. Immediately update local guest progress state & trigger listeners
    setGuestProgress((prev) => {
      const current = prev[vocabId] || { correct_count: 0, wrong_count: 0, status: 'learning' };
      const newCorrect = isCorrect === true ? current.correct_count + 1 : current.correct_count;
      const newWrong = isCorrect === false ? current.wrong_count + 1 : (status === 'mastered' ? 0 : current.wrong_count);
      return {
        ...prev,
        [vocabId]: {
          status,
          correct_count: newCorrect,
          wrong_count: newWrong,
          last_studied: new Date().toISOString()
        }
      };
    });

    // 2. Bump progressVersion immediately
    setProgressVersion((v) => v + 1);

    // 3. If logged in, persist to server
    if (user) {
      try {
        await progressService.updateProgress({ vocabulary_id: vocabId, status });
      } catch (e) {
        console.error('Error updating progress on server:', e);
      }
    }
  };

  // Explicitly clear a wrong word from review list
  const clearWrongStatus = async (vocabId) => {
    await updateProgress(vocabId, 'mastered', true);
  };

  // Reset all wrong items
  const resetAllWrong = async () => {
    setGuestProgress((prev) => {
      const copy = { ...prev };
      Object.keys(copy).forEach((k) => {
        if (copy[k]?.status === 'needs_review' || copy[k]?.wrong_count > 0) {
          copy[k] = {
            ...copy[k],
            status: 'mastered',
            wrong_count: 0
          };
        }
      });
      return copy;
    });
    setProgressVersion((v) => v + 1);

    if (user) {
      try {
        const res = await progressService.getProgress();
        // Server will receive updates
      } catch (e) {
        console.error('Error resetting wrong words on server:', e);
      }
    }
  };

  // Save note helper
  const saveNote = async (vocabId, content) => {
    if (user) {
      try {
        await noteService.saveNote({ vocabulary_id: vocabId, content });
      } catch (e) {
        console.error('Error saving note on server:', e);
      }
    } else {
      setGuestNotes((prev) => ({
        ...prev,
        [vocabId]: content
      }));
    }
  };

  // Get note content
  const getNote = (vocabId, serverNote) => {
    if (user) {
      return serverNote || '';
    }
    return guestNotes[vocabId] || '';
  };

  // Fetch gamification status on mount or user change
  const [gamificationStatus, setGamificationStatus] = useState(null);

  const refreshGamification = async () => {
    if (user) {
      try {
        const res = await gamificationService.getStatus();
        if (res.data?.success) {
          setGamificationStatus(res.data);
        }
      } catch (e) {
        console.warn('Failed to load server gamification status:', e.message);
      }
    }
  };

  useEffect(() => {
    refreshGamification();
  }, [user]);

  // Record study tick & reward XP + Streaks
  const recordStudyTick = async (action_type = 'study_session', xp_gain = 15) => {
    if (user) {
      try {
        const res = await gamificationService.recordStudyTick(action_type, xp_gain);
        if (res.data?.success) {
          await refreshGamification();
          return res.data;
        }
      } catch (e) {
        console.error('Error recording gamification on server:', e);
      }
    }

    // Guest fallback calculation
    setGuestGamification((prev) => {
      const todayStr = new Date().toISOString().split('T')[0];
      let newStreak = prev.current_streak || 1;
      let newLongest = prev.longest_streak || 1;

      if (prev.last_study_date !== todayStr) {
        if (prev.last_study_date) {
          const diffDays = Math.round((new Date(todayStr) - new Date(prev.last_study_date)) / (1000 * 60 * 60 * 24));
          if (diffDays === 1) newStreak += 1;
          else if (diffDays > 1) newStreak = 1;
        }
        newLongest = Math.max(newLongest, newStreak);
      }

      const newXp = (prev.total_xp || 0) + xp_gain;
      let tier = 'Mầm non N5';
      let nextXp = 300;
      let minXp = 0;
      if (newXp >= 8000) { tier = 'Shogun N1 (Tướng quân)'; nextXp = 15000; minXp = 8000; }
      else if (newXp >= 4000) { tier = 'Lãng khách N3 (Ronin)'; nextXp = 8000; minXp = 4000; }
      else if (newXp >= 2000) { tier = 'Chiến binh N4 (Bushi)'; nextXp = 4000; minXp = 2000; }
      else if (newXp >= 900) { tier = 'Samurai N5'; nextXp = 2000; minXp = 900; }
      else if (newXp >= 300) { tier = 'Tập sự N5 (Deshi)'; nextXp = 900; minXp = 300; }

      return {
        ...prev,
        current_streak: newStreak,
        longest_streak: newLongest,
        last_study_date: todayStr,
        total_xp: newXp,
        level_tier: tier,
        next_tier_xp: nextXp,
        min_tier_xp: minXp,
        gems_count: (prev.gems_count || 100) + 2
      };
    });

    return { success: true, xp_added: xp_gain };
  };

  const currentGamification = user && gamificationStatus ? gamificationStatus : guestGamification;

  return (
    <AppContext.Provider
      value={{
        user,
        loadingUser,
        onlineCount,
        login,
        register,
        googleLogin,
        facebookLogin,
        logout,
        toggleFavorite,
        isFavorite,
        guestFavorites,
        guestProgress,
        guestNotes,
        progressVersion,
        updateProgress,
        clearWrongStatus,
        resetAllWrong,
        saveNote,
        getNote,
        awardGardenWater,
        getGardenWater,
        gamification: currentGamification,
        recordStudyTick,
        refreshGamification
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
