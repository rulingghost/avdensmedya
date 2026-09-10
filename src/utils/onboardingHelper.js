/**
 * Görev şablonuna göre mantıken müşteriden istenebilecek bilgi ve belgeleri
 * (Onboarding Request) otomatik olarak türeten yardımcı fonksiyon.
 */
export function generateTemplateOnboarding(template) {
  if (!template) return null;

  const name = (template.name || '').toLowerCase();
  const desc = (template.description || '').toLowerCase();
  const taskText = (template.taskItems || [])
    .map(t => `${t.title || ''} ${t.category || ''} ${t.description || ''}`)
    .join(' ')
    .toLowerCase();
  const combined = `${name} ${desc} ${taskText}`;

  let items = [];

  const isSocial = ['sosyal', 'instagram', 'facebook', 'meta', 'reels', 'post', 'içerik', 'tiktok', 'social'].some(k => combined.includes(k));
  const isEcommerce = ['e-ticaret', 'eticaret', 'e-commerce', 'shopify', 'ikas', 'woocommerce', 'ticimax', 'ürün', 'sipariş', 'stok', 'sepet'].some(k => combined.includes(k));
  const isSeo = ['seo', 'google', 'arama', 'harita', 'maps', 'search console', 'analytics', 'ads', 'adwords'].some(k => combined.includes(k));
  const isBranding = ['kurumsal', 'kimlik', 'branding', 'logo', 'vektörel', 'kartvizit', 'web', 'yazılım', 'site', 'tasarım'].some(k => combined.includes(k));

  if (isEcommerce) {
    items = [
      { label: 'Web Sitesi Admin Panel Giriş Bilgileri (URL, E-posta, Şifre)', type: 'password', required: true },
      { label: 'Yüksek Çözünürlüklü Ürün Fotoğrafları Arşivi (Drive / Dosya)', type: 'file', required: true },
      { label: 'Ürün, Fiyat ve Stok Listesi (Excel / PDF)', type: 'file', required: true },
      { label: 'Kargo, İade ve Müşteri Hizmetleri Politikası Notları', type: 'note', required: false },
      { label: 'Sanal POS / Ödeme Sistemi Bilgileri', type: 'text', required: false }
    ];
  } else if (isSocial) {
    items = [
      { label: 'Vektörel Kurumsal Logo Dosyası (SVG / AI / PDF / PNG)', type: 'file', required: true },
      { label: 'Instagram Kullanıcı Adı & Şifresi', type: 'password', required: true },
      { label: 'Facebook Sayfası ve Business Manager Yönetici Bağlantısı', type: 'text', required: true },
      { label: 'WhatsApp Kurumsal İletişim Numarası & Onay Yetkilisi', type: 'text', required: true },
      { label: 'Öne Çıkartılacak Hizmetler, Marka Renkleri & Beklentiler', type: 'note', required: false }
    ];
  } else if (isSeo) {
    items = [
      { label: 'Google İşletme Profili (Harita) Yönetici E-posta Daveti', type: 'text', required: true },
      { label: 'Web Sitesi Google Search Console & Analytics Erişim İzni', type: 'text', required: true },
      { label: 'Resmi İşletme Adresi, Sabit Telefon & Çalışma Saatleri', type: 'note', required: true },
      { label: 'Hedef Anahtar Kelimeler ve Öncelikli Hizmet Bölgeleri', type: 'note', required: false },
      { label: 'Google Ads Reklam Hesabı / Fatura Yetkisi', type: 'text', required: false }
    ];
  } else if (isBranding) {
    items = [
      { label: 'Mevcut Logo Çizimi veya Vektörel Dosyalar (SVG / AI / PDF)', type: 'file', required: true },
      { label: 'Kurumsal Renk Kodları (Hex / Pantone) ve Font Tercihleri', type: 'text', required: true },
      { label: 'Alan Adı (Domain) ve Hosting / CPanel Giriş Bilgileri', type: 'password', required: true },
      { label: 'Şirket Tanıtım Metni, Misyon, Vizyon ve İletişim Bilgileri', type: 'note', required: false },
      { label: 'Kurumsal Fotoğraflar, Ofis/Ekip Görselleri', type: 'file', required: false }
    ];
  } else {
    // Genel akıllı şablon
    items = [
      { label: 'Kurumsal Logo ve Vektörel Materyaller (SVG / AI / PDF / PNG)', type: 'file', required: true },
      { label: 'Gerekli Sistem / Panel Giriş Şifreleri', type: 'password', required: true },
      { label: 'Yetkili İletişim Numarası & WhatsApp Onay Hattı', type: 'text', required: true },
      { label: 'Proje Beklentileri, Notlar ve Özel İstekler', type: 'note', required: false }
    ];
  }

  return {
    title: `${template.name} - Başlangıç Bilgi & Belge Talepleri`,
    description: `"${template.name}" iş paketinin aksamadan başlayabilmesi ve teknik kurulumların yapılabilmesi için lütfen aşağıdaki alanları doldurunuz.`,
    items
  };
}
