// Danh sách các bộ chữ Hán dễ gây nhầm lẫn nhất trong các kỳ thi JLPT
// ZERO ARROWS RULE: Tuyệt đối không dùng ký tự mũi tên trong toàn bộ file

export const CONFUSING_KANJI_PAIRS = [
  {
    id: 'mat_vi',
    title: '末 (MẠT) và 未 (VỊ)',
    level: 'N4',
    tip: 'Nét ngang trên: 末 (Mạt - ngọn, cuối) nét trên DÀI hơn nét dưới. 未 (Vị - chưa) nét trên NGẮN hơn nét dưới.',
    items: [
      {
        kanji: '末',
        han_viet: 'MẠT',
        meaning: 'Ngọn, phần cuối, kết thúc',
        keyFeature: 'Nét ngang trên dài hơn nét ngang dưới (như ngọn cây vươn dài)',
        examples: '週末 (shuumatsu - cuối tuần), 年末 (nenmatsu - cuối năm)'
      },
      {
        kanji: '未',
        han_viet: 'VỊ',
        meaning: 'Chưa, chưa từng',
        keyFeature: 'Nét ngang trên ngắn hơn nét ngang dưới (như cành non chưa lớn hết)',
        examples: '未来 (mirai - tương lai), 未定 (mitei - chưa quyết định)'
      }
    ],
    distinctionMemory: 'Cây đã thành ngọn (Mạt 末) thì cành trên dài ra; cây chưa lớn (Vị 未) thì cành trên còn ngắn.'
  },
  {
    id: 'tho_si',
    title: '土 (THỔ) và 士 (SĨ)',
    level: 'N5',
    tip: 'Nét ngang đáy: 土 (Thổ - đất đai) nét đáy DÀI đỡ lấy tất cả. 士 (Sĩ - kẻ sĩ) nét ngang trên DÀI, vai rộng chí lớn.',
    items: [
      {
        kanji: '土',
        han_viet: 'THỔ',
        meaning: 'Đất đai, thổ nhưỡng',
        keyFeature: 'Nét ngang trên ngắn, nét ngang đáy dài vững chãi',
        examples: '土地 (tochi - đất đai), 土曜日 (doyoubi - thứ bảy)'
      },
      {
        kanji: '士',
        han_viet: 'SĨ',
        meaning: 'Kẻ sĩ, người tài giỏi, chiến sĩ',
        keyFeature: 'Nét ngang trên dài rộng, nét ngang đáy ngắn hơn',
        examples: '武士 (bushi - võ sĩ), 弁護士 (bengoshi - luật sư)'
      }
    ],
    distinctionMemory: 'Đất Thổ (土) cần bệ đỡ đáy dài vững; Kẻ Sĩ (士) có bờ vai ngang rộng gánh vác việc lớn.'
  },
  {
    id: 'dai_tri_dac',
    title: '待 (ĐÃI), 持 (TRÌ) và 特 (ĐẶC)',
    level: 'N5',
    tip: 'Khác nhau ở bộ thủ bên trái: 待 có bộ Xích (bước đi), 持 có bộ Thủ (tay cầm), 特 có bộ Ngưu (con bò).',
    items: [
      {
        kanji: '待',
        han_viet: 'ĐÃI',
        meaning: 'Chờ đợi, đối đãi',
        keyFeature: 'Bộ Xích (彳 - bước đi) bên trái: Đứng bước chân đợi chờ',
        examples: '待つ (matsu - chờ đợi), 招待 (shoutai - chiêu đãi)'
      },
      {
        kanji: '持',
        han_viet: 'TRÌ',
        meaning: 'Cầm, nắm, mang theo, duy trì',
        keyFeature: 'Bộ Thủ (扌 - bàn tay) bên trái: Dùng tay cầm đồ vật',
        examples: '持つ (motsu - cầm nắm), 気持ち (kimochi - tâm trạng)'
      },
      {
        kanji: '特',
        han_viet: 'ĐẶC',
        meaning: 'Đặc biệt, riêng biệt',
        keyFeature: 'Bộ Ngưu (牜 - con bò) bên trái: Con bò đặc biệt quý hiếm',
        examples: '特別 (tokubetsu - đặc biệt), 特に (toku ni - đặc biệt là)'
      }
    ],
    distinctionMemory: 'Đi bước chân (彳) đợi Chờ (待); Dùng tay (扌) Cầm nắm (持); Dẫn con bò (牜) Đặc biệt (特).'
  },
  {
    id: 'mai_mai',
    title: '買 (MÃI) và 売 (MẠI)',
    level: 'N5',
    tip: '買 (Mãi - mua) có bộ Bối tiền vỏ sò bên dưới và lưới giỏ bên trên. 売 (Mại - bán) có chữ Sĩ (士) ở trên đầu đem hàng ra chợ.',
    items: [
      {
        kanji: '買',
        han_viet: 'MÃI',
        meaning: 'Mua vào (mãi là mua)',
        keyFeature: 'Bên dưới có chữ Bối (貝 - vỏ sò, tiền tệ), bên trên là cái lưới giữ đồ',
        examples: '買う (kau - mua), 買い物 (kaimono - mua sắm)'
      },
      {
        kanji: '売',
        han_viet: 'MẠI',
        meaning: 'Bán ra (thương mại)',
        keyFeature: 'Bên trên có chữ Sĩ (士) đứng rao bán, bên dưới có chân di chuyển',
        examples: '売る (uru - bán), 売店 (baiten - quầy bán hàng)'
      }
    ],
    distinctionMemory: 'Mãi (買) là mua cất vào giỏ; Mại (売) là mang ra ngoài bán kiếm lời.'
  },
  {
    id: 'dai_thai_khuyen',
    title: '大 (ĐẠI), 太 (THÁI) và 犬 (KHUYỂN)',
    level: 'N5',
    tip: 'Vị trí của dấu chấm: 大 không có chấm. 太 có chấm ở eo/háng. 犬 có chấm ở trên vai.',
    items: [
      {
        kanji: '大',
        han_viet: 'ĐẠI',
        meaning: 'To lớn, rộng lớn',
        keyFeature: 'Người dang rộng hai tay hai chân',
        examples: '大きい (ookii - to lớn), 大学 (daigaku - trường đại học)'
      },
      {
        kanji: '太',
        han_viet: 'THÁI',
        meaning: 'Béo mập, dày cộm, quá mức',
        keyFeature: 'Có dấu chấm ở giữa hai chân (bụng béo tròn)',
        examples: '太い (futoi - béo, to), 太平洋 (taiheiyou - Thái Bình Dương)'
      },
      {
        kanji: '犬',
        han_viet: 'KHUYỂN',
        meaning: 'Con chó',
        keyFeature: 'Có dấu chấm ở góc trên bên phải (tai vểnh hoặc vòng cổ của chú chó)',
        examples: '犬 (inu - con chó), 子犬 (koinu - chó con)'
      }
    ],
    distinctionMemory: 'Dang tay là Đại (大); Bụng có ngấn mỡ là Thái (太); Chó có đốm lông trên vai là Khuyển (犬).'
  },
  {
    id: 'huu_ta',
    title: '右 (HỮU) và 左 (TẢ)',
    level: 'N5',
    tip: 'Phần bên dưới: 右 (Hữu - bên phải) có chữ Khẩu (口 - cái miệng). 左 (Tả - bên trái) có chữ Công (工 - thợ thủ công).',
    items: [
      {
        kanji: '右',
        han_viet: 'HỮU',
        meaning: 'Bên phải',
        keyFeature: 'Bên dưới là chữ Khẩu (口): Tay phải bốc đồ ăn đưa vào miệng',
        examples: '右手 (migite - tay phải), 右側 (migigawa - phía bên phải)'
      },
      {
        kanji: '左',
        han_viet: 'TẢ',
        meaning: 'Bên trái',
        keyFeature: 'Bên dưới là chữ Công (工): Tay trái cầm thước thợ làm công việc',
        examples: '左手 (hidarite - tay trái), 左右 (sayuu - trái phải)'
      }
    ],
    distinctionMemory: 'Tay phải đưa cơm vào Miệng (口) là Hữu 右; Tay trái cầm thước thợ Công (工) là Tả 左.'
  },
  {
    id: 'nhat_bach_muc',
    title: '日 (NHẬT), 白 (BẠCH) và 目 (MỤC)',
    level: 'N5',
    tip: '日 có 1 gạch ngang ở giữa. 白 có thêm 1 phẩy trên đỉnh. 目 có 2 gạch ngang bên trong tạo thành con mắt.',
    items: [
      {
        kanji: '日',
        han_viet: 'NHẬT',
        meaning: 'Mặt trời, ngày',
        keyFeature: 'Một nét ngang ở giữa chia đôi mặt trời',
        examples: '日曜日 (nichiyoubi - chủ nhật), 毎日 (mainichi - mỗi ngày)'
      },
      {
        kanji: '白',
        han_viet: 'BẠCH',
        meaning: 'Màu trắng, sáng rõ',
        keyFeature: 'Có một nét phẩy nhỏ trên đỉnh chữ Nhật',
        examples: '白い (shiroi - màu trắng), 面白い (omoshiroi - thú vị)'
      },
      {
        kanji: '目',
        han_viet: 'MỤC',
        meaning: 'Đôi mắt, mục lục',
        keyFeature: 'Hai nét ngang bên trong biểu thị con ngươi mắt',
        examples: '目 (me - đôi mắt), 目的 (mokuteki - mục đích)'
      }
    ],
    distinctionMemory: 'Mặt trời Nhật 日; Thêm tia nắng trắng trên đầu là Bạch 白; Mở to hai tròng mắt là Mục 目.'
  },
  {
    id: 'nhan_nhap',
    title: '人 (NHÂN) và 入 (NHẬP)',
    level: 'N5',
    tip: 'Nét nào viết trước và cao hơn: 人 có nét phẩy trái cao hơn. 入 có nét mác gập phải cao hơn trùm lên nét phẩy.',
    items: [
      {
        kanji: '人',
        han_viet: 'NHÂN',
        meaning: 'Con người',
        keyFeature: 'Nét phẩy bên trái bắt đầu từ đỉnh cao hơn, nét mác tựa vào lưng',
        examples: '日本人 (nihonjin - người Nhật), 人 (hito - người)'
      },
      {
        kanji: '入',
        han_viet: 'NHẬP',
        meaning: 'Đi vào, cho vào',
        keyFeature: 'Nét gập bên phải bắt đầu từ đỉnh cao hơn, trùm qua nét phẩy ngắn',
        examples: '入る (hairu - đi vào), 入口 (iriguchi - cửa vào)'
      }
    ],
    distinctionMemory: 'Con người (人) tựa lưng vững chãi; Cửa mở bước vào (入) nét phải che chở.'
  }
];
