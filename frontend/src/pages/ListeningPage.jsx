import React, { useState, useEffect, useRef } from 'react';
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
  Flame,
  Award
} from 'lucide-react';

export default function ListeningPage() {
  const { currentLevel, askAi } = useApp();

  const activeLevel = currentLevel || 'N5';

  // Listening tracks bank tailored for JLPT Choukai levels
  const allTracks = [
    {
      id: 1,
      level: 'N5',
      topic: 'Ga Tàu & Phương Tiện',
      situation: 'Một hành khách đang hỏi nhân viên nhà ga Tokyo về chuyến tàu sắp khởi hành.',
      audioText: 'すみません、新宿行きの電車は何番線ですか。新宿行きは3番線ですよ。あ、ありがとうございます。',
      dialogue: [
        {
          speaker: 'Khách',
          kanji: 'すみません、新宿行きの電車は何番線ですか。',
          kana: 'すみません、しんじゅくゆきのでんしゃはなんばんせんですか。',
          vi: 'Xin lỗi, tàu đi Shinjuku là đường ray số mấy ạ?'
        },
        {
          speaker: 'Nhân viên',
          kanji: '新宿行きは3番線ですよ。',
          kana: 'しんじゅくゆきはさんばんせんですよ。',
          vi: 'Tàu đi Shinjuku là đường ray số 3 nhé.'
        },
        {
          speaker: 'Khách',
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
      choukaiTip: 'Trong bài nghe về số ray hay giờ giấc, hãy chú ý ngay danh từ đi kèm trợ từ は.'
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
          kanji: '田中さん、何を食べますか。',
          kana: 'たなかさん、なにをたべますか。',
          vi: 'Anh Tanaka, anh sẽ ăn món gì?'
        },
        {
          speaker: 'Tanaka',
          kanji: '私はラーメンにします。',
          kana: 'わたしはらーめんにします。',
          vi: 'Tôi sẽ chọn món mì Ramen.'
        },
        {
          speaker: 'Bạn A',
          kanji: 'じゃ、私もラーメンをお願いします。',
          kana: 'じゃ、わたしもらーめんをおねがいします。',
          vi: 'Vậy thì tôi cũng xin gọi món mì Ramen.'
        }
      ],
      question: 'Cuối cùng hai người đã quyết định ăn món gì?',
      options: [
        { id: 'A', text: 'Cả hai đều ăn Ramen' },
        { id: 'B', text: 'Một người ăn Cơm cà ri, một người ăn Ramen' },
        { id: 'C', text: 'Chỉ có anh Tanaka ăn Ramen' },
        { id: 'D', text: 'Cả hai đều ăn Sushi' }
      ],
      correctAnswer: 'A',
      explanation: 'Anh Tanaka chọn Ramen, sau đó bạn A nói 「私もラーメンをお願いします」(Tôi cũng xin gọi Ramen). Do đó cả hai đều ăn Ramen.',
      keyword: '〜にします (Quyết định chọn món)',
      choukaiTip: 'Từ nối 「じゃ」(Vậy thì) và trợ từ 「も」(Cũng) là tín hiệu xác nhận quyết định cuối cùng.'
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
          kanji: '明日、何時に会いましょうか。',
          kana: 'あした、なんじにあいましょうか。',
          vi: 'Ngày mai chúng ta gặp nhau lúc mấy giờ nhỉ?'
        },
        {
          speaker: 'Bạn',
          kanji: '10時はどうですか。',
          kana: 'じゅうじはどうですか。',
          vi: '10 giờ thì thế nào?'
        },
        {
          speaker: 'Mai',
          kanji: '10時はちょっと...。11時にしましょう。',
          kana: 'じゅうじはちょっと...。じゅういちじにしましょう。',
          vi: '10 giờ thì hơi kẹt... Hãy dời sang 11 giờ nhé.'
        },
        {
          speaker: 'Bạn',
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
      choukaiTip: 'Bẫy kinh điển JLPT: Mốc thời gian xuất hiện đầu tiên (10 giờ) thường bị bác bỏ bởi từ 「ちょっと」.'
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
          kanji: 'いらっしゃいませ。',
          kana: 'いらっしゃいませ。',
          vi: 'Xin kính chào quý khách.'
        },
        {
          speaker: 'Khách',
          kanji: 'この傘はおいくらですか。',
          kana: 'このかさはおいくらですか。',
          vi: 'Chiếc ô này giá bao nhiêu tiền vậy?'
        },
        {
          speaker: 'Thu ngân',
          kanji: '500円です。',
          kana: 'ごひゃくえんです。',
          vi: 'Dạ giá 500 yên.'
        },
        {
          speaker: 'Khách',
          kanji: 'では、千円札でお願いします。',
          kana: 'では、せんえんさつでおねがいします。',
          vi: 'Vậy tôi đưa tờ 1.000 yên nhé.'
        },
        {
          speaker: 'Thu ngân',
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
      choukaiTip: 'Từ vựng then chốt 「おつり」 thường xuyên xuất hiện trong đề thi Choukai bài mua sắm.'
    },
    {
      id: 5,
      level: 'N4',
      topic: 'Công Việc & Xin Phép Nghỉ',
      situation: 'Nhân viên công ty gọi điện thoại cho cấp trên để xin phép đến muộn do kẹt xe.',
      audioText: '課長、すみません。電車が遅れていて、30分ほど遅刻しそうです。大丈夫ですか。気をつけて来てください。',
      dialogue: [
        {
          speaker: 'Nhân viên',
          kanji: '課長、すみません。電車が遅れていて、30分ほど遅刻しそうです。',
          kana: 'かちょう、すみません。でんしゃがおくれていて、さんじっぷんほどちこくしそうです。',
          vi: 'Trưởng phòng, tôi xin lỗi. Tàu điện đang bị trễ nên chắc tôi sẽ đến muộn khoảng 30 phút.'
        },
        {
          speaker: 'Trưởng phòng',
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
      choukaiTip: 'Dạng bài hỏi nguyên nhân thường dùng cấu trúc thể Te 「〜て」 để diễn giải lý do.'
    },
    {
      id: 6,
      level: 'N4',
      topic: 'Thời Tiết & Kế Hoạch Dã Ngoại',
      situation: 'Hai bạn trẻ đang xem dự báo thời tiết cho chuyến dã ngoại cuối tuần tại công viên Ueno.',
      audioText: '明日の天気予報を見ましたか。午後は雨が降るそうですよ。えっ、じゃあピクニックは日曜日に延期しましょう。そうですね。',
      dialogue: [
        {
          speaker: 'Bạn Nam',
          kanji: '明日の天気予報を見ましたか。午後は雨が降るそうですよ。',
          kana: 'あしたのてんきよほうをみましたか。ごごはあめがふるそうですよ。',
          vi: 'Cậu đã xem dự báo thời tiết ngày mai chưa? Nghe bảo buổi chiều trời sẽ mưa đấy.'
        },
        {
          speaker: 'Bạn Nữ',
          kanji: 'えっ、じゃあピクニックは日曜日に延期しましょう。',
          kana: 'えっ、じゃあぴくにっくはにちようびにえんきしましょう。',
          vi: 'Hả, vậy thì buổi dã ngoại hãy dời sang Chủ nhật nhé.'
        },
        {
          speaker: 'Bạn Nam',
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
      choukaiTip: 'Động từ 「延期する」(hoãn/dời) mang ý nghĩa đổi lịch chứ không phải hủy bỏ 「中止」.'
    }
  ];

  // Filter tracks by active level, fallback to N5 if none match
  const filteredTracks = allTracks.filter((t) => t.level === activeLevel);
  const currentTracks = filteredTracks.length > 0 ? filteredTracks : allTracks;

  // Player & Interactive States
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [listenCount, setListenCount] = useState(0);

  // Scaffolding Display Toggles
  const [showTranscript, setShowTranscript] = useState(false);
  const [showFurigana, setShowFurigana] = useState(true);
  const [showTranslation, setShowTranslation] = useState(false);

  // Quiz States
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);

  const track = currentTracks[currentIndex] || currentTracks[0];

  // Reset when level or track index changes
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

  // Handle Play Audio
  const handlePlayAudio = () => {
    sounds.playFlip();
    setIsPlaying(true);
    setListenCount((prev) => prev + 1);

    speakJapanese(track.audioText, playbackSpeed);

    // Estimate duration to animate equalizer bars
    const wordCount = track.audioText.length;
    const durationMs = Math.max(2500, (wordCount * 190) / playbackSpeed);

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

  // Cycle Next Track
  const handleNextTrack = () => {
    sounds.playFlip();
    if (currentIndex < currentTracks.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setCurrentIndex(0);
    }
  };

  // Cycle Previous Track
  const handlePrevTrack = () => {
    sounds.playFlip();
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  // Keyboard shortcut listener (Space to play, 1/2/3/4 to choose option)
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
    <div className="space-y-6 max-w-5xl mx-auto pb-16 animate-in fade-in duration-300">
      {/* ── 1. HEADER BANNER: CHOUKAI MASTER CLASS ── */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-pink-100 shadow-sm relative overflow-hidden">
        {/* Japanese Watermark */}
        <div className="absolute right-4 top-2 text-pink-100/50 font-jp font-black text-8xl pointer-events-none select-none">
          聴
        </div>

        <div className="relative z-10">
          <div className="mb-2.5 flex flex-wrap items-center justify-between gap-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-50 text-pink-700 font-extrabold text-[11px] uppercase tracking-wider border border-pink-100">
              <Headphones size={13} className="text-pink-600" />
              <span>CHOUKAI (聴解) • LUYỆN NGHE PHẢN XẠ JLPT {activeLevel}</span>
            </div>

            {/* Score Tracker Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold">
              <Award size={14} className="text-amber-500" />
              <span>Điểm nghe: <strong>{score}</strong>/{currentTracks.length}</span>
            </div>
          </div>

          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-snug mb-1.5">
            Luyện Nghe Phản Xạ Âm Thanh Tokyo
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-2xl mb-4">
            Rèn luyện màng nhĩ với các đoạn hội thoại thực tế chuẩn giọng Tokyo. Hỗ trợ điều chỉnh tốc độ, chế độ nghe bịt mắt (Blind Listen) và AI phân tích bẫy nghe.
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
                    ? 'bg-gradient-to-r from-pink-600 to-rose-500 text-white shadow-lotus'
                    : 'bg-pink-50/50 hover:bg-pink-100 text-slate-600'
                }`}
              >
                Bài 0{idx + 1}: {t.topic}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── 2. HIGH-END AUDIO PLAYER & EQUALIZER SUITE ── */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-pink-100 shadow-sm space-y-6">
        {/* Situation Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-pink-50">
          <div>
            <span className="text-[10.5px] font-black text-pink-600 uppercase tracking-wider block mb-1">
              TÌNH HUỐNG HỘI THOẠI • {track.topic}
            </span>
            <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
              {track.situation}
            </h3>
          </div>

          {/* Listen Counter */}
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
            <Volume2 size={15} className="text-pink-600" />
            <span>Đã nghe: <strong className="text-slate-900">{listenCount}</strong> lần</span>
          </div>
        </div>

        {/* ── VISUALIZER WAVE BARS & BIG PLAY BUTTON ── */}
        <div className="py-8 px-4 rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-pink-950 text-white relative overflow-hidden flex flex-col items-center justify-center space-y-6 shadow-xl">
          {/* Subtle Ambient Glow */}
          <div className="absolute inset-0 bg-radial from-pink-500/10 via-transparent to-transparent pointer-events-none" />

          {/* Sound Equalizer Wave Bars */}
          <div className="flex items-end justify-center gap-1.5 sm:gap-2 h-14 w-full max-w-sm relative z-10 px-4">
            {[40, 65, 85, 45, 95, 70, 50, 90, 60, 80, 40, 75, 55, 90, 65].map((val, idx) => {
              const heightClass = isPlaying
                ? `${Math.max(20, (val + (idx % 3) * 15))}%`
                : '15%';
              return (
                <div
                  key={idx}
                  className="flex-1 bg-gradient-to-t from-pink-600 via-rose-400 to-pink-300 rounded-full transition-all duration-300"
                  style={{
                    height: heightClass,
                    transitionDuration: isPlaying ? `${180 + (idx % 4) * 50}ms` : '400ms'
                  }}
                />
              );
            })}
          </div>

          {/* Large Center Play / Replay Button */}
          <div className="flex items-center gap-4 relative z-10">
            <button
              type="button"
              onClick={handlePlayAudio}
              className={`w-16 h-16 sm:w-18 sm:h-18 rounded-full flex items-center justify-center transition-all duration-300 cursor-pointer shadow-2xl ${
                isPlaying
                  ? 'bg-rose-500 text-white scale-105 ring-8 ring-rose-400/30 animate-pulse'
                  : 'bg-gradient-to-tr from-pink-600 via-rose-500 to-pink-500 text-white hover:scale-110 active:scale-95 ring-4 ring-white/20'
              }`}
              title="Nhấn để phát âm thanh (Phím Space)"
            >
              {listenCount === 0 ? (
                <Play size={28} fill="white" className="ml-1" />
              ) : (
                <RotateCcw size={26} className={isPlaying ? 'animate-spin' : ''} />
              )}
            </button>
          </div>

          {/* Control Bar: Speed Selector & Blind Mode Toggles */}
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 relative z-10 pt-2 text-xs">
            {/* Speed Buttons */}
            <div className="flex items-center gap-1 bg-white/10 backdrop-blur-md p-1 rounded-2xl border border-white/15">
              <span className="text-[10px] text-pink-200 font-bold px-2 flex items-center gap-1">
                <Gauge size={12} />
                <span>Tốc độ:</span>
              </span>
              {[0.75, 1.0, 1.25].map((speed) => (
                <button
                  key={speed}
                  type="button"
                  onClick={() => {
                    sounds.playFlip();
                    setPlaybackSpeed(speed);
                  }}
                  className={`px-2.5 py-1 rounded-xl font-black transition-all cursor-pointer ${
                    playbackSpeed === speed
                      ? 'bg-pink-600 text-white shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {speed}x
                </button>
              ))}
            </div>

            {/* Subtitle / Script Reveal Toggle Button */}
            <button
              type="button"
              onClick={() => {
                sounds.playFlip();
                setShowTranscript(!showTranscript);
              }}
              className={`px-3.5 py-1.5 rounded-2xl font-bold flex items-center gap-1.5 transition-all cursor-pointer border ${
                showTranscript
                  ? 'bg-pink-600 border-pink-400 text-white'
                  : 'bg-white/10 border-white/20 text-pink-200 hover:bg-white/20'
              }`}
            >
              {showTranscript ? <EyeOff size={14} /> : <Eye size={14} />}
              <span>{showTranscript ? 'Ẩn lời thoại' : 'Hiện lời thoại'}</span>
            </button>
          </div>
        </div>

        {/* ── EXPANDABLE TRANSCRIPT / DIALOGUE ACCORDION ── */}
        {showTranscript && (
          <div className="p-5 rounded-3xl bg-pink-50/40 border border-pink-100 space-y-4 animate-in fade-in duration-300">
            <div className="flex items-center justify-between pb-2 border-b border-pink-100/60">
              <span className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Volume2 size={14} className="text-pink-600" />
                <span>LỜI THOẠI CHI TIẾT (SCRIPT)</span>
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowTranslation(!showTranslation)}
                  className="text-xs font-bold text-pink-600 hover:underline cursor-pointer"
                >
                  {showTranslation ? 'Ẩn dịch nghĩa' : 'Hiện dịch nghĩa'}
                </button>
              </div>
            </div>

            {/* Speaker Turns */}
            <div className="space-y-3">
              {track.dialogue.map((turn, tIdx) => (
                <div
                  key={tIdx}
                  className="flex items-start gap-3 p-3 rounded-2xl bg-white border border-pink-100/70 shadow-xs"
                >
                  <span className="px-2.5 py-1 rounded-xl bg-pink-100 text-pink-700 font-black text-[11px] shrink-0 mt-0.5">
                    {turn.speaker}
                  </span>

                  <div className="flex-1 space-y-1">
                    <div className="font-jp font-bold text-sm sm:text-base text-slate-900">
                      {turn.kanji}
                    </div>
                    {showFurigana && (
                      <div className="font-jp text-xs text-pink-600/90 font-medium">
                        {turn.kana}
                      </div>
                    )}
                    {showTranslation && (
                      <div className="text-xs text-slate-600 pt-0.5 border-t border-slate-100 mt-1">
                        {turn.vi}
                      </div>
                    )}
                  </div>

                  {/* Play specific sentence */}
                  <button
                    type="button"
                    onClick={() => handlePlaySentence(turn.kanji)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-pink-600 hover:bg-pink-50 transition-colors shrink-0 cursor-pointer"
                    title="Nghe riêng câu này"
                  >
                    <Volume2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── 3. JLPT CHOUKAI QUESTION & 4 OPTIONS ── */}
        <div className="space-y-4 pt-2">
          <div className="flex items-start gap-2.5">
            <span className="w-6 h-6 rounded-lg bg-pink-600 text-white font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
              Q
            </span>
            <h4 className="text-base sm:text-lg font-black text-slate-900 leading-snug">
              {track.question}
            </h4>
          </div>

          {/* 4 Options Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {track.options.map((opt) => {
              const isSelected = selectedOption === opt.id;
              const isCorrect = isAnswered && opt.id === track.correctAnswer;
              const isWrongSelected = isAnswered && isSelected && opt.id !== track.correctAnswer;

              let btnStyle = 'bg-white border-slate-200 text-slate-700 hover:border-pink-300 hover:bg-pink-50/30';
              if (isCorrect) {
                btnStyle = 'bg-emerald-50 border-emerald-500 text-emerald-900 font-black shadow-sm ring-2 ring-emerald-300';
              } else if (isWrongSelected) {
                btnStyle = 'bg-rose-50 border-rose-400 text-rose-900 font-black shadow-sm ring-2 ring-rose-200';
              } else if (isSelected) {
                btnStyle = 'bg-pink-50 border-pink-500 text-pink-900 font-black';
              }

              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => handleSelectOption(opt.id)}
                  disabled={isAnswered}
                  className={`p-4 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${btnStyle} ${
                    isAnswered ? 'cursor-default' : 'hover:scale-[1.01] active:scale-[0.99]'
                  }`}
                  style={{ minHeight: '52px' }}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-7 h-7 rounded-xl font-black text-xs flex items-center justify-center shrink-0 transition-all ${
                        isCorrect
                          ? 'bg-emerald-600 text-white'
                          : isWrongSelected
                          ? 'bg-rose-500 text-white'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {opt.id}
                    </span>
                    <span className="font-bold text-xs sm:text-sm">{opt.text}</span>
                  </div>

                  {isCorrect && <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />}
                  {isWrongSelected && <XCircle size={18} className="text-rose-600 shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── 4. ANSWER FEEDBACK & AI COACH ANALYSIS ── */}
        {isAnswered && (
          <div className="p-5 rounded-3xl bg-white border border-pink-200 shadow-sm space-y-4 animate-in fade-in duration-300">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-pink-50">
              <div className="flex items-center gap-2">
                {selectedOption === track.correctAnswer ? (
                  <div className="flex items-center gap-1.5 text-emerald-700 font-black text-sm">
                    <CheckCircle2 size={18} className="text-emerald-600" />
                    <span>CHÍNH XÁC! TAI NGHE RẤT TINH</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-rose-700 font-black text-sm">
                    <XCircle size={18} className="text-rose-600" />
                    <span>CHƯA ĐÚNG! HÃY NGHE KỸ TỪ KHÓA BẪY</span>
                  </div>
                )}
              </div>

              {/* AI Sensei Listening Analysis Trigger */}
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
                className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-pink-600 to-rose-500 hover:from-pink-500 hover:to-rose-600 text-white font-bold text-xs shadow-lotus flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Sparkles size={14} />
                <span>AI Sensei phân tích bẫy nghe</span>
              </button>
            </div>

            {/* Explanation Content */}
            <div className="space-y-2 text-xs sm:text-sm text-slate-700 leading-relaxed">
              <p className="mb-1 font-semibold text-slate-800">
                {track.explanation}
              </p>
              <div className="p-3 rounded-2xl bg-amber-50/70 border border-amber-200/60 text-amber-900 text-xs flex items-start gap-2">
                <HelpCircle size={16} className="text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-[11px] uppercase tracking-wide text-amber-800 mb-0.5">
                    MẸO BẮT TỪ KHÓA JLPT CHOUKAI:
                  </strong>
                  <span>{track.choukaiTip}</span>
                </div>
              </div>
            </div>

            {/* Next Track Navigation */}
            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={handleNextTrack}
                className="px-5 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs sm:text-sm shadow-md flex items-center gap-2 transition-all hover:scale-105 active:scale-95 cursor-pointer"
              >
                <span>Chuyển sang bài nghe tiếp theo</span>
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Bottom Pagination Control */}
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
