import React from 'react';

const Logo = ({ size = 38, showText = true, className = '', light = false }) => {
  return (
    <div className={`d-inline-flex align-items-center ${className}`} style={{ gap: '10px' }}>
      {/* Official HYPER JAPAN Emblem Icon */}
      <div
        className="position-relative d-flex align-items-center justify-content-center bg-white rounded-3 shadow-sm overflow-hidden"
        style={{
          width: `${size}px`,
          height: `${size}px`,
          padding: '2px',
          border: '1px solid rgba(255, 255, 255, 0.35)',
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.15)'
        }}
      >
        <img
          src="/logo.png"
          alt="HYPER JAPAN Logo"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain'
          }}
        />
      </div>

      {showText && (
        <div className="d-flex flex-column" style={{ lineHeight: '1.05' }}>
          <div className="d-flex align-items-baseline" style={{ gap: '4px' }}>
            <span
              className={`fw-black tracking-tight ${light ? 'text-navy-dark' : 'text-white'}`}
              style={{
                fontSize: `${size * 0.48}px`,
                fontWeight: '900',
                letterSpacing: '-0.3px',
                fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
              }}
            >
              HYPER
            </span>
            <span
              style={{
                fontSize: `${size * 0.52}px`,
                fontWeight: '900',
                letterSpacing: '0.2px',
                color: '#ef4444' /* Coral Red matching the Japanese Torii & Rising Sun */
              }}
            >
              JAPAN
            </span>
          </div>
          <span
            className={light ? 'text-secondary' : 'text-white text-opacity-80'}
            style={{
              fontSize: `${Math.max(size * 0.22, 10)}px`,
              fontWeight: '700',
              letterSpacing: '1px',
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
