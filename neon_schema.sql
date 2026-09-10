-- ==============================================================================
-- AVDENS WORK - Müşteri & İş Takip Sistemi
-- Vercel + Neon Serverless PostgreSQL Veritabanı Şeması & Başlangıç Verileri
-- ==============================================================================
-- Bu SQL dosyasını Neon Console > SQL Editor alanına yapıştırıp çalıştırabilirsiniz.
-- (Veya uygulama içindeki "Ayarlar > Veritabanını Başlat" butonuna tıklayarak
-- hiçbir SQL yapıştırmadan otomatik olarak da oluşturabilirsiniz!)

-- 1. KULLANICILAR (USERS)
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'musteri',
  avatar TEXT,
  title TEXT,
  phone TEXT,
  company TEXT,
  "customerId" TEXT,
  "createdAt" TIMESTAMPTZ DEFAULT NOW()
);

-- 2. KATEGORİLER (CATEGORIES)
CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  color TEXT NOT NULL,
  icon TEXT NOT NULL
);

-- 3. MÜŞTERİLER (CUSTOMERS)
CREATE TABLE IF NOT EXISTS customers (
  id TEXT PRIMARY KEY,
  "companyName" TEXT NOT NULL,
  "contactPerson" TEXT,
  phone TEXT,
  whatsapp TEXT,
  email TEXT,
  website TEXT,
  instagram TEXT,
  facebook TEXT,
  "partnerId" TEXT,
  "partnerName" TEXT,
  status TEXT DEFAULT 'aktif',
  "projectTitle" TEXT,
  "startDate" TEXT,
  description TEXT,
  "createdAt" TIMESTAMPTZ DEFAULT NOW()
);

-- 4. GÖREVLER (TASKS)
CREATE TABLE IF NOT EXISTS tasks (
  id TEXT PRIMARY KEY,
  "customerId" TEXT NOT NULL,
  "categoryId" TEXT,
  title TEXT NOT NULL,
  description TEXT,
  "assignedTo" TEXT,
  "assignedRole" TEXT,
  "startDate" TEXT,
  "dueDate" TEXT,
  priority TEXT DEFAULT 'normal',
  status TEXT DEFAULT 'yapilacak',
  "isCompleted" BOOLEAN DEFAULT FALSE,
  "completedAt" TIMESTAMPTZ,
  "completedBy" TEXT,
  "waitingForClient" BOOLEAN DEFAULT FALSE,
  "waitingReason" TEXT,
  "createdAt" TIMESTAMPTZ DEFAULT NOW()
);

-- 5. ŞİFRE KASASI (CREDENTIALS)
CREATE TABLE IF NOT EXISTS credentials (
  id TEXT PRIMARY KEY,
  "customerId" TEXT NOT NULL,
  "serviceType" TEXT NOT NULL,
  "serviceName" TEXT NOT NULL,
  icon TEXT,
  color TEXT,
  "clientVisible" BOOLEAN DEFAULT FALSE,
  fields JSONB DEFAULT '[]'::jsonb,
  "updatedAt" TEXT,
  "createdAt" TIMESTAMPTZ DEFAULT NOW()
);

-- 6. NOTLAR (NOTES)
CREATE TABLE IF NOT EXISTS notes (
  id TEXT PRIMARY KEY,
  "customerId" TEXT NOT NULL,
  "authorName" TEXT NOT NULL,
  "authorRole" TEXT,
  "authorAvatar" TEXT,
  content TEXT NOT NULL,
  color TEXT DEFAULT 'blue',
  "createdAt" TIMESTAMPTZ DEFAULT NOW()
);

-- 7. DOSYALAR (FILES)
CREATE TABLE IF NOT EXISTS files (
  id TEXT PRIMARY KEY,
  "customerId" TEXT NOT NULL,
  name TEXT NOT NULL,
  category TEXT,
  size TEXT,
  type TEXT,
  description TEXT,
  "uploadedBy" TEXT,
  "uploadedAt" TIMESTAMPTZ DEFAULT NOW(),
  "fileUrl" TEXT
);

-- 8. YORUMLAR (COMMENTS)
CREATE TABLE IF NOT EXISTS comments (
  id TEXT PRIMARY KEY,
  "customerId" TEXT NOT NULL,
  "userName" TEXT NOT NULL,
  "userRole" TEXT,
  "userAvatar" TEXT,
  message TEXT NOT NULL,
  reply JSONB DEFAULT NULL,
  "createdAt" TIMESTAMPTZ DEFAULT NOW()
);

-- 9. AKTİVİTELER (ACTIVITIES)
CREATE TABLE IF NOT EXISTS activities (
  id TEXT PRIMARY KEY,
  "customerId" TEXT,
  "customerName" TEXT,
  "userName" TEXT NOT NULL,
  "actionText" TEXT NOT NULL,
  type TEXT DEFAULT 'general',
  "createdAt" TIMESTAMPTZ DEFAULT NOW()
);

-- 10. BİLDİRİMLER (NOTIFICATIONS)
CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  "linkCustomerId" TEXT,
  "createdAt" TIMESTAMPTZ DEFAULT NOW()
);

-- 11. GÖREV ŞABLONLARI (TEMPLATES)
CREATE TABLE IF NOT EXISTS templates (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  "taskItems" JSONB DEFAULT '[]'::jsonb
);

-- 12. ONBOARDING TALEPLERİ (ONBOARDING_REQUESTS)
CREATE TABLE IF NOT EXISTS onboarding_requests (
  id TEXT PRIMARY KEY,
  "customerId" TEXT NOT NULL,
  "customerName" TEXT,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending',
  items JSONB DEFAULT '[]'::jsonb,
  "completedAt" TIMESTAMPTZ,
  "createdAt" TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- BAŞLANGIÇ DEMO VERİLERİ (OMTEK Lazer vb.)
-- ==============================================================================

-- Kullanıcılar
INSERT INTO users (id, name, email, password, role, avatar, title, phone, company, "customerId")
VALUES 
  ('user-admin', 'Serdar KEKLİK', 'serdar@avdens.work', '123', 'admin', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80', 'Ajans Yöneticisi', '+90 532 900 11 22', NULL, NULL),
  ('user-araci', 'Mücahit Atıl', 'mucahit@avdens.work', '123', 'araci', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80', 'İş Ortağı / Aracı', '+90 533 800 33 44', NULL, NULL),
  ('user-musteri', 'Özlem Kaya', 'ozlem@omteklazer.com', '123', 'musteri', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80', 'Firma Yetkilisi (OMTEK Lazer)', '+90 532 111 22 33', 'OMTEK Lazer', 'cust-omtek')
ON CONFLICT (id) DO NOTHING;

-- Kategoriler
INSERT INTO categories (id, name, color, icon)
VALUES
  ('cat-meta', 'Meta Kurulum', '#3B82F6', 'Settings'),
  ('cat-icerik', 'İçerik Yönetimi', '#8B5CF6', 'PenTool'),
  ('cat-reklam', 'Reklam Yönetimi', '#EC4899', 'Megaphone'),
  ('cat-organik', 'Organik Büyüme', '#10B981', 'TrendingUp'),
  ('cat-teknik', 'Teknik İşlemler', '#F59E0B', 'Code'),
  ('cat-tasarim', 'Tasarım', '#6366F1', 'Palette'),
  ('cat-rapor', 'Raporlama', '#14B8A6', 'BarChart3')
ON CONFLICT (id) DO NOTHING;

-- Müşteriler
INSERT INTO customers (id, "companyName", "contactPerson", phone, whatsapp, email, website, instagram, facebook, "partnerId", "partnerName", status, "projectTitle", "startDate", description)
VALUES
  ('cust-omtek', 'OMTEK Lazer', 'Özlem Kaya', '+90 532 111 22 33', '+90 532 111 22 33', 'info@omteklazer.com', 'https://omteklazer.com', '@omteklazer', 'facebook.com/omteklazer', 'user-araci', 'Mücahit Atıl', 'aktif', 'Instagram & Meta Yönetimi', '2026-09-01', 'Endüstriyel lazer kesim makineleri ve fason üretim tanıtımı için sosyal medya ve reklam yönetimi.'),
  ('cust-abc', 'ABC Mobilya', 'Ahmet Yılmaz', '+90 544 222 33 44', '+90 544 222 33 44', 'info@abcmobilya.com', 'https://abcmobilya.com', '@abcmobilya', 'facebook.com/abcmobilya', 'user-araci', 'Mücahit Atıl', 'aktif', 'E-Ticaret & Google Ads Büyüme', '2026-08-15', 'Masif ahşap mobilya ürünlerinin yurt içi e-ticaret satışı ve marka bilinirliği.'),
  ('cust-xyz', 'XYZ Klinik & Sağlık', 'Dr. Selin Demir', '+90 555 333 44 55', '+90 555 333 44 55', 'iletisim@xyzsaglik.com', 'https://xyzsaglik.com', '@xyzsaglik', 'facebook.com/xyzsaglik', 'user-araci', 'Mücahit Atıl', 'beklemede', 'Sağlık Turizmi Lead Kampanyası', '2026-09-05', 'Yurtdışı diş ve estetik hastaları için çok dilli lead oluşturma çalışması.')
ON CONFLICT (id) DO NOTHING;

-- Görevler
INSERT INTO tasks (id, "customerId", "categoryId", title, description, "assignedTo", "startDate", "dueDate", priority, status, "isCompleted", "completedAt", "completedBy", "waitingForClient", "waitingReason")
VALUES
  ('task-1', 'cust-omtek', 'cat-meta', 'Instagram ve Facebook bağlantısını kur', 'Instagram profesyonel hesabı ile Facebook işletme sayfasını birbirine bağla.', 'Mücahit Atıl', '2026-09-01', '2026-09-03', 'yuksek', 'tamamlandi', true, '2026-09-02T14:30:00.000Z', 'Mücahit Atıl', false, ''),
  ('task-2', 'cust-omtek', 'cat-meta', 'Facebook Sayfası bağlantısı', 'Resmi sayfa yöneticilik izinlerini tanımla.', 'Mücahit Atıl', '2026-09-02', '2026-09-04', 'normal', 'tamamlandi', true, '2026-09-02T15:15:00.000Z', 'Mücahit Atıl', false, ''),
  ('task-3', 'cust-omtek', 'cat-meta', 'Meta Business hesabını oluştur', 'Meta Business Suite portali kurulumu ve alan adı doğrulama.', 'Serdar KEKLİK', '2026-09-02', '2026-09-04', 'yuksek', 'tamamlandi', true, '2026-09-03T11:00:00.000Z', 'Serdar KEKLİK', false, ''),
  ('task-4', 'cust-omtek', 'cat-meta', 'Reklam hesabı kurulumu ve faturalandırma', 'Yeni reklam hesabı oluşturuldu, fatura bilgileri girildi.', 'Serdar KEKLİK', '2026-09-03', '2026-09-05', 'yuksek', 'tamamlandi', true, '2026-09-03T16:45:00.000Z', 'Serdar KEKLİK', false, ''),
  ('task-5', 'cust-omtek', 'cat-meta', 'Profil optimizasyonu ve biyo düzenleme', 'Instagram bio metni, WhatsApp iletişim butonu ve linkler hazırlandı.', 'Mücahit Atıl', '2026-09-03', '2026-09-05', 'normal', 'tamamlandi', true, '2026-09-04T10:20:00.000Z', 'Mücahit Atıl', false, ''),
  ('task-6', 'cust-omtek', 'cat-icerik', 'Görsel konsept ve renk paleti oluştur', 'Lacivert ve altın tonları kullanılarak kurumsal post şablonları hazırlandı.', 'Tasarım Ekibi', '2026-09-04', '2026-09-06', 'yuksek', 'tamamlandi', true, '2026-09-05T17:00:00.000Z', 'Serdar KEKLİK', false, ''),
  ('task-7', 'cust-omtek', 'cat-icerik', 'İlk hafta gönderilerini tasarla (6 Adet)', 'Lazer kesim hassasiyeti ve fabrika tanıtım gönderileri tasarlandı.', 'Tasarım Ekibi', '2026-09-05', '2026-09-07', 'normal', 'tamamlandi', true, '2026-09-06T13:40:00.000Z', 'Serdar KEKLİK', false, ''),
  ('task-8', 'cust-omtek', 'cat-icerik', 'Reels video kurguları ve ses planlaması', 'Atölyede çekilen ham kesim videolarının dinamik kurgusu yapılacak.', 'Tasarım Ekibi', '2026-09-07', '2026-09-10', 'yuksek', 'devam_ediyor', false, NULL, NULL, false, ''),
  ('task-9', 'cust-omtek', 'cat-icerik', 'Haftalık Story takvimini oluştur', 'Müşteri soru-cevap ve tezgah arkası story içerikleri planlanacak.', 'Mücahit Atıl', '2026-09-08', '2026-09-11', 'normal', 'yapilacak', false, NULL, NULL, false, ''),
  ('task-10', 'cust-omtek', 'cat-reklam', 'Hedef kitle belirleme (Sanayi & Makine İmalat)', 'Bursa, İstanbul ve Kocaeli organize sanayi bölgeleri hedeflendi.', 'Serdar KEKLİK', '2026-09-04', '2026-09-06', 'yuksek', 'tamamlandi', true, '2026-09-05T18:00:00.000Z', 'Serdar KEKLİK', false, ''),
  ('task-11', 'cust-omtek', 'cat-reklam', 'İlk test kampanyasını başlat (WhatsApp Mesaj)', 'Görsel 1 ve Görsel 2 ile A/B test reklamı yayına alındı.', 'Serdar KEKLİK', '2026-09-05', '2026-09-08', 'acil', 'tamamlandi', true, '2026-09-07T11:30:00.000Z', 'Serdar KEKLİK', false, ''),
  ('task-12', 'cust-omtek', 'cat-reklam', 'Pixel ve dönüşüm API kurulumu', 'omteklazer.com üzerine Meta Pixel kodu eklendi, olaylar test edildi.', 'Serdar KEKLİK', '2026-09-06', '2026-09-09', 'yuksek', 'tamamlandi', true, '2026-09-07T17:00:00.000Z', 'Serdar KEKLİK', false, ''),
  ('task-13', 'cust-omtek', 'cat-reklam', 'Reklam performans optimizasyonu ve bütçe artışı', 'Tıklama başı maliyet 1.4 TL seviyesine düşürüldü, bütçe optimize ediliyor.', 'Serdar KEKLİK', '2026-09-08', '2026-09-12', 'yuksek', 'devam_ediyor', false, NULL, NULL, false, ''),
  ('task-14', 'cust-omtek', 'cat-reklam', 'Yeniden pazarlama (Remarketing) kitlesi', 'Web sitesi ziyaretçileri ve Instagram etkileşim kitlesi oluşturulacak.', 'Serdar KEKLİK', '2026-09-10', '2026-09-15', 'normal', 'yapilacak', false, NULL, NULL, false, ''),
  ('task-15', 'cust-omtek', 'cat-organik', 'Rakip analizi ve sektör hashtag listesi', 'Bursa ve Marmara bölgesi metal işleme etiketleri belirlendi.', 'Mücahit Atıl', '2026-09-06', '2026-09-08', 'normal', 'tamamlandi', true, '2026-09-08T09:15:00.000Z', 'Mücahit Atıl', false, ''),
  ('task-16', 'cust-omtek', 'cat-organik', 'Sektörel etkileşim çalışması', 'Hedef sanayi sayfaları ve potansiyel müşterilerle günlük etkileşim kurulması.', 'Mücahit Atıl', '2026-09-08', '2026-09-14', 'normal', 'devam_ediyor', false, NULL, NULL, false, ''),
  ('task-17', 'cust-omtek', 'cat-organik', 'Yeni ürün ve makine tanıtım çekimi', 'Yeni 12kW fiber lazer makinesinin çalışma esnasındaki yüksek çözünürlüklü fotoğrafları.', 'Mücahit Atıl', '2026-09-09', '2026-09-16', 'yuksek', 'beklemede', false, NULL, NULL, true, 'Müşteriden yeni makinenin çekim tarihi ve fabrika randevusu bekleniyor'),
  ('task-18', 'cust-omtek', 'cat-organik', 'Aylık performans ve büyüme raporu', 'Erişim, takipçi artışı, WhatsApp dönüşüm sayılarını içeren yönetici raporu sunulacak.', 'Serdar KEKLİK', '2026-09-25', '2026-09-30', 'normal', 'yapilacak', false, NULL, NULL, false, '')
ON CONFLICT (id) DO NOTHING;
