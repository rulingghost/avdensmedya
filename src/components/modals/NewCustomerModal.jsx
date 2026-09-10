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
  Key
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function NewCustomerModal({ isOpen, onClose }) {
  const { data, addCustomer, setSelectedCustomerId, setActivePage, currentUser } = useApp();

  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    companyName: '',
    contactPerson: '',
    phone: '',
    whatsapp: '',
    email: '',
    website: '',
    instagram: '',
    facebook: '',
    partnerId: currentUser?.role === 'araci' ? currentUser.id : 'user-araci',
    status: 'aktif',
    projectTitle: 'Dijital Pazarlama & Sosyal Medya Yönetimi',
    description: '',
    applyTemplateId: 'tmpl-sosyal-medya', // Varsayılan olarak şablon seçili
    createPortalUser: true,
    clientEmail: '',
    clientPassword: 'Avdens2026!'
  });

  if (!isOpen) return null;

  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$';
    let res = '';
    for (let i = 0; i < 9; i++) {
      res += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData(prev => ({ ...prev, clientPassword: res }));
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

    const newCustomerId = addCustomer(payload, formData.applyTemplateId || null);
    onClose();

    // Kullanıcıyı yeni müşterinin detayına götür
    if (newCustomerId) {
      setSelectedCustomerId(newCustomerId);
      setActivePage('customer-detail');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '680px' }} onClick={(e) => e.stopPropagation()}>
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
                  onChange={(e) => setFormData({ ...formData, applyTemplateId: e.target.value })}
                >
                  <option value="">Şablon Uygulama (Boş Proje Aç)</option>
                  {data.templates.map(tmpl => (
                    <option key={tmpl.id} value={tmpl.id}>
                      ⚡ {tmpl.name} ({tmpl.taskItems.length} Görev)
                    </option>
                  ))}
                </select>
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
