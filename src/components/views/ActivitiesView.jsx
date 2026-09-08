import React, { useState } from 'react';
import {
  History,
  CheckCircle2,
  MessageCircle,
  Key,
  Sparkles,
  Filter,
  Building2,
  Calendar
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function ActivitiesView() {
  const { data, currentUser, getAccessibleCustomers, setSelectedCustomerId, setActivePage } = useApp();

  const [filterType, setFilterType] = useState('all');
  const [filterCustomer, setFilterCustomer] = useState('all');

  const accessibleCustomers = getAccessibleCustomers();
  const accessibleCustomerIds = new Set(accessibleCustomers.map(c => c.id));

  const filteredActivities = data.activities.filter(act => {
    // Rol bazlı izolasyon: Aracı yalnızca kendi müşterilerinin aktivitelerini görebilir
    if (currentUser.role !== 'admin') {
      if (!act.customerId || !accessibleCustomerIds.has(act.customerId)) return false;
    }
    if (filterType !== 'all' && act.type !== filterType) return false;
    if (filterCustomer !== 'all' && act.customerId !== filterCustomer) return false;
    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

      {/* Başlık */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-md)', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <History size={22} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
              Son Aktiviteler & Sistem Kütüğü (Madde 16)
            </h2>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Sistemde yapılan tüm görev tamamlama, not, şifre ve yorum hareketleri
            </span>
          </div>
        </div>
      </div>

      {/* Filtre Çubuğu */}
      <div className="card" style={{ padding: '14px 20px', display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>Müşteri:</span>
          <select
            className="form-select"
            style={{ padding: '6px 12px', fontSize: '0.82rem', width: 'auto' }}
            value={filterCustomer}
            onChange={(e) => setFilterCustomer(e.target.value)}
          >
            <option value="all">Tüm Müşteriler</option>
            {accessibleCustomers.map(c => (
              <option key={c.id} value={c.id}>{c.companyName}</option>
            ))}
          </select>
        </div>

        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {[
            { id: 'all', label: 'Tüm Aktiviteler' },
            { id: 'task_completed', label: '✓ Tamamlanan Görevler' },
            { id: 'comment', label: '💬 Yorumlar' },
            { id: 'credential', label: '🔑 Hesap Bilgileri' }
          ].map(tab => (
            <button
              key={tab.id}
              className={`btn btn-sm ${filterType === tab.id ? 'btn-primary' : 'btn-secondary'}`}
              style={{ fontSize: '0.78rem' }}
              onClick={() => setFilterType(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Aktivite Zaman Akışı */}
      <div className="card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {filteredActivities.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
              Seçilen kriterlere uygun aktivite kaydı bulunamadı.
            </div>
          ) : (
            filteredActivities.map((act) => (
              <div
                key={act.id}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '14px',
                  borderBottom: '1px solid var(--border-subtle)',
                  paddingBottom: '14px'
                }}
              >
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: '50%',
                    backgroundColor:
                      act.type === 'task_completed' ? 'var(--success-light)' :
                      act.type === 'comment' ? 'var(--primary-light)' :
                      act.type === 'credential' ? 'var(--warning-light)' : '#f1f5f9',
                    color:
                      act.type === 'task_completed' ? 'var(--success)' :
                      act.type === 'comment' ? 'var(--primary)' :
                      act.type === 'credential' ? 'var(--warning)' : 'var(--text-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    marginTop: '2px'
                  }}
                >
                  {act.type === 'task_completed' ? <CheckCircle2 size={18} /> :
                   act.type === 'comment' ? <MessageCircle size={18} /> :
                   act.type === 'credential' ? <Key size={18} /> :
                   <Sparkles size={18} />}
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.9rem', color: 'var(--text-main)', fontWeight: 600 }}>
                      {act.userName}
                    </span>
                    <span style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                      {act.actionText}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '4px', fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                    <span
                      onClick={() => {
                        if (act.customerId) {
                          setSelectedCustomerId(act.customerId);
                          setActivePage('customer-detail');
                        }
                      }}
                      style={{ color: 'var(--primary)', fontWeight: 600, cursor: 'pointer' }}
                    >
                      🏢 {act.customerName}
                    </span>
                    <span>•</span>
                    <span>📅 {new Date(act.createdAt).toLocaleString('tr-TR', { dateStyle: 'medium', timeStyle: 'short' })}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
}
