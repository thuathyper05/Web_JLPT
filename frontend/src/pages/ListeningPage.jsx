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

  // Curated authentic Minna no Nihongo JLPT Choukai listening curriculum
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
      audioText: 'いらっしゃいませ。すみません、事務室はどこですか。事務室はあちらですよ。エレベーターは何階ですか。エレベーターは2階の隣にあります。どうもありがとうございます。',
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
          kanji: '事務室はあちらですよ。',
          kana: 'じむしつはあちらですよ。',
          vi: 'Văn phòng ở đằng kia nhé ạ.'
        },
        {
          speaker: 'Khách',
          role: 'B',
          kanji: 'エレベーターはどこにありますか。',
          kana: 'えれべーたーはどこにありますか。',
          vi: 'Thế thang máy ở đâu ạ?'
        },
        {
          speaker: 'Lễ tân',
          role: 'A',
          kanji: 'エレベーターは階段の隣ですよ。',
          kana: 'えれべーたーはかいだんのとなりですよ。',
          vi: 'Thang máy ở ngay bên cạnh cầu thang bộ nhé.'
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
      explanation: 'Lễ tân hướng dẫn: 「階段の隣ですよ」(Ngay cạnh cầu thang bộ). Đáp án là B.',
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
          kanji: '午前9時から午後3時までです。',
          kana: 'ごぜんくじからごごさんじまでです。',
          vi: 'Dạ mở cửa từ 9 giờ sáng đến 3 giờ chiều ạ.'
        },
        {
          speaker: 'Khách hàng',
          role: 'A',
          kanji: '土曜日は休みですか。',
          kana: 'どようびはやすみですか。',
          vi: 'Thế thứ 7 có nghỉ không?'
        },
        {
          speaker: 'Nhân viên ngân hàng',
          role: 'B',
          kanji: 'はい、土曜日と日曜日は休みです。',
          kana: 'はい、どようびとにちようびはやすみです。',
          vi: 'Vâng, thứ 7 và chủ nhật bên em nghỉ ạ.'
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
      explanation: 'Nhân viên trả lời: 「はい、土曜日と日曜日は休みです」(Vâng, thứ 7 và chủ nhật nghỉ). Đáp án là B.',
      keyword: '土曜日と日曜日 (Thứ 7 và Chủ nhật)',
      tip: 'Mẫu câu thời gian 「〜から〜まで」 và danh sách ngày nghỉ với trợ từ 「と」.'
    },
    {
      id: 5,
      lesson: 5,
      topic: 'Bài 05: Phương tiện & Đi lại',
      situation: 'Hai người bạn đang trao đổi về kế hoạch đi du lịch Kyoto vào kỳ nghỉ cuối tuần.',
      audioText: '週末、どこへ行きますか。京都へ行きます。一人で行きますか。いいえ、友達と行きます。新幹線で行きますか。はい、新幹線で行きます。とても速いですよ。',
      dialogue: [
        {
          speaker: 'Bạn A',
          role: 'A',
          kanji: '週末、どこへ行きますか。',
          kana: 'しゅうまつ、どこへいきますか。',
          vi: 'Cuối tuần này bạn đi đâu thế?'
        },
        {
          speaker: 'Bạn B',
          role: 'B',
          kanji: '京都へ行きます。',
          kana: 'きょうとへいきます。',
          vi: 'Mình đi Kyoto.'
        },
        {
          speaker: 'Bạn A',
          role: 'A',
          kanji: '一人で行きますか。',
          kana: 'ひとりでおこないますか。',
          vi: 'Bạn đi một mình à?'
        },
        {
          speaker: 'Bạn B',
          role: 'B',
          kanji: 'いいえ、友達と行きます。新幹線で行きます。',
          kana: 'いいえ、ともだちといきます。しんかんせんでいきます。',
          vi: 'Không, mình đi cùng bạn bè. Bọn mình đi bằng tàu siêu tốc Shinkansen.'
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
      explanation: 'Bạn B xác nhận: 「友達と行きます。新幹線で行きます」(Đi cùng bạn, đi bằng tàu Shinkansen). Đáp án đúng là B.',
      keyword: '友達と (Cùng bạn) & 新幹線で (Bằng Shinkansen)',
      tip: 'Trợ từ 「と」 chỉ đối tượng cùng hành động, trợ từ 「で」 chỉ phương tiện di chuyển.'
    },
    {
      id: 6,
      lesson: 6,
      topic: 'Bài 06: Mua sắm, Ẩm thực & Địa điểm ăn uống',
      situation: 'Vào giờ nghỉ trưa, hai đồng nghiệp công ty rủ nhau đi ăn trưa và hỏi địa điểm ăn uống.',
      audioText: '田中さん、昼ごはんを一緒に食べませんか。ええ、食べましょう。どこで食べますか。駅前のレストランで食べましょう。魚とお肉、どちらがいいですか。魚料理にします。',
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
          kanji: 'ええ、食べましょう。どこで食べますか。',
          kana: 'ええ、たべましょう。どこでたべますか。',
          vi: 'Vâng, đi ăn thôi. Chúng ta ăn ở đâu nhỉ?'
        },
        {
          speaker: 'Đồng nghiệp A',
          role: 'A',
          kanji: '駅前のレストランで食べましょう。魚料理にします。',
          kana: 'えきまえのれすとらんでたべましょう。さかなりょうりにします。',
          vi: 'Hãy ăn ở nhà hàng trước ga nhé. Tôi sẽ chọn món cá.'
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
      audioText: '木村さん、お誕生日おめでとうございます。このプレゼントをどうぞ。わあ、素敵なスプーンですね。ありがとうございます。何で食べますか。そのスプーンでアイスクリームを食べます。',
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
          kanji: 'わあ、素敵なスプーンですね。ありがとうございます。',
          kana: 'わあ、すてきなすぷーんですね。ありがとうございます。',
          vi: 'Oa, một chiếc thìa thật đẹp. Tôi xin cảm ơn.'
        },
        {
          speaker: 'Kimura',
          role: 'B',
          kanji: 'このスプーンでアイスクリームを食べます。',
          kana: 'このすぷーんであいすくりーむをたべます。',
          vi: 'Tôi sẽ dùng chiếc thìa này để ăn kem.'
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
      audioText: '先週、富士山へ行きました。富士山はどうでしたか。とても高くて、綺麗でした。日本の生活は楽しいですか。はい、忙しいですが、とても面白いです。',
      dialogue: [
        {
          speaker: 'Bạn A',
          role: 'A',
          kanji: '先週、富士山へ行きました。',
          kana: 'せんしゅう、ふじさんへいきました。',
          vi: 'Tuần trước mình đã đi núi Phú Sĩ.'
        },
        {
          speaker: 'Bạn B',
          role: 'B',
          kanji: '富士山はどうでしたか。',
          kana: 'ふじさんはどうでしたか。',
          vi: 'Núi Phú Sĩ thế nào?'
        },
        {
          speaker: 'Bạn A',
          role: 'A',
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
              <span>CHOUKAI (聴解) - LUYỆN NGHE PHẢN XẠ MINNA NO NIHONGO</span>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold">
              <Award size={14} className="text-amber-500" />
              <span>Kết quả: <strong>{score}</strong>/{currentTracks.length}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-snug">
                Luyện Nghe Hội Thoại Chuẩn Giọng Tokyo
              </h1>
              <p className="text-xs text-slate-500 max-w-2xl mt-0.5 mb-0">
                Luyện nghe chuẩn xác bám sát từng bài Minna no Nihongo. Hỗ trợ tùy chỉnh tốc độ, hội thoại từng vai và AI phân tích bẫy nghe.
              </p>
            </div>

            {/* Lesson Selector */}
            <div className="flex items-center gap-2 shrink-0">
              <select
                value={lessonChoice}
                onChange={(e) => {
                  sounds.playFlip();
                  setLessonChoice(e.target.value);
                }}
                className="px-3.5 py-2 rounded-xl border border-pink-200 bg-white text-xs font-bold text-slate-800 cursor-pointer shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
              >
                <option value="all">Tất cả bài học (Bài 1 - 8)</option>
                {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                  <option key={n} value={String(n)}>
                    Bài 0{n} - Minna
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
                Bài {t.lesson}: {t.topic.split(':')[1] || t.topic}
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

        {/* ── 4. ELEGANT FEEDBACK & AI SENSEI CALLOUT ── */}
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
                    'explain_vocab',
                    {
                      word: track.audioText,
                      lesson_title: track.topic
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
