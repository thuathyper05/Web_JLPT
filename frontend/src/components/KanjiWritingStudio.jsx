import React, { useState, useEffect } from 'react';
import { speakJapanese } from '../services/api';
import { sounds } from '../services/sounds';
import KanjiStrokeCanvas from './KanjiStrokeCanvas.jsx';
import { getKanjiMnemonicInfo } from '../data/kanjiTopics.js';
import {
  PenTool,
  RotateCcw,
  Volume2,
  CheckCircle2,
  Sparkles,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Eye,
  Award,
  Layers
} from 'lucide-react';

// Phòng Tập Viết Chữ Hán Chuyên Sâu Tương Tác (Kanji Writing Studio)
// ZERO ARROWS RULE: Tuyệt đối không dùng ký tự mũi tên trong toàn bộ file

export default function KanjiWritingStudio({ kanjiList, onMasterWord }) {
  const list = Array.isArray(kanjiList) && kanjiList.length > 0 ? kanjiList : [];
  const [currentIndex, setCurrentIndex] = useState(0);
  const [practiceMode, setPracticeMode] = useState('trace'); // 'trace' (tập tô) hoặc 'blind' (tự nhớ viết)
  const [showBlindAnswer, setShowBlindAnswer] = useState(false);
  const [hasCompleted, setHasCompleted] = useState(false);

  const currentItem = list[currentIndex] || null;

  useEffect(function () {
    setShowBlindAnswer(false);
    setHasCompleted(false);
    if (currentItem && currentItem.kanji) {
      speakJapanese(currentItem.kanji);
    }
  }, [currentIndex, practiceMode]);

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

  function handleCompletePractice() {
    sounds.playCorrect();
    setHasCompleted(true);
    if (currentItem && typeof onMasterWord === 'function') {
      onMasterWord(currentItem, 'mastered');
    }
  }

  if (!currentItem) {
    return (
      <div className="p-10 text-center bg-white rounded-3xl border border-pink-100">
        <p className="text-xs text-slate-400">Không có dữ liệu chữ Hán để luyện viết.</p>
      </div>
    );
  }

  const mnemonicInfo = getKanjiMnemonicInfo(currentItem.kanji, currentItem.han_viet, currentItem.meaning);

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      {/* Thanh công cụ và chế độ tập viết */}
      <div className="p-4 rounded-2xl bg-white border border-pink-100 shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 font-black text-slate-800">
          <PenTool size={16} className="text-pink-600" />
          <span>Phòng Tập Viết Nét Hán Tự ({currentIndex + 1} / {list.length})</span>
        </div>

        {/* Chuyển chế độ: Tập tô nét vs Tự nhớ viết */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={function () {
              sounds.playFlip();
              setPracticeMode('trace');
            }}
            className={'px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ' + (practiceMode === 'trace' ? 'bg-pink-600 text-white shadow-2xs' : 'bg-pink-50 text-slate-600 hover:bg-pink-100')}
          >
            Chế độ 1: Tập tô theo nét mờ
          </button>

          <button
            type="button"
            onClick={function () {
              sounds.playFlip();
              setPracticeMode('blind');
              setShowBlindAnswer(false);
            }}
            className={'px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ' + (practiceMode === 'blind' ? 'bg-pink-600 text-white shadow-2xs' : 'bg-pink-50 text-slate-600 hover:bg-pink-100')}
          >
            Chế độ 2: Thử thách viết từ trí nhớ
          </button>
        </div>
      </div>

      {/* Khu vực Bảng vẽ & Thẻ thông tin Hán tự */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 p-6 rounded-3xl bg-white border border-pink-100 shadow-sm items-start">
        {/* Cột trái: Bảng Canvas tập viết */}
        <div className="md:col-span-6 flex flex-col items-center space-y-3">
          <div className="w-full flex items-center justify-between px-2 text-xs">
            <span className="font-bold text-slate-500">
              {practiceMode === 'trace' ? 'Tô theo nét mờ trên ô chữ điền:' : 'Tự vẽ chữ từ trí nhớ (Không nhìn mẫu):'}
            </span>
            <span className="text-pink-600 font-extrabold">
              {currentItem.stroke_count || currentItem.stroke || 1} nét
            </span>
          </div>

          <KanjiStrokeCanvas
            kanjiChar={practiceMode === 'trace' || showBlindAnswer ? currentItem.kanji : ''}
            strokeCount={currentItem.stroke_count || currentItem.stroke || 1}
            strokeTip={mnemonicInfo.strokeOrderTip}
          />

          {/* Các nút hành động cho chế độ Blind Write */}
          {practiceMode === 'blind' && (
            <div className="w-full pt-2">
              {!showBlindAnswer ? (
                <button
                  type="button"
                  onClick={function () {
                    sounds.playFlip();
                    setShowBlindAnswer(true);
                  }}
                  className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-black text-xs shadow-sm flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Eye size={14} />
                  <span>Hiện chữ mẫu để đối chiếu nét</span>
                </button>
              ) : (
                <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-center text-xs font-bold animate-in fade-in">
                  Hãy so sánh các nét bạn vừa viết với chữ mẫu mờ phía trên!
                </div>
              )}
            </div>
          )}

          {/* Nút Hoàn thành bài viết */}
          <button
            type="button"
            onClick={handleCompletePractice}
            className={'w-full py-3 rounded-2xl font-black text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lotus ' + (hasCompleted ? 'bg-emerald-600 text-white' : 'bg-pink-600 hover:bg-pink-700 text-white')}
          >
            <CheckCircle2 size={16} />
            <span>{hasCompleted ? 'Đã thành thạo nét viết (+20 XP)' : 'Xác nhận viết đúng & Nhận thưởng (+20 XP)'}</span>
          </button>
        </div>

        {/* Cột phải: Thông tin Hán tự, chiết tự và mẹo nhớ */}
        <div className="md:col-span-6 space-y-4">
          <div className="p-4 rounded-2xl bg-pink-50/60 border border-pink-100 flex items-center justify-between">
            <div>
              <div className="text-3xl font-black font-jp text-slate-900 mb-0.5">
                {currentItem.kanji}
              </div>
              <div className="text-sm font-black text-amber-700">
                {currentItem.han_viet} <span className="text-xs font-bold text-slate-500">— {currentItem.meaning}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={function () { speakJapanese(currentItem.kanji); }}
              className="px-3 py-1.5 rounded-xl bg-white text-pink-600 font-bold text-xs flex items-center gap-1.5 shadow-2xs border border-pink-200 hover:bg-pink-50 transition-colors cursor-pointer"
            >
              <Volume2 size={14} />
              <span>Phát âm</span>
            </button>
          </div>

          {/* Bảng On / Kun */}
          <div className="grid grid-cols-2 gap-2 text-center text-xs p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
            <div>
              <span className="text-[10px] text-slate-400 block font-bold uppercase">Âm On</span>
              <span className="font-jp font-black text-pink-700 text-sm">{currentItem.onyomi || '—'}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block font-bold uppercase">Âm Kun</span>
              <span className="font-jp font-black text-emerald-700 text-sm">{currentItem.kunyomi || '—'}</span>
            </div>
          </div>

          {/* Chiết tự bộ thủ */}
          {mnemonicInfo.radicals && (
            <div className="space-y-1.5 text-xs">
              <span className="font-extrabold text-slate-700 flex items-center gap-1.5">
                <BookOpen size={14} className="text-pink-600" />
                <span>Các bộ thủ tạo thành:</span>
              </span>
              <div className="grid grid-cols-2 gap-2">
                {mnemonicInfo.radicals.map(function (rad, radIdx) {
                  return (
                    <div key={radIdx} className="p-2 rounded-xl bg-white border border-slate-200 text-xs flex items-center gap-2">
                      <span className="text-lg font-black font-jp text-pink-600">{rad.char}</span>
                      <div className="truncate">
                        <strong className="text-slate-800 block text-[11px] truncate">{rad.name}</strong>
                        <span className="text-[10px] text-slate-500 truncate">{rad.meaning}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Mẹo nhớ tượng hình */}
          {mnemonicInfo.mnemonic && (
            <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200 text-xs text-amber-900 space-y-1">
              <span className="font-black text-amber-800 flex items-center gap-1">
                <Sparkles size={13} className="text-amber-600" />
                <span>Mẹo nhớ mặt chữ nhanh:</span>
              </span>
              <p className="leading-relaxed mb-0 font-medium">
                {mnemonicInfo.mnemonic}
              </p>
            </div>
          )}

          {/* Điều hướng chuyển chữ */}
          <div className="flex items-center justify-between pt-2 border-t border-pink-50 text-xs">
            <button
              type="button"
              onClick={handlePrev}
              className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold flex items-center gap-1 cursor-pointer"
            >
              <ChevronLeft size={14} />
              <span>Chữ trước</span>
            </button>

            <span className="text-slate-400 font-bold">
              {currentIndex + 1} / {list.length} chữ
            </span>

            <button
              type="button"
              onClick={handleNext}
              className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold flex items-center gap-1 cursor-pointer"
            >
              <span>Chữ tiếp theo</span>
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
