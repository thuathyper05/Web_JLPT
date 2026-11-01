/**
 * AI Assistant Service for HYPER Japanese Learning WebApp
 * Powered by Google Gemini 3.5 Flash Lite and 3.8 Flash API
 * Multi-Key Auto Failover Pool (3 Keys Round-Robin and Token Exhaustion Protection)
 * Provides 100% REAL dynamic pedagogical AI analysis based on individual student progress
 */

const https = require('https');
const path = require('path');

// Load environment variables safely
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
require('dotenv').config();

// Primary and fallback models
const PRIMARY_MODEL = 'gemini-3.5-flash-lite';
const FALLBACK_MODEL = 'gemini-3.8-flash';

/**
 * Extracts and initializes the multi-key pool
 */
function initializeKeysPool() {
  const rawList = [];
  if (process.env.GEMINI_API_KEYS) {
    rawList.push(...process.env.GEMINI_API_KEYS.split(',').map((k) => k.trim()).filter(Boolean));
  }
  if (process.env.GEMINI_API_KEY_1) rawList.push(process.env.GEMINI_API_KEY_1.trim());
  if (process.env.GEMINI_API_KEY_2) rawList.push(process.env.GEMINI_API_KEY_2.trim());
  if (process.env.GEMINI_API_KEY_3) rawList.push(process.env.GEMINI_API_KEY_3.trim());
  if (process.env.GEMINI_API_KEY) rawList.push(process.env.GEMINI_API_KEY.trim());

  // Deduplicate while preserving order
  const uniqueKeys = [...new Set(rawList)].filter(Boolean);

  if (uniqueKeys.length === 0) {
    console.warn('[AI Pool Warning] Không tìm thấy API key trong file .env');
  } else {
    console.log(`[AI Pool] Đã nạp thành công ${uniqueKeys.length} API keys Gemini vào hệ thống luân phiên.`);
  }

  return uniqueKeys.map((key, idx) => ({
    id: idx + 1,
    key,
    keyMask: key.slice(0, 10) + '...',
    cooldownUntil: 0,
    failures: 0,
    successes: 0
  }));
}

// Pool state
const keyEntries = initializeKeysPool();
let currentPointer = 0;

/**
 * Gets the next available key using round-robin and cooldown checks
 */
function getNextAvailableKey() {
  if (keyEntries.length === 0) return null;

  const now = Date.now();
  // Try to find a healthy key starting from current pointer
  for (let i = 0; i < keyEntries.length; i++) {
    const candidateIndex = (currentPointer + i) % keyEntries.length;
    const entry = keyEntries[candidateIndex];
    if (entry.cooldownUntil <= now) {
      currentPointer = (candidateIndex + 1) % keyEntries.length;
      return entry;
    }
  }

  // If all keys are in cooldown, select the one that expires soonest
  let bestEntry = keyEntries[0];
  let earliest = keyEntries[0].cooldownUntil;
  for (let i = 1; i < keyEntries.length; i++) {
    if (keyEntries[i].cooldownUntil < earliest) {
      earliest = keyEntries[i].cooldownUntil;
      bestEntry = keyEntries[i];
    }
  }
  return bestEntry;
}

/**
 * Sanitizes and formats AI output:
 * - Strips all markdown asterisks (*, **, ***)
 * - Converts any arrows to words ('sang')
 * - Removes bullet symbols
 * - Enforces clean paragraph and example breaks
 */
function sanitizeAiText(raw) {
  if (!raw || typeof raw !== 'string') return '';
  let cleaned = raw;

  // Remove markdown headers
  cleaned = cleaned.replace(/^#{1,6}\s+/gm, '');

  // Strip excessive asterisks (***bold italic***, **bold**, *italic*)
  cleaned = cleaned.replace(/\*{1,3}([^*]+)\*{1,3}/g, '$1');
  cleaned = cleaned.replace(/\*/g, '');

  // Replace arrow symbols with Vietnamese transition words
  cleaned = cleaned.replace(/[\u2192\u2794]|-\x3E/g, ' sang ');

  // Remove bullet dots
  cleaned = cleaned.replace(/[\u2022\u25CF\u25AA]/g, '-');

  // Clean font encoding glitches and artifacts
  cleaned = cleaned.replace(/\uFFFD/g, '');

  // Format Japanese example line breaks if needed
  cleaned = cleaned.replace(/Câu tiếng Nhật:\s*/gi, '\nCâu tiếng Nhật: ');
  cleaned = cleaned.replace(/Cách đọc:\s*/gi, '\nCách đọc: ');
  cleaned = cleaned.replace(/Dịch nghĩa:\s*/gi, '\nDịch nghĩa: ');

  // Clean excessive blank lines
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n').trim();

  return cleaned;
}

/**
 * Low-level HTTP call to Gemini API for a single key attempt
 */
function executeGeminiRequest(apiKey, promptText, modelName) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      contents: [
        {
          parts: [{ text: promptText }]
        }
      ],
      generationConfig: {
        temperature: 0.5,
        maxOutputTokens: 1024
      }
    });

    const options = {
      hostname: 'generativelanguage.googleapis.com',
      path: `/v1beta/models/${modelName}:generateContent?key=${apiKey}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      },
      timeout: 20000
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          if (res.statusCode >= 200 && res.statusCode < 300) {
            const text = parsed?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (text) {
              return resolve({ text: sanitizeAiText(text), modelUsed: modelName });
            }
          }
          const errMsg = parsed?.error?.message || `HTTP ${res.statusCode}: ${body}`;
          const isQuota = res.statusCode === 429 || res.statusCode === 403 || /quota|exhausted|rate/i.test(errMsg);
          reject({ statusCode: res.statusCode, message: errMsg, isQuota });
        } catch (e) {
          reject({ statusCode: res.statusCode || 500, message: e.message, isQuota: false });
        }
      });
    });

    req.on('timeout', () => {
      req.destroy();
      reject({ statusCode: 408, message: 'Request timed out (20s)', isQuota: false });
    });

    req.on('error', (err) => {
      reject({ statusCode: 500, message: err.message, isQuota: false });
    });

    req.write(postData);
    req.end();
  });
}

/**
 * Multi-Key Round-Robin & Auto-Failover Execution Engine
 * Tries current active key. If quota exhausted or error, rotates immediately to backup key.
 */
async function callGemini(promptText, modelName = PRIMARY_MODEL) {
  if (keyEntries.length === 0) {
    throw new Error('Chưa cấu hình GEMINI_API_KEY trong .env');
  }

  const maxAttempts = Math.min(keyEntries.length, 3);
  let lastError = null;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const entry = getNextAvailableKey();
    if (!entry) break;

    try {
      const result = await executeGeminiRequest(entry.key, promptText, modelName);
      entry.successes += 1;
      return {
        ...result,
        keyIndex: entry.id
      };
    } catch (err) {
      entry.failures += 1;
      lastError = err;

      // If quota or rate limit, put key on cooldown for 60 seconds
      if (err.isQuota || err.statusCode === 429 || err.statusCode === 403) {
        entry.cooldownUntil = Date.now() + 60000;
        console.warn(`[AI Pool] Key #${entry.id} (${entry.keyMask}) chạm giới hạn token hoặc quota (HTTP ${err.statusCode}). Tự động chuyển luân phiên sang Key backup tiếp theo...`);
      } else {
        console.warn(`[AI Pool] Key #${entry.id} gặp sự cố (${err.message}). Đang chuyển sang Key kế tiếp...`);
      }
    }
  }

  // If primary model failed across keys, try fallback model once
  if (modelName === PRIMARY_MODEL) {
    console.warn(`[AI Pool] Toàn bộ keys trên model ${PRIMARY_MODEL} gặp sự cố, thử nghiệm fallback sang ${FALLBACK_MODEL}...`);
    return callGemini(promptText, FALLBACK_MODEL);
  }

  throw new Error(lastError ? lastError.message : 'Tất cả API keys đều tạm thời hết hạn mức quota.');
}

// Parses sentence grammar breakdown from AI output
function parseSentenceAnalysis(text, original) {
  let translation = '';
  const breakdown = [];
  let advice = '';

  const transMatch = text.match(/(?:Dịch nghĩa|Nghĩa là|Dịch):\s*([^\n]+)/i);
  if (transMatch) translation = transMatch[1].trim();

  const adviceMatch = text.match(/(?:Lời khuyên(?: của Sensei)?|Lưu ý):\s*([^\n]+(?:\n[^\n]+)?)/i);
  if (adviceMatch) advice = adviceMatch[1].trim();

  const lines = text.split('\n');
  for (const line of lines) {
    const bMatch = line.match(/^[-*]\s*([^(:]+)(?:\(([^)]+)\))?:\s*(.+)$/);
    if (bMatch) {
      breakdown.push({
        part: bMatch[1].trim(),
        text: bMatch[2] ? bMatch[2].trim() : bMatch[1].trim(),
        note: bMatch[3].trim()
      });
    }
  }

  return {
    original: original || 'Câu tiếng Nhật',
    translation: translation || 'Dịch nghĩa chuẩn tiếng Việt',
    breakdown: breakdown.length > 0 ? breakdown : [
      { part: 'Ngữ pháp', text: original || 'Câu tiếng Nhật', note: 'Phân tích thành phần câu hoàn chỉnh' }
    ],
    advice: advice || 'Chú ý chia đuôi động từ và chọn trợ từ chính xác theo ngữ cảnh.',
    explanation: text
  };
}

// Parses study roadmap phases and diagnosis
function parseRoadmapDiagnosis(text, targetDays = 30, targetHours = 0.5) {
  const phases = [];
  let dailyRoutine = `Dành ${targetHours} giờ mỗi ngày luyện 1 bài Minna và 10 từ vựng phản xạ.`;

  const routineMatch = text.match(/(?:Thói quen mỗi ngày|Luyện tập hàng ngày|Mỗi ngày):\s*([^\n]+)/i);
  if (routineMatch) dailyRoutine = routineMatch[1].trim();

  const lines = text.split('\n');
  for (const line of lines) {
    const pMatch = line.match(/(?:Giai đoạn|Tuần|Chặng)\s*(\d+|[1-4]|I|II|III):\s*([^:\-]+)(?:[:\-]\s*(.+))?/i);
    if (pMatch) {
      phases.push({
        phase: `Giai đoạn ${pMatch[1]}`,
        focus: pMatch[2].trim(),
        goal: pMatch[3] ? pMatch[3].trim() : 'Nắm vững kiến thức trọng tâm bài học'
      });
    }
  }

  if (phases.length === 0) {
    phases.push(
      { phase: 'Giai đoạn 1 (Khởi động)', focus: 'Từ vựng & Trợ từ nền tảng', goal: 'Thuộc từ vựng cốt lõi và các trợ từ cơ bản qua flashcard' },
      { phase: 'Giai đoạn 2 (Bứt phá)', focus: 'Chia động từ & Mẫu câu Minna', goal: 'Luyện gõ Romaji và thuộc làu các thể Te, Nai, Ta' },
      { phase: 'Giai đoạn 3 (Về đích)', focus: 'Luyện nghe Choukai & Thi thử', goal: 'Tự tin đạt điểm tối đa phần nghe hiểu và ngữ pháp' }
    );
  }

  return {
    title: `Lộ trình chinh phục JLPT (${targetDays} Ngày)`,
    target: `Mục tiêu: Hoàn thành trong ${targetDays} ngày (mỗi ngày ${targetHours} giờ)`,
    phases,
    daily_routine: dailyRoutine,
    aiAdvice: text
  };
}

/**
 * Builds system prompt and context for Gemini based on action and user progress
 */
async function generateAiResponse({ action, prompt, context, userProgress, username }) {
  const normalizedAction = action || 'chat';

  // Base Teacher Persona Instruction
  const baseInstruction = `Bạn là AI Sensei - chuyên gia sư phạm tiếng Nhật hàng đầu của hệ thống HYPER Japanese.
QUY TẮC TRẢ LỜI BẮT BUỘC:
1. ĐÚNG CHUẨN XÁC: Kiến thức ngữ pháp, từ vựng, phát âm theo chuẩn Tokyo và giáo trình chuẩn JLPT.
2. DỄ HIỂU VÀ NGẮN GỌN: Đi thẳng vào trọng tâm, giải thích mạch lạc, súc tích, dễ hiểu cho người mới học. Mỗi ý tối đa 1-2 câu, tuyệt đối không viết văn hoa dài dòng dư thừa.
3. TUYỆT ĐỐI KHÔNG DÙNG DẤU HOA THỊ (*) VÀ KHÔNG DÙNG DẤU MŨI TÊN. Dùng các con số 1, 2, 3 hoặc gạch ngang (-) cho các ý.
4. KHI ĐƯA RA VÍ DỤ BẮT BUỘC TRÌNH BÀY XUỐNG DÒNG RIÊNG BIỆT:
   Câu tiếng Nhật: [Câu Kanji và Kana]
   Cách đọc: [Romaji hoặc Hiragana]
   Dịch nghĩa: [Tiếng Việt]
5. KHÔNG VIẾT KHỐI VĂN NÉN: Tách các ý bằng dòng trắng rõ ràng để người học dễ đọc.`;

  let userPrompt = '';

  if (normalizedAction === 'user_diagnosis') {
    const masteredCount = userProgress?.masteredCount || 0;
    const reviewWords = userProgress?.reviewWords || [];
    const streak = userProgress?.streak || 0;
    const activeLesson = userProgress?.activeLesson || 1;

    userPrompt = `${baseInstruction}
Nhiệm vụ: Bạn hãy phân tích dữ liệu học tập thực tế của học viên "${username || 'Học viên'}":
- Đang học ở: Bài ${activeLesson} Minna no Nihongo.
- Chuỗi học tập: ${streak} ngày liên tục.
- Đã nắm vững: ${masteredCount} từ vựng.
- Danh sách từ vựng đang bị sai hoặc cần ôn lại: ${reviewWords.length > 0 ? reviewWords.slice(0, 8).join(', ') : 'Chưa có từ nào bị đánh dấu sai'}.

Hãy tự phân tích và phản hồi ngắn gọn:
1. Nhận xét chân thực về phong độ phản xạ hiện tại (1-2 câu).
2. Lời khuyên cụ thể để khắc phục các từ hay quên ở trên.
3. Bài tập phản xạ 10 phút phù hợp cho hôm nay.`;
  } else if (normalizedAction === 'analyze_sentence') {
    const sentence = prompt || context?.sentence || '';
    userPrompt = `${baseInstruction}
Nhiệm vụ: Phân tích chi tiết cấu trúc ngữ pháp câu tiếng Nhật: "${sentence}"
Yêu cầu phân tích:
1. Dịch nghĩa tiếng Việt chuẩn xác.
2. Phân tích ngữ pháp từng thành phần trong câu (trình bày theo từng dòng gạch đầu dòng dạng: - [Thành phần] ([Cách đọc]): [Giải thích chức năng]).
3. Lời khuyên của Sensei về ngữ cảnh sử dụng và lỗi người học hay gặp.`;
  } else if (normalizedAction === 'free_question') {
    const wordTitle = context?.word_title || context?.word || '';
    const q = context?.question || prompt;
    userPrompt = `${baseInstruction}
Học viên đang học về 「${wordTitle}」 và đặt câu hỏi cho AI Sensei:
Câu hỏi của học viên: "${q}"

Nhiệm vụ: Hãy trả lời câu hỏi của học viên một cách chính xác, ngắn gọn, súc tích, đi thẳng vào trọng tâm, nêu rõ ngữ cảnh giao tiếp thực tế và ví dụ minh họa nếu cần (trình bày ví dụ xuống dòng rõ ràng: Câu tiếng Nhật, Cách đọc, Dịch nghĩa).`;
  } else if (normalizedAction === 'explain_vocab') {
    const word = context?.kanji || context?.word || context?.clean_kana || prompt;
    const kana = context?.clean_kana || context?.kana || '';
    const meaning = context?.clean_vietnamese || context?.vietnamese || context?.meaning || '';

    userPrompt = `${baseInstruction}
Nhiệm vụ: Phân tích từ vựng 「${word}」 (Đọc là: ${kana}, nghĩa: ${meaning}):
1. Ý nghĩa cốt lõi và sắc thái giao tiếp chuẩn của người Nhật (1 câu).
2. Mẹo ghi nhớ siêu tốc (tượng hình Hán tự hoặc liên tưởng âm).
3. 1 câu ví dụ thực tế (trình bày xuống dòng đúng 3 dòng: Câu tiếng Nhật, Cách đọc, Dịch nghĩa).`;
  } else if (normalizedAction === 'explain_kanji') {
    const kanji = context?.kanji || prompt;
    const hanViet = context?.han_viet || '';
    const meaning = context?.meaning || '';

    userPrompt = `${baseInstruction}
Nhiệm vụ: Phân tích Hán tự 「${kanji}」 (Âm Hán Việt: ${hanViet}, Nghĩa: ${meaning}):
1. Câu chuyện hình ảnh tượng hình giúp nhớ mặt chữ ngay lập tức.
2. Âm On và Kun thông dụng kèm 1 từ ghép thông dụng nhất.
3. 1 câu ví dụ thực tế (trình bày xuống dòng đúng 3 dòng: Câu tiếng Nhật, Cách đọc, Dịch nghĩa).`;
  } else if (normalizedAction === 'explain_particle') {
    const particle = context?.particle || prompt;
    const title = context?.title || `Trợ từ 「${particle}」`;

    userPrompt = `${baseInstruction}
Nhiệm vụ: Phân tích bản chất trợ từ ${title}:
1. Công dụng chính và điểm mấu chốt để không dùng sai (1-2 câu).
2. Bẫy nhầm lẫn điển hình trong đề thi JLPT.
3. 2 câu ví dụ ngắn (mỗi ví dụ trình bày xuống dòng đúng 3 dòng: Câu tiếng Nhật, Cách đọc, Dịch nghĩa).`;
  } else if (normalizedAction === 'explain_quiz' || normalizedAction === 'explain_listening') {
    const question = context?.question || prompt;
    const correctAnswer = context?.correct_answer || context?.correctAnswer || '';
    const dialogue = context?.audioText || context?.dialogue || '';

    userPrompt = `${baseInstruction}
Nhiệm vụ: Phân tích câu hỏi kiểm tra:
Câu hỏi: "${question}"
Đáp án đúng: "${correctAnswer}"
${dialogue ? `Nội dung hội thoại: "${dialogue}"` : ''}

Hãy giải thích:
1. Tại sao đáp án trên là đáp án chính xác (giải thích ngắn gọn).
2. Từ khóa mấu chốt (Keyword) trong bài nghe hoặc câu hỏi giúp chọn nhanh trong 5 giây.
3. Bẫy thường gặp của câu này để tránh mất điểm.`;
  } else if (normalizedAction === 'summarize_article') {
    const title = context?.title || '';
    const content = context?.content || prompt;

    userPrompt = `${baseInstruction}
Nhiệm vụ: Bạn là chuyên gia Nhật ngữ và cố vấn giáo dục. Hãy phân tích bài viết tin tức:
Tiêu đề: "${title}"
Nội dung: "${content}"

Hãy trình bày súc tích:
1. 3 điểm mấu chốt quan trọng nhất người đọc cần ghi nhớ.
2. Trích xuất 4 từ vựng tiếng Nhật tiêu biểu liên quan (kèm Kanji, Furigana, và nghĩa tiếng Việt).
3. Lời khuyên định hướng của Sensei dành cho người học tiếng Nhật.`;
  } else {
    // General chat
    userPrompt = `${baseInstruction}
Học viên hỏi: "${prompt}"
Hãy giải đáp cụ thể, thân thiện, súc tích, đi thẳng vào bản chất, trình bày ví dụ xuống dòng rõ ràng nếu có.`;
  }

  try {
    const { text: rawAiText, modelUsed, keyIndex } = await callGemini(userPrompt);
    const sanitizedText = sanitizeAiText(rawAiText);

    let extraData = {};
    if (normalizedAction === 'analyze_sentence') {
      extraData = parseSentenceAnalysis(sanitizedText, prompt || context?.sentence);
    } else if (normalizedAction === 'user_diagnosis') {
      extraData = parseRoadmapDiagnosis(sanitizedText);
    }

    return {
      success: true,
      data: {
        title: `AI Sensei: ${context?.word || context?.kanji || context?.title || context?.word_title || 'Phân Tích Chuyên Sâu'}`,
        explanation: sanitizedText,
        nuance: sanitizedText,
        answer: sanitizedText,
        reply: sanitizedText,
        aiGenerated: true,
        model: modelUsed,
        keyIndex,
        ...extraData
      }
    };
  } catch (error) {
    console.error('Gemini API pool call failed:', error.message);
    const wordKey = context?.kanji || context?.word || context?.word_title || prompt;
    return {
      success: true,
      data: {
        title: `AI Sensei: ${wordKey || 'Hỗ Trợ Học Tập'}`,
        explanation: `AI Sensei hướng dẫn:\nKhi học từ vựng 「${wordKey}」, bí quyết ghi nhớ bền vững là đọc to thành tiếng theo ngữ điệu Tokyo Pitch Accent và đặt từ vào câu hoàn chỉnh mỗi ngày.\n\nCâu tiếng Nhật: 「${wordKey}」を毎日使います。\nCách đọc: Mainichi tsukaimasu.\nDịch nghĩa: Tôi sử dụng hàng ngày.`,
        nuance: 'Từ vựng cốt lõi thường gặp trong các đề thi năng lực JLPT.',
        answer: `AI Sensei ghi nhận thắc mắc về 「${wordKey}」. Hãy kết hợp luyện nghe và nhắc lại theo phương pháp Shadowing nhé!`,
        reply: `AI Sensei ghi nhận thắc mắc về 「${wordKey}」. Hãy kết hợp luyện nghe và nhắc lại theo phương pháp Shadowing nhé!`,
        aiGenerated: false,
        error: error.message
      }
    };
  }
}

module.exports = {
  generateAiResponse,
  sanitizeAiText,
  callGemini
};
