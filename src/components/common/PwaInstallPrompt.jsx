import React, { useState, useEffect } from 'react';
import { Download, X, Sparkles, Smartphone, Share } from 'lucide-react';

export default function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [showIosTip, setShowIosTip] = useState(false);

  useEffect(() => {
    // 1. Zaten yüklüyse (standalone moddaysa) gösterme
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
    if (isStandalone) return;

    // 2. Kullanıcı bu oturumda kapattıysa gösterme
    if (sessionStorage.getItem('AVDENS_PWA_DISMISSED') === 'true') return;

    // 3. iOS tespiti
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIos(isIosDevice);

    // 4. Standart PWA beforeinstallprompt dinleyicisi (Android / Chrome / Edge / Desktop)
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // iOS cihazlarda 2 saniye sonra nazikçe göster
    if (isIosDevice && !isStandalone) {
      const timer = setTimeout(() => setIsVisible(true), 2500);
      return () => clearTimeout(timer);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (isIos) {
      setShowIosTip(true);
      return;
    }

    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const choiceResult = await deferredPrompt.userChoice;
    if (choiceResult.outcome === 'accepted') {
      setIsVisible(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setIsVisible(false);
    sessionStorage.setItem('AVDENS_PWA_DISMISSED', 'true');
  };

  if (!isVisible) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        left: 'auto',
        maxWidth: '400px',
        width: 'calc(100% - 40px)',
        zIndex: 999,
        animation: 'slideUp 0.3s ease-out'
      }}
    >
      <div
        className="card"
        style={{
          padding: '16px',
          background: 'rgba(15, 23, 42, 0.92)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(59, 130, 246, 0.3)',
          borderRadius: '16px',
          color: '#ffffff',
          boxShadow: '0 20px 35px -5px rgba(0, 0, 0, 0.5)',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              <Smartphone size={20} color="#fff" />
            </div>
            <div>
              <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>Uygulamayı Cihazınıza Yükleyin</span>
                <Sparkles size={14} color="#facc15" />
              </div>
              <p style={{ fontSize: '0.78rem', color: '#94a3b8', margin: '2px 0 0', lineHeight: 1.4 }}>
                Tek tıkla masaüstü veya telefon ana ekranınıza ekleyip tam ekran kullanın.
              </p>
            </div>
          </div>

          <button
            onClick={handleDismiss}
            style={{
              background: 'none',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              padding: '4px',
              display: 'flex'
            }}
            title="Kapat"
          >
            <X size={16} />
          </button>
        </div>

        {/* iOS İpucu Bildirimi */}
        {showIosTip && (
          <div
            style={{
              padding: '10px 12px',
              borderRadius: '8px',
              backgroundColor: 'rgba(59, 130, 246, 0.15)',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              fontSize: '0.78rem',
              color: '#93c5fd',
              lineHeight: 1.5,
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <Share size={16} style={{ flexShrink: 0 }} />
            <span>
              Safari'de alttaki <strong>Paylaş</strong> simgesine dokunun ve <strong>"Ana Ekrana Ekle"</strong>yi seçin.
            </span>
          </div>
        )}

        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={handleDismiss}
            style={{ fontSize: '0.78rem', padding: '6px 12px', color: '#94a3b8' }}
          >
            Daha Sonra
          </button>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={handleInstallClick}
            style={{
              fontSize: '0.78rem',
              padding: '6px 16px',
              fontWeight: 700,
              background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
              border: 'none'
            }}
          >
            <Download size={14} />
            <span>{isIos ? 'Nasıl Yüklenir?' : 'Hemen Yükle'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
