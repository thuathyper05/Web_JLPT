import React, { useState, useEffect } from 'react';
import { RefreshCw, X, Sparkles } from 'lucide-react';
import { sounds } from '../services/sounds';

export default function AppUpdateBanner() {
  const [hasUpdate, setHasUpdate] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  // Checks version against backend API
  const checkVersion = async () => {
    try {
      const res = await fetch('/api/version?t=' + Date.now(), { cache: 'no-store' });
      if (!res.ok) return;
      const data = await res.json();
      if (!data || !data.buildTime) return;

      const storedBuildTime = sessionStorage.getItem('hyper_initial_build_time');
      if (!storedBuildTime) {
        // First visit in this browser tab session, record current server buildTime
        sessionStorage.setItem('hyper_initial_build_time', String(data.buildTime));
      } else {
        const storedNum = parseInt(storedBuildTime, 10);
        // If server was redeployed (e.g. Render deploy completes), new buildTime is greater
        if (data.buildTime > storedNum) {
          setHasUpdate(true);
          setDismissed(false);
        }
      }
    } catch {
      // Offline or network error
    }
  };

  useEffect(() => {
    // 1. Initial check
    checkVersion();

    // 2. Immediate check when tab becomes active or app is refocused
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        checkVersion();
      }
    };
    window.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('focus', handleVisibility);

    // 3. Fast periodic check every 25 seconds for real-time Render deploy detection
    const interval = setInterval(checkVersion, 25000);

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

  const handleUpdateNow = async () => {
    try {
      sounds.playLevelUp();
    } catch {}

    setIsUpdating(true);

    // Tell service worker to skip waiting if waiting
    try {
      if ('serviceWorker' in navigator) {
        const reg = await navigator.serviceWorker.getRegistration();
        if (reg?.waiting) {
          reg.waiting.postMessage({ type: 'SKIP_WAITING' });
        }
      }
    } catch {}

    // Clear caches for PWA and storage
    try {
      if ('caches' in window) {
        const cacheNames = await window.caches.keys();
        await Promise.all(cacheNames.map((name) => window.caches.delete(name)));
      }
    } catch {}

    // Reset initial build time
    try {
      sessionStorage.removeItem('hyper_initial_build_time');
    } catch {}

    // Perform hard reload with timestamp cache-buster
    setTimeout(() => {
      const cleanPath = window.location.origin + window.location.pathname;
      window.location.href = cleanPath + '?t=' + Date.now();
    }, 500);
  };

  if (!hasUpdate || dismissed) return null;

  return (
    <aside
      aria-label="Thông báo cập nhật ứng dụng"
      className="fixed bottom-20 sm:bottom-6 left-2.5 right-2.5 sm:left-auto sm:right-6 sm:w-96 z-50 animate-in slide-in-from-bottom-3 duration-300 pointer-events-auto"
    >
      <div className="relative overflow-hidden rounded-2xl bg-slate-900/95 backdrop-blur-xl border border-pink-500/40 text-white p-3 sm:p-3.5 shadow-[0_12px_40px_rgba(236,72,153,0.35)] flex items-center justify-between gap-2.5">
        {/* Glowing gradient accent bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-pink-500 via-rose-500 to-amber-400" />

        {/* Left: Icon and info */}
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-pink-500/20 border border-pink-500/30 text-pink-400 flex items-center justify-center shrink-0 shadow-inner">
            <Sparkles size={18} className="animate-pulse" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 leading-none">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping inline-block" />
              <span className="text-[10px] font-black uppercase tracking-wider text-pink-400">
                Bản mới đã sẵn sàng
              </span>
            </div>

            <h4 className="font-extrabold text-xs text-white truncate mt-1 leading-tight">
              Cập nhật dữ liệu HYPER JP
            </h4>
            <p className="text-[10px] sm:text-[11px] text-slate-300 truncate mt-0.5 leading-tight">
              Chạm cập nhật để trải nghiệm ngay
            </p>
          </div>
        </div>

        {/* Right: Action Buttons */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={handleUpdateNow}
            disabled={isUpdating}
            className="px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 hover:from-pink-400 hover:to-rose-500 text-white font-extrabold text-xs shadow-md shadow-pink-500/30 flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer disabled:opacity-75"
          >
            <RefreshCw size={12} className={isUpdating ? 'animate-spin' : ''} />
            <span className="whitespace-nowrap">{isUpdating ? 'Đang tải...' : 'Cập nhật'}</span>
          </button>

          <button
            type="button"
            onClick={() => setDismissed(true)}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title="Đóng thông báo"
            aria-label="Đóng thông báo"
          >
            <X size={15} />
          </button>
        </div>
      </div>
    </aside>
  );
}
