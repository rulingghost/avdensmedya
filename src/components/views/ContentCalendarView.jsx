import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  Instagram,
  Facebook,
  Linkedin,
  Share2,
  Plus,
  Filter,
  Eye,
  CheckCircle2,
  AlertCircle,
  Clock,
  MessageCircle,
  Sparkles,
  Trash2,
  Edit2,
  Grid3X3,
  CalendarDays,
  LayoutGrid,
  ExternalLink,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import AddContentPostModal from '../modals/AddContentPostModal';
import InstagramGridPreview from './InstagramGridPreview';

export default function ContentCalendarView({ onOpenWhatsAppModal }) {
  const {
    data,
    currentUser,
    getAccessibleCustomers,
    approveContentPost,
    rejectContentPost,
    deleteContentPost
  } = useApp();

  const accessibleCustomers = getAccessibleCustomers();
  const isClient = currentUser.role === 'musteri';

  // Filtreler
  const [selectedCustomerId, setSelectedCustomerId] = useState(() => {
    if (isClient) return currentUser.customerId || accessibleCustomers[0]?.id || '';
    return 'all';
  });
  const [selectedPlatform, setSelectedPlatform] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [viewMode, setViewMode] = useState('grid3x3'); // 'grid3x3' | 'cards' | 'calendar'

  // Modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState(null);

  // Takvim ayı
  const [currentCalendarDate, setCurrentCalendarDate] = useState(new Date());

  // Filtrelenmiş postlar
  const filteredPosts = (data.contentPosts || []).filter((post) => {
    // Müşteri erişim denetimi
    const isAccessible = accessibleCustomers.some(c => c.id === post.customerId);
    if (!isAccessible) return false;

    if (selectedCustomerId !== 'all' && post.customerId !== selectedCustomerId) return false;
    if (selectedPlatform !== 'all' && post.platform !== selectedPlatform) return false;
    if (selectedStatus !== 'all' && post.status !== selectedStatus) return false;
    return true;
  });

  // Seçili müşteri objesi (özellikle Instagram 3x3 görünümü için)
  const currentCustomerObj = accessibleCustomers.find(c => c.id === (selectedCustomerId === 'all' ? accessibleCustomers[0]?.id : selectedCustomerId));

  // Rol ve erişim denetimli postlar & durum sayıları
  const accessiblePosts = (data.contentPosts || []).filter(p =>
    accessibleCustomers.some(c => c.id === p.customerId)
  );
  const pendingCount = accessiblePosts.filter(p => p.status === 'onay_bekliyor').length;
  const approvedCount = accessiblePosts.filter(p => p.status === 'onaylandi').length;
  const revisionCount = accessiblePosts.filter(p => p.status === 'revize_istendi').length;

  const handleEdit = (post) => {
    setEditingPost(post);
    setIsAddModalOpen(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Bu sosyal medya içeriğini silmek istediğinizden emin misiniz?')) {
      deleteContentPost(id);
    }
  };

  // Takvim günleri üretimi (Aylık görünüm)
  const renderMonthCalendar = () => {
    const year = currentCalendarDate.getFullYear();
    const month = currentCalendarDate.getMonth();

    const firstDayIndex = new Date(year, month, 1).getDay(); // 0 is Sunday
    const adjustedFirstDay = firstDayIndex === 0 ? 6 : firstDayIndex - 1; // 0 is Monday
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const monthName = currentCalendarDate.toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' });

    const calendarCells = [];
    // Boş günler
    for (let i = 0; i < adjustedFirstDay; i++) {
      calendarCells.push(null);
    }
    // Ayın günleri
    for (let day = 1; day <= daysInMonth; day++) {
      calendarCells.push(day);
    }

    return (
      <div className="card" style={{ padding: '20px' }}>
        {/* Takvim Üst Navigasyonu */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CalendarDays size={20} color="var(--primary)" />
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, textTransform: 'capitalize' }}>
              {monthName}
            </h3>
          </div>

          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => setCurrentCalendarDate(new Date(year, month - 1, 1))}
            >
              <ChevronLeft size={16} /> Önceki Ay
            </button>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => setCurrentCalendarDate(new Date())}
            >
              Bugün
            </button>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => setCurrentCalendarDate(new Date(year, month + 1, 1))}
            >
              Sonraki Ay <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* Responsive Yatay Kaydırma Korumalı Takvim Izgarası */}
        <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', paddingBottom: '8px' }}>
          <div style={{ minWidth: '640px' }}>
            {/* Gün Başlıkları */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', textAlign: 'center', marginBottom: '6px', fontWeight: 700, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              {['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'].map((d, i) => (
                <div key={i} style={{ padding: '6px' }}>{d}</div>
              ))}
            </div>

            {/* Takvim Izgarası */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
          {calendarCells.map((day, idx) => {
            if (!day) {
              return <div key={`empty-${idx}`} style={{ minHeight: '90px', background: 'var(--bg-app)', opacity: 0.3, borderRadius: '6px' }} />;
            }

            const thisDateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const dayPosts = filteredPosts.filter(p => {
              if (!p.scheduledDate) return false;
              return p.scheduledDate.startsWith(thisDateStr);
            });

            const isToday = new Date().toISOString().slice(0, 10) === thisDateStr;

            return (
              <div
                key={`day-${day}`}
                style={{
                  minHeight: '95px',
                  backgroundColor: isToday ? 'rgba(59, 130, 246, 0.08)' : 'var(--bg-card)',
                  border: `1px solid ${isToday ? 'var(--primary)' : 'var(--border-subtle)'}`,
                  borderRadius: '8px',
                  padding: '6px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem', fontWeight: isToday ? 800 : 600, color: isToday ? 'var(--primary)' : 'var(--text-muted)' }}>
                  <span>{day}</span>
                  {dayPosts.length > 0 && (
                    <span style={{ fontSize: '0.68rem', background: 'var(--primary-light)', color: 'var(--primary)', padding: '1px 5px', borderRadius: '10px' }}>
                      {dayPosts.length}
                    </span>
                  )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', overflowY: 'auto', maxHeight: '75px' }}>
                  {dayPosts.map(p => (
                    <div
                      key={p.id}
                      onClick={() => handleEdit(p)}
                      style={{
                        padding: '2px 5px',
                        borderRadius: '4px',
                        fontSize: '0.68rem',
                        fontWeight: 600,
                        backgroundColor: p.status === 'onaylandi' ? 'var(--success-light)' : p.status === 'revize_istendi' ? 'var(--danger-light)' : '#fef3c7',
                        color: p.status === 'onaylandi' ? 'var(--success)' : p.status === 'revize_istendi' ? 'var(--danger)' : '#b45309',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}
                      title={`${p.title} (${p.status})`}
                    >
                      {p.title}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  </div>
);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Üst Başlık & İstatistikler */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <CalendarIcon size={22} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em', margin: 0 }}>
              Sosyal Medya &amp; İçerik Takvimi
            </h2>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Instagram 3x3 ızgara simülasyonu, yayın planlama ve müşteri onay mekanizması
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {onOpenWhatsAppModal && !isClient && (
            <button
              className="btn btn-secondary"
              onClick={onOpenWhatsAppModal}
              style={{ fontWeight: 600 }}
            >
              <MessageCircle size={16} color="#25D366" />
              <span>WhatsApp Onay Talebi</span>
            </button>
          )}

          {!isClient && (
            <button
              className="btn btn-primary"
              onClick={() => {
                setEditingPost(null);
                setIsAddModalOpen(true);
              }}
              style={{
                background: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)',
                borderColor: 'transparent',
                fontWeight: 700
              }}
            >
              <Plus size={16} />
              <span>Yeni İçerik Planla</span>
            </button>
          )}
        </div>
      </div>

      {/* Hızlı Sayaç Rozetleri */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px' }}>
        <div className="card" style={{ padding: '14px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: 36, height: 36, borderRadius: '8px', background: '#fef3c7', color: '#b45309', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Clock size={18} />
          </div>
          <div>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Onay Bekleyenler</span>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#b45309' }}>{pendingCount} Adet</div>
          </div>
        </div>

        <div className="card" style={{ padding: '14px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: 36, height: 36, borderRadius: '8px', background: 'var(--success-light)', color: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CheckCircle2 size={18} />
          </div>
          <div>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Onaylananlar</span>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--success)' }}>{approvedCount} Adet</div>
          </div>
        </div>

        <div className="card" style={{ padding: '14px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: 36, height: 36, borderRadius: '8px', background: 'var(--danger-light)', color: 'var(--danger)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <AlertCircle size={18} />
          </div>
          <div>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Revize İstenenler</span>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--danger)' }}>{revisionCount} Adet</div>
          </div>
        </div>

        <div className="card" style={{ padding: '14px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: 36, height: 36, borderRadius: '8px', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CalendarIcon size={18} />
          </div>
          <div>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Toplam Planlanan</span>
            <div style={{ fontSize: '1.2rem', fontWeight: 800 }}>{accessiblePosts.length} Adet</div>
          </div>
        </div>
      </div>

      {/* Kontrol & Filtre Çubuğu */}
      <div
        className="card"
        style={{
          padding: '14px 18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px'
        }}
      >
        {/* Sol Filtreler */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', flex: 1 }}>
          {/* Müşteri Filtresi (Sadece Admin/Aracı ise) */}
          {!isClient && (
            <select
              className="form-input"
              value={selectedCustomerId}
              onChange={(e) => setSelectedCustomerId(e.target.value)}
              style={{ minWidth: '180px', padding: '6px 10px', fontSize: '0.84rem' }}
            >
              <option value="all">Tüm Müşteriler ({accessibleCustomers.length})</option>
              {accessibleCustomers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.companyName}
                </option>
              ))}
            </select>
          )}

          {/* Platform Filtresi */}
          <select
            className="form-input"
            value={selectedPlatform}
            onChange={(e) => setSelectedPlatform(e.target.value)}
            style={{ padding: '6px 10px', fontSize: '0.84rem' }}
          >
            <option value="all">Tüm Platformlar</option>
            <option value="instagram">Instagram</option>
            <option value="facebook">Facebook</option>
            <option value="linkedin">LinkedIn</option>
            <option value="tiktok">TikTok</option>
          </select>

          {/* Durum Filtresi */}
          <select
            className="form-input"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            style={{ padding: '6px 10px', fontSize: '0.84rem' }}
          >
            <option value="all">Tüm Durumlar</option>
            <option value="onay_bekliyor">⏳ Onay Bekleyenler</option>
            <option value="onaylandi">✅ Onaylananlar</option>
            <option value="revize_istendi">⚠️ Revize İstenenler</option>
            <option value="taslak">📝 Taslaklar</option>
            <option value="yayinlandi">🚀 Yayınlananlar</option>
          </select>
        </div>

        {/* Görünüm Modu Butonları */}
        <div style={{ display: 'flex', gap: '4px', backgroundColor: 'var(--bg-app)', padding: '3px', borderRadius: '8px' }}>
          <button
            className={`btn btn-sm ${viewMode === 'grid3x3' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setViewMode('grid3x3')}
            style={{ fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '4px', padding: '5px 10px' }}
          >
            <Grid3X3 size={15} />
            <span>Instagram 3x3</span>
          </button>

          <button
            className={`btn btn-sm ${viewMode === 'cards' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setViewMode('cards')}
            style={{ fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '4px', padding: '5px 10px' }}
          >
            <LayoutGrid size={15} />
            <span>Kartlar</span>
          </button>

          <button
            className={`btn btn-sm ${viewMode === 'calendar' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setViewMode('calendar')}
            style={{ fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '4px', padding: '5px 10px' }}
          >
            <CalendarDays size={15} />
            <span>Aylık Takvim</span>
          </button>
        </div>
      </div>

      {/* 1. INSTAGRAM 3X3 ÖNİZLEME GÖRÜNÜMÜ */}
      {viewMode === 'grid3x3' && (
        <div>
          <InstagramGridPreview
            customer={currentCustomerObj}
            posts={filteredPosts}
            onOpenAddModal={() => {
              setEditingPost(null);
              setIsAddModalOpen(true);
            }}
          />
        </div>
      )}

      {/* 2. KART / LİSTE GÖRÜNÜMÜ */}
      {viewMode === 'cards' && (
        <div>
          {filteredPosts.length === 0 ? (
            <div className="card" style={{ padding: '48px 24px', textAlign: 'center' }}>
              <Instagram size={40} style={{ margin: '0 auto 12px', color: 'var(--text-muted)' }} />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Filtreye Uygun İçerik Bulunamadı</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '6px' }}>
                Seçili filtre kriterlerinde henüz planlanmış içerik bulunmuyor.
              </p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
              {filteredPosts.map((post) => {
                const customer = accessibleCustomers.find(c => c.id === post.customerId);
                return (
                  <div
                    key={post.id}
                    className="card"
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      overflow: 'hidden',
                      borderRadius: 'var(--radius-md)',
                      transition: 'transform 0.15s, box-shadow 0.15s'
                    }}
                  >
                    {/* Üst Görsel / Medya */}
                    <div
                      style={{
                        position: 'relative',
                        height: '180px',
                        backgroundColor: '#1e293b',
                        overflow: 'hidden'
                      }}
                    >
                      {post.mediaUrl ? (
                        <img
                          src={post.mediaUrl}
                          alt={post.title}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      ) : (
                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
                          <Instagram size={36} style={{ opacity: 0.4 }} />
                        </div>
                      )}

                      {/* Durum Rozeti */}
                      <span
                        style={{
                          position: 'absolute',
                          top: '10px',
                          left: '10px',
                          padding: '3px 8px',
                          borderRadius: '6px',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          backgroundColor: post.status === 'onaylandi' ? 'var(--success-light)' : post.status === 'revize_istendi' ? 'var(--danger-light)' : '#fef3c7',
                          color: post.status === 'onaylandi' ? 'var(--success)' : post.status === 'revize_istendi' ? 'var(--danger)' : '#b45309'
                        }}
                      >
                        {post.status === 'onaylandi' ? '✅ Onaylandı' : post.status === 'revize_istendi' ? '⚠️ Revize İstendi' : '⏳ Onay Bekliyor'}
                      </span>

                      {/* Platform */}
                      <span
                        style={{
                          position: 'absolute',
                          top: '10px',
                          right: '10px',
                          padding: '3px 6px',
                          borderRadius: '6px',
                          fontSize: '0.7rem',
                          fontWeight: 600,
                          backgroundColor: 'rgba(0,0,0,0.65)',
                          color: '#fff',
                          textTransform: 'capitalize'
                        }}
                      >
                        {post.platform}
                      </span>
                    </div>

                    {/* Kart Gövdesi */}
                    <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                      <div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 700, marginBottom: '4px' }}>
                          {customer?.companyName || 'Müşteri'}
                        </div>
                        <h4 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 8px', color: 'var(--text-main)' }}>
                          {post.title}
                        </h4>
                        <p
                          style={{
                            fontSize: '0.82rem',
                            color: 'var(--text-muted)',
                            margin: 0,
                            lineHeight: 1.5,
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden'
                          }}
                        >
                          {post.caption || 'Açıklama girilmedi.'}
                        </p>

                        {post.clientFeedback && (
                          <div style={{ marginTop: '8px', padding: '6px 10px', borderRadius: '6px', background: 'var(--danger-light)', color: 'var(--danger)', fontSize: '0.76rem' }}>
                            <strong>Revize Talebi:</strong> {post.clientFeedback}
                          </div>
                        )}
                      </div>

                      {/* Alt Bilgi & Butonlar */}
                      <div style={{ marginTop: '14px', paddingTop: '10px', borderTop: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Clock size={12} />
                          {post.scheduledDate ? new Date(post.scheduledDate).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : 'Belirtilmedi'}
                        </span>

                        <div style={{ display: 'flex', gap: '6px' }}>
                          {!isClient && (
                            <>
                              <button
                                className="btn-icon"
                                onClick={() => handleEdit(post)}
                                title="Düzenle"
                                style={{ color: 'var(--text-muted)' }}
                              >
                                <Edit2 size={15} />
                              </button>
                              <button
                                className="btn-icon"
                                onClick={() => handleDelete(post.id)}
                                title="Sil"
                                style={{ color: 'var(--danger)' }}
                              >
                                <Trash2 size={15} />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 3. AYLIK TAKVİM GÖRÜNÜMÜ */}
      {viewMode === 'calendar' && renderMonthCalendar()}

      {/* Post Ekleme / Düzenleme Modalı */}
      <AddContentPostModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingPost(null);
        }}
        editingPost={editingPost}
        initialCustomerId={selectedCustomerId !== 'all' ? selectedCustomerId : null}
      />
    </div>
  );
}
