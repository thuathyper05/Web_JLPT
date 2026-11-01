import React from 'react';
import { RotateCw, AlertTriangle, Home } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('WebApp ErrorBoundary caught error:', error, errorInfo);
  }

  handleReload = () => {
    try {
      window.location.reload();
    } catch {
      window.location.href = '/';
    }
  };

  handleResetHome = () => {
    try {
      localStorage.setItem('nihongo_current_level', 'N5');
    } catch {}
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 antialiased font-sans">
          <div className="max-w-md w-full p-8 rounded-3xl bg-white border border-rose-100 shadow-xl text-center space-y-5">
            <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border border-rose-100">
              <AlertTriangle size={32} />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-black text-slate-900 tracking-tight">
                Đã xảy ra sự cố hiển thị
              </h2>
              <p className="text-xs text-slate-500 leading-relaxed">
                Hệ thống đang lưu giữ toàn bộ dữ liệu của bạn an toàn. Vui lòng bấm làm mới để đồng bộ lại trang web ngay lập tức.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={this.handleReload}
                className="flex-1 py-3 px-4 rounded-xl bg-pink-600 hover:bg-pink-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
              >
                <RotateCw size={15} />
                <span>Tải lại trang</span>
              </button>

              <button
                type="button"
                onClick={this.handleResetHome}
                className="py-3 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Home size={15} />
                <span>Về Trang chủ</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
