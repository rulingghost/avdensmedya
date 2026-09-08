import React, { useState, useEffect } from 'react';
import { X, CopyCheck, Plus, Trash2, Check, Sparkles } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function EditTemplateModal({ isOpen, onClose, template }) {
  const { data, updateTemplate } = useApp();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [taskItems, setTaskItems] = useState([]);

  useEffect(() => {
    if (template) {
      setName(template.name || '');
      setDescription(template.description || '');
      setTaskItems(template.taskItems ? [...template.taskItems] : []);
    }
  }, [template, isOpen]);

  if (!isOpen || !template) return null;

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
    if (taskItems.length <= 1) {
      alert('Şablonda en az bir görev bulunmalıdır.');
      return;
    }
    setTaskItems(taskItems.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Lütfen şablon adını giriniz.');
      return;
    }

    const validItems = taskItems.filter(item => item.title.trim() !== '');
    if (validItems.length === 0) {
      alert('Lütfen en az bir adet geçerli görev ekleyiniz.');
      return;
    }

    updateTemplate(template.id, {
      name: name.trim(),
      description: description.trim(),
      taskItems: validItems
    });

    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '680px' }} onClick={(e) => e.stopPropagation()}>
        {/* Modal Başlığı */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
              <CopyCheck size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Şablonu Düzenle</h3>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Şablon başlığı ve alt görevlerini güncelleyin
              </span>
            </div>
          </div>
          <button onClick={onClose} style={{ color: 'var(--text-muted)' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>

            <div className="form-group">
              <label>Şablon Adı *</label>
              <input
                type="text"
                className="form-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Örn: E-Ticaret ve Google Ads Başlangıç Şablonu"
                required
              />
            </div>

            <div className="form-group">
              <label>Açıklama</label>
              <input
                type="text"
                className="form-input"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Şablonun hangi durumlarda kullanılacağını belirtin"
              />
            </div>

            {/* Görev Maddeleri Listesi */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{ fontSize: '0.86rem', fontWeight: 700, color: 'var(--text-main)' }}>
                  Şablon Görevleri ({taskItems.length} Görev)
                </span>
                <button
                  type="button"
                  onClick={addTaskItem}
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: '0.78rem' }}
                >
                  <Plus size={14} />
                  <span>Görev Satırı Ekle</span>
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '280px', overflowY: 'auto', paddingRight: '4px' }}>
                {taskItems.map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      background: 'var(--bg-app)',
                      padding: '8px 10px',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-subtle)'
                    }}
                  >
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', width: '22px', textAlign: 'center' }}>
                      {idx + 1}.
                    </span>

                    <input
                      type="text"
                      className="form-input"
                      style={{ flex: 1, padding: '6px 10px', fontSize: '0.82rem' }}
                      value={item.title}
                      onChange={(e) => handleTaskChange(idx, 'title', e.target.value)}
                      placeholder="Görev adı..."
                      required
                    />

                    <select
                      className="form-select"
                      style={{ width: '140px', padding: '6px 8px', fontSize: '0.78rem' }}
                      value={item.category}
                      onChange={(e) => handleTaskChange(idx, 'category', e.target.value)}
                    >
                      {data.categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>

                    <select
                      className="form-select"
                      style={{ width: '100px', padding: '6px 8px', fontSize: '0.78rem' }}
                      value={item.priority}
                      onChange={(e) => handleTaskChange(idx, 'priority', e.target.value)}
                    >
                      <option value="dusuk">Düşük</option>
                      <option value="normal">Normal</option>
                      <option value="yuksek">Yüksek</option>
                      <option value="acil">Acil ⚡</option>
                    </select>

                    <button
                      type="button"
                      onClick={() => removeTaskItem(idx)}
                      style={{ color: 'var(--danger)', padding: '4px' }}
                      title="Görevi sil"
                    >
                      <Trash2 size={16} />
                    </button>
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
              <Check size={16} />
              <span>Değişiklikleri Kaydet</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
