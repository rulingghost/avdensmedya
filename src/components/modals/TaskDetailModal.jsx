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
  Check,
  ListChecks,
  Repeat,
  Paperclip,
  Plus,
  ExternalLink
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function TaskDetailModal({ isOpen, onClose, task }) {
  const { data, updateTask, deleteTask, toggleTask, toggleSubtask, currentUser, getAccessibleCustomers } = useApp();

  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState(null);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [mouseDownOnOverlay, setMouseDownOnOverlay] = useState(false);

  if (!isOpen || !task) return null;

  const currentTask = data.tasks.find(t => t.id === task.id) || task;
  const accessibleCustomers = getAccessibleCustomers();
  const isAccessible = currentUser.role === 'admin' || accessibleCustomers.some(c => c.id === currentTask.customerId);
  const canEditOrDelete = currentUser.role !== 'musteri' && isAccessible;

  if (!isAccessible) {
    return (
      <div
        className="modal-overlay"
        onMouseDown={(e) => {
          if (e.target === e.currentTarget) setMouseDownOnOverlay(true);
          else setMouseDownOnOverlay(false);
        }}
        onClick={(e) => {
          if (e.target === e.currentTarget && mouseDownOnOverlay) onClose();
          setMouseDownOnOverlay(false);
        }}
      >
        <div
          className="modal-content"
          style={{ maxWidth: '480px', padding: '32px', textAlign: 'center' }}
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
        >
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
      waitingReason: currentTask.waitingReason || '',
      recurring: currentTask.recurring || 'none',
      subtasks: currentTask.subtasks ? [...currentTask.subtasks] : [],
      attachment: currentTask.attachment ? { ...currentTask.attachment } : null
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

  const handleAddInlineSubtask = () => {
    if (!newSubtaskTitle.trim()) return;
    const newSt = {
      id: 'st-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      title: newSubtaskTitle.trim(),
      completed: false
    };
    const updated = [...(currentTask.subtasks || []), newSt];
    updateTask(currentTask.id, { subtasks: updated });
    setNewSubtaskTitle('');
  };

  const handleDeleteSubtask = (stId) => {
    const updated = (currentTask.subtasks || []).filter(s => s.id !== stId);
    updateTask(currentTask.id, { subtasks: updated });
  };

  const handleDelete = () => {
    if (!canEditOrDelete) return;
    if (window.confirm('Bu görevi silmek istediğinize emin misiniz?')) {
      deleteTask(currentTask.id);
      onClose();
    }
  };

  return (
    <div
      className="modal-overlay"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) setMouseDownOnOverlay(true);
        else setMouseDownOnOverlay(false);
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && mouseDownOnOverlay) onClose();
        setMouseDownOnOverlay(false);
      }}
    >
      <div
        className="modal-content"
        style={{ maxWidth: '640px' }}
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
      >

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

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '12px' }}>
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
                  <label>Döngü / Tekrar</label>
                  <select
                    className="form-select"
                    value={editData.recurring || 'none'}
                    onChange={(e) => setEditData({ ...editData, recurring: e.target.value })}
                  >
                    <option value="none">Tek Seferlik</option>
                    <option value="weekly">🔄 Haftalık</option>
                    <option value="monthly">🔄 Aylık</option>
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

              {/* Alt Görevler (Edit Modu) */}
              <div style={{ padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-app)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <ListChecks size={16} color="var(--primary)" />
                    <span>Alt Görevler ({editData.subtasks?.length || 0})</span>
                  </label>
                </div>

                <div style={{ display: 'flex', gap: '8px', marginBottom: editData.subtasks?.length > 0 ? '10px' : '0' }}>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Yeni alt adım yazın..."
                    value={newSubtaskTitle}
                    onChange={(e) => setNewSubtaskTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        if (newSubtaskTitle.trim()) {
                          setEditData({
                            ...editData,
                            subtasks: [...(editData.subtasks || []), { id: 'st-' + Date.now(), title: newSubtaskTitle.trim(), completed: false }]
                          });
                          setNewSubtaskTitle('');
                        }
                      }
                    }}
                    style={{ flex: 1, padding: '8px 12px', fontSize: '0.84rem' }}
                  />
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => {
                      if (newSubtaskTitle.trim()) {
                        setEditData({
                          ...editData,
                          subtasks: [...(editData.subtasks || []), { id: 'st-' + Date.now(), title: newSubtaskTitle.trim(), completed: false }]
                        });
                        setNewSubtaskTitle('');
                      }
                    }}
                  >
                    <Plus size={14} /> Ekle
                  </button>
                </div>

                {editData.subtasks && editData.subtasks.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {editData.subtasks.map((st, idx) => (
                      <div
                        key={st.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '6px 10px',
                          backgroundColor: '#fff',
                          borderRadius: '6px',
                          border: '1px solid var(--border-subtle)',
                          fontSize: '0.84rem'
                        }}
                      >
                        <span><strong style={{ color: 'var(--primary)', marginRight: '6px' }}>{idx + 1}.</strong>{st.title}</span>
                        <button
                          type="button"
                          onClick={() => setEditData({ ...editData, subtasks: editData.subtasks.filter(s => s.id !== st.id) })}
                          style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', padding: '2px' }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Ek Dosya / Link (Edit Modu) */}
              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.84rem' }}>
                  <Paperclip size={14} color="var(--primary)" />
                  <span>Görev Eki (Dosya / Doküman URL)</span>
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px' }}>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Ek adı (Örn: Tasarım PDF)"
                    value={editData.attachment?.name || ''}
                    onChange={(e) => setEditData({
                      ...editData,
                      attachment: { ...(editData.attachment || {}), name: e.target.value }
                    })}
                    style={{ fontSize: '0.84rem' }}
                  />
                  <input
                    type="url"
                    className="form-input"
                    placeholder="URL (https://...)"
                    value={editData.attachment?.url || ''}
                    onChange={(e) => setEditData({
                      ...editData,
                      attachment: { ...(editData.attachment || {}), url: e.target.value }
                    })}
                    style={{ fontSize: '0.84rem' }}
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
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>

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
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '14px', backgroundColor: 'var(--bg-app)', padding: '16px', borderRadius: 'var(--radius-md)' }}>
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
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Döngü / Tekrar:</span>
                  <div style={{ marginTop: '2px' }}>
                    {currentTask.recurring === 'weekly' ? (
                      <span className="badge badge-tamamlandi" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <Repeat size={12} /> Haftalık Tekrar
                      </span>
                    ) : currentTask.recurring === 'monthly' ? (
                      <span className="badge badge-tamamlandi" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <Repeat size={12} /> Aylık Tekrar
                      </span>
                    ) : (
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Tek Seferlik</span>
                    )}
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Son Tarih (Termin):</span>
                  <div style={{ fontSize: '0.88rem', fontWeight: 600 }}>{currentTask.dueDate || '—'}</div>
                </div>
              </div>

              {/* Alt Görevler (Kontrol Listesi / Checklist) */}
              {(() => {
                const subtasks = currentTask.subtasks || [];
                const completedSubtasks = subtasks.filter(s => s.completed).length;
                const percent = subtasks.length > 0 ? Math.round((completedSubtasks / subtasks.length) * 100) : 0;

                return (
                  <div style={{ backgroundColor: 'var(--bg-app)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <ListChecks size={18} color="var(--primary)" />
                        <h4 style={{ margin: 0, fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-main)' }}>
                          Alt Görevler / Kontrol Listesi
                        </h4>
                        {subtasks.length > 0 && (
                          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: percent === 100 ? '#16a34a' : 'var(--primary)', backgroundColor: percent === 100 ? '#dcfce7' : 'var(--primary-light)', padding: '2px 8px', borderRadius: '12px' }}>
                            {completedSubtasks}/{subtasks.length} ({percent}%)
                          </span>
                        )}
                      </div>
                    </div>

                    {subtasks.length > 0 && (
                      <div style={{ width: '100%', height: '6px', backgroundColor: 'var(--border-subtle)', borderRadius: '3px', overflow: 'hidden', marginBottom: '12px' }}>
                        <div style={{ width: `${percent}%`, height: '100%', backgroundColor: percent === 100 ? 'var(--success)' : 'var(--primary)', transition: 'width 0.3s ease' }} />
                      </div>
                    )}

                    {subtasks.length > 0 ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: canEditOrDelete ? '12px' : '0' }}>
                        {subtasks.map((st, idx) => (
                          <div
                            key={st.id}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '8px 12px',
                              backgroundColor: '#ffffff',
                              borderRadius: 'var(--radius-sm)',
                              border: '1px solid var(--border-subtle)',
                              boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
                            }}
                          >
                            <div
                              onClick={() => canEditOrDelete && toggleSubtask(currentTask.id, st.id)}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                cursor: canEditOrDelete ? 'pointer' : 'default',
                                flex: 1
                              }}
                            >
                              <div
                                className={`custom-checkbox ${st.completed ? 'checked' : ''}`}
                                style={{ width: 18, height: 18 }}
                              >
                                {st.completed && <Check size={12} strokeWidth={3} />}
                              </div>
                              <span
                                style={{
                                  fontSize: '0.88rem',
                                  color: st.completed ? 'var(--text-muted)' : 'var(--text-main)',
                                  textDecoration: st.completed ? 'line-through' : 'none'
                                }}
                              >
                                {st.title}
                              </span>
                            </div>
                            {canEditOrDelete && (
                              <button
                                type="button"
                                onClick={() => handleDeleteSubtask(st.id)}
                                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}
                                title="Alt görevi sil"
                              >
                                <Trash2 size={13} />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: canEditOrDelete ? '10px' : '0' }}>
                        Henüz alt görev veya kontrol adımı eklenmemiş.
                      </p>
                    )}

                    {canEditOrDelete && (
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="Yeni alt adım ekle (Enter'a bas)..."
                          value={newSubtaskTitle}
                          onChange={(e) => setNewSubtaskTitle(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddInlineSubtask();
                            }
                          }}
                          style={{ flex: 1, padding: '7px 12px', fontSize: '0.84rem' }}
                        />
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={handleAddInlineSubtask}
                        >
                          <Plus size={14} /> Ekle
                        </button>
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Görev Eki / Doküman URL */}
              {currentTask.attachment?.url && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: 34, height: 34, borderRadius: '8px', backgroundColor: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#16a34a' }}>
                      <Paperclip size={18} />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.86rem', fontWeight: 700, color: '#166534' }}>
                        {currentTask.attachment.name || 'Görevin Ek Dosyası'}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#15803d', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {currentTask.attachment.url}
                      </div>
                    </div>
                  </div>
                  <a
                    href={currentTask.attachment.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-sm btn-primary"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', padding: '6px 12px' }}
                  >
                    <span>Aç / İndir</span>
                    <ExternalLink size={13} />
                  </a>
                </div>
              )}

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
