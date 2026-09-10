import React, { useState } from 'react';
import {
  Sparkles,
  ShieldCheck,
  UserCheck,
  Building2,
  Lock,
  Mail,
  ArrowRight,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function LoginView() {
  const { data, login } = useApp();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showAccountHelper, setShowAccountHelper] = useState(false);

  const handleFormSubmit = (e) => {
    e.preventDefault();
    setErrorMessage('');
    const res = login(email, password);
    if (!res.success) {
      setErrorMessage(res.message);
    }
  };

  const fillCredentials = (accEmail, accPass) => {
    setEmail(accEmail);
    setPassword(accPass);
    setErrorMessage('');
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
      padding: '24px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Arka plan ışık efektleri */}
      <div style={{
        position: 'absolute',
        width: '500px',
        height: '500px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(56, 189, 248, 0.12) 0%, rgba(0,0,0,0) 70%)',
        top: '-100px',
        right: '-100px',
        pointerEvents: 'none'
      }} />
      <div style={{
        position: 'absolute',
        width: '500px',
        height: '500px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(99, 102, 241, 0.12) 0%, rgba(0,0,0,0) 70%)',
        bottom: '-100px',
        left: '-100px',
        pointerEvents: 'none'
      }} />

      <div style={{
        width: '100%',
        maxWidth: '440px',
        background: '#ffffff',
        borderRadius: 'var(--radius-xl)',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.45)',
        padding: '36px 32px',
        display: 'flex',
        flexDirection: 'column',
        gap: '22px',
        position: 'relative',
        zIndex: 10
      }}>

        {/* Logo ve Başlık */}
        <div style={{ textAlign: 'center' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 52,
            height: 52,
            borderRadius: 'var(--radius-md)',
            background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-hover) 100%)',
            color: '#ffffff',
            boxShadow: '0 10px 20px -5px rgba(37, 99, 235, 0.4)',
            marginBottom: '14px'
          }}>
            <Sparkles size={28} />
          </div>

          <h1 style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
            AVDENS WORK
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginTop: '4px' }}>
            Kurumsal Proje ve İş Takip Sistemi
          </p>
        </div>

        {/* Hata Bildirimi */}
        {errorMessage && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 14px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--danger-light)',
            color: 'var(--danger-text)',
            fontSize: '0.84rem',
            border: '1px solid #fecaca'
          }}>
            <AlertCircle size={16} flexShrink={0} />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="form-group">
            <label style={{ fontSize: '0.84rem', fontWeight: 600 }}>E-posta Adresi</label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                className="form-input"
                style={{ paddingLeft: '38px' }}
                placeholder="ornek@avdens.work"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
              />
              <Mail size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            </div>
          </div>

          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label style={{ fontSize: '0.84rem', fontWeight: 600 }}>Şifre</label>
            </div>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                className="form-input"
                style={{ paddingLeft: '38px', paddingRight: '40px' }}
                placeholder="Şifrenizi giriniz"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <Lock size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}
                title={showPassword ? 'Şifreyi Gizle' : 'Şifreyi Göster'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', padding: '12px', fontSize: '0.95rem', fontWeight: 700, marginTop: '6px' }}
          >
            <span>Oturum Aç</span>
            <ArrowRight size={16} />
          </button>
        </form>

        {/* Canlı Sistem Hesap Bilgileri Rehberi (Açılır/Kapanır) */}
        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
          <button
            type="button"
            onClick={() => setShowAccountHelper(!showAccountHelper)}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              fontSize: '0.78rem',
              cursor: 'pointer',
              fontWeight: 600
            }}
          >
            <span>Sistem Giriş Bilgileri Rehberi</span>
            <span style={{ fontSize: '0.85rem' }}>{showAccountHelper ? '▲' : '▼'}</span>
          </button>

          {showAccountHelper && (
            <div style={{
              marginTop: '10px',
              padding: '10px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-app)',
              border: '1px solid var(--border-color)',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              maxHeight: '260px',
              overflowY: 'auto'
            }}>
              {data.users.map((u) => {
                const isAdm = u.role === 'admin';
                const isAraci = u.role === 'araci';
                const roleColor = isAdm ? 'var(--primary)' : isAraci ? '#16a34a' : '#ea580c';
                const roleIcon = isAdm ? '👑' : isAraci ? '🤝' : '🏢';
                const roleTitle = isAdm ? 'Yönetici' : isAraci ? 'İş Ortağı' : 'Müşteri';

                return (
                  <div
                    key={u.id}
                    onClick={() => fillCredentials(u.email, u.password || '123')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '6px 10px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      background: '#ffffff',
                      border: '1px solid var(--border-subtle)',
                      fontSize: '0.78rem'
                    }}
                    title="Formu Doldur"
                  >
                    <div style={{ overflow: 'hidden' }}>
                      <strong style={{ color: roleColor }}>{roleIcon} {roleTitle}: {u.name}</strong>
                      <div style={{ color: 'var(--text-muted)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                        {u.email} / {u.password || '123'}
                      </div>
                    </div>
                    <span style={{ fontSize: '0.72rem', color: roleColor, fontWeight: 700, flexShrink: 0, marginLeft: '8px' }}>
                      Doldur ✎
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
