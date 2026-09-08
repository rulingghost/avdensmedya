# İşTakip Pro - Müşteri & Proje Takip Sistemi

Ajanslar, freelancerlar ve dijital pazarlama ekipleri için geliştirilmiş modern, kurumsal ve şeffaf **Müşteri İş Takip Sistemi**.

---

## 🌟 Öne Çıkan Özellikler

- **3 Farklı Kullanıcı Rolü & Yetki Mimarisi:**
  - **👑 Admin (Yönetici):** Tüm müşteriler, işler, şifre kasaları, görev şablonları ve sistem ayarları üzerinde tam yetki.
  - **🤝 Aracı (İş Ortağı):** Sadece kendisine bağlı müşterileri, görevleri, notları ve dosyaları görüntüleme ve yönetme yetkisi.
  - **🏢 Müşteri:** Sadeleştirilmiş, teknik olmayan özel portal. Proje genel ilerleme durumu (% progress), tamamlanan ve bekleyen işlerin şeffaf takibi ve ekibe geri bildirim/yorum iletme.
- **⚡ Çekirdek Görev Motoru & Anlık Checkbox Otomasyonu:**
  - Tek tıkla checkbox tamamlama.
  - Tamamlayan kişi ve tamamlama tarih-saati otomatik kayıt altına alınır.
  - Müşteri genel ilerleme yüzdesi anında dinamik olarak yeniden hesaplanır.
  - Aktivite kütüğüne ve bildirim merkezine anlık log düşer.
  - Başarılı tamamlamalarda confetti mikro-animasyonu.
- **⚠️ Müşteriden Bekleniyor Uyarı Mekanizması:**
  - Görevin neden beklediğini (Logo bekleniyor, şifre bekleniyor, reklam bütçesi onayı bekleniyor vb.) açıkça vurgulayan özel turuncu rozet ve animasyon.
- **🔐 Şifreli Hesap Bilgileri Kasası:**
  - Instagram, Facebook, Meta Business, WordPress ve cPanel giriş bilgileri.
  - Şifreler varsayılan olarak `••••••••••••` gizlidir. 👁 Göster butonuyla görüntülenebilir ve tek tıkla kopyalanabilir.
  - Müşteri görme izni anahtarı ile ajansa özel şifrelerin müşteriden gizlenmesi.
- **📋 14 Maddelik Görev Şablonları:**
  - Yeni müşteriler açılırken tek tıkla standart Sosyal Medya ve Meta Yönetimi görev paketini projeye yükleyebilme.
- **💬 Karşılıklı Yorumlaşma:**
  - Müşteri revize veya soru iletir; ajans/aracı ekibi doğrudan sistem üzerinden yanıtlar.
- **💾 Yerel Kalıcılık & JSON Yedekleme:**
  - Kurulum gerektirmez, tarayıcı hafızasında (LocalStorage) tam kalıcı çalışır.
  - Tek tıkla JSON yedek indirme (Dışa aktar) ve yedek yükleme (İçe aktar).
  - Orijinal ÖMTEK Lazer demo verisine geri dönme (Fabrika ayarlarına sıfırla).

---

## 🚀 Yerel Olarak Çalıştırma

Projeyi bilgisayarınızda çalıştırmak için:

```bash
# Bağımlılıkları yükleyin (ilk seferde)
npm install

# Geliştirme sunucusunu başlatın
npm run dev
```

Uygulama tarayıcınızda açılacaktır:
👉 **`http://localhost:5173/`**

---

## 🧪 Canlı Demo ve Test Senaryosu (ÖMTEK Lazer)

Uygulama açıldığında `gorev.txt` dosyasındaki tüm gereksinimleri karşılayan demo verileri hazır gelir:
- **Firma:** ÖMTEK Lazer (Yetkili: Özlem Kaya)
- **Aracı:** Mücahit Aktaş
- **Kategoriler:** Meta Kurulum, İçerik Yönetimi, Reklam Yönetimi, Organik Büyüme
- **Görevler:** 18 adet görev (12'si tamamlanmış, başlangıç ilerlemesi: %67)
- **Rol Testi:** Üst bardaki **Admin**, **Aracı** ve **Müşteri** butonlarına basarak rollere göre değişen ekranları anında deneyimleyebilirsiniz.

---

## 🛠️ Teknoloji Yığını

- **Frontend:** React 18, Vite
- **Stil & Tasarım:** Modern Vanilla CSS (Design Tokens, Glassmorphism, Micro-animations)
- **İkonlar:** Lucide React
- **Tipografi:** Google Fonts (Plus Jakarta Sans, Inter)
- **Animasyonlar:** Canvas Confetti, CSS Keyframe Animations
- **Depolama:** LocalStorage State Store & JSON Backup/Restore
