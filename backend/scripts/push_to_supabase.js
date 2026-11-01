const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const { autoInitDatabase } = require('../init_db');

// Lấy DATABASE_URL từ tham số dòng lệnh hoặc biến môi trường hoặc tệp .env
let connectionString = process.argv[2] || process.env.DATABASE_URL;

if (!connectionString) {
  const envPath = path.join(__dirname, '../.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const match = envContent.match(/DATABASE_URL=["']?(.*?)["']?(\r?\n|$)/);
    if (match && match[1]) {
      connectionString = match[1].trim();
    }
  }
}

if (!connectionString) {
  console.log('====================================================');
  console.log('       HƯỚNG DẪN ĐẨY DỮ LIỆU LÊN SUPABASE');
  console.log('====================================================\n');
  console.log('Vui lòng cung cấp chuỗi kết nối DATABASE_URL của Supabase theo 1 trong các cách sau:');
  console.log('\nCách 1: Truyền trực tiếp chuỗi kết nối vào lệnh:');
  console.log('  node backend/scripts/push_to_supabase.js "postgresql://postgres.[REF]:[PASS]@aws-0-[REGION].pooler.supabase.com:6543/postgres"');
  console.log('\nCách 2: Gán biến môi trường trong PowerShell:');
  console.log('  $env:DATABASE_URL="postgresql://postgres.[REF]:[PASS]@aws-0-[REGION].pooler.supabase.com:6543/postgres"');
  console.log('  node backend/scripts/push_to_supabase.js');
  console.log('\nCách 3: Điền vào tệp backend/.env dòng:');
  console.log('  DATABASE_URL=postgresql://postgres.[REF]:[PASS]@aws-0-[REGION].pooler.supabase.com:6543/postgres');
  console.log('  node backend/scripts/push_to_supabase.js\n');
  process.exit(1);
}

// Clean connection string
connectionString = connectionString.trim();

console.log('====================================================');
console.log('    BẮT ĐẦU NẠP DỮ LIỆU TOÀN BỘ N5 - N1 LÊN SUPABASE');
console.log('====================================================\n');
console.log('Đang kết nối tới Supabase qua SSL...');

const pool = new Pool({
  connectionString: connectionString,
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 10000
});

async function main() {
  try {
    const client = await pool.connect();
    console.log('Kết nối thành công với Supabase PostgreSQL!');

    console.log('\nĐang tạo bảng và nạp 130 bài học, 9.584 từ vựng, 607 Kanji, 276 ngữ pháp...');
    await autoInitDatabase(pool);

    // Kiểm tra số lượng thực tế trong Supabase
    const counts = {};
    const tables = ['lessons', 'vocabularies', 'kanji', 'grammar_points', 'particles', 'particle_exercises'];
    for (const tbl of tables) {
      const res = await pool.query(`SELECT COUNT(*) FROM ${tbl}`);
      counts[tbl] = parseInt(res.rows[0].count, 10);
    }

    console.log('\n====================================================');
    console.log('   XÁC NHẬN SỐ LƯỢNG DỮ LIỆU ĐÃ NẠP TRÊN SUPABASE:');
    console.log('====================================================');
    console.log(`- Bài học (lessons): ${counts.lessons} bài (N5 đến N1)`);
    console.log(`- Từ vựng (vocabularies): ${counts.vocabularies} từ vựng chuẩn`);
    console.log(`- Chữ Hán (kanji): ${counts.kanji} chữ Hán đầy đủ âm On/Kun/Hán Việt`);
    console.log(`- Ngữ pháp (grammar_points): ${counts.grammar_points} điểm ngữ pháp`);
    console.log(`- Trợ từ (particles): ${counts.particles} cấu trúc trợ từ`);
    console.log(`- Bài tập trợ từ (particle_exercises): ${counts.particle_exercises} câu hỏi trắc nghiệm`);
    console.log('====================================================');
    console.log('NẠP DỮ LIỆU LÊN SUPABASE HOÀN TẤT 100%!');

    client.release();
    await pool.end();
    process.exit(0);
  } catch (err) {
    console.error('Lỗi trong quá trình nạp dữ liệu lên Supabase:', err.message);
    if (err.message.includes('password authentication failed')) {
      console.error('\nGợi ý: Mật khẩu cơ sở dữ liệu Supabase bị sai. Vui lòng kiểm tra lại mật khẩu bạn đã đặt trong chuỗi URI.');
    } else if (err.message.includes('ENOTFOUND') || err.message.includes('timeout')) {
      console.error('\nGợi ý: Không tìm thấy máy chủ Supabase. Vui lòng kiểm tra lại tên miền host và cổng (6543 hoặc 5432).');
    }
    await pool.end();
    process.exit(1);
  }
}

main();
