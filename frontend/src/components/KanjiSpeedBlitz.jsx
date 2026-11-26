import React, { useState, useEffect, useRef } from 'react';
import { speakJapanese } from '../services/api';
import { sounds } from '../services/sounds';
import {
  Zap,
  Timer,
  Flame,
  Trophy,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Award,
  Sparkles,
  Volume2,
  ChevronLeft
} from 'lucide-react';

// Chế độ Thử Thách Phản Xạ 60 Giây (Kanji Speed Blitz)
// Luyện tốc độ nhận diện mặt chữ, âm Hán Việt và nghĩa tiếng Việt thần tốc
// ZERO ARROWS RULE: Tuyệt đối không dùng ký tự mũi tên

export default function KanjiSpeedBlitz({ kanjiList, activeLevel, onComplete, onBack }) {
  const [gameState, setGameState] = useState('ready'); // 'ready', 'playing', 'finished'
  const [timeLeft, setTimeLeft] = useState(60);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [totalAttempted, setTotalAttempted] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [highScore, setHighScore] = useState(0);

  const timerRef = useRef(null);

  // Nạp điểm kỷ lục từ bộ nhớ trình duyệt
  useEffect(function () {
    try {
      const saved = localStorage.getItem('jlpt_kanji_blitz_highscore_' + (activeLevel || 'all'));
      if (saved) {
        setHighScore(parseInt(saved, 10) || 0);
      }
    } catch (e) {
      // Bỏ qua lỗi truy cập localStorage
    }
  }, [activeLevel]);

  // Bộ sinh câu hỏi ngẫu nhiên tốc độ cao
  function generateQuestion(list) {
    if (!Array.isArray(list) || list.length < 4) {
      return null;
    }

    const targetIdx = Math.floor(Math.random() * list.length);
    const targetItem = list[targetIdx];

    // Ngẫu nhiên kiểu câu hỏi: 'meaning' (nghĩa), 'han_viet' (Hán Việt), 'reading' (cách đọc)
    const questionModes = ['meaning', 'han_viet', 'reading'];
    const chosenMode = questionModes[Math.floor(Math.random() * questionModes.length)];

    let promptText = '';
    let correctAnswer = '';
    let getOptionVal = function (item) { return item.meaning; };

    if (chosenMode === 'han_viet') {
      promptText = 'Âm Hán Việt của chữ này là gì?';
      correctAnswer = targetItem.han_viet || targetItem.meaning;
      getOptionVal = function (item) { return item.han_viet || item.meaning; };
    } else if (chosenMode === 'reading') {
      promptText = 'Cách đọc (Onyomi/Kunyomi) của chữ này?';
      const readings = [];
      if (targetItem.onyomi) readings.push(targetItem.onyomi);
      if (targetItem.kunyomi) readings.push(targetItem.kunyomi);
      correctAnswer = readings.length > 0 ? readings.join(' / ') : targetItem.meaning;
      getOptionVal = function (item) {
        const r = [];
        if (item.onyomi) r.push(item.onyomi);
        if (item.kunyomi) r.push(item.kunyomi);
        return r.length > 0 ? r.join(' / ') : item.meaning;
      };
    } else {
      promptText = 'Ý nghĩa tiếng Việt của chữ này là gì?';
      correctAnswer = targetItem.meaning;
      getOptionVal = function (item) { return item.meaning; };
    }

    // Chọn 3 phương án nhiễu khác nhau
    const distractorPool = list.filter(function (item) {
      return item.kanji !== targetItem.kanji && getOptionVal(item) !== correctAnswer;
    });

    // Trộn ngẫu nhiên distractorPool
    const shuffledPool = distractorPool.slice().sort(function () {
      return 0.5 - Math.random();
    });

    const chosenDistractors = [];
    const usedTexts = new Set([correctAnswer]);

    for (let i = 0; i < shuffledPool.length && chosenDistractors.length < 3; i++) {
      const textVal = getOptionVal(shuffledPool[i]);
      if (textVal && !usedTexts.has(textVal)) {
        usedTexts.add(textVal);
        chosenDistractors.push(textVal);
      }
    }

    // Nếu không đủ 3 phương án nhiễu, bổ sung dự phòng
    while (chosenDistractors.length < 3) {
      chosenDistractors.push('Phương án ' + (chosenDistractors.length + 1));
    }

    const options = [correctAnswer, ...chosenDistractors].sort(function () {
      return 0.5 - Math.random();
    });

    return {
      kanji: targetItem.kanji,
      han_viet: targetItem.han_viet || '',
      meaning: targetItem.meaning || '',
      mode: chosenMode,
      prompt: promptText,
      correctAnswer: correctAnswer,
      options: options
    };
  }

  // Bắt đầu lượt chơi mới
  function handleStart() {
    sounds.playStart();
    setTimeLeft(60);
    setScore(0);
    setCombo(0);
    setMaxCombo(0);
    setCorrectCount(0);
    setTotalAttempted(0);
    setIsAnswered(false);
    setSelectedOption(null);

    const firstQ = generateQuestion(kanjiList);
    setCurrentQuestion(firstQ);
    setGameState('playing');

    if (firstQ && firstQ.kanji) {
      speakJapanese(firstQ.kanji);
    }
  }

  // Quản lý đếm ngược 60 giây
  useEffect(function () {
    if (gameState === 'playing') {
      timerRef.current = setInterval(function () {
        setTimeLeft(function (prev) {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            handleFinish();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return function () {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [gameState, score, correctCount, totalAttempted, maxCombo]);

  // Kết thúc lượt chơi
  function handleFinish() {
    sounds.playComplete();
    setGameState('finished');

    // Cập nhật điểm kỷ lục
    setHighScore(function (prevHigh) {
      if (score > prevHigh) {
        try {
          localStorage.setItem('jlpt_kanji_blitz_highscore_' + (activeLevel || 'all'), String(score));
        } catch (e) {
          // Bỏ qua lỗi lưu trữ
        }
        return score;
      }
      return prevHigh;
    });

    if (typeof onComplete === 'function') {
      const xpBonus = Math.min(200, Math.round(score * 0.5));
      onComplete({
        score: score,
        correctCount: correctCount,
        totalAttempted: totalAttempted,
        maxCombo: maxCombo,
        xpEarned: xpBonus
      });
    }
  }

  // Xử lý khi người dùng chọn phương án
  function handleSelect(opt) {
    if (isAnswered || gameState !== 'playing' || !currentQuestion) return;

    setSelectedOption(opt);
    setIsAnswered(true);
    setTotalAttempted(function (prev) { return prev + 1; });

    const isCorrect = opt === currentQuestion.correctAnswer;

    if (isCorrect) {
      sounds.playCorrect();
      setCorrectCount(function (prev) { return prev + 1; });

      // Tính điểm có kèm nhân hệ số combo
      const newCombo = combo + 1;
      setCombo(newCombo);
      if (newCombo > maxCombo) {
        setMaxCombo(newCombo);
      }

      const comboMultiplier = Math.min(3, 1 + Math.floor(newCombo / 3) * 0.5);
      const pointsAdded = Math.round(10 * comboMultiplier);
      setScore(function (prev) { return prev + pointsAdded; });
    } else {
      sounds.playWrong();
      setCombo(0); // Gãy chuỗi combo
    }

    // Chuyển câu cực nhanh trong 280ms để giữ nhịp độ phản xạ
    setTimeout(function () {
      const nextQ = generateQuestion(kanjiList);
      setCurrentQuestion(nextQ);
      setSelectedOption(null);
      setIsAnswered(false);

      if (nextQ && nextQ.kanji) {
        speakJapanese(nextQ.kanji);
      }
    }, 280);
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      {/* ════════════ MÀN HÌNH CHỜ (READY) ════════════ */}
      {gameState === 'ready' && (
        <div className="p-6 sm:p-10 rounded-3xl bg-white border border-pink-100 shadow-sm text-center space-y-6">
          <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-tr from-amber-400 via-rose-500 to-pink-600 text-white flex items-center justify-center mx-auto shadow-lotus">
            <Zap size={38} className="animate-pulse" />
          </div>

          <div className="space-y-2">
            <span className="text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-full bg-pink-50 text-pink-700 border border-pink-100">
              Chế độ Phản Xạ Thần Tốc
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
              Thử Thách 60 Giây Hán Tự {activeLevel}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
              Nhìn chữ Hán và chọn đáp án chính xác trong nháy mắt. Tích lũy Combo nhân điểm và rèn phản xạ thực chiến đỉnh cao cho kỳ thi JLPT!
            </p>
          </div>

          {/* Bảng thông tin kỷ lục và phần thưởng */}
          <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto text-left">
            <div className="p-3.5 rounded-2xl bg-pink-50/70 border border-pink-100">
              <span className="text-[10px] font-extrabold uppercase text-slate-400 block">Kỷ Lục Điểm</span>
              <span className="text-xl font-black text-pink-700 flex items-center gap-1.5 mt-0.5">
                <Trophy size={16} className="text-amber-500" />
                <span>{highScore} điểm</span>
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200">
              <span className="text-[10px] font-extrabold uppercase text-amber-700 block">Thời Gian</span>
              <span className="text-xl font-black text-amber-900 flex items-center gap-1.5 mt-0.5">
                <Timer size={16} className="text-amber-600" />
                <span>60 Giây</span>
              </span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left text-xs text-slate-600 space-y-1.5 max-w-md mx-auto">
            <span className="font-black text-slate-800 flex items-center gap-1.5">
              <Sparkles size={14} className="text-pink-600" />
              <span>Quy tắc tính điểm và combo:</span>
            </span>
            <p>• Đúng mỗi câu: +10 điểm cơ bản.</p>
            <p>• Chuỗi đúng liên tiếp: Kích hoạt Combo x1.5, x2.0, x3.0 nhân bội số điểm.</p>
            <p>• Trả lời sai: Reset combo về 0 và chuyển ngay sang chữ tiếp theo.</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2 max-w-md mx-auto">
            {typeof onBack === 'function' && (
              <button
                type="button"
                onClick={onBack}
                className="py-3 px-5 rounded-2xl bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200 transition-colors flex items-center justify-center gap-1 cursor-pointer"
              >
                <ChevronLeft size={16} />
                <span>Quay lại</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleStart}
              className="flex-1 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-pink-600 to-rose-600 text-white font-black text-sm shadow-lotus hover:brightness-105 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Zap size={18} />
              <span>Bắt Đầu Thử Thách Ngay</span>
            </button>
          </div>
        </div>
      )}

      {/* ════════════ MÀN HÌNH ĐANG CHƠI (PLAYING) ════════════ */}
      {gameState === 'playing' && currentQuestion && (
        <div className="space-y-4 animate-in fade-in duration-150">
          {/* Thanh trạng thái thời gian và điểm số */}
          <div className="p-4 rounded-3xl bg-white border border-pink-100 shadow-sm flex items-center justify-between">
            {/* Đồng hồ đếm ngược */}
            <div className="flex items-center gap-2">
              <div className={'w-10 h-10 rounded-2xl flex items-center justify-center font-black text-sm ' + (timeLeft <= 10 ? 'bg-rose-500 text-white animate-bounce' : 'bg-pink-100 text-pink-700')}>
                <Timer size={18} />
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase text-slate-400 block">Thời gian</span>
                <span className={'text-lg font-black ' + (timeLeft <= 10 ? 'text-rose-600' : 'text-slate-800')}>
                  {timeLeft}s
                </span>
              </div>
            </div>

            {/* Chuỗi Combo */}
            <div className="flex items-center gap-2">
              <div className={'px-3 py-1.5 rounded-2xl flex items-center gap-1 font-black text-xs transition-all ' + (combo >= 3 ? 'bg-amber-500 text-white shadow-lotus-sm scale-105' : 'bg-slate-100 text-slate-600')}>
                <Flame size={14} className={combo >= 3 ? 'text-white fill-white' : 'text-slate-400'} />
                <span>Combo x{combo}</span>
              </div>
            </div>

            {/* Điểm số tích lũy */}
            <div className="text-right">
              <span className="text-[10px] font-extrabold uppercase text-slate-400 block">Điểm số</span>
              <span className="text-xl font-black text-pink-700">
                {score}
              </span>
            </div>
          </div>

          {/* Thanh tiến trình thời gian co lại */}
          <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
            <div
              className={'h-full rounded-full transition-all duration-1000 ' + (timeLeft <= 10 ? 'bg-rose-500' : timeLeft <= 25 ? 'bg-amber-500' : 'bg-pink-600')}
              style={{ width: ((timeLeft / 60) * 100) + '%' }}
            />
          </div>

          {/* Khối hiển thị chữ Hán và câu hỏi */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white border border-pink-100 shadow-sm text-center space-y-4">
            <span className="text-xs font-bold text-slate-500 block">
              {currentQuestion.prompt}
            </span>

            {/* Chữ Hán to chính giữa */}
            <div className="py-2">
              <div className="text-7xl sm:text-8xl font-black font-jp text-slate-900 tracking-wider transition-transform active:scale-95 select-none">
                {currentQuestion.kanji}
              </div>

              <button
                type="button"
                onClick={function () { speakJapanese(currentQuestion.kanji); }}
                className="mt-3 inline-flex items-center gap-1 px-3 py-1 rounded-full bg-pink-50 text-pink-700 text-xs font-bold hover:bg-pink-100 transition-colors cursor-pointer"
              >
                <Volume2 size={13} />
                <span>Phát âm</span>
              </button>
            </div>

            {/* 4 phương án lựa chọn nhanh */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {currentQuestion.options.map(function (opt, idx) {
                const isSelected = selectedOption === opt;
                const isCorrect = opt === currentQuestion.correctAnswer;

                let btnClass = 'bg-white border-pink-200 text-slate-800 hover:border-pink-500 hover:bg-pink-50/50';

                if (isAnswered) {
                  if (isCorrect) {
                    btnClass = 'bg-emerald-500 text-white border-emerald-600 shadow-md font-black scale-102';
                  } else if (isSelected && !isCorrect) {
                    btnClass = 'bg-rose-500 text-white border-rose-600 shadow-md font-black';
                  } else {
                    btnClass = 'bg-slate-50 text-slate-400 border-slate-200 opacity-50';
                  }
                }

                return (
                  <button
                    key={idx}
                    type="button"
                    disabled={isAnswered}
                    onClick={function () { handleSelect(opt); }}
                    className={'p-4 rounded-2xl border-2 text-sm sm:text-base font-extrabold transition-all cursor-pointer flex items-center justify-center min-h-[58px] select-none ' + btnClass}
                  >
                    <span className="font-jp text-center line-clamp-2">{opt}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ════════════ MÀN HÌNH TỔNG KẾT (FINISHED) ════════════ */}
      {gameState === 'finished' && (
        <div className="p-6 sm:p-10 rounded-3xl bg-white border border-pink-100 shadow-sm text-center space-y-6 animate-in zoom-in-95 duration-200">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-amber-400 to-pink-600 text-white flex items-center justify-center mx-auto shadow-lotus">
            <Trophy size={40} className="text-amber-100" />
          </div>

          <div className="space-y-1">
            <span className="text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-full bg-pink-50 text-pink-700 border border-pink-100">
              Kết Thúc 60 Giây Phản Xạ
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 pt-2">
              Xuất Sắc Hoàn Thành!
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Tốc độ phản xạ và sự tập trung là chìa khóa bứt phá điểm số JLPT.
            </p>
          </div>

          {/* Lưới chỉ số thống kê */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-3xl bg-pink-50/50 border border-pink-100 text-center">
            <div className="p-3 rounded-2xl bg-white border border-pink-100 shadow-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Tổng Điểm</span>
              <span className="text-2xl font-black text-pink-700 mt-0.5 block">{score}</span>
            </div>

            <div className="p-3 rounded-2xl bg-white border border-pink-100 shadow-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Đúng / Đã Làm</span>
              <span className="text-2xl font-black text-emerald-600 mt-0.5 block">
                {correctCount} / {totalAttempted}
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-white border border-pink-100 shadow-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Max Combo</span>
              <span className="text-2xl font-black text-amber-600 mt-0.5 block">
                x{maxCombo}
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-white border border-pink-100 shadow-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Tốc Độ TB</span>
              <span className="text-2xl font-black text-sky-600 mt-0.5 block">
                {totalAttempted > 0 ? (60 / totalAttempted).toFixed(1) : 0}s/câu
              </span>
            </div>
          </div>

          {/* Huy hiệu thưởng XP */}
          <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center gap-2 text-amber-800 text-xs font-black">
            <Award size={18} className="text-amber-600" />
            <span>Thưởng +{Math.min(200, Math.round(score * 0.5))} XP vào chuỗi ngày và tiến độ học tập!</span>
          </div>

          {/* Nút hành động */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              type="button"
              onClick={handleStart}
              className="flex-1 py-3.5 rounded-2xl bg-pink-600 text-white font-black text-xs shadow-lotus hover:bg-pink-700 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <RotateCcw size={15} />
              <span>Thử Thách Lại (Chơi tiếp)</span>
            </button>

            {typeof onBack === 'function' && (
              <button
                type="button"
                onClick={onBack}
                className="flex-1 py-3.5 rounded-2xl bg-slate-100 text-slate-700 font-black text-xs hover:bg-slate-200 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Trở Về Bảng Luyện Đề</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
