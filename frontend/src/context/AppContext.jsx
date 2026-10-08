import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService, progressService, favoriteService, noteService } from '../services/api';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

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

  const login = async (credentials) => {
    const res = await authService.login(credentials);
    localStorage.setItem('jlpt_token', res.data.token);
    setUser(res.data.user);
    return res.data;
  };

  const register = async (userData) => {
    const res = await authService.register(userData);
    localStorage.setItem('jlpt_token', res.data.token);
    setUser(res.data.user);
    return res.data;
  };

  const googleLogin = async (data) => {
    const res = await authService.googleLogin(data);
    localStorage.setItem('jlpt_token', res.data.token);
    setUser(res.data.user);
    return res.data;
  };

  const facebookLogin = async (data) => {
    const res = await authService.facebookLogin(data);
    localStorage.setItem('jlpt_token', res.data.token);
    setUser(res.data.user);
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('jlpt_token');
    setUser(null);
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
  const updateProgress = async (vocabId, status, isCorrect) => {
    if (user) {
      try {
        await progressService.updateProgress({ vocabulary_id: vocabId, status });
      } catch (e) {
        console.error('Error updating progress on server:', e);
      }
    } else {
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
    }
  };

  // Explicitly clear a wrong word from review list
  const clearWrongStatus = async (vocabId) => {
    await updateProgress(vocabId, 'mastered', true);
  };

  // Reset all wrong items
  const resetAllWrong = async () => {
    if (user) {
      // For logged in user, fetch current review words and mark each mastered
      try {
        const res = await vocabService.getVocabularies({ status: 'needs_review' });
        for (const item of res.data) {
          await progressService.updateProgress({ vocabulary_id: item.id, status: 'mastered' });
        }
      } catch (e) {
        console.error('Error resetting wrong words on server:', e);
      }
    } else {
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
        updateProgress,
        clearWrongStatus,
        resetAllWrong,
        saveNote,
        getNote
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
