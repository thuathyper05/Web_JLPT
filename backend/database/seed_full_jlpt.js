const { pool } = require('../db');

async function migrateAndSeed() {
  console.log('[PostgreSQL] Starting JLPT N5-N1 Schema Upgrade & Data Seeding...');

  // 1. Alter tables to add level column
  await pool.query(`
    DO $$ 
    BEGIN 
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='vocabularies' AND column_name='level') THEN
        ALTER TABLE vocabularies ADD COLUMN level VARCHAR(10) DEFAULT 'N5';
      END IF;

      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='lessons' AND column_name='level') THEN
        ALTER TABLE lessons ADD COLUMN level VARCHAR(10) DEFAULT 'N5';
      END IF;

      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='grammar_points' AND column_name='level') THEN
        ALTER TABLE grammar_points ADD COLUMN level VARCHAR(10) DEFAULT 'N5';
      END IF;

      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='kanji' AND column_name='level') THEN
        ALTER TABLE kanji ADD COLUMN level VARCHAR(10) DEFAULT 'N5';
      END IF;
    END $$;
  `);

  await pool.query(`UPDATE vocabularies SET level = 'N5' WHERE level IS NULL;`);
  await pool.query(`UPDATE lessons SET level = 'N5' WHERE level IS NULL;`);

  // Drop old N5-only index and create composite multi-level unique index
  await pool.query(`DROP INDEX IF EXISTS uq_vocab_lesson_order;`);
  await pool.query(`CREATE UNIQUE INDEX IF NOT EXISTS uq_vocab_level_lesson_order ON vocabularies (level, lesson_number, order_num);`);

  await pool.query(`CREATE INDEX IF NOT EXISTS idx_vocab_level ON vocabularies(level);`);
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_grammar_level ON grammar_points(level);`);
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_kanji_level ON kanji(level);`);
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_lessons_level ON lessons(level);`);

  console.log('[PostgreSQL] Schema updated with level column and indexes successfully.');

  // 2. Seed N4 Lessons (Minna no Nihongo Tập 2: Bài 26 tới Bài 50)
  const n4Lessons = [
    { num: 26, title: 'Giải thích nguyên nhân, lý do (んです)' },
    { num: 27, title: 'Động từ thể khả năng (可能形)' },
    { num: 28, title: 'Hành động đồng thời (ながら), liệt kê lý do (し...し)' },
    { num: 29, title: 'Trạng thái phát sinh (てあります, てしまいます)' },
    { num: 30, title: 'Chuẩn bị trước hành động (ておきます)' },
    { num: 31, title: 'Động từ thể ý chí (意向形), dự định (つもり)' },
    { num: 32, title: 'Lời khuyên (たほうがいい), phán đoán (でしょう, かもしれません)' },
    { num: 33, title: 'Thể mệnh lệnh (命令形) và thể cấm chỉ (禁止形)' },
    { num: 34, title: 'Làm theo hướng dẫn (とおりに), sau khi (あとで)' },
    { num: 35, title: 'Động từ thể điều kiện (条件形 / ば)' },
    { num: 36, title: 'Mục đích đạt được trạng thái (ようにします, ようになります)' },
    { num: 37, title: 'Động từ thể bị động (受身形)' },
    { num: 38, title: 'Danh từ hóa mệnh đề (のは, のが, のを)' },
    { num: 39, title: 'Nguyên nhân dẫn tới cảm xúc, trạng thái (て, で)' },
    { num: 40, title: 'Nghi vấn từ lồng ghép (か, かどうか)' },
    { num: 41, title: 'Cho và nhận nâng cao (やる, いただきます, くださいます)' },
    { num: 42, title: 'Mục đích hành động (ために, に)' },
    { num: 43, title: 'Dự đoán có vẻ như (そうです / Nghe có vẻ)' },
    { num: 44, title: 'Quá mức độ (すぎます), dễ/khó làm gì (やすい, にくい)' },
    { num: 45, title: 'Trường hợp xảy ra (ばあい), mặc dù (のに)' },
    { num: 46, title: 'Vừa mới xảy ra (ところ, ばかり)' },
    { num: 47, title: 'Truyền đạt lại tin đồn (そうです / Nghe nói)' },
    { num: 48, title: 'Động từ thể sai khiến (使役形)' },
    { num: 49, title: 'Kính ngữ tôn kính (尊敬語)' },
    { num: 50, title: 'Kính ngữ khiêm nhường (謙譲語)' }
  ];

  for (const l of n4Lessons) {
    const exists = await pool.query('SELECT id FROM lessons WHERE level = $1 AND lesson_number = $2', ['N4', l.num]);
    if (exists.rows.length === 0) {
      await pool.query(
        'INSERT INTO lessons (lesson_number, title, description, level, created_at) VALUES ($1, $2, $3, $4, NOW())',
        [l.num, `Bài ${l.num}: ${l.title}`, `Giáo trình Minna no Nihongo Trung cấp Bài ${l.num}`, 'N4']
      );
    }
  }

  // 3. Seed Core N4 Vocabularies
  const n4Vocabs = [
    { lesson_number: 26, kanji: '運動会', kana: 'うんどうかい', romaji: 'undoukai', vietnamese: 'Đại hội thể thao', ex_jp: '明日運動会があります。', ex_vi: 'Ngày mai có đại hội thể thao.' },
    { lesson_number: 26, kanji: '都合', kana: 'つごう', romaji: 'tsugou', vietnamese: 'Điều kiện thời gian, tiện lợi', ex_jp: '都合がいいです。', ex_vi: 'Thời gian rất thuận tiện.' },
    { lesson_number: 26, kanji: '直接', kana: 'ちょくせつ', romaji: 'chokusetsu', vietnamese: 'Trực tiếp', ex_jp: '先生に直接聞きます。', ex_vi: 'Tôi sẽ hỏi trực tiếp thầy giáo.' },
    { lesson_number: 27, kanji: '飼います', kana: 'かいます', romaji: 'kaimasu', vietnamese: 'Nuôi (thú cưng)', ex_jp: '犬を飼っています。', ex_vi: 'Tôi đang nuôi một chú chó.' },
    { lesson_number: 27, kanji: '建てます', kana: 'たてます', romaji: 'tatemasu', vietnamese: 'Xây dựng', ex_jp: '新しい家を建てます。', ex_vi: 'Tôi sẽ xây một ngôi nhà mới.' },
    { lesson_number: 27, kanji: '聞こえます', kana: 'きこえます', romaji: 'kikoemasu', vietnamese: 'Nghe thấy (tự nhiên)', ex_jp: '波の音が聞こえます。', ex_vi: 'Có thể nghe thấy tiếng sóng biển.' },
    { lesson_number: 28, kanji: '経験', kana: 'けいけん', romaji: 'keiken', vietnamese: 'Kinh nghiệm', ex_jp: '日本でいい経験をしました。', ex_vi: 'Tôi đã có trải nghiệm tuyệt vời ở Nhật.' },
    { lesson_number: 28, kanji: '熱心', kana: 'ねっしん', romaji: 'nesshin', vietnamese: 'Nhiệt tình, say mê', ex_jp: '熱心に勉強しています。', ex_vi: 'Học tập rất nhiệt tình.' },
    { lesson_number: 28, kanji: '習慣', kana: 'しゅうかん', romaji: 'shuukan', vietnamese: 'Tập quán, thói quen', ex_jp: '日本の習慣に慣れました。', ex_vi: 'Tôi đã quen với tập quán của Nhật Bản.' },
    { lesson_number: 29, kanji: '開きます', kana: 'あきます', romaji: 'akimasu', vietnamese: 'Mở (cửa tự mở)', ex_jp: 'ドアが開いています。', ex_vi: 'Cửa đang mở.' },
    { lesson_number: 29, kanji: '閉まります', kana: 'しまります', romaji: 'shimarimasu', vietnamese: 'Đóng (cửa tự đóng)', ex_jp: '窓が閉まっています。', ex_vi: 'Cửa sổ đang đóng.' },
    { lesson_number: 29, kanji: '故障', kana: 'こしょう', romaji: 'koshou', vietnamese: 'Hỏng hóc, trục trặc', ex_jp: '車が故障しました。', ex_vi: 'Xe hơi đã bị hỏng.' },
    { lesson_number: 30, kanji: '予定', kana: 'よてい', romaji: 'yotei', vietnamese: 'Dự định, kế hoạch', ex_jp: '来週の予定を決めます。', ex_vi: 'Tôi lên lịch cho tuần tới.' },
    { lesson_number: 30, kanji: '案内', kana: 'あんない', romaji: 'annai', vietnamese: 'Hướng dẫn, dẫn đường', ex_jp: '市内を案内します。', ex_vi: 'Tôi sẽ hướng dẫn bạn quanh thành phố.' },
    { lesson_number: 30, kanji: '準備', kana: 'じゅんび', romaji: 'junbi', vietnamese: 'Chuẩn bị', ex_jp: '会議の準備をします。', ex_vi: 'Tôi chuẩn bị cho cuộc họp.' },
    { lesson_number: 31, kanji: '予約', kana: 'よやく', romaji: 'yoyaku', vietnamese: 'Đặt trước, hẹn trước', ex_jp: 'ホテルを予約しました。', ex_vi: 'Tôi đã đặt phòng khách sạn.' },
    { lesson_number: 31, kanji: '卒業', kana: 'そつぎょう', romaji: 'sotsugyou', vietnamese: 'Tốt nghiệp', ex_jp: '大学を卒業します。', ex_vi: 'Tôi sẽ tốt nghiệp đại học.' },
    { lesson_number: 32, kanji: '予定表', kana: 'よていひょう', romaji: 'yoteihyou', vietnamese: 'Lịch trình dự kiến', ex_jp: '予定表を確認します。', ex_vi: 'Tôi kiểm tra lại bảng lịch trình.' },
    { lesson_number: 33, kanji: '警察', kana: 'けいさつ', romaji: 'keisatsu', vietnamese: 'Cảnh sát', ex_jp: '警察に連絡します。', ex_vi: 'Tôi sẽ liên lạc với cảnh sát.' },
    { lesson_number: 34, kanji: '説明書', kana: 'せつめいしょ', romaji: 'setsumeisho', vietnamese: 'Sách hướng dẫn sử dụng', ex_jp: '説明書を読みます。', ex_vi: 'Tôi đọc sách hướng dẫn.' },
    { lesson_number: 35, kanji: '複雑', kana: 'ふくざつ', romaji: 'fukuzatsu', vietnamese: 'Phức tạp', ex_jp: 'この問題は複雑です。', ex_vi: 'Vấn đề này rất phức tạp.' },
    { lesson_number: 36, kanji: '習慣', kana: 'しゅうかん', romaji: 'shuukan', vietnamese: 'Thói quen', ex_jp: '早起きの習慣があります。', ex_vi: 'Tôi có thói quen dậy sớm.' },
    { lesson_number: 37, kanji: '泥棒', kana: 'どろぼう', romaji: 'dorobou', vietnamese: 'Kẻ trộm', ex_jp: '泥棒に財布を盗まれました。', ex_vi: 'Tôi bị kẻ trộm lấy mất ví.' },
    { lesson_number: 38, kanji: '興味', kana: 'きょうみ', romaji: 'kyoumi', vietnamese: 'Hứng thú, quan tâm', ex_jp: '日本の文化に興味があります。', ex_vi: 'Tôi có hứng thú với văn hóa Nhật.' },
    { lesson_number: 39, kanji: '地震', kana: 'じしん', romaji: 'jishin', vietnamese: 'Động đất', ex_jp: '昨日大きい地震がありました。', ex_vi: 'Hôm qua có một trận động đất lớn.' },
    { lesson_number: 40, kanji: '忘年会', kana: 'ぼうねんかい', romaji: 'bounenkai', vietnamese: 'Tiệc tất niên', ex_jp: '会社の忘年会に参加します。', ex_vi: 'Tôi tham gia tiệc tất niên của công ty.' }
  ];

  for (let idx = 0; idx < n4Vocabs.length; idx++) {
    const v = n4Vocabs[idx];
    const exists = await pool.query('SELECT id FROM vocabularies WHERE level = $1 AND kanji = $2', ['N4', v.kanji]);
    if (exists.rows.length === 0) {
      await pool.query(`
        INSERT INTO vocabularies (lesson_number, order_num, kanji, kana, romaji, vietnamese, clean_vietnamese, clean_kana, example_jp, example_vi, level, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW())
      `, [v.lesson_number, idx + 1, v.kanji, v.kana, v.romaji, v.vietnamese, v.vietnamese, v.kana, v.ex_jp, v.ex_vi, 'N4']);
    }
  }

  // 4. Seed Core N3 Vocabularies
  const n3Vocabs = [
    { kanji: '解決', kana: 'かいけつ', romaji: 'kaiketsu', vietnamese: 'Giải quyết (vấn đề)', ex_jp: '問題を早く解決したいです。', ex_vi: 'Tôi muốn sớm giải quyết vấn đề.' },
    { kanji: '影響', kana: 'えいきょう', romaji: 'eikyou', vietnamese: 'Ảnh hưởng, tác động', ex_jp: '天候が収穫に影響を与えます。', ex_vi: 'Thời tiết gây ảnh hưởng đến mùa vụ.' },
    { kanji: '関係', kana: 'かんけい', romaji: 'kankei', vietnamese: 'Mối quan hệ, liên quan', ex_jp: '良好な関係を保ちます。', ex_vi: 'Duy trì mối quan hệ tốt đẹp.' },
    { kanji: '情報', kana: 'じょうほう', romaji: 'jouhou', vietnamese: 'Thông tin dữ liệu', ex_jp: '最新の情報を集めます。', ex_vi: 'Thu thập thông tin mới nhất.' },
    { kanji: '成功', kana: 'せいこう', romaji: 'seikou', vietnamese: 'Thành công', ex_jp: 'プロジェクトが成功しました。', ex_vi: 'Dự án đã thành công mỹ mãn.' },
    { kanji: '技術', kana: 'ぎじゅつ', romaji: 'gijutsu', vietnamese: 'Kỹ thuật, công nghệ', ex_jp: '日本の先端技術を学びます。', ex_vi: 'Học tập kỹ thuật tiên tiến của Nhật.' },
    { kanji: '理解', kana: 'りかい', romaji: 'rikai', vietnamese: 'Thấu hiểu, lĩnh hội', ex_jp: '先生の説明を理解しました。', ex_vi: 'Tôi đã hiểu lời giải thích của thầy.' },
    { kanji: '努力', kana: 'どりょく', romaji: 'doryoku', vietnamese: 'Nỗ lực, cố gắng', ex_jp: '毎日合格に向けて努力します。', ex_vi: 'Mỗi ngày nỗ lực để thi đỗ.' },
    { kanji: '期待', kana: 'きたい', romaji: 'kitai', vietnamese: 'Kỳ vọng, mong đợi', ex_jp: '新製品に大いに期待しています。', ex_vi: 'Rất kỳ vọng vào dòng sản phẩm mới.' },
    { kanji: '発展', kana: 'はってん', romaji: 'hatten', vietnamese: 'Phát triển lớn mạnh', ex_jp: '経済が急速に発展しています。', ex_vi: 'Nền kinh tế đang phát triển nhanh chóng.' }
  ];

  for (let idx = 0; idx < n3Vocabs.length; idx++) {
    const v = n3Vocabs[idx];
    const exists = await pool.query('SELECT id FROM vocabularies WHERE level = $1 AND kanji = $2', ['N3', v.kanji]);
    if (exists.rows.length === 0) {
      await pool.query(`
        INSERT INTO vocabularies (lesson_number, order_num, kanji, kana, romaji, vietnamese, clean_vietnamese, clean_kana, example_jp, example_vi, level, created_at)
        VALUES (1, $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())
      `, [idx + 1, v.kanji, v.kana, v.romaji, v.vietnamese, v.vietnamese, v.kana, v.ex_jp, v.ex_vi, 'N3']);
    }
  }

  // 5. Seed Core N2 Vocabularies
  const n2Vocabs = [
    { kanji: '契機', kana: 'けいき', romaji: 'keiki', vietnamese: 'Cơ hội, thời cơ, bước ngoặt', ex_jp: '留学を契機に視野が広がりました。', ex_vi: 'Chuyến du học là bước ngoặt mở rộng tầm nhìn.' },
    { kanji: '把握', kana: 'はあく', romaji: 'haaku', vietnamese: 'Nắm bắt, thấu suốt tình hình', ex_jp: '現状を正確に把握する必要があります。', ex_vi: 'Cần nắm bắt chính xác tình hình hiện tại.' },
    { kanji: '配慮', kana: 'はいりょ', romaji: 'hairyo', vietnamese: 'Quan tâm chu đáo, xem xét kỹ', ex_jp: '周囲への細やかな配慮が求められます。', ex_vi: 'Đòi hỏi sự quan tâm chu đáo tới xung quanh.' },
    { kanji: '維持', kana: 'いじ', romaji: 'iji', vietnamese: 'Duy trì, giữ gìn phong độ', ex_jp: '健康を維持するために運動します。', ex_vi: 'Tập thể dục để duy trì sức khỏe.' },
    { kanji: '普及', kana: 'ふきゅう', romaji: 'fukyuu', vietnamese: 'Phổ biến, lan rộng toàn xã hội', ex_jp: 'スマートフォンの普及が進んでいます。', ex_vi: 'Điện thoại thông minh đang ngày càng phổ biến.' },
    { kanji: '柔軟', kana: 'じゅうなん', romaji: 'juunan', vietnamese: 'Mềm dẻo, linh hoạt ứng biến', ex_jp: '柔軟な姿勢で対応します。', ex_vi: 'Ứng phó với thái độ linh hoạt.' }
  ];

  for (let idx = 0; idx < n2Vocabs.length; idx++) {
    const v = n2Vocabs[idx];
    const exists = await pool.query('SELECT id FROM vocabularies WHERE level = $1 AND kanji = $2', ['N2', v.kanji]);
    if (exists.rows.length === 0) {
      await pool.query(`
        INSERT INTO vocabularies (lesson_number, order_num, kanji, kana, romaji, vietnamese, clean_vietnamese, clean_kana, example_jp, example_vi, level, created_at)
        VALUES (1, $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())
      `, [idx + 1, v.kanji, v.kana, v.romaji, v.vietnamese, v.vietnamese, v.kana, v.ex_jp, v.ex_vi, 'N2']);
    }
  }

  // 6. Seed Core N1 Vocabularies
  const n1Vocabs = [
    { kanji: '妥協', kana: 'だきょう', romaji: 'dakyou', vietnamese: 'Thỏa hiệp, nhượng bộ', ex_jp: '品質において妥協を許しません。', ex_vi: 'Tuyệt đối không nhượng bộ về mặt chất lượng.' },
    { kanji: '懸念', kana: 'けねん', romaji: 'kenen', vietnamese: 'Mối lo ngại sâu sắc', ex_jp: '環境悪化への懸念が高まっています。', ex_vi: 'Mối lo ngại về suy thoái môi trường ngày càng gia tăng.' },
    { kanji: '緻密', kana: 'ちみつ', romaji: 'chimitsu', vietnamese: 'Tỉ mỉ, chi tiết, chặt chẽ', ex_jp: '緻密な計画を立てて実行します。', ex_vi: 'Lập kế hoạch tỉ mỉ và bắt tay thực hiện.' },
    { kanji: '示唆', kana: 'しさ', romaji: 'shisa', vietnamese: 'Gợi ý, hàm ý sâu xa', ex_jp: 'このデータは重要な変化を示唆しています。', ex_vi: 'Số liệu này hàm ý một biến chuyển quan trọng.' }
  ];

  for (let idx = 0; idx < n1Vocabs.length; idx++) {
    const v = n1Vocabs[idx];
    const exists = await pool.query('SELECT id FROM vocabularies WHERE level = $1 AND kanji = $2', ['N1', v.kanji]);
    if (exists.rows.length === 0) {
      await pool.query(`
        INSERT INTO vocabularies (lesson_number, order_num, kanji, kana, romaji, vietnamese, clean_vietnamese, clean_kana, example_jp, example_vi, level, created_at)
        VALUES (1, $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())
      `, [idx + 1, v.kanji, v.kana, v.romaji, v.vietnamese, v.vietnamese, v.kana, v.ex_jp, v.ex_vi, 'N1']);
    }
  }

  // 7. Seed Grammar Points for N4, N3, N2, N1
  const moreGrammar = [
    { level: 'N4', lesson_number: 26, title: '～んです (Giải thích lý do, xác nhận)', structure: 'Thể thông thường + んです', meaning: 'Dùng để nhấn mạnh lý do hoặc hỏi xác nhận thông tin thực tế.' },
    { level: 'N4', lesson_number: 27, title: 'Động từ thể khả năng (可能形)', structure: 'Nhóm 1: i sang eる, Nhóm 2: られる, Nhóm 3: できる', meaning: 'Diễn tả năng lực có thể làm được việc gì đó.' },
    { level: 'N4', lesson_number: 28, title: '～ながら (Vừa làm A vừa làm B)', structure: 'V-masu (bỏ masu) + ながら', meaning: 'Hai hành động diễn ra song song do cùng một chủ thể thực hiện.' },
    { level: 'N4', lesson_number: 31, title: '～つもりです (Dự định làm gì)', structure: 'V-thể từ điển + つもりです', meaning: 'Biểu thị ý chí, kế hoạch đã được dự tính từ trước.' },
    { level: 'N4', lesson_number: 37, title: 'Động từ thể bị động (受身形)', structure: 'N1 は N2 に V-bị động', meaning: 'Hành động bị tác động bởi đối tượng khác (thường gây phiền toái).' },
    { level: 'N4', lesson_number: 48, title: 'Động từ thể sai khiến (使役形)', structure: 'V-sai khiến (させる / せる)', meaning: 'Cho phép hoặc bắt buộc ai đó làm việc gì.' },
    { level: 'N3', lesson_number: 1, title: '～わけだ (Thảo nào, hèn chi)', structure: 'Thể thông thường + わけだ', meaning: 'Giải thích kết quả hiển nhiên sau khi đã hiểu rõ nguyên nhân.' },
    { level: 'N3', lesson_number: 2, title: '～べきだ (Nên, phải làm)', structure: 'V-thể từ điển + べきだ', meaning: 'Bổn phận đạo đức, điều đương nhiên nên làm theo chuẩn mực.' },
    { level: 'N3', lesson_number: 3, title: '～に対して (Đối với, trái ngược với)', structure: 'N + に対して / N1 に対する N2', meaning: 'Biểu thị thái độ hướng tới đối tượng hoặc so sánh tương phản.' },
    { level: 'N2', lesson_number: 1, title: '～に際して (Nhân dịp, khi bắt đầu)', structure: 'N / V-thể từ điển + に際して', meaning: 'Diễn đạt thời điểm trọng đại, bắt đầu một sự kiện lớn trang trọng.' },
    { level: 'N2', lesson_number: 2, title: '～を契機に (Lấy làm bước ngoặt hoặc cơ hội)', structure: 'N + を契機に', meaning: 'Một sự kiện đóng vai trò là động lực thúc đẩy thay đổi lớn.' },
    { level: 'N1', lesson_number: 1, title: '～であれ (Cho dù là...)', structure: 'N / Nghi vấn từ + であれ', meaning: 'Bất kể trong trường hợp nào thì kết quả vẫn không thay đổi.' },
    { level: 'N1', lesson_number: 2, title: '～極まりない (Hết sức, vô cùng)', structure: 'A-na + 極まりない', meaning: 'Biểu thị mức độ cảm xúc hoặc đánh giá đạt tới đỉnh điểm.' }
  ];

  for (const g of moreGrammar) {
    const exists = await pool.query('SELECT id FROM grammar_points WHERE level = $1 AND title = $2', [g.level, g.title]);
    if (exists.rows.length === 0) {
      await pool.query(`
        INSERT INTO grammar_points (level, lesson_number, order_num, title, structure, meaning, created_at)
        VALUES ($1, $2, 1, $3, $4, $5, NOW())
      `, [g.level, g.lesson_number, g.title, g.structure, g.meaning]);
    }
  }

  // 8. Seed Core Kanji for N4, N3, N2, N1
  const moreKanji = [
    { level: 'N4', kanji: '会', onyomi: 'カイ', kunyomi: 'あ・う', han_viet: 'HỘI', meaning: 'Gặp gỡ, hội họp', stroke_count: 6 },
    { level: 'N4', kanji: '社', onyomi: 'シャ', kunyomi: 'やしろ', han_viet: 'XÃ', meaning: 'Công ty, xã hội', stroke_count: 7 },
    { level: 'N4', kanji: '店', onyomi: 'テン', kunyomi: 'みせ', han_viet: 'ĐIẾM', meaning: 'Cửa hàng, tiệm', stroke_count: 8 },
    { level: 'N4', kanji: '駅', onyomi: 'エキ', kunyomi: '', han_viet: 'DỊCH', meaning: 'Nhà ga', stroke_count: 14 },
    { level: 'N4', kanji: '国', onyomi: 'コク', kunyomi: 'くに', han_viet: 'QUỐC', meaning: 'Đất nước', stroke_count: 8 },
    { level: 'N3', kanji: '政', onyomi: 'セイ', kunyomi: 'まつりごと', han_viet: 'CHÍNH', meaning: 'Chính trị, chính sách', stroke_count: 9 },
    { level: 'N3', kanji: '経', onyomi: 'ケイ', kunyomi: 'へ・る', han_viet: 'KINH', meaning: 'Kinh tế, trải qua', stroke_count: 11 },
    { level: 'N2', kanji: '際', onyomi: 'サイ', kunyomi: 'きわ', han_viet: 'TẾ', meaning: 'Thời điểm, ranh giới', stroke_count: 14 },
    { level: 'N2', kanji: '契', onyomi: 'ケイ', kunyomi: 'ちぎ・る', han_viet: 'KHẾ', meaning: 'Khế ước, hợp đồng', stroke_count: 9 },
    { level: 'N1', kanji: '妥', onyomi: 'ダ', kunyomi: '', han_viet: 'THỎA', meaning: 'Thỏa hiệp, ổn thỏa', stroke_count: 7 }
  ];

  for (const k of moreKanji) {
    await pool.query(`
      INSERT INTO kanji (kanji, onyomi, kunyomi, han_viet, meaning, stroke_count, level, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
      ON CONFLICT (kanji) DO UPDATE SET level = EXCLUDED.level, onyomi = EXCLUDED.onyomi, kunyomi = EXCLUDED.kunyomi
    `, [k.kanji, k.onyomi, k.kunyomi, k.han_viet, k.meaning, k.stroke_count, k.level]);
  }

  // 9. Summary Check
  const vCnt = await pool.query('SELECT level, count(*) FROM vocabularies GROUP BY level ORDER BY level');
  console.log('[PostgreSQL] Vocabularies by level:', vCnt.rows);

  const gCnt = await pool.query('SELECT level, count(*) FROM grammar_points GROUP BY level ORDER BY level');
  console.log('[PostgreSQL] Grammar points by level:', gCnt.rows);

  const kCnt = await pool.query('SELECT level, count(*) FROM kanji GROUP BY level ORDER BY level');
  console.log('[PostgreSQL] Kanji by level:', kCnt.rows);

  console.log('[PostgreSQL] Migration & Seeding completed successfully!');
  await pool.end();
}

migrateAndSeed().catch((err) => {
  console.error('[PostgreSQL] Seeding error:', err);
  process.exit(1);
});
