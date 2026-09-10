import React, { useState, useEffect } from 'react';
import { X, User, Mail, Phone, Lock, Image, Check, Sparkles } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function EditProfileModal({ isOpen, onClose }) {
  const { currentUser, updateUserProfile } = useApp();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    title: '',
    password: '',
    avatar: ''
  });

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
      setSavedSuccess(false);
    }
  }, [currentUser, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim()) {
      alert('Lütfen isim ve e-posta alanlarını doldurunuz.');
      return;
    }

    updateUserProfile(formData);
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
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80'
  ];

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
        style={{ maxWidth: '520px' }}
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
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Değişiklikler anında sisteme uygulandı.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

              {/* Avatar Önizleme & Hızlı Seçim */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', background: 'var(--bg-app)', padding: '14px', borderRadius: 'var(--radius-md)' }}>
                <img
                  src={formData.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                  alt="Avatar"
                  style={{ width: 56, height: 56, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--primary)' }}
                />
                <div style={{ flex: 1 }}>
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-main)', display: 'block', marginBottom: '6px' }}>
                    Profil Fotoğrafı Seçin veya URL Girin:
                  </span>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {sampleAvatars.map((avUrl, idx) => (
                      <img
                        key={idx}
                        src={avUrl}
                        alt="Örnek"
                        onClick={() => setFormData({ ...formData, avatar: avUrl })}
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: '50%',
                          objectFit: 'cover',
                          cursor: 'pointer',
                          border: formData.avatar === avUrl ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                          transform: formData.avatar === avUrl ? 'scale(1.1)' : 'scale(1)'
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>

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
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                İptal
              </button>
              <button type="submit" className="btn btn-primary">
                <Check size={16} />
                <span>Değişiklikleri Kaydet</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
