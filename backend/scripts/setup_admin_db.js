const bcrypt = require('bcryptjs');
const db = require('../db');

async function setupAdminDb() {
  if (!db.pool) {
    console.error('No database pool available.');
    process.exit(1);
  }

  try {
    console.log('[PostgreSQL] Connecting to run Admin migrations...');

    // 1. Ensure columns in users table
    await db.pool.query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active';
      ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP WITH TIME ZONE;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS last_ip VARCHAR(100);
      ALTER TABLE users ADD COLUMN IF NOT EXISTS last_device VARCHAR(255);
    `);

    // 2. Ensure columns in support_feedbacks table
    await db.pool.query(`
      ALTER TABLE support_feedbacks ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'pending';
      ALTER TABLE support_feedbacks ADD COLUMN IF NOT EXISTS admin_reply TEXT;
      ALTER TABLE support_feedbacks ADD COLUMN IF NOT EXISTS phone VARCHAR(50);
    `);

    // 3. Create user_activity_logs table
    await db.pool.query(`
      CREATE TABLE IF NOT EXISTS user_activity_logs (
        id SERIAL PRIMARY KEY,
        user_id INT,
        user_email VARCHAR(255),
        user_name VARCHAR(255),
        action VARCHAR(100) NOT NULL,
        device_type VARCHAR(100),
        os_name VARCHAR(100),
        browser_name VARCHAR(100),
        ip_address VARCHAR(100),
        user_agent TEXT,
        details JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON user_activity_logs(created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_activity_logs_user_email ON user_activity_logs(user_email);
    `);

    // 4. Create system_notifications table
    await db.pool.query(`
      CREATE TABLE IF NOT EXISTS system_notifications (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        type VARCHAR(50) DEFAULT 'info',
        target_level VARCHAR(20) DEFAULT 'all',
        author VARCHAR(100) DEFAULT 'Admin',
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    // 5. Seed or Update the Sole Admin Account
    const adminEmail = 'thuathyperig05@gmail.com';
    const adminPass = 'Thuatnguyen1204@@@';
    const hash = bcrypt.hashSync(adminPass, 10);

    // Demote any old admin accounts to normal user so that ONLY thuathyperig05@gmail.com is admin
    await db.pool.query(
      `UPDATE users SET role = 'user' WHERE LOWER(email) <> LOWER($1) AND role IN ('admin', 'superadmin')`,
      [adminEmail]
    );

    // Upsert admin user
    const checkRes = await db.pool.query(
      'SELECT id FROM users WHERE LOWER(email) = LOWER($1)',
      [adminEmail]
    );

    if (checkRes.rows.length > 0) {
      await db.pool.query(
        `UPDATE users SET password_hash = $1, role = 'superadmin', username = 'Quản Trị Viên Tối Cao', status = 'active' WHERE id = $2`,
        [hash, checkRes.rows[0].id]
      );
      console.log(`[Admin DB] Updated existing admin user id ${checkRes.rows[0].id}`);
    } else {
      const insertRes = await db.pool.query(
        `INSERT INTO users (username, email, password_hash, auth_provider, role, status, created_at)
         VALUES ($1, $2, $3, 'local', 'superadmin', 'active', NOW()) RETURNING id`,
        ['Quản Trị Viên Tối Cao', adminEmail, hash]
      );
      console.log(`[Admin DB] Inserted new admin user id ${insertRes.rows[0].id}`);
    }

    // 6. Seed initial activity log if empty
    const logCountRes = await db.pool.query('SELECT COUNT(*)::int as count FROM user_activity_logs');
    if (logCountRes.rows[0].count === 0) {
      await db.pool.query(`
        INSERT INTO user_activity_logs (user_id, user_email, user_name, action, device_type, os_name, browser_name, ip_address, user_agent, details, created_at)
        VALUES 
        (1, 'thuatnguyen1204@gmail.com', 'Nguyên Văn Thuật', 'Đăng nhập Google', 'Mobile', 'iOS 18', 'Safari Mobile', '14.232.208.45', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_1 like Mac OS X) AppleWebKit/605.1.15', '{"provider": "google"}', NOW() - INTERVAL '15 minutes'),
        (1, 'thuatnguyen1204@gmail.com', 'Nguyên Văn Thuật', 'Học từ vựng N5', 'Laptop', 'Windows 11', 'Chrome 130', '113.161.72.19', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', '{"lesson": 5, "words": 20}', NOW() - INTERVAL '1 hour'),
        (3, 'liwan084a@gmail.com', 'WanLi', 'Hoàn thành Trắc nghiệm N4', 'Mobile', 'Android 14', 'Chrome Mobile', '171.244.11.89', 'Mozilla/5.0 (Linux; Android 14; SM-S928B) AppleWebKit/537.36', '{"score": 100, "level": "N4"}', NOW() - INTERVAL '3 hours'),
        (null, 'guest@device', 'Khách vãng lai', 'Tra cứu từ điển N5', 'Laptop', 'macOS 15', 'Safari 18', '118.69.182.2', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)', '{"query": "学校"}', NOW() - INTERVAL '5 hours')
      `);
      console.log('[Admin DB] Seeded initial activity logs');
    }

    // 7. Seed initial system notification if empty
    const notifCountRes = await db.pool.query('SELECT COUNT(*)::int as count FROM system_notifications');
    if (notifCountRes.rows[0].count === 0) {
      await db.pool.query(`
        INSERT INTO system_notifications (title, content, type, target_level, author, is_active, created_at)
        VALUES 
        ('Chào mừng đến với phiên bản v1.2', 'Hệ thống đã nâng cấp toàn diện từ điển N5 - N1, hỗ trợ Furigana trên đầu mọi Kanji và đồng bộ đa thiết bị.', 'update', 'all', 'Quản Trị Viên Tối Cao', true, NOW()),
        ('Mở cổng đăng ký thi thử JLPT 2026', 'Tất cả các học viên cấp độ N5, N4, N3 có thể vào mục Trắc nghiệm để làm đề thi thử chuẩn quốc tế.', 'event', 'all', 'Quản Trị Viên Tối Cao', true, NOW())
      `);
      console.log('[Admin DB] Seeded initial broadcast notifications');
    }

    console.log('[Admin DB] All setup migrations completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('[Admin DB] Setup error:', err);
    process.exit(1);
  }
}

setupAdminDb();
