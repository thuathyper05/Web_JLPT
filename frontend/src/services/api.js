import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
});

// Attach token if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('nihongo_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Native High-Quality Tokyo Japanese Speech Synthesis Engine
// Prioritizes clean phonetic Kana reading first to eliminate Kanji mispronunciation
export const speakJapanese = (text, kanaAlternative = null, rate = 0.88) => {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;

  // Use pure Hiragana/Katakana phonetic reading first for 100% accurate Tokyo pronunciation
  const toSpeak = (kanaAlternative || text || '')
    .toString()
    .replace(/[［\[］\]()（）／/・·\-\*]/g, '')
    .trim();

  if (!toSpeak) return;

  try {
    window.speechSynthesis.cancel(); // Stop any pending speech
    const utterance = new SpeechSynthesisUtterance(toSpeak);
    utterance.lang = 'ja-JP';
    utterance.rate = rate; // Clear, natural listening pace
    utterance.pitch = 1.0;

    // Pick top-tier standard Tokyo Japanese voice if available
    const voices = window.speechSynthesis.getVoices();
    const jaVoices = voices.filter(v => v.lang === 'ja-JP' || v.lang === 'ja_JP' || v.lang.startsWith('ja'));
    const preferredVoice = jaVoices.find(v => 
      v.name.includes('Natural') || 
      v.name.includes('Google') || 
      v.name.includes('Nanami') || 
      v.name.includes('Kyoko') || 
      v.name.includes('Ayumi') ||
      v.name.includes('Haruka') ||
      v.name.includes('Otoya')
    ) || jaVoices[0];

    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    window.speechSynthesis.speak(utterance);
  } catch (err) {
    console.warn('Speech synthesis warning:', err);
  }
};

export const authService = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  socialLogin: (data) => api.post('/auth/social-login', data),
  sendOtp: (data) => api.post('/auth/send-otp', data),
  resetPasswordOtp: (data) => api.post('/auth/reset-password-otp', data),
  forgotPassword: (data) => api.post('/auth/send-otp', data),
  getMe: () => api.get('/auth/me'),
};

export const lessonService = {
  getLessons: (params) => api.get('/lessons', { params }),
  getLesson: (id, params) => api.get(`/lessons/${id}`, { params }),
};

export const vocabService = {
  getVocabularies: (params) => api.get('/vocabularies', { params }),
};

export const kanjiService = {
  getKanji: (params) => api.get('/kanji', { params }),
};

export const grammarService = {
  getGrammar: (params) => api.get('/grammar', { params }),
};

export const particlesService = {
  getParticles: (params) => api.get('/particles', { params }),
};

export const quizService = {
  generateQuiz: (params) => api.get('/quiz/generate', { params }),
};

export const progressService = {
  getProgress: () => api.get('/progress'),
  recordTick: (data) => api.post('/progress/tick', data),
};

export const aiService = {
  query: (data) => api.post('/ai/query', data),
};

export const forumService = {
  getArticles: (params) => api.get('/forum/articles', { params }),
  getArticle: (id) => api.get(`/forum/articles/${id}`),
  addComment: (id, data) => api.post(`/forum/articles/${id}/comments`, data),
  getReviews: () => api.get('/forum/reviews'),
  addReview: (data) => api.post('/forum/reviews', data),
};

export default api;
