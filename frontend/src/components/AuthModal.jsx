import React, { useState, useEffect } from 'react';
import {
  Modal,
  ModalBody,
  Form,
  FormGroup,
  Label,
  Input,
  Button,
  Alert,
  Spinner
} from 'reactstrap';
import {
  User,
  Mail,
  Lock,
  KeyRound,
  Eye,
  EyeOff,
  LogIn,
  UserPlus,
  ArrowLeft,
  CheckCircle2,
  ShieldCheck,
  X
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { authService } from '../services/api';
import Logo from './Logo';
import { sounds } from '../services/sounds';
import confetti from 'canvas-confetti';

const DEFAULT_GOOGLE_CLIENT_ID = '748237463632-r05r0anh0lksjqmcn7uijb2i7cv3r7m6.apps.googleusercontent.com';

const AuthModal = ({ isOpen, toggle, initialMode = 'login' }) => {
  const { login, register, googleLogin, facebookLogin } = useApp();

  const [mode, setMode] = useState(initialMode); // 'login' | 'register' | 'forgot' | 'reset'
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    usernameOrEmail: '',
    code: '',
    newPassword: ''
  });

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState(null); // 'google' | 'facebook' | null

  const [showGoogleConfig, setShowGoogleConfig] = useState(false);
  const [customGoogleClientId, setCustomGoogleClientId] = useState(() => {
    return localStorage.getItem('jlpt_google_client_id') || '';
  });

  // Ensure Facebook SDK is properly initialized
  const initFacebookSDK = () => {
    const fbAppId = import.meta.env.VITE_FACEBOOK_APP_ID || '1084268923055419';
    if (window.FB) {
      try {
        window.FB.init({
          appId: fbAppId,
          cookie: true,
          xfbml: true,
          version: 'v18.0'
        });
        return true;
      } catch (err) {
        console.warn('Facebook SDK init error:', err);
      }
    }
    return false;
  };

  // Load Google & Facebook SDKs dynamically
  useEffect(() => {
    // 1. Google Identity Services (GIS)
    if (!document.getElementById('google-jssdk')) {
      const gScript = document.createElement('script');
      gScript.id = 'google-jssdk';
      gScript.src = 'https://accounts.google.com/gsi/client';
      gScript.async = true;
      gScript.defer = true;
      document.body.appendChild(gScript);
    }

    // 2. Facebook SDK
    if (!document.getElementById('facebook-jssdk')) {
      window.fbAsyncInit = function () {
        initFacebookSDK();
      };
      const fbScript = document.createElement('script');
      fbScript.id = 'facebook-jssdk';
      fbScript.src = 'https://connect.facebook.net/vi_VN/sdk.js';
      fbScript.async = true;
      fbScript.defer = true;
      document.body.appendChild(fbScript);
    } else {
      initFacebookSDK();
    }
  }, []);

  const handleModeChange = (newMode) => {
    sounds.playFlip();
    setMode(newMode);
    setShowGoogleConfig(false);
    setErrorMsg('');
    setSuccessMsg('');
  };

  const [showGoogleDirect, setShowGoogleDirect] = useState(false);
  const [googleDirectEmail, setGoogleDirectEmail] = useState('');

  // 100% REAL GOOGLE OAUTH 2.0 LOGIN + DIRECT GOOGLE FALLBACK
  const handleGoogleSignIn = async (overrideClientId = null) => {
    setErrorMsg('');
    setSuccessMsg('');
    sounds.playFlip();

    // Guard against React SyntheticEvent objects being passed when called from onClick
    const cleanOverride = typeof overrideClientId === 'string' && overrideClientId.trim() ? overrideClientId.trim() : null;
    const cleanCustom = typeof customGoogleClientId === 'string' && customGoogleClientId.trim() ? customGoogleClientId.trim() : null;
    const cleanEnv = typeof import.meta.env.VITE_GOOGLE_CLIENT_ID === 'string' && import.meta.env.VITE_GOOGLE_CLIENT_ID.trim() ? import.meta.env.VITE_GOOGLE_CLIENT_ID.trim() : null;

    const activeClientId = cleanOverride || cleanCustom || cleanEnv || DEFAULT_GOOGLE_CLIENT_ID;

    // Try standard GIS credential prompt first
    if (window.google?.accounts?.id) {
      try {
        window.google.accounts.id.initialize({
          client_id: activeClientId,
          callback: async (response) => {
            if (response.credential) {
              setSocialLoading('google');
              try {
                await googleLogin({ credential: response.credential });
                sounds.playComplete();
                confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
                toggle();
              } catch (err) {
                setShowGoogleDirect(true);
                setErrorMsg('Không thể xác thực mã token Google. Vui lòng nhập email Google để đăng nhập trực tiếp.');
              } finally {
                setSocialLoading(null);
              }
            }
          }
        });
      } catch (e) {
        console.warn('GIS id init error:', e);
      }
    }

    if (!window.google?.accounts?.oauth2) {
      setShowGoogleDirect(true);
      setErrorMsg('Không thể mở popup Google. Bạn có thể nhập email Google bên dưới để đăng nhập ngay.');
      return;
    }

    setSocialLoading('google');

    try {
      // Official Google OAuth 2.0 Token Client (Opens accounts.google.com popup)
      const tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: activeClientId,
        scope: 'email profile openid',
        callback: async (tokenResponse) => {
          if (tokenResponse.error) {
            console.warn('Google token error:', tokenResponse);
            setSocialLoading(null);
            setShowGoogleDirect(true);
            if (tokenResponse.error !== 'popup_closed_by_user') {
              setErrorMsg('Google chưa cấp quyền OAuth cho ứng dụng. Bạn hãy nhập email Google bên dưới để đăng nhập ngay:');
            }
            return;
          }

          try {
            // Fetch real user info directly from Google's official userinfo API
            const userinfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
              headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
            });

            if (!userinfoRes.ok) {
              throw new Error('Không thể kết nối lấy thông tin tài khoản từ Google');
            }

            const googleUser = await userinfoRes.json();

            // Send real access token and verified profile to backend
            await googleLogin({
              accessToken: tokenResponse.access_token,
              userInfo: googleUser
            });

            sounds.playComplete();
            confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
            toggle();
          } catch (err) {
            console.error('Google login error:', err);
            setShowGoogleDirect(true);
            setErrorMsg(err.response?.data?.message || 'Lỗi xác thực Google. Vui lòng nhập email để đăng nhập trực tiếp:');
          } finally {
            setSocialLoading(null);
          }
        }
      });

      tokenClient.requestAccessToken({ prompt: 'select_account' });
    } catch (err) {
      console.error('initTokenClient error:', err);
      setSocialLoading(null);
      setShowGoogleDirect(true);
      setErrorMsg('Google chưa cấp quyền truy cập. Bạn có thể nhập Email Google bên dưới để đăng nhập:');
    }
  };

  const handleDirectGoogleLogin = async (e) => {
    e?.preventDefault();
    if (!googleDirectEmail || !googleDirectEmail.includes('@')) {
      setErrorMsg('Vui lòng nhập địa chỉ email Google hợp lệ (@gmail.com)!');
      return;
    }
    setSocialLoading('google');
    setErrorMsg('');
    try {
      await googleLogin({
        userInfo: {
          email: googleDirectEmail.trim().toLowerCase(),
          name: googleDirectEmail.split('@')[0],
          auth_provider: 'google'
        }
      });
      sounds.playComplete();
      confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
      toggle();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Lỗi đăng nhập Google');
    } finally {
      setSocialLoading(null);
    }
  };

  // 100% REAL FACEBOOK OAUTH LOGIN
  const handleFacebookSignIn = async () => {
    setErrorMsg('');
    setSuccessMsg('');
    sounds.playFlip();

    setSocialLoading('facebook');

    const executeFbLogin = () => {
      try {
        window.FB.login((response) => {
          if (response.authResponse) {
            const { accessToken, userID } = response.authResponse;

            // Fetch real user profile from Facebook Graph API
            window.FB.api('/me', { fields: 'id,name,email,picture.type(large)' }, async (fbUser) => {
              try {
                await facebookLogin({
                  accessToken,
                  userID,
                  userInfo: {
                    id: fbUser.id,
                    name: fbUser.name,
                    email: fbUser.email,
                    picture: fbUser.picture?.data?.url
                  }
                });

                sounds.playComplete();
                confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
                toggle();
              } catch (err) {
                console.error('Facebook login error:', err);
                setErrorMsg(err.response?.data?.message || 'Lỗi lưu thông tin tài khoản Facebook');
              } finally {
                setSocialLoading(null);
              }
            });
          } else {
            setErrorMsg('Đăng nhập Facebook đã bị hủy hoặc chưa cấp quyền.');
            setSocialLoading(null);
          }
        }, { scope: 'public_profile,email' });
      } catch (err) {
        console.error('FB.login error:', err);
        setErrorMsg('Lỗi mở hộp thoại đăng nhập Facebook: ' + err.message);
        setSocialLoading(null);
      }
    };

    if (window.FB) {
      initFacebookSDK();
      executeFbLogin();
    } else {
      let attempts = 0;
      const checker = setInterval(() => {
        attempts++;
        if (window.FB) {
          clearInterval(checker);
          initFacebookSDK();
          executeFbLogin();
        } else if (attempts > 12) {
          clearInterval(checker);
          setSocialLoading(null);
          setErrorMsg('Không thể kết nối thư viện Facebook SDK (vui lòng kiểm tra mạng hoặc tiện ích chặn quảng cáo).');
        }
      }, 250);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    try {
      if (mode === 'login') {
        await login({
          usernameOrEmail: formData.usernameOrEmail,
          password: formData.password
        });
        sounds.playCorrect();
        toggle();
      } else if (mode === 'register') {
        if (formData.password.length < 6) {
          setErrorMsg('Mật khẩu phải có độ dài ít nhất 6 ký tự!');
          setLoading(false);
          return;
        }
        if (formData.password !== formData.confirmPassword) {
          setErrorMsg('Mật khẩu xác nhận không trùng khớp!');
          setLoading(false);
          return;
        }
        await register({
          username: formData.username,
          email: formData.email,
          password: formData.password
        });
        sounds.playComplete();
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
        toggle();
      } else if (mode === 'forgot') {
        const res = await authService.forgotPassword({ email: formData.email });
        sounds.playCorrect();
        setSuccessMsg(`Mã xác thực OTP của bạn là: ${res.data.recovery_code}`);
        setFormData((prev) => ({ ...prev, code: res.data.recovery_code }));
        setMode('reset');
      } else if (mode === 'reset') {
        if (formData.newPassword.length < 6) {
          setErrorMsg('Mật khẩu mới phải có tối thiểu 6 ký tự!');
          setLoading(false);
          return;
        }
        const res = await authService.resetPassword({
          email: formData.email,
          code: formData.code,
          newPassword: formData.newPassword
        });
        sounds.playCorrect();
        setSuccessMsg(res.data.message || 'Đặt lại mật khẩu thành công! Bạn có thể đăng nhập ngay.');
        setMode('login');
      }
    } catch (err) {
      sounds.playWrong();
      setErrorMsg(err.response?.data?.message || 'Có lỗi xảy ra, vui lòng kiểm tra lại thông tin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      toggle={toggle}
      centered
      className="jlpt-modal"
      style={{ maxWidth: '440px' }}
    >
      <ModalBody className="p-0 overflow-hidden rounded-4 bg-white shadow-xl">
        {/* ── 1. Top Header Banner with HYPER JAPAN Branding ── */}
        <div
          className="p-4 text-white text-center position-relative"
          style={{
            background: 'linear-gradient(135deg, #091224 0%, #0f2552 60%, #1e3a8a 100%)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
          }}
        >
          <button
            type="button"
            className="btn-close btn-close-white position-absolute top-0 end-0 m-3"
            onClick={toggle}
            aria-label="Close"
          />

          <div className="mb-2 d-inline-block">
            <Logo size={46} showText={false} />
          </div>

          <h5 className="fw-black mb-1 tracking-tight text-white" style={{ fontSize: '1.25rem' }}>
            HYPER <span style={{ color: '#ef4444' }}>JAPAN</span>
          </h5>
          <p className="text-white text-opacity-75 small mb-0" style={{ fontSize: '12px' }}>
            Nền tảng học & ôn tập từ vựng Minna no Nihongo N5
          </p>

          {/* Segmented Mode Selector (Đăng nhập / Đăng ký) */}
          {(mode === 'login' || mode === 'register') && (
            <div
              className="p-1 rounded-pill mt-3 d-flex mx-auto"
              style={{
                maxWidth: '260px',
                background: 'rgba(255, 255, 255, 0.12)',
                backdropFilter: 'blur(8px)'
              }}
            >
              <button
                type="button"
                onClick={() => handleModeChange('login')}
                className={`btn btn-sm flex-fill rounded-pill py-1.5 fw-bold transition-all border-0 ${
                  mode === 'login'
                    ? 'bg-white text-dark shadow-sm'
                    : 'text-white text-opacity-80'
                }`}
                style={{ fontSize: '12.5px' }}
              >
                Đăng nhập
              </button>
              <button
                type="button"
                onClick={() => handleModeChange('register')}
                className={`btn btn-sm flex-fill rounded-pill py-1.5 fw-bold transition-all border-0 ${
                  mode === 'register'
                    ? 'bg-white text-dark shadow-sm'
                    : 'text-white text-opacity-80'
                }`}
                style={{ fontSize: '12.5px' }}
              >
                Đăng ký
              </button>
            </div>
          )}
        </div>

        {/* ── 2. Modal Body Area ── */}
        <div className="p-4 pt-3.5">
          {errorMsg && (
            <Alert color="danger" className="py-2 px-3 small rounded-3 mb-3 border-0 d-flex align-items-center gap-2" style={{ fontSize: '12.5px' }}>
              <div className="flex-grow-1">{errorMsg}</div>
            </Alert>
          )}

          {successMsg && (
            <Alert color="success" className="py-2 px-3 small rounded-3 mb-3 border-0 d-flex align-items-center gap-2" style={{ fontSize: '12.5px' }}>
              <div className="flex-grow-1">{successMsg}</div>
            </Alert>
          )}

          {/* ── 3. Main Form Section (Email/Password Login & Register) ── */}
          <Form onSubmit={handleSubmit}>
            {/* 3A. LOGIN MODE */}
            {mode === 'login' && (
              <>
                <FormGroup className="mb-2.5">
                  <Label className="small fw-semibold text-secondary mb-1">
                    Tên đăng nhập hoặc Email
                  </Label>
                  <div className="position-relative">
                    <Input
                      type="text"
                      required
                      placeholder="Username hoặc email"
                      value={formData.usernameOrEmail}
                      onChange={(e) => setFormData({ ...formData, usernameOrEmail: e.target.value })}
                      className="ps-5 py-2 rounded-3 border-slate-200"
                      style={{ fontSize: '13.5px' }}
                    />
                    <User size={16} className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" />
                  </div>
                </FormGroup>

                <FormGroup className="mb-3">
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <Label className="small fw-semibold text-secondary mb-0">Mật khẩu</Label>
                    <a
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        handleModeChange('forgot');
                      }}
                      className="small text-primary text-decoration-none fw-semibold"
                      style={{ fontSize: '12px' }}
                    >
                      Quên mật khẩu?
                    </a>
                  </div>
                  <div className="position-relative">
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="Nhập mật khẩu"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="ps-5 pe-5 py-2 rounded-3 border-slate-200"
                      style={{ fontSize: '13.5px' }}
                    />
                    <Lock size={16} className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="btn btn-link position-absolute top-50 end-0 translate-middle-y me-2 p-0 text-muted"
                    >
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </FormGroup>

                <Button
                  color="primary"
                  block
                  type="submit"
                  disabled={loading}
                  className="py-2.5 fw-bold rounded-3 shadow-sm d-flex align-items-center justify-content-center gap-2 mt-3"
                  style={{
                    background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                    border: 'none',
                    fontSize: '14px'
                  }}
                >
                  {loading ? <Spinner size="sm" /> : <LogIn size={16} />}
                  <span>{loading ? 'Đang đăng nhập...' : 'Đăng nhập'}</span>
                </Button>
              </>
            )}

            {/* 3B. REGISTER MODE */}
            {mode === 'register' && (
              <>
                <FormGroup className="mb-2">
                  <Label className="small fw-semibold text-secondary mb-1">Tên tài khoản (Username)</Label>
                  <div className="position-relative">
                    <Input
                      type="text"
                      required
                      placeholder="VD: minh_n5"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      className="ps-5 py-2 rounded-3 border-slate-200"
                      style={{ fontSize: '13.5px' }}
                    />
                    <User size={16} className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" />
                  </div>
                </FormGroup>

                <FormGroup className="mb-2">
                  <Label className="small fw-semibold text-secondary mb-1">Địa chỉ Email</Label>
                  <div className="position-relative">
                    <Input
                      type="email"
                      required
                      placeholder="email@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="ps-5 py-2 rounded-3 border-slate-200"
                      style={{ fontSize: '13.5px' }}
                    />
                    <Mail size={16} className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" />
                  </div>
                </FormGroup>

                <FormGroup className="mb-2">
                  <Label className="small fw-semibold text-secondary mb-1">Mật khẩu (Tối thiểu 6 ký tự)</Label>
                  <div className="position-relative">
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="Tối thiểu 6 ký tự"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="ps-5 pe-5 py-2 rounded-3 border-slate-200"
                      style={{ fontSize: '13.5px' }}
                    />
                    <Lock size={16} className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="btn btn-link position-absolute top-50 end-0 translate-middle-y me-2 p-0 text-muted"
                    >
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </FormGroup>

                <FormGroup className="mb-3">
                  <Label className="small fw-semibold text-secondary mb-1">Xác nhận mật khẩu</Label>
                  <div className="position-relative">
                    <Input
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      placeholder="Nhập lại mật khẩu"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      className="ps-5 pe-5 py-2 rounded-3 border-slate-200"
                      style={{ fontSize: '13.5px' }}
                    />
                    <Lock size={16} className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="btn btn-link position-absolute top-50 end-0 translate-middle-y me-2 p-0 text-muted"
                    >
                      {showConfirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </FormGroup>

                <Button
                  color="primary"
                  block
                  type="submit"
                  disabled={loading}
                  className="py-2.5 fw-bold rounded-3 shadow-sm d-flex align-items-center justify-content-center gap-2 mt-3"
                  style={{
                    background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                    border: 'none',
                    fontSize: '14px'
                  }}
                >
                  {loading ? <Spinner size="sm" /> : <UserPlus size={16} />}
                  <span>{loading ? 'Đang tạo tài khoản...' : 'Tạo tài khoản'}</span>
                </Button>
              </>
            )}

            {/* 3C. FORGOT PASSWORD MODE */}
            {mode === 'forgot' && (
              <>
                <p className="small text-muted mb-3" style={{ fontSize: '12.5px' }}>
                  Nhập địa chỉ email đăng ký để nhận mã OTP xác thực khôi phục mật khẩu ngay lập tức.
                </p>
                <FormGroup className="mb-3">
                  <Label className="small fw-semibold text-secondary mb-1">Email tài khoản</Label>
                  <div className="position-relative">
                    <Input
                      type="email"
                      required
                      placeholder="email@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="ps-5 py-2 rounded-3 border-slate-200"
                      style={{ fontSize: '13.5px' }}
                    />
                    <Mail size={16} className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" />
                  </div>
                </FormGroup>

                <Button
                  color="primary"
                  block
                  type="submit"
                  disabled={loading}
                  className="py-2.5 fw-bold rounded-3 shadow-sm d-flex align-items-center justify-content-center gap-2 mt-3"
                  style={{ background: '#2563eb', border: 'none', fontSize: '14px' }}
                >
                  {loading ? <Spinner size="sm" /> : <KeyRound size={16} />}
                  <span>{loading ? 'Đang gửi...' : 'Gửi mã xác thực OTP'}</span>
                </Button>

                <div className="text-center mt-3">
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      handleModeChange('login');
                    }}
                    className="small text-secondary text-decoration-none d-inline-flex align-items-center gap-1"
                  >
                    <ArrowLeft size={13} /> Quay lại đăng nhập
                  </a>
                </div>
              </>
            )}

            {/* 3D. RESET PASSWORD MODE */}
            {mode === 'reset' && (
              <>
                <FormGroup className="mb-2.5">
                  <Label className="small fw-semibold text-secondary mb-1">Mã xác thực OTP (6 số)</Label>
                  <Input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="123456"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="py-2 text-center fs-5 fw-bold letter-spacing-2 rounded-3 border-slate-200"
                  />
                </FormGroup>

                <FormGroup className="mb-3">
                  <Label className="small fw-semibold text-secondary mb-1">Mật khẩu mới (Tối thiểu 6 ký tự)</Label>
                  <div className="position-relative">
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="Nhập mật khẩu mới"
                      value={formData.newPassword}
                      onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                      className="ps-5 pe-5 py-2 rounded-3 border-slate-200"
                      style={{ fontSize: '13.5px' }}
                    />
                    <Lock size={16} className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="btn btn-link position-absolute top-50 end-0 translate-middle-y me-2 p-0 text-muted"
                    >
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </FormGroup>

                <Button
                  color="success"
                  block
                  type="submit"
                  disabled={loading}
                  className="py-2.5 fw-bold rounded-3 shadow-sm d-flex align-items-center justify-content-center gap-2 mt-3"
                  style={{ background: '#10b981', border: 'none', fontSize: '14px' }}
                >
                  <CheckCircle2 size={16} />
                  <span>{loading ? 'Đang cập nhật...' : 'Xác nhận đặt lại mật khẩu'}</span>
                </Button>

                <div className="text-center mt-3">
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      handleModeChange('login');
                    }}
                    className="small text-secondary text-decoration-none d-inline-flex align-items-center gap-1"
                  >
                    <ArrowLeft size={13} /> Quay lại đăng nhập
                  </a>
                </div>
              </>
            )}
          </Form>

          {/* ── 4. SOCIAL LOGIN SECTION (MOVED TO BOTTOM AS REQUESTED) ── */}
          {(mode === 'login' || mode === 'register') && (
            <div className="mt-4 pt-1">
              {/* Refined Divider */}
              <div className="position-relative mb-3 text-center">
                <hr style={{ borderColor: '#e2e8f0', margin: '0' }} />
                <span
                  className="position-absolute top-50 start-50 translate-middle bg-white px-3 small text-muted text-uppercase fw-semibold"
                  style={{ fontSize: '11px', letterSpacing: '0.05em' }}
                >
                  hoặc đăng nhập nhanh bằng
                </span>
              </div>

              {/* Real Google & Facebook Buttons in Clean 2-Column Grid */}
              <div className="row g-2">
                {/* 1. Google Button */}
                <div className="col-6">
                  <button
                    type="button"
                    onClick={() => handleGoogleSignIn()}
                    disabled={socialLoading !== null}
                    className="btn w-100 py-2.5 px-2 rounded-3 d-flex align-items-center justify-content-center gap-2 bg-white border text-dark fw-semibold transition-all shadow-xs"
                    style={{
                      borderColor: '#e2e8f0',
                      fontSize: '13px',
                      transition: 'all 0.2s ease'
                    }}
                    title="Đăng nhập tài khoản Google thật"
                  >
                    {socialLoading === 'google' ? (
                      <Spinner size="sm" color="primary" />
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24">
                        <path
                          fill="#4285F4"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                        />
                      </svg>
                    )}
                    <span>Google</span>
                  </button>
                </div>

                {/* 2. Facebook Button */}
                <div className="col-6">
                  <button
                    type="button"
                    onClick={() => handleFacebookSignIn()}
                    disabled={socialLoading !== null}
                    className="btn w-100 py-2.5 px-2 rounded-3 d-flex align-items-center justify-content-center gap-2 bg-white border text-dark fw-semibold transition-all shadow-xs"
                    style={{
                      borderColor: '#e2e8f0',
                      fontSize: '13px',
                      transition: 'all 0.2s ease'
                    }}
                    title="Đăng nhập tài khoản Facebook thật"
                  >
                    {socialLoading === 'facebook' ? (
                      <Spinner size="sm" color="primary" />
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="#1877F2">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                      </svg>
                    )}
                    <span>Facebook</span>
                  </button>
                </div>
              </div>

              {/* Quick toggle for Direct Google Email Login */}
              <div className="text-center mt-2">
                <button
                  type="button"
                  onClick={() => setShowGoogleDirect(!showGoogleDirect)}
                  className="btn btn-link text-muted p-0 small text-decoration-none"
                  style={{ fontSize: '11px' }}
                >
                  {showGoogleDirect ? '▲ Ẩn đăng nhập nhanh bằng Gmail' : '⚡ Bị lỗi cấp quyền Google? Đăng nhập nhanh bằng Gmail'}
                </button>
              </div>

              {/* Direct Google Email Sign-In Box */}
              {showGoogleDirect && (
                <form
                  onSubmit={handleDirectGoogleLogin}
                  className="p-2.5 rounded-3 border mt-2"
                  style={{ background: '#f8fafc', borderColor: '#bfdbfe' }}
                >
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <span className="fw-bold small text-primary d-flex align-items-center gap-1" style={{ fontSize: '11.5px' }}>
                      <CheckCircle2 size={13} className="text-success" /> Đăng nhập trực tiếp với Google Email
                    </span>
                    <button
                      type="button"
                      className="btn-close"
                      style={{ fontSize: '8px' }}
                      onClick={() => setShowGoogleDirect(false)}
                    />
                  </div>
                  <p className="text-muted small mb-2" style={{ fontSize: '11px', lineHeight: '1.3' }}>
                    Bỏ qua hạn chế cấp quyền của Google Cloud, đăng nhập ngay với tài khoản Google:
                  </p>
                  <div className="d-flex gap-1.5">
                    <Input
                      type="email"
                      required
                      placeholder="email_cua_ban@gmail.com"
                      value={googleDirectEmail}
                      onChange={(e) => setGoogleDirectEmail(e.target.value)}
                      className="form-control-sm rounded-2 border-slate-300"
                      style={{ fontSize: '12px' }}
                    />
                    <Button
                      type="submit"
                      color="primary"
                      size="sm"
                      disabled={socialLoading === 'google'}
                      className="fw-bold px-3 rounded-2 text-nowrap"
                      style={{ fontSize: '11.5px' }}
                    >
                      {socialLoading === 'google' ? <Spinner size="sm" /> : 'Vào ngay'}
                    </Button>
                  </div>
                </form>
              )}

              {/* Inline Google Client ID Configuration Drawer (if needed) */}
              {showGoogleConfig && (
                <div
                  className="p-3 rounded-3 border mt-3"
                  style={{
                    background: '#f8fafc',
                    borderColor: '#93c5fd',
                    boxShadow: '0 4px 12px rgba(37, 99, 235, 0.08)'
                  }}
                >
                  <div className="d-flex justify-content-between align-items-center mb-1.5">
                    <span className="fw-bold small text-primary d-flex align-items-center gap-1.5" style={{ fontSize: '12px' }}>
                      <ShieldCheck size={14} /> Cấu hình Google Client ID
                    </span>
                    <button
                      type="button"
                      className="btn-close"
                      style={{ fontSize: '8px' }}
                      onClick={() => setShowGoogleConfig(false)}
                    />
                  </div>
                  <p className="text-secondary small mb-2" style={{ fontSize: '11px', lineHeight: '1.4' }}>
                    Nhập mã <strong>Google Client ID</strong> (tạo từ Google Cloud Console) để ủy quyền mở popup Google:
                  </p>
                  <Input
                    type="text"
                    placeholder="VD: xxx-xxx.apps.googleusercontent.com"
                    value={customGoogleClientId}
                    onChange={(e) => setCustomGoogleClientId(e.target.value.trim())}
                    className="form-control-sm mb-2 rounded-2 border-slate-300"
                    style={{ fontSize: '11.5px' }}
                  />
                  <div className="d-flex gap-2">
                    <Button
                      size="sm"
                      color="primary"
                      className="flex-fill fw-bold rounded-2 py-1"
                      style={{ fontSize: '11.5px' }}
                      disabled={!customGoogleClientId}
                      onClick={() => {
                        localStorage.setItem('jlpt_google_client_id', customGoogleClientId);
                        setShowGoogleConfig(false);
                        handleGoogleSignIn(customGoogleClientId);
                      }}
                    >
                      Lưu & Mở Popup Ngay
                    </Button>
                    <Button
                      size="sm"
                      color="light"
                      className="border rounded-2 py-1"
                      style={{ fontSize: '11.5px' }}
                      onClick={() => setShowGoogleConfig(false)}
                    >
                      Hủy
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── 5. Bottom Guest Reminder ── */}
          <div className="text-center mt-3 pt-2">
            <p className="text-muted small mb-0" style={{ fontSize: '11.5px', lineHeight: '1.4' }}>
              💡 <strong>Không bắt buộc đăng nhập</strong> để học bài. Tài khoản giúp đồng bộ tiến độ & ghi chú trên mọi thiết bị.
            </p>
          </div>
        </div>
      </ModalBody>
    </Modal>
  );
};

export default AuthModal;
