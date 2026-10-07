import React from 'react';

const Logo = ({ size = 38, showText = true, className = '' }) => {
  return (
    <div className={`d-inline-flex align-items-center ${className}`} style={{ gap: '10px' }}>
      {/* Modern High-End Geometric Badge Logo */}
      <div
        className="position-relative d-flex align-items-center justify-content-center shadow-sm"
        style={{
          width: `${size}px`,
          height: `${size}px`,
          borderRadius: '10px',
          background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 50%, #38bdf8 100%)',
          padding: '2px',
          boxShadow: '0 4px 12px rgba(37, 99, 235, 0.35)',
        }}
      >
        <svg
          viewBox="0 0 100 100"
          width="100%"
          height="100%"
          style={{ overflow: 'visible' }}
        >
          <defs>
            <linearGradient id="hyperGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#e0f2fe" />
            </linearGradient>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodColor="#0284c7" floodOpacity="0.4" />
            </filter>
          </defs>

          {/* Torii Gate + Lightning / Speed Monogram Geometric Symbol */}
          {/* Top Beam */}
          <rect x="18" y="22" width="64" height="7" rx="3.5" fill="url(#hyperGrad)" filter="url(#glow)" />
          {/* Sub Beam */}
          <rect x="24" y="36" width="52" height="5" rx="2.5" fill="url(#hyperGrad)" opacity="0.95" />
          {/* Left Pillar */}
          <rect x="30" y="26" width="6" height="52" rx="3" fill="url(#hyperGrad)" />
          {/* Right Pillar */}
          <rect x="64" y="26" width="6" height="52" rx="3" fill="url(#hyperGrad)" />
          {/* Center Hyper Dynamic Accent Arrow / Spark */}
          <polygon
            points="50,42 56,54 48,54 53,68 42,52 49,52"
            fill="#f59e0b"
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
                letterSpacing: '-0.5px',
                fontFamily: 'system-ui, -apple-system, sans-serif'
              }}
            >
              HYPER
            </span>
            <span
              className="fw-black text-warning"
              style={{
                fontSize: `${size * 0.52}px`,
                fontWeight: '900',
                letterSpacing: '0.5px'
              }}
            >
              JLPT
            </span>
          </div>
          <span
            className="text-white text-opacity-75"
            style={{
              fontSize: `${Math.max(size * 0.22, 10)}px`,
              fontWeight: '600',
              letterSpacing: '0.8px',
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
