import React, { useState } from 'react';
import {
  Navbar, NavbarBrand, Nav, NavItem, NavLink, Button,
  UncontrolledDropdown, DropdownToggle, DropdownMenu, DropdownItem, Container,
  Modal, ModalBody
} from 'reactstrap';
import {
  Home, BookOpen, Layers, CheckSquare, Keyboard, Star, FileText,
  BarChart2, RefreshCw, Search, User, LogOut, LogIn, PenTool,
  Menu, X, MoreHorizontal, ChevronRight, Sparkles, ShieldCheck
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { sounds } from '../services/sounds';
import Logo from './Logo';
import LevelSelector from './LevelSelector';
import AuthModal from './AuthModal';

const NavbarComponent = ({ activeTab, setActiveTab, onOpenSearch, currentLevel, onChangeLevel }) => {
  const { user, logout } = useApp();
  const [authMode, setAuthMode] = useState('login');
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const openAuth = (mode = 'login') => {
    setAuthMode(mode);
    setAuthModalOpen(true);
  };

  const mainNavItems = [
    { id: 'home', label: 'Trang chủ', icon: Home, color: '#2563eb', bg: '#eff6ff', desc: 'Lộ trình & Tổng quan học tập' },
    { id: 'lessons', label: 'Bài học', icon: BookOpen, color: '#4f46e5', bg: '#eef2ff', desc: '25 Bài từ vựng Minna no Nihongo I' },
    { id: 'kanji', label: 'Kanji', icon: PenTool, color: '#7c3aed', bg: '#f5f3ff', desc: 'Học bộ thủ, nét viết & Hán tự N5' },
    { id: 'flashcard', label: 'Flashcard', icon: Layers, color: '#f59e0b', bg: '#fffbeb', desc: 'Lật thẻ 3D tự chuyển từ thông minh' },
    { id: 'quiz', label: 'Trắc nghiệm', icon: CheckSquare, color: '#ef4444', bg: '#fef2f2', desc: 'Kiểm tra 4 lựa chọn ABCD bấm giờ' },
    { id: 'practice', label: 'Luyện gõ', icon: Keyboard, color: '#10b981', bg: '#ecfdf5', desc: 'Tự gõ bàn phím phản xạ tiếng Nhật' },
  ];

  const moreNavItems = [
    { id: 'review', label: 'Ôn tập sai', icon: RefreshCw, color: '#dc2626', bg: '#fef2f2', desc: 'Khắc phục các câu đã làm sai' },
    { id: 'favorites', label: 'Yêu thích', icon: Star, color: '#d97706', bg: '#fffbeb', desc: 'Kho từ vựng đã đánh dấu sao' },
    { id: 'notes', label: 'Ghi chú', icon: FileText, color: '#0ea5e9', bg: '#f0f9ff', desc: 'Sổ tay lưu mẹo nhớ của bạn' },
    { id: 'dashboard', label: 'Tiến độ', icon: BarChart2, color: '#0d9488', bg: '#f0fdfa', desc: 'Báo cáo thống kê % thuộc bài' },
  ];

  // Mobile Bottom Bar: 5 primary actions
  const bottomItems = [
    { id: 'home', label: 'Trang chủ', icon: Home },
    { id: 'lessons', label: 'Bài học', icon: BookOpen },
    { id: 'flashcard', label: 'Flashcard', icon: Layers },
    { id: 'quiz', label: 'Trắc nghiệm', icon: CheckSquare },
    { id: 'practice', label: 'Luyện gõ', icon: Keyboard },
  ];

  const handleMobileNav = (id) => {
    sounds.playFlip();
    setActiveTab(id);
    setMobileMenuOpen(false);
  };

  return (
    <>
      <Navbar dark expand="lg" className="navbar-custom sticky-top py-2 px-2.5 px-md-3">
        <Container fluid className="d-flex justify-content-between align-items-center px-0 flex-nowrap">

          {/* ── Left: Logo + Level ── */}
          <div className="d-flex align-items-center gap-2 gap-sm-2.5 flex-shrink-0">
            <NavbarBrand href="#" onClick={e => { e.preventDefault(); setActiveTab('home'); }}
              className="p-0 m-0 text-decoration-none d-flex align-items-center" style={{ cursor: 'pointer' }}>
              <Logo size={32} />
            </NavbarBrand>
            <LevelSelector currentLevel={currentLevel} onChangeLevel={onChangeLevel} />
          </div>

          {/* ── Center: Desktop Nav ── */}
          <Nav className="d-none d-lg-flex align-items-center" navbar style={{ gap: 2 }}>
            {mainNavItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <NavItem key={item.id}>
                  <NavLink href="#" onClick={e => { e.preventDefault(); setActiveTab(item.id); }}
                    className="d-flex align-items-center px-2.5 py-1 rounded-3"
                    style={{
                      gap: 6, fontSize: '0.84rem', fontWeight: isActive ? 700 : 500,
                      cursor: 'pointer', letterSpacing: '-0.01em',
                      color: isActive ? '#fff' : 'rgba(255,255,255,.72)',
                      background: isActive ? 'rgba(255,255,255,.14)' : 'transparent',
                      transition: 'all .18s ease',
                      borderRadius: 8
                    }}>
                    <Icon size={14} />
                    <span>{item.label}</span>
                  </NavLink>
                </NavItem>
              );
            })}

            {/* More dropdown on Desktop */}
            <NavItem>
              <UncontrolledDropdown nav>
                <DropdownToggle nav
                  style={{
                    color: moreNavItems.some(i => i.id === activeTab) ? '#fff' : 'rgba(255,255,255,.72)',
                    display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.84rem', fontWeight: 500,
                    cursor: 'pointer', background: moreNavItems.some(i => i.id === activeTab) ? 'rgba(255,255,255,.14)' : 'transparent',
                    borderRadius: 8, padding: '4px 10px'
                  }}>
                  <MoreHorizontal size={15} /> Thêm
                </DropdownToggle>
                <DropdownMenu end className="shadow-lg border-0 rounded-3 mt-2 py-1" style={{ minWidth: 180 }}>
                  {moreNavItems.map(item => {
                    const Icon = item.icon;
                    return (
                      <DropdownItem key={item.id}
                        onClick={() => setActiveTab(item.id)}
                        className="d-flex align-items-center gap-2 py-2"
                        style={{ fontWeight: activeTab === item.id ? 700 : 500, color: activeTab === item.id ? '#2563eb' : '#1e293b', fontSize: 14 }}>
                        <Icon size={15} style={{ color: activeTab === item.id ? '#2563eb' : '#64748b' }} />
                        {item.label}
                      </DropdownItem>
                    );
                  })}
                </DropdownMenu>
              </UncontrolledDropdown>
            </NavItem>
          </Nav>

          {/* ── Right: Search + Account + Mobile Menu Toggle (Refined Spacing) ── */}
          <div className="d-flex align-items-center gap-2 flex-shrink-0">
            {/* Desktop / Tablet Search Pill */}
            <button type="button" onClick={onOpenSearch}
              className="d-none d-sm-flex align-items-center"
              style={{ background: 'rgba(255,255,255,.08)', border: '1px solid rgba(255,255,255,.16)', borderRadius: 9999, padding: '6px 14px', color: '#fff', fontSize: 12.5, fontWeight: 500, cursor: 'pointer', gap: 6, transition: 'all .18s ease', backdropFilter: 'blur(8px)' }}
              onMouseOver={e => { e.currentTarget.style.background = 'rgba(255,255,255,.15)'; }}
              onMouseOut={e => { e.currentTarget.style.background = 'rgba(255,255,255,.08)'; }}>
              <Search size={14} />
              <span>Tìm từ vựng...</span>
            </button>

            {/* Mobile-only Refined Squircle Search Button */}
            <button type="button" onClick={onOpenSearch}
              className="d-flex d-sm-none align-items-center justify-content-center"
              style={{ width: 36, height: 36, background: 'rgba(255,255,255,.08)', border: '1px solid rgba(255,255,255,.16)', borderRadius: 12, color: '#fff', cursor: 'pointer', transition: 'all .18s ease', backdropFilter: 'blur(8px)', padding: 0 }}
              title="Tìm kiếm từ vựng">
              <Search size={16} />
            </button>

            {/* Account dropdown / Login button */}
            {user ? (
              <UncontrolledDropdown inNavbar>
                <DropdownToggle nav caret={false}
                  className="d-flex align-items-center p-0 text-white" style={{ gap: 8 }}>
                  {user.avatar_url ? (
                    <img src={user.avatar_url} alt="" style={{ width: 36, height: 36, borderRadius: 12, border: '1.5px solid rgba(255,255,255,.3)', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: 36, height: 36, borderRadius: 12, background: 'linear-gradient(135deg,#f59e0b,#d97706)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 14, color: '#fff', border: '1.5px solid rgba(255,255,255,.25)' }}>
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="d-none d-md-inline small fw-semibold" style={{ maxWidth: 80, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {user.username}
                  </span>
                </DropdownToggle>
                <DropdownMenu end className="shadow-lg border-0 rounded-3 mt-2 py-1" style={{ minWidth: 200 }}>
                  <div style={{ padding: '10px 16px', borderBottom: '1px solid #f1f5f9' }}>
                    <div style={{ fontWeight: 700, fontSize: 14, color: '#0f172a' }}>{user.username}</div>
                    <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{user.email}</div>
                  </div>
                  <DropdownItem onClick={() => setActiveTab('dashboard')} className="d-flex align-items-center gap-2 py-2">
                    <BarChart2 size={15} style={{ color: '#2563eb' }} /> Tiến độ học tập
                  </DropdownItem>
                  <DropdownItem onClick={() => setActiveTab('favorites')} className="d-flex align-items-center gap-2 py-2">
                    <Star size={15} style={{ color: '#f59e0b' }} /> Từ yêu thích
                  </DropdownItem>
                  <DropdownItem onClick={() => setActiveTab('notes')} className="d-flex align-items-center gap-2 py-2">
                    <FileText size={15} style={{ color: '#0ea5e9' }} /> Sổ ghi chú
                  </DropdownItem>
                  {user?.role === 'admin' && typeof window !== 'undefined' && window.innerWidth >= 992 && (
                    <>
                      <DropdownItem divider />
                      <DropdownItem onClick={() => setActiveTab('admin')} className="d-flex align-items-center gap-2 py-2 text-danger fw-semibold">
                        <ShieldCheck size={15} className="text-danger" /> Quản trị Admin
                      </DropdownItem>
                    </>
                  )}
                  <DropdownItem divider />
                  <DropdownItem onClick={logout} className="d-flex align-items-center gap-2 py-2 text-secondary">
                    <LogOut size={15} /> Đăng xuất
                  </DropdownItem>
                </DropdownMenu>
              </UncontrolledDropdown>
            ) : (
              <>
                {/* Desktop / Tablet Login Button */}
                <button type="button" onClick={() => openAuth('login')}
                  className="d-none d-sm-inline-flex align-items-center gap-1.5"
                  style={{ background: 'linear-gradient(135deg,#f59e0b,#d97706)', border: 'none', borderRadius: 9999, padding: '6px 14px', color: '#fff', fontSize: 12.5, fontWeight: 700, cursor: 'pointer', boxShadow: '0 2px 8px rgba(245,158,11,.35)', transition: 'all .18s ease' }}>
                  <LogIn size={13} /> <span>Đăng nhập</span>
                </button>

                {/* Mobile-only Squircle Login Button */}
                <button type="button" onClick={() => openAuth('login')}
                  className="d-inline-flex d-sm-none align-items-center justify-content-center"
                  style={{ width: 36, height: 36, background: 'linear-gradient(135deg,#f59e0b,#d97706)', border: 'none', borderRadius: 12, color: '#fff', cursor: 'pointer', boxShadow: '0 2px 8px rgba(245,158,11,.35)', padding: 0 }}
                  title="Đăng nhập">
                  <LogIn size={16} />
                </button>
              </>
            )}

            {/* Mobile Menu Drawer Toggle Button */}
            <button
              type="button"
              className="d-lg-none d-flex align-items-center justify-content-center"
              onClick={() => setMobileMenuOpen(true)}
              style={{
                width: 36,
                height: 36,
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.16)',
                borderRadius: 12,
                color: '#fff',
                cursor: 'pointer',
                backdropFilter: 'blur(8px)',
                padding: 0
              }}
              title="Menu mở rộng"
            >
              <Menu size={18} />
            </button>
          </div>
        </Container>
      </Navbar>

      {/* ── Mobile Bottom Nav (Sticky Luxury iOS/Duolingo Feel) ── */}
      <div className="d-lg-none fixed-bottom mobile-bottom-nav d-flex justify-content-around py-1.5 px-2" style={{ zIndex: 1020, paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 4px)' }}>
        {bottomItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                if (!isActive) sounds.playFlip();
                setActiveTab(item.id);
              }}
              className={`mobile-nav-btn ${isActive ? 'is-active' : ''}`}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '4px 2px',
                flex: 1,
                minWidth: 0,
                outline: 'none'
              }}
            >
              <div
                className="mobile-nav-icon-box"
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 14,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: isActive ? 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)' : 'transparent',
                  marginBottom: 3,
                  transition: 'all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
                  boxShadow: isActive ? '0 4px 14px rgba(37, 99, 235, 0.38)' : 'none',
                  transform: isActive ? 'translateY(-2px) scale(1.06)' : 'scale(1)'
                }}
              >
                <Icon size={20} color={isActive ? '#ffffff' : '#64748b'} strokeWidth={isActive ? 2.4 : 1.8} />
              </div>
              <span
                style={{
                  fontSize: '10.5px',
                  fontWeight: isActive ? 800 : 500,
                  color: isActive ? '#2563eb' : '#64748b',
                  letterSpacing: '-0.01em',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  maxWidth: '100%',
                  transition: 'color 0.2s ease'
                }}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Mobile Full Menu Sheet Modal ── */}
      <Modal
        isOpen={mobileMenuOpen}
        toggle={() => setMobileMenuOpen(false)}
        centered
        className="jlpt-modal d-lg-none"
        style={{ maxWidth: '420px', margin: 'auto 12px' }}
      >
        <ModalBody className="p-0 rounded-4 overflow-hidden bg-white shadow-xl border-0">
          {/* Header */}
          <div className="p-3 text-white d-flex justify-content-between align-items-center" style={{ background: 'linear-gradient(135deg, #091224 0%, #172554 50%, #1e3a8a 100%)' }}>
            <div className="d-flex align-items-center gap-2">
              <Logo size={32} showText={false} />
              <div>
                <div className="d-flex align-items-center gap-1.5">
                  <h6 className="fw-bold mb-0 text-white">HYPER JAPAN</h6>
                  <span className="badge bg-success bg-opacity-25 text-success border border-success border-opacity-25 rounded-pill px-2" style={{ fontSize: '10px' }}>
                    {currentLevel || 'N5'}
                  </span>
                </div>
                <small className="text-white text-opacity-75" style={{ fontSize: '11px' }}>Hệ thống học tiếng Nhật toàn diện</small>
              </div>
            </div>
            <button
              type="button"
              className="btn-close btn-close-white"
              onClick={() => setMobileMenuOpen(false)}
              aria-label="Đóng"
            />
          </div>

          <div className="p-3 d-flex flex-column gap-3" style={{ maxHeight: '72vh', overflowY: 'auto' }}>
            {/* User Profile / Login Card */}
            {user ? (
              <div className="p-2.5 rounded-3 border d-flex flex-column gap-2" style={{ background: 'var(--slate-50)', borderColor: 'var(--slate-200)' }}>
                <div className="d-flex align-items-center justify-content-between">
                  <div className="d-flex align-items-center gap-2.5 min-w-0">
                    {user.avatar_url ? (
                      <img src={user.avatar_url} alt="" style={{ width: 38, height: 38, borderRadius: 12, objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: 38, height: 38, borderRadius: 12, background: 'linear-gradient(135deg,#f59e0b,#d97706)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 14, color: '#fff', flexShrink: 0 }}>
                        {user.username.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="fw-bold text-dark text-truncate" style={{ fontSize: '13.5px' }}>{user.username}</div>
                      <div className="text-muted text-truncate" style={{ fontSize: '11px' }}>{user.email}</div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => { logout(); setMobileMenuOpen(false); }}
                    className="btn btn-sm btn-outline-danger rounded-pill px-2.5 py-1 d-flex align-items-center gap-1 flex-shrink-0"
                    style={{ fontSize: '11px' }}
                  >
                    <LogOut size={12} />
                    <span>Thoát</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-3 rounded-3 border d-flex align-items-center justify-content-between" style={{ background: 'linear-gradient(135deg, #eff6ff 0%, #f8fafc 100%)', borderColor: 'var(--primary-border)' }}>
                <div>
                  <div className="fw-bold text-navy-dark" style={{ fontSize: '13px' }}>Đồng bộ tiến độ học tập</div>
                  <div className="text-muted" style={{ fontSize: '11px' }}>Lưu từ vựng, điểm thi & streak trên cloud</div>
                </div>
                <button
                  type="button"
                  onClick={() => { openAuth('login'); setMobileMenuOpen(false); }}
                  className="btn btn-sm btn-primary rounded-pill px-3 py-1.5 fw-bold shadow-xs flex-shrink-0"
                  style={{ fontSize: '12px' }}
                >
                  Đăng nhập
                </button>
              </div>
            )}

            {/* Group 1: Study Modes */}
            <div>
              <div className="text-muted fw-bold text-uppercase mb-2 px-1" style={{ fontSize: '10.5px', letterSpacing: '0.06em' }}>
                Phương pháp học tập & Luyện tập
              </div>

              <div className="d-flex flex-column gap-1.5">
                {mainNavItems.map(item => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <div
                      key={item.id}
                      onClick={() => handleMobileNav(item.id)}
                      className={`p-2 rounded-3 border d-flex align-items-center justify-content-between transition-all ${
                        isActive
                          ? 'border-primary bg-primary bg-opacity-10 text-primary'
                          : 'bg-white text-dark hover-shadow'
                      }`}
                      style={{ cursor: 'pointer', transition: 'all 0.18s ease' }}
                    >
                      <div className="d-flex align-items-center gap-2.5 min-w-0">
                        <div
                          className="d-flex align-items-center justify-content-center rounded-2 flex-shrink-0"
                          style={{
                            width: 32,
                            height: 32,
                            background: isActive ? item.color : item.bg,
                            color: isActive ? '#fff' : item.color
                          }}
                        >
                          <Icon size={16} />
                        </div>
                        <div className="min-w-0">
                          <div className={`fw-bold text-truncate ${isActive ? 'text-primary' : 'text-navy-dark'}`} style={{ fontSize: '13px' }}>
                            {item.label}
                          </div>
                          <div className="text-muted text-truncate" style={{ fontSize: '10.5px' }}>
                            {item.desc}
                          </div>
                        </div>
                      </div>
                      <ChevronRight size={14} className={isActive ? 'text-primary' : 'text-muted'} />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Group 2: Tools & Retention */}
            <div>
              <div className="text-muted fw-bold text-uppercase mb-2 px-1" style={{ fontSize: '10.5px', letterSpacing: '0.06em' }}>
                Sổ tay cá nhân & Củng cố
              </div>

              <div className="d-flex flex-column gap-1.5">
                {moreNavItems.map(item => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <div
                      key={item.id}
                      onClick={() => handleMobileNav(item.id)}
                      className={`p-2 rounded-3 border d-flex align-items-center justify-content-between transition-all ${
                        isActive
                          ? 'border-primary bg-primary bg-opacity-10 text-primary'
                          : 'bg-white text-dark hover-shadow'
                      }`}
                      style={{ cursor: 'pointer', transition: 'all 0.18s ease' }}
                    >
                      <div className="d-flex align-items-center gap-2.5 min-w-0">
                        <div
                          className="d-flex align-items-center justify-content-center rounded-2 flex-shrink-0"
                          style={{
                            width: 32,
                            height: 32,
                            background: isActive ? item.color : item.bg,
                            color: isActive ? '#fff' : item.color
                          }}
                        >
                          <Icon size={16} />
                        </div>
                        <div className="min-w-0">
                          <div className={`fw-bold text-truncate ${isActive ? 'text-primary' : 'text-navy-dark'}`} style={{ fontSize: '13px' }}>
                            {item.label}
                          </div>
                          <div className="text-muted text-truncate" style={{ fontSize: '10.5px' }}>
                            {item.desc}
                          </div>
                        </div>
                      </div>
                      <ChevronRight size={14} className={isActive ? 'text-primary' : 'text-muted'} />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </ModalBody>
      </Modal>

      {/* ── Auth Modal ── */}
      <AuthModal isOpen={authModalOpen} toggle={() => setAuthModalOpen(!authModalOpen)} initialMode={authMode} />
    </>
  );
};

export default NavbarComponent;
