const db = require('../db');

async function migrateForumComments() {
  console.log('Running forum_comments schema migration...');
  const pool = db.pool;
  if (!pool) {
    console.error('Database pool not available.');
    process.exit(1);
  }

  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS forum_comments (
        id SERIAL PRIMARY KEY,
        article_id VARCHAR(100) NOT NULL,
        author VARCHAR(255) DEFAULT 'Bạn đọc ẩn danh',
        author_name VARCHAR(255) DEFAULT 'Bạn đọc ẩn danh',
        rating INT DEFAULT 5,
        content TEXT NOT NULL,
        likes INT DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
      ALTER TABLE forum_comments ADD COLUMN IF NOT EXISTS author VARCHAR(255) DEFAULT 'Bạn đọc ẩn danh';
      ALTER TABLE forum_comments ADD COLUMN IF NOT EXISTS author_name VARCHAR(255) DEFAULT 'Bạn đọc ẩn danh';
      ALTER TABLE forum_comments ADD COLUMN IF NOT EXISTS rating INT DEFAULT 5;
      ALTER TABLE forum_comments ADD COLUMN IF NOT EXISTS likes INT DEFAULT 0;
      ALTER TABLE forum_comments ALTER COLUMN article_id TYPE VARCHAR(100);
      UPDATE forum_comments SET author = author_name WHERE author IS NULL AND author_name IS NOT NULL;
      UPDATE forum_comments SET author_name = author WHERE author_name IS NULL AND author IS NOT NULL;
    `);

    console.log('forum_comments migration successful.');
    process.exit(0);
  } catch (err) {
    console.error('Migration error:', err.message);
    process.exit(1);
  }
}

setTimeout(migrateForumComments, 1500);
