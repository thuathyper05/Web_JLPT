import React, { useState, useEffect } from 'react';
import { RefreshCw, Sparkles, CheckCircle2, DownloadCloud, Database, ShieldCheck, Zap } from 'lucide-react';
import { sounds } from '../services/sounds';

export default function AppUpdateBanner() {
  const [hasUpdate, setHasUpdate] = useState(false);
  const [serverVersion, setServerVersion] = useState('1.2');
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateStep, setUpdateStep] = useState(0); // 0 to 100 percent
  const [updateStatusText, setUpdateStatusText] = useState('Khởi tạo cập nhật...');

  // Check version against backend API
  const checkVersion = async () => {
    try {
      const res = await fetch('/api/version?t=' + Date.now(), { cache: 'no-store' });
      if (!res.ok) return;
      const data = await res.json();
      if (!data || !data.buildTime) return;

      if (data.version) {
        setServerVersion(data.version);
      }

      const storedBuildTime = sessionStorage.getItem('hyper_initial_build_time');
      if (!storedBuildTime) {
        // Record initial build time for current session
        sessionStorage.setItem('hyper_initial_build_time', String(data.buildTime));
      } else {
        const storedNum = parseInt(storedBuildTime, 10);
        // If server was redeployed on Render, buildTime is greater
        if (data.buildTime > storedNum) {
          setHasUpdate(true);
        }
      }
    } catch {
      // Offline or network lag
    }
  };

  useEffect(() => {
    // 1. Initial check
    checkVersion();

    // 2. Check whenever user switches tabs or refocused
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        checkVersion();
      }
    };
    window.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('focus', handleVisibility);

    // 3. Fast periodic check every 20 seconds for real-time Render deploy detection
    const interval = setInterval(checkVersion, 20000);

    // 4. Service Worker update event detection
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        setHasUpdate(true);
      });
      navigator.serviceWorker.getRegistration().then((reg) => {
        if (reg) {
          reg.addEventListener('updatefound', () => {
            const newWorker = reg.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  setHasUpdate(true);
                }
              });
            }
          });
        }
      });
    }

    return () => {
      window.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('focus', handleVisibility);
      clearInterval(interval);
    };
  }, []);

  // High-End Animated Data Updating Sequence
  const handleUpdateNow = () => {
    if (isUpdating) return;
    setIsUpdating(true);
    setUpdateStep(5);
    setUpdateStatusText('Đang kết nối máy chủ Render...');

    try {
      sounds.playLevelUp();
    } catch {}

    // Multi-phase real visual loading simulation
    setTimeout(() => {
      setUpdateStep(25);
      setUpdateStatusText(`Xác thực gói cập nhật phiên bản v${serverVersion}...`);
    }, 400);

    setTimeout(() => {
      setUpdateStep(55);
      setUpdateStatusText('Làm mới cơ sở dữ liệu 9.584 từ vựng & 130 bài học...');
    }, 900);

    setTimeout(() => {
      setUpdateStep(80);
      setUpdateStatusText('Xóa bộ nhớ đệm Cache & cập nhật Service Worker PWA...');

      // Tell service worker to skip waiting
      try {
        if ('serviceWorker' in navigator) {
          navigator.serviceWorker.getRegistration().then((reg) => {
            if (reg?.waiting) {
              reg.waiting.postMessage({ type: 'SKIP_WAITING' });
            }
          });
        }
      } catch {}

      // Clear browser caches
      try {
        if ('caches' in window) {
          window.caches.keys().then((names) => {
            names.forEach((name) => window.caches.delete(name));
          });
        }
      } catch {}
    }, 1400);

    setTimeout(() => {
      setUpdateStep(100);
      setUpdateStatusText(`Hoàn tất! Đang khởi chạy phiên bản v${serverVersion}...`);
      try {
        sessionStorage.removeItem('hyper_initial_build_time');
      } catch {}
    }, 1900);

    // Hard reload with fresh timestamp cache-buster
    setTimeout(() => {
      const cleanPath = window.location.origin + window.location.pathname;
      window.location.href = cleanPath + '?t=' + Date.now();
    }, 2400);
  };

  // Only render when update is available (never dismissed until user updates)
  if (!hasUpdate) return null;

  return (
    <>
      {/* ── HIGH-END LIVE UPDATE PROMPT CARD (PERSISTENT UNTIL UPDATED) ── */}
      <aside
        aria-label="Thông báo cập nhật phiên bản ứng dụng"
        className="fixed bottom-20 sm:bottom-6 left-2.5 right-2.5 sm:left-auto sm:right-6 sm:w-96 z-50 animate-in slide-in-from-bottom-3 duration-300 pointer-events-auto"
      >
        <div className="relative overflow-hidden rounded-2xl bg-slate-900/95 dark:bg-slate-950/95 backdrop-blur-xl border border-pink-500/50 text-white p-3.5 sm:p-4 shadow-[0_16px_50px_rgba(236,72,153,0.35)] flex flex-col gap-3">
          {/* Shimmering top glowing border */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-pink-500 via-rose-500 to-amber-400 animate-pulse" />

          {/* Top Info Row */}
          <div className="flex items-start justify-between gap-3 min-w-0">
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <div className="w-10 h-10 rounded-xl bg-pink-500/20 border border-pink-500/30 text-pink-400 flex items-center justify-center shrink-0 shadow-inner">
                <Sparkles size={20} className="animate-pulse" />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 leading-none">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
                  <span className="text-[10px] font-black uppercase tracking-wider text-pink-400">
                    Bản cập nhật mới v{serverVersion}
                  </span>
                </div>

                <h4 className="font-extrabold text-xs sm:text-sm text-white truncate mt-1 leading-tight">
                  HYPER JP có phiên bản mới
                </h4>
                <p className="text-[10px] sm:text-[11px] text-slate-300 truncate mt-0.5 leading-tight">
                  Chưa cập nhật sẽ giữ bản cũ. Chạm để nâng cấp!
                </p>
              </div>
            </div>

            {/* Version Badge */}
            <span className="px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300 border border-pink-500/40 text-[10px] font-black uppercase tracking-wider shrink-0">
              v{serverVersion}
            </span>
          </div>

          {/* Interactive Action Button */}
          <button
            type="button"
            onClick={handleUpdateNow}
            disabled={isUpdating}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 hover:from-pink-400 hover:to-rose-500 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-pink-500/30 flex items-center justify-center gap-2 transition-all active:scale-98 cursor-pointer disabled:opacity-80"
          >
            <RefreshCw size={14} className={isUpdating ? 'animate-spin' : ''} />
            <span>{isUpdating ? 'Đang nâng cấp dữ liệu...' : `Cập nhật lên bản v${serverVersion} ngay`}</span>
          </button>
        </div>
      </aside>

      {/* ── HIGH-TECH DATA LOADING OVERLAY MODAL ── */}
      {isUpdating && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-slate-900 border border-pink-500/40 rounded-3xl p-6 sm:p-8 shadow-[0_25px_60px_rgba(236,72,153,0.35)] text-center space-y-5 overflow-hidden">
            {/* Ambient Background Glow */}
            <div className="absolute -top-24 -left-24 w-48 h-48 bg-pink-600/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-rose-600/20 rounded-full blur-3xl pointer-events-none" />

            {/* Glowing Tech Icon Container */}
            <div className="relative mx-auto w-16 h-16 rounded-2xl bg-gradient-to-tr from-pink-600 to-rose-500 text-white flex items-center justify-center shadow-lotus">
              <RefreshCw size={28} className="animate-spin" />
              <div className="absolute inset-0 rounded-2xl border-2 border-white/30 animate-ping pointer-events-none" />
            </div>

            <div className="space-y-1.5">
              <span className="text-[11px] font-black tracking-widest text-pink-400 uppercase">
                Hệ Thống Đang Nâng Cấp Tự Động
              </span>
              <h3 className="font-black text-lg sm:text-xl text-white">
                Đang Cập Nhật Lên Bản v{serverVersion}
              </h3>
              <p className="text-xs text-slate-400 h-6 transition-all duration-300">
                {updateStatusText}
              </p>
            </div>

            {/* Shimmering Animated Progress Bar */}
            <div className="space-y-2">
              <div className="w-full h-3 rounded-full bg-slate-800 p-0.5 overflow-hidden border border-slate-700/80">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-pink-500 via-rose-500 to-emerald-400 transition-all duration-300 relative shadow-inner"
                  style={{ width: `${updateStep}%` }}
                >
                  <div className="absolute inset-0 bg-white/20 animate-pulse" />
                </div>
              </div>
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 px-1">
                <span>Tiến độ tải dữ liệu</span>
                <span className="text-pink-400 font-mono font-black">{updateStep}%</span>
              </div>
            </div>

            {/* Feature Checkpoints */}
            <div className="grid grid-cols-3 gap-2 pt-2 text-[10px] font-bold text-slate-400 border-t border-slate-800">
              <div className="flex items-center justify-center gap-1">
                <Database size={11} className={updateStep >= 25 ? 'text-emerald-400' : 'text-slate-600'} />
                <span>9.584 từ</span>
              </div>
              <div className="flex items-center justify-center gap-1">
                <Zap size={11} className={updateStep >= 55 ? 'text-emerald-400' : 'text-slate-600'} />
                <span>Furigana</span>
              </div>
              <div className="flex items-center justify-center gap-1">
                <ShieldCheck size={11} className={updateStep >= 80 ? 'text-emerald-400' : 'text-slate-600'} />
                <span>Đa thiết bị</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
