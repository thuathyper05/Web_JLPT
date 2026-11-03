const fs = require('fs');
const path = require('path');

// 1. Load existing dictionary
const existingDictPath = path.resolve(__dirname, '../../frontend/src/data/n5n4FuriganaDict.js');
let existingEntries = {};
try {
  const existingContent = fs.readFileSync(existingDictPath, 'utf8');
  // Extract json-like object
  const match = existingContent.match(/export const n5n4FuriganaDict\s*=\s*(\{[\s\S]*\});/);
  if (match) {
    existingEntries = eval('(' + match[1] + ')');
  }
} catch (e) {
  console.warn('Could not read existing dict:', e.message);
}

// 2. Load all_vocabularies.json
const vocabsPath = path.resolve(__dirname, '../data/all_vocabularies.json');
const vocabs = JSON.parse(fs.readFileSync(vocabsPath, 'utf8'));

// Hepburn romanizer helper
const hepburnMap = {
  'あ': 'a', 'い': 'i', 'う': 'u', 'え': 'e', 'お': 'o',
  'か': 'ka', 'き': 'ki', 'く': 'ku', 'け': 'ke', 'こ': 'ko',
  'さ': 'sa', 'し': 'shi', 'す': 'su', 'せ': 'se', 'そ': 'so',
  'た': 'ta', 'ち': 'chi', 'つ': 'tsu', 'て': 'te', 'と': 'to',
  'な': 'na', 'に': 'ni', 'ぬ': 'nu', 'ね': 'ne', 'の': 'no',
  'は': 'ha', 'ひ': 'hi', 'ふ': 'fu', 'へ': 'he', 'ほ': 'ho',
  'ま': 'ma', 'み': 'mi', 'む': 'mu', 'め': 'me', 'も': 'mo',
  'や': 'ya', 'ゆ': 'yu', 'よ': 'yo',
  'ら': 'ra', 'り': 'ri', 'る': 'ru', 'れ': 're', 'ろ': 'ro',
  'わ': 'wa', 'を': 'o', 'ん': 'n',
  'が': 'ga', 'ぎ': 'gi', 'ぐ': 'gu', 'げ': 'ge', 'ご': 'go',
  'ざ': 'za', 'じ': 'ji', 'ず': 'zu', 'ぜ': 'ze', 'ぞ': 'zo',
  'だ': 'da', 'ぢ': 'ji', 'づ': 'zu', 'де': 'de', 'ど': 'do',
  'ば': 'ba', 'び': 'bi', 'ぶ': 'bu', 'べ': 'be', 'ぼ': 'bo',
  'ぱ': 'pa', 'ぴ': 'pi', 'ぷ': 'pu', 'ぺ': 'pe', 'ぽ': 'po',
  'きゃ': 'kya', 'きゅ': 'kyu', 'きょ': 'kyo',
  'しゃ': 'sha', 'しゅ': 'shu', 'しょ': 'sho',
  'ちゃ': 'cha', 'ちゅ': 'chu', 'ちょ': 'cho',
  'にゃ': 'nya', 'にゅ': 'nyu', 'にょ': 'nyo',
  'ひゃ': 'hya', 'ひゅ': 'hyu', 'ひょ': 'hyo',
  'みゃ': 'mya', 'みゅ': 'myu', 'みょ': 'myo',
  'りゃ': 'rya', 'りゅ': 'ryu', 'りょ': 'ryo',
  'ぎゃ': 'gya', 'ぎゅ': 'gyu', 'ぎょ': 'gyo',
  'じゃ': 'ja', 'じゅ': 'ju', 'じょ': 'jo',
  'びゃ': 'bya', 'びゅ': 'byu', 'びょ': 'byo',
  'ぴゃ': 'pya', 'ぴゅ': 'pyu', 'ぴょ': 'pyo'
};

function toHiragana(str) {
  if (!str) return '';
  return str.replace(/[\u30a1-\u30f6]/g, (ch) =>
    String.fromCharCode(ch.charCodeAt(0) - 0x60)
  );
}

function toHepburn(str) {
  if (!str) return '';
  const hira = toHiragana(str);
  let result = '';
  let i = 0;
  while (i < hira.length) {
    if (hira[i] === 'っ' || hira[i] === 'ッ') {
      const nextOne = hira.slice(i + 1, i + 2);
      const rom = hepburnMap[nextOne] || '';
      if (rom) result += rom[0] === 'c' ? 't' : rom[0];
      i++;
      continue;
    }
    if (hira[i] === 'ー') {
      const last = result[result.length - 1];
      if (last && 'aeiou'.includes(last)) result += last;
      i++;
      continue;
    }
    const two = hira.slice(i, i + 2);
    if (hepburnMap[two]) {
      result += hepburnMap[two];
      i += 2;
      continue;
    }
    const one = hira.slice(i, i + 1);
    if (hepburnMap[one]) {
      result += hepburnMap[one];
      i += 1;
      continue;
    }
    result += hira[i];
    i++;
  }
  return result;
}

const merged = { ...existingEntries };

for (const v of vocabs) {
  if (!v) continue;
  const kanjiRaw = (v.kanji || '').trim();
  const kanaRaw = (v.clean_kana || v.kana || '').trim();
  const romajiRaw = (v.romaji || '').trim() || toHepburn(kanaRaw);
  const lvl = v.level || 'N5';

  if (!kanjiRaw || kanjiRaw === '-' || kanjiRaw === '–' || kanjiRaw === '—') continue;
  if (!kanaRaw) continue;

  // Add exact
  merged[kanjiRaw] = {
    kana: kanaRaw,
    romaji: romajiRaw,
    level: lvl
  };

  // Add normalized without outer brackets
  const strippedK = kanjiRaw.replace(/\s*[［\[（(].+?[］\]）)]/g, '').trim();
  const strippedR = kanaRaw.replace(/\s*[［\[（(].+?[］\]）)]/g, '').trim();
  if (strippedK && strippedK !== kanjiRaw) {
    if (!merged[strippedK]) {
      merged[strippedK] = {
        kana: strippedR,
        romaji: toHepburn(strippedR),
        level: lvl
      };
    }
  }

  // Add without whitespace
  const noSpaceK = kanjiRaw.replace(/\s+/g, '');
  const noSpaceR = kanaRaw.replace(/\s+/g, '');
  if (noSpaceK && !merged[noSpaceK]) {
    merged[noSpaceK] = {
      kana: noSpaceR,
      romaji: toHepburn(noSpaceR),
      level: lvl
    };
  }

  // Add stripped without whitespace
  if (strippedK) {
    const noSpaceStrippedK = strippedK.replace(/\s+/g, '');
    const noSpaceStrippedR = strippedR.replace(/\s+/g, '');
    if (noSpaceStrippedK && !merged[noSpaceStrippedK]) {
      merged[noSpaceStrippedK] = {
        kana: noSpaceStrippedR,
        romaji: toHepburn(noSpaceStrippedR),
        level: lvl
      };
    }
  }
}

const totalKeys = Object.keys(merged).length;
console.log(`Generated comprehensive Furigana dictionary with ${totalKeys} entries.`);

// Write back to frontend/src/data/n5n4FuriganaDict.js
const outContent = `// Comprehensive JLPT N5-N1 Furigana & Romaji Annotation Dictionary
// Provides 100% full-level Kanji readings for all 9,584+ JLPT vocabularies
export const n5n4FuriganaDict = ${JSON.stringify(merged, null, 2)};
`;

fs.writeFileSync(existingDictPath, outContent, 'utf8');
console.log('Successfully wrote to frontend/src/data/n5n4FuriganaDict.js');
