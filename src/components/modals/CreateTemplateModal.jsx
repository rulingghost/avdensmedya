import React, { useState } from 'react';
import { X, CopyCheck, Plus, Trash2, Sparkles, Layers } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function CreateTemplateModal({ isOpen, onClose }) {
  const { data, addTemplate } = useApp();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [taskItems, setTaskItems] = useState([
    { title: 'Kurulum ve Hesap Doğrulaması', category: 'cat-meta', priority: 'yuksek' },
    { title: 'Hedef Kitle ve Rakip Analizi', category: 'cat-organik', priority: 'normal' },
    { title: 'İlk Kampanya Kurgusu', category: 'cat-reklam', priority: 'acil' }
  ]);

  if (!isOpen) return null;

  const handleTaskChange = (index, field, value) => {
    const updated = [...taskItems];
    updated[index][field] = value;
    setTaskItems(updated);
  };

  const addTaskItem = () => {
    setTaskItems([
      ...taskItems,
      { title: '', category: data.categories[0]?.id || 'cat-meta', priority: 'normal' }
    ]);
  };

  const removeTaskItem = (index) => {
    if (taskItems.length <= 1) return;
    setTaskItems(taskItems.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Lütfen şablon adını giriniz.');
      return;
    }

    const validTasks = taskItems.filter(t => t.title.trim() !== '');
    if (validTasks.length === 0) {
      alert('Lütfen en az bir adet görev maddesi ekleyiniz.');
      return;
    }

    addTemplate({
      name,
      description,
      taskItems: validTasks
    });

    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '640px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CopyCheck size={20} color="var(--primary)" />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Yeni Görev Şablonu Oluştur</h3>
          </div>
          <button onClick={onClose} style={{ color: 'var(--text-muted)' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

            <div className="form-group">
              <label>Şablon Adı *</label>
              <input
                type="text"
                className="form-input"
                placeholder="Örn: E-Ticaret Büyüme & Google Ads Paketi"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Şablon Açıklaması</label>
              <textarea
                className="form-textarea"
                rows={2}
                placeholder="Bu şablon hangi müşteri tipleri ve iş paketleri için kullanılır?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            {/* Dinamik Görev Maddeleri */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)' }}>
                  Şablon Görev Maddeleri ({taskItems.length} Adet)
                </span>
                <button
                  type="button"
                  onClick={addTaskItem}
                  style={{ fontSize: '0.78rem', color: 'var(--primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  <Plus size={14} />
                  <span>Görev Ekle</span>
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '280px', overflowY: 'auto', paddingRight: '4px' }}>
                {taskItems.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: '8px', alignItems: 'center', background: 'var(--bg-app)', padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', width: '20px' }}>
                      {idx + 1}.
                    </span>

                    <input
                      type="text"
                      className="form-input"
                      style={{ flex: 1, padding: '6px 10px', fontSize: '0.84rem' }}
                      placeholder="Görev Başlığı"
                      value={item.title}
                      onChange={(e) => handleTaskChange(idx, 'title', e.target.value)}
                      required
                    />

                    <select
                      className="form-select"
                      style={{ width: '130px', padding: '6px 8px', fontSize: '0.78rem' }}
                      value={item.category}
                      onChange={(e) => handleTaskChange(idx, 'category', e.target.value)}
                    >
                      {data.categories.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>

                    <select
                      className="form-select"
                      style={{ width: '100px', padding: '6px 8px', fontSize: '0.78rem' }}
                      value={item.priority}
                      onChange={(e) => handleTaskChange(idx, 'priority', e.target.value)}
                    >
                      <option value="normal">Normal</option>
                      <option value="yuksek">Yüksek</option>
                      <option value="acil">Acil ⚡</option>
                      <option value="dusuk">Düşük</option>
                    </select>

                    {taskItems.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeTaskItem(idx)}
                        style={{ color: 'var(--danger)', padding: '4px' }}
                        title="Bu görevi sil"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              İptal
            </button>
            <button type="submit" className="btn btn-primary">
              <Sparkles size={16} />
              <span>Şablonu Kaydet</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
