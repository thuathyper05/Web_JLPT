import React, { useState, useEffect, useMemo } from 'react';
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  Users,
  Activity,
  Bell,
  MessageSquare,
  Server,
  Lock,
  Unlock,
  Trash2,
  Search,
  RefreshCw,
  LogOut,
  ExternalLink,
  Smartphone,
  Laptop,
  Globe,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Info,
  Calendar,
  Send,
  Database,
  Cpu,
  Zap,
  ChevronRight,
  Eye,
  X
} from 'lucide-react';
import { sounds } from '../services/sounds';

export default function AdminPage() {
  const [adminToken, setAdminToken] = useState(() => {
    return sessionStorage.getItem('hyper_admin_token') || localStorage.getItem('hyper_admin_token') || '';
  });
  const [adminUser, setAdminUser] = useState(() => {
    try {
      return JSON.parse(sessionStorage.getItem('hyper_admin_user') || 'null');
    } catch {
      return null;
    }
  });

  // Login form state
  const [loginEmail, setLoginEmail] = useState('thuathyperig05@gmail.com');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Dashboard state
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'users' | 'logs' | 'notifications' | 'feedbacks'
  const [loadingData, setLoadingData] = useState(false);
  const [stats, setStats] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);
  const [feedbacksList, setFeedbacksList] = useState([]);
  const [notificationsList, setNotificationsList] = useState([]);

  // Search & filter state
  const [userSearch, setUserSearch] = useState('');
  const [logSearch, setLogSearch] = useState('');
  const [logActionFilter, setLogActionFilter] = useState('all');

  // Broadcast Notification Form state
  const [notifTitle, setNotifTitle] = useState('');
  const [notifContent, setNotifContent] = useState('');
  const [notifType, setNotifType] = useState('update');
  const [notifLevel, setNotifLevel] = useState('all');
  const [submittingNotif, setSubmittingNotif] = useState(false);

  // Status message / toast
  const [alertMsg, setAlertMsg] = useState(null);

  const showAlert = (text, type = 'success') => {
    setAlertMsg({ text, type });
    setTimeout(() => setAlertMsg(null), 4000);
  };

  // ── 1. ADMIN AUTHENTICATION ──
  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: loginEmail.trim(),
          password: loginPassword
        })
      });
      const data = await res.json();

      if (res.ok && data.success && data.token) {
        sounds.playLevelUp();
        sessionStorage.setItem('hyper_admin_token', data.token);
        sessionStorage.setItem('hyper_admin_user', JSON.stringify(data.user));
        setAdminToken(data.token);
        setAdminUser(data.user);
        showAlert('Đăng nhập Quản Trị Viên Tối Cao thành công!', 'success');
      } else {
        sounds.playIncorrect();
        setLoginError(data.message || 'Tài khoản hoặc mật khẩu không chính xác.');
      }
    } catch (err) {
      setLoginError('Lỗi kết nối máy chủ quản trị.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleAdminLogout = () => {
    sounds.playFlip();
    sessionStorage.removeItem('hyper_admin_token');
    sessionStorage.removeItem('hyper_admin_user');
    localStorage.removeItem('hyper_admin_token');
    setAdminToken('');
    setAdminUser(null);
  };

  // ── 2. FETCH ADMIN DATA ──
  const fetchAllAdminData = async () => {
    if (!adminToken) return;
    setLoadingData(true);

    const headers = {
      Authorization: `Bearer ${adminToken}`,
      'Content-Type': 'application/json'
    };

    try {
      // 1. Stats
      const resStats = await fetch('/api/admin/stats', { headers });
      if (resStats.status === 401 || resStats.status === 403) {
        handleAdminLogout();
        return;
      }
      const dataStats = await resStats.json();
      if (dataStats.success) setStats(dataStats.stats);

      // 2. Users
      const resUsers = await fetch('/api/admin/users', { headers });
      const dataUsers = await resUsers.json();
      if (dataUsers.success) setUsersList(dataUsers.users || []);

      // 3. Activity Logs
      const resLogs = await fetch('/api/admin/activity-logs', { headers });
      const dataLogs = await resLogs.json();
      if (dataLogs.success) setActivityLogs(dataLogs.logs || []);

      // 4. Feedbacks
      const resFeedbacks = await fetch('/api/admin/feedbacks', { headers });
      const dataFeedbacks = await resFeedbacks.json();
      if (dataFeedbacks.success) setFeedbacksList(dataFeedbacks.feedbacks || []);

      // 5. Notifications
      const resNotifs = await fetch('/api/admin/notifications', { headers });
      const dataNotifs = await resNotifs.json();
      if (dataNotifs.success) setNotificationsList(dataNotifs.notifications || []);
    } catch (err) {
      console.warn('Admin fetch data error:', err);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    if (adminToken) {
      fetchAllAdminData();
    }
  }, [adminToken]);

  // ── 3. ACTIONS: USERS (BAN / UNBAN / DELETE) ──
  const handleToggleBanUser = async (userId, currentStatus) => {
    try {
      sounds.playFlip();
      const res = await fetch(`/api/admin/users/${userId}/ban`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      const data = await res.json();
      if (data.success) {
        showAlert(data.message, 'success');
        setUsersList((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, status: data.status } : u))
        );
      } else {
        showAlert(data.message, 'error');
      }
    } catch {
      showAlert('Lỗi xử lý tài khoản người dùng.', 'error');
    }
  };

  const handleDeleteUser = async (userId, userEmail) => {
    if (!window.confirm(`Xác nhận xóa vĩnh viễn tài khoản ${userEmail}? Hành động này không thể hoàn tác.`)) {
      return;
    }
    try {
      sounds.playFlip();
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      const data = await res.json();
      if (data.success) {
        showAlert(data.message, 'success');
        setUsersList((prev) => prev.filter((u) => u.id !== userId));
      } else {
        showAlert(data.message, 'error');
      }
    } catch {
      showAlert('Lỗi khi xóa tài khoản.', 'error');
    }
  };

  // ── 4. ACTIONS: BROADCAST NOTIFICATIONS ──
  const handleCreateNotification = async (e) => {
    e.preventDefault();
    if (!notifTitle.trim() || !notifContent.trim()) {
      showAlert('Vui lòng nhập đầy đủ tiêu đề và nội dung thông báo.', 'error');
      return;
    }

    setSubmittingNotif(true);
    try {
      sounds.playLevelUp();
      const res = await fetch('/api/admin/notifications', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${adminToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: notifTitle.trim(),
          content: notifContent.trim(),
          type: notifType,
          target_level: notifLevel
        })
      });
      const data = await res.json();

      if (data.success && data.notification) {
        showAlert('Đã phát thông báo mới thành công đến toàn thể học viên!', 'success');
        setNotificationsList((prev) => [data.notification, ...prev]);
        setNotifTitle('');
        setNotifContent('');
      } else {
        showAlert(data.message || 'Lỗi phát thông báo.', 'error');
      }
    } catch {
      showAlert('Lỗi kết nối khi phát thông báo.', 'error');
    } finally {
      setSubmittingNotif(false);
    }
  };

  const handleDeleteNotification = async (notifId) => {
    try {
      sounds.playFlip();
      const res = await fetch(`/api/admin/notifications/${notifId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      const data = await res.json();
      if (data.success) {
        showAlert('Đã gỡ bỏ thông báo.', 'success');
        setNotificationsList((prev) => prev.filter((n) => n.id !== notifId));
      }
    } catch {
      showAlert('Lỗi khi xóa thông báo.', 'error');
    }
  };

  // ── 5. ACTIONS: SUPPORT FEEDBACK STATUS ──
  const handleResolveFeedback = async (feedbackId, currentStatus) => {
    try {
      sounds.playFlip();
      const nextStatus = currentStatus === 'resolved' ? 'pending' : 'resolved';
      const res = await fetch(`/api/admin/feedbacks/${feedbackId}/status`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${adminToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: nextStatus })
      });
      const data = await res.json();
      if (data.success) {
        showAlert('Đã cập nhật trạng thái phản hồi.', 'success');
        setFeedbacksList((prev) =>
          prev.map((f) => (f.id === feedbackId ? { ...f, status: nextStatus } : f))
        );
      }
    } catch {
      showAlert('Lỗi khi cập nhật phản hồi.', 'error');
    }
  };

  // Filtered Users List
  const filteredUsers = useMemo(() => {
    if (!userSearch.trim()) return usersList;
    const q = userSearch.toLowerCase().trim();
    return usersList.filter(
      (u) =>
        (u.username && u.username.toLowerCase().includes(q)) ||
        (u.email && u.email.toLowerCase().includes(q)) ||
        (u.last_ip && u.last_ip.toLowerCase().includes(q))
    );
  }, [usersList, userSearch]);

  // Filtered Activity Logs
  const filteredLogs = useMemo(() => {
    let list = activityLogs;
    if (logActionFilter !== 'all') {
      list = list.filter((l) => l.action === logActionFilter);
    }
    if (logSearch.trim()) {
      const q = logSearch.toLowerCase().trim();
      list = list.filter(
        (l) =>
          (l.user_email && l.user_email.toLowerCase().includes(q)) ||
          (l.user_name && l.user_name.toLowerCase().includes(q)) ||
          (l.action && l.action.toLowerCase().includes(q)) ||
          (l.ip_address && l.ip_address.toLowerCase().includes(q)) ||
          (l.device_type && l.device_type.toLowerCase().includes(q))
      );
    }
    return list;
  }, [activityLogs, logActionFilter, logSearch]);

  // Unique actions for log filter
  const uniqueActions = useMemo(() => {
    const set = new Set();
    activityLogs.forEach((l) => {
      if (l.action) set.add(l.action);
    });
    return Array.from(set);
  }, [activityLogs]);

  // ═══════════════════════════════════════════════════════
  // VIEW 1: HIGH-SECURITY INDEPENDENT LOGIN GATE
  // ═══════════════════════════════════════════════════════
  if (!adminToken) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-4 selection:bg-pink-600 selection:text-white relative overflow-hidden">
        {/* Ambient Dark Neon Glows */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-pink-600/15 rounded-full blur-[128px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-rose-600/15 rounded-full blur-[128px] pointer-events-none" />

        <div className="w-full max-w-md relative z-10 space-y-6">
          {/* Header Brand */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/10 border border-pink-500/30 text-pink-400 text-xs font-black uppercase tracking-wider">
              <Shield className="w-3.5 h-3.5" />
              <span>Cổng Quản Trị Độc Lập</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              HYPER JP CONTROL CENTER
            </h1>
            <p className="text-xs text-slate-400">
              Khu vực bảo mật tối cao. Chỉ dành riêng cho Quản Trị Viên hệ thống.
            </p>
          </div>

          {/* Login Card */}
          <div className="bg-slate-900/90 backdrop-blur-2xl border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5">
            {loginError && (
              <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-bold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 block">
                  Tài khoản Quản trị viên
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    required
                    placeholder="thuathyperig05@gmail.com"
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-pink-500 transition-colors font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 block">
                  Mật khẩu bảo mật
                </label>
                <div className="relative">
                  <input
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                    placeholder="Nhập mật khẩu quản trị..."
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-pink-500 transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loginLoading}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-pink-600 via-rose-600 to-pink-500 hover:from-pink-500 hover:to-rose-500 text-white font-extrabold text-sm shadow-lotus flex items-center justify-center gap-2 transition-all active:scale-98 cursor-pointer disabled:opacity-75"
              >
                {loginLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Đang xác thực bảo mật...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Đăng Nhập Quản Trị</span>
                  </>
                )}
              </button>
            </form>

            <div className="pt-2 text-center">
              <a
                href="/"
                className="text-xs text-slate-500 hover:text-slate-300 transition-colors inline-flex items-center gap-1 font-semibold"
              >
                <span>Trở về WebApp học tập người dùng</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════
  // VIEW 2: FULL INDEPENDENT EXECUTIVE DASHBOARD
  // ═══════════════════════════════════════════════════════
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-pink-600 selection:text-white">
      {/* Toast Alert Notification */}
      {alertMsg && (
        <div className="fixed top-5 right-5 z-50 animate-in slide-in-from-top-3 duration-200">
          <div
            className={`px-4 py-3 rounded-2xl shadow-2xl border text-xs font-bold flex items-center gap-2.5 ${
              alertMsg.type === 'error'
                ? 'bg-rose-950/90 border-rose-500/50 text-rose-200'
                : 'bg-emerald-950/90 border-emerald-500/50 text-emerald-200'
            }`}
          >
            {alertMsg.type === 'error' ? (
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
            ) : (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            )}
            <span>{alertMsg.text}</span>
          </div>
        </div>
      )}

      {/* ── 1. EXECUTIVE HEADER ── */}
      <header className="bg-slate-900/90 backdrop-blur-xl border-b border-slate-800 sticky top-0 z-40 px-4 sm:px-6 lg:px-8 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 flex-wrap">
          {/* Left: Brand & Status Badges */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-pink-600 to-rose-500 flex items-center justify-center text-white shadow-lotus">
              <Shield className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-sm sm:text-base text-white tracking-wider uppercase">
                  HYPER JP
                </span>
                <span className="px-1.5 py-0.2 rounded bg-pink-500/20 text-pink-400 border border-pink-500/30 text-[10px] font-black uppercase">
                  v1.2 Admin
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse hidden sm:inline-block" />
              </div>
              <p className="text-[10px] text-slate-400 font-bold hidden sm:block">
                Hệ Thống Quản Trị Điều Hành Độc Lập & Bảo Mật Tuyệt Đối
              </p>
            </div>
          </div>

          {/* Right: Refresh, User Identity & Controls */}
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={fetchAllAdminData}
              disabled={loadingData}
              className="px-3 py-1.5 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-800 text-slate-300 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Làm mới toàn bộ dữ liệu"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingData ? 'animate-spin text-pink-400' : ''}`} />
              <span className="hidden sm:inline">Làm mới</span>
            </button>

            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-800 text-slate-300 text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Mở WebApp</span>
            </a>

            <div className="h-6 w-px bg-slate-800 hidden sm:block" />

            <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-slate-800/60 border border-slate-700/60">
              <div className="w-6 h-6 rounded-lg bg-pink-600 text-white flex items-center justify-center font-bold text-xs">
                T
              </div>
              <span className="text-xs font-bold text-slate-200 hidden md:inline max-w-[140px] truncate">
                thuathyperig05
              </span>
            </div>

            <button
              type="button"
              onClick={handleAdminLogout}
              className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
              title="Đăng xuất quản trị"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ── 2. ADMIN NAVIGATION TABS BAR ── */}
        <div className="max-w-7xl mx-auto pt-3 border-t border-slate-800/60 mt-3 flex items-center gap-1 overflow-x-auto scrollbar-none">
          {[
            { id: 'overview', label: 'Tổng Quan Hệ Thống', icon: Server, badge: stats?.activeToday },
            { id: 'users', label: 'Quản Lý Khách Hàng', icon: Users, badge: usersList.length },
            { id: 'logs', label: 'Nhật Ký Thiết Bị & IP', icon: Activity, badge: activityLogs.length },
            { id: 'notifications', label: 'Thông Báo Toàn Hệ Thống', icon: Bell, badge: notificationsList.length },
            { id: 'feedbacks', label: 'Hỗ Trợ & Trợ Giúp', icon: MessageSquare, badge: stats?.pendingFeedbacks }
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
                className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-pink-600 text-white shadow-lotus'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{tab.label}</span>
                {tab.badge !== undefined && tab.badge !== null && (
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                      isActive ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </header>

      {/* ── 3. MAIN DASHBOARD CONTENT AREA ── */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* ══════════════════════════════════════════════════
            TAB 1: TỔNG QUAN HỆ THỐNG (SYSTEM OVERVIEW)
            ══════════════════════════════════════════════════ */}
        {activeTab === 'overview' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Top 4 Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-2 relative overflow-hidden shadow-xs">
                <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
                  <span>Tổng Tài Khoản Khách Hàng</span>
                  <Users className="w-4 h-4 text-pink-500" />
                </div>
                <div className="text-2xl sm:text-3xl font-black text-white">
                  {stats?.totalUsers || usersList.length || 0}
                </div>
                <p className="text-[11px] text-slate-500 font-medium">
                  {stats?.activeToday || 0} học viên hoạt động trong ngày
                </p>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-2 relative overflow-hidden shadow-xs">
                <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
                  <span>Kho Dữ Liệu Học N5 - N1</span>
                  <Database className="w-4 h-4 text-rose-500" />
                </div>
                <div className="text-2xl sm:text-3xl font-black text-white">
                  9.584 từ
                </div>
                <p className="text-[11px] text-slate-500 font-medium">
                  130 bài học · 607 Kanji · 276 Ngữ pháp
                </p>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-2 relative overflow-hidden shadow-xs">
                <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
                  <span>Nhật Ký Hoạt Động Đã Ghi</span>
                  <Activity className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-2xl sm:text-3xl font-black text-white">
                  {stats?.totalActivities || activityLogs.length || 0}
                </div>
                <p className="text-[11px] text-emerald-400/80 font-medium flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping inline-block" />
                  <span>Ghi nhận thời gian, IP và thiết bị</span>
                </p>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-2 relative overflow-hidden shadow-xs">
                <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
                  <span>Trạng Thái Hạ Tầng</span>
                  <Server className="w-4 h-4 text-cyan-400" />
                </div>
                <div className="text-xl sm:text-2xl font-black text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <span>Hoạt Động 100%</span>
                </div>
                <p className="text-[11px] text-slate-500 font-medium">
                  PostgreSQL Cloud · Render WebApp v1.2
                </p>
              </div>
            </div>

            {/* Quick Actions & Recent Logs Preview */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left: Quick Actions */}
              <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
                <h3 className="font-black text-sm text-white uppercase tracking-wider flex items-center gap-2">
                  <Zap className="w-4 h-4 text-pink-500" />
                  <span>Thao Tác Nhanh Quản Trị</span>
                </h3>

                <div className="space-y-2.5">
                  <button
                    type="button"
                    onClick={() => setActiveTab('notifications')}
                    className="w-full p-3.5 rounded-2xl bg-slate-950 border border-slate-800 hover:border-pink-500/40 text-left transition-colors flex items-center justify-between cursor-pointer group"
                  >
                    <div>
                      <h4 className="text-xs font-bold text-white group-hover:text-pink-400 transition-colors">
                        Phát thông báo toàn hệ thống
                      </h4>
                      <p className="text-[11px] text-slate-400">
                        Gửi tin tức, lịch bảo trì hoặc cập nhật tính năng mới
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-pink-400" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('users')}
                    className="w-full p-3.5 rounded-2xl bg-slate-950 border border-slate-800 hover:border-pink-500/40 text-left transition-colors flex items-center justify-between cursor-pointer group"
                  >
                    <div>
                      <h4 className="text-xs font-bold text-white group-hover:text-pink-400 transition-colors">
                        Quản lý & kiểm tra tài khoản khách hàng
                      </h4>
                      <p className="text-[11px] text-slate-400">
                        Xem danh sách học viên, chuỗi Streak và trạng thái khóa/mở
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-pink-400" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('logs')}
                    className="w-full p-3.5 rounded-2xl bg-slate-950 border border-slate-800 hover:border-pink-500/40 text-left transition-colors flex items-center justify-between cursor-pointer group"
                  >
                    <div>
                      <h4 className="text-xs font-bold text-white group-hover:text-pink-400 transition-colors">
                        Theo dõi nhật ký hoạt động thiết bị
                      </h4>
                      <p className="text-[11px] text-slate-400">
                        Kiểm tra thiết bị iPhone, Android, Laptop và IP đăng nhập
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-pink-400" />
                  </button>
                </div>
              </div>

              {/* Right: Recent Activity Logs Preview */}
              <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-black text-sm text-white uppercase tracking-wider flex items-center gap-2">
                    <Activity className="w-4 h-4 text-emerald-400" />
                    <span>Hoạt Động Gần Đây Nhất</span>
                  </h3>
                  <button
                    type="button"
                    onClick={() => setActiveTab('logs')}
                    className="text-xs text-pink-400 hover:underline font-bold"
                  >
                    Xem tất cả
                  </button>
                </div>

                <div className="divide-y divide-slate-800/80">
                  {activityLogs.slice(0, 5).map((log) => (
                    <div key={log.id} className="py-3 flex items-start justify-between gap-3 text-xs">
                      <div className="space-y-0.5 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white truncate max-w-[150px]">
                            {log.user_name || log.user_email}
                          </span>
                          <span className="px-1.5 py-0.2 rounded bg-slate-800 text-pink-400 text-[10px] font-mono">
                            {log.action}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 truncate">
                          {log.device_type} · {log.os_name} ({log.browser_name}) · IP: {log.ip_address}
                        </p>
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono shrink-0">
                        {new Date(log.created_at).toLocaleTimeString('vi-VN')}
                      </span>
                    </div>
                  ))}
                  {activityLogs.length === 0 && (
                    <p className="text-xs text-slate-500 italic py-4 text-center">
                      Chưa có nhật ký hoạt động nào được ghi nhận.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════
            TAB 2: QUẢN LÝ TÀI KHOẢN KHÁCH HÀNG (USERS)
            ══════════════════════════════════════════════════ */}
        {activeTab === 'users' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            {/* Header with Search */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-900 border border-slate-800 rounded-3xl p-4">
              <div>
                <h3 className="font-black text-sm text-white uppercase tracking-wider flex items-center gap-2">
                  <Users className="w-4 h-4 text-pink-500" />
                  <span>Danh Sách Học Viên ({filteredUsers.length})</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Quản lý quyền truy cập, trạng thái và xem tiến độ học tập
                </p>
              </div>

              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Tìm theo tên, email, IP..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-pink-500"
                />
              </div>
            </div>

            {/* Users Table */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950/80 border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Học Viên</th>
                      <th className="py-3 px-4">Đăng Nhập Qua</th>
                      <th className="py-3 px-4">Cấp Độ & XP</th>
                      <th className="py-3 px-4">Thiết Bị Gần Nhất</th>
                      <th className="py-3 px-4">Trạng Thái</th>
                      <th className="py-3 px-4 text-right">Thao Tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {filteredUsers.map((u) => {
                      const isSuperadmin = u.role === 'superadmin' || u.email === 'thuathyperig05@gmail.com';
                      const isBanned = u.status === 'banned';

                      return (
                        <tr key={u.id} className="hover:bg-slate-800/40 transition-colors">
                          {/* User Info */}
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2.5">
                              {u.avatar_url ? (
                                <img
                                  src={u.avatar_url}
                                  alt={u.username}
                                  className="w-7 h-7 rounded-xl object-cover border border-slate-700"
                                />
                              ) : (
                                <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-pink-600 to-rose-500 text-white flex items-center justify-center font-bold text-xs shrink-0">
                                  {(u.username || u.email || 'H').charAt(0).toUpperCase()}
                                </div>
                              )}
                              <div className="min-w-0">
                                <p className="font-bold text-white truncate max-w-[160px]">
                                  {u.username || 'Chưa đặt tên'}
                                </p>
                                <p className="text-[11px] text-slate-400 truncate max-w-[160px] font-mono">
                                  {u.email}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* Provider */}
                          <td className="py-3 px-4">
                            <span className="px-2 py-0.5 rounded-lg bg-slate-800 text-slate-300 font-bold text-[10px] uppercase">
                              {u.auth_provider || 'local'}
                            </span>
                          </td>

                          {/* Level & XP */}
                          <td className="py-3 px-4">
                            <div>
                              <span className="font-bold text-pink-400">{u.level_tier || 'N5'}</span>
                              <p className="text-[10px] text-slate-400">{u.total_xp || 0} XP · {u.current_streak || 0} ngày</p>
                            </div>
                          </td>

                          {/* Last Device & IP */}
                          <td className="py-3 px-4">
                            <p className="text-[11px] text-slate-300 truncate max-w-[180px]">
                              {u.last_device || 'Chưa ghi nhận'}
                            </p>
                            <p className="text-[10px] text-slate-500 font-mono">{u.last_ip || 'N/A'}</p>
                          </td>

                          {/* Status */}
                          <td className="py-3 px-4">
                            {isSuperadmin ? (
                              <span className="px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-400 border border-pink-500/40 text-[10px] font-black uppercase">
                                SuperAdmin
                              </span>
                            ) : isBanned ? (
                              <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/40 text-[10px] font-bold">
                                Bị Khóa
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px] font-bold">
                                Hoạt Động
                              </span>
                            )}
                          </td>

                          {/* Actions */}
                          <td className="py-3 px-4 text-right">
                            {!isSuperadmin && (
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => handleToggleBanUser(u.id, u.status)}
                                  className={`p-1.5 rounded-xl border transition-colors cursor-pointer ${
                                    isBanned
                                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
                                      : 'bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20'
                                  }`}
                                  title={isBanned ? 'Mở khóa tài khoản' : 'Khóa tài khoản này'}
                                >
                                  {isBanned ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleDeleteUser(u.id, u.email)}
                                  className="p-1.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 hover:bg-rose-500/20 transition-colors cursor-pointer"
                                  title="Xóa tài khoản này"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════
            TAB 3: NHẬT KÝ THIẾT BỊ & HOẠT ĐỘNG (AUDIT LOGS)
            ══════════════════════════════════════════════════ */}
        {activeTab === 'logs' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            {/* Filter Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-900 border border-slate-800 rounded-3xl p-4">
              <div>
                <h3 className="font-black text-sm text-white uppercase tracking-wider flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-400" />
                  <span>Nhật Ký Thiết Bị & IP Đăng Nhập ({filteredLogs.length})</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Ghi lại thời gian thực, IP, hệ điều hành (iOS, Android, Windows) và hành động
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <select
                  value={logActionFilter}
                  onChange={(e) => setLogActionFilter(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-pink-500 cursor-pointer"
                >
                  <option value="all">Tất cả hành động</option>
                  {uniqueActions.map((act) => (
                    <option key={act} value={act}>
                      {act}
                    </option>
                  ))}
                </select>

                <div className="relative w-full sm:w-60">
                  <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Tìm IP, email, thiết bị..."
                    value={logSearch}
                    onChange={(e) => setLogSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-pink-500"
                  />
                </div>
              </div>
            </div>

            {/* Logs Table */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950/80 border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Thời Gian</th>
                      <th className="py-3 px-4">Học Viên</th>
                      <th className="py-3 px-4">Hành Động</th>
                      <th className="py-3 px-4">Thiết Bị Sử Dụng</th>
                      <th className="py-3 px-4">Địa Chỉ IP</th>
                      <th className="py-3 px-4">Chi Tiết</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono">
                    {filteredLogs.map((log) => {
                      const isMobile = log.device_type?.toLowerCase().includes('mobile') || log.os_name?.toLowerCase().includes('ios') || log.os_name?.toLowerCase().includes('android');

                      return (
                        <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                          {/* Time */}
                          <td className="py-3 px-4 text-slate-400 text-[11px] whitespace-nowrap">
                            {new Date(log.created_at).toLocaleString('vi-VN')}
                          </td>

                          {/* User */}
                          <td className="py-3 px-4 font-sans">
                            <span className="font-bold text-white block truncate max-w-[150px]">
                              {log.user_name || 'Khách vãng lai'}
                            </span>
                            <span className="text-[10px] text-slate-500 block truncate max-w-[150px] font-mono">
                              {log.user_email || 'guest@webapp'}
                            </span>
                          </td>

                          {/* Action */}
                          <td className="py-3 px-4 font-sans">
                            <span className="px-2 py-0.5 rounded-lg bg-pink-500/15 text-pink-300 border border-pink-500/30 text-[10px] font-bold">
                              {log.action}
                            </span>
                          </td>

                          {/* Device & OS */}
                          <td className="py-3 px-4 font-sans">
                            <div className="flex items-center gap-1.5">
                              {isMobile ? (
                                <Smartphone className="w-3.5 h-3.5 text-pink-400 shrink-0" />
                              ) : (
                                <Laptop className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                              )}
                              <span className="text-slate-200 text-xs">
                                {log.device_type} · {log.os_name}
                              </span>
                            </div>
                            <span className="text-[10px] text-slate-500 block">
                              Trình duyệt: {log.browser_name}
                            </span>
                          </td>

                          {/* IP Address */}
                          <td className="py-3 px-4 text-slate-300 font-mono text-[11px]">
                            {log.ip_address}
                          </td>

                          {/* Details JSON */}
                          <td className="py-3 px-4 text-slate-400 text-[10px] max-w-xs truncate font-mono">
                            {typeof log.details === 'object' ? JSON.stringify(log.details) : log.details || '—'}
                          </td>
                        </tr>
                      );
                    })}
                    {filteredLogs.length === 0 && (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-xs text-slate-500 italic font-sans">
                          Không tìm thấy bản ghi hoạt động nào phù hợp.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════
            TAB 4: THÔNG BÁO TOÀN HỆ THỐNG (NOTIFICATIONS)
            ══════════════════════════════════════════════════ */}
        {activeTab === 'notifications' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start animate-in fade-in duration-200">
            {/* Left: Broadcast Form */}
            <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
              <h3 className="font-black text-sm text-white uppercase tracking-wider flex items-center gap-2">
                <Bell className="w-4 h-4 text-pink-500" />
                <span>Soạn Thông Báo Toàn Hệ Thống</span>
              </h3>

              <form onSubmit={handleCreateNotification} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 block">
                    Tiêu đề thông báo
                  </label>
                  <input
                    type="text"
                    value={notifTitle}
                    onChange={(e) => setNotifTitle(e.target.value)}
                    required
                    placeholder="Ví dụ: Đã nâng cấp phiên bản v1.2..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-pink-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 block">
                    Nội dung thông báo chi tiết
                  </label>
                  <textarea
                    rows={4}
                    value={notifContent}
                    onChange={(e) => setNotifContent(e.target.value)}
                    required
                    placeholder="Nhập thông tin gửi đến toàn thể học viên..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-pink-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300 block">
                      Phân loại
                    </label>
                    <select
                      value={notifType}
                      onChange={(e) => setNotifType(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-pink-500"
                    >
                      <option value="update">Bản cập nhật mới</option>
                      <option value="event">Sự kiện / Lịch thi</option>
                      <option value="info">Thông báo chung</option>
                      <option value="warning">Bảo trì hệ thống</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300 block">
                      Cấp độ áp dụng
                    </label>
                    <select
                      value={notifLevel}
                      onChange={(e) => setNotifLevel(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-pink-500"
                    >
                      <option value="all">Tất cả (N5 - N1)</option>
                      <option value="N5">Chỉ cấp độ N5</option>
                      <option value="N4">Chỉ cấp độ N4</option>
                      <option value="N3">Chỉ cấp độ N3</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submittingNotif}
                  className="w-full py-3 rounded-xl bg-pink-600 hover:bg-pink-500 text-white font-black text-xs uppercase tracking-wider shadow-lotus flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98 disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{submittingNotif ? 'Đang gửi...' : 'Phát Thông Báo Ngay'}</span>
                </button>
              </form>
            </div>

            {/* Right: Broadcast History */}
            <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
              <h3 className="font-black text-sm text-white uppercase tracking-wider">
                Các Thông Báo Đang Hoạt Động ({notificationsList.length})
              </h3>

              <div className="space-y-3">
                {notificationsList.map((notif) => (
                  <div
                    key={notif.id}
                    className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-start justify-between gap-3 group"
                  >
                    <div className="space-y-1 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-white text-xs">{notif.title}</span>
                        <span className="px-1.5 py-0.2 rounded bg-pink-500/20 text-pink-400 text-[10px] font-bold uppercase">
                          {notif.type}
                        </span>
                        <span className="text-[10px] text-slate-500">
                          {new Date(notif.created_at).toLocaleDateString('vi-VN')}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed whitespace-pre-line">
                        {notif.content}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteNotification(notif.id)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer shrink-0"
                      title="Gỡ thông báo này"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
                {notificationsList.length === 0 && (
                  <p className="text-xs text-slate-500 italic py-6 text-center">
                    Chưa có thông báo nào được phát trên hệ thống.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════
            TAB 5: HỖ TRỢ & TRỢ GIÚP KHÁCH HÀNG (FEEDBACKS)
            ══════════════════════════════════════════════════ */}
        {activeTab === 'feedbacks' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5">
              <h3 className="font-black text-sm text-white uppercase tracking-wider flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-pink-500" />
                <span>Ý Kiến Phản Hồi & Yêu Cầu Trợ Giúp ({feedbacksList.length})</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Tiếp nhận từ form hỗ trợ khách hàng. Quản trị viên có thể theo dõi và đánh dấu hoàn tất.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {feedbacksList.map((f) => {
                const isResolved = f.status === 'resolved';

                return (
                  <div
                    key={f.id}
                    className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-3 flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-white text-xs">{f.name}</span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            isResolved
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          }`}
                        >
                          {isResolved ? 'Đã giải quyết' : 'Đang chờ xử lý'}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-[11px] text-slate-400">
                        <span>Email: <strong className="text-slate-300 font-mono">{f.email}</strong></span>
                        {f.phone && <span>SĐT: <strong className="text-slate-300 font-mono">{f.phone}</strong></span>}
                      </div>

                      <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800/80 text-xs text-slate-300 leading-relaxed whitespace-pre-line">
                        <span className="text-[10px] font-bold text-pink-400 uppercase block mb-1">
                          [{f.category || 'Góp ý chung'}]:
                        </span>
                        {f.message}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
                      <span>{new Date(f.created_at).toLocaleString('vi-VN')}</span>
                      <button
                        type="button"
                        onClick={() => handleResolveFeedback(f.id, f.status)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                          isResolved
                            ? 'bg-slate-800 text-slate-400 hover:text-white'
                            : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                        }`}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{isResolved ? 'Mở lại yêu cầu' : 'Đánh dấu đã giải quyết'}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
              {feedbacksList.length === 0 && (
                <div className="col-span-2 py-12 text-center text-xs text-slate-500 italic bg-slate-900 border border-slate-800 rounded-3xl">
                  Chưa có yêu cầu trợ giúp nào từ học viên.
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
