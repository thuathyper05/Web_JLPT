const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

// Load comprehensive multi-level JSON datasets with fallback
const dataDir = path.join(__dirname, 'data');

let allVocabularies = [];
let allLessons = [];
let allKanji = [];
let allGrammar = [];
let allParticles = [];
let allParticleExercises = [];

try {
  if (fs.existsSync(path.join(dataDir, 'all_vocabularies.json'))) {
    allVocabularies = JSON.parse(fs.readFileSync(path.join(dataDir, 'all_vocabularies.json'), 'utf8'));
  }
  if (fs.existsSync(path.join(dataDir, 'all_lessons.json'))) {
    allLessons = JSON.parse(fs.readFileSync(path.join(dataDir, 'all_lessons.json'), 'utf8'));
  }
  if (fs.existsSync(path.join(dataDir, 'all_kanji.json'))) {
    allKanji = JSON.parse(fs.readFileSync(path.join(dataDir, 'all_kanji.json'), 'utf8'));
  }
  if (fs.existsSync(path.join(dataDir, 'all_grammar.json'))) {
    allGrammar = JSON.parse(fs.readFileSync(path.join(dataDir, 'all_grammar.json'), 'utf8'));
  }
  if (fs.existsSync(path.join(dataDir, 'all_particles.json'))) {
    allParticles = JSON.parse(fs.readFileSync(path.join(dataDir, 'all_particles.json'), 'utf8'));
  }
  if (fs.existsSync(path.join(dataDir, 'all_particle_exercises.json'))) {
    allParticleExercises = JSON.parse(fs.readFileSync(path.join(dataDir, 'all_particle_exercises.json'), 'utf8'));
  }
} catch (e) {
  console.warn('[Data Engine] Warning reading all_* datasets:', e.message);
}

// Fallback to N5 files if all_* not yet generated
if (allVocabularies.length === 0 && fs.existsSync(path.join(dataDir, 'n5_full_lessons.json'))) {
  const n5Raw = JSON.parse(fs.readFileSync(path.join(dataDir, 'n5_full_lessons.json'), 'utf8'));
  let idC = 1;
  Object.keys(n5Raw).forEach((lKey) => {
    const lNum = parseInt(lKey);
    const words = n5Raw[lKey];
    if (Array.isArray(words)) {
      words.forEach((w) => {
        allVocabularies.push({
          id: idC++,
          level: 'N5',
          lesson_number: lNum,
          kanji: w.kanji || '',
          kana: w.kana || '',
          clean_kana: w.clean_kana || w.kana || '',
          romaji: w.romaji || '',
          vietnamese: w.vietnamese || '',
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
  console.log(`[Data Engine] Running in In-Memory Mode with ${allVocabularies.length} vocabularies, ${allGrammar.length} grammar, ${allKanji.length} kanji.`);
}

module.exports = {
  pool,
  isDbConnected: () => isDbConnected,
  data: {
    lessons: allVocabularies,
    lessonList: allLessons,
    grammar: allGrammar,
    kanji: allKanji,
    particles: allParticles,
    particleExercises: allParticleExercises
  }
};
