import React, { useState } from 'react';
import { X, UserPlus, CheckSquare, FileText, Sparkles, UserCheck, AlertCircle, Instagram, Calendar } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function QuickActionModal({ isOpen, onClose }) {
  const { data, addTask, addCustomer, addNote, addUser, addContentPost, currentUser, selectedCustomerId, getAccessibleCustomers } = useApp();

  const accessibleCustomers = getAccessibleCustomers();
  const defaultCustId = selectedCustomerId && accessibleCustomers.some(c => c.id === selectedCustomerId)
    ? selectedCustomerId
    : (accessibleCustomers[0]?.id || '');

  const [activeTab, setActiveTab] = useState('task'); // 'task' | 'post' | 'customer' | 'note' | 'user'

  const [mouseDownOnOverlay, setMouseDownOnOverlay] = useState(false);

  // Görev formu
  const [taskForm, setTaskForm] = useState({
    title: '',
    customerId: defaultCustId,
    categoryId: data.categories[0]?.id || 'cat-meta',
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
    partnerId: data.users.find(u => u.role === 'araci')?.id || data.users[0]?.id || '',
    applyTemplate: data.templates[0]?.id || ''
  });

  // Not formu
  const [noteForm, setNoteForm] = useState({
    customerId: defaultCustId,
    content: '',
    color: 'blue'
  });

  // Ekip / Yetkili formu (Sadece Admin)
  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
    password: '123',
    role: 'araci',
    title: 'İş Ortağı / Aracı',
    phone: ''
  });
  const [userError, setUserError] = useState('');

  // Sosyal Medya Gönderi formu (Madde 2)
  const [postForm, setPostForm] = useState({
    title: '',
    customerId: defaultCustId,
    caption: '',
    platform: 'instagram',
    mediaType: 'image',
    mediaUrl: '',
    scheduledDate: new Date(Date.now() + 86400000).toISOString().slice(0, 16),
    status: 'onay_bekliyor'
  });

  if (!isOpen) return null;

  const handlePostSubmit = (e) => {
    e.preventDefault();
    if (!postForm.title.trim()) return;
    addContentPost(postForm);
    onClose();
  };

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

  const handleUserSubmit = async (e) => {
    e.preventDefault();
    setUserError('');
    const res = await addUser(userForm);
    if (res.success) {
      onClose();
    } else {
      setUserError(res.message);
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
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
      >
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
        <div style={{ display: 'flex', padding: '12px 24px 0 24px', gap: '8px', borderBottom: '1px solid var(--border-color)', flexWrap: 'wrap' }}>
          <button
            className={`btn btn-sm ${activeTab === 'task' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('task')}
          >
            <CheckSquare size={14} />
            <span>Yeni Görev</span>
          </button>
          <button
            className={`btn btn-sm ${activeTab === 'post' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('post')}
            style={activeTab === 'post' ? { background: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)', borderColor: 'transparent', color: '#fff' } : {}}
          >
            <Instagram size={14} />
            <span>İçerik Planla</span>
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
          {currentUser.role === 'admin' && (
            <button
              className={`btn btn-sm ${activeTab === 'user' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setActiveTab('user')}
              style={activeTab === 'user' ? { background: '#8b5cf6', borderColor: '#8b5cf6' } : {}}
            >
              <UserCheck size={14} />
              <span>Yeni Ekip / Aracı</span>
            </button>
          )}
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

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
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

          {/* Sosyal Medya İçerik Formu (Madde 2) */}
          {activeTab === 'post' && (
            <form onSubmit={handlePostSubmit}>
              <div className="form-group">
                <label>Müşteri Seçin *</label>
                <select
                  className="form-select"
                  value={postForm.customerId}
                  onChange={(e) => setPostForm({ ...postForm, customerId: e.target.value })}
                  required
                >
                  {accessibleCustomers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.companyName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>İçerik Başlığı / Konusu *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Örn: Yeni Sezon İndirim Kampanyası"
                  value={postForm.title}
                  onChange={(e) => setPostForm({ ...postForm, title: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
                <div className="form-group">
                  <label>Platform</label>
                  <select
                    className="form-select"
                    value={postForm.platform}
                    onChange={(e) => setPostForm({ ...postForm, platform: e.target.value })}
                  >
                    <option value="instagram">Instagram</option>
                    <option value="facebook">Facebook</option>
                    <option value="linkedin">LinkedIn</option>
                    <option value="tiktok">TikTok</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Format</label>
                  <select
                    className="form-select"
                    value={postForm.mediaType}
                    onChange={(e) => setPostForm({ ...postForm, mediaType: e.target.value })}
                  >
                    <option value="image">Gönderi (Fotoğraf)</option>
                    <option value="reels">Reels Videosu</option>
                    <option value="carousel">Karusel</option>
                    <option value="story">Hikaye (Story)</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Görsel / Video URL</label>
                <input
                  type="url"
                  className="form-input"
                  placeholder="https://..."
                  value={postForm.mediaUrl}
                  onChange={(e) => setPostForm({ ...postForm, mediaUrl: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Planlanan Tarih &amp; Saat</label>
                <input
                  type="datetime-local"
                  className="form-input"
                  value={postForm.scheduledDate}
                  onChange={(e) => setPostForm({ ...postForm, scheduledDate: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Açıklama / Metin (Caption)</label>
                <textarea
                  className="form-textarea"
                  rows={3}
                  placeholder="Gönderi metni ve etiketler..."
                  value={postForm.caption}
                  onChange={(e) => setPostForm({ ...postForm, caption: e.target.value })}
                />
              </div>

              <div className="modal-footer" style={{ margin: '0 -24px -24px -24px' }}>
                <button type="button" className="btn btn-secondary" onClick={onClose}>İptal</button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ background: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)', borderColor: 'transparent' }}
                >
                  İçeriği Planla
                </button>
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

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
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

          {/* Yeni Ekip / Aracı Formu (Sadece Admin) */}
          {activeTab === 'user' && (
            <form onSubmit={handleUserSubmit}>
              {userError && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--danger-light)',
                  color: 'var(--danger-text)',
                  fontSize: '0.84rem',
                  marginBottom: '14px',
                  border: '1px solid #fecaca'
                }}>
                  <AlertCircle size={16} flexShrink={0} />
                  <span>{userError}</span>
                </div>
              )}

              <div className="form-group">
                <label>Hesap Rolü *</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '4px' }}>
                  <button
                    type="button"
                    onClick={() => setUserForm({ ...userForm, role: 'araci', title: 'İş Ortağı / Aracı' })}
                    style={{
                      padding: '10px',
                      borderRadius: '8px',
                      border: `2px solid ${userForm.role === 'araci' ? '#10b981' : 'var(--border-color)'}`,
                      background: userForm.role === 'araci' ? 'rgba(16, 185, 129, 0.1)' : 'var(--bg-app)',
                      fontWeight: 600,
                      fontSize: '0.84rem',
                      cursor: 'pointer',
                      color: userForm.role === 'araci' ? '#059669' : 'var(--text-main)'
                    }}
                  >
                    🤝 İş Ortağı (Aracı)
                  </button>

                  <button
                    type="button"
                    onClick={() => setUserForm({ ...userForm, role: 'admin', title: 'Ajans Yöneticisi' })}
                    style={{
                      padding: '10px',
                      borderRadius: '8px',
                      border: `2px solid ${userForm.role === 'admin' ? '#8b5cf6' : 'var(--border-color)'}`,
                      background: userForm.role === 'admin' ? 'rgba(139, 92, 246, 0.1)' : 'var(--bg-app)',
                      fontWeight: 600,
                      fontSize: '0.84rem',
                      cursor: 'pointer',
                      color: userForm.role === 'admin' ? '#7c3aed' : 'var(--text-main)'
                    }}
                  >
                    👑 Yönetici (Admin)
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label>Ad Soyad *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Örn: Burak Özdemir"
                  value={userForm.name}
                  onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>E-posta Adresi *</label>
                <input
                  type="email"
                  className="form-input"
                  placeholder="burak@avdens.work"
                  value={userForm.email}
                  onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
                <div className="form-group">
                  <label>Giriş Şifresi *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Şifre"
                    value={userForm.password}
                    onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Telefon</label>
                  <input
                    type="tel"
                    className="form-input"
                    placeholder="+90 532 000 00 00"
                    value={userForm.phone}
                    onChange={(e) => setUserForm({ ...userForm, phone: e.target.value })}
                  />
                </div>
              </div>

              <div className="modal-footer" style={{ margin: '0 -24px -24px -24px' }}>
                <button type="button" className="btn btn-secondary" onClick={onClose}>İptal</button>
                <button type="submit" className="btn btn-primary">Yetkiliyi Oluştur</button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
