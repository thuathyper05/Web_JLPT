const db = require('./db');
const { masterArticles } = require('./forumArticlesData');

async function runSeed() {
  try {
    console.log('[Seed] Connecting to PostgreSQL...');
    await db.pool.query(`
      CREATE TABLE IF NOT EXISTS forum_comments (
        id SERIAL PRIMARY KEY,
        article_id INT NOT NULL,
        author VARCHAR(255) NOT NULL,
        rating INT DEFAULT 5,
        content TEXT NOT NULL,
        likes INT DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_forum_comments_article_id ON forum_comments (article_id);

      CREATE TABLE IF NOT EXISTS forum_reviews (
        id SERIAL PRIMARY KEY,
        author VARCHAR(255) NOT NULL,
        center_name VARCHAR(255) NOT NULL,
        rating INT DEFAULT 5,
        content TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    const cRes = await db.pool.query('SELECT count(*)::int as count FROM forum_comments');
    console.log('[Seed] Current forum_comments count:', cRes.rows[0].count);

    if (cRes.rows[0].count === 0) {
      let count = 0;
      for (const art of masterArticles) {
        if (art.comments && Array.isArray(art.comments)) {
          for (const c of art.comments) {
            await db.pool.query(
              'INSERT INTO forum_comments (article_id, author, rating, content, likes, created_at) VALUES ($1, $2, $3, $4, $5, NOW() - (random() * interval \'4 days\'))',
              [art.id, c.author || 'Bạn đọc', c.rating || 5, c.content || '', Math.floor(Math.random() * 9)]
            );
            count++;
          }
        }
      }
      console.log('[Seed] Seeded genuine comments count:', count);
    }

    const rRes = await db.pool.query('SELECT count(*)::int as count FROM forum_reviews');
    console.log('[Seed] Current forum_reviews count:', rRes.rows[0].count);

    if (rRes.rows[0].count === 0) {
      const initialReviews = [
        {
          author: 'Nguyễn Thanh Tùng',
          center_name: 'Khoá Học N5 Phản Xạ Toàn Diện - HYPER',
          rating: 5,
          content: 'Giao diện webapp đẹp nhất trong các trang học tiếng Nhật mình từng dùng. Tính năng AI Sensei giải thích siêu dễ hiểu và sát thực tế, Flashcard 3D tự đọc âm thanh nghe rất đã tai.'
        },
        {
          author: 'Phạm Thuỳ Dương',
          center_name: 'Trung Tâm Nhật Ngữ Đông Du & Tự Học Online',
          rating: 5,
          content: 'Mình kết hợp học ngữ pháp ở trung tâm và luyện từ vựng hàng ngày trên web này. Điểm thi thử N5 tăng từ 85 lên 165 điểm! Rất khuyến khích các bạn mới học nên thử.'
        },
        {
          author: 'Võ Hoàng Nam',
          center_name: 'Khóa Luyện Nghe Choukai Minna 25 Bài',
          rating: 5,
          content: 'Trang luyện nghe 25 bài đầy đủ từng câu thoại, có điều chỉnh tốc độ 0.75x đến 1.25x và transcript chi tiết giúp mình không còn sợ bài nghe JLPT nữa.'
        },
        {
          author: 'Trần Minh Quân',
          center_name: 'Trung tâm Nhật ngữ Sakura Đà Nẵng',
          rating: 5,
          content: 'Thầy cô người Nhật dạy phát âm rất chuẩn. Cơ sở vật chất sạch đẹp và có phòng tự học yên tĩnh.'
        },
        {
          author: 'Đỗ Hải Đăng',
          center_name: 'Jellyfish Education Đà Nẵng',
          rating: 5,
          content: 'Tư vấn hồ sơ du học và lộ trình thi đỗ N4 rất nhiệt tình, rõ ràng, không phát sinh chi phí.'
        }
      ];

      for (const rev of initialReviews) {
        await db.pool.query(
          'INSERT INTO forum_reviews (author, center_name, rating, content, created_at) VALUES ($1, $2, $3, $4, NOW() - (random() * interval \'3 days\'))',
          [rev.author, rev.center_name, rev.rating, rev.content]
        );
      }
      console.log('[Seed] Seeded initial forum_reviews successfully.');
    }

    const finalComments = await db.pool.query('SELECT count(*)::int as count FROM forum_comments');
    const finalReviews = await db.pool.query('SELECT count(*)::int as count FROM forum_reviews');
    console.log('[Seed] Final forum_comments in DB:', finalComments.rows[0].count);
    console.log('[Seed] Final forum_reviews in DB:', finalReviews.rows[0].count);
    process.exit(0);
  } catch (err) {
    console.error('[Seed Error]', err);
    process.exit(1);
  }
}

runSeed();
