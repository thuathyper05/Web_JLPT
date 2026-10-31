import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { vocabService, speakJapanese } from '../services/api';
import { sounds } from '../services/sounds';
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
  Zap,
  RotateCcw,
  Volume2,
  Clock,
  Layers
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function GardenPage() {
  const { guestProgress, setActiveTab, setSelectedLesson, gamification, askAi } = useApp();

  const [allWords, setAllWords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStageTab, setSelectedStageTab] = useState(1);
  const [moisture, setMoisture] = useState(65);
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

  // Stage 1 (Mầm non): Words needing review or just studied recently
  const stage1Words = reviewList.length > 0 ? reviewList : unstudiedList.slice(0, 8);
  // Stage 2 (Cây non): Mastered 1..20
  const stage2Words = masteredList.slice(0, 15);
  // Stage 3 (Bonsai trưởng thành): Mastered 21..50
  const stage3Words = masteredList.slice(15, 40);
  // Stage 4 (Cổ thụ hoàng kim): Mastered 50+
  const stage4Words = masteredList.slice(40);

  // Determine current active Bonsai tier
  let bonsaiTier = 1;
  let bonsaiName = 'Khay Ươm Mầm Non';
  let bonsaiDesc = 'Hạt mầm tri thức đầu tiên đâm chồi xanh mướt. Đây là giai đoạn cần tưới nước lặp lại ngắt quãng mỗi 24 giờ để rễ bám sâu.';

  if (masteredCount >= 500) {
    bonsaiTier = 4;
    bonsaiName = 'Đại Thụ Cổ Hoàng Kim';
    bonsaiDesc = 'Tán lá xòe rộng phủ bóng mát tri thức, hoa vàng nở rộ. Toàn bộ từ vựng đã chuyển hẳn sang vùng nhớ dài hạn vĩnh viễn!';
  } else if (masteredCount >= 200) {
    bonsaiTier = 3;
    bonsaiName = 'Bonsai Hoa Anh Đào';
    bonsaiDesc = 'Dáng thế Moyogi kiên cường, sắc hoa hồng phớt rực rỡ, phản xạ tiếng Nhật tự nhiên không cần dịch nhẩm trong đầu.';
  } else if (masteredCount >= 50) {
    bonsaiTier = 2;
    bonsaiName = 'Bonsai Tùng Tuyết';
    bonsaiDesc = 'Cây vươn nhánh xanh tốt đón ánh dương. Rễ cây đã vững chãi qua chu kỳ ôn tập ngắt quãng 3 ngày và 7 ngày.';
  }

  const handleWaterBonsai = () => {
    sounds.playCorrect();
    setIsWatering(true);
    confetti({ particleCount: 75, spread: 70, origin: { y: 0.55 } });

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
      icon: TreeDeciduous,
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

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 font-extrabold text-[11px] uppercase tracking-wider mb-2.5 border border-emerald-100">
            <Sprout size={13} className="text-emerald-600" />
            <span>VƯỜN BONSAI SRS • PHƯƠNG PHÁP LẶP LẠI NGẮT QUÃNG</span>
          </div>

          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-snug mb-1.5">
            Vườn Bonsai Trí Nhớ Vĩnh Viễn
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-2xl mb-0">
            Hệ thống hóa toàn bộ từ vựng theo thuật toán Spaced Repetition System. Tưới nước dinh dưỡng mỗi ngày để đưa từ vựng từ khay ươm mầm vào vùng nhớ dài hạn vĩnh viễn.
          </p>
        </div>
      </div>

      {/* ── 2. VISUAL ZEN BONSAI OASIS CARD ── */}
      <div className="p-6 sm:p-10 rounded-3xl bg-gradient-to-b from-white via-pink-50/20 to-emerald-50/30 border border-pink-100 shadow-lotus relative overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center relative z-10">
          {/* Left Column: Bonsai Tree Illustration */}
          <div className="md:col-span-1 text-center space-y-3">
            <div
              className={`w-44 h-44 sm:w-52 sm:h-52 mx-auto rounded-full bg-gradient-to-tr from-pink-100 via-emerald-100 to-white flex items-center justify-center shadow-inner border-2 border-white transition-all duration-500 relative ${
                isWatering ? 'scale-110 rotate-3 ring-8 ring-emerald-200' : ''
              }`}
            >
              {bonsaiTier === 1 && <Sprout size={84} className="text-emerald-600 animate-pulse" />}
              {bonsaiTier === 2 && <TreePine size={96} className="text-teal-600" />}
              {bonsaiTier === 3 && <Flower2 size={104} className="text-pink-600" />}
              {bonsaiTier === 4 && <TreeDeciduous size={112} className="text-amber-600" />}

              {/* Water droplet overlay when watering */}
              {isWatering && (
                <div className="absolute inset-0 flex items-center justify-center bg-emerald-500/10 rounded-full animate-ping">
                  <Droplets size={48} className="text-emerald-500" />
                </div>
              )}
            </div>

            <div className="inline-block px-3 py-1 rounded-full bg-pink-100 text-pink-700 font-black text-xs uppercase tracking-wide">
              Bonsai Cấp {bonsaiTier}/4 • {bonsaiName}
            </div>
          </div>

          {/* Right 2 Columns: Garden Vitals & Actions */}
          <div className="md:col-span-2 space-y-4">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                TÌNH TRẠNG SINH TRƯỞNG KHU VƯỜN
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                {bonsaiName}
              </h2>
              <p className="text-xs text-slate-600 leading-relaxed mt-1 mb-0">
                {bonsaiDesc}
              </p>
            </div>

            {/* Environmental Meters */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              {/* Moisture Meter */}
              <div className="p-3.5 rounded-2xl bg-white border border-pink-100 shadow-sm space-y-1.5">
                <div className="flex justify-between items-center text-xs font-bold text-slate-600">
                  <span className="flex items-center gap-1.5 text-blue-600">
                    <Droplets size={14} />
                    <span>Độ ẩm đất</span>
                  </span>
                  <span className="font-black">{moisture}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-blue-100 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-blue-500 transition-all duration-700"
                    style={{ width: `${moisture}%` }}
                  />
                </div>
                <span className="text-[10px] text-slate-400 block">
                  {moisture >= 80 ? 'Đất màu mỡ, cây phát triển cực tốt' : 'Cần tưới nước để duy trì chuỗi nhớ'}
                </span>
              </div>

              {/* Memory Progress Meter */}
              <div className="p-3.5 rounded-2xl bg-white border border-pink-100 shadow-sm space-y-1.5">
                <div className="flex justify-between items-center text-xs font-bold text-slate-600">
                  <span className="flex items-center gap-1.5 text-emerald-600">
                    <Award size={14} />
                    <span>Trí nhớ dài hạn</span>
                  </span>
                  <span className="font-black">{overallPercentage}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-emerald-100 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-emerald-500 transition-all duration-700"
                    style={{ width: `${overallPercentage}%` }}
                  />
                </div>
                <span className="text-[10px] text-slate-400 block">
                  Đã làm chủ {masteredCount} / {totalWords} từ vựng N5
                </span>
              </div>
            </div>

            {/* Interactive Actions */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleWaterBonsai}
                disabled={isWatering}
                className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-600 text-white font-extrabold text-xs sm:text-sm shadow-md hover:scale-105 active:scale-95 transition-all inline-flex items-center gap-2 cursor-pointer"
              >
                <Droplets size={16} />
                <span>Tưới nước hôm nay (+15 XP)</span>
              </button>

              <button
                type="button"
                onClick={() => askAi('explain_vocab', { word: 'Bonsai', clean_vietnamese: 'Cây cảnh nghệ thuật Nhật Bản' }, 'AI Sensei: Triết Lý Bonsai & Học Tập')}
                className="px-4 py-2.5 rounded-2xl bg-white border border-pink-200 text-pink-700 hover:bg-pink-50 font-bold text-xs shadow-sm hover:scale-105 active:scale-95 transition-all inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Sparkles size={15} className="text-pink-600" />
                <span>Nhờ AI bón phân tri thức</span>
              </button>
            </div>

            {waterSuccessAlert && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold inline-flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                <span>Tưới nước thành công! Cây tri thức tràn ngập nhựa sống và tăng độ bền phản xạ.</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── 3. 4 SRS GREENHOUSE TRAYS ── */}
      <div className="space-y-4">
        <div className="flex justify-between items-center px-1">
          <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">
            4 PHÂN KHU ƯƠM MẦM SRS (CHỌN ĐỂ XEM TỪ VỰNG)
          </h3>
          <span className="text-xs font-bold text-pink-600">
            {allWords.length} từ trong hệ thống
          </span>
        </div>

        {/* 4 Trays Selector */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {stagesMeta.map((stg) => {
            const Icon = stg.icon;
            const isSelected = selectedStageTab === stg.stage;
            return (
              <button
                key={stg.stage}
                type="button"
                onClick={() => {
                  sounds.playFlip();
                  setSelectedStageTab(stg.stage);
                }}
                className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'bg-pink-50/60 border-pink-500 shadow-lotus ring-2 ring-pink-500/20 scale-102'
                    : 'bg-white border-pink-100 hover:border-pink-300 shadow-sm'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${stg.color}`}>
                    <Icon size={18} />
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold">
                    {stg.count} từ
                  </span>
                </div>

                <div>
                  <h4 className="font-extrabold text-xs text-slate-900 leading-tight">
                    {stg.title}
                  </h4>
                  <span className="text-[10.5px] text-pink-600 font-bold block mt-0.5">
                    {stg.srsCycle}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected Tray Words List */}
        <div className="p-6 rounded-3xl bg-white border border-pink-100 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-pink-50 pb-3">
            <div>
              <h4 className="font-black text-sm text-slate-900">
                Danh sách từ vựng: {stagesMeta[selectedStageTab - 1].title}
              </h4>
              <p className="text-xs text-slate-500 mb-0">
                {selectedStageTab === 1 && 'Các từ vựng mới học cần củng cố lại sau 24h để tránh rơi vào đường cong quên lãng Ebbinghaus.'}
                {selectedStageTab === 2 && 'Các từ đã ghi nhớ 1 chu kỳ, đang chuyển hóa dần sang trí nhớ bán vĩnh viễn.'}
                {selectedStageTab === 3 && 'Các từ đã vượt qua 3 đợt kiểm tra ngắt quãng, phản xạ cực nhạy.'}
                {selectedStageTab === 4 && 'Các từ đã khắc sâu vào tiềm thức, sẵn sàng làm bài thi JLPT N5.'}
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                sounds.playFlip();
                setActiveTab('flashcard');
              }}
              className="px-4 py-2 rounded-xl bg-pink-600 hover:bg-pink-700 text-white font-bold text-xs shadow-lotus flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
            >
              <Layers size={14} />
              <span>Ôn tập khay này</span>
            </button>
          </div>

          {displayedStageWords.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400 space-y-2">
              <Sprout size={32} className="mx-auto text-slate-300" />
              <p className="font-bold">Chưa có từ vựng nào trong phân khu này.</p>
              <button
                type="button"
                onClick={() => setActiveTab('lessons')}
                className="text-pink-600 font-bold hover:underline cursor-pointer"
              >
                Học thêm từ mới từ Bài 01 Minna
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {displayedStageWords.map((word) => (
                <div
                  key={word.id}
                  className="p-3.5 rounded-2xl bg-pink-50/20 border border-pink-100/90 hover:bg-pink-50/50 hover:border-pink-300 transition-all flex items-center justify-between"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-jp font-black text-sm text-slate-900">
                        {word.kanji || word.clean_kana || word.kana}
                      </span>
                      <span className="text-[10px] font-bold text-pink-600">
                        Bài {word.lesson_number}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 truncate mt-0.5 mb-0">
                      {word.clean_vietnamese || word.vietnamese}
                    </p>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => speakJapanese(word.kanji || word.clean_kana || word.kana)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-pink-600 hover:bg-white transition-colors cursor-pointer"
                      title="Nghe phát âm"
                    >
                      <Volume2 size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => askAi('explain_vocab', word, `AI: ${word.kanji || word.kana}`)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-pink-600 hover:bg-white transition-colors cursor-pointer"
                      title="AI mẹo nhớ"
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
