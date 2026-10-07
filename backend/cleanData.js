const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || '127.0.0.1',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '123456',
  database: process.env.DB_NAME || 'jlpt_n5',
});

function parseMeaning(raw) {
  if (!raw) return { clean: '', note: '' };
  let str = raw.trim();
  let notes = [];

  // 1. Dash separator: " — " or " – "
  const dashIdx = str.search(/\s+(?:—|–)\s+/);
  if (dashIdx !== -1) {
    notes.push(str.substring(dashIdx).replace(/^\s*(?:—|–)\s*/, '').trim());
    str = str.substring(0, dashIdx).trim();
  }

  // 2. Specific words cleaning
  // "~ (đặt sau tên, lịch sự)" -> "Hậu tố xưng hô (~san)" or "~ (anh/chị/ông/bà)"
  if (str.includes('~ (đặt sau tên') || str.includes('~ (đặt sau')) {
    notes.push('Đặt sau tên, mang sắc thái lịch sự');
    str = 'Hậu tố xưng hô (anh / chị / ông / bà)';
  } else if (str.includes('bé ~ (sau tên)')) {
    notes.push('Thường đặt sau tên bé trai/gái hoặc bạn bè thân thiết');
    str = 'Bé / Em ~ (hậu tố gọi thân mật)';
  } else if (str.includes('người ~ (sau tên nước)')) {
    notes.push('Đặt sau tên quốc gia để chỉ quốc tịch');
    str = 'Người ~ (quốc tịch)';
  } else if (str.includes('~ tuổi') && str.includes('sai')) {
    str = '~ tuổi';
  } else {
    // Check parentheses for grammar notes
    const parenMatches = [...str.matchAll(/\(([^)]+)\)/g)];
    for (const m of parenMatches) {
      const content = m[1].trim();
      const isNote = /^(?:tính từ|đặt sau|sau tên|lịch sự|nói về|dùng để|đi với|thân mật|phủ định|nghĩa là|ví dụ|vd|chưa\/không cần nấu|đã nấu|chế biến|ở đâu|của |khi |cho |dành cho|lịch sự của)/i.test(content) ||
        content.includes('tính từ') || content.includes('lịch sự') || content.includes('phủ định') || content.includes('không cần nấu') || content.includes('lịch sự của');
      if (isNote) {
        notes.push(content);
        str = str.replace(m[0], '').trim();
      }
    }
  }

  // Remove trailing punctuations
  str = str.replace(/\s+/g, ' ').replace(/[，,;—–]\s*$/, '').trim();
  return {
    clean: str || raw.trim(),
    note: notes.join('; ')
  };
}

function parseKana(rawKana) {
  if (!rawKana) return rawKana;
  // If kana contains alternatives like 'おじいさん／おじいちゃん' -> standard is 'おじいさん'
  // Or brackets like '［お］べんとう' -> standard clean is 'おべんとう'
  let clean = rawKana.replace(/[［\[］\]]/g, '').trim();
  if (clean.includes('／')) {
    clean = clean.split('／')[0].trim();
  } else if (clean.includes('/')) {
    clean = clean.split('/')[0].trim();
  }
  return clean;
}

async function run() {
  const client = await pool.connect();
  try {
    const res = await client.query('SELECT id, kana, vietnamese FROM vocabularies');
    console.log(`Found ${res.rows.length} vocabularies to process.`);

    for (const row of res.rows) {
      const { clean, note } = parseMeaning(row.vietnamese);
      const cleanK = parseKana(row.kana);

      await client.query(
        'UPDATE vocabularies SET clean_vietnamese = $1, usage_note = $2, clean_kana = $3 WHERE id = $4',
        [clean, note || null, cleanK, row.id]
      );
    }

    console.log('Successfully updated clean_vietnamese, usage_note, clean_kana in PostgreSQL!');
  } catch (err) {
    console.error('Error updating vocabularies:', err);
  } finally {
    client.release();
    pool.end();
  }
}

run();
