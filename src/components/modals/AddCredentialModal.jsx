import React, { useState, useEffect } from 'react';
import { X, Key, Shield, Plus, Trash2, Eye, EyeOff } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function AddCredentialModal({ isOpen, onClose, customerId, editingCredential = null }) {
  const { addCredential, updateCredential } = useApp();

  const [serviceType, setServiceType] = useState('Instagram');
  const [serviceName, setServiceName] = useState('');
  const [clientVisible, setClientVisible] = useState(false);
  const [revealedInputs, setRevealedInputs] = useState({});
  const [mouseDownOnOverlay, setMouseDownOnOverlay] = useState(false);
  const [fields, setFields] = useState([
    { key: 'Kullanıcı Adı', value: '', isSecret: false },
    { key: 'Şifre', value: '', isSecret: true }
  ]);

  useEffect(() => {
    if (editingCredential) {
      setServiceType(editingCredential.serviceType || 'Instagram');
      setServiceName(editingCredential.serviceName || '');
      setClientVisible(Boolean(editingCredential.clientVisible));
      let initialFields = (editingCredential.fields || []).map(f => {
        if (f.key && f.key.toLowerCase().trim() === 'omteklazer') {
          return { key: 'Kullanıcı Adı', value: 'omteklazer', isSecret: false };
        }
        return {
          key: f.key,
          value: f.value || '',
          isSecret: Boolean(f.isSecret)
        };
      });

      // Eğer omteklazer düzeltildiyse ve şifre alanı eksik/yanlışsa şifreyi ayarla
      const hasOmtek = (editingCredential.fields || []).some(f => f.key && f.key.toLowerCase().trim() === 'omteklazer');
      if (hasOmtek && !initialFields.some(f => f.key === 'Şifre' && f.value)) {
        initialFields = initialFields.filter(f => f.key !== 'Şifre');
        initialFields.push({ key: 'Şifre', value: 'Omtek028.', isSecret: true });
      }

      setFields(initialFields.length > 0 ? initialFields : [
        { key: 'Kullanıcı Adı', value: '', isSecret: false },
        { key: 'Şifre', value: '', isSecret: true }
      ]);
    } else {
      setServiceType('Instagram');
      setServiceName('Instagram İşletme Hesabı');
      setClientVisible(false);
      setFields([
        { key: 'Kullanıcı Adı', value: '', isSecret: false },
        { key: 'E-posta', value: '', isSecret: false },
        { key: 'Telefon', value: '', isSecret: false },
        { key: 'Şifre', value: '', isSecret: true },
        { key: 'Not', value: '', isSecret: false }
      ]);
    }
    setRevealedInputs({});
  }, [editingCredential, isOpen]);

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
    setFields([...fields, { key: 'Özel Alan', value: '', isSecret: false, isCustom: true }]);
  };

  const removeField = (index) => {
    setFields(fields.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validFields = fields.filter(f => f.key.trim() !== '');

    if (editingCredential) {
      updateCredential(editingCredential.id, {
        serviceType,
        serviceName: serviceName || serviceType,
        clientVisible,
        fields: validFields
      });
    } else {
      addCredential(customerId, {
        serviceType,
        serviceName: serviceName || serviceType,
        clientVisible,
        fields: validFields
      });
    }
    onClose();
  };

  return (
    <div
      className="modal-overlay"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) {
          setMouseDownOnOverlay(true);
        } else {
          setMouseDownOnOverlay(false);
        }
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && mouseDownOnOverlay) {
          onClose();
        }
        setMouseDownOnOverlay(false);
      }}
    >
      <div
        className="modal-content"
        style={{ maxWidth: '620px' }}
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Key size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>
                {editingCredential ? 'Hesap Bilgisini Düzenle' : 'Yeni Hesap Bilgisi Ekle'}
              </h3>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Kullanıcı adı, şifre ve bağlantı parametreleri
              </span>
            </div>
          </div>
          <button onClick={onClose} style={{ color: 'var(--text-muted)' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
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

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Hesap Başlığı</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Örn: Resmi Instagram Sayfası"
                  value={serviceName}
                  onChange={(e) => setServiceName(e.target.value)}
                />
              </div>
            </div>

            {/* Müşteri İzni Toggle'ı */}
            <div style={{ backgroundColor: 'var(--bg-app)', padding: '12px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '0.86rem', fontWeight: 600 }}>
                <input
                  type="checkbox"
                  checked={clientVisible}
                  onChange={(e) => setClientVisible(e.target.checked)}
                  style={{ width: 16, height: 16, accentColor: 'var(--primary)' }}
                />
                <span>👁️ Müşteri bu hesap bilgilerini kendi portalında görebilsin</span>
              </label>
              <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>
                İşaretlenmezse bilgiler sadece Admin ve Aracı ekibine özel kalır.
              </span>
            </div>

            {/* Giriş Bilgileri Alanları */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <div>
                  <span style={{ fontSize: '0.84rem', fontWeight: 800, color: 'var(--text-main)', display: 'block' }}>
                    Giriş & Parametre Alanları
                  </span>
                  <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                    Her alanın karşısına ilgili kullanıcı adı, şifre veya değeri yazınız.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={addCustomField}
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: '0.75rem', padding: '4px 8px' }}
                >
                  <Plus size={13} />
                  <span>+ Özel Alan Ekle</span>
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {fields.map((field, idx) => {
                  const isStandard = ['Kullanıcı Adı', 'Şifre', 'E-posta', 'Telefon', 'Sayfa URL', 'Admin URL', 'Business ID', 'Reklam Hesabı ID', 'Pixel ID', 'Hosting Firması', 'cPanel / Plesk URL', 'Not', 'Notlar'].includes(field.key);

                  return (
                    <div
                      key={idx}
                      style={{
                        background: '#f8fafc',
                        border: '1px solid var(--border-color)',
                        borderRadius: 'var(--radius-md)',
                        padding: '10px 14px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '6px'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        {/* Alan Etiketi */}
                        {isStandard && !field.isCustom ? (
                          <span style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-main)' }}>
                            {field.key === 'Şifre' ? '🔑 Şifre' :
                             field.key === 'Kullanıcı Adı' ? '👤 Kullanıcı Adı' :
                             field.key === 'E-posta' ? '📧 E-posta' :
                             field.key === 'Telefon' ? '📞 Telefon' : field.key}:
                          </span>
                        ) : (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)', fontWeight: 600 }}>Alan Adı:</span>
                            <input
                              type="text"
                              className="form-input"
                              style={{ padding: '2px 8px', fontSize: '0.82rem', width: '150px', height: '28px', fontWeight: 600 }}
                              value={field.key}
                              onChange={(e) => handleFieldChange(idx, 'key', e.target.value)}
                              placeholder="Örn: Port, PIN, Not"
                            />
                          </div>
                        )}

                        {/* Sağ Seçenekler */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.74rem', color: 'var(--text-muted)', cursor: 'pointer' }} title="Şifre olarak maskelensin mi?">
                            <input
                              type="checkbox"
                              checked={field.isSecret}
                              onChange={(e) => handleFieldChange(idx, 'isSecret', e.target.checked)}
                            />
                            <span>Şifre Olarak Gizle (••••)</span>
                          </label>

                          {fields.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeField(idx)}
                              style={{ color: 'var(--danger)', padding: '2px' }}
                              title="Bu Alanı Kaldır"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Değer Giriş Kutusu */}
                      <div style={{ position: 'relative' }}>
                        <input
                          type={field.isSecret && !revealedInputs[idx] ? 'password' : 'text'}
                          className="form-input"
                          style={{
                            paddingRight: field.isSecret ? '36px' : '12px',
                            fontFamily: field.isSecret && !revealedInputs[idx] ? 'monospace' : 'inherit',
                            fontWeight: 600
                          }}
                          placeholder={`${field.key} bilgisini buraya giriniz...`}
                          value={field.value}
                          onChange={(e) => handleFieldChange(idx, 'value', e.target.value)}
                        />

                        {field.isSecret && (
                          <button
                            type="button"
                            onClick={() => setRevealedInputs(prev => ({ ...prev, [idx]: !prev[idx] }))}
                            style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', padding: '2px' }}
                            title={revealedInputs[idx] ? 'Şifreyi Gizle' : 'Şifreyi Göster'}
                          >
                            {revealedInputs[idx] ? <EyeOff size={15} /> : <Eye size={15} />}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              İptal
            </button>
            <button type="submit" className="btn btn-primary">
              {editingCredential ? 'Değişiklikleri Güncelle' : 'Kasaya Kaydet'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
