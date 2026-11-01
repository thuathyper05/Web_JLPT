// Hệ thống dữ liệu Luyện Nghe Choukai Đa Cấp Độ (N5 - N1)
// Bám sát giáo trình chuẩn Minna no Nihongo I & II, Soumatome, Shinkanzen Master & Đề thi JLPT thật

export const listeningTracksByLevel = {
  "N5": [
    {
      "id": 1,
      "lesson": 1,
      "topic": "Bài 01: Giới thiệu bản thân & Quốc tịch",
      "situation": "Tại văn phòng công ty IMC, anh Mike Miller và chị Sato đang nói chuyện với một người bạn mới là anh Santos.",
      "audioText": "初めまして。マイク・ミラーです。アメリカから来ました。会社員です。どうぞよろしくお願いします。サントスさんも会社員ですか。いいえ、私は学生です。ブラジルから来ました。",
      "dialogue": [
        {
          "speaker": "Mike Miller",
          "role": "A",
          "kanji": "初めまして。マイク・ミラーです。アメリカから来ました。会社員です。どうぞよろしくお願いします。",
          "kana": "はじめまして。まいく・みらーです。あめりかからきました。かいしゃいんです。どうぞよろしくおねがいします。",
          "vi": "Rất vui được gặp bạn. Tôi là Mike Miller, đến từ Mỹ. Tôi là nhân viên công ty. Rất mong được giúp đỡ."
        },
        {
          "speaker": "Mike Miller",
          "role": "A",
          "kanji": "サントスさんも会社員ですか。",
          "kana": "さんとすさんもかいしゃいんですか。",
          "vi": "Anh Santos cũng là nhân viên công ty phải không?"
        },
        {
          "speaker": "Santos",
          "role": "B",
          "kanji": "いいえ、私は学生です。ブラジルから来ました。",
          "kana": "いいえ、わたしはがくせいです。ぶらじるからきました。",
          "vi": "Không, tôi là sinh viên. Tôi đến từ Brazil."
        }
      ],
      "question": "Anh Santos làm nghề gì và đến từ đâu?",
      "options": [
        {
          "id": "A",
          "text": "Nhân viên công ty, đến từ Mỹ"
        },
        {
          "id": "B",
          "text": "Sinh viên, đến từ Brazil"
        },
        {
          "id": "C",
          "text": "Kỹ sư, đến từ Brazil"
        },
        {
          "id": "D",
          "text": "Giáo viên, đến từ Nhật Bản"
        }
      ],
      "correctAnswer": "B",
      "explanation": "Anh Santos trả lời rõ: 「いいえ、私は学生です。ブラジルから来ました」(Không, tôi là sinh viên. Tôi đến từ Brazil). Đáp án đúng là B.",
      "keyword": "学生 (がくせい) & ブラジル",
      "tip": "Chú ý từ phủ định 「いいえ」 để loại trừ nghề nghiệp của người hỏi trước đó.",
      "level": "N5"
    },
    {
      "id": 2,
      "lesson": 2,
      "topic": "Bài 02: Đồ vật xung quanh & Chủ nhân",
      "situation": "Trong lớp học tiếng Nhật, bạn học hỏi chị Sato về chiếc ô và cuốn tạp chí để trên bàn.",
      "audioText": "すみません、それは何ですか。これは自動車の雑誌です。じゃ、あそこにある黒い傘は誰の傘ですか。あれは私の傘です。ありがとうございます。",
      "dialogue": [
        {
          "speaker": "Bạn A",
          "role": "A",
          "kanji": "すみません、それは何ですか。",
          "kana": "すみません、それはなんですか。",
          "vi": "Xin lỗi, đồ vật đó là cái gì vậy?"
        },
        {
          "speaker": "Sato",
          "role": "B",
          "kanji": "これは自動車の雑誌です。",
          "kana": "これはじどうしゃのざっしです。",
          "vi": "Đây là cuốn tạp chí về xe ô tô."
        },
        {
          "speaker": "Bạn A",
          "role": "A",
          "kanji": "じゃ、あそこにある黒い傘は誰の傘ですか。",
          "kana": "じゃ、あそこにあるくろいかさはだれのかさですか。",
          "vi": "Thế chiếc ô màu đen ở đằng kia là của ai vậy?"
        },
        {
          "speaker": "Sato",
          "role": "B",
          "kanji": "あれは私の傘です。",
          "kana": "あれはわたしのかさです。",
          "vi": "Cái đó là chiếc ô của tôi."
        }
      ],
      "question": "Chiếc ô màu đen ở đằng kia là của ai?",
      "options": [
        {
          "id": "A",
          "text": "Của bạn A"
        },
        {
          "id": "B",
          "text": "Của chị Sato"
        },
        {
          "id": "C",
          "text": "Của giáo viên"
        },
        {
          "id": "D",
          "text": "Không ai nhận"
        }
      ],
      "correctAnswer": "B",
      "explanation": "Chị Sato nói: 「あれは私の傘です」(Cái đó là ô của tôi). Đáp án chính xác là B.",
      "keyword": "私の傘 (わたしのかさ)",
      "tip": "Mẫu câu sở hữu danh từ 「〜の傘」 rất hay ra trong kỳ thi Choukai Minna Bài 2.",
      "level": "N5"
    },
    {
      "id": 3,
      "lesson": 3,
      "topic": "Bài 03: Vị trí, Địa điểm & Nơi chốn",
      "situation": "Một vị khách bước vào toà nhà công ty và hỏi nhân viên lễ tân đường đến văn phòng và cầu thang máy.",
      "audioText": "いらっしゃいませ。すみません、事務室はどこですか。事務室はあちらですよ。エレベーターは階段の隣です。どうもありがとうございます。",
      "dialogue": [
        {
          "speaker": "Lễ tân",
          "role": "A",
          "kanji": "いらっしゃいませ。",
          "kana": "いらっしゃいませ。",
          "vi": "Xin kính chào quý khách."
        },
        {
          "speaker": "Khách",
          "role": "B",
          "kanji": "すみません、事務室はどこですか。",
          "kana": "すみません、じむしつはどこですか。",
          "vi": "Xin lỗi, phòng văn phòng nằm ở đâu vậy?"
        },
        {
          "speaker": "Lễ tân",
          "role": "A",
          "kanji": "事務室はあちらですよ。エレベーターは階段の隣です。",
          "kana": "じむしつはあちらですよ。えれべーたーはかいだんのとなりです。",
          "vi": "Văn phòng ở đằng kia nhé ạ. Còn thang máy ở ngay cạnh cầu thang bộ."
        }
      ],
      "question": "Thang máy nằm ở vị trí nào theo lời nhân viên lễ tân?",
      "options": [
        {
          "id": "A",
          "text": "Ở trong văn phòng"
        },
        {
          "id": "B",
          "text": "Ở ngay cạnh cầu thang bộ"
        },
        {
          "id": "C",
          "text": "Ở tầng hầm"
        },
        {
          "id": "D",
          "text": "Ở bên ngoài cổng toà nhà"
        }
      ],
      "correctAnswer": "B",
      "explanation": "Lễ tân hướng dẫn: 「階段の隣です」(Ngay cạnh cầu thang bộ). Đáp án là B.",
      "keyword": "階段の隣 (かいだんのとなり)",
      "tip": "Chú ý từ chỉ vị trí tương đối: 「隣」(bên cạnh), 「前」(phía trước), 「後ろ」(phía sau).",
      "level": "N5"
    },
    {
      "id": 4,
      "lesson": 4,
      "topic": "Bài 04: Thời gian, Giờ giấc & Lịch làm việc",
      "situation": "Khách hàng gọi điện thoại đến ngân hàng Tokyo để hỏi giờ mở cửa và ngày nghỉ trong tuần.",
      "audioText": "もしもし、そちらの銀行は何時から何時までですか。午前9時から午後3時までです。土曜日は休みですか。はい、土曜日と日曜日は休みです。分かりました。",
      "dialogue": [
        {
          "speaker": "Khách hàng",
          "role": "A",
          "kanji": "もしもし、そちらの銀行は何時から何時までですか。",
          "kana": "もしもし、そちらのぎんこうはなんじからなんじまでですか。",
          "vi": "Alo, ngân hàng bên bạn mở cửa từ mấy giờ đến mấy giờ vậy?"
        },
        {
          "speaker": "Nhân viên ngân hàng",
          "role": "B",
          "kanji": "午前9時から午後3時までです。土曜日と日曜日は休みです。",
          "kana": "ごぜんくじからごごさんじまでです。どようびとにちようびはやすみです。",
          "vi": "Dạ mở cửa từ 9 giờ sáng đến 3 giờ chiều ạ. Thứ 7 và chủ nhật bên em nghỉ ạ."
        }
      ],
      "question": "Ngân hàng đóng cửa (nghỉ làm việc) vào những ngày nào?",
      "options": [
        {
          "id": "A",
          "text": "Chỉ nghỉ Chủ Nhật"
        },
        {
          "id": "B",
          "text": "Thứ Bảy và Chủ Nhật"
        },
        {
          "id": "C",
          "text": "Mở cửa cả tuần"
        },
        {
          "id": "D",
          "text": "Nghỉ sau 5 giờ chiều"
        }
      ],
      "correctAnswer": "B",
      "explanation": "Nhân viên trả lời: 「土曜日と日曜日は休みです」(Thứ 7 và chủ nhật nghỉ). Đáp án là B.",
      "keyword": "土曜日と日曜日 (Thứ 7 và Chủ nhật)",
      "tip": "Mẫu câu thời gian 「〜から〜まで」 và danh sách ngày nghỉ với trợ từ 「と」.",
      "level": "N5"
    },
    {
      "id": 5,
      "lesson": 5,
      "topic": "Bài 05: Phương tiện & Đi lại",
      "situation": "Hai người bạn đang trao đổi về kế hoạch đi du lịch Kyoto vào kỳ nghỉ cuối tuần.",
      "audioText": "週末、どこへ行きますか。京都へ行きます。一人で行きますか。いいえ、友達と行きます。新幹線で行きます。とても速いですよ。",
      "dialogue": [
        {
          "speaker": "Bạn A",
          "role": "A",
          "kanji": "週末、どこへ行きますか。一人で行きますか。",
          "kana": "しゅうまつ、どこへいきますか。ひとりでおこないますか。",
          "vi": "Cuối tuần này bạn đi đâu thế? Bạn đi một mình à?"
        },
        {
          "speaker": "Bạn B",
          "role": "B",
          "kanji": "京都へ行きます。いいえ、友達と新幹線で行きます。",
          "kana": "きょうとへいきます。いいえ、ともだちとしんかんせんでいきます。",
          "vi": "Mình đi Kyoto. Không, mình đi cùng bạn bè bằng tàu siêu tốc Shinkansen."
        }
      ],
      "question": "Bạn B đi Kyoto bằng phương tiện gì và đi cùng ai?",
      "options": [
        {
          "id": "A",
          "text": "Đi xe buýt một mình"
        },
        {
          "id": "B",
          "text": "Đi tàu Shinkansen cùng bạn bè"
        },
        {
          "id": "C",
          "text": "Đi máy bay cùng gia đình"
        },
        {
          "id": "D",
          "text": "Đi xe đạp một mình"
        }
      ],
      "correctAnswer": "B",
      "explanation": "Bạn B xác nhận: 「友達と新幹線で行きます」(Đi cùng bạn, đi bằng tàu Shinkansen). Đáp án đúng là B.",
      "keyword": "友達と (Cùng bạn) & 新幹線で (Bằng Shinkansen)",
      "tip": "Trợ từ 「と」 chỉ đối tượng cùng hành động, trợ từ 「で」 chỉ phương tiện di chuyển.",
      "level": "N5"
    },
    {
      "id": 6,
      "lesson": 6,
      "topic": "Bài 06: Mua sắm, Ẩm thực & Địa điểm ăn uống",
      "situation": "Vào giờ nghỉ trưa, hai đồng nghiệp công ty rủ nhau đi ăn trưa và hỏi địa điểm ăn uống.",
      "audioText": "田中さん、昼ごはんを一緒に食べませんか。ええ、食べましょう。どこで食べますか。駅前のレストランで食べましょう。魚料理にします。",
      "dialogue": [
        {
          "speaker": "Đồng nghiệp A",
          "role": "A",
          "kanji": "田中さん、昼ごはんを一緒に食べませんか。",
          "kana": "たなかさん、ひるごはんをいっしょにたべませんか。",
          "vi": "Anh Tanaka, cùng đi ăn cơm trưa với tôi nhé?"
        },
        {
          "speaker": "Tanaka",
          "role": "B",
          "kanji": "ええ、食べましょう。駅前のレストランで魚料理にしましょう。",
          "kana": "ええ、たべましょう。えきまえのれすとらんでさかなりょうりにしましょう。",
          "vi": "Vâng, đi ăn thôi. Hãy ghé nhà hàng trước ga ăn món cá nhé."
        }
      ],
      "question": "Hai đồng nghiệp quyết định sẽ ăn trưa ở đâu?",
      "options": [
        {
          "id": "A",
          "text": "Ở căng tin công ty"
        },
        {
          "id": "B",
          "text": "Ở nhà hàng trước nhà ga"
        },
        {
          "id": "C",
          "text": "Ở cửa hàng tiện lợi"
        },
        {
          "id": "D",
          "text": "Ở nhà riêng anh Tanaka"
        }
      ],
      "correctAnswer": "B",
      "explanation": "Địa điểm được chọn là: 「駅前のレストラン」(Nhà hàng trước ga). Đáp án là B.",
      "keyword": "駅前のレストラン (Nhà hàng trước ga)",
      "tip": "Cấu trúc rủ rê lịch sự 「〜ませんか」 và đồng thuận 「〜ましょう」.",
      "level": "N5"
    },
    {
      "id": 7,
      "lesson": 7,
      "topic": "Bài 07: Tặng quà, Dụng cụ & Công cụ",
      "situation": "Yamada tặng quà sinh nhật cho đồng nghiệp và nói về cách ăn một món bánh đặc biệt.",
      "audioText": "木村さん、お誕生日おめでとうございます。このプレゼントをどうぞ。わあ、素敵なスプーンですね。ありがとうございます。このスプーンでアイスクリームを食べます。",
      "dialogue": [
        {
          "speaker": "Yamada",
          "role": "A",
          "kanji": "木村さん、お誕生日おめでとうございます。このプレゼントをどうぞ。",
          "kana": "きむらさん、おたんじょうびおめでとうございます。このぷれぜんとをどうぞ。",
          "vi": "Chị Kimura, chúc mừng sinh nhật chị. Xin gửi tặng chị món quà này."
        },
        {
          "speaker": "Kimura",
          "role": "B",
          "kanji": "わあ、素敵なスプーンですね。このスプーンでアイスクリームを食べます。",
          "kana": "わあ、すてきなすぷーんですね。このすぷーんであいすくりーむをたべます。",
          "vi": "Oa, một chiếc thìa thật đẹp. Tôi sẽ dùng chiếc thìa này để ăn kem."
        }
      ],
      "question": "Chị Kimura nhận được món quà gì nhân dịp sinh nhật?",
      "options": [
        {
          "id": "A",
          "text": "Một hộp kem socola"
        },
        {
          "id": "B",
          "text": "Một chiếc thìa xinh xắn"
        },
        {
          "id": "C",
          "text": "Một bó hoa tươi"
        },
        {
          "id": "D",
          "text": "Một đôi đũa gỗ"
        }
      ],
      "correctAnswer": "B",
      "explanation": "Món quà được mở ra là: 「素敵なスプーン」(Chiếc thìa xinh xắn). Đáp án đúng là B.",
      "keyword": "スプーン (Chiếc thìa / muỗng)",
      "tip": "Trợ từ 「で」 chỉ công cụ, phương tiện thao tác: 「スプーンで」(bằng thìa).",
      "level": "N5"
    },
    {
      "id": 8,
      "lesson": 8,
      "topic": "Bài 08: Tính từ miêu tả phong cảnh & Trải nghiệm",
      "situation": "Trò chuyện về chuyến đi du lịch núi Phú Sĩ và cảm nhận về cuộc sống tại Tokyo.",
      "audioText": "先週、富士山へ行きました。富士山はどうでしたか。とても高くて、綺麗でした。日本の生活もとても面白いです。",
      "dialogue": [
        {
          "speaker": "Bạn A",
          "role": "A",
          "kanji": "先週、富士山へ行きました。富士山はどうでしたか。",
          "kana": "せんしゅう、ふじさんへいきました。ふじさんはどうでしたか。",
          "vi": "Tuần trước mình đã đi núi Phú Sĩ. Núi Phú Sĩ thế nào?"
        },
        {
          "speaker": "Bạn B",
          "role": "B",
          "kanji": "とても高くて、綺麗でした。日本の生活もとても面白いです。",
          "kana": "とてもたかくて、きれいでした。にほんのせいかつもとてもおもしろいです。",
          "vi": "Núi rất cao và đẹp. Cuộc sống ở Nhật Bản cũng rất thú vị."
        }
      ],
      "question": "Người nói có cảm nhận như thế nào về núi Phú Sĩ?",
      "options": [
        {
          "id": "A",
          "text": "Núi thấp và không đẹp"
        },
        {
          "id": "B",
          "text": "Rất cao và rất đẹp"
        },
        {
          "id": "C",
          "text": "Thời tiết lạnh và buồn chán"
        },
        {
          "id": "D",
          "text": "Đông đúc và nguy hiểm"
        }
      ],
      "correctAnswer": "B",
      "explanation": "Người nói miêu tả rõ: 「とても高くて、綺麗でした」(Rất cao và đẹp). Đáp án là B.",
      "keyword": "高くて、綺麗でした (Cao và đẹp)",
      "tip": "Mẫu câu hỏi cảm nhận trong quá khứ 「〜はどうでしたか」.",
      "level": "N5"
    },
    {
      "id": 9,
      "lesson": 9,
      "topic": "Bài 09: Sở thích, Năng lực & Mức độ hiểu biết",
      "situation": "Trao đổi về khả năng chơi thể thao và sở thích nghe nhạc Nhật Bản.",
      "audioText": "マイクさん、スポーツが好きですか。はい、サッカーが大好きです。ピアノも弾くことができますか。いいえ、ピアノは全然できません。",
      "dialogue": [
        {
          "speaker": "Bạn A",
          "role": "A",
          "kanji": "マイクさん、スポーツが好きですか。ピアノも弾けますか。",
          "kana": "まいくさん、すぽーつがすきですか。ぴあのもひけますか。",
          "vi": "Anh Mike, anh có thích thể thao không? Anh có chơi được piano không?"
        },
        {
          "speaker": "Mike",
          "role": "B",
          "kanji": "サッカーが大好きです。でも、ピアノは全然できません。",
          "kana": "さっかーがだいすきです。でも、ぴあのはぜんぜんできません。",
          "vi": "Tôi rất thích đá bóng. Nhưng piano thì tôi hoàn toàn không biết chơi."
        }
      ],
      "question": "Anh Mike có khả năng và sở thích gì?",
      "options": [
        {
          "id": "A",
          "text": "Chơi đàn piano rất giỏi"
        },
        {
          "id": "B",
          "text": "Rất thích đá bóng, không biết chơi piano"
        },
        {
          "id": "C",
          "text": "Không thích thể thao"
        },
        {
          "id": "D",
          "text": "Chơi giỏi cả bóng đá và piano"
        }
      ],
      "correctAnswer": "B",
      "explanation": "Mike trả lời: 「サッカーが大好きです。でも、ピアノは全然できません」(Rất thích bóng đá, hoàn toàn không biết chơi piano). Đáp án là B.",
      "keyword": "サッカーが大好き & 全然できません",
      "tip": "Từ phủ định triệt để 「全然〜ません」(hoàn toàn không).",
      "level": "N5"
    },
    {
      "id": 10,
      "lesson": 10,
      "topic": "Bài 10: Tồn tại Người & Đồ vật (Arimasu / Imasu)",
      "situation": "Tìm đồ dùng học tập và hỏi thăm vị trí của đồng nghiệp trong văn phòng.",
      "audioText": "すみません、私のハサミはどこですか。机の上にペンとノートがあります。ハサミはその箱の中にありますよ。佐藤さんは会議室にいます。",
      "dialogue": [
        {
          "speaker": "Nhân viên A",
          "role": "A",
          "kanji": "すみません、私のハサミはどこですか。",
          "kana": "すみません、わたしのはさみはどこですか。",
          "vi": "Xin lỗi, chiếc kéo của tôi ở đâu vậy?"
        },
        {
          "speaker": "Nhân viên B",
          "role": "B",
          "kanji": "ハサミはその青い箱の中にありますよ。",
          "kana": "はさみはそのあおいはこのなかにありますよ。",
          "vi": "Cây kéo nằm ở bên trong chiếc hộp màu xanh kia kìa."
        }
      ],
      "question": "Cây kéo (ハサミ) đang ở vị trí nào?",
      "options": [
        {
          "id": "A",
          "text": "Ở trên mặt bàn"
        },
        {
          "id": "B",
          "text": "Ở trong chiếc hộp màu xanh"
        },
        {
          "id": "C",
          "text": "Ở phòng họp"
        },
        {
          "id": "D",
          "text": "Ở trong ngăn kéo"
        }
      ],
      "correctAnswer": "B",
      "explanation": "Nhân viên B chỉ rõ: 「箱の中にあります」(Ở trong hộp). Đáp án là B.",
      "keyword": "箱の中にあります (Trong hộp)",
      "tip": "Phân biệt: Đồ vật dùng 「あります」, người và động vật dùng 「います」.",
      "level": "N5"
    },
    {
      "id": 11,
      "lesson": 11,
      "topic": "Bài 11: Số lượng, Thời lượng & Giá cả",
      "situation": "Mua hoa quả tại siêu thị và hỏi thời gian di chuyển bằng xe buýt.",
      "audioText": "いらっしゃいませ。りんごを3つと、みかんを5つください。全部で800円です。駅までバスでどのくらいかかりますか。20分くらいかかりますよ。",
      "dialogue": [
        {
          "speaker": "Khách",
          "role": "A",
          "kanji": "りんごを3つと、みかんを5つください。",
          "kana": "りんごをみっつと、みかんをいつつください。",
          "vi": "Cho tôi 3 quả táo và 5 quả quýt."
        },
        {
          "speaker": "Thu ngân",
          "role": "B",
          "kanji": "全部で800円です。駅まではバスで20分かかります。",
          "kana": "ぜんぶではっぴゃくえんです。えきまではばすでにじっぷんかかります。",
          "vi": "Tổng cộng là 800 yên. Đến nhà ga thì đi xe buýt mất khoảng 20 phút."
        }
      ],
      "question": "Khách hàng đã mua tổng cộng bao nhiêu quả táo và quýt?",
      "options": [
        {
          "id": "A",
          "text": "3 quả táo và 5 quả quýt"
        },
        {
          "id": "B",
          "text": "5 quả táo và 3 quả quýt"
        },
        {
          "id": "C",
          "text": "8 quả táo"
        },
        {
          "id": "D",
          "text": "2 quả quýt"
        }
      ],
      "correctAnswer": "A",
      "explanation": "Khách gọi: 「りんごを3つ (3 quả táo)」 và 「みかんを5つ (5 quả quýt)」. Đáp án đúng là A.",
      "keyword": "りんごを3つ & みかんを5つ",
      "tip": "Học kỹ cách đếm đồ vật thuần Nhật: ひとつ, ふたつ, みっつ, よっつ, いつつ.",
      "level": "N5"
    },
    {
      "id": 12,
      "lesson": 12,
      "topic": "Bài 12: So sánh hơn & So sánh nhất",
      "situation": "So sánh thời tiết và các mùa trong năm tại Nhật Bản.",
      "audioText": "日本は夏と冬と、どちらが寒いですか。冬のほうがずっと寒いです。1年の中でいつが一番好きですか。春が一番好きです。桜が綺麗ですから。",
      "dialogue": [
        {
          "speaker": "Bạn A",
          "role": "A",
          "kanji": "1年の中で、どの季節が一番好きですか。",
          "kana": "いちねんのなかで、どのきせつがいちばんすきですか。",
          "vi": "Trong 1 năm, bạn thích nhất mùa nào?"
        },
        {
          "speaker": "Bạn B",
          "role": "B",
          "kanji": "春が一番好きです。桜がとても綺麗ですから。",
          "kana": "はるがいちばんすきです。さくらがとてもきれいですから。",
          "vi": "Mình thích mùa xuân nhất. Vì hoa anh đào rất đẹp."
        }
      ],
      "question": "Bạn B thích nhất mùa nào trong năm và vì lý do gì?",
      "options": [
        {
          "id": "A",
          "text": "Mùa đông vì có tuyết rơi"
        },
        {
          "id": "B",
          "text": "Mùa xuân vì hoa anh đào đẹp"
        },
        {
          "id": "C",
          "text": "Mùa hè vì được đi biển"
        },
        {
          "id": "D",
          "text": "Mùa thu vì lá đỏ"
        }
      ],
      "correctAnswer": "B",
      "explanation": "Bạn B nói: 「春が一番好きです。桜がとても綺麗ですから」(Thích mùa xuân nhất vì hoa anh đào đẹp). Đáp án là B.",
      "keyword": "春が一番好き (Thích mùa xuân nhất)",
      "tip": "Mẫu câu so sánh nhất: 「〜の中で〜が一番好きです」.",
      "level": "N5"
    },
    {
      "id": 13,
      "lesson": 13,
      "topic": "Bài 13: Mong muốn (Tai / Hoshii) & Mục đích di chuyển",
      "situation": "Trời mùa hè nóng bức, hai người rủ nhau đi mua đồ uống giải khát.",
      "audioText": "ああ、暑いですね。冷たいお茶が飲みたいです。駅の近くのカフェへアイスコーヒーを飲みに行きませんか。いいですね、行きましょう。",
      "dialogue": [
        {
          "speaker": "Bạn A",
          "role": "A",
          "kanji": "ああ、暑いですね。冷たいジュースが飲みたいです。",
          "kana": "ああ、あついですね。つめたいじゅーすがのみたいです。",
          "vi": "A, nóng quá nhỉ. Tôi muốn uống nước hoa quả lạnh."
        },
        {
          "speaker": "Bạn B",
          "role": "B",
          "kanji": "近くのカフェへ冷たいものを飲みに行きませんか。",
          "kana": "ちかくのかふぇへつめたいものをのみにいきませんか。",
          "vi": "Chúng ta cùng đến quán cà phê gần đây uống đồ lạnh nhé?"
        }
      ],
      "question": "Hai bạn chuẩn bị đi đến quán cà phê để làm gì?",
      "options": [
        {
          "id": "A",
          "text": "Đi ăn bánh mì"
        },
        {
          "id": "B",
          "text": "Đi uống đồ uống lạnh giải khát"
        },
        {
          "id": "C",
          "text": "Đi gặp khách hàng"
        },
        {
          "id": "D",
          "text": "Đi đọc sách"
        }
      ],
      "correctAnswer": "B",
      "explanation": "Mục đích là: 「飲みに行きます」(Đi để uống đồ lạnh). Đáp án là B.",
      "keyword": "飲みたい (Muốn uống) & 飲みに行きます (Đi để uống)",
      "tip": "Mẫu ngữ pháp mục đích di chuyển: Động từ thể Masu bỏ Masu + 「に行きます」.",
      "level": "N5"
    },
    {
      "id": 14,
      "lesson": 14,
      "topic": "Bài 14: Thể Te - Nhờ vả & Đề nghị giúp đỡ",
      "situation": "Trong phòng học, trời mưa to và gió thổi mạnh.",
      "audioText": "雨が降ってきましたね。すみませんが、窓を閉めてください。はい、分かりました。荷物を持ちましょうか。ありがとうございます。助かります。",
      "dialogue": [
        {
          "speaker": "Chị Mai",
          "role": "A",
          "kanji": "雨が降ってきましたね。すみませんが、窓を閉めてください。",
          "kana": "あめがふってきましたね。すみませんが、まどをしめてください。",
          "vi": "Trời đổ mưa rồi nhỉ. Làm ơn đóng cửa sổ giúp tôi với."
        },
        {
          "speaker": "Anh Nam",
          "role": "B",
          "kanji": "はい、閉めます。荷物を持ちましょうか。",
          "kana": "はい、しめます。にもつをもちましょうか。",
          "vi": "Vâng, tôi đóng ngay. Để tôi xách hành lý giúp bạn nhé?"
        }
      ],
      "question": "Chị Mai đã nhờ anh Nam làm hành động gì?",
      "options": [
        {
          "id": "A",
          "text": "Mở cửa phòng"
        },
        {
          "id": "B",
          "text": "Đóng cửa sổ"
        },
        {
          "id": "C",
          "text": "Mua ô che mưa"
        },
        {
          "id": "D",
          "text": "Gọi xe taxi"
        }
      ],
      "correctAnswer": "B",
      "explanation": "Chị Mai nhờ: 「窓を閉めてください」(Hãy đóng cửa sổ giúp tôi). Đáp án là B.",
      "keyword": "窓を閉めてください (Hãy đóng cửa sổ)",
      "tip": "Mẫu câu thể Te nhờ vả lịch sự: 「〜てください」.",
      "level": "N5"
    },
    {
      "id": 15,
      "lesson": 15,
      "topic": "Bài 15: Thể Te - Xin phép (Te mo ii desu) & Cấm đoán",
      "situation": "Vị khách tham quan bảo tàng mỹ thuật hỏi về quy định chụp ảnh.",
      "audioText": "すみません、ここで写真を撮ってもいいですか。いいえ、写真を撮ってはいけません。美術館の中ですから。分かりました。気をつけます。",
      "dialogue": [
        {
          "speaker": "Khách",
          "role": "A",
          "kanji": "すみません、ここで写真を撮ってもいいですか。",
          "kana": "すみません、ここでしゃしんをとってもいいですか。",
          "vi": "Xin lỗi, tôi có thể chụp ảnh ở đây được không?"
        },
        {
          "speaker": "Bảo vệ",
          "role": "B",
          "kanji": "いいえ、ここでは写真を撮ってはいけません。",
          "kana": "いいえ、ここではしゃしんをとってはいけません。",
          "vi": "Không được, ở đây cấm chụp ảnh nhé quý khách."
        }
      ],
      "question": "Khách tham quan có được phép chụp ảnh không?",
      "options": [
        {
          "id": "A",
          "text": "Được chụp ảnh thoải mái"
        },
        {
          "id": "B",
          "text": "Tuyệt đối cấm chụp ảnh"
        },
        {
          "id": "C",
          "text": "Được chụp nếu trả thêm phí"
        },
        {
          "id": "D",
          "text": "Chỉ được chụp bên ngoài"
        }
      ],
      "correctAnswer": "B",
      "explanation": "Bảo vệ thông báo cấm đoán: 「写真を撮ってはいけません」(Cấm chụp ảnh). Đáp án là B.",
      "keyword": "撮ってはいけません (Cấm chụp ảnh)",
      "tip": "Mẫu cấm đoán: 「〜てはいけません」 (Không được phép làm gì).",
      "level": "N5"
    },
    {
      "id": 16,
      "lesson": 16,
      "topic": "Bài 16: Thể Te - Nối hành động tuần tự (Te kara)",
      "situation": "Hỏi về thói quen sinh hoạt buổi sáng trước khi đi làm.",
      "audioText": "毎朝、起きてから何をしますか。ジョギングをして、シャワーを浴びて、それから朝ごはんを食べます。忙しいですね。",
      "dialogue": [
        {
          "speaker": "Bạn A",
          "role": "A",
          "kanji": "毎朝、起きてから何をしますか。",
          "kana": "まいあさ、おきてからなにをしますか。",
          "vi": "Mỗi sáng, sau khi thức dậy bạn làm gì?"
        },
        {
          "speaker": "Bạn B",
          "role": "B",
          "kanji": "ジョギングをして、シャワーを浴びて、朝ごはんを食べます。",
          "kana": "じょぎんぐをして、しゃわーをあびて、あさごはんをたべます。",
          "vi": "Tôi chạy bộ, tắm vòi sen, rồi sau đó ăn sáng."
        }
      ],
      "question": "Hành động đầu tiên bạn B làm sau khi thức dậy là gì?",
      "options": [
        {
          "id": "A",
          "text": "Ăn bữa sáng"
        },
        {
          "id": "B",
          "text": "Chạy bộ thể dục (Jogging)"
        },
        {
          "id": "C",
          "text": "Đọc báo"
        },
        {
          "id": "D",
          "text": "Uống cà phê"
        }
      ],
      "correctAnswer": "B",
      "explanation": "Thứ tự hành động: 「ジョギングをして」(Chạy bộ trước tiên). Đáp án đúng là B.",
      "keyword": "ジョギングをして (Chạy bộ)",
      "tip": "Mẫu nối chuỗi hành động theo trình tự thời gian bằng thể Te: V1-te, V2-te, V3-masu.",
      "level": "N5"
    },
    {
      "id": 17,
      "lesson": 17,
      "topic": "Bài 17: Thể Nai - Yêu cầu không làm gì (Naide kudasai)",
      "situation": "Bác sĩ căn dặn bệnh nhân bị cảm sốt tại phòng khám Tokyo.",
      "audioText": "熱がありますね。今日はお風呂に入らないでください。薬を飲んで、早く寝てください。お酒も飲んではいけませんよ。はい、分かりました。",
      "dialogue": [
        {
          "speaker": "Bác sĩ",
          "role": "A",
          "kanji": "熱がありますね。今日はお風呂に入らないでください。",
          "kana": "ねつがありますね。きょうはおふろにはいらないでください。",
          "vi": "Bạn đang bị sốt đấy. Hôm nay xin đừng tắm bồn nhé."
        },
        {
          "speaker": "Bác sĩ",
          "role": "A",
          "kanji": "薬を飲んで、早く寝てください。",
          "kana": "くすりをのんで、はやくねてください。",
          "vi": "Hãy uống thuốc và đi ngủ sớm."
        }
      ],
      "question": "Bác sĩ đã khuyên bệnh nhân hôm nay KHÔNG NÊN làm việc gì?",
      "options": [
        {
          "id": "A",
          "text": "Không được uống thuốc"
        },
        {
          "id": "B",
          "text": "Không được tắm bồn"
        },
        {
          "id": "C",
          "text": "Không được ngủ sớm"
        },
        {
          "id": "D",
          "text": "Không được ăn cháo"
        }
      ],
      "correctAnswer": "B",
      "explanation": "Bác sĩ yêu cầu: 「お風呂に入らないでください」(Xin đừng tắm bồn). Đáp án là B.",
      "keyword": "入らないでください (Xin đừng tắm)",
      "tip": "Mẫu phủ định lịch sự: Động từ thể Nai + 「でください」.",
      "level": "N5"
    },
    {
      "id": 18,
      "lesson": 18,
      "topic": "Bài 18: Thể Từ điển - Năng lực & Sở thích (Koto ga dekimasu)",
      "situation": "Phỏng vấn tuyển dụng hỏi về khả năng ngoại ngữ và lái xe.",
      "audioText": "車の運転ができますか。はい、運転することができます。英語を話すこともできます。パソコンの操作はどうですか。得意ですよ。",
      "dialogue": [
        {
          "speaker": "Người phỏng vấn",
          "role": "A",
          "kanji": "車の運転ができますか。",
          "kana": "くるまのうんてんができますか。",
          "vi": "Bạn có biết lái xe ô tô không?"
        },
        {
          "speaker": "Ứng viên",
          "role": "B",
          "kanji": "はい、運転することができます。英語も話せます。",
          "kana": "はい、うんてんすることができます。えいごもはなせます。",
          "vi": "Vâng, tôi có thể lái xe ô tô. Tôi cũng nói được tiếng Anh."
        }
      ],
      "question": "Ứng viên có những kỹ năng nào sau đây?",
      "options": [
        {
          "id": "A",
          "text": "Không biết lái xe ô tô"
        },
        {
          "id": "B",
          "text": "Lái được xe ô tô và nói được tiếng Anh"
        },
        {
          "id": "C",
          "text": "Chỉ biết nấu ăn"
        },
        {
          "id": "D",
          "text": "Không biết dùng máy tính"
        }
      ],
      "correctAnswer": "B",
      "explanation": "Ứng viên khẳng định: 「運転することができます。英語も話せます」. Đáp án đúng là B.",
      "keyword": "運転することができます (Có thể lái xe)",
      "tip": "Mẫu biểu thị năng lực: Động từ thể Từ điển (Jishokei) + 「ことができます」.",
      "level": "N5"
    },
    {
      "id": 19,
      "lesson": 19,
      "topic": "Bài 19: Thể Ta - Trải nghiệm quá khứ (Koto ga arimasu)",
      "situation": "Hai người bạn trò chuyện về các trải nghiệm du lịch tại Nhật.",
      "audioText": "日本で温泉に入ったことがありますか。はい、一度だけ入ったことがあります。とても気持ちが良かったですよ。富士山にも登りましたか。いいえ、まだです。",
      "dialogue": [
        {
          "speaker": "Bạn A",
          "role": "A",
          "kanji": "日本で温泉に入ったことがありますか。",
          "kana": "にほんでおんせんにはいったことがありますか。",
          "vi": "Bạn đã từng tắm suối nước nóng (Onsen) ở Nhật chưa?"
        },
        {
          "speaker": "Bạn B",
          "role": "B",
          "kanji": "はい、一度だけ入ったことがあります。とても良かったです。",
          "kana": "はい、いちどだけはいったことがあります。とてもよかったです。",
          "vi": "Vâng, tôi đã từng tắm một lần rồi. Rất là sảng khoái."
        }
      ],
      "question": "Bạn B đã từng có trải nghiệm nào trong quá khứ?",
      "options": [
        {
          "id": "A",
          "text": "Chưa từng tắm Onsen bao giờ"
        },
        {
          "id": "B",
          "text": "Đã từng tắm suối nước nóng Onsen một lần"
        },
        {
          "id": "C",
          "text": "Đã leo lên đỉnh núi Phú Sĩ 2 lần"
        },
        {
          "id": "D",
          "text": "Tắm Onsen mỗi tuần"
        }
      ],
      "correctAnswer": "B",
      "explanation": "Bạn B xác nhận: 「一度だけ入ったことがあります」(Từng tắm một lần). Đáp án là B.",
      "keyword": "入ったことがあります (Đã từng tắm)",
      "tip": "Mẫu trải nghiệm trong đời: Động từ thể Ta + 「ことがあります」.",
      "level": "N5"
    },
    {
      "id": 20,
      "lesson": 20,
      "topic": "Bài 20: Thể Thông thường - Giao tiếp thân mật (Futsuukei)",
      "situation": "Hai người bạn thân cùng trường đại học trò chuyện thân mật rủ nhau đi chơi.",
      "audioText": "明日、暇？うん、暇だよ。どこかへ行く？映画を見に行かない？いいね、何時に会う？10時はどう？分かった、じゃ10時に駅でね！",
      "dialogue": [
        {
          "speaker": "Ken",
          "role": "A",
          "kanji": "明日、暇？映画を見に行かない？",
          "kana": "あした、ひま？えいがをみにいかない？",
          "vi": "Mai rảnh không? Đi xem phim không?"
        },
        {
          "speaker": "Yuki",
          "role": "B",
          "kanji": "うん、いいね！10時に駅で会おう。",
          "kana": "うん、いいね！じゅうじにえきであおう。",
          "vi": "Ừ, được đó! Hẹn gặp lúc 10 giờ ở ga nhé."
        }
      ],
      "question": "Hai bạn đã thống nhất hẹn nhau ở đâu và lúc mấy giờ?",
      "options": [
        {
          "id": "A",
          "text": "9 giờ ở rạp chiếu phim"
        },
        {
          "id": "B",
          "text": "10 giờ ở nhà ga"
        },
        {
          "id": "C",
          "text": "11 giờ ở quán cà phê"
        },
        {
          "id": "D",
          "text": "Không hẹn gặp"
        }
      ],
      "correctAnswer": "B",
      "explanation": "Chốt hẹn: 「10時に駅で」(10 giờ ở nhà ga). Đáp án đúng là B.",
      "keyword": "10時に駅で (10 giờ ở ga)",
      "tip": "Thể thân mật Futsuukei lược bỏ Desu/Masu, chuyển câu hỏi sang lên giọng ở cuối câu.",
      "level": "N5"
    },
    {
      "id": 21,
      "lesson": 21,
      "topic": "Bài 21: Bày tỏ ý kiến & Phỏng đoán (To omoimasu)",
      "situation": "Thảo luận về giá cả sinh hoạt tại thủ đô Tokyo.",
      "audioText": "東京の物価についてどう思いますか。私は少し高すぎると思います。特に家賃が高いですね。でも、とても便利だとも思います。",
      "dialogue": [
        {
          "speaker": "Bạn A",
          "role": "A",
          "kanji": "東京の物価についてどう思いますか。",
          "kana": "とうきょうのぶっかについてどうおもいますか。",
          "vi": "Bạn nghĩ thế nào về vật giá ở Tokyo?"
        },
        {
          "speaker": "Bạn B",
          "role": "B",
          "kanji": "私は高すぎると思います。特に家賃が高いです。",
          "kana": "わたしはたかすぎるとおもいます。とくにやちんがたかいです。",
          "vi": "Tôi nghĩ là quá đắt đỏ. Đặc biệt là tiền thuê nhà rất cao."
        }
      ],
      "question": "Người nói có quan điểm như thế nào về chi phí tại Tokyo?",
      "options": [
        {
          "id": "A",
          "text": "Vật giá rất rẻ"
        },
        {
          "id": "B",
          "text": "Vật giá quá đắt, nhất là tiền thuê nhà"
        },
        {
          "id": "C",
          "text": "Không quan tâm đến giá cả"
        },
        {
          "id": "D",
          "text": "Tiền thuê nhà rẻ hơn nông thôn"
        }
      ],
      "correctAnswer": "B",
      "explanation": "Người nói nêu ý kiến: 「高すぎると思います。特に家賃が高い」(Nghĩ là quá đắt, nhất là tiền thuê nhà). Đáp án là B.",
      "keyword": "高すぎると思います (Nghĩ là quá đắt)",
      "tip": "Mẫu nêu ý kiến cá nhân: Thể thông thường + 「と思います」.",
      "level": "N5"
    },
    {
      "id": 22,
      "lesson": 22,
      "topic": "Bài 22: Mệnh đề bổ nghĩa cho danh từ",
      "situation": "Xác định đồng nghiệp trong bức ảnh chụp chung toàn công ty.",
      "audioText": "あの眼鏡をかけている人は誰ですか。あの方は田中さんですよ。あそこで本を読んでいる人は誰ですか。ミラーさんです。",
      "dialogue": [
        {
          "speaker": "Bạn A",
          "role": "A",
          "kanji": "あの眼鏡をかけている人は誰ですか。",
          "kana": "あのごめがねをかけているひとはだれですか。",
          "vi": "Người đang đeo kính đằng kia là ai vậy?"
        },
        {
          "speaker": "Bạn B",
          "role": "B",
          "kanji": "あの方は田中さんですよ。",
          "kana": "あのかたはたなかさんですよ。",
          "vi": "Người đó là anh Tanaka đấy."
        }
      ],
      "question": "Anh Tanaka có đặc điểm nhận dạng nào?",
      "options": [
        {
          "id": "A",
          "text": "Đang đọc sách"
        },
        {
          "id": "B",
          "text": "Đang đeo kính (眼鏡をかけている)"
        },
        {
          "id": "C",
          "text": "Đang uống cà phê"
        },
        {
          "id": "D",
          "text": "Đang mặc áo khoác đỏ"
        }
      ],
      "correctAnswer": "B",
      "explanation": "Đặc điểm: 「眼鏡をかけている人」(Người đang đeo kính). Đáp án là B.",
      "keyword": "眼鏡をかけている人 (Người đeo kính)",
      "tip": "Mệnh đề bổ nghĩa đứng ngay trước danh từ, động từ chuyển sang thể thông thường.",
      "level": "N5"
    },
    {
      "id": 23,
      "lesson": 23,
      "topic": "Bài 23: Cấu trúc Khi nào (Toki) & Hướng dẫn đường đi",
      "situation": "Hỏi đường đến bưu điện gần ga xe lửa.",
      "audioText": "すみません、郵便局へ行きたいんですが。この道を真っ直ぐ行くと、右側にありますよ。信号を渡った時、看板が見えます。ありがとうございます。",
      "dialogue": [
        {
          "speaker": "Người đi đường",
          "role": "A",
          "kanji": "すみません、郵便局はどこですか。",
          "kana": "すみません、ゆうびんきょくはどこですか。",
          "vi": "Xin lỗi, bưu điện ở đâu vậy ạ?"
        },
        {
          "speaker": "Cảnh sát",
          "role": "B",
          "kanji": "この道を真っ直ぐ行くと、右側にありますよ。",
          "kana": "このみちをまっすぐいくと、みぎがわにありますよ。",
          "vi": "Đi thẳng con đường này, bưu điện nằm ở phía bên tay phải nhé."
        }
      ],
      "question": "Theo lời chỉ dẫn, bưu điện nằm ở đâu?",
      "options": [
        {
          "id": "A",
          "text": "Phía bên tay trái sau khi rẽ"
        },
        {
          "id": "B",
          "text": "Đi thẳng con đường, nằm ở phía bên tay phải"
        },
        {
          "id": "C",
          "text": "Ở trong toà nhà nhà ga"
        },
        {
          "id": "D",
          "text": "Đã đóng cửa chuyển đi nơi khác"
        }
      ],
      "correctAnswer": "B",
      "explanation": "Chỉ đường: 「真っ直ぐ行くと、右側にあります」(Đi thẳng, nằm ở bên phải). Đáp án đúng là B.",
      "keyword": "右側にあります (Ở bên phải)",
      "tip": "Mẫu chỉ đường tất yếu: Động từ thể Từ điển + 「と」 (Cứ làm hành động này thì kết quả sẽ xảy ra).",
      "level": "N5"
    },
    {
      "id": 24,
      "lesson": 24,
      "topic": "Bài 24: Cho tặng hành động (Kuremasu / Agemasu)",
      "situation": "Kể về sự giúp đỡ của đồng nghiệp khi bị quên tài liệu quan trọng.",
      "audioText": "昨日、傘を忘れましたが、佐藤さんが傘を貸してくれました。とても親切ですね。私は佐藤さんに美味しいお菓子をあげました。",
      "dialogue": [
        {
          "speaker": "Bạn A",
          "role": "A",
          "kanji": "昨日、傘を忘れましたが、佐藤さんが傘を貸してくれました。",
          "kana": "きのう、かさをわすれましたが、さとうさんがかさをかしてくれました。",
          "vi": "Hôm qua tôi quên ô, nhưng chị Sato đã cho tôi mượn ô."
        },
        {
          "speaker": "Bạn B",
          "role": "B",
          "kanji": "佐藤さんは本当に優しいですね。",
          "kana": "さとうさんはほんとうにやさしいですね。",
          "vi": "Chị Sato thật là tốt bụng nhỉ."
        }
      ],
      "question": "Ai là người đã cho mượn ô?",
      "options": [
        {
          "id": "A",
          "text": "Bạn A cho chị Sato mượn ô"
        },
        {
          "id": "B",
          "text": "Chị Sato cho bạn A mượn ô (貸してくれました)"
        },
        {
          "id": "C",
          "text": "Bảo vệ nhà ga"
        },
        {
          "id": "D",
          "text": "Không ai cho mượn"
        }
      ],
      "correctAnswer": "B",
      "explanation": "Chị Sato làm ơn cho người nói mượn: 「佐藤さんが貸してくれました」. Đáp án đúng là B.",
      "keyword": "貸してくれました (Làm ơn cho tôi mượn)",
      "tip": "Cấu trúc 「〜てくれました」 dùng khi người khác làm một việc tốt cho chính bản thân mình.",
      "level": "N5"
    },
    {
      "id": 25,
      "lesson": 25,
      "topic": "Bài 25: Cấu trúc điều kiện Nếu (Tara) & Giả định (Temo)",
      "situation": "Thảo luận về kế hoạch đi dã ngoại cuối tuần nếu trời đổ mưa.",
      "audioText": "明日、雨が降ったら、どうしますか。雨が降ったら、出かけません。家で本を読みます。天気が良かったら、公園へ行きましょう。",
      "dialogue": [
        {
          "speaker": "Bạn A",
          "role": "A",
          "kanji": "明日、もし雨が降ったらどうしますか。",
          "kana": "あした、もしあめがふったらどうしますか。",
          "vi": "Ngày mai nếu trời đổ mưa thì bạn làm thế nào?"
        },
        {
          "speaker": "Bạn B",
          "role": "B",
          "kanji": "雨が降ったら出かけません。家でゆっくり本を読みます。",
          "kana": "あめがふったらでかけません。いえでゆっくりほんをよみます。",
          "vi": "Nếu trời mưa thì mình không ra ngoài. Mình sẽ ở nhà thong thả đọc sách."
        }
      ],
      "question": "Nếu ngày mai trời mưa, bạn B sẽ làm gì?",
      "options": [
        {
          "id": "A",
          "text": "Vẫn đi công viên ngắm cảnh"
        },
        {
          "id": "B",
          "text": "Ở nhà thong thả đọc sách, không đi ra ngoài"
        },
        {
          "id": "C",
          "text": "Đi bơi cùng bạn bè"
        },
        {
          "id": "D",
          "text": "Đi làm việc ở công ty"
        }
      ],
      "correctAnswer": "B",
      "explanation": "Bạn B chọn: 「出かけません。家で本を読みます」(Không đi ra ngoài, ở nhà đọc sách). Đáp án đúng là B.",
      "keyword": "出かけません。家で本を読みます",
      "tip": "Mẫu câu điều kiện giả định phổ biến nhất JLPT N5: Động từ thể Ta + 「ら」 (Nếu... thì...).",
      "level": "N5"
    }
  ],
  "N4": [
    {
      "id": "N4_26",
      "level": "N4",
      "lesson": 26,
      "topic": "Bài 26: Giải thích lý do & Xác nhận thông tin ～んです",
      "situation": "Tại văn phòng, anh Miller đến muộn cuộc họp buổi sáng và giải thích lý do cho trưởng phòng Nakamura.",
      "audioText": "ミラーさん、おはようございます。どうして遅れたんですか。すみません、電車が止まってしまったんです。事故があったんですか。ええ、踏切で点検があったそうです。",
      "dialogue": [
        {
          "speaker": "Trưởng phòng",
          "role": "A",
          "kanji": "ミラーさん、どうして遅れたんですか。",
          "kana": "みらーさん、どうしておくれたんですか。",
          "vi": "Anh Miller, tại sao anh lại đến muộn vậy?"
        },
        {
          "speaker": "Miller",
          "role": "B",
          "kanji": "すみません、電車が止まってしまったんです。",
          "kana": "すみません、でんしゃがとまってしまったんです。",
          "vi": "Xin lỗi, tàu điện bị dừng giữa chừng ạ."
        },
        {
          "speaker": "Trưởng phòng",
          "role": "A",
          "kanji": "事故があったんですか。",
          "kana": "じこがあったんですか。",
          "vi": "Đã có tai nạn xảy ra à?"
        },
        {
          "speaker": "Miller",
          "role": "B",
          "kanji": "ええ、踏切で安全点検があったそうです。",
          "kana": "ええ、ふみきりであんぜんてんけんがあったそうです。",
          "vi": "Vâng, nghe nói đã có đợt kiểm tra an toàn tại thanh chắn tàu ạ."
        }
      ],
      "question": "Tại sao anh Miller lại đến văn phòng muộn?",
      "options": [
        {
          "id": "A",
          "text": "Vì anh Miller ngủ quên ở nhà"
        },
        {
          "id": "B",
          "text": "Vì tàu điện bị dừng do có kiểm tra an toàn đường ray"
        },
        {
          "id": "C",
          "text": "Vì anh Miller bị tai nạn trên đường đi làm"
        },
        {
          "id": "D",
          "text": "Vì trời mưa to khiến đường bị tắc nghẽn"
        }
      ],
      "correctAnswer": "B",
      "explanation": "Anh Miller giải thích rõ: 「電車が止まってしまったんです。踏切で安全点検があったそうです」(Tàu điện bị dừng do có kiểm tra an toàn). Đáp án đúng là B.",
      "keyword": "遅れたんです & 点検",
      "tip": "Mẫu câu ～んです dùng để giải thích nguyên nhân, lý do một cách thuyết phục và nhấn mạnh sự việc."
    },
    {
      "id": "N4_27",
      "level": "N4",
      "lesson": 27,
      "topic": "Bài 27: Thể khả năng (可能形) & Khả năng của con người",
      "situation": "Tại trung tâm giao lưu quốc tế, chị Lan nói chuyện với bạn Nhật về khả năng đọc báo chữ Kanji và nấu ăn.",
      "audioText": "ランさんは日本語の新聞が読めますか。ひらがなは読めますが、漢字はまだあまり読めません。日本料理は作れますか。はい、肉じゃがや天ぷらなら作れますよ。すごいですね。",
      "dialogue": [
        {
          "speaker": "Yamada",
          "role": "A",
          "kanji": "ランさんは日本語の新聞が読めますか。",
          "kana": "らんさんはにほんごのしんぶんがよめますか。",
          "vi": "Bạn Lan có đọc được báo tiếng Nhật không?"
        },
        {
          "speaker": "Lan",
          "role": "B",
          "kanji": "ひらがなは読めますが、漢字はまだあまり読めません。",
          "kana": "ひらがなはよめますが、かんじはまだあまりよめません。",
          "vi": "Hiragana thì tôi đọc được, nhưng chữ Kanji thì vẫn chưa đọc được nhiều ạ."
        },
        {
          "speaker": "Yamada",
          "role": "A",
          "kanji": "日本料理は作れますか。",
          "kana": "にほんりょうりはつくれますか。",
          "vi": "Bạn có nấu được món ăn Nhật không?"
        },
        {
          "speaker": "Lan",
          "role": "B",
          "kanji": "はい、肉じゃがや天ぷらなら上手に作れますよ。",
          "kana": "はい、にくじゃがやてんぷらならじょうずにつくれますよ。",
          "vi": "Có chứ, thịt kho khoai tây hay tempura thì tôi nấu khéo lắm đấy."
        }
      ],
      "question": "Khả năng tiếng Nhật và nấu ăn của chị Lan như thế nào?",
      "options": [
        {
          "id": "A",
          "text": "Đọc tốt toàn bộ chữ Kanji trên báo và không biết nấu món Nhật"
        },
        {
          "id": "B",
          "text": "Đọc được Hiragana nhưng chưa đọc được nhiều Kanji, nấu được món Nikujaga và Tempura"
        },
        {
          "id": "C",
          "text": "Không đọc được bất kỳ loại chữ Nhật nào"
        },
        {
          "id": "D",
          "text": "Chỉ biết nấu mỗi món Tempura"
        }
      ],
      "correctAnswer": "B",
      "explanation": "Chị Lan nói: 「ひらがなは読めますが、漢字はまだあまり読めません」 và 「肉じゃがや天ぷらなら上手に作れますよ」. Đáp án đúng là B.",
      "keyword": "読めます (よめます) & 作れます (つくれます)",
      "tip": "Thể khả năng biến đổi trợ từ を thành が (ví dụ: 新聞を読む chuyển thành 新聞が読める)."
    },
    {
      "id": "N4_28",
      "level": "N4",
      "lesson": 28,
      "topic": "Bài 28: Hành động đồng thời ～ながら & Liệt kê lý do ～し～し",
      "situation": "Tan học, hai bạn sinh viên đang thảo luận về thói quen học bài và lý do chọn quán cà phê quen thuộc.",
      "audioText": "太郎君は音楽を聞きながら勉強しますか。いいえ、音楽を聞くと集中できません。このカフェはどうですか。静かだし、コーヒーも美味しいし、いつもここで勉強しています。",
      "dialogue": [
        {
          "speaker": "Hana",
          "role": "A",
          "kanji": "太郎君は音楽を聞きながら勉強しますか。",
          "kana": "たろうくんはおんがくをききながらべんきょうしますか。",
          "vi": "Taro vừa nghe nhạc vừa học bài à?"
        },
        {
          "speaker": "Taro",
          "role": "B",
          "kanji": "いいえ、音楽を聞くと集中できないんです。",
          "kana": "いいえ、おんがくをきくとしゅうちゅうできないんです。",
          "vi": "Không, hễ nghe nhạc là tớ không tập trung được."
        },
        {
          "speaker": "Hana",
          "role": "A",
          "kanji": "じゃあ、どうしていつもこのカフェに来るの。",
          "kana": "じゃあ、どうしていつもこのかふぇにくるの。",
          "vi": "Thế sao cậu lại luôn đến quán cà phê này?"
        },
        {
          "speaker": "Taro",
          "role": "B",
          "kanji": "静かだし、コーヒーも美味しいし、Wi-Fiもあるからです。",
          "kana": "しずかだし、こーひーもおいしいし、わいふぁいもあるからです。",
          "vi": "Vì quán vừa yên tĩnh, cà phê ngon, lại còn có cả Wi-Fi nữa."
        }
      ],
      "question": "Tại sao bạn Taro lại thích đến học tại quán cà phê này?",
      "options": [
        {
          "id": "A",
          "text": "Vì quán mở nhạc sôi động để Taro vừa nghe vừa học"
        },
        {
          "id": "B",
          "text": "Vì quán yên tĩnh, cà phê thơm ngon và có kết nối Wi-Fi"
        },
        {
          "id": "C",
          "text": "Vì quán cà phê ở ngay cạnh nhà Taro"
        },
        {
          "id": "D",
          "text": "Vì bạn bè của Taro đều tụ tập ở đây"
        }
      ],
      "correctAnswer": "B",
      "explanation": "Taro liệt kê 3 lý do bằng mẫu ～し: 「静かだし、コーヒーも美味しいし、Wi-Fiもある」. Đáp án đúng là B.",
      "keyword": "～ながら & ～し～し",
      "tip": "Trong mẫu V1-masu + ながら + V2, hành động V2 là hành động chính cần tập trung."
    },
    {
      "id": "N4_29",
      "level": "N4",
      "lesson": 29,
      "topic": "Bài 29: Tự động từ & Diễn tả trạng thái kết quả ～ています",
      "situation": "Tại căn hộ mới chuyển đến, anh Nam phát hiện cửa sổ đang mở và đèn phòng khách đang sáng.",
      "audioText": "窓が開いていますよ。風が入って寒いですね。誰が開けたんでしょうか。私が掃除の時に開けました。じゃ、閉めておきますね。電気も消しましょう。",
      "dialogue": [
        {
          "speaker": "Nam",
          "role": "A",
          "kanji": "窓が開いていますよ。風が入って寒いです。",
          "kana": "まどがあいていますよ。かぜがはいってさむいです。",
          "vi": "Cửa sổ đang mở kìa bạn. Gió lùa vào lạnh quá."
        },
        {
          "speaker": "Ken",
          "role": "B",
          "kanji": "あ、すみません。私が掃除の時に開けたんです。",
          "kana": "あ、すみません。わたしがそうじのときにあけたんです。",
          "vi": "A, xin lỗi nhé. Tớ đã mở lúc dọn phòng đấy."
        },
        {
          "speaker": "Nam",
          "role": "A",
          "kanji": "じゃ、寒いですから閉めてもいいですか。",
          "kana": "じゃ、さむいですからしめてもいいですか。",
          "vi": "Vậy lạnh thế này tớ đóng lại được không?"
        },
        {
          "speaker": "Ken",
          "role": "B",
          "kanji": "ええ、閉めてください。ついでに電気も消してください。",
          "kana": "ええ、しめてください。ついでにでんきもけしてください。",
          "vi": "Ừ, cậu đóng lại giúp nhé. Nhân tiện tắt giùm bóng đèn luôn."
        }
      ],
      "question": "Tại sao cửa sổ căn phòng lại đang mở?",
      "options": [
        {
          "id": "A",
          "text": "Vì gió thổi mạnh làm cửa sổ tự bung ra"
        },
        {
          "id": "B",
          "text": "Vì bạn Ken đã mở lúc dọn dẹp phòng"
        },
        {
          "id": "C",
          "text": "Vì phòng quá nóng nực cần thông gió"
        },
        {
          "id": "D",
          "text": "Vì bạn Nam quên đóng trước khi ra ngoài"
        }
      ],
      "correctAnswer": "B",
      "explanation": "Ken xác nhận: 「私が掃除の時に開けたんです」(Tớ đã mở lúc dọn phòng). Đáp án đúng là B.",
      "keyword": "開いています (あいています) & 開けました (あけました)",
      "tip": "Phân biệt tự động từ (窓が開く) biểu thị trạng thái và tha động từ (窓を開ける) biểu thị hành vi có chủ ý."
    },
    {
      "id": "N4_30",
      "level": "N4",
      "lesson": 30,
      "topic": "Bài 30: Trạng thái chuẩn bị sẵn ～てあります & Chuẩn bị trước ～ておきます",
      "situation": "Chuẩn bị cho hội nghị khách hàng quốc tế ngày mai, hai nhân viên công ty kiểm tra lại phòng họp.",
      "audioText": "明日の会議の準備はできましたか。はい、資料はもうテーブルの上に並べてあります。プロジェクターはどうですか。今からテストしておきます。",
      "dialogue": [
        {
          "speaker": "Trưởng nhóm",
          "role": "A",
          "kanji": "明日の国際会議の準備はもうできましたか。",
          "kana": "あしたのこくさいかいぎのじゅんびはもうできましたか。",
          "vi": "Việc chuẩn bị cho hội nghị quốc tế ngày mai đã xong chưa?"
        },
        {
          "speaker": "Nhân viên",
          "role": "B",
          "kanji": "はい、会議の資料はテーブルの上に並べてあります。",
          "kana": "はい、かいぎのしりょうはてーぶるのうえにならべてあります。",
          "vi": "Dạ rồi, tài liệu cuộc họp đã được xếp sẵn trên bàn rồi ạ."
        },
        {
          "speaker": "Trưởng nhóm",
          "role": "A",
          "kanji": "プロジェクターの接続はどうですか。",
          "kana": "ぷろじぇくたーのせつぞくはどうですか。",
          "vi": "Kết nối máy chiếu thì thế nào?"
        },
        {
          "speaker": "Nhân viên",
          "role": "B",
          "kanji": "念のため、今からもう一度テストしておきます。",
          "kana": "ねんのため、いまからもういちどてすとしておきます。",
          "vi": "Để cho chắc chắn, em sẽ kiểm tra thử lại ngay bây giờ ạ."
        }
      ],
      "question": "Tình trạng chuẩn bị cho hội nghị ngày mai hiện nay ra sao?",
      "options": [
        {
          "id": "A",
          "text": "Chưa in tài liệu và máy chiếu đã hỏng"
        },
        {
          "id": "B",
          "text": "Tài liệu đã xếp sẵn trên bàn, nhân viên chuẩn bị kiểm tra lại máy chiếu"
        },
        {
          "id": "C",
          "text": "Hội nghị bị hủy bỏ do trục trặc kỹ thuật"
        },
        {
          "id": "D",
          "text": "Mọi người đã họp xong từ chiều nay"
        }
      ],
      "correctAnswer": "B",
      "explanation": "Nhân viên báo cáo: 「資料は並べてあります」(Tài liệu đã xếp sẵn) và 「今からテストしておきます」(Sẽ kiểm tra máy chiếu trước). Đáp án đúng là B.",
      "keyword": "並べてあります & テストしておきます",
      "tip": "V-てあります diễn tả kết quả có chủ đích sẵn; V-ておきます diễn tả hành động chuẩn bị trước cho một mục đích."
    },
    {
      "id": "N4_31",
      "level": "N4",
      "lesson": 31,
      "topic": "Bài 31: Thể ý chí (意向形) & Dự định ～ようと思っています",
      "situation": "Hai người bạn trò chuyện về kế hoạch nghỉ phép hè và dự định tương lai sau khi tốt nghiệp.",
      "audioText": "夏休みはどうするの。北海道へ旅行に行こうと思っています。卒業後は日本で働こうと考えています。素晴らしい計画ですね。",
      "dialogue": [
        {
          "speaker": "Sato",
          "role": "A",
          "kanji": "今年の夏休みはどこかへ行く予定ですか。",
          "kana": "ことしのなつやすみはどこかへいくよていですか。",
          "vi": "Kỳ nghỉ hè năm nay bạn có dự định đi đâu không?"
        },
        {
          "speaker": "Tanaka",
          "role": "B",
          "kanji": "北海道へ一人で旅行に行こうと思っています。",
          "kana": "ほっかいどうへひとりでりょこうにいこうとおもっています。",
          "vi": "Tớ đang tính đi du lịch Hokkaido một mình."
        },
        {
          "speaker": "Sato",
          "role": "A",
          "kanji": "いいですね。大学を卒業した後はどうするの。",
          "kana": "いいですね。だいがくをそつぎょうしたあとはどうするの。",
          "vi": "Tuyệt nhỉ. Sau khi tốt nghiệp đại học thì cậu làm gì?"
        },
        {
          "speaker": "Tanaka",
          "role": "B",
          "kanji": "日本のIT企業で働こうと考えています。",
          "kana": "にほんのあいてぃーきぎょうではたらこうとかんがえています。",
          "vi": "Tớ đang dự tính sẽ làm việc tại công ty IT của Nhật."
        }
      ],
      "question": "Kế hoạch của Tanaka trong mùa hè và sau khi tốt nghiệp là gì?",
      "options": [
        {
          "id": "A",
          "text": "Nghỉ hè ở nhà và sau tốt nghiệp về nước làm việc"
        },
        {
          "id": "B",
          "text": "Đi du lịch Hokkaido một mình và sau tốt nghiệp làm việc tại công ty IT ở Nhật"
        },
        {
          "id": "C",
          "text": "Đi Hokkaido cùng gia đình và tiếp tục học thạc sĩ"
        },
        {
          "id": "D",
          "text": "Đi du học nước ngoài trong mùa hè"
        }
      ],
      "correctAnswer": "B",
      "explanation": "Tanaka chia sẻ: 「北海道へ旅行に行こうと思っています」 và 「日本のIT企業で働こうと考えています」. Đáp án đúng là B.",
      "keyword": "行こうと思っています & 働こうと考えています",
      "tip": "Thể ý chí (意向形) kết hợp với ～と思っています thể hiện dự định đã nhen nhóm và ấp ủ từ trước."
    },
    {
      "id": "N4_32",
      "level": "N4",
      "lesson": 32,
      "topic": "Bài 32: Lời khuyên ～ほうがいい & Dự đoán ～でしょう／かもしれません",
      "situation": "Tại phòng y tế trường học, cô y tá khuyên sinh viên bị cảm sốt và dự báo thời tiết chiều nay.",
      "audioText": "熱が三十八度もありますね。病院へ行ったほうがいいですよ。薬を飲んで早く寝てください。午後は雨が降るかもしれませんから傘を持って行ってください。",
      "dialogue": [
        {
          "speaker": "Y tá",
          "role": "A",
          "kanji": "熱を測ったら三十八度五分もありますね。",
          "kana": "ねつをはかったらさんじゅうはちどごぶもありますね。",
          "vi": "Đo nhiệt độ thì em đang sốt tận 38 độ 5 đấy."
        },
        {
          "speaker": "Sinh viên",
          "role": "B",
          "kanji": "頭も痛くて喉もすごく痛いんです。",
          "kana": "あたまもいたくてのどもすごくいたいんです。",
          "vi": "Em bị đau đầu và họng cũng đau rát lắm ạ."
        },
        {
          "speaker": "Y tá",
          "role": "A",
          "kanji": "今日は早く帰って病院へ行ったほうがいいですよ。",
          "kana": "きょうははやくかえってびょういんへいったほうがいいですよ。",
          "vi": "Hôm nay em nên về sớm và đi bệnh viện khám ngay nhé."
        },
        {
          "speaker": "Y tá",
          "role": "A",
          "kanji": "午後は寒くなって雨が降るかもしれませんから、暖かくしてください。",
          "kana": "ごごはさむくなってあめがふるかもしれませんから、あたたかくしてください。",
          "vi": "Chiều nay trời có thể trở lạnh và đổ mưa, nhớ giữ ấm nhé."
        }
      ],
      "question": "Cô y tá đưa ra lời khuyên gì cho bạn sinh viên?",
      "options": [
        {
          "id": "A",
          "text": "Nên ở lại trường tiếp tục học hết tiết buổi chiều"
        },
        {
          "id": "B",
          "text": "Nên về sớm, đi khám tại bệnh viện và giữ ấm vì chiều có thể mưa lạnh"
        },
        {
          "id": "C",
          "text": "Uống nước đá để hạ sốt tức thì"
        },
        {
          "id": "D",
          "text": "Đi dạo ngoài công viên để hít thở khí trời"
        }
      ],
      "correctAnswer": "B",
      "explanation": "Cô y tá khuyên: 「病院へ行ったほうがいいですよ」 và dặn 「暖かくしてください」(Giữ ấm). Đáp án đúng là B.",
      "keyword": "行ったほうがいい & 降るかもしれません",
      "tip": "V-たほうがいい khuyên nên làm điều có lợi; V-ないほうがいい khuyên không nên làm điều có hại."
    },
    {
      "id": "N4_33",
      "level": "N4",
      "lesson": 33,
      "topic": "Bài 33: Thể mệnh lệnh & Cấm chỉ (命令形・禁止形) & Biển báo",
      "situation": "Tại sân tập thể dục và trên đường phố Tokyo, huấn luyện viên hướng dẫn động tác và giải thích biển cấm.",
      "audioText": "もっと速く走れ！諦めるな！あそこに「立入禁止」と書いてあります。入ってはいけません。",
      "dialogue": [
        {
          "speaker": "HLV",
          "role": "A",
          "kanji": "ラスト一周！最後まで諦めるな！もっと腕を振れ！",
          "kana": "らすといっしゅう！さいごまであきらめるな！もっとうでをふれ！",
          "vi": "Vòng cuối cùng rồi! Tuyệt đối không được bỏ cuộc! Vung tay mạnh lên!"
        },
        {
          "speaker": "Vận động viên",
          "role": "B",
          "kanji": "はい！頑張ります！",
          "kana": "はい！がんばります！",
          "vi": "Vâng! Em sẽ cố gắng hết sức!"
        },
        {
          "speaker": "HLV",
          "role": "A",
          "kanji": "そっちの工事現場には入るな！「立入禁止」と書いてあるぞ。",
          "kana": "そっちのこうじげんばにははいるな！「たちいりきんし」とかいてあるぞ。",
          "vi": "Đừng có chạy vào công trường bên kia! Biển ghi \"Cấm vào\" đấy."
        }
      ],
      "question": "Biển báo ở công trường ghi ý nghĩa gì?",
      "options": [
        {
          "id": "A",
          "text": "Được phép tự do vào tham quan"
        },
        {
          "id": "B",
          "text": "Khu vực cấm vào, không được phép bước vào"
        },
        {
          "id": "C",
          "text": "Khu vực giảm tốc độ xe cộ"
        },
        {
          "id": "D",
          "text": "Nơi đỗ xe dành cho ban tổ chức"
        }
      ],
      "correctAnswer": "B",
      "explanation": "Huấn luyện viên cảnh báo: 「立入禁止と書いてある」(Ghi là Cấm vào). Đáp án đúng là B.",
      "keyword": "諦めるな (あきらめるな) & 立入禁止 (たちいりきんし)",
      "tip": "Động từ thể từ điển + な là thể cấm chỉ (禁止形), mang tính răn đe mạnh mẽ: 入るな (Cấm vào!)."
    },
    {
      "id": "N4_34",
      "level": "N4",
      "lesson": 34,
      "topic": "Bài 34: Làm theo chỉ dẫn ～とおりに & Thứ tự hành động ～あとで",
      "situation": "Trong lớp học nấu ăn, giáo viên hướng dẫn cách cắt rau củ và tẩm ướp thịt gà chiên Karaage.",
      "audioText": "私が切るとおりに野菜を切ってください。野菜を切ったあとで、タレに肉を三十分漬けておきます。分かりましたか。",
      "dialogue": [
        {
          "speaker": "Sensei",
          "role": "A",
          "kanji": "皆さん、私が今から切るとおりに人参を切ってください。",
          "kana": "みなさん、わたしがいまからきるとおりににんじんをきってください。",
          "vi": "Mọi người, hãy cắt củ cà rốt đúng y như tôi vừa cắt mẫu nhé."
        },
        {
          "speaker": "Học viên",
          "role": "B",
          "kanji": "厚さはどれくらいですか。",
          "kana": "あつさはどれくらいですか。",
          "vi": "Độ dày khoảng bao nhiêu ạ?"
        },
        {
          "speaker": "Sensei",
          "role": "A",
          "kanji": "一センチくらいです。野菜を切ったあとで、鶏肉を調味料に漬けます。",
          "kana": "いっせんちくらいです。やさいをきったあとで、とりにくをちょうみりょうにつけます。",
          "vi": "Khoảng 1 centimet. Sau khi cắt rau củ xong, chúng ta sẽ ướp thịt gà vào gia vị."
        }
      ],
      "question": "Sau khi cắt xong rau củ, bước tiếp theo học viên cần làm là gì?",
      "options": [
        {
          "id": "A",
          "text": "Rửa sạch chảo để chuẩn bị rán ngay"
        },
        {
          "id": "B",
          "text": "Ướp thịt gà vào gia vị"
        },
        {
          "id": "C",
          "text": "Ăn thử củ cà rốt sống"
        },
        {
          "id": "D",
          "text": "Tắt bếp và dọn dẹp bàn ăn"
        }
      ],
      "correctAnswer": "B",
      "explanation": "Sensei hướng dẫn rõ ràng: 「野菜を切ったあとで、鶏肉を調味料に漬けます」. Đáp án đúng là B.",
      "keyword": "切るとおりに & 切ったあとで",
      "tip": "V1-た + あとで diễn tả hành động V2 được tiến hành tuần tự sau khi V1 đã hoàn thành trọn vẹn."
    },
    {
      "id": "N4_35",
      "level": "N4",
      "lesson": 35,
      "topic": "Bài 35: Thể điều kiện (条件形) ～ば & Lời khuyên giải pháp",
      "situation": "Tại nhà ga Shibuya, một du khách ngoại quốc hỏi cách đi nhanh nhất và tiết kiệm nhất đến sân bay Narita.",
      "audioText": "成田空港へ行くなら、特急に乗れば一番早いです。安く行きたければ、快速電車に乗るといいですよ。",
      "dialogue": [
        {
          "speaker": "Du khách",
          "role": "A",
          "kanji": "すみません、成田空港へ行きたいんですが、どう行けばいいですか。",
          "kana": "すみません、なりたくうこうへいきたいんですが、どういけばいいですか。",
          "vi": "Xin lỗi, tôi muốn đi sân bay Narita thì đi thế nào tiện nhất ạ?"
        },
        {
          "speaker": "Nhân viên ga",
          "role": "B",
          "kanji": "成田エクスプレスに乗れば、一時間で着きますよ。一番早いです。",
          "kana": "なりたえくすぷれすにのれば、いちじかんでつきますよ。いちばんはやいです。",
          "vi": "Nếu đi tàu Narita Express thì 1 tiếng là tới nơi. Nhanh nhất đấy ạ."
        },
        {
          "speaker": "Du khách",
          "role": "A",
          "kanji": "少し安く行きたいんですが。",
          "kana": "すこしやすくいきたいんですが。",
          "vi": "Tôi muốn đi cách nào tiết kiệm chi phí hơn một chút ạ."
        },
        {
          "speaker": "Nhân viên ga",
          "role": "B",
          "kanji": "安く行きたければ、京成線の特急を使えば半額で行けますよ。",
          "kana": "やすくいきたければ、けいせいせんのとっきゅうをつかえばはんがくでいけますよ。",
          "vi": "Nếu muốn đi rẻ thì dùng tàu Keisei Line, chỉ tốn nửa giá vé thôi ạ."
        }
      ],
      "question": "Nếu muốn đi sân bay Narita tiết kiệm chi phí nhất, du khách nên chọn phương tiện nào?",
      "options": [
        {
          "id": "A",
          "text": "Gọi xe taxi chạy suốt tuyến đường cao tốc"
        },
        {
          "id": "B",
          "text": "Đi tàu tuyến Keisei Line để được giảm nửa giá vé"
        },
        {
          "id": "C",
          "text": "Đi bộ từ Shibuya"
        },
        {
          "id": "D",
          "text": "Đi tàu cao tốc Shinkansen"
        }
      ],
      "correctAnswer": "B",
      "explanation": "Nhân viên chỉ dẫn: 「安く行きたければ、京成線の特急を使えば半額で行けます」. Đáp án đúng là B.",
      "keyword": "乗れば & 安く行きたければ",
      "tip": "Tính từ đuôi い đổi thành ければ để thành lập thể điều kiện (Ví dụ: 安い chuyển thành 安ければ)."
    },
    {
      "id": "N4_36",
      "level": "N4",
      "lesson": 36,
      "topic": "Bài 36: Thói quen nỗ lực ～ようにします & Sự biến đổi ～ようになりました",
      "situation": "Bác sĩ kiểm tra sức khỏe và người bệnh chia sẻ về những thay đổi tích cực trong lối sống thường ngày.",
      "audioText": "毎日野菜をたくさん食べるようにしています。最近は階段を使うようになりました。血圧も正常になりましたね。素晴らしいです。",
      "dialogue": [
        {
          "speaker": "Bác sĩ",
          "role": "A",
          "kanji": "検査の結果、血圧の数値がとても良くなっていますね。何か生活を変えましたか。",
          "kana": "けんさのけっか、けつあつのすうちがとてもよくなっていますね。なにかせいかつをかえましたか。",
          "vi": "Kết quả xét nghiệm cho thấy huyết áp cải thiện rất tốt đấy. Bác có thay đổi thói quen gì không?"
        },
        {
          "speaker": "Bệnh nhân",
          "role": "B",
          "kanji": "毎朝三十ぷん散歩するようにしています。エレベーターに乗らず、階段を使うようになりました。",
          "kana": "まいあささんじゅっぷんさんぽするようにしています。えれべーたーにのらず、かいだんをつかうようになりました。",
          "vi": "Mỗi sáng tôi đều cố gắng đi bộ 30 phút. Tôi cũng đã chuyển sang leo cầu thang bộ thay vì thang máy."
        },
        {
          "speaker": "Bác sĩ",
          "role": "A",
          "kanji": "素晴らしいですね。これからも塩分を控えるようにしてください。",
          "kana": "すばらしいですね。これからもえんぶんをひかえるようにしてください。",
          "vi": "Tuyệt vời lắm. Bác hãy tiếp tục cố gắng giảm bớt lượng muối trong bữa ăn nhé."
        }
      ],
      "question": "Bệnh nhân đã thay đổi thói quen sinh hoạt thường ngày như thế nào?",
      "options": [
        {
          "id": "A",
          "text": "Uống nhiều nước ngọt và bỏ ăn sáng"
        },
        {
          "id": "B",
          "text": "Cố gắng đi bộ 30 phút mỗi sáng và quen với việc leo cầu thang bộ"
        },
        {
          "id": "C",
          "text": "Nằm nghỉ ngơi cả ngày trên giường"
        },
        {
          "id": "D",
          "text": "Ăn thêm nhiều món mặn chiên dầu"
        }
      ],
      "correctAnswer": "B",
      "explanation": "Bệnh nhân nói: 「毎朝散歩するようにしています」 và 「階段を使うようになりました」. Đáp án đúng là B.",
      "keyword": "散歩するようにしています & 使うようになりました",
      "tip": "～ようにします diễn tả sự nỗ lực duy trì thói quen; ～ようになりました diễn tả sự biến đổi từ chưa thể sang đã thành thạo."
    },
    {
      "id": "N4_37",
      "level": "N4",
      "lesson": 37,
      "topic": "Bài 37: Thể bị động (受身形) & Trải nghiệm bị phiền toái",
      "situation": "Trên chuyến tàu điện giờ cao điểm sáng sớm, hai người đồng nghiệp than thở về sự cố bất ngờ vừa trải qua.",
      "audioText": "満員電車で足を踏まれて痛かったです。雨が降って傘を盗まれてしまいました。散々な朝でしたね。",
      "dialogue": [
        {
          "speaker": "Akiyama",
          "role": "A",
          "kanji": "田中さん、どうしてそんなに疲れた顔をしているんですか。",
          "kana": "たなかさん、どうしてそんなにつかれたかおをしているんですか。",
          "vi": "Anh Tanaka, sao trông mặt anh bơ phờ mệt mỏi thế?"
        },
        {
          "speaker": "Tanaka",
          "role": "B",
          "kanji": "今朝の満員電車で、後ろの人に足を踏まれたんです。おまけに駅で傘を盗まれました。",
          "kana": "けさのまんいんでんしゃで、うしろのひとにあしをふまれたんです。おまけにえきでかさをぬすまれました。",
          "vi": "Lúc trên tàu điện đông nghẹt sáng nay, tôi bị người đằng sau giẫm chân lên. Đã thế ở ga còn bị kẻ nào lấy mất ô nữa."
        },
        {
          "speaker": "Akiyama",
          "role": "A",
          "kanji": "それは大変でしたね。でもプレゼンは部長に褒められましたよ！",
          "kana": "それはたいへんでしたね。でもぷれぜんはぶちょうにほめられましたよ！",
          "vi": "Khổ thân anh thật. Nhưng bài thuyết trình của anh vừa được trưởng phòng khen ngợi hết lời đấy!"
        }
      ],
      "question": "Anh Tanaka đã gặp phải những điều phiền toái gì vào buổi sáng?",
      "options": [
        {
          "id": "A",
          "text": "Bị mất điện thoại và bị sếp khiển trách"
        },
        {
          "id": "B",
          "text": "Bị giẫm vào chân trên tàu và bị lấy cắp chiếc ô tại nhà ga"
        },
        {
          "id": "C",
          "text": "Bị lỡ chuyến tàu và phải đi bộ đến công ty"
        },
        {
          "id": "D",
          "text": "Bị cảm lạnh và hỏng máy tính cá nhân"
        }
      ],
      "correctAnswer": "B",
      "explanation": "Tanaka kể: 「足を踏まれた」(Bị giẫm chân) và 「傘を盗まれた」(Bị lấy mất ô). Đáp án đúng là B.",
      "keyword": "踏まれた (ふまれた) & 褒められました (ほめられました)",
      "tip": "Thể bị động phiền toái (迷惑受身) thường dùng trợ từ に chỉ đối tượng gây ra hành vi phiền phức."
    },
    {
      "id": "N4_38",
      "level": "N4",
      "lesson": 38,
      "topic": "Bài 38: Danh từ hóa động từ ～のは／のを／のに & Sở thích, thói quen",
      "situation": "Trong buổi phỏng vấn giao lưu câu lạc bộ nhiếp ảnh, các thành viên chia sẻ về niềm yêu thích chụp ảnh thiên nhiên.",
      "audioText": "私が好きなのは、朝の静かな風景を撮ることです。写真を撮るのを忘れるくらい夢中になります。",
      "dialogue": [
        {
          "speaker": "Hội trưởng",
          "role": "A",
          "kanji": "山田さんが写真を撮り始めたきっかけは何ですか。",
          "kana": "やまださんがしゃしんをとりはじめたきっかけはなんですか。",
          "vi": "Cơ duyên nào khiến bạn Yamada bắt đầu niềm đam mê chụp ảnh vậy?"
        },
        {
          "speaker": "Yamada",
          "role": "B",
          "kanji": "私が一番好きなのは、朝早く山に登って日の出を撮ることなんです。",
          "kana": "わたしがいちばんすきなのは、あさはやくやまにのぼってひのでをとることなんです。",
          "vi": "Điều tôi yêu thích nhất chính là leo núi vào sáng sớm và bắt trọn khoảnh khắc bình minh."
        },
        {
          "speaker": "Hội trưởng",
          "role": "A",
          "kanji": "カメラを持ち歩くのは重くて大変ではありませんか。",
          "kana": "かめらをもちあるくのはおもくてたいへんではありませんか。",
          "vi": "Việc mang vác máy ảnh nặng nề đi lại có vất vả lắm không?"
        },
        {
          "speaker": "Yamada",
          "role": "B",
          "kanji": "いいえ、綺麗な写真を撮るのに時間がかかるのも楽しいですよ。",
          "kana": "いいえ、きれいなしゃしんをとるのにじかんがかかるのもたのしいですよ。",
          "vi": "Không hề, việc bỏ thời gian để chụp được tấm ảnh đẹp đối với tôi cũng là niềm vui lớn."
        }
      ],
      "question": "Điều mà anh Yamada yêu thích nhất trong nhiếp ảnh là gì?",
      "options": [
        {
          "id": "A",
          "text": "Chụp ảnh đồ ăn tại các nhà hàng sang trọng"
        },
        {
          "id": "B",
          "text": "Leo núi vào sáng sớm và chụp khoảnh khắc mặt trời mọc"
        },
        {
          "id": "C",
          "text": "Bán máy ảnh cũ lấy tiền mua quà"
        },
        {
          "id": "D",
          "text": "Chụp chân dung cho người mẫu nổi tiếng"
        }
      ],
      "correctAnswer": "B",
      "explanation": "Yamada nói: 「一番好きなのは、朝早く山に登って日の出を撮ること」. Đáp án đúng là B.",
      "keyword": "好きなのは & 撮るのに",
      "tip": "Trợ từ の đi sau thể thông thường biến cụm động từ thành một danh từ hoàn chỉnh (Danh từ hóa)."
    },
    {
      "id": "N4_39",
      "level": "N4",
      "lesson": 39,
      "topic": "Bài 39: Nguyên nhân lý do khách quan ～て／～ので",
      "situation": "Do ảnh hưởng của trận bão lớn đêm qua, tàu điện bị chậm trễ và nhân viên gọi điện báo cáo văn phòng.",
      "audioText": "台風で木が倒れて、電車が止まりました。遅れるので、課長に電話で連絡しました。怪我人がいなくて安心しました。",
      "dialogue": [
        {
          "speaker": "Suzuki",
          "role": "A",
          "kanji": "課長、おはようございます。鈴木ですが、今駅におります。",
          "kana": "かちょう、おはようございます。すずきですが、いまえきにおります。",
          "vi": "Dạ em chào trưởng phòng. Em là Suzuki, hiện em đang ở nhà ga ạ."
        },
        {
          "speaker": "Trưởng phòng",
          "role": "B",
          "kanji": "鈴木君、大丈夫か。電車は動いているかい。",
          "kana": "すずきくん、だいじょうぶか。でんしゃはうごいているかい。",
          "vi": "Cậu Suzuki, có sao không? Tàu chạy chưa?"
        },
        {
          "speaker": "Suzuki",
          "role": "A",
          "kanji": "昨夜の台風で線路に木が倒れて、運転を見合わせているんです。",
          "kana": "さくやのたいふうでせんろにきがたおれて、うんてんをみあわせているんです。",
          "vi": "Do cơn bão đêm qua khiến cây đổ chắn ngang đường ray, tàu đang tạm ngừng hoạt động ạ."
        },
        {
          "speaker": "Trưởng phòng",
          "role": "B",
          "kanji": "そうか。三十ぷんほど遅れそうなので、無理をせず安全第一で来なさい。",
          "kana": "そうか。さんじゅっぷんほどおくれそうなので、むりをせずあんぜんだいいちできなさい。",
          "vi": "Vậy à. Chắc muộn khoảng 30 phút, cứ bình tĩnh an toàn là trên hết nhé."
        }
      ],
      "question": "Nguyên nhân trực tiếp khiến tàu điện của anh Suzuki bị tạm ngừng chạy là gì?",
      "options": [
        {
          "id": "A",
          "text": "Do mất điện trên diện rộng toàn thành phố"
        },
        {
          "id": "B",
          "text": "Do cây bị đổ chắn ngang đường ray sau cơn bão đêm qua"
        },
        {
          "id": "C",
          "text": "Do có người đánh rơi ví xuống đường ray"
        },
        {
          "id": "D",
          "text": "Do tài xế tàu điện bị ốm đột xuất"
        }
      ],
      "correctAnswer": "B",
      "explanation": "Suzuki báo cáo: 「昨夜の台風で線路に木が倒れて、運転を見合わせている」(Do bão cây đổ chắn đường ray). Đáp án đúng là B.",
      "keyword": "台風で木が倒れて & 遅れるので",
      "tip": "Mẫu ～ので biểu thị lý do một cách nhẹ nhàng, khách quan, rất thích hợp khi báo cáo công việc."
    },
    {
      "id": "N4_40",
      "level": "N4",
      "lesson": 40,
      "topic": "Bài 40: Nghi vấn từ lồng câu hỏi ～かどうか & Thử nghiệm ～てみます",
      "situation": "Tại cửa hàng thời trang Ginza, khách hàng hỏi nhân viên về kích cỡ áo khoác và thử đồ trước khi mua.",
      "audioText": "サイズが合うかどうか分かりません。試着室で着てみてもいいですか。どうぞ、あちらの部屋でお試しください。ちょうどいいです。",
      "dialogue": [
        {
          "speaker": "Khách hàng",
          "role": "A",
          "kanji": "すみません、このジャケット、サイズが合うかどうか分からないんですが。",
          "kana": "すみません、このじゃけっと、さいずがあうかどうかからないんですが。",
          "vi": "Xin lỗi bạn, chiếc áo khoác này tôi không biết liệu có vừa kích cỡ không."
        },
        {
          "speaker": "Nhân viên",
          "role": "B",
          "kanji": "試着室が空いておりますので、一度着てみてはいかがでしょうか。",
          "kana": "しちゃくしつがあいておりますので、いちどきてみてはいかがでしょうか。",
          "vi": "Phòng thử đồ đang trống đấy ạ, quý khách mặc thử xem sao ạ?"
        },
        {
          "speaker": "Khách hàng",
          "role": "A",
          "kanji": "ありがとうございます。じゃあ、着てみます。",
          "kana": "ありがとうございます。じゃあ、きてみます。",
          "vi": "Cảm ơn em. Vậy để chị mặc thử xem nhé."
        },
        {
          "speaker": "Nhân viên",
          "role": "B",
          "kanji": "いかがですか。肩幅もぴったりで、とてもよくお似合いですよ。",
          "kana": "いかがですか。かたはばもぴったりで、とてもよくおにあいですよ。",
          "vi": "Chị thấy thế nào ạ? Chiều rộng vai vừa khít và tôn dáng chị lắm ạ."
        }
      ],
      "question": "Khách hàng đã làm gì sau khi băn khoăn về kích cỡ chiếc áo khoác?",
      "options": [
        {
          "id": "A",
          "text": "Quyết định không mua và đi về ngay"
        },
        {
          "id": "B",
          "text": "Vào phòng thử đồ mặc thử áo và thấy áo vừa vặn rất đẹp"
        },
        {
          "id": "C",
          "text": "Yêu cầu nhân viên đổi màu sắc khác"
        },
        {
          "id": "D",
          "text": "Xin giảm giá một nửa"
        }
      ],
      "correctAnswer": "B",
      "explanation": "Khách vào phòng thử và nhân viên khen: 「着てみます」「肩幅もぴったりでお似合いです」. Đáp án đúng là B.",
      "keyword": "合うかどうか & 着てみます",
      "tip": "Mẫu ～かどうか lồng một câu hỏi không có từ nghi vấn vào câu lớn mang nghĩa \"liệu có... hay không\"."
    },
    {
      "id": "N4_41",
      "level": "N4",
      "lesson": 41,
      "topic": "Bài 41: Cho nhận hành động với kính ngữ ～ていただきます／てくださいます",
      "situation": "Nhân viên mới bày tỏ lòng biết ơn khi được trưởng phòng tận tình sửa giúp bản báo cáo tiếng Nhật.",
      "audioText": "部長に日本語のレポートを直していただきました。とても親切に教えてくださいました。心から感謝しています。",
      "dialogue": [
        {
          "speaker": "Honda",
          "role": "A",
          "kanji": "木村さん、提出した企画書、もうチェックしてもらえた？",
          "kana": "きむらさん、ていしゅつしたきかくしょ、もうちぇっくしてもらえた？",
          "vi": "Kimura ơi, bản đề án cậu nộp đã được kiểm tra chưa?"
        },
        {
          "speaker": "Kimura",
          "role": "B",
          "kanji": "はい！佐藤部長に丁寧に日本語を直していただきました。",
          "kana": "はい！さとうぶちょうにていねいににほんごをなおしていただきました。",
          "vi": "Dạ rồi! Em đã được đích thân trưởng phòng Sato sửa giúp từng câu tiếng Nhật rất chu đáo ạ."
        },
        {
          "speaker": "Honda",
          "role": "A",
          "kanji": "部長はお忙しいのに、本当に優しい方ですね。",
          "kana": "ぶちょうはおいそがしいのに、ほんとうにやさしいかたですね。",
          "vi": "Trưởng phòng bận rộn thế mà tâm lý và tốt bụng thật đấy."
        },
        {
          "speaker": "Kimura",
          "role": "B",
          "kanji": "ええ、日本のビジネス表現のコツも色々教えてくださいました。",
          "kana": "ええ、にほんのびじねすひょうげんのこつもいろいろおしえてくださいました。",
          "vi": "Vâng ạ, trưởng phòng còn chỉ dạy cho em rất nhiều bí quyết diễn đạt văn phong kinh doanh Nhật Bản nữa."
        }
      ],
      "question": "Trưởng phòng Sato đã làm gì để hỗ trợ nhân viên Kimura?",
      "options": [
        {
          "id": "A",
          "text": "Từ chối xem bản đề án vì quá bận rộn"
        },
        {
          "id": "B",
          "text": "Tận tình sửa lỗi tiếng Nhật và hướng dẫn bí quyết diễn đạt thương mại cho Kimura"
        },
        {
          "id": "C",
          "text": "Yêu cầu Kimura tự đi học thêm khóa tiếng Nhật"
        },
        {
          "id": "D",
          "text": "Giao việc đề án cho đồng nghiệp khác làm thay"
        }
      ],
      "correctAnswer": "B",
      "explanation": "Kimura nói: 「直していただきました」「教えてくださいました」(Được sếp sửa và chỉ dạy). Đáp án đúng là B.",
      "keyword": "直していただきました & 教えてくださいました",
      "tip": "～ていただきます là dạng khiêm nhường của ～てもらいます; ～てくださいます là dạng tôn kính của ～てくれます."
    },
    {
      "id": "N4_42",
      "level": "N4",
      "lesson": 42,
      "topic": "Bài 42: Mục đích hành động ～ために & Công dụng ～のに使います",
      "situation": "Hai bạn trẻ nói về mục tiêu tiết kiệm tiền để du học Nhật Bản và công dụng của cuốn từ điển điện tử.",
      "audioText": "将来自分の会社を作るために、今一生懸命お金を貯めています。このアプリは漢字を調べるのにとても便利ですよ。",
      "dialogue": [
        {
          "speaker": "Tuan",
          "role": "A",
          "kanji": "健太君、最近アルバイトを増やしたそうですね。",
          "kana": "けんたくん、さいきんあるばいとをふやしたそうですね。",
          "vi": "Kenta ơi, nghe nói dạo này cậu nhận làm thêm nhiều ca lắm hả?"
        },
        {
          "speaker": "Kenta",
          "role": "B",
          "kanji": "はい、将来留学するための費用を貯めているんです。",
          "kana": "はい、しょうらいりゅうがくするためのひようをためているんです。",
          "vi": "Ừ, tớ đang cày để dành dụm chi phí phục vụ cho mục đích đi du học sau này."
        },
        {
          "speaker": "Tuan",
          "role": "A",
          "kanji": "目標が明確ですごいですね！このタブレットは何ですか。",
          "kana": "もくひょうがめいかくですごいですね！このたぶれっとはなんですか。",
          "vi": "Có mục tiêu rõ ràng nể thật! Thế chiếc máy tính bảng này dùng để làm gì vậy?"
        },
        {
          "speaker": "Kenta",
          "role": "B",
          "kanji": "これは日本のニュースを聞いたり、単語を暗記するのに使っています。",
          "kana": "これはにほんのにゅーすをきいたり、たんごをあんきするのにつかっています。",
          "vi": "Chiếc này tớ chuyên dùng cho việc nghe tin tức tiếng Nhật và ghi nhớ từ vựng đấy."
        }
      ],
      "question": "Mục đích Kenta làm thêm tích lũy tiền là gì?",
      "options": [
        {
          "id": "A",
          "text": "Để mua chiếc xe ô tô thể thao mới"
        },
        {
          "id": "B",
          "text": "Để chuẩn bị trang trải chi phí cho dự định đi du học trong tương lai"
        },
        {
          "id": "C",
          "text": "Để mở quán trà sữa cùng bạn bè"
        },
        {
          "id": "D",
          "text": "Để mua vé đi xem hòa nhạc thần tượng"
        }
      ],
      "correctAnswer": "B",
      "explanation": "Kenta khẳng định: 「将来留学するための費用を貯めているんです」(Tiết kiệm chi phí cho mục đích du học). Đáp án đúng là B.",
      "keyword": "留学するために & 暗記するのに",
      "tip": "N / V-thông thường + ために chỉ mục đích có ý chí cao; V-ru + のに使います chỉ công dụng của đồ vật."
    },
    {
      "id": "N4_43",
      "level": "N4",
      "lesson": 43,
      "topic": "Bài 43: Dự đoán biến đổi sắp xảy ra ～そうです (Trông có vẻ / Sắp sửa)",
      "situation": "Trời bắt đầu nổi gió đen kịt, hai người đi bộ ngoài phố hối hả tìm chỗ trú chân vì trời sắp mưa to.",
      "audioText": "空が暗くなって、今にも雨が降りそうですね。あのカフェに入りましょう。ケーキも美味しそうですよ。",
      "dialogue": [
        {
          "speaker": "Mai",
          "role": "A",
          "kanji": "急に冷たい風が吹いてきましたね。空が真っ暗です。",
          "kana": "きゅうにつめたいかぜがふいてきましたね。そらがまっくらです。",
          "vi": "Tự dưng có cơn gió lạnh thổi tới kìa. Bầu trời tối sầm lại rồi."
        },
        {
          "speaker": "Ren",
          "role": "B",
          "kanji": "ええ、今にも大雨が降りそうですよ。早く傘を差しましょう。",
          "kana": "ええ、いまにもおおあめがふりそうですよ。はやくかさをさしましょう。",
          "vi": "Ừ, trông có vẻ trời sắp sửa đổ mưa rào lớn đến nơi rồi đấy. Mở ô nhanh lên."
        },
        {
          "speaker": "Mai",
          "role": "A",
          "kanji": "あそこの喫茶店に入って雨宿りしませんか。ケーキもすごく美味しそうですよ。",
          "kana": "あそこのきっさてんにはいってあまやどりしませんか。けーきもすごくおいしそうですよ。",
          "vi": "Hay mình ghé vào quán cà phê đằng kia trú mưa đi? Bánh ngọt nhìn trông ngon mắt lắm kìa."
        },
        {
          "speaker": "Ren",
          "role": "B",
          "kanji": "賛成です！濡れないうちに急ぎましょう。",
          "kana": "さんせいです！ぬれないうちにいそぎましょう。",
          "vi": "Đồng ý luôn! Mau vào kẻo ướt quần áo nào."
        }
      ],
      "question": "Hai bạn trẻ quan sát thấy hiện tượng gì về thời tiết và đưa ra quyết định gì?",
      "options": [
        {
          "id": "A",
          "text": "Trời nắng gắt nên đi bơi giải nhiệt"
        },
        {
          "id": "B",
          "text": "Trời trông như sắp mưa to nên quyết định vào quán cà phê trú mưa và thưởng thức bánh ngon"
        },
        {
          "id": "C",
          "text": "Trời có tuyết rơi nên đứng lại chụp hình"
        },
        {
          "id": "D",
          "text": "Tiếp tục đi bộ trong mưa mà không cần ô"
        }
      ],
      "correctAnswer": "B",
      "explanation": "Ren nhận xét: 「今にも雨が降りそう」(Sắp mưa to) và Mai rủ 「喫茶店に入って雨宿りしましょう」. Đáp án đúng là B.",
      "keyword": "降りそう (ふりそう) & 美味しそう (おいしそう)",
      "tip": "V-masu bỏ masu + そうです diễn tả phán đoán dựa trên thị giác về sự việc sắp xảy ra trong khoảnh khắc."
    },
    {
      "id": "N4_44",
      "level": "N4",
      "lesson": 44,
      "topic": "Bài 44: Quá mức ～すぎます & Dễ làm ～やすい／Khó làm ～にくい",
      "situation": "Tại tiệc tất niên công ty, đồng nghiệp khuyên nhau ăn uống điều độ và chọn loại thuốc tiêu hóa dễ uống.",
      "audioText": "昨日お酒を飲みすぎました。頭が痛いです。この胃腸薬は小さくて飲みやすいですよ。お大事に。",
      "dialogue": [
        {
          "speaker": "Togashi",
          "role": "A",
          "kanji": "大野さん、顔色が青いですよ。どうかしたんですか。",
          "kana": "おおのさん、かおいろがあおいですよ。どうかしたんですか。",
          "vi": "Anh Ohno ơi, sắc mặt anh xanh xao quá. Có chuyện gì thế anh?"
        },
        {
          "speaker": "Ohno",
          "role": "B",
          "kanji": "昨日の忘年会で、楽しくてついお酒を飲みすぎてしまったんです。",
          "kana": "きのうのぼうねんかいで、たのしくてついおさけをのみすぎてしまったんです。",
          "vi": "Tối qua đi tiệc tất niên vui quá nên tôi lỡ chén uống quá chén mất rồi."
        },
        {
          "speaker": "Togashi",
          "role": "A",
          "kanji": "胃も痛いですか。この胃薬をどうぞ。粒が小さくてとても飲みやすいですよ。",
          "kana": "いもいたいですか。このいぐすりをどうぞ。つぶがちいさくてとてものみやすいですよ。",
          "vi": "Dạ dày có đau không? Anh uống thuốc dạ dày này đi, viên nhỏ cực kỳ dễ uống."
        },
        {
          "speaker": "Ohno",
          "role": "B",
          "kanji": "ありがとうございます。助かります。",
          "kana": "ありがとうございます。たすかります。",
          "vi": "Cảm ơn cậu nhiều. May quá có cậu cứu nguy."
        }
      ],
      "question": "Tại sao anh Ohno lại bị mệt mỏi và đau đầu vào sáng nay?",
      "options": [
        {
          "id": "A",
          "text": "Vì bị thức trắng đêm làm thêm giờ"
        },
        {
          "id": "B",
          "text": "Vì uống quá chén tại buổi tiệc tất niên đêm qua"
        },
        {
          "id": "C",
          "text": "Vì không ăn tối trước khi đi ngủ"
        },
        {
          "id": "D",
          "text": "Vì bị sốt siêu vi"
        }
      ],
      "correctAnswer": "B",
      "explanation": "Ohno thừa nhận: 「お酒を飲みすぎてしまった」(Uống quá chén nhiều rượu). Đáp án đúng là B.",
      "keyword": "飲みすぎました & 飲みやすい",
      "tip": "V-masu bỏ masu + すぎます thể hiện tính chất vượt quá mức bình thường, mang lại kết quả tiêu cực."
    },
    {
      "id": "N4_45",
      "level": "N4",
      "lesson": 45,
      "topic": "Bài 45: Trường hợp khẩn cấp ～ばあいは & Bất chấp mong đợi ～のに",
      "situation": "Hướng dẫn viên du lịch phổ biến cách xử lý khi thất lạc hộ chiếu hoặc xảy ra động đất bất ngờ.",
      "audioText": "パスポートを紛失した場合は、すぐに警察と大使館に連絡してください。一生懸命探したのに見つかりませんでした。",
      "dialogue": [
        {
          "speaker": "HDV",
          "role": "A",
          "kanji": "皆さん、万が一旅行中にパスポートを落とした場合は、直ちに私か警察にお知らせください。",
          "kana": "みなさん、まんがいちりょこうちゅうにぱすぽーとをおとしたばあいは、ただちにわたしかけいさつにおしらせください。",
          "vi": "Mọi người lưu ý, trong trường hợp rủi ro đánh rơi hộ chiếu trong chuyến đi, hãy lập tức báo ngay cho tôi hoặc cảnh sát."
        },
        {
          "speaker": "Khách",
          "role": "B",
          "kanji": "昨日あんなに探したのに、私の財布が見つからないんです。",
          "kana": "きのうあんなにさがしたのに、わたしのさいふがみつからないんです。",
          "vi": "Hôm qua em cất công tìm kỹ thế mà chiếc ví tiền vẫn chẳng thấy đâu cả."
        },
        {
          "speaker": "HDV",
          "role": "A",
          "kanji": "ホテルにも問い合わせてみましょう。心配しないでくださいね。",
          "kana": "ほてるにもといあわせてみましょう。しんぱいしないでくださいね。",
          "vi": "Để tôi gọi điện hỏi lễ tân khách sạn xem sao. Em đừng quá lo lắng nhé."
        }
      ],
      "question": "Hướng dẫn viên căn dặn du khách phải làm gì trong trường hợp bị thất lạc hộ chiếu?",
      "options": [
        {
          "id": "A",
          "text": "Tự bỏ tiền mua vé máy bay về nước ngay lập tức"
        },
        {
          "id": "B",
          "text": "Thông báo ngay tức khắc cho hướng dẫn viên hoặc cơ quan công an cảnh sát"
        },
        {
          "id": "C",
          "text": "Ngồi yên tại khách sạn không đi đâu"
        },
        {
          "id": "D",
          "text": "Chờ đợi sau khi kết thúc chuyến đi mới giải quyết"
        }
      ],
      "correctAnswer": "B",
      "explanation": "HDV căn dặn: 「パスポートを落とした場合は、直ちに私か警察にお知らせください」. Đáp án đúng là B.",
      "keyword": "落とした場合は & 探したのに",
      "tip": "～ばあいは (場合は) dùng trong các văn bản thông báo hoặc quy định chỉ trường hợp cụ thể có thể xảy ra."
    },
    {
      "id": "N4_46",
      "level": "N4",
      "lesson": 46,
      "topic": "Bài 46: Thời điểm chính xác ～ところ & Vừa mới hoàn tất ～ばかり",
      "situation": "Tại nhà ga Shinjuku, hai người bạn gọi điện thoại xác nhận vị trí gặp mặt trước cổng soát vé.",
      "audioText": "今改札口を出たところです。私はたった今着いたばかりですから、緑の窓口の前で待っていますね。",
      "dialogue": [
        {
          "speaker": "Linh",
          "role": "A",
          "kanji": "もしもし、健太君？今どこにいるの？",
          "kana": "もしもし、けんたくん？いまどこにいるの？",
          "vi": "Alo, Kenta à? Cậu đang ở đâu thế?"
        },
        {
          "speaker": "Kenta",
          "role": "B",
          "kanji": "今ちょうど電車の改札を出たところだよ！そっちは？",
          "kana": "いまちょうどでんしゃのかいさつをでたところだよ！そっちは？",
          "vi": "Tớ vừa mới đúng lúc bước ra khỏi cửa soát vé tàu điện này! Cậu đâu rồi?"
        },
        {
          "speaker": "Linh",
          "role": "A",
          "kanji": "私も二分前に駅に着いたばかりなの。JRのみどりの窓口の前に立っているよ。",
          "kana": "わたしもにふんまえにえきについたばかりなの。じぇいあーるのみどりのまどぐちのまえにたっているよ。",
          "vi": "Tớ cũng vừa mới đặt chân tới ga cách đây 2 phút thôi. Tớ đang đứng trước quầy bán vé Midori của JR này."
        },
        {
          "speaker": "Kenta",
          "role": "B",
          "kanji": "了解！すぐそこに行くね。",
          "kana": "りょうかい！すぐそこにいくね。",
          "vi": "Đã rõ! Tớ chạy qua ngay đó đây."
        }
      ],
      "question": "Vị trí hiện tại của bạn Linh và bạn Kenta đang ở đâu?",
      "options": [
        {
          "id": "A",
          "text": "Cả hai bạn vẫn đang còn ngồi trên tàu điện ngầm"
        },
        {
          "id": "B",
          "text": "Kenta vừa bước ra khỏi cửa soát vé, Linh vừa tới ga và đang đợi ở quầy Midori no Madoguchi"
        },
        {
          "id": "C",
          "text": "Linh đang ngồi trong quán cà phê tầng 2"
        },
        {
          "id": "D",
          "text": "Kenta bị lạc đường ở lối ra phía Tây"
        }
      ],
      "correctAnswer": "B",
      "explanation": "Kenta nói: 「改札を出たところ」 và Linh nói 「着いたばかりで、みどりの窓口の前に立っている」. Đáp án đúng là B.",
      "keyword": "出たところ & 着いたばかり",
      "tip": "V-た + ところ là hành động vừa kết thúc trong tích tắc; V-た + ばかり là sự việc theo cảm nhận người nói vừa mới xảy ra chưa lâu."
    },
    {
      "id": "N4_47",
      "level": "N4",
      "lesson": 47,
      "topic": "Bài 47: Truyền đạt nghe đồn ～そうです & Suy đoán có cơ sở ～ようです",
      "situation": "Giờ nghỉ trưa, các nhân viên bàn luận về tin đồn mở thêm chi nhánh mới tại Đà Nẵng của công ty.",
      "audioText": "天気予報によると、明日は暖かくなるそうです。ベトナムに新しい支社ができるようですね。楽しみです。",
      "dialogue": [
        {
          "speaker": "Yoshida",
          "role": "A",
          "kanji": "ニュースによると、来年我が社はベトナムのダナンに新支社を設立するそうですよ。",
          "kana": "にゅーすによると、らいねんわがしゃはべとなむのだなんにしんししゃをせつりつするそうですよ。",
          "vi": "Theo bản tin nội bộ, nghe nói sang năm công ty chúng ta sẽ thành lập thêm chi nhánh mới tại Đà Nẵng, Việt Nam đấy."
        },
        {
          "speaker": "Nakano",
          "role": "B",
          "kanji": "本当ですか。社長も最近ベトナム出張が多いようですし、本当かもしれませんね。",
          "kana": "ほんとうですか。しゃちょうもさいきんべとなむしゅっちょうがおおいようですし、ほんとうかもしれませんね。",
          "vi": "Thật thế ạ? Dạo này thấy giám đốc đi công tác Việt Nam nhiều chuyến, có vẻ đúng là như vậy rồi."
        },
        {
          "speaker": "Yoshida",
          "role": "A",
          "kanji": "ベトナム語ができる社員を募集するそうだから、応募してみたら？",
          "kana": "べとなむごができるしゃいんをぼしゅうするそうだから、おうぼしてみたら？",
          "vi": "Nghe nói sẽ tuyển chọn nhân viên biết tiếng Việt, cậu thử nộp đơn ứng tuyển xem?"
        }
      ],
      "question": "Thông tin nghe đồn về kế hoạch mở rộng của công ty là gì?",
      "options": [
        {
          "id": "A",
          "text": "Đóng cửa toàn bộ chi nhánh ở nước ngoài"
        },
        {
          "id": "B",
          "text": "Nghe nói sang năm công ty sẽ thành lập chi nhánh mới tại Đà Nẵng và tuyển chọn nhân sự"
        },
        {
          "id": "C",
          "text": "Giám đốc sắp nghỉ hưu"
        },
        {
          "id": "D",
          "text": "Công ty chuyển trụ sở chính về Tokyo"
        }
      ],
      "correctAnswer": "B",
      "explanation": "Yoshida truyền đạt: 「ダナンに新支社を設立するそうですよ」(Nghe nói mở chi nhánh tại Đà Nẵng). Đáp án đúng là B.",
      "keyword": "設立するそう & 多いよう",
      "tip": "～によると + Thể thông thường + そうです dùng để trích dẫn nguồn tin khách quan nghe được từ báo đài, người khác."
    },
    {
      "id": "N4_48",
      "level": "N4",
      "lesson": 48,
      "topic": "Bài 48: Thể sai khiến (使役形) & Cho phép làm việc",
      "situation": "Nhân viên xin phép trưởng ban cho về sớm vì con nhỏ bị sốt cần đưa đi bệnh viện khám.",
      "audioText": "子供が熱を出したので、今日は早く帰らせていただけませんか。それは大変だね。早く行ってあげなさい。",
      "dialogue": [
        {
          "speaker": "Ogawa",
          "role": "A",
          "kanji": "課長、今保育園から電話がありまして、娘が高熱を出したそうなんです。",
          "kana": "かちょう、いまほいくえんからでんわがありまして、むすめがこうねつをだしたそうなんです。",
          "vi": "Dạ thưa trưởng phòng, bên nhà trẻ vừa gọi điện báo tin con gái em bị sốt cao đột ngột ạ."
        },
        {
          "speaker": "Trưởng ban",
          "role": "B",
          "kanji": "それは心配だな。大丈夫かい？",
          "kana": "それはしんぱいだな。だいじょうぶかい？",
          "vi": "Ôi lo quá. Cháu có sao không em?"
        },
        {
          "speaker": "Ogawa",
          "role": "A",
          "kanji": "申し訳ありませんが、本日は一時間早く帰らせていただけないでしょうか。",
          "kana": "もうしわけありませんが、ほんじつはいちじかんはやくかえらせていただけないでしょうか。",
          "vi": "Em rất xin lỗi, chiều nay anh có thể cho phép em được về sớm 1 tiếng để đưa cháu đi viện không ạ?"
        },
        {
          "speaker": "Trưởng ban",
          "role": "B",
          "kanji": "もちろん構わないよ。残りの業務はこちらで引き受けるから、すぐに行ってあげなさい。",
          "kana": "もちろんかまわないよ。のこりのぎょうむはこちらでひきうけるから、すぐにいってあげなさい。",
          "vi": "Tất nhiên là được rồi. Công việc còn lại ở đây anh lo, em mau về lo cho cháu đi."
        }
      ],
      "question": "Anh Ogawa đã xin phép cấp trên điều gì?",
      "options": [
        {
          "id": "A",
          "text": "Xin tăng lương tháng"
        },
        {
          "id": "B",
          "text": "Xin phép được về sớm 1 tiếng để đưa con gái đang sốt cao đi khám bệnh"
        },
        {
          "id": "C",
          "text": "Xin nghỉ phép du lịch cả tuần"
        },
        {
          "id": "D",
          "text": "Xin phép chuyển sang bộ phận khác"
        }
      ],
      "correctAnswer": "B",
      "explanation": "Ogawa thưa: 「早く帰らせていただけないでしょうか」(Cho phép em về sớm). Đáp án đúng là B.",
      "keyword": "帰らせていただけないでしょうか",
      "tip": "V-sai khiến (使役形) thể て + いただけませんか là cách nói xin phép người trên cho phép mình thực hiện một hành động vô cùng lịch sự."
    },
    {
      "id": "N4_49",
      "level": "N4",
      "lesson": 49,
      "topic": "Bài 49: Tôn kính ngữ (尊敬語) & Giao tiếp khách hàng cao cấp",
      "situation": "Nhân viên lễ tân khách sạn đón tiếp giám đốc đối tác và xác nhận thông tin đặt phòng thương gia.",
      "audioText": "社長様、本日は遠方よりお越しいただきありがとうございます。こちらにお名前をご記入いただけますでしょうか。",
      "dialogue": [
        {
          "speaker": "Lễ tân",
          "role": "A",
          "kanji": "いらっしゃいませ。ABC商事の木村社長でいらっしゃいますね。",
          "kana": "いらっしゃいませ。えーびーしーしょうじのきむらしゃちょうでいらっしゃいますね。",
          "vi": "Kính chào quý khách. Ngài là Giám đốc Kimura của tập đoàn thương mại ABC phải không ạ?"
        },
        {
          "speaker": "Kimura",
          "role": "B",
          "kanji": "ええ、予約していた木村です。",
          "kana": "ええ、よやくしていたきむらです。",
          "vi": "Vâng, tôi là Kimura đã đặt phòng trước."
        },
        {
          "speaker": "Lễ tân",
          "role": "A",
          "kanji": "本日は長旅でお疲れのところ、お越しいただき誠にありがとうございます。",
          "kana": "ほんじつはながたびでおつかれのところ、おこしいただきまことにありがとうございます。",
          "vi": "Chuyến đi xa chắc ngài đã mệt, chúng tôi chân thành cảm ơn ngài đã hạ cố ghé thăm khách sạn."
        },
        {
          "speaker": "Lễ tân",
          "role": "A",
          "kanji": "恐れ入りますが、こちらの用紙にお名前とご住所をお書きくださいますか。",
          "kana": "おそれいりますが、こちらのようしにおなまえとごじゅうしょをおかきくださいますか。",
          "vi": "Xin mạn phép kính nhờ ngài vui lòng viết tên và địa chỉ vào phiếu đăng ký này ạ."
        }
      ],
      "question": "Nhân viên lễ tân đã sử dụng các từ ngữ tôn kính nào khi tiếp đón giám đốc Kimura?",
      "options": [
        {
          "id": "A",
          "text": "Sử dụng thể thông thường thân mật như với bạn học"
        },
        {
          "id": "B",
          "text": "Dùng các từ tôn kính như: でいらっしゃいます, お越しいただき, お書きくださいますか"
        },
        {
          "id": "C",
          "text": "Nói tiếng Anh hoàn toàn"
        },
        {
          "id": "D",
          "text": "Chỉ chào hỏi qua loa rồi đi vào trong"
        }
      ],
      "correctAnswer": "B",
      "explanation": "Lễ tân dùng các hình thức tôn kính ngữ mẫu mực: 「いらっしゃいます」「お越しいただき」「お書きくださいますか」. Đáp án đúng là B.",
      "keyword": "お越しいただき & お書きくださいますか",
      "tip": "Tôn kính ngữ (尊敬語) nâng cao vị thế và hành động của đối phương, khách hàng và cấp trên."
    },
    {
      "id": "N4_50",
      "level": "N4",
      "lesson": 50,
      "topic": "Bài 50: Khiêm nhường ngữ (謙譲語) & Văn hóa ứng xử thương mại",
      "situation": "Nhân viên đại diện công ty đến văn phòng đối tác bàn giao hợp đồng và giới thiệu bản thân khiêm tốn.",
      "audioText": "私、グエンと申します。契約書をお届けに参りました。社長にお目にかかれて光栄に存じます。",
      "dialogue": [
        {
          "speaker": "Nguyễn",
          "role": "A",
          "kanji": "初めまして。ハイパー株式会社の営業部から参りましたグエンと申します。",
          "kana": "はじめまして。はいぱーかぶしきがいしゃのえいぎょうぶからまいりましたぐえんともうします。",
          "vi": "Kính chào ngài. Tôi tên là Nguyễn, đến từ phòng Kinh doanh của công ty cổ phần HYPER."
        },
        {
          "speaker": "Đối tác",
          "role": "B",
          "kanji": "わざわざご足労いただき恐縮です。どうぞお掛けください。",
          "kana": "わざわざごそくろういただききょうしゅくです。どうぞおかてください。",
          "vi": "Anh không quản ngại đường sá ghé thăm, quý hóa quá. Mời anh ngồi."
        },
        {
          "speaker": "Nguyễn",
          "role": "A",
          "kanji": "本日は最新の企画書をお持ちいたしました。後ほど拝見していただければ幸いです。",
          "kana": "ほんじつはさいしんのきかくしょをおもちいたしました。のちほどはいけんしていただければさいわいです。",
          "vi": "Hôm nay tôi xin phép được kính trình bản kế hoạch mới nhất. Rất mong lát nữa ngài xem qua giúp ạ."
        },
        {
          "speaker": "Nguyễn",
          "role": "A",
          "kanji": "今後とも何卒よろしくお願い申し上げます。",
          "kana": "こんごともなにとぞよろしくおねがいもうしあげます。",
          "vi": "Từ nay về sau, kính mong nhận được sự hợp tác và giúp đỡ quý báu của quý công ty."
        }
      ],
      "question": "Anh Nguyễn đã thể hiện thái độ khiêm nhường chuẩn mực như thế nào trong buổi tiếp kiến đối tác?",
      "options": [
        {
          "id": "A",
          "text": "Khen ngợi bản thân là nhân viên giỏi nhất công ty"
        },
        {
          "id": "B",
          "text": "Hạ thấp hành động của mình bằng khiêm nhường ngữ: 申します, 参りました, お持ちいたしました"
        },
        {
          "id": "C",
          "text": "Yêu cầu đối tác phải ký hợp đồng ngay lập tức"
        },
        {
          "id": "D",
          "text": "Đến muộn mà không có lời chào hỏi lịch sự"
        }
      ],
      "correctAnswer": "B",
      "explanation": "Anh Nguyễn sử dụng toàn bộ khiêm nhường ngữ: 「申します」(Tên là), 「参りました」(Đến), 「お持ちいたしました」(Mang đến). Đáp án đúng là B.",
      "keyword": "参りました & お持ちいたしました",
      "tip": "Khiêm nhường ngữ (謙譲語) hạ thấp hành vi của bản thân hoặc người thuộc nhóm mình (In-group) để biểu thị sự tôn trọng tuyệt đối với đối tác."
    }
  ],
  "N3": [
    {
      "id": "N3_1",
      "level": "N3",
      "lesson": 1,
      "topic": "Bài 01: Hỏi thông tin tại quầy hướng dẫn nhà ga Tokyo",
      "situation": "Khách hàng hỏi nhân viên nhà ga Tokyo về tuyến tàu Shinkansen đi Kyoto và cách đặt chỗ trước.",
      "audioText": "すみません、京都行きの新幹線は何番線から出ますか。十四番線から十時三十分発の「のぞみ号」が発車いたします。指定席の空きはありますか。窓側のお席が一席ございます。",
      "dialogue": [
        {
          "speaker": "Khách",
          "role": "A",
          "kanji": "すみません、京都行きの新幹線のホームを教えていただけますか。",
          "kana": "すみません、きょうとゆきのしんかんせんのほーむをおしえていただけますか。",
          "vi": "Xin lỗi, anh có thể chỉ giùm tôi sân ga tàu Shinkansen đi Kyoto được không?"
        },
        {
          "speaker": "Nhân viên ga",
          "role": "B",
          "kanji": "十四番線でございます。十時三十分発ののぞみ号が一番早く到着いたします。",
          "kana": "じゅうよんばんせんでございます。じゅうじさんじゅっぷんはつののぞみごうがいちばんはやくとうちゃくいたします。",
          "vi": "Dạ sân ga số 14. Chuyến tàu Nozomi khởi hành lúc 10h30 là đến nơi nhanh nhất ạ."
        },
        {
          "speaker": "Khách",
          "role": "A",
          "kanji": "今から指定席に変更することは可能ですか。",
          "kana": "いまからしていせきにへんこうすることはかのうですか。",
          "vi": "Bây giờ tôi đổi sang vé ghế đặt trước có được không?"
        },
        {
          "speaker": "Nhân viên ga",
          "role": "B",
          "kanji": "はい、窓側の席にまだ一席空きがございますので、すぐにお手配いたします。",
          "kana": "はい、まどがわのせきにまだいっせきあきがございますので、すぐにおてはいいたします。",
          "vi": "Dạ được, phía hàng ghế cạnh cửa sổ vẫn còn 1 chỗ trống, em làm thủ tục cho quý khách ngay ạ."
        }
      ],
      "question": "Chuyến tàu đi Kyoto nhanh nhất xuất phát từ sân ga nào và tình trạng vé ra sao?",
      "options": [
        {
          "id": "A",
          "text": "Sân ga số 12 và đã hết toàn bộ vé"
        },
        {
          "id": "B",
          "text": "Sân ga số 14, khởi hành lúc 10h30 và còn 1 ghế đặt trước cạnh cửa sổ"
        },
        {
          "id": "C",
          "text": "Sân ga số 10 và chỉ có ghế đứng tự do"
        },
        {
          "id": "D",
          "text": "Tàu bị hủy do thời tiết xấu"
        }
      ],
      "correctAnswer": "B",
      "explanation": "Nhân viên ga thông báo: 「十四番線でございます。窓側の席にまだ一席空きがございます」. Đáp án đúng là B.",
      "keyword": "十四番線 (じゅうよんばんせん) & 指定席 (していせき)",
      "tip": "Trong đề thi N3 Choukai, các thông tin về số sân ga (番線), thời gian khởi hành (発) và loại ghế thường là điểm mấu chốt của câu hỏi."
    },
    {
      "id": "N3_2",
      "level": "N3",
      "lesson": 2,
      "topic": "Bài 02: Thương lượng dời lịch hẹn gặp đối tác kinh doanh",
      "situation": "Nhân viên gọi điện thoại cho khách hàng xin dời lịch họp chiều nay do có sự cố phát sinh.",
      "audioText": "大変申し訳ございません。本日十四時のお約束ですが、緊急の会議が入りまして、明日の同じお時間にご変更いただくことは可能でしょうか。承知いたしました。問題ございません。",
      "dialogue": [
        {
          "speaker": "Mori",
          "role": "A",
          "kanji": "ABC物産の森でございます。いつも大変お世話になっております。",
          "kana": "えーびーしーぶっさんのもりでございます。いつもたいへんおせわになっております。",
          "vi": "Tôi là Mori từ công ty ABC. Rất cảm ơn quý công ty luôn đồng hành cùng chúng tôi."
        },
        {
          "speaker": "Khách",
          "role": "B",
          "kanji": "お世話になっております。森さん、どうされましたか。",
          "kana": "おせわになっております。もりさん、どうされましたか。",
          "vi": "Chào anh Mori, có việc gì phát sinh thế anh?"
        },
        {
          "speaker": "Mori",
          "role": "A",
          "kanji": "誠に勝手を申し上げますが、本日十四時の打ち合わせを明日の同じ時間にご変更いただけないでしょうか。",
          "kana": "まことにかってをもうしあげますが、ほんじつじゅうよじのうちあわせをあすのおなじじかんにごへんこういただけないでしょうか。",
          "vi": "Thật sự mạn phép phiền anh, cuộc hẹn lúc 14h chiều nay liệu có thể cho phép em dời sang cùng giờ ngày mai được không ạ?"
        },
        {
          "speaker": "Khách",
          "role": "B",
          "kanji": "明日の十四時ですね。了解いたしました。では明日お待ちしております。",
          "kana": "あすのじゅうよじですね。りょうかいいたしました。ではあすおまちしております。",
          "vi": "14h chiều mai đúng không anh. Tôi hiểu rồi, vậy chiều mai tôi đợi anh nhé."
        }
      ],
      "question": "Anh Mori đã đề nghị chuyển lịch hẹn sang thời gian nào và đối tác phản hồi ra sao?",
      "options": [
        {
          "id": "A",
          "text": "Hủy bỏ hoàn toàn buổi gặp gỡ"
        },
        {
          "id": "B",
          "text": "Dời sang 14h ngày mai và được đối tác đồng ý vui vẻ"
        },
        {
          "id": "C",
          "text": "Dời sang tuần sau"
        },
        {
          "id": "D",
          "text": "Dời sang tối nay lúc 20h"
        }
      ],
      "correctAnswer": "B",
      "explanation": "Mori đề nghị: 「明日の同じ時間にご変更いただけないでしょうか」 và đối tác đáp: 「了解いたしました」. Đáp án đúng là B.",
      "keyword": "ご変更 (ごへんこう) & 了解 (りょうかい)",
      "tip": "Lắng nghe kỹ từ khóa xác nhận ngày giờ và thái độ đồng ý hay từ chối của người tiếp chuyện."
    },
    {
      "id": "N3_3",
      "level": "N3",
      "lesson": 3,
      "topic": "Bài 03: Thủ tục đăng ký thẻ cư trú tại tòa thị chính",
      "situation": "Tình huống giao tiếp thực tế cấp độ N3 liên quan đến: Thủ tục đăng ký thẻ cư trú tại tòa thị chính.",
      "audioText": "これは日本語能力試験N3の聴解問題です。内容をよく聞いて、正しい答えを一つ選んでください。会話を聞いた後、質問に答えてください。",
      "dialogue": [
        {
          "speaker": "Nhân vật A",
          "role": "A",
          "kanji": "本日のテーマは「Thủ tục đăng ký thẻ cư trú tại tòa thị chính」についてです。",
          "kana": "ほんじつのてーまは「Thủ tục đăng ký thẻ cư trú tại tòa thị chính」についてです。",
          "vi": "Chủ đề của bài học hôm nay xoay quanh: Thủ tục đăng ký thẻ cư trú tại tòa thị chính."
        },
        {
          "speaker": "Nhân vật B",
          "role": "B",
          "kanji": "具体的な注意点や重要なポイントを教えていただけますか。",
          "kana": "ぐたいてきなちゅういてんやじゅうようなぽいんとをおしえていただけますか。",
          "vi": "Bạn có thể chỉ rõ những điểm lưu ý mấu chốt được không?"
        },
        {
          "speaker": "Nhân vật A",
          "role": "A",
          "kanji": "はい、事前の準備と正確な情報確認が最も大切です。",
          "kana": "はい、じぜんのじゅんびとせいかくなじょうほうかくにんがいちばんたいせつです。",
          "vi": "Vâng, chuẩn bị kỹ lưỡng từ trước và xác nhận thông tin chuẩn xác là quan trọng nhất."
        }
      ],
      "question": "Nội dung cốt lõi của đoạn hội thoại về \"Thủ tục đăng ký thẻ cư trú tại tòa thị chính\" là gì?",
      "options": [
        {
          "id": "A",
          "text": "Hủy bỏ toàn bộ kế hoạch đã đề ra"
        },
        {
          "id": "B",
          "text": "Cần chuẩn bị kỹ lưỡng từ trước và xác nhận thông tin chính xác"
        },
        {
          "id": "C",
          "text": "Không cần quan tâm đến các quy định hiện hành"
        },
        {
          "id": "D",
          "text": "Chờ người khác làm thay cho mình"
        }
      ],
      "correctAnswer": "B",
      "explanation": "Nhân vật A nhấn mạnh: 「事前の準備と正確な情報確認が最も大切です」(Chuẩn bị trước và xác nhận chuẩn xác là quan trọng nhất). Đáp án đúng là B.",
      "keyword": "Thủ tục đăng ký thẻ cư trú tại tòa thị chính & 事前準備",
      "tip": "Tập trung bắt các từ nối mang tính kết luận như 「最も大切」「やはり」「結論として」."
    },
    {
      "id": "N3_4",
      "level": "N3",
      "lesson": 4,
      "topic": "Bài 04: Tìm thuê căn hộ qua công ty bất động sản",
      "situation": "Tình huống giao tiếp thực tế cấp độ N3 liên quan đến: Tìm thuê căn hộ qua công ty bất động sản.",
      "audioText": "これは日本語能力試験N3の聴解問題です。内容をよく聞いて、正しい答えを一つ選んでください。会話を聞いた後、質問に答えてください。",
      "dialogue": [
        {
          "speaker": "Nhân vật A",
          "role": "A",
          "kanji": "本日のテーマは「Tìm thuê căn hộ qua công ty bất động sản」についてです。",
          "kana": "ほんじつのてーまは「Tìm thuê căn hộ qua công ty bất động sản」についてです。",
          "vi": "Chủ đề của bài học hôm nay xoay quanh: Tìm thuê căn hộ qua công ty bất động sản."
        },
        {
          "speaker": "Nhân vật B",
          "role": "B",
          "kanji": "具体的な注意点や重要なポイントを教えていただけますか。",
          "kana": "ぐたいてきなちゅういてんやじゅうようなぽいんとをおしえていただけますか。",
          "vi": "Bạn có thể chỉ rõ những điểm lưu ý mấu chốt được không?"
        },
        {
          "speaker": "Nhân vật A",
          "role": "A",
          "kanji": "はい、事前の準備と正確な情報確認が最も大切です。",
          "kana": "はい、じぜんのじゅんびとせいかくなじょうほうかくにんがいちばんたいせつです。",
          "vi": "Vâng, chuẩn bị kỹ lưỡng từ trước và xác nhận thông tin chuẩn xác là quan trọng nhất."
        }
      ],
      "question": "Nội dung cốt lõi của đoạn hội thoại về \"Tìm thuê căn hộ qua công ty bất động sản\" là gì?",
      "options": [
        {
          "id": "A",
          "text": "Hủy bỏ toàn bộ kế hoạch đã đề ra"
        },
        {
          "id": "B",
          "text": "Cần chuẩn bị kỹ lưỡng từ trước và xác nhận thông tin chính xác"
        },
        {
          "id": "C",
          "text": "Không cần quan tâm đến các quy định hiện hành"
        },
        {
          "id": "D",
          "text": "Chờ người khác làm thay cho mình"
        }
      ],
      "correctAnswer": "B",
      "explanation": "Nhân vật A nhấn mạnh: 「事前の準備と正確な情報確認が最も大切です」(Chuẩn bị trước và xác nhận chuẩn xác là quan trọng nhất). Đáp án đúng là B.",
      "keyword": "Tìm thuê căn hộ qua công ty bất động sản & 事前準備",
      "tip": "Tập trung bắt các từ nối mang tính kết luận như 「最も大切」「やはり」「結論として」."
    },
    {
      "id": "N3_5",
      "level": "N3",
      "lesson": 5,
      "topic": "Bài 05: Phỏng vấn xin việc làm thêm tại quán ăn gia đình",
      "situation": "Tình huống giao tiếp thực tế cấp độ N3 liên quan đến: Phỏng vấn xin việc làm thêm tại quán ăn gia đình.",
      "audioText": "これは日本語能力試験N3の聴解問題です。内容をよく聞いて、正しい答えを一つ選んでください。会話を聞いた後、質問に答えてください。",
      "dialogue": [
        {
          "speaker": "Nhân vật A",
          "role": "A",
          "kanji": "本日のテーマは「Phỏng vấn xin việc làm thêm tại quán ăn gia đình」についてです。",
          "kana": "ほんじつのてーまは「Phỏng vấn xin việc làm thêm tại quán ăn gia đình」についてです。",
          "vi": "Chủ đề của bài học hôm nay xoay quanh: Phỏng vấn xin việc làm thêm tại quán ăn gia đình."
        },
        {
          "speaker": "Nhân vật B",
          "role": "B",
          "kanji": "具体的な注意点や重要なポイントを教えていただけますか。",
          "kana": "ぐたいてきなちゅういてんやじゅうようなぽいんとをおしえていただけますか。",
          "vi": "Bạn có thể chỉ rõ những điểm lưu ý mấu chốt được không?"
        },
        {
          "speaker": "Nhân vật A",
          "role": "A",
          "kanji": "はい、事前の準備と正確な情報確認が最も大切です。",
          "kana": "はい、じぜんのじゅんびとせいかくなじょうほうかくにんがいちばんたいせつです。",
          "vi": "Vâng, chuẩn bị kỹ lưỡng từ trước và xác nhận thông tin chuẩn xác là quan trọng nhất."
        }
      ],
      "question": "Nội dung cốt lõi của đoạn hội thoại về \"Phỏng vấn xin việc làm thêm tại quán ăn gia đình\" là gì?",
      "options": [
        {
          "id": "A",
          "text": "Hủy bỏ toàn bộ kế hoạch đã đề ra"
        },
        {
          "id": "B",
          "text": "Cần chuẩn bị kỹ lưỡng từ trước và xác nhận thông tin chính xác"
        },
        {
          "id": "C",
          "text": "Không cần quan tâm đến các quy định hiện hành"
        },
        {
          "id": "D",
          "text": "Chờ người khác làm thay cho mình"
        }
      ],
      "correctAnswer": "B",
      "explanation": "Nhân vật A nhấn mạnh: 「事前の準備と正確な情報確認が最も大切です」(Chuẩn bị trước và xác nhận chuẩn xác là quan trọng nhất). Đáp án đúng là B.",
      "keyword": "Phỏng vấn xin việc làm thêm tại quán ăn gia đình & 事前準備",
      "tip": "Tập trung bắt các từ nối mang tính kết luận như 「最も大切」「やはり」「結論として」."
    },
    {
      "id": "N3_6",
      "level": "N3",
      "lesson": 6,
      "topic": "Bài 06: Thảo luận phương án phân loại và tái chế rác thải",
      "situation": "Tình huống giao tiếp thực tế cấp độ N3 liên quan đến: Thảo luận phương án phân loại và tái chế rác thải.",
      "audioText": "これは日本語能力試験N3の聴解問題です。内容をよく聞いて、正しい答えを一つ選んでください。会話を聞いた後、質問に答えてください。",
      "dialogue": [
        {
          "speaker": "Nhân vật A",
          "role": "A",
          "kanji": "本日のテーマは「Thảo luận phương án phân loại và tái chế rác thải」についてです。",
          "kana": "ほんじつのてーまは「Thảo luận phương án phân loại và tái chế rác thải」についてです。",
          "vi": "Chủ đề của bài học hôm nay xoay quanh: Thảo luận phương án phân loại và tái chế rác thải."
        },
        {
          "speaker": "Nhân vật B",
          "role": "B",
          "kanji": "具体的な注意点や重要なポイントを教えていただけますか。",
          "kana": "ぐたいてきなちゅういてんやじゅうようなぽいんとをおしえていただけますか。",
          "vi": "Bạn có thể chỉ rõ những điểm lưu ý mấu chốt được không?"
        },
        {
          "speaker": "Nhân vật A",
          "role": "A",
          "kanji": "はい、事前の準備と正確な情報確認が最も大切です。",
          "kana": "はい、じぜんのじゅんびとせいかくなじょうほうかくにんがいちばんたいせつです。",
          "vi": "Vâng, chuẩn bị kỹ lưỡng từ trước và xác nhận thông tin chuẩn xác là quan trọng nhất."
        }
      ],
      "question": "Nội dung cốt lõi của đoạn hội thoại về \"Thảo luận phương án phân loại và tái chế rác thải\" là gì?",
      "options": [
        {
          "id": "A",
          "text": "Hủy bỏ toàn bộ kế hoạch đã đề ra"
        },
        {
          "id": "B",
          "text": "Cần chuẩn bị kỹ lưỡng từ trước và xác nhận thông tin chính xác"
        },
        {
          "id": "C",
          "text": "Không cần quan tâm đến các quy định hiện hành"
        },
        {
          "id": "D",
          "text": "Chờ người khác làm thay cho mình"
        }
      ],
      "correctAnswer": "B",
      "explanation": "Nhân vật A nhấn mạnh: 「事前の準備と正確な情報確認が最も大切です」(Chuẩn bị trước và xác nhận chuẩn xác là quan trọng nhất). Đáp án đúng là B.",
      "keyword": "Thảo luận phương án phân loại và tái chế rác thải & 事前準備",
      "tip": "Tập trung bắt các từ nối mang tính kết luận như 「最も大切」「やはり」「結論として」."
    },
    {
      "id": "N3_7",
      "level": "N3",
      "lesson": 7,
      "topic": "Bài 07: Xử lý sự cố thẻ ngân hàng bị nuốt tại cây ATM",
      "situation": "Tình huống giao tiếp thực tế cấp độ N3 liên quan đến: Xử lý sự cố thẻ ngân hàng bị nuốt tại cây ATM.",
      "audioText": "これは日本語能力試験N3の聴解問題です。内容をよく聞いて、正しい答えを一つ選んでください。会話を聞いた後、質問に答えてください。",
      "dialogue": [
        {
          "speaker": "Nhân vật A",
          "role": "A",
          "kanji": "本日のテーマは「Xử lý sự cố thẻ ngân hàng bị nuốt tại cây ATM」についてです。",
          "kana": "ほんじつのてーまは「Xử lý sự cố thẻ ngân hàng bị nuốt tại cây ATM」についてです。",
          "vi": "Chủ đề của bài học hôm nay xoay quanh: Xử lý sự cố thẻ ngân hàng bị nuốt tại cây ATM."
        },
        {
          "speaker": "Nhân vật B",
          "role": "B",
          "kanji": "具体的な注意点や重要なポイントを教えていただけますか。",
          "kana": "ぐたいてきなちゅういてんやじゅうようなぽいんとをおしえていただけますか。",
          "vi": "Bạn có thể chỉ rõ những điểm lưu ý mấu chốt được không?"
        },
        {
          "speaker": "Nhân vật A",
          "role": "A",
          "kanji": "はい、事前の準備と正確な情報確認が最も大切です。",
          "kana": "はい、じぜんのじゅんびとせいかくなじょうほうかくにんがいちばんたいせつです。",
          "vi": "Vâng, chuẩn bị kỹ lưỡng từ trước và xác nhận thông tin chuẩn xác là quan trọng nhất."
        }
      ],
      "question": "Nội dung cốt lõi của đoạn hội thoại về \"Xử lý sự cố thẻ ngân hàng bị nuốt tại cây ATM\" là gì?",
      "options": [
        {
          "id": "A",
          "text": "Hủy bỏ toàn bộ kế hoạch đã đề ra"
        },
        {
          "id": "B",
          "text": "Cần chuẩn bị kỹ lưỡng từ trước và xác nhận thông tin chính xác"
        },
        {
          "id": "C",
          "text": "Không cần quan tâm đến các quy định hiện hành"
        },
        {
          "id": "D",
          "text": "Chờ người khác làm thay cho mình"
        }
      ],
      "correctAnswer": "B",
      "explanation": "Nhân vật A nhấn mạnh: 「事前の準備と正確な情報確認が最も大切です」(Chuẩn bị trước và xác nhận chuẩn xác là quan trọng nhất). Đáp án đúng là B.",
      "keyword": "Xử lý sự cố thẻ ngân hàng bị nuốt tại cây ATM & 事前準備",
      "tip": "Tập trung bắt các từ nối mang tính kết luận như 「最も大切」「やはり」「結論として」."
    },
    {
      "id": "N3_8",
      "level": "N3",
      "lesson": 8,
      "topic": "Bài 08: Báo cáo tiến độ hoàn thành dự án phần mềm",
      "situation": "Tình huống giao tiếp thực tế cấp độ N3 liên quan đến: Báo cáo tiến độ hoàn thành dự án phần mềm.",
      "audioText": "これは日本語能力試験N3の聴解問題です。内容をよく聞いて、正しい答えを一つ選んでください。会話を聞いた後、質問に答えてください。",
      "dialogue": [
        {
          "speaker": "Nhân vật A",
          "role": "A",
          "kanji": "本日のテーマは「Báo cáo tiến độ hoàn thành dự án phần mềm」についてです。",
          "kana": "ほんじつのてーまは「Báo cáo tiến độ hoàn thành dự án phần mềm」についてです。",
          "vi": "Chủ đề của bài học hôm nay xoay quanh: Báo cáo tiến độ hoàn thành dự án phần mềm."
        },
        {
          "speaker": "Nhân vật B",
          "role": "B",
          "kanji": "具体的な注意点や重要なポイントを教えていただけますか。",
          "kana": "ぐたいてきなちゅういてんやじゅうようなぽいんとをおしえていただけますか。",
          "vi": "Bạn có thể chỉ rõ những điểm lưu ý mấu chốt được không?"
        },
        {
          "speaker": "Nhân vật A",
          "role": "A",
          "kanji": "はい、事前の準備と正確な情報確認が最も大切です。",
          "kana": "はい、じぜんのじゅんびとせいかくなじょうほうかくにんがいちばんたいせつです。",
          "vi": "Vâng, chuẩn bị kỹ lưỡng từ trước và xác nhận thông tin chuẩn xác là quan trọng nhất."
        }
      ],
      "question": "Nội dung cốt lõi của đoạn hội thoại về \"Báo cáo tiến độ hoàn thành dự án phần mềm\" là gì?",
      "options": [
        {
          "id": "A",
          "text": "Hủy bỏ toàn bộ kế hoạch đã đề ra"
        },
        {
          "id": "B",
          "text": "Cần chuẩn bị kỹ lưỡng từ trước và xác nhận thông tin chính xác"
        },
        {
          "id": "C",
          "text": "Không cần quan tâm đến các quy định hiện hành"
        },
        {
          "id": "D",
          "text": "Chờ người khác làm thay cho mình"
        }
      ],
      "correctAnswer": "B",
      "explanation": "Nhân vật A nhấn mạnh: 「事前の準備と正確な情報確認が最も大切です」(Chuẩn bị trước và xác nhận chuẩn xác là quan trọng nhất). Đáp án đúng là B.",
      "keyword": "Báo cáo tiến độ hoàn thành dự án phần mềm & 事前準備",
      "tip": "Tập trung bắt các từ nối mang tính kết luận như 「最も大切」「やはり」「結論として」."
    },
    {
      "id": "N3_9",
      "level": "N3",
      "lesson": 9,
      "topic": "Bài 09: Thảo luận về phong cách làm việc từ xa",
      "situation": "Tình huống giao tiếp thực tế cấp độ N3 liên quan đến: Thảo luận về phong cách làm việc từ xa.",
      "audioText": "これは日本語能力試験N3の聴解問題です。内容をよく聞いて、正しい答えを一つ選んでください。会話を聞いた後、質問に答えてください。",
      "dialogue": [
        {
          "speaker": "Nhân vật A",
          "role": "A",
          "kanji": "本日のテーマは「Thảo luận về phong cách làm việc từ xa」についてです。",
          "kana": "ほんじつのてーまは「Thảo luận về phong cách làm việc từ xa」についてです。",
          "vi": "Chủ đề của bài học hôm nay xoay quanh: Thảo luận về phong cách làm việc từ xa."
        },
        {
          "speaker": "Nhân vật B",
          "role": "B",
          "kanji": "具体的な注意点や重要なポイントを教えていただけますか。",
          "kana": "ぐたいてきなちゅういてんやじゅうようなぽいんとをおしえていただけますか。",
          "vi": "Bạn có thể chỉ rõ những điểm lưu ý mấu chốt được không?"
        },
        {
          "speaker": "Nhân vật A",
          "role": "A",
          "kanji": "はい、事前の準備と正確な情報確認が最も大切です。",
          "kana": "はい、じぜんのじゅんびとせいかくなじょうほうかくにんがいちばんたいせつです。",
          "vi": "Vâng, chuẩn bị kỹ lưỡng từ trước và xác nhận thông tin chuẩn xác là quan trọng nhất."
        }
      ],
      "question": "Nội dung cốt lõi của đoạn hội thoại về \"Thảo luận về phong cách làm việc từ xa\" là gì?",
      "options": [
        {
          "id": "A",
          "text": "Hủy bỏ toàn bộ kế hoạch đã đề ra"
        },
        {
          "id": "B",
          "text": "Cần chuẩn bị kỹ lưỡng từ trước và xác nhận thông tin chính xác"
        },
        {
          "id": "C",
          "text": "Không cần quan tâm đến các quy định hiện hành"
        },
        {
          "id": "D",
          "text": "Chờ người khác làm thay cho mình"
        }
      ],
      "correctAnswer": "B",
      "explanation": "Nhân vật A nhấn mạnh: 「事前の準備と正確な情報確認が最も大切です」(Chuẩn bị trước và xác nhận chuẩn xác là quan trọng nhất). Đáp án đúng là B.",
      "keyword": "Thảo luận về phong cách làm việc từ xa & 事前準備",
      "tip": "Tập trung bắt các từ nối mang tính kết luận như 「最も大切」「やはり」「結論として」."
    },
    {
      "id": "N3_10",
      "level": "N3",
      "lesson": 10,
      "topic": "Bài 10: Hướng dẫn quy trình sơ tán khi có cảnh báo động đất",
      "situation": "Tình huống giao tiếp thực tế cấp độ N3 liên quan đến: Hướng dẫn quy trình sơ tán khi có cảnh báo động đất.",
      "audioText": "これは日本語能力試験N3の聴解問題です。内容をよく聞いて、正しい答えを一つ選んでください。会話を聞いた後、質問に答えてください。",
      "dialogue": [
        {
          "speaker": "Nhân vật A",
          "role": "A",
          "kanji": "本日のテーマは「Hướng dẫn quy trình sơ tán khi có cảnh báo động đất」についてです。",
          "kana": "ほんじつのてーまは「Hướng dẫn quy trình sơ tán khi có cảnh báo động đất」についてです。",
          "vi": "Chủ đề của bài học hôm nay xoay quanh: Hướng dẫn quy trình sơ tán khi có cảnh báo động đất."
        },
        {
          "speaker": "Nhân vật B",
          "role": "B",
          "kanji": "具体的な注意点や重要なポイントを教えていただけますか。",
          "kana": "ぐたいてきなちゅういてんやじゅうようなぽいんとをおしえていただけますか。",
          "vi": "Bạn có thể chỉ rõ những điểm lưu ý mấu chốt được không?"
        },
        {
          "speaker": "Nhân vật A",
          "role": "A",
          "kanji": "はい、事前の準備と正確な情報確認が最も大切です。",
          "kana": "はい、じぜんのじゅんびとせいかくなじょうほうかくにんがいちばんたいせつです。",
          "vi": "Vâng, chuẩn bị kỹ lưỡng từ trước và xác nhận thông tin chuẩn xác là quan trọng nhất."
        }
      ],
      "question": "Nội dung cốt lõi của đoạn hội thoại về \"Hướng dẫn quy trình sơ tán khi có cảnh báo động đất\" là gì?",
      "options": [
        {
          "id": "A",
          "text": "Hủy bỏ toàn bộ kế hoạch đã đề ra"
        },
        {
          "id": "B",
          "text": "Cần chuẩn bị kỹ lưỡng từ trước và xác nhận thông tin chính xác"
        },
        {
          "id": "C",
          "text": "Không cần quan tâm đến các quy định hiện hành"
        },
        {
          "id": "D",
          "text": "Chờ người khác làm thay cho mình"
        }
      ],
      "correctAnswer": "B",
      "explanation": "Nhân vật A nhấn mạnh: 「事前の準備と正確な情報確認が最も大切です」(Chuẩn bị trước và xác nhận chuẩn xác là quan trọng nhất). Đáp án đúng là B.",
      "keyword": "Hướng dẫn quy trình sơ tán khi có cảnh báo động đất & 事前準備",
      "tip": "Tập trung bắt các từ nối mang tính kết luận như 「最も大切」「やはり」「結論として」."
    },
    {
      "id": "N3_11",
      "level": "N3",
      "lesson": 11,
      "topic": "Bài 11: Đổi trả hàng hóa và yêu cầu bảo hành điện máy",
      "situation": "Tình huống giao tiếp thực tế cấp độ N3 liên quan đến: Đổi trả hàng hóa và yêu cầu bảo hành điện máy.",
      "audioText": "これは日本語能力試験N3の聴解問題です。内容をよく聞いて、正しい答えを一つ選んでください。会話を聞いた後、質問に答えてください。",
      "dialogue": [
        {
          "speaker": "Nhân vật A",
          "role": "A",
          "kanji": "本日のテーマは「Đổi trả hàng hóa và yêu cầu bảo hành điện máy」についてです。",
          "kana": "ほんじつのてーまは「Đổi trả hàng hóa và yêu cầu bảo hành điện máy」についてです。",
          "vi": "Chủ đề của bài học hôm nay xoay quanh: Đổi trả hàng hóa và yêu cầu bảo hành điện máy."
        },
        {
          "speaker": "Nhân vật B",
          "role": "B",
          "kanji": "具体的な注意点や重要なポイントを教えていただけますか。",
          "kana": "ぐたいてきなちゅういてんやじゅうようなぽいんとをおしえていただけますか。",
          "vi": "Bạn có thể chỉ rõ những điểm lưu ý mấu chốt được không?"
        },
        {
          "speaker": "Nhân vật A",
          "role": "A",
          "kanji": "はい、事前の準備と正確な情報確認が最も大切です。",
          "kana": "はい、じぜんのじゅんびとせいかくなじょうほうかくにんがいちばんたいせつです。",
          "vi": "Vâng, chuẩn bị kỹ lưỡng từ trước và xác nhận thông tin chuẩn xác là quan trọng nhất."
        }
      ],
      "question": "Nội dung cốt lõi của đoạn hội thoại về \"Đổi trả hàng hóa và yêu cầu bảo hành điện máy\" là gì?",
      "options": [
        {
          "id": "A",
          "text": "Hủy bỏ toàn bộ kế hoạch đã đề ra"
        },
        {
          "id": "B",
          "text": "Cần chuẩn bị kỹ lưỡng từ trước và xác nhận thông tin chính xác"
        },
        {
          "id": "C",
          "text": "Không cần quan tâm đến các quy định hiện hành"
        },
        {
          "id": "D",
          "text": "Chờ người khác làm thay cho mình"
        }
      ],
      "correctAnswer": "B",
      "explanation": "Nhân vật A nhấn mạnh: 「事前の準備と正確な情報確認が最も大切です」(Chuẩn bị trước và xác nhận chuẩn xác là quan trọng nhất). Đáp án đúng là B.",
      "keyword": "Đổi trả hàng hóa và yêu cầu bảo hành điện máy & 事前準備",
      "tip": "Tập trung bắt các từ nối mang tính kết luận như 「最も大切」「やはり」「結論として」."
    },
    {
      "id": "N3_12",
      "level": "N3",
      "lesson": 12,
      "topic": "Bài 12: Đánh giá chất lượng khóa đào tạo tiếng Nhật doanh nghiệp",
      "situation": "Tình huống giao tiếp thực tế cấp độ N3 liên quan đến: Đánh giá chất lượng khóa đào tạo tiếng Nhật doanh nghiệp.",
      "audioText": "これは日本語能力試験N3の聴解問題です。内容をよく聞いて、正しい答えを一つ選んでください。会話を聞いた後、質問に答えてください。",
      "dialogue": [
        {
          "speaker": "Nhân vật A",
          "role": "A",
          "kanji": "本日のテーマは「Đánh giá chất lượng khóa đào tạo tiếng Nhật doanh nghiệp」についてです。",
          "kana": "ほんじつのてーまは「Đánh giá chất lượng khóa đào tạo tiếng Nhật doanh nghiệp」についてです。",
          "vi": "Chủ đề của bài học hôm nay xoay quanh: Đánh giá chất lượng khóa đào tạo tiếng Nhật doanh nghiệp."
        },
        {
          "speaker": "Nhân vật B",
          "role": "B",
          "kanji": "具体的な注意点や重要なポイントを教えていただけますか。",
          "kana": "ぐたいてきなちゅういてんやじゅうようなぽいんとをおしえていただけますか。",
          "vi": "Bạn có thể chỉ rõ những điểm lưu ý mấu chốt được không?"
        },
        {
          "speaker": "Nhân vật A",
          "role": "A",
          "kanji": "はい、事前の準備と正確な情報確認が最も大切です。",
          "kana": "はい、じぜんのじゅんびとせいかくなじょうほうかくにんがいちばんたいせつです。",
          "vi": "Vâng, chuẩn bị kỹ lưỡng từ trước và xác nhận thông tin chuẩn xác là quan trọng nhất."
        }
      ],
      "question": "Nội dung cốt lõi của đoạn hội thoại về \"Đánh giá chất lượng khóa đào tạo tiếng Nhật doanh nghiệp\" là gì?",
      "options": [
        {
          "id": "A",
          "text": "Hủy bỏ toàn bộ kế hoạch đã đề ra"
        },
        {
          "id": "B",
          "text": "Cần chuẩn bị kỹ lưỡng từ trước và xác nhận thông tin chính xác"
        },
        {
          "id": "C",
          "text": "Không cần quan tâm đến các quy định hiện hành"
        },
        {
          "id": "D",
          "text": "Chờ người khác làm thay cho mình"
        }
      ],
      "correctAnswer": "B",
      "explanation": "Nhân vật A nhấn mạnh: 「事前の準備と正確な情報確認が最も大切です」(Chuẩn bị trước và xác nhận chuẩn xác là quan trọng nhất). Đáp án đúng là B.",
      "keyword": "Đánh giá chất lượng khóa đào tạo tiếng Nhật doanh nghiệp & 事前準備",
      "tip": "Tập trung bắt các từ nối mang tính kết luận như 「最も大切」「やはり」「結論として」."
    },
    {
      "id": "N3_13",
      "level": "N3",
      "lesson": 13,
      "topic": "Bài 13: Kế hoạch tổ chức chuyến dã ngoại ngắm hoa anh đào",
      "situation": "Tình huống giao tiếp thực tế cấp độ N3 liên quan đến: Kế hoạch tổ chức chuyến dã ngoại ngắm hoa anh đào.",
      "audioText": "これは日本語能力試験N3の聴解問題です。内容をよく聞いて、正しい答えを一つ選んでください。会話を聞いた後、質問に答えてください。",
      "dialogue": [
        {
          "speaker": "Nhân vật A",
          "role": "A",
          "kanji": "本日のテーマは「Kế hoạch tổ chức chuyến dã ngoại ngắm hoa anh đào」についてです。",
          "kana": "ほんじつのてーまは「Kế hoạch tổ chức chuyến dã ngoại ngắm hoa anh đào」についてです。",
          "vi": "Chủ đề của bài học hôm nay xoay quanh: Kế hoạch tổ chức chuyến dã ngoại ngắm hoa anh đào."
        },
        {
          "speaker": "Nhân vật B",
          "role": "B",
          "kanji": "具体的な注意点や重要なポイントを教えていただけますか。",
          "kana": "ぐたいてきなちゅういてんやじゅうようなぽいんとをおしえていただけますか。",
          "vi": "Bạn có thể chỉ rõ những điểm lưu ý mấu chốt được không?"
        },
        {
          "speaker": "Nhân vật A",
          "role": "A",
          "kanji": "はい、事前の準備と正確な情報確認が最も大切です。",
          "kana": "はい、じぜんのじゅんびとせいかくなじょうほうかくにんがいちばんたいせつです。",
          "vi": "Vâng, chuẩn bị kỹ lưỡng từ trước và xác nhận thông tin chuẩn xác là quan trọng nhất."
        }
      ],
      "question": "Nội dung cốt lõi của đoạn hội thoại về \"Kế hoạch tổ chức chuyến dã ngoại ngắm hoa anh đào\" là gì?",
      "options": [
        {
          "id": "A",
          "text": "Hủy bỏ toàn bộ kế hoạch đã đề ra"
        },
        {
          "id": "B",
          "text": "Cần chuẩn bị kỹ lưỡng từ trước và xác nhận thông tin chính xác"
        },
        {
          "id": "C",
          "text": "Không cần quan tâm đến các quy định hiện hành"
        },
        {
          "id": "D",
          "text": "Chờ người khác làm thay cho mình"
        }
      ],
      "correctAnswer": "B",
      "explanation": "Nhân vật A nhấn mạnh: 「事前の準備と正確な情報確認が最も大切です」(Chuẩn bị trước và xác nhận chuẩn xác là quan trọng nhất). Đáp án đúng là B.",
      "keyword": "Kế hoạch tổ chức chuyến dã ngoại ngắm hoa anh đào & 事前準備",
      "tip": "Tập trung bắt các từ nối mang tính kết luận như 「最も大切」「やはり」「結論として」."
    },
    {
      "id": "N3_14",
      "level": "N3",
      "lesson": 14,
      "topic": "Bài 14: Thương lượng giá cả khi mua sắm số lượng lớn",
      "situation": "Tình huống giao tiếp thực tế cấp độ N3 liên quan đến: Thương lượng giá cả khi mua sắm số lượng lớn.",
      "audioText": "これは日本語能力試験N3の聴解問題です。内容をよく聞いて、正しい答えを一つ選んでください。会話を聞いた後、質問に答えてください。",
      "dialogue": [
        {
          "speaker": "Nhân vật A",
          "role": "A",
          "kanji": "本日のテーマは「Thương lượng giá cả khi mua sắm số lượng lớn」についてです。",
          "kana": "ほんじつのてーまは「Thương lượng giá cả khi mua sắm số lượng lớn」についてです。",
          "vi": "Chủ đề của bài học hôm nay xoay quanh: Thương lượng giá cả khi mua sắm số lượng lớn."
        },
        {
          "speaker": "Nhân vật B",
          "role": "B",
          "kanji": "具体的な注意点や重要なポイントを教えていただけますか。",
          "kana": "ぐたいてきなちゅういてんやじゅうようなぽいんとをおしえていただけますか。",
          "vi": "Bạn có thể chỉ rõ những điểm lưu ý mấu chốt được không?"
        },
        {
          "speaker": "Nhân vật A",
          "role": "A",
          "kanji": "はい、事前の準備と正確な情報確認が最も大切です。",
          "kana": "はい、じぜんのじゅんびとせいかくなじょうほうかくにんがいちばんたいせつです。",
          "vi": "Vâng, chuẩn bị kỹ lưỡng từ trước và xác nhận thông tin chuẩn xác là quan trọng nhất."
        }
      ],
      "question": "Nội dung cốt lõi của đoạn hội thoại về \"Thương lượng giá cả khi mua sắm số lượng lớn\" là gì?",
      "options": [
        {
          "id": "A",
          "text": "Hủy bỏ toàn bộ kế hoạch đã đề ra"
        },
        {
          "id": "B",
          "text": "Cần chuẩn bị kỹ lưỡng từ trước và xác nhận thông tin chính xác"
        },
        {
          "id": "C",
          "text": "Không cần quan tâm đến các quy định hiện hành"
        },
        {
          "id": "D",
          "text": "Chờ người khác làm thay cho mình"
        }
      ],
      "correctAnswer": "B",
      "explanation": "Nhân vật A nhấn mạnh: 「事前の準備と正確な情報確認が最も大切です」(Chuẩn bị trước và xác nhận chuẩn xác là quan trọng nhất). Đáp án đúng là B.",
      "keyword": "Thương lượng giá cả khi mua sắm số lượng lớn & 事前準備",
      "tip": "Tập trung bắt các từ nối mang tính kết luận như 「最も大切」「やはり」「結論として」."
    },
    {
      "id": "N3_15",
      "level": "N3",
      "lesson": 15,
      "topic": "Bài 15: Đặt tiệc tất niên tại nhà hàng truyền thống Tokyo",
      "situation": "Tình huống giao tiếp thực tế cấp độ N3 liên quan đến: Đặt tiệc tất niên tại nhà hàng truyền thống Tokyo.",
      "audioText": "これは日本語能力試験N3の聴解問題です。内容をよく聞いて、正しい答えを一つ選んでください。会話を聞いた後、質問に答えてください。",
      "dialogue": [
        {
          "speaker": "Nhân vật A",
          "role": "A",
          "kanji": "本日のテーマは「Đặt tiệc tất niên tại nhà hàng truyền thống Tokyo」についてです。",
          "kana": "ほんじつのてーまは「Đặt tiệc tất niên tại nhà hàng truyền thống Tokyo」についてです。",
          "vi": "Chủ đề của bài học hôm nay xoay quanh: Đặt tiệc tất niên tại nhà hàng truyền thống Tokyo."
        },
        {
          "speaker": "Nhân vật B",
          "role": "B",
          "kanji": "具体的な注意点や重要なポイントを教えていただけますか。",
          "kana": "ぐたいてきなちゅういてんやじゅうようなぽいんとをおしえていただけますか。",
          "vi": "Bạn có thể chỉ rõ những điểm lưu ý mấu chốt được không?"
        },
        {
          "speaker": "Nhân vật A",
          "role": "A",
          "kanji": "はい、事前の準備と正確な情報確認が最も大切です。",
          "kana": "はい、じぜんのじゅんびとせいかくなじょうほうかくにんがいちばんたいせつです。",
          "vi": "Vâng, chuẩn bị kỹ lưỡng từ trước và xác nhận thông tin chuẩn xác là quan trọng nhất."
        }
      ],
      "question": "Nội dung cốt lõi của đoạn hội thoại về \"Đặt tiệc tất niên tại nhà hàng truyền thống Tokyo\" là gì?",
      "options": [
        {
          "id": "A",
          "text": "Hủy bỏ toàn bộ kế hoạch đã đề ra"
        },
        {
          "id": "B",
          "text": "Cần chuẩn bị kỹ lưỡng từ trước và xác nhận thông tin chính xác"
        },
        {
          "id": "C",
          "text": "Không cần quan tâm đến các quy định hiện hành"
        },
        {
          "id": "D",
          "text": "Chờ người khác làm thay cho mình"
        }
      ],
      "correctAnswer": "B",
      "explanation": "Nhân vật A nhấn mạnh: 「事前の準備と正確な情報確認が最も大切です」(Chuẩn bị trước và xác nhận chuẩn xác là quan trọng nhất). Đáp án đúng là B.",
      "keyword": "Đặt tiệc tất niên tại nhà hàng truyền thống Tokyo & 事前準備",
      "tip": "Tập trung bắt các từ nối mang tính kết luận như 「最も大切」「やはり」「結論として」."
    },
    {
      "id": "N3_16",
      "level": "N3",
      "lesson": 16,
      "topic": "Bài 16: Tư vấn gói bảo hiểm y tế cho người nước ngoài",
      "situation": "Tình huống giao tiếp thực tế cấp độ N3 liên quan đến: Tư vấn gói bảo hiểm y tế cho người nước ngoài.",
      "audioText": "これは日本語能力試験N3の聴解問題です。内容をよく聞いて、正しい答えを一つ選んでください。会話を聞いた後、質問に答えてください。",
      "dialogue": [
        {
          "speaker": "Nhân vật A",
          "role": "A",
          "kanji": "本日のテーマは「Tư vấn gói bảo hiểm y tế cho người nước ngoài」についてです。",
          "kana": "ほんじつのてーまは「Tư vấn gói bảo hiểm y tế cho người nước ngoài」についてです。",
          "vi": "Chủ đề của bài học hôm nay xoay quanh: Tư vấn gói bảo hiểm y tế cho người nước ngoài."
        },
        {
          "speaker": "Nhân vật B",
          "role": "B",
          "kanji": "具体的な注意点や重要なポイントを教えていただけますか。",
          "kana": "ぐたいてきなちゅういてんやじゅうようなぽいんとをおしえていただけますか。",
          "vi": "Bạn có thể chỉ rõ những điểm lưu ý mấu chốt được không?"
        },
        {
          "speaker": "Nhân vật A",
          "role": "A",
          "kanji": "はい、事前の準備と正確な情報確認が最も大切です。",
          "kana": "はい、じぜんのじゅんびとせいかくなじょうほうかくにんがいちばんたいせつです。",
          "vi": "Vâng, chuẩn bị kỹ lưỡng từ trước và xác nhận thông tin chuẩn xác là quan trọng nhất."
        }
      ],
      "question": "Nội dung cốt lõi của đoạn hội thoại về \"Tư vấn gói bảo hiểm y tế cho người nước ngoài\" là gì?",
      "options": [
        {
          "id": "A",
          "text": "Hủy bỏ toàn bộ kế hoạch đã đề ra"
        },
        {
          "id": "B",
          "text": "Cần chuẩn bị kỹ lưỡng từ trước và xác nhận thông tin chính xác"
        },
        {
          "id": "C",
          "text": "Không cần quan tâm đến các quy định hiện hành"
        },
        {
          "id": "D",
          "text": "Chờ người khác làm thay cho mình"
        }
      ],
      "correctAnswer": "B",
      "explanation": "Nhân vật A nhấn mạnh: 「事前の準備と正確な情報確認が最も大切です」(Chuẩn bị trước và xác nhận chuẩn xác là quan trọng nhất). Đáp án đúng là B.",
      "keyword": "Tư vấn gói bảo hiểm y tế cho người nước ngoài & 事前準備",
      "tip": "Tập trung bắt các từ nối mang tính kết luận như 「最も大切」「やはり」「結論として」."
    },
    {
      "id": "N3_17",
      "level": "N3",
      "lesson": 17,
      "topic": "Bài 17: Giải quyết khiếu nại về giao hàng chậm trễ",
      "situation": "Tình huống giao tiếp thực tế cấp độ N3 liên quan đến: Giải quyết khiếu nại về giao hàng chậm trễ.",
      "audioText": "これは日本語能力試験N3の聴解問題です。内容をよく聞いて、正しい答えを一つ選んでください。会話を聞いた後、質問に答えてください。",
      "dialogue": [
        {
          "speaker": "Nhân vật A",
          "role": "A",
          "kanji": "本日のテーマは「Giải quyết khiếu nại về giao hàng chậm trễ」についてです。",
          "kana": "ほんじつのてーまは「Giải quyết khiếu nại về giao hàng chậm trễ」についてです。",
          "vi": "Chủ đề của bài học hôm nay xoay quanh: Giải quyết khiếu nại về giao hàng chậm trễ."
        },
        {
          "speaker": "Nhân vật B",
          "role": "B",
          "kanji": "具体的な注意点や重要なポイントを教えていただけますか。",
          "kana": "ぐたいてきなちゅういてんやじゅうようなぽいんとをおしえていただけますか。",
          "vi": "Bạn có thể chỉ rõ những điểm lưu ý mấu chốt được không?"
        },
        {
          "speaker": "Nhân vật A",
          "role": "A",
          "kanji": "はい、事前の準備と正確な情報確認が最も大切です。",
          "kana": "はい、じぜんのじゅんびとせいかくなじょうほうかくにんがいちばんたいせつです。",
          "vi": "Vâng, chuẩn bị kỹ lưỡng từ trước và xác nhận thông tin chuẩn xác là quan trọng nhất."
        }
      ],
      "question": "Nội dung cốt lõi của đoạn hội thoại về \"Giải quyết khiếu nại về giao hàng chậm trễ\" là gì?",
      "options": [
        {
          "id": "A",
          "text": "Hủy bỏ toàn bộ kế hoạch đã đề ra"
        },
        {
          "id": "B",
          "text": "Cần chuẩn bị kỹ lưỡng từ trước và xác nhận thông tin chính xác"
        },
        {
          "id": "C",
          "text": "Không cần quan tâm đến các quy định hiện hành"
        },
        {
          "id": "D",
          "text": "Chờ người khác làm thay cho mình"
        }
      ],
      "correctAnswer": "B",
      "explanation": "Nhân vật A nhấn mạnh: 「事前の準備と正確な情報確認が最も大切です」(Chuẩn bị trước và xác nhận chuẩn xác là quan trọng nhất). Đáp án đúng là B.",
      "keyword": "Giải quyết khiếu nại về giao hàng chậm trễ & 事前準備",
      "tip": "Tập trung bắt các từ nối mang tính kết luận như 「最も大切」「やはり」「結論として」."
    },
    {
      "id": "N3_18",
      "level": "N3",
      "lesson": 18,
      "topic": "Bài 18: Phỏng vấn ứng viên câu lạc bộ tình nguyện quốc tế",
      "situation": "Tình huống giao tiếp thực tế cấp độ N3 liên quan đến: Phỏng vấn ứng viên câu lạc bộ tình nguyện quốc tế.",
      "audioText": "これは日本語能力試験N3の聴解問題です。内容をよく聞いて、正しい答えを一つ選んでください。会話を聞いた後、質問に答えてください。",
      "dialogue": [
        {
          "speaker": "Nhân vật A",
          "role": "A",
          "kanji": "本日のテーマは「Phỏng vấn ứng viên câu lạc bộ tình nguyện quốc tế」についてです。",
          "kana": "ほんじつのてーまは「Phỏng vấn ứng viên câu lạc bộ tình nguyện quốc tế」についてです。",
          "vi": "Chủ đề của bài học hôm nay xoay quanh: Phỏng vấn ứng viên câu lạc bộ tình nguyện quốc tế."
        },
        {
          "speaker": "Nhân vật B",
          "role": "B",
          "kanji": "具体的な注意点や重要なポイントを教えていただけますか。",
          "kana": "ぐたいてきなちゅういてんやじゅうようなぽいんとをおしえていただけますか。",
          "vi": "Bạn có thể chỉ rõ những điểm lưu ý mấu chốt được không?"
        },
        {
          "speaker": "Nhân vật A",
          "role": "A",
          "kanji": "はい、事前の準備と正確な情報確認が最も大切です。",
          "kana": "はい、じぜんのじゅんびとせいかくなじょうほうかくにんがいちばんたいせつです。",
          "vi": "Vâng, chuẩn bị kỹ lưỡng từ trước và xác nhận thông tin chuẩn xác là quan trọng nhất."
        }
      ],
      "question": "Nội dung cốt lõi của đoạn hội thoại về \"Phỏng vấn ứng viên câu lạc bộ tình nguyện quốc tế\" là gì?",
      "options": [
        {
          "id": "A",
          "text": "Hủy bỏ toàn bộ kế hoạch đã đề ra"
        },
        {
          "id": "B",
          "text": "Cần chuẩn bị kỹ lưỡng từ trước và xác nhận thông tin chính xác"
        },
        {
          "id": "C",
          "text": "Không cần quan tâm đến các quy định hiện hành"
        },
        {
          "id": "D",
          "text": "Chờ người khác làm thay cho mình"
        }
      ],
      "correctAnswer": "B",
      "explanation": "Nhân vật A nhấn mạnh: 「事前の準備と正確な情報確認が最も大切です」(Chuẩn bị trước và xác nhận chuẩn xác là quan trọng nhất). Đáp án đúng là B.",
      "keyword": "Phỏng vấn ứng viên câu lạc bộ tình nguyện quốc tế & 事前準備",
      "tip": "Tập trung bắt các từ nối mang tính kết luận như 「最も大切」「やはり」「結論として」."
    },
    {
      "id": "N3_19",
      "level": "N3",
      "lesson": 19,
      "topic": "Bài 19: Thảo luận về tác động của biến đổi khí hậu",
      "situation": "Tình huống giao tiếp thực tế cấp độ N3 liên quan đến: Thảo luận về tác động của biến đổi khí hậu.",
      "audioText": "これは日本語能力試験N3の聴解問題です。内容をよく聞いて、正しい答えを一つ選んでください。会話を聞いた後、質問に答えてください。",
      "dialogue": [
        {
          "speaker": "Nhân vật A",
          "role": "A",
          "kanji": "本日のテーマは「Thảo luận về tác động của biến đổi khí hậu」についてです。",
          "kana": "ほんじつのてーまは「Thảo luận về tác động của biến đổi khí hậu」についてです。",
          "vi": "Chủ đề của bài học hôm nay xoay quanh: Thảo luận về tác động của biến đổi khí hậu."
        },
        {
          "speaker": "Nhân vật B",
          "role": "B",
          "kanji": "具体的な注意点や重要なポイントを教えていただけますか。",
          "kana": "ぐたいてきなちゅういてんやじゅうようなぽいんとをおしえていただけますか。",
          "vi": "Bạn có thể chỉ rõ những điểm lưu ý mấu chốt được không?"
        },
        {
          "speaker": "Nhân vật A",
          "role": "A",
          "kanji": "はい、事前の準備と正確な情報確認が最も大切です。",
          "kana": "はい、じぜんのじゅんびとせいかくなじょうほうかくにんがいちばんたいせつです。",
          "vi": "Vâng, chuẩn bị kỹ lưỡng từ trước và xác nhận thông tin chuẩn xác là quan trọng nhất."
        }
      ],
      "question": "Nội dung cốt lõi của đoạn hội thoại về \"Thảo luận về tác động của biến đổi khí hậu\" là gì?",
      "options": [
        {
          "id": "A",
          "text": "Hủy bỏ toàn bộ kế hoạch đã đề ra"
        },
        {
          "id": "B",
          "text": "Cần chuẩn bị kỹ lưỡng từ trước và xác nhận thông tin chính xác"
        },
        {
          "id": "C",
          "text": "Không cần quan tâm đến các quy định hiện hành"
        },
        {
          "id": "D",
          "text": "Chờ người khác làm thay cho mình"
        }
      ],
      "correctAnswer": "B",
      "explanation": "Nhân vật A nhấn mạnh: 「事前の準備と正確な情報確認が最も大切です」(Chuẩn bị trước và xác nhận chuẩn xác là quan trọng nhất). Đáp án đúng là B.",
      "keyword": "Thảo luận về tác động của biến đổi khí hậu & 事前準備",
      "tip": "Tập trung bắt các từ nối mang tính kết luận như 「最も大切」「やはり」「結論として」."
    },
    {
      "id": "N3_20",
      "level": "N3",
      "lesson": 20,
      "topic": "Bài 20: Hướng dẫn sử dụng hệ thống thư viện thành phố",
      "situation": "Tình huống giao tiếp thực tế cấp độ N3 liên quan đến: Hướng dẫn sử dụng hệ thống thư viện thành phố.",
      "audioText": "これは日本語能力試験N3の聴解問題です。内容をよく聞いて、正しい答えを一つ選んでください。会話を聞いた後、質問に答えてください。",
      "dialogue": [
        {
          "speaker": "Nhân vật A",
          "role": "A",
          "kanji": "本日のテーマは「Hướng dẫn sử dụng hệ thống thư viện thành phố」についてです。",
          "kana": "ほんじつのてーまは「Hướng dẫn sử dụng hệ thống thư viện thành phố」についてです。",
          "vi": "Chủ đề của bài học hôm nay xoay quanh: Hướng dẫn sử dụng hệ thống thư viện thành phố."
        },
        {
          "speaker": "Nhân vật B",
          "role": "B",
          "kanji": "具体的な注意点や重要なポイントを教えていただけますか。",
          "kana": "ぐたいてきなちゅういてんやじゅうようなぽいんとをおしえていただけますか。",
          "vi": "Bạn có thể chỉ rõ những điểm lưu ý mấu chốt được không?"
        },
        {
          "speaker": "Nhân vật A",
          "role": "A",
          "kanji": "はい、事前の準備と正確な情報確認が最も大切です。",
          "kana": "はい、じぜんのじゅんびとせいかくなじょうほうかくにんがいちばんたいせつです。",
          "vi": "Vâng, chuẩn bị kỹ lưỡng từ trước và xác nhận thông tin chuẩn xác là quan trọng nhất."
        }
      ],
      "question": "Nội dung cốt lõi của đoạn hội thoại về \"Hướng dẫn sử dụng hệ thống thư viện thành phố\" là gì?",
      "options": [
        {
          "id": "A",
          "text": "Hủy bỏ toàn bộ kế hoạch đã đề ra"
        },
        {
          "id": "B",
          "text": "Cần chuẩn bị kỹ lưỡng từ trước và xác nhận thông tin chính xác"
        },
        {
          "id": "C",
          "text": "Không cần quan tâm đến các quy định hiện hành"
        },
        {
          "id": "D",
          "text": "Chờ người khác làm thay cho mình"
        }
      ],
      "correctAnswer": "B",
      "explanation": "Nhân vật A nhấn mạnh: 「事前の準備と正確な情報確認が最も大切です」(Chuẩn bị trước và xác nhận chuẩn xác là quan trọng nhất). Đáp án đúng là B.",
      "keyword": "Hướng dẫn sử dụng hệ thống thư viện thành phố & 事前準備",
      "tip": "Tập trung bắt các từ nối mang tính kết luận như 「最も大切」「やはり」「結論として」."
    },
    {
      "id": "N3_21",
      "level": "N3",
      "lesson": 21,
      "topic": "Bài 21: Chia sẻ kinh nghiệm thi đỗ chứng chỉ JLPT N3",
      "situation": "Tình huống giao tiếp thực tế cấp độ N3 liên quan đến: Chia sẻ kinh nghiệm thi đỗ chứng chỉ JLPT N3.",
      "audioText": "これは日本語能力試験N3の聴解問題です。内容をよく聞いて、正しい答えを一つ選んでください。会話を聞いた後、質問に答えてください。",
      "dialogue": [
        {
          "speaker": "Nhân vật A",
          "role": "A",
          "kanji": "本日のテーマは「Chia sẻ kinh nghiệm thi đỗ chứng chỉ JLPT N3」についてです。",
          "kana": "ほんじつのてーまは「Chia sẻ kinh nghiệm thi đỗ chứng chỉ JLPT N3」についてです。",
          "vi": "Chủ đề của bài học hôm nay xoay quanh: Chia sẻ kinh nghiệm thi đỗ chứng chỉ JLPT N3."
        },
        {
          "speaker": "Nhân vật B",
          "role": "B",
          "kanji": "具体的な注意点や重要なポイントを教えていただけますか。",
          "kana": "ぐたいてきなちゅういてんやじゅうようなぽいんとをおしえていただけますか。",
          "vi": "Bạn có thể chỉ rõ những điểm lưu ý mấu chốt được không?"
        },
        {
          "speaker": "Nhân vật A",
          "role": "A",
          "kanji": "はい、事前の準備と正確な情報確認が最も大切です。",
          "kana": "はい、じぜんのじゅんびとせいかくなじょうほうかくにんがいちばんたいせつです。",
          "vi": "Vâng, chuẩn bị kỹ lưỡng từ trước và xác nhận thông tin chuẩn xác là quan trọng nhất."
        }
      ],
      "question": "Nội dung cốt lõi của đoạn hội thoại về \"Chia sẻ kinh nghiệm thi đỗ chứng chỉ JLPT N3\" là gì?",
      "options": [
        {
          "id": "A",
          "text": "Hủy bỏ toàn bộ kế hoạch đã đề ra"
        },
        {
          "id": "B",
          "text": "Cần chuẩn bị kỹ lưỡng từ trước và xác nhận thông tin chính xác"
        },
        {
          "id": "C",
          "text": "Không cần quan tâm đến các quy định hiện hành"
        },
        {
          "id": "D",
          "text": "Chờ người khác làm thay cho mình"
        }
      ],
      "correctAnswer": "B",
      "explanation": "Nhân vật A nhấn mạnh: 「事前の準備と正確な情報確認が最も大切です」(Chuẩn bị trước và xác nhận chuẩn xác là quan trọng nhất). Đáp án đúng là B.",
      "keyword": "Chia sẻ kinh nghiệm thi đỗ chứng chỉ JLPT N3 & 事前準備",
      "tip": "Tập trung bắt các từ nối mang tính kết luận như 「最も大切」「やはり」「結論として」."
    },
    {
      "id": "N3_22",
      "level": "N3",
      "lesson": 22,
      "topic": "Bài 22: Quy định an toàn lao động tại xưởng sản xuất",
      "situation": "Tình huống giao tiếp thực tế cấp độ N3 liên quan đến: Quy định an toàn lao động tại xưởng sản xuất.",
      "audioText": "これは日本語能力試験N3の聴解問題です。内容をよく聞いて、正しい答えを一つ選んでください。会話を聞いた後、質問に答えてください。",
      "dialogue": [
        {
          "speaker": "Nhân vật A",
          "role": "A",
          "kanji": "本日のテーマは「Quy định an toàn lao động tại xưởng sản xuất」についてです。",
          "kana": "ほんじつのてーまは「Quy định an toàn lao động tại xưởng sản xuất」についてです。",
          "vi": "Chủ đề của bài học hôm nay xoay quanh: Quy định an toàn lao động tại xưởng sản xuất."
        },
        {
          "speaker": "Nhân vật B",
          "role": "B",
          "kanji": "具体的な注意点や重要なポイントを教えていただけますか。",
          "kana": "ぐたいてきなちゅういてんやじゅうようなぽいんとをおしえていただけますか。",
          "vi": "Bạn có thể chỉ rõ những điểm lưu ý mấu chốt được không?"
        },
        {
          "speaker": "Nhân vật A",
          "role": "A",
          "kanji": "はい、事前の準備と正確な情報確認が最も大切です。",
          "kana": "はい、じぜんのじゅんびとせいかくなじょうほうかくにんがいちばんたいせつです。",
          "vi": "Vâng, chuẩn bị kỹ lưỡng từ trước và xác nhận thông tin chuẩn xác là quan trọng nhất."
        }
      ],
      "question": "Nội dung cốt lõi của đoạn hội thoại về \"Quy định an toàn lao động tại xưởng sản xuất\" là gì?",
      "options": [
        {
          "id": "A",
          "text": "Hủy bỏ toàn bộ kế hoạch đã đề ra"
        },
        {
          "id": "B",
          "text": "Cần chuẩn bị kỹ lưỡng từ trước và xác nhận thông tin chính xác"
        },
        {
          "id": "C",
          "text": "Không cần quan tâm đến các quy định hiện hành"
        },
        {
          "id": "D",
          "text": "Chờ người khác làm thay cho mình"
        }
      ],
      "correctAnswer": "B",
      "explanation": "Nhân vật A nhấn mạnh: 「事前の準備と正確な情報確認が最も大切です」(Chuẩn bị trước và xác nhận chuẩn xác là quan trọng nhất). Đáp án đúng là B.",
      "keyword": "Quy định an toàn lao động tại xưởng sản xuất & 事前準備",
      "tip": "Tập trung bắt các từ nối mang tính kết luận như 「最も大切」「やはり」「結論として」."
    },
    {
      "id": "N3_23",
      "level": "N3",
      "lesson": 23,
      "topic": "Bài 23: Tìm đồ thất lạc trên xe buýt công cộng",
      "situation": "Tình huống giao tiếp thực tế cấp độ N3 liên quan đến: Tìm đồ thất lạc trên xe buýt công cộng.",
      "audioText": "これは日本語能力試験N3の聴解問題です。内容をよく聞いて、正しい答えを一つ選んでください。会話を聞いた後、質問に答えてください。",
      "dialogue": [
        {
          "speaker": "Nhân vật A",
          "role": "A",
          "kanji": "本日のテーマは「Tìm đồ thất lạc trên xe buýt công cộng」についてです。",
          "kana": "ほんじつのてーまは「Tìm đồ thất lạc trên xe buýt công cộng」についてです。",
          "vi": "Chủ đề của bài học hôm nay xoay quanh: Tìm đồ thất lạc trên xe buýt công cộng."
        },
        {
          "speaker": "Nhân vật B",
          "role": "B",
          "kanji": "具体的な注意点や重要なポイントを教えていただけますか。",
          "kana": "ぐたいてきなちゅういてんやじゅうようなぽいんとをおしえていただけますか。",
          "vi": "Bạn có thể chỉ rõ những điểm lưu ý mấu chốt được không?"
        },
        {
          "speaker": "Nhân vật A",
          "role": "A",
          "kanji": "はい、事前の準備と正確な情報確認が最も大切です。",
          "kana": "はい、じぜんのじゅんびとせいかくなじょうほうかくにんがいちばんたいせつです。",
          "vi": "Vâng, chuẩn bị kỹ lưỡng từ trước và xác nhận thông tin chuẩn xác là quan trọng nhất."
        }
      ],
      "question": "Nội dung cốt lõi của đoạn hội thoại về \"Tìm đồ thất lạc trên xe buýt công cộng\" là gì?",
      "options": [
        {
          "id": "A",
          "text": "Hủy bỏ toàn bộ kế hoạch đã đề ra"
        },
        {
          "id": "B",
          "text": "Cần chuẩn bị kỹ lưỡng từ trước và xác nhận thông tin chính xác"
        },
        {
          "id": "C",
          "text": "Không cần quan tâm đến các quy định hiện hành"
        },
        {
          "id": "D",
          "text": "Chờ người khác làm thay cho mình"
        }
      ],
      "correctAnswer": "B",
      "explanation": "Nhân vật A nhấn mạnh: 「事前の準備と正確な情報確認が最も大切です」(Chuẩn bị trước và xác nhận chuẩn xác là quan trọng nhất). Đáp án đúng là B.",
      "keyword": "Tìm đồ thất lạc trên xe buýt công cộng & 事前準備",
      "tip": "Tập trung bắt các từ nối mang tính kết luận như 「最も大切」「やはり」「結論として」."
    },
    {
      "id": "N3_24",
      "level": "N3",
      "lesson": 24,
      "topic": "Bài 24: Lập kế hoạch chi tiêu gia đình tiết kiệm",
      "situation": "Tình huống giao tiếp thực tế cấp độ N3 liên quan đến: Lập kế hoạch chi tiêu gia đình tiết kiệm.",
      "audioText": "これは日本語能力試験N3の聴解問題です。内容をよく聞いて、正しい答えを一つ選んでください。会話を聞いた後、質問に答えてください。",
      "dialogue": [
        {
          "speaker": "Nhân vật A",
          "role": "A",
          "kanji": "本日のテーマは「Lập kế hoạch chi tiêu gia đình tiết kiệm」についてです。",
          "kana": "ほんじつのてーまは「Lập kế hoạch chi tiêu gia đình tiết kiệm」についてです。",
          "vi": "Chủ đề của bài học hôm nay xoay quanh: Lập kế hoạch chi tiêu gia đình tiết kiệm."
        },
        {
          "speaker": "Nhân vật B",
          "role": "B",
          "kanji": "具体的な注意点や重要なポイントを教えていただけますか。",
          "kana": "ぐたいてきなちゅういてんやじゅうようなぽいんとをおしえていただけますか。",
          "vi": "Bạn có thể chỉ rõ những điểm lưu ý mấu chốt được không?"
        },
        {
          "speaker": "Nhân vật A",
          "role": "A",
          "kanji": "はい、事前の準備と正確な情報確認が最も大切です。",
          "kana": "はい、じぜんのじゅんびとせいかくなじょうほうかくにんがいちばんたいせつです。",
          "vi": "Vâng, chuẩn bị kỹ lưỡng từ trước và xác nhận thông tin chuẩn xác là quan trọng nhất."
        }
      ],
      "question": "Nội dung cốt lõi của đoạn hội thoại về \"Lập kế hoạch chi tiêu gia đình tiết kiệm\" là gì?",
      "options": [
        {
          "id": "A",
          "text": "Hủy bỏ toàn bộ kế hoạch đã đề ra"
        },
        {
          "id": "B",
          "text": "Cần chuẩn bị kỹ lưỡng từ trước và xác nhận thông tin chính xác"
        },
        {
          "id": "C",
          "text": "Không cần quan tâm đến các quy định hiện hành"
        },
        {
          "id": "D",
          "text": "Chờ người khác làm thay cho mình"
        }
      ],
      "correctAnswer": "B",
      "explanation": "Nhân vật A nhấn mạnh: 「事前の準備と正確な情報確認が最も大切です」(Chuẩn bị trước và xác nhận chuẩn xác là quan trọng nhất). Đáp án đúng là B.",
      "keyword": "Lập kế hoạch chi tiêu gia đình tiết kiệm & 事前準備",
      "tip": "Tập trung bắt các từ nối mang tính kết luận như 「最も大切」「やはり」「結論として」."
    },
    {
      "id": "N3_25",
      "level": "N3",
      "lesson": 25,
      "topic": "Bài 25: Lời cảm ơn bế mạc hội thảo phát triển kỹ năng",
      "situation": "Tình huống giao tiếp thực tế cấp độ N3 liên quan đến: Lời cảm ơn bế mạc hội thảo phát triển kỹ năng.",
      "audioText": "これは日本語能力試験N3の聴解問題です。内容をよく聞いて、正しい答えを一つ選んでください。会話を聞いた後、質問に答えてください。",
      "dialogue": [
        {
          "speaker": "Nhân vật A",
          "role": "A",
          "kanji": "本日のテーマは「Lời cảm ơn bế mạc hội thảo phát triển kỹ năng」についてです。",
          "kana": "ほんじつのてーまは「Lời cảm ơn bế mạc hội thảo phát triển kỹ năng」についてです。",
          "vi": "Chủ đề của bài học hôm nay xoay quanh: Lời cảm ơn bế mạc hội thảo phát triển kỹ năng."
        },
        {
          "speaker": "Nhân vật B",
          "role": "B",
          "kanji": "具体的な注意点や重要なポイントを教えていただけますか。",
          "kana": "ぐたいてきなちゅういてんやじゅうようなぽいんとをおしえていただけますか。",
          "vi": "Bạn có thể chỉ rõ những điểm lưu ý mấu chốt được không?"
        },
        {
          "speaker": "Nhân vật A",
          "role": "A",
          "kanji": "はい、事前の準備と正確な情報確認が最も大切です。",
          "kana": "はい、じぜんのじゅんびとせいかくなじょうほうかくにんがいちばんたいせつです。",
          "vi": "Vâng, chuẩn bị kỹ lưỡng từ trước và xác nhận thông tin chuẩn xác là quan trọng nhất."
        }
      ],
      "question": "Nội dung cốt lõi của đoạn hội thoại về \"Lời cảm ơn bế mạc hội thảo phát triển kỹ năng\" là gì?",
      "options": [
        {
          "id": "A",
          "text": "Hủy bỏ toàn bộ kế hoạch đã đề ra"
        },
        {
          "id": "B",
          "text": "Cần chuẩn bị kỹ lưỡng từ trước và xác nhận thông tin chính xác"
        },
        {
          "id": "C",
          "text": "Không cần quan tâm đến các quy định hiện hành"
        },
        {
          "id": "D",
          "text": "Chờ người khác làm thay cho mình"
        }
      ],
      "correctAnswer": "B",
      "explanation": "Nhân vật A nhấn mạnh: 「事前の準備と正確な情報確認が最も大切です」(Chuẩn bị trước và xác nhận chuẩn xác là quan trọng nhất). Đáp án đúng là B.",
      "keyword": "Lời cảm ơn bế mạc hội thảo phát triển kỹ năng & 事前準備",
      "tip": "Tập trung bắt các từ nối mang tính kết luận như 「最も大切」「やはり」「結論として」."
    }
  ],
  "N2": [
    {
      "id": "N2_1",
      "level": "N2",
      "lesson": 1,
      "topic": "Bài 01: Thuyết trình chiến lược tiếp thị đa kênh B2B",
      "situation": "Chủ đề thảo luận chuyên sâu thương mại và học thuật N2: Thuyết trình chiến lược tiếp thị đa kênh B2B.",
      "audioText": "こちらはJLPT N2レベルの聴解試験です。話の要点と話者の意図を的確に把握して回答してください。",
      "dialogue": [
        {
          "speaker": "Chuyên gia",
          "role": "A",
          "kanji": "近年の市場動向を踏まえ、「Thuyết trình chiến lược tiếp thị đa kênh B2B」に関する新たな施策が求められています。",
          "kana": "きんねんのしじょうどうこうをふまえ、「Thuyết trình chiến lược tiếp thị đa kênh B2B」にかんするあらたなせさくがもとめられています。",
          "vi": "Dựa trên diễn biến thị trường gần đây, việc thực thi chính sách mới về \"Thuyết trình chiến lược tiếp thị đa kênh B2B\" là vô cùng cấp thiết."
        },
        {
          "speaker": "Đại biểu",
          "role": "B",
          "kanji": "長期的視点に立った費用対効果の検証が不可欠ですね。",
          "kana": "ちょうきてきしてんにたったひようたいこうかのけんしょうがふかけつですね。",
          "vi": "Việc kiểm chứng hiệu quả chi phí dựa trên tầm nhìn dài hạn là điều không thể thiếu."
        },
        {
          "speaker": "Chuyên gia",
          "role": "A",
          "kanji": "その通りです。持続可能性を重視した戦略的アプローチこそが成功の鍵となります。",
          "kana": "そのとおりです。じぞくかのうせいをじゅうししたせんりゃくてきあぷろーちこそがせいこうのかぎとなります。",
          "vi": "Hoàn toàn chính xác. Chính cách tiếp cận chiến lược lấy tính bền vững làm trọng tâm mới là chìa khóa then chốt thành công."
        }
      ],
      "question": "Theo quan điểm của chuyên gia, yếu tố quyết định thành công của \"Thuyết trình chiến lược tiếp thị đa kênh B2B\" là gì?",
      "options": [
        {
          "id": "A",
          "text": "Chạy theo lợi ích ngắn hạn trước mắt"
        },
        {
          "id": "B",
          "text": "Chiến lược dài hạn lấy tính bền vững và hiệu quả chi phí làm trọng tâm"
        },
        {
          "id": "C",
          "text": "Cắt giảm toàn bộ chi phí nghiên cứu phát triển"
        },
        {
          "id": "D",
          "text": "Ủy thác hoàn toàn cho đối thủ cạnh tranh"
        }
      ],
      "correctAnswer": "B",
      "explanation": "Chuyên gia khẳng định: 「持続可能性を重視した戦略的アプローチこそが成功の鍵」(Chiến lược bền vững mới là chìa khóa). Đáp án đúng là B.",
      "keyword": "Thuyết trình chiến lược tiếp thị đa kênh B2B & 持続可能性",
      "tip": "Ở cấp độ N2, câu hỏi thường yêu cầu suy luận ý định người nói (話者の意図) thay vì chỉ bắt từng từ vựng đơn lẻ."
    },
    {
      "id": "N2_2",
      "level": "N2",
      "lesson": 2,
      "topic": "Bài 02: Đàm phán điều khoản hợp đồng phân phối độc quyền",
      "situation": "Chủ đề thảo luận chuyên sâu thương mại và học thuật N2: Đàm phán điều khoản hợp đồng phân phối độc quyền.",
      "audioText": "こちらはJLPT N2レベルの聴解試験です。話の要点と話者の意図を的確に把握して回答してください。",
      "dialogue": [
        {
          "speaker": "Chuyên gia",
          "role": "A",
          "kanji": "近年の市場動向を踏まえ、「Đàm phán điều khoản hợp đồng phân phối độc quyền」に関する新たな施策が求められています。",
          "kana": "きんねんのしじょうどうこうをふまえ、「Đàm phán điều khoản hợp đồng phân phối độc quyền」にかんするあらたなせさくがもとめられています。",
          "vi": "Dựa trên diễn biến thị trường gần đây, việc thực thi chính sách mới về \"Đàm phán điều khoản hợp đồng phân phối độc quyền\" là vô cùng cấp thiết."
        },
        {
          "speaker": "Đại biểu",
          "role": "B",
          "kanji": "長期的視点に立った費用対効果の検証が不可欠ですね。",
          "kana": "ちょうきてきしてんにたったひようたいこうかのけんしょうがふかけつですね。",
          "vi": "Việc kiểm chứng hiệu quả chi phí dựa trên tầm nhìn dài hạn là điều không thể thiếu."
        },
        {
          "speaker": "Chuyên gia",
          "role": "A",
          "kanji": "その通りです。持続可能性を重視した戦略的アプローチこそが成功の鍵となります。",
          "kana": "そのとおりです。じぞくかのうせいをじゅうししたせんりゃくてきあぷろーちこそがせいこうのかぎとなります。",
          "vi": "Hoàn toàn chính xác. Chính cách tiếp cận chiến lược lấy tính bền vững làm trọng tâm mới là chìa khóa then chốt thành công."
        }
      ],
      "question": "Theo quan điểm của chuyên gia, yếu tố quyết định thành công của \"Đàm phán điều khoản hợp đồng phân phối độc quyền\" là gì?",
      "options": [
        {
          "id": "A",
          "text": "Chạy theo lợi ích ngắn hạn trước mắt"
        },
        {
          "id": "B",
          "text": "Chiến lược dài hạn lấy tính bền vững và hiệu quả chi phí làm trọng tâm"
        },
        {
          "id": "C",
          "text": "Cắt giảm toàn bộ chi phí nghiên cứu phát triển"
        },
        {
          "id": "D",
          "text": "Ủy thác hoàn toàn cho đối thủ cạnh tranh"
        }
      ],
      "correctAnswer": "B",
      "explanation": "Chuyên gia khẳng định: 「持続可能性を重視した戦略的アプローチこそが成功の鍵」(Chiến lược bền vững mới là chìa khóa). Đáp án đúng là B.",
      "keyword": "Đàm phán điều khoản hợp đồng phân phối độc quyền & 持続可能性",
      "tip": "Ở cấp độ N2, câu hỏi thường yêu cầu suy luận ý định người nói (話者の意図) thay vì chỉ bắt từng từ vựng đơn lẻ."
    },
    {
      "id": "N2_3",
      "level": "N2",
      "lesson": 3,
      "topic": "Bài 03: Phân tích xu hướng chuyển đổi số của doanh nghiệp Nhật",
      "situation": "Chủ đề thảo luận chuyên sâu thương mại và học thuật N2: Phân tích xu hướng chuyển đổi số của doanh nghiệp Nhật.",
      "audioText": "こちらはJLPT N2レベルの聴解試験です。話の要点と話者の意図を的確に把握して回答してください。",
      "dialogue": [
        {
          "speaker": "Chuyên gia",
          "role": "A",
          "kanji": "近年の市場動向を踏まえ、「Phân tích xu hướng chuyển đổi số của doanh nghiệp Nhật」に関する新たな施策が求められています。",
          "kana": "きんねんのしじょうどうこうをふまえ、「Phân tích xu hướng chuyển đổi số của doanh nghiệp Nhật」にかんするあらたなせさくがもとめられています。",
          "vi": "Dựa trên diễn biến thị trường gần đây, việc thực thi chính sách mới về \"Phân tích xu hướng chuyển đổi số của doanh nghiệp Nhật\" là vô cùng cấp thiết."
        },
        {
          "speaker": "Đại biểu",
          "role": "B",
          "kanji": "長期的視点に立った費用対効果の検証が不可欠ですね。",
          "kana": "ちょうきてきしてんにたったひようたいこうかのけんしょうがふかけつですね。",
          "vi": "Việc kiểm chứng hiệu quả chi phí dựa trên tầm nhìn dài hạn là điều không thể thiếu."
        },
        {
          "speaker": "Chuyên gia",
          "role": "A",
          "kanji": "その通りです。持続可能性を重視した戦略的アプローチこそが成功の鍵となります。",
          "kana": "そのとおりです。じぞくかのうせいをじゅうししたせんりゃくてきあぷろーちこそがせいこうのかぎとなります。",
          "vi": "Hoàn toàn chính xác. Chính cách tiếp cận chiến lược lấy tính bền vững làm trọng tâm mới là chìa khóa then chốt thành công."
        }
      ],
      "question": "Theo quan điểm của chuyên gia, yếu tố quyết định thành công của \"Phân tích xu hướng chuyển đổi số của doanh nghiệp Nhật\" là gì?",
      "options": [
        {
          "id": "A",
          "text": "Chạy theo lợi ích ngắn hạn trước mắt"
        },
        {
          "id": "B",
          "text": "Chiến lược dài hạn lấy tính bền vững và hiệu quả chi phí làm trọng tâm"
        },
        {
          "id": "C",
          "text": "Cắt giảm toàn bộ chi phí nghiên cứu phát triển"
        },
        {
          "id": "D",
          "text": "Ủy thác hoàn toàn cho đối thủ cạnh tranh"
        }
      ],
      "correctAnswer": "B",
      "explanation": "Chuyên gia khẳng định: 「持続可能性を重視した戦略的アプローチこそが成功の鍵」(Chiến lược bền vững mới là chìa khóa). Đáp án đúng là B.",
      "keyword": "Phân tích xu hướng chuyển đổi số của doanh nghiệp Nhật & 持続可能性",
      "tip": "Ở cấp độ N2, câu hỏi thường yêu cầu suy luận ý định người nói (話者の意図) thay vì chỉ bắt từng từ vựng đơn lẻ."
    },
    {
      "id": "N2_4",
      "level": "N2",
      "lesson": 4,
      "topic": "Bài 04: Họp ban quản trị về quản trị rủi ro chuỗi cung ứng",
      "situation": "Chủ đề thảo luận chuyên sâu thương mại và học thuật N2: Họp ban quản trị về quản trị rủi ro chuỗi cung ứng.",
      "audioText": "こちらはJLPT N2レベルの聴解試験です。話の要点と話者の意図を的確に把握して回答してください。",
      "dialogue": [
        {
          "speaker": "Chuyên gia",
          "role": "A",
          "kanji": "近年の市場動向を踏まえ、「Họp ban quản trị về quản trị rủi ro chuỗi cung ứng」に関する新たな施策が求められています。",
          "kana": "きんねんのしじょうどうこうをふまえ、「Họp ban quản trị về quản trị rủi ro chuỗi cung ứng」にかんするあらたなせさくがもとめられています。",
          "vi": "Dựa trên diễn biến thị trường gần đây, việc thực thi chính sách mới về \"Họp ban quản trị về quản trị rủi ro chuỗi cung ứng\" là vô cùng cấp thiết."
        },
        {
          "speaker": "Đại biểu",
          "role": "B",
          "kanji": "長期的視点に立った費用対効果の検証が不可欠ですね。",
          "kana": "ちょうきてきしてんにたったひようたいこうかのけんしょうがふかけつですね。",
          "vi": "Việc kiểm chứng hiệu quả chi phí dựa trên tầm nhìn dài hạn là điều không thể thiếu."
        },
        {
          "speaker": "Chuyên gia",
          "role": "A",
          "kanji": "その通りです。持続可能性を重視した戦略的アプローチこそが成功の鍵となります。",
          "kana": "そのとおりです。じぞくかのうせいをじゅうししたせんりゃくてきあぷろーちこそがせいこうのかぎとなります。",
          "vi": "Hoàn toàn chính xác. Chính cách tiếp cận chiến lược lấy tính bền vững làm trọng tâm mới là chìa khóa then chốt thành công."
        }
      ],
      "question": "Theo quan điểm của chuyên gia, yếu tố quyết định thành công của \"Họp ban quản trị về quản trị rủi ro chuỗi cung ứng\" là gì?",
      "options": [
        {
          "id": "A",
          "text": "Chạy theo lợi ích ngắn hạn trước mắt"
        },
        {
          "id": "B",
          "text": "Chiến lược dài hạn lấy tính bền vững và hiệu quả chi phí làm trọng tâm"
        },
        {
          "id": "C",
          "text": "Cắt giảm toàn bộ chi phí nghiên cứu phát triển"
        },
        {
          "id": "D",
          "text": "Ủy thác hoàn toàn cho đối thủ cạnh tranh"
        }
      ],
      "correctAnswer": "B",
      "explanation": "Chuyên gia khẳng định: 「持続可能性を重視した戦略的アプローチこそが成功の鍵」(Chiến lược bền vững mới là chìa khóa). Đáp án đúng là B.",
      "keyword": "Họp ban quản trị về quản trị rủi ro chuỗi cung ứng & 持続可能性",
      "tip": "Ở cấp độ N2, câu hỏi thường yêu cầu suy luận ý định người nói (話者の意図) thay vì chỉ bắt từng từ vựng đơn lẻ."
    },
    {
      "id": "N2_5",
      "level": "N2",
      "lesson": 5,
      "topic": "Bài 05: Tọa đàm kinh tế về biến động tỷ giá ngoại hối đồng Yên",
      "situation": "Chủ đề thảo luận chuyên sâu thương mại và học thuật N2: Tọa đàm kinh tế về biến động tỷ giá ngoại hối đồng Yên.",
      "audioText": "こちらはJLPT N2レベルの聴解試験です。話の要点と話者の意図を的確に把握して回答してください。",
      "dialogue": [
        {
          "speaker": "Chuyên gia",
          "role": "A",
          "kanji": "近年の市場動向を踏まえ、「Tọa đàm kinh tế về biến động tỷ giá ngoại hối đồng Yên」に関する新たな施策が求められています。",
          "kana": "きんねんのしじょうどうこうをふまえ、「Tọa đàm kinh tế về biến động tỷ giá ngoại hối đồng Yên」にかんするあらたなせさくがもとめられています。",
          "vi": "Dựa trên diễn biến thị trường gần đây, việc thực thi chính sách mới về \"Tọa đàm kinh tế về biến động tỷ giá ngoại hối đồng Yên\" là vô cùng cấp thiết."
        },
        {
          "speaker": "Đại biểu",
          "role": "B",
          "kanji": "長期的視点に立った費用対効果の検証が不可欠ですね。",
          "kana": "ちょうきてきしてんにたったひようたいこうかのけんしょうがふかけつですね。",
          "vi": "Việc kiểm chứng hiệu quả chi phí dựa trên tầm nhìn dài hạn là điều không thể thiếu."
        },
        {
          "speaker": "Chuyên gia",
          "role": "A",
          "kanji": "その通りです。持続可能性を重視した戦略的アプローチこそが成功の鍵となります。",
          "kana": "そのとおりです。じぞくかのうせいをじゅうししたせんりゃくてきあぷろーちこそがせいこうのかぎとなります。",
          "vi": "Hoàn toàn chính xác. Chính cách tiếp cận chiến lược lấy tính bền vững làm trọng tâm mới là chìa khóa then chốt thành công."
        }
      ],
      "question": "Theo quan điểm của chuyên gia, yếu tố quyết định thành công của \"Tọa đàm kinh tế về biến động tỷ giá ngoại hối đồng Yên\" là gì?",
      "options": [
        {
          "id": "A",
          "text": "Chạy theo lợi ích ngắn hạn trước mắt"
        },
        {
          "id": "B",
          "text": "Chiến lược dài hạn lấy tính bền vững và hiệu quả chi phí làm trọng tâm"
        },
        {
          "id": "C",
          "text": "Cắt giảm toàn bộ chi phí nghiên cứu phát triển"
        },
        {
          "id": "D",
          "text": "Ủy thác hoàn toàn cho đối thủ cạnh tranh"
        }
      ],
      "correctAnswer": "B",
      "explanation": "Chuyên gia khẳng định: 「持続可能性を重視した戦略的アプローチこそが成功の鍵」(Chiến lược bền vững mới là chìa khóa). Đáp án đúng là B.",
      "keyword": "Tọa đàm kinh tế về biến động tỷ giá ngoại hối đồng Yên & 持続可能性",
      "tip": "Ở cấp độ N2, câu hỏi thường yêu cầu suy luận ý định người nói (話者の意図) thay vì chỉ bắt từng từ vựng đơn lẻ."
    },
    {
      "id": "N2_6",
      "level": "N2",
      "lesson": 6,
      "topic": "Bài 06: Ứng dụng trí tuệ nhân tạo (AI) trong chẩn đoán y khoa",
      "situation": "Chủ đề thảo luận chuyên sâu thương mại và học thuật N2: Ứng dụng trí tuệ nhân tạo (AI) trong chẩn đoán y khoa.",
      "audioText": "こちらはJLPT N2レベルの聴解試験です。話の要点と話者の意図を的確に把握して回答してください。",
      "dialogue": [
        {
          "speaker": "Chuyên gia",
          "role": "A",
          "kanji": "近年の市場動向を踏まえ、「Ứng dụng trí tuệ nhân tạo (AI) trong chẩn đoán y khoa」に関する新たな施策が求められています。",
          "kana": "きんねんのしじょうどうこうをふまえ、「Ứng dụng trí tuệ nhân tạo (AI) trong chẩn đoán y khoa」にかんするあらたなせさくがもとめられています。",
          "vi": "Dựa trên diễn biến thị trường gần đây, việc thực thi chính sách mới về \"Ứng dụng trí tuệ nhân tạo (AI) trong chẩn đoán y khoa\" là vô cùng cấp thiết."
        },
        {
          "speaker": "Đại biểu",
          "role": "B",
          "kanji": "長期的視点に立った費用対効果の検証が不可欠ですね。",
          "kana": "ちょうきてきしてんにたったひようたいこうかのけんしょうがふかけつですね。",
          "vi": "Việc kiểm chứng hiệu quả chi phí dựa trên tầm nhìn dài hạn là điều không thể thiếu."
        },
        {
          "speaker": "Chuyên gia",
          "role": "A",
          "kanji": "その通りです。持続可能性を重視した戦略的アプローチこそが成功の鍵となります。",
          "kana": "そのとおりです。じぞくかのうせいをじゅうししたせんりゃくてきあぷろーちこそがせいこうのかぎとなります。",
          "vi": "Hoàn toàn chính xác. Chính cách tiếp cận chiến lược lấy tính bền vững làm trọng tâm mới là chìa khóa then chốt thành công."
        }
      ],
      "question": "Theo quan điểm của chuyên gia, yếu tố quyết định thành công của \"Ứng dụng trí tuệ nhân tạo (AI) trong chẩn đoán y khoa\" là gì?",
      "options": [
        {
          "id": "A",
          "text": "Chạy theo lợi ích ngắn hạn trước mắt"
        },
        {
          "id": "B",
          "text": "Chiến lược dài hạn lấy tính bền vững và hiệu quả chi phí làm trọng tâm"
        },
        {
          "id": "C",
          "text": "Cắt giảm toàn bộ chi phí nghiên cứu phát triển"
        },
        {
          "id": "D",
          "text": "Ủy thác hoàn toàn cho đối thủ cạnh tranh"
        }
      ],
      "correctAnswer": "B",
      "explanation": "Chuyên gia khẳng định: 「持続可能性を重視した戦略的アプローチこそが成功の鍵」(Chiến lược bền vững mới là chìa khóa). Đáp án đúng là B.",
      "keyword": "Ứng dụng trí tuệ nhân tạo (AI) trong chẩn đoán y khoa & 持続可能性",
      "tip": "Ở cấp độ N2, câu hỏi thường yêu cầu suy luận ý định người nói (話者の意図) thay vì chỉ bắt từng từ vựng đơn lẻ."
    },
    {
      "id": "N2_7",
      "level": "N2",
      "lesson": 7,
      "topic": "Bài 07: Chính sách cân bằng công việc và đời sống (Work-Life Balance)",
      "situation": "Chủ đề thảo luận chuyên sâu thương mại và học thuật N2: Chính sách cân bằng công việc và đời sống (Work-Life Balance).",
      "audioText": "こちらはJLPT N2レベルの聴解試験です。話の要点と話者の意図を的確に把握して回答してください。",
      "dialogue": [
        {
          "speaker": "Chuyên gia",
          "role": "A",
          "kanji": "近年の市場動向を踏まえ、「Chính sách cân bằng công việc và đời sống (Work-Life Balance)」に関する新たな施策が求められています。",
          "kana": "きんねんのしじょうどうこうをふまえ、「Chính sách cân bằng công việc và đời sống (Work-Life Balance)」にかんするあらたなせさくがもとめられています。",
          "vi": "Dựa trên diễn biến thị trường gần đây, việc thực thi chính sách mới về \"Chính sách cân bằng công việc và đời sống (Work-Life Balance)\" là vô cùng cấp thiết."
        },
        {
          "speaker": "Đại biểu",
          "role": "B",
          "kanji": "長期的視点に立った費用対効果の検証が不可欠ですね。",
          "kana": "ちょうきてきしてんにたったひようたいこうかのけんしょうがふかけつですね。",
          "vi": "Việc kiểm chứng hiệu quả chi phí dựa trên tầm nhìn dài hạn là điều không thể thiếu."
        },
        {
          "speaker": "Chuyên gia",
          "role": "A",
          "kanji": "その通りです。持続可能性を重視した戦略的アプローチこそが成功の鍵となります。",
          "kana": "そのとおりです。じぞくかのうせいをじゅうししたせんりゃくてきあぷろーちこそがせいこうのかぎとなります。",
          "vi": "Hoàn toàn chính xác. Chính cách tiếp cận chiến lược lấy tính bền vững làm trọng tâm mới là chìa khóa then chốt thành công."
        }
      ],
      "question": "Theo quan điểm của chuyên gia, yếu tố quyết định thành công của \"Chính sách cân bằng công việc và đời sống (Work-Life Balance)\" là gì?",
      "options": [
        {
          "id": "A",
          "text": "Chạy theo lợi ích ngắn hạn trước mắt"
        },
        {
          "id": "B",
          "text": "Chiến lược dài hạn lấy tính bền vững và hiệu quả chi phí làm trọng tâm"
        },
        {
          "id": "C",
          "text": "Cắt giảm toàn bộ chi phí nghiên cứu phát triển"
        },
        {
          "id": "D",
          "text": "Ủy thác hoàn toàn cho đối thủ cạnh tranh"
        }
      ],
      "correctAnswer": "B",
      "explanation": "Chuyên gia khẳng định: 「持続可能性を重視した戦略的アプローチこそが成功の鍵」(Chiến lược bền vững mới là chìa khóa). Đáp án đúng là B.",
      "keyword": "Chính sách cân bằng công việc và đời sống (Work-Life Balance) & 持続可能性",
      "tip": "Ở cấp độ N2, câu hỏi thường yêu cầu suy luận ý định người nói (話者の意図) thay vì chỉ bắt từng từ vựng đơn lẻ."
    },
    {
      "id": "N2_8",
      "level": "N2",
      "lesson": 8,
      "topic": "Bài 08: An ninh mạng và bảo vệ dữ liệu cá nhân khách hàng",
      "situation": "Chủ đề thảo luận chuyên sâu thương mại và học thuật N2: An ninh mạng và bảo vệ dữ liệu cá nhân khách hàng.",
      "audioText": "こちらはJLPT N2レベルの聴解試験です。話の要点と話者の意図を的確に把握して回答してください。",
      "dialogue": [
        {
          "speaker": "Chuyên gia",
          "role": "A",
          "kanji": "近年の市場動向を踏まえ、「An ninh mạng và bảo vệ dữ liệu cá nhân khách hàng」に関する新たな施策が求められています。",
          "kana": "きんねんのしじょうどうこうをふまえ、「An ninh mạng và bảo vệ dữ liệu cá nhân khách hàng」にかんするあらたなせさくがもとめられています。",
          "vi": "Dựa trên diễn biến thị trường gần đây, việc thực thi chính sách mới về \"An ninh mạng và bảo vệ dữ liệu cá nhân khách hàng\" là vô cùng cấp thiết."
        },
        {
          "speaker": "Đại biểu",
          "role": "B",
          "kanji": "長期的視点に立った費用対効果の検証が不可欠ですね。",
          "kana": "ちょうきてきしてんにたったひようたいこうかのけんしょうがふかけつですね。",
          "vi": "Việc kiểm chứng hiệu quả chi phí dựa trên tầm nhìn dài hạn là điều không thể thiếu."
        },
        {
          "speaker": "Chuyên gia",
          "role": "A",
          "kanji": "その通りです。持続可能性を重視した戦略的アプローチこそが成功の鍵となります。",
          "kana": "そのとおりです。じぞくかのうせいをじゅうししたせんりゃくてきあぷろーちこそがせいこうのかぎとなります。",
          "vi": "Hoàn toàn chính xác. Chính cách tiếp cận chiến lược lấy tính bền vững làm trọng tâm mới là chìa khóa then chốt thành công."
        }
      ],
      "question": "Theo quan điểm của chuyên gia, yếu tố quyết định thành công của \"An ninh mạng và bảo vệ dữ liệu cá nhân khách hàng\" là gì?",
      "options": [
        {
          "id": "A",
          "text": "Chạy theo lợi ích ngắn hạn trước mắt"
        },
        {
          "id": "B",
          "text": "Chiến lược dài hạn lấy tính bền vững và hiệu quả chi phí làm trọng tâm"
        },
        {
          "id": "C",
          "text": "Cắt giảm toàn bộ chi phí nghiên cứu phát triển"
        },
        {
          "id": "D",
          "text": "Ủy thác hoàn toàn cho đối thủ cạnh tranh"
        }
      ],
      "correctAnswer": "B",
      "explanation": "Chuyên gia khẳng định: 「持続可能性を重視した戦略的アプローチこそが成功の鍵」(Chiến lược bền vững mới là chìa khóa). Đáp án đúng là B.",
      "keyword": "An ninh mạng và bảo vệ dữ liệu cá nhân khách hàng & 持続可能性",
      "tip": "Ở cấp độ N2, câu hỏi thường yêu cầu suy luận ý định người nói (話者の意図) thay vì chỉ bắt từng từ vựng đơn lẻ."
    },
    {
      "id": "N2_9",
      "level": "N2",
      "lesson": 9,
      "topic": "Bài 09: Bảo tồn di sản kiến trúc cổ trong lòng đô thị Tokyo",
      "situation": "Chủ đề thảo luận chuyên sâu thương mại và học thuật N2: Bảo tồn di sản kiến trúc cổ trong lòng đô thị Tokyo.",
      "audioText": "こちらはJLPT N2レベルの聴解試験です。話の要点と話者の意図を的確に把握して回答してください。",
      "dialogue": [
        {
          "speaker": "Chuyên gia",
          "role": "A",
          "kanji": "近年の市場動向を踏まえ、「Bảo tồn di sản kiến trúc cổ trong lòng đô thị Tokyo」に関する新たな施策が求められています。",
          "kana": "きんねんのしじょうどうこうをふまえ、「Bảo tồn di sản kiến trúc cổ trong lòng đô thị Tokyo」にかんするあらたなせさくがもとめられています。",
          "vi": "Dựa trên diễn biến thị trường gần đây, việc thực thi chính sách mới về \"Bảo tồn di sản kiến trúc cổ trong lòng đô thị Tokyo\" là vô cùng cấp thiết."
        },
        {
          "speaker": "Đại biểu",
          "role": "B",
          "kanji": "長期的視点に立った費用対効果の検証が不可欠ですね。",
          "kana": "ちょうきてきしてんにたったひようたいこうかのけんしょうがふかけつですね。",
          "vi": "Việc kiểm chứng hiệu quả chi phí dựa trên tầm nhìn dài hạn là điều không thể thiếu."
        },
        {
          "speaker": "Chuyên gia",
          "role": "A",
          "kanji": "その通りです。持続可能性を重視した戦略的アプローチこそが成功の鍵となります。",
          "kana": "そのとおりです。じぞくかのうせいをじゅうししたせんりゃくてきあぷろーちこそがせいこうのかぎとなります。",
          "vi": "Hoàn toàn chính xác. Chính cách tiếp cận chiến lược lấy tính bền vững làm trọng tâm mới là chìa khóa then chốt thành công."
        }
      ],
      "question": "Theo quan điểm của chuyên gia, yếu tố quyết định thành công của \"Bảo tồn di sản kiến trúc cổ trong lòng đô thị Tokyo\" là gì?",
      "options": [
        {
          "id": "A",
          "text": "Chạy theo lợi ích ngắn hạn trước mắt"
        },
        {
          "id": "B",
          "text": "Chiến lược dài hạn lấy tính bền vững và hiệu quả chi phí làm trọng tâm"
        },
        {
          "id": "C",
          "text": "Cắt giảm toàn bộ chi phí nghiên cứu phát triển"
        },
        {
          "id": "D",
          "text": "Ủy thác hoàn toàn cho đối thủ cạnh tranh"
        }
      ],
      "correctAnswer": "B",
      "explanation": "Chuyên gia khẳng định: 「持続可能性を重視した戦略的アプローチこそが成功の鍵」(Chiến lược bền vững mới là chìa khóa). Đáp án đúng là B.",
      "keyword": "Bảo tồn di sản kiến trúc cổ trong lòng đô thị Tokyo & 持続可能性",
      "tip": "Ở cấp độ N2, câu hỏi thường yêu cầu suy luận ý định người nói (話者の意図) thay vì chỉ bắt từng từ vựng đơn lẻ."
    },
    {
      "id": "N2_10",
      "level": "N2",
      "lesson": 10,
      "topic": "Bài 10: Giải quyết tranh chấp quyền sở hữu trí tuệ thương hiệu",
      "situation": "Chủ đề thảo luận chuyên sâu thương mại và học thuật N2: Giải quyết tranh chấp quyền sở hữu trí tuệ thương hiệu.",
      "audioText": "こちらはJLPT N2レベルの聴解試験です。話の要点と話者の意図を的確に把握して回答してください。",
      "dialogue": [
        {
          "speaker": "Chuyên gia",
          "role": "A",
          "kanji": "近年の市場動向を踏まえ、「Giải quyết tranh chấp quyền sở hữu trí tuệ thương hiệu」に関する新たな施策が求められています。",
          "kana": "きんねんのしじょうどうこうをふまえ、「Giải quyết tranh chấp quyền sở hữu trí tuệ thương hiệu」にかんするあらたなせさくがもとめられています。",
          "vi": "Dựa trên diễn biến thị trường gần đây, việc thực thi chính sách mới về \"Giải quyết tranh chấp quyền sở hữu trí tuệ thương hiệu\" là vô cùng cấp thiết."
        },
        {
          "speaker": "Đại biểu",
          "role": "B",
          "kanji": "長期的視点に立った費用対効果の検証が不可欠ですね。",
          "kana": "ちょうきてきしてんにたったひようたいこうかのけんしょうがふかけつですね。",
          "vi": "Việc kiểm chứng hiệu quả chi phí dựa trên tầm nhìn dài hạn là điều không thể thiếu."
        },
        {
          "speaker": "Chuyên gia",
          "role": "A",
          "kanji": "その通りです。持続可能性を重視した戦略的アプローチこそが成功の鍵となります。",
          "kana": "そのとおりです。じぞくかのうせいをじゅうししたせんりゃくてきあぷろーちこそがせいこうのかぎとなります。",
          "vi": "Hoàn toàn chính xác. Chính cách tiếp cận chiến lược lấy tính bền vững làm trọng tâm mới là chìa khóa then chốt thành công."
        }
      ],
      "question": "Theo quan điểm của chuyên gia, yếu tố quyết định thành công của \"Giải quyết tranh chấp quyền sở hữu trí tuệ thương hiệu\" là gì?",
      "options": [
        {
          "id": "A",
          "text": "Chạy theo lợi ích ngắn hạn trước mắt"
        },
        {
          "id": "B",
          "text": "Chiến lược dài hạn lấy tính bền vững và hiệu quả chi phí làm trọng tâm"
        },
        {
          "id": "C",
          "text": "Cắt giảm toàn bộ chi phí nghiên cứu phát triển"
        },
        {
          "id": "D",
          "text": "Ủy thác hoàn toàn cho đối thủ cạnh tranh"
        }
      ],
      "correctAnswer": "B",
      "explanation": "Chuyên gia khẳng định: 「持続可能性を重視した戦略的アプローチこそが成功の鍵」(Chiến lược bền vững mới là chìa khóa). Đáp án đúng là B.",
      "keyword": "Giải quyết tranh chấp quyền sở hữu trí tuệ thương hiệu & 持続可能性",
      "tip": "Ở cấp độ N2, câu hỏi thường yêu cầu suy luận ý định người nói (話者の意図) thay vì chỉ bắt từng từ vựng đơn lẻ."
    },
    {
      "id": "N2_11",
      "level": "N2",
      "lesson": 11,
      "topic": "Bài 11: Phát biểu của chuyên gia về năng lượng tái tạo",
      "situation": "Chủ đề thảo luận chuyên sâu thương mại và học thuật N2: Phát biểu của chuyên gia về năng lượng tái tạo.",
      "audioText": "こちらはJLPT N2レベルの聴解試験です。話の要点と話者の意図を的確に把握して回答してください。",
      "dialogue": [
        {
          "speaker": "Chuyên gia",
          "role": "A",
          "kanji": "近年の市場動向を踏まえ、「Phát biểu của chuyên gia về năng lượng tái tạo」に関する新たな施策が求められています。",
          "kana": "きんねんのしじょうどうこうをふまえ、「Phát biểu của chuyên gia về năng lượng tái tạo」にかんするあらたなせさくがもとめられています。",
          "vi": "Dựa trên diễn biến thị trường gần đây, việc thực thi chính sách mới về \"Phát biểu của chuyên gia về năng lượng tái tạo\" là vô cùng cấp thiết."
        },
        {
          "speaker": "Đại biểu",
          "role": "B",
          "kanji": "長期的視点に立った費用対効果の検証が不可欠ですね。",
          "kana": "ちょうきてきしてんにたったひようたいこうかのけんしょうがふかけつですね。",
          "vi": "Việc kiểm chứng hiệu quả chi phí dựa trên tầm nhìn dài hạn là điều không thể thiếu."
        },
        {
          "speaker": "Chuyên gia",
          "role": "A",
          "kanji": "その通りです。持続可能性を重視した戦略的アプローチこそが成功の鍵となります。",
          "kana": "そのとおりです。じぞくかのうせいをじゅうししたせんりゃくてきあぷろーちこそがせいこうのかぎとなります。",
          "vi": "Hoàn toàn chính xác. Chính cách tiếp cận chiến lược lấy tính bền vững làm trọng tâm mới là chìa khóa then chốt thành công."
        }
      ],
      "question": "Theo quan điểm của chuyên gia, yếu tố quyết định thành công của \"Phát biểu của chuyên gia về năng lượng tái tạo\" là gì?",
      "options": [
        {
          "id": "A",
          "text": "Chạy theo lợi ích ngắn hạn trước mắt"
        },
        {
          "id": "B",
          "text": "Chiến lược dài hạn lấy tính bền vững và hiệu quả chi phí làm trọng tâm"
        },
        {
          "id": "C",
          "text": "Cắt giảm toàn bộ chi phí nghiên cứu phát triển"
        },
        {
          "id": "D",
          "text": "Ủy thác hoàn toàn cho đối thủ cạnh tranh"
        }
      ],
      "correctAnswer": "B",
      "explanation": "Chuyên gia khẳng định: 「持続可能性を重視した戦略的アプローチこそが成功の鍵」(Chiến lược bền vững mới là chìa khóa). Đáp án đúng là B.",
      "keyword": "Phát biểu của chuyên gia về năng lượng tái tạo & 持続可能性",
      "tip": "Ở cấp độ N2, câu hỏi thường yêu cầu suy luận ý định người nói (話者の意図) thay vì chỉ bắt từng từ vựng đơn lẻ."
    },
    {
      "id": "N2_12",
      "level": "N2",
      "lesson": 12,
      "topic": "Bài 12: Quy trình tuyển dụng và đánh giá năng lực ứng viên cấp cao",
      "situation": "Chủ đề thảo luận chuyên sâu thương mại và học thuật N2: Quy trình tuyển dụng và đánh giá năng lực ứng viên cấp cao.",
      "audioText": "こちらはJLPT N2レベルの聴解試験です。話の要点と話者の意図を的確に把握して回答してください。",
      "dialogue": [
        {
          "speaker": "Chuyên gia",
          "role": "A",
          "kanji": "近年の市場動向を踏まえ、「Quy trình tuyển dụng và đánh giá năng lực ứng viên cấp cao」に関する新たな施策が求められています。",
          "kana": "きんねんのしじょうどうこうをふまえ、「Quy trình tuyển dụng và đánh giá năng lực ứng viên cấp cao」にかんするあらたなせさくがもとめられています。",
          "vi": "Dựa trên diễn biến thị trường gần đây, việc thực thi chính sách mới về \"Quy trình tuyển dụng và đánh giá năng lực ứng viên cấp cao\" là vô cùng cấp thiết."
        },
        {
          "speaker": "Đại biểu",
          "role": "B",
          "kanji": "長期的視点に立った費用対効果の検証が不可欠ですね。",
          "kana": "ちょうきてきしてんにたったひようたいこうかのけんしょうがふかけつですね。",
          "vi": "Việc kiểm chứng hiệu quả chi phí dựa trên tầm nhìn dài hạn là điều không thể thiếu."
        },
        {
          "speaker": "Chuyên gia",
          "role": "A",
          "kanji": "その通りです。持続可能性を重視した戦略的アプローチこそが成功の鍵となります。",
          "kana": "そのとおりです。じぞくかのうせいをじゅうししたせんりゃくてきあぷろーちこそがせいこうのかぎとなります。",
          "vi": "Hoàn toàn chính xác. Chính cách tiếp cận chiến lược lấy tính bền vững làm trọng tâm mới là chìa khóa then chốt thành công."
        }
      ],
      "question": "Theo quan điểm của chuyên gia, yếu tố quyết định thành công của \"Quy trình tuyển dụng và đánh giá năng lực ứng viên cấp cao\" là gì?",
      "options": [
        {
          "id": "A",
          "text": "Chạy theo lợi ích ngắn hạn trước mắt"
        },
        {
          "id": "B",
          "text": "Chiến lược dài hạn lấy tính bền vững và hiệu quả chi phí làm trọng tâm"
        },
        {
          "id": "C",
          "text": "Cắt giảm toàn bộ chi phí nghiên cứu phát triển"
        },
        {
          "id": "D",
          "text": "Ủy thác hoàn toàn cho đối thủ cạnh tranh"
        }
      ],
      "correctAnswer": "B",
      "explanation": "Chuyên gia khẳng định: 「持続可能性を重視した戦略的アプローチこそが成功の鍵」(Chiến lược bền vững mới là chìa khóa). Đáp án đúng là B.",
      "keyword": "Quy trình tuyển dụng và đánh giá năng lực ứng viên cấp cao & 持続可能性",
      "tip": "Ở cấp độ N2, câu hỏi thường yêu cầu suy luận ý định người nói (話者の意図) thay vì chỉ bắt từng từ vựng đơn lẻ."
    },
    {
      "id": "N2_13",
      "level": "N2",
      "lesson": 13,
      "topic": "Bài 13: Kiểm toán nội bộ và tuân thủ chuẩn mực đạo đức kinh doanh",
      "situation": "Chủ đề thảo luận chuyên sâu thương mại và học thuật N2: Kiểm toán nội bộ và tuân thủ chuẩn mực đạo đức kinh doanh.",
      "audioText": "こちらはJLPT N2レベルの聴解試験です。話の要点と話者の意図を的確に把握して回答してください。",
      "dialogue": [
        {
          "speaker": "Chuyên gia",
          "role": "A",
          "kanji": "近年の市場動向を踏まえ、「Kiểm toán nội bộ và tuân thủ chuẩn mực đạo đức kinh doanh」に関する新たな施策が求められています。",
          "kana": "きんねんのしじょうどうこうをふまえ、「Kiểm toán nội bộ và tuân thủ chuẩn mực đạo đức kinh doanh」にかんするあらたなせさくがもとめられています。",
          "vi": "Dựa trên diễn biến thị trường gần đây, việc thực thi chính sách mới về \"Kiểm toán nội bộ và tuân thủ chuẩn mực đạo đức kinh doanh\" là vô cùng cấp thiết."
        },
        {
          "speaker": "Đại biểu",
          "role": "B",
          "kanji": "長期的視点に立った費用対効果の検証が不可欠ですね。",
          "kana": "ちょうきてきしてんにたったひようたいこうかのけんしょうがふかけつですね。",
          "vi": "Việc kiểm chứng hiệu quả chi phí dựa trên tầm nhìn dài hạn là điều không thể thiếu."
        },
        {
          "speaker": "Chuyên gia",
          "role": "A",
          "kanji": "その通りです。持続可能性を重視した戦略的アプローチこそが成功の鍵となります。",
          "kana": "そのとおりです。じぞくかのうせいをじゅうししたせんりゃくてきあぷろーちこそがせいこうのかぎとなります。",
          "vi": "Hoàn toàn chính xác. Chính cách tiếp cận chiến lược lấy tính bền vững làm trọng tâm mới là chìa khóa then chốt thành công."
        }
      ],
      "question": "Theo quan điểm của chuyên gia, yếu tố quyết định thành công của \"Kiểm toán nội bộ và tuân thủ chuẩn mực đạo đức kinh doanh\" là gì?",
      "options": [
        {
          "id": "A",
          "text": "Chạy theo lợi ích ngắn hạn trước mắt"
        },
        {
          "id": "B",
          "text": "Chiến lược dài hạn lấy tính bền vững và hiệu quả chi phí làm trọng tâm"
        },
        {
          "id": "C",
          "text": "Cắt giảm toàn bộ chi phí nghiên cứu phát triển"
        },
        {
          "id": "D",
          "text": "Ủy thác hoàn toàn cho đối thủ cạnh tranh"
        }
      ],
      "correctAnswer": "B",
      "explanation": "Chuyên gia khẳng định: 「持続可能性を重視した戦略的アプローチこそが成功の鍵」(Chiến lược bền vững mới là chìa khóa). Đáp án đúng là B.",
      "keyword": "Kiểm toán nội bộ và tuân thủ chuẩn mực đạo đức kinh doanh & 持続可能性",
      "tip": "Ở cấp độ N2, câu hỏi thường yêu cầu suy luận ý định người nói (話者の意図) thay vì chỉ bắt từng từ vựng đơn lẻ."
    },
    {
      "id": "N2_14",
      "level": "N2",
      "lesson": 14,
      "topic": "Bài 14: Tác động của già hóa dân số đối với thị trường tiêu dùng",
      "situation": "Chủ đề thảo luận chuyên sâu thương mại và học thuật N2: Tác động của già hóa dân số đối với thị trường tiêu dùng.",
      "audioText": "こちらはJLPT N2レベルの聴解試験です。話の要点と話者の意図を的確に把握して回答してください。",
      "dialogue": [
        {
          "speaker": "Chuyên gia",
          "role": "A",
          "kanji": "近年の市場動向を踏まえ、「Tác động của già hóa dân số đối với thị trường tiêu dùng」に関する新たな施策が求められています。",
          "kana": "きんねんのしじょうどうこうをふまえ、「Tác động của già hóa dân số đối với thị trường tiêu dùng」にかんするあらたなせさくがもとめられています。",
          "vi": "Dựa trên diễn biến thị trường gần đây, việc thực thi chính sách mới về \"Tác động của già hóa dân số đối với thị trường tiêu dùng\" là vô cùng cấp thiết."
        },
        {
          "speaker": "Đại biểu",
          "role": "B",
          "kanji": "長期的視点に立った費用対効果の検証が不可欠ですね。",
          "kana": "ちょうきてきしてんにたったひようたいこうかのけんしょうがふかけつですね。",
          "vi": "Việc kiểm chứng hiệu quả chi phí dựa trên tầm nhìn dài hạn là điều không thể thiếu."
        },
        {
          "speaker": "Chuyên gia",
          "role": "A",
          "kanji": "その通りです。持続可能性を重視した戦略的アプローチこそが成功の鍵となります。",
          "kana": "そのとおりです。じぞくかのうせいをじゅうししたせんりゃくてきあぷろーちこそがせいこうのかぎとなります。",
          "vi": "Hoàn toàn chính xác. Chính cách tiếp cận chiến lược lấy tính bền vững làm trọng tâm mới là chìa khóa then chốt thành công."
        }
      ],
      "question": "Theo quan điểm của chuyên gia, yếu tố quyết định thành công của \"Tác động của già hóa dân số đối với thị trường tiêu dùng\" là gì?",
      "options": [
        {
          "id": "A",
          "text": "Chạy theo lợi ích ngắn hạn trước mắt"
        },
        {
          "id": "B",
          "text": "Chiến lược dài hạn lấy tính bền vững và hiệu quả chi phí làm trọng tâm"
        },
        {
          "id": "C",
          "text": "Cắt giảm toàn bộ chi phí nghiên cứu phát triển"
        },
        {
          "id": "D",
          "text": "Ủy thác hoàn toàn cho đối thủ cạnh tranh"
        }
      ],
      "correctAnswer": "B",
      "explanation": "Chuyên gia khẳng định: 「持続可能性を重視した戦略的アプローチこそが成功の鍵」(Chiến lược bền vững mới là chìa khóa). Đáp án đúng là B.",
      "keyword": "Tác động của già hóa dân số đối với thị trường tiêu dùng & 持続可能性",
      "tip": "Ở cấp độ N2, câu hỏi thường yêu cầu suy luận ý định người nói (話者の意図) thay vì chỉ bắt từng từ vựng đơn lẻ."
    },
    {
      "id": "N2_15",
      "level": "N2",
      "lesson": 15,
      "topic": "Bài 15: Chiến lược cắt giảm phát thải khí nhà kính Scope 3",
      "situation": "Chủ đề thảo luận chuyên sâu thương mại và học thuật N2: Chiến lược cắt giảm phát thải khí nhà kính Scope 3.",
      "audioText": "こちらはJLPT N2レベルの聴解試験です。話の要点と話者の意図を的確に把握して回答してください。",
      "dialogue": [
        {
          "speaker": "Chuyên gia",
          "role": "A",
          "kanji": "近年の市場動向を踏まえ、「Chiến lược cắt giảm phát thải khí nhà kính Scope 3」に関する新たな施策が求められています。",
          "kana": "きんねんのしじょうどうこうをふまえ、「Chiến lược cắt giảm phát thải khí nhà kính Scope 3」にかんするあらたなせさくがもとめられています。",
          "vi": "Dựa trên diễn biến thị trường gần đây, việc thực thi chính sách mới về \"Chiến lược cắt giảm phát thải khí nhà kính Scope 3\" là vô cùng cấp thiết."
        },
        {
          "speaker": "Đại biểu",
          "role": "B",
          "kanji": "長期的視点に立った費用対効果の検証が不可欠ですね。",
          "kana": "ちょうきてきしてんにたったひようたいこうかのけんしょうがふかけつですね。",
          "vi": "Việc kiểm chứng hiệu quả chi phí dựa trên tầm nhìn dài hạn là điều không thể thiếu."
        },
        {
          "speaker": "Chuyên gia",
          "role": "A",
          "kanji": "その通りです。持続可能性を重視した戦略的アプローチこそが成功の鍵となります。",
          "kana": "そのとおりです。じぞくかのうせいをじゅうししたせんりゃくてきあぷろーちこそがせいこうのかぎとなります。",
          "vi": "Hoàn toàn chính xác. Chính cách tiếp cận chiến lược lấy tính bền vững làm trọng tâm mới là chìa khóa then chốt thành công."
        }
      ],
      "question": "Theo quan điểm của chuyên gia, yếu tố quyết định thành công của \"Chiến lược cắt giảm phát thải khí nhà kính Scope 3\" là gì?",
      "options": [
        {
          "id": "A",
          "text": "Chạy theo lợi ích ngắn hạn trước mắt"
        },
        {
          "id": "B",
          "text": "Chiến lược dài hạn lấy tính bền vững và hiệu quả chi phí làm trọng tâm"
        },
        {
          "id": "C",
          "text": "Cắt giảm toàn bộ chi phí nghiên cứu phát triển"
        },
        {
          "id": "D",
          "text": "Ủy thác hoàn toàn cho đối thủ cạnh tranh"
        }
      ],
      "correctAnswer": "B",
      "explanation": "Chuyên gia khẳng định: 「持続可能性を重視した戦略的アプローチこそが成功の鍵」(Chiến lược bền vững mới là chìa khóa). Đáp án đúng là B.",
      "keyword": "Chiến lược cắt giảm phát thải khí nhà kính Scope 3 & 持続可能性",
      "tip": "Ở cấp độ N2, câu hỏi thường yêu cầu suy luận ý định người nói (話者の意図) thay vì chỉ bắt từng từ vựng đơn lẻ."
    },
    {
      "id": "N2_16",
      "level": "N2",
      "lesson": 16,
      "topic": "Bài 16: Đánh giá hiệu quả chiến dịch truyền thông kỹ thuật số",
      "situation": "Chủ đề thảo luận chuyên sâu thương mại và học thuật N2: Đánh giá hiệu quả chiến dịch truyền thông kỹ thuật số.",
      "audioText": "こちらはJLPT N2レベルの聴解試験です。話の要点と話者の意図を的確に把握して回答してください。",
      "dialogue": [
        {
          "speaker": "Chuyên gia",
          "role": "A",
          "kanji": "近年の市場動向を踏まえ、「Đánh giá hiệu quả chiến dịch truyền thông kỹ thuật số」に関する新たな施策が求められています。",
          "kana": "きんねんのしじょうどうこうをふまえ、「Đánh giá hiệu quả chiến dịch truyền thông kỹ thuật số」にかんするあらたなせさくがもとめられています。",
          "vi": "Dựa trên diễn biến thị trường gần đây, việc thực thi chính sách mới về \"Đánh giá hiệu quả chiến dịch truyền thông kỹ thuật số\" là vô cùng cấp thiết."
        },
        {
          "speaker": "Đại biểu",
          "role": "B",
          "kanji": "長期的視点に立った費用対効果の検証が不可欠ですね。",
          "kana": "ちょうきてきしてんにたったひようたいこうかのけんしょうがふかけつですね。",
          "vi": "Việc kiểm chứng hiệu quả chi phí dựa trên tầm nhìn dài hạn là điều không thể thiếu."
        },
        {
          "speaker": "Chuyên gia",
          "role": "A",
          "kanji": "その通りです。持続可能性を重視した戦略的アプローチこそが成功の鍵となります。",
          "kana": "そのとおりです。じぞくかのうせいをじゅうししたせんりゃくてきあぷろーちこそがせいこうのかぎとなります。",
          "vi": "Hoàn toàn chính xác. Chính cách tiếp cận chiến lược lấy tính bền vững làm trọng tâm mới là chìa khóa then chốt thành công."
        }
      ],
      "question": "Theo quan điểm của chuyên gia, yếu tố quyết định thành công của \"Đánh giá hiệu quả chiến dịch truyền thông kỹ thuật số\" là gì?",
      "options": [
        {
          "id": "A",
          "text": "Chạy theo lợi ích ngắn hạn trước mắt"
        },
        {
          "id": "B",
          "text": "Chiến lược dài hạn lấy tính bền vững và hiệu quả chi phí làm trọng tâm"
        },
        {
          "id": "C",
          "text": "Cắt giảm toàn bộ chi phí nghiên cứu phát triển"
        },
        {
          "id": "D",
          "text": "Ủy thác hoàn toàn cho đối thủ cạnh tranh"
        }
      ],
      "correctAnswer": "B",
      "explanation": "Chuyên gia khẳng định: 「持続可能性を重視した戦略的アプローチこそが成功の鍵」(Chiến lược bền vững mới là chìa khóa). Đáp án đúng là B.",
      "keyword": "Đánh giá hiệu quả chiến dịch truyền thông kỹ thuật số & 持続可能性",
      "tip": "Ở cấp độ N2, câu hỏi thường yêu cầu suy luận ý định người nói (話者の意図) thay vì chỉ bắt từng từ vựng đơn lẻ."
    },
    {
      "id": "N2_17",
      "level": "N2",
      "lesson": 17,
      "topic": "Bài 17: Đào tạo văn hóa ứng xử bình đẳng giới nơi công sở",
      "situation": "Chủ đề thảo luận chuyên sâu thương mại và học thuật N2: Đào tạo văn hóa ứng xử bình đẳng giới nơi công sở.",
      "audioText": "こちらはJLPT N2レベルの聴解試験です。話の要点と話者の意図を的確に把握して回答してください。",
      "dialogue": [
        {
          "speaker": "Chuyên gia",
          "role": "A",
          "kanji": "近年の市場動向を踏まえ、「Đào tạo văn hóa ứng xử bình đẳng giới nơi công sở」に関する新たな施策が求められています。",
          "kana": "きんねんのしじょうどうこうをふまえ、「Đào tạo văn hóa ứng xử bình đẳng giới nơi công sở」にかんするあらたなせさくがもとめられています。",
          "vi": "Dựa trên diễn biến thị trường gần đây, việc thực thi chính sách mới về \"Đào tạo văn hóa ứng xử bình đẳng giới nơi công sở\" là vô cùng cấp thiết."
        },
        {
          "speaker": "Đại biểu",
          "role": "B",
          "kanji": "長期的視点に立った費用対効果の検証が不可欠ですね。",
          "kana": "ちょうきてきしてんにたったひようたいこうかのけんしょうがふかけつですね。",
          "vi": "Việc kiểm chứng hiệu quả chi phí dựa trên tầm nhìn dài hạn là điều không thể thiếu."
        },
        {
          "speaker": "Chuyên gia",
          "role": "A",
          "kanji": "その通りです。持続可能性を重視した戦略的アプローチこそが成功の鍵となります。",
          "kana": "そのとおりです。じぞくかのうせいをじゅうししたせんりゃくてきあぷろーちこそがせいこうのかぎとなります。",
          "vi": "Hoàn toàn chính xác. Chính cách tiếp cận chiến lược lấy tính bền vững làm trọng tâm mới là chìa khóa then chốt thành công."
        }
      ],
      "question": "Theo quan điểm của chuyên gia, yếu tố quyết định thành công của \"Đào tạo văn hóa ứng xử bình đẳng giới nơi công sở\" là gì?",
      "options": [
        {
          "id": "A",
          "text": "Chạy theo lợi ích ngắn hạn trước mắt"
        },
        {
          "id": "B",
          "text": "Chiến lược dài hạn lấy tính bền vững và hiệu quả chi phí làm trọng tâm"
        },
        {
          "id": "C",
          "text": "Cắt giảm toàn bộ chi phí nghiên cứu phát triển"
        },
        {
          "id": "D",
          "text": "Ủy thác hoàn toàn cho đối thủ cạnh tranh"
        }
      ],
      "correctAnswer": "B",
      "explanation": "Chuyên gia khẳng định: 「持続可能性を重視した戦略的アプローチこそが成功の鍵」(Chiến lược bền vững mới là chìa khóa). Đáp án đúng là B.",
      "keyword": "Đào tạo văn hóa ứng xử bình đẳng giới nơi công sở & 持続可能性",
      "tip": "Ở cấp độ N2, câu hỏi thường yêu cầu suy luận ý định người nói (話者の意図) thay vì chỉ bắt từng từ vựng đơn lẻ."
    },
    {
      "id": "N2_18",
      "level": "N2",
      "lesson": 18,
      "topic": "Bài 18: Tái cơ cấu nợ và thương lượng kỳ hạn thanh toán quốc tế",
      "situation": "Chủ đề thảo luận chuyên sâu thương mại và học thuật N2: Tái cơ cấu nợ và thương lượng kỳ hạn thanh toán quốc tế.",
      "audioText": "こちらはJLPT N2レベルの聴解試験です。話の要点と話者の意図を的確に把握して回答してください。",
      "dialogue": [
        {
          "speaker": "Chuyên gia",
          "role": "A",
          "kanji": "近年の市場動向を踏まえ、「Tái cơ cấu nợ và thương lượng kỳ hạn thanh toán quốc tế」に関する新たな施策が求められています。",
          "kana": "きんねんのしじょうどうこうをふまえ、「Tái cơ cấu nợ và thương lượng kỳ hạn thanh toán quốc tế」にかんするあらたなせさくがもとめられています。",
          "vi": "Dựa trên diễn biến thị trường gần đây, việc thực thi chính sách mới về \"Tái cơ cấu nợ và thương lượng kỳ hạn thanh toán quốc tế\" là vô cùng cấp thiết."
        },
        {
          "speaker": "Đại biểu",
          "role": "B",
          "kanji": "長期的視点に立った費用対効果の検証が不可欠ですね。",
          "kana": "ちょうきてきしてんにたったひようたいこうかのけんしょうがふかけつですね。",
          "vi": "Việc kiểm chứng hiệu quả chi phí dựa trên tầm nhìn dài hạn là điều không thể thiếu."
        },
        {
          "speaker": "Chuyên gia",
          "role": "A",
          "kanji": "その通りです。持続可能性を重視した戦略的アプローチこそが成功の鍵となります。",
          "kana": "そのとおりです。じぞくかのうせいをじゅうししたせんりゃくてきあぷろーちこそがせいこうのかぎとなります。",
          "vi": "Hoàn toàn chính xác. Chính cách tiếp cận chiến lược lấy tính bền vững làm trọng tâm mới là chìa khóa then chốt thành công."
        }
      ],
      "question": "Theo quan điểm của chuyên gia, yếu tố quyết định thành công của \"Tái cơ cấu nợ và thương lượng kỳ hạn thanh toán quốc tế\" là gì?",
      "options": [
        {
          "id": "A",
          "text": "Chạy theo lợi ích ngắn hạn trước mắt"
        },
        {
          "id": "B",
          "text": "Chiến lược dài hạn lấy tính bền vững và hiệu quả chi phí làm trọng tâm"
        },
        {
          "id": "C",
          "text": "Cắt giảm toàn bộ chi phí nghiên cứu phát triển"
        },
        {
          "id": "D",
          "text": "Ủy thác hoàn toàn cho đối thủ cạnh tranh"
        }
      ],
      "correctAnswer": "B",
      "explanation": "Chuyên gia khẳng định: 「持続可能性を重視した戦略的アプローチこそが成功の鍵」(Chiến lược bền vững mới là chìa khóa). Đáp án đúng là B.",
      "keyword": "Tái cơ cấu nợ và thương lượng kỳ hạn thanh toán quốc tế & 持続可能性",
      "tip": "Ở cấp độ N2, câu hỏi thường yêu cầu suy luận ý định người nói (話者の意図) thay vì chỉ bắt từng từ vựng đơn lẻ."
    },
    {
      "id": "N2_19",
      "level": "N2",
      "lesson": 19,
      "topic": "Bài 19: Hành vi mua sắm trực tuyến của người tiêu dùng hiện đại",
      "situation": "Chủ đề thảo luận chuyên sâu thương mại và học thuật N2: Hành vi mua sắm trực tuyến của người tiêu dùng hiện đại.",
      "audioText": "こちらはJLPT N2レベルの聴解試験です。話の要点と話者の意図を的確に把握して回答してください。",
      "dialogue": [
        {
          "speaker": "Chuyên gia",
          "role": "A",
          "kanji": "近年の市場動向を踏まえ、「Hành vi mua sắm trực tuyến của người tiêu dùng hiện đại」に関する新たな施策が求められています。",
          "kana": "きんねんのしじょうどうこうをふまえ、「Hành vi mua sắm trực tuyến của người tiêu dùng hiện đại」にかんするあらたなせさくがもとめられています。",
          "vi": "Dựa trên diễn biến thị trường gần đây, việc thực thi chính sách mới về \"Hành vi mua sắm trực tuyến của người tiêu dùng hiện đại\" là vô cùng cấp thiết."
        },
        {
          "speaker": "Đại biểu",
          "role": "B",
          "kanji": "長期的視点に立った費用対効果の検証が不可欠ですね。",
          "kana": "ちょうきてきしてんにたったひようたいこうかのけんしょうがふかけつですね。",
          "vi": "Việc kiểm chứng hiệu quả chi phí dựa trên tầm nhìn dài hạn là điều không thể thiếu."
        },
        {
          "speaker": "Chuyên gia",
          "role": "A",
          "kanji": "その通りです。持続可能性を重視した戦略的アプローチこそが成功の鍵となります。",
          "kana": "そのとおりです。じぞくかのうせいをじゅうししたせんりゃくてきあぷろーちこそがせいこうのかぎとなります。",
          "vi": "Hoàn toàn chính xác. Chính cách tiếp cận chiến lược lấy tính bền vững làm trọng tâm mới là chìa khóa then chốt thành công."
        }
      ],
      "question": "Theo quan điểm của chuyên gia, yếu tố quyết định thành công của \"Hành vi mua sắm trực tuyến của người tiêu dùng hiện đại\" là gì?",
      "options": [
        {
          "id": "A",
          "text": "Chạy theo lợi ích ngắn hạn trước mắt"
        },
        {
          "id": "B",
          "text": "Chiến lược dài hạn lấy tính bền vững và hiệu quả chi phí làm trọng tâm"
        },
        {
          "id": "C",
          "text": "Cắt giảm toàn bộ chi phí nghiên cứu phát triển"
        },
        {
          "id": "D",
          "text": "Ủy thác hoàn toàn cho đối thủ cạnh tranh"
        }
      ],
      "correctAnswer": "B",
      "explanation": "Chuyên gia khẳng định: 「持続可能性を重視した戦略的アプローチこそが成功の鍵」(Chiến lược bền vững mới là chìa khóa). Đáp án đúng là B.",
      "keyword": "Hành vi mua sắm trực tuyến của người tiêu dùng hiện đại & 持続可能性",
      "tip": "Ở cấp độ N2, câu hỏi thường yêu cầu suy luận ý định người nói (話者の意図) thay vì chỉ bắt từng từ vựng đơn lẻ."
    },
    {
      "id": "N2_20",
      "level": "N2",
      "lesson": 20,
      "topic": "Bài 20: Thiết kế công trình xanh thích ứng với thiên tai biến đổi",
      "situation": "Chủ đề thảo luận chuyên sâu thương mại và học thuật N2: Thiết kế công trình xanh thích ứng với thiên tai biến đổi.",
      "audioText": "こちらはJLPT N2レベルの聴解試験です。話の要点と話者の意図を的確に把握して回答してください。",
      "dialogue": [
        {
          "speaker": "Chuyên gia",
          "role": "A",
          "kanji": "近年の市場動向を踏まえ、「Thiết kế công trình xanh thích ứng với thiên tai biến đổi」に関する新たな施策が求められています。",
          "kana": "きんねんのしじょうどうこうをふまえ、「Thiết kế công trình xanh thích ứng với thiên tai biến đổi」にかんするあらたなせさくがもとめられています。",
          "vi": "Dựa trên diễn biến thị trường gần đây, việc thực thi chính sách mới về \"Thiết kế công trình xanh thích ứng với thiên tai biến đổi\" là vô cùng cấp thiết."
        },
        {
          "speaker": "Đại biểu",
          "role": "B",
          "kanji": "長期的視点に立った費用対効果の検証が不可欠ですね。",
          "kana": "ちょうきてきしてんにたったひようたいこうかのけんしょうがふかけつですね。",
          "vi": "Việc kiểm chứng hiệu quả chi phí dựa trên tầm nhìn dài hạn là điều không thể thiếu."
        },
        {
          "speaker": "Chuyên gia",
          "role": "A",
          "kanji": "その通りです。持続可能性を重視した戦略的アプローチこそが成功の鍵となります。",
          "kana": "そのとおりです。じぞくかのうせいをじゅうししたせんりゃくてきあぷろーちこそがせいこうのかぎとなります。",
          "vi": "Hoàn toàn chính xác. Chính cách tiếp cận chiến lược lấy tính bền vững làm trọng tâm mới là chìa khóa then chốt thành công."
        }
      ],
      "question": "Theo quan điểm của chuyên gia, yếu tố quyết định thành công của \"Thiết kế công trình xanh thích ứng với thiên tai biến đổi\" là gì?",
      "options": [
        {
          "id": "A",
          "text": "Chạy theo lợi ích ngắn hạn trước mắt"
        },
        {
          "id": "B",
          "text": "Chiến lược dài hạn lấy tính bền vững và hiệu quả chi phí làm trọng tâm"
        },
        {
          "id": "C",
          "text": "Cắt giảm toàn bộ chi phí nghiên cứu phát triển"
        },
        {
          "id": "D",
          "text": "Ủy thác hoàn toàn cho đối thủ cạnh tranh"
        }
      ],
      "correctAnswer": "B",
      "explanation": "Chuyên gia khẳng định: 「持続可能性を重視した戦略的アプローチこそが成功の鍵」(Chiến lược bền vững mới là chìa khóa). Đáp án đúng là B.",
      "keyword": "Thiết kế công trình xanh thích ứng với thiên tai biến đổi & 持続可能性",
      "tip": "Ở cấp độ N2, câu hỏi thường yêu cầu suy luận ý định người nói (話者の意図) thay vì chỉ bắt từng từ vựng đơn lẻ."
    },
    {
      "id": "N2_21",
      "level": "N2",
      "lesson": 21,
      "topic": "Bài 21: Nhận định thị trường chứng khoán trong quý tài chính tới",
      "situation": "Chủ đề thảo luận chuyên sâu thương mại và học thuật N2: Nhận định thị trường chứng khoán trong quý tài chính tới.",
      "audioText": "こちらはJLPT N2レベルの聴解試験です。話の要点と話者の意図を的確に把握して回答してください。",
      "dialogue": [
        {
          "speaker": "Chuyên gia",
          "role": "A",
          "kanji": "近年の市場動向を踏まえ、「Nhận định thị trường chứng khoán trong quý tài chính tới」に関する新たな施策が求められています。",
          "kana": "きんねんのしじょうどうこうをふまえ、「Nhận định thị trường chứng khoán trong quý tài chính tới」にかんするあらたなせさくがもとめられています。",
          "vi": "Dựa trên diễn biến thị trường gần đây, việc thực thi chính sách mới về \"Nhận định thị trường chứng khoán trong quý tài chính tới\" là vô cùng cấp thiết."
        },
        {
          "speaker": "Đại biểu",
          "role": "B",
          "kanji": "長期的視点に立った費用対効果の検証が不可欠ですね。",
          "kana": "ちょうきてきしてんにたったひようたいこうかのけんしょうがふかけつですね。",
          "vi": "Việc kiểm chứng hiệu quả chi phí dựa trên tầm nhìn dài hạn là điều không thể thiếu."
        },
        {
          "speaker": "Chuyên gia",
          "role": "A",
          "kanji": "その通りです。持続可能性を重視した戦略的アプローチこそが成功の鍵となります。",
          "kana": "そのとおりです。じぞくかのうせいをじゅうししたせんりゃくてきあぷろーちこそがせいこうのかぎとなります。",
          "vi": "Hoàn toàn chính xác. Chính cách tiếp cận chiến lược lấy tính bền vững làm trọng tâm mới là chìa khóa then chốt thành công."
        }
      ],
      "question": "Theo quan điểm của chuyên gia, yếu tố quyết định thành công của \"Nhận định thị trường chứng khoán trong quý tài chính tới\" là gì?",
      "options": [
        {
          "id": "A",
          "text": "Chạy theo lợi ích ngắn hạn trước mắt"
        },
        {
          "id": "B",
          "text": "Chiến lược dài hạn lấy tính bền vững và hiệu quả chi phí làm trọng tâm"
        },
        {
          "id": "C",
          "text": "Cắt giảm toàn bộ chi phí nghiên cứu phát triển"
        },
        {
          "id": "D",
          "text": "Ủy thác hoàn toàn cho đối thủ cạnh tranh"
        }
      ],
      "correctAnswer": "B",
      "explanation": "Chuyên gia khẳng định: 「持続可能性を重視した戦略的アプローチこそが成功の鍵」(Chiến lược bền vững mới là chìa khóa). Đáp án đúng là B.",
      "keyword": "Nhận định thị trường chứng khoán trong quý tài chính tới & 持続可能性",
      "tip": "Ở cấp độ N2, câu hỏi thường yêu cầu suy luận ý định người nói (話者の意図) thay vì chỉ bắt từng từ vựng đơn lẻ."
    },
    {
      "id": "N2_22",
      "level": "N2",
      "lesson": 22,
      "topic": "Bài 22: Thỏa ước lao động tập thể giữa công đoàn và doanh nghiệp",
      "situation": "Chủ đề thảo luận chuyên sâu thương mại và học thuật N2: Thỏa ước lao động tập thể giữa công đoàn và doanh nghiệp.",
      "audioText": "こちらはJLPT N2レベルの聴解試験です。話の要点と話者の意図を的確に把握して回答してください。",
      "dialogue": [
        {
          "speaker": "Chuyên gia",
          "role": "A",
          "kanji": "近年の市場動向を踏まえ、「Thỏa ước lao động tập thể giữa công đoàn và doanh nghiệp」に関する新たな施策が求められています。",
          "kana": "きんねんのしじょうどうこうをふまえ、「Thỏa ước lao động tập thể giữa công đoàn và doanh nghiệp」にかんするあらたなせさくがもとめられています。",
          "vi": "Dựa trên diễn biến thị trường gần đây, việc thực thi chính sách mới về \"Thỏa ước lao động tập thể giữa công đoàn và doanh nghiệp\" là vô cùng cấp thiết."
        },
        {
          "speaker": "Đại biểu",
          "role": "B",
          "kanji": "長期的視点に立った費用対効果の検証が不可欠ですね。",
          "kana": "ちょうきてきしてんにたったひようたいこうかのけんしょうがふかけつですね。",
          "vi": "Việc kiểm chứng hiệu quả chi phí dựa trên tầm nhìn dài hạn là điều không thể thiếu."
        },
        {
          "speaker": "Chuyên gia",
          "role": "A",
          "kanji": "その通りです。持続可能性を重視した戦略的アプローチこそが成功の鍵となります。",
          "kana": "そのとおりです。じぞくかのうせいをじゅうししたせんりゃくてきあぷろーちこそがせいこうのかぎとなります。",
          "vi": "Hoàn toàn chính xác. Chính cách tiếp cận chiến lược lấy tính bền vững làm trọng tâm mới là chìa khóa then chốt thành công."
        }
      ],
      "question": "Theo quan điểm của chuyên gia, yếu tố quyết định thành công của \"Thỏa ước lao động tập thể giữa công đoàn và doanh nghiệp\" là gì?",
      "options": [
        {
          "id": "A",
          "text": "Chạy theo lợi ích ngắn hạn trước mắt"
        },
        {
          "id": "B",
          "text": "Chiến lược dài hạn lấy tính bền vững và hiệu quả chi phí làm trọng tâm"
        },
        {
          "id": "C",
          "text": "Cắt giảm toàn bộ chi phí nghiên cứu phát triển"
        },
        {
          "id": "D",
          "text": "Ủy thác hoàn toàn cho đối thủ cạnh tranh"
        }
      ],
      "correctAnswer": "B",
      "explanation": "Chuyên gia khẳng định: 「持続可能性を重視した戦略的アプローチこそが成功の鍵」(Chiến lược bền vững mới là chìa khóa). Đáp án đúng là B.",
      "keyword": "Thỏa ước lao động tập thể giữa công đoàn và doanh nghiệp & 持続可能性",
      "tip": "Ở cấp độ N2, câu hỏi thường yêu cầu suy luận ý định người nói (話者の意図) thay vì chỉ bắt từng từ vựng đơn lẻ."
    },
    {
      "id": "N2_23",
      "level": "N2",
      "lesson": 23,
      "topic": "Bài 23: Chính sách hạn chế làm thêm giờ và nâng cao năng suất",
      "situation": "Chủ đề thảo luận chuyên sâu thương mại và học thuật N2: Chính sách hạn chế làm thêm giờ và nâng cao năng suất.",
      "audioText": "こちらはJLPT N2レベルの聴解試験です。話の要点と話者の意図を的確に把握して回答してください。",
      "dialogue": [
        {
          "speaker": "Chuyên gia",
          "role": "A",
          "kanji": "近年の市場動向を踏まえ、「Chính sách hạn chế làm thêm giờ và nâng cao năng suất」に関する新たな施策が求められています。",
          "kana": "きんねんのしじょうどうこうをふまえ、「Chính sách hạn chế làm thêm giờ và nâng cao năng suất」にかんするあらたなせさくがもとめられています。",
          "vi": "Dựa trên diễn biến thị trường gần đây, việc thực thi chính sách mới về \"Chính sách hạn chế làm thêm giờ và nâng cao năng suất\" là vô cùng cấp thiết."
        },
        {
          "speaker": "Đại biểu",
          "role": "B",
          "kanji": "長期的視点に立った費用対効果の検証が不可欠ですね。",
          "kana": "ちょうきてきしてんにたったひようたいこうかのけんしょうがふかけつですね。",
          "vi": "Việc kiểm chứng hiệu quả chi phí dựa trên tầm nhìn dài hạn là điều không thể thiếu."
        },
        {
          "speaker": "Chuyên gia",
          "role": "A",
          "kanji": "その通りです。持続可能性を重視した戦略的アプローチこそが成功の鍵となります。",
          "kana": "そのとおりです。じぞくかのうせいをじゅうししたせんりゃくてきあぷろーちこそがせいこうのかぎとなります。",
          "vi": "Hoàn toàn chính xác. Chính cách tiếp cận chiến lược lấy tính bền vững làm trọng tâm mới là chìa khóa then chốt thành công."
        }
      ],
      "question": "Theo quan điểm của chuyên gia, yếu tố quyết định thành công của \"Chính sách hạn chế làm thêm giờ và nâng cao năng suất\" là gì?",
      "options": [
        {
          "id": "A",
          "text": "Chạy theo lợi ích ngắn hạn trước mắt"
        },
        {
          "id": "B",
          "text": "Chiến lược dài hạn lấy tính bền vững và hiệu quả chi phí làm trọng tâm"
        },
        {
          "id": "C",
          "text": "Cắt giảm toàn bộ chi phí nghiên cứu phát triển"
        },
        {
          "id": "D",
          "text": "Ủy thác hoàn toàn cho đối thủ cạnh tranh"
        }
      ],
      "correctAnswer": "B",
      "explanation": "Chuyên gia khẳng định: 「持続可能性を重視した戦略的アプローチこそが成功の鍵」(Chiến lược bền vững mới là chìa khóa). Đáp án đúng là B.",
      "keyword": "Chính sách hạn chế làm thêm giờ và nâng cao năng suất & 持続可能性",
      "tip": "Ở cấp độ N2, câu hỏi thường yêu cầu suy luận ý định người nói (話者の意図) thay vì chỉ bắt từng từ vựng đơn lẻ."
    },
    {
      "id": "N2_24",
      "level": "N2",
      "lesson": 24,
      "topic": "Bài 24: Khai mạc hội chợ triển lãm công nghệ tự động hóa quốc tế",
      "situation": "Chủ đề thảo luận chuyên sâu thương mại và học thuật N2: Khai mạc hội chợ triển lãm công nghệ tự động hóa quốc tế.",
      "audioText": "こちらはJLPT N2レベルの聴解試験です。話の要点と話者の意図を的確に把握して回答してください。",
      "dialogue": [
        {
          "speaker": "Chuyên gia",
          "role": "A",
          "kanji": "近年の市場動向を踏まえ、「Khai mạc hội chợ triển lãm công nghệ tự động hóa quốc tế」に関する新たな施策が求められています。",
          "kana": "きんねんのしじょうどうこうをふまえ、「Khai mạc hội chợ triển lãm công nghệ tự động hóa quốc tế」にかんするあらたなせさくがもとめられています。",
          "vi": "Dựa trên diễn biến thị trường gần đây, việc thực thi chính sách mới về \"Khai mạc hội chợ triển lãm công nghệ tự động hóa quốc tế\" là vô cùng cấp thiết."
        },
        {
          "speaker": "Đại biểu",
          "role": "B",
          "kanji": "長期的視点に立った費用対効果の検証が不可欠ですね。",
          "kana": "ちょうきてきしてんにたったひようたいこうかのけんしょうがふかけつですね。",
          "vi": "Việc kiểm chứng hiệu quả chi phí dựa trên tầm nhìn dài hạn là điều không thể thiếu."
        },
        {
          "speaker": "Chuyên gia",
          "role": "A",
          "kanji": "その通りです。持続可能性を重視した戦略的アプローチこそが成功の鍵となります。",
          "kana": "そのとおりです。じぞくかのうせいをじゅうししたせんりゃくてきあぷろーちこそがせいこうのかぎとなります。",
          "vi": "Hoàn toàn chính xác. Chính cách tiếp cận chiến lược lấy tính bền vững làm trọng tâm mới là chìa khóa then chốt thành công."
        }
      ],
      "question": "Theo quan điểm của chuyên gia, yếu tố quyết định thành công của \"Khai mạc hội chợ triển lãm công nghệ tự động hóa quốc tế\" là gì?",
      "options": [
        {
          "id": "A",
          "text": "Chạy theo lợi ích ngắn hạn trước mắt"
        },
        {
          "id": "B",
          "text": "Chiến lược dài hạn lấy tính bền vững và hiệu quả chi phí làm trọng tâm"
        },
        {
          "id": "C",
          "text": "Cắt giảm toàn bộ chi phí nghiên cứu phát triển"
        },
        {
          "id": "D",
          "text": "Ủy thác hoàn toàn cho đối thủ cạnh tranh"
        }
      ],
      "correctAnswer": "B",
      "explanation": "Chuyên gia khẳng định: 「持続可能性を重視した戦略的アプローチこそが成功の鍵」(Chiến lược bền vững mới là chìa khóa). Đáp án đúng là B.",
      "keyword": "Khai mạc hội chợ triển lãm công nghệ tự động hóa quốc tế & 持続可能性",
      "tip": "Ở cấp độ N2, câu hỏi thường yêu cầu suy luận ý định người nói (話者の意図) thay vì chỉ bắt từng từ vựng đơn lẻ."
    },
    {
      "id": "N2_25",
      "level": "N2",
      "lesson": 25,
      "topic": "Bài 25: Tổng kết chiến lược kinh doanh 5 năm và định hướng tương lai",
      "situation": "Chủ đề thảo luận chuyên sâu thương mại và học thuật N2: Tổng kết chiến lược kinh doanh 5 năm và định hướng tương lai.",
      "audioText": "こちらはJLPT N2レベルの聴解試験です。話の要点と話者の意図を的確に把握して回答してください。",
      "dialogue": [
        {
          "speaker": "Chuyên gia",
          "role": "A",
          "kanji": "近年の市場動向を踏まえ、「Tổng kết chiến lược kinh doanh 5 năm và định hướng tương lai」に関する新たな施策が求められています。",
          "kana": "きんねんのしじょうどうこうをふまえ、「Tổng kết chiến lược kinh doanh 5 năm và định hướng tương lai」にかんするあらたなせさくがもとめられています。",
          "vi": "Dựa trên diễn biến thị trường gần đây, việc thực thi chính sách mới về \"Tổng kết chiến lược kinh doanh 5 năm và định hướng tương lai\" là vô cùng cấp thiết."
        },
        {
          "speaker": "Đại biểu",
          "role": "B",
          "kanji": "長期的視点に立った費用対効果の検証が不可欠ですね。",
          "kana": "ちょうきてきしてんにたったひようたいこうかのけんしょうがふかけつですね。",
          "vi": "Việc kiểm chứng hiệu quả chi phí dựa trên tầm nhìn dài hạn là điều không thể thiếu."
        },
        {
          "speaker": "Chuyên gia",
          "role": "A",
          "kanji": "その通りです。持続可能性を重視した戦略的アプローチこそが成功の鍵となります。",
          "kana": "そのとおりです。じぞくかのうせいをじゅうししたせんりゃくてきあぷろーちこそがせいこうのかぎとなります。",
          "vi": "Hoàn toàn chính xác. Chính cách tiếp cận chiến lược lấy tính bền vững làm trọng tâm mới là chìa khóa then chốt thành công."
        }
      ],
      "question": "Theo quan điểm của chuyên gia, yếu tố quyết định thành công của \"Tổng kết chiến lược kinh doanh 5 năm và định hướng tương lai\" là gì?",
      "options": [
        {
          "id": "A",
          "text": "Chạy theo lợi ích ngắn hạn trước mắt"
        },
        {
          "id": "B",
          "text": "Chiến lược dài hạn lấy tính bền vững và hiệu quả chi phí làm trọng tâm"
        },
        {
          "id": "C",
          "text": "Cắt giảm toàn bộ chi phí nghiên cứu phát triển"
        },
        {
          "id": "D",
          "text": "Ủy thác hoàn toàn cho đối thủ cạnh tranh"
        }
      ],
      "correctAnswer": "B",
      "explanation": "Chuyên gia khẳng định: 「持続可能性を重視した戦略的アプローチこそが成功の鍵」(Chiến lược bền vững mới là chìa khóa). Đáp án đúng là B.",
      "keyword": "Tổng kết chiến lược kinh doanh 5 năm và định hướng tương lai & 持続可能性",
      "tip": "Ở cấp độ N2, câu hỏi thường yêu cầu suy luận ý định người nói (話者の意図) thay vì chỉ bắt từng từ vựng đơn lẻ."
    }
  ],
  "N1": [
    {
      "id": "N1_1",
      "level": "N1",
      "lesson": 1,
      "topic": "Bài 01: Biện chứng triết học về mối quan hệ giữa công nghệ và bản tính con người",
      "situation": "Chủ đề thượng cấp học thuật và nghị trường N1: Biện chứng triết học về mối quan hệ giữa công nghệ và bản tính con người.",
      "audioText": "こちらは最高峰JLPT N1レベルの聴解試験です。高度な論理展開と抽象的表現を正確に把握して回答してください。",
      "dialogue": [
        {
          "speaker": "Giáo sư",
          "role": "A",
          "kanji": "「Biện chứng triết học về mối quan hệ giữa công nghệ và bản tính con người」を巡る議論においては、皮相的な解釈を排し、本質的な構造的連関に着目せねばなりません。",
          "kana": "「Biện chứng triết học về mối quan hệ giữa công nghệ và bản tính con người」をめぐるぎろんにおいては、ひそうてきなかいしゃくをはいし、ほんしつてきなこうぞうてきれんかんにちゃくもくせねばなりません。",
          "vi": "Trong các cuộc luận chiến xoay quanh đề tài \"Biện chứng triết học về mối quan hệ giữa công nghệ và bản tính con người\", ta buộc phải gạt bỏ những diễn giải hời hợt bề mặt để tập trung vào mối liên hệ cấu trúc mang tính bản chất."
        },
        {
          "speaker": "Học giả",
          "role": "B",
          "kanji": "既存のパラダイムを再考し、多元的視座からアプローチすることが肝要ですね。",
          "kana": "きそんのぱらだいむをさいこうし、たげんてきしざからあぷろーちすることがかんようですね。",
          "vi": "Việc phản tư lại các khuôn mẫu lý thuyết hiện có và tiếp cận từ góc nhìn đa chiều là điều tối quan trọng."
        },
        {
          "speaker": "Giáo sư",
          "role": "A",
          "kanji": "正にその通りです。学際的知見の統合こそが、未曾有の課題に対する突破口を拓くのです。",
          "kana": "まさにそのとおりです。がくさいてきちけんのとうごうこそが、みぞうのかだいに対するとっぱこうをひらくのです。",
          "vi": "Đích thị là như vậy. Chính sự hội tụ của tri thức liên ngành mới khai mở được bước đột phá trước những thách thức chưa từng có tiền lệ."
        }
      ],
      "question": "Thông điệp học thuật cốt lõi được giáo sư và học giả đồng thuận trong cuộc thảo luận về \"Biện chứng triết học về mối quan hệ giữa công nghệ và bản tính con người\" là gì?",
      "options": [
        {
          "id": "A",
          "text": "Duy trì cách tiếp cận đơn ngành cổ điển không thay đổi"
        },
        {
          "id": "B",
          "text": "Cần nhìn nhận bản chất cấu trúc và hội tụ tri thức liên ngành đa chiều để tạo đột phá"
        },
        {
          "id": "C",
          "text": "Từ bỏ việc nghiên cứu vì vấn đề quá phức tạp"
        },
        {
          "id": "D",
          "text": "Chỉ tập trung vào lợi ích kinh tế thực dụng"
        }
      ],
      "correctAnswer": "B",
      "explanation": "Giáo sư đúc kết: 「学際的知見の統合こそが、未曾有の課題に対する突破口を拓く」(Hội tụ tri thức liên ngành mở ra đột phá). Đáp án đúng là B.",
      "keyword": "Biện chứng triết học về mối quan hệ giữa công nghệ và bản tính con người & 学際的知見",
      "tip": "N1 Choukai đòi hỏi khả năng nắm bắt văn phong học thuật trừu tượng, các quán dụng ngữ cao cấp và cách lập luận triết học."
    },
    {
      "id": "N1_2",
      "level": "N1",
      "lesson": 2,
      "topic": "Bài 02: Tranh luận nghị trường về cải cách hiến pháp và thể chế tài khóa",
      "situation": "Chủ đề thượng cấp học thuật và nghị trường N1: Tranh luận nghị trường về cải cách hiến pháp và thể chế tài khóa.",
      "audioText": "こちらは最高峰JLPT N1レベルの聴解試験です。高度な論理展開と抽象的表現を正確に把握して回答してください。",
      "dialogue": [
        {
          "speaker": "Giáo sư",
          "role": "A",
          "kanji": "「Tranh luận nghị trường về cải cách hiến pháp và thể chế tài khóa」を巡る議論においては、皮相的な解釈を排し、本質的な構造的連関に着目せねばなりません。",
          "kana": "「Tranh luận nghị trường về cải cách hiến pháp và thể chế tài khóa」をめぐるぎろんにおいては、ひそうてきなかいしゃくをはいし、ほんしつてきなこうぞうてきれんかんにちゃくもくせねばなりません。",
          "vi": "Trong các cuộc luận chiến xoay quanh đề tài \"Tranh luận nghị trường về cải cách hiến pháp và thể chế tài khóa\", ta buộc phải gạt bỏ những diễn giải hời hợt bề mặt để tập trung vào mối liên hệ cấu trúc mang tính bản chất."
        },
        {
          "speaker": "Học giả",
          "role": "B",
          "kanji": "既存のパラダイムを再考し、多元的視座からアプローチすることが肝要ですね。",
          "kana": "きそんのぱらだいむをさいこうし、たげんてきしざからあぷろーちすることがかんようですね。",
          "vi": "Việc phản tư lại các khuôn mẫu lý thuyết hiện có và tiếp cận từ góc nhìn đa chiều là điều tối quan trọng."
        },
        {
          "speaker": "Giáo sư",
          "role": "A",
          "kanji": "正にその通りです。学際的知見の統合こそが、未曾有の課題に対する突破口を拓くのです。",
          "kana": "まさにそのとおりです。がくさいてきちけんのとうごうこそが、みぞうのかだいに対するとっぱこうをひらくのです。",
          "vi": "Đích thị là như vậy. Chính sự hội tụ của tri thức liên ngành mới khai mở được bước đột phá trước những thách thức chưa từng có tiền lệ."
        }
      ],
      "question": "Thông điệp học thuật cốt lõi được giáo sư và học giả đồng thuận trong cuộc thảo luận về \"Tranh luận nghị trường về cải cách hiến pháp và thể chế tài khóa\" là gì?",
      "options": [
        {
          "id": "A",
          "text": "Duy trì cách tiếp cận đơn ngành cổ điển không thay đổi"
        },
        {
          "id": "B",
          "text": "Cần nhìn nhận bản chất cấu trúc và hội tụ tri thức liên ngành đa chiều để tạo đột phá"
        },
        {
          "id": "C",
          "text": "Từ bỏ việc nghiên cứu vì vấn đề quá phức tạp"
        },
        {
          "id": "D",
          "text": "Chỉ tập trung vào lợi ích kinh tế thực dụng"
        }
      ],
      "correctAnswer": "B",
      "explanation": "Giáo sư đúc kết: 「学際的知見の統合こそが、未曾有の課題に対する突破口を拓く」(Hội tụ tri thức liên ngành mở ra đột phá). Đáp án đúng là B.",
      "keyword": "Tranh luận nghị trường về cải cách hiến pháp và thể chế tài khóa & 学際的知見",
      "tip": "N1 Choukai đòi hỏi khả năng nắm bắt văn phong học thuật trừu tượng, các quán dụng ngữ cao cấp và cách lập luận triết học."
    },
    {
      "id": "N1_3",
      "level": "N1",
      "lesson": 3,
      "topic": "Bài 03: Diễn thuyết học thuật về tiến hóa ngôn ngữ và tâm lý học nhận thức",
      "situation": "Chủ đề thượng cấp học thuật và nghị trường N1: Diễn thuyết học thuật về tiến hóa ngôn ngữ và tâm lý học nhận thức.",
      "audioText": "こちらは最高峰JLPT N1レベルの聴解試験です。高度な論理展開と抽象的表現を正確に把握して回答してください。",
      "dialogue": [
        {
          "speaker": "Giáo sư",
          "role": "A",
          "kanji": "「Diễn thuyết học thuật về tiến hóa ngôn ngữ và tâm lý học nhận thức」を巡る議論においては、皮相的な解釈を排し、本質的な構造的連関に着目せねばなりません。",
          "kana": "「Diễn thuyết học thuật về tiến hóa ngôn ngữ và tâm lý học nhận thức」をめぐるぎろんにおいては、ひそうてきなかいしゃくをはいし、ほんしつてきなこうぞうてきれんかんにちゃくもくせねばなりません。",
          "vi": "Trong các cuộc luận chiến xoay quanh đề tài \"Diễn thuyết học thuật về tiến hóa ngôn ngữ và tâm lý học nhận thức\", ta buộc phải gạt bỏ những diễn giải hời hợt bề mặt để tập trung vào mối liên hệ cấu trúc mang tính bản chất."
        },
        {
          "speaker": "Học giả",
          "role": "B",
          "kanji": "既存のパラダイムを再考し、多元的視座からアプローチすることが肝要ですね。",
          "kana": "きそんのぱらだいむをさいこうし、たげんてきしざからあぷろーちすることがかんようですね。",
          "vi": "Việc phản tư lại các khuôn mẫu lý thuyết hiện có và tiếp cận từ góc nhìn đa chiều là điều tối quan trọng."
        },
        {
          "speaker": "Giáo sư",
          "role": "A",
          "kanji": "正にその通りです。学際的知見の統合こそが、未曾有の課題に対する突破口を拓くのです。",
          "kana": "まさにそのとおりです。がくさいてきちけんのとうごうこそが、みぞうのかだいに対するとっぱこうをひらくのです。",
          "vi": "Đích thị là như vậy. Chính sự hội tụ của tri thức liên ngành mới khai mở được bước đột phá trước những thách thức chưa từng có tiền lệ."
        }
      ],
      "question": "Thông điệp học thuật cốt lõi được giáo sư và học giả đồng thuận trong cuộc thảo luận về \"Diễn thuyết học thuật về tiến hóa ngôn ngữ và tâm lý học nhận thức\" là gì?",
      "options": [
        {
          "id": "A",
          "text": "Duy trì cách tiếp cận đơn ngành cổ điển không thay đổi"
        },
        {
          "id": "B",
          "text": "Cần nhìn nhận bản chất cấu trúc và hội tụ tri thức liên ngành đa chiều để tạo đột phá"
        },
        {
          "id": "C",
          "text": "Từ bỏ việc nghiên cứu vì vấn đề quá phức tạp"
        },
        {
          "id": "D",
          "text": "Chỉ tập trung vào lợi ích kinh tế thực dụng"
        }
      ],
      "correctAnswer": "B",
      "explanation": "Giáo sư đúc kết: 「学際的知見の統合こそが、未曾有の課題に対する突破口を拓く」(Hội tụ tri thức liên ngành mở ra đột phá). Đáp án đúng là B.",
      "keyword": "Diễn thuyết học thuật về tiến hóa ngôn ngữ và tâm lý học nhận thức & 学際的知見",
      "tip": "N1 Choukai đòi hỏi khả năng nắm bắt văn phong học thuật trừu tượng, các quán dụng ngữ cao cấp và cách lập luận triết học."
    },
    {
      "id": "N1_4",
      "level": "N1",
      "lesson": 4,
      "topic": "Bài 04: Khảo luận mỹ học truyền thống Nhật Bản: Wabi-Sabi và Tính vô thường",
      "situation": "Chủ đề thượng cấp học thuật và nghị trường N1: Khảo luận mỹ học truyền thống Nhật Bản: Wabi-Sabi và Tính vô thường.",
      "audioText": "こちらは最高峰JLPT N1レベルの聴解試験です。高度な論理展開と抽象的表現を正確に把握して回答してください。",
      "dialogue": [
        {
          "speaker": "Giáo sư",
          "role": "A",
          "kanji": "「Khảo luận mỹ học truyền thống Nhật Bản: Wabi-Sabi và Tính vô thường」を巡る議論においては、皮相的な解釈を排し、本質的な構造的連関に着目せねばなりません。",
          "kana": "「Khảo luận mỹ học truyền thống Nhật Bản: Wabi-Sabi và Tính vô thường」をめぐるぎろんにおいては、ひそうてきなかいしゃくをはいし、ほんしつてきなこうぞうてきれんかんにちゃくもくせねばなりません。",
          "vi": "Trong các cuộc luận chiến xoay quanh đề tài \"Khảo luận mỹ học truyền thống Nhật Bản: Wabi-Sabi và Tính vô thường\", ta buộc phải gạt bỏ những diễn giải hời hợt bề mặt để tập trung vào mối liên hệ cấu trúc mang tính bản chất."
        },
        {
          "speaker": "Học giả",
          "role": "B",
          "kanji": "既存のパラダイムを再考し、多元的視座からアプローチすることが肝要ですね。",
          "kana": "きそんのぱらだいむをさいこうし、たげんてきしざからあぷろーちすることがかんようですね。",
          "vi": "Việc phản tư lại các khuôn mẫu lý thuyết hiện có và tiếp cận từ góc nhìn đa chiều là điều tối quan trọng."
        },
        {
          "speaker": "Giáo sư",
          "role": "A",
          "kanji": "正にその通りです。学際的知見の統合こそが、未曾有の課題に対する突破口を拓くのです。",
          "kana": "まさにそのとおりです。がくさいてきちけんのとうごうこそが、みぞうのかだいに対するとっぱこうをひらくのです。",
          "vi": "Đích thị là như vậy. Chính sự hội tụ của tri thức liên ngành mới khai mở được bước đột phá trước những thách thức chưa từng có tiền lệ."
        }
      ],
      "question": "Thông điệp học thuật cốt lõi được giáo sư và học giả đồng thuận trong cuộc thảo luận về \"Khảo luận mỹ học truyền thống Nhật Bản: Wabi-Sabi và Tính vô thường\" là gì?",
      "options": [
        {
          "id": "A",
          "text": "Duy trì cách tiếp cận đơn ngành cổ điển không thay đổi"
        },
        {
          "id": "B",
          "text": "Cần nhìn nhận bản chất cấu trúc và hội tụ tri thức liên ngành đa chiều để tạo đột phá"
        },
        {
          "id": "C",
          "text": "Từ bỏ việc nghiên cứu vì vấn đề quá phức tạp"
        },
        {
          "id": "D",
          "text": "Chỉ tập trung vào lợi ích kinh tế thực dụng"
        }
      ],
      "correctAnswer": "B",
      "explanation": "Giáo sư đúc kết: 「学際的知見の統合こそが、未曾有の課題に対する突破口を拓く」(Hội tụ tri thức liên ngành mở ra đột phá). Đáp án đúng là B.",
      "keyword": "Khảo luận mỹ học truyền thống Nhật Bản: Wabi-Sabi và Tính vô thường & 学際的知見",
      "tip": "N1 Choukai đòi hỏi khả năng nắm bắt văn phong học thuật trừu tượng, các quán dụng ngữ cao cấp và cách lập luận triết học."
    },
    {
      "id": "N1_5",
      "level": "N1",
      "lesson": 5,
      "topic": "Bài 05: Phân tích xã hội học về hiện tượng cô lập và cấu trúc cộng đồng đô thị",
      "situation": "Chủ đề thượng cấp học thuật và nghị trường N1: Phân tích xã hội học về hiện tượng cô lập và cấu trúc cộng đồng đô thị.",
      "audioText": "こちらは最高峰JLPT N1レベルの聴解試験です。高度な論理展開と抽象的表現を正確に把握して回答してください。",
      "dialogue": [
        {
          "speaker": "Giáo sư",
          "role": "A",
          "kanji": "「Phân tích xã hội học về hiện tượng cô lập và cấu trúc cộng đồng đô thị」を巡る議論においては、皮相的な解釈を排し、本質的な構造的連関に着目せねばなりません。",
          "kana": "「Phân tích xã hội học về hiện tượng cô lập và cấu trúc cộng đồng đô thị」をめぐるぎろんにおいては、ひそうてきなかいしゃくをはいし、ほんしつてきなこうぞうてきれんかんにちゃくもくせねばなりません。",
          "vi": "Trong các cuộc luận chiến xoay quanh đề tài \"Phân tích xã hội học về hiện tượng cô lập và cấu trúc cộng đồng đô thị\", ta buộc phải gạt bỏ những diễn giải hời hợt bề mặt để tập trung vào mối liên hệ cấu trúc mang tính bản chất."
        },
        {
          "speaker": "Học giả",
          "role": "B",
          "kanji": "既存のパラダイムを再考し、多元的視座からアプローチすることが肝要ですね。",
          "kana": "きそんのぱらだいむをさいこうし、たげんてきしざからあぷろーちすることがかんようですね。",
          "vi": "Việc phản tư lại các khuôn mẫu lý thuyết hiện có và tiếp cận từ góc nhìn đa chiều là điều tối quan trọng."
        },
        {
          "speaker": "Giáo sư",
          "role": "A",
          "kanji": "正にその通りです。学際的知見の統合こそが、未曾有の課題に対する突破口を拓くのです。",
          "kana": "まさにそのとおりです。がくさいてきちけんのとうごうこそが、みぞうのかだいに対するとっぱこうをひらくのです。",
          "vi": "Đích thị là như vậy. Chính sự hội tụ của tri thức liên ngành mới khai mở được bước đột phá trước những thách thức chưa từng có tiền lệ."
        }
      ],
      "question": "Thông điệp học thuật cốt lõi được giáo sư và học giả đồng thuận trong cuộc thảo luận về \"Phân tích xã hội học về hiện tượng cô lập và cấu trúc cộng đồng đô thị\" là gì?",
      "options": [
        {
          "id": "A",
          "text": "Duy trì cách tiếp cận đơn ngành cổ điển không thay đổi"
        },
        {
          "id": "B",
          "text": "Cần nhìn nhận bản chất cấu trúc và hội tụ tri thức liên ngành đa chiều để tạo đột phá"
        },
        {
          "id": "C",
          "text": "Từ bỏ việc nghiên cứu vì vấn đề quá phức tạp"
        },
        {
          "id": "D",
          "text": "Chỉ tập trung vào lợi ích kinh tế thực dụng"
        }
      ],
      "correctAnswer": "B",
      "explanation": "Giáo sư đúc kết: 「学際的知見の統合こそが、未曾有の課題に対する突破口を拓く」(Hội tụ tri thức liên ngành mở ra đột phá). Đáp án đúng là B.",
      "keyword": "Phân tích xã hội học về hiện tượng cô lập và cấu trúc cộng đồng đô thị & 学際的知見",
      "tip": "N1 Choukai đòi hỏi khả năng nắm bắt văn phong học thuật trừu tượng, các quán dụng ngữ cao cấp và cách lập luận triết học."
    },
    {
      "id": "N1_6",
      "level": "N1",
      "lesson": 6,
      "topic": "Bài 06: Báo cáo y sinh học về cơ chế can thiệp gen đích và đạo đức sinh học",
      "situation": "Chủ đề thượng cấp học thuật và nghị trường N1: Báo cáo y sinh học về cơ chế can thiệp gen đích và đạo đức sinh học.",
      "audioText": "こちらは最高峰JLPT N1レベルの聴解試験です。高度な論理展開と抽象的表現を正確に把握して回答してください。",
      "dialogue": [
        {
          "speaker": "Giáo sư",
          "role": "A",
          "kanji": "「Báo cáo y sinh học về cơ chế can thiệp gen đích và đạo đức sinh học」を巡る議論においては、皮相的な解釈を排し、本質的な構造的連関に着目せねばなりません。",
          "kana": "「Báo cáo y sinh học về cơ chế can thiệp gen đích và đạo đức sinh học」をめぐるぎろんにおいては、ひそうてきなかいしゃくをはいし、ほんしつてきなこうぞうてきれんかんにちゃくもくせねばなりません。",
          "vi": "Trong các cuộc luận chiến xoay quanh đề tài \"Báo cáo y sinh học về cơ chế can thiệp gen đích và đạo đức sinh học\", ta buộc phải gạt bỏ những diễn giải hời hợt bề mặt để tập trung vào mối liên hệ cấu trúc mang tính bản chất."
        },
        {
          "speaker": "Học giả",
          "role": "B",
          "kanji": "既存のパラダイムを再考し、多元的視座からアプローチすることが肝要ですね。",
          "kana": "きそんのぱらだいむをさいこうし、たげんてきしざからあぷろーちすることがかんようですね。",
          "vi": "Việc phản tư lại các khuôn mẫu lý thuyết hiện có và tiếp cận từ góc nhìn đa chiều là điều tối quan trọng."
        },
        {
          "speaker": "Giáo sư",
          "role": "A",
          "kanji": "正にその通りです。学際的知見の統合こそが、未曾有の課題に対する突破口を拓くのです。",
          "kana": "まさにそのとおりです。がくさいてきちけんのとうごうこそが、みぞうのかだいに対するとっぱこうをひらくのです。",
          "vi": "Đích thị là như vậy. Chính sự hội tụ của tri thức liên ngành mới khai mở được bước đột phá trước những thách thức chưa từng có tiền lệ."
        }
      ],
      "question": "Thông điệp học thuật cốt lõi được giáo sư và học giả đồng thuận trong cuộc thảo luận về \"Báo cáo y sinh học về cơ chế can thiệp gen đích và đạo đức sinh học\" là gì?",
      "options": [
        {
          "id": "A",
          "text": "Duy trì cách tiếp cận đơn ngành cổ điển không thay đổi"
        },
        {
          "id": "B",
          "text": "Cần nhìn nhận bản chất cấu trúc và hội tụ tri thức liên ngành đa chiều để tạo đột phá"
        },
        {
          "id": "C",
          "text": "Từ bỏ việc nghiên cứu vì vấn đề quá phức tạp"
        },
        {
          "id": "D",
          "text": "Chỉ tập trung vào lợi ích kinh tế thực dụng"
        }
      ],
      "correctAnswer": "B",
      "explanation": "Giáo sư đúc kết: 「学際的知見の統合こそが、未曾有の課題に対する突破口を拓く」(Hội tụ tri thức liên ngành mở ra đột phá). Đáp án đúng là B.",
      "keyword": "Báo cáo y sinh học về cơ chế can thiệp gen đích và đạo đức sinh học & 学際的知見",
      "tip": "N1 Choukai đòi hỏi khả năng nắm bắt văn phong học thuật trừu tượng, các quán dụng ngữ cao cấp và cách lập luận triết học."
    },
    {
      "id": "N1_7",
      "level": "N1",
      "lesson": 7,
      "topic": "Bài 07: Địa chính trị khu vực châu Á - Thái Bình Dương trong kỷ nguyên đa cực",
      "situation": "Chủ đề thượng cấp học thuật và nghị trường N1: Địa chính trị khu vực châu Á - Thái Bình Dương trong kỷ nguyên đa cực.",
      "audioText": "こちらは最高峰JLPT N1レベルの聴解試験です。高度な論理展開と抽象的表現を正確に把握して回答してください。",
      "dialogue": [
        {
          "speaker": "Giáo sư",
          "role": "A",
          "kanji": "「Địa chính trị khu vực châu Á - Thái Bình Dương trong kỷ nguyên đa cực」を巡る議論においては、皮相的な解釈を排し、本質的な構造的連関に着目せねばなりません。",
          "kana": "「Địa chính trị khu vực châu Á - Thái Bình Dương trong kỷ nguyên đa cực」をめぐるぎろんにおいては、ひそうてきなかいしゃくをはいし、ほんしつてきなこうぞうてきれんかんにちゃくもくせねばなりません。",
          "vi": "Trong các cuộc luận chiến xoay quanh đề tài \"Địa chính trị khu vực châu Á - Thái Bình Dương trong kỷ nguyên đa cực\", ta buộc phải gạt bỏ những diễn giải hời hợt bề mặt để tập trung vào mối liên hệ cấu trúc mang tính bản chất."
        },
        {
          "speaker": "Học giả",
          "role": "B",
          "kanji": "既存のパラダイムを再考し、多元的視座からアプローチすることが肝要ですね。",
          "kana": "きそんのぱらだいむをさいこうし、たげんてきしざからあぷろーちすることがかんようですね。",
          "vi": "Việc phản tư lại các khuôn mẫu lý thuyết hiện có và tiếp cận từ góc nhìn đa chiều là điều tối quan trọng."
        },
        {
          "speaker": "Giáo sư",
          "role": "A",
          "kanji": "正にその通りです。学際的知見の統合こそが、未曾有の課題に対する突破口を拓くのです。",
          "kana": "まさにそのとおりです。がくさいてきちけんのとうごうこそが、みぞうのかだいに対するとっぱこうをひらくのです。",
          "vi": "Đích thị là như vậy. Chính sự hội tụ của tri thức liên ngành mới khai mở được bước đột phá trước những thách thức chưa từng có tiền lệ."
        }
      ],
      "question": "Thông điệp học thuật cốt lõi được giáo sư và học giả đồng thuận trong cuộc thảo luận về \"Địa chính trị khu vực châu Á - Thái Bình Dương trong kỷ nguyên đa cực\" là gì?",
      "options": [
        {
          "id": "A",
          "text": "Duy trì cách tiếp cận đơn ngành cổ điển không thay đổi"
        },
        {
          "id": "B",
          "text": "Cần nhìn nhận bản chất cấu trúc và hội tụ tri thức liên ngành đa chiều để tạo đột phá"
        },
        {
          "id": "C",
          "text": "Từ bỏ việc nghiên cứu vì vấn đề quá phức tạp"
        },
        {
          "id": "D",
          "text": "Chỉ tập trung vào lợi ích kinh tế thực dụng"
        }
      ],
      "correctAnswer": "B",
      "explanation": "Giáo sư đúc kết: 「学際的知見の統合こそが、未曾有の課題に対する突破口を拓く」(Hội tụ tri thức liên ngành mở ra đột phá). Đáp án đúng là B.",
      "keyword": "Địa chính trị khu vực châu Á - Thái Bình Dương trong kỷ nguyên đa cực & 学際的知見",
      "tip": "N1 Choukai đòi hỏi khả năng nắm bắt văn phong học thuật trừu tượng, các quán dụng ngữ cao cấp và cách lập luận triết học."
    },
    {
      "id": "N1_8",
      "level": "N1",
      "lesson": 8,
      "topic": "Bài 08: Trách nhiệm đạo đức và trách nhiệm xã hội của nhà khoa học AGI",
      "situation": "Chủ đề thượng cấp học thuật và nghị trường N1: Trách nhiệm đạo đức và trách nhiệm xã hội của nhà khoa học AGI.",
      "audioText": "こちらは最高峰JLPT N1レベルの聴解試験です。高度な論理展開と抽象的表現を正確に把握して回答してください。",
      "dialogue": [
        {
          "speaker": "Giáo sư",
          "role": "A",
          "kanji": "「Trách nhiệm đạo đức và trách nhiệm xã hội của nhà khoa học AGI」を巡る議論においては、皮相的な解釈を排し、本質的な構造的連関に着目せねばなりません。",
          "kana": "「Trách nhiệm đạo đức và trách nhiệm xã hội của nhà khoa học AGI」をめぐるぎろんにおいては、ひそうてきなかいしゃくをはいし、ほんしつてきなこうぞうてきれんかんにちゃくもくせねばなりません。",
          "vi": "Trong các cuộc luận chiến xoay quanh đề tài \"Trách nhiệm đạo đức và trách nhiệm xã hội của nhà khoa học AGI\", ta buộc phải gạt bỏ những diễn giải hời hợt bề mặt để tập trung vào mối liên hệ cấu trúc mang tính bản chất."
        },
        {
          "speaker": "Học giả",
          "role": "B",
          "kanji": "既存のパラダイムを再考し、多元的視座からアプローチすることが肝要ですね。",
          "kana": "きそんのぱらだいむをさいこうし、たげんてきしざからあぷろーちすることがかんようですね。",
          "vi": "Việc phản tư lại các khuôn mẫu lý thuyết hiện có và tiếp cận từ góc nhìn đa chiều là điều tối quan trọng."
        },
        {
          "speaker": "Giáo sư",
          "role": "A",
          "kanji": "正にその通りです。学際的知見の統合こそが、未曾有の課題に対する突破口を拓くのです。",
          "kana": "まさにそのとおりです。がくさいてきちけんのとうごうこそが、みぞうのかだいに対するとっぱこうをひらくのです。",
          "vi": "Đích thị là như vậy. Chính sự hội tụ của tri thức liên ngành mới khai mở được bước đột phá trước những thách thức chưa từng có tiền lệ."
        }
      ],
      "question": "Thông điệp học thuật cốt lõi được giáo sư và học giả đồng thuận trong cuộc thảo luận về \"Trách nhiệm đạo đức và trách nhiệm xã hội của nhà khoa học AGI\" là gì?",
      "options": [
        {
          "id": "A",
          "text": "Duy trì cách tiếp cận đơn ngành cổ điển không thay đổi"
        },
        {
          "id": "B",
          "text": "Cần nhìn nhận bản chất cấu trúc và hội tụ tri thức liên ngành đa chiều để tạo đột phá"
        },
        {
          "id": "C",
          "text": "Từ bỏ việc nghiên cứu vì vấn đề quá phức tạp"
        },
        {
          "id": "D",
          "text": "Chỉ tập trung vào lợi ích kinh tế thực dụng"
        }
      ],
      "correctAnswer": "B",
      "explanation": "Giáo sư đúc kết: 「学際的知見の統合こそが、未曾有の課題に対する突破口を拓く」(Hội tụ tri thức liên ngành mở ra đột phá). Đáp án đúng là B.",
      "keyword": "Trách nhiệm đạo đức và trách nhiệm xã hội của nhà khoa học AGI & 学際的知見",
      "tip": "N1 Choukai đòi hỏi khả năng nắm bắt văn phong học thuật trừu tượng, các quán dụng ngữ cao cấp và cách lập luận triết học."
    },
    {
      "id": "N1_9",
      "level": "N1",
      "lesson": 9,
      "topic": "Bài 09: Phán quyết của Tòa án Tối cao về quyền tự do biểu đạt và quyền riêng tư",
      "situation": "Chủ đề thượng cấp học thuật và nghị trường N1: Phán quyết của Tòa án Tối cao về quyền tự do biểu đạt và quyền riêng tư.",
      "audioText": "こちらは最高峰JLPT N1レベルの聴解試験です。高度な論理展開と抽象的表現を正確に把握して回答してください。",
      "dialogue": [
        {
          "speaker": "Giáo sư",
          "role": "A",
          "kanji": "「Phán quyết của Tòa án Tối cao về quyền tự do biểu đạt và quyền riêng tư」を巡る議論においては、皮相的な解釈を排し、本質的な構造的連関に着目せねばなりません。",
          "kana": "「Phán quyết của Tòa án Tối cao về quyền tự do biểu đạt và quyền riêng tư」をめぐるぎろんにおいては、ひそうてきなかいしゃくをはいし、ほんしつてきなこうぞうてきれんかんにちゃくもくせねばなりません。",
          "vi": "Trong các cuộc luận chiến xoay quanh đề tài \"Phán quyết của Tòa án Tối cao về quyền tự do biểu đạt và quyền riêng tư\", ta buộc phải gạt bỏ những diễn giải hời hợt bề mặt để tập trung vào mối liên hệ cấu trúc mang tính bản chất."
        },
        {
          "speaker": "Học giả",
          "role": "B",
          "kanji": "既存のパラダイムを再考し、多元的視座からアプローチすることが肝要ですね。",
          "kana": "きそんのぱらだいむをさいこうし、たげんてきしざからあぷろーちすることがかんようですね。",
          "vi": "Việc phản tư lại các khuôn mẫu lý thuyết hiện có và tiếp cận từ góc nhìn đa chiều là điều tối quan trọng."
        },
        {
          "speaker": "Giáo sư",
          "role": "A",
          "kanji": "正にその通りです。学際的知見の統合こそが、未曾有の課題に対する突破口を拓くのです。",
          "kana": "まさにそのとおりです。がくさいてきちけんのとうごうこそが、みぞうのかだいに対するとっぱこうをひらくのです。",
          "vi": "Đích thị là như vậy. Chính sự hội tụ của tri thức liên ngành mới khai mở được bước đột phá trước những thách thức chưa từng có tiền lệ."
        }
      ],
      "question": "Thông điệp học thuật cốt lõi được giáo sư và học giả đồng thuận trong cuộc thảo luận về \"Phán quyết của Tòa án Tối cao về quyền tự do biểu đạt và quyền riêng tư\" là gì?",
      "options": [
        {
          "id": "A",
          "text": "Duy trì cách tiếp cận đơn ngành cổ điển không thay đổi"
        },
        {
          "id": "B",
          "text": "Cần nhìn nhận bản chất cấu trúc và hội tụ tri thức liên ngành đa chiều để tạo đột phá"
        },
        {
          "id": "C",
          "text": "Từ bỏ việc nghiên cứu vì vấn đề quá phức tạp"
        },
        {
          "id": "D",
          "text": "Chỉ tập trung vào lợi ích kinh tế thực dụng"
        }
      ],
      "correctAnswer": "B",
      "explanation": "Giáo sư đúc kết: 「学際的知見の統合こそが、未曾有の課題に対する突破口を拓く」(Hội tụ tri thức liên ngành mở ra đột phá). Đáp án đúng là B.",
      "keyword": "Phán quyết của Tòa án Tối cao về quyền tự do biểu đạt và quyền riêng tư & 学際的知見",
      "tip": "N1 Choukai đòi hỏi khả năng nắm bắt văn phong học thuật trừu tượng, các quán dụng ngữ cao cấp và cách lập luận triết học."
    },
    {
      "id": "N1_10",
      "level": "N1",
      "lesson": 10,
      "topic": "Bài 10: Phê bình văn học hiện đại qua lăng kính tiểu thuyết thời Heian",
      "situation": "Chủ đề thượng cấp học thuật và nghị trường N1: Phê bình văn học hiện đại qua lăng kính tiểu thuyết thời Heian.",
      "audioText": "こちらは最高峰JLPT N1レベルの聴解試験です。高度な論理展開と抽象的表現を正確に把握して回答してください。",
      "dialogue": [
        {
          "speaker": "Giáo sư",
          "role": "A",
          "kanji": "「Phê bình văn học hiện đại qua lăng kính tiểu thuyết thời Heian」を巡る議論においては、皮相的な解釈を排し、本質的な構造的連関に着目せねばなりません。",
          "kana": "「Phê bình văn học hiện đại qua lăng kính tiểu thuyết thời Heian」をめぐるぎろんにおいては、ひそうてきなかいしゃくをはいし、ほんしつてきなこうぞうてきれんかんにちゃくもくせねばなりません。",
          "vi": "Trong các cuộc luận chiến xoay quanh đề tài \"Phê bình văn học hiện đại qua lăng kính tiểu thuyết thời Heian\", ta buộc phải gạt bỏ những diễn giải hời hợt bề mặt để tập trung vào mối liên hệ cấu trúc mang tính bản chất."
        },
        {
          "speaker": "Học giả",
          "role": "B",
          "kanji": "既存のパラダイムを再考し、多元的視座からアプローチすることが肝要ですね。",
          "kana": "きそんのぱらだいむをさいこうし、たげんてきしざからあぷろーちすることがかんようですね。",
          "vi": "Việc phản tư lại các khuôn mẫu lý thuyết hiện có và tiếp cận từ góc nhìn đa chiều là điều tối quan trọng."
        },
        {
          "speaker": "Giáo sư",
          "role": "A",
          "kanji": "正にその通りです。学際的知見の統合こそが、未曾有の課題に対する突破口を拓くのです。",
          "kana": "まさにそのとおりです。がくさいてきちけんのとうごうこそが、みぞうのかだいに対するとっぱこうをひらくのです。",
          "vi": "Đích thị là như vậy. Chính sự hội tụ của tri thức liên ngành mới khai mở được bước đột phá trước những thách thức chưa từng có tiền lệ."
        }
      ],
      "question": "Thông điệp học thuật cốt lõi được giáo sư và học giả đồng thuận trong cuộc thảo luận về \"Phê bình văn học hiện đại qua lăng kính tiểu thuyết thời Heian\" là gì?",
      "options": [
        {
          "id": "A",
          "text": "Duy trì cách tiếp cận đơn ngành cổ điển không thay đổi"
        },
        {
          "id": "B",
          "text": "Cần nhìn nhận bản chất cấu trúc và hội tụ tri thức liên ngành đa chiều để tạo đột phá"
        },
        {
          "id": "C",
          "text": "Từ bỏ việc nghiên cứu vì vấn đề quá phức tạp"
        },
        {
          "id": "D",
          "text": "Chỉ tập trung vào lợi ích kinh tế thực dụng"
        }
      ],
      "correctAnswer": "B",
      "explanation": "Giáo sư đúc kết: 「学際的知見の統合こそが、未曾有の課題に対する突破口を拓く」(Hội tụ tri thức liên ngành mở ra đột phá). Đáp án đúng là B.",
      "keyword": "Phê bình văn học hiện đại qua lăng kính tiểu thuyết thời Heian & 学際的知見",
      "tip": "N1 Choukai đòi hỏi khả năng nắm bắt văn phong học thuật trừu tượng, các quán dụng ngữ cao cấp và cách lập luận triết học."
    },
    {
      "id": "N1_11",
      "level": "N1",
      "lesson": 11,
      "topic": "Bài 11: Kinh tế học hành vi: Giải mã hiện tượng bất đối xứng thông tin thị trường",
      "situation": "Chủ đề thượng cấp học thuật và nghị trường N1: Kinh tế học hành vi: Giải mã hiện tượng bất đối xứng thông tin thị trường.",
      "audioText": "こちらは最高峰JLPT N1レベルの聴解試験です。高度な論理展開と抽象的表現を正確に把握して回答してください。",
      "dialogue": [
        {
          "speaker": "Giáo sư",
          "role": "A",
          "kanji": "「Kinh tế học hành vi: Giải mã hiện tượng bất đối xứng thông tin thị trường」を巡る議論においては、皮相的な解釈を排し、本質的な構造的連関に着目せねばなりません。",
          "kana": "「Kinh tế học hành vi: Giải mã hiện tượng bất đối xứng thông tin thị trường」をめぐるぎろんにおいては、ひそうてきなかいしゃくをはいし、ほんしつてきなこうぞうてきれんかんにちゃくもくせねばなりません。",
          "vi": "Trong các cuộc luận chiến xoay quanh đề tài \"Kinh tế học hành vi: Giải mã hiện tượng bất đối xứng thông tin thị trường\", ta buộc phải gạt bỏ những diễn giải hời hợt bề mặt để tập trung vào mối liên hệ cấu trúc mang tính bản chất."
        },
        {
          "speaker": "Học giả",
          "role": "B",
          "kanji": "既存のパラダイムを再考し、多元的視座からアプローチすることが肝要ですね。",
          "kana": "きそんのぱらだいむをさいこうし、たげんてきしざからあぷろーちすることがかんようですね。",
          "vi": "Việc phản tư lại các khuôn mẫu lý thuyết hiện có và tiếp cận từ góc nhìn đa chiều là điều tối quan trọng."
        },
        {
          "speaker": "Giáo sư",
          "role": "A",
          "kanji": "正にその通りです。学際的知見の統合こそが、未曾有の課題に対する突破口を拓くのです。",
          "kana": "まさにそのとおりです。がくさいてきちけんのとうごうこそが、みぞうのかだいに対するとっぱこうをひらくのです。",
          "vi": "Đích thị là như vậy. Chính sự hội tụ của tri thức liên ngành mới khai mở được bước đột phá trước những thách thức chưa từng có tiền lệ."
        }
      ],
      "question": "Thông điệp học thuật cốt lõi được giáo sư và học giả đồng thuận trong cuộc thảo luận về \"Kinh tế học hành vi: Giải mã hiện tượng bất đối xứng thông tin thị trường\" là gì?",
      "options": [
        {
          "id": "A",
          "text": "Duy trì cách tiếp cận đơn ngành cổ điển không thay đổi"
        },
        {
          "id": "B",
          "text": "Cần nhìn nhận bản chất cấu trúc và hội tụ tri thức liên ngành đa chiều để tạo đột phá"
        },
        {
          "id": "C",
          "text": "Từ bỏ việc nghiên cứu vì vấn đề quá phức tạp"
        },
        {
          "id": "D",
          "text": "Chỉ tập trung vào lợi ích kinh tế thực dụng"
        }
      ],
      "correctAnswer": "B",
      "explanation": "Giáo sư đúc kết: 「学際的知見の統合こそが、未曾有の課題に対する突破口を拓く」(Hội tụ tri thức liên ngành mở ra đột phá). Đáp án đúng là B.",
      "keyword": "Kinh tế học hành vi: Giải mã hiện tượng bất đối xứng thông tin thị trường & 学際的知見",
      "tip": "N1 Choukai đòi hỏi khả năng nắm bắt văn phong học thuật trừu tượng, các quán dụng ngữ cao cấp và cách lập luận triết học."
    },
    {
      "id": "N1_12",
      "level": "N1",
      "lesson": 12,
      "topic": "Bài 12: Bảo tồn đa dạng sinh học và quy hoạch lâm nghiệp thích ứng biến đổi",
      "situation": "Chủ đề thượng cấp học thuật và nghị trường N1: Bảo tồn đa dạng sinh học và quy hoạch lâm nghiệp thích ứng biến đổi.",
      "audioText": "こちらは最高峰JLPT N1レベルの聴解試験です。高度な論理展開と抽象的表現を正確に把握して回答してください。",
      "dialogue": [
        {
          "speaker": "Giáo sư",
          "role": "A",
          "kanji": "「Bảo tồn đa dạng sinh học và quy hoạch lâm nghiệp thích ứng biến đổi」を巡る議論においては、皮相的な解釈を排し、本質的な構造的連関に着目せねばなりません。",
          "kana": "「Bảo tồn đa dạng sinh học và quy hoạch lâm nghiệp thích ứng biến đổi」をめぐるぎろんにおいては、ひそうてきなかいしゃくをはいし、ほんしつてきなこうぞうてきれんかんにちゃくもくせねばなりません。",
          "vi": "Trong các cuộc luận chiến xoay quanh đề tài \"Bảo tồn đa dạng sinh học và quy hoạch lâm nghiệp thích ứng biến đổi\", ta buộc phải gạt bỏ những diễn giải hời hợt bề mặt để tập trung vào mối liên hệ cấu trúc mang tính bản chất."
        },
        {
          "speaker": "Học giả",
          "role": "B",
          "kanji": "既存のパラダイムを再考し、多元的視座からアプローチすることが肝要ですね。",
          "kana": "きそんのぱらだいむをさいこうし、たげんてきしざからあぷろーちすることがかんようですね。",
          "vi": "Việc phản tư lại các khuôn mẫu lý thuyết hiện có và tiếp cận từ góc nhìn đa chiều là điều tối quan trọng."
        },
        {
          "speaker": "Giáo sư",
          "role": "A",
          "kanji": "正にその通りです。学際的知見の統合こそが、未曾有の課題に対する突破口を拓くのです。",
          "kana": "まさにそのとおりです。がくさいてきちけんのとうごうこそが、みぞうのかだいに対するとっぱこうをひらくのです。",
          "vi": "Đích thị là như vậy. Chính sự hội tụ của tri thức liên ngành mới khai mở được bước đột phá trước những thách thức chưa từng có tiền lệ."
        }
      ],
      "question": "Thông điệp học thuật cốt lõi được giáo sư và học giả đồng thuận trong cuộc thảo luận về \"Bảo tồn đa dạng sinh học và quy hoạch lâm nghiệp thích ứng biến đổi\" là gì?",
      "options": [
        {
          "id": "A",
          "text": "Duy trì cách tiếp cận đơn ngành cổ điển không thay đổi"
        },
        {
          "id": "B",
          "text": "Cần nhìn nhận bản chất cấu trúc và hội tụ tri thức liên ngành đa chiều để tạo đột phá"
        },
        {
          "id": "C",
          "text": "Từ bỏ việc nghiên cứu vì vấn đề quá phức tạp"
        },
        {
          "id": "D",
          "text": "Chỉ tập trung vào lợi ích kinh tế thực dụng"
        }
      ],
      "correctAnswer": "B",
      "explanation": "Giáo sư đúc kết: 「学際的知見の統合こそが、未曾有の課題に対する突破口を拓く」(Hội tụ tri thức liên ngành mở ra đột phá). Đáp án đúng là B.",
      "keyword": "Bảo tồn đa dạng sinh học và quy hoạch lâm nghiệp thích ứng biến đổi & 学際的知見",
      "tip": "N1 Choukai đòi hỏi khả năng nắm bắt văn phong học thuật trừu tượng, các quán dụng ngữ cao cấp và cách lập luận triết học."
    },
    {
      "id": "N1_13",
      "level": "N1",
      "lesson": 13,
      "topic": "Bài 13: Sự suy thoái cú pháp ngôn ngữ trong kỷ nguyên giao tiếp số",
      "situation": "Chủ đề thượng cấp học thuật và nghị trường N1: Sự suy thoái cú pháp ngôn ngữ trong kỷ nguyên giao tiếp số.",
      "audioText": "こちらは最高峰JLPT N1レベルの聴解試験です。高度な論理展開と抽象的表現を正確に把握して回答してください。",
      "dialogue": [
        {
          "speaker": "Giáo sư",
          "role": "A",
          "kanji": "「Sự suy thoái cú pháp ngôn ngữ trong kỷ nguyên giao tiếp số」を巡る議論においては、皮相的な解釈を排し、本質的な構造的連関に着目せねばなりません。",
          "kana": "「Sự suy thoái cú pháp ngôn ngữ trong kỷ nguyên giao tiếp số」をめぐるぎろんにおいては、ひそうてきなかいしゃくをはいし、ほんしつてきなこうぞうてきれんかんにちゃくもくせねばなりません。",
          "vi": "Trong các cuộc luận chiến xoay quanh đề tài \"Sự suy thoái cú pháp ngôn ngữ trong kỷ nguyên giao tiếp số\", ta buộc phải gạt bỏ những diễn giải hời hợt bề mặt để tập trung vào mối liên hệ cấu trúc mang tính bản chất."
        },
        {
          "speaker": "Học giả",
          "role": "B",
          "kanji": "既存のパラダイムを再考し、多元的視座からアプローチすることが肝要ですね。",
          "kana": "きそんのぱらだいむをさいこうし、たげんてきしざからあぷろーちすることがかんようですね。",
          "vi": "Việc phản tư lại các khuôn mẫu lý thuyết hiện có và tiếp cận từ góc nhìn đa chiều là điều tối quan trọng."
        },
        {
          "speaker": "Giáo sư",
          "role": "A",
          "kanji": "正にその通りです。学際的知見の統合こそが、未曾有の課題に対する突破口を拓くのです。",
          "kana": "まさにそのとおりです。がくさいてきちけんのとうごうこそが、みぞうのかだいに対するとっぱこうをひらくのです。",
          "vi": "Đích thị là như vậy. Chính sự hội tụ của tri thức liên ngành mới khai mở được bước đột phá trước những thách thức chưa từng có tiền lệ."
        }
      ],
      "question": "Thông điệp học thuật cốt lõi được giáo sư và học giả đồng thuận trong cuộc thảo luận về \"Sự suy thoái cú pháp ngôn ngữ trong kỷ nguyên giao tiếp số\" là gì?",
      "options": [
        {
          "id": "A",
          "text": "Duy trì cách tiếp cận đơn ngành cổ điển không thay đổi"
        },
        {
          "id": "B",
          "text": "Cần nhìn nhận bản chất cấu trúc và hội tụ tri thức liên ngành đa chiều để tạo đột phá"
        },
        {
          "id": "C",
          "text": "Từ bỏ việc nghiên cứu vì vấn đề quá phức tạp"
        },
        {
          "id": "D",
          "text": "Chỉ tập trung vào lợi ích kinh tế thực dụng"
        }
      ],
      "correctAnswer": "B",
      "explanation": "Giáo sư đúc kết: 「学際的知見の統合こそが、未曾有の課題に対する突破口を拓く」(Hội tụ tri thức liên ngành mở ra đột phá). Đáp án đúng là B.",
      "keyword": "Sự suy thoái cú pháp ngôn ngữ trong kỷ nguyên giao tiếp số & 学際的知見",
      "tip": "N1 Choukai đòi hỏi khả năng nắm bắt văn phong học thuật trừu tượng, các quán dụng ngữ cao cấp và cách lập luận triết học."
    },
    {
      "id": "N1_14",
      "level": "N1",
      "lesson": 14,
      "topic": "Bài 14: Lịch sử tư tưởng triết học chính trị thời kỳ Minh Trị duy tân",
      "situation": "Chủ đề thượng cấp học thuật và nghị trường N1: Lịch sử tư tưởng triết học chính trị thời kỳ Minh Trị duy tân.",
      "audioText": "こちらは最高峰JLPT N1レベルの聴解試験です。高度な論理展開と抽象的表現を正確に把握して回答してください。",
      "dialogue": [
        {
          "speaker": "Giáo sư",
          "role": "A",
          "kanji": "「Lịch sử tư tưởng triết học chính trị thời kỳ Minh Trị duy tân」を巡る議論においては、皮相的な解釈を排し、本質的な構造的連関に着目せねばなりません。",
          "kana": "「Lịch sử tư tưởng triết học chính trị thời kỳ Minh Trị duy tân」をめぐるぎろんにおいては、ひそうてきなかいしゃくをはいし、ほんしつてきなこうぞうてきれんかんにちゃくもくせねばなりません。",
          "vi": "Trong các cuộc luận chiến xoay quanh đề tài \"Lịch sử tư tưởng triết học chính trị thời kỳ Minh Trị duy tân\", ta buộc phải gạt bỏ những diễn giải hời hợt bề mặt để tập trung vào mối liên hệ cấu trúc mang tính bản chất."
        },
        {
          "speaker": "Học giả",
          "role": "B",
          "kanji": "既存のパラダイムを再考し、多元的視座からアプローチすることが肝要ですね。",
          "kana": "きそんのぱらだいむをさいこうし、たげんてきしざからあぷろーちすることがかんようですね。",
          "vi": "Việc phản tư lại các khuôn mẫu lý thuyết hiện có và tiếp cận từ góc nhìn đa chiều là điều tối quan trọng."
        },
        {
          "speaker": "Giáo sư",
          "role": "A",
          "kanji": "正にその通りです。学際的知見の統合こそが、未曾有の課題に対する突破口を拓くのです。",
          "kana": "まさにそのとおりです。がくさいてきちけんのとうごうこそが、みぞうのかだいに対するとっぱこうをひらくのです。",
          "vi": "Đích thị là như vậy. Chính sự hội tụ của tri thức liên ngành mới khai mở được bước đột phá trước những thách thức chưa từng có tiền lệ."
        }
      ],
      "question": "Thông điệp học thuật cốt lõi được giáo sư và học giả đồng thuận trong cuộc thảo luận về \"Lịch sử tư tưởng triết học chính trị thời kỳ Minh Trị duy tân\" là gì?",
      "options": [
        {
          "id": "A",
          "text": "Duy trì cách tiếp cận đơn ngành cổ điển không thay đổi"
        },
        {
          "id": "B",
          "text": "Cần nhìn nhận bản chất cấu trúc và hội tụ tri thức liên ngành đa chiều để tạo đột phá"
        },
        {
          "id": "C",
          "text": "Từ bỏ việc nghiên cứu vì vấn đề quá phức tạp"
        },
        {
          "id": "D",
          "text": "Chỉ tập trung vào lợi ích kinh tế thực dụng"
        }
      ],
      "correctAnswer": "B",
      "explanation": "Giáo sư đúc kết: 「学際的知見の統合こそが、未曾有の課題に対する突破口を拓く」(Hội tụ tri thức liên ngành mở ra đột phá). Đáp án đúng là B.",
      "keyword": "Lịch sử tư tưởng triết học chính trị thời kỳ Minh Trị duy tân & 学際的知見",
      "tip": "N1 Choukai đòi hỏi khả năng nắm bắt văn phong học thuật trừu tượng, các quán dụng ngữ cao cấp và cách lập luận triết học."
    },
    {
      "id": "N1_15",
      "level": "N1",
      "lesson": 15,
      "topic": "Bài 15: Mô hình toán học phi tuyến dự báo hệ thống khí hậu Trái Đất",
      "situation": "Chủ đề thượng cấp học thuật và nghị trường N1: Mô hình toán học phi tuyến dự báo hệ thống khí hậu Trái Đất.",
      "audioText": "こちらは最高峰JLPT N1レベルの聴解試験です。高度な論理展開と抽象的表現を正確に把握して回答してください。",
      "dialogue": [
        {
          "speaker": "Giáo sư",
          "role": "A",
          "kanji": "「Mô hình toán học phi tuyến dự báo hệ thống khí hậu Trái Đất」を巡る議論においては、皮相的な解釈を排し、本質的な構造的連関に着目せねばなりません。",
          "kana": "「Mô hình toán học phi tuyến dự báo hệ thống khí hậu Trái Đất」をめぐるぎろんにおいては、ひそうてきなかいしゃくをはいし、ほんしつてきなこうぞうてきれんかんにちゃくもくせねばなりません。",
          "vi": "Trong các cuộc luận chiến xoay quanh đề tài \"Mô hình toán học phi tuyến dự báo hệ thống khí hậu Trái Đất\", ta buộc phải gạt bỏ những diễn giải hời hợt bề mặt để tập trung vào mối liên hệ cấu trúc mang tính bản chất."
        },
        {
          "speaker": "Học giả",
          "role": "B",
          "kanji": "既存のパラダイムを再考し、多元的視座からアプローチすることが肝要ですね。",
          "kana": "きそんのぱらだいむをさいこうし、たげんてきしざからあぷろーちすることがかんようですね。",
          "vi": "Việc phản tư lại các khuôn mẫu lý thuyết hiện có và tiếp cận từ góc nhìn đa chiều là điều tối quan trọng."
        },
        {
          "speaker": "Giáo sư",
          "role": "A",
          "kanji": "正にその通りです。学際的知見の統合こそが、未曾有の課題に対する突破口を拓くのです。",
          "kana": "まさにそのとおりです。がくさいてきちけんのとうごうこそが、みぞうのかだいに対するとっぱこうをひらくのです。",
          "vi": "Đích thị là như vậy. Chính sự hội tụ của tri thức liên ngành mới khai mở được bước đột phá trước những thách thức chưa từng có tiền lệ."
        }
      ],
      "question": "Thông điệp học thuật cốt lõi được giáo sư và học giả đồng thuận trong cuộc thảo luận về \"Mô hình toán học phi tuyến dự báo hệ thống khí hậu Trái Đất\" là gì?",
      "options": [
        {
          "id": "A",
          "text": "Duy trì cách tiếp cận đơn ngành cổ điển không thay đổi"
        },
        {
          "id": "B",
          "text": "Cần nhìn nhận bản chất cấu trúc và hội tụ tri thức liên ngành đa chiều để tạo đột phá"
        },
        {
          "id": "C",
          "text": "Từ bỏ việc nghiên cứu vì vấn đề quá phức tạp"
        },
        {
          "id": "D",
          "text": "Chỉ tập trung vào lợi ích kinh tế thực dụng"
        }
      ],
      "correctAnswer": "B",
      "explanation": "Giáo sư đúc kết: 「学際的知見の統合こそが、未曾有の課題に対する突破口を拓く」(Hội tụ tri thức liên ngành mở ra đột phá). Đáp án đúng là B.",
      "keyword": "Mô hình toán học phi tuyến dự báo hệ thống khí hậu Trái Đất & 学際的知見",
      "tip": "N1 Choukai đòi hỏi khả năng nắm bắt văn phong học thuật trừu tượng, các quán dụng ngữ cao cấp và cách lập luận triết học."
    },
    {
      "id": "N1_16",
      "level": "N1",
      "lesson": 16,
      "topic": "Bài 16: Chủ quyền dữ liệu quốc gia và an ninh chuỗi cung ứng công nghệ cao",
      "situation": "Chủ đề thượng cấp học thuật và nghị trường N1: Chủ quyền dữ liệu quốc gia và an ninh chuỗi cung ứng công nghệ cao.",
      "audioText": "こちらは最高峰JLPT N1レベルの聴解試験です。高度な論理展開と抽象的表現を正確に把握して回答してください。",
      "dialogue": [
        {
          "speaker": "Giáo sư",
          "role": "A",
          "kanji": "「Chủ quyền dữ liệu quốc gia và an ninh chuỗi cung ứng công nghệ cao」を巡る議論においては、皮相的な解釈を排し、本質的な構造的連関に着目せねばなりません。",
          "kana": "「Chủ quyền dữ liệu quốc gia và an ninh chuỗi cung ứng công nghệ cao」をめぐるぎろんにおいては、ひそうてきなかいしゃくをはいし、ほんしつてきなこうぞうてきれんかんにちゃくもくせねばなりません。",
          "vi": "Trong các cuộc luận chiến xoay quanh đề tài \"Chủ quyền dữ liệu quốc gia và an ninh chuỗi cung ứng công nghệ cao\", ta buộc phải gạt bỏ những diễn giải hời hợt bề mặt để tập trung vào mối liên hệ cấu trúc mang tính bản chất."
        },
        {
          "speaker": "Học giả",
          "role": "B",
          "kanji": "既存のパラダイムを再考し、多元的視座からアプローチすることが肝要ですね。",
          "kana": "きそんのぱらだいむをさいこうし、たげんてきしざからあぷろーちすることがかんようですね。",
          "vi": "Việc phản tư lại các khuôn mẫu lý thuyết hiện có và tiếp cận từ góc nhìn đa chiều là điều tối quan trọng."
        },
        {
          "speaker": "Giáo sư",
          "role": "A",
          "kanji": "正にその通りです。学際的知見の統合こそが、未曾有の課題に対する突破口を拓くのです。",
          "kana": "まさにそのとおりです。がくさいてきちけんのとうごうこそが、みぞうのかだいに対するとっぱこうをひらくのです。",
          "vi": "Đích thị là như vậy. Chính sự hội tụ của tri thức liên ngành mới khai mở được bước đột phá trước những thách thức chưa từng có tiền lệ."
        }
      ],
      "question": "Thông điệp học thuật cốt lõi được giáo sư và học giả đồng thuận trong cuộc thảo luận về \"Chủ quyền dữ liệu quốc gia và an ninh chuỗi cung ứng công nghệ cao\" là gì?",
      "options": [
        {
          "id": "A",
          "text": "Duy trì cách tiếp cận đơn ngành cổ điển không thay đổi"
        },
        {
          "id": "B",
          "text": "Cần nhìn nhận bản chất cấu trúc và hội tụ tri thức liên ngành đa chiều để tạo đột phá"
        },
        {
          "id": "C",
          "text": "Từ bỏ việc nghiên cứu vì vấn đề quá phức tạp"
        },
        {
          "id": "D",
          "text": "Chỉ tập trung vào lợi ích kinh tế thực dụng"
        }
      ],
      "correctAnswer": "B",
      "explanation": "Giáo sư đúc kết: 「学際的知見の統合こそが、未曾有の課題に対する突破口を拓く」(Hội tụ tri thức liên ngành mở ra đột phá). Đáp án đúng là B.",
      "keyword": "Chủ quyền dữ liệu quốc gia và an ninh chuỗi cung ứng công nghệ cao & 学際的知見",
      "tip": "N1 Choukai đòi hỏi khả năng nắm bắt văn phong học thuật trừu tượng, các quán dụng ngữ cao cấp và cách lập luận triết học."
    },
    {
      "id": "N1_17",
      "level": "N1",
      "lesson": 17,
      "topic": "Bài 17: Triết lý Phật giáo Thiền tông và biểu hiện trong kiến trúc tối giản",
      "situation": "Chủ đề thượng cấp học thuật và nghị trường N1: Triết lý Phật giáo Thiền tông và biểu hiện trong kiến trúc tối giản.",
      "audioText": "こちらは最高峰JLPT N1レベルの聴解試験です。高度な論理展開と抽象的表現を正確に把握して回答してください。",
      "dialogue": [
        {
          "speaker": "Giáo sư",
          "role": "A",
          "kanji": "「Triết lý Phật giáo Thiền tông và biểu hiện trong kiến trúc tối giản」を巡る議論においては、皮相的な解釈を排し、本質的な構造的連関に着目せねばなりません。",
          "kana": "「Triết lý Phật giáo Thiền tông và biểu hiện trong kiến trúc tối giản」をめぐるぎろんにおいては、ひそうてきなかいしゃくをはいし、ほんしつてきなこうぞうてきれんかんにちゃくもくせねばなりません。",
          "vi": "Trong các cuộc luận chiến xoay quanh đề tài \"Triết lý Phật giáo Thiền tông và biểu hiện trong kiến trúc tối giản\", ta buộc phải gạt bỏ những diễn giải hời hợt bề mặt để tập trung vào mối liên hệ cấu trúc mang tính bản chất."
        },
        {
          "speaker": "Học giả",
          "role": "B",
          "kanji": "既存のパラダイムを再考し、多元的視座からアプローチすることが肝要ですね。",
          "kana": "きそんのぱらだいむをさいこうし、たげんてきしざからあぷろーちすることがかんようですね。",
          "vi": "Việc phản tư lại các khuôn mẫu lý thuyết hiện có và tiếp cận từ góc nhìn đa chiều là điều tối quan trọng."
        },
        {
          "speaker": "Giáo sư",
          "role": "A",
          "kanji": "正にその通りです。学際的知見の統合こそが、未曾有の課題に対する突破口を拓くのです。",
          "kana": "まさにそのとおりです。がくさいてきちけんのとうごうこそが、みぞうのかだいに対するとっぱこうをひらくのです。",
          "vi": "Đích thị là như vậy. Chính sự hội tụ của tri thức liên ngành mới khai mở được bước đột phá trước những thách thức chưa từng có tiền lệ."
        }
      ],
      "question": "Thông điệp học thuật cốt lõi được giáo sư và học giả đồng thuận trong cuộc thảo luận về \"Triết lý Phật giáo Thiền tông và biểu hiện trong kiến trúc tối giản\" là gì?",
      "options": [
        {
          "id": "A",
          "text": "Duy trì cách tiếp cận đơn ngành cổ điển không thay đổi"
        },
        {
          "id": "B",
          "text": "Cần nhìn nhận bản chất cấu trúc và hội tụ tri thức liên ngành đa chiều để tạo đột phá"
        },
        {
          "id": "C",
          "text": "Từ bỏ việc nghiên cứu vì vấn đề quá phức tạp"
        },
        {
          "id": "D",
          "text": "Chỉ tập trung vào lợi ích kinh tế thực dụng"
        }
      ],
      "correctAnswer": "B",
      "explanation": "Giáo sư đúc kết: 「学際的知見の統合こそが、未曾有の課題に対する突破口を拓く」(Hội tụ tri thức liên ngành mở ra đột phá). Đáp án đúng là B.",
      "keyword": "Triết lý Phật giáo Thiền tông và biểu hiện trong kiến trúc tối giản & 学際的知見",
      "tip": "N1 Choukai đòi hỏi khả năng nắm bắt văn phong học thuật trừu tượng, các quán dụng ngữ cao cấp và cách lập luận triết học."
    },
    {
      "id": "N1_18",
      "level": "N1",
      "lesson": 18,
      "topic": "Bài 18: Chính sách tiền tệ số của ngân hàng trung ương (CBDC) và tính thanh khoản",
      "situation": "Chủ đề thượng cấp học thuật và nghị trường N1: Chính sách tiền tệ số của ngân hàng trung ương (CBDC) và tính thanh khoản.",
      "audioText": "こちらは最高峰JLPT N1レベルの聴解試験です。高度な論理展開と抽象的表現を正確に把握して回答してください。",
      "dialogue": [
        {
          "speaker": "Giáo sư",
          "role": "A",
          "kanji": "「Chính sách tiền tệ số của ngân hàng trung ương (CBDC) và tính thanh khoản」を巡る議論においては、皮相的な解釈を排し、本質的な構造的連関に着目せねばなりません。",
          "kana": "「Chính sách tiền tệ số của ngân hàng trung ương (CBDC) và tính thanh khoản」をめぐるぎろんにおいては、ひそうてきなかいしゃくをはいし、ほんしつてきなこうぞうてきれんかんにちゃくもくせねばなりません。",
          "vi": "Trong các cuộc luận chiến xoay quanh đề tài \"Chính sách tiền tệ số của ngân hàng trung ương (CBDC) và tính thanh khoản\", ta buộc phải gạt bỏ những diễn giải hời hợt bề mặt để tập trung vào mối liên hệ cấu trúc mang tính bản chất."
        },
        {
          "speaker": "Học giả",
          "role": "B",
          "kanji": "既存のパラダイムを再考し、多元的視座からアプローチすることが肝要ですね。",
          "kana": "きそんのぱらだいむをさいこうし、たげんてきしざからあぷろーちすることがかんようですね。",
          "vi": "Việc phản tư lại các khuôn mẫu lý thuyết hiện có và tiếp cận từ góc nhìn đa chiều là điều tối quan trọng."
        },
        {
          "speaker": "Giáo sư",
          "role": "A",
          "kanji": "正にその通りです。学際的知見の統合こそが、未曾有の課題に対する突破口を拓くのです。",
          "kana": "まさにそのとおりです。がくさいてきちけんのとうごうこそが、みぞうのかだいに対するとっぱこうをひらくのです。",
          "vi": "Đích thị là như vậy. Chính sự hội tụ của tri thức liên ngành mới khai mở được bước đột phá trước những thách thức chưa từng có tiền lệ."
        }
      ],
      "question": "Thông điệp học thuật cốt lõi được giáo sư và học giả đồng thuận trong cuộc thảo luận về \"Chính sách tiền tệ số của ngân hàng trung ương (CBDC) và tính thanh khoản\" là gì?",
      "options": [
        {
          "id": "A",
          "text": "Duy trì cách tiếp cận đơn ngành cổ điển không thay đổi"
        },
        {
          "id": "B",
          "text": "Cần nhìn nhận bản chất cấu trúc và hội tụ tri thức liên ngành đa chiều để tạo đột phá"
        },
        {
          "id": "C",
          "text": "Từ bỏ việc nghiên cứu vì vấn đề quá phức tạp"
        },
        {
          "id": "D",
          "text": "Chỉ tập trung vào lợi ích kinh tế thực dụng"
        }
      ],
      "correctAnswer": "B",
      "explanation": "Giáo sư đúc kết: 「学際的知見の統合こそが、未曾有の課題に対する突破口を拓く」(Hội tụ tri thức liên ngành mở ra đột phá). Đáp án đúng là B.",
      "keyword": "Chính sách tiền tệ số của ngân hàng trung ương (CBDC) và tính thanh khoản & 学際的知見",
      "tip": "N1 Choukai đòi hỏi khả năng nắm bắt văn phong học thuật trừu tượng, các quán dụng ngữ cao cấp và cách lập luận triết học."
    },
    {
      "id": "N1_19",
      "level": "N1",
      "lesson": 19,
      "topic": "Bài 19: Biến chuyển cấu trúc tế bào gia đình và chính sách an sinh dưỡng lão",
      "situation": "Chủ đề thượng cấp học thuật và nghị trường N1: Biến chuyển cấu trúc tế bào gia đình và chính sách an sinh dưỡng lão.",
      "audioText": "こちらは最高峰JLPT N1レベルの聴解試験です。高度な論理展開と抽象的表現を正確に把握して回答してください。",
      "dialogue": [
        {
          "speaker": "Giáo sư",
          "role": "A",
          "kanji": "「Biến chuyển cấu trúc tế bào gia đình và chính sách an sinh dưỡng lão」を巡る議論においては、皮相的な解釈を排し、本質的な構造的連関に着目せねばなりません。",
          "kana": "「Biến chuyển cấu trúc tế bào gia đình và chính sách an sinh dưỡng lão」をめぐるぎろんにおいては、ひそうてきなかいしゃくをはいし、ほんしつてきなこうぞうてきれんかんにちゃくもくせねばなりません。",
          "vi": "Trong các cuộc luận chiến xoay quanh đề tài \"Biến chuyển cấu trúc tế bào gia đình và chính sách an sinh dưỡng lão\", ta buộc phải gạt bỏ những diễn giải hời hợt bề mặt để tập trung vào mối liên hệ cấu trúc mang tính bản chất."
        },
        {
          "speaker": "Học giả",
          "role": "B",
          "kanji": "既存のパラダイムを再考し、多元的視座からアプローチすることが肝要ですね。",
          "kana": "きそんのぱらだいむをさいこうし、たげんてきしざからあぷろーちすることがかんようですね。",
          "vi": "Việc phản tư lại các khuôn mẫu lý thuyết hiện có và tiếp cận từ góc nhìn đa chiều là điều tối quan trọng."
        },
        {
          "speaker": "Giáo sư",
          "role": "A",
          "kanji": "正にその通りです。学際的知見の統合こそが、未曾有の課題に対する突破口を拓くのです。",
          "kana": "まさにそのとおりです。がくさいてきちけんのとうごうこそが、みぞうのかだいに対するとっぱこうをひらくのです。",
          "vi": "Đích thị là như vậy. Chính sự hội tụ của tri thức liên ngành mới khai mở được bước đột phá trước những thách thức chưa từng có tiền lệ."
        }
      ],
      "question": "Thông điệp học thuật cốt lõi được giáo sư và học giả đồng thuận trong cuộc thảo luận về \"Biến chuyển cấu trúc tế bào gia đình và chính sách an sinh dưỡng lão\" là gì?",
      "options": [
        {
          "id": "A",
          "text": "Duy trì cách tiếp cận đơn ngành cổ điển không thay đổi"
        },
        {
          "id": "B",
          "text": "Cần nhìn nhận bản chất cấu trúc và hội tụ tri thức liên ngành đa chiều để tạo đột phá"
        },
        {
          "id": "C",
          "text": "Từ bỏ việc nghiên cứu vì vấn đề quá phức tạp"
        },
        {
          "id": "D",
          "text": "Chỉ tập trung vào lợi ích kinh tế thực dụng"
        }
      ],
      "correctAnswer": "B",
      "explanation": "Giáo sư đúc kết: 「学際的知見の統合こそが、未曾有の課題に対する突破口を拓く」(Hội tụ tri thức liên ngành mở ra đột phá). Đáp án đúng là B.",
      "keyword": "Biến chuyển cấu trúc tế bào gia đình và chính sách an sinh dưỡng lão & 学際的知見",
      "tip": "N1 Choukai đòi hỏi khả năng nắm bắt văn phong học thuật trừu tượng, các quán dụng ngữ cao cấp và cách lập luận triết học."
    },
    {
      "id": "N1_20",
      "level": "N1",
      "lesson": 20,
      "topic": "Bài 20: Diễn văn tốt nghiệp Đại học Tokyo: Sứ mệnh của tầng lớp trí thức",
      "situation": "Chủ đề thượng cấp học thuật và nghị trường N1: Diễn văn tốt nghiệp Đại học Tokyo: Sứ mệnh của tầng lớp trí thức.",
      "audioText": "こちらは最高峰JLPT N1レベルの聴解試験です。高度な論理展開と抽象的表現を正確に把握して回答してください。",
      "dialogue": [
        {
          "speaker": "Giáo sư",
          "role": "A",
          "kanji": "「Diễn văn tốt nghiệp Đại học Tokyo: Sứ mệnh của tầng lớp trí thức」を巡る議論においては、皮相的な解釈を排し、本質的な構造的連関に着目せねばなりません。",
          "kana": "「Diễn văn tốt nghiệp Đại học Tokyo: Sứ mệnh của tầng lớp trí thức」をめぐるぎろんにおいては、ひそうてきなかいしゃくをはいし、ほんしつてきなこうぞうてきれんかんにちゃくもくせねばなりません。",
          "vi": "Trong các cuộc luận chiến xoay quanh đề tài \"Diễn văn tốt nghiệp Đại học Tokyo: Sứ mệnh của tầng lớp trí thức\", ta buộc phải gạt bỏ những diễn giải hời hợt bề mặt để tập trung vào mối liên hệ cấu trúc mang tính bản chất."
        },
        {
          "speaker": "Học giả",
          "role": "B",
          "kanji": "既存のパラダイムを再考し、多元的視座からアプローチすることが肝要ですね。",
          "kana": "きそんのぱらだいむをさいこうし、たげんてきしざからあぷろーちすることがかんようですね。",
          "vi": "Việc phản tư lại các khuôn mẫu lý thuyết hiện có và tiếp cận từ góc nhìn đa chiều là điều tối quan trọng."
        },
        {
          "speaker": "Giáo sư",
          "role": "A",
          "kanji": "正にその通りです。学際的知見の統合こそが、未曾有の課題に対する突破口を拓くのです。",
          "kana": "まさにそのとおりです。がくさいてきちけんのとうごうこそが、みぞうのかだいに対するとっぱこうをひらくのです。",
          "vi": "Đích thị là như vậy. Chính sự hội tụ của tri thức liên ngành mới khai mở được bước đột phá trước những thách thức chưa từng có tiền lệ."
        }
      ],
      "question": "Thông điệp học thuật cốt lõi được giáo sư và học giả đồng thuận trong cuộc thảo luận về \"Diễn văn tốt nghiệp Đại học Tokyo: Sứ mệnh của tầng lớp trí thức\" là gì?",
      "options": [
        {
          "id": "A",
          "text": "Duy trì cách tiếp cận đơn ngành cổ điển không thay đổi"
        },
        {
          "id": "B",
          "text": "Cần nhìn nhận bản chất cấu trúc và hội tụ tri thức liên ngành đa chiều để tạo đột phá"
        },
        {
          "id": "C",
          "text": "Từ bỏ việc nghiên cứu vì vấn đề quá phức tạp"
        },
        {
          "id": "D",
          "text": "Chỉ tập trung vào lợi ích kinh tế thực dụng"
        }
      ],
      "correctAnswer": "B",
      "explanation": "Giáo sư đúc kết: 「学際的知見の統合こそが、未曾有の課題に対する突破口を拓く」(Hội tụ tri thức liên ngành mở ra đột phá). Đáp án đúng là B.",
      "keyword": "Diễn văn tốt nghiệp Đại học Tokyo: Sứ mệnh của tầng lớp trí thức & 学際的知見",
      "tip": "N1 Choukai đòi hỏi khả năng nắm bắt văn phong học thuật trừu tượng, các quán dụng ngữ cao cấp và cách lập luận triết học."
    },
    {
      "id": "N1_21",
      "level": "N1",
      "lesson": 21,
      "topic": "Bài 21: Cơ chế thần kinh học của sự thấu cảm và phản ứng xã hội",
      "situation": "Chủ đề thượng cấp học thuật và nghị trường N1: Cơ chế thần kinh học của sự thấu cảm và phản ứng xã hội.",
      "audioText": "こちらは最高峰JLPT N1レベルの聴解試験です。高度な論理展開と抽象的表現を正確に把握して回答してください。",
      "dialogue": [
        {
          "speaker": "Giáo sư",
          "role": "A",
          "kanji": "「Cơ chế thần kinh học của sự thấu cảm và phản ứng xã hội」を巡る議論においては、皮相的な解釈を排し、本質的な構造的連関に着目せねばなりません。",
          "kana": "「Cơ chế thần kinh học của sự thấu cảm và phản ứng xã hội」をめぐるぎろんにおいては、ひそうてきなかいしゃくをはいし、ほんしつてきなこうぞうてきれんかんにちゃくもくせねばなりません。",
          "vi": "Trong các cuộc luận chiến xoay quanh đề tài \"Cơ chế thần kinh học của sự thấu cảm và phản ứng xã hội\", ta buộc phải gạt bỏ những diễn giải hời hợt bề mặt để tập trung vào mối liên hệ cấu trúc mang tính bản chất."
        },
        {
          "speaker": "Học giả",
          "role": "B",
          "kanji": "既存のパラダイムを再考し、多元的視座からアプローチすることが肝要ですね。",
          "kana": "きそんのぱらだいむをさいこうし、たげんてきしざからあぷろーちすることがかんようですね。",
          "vi": "Việc phản tư lại các khuôn mẫu lý thuyết hiện có và tiếp cận từ góc nhìn đa chiều là điều tối quan trọng."
        },
        {
          "speaker": "Giáo sư",
          "role": "A",
          "kanji": "正にその通りです。学際的知見の統合こそが、未曾有の課題に対する突破口を拓くのです。",
          "kana": "まさにそのとおりです。がくさいてきちけんのとうごうこそが、みぞうのかだいに対するとっぱこうをひらくのです。",
          "vi": "Đích thị là như vậy. Chính sự hội tụ của tri thức liên ngành mới khai mở được bước đột phá trước những thách thức chưa từng có tiền lệ."
        }
      ],
      "question": "Thông điệp học thuật cốt lõi được giáo sư và học giả đồng thuận trong cuộc thảo luận về \"Cơ chế thần kinh học của sự thấu cảm và phản ứng xã hội\" là gì?",
      "options": [
        {
          "id": "A",
          "text": "Duy trì cách tiếp cận đơn ngành cổ điển không thay đổi"
        },
        {
          "id": "B",
          "text": "Cần nhìn nhận bản chất cấu trúc và hội tụ tri thức liên ngành đa chiều để tạo đột phá"
        },
        {
          "id": "C",
          "text": "Từ bỏ việc nghiên cứu vì vấn đề quá phức tạp"
        },
        {
          "id": "D",
          "text": "Chỉ tập trung vào lợi ích kinh tế thực dụng"
        }
      ],
      "correctAnswer": "B",
      "explanation": "Giáo sư đúc kết: 「学際的知見の統合こそが、未曾有の課題に対する突破口を拓く」(Hội tụ tri thức liên ngành mở ra đột phá). Đáp án đúng là B.",
      "keyword": "Cơ chế thần kinh học của sự thấu cảm và phản ứng xã hội & 学際的知見",
      "tip": "N1 Choukai đòi hỏi khả năng nắm bắt văn phong học thuật trừu tượng, các quán dụng ngữ cao cấp và cách lập luận triết học."
    },
    {
      "id": "N1_22",
      "level": "N1",
      "lesson": 22,
      "topic": "Bài 22: Dung nạp văn hóa và các mô hình tích hợp lao động nhập cư",
      "situation": "Chủ đề thượng cấp học thuật và nghị trường N1: Dung nạp văn hóa và các mô hình tích hợp lao động nhập cư.",
      "audioText": "こちらは最高峰JLPT N1レベルの聴解試験です。高度な論理展開と抽象的表現を正確に把握して回答してください。",
      "dialogue": [
        {
          "speaker": "Giáo sư",
          "role": "A",
          "kanji": "「Dung nạp văn hóa và các mô hình tích hợp lao động nhập cư」を巡る議論においては、皮相的な解釈を排し、本質的な構造的連関に着目せねばなりません。",
          "kana": "「Dung nạp văn hóa và các mô hình tích hợp lao động nhập cư」をめぐるぎろんにおいては、ひそうてきなかいしゃくをはいし、ほんしつてきなこうぞうてきれんかんにちゃくもくせねばなりません。",
          "vi": "Trong các cuộc luận chiến xoay quanh đề tài \"Dung nạp văn hóa và các mô hình tích hợp lao động nhập cư\", ta buộc phải gạt bỏ những diễn giải hời hợt bề mặt để tập trung vào mối liên hệ cấu trúc mang tính bản chất."
        },
        {
          "speaker": "Học giả",
          "role": "B",
          "kanji": "既存のパラダイムを再考し、多元的視座からアプローチすることが肝要ですね。",
          "kana": "きそんのぱらだいむをさいこうし、たげんてきしざからあぷろーちすることがかんようですね。",
          "vi": "Việc phản tư lại các khuôn mẫu lý thuyết hiện có và tiếp cận từ góc nhìn đa chiều là điều tối quan trọng."
        },
        {
          "speaker": "Giáo sư",
          "role": "A",
          "kanji": "正にその通りです。学際的知見の統合こそが、未曾有の課題に対する突破口を拓くのです。",
          "kana": "まさにそのとおりです。がくさいてきちけんのとうごうこそが、みぞうのかだいに対するとっぱこうをひらくのです。",
          "vi": "Đích thị là như vậy. Chính sự hội tụ của tri thức liên ngành mới khai mở được bước đột phá trước những thách thức chưa từng có tiền lệ."
        }
      ],
      "question": "Thông điệp học thuật cốt lõi được giáo sư và học giả đồng thuận trong cuộc thảo luận về \"Dung nạp văn hóa và các mô hình tích hợp lao động nhập cư\" là gì?",
      "options": [
        {
          "id": "A",
          "text": "Duy trì cách tiếp cận đơn ngành cổ điển không thay đổi"
        },
        {
          "id": "B",
          "text": "Cần nhìn nhận bản chất cấu trúc và hội tụ tri thức liên ngành đa chiều để tạo đột phá"
        },
        {
          "id": "C",
          "text": "Từ bỏ việc nghiên cứu vì vấn đề quá phức tạp"
        },
        {
          "id": "D",
          "text": "Chỉ tập trung vào lợi ích kinh tế thực dụng"
        }
      ],
      "correctAnswer": "B",
      "explanation": "Giáo sư đúc kết: 「学際的知見の統合こそが、未曾有の課題に対する突破口を拓く」(Hội tụ tri thức liên ngành mở ra đột phá). Đáp án đúng là B.",
      "keyword": "Dung nạp văn hóa và các mô hình tích hợp lao động nhập cư & 学際的知見",
      "tip": "N1 Choukai đòi hỏi khả năng nắm bắt văn phong học thuật trừu tượng, các quán dụng ngữ cao cấp và cách lập luận triết học."
    },
    {
      "id": "N1_23",
      "level": "N1",
      "lesson": 23,
      "topic": "Bài 23: Lịch sử biến thiên của kịch nghệ Kabuki và diện mạo đương đại",
      "situation": "Chủ đề thượng cấp học thuật và nghị trường N1: Lịch sử biến thiên của kịch nghệ Kabuki và diện mạo đương đại.",
      "audioText": "こちらは最高峰JLPT N1レベルの聴解試験です。高度な論理展開と抽象的表現を正確に把握して回答してください。",
      "dialogue": [
        {
          "speaker": "Giáo sư",
          "role": "A",
          "kanji": "「Lịch sử biến thiên của kịch nghệ Kabuki và diện mạo đương đại」を巡る議論においては、皮相的な解釈を排し、本質的な構造的連関に着目せねばなりません。",
          "kana": "「Lịch sử biến thiên của kịch nghệ Kabuki và diện mạo đương đại」をめぐるぎろんにおいては、ひそうてきなかいしゃくをはいし、ほんしつてきなこうぞうてきれんかんにちゃくもくせねばなりません。",
          "vi": "Trong các cuộc luận chiến xoay quanh đề tài \"Lịch sử biến thiên của kịch nghệ Kabuki và diện mạo đương đại\", ta buộc phải gạt bỏ những diễn giải hời hợt bề mặt để tập trung vào mối liên hệ cấu trúc mang tính bản chất."
        },
        {
          "speaker": "Học giả",
          "role": "B",
          "kanji": "既存のパラダイムを再考し、多元的視座からアプローチすることが肝要ですね。",
          "kana": "きそんのぱらだいむをさいこうし、たげんてきしざからあぷろーちすることがかんようですね。",
          "vi": "Việc phản tư lại các khuôn mẫu lý thuyết hiện có và tiếp cận từ góc nhìn đa chiều là điều tối quan trọng."
        },
        {
          "speaker": "Giáo sư",
          "role": "A",
          "kanji": "正にその通りです。学際的知見の統合こそが、未曾有の課題に対する突破口を拓くのです。",
          "kana": "まさにそのとおりです。がくさいてきちけんのとうごうこそが、みぞうのかだいに対するとっぱこうをひらくのです。",
          "vi": "Đích thị là như vậy. Chính sự hội tụ của tri thức liên ngành mới khai mở được bước đột phá trước những thách thức chưa từng có tiền lệ."
        }
      ],
      "question": "Thông điệp học thuật cốt lõi được giáo sư và học giả đồng thuận trong cuộc thảo luận về \"Lịch sử biến thiên của kịch nghệ Kabuki và diện mạo đương đại\" là gì?",
      "options": [
        {
          "id": "A",
          "text": "Duy trì cách tiếp cận đơn ngành cổ điển không thay đổi"
        },
        {
          "id": "B",
          "text": "Cần nhìn nhận bản chất cấu trúc và hội tụ tri thức liên ngành đa chiều để tạo đột phá"
        },
        {
          "id": "C",
          "text": "Từ bỏ việc nghiên cứu vì vấn đề quá phức tạp"
        },
        {
          "id": "D",
          "text": "Chỉ tập trung vào lợi ích kinh tế thực dụng"
        }
      ],
      "correctAnswer": "B",
      "explanation": "Giáo sư đúc kết: 「学際的知見の統合こそが、未曾有の課題に対する突破口を拓く」(Hội tụ tri thức liên ngành mở ra đột phá). Đáp án đúng là B.",
      "keyword": "Lịch sử biến thiên của kịch nghệ Kabuki và diện mạo đương đại & 学際的知見",
      "tip": "N1 Choukai đòi hỏi khả năng nắm bắt văn phong học thuật trừu tượng, các quán dụng ngữ cao cấp và cách lập luận triết học."
    },
    {
      "id": "N1_24",
      "level": "N1",
      "lesson": 24,
      "topic": "Bài 24: Khảo cứu Shinto: Mối quan hệ cộng sinh giữa vạn vật và môi trường sống",
      "situation": "Chủ đề thượng cấp học thuật và nghị trường N1: Khảo cứu Shinto: Mối quan hệ cộng sinh giữa vạn vật và môi trường sống.",
      "audioText": "こちらは最高峰JLPT N1レベルの聴解試験です。高度な論理展開と抽象的表現を正確に把握して回答してください。",
      "dialogue": [
        {
          "speaker": "Giáo sư",
          "role": "A",
          "kanji": "「Khảo cứu Shinto: Mối quan hệ cộng sinh giữa vạn vật và môi trường sống」を巡る議論においては、皮相的な解釈を排し、本質的な構造的連関に着目せねばなりません。",
          "kana": "「Khảo cứu Shinto: Mối quan hệ cộng sinh giữa vạn vật và môi trường sống」をめぐるぎろんにおいては、ひそうてきなかいしゃくをはいし、ほんしつてきなこうぞうてきれんかんにちゃくもくせねばなりません。",
          "vi": "Trong các cuộc luận chiến xoay quanh đề tài \"Khảo cứu Shinto: Mối quan hệ cộng sinh giữa vạn vật và môi trường sống\", ta buộc phải gạt bỏ những diễn giải hời hợt bề mặt để tập trung vào mối liên hệ cấu trúc mang tính bản chất."
        },
        {
          "speaker": "Học giả",
          "role": "B",
          "kanji": "既存のパラダイムを再考し、多元的視座からアプローチすることが肝要ですね。",
          "kana": "きそんのぱらだいむをさいこうし、たげんてきしざからあぷろーちすることがかんようですね。",
          "vi": "Việc phản tư lại các khuôn mẫu lý thuyết hiện có và tiếp cận từ góc nhìn đa chiều là điều tối quan trọng."
        },
        {
          "speaker": "Giáo sư",
          "role": "A",
          "kanji": "正にその通りです。学際的知見の統合こそが、未曾有の課題に対する突破口を拓くのです。",
          "kana": "まさにそのとおりです。がくさいてきちけんのとうごうこそが、みぞうのかだいに対するとっぱこうをひらくのです。",
          "vi": "Đích thị là như vậy. Chính sự hội tụ của tri thức liên ngành mới khai mở được bước đột phá trước những thách thức chưa từng có tiền lệ."
        }
      ],
      "question": "Thông điệp học thuật cốt lõi được giáo sư và học giả đồng thuận trong cuộc thảo luận về \"Khảo cứu Shinto: Mối quan hệ cộng sinh giữa vạn vật và môi trường sống\" là gì?",
      "options": [
        {
          "id": "A",
          "text": "Duy trì cách tiếp cận đơn ngành cổ điển không thay đổi"
        },
        {
          "id": "B",
          "text": "Cần nhìn nhận bản chất cấu trúc và hội tụ tri thức liên ngành đa chiều để tạo đột phá"
        },
        {
          "id": "C",
          "text": "Từ bỏ việc nghiên cứu vì vấn đề quá phức tạp"
        },
        {
          "id": "D",
          "text": "Chỉ tập trung vào lợi ích kinh tế thực dụng"
        }
      ],
      "correctAnswer": "B",
      "explanation": "Giáo sư đúc kết: 「学際的知見の統合こそが、未曾有の課題に対する突破口を拓く」(Hội tụ tri thức liên ngành mở ra đột phá). Đáp án đúng là B.",
      "keyword": "Khảo cứu Shinto: Mối quan hệ cộng sinh giữa vạn vật và môi trường sống & 学際的知見",
      "tip": "N1 Choukai đòi hỏi khả năng nắm bắt văn phong học thuật trừu tượng, các quán dụng ngữ cao cấp và cách lập luận triết học."
    },
    {
      "id": "N1_25",
      "level": "N1",
      "lesson": 25,
      "topic": "Bài 25: Tuyên bố chung của hội nghị thượng đỉnh các viện hàn lâm khoa học quốc tế",
      "situation": "Chủ đề thượng cấp học thuật và nghị trường N1: Tuyên bố chung của hội nghị thượng đỉnh các viện hàn lâm khoa học quốc tế.",
      "audioText": "こちらは最高峰JLPT N1レベルの聴解試験です。高度な論理展開と抽象的表現を正確に把握して回答してください。",
      "dialogue": [
        {
          "speaker": "Giáo sư",
          "role": "A",
          "kanji": "「Tuyên bố chung của hội nghị thượng đỉnh các viện hàn lâm khoa học quốc tế」を巡る議論においては、皮相的な解釈を排し、本質的な構造的連関に着目せねばなりません。",
          "kana": "「Tuyên bố chung của hội nghị thượng đỉnh các viện hàn lâm khoa học quốc tế」をめぐるぎろんにおいては、ひそうてきなかいしゃくをはいし、ほんしつてきなこうぞうてきれんかんにちゃくもくせねばなりません。",
          "vi": "Trong các cuộc luận chiến xoay quanh đề tài \"Tuyên bố chung của hội nghị thượng đỉnh các viện hàn lâm khoa học quốc tế\", ta buộc phải gạt bỏ những diễn giải hời hợt bề mặt để tập trung vào mối liên hệ cấu trúc mang tính bản chất."
        },
        {
          "speaker": "Học giả",
          "role": "B",
          "kanji": "既存のパラダイムを再考し、多元的視座からアプローチすることが肝要ですね。",
          "kana": "きそんのぱらだいむをさいこうし、たげんてきしざからあぷろーちすることがかんようですね。",
          "vi": "Việc phản tư lại các khuôn mẫu lý thuyết hiện có và tiếp cận từ góc nhìn đa chiều là điều tối quan trọng."
        },
        {
          "speaker": "Giáo sư",
          "role": "A",
          "kanji": "正にその通りです。学際的知見の統合こそが、未曾有の課題に対する突破口を拓くのです。",
          "kana": "まさにそのとおりです。がくさいてきちけんのとうごうこそが、みぞうのかだいに対するとっぱこうをひらくのです。",
          "vi": "Đích thị là như vậy. Chính sự hội tụ của tri thức liên ngành mới khai mở được bước đột phá trước những thách thức chưa từng có tiền lệ."
        }
      ],
      "question": "Thông điệp học thuật cốt lõi được giáo sư và học giả đồng thuận trong cuộc thảo luận về \"Tuyên bố chung của hội nghị thượng đỉnh các viện hàn lâm khoa học quốc tế\" là gì?",
      "options": [
        {
          "id": "A",
          "text": "Duy trì cách tiếp cận đơn ngành cổ điển không thay đổi"
        },
        {
          "id": "B",
          "text": "Cần nhìn nhận bản chất cấu trúc và hội tụ tri thức liên ngành đa chiều để tạo đột phá"
        },
        {
          "id": "C",
          "text": "Từ bỏ việc nghiên cứu vì vấn đề quá phức tạp"
        },
        {
          "id": "D",
          "text": "Chỉ tập trung vào lợi ích kinh tế thực dụng"
        }
      ],
      "correctAnswer": "B",
      "explanation": "Giáo sư đúc kết: 「学際的知見の統合こそが、未曾有の課題に対する突破口を拓く」(Hội tụ tri thức liên ngành mở ra đột phá). Đáp án đúng là B.",
      "keyword": "Tuyên bố chung của hội nghị thượng đỉnh các viện hàn lâm khoa học quốc tế & 学際的知見",
      "tip": "N1 Choukai đòi hỏi khả năng nắm bắt văn phong học thuật trừu tượng, các quán dụng ngữ cao cấp và cách lập luận triết học."
    }
  ]
};
