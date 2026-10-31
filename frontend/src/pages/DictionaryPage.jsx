import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { vocabService, speakJapanese } from '../services/api';
import { sounds } from '../services/sounds';
import {
  Search,
  BookOpen,
  Volume2,
  Star,
  Sparkles,
  Filter,
  Check,
  ChevronLeft,
  ChevronRight,
  Layers,
  HelpCircle,
  Zap,
  Info
} from 'lucide-react';

export default function DictionaryPage() {
  const { favorites, toggleFavorite, askAi, setSelectedLesson, setActiveTab } = useApp();

  const [allWords, setAllWords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [lessonFilter, setLessonFilter] = useState('all');
  const [charTypeFilter, setCharTypeFilter] = useState('all'); // 'all' | 'kanji' | 'kana_only' | 'katakana'
  const [activeAiTopic, setActiveAiTopic] = useState(null);
  const [page, setPage] = useState(1);
  const pageSize = 24;

  const aiSmartTopics = [
    { id: 'verbs', title: 'Động từ hành động thường ngày', query: 'ます' },
    { id: 'adjectives', title: 'Tính từ miêu tả & cảm xúc', query: 'い' },
    { id: 'places', title: 'Địa điểm & phương tiện', query: 'ở' },
    { id: 'traps', title: 'Từ hay bẫy trong kỳ thi N5', query: 'người' },
  ];

  useEffect(() => {
    const fetchVocabs = async () => {
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
    fetchVocabs();
  }, []);

  const handleSelectAiTopic = (topic) => {
    sounds.playFlip();
    if (activeAiTopic?.id === topic.id) {
      setActiveAiTopic(null);
      setSearchTerm('');
    } else {
      setActiveAiTopic(topic);
      setSearchTerm(topic.query);
    }
  };

  const filteredWords = useMemo(() => {
    return allWords.filter((w) => {
      // Lesson filter
      if (lessonFilter !== 'all' && w.lesson_number !== parseInt(lessonFilter)) {
        return false;
      }

      // Character type filter
      if (charTypeFilter === 'kanji' && (!w.kanji || !/[\u4E00-\u9FAF]/.test(w.kanji))) {
        return false;
      }
      if (charTypeFilter === 'katakana' && !/[\u30A0-\u30FF]/.test(w.kana || w.clean_kana || '')) {
        return false;
      }
      if (charTypeFilter === 'kana_only' && w.kanji && /[\u4E00-\u9FAF]/.test(w.kanji)) {
        return false;
      }

      // Search term
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase().trim();
        const match =
          (w.kanji && w.kanji.toLowerCase().includes(q)) ||
          (w.kana && w.kana.toLowerCase().includes(q)) ||
          (w.clean_kana && w.clean_kana.toLowerCase().includes(q)) ||
          (w.romaji && w.romaji.toLowerCase().includes(q)) ||
          (w.vietnamese && w.vietnamese.toLowerCase().includes(q)) ||
          (w.clean_vietnamese && w.clean_vietnamese.toLowerCase().includes(q));
        if (!match) return false;
      }

      return true;
    });
  }, [allWords, lessonFilter, charTypeFilter, searchTerm]);

  // Reset page on filter change
  useEffect(() => {
    setPage(1);
  }, [lessonFilter, charTypeFilter, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filteredWords.length / pageSize));
  const paginatedWords = filteredWords.slice((page - 1) * pageSize, page * pageSize);

  const handleStudyLesson = (lessonNum) => {
    sounds.playFlip();
    setSelectedLesson(lessonNum);
    setActiveTab('lessons');
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16 animate-in fade-in duration-300">
      {/* ── 1. HEADER BANNER ── */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-pink-100 shadow-sm relative overflow-hidden">
        <div className="absolute right-4 top-2 text-pink-100/50 font-jp font-black text-8xl pointer-events-none select-none">
          辞
        </div>

        <div className="relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-50 text-pink-700 font-extrabold text-[11px] uppercase tracking-wider border border-pink-100">
            <Search size={13} className="text-pink-600" />
            <span>TRA CỨU TOÀN DIỆN • 1.512 TỪ VỰNG N5</span>
          </div>

          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-snug mb-1">
              Từ Điển & Tra Cứu Từ Vựng N5
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 max-w-2xl mb-0">
              Tra cứu nhanh theo chữ Hán, Hiragana, Romaji hoặc nghĩa tiếng Việt. Tích hợp phân tích sắc thái ngữ cảnh và mẹo nhớ từ AI Sensei.
            </p>
          </div>

          {/* AI Smart Topics Suggestion Chips */}
          <div className="pt-2">
            <span className="text-[10.5px] font-extrabold text-slate-400 uppercase tracking-wider block mb-2">
              ✦ GỢI Ý CHỦ ĐỀ THÔNG MINH TỪ AI:
            </span>
            <div className="flex flex-wrap gap-2">
              {aiSmartTopics.map((topic) => {
                const isActive = activeAiTopic?.id === topic.id;
                return (
                  <button
                    key={topic.id}
                    type="button"
                    onClick={() => handleSelectAiTopic(topic)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      isActive
                        ? 'bg-pink-600 text-white shadow-lotus ring-2 ring-pink-300'
                        : 'bg-pink-50/70 border border-pink-200 text-pink-700 hover:bg-pink-100'
                    }`}
                  >
                    <Sparkles size={13} className={isActive ? 'text-white' : 'text-pink-600'} />
                    <span>{topic.title}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Search Controls Bar */}
          <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-pink-50">
            <div className="relative flex-1 min-w-[240px]">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Nhập từ cần tìm: ví dụ 私, watashi, tôi, 先生..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-pink-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 bg-pink-50/20 focus:bg-white transition-all"
              />
            </div>

            {/* Filter by Lesson */}
            <select
              value={lessonFilter}
              onChange={(e) => { sounds.playFlip(); setLessonFilter(e.target.value); }}
              className="px-3.5 py-2.5 rounded-xl border border-pink-200 bg-white text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-pink-500 cursor-pointer"
            >
              <option value="all">Tất cả bài học (01-25)</option>
              {Array.from({ length: 25 }, (_, i) => i + 1).map((n) => (
                <option key={n} value={n}>
                  Bài {n < 10 ? `0${n}` : n}
                </option>
              ))}
            </select>

            {/* Filter by Character Type */}
            <div className="flex items-center p-1 bg-pink-50/60 rounded-xl border border-pink-100">
              <button
                type="button"
                onClick={() => { sounds.playFlip(); setCharTypeFilter('all'); }}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  charTypeFilter === 'all'
                    ? 'bg-white text-pink-600 shadow-sm'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Tất cả
              </button>
              <button
                type="button"
                onClick={() => { sounds.playFlip(); setCharTypeFilter('kanji'); }}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  charTypeFilter === 'kanji'
                    ? 'bg-white text-pink-600 shadow-sm'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Có Chữ Hán
              </button>
              <button
                type="button"
                onClick={() => { sounds.playFlip(); setCharTypeFilter('katakana'); }}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  charTypeFilter === 'katakana'
                    ? 'bg-white text-pink-600 shadow-sm'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Katakana
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── 2. STATS BAR ── */}
      <div className="flex justify-between items-center px-1 text-xs font-bold text-slate-500">
        <span>Tìm thấy <strong className="text-pink-600 font-black">{filteredWords.length}</strong> từ vựng phù hợp</span>
        <span>Trang {page} / {totalPages}</span>
      </div>

      {/* ── 3. RESULTS GRID ── */}
      {loading ? (
        <div className="py-20 text-center">
          <div className="w-10 h-10 border-4 border-pink-200 border-t-pink-600 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs font-bold text-slate-400">Đang tra cứu từ điển...</p>
        </div>
      ) : paginatedWords.length === 0 ? (
        <div className="p-12 rounded-3xl bg-white border border-pink-100 shadow-sm text-center space-y-3">
          <Search size={32} className="text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-700">Không tìm thấy từ vựng phù hợp</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Hãy thử tìm bằng từ khóa khác hoặc chuyển bộ lọc bài học về "Tất cả bài học".
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {paginatedWords.map((word) => (
            <div
              key={word.id}
              className="p-5 rounded-3xl bg-white border border-pink-100 shadow-sm hover:shadow-lotus-sm transition-all flex flex-col justify-between space-y-3"
            >
              <div>
                <div className="flex justify-between items-start mb-2">
                  <button
                    type="button"
                    onClick={() => handleStudyLesson(word.lesson_number)}
                    className="inline-block px-2.5 py-0.5 rounded-full bg-pink-50 text-pink-700 font-extrabold text-[10.5px] border border-pink-100 hover:bg-pink-100 transition-colors cursor-pointer"
                  >
                    Bài {word.lesson_number < 10 ? `0${word.lesson_number}` : word.lesson_number}
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => speakJapanese(word.kanji || word.clean_kana || word.kana)}
                      className="p-1.5 rounded-lg bg-pink-50 text-pink-600 hover:bg-pink-100 transition-colors cursor-pointer"
                      title="Nghe phát âm"
                    >
                      <Volume2 size={15} />
                    </button>

                    <button
                      type="button"
                      onClick={() => toggleFavorite(word.id)}
                      className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                        favorites[word.id]
                          ? 'bg-amber-50 text-amber-500'
                          : 'bg-slate-50 text-slate-400 hover:text-amber-500'
                      }`}
                      title="Lưu vào yêu thích"
                    >
                      <Star size={15} fill={favorites[word.id] ? '#f59e0b' : 'none'} />
                    </button>
                  </div>
                </div>

                <h3 className="text-2xl font-black font-jp text-slate-900 leading-tight">
                  {word.kanji || word.clean_kana || word.kana}
                </h3>
                <div className="text-xs font-jp font-semibold text-pink-600 mt-0.5">
                  {word.clean_kana || word.kana} {word.romaji ? `• ${word.romaji}` : ''}
                </div>
                <p className="text-xs font-bold text-slate-700 mt-2 line-clamp-2">
                  {word.clean_vietnamese || word.vietnamese}
                </p>
              </div>

              <div className="pt-2 border-t border-pink-50 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => askAi('explain_vocab', word, `AI Phân Tích: 「${word.kanji || word.kana}」`)}
                  className="text-xs font-bold text-pink-600 hover:text-pink-800 flex items-center gap-1 cursor-pointer"
                >
                  <Sparkles size={13} />
                  <span>AI phân tích ngữ cảnh & mẹo nhớ</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── 4. PAGINATION CONTROLS ── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <button
            type="button"
            disabled={page === 1}
            onClick={() => { sounds.playFlip(); setPage((p) => Math.max(1, p - 1)); }}
            className="p-2 rounded-xl border border-pink-200 bg-white text-slate-600 hover:bg-pink-50 disabled:opacity-40 cursor-pointer"
          >
            <ChevronLeft size={16} />
          </button>

          <span className="text-xs font-bold text-slate-600 px-3">
            {page} / {totalPages}
          </span>

          <button
            type="button"
            disabled={page === totalPages}
            onClick={() => { sounds.playFlip(); setPage((p) => Math.min(totalPages, p + 1)); }}
            className="p-2 rounded-xl border border-pink-200 bg-white text-slate-600 hover:bg-pink-50 disabled:opacity-40 cursor-pointer"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
