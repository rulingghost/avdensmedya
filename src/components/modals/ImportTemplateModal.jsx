import React, { useState, useRef } from 'react';
import {
  X,
  FileSpreadsheet,
  Download,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Layers,
  FileText,
  AlertTriangle,
  FileCheck
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { useApp } from '../../context/AppContext';

export default function ImportTemplateModal({ isOpen, onClose }) {
  const { data, addTemplate } = useApp();

  const [templateName, setTemplateName] = useState('');
  const [templateDescription, setTemplateDescription] = useState('');
  const [fileName, setFileName] = useState('');
  const [parsedTasks, setParsedTasks] = useState([]);
  const [error, setError] = useState('');
  const [warning, setWarning] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  // Örnek Excel Şablonu İndirme Fonksiyonu
  const downloadSampleExcel = () => {
    const sampleData = [
      {
        'Görev Adı': 'Meta Business Suite Kurulumu',
        'Kategori': 'Meta Kurulum',
        'Öncelik': 'Yüksek',
        'Yapılacak İş': 'İşletme yöneticisi hesabını açın, şirket bilgilerini girin ve iki faktörlü doğrulamayı aktifleştirin.'
      },
      {
        'Görev Adı': 'Facebook Sayfası ve Instagram Bağlantısı',
        'Kategori': 'Meta Kurulum',
        'Öncelik': 'Yüksek',
        'Yapılacak İş': 'Facebook işletme sayfası ile Instagram profesyonel hesabını birbirine bağlayıp yetkileri tanımlayın.'
      },
      {
        'Görev Adı': 'Haftalık Gönderi Tasarımları (6 Adet)',
        'Kategori': 'İçerik Yönetimi',
        'Öncelik': 'Normal',
        'Yapılacak İş': 'Marka renk paletine ve tipografisine uygun haftalık 6 adet carousel ve post tasarımı hazırlayın.'
      },
      {
        'Görev Adı': 'Trend Reels Video Kurgusu',
        'Kategori': 'İçerik Yönetimi',
        'Öncelik': 'Normal',
        'Yapılacak İş': 'Popüler sesler ve dinamik geçişlerle haftalık 2 adet Reels videosunu kurgulayın.'
      },
      {
        'Görev Adı': 'WhatsApp Mesaj Reklamı Kurulumu',
        'Kategori': 'Reklam Yönetimi',
        'Öncelik': 'Acil',
        'Yapılacak İş': 'Doğrudan müşteri WhatsApp hattına yönlendiren reklam kurgusu ve otomatik karşılama mesajını ayarlayın.'
      },
      {
        'Görev Adı': 'Aylık Yönetici Performans Raporu',
        'Kategori': 'Raporlama',
        'Öncelik': 'Normal',
        'Yapılacak İş': 'Erişim, harcanan bütçe, tıklama başı maliyet ve gelen mesaj sayılarını içeren aylık raporu sunun.'
      }
    ];

    const worksheet = XLSX.utils.json_to_sheet(sampleData);
    
    // Sütun genişliklerini ayarla
    worksheet['!cols'] = [
      { wch: 38 }, // Görev Adı
      { wch: 18 }, // Kategori
      { wch: 12 }, // Öncelik
      { wch: 75 }  // Yapılacak İş
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Görev Şablonu');

    XLSX.writeFile(workbook, 'Ornek_Gorev_Sablonu.xlsx');
  };

  // Metin Normalizasyonu
  const normalize = (str) => {
    return String(str || '')
      .toLowerCase()
      .trim()
      .replace(/ğ/g, 'g')
      .replace(/ü/g, 'u')
      .replace(/ş/g, 's')
      .replace(/ı/g, 'i')
      .replace(/ö/g, 'o')
      .replace(/ç/g, 'c');
  };

  // Kategori Eşleştirme
  const matchCategory = (catText) => {
    if (!catText) return data.categories[0]?.id || 'cat-meta';
    const norm = normalize(catText);

    // Kategori adı veya id ile tam / kısmi eşleşme
    const matched = data.categories.find(c => {
      const cNorm = normalize(c.name);
      return cNorm === norm || cNorm.includes(norm) || norm.includes(cNorm);
    });

    return matched ? matched.id : (data.categories[0]?.id || 'cat-meta');
  };

  // Öncelik Eşleştirme
  const matchPriority = (prioText) => {
    const norm = normalize(prioText);
    if (norm.includes('acil')) return 'acil';
    if (norm.includes('yuksek') || norm.includes('high')) return 'yuksek';
    if (norm.includes('düsuk') || norm.includes('dusuk') || norm.includes('low')) return 'dusuk';
    return 'normal';
  };

  // Dosya Yükleme & Ayrıştırma Mantığı
  const processFile = (file) => {
    if (!file) return;

    setError('');
    setWarning('');
    setFileName(file.name);

    // Şablon adı boşsa dosya adından türet
    if (!templateName.trim()) {
      const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[_\\-]/g, ' ');
      setTemplateName(cleanName);
    }

    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const buffer = e.target.result;
        const workbook = XLSX.read(buffer, { type: 'array' });
        
        // İlk sayfayı al
        const firstSheetName = workbook.SheetNames[0];
        if (!firstSheetName) {
          setError('Excel dosyasında geçerli bir sayfa bulunamadı.');
          return;
        }

        const sheet = workbook.Sheets[firstSheetName];
        const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });

        if (!rows || rows.length === 0) {
          setError('Yüklenen Excel dosyasında okunabilecek herhangi bir veri satırı bulunamadı.');
          return;
        }

        // Sütun başlıklarını algıla
        const firstRow = rows[0];
        const keys = Object.keys(firstRow);

        const titleKey = keys.find(k => {
          const n = normalize(k);
          return n.includes('gorev') || n.includes('baslik') || n.includes('title') || n.includes('ad');
        }) || keys[0];

        const catKey = keys.find(k => {
          const n = normalize(k);
          return n.includes('kategori') || n.includes('category');
        });

        const prioKey = keys.find(k => {
          const n = normalize(k);
          return n.includes('oncelik') || n.includes('priority');
        });

        const descKey = keys.find(k => {
          const n = normalize(k);
          return n.includes('yapilacak') || n.includes('detay') || n.includes('aciklama') || n.includes('not') || n.includes('desc');
        });

        const tasks = [];
        let emptyTitleCount = 0;

        rows.forEach((row) => {
          const rawTitle = String(row[titleKey] || '').trim();
          if (!rawTitle) {
            emptyTitleCount++;
            return;
          }

          const rawCategory = catKey ? String(row[catKey] || '') : '';
          const rawPriority = prioKey ? String(row[prioKey] || '') : '';
          const rawDesc = descKey ? String(row[descKey] || '').trim() : '';

          tasks.push({
            title: rawTitle,
            category: matchCategory(rawCategory),
            priority: matchPriority(rawPriority),
            description: rawDesc
          });
        });

        if (tasks.length === 0) {
          setError('Dosyada geçerli bir görev başlığı bulunamadı. Lütfen "Görev Adı" sütununun dolu olduğundan emin olun.');
          return;
        }

        if (emptyTitleCount > 0) {
          setWarning(`${emptyTitleCount} adet boş satır atlandı.`);
        }

        setParsedTasks(tasks);
      } catch (err) {
        console.error('Excel okuma hatası:', err);
        setError('Excel dosyası ayrıştırılırken bir hata oluştu: ' + err.message);
      }
    };

    reader.onerror = () => {
      setError('Dosya okunurken bir hata oluştu.');
    };

    reader.readAsArrayBuffer(file);
  };

  const handleFileInput = (e) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!templateName.trim()) {
      setError('Lütfen bir şablon adı giriniz.');
      return;
    }

    if (parsedTasks.length === 0) {
      setError('Lütfen önce geçerli bir Excel dosyası yükleyiniz.');
      return;
    }

    addTemplate({
      name: templateName.trim(),
      description: templateDescription.trim() || `Excel (${fileName}) dosyasından aktarıldı.`,
      taskItems: parsedTasks
    });

    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        style={{ maxWidth: '800px', width: '95%' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Başlığı */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: 40,
              height: 40,
              borderRadius: 'var(--radius-md)',
              background: 'rgba(16, 185, 129, 0.12)',
              color: '#10b981',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <FileSpreadsheet size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>
                Excel ile Görev Şablonu İçe Aktar
              </h3>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Excel veya CSV dosyanızdaki görev adımları ve yapılacak iş detaylarını tek tıkla şablona dönüştürün
              </span>
            </div>
          </div>
          <button onClick={onClose} style={{ color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {/* Modal Gövdesi */}
        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '18px', padding: '20px 24px' }}>

          {/* Hata / Uyarı Bildirimleri */}
          {error && (
            <div style={{
              padding: '10px 14px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--danger-light)',
              color: 'var(--danger-text)',
              fontSize: '0.84rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              border: '1px solid #fecaca'
            }}>
              <AlertCircle size={16} flexShrink={0} />
              <span>{error}</span>
            </div>
          )}

          {warning && (
            <div style={{
              padding: '10px 14px',
              borderRadius: 'var(--radius-md)',
              background: '#fef3c7',
              color: '#92400e',
              fontSize: '0.84rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              border: '1px solid #fde68a'
            }}>
              <AlertTriangle size={16} flexShrink={0} />
              <span>{warning}</span>
            </div>
          )}

          {/* Üst Kısım: Şablon Adı & Açıklaması */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '14px' }}>
            <div className="form-group">
              <label style={{ fontSize: '0.84rem', fontWeight: 600 }}>Şablon Adı *</label>
              <input
                type="text"
                className="form-input"
                placeholder="Örn: Sosyal Medya Yönetimi"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label style={{ fontSize: '0.84rem', fontWeight: 600 }}>Şablon Açıklaması (Opsiyonel)</label>
              <input
                type="text"
                className="form-input"
                placeholder="Örn: Sosyal medya danışmanlığı iş paketi"
                value={templateDescription}
                onChange={(e) => setTemplateDescription(e.target.value)}
              />
            </div>
          </div>

          {/* Dosya Yükleme Kutusu & Örnek Şablon İndir Butonu */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <label style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-main)' }}>
                Excel veya CSV Dosyası Seçin
              </label>
              <button
                type="button"
                onClick={downloadSampleExcel}
                className="btn btn-sm btn-secondary"
                style={{
                  fontSize: '0.76rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  color: '#059669',
                  borderColor: '#a7f3d0',
                  background: 'rgba(16, 185, 129, 0.08)'
                }}
                title="Hazır sütun başlıkları ve örnek satırları içeren dosyayı indirin"
              >
                <Download size={13} />
                <span>Örnek Excel Formatını İndir (.xlsx)</span>
              </button>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileInput}
              accept=".xlsx, .xls, .csv"
              style={{ display: 'none' }}
            />

            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              style={{
                border: `2px dashed ${isDragging ? 'var(--primary)' : parsedTasks.length > 0 ? '#10b981' : 'var(--border-color)'}`,
                borderRadius: 'var(--radius-md)',
                padding: '24px',
                textAlign: 'center',
                cursor: 'pointer',
                background: isDragging ? 'var(--primary-light)' : parsedTasks.length > 0 ? 'rgba(16, 185, 129, 0.04)' : 'var(--bg-app)',
                transition: 'all 0.2s'
              }}
            >
              {parsedTasks.length > 0 ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                  <FileCheck size={32} color="#10b981" />
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontWeight: 700, color: '#10b981', fontSize: '0.92rem' }}>
                      {fileName} yüklendi ({parsedTasks.length} Görev Başarıyla Okundu)
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      Farklı bir dosya yüklemek için buraya tıklayabilir veya sürükleyebilirsiniz.
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                  <UploadCloud size={32} color="var(--primary)" />
                  <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-main)' }}>
                    Excel dosyanızı buraya sürükleyin veya <span style={{ color: 'var(--primary)', textDecoration: 'underline' }}>dosya seçin</span>
                  </div>
                  <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                    Desteklenen formatlar: .xlsx, .xls, .csv • Beklenen Sütunlar: <strong>Görev Adı, Kategori, Öncelik, Yapılacak İş</strong>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Canlı Önizleme Tablosu */}
          {parsedTasks.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-main)' }}>
                  Okunan Görev Maddeleri Önizlemesi ({parsedTasks.length} Adet)
                </span>
                <span style={{ fontSize: '0.74rem', color: '#10b981', fontWeight: 600 }}>
                  ✓ Şablona dönüştürülmeye hazır
                </span>
              </div>

              <div style={{
                maxHeight: '260px',
                overflowY: 'auto',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-sm)',
                background: '#ffffff'
              }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ background: 'var(--bg-app)', borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', position: 'sticky', top: 0, zIndex: 5 }}>
                      <th style={{ padding: '8px 12px', width: '40px' }}>#</th>
                      <th style={{ padding: '8px 12px' }}>Görev Adı</th>
                      <th style={{ padding: '8px 12px', width: '120px' }}>Kategori</th>
                      <th style={{ padding: '8px 12px', width: '85px' }}>Öncelik</th>
                      <th style={{ padding: '8px 12px' }}>Yapılacak İş Detayı</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parsedTasks.map((t, idx) => {
                      const cat = data.categories.find(c => c.id === t.category);
                      return (
                        <tr key={idx} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                          <td style={{ padding: '8px 12px', fontWeight: 700, color: 'var(--text-muted)' }}>
                            {idx + 1}
                          </td>
                          <td style={{ padding: '8px 12px', fontWeight: 600, color: 'var(--text-main)' }}>
                            {t.title}
                          </td>
                          <td style={{ padding: '8px 12px' }}>
                            <span style={{
                              padding: '2px 8px',
                              borderRadius: '4px',
                              fontSize: '0.7rem',
                              fontWeight: 600,
                              background: cat ? `${cat.color}15` : 'var(--bg-app)',
                              color: cat ? cat.color : 'var(--text-main)'
                            }}>
                              {cat ? cat.name : t.category}
                            </span>
                          </td>
                          <td style={{ padding: '8px 12px' }}>
                            <span style={{
                              padding: '2px 6px',
                              borderRadius: '4px',
                              fontSize: '0.68rem',
                              fontWeight: 700,
                              background: t.priority === 'acil' ? 'var(--danger-light)' : t.priority === 'yuksek' ? '#fef3c7' : 'var(--bg-app)',
                              color: t.priority === 'acil' ? 'var(--danger)' : t.priority === 'yuksek' ? '#b45309' : 'var(--text-muted)'
                            }}>
                              {t.priority === 'acil' ? 'Acil ⚡' : t.priority === 'yuksek' ? 'Yüksek' : t.priority === 'dusuk' ? 'Düşük' : 'Normal'}
                            </span>
                          </td>
                          <td style={{ padding: '8px 12px', color: t.description ? 'var(--text-main)' : 'var(--text-muted)', fontStyle: t.description ? 'normal' : 'italic' }}>
                            {t.description || '—'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>

        {/* Modal Altı Butonlar */}
        <div className="modal-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            {parsedTasks.length > 0 ? `${parsedTasks.length} adet görev maddesi aktarılacak` : 'Lütfen Excel dosyası yükleyin'}
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              İptal
            </button>

            <button
              type="button"
              className="btn btn-primary"
              disabled={parsedTasks.length === 0 || !templateName.trim()}
              onClick={handleSave}
              style={{
                minWidth: '170px',
                opacity: (parsedTasks.length === 0 || !templateName.trim()) ? 0.5 : 1,
                cursor: (parsedTasks.length === 0 || !templateName.trim()) ? 'not-allowed' : 'pointer'
              }}
            >
              <Sparkles size={16} />
              <span>Şablonu Oluştur {parsedTasks.length > 0 ? `(${parsedTasks.length} Görev)` : ''}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
