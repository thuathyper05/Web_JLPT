// Module sinh bài tập và đề thi trắc nghiệm Kanji chuẩn cấu trúc JLPT
// ZERO ARROWS RULE: Tuyệt đối không dùng ký tự mũi tên trong code hoặc text

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

// Tạo các biến thể âm Hiragana gây nhiễu chuẩn đề thi JLPT
function generateHiraganaDistractors(correctKana) {
  if (!correctKana) return [];
  const distractors = [];

  // 1. Biến thể bỏ hoặc thêm trường âm
  if (correctKana.endsWith('う') || correctKana.endsWith('い')) {
    distractors.push(correctKana.slice(0, -1));
  } else {
    distractors.push(correctKana + 'う');
  }

  // 2. Biến thể đổi âm đục hoặc âm bán đục
  let modifiedKana = correctKana;
  if (modifiedKana.includes('が')) modifiedKana = modifiedKana.replace('が', 'か');
  else if (modifiedKana.includes('か')) modifiedKana = modifiedKana.replace('か', 'が');
  else if (modifiedKana.includes('じ')) modifiedKana = modifiedKana.replace('じ', 'し');
  else if (modifiedKana.includes('し')) modifiedKana = modifiedKana.replace('し', 'じ');
  else if (modifiedKana.includes('だ')) modifiedKana = modifiedKana.replace('だ', 'た');
  else if (modifiedKana.includes('た')) modifiedKana = modifiedKana.replace('た', 'だ');
  else if (modifiedKana.includes('ば')) modifiedKana = modifiedKana.replace('ば', 'は');
  else if (modifiedKana.includes('は')) modifiedKana = modifiedKana.replace('は', 'ば');

  if (modifiedKana !== correctKana && distractors.indexOf(modifiedKana) === -1) {
    distractors.push(modifiedKana);
  }

  // 3. Biến thể tráo âm hoặc âm ngắt
  if (correctKana.length >= 3) {
    const flipped = correctKana[0] + correctKana[2] + correctKana[1] + correctKana.slice(3);
    if (flipped !== correctKana && distractors.indexOf(flipped) === -1) {
      distractors.push(flipped);
    }
  }

  // Dự phòng nếu chưa đủ 3 đáp án nhiễu
  const fallbacks = ['あたらし', 'おおき', 'ちいさ', 'たか', 'やす', 'ふる', 'はや'];
  for (let f = 0; f < fallbacks.length && distractors.length < 3; f++) {
    if (fallbacks[f] !== correctKana && distractors.indexOf(fallbacks[f]) === -1) {
      distractors.push(fallbacks[f]);
    }
  }

  return distractors.slice(0, 3);
}

/**
 * Sinh danh sách câu hỏi trắc nghiệm Kanji chất lượng cao
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

  const shuffledPool = shuffleArray(pool);
  const questions = [];
  const modes = ['jlpt_yomikata', 'jlpt_hyouki', 'han_viet', 'meaning', 'compound'];

  for (let idx = 0; idx < shuffledPool.length && questions.length < targetCount; idx++) {
    const target = shuffledPool[idx];
    if (!target || !target.kanji) continue;

    let selectedMode = quizMode;
    if (selectedMode === 'all') {
      selectedMode = modes[Math.floor(Math.random() * modes.length)];
    }

    const cleanEx = extractCleanExample(target);
    const reading = (target.kunyomi || target.onyomi || '').split('、')[0].replace(/[・-]/g, '').trim();

    // Điều chỉnh nếu thiếu dữ liệu cho mode đó
    if (selectedMode === 'jlpt_yomikata' && !reading) {
      selectedMode = 'han_viet';
    }
    if (selectedMode === 'jlpt_hyouki' && !reading) {
      selectedMode = 'meaning';
    }
    if (selectedMode === 'compound' && !cleanEx) {
      selectedMode = 'han_viet';
    }

    const otherCandidates = pool.filter(function (k) {
      return k.kanji !== target.kanji;
    });
    if (otherCandidates.length < 3) continue;

    const shuffledOthers = shuffleArray(otherCandidates);
    let questionObj = null;

    // ── DẠNG 1: JLPT MONDAI 1 (漢字読み - Cách đọc chữ Hán) ──
    if (selectedMode === 'jlpt_yomikata') {
      const correctAnswer = reading;
      const rawDistractors = generateHiraganaDistractors(correctAnswer);

      // Bổ sung cách đọc của các chữ khác nếu cần
      for (let o = 0; o < shuffledOthers.length && rawDistractors.length < 3; o++) {
        const oReading = (shuffledOthers[o].kunyomi || shuffledOthers[o].onyomi || '').split('、')[0].replace(/[・-]/g, '').trim();
        if (oReading && oReading !== correctAnswer && rawDistractors.indexOf(oReading) === -1) {
          rawDistractors.push(oReading);
        }
      }

      if (rawDistractors.length < 3) continue;
      const allOptions = shuffleArray([correctAnswer, rawDistractors[0], rawDistractors[1], rawDistractors[2]]);

      const sentence = cleanEx ? cleanEx.word : '毎日の生活で「' + target.kanji + '」を使います。';
      const promptText = 'Trong câu sau, từ trong ngoặc 「' + target.kanji + '」 được đọc như thế nào?';

      questionObj = {
        id: questions.length + 1,
        mode: 'jlpt_yomikata',
        modeLabel: 'Mondai 1: Cách đọc chữ Hán (漢字読み)',
        kanjiChar: target.kanji,
        prompt: promptText,
        displayQuestion: sentence,
        subQuestion: target.meaning ? 'Nghĩa của chữ: ' + target.meaning : '',
        isDisplayLargeKanji: false,
        correctAnswer: correctAnswer,
        options: allOptions,
        targetItem: target
      };
    }
    // ── DẠNG 2: JLPT MONDAI 2 (表記 - Viết chữ Hán từ Hiragana) ──
    else if (selectedMode === 'jlpt_hyouki') {
      const correctAnswer = target.kanji;
      const distractors = [];
      for (let d = 0; d < shuffledOthers.length && distractors.length < 3; d++) {
        const val = shuffledOthers[d].kanji;
        if (val && val !== correctAnswer && distractors.indexOf(val) === -1) {
          distractors.push(val);
        }
      }
      if (distractors.length < 3) continue;

      const allOptions = shuffleArray([correctAnswer, distractors[0], distractors[1], distractors[2]]);
      const sentence = cleanEx ? cleanEx.word.replace(target.kanji, '「' + reading + '」') : '毎日「' + reading + '」を勉強します。';

      questionObj = {
        id: questions.length + 1,
        mode: 'jlpt_hyouki',
        modeLabel: 'Mondai 2: Cách viết Hán tự (表記)',
        kanjiChar: target.kanji,
        prompt: 'Từ trong ngoặc 「' + reading + '」 được viết bằng chữ Hán nào?',
        displayQuestion: sentence,
        subQuestion: target.meaning ? 'Ý nghĩa: ' + target.meaning : '',
        isDisplayLargeKanji: false,
        correctAnswer: correctAnswer,
        options: allOptions,
        targetItem: target
      };
    }
    // ── DẠNG 3: ÂM HÁN VIỆT ──
    else if (selectedMode === 'han_viet') {
      const correctAnswer = (target.han_viet || '').trim().toUpperCase();
      if (!correctAnswer) continue;

      const distractors = [];
      for (let d = 0; d < shuffledOthers.length && distractors.length < 3; d++) {
        const val = (shuffledOthers[d].han_viet || '').trim().toUpperCase();
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
        prompt: 'Hãy chọn âm Hán Việt chuẩn xác cho chữ Hán sau:',
        displayQuestion: target.kanji,
        subQuestion: target.meaning ? 'Ý nghĩa: ' + target.meaning : '',
        isDisplayLargeKanji: true,
        correctAnswer: correctAnswer,
        options: allOptions,
        targetItem: target
      };
    }
    // ── DẠNG 4: Ý NGHĨA TIẾNG VIỆT ──
    else if (selectedMode === 'meaning') {
      const correctAnswer = (target.meaning || '').trim();
      if (!correctAnswer) continue;

      const distractors = [];
      for (let d = 0; d < shuffledOthers.length && distractors.length < 3; d++) {
        const val = (shuffledOthers[d].meaning || '').trim();
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
        prompt: 'Ý nghĩa tiếng Việt chuẩn của chữ Hán này là gì?',
        displayQuestion: target.kanji,
        subQuestion: target.han_viet ? 'Âm Hán Việt: ' + target.han_viet : '',
        isDisplayLargeKanji: true,
        correctAnswer: correctAnswer,
        options: allOptions,
        targetItem: target
      };
    }
    // ── DẠNG 5: TỪ GHÉP & NGỮ CẢNH (文脈規定) ──
    else if (selectedMode === 'compound') {
      const exWord = cleanEx.word;
      const maskedWord = exWord.replace(target.kanji, ' ＿ ');
      const correctAnswer = target.kanji;

      const distractors = [];
      for (let d = 0; d < shuffledOthers.length && distractors.length < 3; d++) {
        const val = shuffledOthers[d].kanji;
        if (val && val !== correctAnswer && distractors.indexOf(val) === -1) {
          distractors.push(val);
        }
      }
      if (distractors.length < 3) continue;

      const allOptions = shuffleArray([correctAnswer, distractors[0], distractors[1], distractors[2]]);
      questionObj = {
        id: questions.length + 1,
        mode: 'compound',
        modeLabel: 'Mondai 3: Ngữ cảnh từ ghép Hán tự (文脈規定)',
        kanjiChar: target.kanji,
        prompt: 'Chọn chữ Hán thích hợp nhất để hoàn thành từ ghép trong câu:',
        displayQuestion: maskedWord,
        subQuestion: cleanEx.meaning ? 'Nghĩa: ' + cleanEx.meaning : (cleanEx.reading ? 'Cách đọc: ' + cleanEx.reading : ''),
        isDisplayLargeKanji: false,
        correctAnswer: correctAnswer,
        options: allOptions,
        targetItem: target
      };
    }

    if (questionObj) {
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

/**
 * Sinh đề thi mô phỏng JLPT Kanji hoàn chỉnh (gồm đủ 3 Mondai chuẩn)
 */
export function generateJlptMockExam(kanjiList, count) {
  const examCount = count || 15;
  const pool = Array.isArray(kanjiList) ? kanjiList : [];
  if (pool.length < 10) return [];

  const questions = [];
  const partCount = Math.floor(examCount / 3);

  // Mondai 1: Cách đọc chữ Hán
  const q1 = generateKanjiQuiz(pool, { count: partCount, quizMode: 'jlpt_yomikata' });
  // Mondai 2: Cách viết chữ Hán
  const q2 = generateKanjiQuiz(pool, { count: partCount, quizMode: 'jlpt_hyouki' });
  // Mondai 3: Ngữ cảnh từ ghép
  const q3 = generateKanjiQuiz(pool, { count: examCount - (q1.length + q2.length), quizMode: 'compound' });

  const combined = q1.concat(q2).concat(q3);
  for (let i = 0; i < combined.length; i++) {
    combined[i].id = i + 1;
    questions.push(combined[i]);
  }

  return questions;
}
