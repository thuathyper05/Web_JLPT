import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { vocabService, lessonService, speakJapanese } from '../services/api';
import { sounds } from '../services/sounds';
import FuriganaWord from '../components/FuriganaWord';
import {
  BookOpen,
  Volume2,
  Star,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Layers,
  CheckSquare,
  Search,
  CheckCircle2,
  RotateCcw,
  List,
  Maximize2
} from 'lucide-react';

export default function LessonsPage() {
  const { selectedLesson, setSelectedLesson, setActiveTab, guestProgress, recordWordProgress, askAi } = useApp();

  const [lessonInfo, setLessonInfo] = useState(null);
  const [vocabularies, setVocabularies] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [viewMode, setViewMode] = useState('single'); // 'single' | 'list'
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [favorites, setFavorites] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [lRes, vRes] = await Promise.all([
          lessonService.getLesson(selectedLesson),
          vocabService.getVocabularies({ lesson: selectedLesson })
        ]);
        setLessonInfo(lRes.data);
        setVocabularies(vRes.data?.data || []);
        setCurrentIndex(0);
      } catch (err) {
        console.error('Fetch lesson error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedLesson]);

  const currentWord = vocabularies[currentIndex];

  const handleNext = () => {
    sounds.playFlip();
    if (currentIndex < vocabularies.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    sounds.playFlip();
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleRate = (status) => {
    if (!currentWord) return;
    if (status === 'mastered') {
      sounds.playCorrect();
    } else {
      sounds.playWrong();
    }

    recordWordProgress(currentWord.id, status);

    // Auto advance
    if (currentIndex < vocabularies.length - 1) {
      setTimeout(() => {
        setCurrentIndex((prev) => prev + 1);
      }, 250);
    }
  };

  const toggleFavorite = (id) => {
    sounds.playFlip();
    setFavorites((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredList = vocabularies.filter((v) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (v.kanji && v.kanji.toLowerCase().includes(q)) ||
      (v.kana && v.kana.toLowerCase().includes(q)) ||
      (v.clean_vietnamese && v.clean_vietnamese.toLowerCase().includes(q)) ||
      (v.vietnamese && v.vietnamese.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16 animate-in fade-in duration-300">
      {/* ── 1. HEADER BANNER (MATCHES IMAGE 3) ── */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-pink-100 shadow-sm relative overflow-hidden">
        <div className="absolute right-4 top-2 text-pink-100/50 font-jp font-black text-8xl pointer-events-none select-none">
          学
        </div>

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-50 text-pink-700 font-extrabold text-[11px] uppercase tracking-wider mb-2.5">
            <BookOpen size={13} className="text-pink-600" />
            <span>MINNA NO NIHONGO - BÀI {selectedLesson < 10 ? `0${selectedLesson}` : selectedLesson}</span>
          </div>

          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-snug mb-1.5">
            Bài {selectedLesson}: {lessonInfo?.title || 'Từ vựng & Mẫu câu'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-2xl mb-5">
            Trọn bộ {vocabularies.length} từ vựng Minna no Nihongo tích hợp phát âm chuẩn Tokyo và giải thích AI.
          </p>

          {/* Controls Bar: Lesson Dropdown + Mode Switch + Quick Links */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-pink-50">
            {/* Left: Choose Lesson */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500">Chọn bài:</span>
              <select
                value={selectedLesson}
                onChange={(e) => {
                  sounds.playFlip();
                  setSelectedLesson(parseInt(e.target.value));
                }}
                className="px-3 py-1.5 rounded-xl border border-pink-200 bg-pink-50/50 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-pink-500 cursor-pointer"
              >
                {Array.from({ length: 25 }, (_, i) => i + 1).map((num) => (
                  <option key={num} value={num}>
                    Bài {num < 10 ? `0${num}` : num}
                  </option>
                ))}
              </select>
            </div>

            {/* Middle: View Mode Tabs */}
            <div className="flex items-center p-1 bg-pink-50/60 rounded-xl border border-pink-100">
              <button
                type="button"
                onClick={() => { sounds.playFlip(); setViewMode('single'); }}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                  viewMode === 'single'
                    ? 'bg-white text-pink-600 shadow-sm'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Từng từ
              </button>
              <button
                type="button"
                onClick={() => { sounds.playFlip(); setViewMode('list'); }}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                  viewMode === 'list'
                    ? 'bg-white text-pink-600 shadow-sm'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Danh sách
              </button>
            </div>

            {/* Right: Quick Links to Flashcard / Quiz */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveTab('flashcard')}
                className="px-3 py-1.5 rounded-xl border border-purple-200 text-purple-700 hover:bg-purple-50 text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                <Layers size={14} />
                <span>Flashcard</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('quiz')}
                className="px-3 py-1.5 rounded-xl border border-emerald-200 text-emerald-700 hover:bg-emerald-50 text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                <CheckSquare size={14} />
                <span>Trắc nghiệm</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── 2. SINGLE WORD STUDY MODE (EXACT IMAGE 3 CARD) ── */}
      {viewMode === 'single' && currentWord && (
        <div className="space-y-4 max-w-xl mx-auto">
          {/* Progress Indicator */}
          <div className="flex justify-between items-center text-xs font-bold text-slate-500 px-1">
            <span>Từ số {currentIndex + 1} / {vocabularies.length}</span>
            <span className="text-pink-600">
              {Math.round(((currentIndex + 1) / vocabularies.length) * 100)}%
            </span>
          </div>

          <div className="w-full h-1.5 rounded-full bg-pink-100 overflow-hidden">
            <div
              className="h-full bg-pink-600 rounded-full transition-all duration-300"
              style={{ width: `${((currentIndex + 1) / vocabularies.length) * 100}%` }}
            />
          </div>

          {/* Main Flashcard Card */}
          <div className="p-8 rounded-3xl bg-white border border-pink-100 shadow-lotus relative overflow-hidden text-center space-y-6">
            {/* Top Toolbar in Card */}
            <div className="flex justify-between items-center">
              <span className="px-2.5 py-1 rounded-lg bg-pink-600 text-white font-extrabold text-[11px]">
                Bài {selectedLesson} - #{currentIndex + 1}
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => askAi('explain_vocab', currentWord, `AI Phân Tích: ${currentWord.kanji || currentWord.kana}`)}
                  className="px-2.5 py-1 rounded-lg bg-pink-50 hover:bg-pink-100 text-pink-700 border border-pink-200 text-xs font-bold flex items-center gap-1 transition-colors"
                  title="Hỏi trợ lý AI về từ này"
                >
                  <Sparkles size={13} className="text-pink-600" />
                  <span>Hỏi AI</span>
                </button>

                <button
                  type="button"
                  onClick={() => toggleFavorite(currentWord.id)}
                  className={`p-1.5 rounded-lg border transition-colors ${
                    favorites[currentWord.id]
                      ? 'border-amber-300 bg-amber-50 text-amber-500'
                      : 'border-slate-200 text-slate-400 hover:text-amber-500'
                  }`}
                >
                  <Star size={16} fill={favorites[currentWord.id] ? '#f59e0b' : 'transparent'} />
                </button>
              </div>
            </div>

            {/* Kanji and Kana Area with Furigana */}
            <div className="py-4 space-y-2">
              <div className="flex justify-center items-center">
                <FuriganaWord
                  kanji={currentWord.kanji}
                  kana={currentWord.clean_kana || currentWord.kana}
                  size="5xl"
                />
              </div>

              <div className="flex items-center justify-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => speakJapanese(currentWord.kanji || currentWord.kana)}
                  className="px-3.5 py-1 rounded-full bg-pink-50 hover:bg-pink-100 text-pink-600 flex items-center gap-1.5 transition-colors cursor-pointer text-xs font-bold"
                  title="Nghe phát âm Tokyo"
                >
                  <Volume2 size={15} />
                  <span>Nghe phát âm Tokyo</span>
                </button>
              </div>
            </div>

            {/* Meaning Box */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 font-bold text-slate-800 text-base max-w-sm mx-auto">
              {currentWord.clean_vietnamese || currentWord.vietnamese}
            </div>

            {/* Evaluation Actions */}
            <div className="pt-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-3">
                Đánh giá ghi nhớ:
              </span>
              <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto">
                <button
                  type="button"
                  onClick={() => handleRate('needs_review')}
                  className="py-3 px-4 rounded-2xl border border-rose-200 bg-rose-50/50 hover:bg-rose-100/70 text-rose-700 font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all active:scale-95 shadow-sm"
                >
                  <RotateCcw size={16} />
                  <span>Cần ôn lại</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleRate('mastered')}
                  className="py-3 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-600 text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all active:scale-95 shadow-md"
                >
                  <CheckCircle2 size={16} />
                  <span>Đã thành thạo</span>
                </button>
              </div>
            </div>
          </div>

          {/* Prev / Next Navigation Buttons */}
          <div className="flex justify-between items-center pt-2">
            <button
              type="button"
              disabled={currentIndex === 0}
              onClick={handlePrev}
              className="px-4 py-2 rounded-xl border border-pink-200 bg-white text-slate-700 font-bold text-xs flex items-center gap-1.5 shadow-sm hover:bg-pink-50 disabled:opacity-40 transition-all"
            >
              <ChevronLeft size={16} />
              <span>Từ trước</span>
            </button>

            <span className="text-xs font-semibold text-slate-400">
              Dùng phím mũi tên hoặc nhấn để học
            </span>

            <button
              type="button"
              disabled={currentIndex === vocabularies.length - 1}
              onClick={handleNext}
              className="px-4 py-2 rounded-xl bg-pink-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-lotus hover:bg-pink-700 disabled:opacity-40 transition-all"
            >
              <span>Từ tiếp</span>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* ── 3. LIST TABLE VIEW ── */}
      {viewMode === 'list' && (
        <div className="p-6 rounded-3xl bg-white border border-pink-100 shadow-sm space-y-4">
          {/* Search Input */}
          <div className="relative max-w-sm">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm từ vựng, kana, nghĩa..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-pink-200 text-xs focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
          </div>

          {/* Words List */}
          <div className="divide-y divide-pink-50 overflow-hidden">
            {filteredList.map((item, idx) => (
              <div
                key={item.id || idx}
                className="py-3 px-2 flex items-center justify-between hover:bg-pink-50/30 rounded-xl transition-colors"
              >
                <div className="flex items-center gap-4">
                  <span className="text-xs font-bold text-slate-400 w-6">#{idx + 1}</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <FuriganaWord
                        kanji={item.kanji}
                        kana={item.clean_kana || item.kana}
                        size="base"
                      />
                    </div>
                    <div className="text-xs text-slate-600 mt-0.5">
                      {item.clean_vietnamese || item.vietnamese}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => speakJapanese(item.kanji || item.kana)}
                    className="p-2 rounded-lg text-pink-600 hover:bg-pink-100/70"
                    title="Nghe phát âm"
                  >
                    <Volume2 size={16} />
                  </button>

                  <button
                    type="button"
                    onClick={() => askAi('explain_vocab', item, `AI: ${item.kanji || item.kana}`)}
                    className="p-2 rounded-lg text-slate-400 hover:text-pink-600 hover:bg-pink-50"
                    title="Hỏi AI"
                  >
                    <Sparkles size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
