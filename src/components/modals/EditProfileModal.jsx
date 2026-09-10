import React, { useState, useEffect, useRef } from 'react';
import { X, User, Mail, Phone, Lock, Check, Upload, Link2, Camera, Loader2, RotateCcw } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function EditProfileModal({ isOpen, onClose }) {
  const { currentUser, updateUserProfile } = useApp();

  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    title: '',
    password: '',
    avatar: ''
  });

  const [avatarTab, setAvatarTab] = useState('preset'); // 'preset' | 'upload' | 'url'
  const [urlInput, setUrlInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [mouseDownOnOverlay, setMouseDownOnOverlay] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setFormData({
        name: currentUser.name || '',
        email: currentUser.email || '',
        phone: currentUser.phone || '',
        title: currentUser.title || '',
        password: currentUser.password || '123',
        avatar: currentUser.avatar || ''
      });
      setUrlInput(currentUser.avatar && currentUser.avatar.startsWith('http') ? currentUser.avatar : '');
      setSavedSuccess(false);
      setIsSaving(false);
    }
  }, [currentUser, isOpen]);

  if (!isOpen) return null;

  // Dosyadan resim yükleme ve merkezden kırparak hafif boyuta küçültme (180x180 px)
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Lütfen geçerli bir görsel dosyası seçiniz (PNG, JPG, WebP vb.).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const size = 180;
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');

        // Merkezden kare kırpma
        const minSide = Math.min(img.width, img.height);
        const startX = (img.width - minSide) / 2;
        const startY = (img.height - minSide) / 2;

        ctx.drawImage(img, startX, startY, minSide, minSide, 0, 0, size, size);
        const compactDataUrl = canvas.toDataURL('image/jpeg', 0.88);
        setFormData(prev => ({ ...prev, avatar: compactDataUrl }));
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleApplyUrl = () => {
    if (urlInput.trim()) {
      setFormData(prev => ({ ...prev, avatar: urlInput.trim() }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim()) {
      alert('Lütfen isim ve e-posta alanlarını doldurunuz.');
      return;
    }

    setIsSaving(true);
    await updateUserProfile(formData);
    setIsSaving(false);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  const sampleAvatars = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80'
  ];

  const defaultPlaceholder = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150';

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
        style={{ maxWidth: '560px' }}
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
              <User size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Profili Düzenle</h3>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                {currentUser.role === 'admin' ? 'Yönetici Hesabı' : currentUser.role === 'araci' ? 'İş Ortağı / Aracı' : 'Müşteri Hesabı'}
              </span>
            </div>
          </div>
          <button onClick={onClose} style={{ color: 'var(--text-muted)' }}>
            <X size={20} />
          </button>
        </div>

        {savedSuccess ? (
          <div style={{ padding: '40px 20px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: 50, height: 50, borderRadius: '50%', background: 'var(--success-light)', color: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Check size={28} strokeWidth={3} />
            </div>
            <h4 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)' }}>Profil Başarıyla Güncellendi!</h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Profil fotoğrafı ve bilgileriniz veritabanına kalıcı olarak kaydedildi.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>

              {/* Avatar Yönetim Bölümü */}
              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ position: 'relative', width: 68, height: 68, flexShrink: 0 }}>
                    <img
                      src={formData.avatar || defaultPlaceholder}
                      alt="Profil Fotoğrafı"
                      style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--primary)', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
                      onError={(e) => {
                        e.target.src = defaultPlaceholder;
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      style={{
                        position: 'absolute',
                        bottom: 0,
                        right: 0,
                        width: 24,
                        height: 24,
                        borderRadius: '50%',
                        background: 'var(--primary)',
                        color: '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                        cursor: 'pointer'
                      }}
                      title="Cihazdan fotoğraf seç"
                    >
                      <Camera size={13} />
                    </button>
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)' }}>
                      Profil Fotoğrafı
                    </div>
                    <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: '2px', marginBottom: '8px' }}>
                      Kendi fotoğrafınızı yükleyebilir veya hazır avatarlardan birini seçebilirsiniz.
                    </p>

                    {/* Sekmeler */}
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      <button
                        type="button"
                        className={`btn btn-sm ${avatarTab === 'preset' ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => setAvatarTab('preset')}
                        style={{ fontSize: '0.74rem', padding: '4px 8px' }}
                      >
                        Hazır Avatarlar
                      </button>
                      <button
                        type="button"
                        className={`btn btn-sm ${avatarTab === 'upload' ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => {
                          setAvatarTab('upload');
                          fileInputRef.current?.click();
                        }}
                        style={{ fontSize: '0.74rem', padding: '4px 8px' }}
                      >
                        <Upload size={12} />
                        <span>Fotoğraf Yükle</span>
                      </button>
                      <button
                        type="button"
                        className={`btn btn-sm ${avatarTab === 'url' ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => setAvatarTab('url')}
                        style={{ fontSize: '0.74rem', padding: '4px 8px' }}
                      >
                        <Link2 size={12} />
                        <span>URL Gir</span>
                      </button>
                      {formData.avatar && (
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={() => setFormData(prev => ({ ...prev, avatar: defaultPlaceholder }))}
                          style={{ fontSize: '0.74rem', padding: '4px 8px', color: 'var(--text-muted)' }}
                          title="Varsayılan fotoğrafa dön"
                        >
                          <RotateCcw size={12} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Gizli Dosya Girişi */}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="image/*"
                  style={{ display: 'none' }}
                />

                {/* Hazır Avatarlar Listesi */}
                {avatarTab === 'preset' && (
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', paddingTop: '4px' }}>
                    {sampleAvatars.map((avUrl, idx) => (
                      <div
                        key={idx}
                        onClick={() => setFormData(prev => ({ ...prev, avatar: avUrl }))}
                        style={{
                          position: 'relative',
                          width: 38,
                          height: 38,
                          borderRadius: '50%',
                          cursor: 'pointer',
                          padding: '2px',
                          border: formData.avatar === avUrl ? '2px solid var(--primary)' : '2px solid transparent',
                          transition: 'all 0.15s'
                        }}
                      >
                        <img
                          src={avUrl}
                          alt={`Avatar ${idx + 1}`}
                          style={{
                            width: '100%',
                            height: '100%',
                            borderRadius: '50%',
                            objectFit: 'cover'
                          }}
                        />
                        {formData.avatar === avUrl && (
                          <div style={{
                            position: 'absolute',
                            bottom: -2,
                            right: -2,
                            width: 14,
                            height: 14,
                            borderRadius: '50%',
                            background: 'var(--primary)',
                            color: '#ffffff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            <Check size={9} strokeWidth={3} />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* URL Giriş Alanı */}
                {avatarTab === 'url' && (
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <input
                      type="url"
                      className="form-input"
                      placeholder="https://örnek.com/fotograf.jpg"
                      value={urlInput}
                      onChange={(e) => setUrlInput(e.target.value)}
                      style={{ fontSize: '0.82rem', padding: '6px 10px' }}
                    />
                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      onClick={handleApplyUrl}
                      style={{ fontSize: '0.78rem', whiteSpace: 'nowrap' }}
                    >
                      Uygula
                    </button>
                  </div>
                )}
              </div>

              {/* Kullanıcı Bilgileri */}
              <div className="form-group">
                <label>Ad Soyad *</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label>E-posta Adresi *</label>
                  <input
                    type="email"
                    className="form-input"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Telefon Numarası</label>
                  <input
                    type="tel"
                    className="form-input"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+90 5XX XXX XX XX"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label>Ünvan / Görev</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Örn: Ajans Yöneticisi"
                  />
                </div>

                <div className="form-group">
                  <label>Giriş Şifresi</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Şifre belirleyin"
                  />
                </div>
              </div>

            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onClose} disabled={isSaving}>
                İptal
              </button>
              <button type="submit" className="btn btn-primary" disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 size={16} className="spin" />
                    <span>Kaydediliyor...</span>
                  </>
                ) : (
                  <>
                    <Check size={16} />
                    <span>Değişiklikleri Kaydet</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
