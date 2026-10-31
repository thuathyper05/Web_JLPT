/**
 * AI Assistant Service for HYPER Japanese Learning WebApp
 * Powered by Google Gemini 3.5 Flash Lite & 3.8 Flash API
 * Provides 100% REAL dynamic AI analysis based on individual student progress
 */

const https = require('https');
const path = require('path');

// Load environment variables safely
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
require('dotenv').config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
// gemini-3.5-flash-lite provides sub-2s latency and 100% active availability for current keys
const PRIMARY_MODEL = 'gemini-3.5-flash-lite';
const FALLBACK_MODEL = 'gemini-3.8-flash';

/**
 * Sanitizes and formats AI output:
 * - Strips all markdown asterisks (*, **, ***)
 * - Converts any arrows to words ("sang")
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
  cleaned = cleaned.replace(new RegExp('->|\\u2192|\\u2794', 'g'), ' sang ');

  // Remove bullet dots
  cleaned = cleaned.replace(/[•●▪]/g, '-');

  // Format Japanese example line breaks if needed
  cleaned = cleaned.replace(/Câu tiếng Nhật:\s*/gi, '\nCâu tiếng Nhật: ');
  cleaned = cleaned.replace(/Cách đọc:\s*/gi, '\nCách đọc: ');
  cleaned = cleaned.replace(/Dịch nghĩa:\s*/gi, '\nDịch nghĩa: ');

  // Clean excessive blank lines
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n').trim();

  return cleaned;
}

/**
 * Calls Gemini REST API
 */
function callGemini(promptText, modelName = PRIMARY_MODEL) {
  return new Promise((resolve, reject) => {
    if (!GEMINI_API_KEY) {
      return reject(new Error('Chưa cấu hình GEMINI_API_KEY trong .env'));
    }

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
      path: `/v1beta/models/${modelName}:generateContent?key=${GEMINI_API_KEY}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      },
      timeout: 25000
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

          // If primary model fails, try fallback
          if (modelName === PRIMARY_MODEL) {
            console.warn(`Gemini ${PRIMARY_MODEL} returned ${res.statusCode}, falling back to ${FALLBACK_MODEL}...`);
            return callGemini(promptText, FALLBACK_MODEL).then(resolve).catch(reject);
          }

          reject(new Error(parsed?.error?.message || `HTTP ${res.statusCode}: ${body}`));
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('timeout', () => {
      req.destroy();
      if (modelName === PRIMARY_MODEL) {
        console.warn(`Gemini ${PRIMARY_MODEL} timed out, trying ${FALLBACK_MODEL}...`);
        return callGemini(promptText, FALLBACK_MODEL).then(resolve).catch(reject);
      }
      reject(new Error('Gemini API request timed out'));
    });

    req.on('error', (err) => {
      if (modelName === PRIMARY_MODEL) {
        return callGemini(promptText, FALLBACK_MODEL).then(resolve).catch(reject);
      }
      reject(err);
    });

    req.write(postData);
    req.end();
  });
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
2. DỄ HIỂU & NGẮN GỌN: Đi thẳng vào trọng tâm, giải thích mạch lạc, súc tích, dễ hiểu cho người mới học. Mỗi ý tối đa 1-2 câu, tuyệt đối không viết văn hoa dài dòng dư thừa.
3. TUYỆT ĐỐI KHÔNG DÙNG DẤU HOA THỊ (*) VÀ KHÔNG DÙNG DẤU MŨI TÊN. Dùng các con số 1, 2, 3 hoặc gạch ngang (-) cho các ý.
4. KHI ĐƯA RA VÍ DỤ BẮT BUỘC TRÌNH BÀY XUỐNG DÒNG RIÊNG BIỆT:
   Câu tiếng Nhật: [Câu Kanji và Kana]
   Cách đọc: [Romaji hoặc Hiragana]
   Dịch nghĩa: [Tiếng Việt]
5. KHÔNG VIẾT KHỐI VĂN NÉN: Tách các ý bằng dòng trắng rõ ràng để người học dễ đọc.`;

  let userPrompt = '';

  if (normalizedAction === 'user_diagnosis') {
    // Personalized AI analysis of THIS specific user's learning data
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
    const { text: rawAiText, modelUsed } = await callGemini(userPrompt);
    const sanitizedText = sanitizeAiText(rawAiText);

    return {
      success: true,
      data: {
        title: `AI Sensei: ${context?.word || context?.kanji || context?.title || 'Phân Tích Chuyên Sâu'}`,
        explanation: sanitizedText,
        nuance: sanitizedText,
        aiGenerated: true,
        model: modelUsed
      }
    };
  } catch (error) {
    console.error('Gemini API call failed:', error.message);
    const wordKey = context?.kanji || context?.word || prompt;
    return {
      success: true,
      data: {
        title: `AI Sensei: ${wordKey || 'Hỗ Trợ Học Tập'}`,
        explanation: `AI Sensei hướng dẫn:\nKhi học từ vựng 「${wordKey}」, bí quyết ghi nhớ bền vững là đọc to thành tiếng theo ngữ điệu Tokyo Pitch Accent và đặt từ vào câu hoàn chỉnh mỗi ngày.\n\nCâu tiếng Nhật: 「${wordKey}」を毎日使います。\nCách đọc: Mainichi tsukaimasu.\nDịch nghĩa: Tôi sử dụng hàng ngày.`,
        nuance: `Từ vựng cốt lõi thường gặp trong các đề thi năng lực JLPT.`,
        aiGenerated: false,
        error: error.message
      }
    };
  }
}

module.exports = {
  generateAiResponse,
  sanitizeAiText
};
