// Dữ liệu Lộ trình luyện nghe Choukai và Cẩm nang phương pháp học chuẩn JLPT
// ZERO ARROWS RULE: Tuyệt đối không dùng ký tự mũi tên trong toàn bộ file

export const LISTENING_ROADMAP_STAGES = [
  {
    stage: 1,
    title: 'Giai đoạn 1: Nền tảng Âm điệu & Biến âm Tokyo',
    enTitle: 'Phonetics, Pitch & Sound Changes',
    desc: 'Luyện tai phân biệt trường âm, âm ngắt, âm đục và ngữ điệu tự nhiên của người bản xứ.',
    focus: 'Trường âm (obasan vs obaasan), Âm ngắt (kite vs kitte), Trợ từ nói nhanh (wa, ga, o, ni).',
    tip: 'Hãy nhắm mắt lại và chỉ tập trung vào cao độ lên xuống của câu nói trước khi cố dịch nghĩa.'
  },
  {
    stage: 2,
    title: 'Giai đoạn 2: Nắm bắt Nhiệm vụ & Hành động (Mondai 1)',
    enTitle: 'Task-Based Comprehension (Mondai 1)',
    desc: 'Bắt trọn câu hỏi trọng tâm: Ai sẽ làm việc gì trước tiên và vào thời điểm nào.',
    focus: 'Các từ chỉ thứ tự hành động: Mazu (trước tiên), Sono mae ni (trước đó), Sorekara (sau đó).',
    tip: 'Đọc lướt 4 đáp án trong 20 giây đầu tiên để dự đoán hành động của nhân vật nam hoặc nữ.'
  },
  {
    stage: 3,
    title: 'Giai đoạn 3: Điểm mấu chốt & Nhận diện Bẫy chuyển ý (Mondai 2)',
    enTitle: 'Key Point & Trap Detection (Mondai 2)',
    desc: 'Bóc tách nguyên nhân, lý do cốt lõi và các bẫy chuyển ý kinh điển trong đề thi JLPT.',
    focus: 'Các từ nối bẫy: Demo (nhưng), Shikashi (tuy nhiên), Jitsu wa (thực ra là), Yappari (rốt cuộc).',
    tip: 'Đáp án đúng thường nằm ngay sau các từ chuyển ý; thông tin trước đó thường chỉ là bẫy mồi.'
  },
  {
    stage: 4,
    title: 'Giai đoạn 4: Phản xạ Nhanh & Luyện Đề Thực Chiến (Mondai 3 & 4)',
    enTitle: 'Quick Response & JLPT Mock Exam',
    desc: 'Luyện phản xạ đáp lại lời nói trong 2 giây và thi thử bộ đề Choukai có tính thời gian.',
    focus: 'Khen ngợi, từ chối khéo léo, nhờ vả lịch sự và các cặp câu đối thoại cửa miệng của người Nhật.',
    tip: 'Không dịch sang tiếng Việt trong đầu; hãy phản xạ trực tiếp bằng cảm giác tình huống.'
  }
];

export const LISTENING_METHODS = [
  {
    id: 'blind_listening',
    name: '1. Nghe bắt ý không nhìn chữ (Blind Listening)',
    desc: 'Nghe lần đầu khi ẩn hoàn toàn kịch bản để ép não bộ hoạt động tối đa nhằm bắt từ khóa và cảm nhận bối cảnh.'
  },
  {
    id: 'trap_hunting',
    name: '2. Kỹ thuật săn bẫy từ chuyển ý (Trap Hunting)',
    desc: 'Chú ý các từ nối như "demo", "shikashi", "chotto...". Khi nhân vật ngập ngừng thì quyết định thật sắp xuất hiện.'
  },
  {
    id: 'shadowing',
    name: '3. Luyện nói đuổi Shadowing từng câu',
    desc: 'Bấm nghe từng câu thoại ngắn và nhắc lại ngay lập tức với cùng tốc độ và cao độ để hình thành phản xạ bản xứ.'
  },
  {
    id: 'dictation',
    name: '4. Nghe chép chính tả (Dictation)',
    desc: 'Tự nhẩm hoặc ghi lại các từ vựng và trợ từ mấu chốt để khắc phục triệt để điểm mù khi nghe nhanh.'
  }
];
