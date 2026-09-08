import React, { useState } from 'react';
import {
  Users,
  LayoutGrid,
  List,
  Search,
  Plus,
  Phone,
  Mail,
  ExternalLink,
  ArrowRight,
  Sparkles,
  Building2,
  Calendar,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import NewCustomerModal from '../modals/NewCustomerModal';

export default function CustomersView() {
  const {
    data,
    getCustomerProgress,
    getAccessibleCustomers,
    setSelectedCustomerId,
    setActivePage,
    searchQuery,
    setSearchQuery,
    currentUser,
    assignPartnerToCustomer
  } = useApp();

  const [viewMode, setViewMode] = useState('table'); // 'table' | 'card'
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'aktif' | 'beklemede' | 'tamamlandi' | 'pasif'
  const [isNewCustomerModalOpen, setIsNewCustomerModalOpen] = useState(false);

  const accessibleCustomers = getAccessibleCustomers();

  // Filtreleme mantığı (Arama + Durum filtresi)
  const filteredCustomers = accessibleCustomers.filter((cust) => {
    const matchesStatus = statusFilter === 'all' ? true : cust.status === statusFilter;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q || (
      cust.companyName?.toLowerCase().includes(q) ||
      cust.contactPerson?.toLowerCase().includes(q) ||
      cust.phone?.toLowerCase().includes(q) ||
      cust.email?.toLowerCase().includes(q) ||
      cust.partnerName?.toLowerCase().includes(q)
    );
    return matchesStatus && matchesSearch;
  });

  const handleCustomerDetail = (customerId) => {
    setSelectedCustomerId(customerId);
    setActivePage('customer-detail');
  };

  const getProgressClass = (pct) => {
    if (pct < 30) return 'progress-low';
    if (pct < 70) return 'progress-mid';
    if (pct < 100) return 'progress-high';
    return 'progress-full';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

      {/* Üst Başlık & Eylemler */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-md)', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
              <Building2 size={22} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
                Müşteri Yönetimi
              </h2>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                Toplam {accessibleCustomers.length} müşteri kayıtlı • Detaylı iş ve süreç takibi
              </span>
            </div>
          </div>
        </div>

        {/* Yeni Müşteri Butonu (Admin için) */}
        {currentUser.role !== 'musteri' && (
          <button
            className="btn btn-primary"
            onClick={() => setIsNewCustomerModalOpen(true)}
          >
            <Plus size={18} />
            <span>Yeni Müşteri Ekle</span>
          </button>
        )}
      </div>

      {/* Kontrol Çubuğu: Filtreler, Arama & Görünüm Değiştirici */}
      <div
        className="card"
        style={{
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px'
        }}
      >
        {/* Durum Filtre Butonları */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {[
            { id: 'all', label: 'Tümü' },
            { id: 'aktif', label: 'Aktif' },
            { id: 'beklemede', label: 'Beklemede' },
            { id: 'tamamlandi', label: 'Tamamlandı' },
            { id: 'pasif', label: 'Pasif' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`btn btn-sm ${statusFilter === tab.id ? 'btn-primary' : 'btn-secondary'}`}
              style={{ fontSize: '0.82rem' }}
            >
              {tab.label}
              {tab.id !== 'all' && (
                <span style={{ opacity: 0.8, marginLeft: '4px', fontSize: '0.75rem' }}>
                  ({accessibleCustomers.filter(c => c.status === tab.id).length})
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Görünüm Değiştirici (Tablo vs Kart) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ display: 'flex', background: 'var(--bg-app)', padding: '3px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            <button
              onClick={() => setViewMode('table')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.8rem',
                fontWeight: 600,
                background: viewMode === 'table' ? '#ffffff' : 'transparent',
                color: viewMode === 'table' ? 'var(--primary)' : 'var(--text-muted)',
                boxShadow: viewMode === 'table' ? 'var(--shadow-xs)' : 'none'
              }}
            >
              <List size={16} />
              <span>Tablo</span>
            </button>

            <button
              onClick={() => setViewMode('card')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.8rem',
                fontWeight: 600,
                background: viewMode === 'card' ? '#ffffff' : 'transparent',
                color: viewMode === 'card' ? 'var(--primary)' : 'var(--text-muted)',
                boxShadow: viewMode === 'card' ? 'var(--shadow-xs)' : 'none'
              }}
            >
              <LayoutGrid size={16} />
              <span>Kartlar</span>
            </button>
          </div>
        </div>
      </div>

      {/* MÜŞTERİ LİSTESİ - TABLO GÖRÜNÜMÜ (Madde 3) */}
      {viewMode === 'table' && (
        <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ background: 'var(--bg-app)', borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  <th style={{ padding: '14px 20px' }}>Firma Adı</th>
                  <th style={{ padding: '14px 20px' }}>Yetkili Kişi</th>
                  <th style={{ padding: '14px 20px' }}>İletişim</th>
                  <th style={{ padding: '14px 20px' }}>Aracı</th>
                  <th style={{ padding: '14px 20px', textAlign: 'center' }}>Aktif İş</th>
                  <th style={{ padding: '14px 20px', minWidth: '180px' }}>Tamamlanma Oranı</th>
                  <th style={{ padding: '14px 20px' }}>Durum</th>
                  <th style={{ padding: '14px 20px', textAlign: 'right' }}>İşlem</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
                      Eşleşen müşteri bulunamadı.
                    </td>
                  </tr>
                ) : (
                  filteredCustomers.map((cust) => {
                    const prog = getCustomerProgress(cust.id);
                    const custActiveTasks = data.tasks.filter(t => t.customerId === cust.id && !t.isCompleted);

                    return (
                      <tr
                        key={cust.id}
                        style={{
                          borderBottom: '1px solid var(--border-subtle)',
                          transition: 'var(--transition)'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-app)'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        {/* Firma Adı & Proje Başlığı */}
                        <td style={{ padding: '16px 20px' }}>
                          <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>
                            {cust.companyName}
                          </div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                            {cust.projectTitle || 'Genel Proje'}
                          </div>
                        </td>

                        {/* Yetkili Kişi */}
                        <td style={{ padding: '16px 20px', color: 'var(--text-main)', fontWeight: 500 }}>
                          {cust.contactPerson || '—'}
                        </td>

                        {/* Telefon & E-posta */}
                        <td style={{ padding: '16px 20px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem' }}>
                            <Phone size={13} color="var(--text-muted)" />
                            <span>{cust.phone}</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                            <Mail size={13} />
                            <span>{cust.email}</span>
                          </div>
                        </td>

                        {/* Aracı (Admin Atayabilir) */}
                        <td style={{ padding: '16px 20px' }}>
                          {currentUser.role === 'admin' ? (
                            <select
                              value={cust.partnerId || ''}
                              onChange={(e) => assignPartnerToCustomer(cust.id, e.target.value)}
                              className="form-select"
                              style={{
                                fontSize: '0.8rem',
                                padding: '4px 8px',
                                borderRadius: 'var(--radius-sm)',
                                fontWeight: 600,
                                color: cust.partnerId ? 'var(--primary)' : 'var(--text-muted)',
                                background: '#ffffff',
                                border: '1px solid var(--border-color)',
                                maxWidth: '170px',
                                cursor: 'pointer'
                              }}
                              title="Admin: Müşteriyi bir aracıya atayın veya değiştirin"
                            >
                              <option value="">-- Atanmadı (Doğrudan) --</option>
                              {data.users.filter(u => u.role === 'araci').map((u) => (
                                <option key={u.id} value={u.id}>
                                  {u.name} (Aracı)
                                </option>
                              ))}
                            </select>
                          ) : (
                            <span style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '0.84rem' }}>
                              {cust.partnerName || '—'}
                            </span>
                          )}
                        </td>

                        {/* Aktif İş Sayısı */}
                        <td style={{ padding: '16px 20px', textAlign: 'center' }}>
                          <span style={{ fontWeight: 700, padding: '4px 10px', borderRadius: 'var(--radius-full)', background: 'var(--bg-app)', border: '1px solid var(--border-color)', fontSize: '0.82rem' }}>
                            {custActiveTasks.length} İş
                          </span>
                        </td>

                        {/* Tamamlanma Oranı (Progress bar + %) */}
                        <td style={{ padding: '16px 20px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                              {prog.completed} / {prog.total}
                            </span>
                            <span style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--primary)' }}>
                              %{prog.percentage}
                            </span>
                          </div>
                          <div className="progress-track">
                            <div
                              className={`progress-fill ${getProgressClass(prog.percentage)}`}
                              style={{ width: `${prog.percentage}%` }}
                            />
                          </div>
                        </td>

                        {/* Durum Rozeti */}
                        <td style={{ padding: '16px 20px' }}>
                          <span className={`badge badge-${cust.status}`}>
                            {cust.status === 'aktif' ? 'Aktif' :
                             cust.status === 'beklemede' ? 'Beklemede' :
                             cust.status === 'tamamlandi' ? 'Tamamlandı' : 'Pasif'}
                          </span>
                        </td>

                        {/* Detay Butonu (Madde 3 Line 99) */}
                        <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => handleCustomerDetail(cust.id)}
                            style={{ color: 'var(--primary)', borderColor: '#bfdbfe' }}
                          >
                            <span>Detay</span>
                            <ArrowRight size={14} />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MÜŞTERİ LİSTESİ - KART GÖRÜNÜMÜ (Madde 23) */}
      {viewMode === 'card' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px' }}>
          {filteredCustomers.length === 0 ? (
            <div className="card" style={{ gridColumn: '1 / -1', padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
              Arama kriterlerine uygun müşteri bulunamadı.
            </div>
          ) : (
            filteredCustomers.map((cust) => {
              const prog = getCustomerProgress(cust.id);
              const custActiveTasks = data.tasks.filter(t => t.customerId === cust.id && !t.isCompleted);

              return (
                <div
                  key={cust.id}
                  className="card"
                  style={{
                    padding: '24px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '16px',
                    position: 'relative',
                    transition: 'var(--transition)',
                    borderTop: `4px solid ${prog.percentage === 100 ? 'var(--success)' : prog.percentage > 50 ? 'var(--primary)' : 'var(--warning)'}`
                  }}
                >
                  {/* Başlık ve Durum */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                    <div>
                      <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)' }}>
                        {cust.companyName}
                      </h3>
                      <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                        {cust.projectTitle || 'Dijital Yönetim'}
                      </span>
                    </div>

                    <span className={`badge badge-${cust.status}`}>
                      {cust.status === 'aktif' ? 'Aktif' :
                       cust.status === 'beklemede' ? 'Beklemede' :
                       cust.status === 'tamamlandi' ? 'Tamamlandı' : 'Pasif'}
                    </span>
                  </div>

                  {/* İletişim Snippet */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.82rem', color: 'var(--text-muted)', backgroundColor: 'var(--bg-app)', padding: '12px', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Yetkili:</span>
                      <strong style={{ color: 'var(--text-main)' }}>{cust.contactPerson}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Telefon:</span>
                      <span style={{ color: 'var(--text-main)' }}>{cust.phone}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>Aracı:</span>
                      {currentUser.role === 'admin' ? (
                        <select
                          value={cust.partnerId || ''}
                          onChange={(e) => assignPartnerToCustomer(cust.id, e.target.value)}
                          className="form-select"
                          style={{
                            fontSize: '0.78rem',
                            padding: '2px 6px',
                            fontWeight: 600,
                            color: cust.partnerId ? 'var(--primary)' : 'var(--text-muted)',
                            background: '#ffffff',
                            border: '1px solid var(--border-color)',
                            borderRadius: 'var(--radius-sm)',
                            maxWidth: '160px'
                          }}
                        >
                          <option value="">-- Atanmadı --</option>
                          {data.users.filter(u => u.role === 'araci').map((u) => (
                            <option key={u.id} value={u.id}>
                              {u.name} (Aracı)
                            </option>
                          ))}
                        </select>
                      ) : (
                        <strong style={{ color: 'var(--primary)' }}>{cust.partnerName || '—'}</strong>
                      )}
                    </div>
                  </div>

                  {/* İlerleme Çubuğu (Madde 23: 12 / 18 İş Tamamlandı, %67) */}
                  <div className="progress-container">
                    <div className="progress-info">
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                        {prog.completed} / {prog.total} İş Tamamlandı
                      </span>
                      <span style={{ color: 'var(--primary)', fontWeight: 800 }}>
                        %{prog.percentage}
                      </span>
                    </div>
                    <div className="progress-track progress-track-lg">
                      <div
                        className={`progress-fill ${getProgressClass(prog.percentage)}`}
                        style={{ width: `${prog.percentage}%` }}
                      />
                    </div>
                  </div>

                  {/* Alt İşlemler */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '12px', borderTop: '1px solid var(--border-subtle)' }}>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      {custActiveTasks.length} bekleyen iş
                    </span>

                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => handleCustomerDetail(cust.id)}
                    >
                      <span>Projeyi Aç</span>
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Yeni Müşteri Ekleme Modalı */}
      <NewCustomerModal
        isOpen={isNewCustomerModalOpen}
        onClose={() => setIsNewCustomerModalOpen(false)}
      />
    </div>
  );
}
