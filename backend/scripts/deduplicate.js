const bcrypt = require('bcryptjs');
const db = require('../config/db');

const ADMIN_EMAIL = 'thuathyper05@gmail.com';
const ADMIN_PASSWORD_RAW = 'Thuatnguyen1204@@@';

/**
 * Perform database deduplication, add unique constraints, and seed/verify the admin user.
 */
async function deduplicateDatabase() {
  console.log('[Migration] Starting database deduplication & consistency check...');

  try {
    // 1. Ensure `role` column exists in users
    await db.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'users' AND column_name = 'role'
        ) THEN
          ALTER TABLE users ADD COLUMN role VARCHAR(50) DEFAULT 'user';
        END IF;
      END $$;
    `);

    // 2. Ensure admin account exists with role = 'admin' and exact specified password
    const adminHash = await bcrypt.hash(ADMIN_PASSWORD_RAW, 10);
    const existingAdmin = await db.query(
      'SELECT id, email, role FROM users WHERE LOWER(email) = $1',
      [ADMIN_EMAIL.toLowerCase()]
    );

    if (existingAdmin.rows.length === 0) {
      await db.query(`
        INSERT INTO users (username, email, password_hash, role)
        VALUES ($1, $2, $3, $4)
      `, ['thuathyper05', ADMIN_EMAIL.toLowerCase(), adminHash, 'admin']);
      console.log(`[Admin] Created admin account: ${ADMIN_EMAIL}`);
    } else {
      await db.query(`
        UPDATE users 
        SET role = 'admin', password_hash = $1 
        WHERE LOWER(email) = $2
      `, [adminHash, ADMIN_EMAIL.toLowerCase()]);
      console.log(`[Admin] Verified & updated admin account: ${ADMIN_EMAIL}`);
    }

    // 3. Deduplicate Vocabularies
    // Check if duplicate vocabulary entries exist
    const dupVocabCheck = await db.query(`
      SELECT COUNT(*)::int as total,
             COUNT(DISTINCT (lesson_number, order_num))::int as unique_count
      FROM vocabularies
    `);

    const totalVocabs = dupVocabCheck.rows[0].total;
    const uniqueVocabs = dupVocabCheck.rows[0].unique_count;
    const dupCount = totalVocabs - uniqueVocabs;

    console.log(`[Vocab Check] Total: ${totalVocabs}, Unique: ${uniqueVocabs}, Duplicates: ${dupCount}`);

    let vocabRemoved = 0;
    if (dupCount > 0) {
      console.log(`[Vocab Cleanup] Removing ${dupCount} duplicate vocabulary records...`);

      // Remap foreign key references in user_progress, favorites, notes before deleting
      await db.query(`
        DO $$
        DECLARE
          r RECORD;
        BEGIN
          FOR r IN (
            WITH ranked AS (
              SELECT id, lesson_number, order_num,
                     FIRST_VALUE(id) OVER (PARTITION BY lesson_number, order_num ORDER BY id ASC) as canonical_id,
                     ROW_NUMBER() OVER (PARTITION BY lesson_number, order_num ORDER BY id ASC) as rn
              FROM vocabularies
            )
            SELECT id as dup_id, canonical_id
            FROM ranked
            WHERE rn > 1
          ) LOOP
            -- user_progress: remove dup row if canonical already exists for this user, else update to canonical
            DELETE FROM user_progress WHERE vocabulary_id = r.dup_id AND user_id IN (
              SELECT user_id FROM user_progress WHERE vocabulary_id = r.canonical_id
            );
            UPDATE user_progress SET vocabulary_id = r.canonical_id WHERE vocabulary_id = r.dup_id;

            -- favorites: remove dup row if canonical already exists, else update
            DELETE FROM favorites WHERE vocabulary_id = r.dup_id AND user_id IN (
              SELECT user_id FROM favorites WHERE vocabulary_id = r.canonical_id
            );
            UPDATE favorites SET vocabulary_id = r.canonical_id WHERE vocabulary_id = r.dup_id;

            -- notes: remove dup row if canonical already exists, else update
            DELETE FROM notes WHERE vocabulary_id = r.dup_id AND user_id IN (
              SELECT user_id FROM notes WHERE vocabulary_id = r.canonical_id
            );
            UPDATE notes SET vocabulary_id = r.canonical_id WHERE vocabulary_id = r.dup_id;

            -- Delete the duplicate vocabulary row
            DELETE FROM vocabularies WHERE id = r.dup_id;
          END LOOP;
        END $$;
      `);

      vocabRemoved = dupCount;
      console.log(`[Vocab Cleanup] Successfully deleted ${dupCount} duplicate vocabulary records!`);
    }

    // Enforce UNIQUE constraint on vocabularies (lesson_number, order_num)
    await db.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS uq_vocab_lesson_order ON vocabularies (lesson_number, order_num);
    `);

    // 4. Deduplicate Kanji
    const dupKanjiCheck = await db.query(`
      SELECT COUNT(*)::int as total,
             COUNT(DISTINCT kanji)::int as unique_count
      FROM kanji
    `);

    const totalKanji = dupKanjiCheck.rows[0].total;
    const uniqueKanji = dupKanjiCheck.rows[0].unique_count;
    const dupKanjiCount = totalKanji - uniqueKanji;

    console.log(`[Kanji Check] Total: ${totalKanji}, Unique: ${uniqueKanji}, Duplicates: ${dupKanjiCount}`);

    let kanjiRemoved = 0;
    if (dupKanjiCount > 0) {
      console.log(`[Kanji Cleanup] Removing ${dupKanjiCount} duplicate kanji records...`);
      await db.query(`
        WITH ranked_k AS (
          SELECT id,
                 ROW_NUMBER() OVER (PARTITION BY kanji ORDER BY id ASC) as rn
          FROM kanji
        )
        DELETE FROM kanji WHERE id IN (SELECT id FROM ranked_k WHERE rn > 1);
      `);
      kanjiRemoved = dupKanjiCount;
      console.log(`[Kanji Cleanup] Successfully deleted ${dupKanjiCount} duplicate kanji records!`);
    }

    // Enforce UNIQUE constraint on kanji(kanji)
    await db.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS uq_kanji_char ON kanji (kanji);
    `);

    // 5. Final verification count
    const [finalVocab, finalKanji, finalLessons, userCount] = await Promise.all([
      db.query('SELECT COUNT(*)::int as c FROM vocabularies'),
      db.query('SELECT COUNT(*)::int as c FROM kanji'),
      db.query('SELECT COUNT(*)::int as c FROM lessons'),
      db.query('SELECT COUNT(*)::int as c FROM users')
    ]);

    const resultSummary = {
      success: true,
      vocabRemoved,
      kanjiRemoved,
      stats: {
        totalLessons: finalLessons.rows[0].c,
        totalVocabularies: finalVocab.rows[0].c,
        totalKanji: finalKanji.rows[0].c,
        totalUsers: userCount.rows[0].c
      },
      adminEmail: ADMIN_EMAIL,
      timestamp: new Date().toISOString()
    };

    console.log('[Migration Completed] Summary:', resultSummary);
    return resultSummary;
  } catch (error) {
    console.error('[Migration Error] Database deduplication failed:', error);
    throw error;
  }
}

if (require.main === module) {
  deduplicateDatabase()
    .then((res) => {
      console.log('Finished with status:', res);
      process.exit(0);
    })
    .catch((err) => {
      console.error('Fatal error:', err);
      process.exit(1);
    });
}

module.exports = { deduplicateDatabase };
