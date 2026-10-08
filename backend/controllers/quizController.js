const db = require('../config/db');
const fallback = require('../data/fallbackData');

function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Generate Quiz Questions with Clean Meaning and Clean Kana
const getQuiz = async (req, res) => {
  try {
    const { lesson, lesson_start, lesson_end, count = 20, mode = 'mixed' } = req.query;

    let query = 'SELECT *, COALESCE(clean_vietnamese, vietnamese) as display_vi, COALESCE(clean_kana, kana) as display_kana FROM vocabularies';
    const params = [];

    if (lesson && lesson !== 'all') {
      params.push(parseInt(lesson));
      query += ` WHERE lesson_number = $${params.length}`;
    } else if (lesson_start && lesson_end) {
      params.push(parseInt(lesson_start));
      params.push(parseInt(lesson_end));
      query += ` WHERE lesson_number >= $1 AND lesson_number <= $2`;
    }

    let pool = [];
    let allVocabs = [];

    try {
      const vocabResult = await db.query(query, params);
      pool = vocabResult.rows;

      // Get all vocabularies for distractors
      const allVocabResult = await db.query(`
        SELECT id, kanji, kana, 
               COALESCE(clean_kana, kana) as display_kana, 
               vietnamese, 
               COALESCE(clean_vietnamese, vietnamese) as display_vi,
               usage_note
        FROM vocabularies
      `);
      allVocabs = allVocabResult.rows;
    } catch (dbErr) {
      console.warn('[getQuiz DB Notice] Using fallback for quiz pool:', dbErr.message);
    }

    if (!pool || pool.length === 0) {
      const fbList = fallback.getFallbackVocabularies({
        lesson: lesson && lesson !== 'all' ? parseInt(lesson) : undefined
      });
      pool = fbList.map(v => ({
        ...v,
        display_vi: v.clean_vietnamese || v.vietnamese,
        display_kana: v.clean_kana || v.kana
      }));
      allVocabs = fallback.getFallbackVocabularies().map(v => ({
        ...v,
        display_vi: v.clean_vietnamese || v.vietnamese,
        display_kana: v.clean_kana || v.kana
      }));
    }

    const shuffled = shuffleArray(pool);
    const selected = shuffled.slice(0, Math.min(parseInt(count), pool.length));

    const questions = selected.map((item, index) => {
      let availableTypes = ['jp_to_vi', 'vi_to_jp'];
      if (item.kanji && item.kanji !== '–' && item.kanji !== '-') {
        availableTypes.push('kanji_to_reading');
      }

      let qType = availableTypes[Math.floor(Math.random() * availableTypes.length)];
      if (mode === 'jp_to_vi') qType = 'jp_to_vi';
      else if (mode === 'vi_to_jp') qType = 'vi_to_jp';
      else if ((mode === 'kanji_to_reading' || mode === 'multiple_choice') && item.kanji && item.kanji !== '–' && item.kanji !== '-') {
        qType = 'kanji_to_reading';
      } else if (mode === 'kanji_to_reading' || mode === 'multiple_choice') {
        qType = 'jp_to_vi';
      }

      let questionText = '';
      let prompt = '';
      let correctAnswer = '';
      let options = [];

      const cleanMeaning = item.display_vi;
      const cleanK = item.display_kana;

      if (qType === 'jp_to_vi') {
        prompt = 'Chọn nghĩa tiếng Việt chính xác';
        questionText = item.kanji && item.kanji !== '–' && item.kanji !== '-' ? `${item.kanji} (${cleanK})` : cleanK;
        correctAnswer = cleanMeaning;

        const distractors = shuffleArray(
          allVocabs.filter(v => v.id !== item.id && v.display_vi !== cleanMeaning)
        ).slice(0, 3).map(v => v.display_vi);
        options = shuffleArray([correctAnswer, ...distractors]);
      } else if (qType === 'vi_to_jp') {
        prompt = 'Chọn từ tiếng Nhật tương ứng';
        questionText = cleanMeaning;
        correctAnswer = item.kanji && item.kanji !== '–' && item.kanji !== '-' ? `${item.kanji} (${cleanK})` : cleanK;

        const distractors = shuffleArray(
          allVocabs.filter(v => v.id !== item.id)
        ).slice(0, 3).map(v => (v.kanji && v.kanji !== '–' && v.kanji !== '-') ? `${v.kanji} (${v.display_kana})` : v.display_kana);
        options = shuffleArray([correctAnswer, ...distractors]);
      } else {
        // kanji_to_reading
        prompt = 'Chọn cách đọc Hiragana đúng cho chữ Hán';
        questionText = item.kanji;
        correctAnswer = cleanK;

        const distractors = shuffleArray(
          allVocabs.filter(v => v.id !== item.id && v.display_kana !== cleanK)
        ).slice(0, 3).map(v => v.display_kana);
        options = shuffleArray([correctAnswer, ...distractors]);
      }

      return {
        id: index + 1,
        vocabulary_id: item.id,
        lesson_number: item.lesson_number,
        type: qType,
        prompt,
        question: questionText,
        correct_answer: correctAnswer,
        options,
        audio_text: cleanK,
        kanji: item.kanji,
        kana: item.kana,
        clean_kana: cleanK,
        romaji: item.romaji,
        vietnamese: item.vietnamese,
        clean_vietnamese: cleanMeaning,
        usage_note: item.usage_note
      };
    });

    res.json({
      total: questions.length,
      lesson: lesson ? parseInt(lesson) : 'all',
      questions
    });
  } catch (error) {
    console.error('getQuiz error:', error);
    res.status(500).json({ message: 'Lỗi tạo bài trắc nghiệm' });
  }
};

// Submit Quiz Result
const submitQuiz = async (req, res) => {
  try {
    const { session_type = 'quiz', lesson_number, total_questions, correct_answers, results = [] } = req.body;
    const userId = req.user ? req.user.id : null;

    const scorePercentage = total_questions > 0 
      ? Math.round((correct_answers / total_questions) * 100 * 100) / 100 
      : 0;

    let sessionId = null;

    if (userId) {
      const sessRes = await db.query(
        `INSERT INTO study_sessions (user_id, session_type, lesson_number, total_questions, correct_answers, score_percentage)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
        [userId, session_type, lesson_number || null, total_questions, correct_answers, scorePercentage]
      );
      sessionId = sessRes.rows[0].id;

      for (const resItem of results) {
        if (!resItem.vocabulary_id) continue;
        const isCorrect = resItem.is_correct;

        await db.query(`
          INSERT INTO user_progress (user_id, vocabulary_id, status, correct_count, wrong_count, last_studied_at)
          VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
          ON CONFLICT (user_id, vocabulary_id) DO UPDATE
          SET 
            correct_count = user_progress.correct_count + $4,
            wrong_count = user_progress.wrong_count + $5,
            status = CASE 
              WHEN $3 = 'mastered' AND user_progress.wrong_count = 0 THEN 'mastered'
              WHEN $5 > 0 THEN 'needs_review'
              WHEN user_progress.correct_count >= 2 THEN 'mastered'
              ELSE 'learning'
            END,
            last_studied_at = CURRENT_TIMESTAMP
        `, [
          userId, 
          resItem.vocabulary_id, 
          isCorrect ? 'learning' : 'needs_review',
          isCorrect ? 1 : 0,
          isCorrect ? 0 : 1
        ]);
      }
    }

    let evaluation = 'Cần ôn tập thêm';
    if (scorePercentage >= 90) evaluation = 'Xuất sắc! 🎉';
    else if (scorePercentage >= 80) evaluation = 'Tốt! 👏';
    else if (scorePercentage >= 60) evaluation = 'Khá 👍';

    res.json({
      session_id: sessionId,
      total_questions,
      correct_answers,
      wrong_answers: total_questions - correct_answers,
      score_percentage: scorePercentage,
      evaluation,
      saved_to_db: !!userId
    });
  } catch (error) {
    console.error('submitQuiz error:', error);
    res.status(500).json({ message: 'Lỗi nộp bài kiểm tra' });
  }
};

module.exports = { getQuiz, submitQuiz };
