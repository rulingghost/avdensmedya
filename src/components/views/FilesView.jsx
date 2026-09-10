import React, { useState } from 'react';
import {
  FolderOpen,
  FileText,
  Download,
  UploadCloud,
  Plus,
  Search,
  LayoutGrid,
  List,
  Image as ImageIcon,
  Trash2,
  ExternalLink,
  Eye,
  X,
  File
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import AddFileModal from '../modals/AddFileModal';

export default function FilesView() {
  const { data, currentUser, getAccessibleCustomers, deleteFile } = useApp();

  const accessibleCustomers = getAccessibleCustomers();

  const [selectedCustomerId, setSelectedCustomerId] = useState(() => {
    if (currentUser.role === 'musteri') {
      return currentUser.customerId || accessibleCustomers[0]?.id || '';
    }
    return accessibleCustomers[0]?.id || '';
  });

  const [selectedFolder, setSelectedFolder] = useState('all');
  const [viewMode, setViewMode] = useState('gallery'); // 'gallery' | 'grid' | 'table'
  const [fileSearch, setFileSearch] = useState('');
  const [isFileModalOpen, setIsFileModalOpen] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);

  const customer = accessibleCustomers.find(c => c.id === selectedCustomerId) || accessibleCustomers[0] || null;
  const rawFiles = customer ? data.files.filter(f => f.customerId === customer.id) : [];

  // Klasör kategorileri
  const folderTabs = [
    { id: 'all', label: 'Tüm Dosyalar', icon: '📁' },
    { id: 'Logo', label: 'Logolar & Kurumsal', icon: '🎨' },
    { id: 'Sözleşme', label: 'Sözleşmeler & Evrak', icon: '📑' },
    { id: 'Reklam Görselleri', label: 'Reklam Materyalleri', icon: '📸' },
    { id: 'Ürün Fotoğrafları', label: 'Ürün & Medya Arşivi', icon: '🖼️' },
    { id: 'Rapor', label: 'Fatura & Raporlar', icon: '📊' },
    { id: 'Diğer', label: 'Diğer', icon: '📦' }
  ];

  // Filtreleme
  const filteredFiles = rawFiles.filter(f => {
    // Klasör filtresi
    if (selectedFolder !== 'all') {
      const cat = (f.category || '').toLowerCase();
      if (selectedFolder === 'Logo' && !cat.includes('logo') && !cat.includes('kurumsal')) return false;
      else if (selectedFolder === 'Sözleşme' && !cat.includes('sözleşme') && !cat.includes('evrak')) return false;
      else if (selectedFolder === 'Reklam Görselleri' && !cat.includes('reklam')) return false;
      else if (selectedFolder === 'Ürün Fotoğrafları' && !cat.includes('ürün') && !cat.includes('foto')) return false;
      else if (selectedFolder === 'Rapor' && !cat.includes('rapor') && !cat.includes('fatura')) return false;
      else if (selectedFolder === 'Diğer' && !['diğer', 'belge', 'file'].some(k => cat.includes(k))) return false;
    }

    // Arama
    if (fileSearch.trim()) {
      const q = fileSearch.toLowerCase();
      const matchName = f.name?.toLowerCase().includes(q);
      const matchDesc = f.description?.toLowerCase().includes(q);
      const matchUploader = f.uploadedBy?.toLowerCase().includes(q);
      if (!matchName && !matchDesc && !matchUploader) return false;
    }

    return true;
  });

  const getFileCategoryCount = (tabId) => {
    if (tabId === 'all') return rawFiles.length;
    return rawFiles.filter(f => {
      const cat = (f.category || '').toLowerCase();
      if (tabId === 'Logo') return cat.includes('logo') || cat.includes('kurumsal');
      if (tabId === 'Sözleşme') return cat.includes('sözleşme') || cat.includes('evrak');
      if (tabId === 'Reklam Görselleri') return cat.includes('reklam');
      if (tabId === 'Ürün Fotoğrafları') return cat.includes('ürün') || cat.includes('foto');
      if (tabId === 'Rapor') return cat.includes('rapor') || cat.includes('fatura');
      if (tabId === 'Diğer') return ['diğer', 'belge', 'file'].some(k => cat.includes(k));
      return (f.category || '') === tabId;
    }).length;
  };

  const isImageFile = (file) => {
    const ext = file.name?.split('.').pop()?.toLowerCase() || file.type?.toLowerCase() || '';
    return ['png', 'jpg', 'jpeg', 'webp', 'gif', 'svg'].includes(ext) || Boolean(file.previewUrl || file.url);
  };

  const getFileImageSrc = (file) => {
    if (file.previewUrl) return file.previewUrl;
    if (file.url) return file.url;
    // Sembolik / örnek görsel fallback
    const ext = file.name?.split('.').pop()?.toLowerCase() || '';
    if (ext === 'png' || ext === 'jpg' || ext === 'jpeg') {
      return `https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80`;
    }
    return null;
  };

  const handleDownload = (file) => {
    if (file.url) {
      window.open(file.url, '_blank');
    } else {
      alert(`"${file.name}" dosyası indiriliyor.`);
    }
  };

  const handleDeleteFile = (fileId, fileName) => {
    if (window.confirm(`"${fileName}" dosyasını silmek istediğinize emin misiniz?`)) {
      deleteFile(fileId);
      if (previewFile?.id === fileId) setPreviewFile(null);
    }
  };

  if (!customer) {
    return (
      <div className="card" style={{ padding: '48px 24px', textAlign: 'center', maxWidth: '600px', margin: '40px auto' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-main)' }}>Atanmış Müşteri Bulunmuyor</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginTop: '8px' }}>
          Dosyaları görüntülemek için erişim yetkiniz olan bir müşteri kaydı bulunmamaktadır.
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '1100px', margin: '0 auto' }}>

      {/* Üst Başlık & Proje Seçimi */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: 42, height: 42, borderRadius: 'var(--radius-md)', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FolderOpen size={22} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
              Proje Dosyaları & Medya Galerisi
            </h2>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              {customer?.companyName} • Logolar, sözleşmeler, reklam materyalleri ve raporlar
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {currentUser.role !== 'musteri' && accessibleCustomers.length > 1 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)' }}>Proje:</span>
              <select
                className="form-select"
                style={{ width: 'auto', padding: '6px 12px', fontSize: '0.85rem' }}
                value={customer.id}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
              >
                {accessibleCustomers.map(c => (
                  <option key={c.id} value={c.id}>{c.companyName}</option>
                ))}
              </select>
            </div>
          )}

          <button className="btn btn-primary" onClick={() => setIsFileModalOpen(true)}>
            <UploadCloud size={16} />
            <span>Yeni Dosya Yükle</span>
          </button>
        </div>
      </div>

      {/* Kontrol Çubuğu: Klasör Sekmeleri & Arama & Görünüm Seçici */}
      <div className="card" style={{ padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        
        {/* Klasör / Kategori Sekmeleri */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
          {folderTabs.map((tab) => {
            const count = getFileCategoryCount(tab.id);
            const isActive = selectedFolder === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setSelectedFolder(tab.id)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '7px 14px',
                  borderRadius: '20px',
                  fontSize: '0.82rem',
                  fontWeight: isActive ? 700 : 500,
                  border: isActive ? '1px solid var(--primary)' : '1px solid var(--border-color)',
                  backgroundColor: isActive ? 'var(--primary-light)' : '#ffffff',
                  color: isActive ? 'var(--primary)' : 'var(--text-muted)',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.2s ease'
                }}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
                <span
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    padding: '1px 6px',
                    borderRadius: '10px',
                    backgroundColor: isActive ? 'var(--primary)' : 'var(--border-subtle)',
                    color: isActive ? '#ffffff' : 'var(--text-muted)'
                  }}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Arama ve Görünüm Değiştirici */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '220px', maxWidth: '400px' }}>
            <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              className="form-input"
              placeholder="Dosya adı, uploader veya açıklama ara..."
              value={fileSearch}
              onChange={(e) => setFileSearch(e.target.value)}
              style={{ paddingLeft: '34px', fontSize: '0.84rem' }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginRight: '4px' }}>Görünüm:</span>
            <button
              onClick={() => setViewMode('gallery')}
              className={`btn btn-sm ${viewMode === 'gallery' ? 'btn-primary' : 'btn-secondary'}`}
              title="Görsel Galeri Modu"
              style={{ padding: '6px 10px' }}
            >
              <ImageIcon size={15} />
              <span style={{ fontSize: '0.78rem' }}>Galeri</span>
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`btn btn-sm ${viewMode === 'grid' ? 'btn-primary' : 'btn-secondary'}`}
              title="Kart Modu"
              style={{ padding: '6px 10px' }}
            >
              <LayoutGrid size={15} />
              <span style={{ fontSize: '0.78rem' }}>Kartlar</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`btn btn-sm ${viewMode === 'table' ? 'btn-primary' : 'btn-secondary'}`}
              title="Liste Modu"
              style={{ padding: '6px 10px' }}
            >
              <List size={15} />
              <span style={{ fontSize: '0.78rem' }}>Tablo</span>
            </button>
          </div>
        </div>
      </div>

      {/* DOSYA LİSTESİ / GALERİ GÖRÜNÜMÜ */}
      {filteredFiles.length === 0 ? (
        <div className="card" style={{ padding: '48px 24px', textAlign: 'center', color: 'var(--text-muted)' }}>
          <FolderOpen size={40} style={{ margin: '0 auto 12px auto', opacity: 0.4 }} />
          <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '4px' }}>
            Dosya Bulunamadı
          </h4>
          <p style={{ fontSize: '0.84rem' }}>
            {fileSearch ? 'Arama kriterinize uygun dosya bulunamadı.' : 'Bu klasörde henüz yüklenmiş bir dosya bulunmuyor.'}
          </p>
        </div>
      ) : viewMode === 'gallery' ? (
        /* GÖRSEL GALERİ MODU (Thumbnails + Resim Önizleme) */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px' }}>
          {filteredFiles.map((file) => {
            const isImg = isImageFile(file);
            const imgSrc = getFileImageSrc(file);
            const ext = file.name?.split('.').pop()?.toUpperCase() || 'FILE';

            return (
              <div
                key={file.id}
                className="card"
                style={{
                  overflow: 'hidden',
                  padding: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  cursor: 'pointer'
                }}
                onClick={() => setPreviewFile(file)}
              >
                {/* Görsel / Belge Başlık Kutusu */}
                <div
                  style={{
                    height: '140px',
                    backgroundColor: 'var(--bg-app)',
                    position: 'relative',
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  {isImg && imgSrc ? (
                    <img
                      src={imgSrc}
                      alt={file.name}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        transition: 'transform 0.3s ease'
                      }}
                      onMouseOver={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
                      onMouseOut={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                    />
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                      <div
                        style={{
                          width: 52,
                          height: 52,
                          borderRadius: '12px',
                          backgroundColor: 'var(--primary-light)',
                          color: 'var(--primary)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <FileText size={28} />
                      </div>
                      <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)' }}>
                        .{ext}
                      </span>
                    </div>
                  )}

                  {/* Kategori Rozeti */}
                  <span
                    style={{
                      position: 'absolute',
                      top: 8,
                      left: 8,
                      backgroundColor: 'rgba(15, 23, 42, 0.75)',
                      backdropFilter: 'blur(4px)',
                      color: '#ffffff',
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: '12px'
                    }}
                  >
                    {file.category}
                  </span>

                  {/* Boyut Rozeti */}
                  <span
                    style={{
                      position: 'absolute',
                      bottom: 8,
                      right: 8,
                      backgroundColor: 'rgba(15, 23, 42, 0.75)',
                      backdropFilter: 'blur(4px)',
                      color: '#ffffff',
                      fontSize: '0.68rem',
                      fontWeight: 600,
                      padding: '2px 6px',
                      borderRadius: '4px'
                    }}
                  >
                    {file.size}
                  </span>
                </div>

                {/* Alt Detay Alanı */}
                <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <strong
                    style={{
                      fontSize: '0.86rem',
                      color: 'var(--text-main)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}
                    title={file.name}
                  >
                    {file.name}
                  </strong>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                    <span>{file.uploadedBy || 'Yetkili'}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownload(file);
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--primary)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '2px',
                        fontWeight: 600
                      }}
                    >
                      <Download size={12} /> İndir
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : viewMode === 'grid' ? (
        /* STANDART KART GÖRÜNÜMÜ */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
          {filteredFiles.map((file) => (
            <div key={file.id} className="card" style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <div style={{ width: 42, height: 42, borderRadius: 'var(--radius-md)', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <FileText size={22} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <strong style={{ fontSize: '0.92rem', color: 'var(--text-main)', display: 'block', wordBreak: 'break-all' }}>
                    {file.name}
                  </strong>
                  <span style={{ fontSize: '0.74rem', color: 'var(--primary)', fontWeight: 700 }}>
                    {file.category} • {file.size}
                  </span>
                </div>
              </div>

              {file.description && (
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                  {file.description}
                </p>
              )}

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '10px', borderTop: '1px solid var(--border-subtle)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                <span>{file.uploadedBy}</span>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => setPreviewFile(file)}
                    style={{ fontSize: '0.74rem', padding: '4px 8px' }}
                    title="Önizle"
                  >
                    <Eye size={13} />
                  </button>
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => handleDownload(file)}
                    style={{ fontSize: '0.74rem', padding: '4px 10px' }}
                  >
                    <Download size={13} />
                    <span>İndir</span>
                  </button>
                  {currentUser.role !== 'musteri' && (
                    <button
                      className="btn btn-danger-outline btn-sm"
                      onClick={() => handleDeleteFile(file.id, file.name)}
                      style={{ fontSize: '0.74rem', padding: '4px 8px' }}
                      title="Sil"
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* TABLO MODU (List View) */
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.86rem', textAlign: 'left' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--bg-app)', borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.78rem', textTransform: 'uppercase' }}>
                  <th style={{ padding: '12px 16px' }}>Dosya Adı</th>
                  <th style={{ padding: '12px 16px' }}>Klasör / Kategori</th>
                  <th style={{ padding: '12px 16px' }}>Boyut</th>
                  <th style={{ padding: '12px 16px' }}>Yükleyen</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right' }}>İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {filteredFiles.map((file) => (
                  <tr key={file.id} style={{ borderBottom: '1px solid var(--border-subtle)', transition: 'background-color 0.15s ease' }}>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FileText size={16} color="var(--primary)" />
                        <strong style={{ color: 'var(--text-main)', cursor: 'pointer' }} onClick={() => setPreviewFile(file)}>
                          {file.name}
                        </strong>
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span className="badge badge-kategori" style={{ fontSize: '0.74rem' }}>
                        {file.category}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', color: 'var(--text-muted)' }}>
                      {file.size}
                    </td>
                    <td style={{ padding: '12px 16px', color: 'var(--text-muted)' }}>
                      {file.uploadedBy || 'Yetkili'}
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '6px' }}>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => setPreviewFile(file)}
                          style={{ padding: '4px 8px' }}
                          title="Önizle"
                        >
                          <Eye size={13} />
                        </button>
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => handleDownload(file)}
                          style={{ padding: '4px 10px', fontSize: '0.74rem' }}
                        >
                          <Download size={13} /> İndir
                        </button>
                        {currentUser.role !== 'musteri' && (
                          <button
                            className="btn btn-danger-outline btn-sm"
                            onClick={() => handleDeleteFile(file.id, file.name)}
                            style={{ padding: '4px 8px' }}
                            title="Sil"
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* DOSYA ÖNİZLEME (LIGHTBOX) MODALI */}
      {previewFile && (
        <div
          className="modal-overlay"
          onClick={() => setPreviewFile(null)}
        >
          <div
            className="modal-content"
            style={{ maxWidth: '640px', padding: 0, overflow: 'hidden' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileText size={18} color="var(--primary)" />
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
                  Dosya Önizleme
                </h3>
              </div>
              <button
                onClick={() => setPreviewFile(null)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body: Görsel veya Büyük İkon */}
            <div style={{ backgroundColor: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '260px', maxHeight: '380px', overflow: 'hidden' }}>
              {isImageFile(previewFile) && getFileImageSrc(previewFile) ? (
                <img
                  src={getFileImageSrc(previewFile)}
                  alt={previewFile.name}
                  style={{ maxWidth: '100%', maxHeight: '360px', objectFit: 'contain' }}
                />
              ) : (
                <div style={{ textAlign: 'center', color: '#94a3b8', padding: '40px' }}>
                  <File size={64} style={{ margin: '0 auto 12px auto', opacity: 0.6 }} />
                  <p style={{ fontSize: '0.9rem', color: '#f8fafc', fontWeight: 600 }}>
                    Bu dosya formatı için doğrudan önizleme desteklenmiyor.
                  </p>
                  <span style={{ fontSize: '0.8rem' }}>İçeriği görüntülemek için dosyayı indirebilirsiniz.</span>
                </div>
              )}
            </div>

            {/* Dosya Bilgileri & Aksiyonlar */}
            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <strong style={{ fontSize: '1.05rem', color: 'var(--text-main)', display: 'block' }}>
                  {previewFile.name}
                </strong>
                <span style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 600 }}>
                  {previewFile.category} • {previewFile.size}
                </span>
              </div>

              {previewFile.description && (
                <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5, backgroundColor: 'var(--bg-app)', padding: '10px 14px', borderRadius: 'var(--radius-sm)' }}>
                  {previewFile.description}
                </p>
              )}

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                <span>Yükleyen: <strong>{previewFile.uploadedBy || 'Yetkili'}</strong></span>
                {previewFile.uploadedAt && (
                  <span>Tarih: {new Date(previewFile.uploadedAt).toLocaleDateString('tr-TR')}</span>
                )}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '10px', paddingTop: '10px', borderTop: '1px solid var(--border-subtle)' }}>
                {currentUser.role !== 'musteri' && (
                  <button
                    type="button"
                    className="btn btn-danger-outline btn-sm"
                    onClick={() => handleDeleteFile(previewFile.id, previewFile.name)}
                  >
                    <Trash2 size={14} />
                    <span>Sil</span>
                  </button>
                )}
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={() => handleDownload(previewFile)}
                >
                  <Download size={15} />
                  <span>Dosyayı İndir</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Dosya Ekleme Modalı */}
      <AddFileModal
        isOpen={isFileModalOpen}
        onClose={() => setIsFileModalOpen(false)}
        customerId={customer?.id}
      />
    </div>
  );
}
