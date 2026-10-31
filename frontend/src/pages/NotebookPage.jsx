import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { vocabService, speakJapanese } from '../services/api';
import { sounds } from '../services/sounds';
import FuriganaWord from '../components/FuriganaWord';
import {
  Bookmark,
  Star,
  Flame,
  CheckCircle2,
  Sparkles,
  Volume2,
  Layers,
  Search,
  Filter,
  Check,
  RotateCcw,
  BookOpen
} from 'lucide-react';

export default function NotebookPage() {
  const {
    guestProgress,
    favorites,
    toggleFavorite,
    recordWordProgress,
    setActiveTab,
    setSelectedLesson,
    askAi
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState('review'); // 'review' | 'favorites' | 'mastered'
  const [allWords, setAllWords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLessonFilter, setSelectedLessonFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch all vocabulary once to cross reference with progress & favorites
  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const res = await vocabService.getVocabularies({});
        setAllWords(res.data?.data || []);
      } catch (err) {
        console.error('Fetch vocab error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  // Compute lists
  const reviewWords = allWords.filter((w) => guestProgress[w.id]?.status === 'needs_review');
  const favoriteWords = allWords.filter((w) => favorites[w.id]);
  const masteredWords = allWords.filter((w) => guestProgress[w.id]?.status === 'mastered');

  let currentList = [];
  if (activeSubTab === 'review') currentList = reviewWords;
  else if (activeSubTab === 'favorites') currentList = favoriteWords;
  else currentList = masteredWords;

  // Apply filters
  const filteredWords = currentList.filter((w) => {
    if (selectedLessonFilter !== 'all' && w.lesson_number !== parseInt(selectedLessonFilter)) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const match =
        (w.kanji && w.kanji.toLowerCase().includes(q)) ||
        (w.kana && w.kana.toLowerCase().includes(q)) ||
        (w.clean_kana && w.clean_kana.toLowerCase().includes(q)) ||
        (w.vietnamese && w.vietnamese.toLowerCase().includes(q)) ||
        (w.clean_vietnamese && w.clean_vietnamese.toLowerCase().includes(q));
      if (!match) return false;
    }
    return true;
  });

  const handleMarkMastered = (wordId) => {
    sounds.playCorrect();
    recordWordProgress(wordId, 'mastered');
  };

  const handleStartReviewFlashcard = () => {
    sounds.playFlip();
    if (currentList.length > 0) {
      setSelectedLesson(currentList[0].lesson_number || 1);
    }
    setActiveTab('flashcard');
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16 animate-in fade-in duration-300">
      {/* ── 1. HEADER BANNER ── */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-pink-100 shadow-sm relative overflow-hidden">
        <div className="absolute right-4 top-2 text-pink-100/50 font-jp font-black text-8xl pointer-events-none select-none">
          記
        </div>

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-50 text-pink-700 font-extrabold text-[11px] uppercase tracking-wider mb-2.5">
            <Bookmark size={13} className="text-pink-600" />
            <span>SỔ TAY CÁ NHÂN - GHI NHỚ N5</span>
          </div>

          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-snug mb-1.5">
            Sổ Tay Từ Vựng & Ôn Tập Từ Sai
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-2xl mb-4">
            Theo dõi danh sách các từ vựng cần củng cố, bộ sưu tập từ yêu thích và toàn bộ kho từ bạn đã chinh phục thành công.
          </p>

          {/* Subtabs Selector */}
          <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-pink-50">
            <button
              type="button"
              onClick={() => { sounds.playFlip(); setActiveSubTab('review'); }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeSubTab === 'review'
                  ? 'bg-rose-500 text-white shadow-lotus'
                  : 'bg-pink-50/60 text-slate-600 hover:bg-pink-100/70 hover:text-pink-600'
              }`}
            >
              <Flame size={15} fill={activeSubTab === 'review' ? 'white' : '#f43f5e'} />
              <span>Cần ôn lại ({reviewWords.length})</span>
            </button>

            <button
              type="button"
              onClick={() => { sounds.playFlip(); setActiveSubTab('favorites'); }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeSubTab === 'favorites'
                  ? 'bg-amber-500 text-white shadow-md'
                  : 'bg-pink-50/60 text-slate-600 hover:bg-pink-100/70 hover:text-pink-600'
              }`}
            >
              <Star size={15} fill={activeSubTab === 'favorites' ? 'white' : '#f59e0b'} />
              <span>Yêu thích ({favoriteWords.length})</span>
            </button>

            <button
              type="button"
              onClick={() => { sounds.playFlip(); setActiveSubTab('mastered'); }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeSubTab === 'mastered'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'bg-pink-50/60 text-slate-600 hover:bg-pink-100/70 hover:text-pink-600'
              }`}
            >
              <CheckCircle2 size={15} />
              <span>Đã thành thạo ({masteredWords.length})</span>
            </button>

            {filteredWords.length > 0 && activeSubTab === 'review' && (
              <button
                type="button"
                onClick={handleStartReviewFlashcard}
                className="ml-auto px-4 py-2 rounded-xl bg-gradient-to-r from-pink-600 to-rose-500 text-white font-bold text-xs shadow-lotus hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Layers size={14} />
                <span>Luyện Flashcard ngay</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── 2. FILTER & SEARCH BAR ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-white border border-pink-100 shadow-sm">
        <div className="relative flex-1 max-w-sm">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm trong danh sách này..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-pink-200 text-xs focus:outline-none focus:ring-2 focus:ring-pink-500 bg-pink-50/20"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500">Lọc theo bài:</span>
          <select
            value={selectedLessonFilter}
            onChange={(e) => setSelectedLessonFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-pink-200 bg-white text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-pink-500 cursor-pointer"
          >
            <option value="all">Tất cả bài học</option>
            {Array.from({ length: 25 }, (_, i) => i + 1).map((n) => (
              <option key={n} value={n}>
                Bài {n < 10 ? `0${n}` : n}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ── 3. WORD LIST OR EMPTY STATE ── */}
      {loading ? (
        <div className="py-20 text-center">
          <div className="w-10 h-10 border-4 border-pink-200 border-t-pink-600 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs font-bold text-slate-400">Đang tải sổ tay từ vựng...</p>
        </div>
      ) : filteredWords.length === 0 ? (
        <div className="p-12 rounded-3xl bg-white border border-pink-100 shadow-sm text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-pink-50 text-pink-500 mx-auto flex items-center justify-center">
            {activeSubTab === 'review' ? (
              <Flame size={32} />
            ) : activeSubTab === 'favorites' ? (
              <Star size={32} />
            ) : (
              <CheckCircle2 size={32} />
            )}
          </div>

          <div className="space-y-1 max-w-md mx-auto">
            <h3 className="text-lg font-black text-slate-900">
              {activeSubTab === 'review' && 'Chưa có từ vựng nào cần ôn lại!'}
              {activeSubTab === 'favorites' && 'Bạn chưa thêm từ vựng yêu thích nào.'}
              {activeSubTab === 'mastered' && 'Chưa có từ vựng nào đánh dấu thành thạo.'}
            </h3>
            <p className="text-xs text-slate-500">
              {activeSubTab === 'review' &&
                'Rất xuất sắc! Khi bạn làm trắc nghiệm hoặc lật flashcard mà trả lời chưa đúng, các từ đó sẽ tự động xuất hiện ở đây.'}
              {activeSubTab === 'favorites' &&
                'Nhấn vào biểu tượng ngôi sao bên cạnh bất kỳ từ vựng nào trong bài học hoặc tra cứu để lưu vào sổ tay nhé.'}
              {activeSubTab === 'mastered' &&
                'Hãy bắt đầu học từ Bài 01 Minna và nhấn "Đã thành thạo" để tích lũy kho từ vựng dài hạn.'}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setActiveTab('lessons')}
            className="px-5 py-2.5 rounded-xl bg-pink-600 hover:bg-pink-700 text-white font-bold text-xs shadow-lotus transition-all cursor-pointer inline-flex items-center gap-2"
          >
            <BookOpen size={15} />
            <span>Đến bài học ngay</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredWords.map((word) => (
            <div
              key={word.id}
              className="p-5 rounded-2xl bg-white border border-pink-100 shadow-sm hover:shadow-lotus-sm transition-all flex flex-col justify-between space-y-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="inline-block px-2.5 py-0.5 rounded-full bg-pink-50 text-pink-700 font-extrabold text-[10.5px] mb-2 border border-pink-100">
                    Bài {word.lesson_number < 10 ? `0${word.lesson_number}` : word.lesson_number}
                  </div>
                  <div className="my-1">
                    <FuriganaWord
                      kanji={word.kanji}
                      kana={word.clean_kana || word.kana}
                      size="xl"
                    />
                  </div>
                  <p className="text-xs font-bold text-slate-700 mt-2">
                    {word.clean_vietnamese || word.vietnamese}
                  </p>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => speakJapanese(word.kanji || word.clean_kana || word.kana)}
                    className="p-2 rounded-xl bg-pink-50 text-pink-600 hover:bg-pink-100 transition-colors cursor-pointer"
                    title="Nghe phát âm Tokyo"
                  >
                    <Volume2 size={16} />
                  </button>

                  <button
                    type="button"
                    onClick={() => toggleFavorite(word.id)}
                    className={`p-2 rounded-xl transition-colors cursor-pointer ${
                      favorites[word.id]
                        ? 'bg-amber-50 text-amber-500 hover:bg-amber-100'
                        : 'bg-slate-50 text-slate-400 hover:text-amber-500 hover:bg-amber-50'
                    }`}
                    title="Yêu thích"
                  >
                    <Star size={16} fill={favorites[word.id] ? '#f59e0b' : 'none'} />
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-pink-50 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => askAi('explain_vocab', word, `AI: Từ Vựng 「${word.kanji || word.kana}」`)}
                  className="px-3 py-1.5 rounded-xl border border-pink-200 text-pink-700 hover:bg-pink-50 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Sparkles size={14} className="text-pink-600" />
                  <span>AI mẹo nhớ</span>
                </button>

                {activeSubTab === 'review' && (
                  <button
                    type="button"
                    onClick={() => handleMarkMastered(word.id)}
                    className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Check size={14} />
                    <span>Đã thuộc</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
