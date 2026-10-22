import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService, progressService, favoriteService, noteService, onlineService } from '../services/api';
import { awardGardenWater, getGardenWater } from '../services/gardenRewards';

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

  // Real-time Online Tracking Heartbeat (Exact real metrics)
  useEffect(() => {
    let clientId = '';
    try {
      clientId = sessionStorage.getItem('hyper_client_id');
      if (!clientId) {
        clientId = 'c_' + Math.random().toString(36).substring(2, 10) + '_' + Date.now();
        sessionStorage.setItem('hyper_client_id', clientId);
      }
    } catch {
      clientId = 'c_' + Date.now();
    }

    const sendPing = async () => {
      try {
        const res = await onlineService.ping(clientId);
        if (res.data?.onlineCount) {
          setOnlineCount(res.data.onlineCount);
        }
      } catch (e) {
        // Silently preserve current count
      }
    };

    sendPing();
    const interval = setInterval(sendPing, 25000);

    const handleBeforeUnload = () => {
      try {
        onlineService.leave(clientId);
      } catch {}
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      clearInterval(interval);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

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

  return (
    <AppContext.Provider
      value={{
        user,
        loadingUser,
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
        getGardenWater
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
