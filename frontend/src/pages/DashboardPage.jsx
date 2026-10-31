import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { lessonService, vocabService, speakJapanese } from '../services/api';
import FuriganaWord from '../components/FuriganaWord';
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
  ArrowRight
} from 'lucide-react';
import { sounds } from '../services/sounds';

export default function DashboardPage() {
  const { user, setActiveTab, setSelectedLesson, gamification, guestProgress, askAi } = useApp();
  const [stats, setStats] = useState({
    studied: 0,
    mastered: 0,
    needsReview: 0,
    totalKanji: 80
  });

  const wordOfTheDay = {
    kanji: '銀行員',
    kana: 'ぎんこういん',
    meaning: 'Nhân viên ngân hàng',
    lesson: 1,
    romaji: 'ginkouin'
  };

  useEffect(() => {
    const studiedCount = Object.keys(guestProgress).length;
    const masteredCount = Object.values(guestProgress).filter(p => p.status === 'mastered').length;
    const needsReviewCount = Object.values(guestProgress).filter(p => p.status === 'needs_review').length;

    setStats({
      studied: studiedCount,
      mastered: masteredCount,
      needsReview: needsReviewCount,
      totalKanji: 80
    });
  }, [guestProgress]);

  const daysOfWeek = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
  const currentDayIdx = (new Date().getDay() + 6) % 7; // Monday = 0, Sunday = 6

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-in fade-in duration-300">
      {/* ── 1. GREETING ── */}
      <div>
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
          Chào mừng trở lại,
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2 flex-wrap">
          <span className="font-jp text-pink-600">こんにちは,</span>
          <span>{user?.username || 'Khách'}!</span>
        </h1>
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
              <span className="w-1.5 h-1.5 rounded-full bg-pink-400 animate-ping" />
              <span>BÀI 02 • Đồ vật quanh ta</span>
            </div>

            {/* Title */}
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-tight leading-snug mb-3 max-w-md">
              Tiếp tục hành trình chinh phục N5
            </h2>

            {/* Progress line */}
            <div className="max-w-md space-y-1.5 mb-6">
              <div className="flex justify-between text-xs text-slate-300 font-medium">
                <span>Tiến độ bài học</span>
                <span className="font-bold text-pink-400">{stats.studied}/24 từ</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-pink-500 via-rose-500 to-pink-400 transition-all duration-500"
                  style={{ width: `${Math.min(100, (stats.studied / 24) * 100)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 relative z-10">
            <button
              type="button"
              onClick={() => {
                setSelectedLesson(2);
                setActiveTab('lessons');
              }}
              className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-pink-600 via-rose-500 to-pink-500 hover:from-pink-500 hover:to-rose-600 text-white font-bold text-xs sm:text-sm shadow-lotus flex items-center gap-2 transition-all hover:scale-105 active:scale-95"
            >
              <Play size={16} fill="white" />
              <span>Học tiếp Bài 02</span>
            </button>

            <button
              type="button"
              onClick={() => askAi('explain_vocab', { word: 'これ (Cái này)', lesson_title: 'Đồ vật quanh ta' }, 'Trợ Lý AI: Bài 02')}
              className="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm border border-white/20 backdrop-blur-md flex items-center gap-2 transition-all active:scale-95"
            >
              <Sparkles size={16} className="text-pink-300" />
              <span>Hỏi trợ lý AI</span>
            </button>
          </div>
        </div>

        {/* Right 1 Col: Mục Tiêu Hôm Nay */}
        <div className="rounded-3xl bg-white border border-pink-100 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-extrabold text-sm text-slate-900 tracking-tight mb-0">
                Mục tiêu hôm nay
              </h3>
              <span className="px-2.5 py-0.5 rounded-full bg-pink-50 text-pink-600 font-bold text-[11px] border border-pink-100">
                10 từ
              </span>
            </div>

            {/* Circular Progress & Text */}
            <div className="flex items-center gap-4 my-2">
              <div className="w-18 h-18 rounded-full border-4 border-pink-100 border-t-pink-600 flex items-center justify-center shrink-0">
                <div className="text-center">
                  <span className="text-lg font-black text-slate-900 block leading-tight">
                    {gamification?.today_words_count || 0}
                  </span>
                  <span className="text-[10px] text-slate-400 font-bold block">/10</span>
                </div>
              </div>
              <div>
                <p className="text-xs text-slate-600 font-medium mb-1">
                  Còn {Math.max(0, 10 - (gamification?.today_words_count || 0))} từ nữa để hoàn thành mục tiêu ngày.
                </p>
                <span className="text-[11px] font-bold text-pink-600">
                  +30 XP thưởng chuỗi
                </span>
              </div>
            </div>
          </div>

          {/* 7 Days of the week dots */}
          <div className="pt-4 border-t border-pink-50 mt-4">
            <div className="flex justify-between items-center">
              {daysOfWeek.map((day, idx) => {
                const isPassed = idx < currentDayIdx;
                const isToday = idx === currentDayIdx;
                return (
                  <div key={day} className="flex flex-col items-center gap-1.5">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${
                        isToday
                          ? 'bg-pink-600 text-white ring-4 ring-pink-100 scale-110 shadow-sm'
                          : isPassed
                          ? 'bg-pink-200 text-pink-700'
                          : 'bg-slate-100 text-slate-400'
                      }`}
                    >
                      {isPassed ? '✓' : isToday ? '★' : ''}
                    </div>
                    <span className={`text-[10px] font-semibold ${isToday ? 'text-pink-600 font-bold' : 'text-slate-400'}`}>
                      {day}
                    </span>
                  </div>
                );
              })}
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
          <div className="text-xs font-bold text-slate-700 mt-0.5">Kanji N5</div>
          <span className="text-[11px] text-pink-600 font-medium">Hán tự thông dụng</span>
        </div>
      </div>

      {/* ── 4. BOTTOM ROW: TỪ CỦA NGÀY + LUYỆN TẬP NHANH ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left: Từ của ngày (Lotus Pink Gradient Card) */}
        <div className="rounded-3xl bg-gradient-to-br from-pink-600 via-rose-600 to-pink-700 text-white p-6 sm:p-7 shadow-lotus flex flex-col justify-between relative overflow-hidden">
          <div className="absolute right-0 bottom-0 text-white/10 font-jp font-black text-8xl pointer-events-none select-none -mr-4 -mb-4">
            日
          </div>

          <div>
            <div className="flex justify-between items-center mb-3">
              <span className="text-[11px] font-black text-pink-200 uppercase tracking-wider">
                TỪ CỦA NGÀY
              </span>
              <button
                type="button"
                onClick={() => speakJapanese(wordOfTheDay.kanji || wordOfTheDay.kana)}
                className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors"
                title="Nghe phát âm chuẩn Tokyo"
              >
                <Volume2 size={16} />
              </button>
            </div>

            <div className="my-2">
              <FuriganaWord
                kanji={wordOfTheDay.kanji}
                kana={wordOfTheDay.kana}
                size="4xl"
                kanjiClassName="text-white"
                furiganaClassName="text-pink-200"
              />
            </div>
            <p className="text-xs text-white/90 font-medium bg-black/15 p-2 rounded-xl backdrop-blur-sm mt-2">
              Ý nghĩa: <strong>{wordOfTheDay.meaning}</strong>
            </p>
          </div>

          <button
            type="button"
            onClick={() => askAi('explain_vocab', wordOfTheDay, `AI Phân Tích: ${wordOfTheDay.kanji}`)}
            className="w-full mt-4 py-2.5 rounded-xl bg-white text-pink-700 font-extrabold text-xs shadow-md hover:bg-pink-50 flex items-center justify-center gap-1.5 transition-all"
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

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Option 1: Flashcard 3D */}
              <div
                onClick={() => setActiveTab('flashcard')}
                className="p-4 rounded-2xl border border-pink-100 bg-pink-50/30 hover:bg-pink-50 hover:border-pink-300 cursor-pointer transition-all group"
              >
                <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <Layers size={20} />
                </div>
                <h4 className="font-bold text-xs text-slate-900 mb-1">Flashcard 3D</h4>
                <p className="text-[11px] text-slate-500 mb-0">Lật thẻ Nhật - Việt có âm thanh tự động</p>
              </div>

              {/* Option 2: Trắc nghiệm */}
              <div
                onClick={() => setActiveTab('quiz')}
                className="p-4 rounded-2xl border border-emerald-100 bg-emerald-50/30 hover:bg-emerald-50 hover:border-emerald-300 cursor-pointer transition-all group"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <CheckSquare size={20} />
                </div>
                <h4 className="font-bold text-xs text-slate-900 mb-1">Trắc nghiệm</h4>
                <p className="text-[11px] text-slate-500 mb-0">Đề thi 4 lựa chọn ABCD bấm giờ</p>
              </div>

              {/* Option 3: Luyện gõ */}
              <div
                onClick={() => setActiveTab('practice')}
                className="p-4 rounded-2xl border border-blue-100 bg-blue-50/30 hover:bg-blue-50 hover:border-blue-300 cursor-pointer transition-all group"
              >
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <Keyboard size={20} />
                </div>
                <h4 className="font-bold text-xs text-slate-900 mb-1">Luyện gõ</h4>
                <p className="text-[11px] text-slate-500 mb-0">Gõ Romaji chuyển Hiragana nhớ sâu</p>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-pink-50 mt-4 flex justify-between items-center text-xs text-slate-500">
            <span>Muốn ôn tập trợ từ hoặc mini-game nối từ?</span>
            <button
              type="button"
              onClick={() => setActiveTab('wordmatch')}
              className="text-pink-600 font-bold hover:underline flex items-center gap-1"
            >
              <span>Chơi Nối từ 60s</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
