import React, { useState, useEffect } from 'react';
import { X, Sparkles, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';
import { sounds } from '../services/sounds';

const STORAGE_KEY = 'hyper_welcome_banner_dismissed_permanent';

export default function WelcomeBannerModal({ onExploreCourses }) {
  const [isOpen, setIsOpen] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    // Only suppress if user has explicitly checked "Không hiện lại" in localStorage
    const isPermanentlyDismissed = localStorage.getItem(STORAGE_KEY);

    if (!isPermanentlyDismissed) {
      // Smooth entrance delay (350ms) for comfortable visual transition
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 350);
      return () => clearTimeout(timer);
    }
  }, []);

  // Listen for custom trigger to re-open banner from navbar, footer, or mobile menu
  useEffect(() => {
    const handleReopen = () => {
      setIsClosing(false);
      setIsOpen(true);
    };
    window.addEventListener('open-welcome-modal', handleReopen);
    // Expose developer helpers on window
    window.openWelcomeBanner = handleReopen;
    window.resetWelcomeBanner = () => {
      localStorage.removeItem(STORAGE_KEY);
      sessionStorage.clear();
      handleReopen();
    };

    return () => {
      window.removeEventListener('open-welcome-modal', handleReopen);
      delete window.openWelcomeBanner;
      delete window.resetWelcomeBanner;
    };
  }, []);

  // Body scroll lock while modal is open
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  // Handle ESC key to dismiss
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, dontShowAgain]);

  const handleClose = () => {
    try {
      sounds.playFlip();
    } catch (_) {}

    setIsClosing(true);

    if (dontShowAgain) {
      localStorage.setItem(STORAGE_KEY, 'true');
    }

    setTimeout(() => {
      setIsOpen(false);
      setIsClosing(false);
    }, 220);
  };

  const handlePrimaryAction = () => {
    try {
      sounds.playComplete();
      confetti({
        particleCount: 80,
        spread: 65,
        origin: { y: 0.6 },
        colors: ['#ef4444', '#f59e0b', '#3b82f6', '#10b981', '#ffffff']
      });
    } catch (_) {}

    setIsClosing(true);
    if (dontShowAgain) {
      localStorage.setItem(STORAGE_KEY, 'true');
    }

    setTimeout(() => {
      setIsOpen(false);
      setIsClosing(false);
      if (onExploreCourses) {
        onExploreCourses();
      }
    }, 220);
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Thông báo chính thức từ HYPER JAPAN"
      className={`fixed-top w-100 h-100 d-flex align-items-center justify-content-center welcome-modal-overlay ${
        isClosing ? 'welcome-modal-overlay-closing' : ''
      }`}
      style={{
        zIndex: 99999,
        background: 'rgba(8, 14, 26, 0.85)',
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
        padding: '12px',
        overflowY: 'auto'
      }}
      onClick={(e) => {
        // Dismiss when tapping outside the card
        if (e.target === e.currentTarget) {
          handleClose();
        }
      }}
    >
      {/* ── Modal Card Container ── */}
      <div
        className={`welcome-modal-card position-relative ${
          isClosing ? 'welcome-modal-card-closing' : ''
        }`}
        style={{
          width: '100%',
          maxWidth: '460px',
          background: 'linear-gradient(180deg, #131d31 0%, #0b1120 100%)',
          borderRadius: '22px',
          border: '1.5px solid rgba(255, 255, 255, 0.16)',
          boxShadow: '0 25px 65px -12px rgba(0, 0, 0, 0.85), 0 0 45px rgba(239, 68, 68, 0.28)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '94vh',
          margin: 'auto'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top edge gradient accent bar */}
        <div
          style={{
            height: '3.5px',
            width: '100%',
            background: 'linear-gradient(90deg, #ef4444 0%, #f59e0b 50%, #3b82f6 100%)'
          }}
        />

        {/* ── Top Header with Brand Badge & "X" Close Button ── */}
        <div
          className="d-flex align-items-center justify-content-between px-3 pt-2.5 pb-2"
          style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}
        >
          {/* Brand Badge */}
          <div className="d-flex align-items-center gap-2">
            <div
              className="d-flex align-items-center gap-1.5 px-2.5 py-1 rounded-pill"
              style={{
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.35)',
                color: '#fca5a5',
                fontSize: '11.5px',
                fontWeight: 700,
                letterSpacing: '0.03em'
              }}
            >
              <Sparkles size={13} className="text-warning" />
              <span>HYPER JAPAN</span>
            </div>
            <span
              className="badge rounded-pill bg-danger bg-opacity-75 text-white px-2 py-0.5 fw-bold"
              style={{ fontSize: '10px', letterSpacing: '0.04em' }}
            >
              THÔNG BÁO
            </span>
          </div>

          {/* ── "X" Close Button ── */}
          <button
            type="button"
            onClick={handleClose}
            aria-label="Đóng thông báo"
            className="welcome-close-btn d-flex align-items-center justify-content-center p-0"
            title="Đóng (Esc)"
          >
            <X size={18} strokeWidth={2.8} />
          </button>
        </div>

        {/* ── High-Definition Banner Showcase Frame ── */}
        <div
          className="p-2.5 welcome-modal-body"
          style={{
            overflowY: 'auto',
            overscrollBehavior: 'contain'
          }}
        >
          <div
            className="position-relative overflow-hidden welcome-banner-frame mx-auto"
            style={{
              borderRadius: '16px',
              border: '1px solid rgba(255, 255, 255, 0.18)',
              background: '#090d16',
              boxShadow: '0 12px 30px rgba(0, 0, 0, 0.45)',
              maxHeight: 'min(58vh, 440px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {/* Crisp 1024x1024 Banner Image */}
            <img
              src="/welcome-banner.jpg"
              alt="HYPER JAPAN - Website Học Tiếng Nhật Đẳng Cấp Số 1 Việt Nam - Founder Mr. Quang Minh"
              className="w-100 h-auto d-block welcome-banner-img"
              style={{
                aspectRatio: '1 / 1',
                maxHeight: 'min(58vh, 440px)',
                objectFit: 'contain',
                imageRendering: '-webkit-optimize-contrast',
                transform: 'translateZ(0)',
                backfaceVisibility: 'hidden',
                borderRadius: '15px'
              }}
              loading="eager"
              fetchPriority="high"
              decoding="async"
            />

            {/* Subtle Luxury Sheen Overlay */}
            <div className="welcome-shine-overlay" />
          </div>
        </div>

        {/* ── Footer Actions ── */}
        <div
          className="p-2.5 pt-2"
          style={{
            background: 'rgba(10, 15, 29, 0.75)',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)'
          }}
        >
          {/* Primary CTA Button */}
          <button
            type="button"
            onClick={handlePrimaryAction}
            className="btn w-100 py-2.5 rounded-3 fw-bold text-white d-flex align-items-center justify-content-center gap-2 welcome-cta-btn"
            style={{
              background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 50%, #b91c1c 100%)',
              border: 'none',
              boxShadow: '0 8px 20px -3px rgba(239, 68, 68, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.25)',
              fontSize: '14px',
              letterSpacing: '0.01em',
              transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
          >
            <span>Bắt đầu học ngay 🚀</span>
            <ArrowRight size={16} />
          </button>

          {/* Secondary Controls Bar */}
          <div className="d-flex align-items-center justify-content-between mt-2 px-1">
            <label
              className="d-flex align-items-center gap-1.5 small mb-0 text-secondary"
              style={{ fontSize: '11.5px', cursor: 'pointer', userSelect: 'none' }}
            >
              <input
                type="checkbox"
                className="form-check-input mt-0"
                style={{
                  width: '14px',
                  height: '14px',
                  cursor: 'pointer',
                  backgroundColor: dontShowAgain ? '#ef4444' : 'transparent',
                  borderColor: 'rgba(255, 255, 255, 0.3)'
                }}
                checked={dontShowAgain}
                onChange={(e) => setDontShowAgain(e.target.checked)}
              />
              <span>Không hiện lại</span>
            </label>

            <button
              type="button"
              onClick={handleClose}
              className="btn btn-link p-0 text-decoration-none small text-secondary"
              style={{
                fontSize: '12px',
                color: '#94a3b8',
                transition: 'color 0.15s ease'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#ffffff')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#94a3b8')}
            >
              Đóng (✕)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
