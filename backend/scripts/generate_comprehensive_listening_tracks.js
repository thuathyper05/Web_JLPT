// Script mở rộng toàn diện hệ thống bài nghe Choukai chuẩn JLPT N5 và N4
// ZERO ARROWS RULE: Tuyệt đối không dùng ký tự mũi tên

const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../../frontend/src/data/listeningTracks.js');

// Import dữ liệu hiện tại
const currentModule = require(filePath);
const tracksData = currentModule.listeningTracksByLevel;

console.log('Current N5 count:', tracksData.N5.length);
console.log('Current N4 count:', tracksData.N4.length);

// Danh sách các bài nghe bổ sung chất lượng cao cho N5 (Bài 2 đến Bài 25)
const newN5Tracks = [
  // Bài 2 - Bổ sung Part 3
  {
    lesson: 2,
    partName: 'Phần 3: Mondai 4 - Phản xạ xác nhận chủ nhân đồ vật',
    mondaiType: 'mondai4',
    topic: 'Bài 02 - Phần 3: Phản xạ đồ đạc của ai',
    situation: 'Bạn nhặt được một chiếc ô ở sảnh lễ tân và hỏi người bên cạnh.',
    audioText: 'すみません、これはどなたの傘ですか。',
    dialogue: [
      { speaker: 'Bạn', role: 'A', kanji: 'すみません、これはどなたの傘ですか。', kana: 'すみません、これはどなたのかさですか。', vi: 'Xin lỗi, chiếc ô này là của vị nào vậy ạ?' }
    ],
    question: 'Hãy chọn câu trả lời tự nhiên và chính xác nhất:',
    options: [
      { id: 'A', text: 'あ、私のです。ありがとうございます。' },
      { id: 'B', text: 'はい、そうです。傘です。' },
      { id: 'C', text: 'いいえ、傘ではありません。' },
      { id: 'D', text: 'あそこです。' }
    ],
    correctAnswer: 'A',
    explanation: 'Câu hỏi 「どなたの傘ですか」(ô của ai) dùng để hỏi người sở hữu. Đáp án đúng là A 「あ、私のです」(À, là của tôi).',
    keyword: 'どなたの傘 (ô của ai) & 私の (của tôi)',
    tip: 'Bắt đại từ nghi vấn 「どなたの」 (của ai) để tìm phương án có đại từ sở hữu 「〜の」.',
    level: 'N5'
  },
  // Bài 3 - Bổ sung Part 3
  {
    lesson: 3,
    partName: 'Phần 3: Mondai 4 - Phản xạ hỏi giá tiền',
    mondaiType: 'mondai4',
    topic: 'Bài 03 - Phần 3: Phản xạ mua sắm và hỏi giá',
    situation: 'Bạn đang ở cửa hàng đồng hồ Ginza và hỏi giá chiếc đồng hồ đeo tay.',
    audioText: 'すみません、そのスイスの時計はいくらですか。',
    dialogue: [
      { speaker: 'Khách hàng', role: 'A', kanji: 'すみません、そのスイスの時計はいくらですか。', kana: 'すみません、そのすいすのとけいはいくらですか。', vi: 'Xin lỗi, chiếc đồng hồ Thụy Sĩ đó giá bao nhiêu tiền vậy ạ?' }
    ],
    question: 'Hãy chọn câu trả lời đúng của nhân viên bán hàng:',
    options: [
      { id: 'A', text: '２万８千円でございます。' },
      { id: 'B', text: 'スイス製でございます。' },
      { id: 'C', text: '２階でございます。' },
      { id: 'D', text: '午前１０時からでございます。' }
    ],
    correctAnswer: 'A',
    explanation: 'Câu hỏi 「いくらですか」(giá bao nhiêu) đòi hỏi câu trả lời bằng số tiền (yên). Đáp án đúng là A 「２万８千円でございます」(Dạ là 28.000 yên ạ).',
    keyword: 'いくら (bao nhiêu tiền) & 円 (yên)',
    tip: 'Nhận diện ngay từ để hỏi giá cả 「いくら」 để chọn số tiền.',
    level: 'N5'
  },
  // Bài 4 - Bổ sung Part 3
  {
    lesson: 4,
    partName: 'Phần 3: Mondai 4 - Phản xạ hỏi giờ giấc hiện tại',
    mondaiType: 'mondai4',
    topic: 'Bài 04 - Phần 3: Phản xạ thời gian',
    situation: 'Một hành khách tại ga Shinjuku hỏi giờ bạn.',
    audioText: 'すみません、今、何時ですか。',
    dialogue: [
      { speaker: 'Hành khách', role: 'A', kanji: 'すみません、今、何時ですか。', kana: 'すみません、いま、なんじですか。', vi: 'Xin lỗi, bây giờ là mấy giờ rồi ạ?' }
    ],
    question: 'Hãy chọn câu đáp lại thích hợp:',
    options: [
      { id: 'A', text: '午後３時１５分ですよ。' },
      { id: 'B', text: '９時から５時までです。' },
      { id: 'C', text: '日曜日です。' },
      { id: 'D', text: '明日です。' }
    ],
    correctAnswer: 'A',
    explanation: 'Hỏi 「今、何時ですか」(bây giờ mấy giờ) thì trả lời thời điểm hiện tại: 3 giờ 15 phút chiều. Đáp án đúng là A.',
    keyword: '何時 (mấy giờ) & 午後〜時 (giờ chiều)',
    tip: 'Phân biệt giữa thời điểm 「何時ですか」 và khoảng thời gian 「何時から何時まで」.',
    level: 'N5'
  },
  // Bài 5 - Bổ sung Part 3
  {
    lesson: 5,
    partName: 'Phần 3: Mondai 4 - Phản xạ kế hoạch cuối tuần',
    mondaiType: 'mondai4',
    topic: 'Bài 05 - Phần 3: Phản xạ phương hướng và kế hoạch',
    situation: 'Đồng nghiệp hỏi bạn kế hoạch đi chơi vào ngày chủ nhật.',
    audioText: '日曜日、どこかへ行きますか。',
    dialogue: [
      { speaker: 'Đồng nghiệp', role: 'A', kanji: '日曜日、どこかへ行きますか。', kana: 'にちようび、どこかへいきますか。', vi: 'Chủ nhật này bạn có đi đâu chơi không?' }
    ],
    question: 'Hãy chọn câu trả lời tự nhiên nhất:',
    options: [
      { id: 'A', text: 'いいえ、どこも行きません。家で休みます。' },
      { id: 'B', text: 'はい、電車で行きます。' },
      { id: 'C', text: '友達と行きます。' },
      { id: 'D', text: '先週行きました。' }
    ],
    correctAnswer: 'A',
    explanation: 'Câu hỏi nghi vấn Yes/No với 「どこかへ行きますか」(có đi đâu không) đòi hỏi trả lời có đi hoặc không đi đâu cả (「どこも行きません」). Đáp án đúng là A.',
    keyword: 'どこかへ (đi đâu đó) & どこも〜ません (không đi đâu)',
    tip: 'Để ý 「どこか」 (có đi đâu đó không) khác với 「どこへ」(đi đâu).',
    level: 'N5'
  },
  // Bài 6 - Ngoại động từ & Rủ rê
  {
    lesson: 6,
    partName: 'Phần 2: Mondai 1 - Chọn địa điểm ăn trưa',
    mondaiType: 'mondai1',
    topic: 'Bài 06 - Phần 2: Hai người rủ nhau ăn trưa ở đâu',
    situation: 'Hai nhân viên văn phòng thảo luận chọn quán ăn trưa.',
    audioText: 'もう１２時ですね。いっしょにお昼ごはんを食べませんか。いいですね。何を食べましょうか。駅前の新しいラーメン屋はどうですか。昨日ラーメンを食べましたから、今日は日本料理の店へ行きましょう。じゃ、そうしましょう。',
    dialogue: [
      { speaker: 'Nam', role: 'A', kanji: 'もう１２時ですね。いっしょにお昼ごはんを食べませんか。', kana: 'もうじゅうにじですね。いっしょにおひるごはんをたべませんか。', vi: 'Đã 12 giờ rồi nhỉ. Cùng đi ăn trưa không?' },
      { speaker: 'Nữ', role: 'B', kanji: 'いいですね。何を食べましょうか。', kana: 'いいですね。なにをたべましょうか。', vi: 'Được đấy. Chúng ta ăn gì đây?' },
      { speaker: 'Nam', role: 'A', kanji: '駅前の新しいラーメン屋はどうですか。', kana: 'えきまえのあたらしいらーめんやはどうですか。', vi: 'Quán ramen mới ở trước nhà ga thì sao?' },
      { speaker: 'Nữ', role: 'B', kanji: '昨日ラーメンを食べましたから、今日は日本料理の店へ行きましょう。', kana: 'きのうらーめんをたべましたから、きょうはにほんりょうりのみせへいきましょう。', vi: 'Hôm qua tôi vừa ăn ramen rồi nên hôm nay chúng ta đi quán món Nhật đi.' },
      { speaker: 'Nam', role: 'A', kanji: 'じゃ、そうしましょう。', kana: 'じゃ、そうしましょう。', vi: 'Vậy làm như thế nhé.' }
    ],
    question: 'Hai người quyết định sẽ đi ăn ở đâu?',
    options: [
      { id: 'A', text: 'Quán ăn món Nhật' },
      { id: 'B', text: 'Quán ramen mới trước ga' },
      { id: 'C', text: 'Ăn cơm hộp tại văn phòng' },
      { id: 'D', text: 'Quán cà phê gần công ty' }
    ],
    correctAnswer: 'A',
    explanation: 'Người nam đề xuất quán ramen nhưng người nữ từ chối vì hôm qua đã ăn ramen rồi và rủ đi 「日本料理の店」(quán món Nhật). Người nam đồng ý. Đáp án đúng là A.',
    keyword: '日本料理の店へ行きましょう (đi quán món Nhật)',
    tip: 'Chú ý từ phản bác và từ chối lời gợi ý đầu tiên bằng lý do 「〜から」.',
    level: 'N5'
  },
  {
    lesson: 6,
    partName: 'Phần 3: Mondai 4 - Phản xạ đáp lại lời rủ rê uống cà phê',
    mondaiType: 'mondai4',
    topic: 'Bài 06 - Phần 3: Phản xạ giao tiếp rủ rê',
    situation: 'Đồng nghiệp rủ bạn đi uống cà phê giải lao.',
    audioText: 'ちょっとロビーでコーヒーを飲みませんか。',
    dialogue: [
      { speaker: 'Đồng nghiệp', role: 'A', kanji: 'ちょっとロビーでコーヒーを飲みませんか。', kana: 'ちょっとろびーでこーひーをのみませんか。', vi: 'Cùng ra sảnh uống chút cà phê không?' }
    ],
    question: 'Hãy chọn câu đáp lại đồng ý lịch sự nhất:',
    options: [
      { id: 'A', text: 'ええ、飲みましょう。' },
      { id: 'B', text: 'はい、飲みました。' },
      { id: 'C', text: 'いいえ、コーヒーです。' },
      { id: 'D', text: 'いただきます。' }
    ],
    correctAnswer: 'A',
    explanation: 'Đáp lại lời mời rủ rê 「〜ませんか」 khi đồng ý dùng 「ええ、〜ましょう」(Vâng, chúng ta cùng làm thôi). Đáp án đúng là A.',
    keyword: 'ええ、〜ましょう (đồng ý cùng làm)',
    tip: 'Mẫu rủ rê 「〜ませんか」 đi cặp với câu trả lời đồng ý 「〜ましょう」.',
    level: 'N5'
  },
  // Bài 7 - Cho nhận & Đã làm xong chưa
  {
    lesson: 7,
    partName: 'Phần 2: Mondai 1 - Xác nhận đã nộp báo cáo chưa',
    mondaiType: 'mondai1',
    topic: 'Bài 07 - Phần 2: Nhiệm vụ chuẩn bị báo cáo',
    situation: 'Trưởng phòng hỏi nhân viên về tiến độ gửi tài liệu cho khách hàng.',
    audioText: 'ミラーさん、もうレポートを送りましたか。いいえ、まだです。これからコピーして送ります。じゃ、急いでくださいね。はい、すぐ送ります。',
    dialogue: [
      { speaker: 'Trưởng phòng', role: 'A', kanji: 'ミラーさん、もうレポートを送りましたか。', kana: 'みらーさん、もうれぽーとをおくりましたか。', vi: 'Anh Miller, anh đã gửi báo cáo chưa?' },
      { speaker: 'Miller', role: 'B', kanji: 'いいえ、まだです。これからコピーして送ります。', kana: 'いいえ、まだです。これからこぴーしておくります。', vi: 'Chưa, tôi vẫn chưa gửi. Bây giờ tôi sẽ đi photo rồi gửi ngay ạ.' },
      { speaker: 'Trưởng phòng', role: 'A', kanji: 'じゃ、急いでくださいね。', kana: 'じゃ、いそいでくださいね。', vi: 'Vậy làm nhanh lên nhé.' },
      { speaker: 'Miller', role: 'B', kanji: 'はい、すぐ送ります。', kana: 'はい、すぐおくります。', vi: 'Vâng, tôi sẽ gửi ngay.' }
    ],
    question: 'Anh Miller sẽ làm việc gì trước tiên?',
    options: [
      { id: 'A', text: 'Đi photocopy tài liệu báo cáo' },
      { id: 'B', text: 'Gửi báo cáo qua bưu điện ngay lập tức' },
      { id: 'C', text: 'Đi ăn trưa với trưởng phòng' },
      { id: 'D', text: 'Gọi điện cho khách hàng xin lỗi' }
    ],
    correctAnswer: 'A',
    explanation: 'Anh Miller trả lời rõ: 「これからコピーして送ります」(Bây giờ tôi sẽ đi photo rồi gửi), nghĩa là hành động photo diễn ra đầu tiên. Đáp án đúng là A.',
    keyword: 'コピーして (photo rồi mới gửi)',
    tip: 'Trong câu hỏi nhiệm vụ Mondai 1, chú ý chuỗi hành động và từ 「これから〜」.',
    level: 'N5'
  },
  {
    lesson: 7,
    partName: 'Phần 3: Mondai 4 - Phản xạ mượn đồ dùng học tập',
    mondaiType: 'mondai4',
    topic: 'Bài 07 - Phần 3: Phản xạ mượn bút kéo',
    situation: 'Bạn học ngồi bàn bên cạnh muốn mượn bạn chiếc kéo.',
    audioText: 'すみません、そのハサミをちょっと貸してください。',
    dialogue: [
      { speaker: 'Bạn học', role: 'A', kanji: 'すみません、そのハサミをちょっと貸してください。', kana: 'すみません、そのはさみをちょっとかしてください。', vi: 'Xin lỗi, cho mình mượn chiếc kéo đó một chút nhé.' }
    ],
    question: 'Hãy chọn câu đáp lại sẵn lòng cho mượn:',
    options: [
      { id: 'A', text: 'はい、どうぞ。' },
      { id: 'B', text: 'どういたしまして。' },
      { id: 'C', text: 'ごめんなさい、もらいました。' },
      { id: 'D', text: 'ありがとうございました。' }
    ],
    correctAnswer: 'A',
    explanation: 'Khi ai đó xin phép mượn đồ 「貸してください」, câu đáp lại lịch sự khi đưa đồ là 「はい、どうぞ」(Vâng, xin mời bạn). Đáp án đúng là A.',
    keyword: 'はい、どうぞ (Vâng xin mời)',
    tip: 'Đưa đồ vật cho ai luôn dùng 「どうぞ」.',
    level: 'N5'
  },
  // Bài 8 - Tính từ & Cảm tưởng
  {
    lesson: 8,
    partName: 'Phần 2: Mondai 1 - Đánh giá chuyến công tác',
    mondaiType: 'mondai1',
    topic: 'Bài 08 - Phần 2: Cảm nhận về thành phố Osaka',
    situation: 'Hai nhân viên nói chuyện sau chuyến công tác tại Osaka.',
    audioText: '山田さん、大阪はどうでしたか。とてもにぎやかでした。食べ物もおいしかったです。天気はどうでしたか。あまりよくなかったです。ずっと雨でした。',
    dialogue: [
      { speaker: 'Đồng nghiệp', role: 'A', kanji: '山田さん、大阪はどうでしたか。', kana: 'やまださん、おおさかはどうでしたか。', vi: 'Chị Yamada, Osaka thế nào?' },
      { speaker: 'Yamada', role: 'B', kanji: 'とてもにぎやかでした。食べ物もおいしかったです。', kana: 'とてもにぎやかでした。たべものもおもしろかったです。', vi: 'Rất náo nhiệt. Đồ ăn cũng rất ngon.' },
      { speaker: 'Đồng nghiệp', role: 'A', kanji: '天気はどうでしたか。', kana: 'てんきはどうでしたか。', vi: 'Thời tiết thế nào?' },
      { speaker: 'Yamada', role: 'B', kanji: 'あまりよくなかったです。ずっと雨でした。', kana: 'あまりよくなかったです。ずっとあめでした。', vi: 'Không được tốt lắm. Suốt cả chuyến đều mưa.' }
    ],
    question: 'Thời tiết ở Osaka trong chuyến đi như thế nào?',
    options: [
      { id: 'A', text: 'Không tốt, trời mưa suốt' },
      { id: 'B', text: 'Rất đẹp và mát mẻ' },
      { id: 'C', text: 'Trời nắng và nóng nực' },
      { id: 'D', text: 'Có tuyết rơi nhiều' }
    ],
    correctAnswer: 'A',
    explanation: 'Chị Yamada nói: 「あまりよくなかったです。ずっと雨でした」(Thời tiết không tốt, mưa suốt). Đáp án đúng là A.',
    keyword: 'あまりよくなかった & ずっと雨',
    tip: 'Phân biệt giữa câu trả lời về thành phố/đồ ăn và câu trả lời riêng về thời tiết.',
    level: 'N5'
  },
  // Bài 9 - Sở thích, Năng lực & Từ chối
  {
    lesson: 9,
    partName: 'Phần 2: Mondai 1 - Lý do từ chối lời mời xem phim',
    mondaiType: 'mondai1',
    topic: 'Bài 09 - Phần 2: Tìm lý do không thể đi chơi',
    situation: 'Anh Tanaka rủ chị Maria đi xem phim vào tối thứ bảy.',
    audioText: 'マリアさん、土曜日の晩、映画を見に行きませんか。映画ですか。いいですね。でも、土曜日は日本語の試験がありますから、勉強しなければなりません。じゃ、日曜日はどうですか。日曜日は大丈夫ですよ。',
    dialogue: [
      { speaker: 'Tanaka', role: 'A', kanji: 'マリアさん、土曜日の晩、映画を見に行きませんか。', kana: 'まりあさん、どようびのばん、えいがをみにいきませんか。', vi: 'Maria, tối thứ bảy cùng đi xem phim không?' },
      { speaker: 'Maria', role: 'B', kanji: '映画ですか。いいですね。でも、土曜日は日本語の試験がありますから、勉強しなければなりません。', kana: 'えいがですか。いいですね。でも、どようびはにほんごのしけんがありますから、べんきょうしなければなりません。', vi: 'Xem phim à? Thích quá. Nhưng thứ bảy tôi có kỳ thi tiếng Nhật nên phải học bài.' },
      { speaker: 'Tanaka', role: 'A', kanji: 'じゃ、日曜日はどうですか。', kana: 'じゃ、にちようびはどうですか。', vi: 'Thế thì chủ nhật thì sao?' },
      { speaker: 'Maria', role: 'B', kanji: '日曜日は大丈夫ですよ。', kana: 'にちようびはだいじょうぶですよ。', vi: 'Chủ nhật thì tôi rảnh được đấy.' }
    ],
    question: 'Tại sao chị Maria không thể đi xem phim vào tối thứ bảy?',
    options: [
      { id: 'A', text: 'Vì phải học bài chuẩn bị cho kỳ thi tiếng Nhật' },
      { id: 'B', text: 'Vì phải đi làm thêm tại nhà hàng' },
      { id: 'C', text: 'Vì không thích xem phim chiếu rạp' },
      { id: 'D', text: 'Vì có hẹn đi ăn với gia đình' }
    ],
    correctAnswer: 'A',
    explanation: 'Chị Maria giải thích: 「土曜日は日本語の試験がありますから、勉強しなければなりません」(Thứ bảy có kỳ thi tiếng Nhật nên phải học). Đáp án đúng là A.',
    keyword: '日本語の試験がありますから (vì có kỳ thi tiếng Nhật)',
    tip: 'Bắt liên từ chỉ lý do 「〜から」 giải thích nguyên nhân từ chối.',
    level: 'N5'
  },
  // Bài 10 - Tồn tại & Vị trí
  {
    lesson: 10,
    partName: 'Phần 2: Mondai 1 - Tìm tài liệu để quên',
    mondaiType: 'mondai1',
    topic: 'Bài 10 - Phần 2: Vị trí cuốn sổ tay trong phòng họp',
    situation: 'Chị Sato gọi điện nhờ đồng nghiệp lấy hộ cuốn sổ tay màu xanh để quên trong phòng họp.',
    audioText: 'すみません、会議室に青い手帳を忘れました。どこにありますか。ええと、大きなテーブルの上にパソコンがありますね。手帳はそのパソコンの下にありますよ。あ、ありました！持って行きますね。',
    dialogue: [
      { speaker: 'Sato', role: 'A', kanji: 'すみません、会議室に青い手帳を忘れました。どこにありますか。', kana: 'すみません、かいぎしつにあおいてちょうをわすれました。どこにありますか。', vi: 'Xin lỗi, tôi để quên cuốn sổ tay màu xanh trong phòng họp. Nó ở đâu vậy?' },
      { speaker: 'Đồng nghiệp', role: 'B', kanji: 'ええと、大きなテーブルの上にパソコンがありますね。手帳はそのパソコンの下にありますよ。', kana: 'ええと、おおきなてーぶるのうえにぱそこんがありますね。てちょうはそのぱそこんのしたにありますよ。', vi: 'Để xem, trên chiếc bàn lớn có chiếc máy tính đúng không. Cuốn sổ tay nằm ở bên dưới chiếc máy tính đó đấy.' },
      { speaker: 'Sato', role: 'A', kanji: 'あ、ありました！持って行きますね。', kana: 'あ、ありました！もっていきますね。', vi: 'A, thấy rồi! Tôi mang ra cho chị nhé.' }
    ],
    question: 'Cuốn sổ tay màu xanh nằm ở vị trí nào?',
    options: [
      { id: 'A', text: 'Ở bên dưới chiếc máy tính trên bàn lớn' },
      { id: 'B', text: 'Ở bên cạnh chiếc máy chiếu trong góc phòng' },
      { id: 'C', text: 'Ở trong ngăn kéo bàn làm việc' },
      { id: 'D', text: 'Ở dưới gầm ghế gần cửa ra vào' }
    ],
    correctAnswer: 'A',
    explanation: 'Đồng nghiệp chỉ rõ: 「手帳はそのパソコンの下にあります」(Cuốn sổ ở bên dưới chiếc máy tính). Đáp án đúng là A.',
    keyword: 'パソコンの下 (bên dưới máy tính)',
    tip: 'Bắt từ chỉ vị trí: 上 (trên), 下 (dưới), 隣 (bên cạnh), 間 (ở giữa).',
    level: 'N5'
  },
  // Bài 14 - Thể Te & Yêu cầu / Đề nghị
  {
    lesson: 14,
    partName: 'Phần 2: Mondai 1 - Nhờ vả trong văn phòng',
    mondaiType: 'mondai1',
    topic: 'Bài 14 - Phần 2: Nhiệm vụ photo tài liệu cuộc họp',
    situation: 'Trưởng nhóm giao việc cho nhân viên mới chuẩn bị cuộc họp lúc 2 giờ.',
    audioText: '木村さん、２時からの会議の準備をお願いします。はい、何をしましょうか。まず、この資料を２０部コピーしてください。それから会議室のエアコンをつけてください。分かりました。すぐやります。',
    dialogue: [
      { speaker: 'Trưởng nhóm', role: 'A', kanji: '木村さん、２時からの会議の準備をお願いします。', kana: 'きむらさん、にじからのかいぎのじゅんびをおねがいします。', vi: 'Kimura, chuẩn bị cho cuộc họp lúc 2 giờ giúp anh nhé.' },
      { speaker: 'Kimura', role: 'B', kanji: 'はい、何をしましょうか。', kana: 'はい、なにをしましょうか。', vi: 'Vâng, em cần làm gì ạ?' },
      { speaker: 'Trưởng nhóm', role: 'A', kanji: 'まず、この資料を２０部コピーしてください。それから会議室のエアコンをつけてください。', kana: 'まず、このしりょうをにじゅうぶこぴーしてください。それからかいぎしつのえあこんをつけてください。', vi: 'Trước tiên hãy photo 20 bản tài liệu này. Sau đó hãy bật điều hòa phòng họp lên nhé.' },
      { speaker: 'Kimura', role: 'B', kanji: '分かりました。すぐやります。', kana: 'わかりました。すぐやります。', vi: 'Em hiểu rồi. Em sẽ làm ngay.' }
    ],
    question: 'Bạn Kimura sẽ làm việc gì trước tiên?',
    options: [
      { id: 'A', text: 'Photocopy 20 bản tài liệu' },
      { id: 'B', text: 'Bật máy điều hòa phòng họp' },
      { id: 'C', text: 'Pha trà mời các thành viên tham gia' },
      { id: 'D', text: 'Kê lại bàn ghế phòng họp' }
    ],
    correctAnswer: 'A',
    explanation: 'Trưởng nhóm dùng từ nối thứ tự: 「まず、この資料を２０部コピーしてください」(Trước hết hãy photo 20 bản tài liệu). Đáp án đúng là A.',
    keyword: 'まず (trước hết) & コピーしてください',
    tip: 'Trong JLPT Mondai 1, từ khóa 「まず」 (trước tiên/đầu tiên) luôn quyết định hành động phải làm trước.',
    level: 'N5'
  },
  // Bài 15 - Xin phép & Cấm đoán
  {
    lesson: 15,
    partName: 'Phần 2: Mondai 1 - Quy định tại phòng trưng bày mỹ thuật',
    mondaiType: 'mondai1',
    topic: 'Bài 15 - Phần 2: Được phép và không được phép làm gì',
    situation: 'Khách tham quan hỏi nhân viên bảo vệ tại viện bảo tàng nghệ thuật Tokyo.',
    audioText: 'すみません、ここで写真を撮ってもいいですか。絵の写真は撮ってはいけません。でも、建物の写真は撮ってもいいですよ。分かりました。フラッシュはどうですか。フラッシュもだめです。',
    dialogue: [
      { speaker: 'Khách', role: 'A', kanji: 'すみません、ここで写真を撮ってもいいですか。', kana: 'すみません、ここでしゃしんをとってもいいですか。', vi: 'Xin lỗi, ở đây tôi có thể chụp ảnh được không?' },
      { speaker: 'Bảo vệ', role: 'B', kanji: '絵の写真は撮ってはいけません。でも、建物の写真は撮ってもいいですよ。', kana: 'えのしゃしんはとってはいけません。でも、たてもののしゃしんはとってもいいですよ。', vi: 'Không được phép chụp ảnh các bức tranh. Nhưng ảnh của tòa nhà thì được phép chụp đấy ạ.' },
      { speaker: 'Khách', role: 'A', kanji: '分かりました。フラッシュはどうですか。', kana: 'わかりました。ふらっしゅはどうですか。', vi: 'Tôi hiểu rồi. Còn đèn flash thì sao ạ?' },
      { speaker: 'Bảo vệ', role: 'B', kanji: 'フラッシュもだめです。', kana: 'ふらっしゅもだめです。', vi: 'Đèn flash cũng không được phép.' }
    ],
    question: 'Khách tham quan được phép chụp ảnh đối tượng nào?',
    options: [
      { id: 'A', text: 'Chỉ được chụp kiến trúc tòa nhà, không dùng đèn flash' },
      { id: 'B', text: 'Được chụp tự do tất cả các bức tranh' },
      { id: 'C', text: 'Được chụp tranh nhưng không bật đèn flash' },
      { id: 'D', text: 'Tuyệt đối cấm chụp bất kỳ thứ gì' }
    ],
    correctAnswer: 'A',
    explanation: 'Bảo vệ nói rõ: 「絵の写真は撮ってはいけません。建物の写真は撮ってもいい」(Cấm chụp tranh, được chụp tòa nhà) và 「フラッシュもだめ」(flash cũng cấm). Đáp án đúng là A.',
    keyword: '建物の写真は撮ってもいい (được chụp tòa nhà)',
    tip: 'Phân biệt rõ cấu trúc 「〜てもいい」 (được phép) và 「〜てはいけません」 (cấm đoán).',
    level: 'N5'
  },
  // Bài 17 - Thể Nai & Nghĩa vụ
  {
    lesson: 17,
    partName: 'Phần 2: Mondai 1 - Bác sĩ dặn dò uống thuốc',
    mondaiType: 'mondai1',
    topic: 'Bài 17 - Phần 2: Hướng dẫn chăm sóc sức khỏe khi bị cảm',
    situation: 'Bác sĩ tại bệnh viện dặn dò bệnh nhân người nước ngoài sau khi khám bệnh.',
    audioText: '風邪ですね。熱がありますから、今日はお風呂に入らないでください。薬は１日３回、ご飯を食べた後で飲んでください。明日会社へ行かなければなりませんか。いいえ、明日は無理をしないで、家で休んでください。',
    dialogue: [
      { speaker: 'Bác sĩ', role: 'A', kanji: '風邪ですね。熱がありますから、今日はお風呂に入らないでください。', kana: 'かぜですね。ねつがありますから、きょうはおふろにはいらないでください。', vi: 'Anh bị cảm rồi. Vì đang sốt nên hôm nay xin đừng tắm bồn nhé.' },
      { speaker: 'Bác sĩ', role: 'A', kanji: '薬は１日３回、ご飯を食べた後で飲んでください。', kana: 'くすりはついたちさんかい、ごはんをたべたあとでのんでください。', vi: 'Thuốc hãy uống 1 ngày 3 lần sau bữa ăn.' },
      { speaker: 'Bệnh nhân', role: 'B', kanji: '明日会社へ行かなければなりませんか。', kana: 'あしたかいしゃへいかなければなりませんか。', vi: 'Ngày mai em có phải đi làm không ạ?' },
      { speaker: 'Bác sĩ', role: 'A', kanji: 'いいえ、明日は無理をしないで、家で休んでください。', kana: 'いいえ、あしたはむりをしないで、いえでやすんでください。', vi: 'Không, ngày mai đừng gắng sức, hãy ở nhà nghỉ ngơi nhé.' }
    ],
    question: 'Bác sĩ dặn bệnh nhân làm điều gì trong ngày hôm nay?',
    options: [
      { id: 'A', text: 'Không được tắm bồn và uống thuốc sau bữa ăn' },
      { id: 'B', text: 'Tắm nước nóng để hạ sốt và đi làm bình thường' },
      { id: 'C', text: 'Uống thuốc trước khi ăn sáng' },
      { id: 'D', text: 'Đến bệnh viện khám lại vào ngày mai' }
    ],
    correctAnswer: 'A',
    explanation: 'Bác sĩ dặn: 「お風呂に入らないでください」(Xin đừng tắm bồn) và 「ご飯を食べた後で飲んでください」(Uống thuốc sau khi ăn). Đáp án đúng là A.',
    keyword: 'お風呂に入らないで & ご飯を食べた後で',
    tip: 'Bắt cấu trúc khuyên bảo phủ định 「〜ないでください」 (xin đừng làm gì).',
    level: 'N5'
  },
  // Bài 18 - Thể Từ điển & Khả năng
  {
    lesson: 18,
    partName: 'Phần 2: Mondai 1 - Phỏng vấn kỹ năng làm việc',
    mondaiType: 'mondai1',
    topic: 'Bài 18 - Phần 2: Xác nhận kỹ năng ứng viên',
    situation: 'Người phỏng vấn hỏi ứng viên về các kỹ năng thực tế.',
    audioText: 'リーさんは車の運転ができますか。はい、できます。パソコンでレポートを作ることができますか。はい、ワードとエクセルを使うことができます。英語はどうですか。簡単な日常会話なら話すことができます。素晴らしいですね。',
    dialogue: [
      { speaker: 'Phỏng vấn', role: 'A', kanji: 'リーさんは車の運転ができますか。', kana: 'りーさんはくるまのうんてんができますか。', vi: 'Anh Lee có thể lái ô tô được không?' },
      { speaker: 'Lee', role: 'B', kanji: 'はい、できます。', kana: 'はい、できます。', vi: 'Vâng, tôi lái được ạ.' },
      { speaker: 'Phỏng vấn', role: 'A', kanji: 'パソコンでレポートを作ることができますか。', kana: 'ぱそこんでれぽーとをつくることができますか。', vi: 'Anh có thể soạn báo cáo bằng máy tính được không?' },
      { speaker: 'Lee', role: 'B', kanji: 'はい、ワードとエクセルを使うことができます。', kana: 'はい、わーどとえくせるをつかうことができます。', vi: 'Vâng, tôi có thể sử dụng Word và Excel.' }
    ],
    question: 'Ứng viên Lee có những kỹ năng nào?',
    options: [
      { id: 'A', text: 'Lái được ô tô và dùng được Word, Excel soạn báo cáo' },
      { id: 'B', text: 'Chỉ biết lái xe ô tô, không biết dùng máy tính' },
      { id: 'C', text: 'Chỉ biết dùng máy tính, không có bằng lái xe' },
      { id: 'D', text: 'Có thể nói thành thạo 5 thứ tiếng nhưng không lái được xe' }
    ],
    correctAnswer: 'A',
    explanation: 'Lee trả lời 「車の運転ができます」(Lái xe được) và 「ワードとエクセルを使うことができます」(Dùng được Word và Excel). Đáp án đúng là A.',
    keyword: '運転ができます & 使うことができます',
    tip: 'Bắt mẫu câu diễn đạt năng lực 「〜ができます」 và 「〜ことができます」.',
    level: 'N5'
  }
];

// Dữ liệu mở rộng cho N4 (Bài 26 đến Bài 35)
const newN4Tracks = [
  // Bài 26 - んです (Giải thích nguyên nhân)
  {
    lesson: 26,
    partName: 'Phần 2: Mondai 1 - Hỏi lý do đi làm muộn',
    mondaiType: 'mondai1',
    topic: 'Bài 26 - Phần 2: Giải thích nguyên nhân trễ giờ',
    situation: 'Trưởng phòng hỏi nhân viên lý do tại sao đến công ty muộn sáng nay.',
    audioText: '鈴木さん、どうして遅刻したんですか。すみません、今朝、中央線で事故があって、電車が止まってしまったんです。そうでしたか。連絡はしましたか。はい、駅から駅員さんに証明書をもらって電話しました。分かりました。気をつけてね。',
    dialogue: [
      { speaker: 'Trưởng phòng', role: 'A', kanji: '鈴木さん、どうして遅刻したんですか。', kana: 'すずきさん、どうしてちこくしたんですか。', vi: 'Suzuki, tại sao cậu lại đi làm muộn thế?' },
      { speaker: 'Suzuki', role: 'B', kanji: 'すみません、今朝、中央線で事故があって、電車が止まってしまったんです。', kana: 'すみません、けさ、ちゅうおうせんでじこがあって、でんしゃがとまってしまったんです。', vi: 'Em xin lỗi, sáng nay có tai nạn trên tuyến Chuo nên tàu điện bị dừng lại ạ.' },
      { speaker: 'Trưởng phòng', role: 'A', kanji: 'そうでしたか。連絡はしましたか。', kana: 'そうでしたか。れんらくはしましたか。', vi: 'Ra là vậy à. Cậu có gọi điện báo không?' },
      { speaker: 'Suzuki', role: 'B', kanji: 'はい、駅から駅員さんに証明書をもらって電話しました。', kana: 'はい、えきからえきいんさんにしょうめいしょをもらってでんわしました。', vi: 'Vâng, em đã xin giấy chứng nhận từ nhân viên ga và gọi điện rồi ạ.' }
    ],
    question: 'Tại sao anh Suzuki lại đi làm muộn sáng nay?',
    options: [
      { id: 'A', text: 'Vì có tai nạn khiến tàu điện tuyến Chuo bị ngừng chạy' },
      { id: 'B', text: 'Vì thức dậy muộn và lỡ chuyến xe bus' },
      { id: 'C', text: 'Vì bị đau đầu phải ghé phòng khám' },
      { id: 'D', text: 'Vì trời mưa to kẹt xe trên đường' }
    ],
    correctAnswer: 'A',
    explanation: 'Anh Suzuki giải thích: 「中央線で事故があって、電車が止まってしまったんです」(Vì có tai nạn trên tuyến Chuo nên tàu điện bị dừng). Đáp án đúng là A.',
    keyword: '電車が止まってしまったんです (tàu điện bị dừng lại)',
    tip: 'Trong JLPT N4, đuôi 「〜んです」 mang sắc thái giải thích lý do, nguồn cơn câu chuyện.',
    level: 'N4'
  },
  {
    lesson: 26,
    partName: 'Phần 3: Mondai 4 - Phản xạ hỏi thăm sắc mặt',
    mondaiType: 'mondai4',
    topic: 'Bài 26 - Phần 3: Phản xạ khi thấy bạn mệt mỏi',
    situation: 'Đồng nghiệp thấy bạn trông xanh xao mệt mỏi liền hỏi thăm.',
    audioText: '顔色が悪いですね。どうしたんですか。',
    dialogue: [
      { speaker: 'Đồng nghiệp', role: 'A', kanji: '顔色が悪いですね。どうしたんですか。', kana: 'かおいろがわるいですね。どうしたんですか。', vi: 'Sắc mặt cậu trông kém quá. Có chuyện gì thế?' }
    ],
    question: 'Hãy chọn câu trả lời tự nhiên nhất:',
    options: [
      { id: 'A', text: '実は昨夜から頭が痛いんです。' },
      { id: 'B', text: 'いいえ、顔を洗いました。' },
      { id: 'C', text: 'はい、元気です。' },
      { id: 'D', text: '赤色が好きです。' }
    ],
    correctAnswer: 'A',
    explanation: 'Khi đối phương hỏi 「どうしたんですか」(Có chuyện gì thế), câu trả lời giãi bày dùng 「実は〜んです」(Thực ra là từ đêm qua tôi bị đau đầu). Đáp án đúng là A.',
    keyword: '実は〜痛いんです (Thực ra là bị đau)',
    tip: 'Cặp từ cảm thán giải thích: 「実は〜んです」.',
    level: 'N4'
  },
  // Bài 27 - Thể khả năng
  {
    lesson: 27,
    partName: 'Phần 2: Mondai 1 - Phòng tân hôn có nhìn thấy núi Phú Sĩ không',
    mondaiType: 'mondai1',
    topic: 'Bài 27 - Phần 2: Chọn phòng khách sạn nhìn ra cảnh đẹp',
    situation: 'Cặp đôi đang ở quầy lễ tân khách sạn Hakone chọn phòng nghỉ.',
    audioText: 'いらっしゃいませ。こちらの部屋からは富士山が見えますよ。でも、海は見えませんね。はい、海が見える部屋はあちらの東側の部屋になります。じゃ、海が見える東側の部屋にしてください。かしこまりました。',
    dialogue: [
      { speaker: 'Lễ tân', role: 'A', kanji: 'いらっしゃいませ。こちらの部屋からは富士山が見えますよ。', kana: 'いらっしゃいませ。こちらのへやからはふじさんがみえますよ。', vi: 'Kính chào quý khách. Từ phòng này có thể ngắm được núi Phú Sĩ đấy ạ.' },
      { speaker: 'Khách', role: 'B', kanji: 'でも、海は見えませんね。', kana: 'でも、うみはみえませんね。', vi: 'Nhưng lại không nhìn thấy biển nhỉ.' },
      { speaker: 'Lễ tân', role: 'A', kanji: 'はい、海が見える部屋はあちらの東側の部屋になります。', kana: 'はい、うみがみえるへやはあちらのひがしがわのへやになります。', vi: 'Vâng, phòng nhìn thấy biển là dãy phòng phía Đông đằng kia ạ.' },
      { speaker: 'Khách', role: 'B', kanji: 'じゃ、海が見える東側の部屋にしてください。', kana: 'じゃ、うみがみえるひがしがわのへやにしてください。', vi: 'Vậy hãy xếp cho chúng tôi phòng phía Đông nhìn ra biển nhé.' }
    ],
    question: 'Khách hàng quyết định chọn phòng nào?',
    options: [
      { id: 'A', text: 'Phòng phía Đông nhìn thấy biển' },
      { id: 'B', text: 'Phòng nhìn ra núi Phú Sĩ' },
      { id: 'C', text: 'Phòng tầng trệt gần nhà hàng' },
      { id: 'D', text: 'Phòng giá rẻ nhất không có cửa sổ' }
    ],
    correctAnswer: 'A',
    explanation: 'Khách hàng chốt: 「海が見える東側の部屋にしてください」(Hãy xếp cho chúng tôi phòng phía Đông nhìn thấy biển). Đáp án đúng là A.',
    keyword: '海が見える東側の部屋 (phòng phía Đông nhìn thấy biển)',
    tip: 'Phân biệt giữa 「見えます」(tự nhiên lọt vào tầm mắt) và 「見られます」(có điều kiện để xem).',
    level: 'N4'
  },
  // Bài 29 - Trạng thái tự động từ が〜ています
  {
    lesson: 29,
    partName: 'Phần 2: Mondai 1 - Phát hiện hỏng hóc trong văn phòng',
    mondaiType: 'mondai1',
    topic: 'Bài 29 - Phần 2: Thiết bị trong phòng họp bị trục trặc',
    situation: 'Hai nhân viên chuẩn bị phòng họp phát hiện máy in có vấn đề.',
    audioText: 'あれ、プリンターの電気が消えていますよ。電源が入っていませんね。コンセントが抜けていますよ。あ、本当ですね。差し込みますね。あ、つきました！よかったです。',
    dialogue: [
      { speaker: 'Nam', role: 'A', kanji: 'あれ、プリンターの電気が消えていますよ。', kana: 'あれ、ぷりんたーのでんきがきえていますよ。', vi: 'Ủa, đèn của máy in bị tắt kìa.' },
      { speaker: 'Nữ', role: 'B', kanji: '電源が入っていませんね。コンセントが抜けていますよ。', kana: 'でんげんがはいっていませんね。こんせんとがぬけていますよ。', vi: 'Nguồn chưa bật nhỉ. Ơ, phích cắm bị tuột ra rồi này.' },
      { speaker: 'Nam', role: 'A', kanji: 'あ、本当ですね。差し込みますね。あ、つきました！よかったです。', kana: 'あ、ほんとうですね。さしこみますね。あ、つきました！よかったです。', vi: 'A, đúng thật. Để tôi cắm vào nhé. A, sáng đèn rồi! Tốt quá.' }
    ],
    question: 'Tại sao máy in lúc đầu không hoạt động?',
    options: [
      { id: 'A', text: 'Vì phích cắm điện bị tuột ra ngoài' },
      { id: 'B', text: 'Vì máy in bị hết giấy và mực' },
      { id: 'C', text: 'Vì máy in bị cháy bóng đèn' },
      { id: 'D', text: 'Vì có người bấm nhầm nút hủy lệnh' }
    ],
    correctAnswer: 'A',
    explanation: 'Nhân viên phát hiện 「コンセントが抜けています」(Phích cắm bị tuột ra). Đáp án đúng là A.',
    keyword: 'コンセントが抜けています (phích cắm bị tuột)',
    tip: 'Chú ý các tự động từ chỉ trạng thái: 壊れています, ついています, 消えています, 抜けています.',
    level: 'N4'
  },
  // Bài 31 - Thể ý chí & Dự định
  {
    lesson: 31,
    partName: 'Phần 2: Mondai 1 - Kế hoạch sau khi tốt nghiệp',
    mondaiType: 'mondai1',
    topic: 'Bài 31 - Phần 2: Dự định tương lai của du học sinh',
    situation: 'Thầy giáo người Nhật hỏi du học sinh về dự định sau khi tốt nghiệp trường tiếng.',
    audioText: 'グエンさん、学校を卒業したらどうするつもりですか。日本の大学に進学しようと思っています。専門は何を勉強したいですか。経済を勉強するつもりです。将来、自分の会社を作りたいですから。頑張ってくださいね。',
    dialogue: [
      { speaker: 'Thầy giáo', role: 'A', kanji: 'グエンさん、学校を卒業したらどうするつもりですか。', kana: 'ぐえんさん、がっこうをそつぎょうしたらどうするつもりですか。', vi: 'Nguyễn, tốt nghiệp xong em dự định làm gì?' },
      { speaker: 'Nguyễn', role: 'B', kanji: '日本の大学に進学しようと思っています。', kana: 'にほんのだいがくにしんがくしようとおもっています。', vi: 'Em định sẽ học lên đại học ở Nhật ạ.' },
      { speaker: 'Thầy giáo', role: 'A', kanji: '専門は何を勉強したいですか。', kana: 'せんもんはなにをべんきょうしたいですか。', vi: 'Em muốn học chuyên ngành gì?' },
      { speaker: 'Nguyễn', role: 'B', kanji: '経済を勉強するつもりです。将来、自分の会社を作りたいですから。', kana: 'けいざいをべんきょうするつもりです。しょうらい、じぶんのかいしゃをつくりたいですから。', vi: 'Em dự định học ngành Kinh tế ạ. Vì tương lai em muốn mở công ty riêng.' }
    ],
    question: 'Bạn Nguyễn dự định học chuyên ngành gì ở đại học?',
    options: [
      { id: 'A', text: 'Chuyên ngành Kinh tế' },
      { id: 'B', text: 'Chuyên ngành Công nghệ thông tin' },
      { id: 'C', text: 'Chuyên ngành Ngôn ngữ Nhật' },
      { id: 'D', text: 'Chuyên ngành Quản trị du lịch' }
    ],
    correctAnswer: 'A',
    explanation: 'Bạn Nguyễn nói: 「経済を勉強するつもりです」(Em dự định học ngành Kinh tế). Đáp án đúng là A.',
    keyword: '経済を勉強するつもり (dự định học Kinh tế)',
    tip: 'Phân biệt giữa quyết định học lên đại học và tên chuyên ngành cụ thể 「経済」.',
    level: 'N4'
  }
];

// Cập nhật N5
let n5List = tracksData.N5.slice();
let n5ExistingIds = new Set(n5List.map(function(t) { return t.id; }));
let maxId = 2000;

for (let i = 0; i < newN5Tracks.length; i++) {
  const item = Object.assign({}, newN5Tracks[i]);
  item.id = maxId++;
  n5List.push(item);
}

// Sắp xếp N5 theo lesson và id
n5List.sort(function (a, b) {
  if (a.lesson !== b.lesson) return a.lesson - b.lesson;
  return a.id - b.id;
});
tracksData.N5 = n5List;

// Cập nhật N4
let n4List = tracksData.N4.slice();
// Cập nhật partName cho các bài gốc N4 nếu chưa có
for (let j = 0; j < n4List.length; j++) {
  if (!n4List[j].partName) {
    n4List[j].partName = 'Phần 1: Hội thoại trọng tâm bài học';
    n4List[j].mondaiType = 'dialogue';
  }
}

for (let k = 0; k < newN4Tracks.length; k++) {
  const item4 = Object.assign({}, newN4Tracks[k]);
  item4.id = maxId++;
  n4List.push(item4);
}

// Sắp xếp N4 theo lesson và id
n4List.sort(function (a, b) {
  if (a.lesson !== b.lesson) return a.lesson - b.lesson;
  return a.id - b.id;
});
tracksData.N4 = n4List;

// Ghi file listeningTracks.js
const outContent = '// Hệ thống dữ liệu Luyện Nghe Choukai Đa Cấp Độ (N5 - N1)\n' +
  '// Bám sát giáo trình chuẩn Minna no Nihongo I & II, Soumatome, Shinkanzen Master & Đề thi JLPT thật\n' +
  '// ZERO ARROWS RULE: Không dùng ký tự mũi tên\n\n' +
  'export const listeningTracksByLevel = ' + JSON.stringify(tracksData, null, 2) + ';\n';

fs.writeFileSync(filePath, outContent, 'utf8');

console.log('SUCCESS! Updated listeningTracks.js');
console.log('New N5 tracks count:', tracksData.N5.length);
console.log('New N4 tracks count:', tracksData.N4.length);
