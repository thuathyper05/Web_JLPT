import React from 'react';

// Thanh điều hướng dạng viên thuốc, dính trên cùng khi cuộn, cuộn ngang mượt trên điện thoại
// ZERO ARROWS RULE: Không dùng ký tự mũi tên

export default function StudyTabs({ tabs, active, onChange }) {
  const list = Array.isArray(tabs) ? tabs : [];

  return (
    <nav
      aria-label="Chế độ học"
      className="sticky top-0 z-20 -mx-1 px-1 py-2 bg-slate-50/90 backdrop-blur-md"
    >
      <div className="flex items-stretch gap-1.5 p-1.5 rounded-2xl bg-white border border-pink-100 shadow-sm overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {list.map(function (t) {
          const isActive = active === t.id;
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              type="button"
              aria-current={isActive ? 'page' : undefined}
              onClick={function () { onChange(t.id); }}
              className={
                'shrink-0 min-h-[44px] px-3.5 sm:px-4 rounded-xl text-xs sm:text-sm font-extrabold inline-flex items-center justify-center gap-1.5 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-500 ' +
                (isActive
                  ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-md'
                  : 'text-slate-600 hover:bg-pink-50 hover:text-pink-700')
              }
            >
              {Icon ? <Icon size={16} className={isActive ? 'text-white' : 'text-pink-500'} /> : null}
              <span className="whitespace-nowrap">{t.label}</span>
              {t.badge !== undefined && t.badge !== null ? (
                <span
                  className={
                    'px-1.5 py-0.5 rounded-full text-[10px] font-black ' +
                    (isActive ? 'bg-white/25 text-white' : 'bg-pink-100 text-pink-700')
                  }
                >
                  {t.badge}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
