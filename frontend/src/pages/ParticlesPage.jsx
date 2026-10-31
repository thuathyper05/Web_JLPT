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
  AlertCircle
} from 'lucide-react';

export default function ParticlesPage() {
  const { askAi } = useApp();
  const [particles, setParticles] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedParticle, setSelectedParticle] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchParticles = async () => {
      setLoading(true);
      try {
        const res = await particlesService.getParticles();
        setParticles(res.data || []);
      } catch (err) {
        console.error('Fetch particles error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchParticles();
  }, []);

  const filtered = particles.filter((p) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      p.particle.includes(q) ||
      p.romaji.toLowerCase().includes(q) ||
      p.title.toLowerCase().includes(q) ||
      p.usage.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-pink-100 shadow-sm relative overflow-hidden">
        <div className="absolute right-4 top-2 text-pink-100/50 font-jp font-black text-8xl pointer-events-none select-none">
          助
        </div>

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-50 text-pink-700 font-extrabold text-[11px] uppercase tracking-wider mb-2.5">
            <Compass size={13} className="text-pink-600" />
            <span>JOSHI (助詞) • TRỌNG TÂM N5</span>
          </div>

          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-snug mb-1.5">
            Bách Khoa 19 Trợ Từ N5
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-2xl mb-6">
            Bí quyết phân biệt các cặp trợ từ hay nhầm lẫn (は vs が, に vs で), công thức câu và phân tích AI.
          </p>

          {/* Search Row */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-pink-50">
            <div className="relative flex-1 max-w-md">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Tìm trợ từ (wa, ga, ni, de...)"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-pink-200 text-xs focus:outline-none focus:ring-2 focus:ring-pink-500 bg-pink-50/30 focus:bg-white"
              />
            </div>
            <span className="px-3 py-1 rounded-xl bg-pink-50 text-pink-700 font-bold text-xs border border-pink-200">
              {filtered.length} Trợ từ
            </span>
          </div>
        </div>
      </div>

      {/* Particles List */}
      <div className="space-y-4">
        {filtered.map((item, idx) => (
          <div
            key={item.particle || idx}
            className="p-6 rounded-3xl bg-white border border-pink-100 shadow-sm space-y-4 hover:shadow-lotus-sm transition-all"
          >
            <div className="flex flex-wrap justify-between items-start gap-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-pink-600 to-rose-500 text-white font-jp font-black text-2xl flex items-center justify-center shadow-lotus-sm">
                  {item.particle}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-base text-slate-900 mb-0">
                      {item.title}
                    </h3>
                    <span className="px-2 py-0.5 rounded-md bg-pink-100 text-pink-700 text-[10px] font-bold">
                      {item.romaji}
                    </span>
                  </div>
                  <span className="text-xs text-slate-400 font-semibold">
                    Loại: {item.badge || 'Trọng tâm'}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => askAi('explain_particle', item, `AI: Trợ từ 「${item.particle}」`)}
                className="px-3 py-1.5 rounded-xl bg-pink-50 hover:bg-pink-100 text-pink-700 border border-pink-200 text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                <Sparkles size={14} className="text-pink-600" />
                <span>AI so sánh & gỡ rối</span>
              </button>
            </div>

            {/* Formula Pill */}
            {item.formula && (
              <div className="p-3 rounded-2xl bg-pink-50/60 border border-pink-100 font-jp text-xs font-bold text-pink-900">
                📌 Công thức: <span className="font-semibold">{item.formula}</span>
              </div>
            )}

            {/* Usage Text */}
            <p className="text-xs text-slate-700 leading-relaxed mb-0 whitespace-pre-line">
              {item.usage}
            </p>

            {/* Examples */}
            {item.examples && item.examples.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-pink-50">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Ví dụ thực tế:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {item.examples.map((ex, exIdx) => (
                    <div
                      key={exIdx}
                      className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-jp font-bold text-slate-900">{ex.jp}</div>
                        <div className="text-[11px] text-slate-500 mt-0.5">{ex.vi}</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => speakJapanese(ex.jp)}
                        className="text-pink-600 hover:text-pink-700 p-1 shrink-0 ml-2"
                      >
                        <Volume2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
