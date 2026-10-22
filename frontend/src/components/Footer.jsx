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
import { useApp } from '../context/AppContext';

const Footer = ({ onNavigate = () => {} }) => {
  const { onlineCount = 1 } = useApp();

  return (
    <footer
      className="site-luxury-footer mt-5 text-white position-relative"
      style={{
        background: 'linear-gradient(180deg, #091224 0%, #060c18 100%)',
        borderTop: '1px solid rgba(255, 255, 255, 0.08)'
      }}
    >
      {/* ── 1. MOBILE-ONLY COMPACT FOOTER (Super Sleek, Non-Long, Highly Polished) ── */}
      <div
        className="d-block d-lg-none py-3 px-3"
        style={{
          paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 74px)'
        }}
      >
        <div className="container px-1">
          {/* Brand & Mini Badge */}
          <div className="d-flex align-items-center justify-content-between mb-2.5">
            <div className="d-flex align-items-center gap-2">
              <Logo size={26} light={false} />
              <span className="fw-black text-white small" style={{ fontSize: '13px', letterSpacing: '-0.01em' }}>
                HYPER JAPAN
              </span>
            </div>
            <span
              className="d-inline-flex align-items-center gap-1.5 px-2 py-0.5 rounded-pill small"
              style={{
                background: 'rgba(16, 185, 129, 0.12)',
                border: '1px solid rgba(16, 185, 129, 0.25)',
                color: '#34d399',
                fontSize: '11px',
                fontWeight: 700
              }}
            >
              <span className="footer-pulse-dot" />
              <span>{onlineCount} online</span>
            </span>
          </div>

          {/* Compact 2-Column Support Grid on Mobile */}
          <div className="row g-2 mb-2.5">
            {/* Hotline */}
            <div className="col-6">
              <a
                href="tel:0345698251"
                className="footer-contact-item p-2 text-decoration-none h-100"
                style={{ borderRadius: 12 }}
                title="Gọi Hotline tư vấn 24/7"
              >
                <div
                  className="footer-contact-icon-box hotline-glow"
                  style={{ width: 30, height: 30, borderRadius: 9 }}
                >
                  <Phone size={14} />
                </div>
                <div className="min-w-0 flex-grow-1">
                  <div className="fw-bold text-white text-truncate" style={{ fontSize: '12px' }}>
                    0345.698.251
                  </div>
                  <div className="small text-muted text-truncate" style={{ fontSize: '10px' }}>
                    Hotline 24/7
                  </div>
                </div>
              </a>
            </div>

            {/* Facebook */}
            <div className="col-6">
              <a
                href="https://www.facebook.com/thuathyper.05"
                target="_blank"
                rel="noopener noreferrer"
                className="footer-contact-item p-2 text-decoration-none h-100"
                style={{ borderRadius: 12 }}
                title="Facebook Nguyen Van Thuat"
              >
                <div
                  className="footer-contact-icon-box fb-glow"
                  style={{ width: 30, height: 30, borderRadius: 9 }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="#ffffff">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </div>
                <div className="min-w-0 flex-grow-1">
                  <div className="d-flex align-items-center gap-1 text-truncate">
                    <span className="fw-bold text-white text-truncate" style={{ fontSize: '12px' }}>
                      Nguyen Van Thuat
                    </span>
                  </div>
                  <div className="small text-muted text-truncate" style={{ fontSize: '10px' }}>
                    Facebook hỗ trợ
                  </div>
                </div>
              </a>
            </div>
          </div>

          {/* Quick Nav Chips */}
          <div className="d-flex align-items-center justify-content-between flex-wrap gap-1 pt-2 border-top border-secondary border-opacity-15 mb-2">
            {[
              { id: 'lessons', label: '25 Bài Minna' },
              { id: 'flashcard', label: 'Flashcard' },
              { id: 'quiz', label: 'Trắc nghiệm' },
              { id: 'wordmatch', label: 'Nối từ' },
              { id: 'garden', label: 'Vườn cây' }
            ].map((item) => (
              <a
                key={item.id}
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate(item.id);
                }}
                className="text-decoration-none small text-secondary"
                style={{ fontSize: '11px', transition: 'color 0.15s ease' }}
              >
                {item.label}
              </a>
            ))}
          </div>

          {/* Mobile Copyright Line */}
          <div className="text-center text-muted small" style={{ fontSize: '10.5px', color: '#64748b' }}>
            © 2026 HYPER JAPAN • Giáo trình N5 chuẩn Tokyo
          </div>
        </div>
      </div>

      {/* ── 2. DESKTOP & TABLET LUXURY FOOTER (Full 4-Pillar Layout) ── */}
      <div
        className="d-none d-lg-block pt-5 pb-4"
        style={{
          paddingBottom: '32px'
        }}
      >
        <div className="container">
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
                {/* Hotline Contact Card */}
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

                {/* Official Facebook Card */}
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
                <span className="footer-pulse-dot" />
                <span>{onlineCount} người đang online</span>
              </span>
              <span>•</span>
              <span style={{ color: '#94a3b8' }}>Phiên bản 2.5 Pro</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
