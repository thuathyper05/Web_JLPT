const fs = require('fs');

const path = 'frontend/src/pages/ForumPage.jsx';
let content = fs.readFileSync(path, 'utf8');

const oldBlock = `    {
      id: 'ad_starter',
      sponsorTag: 'TÀI TRỢ CHÍNH THỨC',
      badge: 'ĐÃ ĐƯỢC KIỂM CHỨNG',
      title: 'Học Tiếng Nhật Thông Minh Cùng Trợ Lý AI Sensei & Flashcard 3D',
      desc: 'Trọn bộ 25 bài học Minna no Nihongo, 1.500 từ vựng và Kanji N5 có giọng đọc Tokyo chuẩn cao độ, thuật toán Vườn Cây Bonsai ghi nhớ ngắt quãng SRS.',
      features: ['1.500+ từ vựng & Kanji N5', 'Giọng đọc Tokyo chuẩn 100%', 'Trợ lý AI Sensei 24/7'],
      buttonText: 'Bắt đầu học miễn phí ngay',
      targetTab: 'lessons',
      image: '/hyper_logo.png'
    },`;

const newBlock = `    {
      id: 'ad_starter',
      sponsorTag: 'TÀI TRỢ CHÍNH THỨC',
      badge: 'HỆ SINH THÁI N5 - N1',
      title: 'Chinh Phục Kì Thi JLPT Điểm Tuyệt Đối Cùng HYPER Japanese WebApp',
      desc: 'Trọn bộ 130 bài học, 9.584 từ vựng và 607 Kanji N5 đến N1 có giọng đọc bản xứ Tokyo chuẩn cao độ, Trợ lý AI Sensei giải thích cá nhân hóa và Vườn Cây Bonsai rèn luyện chuỗi ngày học.',
      features: ['130 bài học N5 – N1', '9.584+ từ vựng & Kanji', 'Trợ lý AI Sensei 24/7'],
      buttonText: 'Bắt đầu học ngay hôm nay',
      targetTab: 'lessons',
      image: '/hyper_logo.png'
    },
    {
      id: 'ad_multilevel',
      sponsorTag: 'CÔNG NGHỆ THỜI GIAN THỰC',
      badge: 'CHUYỂN CẤP ĐỘ LINH HOẠT',
      title: 'Linh Hoạt 5 Cấp Độ N5 – N4 – N3 – N2 – N1: Tự Động Đồng Bộ Toàn Bộ Ứng Dụng',
      desc: 'Chỉ cần chọn cấp độ trên thanh điều hướng, toàn bộ Bài học, Flashcard 3D, Chữ Hán Kanji, Ngữ pháp, Trợ từ, Đấu trường Nối từ và Đề thi trắc nghiệm lập tức chuyển đổi tương ứng.',
      features: ['N5 đến N1 chuẩn xác 100%', 'Chuyển cấp độ 1 chạm', 'Lưu tiến độ học độc lập'],
      buttonText: 'Khám phá giáo trình đa cấp độ',
      targetTab: 'lessons',
      image: '/hyper_logo.png'
    },`;

const normContent = content.replace(/\r\n/g, '\n');
const normOld = oldBlock.replace(/\r\n/g, '\n');
const normNew = newBlock.replace(/\r\n/g, '\n');

if (normContent.includes(normOld)) {
  const result = normContent.replace(normOld, normNew);
  fs.writeFileSync(path, result, 'utf8');
  console.log('Successfully updated webappAds in ForumPage.jsx');
} else {
  console.log('Old block not found');
}
