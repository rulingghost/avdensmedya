import React, { useState, useEffect } from 'react';
import { X, CopyCheck, Plus, Trash2, Check, Sparkles, FileText } from 'lucide-react';
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
      setTaskItems(
        template.taskItems
          ? template.taskItems.map(t => ({
              title: t.title || '',
              category: t.category || data.categories[0]?.id || 'cat-meta',
              priority: t.priority || 'normal',
              description: t.description || ''
            }))
          : []
      );
    }
  }, [template, isOpen]);

  if (!isOpen || !template) return null;

  const handleTaskChange = (index, field, value) => {
    const updated = [...taskItems];
    updated[index] = { ...updated[index], [field]: value };
    setTaskItems(updated);
  };

  const addTaskItem = () => {
    setTaskItems([
      ...taskItems,
      { title: '', category: data.categories[0]?.id || 'cat-meta', priority: 'normal', description: '' }
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
      <div className="modal-content" style={{ maxWidth: '720px', width: '95%' }} onClick={(e) => e.stopPropagation()}>
        {/* Modal Başlığı */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
              <CopyCheck size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Şablonu Düzenle</h3>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Şablon başlığı, alt görevleri ve yapılacak iş detaylarını güncelleyin
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
              <label>Şablon Açıklaması</label>
              <textarea
                className="form-textarea"
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Şablonun hangi durumlarda kullanılacağını belirtin"
              />
            </div>

            {/* Görev Maddeleri Listesi */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{ fontSize: '0.86rem', fontWeight: 700, color: 'var(--text-main)' }}>
                  Şablon Görev Maddeleri ({taskItems.length} Adet)
                </span>
                <button
                  type="button"
                  onClick={addTaskItem}
                  style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px', background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  <Plus size={15} />
                  <span>+ Görev Ekle</span>
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '380px', overflowY: 'auto', paddingRight: '4px' }}>
                {taskItems.map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                      background: 'var(--bg-app)',
                      padding: '12px 14px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-subtle)',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
                    }}
                  >
                    {/* Üst Satır: Sıra No, Görev Başlığı, Kategori, Öncelik, Sil */}
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-muted)', width: '22px', textAlign: 'center' }}>
                        {idx + 1}.
                      </span>

                      <input
                        type="text"
                        className="form-input"
                        style={{ flex: 1, padding: '7px 10px', fontSize: '0.84rem' }}
                        value={item.title}
                        onChange={(e) => handleTaskChange(idx, 'title', e.target.value)}
                        placeholder="Görev Başlığı *"
                        required
                      />

                      <select
                        className="form-select"
                        style={{ width: '135px', padding: '7px 8px', fontSize: '0.78rem' }}
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
                        style={{ width: '105px', padding: '7px 8px', fontSize: '0.78rem' }}
                        value={item.priority}
                        onChange={(e) => handleTaskChange(idx, 'priority', e.target.value)}
                      >
                        <option value="normal">Normal</option>
                        <option value="yuksek">Yüksek</option>
                        <option value="acil">Acil ⚡</option>
                        <option value="dusuk">Düşük</option>
                      </select>

                      <button
                        type="button"
                        onClick={() => removeTaskItem(idx)}
                        style={{ color: 'var(--danger)', padding: '6px', background: 'transparent', border: 'none', cursor: 'pointer', borderRadius: '4px' }}
                        title="Bu görevi sil"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    {/* Alt Satır: Yapılacak İş Not / Detay Alanı */}
                    <div style={{ paddingLeft: '30px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '4px' }}>
                        <FileText size={12} color="var(--primary)" />
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-main)' }}>
                          Yapılacak İş:
                        </span>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                          (İşin detayı, uygulanacak adımlar ve açıklaması)
                        </span>
                      </div>
                      <textarea
                        className="form-textarea"
                        rows={2}
                        style={{
                          width: '100%',
                          padding: '7px 10px',
                          fontSize: '0.8rem',
                          borderRadius: 'var(--radius-sm)',
                          background: '#ffffff',
                          border: '1px solid var(--border-color)',
                          resize: 'vertical'
                        }}
                        placeholder="Bu adımda yapılacak işin detayını, uygulanacak adımları ve talimatları yazın..."
                        value={item.description || ''}
                        onChange={(e) => handleTaskChange(idx, 'description', e.target.value)}
                      />
                    </div>
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
