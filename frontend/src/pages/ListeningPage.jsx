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
  MessageSquare
} from 'lucide-react';

export default function ListeningPage() {
  const { currentLevel, askAi } = useApp();

  const activeLevel = currentLevel || 'N5';

  // Curated practical JLPT Choukai listening questions
  const allTracks = [
    {
      id: 1,
      level: 'N5',
      topic: 'Ga Tàu & Phương Tiện',
      situation: 'Một hành khách đang hỏi nhân viên nhà ga Tokyo về đường ray chuyến tàu sắp khởi hành.',
      audioText: 'すみません、新宿行きの電車は何番線ですか。新宿行きは3番線ですよ。あ、ありがとうございます。',
      dialogue: [
        {
          speaker: 'Hành khách',
          role: 'A',
          kanji: 'すみません、新宿行きの電車は何番線ですか。',
          kana: 'すみません、しんじゅくゆきのでんしゃはなんばんせんですか。',
          vi: 'Xin lỗi, tàu đi Shinjuku là đường ray số mấy ạ?'
        },
        {
          speaker: 'Nhân viên ga',
          role: 'B',
          kanji: '新宿行きは3番線ですよ。',
          kana: 'しんじゅくゆきはさんばんせんですよ。',
          vi: 'Tàu đi Shinjuku là đường ray số 3 nhé.'
        },
        {
          speaker: 'Hành khách',
          role: 'A',
          kanji: 'あ、ありがとうございます。',
          kana: 'あ、ありがとうございます。',
          vi: 'A, tôi xin cảm ơn.'
        }
      ],
      question: 'Hành khách cần đến đường ray số mấy để đi Shinjuku?',
      options: [
        { id: 'A', text: '1番線 (Ray số 1)' },
        { id: 'B', text: '2番線 (Ray số 2)' },
        { id: 'C', text: '3番線 (Ray số 3)' },
        { id: 'D', text: '4番線 (Ray số 4)' }
      ],
      correctAnswer: 'C',
      explanation: 'Nhân viên trả lời rõ ràng: 「3番線ですよ」(Là đường ray số 3). Đáp án đúng là C.',
      keyword: '3番線 (さんばんせん)',
      tip: 'Trong câu hỏi về số ray hoặc giờ tàu, hãy chú ý ngay danh từ đi kèm trợ từ は.'
    },
    {
      id: 2,
      level: 'N5',
      topic: 'Quán Ăn & Gọi Món',
      situation: 'Tại một quán mì Ramen ở Shibuya, hai người bạn đang trao đổi xem nên gọi món gì.',
      audioText: '田中さん、何を食べますか。私はラーメンにします。じゃ、私もラーメンをお願いします。',
      dialogue: [
        {
          speaker: 'Bạn A',
          role: 'A',
          kanji: '田中さん、何を食べますか。',
          kana: 'たなかさん、なにをたべますか。',
          vi: 'Anh Tanaka, anh sẽ ăn món gì?'
        },
        {
          speaker: 'Tanaka',
          role: 'B',
          kanji: '私はラーメンにします。',
          kana: 'わたしはらーめんにします。',
          vi: 'Tôi sẽ chọn món mì Ramen.'
        },
        {
          speaker: 'Bạn A',
          role: 'A',
          kanji: 'じゃ、私もラーメンをお願いします。',
          kana: 'じゃ、わたしもらーめんをおねがいします。',
          vi: 'Vậy thì tôi cũng xin gọi món mì Ramen.'
        }
      ],
      question: 'Cuối cùng hai người đã quyết định gọi món gì?',
      options: [
        { id: 'A', text: 'Cả hai đều ăn Ramen' },
        { id: 'B', text: 'Một người ăn Cơm cà ri, một người ăn Ramen' },
        { id: 'C', text: 'Chỉ có anh Tanaka ăn Ramen' },
        { id: 'D', text: 'Cả hai đều ăn Sushi' }
      ],
      correctAnswer: 'A',
      explanation: 'Anh Tanaka chọn Ramen, sau đó bạn A nói 「私もラーメンをお願いします」(Tôi cũng xin gọi Ramen). Do đó cả hai đều ăn Ramen.',
      keyword: '〜にします (Quyết định chọn món)',
      tip: 'Từ nối 「じゃ」(Vậy thì) và trợ từ 「も」(Cũng) là tín hiệu xác nhận quyết định cuối cùng.'
    },
    {
      id: 3,
      level: 'N5',
      topic: 'Thời Gian & Cuộc Hẹn',
      situation: 'Mai và bạn cùng lớp đang hẹn nhau ngày mai cùng đi thư viện học nhóm.',
      audioText: '明日、何時に会いましょうか。10時はどうですか。10時はちょっと...。11時にしましょう。分かりました。',
      dialogue: [
        {
          speaker: 'Mai',
          role: 'A',
          kanji: '明日、何時に会いましょうか。',
          kana: 'あした、なんじにあいましょうか。',
          vi: 'Ngày mai chúng ta gặp nhau lúc mấy giờ nhỉ?'
        },
        {
          speaker: 'Bạn',
          role: 'B',
          kanji: '10時はどうですか。',
          kana: 'じゅうじはどうですか。',
          vi: '10 giờ thì thế nào?'
        },
        {
          speaker: 'Mai',
          role: 'A',
          kanji: '10時はちょっと...。11時にしましょう。',
          kana: 'じゅうじはちょっと...。じゅういちじにしましょう。',
          vi: '10 giờ thì hơi kẹt... Hãy dời sang 11 giờ nhé.'
        },
        {
          speaker: 'Bạn',
          role: 'B',
          kanji: '分かりました。',
          kana: 'わかりました。',
          vi: 'Mình đồng ý.'
        }
      ],
      question: 'Hai bạn đã thống nhất hẹn gặp nhau lúc mấy giờ?',
      options: [
        { id: 'A', text: '9 giờ 30 phút' },
        { id: 'B', text: '10 giờ đúng' },
        { id: 'C', text: '11 giờ đúng' },
        { id: 'D', text: '11 giờ 30 phút' }
      ],
      correctAnswer: 'C',
      explanation: 'Ban đầu bạn gợi ý 10 giờ nhưng Mai từ chối khéo bằng 「ちょっと...」 và chốt lại 「11時にしましょう」(Hãy gặp lúc 11 giờ).',
      keyword: '11時にしましょう (Chốt hẹn 11 giờ)',
      tip: 'Bẫy kinh điển JLPT: Mốc thời gian xuất hiện đầu tiên (10 giờ) thường bị bác bỏ bởi từ 「ちょっと」.'
    },
    {
      id: 4,
      level: 'N5',
      topic: 'Mua Sắm & Thanh Toán',
      situation: 'Khách hàng đang thanh toán tiền mua ô che mưa tại cửa hàng tiện lợi Konbini.',
      audioText: 'いらっしゃいませ。この傘はおいくらですか。500円です。では、千円札でお願いします。はい、500円のおつりです。',
      dialogue: [
        {
          speaker: 'Thu ngân',
          role: 'A',
          kanji: 'いらっしゃいませ。',
          kana: 'いらっしゃいませ。',
          vi: 'Xin kính chào quý khách.'
        },
        {
          speaker: 'Khách',
          role: 'B',
          kanji: 'この傘はおいくらですか。',
          kana: 'このかさはおいくらですか。',
          vi: 'Chiếc ô này giá bao nhiêu tiền vậy?'
        },
        {
          speaker: 'Thu ngân',
          role: 'A',
          kanji: '500円です。',
          kana: 'ごひゃくえんです。',
          vi: 'Dạ giá 500 yên.'
        },
        {
          speaker: 'Khách',
          role: 'B',
          kanji: 'では、千円札でお願いします。',
          kana: 'では、せんえんさつでおねがいします。',
          vi: 'Vậy tôi đưa tờ 1.000 yên nhé.'
        },
        {
          speaker: 'Thu ngân',
          role: 'A',
          kanji: 'はい、500円のおつりです。',
          kana: 'はい、ごひゃくえんのおつりです。',
          vi: 'Vâng, xin gửi lại quý khách 500 yên tiền thối.'
        }
      ],
      question: 'Tiền thối lại cho vị khách là bao nhiêu?',
      options: [
        { id: 'A', text: '100 yên' },
        { id: 'B', text: '500 yên' },
        { id: 'C', text: '1.000 yên' },
        { id: 'D', text: 'Không có tiền thối' }
      ],
      correctAnswer: 'B',
      explanation: 'Thu ngân nói rõ: 「500円のおつりです」(Tiền thối là 500 yên). Do đó đáp án là B.',
      keyword: 'おつり (Tiền thối / tiền thừa)',
      tip: 'Từ vựng then chốt 「おつり」 thường xuyên xuất hiện trong đề thi Choukai bài mua sắm.'
    },
    {
      id: 5,
      level: 'N4',
      topic: 'Công Việc & Báo Bận',
      situation: 'Nhân viên công ty gọi điện thoại cho cấp trên để xin phép đến muộn do kẹt xe.',
      audioText: '課長、すみません。電車が遅れていて、30分ほど遅刻しそうです。大丈夫ですか。気をつけて来てください。',
      dialogue: [
        {
          speaker: 'Nhân viên',
          role: 'A',
          kanji: '課長、すみません。電車が遅れていて、30分ほど遅刻しそうです。',
          kana: 'かちょう、すみません。でんしゃがおくれていて、さんじっぷんほどちこくしそうです。',
          vi: 'Trưởng phòng, tôi xin lỗi. Tàu điện đang bị trễ nên chắc tôi sẽ đến muộn khoảng 30 phút.'
        },
        {
          speaker: 'Trưởng phòng',
          role: 'B',
          kanji: '大丈夫ですか。気をつけて来てください。',
          kana: 'だいじょうぶですか。きをつけてきてください。',
          vi: 'Không sao chứ? Hãy đi lại cẩn thận nhé.'
        }
      ],
      question: 'Tại sao người nhân viên lại đến công ty muộn?',
      options: [
        { id: 'A', text: 'Vì bị ốm phải đi bệnh viện' },
        { id: 'B', text: 'Vì tàu điện bị trễ chuyến' },
        { id: 'C', text: 'Vì ngủ quên ở nhà' },
        { id: 'D', text: 'Vì gặp khách hàng đột xuất' }
      ],
      correctAnswer: 'B',
      explanation: 'Nhân viên trình bày nguyên nhân: 「電車が遅れていて」(Vì tàu điện bị trễ). Đáp án chính xác là B.',
      keyword: '電車が遅れていて (Tàu điện trễ)',
      tip: 'Dạng bài hỏi nguyên nhân thường dùng cấu trúc thể Te 「〜て」 để diễn giải lý do.'
    },
    {
      id: 6,
      level: 'N4',
      topic: 'Thời Tiết & Dã Ngoại',
      situation: 'Hai bạn trẻ đang xem dự báo thời tiết cho chuyến dã ngoại cuối tuần tại công viên Ueno.',
      audioText: '明日の天気予報を見ましたか。午後は雨が降るそうですよ。えっ、じゃあピクニックは日曜日に延期しましょう。そうですね。',
      dialogue: [
        {
          speaker: 'Bạn Nam',
          role: 'A',
          kanji: '明日の天気予報を見ましたか。午後は雨が降るそうですよ。',
          kana: 'あしたのてんきよほうをみましたか。ごごはあめがふるそうですよ。',
          vi: 'Cậu đã xem dự báo thời tiết ngày mai chưa? Nghe bảo buổi chiều trời sẽ mưa đấy.'
        },
        {
          speaker: 'Bạn Nữ',
          role: 'B',
          kanji: 'えっ、じゃあピクニックは日曜日に延期しましょう。',
          kana: 'えっ、じゃあぴくにっくはにちようびにえんきしましょう。',
          vi: 'Hả, vậy thì buổi dã ngoại hãy dời sang Chủ nhật nhé.'
        },
        {
          speaker: 'Bạn Nam',
          role: 'A',
          kanji: 'そうですね。',
          kana: 'そうですね。',
          vi: 'Đồng ý.'
        }
      ],
      question: 'Buổi dã ngoại picnic sẽ được tổ chức vào khi nào?',
      options: [
        { id: 'A', text: 'Sáng Thứ Bảy' },
        { id: 'B', text: 'Chiều Thứ Bảy' },
        { id: 'C', text: 'Chủ Nhật' },
        { id: 'D', text: 'Hủy bỏ hoàn toàn' }
      ],
      correctAnswer: 'C',
      explanation: 'Vì chiều Thứ Bảy có mưa nên hai bạn quyết định: 「日曜日に延期しましょう」(Dời sang Chủ nhật). Đáp án là C.',
      keyword: '延期しましょう (Hãy dời lịch)',
      tip: 'Động từ 「延期する」(hoãn/dời) mang ý nghĩa đổi lịch chứ không phải hủy bỏ 「中止」.'
    }
  ];

  // Filter tracks by active level, fallback to allTracks if empty
  const filteredTracks = allTracks.filter((t) => t.level === activeLevel);
  const currentTracks = filteredTracks.length > 0 ? filteredTracks : allTracks;

  // Player & Interactive States
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

  const track = currentTracks[currentIndex] || currentTracks[0];

  // Reset when track or level changes
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
  }, [currentIndex, activeLevel]);

  // Handle Play Whole Audio
  const handlePlayAudio = () => {
    sounds.playFlip();
    setIsPlaying(true);
    setListenCount((prev) => prev + 1);

    speakJapanese(track.audioText, playbackSpeed);

    // Duration estimation for clean reset
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
      sounds.playFlip();
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

        <div className="relative z-10">
          <div className="mb-2.5 flex flex-wrap items-center justify-between gap-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-50 text-pink-700 font-extrabold text-[11px] uppercase tracking-wider border border-pink-100">
              <Headphones size={13} className="text-pink-600" />
              <span>CHOUKAI (聴解) • LUYỆN NGHE PHẢN XẠ JLPT {activeLevel}</span>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold">
              <Award size={14} className="text-amber-500" />
              <span>Kết quả: <strong>{score}</strong>/{currentTracks.length}</span>
            </div>
          </div>

          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-snug mb-1.5">
            Luyện Nghe Hội Thoại Chuẩn Giọng Tokyo
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-2xl mb-4">
            Rèn luyện đôi tai với các tình huống giao tiếp thực tế. Hỗ trợ tùy chỉnh tốc độ, chế độ luyện nghe phản xạ và phân tích từ khóa then chốt.
          </p>

          {/* Quick Track Switcher Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
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
                Bài 0{idx + 1}: {t.topic}
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
              TÌNH HUỐNG HỘI THOẠI • {track.topic}
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
                  Hội thoại: {track.topic}
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
                      lesson_title: `Bài nghe: ${track.topic}`
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
