const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const { autoInitDatabase } = require('../init_db');

// Ham chuan hoa chuoi ket noi phong truong hop mat khau co ky tu dac biet nhu @
function normalizeDatabaseUrl(raw) {
  if (!raw) return raw;
  raw = raw.trim();
  const match = raw.match(/^postgresql:\/\/([^:]+):(.*)@([^@]+:\d+\/[^?]+.*)$/);
  if (match) {
    const user = match[1];
    let password = match[2];
    const rest = match[3];
    if (password.includes('@') && !password.includes('%40')) {
      password = encodeURIComponent(password);
    }
    return `postgresql://${user}:${password}@${rest}`;
  }
  return raw;
}

// Lay DATABASE_URL tu tham so dong lenh hoac bien moi truong hoac tep .env
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
  console.log('       HUONG DAN DAY DU LIEU LEN SUPABASE');
  console.log('====================================================\n');
  console.log('Vui long cung cap chuoi ket noi DATABASE_URL cua Supabase theo 1 trong cac cach sau:');
  console.log('\nCach 1: Truyen truc tiep chuoi ket noi vao lenh:');
  console.log('  node backend/scripts/push_to_supabase.js "postgresql://postgres.[REF]:[PASS]@aws-0-[REGION].pooler.supabase.com:6543/postgres"');
  console.log('\nCach 2: Gan bien moi truong trong PowerShell:');
  console.log('  $env:DATABASE_URL="postgresql://postgres.[REF]:[PASS]@aws-0-[REGION].pooler.supabase.com:6543/postgres"');
  console.log('  node backend/scripts/push_to_supabase.js');
  console.log('\nCach 3: Dien vao tep backend/.env dong:');
  console.log('  DATABASE_URL=postgresql://postgres.[REF]:[PASS]@aws-0-[REGION].pooler.supabase.com:6543/postgres');
  console.log('  node backend/scripts/push_to_supabase.js\n');
  process.exit(1);
}

// Chuan hoa chuoi URI
connectionString = normalizeDatabaseUrl(connectionString);

console.log('====================================================');
console.log('    BAT DAU NAP DU LIEU TOAN BO N5 - N1 LEN SUPABASE');
console.log('====================================================\n');
console.log('Dang ket noi toi Supabase qua SSL...');

const pool = new Pool({
  connectionString: connectionString,
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 15000
});

async function main() {
  try {
    const client = await pool.connect();
    console.log('Ket noi thanh cong voi Supabase PostgreSQL!');

    console.log('\nDang cap nhat cau truc bang (Schema Migration)...');
    console.log('Dang nap 130 bai hoc, 9.584 tu vung, 607 Kanji, 276 ngu phap, 45 tro tu, 60 bai tap...');
    await autoInitDatabase(pool);

    // Kiem tra so luong thuc te trong Supabase
    const counts = {};
    const tables = ['lessons', 'vocabularies', 'kanji', 'grammar_points', 'particles', 'particle_exercises'];
    for (const tbl of tables) {
      const res = await pool.query(`SELECT COUNT(*) FROM ${tbl}`);
      counts[tbl] = parseInt(res.rows[0].count, 10);
    }

    console.log('\n====================================================');
    console.log('   XAC NHAN SO LUONG DU LIEU DA NAP TREN SUPABASE:');
    console.log('====================================================');
    console.log(`- Bai hoc (lessons): ${counts.lessons} bai (N5 den N1)`);
    console.log(`- Tu vung (vocabularies): ${counts.vocabularies} tu vung chuan`);
    console.log(`- Chu Han (kanji): ${counts.kanji} chu Han day du am On/Kun/Han Viet`);
    console.log(`- Ngu phap (grammar_points): ${counts.grammar_points} diem ngu phap`);
    console.log(`- Tro tu (particles): ${counts.particles} cau truc tro tu`);
    console.log(`- Bai tap tro tu (particle_exercises): ${counts.particle_exercises} cau hoi trac nghiem`);
    console.log('====================================================');
    console.log('NAP DU LIEU LEN SUPABASE HOAN TAT 100%!');

    client.release();
    await pool.end();
    process.exit(0);
  } catch (err) {
    console.error('Loi trong qua trinh nap du lieu len Supabase:', err.message);
    if (err.message.includes('password authentication failed')) {
      console.error('\nGoi y: Mat khau co so du lieu Supabase bi sai. Vui long kiem tra lai mat khau ban da dat trong chuoi URI.');
    } else if (err.message.includes('ENOTFOUND') || err.message.includes('timeout')) {
      console.error('\nGoi y: Khong tim thay may chu Supabase. Vui long kiem tra lai ten mien host va cong (6543 hoac 5432).');
    }
    await pool.end();
    process.exit(1);
  }
}

main();
