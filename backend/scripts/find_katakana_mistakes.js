const fs = require('fs');
const path = require('path');

const jsonPath = path.join(__dirname, '../../database/n5_full_lessons.json');
const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

console.log('--- SCANNING NO-KANJI HIRAGANA WORDS IN JSON ---');
const found = [];
for (const [l, words] of Object.entries(data)) {
  for (const w of words) {
    if (!w.kanji || w.kanji === '–' || w.kanji === '-' || w.kanji === '—' || w.kanji === '') {
      const kana = w.kana || '';
      if (/^[\u3040-\u309F\s〜［］\/\(\)]+$/.test(kana)) {
        found.push({ lesson: l, kana, romaji: w.romaji, vi: w.vietnamese });
      }
    }
  }
}

console.log(`Total words with no kanji and hiragana: ${found.length}`);
// Let's filter those that look like English/foreign loanwords
const loanwordKeywords = ['cà phê', 'tivi', 'bút', 'băng', 'bánh', 'kem', 'súp', 'thìa', 'dao', 'dĩa', 'nước ngọt', 'nước hoa quả', 'bia', 'rượu', 'khách sạn', 'nhà hàng', 'siêu thị', 'bách hóa', 'taxi', 'xe buýt', 'bàn', 'giường', 'rèm', 'cửa', 'thẻ', 'lịch', 'áo', 'quần', 'sơ mi', 'cà vạt', 'len', 'bóng đá', 'quần vợt', 'tiệc', 'hòa nhạc', 'máy tính', 'vở', 'thang máy', 'toilet', 'vệ sinh', 'hòm thư', 'tòa nhà', 'sân bay', 'ga'];

for (const f of found) {
  const viLower = (f.vi || '').toLowerCase();
  for (const kw of loanwordKeywords) {
    if (viLower.includes(kw)) {
      console.log(`L${f.lesson}: kana='${f.kana}' (${f.romaji}) => "${f.vi}"`);
      break;
    }
  }
}
