import React, { useState } from 'react';
import { X, CopyCheck, Plus, Trash2, Sparkles, Layers, FileText, FileSpreadsheet } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function CreateTemplateModal({ isOpen, onClose, onOpenImport }) {
  const { data, addTemplate } = useApp();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [taskItems, setTaskItems] = useState([
    {
      title: 'Meta Business Kurulumu ve Hesap Doğrulama',
      category: 'cat-meta',
      priority: 'yuksek',
      description: 'Meta Business Suite portali kurulumu, iki faktörlü kimlik doğrulaması ve alan adı doğrulama işlemleri.'
    },
    {
      title: 'Hedef Kitle ve Rakip Analizi',
      category: 'cat-organik',
      priority: 'normal',
      description: 'Sektörel anahtar kelimeler, rakip sosyal medya hesapları ve hedef demografik kitle çalışması.'
    },
    {
      title: 'İlk Kampanya Kurgusu ve Reklam Açılışı',
      category: 'cat-reklam',
      priority: 'acil',
      description: 'Test bütçeli ilk reklam kampanyasının hedef kitle, görsel ve metin kurgusunun yayına alınması.'
    }
  ]);

  if (!isOpen) return null;

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
      name: name.trim(),
      description: description.trim(),
      taskItems: validTasks
    });

    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '720px', width: '95%' }} onClick={(e) => e.stopPropagation()}>
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
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)' }}>
                  Şablon Görev Maddeleri ({taskItems.length} Adet)
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  {onOpenImport && (
                    <button
                      type="button"
                      onClick={onOpenImport}
                      style={{
                        fontSize: '0.8rem',
                        color: '#059669',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        background: '#ecfdf5',
                        border: '1px solid #a7f3d0',
                        padding: '4px 8px',
                        borderRadius: '6px',
                        cursor: 'pointer'
                      }}
                      title="Excel dosyasından toplu yüklemek için tıklayın"
                    >
                      <FileSpreadsheet size={14} />
                      <span>Excel'den İçe Aktar</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={addTaskItem}
                    style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px', background: 'none', border: 'none', cursor: 'pointer' }}
                  >
                    <Plus size={15} />
                    <span>+ Görev Ekle</span>
                  </button>
                </div>
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
                        placeholder="Görev Başlığı *"
                        value={item.title}
                        onChange={(e) => handleTaskChange(idx, 'title', e.target.value)}
                        required
                      />

                      <select
                        className="form-select"
                        style={{ width: '135px', padding: '7px 8px', fontSize: '0.78rem' }}
                        value={item.category}
                        onChange={(e) => handleTaskChange(idx, 'category', e.target.value)}
                      >
                        {data.categories.map(c => (
                          <option key={c.id} value={c.id}>{c.name}</option>
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

                      {taskItems.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeTaskItem(idx)}
                          style={{ color: 'var(--danger)', padding: '6px', background: 'transparent', border: 'none', cursor: 'pointer', borderRadius: '4px' }}
                          title="Bu görevi sil"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
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
