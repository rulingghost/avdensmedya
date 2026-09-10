import React, { useRef, useState } from 'react';
import {
  Settings,
  Download,
  Upload,
  Database,
  CheckCircle2,
  AlertTriangle,
  Trash2,
  RefreshCw,
  UserCheck,
  ArrowRight
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function SettingsView() {
  const {
    data,
    clearAllData,
    exportDataAsJSON,
    importDataFromJSON,
    currentUser,
    isSyncing,
    setActivePage
  } = useApp();

  const fileInputRef = useRef(null);
  const [feedback, setFeedback] = useState({ message: '', type: '' });

  const showNotification = (message, type = 'success') => {
    setFeedback({ message, type });
    setTimeout(() => setFeedback({ message: '', type: '' }), 5000);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = importDataFromJSON(event.target.result);
      if (result.success) {
        showNotification('Yedek başarıyla yüklendi ve sistem güncellendi!', 'success');
      } else {
        showNotification('Hata: ' + result.error, 'error');
      }
    };
    reader.readAsText(file);
    e.target.value = null;
  };

  const handleClearAll = () => {
    if (window.confirm('DİKKAT: Sistemdeki TÜM müşteriler, görevler, şifre kasası, dosyalar ve notlar kalıcı olarak silinecektir.\n\nEmin misiniz?')) {
      if (window.confirm('Bu işlem geri alınamaz. Sıfır, temiz ve boş bir veritabanı oluşturulacaktır. Onaylıyor musunuz?')) {
        clearAllData();
        showNotification('Tüm sistem verileri başarıyla temizlendi. Boş ve temiz bir çalışma alanı hazırlandı.', 'success');
      }
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '860px', margin: '0 auto' }}>

      {/* Başlık */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{ width: 42, height: 42, borderRadius: 'var(--radius-md)', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Settings size={22} />
        </div>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
            Sistem Ayarları &amp; Veri Yönetimi
          </h2>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Veri kütüğü, yedekleme, dışa aktarma ve sistem sıfırlama araçları
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
            backgroundColor: feedback.type === 'success' ? 'var(--success-light)' : feedback.type === 'warning' ? '#fef3c7' : 'var(--danger-light)',
            color: feedback.type === 'success' ? 'var(--success-text)' : feedback.type === 'warning' ? '#92400e' : 'var(--danger-text)',
            border: `1px solid ${feedback.type === 'success' ? '#a7f3d0' : feedback.type === 'warning' ? '#fde68a' : '#fecaca'}`
          }}
        >
          {feedback.type === 'success' ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
          <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{feedback.message}</span>
        </div>
      )}

      {/* 1. AKTİF VERİ KÜTÜĞÜ */}
      <div className="card" style={{ padding: '22px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Database size={18} color="var(--primary)" />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Aktif Veri Kütüğü</h3>
          </div>
          {isSyncing && (
            <span style={{ fontSize: '0.78rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <RefreshCw size={13} className="spin" /> Senkronize ediliyor...
            </span>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '12px' }}>
          <div style={{ padding: '12px', background: 'var(--bg-app)', borderRadius: 'var(--radius-sm)' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Müşteriler</span>
            <div style={{ fontSize: '1.2rem', fontWeight: 800 }}>{data.customers.length} Adet</div>
          </div>
          <div style={{ padding: '12px', background: 'var(--bg-app)', borderRadius: 'var(--radius-sm)' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Görevler</span>
            <div style={{ fontSize: '1.2rem', fontWeight: 800 }}>{data.tasks.length} Adet</div>
          </div>
          <div style={{ padding: '12px', background: 'var(--bg-app)', borderRadius: 'var(--radius-sm)' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Ekip &amp; Yetkililer</span>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--primary)' }}>{data.users.length} Kişi</div>
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
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Hesap &amp; Dosya</span>
            <div style={{ fontSize: '1.2rem', fontWeight: 800 }}>{data.credentials.length + data.files.length} Adet</div>
          </div>
        </div>

        {/* Ekip Yönetimine Hızlı Geçiş */}
        <div style={{ marginTop: '16px', paddingTop: '14px', borderTop: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <UserCheck size={16} color="var(--primary)" />
            <span style={{ fontSize: '0.84rem', color: 'var(--text-main)', fontWeight: 600 }}>
              Yöneticileri ve Aracıları (İş Ortaklarını) ekleyin, düzenleyin veya yetkilendirin.
            </span>
          </div>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => setActivePage('users')}
            style={{ fontWeight: 600 }}
          >
            <span>Ekip ve Yetkilileri Yönet</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>

      {/* 2. YEDEKLEME & İÇE AKTARMA ARAÇLARI */}
      <div className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
        <div>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Yedekleme &amp; Geri Yükleme</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '4px' }}>
            Tüm müşteri portföyünü, görevleri, şifre kasasını ve notları tek bir JSON dosyası olarak bilgisayarınıza indirebilir veya daha önce aldığınız bir yedeği sisteme yükleyebilirsiniz.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button
            className="btn btn-primary"
            onClick={exportDataAsJSON}
          >
            <Download size={16} />
            <span>Yedek İndir (JSON Dışa Aktar)</span>
          </button>

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

      {/* 3. SIFIRLAMA / TEMİZLEME BÖLÜMÜ */}
      <div className="card" style={{ padding: '24px', borderLeft: '4px solid var(--danger)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <Trash2 size={18} color="var(--danger)" />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--danger)' }}>
                Tüm Verileri Sıfırla (Temizle)
              </h3>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.84rem', lineHeight: 1.5, maxWidth: '600px' }}>
              Tüm müşterileri, görevleri, şifre kasasını, dosyaları ve notları tamamen siler. <strong>Sıfır ve temiz</strong> bir çalışma ortamı sunar. Yöneticiler ve sistem kategorileri korunur.
            </p>
          </div>

          <div>
            <button
              className="btn btn-danger-outline"
              onClick={handleClearAll}
              style={{ padding: '10px 18px', borderColor: '#fca5a5', color: 'var(--danger)', fontWeight: 700 }}
            >
              <Trash2 size={16} />
              <span>Veritabanını Temizle</span>
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}
