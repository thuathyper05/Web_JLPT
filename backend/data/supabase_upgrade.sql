-- ======================================================================
-- HYPER JAPANESE - SUPABASE UPGRADE MIGRATION (N5 DEN N1)
-- Du an Supabase hien tai: jlpt-n5 (wbzbncggvbzdtkbyveka)
-- ======================================================================

-- 1. NANG CAP CAU TRUC CAC BANG CU
ALTER TABLE users ADD COLUMN IF NOT EXISTS auth_provider VARCHAR(50) DEFAULT 'local';
ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'user';
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT;

ALTER TABLE lessons ADD COLUMN IF NOT EXISTS level VARCHAR(10) DEFAULT 'N5';
ALTER TABLE lessons DROP CONSTRAINT IF EXISTS lessons_lesson_number_key;
ALTER TABLE lessons DROP CONSTRAINT IF EXISTS uq_lessons_lesson_number;
CREATE UNIQUE INDEX IF NOT EXISTS uq_lessons_level_lesson ON lessons (level, lesson_number);

ALTER TABLE vocabularies ADD COLUMN IF NOT EXISTS level VARCHAR(10) DEFAULT 'N5';
ALTER TABLE vocabularies ADD COLUMN IF NOT EXISTS lesson_number INT DEFAULT 1;
ALTER TABLE vocabularies ADD COLUMN IF NOT EXISTS order_num INT DEFAULT 1;
ALTER TABLE vocabularies ADD COLUMN IF NOT EXISTS clean_kana VARCHAR(200);
ALTER TABLE vocabularies ADD COLUMN IF NOT EXISTS clean_vietnamese TEXT;
ALTER TABLE vocabularies ADD COLUMN IF NOT EXISTS example_jp TEXT;
ALTER TABLE vocabularies ADD COLUMN IF NOT EXISTS example_vi TEXT;
ALTER TABLE vocabularies ADD COLUMN IF NOT EXISTS usage_note TEXT;

ALTER TABLE kanji ADD COLUMN IF NOT EXISTS level VARCHAR(10) DEFAULT 'N5';
ALTER TABLE kanji ADD COLUMN IF NOT EXISTS lesson_number INT DEFAULT 1;
ALTER TABLE kanji ADD COLUMN IF NOT EXISTS stroke_count INT DEFAULT 5;
ALTER TABLE kanji ADD COLUMN IF NOT EXISTS examples JSONB DEFAULT '[]'::jsonb;
ALTER TABLE kanji DROP CONSTRAINT IF EXISTS kanji_kanji_key;
ALTER TABLE kanji DROP CONSTRAINT IF EXISTS uq_kanji_character;
DROP INDEX IF EXISTS uq_kanji_char;
CREATE UNIQUE INDEX IF NOT EXISTS uq_kanji_level_char ON kanji (level, kanji);

-- Xoa bo cac index cu chi ap dung cho 1 cap do N5
DROP INDEX IF EXISTS uq_vocab_lesson_order;
DROP INDEX IF EXISTS idx_vocab_order;
DROP INDEX IF EXISTS idx_vocab_lesson;
CREATE UNIQUE INDEX IF NOT EXISTS uq_vocab_level_lesson_order ON vocabularies (level, lesson_number, order_num);

-- 2. TAO BANG CHO CAC TINH NANG NANG CAO MOI
CREATE TABLE IF NOT EXISTS grammar_points (
  id SERIAL PRIMARY KEY,
  level VARCHAR(10) DEFAULT 'N5',
  lesson_number INT DEFAULT 1,
  order_num INT DEFAULT 1,
  title VARCHAR(255) NOT NULL,
  structure TEXT,
  meaning TEXT,
  usage_notes TEXT,
  examples JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS particles (
  id SERIAL PRIMARY KEY,
  level VARCHAR(10) DEFAULT 'N5',
  particle VARCHAR(50) NOT NULL,
  role TEXT,
  meaning TEXT,
  example TEXT,
  translation TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS particle_exercises (
  id SERIAL PRIMARY KEY,
  level VARCHAR(10) DEFAULT 'N5',
  sentence_jp TEXT NOT NULL,
  sentence_vi TEXT NOT NULL,
  options JSONB DEFAULT '[]'::jsonb,
  correct_answer VARCHAR(50) NOT NULL,
  explanation TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_gamification (
  user_id INT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  total_xp INT DEFAULT 0,
  current_streak INT DEFAULT 0,
  longest_streak INT DEFAULT 0,
  today_words_count INT DEFAULT 0,
  last_active_date DATE DEFAULT CURRENT_DATE,
  level_tier VARCHAR(50) DEFAULT 'Tân Thủ N5',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_badges (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  badge_key VARCHAR(50) NOT NULL,
  unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, badge_key)
);

CREATE TABLE IF NOT EXISTS srs_progress (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  vocabulary_id INT REFERENCES vocabularies(id) ON DELETE CASCADE,
  interval_days INT DEFAULT 1,
  ease_factor NUMERIC(3,2) DEFAULT 2.50,
  repetition_count INT DEFAULT 0,
  next_review_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, vocabulary_id)
);

CREATE TABLE IF NOT EXISTS forum_comments (
  id SERIAL PRIMARY KEY,
  article_id VARCHAR(100) NOT NULL,
  author_name VARCHAR(100) NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS forum_reviews (
  id SERIAL PRIMARY KEY,
  center_name VARCHAR(150) NOT NULL,
  author_name VARCHAR(100) NOT NULL,
  rating INT DEFAULT 5,
  review_text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS support_feedbacks (
  id SERIAL PRIMARY KEY,
  user_name VARCHAR(100) NOT NULL,
  user_email VARCHAR(150) NOT NULL,
  category VARCHAR(100) NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_vocab_level_lesson ON vocabularies (level, lesson_number);
CREATE INDEX IF NOT EXISTS idx_lessons_level ON lessons (level);

-- 3. XOA DU LIEU CU DE SAN SANG NAP 9.584 TU VUNG TRON BO N5 DEN N1
TRUNCATE TABLE particle_exercises, particles, grammar_points, kanji, vocabularies, lessons RESTART IDENTITY CASCADE;
