import React, { useState } from 'react';
import {
  ArrowLeft,
  Building2,
  Phone,
  MessageCircle,
  Mail,
  Globe,
  Instagram,
  Facebook,
  Calendar,
  CheckCircle2,
  Clock,
  Key,
  Eye,
  EyeOff,
  Copy,
  Plus,
  Trash2,
  FileText,
  UploadCloud,
  Download,
  History,
  AlertCircle,
  Sparkles,
  CheckSquare,
  ShieldCheck,
  Check,
  FileCheck,
  Lock,
  RefreshCw,
  Send,
  Edit2
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import AddCredentialModal from '../modals/AddCredentialModal';
import AddFileModal from '../modals/AddFileModal';
import OnboardingRequestModal from '../modals/OnboardingRequestModal';

export default function CustomerDetailView() {
  const {
    data,
    selectedCustomerId,
    setSelectedCustomerId,
    setActivePage,
    currentUser,
    getCustomerProgress,
    getAccessibleCustomers,
    toggleTask,
    addNote,
    deleteNote,
    deleteCredential,
    updateCredential,
    deleteFile,
    assignPartnerToCustomer,
    updateCustomerPortalAccess,
    deleteCustomer
  } = useApp();

  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'tasks' | 'credentials' | 'files' | 'notes' | 'activities' | 'onboarding'
  const [revealedPasswords, setRevealedPasswords] = useState({}); // { [credId_idx]: boolean }
  const [revealedOnboardingPasswords, setRevealedOnboardingPasswords] = useState({});
  const [copiedKey, setCopiedKey] = useState(null);

  // Portal giriş bilgileri state'leri
  const [isEditingPortalAccess, setIsEditingPortalAccess] = useState(false);
  const [editPortalEmail, setEditPortalEmail] = useState('');
  const [editPortalPassword, setEditPortalPassword] = useState('');
  const [isPortalPasswordRevealed, setIsPortalPasswordRevealed] = useState(false);
  const [portalFeedback, setPortalFeedback] = useState('');

  // Modallar
  const [isCredModalOpen, setIsCredModalOpen] = useState(false);
  const [editingCredential, setEditingCredential] = useState(null);
  const [isFileModalOpen, setIsFileModalOpen] = useState(false);
  const [isOnboardingModalOpen, setIsOnboardingModalOpen] = useState(false);

  // Not formu
  const [newNoteContent, setNewNoteContent] = useState('');
  const [newNoteColor, setNewNoteColor] = useState('blue');

  // Müşteri verileri (Katı Yetki Denetimi)
  const accessibleCustomers = getAccessibleCustomers();
  const customer = accessibleCustomers.find(c => c.id === selectedCustomerId);

  if (!customer) {
    return (
      <div className="card" style={{ padding: '48px 24px', textAlign: 'center', maxWidth: '560px', margin: '40px auto' }}>
        <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--danger-light)', color: 'var(--danger)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
          <AlertCircle size={26} />
        </div>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>
          Yetkisiz Erişim veya Müşteri Bulunamadı
        </h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginTop: '8px', lineHeight: 1.5 }}>
          Bu müşterinin detaylarını görüntüleme yetkiniz bulunmamaktadır veya bu müşteri size atanmamıştır.
        </p>
        <button
          className="btn btn-primary"
          onClick={() => setActivePage(currentUser.role === 'musteri' ? 'dashboard' : 'customers')}
          style={{ marginTop: '20px' }}
        >
          {currentUser.role === 'musteri' ? 'Portala Dön' : 'Müşteri Listesine Dön'}
        </button>
      </div>
    );
  }

  const progress = getCustomerProgress(customer.id);
  const customerTasks = data.tasks.filter(t => t.customerId === customer.id);
  const customerCredentials = data.credentials.filter(c => {
    if (c.customerId !== customer.id) return false;
    // Müşteri rolündeyse ve clientVisible false ise gizle (Madde 12)
    if (currentUser.role === 'musteri' && !c.clientVisible) return false;
    return true;
  });
  const customerFiles = data.files.filter(f => f.customerId === customer.id);
  const customerNotes = data.notes.filter(n => n.customerId === customer.id);
  const customerActivities = data.activities.filter(a => a.customerId === customer.id);
  const customerOnboardingRequests = (data.onboardingRequests || []).filter(r => r.customerId === customer.id);
  const pendingOnboarding = customerOnboardingRequests.find(r => r.status === 'pending');

  // Müşterinin portal giriş kullanıcısı (Madde: Müşteri Girişi & Şifre)
  const portalUser = data.users.find(u => u.customerId === customer.id && u.role === 'musteri');

  // Otomatik düzeltme: Yanlışlıkla alan adı olarak girilmiş kullanıcı adı/şifreleri standartlaştır
  useEffect(() => {
    customerCredentials.forEach(cred => {
      const omtekField = cred.fields?.find(f => f.key && f.key.toLowerCase().trim() === 'omteklazer');
      if (omtekField) {
        const usernameVal = 'omteklazer';
        const passVal = omtekField.value || 'Omtek028.';
        const otherFields = (cred.fields || []).filter(f => f !== omtekField && f.key !== 'Şifre');
        const fixedFields = [
          { key: 'Kullanıcı Adı', value: usernameVal, isSecret: false },
          { key: 'Şifre', value: passVal, isSecret: true },
          ...otherFields
        ];
        updateCredential(cred.id, {
          serviceType: cred.serviceType,
          serviceName: cred.serviceName,
          clientVisible: cred.clientVisible,
          fields: fixedFields
        });
      }
    });
  }, [customerCredentials, updateCredential]);

  const handleSavePortalAccess = async (e) => {
    e.preventDefault();
    if (!editPortalEmail.trim() || !editPortalPassword.trim()) return;
    const res = await updateCustomerPortalAccess(customer.id, {
      email: editPortalEmail,
      password: editPortalPassword,
      name: customer.contactPerson
    });
    if (res.success) {
      setIsEditingPortalAccess(false);
      setPortalFeedback('Portal giriş bilgileri başarıyla güncellendi!');
      setTimeout(() => setPortalFeedback(''), 4000);
    } else {
      alert(res.message || 'Portal bilgileri güncellenemedi.');
    }
  };

  // Şifre gösterme/gizleme
  const togglePasswordVisibility = (id) => {
    setRevealedPasswords(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleOnboardingPasswordVisibility = (id) => {
    setRevealedOnboardingPasswords(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Panoya kopyalama
  const handleCopy = (key, text) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Yeni not ekleme
  const handleAddNote = (e) => {
    e.preventDefault();
    if (!newNoteContent.trim()) return;
    addNote(customer.id, newNoteContent, newNoteColor);
    setNewNoteContent('');
  };

  const getProgressClass = (pct) => {
    if (pct < 30) return 'progress-low';
    if (pct < 70) return 'progress-mid';
    if (pct < 100) return 'progress-high';
    return 'progress-full';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%', maxWidth: '100%', minWidth: 0 }}>

      {/* Geri Dön Butonu ve Üst Navigasyon */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
        <button
          className="btn btn-secondary btn-sm"
          onClick={() => setActivePage('customers')}
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <ArrowLeft size={16} />
          <span>Müşteri Listesine Dön</span>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className={`badge badge-${customer.status}`}>
            {customer.status === 'aktif' ? '● Aktif Proje' : customer.status === 'beklemede' ? '● Beklemede' : '● ' + customer.status}
          </span>

          {currentUser.role === 'admin' && (
            <button
              className="btn btn-danger-outline btn-sm"
              onClick={async () => {
                if (window.confirm(`"${customer.companyName}" müşterisini ve bağlı tüm görev, dosya ve portal kullanıcı verilerini silmek istediğinize emin misiniz?`)) {
                  await deleteCustomer(customer.id);
                  setActivePage('customers');
                }
              }}
              style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 8px', fontSize: '0.78rem' }}
              title="Müşteriyi Sil"
            >
              <Trash2 size={14} />
              <span>Müşteriyi Sil</span>
            </button>
          )}
        </div>
      </div>

      {/* 5. MÜŞTERİ DETAY SAYFASI ÜST BÖLÜMÜ (Madde 5) */}
      <div
        className="card"
        style={{
          padding: '28px',
          background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          borderLeft: '6px solid var(--primary)',
          maxWidth: '100%',
          overflow: 'hidden'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', minWidth: 0 }}>
          <div style={{ minWidth: 0, flex: '1 1 300px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em', wordBreak: 'break-word' }}>
                {customer.companyName}
              </h2>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', wordBreak: 'break-word' }}>
                ({customer.projectTitle})
              </span>
            </div>

            {/* İletişim & Proje Meta Verileri */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap', marginTop: '10px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              <span>👤 Yetkili: <strong style={{ color: 'var(--text-main)' }}>{customer.contactPerson}</strong></span>
              <span>📞 Tel: <strong style={{ color: 'var(--text-main)' }}>{customer.phone}</strong></span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <span>🤝 Aracı:</span>
                {currentUser.role === 'admin' ? (
                  <select
                    value={customer.partnerId || ''}
                    onChange={(e) => assignPartnerToCustomer(customer.id, e.target.value)}
                    className="form-select"
                    style={{
                      display: 'inline-block',
                      fontSize: '0.8rem',
                      padding: '2px 8px',
                      borderRadius: 'var(--radius-sm)',
                      fontWeight: 700,
                      color: 'var(--primary)',
                      background: '#ffffff',
                      border: '1px solid var(--border-color)',
                      cursor: 'pointer'
                    }}
                    title="Admin: Müşteriyi aracıya ata"
                  >
                    <option value="">-- Atanmadı (Doğrudan) --</option>
                    {data.users.filter(u => u.role === 'araci').map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} (Aracı)
                      </option>
                    ))}
                  </select>
                ) : (
                  <strong style={{ color: 'var(--primary)' }}>{customer.partnerName || '—'}</strong>
                )}
              </span>
              <span>📅 Başlangıç: <strong style={{ color: 'var(--text-main)' }}>{customer.startDate}</strong></span>
            </div>

            {/* Hızlı Sosyal Medya ve WhatsApp Butonları */}
            <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
              {customer.whatsapp && (
                <a
                  href={`https://wa.me/${customer.whatsapp.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-secondary btn-sm"
                  style={{ color: '#16a34a', borderColor: '#bbf7d0', background: '#f0fdf4' }}
                >
                  <MessageCircle size={14} />
                  <span>WhatsApp Hattı</span>
                </a>
              )}
              {customer.website && (
                <a
                  href={customer.website}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-secondary btn-sm"
                >
                  <Globe size={14} />
                  <span>Web Sitesi</span>
                </a>
              )}
              {customer.instagram && (
                <span className="btn btn-secondary btn-sm" style={{ color: '#e1306c' }}>
                  <Instagram size={14} />
                  <span>{customer.instagram}</span>
                </span>
              )}
            </div>
          </div>

          {/* Sağ Büyük İlerleme Rozeti */}
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '2.4rem', fontWeight: 900, color: 'var(--primary)', lineHeight: 1 }}>
              %{progress.percentage}
            </div>
            <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', marginTop: '4px' }}>
              Genel Proje İlerlemesi
            </div>
          </div>
        </div>

        {/* BÜYÜK GENEL İLERLEME PROGRESS BARI (Madde 5 & 17) */}
        <div className="progress-container">
          <div className="progress-info">
            <span style={{ color: 'var(--text-muted)', fontSize: '0.84rem' }}>
              Toplam {progress.total} görevden <strong>{progress.completed}</strong> tanesi başarıyla tamamlandı
            </span>
            <span style={{ color: 'var(--text-main)', fontWeight: 700 }}>
              {progress.percentage === 100 ? '🎉 Tüm Görevler Tamamlandı!' : `%${progress.percentage} Tamamlandı`}
            </span>
          </div>
          <div className="progress-track progress-track-lg">
            <div
              className={`progress-fill ${getProgressClass(progress.percentage)}`}
              style={{ width: `${progress.percentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* 6. MÜŞTERİ İÇERİSİNDE SEKME YAPISI (Madde 6) */}
      <div className="tabs-nav">
        {[
          { id: 'overview', label: '1. Genel Bakış', icon: Building2 },
          { id: 'tasks', label: `2. Yapılacak İşler (${customerTasks.length})`, icon: CheckSquare },
          { id: 'credentials', label: `3. Hesap Bilgileri (${customerCredentials.length})`, icon: Key },
          { id: 'files', label: `4. Dosyalar (${customerFiles.length})`, icon: UploadCloud },
          { id: 'notes', label: `5. Notlar (${customerNotes.length})`, icon: FileText },
          { id: 'activities', label: `6. Aktivite Geçmişi`, icon: History },
          { id: 'onboarding', label: `7. Başlangıç Talepleri (${customerOnboardingRequests.length})`, icon: Sparkles }
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* SEKME 1: GENEL BAKIŞ */}
      {activeTab === 'overview' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))', gap: '20px' }}>

          {/* Portal Güncelleme Bildirimi */}
          {portalFeedback && (
            <div style={{
              gridColumn: '1 / -1',
              padding: '12px 18px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: '#ecfdf5',
              border: '1px solid #a7f3d0',
              color: '#065f46',
              fontSize: '0.85rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <CheckCircle2 size={18} />
              <span>{portalFeedback}</span>
            </div>
          )}

          {/* MÜŞTERİ PORTALI GİRİŞ BİLGİLERİ VE ŞİFRE YÖNETİMİ (Madde: Müşteri Girişi) */}
          <div
            className="card"
            style={{
              gridColumn: '1 / -1',
              borderLeft: '5px solid #2563eb',
              background: 'linear-gradient(135deg, #ffffff 0%, #f0f7ff 100%)',
              padding: '22px 24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: 42,
                  height: 42,
                  borderRadius: 'var(--radius-md)',
                  background: '#dbeafe',
                  color: '#1d4ed8',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 6px rgba(37, 99, 235, 0.15)'
                }}>
                  <ShieldCheck size={24} />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)' }}>
                      Müşteri Portalı Giriş Bilgileri & Şifre
                    </h3>
                    {portalUser ? (
                      <span style={{ fontSize: '0.72rem', background: '#dcfce7', color: '#15803d', padding: '2px 8px', borderRadius: 'var(--radius-full)', fontWeight: 700 }}>
                        ● Portal Girişi Açık
                      </span>
                    ) : (
                      <span style={{ fontSize: '0.72rem', background: '#fef3c7', color: '#b45309', padding: '2px 8px', borderRadius: 'var(--radius-full)', fontWeight: 700 }}>
                        ⏳ Henüz Hesap Oluşturulmadı
                      </span>
                    )}
                  </div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    Müşteriniz ana giriş sayfasından bu e-posta ve şifre ile oturum açarak doğrudan kendi portalına erişir.
                  </p>
                </div>
              </div>

              {/* Hızlı Aksiyon Butonları */}
              {portalUser && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  {currentUser.role === 'admin' && !isEditingPortalAccess && (
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => {
                        setEditPortalEmail(portalUser.email);
                        setEditPortalPassword(portalUser.password || '123456');
                        setIsEditingPortalAccess(true);
                      }}
                      style={{ fontSize: '0.8rem' }}
                    >
                      <Key size={14} />
                      <span>Şifreyi Değiştir</span>
                    </button>
                  )}

                  {customer.phone && (
                    <a
                      href={`https://wa.me/${(customer.whatsapp || customer.phone).replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                        `Sayın ${customer.contactPerson},\n\n${customer.companyName} için hazırlanan Avdens Work Müşteri Portalı giriş bilgileriniz:\n\n🌐 Panel Adresi: ${window.location.origin}\n📧 E-posta: ${portalUser.email}\n🔑 Şifre: ${portalUser.password || '123456'}\n\nBu bilgilerle giriş yaparak projenizdeki tamamlanan işleri, dosyaları ve onay bekleyen talepleri anlık olarak takip edebilirsiniz.`
                      )}`}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-secondary btn-sm"
                      style={{ fontSize: '0.8rem', color: '#16a34a', borderColor: '#bbf7d0', background: '#ffffff' }}
                      title="Giriş bilgilerini müşteriye WhatsApp ile gönder"
                    >
                      <MessageCircle size={14} />
                      <span>WhatsApp ile İlet</span>
                    </a>
                  )}
                </div>
              )}
            </div>

            {/* Portal Kullanıcı Bilgileri / Form */}
            {isEditingPortalAccess ? (
              <form onSubmit={handleSavePortalAccess} style={{ background: '#ffffff', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-main)' }}>
                  {portalUser ? 'Portal Giriş E-postası ve Şifresini Güncelle' : 'Müşteriye Portal Giriş Hesabı ve Şifre Belirle'}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))', gap: '14px' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Giriş E-postası</label>
                    <input
                      type="email"
                      className="form-input"
                      value={editPortalEmail}
                      onChange={(e) => setEditPortalEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <label style={{ fontSize: '0.8rem', fontWeight: 600, marginBottom: 0 }}>Portal Şifresi</label>
                      <button
                        type="button"
                        onClick={() => {
                          const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$';
                          let p = '';
                          for (let i = 0; i < 9; i++) p += chars.charAt(Math.floor(Math.random() * chars.length));
                          setEditPortalPassword(p);
                        }}
                        style={{ fontSize: '0.72rem', color: 'var(--primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '3px' }}
                      >
                        <RefreshCw size={11} />
                        <span>Rastgele Üret</span>
                      </button>
                    </div>
                    <input
                      type="text"
                      className="form-input"
                      value={editPortalPassword}
                      onChange={(e) => setEditPortalPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => setIsEditingPortalAccess(false)}>
                    Vazgeç
                  </button>
                  <button type="submit" className="btn btn-primary btn-sm">
                    {portalUser ? 'Değişiklikleri Kaydet' : 'Hesabı ve Şifreyi Oluştur'}
                  </button>
                </div>
              </form>
            ) : portalUser ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '14px' }}>
                {/* E-posta Kutusu */}
                <div style={{ background: '#ffffff', padding: '14px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block' }}>
                      Müşteri Giriş E-postası
                    </span>
                    <strong style={{ fontSize: '0.92rem', color: 'var(--text-main)', wordBreak: 'break-all' }}>
                      {portalUser.email}
                    </strong>
                  </div>
                  <button
                    onClick={() => handleCopy('p_email', portalUser.email)}
                    className="btn btn-secondary btn-sm"
                    style={{ padding: '6px 10px', fontSize: '0.75rem' }}
                    title="E-postayı Kopyala"
                  >
                    {copiedKey === 'p_email' ? <Check size={14} color="var(--success)" /> : <Copy size={14} />}
                    <span>{copiedKey === 'p_email' ? 'Kopyalandı' : 'Kopyala'}</span>
                  </button>
                </div>

                {/* Şifre Kutusu */}
                <div style={{ background: '#ffffff', padding: '14px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block' }}>
                      Müşteri Giriş Şifresi
                    </span>
                    <strong style={{ fontSize: '1rem', fontFamily: isPortalPasswordRevealed ? 'inherit' : 'monospace', color: 'var(--text-main)' }}>
                      {isPortalPasswordRevealed ? (portalUser.password || '123456') : '••••••••••••'}
                    </strong>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <button
                      onClick={() => setIsPortalPasswordRevealed(!isPortalPasswordRevealed)}
                      className="btn btn-secondary btn-sm"
                      style={{ padding: '6px 8px' }}
                      title={isPortalPasswordRevealed ? 'Şifreyi Gizle' : 'Şifreyi Göster'}
                    >
                      {isPortalPasswordRevealed ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                    <button
                      onClick={() => handleCopy('p_pass', portalUser.password || '123456')}
                      className="btn btn-secondary btn-sm"
                      style={{ padding: '6px 10px', fontSize: '0.75rem' }}
                      title="Şifreyi Kopyala"
                    >
                      {copiedKey === 'p_pass' ? <Check size={14} color="var(--success)" /> : <Copy size={14} />}
                      <span>{copiedKey === 'p_pass' ? 'Kopyalandı' : 'Kopyala'}</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 'var(--radius-md)', padding: '16px' }}>
                <div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#92400e' }}>
                    Bu müşteri için henüz portal giriş şifresi tanımlanmadı
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#b45309', marginTop: '2px' }}>
                    Müşterinin portala giriş yapabilmesi için tek tıkla şifre belirleyip hesap açabilirsiniz.
                  </div>
                </div>

                {currentUser.role === 'admin' && (
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => {
                      setEditPortalEmail(customer.email || 'musteri@firma.com');
                      setEditPortalPassword('Avdens2026!');
                      setIsEditingPortalAccess(true);
                    }}
                  >
                    <Key size={14} />
                    <span>Şimdi Portal Şifresi Belirle</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Başlangıç Bilgi & Belge Talepleri Bannerı */}
          {customerOnboardingRequests.length > 0 ? (
            <div style={{
              gridColumn: '1 / -1',
              padding: '16px 20px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: pendingOnboarding ? '#fffbeb' : '#f0fdf4',
              border: `1px solid ${pendingOnboarding ? '#fcd34d' : '#86efac'}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: 38,
                  height: 38,
                  borderRadius: 'var(--radius-sm)',
                  background: pendingOnboarding ? '#fef3c7' : '#dcfce7',
                  color: pendingOnboarding ? '#d97706' : '#16a34a',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Sparkles size={20} />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.92rem', color: pendingOnboarding ? '#92400e' : '#166534' }}>
                    {pendingOnboarding ? '⏳ Müşteriden İşe Başlamak İçin Bilgi & Belge Bekleniyor' : '✅ Başlangıç Bilgi & Belgeleri Tamamlandı'}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: pendingOnboarding ? '#b45309' : '#15803d' }}>
                    {pendingOnboarding
                      ? `${pendingOnboarding.title} (${pendingOnboarding.items.length} alan talep edildi. Müşteri portalında bildirim aktif.)`
                      : 'Müşteri istenilen logo, şifre ve bilgileri teslim etti. Proje aktif olarak yürütülüyor.'}
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => setActiveTab('onboarding')}
                  style={{ fontSize: '0.8rem' }}
                >
                  Talepleri Gör ({customerOnboardingRequests.length})
                </button>
                {currentUser.role === 'admin' && (
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => setIsOnboardingModalOpen(true)}
                    style={{ fontSize: '0.8rem' }}
                  >
                    <Plus size={14} />
                    <span>Yeni Talep Gönder</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            currentUser.role === 'admin' && (
              <div style={{
                gridColumn: '1 / -1',
                padding: '16px 20px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--primary-light)',
                border: '1px solid #bfdbfe',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '12px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Sparkles size={20} color="var(--primary)" />
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--primary)' }}>
                      Müşteriden İşe Başlamak İçin Bilgi & Belge İsteyin
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      Logo, sosyal medya şifreleri, sözleşme veya özel notları tek tıkla talep edin; müşteriye anında bildirim gitsin.
                    </div>
                  </div>
                </div>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => setIsOnboardingModalOpen(true)}
                >
                  <Plus size={14} />
                  <span>Bilgi & Belge Talep Et</span>
                </button>
              </div>
            )
          )}

          {/* Proje Tanımı ve Hedef */}
          <div className="card">
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '12px' }}>
              Proje Hedef ve Kapsamı
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.6 }}>
              {customer.description || 'Bu proje kapsamında sosyal medya varlığı, reklam optimizasyonları ve dijital kanalların yönetimi yürütülmektedir.'}
            </p>

            <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', background: 'var(--bg-app)', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem' }}>
                <span>Proje Durumu:</span>
                <span className={`badge badge-${customer.status}`}>{customer.status.toUpperCase()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', background: 'var(--bg-app)', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem' }}>
                <span>Bağlı Aracı / İş Ortağı:</span>
                {currentUser.role === 'admin' ? (
                  <select
                    value={customer.partnerId || ''}
                    onChange={(e) => assignPartnerToCustomer(customer.id, e.target.value)}
                    className="form-select"
                    style={{ fontSize: '0.8rem', padding: '3px 8px', fontWeight: 600, color: 'var(--primary)', maxWidth: '180px' }}
                  >
                    <option value="">-- Atanmadı (Doğrudan) --</option>
                    {data.users.filter(u => u.role === 'araci').map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} (Aracı)
                      </option>
                    ))}
                  </select>
                ) : (
                  <strong style={{ color: 'var(--primary)' }}>{customer.partnerName || '—'}</strong>
                )}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', background: 'var(--bg-app)', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem' }}>
                <span>Başlangıç Tarihi:</span>
                <strong>{customer.startDate}</strong>
              </div>
            </div>
          </div>

          {/* Hızlı İşler Özeti */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Görev Durum Dağılımı</h3>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setActiveTab('tasks')}
                style={{ fontSize: '0.78rem' }}
              >
                Tüm İşlere Git →
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
              <div style={{ padding: '14px', background: 'var(--success-light)', borderRadius: 'var(--radius-md)' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--success-text)', fontWeight: 600 }}>Tamamlanan</span>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--success-text)' }}>
                  {progress.completed}
                </div>
              </div>
              <div style={{ padding: '14px', background: 'var(--warning-light)', borderRadius: 'var(--radius-md)' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--warning-text)', fontWeight: 600 }}>Devam Eden / Bekleyen</span>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--warning-text)' }}>
                  {progress.total - progress.completed}
                </div>
              </div>
            </div>

            {/* Müşteriden Beklenen Görevler Vurgusu */}
            {customerTasks.filter(t => t.waitingForClient && !t.isCompleted).length > 0 && (
              <div style={{ backgroundColor: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 'var(--radius-md)', padding: '14px' }}>
                <strong style={{ fontSize: '0.85rem', color: '#c2410c', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <AlertCircle size={16} />
                  <span>Müşteriden Beklenen İşler ({customerTasks.filter(t => t.waitingForClient && !t.isCompleted).length})</span>
                </strong>
                <ul style={{ marginTop: '8px', paddingLeft: '18px', fontSize: '0.82rem', color: '#9a3412', listStyleType: 'disc' }}>
                  {customerTasks.filter(t => t.waitingForClient && !t.isCompleted).map(t => (
                    <li key={t.id} style={{ marginBottom: '4px' }}>
                      <strong>{t.title}:</strong> {t.waitingReason || 'Müşteri onayı gerekiyor'}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SEKME 2: YAPILACAK İŞLER (Önizleme & Hızlı Tikleme) */}
      {activeTab === 'tasks' && (
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Yapılacak İşler Listesi</h3>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                Kutucukları işaretleyerek görevi tamamlayın; yüzde ve aktiviteler otomatik güncellenir.
              </span>
            </div>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary)', background: 'var(--primary-light)', padding: '6px 14px', borderRadius: 'var(--radius-full)' }}>
              %{progress.percentage} Tamamlandı
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {customerTasks.map((task) => {
              const category = data.categories.find(c => c.id === task.categoryId);
              return (
                <div
                  key={task.id}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px',
                    padding: '14px 16px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)',
                    backgroundColor: task.isCompleted ? 'var(--bg-app)' : '#ffffff',
                    transition: 'var(--transition)'
                  }}
                >
                  <div
                    className={`custom-checkbox ${task.isCompleted ? 'checked' : ''}`}
                    onClick={() => toggleTask(task.id)}
                    style={{ marginTop: '2px', cursor: 'pointer' }}
                  >
                    {task.isCompleted && <Check size={14} strokeWidth={3} />}
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <span
                        style={{
                          fontSize: '0.92rem',
                          fontWeight: 600,
                          color: task.isCompleted ? 'var(--text-muted)' : 'var(--text-main)',
                          textDecoration: task.isCompleted ? 'line-through' : 'none'
                        }}
                      >
                        {task.title}
                      </span>

                      {category && (
                        <span style={{ fontSize: '0.72rem', fontWeight: 600, padding: '2px 8px', borderRadius: 'var(--radius-sm)', backgroundColor: `${category.color}15`, color: category.color }}>
                          {category.name}
                        </span>
                      )}

                      {task.waitingForClient && (
                        <span className="badge-waiting-client">
                          ⚠️ {task.waitingReason || 'Müşteriden Bekleniyor'}
                        </span>
                      )}
                    </div>

                    {task.description && (
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                        {task.description}
                      </p>
                    )}

                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginTop: '6px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      <span>👤 {task.assignedTo}</span>
                      <span>📅 Son Tarih: {task.dueDate}</span>
                      {task.isCompleted && task.completedBy && (
                        <span style={{ color: 'var(--success)', fontWeight: 600 }}>
                          ✓ {task.completedBy} ({task.completedAt ? new Date(task.completedAt).toLocaleDateString('tr-TR') : ''})
                        </span>
                      )}
                    </div>
                  </div>

                  <span className={`badge badge-priority-${task.priority}`}>
                    {task.priority === 'acil' ? '⚡ Acil' : task.priority === 'yuksek' ? 'Yüksek' : task.priority === 'normal' ? 'Normal' : 'Düşük'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SEKME 3: HESAP BİLGİLERİ KASASI (Madde 11 & Madde 12) */}
      {activeTab === 'credentials' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Hesap Bilgileri Kasası</h3>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                Şifreler varsayılan olarak gizlidir (••••••••). 👁 Göster butonu ile yetkili olarak görüntüleyebilirsiniz.
              </span>
            </div>

            {currentUser.role !== 'musteri' && (
              <button
                className="btn btn-primary btn-sm"
                onClick={() => {
                  setEditingCredential(null);
                  setIsCredModalOpen(true);
                }}
              >
                <Plus size={16} />
                <span>Yeni Hesap Bilgisi Ekle</span>
              </button>
            )}
          </div>

          {/* Hesap Kartları Grid'i */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 290px), 1fr))', gap: '18px' }}>
            {customerCredentials.length === 0 ? (
              <div className="card" style={{ gridColumn: '1 / -1', padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                Henüz hesap bilgisi eklenmemiş.
              </div>
            ) : (
              customerCredentials.map((cred) => (
                <div key={cred.id} className="card" style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {/* Başlık ve Servis Rozeti */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: 38, height: 38, borderRadius: 'var(--radius-md)', background: `${cred.color}15`, color: cred.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Key size={18} />
                      </div>
                      <div>
                        <h4 style={{ fontSize: '1.05rem', fontWeight: 700 }}>{cred.serviceName}</h4>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{cred.serviceType}</span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {cred.clientVisible ? (
                        <span style={{ fontSize: '0.7rem', color: 'var(--success-text)', background: 'var(--success-light)', padding: '2px 8px', borderRadius: 'var(--radius-full)', fontWeight: 600 }}>
                          Müşteri Görebilir
                        </span>
                      ) : (
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', background: 'var(--bg-app)', padding: '2px 8px', borderRadius: 'var(--radius-full)', fontWeight: 600 }}>
                          Ajans Özel
                        </span>
                      )}

                      {currentUser.role === 'admin' && (
                        <>
                          <button
                            onClick={() => {
                              setEditingCredential(cred);
                              setIsCredModalOpen(true);
                            }}
                            style={{ color: 'var(--primary)', padding: '4px' }}
                            title="Hesap bilgisini düzenle"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm('Bu hesap bilgisini silmek istediğinize emin misiniz?')) {
                                deleteCredential(cred.id);
                              }
                            }}
                            style={{ color: 'var(--danger)', padding: '4px' }}
                            title="Hesap bilgisini sil"
                          >
                            <Trash2 size={16} />
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Alanlar Listesi */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', backgroundColor: 'var(--bg-app)', padding: '14px', borderRadius: 'var(--radius-md)' }}>
                    {cred.fields.map((f, idx) => {
                      const fieldId = `${cred.id}_${idx}`;
                      const isRevealed = revealedPasswords[fieldId];
                      const isCopied = copiedKey === fieldId;

                      return (
                        <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', fontSize: '0.84rem' }}>
                          <span style={{ color: 'var(--text-muted)', fontWeight: 500, minWidth: '90px' }}>
                            {f.key}:
                          </span>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 1, justifyContent: 'flex-end' }}>
                            <span
                              style={{
                                fontFamily: f.isSecret && !isRevealed ? 'monospace' : 'inherit',
                                fontWeight: 600,
                                color: 'var(--text-main)',
                                wordBreak: 'break-all'
                              }}
                            >
                              {f.isSecret && !isRevealed ? '••••••••••••' : f.value}
                            </span>

                            {/* Şifre Göster / Gizle Butonu (Madde 12) */}
                            {f.isSecret && (
                              <button
                                onClick={() => togglePasswordVisibility(fieldId)}
                                style={{ color: 'var(--primary)', padding: '2px 6px' }}
                                title={isRevealed ? 'Şifreyi Gizle' : 'Şifreyi Göster'}
                              >
                                {isRevealed ? <EyeOff size={15} /> : <Eye size={15} />}
                              </button>
                            )}

                            {/* Kopyalama Butonu */}
                            <button
                              onClick={() => handleCopy(fieldId, f.value)}
                              style={{ color: isCopied ? 'var(--success)' : 'var(--text-muted)', padding: '2px 6px' }}
                              title="Panoya Kopyala"
                            >
                              {isCopied ? <Check size={14} /> : <Copy size={14} />}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', textAlign: 'right' }}>
                    Son güncelleme: {cred.updatedAt}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* SEKME 4: DOSYALAR (Madde 14) */}
      {activeTab === 'files' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Müşteri Dosya ve Dokümanları</h3>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                Logo, kurumsal kimlik, sözleşmeler ve kampanya materyalleri.
              </span>
            </div>

            <button className="btn btn-primary btn-sm" onClick={() => setIsFileModalOpen(true)}>
              <UploadCloud size={16} />
              <span>Yeni Dosya Yükle</span>
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '16px' }}>
            {customerFiles.length === 0 ? (
              <div className="card" style={{ gridColumn: '1 / -1', padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                Henüz yüklenmiş dosya bulunmuyor.
              </div>
            ) : (
              customerFiles.map((file) => (
                <div key={file.id} className="card" style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-md)', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <FileText size={20} />
                      </div>
                      <div>
                        <strong style={{ fontSize: '0.9rem', color: 'var(--text-main)', display: 'block' }}>
                          {file.name}
                        </strong>
                        <span style={{ fontSize: '0.72rem', color: 'var(--primary)', fontWeight: 700 }}>
                          {file.category} • {file.size}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => deleteFile(file.id)}
                      style={{ color: 'var(--danger)', padding: '4px' }}
                      title="Dosyayı Sil"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  {file.description && (
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {file.description}
                    </p>
                  )}

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '10px', borderTop: '1px solid var(--border-subtle)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    <span>Yükleyen: {file.uploadedBy}</span>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => alert(`"${file.name}" dosyası indiriliyor (demo simülasyonu).`)}
                      style={{ fontSize: '0.75rem', padding: '4px 8px' }}
                    >
                      <Download size={13} />
                      <span>İndir</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* SEKME 5: NOTLAR (Madde 13) */}
      {activeTab === 'notes' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Müşteri Özel Notları</h3>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Ajans ve aracı ekibinin müşteri hakkında aldığı kritik notlar.
            </span>
          </div>

          {/* Yeni Not Ekleme Formu */}
          <form onSubmit={handleAddNote} className="card" style={{ padding: '18px' }}>
            <div className="form-group">
              <label>Yeni Not Ekle</label>
              <textarea
                className="form-textarea"
                rows={3}
                placeholder="Örn: Müşteri tasarımda lacivert ve altın tonları tercih ediyor..."
                value={newNoteContent}
                onChange={(e) => setNewNoteContent(e.target.value)}
                required
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Renk:</span>
                {['blue', 'amber', 'emerald', 'rose', 'purple'].map(color => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setNewNoteColor(color)}
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      backgroundColor:
                        color === 'blue' ? '#3b82f6' :
                        color === 'amber' ? '#f59e0b' :
                        color === 'emerald' ? '#10b981' :
                        color === 'rose' ? '#ef4444' : '#8b5cf6',
                      border: newNoteColor === color ? '3px solid #0f172a' : 'none'
                    }}
                  />
                ))}
              </div>

              <button type="submit" className="btn btn-primary btn-sm">
                <Plus size={16} />
                <span>Notu Kaydet</span>
              </button>
            </div>
          </form>

          {/* Notlar Kartları */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '16px' }}>
            {customerNotes.length === 0 ? (
              <div className="card" style={{ gridColumn: '1 / -1', padding: '30px', textAlign: 'center', color: 'var(--text-muted)' }}>
                Henüz eklenmiş not yok.
              </div>
            ) : (
              customerNotes.map((n) => (
                <div
                  key={n.id}
                  className="card"
                  style={{
                    padding: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    borderLeft: `5px solid ${
                      n.color === 'amber' ? '#f59e0b' :
                      n.color === 'emerald' ? '#10b981' :
                      n.color === 'rose' ? '#ef4444' :
                      n.color === 'purple' ? '#8b5cf6' : '#3b82f6'
                    }`
                  }}
                >
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-main)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                    "{n.content}"
                  </p>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '16px', paddingTop: '10px', borderTop: '1px solid var(--border-subtle)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <img src={n.authorAvatar} alt={n.authorName} style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover' }} />
                      <div>
                        <strong style={{ fontSize: '0.78rem', color: 'var(--text-main)', display: 'block' }}>
                          {n.authorName} ({n.authorRole})
                        </strong>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                          {new Date(n.createdAt).toLocaleString('tr-TR', { dateStyle: 'short', timeStyle: 'short' })}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => deleteNote(n.id)}
                      style={{ color: 'var(--danger)', padding: '4px' }}
                      title="Notu Sil"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* SEKME 6: AKTİVİTE GEÇMİŞİ (Madde 16) */}
      {activeTab === 'activities' && (
        <div className="card" style={{ padding: '24px' }}>
          <div style={{ marginBottom: '18px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Aktivite ve İşlem Geçmişi</h3>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              {customer.companyName} projesi üzerinde yapılan tüm kayıtlar tarih ve saat ile listelenir.
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {customerActivities.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                Henüz bir aktivite kaydı yok.
              </div>
            ) : (
              customerActivities.map((act) => (
                <div key={act.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: '50%',
                      backgroundColor:
                        act.type === 'task_completed' ? 'var(--success-light)' :
                        act.type === 'comment' ? 'var(--primary-light)' :
                        act.type === 'credential' ? 'var(--warning-light)' : 'var(--bg-app)',
                      color:
                        act.type === 'task_completed' ? 'var(--success)' :
                        act.type === 'comment' ? 'var(--primary)' :
                        act.type === 'credential' ? 'var(--warning)' : 'var(--text-muted)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}
                  >
                    {act.type === 'task_completed' ? <CheckCircle2 size={18} /> :
                     act.type === 'comment' ? <MessageCircle size={18} /> :
                     act.type === 'credential' ? <Key size={18} /> :
                     <Sparkles size={18} />}
                  </div>

                  <div style={{ flex: 1, borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px' }}>
                    <div style={{ fontSize: '0.88rem', color: 'var(--text-main)', fontWeight: 500 }}>
                      <strong>{act.userName}</strong>: {act.actionText}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      📅 {new Date(act.createdAt).toLocaleString('tr-TR', { dateStyle: 'long', timeStyle: 'short' })}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* SEKME 7: BAŞLANGIÇ BİLGİ TALEPLERİ (ONBOARDING) */}
      {activeTab === 'onboarding' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Üst Eylem ve Açıklama Çubuğu */}
          <div className="card" style={{ padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: 38, height: 38, borderRadius: 'var(--radius-sm)', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Sparkles size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Müşteriden İstenen Başlangıç Bilgileri</h3>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  İşlerin başlayabilmesi için talep edilen kurumsal logo, şifreler, iletişim bilgileri ve notlar
                </span>
              </div>
            </div>

            {currentUser.role === 'admin' && (
              <button
                className="btn btn-primary"
                onClick={() => setIsOnboardingModalOpen(true)}
              >
                <Plus size={16} />
                <span>Yeni Bilgi & Belge Talep Et</span>
              </button>
            )}
          </div>

          {/* Talep Listesi */}
          {customerOnboardingRequests.length === 0 ? (
            <div className="card" style={{ padding: '40px', textAlign: 'center' }}>
              <Sparkles size={40} color="var(--primary)" style={{ opacity: 0.5, margin: '0 auto 12px auto' }} />
              <h4 style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--text-main)' }}>
                Henüz Başlangıç Bilgi Talebi Oluşturulmadı
              </h4>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', maxWidth: '480px', margin: '6px auto 16px auto' }}>
                Projeye start vermek için müşteriden logonun vektörel halini, panel veya sosyal medya şifrelerini, notlarını hemen talep edebilirsiniz.
              </p>
              {currentUser.role === 'admin' && (
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => setIsOnboardingModalOpen(true)}
                >
                  <Plus size={14} />
                  <span>Şimdi Talep Gönder</span>
                </button>
              )}
            </div>
          ) : (
            customerOnboardingRequests.map((req) => (
              <div
                key={req.id}
                className="card"
                style={{
                  padding: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                  borderTop: `4px solid ${req.status === 'completed' ? 'var(--success)' : 'var(--warning)'}`
                }}
              >
                {/* Talep Kart Başlığı */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <h4 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)' }}>
                        {req.title}
                      </h4>
                      <span className={`badge badge-${req.status === 'completed' ? 'aktif' : 'beklemede'}`}>
                        {req.status === 'completed' ? '✓ Müşteri Doldurdu (Tamamlandı)' : '⏳ Müşteri Doldurması Bekleniyor'}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                      {req.description}
                    </p>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Talep Tarihi: {new Date(req.createdAt).toLocaleDateString('tr-TR')}
                      {req.completedAt && ` • Teslim Tarihi: ${new Date(req.completedAt).toLocaleDateString('tr-TR')}`}
                    </span>
                  </div>
                </div>

                {/* Alanlar Listesi */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Talep Edilen Alanlar & Gelen Veriler ({req.items.length})
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))', gap: '12px' }}>
                    {req.items.map((item, idx) => {
                      const pwKey = `${req.id}_${item.id || idx}`;
                      const isRevealed = revealedOnboardingPasswords[pwKey];

                      return (
                        <div
                          key={item.id || idx}
                          style={{
                            background: 'var(--bg-app)',
                            border: '1px solid var(--border-subtle)',
                            borderRadius: 'var(--radius-md)',
                            padding: '14px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '8px'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)' }}>
                                {item.label}
                              </span>
                              {item.required && (
                                <span style={{ color: 'var(--danger)', fontSize: '0.75rem', fontWeight: 700 }}>*</span>
                              )}
                            </div>
                            <span style={{
                              fontSize: '0.72rem',
                              padding: '2px 8px',
                              borderRadius: 'var(--radius-full)',
                              background: item.type === 'password' ? '#fef3c7' : item.type === 'file' ? '#e0f2fe' : item.type === 'note' ? '#f3e8ff' : 'var(--border-color)',
                              color: item.type === 'password' ? '#92400e' : item.type === 'file' ? '#0369a1' : item.type === 'note' ? '#6b21a8' : 'var(--text-muted)',
                              fontWeight: 600
                            }}>
                              {item.type === 'password' ? 'Gizli Şifre 🔑' : item.type === 'file' ? 'Dosya 📁' : item.type === 'note' ? 'Not 📝' : 'Metin'}
                            </span>
                          </div>

                          {/* Değer Gösterimi */}
                          {item.value ? (
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#ffffff', padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                              {item.type === 'password' ? (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
                                  <span style={{ fontFamily: 'monospace', fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-main)' }}>
                                    {isRevealed ? item.value : '••••••••••••'}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => toggleOnboardingPasswordVisibility(pwKey)}
                                    style={{ color: 'var(--text-muted)' }}
                                    title={isRevealed ? 'Şifreyi Gizle' : 'Şifreyi Göster'}
                                  >
                                    {isRevealed ? <EyeOff size={14} /> : <Eye size={14} />}
                                  </button>
                                </div>
                              ) : item.type === 'file' ? (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--primary)', fontWeight: 600, fontSize: '0.84rem' }}>
                                  <UploadCloud size={14} />
                                  <span>{item.value}</span>
                                </div>
                              ) : (
                                <span style={{ fontSize: '0.85rem', color: 'var(--text-main)', wordBreak: 'break-word' }}>
                                  {item.value}
                                </span>
                              )}

                              <button
                                type="button"
                                onClick={() => handleCopy(pwKey, item.value)}
                                style={{ color: copiedKey === pwKey ? 'var(--success)' : 'var(--text-muted)', marginLeft: '8px', padding: '2px' }}
                                title="Değeri Kopyala"
                              >
                                {copiedKey === pwKey ? <Check size={14} /> : <Copy size={14} />}
                              </button>
                            </div>
                          ) : (
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic', background: 'rgba(255,255,255,0.6)', padding: '6px 10px', borderRadius: 'var(--radius-sm)' }}>
                              {req.status === 'pending' ? '⏳ Müşteri portalından doldurulması bekleniyor...' : 'Doldurulmadı'}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Modallar */}
      <AddCredentialModal
        isOpen={isCredModalOpen}
        onClose={() => {
          setIsCredModalOpen(false);
          setEditingCredential(null);
        }}
        customerId={customer.id}
        editingCredential={editingCredential}
      />

      <AddFileModal
        isOpen={isFileModalOpen}
        onClose={() => setIsFileModalOpen(false)}
        customerId={customer.id}
      />

      <OnboardingRequestModal
        isOpen={isOnboardingModalOpen}
        onClose={() => setIsOnboardingModalOpen(false)}
        customerId={customer.id}
      />

    </div>
  );
}
