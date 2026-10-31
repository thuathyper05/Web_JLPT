/**
 * AI Assistant Service for HYPER Japanese Learning WebApp
 * Powered by Google Gemini 3.8 Flash API
 * Provides personalized, dynamic learning analysis based on individual student progress
 */

const https = require('https');

require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
require('dotenv').config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const PRIMARY_MODEL = 'gemini-3.8-flash';
const FALLBACK_MODEL = 'gemini-3.5-flash-lite';

/**
 * Calls Gemini REST API
 */
function callGemini(promptText, modelName = PRIMARY_MODEL) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      contents: [
        {
          parts: [{ text: promptText }]
        }
      ],
      generationConfig: {
        temperature: 0.6,
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
      timeout: 15000
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
              return resolve(text.trim());
            }
          }

          // If primary model fails, try fallback
          if (modelName === PRIMARY_MODEL) {
            console.warn(`Gemini ${PRIMARY_MODEL} returned ${res.statusCode}, trying ${FALLBACK_MODEL}...`);
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
  const baseInstruction = `Bạn là AI Sensei - giáo viên tiếng Nhật thông minh, ân cần của hệ thống HYPER Japanese.
Quy tắc trả lời:
- Giải thích bằng tiếng Việt dễ hiểu, sư phạm, chuẩn xác ngữ pháp tiếng Nhật Tokyo.
- Đi thẳng vào trọng tâm, đủ ý, súc tích, không lan man dài dòng dư thừa.
- Tuyệt đối không dùng ký tự mũi tên trong câu trả lời.
- Thêm ví dụ câu thực tế khi cần.`;

  let userPrompt = '';

  if (normalizedAction === 'user_diagnosis') {
    // Personalized AI analysis of THIS user's specific learning progress
    const masteredCount = userProgress?.masteredCount || 0;
    const reviewWords = userProgress?.reviewWords || [];
    const streak = userProgress?.streak || 0;
    const activeLesson = userProgress?.activeLesson || 1;

    userPrompt = `${baseInstruction}
Nhiệm vụ: Hãy phân tích tiến độ học tập thực tế của học viên "${username || 'Học viên'}":
- Bài học hiện tại: Bài ${activeLesson} Minna no Nihongo.
- Chuỗi ngày học liên tục: ${streak} ngày.
- Số từ vựng đã thành thạo: ${masteredCount} từ.
- Các từ vựng học viên đang gặp khó khăn hoặc cần ôn lại: ${reviewWords.length > 0 ? reviewWords.slice(0, 8).join(', ') : 'Chưa có từ nào bị đánh dấu sai'}.

Hãy đưa ra:
1. Đánh giá ngắn gọn (1-2 câu) về phản xạ và phong độ học tập hiện tại.
2. Gợi ý trọng tâm cần ôn tập cụ thể cho các từ hoặc ngữ pháp đang gặp khó khăn trên.
3. Kế hoạch hành động 15 phút hôm nay để củng cố trí nhớ dài hạn.`;
  } else if (normalizedAction === 'explain_vocab') {
    const word = context?.kanji || context?.word || context?.clean_kana || prompt;
    const kana = context?.clean_kana || context?.kana || '';
    const meaning = context?.clean_vietnamese || context?.vietnamese || context?.meaning || '';

    userPrompt = `${baseInstruction}
Nhiệm vụ: Phân tích nhanh từ vựng tiếng Nhật 「${word}」 (Đọc là: ${kana}, nghĩa: ${meaning}):
1. Âm điệu & Sắc thái sử dụng trong đời sống Nhật.
2. Mẹo ghi nhớ nhanh (hình ảnh liên tưởng hoặc mẹo ghép chữ Hán nếu có).
3. 1 câu ví dụ thực tế kèm dịch nghĩa tiếng Việt.`;
  } else if (normalizedAction === 'explain_kanji') {
    const kanji = context?.kanji || prompt;
    const hanViet = context?.han_viet || '';
    const meaning = context?.meaning || '';

    userPrompt = `${baseInstruction}
Nhiệm vụ: Phân tích chữ Hán 「${kanji}」 (Âm Hán Việt: ${hanViet}, Nghĩa: ${meaning}):
1. Câu chuyện tượng hình ghi nhớ mặt chữ dễ thuộc nhất.
2. Cách đọc thông dụng (On/Kun) kèm 1 từ ghép điển hình.
3. Lưu ý tránh nhầm lẫn với các Hán tự có nét tương tự.`;
  } else if (normalizedAction === 'explain_particle') {
    const particle = context?.particle || prompt;
    const title = context?.title || `Trợ từ 「${particle}」`;

    userPrompt = `${baseInstruction}
Nhiệm vụ: Gỡ rối bản chất trợ từ ${title}:
1. Bản chất cốt lõi trợ từ này dùng để làm gì.
2. Bẫy hay nhầm lẫn nhất của người Việt khi dùng trợ từ này.
3. 2 câu ví dụ so sánh minh họa rõ ràng.`;
  } else if (normalizedAction === 'explain_quiz' || normalizedAction === 'explain_listening') {
    const question = context?.question || prompt;
    const correctAnswer = context?.correct_answer || context?.correctAnswer || '';
    const dialogue = context?.audioText || context?.dialogue || '';

    userPrompt = `${baseInstruction}
Nhiệm vụ: Phân tích bài tập:
Câu hỏi: ${question}
Đáp án đúng: ${correctAnswer}
${dialogue ? `Đoạn thoại: ${dialogue}` : ''}
Hãy giải thích ngắn gọn vì sao đáp án này đúng và chỉ ra từ khóa then chốt giúp bắt được đáp án trong 5 giây.`;
  } else {
    // General chat with Sensei
    userPrompt = `${baseInstruction}
Học viên hỏi: "${prompt}"
Hãy trả lời thân thiện, hỗ trợ tối đa việc học tiếng Nhật của bạn ấy.`;
  }

  try {
    const rawAiText = await callGemini(userPrompt);

    return {
      success: true,
      data: {
        title: `AI Sensei: ${context?.word || context?.kanji || 'Phân Tích & Hướng Dẫn'}`,
        explanation: rawAiText,
        nuance: rawAiText,
        aiGenerated: true,
        model: PRIMARY_MODEL
      }
    };
  } catch (error) {
    console.error('Gemini API execution error:', error.message);
    // Graceful pedagogical fallback if network to Gemini fails
    return {
      success: true,
      data: {
        title: `AI Sensei: ${context?.word || 'Hỗ Trợ Học Tập'}`,
        explanation: `Sensei khuyên bạn: Khi học 「${context?.kanji || context?.word || prompt}」, hãy chú ý đọc to thành tiếng theo ngữ điệu Tokyo và ghép vào một câu giao tiếp cụ thể mỗi ngày để tạo phản xạ tự nhiên.`,
        nuance: `Từ vựng được dùng nhiều trong giao tiếp N5 hàng ngày.`,
        aiGenerated: false
      }
    };
  }
}

module.exports = {
  generateAiResponse
};
