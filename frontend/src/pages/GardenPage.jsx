import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Sprout,
  Droplets,
  Sun,
  Award,
  BookOpen,
  Sparkles,
  ArrowRight,
  TreeDeciduous,
  TreePine,
  Flower2,
  CheckCircle2,
  Zap
} from 'lucide-react';
import { sounds } from '../services/sounds';
import confetti from 'canvas-confetti';

export default function GardenPage() {
  const { guestProgress, setActiveTab, setSelectedLesson, gamification } = useApp();
  const [watering, setWatering] = useState(false);
  const [waterBonus, setWaterBonus] = useState(false);

  const totalWords = 1512;
  const masteredCount = Object.values(guestProgress).filter((p) => p.status === 'mastered').length;
  const percentage = Math.min(100, Math.round((masteredCount / totalWords) * 100));

  // Determine bonsai stage
  let stage = 1;
  let stageName = 'Hạt Mầm Khởi Đầu';
  let stageDesc = 'Cây tri thức vừa đâm chồi xanh biếc trong chậu sứ Tokyo, rễ non đang bám dần vào kiến thức nền tảng.';

  if (masteredCount >= 500) {
    stage = 4;
    stageName = 'Đại Thụ Hoàng Kim';
    stageDesc = 'Cây đại thụ uy nghi trĩu hoa vàng hoàng kim — Toàn bộ từ vựng đã khắc sâu vào trí nhớ dài hạn vĩnh viễn!';
  } else if (masteredCount >= 200) {
    stage = 3;
    stageName = 'Bonsai Trưởng Thành';
    stageDesc = 'Tán lá tròn đầy, hoa anh đào nở rộ phớt hồng rực rỡ, phản xạ tiếng Nhật tự nhiên như người bản xứ.';
  } else if (masteredCount >= 50) {
    stage = 2;
    stageName = 'Bonsai Niên Thiếu';
    stageDesc = 'Thân gỗ uốn lượn phong cách Moyogi kiên cường, cành lá vươn cao đón ánh nắng rực rỡ.';
  }

  const handleWater = () => {
    sounds.playCorrect();
    setWatering(true);
    confetti({ particleCount: 60, spread: 60, origin: { y: 0.6 } });
    setTimeout(() => {
      setWatering(false);
      setWaterBonus(true);
    }, 600);
  };

  const stagesList = [
    {
      num: 1,
      title: 'Hạt Mầm Khởi Đầu',
      words: '0 - 49 từ',
      icon: Sprout,
      color: 'text-emerald-500 bg-emerald-50 border-emerald-200'
    },
    {
      num: 2,
      title: 'Bonsai Niên Thiếu',
      words: '50 - 199 từ',
      icon: TreePine,
      color: 'text-teal-600 bg-teal-50 border-teal-200'
    },
    {
      num: 3,
      title: 'Bonsai Trưởng Thành',
      words: '200 - 499 từ',
      icon: Flower2,
      color: 'text-pink-600 bg-pink-50 border-pink-200'
    },
    {
      num: 4,
      title: 'Đại Thụ Hoàng Kim',
      words: '500+ từ',
      icon: TreeDeciduous,
      color: 'text-amber-600 bg-amber-50 border-amber-200'
    }
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16 animate-in fade-in duration-300">
      {/* ── 1. HEADER BANNER ── */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-pink-100 shadow-sm relative overflow-hidden">
        <div className="absolute right-4 top-2 text-pink-100/50 font-jp font-black text-8xl pointer-events-none select-none">
          庭
        </div>

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 font-extrabold text-[11px] uppercase tracking-wider mb-2.5">
            <Sprout size={13} className="text-emerald-600" />
            <span>VƯỜN BONSAI SRS • TRÍ NHỚ VĨNH VIỄN</span>
          </div>

          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-snug mb-1.5">
            Vườn Cây Trí Nhớ (Spaced Repetition)
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-2xl mb-0">
            Mỗi từ vựng bạn học và thành thạo sẽ hóa thành một giọt nước dinh dưỡng nuôi dưỡng cây Bonsai tri thức phát triển qua 4 giai đoạn sinh trưởng.
          </p>
        </div>
      </div>

      {/* ── 2. MAIN BONSAI SHOWCASE CARD ── */}
      <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-b from-white via-pink-50/20 to-emerald-50/30 border border-pink-100 shadow-lotus text-center space-y-6 relative overflow-hidden">
        {/* Floating Petals Decor */}
        <div className="w-20 h-20 rounded-full bg-pink-300/20 blur-xl absolute top-8 left-1/4 pointer-events-none" />
        <div className="w-24 h-24 rounded-full bg-emerald-300/20 blur-xl absolute bottom-8 right-1/4 pointer-events-none" />

        {/* Tree SVG Illustration Container */}
        <div className="relative z-10 py-4">
          <div
            className={`w-40 h-40 sm:w-48 sm:h-48 mx-auto rounded-full bg-gradient-to-tr from-pink-100 via-emerald-100 to-white flex items-center justify-center shadow-inner border border-white transition-transform ${
              watering ? 'scale-110 rotate-3' : ''
            }`}
          >
            {stage === 1 && <Sprout size={72} className="text-emerald-600 animate-pulse" />}
            {stage === 2 && <TreePine size={80} className="text-teal-600" />}
            {stage === 3 && <Flower2 size={88} className="text-pink-600" />}
            {stage === 4 && <TreeDeciduous size={96} className="text-amber-600" />}
          </div>

          <div className="mt-5 space-y-1">
            <span className="px-3.5 py-1 rounded-full bg-pink-100 text-pink-700 font-black text-xs uppercase tracking-wide">
              Cấp Độ {stage}/4 • {stageName}
            </span>
            <p className="text-xs text-slate-600 max-w-md mx-auto pt-2 leading-relaxed">
              {stageDesc}
            </p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="max-w-md mx-auto space-y-2">
          <div className="flex justify-between text-xs font-bold text-slate-500">
            <span>Tiến độ nuôi cây ({masteredCount}/{totalWords} từ thành thạo)</span>
            <span className="text-emerald-600 font-black">{percentage}%</span>
          </div>
          <div className="w-full h-3 rounded-full bg-pink-100 overflow-hidden p-0.5">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-teal-400 to-pink-500 transition-all duration-700"
              style={{ width: `${Math.max(4, percentage)}%` }}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={handleWater}
            disabled={watering}
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-600 text-white font-extrabold text-xs sm:text-sm shadow-md hover:scale-105 active:scale-95 transition-all inline-flex items-center gap-2 cursor-pointer"
          >
            <Droplets size={16} />
            <span>Tưới nước hôm nay (+15 XP)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              sounds.playFlip();
              setActiveTab('lessons');
            }}
            className="px-6 py-3 rounded-2xl bg-white border border-pink-200 text-pink-700 hover:bg-pink-50 font-extrabold text-xs sm:text-sm shadow-sm hover:scale-105 active:scale-95 transition-all inline-flex items-center gap-2 cursor-pointer"
          >
            <BookOpen size={16} />
            <span>Học thêm từ mới</span>
          </button>
        </div>

        {waterBonus && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold inline-flex items-center gap-1.5 animate-in fade-in">
            <CheckCircle2 size={15} />
            <span>Đã tưới nước thành công! Cây tri thức tràn đầy năng lượng xanh.</span>
          </div>
        )}
      </div>

      {/* ── 3. 4 STAGES GRID ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {stagesList.map((stg) => {
          const Icon = stg.icon;
          const isReached = stage >= stg.num;
          return (
            <div
              key={stg.num}
              className={`p-4 rounded-2xl border text-center space-y-2 transition-all ${
                isReached
                  ? 'bg-white border-pink-200 shadow-sm'
                  : 'bg-slate-50/70 border-slate-200 opacity-60'
              }`}
            >
              <div
                className={`w-10 h-10 mx-auto rounded-xl flex items-center justify-center border ${stg.color}`}
              >
                <Icon size={20} />
              </div>
              <div>
                <h4 className="font-bold text-xs text-slate-800">{stg.title}</h4>
                <span className="text-[10px] text-slate-400 font-medium block">{stg.words}</span>
              </div>
              {isReached ? (
                <span className="text-[10px] font-extrabold text-emerald-600 block">✓ Đã đạt</span>
              ) : (
                <span className="text-[10px] font-bold text-slate-400 block">Đang khóa</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
