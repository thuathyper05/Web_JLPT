const path = require('path');
const fs = require('fs');

let cachedVocabs = null;
let cachedLessons = null;
let cachedKanji = null;

function loadFallbackData() {
  if (cachedVocabs && cachedLessons && cachedKanji) {
    return { cachedVocabs, cachedLessons, cachedKanji };
  }

  // Load 25 lessons & 1589 vocabularies from n5_full_lessons.json
  try {
    const jsonPath = path.join(__dirname, '../../database/n5_full_lessons.json');
    if (fs.existsSync(jsonPath)) {
      const rawData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
      const allVocabs = [];
      const lessonsList = [];

      let vocabIdCounter = 1;
      for (let i = 1; i <= 25; i++) {
        const key = String(i);
        const words = rawData[key] || [];
        
        lessonsList.push({
          id: i,
          lesson_number: i,
          title: `Bài ${i}`,
          description: `Từ vựng Minna no Nihongo Bài ${i}`,
          vocab_count: words.length
        });

        words.forEach((w) => {
          allVocabs.push({
            id: vocabIdCounter++,
            lesson_id: i,
            lesson_number: i,
            kanji: w.kanji || '',
            kana: w.kana || '',
            clean_kana: w.clean_kana || w.kana || '',
            romaji: w.romaji || '',
            vietnamese: w.vietnamese || '',
            clean_vietnamese: w.clean_vietnamese || w.vietnamese || '',
            word_type: w.word_type || '',
            example_jp: w.example_jp || null,
            example_vi: w.example_vi || null
          });
        });
      }

      cachedLessons = lessonsList;
      cachedVocabs = allVocabs;
    }
  } catch (err) {
    console.warn('[Fallback Data] Error reading n5_full_lessons.json:', err.message);
  }

  // Load Kanji from seedKanji.js if available
  try {
    const kanjiSeedPath = path.join(__dirname, '../seedKanji.js');
    if (fs.existsSync(kanjiSeedPath)) {
      const fileContent = fs.readFileSync(kanjiSeedPath, 'utf8');
      const match = fileContent.match(/const n5KanjiList = (\[[\s\S]*?\]);/);
      if (match) {
        // Safe evaluation of the array literal
        const kanjiArray = new Function(`return ${match[1]};`)();
        cachedKanji = kanjiArray.map((k, idx) => ({
          id: idx + 1,
          kanji: k.kanji,
          onyomi: k.onyomi,
          kunyomi: k.kunyomi,
          han_viet: k.han_viet,
          stroke_count: k.stroke || k.stroke_count || 1,
          meaning: k.meaning,
          examples: k.examples || null,
          level: k.level || 'N5'
        }));
      }
    }
  } catch (err) {
    console.warn('[Fallback Data] Error reading seedKanji.js:', err.message);
  }

  if (!cachedLessons) cachedLessons = [];
  if (!cachedVocabs) cachedVocabs = [];
  if (!cachedKanji) cachedKanji = [];

  return { cachedVocabs, cachedLessons, cachedKanji };
}

// Initial load
loadFallbackData();

const getFallbackLessons = () => {
  const { cachedLessons } = loadFallbackData();
  return cachedLessons;
};

const getFallbackLessonById = (id) => {
  const { cachedLessons } = loadFallbackData();
  const num = parseInt(id);
  return cachedLessons.find(l => l.id === num || l.lesson_number === num) || null;
};

const getFallbackVocabularies = (params = {}) => {
  const { cachedVocabs } = loadFallbackData();
  let list = [...cachedVocabs];

  if (params.lesson_id || params.lesson) {
    const lessonNum = parseInt(params.lesson_id || params.lesson);
    list = list.filter(v => v.lesson_number === lessonNum || v.lesson_id === lessonNum);
  }

  if (params.search) {
    const q = params.search.toLowerCase().trim();
    list = list.filter(v =>
      (v.kanji && v.kanji.toLowerCase().includes(q)) ||
      (v.kana && v.kana.toLowerCase().includes(q)) ||
      (v.romaji && v.romaji.toLowerCase().includes(q)) ||
      (v.vietnamese && v.vietnamese.toLowerCase().includes(q)) ||
      (v.clean_vietnamese && v.clean_vietnamese.toLowerCase().includes(q))
    );
  }

  return list;
};

const getFallbackKanji = (params = {}) => {
  const { cachedKanji } = loadFallbackData();
  let list = [...cachedKanji];

  if (params.level && params.level !== 'all') {
    list = list.filter(k => k.level.toUpperCase() === params.level.toUpperCase());
  }

  if (params.search) {
    const q = params.search.toLowerCase().trim();
    list = list.filter(k =>
      k.kanji.toLowerCase().includes(q) ||
      k.han_viet.toLowerCase().includes(q) ||
      k.meaning.toLowerCase().includes(q) ||
      k.onyomi.toLowerCase().includes(q) ||
      k.kunyomi.toLowerCase().includes(q)
    );
  }

  return list;
};

module.exports = {
  getFallbackLessons,
  getFallbackLessonById,
  getFallbackVocabularies,
  getFallbackKanji
};
