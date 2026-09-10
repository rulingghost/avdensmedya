import React, { useState } from 'react';
import {
  UserCheck,
  ShieldCheck,
  UserPlus,
  Search,
  Mail,
  Phone,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Eye,
  EyeOff,
  Building2,
  Users,
  Sparkles,
  ExternalLink,
  ShieldAlert,
  Briefcase
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80'
];

export default function UsersView() {
  const {
    data,
    currentUser,
    addUser,
    updateUser,
    deleteUser,
    setSelectedCustomerId,
    setActivePage
  } = useApp();

  const [roleFilter, setRoleFilter] = useState('all'); // 'all' | 'admin' | 'araci' | 'musteri'
  const [searchTerm, setSearchTerm] = useState('');
  const [feedback, setFeedback] = useState({ message: '', type: '' });

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [mouseDownOnOverlay, setMouseDownOnOverlay] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'araci',
    title: '',
    phone: '',
    avatar: PRESET_AVATARS[1]
  });

  const showNotification = (message, type = 'success') => {
    setFeedback({ message, type });
    setTimeout(() => setFeedback({ message: '', type: '' }), 5000);
  };

  // Açılan modalı sıfırla veya doldur
  const openAddModal = (defaultRole = 'araci') => {
    setEditingUserId(null);
    setFormData({
      name: '',
      email: '',
      password: '123',
      role: defaultRole,
      title: defaultRole === 'admin' ? 'Ajans Yöneticisi' : 'İş Ortağı / Aracı',
      phone: '',
      avatar: defaultRole === 'admin' ? PRESET_AVATARS[0] : PRESET_AVATARS[1]
    });
    setShowPassword(false);
    setIsModalOpen(true);
  };

  const openEditModal = (user) => {
    setEditingUserId(user.id);
    setFormData({
      name: user.name || '',
      email: user.email || '',
      password: user.password || '',
      role: user.role || 'araci',
      title: user.title || '',
      phone: user.phone || '',
      avatar: user.avatar || PRESET_AVATARS[0]
    });
    setShowPassword(false);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingUserId(null);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (editingUserId) {
      // Güncelleme
      const result = await updateUser(editingUserId, formData);
      if (result.success) {
        showNotification(`"${formData.name}" bilgileri başarıyla güncellendi.`, 'success');
        closeModal();
      } else {
        showNotification(result.message || 'Güncelleme sırasında hata oluştu.', 'error');
      }
    } else {
      // Yeni Ekleme
      const result = await addUser(formData);
      if (result.success) {
        showNotification(`Yeni ${formData.role === 'admin' ? 'Yönetici' : 'İş Ortağı'} "${formData.name}" başarıyla eklendi!`, 'success');
        closeModal();
      } else {
        showNotification(result.message || 'Kullanıcı eklenirken hata oluştu.', 'error');
      }
    }
  };

  const handleDeleteUser = async (user) => {
    if (user.id === currentUser.id) {
      showNotification('Kendi aktif oturumunuzu silemezsiniz.', 'error');
      return;
    }

    const assignedCusts = data.customers.filter(c => c.partnerId === user.id);
    let confirmMsg = `"${user.name}" (${user.role === 'admin' ? 'Yönetici' : 'İş Ortağı'}) yetkilisini silmek istediğinize emin misiniz?`;
    
    if (assignedCusts.length > 0) {
      confirmMsg += `\n\nBu aracıya bağlı ${assignedCusts.length} adet müşteri bulunmaktadır. Silinirse bu müşteriler "Atanmamış" durumuna getirilecek ve hiçbir veri kaybı yaşanmayacaktır.`;
    }

    if (window.confirm(confirmMsg)) {
      const result = await deleteUser(user.id);
      if (result.success) {
        showNotification(`"${user.name}" sistemden başarıyla silindi.`, 'success');
      } else {
        showNotification(result.message || 'Silme işlemi başarısız oldu.', 'error');
      }
    }
  };

  // İstatistikler
  const totalUsers = data.users.length;
  const adminUsers = data.users.filter(u => u.role === 'admin');
  const araciUsers = data.users.filter(u => u.role === 'araci');
  const musteriUsers = data.users.filter(u => u.role === 'musteri');

  // Filtreleme
  const filteredUsers = data.users.filter((user) => {
    const matchesRole = roleFilter === 'all' ? true : user.role === roleFilter;
    const q = searchTerm.toLowerCase().trim();
    const matchesSearch = !q || (
      user.name?.toLowerCase().includes(q) ||
      user.email?.toLowerCase().includes(q) ||
      user.title?.toLowerCase().includes(q) ||
      user.phone?.toLowerCase().includes(q)
    );
    return matchesRole && matchesSearch;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '1200px', margin: '0 auto' }}>

      {/* Üst Başlık & Eylemler */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: 44,
            height: 44,
            borderRadius: 'var(--radius-md)',
            background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.15) 0%, rgba(99, 102, 241, 0.15) 100%)',
            color: 'var(--primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(56, 189, 248, 0.1)'
          }}>
            <UserCheck size={24} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '8px' }}>
              Ekip &amp; Yetkili Yönetimi
            </h2>
            <span style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>
              Yöneticileri ve aracıları (iş ortaklarını) ekleyin, yetkilendirin ve portföylerini yönetin.
            </span>
          </div>
        </div>

        {/* Aksiyon Butonları */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            className="btn btn-secondary"
            onClick={() => openAddModal('araci')}
            style={{ fontWeight: 600 }}
          >
            <Users size={16} />
            <span>+ Yeni Aracı Ekle</span>
          </button>

          <button
            className="btn btn-primary"
            onClick={() => openAddModal('admin')}
            style={{ fontWeight: 700 }}
          >
            <UserPlus size={16} />
            <span>+ Yeni Yönetici Ekle</span>
          </button>
        </div>
      </div>

      {/* Geri Bildirim Bildirimi */}
      {feedback.message && (
        <div
          style={{
            padding: '12px 18px',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            backgroundColor: feedback.type === 'success' ? 'var(--success-light)' : 'var(--danger-light)',
            color: feedback.type === 'success' ? 'var(--success-text)' : 'var(--danger-text)',
            border: `1px solid ${feedback.type === 'success' ? '#a7f3d0' : '#fecaca'}`,
            animation: 'fadeIn 0.2s ease'
          }}
        >
          {feedback.type === 'success' ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
          <span style={{ fontWeight: 600, fontSize: '0.88rem' }}>{feedback.message}</span>
        </div>
      )}

      {/* İstatistik Kartları */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        
        {/* Toplam Ekip */}
        <div className="card" style={{ padding: '18px 20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: 44, height: 44, borderRadius: '12px', background: 'rgba(56, 189, 248, 0.12)', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Users size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Toplam Ekip &amp; Üye</div>
            <div style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-main)' }}>{totalUsers} Kişi</div>
          </div>
        </div>

        {/* Yöneticiler */}
        <div className="card" style={{ padding: '18px 20px', display: 'flex', alignItems: 'center', gap: '16px', borderLeft: '4px solid #8b5cf6' }}>
          <div style={{ width: 44, height: 44, borderRadius: '12px', background: 'rgba(139, 92, 246, 0.12)', color: '#8b5cf6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ShieldCheck size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Yöneticiler (Admin)</div>
            <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#8b5cf6' }}>{adminUsers.length} Yönetici</div>
          </div>
        </div>

        {/* Aracılar */}
        <div className="card" style={{ padding: '18px 20px', display: 'flex', alignItems: 'center', gap: '16px', borderLeft: '4px solid #10b981' }}>
          <div style={{ width: 44, height: 44, borderRadius: '12px', background: 'rgba(16, 185, 129, 0.12)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Briefcase size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>İş Ortakları (Aracı)</div>
            <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#10b981' }}>{araciUsers.length} Aracı</div>
          </div>
        </div>

        {/* Müşteri Portalı Hesapları */}
        <div className="card" style={{ padding: '18px 20px', display: 'flex', alignItems: 'center', gap: '16px', borderLeft: '4px solid #f59e0b' }}>
          <div style={{ width: 44, height: 44, borderRadius: '12px', background: 'rgba(245, 158, 11, 0.12)', color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Building2 size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Müşteri Hesapları</div>
            <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#f59e0b' }}>{musteriUsers.length} Müşteri</div>
          </div>
        </div>

      </div>

      {/* Arama ve Filtre Çubuğu */}
      <div className="card" style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        
        {/* Sekmeler */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          <button
            className={`btn btn-sm ${roleFilter === 'all' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setRoleFilter('all')}
          >
            Tümü ({totalUsers})
          </button>
          <button
            className={`btn btn-sm ${roleFilter === 'admin' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setRoleFilter('admin')}
            style={roleFilter === 'admin' ? { background: '#8b5cf6', borderColor: '#8b5cf6' } : {}}
          >
            👑 Yöneticiler ({adminUsers.length})
          </button>
          <button
            className={`btn btn-sm ${roleFilter === 'araci' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setRoleFilter('araci')}
            style={roleFilter === 'araci' ? { background: '#10b981', borderColor: '#10b981' } : {}}
          >
            🤝 Aracılar ({araciUsers.length})
          </button>
          <button
            className={`btn btn-sm ${roleFilter === 'musteri' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setRoleFilter('musteri')}
            style={roleFilter === 'musteri' ? { background: '#f59e0b', borderColor: '#f59e0b' } : {}}
          >
            🏢 Müşteri Hesapları ({musteriUsers.length})
          </button>
        </div>

        {/* Arama Input */}
        <div style={{ position: 'relative', width: '280px' }}>
          <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: '36px', paddingRight: '12px', height: '36px', fontSize: '0.84rem' }}
            placeholder="İsim, e-posta, unvan ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

      </div>

      {/* Kullanıcı Kartları Listesi */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '18px' }}>
        {filteredUsers.length === 0 ? (
          <div className="card" style={{ gridColumn: '1 / -1', padding: '48px 24px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <Users size={36} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
            <h4 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-main)' }}>Kriterlere uygun yetkili bulunamadı.</h4>
            <p style={{ fontSize: '0.85rem', marginTop: '4px' }}>Arama filtrenizi temizleyebilir veya yeni yetkili ekleyebilirsiniz.</p>
          </div>
        ) : (
          filteredUsers.map((user) => {
            const isSelf = user.id === currentUser.id;
            const assignedCustomers = data.customers.filter(c => c.partnerId === user.id);
            const isLastAdmin = user.role === 'admin' && adminUsers.length <= 1;

            return (
              <div
                key={user.id}
                className="card"
                style={{
                  padding: '22px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '16px',
                  position: 'relative',
                  borderTop: user.role === 'admin'
                    ? '4px solid #8b5cf6'
                    : user.role === 'araci'
                    ? '4px solid #10b981'
                    : '4px solid #f59e0b',
                  transition: 'all 0.2s',
                  boxShadow: 'var(--card-shadow)'
                }}
              >
                {/* Üst Bilgi: Avatar, İsim & Rol */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <div style={{ position: 'relative' }}>
                        <img
                          src={user.avatar || PRESET_AVATARS[0]}
                          alt={user.name}
                          style={{
                            width: 52,
                            height: 52,
                            borderRadius: '50%',
                            objectFit: 'cover',
                            border: `2px solid ${user.role === 'admin' ? '#8b5cf6' : user.role === 'araci' ? '#10b981' : '#f59e0b'}`
                          }}
                        />
                        {isSelf && (
                          <span
                            title="Aktif Oturum Sahibi"
                            style={{
                              position: 'absolute',
                              bottom: -2,
                              right: -2,
                              background: 'var(--primary)',
                              color: '#fff',
                              borderRadius: '50%',
                              width: 18,
                              height: 18,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '0.65rem',
                              fontWeight: 800,
                              border: '2px solid #fff'
                            }}
                          >
                            ✓
                          </span>
                        )}
                      </div>

                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)' }}>
                            {user.name}
                          </h3>
                          {isSelf && (
                            <span style={{ fontSize: '0.7rem', padding: '1px 6px', borderRadius: '4px', background: 'var(--primary-light)', color: 'var(--primary)', fontWeight: 700 }}>
                              Siz
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                          {user.title || (user.role === 'admin' ? 'Ajans Yöneticisi' : user.role === 'araci' ? 'İş Ortağı' : 'Firma Yetkilisi')}
                        </div>
                      </div>
                    </div>

                    {/* Rol Rozeti */}
                    <span
                      style={{
                        padding: '4px 10px',
                        borderRadius: '20px',
                        fontSize: '0.74rem',
                        fontWeight: 700,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        background: user.role === 'admin' ? 'rgba(139, 92, 246, 0.12)' : user.role === 'araci' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(245, 158, 11, 0.12)',
                        color: user.role === 'admin' ? '#7c3aed' : user.role === 'araci' ? '#059669' : '#d97706',
                        border: `1px solid ${user.role === 'admin' ? 'rgba(139, 92, 246, 0.25)' : user.role === 'araci' ? 'rgba(16, 185, 129, 0.25)' : 'rgba(245, 158, 11, 0.25)'}`
                      }}
                    >
                      {user.role === 'admin' ? '👑 Yönetici' : user.role === 'araci' ? '🤝 İş Ortağı' : '🏢 Müşteri'}
                    </span>
                  </div>

                  {/* İletişim Bilgileri */}
                  <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.82rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)' }}>
                      <Mail size={14} flexShrink={0} />
                      <a href={`mailto:${user.email}`} style={{ color: 'var(--text-main)', fontWeight: 500, textDecoration: 'none' }}>
                        {user.email}
                      </a>
                    </div>

                    {user.phone && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)' }}>
                        <Phone size={14} flexShrink={0} />
                        <span style={{ color: 'var(--text-main)' }}>{user.phone}</span>
                      </div>
                    )}
                  </div>

                  {/* Aracıya Bağlı Müşteriler */}
                  {user.role === 'araci' && (
                    <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: '1px solid var(--border-subtle)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <span style={{ fontSize: '0.76rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                          Sorumlu Portföy
                        </span>
                        <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#10b981', background: 'rgba(16, 185, 129, 0.1)', padding: '2px 8px', borderRadius: '10px' }}>
                          {assignedCustomers.length} Müşteri
                        </span>
                      </div>

                      {assignedCustomers.length > 0 ? (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                          {assignedCustomers.map(cust => (
                            <button
                              key={cust.id}
                              onClick={() => {
                                setSelectedCustomerId(cust.id);
                                setActivePage('customer-detail');
                              }}
                              style={{
                                background: 'var(--bg-app)',
                                border: '1px solid var(--border-color)',
                                borderRadius: '4px',
                                padding: '2px 8px',
                                fontSize: '0.72rem',
                                color: 'var(--text-main)',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}
                              title="Müşteri Detayına Git"
                            >
                              <span>{cust.companyName}</span>
                              <ExternalLink size={10} color="var(--text-muted)" />
                            </button>
                          ))}
                        </div>
                      ) : (
                        <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                          Henüz atanmış müşteri bulunmuyor.
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Alt Aksiyon Butonları */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '12px', borderTop: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    Şifre: <span style={{ fontFamily: 'monospace', fontWeight: 700 }}>••••</span>
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => openEditModal(user)}
                      style={{ padding: '5px 10px', fontSize: '0.78rem' }}
                      title="Bilgileri Düzenle"
                    >
                      <Edit2 size={13} />
                      <span>Düzenle</span>
                    </button>

                    <button
                      className="btn btn-sm"
                      onClick={() => handleDeleteUser(user)}
                      disabled={isSelf || isLastAdmin}
                      style={{
                        padding: '5px 10px',
                        fontSize: '0.78rem',
                        color: (isSelf || isLastAdmin) ? 'var(--text-muted)' : 'var(--danger)',
                        background: (isSelf || isLastAdmin) ? 'rgba(0,0,0,0.04)' : 'var(--danger-light)',
                        border: `1px solid ${(isSelf || isLastAdmin) ? 'var(--border-color)' : '#fca5a5'}`,
                        cursor: (isSelf || isLastAdmin) ? 'not-allowed' : 'pointer',
                        opacity: (isSelf || isLastAdmin) ? 0.5 : 1
                      }}
                      title={
                        isSelf
                          ? 'Kendi oturumunuzu silemezsiniz'
                          : isLastAdmin
                          ? 'Sistemde en az 1 yönetici kalmalıdır'
                          : 'Kullanıcıyı Sil'
                      }
                    >
                      <Trash2 size={13} />
                      <span>Sil</span>
                    </button>
                  </div>
                </div>

              </div>
            );
          })
        )}
      </div>

      {/* ========================================================= */}
      {/* EKLEME / DÜZENLEME MODAL'I */}
      {/* ========================================================= */}
      {isModalOpen && (
        <div
          className="modal-overlay"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setMouseDownOnOverlay(true);
            else setMouseDownOnOverlay(false);
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget && mouseDownOnOverlay) closeModal();
            setMouseDownOnOverlay(false);
          }}
        >
          <div
            className="modal-content"
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '520px', width: '95%' }}
          >
            {/* Modal Başlığı */}
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: 36, height: 36, borderRadius: '8px', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {editingUserId ? <Edit2 size={18} /> : <UserPlus size={18} />}
                </div>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>
                    {editingUserId ? 'Yetkiliyi Düzenle' : 'Yeni Yetkili / Ekip Üyesi Ekle'}
                  </h3>
                  <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                    {editingUserId ? 'Kullanıcı rolü, unvanı veya şifresini güncelleyin' : 'Yönetici veya aracı olarak yeni bir ekip hesabı açın'}
                  </span>
                </div>
              </div>
              <button onClick={closeModal} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                ✕
              </button>
            </div>

            {/* Modal Formu */}
            <form onSubmit={handleFormSubmit} style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

              {/* Rol Seçimi (Kartlı Seçim) */}
              <div className="form-group">
                <label style={{ fontSize: '0.84rem', fontWeight: 600 }}>Hesap Rolü &amp; Yetki Seviyesi</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '4px' }}>
                  
                  {/* Aracı Kartı */}
                  <div
                    onClick={() => setFormData({ ...formData, role: 'araci', title: formData.title || 'İş Ortağı / Aracı' })}
                    style={{
                      padding: '12px',
                      borderRadius: 'var(--radius-md)',
                      border: `2px solid ${formData.role === 'araci' ? '#10b981' : 'var(--border-color)'}`,
                      background: formData.role === 'araci' ? 'rgba(16, 185, 129, 0.08)' : 'var(--bg-app)',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px',
                      transition: 'all 0.15s'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.88rem', color: '#10b981' }}>🤝 İş Ortağı (Aracı)</span>
                      {formData.role === 'araci' && <CheckCircle2 size={16} color="#10b981" />}
                    </div>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', lineHeight: 1.3 }}>
                      Yalnızca kendisine atanan müşterileri ve işleri görür.
                    </span>
                  </div>

                  {/* Yönetici Kartı */}
                  <div
                    onClick={() => setFormData({ ...formData, role: 'admin', title: formData.title || 'Ajans Yöneticisi' })}
                    style={{
                      padding: '12px',
                      borderRadius: 'var(--radius-md)',
                      border: `2px solid ${formData.role === 'admin' ? '#8b5cf6' : 'var(--border-color)'}`,
                      background: formData.role === 'admin' ? 'rgba(139, 92, 246, 0.08)' : 'var(--bg-app)',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px',
                      transition: 'all 0.15s'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.88rem', color: '#8b5cf6' }}>👑 Yönetici (Admin)</span>
                      {formData.role === 'admin' && <CheckCircle2 size={16} color="#8b5cf6" />}
                    </div>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', lineHeight: 1.3 }}>
                      Tüm müşterilere, görevlere, kasaya ve yetkililere tam erişim.
                    </span>
                  </div>

                </div>
              </div>

              {/* Ad Soyad */}
              <div className="form-group">
                <label style={{ fontSize: '0.84rem', fontWeight: 600 }}>Ad Soyad *</label>
                <input
                  type="text"
                  className="form-input"
                  required
                  placeholder="Örn: Ahmet Yılmaz"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              {/* E-posta ve Şifre (Yan Yana) */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label style={{ fontSize: '0.84rem', fontWeight: 600 }}>E-posta Adresi *</label>
                  <input
                    type="email"
                    className="form-input"
                    required
                    placeholder="ornek@avdens.work"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label style={{ fontSize: '0.84rem', fontWeight: 600 }}>Giriş Şifresi *</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className="form-input"
                      required
                      placeholder="Şifre belirleyin"
                      style={{ paddingRight: '36px' }}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                    >
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Unvan ve Telefon (Yan Yana) */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label style={{ fontSize: '0.84rem', fontWeight: 600 }}>Unvan / Pozisyon</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Örn: Kıdemli Medya Yöneticisi"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label style={{ fontSize: '0.84rem', fontWeight: 600 }}>Telefon Numarası</label>
                  <input
                    type="tel"
                    className="form-input"
                    placeholder="+90 532 000 00 00"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
              </div>

              {/* Avatar Seçimi */}
              <div className="form-group">
                <label style={{ fontSize: '0.84rem', fontWeight: 600 }}>Profil Avatarı Seçin</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginTop: '6px' }}>
                  {PRESET_AVATARS.map((av, idx) => (
                    <img
                      key={idx}
                      src={av}
                      alt="avatar option"
                      onClick={() => setFormData({ ...formData, avatar: av })}
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        cursor: 'pointer',
                        objectFit: 'cover',
                        border: formData.avatar === av ? '3px solid var(--primary)' : '2px solid transparent',
                        transform: formData.avatar === av ? 'scale(1.1)' : 'none',
                        transition: 'all 0.15s'
                      }}
                    />
                  ))}
                </div>
                <div style={{ marginTop: '8px' }}>
                  <input
                    type="url"
                    className="form-input"
                    placeholder="Veya özel fotoğraf URL'si girin (https://...)"
                    value={formData.avatar && !PRESET_AVATARS.includes(formData.avatar) ? formData.avatar : ''}
                    onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
                    style={{ fontSize: '0.8rem', padding: '6px 10px' }}
                  />
                </div>
              </div>

              {/* Butonlar */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={closeModal}
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ minWidth: '130px' }}
                >
                  <CheckCircle2 size={16} />
                  <span>{editingUserId ? 'Değişiklikleri Kaydet' : 'Yetkiliyi Oluştur'}</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
