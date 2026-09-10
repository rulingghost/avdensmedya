import React, { useState } from 'react';
import {
  X,
  Building2,
  User,
  Phone,
  Mail,
  Globe,
  Instagram,
  Facebook,
  FileText,
  UserCheck,
  Sparkles,
  Lock,
  Eye,
  EyeOff,
  RefreshCw,
  Key,
  Copy,
  Check,
  Plus,
  Trash2,
  FileCheck,
  ChevronDown,
  ChevronUp,
  ShieldCheck
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { generateTemplateOnboarding } from '../../utils/onboardingHelper';

export default function NewCustomerModal({ isOpen, onClose }) {
  const { data, addCustomer, setSelectedCustomerId, setActivePage, currentUser } = useApp();

  const [showPassword, setShowPassword] = useState(false);
  const [passwordCopied, setPasswordCopied] = useState(false);

  const initialTemplateId = data.templates[0]?.id || '';
  const initialOnboarding = initialTemplateId
    ? generateTemplateOnboarding(data.templates.find(t => t.id === initialTemplateId))
    : null;

  const [formData, setFormData] = useState({
    companyName: '',
    contactPerson: '',
    phone: '',
    whatsapp: '',
    email: '',
    website: '',
    instagram: '',
    facebook: '',
    partnerId: currentUser?.role === 'araci' ? currentUser.id : (data.users.find(u => u.role === 'araci')?.id || data.users[0]?.id || ''),
    status: 'aktif',
    projectTitle: 'Dijital Pazarlama & Sosyal Medya Yönetimi',
    description: '',
    applyTemplateId: initialTemplateId,
    createPortalUser: true,
    clientEmail: '',
    clientPassword: 'Avdens2026!'
  });

  const [autoOnboardingEnabled, setAutoOnboardingEnabled] = useState(Boolean(initialOnboarding));
  const [onboardingData, setOnboardingData] = useState(initialOnboarding);
  const [isOnboardingExpanded, setIsOnboardingExpanded] = useState(true);
  const [mouseDownOnOverlay, setMouseDownOnOverlay] = useState(false);

  if (!isOpen) return null;

  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$';
    let res = '';
    for (let i = 0; i < 9; i++) {
      res += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData(prev => ({ ...prev, clientPassword: res }));
  };

  const handleTemplateChange = (newTemplateId) => {
    setFormData(prev => ({ ...prev, applyTemplateId: newTemplateId }));
    if (!newTemplateId) {
      setOnboardingData(null);
      setAutoOnboardingEnabled(false);
    } else {
      const selectedTmpl = data.templates.find(t => t.id === newTemplateId);
      if (selectedTmpl) {
        const generated = generateTemplateOnboarding(selectedTmpl);
        setOnboardingData(generated);
        setAutoOnboardingEnabled(true);
      }
    }
  };

  const handleItemLabelChange = (index, val) => {
    if (!onboardingData) return;
    const updated = [...onboardingData.items];
    updated[index] = { ...updated[index], label: val };
    setOnboardingData(prev => ({ ...prev, items: updated }));
  };

  const handleItemTypeChange = (index, type) => {
    if (!onboardingData) return;
    const updated = [...onboardingData.items];
    updated[index] = { ...updated[index], type };
    setOnboardingData(prev => ({ ...prev, items: updated }));
  };

  const handleItemRequiredChange = (index, required) => {
    if (!onboardingData) return;
    const updated = [...onboardingData.items];
    updated[index] = { ...updated[index], required };
    setOnboardingData(prev => ({ ...prev, items: updated }));
  };

  const handleRemoveItem = (index) => {
    if (!onboardingData) return;
    const updated = onboardingData.items.filter((_, i) => i !== index);
    setOnboardingData(prev => ({ ...prev, items: updated }));
  };

  const handleAddItem = () => {
    if (!onboardingData) return;
    const newItem = { label: '', type: 'text', required: true };
    setOnboardingData(prev => ({ ...prev, items: [...prev.items, newItem] }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.companyName.trim()) {
      alert('Lütfen firma adını giriniz.');
      return;
    }

    const payload = {
      ...formData,
      clientEmail: formData.clientEmail || formData.email
    };

    const autoOnboardingPayload = (formData.applyTemplateId && autoOnboardingEnabled && onboardingData && onboardingData.items?.length > 0)
      ? {
          title: onboardingData.title,
          description: onboardingData.description,
          items: onboardingData.items.filter(it => it && it.label && it.label.trim())
        }
      : null;

    const newCustomerId = addCustomer(payload, formData.applyTemplateId || null, autoOnboardingPayload);
    onClose();

    // Kullanıcıyı yeni müşterinin detayına götür
    if (newCustomerId) {
      setSelectedCustomerId(newCustomerId);
      setActivePage('customer-detail');
    }
  };

  return (
    <div
      className="modal-overlay"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) setMouseDownOnOverlay(true);
        else setMouseDownOnOverlay(false);
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && mouseDownOnOverlay) onClose();
        setMouseDownOnOverlay(false);
      }}
    >
      <div
        className="modal-content"
        style={{ maxWidth: '720px' }}
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Başlığı */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
              <Building2 size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)' }}>Yeni Müşteri Ekle</h3>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Müşteri firma ve proje detaylarını oluşturun</span>
            </div>
          </div>
          <button onClick={onClose} style={{ color: 'var(--text-muted)' }}>
            <X size={20} />
          </button>
        </div>

        {/* Modal Formu */}
        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>

            {/* Firma Bilgileri */}
            <div style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '14px' }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>
                1. Firma & İletişim Bilgileri
              </div>

              <div className="form-group">
                <label>Firma Adı *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Örn: ABC Teknoloji, Yılmaz Mobilya"
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div className="form-group">
                  <label>Yetkili Kişi *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Ad Soyad"
                    value={formData.contactPerson}
                    onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>E-posta Adresi *</label>
                  <input
                    type="email"
                    className="form-input"
                    placeholder="info@firma.com"
                    value={formData.email}
                    onChange={(e) => {
                      const val = e.target.value;
                      setFormData(prev => ({
                        ...prev,
                        email: val,
                        clientEmail: (!prev.clientEmail || prev.clientEmail === prev.email) ? val : prev.clientEmail
                      }));
                    }}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div className="form-group">
                  <label>Telefon Numarası *</label>
                  <input
                    type="tel"
                    className="form-input"
                    placeholder="+90 532 000 00 00"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value, whatsapp: formData.whatsapp || e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>WhatsApp İletişim Hattı</label>
                  <input
                    type="tel"
                    className="form-input"
                    placeholder="+90 532 000 00 00"
                    value={formData.whatsapp}
                    onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Dijital Kanallar ve Aracı Seçimi */}
            <div style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '14px' }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>
                2. Dijital Hesaplar & Aracı Bilgisi
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label>Web Sitesi</label>
                  <input
                    type="url"
                    className="form-input"
                    placeholder="https://firma.com"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Instagram</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="@kullaniciadi"
                    value={formData.instagram}
                    onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Facebook</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="fb.com/sayfa"
                    value={formData.facebook}
                    onChange={(e) => setFormData({ ...formData, facebook: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div className="form-group">
                  <label>Bağlı Olduğu Aracı / İş Ortağı *</label>
                  {currentUser.role === 'admin' ? (
                    <select
                      className="form-select"
                      value={formData.partnerId}
                      onChange={(e) => setFormData({ ...formData, partnerId: e.target.value })}
                    >
                      {data.users.filter(u => u.role === 'araci' || u.role === 'admin').map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.name} ({u.title})
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      className="form-input"
                      value={`${currentUser.name} (Siz)`}
                      disabled
                      style={{ background: 'var(--bg-app)', color: 'var(--text-main)', fontWeight: 600 }}
                    />
                  )}
                </div>

                <div className="form-group">
                  <label>Başlangıç Durumu</label>
                  <select
                    className="form-select"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    <option value="aktif">Aktif</option>
                    <option value="beklemede">Beklemede</option>
                    <option value="tamamlandi">Tamamlandı</option>
                    <option value="pasif">Pasif</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Proje Başlığı & Şablon Entegrasyonu */}
            <div style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '14px' }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>
                3. Proje Tanımı & Otomatik Görev Şablonu
              </div>

              <div className="form-group">
                <label>Proje Başlığı</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Örn: Instagram & Meta Yönetimi"
                  value={formData.projectTitle}
                  onChange={(e) => setFormData({ ...formData, projectTitle: e.target.value })}
                />
              </div>

              {/* Tek Tıkla Şablon Uygulama Kutusu */}
              <div style={{ backgroundColor: '#eff6ff', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid #bfdbfe' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <Sparkles size={18} color="var(--primary)" />
                  <strong style={{ fontSize: '0.88rem', color: '#1e40af' }}>
                    Otomatik Görev Paketi Yükle
                  </strong>
                </div>
                <p style={{ fontSize: '0.78rem', color: '#3b82f6', marginBottom: '10px' }}>
                  Müşteri açıldığı anda belirlenen görev dizisini otomatik oluşturur, tek tek görev yazmanıza gerek kalmaz.
                </p>
                <select
                  className="form-select"
                  value={formData.applyTemplateId}
                  onChange={(e) => handleTemplateChange(e.target.value)}
                >
                  <option value="">Şablon Uygulama (Boş Proje Aç)</option>
                  {data.templates.map(tmpl => (
                    <option key={tmpl.id} value={tmpl.id}>
                      ⚡ {tmpl.name} ({tmpl.taskItems.length} Görev)
                    </option>
                  ))}
                </select>

                {/* Şablona Bağlı Otomatik Onboarding & Yönetici Onay Bloğu */}
                {formData.applyTemplateId && onboardingData && (
                  <div
                    style={{
                      marginTop: '12px',
                      padding: '12px',
                      background: autoOnboardingEnabled ? '#ffffff' : '#f8fafc',
                      borderRadius: 'var(--radius-sm)',
                      border: autoOnboardingEnabled ? '1px solid #93c5fd' : '1px dashed #cbd5e1',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', flexWrap: 'wrap' }}>
                      <label style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', cursor: 'pointer', flex: 1 }}>
                        <input
                          type="checkbox"
                          checked={autoOnboardingEnabled}
                          onChange={(e) => setAutoOnboardingEnabled(e.target.checked)}
                          style={{ width: 17, height: 17, accentColor: 'var(--primary)', cursor: 'pointer', marginTop: '2px' }}
                        />
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                            <span style={{ fontSize: '0.84rem', fontWeight: 700, color: autoOnboardingEnabled ? '#1e40af' : 'var(--text-muted)' }}>
                              Başlangıç Bilgi & Evrak Taleplerini Müşteriye İlet (Onboarding)
                            </span>
                            {autoOnboardingEnabled && (
                              <span style={{ fontSize: '0.7rem', background: '#dbeafe', color: '#1e40af', padding: '1px 6px', borderRadius: '10px', fontWeight: 600 }}>
                                {onboardingData.items.length} Alan Belirlendi
                              </span>
                            )}
                          </div>
                          <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
                            Müşteri portala ilk girdiğinde işin başlaması için bu bilgileri sağlaması istenir.
                          </p>
                        </div>
                      </label>

                      {autoOnboardingEnabled && (
                        <button
                          type="button"
                          onClick={() => setIsOnboardingExpanded(!isOnboardingExpanded)}
                          className="btn btn-secondary"
                          style={{ padding: '4px 8px', fontSize: '0.72rem', height: 'auto', display: 'flex', alignItems: 'center', gap: '4px' }}
                        >
                          {isOnboardingExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                          <span>{isOnboardingExpanded ? 'Listeyi Gizle' : 'Talepleri İncele'}</span>
                        </button>
                      )}
                    </div>

                    {autoOnboardingEnabled && isOnboardingExpanded && (
                      <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                          <span style={{ fontSize: '0.74rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                            Talep Edilecek Bilgi & Belgeler ({onboardingData.items.length}):
                          </span>
                          <button
                            type="button"
                            onClick={handleAddItem}
                            style={{
                              fontSize: '0.72rem',
                              color: 'var(--primary)',
                              fontWeight: 600,
                              background: 'transparent',
                              border: 'none',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              cursor: 'pointer'
                            }}
                          >
                            <Plus size={13} />
                            <span>Yeni Talep Ekle</span>
                          </button>
                        </div>

                        {onboardingData.items.map((item, idx) => (
                          <div
                            key={idx}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                              background: '#f8fafc',
                              padding: '6px 8px',
                              borderRadius: '6px',
                              border: '1px solid #e2e8f0'
                            }}
                          >
                            <select
                              value={item.type}
                              onChange={(e) => handleItemTypeChange(idx, e.target.value)}
                              style={{
                                fontSize: '0.72rem',
                                padding: '4px 6px',
                                borderRadius: '4px',
                                border: '1px solid #cbd5e1',
                                background: item.type === 'password' ? '#fef2f2' : item.type === 'file' ? '#eff6ff' : '#ffffff',
                                color: item.type === 'password' ? '#991b1b' : item.type === 'file' ? '#1e40af' : '#334155',
                                fontWeight: 600,
                                flexShrink: 0
                              }}
                            >
                              <option value="text">✏️ Metin</option>
                              <option value="password">🔒 Şifre</option>
                              <option value="file">📎 Dosya</option>
                              <option value="note">📝 Not</option>
                            </select>

                            <input
                              type="text"
                              className="form-input"
                              value={item.label}
                              onChange={(e) => handleItemLabelChange(idx, e.target.value)}
                              placeholder="Talep edilecek bilgi veya belge adı..."
                              style={{ fontSize: '0.78rem', padding: '4px 8px', height: '28px', flex: 1 }}
                            />

                            <label
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '3px',
                                fontSize: '0.7rem',
                                color: item.required ? 'var(--danger)' : 'var(--text-muted)',
                                fontWeight: 600,
                                cursor: 'pointer',
                                flexShrink: 0
                              }}
                              title="Bu alan doldurulmadan onaylanamaz"
                            >
                              <input
                                type="checkbox"
                                checked={item.required}
                                onChange={(e) => handleItemRequiredChange(idx, e.target.checked)}
                                style={{ accentColor: 'var(--danger)' }}
                              />
                              <span>Zorunlu</span>
                            </label>

                            <button
                              type="button"
                              onClick={() => handleRemoveItem(idx)}
                              style={{
                                background: 'transparent',
                                border: 'none',
                                color: 'var(--text-muted)',
                                padding: '2px',
                                cursor: 'pointer',
                                flexShrink: 0
                              }}
                              title="Bu talebi kaldır"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="form-group" style={{ marginTop: '14px' }}>
                <label>Açıklama / Başlangıç Notu</label>
                <textarea
                  className="form-textarea"
                  rows={2}
                  placeholder="Müşteri ve hedefler hakkında kısa not..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
            </div>

            {/* 4. MÜŞTERİ PORTALI GİRİŞ HESABI & ŞİFRE BELİRLEME */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Key size={15} />
                  <span>4. Müşteri Portalı Giriş Hesabı & Şifre</span>
                </div>

                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-main)' }}>
                  <input
                    type="checkbox"
                    checked={formData.createPortalUser}
                    onChange={(e) => setFormData({ ...formData, createPortalUser: e.target.checked })}
                    style={{ width: 16, height: 16, accentColor: 'var(--primary)', cursor: 'pointer' }}
                  />
                  <span>Portal Giriş Hesabı Oluştur</span>
                </label>
              </div>

              {formData.createPortalUser ? (
                <div style={{ background: '#f8fafc', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label style={{ fontSize: '0.84rem', fontWeight: 600 }}>Giriş E-postası *</label>
                      <input
                        type="email"
                        className="form-input"
                        placeholder="musteri@firma.com"
                        value={formData.clientEmail || formData.email}
                        onChange={(e) => setFormData({ ...formData, clientEmail: e.target.value })}
                        required={formData.createPortalUser}
                      />
                    </div>

                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <label style={{ fontSize: '0.84rem', fontWeight: 600, marginBottom: 0 }}>Giriş Şifresi *</label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <button
                            type="button"
                            onClick={() => {
                              if (formData.clientPassword) {
                                navigator.clipboard?.writeText(formData.clientPassword);
                                setPasswordCopied(true);
                                setTimeout(() => setPasswordCopied(false), 1500);
                              }
                            }}
                            style={{ fontSize: '0.75rem', color: passwordCopied ? 'var(--success)' : 'var(--text-muted)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '3px' }}
                            title="Şifreyi panoya kopyala"
                          >
                            {passwordCopied ? <Check size={12} color="var(--success)" /> : <Copy size={12} />}
                            <span>{passwordCopied ? 'Kopyalandı!' : 'Kopyala'}</span>
                          </button>
                          <button
                            type="button"
                            onClick={generateRandomPassword}
                            style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}
                            title="Yeni rastgele güçlü şifre oluştur"
                          >
                            <RefreshCw size={12} />
                            <span>Rastgele Üret</span>
                          </button>
                        </div>
                      </div>
                      <div style={{ position: 'relative' }}>
                        <input
                          type={showPassword ? 'text' : 'password'}
                          className="form-input"
                          style={{ paddingRight: '38px', fontFamily: showPassword ? 'inherit' : 'monospace', fontWeight: 600 }}
                          placeholder="Şifre belirleyiniz"
                          value={formData.clientPassword}
                          onChange={(e) => setFormData({ ...formData, clientPassword: e.target.value })}
                          required={formData.createPortalUser}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
                          title={showPassword ? 'Şifreyi Gizle' : 'Şifreyi Göster'}
                        >
                          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', background: '#eff6ff', padding: '10px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid #bfdbfe', fontSize: '0.78rem', color: '#1e40af' }}>
                    <Lock size={15} style={{ flexShrink: 0, marginTop: '2px' }} />
                    <span>
                      Müşteriniz ana giriş ekranından bu e-posta ve şifre ile oturum açtığında doğrudan kendine özel <strong>Müşteri Portalı</strong>'na erişecektir. Bu şifreyi daha sonra Müşteri Detay sayfasından da görebilir veya güncelleyebilirsiniz.
                    </span>
                  </div>
                </div>
              ) : (
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic', padding: '6px 0' }}>
                  Portal giriş hesabı oluşturulmayacak. Müşteri daha sonra Müşteri Detay sayfasından da portala dahil edilebilir.
                </div>
              )}
            </div>

          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              İptal
            </button>
            <button type="submit" className="btn btn-primary">
              <Building2 size={16} />
              <span>Müşteriyi ve Projeyi Oluştur</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
