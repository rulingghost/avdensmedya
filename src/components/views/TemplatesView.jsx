import React, { useState } from 'react';
import {
  CopyCheck,
  Plus,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Building2,
  Trash2,
  Edit2,
  Layers,
  ListOrdered,
  FileSpreadsheet
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import CreateTemplateModal from '../modals/CreateTemplateModal';
import EditTemplateModal from '../modals/EditTemplateModal';
import CategoryManagerModal from '../modals/CategoryManagerModal';
import ImportTemplateModal from '../modals/ImportTemplateModal';

export default function TemplatesView() {
  const { data, applyTemplateToCustomer, deleteTemplate, currentUser, getAccessibleCustomers } = useApp();

  const accessibleCustomers = getAccessibleCustomers();
  const [selectedTemplateForApply, setSelectedTemplateForApply] = useState(null);
  const [templateToEdit, setTemplateToEdit] = useState(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [targetCustomerId, setTargetCustomerId] = useState(accessibleCustomers[0]?.id || '');
  const [successMessage, setSuccessMessage] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [mouseDownOnOverlay, setMouseDownOnOverlay] = useState(false);

  const handleApply = (e) => {
    e.preventDefault();
    if (!selectedTemplateForApply || !targetCustomerId) return;

    applyTemplateToCustomer(targetCustomerId, selectedTemplateForApply.id);

    const customer = accessibleCustomers.find(c => c.id === targetCustomerId);
    setSuccessMessage(`"${selectedTemplateForApply.name}" şablonu ${customer?.companyName || 'Müşteri'} projesine başarıyla uygulandı!`);
    setTimeout(() => setSuccessMessage(''), 4000);

    setSelectedTemplateForApply(null);
  };

  const handleDeleteTemplate = (tmpl) => {
    if (window.confirm(`"${tmpl.name}" şablonunu silmek istediğinizden emin misiniz?`)) {
      deleteTemplate(tmpl.id);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

      {/* Üst Başlık ve Yönetim Butonları */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-md)', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CopyCheck size={22} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
                Görev Şablonları & Kategori Yöneticisi
              </h2>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                Standart iş paketlerini hazırlayın, kategorileri düzenleyin veya müşterilere uygulayın
              </span>
            </div>
          </div>
        </div>

        {currentUser.role === 'admin' && (
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            <button
              className="btn btn-secondary"
              onClick={() => setIsImportModalOpen(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                borderColor: '#10b981',
                color: '#059669',
                backgroundColor: '#ecfdf5',
                fontWeight: 700
              }}
              title="Excel (.xlsx, .xls) veya CSV dosyasından tek tıkla şablon aktarın"
            >
              <FileSpreadsheet size={18} color="#059669" />
              <span>Excel'den Şablon Aktar</span>
            </button>

            <button
              className="btn btn-secondary"
              onClick={() => setIsCategoryModalOpen(true)}
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Layers size={17} />
              <span>Kategorileri Yönet</span>
            </button>

            <button
              className="btn btn-primary"
              onClick={() => setIsCreateModalOpen(true)}
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Plus size={18} />
              <span>Yeni Şablon Oluştur</span>
            </button>
          </div>
        )}
      </div>

      {/* Başarı Bildirimi */}
      {successMessage && (
        <div style={{ backgroundColor: 'var(--success-light)', border: '1px solid #a7f3d0', padding: '14px 20px', borderRadius: 'var(--radius-md)', color: 'var(--success-text)', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <CheckCircle2 size={18} />
          <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{successMessage}</span>
        </div>
      )}

      {/* Şablon Kartları Listesi */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '24px' }}>
        {data.templates.map((tmpl) => (
          <div
            key={tmpl.id}
            className="card"
            style={{
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: '18px',
              borderTop: '4px solid var(--primary)'
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span className="badge badge-aktif">Hazır İş Paketi</span>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--primary)' }}>
                    {tmpl.taskItems.length} Adet Görev
                  </span>

                  {currentUser.role === 'admin' && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginLeft: '6px' }}>
                      <button
                        type="button"
                        onClick={() => setTemplateToEdit(tmpl)}
                        className="action-icon-btn"
                        style={{ width: 28, height: 28 }}
                        title="Şablonu Düzenle"
                      >
                        <Edit2 size={14} color="var(--primary)" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteTemplate(tmpl)}
                        className="action-icon-btn"
                        style={{ width: 28, height: 28 }}
                        title="Şablonu Sil"
                      >
                        <Trash2 size={14} color="var(--danger)" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>
                {tmpl.name}
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '6px', lineHeight: 1.5 }}>
                {tmpl.description}
              </p>

              {/* Şablon İçeriği Önizlemesi */}
              <div style={{ marginTop: '16px', backgroundColor: 'var(--bg-app)', padding: '14px', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '10px', textTransform: 'uppercase' }}>
                  Paket İçeriğindeki Standart Adımlar:
                </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '260px', overflowY: 'auto', paddingRight: '4px' }}>
                      {tmpl.taskItems.map((item, idx) => {
                        const cat = data.categories.find(c => c.id === item.category);
                        return (
                          <div
                            key={idx}
                            style={{
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '4px',
                              padding: '8px 12px',
                              background: '#ffffff',
                              borderRadius: 'var(--radius-sm)',
                              fontSize: '0.82rem',
                              border: '1px solid var(--border-subtle)'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                              <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>
                                {idx + 1}. {item.title}
                              </span>
                              {cat && (
                                <span style={{ fontSize: '0.7rem', padding: '1px 6px', borderRadius: '4px', background: `${cat.color}15`, color: cat.color, fontWeight: 600, flexShrink: 0 }}>
                                  {cat.name}
                                </span>
                              )}
                            </div>

                            {item.description && (
                              <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', borderLeft: '2px solid var(--primary)', paddingLeft: '8px', marginTop: '2px', lineHeight: 1.4 }}>
                                <span style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.72rem' }}>Yapılacak İş: </span>
                                {item.description}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
              </div>
            </div>

            {/* Müşteriye Uygula Butonu */}
            <div style={{ paddingTop: '14px', borderTop: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Tek tıkla tüm görevleri oluştur
              </span>

              {currentUser.role !== 'musteri' && (
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => setSelectedTemplateForApply(tmpl)}
                >
                  <Sparkles size={14} />
                  <span>Bu Şablonu Müşteriye Uygula</span>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Şablonu Uygula Modalı */}
      {selectedTemplateForApply && (
        <div
          className="modal-overlay"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setMouseDownOnOverlay(true);
            else setMouseDownOnOverlay(false);
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget && mouseDownOnOverlay) setSelectedTemplateForApply(null);
            setMouseDownOnOverlay(false);
          }}
        >
          <div
            className="modal-content"
            style={{ maxWidth: '480px' }}
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={20} color="var(--primary)" />
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Şablonu Müşteriye Uygula</h3>
              </div>
            </div>

            <form onSubmit={handleApply}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                  <strong>{selectedTemplateForApply.name}</strong> şablonunda bulunan{' '}
                  <strong>{selectedTemplateForApply.taskItems.length}</strong> adet görev seçilen müşterinin projesine anında eklenecektir.
                </p>

                <div className="form-group">
                  <label>Hangi Müşteriye Uygulansın? *</label>
                  <select
                    className="form-select"
                    value={targetCustomerId}
                    onChange={(e) => setTargetCustomerId(e.target.value)}
                    required
                  >
                    {accessibleCustomers.map(c => (
                      <option key={c.id} value={c.id}>{c.companyName} ({c.projectTitle || 'Proje'})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setSelectedTemplateForApply(null)}>
                  Vazgeç
                </button>
                <button type="submit" className="btn btn-primary">
                  Görevi Projeye Yükle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Yeni Şablon Ekleme Modalı */}
      <CreateTemplateModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onOpenImport={() => {
          setIsCreateModalOpen(false);
          setIsImportModalOpen(true);
        }}
      />

      {/* Şablon Düzenleme Modalı */}
      <EditTemplateModal
        isOpen={Boolean(templateToEdit)}
        template={templateToEdit}
        onClose={() => setTemplateToEdit(null)}
      />

      {/* Kategori Yöneticisi Modalı */}
      <CategoryManagerModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
      />

      {/* Excel'den Şablon Aktarma Modalı */}
      <ImportTemplateModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
      />

    </div>
  );
}
