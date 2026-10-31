import React from 'react';

/**
 * SakuraPulse
 * Renders an authentic Japanese 5-Petal Cherry Blossom (Sakura)
 * with graceful pulsing animation and glowing aura.
 * Used as a bespoke replacement for generic round blinking dots.
 */
export default function SakuraPulse({
  size = 14,
  className = '',
  glowing = true,
  animate = true
}) {
  const petalPath = "M 12 12 C 10 9, 8 6, 10.5 3 C 11.2 2.2, 11.6 3, 12 3.5 C 12.4 3, 12.8 2.2, 13.5 3 C 16 6, 14 9, 12 12 Z";
  const angles = [0, 72, 144, 216, 288];

  return (
    <span
      className={`inline-flex items-center justify-center relative shrink-0 ${className}`}
      style={{ width: size, height: size }}
      title="Hoa anh đào Sakura"
    >
      {/* Shimmering Sakura Aura */}
      {glowing && (
        <span
          className="absolute inset-0 rounded-full bg-pink-400/30 blur-[2px] animate-ping pointer-events-none"
          style={{ width: size * 1.3, height: size * 1.3 }}
        />
      )}

      {/* 5-Petal Cherry Blossom SVG */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        className={`relative z-10 transition-transform duration-300 drop-shadow-[0_0_5px_rgba(244,114,182,0.85)] ${
          animate ? 'animate-pulse' : ''
        }`}
      >
        <defs>
          <linearGradient id="sakuraGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FB7185" />
            <stop offset="60%" stopColor="#F43F5E" />
            <stop offset="100%" stopColor="#E11D48" />
          </linearGradient>
          <radialGradient id="pistilGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFF1F2" />
            <stop offset="70%" stopColor="#FFE4E6" />
            <stop offset="100%" stopColor="#FECDD3" />
          </radialGradient>
        </defs>

        {/* 5 Petals with characteristic notch at petal tips */}
        {angles.map((deg) => (
          <path
            key={deg}
            d={petalPath}
            transform={`rotate(${deg} 12 12)`}
            fill="url(#sakuraGrad)"
          />
        ))}

        {/* Central pistil stamen */}
        <circle cx="12" cy="12" r="2.2" fill="url(#pistilGrad)" />
        <circle cx="12" cy="12" r="1.1" fill="#FFFBEB" />
      </svg>
    </span>
  );
}
