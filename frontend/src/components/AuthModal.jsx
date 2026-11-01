import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { authService } from '../services/api';
import SakuraPulse from './SakuraPulse';
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
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Forgot Password flow steps: 'request' | 'otp' | 'done'
  const [forgotStep, setForgotStep] = useState('request');
  const [otpCode, setOtpCode] = useState(['', '', '', '', '', '']);
  const [receivedOtp, setReceivedOtp] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '463067556799-hd0134jctmmb6jitugkjed7qd78d3uqk.apps.googleusercontent.com';
  const fbAppId = import.meta.env.VITE_FACEBOOK_APP_ID || '1293450782913049';

  useEffect(() => {
    // Initialize Google Identity Services
    if (window.google?.accounts?.id) {
      try {
        window.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: async (response) => {
            if (response.credential) {
              setLoading(true);
              try {
                const res = await authService.socialLogin({
                  provider: 'Google',
                  credential: response.credential
                });
                if (res.data?.success) {
                  sounds.playLevelUp();
                  localStorage.setItem('nihongo_token', res.data.token);
                  setUser(res.data.user);
                  setAuthModalOpen(false);
                } else {
                  setError(res.data?.message || 'Đăng nhập Google thất bại');
                }
              } catch (err) {
                setError(err.response?.data?.message || 'Không thể xác thực với Google.');
              } finally {
                setLoading(false);
              }
            }
          }
        });
      } catch (err) {
        console.warn('Google Sign-In init error:', err);
      }
    }

    // Initialize Facebook SDK
    if (window.FB) {
      try {
        window.FB.init({
          appId: fbAppId,
          cookie: true,
          xfbml: true,
          version: 'v21.0'
        });
      } catch (err) {
        console.warn('Facebook SDK init error:', err);
      }
    }
  }, [authModalOpen]);

  if (!authModalOpen) return null;

  // Password strength logic
  const hasMinLen = password.length >= 6;
  const hasNumOrUpper = /[0-9A-Z]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);
  let strengthScore = 0;
  if (hasMinLen) strengthScore++;
  if (hasNumOrUpper) strengthScore++;
  if (hasSpecial && password.length >= 8) strengthScore++;

  const isPasswordMatch = password && confirmPassword && password === confirmPassword;

  const handleOtpInput = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const digit = value.slice(-1);
    const updated = [...otpCode];
    updated[index] = digit;
    setOtpCode(updated);

    if (digit && index < 5) {
      document.getElementById(`auth-otp-${index + 1}`)?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpCode[index] && index > 0) {
      document.getElementById(`auth-otp-${index - 1}`)?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').trim().replace(/\D/g, '').slice(0, 6);
    if (pasted.length > 0) {
      const updated = ['', '', '', '', '', ''];
      pasted.split('').forEach((char, i) => {
        if (i < 6) updated[i] = char;
      });
      setOtpCode(updated);
      const targetIdx = Math.min(pasted.length, 5);
      document.getElementById(`auth-otp-${targetIdx}`)?.focus();
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
        if (password !== confirmPassword) {
          setError('Mật khẩu xác nhận không trùng khớp với mật khẩu đã nhập.');
          setLoading(false);
          return;
        }

        const res = await authService.register({ username, email, password, confirmPassword });
        if (res.data?.success) {
          sounds.playLevelUp();
          localStorage.setItem('nihongo_token', res.data.token);
          setUser(res.data.user);
          setAuthModalOpen(false);
        } else {
          setError(res.data?.message || 'Đăng ký tài khoản không thành công.');
        }
      } else if (authMode === 'forgot') {
        if (forgotStep === 'request') {
          if (!email.trim()) {
            setError('Vui lòng nhập địa chỉ email đã đăng ký.');
            setLoading(false);
            return;
          }
          const res = await authService.sendOtp({ email });
          if (res.data?.success) {
            sounds.playCorrect();
            setForgotStep('otp');
            setSuccessMsg(res.data.message || 'Mã OTP đã được gửi đến email của bạn.');
            if (res.data.otp) {
              setReceivedOtp(res.data.otp);
            }
          } else {
            setError(res.data?.message || 'Không tìm thấy tài khoản với email này.');
          }
        } else if (forgotStep === 'otp') {
          const code = otpCode.join('');
          if (code.length < 6) {
            setError('Vui lòng nhập đủ 6 chữ số mã OTP xác thực.');
            setLoading(false);
            return;
          }
          if (password.length < 6) {
            setError('Mật khẩu mới phải có ít nhất 6 ký tự.');
            setLoading(false);
            return;
          }
          if (password !== confirmPassword) {
            setError('Mật khẩu xác nhận không trùng khớp.');
            setLoading(false);
            return;
          }

          const res = await authService.resetPasswordOtp({
            email,
            otp: code,
            newPassword: password,
            confirmPassword
          });

          if (res.data?.success) {
            sounds.playLevelUp();
            setForgotStep('done');
            setSuccessMsg(res.data.message || 'Cấp mật khẩu mới thành công! Mời bạn đăng nhập lại.');
            setTimeout(() => {
              setAuthMode('login');
              setForgotStep('request');
              setError('');
            }, 1800);
          } else {
            setError(res.data?.message || 'Mã OTP không hợp lệ hoặc đã hết hạn.');
          }
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Đã xảy ra lỗi kết nối với máy chủ.');
      sounds.playWrong();
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleClick = () => {
    sounds.playFlip();
    setError('');

    // Real Google OAuth 2.0 Identity Services Flow
    if (window.google?.accounts?.oauth2) {
      try {
        const client = window.google.accounts.oauth2.initTokenClient({
          client_id: googleClientId,
          scope: 'email profile openid',
          callback: async (tokenResponse) => {
            if (tokenResponse.error) {
              if (tokenResponse.error === 'popup_closed_by_user') {
                return;
              }
              setError('Xác thực Google gián đoạn: ' + (tokenResponse.error_description || tokenResponse.error));
              return;
            }

            if (tokenResponse.access_token) {
              setLoading(true);
              try {
                // Fetch real user info from official Google endpoint
                const googleRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                  headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
                });
                const googleUser = await googleRes.json();

                if (googleUser && googleUser.email) {
                  const res = await authService.socialLogin({
                    provider: 'Google',
                    accessToken: tokenResponse.access_token,
                    email: googleUser.email,
                    name: googleUser.name || googleUser.email.split('@')[0],
                    avatar: googleUser.picture || ''
                  });

                  if (res.data?.success) {
                    sounds.playLevelUp();
                    localStorage.setItem('nihongo_token', res.data.token);
                    setUser(res.data.user);
                    setAuthModalOpen(false);
                  } else {
                    setError(res.data?.message || 'Đăng nhập Google không thành công.');
                  }
                } else {
                  setError('Không nhận được thông tin tài khoản từ Google.');
                }
              } catch (err) {
                setError(err.response?.data?.message || 'Lỗi kết nối máy chủ khi xử lý Google Login.');
              } finally {
                setLoading(false);
              }
            }
          }
        });
        client.requestAccessToken({ prompt: 'select_account' });
        return;
      } catch (err) {
        console.warn('Google Token Client init error:', err);
      }
    }

    if (window.google?.accounts?.id) {
      window.google.accounts.id.prompt((notification) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          setError('Không thể mở popup Google. Vui lòng cho phép mở popup trong trình duyệt.');
        }
      });
    } else {
      setError('Google SDK chưa sẵn sàng. Vui lòng kiểm tra lại kết nối mạng.');
    }
  };

  const handleFacebookClick = () => {
    sounds.playFlip();
    setError('');

    if (typeof window.FB === 'undefined') {
      setError('Facebook SDK chưa tải xong hoặc bị chặn bởi tiện ích mở rộng trình duyệt (AdBlock/Brave). Vui lòng tắt chặn và thử lại.');
      return;
    }

    try {
      window.FB.login((response) => {
        if (response.authResponse?.accessToken) {
          setLoading(true);
          const accessToken = response.authResponse.accessToken;

          window.FB.api('/me', { fields: 'id,name,email,picture.type(large)' }, async (fbUser) => {
            try {
              const res = await authService.socialLogin({
                provider: 'Facebook',
                accessToken,
                email: fbUser.email || `fb_${fbUser.id}@facebook.hyperjapan.vn`,
                name: fbUser.name || 'Học viên Facebook',
                avatar: fbUser.picture?.data?.url || ''
              });

              if (res.data?.success) {
                sounds.playLevelUp();
                localStorage.setItem('nihongo_token', res.data.token);
                setUser(res.data.user);
                setAuthModalOpen(false);
              } else {
                setError(res.data?.message || 'Đăng nhập Facebook không thành công.');
              }
            } catch (err) {
              setError(err.response?.data?.message || 'Lỗi kết nối máy chủ khi xử lý Facebook Login.');
            } finally {
              setLoading(false);
            }
          });
        } else {
          if (response.status === 'not_authorized') {
            setError('Ứng dụng chưa được bạn cấp quyền đăng nhập trên Facebook.');
          }
        }
      }, { scope: 'public_profile,email' });
    } catch (err) {
      setError('Không thể mở cửa sổ đăng nhập Facebook: ' + (err.message || ''));
    }
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

        {/* ── LEFT COLUMN: BRANDING & SYSTEM IDENTITY ── */}
        <div className="hidden md:flex md:w-5/12 bg-gradient-to-br from-slate-950 via-slate-900 to-pink-950 text-white p-8 flex-col justify-between relative overflow-hidden">
          {/* Decorative Japanese Calligraphy Background */}
          <div className="absolute right-2 top-10 text-white/5 font-jp font-black text-9xl pointer-events-none select-none">
            夢
          </div>
          <div className="absolute -bottom-10 -left-10 w-48 h-48 rounded-full bg-pink-500/15 blur-3xl pointer-events-none" />

          {/* Top Brand Logo */}
          <div className="relative z-10 space-y-2">
            <div className="flex items-center">
              <div className="bg-white/95 px-3 py-1.5 rounded-2xl shadow-lotus inline-block">
                <img
                  src="/hyper_logo.png"
                  alt="HYPER"
                  className="h-8 w-auto object-contain"
                />
              </div>
            </div>

            <p className="text-xs text-pink-200/80 font-medium pt-1">
              Hệ thống Web App học tiếng Nhật thông minh với công nghệ AI và cơ sở dữ liệu PostgreSQL chuẩn mực.
            </p>
          </div>

          {/* Middle Value Props */}
          <div className="relative z-10 space-y-3.5 my-6">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-pink-500/20 text-pink-400 flex items-center justify-center shrink-0 border border-pink-400/30">
                <BookOpen size={16} />
              </div>
              <div>
                <h4 className="font-bold text-xs text-white">Giáo trình chuẩn Minna no Nihongo</h4>
                <p className="text-[11px] text-slate-400 mb-0">Hơn 1.500 từ vựng N5 và bộ đề phát triển N4 tới N1.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-pink-500/20 text-pink-400 flex items-center justify-center shrink-0 border border-pink-400/30">
                <Sparkles size={16} />
              </div>
              <div>
                <h4 className="font-bold text-xs text-white">Trợ lý AI Sensei thông minh</h4>
                <p className="text-[11px] text-slate-400 mb-0">Tự động phân tích điểm yếu cá nhân và đề xuất bài tập tối ưu.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-pink-500/20 text-pink-400 flex items-center justify-center shrink-0 border border-pink-400/30">
                <Zap size={16} />
              </div>
              <div>
                <h4 className="font-bold text-xs text-white">Đồng bộ tiến độ tức thời</h4>
                <p className="text-[11px] text-slate-400 mb-0">Lưu dữ liệu học tập an toàn trên đám mây PostgreSQL.</p>
              </div>
            </div>
          </div>

          {/* Bottom Quote */}
          <div className="relative z-10 pt-4 border-t border-white/10">
            <p className="text-[11.5px] italic text-pink-200/90 leading-relaxed mb-1">
              "初志貫徹 (Shoshi Kantetsu) - Giữ vững ý chí ban đầu để đi đến ngày hái quả ngọt."
            </p>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
              Cộng đồng hơn 12.000 học viên tin cậy
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
                <span>BẢO MẬT HỌC VIÊN HYPER</span>
              </div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                {authMode === 'login' && 'Đăng nhập vào hệ thống'}
                {authMode === 'register' && 'Tạo tài khoản học viên mới'}
                {authMode === 'forgot' && 'Cấp lại mật khẩu tài khoản'}
              </h2>
              <p className="text-xs text-slate-500 mt-1 mb-0">
                {authMode === 'login' && 'Chào mừng bạn trở lại! Tiếp tục hành trình chinh phục tiếng Nhật.'}
                {authMode === 'register' && 'Điền thông tin bên dưới để khởi tạo tài khoản và đồng bộ tiến độ.'}
                {authMode === 'forgot' && 'Nhập email đã đăng ký để nhận mã OTP xác thực và thiết lập mật khẩu mới.'}
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
                <div className="space-y-3 py-1">
                  <div className="text-center">
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Nhập mã 6 chữ số OTP đã gửi tới email:
                    </label>
                    <span className="text-xs font-semibold text-pink-600">{email}</span>
                  </div>

                  {/* Real-time OTP Alert Banner */}
                  {receivedOtp && (
                    <div className="p-3 bg-gradient-to-r from-pink-50 via-rose-50 to-pink-50 border border-pink-200 rounded-2xl flex items-center justify-between text-xs animate-in fade-in shadow-sm">
                      <div className="flex items-center gap-2">
                        <SakuraPulse size={14} />
                        <span className="text-slate-700">Mã OTP: <strong className="text-sm font-mono text-pink-700 tracking-widest bg-white px-2.5 py-0.5 rounded-lg border border-pink-200 ml-1 font-black">{receivedOtp}</strong></span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          sounds.playFlip();
                          const digits = receivedOtp.split('');
                          setOtpCode(digits);
                        }}
                        className="px-3 py-1 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white font-bold text-[11px] rounded-xl shadow-sm transition-all cursor-pointer active:scale-95"
                      >
                        Điền nhanh
                      </button>
                    </div>
                  )}

                  <div className="flex justify-center gap-2 sm:gap-2.5">
                    {[0, 1, 2, 3, 4, 5].map((idx) => (
                      <input
                        key={idx}
                        id={`auth-otp-${idx}`}
                        type="text"
                        maxLength={1}
                        value={otpCode[idx]}
                        onChange={(e) => handleOtpInput(idx, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                        onPaste={handleOtpPaste}
                        className="w-10 sm:w-12 h-12 sm:h-14 text-center text-lg sm:text-xl font-black rounded-xl sm:rounded-2xl border-2 border-pink-300 focus:border-pink-600 focus:outline-none bg-pink-50/30 focus:bg-white transition-all shadow-inner"
                      />
                    ))}
                  </div>

                  <div className="text-center">
                    <button
                      type="button"
                      onClick={() => setForgotStep('request')}
                      className="text-[11px] text-pink-600 font-bold hover:underline cursor-pointer"
                    >
                      Gửi lại mã OTP qua email
                    </button>
                  </div>
                </div>
              )}

              {/* Password Input (Login, Register, or Forgot Step OTP) */}
              {(authMode !== 'forgot' || forgotStep === 'otp') && (
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
                      placeholder={authMode === 'forgot' ? 'Nhập mật khẩu mới' : 'Nhập mật khẩu'}
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

                  {/* Password Strength Visualizer for Register & Forgot OTP */}
                  {(authMode === 'register' || (authMode === 'forgot' && forgotStep === 'otp')) && password && (
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
                          <Check size={10} /> Có chữ hoa hoặc số
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Confirm Password (REQUIRED in Register & Forgot OTP Mode) */}
              {(authMode === 'register' || (authMode === 'forgot' && forgotStep === 'otp')) && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Xác nhận lại mật khẩu
                  </label>
                  <div className="relative">
                    <KeyRound size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      placeholder="Nhập lại mật khẩu để xác nhận"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className={`w-full pl-10 pr-10 py-2.5 rounded-xl border text-xs focus:outline-none focus:ring-2 transition-all bg-white ${
                        confirmPassword && !isPasswordMatch
                          ? 'border-rose-300 focus:ring-rose-500/30 focus:border-rose-500'
                          : confirmPassword && isPasswordMatch
                          ? 'border-emerald-300 focus:ring-emerald-500/30 focus:border-emerald-500'
                          : 'border-slate-200 focus:ring-pink-500/30 focus:border-pink-500'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                    >
                      {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>

                  {confirmPassword && (
                    <div className="mt-1 text-[11px] font-semibold flex items-center gap-1">
                      {isPasswordMatch ? (
                        <span className="text-emerald-600 flex items-center gap-1">
                          <Check size={12} /> Mật khẩu xác nhận trùng khớp
                        </span>
                      ) : (
                        <span className="text-rose-500 flex items-center gap-1">
                          <AlertCircle size={12} /> Mật khẩu xác nhận chưa khớp
                        </span>
                      )}
                    </div>
                  )}
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
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-pink-600 via-rose-500 to-pink-500 text-white font-black text-xs sm:text-sm shadow-lotus hover:shadow-lotus-lg hover:scale-[1.01] active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
              >
                {loading ? (
                  <span>Đang xử lý dữ liệu...</span>
                ) : authMode === 'login' ? (
                  <span>Đăng nhập tài khoản</span>
                ) : authMode === 'register' ? (
                  <span>Đăng ký tài khoản</span>
                ) : forgotStep === 'request' ? (
                  <span>Gửi mã OTP xác thực</span>
                ) : (
                  <span>Cấp mật khẩu mới</span>
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
                      setSuccessMsg('');
                    }}
                    className="inline-flex items-center gap-1 text-xs font-bold text-pink-600 hover:underline cursor-pointer"
                  >
                    <ChevronLeft size={14} />
                    <span>Quay lại màn hình đăng nhập</span>
                  </button>
                </div>
              )}

              {/* SSO Fast Social Logins (Google, Facebook) */}
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
                    {/* Google Button */}
                    <button
                      type="button"
                      onClick={handleGoogleClick}
                      className="py-2.5 px-3 sm:px-4 rounded-xl border border-slate-200 hover:border-pink-300 hover:bg-pink-50/20 text-xs font-bold text-slate-700 flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm active:scale-95"
                    >
                      <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                      </svg>
                      <span>Google</span>
                    </button>

                    {/* Facebook Button */}
                    <button
                      type="button"
                      onClick={handleFacebookClick}
                      className="py-2.5 px-3 sm:px-4 rounded-xl border border-slate-200 hover:border-pink-300 hover:bg-pink-50/20 text-xs font-bold text-slate-700 flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm active:scale-95"
                    >
                      <svg className="w-4 h-4 shrink-0" fill="#1877F2" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                      </svg>
                      <span>Facebook</span>
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
              của HYPER Japanese.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
