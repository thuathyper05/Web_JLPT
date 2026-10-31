import React from 'react';

/**
 * SignatureLoader
 * Ultra-compact, bespoke loading animation designed exclusively for HYPER Japanese Learning Web App.
 * Features the standalone transparent HYPER logo floating freely (zero container background)
 * enveloped by delicate, concentric Zen ripples and an ultra-fine dual Enso orbit.
 * Pure white background preventing content bleed until load completion.
 */
export default function SignatureLoader({
  fullscreen = true,
  message = 'Đang nạp dữ liệu...',
}) {
  const content = (
    <div className="flex flex-col items-center justify-center space-y-3.5 select-none animate-in fade-in duration-150">
      {/* ── BESPOKE COMPACT ZEN ORBIT & FLOATING LOGO ── */}
      <div className="relative flex items-center justify-center w-20 h-20">
        {/* Expanding Zen Water Ripple */}
        <div
          className="absolute inset-1 rounded-full border border-pink-200/60 animate-ping opacity-30 pointer-events-none"
          style={{ animationDuration: '2.4s' }}
        />

        {/* Outer Rotating Ultra-Fine Calligraphic Arc */}
        <svg
          className="absolute inset-0 w-full h-full animate-spin pointer-events-none"
          style={{ animationDuration: '2s' }}
          viewBox="0 0 80 80"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="hyperMiniGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#db2777" stopOpacity="0.9" />
              <stop offset="50%" stopColor="#f43f5e" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#fb7185" stopOpacity="0.1" />
            </linearGradient>
          </defs>

          {/* Ultra-thin graceful Enso Arc */}
          <circle
            cx="40"
            cy="40"
            r="34"
            stroke="url(#hyperMiniGrad)"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeDasharray="140 50"
          />
        </svg>

        {/* Counter-spinning Inner Accent Arc */}
        <svg
          className="absolute inset-2 w-16 h-16 animate-spin pointer-events-none"
          style={{ animationDuration: '3.2s', animationDirection: 'reverse' }}
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle
            cx="32"
            cy="32"
            r="27"
            stroke="#f43f5e"
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeDasharray="40 120"
            strokeOpacity="0.4"
          />
        </svg>

        {/* Orbiting Tiny Sakura Glow Bead */}
        <div
          className="absolute inset-0 w-full h-full animate-spin pointer-events-none"
          style={{ animationDuration: '2.6s' }}
        >
          <div className="w-1.5 h-1.5 rounded-full bg-pink-600 shadow-sm shadow-pink-500/80 absolute top-1 left-1/2 -translate-x-1/2" />
        </div>

        {/* ── STANDALONE TRANSPARENT LOGO: ZERO BOX, ZERO BACKGROUND CONTAINER ── */}
        <div className="relative z-10 flex items-center justify-center">
          <img
            src="/hyper_logo.png"
            alt="HYPER"
            className="h-5 sm:h-5.5 w-auto object-contain drop-shadow-xs transition-transform duration-300"
          />
        </div>
      </div>

      {/* ── MINIMAL STATUS TEXT ── */}
      <div className="text-center">
        <p className="text-[11.5px] font-medium text-slate-500 tracking-wider mb-0 animate-pulse">
          {message || 'Đang nạp dữ liệu...'}
        </p>
      </div>
    </div>
  );

  if (!fullscreen) {
    return <div className="p-4 flex items-center justify-center bg-white">{content}</div>;
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-white flex flex-col items-center justify-center animate-in fade-in duration-100"
      aria-live="polite"
      aria-label="Đang tải dữ liệu"
    >
      {content}
    </div>
  );
}
