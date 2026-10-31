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
  Zap,
  BookOpen,
  ArrowRight,
  KeyRound,
  Check
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

  // Forgot Password flow steps: 'request' | 'otp' | 'reset' | 'done'
  const [forgotStep, setForgotStep] = useState('request');
  const [otpCode, setOtpCode] = useState(['', '', '', '']);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!authModalOpen) return null;

  // Password strength logic
  const hasMinLen = password.length >= 6;
  const hasNumOrUpper = /[0-9A-Z]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);
  let strengthScore = 0;
  if (hasMinLen) strengthScore++;
  if (hasNumOrUpper) strengthScore++;
  if (hasSpecial && password.length >= 8) strengthScore++;

  const handleOtpInput = (index, value) => {
    if (value.length > 1) value = value.slice(-1);
    const updated = [...otpCode];
    updated[index] = value;
    setOtpCode(updated);

    if (value && index < 3) {
      const nextInput = document.getElementById(`auth-otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleFormSubmit = async (e) => {
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
          setError(res.data?.message || 'Email hoặc mật khẩu không chính xác.');
        }
      } else if (authMode === 'register') {
        if (!hasMinLen) {
          setError('Mật khẩu bắt buộc phải có ít nhất 6 ký tự.');
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
          setSuccessMsg('Mã OTP 4 số đã được gửi tới email của bạn (Mã thử nghiệm: 1234)');
        } else if (forgotStep === 'otp') {
          const code = otpCode.join('');
          if (code.length < 4) {
            setError('Vui lòng nhập đủ 4 chữ số mã OTP.');
            setLoading(false);
            return;
          }
          sounds.playCorrect();
          setForgotStep('reset');
          setSuccessMsg('Xác thực OTP thành công! Vui lòng nhập mật khẩu mới.');
        } else if (forgotStep === 'reset') {
          if (password !== confirmPassword) {
            setError('Mật khẩu nhập lại không trùng khớp.');
            setLoading(false);
            return;
          }
          sounds.playLevelUp();
          setForgotStep('done');
          setSuccessMsg('Đã cập nhật mật khẩu mới thành công! Mời bạn đăng nhập lại.');
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Đã xảy ra lỗi kết nối với máy chủ.');
      sounds.playWrong();
    } finally {
      setLoading(false);
    }
  };

  const handleSocialQuickLogin = (provider) => {
    sounds.playCorrect();
    const mockUser = {
      id: Date.now(),
      username: `Học viên ${provider}`,
      email: `${provider.toLowerCase()}@nihongohub.vn`,
      role: 'student'
    };
    localStorage.setItem('nihongo_token', 'mock_social_token_jwt');
    setUser(mockUser);
    setAuthModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-slate-950/60 backdrop-blur-md animate-in fade-in">
      <div
        className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-pink-100 overflow-hidden relative flex flex-col md:flex-row max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={() => setAuthModalOpen(false)}
          className="absolute top-4 right-4 z-20 text-slate-400 hover:text-slate-800 p-1.5 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
          aria-label="Đóng"
        >
          <X size={20} />
        </button>

        {/* ── LEFT COLUMN: BRANDING & INSPIRATION (DESKTOP) ── */}
        <div className="hidden md:flex md:w-5/12 bg-gradient-to-br from-slate-950 via-slate-900 to-pink-950 text-white p-8 flex-col justify-between relative overflow-hidden">
          {/* Decorative Japanese Calligraphy Background */}
          <div className="absolute right-2 top-10 text-white/5 font-jp font-black text-9xl pointer-events-none select-none">
            夢
          </div>
          <div className="absolute -bottom-10 -left-10 w-48 h-48 rounded-full bg-pink-500/15 blur-3xl pointer-events-none" />

          {/* Top Brand Logo */}
          <div className="relative z-10 space-y-2">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-pink-600 to-rose-500 flex items-center justify-center font-black text-2xl text-white shadow-lotus">
                H
              </div>
              <span className="font-black text-xl tracking-tight">
                Nihongo<span className="text-pink-400">Hub</span>
              </span>
            </div>

            <p className="text-xs text-pink-200/80 font-medium pt-1">
              Hệ thống Web App học tiếng Nhật N5 thông minh hàng đầu với công nghệ AI và Spaced Repetition.
            </p>
          </div>

          {/* Middle Value Props */}
          <div className="relative z-10 space-y-3.5 my-6">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-pink-500/20 text-pink-400 flex items-center justify-center shrink-0 border border-pink-400/30">
                <BookOpen size={16} />
              </div>
              <div>
                <h4 className="font-bold text-xs text-white">1.512 Từ Vựng Minna Chuẩn</h4>
                <p className="text-[11px] text-slate-400 mb-0">Tích hợp phát âm chuẩn Tokyo Pitch Accent.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-pink-500/20 text-pink-400 flex items-center justify-center shrink-0 border border-pink-400/30">
                <Sparkles size={16} />
              </div>
              <div>
                <h4 className="font-bold text-xs text-white">AI Sensei Hỗ Trợ 24/7</h4>
                <p className="text-[11px] text-slate-400 mb-0">Phân tích mẹo nhớ tượng hình và cấu trúc ngữ pháp.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-pink-500/20 text-pink-400 flex items-center justify-center shrink-0 border border-pink-400/30">
                <Zap size={16} />
              </div>
              <div>
                <h4 className="font-bold text-xs text-white">Đồng Bộ Tiến Độ Đa Thiết Bị</h4>
                <p className="text-[11px] text-slate-400 mb-0">Học trên điện thoại, máy tính bảng hay laptop liền mạch.</p>
              </div>
            </div>
          </div>

          {/* Bottom Quote */}
          <div className="relative z-10 pt-4 border-t border-white/10">
            <p className="text-[11.5px] italic text-pink-200/90 leading-relaxed mb-1">
              "初志貫徹 (Shoshi Kantetsu) — Giữ vững ý chí ban đầu để đi đến ngày hái quả ngọt."
            </p>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
              12.000+ Học viên đang rèn luyện mỗi ngày
            </span>
          </div>
        </div>

        {/* ── RIGHT COLUMN: HIGH-END AUTH FORM ── */}
        <div className="w-full md:w-7/12 p-6 sm:p-10 flex flex-col justify-between">
          <div>
            {/* Header Title */}
            <div className="mb-6">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-50 text-pink-700 font-extrabold text-[11px] uppercase tracking-wider mb-2 border border-pink-100">
                <ShieldCheck size={13} className="text-pink-600" />
                <span>BẢO MẬT HỌC VIÊN NIHONGOHUB</span>
              </div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                {authMode === 'login' && 'Đăng nhập vào hệ thống'}
                {authMode === 'register' && 'Tạo tài khoản học viên mới'}
                {authMode === 'forgot' && 'Khôi phục mật khẩu tài khoản'}
              </h2>
              <p className="text-xs text-slate-500 mt-1 mb-0">
                {authMode === 'login' && 'Chào mừng bạn trở lại! Tiếp tục hành trình chinh phục N5 nào.'}
                {authMode === 'register' && 'Chỉ mất 30 giây để bắt đầu đồng bộ tiến độ học tập trên đám mây.'}
                {authMode === 'forgot' && 'Nhập email đã đăng ký để nhận mã OTP xác thực bảo mật.'}
              </p>
            </div>

            {/* Tab Switcher Pills */}
            {authMode !== 'forgot' && (
              <div className="flex p-1 bg-slate-100 rounded-2xl mb-6">
                <button
                  type="button"
                  onClick={() => { sounds.playFlip(); setAuthMode('login'); setError(''); setSuccessMsg(''); }}
                  className={`flex-1 py-2 text-xs font-extrabold rounded-xl transition-all cursor-pointer ${
                    authMode === 'login'
                      ? 'bg-white text-pink-600 shadow-sm'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Đăng nhập
                </button>
                <button
                  type="button"
                  onClick={() => { sounds.playFlip(); setAuthMode('register'); setError(''); setSuccessMsg(''); }}
                  className={`flex-1 py-2 text-xs font-extrabold rounded-xl transition-all cursor-pointer ${
                    authMode === 'register'
                      ? 'bg-white text-pink-600 shadow-sm'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Đăng ký tài khoản
                </button>
              </div>
            )}

            {/* Error & Success Feedback Banners */}
            {error && (
              <div className="mb-4 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2 animate-in fade-in">
                <AlertCircle size={17} className="shrink-0 text-rose-600" />
                <span>{error}</span>
              </div>
            )}

            {successMsg && (
              <div className="mb-4 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 size={17} className="shrink-0 text-emerald-600" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleFormSubmit} className="space-y-4">
              {/* Register: Student Name */}
              {authMode === 'register' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Họ và tên học viên
                  </label>
                  <div className="relative">
                    <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      required
                      placeholder="Ví dụ: Nguyễn Văn Nhật"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-pink-500/30 focus:border-pink-500 transition-all bg-white"
                    />
                  </div>
                </div>
              )}

              {/* Email (Login, Register, or Forgot Request Step) */}
              {(authMode !== 'forgot' || forgotStep === 'request') && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
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
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-pink-500/30 focus:border-pink-500 transition-all bg-white"
                    />
                  </div>
                </div>
              )}

              {/* Forgot Step: OTP Boxes */}
              {authMode === 'forgot' && forgotStep === 'otp' && (
                <div className="space-y-3 text-center py-2">
                  <label className="block text-xs font-bold text-slate-700">
                    Nhập mã 4 chữ số OTP gửi đến {email}:
                  </label>
                  <div className="flex justify-center gap-3">
                    {[0, 1, 2, 3].map((idx) => (
                      <input
                        key={idx}
                        id={`auth-otp-${idx}`}
                        type="text"
                        maxLength={1}
                        value={otpCode[idx]}
                        onChange={(e) => handleOtpInput(idx, e.target.value)}
                        className="w-12 h-14 text-center text-xl font-black rounded-2xl border-2 border-pink-300 focus:border-pink-600 focus:outline-none bg-pink-50/30 focus:bg-white transition-all shadow-inner"
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
                      Gửi lại mã OTP
                    </button>
                  </p>
                </div>
              )}

              {/* Password Input */}
              {(authMode !== 'forgot' || forgotStep === 'reset') && (
                <div>
                  <div className="flex justify-between items-center mb-1.5">
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
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-pink-500/30 focus:border-pink-500 transition-all bg-white"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>

                  {/* Register Password Strength Visualizer */}
                  {authMode === 'register' && password && (
                    <div className="mt-2 p-2.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5">
                      <div className="flex justify-between text-[10.5px] font-bold">
                        <span className="text-slate-500">Độ mạnh mật khẩu:</span>
                        <span className={strengthScore >= 3 ? 'text-emerald-600' : strengthScore === 2 ? 'text-amber-500' : 'text-rose-500'}>
                          {strengthScore >= 3 ? 'Mạnh' : strengthScore === 2 ? 'Trung bình' : 'Yếu'}
                        </span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-slate-200 overflow-hidden flex gap-0.5">
                        <div className={`h-full flex-1 ${strengthScore >= 1 ? 'bg-rose-500' : 'bg-slate-200'}`} />
                        <div className={`h-full flex-1 ${strengthScore >= 2 ? 'bg-amber-500' : 'bg-slate-200'}`} />
                        <div className={`h-full flex-1 ${strengthScore >= 3 ? 'bg-emerald-500' : 'bg-slate-200'}`} />
                      </div>
                      <div className="flex gap-4 text-[10px] text-slate-500 pt-0.5">
                        <span className={`flex items-center gap-1 ${hasMinLen ? 'text-emerald-600 font-bold' : ''}`}>
                          <Check size={10} /> Ít nhất 6 ký tự
                        </span>
                        <span className={`flex items-center gap-1 ${hasNumOrUpper ? 'text-emerald-600 font-bold' : ''}`}>
                          <Check size={10} /> Chữ hoa hoặc số
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Confirm Password (Reset Step) */}
              {authMode === 'forgot' && forgotStep === 'reset' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
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
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-pink-500/30 focus:border-pink-500 transition-all bg-white"
                    />
                  </div>
                </div>
              )}

              {/* Remember Me Checkbox */}
              {authMode === 'login' && (
                <div className="flex items-center justify-between text-xs text-slate-600 pt-1">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded text-pink-600 focus:ring-pink-500 border-slate-300 accent-pink-600"
                    />
                    <span>Duy trì đăng nhập trên thiết bị này</span>
                  </label>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-pink-600 via-rose-500 to-pink-500 text-white font-black text-sm shadow-lotus hover:shadow-lotus-lg hover:scale-[1.01] active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer"
              >
                {loading ? (
                  'Đang xử lý...'
                ) : authMode === 'login' ? (
                  'Đăng nhập tài khoản'
                ) : authMode === 'register' ? (
                  'Hoàn tất tạo tài khoản'
                ) : forgotStep === 'request' ? (
                  'Gửi mã xác thực OTP'
                ) : forgotStep === 'otp' ? (
                  'Tiếp tục đặt mật khẩu'
                ) : forgotStep === 'reset' ? (
                  'Lưu mật khẩu mới'
                ) : (
                  'Quay lại đăng nhập'
                )}
              </button>

              {/* Back to Login Link */}
              {authMode === 'forgot' && (
                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      sounds.playFlip();
                      setAuthMode('login');
                      setForgotStep('request');
                      setError('');
                    }}
                    className="inline-flex items-center gap-1 text-xs font-bold text-pink-600 hover:underline cursor-pointer"
                  >
                    <ChevronLeft size={14} />
                    <span>Quay lại màn hình đăng nhập</span>
                  </button>
                </div>
              )}

              {/* SSO Social Logins */}
              {authMode !== 'forgot' && (
                <>
                  <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-slate-200" />
                    </div>
                    <div className="relative flex justify-center text-[10.5px] uppercase">
                      <span className="bg-white px-3 text-slate-400 font-bold">
                        Hoặc đăng nhập nhanh qua
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={() => handleSocialQuickLogin('Google')}
                      className="py-2.5 px-4 rounded-xl border border-slate-200 hover:border-pink-300 hover:bg-pink-50/30 text-xs font-bold text-slate-700 flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
                    >
                      <span className="font-black text-rose-500 text-sm">G</span>
                      <span>Google</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSocialQuickLogin('GitHub')}
                      className="py-2.5 px-4 rounded-xl border border-slate-200 hover:border-pink-300 hover:bg-pink-50/30 text-xs font-bold text-slate-700 flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
                    >
                      <span className="font-black text-slate-900 text-sm">Git</span>
                      <span>GitHub</span>
                    </button>
                  </div>
                </>
              )}
            </form>
          </div>

          {/* Footer note */}
          <div className="pt-4 border-t border-slate-100 mt-4 text-center">
            <p className="text-[11px] text-slate-400 mb-0">
              Bằng cách đăng nhập, bạn đồng ý với{' '}
              <a href="#support" onClick={() => setAuthModalOpen(false)} className="text-pink-600 hover:underline">
                Điều khoản & Chính sách bảo mật
              </a>{' '}
              của NihongoHub.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
