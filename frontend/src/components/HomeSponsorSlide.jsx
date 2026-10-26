import React, { useState, useEffect } from 'react';
import { Sparkles, ChevronRight, X, GraduationCap, ShieldCheck } from 'lucide-react';

const SPONSOR_SLIDES = [
  {
    id: 1,
    tag: 'TÀI TRỢ',
    title: 'Học Bổng Du Học Nhật Bản 2026',
    desc: 'Lộ trình N5 lên N3 cấp tốc & Học bổng 100% ngành Công nghệ',
    badge: 'Học bổng 100%',
    link: 'https://www.facebook.com/thuathyper.05',
    icon: GraduationCap,
    iconColor: '#059669'
  },
  {
    id: 2,
    tag: 'ĐỐI TÁC',
    title: 'Khóa Luyện Đề Thi JLPT N5–N3 Thực Chiến',
    desc: 'Phòng thi ảo bấm giờ chuẩn format Tokyo • Phân tích điểm yếu',
    badge: 'Chuẩn JLPT',
    link: 'https://www.facebook.com/thuathyper.05',
    icon: ShieldCheck,
    iconColor: '#2563eb'
  },
  {
    id: 3,
    tag: 'ƯU ĐÃI',
    title: 'HYPER JAPAN VIP PRO • Tiết kiệm 50%',
    desc: 'Mở khóa 25 bài Minna, 75 câu trợ từ nâng cao & Sensei AI 24/7',
    badge: 'Chỉ 49k/tháng',
    link: 'https://www.facebook.com/thuathyper.05',
    icon: Sparkles,
    iconColor: '#d97706'
  }
];

const STORAGE_KEY = 'hyper_sponsor_slide_dismissed';

export default function HomeSponsorSlide() {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isDismissed, setIsDismissed] = useState(() => {
    try {
      return sessionStorage.getItem(STORAGE_KEY) === 'true';
    } catch {
      return false;
    }
  });

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
    <div className="home-sponsor-slide-container mb-3" role="region" aria-label="Thông tin tài trợ">
      <div className="home-sponsor-slide-card px-2.5 py-1.5 rounded-pill border bg-white shadow-xs d-flex align-items-center justify-content-between gap-2">
        {/* Left: Icon + Text */}
        <a
          href={currentSlide.link}
          target="_blank"
          rel="noopener noreferrer"
          className="d-flex align-items-center gap-2 flex-grow-1 min-w-0 text-decoration-none text-dark"
          title={currentSlide.title}
        >
          <div
            className="d-flex align-items-center justify-content-center rounded-circle flex-shrink-0"
            style={{
              width: '24px',
              height: '24px',
              background: '#eff6ff',
              border: '1px solid #dbeafe'
            }}
          >
            <IconComponent size={13} style={{ color: currentSlide.iconColor }} />
          </div>

          <div className="d-flex align-items-center gap-1.5 min-w-0 text-truncate">
            <span className="badge rounded-pill bg-slate-100 text-slate-600 border border-slate-200 fw-bold px-1.5 py-0.5" style={{ fontSize: '9px', letterSpacing: '0.02em' }}>
              {currentSlide.tag}
            </span>
            <span className="fw-bold text-navy-dark text-truncate" style={{ fontSize: '11.5px' }}>
              {currentSlide.title}
            </span>
            <span className="text-muted text-truncate small d-none d-md-inline" style={{ fontSize: '11px' }}>
              • {currentSlide.desc}
            </span>
          </div>
        </a>

        {/* Right: Dot Indicators + Dismiss */}
        <div className="d-flex align-items-center gap-1.5 flex-shrink-0">
          <a
            href={currentSlide.link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary text-decoration-none small fw-bold d-inline-flex align-items-center gap-0.5 px-1"
            style={{ fontSize: '11px' }}
          >
            <span>Chi tiết</span>
            <ChevronRight size={12} />
          </a>

          <button
            type="button"
            onClick={handleDismiss}
            className="btn btn-sm text-secondary p-0 d-flex align-items-center justify-content-center rounded-circle border-0 bg-transparent"
            style={{ width: '24px', height: '24px' }}
            title="Đóng thông báo"
            aria-label="Đóng thông báo"
          >
            <X size={12} className="opacity-60" />
          </button>
        </div>
      </div>
    </div>
  );
}
