import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { authService } from '../services/api';
import {
  X,
  Mail,
  Lock,
  User,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ChevronLeft,
  Eye,
  EyeOff,
  ShieldCheck,
  KeyRound,
  ArrowRight
} from 'lucide-react';
import { sounds } from '../services/sounds';

export default function AuthModal() {
  const { authModalOpen, setAuthModalOpen, authMode, setAuthMode, setUser } = useApp();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Forgot password OTP flow: 'request' | 'otp' | 'reset' | 'done'
  const [forgotStep, setForgotStep] = useState('request');
  const [otpCode, setOtpCode] = useState(['', '', '', '']);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!authModalOpen) return null;

  // Password Strength Calculation
  const calculatePasswordStrength = (pass) => {
    if (!pass) return { score: 0, text: '', color: 'bg-slate-200' };
    let score = 0;
    if (pass.length >= 6) score++;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass) || /[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;

    if (score <= 1) return { score: 1, text: 'Mật khẩu yếu', color: 'bg-rose-500' };
    if (score === 2) return { score: 2, text: 'Mật khẩu trung bình', color: 'bg-amber-500' };
    return { score: 3, text: 'Mật khẩu mạnh & an toàn', color: 'bg-emerald-500' };
  };

  const strength = calculatePasswordStrength(password);

  const handleOtpChange = (idx, val) => {
    if (val.length > 1) val = val.slice(-1);
    const updated = [...otpCode];
    updated[idx] = val;
    setOtpCode(updated);

    // Auto-focus next input
    if (val && idx < 3) {
      const nextInput = document.getElementById(`otp-input-${idx + 1}`);
      nextInput?.focus();
    }
  };

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
        if (password.length < 6) {
          setError('Mật khẩu tối thiểu phải từ 6 ký tự.');
          setLoading(false);
          return;
        }
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
        if (forgotStep === 'request') {
          await authService.forgotPassword({ email });
          sounds.playCorrect();
          setForgotStep('otp');
          setSuccessMsg('Mã xác thực 4 số đã được gửi tới email của bạn (Mã mẫu: 1234)');
        } else if (forgotStep === 'otp') {
          const code = otpCode.join('');
          if (code.length < 4) {
            setError('Vui lòng nhập đủ mã xác thực 4 chữ số.');
            setLoading(false);
            return;
          }
          sounds.playCorrect();
          setForgotStep('reset');
          setSuccessMsg('Xác thực OTP thành công! Mời bạn đặt mật khẩu mới.');
        } else if (forgotStep === 'reset') {
          if (password !== confirmPassword) {
            setError('Mật khẩu nhập lại không khớp.');
            setLoading(false);
            return;
          }
          sounds.playLevelUp();
          setForgotStep('done');
          setSuccessMsg('Mật khẩu đã được đặt lại thành công! Bạn có thể đăng nhập ngay.');
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Đã xảy ra lỗi kết nối máy chủ.');
      sounds.playWrong();
    } finally {
      setLoading(false);
    }
  };

  const handleSocialMockLogin = (provider) => {
    sounds.playCorrect();
    const mockUser = {
      id: 999,
      username: `Học viên ${provider}`,
      email: `${provider.toLowerCase()}@nihongohub.com`,
      role: 'student'
    };
    localStorage.setItem('nihongo_token', 'mock_social_token_123');
    setUser(mockUser);
    setAuthModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-md animate-in fade-in">
      <div
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-pink-100 overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Decor with Lotus Pink Gradient */}
        <div className="bg-gradient-to-r from-pink-600 via-rose-500 to-pink-500 p-6 text-white text-center relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-white/10 blur-xl pointer-events-none" />

          <button
            type="button"
            onClick={() => setAuthModalOpen(false)}
            className="absolute top-4 right-4 text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Đóng"
          >
            <X size={20} />
          </button>

          <div className="w-12 h-12 mx-auto rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center font-black text-2xl text-white mb-2 shadow-inner border border-white/30">
            H
          </div>
          <h3 className="text-xl font-black tracking-tight">
            {authMode === 'login' && 'Chào mừng trở lại!'}
            {authMode === 'register' && 'Tạo tài khoản học viên'}
            {authMode === 'forgot' && 'Khôi phục mật khẩu'}
          </h3>
          <p className="text-xs text-white/90 mt-1 mb-0">
            {authMode === 'login' && 'Đăng nhập để đồng bộ tiến độ học N5 trên mọi thiết bị'}
            {authMode === 'register' && 'Bắt đầu hành trình chinh phục tiếng Nhật cùng AI Sensei'}
            {authMode === 'forgot' && 'Bảo mật 2 lớp qua mã xác thực OTP nhanh chóng'}
          </p>
        </div>

        {/* Tab Switcher */}
        {authMode !== 'forgot' && (
          <div className="flex border-b border-pink-50 p-2 bg-pink-50/40">
            <button
              type="button"
              onClick={() => { setAuthMode('login'); setError(''); setSuccessMsg(''); }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                authMode === 'login'
                  ? 'bg-white text-pink-600 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Đăng nhập
            </button>
            <button
              type="button"
              onClick={() => { setAuthMode('register'); setError(''); setSuccessMsg(''); }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
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

          {/* REGISTER: USERNAME */}
          {authMode === 'register' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Tên hiển thị học viên
              </label>
              <div className="relative">
                <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Hoàng Long"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-pink-200 text-xs focus:outline-none focus:ring-2 focus:ring-pink-500 bg-pink-50/20"
                />
              </div>
            </div>
          )}

          {/* EMAIL (When in login, register, or forgot step request) */}
          {(authMode !== 'forgot' || forgotStep === 'request') && (
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
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-pink-200 text-xs focus:outline-none focus:ring-2 focus:ring-pink-500 bg-pink-50/20"
                />
              </div>
            </div>
          )}

          {/* FORGOT PASSWORD: STEP OTP */}
          {authMode === 'forgot' && forgotStep === 'otp' && (
            <div className="space-y-3 text-center">
              <label className="block text-xs font-bold text-slate-700">
                Nhập mã 4 chữ số gửi đến email:
              </label>
              <div className="flex justify-center gap-3">
                {[0, 1, 2, 3].map((idx) => (
                  <input
                    key={idx}
                    id={`otp-input-${idx}`}
                    type="text"
                    maxLength={1}
                    value={otpCode[idx]}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    className="w-12 h-12 text-center text-lg font-black rounded-xl border-2 border-pink-300 focus:border-pink-600 focus:outline-none bg-pink-50/30"
                  />
                ))}
              </div>
              <p className="text-[11px] text-slate-400">
                Chưa nhận được mã?{' '}
                <button
                  type="button"
                  onClick={() => setForgotStep('request')}
                  className="text-pink-600 font-bold hover:underline cursor-pointer"
                >
                  Gửi lại mã
                </button>
              </p>
            </div>
          )}

          {/* PASSWORD FIELD */}
          {(authMode !== 'forgot' || forgotStep === 'reset') && (
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-bold text-slate-700">
                  {authMode === 'forgot' ? 'Mật khẩu mới' : 'Mật khẩu'}
                </label>
                {authMode === 'login' && (
                  <button
                    type="button"
                    onClick={() => {
                      sounds.playFlip();
                      setAuthMode('forgot');
                      setForgotStep('request');
                      setError('');
                      setSuccessMsg('');
                    }}
                    className="text-[11px] font-semibold text-pink-600 hover:underline cursor-pointer"
                  >
                    Quên mật khẩu?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-pink-200 text-xs focus:outline-none focus:ring-2 focus:ring-pink-500 bg-pink-50/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {/* Password Strength Meter in Register Mode */}
              {authMode === 'register' && password && (
                <div className="mt-2 space-y-1">
                  <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden flex">
                    <div
                      className={`h-full transition-all duration-300 ${strength.color}`}
                      style={{ width: `${(strength.score / 3) * 100}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-bold text-slate-500 block text-right">
                    {strength.text}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* CONFIRM PASSWORD (Forgot Reset Mode) */}
          {authMode === 'forgot' && forgotStep === 'reset' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Nhập lại mật khẩu mới
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-pink-200 text-xs focus:outline-none focus:ring-2 focus:ring-pink-500 bg-pink-50/20"
                />
              </div>
            </div>
          )}

          {/* REMEMBER ME & TERMS */}
          {authMode === 'login' && (
            <div className="flex items-center justify-between text-xs text-slate-600">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded text-pink-600 focus:ring-pink-500 border-pink-300 accent-pink-600"
                />
                <span>Ghi nhớ đăng nhập</span>
              </label>
            </div>
          )}

          {/* SUBMIT BUTTON */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-pink-600 via-rose-500 to-pink-500 text-white font-bold text-xs sm:text-sm shadow-lotus hover:shadow-lotus-lg hover:scale-[1.01] active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              'Đang xử lý...'
            ) : authMode === 'login' ? (
              'Đăng nhập ngay'
            ) : authMode === 'register' ? (
              'Tạo tài khoản học viên'
            ) : forgotStep === 'request' ? (
              'Gửi mã xác thực OTP'
            ) : forgotStep === 'otp' ? (
              'Xác thực mã OTP'
            ) : forgotStep === 'reset' ? (
              'Cập nhật mật khẩu'
            ) : (
              'Quay lại đăng nhập'
            )}
          </button>

          {/* BACK TO LOGIN (When in forgot mode) */}
          {authMode === 'forgot' && (
            <div className="text-center pt-1">
              <button
                type="button"
                onClick={() => {
                  sounds.playFlip();
                  setAuthMode('login');
                  setForgotStep('request');
                }}
                className="inline-flex items-center gap-1 text-xs font-bold text-pink-600 hover:underline cursor-pointer"
              >
                <ChevronLeft size={14} />
                <span>Quay lại đăng nhập</span>
              </button>
            </div>
          )}

          {/* SOCIAL LOGIN DIVIDER */}
          {authMode !== 'forgot' && (
            <>
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200" />
                </div>
                <div className="relative flex justify-center text-[10px] uppercase">
                  <span className="bg-white px-2 text-slate-400 font-bold">
                    Hoặc đăng nhập nhanh với
                  </span>
                </div>
              </div>

              {/* Social Buttons */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleSocialMockLogin('Google')}
                  className="py-2.5 px-3 rounded-xl border border-slate-200 hover:border-pink-200 hover:bg-pink-50/30 text-xs font-bold text-slate-700 flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <span className="font-bold text-rose-500">G</span>
                  <span>Google</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSocialMockLogin('GitHub')}
                  className="py-2.5 px-3 rounded-xl border border-slate-200 hover:border-pink-200 hover:bg-pink-50/30 text-xs font-bold text-slate-700 flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <span className="font-bold text-slate-800">Git</span>
                  <span>GitHub</span>
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
}
