const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Load fallback JSON datasets
const lessonsRaw = JSON.parse(fs.readFileSync(path.join(__dirname, 'data/n5_full_lessons.json'), 'utf8'));
const grammarData = JSON.parse(fs.readFileSync(path.join(__dirname, 'data/n5_grammar_data.json'), 'utf8'));
const kanjiData = JSON.parse(fs.readFileSync(path.join(__dirname, 'data/n5_kanji_data.json'), 'utf8'));
const particlesData = JSON.parse(fs.readFileSync(path.join(__dirname, 'data/n5_particles_data.json'), 'utf8'));

const LESSON_TITLES = {
  1: "Chào hỏi, giới thiệu bản thân, quốc tịch, nghề nghiệp",
  2: "Đồ vật quanh ta, sở hữu đồ vật",
  3: "Địa điểm, vị trí, giá tiền",
  4: "Thời gian, ngày trong tuần, động từ chỉ hành động thường ngày",
  5: "Phương tiện đi lại, địa điểm đến, đi với ai",
  6: "Ăn uống, hành động tác động lên tân ngữ (Trợ từ を)",
  7: "Công cụ, phương tiện (Trợ từ で), cho và nhận (あげます, もらいます)",
  8: "Tính từ đuôi い và tính từ đuôi な",
  9: "Sở thích, khả năng, lý do (から)",
  10: "Sự tồn tại của người và vật (います, あります)",
  11: "Số đếm, lượng từ, thời gian",
  12: "So sánh hơn, so sánh nhất, thì quá khứ của tính từ/danh từ",
  13: "Mong muốn (欲しい, たい), mục đích hành động (に行きます)",
  14: "Động từ thể て, yêu cầu lịch sự (てください), hành động đang diễn ra",
  15: "Xin phép (てもいいですか), điều cấm chỉ (てはいけません)",
  16: "Nối chuỗi hành động (て, から), miêu tả thuộc tính",
  17: "Động từ thể ない, yêu cầu không làm gì (ないでください)",
  18: "Động từ thể từ điển (辞書形), khả năng, sở thích",
  19: "Động từ thể た, kinh nghiệm (たことがあります), liệt kê hành động (たり...たり)",
  20: "Thể thông thường (Thể ngắn / 普通形)",
  21: "Bày tỏ ý kiến (と思います), trích dẫn gián tiếp (と言いました)",
  22: "Mệnh đề bổ ngữ cho danh từ (Định ngữ)",
  23: "Khi... (とき), điều kiện hiển nhiên (と)",
  24: "Hành động cho và nhận nâng cao (くれます, てあげます, てもらいます)",
  25: "Câu điều kiện たら, giả định tương lai"
};

// Normalize lessons into flat vocabulary array with complete metadata
let flatVocabularies = [];
let vocabIdCounter = 1;

if (Array.isArray(lessonsRaw)) {
  flatVocabularies = lessonsRaw;
} else if (lessonsRaw && typeof lessonsRaw === 'object') {
  Object.keys(lessonsRaw).forEach((lNumKey) => {
    const lNum = parseInt(lNumKey);
    const words = lessonsRaw[lNumKey];
    if (Array.isArray(words)) {
      words.forEach((w) => {
        flatVocabularies.push({
          id: vocabIdCounter++,
          lesson_number: lNum,
          lesson_title: LESSON_TITLES[lNum] || `Bài ${lNum}`,
          kanji: w.kanji || '',
          kana: w.kana || w.clean_kana || '',
          clean_kana: w.clean_kana || w.kana || '',
          romaji: w.romaji || '',
          vietnamese: w.vietnamese || w.clean_vietnamese || '',
          clean_vietnamese: w.clean_vietnamese || w.vietnamese || '',
          example_jp: w.example_jp || '',
          example_vi: w.example_vi || '',
          usage_note: w.usage_note || ''
        });
      });
    }
  });
}

let pool = null;
let isDbConnected = false;

if (process.env.DATABASE_URL || process.env.DB_HOST) {
  try {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      host: process.env.DB_HOST || '127.0.0.1',
      port: parseInt(process.env.DB_PORT || '5432'),
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || '123456',
      database: process.env.DB_NAME || 'jlpt_n5',
      connectionTimeoutMillis: 3000
    });

    pool.query('SELECT 1', (err) => {
      if (!err) {
        isDbConnected = true;
        console.log('[PostgreSQL] Connected to database successfully.');
      } else {
        console.warn('[PostgreSQL] Database not reachable. Operating in High-Speed In-Memory Mode.');
      }
    });
  } catch (e) {
    console.warn('[PostgreSQL] Pool initialization error, using in-memory engine:', e.message);
  }
} else {
  console.log(`[Data Engine] Running in Zero-Config In-Memory Mode with ${flatVocabularies.length} vocabularies, ${grammarData.length} grammar, ${kanjiData.length} kanji.`);
}

module.exports = {
  pool,
  isDbConnected: () => isDbConnected,
  lessonTitles: LESSON_TITLES,
  data: {
    lessons: flatVocabularies,
    grammar: grammarData,
    kanji: kanjiData,
    particles: particlesData
  }
};
