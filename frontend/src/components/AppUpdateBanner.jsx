import React, { useState, useEffect } from 'react';
import { RefreshCw, X, ArrowUpCircle } from 'lucide-react';
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
      className="fixed bottom-20 sm:bottom-6 sm:right-6 left-3 right-3 sm:left-auto sm:max-w-md z-50 animate-in slide-in-from-bottom-5 duration-300"
    >
      <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-pink-100 dark:border-slate-800 text-slate-800 dark:text-slate-100 rounded-3xl p-4 shadow-[0_12px_40px_rgba(236,72,153,0.18)] flex items-center justify-between gap-3 relative overflow-hidden">
        {/* Subtle accent line on top */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600" />

        {/* Left: Icon and info */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-11 h-11 rounded-2xl bg-pink-50 dark:bg-pink-950/60 text-pink-600 dark:text-pink-400 border border-pink-200/80 dark:border-pink-800/60 flex items-center justify-center shrink-0 shadow-2xs">
            <ArrowUpCircle size={22} className="stroke-[2.2]" />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-pink-600 dark:text-pink-400">
                HYPER JP
              </span>
              <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-400">
                Bản cập nhật mới
              </span>
            </div>

            <h4 className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white truncate mt-0.5">
              Hệ thống đã có phiên bản mới
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
              Nhấn cập nhật để áp dụng tính năng và dữ liệu mới nhất.
            </p>
          </div>
        </div>

        {/* Right: Action Buttons */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={handleUpdateNow}
            disabled={isUpdating}
            className="px-3.5 py-2 rounded-2xl bg-gradient-to-r from-pink-600 via-rose-500 to-pink-500 hover:from-pink-500 hover:to-rose-600 text-white font-extrabold text-xs shadow-lotus flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer disabled:opacity-75"
          >
            <RefreshCw size={13} className={isUpdating ? 'animate-spin' : ''} />
            <span>{isUpdating ? 'Đang tải...' : 'Cập nhật'}</span>
          </button>

          <button
            type="button"
            onClick={() => setDismissed(true)}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
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
