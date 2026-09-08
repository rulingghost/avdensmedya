import React, { useState } from 'react';
import { X, Layers, Plus, Edit2, Trash2, Check, Sparkles } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function CategoryManagerModal({ isOpen, onClose }) {
  const { data, addCategory, updateCategory, deleteCategory } = useApp();

  const [editingCatId, setEditingCatId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editColor, setEditColor] = useState('#3B82F6');

  // Yeni kategori formu
  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState('#3B82F6');

  if (!isOpen) return null;

  const colorPresets = [
    '#3B82F6', '#8B5CF6', '#EC4899', '#10B981', '#F59E0B', '#EF4444', '#6366F1', '#14B8A6'
  ];

  const handleStartEdit = (cat) => {
    setEditingCatId(cat.id);
    setEditName(cat.name);
    setEditColor(cat.color || '#3B82F6');
  };

  const handleSaveEdit = (catId) => {
    if (!editName.trim()) return;
    updateCategory(catId, { name: editName.trim(), color: editColor });
    setEditingCatId(null);
  };

  const handleAddCategory = (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    addCategory({ name: newName.trim(), color: newColor });
    setNewName('');
  };

  const handleDeleteCategory = (catId, catName) => {
    if (window.confirm(`"${catName}" kategorisini silmek istediğinizden emin misiniz?`)) {
      deleteCategory(catId);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '580px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
              <Layers size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Görev Kategorileri Yöneticisi</h3>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Meta, Reklam, Organik Büyüme gibi görev kategorilerini ekleyin veya düzenleyin
              </span>
            </div>
          </div>
          <button onClick={onClose} style={{ color: 'var(--text-muted)' }}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* Yeni Kategori Ekleme Formu */}
          <form onSubmit={handleAddCategory} style={{ background: 'var(--bg-app)', padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)' }}>+ Yeni Kategori Ekle</span>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <input
                type="text"
                className="form-input"
                style={{ flex: 1 }}
                placeholder="Örn: Google Reklamları, E-Ticaret vb."
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                required
              />

              {/* Renk Seçimi */}
              <div style={{ display: 'flex', gap: '4px' }}>
                {colorPresets.slice(0, 4).map((c) => (
                  <div
                    key={c}
                    onClick={() => setNewColor(c)}
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: '50%',
                      background: c,
                      cursor: 'pointer',
                      border: newColor === c ? '2px solid #000' : 'none',
                      transform: newColor === c ? 'scale(1.15)' : 'scale(1)'
                    }}
                  />
                ))}
              </div>

              <button type="submit" className="btn btn-primary btn-sm" style={{ whiteSpace: 'nowrap' }}>
                <Plus size={14} />
                <span>Ekle</span>
              </button>
            </div>
          </form>

          {/* Mevcut Kategoriler Listesi */}
          <div>
            <span style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-main)', display: 'block', marginBottom: '10px' }}>
              Mevcut Kategoriler ({data.categories.length})
            </span>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '280px', overflowY: 'auto' }}>
              {data.categories.map((cat) => (
                <div
                  key={cat.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-subtle)',
                    background: '#ffffff'
                  }}
                >
                  {editingCatId === cat.id ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
                      <input
                        type="text"
                        className="form-input"
                        style={{ flex: 1, padding: '4px 8px', fontSize: '0.84rem' }}
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                      />
                      <div style={{ display: 'flex', gap: '4px' }}>
                        {colorPresets.map((c) => (
                          <div
                            key={c}
                            onClick={() => setEditColor(c)}
                            style={{
                              width: 18,
                              height: 18,
                              borderRadius: '50%',
                              background: c,
                              cursor: 'pointer',
                              border: editColor === c ? '2px solid #000' : 'none'
                            }}
                          />
                        ))}
                      </div>
                      <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        onClick={() => handleSaveEdit(cat.id)}
                        style={{ padding: '4px 8px' }}
                      >
                        <Check size={14} />
                      </button>
                    </div>
                  ) : (
                    <>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: 14, height: 14, borderRadius: '4px', background: cat.color || '#3B82F6' }} />
                        <span style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-main)' }}>
                          {cat.name}
                        </span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <button
                          type="button"
                          onClick={() => handleStartEdit(cat)}
                          style={{ color: 'var(--text-muted)', padding: '4px' }}
                          title="Kategoriyi Düzenle"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteCategory(cat.id, cat.name)}
                          style={{ color: 'var(--danger)', padding: '4px' }}
                          title="Kategoriyi Sil"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>

        </div>

        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
}
