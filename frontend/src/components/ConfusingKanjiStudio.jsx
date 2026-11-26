import React, { useState } from 'react';
import { CONFUSING_KANJI_PAIRS } from '../data/confusingKanji.js';
import { speakJapanese } from '../services/api';
import { sounds } from '../services/sounds';
import {
  Sparkles,
  HelpCircle,
  CheckCircle2,
  XCircle,
  Volume2,
  ChevronRight,
  BookOpen,
  Award,
  Layers
} from 'lucide-react';

// Phân hệ Phân Biệt Chữ Hán Dễ Nhầm Lẫn Chuẩn Đề Thi JLPT
// ZERO ARROWS RULE: Tuyệt đối không dùng ký tự mũi tên trong toàn bộ file

export default function ConfusingKanjiStudio() {
  const [selectedPairIndex, setSelectedPairIndex] = useState(0);
  const [quizAnswer, setQuizAnswer] = useState(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);

  const currentPair = CONFUSING_KANJI_PAIRS[selectedPairIndex] || CONFUSING_KANJI_PAIRS[0];

  function handleSelectPair(idx) {
    sounds.playFlip();
    setSelectedPairIndex(idx);
    setQuizAnswer(null);
    setIsAnswerSubmitted(false);
  }

  function handleTestAnswer(chosenKanji) {
    if (isAnswerSubmitted) return;
    setQuizAnswer(chosenKanji);
    setIsAnswerSubmitted(true);

    // Kiểm tra câu đố: Tìm chữ đầu tiên trong cặp
    const targetKanji = currentPair.items[0].kanji;
    if (chosenKanji === targetKanji) {
      sounds.playCorrect();
    } else {
      sounds.playWrong();
    }
  }

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      {/* Header giới thiệu */}
      <div className="p-4 rounded-2xl bg-white border border-pink-100 shadow-sm flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 font-black text-slate-800">
          <Sparkles size={16} className="text-pink-600" />
          <span>Bí Quyết Phân Biệt Các Cặp Chữ Hán Dễ Gây Bẫy Trong Đề Thi JLPT</span>
        </div>
        <span className="text-slate-400 font-bold hidden sm:inline">
          {CONFUSING_KANJI_PAIRS.length} cặp chữ Hán then chốt
        </span>
      </div>

      {/* Danh sách các cặp chữ Hán (Pill Buttons) */}
      <div className="flex items-center gap-2 overflow-x-auto p-2 bg-white rounded-2xl border border-pink-100 text-xs">
        {CONFUSING_KANJI_PAIRS.map(function (pair, idx) {
          const isSelected = selectedPairIndex === idx;
          return (
            <button
              key={pair.id}
              type="button"
              onClick={function () { handleSelectPair(idx); }}
              className={'px-3.5 py-1.5 rounded-xl font-black transition-all shrink-0 cursor-pointer ' + (isSelected ? 'bg-pink-600 text-white shadow-xs' : 'bg-pink-50/60 text-slate-700 hover:bg-pink-100')}
            >
              {pair.title}
            </button>
          );
        })}
      </div>

      {/* Thẻ Phân tích chi tiết cặp chữ Hán đang chọn */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-pink-100 shadow-sm space-y-6">
        <div>
          <div className="inline-block px-3 py-0.5 rounded-full bg-amber-50 text-amber-800 font-extrabold text-[11px] border border-amber-200 mb-2">
            Trọng điểm đề thi JLPT {currentPair.level}
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900">
            Phân Biệt: {currentPair.title}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {currentPair.tip}
          </p>
        </div>

        {/* Bảng so sánh 2 hoặc 3 chữ Hán đặt cạnh nhau */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {currentPair.items.map(function (item, itemIdx) {
            return (
              <div
                key={itemIdx}
                className="p-5 rounded-2xl bg-pink-50/40 border border-pink-200/80 flex flex-col justify-between text-center relative group hover:border-pink-400 transition-all"
              >
                <div>
                  <div className="text-6xl font-black font-jp text-slate-900 mb-2 group-hover:scale-110 group-hover:text-pink-600 transition-transform">
                    {item.kanji}
                  </div>

                  <span className="inline-block px-3 py-0.5 rounded-full bg-white text-pink-700 font-black text-xs border border-pink-200 mb-2 shadow-2xs">
                    {item.han_viet}
                  </span>

                  <div className="text-xs font-bold text-slate-800 mb-2">
                    {item.meaning}
                  </div>
                </div>

                <div className="text-left pt-3 border-t border-pink-100 space-y-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-white border border-pink-100/80 text-[11px] text-pink-900 leading-relaxed">
                    <strong className="text-pink-700 block mb-0.5">Dấu hiệu phân biệt:</strong>
                    {item.keyFeature}
                  </div>

                  <div className="text-[11px] text-slate-500">
                    <strong className="text-slate-700 block mb-0.5">Từ ghép mẫu:</strong>
                    {item.examples}
                  </div>

                  <button
                    type="button"
                    onClick={function () { speakJapanese(item.kanji); }}
                    className="w-full mt-1 py-1 rounded-lg bg-pink-50 text-pink-600 hover:bg-pink-100 text-[11px] font-bold flex items-center justify-center gap-1 cursor-pointer transition-colors"
                  >
                    <Volume2 size={13} />
                    <span>Nghe phát âm</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Khung Mẹo Ghi Nhớ Sâu Sắc */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-pink-50 border border-amber-200 text-xs text-amber-900 space-y-1">
          <strong className="text-amber-800 flex items-center gap-1.5 font-black text-xs uppercase tracking-wide">
            <Sparkles size={14} className="text-amber-600" />
            <span>Mẹo ghi nhớ độc quyền chống nhầm lẫn:</span>
          </strong>
          <p className="leading-relaxed mb-0 font-medium">
            {currentPair.distinctionMemory}
          </p>
        </div>

        {/* Bài tập mini thử thách phản xạ phân biệt */}
        <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <strong className="text-slate-800 flex items-center gap-1 font-bold">
              <HelpCircle size={14} className="text-pink-600" />
              <span>Thử thách nhanh: Đâu là chữ Hán mang nghĩa "{currentPair.items[0].meaning}" ({currentPair.items[0].han_viet})?</span>
            </strong>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {currentPair.items.map(function (optItem, optIdx) {
              const isChosen = quizAnswer === optItem.kanji;
              const isCorrectOpt = optItem.kanji === currentPair.items[0].kanji;

              let btnClass = 'bg-white border-slate-200 text-slate-800 hover:border-pink-300 hover:bg-pink-50/30';
              if (isAnswerSubmitted) {
                if (isCorrectOpt) {
                  btnClass = 'bg-emerald-500 text-white border-emerald-600 font-black shadow-sm';
                } else if (isChosen && !isCorrectOpt) {
                  btnClass = 'bg-rose-500 text-white border-rose-600 font-black shadow-sm';
                } else {
                  btnClass = 'bg-slate-100 text-slate-400 opacity-60';
                }
              }

              return (
                <button
                  key={optIdx}
                  type="button"
                  disabled={isAnswerSubmitted}
                  onClick={function () { handleTestAnswer(optItem.kanji); }}
                  className={'py-3 rounded-xl border-2 font-black font-jp text-2xl transition-all cursor-pointer flex items-center justify-center ' + btnClass}
                >
                  <span>{optItem.kanji}</span>
                </button>
              );
            })}
          </div>

          {isAnswerSubmitted && (
            <div className="pt-1 text-center text-xs animate-in fade-in">
              {quizAnswer === currentPair.items[0].kanji ? (
                <span className="text-emerald-600 font-black flex items-center justify-center gap-1">
                  <CheckCircle2 size={14} />
                  <span>Chính xác tuyệt đối! Bạn đã phân biệt được mặt chữ rất vững vàng.</span>
                </span>
              ) : (
                <span className="text-rose-600 font-black flex items-center justify-center gap-1">
                  <XCircle size={14} />
                  <span>Chưa chính xác! Hãy đọc lại mẹo phân biệt ở trên và chọn lại nhé.</span>
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
