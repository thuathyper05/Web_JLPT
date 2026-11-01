import React, { useState, useEffect } from 'react';
import { Sparkles, RefreshCw, X, ArrowUpCircle } from 'lucide-react';
import { sounds } from '../services/sounds';

export default function AppUpdateBanner() {
  const [hasUpdate, setHasUpdate] = useState(false);
  const [serverVersion, setServerVersion] = useState(null);
  const [initialBuildTime, setInitialBuildTime] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  // Check version against backend API
  const checkVersion = async () => {
    try {
      const res = await fetch('/api/version?t=' + Date.now(), { cache: 'no-store' });
      if (!res.ok) return;
      const data = await res.json();
      if (data && data.buildTime) {
        setServerVersion(data);

        setInitialBuildTime((prev) => {
          if (!prev) {
            // First check on page load, remember initial buildTime
            return data.buildTime;
          }
          // Subsequent checks: if server restarted with new deploy buildTime
          if (data.buildTime > prev) {
            setHasUpdate(true);
            setDismissed(false);
          }
          return prev;
        });
      }
    } catch {
      // Offline or network error
    }
  };

  useEffect(() => {
    // Check version on mount
    checkVersion();

    // Check version when user returns to the tab or app
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkVersion();
      }
    };
    window.addEventListener('visibilitychange', onVisibilityChange);
    window.addEventListener('focus', onVisibilityChange);

    // Periodic polling every 45 seconds
    const interval = setInterval(checkVersion, 45000);

    // Also listen to Service Worker updates if registered
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        setHasUpdate(true);
      });
    }

    return () => {
      window.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('focus', onVisibilityChange);
      clearInterval(interval);
    };
  }, []);

  const handleUpdateNow = async () => {
    try {
      sounds.playLevelUp();
    } catch {}

    setIsUpdating(true);

    // Clear caches for PWA and browser storage
    try {
      if ('caches' in window) {
        const cacheNames = await window.caches.keys();
        await Promise.all(cacheNames.map((name) => window.caches.delete(name)));
      }
    } catch (e) {
      console.warn('Cache clearing notice:', e);
    }

    // Force hard reload with timestamp cache-buster
    setTimeout(() => {
      const cleanPath = window.location.origin + window.location.pathname;
      window.location.href = cleanPath + '?v=' + Date.now();
    }, 600);
  };

  if (!hasUpdate || dismissed) return null;

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-1.5rem)] max-w-lg animate-in slide-in-from-top-4 duration-300">
      <div className="bg-slate-900/95 backdrop-blur-xl border border-pink-500/50 text-white rounded-2xl p-3 sm:p-4 shadow-[0_10px_35px_rgba(236,72,153,0.3)] flex flex-col sm:flex-row items-center justify-between gap-3 relative overflow-hidden">
        {/* Subtle decorative glowing blob */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-pink-500/20 rounded-full blur-2xl pointer-events-none" />

        {/* Left: Icon and notification text */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex items-center justify-center shrink-0 w-10 h-10 rounded-xl bg-gradient-to-tr from-pink-500 to-rose-600 text-white shadow-md shadow-pink-500/40">
            <Sparkles size={18} />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-pink-500"></span>
            </span>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-sm text-white tracking-wide">
                Bản Cập Nhật Mới Đã Sẵn Sàng!
              </h4>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-pink-500/30 text-pink-300 border border-pink-500/40">
                Render Live
              </span>
            </div>
            <p className="text-xs text-slate-300 line-clamp-1 mt-0.5">
              Hệ thống vừa có tính năng mới. Cập nhật để trải nghiệm ngay.
            </p>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end shrink-0">
          <button
            type="button"
            onClick={handleUpdateNow}
            disabled={isUpdating}
            className="w-full sm:w-auto px-4 py-2 rounded-xl bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 hover:from-pink-600 hover:to-rose-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-pink-500/30 flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-all disabled:opacity-75"
          >
            <RefreshCw size={14} className={isUpdating ? 'animate-spin' : ''} />
            <span>{isUpdating ? 'Đang cập nhật...' : 'Cập nhật ngay'}</span>
          </button>

          <button
            type="button"
            onClick={() => setDismissed(true)}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
            title="Để sau"
            aria-label="Đóng thông báo"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
