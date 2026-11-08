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

// Active audio stream and utterance references to prevent GC cutoff
let activeAudio = null;
let currentUtterance = null;

// Stop any active speech or audio playback
export const stopSpeaking = () => {
  if (activeAudio) {
    try {
      activeAudio.pause();
      activeAudio.currentTime = 0;
    } catch {}
    activeAudio = null;
  }
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    try {
      window.speechSynthesis.cancel();
    } catch {}
    currentUtterance = null;
  }
};

// Voice cache to ensure browser has loaded voice list
let cachedVoices = [];
const loadVoices = () => {
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    cachedVoices = window.speechSynthesis.getVoices();
  }
};
if (typeof window !== 'undefined' && window.speechSynthesis) {
  loadVoices();
  window.speechSynthesis.onvoiceschanged = loadVoices;
}

// Splits AI pedagogical text into bilingual segments: Japanese and Vietnamese
export const splitBilingualText = (raw) => {
  if (!raw) return [];
  // Clean markdown bold, asterisks, hashtags and symbols that confuse TTS
  const cleanRaw = raw
    .toString()
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/[`~]/g, '')
    .replace(/[\u2022\u2605\u2713]/g, '');

  const lines = cleanRaw.split(/\r?\n/);
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

    // Line with Japanese quotes or parentheses
    const parts = line.split(/([「『][^」』]+[」』]|\([^\)]*[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]+[^\)]*\))/g);
    for (const part of parts) {
      const p = part.trim();
      if (!p) continue;
      if (p.startsWith('「') || p.startsWith('『')) {
        const inner = p.slice(1, -1).trim();
        if (isJapaneseText(inner) && !hasViAccents(inner)) {
          segments.push({ lang: 'ja-JP', text: inner });
        } else {
          segments.push({ lang: 'vi-VN', text: inner });
        }
      } else if (p.startsWith('(') && p.endsWith(')')) {
        const inner = p.slice(1, -1).trim();
        if (isJapaneseText(inner) && !hasViAccents(inner)) {
          segments.push({ lang: 'ja-JP', text: inner });
        } else {
          segments.push({ lang: 'vi-VN', text: inner });
        }
      } else {
        // If part contains standalone Japanese words interspersed with Vietnamese
        const subTokens = p.split(/([\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]{2,})/g);
        for (const sub of subTokens) {
          const s = sub.trim();
          if (!s) continue;
          if (isJapaneseText(s) && !hasViAccents(s)) {
            segments.push({ lang: 'ja-JP', text: s });
          } else {
            segments.push({ lang: 'vi-VN', text: s });
          }
        }
      }
    }
  }

  // Merge adjacent same-language segments to ensure smooth, natural playback
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
    if (segments.length === 0) {
      if (onEndCallback) onEndCallback();
      return;
    }

    const voices = cachedVoices.length > 0 ? cachedVoices : window.speechSynthesis.getVoices();
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

// Native Studio-Quality Tokyo Japanese Audio & Speech Synthesis Engine
// Combines official Google Tokyo MP3 audio stream with robust offline Web Speech fallback
export const speakJapanese = (text, kanaAlternative = null, rate = 1.0) => {
  if (typeof window === 'undefined') return;

  stopSpeaking();

  let actualKana = kanaAlternative;
  let actualRate = rate;

  if (typeof kanaAlternative === 'number') {
    actualRate = kanaAlternative;
    actualKana = null;
  }

  // Pre-process and clean text
  let raw = (actualKana || text || '').toString().trim();
  if (!raw) return;

  // If text is a full sentence with Kanji, prefer sentence context for natural intonation
  if (text && (text.includes('。') || text.includes('、') || text.length > 15)) {
    raw = text.toString().trim();
  }

  // Clean brackets, parentheses, notes and markdown
  let clean = raw
    .replace(/[［\[］\]]/g, '')
    .replace(/\([^\)]*\)/g, '')
    .replace(/（[^）]*）/g, '')
    .replace(/[\/／]/g, '。 ')
    .replace(/[*_~`#]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  // Handle special isolated grammatical particle readings
  if (clean === 'は') clean = 'わ';
  else if (clean === 'へ') clean = 'え';
  else if (clean === 'を') clean = 'お';

  if (!clean) return;

  // Primary: Native Studio Tokyo Japanese Audio via /api/tts
  try {
    const audioUrl = `/api/tts?text=${encodeURIComponent(clean)}&lang=ja`;
    const audio = new Audio(audioUrl);
    activeAudio = audio;

    if (actualRate && actualRate !== 1.0) {
      audio.playbackRate = Math.max(0.7, Math.min(1.5, actualRate));
    }

    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch((err) => {
        // Fallback to Web Speech API if audio stream blocked or device is offline
        fallbackSpeechSynthesis(clean, actualRate);
      });
    }
  } catch (err) {
    fallbackSpeechSynthesis(clean, actualRate);
  }
};

// Robust Web Speech API fallback with garbage collection protection
function fallbackSpeechSynthesis(text, rate = 0.9) {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;

  try {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    currentUtterance = utterance; // Prevent garbage collection mid-speech in Chrome

    utterance.lang = 'ja-JP';
    utterance.rate = rate || 0.9;
    utterance.pitch = 1.0;

    const voices = cachedVoices.length > 0 ? cachedVoices : window.speechSynthesis.getVoices();
    const jaVoices = voices.filter(
      (v) => v.lang === 'ja-JP' || v.lang === 'ja_JP' || v.lang.startsWith('ja')
    );
    const preferredVoice =
      jaVoices.find(
        (v) =>
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

    utterance.onend = () => {
      currentUtterance = null;
    };
    utterance.onerror = () => {
      currentUtterance = null;
    };

    window.speechSynthesis.speak(utterance);
  } catch (e) {
    console.warn('SpeechSynthesis fallback error:', e);
  }
}

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
  getExercises: (params) => api.get('/particles/exercises', { params }),
};

export const quizService = {
  generateQuiz: (params) => api.get('/quiz/generate', { params }),
};

export const progressService = {
  getProgress: () => api.get('/progress'),
  recordTick: (data) => api.post('/progress/tick', data),
  syncProgress: (data) => api.post('/progress/sync', data),
};

export const aiService = {
  query: function (data) {
    return api.post('/ai/query', data, { timeout: 30000 });
  },
};

export const forumService = {
  getArticles: (params) => api.get('/forum/articles', { params }),
  getArticle: (id) => api.get(`/forum/articles/${id}`),
  addComment: (id, data) => api.post(`/forum/articles/${id}/comments`, data),
  getReviews: () => api.get('/forum/reviews'),
  addReview: (data) => api.post('/forum/reviews', data),
  getCenters: (params) => api.get('/forum/centers', { params }),
  crawlNews: (count = 3) => api.post('/forum/crawl', { count }),
  getStatus: () => api.get('/forum/status'),
};

export const dictionaryService = {
  search: (params) => api.get('/dictionary/search', { params }),
};

export const supportService = {
  sendFeedback: (data) => api.post('/support/feedback', data),
};

export { api };
export default api;
