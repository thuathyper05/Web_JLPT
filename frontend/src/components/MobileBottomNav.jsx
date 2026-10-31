import React from 'react';
import { useApp } from '../context/AppContext';
import { Home, BookOpen, PenTool, Layers, CheckSquare } from 'lucide-react';

export default function MobileBottomNav() {
  const { activeTab, setActiveTab } = useApp();

  const bottomItems = [
    { id: 'home', label: 'Trang chủ', icon: Home },
    { id: 'lessons', label: 'Bài học', icon: BookOpen },
    { id: 'kanji', label: 'Kanji', icon: PenTool },
    { id: 'flashcard', label: 'Flashcard', icon: Layers },
    { id: 'quiz', label: 'Trắc nghiệm', icon: CheckSquare },
  ];

  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-t border-pink-100 flex items-center justify-around px-2 py-1 shadow-[0_-4px_20px_rgba(219,39,119,0.06)]"
      style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 4px)' }}
    >
      {bottomItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => setActiveTab(item.id)}
            className="flex-1 flex flex-col items-center justify-center py-1.5 transition-all outline-none"
            style={{ minHeight: '44px' }}
          >
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                isActive
                  ? 'bg-gradient-to-tr from-pink-600 to-rose-500 text-white shadow-lotus -translate-y-0.5 scale-105'
                  : 'text-slate-400 hover:text-pink-600'
              }`}
            >
              <Icon size={19} strokeWidth={isActive ? 2.5 : 2} />
            </div>
            <span
              className={`text-[10.5px] mt-0.5 tracking-tight truncate max-w-[64px] font-semibold ${
                isActive ? 'text-pink-600 font-bold' : 'text-slate-500'
              }`}
            >
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
