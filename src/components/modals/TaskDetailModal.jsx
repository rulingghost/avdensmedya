import React, { useState } from 'react';
import {
  X,
  CheckCircle2,
  Clock,
  Calendar,
  User,
  AlertTriangle,
  FileText,
  Tag,
  Building2,
  Trash2,
  Edit2,
  Save,
  Check
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function TaskDetailModal({ isOpen, onClose, task }) {
  const { data, updateTask, deleteTask, toggleTask, currentUser, getAccessibleCustomers } = useApp();

  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState(null);

  if (!isOpen || !task) return null;

  const currentTask = data.tasks.find(t => t.id === task.id) || task;
  const accessibleCustomers = getAccessibleCustomers();
  const isAccessible = currentUser.role === 'admin' || accessibleCustomers.some(c => c.id === currentTask.customerId);
  const canEditOrDelete = currentUser.role !== 'musteri' && isAccessible;

  if (!isAccessible) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" style={{ maxWidth: '480px', padding: '32px', textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
          <h3 style={{ color: 'var(--danger)', marginBottom: '8px' }}>Yetkisiz Erişim</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>Bu görevi görüntüleme yetkiniz bulunmamaktadır.</p>
          <button className="btn btn-secondary btn-sm" onClick={onClose} style={{ marginTop: '16px' }}>Kapat</button>
        </div>
      </div>
    );
  }

  const customer = data.customers.find(c => c.id === currentTask.customerId);
  const category = data.categories.find(c => c.id === currentTask.categoryId);

  const startEdit = () => {
    if (!canEditOrDelete) return;
    setEditData({
      title: currentTask.title,
      description: currentTask.description || '',
      categoryId: currentTask.categoryId,
      assignedTo: currentTask.assignedTo,
      priority: currentTask.priority,
      status: currentTask.status,
      dueDate: currentTask.dueDate,
      waitingForClient: currentTask.waitingForClient,
      waitingReason: currentTask.waitingReason || ''
    });
    setIsEditing(true);
  };

  const saveEdit = (e) => {
    e.preventDefault();
    if (!canEditOrDelete) return;
    updateTask(currentTask.id, {
      ...editData,
      isCompleted: editData.status === 'tamamlandi'
    });
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (!canEditOrDelete) return;
    if (window.confirm('Bu görevi silmek istediğinize emin misiniz?')) {
      deleteTask(currentTask.id);
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '640px' }} onClick={(e) => e.stopPropagation()}>

        {/* Modal Başlığı */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              className={`custom-checkbox ${currentTask.isCompleted ? 'checked' : ''}`}
              onClick={() => canEditOrDelete && toggleTask(currentTask.id)}
              style={{ cursor: canEditOrDelete ? 'pointer' : 'default', opacity: canEditOrDelete ? 1 : 0.8 }}
              title={canEditOrDelete ? 'Tamamlandı durumunu değiştir' : 'Görev Tamamlanma Durumu'}
            >
              {currentTask.isCompleted && <Check size={14} strokeWidth={3} />}
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Görev Detayı • {customer?.companyName}
              </span>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '2px' }}>
                {currentTask.title}
              </h3>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {canEditOrDelete && !isEditing && (
              <button onClick={startEdit} className="btn btn-secondary btn-sm" title="Görevi Düzenle">
                <Edit2 size={14} />
                <span>Düzenle</span>
              </button>
            )}
            <button onClick={onClose} style={{ color: 'var(--text-muted)' }}>
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Modal İçeriği */}
        {isEditing ? (
          /* Düzenleme Formu */
          <form onSubmit={saveEdit}>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="form-group">
                <label>Görev Adı *</label>
                <input
                  type="text"
                  className="form-input"
                  value={editData.title}
                  onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Açıklama</label>
                <textarea
                  className="form-textarea"
                  rows={3}
                  value={editData.description}
                  onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label>Kategori</label>
                  <select
                    className="form-select"
                    value={editData.categoryId}
                    onChange={(e) => setEditData({ ...editData, categoryId: e.target.value })}
                  >
                    {data.categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Sorumlu Kişi</label>
                  <input
                    type="text"
                    className="form-input"
                    value={editData.assignedTo}
                    onChange={(e) => setEditData({ ...editData, assignedTo: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label>Öncelik</label>
                  <select
                    className="form-select"
                    value={editData.priority}
                    onChange={(e) => setEditData({ ...editData, priority: e.target.value })}
                  >
                    <option value="dusuk">Düşük</option>
                    <option value="normal">Normal</option>
                    <option value="yuksek">Yüksek</option>
                    <option value="acil">Acil ⚡</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Durum</label>
                  <select
                    className="form-select"
                    value={editData.status}
                    onChange={(e) => setEditData({ ...editData, status: e.target.value })}
                  >
                    <option value="yapilacak">Yapılacak</option>
                    <option value="devam_ediyor">Devam Ediyor</option>
                    <option value="beklemede">Beklemede</option>
                    <option value="tamamlandi">Tamamlandı</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Son Tarih</label>
                  <input
                    type="date"
                    className="form-input"
                    value={editData.dueDate}
                    onChange={(e) => setEditData({ ...editData, dueDate: e.target.value })}
                  />
                </div>
              </div>

              {/* Müşteriden Bekleniyor Ayarı (Madde 26) */}
              <div style={{ backgroundColor: '#fff7ed', padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid #fed7aa' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, color: '#c2410c', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={editData.waitingForClient}
                    onChange={(e) => setEditData({ ...editData, waitingForClient: e.target.checked })}
                  />
                  <span>⚠️ Müşteriden Bekleniyor (Logo, Şifre, Bütçe Onayı vb.)</span>
                </label>
                {editData.waitingForClient && (
                  <input
                    type="text"
                    className="form-input"
                    style={{ marginTop: '8px' }}
                    placeholder="Bekleme sebebi (Örn: Müşteriden yeni ürün fotoğrafları bekleniyor)"
                    value={editData.waitingReason}
                    onChange={(e) => setEditData({ ...editData, waitingReason: e.target.value })}
                  />
                )}
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => setIsEditing(false)}>
                Vazgeç
              </button>
              <button type="submit" className="btn btn-primary">
                <Save size={16} />
                <span>Değişiklikleri Kaydet</span>
              </button>
            </div>
          </form>
        ) : (
          /* Görüntüleme Modu (Madde 10) */
          <div>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

              {/* Açıklama */}
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Görev Açıklaması
                </label>
                <p style={{ fontSize: '0.92rem', color: 'var(--text-main)', marginTop: '4px', lineHeight: 1.6 }}>
                  {currentTask.description || 'Bu görev için ek bir açıklama girilmemiş.'}
                </p>
              </div>

              {/* Müşteriden Bekleniyor Uyarısı (Madde 26) */}
              {currentTask.waitingForClient && (
                <div style={{ backgroundColor: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 'var(--radius-md)', padding: '14px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <AlertTriangle size={20} color="#ea580c" />
                  <div>
                    <strong style={{ fontSize: '0.88rem', color: '#c2410c', display: 'block' }}>
                      Müşteriden Beklenen Adım
                    </strong>
                    <span style={{ fontSize: '0.82rem', color: '#9a3412' }}>
                      {currentTask.waitingReason || 'Müşteri onayı bekleniyor'}
                    </span>
                  </div>
                </div>
              )}

              {/* Parametre Grid'i */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', backgroundColor: 'var(--bg-app)', padding: '16px', borderRadius: 'var(--radius-md)' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Kategori:</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                    <span style={{ width: 10, height: 10, borderRadius: '50%', background: category?.color || 'var(--primary)' }} />
                    <strong style={{ fontSize: '0.88rem' }}>{category?.name || 'Genel'}</strong>
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Sorumlu Kişi:</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                    <User size={16} color="var(--primary)" />
                    <strong style={{ fontSize: '0.88rem' }}>{currentTask.assignedTo}</strong>
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Öncelik:</span>
                  <div style={{ marginTop: '2px' }}>
                    <span className={`badge badge-priority-${currentTask.priority}`}>
                      {currentTask.priority === 'acil' ? '⚡ Acil' : currentTask.priority === 'yuksek' ? 'Yüksek' : currentTask.priority === 'normal' ? 'Normal' : 'Düşük'}
                    </span>
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Durum:</span>
                  <div style={{ marginTop: '2px' }}>
                    <span className={`badge badge-${currentTask.status === 'tamamlandi' ? 'aktif' : currentTask.status === 'devam_ediyor' ? 'tamamlandi' : 'beklemede'}`}>
                      {currentTask.status === 'tamamlandi' ? '✓ Tamamlandı' : currentTask.status === 'devam_ediyor' ? 'Devam Ediyor' : 'Beklemede'}
                    </span>
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Başlangıç Tarihi:</span>
                  <div style={{ fontSize: '0.88rem', fontWeight: 600 }}>{currentTask.startDate || '—'}</div>
                </div>

                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Son Tarih (Termin):</span>
                  <div style={{ fontSize: '0.88rem', fontWeight: 600 }}>{currentTask.dueDate || '—'}</div>
                </div>
              </div>

              {/* Tamamlama Bilgisi */}
              {currentTask.isCompleted && (
                <div style={{ backgroundColor: 'var(--success-light)', padding: '14px', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <CheckCircle2 size={20} color="var(--success)" />
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--success-text)' }}>
                      Bu görev başarıyla tamamlandı
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--success-text)', opacity: 0.9 }}>
                      Tamamlayan: <strong>{currentTask.completedBy || 'Yetkili'}</strong> • {currentTask.completedAt ? new Date(currentTask.completedAt).toLocaleString('tr-TR') : ''}
                    </div>
                  </div>
                </div>
              )}

            </div>

            <div className="modal-footer" style={{ display: 'flex', justifyContent: 'space-between' }}>
              {currentUser.role === 'admin' ? (
                <button type="button" onClick={handleDelete} className="btn btn-danger-outline btn-sm">
                  <Trash2 size={14} />
                  <span>Görevi Sil</span>
                </button>
              ) : <div />}

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  className={`btn btn-sm ${currentTask.isCompleted ? 'btn-secondary' : 'btn-success'}`}
                  onClick={() => toggleTask(currentTask.id)}
                >
                  <Check size={14} />
                  <span>{currentTask.isCompleted ? 'Tekrar Aç' : 'Tamamlandı Olarak İşaretle'}</span>
                </button>
                <button type="button" className="btn btn-secondary btn-sm" onClick={onClose}>
                  Kapat
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
