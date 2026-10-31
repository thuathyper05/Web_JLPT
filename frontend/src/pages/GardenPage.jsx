import React from 'react';
import { useApp } from '../context/AppContext';
import { Sprout, Droplets, Sun, Award, BookOpen, Sparkles, ArrowRight } from 'lucide-react';
import { sounds } from '../services/sounds';

export default function GardenPage() {
  const { guestProgress, setActiveTab, setSelectedLesson } = useApp();

  const totalWords = 1589;
  const masteredCount = Object.values(guestProgress).filter((p) => p.status === 'mastered').length;
  const percentage = Math.min(100, Math.round((masteredCount / totalWords) * 100));

  // Determine bonsai stage
  let stage = 1;
  let stageName = 'Mầm Non Khởi Đầu';
  let stageDesc = 'Cây tri thức vừa đâm chồi xanh biếc trong chậu sứ Tokyo, rễ non đang bám dần vào kiến thức nền tảng.';

  if (masteredCount >= 500) {
    stage = 4;
    stageName = 'Đại Thụ Hoàng Kim';
    stageDesc = 'Cây đại thụ uy nghi trĩu quả vàng hoàng kim — Toàn bộ từ vựng đã khắc sâu vào trí nhớ dài hạn vĩnh viễn!';
  } else if (masteredCount >= 200) {
    stage = 3;
    stageName = 'Bonsai Trưởng Thành';
    stageDesc = 'Tán lá tròn đầy, hoa anh đào nở rộ phớt hồng rực rỡ, phản xạ tiếng Nhật tự nhiên như người bản xứ.';
  } else if (masteredCount >= 50) {
    stage = 2;
    stageName = 'Bonsai Niên Thiếu';
    stageDesc = 'Thân gỗ uốn lượn phong cách Moyogi kiên cường, cành lá vươn cao đón ánh nắng rực rỡ.';
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-pink-100 shadow-sm relative overflow-hidden">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 font-extrabold text-[11px] uppercase tracking-wider mb-2.5">
          <Sprout size={13} className="text-emerald-600" />
          <span>VƯỜN BONSAI SRS • TRÍ NHỚ VĨNH VIỄN</span>
        </div>

        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-snug mb-1.5">
          Vườn Cây Trí Nhớ (Spaced Repetition)
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-2xl mb-0">
          Mỗi từ vựng bạn học và thành thạo sẽ hóa thành một giọt nước dinh dưỡng nuôi dưỡng cây Bonsai tri thức phát triển qua 4 giai đoạn.
        </p>
      </div>

      {/* Main Bonsai Showcase Card */}
      <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-b from-white via-pink-50/20 to-emerald-50/30 border border-pink-100 shadow-lotus text-center space-y-6 relative overflow-hidden">
        {/* Floating Petals Decor */}
        <div className="w-16 h-16 rounded-full bg-pink-300/20 blur-xl absolute top-8 left-1/4 pointer-events-none" />
        <div className="w-20 h-20 rounded-full bg-emerald-300/20 blur-xl absolute bottom-8 right-1/4 pointer-events-none" />

        {/* Tree SVG Illustration */}
        <div className="relative z-10 py-4">
          <div className="w-40 h-40 sm:w-48 sm:h-48 mx-auto rounded-full bg-gradient-to-tr from-pink-100 via-emerald-100 to-white flex items-center justify-center shadow-inner border border-white">
            <span className="text-7xl sm:text-8xl select-none animate-pulse-subtle">
              {stage === 1 ? '🌱' : stage === 2 ? '🪴' : stage === 3 ? '🌸' : '🌳'}
            </span>
          </div>

          <div className="mt-5 space-y-1">
            <span className="px-3 py-1 rounded-full bg-pink-100 text-pink-700 font-extrabold text-xs">
              Cấp Độ {stage}/4 • {stageName}
            </span>
            <p className="text-xs text-slate-600 max-w-md mx-auto pt-2">
              {stageDesc}
            </p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="max-w-md mx-auto space-y-2">
          <div className="flex justify-between text-xs font-bold text-slate-500">
            <span>Tiến độ nuôi cây ({masteredCount}/{totalWords} từ)</span>
            <span className="text-emerald-600">{percentage}%</span>
          </div>
          <div className="w-full h-3 rounded-full bg-pink-100 overflow-hidden p-0.5">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-teal-400 to-pink-500 transition-all duration-700"
              style={{ width: `${Math.max(4, percentage)}%` }}
            />
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-2">
          <button
            type="button"
            onClick={() => {
              sounds.playFlip();
              setActiveTab('lessons');
            }}
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-500 text-white font-extrabold text-xs sm:text-sm shadow-md hover:scale-105 active:scale-95 transition-all inline-flex items-center gap-2"
          >
            <span>Tưới nước bằng cách học thêm từ mới</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
