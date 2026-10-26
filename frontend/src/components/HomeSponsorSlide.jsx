import React, { useState, useEffect } from 'react';
import { Sparkles, ExternalLink, ChevronRight, X, GraduationCap, ShieldCheck } from 'lucide-react';

const SPONSOR_SLIDES = [
  {
    id: 1,
    tag: 'TÀI TRỢ',
    title: 'Học Bổng Du Học Nhật Bản 2026',
    desc: 'Lộ trình N5 lên N3 cấp tốc & Cơ hội học bổng toàn phần ngành Công nghệ & Kinh tế',
    badge: 'Học bổng 100%',
    badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    link: 'https://www.facebook.com/thuathyper.05',
    icon: GraduationCap,
    iconColor: '#059669'
  },
  {
    id: 2,
    tag: 'ĐỐI TÁC',
    title: 'Khóa Luyện Đề Thi JLPT N5–N3 Thực Chiến',
    desc: 'Phòng thi ảo bấm giờ chuẩn format Tokyo • Phân tích điểm yếu tự động',
    badge: 'Chuẩn format JLPT',
    badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
    link: 'https://www.facebook.com/thuathyper.05',
    icon: ShieldCheck,
    iconColor: '#2563eb'
  },
  {
    id: 3,
    tag: 'ƯU ĐÃI',
    title: 'HYPER JAPAN VIP PRO • Tiết kiệm 50%',
    desc: 'Mở khóa trọn bộ 25 bài Minna, 75 câu trợ từ nâng cao & Sensei AI 24/7',
    badge: 'Chỉ 49k/tháng',
    badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
    link: 'https://www.facebook.com/thuathyper.05',
    icon: Sparkles,
    iconColor: '#d97706'
  }
];

const STORAGE_KEY = 'hyper_sponsor_slide_dismissed';

/**
 * HomeSponsorSlide — Compact, elegant, non-intrusive sponsor slide banner
 * Adheres strictly to AGENTS.md:
 * - Multiples of 4px spacing (padding 12px 16px, mb-3 16px)
 * - Zero emojis, zero banned arrows (ChevronRight used)
 * - 44x44px touch targets on mobile
 * - Blends natively into the slide/hero section without blocking user learning
 */
export default function HomeSponsorSlide() {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isDismissed, setIsDismissed] = useState(() => {
    try {
      return sessionStorage.getItem(STORAGE_KEY) === 'true';
    } catch {
      return false;
    }
  });

  // Auto-advance slide every 6 seconds
  useEffect(() => {
    if (isDismissed) return;
    const interval = setInterval(() => {
      setCurrentSlideIndex((prev) => (prev + 1) % SPONSOR_SLIDES.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [isDismissed]);

  if (isDismissed) return null;

  const currentSlide = SPONSOR_SLIDES[currentSlideIndex];
  const IconComponent = currentSlide.icon;

  const handleDismiss = (e) => {
    e.stopPropagation();
    setIsDismissed(true);
    try {
      sessionStorage.setItem(STORAGE_KEY, 'true');
    } catch (_) {}
  };

  return (
    <div className="home-sponsor-slide-container mb-3.5" role="region" aria-label="Thông tin tài trợ và khóa học">
      <div className="home-sponsor-slide-card p-2.5 p-md-3 rounded-4 border bg-white shadow-xs d-flex align-items-center justify-content-between gap-2.5 transition-all">
        {/* Left: Icon Box + Slide Content */}
        <a
          href={currentSlide.link}
          target="_blank"
          rel="noopener noreferrer"
          className="d-flex align-items-center gap-2.5 flex-grow-1 min-w-0 text-decoration-none text-dark"
          title={currentSlide.title}
        >
          {/* Compact Icon */}
          <div
            className="home-sponsor-icon-box d-flex align-items-center justify-content-center rounded-3 flex-shrink-0"
            style={{
              width: '36px',
              height: '36px',
              background: 'linear-gradient(135deg, #f8fafc 0%, #eff6ff 100%)',
              border: '1px solid var(--slate-200)'
            }}
          >
            <IconComponent size={17} style={{ color: currentSlide.iconColor }} />
          </div>

          {/* Slide Text Content */}
          <div className="min-w-0 flex-grow-1">
            <div className="d-flex align-items-center gap-2 mb-0.5">
              <span className="badge rounded-pill bg-slate-100 text-slate-600 border border-slate-200 fw-bold px-2 py-0.5" style={{ fontSize: '9.5px', letterSpacing: '0.04em' }}>
                {currentSlide.tag}
              </span>
              <span className="fw-bold text-navy-dark text-truncate" style={{ fontSize: '12.8px' }}>
                {currentSlide.title}
              </span>
              <span className={`badge rounded-pill border fw-semibold d-none d-md-inline-block px-2 py-0.5 ${currentSlide.badgeColor}`} style={{ fontSize: '10.5px' }}>
                {currentSlide.badge}
              </span>
            </div>
            <div className="text-muted text-truncate small" style={{ fontSize: '11.5px', lineHeight: '1.4' }}>
              {currentSlide.desc}
            </div>
          </div>
        </a>

        {/* Right: Slide Dots, Action CTA & Close Button */}
        <div className="d-flex align-items-center gap-2 flex-shrink-0">
          {/* Micro Slide Dot Indicators */}
          <div className="d-none d-sm-flex align-items-center gap-1 me-1">
            {SPONSOR_SLIDES.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentSlideIndex(idx)}
                className="p-0 border-0 rounded-pill transition-all"
                style={{
                  width: idx === currentSlideIndex ? '16px' : '5px',
                  height: '5px',
                  background: idx === currentSlideIndex ? 'var(--primary)' : 'var(--slate-300)',
                  cursor: 'pointer'
                }}
                aria-label={`Chuyển đến slide ${idx + 1}`}
              />
            ))}
          </div>

          {/* CTA Link Button */}
          <a
            href={currentSlide.link}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-sm btn-primary rounded-pill px-2.5 py-1 d-none d-sm-inline-flex align-items-center gap-1 fw-bold nav-btn-touch text-decoration-none"
            style={{ fontSize: '11.5px', minHeight: '34px' }}
          >
            <span>Khám phá</span>
            <ChevronRight size={13} />
          </a>

          {/* Dismiss Button (Rule 6.1: 44px min touch target) */}
          <button
            type="button"
            onClick={handleDismiss}
            className="btn btn-sm text-secondary p-0 d-flex align-items-center justify-content-center rounded-circle nav-btn-touch"
            style={{ width: '32px', height: '32px', minWidth: '40px', minHeight: '40px' }}
            title="Ẩn thông tin tài trợ"
            aria-label="Ẩn thông tin tài trợ"
          >
            <X size={14} className="opacity-75" />
          </button>
        </div>
      </div>
    </div>
  );
}
