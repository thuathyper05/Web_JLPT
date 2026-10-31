const { pool } = require('../db');

async function seedRichJLPT() {
  console.log('[PostgreSQL] Expanding JLPT N4-N1 datasets with rich, authentic curriculum...');

  // Rich N4 Vocabularies across Lessons 26-50
  const n4ExtraVocabs = [
    // Lesson 26
    { lesson: 26, kanji: '見ます', kana: 'みます', romaji: 'mimasu', vi: 'Xem, khám bệnh, kiểm tra', jp: '医者に診てもらいます。', vi_ex: 'Tôi đi bác sĩ khám bệnh.' },
    { lesson: 26, kanji: '探します', kana: 'さがします', romaji: 'sagashimasu', vi: 'Tìm kiếm', jp: '鍵を探しています。', vi_ex: 'Tôi đang tìm chìa khóa.' },
    { lesson: 26, kanji: '遅れます', kana: 'おくれます', romaji: 'okuremasu', vi: 'Muộn, chậm trễ', jp: '時間に遅れてしまいました。', vi_ex: 'Tôi đã bị muộn giờ.' },
    { lesson: 26, kanji: '間に合います', kana: 'まにあいます', romaji: 'maniau', vi: 'Kịp giờ', jp: '電車に間に合いました。', vi_ex: 'Tôi đã kịp chuyến tàu.' },
    // Lesson 27
    { lesson: 27, kanji: '走ります', kana: 'はしります', romaji: 'hashirimasu', vi: 'Chạy', jp: '道を走ります。', vi_ex: 'Chạy trên đường phố.' },
    { lesson: 27, kanji: '見えます', kana: 'みえます', romaji: 'miemasu', vi: 'Nhìn thấy (tự nhiên)', jp: '富士山が見えます。', vi_ex: 'Nhìn thấy núi Phú Sĩ.' },
    { lesson: 27, kanji: 'できます', kana: 'できます', romaji: 'dekimasu', vi: 'Được hoàn thành, có thể làm', jp: '駅の前に新しいビルができました。', vi_ex: 'Trước ga đã có một tòa nhà mới xây xong.' },
    { lesson: 27, kanji: '開きます', kana: 'ひらきます', romaji: 'hirakimasu', vi: 'Mở (lớp học, cuộc họp)', jp: '日本語の教室を開きます。', vi_ex: 'Mở lớp học tiếng Nhật.' },
    // Lesson 28
    { lesson: 28, kanji: '売れます', kana: 'うれます', romaji: 'uremasu', vi: 'Bán chạy', jp: 'この本はよく売れています。', vi_ex: 'Cuốn sách này bán rất chạy.' },
    { lesson: 28, kanji: '踊ります', kana: 'おどります', romaji: 'odorimasu', vi: 'Nhảy múa', jp: '音楽に合わせて踊ります。', vi_ex: 'Nhảy theo điệu nhạc.' },
    { lesson: 28, kanji: '選びます', kana: 'えらびます', romaji: 'erabimasu', vi: 'Lựa chọn', jp: '好きな色を選んでください。', vi_ex: 'Hãy chọn màu sắc bạn thích.' },
    { lesson: 28, kanji: '通います', kana: 'かよいます', romaji: 'kayoimasu', vi: 'Đi lại thường xuyên (đi học/đi làm)', jp: '大学に通っています。', vi_ex: 'Tôi đang theo học tại trường đại học.' },
    // Lesson 29
    { lesson: 29, kanji: '消えます', kana: 'きえます', romaji: 'kiemasu', vi: 'Tắt (điện tự tắt)', jp: '電気が消えました。', vi_ex: 'Điện đã tự tắt.' },
    { lesson: 29, kanji: '壊れます', kana: 'こわれます', romaji: 'kowaremasu', vi: 'Hỏng (tự hỏng)', jp: '椅子が壊れています。', vi_ex: 'Cái ghế đang bị hỏng.' },
    { lesson: 29, kanji: '汚れます', kana: 'よごれます', romaji: 'yogoremasu', vi: 'Bẩn, lấm lem', jp: '服が汚れてしまいました。', vi_ex: 'Quần áo đã bị lấm bẩn mất rồi.' },
    { lesson: 29, kanji: '落ちます', kana: 'おちます', romaji: 'ochimasu', vi: 'Rơi rớt', jp: '財布が落ちました。', vi_ex: 'Cái ví đã bị rơi.' },
    // Lesson 30
    { lesson: 30, kanji: '貼ります', kana: 'はります', romaji: 'harimasu', vi: 'Dán lên', jp: '壁にポスターを貼ります。', vi_ex: 'Dán áp phích lên tường.' },
    { lesson: 30, kanji: '掛けます', kana: 'かけます', romaji: 'kakemasu', vi: 'Treo lên', jp: 'カレンダーを掛けます。', vi_ex: 'Treo lịch lên tường.' },
    { lesson: 30, kanji: '飾ります', kana: 'かざります', romaji: 'kazarimasu', vi: 'Trang trí', jp: '部屋に花を飾ります。', vi_ex: 'Trang trí hoa trong phòng.' },
    { lesson: 30, kanji: '並べます', kana: 'ならべます', romaji: 'narabemasu', vi: 'Xếp thành hàng', jp: '本をきれいに並べます。', vi_ex: 'Xếp sách ngay ngắn.' },
    // Lesson 31
    { lesson: 31, kanji: '続けます', kana: 'つづけます', romaji: 'tsuzukemasu', vi: 'Tiếp tục', jp: '日本語の勉強を続けます。', vi_ex: 'Tôi sẽ tiếp tục việc học tiếng Nhật.' },
    { lesson: 31, kanji: '見つけます', kana: 'みつけます', romaji: 'mitsukemasu', vi: 'Tìm thấy', jp: 'いい仕事を見つけました。', vi_ex: 'Tôi đã tìm được một công việc tốt.' },
    { lesson: 31, kanji: '取ります', kana: 'とります', romaji: 'torimasu', vi: 'Xin nghỉ, đạt được bằng cấp', jp: '来週休みを取ります。', vi_ex: 'Tuần sau tôi sẽ xin nghỉ phép.' },
    // Lesson 32
    { lesson: 32, kanji: '運動します', kana: 'うんどうします', romaji: 'undoushimasu', vi: 'Vận động thể thao', jp: '毎朝運動したほうがいいです。', vi_ex: 'Nên tập thể dục mỗi buổi sáng.' },
    { lesson: 32, kanji: '成功します', kana: 'せいこうします', romaji: 'seikoushimasu', vi: 'Thành công', jp: '実験が成功するでしょう。', vi_ex: 'Thí nghiệm có lẽ sẽ thành công.' },
    { lesson: 32, kanji: '失敗します', kana: 'しっぱいします', romaji: 'shippaishimasu', vi: 'Thất bại', jp: '試験に失敗してしまいました。', vi_ex: 'Tôi đã trượt kỳ thi mất rồi.' },
    { lesson: 32, kanji: '合格します', kana: 'ごうかくします', romaji: 'goukaku-shimasu', vi: 'Thi đỗ, vượt qua', jp: 'JLPT N4に合格しました。', vi_ex: 'Tôi đã thi đỗ JLPT N4.' },
    // Lesson 33
    { lesson: 33, kanji: '逃げます', kana: 'にげます', romaji: 'nigemasu', vi: 'Bỏ chạy, trốn thoát', jp: '犯人が逃げました。', vi_ex: 'Tội phạm đã bỏ trốn.' },
    { lesson: 33, kanji: 'あきらめます', kana: 'あきらめます', romaji: 'akiramemasu', vi: 'Từ bỏ, nản lòng', jp: '最後まであきらめないでください。', vi_ex: 'Xin đừng bỏ cuộc cho đến phút cuối.' },
    { lesson: 33, kanji: '守ります', kana: 'まもります', romaji: 'mamorimasu', vi: 'Tuân thủ, giữ gìn lời hứa', jp: '約束をしっかり守ります。', vi_ex: 'Tôi tuân thủ nghiêm túc lời hứa.' },
    // Lesson 34
    { lesson: 34, kanji: '磨きます', kana: 'みがきます', romaji: 'migakimasu', vi: 'Đánh răng, mài dũa', jp: '毎食後に歯を磨きます。', vi_ex: 'Tôi đánh răng sau mỗi bữa ăn.' },
    { lesson: 34, kanji: '組み立てます', kana: 'くみたてます', romaji: 'kumitatemasu', vi: 'Lắp ráp mô hình, đồ đạc', jp: '自分で机を組み立てました。', vi_ex: 'Tôi tự tay lắp ráp bàn học.' },
    { lesson: 34, kanji: '折ります', kana: 'おります', romaji: 'orimasu', vi: 'Gấp giấy, bẻ cành', jp: '折り紙で鶴を折ります。', vi_ex: 'Gấp con hạc bằng giấy Origami.' },
    // Lesson 35
    { lesson: 35, kanji: '咲きます', kana: 'さきます', romaji: 'sakimasu', vi: 'Nở hoa', jp: '春になると桜が咲きます。', vi_ex: 'Khi mùa xuân đến hoa anh đào sẽ nở.' },
    { lesson: 35, kanji: '変わります', kana: 'かわります', romaji: 'kawarimasu', vi: 'Biến đổi, thay đổi', jp: '信号の色が変わりました。', vi_ex: 'Đèn giao thông đã chuyển màu.' },
    { lesson: 35, kanji: '困ります', kana: 'こまります', romaji: 'komarimasu', vi: 'Khó khăn, bối rối', jp: 'お金が足りなくて困りました。', vi_ex: 'Thiếu tiền nên rất khó khăn.' }
  ];

  for (let i = 0; i < n4ExtraVocabs.length; i++) {
    const v = n4ExtraVocabs[i];
    const exists = await pool.query('SELECT id FROM vocabularies WHERE level = $1 AND kanji = $2', ['N4', v.kanji]);
    if (exists.rows.length === 0) {
      const order = 200 + i;
      await pool.query(`
        INSERT INTO vocabularies (lesson_number, order_num, kanji, kana, romaji, vietnamese, clean_vietnamese, clean_kana, example_jp, example_vi, level, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'N4', NOW())
        ON CONFLICT DO NOTHING
      `, [v.lesson, order, v.kanji, v.kana, v.romaji, v.vi, v.vi, v.kana, v.jp, v.vi_ex]);
    }
  }

  // Rich N3 Vocabularies
  const n3ExtraVocabs = [
    { kanji: '尊重', kana: 'そんちょう', romaji: 'sonchou', vi: 'Tôn trọng', jp: '他人の意見を尊重します。', vi_ex: 'Tôn trọng ý kiến của người khác.' },
    { kanji: '調整', kana: 'ちょうせい', romaji: 'chousei', vi: 'Điều chỉnh cân đối', jp: 'スケジュールを調整します。', vi_ex: 'Điều chỉnh lại lịch trình.' },
    { kanji: '効果', kana: 'こうか', romaji: 'kouka', vi: 'Hiệu quả, tác dụng', jp: '薬の効果が現れました。', vi_ex: 'Hiệu quả của thuốc đã phát huy.' },
    { kanji: '対策', kana: 'たいさく', romaji: 'taisaku', vi: 'Biện pháp đối phó', jp: '地震の対策を立てます。', vi_ex: 'Lập biện pháp ứng phó động đất.' },
    { kanji: '関心', kana: 'かんしん', romaji: 'kanshin', vi: 'Mối quan tâm', jp: '環境問題に関心があります。', vi_ex: 'Có mối quan tâm tới môi trường.' },
    { kanji: '状況', kana: 'じょうきょう', romaji: 'joukyou', vi: 'Tình huống, hoàn cảnh', jp: '現在の状況を報告します。', vi_ex: 'Báo cáo tình hình hiện tại.' },
    { kanji: '評価', kana: 'ひょうか', romaji: 'hyouka', vi: 'Đánh giá, nhận định', jp: '高い評価を受けました。', vi_ex: 'Nhận được đánh giá cao.' },
    { kanji: '満足', kana: 'まんぞく', romaji: 'manzoku', vi: 'Thỏa mãn, hài lòng', jp: '結果にとても満足しています。', vi_ex: 'Rất hài lòng với kết quả.' },
    { kanji: '緊張', kana: 'きんちょう', romaji: 'kinchou', vi: 'Căng thẳng, hồi hộp', jp: '面接で少し緊張しました。', vi_ex: 'Hơi căng thẳng trong buổi phỏng vấn.' },
    { kanji: '感謝', kana: 'かんしゃ', romaji: 'kansha', vi: 'Cảm tạ, tri ân', jp: '皆様のご協力に心から感謝します。', vi_ex: 'Chân thành cảm ơn sự hợp tác của mọi người.' }
  ];

  for (let i = 0; i < n3ExtraVocabs.length; i++) {
    const v = n3ExtraVocabs[i];
    const exists = await pool.query('SELECT id FROM vocabularies WHERE level = $1 AND kanji = $2', ['N3', v.kanji]);
    if (exists.rows.length === 0) {
      await pool.query(`
        INSERT INTO vocabularies (lesson_number, order_num, kanji, kana, romaji, vietnamese, clean_vietnamese, clean_kana, example_jp, example_vi, level, created_at)
        VALUES (1, $1, $2, $3, $4, $5, $6, $7, $8, $9, 'N3', NOW())
        ON CONFLICT DO NOTHING
      `, [100 + i, v.kanji, v.kana, v.romaji, v.vi, v.vi, v.kana, v.jp, v.vi_ex]);
    }
  }

  // Rich N2 Vocabularies
  const n2ExtraVocabs = [
    { kanji: '迅速', kana: 'じんそく', romaji: 'jinsoku', vi: 'Nhanh chóng, mau lẹ', jp: '迅速な対応が求められます。', vi_ex: 'Yêu cầu sự phản hồi nhanh chóng.' },
    { kanji: '徹底', kana: 'てってい', romaji: 'tettei', vi: 'Triệt để, thấu đáo', jp: '安全管理を徹底します。', vi_ex: 'Quản lý an toàn một cách triệt để.' },
    { kanji: '把握', kana: 'はあく', romaji: 'haaku', vi: 'Nắm vững cốt lõi', jp: '要点を的確に把握します。', vi_ex: 'Nắm vững các điểm mấu chốt một cách chuẩn xác.' },
    { kanji: '妥当', kana: 'だとう', romaji: 'datou', vi: 'Hợp lý, thỏa đáng', jp: '妥当な判断を下します。', vi_ex: 'Đưa ra phán quyết thỏa đáng.' },
    { kanji: '促進', kana: 'そくしん', romaji: 'sokushin', vi: 'Thúc đẩy phát triển', jp: '国際交流を促進します。', vi_ex: 'Thúc đẩy giao lưu quốc tế.' },
    { kanji: '蓄積', kana: 'ちくせき', romaji: 'chikuseki', vi: 'Tích lũy kinh nghiệm, vốn', jp: '長年の知識を蓄積します。', vi_ex: 'Tích lũy tri thức qua nhiều năm.' },
    { kanji: '克服', kana: 'こくふく', romaji: 'kokufuku', vi: 'Khắc phục khó khăn', jp: '困難をみんなで克服しました。', vi_ex: 'Mọi người đã cùng nhau khắc phục khó khăn.' },
    { kanji: '多岐', kana: 'たき', romaji: 'taki', vi: 'Đa dạng, nhiều phương diện', jp: '議論は多岐にわたりました。', vi_ex: 'Cuộc tranh luận trải rộng trên nhiều khía cạnh.' }
  ];

  for (let i = 0; i < n2ExtraVocabs.length; i++) {
    const v = n2ExtraVocabs[i];
    const exists = await pool.query('SELECT id FROM vocabularies WHERE level = $1 AND kanji = $2', ['N2', v.kanji]);
    if (exists.rows.length === 0) {
      await pool.query(`
        INSERT INTO vocabularies (lesson_number, order_num, kanji, kana, romaji, vietnamese, clean_vietnamese, clean_kana, example_jp, example_vi, level, created_at)
        VALUES (1, $1, $2, $3, $4, $5, $6, $7, $8, $9, 'N2', NOW())
        ON CONFLICT DO NOTHING
      `, [100 + i, v.kanji, v.kana, v.romaji, v.vi, v.vi, v.kana, v.jp, v.vi_ex]);
    }
  }

  // Rich N1 Vocabularies
  const n1ExtraVocabs = [
    { kanji: '顕著', kana: 'けんちょ', romaji: 'kencho', vi: 'Rõ rệt, nổi bật đáng kể', jp: '回復の傾向が顕著に見られます。', vi_ex: 'Khuynh hướng hồi phục xuất hiện rõ rệt.' },
    { kanji: '網羅', kana: 'もうら', romaji: 'moura', vi: 'Bao quát toàn diện', jp: '最新の研究を網羅した論文です。', vi_ex: 'Luận văn bao quát toàn bộ các nghiên cứu mới nhất.' },
    { kanji: '脆弱', kana: 'ぜいじゃく', romaji: 'zeijaku', vi: 'Mong manh, dễ bị tổn thương', jp: 'システムの脆弱性を改善します。', vi_ex: 'Khắc phục các lỗ hổng dễ tổn thương của hệ thống.' },
    { kanji: '克明', kana: 'こくめい', romaji: 'kokumei', vi: 'Ghi chép tỉ mỉ, chi tiết từng li', jp: '当時の様子を克明に記録します。', vi_ex: 'Ghi chép tỉ mỉ tình cảnh thời điểm đó.' },
    { kanji: '多大', kana: 'ただい', romaji: 'tadai', vi: 'To lớn, vĩ đại', jp: '社会に多大な貢献をしました。', vi_ex: 'Đã đóng góp to lớn cho xã hội.' },
    { kanji: '抜擢', kana: 'ばってき', romaji: 'batteki', vi: 'Cất nhắc, đề bạt vượt cấp', jp: '若手社員がリーダーに抜擢されました。', vi_ex: 'Nhân viên trẻ đã được cất nhắc lên vị trí lãnh đạo.' }
  ];

  for (let i = 0; i < n1ExtraVocabs.length; i++) {
    const v = n1ExtraVocabs[i];
    const exists = await pool.query('SELECT id FROM vocabularies WHERE level = $1 AND kanji = $2', ['N1', v.kanji]);
    if (exists.rows.length === 0) {
      await pool.query(`
        INSERT INTO vocabularies (lesson_number, order_num, kanji, kana, romaji, vietnamese, clean_vietnamese, clean_kana, example_jp, example_vi, level, created_at)
        VALUES (1, $1, $2, $3, $4, $5, $6, $7, $8, $9, 'N1', NOW())
        ON CONFLICT DO NOTHING
      `, [100 + i, v.kanji, v.kana, v.romaji, v.vi, v.vi, v.kana, v.jp, v.vi_ex]);
    }
  }

  const finalCounts = await pool.query('SELECT level, count(*) FROM vocabularies GROUP BY level ORDER BY level');
  console.log('[PostgreSQL] Updated Vocabularies count by level:', finalCounts.rows);

  await pool.end();
}

seedRichJLPT().catch(console.error);
