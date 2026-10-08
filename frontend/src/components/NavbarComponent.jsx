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
    { id: 'home', label: 'Trang chủ', icon: Home },
    { id: 'lessons', label: 'Bài học', icon: BookOpen },
    { id: 'kanji', label: 'Kanji', icon: PenTool },
    { id: 'flashcard', label: 'Flashcard', icon: Layers },
    { id: 'quiz', label: 'Trắc nghiệm', icon: CheckSquare },
    { id: 'practice', label: 'Luyện gõ', icon: Keyboard },
  ];

  const moreNavItems = [
    { id: 'review', label: 'Ôn tập sai', icon: RefreshCw },
    { id: 'favorites', label: 'Yêu thích', icon: Star },
    { id: 'notes', label: 'Ghi chú', icon: FileText },
    { id: 'dashboard', label: 'Tiến độ', icon: BarChart2 },
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
    setActiveTab(id);
    setMobileMenuOpen(false);
  };

  return (
    <>
      <Navbar dark expand="lg" className="navbar-custom sticky-top py-1.5 py-md-2 px-2 px-md-3">
        <Container fluid className="d-flex justify-content-between align-items-center px-0 flex-nowrap">

          {/* ── Left: Logo + Level ── */}
          <div className="d-flex align-items-center gap-1.5 gap-sm-2 flex-shrink-0">
            <NavbarBrand href="#" onClick={e => { e.preventDefault(); setActiveTab('home'); }}
              className="p-0 m-0 text-decoration-none" style={{ cursor: 'pointer' }}>
              <Logo size={34} />
            </NavbarBrand>
            <LevelSelector currentLevel={currentLevel} onChangeLevel={onChangeLevel} />
          </div>

          {/* ── Center: Desktop Nav ── */}
          <Nav className="d-none d-lg-flex align-items-center" navbar style={{ gap: 1 }}>
            {mainNavItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <NavItem key={item.id}>
                  <NavLink href="#" onClick={e => { e.preventDefault(); setActiveTab(item.id); }}
                    className="d-flex align-items-center px-2 py-1 rounded-3"
                    style={{
                      gap: 5, fontSize: '0.84rem', fontWeight: isActive ? 700 : 500,
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

          {/* ── Right: Search + Account + Mobile Menu Toggle ── */}
          <div className="d-flex align-items-center gap-1.5 gap-sm-2 flex-shrink-0">
            {/* Desktop / Tablet Search Pill */}
            <button type="button" onClick={onOpenSearch}
              className="d-none d-sm-flex align-items-center"
              style={{ background: 'rgba(255,255,255,.1)', border: '1px solid rgba(255,255,255,.18)', borderRadius: 9999, padding: '6px 12px', color: '#fff', fontSize: 12.5, fontWeight: 500, cursor: 'pointer', gap: 6, transition: 'all .18s ease', backdropFilter: 'blur(4px)' }}
              onMouseOver={e => { e.currentTarget.style.background = 'rgba(255,255,255,.17)'; }}
              onMouseOut={e => { e.currentTarget.style.background = 'rgba(255,255,255,.1)'; }}>
              <Search size={14} />
              <span>Tìm từ vựng...</span>
            </button>

            {/* Mobile-only Circular Search Button */}
            <button type="button" onClick={onOpenSearch}
              className="d-flex d-sm-none align-items-center justify-content-center"
              style={{ width: 34, height: 34, background: 'rgba(255,255,255,.1)', border: '1px solid rgba(255,255,255,.18)', borderRadius: '50%', color: '#fff', cursor: 'pointer', transition: 'all .18s ease', backdropFilter: 'blur(4px)', padding: 0 }}
              title="Tìm kiếm từ vựng">
              <Search size={15} />
            </button>

            {/* Account dropdown / Login button */}
            {user ? (
              <UncontrolledDropdown inNavbar>
                <DropdownToggle nav caret={false}
                  className="d-flex align-items-center p-0 text-white" style={{ gap: 8 }}>
                  {user.avatar_url ? (
                    <img src={user.avatar_url} alt="" style={{ width: 32, height: 32, borderRadius: '50%', border: '2px solid rgba(255,255,255,.3)', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg,#f59e0b,#d97706)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 13, color: '#fff' }}>
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
                  <DropdownItem divider />
                  <DropdownItem onClick={logout} className="d-flex align-items-center gap-2 py-2 text-danger">
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

                {/* Mobile-only Login Button */}
                <button type="button" onClick={() => openAuth('login')}
                  className="d-inline-flex d-sm-none align-items-center justify-content-center"
                  style={{ width: 34, height: 34, background: 'linear-gradient(135deg,#f59e0b,#d97706)', border: 'none', borderRadius: '50%', color: '#fff', cursor: 'pointer', boxShadow: '0 2px 8px rgba(245,158,11,.35)', padding: 0 }}
                  title="Đăng nhập">
                  <LogIn size={15} />
                </button>
              </>
            )}

            {/* Mobile Menu Drawer Toggle Button */}
            <button
              type="button"
              className="d-lg-none d-flex align-items-center justify-content-center"
              onClick={() => setMobileMenuOpen(true)}
              style={{
                width: 34,
                height: 34,
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.18)',
                borderRadius: 10,
                color: '#fff',
                cursor: 'pointer',
                backdropFilter: 'blur(4px)',
                padding: 0
              }}
              title="Menu mở rộng"
            >
              <Menu size={18} />
            </button>
          </div>
        </Container>
      </Navbar>

      {/* ── Mobile Bottom Nav (Sticky) ── */}
      <div className="d-lg-none fixed-bottom mobile-bottom-nav d-flex justify-content-around py-1 px-1" style={{ zIndex: 1020, paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 3px)' }}>
        {bottomItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button key={item.id} type="button" onClick={() => setActiveTab(item.id)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '6px 4px', flex: 1, minWidth: 0 }}>
              <div style={{ width: 36, height: 36, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', background: isActive ? '#eff6ff' : 'transparent', marginBottom: 2, transition: 'all .2s ease' }}>
                <Icon size={20} color={isActive ? '#2563eb' : '#94a3b8'} />
              </div>
              <span style={{ fontSize: 10, fontWeight: isActive ? 700 : 500, color: isActive ? '#2563eb' : '#94a3b8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '100%' }}>
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
        style={{ maxWidth: '400px' }}
      >
        <ModalBody className="p-0 rounded-4 overflow-hidden bg-white">
          <div className="p-3 text-white d-flex justify-content-between align-items-center" style={{ background: 'linear-gradient(135deg, #091224 0%, #1e3a8a 100%)' }}>
            <div className="d-flex align-items-center gap-2">
              <Logo size={28} showText={false} />
              <div>
                <h6 className="fw-bold mb-0">Menu Tính Năng Toàn Diện</h6>
                <small className="text-white text-opacity-75" style={{ fontSize: '11px' }}>HYPER JAPAN JLPT N5</small>
              </div>
            </div>
            <button type="button" className="btn-close btn-close-white" onClick={() => setMobileMenuOpen(false)} />
          </div>

          <div className="p-3 d-flex flex-column gap-2" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
            <small className="text-muted fw-bold text-uppercase" style={{ fontSize: '11px', letterSpacing: '0.04em' }}>
              Phương pháp học tập
            </small>

            {mainNavItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <div
                  key={item.id}
                  onClick={() => handleMobileNav(item.id)}
                  className={`p-2.5 rounded-3 border d-flex align-items-center justify-content-between cursor-pointer transition-all ${
                    isActive ? 'bg-primary bg-opacity-10 border-primary text-primary fw-bold' : 'bg-light text-dark'
                  }`}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="d-flex align-items-center gap-2">
                    <Icon size={18} className={isActive ? 'text-primary' : 'text-secondary'} />
                    <span className="small">{item.label}</span>
                  </div>
                  <ChevronRight size={14} className="text-muted" />
                </div>
              );
            })}

            <small className="text-muted fw-bold text-uppercase mt-2" style={{ fontSize: '11px', letterSpacing: '0.04em' }}>
              Sổ tay & Củng cố
            </small>

            {moreNavItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <div
                  key={item.id}
                  onClick={() => handleMobileNav(item.id)}
                  className={`p-2.5 rounded-3 border d-flex align-items-center justify-content-between cursor-pointer transition-all ${
                    isActive ? 'bg-primary bg-opacity-10 border-primary text-primary fw-bold' : 'bg-light text-dark'
                  }`}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="d-flex align-items-center gap-2">
                    <Icon size={18} className={isActive ? 'text-primary' : 'text-secondary'} />
                    <span className="small">{item.label}</span>
                  </div>
                  <ChevronRight size={14} className="text-muted" />
                </div>
              );
            })}
          </div>
        </ModalBody>
      </Modal>

      {/* ── Auth Modal ── */}
      <AuthModal isOpen={authModalOpen} toggle={() => setAuthModalOpen(!authModalOpen)} initialMode={authMode} />
    </>
  );
};

export default NavbarComponent;
