import React, { useState, useRef } from 'react';
import {
  Instagram,
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Clock,
  Film,
  Layers,
  Sparkles,
  Check,
  Edit3,
  X,
  Plus,
  Trash2,
  Download,
  Copy,
  ExternalLink
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function InstagramGridPreview({ customer, posts = [], onOpenAddModal }) {
  const { currentUser, approveContentPost, rejectContentPost, deleteContentPost } = useApp();

  const [selectedPost, setSelectedPost] = useState(null);
  const [revisionNote, setRevisionNote] = useState('');
  const [isRevisionMode, setIsRevisionMode] = useState(false);
  const [copiedCaption, setCopiedCaption] = useState(false);
  const isMouseDownOnOverlay = useRef(false);

  const isClient = currentUser.role === 'musteri';

  // Instagram kullanıcı adı
  const instagramHandle = customer?.instagram 
    ? (customer.instagram.startsWith('@') ? customer.instagram : `@${customer.instagram}`)
    : `@${(customer?.companyName || 'markaniz').toLowerCase().replace(/\s+/g, '')}`;

  const profileName = customer?.companyName || 'Marka Adı';
  const profileBio = customer?.projectTitle || customer?.description || 'Dijital varlığınızı büyütüyoruz. Profesyonel içerik üretimi ve sosyal medya yönetimi.';
  const website = customer?.website || 'https://avdens.work';

  // Gönderileri sırala (en yeni/yakın tarihliler önce)
  const sortedPosts = [...posts].sort((a, b) => new Date(b.scheduledDate || 0) - new Date(a.scheduledDate || 0));

  const handleApprove = (post) => {
    approveContentPost(post.id);
    setSelectedPost(prev => prev ? { ...prev, status: 'onaylandi' } : null);
  };

  const handleReject = (post) => {
    if (!revisionNote.trim()) {
      alert('Lütfen revize gerekçenizi veya istediğiniz değişiklikleri belirtiniz.');
      return;
    }
    rejectContentPost(post.id, revisionNote.trim());
    setSelectedPost(prev => prev ? { ...prev, status: 'revize_istendi', clientFeedback: revisionNote.trim() } : null);
    setIsRevisionMode(false);
    setRevisionNote('');
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'onaylandi':
        return { label: 'Onaylandı', bg: 'var(--success-light)', color: 'var(--success)', icon: CheckCircle2 };
      case 'revize_istendi':
        return { label: 'Revize İstendi', bg: 'var(--danger-light)', color: 'var(--danger)', icon: AlertCircle };
      case 'yayinlandi':
        return { label: 'Yayınlandı', bg: 'rgba(59, 130, 246, 0.15)', color: '#3B82F6', icon: Sparkles };
      case 'taslak':
        return { label: 'Taslak', bg: 'rgba(148, 163, 184, 0.15)', color: '#94a3b8', icon: Clock };
      default:
        return { label: 'Onay Bekliyor', bg: '#fef3c7', color: '#b45309', icon: Clock };
    }
  };

  return (
    <div style={{ maxWidth: '780px', margin: '0 auto' }}>
      {/* Instagram Profil Simülatörü Kartı */}
      <div
        className="card"
        style={{
          backgroundColor: '#0f172a',
          color: '#f8fafc',
          borderRadius: '16px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          overflow: 'hidden',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)'
        }}
      >
        {/* Üst Profil Bilgi Bölümü */}
        <div style={{ padding: '24px 28px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
            {/* Profil Resmi & Hikaye Çerçevesi */}
            <div
              style={{
                width: '84px',
                height: '84px',
                borderRadius: '50%',
                padding: '3px',
                background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: '50%',
                  backgroundColor: '#1e293b',
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px solid #0f172a'
                }}
              >
                <Instagram size={40} color="#e2e8f0" />
              </div>
            </div>

            {/* Profil İstatistik & Butonlar */}
            <div style={{ flex: 1, minWidth: '220px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>
                  {instagramHandle}
                </h3>
                <span
                  style={{
                    backgroundColor: 'rgba(59, 130, 246, 0.2)',
                    color: '#60a5fa',
                    padding: '2px 8px',
                    borderRadius: '12px',
                    fontSize: '0.72rem',
                    fontWeight: 700
                  }}
                >
                  Canlı Izgara Simülasyonu
                </span>
              </div>

              {/* İstatistikler */}
              <div style={{ display: 'flex', gap: '20px', marginBottom: '14px', fontSize: '0.9rem' }}>
                <div>
                  <strong>{sortedPosts.length}</strong> <span style={{ color: '#94a3b8' }}>gönderi</span>
                </div>
                <div>
                  <strong>14.8K</strong> <span style={{ color: '#94a3b8' }}>takipçi</span>
                </div>
                <div>
                  <strong>482</strong> <span style={{ color: '#94a3b8' }}>takip</span>
                </div>
              </div>

              {/* Biyografi */}
              <div style={{ fontSize: '0.86rem', lineHeight: 1.5 }}>
                <div style={{ fontWeight: 700, color: '#fff' }}>{profileName}</div>
                <div style={{ color: '#cbd5e1' }}>{profileBio}</div>
                <div style={{ color: '#38bdf8', marginTop: '2px', fontWeight: 600 }}>{website}</div>
              </div>
            </div>
          </div>

          {/* Hikaye Öne Çıkanlar (Story Highlights) */}
          <div
            style={{
              display: 'flex',
              gap: '16px',
              marginTop: '22px',
              overflowX: 'auto',
              paddingBottom: '4px'
            }}
          >
            {[
              { label: 'Kampanya', icon: '🔥' },
              { label: 'Reels', icon: '🎬' },
              { label: 'Müşteriler', icon: '⭐' },
              { label: 'Hizmetler', icon: '✨' },
              { label: 'İpuçları', icon: '💡' }
            ].map((story, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer'
                }}
              >
                <div
                  style={{
                    width: '52px',
                    height: '52px',
                    borderRadius: '50%',
                    backgroundColor: '#1e293b',
                    border: '1.5px solid rgba(255, 255, 255, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.25rem'
                  }}
                >
                  {story.icon}
                </div>
                <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{story.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Izgara / Feed Başlık Sekmesi */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 24px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            backgroundColor: 'rgba(15, 23, 42, 0.5)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#fff', fontWeight: 700, fontSize: '0.88rem' }}>
            <Instagram size={18} color="#E1306C" />
            <span>3x3 BESLEME (FEED) DÜZENİ</span>
          </div>

          {onOpenAddModal && !isClient && (
            <button
              onClick={onOpenAddModal}
              className="btn btn-sm"
              style={{
                background: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)',
                color: '#fff',
                fontSize: '0.78rem',
                fontWeight: 600,
                border: 'none'
              }}
            >
              <Plus size={14} />
              <span>Yeni Post Planla</span>
            </button>
          )}
        </div>

        {/* 3x3 Izgara Izgara Konteyneri */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '3px',
            backgroundColor: '#020617',
            padding: '3px'
          }}
        >
          {sortedPosts.length === 0 ? (
            <div
              style={{
                gridColumn: '1 / -1',
                padding: '60px 20px',
                textAlign: 'center',
                color: '#94a3b8'
              }}
            >
              <Instagram size={40} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
              <div style={{ fontWeight: 600, fontSize: '1rem', color: '#e2e8f0' }}>
                Henüz Planlanmış İçerik Yok
              </div>
              <p style={{ fontSize: '0.84rem', marginTop: '6px' }}>
                Yeni bir içerik planlayarak Instagram 3x3 ızgara dizilimini burada canlı görebilirsiniz.
              </p>
              {onOpenAddModal && (
                <button
                  onClick={onOpenAddModal}
                  className="btn btn-primary btn-sm"
                  style={{ marginTop: '14px' }}
                >
                  <Plus size={14} /> İlk İçeriği Planla
                </button>
              )}
            </div>
          ) : (
            sortedPosts.map((post) => {
              const statusBadge = getStatusBadge(post.status);
              const BadgeIcon = statusBadge.icon;

              return (
                <div
                  key={post.id}
                  onClick={() => {
                    setSelectedPost(post);
                    setIsRevisionMode(false);
                    setRevisionNote('');
                  }}
                  style={{
                    position: 'relative',
                    aspectRatio: '1 / 1',
                    backgroundColor: '#1e293b',
                    cursor: 'pointer',
                    overflow: 'hidden'
                  }}
                  className="instagram-grid-item"
                >
                  {/* Görsel */}
                  {post.mediaUrl ? (
                    <img
                      src={post.mediaUrl}
                      alt={post.title}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        transition: 'transform 0.2s'
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '12px',
                        background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
                        textAlign: 'center'
                      }}
                    >
                      <Instagram size={28} color="#94a3b8" />
                      <span
                        style={{
                          fontSize: '0.72rem',
                          color: '#e2e8f0',
                          marginTop: '6px',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden'
                        }}
                      >
                        {post.title}
                      </span>
                    </div>
                  )}

                  {/* Format Rozeti (Reels / Karusel) */}
                  <div
                    style={{
                      position: 'absolute',
                      top: '8px',
                      right: '8px',
                      backgroundColor: 'rgba(0,0,0,0.65)',
                      backdropFilter: 'blur(4px)',
                      color: '#fff',
                      borderRadius: '6px',
                      padding: '3px 6px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '0.68rem',
                      fontWeight: 600
                    }}
                  >
                    {post.mediaType === 'reels' ? (
                      <>
                        <Film size={12} />
                        <span>Reels</span>
                      </>
                    ) : post.mediaType === 'carousel' ? (
                      <>
                        <Layers size={12} />
                        <span>Karusel</span>
                      </>
                    ) : (
                      <Calendar size={12} />
                    )}
                  </div>

                  {/* Durum Rozeti (Sol Üst) */}
                  <div
                    style={{
                      position: 'absolute',
                      top: '8px',
                      left: '8px',
                      backgroundColor: statusBadge.bg,
                      color: statusBadge.color,
                      borderRadius: '6px',
                      padding: '3px 6px',
                      fontSize: '0.65rem',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '3px',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
                    }}
                  >
                    <BadgeIcon size={11} />
                    <span>{statusBadge.label}</span>
                  </div>

                  {/* Alt Karartma & Tarih */}
                  <div
                    style={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      padding: '24px 8px 6px',
                      background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 100%)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-end',
                      fontSize: '0.7rem',
                      color: '#fff'
                    }}
                  >
                    <span style={{ fontWeight: 600 }}>
                      {post.scheduledDate ? new Date(post.scheduledDate).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' }) : ''}
                    </span>
                    <span style={{ color: '#94a3b8', fontSize: '0.65rem' }}>İncele ↗</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Tıklanan Post İçin Önizleme ve Onay / Revize Modalı */}
      {selectedPost && (
        <div
          className="modal-overlay"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) isMouseDownOnOverlay.current = true;
          }}
          onMouseUp={(e) => {
            if (e.target === e.currentTarget && isMouseDownOnOverlay.current) setSelectedPost(null);
            isMouseDownOnOverlay.current = false;
          }}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.85)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 60,
            padding: '16px'
          }}
        >
          <div
            className="card"
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: '850px',
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'row',
              borderRadius: '16px',
              backgroundColor: '#0f172a',
              color: '#f8fafc',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.7)',
              overflow: 'hidden',
              flexWrap: 'wrap'
            }}
          >
            {/* Sol: Medya / Görsel */}
            <div
              style={{
                flex: '1 1 min(100%, 360px)',
                minWidth: 0,
                minHeight: '260px',
                maxHeight: '520px',
                backgroundColor: '#020617',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden'
              }}
            >
              {selectedPost.mediaUrl ? (
                <img
                  src={selectedPost.mediaUrl}
                  alt={selectedPost.title}
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                />
              ) : (
                <div style={{ textAlign: 'center', padding: '30px', color: '#94a3b8' }}>
                  <Instagram size={48} style={{ opacity: 0.4, margin: '0 auto 10px' }} />
                  <div>Görsel yüklenmedi</div>
                </div>
              )}
            </div>

            {/* Sağ: Başlık, Açıklama, Onay Butonları */}
            <div
              style={{
                flex: '1 1 min(100%, 340px)',
                minWidth: 0,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '20px',
                borderLeft: '1px solid rgba(255, 255, 255, 0.08)',
                overflowY: 'auto',
                maxHeight: '520px'
              }}
            >
              <div>
                {/* Header: Profil ve Kapat Butonu */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        backgroundColor: '#3b82f6',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.8rem',
                        fontWeight: 700
                      }}
                    >
                      {instagramHandle.charAt(1).toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.88rem' }}>{instagramHandle}</div>
                      <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Planlanan Sosyal Medya Gönderisi</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {!isClient && (
                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm(`"${selectedPost.title}" içeriğini silmek istediğinizden emin misiniz?`)) {
                            deleteContentPost(selectedPost.id);
                            setSelectedPost(null);
                          }
                        }}
                        style={{
                          background: 'rgba(239, 68, 68, 0.1)',
                          border: '1px solid rgba(239, 68, 68, 0.3)',
                          color: '#f87171',
                          cursor: 'pointer',
                          padding: '6px',
                          borderRadius: '6px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                        title="İçeriği Sil"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                    <button
                      onClick={() => setSelectedPost(null)}
                      style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}
                      title="Kapat"
                    >
                      <X size={18} />
                    </button>
                  </div>
                </div>

                {/* Gönderi Detayı */}
                <div style={{ marginTop: '14px' }}>
                  <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#fff', margin: '0 0 6px' }}>
                    {selectedPost.title}
                  </h4>

                  {/* Bilgi Rozetleri */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', margin: '10px 0' }}>
                    <span
                      style={{
                        padding: '3px 8px',
                        borderRadius: '6px',
                        backgroundColor: 'rgba(59, 130, 246, 0.15)',
                        color: '#60a5fa',
                        fontSize: '0.74rem',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <Calendar size={12} />
                      {selectedPost.scheduledDate ? (() => {
                        try {
                          const d = new Date(selectedPost.scheduledDate);
                          return isNaN(d.getTime()) ? 'Tarih Belirtilmemiş' : d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
                        } catch {
                          return 'Tarih Belirtilmemiş';
                        }
                      })() : 'Tarih Belirtilmemiş'}
                    </span>

                    {(() => {
                      const b = getStatusBadge(selectedPost.status);
                      const Icon = b.icon;
                      return (
                        <span
                          style={{
                            padding: '3px 8px',
                            borderRadius: '6px',
                            backgroundColor: b.bg,
                            color: b.color,
                            fontSize: '0.74rem',
                            fontWeight: 700,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <Icon size={12} />
                          {b.label}
                        </span>
                      );
                    })()}
                  </div>

                  {/* Caption */}
                  <div
                    style={{
                      padding: '12px',
                      borderRadius: '8px',
                      backgroundColor: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      fontSize: '0.84rem',
                      lineHeight: 1.6,
                      color: '#e2e8f0',
                      whiteSpace: 'pre-wrap'
                    }}
                  >
                    {selectedPost.caption || 'Açıklama metni eklenmemiş.'}
                  </div>

                  {/* HIZLI YAYINLAMA KİTİ (Madde 4) */}
                  <div style={{ marginTop: '14px', padding: '12px 14px', borderRadius: '8px', backgroundColor: 'rgba(56, 189, 248, 0.08)', border: '1px solid rgba(56, 189, 248, 0.2)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <Sparkles size={13} />
                        <span>HIZLI YAYINLAMA KİTİ</span>
                      </span>
                      {selectedPost.status === 'onaylandi' && (
                        <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#4ade80', backgroundColor: 'rgba(74, 222, 128, 0.15)', padding: '1px 6px', borderRadius: '4px' }}>
                          ✓ Onaylı &amp; Hazır
                        </span>
                      )}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '8px' }}>
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={() => {
                          if (!selectedPost.caption) {
                            alert('Kopyalanacak metin bulunmuyor.');
                            return;
                          }
                          navigator.clipboard.writeText(selectedPost.caption);
                          setCopiedCaption(true);
                          setTimeout(() => setCopiedCaption(false), 2500);
                        }}
                        style={{ fontSize: '0.76rem', padding: '6px 10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', backgroundColor: copiedCaption ? 'rgba(34, 197, 94, 0.2)' : undefined, color: copiedCaption ? '#4ade80' : undefined }}
                      >
                        {copiedCaption ? <Check size={14} /> : <Copy size={14} />}
                        <span>{copiedCaption ? 'Metin Kopyalandı!' : 'Metni & Tagleri Kopyala'}</span>
                      </button>

                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={() => {
                          if (selectedPost.mediaUrl) {
                            window.open(selectedPost.mediaUrl, '_blank');
                          } else {
                            alert('İndirilecek görsel bulunmuyor.');
                          }
                        }}
                        style={{ fontSize: '0.76rem', padding: '6px 10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                      >
                        <Download size={14} />
                        <span>Görseli İndir / Aç</span>
                      </button>
                    </div>

                    <a
                      href="https://www.instagram.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        marginTop: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        fontSize: '0.74rem',
                        fontWeight: 600,
                        color: '#94a3b8',
                        textDecoration: 'none',
                        padding: '4px',
                        borderRadius: '4px',
                        transition: 'color 0.2s'
                      }}
                      onMouseOver={(e) => (e.currentTarget.style.color = '#38bdf8')}
                      onMouseOut={(e) => (e.currentTarget.style.color = '#94a3b8')}
                    >
                      <span>Instagram Web Uygulamasını Aç</span>
                      <ExternalLink size={12} />
                    </a>
                  </div>

                  {/* Müşteri Geri Bildirimi / Revize Notu Varsa Göster */}
                  {selectedPost.clientFeedback && (
                    <div
                      style={{
                        marginTop: '12px',
                        padding: '10px 14px',
                        borderRadius: '8px',
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        fontSize: '0.82rem',
                        color: '#f87171'
                      }}
                    >
                      <strong>Müşteri Revize Talebi:</strong>
                      <div style={{ marginTop: '4px' }}>{selectedPost.clientFeedback}</div>
                    </div>
                  )}

                  {/* Revize İsteme Formu Açık İse */}
                  {isRevisionMode && (
                    <div style={{ marginTop: '14px' }}>
                      <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#fca5a5', display: 'block', marginBottom: '6px' }}>
                        Revize Talebi Açıklaması:
                      </label>
                      <textarea
                        className="form-input"
                        rows={3}
                        placeholder="Örn: Görseldeki yazı tipini değiştirelim, kampanya kodunu ekleyelim..."
                        value={revisionNote}
                        onChange={(e) => setRevisionNote(e.target.value)}
                        style={{ width: '100%', padding: '8px', fontSize: '0.84rem' }}
                      />
                      <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                        <button
                          className="btn btn-sm"
                          style={{ backgroundColor: '#ef4444', color: '#fff', fontWeight: 700 }}
                          onClick={() => handleReject(selectedPost)}
                        >
                          Revize Talebini İlet
                        </button>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => setIsRevisionMode(false)}
                        >
                          Vazgeç
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Alt Butonlar: Onayla & Revize İste */}
              {!isRevisionMode && (
                <div style={{ marginTop: '18px', paddingTop: '14px', borderTop: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', gap: '10px' }}>
                  {selectedPost.status !== 'onaylandi' && (
                    <button
                      className="btn"
                      onClick={() => handleApprove(selectedPost)}
                      style={{
                        flex: 1,
                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                        color: '#fff',
                        fontWeight: 700,
                        border: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px'
                      }}
                    >
                      <CheckCircle2 size={16} />
                      <span>İçeriği Onayla</span>
                    </button>
                  )}

                  <button
                    className="btn"
                    onClick={() => setIsRevisionMode(true)}
                    style={{
                      flex: 1,
                      backgroundColor: 'rgba(239, 68, 68, 0.15)',
                      color: '#f87171',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px'
                    }}
                  >
                    <Edit3 size={16} />
                    <span>Revize İste</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
