import React, { useState } from 'react';
import {
  Building2,
  CheckCircle2,
  Clock,
  MessageSquare,
  Send,
  Sparkles,
  AlertCircle,
  FileText,
  User,
  ArrowRight,
  ShieldCheck,
  Check,
  UploadCloud,
  Eye,
  EyeOff,
  Key,
  FileCheck,
  Instagram
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import InstagramGridPreview from './InstagramGridPreview';

export default function ClientPortalView() {
  const {
    currentUser,
    data,
    getCustomerProgress,
    addComment,
    replyComment,
    submitOnboardingData,
    submitWaitingTaskResponse
  } = useApp();

  const [newCommentText, setNewCommentText] = useState('');
  const [replyTextMap, setReplyTextMap] = useState({});
  const [onboardingFormValues, setOnboardingFormValues] = useState({});
  const [onboardingRevealed, setOnboardingRevealed] = useState({});
  const [onboardingSubmitted, setOnboardingSubmitted] = useState(false);
  const [showCompletedDetails, setShowCompletedDetails] = useState(false);

  // Müşteriden beklenen görev yanıtları (Madde 4)
  const [waitingResponses, setWaitingResponses] = useState({});
  const [waitingSubmittedSuccess, setWaitingSubmittedSuccess] = useState({});

  // Müşterinin kendi firması (Katı Yetki)
  const customerId = currentUser.customerId;
  const customer = data.customers.find(c => c.id === customerId);

  if (!customer) {
    return (
      <div className="card" style={{ padding: '48px 24px', textAlign: 'center', maxWidth: '560px', margin: '40px auto' }}>
        <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--danger-light)', color: 'var(--danger)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
          <AlertCircle size={26} />
        </div>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>
          Firma Bilgisi Bulunamadı
        </h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginTop: '8px', lineHeight: 1.5 }}>
          Hesabınıza bağlı müşteri firma kaydı bulunamadı. Lütfen yöneticiniz ile iletişime geçiniz.
        </p>
      </div>
    );
  }

  const progress = getCustomerProgress(customer.id);
  const tasks = data.tasks.filter(t => t.customerId === customer.id);
  const waitingForClientTasks = tasks.filter(t => t.waitingForClient && !t.isCompleted);

  const handleWaitingNoteChange = (taskId, text) => {
    setWaitingResponses(prev => ({
      ...prev,
      [taskId]: { ...(prev[taskId] || {}), note: text }
    }));
  };

  const handleWaitingFileChange = (taskId, file) => {
    setWaitingResponses(prev => ({
      ...prev,
      [taskId]: {
        ...(prev[taskId] || {}),
        file: { name: file.name, size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`, type: file.name.split('.').pop() }
      }
    }));
  };

  const handleWaitingSubmit = (taskId) => {
    const resp = waitingResponses[taskId] || {};
    if (!resp.note?.trim() && !resp.file?.name) {
      alert('Lütfen bir açıklama notu yazınız veya bir dosya/resim ekleyiniz.');
      return;
    }

    submitWaitingTaskResponse(taskId, customer.id, resp.note || '', resp.file || null);
    setWaitingSubmittedSuccess(prev => ({ ...prev, [taskId]: true }));
    setTimeout(() => {
      setWaitingSubmittedSuccess(prev => ({ ...prev, [taskId]: false }));
    }, 4000);
  };

  const customerOnboardingRequests = (data.onboardingRequests || []).filter(r => r.customerId === customer.id);
  const pendingRequest = customerOnboardingRequests.find(r => r.status === 'pending');
  const completedRequest = customerOnboardingRequests.find(r => r.status === 'completed');

  const handleOnboardingChange = (itemLabel, value) => {
    setOnboardingFormValues(prev => ({ ...prev, [itemLabel]: value }));
  };

  const toggleOnboardingEye = (fieldKey) => {
    setOnboardingRevealed(prev => ({ ...prev, [fieldKey]: !prev[fieldKey] }));
  };

  const handleOnboardingSubmit = (e) => {
    e.preventDefault();
    if (!pendingRequest) return;

    for (const it of pendingRequest.items) {
      if (it.required && !onboardingFormValues[it.label]?.trim() && !it.value) {
        alert(`Lütfen zorunlu alanı doldurunuz: "${it.label}"`);
        return;
      }
    }

    submitOnboardingData(pendingRequest.id, customer.id, onboardingFormValues);
    setOnboardingSubmitted(true);
  };

  // Müşteri Paneli Grupları (Madde 19)
  const completedTasks = tasks.filter(t => t.isCompleted);
  const inProgressTasks = tasks.filter(t => !t.isCompleted && t.status === 'devam_ediyor');
  const waitingTasks = tasks.filter(t => !t.isCompleted && (t.status === 'beklemede' || t.status === 'yapilacak' || t.waitingForClient));

  const customerComments = data.comments.filter(c => c.customerId === customer.id);

  const handleSendComment = (e) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;
    addComment(customer.id, newCommentText);
    setNewCommentText('');
  };

  const handleSendReply = (commentId) => {
    const text = replyTextMap[commentId];
    if (!text || !text.trim()) return;
    replyComment(commentId, text);
    setReplyTextMap({ ...replyTextMap, [commentId]: '' });
  };

  const getProgressClass = (pct) => {
    if (pct < 30) return 'progress-low';
    if (pct < 70) return 'progress-mid';
    if (pct < 100) return 'progress-high';
    return 'progress-full';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', maxWidth: '1000px', margin: '0 auto' }}>

      {/* Müşteri Karşılama Başlığı (Madde 19: Çok sade ve kurumsal) */}
      <div
        style={{
          background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
          borderRadius: 'var(--radius-lg)',
          padding: '32px',
          color: '#ffffff',
          boxShadow: 'var(--shadow-md)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <span style={{ fontSize: '0.78rem', color: '#93c5fd', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              MÜŞTERİ PROJE İZLEME PORTALI
            </span>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: '6px' }}>
              {customer.companyName}
            </h1>
            <p style={{ color: '#94a3b8', fontSize: '0.95rem', marginTop: '4px' }}>
              {customer.projectTitle} • Proje Yetkilisi: <strong>{customer.contactPerson}</strong>
            </p>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '2.8rem', fontWeight: 900, color: '#38bdf8', lineHeight: 1 }}>
              %{progress.percentage}
            </div>
            <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
              Proje Tamamlanma Oranı
            </span>
          </div>
        </div>

        {/* Büyük İlerleme Barı (Madde 19) */}
        <div className="progress-container" style={{ marginTop: '24px' }}>
          <div className="progress-info">
            <span style={{ color: '#cbd5e1', fontSize: '0.85rem' }}>
              {progress.completed} / {progress.total} Adım Tamamlandı
            </span>
            <span style={{ color: '#ffffff', fontWeight: 700 }}>
              {progress.percentage === 100 ? 'Tüm Aşamalar Tamamlandı 🎉' : 'Çalışmalar Devam Ediyor'}
            </span>
          </div>
          <div className="progress-track progress-track-lg" style={{ background: 'rgba(255,255,255,0.15)' }}>
            <div
              className={`progress-fill ${getProgressClass(progress.percentage)}`}
              style={{ width: `${progress.percentage}%` }}
            />
          </div>
        </div>

        {/* Aşama Yol Haritası (Milestone Stepper) */}
        {(() => {
          const currentStageKey = customer.stage || (
            pendingRequest ? 'onboarding' :
            progress.percentage === 100 ? 'reporting' :
            progress.percentage >= 40 ? 'active_ops' : 'setup'
          );

          const stages = [
            { key: 'onboarding', number: 1, title: 'Başlangıç & Evrak', desc: 'Logo, şifre ve bilgi alımı' },
            { key: 'setup', number: 2, title: 'Kurulum & Hazırlık', desc: 'Panel, şablon ve entegrasyon' },
            { key: 'active_ops', number: 3, title: 'Aktif Operasyon', desc: 'Tasarım, içerik ve reklamlar' },
            { key: 'reporting', number: 4, title: 'Raporlama & Büyüme', desc: 'Haftalık/aylık performans' }
          ];

          const stageOrder = ['onboarding', 'setup', 'active_ops', 'reporting'];
          const currentStageIndex = stageOrder.indexOf(currentStageKey);

          return (
            <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.12)' }}>
              <div style={{ fontSize: '0.78rem', color: '#93c5fd', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '12px' }}>
                PROJE YOL HARİTASI & MEVCUT AŞAMA
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '10px' }}>
                {stages.map((st, idx) => {
                  const isPast = idx < currentStageIndex;
                  const isCurrent = idx === currentStageIndex;
                  return (
                    <div
                      key={st.key}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '10px 12px',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: isCurrent ? 'rgba(56, 189, 248, 0.18)' : isPast ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.02)',
                        border: isCurrent ? '1px solid #38bdf8' : '1px solid rgba(255,255,255,0.08)'
                      }}
                    >
                      <div
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: '50%',
                          backgroundColor: isPast ? '#22c55e' : isCurrent ? '#38bdf8' : 'rgba(255,255,255,0.1)',
                          color: isPast || isCurrent ? '#ffffff' : '#94a3b8',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 800,
                          fontSize: '0.8rem',
                          flexShrink: 0
                        }}
                      >
                        {isPast ? <Check size={16} strokeWidth={3} /> : st.number}
                      </div>
                      <div>
                        <div style={{ fontSize: '0.82rem', fontWeight: 700, color: isCurrent ? '#ffffff' : isPast ? '#e2e8f0' : '#94a3b8' }}>
                          {st.title}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: isCurrent ? '#7dd3fc' : '#64748b' }}>
                          {st.desc}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })()}
      </div>

      {/* MÜŞTERİDEN İSTENİLEN BİLGİLER FORMU (ONBOARDING) - İŞİ BAŞLATMAK İÇİN */}
      {pendingRequest ? (
        <div
          className="card"
          style={{
            padding: '28px',
            border: '2px solid #3b82f6',
            boxShadow: '0 10px 25px -5px rgba(59, 130, 246, 0.15)',
            background: 'linear-gradient(135deg, #ffffff 0%, #f0f7ff 100%)',
            position: 'relative'
          }}
        >
          {/* Form Başlığı ve Uyarı */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px', marginBottom: '20px' }}>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#fee2e2', color: '#b91c1c', padding: '4px 12px', borderRadius: 'var(--radius-full)', fontSize: '0.78rem', fontWeight: 700, marginBottom: '8px' }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444', animation: 'pulse 1.5s infinite' }} />
                <span>İŞİ BAŞLATMAK İÇİN GEREKLİ</span>
              </div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
                {pendingRequest.title}
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px', maxWidth: '750px', lineHeight: 1.5 }}>
                {pendingRequest.description}
              </p>
            </div>

            <span style={{ fontSize: '0.8rem', color: 'var(--primary)', background: '#dbeafe', padding: '6px 12px', borderRadius: 'var(--radius-md)', fontWeight: 600 }}>
              {pendingRequest.items.length} Bilgi Alanı Talep Edildi
            </span>
          </div>

          {/* Form Alanları */}
          <form onSubmit={handleOnboardingSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
              {pendingRequest.items.map((item, idx) => {
                const val = onboardingFormValues[item.label] ?? item.value ?? '';
                const isRevealed = onboardingRevealed[item.id || idx];

                return (
                  <div
                    key={item.id || idx}
                    className="form-group"
                    style={{
                      background: '#ffffff',
                      padding: '16px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-color)',
                      boxShadow: 'var(--shadow-xs)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <label style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-main)' }}>
                        {item.label} {item.required && <span style={{ color: 'var(--danger)' }}>*</span>}
                      </label>
                      <span style={{
                        fontSize: '0.72rem',
                        padding: '2px 8px',
                        borderRadius: 'var(--radius-full)',
                        background: item.type === 'password' ? '#fef3c7' : item.type === 'file' ? '#e0f2fe' : item.type === 'note' ? '#f3e8ff' : '#f1f5f9',
                        color: item.type === 'password' ? '#92400e' : item.type === 'file' ? '#0369a1' : item.type === 'note' ? '#6b21a8' : 'var(--text-muted)',
                        fontWeight: 600
                      }}>
                        {item.type === 'password' ? 'Gizli Şifre 🔑' : item.type === 'file' ? 'Dosya / Logo 📁' : item.type === 'note' ? 'Not / İstek 📝' : 'Metin'}
                      </span>
                    </div>

                    {/* Tip Bazlı Girdi */}
                    {item.type === 'password' ? (
                      <div style={{ position: 'relative' }}>
                        <input
                          type={isRevealed ? 'text' : 'password'}
                          className="form-input"
                          placeholder="Şifreyi giriniz..."
                          value={val}
                          onChange={(e) => handleOnboardingChange(item.label, e.target.value)}
                          required={item.required}
                          style={{ paddingRight: '40px' }}
                        />
                        <button
                          type="button"
                          onClick={() => toggleOnboardingEye(item.id || idx)}
                          style={{
                            position: 'absolute',
                            right: '10px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            color: 'var(--text-muted)',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer'
                          }}
                        >
                          {isRevealed ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    ) : item.type === 'file' ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <input
                            type="text"
                            className="form-input"
                            placeholder="Dosya adı (Örn: Firma_Logo.svg)"
                            value={val}
                            onChange={(e) => handleOnboardingChange(item.label, e.target.value)}
                            required={item.required}
                            style={{ flex: 1 }}
                          />
                          <label className="btn btn-secondary btn-sm" style={{ cursor: 'pointer', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <UploadCloud size={14} />
                            <span>Dosya Seç</span>
                            <input
                              type="file"
                              style={{ display: 'none' }}
                              onChange={(e) => {
                                if (e.target.files?.[0]) {
                                  handleOnboardingChange(item.label, e.target.files[0].name);
                                }
                              }}
                            />
                          </label>
                        </div>
                        {val && (
                          <span style={{ fontSize: '0.78rem', color: 'var(--success-text)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Check size={13} />
                            <span>Yüklenecek: {val}</span>
                          </span>
                        )}
                      </div>
                    ) : item.type === 'note' ? (
                      <textarea
                        className="form-textarea"
                        rows={3}
                        placeholder="İsteklerinizi, tercihlerinizi ve varsa kurallarınızı yazınız..."
                        value={val}
                        onChange={(e) => handleOnboardingChange(item.label, e.target.value)}
                        required={item.required}
                      />
                    ) : (
                      <input
                        type="text"
                        className="form-input"
                        placeholder="Bilgiyi giriniz..."
                        value={val}
                        onChange={(e) => handleOnboardingChange(item.label, e.target.value)}
                        required={item.required}
                      />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Gönder Butonu */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px', paddingTop: '10px', borderTop: '1px solid var(--border-subtle)' }}>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                🔒 Bilgileriniz güvenli sisteme kaydedilecek ve proje ekibimize otomatik iletilecektir.
              </span>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ padding: '12px 24px', fontSize: '0.95rem', fontWeight: 700 }}
              >
                <Check size={18} />
                <span>Bilgileri Gönder ve Projeyi Başlat</span>
              </button>
            </div>
          </form>
        </div>
      ) : completedRequest && (
        <div
          className="card"
          style={{
            padding: '20px 24px',
            background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
            border: '1px solid #86efac',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#22c55e', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Check size={20} strokeWidth={3} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#166534' }}>
                  Başlangıç Bilgileri Teslim Edildi • Proje Başlatıldı
                </h3>
                <span style={{ fontSize: '0.82rem', color: '#15803d' }}>
                  {completedRequest.title} kapsamındaki tüm logo, şifre ve bilgiler ekibimize başarıyla ulaştı.
                </span>
              </div>
            </div>

            <button
              className="btn btn-secondary btn-sm"
              onClick={() => setShowCompletedDetails(!showCompletedDetails)}
              style={{ fontSize: '0.8rem', borderColor: '#86efac', background: '#ffffff', color: '#166534' }}
            >
              {showCompletedDetails ? 'Detayları Gizle' : 'Teslim Edilenleri Gör'}
            </button>
          </div>

          {/* Tamamlanan Alanlar Detayı */}
          {showCompletedDetails && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '10px', marginTop: '10px', paddingTop: '12px', borderTop: '1px solid #bbf7d0' }}>
              {completedRequest.items.map((item, idx) => (
                <div key={idx} style={{ background: '#ffffff', padding: '10px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid #bbf7d0', fontSize: '0.82rem' }}>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600 }}>{item.label}:</div>
                  <div style={{ color: '#166534', fontWeight: 700, marginTop: '2px' }}>
                    {item.type === 'password' ? '•••••••• (Şifreli Korumalı)' : item.value || 'İletildi'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 4. SİZDEN YANIT / DOSYA BEKLEYEN İŞLER (Kullanıcı İsteği 4) */}
      {waitingForClientTasks.length > 0 && (
        <div
          className="card"
          style={{
            padding: '24px',
            border: '2px solid #f97316',
            background: 'linear-gradient(135deg, #ffffff 0%, #fff7ed 100%)',
            boxShadow: '0 10px 25px -5px rgba(249, 115, 22, 0.15)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', background: '#ffedd5', color: '#ea580c', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <AlertCircle size={22} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>
                  Sizden Bilgi / Dosya Bekleyen İşler ({waitingForClientTasks.length})
                </h3>
                <span style={{ fontSize: '0.82rem', color: '#c2410c' }}>
                  Proje ekibimiz aşağıdaki görevleri sürdürmek için sizden yanıt veya döküman beklemektedir
                </span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {waitingForClientTasks.map((t) => {
              const currentResp = waitingResponses[t.id] || {};
              const isSuccess = waitingSubmittedSuccess[t.id];

              return (
                <div
                  key={t.id}
                  style={{
                    background: '#ffffff',
                    border: '1px solid #fed7aa',
                    borderRadius: 'var(--radius-md)',
                    padding: '18px',
                    boxShadow: 'var(--shadow-xs)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-main)' }}>
                      {t.title}
                    </span>
                    <span className="badge badge-beklemede">Sizden Bekleniyor</span>
                  </div>

                  {/* Bekleme Sebebi Vurgusu */}
                  <div style={{ background: '#fff7ed', borderLeft: '4px solid #ea580c', padding: '10px 14px', borderRadius: 'var(--radius-sm)', marginBottom: '14px' }}>
                    <div style={{ fontSize: '0.76rem', fontWeight: 700, color: '#9a3412', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Ekibin Talep Ettiği Konu / Bekleme Sebebi:
                    </div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#c2410c', marginTop: '2px' }}>
                      {t.waitingReason || 'Müşteri onayı ve bilgisi gerekiyor.'}
                    </div>
                  </div>

                  {isSuccess ? (
                    <div style={{ background: 'var(--success-light)', color: 'var(--success-text)', padding: '12px', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.86rem', fontWeight: 600 }}>
                      <Check size={18} />
                      <span>Yanıtınız ve dosyanız ekibimize iletildi. Görev işleme alındı!</span>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div className="form-group" style={{ margin: 0 }}>
                        <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-main)' }}>
                          Yanıtınız / Açıklama Notunuz:
                        </label>
                        <textarea
                          className="form-textarea"
                          rows={2}
                          placeholder="İstenilen bilgi veya notunuzu buraya yazınız..."
                          value={currentResp.note || ''}
                          onChange={(e) => handleWaitingNoteChange(t.id, e.target.value)}
                        />
                      </div>

                      {/* Dosya / Resim / PDF Ekleme */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <label className="btn btn-secondary btn-sm" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <UploadCloud size={15} />
                            <span>Resim / PDF Dosyası Ekle</span>
                            <input
                              type="file"
                              style={{ display: 'none' }}
                              onChange={(e) => {
                                if (e.target.files?.[0]) {
                                  handleWaitingFileChange(t.id, e.target.files[0]);
                                }
                              }}
                            />
                          </label>

                          {currentResp.file && (
                            <span style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 600, background: 'var(--primary-light)', padding: '4px 10px', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <Check size={13} />
                              <span>{currentResp.file.name} ({currentResp.file.size})</span>
                            </span>
                          )}
                        </div>

                        <button
                          type="button"
                          className="btn btn-primary btn-sm"
                          onClick={() => handleWaitingSubmit(t.id)}
                          style={{ padding: '8px 18px', fontWeight: 700 }}
                        >
                          <Send size={14} />
                          <span>Bilgileri / Dosyayı Gönder</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SOSYAL MEDYA İÇERİK TAKVİMİ & INSTAGRAM IZGARA ONÖNİZLEMESİ (Madde 2) */}
      {(() => {
        const customerPosts = (data.contentPosts || []).filter(p => p.customerId === customer.id);
        const pendingPosts = customerPosts.filter(p => p.status === 'onay_bekliyor');

        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* Vurgu Banner'ı */}
            <div
              className="card"
              style={{
                padding: '20px 24px',
                background: 'linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%)',
                border: '1px solid rgba(139, 92, 246, 0.3)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '14px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: '10px',
                    background: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff'
                  }}
                >
                  <Instagram size={22} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0 }}>
                    Sosyal Medya &amp; Instagram 3x3 Besleme Önizlemesi
                  </h3>
                  <span style={{ fontSize: '0.82rem', color: '#c4b5fd' }}>
                    Ekibimizin sizin için hazırladığı gönderileri canlı profil düzeninde inceleyin ve onaylayın
                  </span>
                </div>
              </div>

              {pendingPosts.length > 0 && (
                <div
                  style={{
                    backgroundColor: 'rgba(234, 88, 12, 0.25)',
                    border: '1px solid #ea580c',
                    color: '#fdba74',
                    padding: '6px 14px',
                    borderRadius: '8px',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <Clock size={15} />
                  <span>{pendingPosts.length} Gönderi Onayınızı Bekliyor</span>
                </div>
              )}
            </div>

            {/* Instagram 3x3 Izgarası */}
            <InstagramGridPreview customer={customer} posts={customerPosts} />
          </div>
        );
      })()}

      {/* 3 KOLONLU İŞ DURUMU DÖKÜMÜ (Madde 19: Yapılan İşler, Devam Edenler, Bekleyenler) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: '20px' }}>

        {/* 1. Yapılan İşler (Tamamlananlar ✓) */}
        <div className="card" style={{ padding: '22px', borderTop: '4px solid var(--success)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--success-light)', color: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Check size={16} strokeWidth={3} />
              </div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)' }}>
                Yapılan İşler
              </h3>
            </div>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--success-text)', background: 'var(--success-light)', padding: '2px 8px', borderRadius: 'var(--radius-full)' }}>
              {completedTasks.length} Tamamlandı
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {completedTasks.length === 0 ? (
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Henüz tamamlanan görev yok.</span>
            ) : (
              completedTasks.map((t) => (
                <div key={t.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '0.86rem', color: 'var(--text-main)', padding: '8px 10px', background: 'var(--bg-app)', borderRadius: 'var(--radius-sm)' }}>
                  <span style={{ color: 'var(--success)', fontWeight: 800, marginTop: '1px' }}>✓</span>
                  <div>
                    <span style={{ fontWeight: 600 }}>{t.title}</span>
                    {t.completedAt && (
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        Tamamlanma: {new Date(t.completedAt).toLocaleDateString('tr-TR')}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* 2. Devam Eden İşler (•) */}
        <div className="card" style={{ padding: '22px', borderTop: '4px solid var(--primary)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Clock size={16} />
              </div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)' }}>
                Devam Eden İşler
              </h3>
            </div>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--primary)', background: 'var(--primary-light)', padding: '2px 8px', borderRadius: 'var(--radius-full)' }}>
              {inProgressTasks.length} Aktif
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {inProgressTasks.length === 0 ? (
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Şu anda devam eden iş bulunmuyor.</span>
            ) : (
              inProgressTasks.map((t) => (
                <div key={t.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '0.86rem', color: 'var(--text-main)', padding: '8px 10px', background: 'var(--bg-app)', borderRadius: 'var(--radius-sm)' }}>
                  <span style={{ color: 'var(--primary)', fontWeight: 800, marginTop: '1px' }}>•</span>
                  <div>
                    <span style={{ fontWeight: 600 }}>{t.title}</span>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      Sorumlu: {t.assignedTo} • Termin: {t.dueDate}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* 3. Bekleyen İşler (⏳ & Müşteriden Beklenenler) */}
        <div className="card" style={{ padding: '22px', borderTop: '4px solid var(--warning)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--warning-light)', color: 'var(--warning)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <AlertCircle size={16} />
              </div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)' }}>
                Bekleyen İşler
              </h3>
            </div>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--warning-text)', background: 'var(--warning-light)', padding: '2px 8px', borderRadius: 'var(--radius-full)' }}>
              {waitingTasks.length} Sırada
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {waitingTasks.length === 0 ? (
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Bekleyen iş bulunmuyor.</span>
            ) : (
              waitingTasks.map((t) => (
                <div key={t.id} style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.86rem', padding: '8px 10px', background: t.waitingForClient ? '#fff7ed' : 'var(--bg-app)', borderRadius: 'var(--radius-sm)', border: t.waitingForClient ? '1px solid #fed7aa' : 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                    <span style={{ color: t.waitingForClient ? '#ea580c' : 'var(--text-muted)', fontWeight: 800 }}>•</span>
                    <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{t.title}</span>
                  </div>
                  {t.waitingForClient && (
                    <div style={{ fontSize: '0.74rem', color: '#c2410c', fontWeight: 600, marginLeft: '16px' }}>
                      ⚠️ Sizden Bekleniyor: {t.waitingReason || 'Onay bekleniyor'}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* MÜŞTERİ GERİ BİLDİRİM VE YORUM SİSTEMİ (Madde 15) */}
      <div className="card" style={{ padding: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
          <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <MessageSquare size={18} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)' }}>
              Projeye Geri Bildirim & Yorum Bırakın
            </h3>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Yapılan tasarımlar, reklamlar veya süreç hakkında ekibimize doğrudan mesaj iletin.
            </span>
          </div>
        </div>

        {/* Yorum Gönderme Formu */}
        <form onSubmit={handleSendComment} style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', gap: '12px' }}>
            <textarea
              className="form-textarea"
              rows={2}
              placeholder="Örn: Bu tasarım biraz daha koyu olabilir veya reklam WhatsApp'a yönlensin..."
              value={newCommentText}
              onChange={(e) => setNewCommentText(e.target.value)}
              required
              style={{ flex: 1 }}
            />
            <button
              type="submit"
              className="btn btn-primary"
              style={{ alignSelf: 'flex-end', height: '44px', padding: '0 20px' }}
            >
              <Send size={16} />
              <span>Gönder</span>
            </button>
          </div>
        </form>

        {/* Mevcut Yorumlar & Admin Yanıtları */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {customerComments.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              Henüz bir geri bildirim yorumu eklenmemiş. İlk yorumu yukarıdan yazabilirsiniz!
            </div>
          ) : (
            customerComments.map((comm) => (
              <div
                key={comm.id}
                style={{
                  backgroundColor: 'var(--bg-app)',
                  padding: '16px 20px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}
              >
                {/* Müşteri Yorumu */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <img
                    src={comm.userAvatar}
                    alt={comm.userName}
                    style={{ width: 34, height: 34, borderRadius: '50%', objectFit: 'cover' }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <strong style={{ fontSize: '0.88rem', color: 'var(--text-main)' }}>
                        {comm.userName} (Müşteri)
                      </strong>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
                        {new Date(comm.createdAt).toLocaleString('tr-TR', { dateStyle: 'short', timeStyle: 'short' })}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.88rem', color: 'var(--text-main)', marginTop: '4px', lineHeight: 1.5 }}>
                      "{comm.message}"
                    </p>
                  </div>
                </div>

                {/* Ajans / Admin Yanıtı (Madde 15) */}
                {comm.reply ? (
                  <div
                    style={{
                      marginLeft: '42px',
                      backgroundColor: '#ffffff',
                      padding: '12px 16px',
                      borderRadius: 'var(--radius-md)',
                      borderLeft: '3px solid var(--primary)',
                      border: '1px solid var(--border-subtle)',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '10px'
                    }}
                  >
                    <img
                      src={comm.reply.userAvatar}
                      alt={comm.reply.userName}
                      style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover' }}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <strong style={{ fontSize: '0.82rem', color: 'var(--primary)' }}>
                          {comm.reply.userName} (Ajans Yanıtı)
                        </strong>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>
                          {new Date(comm.reply.createdAt).toLocaleString('tr-TR', { dateStyle: 'short', timeStyle: 'short' })}
                        </span>
                      </div>
                      <p style={{ fontSize: '0.84rem', color: 'var(--text-main)', marginTop: '3px', lineHeight: 1.4 }}>
                        {comm.reply.message}
                      </p>
                    </div>
                  </div>
                ) : (
                  currentUser.role !== 'musteri' && (
                    /* Admin/Aracı için Yanıtlama Kutusu */
                    <div style={{ marginLeft: '42px', display: 'flex', gap: '8px' }}>
                      <input
                        type="text"
                        className="form-input"
                        style={{ fontSize: '0.82rem', padding: '6px 12px' }}
                        placeholder="Müşteriye yanıt yazın..."
                        value={replyTextMap[comm.id] || ''}
                        onChange={(e) => setReplyTextMap({ ...replyTextMap, [comm.id]: e.target.value })}
                      />
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => handleSendReply(comm.id)}
                      >
                        Yanıtla
                      </button>
                    </div>
                  )
                )}
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
}
