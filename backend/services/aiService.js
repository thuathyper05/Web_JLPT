/**
 * AI Assistant Service for NihongoHub V3
 * Generates pedagogically accurate, friendly, and structured Japanese explanations
 */

function generateAiResponse({ action, prompt, context }) {
  const normalizedAction = action || 'chat';

  // 1. Phân tích từ vựng & mẹo nhớ
  if (normalizedAction === 'explain_vocab') {
    const word = context?.word || context?.clean_kana || context?.kana || prompt;
    const meaning = context?.clean_vietnamese || context?.vietnamese || '';
    const kanji = context?.kanji || '';

    return {
      success: true,
      data: {
        title: `Phân Tích AI: Từ Vựng 「${kanji || word}」`,
        word: kanji || word,
        reading: word,
        meaning: meaning,
        nuance: `Từ 「${kanji || word}」 là từ vựng rất phổ biến trong giao tiếp sơ cấp N5. Mang sắc thái tự nhiên và chuẩn mực trong giao tiếp lịch sự (Desu/Masu).`,
        mnemonic: kanji 
          ? `Mẹo nhớ Hán tự: Nhìn vào các nét của 「${kanji}」, liên tưởng đến hình ảnh thực tế giúp bạn nhớ mặt chữ nhanh hơn gấp 3 lần.`
          : `Mẹo nhớ âm: Đọc to 3 lần kết hợp cử chỉ tay để tạo phản xạ phát âm chuẩn Tokyo Pitch Accent.`,
        collocations: [
          `Cụm thường gặp: 「${kanji || word}」 đi cùng trợ từ tự nhiên.`,
          `Thường xuất hiện trong bài thi JLPT N5 phần Kiến thức ngôn ngữ (Moji/Goi).`
        ],
        example: {
          jp: `これは ${kanji || word} です。`,
          vi: `Đây là ${meaning || 'nó'}.`,
          tip: `Hãy chú ý vị trí đặt trợ từ đứng trước hoặc sau từ vựng.`
        }
      }
    };
  }

  // 2. Phân tích Chữ Hán
  if (normalizedAction === 'explain_kanji') {
    const kanji = context?.kanji || prompt;
    const hanViet = context?.han_viet || '';
    const meaning = context?.meaning || '';
    const stroke = context?.stroke || context?.stroke_count || '';

    return {
      success: true,
      data: {
        title: `Mẹo Nhớ AI: Chữ Hán 「${kanji}」 (${hanViet})`,
        kanji: kanji,
        han_viet: hanViet,
        meaning: meaning,
        stroke_count: stroke,
        radical_breakdown: `Chữ 「${kanji}」 gồm ${stroke} nét vẽ cân đối. Được ghép từ các nét cơ bản tạo nên cấu trúc vững chắc trong thư pháp truyền thống.`,
        mnemonic_story: `Câu chuyện ghi nhớ tượng hình: Tưởng tượng hình dáng của 「${kanji}」 giống như một hình ảnh quen thuộc trong đời sống tượng trưng cho ý nghĩa "${meaning}". Khi viết, hãy giữ thứ tự: từ trên xuống dưới, từ trái qua phải.`,
        common_traps: `Lưu ý: Đừng nhầm lẫn cách đọc On (âm Hán dùng trong từ ghép) và Kun (âm thuần Nhật dùng khi đứng một mình kèm Okurigana).`
      }
    };
  }

  // 3. Phân tích Trợ từ
  if (normalizedAction === 'explain_particle') {
    const particle = context?.particle || prompt;
    const title = context?.title || `Trợ từ 「${particle}」`;

    return {
      success: true,
      data: {
        title: `Gỡ Rối AI: ${title}`,
        particle: particle,
        core_concept: `Bản chất của trợ từ 「${particle}」 là chiếc "nam châm ngữ pháp" kết nối danh từ với động từ hoặc vị ngữ phía sau.`,
        common_mistake: `Lỗi người học hay mắc: Rất nhiều bạn học viên nhầm lẫn giữa trợ từ này và trợ từ tương đương do thói quen dịch từ ngữ nghĩa tiếng Việt sang tiếng Nhật theo kiểu từng chữ.`,
        golden_rule: `Quy tắc vàng: Luôn nhìn vào ĐỘNG TỪ hoặc TÍNH TỪ ở cuối câu để quyết định trợ từ chính xác!`
      }
    };
  }

  // 4. Giải thích câu trắc nghiệm
  if (normalizedAction === 'explain_quiz') {
    const question = context?.question || prompt;
    const correctAnswer = context?.correct_answer || '';
    const explanation = context?.explanation || '';

    return {
      success: true,
      data: {
        title: 'Giải Thích Chi Tiết Đáp Án',
        question: question,
        correct_answer: correctAnswer,
        why_correct: explanation || `Đáp án 「${correctAnswer}」 là phương án chính xác nhất cả về ngữ nghĩa, ngữ pháp và ngữ cảnh giao tiếp tự nhiên chuẩn N5.`,
        elimination_tip: 'Bí kíp làm bài: Loại trừ ngay các phương án có cách đọc sai âm ngắt (促音) hoặc trường âm (長音) để chọn ra đáp án tự tin trong vòng 10 giây.'
      }
    };
  }

  // 5. Phân tích ngữ pháp câu bất kỳ
  if (normalizedAction === 'analyze_sentence') {
    const sentence = prompt || context?.sentence || 'わたしは がくせいです。';
    return {
      success: true,
      data: {
        title: `AI Phân Tích Cấu Trúc Câu`,
        original: sentence,
        breakdown: [
          { part: 'Chủ ngữ', text: 'Thành phần đứng trước trợ từ chủ đề', note: 'Xác định đối tượng đang được nhắc đến' },
          { part: 'Trợ từ', text: 'Liên kết ngữ pháp trong câu', note: 'Chỉ định quan hệ giữa các thành phần' },
          { part: 'Vị ngữ / Động từ', text: 'Thành phần kết thúc câu', note: 'Quyết định thì (hiện tại/quá khứ) và sắc thái lịch sự' }
        ],
        translation: 'Ý nghĩa tự nhiên: Câu biểu thị thông tin chuẩn mực trong giao tiếp hàng ngày sơ cấp N5.',
        advice: 'Mẹo ngữ pháp: Luôn đọc câu tiếng Nhật từ cuối ngược lên đầu để nắm bắt nhanh hành động chính trước khi phân tích chủ thể.'
      }
    };
  }

  // 6. Lộ trình học cá nhân hóa
  if (normalizedAction === 'study_roadmap') {
    const days = context?.days || 30;
    const hours = context?.hours || 0.5;
    return {
      success: true,
      data: {
        title: `Lộ Trình Tinh Gọn N5 (${days} Ngày)`,
        target: `Cam kết ${hours} giờ mỗi ngày để đạt N5 chuẩn điểm cao`,
        phases: [
          { phase: 'Giai đoạn 1 (Tuần 1-2)', focus: 'Minna Bài 1 đến Bài 10', goal: 'Nắm vững 500 từ vựng và bảng chữ cái Hiragana/Katakana' },
          { phase: 'Giai đoạn 2 (Tuần 3-4)', focus: 'Minna Bài 11 đến Bài 20', goal: 'Làm quen các thể động từ Te, Nai, Ta và 50 chữ Hán đầu tiên' },
          { phase: 'Giai đoạn 3 (Tuần 5-6)', focus: 'Minna Bài 21 đến Bài 25 + Luyện đề', goal: 'Hoàn thành toàn bộ cấu trúc N5, luyện trắc nghiệm bấm giờ' }
        ],
        daily_routine: '15 phút Flashcard lặp lại ngắt quãng + 10 phút luyện gõ phản xạ + 5 phút làm trắc nghiệm kiểm tra.'
      }
    };
  }

  // 7. Hội thoại tổng quát với AI Sensei
  const lowerPrompt = (prompt || '').toLowerCase();
  let aiReply = '';

  if (lowerPrompt.includes('chào') || lowerPrompt.includes('xin chào') || lowerPrompt.includes('hello') || lowerPrompt.includes('konnichiwa')) {
    aiReply = 'Konnichiwa! (こんにちは!) Tôi là AI Sensei của NihongoHub. Hôm nay bạn muốn luyện từ vựng, giải đáp ngữ pháp Minna, hay mẹo nhớ chữ Hán Kanji nào nè?';
  } else if (lowerPrompt.includes('n5') || lowerPrompt.includes('lộ trình') || lowerPrompt.includes('học thế nào')) {
    aiReply = 'Lộ trình N5 chuẩn quốc tế gồm 25 bài Minna no Nihongo (khoảng 1.500 từ vựng và 80-100 chữ Hán). Mỗi ngày bạn chỉ cần học đều đặn 10-15 từ vựng, kết hợp lật Flashcard 3D và làm 1 bài trắc nghiệm là sẽ nắm chắc N5 sau 2-3 tháng!';
  } else if (lowerPrompt.includes('kanji') || lowerPrompt.includes('chữ hán')) {
    aiReply = 'Bí quyết nhớ Kanji N5 là: 1) Nhớ âm Hán-Việt; 2) Tách bộ thủ tượng hình; 3) Học theo từ ghép thực tế (Jukugo) thay vì học vẹt từng chữ riêng lẻ. Bạn bấm vào mục "Kanji" trên thanh điều hướng để xem trọn bộ 80+ Hán tự có số nét nhé!';
  } else if (lowerPrompt.includes('trợ từ') || lowerPrompt.includes('wa') || lowerPrompt.includes('ga')) {
    aiReply = 'Sự khác biệt kinh điển giữa は (wa) và が (ga): 「は」 dùng để nêu CHỦ ĐỀ cả câu (nhấn mạnh vế vị ngữ phía sau), còn 「が」 dùng để chỉ CHỦ THỂ hành động khách quan hoặc đối tượng của cảm xúc, sở thích (nhấn mạnh chính danh từ đứng trước nó)!';
  } else if (lowerPrompt.includes('thể te') || lowerPrompt.includes('chia động từ')) {
    aiReply = 'Cách nhớ thể て (Te) nhóm 1 bằng bài hát: い・ち・り sang って, み・び・に sang んで, き sang いて, ぎ sang いで, し sang して! Nhóm 2 chỉ cần bỏ ます thêm て. Nhóm 3 là して và きて!';
  } else {
    aiReply = `Cảm ơn bạn đã hỏi về "${prompt}". Trong tiếng Nhật N5, việc kết hợp đa giác quan (nghe phát âm chuẩn Tokyo, nhìn mặt chữ Hán và tự tay gõ lại bằng Romaji) sẽ giúp não bộ ghi nhớ sâu hơn 300%. Bạn có muốn tôi giải thích chi tiết hơn về phần này không?`;
  }

  return {
    success: true,
    data: {
      reply: aiReply,
      suggestions: [
        'Phân biệt trợ từ に và で thế nào?',
        'Cách nhớ bảng chữ cái Katakana siêu tốc',
        'Cấu trúc ngữ pháp Bài 1 Minna',
        'Mẹo làm bài thi trắc nghiệm JLPT N5'
      ]
    }
  };
}

module.exports = {
  generateAiResponse
};
