import React, { useState } from 'react';
import { X, CheckSquare, Sparkles, Plus, Trash2, Repeat, Paperclip, ListChecks } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function AddTaskModal({ isOpen, onClose, defaultCustomerId = null, defaultCategoryId = null }) {
  const { data, addTask, currentUser, getAccessibleCustomers } = useApp();

  const accessibleCustomers = getAccessibleCustomers();
  const initialCustomerId = defaultCustomerId && accessibleCustomers.some(c => c.id === defaultCustomerId)
    ? defaultCustomerId
    : (accessibleCustomers[0]?.id || '');

  const [mouseDownOnOverlay, setMouseDownOnOverlay] = useState(false);
  const [subtasks, setSubtasks] = useState([]);
  const [newSubtaskInput, setNewSubtaskInput] = useState('');
  const [recurring, setRecurring] = useState('none');
  const [attachmentUrl, setAttachmentUrl] = useState('');
  const [attachmentName, setAttachmentName] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    customerId: initialCustomerId,
    categoryId: defaultCategoryId || data.categories[0]?.id || '',
    assignedTo: currentUser.name,
    startDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 3 * 24 * 3600 * 1000).toISOString().split('T')[0],
    priority: 'normal',
    status: 'yapilacak',
    waitingForClient: false,
    waitingReason: ''
  });

  if (!isOpen) return null;

  const handleAddSubtask = () => {
    if (!newSubtaskInput.trim()) return;
    setSubtasks(prev => [
      ...prev,
      { id: 'st-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4), title: newSubtaskInput.trim(), completed: false }
    ]);
    setNewSubtaskInput('');
  };

  const handleRemoveSubtask = (id) => {
    setSubtasks(prev => prev.filter(s => s.id !== id));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    addTask({
      ...formData,
      subtasks,
      recurring,
      attachment: attachmentUrl.trim() ? { name: attachmentName.trim() || 'Ek Dosya/Bağlantı', url: attachmentUrl.trim() } : null
    });
    onClose();
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
        style={{ maxWidth: '600px' }}
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckSquare size={20} color="var(--primary)" />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Yeni Görev Ekle</h3>
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
                <label>Sorumlu Kişi</label>
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

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
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
                <label>Döngü / Tekrar</label>
                <select
                  className="form-select"
                  value={recurring}
                  onChange={(e) => setRecurring(e.target.value)}
                >
                  <option value="none">Tek Seferlik</option>
                  <option value="weekly">🔄 Haftalık Tekrar</option>
                  <option value="monthly">🔄 Aylık Tekrar</option>
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

            {/* Alt Görevler (Checklist / Adım Adım Kontrol Listesi) */}
            <div style={{ padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-app)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <ListChecks size={16} color="var(--primary)" />
                  <span>Alt Görevler / Kontrol Listesi ({subtasks.length})</span>
                </label>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>İsteğe bağlı adım dökümü</span>
              </div>

              <div style={{ display: 'flex', gap: '8px', marginBottom: subtasks.length > 0 ? '10px' : '0' }}>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Alt adım yazın (Örn: Pikseli siteye ekle) ve ekle'ye basın..."
                  value={newSubtaskInput}
                  onChange={(e) => setNewSubtaskInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddSubtask();
                    }
                  }}
                  style={{ flex: 1, padding: '8px 12px', fontSize: '0.84rem' }}
                />
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={handleAddSubtask}
                  style={{ whiteSpace: 'nowrap' }}
                >
                  <Plus size={14} /> Ekle
                </button>
              </div>

              {subtasks.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {subtasks.map((st, idx) => (
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
                      <span style={{ color: 'var(--text-main)' }}>
                        <strong style={{ color: 'var(--primary)', marginRight: '6px' }}>{idx + 1}.</strong>
                        {st.title}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveSubtask(st.id)}
                        style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', padding: '2px' }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Dosya / Ekran Görüntüsü Eki */}
            <div className="form-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.84rem' }}>
                <Paperclip size={14} color="var(--primary)" />
                <span>Görev Eki (Dosya / Ekran Görüntüsü / Doküman URL)</span>
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px' }}>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Ek başlığı (Örn: Reklam Taslağı PDF)"
                  value={attachmentName}
                  onChange={(e) => setAttachmentName(e.target.value)}
                  style={{ fontSize: '0.84rem' }}
                />
                <input
                  type="url"
                  className="form-input"
                  placeholder="Dosya linki (https://... veya Drive/Canva)"
                  value={attachmentUrl}
                  onChange={(e) => setAttachmentUrl(e.target.value)}
                  style={{ fontSize: '0.84rem' }}
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
