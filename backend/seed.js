const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || '127.0.0.1',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '123456',
  database: process.env.DB_NAME || 'jlpt_n5',
});

const lessonTitles = {
  1: "Chào hỏi, giới thiệu bản thân, quốc tịch, nghề nghiệp",
  2: "Đồ vật hàng ngày, chỉ thị từ (cái này, cái đó, cái kia)",
  3: "Địa điểm, vị trí, cơ quan, phòng ban, mua sắm",
  4: "Thời gian, giờ giấc, thứ ngày, thói quen sinh hoạt",
  5: "Phương tiện giao thông, đi - đến - về, ngày tháng",
  6: "Hành động hàng ngày với tân ngữ (ăn, uống, đọc, xem...)",
  7: "Công cụ, phương tiện, tặng quà, nhận quà",
  8: "Tính từ đuôi い và な, miêu tả tính chất, sở thích",
  9: "Sở thích, khả năng, hiểu biết, lý do (thích, hiểu, vì...)",
  10: "Sự tồn tại và vị trí của người & đồ vật (ở đâu có gì)",
  11: "Số lượng từ, thời gian, chi phí, bao nhiêu cái/người",
  12: "So sánh hơn, so sánh nhất, thì quá khứ của tính từ",
  13: "Mong muốn (muốn có, muốn làm), mục đích di chuyển",
  14: "Động từ thể て (Te), câu nhờ vả, hành động đang diễn ra",
  15: "Xin phép và cấm đoán (được phép làm, không được làm)",
  16: "Nối câu thể て, trình tự hành động, miêu tả trạng thái",
  17: "Động từ thể ない (Nai), yêu cầu không làm, phải làm",
  18: "Động từ thể từ điển (Nguyên mẫu), khả năng, sở thích",
  19: "Động từ thể た (Ta), trải nghiệm, kinh nghiệm, liệt kê",
  20: "Thể thông thường (Futsuukei), giao tiếp thân mật",
  21: "Bày tỏ quan điểm (tôi nghĩ là, nói rằng, trích dẫn)",
  22: "Mệnh đề bổ nghĩa cho danh từ (người đang đọc sách)",
  23: "Khi... thì (thời điểm), chỉ đường, vận hành thiết bị",
  24: "Cho và nhận hành động (giúp đỡ, tặng, cho mượn)",
  25: "Câu điều kiện giả định (nếu... thì, dù... nhưng)"
};

async function seed() {
  const client = await pool.connect();
  try {
    console.log("Connecting to PostgreSQL...");
    await client.query('BEGIN');

    // Clear existing data
    await client.query('TRUNCATE TABLE vocabularies, lessons CASCADE');

    const jsonPath = 'D:/HocTap/JLPT/n5_full_lessons.json';
    const rawData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

    // Save a copy into database/n5_full_lessons.json for self-contained project
    fs.writeFileSync(path.join(__dirname, '../database/n5_full_lessons.json'), JSON.stringify(rawData, null, 2));

    let totalVocab = 0;

    for (let num = 1; num <= 25; num++) {
      const title = lessonTitles[num] || `Bài ${num}`;
      const desc = `Giáo trình Minna no Nihongo N5 - Bài ${num}`;
      
      const lessonRes = await client.query(
        `INSERT INTO lessons (lesson_number, title, description) VALUES ($1, $2, $3) RETURNING id`,
        [num, title, desc]
      );
      const lessonId = lessonRes.rows[0].id;

      const vocabs = rawData[String(num)] || [];
      for (let i = 0; i < vocabs.length; i++) {
        const item = vocabs[i];
        const kanji = (item.kanji && item.kanji !== '–' && item.kanji !== '-') ? item.kanji.trim() : null;
        const kana = (item.kana || '').trim();
        const romaji = (item.romaji || '').trim();
        const vietnamese = (item.vietnamese || '').trim();
        const exampleJp = item.example_jp || null;
        const exampleVi = item.example_vi || null;

        await client.query(
          `INSERT INTO vocabularies (lesson_id, lesson_number, order_num, kanji, kana, romaji, vietnamese, example_jp, example_vi)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
          [lessonId, num, i + 1, kanji, kana, romaji, vietnamese, exampleJp, exampleVi]
        );
        totalVocab++;
      }
      console.log(`Inserted Lesson ${num}: ${vocabs.length} words`);
    }

    await client.query('COMMIT');
    console.log(`SUCCESS! Seeded 25 lessons and ${totalVocab} vocabularies into PostgreSQL.`);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error("Error seeding database:", err);
  } finally {
    client.release();
    pool.end();
  }
}

seed();
