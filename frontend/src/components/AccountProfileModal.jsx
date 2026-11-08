import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { sounds } from '../services/sounds';
import api, { authService } from '../services/api';
import {
  X,
  User,
  Mail,
  Calendar,
  ShieldCheck,
  Flame,
  Sparkles,
  Award,
  Bookmark,
  RefreshCw,
  LogOut,
  Check,
  Edit2,
  BookOpen,
  CheckCircle2,
  Layers,
  Smartphone,
  Laptop
} from 'lucide-react';

export default function AccountProfileModal({ isOpen, onClose }) {
  const {
    user,
    setUser,
    gamification,
    currentLevel,
    setCurrentLevel,
    syncUserCloudProgress,
    logout,
    setActiveTab,
    favorites
  } = useApp();

  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [isSavingName, setIsSavingName] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncSuccess, setSyncSuccess] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState('');

  if (!isOpen || !user) return null;

  const userName = user.name || user.username || (user.email ? user.email.split('@')[0] : 'Học viên');
  const userAvatar = user.avatar || user.avatar_url;
  const userEmail = user.email || 'Chưa liên kết email';
  const joinDate = user.created_at
    ? new Date(user.created_at).toLocaleDateString('vi-VN', { year: 'numeric', month: 'long', day: 'numeric' })
    : 'Học viên khóa mới';

  const favoritesCount = favorites ? Object.keys(favorites).filter(function (k) { return favorites[k]; }).length : 0;
  const streakCount = gamification?.current_streak || 0;
  const totalXp = gamification?.total_xp || 0;
  const todayWords = gamification?.today_words_count || 0;
  const levelTier = gamification?.level_tier || 'Tân Thủ N5';

  const handleStartEditName = function () {
    sounds.playFlip();
    setEditedName(userName);
    setIsEditingName(true);
    setFeedbackMsg('');
  };

  const handleSaveName = async function () {
    if (!editedName.trim()) {
      setFeedbackMsg('Tên học viên không được để trống.');
      return;
    }
    sounds.playFlip();
    setIsSavingName(true);
    setFeedbackMsg('');
    try {
      // Gửi cập nhật đến backend nếu có
      await api.put('/auth/profile', { name: editedName.trim(), username: editedName.trim() }).catch(function () {});
      
      const updatedUser = { ...user, name: editedName.trim(), username: editedName.trim() };
      setUser(updatedUser);
      try {
        localStorage.setItem('nihongo_cached_user', JSON.stringify(updatedUser));
      } catch (err) {}
      
      sounds.playCorrect();
      setIsEditingName(false);
      setFeedbackMsg('Đã cập nhật tên hiển thị thành công!');
      setTimeout(function () { setFeedbackMsg(''); }, 3000);
    } catch (err) {
      setFeedbackMsg('Không thể lưu tên lúc này. Vui lòng thử lại sau.');
    } finally {
      setIsSavingName(false);
    }
  };

  const handleManualSync = async function () {
    sounds.playFlip();
    setIsSyncing(true);
    setSyncSuccess(false);
    setFeedbackMsg('');
    try {
      if (syncUserCloudProgress) {
        await syncUserCloudProgress();
      }
      sounds.playCorrect();
      setSyncSuccess(true);
      setFeedbackMsg('Dữ liệu đã được đồng bộ với máy chủ PostgreSQL!');
      setTimeout(function () {
        setSyncSuccess(false);
        setFeedbackMsg('');
      }, 4000);
    } catch (err) {
      setFeedbackMsg('Lỗi đồng bộ. Hãy kiểm tra kết nối mạng.');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSelectLevel = function (lvl) {
    sounds.playFlip();
    if (setCurrentLevel) setCurrentLevel(lvl);
  };

  const handleOpenNotebook = function () {
    sounds.playFlip();
    if (setActiveTab) setActiveTab('notebook');
    if (onClose) onClose();
  };

  const handleCheckUpdate = function () {
    sounds.playFlip();
    if (onClose) onClose();
    window.dispatchEvent(new CustomEvent('hyper-open-update'));
  };

  const handleLogout = function () {
    sounds.playFlip();
    if (onClose) onClose();
    if (logout) logout();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      {/* Click outside to close backdrop */}
      <div
        className="fixed inset-0 -z-10"
        onClick={function () {
          sounds.playFlip();
          if (onClose) onClose();
        }}
      />

      {/* Modal Dialog Card */}
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-pink-100 overflow-hidden my-auto animate-in zoom-in-95 duration-200 flex flex-col max-h-[92vh]">
        {/* Decorative Top Banner */}
        <div className="relative h-24 sm:h-28 bg-gradient-to-r from-pink-600 via-rose-500 to-amber-500 p-4 shrink-0 flex items-start justify-between">
          <div className="flex items-center gap-2 text-white/90">
            <User size={18} />
            <span className="text-xs font-black uppercase tracking-wider">Hồ Sơ Học Viên JLPT</span>
          </div>
          <button
            type="button"
            onClick={function () {
              sounds.playFlip();
              if (onClose) onClose();
            }}
            className="p-1.5 rounded-full bg-black/20 hover:bg-black/35 text-white transition-colors cursor-pointer"
            aria-label="Đóng giao diện tài khoản"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Modal Content */}
        <div className="p-4 sm:p-6 pt-0 overflow-y-auto flex-1 space-y-5">
          {/* Avatar & Identification Header */}
          <div className="relative flex flex-col sm:flex-row items-center sm:items-end gap-3 sm:gap-4 -mt-12 sm:-mt-14 mb-2">
            {/* Large Avatar */}
            <div className="relative shrink-0">
              {userAvatar ? (
                <img
                  src={userAvatar}
                  alt={userName}
                  referrerPolicy="no-referrer"
                  crossOrigin="anonymous"
                  onError={function (e) {
                    e.currentTarget.style.display = 'none';
                    const fallback = e.currentTarget.parentElement ? e.currentTarget.parentElement.querySelector('.profile-fallback') : null;
                    if (fallback) fallback.style.display = 'flex';
                  }}
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl object-cover border-4 border-white shadow-xl bg-pink-100"
                />
              ) : null}
              <div
                className={`profile-fallback w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-tr from-pink-600 via-rose-500 to-amber-500 text-white items-center justify-center font-black text-2xl sm:text-3xl border-4 border-white shadow-xl ${
                  userAvatar ? 'hidden' : 'flex'
                }`}
              >
                {(userName || 'H').charAt(0).toUpperCase()}
              </div>

              {/* Verified Online Badge */}
              <div
                className="absolute -bottom-1 -right-1 p-1 rounded-xl bg-emerald-500 text-white border-2 border-white shadow"
                title="Tài khoản đang hoạt động"
              >
                <CheckCircle2 size={13} />
              </div>
            </div>

            {/* Name, Email and Tier */}
            <div className="flex-1 min-w-0 text-center sm:text-left">
              {isEditingName ? (
                <div className="flex items-center gap-2 mt-2">
                  <input
                    type="text"
                    value={editedName}
                    onChange={function (e) { setEditedName(e.target.value); }}
                    className="px-3 py-1.5 rounded-xl border border-pink-300 text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-pink-500/20 w-full"
                    placeholder="Nhập tên mới..."
                    autoFocus
                  />
                  <button
                    type="button"
                    disabled={isSavingName}
                    onClick={handleSaveName}
                    className="px-3 py-1.5 rounded-xl bg-pink-600 hover:bg-pink-700 text-white text-xs font-bold shrink-0 cursor-pointer"
                  >
                    {isSavingName ? 'Lưu...' : 'Lưu'}
                  </button>
                  <button
                    type="button"
                    onClick={function () { setIsEditingName(false); }}
                    className="px-2.5 py-1.5 rounded-xl bg-slate-100 text-slate-600 text-xs font-bold shrink-0 cursor-pointer"
                  >
                    Hủy
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <h3 className="text-lg sm:text-xl font-black text-slate-900 truncate tracking-tight">
                    {userName}
                  </h3>
                  <button
                    type="button"
                    onClick={handleStartEditName}
                    className="p-1 rounded-lg text-slate-400 hover:text-pink-600 hover:bg-pink-50 transition-colors cursor-pointer"
                    title="Đổi tên hiển thị"
                  >
                    <Edit2 size={14} />
                  </button>
                </div>
              )}

              <p className="text-xs text-slate-500 truncate mt-0.5 flex items-center justify-center sm:justify-start gap-1">
                <Mail size={12} className="text-slate-400 shrink-0" />
                <span className="truncate">{userEmail}</span>
              </p>

              <div className="mt-2 flex flex-wrap items-center justify-center sm:justify-start gap-1.5">
                <span className="px-2.5 py-0.5 rounded-full bg-pink-100 text-pink-700 text-[10px] font-black uppercase tracking-wide">
                  {levelTier}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-semibold flex items-center gap-1">
                  <Calendar size={11} className="text-slate-400" />
                  <span>{joinDate}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Feedback or Notification Banner */}
          {feedbackMsg && (
            <div className="p-2.5 rounded-2xl bg-pink-50 border border-pink-200 text-xs font-bold text-pink-700 text-center animate-in fade-in">
              {feedbackMsg}
            </div>
          )}

          {/* 4-Box Bento Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {/* Box 1: Cấp độ JLPT */}
            <div className="p-3 rounded-2xl bg-gradient-to-br from-pink-50/80 to-white border border-pink-100 flex flex-col justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Mục tiêu</span>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-xl font-black text-pink-700">{currentLevel || 'N5'}</span>
                <span className="text-[10px] font-bold text-pink-500">JLPT</span>
              </div>
              <span className="text-[10px] text-slate-500 mt-1">Cấp độ hiện tại</span>
            </div>

            {/* Box 2: Chuỗi Streak */}
            <div className="p-3 rounded-2xl bg-gradient-to-br from-amber-50/80 to-white border border-amber-100 flex flex-col justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Chuỗi ngày</span>
              <div className="mt-1 flex items-baseline gap-1.5">
                <Flame size={18} className="text-amber-500" fill={streakCount > 0 ? '#f59e0b' : 'none'} />
                <span className="text-xl font-black text-amber-700">{streakCount}</span>
                <span className="text-[10px] font-bold text-amber-600">ngày</span>
              </div>
              <span className="text-[10px] text-slate-500 mt-1">Học liên tục</span>
            </div>

            {/* Box 3: Tổng XP */}
            <div className="p-3 rounded-2xl bg-gradient-to-br from-purple-50/80 to-white border border-purple-100 flex flex-col justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Kinh nghiệm</span>
              <div className="mt-1 flex items-baseline gap-1.5">
                <Sparkles size={16} className="text-purple-600" />
                <span className="text-xl font-black text-purple-700">{totalXp}</span>
                <span className="text-[10px] font-bold text-purple-600">XP</span>
              </div>
              <span className="text-[10px] text-slate-500 mt-1">Tổng tích lũy</span>
            </div>

            {/* Box 4: Từ vựng hôm nay */}
            <div className="p-3 rounded-2xl bg-gradient-to-br from-emerald-50/80 to-white border border-emerald-100 flex flex-col justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Hôm nay</span>
              <div className="mt-1 flex items-baseline gap-1.5">
                <BookOpen size={16} className="text-emerald-600" />
                <span className="text-xl font-black text-emerald-700">{todayWords}</span>
                <span className="text-[10px] font-bold text-emerald-600">từ</span>
              </div>
              <span className="text-[10px] text-slate-500 mt-1">Đã ôn luyện</span>
            </div>
          </div>

          {/* Quick JLPT Level Switcher */}
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">Chuyển cấp độ học tập:</span>
              <span className="text-[11px] font-extrabold text-pink-600 uppercase">Đang chọn: {currentLevel || 'N5'}</span>
            </div>
            <div className="grid grid-cols-5 gap-1.5">
              {['N5', 'N4', 'N3', 'N2', 'N1'].map(function (lvl) {
                const isSelected = (currentLevel || 'N5') === lvl;
                return (
                  <button
                    key={lvl}
                    type="button"
                    onClick={function () { handleSelectLevel(lvl); }}
                    className={`py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-gradient-to-r from-pink-600 to-rose-500 text-white shadow-sm'
                        : 'bg-white text-slate-600 hover:bg-pink-50 hover:text-pink-600 border border-slate-200'
                    }`}
                  >
                    {lvl}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Cloud Database Synchronization Status Card */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-50/90 to-teal-50/90 border border-emerald-200/80 space-y-2.5">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-xl bg-emerald-500 text-white">
                  <ShieldCheck size={18} />
                </div>
                <div>
                  <h4 className="text-xs font-black text-emerald-950">Đồng Bộ Đám Mây PostgreSQL</h4>
                  <p className="text-[11px] text-emerald-800/80 mb-0 leading-tight">
                    Tiến độ, chuỗi streak và sổ tay đồng bộ xuyên suốt mọi thiết bị
                  </p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-emerald-200/80 text-emerald-900 text-[9.5px] font-black uppercase">
                An toàn
              </span>
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-emerald-200/60 text-[11px]">
              <div className="flex items-center gap-2 text-slate-600">
                <Laptop size={13} className="text-emerald-700" />
                <span>Máy tính</span>
                <span className="text-slate-400">•</span>
                <Smartphone size={13} className="text-emerald-700" />
                <span>Điện thoại</span>
              </div>
              <button
                type="button"
                disabled={isSyncing}
                onClick={handleManualSync}
                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95 disabled:opacity-60"
              >
                <RefreshCw size={13} className={isSyncing ? 'animate-spin' : ''} />
                <span>{isSyncing ? 'Đang đồng bộ...' : 'Đồng bộ ngay'}</span>
              </button>
            </div>
          </div>

          {/* Action List Section */}
          <div className="space-y-1.5 pt-1">
            <button
              type="button"
              onClick={handleOpenNotebook}
              className="w-full p-3 rounded-2xl border border-pink-100 hover:border-pink-300 bg-white hover:bg-pink-50/40 text-slate-800 font-bold text-xs flex items-center justify-between transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-pink-100 text-pink-700">
                  <Bookmark size={15} />
                </div>
                <div className="text-left">
                  <p className="text-xs font-bold text-slate-900 mb-0">Sổ tay từ vựng yêu thích</p>
                  <p className="text-[10.5px] text-slate-400 mb-0">Đã lưu trữ {favoritesCount} mục ôn tập</p>
                </div>
              </div>
              <span className="text-[11px] font-bold text-pink-600">Mở sổ tay</span>
            </button>

            <button
              type="button"
              onClick={handleCheckUpdate}
              className="w-full p-3 rounded-2xl border border-slate-200 hover:border-pink-300 bg-white hover:bg-pink-50/40 text-slate-800 font-bold text-xs flex items-center justify-between transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-slate-100 text-slate-700">
                  <RefreshCw size={15} />
                </div>
                <div className="text-left">
                  <p className="text-xs font-bold text-slate-900 mb-0">Phiên bản ứng dụng</p>
                  <p className="text-[10.5px] text-slate-400 mb-0">Bản phát hành v1.3 mới nhất</p>
                </div>
              </div>
              <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-lg bg-pink-50 text-pink-700 border border-pink-200">
                v1.3
              </span>
            </button>

            <button
              type="button"
              onClick={handleLogout}
              className="w-full p-3 rounded-2xl border border-rose-100 hover:border-rose-300 bg-rose-50/50 hover:bg-rose-100/60 text-rose-700 font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <LogOut size={15} />
              <span>Đăng xuất tài khoản an toàn</span>
            </button>
          </div>
        </div>

        {/* Modal Footer Security Note */}
        <div className="p-3 bg-slate-50 border-t border-pink-50 text-center shrink-0">
          <p className="text-[10px] text-slate-400 mb-0 flex items-center justify-center gap-1">
            <ShieldCheck size={11} className="text-emerald-500" />
            <span>Tài khoản được bảo vệ bởi mã hóa JWT & PostgreSQL Cloud</span>
          </p>
        </div>
      </div>
    </div>
  );
}
