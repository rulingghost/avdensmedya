import React, { useState } from 'react';
import {
  Users,
  CheckSquare,
  CheckCircle2,
  Clock,
  CalendarCheck,
  AlertTriangle,
  UserPlus,
  PlusCircle,
  FileText,
  UploadCloud,
  ArrowRight,
  TrendingUp,
  Sparkles,
  ChevronRight,
  Check,
  Building2
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function DashboardView({ onOpenQuickAction }) {
  const {
    data,
    currentUser,
    toggleTask,
    getCustomerProgress,
    getAccessibleCustomers,
    setSelectedCustomerId,
    setActivePage
  } = useApp();

  const [activeSummaryTab, setActiveSummaryTab] = useState('today'); // 'today' | 'overdue' | 'waiting' | 'week' | 'completed'

  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  const currentMonthStr = todayStr.substring(0, 7);
  const next7DaysStr = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const currentMonthName = now.toLocaleString('tr-TR', { month: 'long', year: 'numeric' });

  // Rol Bazlı Veri İzolasyonu (Aracı yalnızca kendi müşterilerinin verilerini görür)
  const accessibleCustomers = getAccessibleCustomers();
  const accessibleCustomerIds = new Set(accessibleCustomers.map(c => c.id));
  const relevantTasks = currentUser.role === 'admin'
    ? data.tasks
    : data.tasks.filter(t => accessibleCustomerIds.has(t.customerId));

  // KPI Hesaplamaları
  const totalCustomers = accessibleCustomers.length;
  const activeTasks = relevantTasks.filter(t => !t.isCompleted);
  const completedTasks = relevantTasks.filter(t => t.isCompleted);
  const waitingTasks = relevantTasks.filter(t => !t.isCompleted && (t.status === 'beklemede' || t.waitingForClient));
  const thisMonthCompleted = relevantTasks.filter(t => t.isCompleted && t.completedAt && t.completedAt.startsWith(currentMonthStr));
  const overdueTasks = relevantTasks.filter(t => !t.isCompleted && t.dueDate && t.dueDate < todayStr);

  // Özet Filtreleri
  const todayTasks = relevantTasks.filter(t => !t.isCompleted && (t.dueDate === todayStr || t.startDate === todayStr));
  const waitingForClientTasks = relevantTasks.filter(t => !t.isCompleted && t.waitingForClient);
  const thisWeekTasks = relevantTasks.filter(t => !t.isCompleted && t.dueDate >= todayStr && t.dueDate <= next7DaysStr);
  const recentCompletedTasks = relevantTasks.filter(t => t.isCompleted).slice(0, 8);

  const handleCustomerClick = (customerId) => {
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
    <div className="dashboard-container" style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>

      {/* Karşılama ve Hızlı Eylem Banner'ı */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
          background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
          padding: '24px 28px',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-color)',
          boxShadow: 'var(--shadow-xs)'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '1.4rem' }}>👋</span>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
              Hoş Geldiniz, {currentUser.name}
            </h2>
            <span className="badge badge-aktif" style={{ marginLeft: '4px' }}>
              {currentUser.title || currentUser.role}
            </span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginTop: '4px' }}>
            Bugün aktif <strong>{activeTasks.length}</strong> iş ve <strong>{waitingForClientTasks.length}</strong> müşteriden beklenen onay bulunuyor.
          </p>
        </div>

        {/* Hızlı İşlem Düğmeleri (Madde 28) */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button className="btn btn-primary btn-sm" onClick={onOpenQuickAction}>
            <PlusCircle size={16} />
            <span>Yeni Görev</span>
          </button>
          <button className="btn btn-secondary btn-sm" onClick={onOpenQuickAction}>
            <UserPlus size={16} />
            <span>Yeni Müşteri</span>
          </button>
          <button className="btn btn-secondary btn-sm" onClick={onOpenQuickAction}>
            <FileText size={16} />
            <span>Not Ekle</span>
          </button>
          <button className="btn btn-secondary btn-sm" onClick={() => alert('Dosya Yükleme: Müşteri detay ekranındaki Dosyalar sekmesinden hızlıca yükleyebilirsiniz.')}>
            <UploadCloud size={16} />
            <span>Dosya Yükle</span>
          </button>
        </div>
      </div>

      {/* 6 KPI SAYAÇ KARTI (Madde 2: Toplam Müşteri, Aktif, Tamamlanan, Bekleyen, Bu Ay, Geciken) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '16px'
        }}
      >
        {/* 1. Toplam Müşteri */}
        <div className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)' }}>Toplam Müşteri</span>
            <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
              <Users size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1 }}>
            {totalCustomers}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ color: 'var(--success)', fontWeight: 600 }}>● {accessibleCustomers.filter(c => c.status === 'aktif').length} Aktif</span>
            <span>portföyde</span>
          </div>
        </div>

        {/* 2. Aktif İşler */}
        <div className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)' }}>Aktif İşler</span>
            <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', background: '#f5f3ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--purple)' }}>
              <CheckSquare size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1 }}>
            {activeTasks.length}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Devam eden operasyonlar
          </div>
        </div>

        {/* 3. Tamamlanan İşler */}
        <div className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)' }}>Tamamlanan İşler</span>
            <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', background: 'var(--success-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--success)' }}>
              <CheckCircle2 size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1 }}>
            {completedTasks.length}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--success-text)', fontWeight: 600 }}>
            Toplam %{Math.round((completedTasks.length / (relevantTasks.length || 1)) * 100)} başarı
          </div>
        </div>

        {/* 4. Bekleyen İşler */}
        <div className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)' }}>Bekleyen İşler</span>
            <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', background: 'var(--warning-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--warning)' }}>
              <Clock size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1 }}>
            {waitingTasks.length}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--warning-text)', fontWeight: 600 }}>
            {waitingForClientTasks.length} müşteriden bekleniyor
          </div>
        </div>

        {/* 5. Bu Ay Tamamlanan */}
        <div className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)' }}>Bu Ay Tamamlanan</span>
            <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', background: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#059669' }}>
              <CalendarCheck size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1 }}>
            {thisMonthCompleted.length}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {currentMonthName} performansı
          </div>
        </div>

        {/* 6. Geciken İşler */}
        <div className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)' }}>Geciken İşler</span>
            <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', background: 'var(--danger-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--danger)' }}>
              <AlertTriangle size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: overdueTasks.length > 0 ? 'var(--danger)' : 'var(--text-main)', lineHeight: 1 }}>
            {overdueTasks.length}
          </div>
          <div style={{ fontSize: '0.75rem', color: overdueTasks.length > 0 ? 'var(--danger-text)' : 'var(--text-muted)', fontWeight: 600 }}>
            {overdueTasks.length > 0 ? 'Acil aksiyon gerekli' : 'Geciken iş yok ✓'}
          </div>
        </div>
      </div>

      {/* ORTA BÖLÜM: YÖNETİCİ ÖZET EKRANI (Madde 25) & SON AKTİVİTELER (Madde 2/16) */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>

        {/* Sol: Yönetici Özet Alanı (Sekmeli Yapı) */}
        <div className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)' }}>
                Yönetici Operasyon Takip Merkezi
              </h3>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Önemli işleri tek tıkla inceleyin ve görev durumunu checkbox ile güncelleyin
              </span>
            </div>

            {/* Özet Sekmeleri */}
            <div style={{ display: 'flex', gap: '6px', background: 'var(--bg-app)', padding: '4px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
              <button
                className={`btn btn-sm ${activeSummaryTab === 'today' ? 'btn-primary' : ''}`}
                style={{ fontSize: '0.78rem', padding: '6px 10px', background: activeSummaryTab === 'today' ? 'var(--primary)' : 'transparent', color: activeSummaryTab === 'today' ? '#ffffff' : 'var(--text-muted)' }}
                onClick={() => setActiveSummaryTab('today')}
              >
                Bugün ({todayTasks.length})
              </button>
              <button
                className={`btn btn-sm ${activeSummaryTab === 'waiting' ? 'btn-primary' : ''}`}
                style={{ fontSize: '0.78rem', padding: '6px 10px', background: activeSummaryTab === 'waiting' ? '#c2410c' : 'transparent', color: activeSummaryTab === 'waiting' ? '#ffffff' : 'var(--text-muted)' }}
                onClick={() => setActiveSummaryTab('waiting')}
              >
                Müşteriden Beklenen ({waitingForClientTasks.length})
              </button>
              <button
                className={`btn btn-sm ${activeSummaryTab === 'overdue' ? 'btn-primary' : ''}`}
                style={{ fontSize: '0.78rem', padding: '6px 10px', background: activeSummaryTab === 'overdue' ? 'var(--danger)' : 'transparent', color: activeSummaryTab === 'overdue' ? '#ffffff' : 'var(--text-muted)' }}
                onClick={() => setActiveSummaryTab('overdue')}
              >
                Geciken ({overdueTasks.length})
              </button>
              <button
                className={`btn btn-sm ${activeSummaryTab === 'week' ? 'btn-primary' : ''}`}
                style={{ fontSize: '0.78rem', padding: '6px 10px', background: activeSummaryTab === 'week' ? 'var(--purple)' : 'transparent', color: activeSummaryTab === 'week' ? '#ffffff' : 'var(--text-muted)' }}
                onClick={() => setActiveSummaryTab('week')}
              >
                Bu Hafta ({thisWeekTasks.length})
              </button>
              <button
                className={`btn btn-sm ${activeSummaryTab === 'completed' ? 'btn-primary' : ''}`}
                style={{ fontSize: '0.78rem', padding: '6px 10px', background: activeSummaryTab === 'completed' ? 'var(--success)' : 'transparent', color: activeSummaryTab === 'completed' ? '#ffffff' : 'var(--text-muted)' }}
                onClick={() => setActiveSummaryTab('completed')}
              >
                Tamamlanan ({recentCompletedTasks.length})
              </button>
            </div>
          </div>

          {/* Görev Listesi Gösterimi */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', minHeight: '340px' }}>
            {(() => {
              let currentList = [];
              if (activeSummaryTab === 'today') currentList = todayTasks;
              else if (activeSummaryTab === 'waiting') currentList = waitingForClientTasks;
              else if (activeSummaryTab === 'overdue') currentList = overdueTasks;
              else if (activeSummaryTab === 'week') currentList = thisWeekTasks;
              else if (activeSummaryTab === 'completed') currentList = recentCompletedTasks;

              if (currentList.length === 0) {
                return (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '280px', color: 'var(--text-muted)', textAlign: 'center' }}>
                    <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--bg-app)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
                      <CheckCircle2 size={24} color="var(--success)" />
                    </div>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)' }}>Bu filtrede listelenecek görev bulunmuyor</h4>
                    <p style={{ fontSize: '0.82rem', marginTop: '4px' }}>Tüm işler planlandığı gibi ilerliyor.</p>
                  </div>
                );
              }

              return currentList.map((task) => {
                const customer = data.customers.find(c => c.id === task.customerId);
                const category = data.categories.find(c => c.id === task.categoryId);

                return (
                  <div
                    key={task.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px 16px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-color)',
                      backgroundColor: task.isCompleted ? 'var(--bg-app)' : '#ffffff',
                      transition: 'var(--transition)'
                    }}
                  >
                    {/* Checkbox */}
                    <div
                      className={`custom-checkbox ${task.isCompleted ? 'checked' : ''}`}
                      onClick={() => {
                        if (currentUser.role !== 'musteri') {
                          toggleTask(task.id);
                        }
                      }}
                      style={{ cursor: currentUser.role === 'musteri' ? 'default' : 'pointer' }}
                      title={currentUser.role === 'musteri' ? 'Görev Durumu' : task.isCompleted ? 'Görevi tekrar aç' : 'Görevi tamamlandı olarak işaretle'}
                    >
                      {task.isCompleted && <Check size={14} strokeWidth={3} />}
                    </div>

                    {/* Görev Başlığı ve Detayı */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <span
                          style={{
                            fontSize: '0.9rem',
                            fontWeight: 600,
                            color: task.isCompleted ? 'var(--text-muted)' : 'var(--text-main)',
                            textDecoration: task.isCompleted ? 'line-through' : 'none'
                          }}
                        >
                          {task.title}
                        </span>

                        {customer && (
                          <span
                            onClick={() => handleCustomerClick(customer.id)}
                            style={{
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              color: 'var(--primary)',
                              backgroundColor: 'var(--primary-light)',
                              padding: '2px 8px',
                              borderRadius: 'var(--radius-sm)',
                              cursor: 'pointer'
                            }}
                          >
                            🏢 {customer.companyName}
                          </span>
                        )}

                        {category && (
                          <span
                            style={{
                              fontSize: '0.72rem',
                              fontWeight: 600,
                              color: category.color,
                              backgroundColor: `${category.color}15`,
                              padding: '2px 8px',
                              borderRadius: 'var(--radius-sm)'
                            }}
                          >
                            {category.name}
                          </span>
                        )}

                        {task.waitingForClient && (
                          <span className="badge-waiting-client">
                            ⚠️ {task.waitingReason || 'Müşteriden Bekleniyor'}
                          </span>
                        )}
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginTop: '6px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        <span>👤 Sorumlu: <strong>{task.assignedTo}</strong></span>
                        <span>📅 Son Tarih: {task.dueDate}</span>
                        {task.isCompleted && task.completedBy && (
                          <span style={{ color: 'var(--success)', fontWeight: 600 }}>
                            ✓ {task.completedBy} tarafından tamamlandı
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Öncelik Rozeti */}
                    <span className={`badge badge-priority-${task.priority}`}>
                      {task.priority === 'acil' ? '⚡ Acil' : task.priority === 'yuksek' ? 'Yüksek' : task.priority === 'normal' ? 'Normal' : 'Düşük'}
                    </span>
                  </div>
                );
              });
            })()}
          </div>
        </div>

        {/* Sağ: Son Aktiviteler Akışı (Madde 2 & Madde 16) */}
        <div className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)' }}>
              Son Aktiviteler
            </h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Canlı Akış</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', overflowY: 'auto', maxHeight: '420px', paddingRight: '4px' }}>
            {data.activities.slice(0, 7).map((act) => (
              <div key={act.id} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    background:
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
                  {act.type === 'task_completed' ? <CheckCircle2 size={16} /> :
                   act.type === 'comment' ? <TrendingUp size={16} /> :
                   <Sparkles size={16} />}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-main)', lineHeight: 1.4 }}>
                    <strong>{act.userName}</strong>: {act.actionText}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '2px' }}>
                    {act.customerName} • {new Date(act.createdAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* ALT BÖLÜM: MÜŞTERİ KARTLARI ÖZETİ (Madde 23) */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)' }}>
              Müşteri Projeleri & İlerleme Kartları
            </h3>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Tüm müşterilerin tamamlanma oranları ve proje özetleri
            </span>
          </div>

          <button
            className="btn btn-secondary btn-sm"
            onClick={() => setActivePage('customers')}
          >
            <span>Tüm Müşterileri Gör</span>
            <ChevronRight size={16} />
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '18px' }}>
          {data.customers.map((cust) => {
            const prog = getCustomerProgress(cust.id);
            return (
              <div
                key={cust.id}
                className="card"
                style={{
                  padding: '22px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px',
                  position: 'relative',
                  cursor: 'pointer',
                  borderTop: `4px solid ${prog.percentage === 100 ? 'var(--success)' : prog.percentage > 50 ? 'var(--primary)' : 'var(--warning)'}`
                }}
                onClick={() => handleCustomerClick(cust.id)}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                  <div>
                    <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)' }}>
                      {cust.companyName}
                    </h4>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {cust.projectTitle}
                    </span>
                  </div>
                  <span className={`badge badge-${cust.status}`}>
                    {cust.status === 'aktif' ? 'Aktif' : cust.status === 'beklemede' ? 'Beklemede' : cust.status === 'tamamlandi' ? 'Tamamlandı' : 'Pasif'}
                  </span>
                </div>

                {/* İlerleme Barı (Madde 17 & 23) */}
                <div className="progress-container">
                  <div className="progress-info">
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                      {prog.completed} / {prog.total} İş Tamamlandı
                    </span>
                    <span style={{ color: 'var(--primary)', fontWeight: 800 }}>
                      %{prog.percentage}
                    </span>
                  </div>
                  <div className="progress-track">
                    <div
                      className={`progress-fill ${getProgressClass(prog.percentage)}`}
                      style={{ width: `${prog.percentage}%` }}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '10px', borderTop: '1px solid var(--border-subtle)', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  <span>Aracı: <strong>{cust.partnerName}</strong></span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--primary)', fontWeight: 600 }}>
                    <span>Projeyi Aç</span>
                    <ArrowRight size={14} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
