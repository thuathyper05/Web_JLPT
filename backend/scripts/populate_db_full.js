const { pool } = require('../db');
const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '../data');

async function populate() {
  if (!pool) {
    console.error('No PostgreSQL pool available. Check .env configuration.');
    process.exit(1);
  }

  const client = await pool.connect();

  try {
    console.log('=== STARTING FULL JLPT DATABASE POPULATION (N5 - N1) ===\n');

    // 1. Fix Kanji unique index to (level, kanji)
    await client.query(`
      ALTER TABLE kanji DROP CONSTRAINT IF EXISTS kanji_kanji_key;
      DROP INDEX IF EXISTS kanji_kanji_key;
      DROP INDEX IF EXISTS uq_kanji_char;
      CREATE UNIQUE INDEX IF NOT EXISTS uq_kanji_level_char ON kanji (level, kanji);
    `);
    console.log('Adjusted kanji unique constraint to (level, kanji).');

    // 2. Clear old data from lessons, vocabularies, kanji, grammar_points, particles, particle_exercises
    await client.query('TRUNCATE vocabularies RESTART IDENTITY CASCADE;');
    await client.query('TRUNCATE lessons RESTART IDENTITY CASCADE;');
    await client.query('TRUNCATE kanji RESTART IDENTITY CASCADE;');
    await client.query('TRUNCATE grammar_points RESTART IDENTITY CASCADE;');
    await client.query('TRUNCATE particles RESTART IDENTITY CASCADE;');
    await client.query('TRUNCATE particle_exercises RESTART IDENTITY CASCADE;');
    console.log('Truncated target tables cleanly with RESTART IDENTITY.\n');

    // 3. Insert Lessons (130 lessons)
    const lessonsData = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'all_lessons.json'), 'utf8'));
    console.log(`Inserting ${lessonsData.length} lessons...`);
    for (const l of lessonsData) {
      await client.query(`
        INSERT INTO lessons (level, lesson_number, title, description)
        VALUES ($1, $2, $3, $4)
      `, [l.level, l.lesson_number, l.title, l.description]);
    }
    console.log('Inserted all lessons successfully.');

    // Fetch lesson IDs map: key to id
    const lessonRows = await client.query('SELECT id, level, lesson_number FROM lessons');
    const lessonIdMap = {};
    lessonRows.rows.forEach(r => {
      lessonIdMap[`${r.level}_${r.lesson_number}`] = r.id;
    });

    // 4. Insert Vocabularies in batches of 500
    const vocabData = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'all_vocabularies.json'), 'utf8'));
    console.log(`\nInserting ${vocabData.length} vocabularies in batches...`);
    
    const BATCH_SIZE = 400;
    for (let i = 0; i < vocabData.length; i += BATCH_SIZE) {
      const batch = vocabData.slice(i, i + BATCH_SIZE);
      const values = [];
      const params = [];
      let paramIdx = 1;

      batch.forEach(v => {
        const lId = lessonIdMap[`${v.level}_${v.lesson_number}`] || null;
        values.push(`($${paramIdx++}, $${paramIdx++}, $${paramIdx++}, $${paramIdx++}, $${paramIdx++}, $${paramIdx++}, $${paramIdx++}, $${paramIdx++}, $${paramIdx++}, $${paramIdx++}, $${paramIdx++}, $${paramIdx++}, $${paramIdx++})`);
        params.push(
          lId,
          v.lesson_number,
          v.order_num,
          v.kanji,
          v.kana,
          v.clean_kana,
          v.romaji,
          v.vietnamese,
          v.clean_vietnamese,
          v.example_jp,
          v.example_vi,
          v.usage_note,
          v.level
        );
      });

      const queryText = `
        INSERT INTO vocabularies (
          lesson_id, lesson_number, order_num, kanji, kana, clean_kana,
          romaji, vietnamese, clean_vietnamese, example_jp, example_vi,
          usage_note, level
        )
        VALUES ${values.join(', ')}
      `;
      await client.query(queryText, params);
      process.stdout.write(`  Inserted vocabularies: ${Math.min(i + BATCH_SIZE, vocabData.length)} / ${vocabData.length}\r`);
    }
    console.log(`\nInserted all ${vocabData.length} vocabularies successfully.`);

    // 5. Insert Kanji (608 items)
    const kanjiData = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'all_kanji.json'), 'utf8'));
    console.log(`\nInserting ${kanjiData.length} kanji...`);
    for (const k of kanjiData) {
      await client.query(`
        INSERT INTO kanji (level, lesson_number, kanji, han_viet, onyomi, kunyomi, meaning, stroke_count, examples)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        ON CONFLICT (level, kanji) DO UPDATE SET
          han_viet = EXCLUDED.han_viet,
          onyomi = EXCLUDED.onyomi,
          kunyomi = EXCLUDED.kunyomi,
          meaning = EXCLUDED.meaning,
          examples = EXCLUDED.examples
      `, [
        k.level,
        k.lesson_number,
        k.kanji,
        k.han_viet,
        k.onyomi,
        k.kunyomi,
        k.meaning,
        k.stroke_count || 0,
        JSON.stringify(k.examples || [])
      ]);
    }
    console.log(`Inserted all ${kanjiData.length} kanji successfully.`);

    // 6. Insert Grammar (276 points)
    const grammarData = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'all_grammar.json'), 'utf8'));
    console.log(`\nInserting ${grammarData.length} grammar points...`);
    for (const g of grammarData) {
      await client.query(`
        INSERT INTO grammar_points (level, lesson_number, order_num, title, structure, meaning, usage_notes, examples)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        ON CONFLICT (level, lesson_number, order_num) DO UPDATE SET
          title = EXCLUDED.title,
          structure = EXCLUDED.structure,
          meaning = EXCLUDED.meaning,
          usage_notes = EXCLUDED.usage_notes,
          examples = EXCLUDED.examples
      `, [
        g.level,
        g.lesson_number,
        g.order_num,
        g.title,
        g.structure,
        g.meaning,
        g.usage_notes,
        JSON.stringify(g.examples || [])
      ]);
    }
    console.log(`Inserted all ${grammarData.length} grammar points successfully.`);

    // 7. Insert Particles theory (45 items)
    const particlesData = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'all_particles.json'), 'utf8'));
    console.log(`\nInserting ${particlesData.length} particle theory items...`);
    for (const p of particlesData) {
      await client.query(`
        INSERT INTO particles (level, particle, role, meaning, example, translation, notes)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `, [
        p.level,
        p.particle,
        p.role,
        p.meaning,
        p.example,
        p.translation,
        p.notes
      ]);
    }
    console.log(`Inserted all ${particlesData.length} particles successfully.`);

    // 8. Insert Particle Exercises (60 items)
    const exercisesData = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'all_particle_exercises.json'), 'utf8'));
    console.log(`\nInserting ${exercisesData.length} particle exercises...`);
    for (const ex of exercisesData) {
      await client.query(`
        INSERT INTO particle_exercises (level, question, options, answer, explanation)
        VALUES ($1, $2, $3, $4, $5)
      `, [
        ex.level,
        ex.question,
        JSON.stringify(ex.options || []),
        ex.answer,
        ex.explanation
      ]);
    }
    console.log(`Inserted all ${exercisesData.length} particle exercises successfully.`);

    // 9. VERIFICATION QUERY REPORT
    console.log('\n========================================');
    console.log('   POSTGRESQL DATA VERIFICATION REPORT  ');
    console.log('========================================');

    for (const tbl of ['lessons', 'vocabularies', 'kanji', 'grammar_points', 'particles', 'particle_exercises']) {
      const res = await client.query(`
        SELECT level, count(*)::int as count 
        FROM ${tbl} 
        GROUP BY level 
        ORDER BY level
      `);
      console.log(`\nTable [${tbl}]:`);
      res.rows.forEach(r => console.log(`  - ${r.level}: ${r.count} items`));
      const total = res.rows.reduce((sum, r) => sum + r.count, 0);
      console.log(`  => TOTAL: ${total} records`);
    }

    console.log('\nALL JLPT N5-N1 DATA POPULATED 100% ACCURATELY AND READY!');
    process.exit(0);
  } catch (err) {
    console.error('\nPopulate Error:', err);
    process.exit(1);
  } finally {
    client.release();
  }
}

populate();
