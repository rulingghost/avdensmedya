import React, { useState } from 'react';
import { FolderOpen, FileText, Download, UploadCloud, Plus } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import AddFileModal from '../modals/AddFileModal';

export default function FilesView() {
  const { data, currentUser, getAccessibleCustomers } = useApp();

  const accessibleCustomers = getAccessibleCustomers();

  const [selectedCustomerId, setSelectedCustomerId] = useState(() => {
    if (currentUser.role === 'musteri') {
      return currentUser.customerId || accessibleCustomers[0]?.id || '';
    }
    return accessibleCustomers[0]?.id || '';
  });

  const [isFileModalOpen, setIsFileModalOpen] = useState(false);

  const customer = accessibleCustomers.find(c => c.id === selectedCustomerId) || accessibleCustomers[0] || null;
  const files = customer ? data.files.filter(f => f.customerId === customer.id) : [];

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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-md)', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FolderOpen size={22} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
              Proje Dosyaları & Dokümanlar (Madde 14)
            </h2>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              {customer?.companyName} • Logo, sözleşme, reklam görselleri ve teslim belgeleri
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

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '18px' }}>
        {files.length === 0 ? (
          <div className="card" style={{ gridColumn: '1 / -1', padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
            Henüz yüklenmiş dosya bulunmuyor.
          </div>
        ) : (
          files.map((file) => (
            <div key={file.id} className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-md)', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <FileText size={20} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <strong style={{ fontSize: '0.92rem', color: 'var(--text-main)', display: 'block', wordBreak: 'break-all' }}>
                    {file.name}
                  </strong>
                  <span style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 700 }}>
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
                <span>Yükleyen: {file.uploadedBy}</span>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => alert(`"${file.name}" dosyası indiriliyor (demo simülasyonu).`)}
                  style={{ fontSize: '0.75rem', padding: '4px 10px' }}
                >
                  <Download size={13} />
                  <span>İndir</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <AddFileModal
        isOpen={isFileModalOpen}
        onClose={() => setIsFileModalOpen(false)}
        customerId={customerId}
      />
    </div>
  );
}
