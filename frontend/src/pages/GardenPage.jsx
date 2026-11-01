import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { vocabService, speakJapanese } from '../services/api';
import { sounds } from '../services/sounds';
import FuriganaWord from '../components/FuriganaWord';
import {
  Sprout,
  Droplets,
  Sun,
  Award,
  BookOpen,
  Sparkles,
  TreePine,
  CheckCircle2,
  Volume2,
  Clock,
  Layers,
  Heart,
  Flower2,
  Scissors,
  Flame,
  CloudRain,
  Moon,
  Wind,
  ShieldCheck,
  Check,
  Play
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function GardenPage() {
  const { currentLevel, guestProgress, setActiveTab, setSelectedLesson, askAi, recordWordProgress } = useApp();

  const [allWords, setAllWords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStageTab, setSelectedStageTab] = useState(1);

  // Garden Vitals & Interactions
  const [moisture, setMoisture] = useState(88);
  const [vitality, setVitality] = useState(92);
  const [zenMood, setZenMood] = useState('sakura'); // 'morning' | 'sakura' | 'rain' | 'night'
  const [activeAction, setActiveAction] = useState(null); // 'watering' | 'pruning' | 'fertilizing'
  const [actionSuccessMsg, setActionSuccessMsg] = useState('');
  const [petalsCollected, setPetalsCollected] = useState(18);

  useEffect(() => {
    const fetchVocabs = async () => {
      setLoading(true);
      try {
        const res = await vocabService.getVocabularies({ level: currentLevel || 'N5' });
        setAllWords(res.data?.data || []);
      } catch (err) {
        console.error('Garden fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchVocabs();
  }, [currentLevel]);

  const totalWords = 1512;
  const masteredCount = Object.values(guestProgress).filter((p) => p && typeof p === 'object' && p.status === 'mastered').length;
  const overallPercentage = Math.min(100, Math.round((masteredCount / totalWords) * 100));

  // Partition words into 4 SRS Trays based on learning history
  const masteredList = allWords.filter((w) => guestProgress[w.id]?.status === 'mastered');
  const reviewList = allWords.filter((w) => guestProgress[w.id]?.status === 'needs_review');
  const unstudiedList = allWords.filter((w) => !guestProgress[w.id]);

  // Stage 1 (Mầm non): Words needing review or first lessons
  const stage1Words = reviewList.length > 0 ? reviewList : unstudiedList.slice(0, 10);
  // Stage 2 (Bén rễ): Mastered 1..20
  const stage2Words = masteredList.slice(0, 15);
  // Stage 3 (Tán lá xanh): Mastered 21..50
  const stage3Words = masteredList.slice(15, 40);
  // Stage 4 (Cổ thụ hoàng kim): Mastered 50+
  const stage4Words = masteredList.slice(40);

  // Determine current active Bonsai tier
  let bonsaiTier = 1;
  let bonsaiName = 'Khay Ươm Hạt Mầm Hồi Sinh';
  let bonsaiSub = 'Chu kỳ ôn tập 24 giờ';
  let bonsaiDesc = 'Những hạt mầm từ vựng mới đang đâm chồi xanh non. Tưới nước và ôn tập đều đặn sau mỗi 24 giờ để rễ bám chắc vào trí nhớ ngắn hạn.';
  let bonsaiAccent = 'from-emerald-500 via-teal-500 to-emerald-600';

  if (masteredCount >= 200) {
    bonsaiTier = 4;
    bonsaiName = 'Đại Thụ Cổ Hoàng Kim Vĩnh Viễn';
    bonsaiSub = 'Vùng nhớ vĩnh viễn';
    bonsaiDesc = 'Tán lá vàng óng ánh phủ bóng tri thức. Toàn bộ từ vựng đã chuyển hẳn sang vùng nhớ dài hạn vĩnh viễn, phản xạ tức thì không cần dịch nhẩm!';
    bonsaiAccent = 'from-amber-400 via-yellow-500 to-amber-600';
  } else if (masteredCount >= 80) {
    bonsaiTier = 3;
    bonsaiName = 'Bonsai Hoa Anh Đào Rực Rỡ';
    bonsaiSub = 'Phản xạ tự nhiên';
    bonsaiDesc = 'Dáng thế Moyogi kiên cường, sắc hoa hồng sen rực rỡ. Phản xạ tiếng Nhật tự nhiên như người bản xứ qua chu kỳ 7 ngày bền bỉ.';
    bonsaiAccent = 'from-pink-500 via-rose-500 to-pink-600';
  } else if (masteredCount >= 20) {
    bonsaiTier = 2;
    bonsaiName = 'Bonsai Tùng Tuyết Nhật Bản';
    bonsaiSub = 'Vững vàng bén rễ';
    bonsaiDesc = 'Thân gỗ uốn lượn vươn nhánh xanh tốt đón ánh dương. Rễ cây đã vững chãi qua chu kỳ ôn tập ngắt quãng 3 ngày và 7 ngày.';
    bonsaiAccent = 'from-teal-500 via-emerald-600 to-teal-700';
  }

  // Interactive Gardening Action 1: Tưới Nước
  const handleWater = () => {
    sounds.playCorrect();
    setActiveAction('watering');
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.6 },
      colors: ['#38bdf8', '#0284c7', '#ec4899', '#34d399']
    });

    setTimeout(() => {
      setMoisture(100);
      setVitality((prev) => Math.min(100, prev + 5));
      setActiveAction(null);
      setActionSuccessMsg('Đã tưới nước thanh mát! Đất vườn đạt độ ẩm 100%, rễ cây hút no sinh khí.');
      setTimeout(() => setActionSuccessMsg(''), 3500);
    }, 700);
  };

  // Interactive Gardening Action 2: Tỉa Cành
  const handlePrune = () => {
    sounds.playFlip();
    setActiveAction('pruning');
    setTimeout(() => {
      setVitality((prev) => Math.min(100, prev + 8));
      setActiveAction(null);
      setActionSuccessMsg('Đã tỉa sạch cành khô và cỏ dại! Bonsai vươn dáng thanh tao, dáng thế hoàn mỹ.');
      setTimeout(() => setActionSuccessMsg(''), 3500);
    }, 600);
  };

  // Interactive Gardening Action 3: Thu Hoạch Cánh Hoa Tri Thức
  const handleHarvestPetals = () => {
    if (petalsCollected <= 0) return;
    sounds.playLevelUp();
    confetti({
      particleCount: 70,
      spread: 75,
      origin: { y: 0.5 },
      colors: ['#f43f5e', '#fb7185', '#fda4af', '#fef08a']
    });
    const count = petalsCollected;
    setPetalsCollected(0);
    setActionSuccessMsg(`Đã thu hoạch thành công ${count} Cánh Hoa Tri Thức tích lũy vào kho báu!`);
    setTimeout(() => setActionSuccessMsg(''), 4000);
  };

  const stagesMeta = [
    {
      stage: 1,
      title: 'Hạt Mầm Mới',
      srsCycle: 'Chu kỳ 24h',
      count: stage1Words.length,
      icon: Sprout,
      color: 'text-emerald-600 bg-emerald-50 border-emerald-200'
    },
    {
      stage: 2,
      title: 'Bén Rễ Sơ Cấp',
      srsCycle: 'Chu kỳ 3 ngày',
      count: stage2Words.length,
      icon: TreePine,
      color: 'text-teal-600 bg-teal-50 border-teal-200'
    },
    {
      stage: 3,
      title: 'Tán Lá Xanh',
      srsCycle: 'Chu kỳ 7 ngày',
      count: stage3Words.length,
      icon: Flower2,
      color: 'text-pink-600 bg-pink-50 border-pink-200'
    },
    {
      stage: 4,
      title: 'Cổ Thụ Vĩnh Viễn',
      srsCycle: 'Bộ nhớ dài hạn',
      count: stage4Words.length,
      icon: Award,
      color: 'text-amber-600 bg-amber-50 border-amber-200'
    }
  ];

  const getActiveTrayWords = () => {
    switch (selectedStageTab) {
      case 1:
        return stage1Words;
      case 2:
        return stage2Words;
      case 3:
        return stage3Words;
      case 4:
        return stage4Words;
      default:
        return stage1Words;
    }
  };

  const activeWords = getActiveTrayWords();

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16 animate-in fade-in duration-300">
      {/* ── 1. ZEN COURTYARD HEADER BANNER ── */}
      <div className="p-6 sm:p-7 rounded-3xl bg-gradient-to-r from-slate-900 via-rose-950 to-slate-900 text-white relative overflow-hidden shadow-lg border border-pink-900/30">
        <div className="absolute right-4 top-2 text-white/5 font-jp font-black text-8xl pointer-events-none select-none">
          庭
        </div>

        <div className="relative z-10 space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/20 text-pink-300 font-extrabold text-[11px] uppercase tracking-wider border border-pink-400/30 backdrop-blur-md">
              <Sprout size={13} className="text-pink-400" />
              <span>KHU VƯỜN BONSAI SRS - QUẢN LÝ VÙNG NHỚ DÀI HẠN</span>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-white text-xs font-bold border border-white/15 backdrop-blur-md">
              <Award size={14} className="text-amber-400" />
              <span>Vững rễ: <strong>{masteredCount}</strong>/{totalWords} từ</span>
            </div>
          </div>

          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-snug">
            Vườn Bonsai Tri Thức & Ghi Nhớ Ngắt Quãng
          </h1>
          <p className="text-xs sm:text-sm text-pink-100/80 max-w-2xl mb-0 leading-relaxed">
            Ứng dụng thuật toán Spaced Repetition (SRS) mô phỏng sinh trưởng tự nhiên. Chăm sóc Bonsai và ôn tập đúng các mốc thời gian vàng (24h, 3 ngày, 7 ngày) để biến từ vựng thành phản xạ vô thức.
          </p>
        </div>
      </div>

      {/* ── 2. HERO ZEN BONSAI CANVAS & VIBRANT ATMOSPHERE ── */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-pink-100 shadow-sm relative overflow-hidden">
        {/* Weather / Mood Selector Bar */}
        <div className="flex items-center justify-between gap-3 mb-6 flex-wrap pb-4 border-b border-slate-100">
          <div className="flex items-center gap-1.5">
            <Sparkles size={15} className="text-pink-600" />
            <span className="text-xs font-bold text-slate-800">Không khí thiền định:</span>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-2xl">
            <button
              type="button"
              onClick={() => { sounds.playFlip(); setZenMood('morning'); }}
              className={`px-2.5 py-1 rounded-xl text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                zenMood === 'morning'
                  ? 'bg-white text-amber-600 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Sun size={13} className="text-amber-500" />
              <span>Nắng Ban Mai</span>
            </button>

            <button
              type="button"
              onClick={() => { sounds.playFlip(); setZenMood('sakura'); }}
              className={`px-2.5 py-1 rounded-xl text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                zenMood === 'sakura'
                  ? 'bg-white text-pink-600 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Flower2 size={13} className="text-pink-500" />
              <span>Hoa Anh Đào</span>
            </button>

            <button
              type="button"
              onClick={() => { sounds.playFlip(); setZenMood('rain'); }}
              className={`px-2.5 py-1 rounded-xl text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                zenMood === 'rain'
                  ? 'bg-white text-blue-600 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <CloudRain size={13} className="text-blue-500" />
              <span>Mưa Rào Hạ</span>
            </button>

            <button
              type="button"
              onClick={() => { sounds.playFlip(); setZenMood('night'); }}
              className={`px-2.5 py-1 rounded-xl text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                zenMood === 'night'
                  ? 'bg-white text-purple-600 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Moon size={13} className="text-purple-500" />
              <span>Đêm Trăng Zen</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* LEFT 5 COLS: ENCHANTING BONSAI ART SCENE */}
          <div className="lg:col-span-5 flex flex-col items-center text-center space-y-4">
            {/* Bonsai Art Garden Canvas */}
            <div
              className={`relative w-72 h-76 sm:w-80 sm:h-84 rounded-3xl p-6 border shadow-inner flex flex-col items-center justify-between overflow-hidden transition-all duration-700 ${
                zenMood === 'morning'
                  ? 'bg-gradient-to-b from-amber-50/80 via-rose-50/30 to-amber-100/40 border-amber-200/70'
                  : zenMood === 'rain'
                  ? 'bg-gradient-to-b from-slate-100 via-blue-50/50 to-teal-50/40 border-blue-200/70'
                  : zenMood === 'night'
                  ? 'bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-950 border-indigo-900 text-white'
                  : 'bg-gradient-to-b from-rose-50/90 via-pink-50/40 to-emerald-50/40 border-pink-200/80'
              }`}
            >
              {/* Floating Atmosphere Elements */}
              {zenMood === 'sakura' && (
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                  <div className="w-2.5 h-2.5 rounded-full bg-pink-300/60 blur-2xs absolute top-4 left-6 animate-pulse" />
                  <div className="w-2 h-2 rounded-full bg-rose-400/50 blur-2xs absolute top-12 right-8 animate-bounce" />
                  <div className="w-3 h-3 rounded-full bg-pink-300/40 blur-2xs absolute bottom-16 left-10 animate-ping" />
                </div>
              )}

              {zenMood === 'night' && (
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                  <div className="w-8 h-8 rounded-full bg-amber-200/80 blur-xs absolute top-4 right-6 shadow-amber-300" />
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-300 animate-ping absolute top-14 left-10" />
                </div>
              )}

              {/* Water Splash Overlay */}
              {activeAction === 'watering' && (
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white/70 backdrop-blur-xs animate-in fade-in">
                  <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center animate-bounce mb-1">
                    <Droplets size={24} />
                  </div>
                  <span className="text-xs font-black text-blue-700">Đang tưới nước tinh khiết...</span>
                </div>
              )}

              {/* Prune Overlay */}
              {activeAction === 'pruning' && (
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white/70 backdrop-blur-xs animate-in fade-in">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center animate-spin mb-1">
                    <Scissors size={24} />
                  </div>
                  <span className="text-xs font-black text-emerald-700">Đang tỉa tót tán lá...</span>
                </div>
              )}

              {/* Top Tier Badge */}
              <div className="relative z-10 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/90 border border-pink-100 text-[11px] font-bold text-slate-700 shadow-xs">
                <span className={`w-2 h-2 rounded-full bg-gradient-to-r ${bonsaiAccent}`} />
                <span>Cấp độ {bonsaiTier}: {bonsaiName}</span>
              </div>

              {/* Majestic Stylized Bonsai Graphic */}
              <div className="relative z-10 flex flex-col items-center justify-center my-auto transition-transform duration-500 hover:scale-105">
                {/* Bonsai Cloud Foliage */}
                <div className="relative flex items-center justify-center">
                  <div className={`w-32 h-24 sm:w-36 sm:h-26 rounded-full bg-gradient-to-tr ${bonsaiAccent} shadow-md opacity-95 flex items-center justify-center relative`}>
                    <div className="w-16 h-10 rounded-full bg-white/25 blur-xs absolute -top-1 left-3" />
                    <span className="font-jp text-white font-black text-3xl select-none drop-shadow-xs">
                      {bonsaiTier >= 4 ? '金' : bonsaiTier === 3 ? '桜' : bonsaiTier === 2 ? '松' : '芽'}
                    </span>
                  </div>
                  {/* Left Canopy Cloud */}
                  <div className={`w-16 h-12 rounded-full bg-gradient-to-tr ${bonsaiAccent} shadow-sm absolute -left-5 top-2 opacity-90`} />
                  {/* Right Canopy Cloud */}
                  <div className={`w-16 h-12 rounded-full bg-gradient-to-tr ${bonsaiAccent} shadow-sm absolute -right-5 top-4 opacity-90`} />
                </div>

                {/* Zen Bonsai Trunk Graphic */}
                <svg width="80" height="60" viewBox="0 0 80 60" fill="none" className="mt-1">
                  <path
                    d="M40 0 C38 18 26 28 32 45 C34 52 36 56 40 60"
                    stroke="#5c361e"
                    strokeWidth="9"
                    strokeLinecap="round"
                  />
                  <path
                    d="M31 24 C22 20 16 16 12 15"
                    stroke="#5c361e"
                    strokeWidth="4.5"
                    strokeLinecap="round"
                  />
                  <path
                    d="M35 34 C44 30 52 26 58 25"
                    stroke="#5c361e"
                    strokeWidth="4.5"
                    strokeLinecap="round"
                  />
                </svg>

                {/* Glazed Ceramic Japanese Pot */}
                <div className="w-40 h-7 rounded-b-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-t-2 border-amber-400 shadow-md flex items-center justify-center">
                  <div className="w-28 h-1 rounded-full bg-white/20" />
                </div>
              </div>

              {/* Bottom Botanical Subtext */}
              <div className="relative z-10 text-[11px] font-bold text-slate-500">
                {bonsaiSub}
              </div>
            </div>

            {/* 3 Interactive Gardening Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
              <button
                type="button"
                onClick={handleWater}
                disabled={activeAction !== null}
                className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-teal-500 hover:from-blue-500 hover:to-teal-600 text-white font-bold text-xs shadow-xs flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                <Droplets size={14} fill="white" />
                <span>Tưới nước</span>
              </button>

              <button
                type="button"
                onClick={handlePrune}
                disabled={activeAction !== null}
                className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-700 text-white font-bold text-xs shadow-xs flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                <Scissors size={14} />
                <span>Tỉa cành</span>
              </button>

              <button
                type="button"
                onClick={handleHarvestPetals}
                disabled={petalsCollected <= 0}
                className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-pink-600 to-rose-500 hover:from-pink-500 hover:to-rose-600 text-white font-bold text-xs shadow-xs flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95 disabled:opacity-40 cursor-pointer"
              >
                <Flower2 size={14} />
                <span>Thu hoạch hoa ({petalsCollected})</span>
              </button>
            </div>
          </div>

          {/* RIGHT 7 COLS: BOTANICAL METRICS & WISDOM */}
          <div className="lg:col-span-7 space-y-4">
            <div>
              <span className="text-[10.5px] font-black text-pink-600 uppercase tracking-wider block mb-1">
                TÌNH TRẠNG SINH TRƯỞNG - GIAI ĐOẠN {bonsaiTier}
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mb-1">
                {bonsaiName}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-0">
                {bonsaiDesc}
              </p>
            </div>

            {/* Action Success Alert Notification */}
            {actionSuccessMsg && (
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-in fade-in shadow-2xs">
                <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                <span>{actionSuccessMsg}</span>
              </div>
            )}

            {/* Environmental Meters (Moisture & Vitality) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {/* Moisture Meter */}
              <div className="p-3.5 rounded-2xl bg-slate-50/70 border border-slate-200/80 space-y-1.5">
                <div className="flex justify-between items-center text-xs font-bold text-slate-700">
                  <span className="flex items-center gap-1.5 text-blue-600 font-black">
                    <Droplets size={14} />
                    <span>Độ ẩm đất</span>
                  </span>
                  <span className="font-black text-blue-700">{moisture}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-blue-100 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-blue-400 to-blue-600 transition-all duration-700"
                    style={{ width: `${moisture}%` }}
                  />
                </div>
                <span className="text-[10px] text-slate-400 block font-medium">
                  {moisture >= 80 ? 'Đất tơi xốp, vi chất dồi dào' : 'Cần 1 gáo nước duy trì độ ẩm'}
                </span>
              </div>

              {/* Vitality Meter */}
              <div className="p-3.5 rounded-2xl bg-slate-50/70 border border-slate-200/80 space-y-1.5">
                <div className="flex justify-between items-center text-xs font-bold text-slate-700">
                  <span className="flex items-center gap-1.5 text-emerald-600 font-black">
                    <Sparkles size={14} />
                    <span>Sinh lực Bonsai</span>
                  </span>
                  <span className="font-black text-emerald-700">{vitality}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-emerald-100 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600 transition-all duration-700"
                    style={{ width: `${vitality}%` }}
                  />
                </div>
                <span className="text-[10px] text-slate-400 block font-medium">
                  Tán lá xanh tươi, rễ bám vững vàng
                </span>
              </div>
            </div>

            {/* SRS Memory Long-Term Mastery Bar */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-pink-50/50 via-rose-50/30 to-purple-50/40 border border-pink-100 space-y-2">
              <div className="flex justify-between items-center text-xs font-bold">
                <span className="flex items-center gap-1.5 text-pink-700 font-black">
                  <Award size={15} className="text-pink-600" />
                  <span>Bộ nhớ dài hạn vĩnh viễn (Mastery)</span>
                </span>
                <span className="font-black text-pink-700">{overallPercentage}%</span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-pink-100 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-pink-500 via-rose-500 to-purple-500 transition-all duration-700"
                  style={{ width: `${overallPercentage}%` }}
                />
              </div>
              <div className="flex justify-between text-[10.5px] text-slate-500 font-medium">
                <span>{masteredCount} từ chuyển hẳn sang phản xạ tự nhiên</span>
                <span>Mục tiêu: {totalWords} từ {currentLevel}</span>
              </div>
            </div>

            {/* AI Sensei Wisdom Card */}
            <div className="p-3.5 rounded-2xl bg-white border border-pink-100 flex items-center justify-between gap-3 shadow-2xs">
              <div className="flex items-start gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-pink-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Sparkles size={16} />
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-900 mb-0.5">
                    Lời Khuyên Từ AI Sensei Về Spaced Repetition
                  </h4>
                  <p className="text-[11px] text-slate-600 mb-0 max-w-md">
                    Ôn tập ngắt quãng đúng thời điểm kích thích đường truyền thần kinh, biến trí nhớ ngắn hạn thành phản xạ bền vững.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  askAi(
                    'explain_vocab',
                    {
                      word: 'Bonsai Spaced Repetition System',
                      lesson_title: 'Đường cong quên lãng Ebbinghaus'
                    },
                    'AI Sensei: Bí Quyết Ghi Nhớ Tiếng Nhật Vĩnh Viễn'
                  )
                }
                className="px-3 py-1.5 rounded-xl bg-pink-50 text-pink-700 font-bold text-xs border border-pink-200 hover:bg-pink-100 transition-colors cursor-pointer shrink-0"
              >
                Hỏi AI bí quyết
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── 3. 4 KHAY ƯƠM TRÍ NHỚ (SRS INTERACTIVE TABS) ── */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-black text-slate-900 tracking-tight">
            4 Khay Ươm Trí Nhớ Spaced Repetition
          </h3>
          <p className="text-xs text-slate-500 mb-0">
            Chạm vào từng khay để xem danh sách từ vựng đang ở chu kỳ ôn tập tương ứng.
          </p>
        </div>

        {/* 4 Interactive Trays Grid Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {stagesMeta.map((s) => {
            const Icon = s.icon;
            const isSelected = selectedStageTab === s.stage;

            return (
              <button
                key={s.stage}
                type="button"
                onClick={() => {
                  sounds.playFlip();
                  setSelectedStageTab(s.stage);
                }}
                className={`p-4 rounded-2xl border text-left transition-all cursor-pointer relative ${
                  isSelected
                    ? 'bg-white border-pink-500 ring-2 ring-pink-500/20 shadow-md scale-[1.02]'
                    : 'bg-white/80 border-slate-200/90 hover:border-pink-200 hover:bg-white shadow-2xs'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center border ${s.color}`}>
                    <Icon size={17} />
                  </div>
                  <span className="text-xs font-black text-slate-800 bg-slate-100 px-2 py-0.5 rounded-full">
                    {s.count} từ
                  </span>
                </div>

                <div className="font-black text-xs text-slate-900 mb-0.5">
                  {s.title}
                </div>
                <div className="text-[10.5px] font-semibold text-slate-500">
                  {s.srsCycle}
                </div>
              </button>
            );
          })}
        </div>

        {/* Active Tray Vocabularies Display */}
        <div className="p-5 sm:p-6 rounded-3xl bg-white border border-pink-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between gap-3 flex-wrap border-b border-slate-100 pb-3">
            <div>
              <h4 className="font-black text-sm text-slate-900 mb-0.5">
                Danh Sách Từ Vựng Trong Khay {selectedStageTab}
              </h4>
              <p className="text-[11px] text-slate-500 mb-0">
                Chạm biểu tượng loa để nghe phát âm Tokyo bản xứ chuẩn xác.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                sounds.playFlip();
                setActiveTab('flashcard');
              }}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-pink-600 to-rose-500 hover:from-pink-500 hover:to-rose-600 text-white font-bold text-xs shadow-lotus flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              <Play size={13} fill="white" />
              <span>Luyện Flashcard khay này</span>
            </button>
          </div>

          {activeWords.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {activeWords.map((word) => (
                <div
                  key={word.id}
                  className="p-3.5 rounded-2xl bg-slate-50/60 hover:bg-pink-50/30 border border-slate-200/80 hover:border-pink-200 transition-all flex items-center justify-between group"
                >
                  <div className="flex flex-col">
                    <FuriganaWord
                      kanji={word.kanji}
                      kana={word.clean_kana || word.kana}
                      size="base"
                      kanjiClassName="text-slate-900 font-black"
                      furiganaClassName="text-pink-600 font-bold"
                    />
                    <span className="text-xs font-semibold text-slate-600 mt-1 line-clamp-1">
                      {word.clean_vietnamese || word.vietnamese}
                    </span>
                    {word.romaji && (
                      <span className="text-[10px] font-mono text-slate-400">
                        {word.romaji}
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => speakJapanese(word.clean_kana || word.kana || word.kanji)}
                    className="p-2 rounded-xl bg-white hover:bg-pink-100 text-slate-500 hover:text-pink-600 border border-slate-200 group-hover:border-pink-200 transition-colors cursor-pointer shrink-0"
                    title="Nghe phát âm chuẩn Tokyo"
                  >
                    <Volume2 size={15} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-slate-400 space-y-2">
              <Sprout size={32} className="mx-auto text-slate-300" />
              <p className="text-xs">Chưa có từ vựng nào trong khay này. Hãy học bài mới để ươm thêm mầm non!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
