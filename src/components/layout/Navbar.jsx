import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  Bell,
  Plus,
  ShieldCheck,
  UserCheck,
  Building2,
  CheckCircle2,
  Clock,
  MessageSquare,
  X,
  Menu,
  ChevronDown,
  UserCog,
  LogOut
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function Navbar({ onOpenQuickAction, onToggleSidebar, onOpenEditProfile }) {
  const {
    currentUser,
    searchQuery,
    setSearchQuery,
    data,
    markNotificationRead,
    markAllNotificationsRead,
    setSelectedCustomerId,
    setActivePage,
    logout
  } = useApp();

  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const notifRef = useRef(null);
  const profileRef = useRef(null);

  const unreadNotifications = data.notifications.filter(n => !n.read);

  // Dışarı tıklamada pencereleri kapatma
  useEffect(() => {
    function handleClickOutside(event) {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setNotifOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNotificationClick = (notif) => {
    markNotificationRead(notif.id);
    if (notif.linkCustomerId) {
      setSelectedCustomerId(notif.linkCustomerId);
      setActivePage('customer-detail');
    }
    setNotifOpen(false);
  };

  const handleLogout = () => {
    setProfileOpen(false);
    if (window.confirm('Oturumunuz kapatılacaktır. Devam etmek istiyor musunuz?')) {
      logout();
    }
  };

  return (
    <header className="top-navbar">
      {/* Sol Bölüm: Hamburger & Arama */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button
          className="mobile-menu-btn"
          onClick={onToggleSidebar}
          style={{ display: 'none', color: 'var(--text-main)', padding: '6px' }}
          title="Menüyü Aç/Kapat"
        >
          <Menu size={22} />
        </button>

        {/* Global Arama */}
        <div className="nav-search-box">
          <Search size={18} color="var(--text-muted)" />
          <input
            type="text"
            placeholder="Müşteri, görev, telefon veya aracı ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} style={{ color: 'var(--text-muted)' }}>
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Sağ Aksiyonlar */}
      <div className="navbar-actions">

        {/* Hızlı İşlem Butonu (Admin ve Aracı için) */}
        {currentUser.role !== 'musteri' && (
          <button
            className="btn btn-primary btn-sm"
            onClick={onOpenQuickAction}
            title="Yeni müşteri, görev veya not ekle"
          >
            <Plus size={16} />
            <span>Hızlı İşlem</span>
          </button>
        )}

        {/* Bildirim Çanı */}
        <div style={{ position: 'relative' }} ref={notifRef}>
          <button
            className="action-icon-btn"
            onClick={() => setNotifOpen(!notifOpen)}
            title="Bildirimler"
          >
            <Bell size={18} />
            {unreadNotifications.length > 0 && <span className="badge-dot" />}
          </button>

          {/* Bildirim Dropdown Popover */}
          {notifOpen && (
            <div className="notification-popover">
              <div className="popover-header">
                <div>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 700 }}>Bildirimler</h4>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {unreadNotifications.length} okunmamış bildirim
                  </span>
                </div>
                {unreadNotifications.length > 0 && (
                  <button
                    onClick={markAllNotificationsRead}
                    style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 600 }}
                  >
                    Tümünü Oku
                  </button>
                )}
              </div>

              <div className="popover-body">
                {data.notifications.length === 0 ? (
                  <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    Henüz bildirim yok.
                  </div>
                ) : (
                  data.notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className={`notif-item ${!notif.read ? 'unread' : ''}`}
                      onClick={() => handleNotificationClick(notif)}
                    >
                      <div style={{ marginTop: '2px', color: notif.read ? 'var(--text-muted)' : 'var(--primary)' }}>
                        {notif.title.includes('Tamamlandı') ? (
                          <CheckCircle2 size={18} color="var(--success)" />
                        ) : notif.title.includes('Yorum') ? (
                          <MessageSquare size={18} color="var(--primary)" />
                        ) : (
                          <Clock size={18} color="var(--warning)" />
                        )}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-main)' }}>
                          {notif.title}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                          {notif.message}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Profil Bilgisi ve Dropdown Menü (Madde 1) */}
        <div style={{ position: 'relative' }} ref={profileRef}>
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '4px 10px 4px 10px',
              borderLeft: '1px solid var(--border-color)',
              background: profileOpen ? 'rgba(56, 189, 248, 0.08)' : 'transparent',
              borderRadius: '8px',
              cursor: 'pointer',
              borderTop: 'none',
              borderRight: 'none',
              borderBottom: 'none',
              transition: 'all 0.2s'
            }}
            title="Profil Menüsü"
          >
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(56, 189, 248, 0.4)' }}
            />
            <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', lineHeight: 1.2 }}>
                {currentUser.name}
              </span>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>
                {currentUser.title || currentUser.role}
              </span>
            </div>
            <ChevronDown size={14} color="var(--text-muted)" style={{ transform: profileOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
          </button>

          {/* Profil Dropdown Popover */}
          {profileOpen && (
            <div style={{
              position: 'absolute',
              top: 'calc(100% + 8px)',
              right: 0,
              width: '240px',
              background: 'var(--card-bg, #1e293b)',
              border: '1px solid var(--border-color)',
              borderRadius: '12px',
              boxShadow: '0 12px 30px rgba(0, 0, 0, 0.35)',
              zIndex: 100,
              overflow: 'hidden',
              animation: 'fadeIn 0.15s ease'
            }}>
              {/* Popover Üst Kullanıcı Kartı */}
              <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border-color)', background: 'rgba(15, 23, 42, 0.4)' }}>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-main)' }}>
                  {currentUser.name}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  {currentUser.email}
                </div>
                <div style={{ marginTop: '8px' }}>
                  <span style={{
                    display: 'inline-block',
                    padding: '2px 8px',
                    borderRadius: '6px',
                    fontSize: '0.7rem',
                    fontWeight: 600,
                    background: currentUser.role === 'admin' ? 'rgba(56, 189, 248, 0.15)' : currentUser.role === 'araci' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                    color: currentUser.role === 'admin' ? '#38bdf8' : currentUser.role === 'araci' ? '#10b981' : '#f59e0b'
                  }}>
                    {currentUser.role === 'admin' ? '👑 Yönetici' : currentUser.role === 'araci' ? '🤝 İş Ortağı' : '🏢 Müşteri'}
                  </span>
                </div>
              </div>

              {/* Menü Seçenekleri */}
              <div style={{ padding: '6px' }}>
                <button
                  onClick={() => {
                    setProfileOpen(false);
                    if (onOpenEditProfile) onOpenEditProfile();
                  }}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-main)',
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'background 0.15s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <UserCog size={16} color="#38bdf8" />
                  <span style={{ fontWeight: 500 }}>Profili Düzenle</span>
                </button>

                <div style={{ height: '1px', background: 'var(--border-color)', margin: '4px 0' }} />

                <button
                  onClick={handleLogout}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    background: 'transparent',
                    border: 'none',
                    color: '#ef4444',
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'background 0.15s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <LogOut size={16} color="#ef4444" />
                  <span style={{ fontWeight: 600 }}>Çıkış Yap</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
