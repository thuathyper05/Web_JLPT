import React, { useState, useEffect } from 'react';
import { speakJapanese } from '../services/api';
import { sounds } from '../services/sounds';
import {
  RotateCcw,
  Volume2,
  CheckCircle2,
  Flame,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  BookOpen,
  Layers,
  HelpCircle
} from 'lucide-react';

// Bảng lật thẻ Kanji Flashcard tốc độ cao giúp ghi nhớ sâu sắc
// ZERO ARROWS RULE: Tuyệt đối không dùng ký tự mũi tên

export default function KanjiFlashcardMode({ kanjiList, guestProgress, onMarkStatus, onClose }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const list = Array.isArray(kanjiList) && kanjiList.length > 0 ? kanjiList : [];
  const currentItem = list[currentIndex] || null;

  // Lấy trạng thái của thẻ hiện tại
  function getItemStatus(item) {
    if (!item) return 'unlearned';
    const key = item.id ? String(item.id) : 'kanji_' + item.kanji;
    const progress = guestProgress && typeof guestProgress === 'object' ? guestProgress : {};
    const entry = progress[key] || progress['kanji_' + item.kanji] || progress[item.kanji];
    return entry && entry.status ? entry.status : 'unlearned';
  }

  // Tự động phát âm thanh khi đổi thẻ
  useEffect(function () {
    setIsFlipped(false);
    if (currentItem && currentItem.kanji) {
      speakJapanese(currentItem.kanji);
    }
  }, [currentIndex]);

  function handleFlip() {
    sounds.playFlip();
    setIsFlipped(!isFlipped);
  }

  function handleNext() {
    sounds.playFlip();
    if (currentIndex < list.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setCurrentIndex(0);
    }
  }

  function handlePrev() {
    sounds.playFlip();
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    } else {
      setCurrentIndex(list.length - 1);
    }
  }

  function handleMark(status) {
    if (!currentItem) return;
    onMarkStatus(currentItem, status);
    // Tự động chuyển thẻ tiếp theo sau khi đánh dấu
    setTimeout(function () {
      handleNext();
    }, 280);
  }

  if (!currentItem) {
    return (
      <div className="p-10 text-center bg-white rounded-3xl border border-pink-100">
        <p className="text-xs text-slate-400">Không có chữ Hán nào để ôn tập flashcard.</p>
      </div>
    );
  }

  const currentStatus = getItemStatus(currentItem);
  const isMastered = currentStatus === 'mastered';
  const isReview = currentStatus === 'needs_review';

  return (
    <div className="max-w-xl mx-auto space-y-4">
      {/* Header thanh tiến trình */}
      <div className="flex items-center justify-between text-xs font-bold text-slate-500 bg-white p-4 rounded-2xl border border-pink-100 shadow-sm">
        <div className="flex items-center gap-2">
          <Layers size={15} className="text-pink-600" />
          <span>Flashcard Kanji: {currentIndex + 1} / {list.length}</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 cursor-pointer font-bold"
          >
            Đóng Flashcard
          </button>
        </div>
      </div>

      {/* Thẻ Flip 3D */}
      <div
        onClick={handleFlip}
        className="w-full min-h-[380px] sm:min-h-[420px] bg-white rounded-3xl border-2 border-pink-200/80 shadow-lotus p-6 sm:p-8 flex flex-col justify-between text-center relative cursor-pointer select-none transition-all hover:border-pink-400"
      >
        {/* Badge góc */}
        <div className="flex items-center justify-between text-xs">
          <span className="px-2.5 py-0.5 rounded-full bg-pink-50 text-pink-700 font-extrabold text-[11px] border border-pink-100">
            {currentItem.stroke_count || currentItem.stroke || 1} nét
          </span>

          <span className="text-[11px] text-slate-400 font-semibold flex items-center gap-1">
            <HelpCircle size={12} />
            <span>Chạm để lật mặt sau</span>
          </span>
        </div>

        {/* MẶT TRƯỚC (CHỮ HÁN TO RÕ) */}
        {!isFlipped ? (
          <div className="my-auto space-y-4 py-6 animate-in zoom-in-95 duration-200">
            <div className="text-8xl sm:text-9xl font-black font-jp text-slate-900 tracking-wider">
              {currentItem.kanji}
            </div>

            <div className="inline-block px-4 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 font-black text-sm">
              {currentItem.han_viet || '—'}
            </div>

            <p className="text-xs text-slate-400">
              Nhấp vào thẻ hoặc nhấn phím Space để xem cách đọc On/Kun và ví dụ
            </p>
          </div>
        ) : (
          /* MẶT SAU (CHI TIẾT ÂM ĐỌC & VÍ DỤ) */
          <div className="my-auto space-y-4 py-4 animate-in fade-in duration-200 text-left">
            <div className="text-center pb-2 border-b border-pink-100">
              <span className="text-4xl font-black font-jp text-pink-600 block mb-1">
                {currentItem.kanji}
              </span>
              <span className="text-base font-black text-amber-700 mr-2">
                {currentItem.han_viet}
              </span>
              <span className="text-xs font-bold text-slate-600">
                — {currentItem.meaning}
              </span>
            </div>

            {/* Bảng On / Kun */}
            <div className="grid grid-cols-2 gap-2 text-center text-xs p-3 rounded-2xl bg-pink-50/60 border border-pink-100">
              <div>
                <span className="text-[10px] text-slate-400 block font-bold uppercase">Âm On</span>
                <span className="font-jp font-black text-pink-700 text-sm">{currentItem.onyomi || '—'}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-bold uppercase">Âm Kun</span>
                <span className="font-jp font-black text-emerald-700 text-sm">{currentItem.kunyomi || '—'}</span>
              </div>
            </div>

            {/* Ví dụ từ ghép */}
            {currentItem.examples && currentItem.examples.length > 0 && (
              <div className="space-y-1 text-xs">
                <span className="font-bold text-slate-600 block text-[11px]">Từ ghép thông dụng:</span>
                <div className="space-y-1 max-h-28 overflow-y-auto pr-1">
                  {currentItem.examples.slice(0, 3).map(function (ex, exIdx) {
                    const w = typeof ex === 'string' ? ex : (ex.word || ex.w || '');
                    const k = typeof ex === 'object' ? (ex.reading || ex.k || '') : '';
                    const m = typeof ex === 'object' ? (ex.meaning || ex.m || '') : '';
                    return (
                      <div key={exIdx} className="p-2 rounded-xl bg-slate-50 border border-slate-200/60 flex items-center justify-between">
                        <div>
                          <strong className="font-jp text-slate-900 mr-1.5">{w}</strong>
                          {k && <span className="text-pink-600 font-jp mr-1">({k})</span>}
                          {m && <span className="text-slate-500">— {m}</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Nút Loa phát âm */}
        <div className="pt-2 flex justify-center">
          <button
            type="button"
            onClick={function (e) {
              e.stopPropagation();
              speakJapanese(currentItem.kanji);
            }}
            className="px-3.5 py-1.5 rounded-full bg-pink-50 text-pink-700 hover:bg-pink-100 font-bold text-xs flex items-center gap-1.5 border border-pink-200 cursor-pointer"
          >
            <Volume2 size={14} />
            <span>Nghe phát âm Tokyo</span>
          </button>
        </div>
      </div>

      {/* Thanh điều khiển và đánh dấu ghi nhớ */}
      <div className="grid grid-cols-4 gap-2 pt-1">
        <button
          type="button"
          onClick={handlePrev}
          className="py-3 rounded-2xl bg-white border border-pink-200 text-slate-700 font-bold text-xs hover:bg-pink-50 flex items-center justify-center gap-1 cursor-pointer shadow-sm"
        >
          <ChevronLeft size={16} />
          <span className="hidden sm:inline">Trước</span>
        </button>

        <button
          type="button"
          onClick={function () { handleMark('needs_review'); }}
          className={'py-3 rounded-2xl font-black text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer border ' + (isReview ? 'bg-amber-500 text-white border-amber-600 shadow-md' : 'bg-amber-50 border-amber-200 text-amber-800 hover:bg-amber-100')}
        >
          <Flame size={14} />
          <span>Cần ôn</span>
        </button>

        <button
          type="button"
          onClick={function () { handleMark('mastered'); }}
          className={'py-3 rounded-2xl font-black text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer border ' + (isMastered ? 'bg-emerald-600 text-white border-emerald-700 shadow-md' : 'bg-emerald-50 border-emerald-200 text-emerald-800 hover:bg-emerald-100')}
        >
          <CheckCircle2 size={14} />
          <span>Đã thuộc</span>
        </button>

        <button
          type="button"
          onClick={handleNext}
          className="py-3 rounded-2xl bg-white border border-pink-200 text-slate-700 font-bold text-xs hover:bg-pink-50 flex items-center justify-center gap-1 cursor-pointer shadow-sm"
        >
          <span className="hidden sm:inline">Sau</span>
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
