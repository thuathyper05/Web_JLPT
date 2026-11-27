import React from 'react';

// Banner đầu trang dùng chung cho Kanji và Luyện nghe: nền gradient, vòng tiến độ, thẻ chỉ số
// ZERO ARROWS RULE: Không dùng ký tự mũi tên

const TONE_CLASSES = {
  white: 'bg-white/10 border-white/20 text-white',
  emerald: 'bg-emerald-400/15 border-emerald-300/30 text-emerald-50',
  amber: 'bg-amber-400/15 border-amber-300/30 text-amber-50',
  sky: 'bg-sky-400/15 border-sky-300/30 text-sky-50'
};

function ProgressRing({ percent, label }) {
  const safe = Math.max(0, Math.min(100, Number(percent) || 0));
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (safe / 100) * circumference;

  return (
    <div className="relative w-28 h-28 sm:w-32 sm:h-32 shrink-0">
      <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
        <circle cx="50" cy="50" r={radius} fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="9" />
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke="#fde68a"
          strokeWidth="9"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-700"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-2xl sm:text-3xl font-black text-white leading-none">{safe}%</span>
        <span className="text-[10px] font-bold text-pink-100 uppercase tracking-wider mt-1 px-2 leading-tight">
          {label}
        </span>
      </div>
    </div>
  );
}

export default function StudyHero({ kicker, icon, title, subtitle, bigChar, stats, ring, actions }) {
  const list = Array.isArray(stats) ? stats : [];

  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-rose-600 via-pink-600 to-fuchsia-700 text-white shadow-lg">
      <div
        className="absolute -right-4 -top-6 font-jp font-black text-[9rem] sm:text-[12rem] leading-none text-white/10 pointer-events-none select-none"
        aria-hidden="true"
      >
        {bigChar}
      </div>
      <div className="absolute -left-16 -bottom-16 w-56 h-56 rounded-full bg-white/10 blur-2xl pointer-events-none" />

      <div className="relative z-10 p-5 sm:p-8 space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-3 min-w-0">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 border border-white/20 text-[11px] font-extrabold uppercase tracking-wider">
              {icon}
              <span>{kicker}</span>
            </span>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight break-words">{title}</h1>
            <p className="text-xs sm:text-sm text-pink-50/90 max-w-xl leading-relaxed">{subtitle}</p>
            {actions ? <div className="flex flex-wrap items-center gap-2 pt-1">{actions}</div> : null}
          </div>

          {ring ? (
            <div className="self-center md:self-auto">
              <ProgressRing percent={ring.percent} label={ring.label} />
            </div>
          ) : null}
        </div>

        {list.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
            {list.map(function (s) {
              const tone = TONE_CLASSES[s.tone] || TONE_CLASSES.white;
              return (
                <div key={s.label} className={'rounded-2xl border px-3 py-2.5 backdrop-blur-sm ' + tone}>
                  <span className="block text-[10px] font-bold uppercase tracking-wider opacity-80 truncate">
                    {s.label}
                  </span>
                  <span className="block text-lg sm:text-xl font-black leading-tight truncate">{s.value}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
