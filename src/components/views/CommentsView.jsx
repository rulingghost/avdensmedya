import React, { useState } from 'react';
import {
  MessageSquare,
  Send,
  Building2,
  CheckCircle2,
  CornerDownRight,
  Sparkles
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function CommentsView() {
  const { data, currentUser, getAccessibleCustomers, addComment, replyComment, setSelectedCustomerId, setActivePage } = useApp();

  const accessibleCustomers = getAccessibleCustomers();

  const [selectedCustomerId, setLocalCustomerId] = useState(() => {
    if (currentUser.role === 'musteri') {
      return currentUser.customerId || 'cust-omtek';
    }
    return accessibleCustomers[0]?.id || '';
  });
  const [newComment, setNewComment] = useState('');
  const [replyMap, setReplyMap] = useState({});

  const customer = accessibleCustomers.find(c => c.id === selectedCustomerId) || accessibleCustomers[0] || null;
  const comments = customer ? data.comments.filter(c => c.customerId === customer.id) : [];

  const handleAdd = (e) => {
    e.preventDefault();
    if (!newComment.trim() || !customer) return;
    addComment(customer.id, newComment);
    setNewComment('');
  };

  const handleReply = (commentId) => {
    const text = replyMap[commentId];
    if (!text || !text.trim()) return;
    replyComment(commentId, text);
    setReplyMap({ ...replyMap, [commentId]: '' });
  };

  if (!customer) {
    return (
      <div className="card" style={{ padding: '48px 24px', textAlign: 'center', maxWidth: '600px', margin: '40px auto' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-main)' }}>Atanmış Müşteri Bulunmuyor</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginTop: '8px' }}>
          Yorumları görüntülemek için erişim yetkiniz olan bir müşteri kaydı bulunmamaktadır.
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '900px', margin: '0 auto' }}>

      {/* Başlık */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-md)', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <MessageSquare size={22} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
              Müşteri Geri Bildirim & Yorumlaşma (Madde 15)
            </h2>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Müşteri ve ajans arasında revize talepleri, istekler ve anlık yanıtlar
            </span>
          </div>
        </div>

        {currentUser.role !== 'musteri' && accessibleCustomers.length > 1 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)' }}>Proje Seçin:</span>
            <select
              className="form-select"
              style={{ width: 'auto', padding: '6px 14px', fontSize: '0.85rem' }}
              value={selectedCustomerId}
              onChange={(e) => setLocalCustomerId(e.target.value)}
            >
              {accessibleCustomers.map(c => (
                <option key={c.id} value={c.id}>{c.companyName}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Yorum Gönderme Kutusu */}
      <div className="card" style={{ padding: '24px' }}>
        <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '12px' }}>
          {customer?.companyName} Projesi için Yeni Yorum Yazın
        </h4>

        <form onSubmit={handleAdd}>
          <div style={{ display: 'flex', gap: '12px' }}>
            <textarea
              className="form-textarea"
              rows={2}
              placeholder="Yorumunuzu veya talebinizi buraya yazın..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              required
              style={{ flex: 1 }}
            />
            <button
              type="submit"
              className="btn btn-primary"
              style={{ alignSelf: 'flex-end', height: '42px', padding: '0 20px' }}
            >
              <Send size={15} />
              <span>Gönder</span>
            </button>
          </div>
        </form>
      </div>

      {/* Yorum Akışı */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {comments.length === 0 ? (
          <div className="card" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
            Bu projeye ait henüz yorum bulunmuyor.
          </div>
        ) : (
          comments.map((comm) => (
            <div
              key={comm.id}
              className="card"
              style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <img
                  src={comm.userAvatar}
                  alt={comm.userName}
                  style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover' }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <strong style={{ fontSize: '0.9rem', color: 'var(--text-main)' }}>
                      {comm.userName} ({comm.userRole === 'musteri' ? 'Müşteri' : comm.userRole})
                    </strong>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
                      {new Date(comm.createdAt).toLocaleString('tr-TR', { dateStyle: 'short', timeStyle: 'short' })}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-main)', marginTop: '4px', lineHeight: 1.5 }}>
                    "{comm.message}"
                  </p>
                </div>
              </div>

              {/* Yanıt (Reply) */}
              {comm.reply ? (
                <div
                  style={{
                    marginLeft: '44px',
                    backgroundColor: 'var(--bg-app)',
                    padding: '14px 18px',
                    borderRadius: 'var(--radius-md)',
                    borderLeft: '4px solid var(--primary)',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '10px'
                  }}
                >
                  <img
                    src={comm.reply.userAvatar}
                    alt={comm.reply.userName}
                    style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover' }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <strong style={{ fontSize: '0.84rem', color: 'var(--primary)' }}>
                        {comm.reply.userName} (Ajans Yanıtı)
                      </strong>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>
                        {new Date(comm.reply.createdAt).toLocaleString('tr-TR', { dateStyle: 'short', timeStyle: 'short' })}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.86rem', color: 'var(--text-main)', marginTop: '3px' }}>
                      {comm.reply.message}
                    </p>
                  </div>
                </div>
              ) : (
                currentUser.role !== 'musteri' && (
                  <div style={{ marginLeft: '44px', display: 'flex', gap: '8px' }}>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Müşteriye yanıt yazın..."
                      style={{ fontSize: '0.84rem', padding: '6px 12px' }}
                      value={replyMap[comm.id] || ''}
                      onChange={(e) => setReplyMap({ ...replyMap, [comm.id]: e.target.value })}
                    />
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => handleReply(comm.id)}
                    >
                      Yanıtla
                    </button>
                  </div>
                )
              )}
            </div>
          ))
        )}
      </div>

    </div>
  );
}
