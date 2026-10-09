import axios from 'axios';

const resolveApiBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_BASE_URL;
  const isLocalHost = typeof window !== 'undefined' && 
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

  // If on cloud or mobile network, NEVER call localhost:5000
  if (!isLocalHost) {
    if (envUrl && !envUrl.includes('localhost') && !envUrl.includes('127.0.0.1')) {
      return envUrl;
    }
    return 'https://hyper-jlpt-api.onrender.com/api';
  }

  return envUrl || 'http://localhost:5000/api';
};

const API_BASE_URL = resolveApiBaseUrl();

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('jlpt_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// High-Fidelity Japanese Speech Synthesis Engine (Native Tokyo Pronunciation)
export const speakJapanese = (text) => {
  if (!text) return;
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    console.warn('Speech synthesis not supported on this device.');
    return;
  }

  // 1. Sanitize text for clean, natural Tokyo pronunciation
  let cleanText = String(text).trim();
  if (cleanText.includes('/')) cleanText = cleanText.split('/')[0].trim();
  if (cleanText.includes('、')) cleanText = cleanText.split('、')[0].trim();
  cleanText = cleanText
    .replace(/\([^)]*\)/g, '')
    .replace(/（[^）]*）/g, '')
    .replace(/\[[^\]]*\]/g, '')
    .replace(/【[^】]*】/g, '')
    .replace(/[~〜～\-—_*]/g, '')
    .trim();

  if (!cleanText) return;

  try {
    // 2. Stop any pending speech immediately
    window.speechSynthesis.cancel();

    // 3. Create utterance synchronously inside the user touch/click gesture
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'ja-JP';
    utterance.rate = 0.88; // Natural learning speed
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    // 4. Select the best native Japanese voice (Apple Kyoko/Otoya on iOS, Google 日本語 on Android, MS Nanami on PC)
    const setVoiceAndSpeak = () => {
      const voices = window.speechSynthesis.getVoices();
      if (voices && voices.length > 0) {
        const jaVoice = voices.find(v =>
          (v.lang === 'ja-JP' || v.lang === 'ja_JP' || v.lang.startsWith('ja')) &&
          !v.name.includes('Low Quality')
        ) || voices.find(v => v.lang.startsWith('ja'));

        if (jaVoice) {
          utterance.voice = jaVoice;
        }
      }
      window.speechSynthesis.speak(utterance);
    };

    const currentVoices = window.speechSynthesis.getVoices();
    if (currentVoices && currentVoices.length > 0) {
      setVoiceAndSpeak();
    } else {
      window.speechSynthesis.onvoiceschanged = () => {
        setVoiceAndSpeak();
      };
      // Immediate speak fallback
      window.speechSynthesis.speak(utterance);
    }
  } catch (err) {
    console.warn('Speech synthesis error:', err);
  }
};

// API Services
export const authService = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  googleLogin: (data) => api.post('/auth/google', data),
  facebookLogin: (data) => api.post('/auth/facebook', data),
  getMe: () => api.get('/auth/me'),
  forgotPassword: (data) => api.post('/auth/forgot-password', data),
  resetPassword: (data) => api.post('/auth/reset-password', data),
};

export const lessonService = {
  getLessons: () => api.get('/lessons'),
  getLessonById: (id) => api.get(`/lessons/${id}`),
};

export const vocabService = {
  getVocabularies: (params) => api.get('/vocabulary', { params }),
  getVocabularyById: (id) => api.get(`/vocabulary/${id}`),
  search: (query) => api.get('/vocabulary/search', { params: { q: query } }),
};

export const quizService = {
  getQuiz: (params) => api.get('/quizzes', { params }),
  submitQuiz: (data) => api.post('/quizzes/submit', data),
};

export const progressService = {
  getProgress: () => api.get('/progress'),
  updateProgress: (data) => api.post('/progress/update', data),
};

export const favoriteService = {
  getFavorites: (params) => api.get('/favorites', { params }),
  toggleFavorite: (vocabulary_id) => api.post('/favorites/toggle', { vocabulary_id }),
};

export const kanjiService = {
  getKanjiList: (params) => api.get('/kanji', { params }),
  getKanjiById: (id) => api.get(`/kanji/${id}`),
};

export const noteService = {
  getNotes: (params) => api.get('/notes', { params }),
  saveNote: (data) => api.post('/notes', data),
  deleteNote: (id) => api.delete(`/notes/${id}`),
};

// Isolated Admin Service
const getAdminHeaders = () => {
  const token = localStorage.getItem('hyper_admin_token') || localStorage.getItem('jlpt_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const adminService = {
  login: (credentials) => api.post('/admin/login', credentials),
  getMe: () => api.get('/admin/me', { headers: getAdminHeaders() }),
  getStats: () => api.get('/admin/stats', { headers: getAdminHeaders() }),
  getVocabularies: (params) => api.get('/admin/vocabularies', { params, headers: getAdminHeaders() }),
  createVocabulary: (data) => api.post('/admin/vocabularies', data, { headers: getAdminHeaders() }),
  updateVocabulary: (id, data) => api.put(`/admin/vocabularies/${id}`, data, { headers: getAdminHeaders() }),
  deleteVocabulary: (id) => api.delete(`/admin/vocabularies/${id}`, { headers: getAdminHeaders() }),
  getLessons: () => api.get('/admin/lessons', { headers: getAdminHeaders() }),
  updateLesson: (id, data) => api.put(`/admin/lessons/${id}`, data, { headers: getAdminHeaders() }),
  getKanji: (params) => api.get('/admin/kanji', { params, headers: getAdminHeaders() }),
  createKanji: (data) => api.post('/admin/kanji', data, { headers: getAdminHeaders() }),
  updateKanji: (id, data) => api.put(`/admin/kanji/${id}`, data, { headers: getAdminHeaders() }),
  deleteKanji: (id) => api.delete(`/admin/kanji/${id}`, { headers: getAdminHeaders() }),
  getUsers: (params) => api.get('/admin/users', { params, headers: getAdminHeaders() }),
  updateUserRole: (id, data) => api.put(`/admin/users/${id}/role`, data, { headers: getAdminHeaders() }),
  deleteUser: (id) => api.delete(`/admin/users/${id}`, { headers: getAdminHeaders() }),
  cleanDuplicates: () => api.post('/admin/clean-duplicates', {}, { headers: getAdminHeaders() }),
};

export default api;

