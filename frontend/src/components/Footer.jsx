import React from 'react';
import {
  Phone,
  ShieldCheck,
  BookOpen,
  PenTool,
  Layers,
  CheckSquare,
  Sprout,
  RefreshCw,
  Star,
  FileText,
  BarChart2,
  Zap,
  Compass,
  Headphones,
  ExternalLink
} from 'lucide-react';
import Logo from './Logo';

const Footer = ({ onNavigate = () => {} }) => {
  return (
    <footer
      className="site-luxury-footer mt-5 pt-5 text-white position-relative"
      style={{
        background: 'linear-gradient(180deg, #091224 0%, #060c18 100%)',
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        // Ample bottom padding on mobile so it doesn't get obscured by the mobile bottom nav
        paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 90px)'
      }}
    >
      <div className="container">
        {/* ── Top Row: 4 Pillars ── */}
        <div className="row g-4 pb-4" style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
          {/* Col 1: Brand & Philosophy */}
          <div className="col-12 col-lg-4">
            <div className="mb-3">
              <Logo size={36} light={false} />
            </div>
            <p className="small mb-3" style={{ color: '#94a3b8', maxWidth: '360px', lineHeight: '1.65' }}>
              Hệ thống đào tạo và ôn tập tiếng Nhật thông minh theo chuẩn Minna no Nihongo N5.
              Lộ trình khoa học qua phát âm Tokyo Pitch, thẻ Flashcard 3D, thi trắc nghiệm áp lực thực tế và Sensei AI đồng hành 24/7.
            </p>
            <div
              className="d-inline-flex align-items-center gap-2 px-3 py-1.5 rounded-pill small mb-3"
              style={{
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                color: '#e2e8f0',
                fontSize: '12px'
              }}
            >
              <ShieldCheck size={14} className="text-success" />
              <span>Chuẩn 25 bài Minna no Nihongo I & II</span>
            </div>
          </div>

          {/* Col 2: DEDICATED CUSTOMER SUPPORT SECTION (HOTLINE & FACEBOOK) */}
          <div className="col-12 col-sm-6 col-lg-3">
            <div className="d-flex align-items-center gap-2 mb-3">
              <Headphones size={15} className="text-info" />
              <h6
                className="fw-bold text-uppercase tracking-wider small mb-0 text-white"
                style={{ fontSize: '11.5px', letterSpacing: '0.07em' }}
              >
                Hỗ Trợ & Kết Nối
              </h6>
            </div>

            <div className="d-flex flex-column gap-2.5">
              {/* Hotline Contact Card - Refined Luxury */}
              <a
                href="tel:0345698251"
                className="footer-contact-item text-decoration-none"
                title="Gọi Hotline tư vấn 24/7"
              >
                <div className="footer-contact-icon-box hotline-glow">
                  <Phone size={16} />
                </div>
                <div className="min-w-0 flex-grow-1">
                  <div className="d-flex align-items-center justify-content-between mb-0.5">
                    <span className="footer-contact-num">0345.698.251</span>
                    <span className="footer-status-pill">
                      <span className="footer-pulse-dot" />
                      <span>24/7</span>
                    </span>
                  </div>
                  <div className="footer-contact-sub">
                    Hotline tư vấn & hỗ trợ
                  </div>
                </div>
              </a>

              {/* Official Facebook Card - Refined Luxury with Nguyen Van Thuat */}
              <a
                href="https://www.facebook.com/thuathyper.05"
                target="_blank"
                rel="noopener noreferrer"
                className="footer-contact-item text-decoration-none"
                title="Mở Facebook cá nhân Nguyen Van Thuat"
              >
                <div className="footer-contact-icon-box fb-glow">
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="#ffffff">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </div>
                <div className="min-w-0 flex-grow-1">
                  <div className="d-flex align-items-center gap-1.5 mb-0.5">
                    <span className="footer-contact-name">Nguyen Van Thuat</span>
                    <span className="verified-badge-pill" title="Tài khoản chính thức">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="#38bdf8">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                      </svg>
                    </span>
                  </div>
                  <div className="footer-contact-sub">
                    Facebook hỗ trợ học viên
                  </div>
                </div>
                <ExternalLink size={12} className="text-muted flex-shrink-0 ms-1 opacity-75" />
              </a>
            </div>
          </div>

          {/* Col 3: Core Learning Tracks */}
          <div className="col-6 col-sm-6 col-lg-2">
            <h6
              className="fw-bold text-uppercase tracking-wider small mb-3 text-white"
              style={{ fontSize: '12px', letterSpacing: '0.06em' }}
            >
              Phương Pháp Học
            </h6>
            <ul className="list-unstyled small d-flex flex-column gap-2 mb-0">
              {[
                { id: 'lessons', label: '25 Bài học Minna', icon: BookOpen, color: '#3b82f6' },
                { id: 'flashcard', label: 'Thẻ Flashcard 3D', icon: Layers, color: '#10b981' },
                { id: 'quiz', label: 'Trắc nghiệm JLPT', icon: CheckSquare, color: '#ef4444' },
                { id: 'wordmatch', label: 'Nối từ siêu tốc', icon: Zap, color: '#f59e0b' },
                { id: 'particles', label: 'Luyện 19 trợ từ', icon: Compass, color: '#a855f7' },
                { id: 'kanji', label: 'Chữ Hán Kanji N5', icon: PenTool, color: '#38bdf8' }
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.id}>
                    <a
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        onNavigate(item.id);
                      }}
                      className="text-decoration-none d-inline-flex align-items-center gap-2"
                      style={{ color: '#94a3b8', transition: 'color 0.15s ease' }}
                      onMouseOver={(e) => { e.currentTarget.style.color = '#ffffff'; }}
                      onMouseOut={(e) => { e.currentTarget.style.color = '#94a3b8'; }}
                    >
                      <Icon size={14} style={{ color: item.color }} />
                      <span>{item.label}</span>
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Col 4: Retention Notebooks & Standard */}
          <div className="col-6 col-sm-6 col-lg-3">
            <h6
              className="fw-bold text-uppercase tracking-wider small mb-3 text-white"
              style={{ fontSize: '12px', letterSpacing: '0.06em' }}
            >
              Sổ Tay & Tiêu Chuẩn
            </h6>
            <ul className="list-unstyled small d-flex flex-column gap-2 mb-3">
              {[
                { id: 'garden', label: 'Vườn cây trí nhớ SRS', icon: Sprout, color: '#10b981' },
                { id: 'review', label: 'Ôn tập câu làm sai', icon: RefreshCw, color: '#ef4444' },
                { id: 'favorites', label: 'Kho từ yêu thích', icon: Star, color: '#f59e0b' },
                { id: 'notes', label: 'Sổ ghi chú cá nhân', icon: FileText, color: '#38bdf8' },
                { id: 'dashboard', label: 'Báo cáo tiến độ học', icon: BarChart2, color: '#3b82f6' }
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.id}>
                    <a
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        onNavigate(item.id);
                      }}
                      className="text-decoration-none d-inline-flex align-items-center gap-2"
                      style={{ color: '#94a3b8', transition: 'color 0.15s ease' }}
                      onMouseOver={(e) => { e.currentTarget.style.color = '#ffffff'; }}
                      onMouseOut={(e) => { e.currentTarget.style.color = '#94a3b8'; }}
                    >
                      <Icon size={14} style={{ color: item.color }} />
                      <span>{item.label}</span>
                    </a>
                  </li>
                );
              })}
            </ul>

            <div
              className="p-2 rounded-3 d-flex justify-content-between align-items-center small"
              style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.08)' }}
            >
              <span style={{ color: '#94a3b8' }}>Dữ liệu chuẩn:</span>
              <span className="fw-bold text-warning">1,589 từ • Tokyo Pitch</span>
            </div>
          </div>
        </div>

        {/* ── Bottom Copyright & System Status ── */}
        <div className="pt-3.5 d-flex justify-content-between align-items-center flex-wrap gap-2 small" style={{ color: '#64748b' }}>
          <div>
            © 2026 <strong className="text-white">HYPER JAPAN</strong>. Nền tảng học tiếng Nhật hiện đại. All rights reserved.
          </div>
          <div className="d-flex align-items-center gap-3">
            <span className="d-inline-flex align-items-center gap-1.5" style={{ color: '#10b981' }}>
              <span className="rounded-circle d-inline-block" style={{ width: 6, height: 6, background: '#10b981' }} />
              Hệ thống trực tuyến 24/7
            </span>
            <span>•</span>
            <span style={{ color: '#94a3b8' }}>Phiên bản 2.5 Pro</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
