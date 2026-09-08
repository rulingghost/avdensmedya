import React, { useRef, useState } from 'react';
import {
  Settings,
  Download,
  Upload,
  RotateCcw,
  Database,
  Shield,
  CheckCircle2,
  AlertTriangle,
  FileJson,
  HardDrive,
  Trash2
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function SettingsView() {
  const {
    data,
    resetToDefaultData,
    clearAllData,
    exportDataAsJSON,
    importDataFromJSON,
    currentUser
  } = useApp();

  const fileInputRef = useRef(null);
  const [feedback, setFeedback] = useState({ message: '', type: '' });

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = importDataFromJSON(event.target.result);
      if (result.success) {
        setFeedback({ message: 'Yedek başarıyla yüklendi ve sistem güncellendi!', type: 'success' });
      } else {
        setFeedback({ message: 'Hata: ' + result.error, type: 'error' });
      }
      setTimeout(() => setFeedback({ message: '', type: '' }), 4000);
    };
    reader.readAsText(file);
    e.target.value = null;
  };

  const handleResetDemo = () => {
    if (window.confirm('TÜM veriler orijinal OMTEK Lazer demo başlangıç haline döndürülecektir. Emin misiniz?')) {
      resetToDefaultData();
      setFeedback({ message: 'Sistem verileri orijinal Demo (OMTEK Lazer) başlangıç durumuna sıfırlandı.', type: 'success' });
      setTimeout(() => setFeedback({ message: '', type: '' }), 4000);
    }
  };

  const handleClearAll = () => {
    if (window.confirm('DİKKAT: Sistemdeki TÜM müşteriler, görevler, şifre kasası, dosyalar ve notlar kalıcı olarak silinecektir.\n\nEmin misiniz?')) {
      if (window.confirm('Bu işlem geri alınamaz. Sıfır, temiz ve boş bir veritabanı oluşturulacaktır. Onaylıyor musunuz?')) {
        clearAllData();
        setFeedback({ message: 'Tüm sistem verileri başarıyla temizlendi. Boş ve temiz bir çalışma alanı hazırlandı.', type: 'success' });
        setTimeout(() => setFeedback({ message: '', type: '' }), 4000);
      }
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '820px', margin: '0 auto' }}>

      {/* Başlık */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-md)', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Settings size={22} />
        </div>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
            Sistem Ayarları & Veri Yönetimi
          </h2>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Veritabanı yedekleme, geri yükleme, demo sıfırlama ve tam veri temizleme araçları
          </span>
        </div>
      </div>

      {/* Geri Bildirim Bildirimi */}
      {feedback.message && (
        <div
          style={{
            padding: '14px 20px',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            backgroundColor: feedback.type === 'success' ? 'var(--success-light)' : 'var(--danger-light)',
            color: feedback.type === 'success' ? 'var(--success-text)' : 'var(--danger-text)',
            border: `1px solid ${feedback.type === 'success' ? '#a7f3d0' : '#fecaca'}`
          }}
        >
          {feedback.type === 'success' ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
          <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{feedback.message}</span>
        </div>
      )}

      {/* Veri Durum Özeti */}
      <div className="card" style={{ padding: '22px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
          <Database size={18} color="var(--primary)" />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Aktif Veri Kütüğü</h3>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
          <div style={{ padding: '12px', background: 'var(--bg-app)', borderRadius: 'var(--radius-sm)' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Müşteriler</span>
            <div style={{ fontSize: '1.2rem', fontWeight: 800 }}>{data.customers.length} Adet</div>
          </div>
          <div style={{ padding: '12px', background: 'var(--bg-app)', borderRadius: 'var(--radius-sm)' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Görevler</span>
            <div style={{ fontSize: '1.2rem', fontWeight: 800 }}>{data.tasks.length} Adet</div>
          </div>
          <div style={{ padding: '12px', background: 'var(--bg-app)', borderRadius: 'var(--radius-sm)' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Şablonlar</span>
            <div style={{ fontSize: '1.2rem', fontWeight: 800 }}>{data.templates.length} Adet</div>
          </div>
          <div style={{ padding: '12px', background: 'var(--bg-app)', borderRadius: 'var(--radius-sm)' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Kategoriler</span>
            <div style={{ fontSize: '1.2rem', fontWeight: 800 }}>{data.categories.length} Adet</div>
          </div>
          <div style={{ padding: '12px', background: 'var(--bg-app)', borderRadius: 'var(--radius-sm)' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Hesap & Dosya</span>
            <div style={{ fontSize: '1.2rem', fontWeight: 800 }}>{data.credentials.length + data.files.length} Adet</div>
          </div>
        </div>
      </div>

      {/* Yedekleme & İçe Aktarma Araçları */}
      <div className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
        <div>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Yedekleme & Geri Yükleme</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '4px' }}>
            Tüm müşteri portföyünü, görevleri, şifre kasasını ve notları tek bir JSON dosyası olarak bilgisayarınıza indirebilir veya daha önce aldığınız bir yedeği sisteme yükleyebilirsiniz.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          {/* Dışa Aktar */}
          <button
            className="btn btn-primary"
            onClick={exportDataAsJSON}
          >
            <Download size={16} />
            <span>Yedek İndir (JSON Dışa Aktar)</span>
          </button>

          {/* İçe Aktar */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".json"
            style={{ display: 'none' }}
          />
          <button
            className="btn btn-secondary"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload size={16} />
            <span>Yedek Yükle (JSON İçe Aktar)</span>
          </button>
        </div>
      </div>

      {/* Sıfırlama Bölümleri (Madde 6: Demo Sıfırla + Tüm Verileri Sıfırla) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px' }}>
        
        {/* 1. Demo Verilerini Sıfırla */}
        <div className="card" style={{ padding: '24px', borderLeft: '4px solid var(--primary)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <RotateCcw size={18} color="var(--primary)" />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)' }}>
                Demo Verilerini Sıfırla
              </h3>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.84rem', lineHeight: 1.5 }}>
              Sistemi dokümandaki orijinal <strong>OMTEK Lazer (18 Görev, %67 İlerleme)</strong> hazır başlangıç veritabanı durumuna geri döndürür.
            </p>
          </div>

          <div>
            <button
              className="btn btn-secondary"
              onClick={handleResetDemo}
              style={{ width: '100%', justifyContent: 'center' }}
            >
              <RotateCcw size={15} />
              <span>Demo Verilerini Yükle</span>
            </button>
          </div>
        </div>

        {/* 2. Tüm Verileri Sıfırla (Temiz Başlangıç) */}
        <div className="card" style={{ padding: '24px', borderLeft: '4px solid var(--danger)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <Trash2 size={18} color="var(--danger)" />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--danger)' }}>
                Tüm Verileri Sıfırla
              </h3>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.84rem', lineHeight: 1.5 }}>
              Tüm müşterileri, görevleri, şifre kasasını, dosyaları ve notları tamamen siler. <strong>Sıfır ve temiz</strong> bir çalışma ortamı sunar.
            </p>
          </div>

          <div>
            <button
              className="btn btn-danger-outline"
              onClick={handleClearAll}
              style={{ width: '100%', justifyContent: 'center', borderColor: '#fca5a5', color: 'var(--danger)' }}
            >
              <Trash2 size={15} />
              <span>Tüm Verileri Sıfırla (Temizle)</span>
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
