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
  ArrowRight,
  Flower2,
  TreePine,
  CheckCircle2,
  Zap,
  RotateCcw,
  Volume2,
  Clock,
  Layers,
  Heart,
  Wind
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function GardenPage() {
  const { guestProgress, setActiveTab, setSelectedLesson, gamification, askAi } = useApp();

  const [allWords, setAllWords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStageTab, setSelectedStageTab] = useState(1);
  const [moisture, setMoisture] = useState(72);
  const [isWatering, setIsWatering] = useState(false);
  const [waterSuccessAlert, setWaterSuccessAlert] = useState(false);
  const [floatingXp, setFloatingXp] = useState(false);

  useEffect(() => {
    const fetchVocabs = async () => {
      setLoading(true);
      try {
        const res = await vocabService.getVocabularies({});
        setAllWords(res.data?.data || []);
      } catch (err) {
        console.error('Garden fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchVocabs();
  }, []);

  const totalWords = 1512;
  const masteredCount = Object.values(guestProgress).filter((p) => p.status === 'mastered').length;
  const overallPercentage = Math.min(100, Math.round((masteredCount / totalWords) * 100));

  // Partition words into 4 SRS Trays based on learning history
  const masteredList = allWords.filter((w) => guestProgress[w.id]?.status === 'mastered');
  const reviewList = allWords.filter((w) => guestProgress[w.id]?.status === 'needs_review');
  const unstudiedList = allWords.filter((w) => !guestProgress[w.id]);

  // Stage 1 (Mầm non): Words needing review or first lessons
  const stage1Words = reviewList.length > 0 ? reviewList : unstudiedList.slice(0, 10);
  // Stage 2 (Cây non): Mastered 1..20
  const stage2Words = masteredList.slice(0, 15);
  // Stage 3 (Bonsai trưởng thành): Mastered 21..50
  const stage3Words = masteredList.slice(15, 40);
  // Stage 4 (Cổ thụ hoàng kim): Mastered 50+
  const stage4Words = masteredList.slice(40);

  // Determine current active Bonsai tier
  let bonsaiTier = 1;
  let bonsaiName = 'Khay Ươm Mầm Non';
  let bonsaiSub = 'Hạt mầm tri thức đầu tiên';
  let bonsaiDesc = 'Hạt mầm tri thức tiếng Nhật đâm chồi xanh mướt. Đây là giai đoạn cần tưới nước và lặp lại ngắt quãng mỗi 24 giờ để rễ bám sâu vào tiềm thức.';

  if (masteredCount >= 500) {
    bonsaiTier = 4;
    bonsaiName = 'Đại Thụ Cổ Hoàng Kim';
    bonsaiSub = 'Vùng nhớ vĩnh viễn';
    bonsaiDesc = 'Tán lá vàng óng ánh phủ bóng mát tri thức. Toàn bộ từ vựng đã chuyển hẳn sang vùng nhớ dài hạn vĩnh viễn!';
  } else if (masteredCount >= 200) {
    bonsaiTier = 3;
    bonsaiName = 'Bonsai Hoa Anh Đào';
    bonsaiSub = 'Phản xạ tự nhiên';
    bonsaiDesc = 'Dáng thế Moyogi kiên cường, sắc hoa hồng sen rực rỡ. Phản xạ tiếng Nhật tự nhiên như người bản xứ không cần dịch nhẩm trong đầu.';
  } else if (masteredCount >= 50) {
    bonsaiTier = 2;
    bonsaiName = 'Bonsai Tùng Tuyết Nhật Bản';
    bonsaiSub = 'Vững vàng bén rễ';
    bonsaiDesc = 'Thân gỗ uốn lượn vươn nhánh xanh tốt đón ánh dương. Rễ cây đã vững chãi qua chu kỳ ôn tập ngắt quãng 3 ngày và 7 ngày.';
  }

  const handleWaterBonsai = () => {
    sounds.playCorrect();
    setIsWatering(true);
    setFloatingXp(true);
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.55 },
      colors: ['#db2777', '#f43f5e', '#38bdf8', '#34d399']
    });

    setTimeout(() => {
      setIsWatering(false);
      setMoisture(100);
      setWaterSuccessAlert(true);
      setTimeout(() => setWaterSuccessAlert(false), 4500);
      setTimeout(() => setFloatingXp(false), 2000);
    }, 700);
  };

  const stagesMeta = [
    {
      stage: 1,
      title: 'Khay Ươm Mầm',
      srsCycle: 'Chu kỳ 24h',
      count: stage1Words.length,
      icon: Sprout,
      color: 'text-emerald-600 bg-emerald-50 border-emerald-200'
    },
    {
      stage: 2,
      title: 'Cây Non Bén Rễ',
      srsCycle: 'Chu kỳ 3 ngày',
      count: stage2Words.length,
      icon: TreePine,
      color: 'text-teal-600 bg-teal-50 border-teal-200'
    },
    {
      stage: 3,
      title: 'Bonsai Trưởng Thành',
      srsCycle: 'Chu kỳ 7 ngày',
      count: stage3Words.length,
      icon: Flower2,
      color: 'text-pink-600 bg-pink-50 border-pink-200'
    },
    {
      stage: 4,
      title: 'Cổ Thụ Hoàng Kim',
      srsCycle: 'Trí nhớ vĩnh viễn',
      count: stage4Words.length,
      icon: Award,
      color: 'text-amber-600 bg-amber-50 border-amber-200'
    }
  ];

  let displayedStageWords = [];
  if (selectedStageTab === 1) displayedStageWords = stage1Words;
  else if (selectedStageTab === 2) displayedStageWords = stage2Words;
  else if (selectedStageTab === 3) displayedStageWords = stage3Words;
  else displayedStageWords = stage4Words;

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16 animate-in fade-in duration-300">
      {/* ── 1. HEADER BANNER ── */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-pink-100 shadow-sm relative overflow-hidden">
        <div className="absolute right-4 top-2 text-pink-100/50 font-jp font-black text-8xl pointer-events-none select-none">
          庭
        </div>

        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 font-extrabold text-[11px] uppercase tracking-wider border border-emerald-100">
            <Sprout size={13} className="text-emerald-600" />
            <span>VƯỜN BONSAI SRS • PHƯƠNG PHÁP LẶP LẠI NGẮT QUÃNG</span>
          </div>

          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-snug">
            Vườn Bonsai Trí Nhớ Vĩnh Viễn
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-2xl mb-0">
            Ứng dụng thuật toán Spaced Repetition System (SRS). Cung cấp nước dưỡng mỗi ngày để đưa từ vựng từ khay ươm mầm vào vùng nhớ dài hạn vĩnh viễn mà không bao giờ bị quên lãng.
          </p>
        </div>
      </div>

      {/* ── 2. REALISTIC ARTISTIC BONSAI OASIS CARD ── */}
      <div className="p-6 sm:p-10 rounded-3xl bg-gradient-to-b from-white via-pink-50/20 to-emerald-50/25 border border-pink-100 shadow-lotus relative overflow-hidden">
        {/* Floating Japanese Sakura Petals Background Animation */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-30">
          <div className="absolute top-10 left-12 w-3 h-3 bg-pink-300 rounded-full blur-[0.5px] animate-pulse" />
          <div className="absolute top-28 right-20 w-2.5 h-2.5 bg-rose-300 rounded-full blur-[0.5px] animate-bounce" />
          <div className="absolute bottom-20 left-1/4 w-3.5 h-3.5 bg-pink-400 rounded-full blur-[0.5px] opacity-40 animate-pulse" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
          {/* LEFT 5 COLS: REALISTIC ARTISTIC BONSAI CANVAS */}
          <div className="lg:col-span-5 text-center flex flex-col items-center justify-center">
            <div
              className={`relative w-72 h-72 sm:w-80 sm:h-80 mx-auto rounded-3xl bg-gradient-to-b from-slate-50/60 via-pink-50/30 to-emerald-50/50 p-4 border border-pink-100/80 shadow-inner flex flex-col items-center justify-center transition-all duration-500 ${
                isWatering ? 'ring-8 ring-pink-200 scale-105' : ''
              }`}
            >
              {/* Floating Vitality Indicator */}
              {floatingXp && (
                <div className="absolute top-4 bg-gradient-to-r from-emerald-600 to-teal-500 text-white font-black text-xs px-3 py-1.5 rounded-full shadow-lg animate-bounce z-30 flex items-center gap-1.5">
                  <Sparkles size={13} />
                  <span>+ Độ Ẩm & Sức Sống Bonsai!</span>
                </div>
              )}

              {/* Falling Water Droplets Animation during watering */}
              {isWatering && (
                <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
                  <div className="space-y-2 text-cyan-500 animate-pulse flex flex-col items-center">
                    <Droplets size={44} className="animate-bounce" />
                    <span className="text-[11px] font-extrabold text-blue-600 bg-white/90 px-2 py-0.5 rounded-full shadow-sm">
                      Đang tưới nước mát...
                    </span>
                  </div>
                </div>
              )}

              {/* ── REALISTIC MULTI-LAYER SVG BONSAI ILLUSTRATION ── */}
              <svg
                viewBox="0 0 320 320"
                className={`w-full h-full drop-shadow-md transition-transform duration-500 ${
                  isWatering ? 'scale-105' : ''
                }`}
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  {/* Pot Glaze Gradient */}
                  <linearGradient id="potGrad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#881337" />
                    <stop offset="50%" stopColor="#db2777" />
                    <stop offset="100%" stopColor="#4c0519" />
                  </linearGradient>
                  {/* Pot Trim Gold Gradient */}
                  <linearGradient id="goldGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#d97706" />
                    <stop offset="50%" stopColor="#fbbf24" />
                    <stop offset="100%" stopColor="#b45309" />
                  </linearGradient>
                  {/* Wood Trunk Gradient */}
                  <linearGradient id="trunkGrad" x1="0" y1="1" x2="1" y2="0">
                    <stop offset="0%" stopColor="#3f2314" />
                    <stop offset="45%" stopColor="#5c361e" />
                    <stop offset="85%" stopColor="#78472a" />
                    <stop offset="100%" stopColor="#3f2314" />
                  </linearGradient>
                  {/* Moss Bed Gradient */}
                  <radialGradient id="mossGrad" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#22c55e" />
                    <stop offset="60%" stopColor="#15803d" />
                    <stop offset="100%" stopColor="#14532d" />
                  </radialGradient>
                  {/* Sakura Foliage Cloud 1 */}
                  <radialGradient id="sakuraGrad1" cx="40%" cy="40%" r="60%">
                    <stop offset="0%" stopColor="#fbcfe8" />
                    <stop offset="50%" stopColor="#f472b6" />
                    <stop offset="100%" stopColor="#db2777" />
                  </radialGradient>
                  {/* Sakura Foliage Cloud 2 */}
                  <radialGradient id="sakuraGrad2" cx="30%" cy="30%" r="70%">
                    <stop offset="0%" stopColor="#fdf2f8" />
                    <stop offset="60%" stopColor="#fb7185" />
                    <stop offset="100%" stopColor="#e11d48" />
                  </radialGradient>
                  {/* Pine Foliage Cloud */}
                  <radialGradient id="pineGrad" cx="30%" cy="30%" r="70%">
                    <stop offset="0%" stopColor="#86efac" />
                    <stop offset="60%" stopColor="#10b981" />
                    <stop offset="100%" stopColor="#047857" />
                  </radialGradient>
                  {/* Golden Aura Foliage */}
                  <radialGradient id="goldenGrad" cx="30%" cy="30%" r="70%">
                    <stop offset="0%" stopColor="#fef08a" />
                    <stop offset="60%" stopColor="#f59e0b" />
                    <stop offset="100%" stopColor="#b45309" />
                  </radialGradient>
                </defs>

                {/* 1. CERAMIC POT STAND (DAI) */}
                <rect x="75" y="278" width="170" height="8" rx="3" fill="#1e293b" />
                <rect x="90" y="286" width="22" height="6" rx="2" fill="#0f172a" />
                <rect x="208" y="286" width="22" height="6" rx="2" fill="#0f172a" />

                {/* 2. JAPANESE CERAMIC POT (CHẬU SỨ TRÁNG MEN HOA SEN) */}
                <path
                  d="M60 236 L260 236 C255 264 240 278 220 278 L100 278 C80 278 65 264 60 236 Z"
                  fill="url(#potGrad)"
                  stroke="#4c0519"
                  strokeWidth="2"
                />
                {/* Pot Rim Rim Edge */}
                <rect x="52" y="230" width="216" height="8" rx="4" fill="url(#goldGrad)" stroke="#b45309" strokeWidth="1" />
                {/* Decorative Japanese Fan Inscription on Pot */}
                <path d="M145 258 Q160 252 175 258 L170 268 Q160 264 150 268 Z" fill="#fbcfe8" opacity="0.6" />

                {/* 3. MOSS MOUND & EXPOSED ROOTS (NEBARI) */}
                <ellipse cx="160" cy="232" rx="90" ry="16" fill="url(#mossGrad)" />
                {/* Exposed Root Tendrils */}
                <path d="M142 225 Q130 232 118 238" stroke="#3f2314" strokeWidth="4" strokeLinecap="round" />
                <path d="M175 224 Q188 232 202 237" stroke="#3f2314" strokeWidth="4.5" strokeLinecap="round" />
                <path d="M158 227 Q162 235 168 239" stroke="#5c361e" strokeWidth="3" strokeLinecap="round" />

                {/* 4. TREE TRUNK & CANOPY ACCORDING TO TIER */}
                {bonsaiTier === 1 && (
                  /* TIER 1: TENDER GREEN SPROUT WITH DEW DROPS */
                  <g>
                    <path d="M160 225 Q158 190 155 160" stroke="#16a34a" strokeWidth="7" strokeLinecap="round" />
                    {/* Left Baby Leaf */}
                    <path d="M156 180 Q120 165 110 145 Q135 140 156 172 Z" fill="#22c55e" stroke="#15803d" strokeWidth="1.5" />
                    {/* Right Baby Leaf */}
                    <path d="M156 168 Q195 155 208 135 Q180 130 155 160 Z" fill="#4ade80" stroke="#16a34a" strokeWidth="1.5" />
                    {/* Top Leaf Sprout */}
                    <path d="M155 160 Q145 120 160 100 Q175 120 155 160 Z" fill="#86efac" stroke="#16a34a" strokeWidth="1.5" />
                    {/* Dew Sparkle */}
                    <circle cx="152" cy="120" r="3" fill="#ffffff" />
                  </g>
                )}

                {bonsaiTier === 2 && (
                  /* TIER 2: PINE BONSAI (TÙNG TUYẾT MOYOGI) */
                  <g>
                    {/* S-curved Gnarled Trunk */}
                    <path
                      d="M160 226 C155 195 140 180 148 150 C154 125 175 115 165 85"
                      stroke="url(#trunkGrad)"
                      strokeWidth="14"
                      strokeLinecap="round"
                    />
                    <path d="M146 160 Q115 150 95 158" stroke="url(#trunkGrad)" strokeWidth="6" strokeLinecap="round" />
                    <path d="M162 130 Q195 120 220 128" stroke="url(#trunkGrad)" strokeWidth="7" strokeLinecap="round" />

                    {/* Pine Needle Pads */}
                    <ellipse cx="90" cy="154" rx="36" ry="18" fill="url(#pineGrad)" />
                    <ellipse cx="225" cy="124" rx="42" ry="20" fill="url(#pineGrad)" />
                    <ellipse cx="165" cy="80" rx="55" ry="24" fill="url(#pineGrad)" />
                  </g>
                )}

                {bonsaiTier === 3 && (
                  /* TIER 3: SAKURA BONSAI (HOA ANH ĐÀO HỒNG CÁNH SEN) */
                  <g>
                    {/* Elegant Moyogi Trunk */}
                    <path
                      d="M160 228 C152 195 135 178 145 145 C155 115 178 105 166 75"
                      stroke="url(#trunkGrad)"
                      strokeWidth="16"
                      strokeLinecap="round"
                    />
                    {/* Left Lower Branch */}
                    <path d="M142 165 C120 155 105 152 82 160" stroke="url(#trunkGrad)" strokeWidth="8" strokeLinecap="round" />
                    {/* Right Middle Branch */}
                    <path d="M156 132 C185 122 208 124 235 130" stroke="url(#trunkGrad)" strokeWidth="8.5" strokeLinecap="round" />
                    {/* Top Twig Splits */}
                    <path d="M166 85 Q145 65 130 68" stroke="url(#trunkGrad)" strokeWidth="5" strokeLinecap="round" />
                    <path d="M168 80 Q190 62 210 65" stroke="url(#trunkGrad)" strokeWidth="5" strokeLinecap="round" />

                    {/* Lush Sakura Cloud Clusters */}
                    {/* Lower Left Cloud */}
                    <ellipse cx="78" cy="156" rx="40" ry="22" fill="url(#sakuraGrad1)" />
                    <circle cx="95" cy="148" r="18" fill="url(#sakuraGrad2)" />
                    <circle cx="65" cy="162" r="15" fill="url(#sakuraGrad2)" />

                    {/* Right Middle Cloud */}
                    <ellipse cx="236" cy="126" rx="48" ry="26" fill="url(#sakuraGrad1)" />
                    <circle cx="218" cy="115" r="22" fill="url(#sakuraGrad2)" />
                    <circle cx="254" cy="132" r="20" fill="url(#sakuraGrad2)" />

                    {/* Top Main Canopy */}
                    <ellipse cx="168" cy="62" rx="65" ry="32" fill="url(#sakuraGrad1)" />
                    <circle cx="140" cy="52" r="28" fill="url(#sakuraGrad2)" />
                    <circle cx="195" cy="56" r="26" fill="url(#sakuraGrad2)" />
                    <circle cx="168" cy="42" r="24" fill="#fdf2f8" opacity="0.9" />

                    {/* Floating Sakura Blossom Petals */}
                    <circle cx="115" cy="188" r="3.5" fill="#f43f5e" opacity="0.8" />
                    <circle cx="192" cy="175" r="3" fill="#ec4899" opacity="0.8" />
                    <circle cx="258" cy="170" r="4" fill="#db2777" opacity="0.7" />
                    <circle cx="138" cy="98" r="3.5" fill="#fda4af" opacity="0.9" />
                  </g>
                )}

                {bonsaiTier === 4 && (
                  /* TIER 4: ANCIENT GOLDEN GRAND BONSAI (CỔ THỤ HOÀNG KIM) */
                  <g>
                    <path
                      d="M160 228 C150 190 130 170 144 135 C158 105 182 92 165 60"
                      stroke="url(#trunkGrad)"
                      strokeWidth="20"
                      strokeLinecap="round"
                    />
                    <path d="M140 155 Q100 145 70 152" stroke="url(#trunkGrad)" strokeWidth="10" strokeLinecap="round" />
                    <path d="M160 120 Q205 110 245 118" stroke="url(#trunkGrad)" strokeWidth="11" strokeLinecap="round" />

                    {/* Golden Foliage Pads */}
                    <ellipse cx="68" cy="148" rx="46" ry="24" fill="url(#goldenGrad)" />
                    <ellipse cx="248" cy="114" rx="54" ry="28" fill="url(#goldenGrad)" />
                    <ellipse cx="165" cy="50" rx="76" ry="36" fill="url(#goldenGrad)" />

                    {/* Golden Sparkles */}
                    <circle cx="165" cy="30" r="4" fill="#fef08a" />
                    <circle cx="120" cy="45" r="3" fill="#ffffff" />
                    <circle cx="210" cy="40" r="3.5" fill="#fde047" />
                  </g>
                )}
              </svg>
            </div>

            {/* Badge & Quick Watering Action Under Tree */}
            <div className="mt-4 flex flex-col items-center gap-2">
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-pink-100 text-pink-700 font-extrabold text-xs uppercase tracking-wider border border-pink-200 shadow-sm">
                <span>Cấp độ {bonsaiTier}/4 • {bonsaiName}</span>
              </div>

              <button
                type="button"
                onClick={handleWaterBonsai}
                disabled={isWatering}
                className="mt-1 px-6 py-2.5 rounded-2xl bg-gradient-to-r from-pink-600 via-rose-500 to-pink-500 hover:from-pink-500 hover:to-rose-600 text-white font-black text-xs sm:text-sm shadow-lotus flex items-center gap-2 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                <Droplets size={16} fill="white" />
                <span>Tưới nước dưỡng rễ Bonsai</span>
              </button>
            </div>
          </div>

          {/* RIGHT 7 COLS: GARDEN VITALS, PROGRESS, AND AI WISDOM */}
          <div className="lg:col-span-7 space-y-4">
            <div>
              <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider block mb-1">
                TÌNH TRẠNG SINH TRƯỞNG • {bonsaiSub}
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mb-1.5">
                {bonsaiName}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-0">
                {bonsaiDesc}
              </p>
            </div>

            {/* Water Alert Success Toast Banner */}
            {waterSuccessAlert && (
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                <span>
                  Bonsai đã hấp thụ nước đầy đủ! Độ ẩm đạt 100%, hạt mầm tri thức vươn nhánh mạnh mẽ.
                </span>
              </div>
            )}

            {/* Environmental Vitals Meters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {/* Moisture Meter */}
              <div className="p-4 rounded-2xl bg-white border border-pink-100 shadow-sm space-y-2">
                <div className="flex justify-between items-center text-xs font-bold text-slate-600">
                  <span className="flex items-center gap-1.5 text-blue-600 font-black">
                    <Droplets size={15} />
                    <span>Độ ẩm đất vườn</span>
                  </span>
                  <span className="font-black text-blue-700">{moisture}%</span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-blue-100/70 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-blue-400 to-blue-600 transition-all duration-700"
                    style={{ width: `${moisture}%` }}
                  />
                </div>
                <span className="text-[10.5px] text-slate-400 block font-medium">
                  {moisture >= 80 ? 'Đất tơi xốp, vi chất dồi dào cho rễ bám sâu' : 'Cần 1 gáo nước để duy trì độ tươi'}
                </span>
              </div>

              {/* Memory Progress Meter */}
              <div className="p-4 rounded-2xl bg-white border border-pink-100 shadow-sm space-y-2">
                <div className="flex justify-between items-center text-xs font-bold text-slate-600">
                  <span className="flex items-center gap-1.5 text-emerald-600 font-black">
                    <Award size={15} />
                    <span>Trí nhớ dài hạn vĩnh viễn</span>
                  </span>
                  <span className="font-black text-emerald-700">{overallPercentage}%</span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-emerald-100/70 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600 transition-all duration-700"
                    style={{ width: `${overallPercentage}%` }}
                  />
                </div>
                <span className="text-[10.5px] text-slate-400 block font-medium">
                  {masteredCount} / {totalWords} từ đã nằm trong vùng nhớ vĩnh viễn
                </span>
              </div>
            </div>

            {/* AI Sensei Garden Advisor Banner */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-pink-50 via-rose-50 to-pink-50/50 border border-pink-200/80 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-pink-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                  <Sparkles size={20} />
                </div>
                <div>
                  <h4 className="text-xs font-black text-pink-900 mb-0.5">
                    AI Sensei: Tư Vấn Tối Ưu Não Bộ SRS
                  </h4>
                  <p className="text-[11px] text-pink-700 mb-0 max-w-md">
                    Ôn tập ngắt quãng đúng thời điểm kích thích đường truyền thần kinh, biến trí nhớ ngắn hạn thành phản xạ tự nhiên vĩnh cửu.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  askAi(
                    'explain_vocab',
                    {
                      word: 'Bonsai SRS (Spaced Repetition)',
                      lesson_title: 'Đường cong quên lãng Ebbinghaus'
                    },
                    'AI Sensei: Bí Quyết Ghi Nhớ Tiếng Nhật Vĩnh Viễn'
                  )
                }
                className="px-3.5 py-1.5 rounded-xl bg-white text-pink-700 font-bold text-xs border border-pink-200 shadow-sm hover:bg-pink-100 transition-colors cursor-pointer"
              >
                Hỏi AI bí quyết
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── 3. SPACED REPETITION (SRS) 4 GREENHOUSE TRAYS ── */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-black text-slate-900 tracking-tight">
              4 Khay Ươm Trí Nhớ Spaced Repetition
            </h3>
            <p className="text-xs text-slate-500 mb-0">
              Nhấn vào từng khay để xem danh sách từ vựng đang ở chu kỳ ôn tập tương ứng.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setSelectedLesson(1);
              setActiveTab('flashcard');
            }}
            className="px-4 py-2 rounded-xl bg-pink-600 text-white font-bold text-xs shadow-lotus hover:bg-pink-700 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <BookOpen size={14} />
            <span>Ôn tập thẻ Flashcard ngay</span>
          </button>
        </div>

        {/* 4 Trays Selector Tabs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {stagesMeta.map((stg) => {
            const Icon = stg.icon;
            const isActive = selectedStageTab === stg.stage;
            return (
              <button
                key={stg.stage}
                type="button"
                onClick={() => {
                  sounds.playFlip();
                  setSelectedStageTab(stg.stage);
                }}
                className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                  isActive
                    ? 'bg-white border-pink-500 ring-2 ring-pink-500/20 shadow-lotus'
                    : 'bg-white/80 border-pink-100 hover:border-pink-200 hover:bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className={`w-8 h-8 rounded-xl border flex items-center justify-center ${stg.color}`}>
                    <Icon size={16} />
                  </div>
                  <span className="text-xs font-black text-slate-900">{stg.count} từ</span>
                </div>
                <h4 className="text-xs font-black text-slate-800 mb-0.5">{stg.title}</h4>
                <span className="text-[10.5px] font-bold text-pink-600 block">{stg.srsCycle}</span>
              </button>
            );
          })}
        </div>

        {/* Words Grid in Selected Tray */}
        <div className="p-6 rounded-3xl bg-white border border-pink-100 shadow-sm space-y-4">
          <div className="flex justify-between items-center text-xs font-bold text-slate-400 pb-2 border-b border-pink-50">
            <span>DANH SÁCH TỪ VỰNG TRONG KHAY • {stagesMeta[selectedStageTab - 1]?.title}</span>
            <span className="text-pink-600 font-extrabold">{displayedStageWords.length} từ</span>
          </div>

          {loading ? (
            <div className="py-12 text-center">
              <div className="w-8 h-8 border-3 border-pink-200 border-t-pink-600 rounded-full animate-spin mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-400">Đang kiểm kê khay ươm...</p>
            </div>
          ) : displayedStageWords.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400 space-y-2">
              <p className="font-semibold mb-0">Khay ươm này hiện chưa có từ vựng nào.</p>
              <p className="text-[11px] text-slate-400">
                Hãy tiếp tục học thêm từ vựng mới để đưa mầm tri thức vào khay nhé!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {displayedStageWords.map((word) => (
                <div
                  key={word.id}
                  className="p-3.5 rounded-2xl bg-pink-50/20 hover:bg-pink-50/60 border border-pink-100 transition-colors flex items-center justify-between gap-2"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 my-0.5">
                      <FuriganaWord
                        kanji={word.kanji}
                        kana={word.clean_kana || word.kana}
                        size="sm"
                      />
                    </div>
                    <p className="text-xs text-slate-600 truncate mt-0.5 mb-0 font-medium">
                      {word.clean_vietnamese || word.vietnamese}
                    </p>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => speakJapanese(word.kanji || word.clean_kana || word.kana)}
                      className="p-1.5 rounded-lg bg-white border border-pink-200 text-pink-600 hover:bg-pink-100 transition-colors cursor-pointer"
                      title="Nghe phát âm"
                    >
                      <Volume2 size={13} />
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        askAi('explain_vocab', word, `AI: Phân Tích 「${word.kanji || word.kana}」`)
                      }
                      className="p-1.5 rounded-lg bg-pink-600 text-white hover:bg-pink-700 transition-colors cursor-pointer shadow-sm"
                      title="Hỏi AI"
                    >
                      <Sparkles size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}