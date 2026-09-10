import React from 'react';
import {
  LayoutDashboard,
  Users,
  CheckSquare,
  CopyCheck,
  History,
  Settings,
  Sparkles,
  FolderOpen,
  MessageSquareText,
  X,
  UserCog,
  LogOut,
  UserCheck,
  CalendarRange
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function Sidebar({ isOpen, onClose, onOpenEditProfile }) {
  const {
    activePage,
    setActivePage,
    currentUser,
    data,
    getAccessibleCustomers,
    logout
  } = useApp();

  const accessibleCustomers = getAccessibleCustomers();
  const accessibleCustomerIds = new Set(accessibleCustomers.map(c => c.id));
  const activeTasks = data.tasks.filter(t => !t.isCompleted && accessibleCustomerIds.has(t.customerId));

  const isCustomer = currentUser.role === 'musteri';

  const handleNavClick = (page) => {
    setActivePage(page);
    if (onClose) onClose();
  };

  return (
    <>
      {/* Mobil Karartma Perdesi */}
      {isOpen && (
        <div
          onClick={onClose}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.6)',
            zIndex: 35,
            backdropFilter: 'blur(2px)'
          }}
        />
      )}

      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        {/* Marka / Logo */}
        <div className="sidebar-header" style={{ justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div className="brand-logo">
              <Sparkles size={22} />
            </div>
            <div className="brand-info">
              <h1>AVDENS WORK</h1>
              <span>Proje & İş Takip</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="mobile-close-btn"
            style={{ display: 'none', color: '#94a3b8' }}
            title="Kapat"
          >
            <X size={20} />
          </button>
        </div>

      {/* Navigasyon Menüsü */}
      <nav className="sidebar-nav">
        {!isCustomer ? (
          <>
            <div className="nav-section-title">YÖNETİM</div>

            <button
              className={`nav-item ${activePage === 'dashboard' ? 'active' : ''}`}
              onClick={() => handleNavClick('dashboard')}
            >
              <LayoutDashboard size={18} />
              <span>Dashboard</span>
            </button>

            <button
              className={`nav-item ${activePage === 'customers' || activePage === 'customer-detail' ? 'active' : ''}`}
              onClick={() => handleNavClick('customers')}
            >
              <Users size={18} />
              <span>Müşteriler</span>
              <span className="nav-badge">{accessibleCustomers.length}</span>
            </button>

            <button
              className={`nav-item ${activePage === 'tasks' ? 'active' : ''}`}
              onClick={() => handleNavClick('tasks')}
            >
              <CheckSquare size={18} />
              <span>Görevler</span>
              <span className="nav-badge">{activeTasks.length}</span>
            </button>

            <button
              className={`nav-item ${activePage === 'content-calendar' ? 'active' : ''}`}
              onClick={() => handleNavClick('content-calendar')}
            >
              <CalendarRange size={18} />
              <span>İçerik Takvimi</span>
              <span className="nav-badge" style={{ background: 'rgba(236, 72, 153, 0.15)', color: '#ec4899' }}>
                {(data.contentPosts || []).filter(p => accessibleCustomerIds.has(p.customerId)).length}
              </span>
            </button>

            {currentUser.role === 'admin' && (
              <>
                <button
                  className={`nav-item ${activePage === 'templates' ? 'active' : ''}`}
                  onClick={() => handleNavClick('templates')}
                >
                  <CopyCheck size={18} />
                  <span>Görev Şablonları</span>
                </button>

                <button
                  className={`nav-item ${activePage === 'users' ? 'active' : ''}`}
                  onClick={() => handleNavClick('users')}
                >
                  <UserCheck size={18} />
                  <span>Ekip & Yetkililer</span>
                  <span className="nav-badge" style={{ background: 'rgba(139, 92, 246, 0.15)', color: '#8b5cf6' }}>{data.users.length}</span>
                </button>
              </>
            )}

            <button
              className={`nav-item ${activePage === 'activities' ? 'active' : ''}`}
              onClick={() => handleNavClick('activities')}
            >
              <History size={18} />
              <span>Son Aktiviteler</span>
            </button>

            {currentUser.role === 'admin' && (
              <>
                <div className="nav-section-title">SİSTEM</div>

                <button
                  className={`nav-item ${activePage === 'settings' ? 'active' : ''}`}
                  onClick={() => handleNavClick('settings')}
                >
                  <Settings size={18} />
                  <span>Ayarlar & Veri</span>
                </button>
              </>
            )}
          </>
        ) : (
          <>
            <div className="nav-section-title">MÜŞTERİ PANELİ</div>

            <button
              className={`nav-item ${activePage === 'dashboard' || activePage === 'customer-detail' ? 'active' : ''}`}
              onClick={() => handleNavClick('dashboard')}
            >
              <LayoutDashboard size={18} />
              <span>Proje İlerleme Durumu</span>
            </button>

            <button
              className={`nav-item ${activePage === 'tasks' ? 'active' : ''}`}
              onClick={() => handleNavClick('tasks')}
            >
              <CheckSquare size={18} />
              <span>Yapılan & Bekleyen İşler</span>
            </button>

            <button
              className={`nav-item ${activePage === 'content-calendar' ? 'active' : ''}`}
              onClick={() => handleNavClick('content-calendar')}
            >
              <CalendarRange size={18} />
              <span>İçerik Takvimi & Onaylar</span>
              {(() => {
                const myPending = (data.contentPosts || []).filter(p => p.customerId === currentUser.customerId && p.status === 'onay_bekliyor').length;
                return myPending > 0 ? (
                  <span className="nav-badge" style={{ background: '#fef3c7', color: '#b45309', fontWeight: 700 }}>
                    {myPending} Bekleyen
                  </span>
                ) : null;
              })()}
            </button>

            <button
              className={`nav-item ${activePage === 'files' ? 'active' : ''}`}
              onClick={() => handleNavClick('files')}
            >
              <FolderOpen size={18} />
              <span>Proje Dosyaları</span>
            </button>

            <button
              className={`nav-item ${activePage === 'comments' ? 'active' : ''}`}
              onClick={() => handleNavClick('comments')}
            >
              <MessageSquareText size={18} />
              <span>Geri Bildirim / Yorum</span>
            </button>
          </>
        )}
      </nav>

      {/* Alt Kullanıcı Bilgisi ve Hızlı İşlemler (Madde 1) */}
      <div className="sidebar-footer">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', gap: '8px' }}>
          <div
            className="user-snippet"
            onClick={onOpenEditProfile}
            style={{ flex: 1, minWidth: 0, cursor: 'pointer', padding: '4px', borderRadius: '8px', transition: 'background 0.15s' }}
            title="Profili Düzenlemek İçin Tıklayın"
          >
            <img
              src={currentUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
              alt={currentUser.name}
              className="user-avatar"
              onError={(e) => {
                e.target.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150';
              }}
            />
            <div className="user-details" style={{ overflow: 'hidden' }}>
              <h4 style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{currentUser.name}</h4>
              <span>
                {currentUser.role === 'admin'
                  ? '👑 Yönetici'
                  : currentUser.role === 'araci'
                  ? '🤝 İş Ortağı'
                  : '🏢 Müşteri'}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <button
              onClick={onOpenEditProfile}
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid var(--border-color)',
                borderRadius: '6px',
                padding: '6px',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.15s'
              }}
              title="Profili Düzenle"
              onMouseEnter={(e) => { e.currentTarget.style.color = '#38bdf8'; e.currentTarget.style.borderColor = '#38bdf8'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.borderColor = 'var(--border-color)'; }}
            >
              <UserCog size={15} />
            </button>

            <button
              onClick={() => {
                if (window.confirm('Oturumunuz kapatılacaktır. Emin misiniz?')) {
                  logout();
                }
              }}
              style={{
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.25)',
                borderRadius: '6px',
                padding: '6px',
                color: '#ef4444',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.15s'
              }}
              title="Çıkış Yap"
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.25)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'; }}
            >
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </div>
    </aside>
  </>
  );
}
