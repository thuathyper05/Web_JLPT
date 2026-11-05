import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { vocabService, dictionaryService, speakJapanese } from '../services/api';
import FuriganaWord from './FuriganaWord';
import SakuraPulse from './SakuraPulse';
import {
  Menu,
  RefreshCw,
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
  Flame,
  Sprout,
  CheckCheck,
  Bookmark,
  Award,
  Crown,
  Clock,
  Filter,
  Layers,
  Loader2,
  Star
} from 'lucide-react';
import { sounds } from '../services/sounds';

export default function Header({ onOpenMobileMenu = () => {} }) {
  const {
    currentLevel,
    setCurrentLevel,
    gamification,
    user,
    openAuth,
    logout,
    setActiveTab,
    askAi,
    userPerks,
    favorites,
    toggleFavorite,
    isFavorite
  } = useApp();

  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [levelDropdownOpen, setLevelDropdownOpen] = useState(false);

  // ── ADVANCED DICTIONARY SEARCH STATE (N5 - N1) ──
  const [searchQuery, setSearchQuery] = useState('');
  const [searchLevel, setSearchLevel] = useState('ALL'); // 'ALL' | 'N5' | 'N4' | 'N3' | 'N2' | 'N1'
  const [searchType, setSearchType] = useState('all'); // 'all' | 'vocab' | 'kanji' | 'grammar'
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchResults, setSearchResults] = useState({
    vocabularies: [],
    kanji: [],
    grammar: [],
    counts: { total: 0, vocab: 0, kanji: 0, grammar: 0 }
  });
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const searchRef = useRef(null);
  const searchInputRef = useRef(null);
  const mobileInputRef = useRef(null);

  // Recent Searches history in localStorage
  const [recentSearches, setRecentSearches] = useState(() => {
    try {
      const saved = localStorage.getItem('nihongo_recent_searches');
      return saved ? JSON.parse(saved) : ['tabemasu', 'gakkou', 'máy bay', 'nhà ga', 'học'];
    } catch {
      return ['tabemasu', 'gakkou', 'máy bay'];
    }
  });

  // Notification State
  const [notificationOpen, setNotificationOpen] = useState(false);
  const notificationRef = useRef(null);
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: 'Duy trì chuỗi ngày học',
      message: 'Bạn đang có chuỗi học tập đều đặn! Hãy học thêm từ vựng hôm nay để giữ chuỗi.',
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
      message: 'Cây Bonsai của bạn cần tưới nước hôm nay để duy trì độ ẩm 100% và phát triển xanh tốt.',
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
      message: 'Sensei đã sẵn sàng giải đáp mọi thắc mắc từ vựng và ngữ pháp cho bạn.',
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
      message: 'Kỷ lục mới đang chờ bạn! Ghép các cặp từ vựng nhanh nhất để nhận thêm điểm thưởng.',
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
    { id: 'N5', title: 'Cấp độ N5', badge: 'Căn bản', status: 'ready', desc: 'Minna no Nihongo I (Bài 1 - 25)' },
    { id: 'N4', title: 'Cấp độ N4', badge: 'Sơ cấp', status: 'ready', desc: 'Minna no Nihongo II (Bài 26 - 50)' },
    { id: 'N3', title: 'Cấp độ N3', badge: 'Trung cấp', status: 'ready', desc: 'Soumatome & Shinkanzen Master' },
    { id: 'N2', title: 'Cấp độ N2', badge: 'Cao cấp', status: 'ready', desc: 'Báo chí & Hội thoại thương mại' },
    { id: 'N1', title: 'Cấp độ N1', badge: 'Thượng cấp', status: 'ready', desc: 'Học thuật & Đỉnh cao tiếng Nhật' },
  ];

  // Popular search recommendations across N5 - N1
  const popularTopics = [
    { label: '50 Động từ hay gặp', query: 'tabemasu', level: 'N5' },
    { label: 'Trường học & Học tập', query: 'gakkou', level: 'N5' },
    { label: 'Thời tiết & Cảm xúc', query: 'samui', level: 'N5' },
    { label: 'Kinh tế & Thương mại', query: 'keizai', level: 'N2' },
    { label: 'Hội nghị & Cuộc họp', query: 'kaigi', level: 'N4' },
    { label: 'Xã hội & Môi trường', query: 'kankyou', level: 'N1' },
    { label: 'Chữ Hán: Sinh (生)', query: '生', level: 'ALL' },
    { label: 'Ngữ pháp: ～てから', query: 'てから', level: 'N5' }
  ];

  // Save recent search term to localStorage
  const saveRecentSearch = useCallback((term) => {
    if (!term || !term.trim()) return;
    const clean = term.trim();
    setRecentSearches((prev) => {
      const next = [clean, ...prev.filter((t) => t.toLowerCase() !== clean.toLowerCase())].slice(0, 8);
      try {
        localStorage.setItem('nihongo_recent_searches', JSON.stringify(next));
      } catch {}
      return next;
    });
  }, []);

  const clearRecentSearches = useCallback(() => {
    setRecentSearches([]);
    try {
      localStorage.removeItem('nihongo_recent_searches');
    } catch {}
  }, []);

  // ── DEBOUNCED MULTI-LEVEL DICTIONARY SEARCH (N5 - N1) ──
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults({
        vocabularies: [],
        kanji: [],
        grammar: [],
        counts: { total: 0, vocab: 0, kanji: 0, grammar: 0 }
      });
      setSearchLoading(false);
      return;
    }

    setSearchLoading(true);
    const timer = setTimeout(async () => {
      try {
        const res = await dictionaryService.search({
          q: searchQuery.trim(),
          level: searchLevel,
          type: searchType,
          limit: 35
        });
        if (res.data?.success) {
          setSearchResults(res.data);
        }
      } catch (err) {
        console.error('Dictionary search error:', err);
      } finally {
        setSearchLoading(false);
      }
    }, 180);

    return () => clearTimeout(timer);
  }, [searchQuery, searchLevel, searchType]);

  // Global Shortcut: Ctrl + K or Cmd + K or / to open search
  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen(true);
        if (window.innerWidth < 640) {
          setMobileSearchOpen(true);
          setTimeout(() => mobileInputRef.current?.focus(), 100);
        } else {
          setTimeout(() => searchInputRef.current?.focus(), 100);
        }
      } else if (e.key === 'Escape') {
        setSearchOpen(false);
        setMobileSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

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

  const handleExecuteSearch = (queryText) => {
    sounds.playFlip();
    setSearchQuery(queryText);
    saveRecentSearch(queryText);
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

  // Helper for Level Badge Styling
  const getLevelBadgeClass = (lvl) => {
    switch ((lvl || '').toUpperCase()) {
      case 'N1':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'N2':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'N3':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'N4':
        return 'bg-sky-50 text-sky-700 border-sky-200';
      case 'N5':
      default:
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    }
  };

  return (
    <>
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
              className="flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-2xl bg-gradient-to-r from-pink-50 to-rose-50 border border-pink-200 text-xs font-black text-pink-700 hover:border-pink-300 transition-all cursor-pointer shadow-sm active:scale-95"
            >
              <span className="text-[10px] text-pink-500 font-bold hidden xs:inline">Cấp độ</span>
              <span className="text-pink-800 text-xs sm:text-sm font-extrabold">{currentLevel || 'N5'}</span>
              <span className="px-1.5 py-0.5 rounded-full bg-pink-600 text-white text-[9px] font-black uppercase">
                {levels.find((l) => l.id === (currentLevel || 'N5'))?.badge || 'Cơ bản'}
              </span>
              <ChevronDown size={13} className={`text-pink-600 transition-transform ${levelDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {levelDropdownOpen && (
              <div className="absolute top-11 left-0 w-64 bg-white rounded-2xl shadow-xl border border-pink-100 p-2 z-50 animate-in fade-in slide-in-from-top-1">
                <div className="px-3 py-2 border-b border-pink-50 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Chọn cấp độ học tập JLPT
                </div>
                <div className="py-1 space-y-1">
                  {levels.map((lvl) => {
                    const isSelected = lvl.id === (currentLevel || 'N5');
                    return (
                      <button
                        key={lvl.id}
                        type="button"
                        onClick={() => handleSelectLevel(lvl.id)}
                        className={`w-full p-2.5 rounded-xl text-left flex items-start justify-between transition-colors cursor-pointer ${
                          isSelected ? 'bg-pink-50 text-pink-700 font-black' : 'hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-extrabold">{lvl.title}</span>
                            <span className="px-1.5 py-0.2 rounded bg-pink-100 text-pink-700 text-[10px] font-bold">
                              {lvl.badge}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 mt-0.5 mb-0 leading-tight">{lvl.desc}</p>
                        </div>
                        {isSelected && <Check size={16} className="text-pink-600 shrink-0 mt-0.5" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── CENTER: ADVANCED DICTIONARY SEARCH BAR ── */}
        <div ref={searchRef} className="flex-1 max-w-xl mx-2 sm:mx-4 relative">
          <div className="relative hidden sm:flex items-center">
            <Search size={15} className="absolute left-3.5 text-pink-500 pointer-events-none" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Tra cứu từ điển N5 - N1 (Kanji, Romaji, Tiếng Việt)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setSearchOpen(true)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  saveRecentSearch(searchQuery);
                }
              }}
              className="w-full pl-9 pr-14 py-2 rounded-2xl bg-pink-50/40 border border-pink-200/80 text-xs font-semibold text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 transition-all shadow-inner"
            />
            {searchLoading ? (
              <Loader2 size={14} className="absolute right-3.5 text-pink-500 animate-spin" />
            ) : searchQuery ? (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 text-slate-400 hover:text-slate-600 cursor-pointer p-0.5"
                title="Xóa nội dung"
              >
                <X size={14} />
              </button>
            ) : (
              <kbd className="hidden md:inline-block absolute right-3 px-1.5 py-0.5 rounded bg-pink-100 text-[10px] font-mono font-bold text-pink-700 pointer-events-none select-none">
                ⌘K
              </kbd>
            )}
          </div>

          {/* Mobile Search Toggle Icon */}
          <div className="sm:hidden flex justify-end shrink-0">
            <button
              type="button"
              onClick={() => {
                sounds.playFlip();
                setMobileSearchOpen(true);
                setTimeout(() => mobileInputRef.current?.focus(), 150);
              }}
              className="px-2 py-1.5 xs:px-2.5 rounded-xl bg-pink-50 hover:bg-pink-100 text-pink-700 border border-pink-200 text-xs font-bold flex items-center gap-1 cursor-pointer shadow-sm active:scale-95 whitespace-nowrap shrink-0"
              title="Tra cứu từ điển N5 - N1"
            >
              <Search size={15} className="text-pink-600 shrink-0" />
              <span className="text-[11px] font-bold whitespace-nowrap">Tra cứu</span>
            </button>
          </div>

          {/* ── DESKTOP ADVANCED DICTIONARY OVERLAY ── */}
          {searchOpen && (
            <div className="hidden sm:block absolute top-11 left-0 right-0 w-[580px] lg:w-[660px] -translate-x-12 sm:translate-x-0 bg-white rounded-3xl shadow-2xl border border-pink-100 p-4 z-50 animate-in fade-in slide-in-from-top-1 max-h-[540px] overflow-hidden flex flex-col">
              {/* Header Filters Bar: Category & JLPT Level */}
              <div className="pb-3 border-b border-pink-50 space-y-2">
                {/* Type Selection */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-[11px] font-bold">
                    <button
                      type="button"
                      onClick={() => { sounds.playFlip(); setSearchType('all'); }}
                      className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                        searchType === 'all' ? 'bg-white text-pink-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      Tất cả {searchResults.counts.total > 0 && `(${searchResults.counts.total})`}
                    </button>
                    <button
                      type="button"
                      onClick={() => { sounds.playFlip(); setSearchType('vocab'); }}
                      className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                        searchType === 'vocab' ? 'bg-white text-pink-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      Từ vựng {searchResults.counts.vocab > 0 && `(${searchResults.counts.vocab})`}
                    </button>
                    <button
                      type="button"
                      onClick={() => { sounds.playFlip(); setSearchType('kanji'); }}
                      className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                        searchType === 'kanji' ? 'bg-white text-pink-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      Chữ Hán {searchResults.counts.kanji > 0 && `(${searchResults.counts.kanji})`}
                    </button>
                    <button
                      type="button"
                      onClick={() => { sounds.playFlip(); setSearchType('grammar'); }}
                      className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                        searchType === 'grammar' ? 'bg-white text-pink-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      Ngữ pháp {searchResults.counts.grammar > 0 && `(${searchResults.counts.grammar})`}
                    </button>
                  </div>

                  {/* JLPT Level Selector */}
                  <div className="flex items-center gap-1">
                    {['ALL', 'N5', 'N4', 'N3', 'N2', 'N1'].map((lvl) => (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() => { sounds.playFlip(); setSearchLevel(lvl); }}
                        className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase transition-all cursor-pointer ${
                          searchLevel === lvl
                            ? 'bg-pink-600 text-white shadow-sm'
                            : 'bg-slate-50 text-slate-500 hover:bg-pink-50 hover:text-pink-600'
                        }`}
                      >
                        {lvl === 'ALL' ? 'Tất cả' : lvl}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Body Content */}
              <div className="flex-1 overflow-y-auto py-2 divide-y divide-pink-50/70">
                {!searchQuery.trim() ? (
                  /* ── EMPTY STATE: RECENT SEARCHES & SMART RECOMMENDATIONS ── */
                  <div className="space-y-4 py-2">
                    {/* Recent Searches */}
                    {recentSearches.length > 0 && (
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase">
                          <span className="flex items-center gap-1">
                            <Clock size={12} />
                            <span>Lịch sử tra cứu gần đây</span>
                          </span>
                          <button
                            type="button"
                            onClick={clearRecentSearches}
                            className="text-slate-400 hover:text-rose-600 transition-colors cursor-pointer text-[10px]"
                          >
                            Xóa lịch sử
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {recentSearches.map((term, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => handleExecuteSearch(term)}
                              className="px-2.5 py-1 rounded-xl bg-slate-50 hover:bg-pink-50 text-slate-700 hover:text-pink-700 text-xs font-semibold border border-slate-200 hover:border-pink-200 transition-colors cursor-pointer flex items-center gap-1"
                            >
                              <span>{term}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Popular Topics Recommendations */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-1.5 text-[11px] font-black text-pink-700 uppercase tracking-wider">
                        <Sparkles size={13} className="text-pink-600" />
                        <span>CHỦ ĐỀ TRA CỨU PHỔ BIẾN (N5 - N1)</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {popularTopics.map((topic, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => handleExecuteSearch(topic.query)}
                            className="p-2 rounded-xl bg-gradient-to-r from-pink-50/40 to-rose-50/30 hover:from-pink-100/60 hover:to-rose-100/50 border border-pink-100 text-left transition-all cursor-pointer flex items-center justify-between"
                          >
                            <span className="text-xs font-bold text-slate-800">{topic.label}</span>
                            <span className={`px-1.5 py-0.5 rounded text-[9px] font-black border ${getLevelBadgeClass(topic.level)}`}>
                              {topic.level}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="p-3 rounded-2xl bg-slate-50 text-[11px] text-slate-500 flex items-center justify-between">
                      <span>Kho từ điển: <strong>9.584 từ vựng</strong> • <strong>607 chữ Hán</strong> • <strong>276 ngữ pháp</strong></span>
                      <button
                        type="button"
                        onClick={handleViewFullDictionary}
                        className="text-pink-600 font-bold hover:underline cursor-pointer"
                      >
                        Mở từ điển chi tiết
                      </button>
                    </div>
                  </div>
                ) : searchLoading ? (
                  <div className="py-12 text-center space-y-2">
                    <Loader2 size={24} className="animate-spin text-pink-600 mx-auto" />
                    <p className="text-xs font-bold text-slate-400">Đang tra cứu từ điển toàn hệ thống N5 - N1...</p>
                  </div>
                ) : searchResults.counts.total === 0 ? (
                  /* ── NO RESULTS FOUND ── */
                  <div className="p-6 text-center text-xs text-slate-500 space-y-3">
                    <p className="font-bold text-slate-700 text-sm">
                      Không tìm thấy kết quả từ điển cho 「{searchQuery}」
                    </p>
                    <p className="text-slate-400 max-w-sm mx-auto text-xs">
                      Hãy thử đổi từ khóa Romaji, Kana hoặc nghĩa tiếng Việt, hoặc nhờ AI Sensei phân tích ngữ cảnh câu.
                    </p>
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
                      className="px-4 py-2 rounded-2xl bg-pink-50 hover:bg-pink-100 text-pink-700 font-bold border border-pink-200 inline-flex items-center gap-1.5 cursor-pointer shadow-sm transition-colors"
                    >
                      <Sparkles size={14} className="text-pink-600" />
                      <span>Nhờ AI Sensei phân tích sâu cụm từ này</span>
                    </button>
                  </div>
                ) : (
                  /* ── RESULTS LIST ── */
                  <div className="space-y-3 py-1">
                    {/* 1. Vocabularies Section */}
                    {searchResults.vocabularies.length > 0 && (
                      <div className="space-y-1.5">
                        <div className="px-2 py-0.5 flex justify-between items-center text-[10.5px] font-black text-slate-400 uppercase tracking-wider">
                          <span>Từ vựng ({searchResults.vocabularies.length})</span>
                          <span className="text-pink-600 text-[10px]">Nhật - Việt chuẩn</span>
                        </div>
                        <div className="divide-y divide-pink-50/70">
                          {searchResults.vocabularies.map((word) => {
                            const isFav = isFavorite ? isFavorite(word.id) : favorites?.[word.id];
                            return (
                              <div
                                key={`v_${word.id}`}
                                className="p-2.5 hover:bg-pink-50/30 rounded-2xl transition-colors flex items-center justify-between gap-3 group"
                              >
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <FuriganaWord
                                      kanji={word.kanji}
                                      kana={word.clean_kana || word.kana}
                                      size="base"
                                    />
                                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-black border ${getLevelBadgeClass(word.level)}`}>
                                      {word.level} - Bài {word.lesson_number}
                                    </span>
                                    {word.romaji && (
                                      <span className="text-[11px] font-mono font-medium text-slate-400">
                                        {word.romaji}
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-xs text-slate-700 font-semibold mt-1 mb-0 leading-snug">
                                    {word.clean_vietnamese || word.vietnamese}
                                  </p>
                                  {word.example_jp && (
                                    <p className="text-[11px] text-slate-400 italic font-jp truncate mt-0.5 mb-0">
                                      {word.example_jp} — {word.example_vi}
                                    </p>
                                  )}
                                </div>

                                {/* Action Buttons */}
                                <div className="flex items-center gap-1 shrink-0">
                                  {/* Audio */}
                                  <button
                                    type="button"
                                    onClick={() => speakJapanese(word.kanji, word.clean_kana || word.kana)}
                                    className="p-2 rounded-xl bg-pink-50 text-pink-600 hover:bg-pink-100 transition-colors cursor-pointer"
                                    title="Nghe phát âm Tokyo"
                                  >
                                    <Volume2 size={15} />
                                  </button>

                                  {/* Favorite Toggle */}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      sounds.playCorrect();
                                      if (toggleFavorite) toggleFavorite(word.id);
                                    }}
                                    className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                                      isFav
                                        ? 'bg-amber-50 text-amber-500 border-amber-200'
                                        : 'bg-white text-slate-400 border-slate-200 hover:text-amber-500 hover:bg-amber-50'
                                    }`}
                                    title={isFav ? 'Đã lưu sổ tay' : 'Lưu vào sổ tay'}
                                  >
                                    <Bookmark size={15} fill={isFav ? '#f59e0b' : 'none'} />
                                  </button>

                                  {/* AI Sensei */}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setSearchOpen(false);
                                      askAi('explain_vocab', word, `AI Sensei: Phân Tích 「${word.kanji || word.kana}」`);
                                    }}
                                    className="p-2 rounded-xl bg-white border border-pink-200 text-pink-600 hover:bg-pink-50 transition-colors cursor-pointer shadow-sm"
                                    title="Nhờ AI Sensei phân tích mẹo nhớ & ngữ cảnh"
                                  >
                                    <Sparkles size={15} />
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* 2. Kanji Section */}
                    {searchResults.kanji.length > 0 && (
                      <div className="space-y-1.5 pt-2">
                        <div className="px-2 py-0.5 flex justify-between items-center text-[10.5px] font-black text-slate-400 uppercase tracking-wider">
                          <span>Chữ Hán Kanji ({searchResults.kanji.length})</span>
                          <span className="text-pink-600 text-[10px]">Âm Hán Việt & Nét bút</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          {searchResults.kanji.map((kItem) => (
                            <div
                              key={`k_${kItem.id || kItem.kanji}`}
                              className="p-2.5 rounded-2xl border border-pink-100 bg-gradient-to-r from-pink-50/30 to-white hover:border-pink-300 transition-colors flex items-center justify-between gap-2"
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <span className="text-2xl font-black font-jp text-pink-700">
                                  {kItem.kanji}
                                </span>
                                <div className="min-w-0">
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-xs font-black text-slate-900 uppercase">
                                      {kItem.han_viet || kItem.hanviet}
                                    </span>
                                    <span className={`px-1.5 py-0.2 rounded text-[9px] font-black border ${getLevelBadgeClass(kItem.level)}`}>
                                      {kItem.level}
                                    </span>
                                  </div>
                                  <p className="text-[11px] text-slate-500 truncate mt-0.5 mb-0">
                                    {kItem.meaning}
                                  </p>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => speakJapanese(kItem.kanji)}
                                className="p-1.5 rounded-lg text-pink-600 hover:bg-pink-100 shrink-0 cursor-pointer"
                                title="Nghe phát âm"
                              >
                                <Volume2 size={13} />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 3. Grammar Section */}
                    {searchResults.grammar.length > 0 && (
                      <div className="space-y-1.5 pt-2">
                        <div className="px-2 py-0.5 flex justify-between items-center text-[10.5px] font-black text-slate-400 uppercase tracking-wider">
                          <span>Ngữ pháp ({searchResults.grammar.length})</span>
                          <span className="text-pink-600 text-[10px]">Cấu trúc & Ý nghĩa</span>
                        </div>
                        <div className="divide-y divide-pink-50/70">
                          {searchResults.grammar.map((gItem) => (
                            <div
                              key={`g_${gItem.id || gItem.title}`}
                              className="p-2.5 hover:bg-pink-50/30 rounded-2xl transition-colors flex items-center justify-between gap-2"
                            >
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-black font-jp text-pink-800">
                                    {gItem.title || gItem.structure}
                                  </span>
                                  <span className={`px-1.5 py-0.2 rounded text-[9px] font-black border ${getLevelBadgeClass(gItem.level)}`}>
                                    {gItem.level}
                                  </span>
                                </div>
                                <p className="text-xs text-slate-600 mt-0.5 mb-0 font-medium">
                                  {gItem.meaning}
                                </p>
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  setSearchOpen(false);
                                  askAi('free_question', { grammar: gItem }, `AI: Ngữ Pháp 「${gItem.title}」`);
                                }}
                                className="p-2 rounded-xl bg-pink-50 text-pink-700 hover:bg-pink-100 text-xs font-bold shrink-0 cursor-pointer flex items-center gap-1"
                              >
                                <Sparkles size={13} />
                                <span>Phân tích</span>
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Bottom Footer Actions */}
              <div className="pt-3 border-t border-pink-50 flex items-center justify-between text-xs font-bold text-slate-500">
                <span className="text-[11px] text-slate-400">
                  Tìm kiếm toàn bộ kho dữ liệu N5 đến N1
                </span>
                <button
                  type="button"
                  onClick={handleViewFullDictionary}
                  className="px-3 py-1.5 rounded-xl bg-pink-50 hover:bg-pink-100 text-pink-700 text-xs font-bold transition-colors cursor-pointer"
                >
                  Mở trang Từ điển đầy đủ
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── RIGHT: NOTIFICATIONS & USER ACCOUNT ── */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Notifications Popover */}
          <div ref={notificationRef} className="relative">
            <button
              type="button"
              onClick={() => {
                sounds.playFlip();
                setNotificationOpen(!notificationOpen);
              }}
              className="p-2 rounded-2xl border border-pink-100 hover:border-pink-300 text-slate-600 hover:text-pink-600 hover:bg-pink-50 transition-colors relative cursor-pointer"
              aria-label="Thông báo hệ thống"
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-pink-600 text-white text-[9px] font-black flex items-center justify-center animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {notificationOpen && (
              <div className="absolute right-0 top-12 w-80 sm:w-88 bg-white rounded-3xl shadow-2xl border border-pink-100 p-4 z-50 animate-in fade-in slide-in-from-top-1 max-h-[460px] flex flex-col">
                <div className="flex items-center justify-between pb-3 border-b border-pink-50">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-black text-slate-900 uppercase">Thông báo học tập</span>
                    {unreadCount > 0 && (
                      <span className="px-1.5 py-0.2 rounded-full bg-pink-100 text-pink-700 text-[10px] font-bold">
                        {unreadCount} mới
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      type="button"
                      onClick={handleMarkAllRead}
                      className="text-[11px] font-bold text-pink-600 hover:text-pink-800 cursor-pointer"
                    >
                      Đã đọc tất cả
                    </button>
                  )}
                </div>

                <div className="flex-1 overflow-y-auto py-2 divide-y divide-pink-50 space-y-1">
                  {notifications.map((item) => {
                    const IconComp = item.icon;
                    return (
                      <div
                        key={item.id}
                        onClick={() => handleNotificationClick(item)}
                        className={`p-2.5 rounded-2xl cursor-pointer transition-colors flex items-start gap-3 ${
                          item.read ? 'hover:bg-slate-50 opacity-80' : 'bg-pink-50/40 hover:bg-pink-50/70'
                        }`}
                      >
                        <div className={`p-2 rounded-xl shrink-0 border ${item.color}`}>
                          <IconComp size={16} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-1">
                            <h4 className="text-xs font-bold text-slate-900 truncate">{item.title}</h4>
                            <span className="text-[10px] text-slate-400 shrink-0">{item.time}</span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2 leading-relaxed">
                            {item.message}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* User Profile / Auth Button */}
          {user ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  sounds.playFlip();
                  setProfileDropdownOpen(!profileDropdownOpen);
                }}
                className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-2xl border border-pink-200 hover:border-pink-300 bg-white hover:bg-pink-50/30 transition-all cursor-pointer shadow-sm active:scale-95"
              >
                {(() => {
                  const userAvatar = user.avatar || user.avatar_url;
                  const userName = user.name || user.username || (user.email ? user.email.split('@')[0] : 'Học viên');
                  return (
                    <>
                      {userAvatar ? (
                        <img
                          src={userAvatar}
                          alt={userName}
                          referrerPolicy="no-referrer"
                          crossOrigin="anonymous"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            const fallback = e.currentTarget.parentElement?.querySelector('.avatar-fallback');
                            if (fallback) fallback.style.display = 'flex';
                          }}
                          className="w-7 h-7 rounded-xl object-cover border border-pink-200 shrink-0"
                        />
                      ) : null}
                      <div
                        className={`avatar-fallback w-7 h-7 rounded-xl bg-gradient-to-tr from-pink-600 to-rose-500 text-white items-center justify-center font-bold text-xs shrink-0 ${userAvatar ? 'hidden' : 'flex'}`}
                      >
                        {(userName || 'H').charAt(0).toUpperCase()}
                      </div>
                      <span className="text-xs font-bold text-slate-800 hidden md:inline max-w-[120px] truncate">
                        {userName}
                      </span>
                    </>
                  );
                })()}
                <ChevronDown size={13} className="text-slate-400" />
              </button>

              {profileDropdownOpen && (
                <div className="absolute right-0 top-12 w-56 bg-white rounded-3xl shadow-xl border border-pink-100 p-2 z-50 animate-in fade-in slide-in-from-top-1">
                  <div className="p-3 border-b border-pink-50">
                    <p className="text-xs font-black text-slate-900 truncate">{user.name || user.username || (user.email ? user.email.split('@')[0] : 'Học viên Nihongo')}</p>
                    <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                    <div className="mt-2 flex items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded-full bg-pink-100 text-pink-700 text-[10px] font-black">
                        {gamification.level_tier || 'Tân Thủ N5'}
                      </span>
                      <span className="text-[10px] text-slate-500 font-bold">{gamification.total_xp || 0} XP</span>
                    </div>
                  </div>

                  <div className="py-1">
                    <button
                      type="button"
                      onClick={() => {
                        sounds.playFlip();
                        setProfileDropdownOpen(false);
                        setActiveTab('notebook');
                      }}
                      className="w-full px-3 py-2 text-left text-xs font-bold text-slate-700 hover:bg-pink-50 hover:text-pink-700 rounded-xl transition-colors cursor-pointer flex items-center gap-2"
                    >
                      <Bookmark size={14} className="text-pink-600" />
                      <span>Sổ tay từ vựng</span>
                    </button>

                    <button
                      type="button"
                      onClick={function() {
                        sounds.playFlip();
                        setProfileDropdownOpen(false);
                        window.dispatchEvent(new CustomEvent('hyper-open-update'));
                      }}
                      className="w-full px-3 py-2 text-left text-xs font-bold text-slate-700 hover:bg-pink-50 hover:text-pink-700 rounded-xl transition-colors cursor-pointer flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <RefreshCw size={14} className="text-pink-600" />
                        <span>Kiểm tra cập nhật</span>
                      </div>
                      <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">v{appUpdateVersion}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        sounds.playFlip();
                        setProfileDropdownOpen(false);
                        logout();
                      }}
                      className="w-full px-3 py-2 text-left text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer flex items-center gap-2"
                    >
                      <LogOut size={14} />
                      <span>Đăng xuất</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={() => {
                sounds.playFlip();
                openAuth('login');
              }}
              className="px-3 sm:px-4 py-2 rounded-2xl bg-gradient-to-r from-pink-600 to-rose-500 text-white text-xs font-bold shadow-lotus hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              Đăng nhập
            </button>
          )}
        </div>
      </header>

      {/* ── MOBILE FULLSCREEN PREMIUM DICTIONARY OVERLAY ── */}
      {mobileSearchOpen && (
        <div className="fixed inset-0 z-50 bg-white flex flex-col animate-in fade-in">
          {/* Mobile Search Header */}
          <div className="p-3 border-b border-pink-100 flex items-center gap-2 bg-white/95 backdrop-blur-md">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-pink-500" />
              <input
                ref={mobileInputRef}
                type="text"
                placeholder="Tra cứu từ điển N5 - N1..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') saveRecentSearch(searchQuery);
                }}
                className="w-full pl-9 pr-8 py-2.5 rounded-2xl bg-pink-50/50 border border-pink-200 text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-pink-500/20"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                >
                  <X size={15} />
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={() => setMobileSearchOpen(false)}
              className="px-3.5 py-2.5 rounded-2xl bg-pink-100 text-pink-700 font-bold text-xs shrink-0 cursor-pointer"
            >
              Đóng
            </button>
          </div>

          {/* Mobile Filter Tabs (Category & Level) */}
          <div className="p-2 border-b border-pink-50 bg-slate-50/70 space-y-1.5 overflow-x-auto">
            {/* Category pills */}
            <div className="flex items-center gap-1.5">
              {[
                { id: 'all', label: 'Tất cả' },
                { id: 'vocab', label: 'Từ vựng' },
                { id: 'kanji', label: 'Chữ Hán' },
                { id: 'grammar', label: 'Ngữ pháp' }
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => { sounds.playFlip(); setSearchType(t.id); }}
                  className={`px-3 py-1 rounded-xl text-xs font-bold shrink-0 transition-colors ${
                    searchType === t.id
                      ? 'bg-pink-600 text-white shadow-sm'
                      : 'bg-white text-slate-600 border border-slate-200'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Level pills */}
            <div className="flex items-center gap-1 overflow-x-auto pt-0.5">
              {['ALL', 'N5', 'N4', 'N3', 'N2', 'N1'].map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => { sounds.playFlip(); setSearchLevel(lvl); }}
                  className={`px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase shrink-0 transition-colors ${
                    searchLevel === lvl
                      ? 'bg-slate-900 text-white'
                      : 'bg-white text-slate-500 border border-slate-200'
                  }`}
                >
                  {lvl === 'ALL' ? 'Tất cả JLPT' : lvl}
                </button>
              ))}
            </div>
          </div>

          {/* Mobile Results Body */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {!searchQuery.trim() ? (
              <div className="space-y-4 py-2">
                {/* Recent Searches */}
                {recentSearches.length > 0 && (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase">
                      <span>Lịch sử tra cứu</span>
                      <button
                        type="button"
                        onClick={clearRecentSearches}
                        className="text-slate-400 hover:text-rose-600 text-[11px]"
                      >
                        Xóa
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {recentSearches.map((term, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleExecuteSearch(term)}
                          className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold"
                        >
                          {term}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Popular Topics */}
                <div className="space-y-2">
                  <span className="text-xs font-black text-pink-700 uppercase tracking-wider block">
                    CHỦ ĐỀ TRA CỨU PHỔ BIẾN
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    {popularTopics.map((topic, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleExecuteSearch(topic.query)}
                        className="p-2.5 rounded-xl bg-pink-50/50 border border-pink-100 text-left text-xs font-bold text-slate-800"
                      >
                        {topic.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : searchLoading ? (
              <div className="py-16 text-center space-y-2">
                <Loader2 size={24} className="animate-spin text-pink-600 mx-auto" />
                <p className="text-xs font-bold text-slate-400">Đang tìm kiếm từ điển N5 - N1...</p>
              </div>
            ) : searchResults.counts.total === 0 ? (
              <div className="py-12 text-center text-xs text-slate-500 space-y-3">
                <p className="font-bold text-slate-700 text-sm">
                  Không tìm thấy từ vựng cho 「{searchQuery}」
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setMobileSearchOpen(false);
                    askAi(
                      'free_question',
                      { query: searchQuery },
                      `AI Phân Tích: 「${searchQuery}」`
                    );
                  }}
                  className="px-4 py-2.5 rounded-2xl bg-pink-50 text-pink-700 font-bold border border-pink-200 inline-flex items-center gap-1.5"
                >
                  <Sparkles size={15} />
                  <span>Nhờ AI Sensei phân tích</span>
                </button>
              </div>
            ) : (
              <div className="space-y-3 divide-y divide-pink-50">
                {/* Vocab Section */}
                {searchResults.vocabularies.map((word) => {
                  const isFav = isFavorite ? isFavorite(word.id) : favorites?.[word.id];
                  return (
                    <div key={`mv_${word.id}`} className="py-3 flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <FuriganaWord
                            kanji={word.kanji}
                            kana={word.clean_kana || word.kana}
                            size="base"
                          />
                          <span className={`px-2 py-0.5 rounded text-[10px] font-black border ${getLevelBadgeClass(word.level)}`}>
                            {word.level}
                          </span>
                        </div>
                        <p className="text-xs text-slate-700 font-bold leading-snug">
                          {word.clean_vietnamese || word.vietnamese}
                        </p>
                        {word.romaji && (
                          <span className="text-[11px] font-mono text-slate-400 block">
                            Romaji: {word.romaji}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => speakJapanese(word.kanji, word.clean_kana || word.kana)}
                          className="p-2 rounded-xl bg-pink-50 text-pink-600"
                        >
                          <Volume2 size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            sounds.playCorrect();
                            if (toggleFavorite) toggleFavorite(word.id);
                          }}
                          className={`p-2 rounded-xl border ${
                            isFav ? 'bg-amber-50 text-amber-500 border-amber-200' : 'bg-white text-slate-400 border-slate-200'
                          }`}
                        >
                          <Bookmark size={16} fill={isFav ? '#f59e0b' : 'none'} />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setMobileSearchOpen(false);
                            askAi('explain_vocab', word, `AI Sensei: 「${word.kanji || word.kana}」`);
                          }}
                          className="p-2 rounded-xl bg-white border border-pink-200 text-pink-600 shadow-sm"
                        >
                          <Sparkles size={16} />
                        </button>
                      </div>
                    </div>
                  );
                })}

                {/* Kanji Section on Mobile */}
                {searchResults.kanji.length > 0 && (
                  <div className="pt-3 space-y-2">
                    <span className="text-xs font-black text-slate-400 uppercase tracking-wider block">
                      CHỮ HÁN ({searchResults.kanji.length})
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      {searchResults.kanji.map((kItem) => (
                        <div
                          key={`mk_${kItem.id || kItem.kanji}`}
                          className="p-2.5 rounded-2xl border border-pink-100 bg-pink-50/20 flex items-center justify-between"
                        >
                          <div>
                            <span className="text-2xl font-black font-jp text-pink-700 block">
                              {kItem.kanji}
                            </span>
                            <span className="text-xs font-bold text-slate-800 uppercase block">
                              {kItem.han_viet || kItem.hanviet}
                            </span>
                            <span className="text-[11px] text-slate-500 truncate block">
                              {kItem.meaning}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => speakJapanese(kItem.kanji)}
                            className="p-1.5 text-pink-600"
                          >
                            <Volume2 size={15} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile Bottom Footer */}
          <div className="p-3 border-t border-pink-100 bg-slate-50 shrink-0">
            <button
              type="button"
              onClick={handleViewFullDictionary}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-pink-600 to-rose-500 text-white font-bold text-xs shadow-lotus text-center cursor-pointer"
            >
              Mở trang Từ điển đầy đủ
            </button>
          </div>
        </div>
      )}
    </>
  );
}
