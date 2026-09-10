import React, { useState } from 'react';
import {
  CheckSquare,
  Plus,
  Filter,
  Search,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Layers,
  Building2,
  Calendar,
  Check,
  Tag,
  User,
  ListChecks,
  Repeat,
  Paperclip
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import TaskDetailModal from '../modals/TaskDetailModal';
import AddTaskModal from '../modals/AddTaskModal';

export default function TasksView() {
  const {
    data,
    toggleTask,
    searchQuery,
    currentUser,
    getAccessibleCustomers,
    setSelectedCustomerId,
    setActivePage
  } = useApp();

  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('all');
  const [selectedCustomerFilter, setSelectedCustomerFilter] = useState('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('all'); // 'all' | 'yapilacak' | 'devam_ediyor' | 'beklemede' | 'tamamlandi' | 'waiting_client'
  const [selectedPriorityFilter, setSelectedPriorityFilter] = useState('all');

  // Modal durumları
  const [selectedTaskForDetail, setSelectedTaskForDetail] = useState(null);
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);

  // Rol Bazlı Yetki Kapsamı
  const accessibleCustomers = getAccessibleCustomers();
  const accessibleCustomerIds = new Set(accessibleCustomers.map(c => c.id));
  const baseTasks = currentUser.role === 'admin'
    ? data.tasks
    : data.tasks.filter(t => accessibleCustomerIds.has(t.customerId));

  // Filtreleme
  const filteredTasks = baseTasks.filter((t) => {
    // Müşteri filtresi
    if (selectedCustomerFilter !== 'all' && t.customerId !== selectedCustomerFilter) return false;
    // Kategori filtresi
    if (selectedCategoryFilter !== 'all' && t.categoryId !== selectedCategoryFilter) return false;
    // Öncelik filtresi
    if (selectedPriorityFilter !== 'all' && t.priority !== selectedPriorityFilter) return false;
    // Durum filtresi
    if (selectedStatusFilter === 'tamamlandi' && !t.isCompleted) return false;
    if (selectedStatusFilter === 'aktif' && t.isCompleted) return false;
    if (selectedStatusFilter === 'waiting_client' && (!t.waitingForClient || t.isCompleted)) return false;
    if (selectedStatusFilter === 'devam_ediyor' && (t.status !== 'devam_ediyor' || t.isCompleted)) return false;

    // Arama
    const q = searchQuery.toLowerCase().trim();
    if (q) {
      const matchTitle = t.title.toLowerCase().includes(q);
      const matchDesc = t.description?.toLowerCase().includes(q);
      const matchPerson = t.assignedTo?.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc && !matchPerson) return false;
    }

    return true;
  });

  const completedCount = filteredTasks.filter(t => t.isCompleted).length;
  const percentage = filteredTasks.length > 0 ? Math.round((completedCount / filteredTasks.length) * 100) : 0;

  // Kategorilere göre gruplama (Madde 8)
  const groupedByCategory = data.categories.map(cat => ({
    category: cat,
    tasks: filteredTasks.filter(t => t.categoryId === cat.id)
  })).filter(group => group.tasks.length > 0);

  // Kategori dışı kalanlar
  const uncategorizedTasks = filteredTasks.filter(t => !data.categories.some(c => c.id === t.categoryId));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

      {/* Üst Başlık & Aksiyonlar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-md)', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CheckSquare size={22} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
                Görevler & Yapılacak İşler Paneli
              </h2>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                Kategori bazlı görev takibi, anlık checkbox tamamlama ve onay süreçleri
              </span>
            </div>
          </div>
        </div>

        {currentUser.role !== 'musteri' && (
          <button className="btn btn-primary" onClick={() => setIsAddTaskModalOpen(true)}>
            <Plus size={18} />
            <span>Yeni Görev Ekle</span>
          </button>
        )}
      </div>

      {/* İlerleme Özeti Kartı */}
      <div className="card" style={{ padding: '16px 20px', background: 'linear-gradient(135deg, #ffffff, #f8fafc)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span style={{ fontSize: '0.86rem', fontWeight: 700, color: 'var(--text-main)' }}>
            Listelenen Görevlerin Tamamlanma Durumu ({completedCount} / {filteredTasks.length} Görev)
          </span>
          <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary)' }}>
            %{percentage}
          </span>
        </div>
        <div className="progress-track">
          <div
            className={`progress-fill ${percentage === 100 ? 'progress-full' : percentage > 60 ? 'progress-high' : 'progress-mid'}`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      {/* Filtre Çubuğu */}
      <div className="card" style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>

          {/* Müşteri Seçimi */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>Müşteri:</span>
            <select
              className="form-select"
              style={{ padding: '6px 12px', fontSize: '0.82rem', width: 'auto' }}
              value={selectedCustomerFilter}
              onChange={(e) => setSelectedCustomerFilter(e.target.value)}
            >
              <option value="all">Tüm Müşteriler</option>
              {accessibleCustomers.map(c => (
                <option key={c.id} value={c.id}>{c.companyName}</option>
              ))}
            </select>
          </div>

          {/* Kategori Seçimi */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>Kategori:</span>
            <select
              className="form-select"
              style={{ padding: '6px 12px', fontSize: '0.82rem', width: 'auto' }}
              value={selectedCategoryFilter}
              onChange={(e) => setSelectedCategoryFilter(e.target.value)}
            >
              <option value="all">Tüm Kategoriler</option>
              {data.categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Öncelik Seçimi */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>Öncelik:</span>
            <select
              className="form-select"
              style={{ padding: '6px 12px', fontSize: '0.82rem', width: 'auto' }}
              value={selectedPriorityFilter}
              onChange={(e) => setSelectedPriorityFilter(e.target.value)}
            >
              <option value="all">Tümü</option>
              <option value="acil">⚡ Acil</option>
              <option value="yuksek">Yüksek</option>
              <option value="normal">Normal</option>
              <option value="dusuk">Düşük</option>
            </select>
          </div>

        </div>

        {/* Hızlı Durum Filtre Butonları */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', borderTop: '1px solid var(--border-subtle)', paddingTop: '10px' }}>
          {[
            { id: 'all', label: 'Tüm Görevler' },
            { id: 'aktif', label: 'Devam Edenler (Aktif)' },
            { id: 'waiting_client', label: '⚠️ Müşteriden Beklenen' },
            { id: 'tamamlandi', label: '✓ Tamamlananlar' }
          ].map(tab => (
            <button
              key={tab.id}
              className={`btn btn-sm ${selectedStatusFilter === tab.id ? 'btn-primary' : 'btn-secondary'}`}
              style={{ fontSize: '0.78rem' }}
              onClick={() => setSelectedStatusFilter(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* KATEGORİ BAZLI GÖREV LİSTESİ (Madde 7 & Madde 8) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
        {groupedByCategory.length === 0 && uncategorizedTasks.length === 0 ? (
          <div className="card" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
            Seçilen filtre kriterlerine uygun görev bulunamadı.
          </div>
        ) : (
          groupedByCategory.map(({ category, tasks }) => (
            <div key={category.id} className="card" style={{ padding: '20px' }}>
              {/* Kategori Başlığı */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: 12, height: 12, borderRadius: '50%', background: category.color }} />
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)' }}>
                    {category.name}
                  </h3>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '2px 8px', borderRadius: 'var(--radius-full)', background: `${category.color}15`, color: category.color }}>
                    {tasks.filter(t => t.isCompleted).length} / {tasks.length} Tamamlandı
                  </span>
                </div>

                <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  %{tasks.length > 0 ? Math.round((tasks.filter(t => t.isCompleted).length / tasks.length) * 100) : 0}
                </span>
              </div>

              {/* Kategori Görevleri */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {tasks.map((task) => {
                  const customer = data.customers.find(c => c.id === task.customerId);
                  const subtasks = task.subtasks || [];
                  const completedSubtasksCount = subtasks.filter(s => s.completed).length;

                  return (
                    <div
                      key={task.id}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '12px',
                        padding: '14px 16px',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border-color)',
                        backgroundColor: task.isCompleted ? 'var(--bg-app)' : '#ffffff',
                        transition: 'var(--transition)',
                        cursor: 'pointer'
                      }}
                      onClick={() => setSelectedTaskForDetail(task)}
                    >
                      {/* Checkbox */}
                      <div
                        className={`custom-checkbox ${task.isCompleted ? 'checked' : ''}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (currentUser.role !== 'musteri') {
                            toggleTask(task.id);
                          }
                        }}
                        style={{
                          marginTop: '2px',
                          cursor: currentUser.role === 'musteri' ? 'default' : 'pointer',
                          opacity: currentUser.role === 'musteri' ? 0.85 : 1
                        }}
                        title={currentUser.role === 'musteri' ? 'Görev Durumu' : 'Tamamlandı olarak işaretle / aç'}
                      >
                        {task.isCompleted && <Check size={14} strokeWidth={3} />}
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                          <span
                            style={{
                              fontSize: '0.92rem',
                              fontWeight: 600,
                              color: task.isCompleted ? 'var(--text-muted)' : 'var(--text-main)',
                              textDecoration: task.isCompleted ? 'line-through' : 'none'
                            }}
                          >
                            {task.title}
                          </span>

                          {customer && (
                            <span
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedCustomerId(customer.id);
                                setActivePage('customer-detail');
                              }}
                              style={{
                                fontSize: '0.72rem',
                                fontWeight: 700,
                                color: 'var(--primary)',
                                backgroundColor: 'var(--primary-light)',
                                padding: '2px 8px',
                                borderRadius: 'var(--radius-sm)'
                              }}
                            >
                              🏢 {customer.companyName}
                            </span>
                          )}

                          {task.recurring && task.recurring !== 'none' && (
                            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#0284c7', backgroundColor: '#e0f2fe', padding: '2px 8px', borderRadius: 'var(--radius-sm)', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                              <Repeat size={11} /> {task.recurring === 'weekly' ? 'Haftalık' : 'Aylık'}
                            </span>
                          )}

                          {subtasks.length > 0 && (
                            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: completedSubtasksCount === subtasks.length ? '#16a34a' : '#4f46e5', backgroundColor: completedSubtasksCount === subtasks.length ? '#dcfce7' : '#eef2ff', padding: '2px 8px', borderRadius: 'var(--radius-sm)', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                              <ListChecks size={11} /> {completedSubtasksCount}/{subtasks.length}
                            </span>
                          )}

                          {task.attachment?.url && (
                            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#059669', backgroundColor: '#ecfdf5', padding: '2px 8px', borderRadius: 'var(--radius-sm)', display: 'inline-flex', alignItems: 'center', gap: '3px' }} title={task.attachment.name || 'Ek dosya mevcut'}>
                              <Paperclip size={11} /> Ek
                            </span>
                          )}

                          {task.waitingForClient && (
                            <span className="badge-waiting-client">
                              ⚠️ {task.waitingReason || 'Müşteriden Bekleniyor'}
                            </span>
                          )}
                        </div>

                        {task.description && (
                          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                            {task.description}
                          </p>
                        )}

                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginTop: '6px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          <span>👤 <strong>{task.assignedTo}</strong></span>
                          <span>📅 Son: {task.dueDate}</span>
                          {task.isCompleted && task.completedBy && (
                            <span style={{ color: 'var(--success)', fontWeight: 600 }}>
                              ✓ {task.completedBy}
                            </span>
                          )}
                        </div>
                      </div>

                      <span className={`badge badge-priority-${task.priority}`}>
                        {task.priority === 'acil' ? '⚡ Acil' : task.priority === 'yuksek' ? 'Yüksek' : task.priority === 'normal' ? 'Normal' : 'Düşük'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Görev Detay Modalı */}
      <TaskDetailModal
        isOpen={Boolean(selectedTaskForDetail)}
        onClose={() => setSelectedTaskForDetail(null)}
        task={selectedTaskForDetail}
      />

      {/* Yeni Görev Modalı */}
      <AddTaskModal
        isOpen={isAddTaskModalOpen}
        onClose={() => setIsAddTaskModalOpen(false)}
        defaultCustomerId={selectedCustomerFilter !== 'all' ? selectedCustomerFilter : null}
        defaultCategoryId={selectedCategoryFilter !== 'all' ? selectedCategoryFilter : null}
      />
    </div>
  );
}
