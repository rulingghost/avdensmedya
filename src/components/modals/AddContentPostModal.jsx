import React, { useState, useRef } from 'react';
import {
  X,
  Calendar,
  Image as ImageIcon,
  Video,
  Instagram,
  Facebook,
  Linkedin,
  Share2,
  Sparkles,
  UploadCloud,
  CheckCircle2,
  Clock,
  Layers,
  Film
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function AddContentPostModal({ isOpen, onClose, editingPost = null, initialCustomerId = null }) {
  const {
    data,
    currentUser,
    getAccessibleCustomers,
    addContentPost,
    updateContentPost
  } = useApp();

  const accessibleCustomers = getAccessibleCustomers();
  const fileInputRef = useRef(null);
  const isMouseDownOnOverlay = useRef(false);

  // Form states
  const [customerId, setCustomerId] = useState(() => {
    if (editingPost) return editingPost.customerId;
    if (initialCustomerId) return initialCustomerId;
    if (currentUser.role === 'musteri') return currentUser.customerId || accessibleCustomers[0]?.id || '';
    return accessibleCustomers[0]?.id || '';
  });

  const [title, setTitle] = useState(editingPost?.title || '');
  const [caption, setCaption] = useState(editingPost?.caption || '');
  const [platform, setPlatform] = useState(editingPost?.platform || 'instagram');
  const [mediaType, setMediaType] = useState(editingPost?.mediaType || 'image');
  const [mediaUrl, setMediaUrl] = useState(editingPost?.mediaUrl || '');
  const [scheduledDate, setScheduledDate] = useState(() => {
    if (editingPost?.scheduledDate) {
      try {
        return new Date(editingPost.scheduledDate).toISOString().slice(0, 16);
      } catch (e) {}
    }
    const d = new Date();
    d.setDate(d.getDate() + 1);
    d.setHours(18, 0, 0, 0);
    return d.toISOString().slice(0, 16);
  });
  const [status, setStatus] = useState(editingPost?.status || 'onay_bekliyor');
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleOverlayMouseDown = (e) => {
    if (e.target === e.currentTarget) {
      isMouseDownOnOverlay.current = true;
    }
  };

  const handleOverlayMouseUp = (e) => {
    if (e.target === e.currentTarget && isMouseDownOnOverlay.current) {
      onClose();
    }
    isMouseDownOnOverlay.current = false;
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('Dosya boyutu 5 MB altında olmalıdır.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setMediaUrl(event.target.result);
      if (file.type.startsWith('video/')) {
        setMediaType('video');
      } else {
        setMediaType('image');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMessage('Lütfen içerik başlığı giriniz.');
      return;
    }
    if (!customerId) {
      setErrorMessage('Lütfen bir müşteri seçiniz.');
      return;
    }

    const postPayload = {
      customerId,
      title: title.trim(),
      caption: caption.trim(),
      platform,
      mediaType,
      mediaUrl: mediaUrl.trim(),
      scheduledDate: new Date(scheduledDate).toISOString(),
      status
    };

    if (editingPost) {
      updateContentPost(editingPost.id, postPayload);
    } else {
      addContentPost(postPayload);
    }

    onClose();
  };

  return (
    <div
      className="modal-overlay"
      onMouseDown={handleOverlayMouseDown}
      onMouseUp={handleOverlayMouseUp}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(5px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 50,
        padding: '16px'
      }}
    >
      <div
        className="card modal-card"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '620px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: 'var(--bg-card)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
          overflow: 'hidden'
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '18px 24px',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Instagram size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0 }}>
                {editingPost ? 'İçeriği Düzenle' : 'Yeni Sosyal Medya İçeriği Planla'}
              </h3>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Tarih, metin ve görsel belirleyin; müşterinin onayına sunun
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="btn-icon"
            style={{ color: 'var(--text-muted)' }}
            title="Kapat"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
          <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {errorMessage && (
              <div
                style={{
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--danger-light)',
                  color: 'var(--danger-text)',
                  fontSize: '0.84rem'
                }}
              >
                {errorMessage}
              </div>
            )}

            {/* Müşteri Seçimi (Sadece admin/aracı ise seçilebilir) */}
            {currentUser.role !== 'musteri' && (
              <div>
                <label className="form-label" style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                  Hedef Müşteri Firma *
                </label>
                <select
                  className="form-input"
                  value={customerId}
                  onChange={(e) => setCustomerId(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px' }}
                  required
                >
                  <option value="">Müşteri Seçiniz...</option>
                  {accessibleCustomers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.companyName} {c.contactPerson ? `(${c.contactPerson})` : ''}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Platform & İçerik Formatı Seçimi */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
              <div>
                <label className="form-label" style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                  Platform
                </label>
                <div style={{ display: 'flex', gap: '6px' }}>
                  {[
                    { id: 'instagram', label: 'Instagram', icon: Instagram, color: '#E1306C' },
                    { id: 'facebook', label: 'Facebook', icon: Facebook, color: '#1877F2' },
                    { id: 'linkedin', label: 'LinkedIn', icon: Linkedin, color: '#0A66C2' },
                    { id: 'tiktok', label: 'TikTok', icon: Share2, color: '#00F2FE' }
                  ].map((p) => {
                    const IconComp = p.icon;
                    const isSelected = platform === p.id;
                    return (
                      <button
                        type="button"
                        key={p.id}
                        onClick={() => setPlatform(p.id)}
                        className="btn"
                        style={{
                          flex: 1,
                          padding: '8px 4px',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          borderRadius: '8px',
                          border: `1.5px solid ${isSelected ? p.color : 'var(--border-subtle)'}`,
                          backgroundColor: isSelected ? `${p.color}15` : 'transparent',
                          color: isSelected ? p.color : 'var(--text-muted)'
                        }}
                      >
                        <IconComp size={16} />
                        <span>{p.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="form-label" style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                  Format Türü
                </label>
                <div style={{ display: 'flex', gap: '6px' }}>
                  {[
                    { id: 'image', label: 'Gönderi', icon: ImageIcon },
                    { id: 'reels', label: 'Reels', icon: Film },
                    { id: 'carousel', label: 'Karusel', icon: Layers },
                    { id: 'story', label: 'Hikaye', icon: Clock }
                  ].map((f) => {
                    const IconComp = f.icon;
                    const isSelected = mediaType === f.id;
                    return (
                      <button
                        type="button"
                        key={f.id}
                        onClick={() => setMediaType(f.id)}
                        className="btn"
                        style={{
                          flex: 1,
                          padding: '8px 4px',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          borderRadius: '8px',
                          border: `1.5px solid ${isSelected ? 'var(--primary)' : 'var(--border-subtle)'}`,
                          backgroundColor: isSelected ? 'var(--primary-light)' : 'transparent',
                          color: isSelected ? 'var(--primary)' : 'var(--text-muted)'
                        }}
                      >
                        <IconComp size={16} />
                        <span>{f.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* İçerik Başlığı */}
            <div>
              <label className="form-label" style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                İçerik Başlığı / Kampanya Konusu *
              </label>
              <input
                type="text"
                className="form-input"
                placeholder="Örn: Yeni Sezon İndirimi Reels Videosu"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                style={{ width: '100%', padding: '10px 12px' }}
                required
              />
            </div>

            {/* Görsel / Medya URL veya Yükleme */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                <label className="form-label" style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                  Medya / Tasarım Görseli
                </label>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--primary)',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <UploadCloud size={14} /> Dosya Yükle
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="image/*,video/*"
                  style={{ display: 'none' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Görsel veya Video URL'si (https://...)"
                  value={mediaUrl}
                  onChange={(e) => setMediaUrl(e.target.value)}
                  style={{ flex: 1, padding: '10px 12px' }}
                />
              </div>

              {/* Hızlı Örnek Görseller (Kolay Tasarım Testi) */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Hızlı Görsel Ekle:</span>
                {[
                  { label: 'Ürün', url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80' },
                  { label: 'Moda', url: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600&auto=format&fit=crop&q=80' },
                  { label: 'Kahve', url: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=600&auto=format&fit=crop&q=80' },
                  { label: 'Ofis', url: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=600&auto=format&fit=crop&q=80' },
                  { label: 'Yemek', url: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&auto=format&fit=crop&q=80' }
                ].map((sample, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setMediaUrl(sample.url)}
                    style={{
                      padding: '2px 8px',
                      fontSize: '0.7rem',
                      borderRadius: '4px',
                      background: 'var(--bg-app)',
                      border: '1px solid var(--border-subtle)',
                      color: 'var(--text-muted)',
                      cursor: 'pointer'
                    }}
                  >
                    {sample.label}
                  </button>
                ))}
              </div>

              {/* Önizleme */}
              {mediaUrl && (
                <div
                  style={{
                    marginTop: '10px',
                    position: 'relative',
                    width: '100%',
                    height: '140px',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    background: '#000',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <img
                    src={mediaUrl}
                    alt="Önizleme"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setMediaUrl('')}
                    style={{
                      position: 'absolute',
                      top: '8px',
                      right: '8px',
                      background: 'rgba(0,0,0,0.6)',
                      border: 'none',
                      color: '#fff',
                      borderRadius: '50%',
                      padding: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    <X size={14} />
                  </button>
                </div>
              )}
            </div>

            {/* Gönderi Metni (Caption & Canlı Sayaç) */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                <label className="form-label" style={{ fontSize: '0.85rem', fontWeight: 600, margin: 0 }}>
                  Gönderi Metni (Caption &amp; Hashtag'ler)
                </label>
                {caption && (
                  <button
                    type="button"
                    onClick={() => setCaption('')}
                    style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.72rem', cursor: 'pointer' }}
                  >
                    Temizle
                  </button>
                )}
              </div>
              <textarea
                className="form-input"
                rows={4}
                placeholder="Gönderinin altına yazılacak açıklama metni ve etiketler..."
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                style={{ width: '100%', padding: '10px 12px', resize: 'vertical' }}
              />

              {/* Canlı Karakter ve Hashtag Sayacı */}
              {(() => {
                const charCount = caption.length;
                const charLimit = 2200;
                const hashtags = (caption.match(/#[a-zA-Z0-9_çğıöşüÇĞİÖŞÜ]+/g) || []);
                const tagCount = hashtags.length;
                const tagLimit = 30;

                const isCharWarning = charCount > 2000;
                const isCharDanger = charCount > charLimit;
                const isTagWarning = tagCount > 25;
                const isTagDanger = tagCount > tagLimit;

                return (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', marginTop: '6px', fontSize: '0.78rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ color: isCharDanger ? 'var(--danger)' : isCharWarning ? '#d97706' : 'var(--text-muted)', fontWeight: isCharDanger || isCharWarning ? 700 : 500 }}>
                        Karakter: <strong>{charCount}</strong> / {charLimit}
                        {isCharDanger && ' (Limit Aşıldı!)'}
                      </span>
                      <span style={{ color: isTagDanger ? 'var(--danger)' : isTagWarning ? '#d97706' : 'var(--text-muted)', fontWeight: isTagDanger || isTagWarning ? 700 : 500 }}>
                        Etiket (#): <strong>{tagCount}</strong> / {tagLimit}
                        {isTagDanger && ' (Maks. 30 Etiket!)'}
                      </span>
                    </div>

                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        type="button"
                        onClick={() => setCaption(prev => (prev.trim() ? prev.trim() + '\n\n' : '') + '#keşfet #sosyalmedya #dijitalpazarlama #reels #trend')}
                        style={{ background: 'none', border: '1px solid var(--border-subtle)', borderRadius: '4px', padding: '2px 8px', fontSize: '0.72rem', color: 'var(--primary)', cursor: 'pointer' }}
                      >
                        + Trend Etiketler
                      </button>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Planlanan Yayın Tarihi & Durum */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
              <div>
                <label className="form-label" style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                  Planlanan Yayın Tarihi &amp; Saati
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="datetime-local"
                    className="form-input"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px' }}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="form-label" style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                  Başlangıç Durumu
                </label>
                <select
                  className="form-input"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px' }}
                >
                  <option value="onay_bekliyor">⏳ Müşteri Onayı Bekliyor</option>
                  <option value="taslak">📝 Taslak (Henüz Bildirilmedi)</option>
                  <option value="onaylandi">✅ Onaylandı (Yayına Hazır)</option>
                  <option value="yayinlandi">🚀 Yayınlandı</option>
                </select>
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div
            style={{
              padding: '16px 24px',
              borderTop: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: '10px',
              backgroundColor: 'var(--bg-app)'
            }}
          >
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Vazgeç
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              style={{
                background: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)',
                borderColor: 'transparent',
                fontWeight: 700
              }}
            >
              <Sparkles size={16} />
              <span>{editingPost ? 'Değişiklikleri Kaydet' : 'İçeriği Planla'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
