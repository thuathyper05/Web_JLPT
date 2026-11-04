import React from 'react';
import { RotateCw, AlertTriangle, Home, RefreshCw } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error: error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('WebApp ErrorBoundary caught error:', error, errorInfo);
    try {
      ['nihongo_guest_progress', 'nihongo_favorites', 'nihongo_gamification', 'nihongo_cached_user'].forEach(function (key) {
        const val = localStorage.getItem(key);
        if (val === 'null' || val === 'undefined') {
          localStorage.removeItem(key);
        }
      });
    } catch {}
  }

  handleReload = () => {
    try {
      if ('caches' in window) {
        window.caches.keys().then(function (names) {
          names.forEach(function (name) { window.caches.delete(name); });
        });
      }
      sessionStorage.removeItem('hyper_initial_build_time');
      window.location.replace(window.location.origin + window.location.pathname + '?v=' + Date.now());
    } catch {
      window.location.reload();
    }
  };

  handleResetHome = () => {
    try {
      localStorage.setItem('nihongo_current_level', 'N5');
      sessionStorage.removeItem('hyper_initial_build_time');
      window.location.replace('/');
    } catch {
      window.location.href = '/';
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4 antialiased font-sans">
          <div className="max-w-md w-full p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xl text-center space-y-5">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto border border-amber-200/60 dark:border-amber-800/40">
              <AlertTriangle size={28} />
            </div>

            <div className="space-y-2">
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Hệ thống cần làm mới giao diện
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-sm mx-auto">
                Bản dựng ứng dụng vừa được cập nhật tài nguyên mới. Bạn chỉ cần nhấn nút bên dưới để tải lại phiên bản hoàn chỉnh nhất.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={this.handleReload}
                className="flex-1 min-h-[44px] py-2.5 px-4 rounded-xl bg-pink-600 hover:bg-pink-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer active:scale-95"
              >
                <RefreshCw size={15} />
                <span>Tải lại phiên bản mới</span>
              </button>

              <button
                type="button"
                onClick={this.handleResetHome}
                className="min-h-[44px] py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95"
              >
                <Home size={15} />
                <span>Trang chủ</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
