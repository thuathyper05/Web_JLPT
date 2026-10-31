import React from 'react';

/**
 * SignatureLoader
 * Custom, bespoke Japanese Zen Enso & Sakura loading animation designed exclusively for NihongoHub.
 * Features an Enso brush circle, 3 orbiting cherry blossom petals, glowing central Kanji, and Lotus Pink aura.
 */
export default function SignatureLoader({
  fullscreen = true,
  message = 'Đang kết nối tri thức...',
  size = 'md'
}) {
  const sizeMap = {
    sm: { box: 'w-14 h-14', text: 'text-xs', kanji: 'text-lg' },
    md: { box: 'w-24 h-24', text: 'text-xs', kanji: 'text-2xl' },
    lg: { box: 'w-32 h-32', text: 'text-sm', kanji: 'text-3xl' }
  };

  const currentSize = sizeMap[size] || sizeMap.md;

  const content = (
    <div className="flex flex-col items-center justify-center space-y-4 select-none">
      {/* ── BESPOKE ZEN ENSO CIRCLE & ORBITING PETALS ── */}
      <div className={`relative ${currentSize.box} flex items-center justify-center`}>
        {/* Soft Ambient Lotus Glow Behind Circle */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-pink-500/20 via-rose-500/20 to-amber-400/20 blur-xl animate-pulse" />

        {/* Outer Rotating Enso Zen Ring */}
        <svg
          className="absolute inset-0 w-full h-full animate-spin"
          style={{ animationDuration: '2.4s' }}
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="ensoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#db2777" stopOpacity="1" />
              <stop offset="40%" stopColor="#f43f5e" stopOpacity="0.85" />
              <stop offset="75%" stopColor="#fbbf24" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#db2777" stopOpacity="0.05" />
            </linearGradient>
          </defs>

          {/* Broken Japanese Calligraphic Enso Arc */}
          <circle
            cx="50"
            cy="50"
            r="42"
            stroke="url(#ensoGradient)"
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray="210 50"
          />
        </svg>

        {/* Counter-Rotating Inner Dotted Ring */}
        <svg
          className="absolute inset-1 w-[calc(100%-8px)] h-[calc(100%-8px)] animate-spin"
          style={{ animationDuration: '4.8s', animationDirection: 'reverse' }}
          viewBox="0 0 100 100"
          fill="none"
        >
          <circle
            cx="50"
            cy="50"
            r="38"
            stroke="#fce7f3"
            strokeWidth="1.5"
            strokeDasharray="4 8"
          />
        </svg>

        {/* Orbiting Sakura Petal 1 */}
        <div
          className="absolute w-full h-full animate-spin pointer-events-none"
          style={{ animationDuration: '3s' }}
        >
          <div className="w-2.5 h-2.5 rounded-full bg-pink-500 shadow-sm shadow-pink-500/50 absolute -top-1 left-1/2 -translate-x-1/2 scale-90" />
        </div>

        {/* Orbiting Sakura Petal 2 */}
        <div
          className="absolute w-full h-full animate-spin pointer-events-none"
          style={{ animationDuration: '4s', animationDirection: 'reverse' }}
        >
          <div className="w-2 h-2 rounded-full bg-rose-400 shadow-sm shadow-rose-400/50 absolute top-1/2 -right-1 -translate-y-1/2 scale-75" />
        </div>

        {/* Center Breathing Kanji Symbol: 学 (Gaku - Tri thức / Học hỏi) */}
        <div className="relative z-10 flex flex-col items-center justify-center animate-pulse">
          <span
            className={`font-jp font-black text-transparent bg-clip-text bg-gradient-to-br from-pink-600 via-rose-600 to-pink-800 ${currentSize.kanji}`}
          >
            学
          </span>
        </div>
      </div>

      {/* ── BRANDING & SUBTITLE TEXT ── */}
      <div className="text-center space-y-1">
        <div className="flex items-center justify-center gap-1.5">
          <span className="font-black text-sm tracking-tight bg-gradient-to-r from-pink-700 via-pink-600 to-rose-500 bg-clip-text text-transparent">
            Nihongo<span className="text-slate-800">Hub</span>
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-pink-600 animate-ping" />
        </div>
        <p className="text-[11.5px] font-bold text-slate-400 tracking-wide mb-0 animate-pulse">
          {message}
        </p>
      </div>
    </div>
  );

  if (!fullscreen) {
    return <div className="p-6 flex items-center justify-center">{content}</div>;
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-white/90 backdrop-blur-md flex flex-col items-center justify-center animate-in fade-in duration-200"
      aria-live="polite"
      aria-label="Đang tải trang"
    >
      {content}
    </div>
  );
}