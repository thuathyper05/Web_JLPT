import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Menu,
  Zap,
  Bell,
  User,
  LogOut,
  ChevronDown,
  Check,
  Sparkles,
  Lock
} from 'lucide-react';
import { sounds } from '../services/sounds';

export default function Header({ onOpenMobileMenu = () => {} }) {
  const { currentLevel, setCurrentLevel, gamification, user, openAuth, logout } = useApp();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [levelDropdownOpen, setLevelDropdownOpen] = useState(false);

  const levels = [
    { id: 'N5', title: 'JLPT N5', status: 'ready', desc: 'Sơ cấp 1 • Hoàn chỉnh (1.512 từ)' },
    { id: 'N4', title: 'JLPT N4', status: 'dev', desc: 'Sơ cấp 2 • Đang phát triển' },
    { id: 'N3', title: 'JLPT N3', status: 'dev', desc: 'Trung cấp 1 • Đang phát triển' },
    { id: 'N2', title: 'JLPT N2', status: 'dev', desc: 'Trung cấp 2 • Đang phát triển' },
    { id: 'N1', title: 'JLPT N1', status: 'dev', desc: 'Cao cấp • Đang phát triển' },
  ];

  const handleSelectLevel = (lvlId) => {
    sounds.playFlip();
    setCurrentLevel(lvlId);
    setLevelDropdownOpen(false);
  };

  return (
    <header className="h-16 px-4 md:px-8 bg-white/90 backdrop-blur-md border-b border-pink-100/80 sticky top-0 z-30 flex items-center justify-between">
      {/* Left: Mobile Toggle & Interactive Level Selector Dropdown */}
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

        {/* Level Switcher Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              sounds.playFlip();
              setLevelDropdownOpen(!levelDropdownOpen);
            }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-pink-50 hover:bg-pink-100/80 border border-pink-200/80 shadow-sm transition-all group cursor-pointer"
            title="Nhấn để đổi cấp độ JLPT"
          >
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            <span className="text-xs font-black text-pink-700 tracking-wide uppercase">
              JLPT {currentLevel || 'N5'}
            </span>
            <ChevronDown size={14} className={`text-pink-500 transition-transform ${levelDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Level Dropdown Menu */}
          {levelDropdownOpen && (
            <div
              className="absolute left-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-pink-100 py-2 z-50 animate-in fade-in slide-in-from-top-2"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-4 py-1.5 border-b border-pink-50 flex items-center justify-between">
                <span className="text-[10.5px] font-extrabold text-slate-400 uppercase tracking-wider">
                  CHỌN CẤP ĐỘ JLPT
                </span>
                <span className="text-[10px] text-pink-600 font-bold">5 Cấp độ</span>
              </div>

              <div className="p-1 space-y-1">
                {levels.map((lvl) => {
                  const isCurrent = (currentLevel || 'N5') === lvl.id;
                  return (
                    <button
                      key={lvl.id}
                      type="button"
                      onClick={() => handleSelectLevel(lvl.id)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left transition-all ${
                        isCurrent
                          ? 'bg-pink-50 text-pink-700 font-bold border border-pink-200/60'
                          : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="flex flex-col">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-black">{lvl.title}</span>
                          {lvl.status === 'ready' ? (
                            <span className="px-1.5 py-0.2 rounded-md bg-emerald-100 text-emerald-700 text-[9px] font-extrabold">
                              HOÀN CHỈNH
                            </span>
                          ) : (
                            <span className="px-1.5 py-0.2 rounded-md bg-amber-100 text-amber-700 text-[9px] font-bold flex items-center gap-0.5">
                              <Lock size={9} />
                              <span>SẮP RA MẮT</span>
                            </span>
                          )}
                        </div>
                        <span className="text-[10.5px] text-slate-400 font-medium">
                          {lvl.desc}
                        </span>
                      </div>

                      {isCurrent && (
                        <Check size={16} className="text-pink-600 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
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
          onClick={() => sounds.playFlip()}
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
              onClick={() => {
                sounds.playFlip();
                setProfileDropdownOpen(!profileDropdownOpen);
              }}
              className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-pink-50 hover:bg-pink-100/70 border border-pink-200/70 transition-colors cursor-pointer"
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
                  className="w-full px-4 py-2 text-left text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer"
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
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-pink-600 to-rose-500 hover:from-pink-500 hover:to-rose-600 text-white shadow-lotus text-xs font-bold transition-all hover:scale-105 active:scale-95 cursor-pointer"
          >
            <User size={14} />
            <span>Đăng nhập</span>
          </button>
        )}
      </div>
    </header>
  );
}
