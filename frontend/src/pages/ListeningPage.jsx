import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { speakJapanese } from '../services/api';
import { sounds } from '../services/sounds';
import confetti from 'canvas-confetti';
import {
  Headphones,
  Play,
  RotateCcw,
  Sparkles,
  Volume2,
  CheckCircle2,
  XCircle,
  Eye,
  EyeOff,
  Gauge,
  HelpCircle,
  ChevronRight,
  ChevronLeft,
  Award,
  MessageSquare,
  BookOpen
} from 'lucide-react';

export default function ListeningPage() {
  const { currentLevel, askAi, selectedLesson: appLesson } = useApp();
  const activeLevel = currentLevel || 'N5';

  const [lessonChoice, setLessonChoice] = useState('1');

  // Trọn bộ 25 bài nghe hội thoại Minna no Nihongo chuẩn format đề thi JLPT N5 Choukai
  const allTracks = [
    {
      id: 1,
      lesson: 1,
      topic: 'Bài 01: Giới thiệu bản thân & Quốc tịch',
      situation: 'Tại văn phòng công ty IMC, anh Mike Miller và chị Sato đang nói chuyện với một người bạn mới là anh Santos.',
      audioText: '初めまして。マイク・ミラーです。アメリカから来ました。会社員です。どうぞよろしくお願いします。サントスさんも会社員ですか。いいえ、私は学生です。ブラジルから来ました。',
      dialogue: [
        {
          speaker: 'Mike Miller',
          role: 'A',
          kanji: '初めまして。マイク・ミラーです。アメリカから来ました。会社員です。どうぞよろしくお願いします。',
          kana: 'はじめまして。まいく・みらーです。あめりかからきました。かいしゃいんです。どうぞよろしくおねがいします。',
          vi: 'Rất vui được gặp bạn. Tôi là Mike Miller, đến từ Mỹ. Tôi là nhân viên công ty. Rất mong được giúp đỡ.'
        },
        {
          speaker: 'Mike Miller',
          role: 'A',
          kanji: 'サントスさんも会社員ですか。',
          kana: 'さんとすさんもかいしゃいんですか。',
          vi: 'Anh Santos cũng là nhân viên công ty phải không?'
        },
        {
          speaker: 'Santos',
          role: 'B',
          kanji: 'いいえ、私は学生です。ブラジルから来ました。',
          kana: 'いいえ、わたしはがくせいです。ぶらじるからきました。',
          vi: 'Không, tôi là sinh viên. Tôi đến từ Brazil.'
        }
      ],
      question: 'Anh Santos làm nghề gì và đến từ đâu?',
      options: [
        { id: 'A', text: 'Nhân viên công ty, đến từ Mỹ' },
        { id: 'B', text: 'Sinh viên, đến từ Brazil' },
        { id: 'C', text: 'Kỹ sư, đến từ Brazil' },
        { id: 'D', text: 'Giáo viên, đến từ Nhật Bản' }
      ],
      correctAnswer: 'B',
      explanation: 'Anh Santos trả lời rõ: 「いいえ、私は学生です。ブラジルから来ました」(Không, tôi là sinh viên. Tôi đến từ Brazil). Đáp án đúng là B.',
      keyword: '学生 (がくせい) & ブラジル',
      tip: 'Chú ý từ phủ định 「いいえ」 để loại trừ nghề nghiệp của người hỏi trước đó.'
    },
    {
      id: 2,
      lesson: 2,
      topic: 'Bài 02: Đồ vật xung quanh & Chủ nhân',
      situation: 'Trong lớp học tiếng Nhật, bạn học hỏi chị Sato về chiếc ô và cuốn tạp chí để trên bàn.',
      audioText: 'すみません、それは何ですか。これは自動車の雑誌です。じゃ、あそこにある黒い傘は誰の傘ですか。あれは私の傘です。ありがとうございます。',
      dialogue: [
        {
          speaker: 'Bạn A',
          role: 'A',
          kanji: 'すみません、それは何ですか。',
          kana: 'すみません、それはなんですか。',
          vi: 'Xin lỗi, đồ vật đó là cái gì vậy?'
        },
        {
          speaker: 'Sato',
          role: 'B',
          kanji: 'これは自動車の雑誌です。',
          kana: 'これはじどうしゃのざっしです。',
          vi: 'Đây là cuốn tạp chí về xe ô tô.'
        },
        {
          speaker: 'Bạn A',
          role: 'A',
          kanji: 'じゃ、あそこにある黒い傘は誰の傘ですか。',
          kana: 'じゃ、あそこにあるくろいかさはだれのかさですか。',
          vi: 'Thế chiếc ô màu đen ở đằng kia là của ai vậy?'
        },
        {
          speaker: 'Sato',
          role: 'B',
          kanji: 'あれは私の傘です。',
          kana: 'あれはわたしのかさです。',
          vi: 'Cái đó là chiếc ô của tôi.'
        }
      ],
      question: 'Chiếc ô màu đen ở đằng kia là của ai?',
      options: [
        { id: 'A', text: 'Của bạn A' },
        { id: 'B', text: 'Của chị Sato' },
        { id: 'C', text: 'Của giáo viên' },
        { id: 'D', text: 'Không ai nhận' }
      ],
      correctAnswer: 'B',
      explanation: 'Chị Sato nói: 「あれは私の傘です」(Cái đó là ô của tôi). Đáp án chính xác là B.',
      keyword: '私の傘 (わたしのかさ)',
      tip: 'Mẫu câu sở hữu danh từ 「〜の傘」 rất hay ra trong kỳ thi Choukai Minna Bài 2.'
    },
    {
      id: 3,
      lesson: 3,
      topic: 'Bài 03: Vị trí, Địa điểm & Nơi chốn',
      situation: 'Một vị khách bước vào toà nhà công ty và hỏi nhân viên lễ tân đường đến văn phòng và cầu thang máy.',
      audioText: 'いらっしゃいませ。すみません、事務室はどこですか。事務室はあちらですよ。エレベーターは階段の隣です。どうもありがとうございます。',
      dialogue: [
        {
          speaker: 'Lễ tân',
          role: 'A',
          kanji: 'いらっしゃいませ。',
          kana: 'いらっしゃいませ。',
          vi: 'Xin kính chào quý khách.'
        },
        {
          speaker: 'Khách',
          role: 'B',
          kanji: 'すみません、事務室はどこですか。',
          kana: 'すみません、じむしつはどこですか。',
          vi: 'Xin lỗi, phòng văn phòng nằm ở đâu vậy?'
        },
        {
          speaker: 'Lễ tân',
          role: 'A',
          kanji: '事務室はあちらですよ。エレベーターは階段の隣です。',
          kana: 'じむしつはあちらですよ。えれべーたーはかいだんのとなりです。',
          vi: 'Văn phòng ở đằng kia nhé ạ. Còn thang máy ở ngay cạnh cầu thang bộ.'
        }
      ],
      question: 'Thang máy nằm ở vị trí nào theo lời nhân viên lễ tân?',
      options: [
        { id: 'A', text: 'Ở trong văn phòng' },
        { id: 'B', text: 'Ở ngay cạnh cầu thang bộ' },
        { id: 'C', text: 'Ở tầng hầm' },
        { id: 'D', text: 'Ở bên ngoài cổng toà nhà' }
      ],
      correctAnswer: 'B',
      explanation: 'Lễ tân hướng dẫn: 「階段の隣です」(Ngay cạnh cầu thang bộ). Đáp án là B.',
      keyword: '階段の隣 (かいだんのとなり)',
      tip: 'Chú ý từ chỉ vị trí tương đối: 「隣」(bên cạnh), 「前」(phía trước), 「後ろ」(phía sau).'
    },
    {
      id: 4,
      lesson: 4,
      topic: 'Bài 04: Thời gian, Giờ giấc & Lịch làm việc',
      situation: 'Khách hàng gọi điện thoại đến ngân hàng Tokyo để hỏi giờ mở cửa và ngày nghỉ trong tuần.',
      audioText: 'もしもし、そちらの銀行は何時から何時までですか。午前9時から午後3時までです。土曜日は休みですか。はい、土曜日と日曜日は休みです。分かりました。',
      dialogue: [
        {
          speaker: 'Khách hàng',
          role: 'A',
          kanji: 'もしもし、そちらの銀行は何時から何時までですか。',
          kana: 'もしもし、そちらのぎんこうはなんじからなんじまでですか。',
          vi: 'Alo, ngân hàng bên bạn mở cửa từ mấy giờ đến mấy giờ vậy?'
        },
        {
          speaker: 'Nhân viên ngân hàng',
          role: 'B',
          kanji: '午前9時から午後3時までです。土曜日と日曜日は休みです。',
          kana: 'ごぜんくじからごごさんじまでです。どようびとにちようびはやすみです。',
          vi: 'Dạ mở cửa từ 9 giờ sáng đến 3 giờ chiều ạ. Thứ 7 và chủ nhật bên em nghỉ ạ.'
        }
      ],
      question: 'Ngân hàng đóng cửa (nghỉ làm việc) vào những ngày nào?',
      options: [
        { id: 'A', text: 'Chỉ nghỉ Chủ Nhật' },
        { id: 'B', text: 'Thứ Bảy và Chủ Nhật' },
        { id: 'C', text: 'Mở cửa cả tuần' },
        { id: 'D', text: 'Nghỉ sau 5 giờ chiều' }
      ],
      correctAnswer: 'B',
      explanation: 'Nhân viên trả lời: 「土曜日と日曜日は休みです」(Thứ 7 và chủ nhật nghỉ). Đáp án là B.',
      keyword: '土曜日と日曜日 (Thứ 7 và Chủ nhật)',
      tip: 'Mẫu câu thời gian 「〜から〜まで」 và danh sách ngày nghỉ với trợ từ 「と」.'
    },
    {
      id: 5,
      lesson: 5,
      topic: 'Bài 05: Phương tiện & Đi lại',
      situation: 'Hai người bạn đang trao đổi về kế hoạch đi du lịch Kyoto vào kỳ nghỉ cuối tuần.',
      audioText: '週末、どこへ行きますか。京都へ行きます。一人で行きますか。いいえ、友達と行きます。新幹線で行きます。とても速いですよ。',
      dialogue: [
        {
          speaker: 'Bạn A',
          role: 'A',
          kanji: '週末、どこへ行きますか。一人で行きますか。',
          kana: 'しゅうまつ、どこへいきますか。ひとりでおこないますか。',
          vi: 'Cuối tuần này bạn đi đâu thế? Bạn đi một mình à?'
        },
        {
          speaker: 'Bạn B',
          role: 'B',
          kanji: '京都へ行きます。いいえ、友達と新幹線で行きます。',
          kana: 'きょうとへいきます。いいえ、ともだちとしんかんせんでいきます。',
          vi: 'Mình đi Kyoto. Không, mình đi cùng bạn bè bằng tàu siêu tốc Shinkansen.'
        }
      ],
      question: 'Bạn B đi Kyoto bằng phương tiện gì và đi cùng ai?',
      options: [
        { id: 'A', text: 'Đi xe buýt một mình' },
        { id: 'B', text: 'Đi tàu Shinkansen cùng bạn bè' },
        { id: 'C', text: 'Đi máy bay cùng gia đình' },
        { id: 'D', text: 'Đi xe đạp một mình' }
      ],
      correctAnswer: 'B',
      explanation: 'Bạn B xác nhận: 「友達と新幹線で行きます」(Đi cùng bạn, đi bằng tàu Shinkansen). Đáp án đúng là B.',
      keyword: '友達と (Cùng bạn) & 新幹線で (Bằng Shinkansen)',
      tip: 'Trợ từ 「と」 chỉ đối tượng cùng hành động, trợ từ 「で」 chỉ phương tiện di chuyển.'
    },
    {
      id: 6,
      lesson: 6,
      topic: 'Bài 06: Mua sắm, Ẩm thực & Địa điểm ăn uống',
      situation: 'Vào giờ nghỉ trưa, hai đồng nghiệp công ty rủ nhau đi ăn trưa và hỏi địa điểm ăn uống.',
      audioText: '田中さん、昼ごはんを一緒に食べませんか。ええ、食べましょう。どこで食べますか。駅前のレストランで食べましょう。魚料理にします。',
      dialogue: [
        {
          speaker: 'Đồng nghiệp A',
          role: 'A',
          kanji: '田中さん、昼ごはんを一緒に食べませんか。',
          kana: 'たなかさん、ひるごはんをいっしょにたべませんか。',
          vi: 'Anh Tanaka, cùng đi ăn cơm trưa với tôi nhé?'
        },
        {
          speaker: 'Tanaka',
          role: 'B',
          kanji: 'ええ、食べましょう。駅前のレストランで魚料理にしましょう。',
          kana: 'ええ、たべましょう。えきまえのれすとらんでさかなりょうりにしましょう。',
          vi: 'Vâng, đi ăn thôi. Hãy ghé nhà hàng trước ga ăn món cá nhé.'
        }
      ],
      question: 'Hai đồng nghiệp quyết định sẽ ăn trưa ở đâu?',
      options: [
        { id: 'A', text: 'Ở căng tin công ty' },
        { id: 'B', text: 'Ở nhà hàng trước nhà ga' },
        { id: 'C', text: 'Ở cửa hàng tiện lợi' },
        { id: 'D', text: 'Ở nhà riêng anh Tanaka' }
      ],
      correctAnswer: 'B',
      explanation: 'Địa điểm được chọn là: 「駅前のレストラン」(Nhà hàng trước ga). Đáp án là B.',
      keyword: '駅前のレストラン (Nhà hàng trước ga)',
      tip: 'Cấu trúc rủ rê lịch sự 「〜ませんか」 và đồng thuận 「〜ましょう」.'
    },
    {
      id: 7,
      lesson: 7,
      topic: 'Bài 07: Tặng quà, Dụng cụ & Công cụ',
      situation: 'Yamada tặng quà sinh nhật cho đồng nghiệp và nói về cách ăn một món bánh đặc biệt.',
      audioText: '木村さん、お誕生日おめでとうございます。このプレゼントをどうぞ。わあ、素敵なスプーンですね。ありがとうございます。このスプーンでアイスクリームを食べます。',
      dialogue: [
        {
          speaker: 'Yamada',
          role: 'A',
          kanji: '木村さん、お誕生日おめでとうございます。このプレゼントをどうぞ。',
          kana: 'きむらさん、おたんじょうびおめでとうございます。このぷれぜんとをどうぞ。',
          vi: 'Chị Kimura, chúc mừng sinh nhật chị. Xin gửi tặng chị món quà này.'
        },
        {
          speaker: 'Kimura',
          role: 'B',
          kanji: 'わあ、素敵なスプーンですね。このスプーンでアイスクリームを食べます。',
          kana: 'わあ、すてきなすぷーんですね。このすぷーんであいすくりーむをたべます。',
          vi: 'Oa, một chiếc thìa thật đẹp. Tôi sẽ dùng chiếc thìa này để ăn kem.'
        }
      ],
      question: 'Chị Kimura nhận được món quà gì nhân dịp sinh nhật?',
      options: [
        { id: 'A', text: 'Một hộp kem socola' },
        { id: 'B', text: 'Một chiếc thìa xinh xắn' },
        { id: 'C', text: 'Một bó hoa tươi' },
        { id: 'D', text: 'Một đôi đũa gỗ' }
      ],
      correctAnswer: 'B',
      explanation: 'Món quà được mở ra là: 「素敵なスプーン」(Chiếc thìa xinh xắn). Đáp án đúng là B.',
      keyword: 'スプーン (Chiếc thìa / muỗng)',
      tip: 'Trợ từ 「で」 chỉ công cụ, phương tiện thao tác: 「スプーンで」(bằng thìa).'
    },
    {
      id: 8,
      lesson: 8,
      topic: 'Bài 08: Tính từ miêu tả phong cảnh & Trải nghiệm',
      situation: 'Trò chuyện về chuyến đi du lịch núi Phú Sĩ và cảm nhận về cuộc sống tại Tokyo.',
      audioText: '先週、富士山へ行きました。富士山はどうでしたか。とても高くて、綺麗でした。日本の生活もとても面白いです。',
      dialogue: [
        {
          speaker: 'Bạn A',
          role: 'A',
          kanji: '先週、富士山へ行きました。富士山はどうでしたか。',
          kana: 'せんしゅう、ふじさんへいきました。ふじさんはどうでしたか。',
          vi: 'Tuần trước mình đã đi núi Phú Sĩ. Núi Phú Sĩ thế nào?'
        },
        {
          speaker: 'Bạn B',
          role: 'B',
          kanji: 'とても高くて、綺麗でした。日本の生活もとても面白いです。',
          kana: 'とてもたかくて、きれいでした。にほんのせいかつもとてもおもしろいです。',
          vi: 'Núi rất cao và đẹp. Cuộc sống ở Nhật Bản cũng rất thú vị.'
        }
      ],
      question: 'Người nói có cảm nhận như thế nào về núi Phú Sĩ?',
      options: [
        { id: 'A', text: 'Núi thấp và không đẹp' },
        { id: 'B', text: 'Rất cao và rất đẹp' },
        { id: 'C', text: 'Thời tiết lạnh và buồn chán' },
        { id: 'D', text: 'Đông đúc và nguy hiểm' }
      ],
      correctAnswer: 'B',
      explanation: 'Người nói miêu tả rõ: 「とても高くて、綺麗でした」(Rất cao và đẹp). Đáp án là B.',
      keyword: '高くて、綺麗でした (Cao và đẹp)',
      tip: 'Mẫu câu hỏi cảm nhận trong quá khứ 「〜はどうでしたか」.'
    },
    {
      id: 9,
      lesson: 9,
      topic: 'Bài 09: Sở thích, Năng lực & Mức độ hiểu biết',
      situation: 'Trao đổi về khả năng chơi thể thao và sở thích nghe nhạc Nhật Bản.',
      audioText: 'マイクさん、スポーツが好きですか。はい、サッカーが大好きです。ピアノも弾くことができますか。いいえ、ピアノは全然できません。',
      dialogue: [
        {
          speaker: 'Bạn A',
          role: 'A',
          kanji: 'マイクさん、スポーツが好きですか。ピアノも弾けますか。',
          kana: 'まいくさん、すぽーつがすきですか。ぴあのもひけますか。',
          vi: 'Anh Mike, anh có thích thể thao không? Anh có chơi được piano không?'
        },
        {
          speaker: 'Mike',
          role: 'B',
          kanji: 'サッカーが大好きです。でも、ピアノは全然できません。',
          kana: 'さっかーがだいすきです。でも、ぴあのはぜんぜんできません。',
          vi: 'Tôi rất thích đá bóng. Nhưng piano thì tôi hoàn toàn không biết chơi.'
        }
      ],
      question: 'Anh Mike có khả năng và sở thích gì?',
      options: [
        { id: 'A', text: 'Chơi đàn piano rất giỏi' },
        { id: 'B', text: 'Rất thích đá bóng, không biết chơi piano' },
        { id: 'C', text: 'Không thích thể thao' },
        { id: 'D', text: 'Chơi giỏi cả bóng đá và piano' }
      ],
      correctAnswer: 'B',
      explanation: 'Mike trả lời: 「サッカーが大好きです。でも、ピアノは全然できません」(Rất thích bóng đá, hoàn toàn không biết chơi piano). Đáp án là B.',
      keyword: 'サッカーが大好き & 全然できません',
      tip: 'Từ phủ định triệt để 「全然〜ません」(hoàn toàn không).'
    },
    {
      id: 10,
      lesson: 10,
      topic: 'Bài 10: Tồn tại Người & Đồ vật (Arimasu / Imasu)',
      situation: 'Tìm đồ dùng học tập và hỏi thăm vị trí của đồng nghiệp trong văn phòng.',
      audioText: 'すみません、私のハサミはどこですか。机の上にペンとノートがあります。ハサミはその箱の中にありますよ。佐藤さんは会議室にいます。',
      dialogue: [
        {
          speaker: 'Nhân viên A',
          role: 'A',
          kanji: 'すみません、私のハサミはどこですか。',
          kana: 'すみません、わたしのはさみはどこですか。',
          vi: 'Xin lỗi, chiếc kéo của tôi ở đâu vậy?'
        },
        {
          speaker: 'Nhân viên B',
          role: 'B',
          kanji: 'ハサミはその青い箱の中にありますよ。',
          kana: 'はさみはそのあおいはこのなかにありますよ。',
          vi: 'Cây kéo nằm ở bên trong chiếc hộp màu xanh kia kìa.'
        }
      ],
      question: 'Cây kéo (ハサミ) đang ở vị trí nào?',
      options: [
        { id: 'A', text: 'Ở trên mặt bàn' },
        { id: 'B', text: 'Ở trong chiếc hộp màu xanh' },
        { id: 'C', text: 'Ở phòng họp' },
        { id: 'D', text: 'Ở trong ngăn kéo' }
      ],
      correctAnswer: 'B',
      explanation: 'Nhân viên B chỉ rõ: 「箱の中にあります」(Ở trong hộp). Đáp án là B.',
      keyword: '箱の中にあります (Trong hộp)',
      tip: 'Phân biệt: Đồ vật dùng 「あります」, người và động vật dùng 「います」.'
    },
    {
      id: 11,
      lesson: 11,
      topic: 'Bài 11: Số lượng, Thời lượng & Giá cả',
      situation: 'Mua hoa quả tại siêu thị và hỏi thời gian di chuyển bằng xe buýt.',
      audioText: 'いらっしゃいませ。りんごを3つと、みかんを5つください。全部で800円です。駅までバスでどのくらいかかりますか。20分くらいかかりますよ。',
      dialogue: [
        {
          speaker: 'Khách',
          role: 'A',
          kanji: 'りんごを3つと、みかんを5つください。',
          kana: 'りんごをみっつと、みかんをいつつください。',
          vi: 'Cho tôi 3 quả táo và 5 quả quýt.'
        },
        {
          speaker: 'Thu ngân',
          role: 'B',
          kanji: '全部で800円です。駅まではバスで20分かかります。',
          kana: 'ぜんぶではっぴゃくえんです。えきまではばすでにじっぷんかかります。',
          vi: 'Tổng cộng là 800 yên. Đến nhà ga thì đi xe buýt mất khoảng 20 phút.'
        }
      ],
      question: 'Khách hàng đã mua tổng cộng bao nhiêu quả táo và quýt?',
      options: [
        { id: 'A', text: '3 quả táo và 5 quả quýt' },
        { id: 'B', text: '5 quả táo và 3 quả quýt' },
        { id: 'C', text: '8 quả táo' },
        { id: 'D', text: '2 quả quýt' }
      ],
      correctAnswer: 'A',
      explanation: 'Khách gọi: 「りんごを3つ (3 quả táo)」 và 「みかんを5つ (5 quả quýt)」. Đáp án đúng là A.',
      keyword: 'りんごを3つ & みかんを5つ',
      tip: 'Học kỹ cách đếm đồ vật thuần Nhật: ひとつ, ふたつ, みっつ, よっつ, いつつ.'
    },
    {
      id: 12,
      lesson: 12,
      topic: 'Bài 12: So sánh hơn & So sánh nhất',
      situation: 'So sánh thời tiết và các mùa trong năm tại Nhật Bản.',
      audioText: '日本は夏と冬と、どちらが寒いですか。冬のほうがずっと寒いです。1年の中でいつが一番好きですか。春が一番好きです。桜が綺麗ですから。',
      dialogue: [
        {
          speaker: 'Bạn A',
          role: 'A',
          kanji: '1年の中で、どの季節が一番好きですか。',
          kana: 'いちねんのなかで、どのきせつがいちばんすきですか。',
          vi: 'Trong 1 năm, bạn thích nhất mùa nào?'
        },
        {
          speaker: 'Bạn B',
          role: 'B',
          kanji: '春が一番好きです。桜がとても綺麗ですから。',
          kana: 'はるがいちばんすきです。さくらがとてもきれいですから。',
          vi: 'Mình thích mùa xuân nhất. Vì hoa anh đào rất đẹp.'
        }
      ],
      question: 'Bạn B thích nhất mùa nào trong năm và vì lý do gì?',
      options: [
        { id: 'A', text: 'Mùa đông vì có tuyết rơi' },
        { id: 'B', text: 'Mùa xuân vì hoa anh đào đẹp' },
        { id: 'C', text: 'Mùa hè vì được đi biển' },
        { id: 'D', text: 'Mùa thu vì lá đỏ' }
      ],
      correctAnswer: 'B',
      explanation: 'Bạn B nói: 「春が一番好きです。桜がとても綺麗ですから」(Thích mùa xuân nhất vì hoa anh đào đẹp). Đáp án là B.',
      keyword: '春が一番好き (Thích mùa xuân nhất)',
      tip: 'Mẫu câu so sánh nhất: 「〜の中で〜が一番好きです」.'
    },
    {
      id: 13,
      lesson: 13,
      topic: 'Bài 13: Mong muốn (Tai / Hoshii) & Mục đích di chuyển',
      situation: 'Trời mùa hè nóng bức, hai người rủ nhau đi mua đồ uống giải khát.',
      audioText: 'ああ、暑いですね。冷たいお茶が飲みたいです。駅の近くのカフェへアイスコーヒーを飲みに行きませんか。いいですね、行きましょう。',
      dialogue: [
        {
          speaker: 'Bạn A',
          role: 'A',
          kanji: 'ああ、暑いですね。冷たいジュースが飲みたいです。',
          kana: 'ああ、あついですね。つめたいじゅーすがのみたいです。',
          vi: 'A, nóng quá nhỉ. Tôi muốn uống nước hoa quả lạnh.'
        },
        {
          speaker: 'Bạn B',
          role: 'B',
          kanji: '近くのカフェへ冷たいものを飲みに行きませんか。',
          kana: 'ちかくのかふぇへつめたいものをのみにいきませんか。',
          vi: 'Chúng ta cùng đến quán cà phê gần đây uống đồ lạnh nhé?'
        }
      ],
      question: 'Hai bạn chuẩn bị đi đến quán cà phê để làm gì?',
      options: [
        { id: 'A', text: 'Đi ăn bánh mì' },
        { id: 'B', text: 'Đi uống đồ uống lạnh giải khát' },
        { id: 'C', text: 'Đi gặp khách hàng' },
        { id: 'D', text: 'Đi đọc sách' }
      ],
      correctAnswer: 'B',
      explanation: 'Mục đích là: 「飲みに行きます」(Đi để uống đồ lạnh). Đáp án là B.',
      keyword: '飲みたい (Muốn uống) & 飲みに行きます (Đi để uống)',
      tip: 'Mẫu ngữ pháp mục đích di chuyển: Động từ thể Masu bỏ Masu + 「に行きます」.'
    },
    {
      id: 14,
      lesson: 14,
      topic: 'Bài 14: Thể Te - Nhờ vả & Đề nghị giúp đỡ',
      situation: 'Trong phòng học, trời mưa to và gió thổi mạnh.',
      audioText: '雨が降ってきましたね。すみませんが、窓を閉めてください。はい、分かりました。荷物を持ちましょうか。ありがとうございます。助かります。',
      dialogue: [
        {
          speaker: 'Chị Mai',
          role: 'A',
          kanji: '雨が降ってきましたね。すみませんが、窓を閉めてください。',
          kana: 'あめがふってきましたね。すみませんが、まどをしめてください。',
          vi: 'Trời đổ mưa rồi nhỉ. Làm ơn đóng cửa sổ giúp tôi với.'
        },
        {
          speaker: 'Anh Nam',
          role: 'B',
          kanji: 'はい、閉めます。荷物を持ちましょうか。',
          kana: 'はい、しめます。にもつをもちましょうか。',
          vi: 'Vâng, tôi đóng ngay. Để tôi xách hành lý giúp bạn nhé?'
        }
      ],
      question: 'Chị Mai đã nhờ anh Nam làm hành động gì?',
      options: [
        { id: 'A', text: 'Mở cửa phòng' },
        { id: 'B', text: 'Đóng cửa sổ' },
        { id: 'C', text: 'Mua ô che mưa' },
        { id: 'D', text: 'Gọi xe taxi' }
      ],
      correctAnswer: 'B',
      explanation: 'Chị Mai nhờ: 「窓を閉めてください」(Hãy đóng cửa sổ giúp tôi). Đáp án là B.',
      keyword: '窓を閉めてください (Hãy đóng cửa sổ)',
      tip: 'Mẫu câu thể Te nhờ vả lịch sự: 「〜てください」.'
    },
    {
      id: 15,
      lesson: 15,
      topic: 'Bài 15: Thể Te - Xin phép (Te mo ii desu) & Cấm đoán',
      situation: 'Vị khách tham quan bảo tàng mỹ thuật hỏi về quy định chụp ảnh.',
      audioText: 'すみません、ここで写真を撮ってもいいですか。いいえ、写真を撮ってはいけません。美術館の中ですから。分かりました。気をつけます。',
      dialogue: [
        {
          speaker: 'Khách',
          role: 'A',
          kanji: 'すみません、ここで写真を撮ってもいいですか。',
          kana: 'すみません、ここでしゃしんをとってもいいですか。',
          vi: 'Xin lỗi, tôi có thể chụp ảnh ở đây được không?'
        },
        {
          speaker: 'Bảo vệ',
          role: 'B',
          kanji: 'いいえ、ここでは写真を撮ってはいけません。',
          kana: 'いいえ、ここではしゃしんをとってはいけません。',
          vi: 'Không được, ở đây cấm chụp ảnh nhé quý khách.'
        }
      ],
      question: 'Khách tham quan có được phép chụp ảnh không?',
      options: [
        { id: 'A', text: 'Được chụp ảnh thoải mái' },
        { id: 'B', text: 'Tuyệt đối cấm chụp ảnh' },
        { id: 'C', text: 'Được chụp nếu trả thêm phí' },
        { id: 'D', text: 'Chỉ được chụp bên ngoài' }
      ],
      correctAnswer: 'B',
      explanation: 'Bảo vệ thông báo cấm đoán: 「写真を撮ってはいけません」(Cấm chụp ảnh). Đáp án là B.',
      keyword: '撮ってはいけません (Cấm chụp ảnh)',
      tip: 'Mẫu cấm đoán: 「〜てはいけません」 (Không được phép làm gì).'
    },
    {
      id: 16,
      lesson: 16,
      topic: 'Bài 16: Thể Te - Nối hành động tuần tự (Te kara)',
      situation: 'Hỏi về thói quen sinh hoạt buổi sáng trước khi đi làm.',
      audioText: '毎朝、起きてから何をしますか。ジョギングをして、シャワーを浴びて、それから朝ごはんを食べます。忙しいですね。',
      dialogue: [
        {
          speaker: 'Bạn A',
          role: 'A',
          kanji: '毎朝、起きてから何をしますか。',
          kana: 'まいあさ、おきてからなにをしますか。',
          vi: 'Mỗi sáng, sau khi thức dậy bạn làm gì?'
        },
        {
          speaker: 'Bạn B',
          role: 'B',
          kanji: 'ジョギングをして、シャワーを浴びて、朝ごはんを食べます。',
          kana: 'じょぎんぐをして、しゃわーをあびて、あさごはんをたべます。',
          vi: 'Tôi chạy bộ, tắm vòi sen, rồi sau đó ăn sáng.'
        }
      ],
      question: 'Hành động đầu tiên bạn B làm sau khi thức dậy là gì?',
      options: [
        { id: 'A', text: 'Ăn bữa sáng' },
        { id: 'B', text: 'Chạy bộ thể dục (Jogging)' },
        { id: 'C', text: 'Đọc báo' },
        { id: 'D', text: 'Uống cà phê' }
      ],
      correctAnswer: 'B',
      explanation: 'Thứ tự hành động: 「ジョギングをして」(Chạy bộ trước tiên). Đáp án đúng là B.',
      keyword: 'ジョギングをして (Chạy bộ)',
      tip: 'Mẫu nối chuỗi hành động theo trình tự thời gian bằng thể Te: V1-te, V2-te, V3-masu.'
    },
    {
      id: 17,
      lesson: 17,
      topic: 'Bài 17: Thể Nai - Yêu cầu không làm gì (Naide kudasai)',
      situation: 'Bác sĩ căn dặn bệnh nhân bị cảm sốt tại phòng khám Tokyo.',
      audioText: '熱がありますね。今日はお風呂に入らないでください。薬を飲んで、早く寝てください。お酒も飲んではいけませんよ。はい、分かりました。',
      dialogue: [
        {
          speaker: 'Bác sĩ',
          role: 'A',
          kanji: '熱がありますね。今日はお風呂に入らないでください。',
          kana: 'ねつがありますね。きょうはおふろにはいらないでください。',
          vi: 'Bạn đang bị sốt đấy. Hôm nay xin đừng tắm bồn nhé.'
        },
        {
          speaker: 'Bác sĩ',
          role: 'A',
          kanji: '薬を飲んで、早く寝てください。',
          kana: 'くすりをのんで、はやくねてください。',
          vi: 'Hãy uống thuốc và đi ngủ sớm.'
        }
      ],
      question: 'Bác sĩ đã khuyên bệnh nhân hôm nay KHÔNG NÊN làm việc gì?',
      options: [
        { id: 'A', text: 'Không được uống thuốc' },
        { id: 'B', text: 'Không được tắm bồn' },
        { id: 'C', text: 'Không được ngủ sớm' },
        { id: 'D', text: 'Không được ăn cháo' }
      ],
      correctAnswer: 'B',
      explanation: 'Bác sĩ yêu cầu: 「お風呂に入らないでください」(Xin đừng tắm bồn). Đáp án là B.',
      keyword: '入らないでください (Xin đừng tắm)',
      tip: 'Mẫu phủ định lịch sự: Động từ thể Nai + 「でください」.'
    },
    {
      id: 18,
      lesson: 18,
      topic: 'Bài 18: Thể Từ điển - Năng lực & Sở thích (Koto ga dekimasu)',
      situation: 'Phỏng vấn tuyển dụng hỏi về khả năng ngoại ngữ và lái xe.',
      audioText: '車の運転ができますか。はい、運転することができます。英語を話すこともできます。パソコンの操作はどうですか。得意ですよ。',
      dialogue: [
        {
          speaker: 'Người phỏng vấn',
          role: 'A',
          kanji: '車の運転ができますか。',
          kana: 'くるまのうんてんができますか。',
          vi: 'Bạn có biết lái xe ô tô không?'
        },
        {
          speaker: 'Ứng viên',
          role: 'B',
          kanji: 'はい、運転することができます。英語も話せます。',
          kana: 'はい、うんてんすることができます。えいごもはなせます。',
          vi: 'Vâng, tôi có thể lái xe ô tô. Tôi cũng nói được tiếng Anh.'
        }
      ],
      question: 'Ứng viên có những kỹ năng nào sau đây?',
      options: [
        { id: 'A', text: 'Không biết lái xe ô tô' },
        { id: 'B', text: 'Lái được xe ô tô và nói được tiếng Anh' },
        { id: 'C', text: 'Chỉ biết nấu ăn' },
        { id: 'D', text: 'Không biết dùng máy tính' }
      ],
      correctAnswer: 'B',
      explanation: 'Ứng viên khẳng định: 「運転することができます。英語も話せます」. Đáp án đúng là B.',
      keyword: '運転することができます (Có thể lái xe)',
      tip: 'Mẫu biểu thị năng lực: Động từ thể Từ điển (Jishokei) + 「ことができます」.'
    },
    {
      id: 19,
      lesson: 19,
      topic: 'Bài 19: Thể Ta - Trải nghiệm quá khứ (Koto ga arimasu)',
      situation: 'Hai người bạn trò chuyện về các trải nghiệm du lịch tại Nhật.',
      audioText: '日本で温泉に入ったことがありますか。はい、一度だけ入ったことがあります。とても気持ちが良かったですよ。富士山にも登りましたか。いいえ、まだです。',
      dialogue: [
        {
          speaker: 'Bạn A',
          role: 'A',
          kanji: '日本で温泉に入ったことがありますか。',
          kana: 'にほんでおんせんにはいったことがありますか。',
          vi: 'Bạn đã từng tắm suối nước nóng (Onsen) ở Nhật chưa?'
        },
        {
          speaker: 'Bạn B',
          role: 'B',
          kanji: 'はい、一度だけ入ったことがあります。とても良かったです。',
          kana: 'はい、いちどだけはいったことがあります。とてもよかったです。',
          vi: 'Vâng, tôi đã từng tắm một lần rồi. Rất là sảng khoái.'
        }
      ],
      question: 'Bạn B đã từng có trải nghiệm nào trong quá khứ?',
      options: [
        { id: 'A', text: 'Chưa từng tắm Onsen bao giờ' },
        { id: 'B', text: 'Đã từng tắm suối nước nóng Onsen một lần' },
        { id: 'C', text: 'Đã leo lên đỉnh núi Phú Sĩ 2 lần' },
        { id: 'D', text: 'Tắm Onsen mỗi tuần' }
      ],
      correctAnswer: 'B',
      explanation: 'Bạn B xác nhận: 「一度だけ入ったことがあります」(Từng tắm một lần). Đáp án là B.',
      keyword: '入ったことがあります (Đã từng tắm)',
      tip: 'Mẫu trải nghiệm trong đời: Động từ thể Ta + 「ことがあります」.'
    },
    {
      id: 20,
      lesson: 20,
      topic: 'Bài 20: Thể Thông thường - Giao tiếp thân mật (Futsuukei)',
      situation: 'Hai người bạn thân cùng trường đại học trò chuyện thân mật rủ nhau đi chơi.',
      audioText: '明日、暇？うん、暇だよ。どこかへ行く？映画を見に行かない？いいね、何時に会う？10時はどう？分かった、じゃ10時に駅でね！',
      dialogue: [
        {
          speaker: 'Ken',
          role: 'A',
          kanji: '明日、暇？映画を見に行かない？',
          kana: 'あした、ひま？えいがをみにいかない？',
          vi: 'Mai rảnh không? Đi xem phim không?'
        },
        {
          speaker: 'Yuki',
          role: 'B',
          kanji: 'うん、いいね！10時に駅で会おう。',
          kana: 'うん、いいね！じゅうじにえきであおう。',
          vi: 'Ừ, được đó! Hẹn gặp lúc 10 giờ ở ga nhé.'
        }
      ],
      question: 'Hai bạn đã thống nhất hẹn nhau ở đâu và lúc mấy giờ?',
      options: [
        { id: 'A', text: '9 giờ ở rạp chiếu phim' },
        { id: 'B', text: '10 giờ ở nhà ga' },
        { id: 'C', text: '11 giờ ở quán cà phê' },
        { id: 'D', text: 'Không hẹn gặp' }
      ],
      correctAnswer: 'B',
      explanation: 'Chốt hẹn: 「10時に駅で」(10 giờ ở nhà ga). Đáp án đúng là B.',
      keyword: '10時に駅で (10 giờ ở ga)',
      tip: 'Thể thân mật Futsuukei lược bỏ Desu/Masu, chuyển câu hỏi sang lên giọng ở cuối câu.'
    },
    {
      id: 21,
      lesson: 21,
      topic: 'Bài 21: Bày tỏ ý kiến & Phỏng đoán (To omoimasu)',
      situation: 'Thảo luận về giá cả sinh hoạt tại thủ đô Tokyo.',
      audioText: '東京の物価についてどう思いますか。私は少し高すぎると思います。特に家賃が高いですね。でも、とても便利だとも思います。',
      dialogue: [
        {
          speaker: 'Bạn A',
          role: 'A',
          kanji: '東京の物価についてどう思いますか。',
          kana: 'とうきょうのぶっかについてどうおもいますか。',
          vi: 'Bạn nghĩ thế nào về vật giá ở Tokyo?'
        },
        {
          speaker: 'Bạn B',
          role: 'B',
          kanji: '私は高すぎると思います。特に家賃が高いです。',
          kana: 'わたしはたかすぎるとおもいます。とくにやちんがたかいです。',
          vi: 'Tôi nghĩ là quá đắt đỏ. Đặc biệt là tiền thuê nhà rất cao.'
        }
      ],
      question: 'Người nói có quan điểm như thế nào về chi phí tại Tokyo?',
      options: [
        { id: 'A', text: 'Vật giá rất rẻ' },
        { id: 'B', text: 'Vật giá quá đắt, nhất là tiền thuê nhà' },
        { id: 'C', text: 'Không quan tâm đến giá cả' },
        { id: 'D', text: 'Tiền thuê nhà rẻ hơn nông thôn' }
      ],
      correctAnswer: 'B',
      explanation: 'Người nói nêu ý kiến: 「高すぎると思います。特に家賃が高い」(Nghĩ là quá đắt, nhất là tiền thuê nhà). Đáp án là B.',
      keyword: '高すぎると思います (Nghĩ là quá đắt)',
      tip: 'Mẫu nêu ý kiến cá nhân: Thể thông thường + 「と思います」.'
    },
    {
      id: 22,
      lesson: 22,
      topic: 'Bài 22: Mệnh đề bổ nghĩa cho danh từ',
      situation: 'Xác định đồng nghiệp trong bức ảnh chụp chung toàn công ty.',
      audioText: 'あの眼鏡をかけている人は誰ですか。あの方は田中さんですよ。あそこで本を読んでいる人は誰ですか。ミラーさんです。',
      dialogue: [
        {
          speaker: 'Bạn A',
          role: 'A',
          kanji: 'あの眼鏡をかけている人は誰ですか。',
          kana: 'あのごめがねをかけているひとはだれですか。',
          vi: 'Người đang đeo kính đằng kia là ai vậy?'
        },
        {
          speaker: 'Bạn B',
          role: 'B',
          kanji: 'あの方は田中さんですよ。',
          kana: 'あのかたはたなかさんですよ。',
          vi: 'Người đó là anh Tanaka đấy.'
        }
      ],
      question: 'Anh Tanaka có đặc điểm nhận dạng nào?',
      options: [
        { id: 'A', text: 'Đang đọc sách' },
        { id: 'B', text: 'Đang đeo kính (眼鏡をかけている)' },
        { id: 'C', text: 'Đang uống cà phê' },
        { id: 'D', text: 'Đang mặc áo khoác đỏ' }
      ],
      correctAnswer: 'B',
      explanation: 'Đặc điểm: 「眼鏡をかけている人」(Người đang đeo kính). Đáp án là B.',
      keyword: '眼鏡をかけている人 (Người đeo kính)',
      tip: 'Mệnh đề bổ nghĩa đứng ngay trước danh từ, động từ chuyển sang thể thông thường.'
    },
    {
      id: 23,
      lesson: 23,
      topic: 'Bài 23: Cấu trúc Khi nào (Toki) & Hướng dẫn đường đi',
      situation: 'Hỏi đường đến bưu điện gần ga xe lửa.',
      audioText: 'すみません、郵便局へ行きたいんですが。この道を真っ直ぐ行くと、右側にありますよ。信号を渡った時、看板が見えます。ありがとうございます。',
      dialogue: [
        {
          speaker: 'Người đi đường',
          role: 'A',
          kanji: 'すみません、郵便局はどこですか。',
          kana: 'すみません、ゆうびんきょくはどこですか。',
          vi: 'Xin lỗi, bưu điện ở đâu vậy ạ?'
        },
        {
          speaker: 'Cảnh sát',
          role: 'B',
          kanji: 'この道を真っ直ぐ行くと、右側にありますよ。',
          kana: 'このみちをまっすぐいくと、みぎがわにありますよ。',
          vi: 'Đi thẳng con đường này, bưu điện nằm ở phía bên tay phải nhé.'
        }
      ],
      question: 'Theo lời chỉ dẫn, bưu điện nằm ở đâu?',
      options: [
        { id: 'A', text: 'Phía bên tay trái sau khi rẽ' },
        { id: 'B', text: 'Đi thẳng con đường, nằm ở phía bên tay phải' },
        { id: 'C', text: 'Ở trong toà nhà nhà ga' },
        { id: 'D', text: 'Đã đóng cửa chuyển đi nơi khác' }
      ],
      correctAnswer: 'B',
      explanation: 'Chỉ đường: 「真っ直ぐ行くと、右側にあります」(Đi thẳng, nằm ở bên phải). Đáp án đúng là B.',
      keyword: '右側にあります (Ở bên phải)',
      tip: 'Mẫu chỉ đường tất yếu: Động từ thể Từ điển + 「と」 (Cứ làm hành động này thì kết quả sẽ xảy ra).'
    },
    {
      id: 24,
      lesson: 24,
      topic: 'Bài 24: Cho tặng hành động (Kuremasu / Agemasu)',
      situation: 'Kể về sự giúp đỡ của đồng nghiệp khi bị quên tài liệu quan trọng.',
      audioText: '昨日、傘を忘れましたが、佐藤さんが傘を貸してくれました。とても親切ですね。私は佐藤さんに美味しいお菓子をあげました。',
      dialogue: [
        {
          speaker: 'Bạn A',
          role: 'A',
          kanji: '昨日、傘を忘れましたが、佐藤さんが傘を貸してくれました。',
          kana: 'きのう、かさをわすれましたが、さとうさんがかさをかしてくれました。',
          vi: 'Hôm qua tôi quên ô, nhưng chị Sato đã cho tôi mượn ô.'
        },
        {
          speaker: 'Bạn B',
          role: 'B',
          kanji: '佐藤さんは本当に優しいですね。',
          kana: 'さとうさんはほんとうにやさしいですね。',
          vi: 'Chị Sato thật là tốt bụng nhỉ.'
        }
      ],
      question: 'Ai là người đã cho mượn ô?',
      options: [
        { id: 'A', text: 'Bạn A cho chị Sato mượn ô' },
        { id: 'B', text: 'Chị Sato cho bạn A mượn ô (貸してくれました)' },
        { id: 'C', text: 'Bảo vệ nhà ga' },
        { id: 'D', text: 'Không ai cho mượn' }
      ],
      correctAnswer: 'B',
      explanation: 'Chị Sato làm ơn cho người nói mượn: 「佐藤さんが貸してくれました」. Đáp án đúng là B.',
      keyword: '貸してくれました (Làm ơn cho tôi mượn)',
      tip: 'Cấu trúc 「〜てくれました」 dùng khi người khác làm một việc tốt cho chính bản thân mình.'
    },
    {
      id: 25,
      lesson: 25,
      topic: 'Bài 25: Cấu trúc điều kiện Nếu (Tara) & Giả định (Temo)',
      situation: 'Thảo luận về kế hoạch đi dã ngoại cuối tuần nếu trời đổ mưa.',
      audioText: '明日、雨が降ったら、どうしますか。雨が降ったら、出かけません。家で本を読みます。天気が良かったら、公園へ行きましょう。',
      dialogue: [
        {
          speaker: 'Bạn A',
          role: 'A',
          kanji: '明日、もし雨が降ったらどうしますか。',
          kana: 'あした、もしあめがふったらどうしますか。',
          vi: 'Ngày mai nếu trời đổ mưa thì bạn làm thế nào?'
        },
        {
          speaker: 'Bạn B',
          role: 'B',
          kanji: '雨が降ったら出かけません。家でゆっくり本を読みます。',
          kana: 'あめがふったらでかけません。いえでゆっくりほんをよみます。',
          vi: 'Nếu trời mưa thì mình không ra ngoài. Mình sẽ ở nhà thong thả đọc sách.'
        }
      ],
      question: 'Nếu ngày mai trời mưa, bạn B sẽ làm gì?',
      options: [
        { id: 'A', text: 'Vẫn đi công viên ngắm cảnh' },
        { id: 'B', text: 'Ở nhà thong thả đọc sách, không đi ra ngoài' },
        { id: 'C', text: 'Đi bơi cùng bạn bè' },
        { id: 'D', text: 'Đi làm việc ở công ty' }
      ],
      correctAnswer: 'B',
      explanation: 'Bạn B chọn: 「出かけません。家で本を読みます」(Không đi ra ngoài, ở nhà đọc sách). Đáp án đúng là B.',
      keyword: '出かけません。家で本を読みます',
      tip: 'Mẫu câu điều kiện giả định phổ biến nhất JLPT N5: Động từ thể Ta + 「ら」 (Nếu... thì...).'
    }
  ];

  // Filter tracks by selected lesson
  const currentTracks = lessonChoice === 'all'
    ? allTracks
    : allTracks.filter((t) => String(t.lesson) === lessonChoice);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [listenCount, setListenCount] = useState(0);

  // Scaffolding Display Toggles (Blind listening default)
  const [showTranscript, setShowTranscript] = useState(false);
  const [showFurigana, setShowFurigana] = useState(true);
  const [showTranslation, setShowTranslation] = useState(false);

  // Quiz States
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);

  const track = currentTracks[currentIndex] || currentTracks[0] || allTracks[0];

  // Reset when lesson or track changes
  useEffect(() => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setShowTranscript(false);
    setShowTranslation(false);
    setListenCount(0);
    setIsPlaying(false);
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  }, [lessonChoice]);

  useEffect(() => {
    setSelectedOption(null);
    setIsAnswered(false);
    setShowTranscript(false);
    setShowTranslation(false);
    setListenCount(0);
    setIsPlaying(false);
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  }, [currentIndex]);

  // Handle Play Whole Audio
  const handlePlayAudio = () => {
    sounds.playFlip();
    setIsPlaying(true);
    setListenCount((prev) => prev + 1);

    speakJapanese(track.audioText, playbackSpeed);

    // Duration estimation for reset
    const durationMs = Math.max(2200, (track.audioText.length * 190) / playbackSpeed);
    setTimeout(() => {
      setIsPlaying(false);
    }, durationMs);
  };

  // Replay individual sentence
  const handlePlaySentence = (text) => {
    sounds.playFlip();
    speakJapanese(text, playbackSpeed);
  };

  // Handle Option Select
  const handleSelectOption = (optId) => {
    if (isAnswered) return;
    setSelectedOption(optId);
    setIsAnswered(true);

    if (optId === track.correctAnswer) {
      sounds.playCorrect();
      setScore((prev) => prev + 1);
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#db2777', '#f43f5e', '#fbbf24', '#34d399']
      });
    } else {
      sounds.playWrong();
    }
  };

  // Next Track
  const handleNextTrack = () => {
    sounds.playFlip();
    if (currentIndex < currentTracks.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // Loop or go to next lesson
      setCurrentIndex(0);
    }
  };

  // Previous Track
  const handlePrevTrack = () => {
    sounds.playFlip();
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  // Keyboard Shortcuts (Space to Play/Replay, 1..4 for options)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      if (e.code === 'Space') {
        e.preventDefault();
        handlePlayAudio();
      } else if (['Digit1', 'Digit2', 'Digit3', 'Digit4'].includes(e.code) && !isAnswered) {
        const keyMap = { Digit1: 'A', Digit2: 'B', Digit3: 'C', Digit4: 'D' };
        handleSelectOption(keyMap[e.code]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [track, isAnswered, playbackSpeed]);

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16 animate-in fade-in duration-300">
      {/* ── 1. CLEAN HEADER BANNER ── */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-pink-100 shadow-sm relative overflow-hidden">
        {/* Subtle Watermark */}
        <div className="absolute right-4 top-2 text-pink-100/50 font-jp font-black text-8xl pointer-events-none select-none">
          聴
        </div>

        <div className="relative z-10 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-50 text-pink-700 font-extrabold text-[11px] uppercase tracking-wider border border-pink-100">
              <Headphones size={13} className="text-pink-600" />
              <span>CHOUKAI (聴解) - TRỌN BỘ 25 BÀI MINNA NO NIHONGO {activeLevel}</span>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold">
              <Award size={14} className="text-amber-500" />
              <span>Đã hoàn thành: <strong>{score}</strong>/{currentTracks.length}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-snug">
                Luyện Nghe Hội Thoại Chuẩn Giọng Tokyo (25 Bài N5)
              </h1>
              <p className="text-xs text-slate-500 max-w-2xl mt-0.5 mb-0">
                Toàn bộ 25 bài nghe Choukai bám sát giáo trình Minna no Nihongo. Hỗ trợ tốc độ linh hoạt, hội thoại từng vai và AI Sensei phân tích bẫy nghe.
              </p>
            </div>

            {/* Complete 25 Lessons Selector */}
            <div className="flex items-center gap-2 shrink-0">
              <select
                value={lessonChoice}
                onChange={(e) => {
                  sounds.playFlip();
                  setLessonChoice(e.target.value);
                }}
                className="px-3.5 py-2 rounded-xl border border-pink-200 bg-white text-xs font-bold text-slate-800 cursor-pointer shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
              >
                <option value="all">Tất cả bài học (Trọn bộ 25 bài)</option>
                {Array.from({ length: 25 }, (_, i) => i + 1).map((n) => (
                  <option key={n} value={String(n)}>
                    Bài {n < 10 ? `0${n}` : n} - Minna no Nihongo
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Quick Track Switcher Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pt-2 border-t border-pink-50 text-xs">
            <span className="text-slate-400 font-bold shrink-0 text-[11px]">BÀI NGHE:</span>
            {currentTracks.map((t, idx) => (
              <button
                key={t.id}
                type="button"
                onClick={() => {
                  sounds.playFlip();
                  setCurrentIndex(idx);
                }}
                className={`px-3 py-1 rounded-xl font-bold transition-all shrink-0 cursor-pointer ${
                  currentIndex === idx
                    ? 'bg-pink-600 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-pink-50 text-slate-600'
                }`}
              >
                Bài {t.lesson < 10 ? `0${t.lesson}` : t.lesson}: {t.topic.split(':')[1] || t.topic}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── 2. SLEEK MODERN AUDIO PLAYER SUITE ── */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-pink-100 shadow-sm space-y-6">
        {/* Situation Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-pink-50">
          <div>
            <span className="text-[10.5px] font-black text-pink-600 uppercase tracking-wider block mb-0.5">
              TÌNH HUỐNG HỘI THOẠI - {track.topic}
            </span>
            <h3 className="text-sm sm:text-base font-bold text-slate-800">
              {track.situation}
            </h3>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
            <Volume2 size={14} className="text-pink-600" />
            <span>Đã nghe: <strong className="text-slate-800">{listenCount}</strong> lần</span>
          </div>
        </div>

        {/* ── CLEAN WHITE AUDIO PLAYER CARD ── */}
        <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-pink-50/50 via-white to-rose-50/40 border border-pink-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 w-full sm:w-auto">
            {/* Play Button */}
            <button
              type="button"
              onClick={handlePlayAudio}
              className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all cursor-pointer shadow-lotus shrink-0 ${
                isPlaying
                  ? 'bg-rose-500 text-white scale-105 ring-4 ring-rose-200 animate-pulse'
                  : 'bg-gradient-to-tr from-pink-600 to-rose-500 hover:from-pink-500 hover:to-rose-600 text-white hover:scale-105 active:scale-95'
              }`}
              title="Phát hoặc nghe lại (Phím Space)"
            >
              {listenCount === 0 ? (
                <Play size={22} fill="white" className="ml-0.5" />
              ) : (
                <RotateCcw size={20} className={isPlaying ? 'animate-spin' : ''} />
              )}
            </button>

            {/* Audio Track Info & Simple Scrubber */}
            <div className="space-y-1.5 flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-slate-900 truncate">
                  {track.topic}
                </span>
                {isPlaying && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-pink-600 bg-pink-100 px-2 py-0.2 rounded-full animate-pulse">
                    Đang phát...
                  </span>
                )}
              </div>

              {/* Minimal Wave Line Progress */}
              <div className="flex items-center gap-1 h-3 w-40 sm:w-56">
                {[30, 60, 90, 45, 80, 50, 75, 40, 95, 65, 45, 85, 30].map((h, i) => (
                  <div
                    key={i}
                    className={`flex-1 rounded-full transition-all duration-300 ${
                      isPlaying
                        ? 'bg-pink-600'
                        : 'bg-slate-200'
                    }`}
                    style={{ height: isPlaying ? `${Math.max(25, h)}%` : '20%' }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Speed Pills & Subtitle Toggle */}
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
            {/* Speed Selector */}
            <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 shadow-2xs">
              <Gauge size={12} className="text-slate-400 ml-1.5" />
              {[0.75, 1.0, 1.25].map((speed) => (
                <button
                  key={speed}
                  type="button"
                  onClick={() => {
                    sounds.playFlip();
                    setPlaybackSpeed(speed);
                  }}
                  className={`px-2 py-0.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    playbackSpeed === speed
                      ? 'bg-pink-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  {speed}x
                </button>
              ))}
            </div>

            {/* Subtitle Toggle */}
            <button
              type="button"
              onClick={() => {
                sounds.playFlip();
                setShowTranscript(!showTranscript);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border shadow-2xs ${
                showTranscript
                  ? 'bg-pink-50 border-pink-200 text-pink-700'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              {showTranscript ? <EyeOff size={13} /> : <Eye size={13} />}
              <span>{showTranscript ? 'Ẩn lời thoại' : 'Hiện lời thoại'}</span>
            </button>
          </div>
        </div>

        {/* ── REALISTIC BILINGUAL CONVERSATION BUBBLES ── */}
        {showTranscript && (
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-50/70 border border-slate-200/80 space-y-3.5 animate-in fade-in duration-200">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
              <span className="text-[11px] font-black text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                <MessageSquare size={13} className="text-pink-600" />
                <span>NỘI DUNG HỘI THOẠI (TRANSCRIPT)</span>
              </span>

              <button
                type="button"
                onClick={() => setShowTranslation(!showTranslation)}
                className="text-xs font-bold text-pink-600 hover:underline cursor-pointer"
              >
                {showTranslation ? 'Ẩn dịch nghĩa' : 'Hiện dịch nghĩa'}
              </button>
            </div>

            {/* Conversation Turns */}
            <div className="space-y-2.5">
              {track.dialogue.map((turn, tIdx) => {
                const isSpeakerB = turn.role === 'B';
                return (
                  <div
                    key={tIdx}
                    className={`flex items-start gap-3 p-3 rounded-xl border transition-all ${
                      isSpeakerB
                        ? 'bg-pink-50/40 border-pink-200/70 ml-2 sm:ml-6'
                        : 'bg-white border-slate-200/80 mr-2 sm:mr-6'
                    }`}
                  >
                    {/* Role Avatar */}
                    <span
                      className={`w-7 h-7 rounded-lg font-black text-xs flex items-center justify-center shrink-0 mt-0.5 ${
                        isSpeakerB
                          ? 'bg-pink-600 text-white'
                          : 'bg-slate-800 text-white'
                      }`}
                    >
                      {turn.role}
                    </span>

                    <div className="flex-1 space-y-0.5 min-w-0">
                      <div className="text-[10px] font-bold text-slate-400">
                        {turn.speaker}
                      </div>
                      <div className="font-jp font-bold text-sm sm:text-base text-slate-900">
                        {turn.kanji}
                      </div>
                      {showFurigana && (
                        <div className="font-jp text-xs text-pink-600 font-medium">
                          {turn.kana}
                        </div>
                      )}
                      {showTranslation && (
                        <div className="text-xs text-slate-600 pt-1 border-t border-slate-100 mt-1">
                          {turn.vi}
                        </div>
                      )}
                    </div>

                    {/* Sentence Replay Button */}
                    <button
                      type="button"
                      onClick={() => handlePlaySentence(turn.kanji)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-pink-600 hover:bg-white transition-colors shrink-0 cursor-pointer"
                      title="Nghe riêng câu này"
                    >
                      <Volume2 size={15} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── 3. JLPT QUESTION & TACTILE 4 OPTIONS ── */}
        <div className="space-y-3.5 pt-1">
          <div className="flex items-start gap-2.5">
            <span className="w-6 h-6 rounded-lg bg-pink-600 text-white font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
              Q
            </span>
            <h4 className="text-sm sm:text-base font-black text-slate-900 leading-snug">
              {track.question}
            </h4>
          </div>

          {/* 4 Options Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {track.options.map((opt) => {
              const isSelected = selectedOption === opt.id;
              const isCorrect = isAnswered && opt.id === track.correctAnswer;
              const isWrongSelected = isAnswered && isSelected && opt.id !== track.correctAnswer;

              let btnStyle = 'bg-white border-slate-200 text-slate-700 hover:border-pink-300 hover:bg-pink-50/30';
              if (isCorrect) {
                btnStyle = 'bg-emerald-50 border-emerald-500 text-emerald-900 font-bold shadow-xs ring-2 ring-emerald-300';
              } else if (isWrongSelected) {
                btnStyle = 'bg-rose-50 border-rose-400 text-rose-900 font-bold shadow-xs ring-2 ring-rose-200';
              } else if (isSelected) {
                btnStyle = 'bg-pink-50 border-pink-500 text-pink-900 font-bold';
              }

              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => handleSelectOption(opt.id)}
                  disabled={isAnswered}
                  className={`p-3.5 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${btnStyle} ${
                    isAnswered ? 'cursor-default' : 'hover:scale-[1.01] active:scale-[0.99]'
                  }`}
                  style={{ minHeight: '48px' }}
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`w-6 h-6 rounded-lg font-black text-xs flex items-center justify-center shrink-0 ${
                        isCorrect
                          ? 'bg-emerald-600 text-white'
                          : isWrongSelected
                          ? 'bg-rose-500 text-white'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {opt.id}
                    </span>
                    <span className="font-semibold text-xs sm:text-sm">{opt.text}</span>
                  </div>

                  {isCorrect && <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />}
                  {isWrongSelected && <XCircle size={16} className="text-rose-600 shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── 4. ELEGANT FEEDBACK & REAL AI SENSEI CALLOUT ── */}
        {isAnswered && (
          <div className="p-5 rounded-2xl bg-slate-50/70 border border-slate-200 space-y-3.5 animate-in fade-in duration-200">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-2.5 border-b border-slate-200/70">
              <div className="flex items-center gap-1.5">
                {selectedOption === track.correctAnswer ? (
                  <div className="flex items-center gap-1.5 text-emerald-700 font-bold text-xs sm:text-sm">
                    <CheckCircle2 size={16} className="text-emerald-600" />
                    <span>CHÍNH XÁC! TAI NGHE RẤT TINH</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-rose-700 font-bold text-xs sm:text-sm">
                    <XCircle size={16} className="text-rose-600" />
                    <span>CHƯA ĐÚNG! HÃY NGHE LẠI TỪ KHÓA BẪY</span>
                  </div>
                )}
              </div>

              {/* AI Sensei Analysis Button */}
              <button
                type="button"
                onClick={() =>
                  askAi(
                    'explain_listening',
                    {
                      question: track.question,
                      correctAnswer: track.correctAnswer,
                      audioText: track.audioText,
                      title: track.topic
                    },
                    `AI Phân Tích Choukai: ${track.topic}`
                  )
                }
                className="px-3 py-1 rounded-xl bg-pink-600 hover:bg-pink-700 text-white font-bold text-xs shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Sparkles size={13} />
                <span>AI Sensei phân tích bẫy nghe</span>
              </button>
            </div>

            {/* Explanation & Tip Box */}
            <div className="space-y-2 text-xs text-slate-700 leading-relaxed">
              <p className="mb-0 font-medium">
                {track.explanation}
              </p>
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-2">
                <HelpCircle size={15} className="text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-[11px] uppercase tracking-wide text-amber-800 mb-0.5">
                    MẸO BẮT TỪ KHÓA JLPT CHOUKAI:
                  </strong>
                  <span>{track.tip}</span>
                </div>
              </div>
            </div>

            {/* Next Track Navigation */}
            <div className="pt-1 flex justify-end">
              <button
                type="button"
                onClick={handleNextTrack}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs flex items-center gap-1.5 transition-all hover:scale-102 cursor-pointer"
              >
                <span>Bài nghe tiếp theo</span>
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
        )}

        {/* Bottom Pagination */}
        <div className="flex items-center justify-between pt-2 border-t border-pink-50 text-xs">
          <button
            type="button"
            onClick={handlePrevTrack}
            disabled={currentIndex === 0}
            className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold flex items-center gap-1 transition-colors disabled:opacity-40 cursor-pointer"
          >
            <ChevronLeft size={14} />
            <span>Bài trước</span>
          </button>

          <span className="font-extrabold text-slate-400">
            Bài {currentIndex + 1} / {currentTracks.length}
          </span>

          <button
            type="button"
            onClick={handleNextTrack}
            className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold flex items-center gap-1 transition-colors cursor-pointer"
          >
            <span>Bài sau</span>
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
