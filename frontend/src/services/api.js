import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

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

// Robust Japanese Speech Synthesis Engine with fallback and natural pitch
export const speakJapanese = (text) => {
  if (!text) return;
  if (!('speechSynthesis' in window)) {
    console.warn('Speech synthesis not supported.');
    return;
  }

  // Cancel any ongoing speech to prevent queue build-up
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'ja-JP';
  utterance.rate = 0.88; // Natural learning speed
  utterance.pitch = 1.0;

  const setVoice = () => {
    const voices = window.speechSynthesis.getVoices();
    // Prioritize high-quality Japanese voices (Google 日本語, Microsoft Nanami/Haruka/Ichiro, Apple Kyoko/Otoya)
    const jaVoice = voices.find(v => (v.lang === 'ja-JP' || v.lang === 'ja_JP' || v.lang.startsWith('ja')) && !v.name.includes('Low Quality'))
      || voices.find(v => v.lang.startsWith('ja'));

    if (jaVoice) {
      utterance.voice = jaVoice;
    }
  };

  setVoice();

  if (window.speechSynthesis.getVoices().length === 0) {
    window.speechSynthesis.onvoiceschanged = () => {
      setVoice();
      window.speechSynthesis.speak(utterance);
    };
  } else {
    window.speechSynthesis.speak(utterance);
  }
};

// API Services
export const authService = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getMe: () => api.get('/auth/me'),
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

export const noteService = {
  getNotes: (params) => api.get('/notes', { params }),
  saveNote: (data) => api.post('/notes', data),
  deleteNote: (id) => api.delete(`/notes/${id}`),
};

export default api;
