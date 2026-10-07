import React from 'react';

const Logo = ({ size = 38, showText = true, className = '' }) => {
  return (
    <div className={`d-inline-flex align-items-center ${className}`} style={{ gap: '10px' }}>
      {/* High-End Geometric Emblem Logo */}
      <div
        className="position-relative d-flex align-items-center justify-content-center"
        style={{
          width: `${size}px`,
          height: `${size}px`,
          borderRadius: `${size * 0.28}px`,
          background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 60%, #2563eb 100%)',
          padding: '2px',
          boxShadow: '0 4px 14px rgba(37, 99, 235, 0.4), inset 0 1px 1px rgba(255,255,255,0.4)',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}
      >
        <svg
          viewBox="0 0 100 100"
          width="100%"
          height="100%"
          style={{ overflow: 'visible' }}
        >
          <defs>
            <linearGradient id="logoPrimary" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#93c5fd" />
            </linearGradient>
            <linearGradient id="goldAccent" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fbbf24" />
              <stop offset="100%" stopColor="#f59e0b" />
            </linearGradient>
            <filter id="subtleGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="1" stdDeviation="1" floodColor="#38bdf8" floodOpacity="0.5" />
            </filter>
          </defs>

          {/* Minimalist Architectural Torii Silhouette */}
          {/* Main Top Curved Bar */}
          <path
            d="M 16,26 C 36,22 64,22 84,26 C 85,27 83,31 82,31 C 64,28 36,28 18,31 Z"
            fill="url(#logoPrimary)"
            filter="url(#subtleGlow)"
          />
          {/* Secondary Horizontal Bar */}
          <rect x="22" y="38" width="56" height="5" rx="2.5" fill="url(#logoPrimary)" opacity="0.9" />

          {/* Left Pillar */}
          <rect x="30" y="29" width="6.5" height="48" rx="3.25" fill="url(#logoPrimary)" />
          {/* Right Pillar */}
          <rect x="63.5" y="29" width="6.5" height="48" rx="3.25" fill="url(#logoPrimary)" />

          {/* Center Hyper Dynamic Flash: Lightning Bolt */}
          <polygon
            points="50.5,39 58,52 49,52 54,67 42,50 51,50"
            fill="url(#goldAccent)"
          />
        </svg>
      </div>

      {showText && (
        <div className="d-flex flex-column" style={{ lineHeight: '1.05' }}>
          <div className="d-flex align-items-baseline" style={{ gap: '4px' }}>
            <span
              className="fw-bold tracking-tight text-white"
              style={{
                fontSize: `${size * 0.48}px`,
                letterSpacing: '-0.4px',
                fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
              }}
            >
              HYPER
            </span>
            <span
              className="text-warning"
              style={{
                fontSize: `${size * 0.52}px`,
                fontWeight: '900',
                letterSpacing: '0.4px'
              }}
            >
              JLPT
            </span>
          </div>
          <span
            className="text-white text-opacity-80"
            style={{
              fontSize: `${Math.max(size * 0.22, 10)}px`,
              fontWeight: '700',
              letterSpacing: '0.9px',
              textTransform: 'uppercase'
            }}
          >
            N5 Master System
          </span>
        </div>
      )}
    </div>
  );
};

export default Logo;
