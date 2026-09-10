import React, { useState, useRef } from 'react';
import {
  X,
  MessageCircle,
  Send,
  Sparkles,
  Phone,
  CheckCircle2,
  Clock,
  Key,
  Calendar,
  AlertCircle,
  Copy,
  Check
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function WhatsAppNotificationModal({
  isOpen,
  onClose,
  initialCustomerId = null,
  initialPost = null,
  initialTask = null
}) {
  const { data, getAccessibleCustomers, currentUser } = useApp();
  const accessibleCustomers = getAccessibleCustomers();
  const isMouseDownOnOverlay = useRef(false);

  const [customerId, setCustomerId] = useState(() => {
    if (initialCustomerId) return initialCustomerId;
    if (initialPost?.customerId) return initialPost.customerId;
    if (initialTask?.customerId) return initialTask.customerId;
    return accessibleCustomers[0]?.id || '';
  });

  const [activeTemplate, setActiveTemplate] = useState(() => {
    if (initialPost) return 'post_approval';
    if (initialTask?.isCompleted) return 'task_completed';
    if (initialTask?.waitingForClient) return 'waiting_info';
    return 'post_approval';
  });

  const [customText, setCustomText] = useState('');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleOverlayMouseDown = (e) => {
    if (e.target === e.currentTarget) isMouseDownOnOverlay.current = true;
  };

  const handleOverlayMouseUp = (e) => {
    if (e.target === e.currentTarget && isMouseDownOnOverlay.current) onClose();
    isMouseDownOnOverlay.current = false;
  };

  const customer = accessibleCustomers.find(c => c.id === customerId);
  const targetPhone = customer?.whatsapp || customer?.phone || '';

  // Telefon numarasını uluslararası formata uyarla (örn: 90532xxxxxxx)
  const formatPhoneForWhatsApp = (phoneStr) => {
    if (!phoneStr) return '';
    let digits = phoneStr.replace(/\D/g, '');
    if (digits.startsWith('0')) {
      digits = '9' + digits; // 0532 -> 90532
    } else if (!digits.startsWith('90') && digits.length === 10) {
      digits = '90' + digits; // 532 -> 90532
    }
    return digits;
  };

  const cleanPhone = formatPhoneForWhatsApp(targetPhone);
  const appOrigin = window.location.origin;

  // Dinamik Şablon Mesajları
  const getTemplateMessage = () => {
    const contact = customer?.contactPerson || 'Yetkili';
    const company = customer?.companyName || 'Değerli İş Ortağımız';

    switch (activeTemplate) {
      case 'post_approval': {
        const postTitle = initialPost ? initialPost.title : 'Yeni Sosyal Medya İçeriğiniz';
        const postDate = initialPost?.scheduledDate 
          ? new Date(initialPost.scheduledDate).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })
          : 'En kısa sürede';
        return `Merhaba *${contact}* (${company}),\n\nEkibimiz tarafından hazırlanan yeni sosyal medya içeriğiniz portalınızda onaya sunulmuştur:\n\n📌 *İçerik Konusu:* ${postTitle}\n📅 *Planlanan Yayın:* ${postDate}\n\nGörsel ve metni inceleyip tek tıkla onaylamak için:\n👉 ${appOrigin}\n\nİyi çalışmalar dileriz.\n*AVDENS WORK*`;
      }
      case 'task_completed': {
        const taskTitle = initialTask ? initialTask.title : 'Proje Göreviniz';
        return `Merhaba *${contact}* (${company}),\n\n*${taskTitle}* göreviniz ekibimiz tarafından başarıyla tamamlanmıştır! 🎉\n\nDetayları ve yapılan güncellemeleri portalınızdan inceleyebilirsiniz:\n👉 ${appOrigin}\n\n*AVDENS WORK*`;
      }
      case 'waiting_info': {
        const reason = initialTask?.waitingReason || 'Gerekli logo, görsel veya hesap bilgileri';
        return `Merhaba *${contact}* (${company}),\n\nProjenize hızla devam edebilmemiz için sizden aşağıdaki bilgi/belge beklenmektedir:\n\n⚠️ *Beklenen:* ${reason}\n\nPortalınızdan güvenle yanıtlayabilir veya dosya yükleyebilirsiniz:\n👉 ${appOrigin}\n\nTeşekkür eder, iyi çalışmalar dileriz.\n*AVDENS WORK*`;
      }
      case 'portal_access': {
        const userObj = data.users.find(u => u.customerId === customer?.id) || {};
        return `Merhaba *${contact}* (${company}),\n\nAVDENS WORK Müşteri Takip Portalınız kullanıma hazırdır! Proje ilerlemenizi, sosyal medya takviminizi ve yapılan tüm işleri 7/24 takip edebilirsiniz.\n\n🌐 *Giriş Adresi:* ${appOrigin}\n👤 *E-posta:* ${userObj.email || customer?.email || 'kayıtlı e-postanız'}\n🔒 *Şifreniz:* ${userObj.password ? userObj.password : 'Belirlenen şifreniz'}\n\nKeyifli çalışmalar dileriz.\n*AVDENS WORK*`;
      }
      case 'custom':
      default:
        return customText;
    }
  };

  const messageText = activeTemplate === 'custom' ? customText : getTemplateMessage();

  const handleSendWhatsApp = () => {
    if (!cleanPhone) {
      alert('Seçili müşterinin kayıtlı bir telefon veya WhatsApp numarası bulunamadı. Lütfen önce müşteri bilgilerine numara ekleyiniz.');
      return;
    }
    const encoded = encodeURIComponent(messageText);
    const waUrl = `https://wa.me/${cleanPhone}?text=${encoded}`;
    window.open(waUrl, '_blank');
    onClose();
  };

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(messageText);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div
      className="modal-overlay"
      onMouseDown={handleOverlayMouseDown}
      onMouseUp={handleOverlayMouseUp}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(5px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 65,
        padding: '16px'
      }}
    >
      <div
        className="card modal-card"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '640px',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: 'var(--bg-card)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
          overflow: 'hidden'
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '18px 24px',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: '#0f172a',
            color: '#fff'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: '10px',
                backgroundColor: '#25D366',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <MessageCircle size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0 }}>
                WhatsApp Bildirim &amp; Onay Hub'ı
              </h3>
              <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                Müşterinize tek tıkla profesyonel şablonlu WhatsApp mesajı gönderin
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="btn-icon"
            style={{ color: '#94a3b8' }}
            title="Kapat"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: '16px', overflowY: 'auto' }}>
          {/* Müşteri Seçimi */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
            <div>
              <label className="form-label" style={{ fontSize: '0.84rem', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                Alıcı Müşteri Firma
              </label>
              <select
                className="form-input"
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                style={{ width: '100%', padding: '9px 12px' }}
              >
                {accessibleCustomers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.companyName} {c.contactPerson ? `(${c.contactPerson})` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="form-label" style={{ fontSize: '0.84rem', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                WhatsApp / Tel Numarası
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <input
                  type="text"
                  className="form-input"
                  value={targetPhone || 'Kayıtlı numara yok'}
                  readOnly
                  style={{ width: '100%', padding: '9px 12px', color: targetPhone ? 'var(--text-main)' : 'var(--danger)' }}
                />
              </div>
            </div>
          </div>

          {/* Şablon Seçici Butonlar */}
          <div>
            <label className="form-label" style={{ fontSize: '0.84rem', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
              Mesaj Şablonu Seçiniz
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '8px' }}>
              {[
                { id: 'post_approval', label: 'İçerik Onay Talebi', icon: Calendar, color: '#ec4899' },
                { id: 'task_completed', label: 'Görev Tamamlandı', icon: CheckCircle2, color: '#10b981' },
                { id: 'waiting_info', label: 'Bilgi/Şifre Talebi', icon: Clock, color: '#f59e0b' },
                { id: 'portal_access', label: 'Portal Bilgileri', icon: Key, color: '#3b82f6' },
                { id: 'custom', label: 'Özel Mesaj', icon: MessageCircle, color: '#8b5cf6' }
              ].map((tpl) => {
                const Icon = tpl.icon;
                const isSelected = activeTemplate === tpl.id;
                return (
                  <button
                    key={tpl.id}
                    type="button"
                    onClick={() => setActiveTemplate(tpl.id)}
                    className="btn"
                    style={{
                      padding: '8px 10px',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      border: `1.5px solid ${isSelected ? tpl.color : 'var(--border-subtle)'}`,
                      backgroundColor: isSelected ? `${tpl.color}15` : 'transparent',
                      color: isSelected ? tpl.color : 'var(--text-muted)'
                    }}
                  >
                    <Icon size={14} />
                    <span>{tpl.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Özel Mesaj Yazma Alanı */}
          {activeTemplate === 'custom' && (
            <div>
              <label className="form-label" style={{ fontSize: '0.84rem', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                Özel Mesajınızı Yazınız
              </label>
              <textarea
                className="form-input"
                rows={4}
                placeholder="Müşterinize iletmek istediğiniz özel notunuz..."
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                style={{ width: '100%', padding: '10px 12px' }}
              />
            </div>
          )}

          {/* WhatsApp Mesaj Balonu Canlı Önizlemesi */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                WhatsApp Mesaj Önizlemesi:
              </span>
              <button
                type="button"
                onClick={handleCopyMessage}
                style={{
                  background: 'none',
                  border: 'none',
                  color: copied ? 'var(--success)' : 'var(--primary)',
                  fontSize: '0.76rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                {copied ? <Check size={13} /> : <Copy size={13} />}
                <span>{copied ? 'Kopyalandı!' : 'Metni Kopyala'}</span>
              </button>
            </div>

            <div
              style={{
                backgroundColor: '#0b141a',
                padding: '16px',
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.08)'
              }}
            >
              <div
                style={{
                  backgroundColor: '#005c4b',
                  color: '#e9edef',
                  padding: '12px 16px',
                  borderRadius: '10px 10px 0 10px',
                  fontSize: '0.86rem',
                  lineHeight: 1.6,
                  whiteSpace: 'pre-wrap',
                  maxWidth: '90%',
                  marginLeft: 'auto',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.3)'
                }}
              >
                {messageText || 'Lütfen mesaj metni giriniz...'}
                <div style={{ textAlign: 'right', fontSize: '0.68rem', color: '#8696a0', marginTop: '6px' }}>
                  {new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })} ✓✓
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div
          style={{
            padding: '16px 24px',
            borderTop: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
            backgroundColor: 'var(--bg-app)'
          }}
        >
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Numara: <strong>{cleanPhone ? `+${cleanPhone}` : 'Tanımsız'}</strong>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Vazgeç
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleSendWhatsApp}
              disabled={!cleanPhone}
              style={{
                backgroundColor: '#25D366',
                borderColor: '#25D366',
                color: '#fff',
                fontWeight: 700,
                opacity: cleanPhone ? 1 : 0.5
              }}
            >
              <Send size={16} />
              <span>WhatsApp'ta Aç ve Gönder</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
