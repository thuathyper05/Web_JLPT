import React from 'react';

const Logo = ({ size = 34, showText = true, className = '', light = false }) => {
  return (
    <div className={`d-inline-flex align-items-center ${className}`} style={{ gap: '8px' }}>
      {/* Official HYPER JAPAN Emblem Icon */}
      <div
        className="position-relative d-flex align-items-center justify-content-center bg-white shadow-xs overflow-hidden flex-shrink-0"
        style={{
          width: `${size}px`,
          height: `${size}px`,
          padding: '2.5px',
          borderRadius: '10px',
          border: '1.5px solid rgba(255, 255, 255, 0.45)',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.18)',
          background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)'
        }}
      >
        <img
          src="/logo.png"
          alt="HYPER JAPAN"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain'
          }}
        />
      </div>

      {showText && (
        <div className="d-flex flex-column justify-content-center" style={{ lineHeight: '1.1' }}>
          <div className="d-flex align-items-baseline" style={{ gap: '3.5px' }}>
            <span
              className={`tracking-tight ${light ? 'text-navy-dark' : 'text-white'}`}
              style={{
                fontSize: `${Math.max(size * 0.46, 13.5)}px`,
                fontWeight: '900',
                letterSpacing: '-0.3px',
                fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
              }}
            >
              HYPER
            </span>
            <span
              style={{
                fontSize: `${Math.max(size * 0.48, 14)}px`,
                fontWeight: '900',
                letterSpacing: '-0.1px',
                color: '#ef4444' /* Torii Japanese Red */
              }}
            >
              JAPAN
            </span>
          </div>
          <div
            className={`d-none d-sm-block ${light ? 'text-secondary' : 'text-white text-opacity-75'}`}
            style={{
              fontSize: '9.5px',
              fontWeight: '700',
              letterSpacing: '0.8px',
              textTransform: 'uppercase',
              lineHeight: '1'
            }}
          >
            JLPT N5 <span style={{ opacity: 0.6 }}>•</span> 日本語
          </div>
        </div>
      )}
    </div>
  );
};

export default Logo;

