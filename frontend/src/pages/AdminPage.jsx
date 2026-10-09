import React, { useState, useEffect } from 'react';
import {
  Container,
  Row,
  Col,
  Card,
  CardBody,
  Button,
  Badge,
  Input,
  FormGroup,
  Label,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Spinner,
  Alert,
  Table
} from 'reactstrap';
import {
  ShieldAlert,
  ShieldCheck,
  Lock,
  Mail,
  User,
  LogOut,
  ExternalLink,
  BookOpen,
  Layers,
  Database,
  Users,
  Sparkles,
  Plus,
  Edit2,
  Trash2,
  RefreshCw,
  Search,
  Volume2,
  CheckCircle2,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Flame,
  ArrowRight
} from 'lucide-react';
import { adminService, speakJapanese } from '../services/api';
import Logo from '../components/Logo';
import { sounds } from '../services/sounds';

const DEFAULT_ADMIN_EMAIL = 'thuathyper05@gmail.com';
const DEFAULT_ADMIN_PASS = 'Thuatnguyen1204@@@';

const AdminPage = ({ onBackToApp }) => {
  // Authentication State
  const [adminToken, setAdminToken] = useState(() => localStorage.getItem('hyper_admin_token') || '');
  const [adminUser, setAdminUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('hyper_admin_user') || 'null');
    } catch {
      return null;
    }
  });

  // Login Form State
  const [loginEmail, setLoginEmail] = useState(DEFAULT_ADMIN_EMAIL);
  const [loginPassword, setLoginPassword] = useState(DEFAULT_ADMIN_PASS);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Active Tab: 'overview' | 'vocab' | 'lessons' | 'kanji' | 'users' | 'maintenance'
  const [activeTab, setActiveTab] = useState('overview');

  // Stats State
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);

  // Vocabulary Management State
  const [vocabLesson, setVocabLesson] = useState('1');
  const [vocabSearch, setVocabSearch] = useState('');
  const [vocabList, setVocabList] = useState([]);
  const [vocabPage, setVocabPage] = useState(1);
  const [vocabTotalPages, setVocabTotalPages] = useState(1);
  const [vocabTotal, setVocabTotal] = useState(0);
  const [vocabLoading, setVocabLoading] = useState(false);

  // Vocab Modal (Add / Edit)
  const [vocabModalOpen, setVocabModalOpen] = useState(false);
  const [vocabForm, setVocabForm] = useState({
    id: null,
    lesson_number: 1,
    order_num: '',
    kanji: '',
    kana: '',
    clean_kana: '',
    romaji: '',
    vietnamese: '',
    clean_vietnamese: '',
    usage_note: '',
    example_jp: '',
    example_vi: ''
  });
  const [vocabSaving, setVocabSaving] = useState(false);

  // Lessons Management State
  const [lessonsList, setLessonsList] = useState([]);
  const [lessonModalOpen, setLessonModalOpen] = useState(false);
  const [lessonForm, setLessonForm] = useState({ id: null, lesson_number: 1, title: '', description: '' });
  const [lessonSaving, setLessonSaving] = useState(false);

  // Kanji Management State
  const [kanjiList, setKanjiList] = useState([]);
  const [kanjiSearch, setKanjiSearch] = useState('');
  const [kanjiPage, setKanjiPage] = useState(1);
  const [kanjiTotalPages, setKanjiTotalPages] = useState(1);
  const [kanjiTotal, setKanjiTotal] = useState(0);
  const [kanjiLoading, setKanjiLoading] = useState(false);
  const [kanjiModalOpen, setKanjiModalOpen] = useState(false);
  const [kanjiForm, setKanjiForm] = useState({
    id: null,
    kanji: '',
    onyomi: '',
    kunyomi: '',
    han_viet: '',
    meaning: '',
    stroke_count: 1,
    level: 'N5'
  });
  const [kanjiSaving, setKanjiSaving] = useState(false);

  // Users Management State
  const [usersList, setUsersList] = useState([]);
  const [usersSearch, setUsersSearch] = useState('');
  const [usersPage, setUsersPage] = useState(1);
  const [usersTotalPages, setUsersTotalPages] = useState(1);
  const [usersLoading, setUsersLoading] = useState(false);

  // Notification Toast State
  const [alertMsg, setAlertMsg] = useState({ type: '', text: '' });
  const [cleanLoading, setCleanLoading] = useState(false);

  const showAlert = (type, text) => {
    setAlertMsg({ type, text });
    setTimeout(() => setAlertMsg({ type: '', text: '' }), 6000);
  };

  // Check login on mount
  useEffect(() => {
    if (adminToken) {
      loadStats();
    }
  }, [adminToken]);

  // Load content when tab changes
  useEffect(() => {
    if (!adminToken) return;
    if (activeTab === 'overview' || activeTab === 'maintenance') {
      loadStats();
    } else if (activeTab === 'vocab') {
      loadVocabularies();
    } else if (activeTab === 'lessons') {
      loadLessons();
    } else if (activeTab === 'kanji') {
      loadKanji();
    } else if (activeTab === 'users') {
      loadUsers();
    }
  }, [activeTab, adminToken]);

  // ── Authentication Handlers ──
  const handleAdminLogin = async (e) => {
    e?.preventDefault();
    setLoginError('');
    setLoginLoading(true);
    try {
      const res = await adminService.login({
        email: loginEmail.trim(),
        password: loginPassword
      });

      const { token, admin } = res.data;
      localStorage.setItem('hyper_admin_token', token);
      localStorage.setItem('hyper_admin_user', JSON.stringify(admin));
      setAdminToken(token);
      setAdminUser(admin);
      sounds.playComplete();
      showAlert('success', `Chào mừng Quản trị viên: ${admin.email}!`);
    } catch (err) {
      console.error('Admin login error:', err);
      sounds.playWrong();
      setLoginError(err.response?.data?.message || 'Đăng nhập Quản trị viên thất bại. Vui lòng kiểm tra lại thông tin.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleAdminLogout = () => {
    localStorage.removeItem('hyper_admin_token');
    localStorage.removeItem('hyper_admin_user');
    setAdminToken('');
    setAdminUser(null);
    sounds.playFlip();
  };

  // ── Data Fetchers ──
  const loadStats = async () => {
    setStatsLoading(true);
    try {
      const res = await adminService.getStats();
      setStats(res.data);
    } catch (err) {
      console.error('loadStats error:', err);
      if (err.response?.status === 401 || err.response?.status === 403) {
        handleAdminLogout();
      }
    } finally {
      setStatsLoading(false);
    }
  };

  const loadVocabularies = async (page = vocabPage) => {
    setVocabLoading(true);
    try {
      const res = await adminService.getVocabularies({
        lesson: vocabLesson,
        search: vocabSearch,
        page,
        limit: 40
      });
      setVocabList(res.data.vocabularies);
      setVocabPage(res.data.page);
      setVocabTotalPages(res.data.totalPages);
      setVocabTotal(res.data.total);
    } catch (err) {
      console.error('loadVocabularies error:', err);
    } finally {
      setVocabLoading(false);
    }
  };

  const loadLessons = async () => {
    try {
      const res = await adminService.getLessons();
      setLessonsList(res.data.lessons);
    } catch (err) {
      console.error('loadLessons error:', err);
    }
  };

  const loadKanji = async (page = kanjiPage) => {
    setKanjiLoading(true);
    try {
      const res = await adminService.getKanji({
        search: kanjiSearch,
        page,
        limit: 30
      });
      setKanjiList(res.data.kanjiList);
      setKanjiPage(res.data.page);
      setKanjiTotalPages(res.data.totalPages);
      setKanjiTotal(res.data.total);
    } catch (err) {
      console.error('loadKanji error:', err);
    } finally {
      setKanjiLoading(false);
    }
  };

  const loadUsers = async (page = usersPage) => {
    setUsersLoading(true);
    try {
      const res = await adminService.getUsers({
        search: usersSearch,
        page,
        limit: 25
      });
      setUsersList(res.data.users);
      setUsersPage(res.data.page);
      setUsersTotalPages(res.data.totalPages);
    } catch (err) {
      console.error('loadUsers error:', err);
    } finally {
      setUsersLoading(false);
    }
  };

  // ── Deduplication Action ──
  const handleCleanDuplicates = async () => {
    if (!window.confirm('Bạn có chắc chắn muốn chạy thuật toán làm sạch và xóa các từ vựng/kanji trùng lặp trong cơ sở dữ liệu?')) {
      return;
    }
    setCleanLoading(true);
    try {
      const res = await adminService.cleanDuplicates();
      sounds.playComplete();
      showAlert('success', `Dọn dẹp thành công! Đã loại bỏ ${res.data.result.vocabRemoved} từ vựng trùng lặp và ${res.data.result.kanjiRemoved} kanji trùng lặp!`);
      loadStats();
      if (activeTab === 'vocab') loadVocabularies(1);
      if (activeTab === 'kanji') loadKanji(1);
    } catch (err) {
      console.error('Clean duplicates error:', err);
      sounds.playWrong();
      showAlert('danger', 'Lỗi xử lý trùng lặp: ' + (err.response?.data?.message || err.message));
    } finally {
      setCleanLoading(false);
    }
  };

  // ── Vocabulary CRUD ──
  const handleOpenAddVocab = () => {
    setVocabForm({
      id: null,
      lesson_number: parseInt(vocabLesson) || 1,
      order_num: '',
      kanji: '',
      kana: '',
      clean_kana: '',
      romaji: '',
      vietnamese: '',
      clean_vietnamese: '',
      usage_note: '',
      example_jp: '',
      example_vi: ''
    });
    setVocabModalOpen(true);
  };

  const handleOpenEditVocab = (v) => {
    setVocabForm({
      id: v.id,
      lesson_number: v.lesson_number,
      order_num: v.order_num,
      kanji: v.kanji || '',
      kana: v.kana || '',
      clean_kana: v.clean_kana || '',
      romaji: v.romaji || '',
      vietnamese: v.vietnamese || '',
      clean_vietnamese: v.clean_vietnamese || '',
      usage_note: v.usage_note || '',
      example_jp: v.example_jp || '',
      example_vi: v.example_vi || ''
    });
    setVocabModalOpen(true);
  };

  const handleSaveVocab = async (e) => {
    e.preventDefault();
    setVocabSaving(true);
    try {
      if (vocabForm.id) {
        await adminService.updateVocabulary(vocabForm.id, vocabForm);
        showAlert('success', 'Đã cập nhật từ vựng thành công!');
      } else {
        await adminService.createVocabulary(vocabForm);
        showAlert('success', 'Đã thêm từ vựng mới thành công!');
      }
      sounds.playCorrect();
      setVocabModalOpen(false);
      loadVocabularies();
      loadStats();
    } catch (err) {
      sounds.playWrong();
      showAlert('danger', 'Lỗi lưu từ vựng: ' + (err.response?.data?.message || err.message));
    } finally {
      setVocabSaving(false);
    }
  };

  const handleDeleteVocab = async (id, kana) => {
    if (!window.confirm(`Xác nhận xóa từ vựng "${kana}"?`)) return;
    try {
      await adminService.deleteVocabulary(id);
      sounds.playFlip();
      showAlert('success', `Đã xóa từ vựng "${kana}" thành công!`);
      loadVocabularies();
      loadStats();
    } catch (err) {
      showAlert('danger', 'Lỗi xóa từ vựng: ' + (err.response?.data?.message || err.message));
    }
  };

  // ── Lesson Update ──
  const handleOpenEditLesson = (l) => {
    setLessonForm({
      id: l.id,
      lesson_number: l.lesson_number,
      title: l.title,
      description: l.description || ''
    });
    setLessonModalOpen(true);
  };

  const handleSaveLesson = async (e) => {
    e.preventDefault();
    setLessonSaving(true);
    try {
      await adminService.updateLesson(lessonForm.id, {
        title: lessonForm.title,
        description: lessonForm.description
      });
      sounds.playCorrect();
      showAlert('success', `Đã cập nhật Bài ${lessonForm.lesson_number} thành công!`);
      setLessonModalOpen(false);
      loadLessons();
    } catch (err) {
      sounds.playWrong();
      showAlert('danger', 'Lỗi cập nhật bài học: ' + (err.response?.data?.message || err.message));
    } finally {
      setLessonSaving(false);
    }
  };

  // ── Kanji CRUD ──
  const handleOpenAddKanji = () => {
    setKanjiForm({
      id: null,
      kanji: '',
      onyomi: '',
      kunyomi: '',
      han_viet: '',
      meaning: '',
      stroke_count: 1,
      level: 'N5'
    });
    setKanjiModalOpen(true);
  };

  const handleOpenEditKanji = (k) => {
    setKanjiForm({
      id: k.id,
      kanji: k.kanji,
      onyomi: k.onyomi || '',
      kunyomi: k.kunyomi || '',
      han_viet: k.han_viet || '',
      meaning: k.meaning || '',
      stroke_count: k.stroke_count || 1,
      level: k.level || 'N5'
    });
    setKanjiModalOpen(true);
  };

  const handleSaveKanji = async (e) => {
    e.preventDefault();
    setKanjiSaving(true);
    try {
      if (kanjiForm.id) {
        await adminService.updateKanji(kanjiForm.id, kanjiForm);
        showAlert('success', `Đã cập nhật Kanji "${kanjiForm.kanji}" thành công!`);
      } else {
        await adminService.createKanji(kanjiForm);
        showAlert('success', `Đã thêm Kanji "${kanjiForm.kanji}" mới thành công!`);
      }
      sounds.playCorrect();
      setKanjiModalOpen(false);
      loadKanji();
      loadStats();
    } catch (err) {
      sounds.playWrong();
      showAlert('danger', 'Lỗi lưu Kanji: ' + (err.response?.data?.message || err.message));
    } finally {
      setKanjiSaving(false);
    }
  };

  const handleDeleteKanji = async (id, kanji) => {
    if (!window.confirm(`Xác nhận xóa chữ Kanji "${kanji}"?`)) return;
    try {
      await adminService.deleteKanji(id);
      sounds.playFlip();
      showAlert('success', `Đã xóa chữ Kanji "${kanji}" thành công!`);
      loadKanji();
      loadStats();
    } catch (err) {
      showAlert('danger', 'Lỗi xóa Kanji: ' + (err.response?.data?.message || err.message));
    }
  };

  // ── User Management ──
  const handleToggleRole = async (user) => {
    const nextRole = user.role === 'admin' ? 'user' : 'admin';
    if (!window.confirm(`Bạn có chắc muốn đổi quyền của tài khoản ${user.email} thành "${nextRole.toUpperCase()}"?`)) return;
    try {
      await adminService.updateUserRole(user.id, { role: nextRole });
      sounds.playCorrect();
      showAlert('success', `Đã đổi quyền ${user.email} thành ${nextRole}!`);
      loadUsers();
    } catch (err) {
      showAlert('danger', err.response?.data?.message || 'Lỗi cập nhật quyền');
    }
  };

  const handleDeleteUser = async (user) => {
    if (!window.confirm(`Xác nhận xóa vĩnh viễn người dùng ${user.username} (${user.email})?`)) return;
    try {
      await adminService.deleteUser(user.id);
      sounds.playFlip();
      showAlert('success', `Đã xóa người dùng ${user.email}!`);
      loadUsers();
      loadStats();
    } catch (err) {
      showAlert('danger', err.response?.data?.message || 'Lỗi xóa người dùng');
    }
  };

  // ─────────────────────────────────────────────────────────────
  // 1. LOGIN SCREEN (If not authenticated as admin)
  // ─────────────────────────────────────────────────────────────
  if (!adminToken) {
    return (
      <div
        className="min-vh-100 d-flex align-items-center justify-content-center p-3"
        style={{
          background: 'radial-gradient(ellipse at top, #0f172a 0%, #020617 100%)',
          color: '#f8fafc'
        }}
      >
        <Card
          className="border-0 shadow-2xl rounded-4 overflow-hidden"
          style={{
            maxWidth: '440px',
            width: '100%',
            background: '#0f172a',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}
        >
          {/* Top Admin Header */}
          <div
            className="p-4 text-center border-bottom"
            style={{
              background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
              borderColor: 'rgba(255, 255, 255, 0.08)'
            }}
          >
            <div
              className="d-inline-flex align-items-center justify-content-center rounded-circle p-3 mb-3 shadow-lg"
              style={{
                background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                color: '#fff'
              }}
            >
              <ShieldAlert size={36} />
            </div>

            <h4 className="fw-black mb-1 text-white tracking-tight">
              HYPER <span style={{ color: '#ef4444' }}>ADMIN</span> CONSOLE
            </h4>
            <p className="text-secondary small mb-0" style={{ fontSize: '12.5px' }}>
              Cổng điều hành & quản lý độc lập nền tảng JLPT N5
            </p>
          </div>

          <CardBody className="p-4">
            {loginError && (
              <Alert color="danger" className="py-2.5 px-3 small rounded-3 mb-3 border-0">
                {loginError}
              </Alert>
            )}

            <form onSubmit={handleAdminLogin}>
              <FormGroup className="mb-3">
                <Label className="small fw-bold text-slate-300 mb-1">
                  Email Quản trị viên
                </Label>
                <div className="position-relative">
                  <Input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="thuathyper05@gmail.com"
                    className="bg-slate-900 border-slate-700 text-white py-2.5 ps-5 rounded-3"
                    style={{
                      background: '#1e293b',
                      borderColor: '#334155',
                      color: '#f8fafc',
                      fontSize: '13.5px'
                    }}
                  />
                  <Mail size={16} className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" />
                </div>
              </FormGroup>

              <FormGroup className="mb-3">
                <Label className="small fw-bold text-slate-300 mb-1">
                  Mật khẩu Quản trị viên
                </Label>
                <div className="position-relative">
                  <Input
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="bg-slate-900 border-slate-700 text-white py-2.5 ps-5 rounded-3"
                    style={{
                      background: '#1e293b',
                      borderColor: '#334155',
                      color: '#f8fafc',
                      fontSize: '13.5px'
                    }}
                  />
                  <Lock size={16} className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" />
                </div>
              </FormGroup>

              {/* Quick Fill Button */}
              <div className="mb-3 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setLoginEmail(DEFAULT_ADMIN_EMAIL);
                    setLoginPassword(DEFAULT_ADMIN_PASS);
                    sounds.playFlip();
                  }}
                  className="btn btn-sm btn-link text-info text-decoration-none p-0 small fw-semibold"
                  style={{ fontSize: '11.5px' }}
                >
                  ⚡ Điền nhanh tài khoản Admin mặc định
                </button>
              </div>

              <Button
                type="submit"
                color="danger"
                block
                disabled={loginLoading}
                className="py-2.5 fw-bold rounded-3 shadow-md d-flex align-items-center justify-content-center gap-2"
                style={{
                  background: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)',
                  border: 'none',
                  fontSize: '14px'
                }}
              >
                {loginLoading ? <Spinner size="sm" /> : <ShieldCheck size={16} />}
                <span>{loginLoading ? 'Đang xác thực...' : 'Đăng nhập vào Hệ thống Quản trị'}</span>
              </Button>
            </form>

            <div className="text-center mt-4 pt-2 border-top border-secondary border-opacity-25">
              <Button
                color="link"
                size="sm"
                onClick={onBackToApp}
                className="text-secondary text-decoration-none small d-inline-flex align-items-center gap-1"
                style={{ fontSize: '12px' }}
              >
                <ChevronLeft size={14} /> Quay lại trang học tập chính
              </Button>
            </div>
          </CardBody>
        </Card>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // 2. MAIN ADMIN PORTAL DASHBOARD (Authenticated)
  // ─────────────────────────────────────────────────────────────
  return (
    <div className="min-vh-100 bg-slate-900" style={{ background: '#0b1120', color: '#f1f5f9' }}>
      {/* ── Top Superadmin Navbar ── */}
      <header
        className="sticky-top border-bottom py-2.5 px-3 px-md-4 shadow-sm"
        style={{
          background: 'rgba(15, 23, 42, 0.95)',
          backdropFilter: 'blur(12px)',
          borderColor: 'rgba(255, 255, 255, 0.08)',
          zIndex: 1040
        }}
      >
        <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
          {/* Logo & Portal Badge */}
          <div className="d-flex align-items-center gap-2.5">
            <div className="d-flex align-items-center gap-2">
              <Logo size={32} showText={false} />
              <div className="lh-1">
                <span className="fw-black text-white" style={{ fontSize: '15px' }}>
                  HYPER <span style={{ color: '#ef4444' }}>ADMIN</span>
                </span>
                <span className="badge bg-danger bg-opacity-20 text-danger ms-2 px-1.5 py-0.5 rounded" style={{ fontSize: '10px' }}>
                  MASTER PORTAL
                </span>
              </div>
            </div>
          </div>

          {/* Admin Identity & Actions */}
          <div className="d-flex align-items-center gap-2">
            <span className="d-none d-sm-inline small text-slate-400">
              Quản trị viên: <strong className="text-white">{adminUser?.email || DEFAULT_ADMIN_EMAIL}</strong>
            </span>

            <Button
              color="outline-light"
              size="sm"
              onClick={onBackToApp}
              className="rounded-pill px-2.5 py-1 text-white border-secondary small d-flex align-items-center gap-1"
              style={{ fontSize: '11.5px', background: 'rgba(255, 255, 255, 0.06)' }}
              title="Về cổng học tập dành cho học viên"
            >
              <ExternalLink size={12} />
              <span className="d-none d-md-inline">Trang học tập</span>
            </Button>

            <Button
              color="danger"
              size="sm"
              onClick={handleAdminLogout}
              className="rounded-pill px-2.5 py-1 fw-bold small d-flex align-items-center gap-1"
              style={{ fontSize: '11.5px' }}
              title="Đăng xuất khỏi trang Admin"
            >
              <LogOut size={12} />
              <span className="d-none d-sm-inline">Đăng xuất</span>
            </Button>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="d-flex align-items-center gap-1 overflow-x-auto pt-2.5 pb-1 mt-1 scrollbar-none">
          {[
            { id: 'overview', label: 'Tổng quan & KPI', icon: Database },
            { id: 'vocab', label: 'Quản lý Từ vựng', icon: BookOpen },
            { id: 'lessons', label: 'Quản lý Bài học', icon: Layers },
            { id: 'kanji', label: 'Quản lý Kanji N5', icon: Sparkles },
            { id: 'users', label: 'Quản lý Học viên', icon: Users },
            { id: 'maintenance', label: 'Bảo trì & Data', icon: RefreshCw }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  sounds.playFlip();
                  setActiveTab(tab.id);
                }}
                className={`btn btn-sm rounded-pill px-3 py-1.5 fw-semibold d-flex align-items-center gap-1.5 transition-all text-nowrap border-0 ${
                  isActive
                    ? 'bg-danger text-white shadow-sm'
                    : 'text-slate-400 hover-text-white bg-transparent'
                }`}
                style={{ fontSize: '12.5px' }}
              >
                <Icon size={14} />
                <span>{tab.label}</span>
                {tab.id === 'maintenance' && stats?.hasDuplicates && (
                  <span className="badge bg-warning text-dark p-1 rounded-circle" style={{ width: 6, height: 6 }} />
                )}
              </button>
            );
          })}
        </div>
      </header>

      {/* ── Main Container Content ── */}
      <Container fluid="lg" className="py-3 py-md-4">
        {/* Floating Notification Alert */}
        {alertMsg.text && (
          <Alert
            color={alertMsg.type || 'info'}
            className="py-2.5 px-3 rounded-3 shadow-md border-0 mb-3 small d-flex align-items-center gap-2"
          >
            <CheckCircle2 size={16} />
            <div className="flex-grow-1">{alertMsg.text}</div>
            <button type="button" className="btn-close btn-close-white" onClick={() => setAlertMsg({ type: '', text: '' })} />
          </Alert>
        )}

        {/* ── 2A. TAB: OVERVIEW & KPIS ── */}
        {activeTab === 'overview' && (
          <div>
            {/* Duplication Warning Banner if exists */}
            {stats?.hasDuplicates && (
              <Card
                className="border-0 shadow-lg mb-4 rounded-4 overflow-hidden"
                style={{ background: 'linear-gradient(135deg, #7f1d1d 0%, #991b1b 100%)' }}
              >
                <CardBody className="p-3.5 text-white d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
                  <div className="d-flex align-items-center gap-3">
                    <div className="rounded-circle p-2.5 bg-white bg-opacity-20 flex-shrink-0">
                      <AlertTriangle size={24} className="text-warning" />
                    </div>
                    <div>
                      <h6 className="fw-bold mb-1">
                        Phát hiện dữ liệu trùng lặp trong cơ sở dữ liệu ({stats.stats.vocabDuplicates} từ vựng, {stats.stats.kanjiDuplicates} kanji)
                      </h6>
                      <p className="small mb-0 text-white text-opacity-80">
                        Hệ thống đã nhận diện dữ liệu bị nhân bản. Bấm nút bên cạnh để tự động lọc gộp và áp dụng ràng buộc duy nhất (Unique Index).
                      </p>
                    </div>
                  </div>
                  <Button
                    color="warning"
                    size="sm"
                    disabled={cleanLoading}
                    onClick={handleCleanDuplicates}
                    className="fw-bold px-3 py-2 rounded-pill text-dark text-nowrap shadow-sm d-flex align-items-center justify-content-center gap-1.5"
                  >
                    {cleanLoading ? <Spinner size="sm" /> : <Sparkles size={15} />}
                    <span>Khắc phục & Xóa trùng ngay</span>
                  </Button>
                </CardBody>
              </Card>
            )}

            {/* KPI Metric Cards */}
            <Row className="g-3 mb-4">
              <Col xs={6} md={3}>
                <Card className="border-0 rounded-4 shadow-sm" style={{ background: '#1e293b' }}>
                  <CardBody className="p-3">
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <span className="small text-slate-400 fw-semibold">Tổng Bài học</span>
                      <Layers size={18} className="text-primary" />
                    </div>
                    <h3 className="fw-black mb-0 text-white">{stats?.stats?.totalLessons ?? 25}</h3>
                    <small className="text-slate-400" style={{ fontSize: '11px' }}>25 bài Minna no Nihongo</small>
                  </CardBody>
                </Card>
              </Col>

              <Col xs={6} md={3}>
                <Card className="border-0 rounded-4 shadow-sm" style={{ background: '#1e293b' }}>
                  <CardBody className="p-3">
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <span className="small text-slate-400 fw-semibold">Tổng Từ vựng N5</span>
                      <BookOpen size={18} className="text-success" />
                    </div>
                    <div className="d-flex align-items-baseline gap-2">
                      <h3 className="fw-black mb-0 text-white">{stats?.stats?.uniqueVocabularies ?? 1589}</h3>
                      {stats?.stats?.vocabDuplicates > 0 && (
                        <span className="badge bg-danger small" style={{ fontSize: '10px' }}>
                          +{stats.stats.vocabDuplicates} trùng
                        </span>
                      )}
                    </div>
                    <small className="text-slate-400" style={{ fontSize: '11px' }}>Đầy đủ ví dụ & âm thanh</small>
                  </CardBody>
                </Card>
              </Col>

              <Col xs={6} md={3}>
                <Card className="border-0 rounded-4 shadow-sm" style={{ background: '#1e293b' }}>
                  <CardBody className="p-3">
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <span className="small text-slate-400 fw-semibold">Chữ Kanji N5</span>
                      <Sparkles size={18} className="text-warning" />
                    </div>
                    <div className="d-flex align-items-baseline gap-2">
                      <h3 className="fw-black mb-0 text-white">{stats?.stats?.uniqueKanji ?? 80}</h3>
                      {stats?.stats?.kanjiDuplicates > 0 && (
                        <span className="badge bg-danger small" style={{ fontSize: '10px' }}>
                          +{stats.stats.kanjiDuplicates} trùng
                        </span>
                      )}
                    </div>
                    <small className="text-slate-400" style={{ fontSize: '11px' }}>Số nét & Hán Việt chuẩn</small>
                  </CardBody>
                </Card>
              </Col>

              <Col xs={6} md={3}>
                <Card className="border-0 rounded-4 shadow-sm" style={{ background: '#1e293b' }}>
                  <CardBody className="p-3">
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <span className="small text-slate-400 fw-semibold">Học viên Đăng ký</span>
                      <Users size={18} className="text-info" />
                    </div>
                    <h3 className="fw-black mb-0 text-white">{stats?.stats?.totalUsers ?? 0}</h3>
                    <small className="text-slate-400" style={{ fontSize: '11px' }}>Đã kích hoạt tài khoản</small>
                  </CardBody>
                </Card>
              </Col>
            </Row>

            {/* Quick Actions & DB Diagnostic Box */}
            <Row className="g-3">
              <Col md={7}>
                <Card className="border-0 rounded-4 shadow-sm h-100" style={{ background: '#1e293b' }}>
                  <CardBody className="p-3.5">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <h6 className="fw-bold mb-0 text-white d-flex align-items-center gap-2">
                        <Database size={16} className="text-primary" /> Phân bổ từ vựng theo 25 bài học
                      </h6>
                      <Button
                        color="link"
                        size="sm"
                        onClick={loadStats}
                        className="text-slate-400 p-0 text-decoration-none small"
                      >
                        <RefreshCw size={13} /> Làm mới
                      </Button>
                    </div>

                    <div className="table-responsive" style={{ maxHeight: '340px' }}>
                      <Table dark borderless size="sm" className="mb-0" style={{ fontSize: '12.5px' }}>
                        <thead>
                          <tr className="text-slate-400 border-bottom border-secondary border-opacity-25">
                            <th>Bài</th>
                            <th>Tên chủ đề bài học</th>
                            <th className="text-end">Số từ vựng</th>
                          </tr>
                        </thead>
                        <tbody>
                          {stats?.lessonDistribution?.map((l) => (
                            <tr key={l.lesson_number} className="border-bottom border-secondary border-opacity-10">
                              <td className="fw-bold text-primary">Bài {l.lesson_number}</td>
                              <td className="text-slate-300 text-truncate" style={{ maxWidth: '240px' }}>
                                {l.title}
                              </td>
                              <td className="text-end fw-semibold text-white">
                                {l.vocab_count} từ
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </div>
                  </CardBody>
                </Card>
              </Col>

              <Col md={5}>
                <Card className="border-0 rounded-4 shadow-sm h-100" style={{ background: '#1e293b' }}>
                  <CardBody className="p-3.5">
                    <h6 className="fw-bold mb-3 text-white d-flex align-items-center gap-2">
                      <ShieldCheck size={16} className="text-success" /> Trạng thái Hạ tầng & Cơ sở dữ liệu
                    </h6>

                    <div className="p-3 rounded-3 mb-3" style={{ background: '#0f172a' }}>
                      <div className="d-flex justify-content-between small py-1 border-bottom border-secondary border-opacity-20">
                        <span className="text-slate-400">Kết nối Database:</span>
                        <span className="text-success fw-bold">Hoạt động tốt (Connected)</span>
                      </div>
                      <div className="d-flex justify-content-between small py-1 border-bottom border-secondary border-opacity-20">
                        <span className="text-slate-400">Loại Cơ sở dữ liệu:</span>
                        <span className="text-slate-200">{stats?.databaseInfo?.poolConfig || 'PostgreSQL'}</span>
                      </div>
                      <div className="d-flex justify-content-between small py-1 border-bottom border-secondary border-opacity-20">
                        <span className="text-slate-400">Lượt làm bài (Sessions):</span>
                        <span className="text-slate-200 fw-bold">{stats?.stats?.totalStudySessions ?? 0}</span>
                      </div>
                      <div className="d-flex justify-content-between small py-1">
                        <span className="text-slate-400">Từ đã ghi nhớ (Mastered):</span>
                        <span className="text-warning fw-bold">{stats?.stats?.totalMastered ?? 0}</span>
                      </div>
                    </div>

                    <h6 className="fw-bold mb-2 small text-slate-300">Công cụ Quản trị Nhanh:</h6>
                    <div className="d-grid gap-2">
                      <Button
                        color="danger"
                        size="sm"
                        disabled={cleanLoading}
                        onClick={handleCleanDuplicates}
                        className="rounded-3 py-2 fw-bold d-flex align-items-center justify-content-center gap-2"
                      >
                        {cleanLoading ? <Spinner size="sm" /> : <RefreshCw size={14} />}
                        <span>Dọn dẹp & Khử trùng lặp Data ngay</span>
                      </Button>

                      <Button
                        color="secondary"
                        size="sm"
                        onClick={() => {
                          setActiveTab('vocab');
                          setVocabLesson('1');
                        }}
                        className="rounded-3 py-2 fw-semibold d-flex align-items-center justify-content-center gap-2 text-white border-0"
                        style={{ background: '#334155' }}
                      >
                        <BookOpen size={14} />
                        <span>Xem & Chỉnh sửa Danh sách Từ vựng</span>
                      </Button>
                    </div>
                  </CardBody>
                </Card>
              </Col>
            </Row>
          </div>
        )}

        {/* ── 2B. TAB: VOCABULARY MANAGEMENT ── */}
        {activeTab === 'vocab' && (
          <Card className="border-0 rounded-4 shadow-sm" style={{ background: '#1e293b' }}>
            <CardBody className="p-3 p-md-4">
              {/* Header Filter Controls */}
              <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2.5 mb-3">
                <div className="d-flex align-items-center gap-2 flex-wrap">
                  <span className="fw-bold text-white small">Bài học:</span>
                  <Input
                    type="select"
                    value={vocabLesson}
                    onChange={(e) => {
                      setVocabLesson(e.target.value);
                      setVocabPage(1);
                    }}
                    className="form-control-sm rounded-pill fw-bold border-0 text-white"
                    style={{ width: 'auto', background: '#334155', fontSize: '13px' }}
                  >
                    <option value="all">Tất cả bài học (1-25)</option>
                    {Array.from({ length: 25 }, (_, i) => i + 1).map((n) => (
                      <option key={n} value={String(n)}>
                        Bài {n < 10 ? `0${n}` : n}
                      </option>
                    ))}
                  </Input>

                  <div className="position-relative" style={{ minWidth: '200px' }}>
                    <Input
                      type="text"
                      placeholder="Tìm từ vựng, kana, kanji, nghĩa..."
                      value={vocabSearch}
                      onChange={(e) => setVocabSearch(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && loadVocabularies(1)}
                      className="form-control-sm rounded-pill ps-4 border-0 text-white"
                      style={{ background: '#334155', fontSize: '12.5px' }}
                    />
                    <Search size={13} className="position-absolute top-50 start-0 translate-middle-y ms-2 text-slate-400" />
                  </div>

                  <Button
                    color="primary"
                    size="sm"
                    onClick={() => loadVocabularies(1)}
                    className="rounded-pill px-3 py-1 fw-bold small"
                    style={{ fontSize: '12px' }}
                  >
                    Tìm
                  </Button>
                </div>

                <Button
                  color="danger"
                  size="sm"
                  onClick={handleOpenAddVocab}
                  className="rounded-pill px-3 py-1.5 fw-bold d-flex align-items-center gap-1 shadow-sm text-nowrap"
                  style={{ fontSize: '12.5px' }}
                >
                  <Plus size={15} /> Thêm từ vựng mới
                </Button>
              </div>

              {/* Vocabulary Table */}
              <div className="table-responsive" style={{ minHeight: '380px' }}>
                {vocabLoading ? (
                  <div className="text-center py-5">
                    <Spinner color="primary" />
                    <p className="mt-2 text-slate-400 small">Đang tải dữ liệu từ vựng...</p>
                  </div>
                ) : (
                  <Table dark hover borderless size="sm" className="align-middle mb-0" style={{ fontSize: '13px' }}>
                    <thead>
                      <tr className="text-slate-400 border-bottom border-secondary border-opacity-25" style={{ fontSize: '12px' }}>
                        <th style={{ width: '60px' }}>Bài #</th>
                        <th style={{ width: '50px' }}>STT</th>
                        <th>Chữ Hán</th>
                        <th>Kana / Hiragana</th>
                        <th>Romaji</th>
                        <th>Nghĩa tiếng Việt</th>
                        <th>Ghi chú ngữ pháp</th>
                        <th className="text-end" style={{ width: '130px' }}>Hành động</th>
                      </tr>
                    </thead>
                    <tbody>
                      {vocabList.length === 0 ? (
                        <tr>
                          <td colSpan="8" className="text-center py-5 text-slate-400">
                            Không tìm thấy từ vựng nào phù hợp.
                          </td>
                        </tr>
                      ) : (
                        vocabList.map((v) => (
                          <tr key={v.id} className="border-bottom border-secondary border-opacity-10">
                            <td className="fw-bold text-danger">B.{v.lesson_number}</td>
                            <td className="text-slate-400">#{v.order_num}</td>
                            <td className="fw-bold text-warning fs-6">{v.kanji || '—'}</td>
                            <td className="fw-semibold text-white">
                              <span
                                className="cursor-pointer text-hover-underline d-inline-flex align-items-center gap-1"
                                onClick={() => speakJapanese(v.clean_kana || v.kana)}
                                title="Bấm để phát âm"
                              >
                                {v.kana}
                                <Volume2 size={12} className="text-info opacity-75" />
                              </span>
                            </td>
                            <td className="text-slate-400 font-monospace" style={{ fontSize: '12px' }}>{v.romaji}</td>
                            <td className="text-slate-200 fw-medium">{v.clean_vietnamese || v.vietnamese}</td>
                            <td className="text-slate-400 small" style={{ fontSize: '11.5px', maxWidth: '200px' }}>
                              {v.usage_note || '—'}
                            </td>
                            <td className="text-end">
                              <div className="d-flex align-items-center justify-content-end gap-1">
                                <Button
                                  color="light"
                                  size="sm"
                                  onClick={() => handleOpenEditVocab(v)}
                                  className="p-1 rounded-2 text-primary border-0"
                                  title="Chỉnh sửa từ vựng"
                                >
                                  <Edit2 size={13} />
                                </Button>
                                <Button
                                  color="danger"
                                  size="sm"
                                  onClick={() => handleDeleteVocab(v.id, v.kana)}
                                  className="p-1 rounded-2 border-0"
                                  title="Xóa từ vựng"
                                >
                                  <Trash2 size={13} />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </Table>
                )}
              </div>

              {/* Pagination Controls */}
              {vocabTotalPages > 1 && (
                <div className="d-flex justify-content-between align-items-center pt-3 border-top border-secondary border-opacity-20 flex-wrap gap-2">
                  <small className="text-slate-400">
                    Hiển thị trang <strong>{vocabPage}</strong> / {vocabTotalPages} (Tổng cộng {vocabTotal} từ vựng)
                  </small>
                  <div className="d-flex gap-1.5">
                    <Button
                      color="secondary"
                      size="sm"
                      disabled={vocabPage <= 1}
                      onClick={() => loadVocabularies(vocabPage - 1)}
                      className="px-2.5 py-1 rounded-pill small border-0"
                      style={{ background: '#334155' }}
                    >
                      <ChevronLeft size={14} /> Trước
                    </Button>
                    <Button
                      color="secondary"
                      size="sm"
                      disabled={vocabPage >= vocabTotalPages}
                      onClick={() => loadVocabularies(vocabPage + 1)}
                      className="px-2.5 py-1 rounded-pill small border-0"
                      style={{ background: '#334155' }}
                    >
                      Sau <ChevronRight size={14} />
                    </Button>
                  </div>
                </div>
              )}
            </CardBody>
          </Card>
        )}

        {/* ── 2C. TAB: LESSONS MANAGEMENT ── */}
        {activeTab === 'lessons' && (
          <Card className="border-0 rounded-4 shadow-sm" style={{ background: '#1e293b' }}>
            <CardBody className="p-3 p-md-4">
              <h5 className="fw-bold mb-3 text-white">Quản lý 25 Bài học Minna no Nihongo</h5>
              <div className="table-responsive">
                <Table dark hover borderless size="sm" className="align-middle mb-0">
                  <thead>
                    <tr className="text-slate-400 border-bottom border-secondary border-opacity-25" style={{ fontSize: '12px' }}>
                      <th style={{ width: '80px' }}>Bài số</th>
                      <th>Tiêu đề chủ đề bài học</th>
                      <th>Mô tả / Ngữ pháp chính</th>
                      <th className="text-center" style={{ width: '120px' }}>Số từ vựng</th>
                      <th className="text-end" style={{ width: '100px' }}>Chỉnh sửa</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lessonsList.map((l) => (
                      <tr key={l.id} className="border-bottom border-secondary border-opacity-10">
                        <td className="fw-bold text-danger fs-6">Bài {l.lesson_number}</td>
                        <td className="fw-semibold text-white">{l.title}</td>
                        <td className="text-slate-400 small" style={{ fontSize: '12px' }}>
                          {l.description || '—'}
                        </td>
                        <td className="text-center">
                          <span className="badge bg-primary bg-opacity-20 text-primary px-2 py-1 rounded-pill fw-bold">
                            {l.vocab_count} từ
                          </span>
                        </td>
                        <td className="text-end">
                          <Button
                            color="light"
                            size="sm"
                            onClick={() => handleOpenEditLesson(l)}
                            className="p-1.5 rounded-2 text-primary border-0"
                            title="Sửa bài học"
                          >
                            <Edit2 size={13} />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </CardBody>
          </Card>
        )}

        {/* ── 2D. TAB: KANJI MANAGEMENT ── */}
        {activeTab === 'kanji' && (
          <Card className="border-0 rounded-4 shadow-sm" style={{ background: '#1e293b' }}>
            <CardBody className="p-3 p-md-4">
              <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2.5 mb-3">
                <div className="d-flex align-items-center gap-2">
                  <div className="position-relative" style={{ minWidth: '220px' }}>
                    <Input
                      type="text"
                      placeholder="Tìm chữ Kanji, âm Hán, nghĩa..."
                      value={kanjiSearch}
                      onChange={(e) => setKanjiSearch(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && loadKanji(1)}
                      className="form-control-sm rounded-pill ps-4 border-0 text-white"
                      style={{ background: '#334155', fontSize: '12.5px' }}
                    />
                    <Search size={13} className="position-absolute top-50 start-0 translate-middle-y ms-2 text-slate-400" />
                  </div>
                  <Button
                    color="primary"
                    size="sm"
                    onClick={() => loadKanji(1)}
                    className="rounded-pill px-3 py-1 fw-bold small"
                    style={{ fontSize: '12px' }}
                  >
                    Tìm
                  </Button>
                </div>

                <Button
                  color="danger"
                  size="sm"
                  onClick={handleOpenAddKanji}
                  className="rounded-pill px-3 py-1.5 fw-bold d-flex align-items-center gap-1 shadow-sm text-nowrap"
                  style={{ fontSize: '12.5px' }}
                >
                  <Plus size={15} /> Thêm chữ Kanji mới
                </Button>
              </div>

              <div className="table-responsive">
                <Table dark hover borderless size="sm" className="align-middle mb-0" style={{ fontSize: '13px' }}>
                  <thead>
                    <tr className="text-slate-400 border-bottom border-secondary border-opacity-25" style={{ fontSize: '12px' }}>
                      <th style={{ width: '60px' }}>Kanji</th>
                      <th style={{ width: '100px' }}>Hán Việt</th>
                      <th>Âm On (Onyomi)</th>
                      <th>Âm Kun (Kunyomi)</th>
                      <th>Ý nghĩa</th>
                      <th style={{ width: '70px' }}>Số nét</th>
                      <th className="text-end" style={{ width: '110px' }}>Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {kanjiList.map((k) => (
                      <tr key={k.id} className="border-bottom border-secondary border-opacity-10">
                        <td className="fw-black text-warning fs-4">{k.kanji}</td>
                        <td className="fw-bold text-info">{k.han_viet}</td>
                        <td className="text-slate-300 font-monospace small">{k.onyomi || '—'}</td>
                        <td className="text-slate-300 font-monospace small">{k.kunyomi || '—'}</td>
                        <td className="text-slate-200">{k.meaning}</td>
                        <td className="text-slate-400">{k.stroke_count} nét</td>
                        <td className="text-end">
                          <div className="d-flex align-items-center justify-content-end gap-1">
                            <Button
                              color="light"
                              size="sm"
                              onClick={() => handleOpenEditKanji(k)}
                              className="p-1 rounded-2 text-primary border-0"
                            >
                              <Edit2 size={13} />
                            </Button>
                            <Button
                              color="danger"
                              size="sm"
                              onClick={() => handleDeleteKanji(k.id, k.kanji)}
                              className="p-1 rounded-2 border-0"
                            >
                              <Trash2 size={13} />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </CardBody>
          </Card>
        )}

        {/* ── 2E. TAB: USERS MANAGEMENT ── */}
        {activeTab === 'users' && (
          <Card className="border-0 rounded-4 shadow-sm" style={{ background: '#1e293b' }}>
            <CardBody className="p-3 p-md-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="fw-bold mb-0 text-white">Quản lý Học viên & Tài khoản</h5>
                <div className="position-relative" style={{ minWidth: '220px' }}>
                  <Input
                    type="text"
                    placeholder="Tìm theo username hoặc email..."
                    value={usersSearch}
                    onChange={(e) => setUsersSearch(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && loadUsers(1)}
                    className="form-control-sm rounded-pill ps-4 border-0 text-white"
                    style={{ background: '#334155', fontSize: '12.5px' }}
                  />
                  <Search size={13} className="position-absolute top-50 start-0 translate-middle-y ms-2 text-slate-400" />
                </div>
              </div>

              <div className="table-responsive">
                <Table dark hover borderless size="sm" className="align-middle mb-0" style={{ fontSize: '13px' }}>
                  <thead>
                    <tr className="text-slate-400 border-bottom border-secondary border-opacity-25" style={{ fontSize: '12px' }}>
                      <th>ID</th>
                      <th>Tên người dùng</th>
                      <th>Email</th>
                      <th>Phương thức</th>
                      <th>Vai trò (Role)</th>
                      <th>Tiến độ học</th>
                      <th>Ngày tham gia</th>
                      <th className="text-end">Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usersList.map((u) => (
                      <tr key={u.id} className="border-bottom border-secondary border-opacity-10">
                        <td className="text-slate-400">#{u.id}</td>
                        <td className="fw-semibold text-white">{u.username}</td>
                        <td className="text-slate-300">{u.email}</td>
                        <td>
                          <span className="badge bg-secondary bg-opacity-30 text-slate-300 text-uppercase" style={{ fontSize: '10px' }}>
                            {u.auth_provider || 'local'}
                          </span>
                        </td>
                        <td>
                          <span
                            className={`badge px-2 py-1 rounded-pill fw-bold ${
                              u.role === 'admin' ? 'bg-danger text-white' : 'bg-primary bg-opacity-20 text-primary'
                            }`}
                            style={{ fontSize: '11px' }}
                          >
                            {u.role === 'admin' ? 'ADMIN' : 'USER'}
                          </span>
                        </td>
                        <td className="text-slate-300">
                          {u.studied_words || 0} từ • {u.quiz_sessions || 0} bài test
                        </td>
                        <td className="text-slate-400 small" style={{ fontSize: '11.5px' }}>
                          {new Date(u.created_at).toLocaleDateString('vi-VN')}
                        </td>
                        <td className="text-end">
                          <div className="d-flex align-items-center justify-content-end gap-1">
                            <Button
                              color={u.role === 'admin' ? 'warning' : 'outline-info'}
                              size="sm"
                              onClick={() => handleToggleRole(u)}
                              className="px-2 py-0.5 rounded-pill small border-0 fw-bold"
                              style={{ fontSize: '11px' }}
                              title="Thay đổi quyền"
                            >
                              {u.role === 'admin' ? 'Gỡ Admin' : 'Cấp Admin'}
                            </Button>
                            <Button
                              color="danger"
                              size="sm"
                              onClick={() => handleDeleteUser(u)}
                              className="p-1 rounded-2 border-0"
                              title="Xóa tài khoản"
                            >
                              <Trash2 size={13} />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </CardBody>
          </Card>
        )}

        {/* ── 2F. TAB: MAINTENANCE & DATA CLEANUP ── */}
        {activeTab === 'maintenance' && (
          <Row className="g-3">
            <Col md={6}>
              <Card className="border-0 rounded-4 shadow-sm" style={{ background: '#1e293b' }}>
                <CardBody className="p-4">
                  <div className="d-flex align-items-center gap-2 mb-2 text-danger">
                    <Sparkles size={20} />
                    <h5 className="fw-bold mb-0 text-white">Khắc phục Dữ liệu Trùng lặp (Deduplicate)</h5>
                  </div>
                  <p className="text-slate-300 small mb-3">
                    Thuật toán sẽ tự động quét cơ sở dữ liệu Supabase / PostgreSQL, nhận diện các từ vựng và chữ Kanji có cùng số bài học và thứ tự, giữ lại bản ghi tối ưu duy nhất, chuyển toàn bộ ghi chú và tiến độ của học viên sang bản ghi chuẩn, xóa vĩnh viễn dữ liệu trùng lặp, đồng thời thiết lập <strong>Unique Constraint Index</strong> để ngăn chặn trùng lặp tuyệt đối trong tương lai.
                  </p>

                  <div className="p-3 rounded-3 mb-3" style={{ background: '#0f172a' }}>
                    <div className="d-flex justify-content-between small py-1">
                      <span className="text-slate-400">Từ vựng bị trùng lặp:</span>
                      <span className={`fw-bold ${stats?.stats?.vocabDuplicates > 0 ? 'text-danger' : 'text-success'}`}>
                        {stats?.stats?.vocabDuplicates ?? 0} bản ghi
                      </span>
                    </div>
                    <div className="d-flex justify-content-between small py-1">
                      <span className="text-slate-400">Kanji bị trùng lặp:</span>
                      <span className={`fw-bold ${stats?.stats?.kanjiDuplicates > 0 ? 'text-danger' : 'text-success'}`}>
                        {stats?.stats?.kanjiDuplicates ?? 0} bản ghi
                      </span>
                    </div>
                  </div>

                  <Button
                    color="danger"
                    block
                    disabled={cleanLoading}
                    onClick={handleCleanDuplicates}
                    className="py-2.5 fw-bold rounded-3 shadow-md d-flex align-items-center justify-content-center gap-2"
                  >
                    {cleanLoading ? <Spinner size="sm" /> : <RefreshCw size={16} />}
                    <span>{cleanLoading ? 'Đang thực hiện dọn dẹp...' : 'Khởi chạy Dọn dẹp Trùng lặp Ngay'}</span>
                  </Button>
                </CardBody>
              </Card>
            </Col>

            <Col md={6}>
              <Card className="border-0 rounded-4 shadow-sm" style={{ background: '#1e293b' }}>
                <CardBody className="p-4">
                  <div className="d-flex align-items-center gap-2 mb-2 text-success">
                    <ShieldCheck size={20} />
                    <h5 className="fw-bold mb-0 text-white">Kiểm tra Tính Toàn vẹn Hệ thống (Integrity)</h5>
                  </div>
                  <p className="text-slate-300 small mb-3">
                    Đối soát số lượng bản ghi tiêu chuẩn cho toàn bộ chương trình Minna no Nihongo N5:
                  </p>

                  <div className="p-3 rounded-3 mb-3" style={{ background: '#0f172a' }}>
                    <div className="d-flex justify-content-between small py-1 border-bottom border-secondary border-opacity-20">
                      <span className="text-slate-400">Chuẩn bài học:</span>
                      <span className="text-white fw-bold">25 / 25 bài ({stats?.stats?.totalLessons === 25 ? 'Đạt' : 'Cần kiểm tra'})</span>
                    </div>
                    <div className="d-flex justify-content-between small py-1 border-bottom border-secondary border-opacity-20">
                      <span className="text-slate-400">Chuẩn từ vựng N5:</span>
                      <span className="text-white fw-bold">{stats?.stats?.uniqueVocabularies} / 1,589 từ</span>
                    </div>
                    <div className="d-flex justify-content-between small py-1">
                      <span className="text-slate-400">Chuẩn chữ Kanji N5:</span>
                      <span className="text-white fw-bold">{stats?.stats?.uniqueKanji} / 80 chữ</span>
                    </div>
                  </div>

                  <Button
                    color="primary"
                    block
                    onClick={loadStats}
                    className="py-2.5 fw-bold rounded-3 d-flex align-items-center justify-content-center gap-2"
                  >
                    <RefreshCw size={16} />
                    <span>Làm mới & Đồng bộ chỉ số</span>
                  </Button>
                </CardBody>
              </Card>
            </Col>
          </Row>
        )}
      </Container>

      {/* ── MODAL: ADD / EDIT VOCABULARY ── */}
      <Modal
        isOpen={vocabModalOpen}
        toggle={() => setVocabModalOpen(!vocabModalOpen)}
        centered
        size="lg"
        className="text-white"
        contentClassName="bg-slate-900 border-0 shadow-2xl rounded-4"
        style={{ background: '#0f172a' }}
      >
        <ModalHeader
          toggle={() => setVocabModalOpen(false)}
          className="border-bottom border-secondary border-opacity-25"
          style={{ background: '#1e293b' }}
        >
          <span className="fw-bold text-white">
            {vocabForm.id ? `Chỉnh sửa Từ vựng #${vocabForm.id}` : 'Thêm Từ vựng N5 Mới'}
          </span>
        </ModalHeader>
        <form onSubmit={handleSaveVocab}>
          <ModalBody className="p-4" style={{ background: '#0f172a' }}>
            <Row className="g-3">
              <Col md={4}>
                <FormGroup>
                  <Label className="small fw-bold text-slate-300">Bài học (1 - 25) *</Label>
                  <Input
                    type="number"
                    min={1}
                    max={25}
                    required
                    value={vocabForm.lesson_number}
                    onChange={(e) => setVocabForm({ ...vocabForm, lesson_number: parseInt(e.target.value) })}
                    className="border-slate-700 text-white rounded-3"
                    style={{ background: '#1e293b' }}
                  />
                </FormGroup>
              </Col>
              <Col md={4}>
                <FormGroup>
                  <Label className="small fw-bold text-slate-300">Số thứ tự (Order num)</Label>
                  <Input
                    type="number"
                    value={vocabForm.order_num}
                    onChange={(e) => setVocabForm({ ...vocabForm, order_num: e.target.value })}
                    placeholder="Tự động tăng"
                    className="border-slate-700 text-white rounded-3"
                    style={{ background: '#1e293b' }}
                  />
                </FormGroup>
              </Col>
              <Col md={4}>
                <FormGroup>
                  <Label className="small fw-bold text-slate-300">Chữ Hán (Kanji)</Label>
                  <Input
                    type="text"
                    value={vocabForm.kanji}
                    onChange={(e) => setVocabForm({ ...vocabForm, kanji: e.target.value })}
                    placeholder="VD: 私, 先生"
                    className="border-slate-700 text-white rounded-3"
                    style={{ background: '#1e293b' }}
                  />
                </FormGroup>
              </Col>

              <Col md={6}>
                <FormGroup>
                  <Label className="small fw-bold text-slate-300">Cách đọc Kana / Hiragana *</Label>
                  <Input
                    type="text"
                    required
                    value={vocabForm.kana}
                    onChange={(e) => setVocabForm({ ...vocabForm, kana: e.target.value, clean_kana: e.target.value })}
                    placeholder="VD: わたし, せんせい"
                    className="border-slate-700 text-white rounded-3"
                    style={{ background: '#1e293b' }}
                  />
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup>
                  <Label className="small fw-bold text-slate-300">Phiên âm Romaji</Label>
                  <Input
                    type="text"
                    value={vocabForm.romaji}
                    onChange={(e) => setVocabForm({ ...vocabForm, romaji: e.target.value })}
                    placeholder="VD: watashi, sensei"
                    className="border-slate-700 text-white rounded-3"
                    style={{ background: '#1e293b' }}
                  />
                </FormGroup>
              </Col>

              <Col md={6}>
                <FormGroup>
                  <Label className="small fw-bold text-slate-300">Nghĩa tiếng Việt chuẩn *</Label>
                  <Input
                    type="text"
                    required
                    value={vocabForm.clean_vietnamese || vocabForm.vietnamese}
                    onChange={(e) => setVocabForm({ ...vocabForm, vietnamese: e.target.value, clean_vietnamese: e.target.value })}
                    placeholder="VD: tôi, giáo viên"
                    className="border-slate-700 text-white rounded-3"
                    style={{ background: '#1e293b' }}
                  />
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup>
                  <Label className="small fw-bold text-slate-300">Ghi chú ngữ pháp & cách dùng</Label>
                  <Input
                    type="text"
                    value={vocabForm.usage_note}
                    onChange={(e) => setVocabForm({ ...vocabForm, usage_note: e.target.value })}
                    placeholder="VD: Thân mật, lịch sự..."
                    className="border-slate-700 text-white rounded-3"
                    style={{ background: '#1e293b' }}
                  />
                </FormGroup>
              </Col>

              <Col md={12}>
                <FormGroup>
                  <Label className="small fw-bold text-slate-300">Câu ví dụ tiếng Nhật</Label>
                  <Input
                    type="text"
                    value={vocabForm.example_jp}
                    onChange={(e) => setVocabForm({ ...vocabForm, example_jp: e.target.value })}
                    placeholder="VD: わたしはがくせいです。"
                    className="border-slate-700 text-white rounded-3"
                    style={{ background: '#1e293b' }}
                  />
                </FormGroup>
              </Col>
              <Col md={12}>
                <FormGroup>
                  <Label className="small fw-bold text-slate-300">Dịch nghĩa câu ví dụ</Label>
                  <Input
                    type="text"
                    value={vocabForm.example_vi}
                    onChange={(e) => setVocabForm({ ...vocabForm, example_vi: e.target.value })}
                    placeholder="VD: Tôi là học sinh."
                    className="border-slate-700 text-white rounded-3"
                    style={{ background: '#1e293b' }}
                  />
                </FormGroup>
              </Col>
            </Row>
          </ModalBody>
          <ModalFooter className="border-top border-secondary border-opacity-25" style={{ background: '#1e293b' }}>
            <Button color="secondary" onClick={() => setVocabModalOpen(false)} className="rounded-3 border-0" style={{ background: '#334155' }}>
              Hủy
            </Button>
            <Button color="danger" type="submit" disabled={vocabSaving} className="fw-bold rounded-3 px-4">
              {vocabSaving ? <Spinner size="sm" /> : 'Lưu từ vựng'}
            </Button>
          </ModalFooter>
        </form>
      </Modal>

      {/* ── MODAL: EDIT LESSON ── */}
      <Modal
        isOpen={lessonModalOpen}
        toggle={() => setLessonModalOpen(!lessonModalOpen)}
        centered
        className="text-white"
        contentClassName="bg-slate-900 border-0 shadow-2xl rounded-4"
        style={{ background: '#0f172a' }}
      >
        <ModalHeader
          toggle={() => setLessonModalOpen(false)}
          className="border-bottom border-secondary border-opacity-25"
          style={{ background: '#1e293b' }}
        >
          <span className="fw-bold text-white">Chỉnh sửa Bài {lessonForm.lesson_number}</span>
        </ModalHeader>
        <form onSubmit={handleSaveLesson}>
          <ModalBody className="p-4" style={{ background: '#0f172a' }}>
            <FormGroup className="mb-3">
              <Label className="small fw-bold text-slate-300">Tiêu đề bài học</Label>
              <Input
                type="text"
                required
                value={lessonForm.title}
                onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })}
                className="border-slate-700 text-white rounded-3"
                style={{ background: '#1e293b' }}
              />
            </FormGroup>
            <FormGroup className="mb-3">
              <Label className="small fw-bold text-slate-300">Mô tả / Ngữ pháp trọng tâm</Label>
              <Input
                type="textarea"
                rows={3}
                value={lessonForm.description}
                onChange={(e) => setLessonForm({ ...lessonForm, description: e.target.value })}
                className="border-slate-700 text-white rounded-3"
                style={{ background: '#1e293b' }}
              />
            </FormGroup>
          </ModalBody>
          <ModalFooter className="border-top border-secondary border-opacity-25" style={{ background: '#1e293b' }}>
            <Button color="secondary" onClick={() => setLessonModalOpen(false)} className="rounded-3 border-0" style={{ background: '#334155' }}>
              Hủy
            </Button>
            <Button color="danger" type="submit" disabled={lessonSaving} className="fw-bold rounded-3 px-4">
              {lessonSaving ? <Spinner size="sm" /> : 'Lưu thay đổi'}
            </Button>
          </ModalFooter>
        </form>
      </Modal>

      {/* ── MODAL: ADD / EDIT KANJI ── */}
      <Modal
        isOpen={kanjiModalOpen}
        toggle={() => setKanjiModalOpen(!kanjiModalOpen)}
        centered
        className="text-white"
        contentClassName="bg-slate-900 border-0 shadow-2xl rounded-4"
        style={{ background: '#0f172a' }}
      >
        <ModalHeader
          toggle={() => setKanjiModalOpen(false)}
          className="border-bottom border-secondary border-opacity-25"
          style={{ background: '#1e293b' }}
        >
          <span className="fw-bold text-white">{kanjiForm.id ? `Sửa Kanji "${kanjiForm.kanji}"` : 'Thêm chữ Kanji N5 Mới'}</span>
        </ModalHeader>
        <form onSubmit={handleSaveKanji}>
          <ModalBody className="p-4" style={{ background: '#0f172a' }}>
            <Row className="g-3">
              <Col md={4}>
                <FormGroup>
                  <Label className="small fw-bold text-slate-300">Chữ Kanji *</Label>
                  <Input
                    type="text"
                    required
                    maxLength={5}
                    value={kanjiForm.kanji}
                    onChange={(e) => setKanjiForm({ ...kanjiForm, kanji: e.target.value })}
                    placeholder="VD: 日"
                    className="border-slate-700 text-white rounded-3 fs-5 fw-bold text-center"
                    style={{ background: '#1e293b' }}
                  />
                </FormGroup>
              </Col>
              <Col md={4}>
                <FormGroup>
                  <Label className="small fw-bold text-slate-300">Âm Hán Việt *</Label>
                  <Input
                    type="text"
                    required
                    value={kanjiForm.han_viet}
                    onChange={(e) => setKanjiForm({ ...kanjiForm, han_viet: e.target.value })}
                    placeholder="VD: NHẬT"
                    className="border-slate-700 text-white rounded-3 fw-bold"
                    style={{ background: '#1e293b' }}
                  />
                </FormGroup>
              </Col>
              <Col md={4}>
                <FormGroup>
                  <Label className="small fw-bold text-slate-300">Số nét viết</Label>
                  <Input
                    type="number"
                    min={1}
                    value={kanjiForm.stroke_count}
                    onChange={(e) => setKanjiForm({ ...kanjiForm, stroke_count: parseInt(e.target.value) })}
                    className="border-slate-700 text-white rounded-3"
                    style={{ background: '#1e293b' }}
                  />
                </FormGroup>
              </Col>

              <Col md={6}>
                <FormGroup>
                  <Label className="small fw-bold text-slate-300">Âm On (Onyomi)</Label>
                  <Input
                    type="text"
                    value={kanjiForm.onyomi}
                    onChange={(e) => setKanjiForm({ ...kanjiForm, onyomi: e.target.value })}
                    placeholder="VD: ニチ, ジツ"
                    className="border-slate-700 text-white rounded-3"
                    style={{ background: '#1e293b' }}
                  />
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup>
                  <Label className="small fw-bold text-slate-300">Âm Kun (Kunyomi)</Label>
                  <Input
                    type="text"
                    value={kanjiForm.kunyomi}
                    onChange={(e) => setKanjiForm({ ...kanjiForm, kunyomi: e.target.value })}
                    placeholder="VD: ひ, -び"
                    className="border-slate-700 text-white rounded-3"
                    style={{ background: '#1e293b' }}
                  />
                </FormGroup>
              </Col>

              <Col md={12}>
                <FormGroup>
                  <Label className="small fw-bold text-slate-300">Ý nghĩa chữ Hán *</Label>
                  <Input
                    type="text"
                    required
                    value={kanjiForm.meaning}
                    onChange={(e) => setKanjiForm({ ...kanjiForm, meaning: e.target.value })}
                    placeholder="VD: Mặt trời, ngày, Nhật Bản"
                    className="border-slate-700 text-white rounded-3"
                    style={{ background: '#1e293b' }}
                  />
                </FormGroup>
              </Col>
            </Row>
          </ModalBody>
          <ModalFooter className="border-top border-secondary border-opacity-25" style={{ background: '#1e293b' }}>
            <Button color="secondary" onClick={() => setKanjiModalOpen(false)} className="rounded-3 border-0" style={{ background: '#334155' }}>
              Hủy
            </Button>
            <Button color="danger" type="submit" disabled={kanjiSaving} className="fw-bold rounded-3 px-4">
              {kanjiSaving ? <Spinner size="sm" /> : 'Lưu Kanji'}
            </Button>
          </ModalFooter>
        </form>
      </Modal>
    </div>
  );
};

export default AdminPage;
