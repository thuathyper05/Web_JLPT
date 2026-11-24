// Module sinh bài tập trắc nghiệm Kanji thông minh
// ZERO ARROWS RULE: Không dùng ký tự mũi tên (bao gồm cả arrow notation và unicode)

import { getKanjiMnemonicInfo } from '../data/kanjiTopics.js';

// Trộn mảng ngẫu nhiên (Fisher-Yates)
function shuffleArray(arr) {
  const result = arr.slice();
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = result[i];
    result[i] = result[j];
    result[j] = temp;
  }
  return result;
}

// Lấy ví dụ từ ghép an toàn từ item
function extractCleanExample(item) {
  if (!item || !item.examples) return null;
  const list = Array.isArray(item.examples) ? item.examples : [];
  if (list.length === 0) return null;

  for (let i = 0; i < list.length; i++) {
    const ex = list[i];
    if (typeof ex === 'string' && ex.includes(item.kanji)) {
      return { word: ex, reading: '', meaning: '' };
    }
    if (ex && typeof ex === 'object') {
      const w = ex.word || ex.w;
      const k = ex.reading || ex.k || '';
      const m = ex.meaning || ex.m || '';
      if (w && typeof w === 'string' && w.includes(item.kanji)) {
        return { word: w, reading: k, meaning: m };
      }
    }
  }
  return null;
}

/**
 * Sinh danh sách câu hỏi trắc nghiệm Kanji chất lượng cao
 * @param {Array} kanjiList - Toàn bộ danh sách Kanji của cấp độ
 * @param {Object} options - { count: 10, topicChars: [], quizMode: 'all' }
 * @returns {Array} Danh sách câu hỏi hoàn chỉnh
 */
export function generateKanjiQuiz(kanjiList, options) {
  const opts = options || {};
  const targetCount = opts.count || 10;
  const topicChars = Array.isArray(opts.topicChars) && opts.topicChars.length > 0 ? opts.topicChars : null;
  const quizMode = opts.quizMode || 'all';

  if (!Array.isArray(kanjiList) || kanjiList.length === 0) {
    return [];
  }

  // Lọc tập dữ liệu theo chủ đề nếu có
  let pool = kanjiList.slice();
  if (topicChars) {
    const filteredPool = pool.filter(function (k) {
      return topicChars.indexOf(k.kanji) !== -1;
    });
    if (filteredPool.length >= 4) {
      pool = filteredPool;
    }
  }

  if (pool.length === 0) return [];

  // Trộn pool để câu hỏi không bị trùng lặp
  const shuffledPool = shuffleArray(pool);
  const questions = [];
  const modes = ['han_viet', 'meaning', 'reading', 'compound'];

  for (let idx = 0; idx < shuffledPool.length && questions.length < targetCount; idx++) {
    const target = shuffledPool[idx];
    if (!target || !target.kanji) continue;

    // Xác định dạng câu hỏi cho câu này
    let selectedMode = quizMode;
    if (selectedMode === 'all') {
      selectedMode = modes[Math.floor(Math.random() * modes.length)];
    }

    // Kiểm tra tính khả thi của dạng câu hỏi
    const cleanEx = extractCleanExample(target);
    if (selectedMode === 'compound' && !cleanEx) {
      selectedMode = 'han_viet';
    }
    if (selectedMode === 'reading' && !target.kunyomi && !target.onyomi) {
      selectedMode = 'meaning';
    }

    // Chuẩn bị các chữ khác để làm đáp án nhiễu
    const otherCandidates = pool.filter(function (k) {
      return k.kanji !== target.kanji;
    });
    if (otherCandidates.length < 3) continue;

    const shuffledOthers = shuffleArray(otherCandidates);
    let questionObj = null;

    if (selectedMode === 'han_viet') {
      // Dạng 1: Cho chữ Hán, chọn âm Hán Việt
      const correctAnswer = (target.han_viet || '').trim().toUpperCase();
      if (!correctAnswer) continue;

      const distractors = [];
      for (let d = 0; d < shuffledOthers.length && distractors.length < 3; d++) {
        const dItem = shuffledOthers[d];
        const val = (dItem.han_viet || '').trim().toUpperCase();
        if (val && val !== correctAnswer && distractors.indexOf(val) === -1) {
          distractors.push(val);
        }
      }
      if (distractors.length < 3) continue;

      const allOptions = shuffleArray([correctAnswer, distractors[0], distractors[1], distractors[2]]);
      questionObj = {
        id: questions.length + 1,
        mode: 'han_viet',
        modeLabel: 'Âm Hán Việt',
        kanjiChar: target.kanji,
        prompt: 'Hãy chọn âm Hán Việt chính xác cho chữ Hán sau:',
        displayQuestion: target.kanji,
        isDisplayLargeKanji: true,
        correctAnswer: correctAnswer,
        options: allOptions,
        targetItem: target
      };
    } else if (selectedMode === 'meaning') {
      // Dạng 2: Cho chữ Hán, chọn nghĩa tiếng Việt
      const correctAnswer = (target.meaning || '').trim();
      if (!correctAnswer) continue;

      const distractors = [];
      for (let d = 0; d < shuffledOthers.length && distractors.length < 3; d++) {
        const dItem = shuffledOthers[d];
        const val = (dItem.meaning || '').trim();
        if (val && val !== correctAnswer && distractors.indexOf(val) === -1) {
          distractors.push(val);
        }
      }
      if (distractors.length < 3) continue;

      const allOptions = shuffleArray([correctAnswer, distractors[0], distractors[1], distractors[2]]);
      questionObj = {
        id: questions.length + 1,
        mode: 'meaning',
        modeLabel: 'Ý nghĩa tiếng Việt',
        kanjiChar: target.kanji,
        prompt: 'Ý nghĩa tiếng Việt của chữ Hán này là gì?',
        displayQuestion: target.kanji,
        subQuestion: target.han_viet ? 'Hán Việt: ' + target.han_viet : '',
        isDisplayLargeKanji: true,
        correctAnswer: correctAnswer,
        options: allOptions,
        targetItem: target
      };
    } else if (selectedMode === 'reading') {
      // Dạng 3: Cho cách đọc On/Kun hoặc từ vựng, chọn chữ Hán
      const reading = (target.kunyomi || target.onyomi || '').split('、')[0].trim();
      if (!reading) continue;

      const correctAnswer = target.kanji;
      const distractors = [];
      for (let d = 0; d < shuffledOthers.length && distractors.length < 3; d++) {
        const dItem = shuffledOthers[d];
        const val = dItem.kanji;
        if (val && val !== correctAnswer && distractors.indexOf(val) === -1) {
          distractors.push(val);
        }
      }
      if (distractors.length < 3) continue;

      const allOptions = shuffleArray([correctAnswer, distractors[0], distractors[1], distractors[2]]);
      questionObj = {
        id: questions.length + 1,
        mode: 'reading',
        modeLabel: 'Đoán chữ qua âm đọc',
        kanjiChar: target.kanji,
        prompt: 'Cách đọc dưới đây tương ứng với chữ Hán nào?',
        displayQuestion: reading,
        subQuestion: target.meaning ? 'Nghĩa: ' + target.meaning : '',
        isDisplayLargeKanji: false,
        correctAnswer: correctAnswer,
        options: allOptions,
        targetItem: target
      };
    } else if (selectedMode === 'compound') {
      // Dạng 4: Hoàn thành từ ghép còn thiếu chữ Hán
      const exWord = cleanEx.word;
      const maskedWord = exWord.replace(target.kanji, ' ＿ ');
      const correctAnswer = target.kanji;

      const distractors = [];
      for (let d = 0; d < shuffledOthers.length && distractors.length < 3; d++) {
        const dItem = shuffledOthers[d];
        const val = dItem.kanji;
        if (val && val !== correctAnswer && distractors.indexOf(val) === -1) {
          distractors.push(val);
        }
      }
      if (distractors.length < 3) continue;

      const allOptions = shuffleArray([correctAnswer, distractors[0], distractors[1], distractors[2]]);
      questionObj = {
        id: questions.length + 1,
        mode: 'compound',
        modeLabel: 'Điền từ ghép Hán tự',
        kanjiChar: target.kanji,
        prompt: 'Chọn chữ Hán thích hợp để hoàn thành từ ghép sau:',
        displayQuestion: maskedWord,
        subQuestion: cleanEx.meaning ? 'Nghĩa: ' + cleanEx.meaning : (cleanEx.reading ? 'Cách đọc: ' + cleanEx.reading : ''),
        isDisplayLargeKanji: false,
        correctAnswer: correctAnswer,
        options: allOptions,
        targetItem: target
      };
    }

    if (questionObj) {
      // Bổ sung giải thích chi tiết và thông tin chiết tự cho câu hỏi
      const mnemonicData = getKanjiMnemonicInfo(target.kanji, target.han_viet, target.meaning);
      questionObj.explanation = {
        kanji: target.kanji,
        han_viet: target.han_viet || '—',
        meaning: target.meaning || '—',
        onyomi: target.onyomi || '—',
        kunyomi: target.kunyomi || '—',
        mnemonic: mnemonicData.mnemonic,
        radicals: mnemonicData.radicals,
        origin: mnemonicData.origin
      };
      questions.push(questionObj);
    }
  }

  return questions;
}
