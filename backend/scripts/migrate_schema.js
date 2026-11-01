const { pool } = require('../db');

async function migrate() {
  try {
    console.log('Starting schema migration...');

    // 1. Drop existing single-column unique on lessons(lesson_number)
    await pool.query(`
      ALTER TABLE lessons DROP CONSTRAINT IF EXISTS lessons_lesson_number_key;
      DROP INDEX IF EXISTS lessons_lesson_number_key;
    `);
    console.log('Dropped lessons_lesson_number_key constraint.');

    // Add unique constraint on (level, lesson_number)
    await pool.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS uq_lessons_level_lesson_num 
      ON lessons (level, lesson_number);
    `);
    console.log('Created uq_lessons_level_lesson_num unique index.');

    // 2. Add lesson_number to kanji table if missing
    await pool.query(`
      ALTER TABLE kanji ADD COLUMN IF NOT EXISTS lesson_number INT DEFAULT 1;
      CREATE INDEX IF NOT EXISTS idx_kanji_level_lesson ON kanji (level, lesson_number);
    `);
    console.log('Ensured kanji.lesson_number exists.');

    // 3. Create particles table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS particles (
        id SERIAL PRIMARY KEY,
        level VARCHAR(10) NOT NULL,
        particle VARCHAR(100) NOT NULL,
        role TEXT,
        meaning TEXT NOT NULL,
        example TEXT,
        translation TEXT,
        notes TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_particles_level ON particles(level);
    `);
    console.log('Ensured particles table exists.');

    // 4. Create particle_exercises table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS particle_exercises (
        id SERIAL PRIMARY KEY,
        level VARCHAR(10) NOT NULL,
        question TEXT NOT NULL,
        options JSONB NOT NULL,
        answer VARCHAR(50) NOT NULL,
        explanation TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_particle_exercises_level ON particle_exercises(level);
    `);
    console.log('Ensured particle_exercises table exists.');

    console.log('Schema migration completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Migration error:', err);
    process.exit(1);
  }
}

migrate();
