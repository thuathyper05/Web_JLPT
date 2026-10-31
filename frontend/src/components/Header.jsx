import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Menu,
  Zap,
  Bell,
  User,
  LogOut,
  ChevronDown
} from 'lucide-react';

export default function Header({ onOpenMobileMenu = () => {} }) {
  const { currentLevel, setCurrentLevel, gamification, user, openAuth, logout } = useApp();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  return (
    <header className="h-16 px-4 md:px-8 bg-white/90 backdrop-blur-md border-b border-pink-100/80 sticky top-0 z-30 flex items-center justify-between">
      {/* Left: Mobile Toggle & Level Selector Pill */}
      <div className="flex items-center gap-3">
        {/* Mobile Hamburger Button */}
        <button
          type="button"
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-pink-600 hover:bg-pink-50 transition-colors"
          aria-label="Mở menu"
        >
          <Menu size={22} />
        </button>

        {/* Level Indicator Pill */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-pink-50/80 border border-pink-200/60 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
          <span className="text-xs font-bold text-pink-700 tracking-wide uppercase">
            JLPT {currentLevel || 'N5'}
          </span>
        </div>
      </div>

      {/* Right: XP Points, Notifications, User Account */}
      <div className="flex items-center gap-2.5 sm:gap-3.5">
        {/* XP Points Pill */}
        <div
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200/70 text-amber-800 shadow-sm cursor-pointer hover:bg-amber-100/60 transition-colors"
          title="Điểm kinh nghiệm học tập tích lũy"
        >
          <Zap size={14} className="text-amber-500" fill="#f59e0b" />
          <span className="text-xs font-extrabold tracking-tight">
            {gamification?.total_xp ? gamification.total_xp.toLocaleString() : '1.240'} XP
          </span>
        </div>

        {/* Notifications Button */}
        <button
          type="button"
          className="w-9 h-9 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:text-pink-600 hover:border-pink-200 hover:bg-pink-50/50 transition-all relative"
          title="Thông báo hệ thống"
        >
          <Bell size={16} />
          <span className="w-2 h-2 rounded-full bg-pink-600 absolute top-1.5 right-1.5 ring-2 ring-white" />
        </button>

        {/* User Account / Login Pill */}
        {user ? (
          <div className="relative">
            <button
              type="button"
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-pink-50 hover:bg-pink-100/70 border border-pink-200/70 transition-colors"
            >
              <div className="w-7 h-7 rounded-lg bg-pink-600 text-white font-bold text-xs flex items-center justify-center">
                {user.username?.charAt(0).toUpperCase() || 'U'}
              </div>
              <span className="text-xs font-bold text-slate-800 max-w-[90px] truncate hidden sm:inline">
                {user.username}
              </span>
              <ChevronDown size={14} className="text-slate-400" />
            </button>

            {/* Dropdown Menu */}
            {profileDropdownOpen && (
              <div
                className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-pink-100 py-1.5 z-50 animate-in fade-in slide-in-from-top-2"
                onClick={() => setProfileDropdownOpen(false)}
              >
                <div className="px-4 py-2 border-b border-slate-100">
                  <p className="text-xs font-bold text-slate-800 truncate">{user.username}</p>
                  <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                </div>
                <button
                  type="button"
                  onClick={logout}
                  className="w-full px-4 py-2 text-left text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-2"
                >
                  <LogOut size={14} />
                  <span>Đăng xuất</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <button
            type="button"
            onClick={() => openAuth('login')}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-pink-600 to-rose-500 text-white font-bold text-xs shadow-lotus-sm hover:shadow-lotus hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <div className="w-5 h-5 rounded-md bg-white/20 text-white font-bold text-[10px] flex items-center justify-center">
              K
            </div>
            <span>Khách (Đăng nhập)</span>
          </button>
        )}
      </div>
    </header>
  );
}
