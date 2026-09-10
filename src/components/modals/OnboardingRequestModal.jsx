import React, { useState } from 'react';
import { X, Send, Plus, Trash2, FileCheck, Sparkles, Shield, AlertCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function OnboardingRequestModal({ isOpen, onClose, customerId }) {
  const { data, createOnboardingRequest, getAccessibleCustomers } = useApp();

  const accessibleCustomers = getAccessibleCustomers();
  const [selectedCustId, setSelectedCustId] = useState(customerId || accessibleCustomers[0]?.id || '');
  const customer = accessibleCustomers.find(c => c.id === selectedCustId) || accessibleCustomers[0] || null;

  const [title, setTitle] = useState('Projeye Başlamak İçin Gerekli Bilgi ve Belgeler');
  const [description, setDescription] = useState('İşlerin başlaması için lütfen aşağıdaki kurumsal logo, şifre ve iletişim detaylarını doldurunuz.');
  const [items, setItems] = useState([
    { label: 'Vektörel Logo Dosyası (SVG / AI / PDF)', type: 'file', required: true },
    { label: 'Instagram Giriş Şifresi', type: 'password', required: true },
    { label: 'WhatsApp İletişim Numarası & Onay Yetkilisi', type: 'text', required: true },
    { label: 'Kurumsal Renk ve Tasarım Tercihleri', type: 'note', required: false }
  ]);
  const [mouseDownOnOverlay, setMouseDownOnOverlay] = useState(false);

  if (!isOpen) return null;

  // Paket seçimi
  const handlePresetSelect = (presetKey) => {
    if (presetKey === 'social') {
      setTitle('Sosyal Medya & Meta Yönetimi Başlangıç Talepleri');
      setItems([
        { label: 'Vektörel Logo Dosyası (SVG / AI / PDF)', type: 'file', required: true },
        { label: 'Instagram Giriş Şifresi', type: 'password', required: true },
        { label: 'Facebook Sayfası Yönetici İzni / Linki', type: 'text', required: true },
        { label: 'WhatsApp İletişim Numarası', type: 'text', required: true },
        { label: 'Öne Çıkmasını İstediğiniz Ürün ve Hizmetler', type: 'note', required: false }
      ]);
    } else if (presetKey === 'ecommerce') {
      setTitle('E-Ticaret & Google Reklam Başlangıç Talepleri');
      setItems([
        { label: 'Web Sitesi Admin Panel Giriş Şifresi', type: 'password', required: true },
        { label: 'Yüksek Çözünürlüklü Ürün Fotoğrafları', type: 'file', required: true },
        { label: 'Fiyat ve Stok Tablosu (Excel / PDF)', type: 'file', required: true },
        { label: 'Kargo ve İade Politikası Notları', type: 'note', required: false }
      ]);
    } else if (presetKey === 'branding') {
      setTitle('Kurumsal Kimlik & Marka Bilgi Talepleri');
      setItems([
        { label: 'Logo Vektörel Çizimi veya Yüksek Çözünürlüklü PNG', type: 'file', required: true },
        { label: 'Kurumsal Renk Kodları (Hex / Pantone)', type: 'text', required: true },
        { label: 'Şirket Sloganı ve Misyon Metni', type: 'note', required: false },
        { label: 'Yetkili İletişim Bilgileri', type: 'text', required: true }
      ]);
    } else if (presetKey === 'seo') {
      setTitle('SEO & Google Haritalar Başlangıç Talepleri');
      setItems([
        { label: 'Google Business / Harita E-posta Adresi', type: 'text', required: true },
        { label: 'Web Sitesi Search Console / Analytics İzni', type: 'text', required: true },
        { label: 'İşletme Adresi, Telefon ve Çalışma Saatleri', type: 'note', required: true },
        { label: 'Öne Çıkarılacak Anahtar Kelimeler ve Hizmet Bölgeleri', type: 'note', required: false }
      ]);
    } else if (presetKey === 'full') {
      setTitle('360° Dijital Pazarlama & Dönüşüm Başlangıç Talepleri');
      setItems([
        { label: 'Vektörel Logo ve Kurumsal Kimlik Dosyaları', type: 'file', required: true },
        { label: 'Instagram & Facebook Şifre / Yönetici Erişimi', type: 'password', required: true },
        { label: 'Web Sitesi Panel / FTP Giriş Bilgileri', type: 'password', required: true },
        { label: 'WhatsApp & Müşteri İletişim Hattı Numarası', type: 'text', required: true },
        { label: 'Hedef Kitle, Kampanya Bütçesi ve Beklentiler', type: 'note', required: false }
      ]);
    }
  };

  const handleItemChange = (index, field, value) => {
    const updated = [...items];
    updated[index][field] = value;
    setItems(updated);
  };

  const addItem = () => {
    setItems([...items, { label: '', type: 'text', required: true }]);
  };

  const removeItem = (index) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validItems = items.filter(it => it.label.trim() !== '');
    if (validItems.length === 0) {
      alert('Lütfen en az bir adet bilgi alanı ekleyiniz.');
      return;
    }

    const targetId = customer?.id || selectedCustId;
    if (!targetId) {
      alert('Lütfen bir müşteri seçiniz.');
      return;
    }

    createOnboardingRequest(targetId, title, description, validItems);
    onClose();
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
        style={{ maxWidth: '640px' }}
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileCheck size={20} color="var(--primary)" />
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Müşteriden Bilgi & Belge Talep Et</h3>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                İşi başlatmak için müşteriden kurumsal logo, şifre ve bilgileri isteyin
              </span>
            </div>
          </div>
          <button onClick={onClose} style={{ color: 'var(--text-muted)' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

            {/* Müşteri Seçimi */}
            <div className="form-group">
              <label>Hedef Müşteri *</label>
              <select
                className="form-select"
                value={selectedCustId}
                onChange={(e) => setSelectedCustId(e.target.value)}
                required
              >
                {accessibleCustomers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.companyName} ({c.projectTitle || 'Proje'})
                  </option>
                ))}
              </select>
            </div>

            {/* Hazır Paket Seçimi */}
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap', background: 'var(--bg-app)', padding: '10px 14px', borderRadius: 'var(--radius-md)' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', width: '100%', marginBottom: '2px' }}>
                ⚡ Hazır Başlangıç Şablonları:
              </span>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => handlePresetSelect('social')}
                style={{ fontSize: '0.74rem', padding: '4px 10px' }}
              >
                📱 Sosyal Medya
              </button>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => handlePresetSelect('ecommerce')}
                style={{ fontSize: '0.74rem', padding: '4px 10px' }}
              >
                🛒 E-Ticaret
              </button>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => handlePresetSelect('seo')}
                style={{ fontSize: '0.74rem', padding: '4px 10px' }}
              >
                🔍 SEO & Harita
              </button>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => handlePresetSelect('branding')}
                style={{ fontSize: '0.74rem', padding: '4px 10px' }}
              >
                🎨 Kurumsal Kimlik
              </button>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => handlePresetSelect('full')}
                style={{ fontSize: '0.74rem', padding: '4px 10px', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', fontWeight: 700 }}
              >
                🚀 360° Full Paket
              </button>
            </div>

            <div className="form-group">
              <label>Talep Başlığı *</label>
              <input
                type="text"
                className="form-input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Açıklama / Müşteriye Not</label>
              <textarea
                className="form-textarea"
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            {/* Talep Edilen Alanlar */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)' }}>
                  Müşterinin Doldurması Gereken Alanlar ({items.length})
                </span>
                <button
                  type="button"
                  onClick={addItem}
                  style={{ fontSize: '0.78rem', color: 'var(--primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  <Plus size={14} />
                  <span>Alan Ekle</span>
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '260px', overflowY: 'auto', paddingRight: '4px' }}>
                {items.map((it, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: '8px', alignItems: 'center', background: 'var(--bg-app)', padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                    <input
                      type="text"
                      className="form-input"
                      style={{ flex: 1, padding: '6px 10px', fontSize: '0.84rem' }}
                      placeholder="Talep edilen veri/belge adı (Örn: Instagram Şifresi)"
                      value={it.label}
                      onChange={(e) => handleItemChange(idx, 'label', e.target.value)}
                      required
                    />

                    <select
                      className="form-select"
                      style={{ width: '130px', padding: '6px 8px', fontSize: '0.78rem' }}
                      value={it.type}
                      onChange={(e) => handleItemChange(idx, 'type', e.target.value)}
                    >
                      <option value="text">Metin / Yazı</option>
                      <option value="password">Gizli Şifre 🔑</option>
                      <option value="file">Dosya / Logo 📁</option>
                      <option value="note">Geniş Not 📝</option>
                    </select>

                    <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.72rem', color: 'var(--text-muted)', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                      <input
                        type="checkbox"
                        checked={it.required}
                        onChange={(e) => handleItemChange(idx, 'required', e.target.checked)}
                      />
                      <span>Zorunlu</span>
                    </label>

                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeItem(idx)}
                        style={{ color: 'var(--danger)', padding: '4px' }}
                        title="Bu alanı sil"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 'var(--radius-md)', padding: '12px', fontSize: '0.78rem', color: '#1e40af', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={16} />
              <span>
                Talep gönderildiğinde müşterinin ekranında <strong>"İşe Başlamak İçin Gerekli Bilgileri Doldurun"</strong> bildirimi ve formu açılacaktır.
              </span>
            </div>

          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              İptal
            </button>
            <button type="submit" className="btn btn-primary">
              <Send size={15} />
              <span>Talebi Müşteriye Gönder</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
