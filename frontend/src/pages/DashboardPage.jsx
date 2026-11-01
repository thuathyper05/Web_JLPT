import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { lessonService, vocabService, speakJapanese } from '../services/api';
import FuriganaWord from '../components/FuriganaWord';
import SakuraPulse from '../components/SakuraPulse';
import {
  Play,
  Sparkles,
  BookOpen,
  Trophy,
  Flame,
  PenTool,
  Layers,
  CheckSquare,
  Keyboard,
  Volume2,
  ChevronRight,
  Target,
  Headphones,
  Newspaper,
  RotateCw,
  Clock,
  Check,
  X
} from 'lucide-react';
import { sounds } from '../services/sounds';

export default function DashboardPage() {
  const { user, currentLevel = 'N5', setActiveTab, setSelectedLesson, selectedLesson, gamification, guestProgress, askAi } = useApp();
  const [stats, setStats] = useState({
    studied: 0,
    mastered: 0,
    needsReview: 0,
    totalKanji: 80,
    totalVocab: 1512
  });

  const [levelVocabs, setLevelVocabs] = useState([]);
  const [manualOffset, setManualOffset] = useState(0);
  const [hourIndex, setHourIndex] = useState(Math.floor(Date.now() / (1000 * 60 * 60)));

  // Fallback word if network fails
  const fallbackWord = {
    kanji: '銀行員',
    kana: 'ぎんこういん',
    clean_kana: 'ぎんこういん',
    vietnamese: 'Nhân viên ngân hàng',
    meaning: 'Nhân viên ngân hàng',
    lesson_number: 1,
    romaji: 'ginkouin'
  };

  // Fetch vocabs dynamically for the active level
  useEffect(() => {
    let isMounted = true;
    const fetchVocabs = async () => {
      try {
        const res = await vocabService.getVocabularies({ level: currentLevel || 'N5' });
        const list = res.data?.data || [];
        if (isMounted) {
          setLevelVocabs(list);
        }
      } catch (err) {
        console.error('Error fetching dashboard vocabs:', err);
      }
    };
    fetchVocabs();
    return () => { isMounted = false; };
  }, [currentLevel]);

  // Hourly word timer: checks every 60s if clock hour changed
  useEffect(() => {
    const timer = setInterval(() => {
      const currentH = Math.floor(Date.now() / (1000 * 60 * 60));
      if (currentH !== hourIndex) {
        setHourIndex(currentH);
        setManualOffset(0); // Reset manual rotation at top of new hour
      }
    }, 60000);
    return () => clearInterval(timer);
  }, [hourIndex]);

  // Pick the deterministic hourly word
  const currentHourlyWord = levelVocabs.length > 0
    ? levelVocabs[Math.abs((hourIndex + manualOffset) % levelVocabs.length)]
    : fallbackWord;

  // Real-time stats based on user learning data
  useEffect(() => {
    const safeProgress = (guestProgress && typeof guestProgress === 'object') ? guestProgress : {};
    const studiedCount = Object.keys(safeProgress).length;
    const masteredCount = Object.values(safeProgress).filter(p => p && (p.status === 'mastered' || p === 'mastered')).length;
    const needsReviewCount = Object.values(safeProgress).filter(p => p && (p.status === 'needs_review' || p === 'needs_review')).length;

    const kanjiByLevel = { N5: 108, N4: 180, N3: 119, N2: 100, N1: 100 };

    setStats({
      studied: studiedCount,
      mastered: masteredCount,
      needsReview: needsReviewCount,
      totalKanji: kanjiByLevel[currentLevel] || 108,
      totalVocab: (Array.isArray(levelVocabs) && levelVocabs.length > 0) ? levelVocabs.length : (currentLevel === 'N1' ? 3070 : currentLevel === 'N2' ? 1778 : currentLevel === 'N3' ? 1659 : currentLevel === 'N4' ? 1488 : 1589)
    });
  }, [guestProgress, currentLevel, levelVocabs]);

  // Tính toán chuẩn 7 ngày trong tuần từ Thứ Hai đến Chủ Nhật
  const weekDays = React.useMemo(() => {
    const now = new Date();
    const currentDay = (now.getDay() + 6) % 7; // Thứ 2 = 0, Chủ nhật = 6
    const monday = new Date(now);
    monday.setDate(now.getDate() - currentDay);

    const dayNames = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
    const fullNames = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật'];

    const week = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const date = String(d.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${date}`;
      week.push({
        shortName: dayNames[i],
        fullName: fullNames[i],
        dateStr,
        dayNum: d.getDate(),
        isToday: i === currentDay,
        isPast: i < currentDay,
        isFuture: i > currentDay
      });
    }
    return week;
  }, []);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-in fade-in duration-300">
      {/* ── 1. GREETING WITH REAL AVATAR SUPPORT ── */}
      <div className="flex items-center gap-3 sm:gap-4 min-w-0 max-w-full">
        {user && (user.avatar_url || user.avatar) ? (
          <div className="relative shrink-0">
            <img
              src={user.avatar_url || user.avatar}
              alt={user.username || 'Avatar'}
              referrerPolicy="no-referrer"
              className="w-11 h-11 sm:w-14 sm:h-14 rounded-2xl object-cover border-2 border-pink-300 shadow-xs"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 sm:w-3.5 sm:h-3.5 bg-emerald-500 rounded-full border-2 border-white" title="Trực tuyến" />
          </div>
        ) : null}
        <div className="min-w-0 flex-1">
          <span className="text-[11px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider block mb-0.5 truncate">
            Chào mừng trở lại,
          </span>
          <h1 className="text-lg sm:text-2xl lg:text-3xl font-black text-slate-900 tracking-tight flex items-baseline gap-1.5 sm:gap-2 min-w-0 mb-0">
            <span className="font-jp text-pink-600 shrink-0">こんにちは,</span>
            <span className="truncate">{user?.username || 'Khách'}!</span>
          </h1>
        </div>
      </div>

      {/* ── 2. TOP HERO ROW (HERO BANNER + MỤC TIÊU HÔM NAY) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left 2 Cols: Main Learning Hero Card */}
        <div className="lg:col-span-2 rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-pink-950 text-white p-6 sm:p-8 relative overflow-hidden shadow-xl border border-pink-900/30 flex flex-col justify-between">
          {/* Decorative Japanese Fan & Wave Silhouette */}
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-800 font-jp font-black text-9xl opacity-20 select-none pointer-events-none">
            日本語
          </div>
          <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-pink-500/15 blur-3xl pointer-events-none" />

          <div className="relative z-10">
            {/* Lesson Tag Pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/20 border border-pink-400/40 text-pink-300 text-xs font-bold mb-4 backdrop-blur-md">
              <SakuraPulse size={14} />
              <span>
                {currentLevel === 'N4' ? `BÀI ${selectedLesson || 26} — Minna no Nihongo II` :
                 currentLevel === 'N3' ? `BÀI ${String(selectedLesson || 1).padStart(2, '0')} — Soumatome & Shinkanzen N3` :
                 currentLevel === 'N2' ? `BÀI ${String(selectedLesson || 1).padStart(2, '0')} — Soumatome & Shinkanzen N2` :
                 currentLevel === 'N1' ? `BÀI ${String(selectedLesson || 1).padStart(2, '0')} — Thượng Cấp Bác Học N1` :
                 `BÀI ${String(selectedLesson || 1).padStart(2, '0')} — Minna no Nihongo I`}
              </span>
            </div>

            {/* Title */}
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-tight leading-snug mb-3 max-w-md">
              Tiếp tục hành trình chinh phục Cấp độ {currentLevel}
            </h2>

            {/* Progress line */}
            <div className="max-w-md space-y-1.5 mb-6">
              <div className="flex justify-between text-xs text-slate-300 font-medium">
                <span>Tiến độ học tập</span>
                <span className="font-bold text-pink-400">{stats.studied}/{stats.totalVocab} từ</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-pink-500 via-rose-500 to-pink-400 transition-all duration-500"
                  style={{ width: `${Math.min(100, (stats.studied / Math.max(1, stats.totalVocab)) * 100)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 relative z-10">
            <button
              type="button"
              onClick={() => {
                if (currentLevel === 'N4' && (!selectedLesson || selectedLesson < 26)) {
                  setSelectedLesson(26);
                } else if (!selectedLesson) {
                  setSelectedLesson(1);
                }
                setActiveTab('lessons');
              }}
              className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-pink-600 via-rose-500 to-pink-500 hover:from-pink-500 hover:to-rose-600 text-white font-bold text-xs sm:text-sm shadow-lotus flex items-center gap-2 transition-all hover:scale-105 active:scale-95"
            >
              <Play size={16} fill="white" />
              <span>Học bài {selectedLesson || (currentLevel === 'N4' ? 26 : 1)}</span>
            </button>

            <button
              type="button"
              onClick={() => askAi('explain_vocab', { word: currentHourlyWord.kanji || currentHourlyWord.kana, lesson_title: `Cấp độ ${currentLevel}` }, `Trợ Lý AI: Cấp độ ${currentLevel}`)}
              className="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm border border-white/20 backdrop-blur-md flex items-center gap-2 transition-all active:scale-95"
            >
              <Sparkles size={16} className="text-pink-300" />
              <span>Hỏi trợ lý AI</span>
            </button>
          </div>
        </div>

        {/* Right 1 Col: Mục Tiêu Hôm Nay */}
        <div className="rounded-3xl bg-white border border-pink-100 p-5 sm:p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-1.5">
                <Target size={16} className="text-pink-600" />
                <h3 className="font-extrabold text-sm text-slate-900 tracking-tight mb-0">
                  Mục tiêu hôm nay
                </h3>
              </div>
              <span className={`px-2.5 py-0.5 rounded-full font-bold text-[11px] border ${
                (gamification?.today_words_count || 0) >= 10
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-pink-50 text-pink-600 border-pink-100'
              }`}>
                {(gamification?.today_words_count || 0) >= 10 ? 'Hoàn thành' : `${gamification?.today_words_count || 0}/10 từ`}
              </span>
            </div>

            {/* Circular Progress & Text */}
            <div className="flex items-center gap-4 my-2">
              <div
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-full p-1 flex items-center justify-center shrink-0 transition-all shadow-inner"
                style={{
                  background: `conic-gradient(#db2777 ${Math.min(100, ((gamification?.today_words_count || 0) / 10) * 100)}%, #fce7f3 0)`
                }}
              >
                <div className="w-full h-full bg-white rounded-full flex items-center justify-center">
                  <div className="flex items-baseline justify-center whitespace-nowrap">
                    <span className="text-xl sm:text-2xl font-black text-slate-900 leading-none">
                      {gamification?.today_words_count || 0}
                    </span>
                    <span className="text-xs font-bold text-slate-400 ml-0.5 shrink-0">/10</span>
                  </div>
                </div>
              </div>
              <div>
                <p className="text-xs text-slate-600 font-medium mb-1.5 leading-snug">
                  {(gamification?.today_words_count || 0) >= 10
                    ? 'Bạn đã hoàn thành chỉ tiêu 10 từ hôm nay!'
                    : `Còn ${Math.max(0, 10 - (gamification?.today_words_count || 0))} từ nữa để đạt chỉ tiêu ngày.`}
                </p>
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-pink-600">
                  <Flame
                    size={14}
                    className={(gamification?.current_streak || 0) > 0 ? 'text-amber-500 fill-amber-500 animate-pulse' : 'text-slate-400'}
                  />
                  <span>
                    {(gamification?.current_streak || 0) > 0
                      ? `Chuỗi ${gamification.current_streak} ngày liên tục`
                      : 'Chưa có chuỗi (Học để kích hoạt)'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 7 Days of the week target tracking (T2 đến CN) */}
          <div className="pt-4 border-t border-pink-50 mt-4">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Mục tiêu 7 ngày trong tuần
              </span>
              <span className="text-[10px] font-medium text-slate-400">
                Chỉ tiêu: 10 từ/ngày
              </span>
            </div>

            <div className="grid grid-cols-7 gap-1 sm:gap-1.5 text-center">
              {weekDays.map((day) => {
                const count = day.isToday
                  ? (gamification?.today_words_count || 0)
                  : ((gamification?.daily_study_counts && gamification.daily_study_counts[day.dateStr]) || 0);
                const isMet = count >= 10;

                return (
                  <div key={day.shortName} className="flex flex-col items-center gap-1.5">
                    {/* Status Indicator Icon Circle */}
                    <div
                      className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-all ${
                        day.isToday
                          ? isMet
                            ? 'bg-gradient-to-tr from-pink-600 to-rose-500 text-white shadow-lotus ring-4 ring-pink-100 scale-110'
                            : 'bg-pink-50 text-pink-700 border-2 border-dashed border-pink-500 ring-4 ring-pink-100/80 scale-105 font-black text-xs'
                          : day.isPast
                          ? isMet
                            ? 'bg-emerald-50 text-emerald-600 border border-emerald-300 ring-1 ring-emerald-400/20 shadow-2xs'
                            : 'bg-rose-50 text-rose-500 border border-rose-200 shadow-2xs'
                          : 'bg-slate-50 text-slate-300 border border-slate-200/80'
                      }`}
                      title={
                        day.isToday
                          ? isMet
                            ? `Hôm nay: Đã hoàn thành (${count}/10 từ)`
                            : `Hôm nay: Đang học (${count}/10 từ)`
                          : day.isPast
                          ? isMet
                            ? `${day.fullName} (${day.dayNum}): Đạt chỉ tiêu (${count}/10 từ)`
                            : `${day.fullName} (${day.dayNum}): Chưa đạt (${count}/10 từ)`
                          : `${day.fullName} (${day.dayNum}): Sắp tới`
                      }
                    >
                      {day.isToday ? (
                        isMet ? (
                          <Check size={14} className="stroke-[3]" />
                        ) : (
                          <span className="text-[11px] font-black">{count}</span>
                        )
                      ) : day.isPast ? (
                        isMet ? (
                          <Check size={13} className="stroke-[3]" />
                        ) : (
                          <X size={12} className="stroke-[2.5]" />
                        )
                      ) : (
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-200" />
                      )}
                    </div>

                    {/* Day name and date number */}
                    <div className="flex flex-col items-center">
                      <span
                        className={`text-[10px] tracking-tight ${
                          day.isToday ? 'text-pink-600 font-black' : 'text-slate-600 font-bold'
                        }`}
                      >
                        {day.shortName}
                      </span>
                      <span className="text-[9px] text-slate-400 font-medium">
                        {day.dayNum}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Legend for Check vs X */}
            <div className="flex items-center justify-center gap-3 pt-3 mt-2 border-t border-slate-100 text-[10px] font-semibold text-slate-500 flex-wrap">
              <div className="flex items-center gap-1">
                <span className="w-3.5 h-3.5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <Check size={9} className="stroke-[3]" />
                </span>
                <span>Đạt (≥10 từ)</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-3.5 h-3.5 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center">
                  <X size={9} className="stroke-[2.5]" />
                </span>
                <span>Chưa đạt</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-3.5 h-3.5 rounded-full bg-pink-100 text-pink-700 flex items-center justify-center">
                  <Flame size={10} className="text-pink-600 fill-pink-500" />
                </span>
                <span>Hôm nay</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── AI SENSEI LEARNING COACH WIDGET ── */}
      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-pink-50 via-rose-50/70 to-pink-50/40 border border-pink-200/80 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-pink-600 to-rose-500 text-white flex items-center justify-center shrink-0 shadow-lotus">
            <Sparkles size={24} />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.2 rounded-md bg-pink-100 text-pink-700 font-extrabold text-[10px] tracking-wider uppercase">
                AI SENSEI COACH
              </span>
              <span className="text-xs font-bold text-slate-800">
                Chẩn đoán học tập hôm nay
              </span>
            </div>
            <p className="text-xs text-slate-600 mb-0 max-w-2xl leading-relaxed">
              {stats.needsReview > 0
                ? `Sensei phát hiện bạn có ${stats.needsReview} từ vựng cần củng cố trong Sổ tay lỗi sai. Hãy dành 3 phút lướt flashcard để củng cố vùng nhớ dài hạn!`
                : `Tuyệt vời! Bạn đang duy trì phong độ xuất sắc với ${stats.mastered} từ thành thạo. Hãy thử sức ngay với Luyện gõ Romaji hoặc Chơi nối từ 60s.`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setActiveTab(stats.needsReview > 0 ? 'notebook' : 'practice')}
            className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-pink-600 hover:bg-pink-700 text-white text-xs font-bold shadow-lotus transition-all active:scale-95 cursor-pointer"
          >
            {stats.needsReview > 0 ? 'Ôn từ sai ngay' : 'Luyện gõ thử thách'}
          </button>
          <button
            type="button"
            onClick={() =>
              askAi(
                'free_question',
                {
                  stats,
                  message: `Tôi hiện đã học ${stats.studied} từ, thành thạo ${stats.mastered} từ, cần ôn ${stats.needsReview} từ. Hãy cho tôi lộ trình ôn thi JLPT N5 tối ưu nhất.`
                },
                'AI Sensei: Lộ Trình Ôn Thi JLPT N5 Cá Nhân Hóa'
              )
            }
            className="flex-1 sm:flex-initial px-3.5 py-2.5 rounded-xl bg-white hover:bg-pink-50 border border-pink-200 text-pink-700 text-xs font-bold transition-all cursor-pointer"
          >
            Nhờ AI tư vấn
          </button>
        </div>
      </div>

      {/* ── 3. MIDDLE ROW: 4 STATS CARDS ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Stat 1: Từ đã học */}
        <div
          onClick={() => setActiveTab('lessons')}
          className="p-4 sm:p-5 rounded-2xl bg-white border border-pink-100 shadow-sm hover:shadow-lotus-sm hover:border-pink-300 transition-all cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <BookOpen size={20} />
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tight">
            {stats.studied}
          </div>
          <div className="text-xs font-bold text-slate-700 mt-0.5">Từ đã học</div>
          <span className="text-[11px] text-slate-400 font-medium">/ 24 từ bài hiện tại</span>
        </div>

        {/* Stat 2: Thành thạo */}
        <div
          onClick={() => setActiveTab('notebook')}
          className="p-4 sm:p-5 rounded-2xl bg-white border border-pink-100 shadow-sm hover:shadow-lotus-sm hover:border-pink-300 transition-all cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <Trophy size={20} />
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tight">
            {stats.mastered}
          </div>
          <div className="text-xs font-bold text-slate-700 mt-0.5">Thành thạo</div>
          <span className="text-[11px] text-emerald-600 font-bold">
            {stats.studied > 0 ? Math.round((stats.mastered / stats.studied) * 100) : 0}% hoàn thành
          </span>
        </div>

        {/* Stat 3: Cần ôn lại */}
        <div
          onClick={() => setActiveTab('notebook')}
          className="p-4 sm:p-5 rounded-2xl bg-white border border-pink-100 shadow-sm hover:shadow-lotus-sm hover:border-pink-300 transition-all cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <Flame size={20} fill="#f59e0b" />
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tight">
            {stats.needsReview}
          </div>
          <div className="text-xs font-bold text-slate-700 mt-0.5">Cần ôn lại</div>
          <span className="text-[11px] text-rose-500 font-bold">Ôn ngay trong Sổ tay</span>
        </div>

        {/* Stat 4: Kanji */}
        <div
          onClick={() => setActiveTab('kanji')}
          className="p-4 sm:p-5 rounded-2xl bg-white border border-pink-100 shadow-sm hover:shadow-lotus-sm hover:border-pink-300 transition-all cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-pink-50 text-pink-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <PenTool size={20} />
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tight">
            {stats.totalKanji}
          </div>
          <div className="text-xs font-bold text-slate-700 mt-0.5">Kanji {currentLevel}</div>
          <span className="text-[11px] text-pink-600 font-medium">Hán tự thông dụng</span>
        </div>
      </div>

      {/* ── 4. BOTTOM ROW: TỪ VỰNG THEO GIỜ + LUYỆN TẬP NHANH ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left: Từ vựng theo giờ (Lotus Pink Gradient Card) */}
        <div className="rounded-3xl bg-gradient-to-br from-pink-600 via-rose-600 to-pink-700 text-white p-6 sm:p-7 shadow-lotus flex flex-col justify-between relative overflow-hidden">
          <div className="absolute right-0 bottom-0 text-white/10 font-jp font-black text-8xl pointer-events-none select-none -mr-4 -mb-4">
            時
          </div>

          <div>
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-1.5">
                <Clock size={13} className="text-pink-200" />
                <span className="text-[11px] font-black text-pink-200 uppercase tracking-wider">
                  TỪ THEO GIỜ - CẤP ĐỘ {currentLevel}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => {
                    sounds.playFlip();
                    setManualOffset(prev => prev + 1);
                  }}
                  className="w-7 h-7 rounded-full bg-white/15 hover:bg-white/30 text-white flex items-center justify-center transition-colors cursor-pointer"
                  title="Đổi sang từ vựng khác ngẫu nhiên"
                >
                  <RotateCw size={13} />
                </button>
                <button
                  type="button"
                  onClick={() => speakJapanese(currentHourlyWord.kanji, currentHourlyWord.kana || currentHourlyWord.clean_kana)}
                  className="w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors cursor-pointer"
                  title="Nghe phát âm chuẩn Tokyo"
                >
                  <Volume2 size={15} />
                </button>
              </div>
            </div>

            <div className="my-2 flex justify-center">
              <FuriganaWord
                kanji={currentHourlyWord.kanji}
                kana={currentHourlyWord.kana || currentHourlyWord.clean_kana}
                romaji={currentHourlyWord.romaji}
                showRomaji={true}
                size="4xl"
                kanjiClassName="text-white"
                furiganaClassName="text-pink-200"
                romajiClassName="text-pink-200/90 font-mono"
              />
            </div>
            <p className="text-xs text-white/90 font-medium bg-black/15 p-2 rounded-xl backdrop-blur-sm mt-2 text-center">
              Ý nghĩa: <strong>{currentHourlyWord.vietnamese || currentHourlyWord.clean_vietnamese || currentHourlyWord.meaning}</strong>
            </p>
          </div>

          <button
            type="button"
            onClick={() => askAi('explain_vocab', currentHourlyWord, `AI Phân Tích: ${currentHourlyWord.kanji || currentHourlyWord.kana}`)}
            className="w-full mt-4 py-2.5 rounded-xl bg-white text-pink-700 font-extrabold text-xs shadow-md hover:bg-pink-50 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            <Sparkles size={14} className="text-pink-600" />
            <span>AI giải thích nguồn gốc & ngữ cảnh</span>
          </button>
        </div>

        {/* Right 2 Cols: Luyện tập nhanh */}
        <div className="lg:col-span-2 rounded-3xl bg-white border border-pink-100 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-extrabold text-base text-slate-900 tracking-tight mb-4">
              Luyện tập nhanh
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Option 1: Flashcard 3D */}
              <div
                onClick={() => setActiveTab('flashcard')}
                className="p-3.5 rounded-2xl border border-pink-100 bg-pink-50/30 hover:bg-pink-50 hover:border-pink-300 cursor-pointer transition-all group"
              >
                <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center mb-2.5 group-hover:scale-110 transition-transform">
                  <Layers size={18} />
                </div>
                <h4 className="font-bold text-xs text-slate-900 mb-0.5">Flashcard 3D</h4>
                <p className="text-[11px] text-slate-500 mb-0">Lật thẻ 2 chiều có phát âm</p>
              </div>

              {/* Option 2: Trắc nghiệm */}
              <div
                onClick={() => setActiveTab('quiz')}
                className="p-3.5 rounded-2xl border border-emerald-100 bg-emerald-50/30 hover:bg-emerald-50 hover:border-emerald-300 cursor-pointer transition-all group"
              >
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-2.5 group-hover:scale-110 transition-transform">
                  <CheckSquare size={18} />
                </div>
                <h4 className="font-bold text-xs text-slate-900 mb-0.5">Trắc nghiệm</h4>
                <p className="text-[11px] text-slate-500 mb-0">Đề thi 4 lựa chọn ABCD</p>
              </div>

              {/* Option 3: Luyện gõ */}
              <div
                onClick={() => setActiveTab('practice')}
                className="p-3.5 rounded-2xl border border-blue-100 bg-blue-50/30 hover:bg-blue-50 hover:border-blue-300 cursor-pointer transition-all group"
              >
                <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center mb-2.5 group-hover:scale-110 transition-transform">
                  <Keyboard size={18} />
                </div>
                <h4 className="font-bold text-xs text-slate-900 mb-0.5">Luyện gõ</h4>
                <p className="text-[11px] text-slate-500 mb-0">Gõ Romaji sang Kana</p>
              </div>

              {/* Option 4: Luyện nghe Choukai */}
              <div
                onClick={() => setActiveTab('listening')}
                className="p-3.5 rounded-2xl border border-rose-100 bg-rose-50/30 hover:bg-rose-50 hover:border-rose-300 cursor-pointer transition-all group"
              >
                <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center mb-2.5 group-hover:scale-110 transition-transform">
                  <Headphones size={18} />
                </div>
                <h4 className="font-bold text-xs text-slate-900 mb-0.5">Luyện nghe</h4>
                <p className="text-[11px] text-slate-500 mb-0">Hội thoại thực tế giọng Tokyo</p>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-pink-50 mt-4 flex justify-between items-center text-xs text-slate-500">
            <span>Muốn ôn tập trợ từ hoặc mini-game nối từ?</span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setActiveTab('forum')}
                className="text-slate-500 font-bold hover:text-pink-600 hover:underline flex items-center gap-1"
              >
                <Newspaper size={13} />
                <span>Diễn đàn & Tin tức</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('wordmatch')}
                className="text-pink-600 font-bold hover:underline flex items-center gap-1"
              >
                <span>Chơi Nối từ</span>
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
