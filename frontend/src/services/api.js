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

// Native High-Quality Tokyo Japanese Speech Synthesis
export const speakJapanese = (text) => {
  if (typeof window === 'undefined' || !window.speechSynthesis || !text) return;

  try {
    window.speechSynthesis.cancel(); // Stop any pending speech
    const cleanText = text.replace(/[［\[］\]()]/g, '').trim();
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'ja-JP';
    utterance.rate = 0.9; // Slightly slower for clear learning
    utterance.pitch = 1.05;

    // Pick a high quality Tokyo/Japanese voice if available
    const voices = window.speechSynthesis.getVoices();
    const jaVoice = voices.find(v => v.lang.startsWith('ja') && (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Kyoko') || v.name.includes('Otoya')));
    if (jaVoice) {
      utterance.voice = jaVoice;
    }

    window.speechSynthesis.speak(utterance);
  } catch (err) {
    console.warn('Speech synthesis warning:', err);
  }
};

export const authService = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  forgotPassword: (data) => api.post('/auth/forgot-password', data),
  getMe: () => api.get('/auth/me'),
};

export const lessonService = {
  getLessons: () => api.get('/lessons'),
  getLesson: (id) => api.get(`/lessons/${id}`),
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
  getParticles: () => api.get('/particles'),
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

export default api;
