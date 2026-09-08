import React, { useState } from 'react';
import { X, UserPlus, CheckSquare, FileText, Sparkles } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function QuickActionModal({ isOpen, onClose }) {
  const { data, addTask, addCustomer, addNote, currentUser, selectedCustomerId, getAccessibleCustomers } = useApp();

  const accessibleCustomers = getAccessibleCustomers();
  const defaultCustId = selectedCustomerId && accessibleCustomers.some(c => c.id === selectedCustomerId)
    ? selectedCustomerId
    : (accessibleCustomers[0]?.id || '');

  const [activeTab, setActiveTab] = useState('task'); // 'task' | 'customer' | 'note'

  // Görev formu
  const [taskForm, setTaskForm] = useState({
    title: '',
    customerId: defaultCustId,
    categoryId: 'cat-meta',
    priority: 'normal',
    dueDate: new Date().toISOString().split('T')[0],
    assignedTo: currentUser.name,
    waitingForClient: false,
    waitingReason: ''
  });

  // Müşteri formu (Sadece Admin)
  const [custForm, setCustForm] = useState({
    companyName: '',
    contactPerson: '',
    phone: '',
    email: '',
    partnerId: 'user-araci',
    applyTemplate: 'tmpl-sosyal-medya'
  });

  // Not formu
  const [noteForm, setNoteForm] = useState({
    customerId: defaultCustId,
    content: '',
    color: 'blue'
  });

  if (!isOpen) return null;

  const handleTaskSubmit = (e) => {
    e.preventDefault();
    if (!taskForm.title.trim()) return;
    addTask(taskForm);
    onClose();
  };

  const handleCustSubmit = (e) => {
    e.preventDefault();
    if (!custForm.companyName.trim()) return;
    addCustomer(custForm, custForm.applyTemplate || null);
    onClose();
  };

  const handleNoteSubmit = (e) => {
    e.preventDefault();
    if (!noteForm.content.trim()) return;
    addNote(noteForm.customerId, noteForm.content, noteForm.color);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={20} color="var(--primary)" />
            <h3>Hızlı İşlem Ekle</h3>
          </div>
          <button onClick={onClose} style={{ color: 'var(--text-muted)' }}>
            <X size={20} />
          </button>
        </div>

        {/* Sekmeler */}
        <div style={{ display: 'flex', padding: '12px 24px 0 24px', gap: '8px', borderBottom: '1px solid var(--border-color)' }}>
          <button
            className={`btn btn-sm ${activeTab === 'task' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('task')}
          >
            <CheckSquare size={14} />
            <span>Yeni Görev</span>
          </button>
          {currentUser.role === 'admin' && (
            <button
              className={`btn btn-sm ${activeTab === 'customer' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setActiveTab('customer')}
            >
              <UserPlus size={14} />
              <span>Yeni Müşteri</span>
            </button>
          )}
          <button
            className={`btn btn-sm ${activeTab === 'note' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('note')}
          >
            <FileText size={14} />
            <span>Yeni Not</span>
          </button>
        </div>

        <div className="modal-body">
          {/* Görev Formu */}
          {activeTab === 'task' && (
            <form onSubmit={handleTaskSubmit}>
              <div className="form-group">
                <label>Müşteri Seçin *</label>
                <select
                  className="form-select"
                  value={taskForm.customerId}
                  onChange={(e) => setTaskForm({ ...taskForm, customerId: e.target.value })}
                >
                  {accessibleCustomers.map((c) => (
                    <option key={c.id} value={c.id}>{c.companyName}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Görev Başlığı *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Örn: Meta reklam hesabı kurulumu"
                  value={taskForm.title}
                  onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label>Kategori</label>
                  <select
                    className="form-select"
                    value={taskForm.categoryId}
                    onChange={(e) => setTaskForm({ ...taskForm, categoryId: e.target.value })}
                  >
                    {data.categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Öncelik</label>
                  <select
                    className="form-select"
                    value={taskForm.priority}
                    onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}
                  >
                    <option value="dusuk">Düşük</option>
                    <option value="normal">Normal</option>
                    <option value="yuksek">Yüksek</option>
                    <option value="acil">Acil ⚡</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Sorumlu Kişi</label>
                <input
                  type="text"
                  className="form-input"
                  value={taskForm.assignedTo}
                  onChange={(e) => setTaskForm({ ...taskForm, assignedTo: e.target.value })}
                />
              </div>

              <div className="form-group" style={{ backgroundColor: '#fff7ed', padding: '12px', borderRadius: '8px', border: '1px solid #fed7aa' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: '#c2410c' }}>
                  <input
                    type="checkbox"
                    checked={taskForm.waitingForClient}
                    onChange={(e) => setTaskForm({ ...taskForm, waitingForClient: e.target.checked })}
                  />
                  <span>⚠️ Müşteriden Bekleniyor (Logo, Şifre, Bütçe Onayı vb.)</span>
                </label>
                {taskForm.waitingForClient && (
                  <input
                    type="text"
                    className="form-input"
                    style={{ marginTop: '8px' }}
                    placeholder="Bekleme sebebi (Örn: Müşteriden yeni ürün fotoğrafları bekleniyor)"
                    value={taskForm.waitingReason}
                    onChange={(e) => setTaskForm({ ...taskForm, waitingReason: e.target.value })}
                  />
                )}
              </div>

              <div className="modal-footer" style={{ margin: '0 -24px -24px -24px' }}>
                <button type="button" className="btn btn-secondary" onClick={onClose}>İptal</button>
                <button type="submit" className="btn btn-primary">Görevi Kaydet</button>
              </div>
            </form>
          )}

          {/* Müşteri Formu */}
          {activeTab === 'customer' && (
            <form onSubmit={handleCustSubmit}>
              <div className="form-group">
                <label>Firma Adı *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Örn: Atlas Tekstil A.Ş."
                  value={custForm.companyName}
                  onChange={(e) => setCustForm({ ...custForm, companyName: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label>Yetkili Kişi</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Ad Soyad"
                    value={custForm.contactPerson}
                    onChange={(e) => setCustForm({ ...custForm, contactPerson: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Telefon / WhatsApp</label>
                  <input
                    type="tel"
                    className="form-input"
                    placeholder="+90 5XX XXX XX XX"
                    value={custForm.phone}
                    onChange={(e) => setCustForm({ ...custForm, phone: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Bağlı Olduğu Aracı / İş Ortağı</label>
                <select
                  className="form-select"
                  value={custForm.partnerId}
                  onChange={(e) => setCustForm({ ...custForm, partnerId: e.target.value })}
                >
                  {data.users.filter(u => u.role === 'araci' || u.role === 'admin').map((u) => (
                    <option key={u.id} value={u.id}>{u.name} ({u.title})</option>
                  ))}
                </select>
              </div>

              <div className="form-group" style={{ backgroundColor: '#eff6ff', padding: '12px', borderRadius: '8px', border: '1px solid #bfdbfe' }}>
                <label style={{ color: '#1e40af' }}>⚡ Otomatik Görev Şablonu Uygula</label>
                <select
                  className="form-select"
                  value={custForm.applyTemplate}
                  onChange={(e) => setCustForm({ ...custForm, applyTemplate: e.target.value })}
                >
                  <option value="">Şablon Uygulama (Boş Başlat)</option>
                  {data.templates.map(tmpl => (
                    <option key={tmpl.id} value={tmpl.id}>{tmpl.name} ({tmpl.taskItems.length} Görev)</option>
                  ))}
                </select>
              </div>

              <div className="modal-footer" style={{ margin: '0 -24px -24px -24px' }}>
                <button type="button" className="btn btn-secondary" onClick={onClose}>İptal</button>
                <button type="submit" className="btn btn-primary">Müşteriyi Oluştur</button>
              </div>
            </form>
          )}

          {/* Not Formu */}
          {activeTab === 'note' && (
            <form onSubmit={handleNoteSubmit}>
              <div className="form-group">
                <label>Müşteri Seçin *</label>
                <select
                  className="form-select"
                  value={noteForm.customerId}
                  onChange={(e) => setNoteForm({ ...noteForm, customerId: e.target.value })}
                >
                  {accessibleCustomers.map((c) => (
                    <option key={c.id} value={c.id}>{c.companyName}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Not İçeriği *</label>
                <textarea
                  className="form-textarea"
                  rows={4}
                  placeholder="Örn: Müşteri tasarımda koyu lacivert tonları istiyor..."
                  value={noteForm.content}
                  onChange={(e) => setNoteForm({ ...noteForm, content: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Renk Etiketi</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {['blue', 'amber', 'emerald', 'rose', 'purple'].map(color => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setNoteForm({ ...noteForm, color })}
                      style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        backgroundColor:
                          color === 'blue' ? '#3b82f6' :
                          color === 'amber' ? '#f59e0b' :
                          color === 'emerald' ? '#10b981' :
                          color === 'rose' ? '#ef4444' : '#8b5cf6',
                        border: noteForm.color === color ? '3px solid #0f172a' : 'none'
                      }}
                    />
                  ))}
                </div>
              </div>

              <div className="modal-footer" style={{ margin: '0 -24px -24px -24px' }}>
                <button type="button" className="btn btn-secondary" onClick={onClose}>İptal</button>
                <button type="submit" className="btn btn-primary">Notu Ekle</button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
