import React, { useState } from 'react';
import {
  Navbar,
  NavbarBrand,
  Nav,
  NavItem,
  NavLink,
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  Form,
  FormGroup,
  Label,
  Input,
  Alert,
  UncontrolledDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  Badge,
  Container
} from 'reactstrap';
import {
  Home,
  BookOpen,
  Layers,
  CheckSquare,
  Keyboard,
  Star,
  FileText,
  BarChart2,
  RefreshCw,
  Search,
  User,
  LogOut,
  LogIn,
  PenTool,
  ChevronDown
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { authService } from '../services/api';
import Logo from './Logo';

const NavbarComponent = ({ activeTab, setActiveTab, onOpenSearch, currentLevel, onChangeLevel }) => {
  const { user, login, register, logout } = useApp();

  const [modalMode, setModalMode] = useState('login');
  const [modalOpen, setModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    usernameOrEmail: '',
    code: '',
    newPassword: ''
  });

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const toggleModal = () => {
    setModalOpen(!modalOpen);
    setErrorMsg('');
    setSuccessMsg('');
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    try {
      if (modalMode === 'register') {
        if (formData.password !== formData.confirmPassword) {
          setErrorMsg('Xác nhận mật khẩu không khớp!');
          setLoading(false);
          return;
        }
        await register({
          username: formData.username,
          email: formData.email,
          password: formData.password
        });
        setModalOpen(false);
      } else if (modalMode === 'login') {
        await login({
          usernameOrEmail: formData.usernameOrEmail,
          password: formData.password
        });
        setModalOpen(false);
      } else if (modalMode === 'forgot') {
        const res = await authService.forgotPassword({ email: formData.email });
        setSuccessMsg(`Mã xác thực 6 số của bạn là: ${res.data.recovery_code}`);
        setFormData(prev => ({ ...prev, code: res.data.recovery_code }));
        setModalMode('reset');
      } else if (modalMode === 'reset') {
        const res = await authService.resetPassword({
          email: formData.email,
          code: formData.code,
          newPassword: formData.newPassword
        });
        setSuccessMsg(res.data.message);
        setModalMode('login');
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const navItems = [
    { id: 'home', label: 'Trang chủ', icon: Home },
    { id: 'lessons', label: 'Bài học', icon: BookOpen },
    { id: 'kanji', label: 'Kanji', icon: PenTool },
    { id: 'flashcard', label: 'Flashcard', icon: Layers },
    { id: 'quiz', label: 'Trắc nghiệm', icon: CheckSquare },
    { id: 'practice', label: 'Luyện gõ', icon: Keyboard },
    { id: 'review', label: 'Ôn tập sai', icon: RefreshCw },
    { id: 'favorites', label: 'Yêu thích', icon: Star },
    { id: 'notes', label: 'Ghi chú', icon: FileText },
    { id: 'dashboard', label: 'Tiến độ', icon: BarChart2 },
  ];

  const levels = ['N5', 'N4', 'N3', 'N2', 'N1'];

  return (
    <>
      <Navbar dark expand="md" className="navbar-custom sticky-top py-2 px-2 px-md-3">
        <Container fluid className="d-flex justify-content-between align-items-center">
          {/* Brand Logo & Level Selector */}
          <div className="d-flex align-items-center gap-2">
            <NavbarBrand
              href="#"
              onClick={(e) => { e.preventDefault(); setActiveTab('home'); }}
              className="p-0 m-0 text-decoration-none"
              style={{ cursor: 'pointer' }}
            >
              <Logo size={36} />
            </NavbarBrand>

            {/* JLPT Level Selector Dropdown */}
            <UncontrolledDropdown>
              <DropdownToggle
                caret
                color="light"
                size="sm"
                className="rounded-pill fw-bold bg-white bg-opacity-20 text-white border-white border-opacity-30 d-flex align-items-center gap-1 px-3 py-1 shadow-sm"
                style={{ fontSize: '13px' }}
              >
                <span>{currentLevel || 'N5'}</span>
              </DropdownToggle>
              <DropdownMenu className="shadow-lg border-0 rounded-3">
                <DropdownItem header className="fw-bold">Chọn cấp độ JLPT</DropdownItem>
                {levels.map(lvl => (
                  <DropdownItem
                    key={lvl}
                    active={currentLevel === lvl}
                    onClick={() => onChangeLevel && onChangeLevel(lvl)}
                    className="d-flex justify-content-between align-items-center"
                  >
                    <span>Cấp độ {lvl}</span>
                    {lvl === 'N5' ? (
                      <Badge color="success" pill className="ms-2">Hiện tại</Badge>
                    ) : (
                      <Badge color="secondary" pill className="ms-2">Mở rộng</Badge>
                    )}
                  </DropdownItem>
                ))}
              </DropdownMenu>
            </UncontrolledDropdown>
          </div>

          {/* Desktop Nav Items */}
          <Nav className="d-none d-lg-flex align-items-center" navbar style={{ gap: '2px' }}>
            {navItems.map((item) => {
              const IconComp = item.icon;
              const isActive = activeTab === item.id;
              return (
                <NavItem key={item.id}>
                  <NavLink
                    href="#"
                    onClick={(e) => { e.preventDefault(); setActiveTab(item.id); }}
                    className={`d-flex align-items-center px-2 py-1 rounded-3 transition-all ${
                      isActive ? 'bg-primary text-white fw-bold shadow-sm' : 'text-light opacity-80'
                    }`}
                    style={{ cursor: 'pointer', gap: '5px', fontSize: '0.86rem' }}
                  >
                    <IconComp size={15} />
                    <span>{item.label}</span>
                  </NavLink>
                </NavItem>
              );
            })}
          </Nav>

          {/* Actions: Search & Account */}
          <div className="d-flex align-items-center" style={{ gap: '8px' }}>
            <Button
              color="light"
              outline
              size="sm"
              className="d-flex align-items-center rounded-pill px-3 py-1 text-white border-white border-opacity-40 hover-shadow"
              onClick={onOpenSearch}
              style={{ gap: '6px' }}
            >
              <Search size={15} />
              <span className="d-none d-sm-inline small">Tìm kiếm từ vựng...</span>
            </Button>

            {user ? (
              <UncontrolledDropdown inNavbar>
                <DropdownToggle nav caret className="text-white d-flex align-items-center p-1">
                  <div
                    className="bg-warning text-dark rounded-circle d-flex align-items-center justify-content-center shadow-sm"
                    style={{ width: '32px', height: '32px', fontWeight: '800', fontSize: '13px' }}
                  >
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                  <span className="d-none d-md-inline ms-2 small fw-semibold">{user.username}</span>
                </DropdownToggle>
                <DropdownMenu end className="shadow-lg border-0 rounded-3 mt-2">
                  <DropdownItem header className="fw-bold text-navy-dark">
                    Tài khoản: {user.username}
                  </DropdownItem>
                  <DropdownItem onClick={() => setActiveTab('dashboard')} className="d-flex align-items-center gap-2">
                    <BarChart2 size={16} className="text-primary" /> Tiến độ học tập
                  </DropdownItem>
                  <DropdownItem onClick={() => setActiveTab('favorites')} className="d-flex align-items-center gap-2">
                    <Star size={16} className="text-warning" /> Từ yêu thích
                  </DropdownItem>
                  <DropdownItem onClick={() => setActiveTab('notes')} className="d-flex align-items-center gap-2">
                    <FileText size={16} className="text-info" /> Sổ ghi chú
                  </DropdownItem>
                  <DropdownItem divider />
                  <DropdownItem onClick={logout} className="text-danger d-flex align-items-center gap-2">
                    <LogOut size={16} /> Đăng xuất
                  </DropdownItem>
                </DropdownMenu>
              </UncontrolledDropdown>
            ) : (
              <Button
                color="warning"
                size="sm"
                className="d-flex align-items-center rounded-pill px-3 py-1 fw-bold shadow-sm text-dark"
                onClick={() => { setModalMode('login'); setModalOpen(true); }}
                style={{ gap: '6px' }}
              >
                <LogIn size={15} />
                <span>Đăng nhập</span>
              </Button>
            )}
          </div>
        </Container>
      </Navbar>

      {/* Bottom Navigation for Mobile / Tablet */}
      <div
        className="d-lg-none fixed-bottom bg-white border-top shadow-lg d-flex justify-content-around py-2 px-1 glass-effect"
        style={{ zIndex: 1020 }}
      >
        {navItems.slice(0, 5).map((item) => {
          const IconComp = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`btn btn-link p-1 d-flex flex-column align-items-center text-decoration-none ${
                isActive ? 'text-primary fw-bold' : 'text-secondary'
              }`}
              style={{ fontSize: '11px', width: '20%' }}
            >
              <IconComp size={20} className="mb-1" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Auth Modal (Login / Register / Forgot / Reset Password) */}
      <Modal isOpen={modalOpen} toggle={toggleModal} centered className="auth-modal">
        <ModalHeader toggle={toggleModal} className="border-0 pb-0">
          <div className="d-flex align-items-center gap-2">
            <Logo size={28} showText={false} />
            <span className="fw-bold text-navy-dark fs-5">
              {modalMode === 'login' && 'Đăng nhập HYPER JLPT'}
              {modalMode === 'register' && 'Tạo tài khoản mới'}
              {modalMode === 'forgot' && 'Quên mật khẩu'}
              {modalMode === 'reset' && 'Đặt lại mật khẩu'}
            </span>
          </div>
        </ModalHeader>
        <ModalBody className="p-4 pt-3">
          <div className="alert alert-light border small text-muted mb-3 py-2">
            💡 <strong>Không bắt buộc đăng nhập</strong> để học 25 bài. Đăng nhập để đồng bộ kết quả và ghi chú lên PostgreSQL.
          </div>

          {errorMsg && <Alert color="danger" className="py-2 small">{errorMsg}</Alert>}
          {successMsg && <Alert color="success" className="py-2 small">{successMsg}</Alert>}

          <Form onSubmit={handleAuthSubmit}>
            {modalMode === 'login' && (
              <>
                <FormGroup>
                  <Label className="small fw-semibold text-secondary">Tên đăng nhập hoặc Email</Label>
                  <Input
                    type="text"
                    required
                    placeholder="Nhập username hoặc email"
                    value={formData.usernameOrEmail}
                    onChange={(e) => setFormData({ ...formData, usernameOrEmail: e.target.value })}
                    className="py-2"
                  />
                </FormGroup>
                <FormGroup>
                  <div className="d-flex justify-content-between">
                    <Label className="small fw-semibold text-secondary">Mật khẩu</Label>
                    <a
                      href="#"
                      className="small text-primary text-decoration-none"
                      onClick={(e) => { e.preventDefault(); setModalMode('forgot'); setErrorMsg(''); setSuccessMsg(''); }}
                    >
                      Quên mật khẩu?
                    </a>
                  </div>
                  <Input
                    type="password"
                    required
                    placeholder="Nhập mật khẩu"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="py-2"
                  />
                </FormGroup>
                <Button color="primary" block className="mt-4 py-2 fw-bold" disabled={loading}>
                  {loading ? 'Đang xử lý...' : 'Đăng nhập ngay'}
                </Button>
                <div className="text-center mt-3 small text-muted">
                  Chưa có tài khoản?{' '}
                  <a
                    href="#"
                    className="text-primary fw-bold text-decoration-none"
                    onClick={(e) => { e.preventDefault(); setModalMode('register'); setErrorMsg(''); setSuccessMsg(''); }}
                  >
                    Đăng ký tài khoản
                  </a>
                </div>
              </>
            )}

            {modalMode === 'register' && (
              <>
                <FormGroup>
                  <Label className="small fw-semibold text-secondary">Tên người dùng (Username)</Label>
                  <Input
                    type="text"
                    required
                    placeholder="VD: minh_n5"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  />
                </FormGroup>
                <FormGroup>
                  <Label className="small fw-semibold text-secondary">Email</Label>
                  <Input
                    type="email"
                    required
                    placeholder="VD: email@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </FormGroup>
                <FormGroup>
                  <Label className="small fw-semibold text-secondary">Mật khẩu (Tối thiểu 6 ký tự)</Label>
                  <Input
                    type="password"
                    required
                    placeholder="Nhập mật khẩu"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                </FormGroup>
                <FormGroup>
                  <Label className="small fw-semibold text-secondary">Xác nhận mật khẩu</Label>
                  <Input
                    type="password"
                    required
                    placeholder="Nhập lại mật khẩu"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  />
                </FormGroup>
                <Button color="primary" block className="mt-3 py-2 fw-bold" disabled={loading}>
                  {loading ? 'Đang tạo tài khoản...' : 'Đăng ký tài khoản'}
                </Button>
                <div className="text-center mt-3 small text-muted">
                  Đã có tài khoản?{' '}
                  <a
                    href="#"
                    className="text-primary fw-bold text-decoration-none"
                    onClick={(e) => { e.preventDefault(); setModalMode('login'); setErrorMsg(''); setSuccessMsg(''); }}
                  >
                    Đăng nhập tại đây
                  </a>
                </div>
              </>
            )}

            {modalMode === 'forgot' && (
              <>
                <p className="small text-muted mb-3">
                  Nhập địa chỉ email đăng ký để nhận mã OTP xác thực khôi phục mật khẩu.
                </p>
                <FormGroup>
                  <Label className="small fw-semibold text-secondary">Email của bạn</Label>
                  <Input
                    type="email"
                    required
                    placeholder="email@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </FormGroup>
                <Button color="warning" block className="mt-3 py-2 fw-bold text-dark" disabled={loading}>
                  {loading ? 'Đang gửi mã...' : 'Lấy mã xác thực OTP'}
                </Button>
                <div className="text-center mt-3 small text-muted">
                  <a
                    href="#"
                    className="text-secondary text-decoration-none"
                    onClick={(e) => { e.preventDefault(); setModalMode('login'); setErrorMsg(''); setSuccessMsg(''); }}
                  >
                    ← Quay lại đăng nhập
                  </a>
                </div>
              </>
            )}

            {modalMode === 'reset' && (
              <>
                <FormGroup>
                  <Label className="small fw-semibold text-secondary">Mã xác thực OTP (6 chữ số)</Label>
                  <Input
                    type="text"
                    required
                    placeholder="123456"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="text-center fw-bold letter-spacing-2 fs-5"
                  />
                </FormGroup>
                <FormGroup>
                  <Label className="small fw-semibold text-secondary">Mật khẩu mới (Tối thiểu 6 ký tự)</Label>
                  <Input
                    type="password"
                    required
                    placeholder="Nhập mật khẩu mới"
                    value={formData.newPassword}
                    onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                  />
                </FormGroup>
                <Button color="success" block className="mt-3 py-2 fw-bold" disabled={loading}>
                  {loading ? 'Đang cập nhật...' : 'Xác nhận đổi mật khẩu'}
                </Button>
                <div className="text-center mt-3 small text-muted">
                  <a
                    href="#"
                    className="text-secondary text-decoration-none"
                    onClick={(e) => { e.preventDefault(); setModalMode('login'); setErrorMsg(''); setSuccessMsg(''); }}
                  >
                    ← Quay lại đăng nhập
                  </a>
                </div>
              </>
            )}
          </Form>
        </ModalBody>
      </Modal>
    </>
  );
};

export default NavbarComponent;
