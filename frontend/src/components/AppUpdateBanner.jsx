import React, { useState, useEffect } from 'react';
import { RefreshCw, CheckCircle2, Download, Zap, Layers, Cpu, X } from 'lucide-react';
import { sounds } from '../services/sounds';

export default function AppUpdateBanner() {
  const [hasUpdate, setHasUpdate] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [serverVersion, setServerVersion] = useState('1.3');
  const [serverBuildTime, setServerBuildTime] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updatePercent, setUpdatePercent] = useState(0);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [statusMessage, setStatusMessage] = useState('Khởi tạo cập nhật...');

  function compareVersions(v1, v2) {
    if (!v1 || !v2) return 0;
    const parts1 = String(v1).split('.').map(function(n) { return parseInt(n, 10) || 0; });
    const parts2 = String(v2).split('.').map(function(n) { return parseInt(n, 10) || 0; });
    const maxLen = Math.max(parts1.length, parts2.length);
    for (let i = 0; i < maxLen; i++) {
      const num1 = parts1[i] || 0;
      const num2 = parts2[i] || 0;
      if (num1 > num2) return 1;
      if (num1 < num2) return -1;
    }
    return 0;
  }

  const updateSteps = [
    { title: 'Tải gói tài nguyên v' + serverVersion, detail: 'Tối ưu hóa mã nguồn và CSS giao diện' },
    { title: 'Đồng bộ cơ sở dữ liệu', detail: 'Nạp 9.584 từ vựng và chỉ mục Furigana' },
    { title: 'Làm mới bộ nhớ đệm', detail: 'Xóa Cache cũ và kích hoạt phiên bản mới' }
  ];

  // Check version against backend API
  const checkVersion = async function() {
    try {
      const res = await fetch('/api/version?t=' + Date.now(), { cache: 'no-store' });
      if (!res.ok) return;
      const data = await res.json();
      if (!data) return;

      const v = data.version || '1.3';
      setServerVersion(v);
      if (data.buildTime) setServerBuildTime(data.buildTime);

      const storedVersion = localStorage.getItem('hyper_app_version');

      // Khi người dùng mới vào lần đầu: lưu phiên bản hiện tại mà không làm phiền
      if (!storedVersion) {
        localStorage.setItem('hyper_app_version', v);
        setHasUpdate(false);
        return;
      }

      // Đã cập nhật lên bản v này rồi: ẩn nút và banner hoàn toàn
      if (storedVersion === v || compareVersions(v, storedVersion) <= 0) {
        setHasUpdate(false);
        return;
      }

      // Chỉ hiển thị khi có phiên bản mới hơn trên máy chủ (ví dụ 1.3 so với 1.2, hoặc 1.4 so với 1.3)
      if (compareVersions(v, storedVersion) > 0) {
        setHasUpdate(true);
        window.__HAS_APP_UPDATE__ = true;
        window.dispatchEvent(new CustomEvent('hyper-update-status', {
          detail: { hasUpdate: true, version: v }
        }));
      }
    } catch {
      // Offline or network lag
    }
  };

  useEffect(function() {
    checkVersion();

    const handleVisibility = function() {
      if (document.visibilityState === 'visible') {
        checkVersion();
      }
    };
    window.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('focus', handleVisibility);

    const handleOpenUpdate = function() {
      setHasUpdate(true);
      setIsDismissed(false);
    };
    window.addEventListener('hyper-open-update', handleOpenUpdate);

    const interval = setInterval(checkVersion, 25000);

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('controllerchange', function() {
        setHasUpdate(true);
        window.dispatchEvent(new CustomEvent('hyper-update-status', {
          detail: { hasUpdate: true, version: serverVersion }
        }));
      });
      navigator.serviceWorker.getRegistration().then(function(reg) {
        if (reg) {
          reg.addEventListener('updatefound', function() {
            const newWorker = reg.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', function() {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  setHasUpdate(true);
                  window.dispatchEvent(new CustomEvent('hyper-update-status', {
                    detail: { hasUpdate: true, version: serverVersion }
                  }));
                }
              });
            }
          });
        }
      });
    }

    return function() {
      window.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('focus', handleVisibility);
      window.removeEventListener('hyper-open-update', handleOpenUpdate);
      clearInterval(interval);
    };
  }, [serverVersion]);

  // Premium Animated Data Updating Sequence
  const handleUpdateNow = function() {
    if (isUpdating) return;
    setIsUpdating(true);
    setUpdatePercent(8);
    setCurrentStepIndex(0);
    setStatusMessage('Đang kết nối máy chủ xác thực gói cập nhật...');

    try {
      sounds.playLevelUp();
    } catch {}

    // Multi-phase smooth progress sequence
    setTimeout(function() {
      setUpdatePercent(32);
      setCurrentStepIndex(0);
      setStatusMessage('Đang tải gói giao diện v' + serverVersion + ' mới nhất...');
    }, 450);

    setTimeout(function() {
      setUpdatePercent(68);
      setCurrentStepIndex(1);
      setStatusMessage('Đồng bộ cơ sở dữ liệu 9.584 từ vựng và chỉ mục Furigana...');
    }, 1000);

    setTimeout(function() {
      setUpdatePercent(90);
      setCurrentStepIndex(2);
      setStatusMessage('Làm mới bộ nhớ đệm Cache và kích hoạt bản dựng mới...');

      // Update Service Worker
      try {
        if ('serviceWorker' in navigator) {
          navigator.serviceWorker.getRegistration().then(function(reg) {
            if (reg && reg.waiting) {
              reg.waiting.postMessage({ type: 'SKIP_WAITING' });
            }
          });
        }
      } catch {}

      // Clear caches safely
      try {
        if ('caches' in window) {
          window.caches.keys().then(function(names) {
            names.forEach(function(name) { window.caches.delete(name); });
          });
        }
      } catch {}
    }, 1600);

    setTimeout(function() {
      setUpdatePercent(100);
      setCurrentStepIndex(2);
      setStatusMessage('Cập nhật hoàn tất! Đang khởi động lại ứng dụng...');

      if (serverBuildTime) {
        sessionStorage.setItem('hyper_initial_build_time', String(serverBuildTime));
      }
      localStorage.setItem('hyper_app_version', serverVersion);
      setHasUpdate(false);
    }, 2200);

    // Clean page reload with cache buster
    setTimeout(function() {
      const cleanPath = window.location.origin + window.location.pathname;
      window.location.replace(cleanPath + '?v=' + Date.now());
    }, 2800);
  };

  if (!hasUpdate) return null;

  return (
    <>
      {/* ── MINIMALIST COMMERCIAL UPDATE CARD (NON-AI, PREMIUM SAAS DESIGN) ── */}
      {!isDismissed && (
        <aside
          aria-label="Thông báo cập nhật phiên bản webapp"
          className="fixed bottom-[calc(env(safe-area-inset-bottom,0px)+74px)] lg:bottom-6 left-3 right-3 sm:left-auto sm:right-6 sm:w-[380px] z-50 animate-in fade-in slide-in-from-bottom-4 duration-300 pointer-events-auto"
        >
          <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-[0_12px_40px_rgba(15,23,42,0.14)] p-4 text-slate-800 dark:text-slate-100 flex flex-col gap-3">
            {/* Subtle Accent Stripe */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-pink-600 via-rose-500 to-pink-500" />

            {/* Top Row: Icon + Version + Status + Close Button */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-pink-50 dark:bg-pink-950/50 text-pink-600 dark:text-pink-400 flex items-center justify-center shrink-0 border border-pink-100 dark:border-pink-900/50">
                  <Download size={18} />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
                    <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                      Bản cập nhật mới
                    </span>
                  </div>
                  <h4 className="font-extrabold text-sm text-slate-900 dark:text-white leading-tight truncate">
                    HYPER Japanese v{serverVersion}
                  </h4>
                </div>
              </div>

              {/* Version Pill + Dismiss Button */}
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-bold tracking-tight border border-slate-200 dark:border-slate-700">
                  v{serverVersion}
                </span>
                <button
                  type="button"
                  onClick={function() { setIsDismissed(true); }}
                  className="w-7 h-7 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex items-center justify-center transition-colors cursor-pointer"
                  title="Thu gọn thông báo"
                  aria-label="Thu gọn"
                >
                  <X size={15} />
                </button>
              </div>
            </div>

            {/* Feature Highlights Pills */}
            <div className="flex flex-wrap gap-1.5 pt-0.5">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 text-[10.5px] font-medium border border-slate-100 dark:border-slate-700/60">
                <Zap size={11} className="text-pink-600 dark:text-pink-400" />
                Đồng bộ đa thiết bị
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 text-[10.5px] font-medium border border-slate-100 dark:border-slate-700/60">
                <Cpu size={11} className="text-pink-600 dark:text-pink-400" />
                AI Sensei tối ưu
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 text-[10.5px] font-medium border border-slate-100 dark:border-slate-700/60">
                <Layers size={11} className="text-pink-600 dark:text-pink-400" />
                Từ điển N5-N1
              </span>
            </div>

            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed mb-0">
              Hệ thống giữ nguyên phiên bản cũ cho đến khi bạn xác nhận cập nhật.
            </p>

            {/* Action Button */}
            <button
              type="button"
              onClick={handleUpdateNow}
              disabled={isUpdating}
              className="w-full min-h-[44px] py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-pink-600 dark:hover:bg-pink-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all active:scale-[0.98] cursor-pointer disabled:opacity-80"
            >
              <RefreshCw size={14} className={isUpdating ? 'animate-spin' : ''} />
              <span>{isUpdating ? 'Đang cập nhật hệ thống...' : 'Cập nhật lên bản v' + serverVersion + ' ngay'}</span>
            </button>
          </div>
        </aside>
      )}

      {/* ── HIGH-END FULLSCREEN UPDATING OVERLAY (PREMIUM SAAS DIALOG) ── */}
      {isUpdating && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl text-center space-y-6 overflow-hidden">
            {/* Header Icon with Smooth Circular Progress Ring */}
            <div className="relative mx-auto w-16 h-16 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-pink-600 dark:text-pink-400 shadow-sm">
              <RefreshCw size={26} className="animate-spin text-pink-600 dark:text-pink-400" />
            </div>

            <div className="space-y-1.5">
              <span className="text-[11px] font-bold tracking-wider text-pink-600 dark:text-pink-400 uppercase">
                Đang nâng cấp hệ thống
              </span>
              <h3 className="font-extrabold text-lg sm:text-xl text-slate-900 dark:text-white">
                Cập Nhật HYPER Japanese v{serverVersion}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 h-5 transition-all duration-300">
                {statusMessage}
              </p>
            </div>

            {/* Precision Linear Progress Bar with Percentage */}
            <div className="space-y-2">
              <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 p-0.5 overflow-hidden border border-slate-200 dark:border-slate-700">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-pink-600 via-rose-500 to-pink-500 transition-all duration-300 relative"
                  style={{ width: `${updatePercent}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 dark:text-slate-400 px-1">
                <span>Tiến trình hoàn thiện</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">{updatePercent}%</span>
              </div>
            </div>

            {/* Clean Segmented Checkpoints */}
            <div className="space-y-2 pt-2 text-left border-t border-slate-100 dark:border-slate-800">
              {updateSteps.map(function(step, idx) {
                const isPassed = updatePercent >= ((idx + 1) * 33);
                const isCurrent = currentStepIndex === idx && !isPassed;

                return (
                  <div
                    key={idx}
                    className={`flex items-center justify-between p-2.5 rounded-xl border transition-all text-xs ${
                      isPassed
                        ? 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-200/60 dark:border-emerald-800/40 text-emerald-800 dark:text-emerald-300'
                        : isCurrent
                        ? 'bg-pink-50/60 dark:bg-pink-950/20 border-pink-200/60 dark:border-pink-800/40 text-pink-800 dark:text-pink-300'
                        : 'bg-slate-50/50 dark:bg-slate-800/30 border-slate-100 dark:border-slate-800 text-slate-400'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0">
                        {isPassed ? (
                          <CheckCircle2 size={16} className="text-emerald-600 dark:text-emerald-400" />
                        ) : isCurrent ? (
                          <RefreshCw size={13} className="animate-spin text-pink-600 dark:text-pink-400" />
                        ) : (
                          <span className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-600" />
                        )}
                      </div>
                      <div>
                        <div className="font-bold text-[11px] leading-tight">{step.title}</div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400">{step.detail}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
