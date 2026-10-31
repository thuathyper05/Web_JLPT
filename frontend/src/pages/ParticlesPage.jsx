import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { particlesService, speakJapanese } from '../services/api';
import { sounds } from '../services/sounds';
import {
  Compass,
  BookOpen,
  Volume2,
  Sparkles,
  Search,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Filter,
  Layers
} from 'lucide-react';

export default function ParticlesPage() {
  const { currentLevel, askAi } = useApp();
  const [particles, setParticles] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedParticle, setSelectedParticle] = useState(null);
  const [loading, setLoading] = useState(true);

  // Active level follows the global webapp level selector
  const activeLevel = currentLevel || 'N5';

  useEffect(() => {
    const fetchParticles = async () => {
      setLoading(true);
      try {
        const res = await particlesService.getParticles({ level: activeLevel });
        setParticles(res.data || []);
      } catch (err) {
        console.error('Fetch particles error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchParticles();
  }, [activeLevel]);

  const filtered = particles.filter((p) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase().trim();
    return (
      p.particle.includes(q) ||
      p.romaji.toLowerCase().includes(q) ||
      p.title.toLowerCase().includes(q) ||
      p.usage.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16 animate-in fade-in duration-300">
      {/* ── 1. HEADER BANNER (DYNAMIC TO JLPT LEVEL) ── */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-pink-100 shadow-sm relative overflow-hidden">
        <div className="absolute right-4 top-2 text-pink-100/50 font-jp font-black text-8xl pointer-events-none select-none">
          助
        </div>

        <div className="relative z-10">
          <div className="mb-2.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-50 text-pink-700 font-extrabold text-[11px] uppercase tracking-wider border border-pink-100">
              <Compass size={13} className="text-pink-600" />
              <span>JOSHI (助詞) • TRỌNG TÂM JLPT {activeLevel}</span>
            </div>
          </div>

          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-snug mb-1.5">
            Bảng Trợ Từ Tiếng Nhật {activeLevel}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-2xl mb-5">
            Tổng hợp các trợ từ cốt lõi trong kỳ thi năng lực tiếng Nhật {activeLevel} kèm bản chất ngữ pháp, công thức và ví dụ thực tế.
          </p>

          {/* Search Row */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-pink-50">
            <div className="relative flex-1 max-w-md">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Tìm trợ từ (ví dụ: wa, ga, de, ni, trợ từ chủ đề)..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-pink-200 text-xs focus:outline-none focus:ring-2 focus:ring-pink-500 bg-pink-50/20"
              />
            </div>

            <div className="px-3.5 py-1.5 rounded-xl bg-pink-50 border border-pink-200 text-pink-700 font-extrabold text-xs">
              {filtered.length} Trợ từ {activeLevel}
            </div>
          </div>
        </div>
      </div>

      {/* ── 2. PARTICLES GRID ── */}
      {loading ? (
        <div className="py-20 text-center">
          <div className="w-10 h-10 border-4 border-pink-200 border-t-pink-600 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs font-bold text-slate-400">Đang tải bảng trợ từ {activeLevel}...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-12 rounded-3xl bg-white border border-pink-100 shadow-sm text-center space-y-3">
          <Compass size={32} className="mx-auto text-slate-300" />
          <h3 className="text-base font-bold text-slate-700">Không tìm thấy trợ từ phù hợp</h3>
          <p className="text-xs text-slate-400">Hãy thử tìm kiếm bằng Romaji hoặc tên trợ từ khác.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((item, idx) => (
            <div
              key={idx}
              className="p-5 sm:p-6 rounded-3xl bg-white border border-pink-100 shadow-sm hover:shadow-lotus-sm transition-all space-y-4 flex flex-col justify-between"
            >
              <div>
                {/* Header: Particle Char & Title */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-pink-600 to-rose-500 text-white flex items-center justify-center font-jp font-black text-2xl shadow-lotus">
                      {item.particle}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-jp font-bold text-slate-400">{item.romaji}</span>
                        <span className="px-2 py-0.5 rounded-full bg-pink-50 text-pink-700 font-extrabold text-[10px] border border-pink-100">
                          {item.badge || activeLevel}
                        </span>
                      </div>
                      <h3 className="text-sm sm:text-base font-black text-slate-900 tracking-tight mt-0.5">
                        {item.title}
                      </h3>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => speakJapanese(item.particle)}
                    className="p-2 rounded-xl bg-pink-50 text-pink-600 hover:bg-pink-100 transition-colors cursor-pointer"
                    title="Nghe phát âm"
                  >
                    <Volume2 size={16} />
                  </button>
                </div>

                {/* Usage */}
                <p className="text-xs text-slate-600 leading-relaxed mb-3">
                  {item.usage}
                </p>

                {/* Formula */}
                {item.formula && (
                  <div className="p-2.5 rounded-xl bg-pink-50/40 border border-pink-100 text-xs text-pink-900 font-mono font-semibold mb-3">
                    <strong className="text-pink-600 font-sans mr-1">Công thức:</strong> {item.formula}
                  </div>
                )}

                {/* Example */}
                {item.examples && item.examples.length > 0 && (
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                    <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                      <span>VÍ DỤ THỰC TẾ</span>
                      <button
                        type="button"
                        onClick={() => speakJapanese(item.examples[0].jp)}
                        className="text-pink-600 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <Volume2 size={12} />
                        <span>Phát âm</span>
                      </button>
                    </div>
                    <div className="font-jp font-bold text-xs sm:text-sm text-slate-900">
                      {item.examples[0].jp}
                    </div>
                    <div className="text-xs text-slate-600 font-medium">
                      {item.examples[0].vi}
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom Action: AI Breakdown */}
              <div className="pt-3 border-t border-pink-50 flex justify-between items-center">
                <span className="text-[11px] text-slate-400 font-medium">
                  {item.notes ? item.notes.slice(0, 38) + '...' : `Trọng tâm kỳ thi JLPT ${activeLevel}`}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    askAi('explain_particle', item, `AI Phân Tích: Trợ Từ 「${item.particle}」 (${activeLevel})`)
                  }
                  className="px-3 py-1.5 rounded-xl border border-pink-200 text-pink-700 hover:bg-pink-50 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Sparkles size={14} className="text-pink-600" />
                  <span>AI gỡ rối</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
