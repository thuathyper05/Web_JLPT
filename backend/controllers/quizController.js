const db = require('../config/db');

// Helper to shuffle array
function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Generate Quiz Questions
// query params: lesson (optional, single or range or empty for all), count (default 10 or 20), types ('mean_to_jp', 'jp_to_mean', 'kanji_to_reading', 'input_kana')
const getQuiz = async (req, res) => {
  try {
    const { lesson, lesson_start, lesson_end, count = 20, mode = 'mixed' } = req.query;

    let query = 'SELECT * FROM vocabularies';
    const params = [];

    if (lesson) {
      params.push(parseInt(lesson));
      query += ` WHERE lesson_number = $${params.length}`;
    } else if (lesson_start && lesson_end) {
      params.push(parseInt(lesson_start));
      params.push(parseInt(lesson_end));
      query += ` WHERE lesson_number >= $1 AND lesson_number <= $2`;
    }

    const vocabResult = await db.query(query, params);
    const pool = vocabResult.rows;

    if (pool.length === 0) {
      return res.status(400).json({ message: 'Không có dữ liệu từ vựng cho bài này' });
    }

    // Also get all vocabularies for strong distractors
    const allVocabResult = await db.query('SELECT id, kanji, kana, romaji, vietnamese FROM vocabularies');
    const allVocabs = allVocabResult.rows;

    const shuffled = shuffleArray(pool);
    const selected = shuffled.slice(0, Math.min(parseInt(count), pool.length));

    const questions = selected.map((item, index) => {
      // Pick question type
      let availableTypes = ['jp_to_vi', 'vi_to_jp', 'kana_input'];
      if (item.kanji) {
        availableTypes.push('kanji_to_reading');
      }

      let qType = availableTypes[Math.floor(Math.random() * availableTypes.length)];
      if (mode === 'kana_input') qType = 'kana_input';
      else if (mode === 'multiple_choice') {
        const mcTypes = availableTypes.filter(t => t !== 'kana_input');
        qType = mcTypes[Math.floor(Math.random() * mcTypes.length)];
      }

      // Generate options for multiple choice
      let questionText = '';
      let prompt = '';
      let correctAnswer = '';
      let options = [];

      if (qType === 'jp_to_vi') {
        prompt = 'Chọn nghĩa tiếng Việt chính xác';
        questionText = item.kanji ? `${item.kanji} (${item.kana})` : item.kana;
        correctAnswer = item.vietnamese;

        // Distractors
        const distractors = shuffleArray(allVocabs.filter(v => v.id !== item.id && v.vietnamese !== item.vietnamese))
          .slice(0, 3)
          .map(v => v.vietnamese);
        options = shuffleArray([correctAnswer, ...distractors]);
      } else if (qType === 'vi_to_jp') {
        prompt = 'Chọn từ tiếng Nhật tương ứng';
        questionText = item.vietnamese;
        correctAnswer = item.kanji ? `${item.kanji} (${item.kana})` : item.kana;

        const distractors = shuffleArray(allVocabs.filter(v => v.id !== item.id))
          .slice(0, 3)
          .map(v => v.kanji ? `${v.kanji} (${v.kana})` : v.kana);
        options = shuffleArray([correctAnswer, ...distractors]);
      } else if (qType === 'kanji_to_reading') {
        prompt = 'Chọn cách đọc Hiragana đúng cho chữ Hán';
        questionText = item.kanji;
        correctAnswer = item.kana;

        const distractors = shuffleArray(allVocabs.filter(v => v.id !== item.id && v.kana !== item.kana))
          .slice(0, 3)
          .map(v => v.kana);
        options = shuffleArray([correctAnswer, ...distractors]);
      } else {
        // kana_input
        prompt = 'Nhập cách đọc Hiragana/Katakana chính xác';
        questionText = item.kanji ? `${item.kanji} (${item.vietnamese})` : item.vietnamese;
        correctAnswer = item.kana;
      }

      return {
        id: index + 1,
        vocabulary_id: item.id,
        lesson_number: item.lesson_number,
        type: qType,
        prompt,
        question: questionText,
        correct_answer: correctAnswer,
        options, // empty if input_kana
        audio_text: item.kana,
        kanji: item.kanji,
        kana: item.kana,
        romaji: item.romaji,
        vietnamese: item.vietnamese
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

// Submit Quiz Result (Authenticated or Guest)
const submitQuiz = async (req, res) => {
  try {
    const { session_type = 'quiz', lesson_number, total_questions, correct_answers, results = [] } = req.body;
    const userId = req.user ? req.user.id : null;

    const scorePercentage = total_questions > 0 
      ? Math.round((correct_answers / total_questions) * 100 * 100) / 100 
      : 0;

    let sessionId = null;

    if (userId) {
      // Insert study session
      const sessRes = await db.query(
        `INSERT INTO study_sessions (user_id, session_type, lesson_number, total_questions, correct_answers, score_percentage)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
        [userId, session_type, lesson_number || null, total_questions, correct_answers, scorePercentage]
      );
      sessionId = sessRes.rows[0].id;

      // Update user_progress for answered items
      for (const resItem of results) {
        if (!resItem.vocabulary_id) continue;
        const isCorrect = resItem.is_correct;

        // Upsert progress
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

    // Evaluation message based on score
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
