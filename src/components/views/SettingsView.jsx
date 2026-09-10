import React, { useRef, useState } from 'react';
import {
  Settings,
  Download,
  Upload,
  RotateCcw,
  Database,
  CheckCircle2,
  AlertTriangle,
  Trash2,
  RefreshCw,
  Copy,
  Check,
  Server,
  ExternalLink
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { testNeonHealth } from '../../services/neonService';

export default function SettingsView() {
  const {
    data,
    resetToDefaultData,
    clearAllData,
    exportDataAsJSON,
    importDataFromJSON,
    currentUser,
    dbStatus,
    dbError,
    isSyncing,
    loadDataFromDb
  } = useApp();

  const fileInputRef = useRef(null);
  const [feedback, setFeedback] = useState({ message: '', type: '' });
  const [isTesting, setIsTesting] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

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

  const handleResetDemo = () => {
    if (window.confirm('TÜM veriler orijinal OMTEK Lazer demo başlangıç haline döndürülecektir. Emin misiniz?')) {
      resetToDefaultData();
      showNotification('Sistem verileri orijinal Demo (OMTEK Lazer) başlangıç durumuna sıfırlandı.', 'success');
    }
  };

  const handleClearAll = () => {
    if (window.confirm('DİKKAT: Sistemdeki TÜM müşteriler, görevler, şifre kasası, dosyalar ve notlar kalıcı olarak silinecektir.\n\nEmin misiniz?')) {
      if (window.confirm('Bu işlem geri alınamaz. Sıfır, temiz ve boş bir veritabanı oluşturulacaktır. Onaylıyor musunuz?')) {
        clearAllData();
        showNotification('Tüm sistem verileri başarıyla temizlendi. Boş ve temiz bir çalışma alanı hazırlandı.', 'success');
      }
    }
  };

  // Neon Bağlantısını Test Et
  const handleTestNeon = async () => {
    setIsTesting(true);
    try {
      const res = await testNeonHealth();
      if (res.success) {
        showNotification(res.message, res.status === 'connected' ? 'success' : 'warning');
        loadDataFromDb();
      } else {
        showNotification(res.message || 'Bağlantı hatası: Neon veritabanına ulaşılamadı.', 'error');
      }
    } catch (e) {
      showNotification('Test hatası: ' + e.message, 'error');
    } finally {
      setIsTesting(false);
    }
  };

  // SQL Şema Dosyası Bilgisini Kopyala
  const handleCopySqlInfo = () => {
    navigator.clipboard.writeText('-- AVDENS WORK Neon PostgreSQL Şeması proje ana dizinindeki "neon_schema.sql" dosyasında yer almaktadır.');
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 3000);
    showNotification('SQL şema bilgisi panoya kopyalandı! Projenizdeki "neon_schema.sql" dosyasını doğrudan Neon SQL konsolunda da çalıştırabilirsiniz.', 'success');
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
            Sistem Ayarları &amp; Veritabanı Yönetimi
          </h2>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Vercel + Neon (Serverless PostgreSQL) bulut veritabanı ve veri yönetimi araçları
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

      {/* 1. VERCEL + NEON POSTGRESQL YÖNETİM PANELİ */}
      <div className="card" style={{ padding: '24px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: 40,
              height: 40,
              borderRadius: 'var(--radius-sm)',
              background: dbStatus === 'connected' ? 'var(--success-light)' : dbStatus === 'empty_needs_init' ? '#fef3c7' : 'var(--primary-light)',
              color: dbStatus === 'connected' ? 'var(--success-text)' : dbStatus === 'empty_needs_init' ? '#b45309' : 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Server size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)' }}>
                Vercel + Neon (Serverless PostgreSQL)
              </h3>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                Vercel Serverless Functions (/api/*) üzerinden yüksek performanslı bulut veritabanı
              </span>
            </div>
          </div>

          {/* Durum Rozeti */}
          <div>
            {dbStatus === 'connected' && (
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: '999px',
                backgroundColor: '#dcfce7',
                color: '#15803d',
                fontSize: '0.82rem',
                fontWeight: 700
              }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#22c55e' }}></span>
                Neon PostgreSQL Bağlı &amp; Canlı
              </span>
            )}
            {dbStatus === 'connecting' && (
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: '999px',
                backgroundColor: '#e0f2fe',
                color: '#0369a1',
                fontSize: '0.82rem',
                fontWeight: 700
              }}>
                <RefreshCw size={12} className="spin" />
                Bağlanılıyor...
              </span>
            )}
            {dbStatus === 'empty_needs_init' && (
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: '999px',
                backgroundColor: '#fef3c7',
                color: '#b45309',
                fontSize: '0.82rem',
                fontWeight: 700
              }}>
                Neon Bağlı (Tablolar Başlatılmalı)
              </span>
            )}
            {dbStatus === 'unconfigured' && (
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: '999px',
                backgroundColor: '#f1f5f9',
                color: '#475569',
                fontSize: '0.82rem',
                fontWeight: 700
              }}>
                Yerel Mod (Vercel Neon Bekleniyor)
              </span>
            )}
            {dbStatus === 'error' && (
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: '999px',
                backgroundColor: '#fee2e2',
                color: '#b91c1c',
                fontSize: '0.82rem',
                fontWeight: 700
              }}>
                Bağlantı Hatası
              </span>
            )}
          </div>
        </div>

        {/* Durum Açıklama Kutusu */}
        <div style={{
          padding: '14px 18px',
          backgroundColor: 'var(--bg-app)',
          borderRadius: 'var(--radius-sm)',
          borderLeft: `4px solid ${dbStatus === 'connected' ? 'var(--success)' : 'var(--primary)'}`,
          fontSize: '0.86rem',
          lineHeight: 1.5,
          color: 'var(--text-main)'
        }}>
          {dbStatus === 'connected' ? (
            <div>
              <strong>✅ Sistem Canlı Neon PostgreSQL Veritabanında Çalışıyor:</strong> Müşteriler, görevler, şifre kasası, dosyalar ve notlar artık tarayıcı hafızasında değil, Vercel Serverless API üzerinden doğrudan Neon bulut veritabanında kalıcı olarak saklanmaktadır.
            </div>
          ) : dbStatus === 'empty_needs_init' ? (
            <div>
              <strong>⚡ Neon Bağlantısı Hazır:</strong> Vercel Neon veritabanınız bağlı durumdadır.
            </div>
          ) : (
            <div>
              <strong>ℹ️ Vercel Neon Entegrasyonu:</strong> Vercel Dashboard &gt; Storage &gt; Neon Postgres bağlantısı yapıldığında sistem otomatik olarak canlı veritabanı moduna geçer. Yerel ortamda çalıştırmak için <code>.env</code> dosyanıza <code>DATABASE_URL</code> ekleyebilirsiniz.
            </div>
          )}
        </div>

        {/* Eylem Butonları */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            className="btn btn-primary"
            onClick={handleTestNeon}
            disabled={isTesting}
          >
            <RefreshCw size={15} className={isTesting ? 'spin' : ''} />
            <span>{isTesting ? 'Kontrol Ediliyor...' : 'Bağlantıyı Test Et'}</span>
          </button>

          <button
            className="btn btn-secondary"
            onClick={handleCopySqlInfo}
          >
            {copiedSql ? <Check size={15} color="var(--success-text)" /> : <Copy size={15} />}
            <span>SQL Şeması (neon_schema.sql)</span>
          </button>
        </div>

        {/* Hızlı Kurulum Rehberi */}
        <div style={{
          padding: '16px',
          background: 'var(--bg-app)',
          borderRadius: 'var(--radius-sm)',
          fontSize: '0.82rem',
          color: 'var(--text-muted)',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          <div style={{ fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Server size={16} color="var(--primary)" />
            Vercel Dashboard Üzerinden Neon Ekleme (30 Saniye):
          </div>
          <div>1. <a href="https://vercel.com" target="_blank" rel="noreferrer" style={{ color: 'var(--primary)', fontWeight: 600 }}>Vercel Dashboard</a> projenize (avdensmedya) gidin.</div>
          <div>2. Üst menüden <strong>Storage</strong> sekmesine tıklayın ve <strong>Connect Database</strong> butonuna basın.</div>
          <div>3. <strong>Neon Serverless Postgres</strong> seçeneğini seçip "Create" butonuna tıklayın.</div>
          <div>4. Vercel, <code>DATABASE_URL</code> ve <code>POSTGRES_URL</code> anahtarlarını projenize otomatik olarak bağlar.</div>
          <div>5. Bağlantı tamamlandığında sisteminiz otomatik olarak canlı veritabanı üzerinden çalışmaya başlar.</div>
        </div>
      </div>

      {/* 2. AKTİF VERİ KÜTÜĞÜ */}
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
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Hesap &amp; Dosya</span>
            <div style={{ fontSize: '1.2rem', fontWeight: 800 }}>{data.credentials.length + data.files.length} Adet</div>
          </div>
        </div>
      </div>

      {/* 3. YEDEKLEME & İÇE AKTARMA ARAÇLARI */}
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

      {/* 4. SIFIRLAMA BÖLÜMLERİ */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px' }}>
        
        {/* Demo Verilerini Sıfırla */}
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

        {/* Tüm Verileri Sıfırla */}
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
