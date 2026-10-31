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

// Stop any active speech synthesis
export const stopSpeaking = () => {
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
};

// Splits AI pedagogical text into bilingual segments: Japanese and Vietnamese
export const splitBilingualText = (raw) => {
  if (!raw) return [];
  const lines = raw.toString().split(/\r?\n/);
  const segments = [];

  const isJapaneseText = (str) => /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/.test(str);
  const hasViAccents = (str) => /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i.test(str);

  for (let line of lines) {
    line = line.trim();
    if (!line) continue;

    // Line with 'Câu tiếng Nhật:'
    const jpMatch = line.match(/^(?:Câu tiếng Nhật|Ví dụ tiếng Nhật|Tiếng Nhật):\s*(.+)$/i);
    if (jpMatch) {
      segments.push({ lang: 'vi-VN', text: 'Câu tiếng Nhật:' });
      segments.push({ lang: 'ja-JP', text: jpMatch[1].trim() });
      continue;
    }

    // Line with 'Cách đọc:'
    const cdMatch = line.match(/^(?:Cách đọc|Romaji):\s*(.+)$/i);
    if (cdMatch) {
      segments.push({ lang: 'vi-VN', text: 'Cách đọc:' });
      segments.push({ lang: 'ja-JP', text: cdMatch[1].trim() });
      continue;
    }

    // Line with 'Dịch nghĩa:'
    const viMatch = line.match(/^(?:Dịch nghĩa|Ý nghĩa|Nghĩa là):\s*(.+)$/i);
    if (viMatch) {
      segments.push({ lang: 'vi-VN', text: 'Dịch nghĩa: ' + viMatch[1].trim() });
      continue;
    }

    // Pure Japanese line
    if (isJapaneseText(line) && !hasViAccents(line)) {
      segments.push({ lang: 'ja-JP', text: line });
      continue;
    }

    // Line with Japanese quotes
    const parts = line.split(/([「『][^」』]+[」』])/g);
    for (const part of parts) {
      const p = part.trim();
      if (!p) continue;
      if (p.startsWith('「') || p.startsWith('『')) {
        const inner = p.slice(1, -1).trim();
        if (isJapaneseText(inner)) {
          segments.push({ lang: 'ja-JP', text: inner });
        } else {
          segments.push({ lang: 'vi-VN', text: inner });
        }
      } else {
        segments.push({ lang: 'vi-VN', text: p });
      }
    }
  }

  // Merge adjacent same-language segments to ensure smooth playback
  const merged = [];
  for (const s of segments) {
    const cleanText = s.text.replace(/[\*#]/g, '').trim();
    if (!cleanText) continue;
    if (merged.length > 0 && merged[merged.length - 1].lang === s.lang) {
      merged[merged.length - 1].text += ' ' + cleanText;
    } else {
      merged.push({ lang: s.lang, text: cleanText });
    }
  }
  return merged;
};

// Bilingual Speech Engine: Pronounces Japanese phrases with Tokyo TTS and Vietnamese with Vietnamese TTS
export const speakBilingualText = (text, onEndCallback = null) => {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;

  try {
    window.speechSynthesis.cancel();
    const segments = splitBilingualText(text);
    if (segments.length === 0) return;

    const voices = window.speechSynthesis.getVoices();
    const jaVoices = voices.filter((v) => v.lang === 'ja-JP' || v.lang === 'ja_JP' || v.lang.startsWith('ja'));
    const viVoices = voices.filter((v) => v.lang === 'vi-VN' || v.lang === 'vi_VN' || v.lang.startsWith('vi'));

    const preferredJaVoice = jaVoices.find((v) =>
      v.name.includes('Google') ||
      v.name.includes('Nanami') ||
      v.name.includes('Kyoko') ||
      v.name.includes('Ayumi') ||
      v.name.includes('Haruka')
    ) || jaVoices[0];

    const preferredViVoice = viVoices.find((v) =>
      v.name.includes('Google') ||
      v.name.includes('An') ||
      v.name.includes('HoaiMy') ||
      v.name.includes('Linh')
    ) || viVoices[0];

    segments.forEach((seg, index) => {
      const utterance = new SpeechSynthesisUtterance(seg.text);
      if (seg.lang === 'ja-JP') {
        utterance.lang = 'ja-JP';
        utterance.rate = 0.88;
        utterance.pitch = 1.0;
        if (preferredJaVoice) utterance.voice = preferredJaVoice;
      } else {
        utterance.lang = 'vi-VN';
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        if (preferredViVoice) utterance.voice = preferredViVoice;
      }

      if (index === segments.length - 1) {
        utterance.onend = () => {
          if (onEndCallback) onEndCallback();
        };
        utterance.onerror = () => {
          if (onEndCallback) onEndCallback();
        };
      }

      window.speechSynthesis.speak(utterance);
    });
  } catch (err) {
    console.warn('Bilingual speech synthesis error:', err);
    if (onEndCallback) onEndCallback();
  }
};

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
