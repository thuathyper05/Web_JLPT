import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { authService } from '../services/api';
import { X, Mail, Lock, User, Sparkles, CheckCircle2, AlertCircle, ChevronLeft } from 'lucide-react';
import { sounds } from '../services/sounds';

export default function AuthModal() {
  const { authModalOpen, setAuthModalOpen, authMode, setAuthMode, setUser } = useApp();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!authModalOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      if (authMode === 'login') {
        const res = await authService.login({ email, password });
        if (res.data?.success) {
          sounds.playCorrect();
          localStorage.setItem('nihongo_token', res.data.token);
          setUser(res.data.user);
          setAuthModalOpen(false);
        } else {
          setError(res.data?.message || 'Đăng nhập không thành công.');
        }
      } else if (authMode === 'register') {
        const res = await authService.register({ username, email, password });
        if (res.data?.success) {
          sounds.playLevelUp();
          localStorage.setItem('nihongo_token', res.data.token);
          setUser(res.data.user);
          setAuthModalOpen(false);
        } else {
          setError(res.data?.message || 'Đăng ký không thành công.');
        }
      } else if (authMode === 'forgot') {
        const res = await authService.forgotPassword({ email });
        sounds.playCorrect();
        setSuccessMsg(res.data?.message || 'Đã gửi hướng dẫn khôi phục mật khẩu!');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Đã xảy ra lỗi kết nối máy chủ.');
      sounds.playWrong();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in">
      <div
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-pink-100 overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Decor with Lotus Pink Gradient */}
        <div className="bg-gradient-to-r from-pink-600 via-rose-500 to-pink-500 p-6 text-white text-center relative">
          <button
            type="button"
            onClick={() => setAuthModalOpen(false)}
            className="absolute top-4 right-4 text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"
          >
            <X size={20} />
          </button>

          <div className="w-12 h-12 mx-auto rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center font-black text-2xl text-white mb-2 shadow-inner">
            H
          </div>
          <h3 className="text-xl font-black tracking-tight">
            {authMode === 'login' && 'Chào mừng trở lại!'}
            {authMode === 'register' && 'Tạo tài khoản học viên'}
            {authMode === 'forgot' && 'Khôi phục mật khẩu'}
          </h3>
          <p className="text-xs text-white/80 mt-1 mb-0">
            {authMode === 'login' && 'Đăng nhập để đồng bộ tiến độ học N5 trên mọi thiết bị'}
            {authMode === 'register' && 'Bắt đầu hành trình chinh phục tiếng Nhật cùng AI Sensei'}
            {authMode === 'forgot' && 'Nhập email để nhận liên kết đặt lại mật khẩu'}
          </p>
        </div>

        {/* Tab Switcher */}
        {authMode !== 'forgot' && (
          <div className="flex border-b border-pink-50 p-2 bg-pink-50/40">
            <button
              type="button"
              onClick={() => { setAuthMode('login'); setError(''); }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                authMode === 'login'
                  ? 'bg-white text-pink-600 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Đăng nhập
            </button>
            <button
              type="button"
              onClick={() => { setAuthMode('register'); setError(''); }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                authMode === 'register'
                  ? 'bg-white text-pink-600 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Đăng ký
            </button>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle size={16} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
              <CheckCircle2 size={16} className="shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {authMode === 'register' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Tên học viên
              </label>
              <div className="relative">
                <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Nguyễn Văn A"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-pink-200 text-xs focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Địa chỉ Email
            </label>
            <div className="relative">
              <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-pink-200 text-xs focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          {authMode !== 'forgot' && (
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-bold text-slate-700">Mật khẩu</label>
                {authMode === 'login' && (
                  <button
                    type="button"
                    onClick={() => { setAuthMode('forgot'); setError(''); }}
                    className="text-[11px] font-semibold text-pink-600 hover:underline"
                  >
                    Quên mật khẩu?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-pink-200 text-xs focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-pink-600 via-rose-500 to-pink-500 text-white font-bold text-sm shadow-lotus hover:shadow-lotus-lg hover:scale-[1.01] active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {loading ? 'Đang xử lý...' : (
              authMode === 'login' ? 'Đăng nhập ngay' :
              authMode === 'register' ? 'Đăng ký tài khoản' : 'Gửi mã khôi phục'
            )}
          </button>

          {authMode === 'forgot' && (
            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => setAuthMode('login')}
                className="inline-flex items-center gap-1 text-xs font-bold text-pink-600 hover:underline"
              >
                <ChevronLeft size={14} />
                <span>Quay lại đăng nhập</span>
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
