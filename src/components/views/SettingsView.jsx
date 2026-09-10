import React, { useRef, useState, useEffect } from 'react';
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
  Trash2,
  Cloud,
  RefreshCw,
  Copy,
  Check,
  ExternalLink,
  Key,
  Globe
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import {
  getSupabaseConfig,
  saveCustomConfig,
  testSupabaseConnection
} from '../../lib/supabase';

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
    loadDataFromDb,
    seedDatabaseToCloud
  } = useApp();

  const fileInputRef = useRef(null);
  const [feedback, setFeedback] = useState({ message: '', type: '' });

  // Supabase ayar formu state'leri
  const [supabaseUrl, setSupabaseUrl] = useState('');
  const [supabaseKey, setSupabaseKey] = useState('');
  const [isTestingConn, setIsTestingConn] = useState('');
  const [testResult, setTestResult] = useState(null);
  const [copiedSql, setCopiedSql] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);

  useEffect(() => {
    const cfg = getSupabaseConfig();
    setSupabaseUrl(cfg.url || '');
    setSupabaseKey(cfg.rawAnonKey || '');
  }, []);

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

  // Supabase Bağlantısını Test Et
  const handleTestConnection = async () => {
    setIsTestingConn(true);
    setTestResult(null);
    try {
      const res = await testSupabaseConnection(supabaseUrl, supabaseKey);
      setTestResult(res);
      if (res.success) {
        showNotification(res.message, res.tableMissing ? 'warning' : 'success');
      } else {
        showNotification(res.message, 'error');
      }
    } catch (e) {
      setTestResult({ success: false, message: e.message });
      showNotification('Bağlantı hatası: ' + e.message, 'error');
    } finally {
      setIsTestingConn(false);
    }
  };

  // Supabase Ayarlarını Kaydet
  const handleSaveSupabaseConfig = async () => {
    if (!supabaseUrl.trim() || !supabaseKey.trim()) {
      saveCustomConfig('', '');
      showNotification('Supabase bağlantı anahtarları temizlendi. Sistem yerel moda alındı.', 'warning');
      loadDataFromDb();
      return;
    }

    const res = saveCustomConfig(supabaseUrl, supabaseKey);
    if (res.success) {
      showNotification('Supabase ayarları kaydedildi. Veritabanına bağlanılıyor...', 'success');
      await loadDataFromDb();
    } else {
      showNotification('Ayarlar kaydedilemedi: ' + res.error, 'error');
    }
  };

  // Veritabanına İlk Verileri Yükle (Seed)
  const handleSeedDatabase = async () => {
    if (!window.confirm('Mevcut müşteri, görev, not ve kullanıcı verileri doğrudan Supabase PostgreSQL veritabanına aktarılacaktır. Devam edilsin mi?')) {
      return;
    }
    setIsSeeding(true);
    try {
      const res = await seedDatabaseToCloud();
      if (res.success) {
        showNotification('Veriler başarıyla Supabase PostgreSQL veritabanına aktarıldı!', 'success');
      } else {
        showNotification('Hata: ' + res.error, 'error');
      }
    } catch (e) {
      showNotification('Aktarım hatası: ' + e.message, 'error');
    } finally {
      setIsSeeding(false);
    }
  };

  // SQL Şemasını Kopyalama
  const handleCopySqlSchema = () => {
    const sqlUrl = window.location.origin + '/supabase_schema.sql';
    // Doğrudan SQL içeriğini kopyalamak için dosya yolunu bildir
    navigator.clipboard.writeText(`-- AVDENS WORK SQL Schema dosyasını projenizdeki supabase_schema.sql dosyasından veya GitHub reposundan alıp Supabase SQL Editor'de çalıştırınız.`);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 3000);
    showNotification('SQL şema bilgisi panoya kopyalandı! Proje kök dizinindeki supabase_schema.sql dosyasını Supabase panelinde çalıştırabilirsiniz.', 'success');
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
            Sistem Ayarları & Veritabanı Yönetimi
          </h2>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Supabase PostgreSQL bulut veritabanı, gerçek zamanlı senkronizasyon ve veri yönetimi araçları
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

      {/* 1. BULUT VERİTABANI (SUPABASE) YÖNETİM PANELİ */}
      <div className="card" style={{ padding: '24px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: 38,
              height: 38,
              borderRadius: 'var(--radius-sm)',
              background: dbStatus === 'connected' ? 'var(--success-light)' : dbStatus === 'unconfigured' ? 'var(--primary-light)' : 'var(--danger-light)',
              color: dbStatus === 'connected' ? 'var(--success-text)' : dbStatus === 'unconfigured' ? 'var(--primary)' : 'var(--danger-text)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Database size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)' }}>
                Bulut Veritabanı (Supabase PostgreSQL)
              </h3>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                Verilerinizin tüm cihazlarda kalıcı, anlık ve bağımsız olarak saklanmasını sağlar
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
                PostgreSQL Bağlı & Canlı
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
            {dbStatus === 'empty_needs_seed' && (
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
                Bağlı (Veri Yükleme Bekliyor)
              </span>
            )}
            {dbStatus === 'missing_tables' && (
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: '999px',
                backgroundColor: '#ffedd5',
                color: '#c2410c',
                fontSize: '0.82rem',
                fontWeight: 700
              }}>
                Tablolar Eksik (SQL Çalıştırın)
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
                Yerel Mod (Anahtar Girilmedi)
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

        {/* Bilgilendirme Kutusu */}
        <div style={{
          padding: '14px 18px',
          backgroundColor: 'var(--bg-app)',
          borderRadius: 'var(--radius-sm)',
          borderLeft: '4px solid var(--primary)',
          fontSize: '0.86rem',
          lineHeight: 1.5,
          color: 'var(--text-main)'
        }}>
          {dbStatus === 'connected' ? (
            <div>
              <strong>✅ Sistem Canlı Veritabanında Çalışıyor:</strong> Tüm müşteriler, görevler, kasadaki hesaplar ve notlar doğrudan bulut PostgreSQL veritabanında saklanmaktadır. Başka bir sekmeden veya cihazdan yapılan işlemler otomatik olarak anlık (realtime) güncellenir.
            </div>
          ) : dbStatus === 'empty_needs_seed' ? (
            <div>
              <strong>⚠️ Veritabanı Boş:</strong> Supabase bağlantısı başarılı oldu ancak tablolarda henüz kayıt yok. Sisteme hemen mevcut demo verilerini yüklemek için aşağıdaki <strong>"Başlangıç Verilerini Yükle (Seed)"</strong> butonuna tıklayabilirsiniz.
            </div>
          ) : dbStatus === 'missing_tables' ? (
            <div>
              <strong>⚠️ Tablolar Bulunamadı:</strong> Supabase projeniz bağlı ancak gerekli tablolar henüz oluşturulmamış. Proje klasöründeki <code>supabase_schema.sql</code> dosyasını açıp Supabase Dashboard &gt; SQL Editor alanında çalıştırınız.
            </div>
          ) : (
            <div>
              <strong>ℹ️ Bulut Veritabanı Kurulumu:</strong> Ücretsiz <a href="https://supabase.com" target="_blank" rel="noreferrer" style={{ color: 'var(--primary)', fontWeight: 600 }}>supabase.com</a> hesabı açıp bir proje oluşturduktan sonra Project Settings &gt; API sekmesindeki <strong>Project URL</strong> ve <strong>anon public API Key</strong> değerlerini aşağıdaki forma girerek veya <code>.env</code> dosyasına yazarak hemen canlı veritabanına geçebilirsiniz.
            </div>
          )}
        </div>

        {/* Supabase Bağlantı Formu */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '14px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px', color: 'var(--text-muted)' }}>
              Supabase Project URL
            </label>
            <div style={{ position: 'relative' }}>
              <Globe size={16} style={{ position: 'absolute', left: 12, top: 12, color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="https://xyzcompany.supabase.co"
                value={supabaseUrl}
                onChange={(e) => setSupabaseUrl(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px 10px 38px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-card)',
                  color: 'var(--text-main)',
                  fontSize: '0.88rem'
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px', color: 'var(--text-muted)' }}>
              Supabase Anon Public API Key
            </label>
            <div style={{ position: 'relative' }}>
              <Key size={16} style={{ position: 'absolute', left: 12, top: 12, color: 'var(--text-muted)' }} />
              <input
                type="password"
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                value={supabaseKey}
                onChange={(e) => setSupabaseKey(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px 10px 38px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-card)',
                  color: 'var(--text-main)',
                  fontSize: '0.88rem'
                }}
              />
            </div>
          </div>
        </div>

        {/* Eylem Butonları */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            className="btn btn-primary"
            onClick={handleSaveSupabaseConfig}
          >
            <CheckCircle2 size={16} />
            <span>Ayarları Kaydet &amp; Bağlan</span>
          </button>

          <button
            className="btn btn-secondary"
            onClick={handleTestConnection}
            disabled={isTestingConn}
          >
            <RefreshCw size={15} className={isTestingConn ? 'spin' : ''} />
            <span>{isTestingConn ? 'Test Ediliyor...' : 'Bağlantıyı Test Et'}</span>
          </button>

          <button
            className="btn btn-secondary"
            onClick={handleSeedDatabase}
            disabled={isSeeding}
            title="Mevcut verileri Supabase bulut veritabanına yükler"
          >
            <Cloud size={15} />
            <span>{isSeeding ? 'Aktarılıyor...' : 'Veritabanına Aktar (Seed)'}</span>
          </button>

          <button
            className="btn btn-secondary"
            onClick={handleCopySqlSchema}
          >
            {copiedSql ? <Check size={15} color="var(--success-text)" /> : <Copy size={15} />}
            <span>SQL Şema Dosyası Bilgisi</span>
          </button>
        </div>

        {/* Hızlı Kılavuz */}
        <div style={{
          padding: '14px',
          background: 'var(--bg-app)',
          borderRadius: 'var(--radius-sm)',
          fontSize: '0.8rem',
          color: 'var(--text-muted)',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px'
        }}>
          <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>🚀 1 Dakikada Canlı Veritabanı Kurulumu:</div>
          <div>1. <a href="https://supabase.com" target="_blank" rel="noreferrer" style={{ color: 'var(--primary)' }}>supabase.com</a> üzerinden ücretsiz yeni bir proje oluşturun.</div>
          <div>2. Projeniz açılınca sol menüdeki <strong>SQL Editor</strong> sekmesine gidin.</div>
          <div>3. Projenizdeki <code>supabase_schema.sql</code> dosyasının içeriğini yapıştırıp <strong>RUN</strong> butonuna basın.</div>
          <div>4. <strong>Project Settings &gt; API</strong> sekmesindeki URL ve Anon Key bilgilerini yukarıya girip <strong>Kaydet</strong> butonuna basın. Artık tüm verileriniz bulutta!</div>
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
