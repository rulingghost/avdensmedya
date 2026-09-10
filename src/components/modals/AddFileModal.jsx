import React, { useState } from 'react';
import { X, UploadCloud, FileText } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function AddFileModal({ isOpen, onClose, customerId }) {
  const { addFile } = useApp();

  const [fileName, setFileName] = useState('');
  const [category, setCategory] = useState('Logo');
  const [description, setDescription] = useState('');
  const [fileSize, setFileSize] = useState('2.5 MB');
  const [mouseDownOnOverlay, setMouseDownOnOverlay] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!fileName.trim()) return;

    // Uzantı tespiti
    const ext = fileName.includes('.') ? fileName.split('.').pop().toLowerCase() : 'pdf';

    addFile(customerId, {
      name: fileName,
      category,
      description,
      size: fileSize,
      type: ext
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
        style={{ maxWidth: '520px' }}
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <UploadCloud size={20} color="var(--primary)" />
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Yeni Dosya Yükle / Ekle</h3>
          </div>
          <button onClick={onClose} style={{ color: 'var(--text-muted)' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

            <div className="form-group">
              <label>Dosya Adı & Uzantısı *</label>
              <input
                type="text"
                className="form-input"
                placeholder="Örn: Yeni_Logo_Vektorel.svg veya Reklam_Plan.pdf"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-group">
                <label>Dosya Kategorisi *</label>
                <select
                  className="form-select"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="Logo">Logo</option>
                  <option value="Kurumsal Kimlik">Kurumsal Kimlik</option>
                  <option value="Sözleşme">Sözleşme</option>
                  <option value="Reklam Görselleri">Reklam Görselleri</option>
                  <option value="Ürün Fotoğrafları">Ürün Fotoğrafları</option>
                  <option value="Rapor">Rapor</option>
                  <option value="Diğer">Diğer</option>
                </select>
              </div>

              <div className="form-group">
                <label>Boyut (Örnek)</label>
                <input
                  type="text"
                  className="form-input"
                  value={fileSize}
                  onChange={(e) => setFileSize(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Açıklama</label>
              <textarea
                className="form-textarea"
                rows={3}
                placeholder="Dosyanın içeriği veya revizyon notu..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              İptal
            </button>
            <button type="submit" className="btn btn-primary">
              Dosyayı Kaydet
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
