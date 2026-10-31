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
  TreePine,
  CheckCircle2,
  Volume2,
  Clock,
  Layers,
  Heart,
  Flower2,
  RefreshCw
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function GardenPage() {
  const { guestProgress, setActiveTab, setSelectedLesson, askAi } = useApp();

  const [allWords, setAllWords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStageTab, setSelectedStageTab] = useState(1);
  const [moisture, setMoisture] = useState(85);
  const [isWatering, setIsWatering] = useState(false);
  const [waterSuccessAlert, setWaterSuccessAlert] = useState(false);

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
  let bonsaiName = 'Khay Ươm Hạt Mầm';
  let bonsaiSub = 'Chu kỳ ôn tập 24 giờ';
  let bonsaiDesc = 'Những hạt mầm từ vựng mới đang đâm chồi xanh non. Tưới nước và ôn tập đều đặn sau mỗi 24 giờ để rễ bám chắc vào trí nhớ ngắn hạn.';
  let bonsaiAccent = 'from-emerald-500 to-teal-600';

  if (masteredCount >= 500) {
    bonsaiTier = 4;
    bonsaiName = 'Đại Thụ Cổ Hoàng Kim';
    bonsaiSub = 'Vùng nhớ vĩnh viễn';
    bonsaiDesc = 'Tán lá vàng óng ánh phủ bóng mát tri thức. Toàn bộ từ vựng đã chuyển hẳn sang vùng nhớ dài hạn vĩnh viễn, phản xạ tức thì không cần dịch nhẩm!';
    bonsaiAccent = 'from-amber-400 to-amber-600';
  } else if (masteredCount >= 200) {
    bonsaiTier = 3;
    bonsaiName = 'Bonsai Hoa Anh Đào';
    bonsaiSub = 'Phản xạ tự nhiên';
    bonsaiDesc = 'Dáng thế Moyogi kiên cường, sắc hoa hồng sen rực rỡ. Phản xạ tiếng Nhật tự nhiên như người bản xứ qua chu kỳ 7 ngày.';
    bonsaiAccent = 'from-pink-500 to-rose-600';
  } else if (masteredCount >= 50) {
    bonsaiTier = 2;
    bonsaiName = 'Bonsai Tùng Tuyết Nhật Bản';
    bonsaiSub = 'Vững vàng bén rễ';
    bonsaiDesc = 'Thân gỗ uốn lượn vươn nhánh xanh tốt đón ánh dương. Rễ cây đã vững chãi qua chu kỳ ôn tập ngắt quãng 3 ngày và 7 ngày.';
    bonsaiAccent = 'from-teal-500 to-emerald-600';
  }

  const handleWaterBonsai = () => {
    sounds.playCorrect();
    setIsWatering(true);
    confetti({
      particleCount: 60,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#0284c7', '#38bdf8', '#db2777', '#34d399']
    });

    setTimeout(() => {
      setIsWatering(false);
      setMoisture(100);
      setWaterSuccessAlert(true);
      setTimeout(() => setWaterSuccessAlert(false), 4000);
    }, 600);
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
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-pink-100 shadow-sm relative overflow-hidden">
        {/* Subtle Japanese Watermark */}
        <div className="absolute right-4 top-2 text-pink-100/50 font-jp font-black text-8xl pointer-events-none select-none">
          庭
        </div>

        <div className="relative z-10">
          <div className="mb-2.5 flex flex-wrap items-center justify-between gap-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-50 text-pink-700 font-extrabold text-[11px] uppercase tracking-wider border border-pink-100">
              <Sprout size={13} className="text-pink-600" />
              <span>SPACED REPETITION SYSTEM - VƯỜN CÂY TRI THỨC</span>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold">
              <Award size={14} className="text-amber-500" />
              <span>Từ vựng đã vững rễ: <strong>{masteredCount}</strong>/{totalWords}</span>
            </div>
          </div>

          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-snug mb-1.5">
            Khu Vườn Ghi Nhớ Lặp Lại Ngắt Quãng
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-2xl mb-0">
            Ứng dụng thuật toán Spaced Repetition (SRS) mô phỏng sinh trưởng tự nhiên. Từ vựng được lặp lại đúng các mốc thời gian vàng (24h, 3 ngày, 7 ngày) để chuyển vào vùng nhớ dài hạn vĩnh viễn.
          </p>
        </div>
      </div>

      {/* ── 2. HERO ZEN BONSAI CARD & SENSORY VITALS ── */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-pink-100 shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* LEFT 5 COLS: ELEGANT STYLIZED BONSAI EMBLEM & WATER ACTION */}
          <div className="lg:col-span-5 flex flex-col items-center text-center space-y-4">
            {/* Bonsai Art Canvas */}
            <div className="relative w-64 h-64 sm:w-72 sm:h-72 rounded-3xl bg-gradient-to-b from-slate-50/80 via-pink-50/20 to-emerald-50/30 p-6 border border-pink-100/70 shadow-xs flex flex-col items-center justify-between overflow-hidden">
              {/* Soft Ambient Radiance */}
              <div className="absolute inset-4 rounded-full bg-pink-200/20 blur-2xl pointer-events-none" />

              {/* Water Droplet Ripples during watering */}
              {isWatering && (
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white/70 backdrop-blur-xs animate-in fade-in">
                  <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center animate-bounce mb-1">
                    <Droplets size={24} />
                  </div>
                  <span className="text-xs font-black text-blue-700">Đang tưới nước mát...</span>
                </div>
              )}

              {/* Top Tier Badge */}
              <div className="relative z-10 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/90 border border-pink-100 text-[11px] font-bold text-slate-700 shadow-xs">
                <span className={`w-2 h-2 rounded-full bg-gradient-to-r ${bonsaiAccent}`} />
                <span>Cấp độ {bonsaiTier}: {bonsaiName}</span>
              </div>

              {/* Iconic Minimalist Japanese Bonsai Graphic */}
              <div className="relative z-10 flex flex-col items-center justify-center my-auto transition-transform duration-500 hover:scale-105">
                {/* Bonsai Foliage Clouds */}
                <div className="relative flex items-center justify-center">
                  <div className={`w-28 h-20 sm:w-32 sm:h-24 rounded-full bg-gradient-to-tr ${bonsaiAccent} shadow-md opacity-95 flex items-center justify-center relative`}>
                    {/* Inner Texture Petal Dots */}
                    <div className="w-14 h-10 rounded-full bg-white/20 blur-xs absolute -top-1 left-3" />
                    <span className="font-jp text-white font-black text-2xl select-none opacity-90 drop-shadow-xs">
                      {bonsaiTier >= 4 ? '金' : bonsaiTier === 3 ? '桜' : bonsaiTier === 2 ? '松' : '芽'}
                    </span>
                  </div>
                  {/* Left Side Accent Leaf */}
                  <div className={`w-14 h-11 rounded-full bg-gradient-to-tr ${bonsaiAccent} shadow-sm absolute -left-4 top-2 opacity-90`} />
                  {/* Right Side Accent Leaf */}
                  <div className={`w-14 h-11 rounded-full bg-gradient-to-tr ${bonsaiAccent} shadow-sm absolute -right-4 top-4 opacity-90`} />
                </div>

                {/* Bonsai Trunk (Uốn lượn phong thái Zen) */}
                <svg width="70" height="55" viewBox="0 0 70 55" fill="none" className="mt-1">
                  <path
                    d="M35 0 C33 15 24 25 28 40 C30 46 32 50 35 55"
                    stroke="#5c361e"
                    strokeWidth="8"
                    strokeLinecap="round"
                  />
                  <path
                    d="M27 22 C20 18 15 15 12 14"
                    stroke="#5c361e"
                    strokeWidth="4"
                    strokeLinecap="round"
                  />
                  <path
                    d="M31 32 C38 28 46 25 50 24"
                    stroke="#5c361e"
                    strokeWidth="4"
                    strokeLinecap="round"
                  />
                </svg>

                {/* Minimalist Japanese Ceramic Pot */}
                <div className="w-36 h-6 rounded-b-xl bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 border-t-2 border-amber-400 shadow-md flex items-center justify-center">
                  <div className="w-24 h-1 rounded-full bg-white/20" />
                </div>
              </div>

              {/* Bottom Botanical Status */}
              <div className="relative z-10 text-[11px] font-semibold text-slate-500">
                {bonsaiSub}
              </div>
            </div>

            {/* Tactile Water Button */}
            <button
              type="button"
              onClick={handleWaterBonsai}
              disabled={isWatering}
              className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-pink-600 to-rose-500 hover:from-pink-500 hover:to-rose-600 text-white font-bold text-xs sm:text-sm shadow-lotus flex items-center gap-2 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              <Droplets size={16} fill="white" />
              <span>Tưới nước dưỡng rễ Bonsai</span>
            </button>
          </div>

          {/* RIGHT 7 COLS: BOTANICAL STATUS, SRS METRICS & AI WISDOM */}
          <div className="lg:col-span-7 space-y-4">
            <div>
              <span className="text-[10.5px] font-black text-pink-600 uppercase tracking-wider block mb-1">
                TÌNH TRẠNG SINH TRƯỞNG - GIAI ĐOẠN {bonsaiTier}
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mb-1.5">
                {bonsaiName}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-0">
                {bonsaiDesc}
              </p>
            </div>

            {/* Water Alert Success Toast */}
            {waterSuccessAlert && (
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                <span>
                  Bonsai đã được tưới nước đầy đủ! Độ ẩm đạt 100%, hạt mầm tri thức vươn nhánh tươi tốt.
                </span>
              </div>
            )}

            {/* Environmental Meters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {/* Moisture Meter */}
              <div className="p-4 rounded-2xl bg-slate-50/60 border border-slate-200/80 space-y-2">
                <div className="flex justify-between items-center text-xs font-bold text-slate-700">
                  <span className="flex items-center gap-1.5 text-blue-600 font-extrabold">
                    <Droplets size={15} />
                    <span>Độ ẩm đất vườn</span>
                  </span>
                  <span className="font-black text-blue-700">{moisture}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-blue-100 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-blue-400 to-blue-600 transition-all duration-700"
                    style={{ width: `${moisture}%` }}
                  />
                </div>
                <span className="text-[10.5px] text-slate-400 block font-medium">
                  {moisture >= 80 ? 'Đất tơi xốp, vi chất dồi dào' : 'Cần 1 gáo nước để duy trì độ tươi'}
                </span>
              </div>

              {/* Memory Progress Meter */}
              <div className="p-4 rounded-2xl bg-slate-50/60 border border-slate-200/80 space-y-2">
                <div className="flex justify-between items-center text-xs font-bold text-slate-700">
                  <span className="flex items-center gap-1.5 text-emerald-600 font-extrabold">
                    <Award size={15} />
                    <span>Bộ nhớ dài hạn vĩnh viễn</span>
                  </span>
                  <span className="font-black text-emerald-700">{overallPercentage}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-emerald-100 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600 transition-all duration-700"
                    style={{ width: `${overallPercentage}%` }}
                  />
                </div>
                <span className="text-[10.5px] text-slate-400 block font-medium">
                  {masteredCount} / {totalWords} từ vựng đã chuyển sang phản xạ vô thức
                </span>
              </div>
            </div>

            {/* AI Sensei Botanical Wisdom Card (Clean Apple / Notion Callout Style) */}
            <div className="p-4 rounded-2xl bg-pink-50/40 border border-pink-100 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-pink-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                  <Sparkles size={16} />
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-900 mb-0.5">
                    Lời Khuyên Từ AI Sensei Về Spaced Repetition
                  </h4>
                  <p className="text-[11px] text-slate-600 mb-0 max-w-md">
                    Ôn tập ngắt quãng đúng thời điểm kích thích đường truyền thần kinh não bộ, biến trí nhớ ngắn hạn thành phản xạ vô thức bền vững.
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
                className="px-3.5 py-1.5 rounded-xl bg-white text-pink-700 font-bold text-xs border border-pink-200 hover:bg-pink-50 transition-colors cursor-pointer shadow-2xs"
              >
                Hỏi AI bí quyết
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── 3. 4 KHAY ƯƠM TRÍ NHỚ (SRS INTERACTIVE TABS) ── */}
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
            className="px-4 py-2 rounded-xl bg-pink-600 hover:bg-pink-700 text-white font-bold text-xs shadow-lotus flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <BookOpen size={14} />
            <span>Ôn tập Flashcard ngay</span>
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
                className={`p-4 rounded-2xl border text-left transition-all cursor-pointer relative ${
                  isActive
                    ? 'bg-white border-pink-500 ring-2 ring-pink-500/20 shadow-md'
                    : 'bg-white border-slate-200 hover:border-pink-200 hover:bg-pink-50/20'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center border ${stg.color}`}>
                    <Icon size={16} />
                  </div>
                  <span className="text-xs font-black text-slate-700">
                    {stg.count} từ
                  </span>
                </div>
                <h4 className="font-bold text-xs text-slate-900 mb-0.5">
                  {stg.title}
                </h4>
                <span className="text-[10px] text-slate-400 font-medium">
                  {stg.srsCycle}
                </span>
              </button>
            );
          })}
        </div>

        {/* Active Tray Vocabularies Grid */}
        <div className="p-6 rounded-3xl bg-white border border-pink-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-pink-50">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-slate-800 uppercase tracking-wider">
                DANH SÁCH TỪ VỰNG TRONG KHAY - {stagesMeta[selectedStageTab - 1]?.title}
              </span>
              <span className="text-xs font-bold text-pink-600 bg-pink-50 px-2 py-0.5 rounded-md">
                {activeWords.length} từ
              </span>
            </div>

            <span className="text-[11px] text-slate-400 font-medium">
              Chu kỳ: {stagesMeta[selectedStageTab - 1]?.srsCycle}
            </span>
          </div>

          {activeWords.length === 0 ? (
            <div className="py-12 text-center text-slate-400 space-y-2">
              <Sprout size={32} className="mx-auto text-slate-300" />
              <p className="text-xs font-medium mb-0">Khay ươm này hiện đang trống. Hãy tiếp tục học bài mới để thêm từ vào khay!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {activeWords.map((word) => (
                <div
                  key={word.id}
                  className="p-3.5 rounded-2xl border border-slate-100 bg-slate-50/40 hover:bg-white hover:border-pink-200 transition-all shadow-xs flex items-center justify-between group"
                >
                  <div className="space-y-0.5">
                    <div className="font-jp font-bold text-base text-slate-900 flex items-center gap-2">
                      <FuriganaWord kanji={word.kanji} kana={word.kana} size="base" />
                    </div>
                    <p className="text-xs text-slate-600 mb-0">
                      {word.meaning_vi || word.vietnamese || word.meaning}
                    </p>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {word.romaji}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => speakJapanese(word.kanji || word.kana)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-pink-600 hover:bg-pink-50 transition-colors cursor-pointer"
                      title="Phát âm"
                    >
                      <Volume2 size={15} />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        askAi('explain_vocab', word, `AI: Phân Tích 「${word.kanji || word.kana}」`)
                      }
                      className="p-1.5 rounded-lg text-slate-400 hover:text-pink-600 hover:bg-pink-50 transition-colors cursor-pointer"
                      title="AI phân tích từ này"
                    >
                      <Sparkles size={14} />
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
