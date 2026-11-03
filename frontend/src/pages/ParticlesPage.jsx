import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { particlesService, speakJapanese } from '../services/api';
import FuriganaWord, { FuriganaSentence } from '../components/FuriganaWord';
import { sounds } from '../services/sounds';
import {
  Compass,
  Volume2,
  Sparkles,
  Search,
  RotateCcw,
  AlertCircle
} from 'lucide-react';

export default function ParticlesPage() {
  const { currentLevel, askAi } = useApp();
  const [particles, setParticles] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Active level follows the global webapp level selector
  const activeLevel = currentLevel || 'N5';

  useEffect(() => {
    let isMounted = true;
    const fetchParticles = async () => {
      setLoading(true);
      try {
        const res = await particlesService.getParticles({ level: activeLevel });
        const list = Array.isArray(res.data) ? res.data : [];
        if (isMounted) {
          setParticles(list);
        }
      } catch (err) {
        console.error('Fetch particles error:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchParticles();
    return () => { isMounted = false; };
  }, [activeLevel]);

  const rawList = Array.isArray(particles) ? particles : [];
  const normalizedParticles = rawList.map(p => {
    if (!p) return null;
    const pStr = p.particle || '';

    // 1. Strip trailing dash and notes like '- Thời gian', '– Nơi đến'
    const withoutDash = pStr.split(/\s*[-–—]\s*/)[0].trim();

    // 2. Extract clean particle character (e.g. 'は', 'に', 'で', 'から', 'について')
    const cleanChar = withoutDash.replace(/\s*\(.*?\)/g, '').trim() || withoutDash;

    // 3. For the badge: if there are multiple slash variants like 'くらい / ぐらい', pick primary
    const badgeChar = cleanChar.includes('/') ? cleanChar.split('/')[0].trim() : cleanChar;

    // 4. Extract romaji inside parentheses (e.g. 'ni', 'de', 'wa', 'wo/o')
    const romMatch = withoutDash.match(/\((.*?)\)/);
    const romajiFromParen = romMatch ? romMatch[1].trim() : '';

    // 5. Clean title: prioritize role (e.g. 'Cách trợ từ chỉ thời điểm'), strip any dash
    const cleanTitle = (p.role || p.title || p.meaning || cleanChar).split(/\s*[-–—]\s*/)[0].trim();

    return {
      ...p,
      cleanChar,
      badgeChar,
      title: cleanTitle,
      usage: p.meaning || p.usage || '',
      formula: p.formula || (typeof p.notes === 'string' && p.notes.includes('Công thức') ? p.notes : ''),
      examples: Array.isArray(p.examples) && p.examples.length > 0 
        ? p.examples 
        : (p.example ? [{ jp: p.example, vi: p.translation || '' }] : []),
      romaji: p.romaji || romajiFromParen
    };
  }).filter(Boolean);

  const filtered = normalizedParticles.filter((p) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase().trim();
    return (
      (p.particle && p.particle.toLowerCase().includes(q)) ||
      (p.cleanChar && p.cleanChar.toLowerCase().includes(q)) ||
      (p.badgeChar && p.badgeChar.toLowerCase().includes(q)) ||
      (p.romaji && p.romaji.toLowerCase().includes(q)) ||
      (p.title && p.title.toLowerCase().includes(q)) ||
      (p.usage && p.usage.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16 animate-in fade-in duration-300">
      {/* ── 1. HEADER BANNER ── */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-pink-100 shadow-sm relative overflow-hidden">
        <div className="absolute right-4 top-2 text-pink-100/50 font-jp font-black text-8xl pointer-events-none select-none">
          助
        </div>

        <div className="relative z-10">
          <div className="mb-2.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-50 text-pink-700 font-extrabold text-[11px] uppercase tracking-wider border border-pink-100">
              <Compass size={13} className="text-pink-600" />
              <span>TRỢ TỪ CỐT LÕI - CẤP ĐỘ {activeLevel}</span>
            </div>
          </div>

          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-snug mb-1.5">
            Bảng Trợ Từ Tiếng Nhật {activeLevel}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-2xl mb-5">
            Tổng hợp các trợ từ trọng tâm theo chuẩn giáo trình cấp độ {activeLevel} kèm bản chất ngữ pháp, công thức và ví dụ giao tiếp thực tế.
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
        <div className="py-20 text-center bg-white rounded-3xl border border-pink-100 shadow-sm space-y-3">
          <div className="w-10 h-10 border-4 border-pink-200 border-t-pink-600 rounded-full animate-spin mx-auto" />
          <p className="text-xs font-bold text-slate-400">Đang tải bảng trợ từ {activeLevel}...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-12 rounded-3xl bg-white border border-pink-100 shadow-sm text-center space-y-3">
          <AlertCircle size={36} className="mx-auto text-pink-400" />
          <h3 className="text-base font-bold text-slate-700">Không tìm thấy trợ từ phù hợp</h3>
          <p className="text-xs text-slate-400">
            {search ? `Không có trợ từ nào khớp với "${search}".` : `Hiện chưa có trợ từ nào cho cấp độ ${activeLevel}.`}
          </p>
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              className="px-4 py-2 rounded-xl bg-pink-50 text-pink-600 font-bold text-xs inline-flex items-center gap-1.5 hover:bg-pink-100 transition-colors cursor-pointer"
            >
              <RotateCcw size={14} />
              <span>Xóa tìm kiếm</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((item, idx) => (
            <div
              key={item.id || idx}
              className="p-5 sm:p-6 rounded-3xl bg-white border border-pink-100 shadow-sm hover:shadow-lotus-sm transition-all space-y-4 flex flex-col justify-between"
            >
              <div>
                {/* Header: Particle Char & Title */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div
                      className={`w-12 h-12 rounded-2xl bg-gradient-to-tr from-pink-600 to-rose-500 text-white flex items-center justify-center font-jp font-black shadow-lotus shrink-0 select-none leading-none ${
                        item.badgeChar.length > 4
                          ? 'text-xs px-1 text-center leading-tight'
                          : item.badgeChar.length > 2
                          ? 'text-sm'
                          : item.badgeChar.length > 1
                          ? 'text-lg'
                          : 'text-2xl'
                      }`}
                      title={item.cleanChar}
                    >
                      {item.badgeChar}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        {item.romaji && (
                          <span className="text-xs font-jp font-bold text-slate-400">{item.romaji}</span>
                        )}
                        {item.cleanChar.includes('/') && (
                          <span className="text-[11px] font-jp text-pink-600/80 font-semibold">
                            ({item.cleanChar})
                          </span>
                        )}
                        <span className="px-2 py-0.5 rounded-full bg-pink-50 text-pink-700 font-extrabold text-[10px] border border-pink-100">
                          {item.level || activeLevel}
                        </span>
                      </div>
                      <h3 className="text-sm sm:text-base font-black text-slate-900 tracking-tight mt-0.5 break-words">
                        {item.title}
                      </h3>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => speakJapanese(item.badgeChar || item.cleanChar)}
                    className="p-2 rounded-xl bg-pink-50 text-pink-600 hover:bg-pink-100 transition-colors cursor-pointer shrink-0"
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
                {item.examples && item.examples.length > 0 && item.examples[0]?.jp && (
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
                    <div className="pt-1">
                      <FuriganaSentence
                        text={item.examples[0].jp}
                        level={activeLevel}
                        size="sm"
                      />
                    </div>
                    <div className="text-xs text-slate-600 font-medium">
                      {item.examples[0].vi}
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom Action: AI Breakdown */}
              <div className="pt-3 border-t border-pink-50 flex flex-wrap sm:flex-nowrap justify-between items-center gap-2">
                <span className="text-[11px] text-slate-400 font-medium truncate max-w-[220px]">
                  {item.notes ? item.notes : `Trọng tâm kỳ thi ${activeLevel}`}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    askAi('explain_particle', item, `AI Phân Tích: Trợ Từ 「${item.cleanChar || item.particle}」 (${activeLevel})`)
                  }
                  className="px-3 py-1.5 rounded-xl border border-pink-200 text-pink-700 hover:bg-pink-50 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
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
