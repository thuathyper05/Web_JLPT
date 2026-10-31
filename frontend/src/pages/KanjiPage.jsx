import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { kanjiService, speakJapanese } from '../services/api';
import { sounds } from '../services/sounds';
import {
  PenTool,
  Search,
  Volume2,
  Sparkles,
  X,
  BookOpen,
  Info
} from 'lucide-react';

export default function KanjiPage() {
  const { currentLevel, askAi } = useApp();
  const [kanjiList, setKanjiList] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedKanji, setSelectedKanji] = useState(null);

  useEffect(() => {
    const fetchKanji = async () => {
      setLoading(true);
      try {
        const res = await kanjiService.getKanji();
        setKanjiList(res.data || []);
      } catch (err) {
        console.error('Fetch kanji error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchKanji();
  }, [currentLevel]);

  const filtered = kanjiList.filter((item) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase().trim();
    return (
      item.kanji.includes(q) ||
      (item.han_viet && item.han_viet.toLowerCase().includes(q)) ||
      (item.meaning && item.meaning.toLowerCase().includes(q)) ||
      (item.onyomi && item.onyomi.toLowerCase().includes(q)) ||
      (item.kunyomi && item.kunyomi.toLowerCase().includes(q))
    );
  });

  const openDetail = (item) => {
    sounds.playFlip();
    setSelectedKanji(item);
    speakJapanese(item.kanji);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16 animate-in fade-in duration-300">
      {/* ── 1. HEADER (MATCHES IMAGE 2) ── */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-pink-100 shadow-sm relative overflow-hidden">
        {/* Background Japanese Watermark */}
        <div className="absolute right-4 top-2 text-pink-100/50 font-jp font-black text-8xl pointer-events-none select-none">
          学
        </div>

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-50 text-pink-700 font-extrabold text-[11px] uppercase tracking-wider mb-2.5">
            <PenTool size={13} className="text-pink-600" />
            <span>CHỮ HÁN KANJI • JLPT {currentLevel || 'N5'}</span>
          </div>

          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-snug mb-1.5">
            Bảng Chữ Hán Kanji N5
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-2xl mb-6">
            Tra cứu Hán tự N5 cơ bản với âm Hán Việt, cách đọc On/Kun và số nét.
          </p>

          {/* Search Row */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-pink-50">
            <div className="relative flex-1 max-w-md">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Tìm Kanji, Hán Việt, nghĩa..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-pink-200 text-xs focus:outline-none focus:ring-2 focus:ring-pink-500 bg-pink-50/30 focus:bg-white transition-all"
              />
            </div>

            <div className="px-3.5 py-1.5 rounded-xl bg-pink-50 border border-pink-200/80 text-pink-700 font-extrabold text-xs">
              {filtered.length} Kanji
            </div>
          </div>
        </div>
      </div>

      {/* ── 2. KANJI GRID (MATCHES IMAGE 2 CARDS) ── */}
      {loading ? (
        <div className="py-20 text-center">
          <div className="w-10 h-10 border-4 border-pink-200 border-t-pink-600 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs font-bold text-slate-400">Đang tải bảng Chữ Hán Kanji...</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {filtered.map((item, idx) => (
            <div
              key={item.id || idx}
              onClick={() => openDetail(item)}
              className="p-5 rounded-2xl bg-white border border-pink-100/90 shadow-sm hover:shadow-lotus hover:border-pink-300 hover:-translate-y-1 transition-all cursor-pointer flex flex-col justify-between relative group"
            >
              {/* Stroke Badge */}
              <div className="absolute top-3 right-3 text-[10px] font-bold text-slate-400 bg-pink-50/60 px-2 py-0.5 rounded-full border border-pink-100">
                {item.stroke || item.stroke_count || 1} nét
              </div>

              {/* Kanji Char */}
              <div className="text-center my-3">
                <div className="text-5xl font-black font-jp text-slate-900 mb-2 group-hover:scale-110 group-hover:text-pink-600 transition-all">
                  {item.kanji}
                </div>

                {/* Hán Việt Pill */}
                <span className="inline-block px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 font-extrabold text-[11px] mb-1.5">
                  {item.han_viet}
                </span>

                {/* Meaning */}
                <div className="text-xs font-bold text-slate-800 truncate px-1">
                  {item.meaning}
                </div>
              </div>

              {/* On / Kun Footer */}
              <div className="pt-3 border-t border-pink-50 text-[11px] text-slate-500 space-y-0.5">
                <div className="truncate">
                  <strong className="text-slate-600">On:</strong> {item.onyomi || '—'}
                </div>
                <div className="truncate">
                  <strong className="text-slate-600">Kun:</strong> {item.kunyomi || '—'}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── 3. KANJI DETAIL MODAL ── */}
      {selectedKanji && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in"
          onClick={() => setSelectedKanji(null)}
        >
          <div
            className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-pink-100 overflow-hidden p-6 relative animate-in zoom-in-95 space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setSelectedKanji(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-800 p-1 rounded-full"
            >
              <X size={20} />
            </button>

            {/* Top Char */}
            <div className="text-center pt-2">
              <span className="px-3 py-1 rounded-full bg-pink-100 text-pink-700 font-extrabold text-xs">
                Kanji N5 • {selectedKanji.stroke || selectedKanji.stroke_count || 1} nét
              </span>
              <h2 className="text-7xl font-black font-jp text-slate-900 my-2">
                {selectedKanji.kanji}
              </h2>
              <div className="text-xl font-black text-amber-600 mb-1">
                {selectedKanji.han_viet}
              </div>
              <p className="text-sm font-bold text-slate-700 mb-3">
                {selectedKanji.meaning}
              </p>

              <div className="flex justify-center gap-2">
                <button
                  type="button"
                  onClick={() => speakJapanese(selectedKanji.kanji)}
                  className="px-4 py-1.5 rounded-full bg-pink-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-lotus-sm hover:bg-pink-700 transition-colors"
                >
                  <Volume2 size={15} />
                  <span>Nghe phát âm</span>
                </button>

                <button
                  type="button"
                  onClick={() => askAi('explain_kanji', selectedKanji, `AI: Chữ Hán ${selectedKanji.kanji}`)}
                  className="px-4 py-1.5 rounded-full border border-pink-200 text-pink-700 bg-pink-50 font-bold text-xs flex items-center gap-1.5 hover:bg-pink-100 transition-colors"
                >
                  <Sparkles size={15} className="text-pink-600" />
                  <span>AI mẹo nhớ tượng hình</span>
                </button>
              </div>
            </div>

            {/* Reading Grid */}
            <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-pink-50/50 border border-pink-100 text-center">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Âm On</span>
                <span className="text-sm font-black font-jp text-pink-600">
                  {selectedKanji.onyomi || '—'}
                </span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Âm Kun</span>
                <span className="text-sm font-black font-jp text-emerald-600">
                  {selectedKanji.kunyomi || '—'}
                </span>
              </div>
            </div>

            {/* Compound Examples */}
            {selectedKanji.examples && selectedKanji.examples.length > 0 && (
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <BookOpen size={14} className="text-pink-600" />
                  <span>Từ ghép thông dụng:</span>
                </span>
                <div className="space-y-1.5 max-h-36 overflow-y-auto">
                  {selectedKanji.examples.map((ex, exIdx) => (
                    <div
                      key={exIdx}
                      className="p-2 rounded-xl bg-slate-50 border border-slate-200/60 flex items-center justify-between text-xs"
                    >
                      <div>
                        <strong className="font-jp text-slate-900 mr-2">{ex.w}</strong>
                        <span className="text-pink-600 font-jp mr-2">({ex.k})</span>
                        <span className="text-slate-500">— {ex.m}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => speakJapanese(ex.k || ex.w)}
                        className="text-pink-600 hover:text-pink-700 p-1"
                      >
                        <Volume2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
