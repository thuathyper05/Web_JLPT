import React, { useState, useEffect } from 'react';
import { Modal, ModalBody } from 'reactstrap';
import { Smartphone, Download, X, Share, PlusSquare, WifiOff, CheckCircle2 } from 'lucide-react';
import { sounds } from '../services/sounds';

export default function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [iosModalOpen, setIosModalOpen] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isOffline, setIsOffline] = useState(typeof navigator !== 'undefined' ? !navigator.onLine : false);

  useEffect(() => {
    // 1. Detect if already installed / standalone mode
    const isStandaloneMode = 
      (typeof window !== 'undefined' && window.matchMedia('(display-mode: standalone)').matches) ||
      (typeof window !== 'undefined' && window.navigator.standalone === true);
    setIsStandalone(isStandaloneMode);

    if (isStandaloneMode) return; // Do not show install prompt if already installed

    // 2. Detect iOS Safari
    const userAgent = typeof window !== 'undefined' ? window.navigator.userAgent : '';
    const isIosDevice = /iPhone|iPad|iPod/i.test(userAgent) && !window.MSStream;
    setIsIos(isIosDevice);

    // 3. Check dismissal expiry
    const dismissedUntil = localStorage.getItem('hyper_pwa_dismissed_until');
    const isDismissed = dismissedUntil && Date.now() < parseInt(dismissedUntil, 10);

    // 4. Listen for beforeinstallprompt (Android / Chrome / Edge)
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      if (!isDismissed) {
        setShowPrompt(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    // 5. If iOS and not dismissed, show prompt after a short delay (4s) so user explores first
    if (isIosDevice && !isDismissed) {
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, 4000);
      return () => clearTimeout(timer);
    }

    // 6. Online / Offline listeners
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // 7. Listen for manual trigger from Menu / Navbar
  useEffect(() => {
    const handleManualOpen = () => {
      sounds.playFlip?.();
      if (isIos) {
        setIosModalOpen(true);
      } else if (deferredPrompt) {
        deferredPrompt.prompt().then(choiceResult => {
          if (choiceResult && choiceResult.outcome === 'accepted') {
            sounds.playComplete?.();
            setShowPrompt(false);
          }
        }).catch(() => {
          setShowPrompt(true);
        });
      } else {
        setShowPrompt(true);
      }
    };
    window.addEventListener('hyper_open_pwa_install', handleManualOpen);
    return () => window.removeEventListener('hyper_open_pwa_install', handleManualOpen);
  }, [isIos, deferredPrompt]);

  const handleInstallClick = async () => {
    sounds.playFlip?.();
    if (isIos) {
      setIosModalOpen(true);
      setShowPrompt(false);
      return;
    }

    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        sounds.playComplete?.();
        setShowPrompt(false);
      }
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    sounds.playFlip?.();
    setShowPrompt(false);
    // Dismiss for 5 days
    localStorage.setItem('hyper_pwa_dismissed_until', (Date.now() + 5 * 24 * 60 * 60 * 1000).toString());
  };

  return (
    <>
      {/* ── Offline Banner ── */}
      {isOffline && (
        <div
          className="fixed-top d-flex align-items-center justify-content-center py-1.5 px-3"
          style={{
            zIndex: 9999,
            background: 'linear-gradient(135deg, #1e293b, #0f172a)',
            color: '#f8fafc',
            borderBottom: '1px solid #475569',
            fontSize: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
          }}
        >
          <div className="d-flex align-items-center gap-2">
            <WifiOff size={14} className="text-warning" />
            <span>Đang ở chế độ ngoại tuyến. Dữ liệu từ vựng & tiến độ đã được lưu sẵn trên máy bạn.</span>
          </div>
        </div>
      )}

      {/* ── Floating PWA Install Bar (Ultra-sleek, non-intrusive) ── */}
      {showPrompt && !isStandalone && (
        <aside
          aria-label="Cài đặt ứng dụng HYPER JAPAN"
          className="fixed-bottom p-2.5 p-sm-3 d-flex justify-content-center"
          style={{
            zIndex: 1025,
            paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 68px)',
            pointerEvents: 'none'
          }}
        >
          <div
            className="pwa-install-card d-flex align-items-center justify-content-between gap-2.5 px-3 py-2 rounded-4 border shadow-lg"
            style={{
              pointerEvents: 'auto',
              background: 'rgba(9, 18, 36, 0.94)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              borderColor: 'rgba(255, 255, 255, 0.18)',
              color: '#ffffff',
              maxWidth: '460px',
              width: '100%',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.35)',
              animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
          >
            {/* App Icon + Text */}
            <div className="d-flex align-items-center gap-2.5 min-w-0">
              <img
                src="/logo.png"
                alt="HYPER JAPAN"
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  border: '1px solid rgba(255,255,255,0.25)',
                  objectFit: 'contain',
                  background: '#ffffff'
                }}
              />
              <div className="min-w-0">
                <div className="d-flex align-items-center gap-1.5">
                  <h6 className="fw-black mb-0 text-white text-truncate" style={{ fontSize: '13px' }}>
                    Cài đặt HYPER JAPAN
                  </h6>
                  <span className="badge rounded-pill bg-primary px-1.5 py-0.5" style={{ fontSize: '9px' }}>
                    WEB APP
                  </span>
                </div>
                <div className="text-white text-opacity-75 small text-truncate" style={{ fontSize: '11px' }}>
                  Mở ứng dụng toàn màn hình, học mượt hơn
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="d-flex align-items-center gap-1.5 flex-shrink-0">
              <button
                type="button"
                onClick={handleInstallClick}
                className="btn btn-sm btn-primary rounded-pill px-3 py-1.5 fw-bold d-inline-flex align-items-center gap-1 shadow-sm"
                style={{
                  fontSize: '11.5px',
                  background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                  border: 'none',
                  minHeight: '34px'
                }}
              >
                <Download size={13} />
                <span>Cài đặt</span>
              </button>

              <button
                type="button"
                onClick={handleDismiss}
                className="btn btn-sm btn-link text-white text-opacity-60 p-1 d-flex align-items-center justify-content-center"
                style={{ width: '28px', height: '28px' }}
                aria-label="Đóng thông báo"
              >
                <X size={15} />
              </button>
            </div>
          </div>
        </aside>
      )}

      {/* ── iOS Installation Instructions Modal ── */}
      <Modal
        isOpen={iosModalOpen}
        toggle={() => setIosModalOpen(false)}
        centered
        className="jlpt-modal"
        style={{ maxWidth: '420px', margin: 'auto 16px' }}
      >
        <ModalBody className="p-0 rounded-4 overflow-hidden bg-white border-0 shadow-2xl">
          {/* Header */}
          <div
            className="p-3.5 text-white d-flex justify-content-between align-items-center"
            style={{ background: 'linear-gradient(135deg, #091224 0%, #172554 100%)' }}
          >
            <div className="d-flex align-items-center gap-2">
              <Smartphone size={22} className="text-primary" />
              <div>
                <h6 className="fw-bold mb-0 text-white">Cài đặt trên iPhone & iPad</h6>
                <small className="text-white text-opacity-75" style={{ fontSize: '11px' }}>
                  Thêm vào Màn hình chính (Home Screen)
                </small>
              </div>
            </div>
            <button
              type="button"
              className="btn-close btn-close-white"
              onClick={() => setIosModalOpen(false)}
              aria-label="Đóng"
            />
          </div>

          {/* Steps */}
          <div className="p-3.5 d-flex flex-column gap-3">
            <div className="d-flex align-items-start gap-2.5">
              <div
                className="rounded-circle bg-primary bg-opacity-10 text-primary fw-bold d-flex align-items-center justify-content-center flex-shrink-0"
                style={{ width: '28px', height: '28px', fontSize: '12.5px' }}
              >
                1
              </div>
              <div className="small text-secondary" style={{ fontSize: '13px', lineHeight: '1.5' }}>
                Trên trình duyệt Safari, nhấn vào nút <strong>Chia sẻ (Share)</strong> có biểu tượng hình vuông kèm mũi tên trỏ lên ở thanh điều hướng dưới cùng.
              </div>
            </div>

            <div className="d-flex align-items-start gap-2.5">
              <div
                className="rounded-circle bg-primary bg-opacity-10 text-primary fw-bold d-flex align-items-center justify-content-center flex-shrink-0"
                style={{ width: '28px', height: '28px', fontSize: '12.5px' }}
              >
                2
              </div>
              <div className="small text-secondary" style={{ fontSize: '13px', lineHeight: '1.5' }}>
                Cuộn xuống danh sách tùy chọn và chọn <strong>"Thêm vào MH chính" (Add to Home Screen)</strong>.
              </div>
            </div>

            <div className="d-flex align-items-start gap-2.5">
              <div
                className="rounded-circle bg-primary bg-opacity-10 text-primary fw-bold d-flex align-items-center justify-content-center flex-shrink-0"
                style={{ width: '28px', height: '28px', fontSize: '12.5px' }}
              >
                3
              </div>
              <div className="small text-secondary" style={{ fontSize: '13px', lineHeight: '1.5' }}>
                Nhấn <strong>"Thêm" (Add)</strong> ở góc trên bên phải. Biểu tượng HYPER JAPAN sẽ xuất hiện như một ứng dụng độc lập trên màn hình chính của bạn.
              </div>
            </div>

            <div className="pt-2 border-top">
              <button
                type="button"
                onClick={() => setIosModalOpen(false)}
                className="btn btn-primary w-100 py-2 rounded-pill fw-bold"
                style={{ fontSize: '13px' }}
              >
                Đã hiểu
              </button>
            </div>
          </div>
        </ModalBody>
      </Modal>
    </>
  );
}
