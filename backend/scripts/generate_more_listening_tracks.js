// Script sinh bổ sung nhiều bài nghe chuẩn JLPT cho từng bài học trong listeningTracks.js
// ZERO ARROWS RULE: Tuyệt đối không dùng ký tự mũi tên trong toàn bộ file

const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../../frontend/src/data/listeningTracks.js');
const rawModule = require(filePath);
const tracksData = rawModule.listeningTracksByLevel;

console.log('Original N5 tracks:', tracksData.N5.length);

// Dữ liệu kịch bản mở rộng cho 25 bài học N5
const n5AdditionalTracks = [
  // Bài 1
  {
    lesson: 1,
    partName: 'Phần 2: Mondai 1 - Xác nhận thông tin bạn học',
    mondaiType: 'mondai1',
    topic: 'Bài 01 - Phần 2: Thủ tục ghi danh ký túc xá',
    situation: 'Thầy quản lý ký túc xá người Nhật đang kiểm tra hồ sơ của một bạn học sinh mới đến.',
    audioText: 'すみません、お名前は？ワンです。ワンさんは会社員ですか。いいえ、学生です。神戸大学の学生です。分かりました。じゃ、学生証を見せてください。はい、どうぞ。',
    dialogue: [
      { speaker: 'Thầy quản lý', role: 'A', kanji: 'すみません、お名前は？', kana: 'すみません、おなまえは？', vi: 'Xin lỗi, tên em là gì?' },
      { speaker: 'Học sinh', role: 'B', kanji: 'ワンです。', kana: 'わんです。', vi: 'Em là Wang ạ.' },
      { speaker: 'Thầy quản lý', role: 'A', kanji: 'ワンさんは会社員ですか。', kana: 'わんさんはかいしゃいんですか。', vi: 'Em là nhân viên công ty phải không?' },
      { speaker: 'Học sinh', role: 'B', kanji: 'いいえ、学生です。神戸大学の学生です。', kana: 'いいえ、がくせいです。こうべだいがくのがくせいです。', vi: 'Dạ không, em là sinh viên đại học Kobe ạ.' },
      { speaker: 'Thầy quản lý', role: 'A', kanji: '分かりました。じゃ、学生証を見せてください。', kana: 'わかりました。じゃ、がくせいしょうをみせてください。', vi: 'Thầy hiểu rồi. Vậy em hãy cho thầy xem thẻ sinh viên nhé.' },
      { speaker: 'Học sinh', role: 'B', kanji: 'はい、どうぞ。', kana: 'はい、どうぞ。', vi: 'Vâng, xin mời thầy.' }
    ],
    question: 'Bạn Wang là sinh viên của trường nào và phải xuất trình giấy tờ gì?',
    options: [
      { id: 'A', text: 'Sinh viên đại học Kobe, xuất trình thẻ sinh viên' },
      { id: 'B', text: 'Nhân viên công ty, xuất trình hộ chiếu' },
      { id: 'C', text: 'Sinh viên đại học Tokyo, xuất trình thẻ cư trú' },
      { id: 'D', text: 'Giáo viên đại học Kobe, xuất trình danh thiếp' }
    ],
    correctAnswer: 'A',
    explanation: 'Bạn Wang trả lời 「神戸大学の学生です」 và thầy quản lý yêu cầu 「学生証を見せてください」. Đáp án đúng là A.',
    keyword: '神戸大学 (Kobe Daigaku) & 学生証 (Gakuseishou)',
    tip: 'Bắt cụm từ chỉ tên trường đại học và từ khóa giấy tờ 「学生証」.',
    level: 'N5'
  },
  {
    lesson: 1,
    partName: 'Phần 3: Mondai 4 - Phản xạ chào hỏi lần đầu',
    mondaiType: 'mondai4',
    topic: 'Bài 01 - Phần 3: Phản xạ chào hỏi lần đầu gặp mặt',
    situation: 'Bạn gặp một đồng nghiệp người Nhật lần đầu tiên tại sảnh công ty.',
    audioText: '初めまして。山田です。どうぞよろしくお願いします。',
    dialogue: [
      { speaker: 'Yamada', role: 'A', kanji: '初めまして。山田です。どうぞよろしくお願いします。', kana: 'はじめまして。やまだです。どうぞよろしくおねがいします。', vi: 'Rất vui được gặp bạn. Tôi là Yamada. Rất mong được giúp đỡ.' }
    ],
    question: 'Hãy chọn câu đáp lại tự nhiên và lịch sự nhất:',
    options: [
      { id: 'A', text: 'こちらこそ、どうぞよろしくお願いします。' },
      { id: 'B', text: 'いいえ、どういたしまして。' },
      { id: 'C', text: 'はい、そうです。' },
      { id: 'D', text: 'さようなら、またあした。' }
    ],
    correctAnswer: 'A',
    explanation: 'Khi đối phương nói 「どうぞよろしくお願いします」, câu đáp lại chuẩn tắc xã giao Nhật Bản là 「こちらこそ、どうぞよろしくお願いします」(Chính tôi mới là người mong được bạn giúp đỡ). Đáp án đúng là A.',
    keyword: 'こちらこそ (chính tôi)',
    tip: 'Đáp lại lời chào lần đầu luôn là cặp mẫu câu 「どうぞよろしく」 đi kèm 「こちらこそ」.',
    level: 'N5'
  },
  // Bài 2
  {
    lesson: 2,
    partName: 'Phần 2: Mondai 1 - Đồ đạc thất lạc',
    mondaiType: 'mondai1',
    topic: 'Bài 02 - Phần 2: Tìm đồ thất lạc trên xe bus',
    situation: 'Hành khách đến quầy tìm đồ thất lạc tại bến xe bus hỏi về cuốn sổ tay.',
    audioText: 'すみません、黒い手帳を忘れました。これですか。いいえ、それは英語の手帳です。私のは日本語の手帳です。あ、こちらですね。はい、それです！ありがとうございます。',
    dialogue: [
      { speaker: 'Hành khách', role: 'A', kanji: 'すみません、黒い手帳を忘れました。', kana: 'すみません、くろいてちょうをわすれました。', vi: 'Xin lỗi, tôi để quên một cuốn sổ tay màu đen.' },
      { speaker: 'Nhân viên', role: 'B', kanji: 'これですか。', kana: 'これですか。', vi: 'Có phải cái này không?' },
      { speaker: 'Hành khách', role: 'A', kanji: 'いいえ、それは英語の手帳です。私のは日本語の手帳です。', kana: 'いいえ、それはえいごのてちょうです。わたしのはにほんごのてちょうです。', vi: 'Không, cái đó là sổ tay tiếng Anh. Của tôi là sổ tay tiếng Nhật cơ ạ.' },
      { speaker: 'Nhân viên', role: 'B', kanji: 'あ、こちらですね。', kana: 'あ、こちらですね。', vi: 'À, là cái này đúng không.' },
      { speaker: 'Hành khách', role: 'A', kanji: 'はい、それです！ありがとうございます。', kana: 'はい、それです！ありがとうございます。', vi: 'Vâng, đúng nó rồi! Cảm ơn anh.' }
    ],
    question: 'Cuốn sổ tay của hành khách là cuốn sổ như thế nào?',
    options: [
      { id: 'A', text: 'Sổ tay màu đen, viết bằng tiếng Nhật' },
      { id: 'B', text: 'Sổ tay màu đỏ, viết bằng tiếng Anh' },
      { id: 'C', text: 'Sổ tay màu trắng, viết bằng tiếng Trung' },
      { id: 'D', text: 'Tạp chí tiếng Anh màu đen' }
    ],
    correctAnswer: 'A',
    explanation: 'Hành khách nói rõ: 「黒い手帳」(sổ tay màu đen) và đính chính 「私のは日本語の手帳です」(của tôi là sổ tiếng Nhật). Đáp án đúng là A.',
    keyword: '黒い手帳 & 日本語の手帳',
    tip: 'Chú ý từ phản bác 「いいえ」 để loại trừ cuốn sổ tiếng Anh đầu tiên được đưa ra.',
    level: 'N5'
  },
  // Bài 3
  {
    lesson: 3,
    partName: 'Phần 2: Mondai 1 - Hỏi đường trong trung tâm thương mại',
    mondaiType: 'mondai1',
    topic: 'Bài 03 - Phần 2: Tìm thang máy và quầy mỹ phẩm',
    situation: 'Khách hàng hỏi nhân viên hướng dẫn tại tầng 1 trung tâm thương mại Mitsukoshi.',
    audioText: 'すみません、化粧品売り場はどこですか。化粧品売り場は１階のあちらです。では、エレベーターはどこですか。エレベーターはあそこの階段の隣にございます。ありがとうございます。',
    dialogue: [
      { speaker: 'Khách hàng', role: 'A', kanji: 'すみません、化粧品売り場はどこですか。', kana: 'すみません、けしょうひんうりばはどこですか。', vi: 'Xin lỗi, quầy mỹ phẩm ở đâu vậy ạ?' },
      { speaker: 'Nhân viên', role: 'B', kanji: '化粧品売り場は１階のあちらです。', kana: 'けしょうひんうりばはいっかいのあちらです。', vi: 'Quầy mỹ phẩm ở đằng kia của tầng 1 ạ.' },
      { speaker: 'Khách hàng', role: 'A', kanji: 'では、エレベーターはどこですか。', kana: 'では、えれべーたーはどこですか。', vi: 'Thế thang máy thì ở đâu ạ?' },
      { speaker: 'Nhân viên', role: 'B', kanji: 'エレベーターはあそこの階段の隣にございます。', kana: 'えれべーたーはあそportionのかいだんのとなりにございます。', vi: 'Thang máy ở bên cạnh cầu thang bộ đằng kia ạ.' }
    ],
    question: 'Thang máy của trung tâm thương mại nằm ở vị trí nào?',
    options: [
      { id: 'A', text: 'Ở bên cạnh cầu thang bộ' },
      { id: 'B', text: 'Ở tầng 3 cạnh nhà vệ sinh' },
      { id: 'C', text: 'Ở ngoài cổng chính tầng hầm' },
      { id: 'D', text: 'Ở đối diện quầy thu ngân' }
    ],
    correctAnswer: 'A',
    explanation: 'Nhân viên trả lời rõ: 「エレベーターはあそこの階段の隣にございます」(Thang máy ở bên cạnh cầu thang bộ đằng kia). Đáp án đúng là A.',
    keyword: '階段の隣 (kaidan no tonari - cạnh cầu thang bộ)',
    tip: 'Phân biệt giữa câu hỏi thứ nhất (quầy mỹ phẩm) và câu hỏi thứ hai (thang máy).',
    level: 'N5'
  },
  // Bài 4
  {
    lesson: 4,
    partName: 'Phần 2: Mondai 2 - Giờ làm việc của ngân hàng',
    mondaiType: 'mondai2',
    topic: 'Bài 04 - Phần 2: Xác nhận giờ mở cửa ngân hàng',
    situation: 'Anh Tanaka gọi điện đến ngân hàng Tokyo-Mitsubishi để hỏi giờ giao dịch.',
    audioText: 'もしもし、そちらの銀行は何時から何時までですか。午前９時から午後３時までです。土曜日も休みですか。はい、土曜日と日曜日は休みです。分かりました。',
    dialogue: [
      { speaker: 'Tanaka', role: 'A', kanji: 'もしもし、そちらの銀行は何時から何時までですか。', kana: 'もしもし、そちらのぎんこうはなんじからなんじまでですか。', vi: 'A lô, ngân hàng bên anh làm việc từ mấy giờ đến mấy giờ ạ?' },
      { speaker: 'Nhân viên', role: 'B', kanji: '午前９時から午後３時までです。', kana: 'ごぜんくじからごごさんじまでです。', vi: 'Dạ từ 9 giờ sáng đến 3 giờ chiều ạ.' },
      { speaker: 'Tanaka', role: 'A', kanji: '土曜日も休みですか。', kana: 'どようびもやすみですか。', vi: 'Thứ bảy cũng nghỉ phải không ạ?' },
      { speaker: 'Nhân viên', role: 'B', kanji: 'はい、土曜日と日曜日は休みです。', kana: 'はい、どようびとにちようびはやすみです。', vi: 'Vâng, thứ bảy và chủ nhật đều nghỉ ạ.' }
    ],
    question: 'Ngân hàng mở cửa làm việc vào những thời gian nào?',
    options: [
      { id: 'A', text: 'Từ thứ hai đến thứ sáu, từ 9:00 sáng đến 15:00 chiều' },
      { id: 'B', text: 'Tất cả các ngày trong tuần từ 8:00 đến 17:00' },
      { id: 'C', text: 'Cả ngày thứ bảy từ 9:00 đến 12:00' },
      { id: 'D', text: 'Từ thứ hai đến thứ bảy, từ 9:00 đến 16:00' }
    ],
    correctAnswer: 'A',
    explanation: 'Giờ làm việc là 「午前９時から午後３時まで」(9h đến 15h) và nghỉ 「土曜日と日曜日」(thứ 7 và CN), tức mở từ thứ hai đến thứ sáu. Đáp án đúng là A.',
    keyword: '午前９時から午後３時まで & 土曜日と日曜日は休み',
    tip: 'Để ý liên từ 「から〜まで」 và xác nhận ngày nghỉ để loại trừ.',
    level: 'N5'
  },
  // Bài 5
  {
    lesson: 5,
    partName: 'Phần 2: Mondai 1 - Lộ trình di chuyển về quê',
    mondaiType: 'mondai1',
    topic: 'Bài 05 - Phần 2: Đi Kyoto bằng phương tiện gì?',
    situation: 'Hai người bạn cùng công ty đang nói chuyện về kế hoạch đi Kyoto cuối tuần.',
    audioText: '佐藤さん、日曜日どこへ行きますか。京都へ行きます。一人で行きますか。いいえ、家族と新幹線で行きます。いいですね。楽しんでください。',
    dialogue: [
      { speaker: 'Bạn', role: 'A', kanji: '佐藤さん、日曜日どこへ行きますか。', kana: 'さとうさん、にちようびどこへいきますか。', vi: 'Chị Sato, chủ nhật chị đi đâu vậy?' },
      { speaker: 'Sato', role: 'B', kanji: '京都へ行きます。', kana: 'きょうとへいきます。', vi: 'Tôi đi Kyoto.' },
      { speaker: 'Bạn', role: 'A', kanji: '一人で行きますか。', kana: 'ひとりでいきますか。', vi: 'Chị đi một mình à?' },
      { speaker: 'Sato', role: 'B', kanji: 'いいえ、家族と新幹線で行きます。', kana: 'いいえ、かぞくとしんかんせんでいきます。', vi: 'Không, tôi đi với gia đình bằng tàu Shinkansen.' }
    ],
    question: 'Chị Sato đi Kyoto với ai và bằng phương tiện gì?',
    options: [
      { id: 'A', text: 'Đi cùng gia đình bằng tàu Shinkansen' },
      { id: 'B', text: 'Đi một mình bằng máy bay' },
      { id: 'C', text: 'Đi cùng bạn học bằng xe bus' },
      { id: 'D', text: 'Đi cùng đồng nghiệp bằng tàu điện thường' }
    ],
    correctAnswer: 'A',
    explanation: 'Chị Sato nói: 「家族と新幹線で行きます」(Đi cùng gia đình bằng tàu Shinkansen). Đáp án đúng là A.',
    keyword: '家族と (cùng gia đình) & 新幹線で (bằng Shinkansen)',
    tip: 'Bắt trợ từ 「と」 (cùng ai) và trợ từ 「で」 (phương tiện di chuyển).',
    level: 'N5'
  }
];

// Nạp các tracks gốc hiện có và bổ sung các tracks mới
let currentN5 = tracksData.N5.slice();

// Cập nhật partName cho các tracks gốc nếu chưa có
for (let i = 0; i < currentN5.length; i++) {
  if (!currentN5[i].partName) {
    currentN5[i].partName = 'Phần 1: Hội thoại tình huống cơ bản';
    currentN5[i].mondaiType = 'dialogue';
  }
}

// Bổ sung các track mới vào đúng bài học
let nextId = 1001;
for (let j = 0; j < n5AdditionalTracks.length; j++) {
  const addTrack = Object.assign({}, n5AdditionalTracks[j]);
  addTrack.id = nextId++;
  currentN5.push(addTrack);
}

// Sắp xếp lại theo lesson tăng dần
currentN5.sort(function (a, b) {
  if (a.lesson !== b.lesson) return a.lesson - b.lesson;
  return a.id - b.id;
});

tracksData.N5 = currentN5;

// Ghi lại vào file listeningTracks.js
const fileContent = '// Hệ thống dữ liệu Luyện Nghe Choukai Đa Cấp Độ (N5 - N1)\n' +
  '// Bám sát giáo trình chuẩn Minna no Nihongo I & II, Soumatome, Shinkanzen Master & Đề thi JLPT thật\n' +
  '// ZERO ARROWS RULE: Không dùng ký tự mũi tên\n\n' +
  'export const listeningTracksByLevel = ' + JSON.stringify(tracksData, null, 2) + ';\n';

fs.writeFileSync(filePath, fileContent, 'utf8');
console.log('Successfully updated listeningTracks.js! New N5 count:', tracksData.N5.length);
