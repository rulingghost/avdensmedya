import React, { useState } from 'react';
import { X, CheckSquare, Sparkles } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function AddTaskModal({ isOpen, onClose, defaultCustomerId = null, defaultCategoryId = null }) {
  const { data, addTask, currentUser, getAccessibleCustomers } = useApp();

  const accessibleCustomers = getAccessibleCustomers();
  const initialCustomerId = defaultCustomerId && accessibleCustomers.some(c => c.id === defaultCustomerId)
    ? defaultCustomerId
    : (accessibleCustomers[0]?.id || '');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    customerId: initialCustomerId,
    categoryId: defaultCategoryId || 'cat-meta',
    assignedTo: currentUser.name,
    startDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 3 * 24 * 3600 * 1000).toISOString().split('T')[0],
    priority: 'normal',
    status: 'yapilacak',
    waitingForClient: false,
    waitingReason: ''
  });

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    addTask(formData);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '600px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckSquare size={20} color="var(--primary)" />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Yeni Görev Ekle (Madde 9)</h3>
          </div>
          <button onClick={onClose} style={{ color: 'var(--text-muted)' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

            <div className="form-group">
              <label>Müşteri *</label>
              <select
                className="form-select"
                value={formData.customerId}
                onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
              >
                {accessibleCustomers.map(c => (
                  <option key={c.id} value={c.id}>{c.companyName}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Görev Adı *</label>
              <input
                type="text"
                className="form-input"
                placeholder="Örn: Meta Business kurulumu ve alan adı doğrulama"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label>Açıklama / Görev Adımları</label>
              <textarea
                className="form-textarea"
                rows={3}
                placeholder="Yapılacak adımları buraya madde madde yazabilirsiniz..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-group">
                <label>Kategori *</label>
                <select
                  className="form-select"
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                >
                  {data.categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Sorumlu Kişi (Madde 27)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Serdar, Mücahit, Tasarımcı vb."
                  list="team-members-list"
                  value={formData.assignedTo}
                  onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                />
                <datalist id="team-members-list">
                  {data.users.map(u => (
                    <option key={u.id} value={u.name}>
                      {u.name} ({u.role === 'admin' ? 'Yönetici' : u.role === 'araci' ? 'İş Ortağı' : 'Müşteri'})
                    </option>
                  ))}
                  <option value="Tasarım Ekibi" />
                  <option value="Yazılım Ekibi" />
                </datalist>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
              <div className="form-group">
                <label>Öncelik</label>
                <select
                  className="form-select"
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                >
                  <option value="dusuk">Düşük</option>
                  <option value="normal">Normal</option>
                  <option value="yuksek">Yüksek</option>
                  <option value="acil">Acil ⚡</option>
                </select>
              </div>

              <div className="form-group">
                <label>Başlangıç</label>
                <input
                  type="date"
                  className="form-input"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Son Tarih</label>
                <input
                  type="date"
                  className="form-input"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                />
              </div>
            </div>

            {/* Müşteriden Bekleniyor (Madde 26) */}
            <div style={{ backgroundColor: '#fff7ed', padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid #fed7aa' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, color: '#c2410c', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={formData.waitingForClient}
                  onChange={(e) => setFormData({ ...formData, waitingForClient: e.target.checked })}
                />
                <span>⚠️ Müşteriden Bekleniyor (Logo, Şifre, Bütçe Onayı vb.)</span>
              </label>
              {formData.waitingForClient && (
                <input
                  type="text"
                  className="form-input"
                  style={{ marginTop: '8px' }}
                  placeholder="Bekleme sebebi (Örn: Müşteriden Instagram şifresi bekleniyor)"
                  value={formData.waitingReason}
                  onChange={(e) => setFormData({ ...formData, waitingReason: e.target.value })}
                />
              )}
            </div>

          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              İptal
            </button>
            <button type="submit" className="btn btn-primary">
              Görevi Kaydet
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
