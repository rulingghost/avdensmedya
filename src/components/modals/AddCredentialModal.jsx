import React, { useState } from 'react';
import { X, Key, Shield, Plus, Trash2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function AddCredentialModal({ isOpen, onClose, customerId }) {
  const { addCredential } = useApp();

  const [serviceType, setServiceType] = useState('Instagram');
  const [serviceName, setServiceName] = useState('');
  const [clientVisible, setClientVisible] = useState(false);
  const [fields, setFields] = useState([
    { key: 'Kullanıcı Adı', value: '', isSecret: false },
    { key: 'Şifre', value: '', isSecret: true }
  ]);

  if (!isOpen) return null;

  // Servis tipine göre varsayılan alanlar
  const handleServiceChange = (type) => {
    setServiceType(type);
    if (type === 'Instagram') {
      setServiceName('Instagram İşletme Hesabı');
      setFields([
        { key: 'Kullanıcı Adı', value: '', isSecret: false },
        { key: 'E-posta', value: '', isSecret: false },
        { key: 'Telefon', value: '', isSecret: false },
        { key: 'Şifre', value: '', isSecret: true },
        { key: 'Not', value: '', isSecret: false }
      ]);
    } else if (type === 'Facebook') {
      setServiceName('Facebook Sayfası');
      setFields([
        { key: 'E-posta', value: '', isSecret: false },
        { key: 'Şifre', value: '', isSecret: true },
        { key: 'Sayfa URL', value: '', isSecret: false }
      ]);
    } else if (type === 'Meta Business') {
      setServiceName('Meta Business Suite');
      setFields([
        { key: 'Business ID', value: '', isSecret: false },
        { key: 'Reklam Hesabı ID', value: '', isSecret: false },
        { key: 'Pixel ID', value: '', isSecret: false },
        { key: 'E-posta', value: '', isSecret: false },
        { key: 'Notlar', value: '', isSecret: false }
      ]);
    } else if (type === 'Web Sitesi') {
      setServiceName('WordPress Admin Paneli');
      setFields([
        { key: 'Admin URL', value: 'https://', isSecret: false },
        { key: 'Kullanıcı Adı', value: '', isSecret: false },
        { key: 'Şifre', value: '', isSecret: true }
      ]);
    } else if (type === 'Hosting') {
      setServiceName('Hosting / cPanel');
      setFields([
        { key: 'Hosting Firması', value: '', isSecret: false },
        { key: 'cPanel / Plesk URL', value: 'https://', isSecret: false },
        { key: 'Kullanıcı Adı', value: '', isSecret: false },
        { key: 'Şifre', value: '', isSecret: true }
      ]);
    } else {
      setServiceName(type);
      setFields([
        { key: 'Kullanıcı Adı / E-posta', value: '', isSecret: false },
        { key: 'Şifre', value: '', isSecret: true }
      ]);
    }
  };

  const handleFieldChange = (index, fieldKey, val) => {
    const updated = [...fields];
    updated[index][fieldKey] = val;
    setFields(updated);
  };

  const addCustomField = () => {
    setFields([...fields, { key: 'Yeni Alan', value: '', isSecret: false }]);
  };

  const removeField = (index) => {
    setFields(fields.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    addCredential(customerId, {
      serviceType,
      serviceName: serviceName || serviceType,
      clientVisible,
      fields
    });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '580px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Key size={20} color="var(--primary)" />
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Yeni Hesap Bilgisi Ekle</h3>
          </div>
          <button onClick={onClose} style={{ color: 'var(--text-muted)' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

            <div className="form-group">
              <label>Hizmet / Hesap Türü *</label>
              <select
                className="form-select"
                value={serviceType}
                onChange={(e) => handleServiceChange(e.target.value)}
              >
                <option value="Instagram">Instagram</option>
                <option value="Facebook">Facebook</option>
                <option value="Meta Business">Meta Business Suite</option>
                <option value="Web Sitesi">Web Sitesi / WordPress</option>
                <option value="Hosting">Hosting / Sunucu</option>
                <option value="Google Ads">Google Ads</option>
                <option value="TikTok">TikTok</option>
                <option value="YouTube">YouTube</option>
                <option value="Canva">Canva</option>
                <option value="Domain">Domain / DNS</option>
                <option value="Özel Servis">Diğer (Özel Hesap)</option>
              </select>
            </div>

            <div className="form-group">
              <label>Hesap Başlığı</label>
              <input
                type="text"
                className="form-input"
                placeholder="Örn: Resmi Instagram Sayfası"
                value={serviceName}
                onChange={(e) => setServiceName(e.target.value)}
              />
            </div>

            {/* Müşteri İzni Toggle'ı (Madde 12) */}
            <div style={{ backgroundColor: 'var(--bg-app)', padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '0.86rem', fontWeight: 600 }}>
                <input
                  type="checkbox"
                  checked={clientVisible}
                  onChange={(e) => setClientVisible(e.target.checked)}
                />
                <span>👁️ Müşteri bu hesap bilgilerini görebilsin</span>
              </label>
              <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>
                İşaretlenmezse sadece Admin ve Aracı tarafından görüntülenebilir.
              </span>
            </div>

            {/* Dinamik Alanlar */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)' }}>
                  Giriş & Parametre Alanları (Şifreler gizli saklanır)
                </span>
                <button
                  type="button"
                  onClick={addCustomField}
                  style={{ fontSize: '0.76rem', color: 'var(--primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  <Plus size={14} />
                  <span>Alan Ekle</span>
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {fields.map((field, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <input
                      type="text"
                      className="form-input"
                      style={{ width: '38%' }}
                      placeholder="Alan Adı"
                      value={field.key}
                      onChange={(e) => handleFieldChange(idx, 'key', e.target.value)}
                    />
                    <input
                      type="text"
                      className="form-input"
                      style={{ flex: 1 }}
                      placeholder="Değer / Şifre"
                      value={field.value}
                      onChange={(e) => handleFieldChange(idx, 'value', e.target.value)}
                    />
                    <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.72rem', color: 'var(--text-muted)', cursor: 'pointer' }} title="Şifre olarak gizlensin mi?">
                      <input
                        type="checkbox"
                        checked={field.isSecret}
                        onChange={(e) => handleFieldChange(idx, 'isSecret', e.target.checked)}
                      />
                      <span>Gizli</span>
                    </label>
                    {fields.length > 1 && (
                      <button type="button" onClick={() => removeField(idx)} style={{ color: 'var(--danger)', padding: '4px' }}>
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              İptal
            </button>
            <button type="submit" className="btn btn-primary">
              Kasaya Kaydet
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
