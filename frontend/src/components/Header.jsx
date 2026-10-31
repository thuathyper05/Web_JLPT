import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { vocabService, speakJapanese } from '../services/api';
import {
  Menu,
  Zap,
  Bell,
  User,
  LogOut,
  ChevronDown,
  Check,
  Sparkles,
  Lock,
  Search,
  X,
  Volume2,
  BookOpen,
  ArrowRight,
  Flame,
  Sprout,
  CheckCheck,
  Bookmark,
  Award
} from 'lucide-react';
import { sounds } from '../services/sounds';

export default function Header({ onOpenMobileMenu = () => {} }) {
  const { currentLevel, setCurrentLevel, gamification, user, openAuth, logout, setActiveTab, askAi } = useApp();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [levelDropdownOpen, setLevelDropdownOpen] = useState(false);

  // Header Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [allVocabs, setAllVocabs] = useState([]);
  const searchRef = useRef(null);

  // Notification State
  const [notificationOpen, setNotificationOpen] = useState(false);
  const notificationRef = useRef(null);
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: 'Duy trì chuỗi ngày học',
      message: 'Bạn đang có chuỗi 12 ngày học liên tiếp! Hãy học thêm 10 từ hôm nay để giữ chuỗi.',
      time: '10 phút trước',
      read: false,
      tab: 'lessons',
      type: 'streak',
      icon: Flame,
      color: 'text-amber-500 bg-amber-50 border-amber-200'
    },
    {
      id: 2,
      title: 'Vườn Zen Bonsai cần tưới nước',
      message: 'Cây Bonsai N5 của bạn cần 1 gáo nước hôm nay để duy trì độ ẩm và nhận +15 XP.',
      time: '1 giờ trước',
      read: false,
      tab: 'garden',
      type: 'garden',
      icon: Sprout,
      color: 'text-emerald-600 bg-emerald-50 border-emerald-200'
    },
    {
      id: 3,
      title: 'AI Sensei: Phân tích lỗi sai',
      message: 'Sensei đã tổng hợp các từ vựng bạn hay nhầm trong sổ tay. Nhấn để xem giải thích.',
      time: '3 giờ trước',
      read: false,
      tab: 'notebook',
      type: 'ai',
      icon: Sparkles,
      color: 'text-pink-600 bg-pink-50 border-pink-200'
    },
    {
      id: 4,
      title: 'Thử thách Nối Từ 60s',
      message: 'Kỷ lục mới đang chờ bạn! Ghép 12 cặp từ vựng N5 nhanh nhất để nhận huy hiệu.',
      time: 'Hôm qua',
      read: true,
      tab: 'wordmatch',
      type: 'game',
      icon: Zap,
      color: 'text-purple-600 bg-purple-50 border-purple-200'
    }
  ]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const levels = [
    { id: 'N5', title: 'JLPT N5', status: 'ready', desc: 'Sơ cấp 1 • Hoàn chỉnh (1.512 từ)' },
    { id: 'N4', title: 'JLPT N4', status: 'ready', desc: 'Sơ cấp 2 • Dữ liệu Trợ từ & Cấu trúc' },
    { id: 'N3', title: 'JLPT N3', status: 'ready', desc: 'Trung cấp 1 • Dữ liệu Trợ từ & Cấu trúc' },
    { id: 'N2', title: 'JLPT N2', status: 'dev', desc: 'Trung cấp 2 • Đang phát triển' },
    { id: 'N1', title: 'JLPT N1', status: 'dev', desc: 'Cao cấp • Đang phát triển' },
  ];

  // AI Smart search topics chips
  const aiSearchChips = [
    { label: '50 Động từ hay gặp', query: 'tabemasu' },
    { label: 'Tính từ cảm xúc & thời tiết', query: 'samui' },
    { label: 'Trợ từ は / が / に / で', query: 'は' },
    { label: 'Từ vựng nghề nghiệp & xưng hô', query: 'ginkouin' }
  ];

  // Pre-load vocabs for instant header search
  useEffect(() => {
    const loadVocabs = async () => {
      try {
        const res = await vocabService.getVocabularies({});
        setAllVocabs(res.data?.data || []);
      } catch (err) {
        console.error('Header search prefetch error:', err);
      }
    };
    loadVocabs();
  }, []);

  // Filter search results in realtime
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const q = searchQuery.toLowerCase().trim();
    const matched = allVocabs.filter((w) => {
      return (
        (w.kanji && w.kanji.toLowerCase().includes(q)) ||
        (w.kana && w.kana.toLowerCase().includes(q)) ||
        (w.clean_kana && w.clean_kana.toLowerCase().includes(q)) ||
        (w.romaji && w.romaji.toLowerCase().includes(q)) ||
        (w.vietnamese && w.vietnamese.toLowerCase().includes(q)) ||
        (w.clean_vietnamese && w.clean_vietnamese.toLowerCase().includes(q))
      );
    }).slice(0, 6); // Top 6 instant results

    setSearchResults(matched);
  }, [searchQuery, allVocabs]);

  // Click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setSearchOpen(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(e.target)) {
        setNotificationOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectLevel = (lvlId) => {
    sounds.playFlip();
    setCurrentLevel(lvlId);
    setLevelDropdownOpen(false);
  };

  const handleViewFullDictionary = () => {
    sounds.playFlip();
    setSearchOpen(false);
    setMobileSearchOpen(false);
    setActiveTab('dictionary');
  };

  const handleNotificationClick = (item) => {
    sounds.playFlip();
    setNotifications((prev) =>
      prev.map((n) => (n.id === item.id ? { ...n, read: true } : n))
    );
    setNotificationOpen(false);
    if (item.tab) {
      setActiveTab(item.tab);
    }
  };

  const handleMarkAllRead = () => {
    sounds.playCorrect();
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <header className="h-16 px-3 sm:px-6 md:px-8 bg-white/95 backdrop-blur-md border-b border-pink-100/80 sticky top-0 z-30 flex items-center justify-between gap-2">
      {/* ── LEFT: MOBILE TOGGLE & LEVEL SELECTOR ── */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          className="lg:hidden p-1.5 sm:p-2 rounded-xl text-slate-600 hover:text-pink-600 hover:bg-pink-50 transition-colors cursor-pointer"
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
            className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-full bg-pink-50 hover:bg-pink-100/80 border border-pink-200/80 shadow-sm transition-all group cursor-pointer"
            title="Nhấn để đổi cấp độ JLPT"
          >
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            <span className="text-[11px] sm:text-xs font-black text-pink-700 tracking-wide uppercase">
              JLPT {currentLevel || 'N5'}
            </span>
            <ChevronDown size={13} className={`text-pink-500 transition-transform ${levelDropdownOpen ? 'rotate-180' : ''}`} />
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
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left transition-all cursor-pointer ${
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
                              SẴN SÀNG
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

      {/* ── CENTER: TRA CỨU TỪ VỰNG TỨC THÌ (SEARCH ON HEADER) ── */}
      <div ref={searchRef} className="flex-1 max-w-md mx-2 sm:mx-4 relative">
        {/* Desktop / Tablet Search Bar */}
        <div className="hidden sm:flex items-center relative">
          <Search size={15} className="absolute left-3.5 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Tra cứu từ vựng (Kanji, Romaji, nghĩa tiếng Việt)..."
            value={searchQuery}
            onFocus={() => setSearchOpen(true)}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setSearchOpen(true);
            }}
            className="w-full pl-9 pr-8 py-1.5 rounded-full border border-pink-200/80 bg-pink-50/30 hover:bg-pink-50/50 focus:bg-white text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-pink-500/30 focus:border-pink-500 transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X size={13} />
            </button>
          )}
        </div>

        {/* Mobile Search Toggle Icon */}
        <div className="sm:hidden flex justify-end">
          <button
            type="button"
            onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
            className="p-2 rounded-xl text-slate-600 hover:text-pink-600 hover:bg-pink-50 cursor-pointer"
            title="Tra cứu từ vựng"
          >
            <Search size={18} />
          </button>
        </div>

        {/* Mobile Expanded Search Bar Overlay */}
        {mobileSearchOpen && (
          <div className="sm:hidden absolute top-12 left-0 right-0 bg-white p-3 rounded-2xl shadow-xl border border-pink-100 z-50 space-y-2 animate-in fade-in">
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                autoFocus
                placeholder="Nhập từ vựng N5..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setSearchOpen(true);
                }}
                className="w-full pl-9 pr-8 py-2 rounded-xl border border-pink-200 bg-pink-50/20 text-xs focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
              <button
                type="button"
                onClick={() => setMobileSearchOpen(false)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 p-1 cursor-pointer"
              >
                <X size={15} />
              </button>
            </div>
          </div>
        )}

        {/* Instant Search Results Dropdown */}
        {searchOpen && (
          <div className="absolute top-10 sm:top-11 left-0 right-0 bg-white rounded-2xl shadow-2xl border border-pink-100 p-3 z-50 animate-in fade-in slide-in-from-top-1 max-h-96 overflow-y-auto">
            {/* AI Smart Suggestion Chips */}
            {!searchQuery.trim() ? (
              <div className="space-y-2.5 py-1">
                <div className="flex items-center gap-1.5 text-[11px] font-extrabold text-pink-700 uppercase tracking-wider">
                  <Sparkles size={13} className="text-pink-600" />
                  <span>GỢI Ý TÌM KIẾM TỪ AI SENSEI</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {aiSearchChips.map((chip, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        sounds.playFlip();
                        setSearchQuery(chip.query);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-pink-50 hover:bg-pink-100/80 text-pink-700 text-[11px] font-bold border border-pink-200/70 transition-colors cursor-pointer"
                    >
                      {chip.label}
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-slate-400 pt-1 mb-0">
                  Gõ Kanji, Hiragana hoặc nghĩa tiếng Việt để tra cứu tức thì 1.512 từ vựng N5.
                </p>
              </div>
            ) : (
              <div>
                <div className="px-2 py-1 border-b border-pink-50 flex justify-between items-center text-[10.5px] font-bold text-slate-400 uppercase">
                  <span>Kết quả tra cứu nhanh</span>
                  <span className="text-pink-600">{searchResults.length} từ khớp</span>
                </div>

                {searchResults.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-500 space-y-2">
                    <p className="font-semibold mb-0">Không tìm thấy từ vựng trực tiếp cho "{searchQuery}"</p>
                    <button
                      type="button"
                      onClick={() => {
                        setSearchOpen(false);
                        askAi(
                          'free_question',
                          { query: searchQuery },
                          `AI Phân Tích Cụm Từ: 「${searchQuery}」`
                        );
                      }}
                      className="px-3.5 py-1.5 rounded-xl bg-pink-50 hover:bg-pink-100 text-pink-700 font-bold border border-pink-200 inline-flex items-center gap-1.5 cursor-pointer transition-colors"
                    >
                      <Sparkles size={14} className="text-pink-600" />
                      <span>Nhờ AI giải thích nghĩa & ngữ cảnh cho cụm từ này</span>
                    </button>
                  </div>
                ) : (
                  <div className="divide-y divide-pink-50">
                    {searchResults.map((word) => (
                      <div
                        key={word.id}
                        className="p-2.5 hover:bg-pink-50/40 rounded-xl transition-colors flex items-center justify-between gap-2"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-jp font-black text-sm text-slate-900">
                              {word.kanji || word.clean_kana || word.kana}
                            </span>
                            <span className="font-jp text-[11px] text-pink-600 font-bold">
                              {word.clean_kana || word.kana}
                            </span>
                            <span className="px-1.5 py-0.2 rounded bg-pink-50 text-[9px] font-extrabold text-pink-700 border border-pink-100">
                              Bài {word.lesson_number}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 truncate mt-0.5 mb-0">
                            {word.clean_vietnamese || word.vietnamese}
                          </p>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => speakJapanese(word.kanji || word.clean_kana || word.kana)}
                            className="p-1.5 rounded-lg bg-pink-50 text-pink-600 hover:bg-pink-100 transition-colors cursor-pointer"
                            title="Nghe phát âm"
                          >
                            <Volume2 size={13} />
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setSearchOpen(false);
                              askAi('explain_vocab', word, `AI: Phân Tích 「${word.kanji || word.kana}」`);
                            }}
                            className="p-1.5 rounded-lg bg-white border border-pink-200 text-pink-600 hover:bg-pink-50 transition-colors cursor-pointer"
                            title="Hỏi AI"
                          >
                            <Sparkles size={13} />
                          </button>
                        </div>
                      </div>
                    ))}

                    <button
                      type="button"
                      onClick={handleViewFullDictionary}
                      className="w-full pt-2.5 pb-1 text-center text-xs font-bold text-pink-600 hover:text-pink-800 hover:underline flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <span>Xem chi tiết trong Từ điển N5 đầy đủ</span>
                      <ArrowRight size={13} />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── RIGHT: XP POINTS, NOTIFICATIONS, USER ACCOUNT ── */}
      <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
        {/* XP Points Pill */}
        <div
          className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200/70 text-amber-800 shadow-sm cursor-pointer hover:bg-amber-100/60 transition-colors"
          title="Điểm kinh nghiệm học tập tích lũy"
        >
          <Zap size={13} className="text-amber-500" fill="#f59e0b" />
          <span className="text-[11px] sm:text-xs font-extrabold tracking-tight">
            {gamification?.total_xp ? gamification.total_xp.toLocaleString() : '1.240'} XP
          </span>
        </div>

        {/* Notifications Button & Dropdown */}
        <div ref={notificationRef} className="relative">
          <button
            type="button"
            onClick={() => {
              sounds.playFlip();
              setNotificationOpen(!notificationOpen);
            }}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:text-pink-600 hover:border-pink-200 hover:bg-pink-50/50 transition-all relative cursor-pointer"
            title="Trung tâm thông báo học tập"
          >
            <Bell size={15} />
            {unreadCount > 0 && (
              <span className="w-2 h-2 rounded-full bg-pink-600 absolute top-1.5 right-1.5 ring-2 ring-white animate-pulse" />
            )}
          </button>

          {/* Interactive Notification Center Dropdown */}
          {notificationOpen && (
            <div
              className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-3xl shadow-2xl border border-pink-100 py-3 z-50 animate-in fade-in slide-in-from-top-2"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="px-4 pb-2.5 border-b border-pink-50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider mb-0">
                    THÔNG BÁO HỌC TẬP
                  </h4>
                  {unreadCount > 0 && (
                    <span className="px-2 py-0.2 rounded-full bg-pink-100 text-pink-700 text-[10px] font-black">
                      {unreadCount} mới
                    </span>
                  )}
                </div>

                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={handleMarkAllRead}
                    className="text-[11px] font-bold text-pink-600 hover:text-pink-800 flex items-center gap-1 cursor-pointer"
                  >
                    <CheckCheck size={12} />
                    <span>Đã đọc tất cả</span>
                  </button>
                )}
              </div>

              {/* Notification Items List */}
              <div className="divide-y divide-pink-50/60 max-h-80 overflow-y-auto">
                {notifications.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.id}
                      onClick={() => handleNotificationClick(item)}
                      className={`p-3.5 hover:bg-pink-50/50 transition-all cursor-pointer flex gap-3 items-start ${
                        !item.read ? 'bg-pink-50/20' : ''
                      }`}
                    >
                      <div
                        className={`w-9 h-9 rounded-2xl border flex items-center justify-center shrink-0 ${item.color}`}
                      >
                        <Icon size={17} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1 mb-0.5">
                          <h5 className="text-xs font-bold text-slate-900 truncate mb-0">
                            {item.title}
                          </h5>
                          {!item.read && (
                            <span className="w-1.5 h-1.5 rounded-full bg-pink-600 shrink-0" />
                          )}
                        </div>
                        <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed mb-1">
                          {item.message}
                        </p>
                        <span className="text-[10px] font-medium text-slate-400">
                          {item.time}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Dropdown Footer */}
              <div className="px-4 pt-2.5 border-t border-pink-50 text-center">
                <span className="text-[10.5px] font-bold text-slate-400">
                  NihongoHub AI • Hệ thống nhắc nhở thông minh
                </span>
              </div>
            </div>
          )}
        </div>

        {/* User Account / Login Pill */}
        {user ? (
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                sounds.playFlip();
                setProfileDropdownOpen(!profileDropdownOpen);
              }}
              className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-2.5 py-1 rounded-full bg-pink-50 hover:bg-pink-100/70 border border-pink-200/70 transition-colors cursor-pointer"
            >
              <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-pink-600 text-white font-bold text-xs flex items-center justify-center">
                {user.username?.charAt(0).toUpperCase() || 'U'}
              </div>
              <span className="text-xs font-bold text-slate-800 max-w-[80px] truncate hidden md:inline">
                {user.username}
              </span>
              <ChevronDown size={13} className="text-slate-400" />
            </button>

            {/* Dropdown Menu */}
            {profileDropdownOpen && (
              <div
                className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-pink-100 py-1.5 z-50 animate-in fade-in slide-in-from-top-2"
                onClick={() => setProfileDropdownOpen(false)}
              >
                <div className="px-4 py-2 border-b border-slate-100">
                  <p className="text-xs font-bold text-slate-800 truncate mb-0">{user.username}</p>
                  <p className="text-[11px] text-slate-400 truncate mb-0">{user.email}</p>
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
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-pink-600 to-rose-500 hover:from-pink-500 hover:to-rose-600 text-white shadow-lotus text-xs font-bold transition-all hover:scale-105 active:scale-95 cursor-pointer"
          >
            <User size={13} />
            <span className="hidden xs:inline">Đăng nhập</span>
          </button>
        )}
      </div>
    </header>
  );
}