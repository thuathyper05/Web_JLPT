const { pool } = require('../db');

async function seedMasterCurriculum() {
  console.log('[PostgreSQL] Seeding Full Authentic Textbook Curriculum (N5 - N1)...');

  // ── 1. N4 GRAMMAR & LESSONS (Minna no Nihongo II: Lessons 26 to 50) ──
  const n4GrammarPoints = [
    { lesson: 26, title: '～んです / ～んですが', structure: 'Thể thông thường + んです', meaning: 'Nhấn mạnh nguyên nhân, lý do hoặc dùng làm tiền đề mở đầu câu chuyện nhờ vả.' },
    { lesson: 27, title: 'Động từ thể khả năng (可能形)', structure: 'Nhóm 1: i sang eる | Nhóm 2: + られる | Nhóm 3: できる / こられる', meaning: 'Diễn tả năng lực bản thân hoặc điều kiện hoàn cảnh có thể làm được việc gì (đi với trợ từ が).' },
    { lesson: 28, title: '～ながら (Hành động đồng thời)', structure: 'V-masu (bỏ masu) + ながら', meaning: 'Hai hành động diễn ra song song cùng lúc, hành động sau là hành động chính.' },
    { lesson: 28, title: '～し、～し (Liệt kê lý do)', structure: 'Thể thông thường + し、 thể thông thường + し', meaning: 'Liệt kê từ 2 lý do hoặc đặc điểm trở lên để đưa ra kết luận.' },
    { lesson: 29, title: 'V-te います (Trạng thái kết quả của tự động từ)', structure: 'N が V-te います', meaning: 'Miêu tả trạng thái hiển hiện trước mắt của sự vật sau một biến cố (ví dụ: cửa đang mở, đèn đang sáng).' },
    { lesson: 30, title: 'V-te あります (Trạng thái có chủ đích của tha động từ)', structure: 'N が V-te あります', meaning: 'Miêu tả trạng thái của sự vật là kết quả của một hành động có chủ đích của con người.' },
    { lesson: 30, title: 'V-te おきます (Hành động chuẩn bị trước)', structure: 'V-te + おきます', meaning: 'Làm sẵn việc gì đó trước để chuẩn bị cho một việc tiếp theo, hoặc giữ nguyên trạng thái.' },
    { lesson: 31, title: 'Động từ thể ý chí (意向形) + と思っています', structure: 'V-ý chí + と思っています', meaning: 'Biểu thị ý định, quyết tâm của người nói đã ấp ủ từ trước đến nay.' },
    { lesson: 32, title: 'V-ta / V-nai ほうがいいです', structure: 'V-ta / V-nai + ほうがいいです', meaning: 'Đưa ra lời khuyên nên hoặc không nên làm gì trong tình huống cụ thể.' },
    { lesson: 32, title: '～でしょう / ～かもしれません', structure: 'Thể thông thường + でしょう / かもしれません', meaning: 'Phán đoán khả năng xảy ra của sự việc (khoảng 70% hoặc 50%).' },
    { lesson: 33, title: 'Thể mệnh lệnh (命令形) & Thể cấm đoán (禁止形)', structure: 'Nhóm 1: u sang e | Nhóm 2: + ろ | Nhóm 3: しろ / こい', meaning: 'Ra lệnh dứt khoát hoặc cảnh báo cấm chỉ trong tình huống khẩn cấp, biển báo.' },
    { lesson: 34, title: 'V1-ta / N の とおりに V2', structure: 'V1-ru / V1-ta / N の + とおりに', meaning: 'Thực hiện hành động V2 theo đúng chính xác như chỉ dẫn hoặc hình mẫu của V1.' },
    { lesson: 34, title: 'V1-ta / N の あとで V2', structure: 'V1-ta / N の + あとで', meaning: 'Sau khi làm xong V1 thì thực hiện tiếp V2.' },
    { lesson: 35, title: 'Động từ thể điều kiện (条件形 / ば)', structure: 'Nhóm 1: u sang eば | Nhóm 2: + れば | Nhóm 3: すれば / くれば', meaning: 'Nếu điều kiện trước xảy ra thì hệ quả sau sẽ xảy ra.' },
    { lesson: 36, title: 'V-ru / V-nai ようにします', structure: 'V-ru / V-nai + ようにします', meaning: 'Luôn nỗ lực, cố gắng duy trì một thói quen tốt hoặc từ bỏ thói quen xấu.' },
    { lesson: 37, title: 'Động từ thể bị động (受身形)', structure: 'N1 は N2 に V-bị động', meaning: 'Chủ ngữ bị người khác tác động, thường mang sắc thái bị phiền toái hoặc được khen ngợi.' },
    { lesson: 38, title: 'Danh từ hóa động từ (のは / のが / のを)', structure: 'V-thể từ điển + のは / のが / のを', meaning: 'Biến một mệnh đề động từ thành danh từ để làm chủ ngữ hoặc bổ ngữ trong câu.' },
    { lesson: 39, title: 'Nguyên nhân - lý do (て / で)', structure: 'V-te / V-nakute / A-i くて / N で', meaning: 'Vì nguyên nhân khách quan dẫn tới cảm xúc, trạng thái bất ngờ ngoài ý muốn.' },
    { lesson: 40, title: 'Nghi vấn từ lồng ghép (か / かどうか)', structure: 'Câu hỏi nghi vấn + か / Thể thông thường + かどうか', meaning: 'Lồng một câu hỏi thành một vế nhỏ trong câu lớn.' },
    { lesson: 41, title: 'Hành động cho và nhận kính trọng (いただきます / くださいます)', structure: 'V-te いただきます / くださいます / やります', meaning: 'Diễn tả hành động làm ơn cho ai đó với sự tôn trọng đối với cấp trên hoặc người lớn tuổi.' },
    { lesson: 42, title: 'Mục đích hành động (ために)', structure: 'V-thể từ điển / N の + ために', meaning: 'Làm việc gì đó vì mục đích to lớn hoặc vì lợi ích của đối tượng.' },
    { lesson: 43, title: 'Dường như, sắp sửa (そうです - Biểu hiện bề ngoài)', structure: 'V-masu (bỏ masu) + そうです | A-i (bỏ i) + そうです', meaning: 'Phán đoán dựa trên những gì nhìn thấy trước mắt.' },
    { lesson: 44, title: 'Quá mức (～すぎます) / Dễ và Khó (～やすい / ～にくい)', structure: 'V-masu (bỏ masu) + すぎます / やすい / にくい', meaning: 'Làm điều gì quá giới hạn hoặc tính chất thao tác dễ dàng, khó khăn.' },
    { lesson: 45, title: 'Trường hợp giả định (場合は) / Tương phản bất ngờ (のに)', structure: 'Thể thông thường + 場合は / のに', meaning: 'Giả định tình huống phát sinh hoặc diễn tả sự việc xảy ra trái ngược với kỳ vọng.' },
    { lesson: 46, title: 'Giai đoạn thời điểm (ところです) / Vừa mới xong (ばかりです)', structure: 'V-ru / V-te iru / V-ta + ところです | V-ta + ばかりです', meaning: 'Xác định chính xác thời điểm trước khi làm, đang làm, vừa làm xong.' },
    { lesson: 47, title: 'Nghe nói là (そうです - Truyền đạt) / Có vẻ như (ようです)', structure: 'Thể thông thường + そうです / ようです', meaning: 'Truyền đạt lại tin tức nghe được từ nguồn khác hoặc suy đoán qua các giác quan.' },
    { lesson: 48, title: 'Động từ thể sai khiến (使役形)', structure: 'Nhóm 1: aせる | Nhóm 2: させる | Nhóm 3: させる / こさせる', meaning: 'Cho phép hoặc ép buộc người dưới làm một việc gì đó.' },
    { lesson: 49, title: 'Tôn kính ngữ (尊敬語 - 尊敬動詞, お～になります)', structure: 'お + V-masu (bỏ masu) + になります', meaning: 'Biểu thị sự kính trọng cao nhất đối với hành động của khách hàng, cấp trên.' },
    { lesson: 50, title: 'Khiêm nhường ngữ (謙譲語 - 謙譲動詞, お～します)', structure: 'お + V-masu (bỏ masu) + します / いたします', meaning: 'Hạ thấp hành động của bản thân để nâng vị thế của người nghe.' }
  ];

  for (const g of n4GrammarPoints) {
    const exists = await pool.query('SELECT id FROM grammar_points WHERE level = $1 AND title = $2', ['N4', g.title]);
    if (exists.rows.length === 0) {
      const maxRes = await pool.query('SELECT COALESCE(MAX(order_num), 0) + 1 AS next_order FROM grammar_points WHERE level = $1 AND lesson_number = $2', ['N4', g.lesson]);
      const nextOrder = maxRes.rows[0].next_order;
      await pool.query(`
        INSERT INTO grammar_points (level, lesson_number, order_num, title, structure, meaning, created_at)
        VALUES ('N4', $1, $2, $3, $4, $5, NOW())
        ON CONFLICT DO NOTHING
      `, [g.lesson, nextOrder, g.title, g.structure, g.meaning]);
    }
  }

  // ── 2. N3 GRAMMAR (Nihongo Soumatome & Shinkanzen Master N3) ──
  const n3GrammarPoints = [
    { lesson: 1, title: '～に関して / ～に関する', structure: 'N + に関して / N1 に関する N2', meaning: 'Liên quan đến vấn đề nào đó (văn phong trang trọng hơn について).' },
    { lesson: 2, title: '～に対して / ～に対する', structure: 'N + に対して / N1 に対する N2', meaning: 'Đối với đối tượng (thái độ), hoặc so sánh hai đối tượng trái ngược nhau.' },
    { lesson: 3, title: '～によって / ～による', structure: 'N + によって / N1 による N2', meaning: 'Chỉ nguyên nhân, phương tiện cách thức, chủ thể tạo ra tác phẩm, hoặc tùy theo đối tượng.' },
    { lesson: 4, title: '～につれて / ～にしたがって', structure: 'V-ru / N + につれて / にしたがって', meaning: 'Cùng với sự biến đổi của A thì B cũng biến đổi song song theo chiều hướng kéo theo.' },
    { lesson: 5, title: '～をはじめ / ～をはじめとする', structure: 'N + をはじめ / N1 をはじめとする N2', meaning: 'Trước tiên phải kể đến đối tượng tiêu biểu nhất trong số nhiều đối tượng.' },
    { lesson: 6, title: '～に基づいて / ～に基づく', structure: 'N + に基づいて / N1 に基づく N2', meaning: 'Lấy cái gì làm căn cứ, nền tảng cơ sở pháp lý hoặc dữ liệu thực tế.' },
    { lesson: 7, title: '～をめぐって / ～をめぐる', structure: 'N + をめぐって / N1 をめぐる N2', meaning: 'Xoay quanh một vấn đề tranh cãi, tranh chấp, hoặc thảo luận sôi nổi.' },
    { lesson: 8, title: '～わけではない / ～わけがない', structure: 'Thể thông thường + わけではない / わけがない', meaning: 'Không hẳn là như vậy / Tuyệt đối không có khả năng xảy ra.' },
    { lesson: 9, title: '～わけにはいかない', structure: 'V-ru / V-nai + わけにはいかない', meaning: 'Không thể làm / Buộc phải làm vì ràng buộc đạo đức, phép tắc xã hội.' },
    { lesson: 10, title: '～わりに（は） / ～にしては', structure: 'Thể thông thường / N の + わりに / N + にしては', meaning: 'So với tiêu chuẩn hay thực tế thì kết quả lại ngoài dự kiến bất ngờ.' },
    { lesson: 11, title: '～くせに', structure: 'Thể thông thường / N の + くせに', meaning: 'Thế mà, vậy mà (mang sắc thái chê bai, mỉa mai, trách móc sâu sắc).' },
    { lesson: 12, title: '～とおりに / ～どおりに', structure: 'V-ru / V-ta / N + どおりに', meaning: 'Làm theo đúng như những gì đã nghĩ, đã vẽ hoặc đã lên kế hoạch.' },
    { lesson: 13, title: '～たびに', structure: 'V-ru / N の + たびに', meaning: 'Cứ mỗi lần làm gì là một kết quả quen thuộc lại lặp lại.' },
    { lesson: 14, title: '～最中に / ～最中だ', structure: 'V-te iru / N の + 最中に', meaning: 'Đúng vào lúc đang tập trung làm việc gì thì sự việc bất ngờ chen ngang.' },
    { lesson: 15, title: '～おかげで / ～せいで', structure: 'Thể thông thường + おかげで / せいで', meaning: 'Nhờ có (kết quả tích cực) / Do tại vì (hậu quả tiêu cực trách móc).' }
  ];

  for (const g of n3GrammarPoints) {
    const exists = await pool.query('SELECT id FROM grammar_points WHERE level = $1 AND title = $2', ['N3', g.title]);
    if (exists.rows.length === 0) {
      const maxRes = await pool.query('SELECT COALESCE(MAX(order_num), 0) + 1 AS next_order FROM grammar_points WHERE level = $1 AND lesson_number = $2', ['N3', g.lesson]);
      const nextOrder = maxRes.rows[0].next_order;
      await pool.query(`
        INSERT INTO grammar_points (level, lesson_number, order_num, title, structure, meaning, created_at)
        VALUES ('N3', $1, $2, $3, $4, $5, NOW())
        ON CONFLICT DO NOTHING
      `, [g.lesson, nextOrder, g.title, g.structure, g.meaning]);
    }
  }

  // ── 3. N2 GRAMMAR (Nihongo Soumatome & Shinkanzen Master N2) ──
  const n2GrammarPoints = [
    { lesson: 1, title: '～に際して / ～に際し', structure: 'N / V-ru + に際して', meaning: 'Nhân dịp, vào thời điểm bắt đầu một sự kiện lớn trang trọng.' },
    { lesson: 2, title: '～を契機に / ～を契機として', structure: 'N + を契機に', meaning: 'Lấy một cơ hội hoặc sự kiện làm bước ngoặt thay đổi lớn.' },
    { lesson: 3, title: '～つつある', structure: 'V-masu (bỏ masu) + つつある', meaning: 'Đang dần dần biến đổi theo một chiều hướng nào đó.' },
    { lesson: 4, title: '～にほかならない', structure: 'N / Thể thông thường + からにほかならない', meaning: 'Chính là, không gì khác ngoài (khẳng định lý do tuyệt đối duy nhất).' },
    { lesson: 5, title: '～ざるを得ない', structure: 'V-nai (bỏ nai) + ざるを得ない (suru sang せざるを得ない)', meaning: 'Đành phải, buộc phải làm dù trong lòng không muốn.' },
    { lesson: 6, title: '～かねない', structure: 'V-masu (bỏ masu) + かねない', meaning: 'Có nguy cơ, có khả năng dẫn tới hậu quả xấu đáng lo ngại.' },
    { lesson: 7, title: '～かねる', structure: 'V-masu (bỏ masu) + かねる', meaning: 'Khó lòng có thể, không thể làm được (từ chối lịch sự trong kinh doanh).' },
    { lesson: 8, title: '～っこない', structure: 'V-masu (bỏ masu) + っこない', meaning: 'Tuyệt đối không thể nào (phủ định dứt khoát trong khẩu ngữ).' },
    { lesson: 9, title: '～に相違ない', structure: 'Thể thông thường + に相違ない', meaning: 'Chắc chắn không sai lệch đi đâu được (khẳng định với mức độ tin tưởng cao).' },
    { lesson: 10, title: '～にすぎない', structure: 'Thể thông thường / N + にすぎない', meaning: 'Chẳng qua chỉ là, không hơn không kém (đánh giá mức độ bình thường).' },
    { lesson: 11, title: '～を問わず / ～は問わず', structure: 'N + を問わず', meaning: 'Không màng tới, bất kể điều kiện (tuổi tác, giới tính, quốc tịch).' },
    { lesson: 12, title: '～にもかかわらず', structure: 'Thể thông thường / N + にもかかわらず', meaning: 'Mặc dù, bất chấp điều kiện (thực tế diễn ra ngược lại với suy đoán thông thường).' }
  ];

  for (const g of n2GrammarPoints) {
    const exists = await pool.query('SELECT id FROM grammar_points WHERE level = $1 AND title = $2', ['N2', g.title]);
    if (exists.rows.length === 0) {
      const maxRes = await pool.query('SELECT COALESCE(MAX(order_num), 0) + 1 AS next_order FROM grammar_points WHERE level = $1 AND lesson_number = $2', ['N2', g.lesson]);
      const nextOrder = maxRes.rows[0].next_order;
      await pool.query(`
        INSERT INTO grammar_points (level, lesson_number, order_num, title, structure, meaning, created_at)
        VALUES ('N2', $1, $2, $3, $4, $5, NOW())
        ON CONFLICT DO NOTHING
      `, [g.lesson, nextOrder, g.title, g.structure, g.meaning]);
    }
  }

  // ── 4. N1 GRAMMAR (Shinkanzen Master & Soumatome N1) ──
  const n1GrammarPoints = [
    { lesson: 1, title: '～たりとも', structure: 'Số từ 1 + たりとも...ない', meaning: 'Dù chỉ một... cũng không được để lãng phí hay vi phạm.' },
    { lesson: 2, title: '～すら / ～ですら', structure: 'N + すら', meaning: 'Thậm chí đến cả mức độ đơn giản này cũng không thể.' },
    { lesson: 3, title: '～をもって', structure: 'N + ををもって', meaning: 'Bằng phương tiện, hoặc lấy mốc thời điểm này làm hạn chót kết thúc.' },
    { lesson: 4, title: '～極まりない / ～極まる', structure: 'A-na + 極まりない / 極まる', meaning: 'Hết sức, vô cùng (mức độ cảm xúc hoặc hành vi đạt đến tột độ).' },
    { lesson: 5, title: '～を余儀なくされる', structure: 'N + を余儀なくされる', meaning: 'Buộc lòng phải chấp nhận tình thế không thể né tránh do hoàn cảnh bên ngoài.' },
    { lesson: 6, title: '～ならでは / ～ならではの', structure: 'N + ならでは / N1 ならではの N2', meaning: 'Chỉ có thể là người đó hay nơi đó mới có được nét đặc sắc tuyệt vời ấy.' },
    { lesson: 7, title: '～にたえない', structure: 'V-ru / N + にたえない', meaning: 'Không nén nổi cảm xúc (vui sướng, tri ân, xấu hổ).' },
    { lesson: 8, title: '～てやまない', structure: 'V-te + やまない', meaning: 'Thành tâm chúc phúc hoặc mong ước không bao giờ nguôi ngoai.' },
    { lesson: 9, title: '～と相まって', structure: 'N + と相まって', meaning: 'Cộng hưởng cùng với yếu tố khác tạo nên hiệu quả vượt bậc.' },
    { lesson: 10, title: '～を皮切りに（して）', structure: 'N + を皮切りに', meaning: 'Mở đầu chuỗi sự kiện hoặc hoạt động ngày càng nhân rộng ra sau đó.' }
  ];

  for (const g of n1GrammarPoints) {
    const exists = await pool.query('SELECT id FROM grammar_points WHERE level = $1 AND title = $2', ['N1', g.title]);
    if (exists.rows.length === 0) {
      const maxRes = await pool.query('SELECT COALESCE(MAX(order_num), 0) + 1 AS next_order FROM grammar_points WHERE level = $1 AND lesson_number = $2', ['N1', g.lesson]);
      const nextOrder = maxRes.rows[0].next_order;
      await pool.query(`
        INSERT INTO grammar_points (level, lesson_number, order_num, title, structure, meaning, created_at)
        VALUES ('N1', $1, $2, $3, $4, $5, NOW())
        ON CONFLICT DO NOTHING
      `, [g.lesson, nextOrder, g.title, g.structure, g.meaning]);
    }
  }

  // ── 5. CORE KANJI EXPANSION (N4, N3, N2, N1) ──
  const masterKanji = [
    // N4 Kanji
    { level: 'N4', kanji: '駅', onyomi: 'エキ', kunyomi: '', han_viet: 'DỊCH', meaning: 'Nhà ga tàu điện', stroke_count: 14 },
    { level: 'N4', kanji: '電', onyomi: 'デン', kunyomi: '', han_viet: 'ĐIỆN', meaning: 'Điện lực, sấm chớp', stroke_count: 13 },
    { level: 'N4', kanji: '車', onyomi: 'シャ', kunyomi: 'くるま', han_viet: 'XA', meaning: 'Xe cộ, phương tiện', stroke_count: 7 },
    { level: 'N4', kanji: '校', onyomi: 'コウ', kunyomi: '', han_viet: 'HIỆU', meaning: 'Trường học', stroke_count: 10 },
    { level: 'N4', kanji: '店', onyomi: 'テン', kunyomi: 'みせ', han_viet: 'ĐIẾM', meaning: 'Cửa hàng, tiệm buôn', stroke_count: 8 },
    { level: 'N4', kanji: '病', onyomi: 'ビョウ', kunyomi: 'や・む', han_viet: 'BỆNH', meaning: 'Bệnh tật, ốm đau', stroke_count: 10 },
    { level: 'N4', kanji: '院', onyomi: 'イン', kunyomi: '', han_viet: 'VIỆN', meaning: 'Bệnh viện, cơ quan', stroke_count: 10 },
    { level: 'N4', kanji: '銀', onyomi: 'ギン', kunyomi: '', han_viet: 'NGÂN', meaning: 'Bạc, tiền tệ ngân hàng', stroke_count: 14 },
    { level: 'N4', kanji: '道', onyomi: 'ドウ', kunyomi: 'みち', han_viet: 'ĐẠO', meaning: 'Con đường, đạo lý', stroke_count: 12 },
    { level: 'N4', kanji: '旅', onyomi: 'リョ', kunyomi: 'たび', han_viet: 'LỮ', meaning: 'Chuyến du lịch, chuyến đi', stroke_count: 10 },
    { level: 'N4', kanji: '館', onyomi: 'カン', kunyomi: 'やかた', han_viet: 'QUÁN', meaning: 'Tòa nhà, hội quán, bảo tàng', stroke_count: 16 },
    { level: 'N4', kanji: '買', onyomi: 'バイ', kunyomi: 'か・う', han_viet: 'MÃI', meaning: 'Mua sắm', stroke_count: 12 },
    { level: 'N4', kanji: '売', onyomi: 'バイ', kunyomi: 'う・る', han_viet: 'MẠI', meaning: 'Bán hàng', stroke_count: 7 },
    { level: 'N4', kanji: '質', onyomi: 'シツ', kunyomi: '', han_viet: 'CHẤT', meaning: 'Phẩm chất, câu hỏi', stroke_count: 15 },
    { level: 'N4', kanji: '問', onyomi: 'モン', kunyomi: 'と・う', han_viet: 'VẤN', meaning: 'Hỏi han, vấn đáp', stroke_count: 11 },

    // N3 Kanji
    { level: 'N3', kanji: '政', onyomi: 'セイ', kunyomi: 'まつりごと', han_viet: 'CHÍNH', meaning: 'Chính trị, đường lối chính sách', stroke_count: 9 },
    { level: 'N3', kanji: '治', onyomi: 'ジ、チ', kunyomi: 'おさ・める', han_viet: 'TRỊ', meaning: 'Cai trị, chữa lành bệnh', stroke_count: 8 },
    { level: 'N3', kanji: '経', onyomi: 'ケイ', kunyomi: 'へ・る', han_viet: 'KINH', meaning: 'Kinh tế, trải qua', stroke_count: 11 },
    { level: 'N3', kanji: '済', onyomi: 'サイ', kunyomi: 'す・む', han_viet: 'TẾ', meaning: 'Kinh tế, cứu giúp, hoàn tất', stroke_count: 11 },
    { level: 'N3', kanji: '歴', onyomi: 'レキ', kunyomi: '', han_viet: 'LỊCH', meaning: 'Lịch sử, trải nghiệm', stroke_count: 14 },
    { level: 'N3', kanji: '史', onyomi: 'シ', kunyomi: '', han_viet: 'SỬ', meaning: 'Sử gia, ghi chép lịch sử', stroke_count: 5 },
    { level: 'N3', kanji: '連', onyomi: 'レン', kunyomi: 'つら・なる', han_viet: 'LIÊN', meaning: 'Kết nối, liên lạc', stroke_count: 10 },
    { level: 'N3', kanji: '絡', onyomi: 'ラク', kunyomi: 'から・む', han_viet: 'LẠC', meaning: 'Dây ràng buộc, liên lạc', stroke_count: 12 },
    { level: 'N3', kanji: '設', onyomi: 'セツ', kunyomi: 'もう・ける', han_viet: 'THIẾT', meaning: 'Thiết lập, thành lập', stroke_count: 11 },
    { level: 'N3', kanji: '計', onyomi: 'ケイ', kunyomi: 'はか・る', han_viet: 'KẾ', meaning: 'Kế hoạch, đo lường', stroke_count: 9 },
    { level: 'N3', kanji: '認', onyomi: 'ニン', kunyomi: 'みと・める', han_viet: 'NHẬN', meaning: 'Công nhận, thừa nhận', stroke_count: 14 },
    { level: 'N3', kanji: '確', onyomi: 'カク', kunyomi: 'たし・か', han_viet: 'XÁC', meaning: 'Chính xác, chắc chắn', stroke_count: 15 },

    // N2 Kanji
    { level: 'N2', kanji: '契', onyomi: 'ケイ', kunyomi: 'ちぎ・る', han_viet: 'KHẾ', meaning: 'Khế ước, hợp đồng, thời cơ', stroke_count: 9 },
    { level: 'N2', kanji: '機', onyomi: 'キ', kunyomi: 'はた', han_viet: 'CƠ', meaning: 'Thời cơ, máy móc kỹ thuật', stroke_count: 16 },
    { level: 'N2', kanji: '徹', onyomi: 'テツ', kunyomi: '', han_viet: 'TRIỆT', meaning: 'Triệt để, thấu suốt', stroke_count: 15 },
    { level: 'N2', kanji: '底', onyomi: 'テイ', kunyomi: 'そこ', han_viet: 'ĐẾ', meaning: 'Đáy sâu, gốc rễ tận cùng', stroke_count: 8 },
    { level: 'N2', kanji: '握', onyomi: 'アク', kunyomi: 'にぎ・る', han_viet: 'ÁC', meaning: 'Nắm chắc trong tay, thấu suốt', stroke_count: 12 },
    { level: 'N2', kanji: '妥', onyomi: 'ダ', kunyomi: '', han_viet: 'THỎA', meaning: 'Thỏa đáng, yên ổn', stroke_count: 7 },
    { level: 'N2', kanji: '促', onyomi: 'ソク', kunyomi: 'うなが・す', han_viet: 'XÚC', meaning: 'Thúc đẩy tiến triển', stroke_count: 9 },
    { level: 'N2', kanji: '蓄', onyomi: 'チク', kunyomi: 'たくわ・える', han_viet: 'SÚC', meaning: 'Tích trữ, tích lũy tri thức', stroke_count: 13 },
    { level: 'N2', kanji: '克', onyomi: 'コク', kunyomi: '', han_viet: 'KHẮC', meaning: 'Khắc phục gian nan', stroke_count: 7 },
    { level: 'N2', kanji: '岐', onyomi: 'キ', kunyomi: '', han_viet: 'KỲ', meaning: 'Ngã rẽ, phân nhánh đa diện', stroke_count: 7 },

    // N1 Kanji
    { level: 'N1', kanji: '顕', onyomi: 'ケン', kunyomi: 'あきらか', han_viet: 'HIỂN', meaning: 'Hiển hiện, rõ rệt, nổi bật', stroke_count: 18 },
    { level: 'N1', kanji: '著', onyomi: 'チョ', kunyomi: 'いちじる・しい', han_viet: 'TRỨ', meaning: 'Đáng kể, trứ danh tác phẩm', stroke_count: 11 },
    { level: 'N1', kanji: '網', onyomi: 'モウ', kunyomi: 'あみ', han_viet: 'VÕNG', meaning: 'Lưới trời, bao quát toàn diện', stroke_count: 14 },
    { level: 'N1', kanji: '羅', onyomi: 'ラ', kunyomi: '', han_viet: 'LA', meaning: 'La bàn, bao trùm, lụa là', stroke_count: 19 },
    { level: 'N1', kanji: '脆', onyomi: 'ゼイ', kunyomi: 'もろ・い', han_viet: 'THÚY', meaning: 'Mong manh, dễ tổn thương, giòn', stroke_count: 10 },
    { level: 'N1', kanji: '弱', onyomi: 'ジャク', kunyomi: 'よわ・い', han_viet: 'NHƯỢC', meaning: 'Yếu ớt, non nớt', stroke_count: 10 },
    { level: 'N1', kanji: '抜', onyomi: 'バツ', kunyomi: 'ぬ・く', han_viet: 'BẠT', meaning: 'Rút ra, cất nhắc đề bạt', stroke_count: 7 },
    { level: 'N1', kanji: '擢', onyomi: 'テキ', kunyomi: '', han_viet: 'TRẠC', meaning: 'Cất nhắc lên chức vị lãnh đạo', stroke_count: 17 },
    { level: 'N1', kanji: '緻', onyomi: 'チ', kunyomi: '', han_viet: 'TRÍ', meaning: 'Chặt chẽ, tỉ mỉ từng chi tiết', stroke_count: 15 },
    { level: 'N1', kanji: '密', onyomi: 'ミツ', kunyomi: 'ひそ・か', han_viet: 'MẬT', meaning: 'Bí mật, mật độ dày đặc', stroke_count: 11 }
  ];

  for (const k of masterKanji) {
    await pool.query(`
      INSERT INTO kanji (kanji, onyomi, kunyomi, han_viet, meaning, stroke_count, level, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
      ON CONFLICT (kanji) DO UPDATE SET level = EXCLUDED.level, onyomi = EXCLUDED.onyomi, kunyomi = EXCLUDED.kunyomi, meaning = EXCLUDED.meaning
    `, [k.kanji, k.onyomi, k.kunyomi, k.han_viet, k.meaning, k.stroke_count, k.level]);
  }

  // Check counts
  const gCounts = await pool.query('SELECT level, count(*) FROM grammar_points GROUP BY level ORDER BY level');
  const kCounts = await pool.query('SELECT level, count(*) FROM kanji GROUP BY level ORDER BY level');
  const vCounts = await pool.query('SELECT level, count(*) FROM vocabularies GROUP BY level ORDER BY level');

  console.log('[PostgreSQL] Final Curriculum Counts:');
  console.log('Grammar:', gCounts.rows);
  console.log('Kanji:', kCounts.rows);
  console.log('Vocabularies:', vCounts.rows);

  await pool.end();
}

seedMasterCurriculum().catch(console.error);
