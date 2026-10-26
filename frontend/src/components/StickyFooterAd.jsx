import React, { useState, useEffect } from 'react';
import { X, ExternalLink, Sparkles } from 'lucide-react';

const STORAGE_KEY = 'hyper_footer_ad_minimized';

/**
 * StickyFooterAd — Single non-intrusive bottom banner adhering strictly to AGENTS.md
 * - Positioned fixed at the bottom (above mobile bottom-nav on small screens)
 * - Compliant with Google AdSense & Monetag standards
 * - Dismissable / Minimizable with 44x44px accessible touch targets
 * - ZERO EMOJIS, ZERO ARROWS rule strictly enforced
 */
export default function StickyFooterAd() {
  const [isDismissed, setIsDismissed] = useState(() => {
    try {
      return sessionStorage.getItem(STORAGE_KEY) === 'true';
    } catch {
      return false;
    }
  });

  const [isMinimized, setIsMinimized] = useState(false);

  useEffect(() => {
    // Attempt Google AdSense push if adsbygoogle exists on window
    try {
      if (typeof window !== 'undefined' && window.adsbygoogle) {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      }
    } catch (_) {}
  }, [isDismissed, isMinimized]);

  if (isDismissed) return null;

  if (isMinimized) {
    return (
      <div
        className="fixed-bottom d-flex justify-content-end p-2 pointer-events-none sticky-footer-ad-wrap"
        style={{ zIndex: 1015 }}
      >
        <button
          type="button"
          onClick={() => setIsMinimized(false)}
          className="btn btn-sm btn-light border shadow-sm rounded-pill px-3 py-1.5 d-inline-flex align-items-center gap-1.5 pointer-events-auto nav-btn-touch"
          style={{
            fontSize: '11.5px',
            fontWeight: 600,
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(8px)',
            color: 'var(--slate-700)'
          }}
          aria-label="Mở lại banner tài trợ"
          title="Mở lại banner tài trợ"
        >
          <Sparkles size={13} className="text-primary" />
          <span>Tài trợ</span>
        </button>
      </div>
    );
  }

  const handleDismiss = () => {
    setIsDismissed(true);
    try {
      sessionStorage.setItem(STORAGE_KEY, 'true');
    } catch (_) {}
  };

  return (
    <aside
      aria-label="Quảng cáo và tài trợ"
      className="sticky-footer-ad-dock"
    >
      <div className="container px-2 px-md-3">
        <div className="sticky-footer-ad-card d-flex align-items-center justify-content-between">
          {/* Ad Label & Badge */}
          <div className="d-flex align-items-center gap-2 flex-shrink-0">
            <span className="badge rounded-pill bg-slate-100 text-slate-600 border border-slate-200 fw-bold px-2 py-0.5" style={{ fontSize: '10px', letterSpacing: '0.04em' }}>
              QUẢNG CÁO
            </span>
          </div>

          {/* Ad Content / Slot (Google AdSense Responsive Unit or Sponsored Partner) */}
          <div className="sticky-footer-ad-content flex-grow-1 mx-2 min-w-0">
            {/* Google AdSense container (activated when ca-pub ID is injected) */}
            <div className="adsense-slot-wrapper d-none">
              <ins
                className="adsbygoogle"
                style={{ display: 'inline-block', width: '100%', height: '50px' }}
                data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
                data-ad-slot="XXXXXXXXXX"
                data-ad-format="horizontal"
                data-full-width-responsive="true"
              />
            </div>

            {/* Premium Native Sponsored Partner Display (Standard Fallback) */}
            <a
              href="https://www.facebook.com/thuathyper.05"
              target="_blank"
              rel="noopener noreferrer"
              className="d-flex align-items-center justify-content-center justify-content-md-start gap-2 text-decoration-none text-dark w-100 py-1"
              title="Lộ trình học tiếng Nhật N5 lên N3 & Học bổng Du học 2026"
            >
              <div className="d-flex align-items-center gap-1.5 min-w-0 text-truncate">
                <span className="badge bg-primary text-white rounded-pill px-2 py-0.5 fw-bold" style={{ fontSize: '10.5px' }}>
                  Đối tác
                </span>
                <span className="fw-semibold text-truncate small" style={{ fontSize: '12.5px', color: 'var(--slate-800)' }}>
                  Lộ trình học tiếng Nhật N5 lên N3 cấp tốc & Tư vấn Học bổng Du học Nhật Bản 2026
                </span>
                <ExternalLink size={12} className="text-muted flex-shrink-0 d-none d-sm-inline" />
              </div>
            </a>
          </div>

          {/* Controls: Minimize & Close */}
          <div className="d-flex align-items-center gap-1 flex-shrink-0">
            <button
              type="button"
              onClick={() => setIsMinimized(true)}
              className="btn btn-sm text-secondary p-0 d-flex align-items-center justify-content-center nav-btn-touch"
              style={{ width: 36, height: 36, minWidth: 44, minHeight: 44, borderRadius: 8 }}
              title="Thu nhỏ banner"
              aria-label="Thu nhỏ banner quảng cáo"
            >
              <span className="small text-muted fw-semibold" style={{ fontSize: '11px' }}>Ẩn</span>
            </button>

            <button
              type="button"
              onClick={handleDismiss}
              className="btn btn-sm text-secondary p-0 d-flex align-items-center justify-content-center nav-btn-touch"
              style={{ width: 36, height: 36, minWidth: 44, minHeight: 44, borderRadius: 8 }}
              title="Đóng quảng cáo"
              aria-label="Đóng quảng cáo"
            >
              <X size={15} />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
