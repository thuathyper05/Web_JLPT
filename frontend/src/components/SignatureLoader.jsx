import React from 'react';

/**
 * SignatureLoader
 * Custom, bespoke loading animation designed exclusively for HYPER Japanese Learning Web App.
 * Features the official HYPER logo properly scaled inside a delicate rotating Enso Zen orbit and floating Sakura petals.
 * Pure white background preventing underlying content flash until loading is complete.
 */
export default function SignatureLoader({
  fullscreen = true,
  message = 'Đang nạp dữ liệu...',
  size = 'md'
}) {
  const content = (
    <div className="flex flex-col items-center justify-center space-y-4 select-none">
      {/* ── BESPOKE COMPACT HYPER LOGO & ORBITING ZEN RING ── */}
      <div className="relative flex items-center justify-center w-28 h-28 sm:w-32 sm:h-32">
        {/* Soft Ambient Lotus Pink Glow Behind Orbit */}
        <div className="absolute inset-2 rounded-full bg-gradient-to-tr from-pink-400/20 via-rose-300/15 to-pink-500/10 blur-xl animate-pulse" />

        {/* Outer Rotating Enso Zen Ring */}
        <svg
          className="absolute inset-0 w-full h-full animate-spin pointer-events-none"
          style={{ animationDuration: '2.5s' }}
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="hyperEnsoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#db2777" stopOpacity="1" />
              <stop offset="50%" stopColor="#f43f5e" stopOpacity="0.8" />
              <stop offset="85%" stopColor="#fb7185" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#db2777" stopOpacity="0.05" />
            </linearGradient>
          </defs>

          {/* Broken Japanese Calligraphic Enso Arc */}
          <circle
            cx="50"
            cy="50"
            r="42"
            stroke="url(#hyperEnsoGrad)"
            strokeWidth="2.8"
            strokeLinecap="round"
            strokeDasharray="190 60"
          />
        </svg>

        {/* Orbiting Sakura Petal 1 */}
        <div
          className="absolute inset-0 w-full h-full animate-spin pointer-events-none"
          style={{ animationDuration: '3.2s' }}
        >
          <div className="w-2 h-2 rounded-full bg-pink-500 shadow-sm shadow-pink-500/50 absolute top-0.5 left-1/2 -translate-x-1/2" />
        </div>

        {/* Orbiting Sakura Petal 2 */}
        <div
          className="absolute inset-0 w-full h-full animate-spin pointer-events-none"
          style={{ animationDuration: '4.2s', animationDirection: 'reverse' }}
        >
          <div className="w-1.5 h-1.5 rounded-full bg-rose-400 shadow-sm shadow-rose-400/40 absolute bottom-0.5 right-1/4" />
        </div>

        {/* ── LOGO SEAL: PROPERLY PROPORTIONED & PERFECTLY CENTERED INSIDE CIRCLE ── */}
        <div className="relative z-10 w-16 h-16 sm:w-18 sm:h-18 rounded-full bg-white/95 border border-pink-100/60 shadow-sm flex items-center justify-center p-2.5">
          <img
            src="/hyper_logo.png"
            alt="HYPER"
            className="h-6 sm:h-7 w-auto object-contain max-w-full drop-shadow-xs"
          />
        </div>
      </div>

      {/* ── LOADING STATUS TEXT ── */}
      <div className="text-center pt-1">
        <p className="text-xs font-semibold text-slate-500 tracking-wide mb-0 animate-pulse">
          {message || 'Đang nạp dữ liệu...'}
        </p>
      </div>
    </div>
  );

  if (!fullscreen) {
    return <div className="p-6 flex items-center justify-center bg-white">{content}</div>;
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-white flex flex-col items-center justify-center animate-in fade-in duration-150"
      aria-live="polite"
      aria-label="Đang tải trang"
    >
      {content}
    </div>
  );
}
