import React from 'react';

/**
 * SignatureLoader
 * Custom, bespoke loading animation designed exclusively for HYPER Japanese Learning Web App.
 * Features the official HYPER logo with glowing aura, rotating Enso Zen orbit, and floating Sakura petals.
 */
export default function SignatureLoader({
  fullscreen = true,
  message = 'Đang kết nối tri thức...',
  size = 'md'
}) {
  const sizeMap = {
    sm: { img: 'h-10', ring: 'w-24 h-24', text: 'text-xs' },
    md: { img: 'h-14 sm:h-16', ring: 'w-36 h-36', text: 'text-xs' },
    lg: { img: 'h-18 sm:h-20', ring: 'w-44 h-44', text: 'text-sm' }
  };

  const currentSize = sizeMap[size] || sizeMap.md;

  const content = (
    <div className="flex flex-col items-center justify-center space-y-5 select-none">
      {/* ── BESPOKE HYPER LOGO & ORBITING ZEN RING ── */}
      <div className="relative flex items-center justify-center p-6">
        {/* Ambient Lotus Pink Glow Behind Logo */}
        <div className="absolute inset-2 rounded-full bg-gradient-to-tr from-pink-500/25 via-rose-500/20 to-amber-400/20 blur-2xl animate-pulse" />

        {/* Outer Rotating Enso Zen Ring */}
        <svg
          className={`absolute ${currentSize.ring} animate-spin pointer-events-none`}
          style={{ animationDuration: '2.8s' }}
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="hyperEnsoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#db2777" stopOpacity="1" />
              <stop offset="45%" stopColor="#f43f5e" stopOpacity="0.8" />
              <stop offset="80%" stopColor="#fbbf24" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#db2777" stopOpacity="0.05" />
            </linearGradient>
          </defs>

          {/* Broken Japanese Calligraphic Enso Arc */}
          <circle
            cx="50"
            cy="50"
            r="44"
            stroke="url(#hyperEnsoGrad)"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeDasharray="200 60"
          />
        </svg>

        {/* Orbiting Sakura Petal 1 */}
        <div
          className={`absolute ${currentSize.ring} animate-spin pointer-events-none`}
          style={{ animationDuration: '3.6s' }}
        >
          <div className="w-2.5 h-2.5 rounded-full bg-pink-500 shadow-md shadow-pink-500/50 absolute -top-1 left-1/2 -translate-x-1/2" />
        </div>

        {/* Orbiting Sakura Petal 2 */}
        <div
          className={`absolute ${currentSize.ring} animate-spin pointer-events-none`}
          style={{ animationDuration: '4.8s', animationDirection: 'reverse' }}
        >
          <div className="w-2 h-2 rounded-full bg-rose-400 shadow-md shadow-rose-400/50 absolute top-1/2 -right-1 -translate-y-1/2" />
        </div>

        {/* ── OFFICIAL HYPER LOGO IN CENTER WITH GENTLE FLOATING AURA ── */}
        <div className="relative z-10 flex flex-col items-center justify-center animate-pulse duration-1000">
          <img
            src="/hyper_logo.png"
            alt="HYPER"
            className={`${currentSize.img} w-auto object-contain drop-shadow-md transition-transform duration-500`}
          />
        </div>
      </div>

      {/* ── BRANDING & SUBTITLE TEXT ── */}
      <div className="text-center space-y-1.5">
        <div className="flex items-center justify-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-pink-600 animate-ping" />
          <span className="font-black text-xs tracking-wider text-slate-800 uppercase">
            HYPER JAPANESE WEBAPP
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
        </div>
        <p className="text-[12px] font-bold text-slate-400 tracking-wide mb-0 animate-pulse">
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
      className="fixed inset-0 z-50 bg-white/92 backdrop-blur-md flex flex-col items-center justify-center animate-in fade-in duration-200"
      aria-live="polite"
      aria-label="Đang tải trang"
    >
      {content}
    </div>
  );
}