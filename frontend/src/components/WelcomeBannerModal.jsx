import React, { useState, useEffect } from 'react';
import { X, Sparkles, Award, ArrowRight, ExternalLink } from 'lucide-react';
import confetti from 'canvas-confetti';
import { sounds } from '../services/sounds';

const STORAGE_KEY = 'hyper_welcome_banner_dismissed_v1';

export default function WelcomeBannerModal({ onExploreCourses }) {
  const [isOpen, setIsOpen] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    // Check if user has already dismissed this banner in current session or marked don't show
    const isDismissed = sessionStorage.getItem(STORAGE_KEY) || localStorage.getItem(STORAGE_KEY);

    if (!isDismissed) {
      // Gentle entrance delay (450ms) for smooth page mount and visual impact
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 450);
      return () => clearTimeout(timer);
    }
  }, []);

  // Listen for custom trigger to re-open banner from navbar or footer
  useEffect(() => {
    const handleReopen = () => {
      setIsClosing(false);
      setIsOpen(true);
    };
    window.addEventListener('open-welcome-modal', handleReopen);
    return () => window.removeEventListener('open-welcome-modal', handleReopen);
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
    sessionStorage.setItem(STORAGE_KEY, 'true');

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
    sessionStorage.setItem(STORAGE_KEY, 'true');

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
        background: 'rgba(8, 14, 26, 0.82)',
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
        padding: '16px',
        overflowY: 'auto'
      }}
      onClick={(e) => {
        // Dismiss when clicking the dark backdrop
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
          maxWidth: '470px',
          background: 'linear-gradient(180deg, #131d31 0%, #0b1120 100%)',
          borderRadius: '24px',
          border: '1.5px solid rgba(255, 255, 255, 0.16)',
          boxShadow: '0 25px 65px -12px rgba(0, 0, 0, 0.85), 0 0 45px rgba(239, 68, 68, 0.28)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: 'min(92vh, 800px)',
          margin: 'auto'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Subtle top edge gradient bar */}
        <div
          style={{
            height: '3.5px',
            width: '100%',
            background: 'linear-gradient(90deg, #ef4444 0%, #f59e0b 50%, #3b82f6 100%)'
          }}
        />

        {/* ── Top Header with Brand Badge & "X" Close Button ── */}
        <div
          className="d-flex align-items-center justify-content-between px-3 pt-3 pb-2.5"
          style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}
        >
          {/* Brand pill badge */}
          <div className="d-flex align-items-center gap-2">
            <div
              className="d-flex align-items-center gap-1.5 px-2.5 py-1 rounded-pill"
              style={{
                background: 'rgba(239, 68, 68, 0.14)',
                border: '1px solid rgba(239, 68, 68, 0.35)',
                color: '#fca5a5',
                fontSize: '12px',
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
            <X size={18} strokeWidth={2.6} />
          </button>
        </div>

        {/* ── Scrollable Body with High-Definition Image ── */}
        <div
          className="p-3 welcome-modal-body"
          style={{
            overflowY: 'auto',
            overscrollBehavior: 'contain'
          }}
        >
          {/* Image Showcase Frame */}
          <div
            className="position-relative overflow-hidden welcome-banner-frame"
            style={{
              borderRadius: '16px',
              border: '1px solid rgba(255, 255, 255, 0.18)',
              background: '#090d16',
              boxShadow: '0 12px 30px rgba(0, 0, 0, 0.45)'
            }}
          >
            {/* Crisp 1024x1024 Banner Image */}
            <img
              src="/welcome-banner.jpg"
              alt="HYPER JAPAN - Website Học Tiếng Nhật Đẳng Cấp Số 1 Việt Nam - Founder Mr. Quang Minh"
              className="w-100 h-auto d-block welcome-banner-img"
              style={{
                aspectRatio: '1 / 1',
                objectFit: 'cover',
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

          {/* Text Summary */}
          <div className="mt-3 text-center">
            <h5
              className="fw-bold mb-1 text-white"
              style={{
                fontSize: '17px',
                letterSpacing: '-0.01em',
                lineHeight: '1.35'
              }}
            >
              Nền Tảng Tiếng Nhật Đẳng Cấp #1
            </h5>
            <p
              className="small mb-0"
              style={{
                color: '#94a3b8',
                fontSize: '12.5px',
                lineHeight: '1.55'
              }}
            >
              Chào mừng bạn đến với hệ sinh thái học tập chuẩn Tokyo: 25 bài Minna no Nihongo, Kanji N5 thông minh, Flashcard 3D & trắc nghiệm tốc độ cao!
            </p>
          </div>
        </div>

        {/* ── Footer Actions ── */}
        <div
          className="p-3 pt-2"
          style={{
            background: 'rgba(10, 15, 29, 0.7)',
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
              fontSize: '14.5px',
              letterSpacing: '0.01em',
              transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
          >
            <span>Bắt đầu khám phá ngay</span>
            <ArrowRight size={17} />
          </button>

          {/* Secondary Options Bar */}
          <div className="d-flex align-items-center justify-content-between mt-2.5 px-1">
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
              Đóng thông báo (✕)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
