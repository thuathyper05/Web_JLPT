import React from 'react';
import { useApp } from '../context/AppContext';
import {
  Home,
  BookOpen,
  PenTool,
  Compass,
  Layers,
  CheckSquare,
  Keyboard,
  Zap,
  Sprout,
  Sparkles,
  Flame,
  X
} from 'lucide-react';

export default function Sidebar({ mobileOpen = false, onCloseMobile = () => {} }) {
  const { activeTab, setActiveTab, gamification, askAi } = useApp();

  const navSections = [
    {
      title: 'HỌC TẬP',
      items: [
        { id: 'home', label: 'Trang chủ', icon: Home },
        { id: 'lessons', label: 'Bài học', icon: BookOpen },
        { id: 'kanji', label: 'Kanji', icon: PenTool },
        { id: 'particles', label: 'Trợ từ', icon: Compass },
      ]
    },
    {
      title: 'LUYỆN TẬP',
      items: [
        { id: 'flashcard', label: 'Flashcard', icon: Layers },
        { id: 'quiz', label: 'Trắc nghiệm', icon: CheckSquare },
        { id: 'practice', label: 'Luyện gõ', icon: Keyboard },
        { id: 'wordmatch', label: 'Nối từ', icon: Zap },
        { id: 'garden', label: 'Vườn cây', icon: Sprout },
      ]
    },
    {
      title: 'CÔNG CỤ',
      items: [
        {
          id: 'ai_tool',
          label: 'Trợ lý AI',
          icon: Sparkles,
          isNew: true,
          action: () => askAi('chat', { topic: 'general' }, 'Trợ Lý AI NihongoHub')
        }
      ]
    }
  ];

  const handleNav = (item) => {
    if (item.action) {
      item.action();
    } else {
      setActiveTab(item.id);
    }
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {mobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-white border-r border-pink-100 flex flex-col justify-between transition-transform duration-300 ease-out lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        {/* Top Logo & Branding */}
        <div>
          <div className="h-18 px-5 py-4 border-b border-pink-50 flex items-center justify-between">
            <div
              onClick={() => handleNav({ id: 'home' })}
              className="flex items-center gap-2.5 cursor-pointer group"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-pink-600 via-rose-500 to-pink-400 text-white flex items-center justify-center font-black text-xl shadow-lotus group-hover:scale-105 transition-transform">
                H
              </div>
              <div className="flex flex-col">
                <span className="font-black text-lg tracking-tight bg-gradient-to-r from-pink-700 via-pink-600 to-rose-500 bg-clip-text text-transparent">
                  Nihongo<span className="text-slate-800">Hub</span>
                </span>
                <span className="text-[10px] font-semibold text-pink-400 tracking-wider uppercase -mt-0.5">
                  Học Tiếng Nhật N5
                </span>
              </div>
            </div>

            {/* Mobile Close Button */}
            <button
              type="button"
              onClick={onCloseMobile}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              aria-label="Đóng menu"
            >
              <X size={20} />
            </button>
          </div>

          {/* Navigation Links List */}
          <nav className="p-3.5 space-y-5 overflow-y-auto max-h-[calc(100vh-210px)]">
            {navSections.map((sec, idx) => (
              <div key={idx}>
                <div className="px-3 mb-1.5 text-[10.5px] font-bold text-slate-400 tracking-wider uppercase">
                  {sec.title}
                </div>
                <div className="space-y-1">
                  {sec.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleNav(item)}
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-semibold text-[13.5px] transition-all ${
                          isActive
                            ? 'bg-gradient-to-r from-pink-600 to-rose-500 text-white shadow-lotus'
                            : 'text-slate-600 hover:bg-pink-50/60 hover:text-pink-600'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon size={18} className={isActive ? 'text-white' : 'text-slate-400 group-hover:text-pink-600'} />
                          <span>{item.label}</span>
                        </div>

                        {item.isNew && (
                          <span className="px-1.5 py-0.5 text-[9.5px] font-bold rounded-md bg-pink-100 text-pink-600 uppercase tracking-wide">
                            MỚI
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </div>

        {/* Bottom Card: Chuỗi Ngày Học (Streak) */}
        <div className="p-3.5 border-t border-pink-50">
          <div
            onClick={() => handleNav({ id: 'home' })}
            className="p-3.5 rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-pink-950 text-white relative overflow-hidden cursor-pointer shadow-lg group hover:scale-[1.02] transition-transform"
          >
            {/* Background Watermark Kanjo */}
            <div className="absolute right-2 top-1 text-slate-800 font-jp font-black text-6xl opacity-30 select-none pointer-events-none">
              N5
            </div>

            <div className="relative z-10">
              <span className="text-[10px] font-bold text-pink-300 uppercase tracking-wider block mb-1">
                Chuỗi ngày học
              </span>
              <div className="flex items-center gap-2">
                <Flame size={20} className="text-amber-400 animate-bounce" fill="#f59e0b" />
                <span className="font-black text-lg tracking-tight text-white">
                  {gamification?.current_streak || 12} ngày
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1 mb-0">
                Hôm nay bạn đã học {gamification?.today_words_count || 0} từ
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
