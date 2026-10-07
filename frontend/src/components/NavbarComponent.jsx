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
  ModalFooter,
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
  UserPlus,
  Volume2
} from 'lucide-react';
import { useApp } from '../context/AppContext';

const NavbarComponent = ({ activeTab, setActiveTab, onOpenSearch }) => {
  const { user, login, register, logout } = useApp();

  const [modalOpen, setModalOpen] = useState(false);
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [formData, setFormData] = useState({ username: '', email: '', password: '', usernameOrEmail: '' });
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const toggleModal = () => {
    setModalOpen(!modalOpen);
    setErrorMsg('');
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      if (isRegisterMode) {
        await register({
          username: formData.username,
          email: formData.email,
          password: formData.password
        });
      } else {
        await login({
          usernameOrEmail: formData.usernameOrEmail,
          password: formData.password
        });
      }
      setModalOpen(false);
      setFormData({ username: '', email: '', password: '', usernameOrEmail: '' });
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const navItems = [
    { id: 'home', label: 'Trang chủ', icon: Home },
    { id: 'lessons', label: 'Bài học', icon: BookOpen },
    { id: 'flashcard', label: 'Flashcard', icon: Layers },
    { id: 'quiz', label: 'Trắc nghiệm', icon: CheckSquare },
    { id: 'practice', label: 'Luyện gõ', icon: Keyboard },
    { id: 'review', label: 'Ôn tập sai', icon: RefreshCw },
    { id: 'favorites', label: 'Yêu thích', icon: Star },
    { id: 'notes', label: 'Ghi chú', icon: FileText },
    { id: 'dashboard', label: 'Tiến độ', icon: BarChart2 },
  ];

  return (
    <>
      <Navbar dark expand="md" className="navbar-custom sticky-top py-2 px-3">
        <Container fluid className="d-flex justify-content-between align-items-center">
          <NavbarBrand
            href="#"
            onClick={(e) => { e.preventDefault(); setActiveTab('home'); }}
            className="d-flex align-items-center fw-bold fs-5 text-white"
            style={{ cursor: 'pointer', gap: '8px' }}
          >
            <div
              className="d-flex align-items-center justify-content-center bg-white text-primary rounded-circle"
              style={{ width: '36px', height: '36px', fontWeight: '800' }}
            >
              N5
            </div>
            <span>JLPT Minna Vocab</span>
          </NavbarBrand>

          {/* Desktop Nav Items */}
          <Nav className="d-none d-lg-flex align-items-center" navbar style={{ gap: '4px' }}>
            {navItems.map((item) => {
              const IconComp = item.icon;
              const isActive = activeTab === item.id;
              return (
                <NavItem key={item.id}>
                  <NavLink
                    href="#"
                    onClick={(e) => { e.preventDefault(); setActiveTab(item.id); }}
                    className={`d-flex align-items-center px-2 py-1 rounded transition-all ${
                      isActive ? 'bg-primary text-white fw-semibold' : 'text-light opacity-75'
                    }`}
                    style={{ cursor: 'pointer', gap: '6px', fontSize: '0.9rem' }}
                  >
                    <IconComp size={16} />
                    <span>{item.label}</span>
                  </NavLink>
                </NavItem>
              );
            })}
          </Nav>

          {/* Actions: Search & Account */}
          <div className="d-flex align-items-center" style={{ gap: '10px' }}>
            <Button
              color="light"
              outline
              size="sm"
              className="d-flex align-items-center rounded-pill px-3 text-white border-light"
              onClick={onOpenSearch}
              style={{ gap: '6px' }}
            >
              <Search size={15} />
              <span className="d-none d-sm-inline">Tìm kiếm từ vựng...</span>
            </Button>

            {user ? (
              <UncontrolledDropdown inNavbar>
                <DropdownToggle nav caret className="text-white d-flex align-items-center">
                  <div
                    className="bg-warning text-dark rounded-circle d-flex align-items-center justify-content-center me-1"
                    style={{ width: '30px', height: '30px', fontWeight: 'bold', fontSize: '13px' }}
                  >
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                  <span className="d-none d-md-inline ms-1">{user.username}</span>
                </DropdownToggle>
                <DropdownMenu end className="shadow-sm">
                  <DropdownItem header>Tài khoản cá nhân</DropdownItem>
                  <DropdownItem onClick={() => setActiveTab('dashboard')}>
                    <BarChart2 size={16} className="me-2 text-primary" /> Tiến độ N5
                  </DropdownItem>
                  <DropdownItem onClick={() => setActiveTab('favorites')}>
                    <Star size={16} className="me-2 text-warning" /> Từ yêu thích
                  </DropdownItem>
                  <DropdownItem onClick={() => setActiveTab('notes')}>
                    <FileText size={16} className="me-2 text-info" /> Ghi chú
                  </DropdownItem>
                  <DropdownItem divider />
                  <DropdownItem onClick={logout} className="text-danger">
                    <LogOut size={16} className="me-2" /> Đăng xuất
                  </DropdownItem>
                </DropdownMenu>
              </UncontrolledDropdown>
            ) : (
              <Button
                color="warning"
                size="sm"
                className="d-flex align-items-center rounded-pill px-3 fw-semibold shadow-sm"
                onClick={toggleModal}
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
        className="d-lg-none fixed-bottom bg-white border-top shadow-lg d-flex justify-content-around py-2 px-1"
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

      {/* Auth Modal (Login / Register) */}
      <Modal isOpen={modalOpen} toggle={toggleModal} centered>
        <ModalHeader toggle={toggleModal} className="border-0 pb-0">
          <span className="fw-bold fs-5">
            {isRegisterMode ? 'Đăng ký tài khoản mới' : 'Đăng nhập hệ thống'}
          </span>
        </ModalHeader>
        <ModalBody className="py-3">
          <p className="text-muted small mb-3">
            Học tập hoàn toàn <strong>miễn phí và không bắt buộc đăng nhập</strong>! Bạn chỉ cần đăng nhập khi muốn lưu tiến độ đồng bộ đa thiết bị lên đám mây.
          </p>

          {errorMsg && <Alert color="danger" className="py-2 small">{errorMsg}</Alert>}

          <Form onSubmit={handleAuthSubmit}>
            {isRegisterMode ? (
              <>
                <FormGroup>
                  <Label for="reg-username" className="small fw-semibold">Tên người dùng</Label>
                  <Input
                    id="reg-username"
                    type="text"
                    required
                    placeholder="VD: nguyen_van_a"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  />
                </FormGroup>
                <FormGroup>
                  <Label for="reg-email" className="small fw-semibold">Địa chỉ Email</Label>
                  <Input
                    id="reg-email"
                    type="email"
                    required
                    placeholder="VD: email@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </FormGroup>
                <FormGroup>
                  <Label for="reg-pass" className="small fw-semibold">Mật khẩu</Label>
                  <Input
                    id="reg-pass"
                    type="password"
                    required
                    placeholder="Tối thiểu 6 ký tự"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                </FormGroup>
              </>
            ) : (
              <>
                <FormGroup>
                  <Label for="login-id" className="small fw-semibold">Tên đăng nhập hoặc Email</Label>
                  <Input
                    id="login-id"
                    type="text"
                    required
                    placeholder="Nhập tên đăng nhập hoặc email"
                    value={formData.usernameOrEmail}
                    onChange={(e) => setFormData({ ...formData, usernameOrEmail: e.target.value })}
                  />
                </FormGroup>
                <FormGroup>
                  <Label for="login-pass" className="small fw-semibold">Mật khẩu</Label>
                  <Input
                    id="login-pass"
                    type="password"
                    required
                    placeholder="Nhập mật khẩu"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                </FormGroup>
              </>
            )}

            <Button color="primary" block className="mt-4 fw-semibold" disabled={loading}>
              {loading ? 'Đang xử lý...' : (isRegisterMode ? 'Đăng ký tài khoản' : 'Đăng nhập ngay')}
            </Button>
          </Form>

          <div className="text-center mt-3 small">
            {isRegisterMode ? (
              <span>
                Đã có tài khoản?{' '}
                <a
                  href="#"
                  className="text-primary fw-semibold"
                  onClick={(e) => { e.preventDefault(); setIsRegisterMode(false); setErrorMsg(''); }}
                >
                  Đăng nhập tại đây
                </a>
              </span>
            ) : (
              <span>
                Chưa có tài khoản?{' '}
                <a
                  href="#"
                  className="text-primary fw-semibold"
                  onClick={(e) => { e.preventDefault(); setIsRegisterMode(true); setErrorMsg(''); }}
                >
                  Tạo tài khoản mới
                </a>
              </span>
            )}
          </div>
        </ModalBody>
      </Modal>
    </>
  );
};

export default NavbarComponent;
