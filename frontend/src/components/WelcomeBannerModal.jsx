import React, { useState, useEffect } from 'react';
import { X, Sparkles, Rocket, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';
import { sounds } from '../services/sounds';

const STORAGE_KEY = 'hyper_welcome_banner_dismissed_permanent';

export default function WelcomeBannerModal({ onExploreCourses }) {
  const [isOpen, setIsOpen] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    // Only suppress if user has explicitly checked "Không hiển thị lại" in localStorage
    const isPermanentlyDismissed = localStorage.getItem(STORAGE_KEY);

    if (!isPermanentlyDismissed) {
      // Smooth entrance delay (350ms)
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 350);
      return () => clearTimeout(timer);
    }
  }, []);

  // Listen for custom trigger to re-open banner if needed
  useEffect(() => {
    const handleReopen = () => {
      setIsClosing(false);
      setIsOpen(true);
    };
    window.addEventListener('open-welcome-modal', handleReopen);
    window.openWelcomeBanner = handleReopen;
    window.resetWelcomeBanner = () => {
      localStorage.removeItem(STORAGE_KEY);
      handleReopen();
    };

    return () => {
      window.removeEventListener('open-welcome-modal', handleReopen);
      delete window.openWelcomeBanner;
      delete window.resetWelcomeBanner;
    };
  }, []);

  // Lock body scroll while modal is open
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
        particleCount: 90,
        spread: 70,
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
        background: 'rgba(7, 12, 22, 0.86)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        padding: '14px',
        overflowY: 'auto'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          handleClose();
        }
      }}
    >
      {/* ── Flagship Modal Card Container ── */}
      <div
        className={`welcome-flagship-card position-relative ${
          isClosing ? 'welcome-modal-card-closing' : ''
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Top Floating Header Bar (Overlaying Poster) ── */}
        <div className="welcome-floating-topbar">
          {/* Brand pill badge */}
          <div className="welcome-floating-badge">
            <span className="welcome-live-pulse-dot" />
            <Sparkles size={13} className="text-warning flex-shrink-0" />
            <span>HYPER JAPAN • THÔNG BÁO</span>
          </div>

          {/* Luxury Floating "X" Close Button */}
          <button
            type="button"
            onClick={handleClose}
            aria-label="Đóng thông báo (X)"
            className="welcome-close-floating-btn"
            title="Đóng thông báo (Esc)"
          >
            <X size={19} strokeWidth={2.8} />
          </button>
        </div>

        {/* ── Edge-to-Edge Poster Showcase ── */}
        <div className="welcome-poster-wrap">
          <img
            src="/welcome-banner.jpg"
            alt="HYPER JAPAN - Website Học Tiếng Nhật Đẳng Cấp Số 1 Việt Nam - Founder Mr. Quang Minh"
            className="welcome-poster-img"
            loading="eager"
            fetchPriority="high"
            decoding="async"
          />

          {/* Smooth Bottom Vignette Transition */}
          <div className="welcome-poster-vignette" />

          {/* Animated Light Sweep Shimmer */}
          <div className="welcome-shine-overlay" />
        </div>

        {/* ── Action Panel (Clean & Focused) ── */}
        <div className="welcome-panel-body pt-3 pb-3">
          {/* Primary Action Button */}
          <button
            type="button"
            onClick={handlePrimaryAction}
            className="welcome-btn-primary"
          >
            <div className="d-flex align-items-center gap-2">
              <div className="welcome-btn-icon-box">
                <Rocket size={17} />
              </div>
              <span style={{ fontSize: '15px', fontWeight: 800 }}>Khám Phá Ngay</span>
            </div>
            <ArrowRight size={18} className="welcome-btn-arrow" />
          </button>

          {/* ── Bottom Preferences Bar ── */}
          <div className="welcome-meta-bar mt-2.5">
            <label className="welcome-checkbox-label">
              <input
                type="checkbox"
                className="welcome-custom-checkbox"
                checked={dontShowAgain}
                onChange={(e) => setDontShowAgain(e.target.checked)}
              />
              <span>Không hiển thị lại</span>
            </label>

            <span className="welcome-key-hint">
              Nhấn <kbd className="welcome-kbd">ESC</kbd> hoặc <kbd className="welcome-kbd">✕</kbd> để đóng
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
