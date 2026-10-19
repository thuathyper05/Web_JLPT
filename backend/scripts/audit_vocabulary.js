const fs = require('fs');
const path = require('path');
const db = require('../config/db');

async function audit() {
  const jsonPath = path.join(__dirname, '../../database/n5_full_lessons.json');
  const rawData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

  const dbRes = await db.pool.query('SELECT id, lesson_number, kanji, kana, clean_kana, romaji, vietnamese, clean_vietnamese FROM vocabularies ORDER BY lesson_number, id');
  console.log(`Auditing ${dbRes.rows.length} DB records and ${Object.keys(rawData).length} lessons in JSON...\n`);

  // 1. Check for Hiragana where Katakana is standard
  const loanwordsRules = [
    { pattern: /^kamera$/i, katakana: 'カメラ', vi: 'máy ảnh' },
    { pattern: /^terebi$/i, katakana: 'テレビ', vi: 'tivi' },
    { pattern: /^rajio$/i, katakana: 'ラジオ', vi: 'đài radio' },
    { pattern: /^konpyu/i, katakana: 'コンピューター', vi: 'máy tính' },
    { pattern: /^pasokon$/i, katakana: 'パソコン', vi: 'máy tính cá nhân' },
    { pattern: /^no-?to$/i, katakana: 'ノート', vi: 'vở ghi chép' },
    { pattern: /^ka-?do$/i, katakana: 'カード', vi: 'thẻ' },
    { pattern: /^bo-?rupen$/i, katakana: 'ボールペン', vi: 'bút bi' },
    { pattern: /^sha-?pupenshiru$/i, katakana: 'シャープペンシル', vi: 'bút chì kim' },
    { pattern: /^erebe-?ta/i, katakana: 'エレベーター', vi: 'thang máy' },
    { pattern: /^esukare-?ta/i, katakana: 'エスカレーター', vi: 'thang cuốn' },
    { pattern: /^toire$/i, katakana: 'トイレ', vi: 'nhà vệ sinh' },
    { pattern: /^robii?$/i, katakana: 'ロビー', vi: 'hành lang / sảnh' },
    { pattern: /^depa-?to$/i, katakana: 'デパート', vi: 'bách hóa' },
    { pattern: /^takushii?$/i, katakana: 'タクシー', vi: 'taxi' },
    { pattern: /^basu$/i, katakana: 'バス', vi: 'xe buýt' },
    { pattern: /^pan$/i, katakana: 'パン', vi: 'bánh mì' },
    { pattern: /^ju-?su$/i, katakana: 'ジュース', vi: 'nước hoa quả' },
    { pattern: /^bi-?ru$/i, katakana: 'ビール', vi: 'bia' },
    { pattern: /^bideo$/i, katakana: 'ビデオ', vi: 'video' },
    { pattern: /^te-?pu$/i, katakana: 'テープ', vi: 'băng dính / băng' },
    { pattern: /^chokore-?to$/i, katakana: 'チョコレート', vi: 'sô-cô-la' },
    { pattern: /^ke-?ki$/i, katakana: 'ケーキ', vi: 'bánh kem' },
    { pattern: /^supu-?n$/i, katakana: 'スプーン', vi: 'thìa' },
    { pattern: /^fo-?ku$/i, katakana: 'フォーク', vi: 'dĩa' },
    { pattern: /^naifu$/i, katakana: 'ナイフ', vi: 'dao' },
    { pattern: /^fakkusu|fasukusu/i, katakana: 'ファクス', vi: 'fax' },
    { pattern: /^purezento$/i, katakana: 'プレゼント', vi: 'quà tặng' },
    { pattern: /^kurisumasu$/i, katakana: 'クリスマス', vi: 'Giáng sinh' },
    { pattern: /^hansamu$/i, katakana: 'ハンサム', vi: 'đẹp trai' },
    { pattern: /^hoteru$/i, katakana: 'ホテル', vi: 'khách sạn' },
    { pattern: /^su-?pu$/i, katakana: 'スープ', vi: 'súp' },
    { pattern: /^pinku$/i, katakana: 'ピンク', vi: 'màu hồng' },
    { pattern: /^gure-?$/i, katakana: 'グレー', vi: 'màu xám' },
    { pattern: /^beeju$/i, katakana: 'ベージュ', vi: 'màu be' },
    { pattern: /^supo-?tsu$/i, katakana: 'スポーツ', vi: 'thể thao' },
    { pattern: /^sakka-?$/i, katakana: 'サッカー', vi: 'bóng đá' },
    { pattern: /^tenisu$/i, katakana: 'テニス', vi: 'quần vợt' },
    { pattern: /^dansu$/i, katakana: 'ダンス', vi: 'khiêu vũ' },
    { pattern: /^pa-?tii?$/i, katakana: 'パーティー', vi: 'bữa tiệc' },
    { pattern: /^konsa-?to$/i, katakana: 'コンサート', vi: 'hòa nhạc' },
    { pattern: /^karaoke$/i, katakana: 'カラオケ', vi: 'karaoke' },
    { pattern: /^posuto$/i, katakana: 'ポスト', vi: 'hòm thư' },
    { pattern: /^biru$/i, katakana: 'ビル', vi: 'tòa nhà' },
    { pattern: /^su-?pa-?$/i, katakana: 'スーパー', vi: 'siêu thị' },
    { pattern: /^resutoran$/i, katakana: 'レストラン', vi: 'nhà hàng' },
    { pattern: /^apa-?to$/i, katakana: 'アパート', vi: 'căn hộ' },
    { pattern: /^te-?buru$/i, katakana: 'テーブル', vi: 'bàn' },
    { pattern: /^beddo$/i, katakana: 'ベッド', vi: 'giường' },
    { pattern: /^doa$/i, katakana: 'ドア', vi: 'cửa ra vào' },
    { pattern: /^ka-?ten$/i, katakana: 'カーテン', vi: 'rèm' },
    { pattern: /^karenda-?$/i, katakana: 'カレンダー', vi: 'lịch' },
    { pattern: /^sandoitchi$/i, katakana: 'サンドイッチ', vi: 'bánh mì kẹp' },
    { pattern: /^kare-?$/i, katakana: 'カレー', vi: 'cà ri' },
    { pattern: /^aisukuri-?mu$/i, katakana: 'アイスクリーム', vi: 'kem' },
    { pattern: /^pu-?ru$/i, katakana: 'プール', vi: 'hồ bơi' },
    { pattern: /^sukii$/i, katakana: 'スキー', vi: 'trượt tuyết' },
    { pattern: /^katarogu$/i, katakana: 'カタログ', vi: 'ca-ta-lô' },
    { pattern: /^shawa-?$/i, katakana: 'シャワー', vi: 'vòi hoa sen' },
    { pattern: /^ko-?to$/i, katakana: 'コート', vi: 'áo khoác' },
    { pattern: /^su-?tsu$/i, katakana: 'スーツ', vi: 'com-lê' },
    { pattern: /^se-?ta-?$/i, katakana: 'セーター', vi: 'áo len' },
    { pattern: /^shatsu$/i, katakana: 'シャツ', vi: 'áo sơ mi' },
    { pattern: /^nekutai$/i, katakana: 'ネクタイ', vi: 'cà vạt' }
  ];

  console.log('--- 1. CHECKING FOR KATAKANA LOANWORDS STORED AS HIRAGANA ---');
  let hiraMatches = 0;
  for (const w of dbRes.rows) {
    const isPureHira = /^[\u3040-\u309F\s]+$/.test(w.kana || '');
    if (isPureHira) {
      for (const rule of loanwordsRules) {
        if (rule.pattern.test(w.romaji || '') || (w.vietnamese && w.vietnamese.toLowerCase().includes(rule.vi))) {
          // Verify if it is really a loanword match
          console.log(`[Hiragana Mistake] L${w.lesson_number} id:${w.id} word:${w.kanji || w.kana} kana:${w.kana} -> should be Katakana: ${rule.katakana} (${rule.vi})`);
          hiraMatches++;
          break;
        }
      }
    }
  }
  console.log(`Total Hiragana loanword mistakes found: ${hiraMatches}\n`);

  // 2. CHECK FOR BOGUS / EXTRA WORDS NOT IN LESSONS
  console.log('--- 2. CHECKING FOR BOGUS / COMBINATIONS NOT IN STANDARD MINNA NO NIHONGO ---');
  const bogusWords = dbRes.rows.filter(w => {
    const k = w.kanji || '';
    const kana = w.kana || '';
    const vi = w.vietnamese || '';
    return (
      k.includes('の水曜日') || k.includes('の月曜日') || k.includes('の火曜日') || k.includes('の木曜日') || k.includes('の金曜日') || k.includes('の土曜日') || k.includes('の日曜日') ||
      kana.includes('のすいようび') || kana.includes('のげつようび') || kana.includes('のかようび') || kana.includes('のもくようび') || kana.includes('のきんようび') || kana.includes('のどようび') || kana.includes('のにちようび') ||
      /buổi sáng thứ|buổi trưa thứ|buổi tối thứ/i.test(vi)
    );
  });
  console.log(`Found ${bogusWords.length} bogus combination phrases in DB.`);
  bogusWords.slice(0, 10).forEach(w => console.log(`  - [ID ${w.id}] L${w.lesson_number}: ${w.kanji || w.kana} (${w.vietnamese})`));

  process.exit(0);
}

audit().catch(console.error);
