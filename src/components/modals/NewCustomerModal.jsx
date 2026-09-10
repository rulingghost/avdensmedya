import React, { useState } from 'react';
import { X, Building2, User, Phone, Mail, Globe, Instagram, Facebook, FileText, UserCheck, Sparkles } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function NewCustomerModal({ isOpen, onClose }) {
  const { data, addCustomer, setSelectedCustomerId, setActivePage, currentUser } = useApp();

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
    applyTemplateId: 'tmpl-sosyal-medya' // Varsayılan olarak şablon seçili
  });

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.companyName.trim()) {
      alert('Lütfen firma adını giriniz.');
      return;
    }

    const newCustomerId = addCustomer(formData, formData.applyTemplateId || null);
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
                1. Firma & İletişim Bilgileri (Madde 4)
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
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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
            <div>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>
                3. Proje Tanımı & Otomatik Görev Şablonu (Madde 24)
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
