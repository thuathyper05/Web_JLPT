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

// Speech Synthesis Helper
export const speakJapanese = (text) => {
  if (!('speechSynthesis' in window)) {
    console.warn('Speech synthesis not supported in this browser.');
    return;
  }
  window.speechSynthesis.cancel(); // Stop any pending speech
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'ja-JP';
  utterance.rate = 0.85; // Slightly slower for clear learning
  
  // Try to find a Japanese voice
  const voices = window.speechSynthesis.getVoices();
  const jaVoice = voices.find(v => v.lang.startsWith('ja') || v.lang.includes('JP'));
  if (jaVoice) {
    utterance.voice = jaVoice;
  }
  window.speechSynthesis.speak(utterance);
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
