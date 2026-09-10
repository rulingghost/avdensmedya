-- ==============================================================================
-- AVDENS WORK - Müşteri & İş Takip Sistemi
-- Supabase PostgreSQL Veritabanı Şeması & Başlangıç Verileri
-- ==============================================================================
-- Bu SQL dosyasını Supabase Dashboard > SQL Editor sekmesine yapıştırıp "Run" 
-- butonuna basarak tüm veritabanı tablolarını ve ilk verileri tek seferde oluşturabilirsiniz.

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
-- ROW LEVEL SECURITY (RLS) POLİTİKALARI (Tüm tablolara anonim okuma/yazma izni)
-- ==============================================================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE files ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_requests ENABLE ROW LEVEL SECURITY;

-- Her tablo için anon / authenticated izin politikaları
DO $$ 
BEGIN
  CREATE POLICY "Public Read Users" ON users FOR ALL USING (true) WITH CHECK (true);
  CREATE POLICY "Public Read Categories" ON categories FOR ALL USING (true) WITH CHECK (true);
  CREATE POLICY "Public Read Customers" ON customers FOR ALL USING (true) WITH CHECK (true);
  CREATE POLICY "Public Read Tasks" ON tasks FOR ALL USING (true) WITH CHECK (true);
  CREATE POLICY "Public Read Credentials" ON credentials FOR ALL USING (true) WITH CHECK (true);
  CREATE POLICY "Public Read Notes" ON notes FOR ALL USING (true) WITH CHECK (true);
  CREATE POLICY "Public Read Files" ON files FOR ALL USING (true) WITH CHECK (true);
  CREATE POLICY "Public Read Comments" ON comments FOR ALL USING (true) WITH CHECK (true);
  CREATE POLICY "Public Read Activities" ON activities FOR ALL USING (true) WITH CHECK (true);
  CREATE POLICY "Public Read Notifications" ON notifications FOR ALL USING (true) WITH CHECK (true);
  CREATE POLICY "Public Read Templates" ON templates FOR ALL USING (true) WITH CHECK (true);
  CREATE POLICY "Public Read Onboarding" ON onboarding_requests FOR ALL USING (true) WITH CHECK (true);
EXCEPTION WHEN others THEN
  NULL;
END $$;

-- Realtime yayını açma
ALTER PUBLICATION supabase_realtime ADD TABLE tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE customers;
ALTER PUBLICATION supabase_realtime ADD TABLE notes;
ALTER PUBLICATION supabase_realtime ADD TABLE credentials;
ALTER PUBLICATION supabase_realtime ADD TABLE comments;
ALTER PUBLICATION supabase_realtime ADD TABLE activities;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE onboarding_requests;

-- ==============================================================================
-- BAŞLANGIÇ VERİLERİ (SEED DATA)
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

-- Şifre Kasası
INSERT INTO credentials (id, "customerId", "serviceType", "serviceName", icon, color, "clientVisible", fields, "updatedAt")
VALUES
  ('cred-1', 'cust-omtek', 'Instagram', 'Instagram İşletme Hesabı', 'Instagram', '#E1306C', true, '[{"key":"Kullanıcı Adı","value":"omteklazer_tr","isSecret":false},{"key":"E-posta","value":"social@omteklazer.com","isSecret":false},{"key":"Telefon","value":"+90 532 111 22 33","isSecret":false},{"key":"Şifre","value":"Omtek2026*Secret!","isSecret":true},{"key":"Not","value":"2FA Mücahit telefonuna bağlı.","isSecret":false}]'::jsonb, '2026-09-02'),
  ('cred-2', 'cust-omtek', 'Facebook', 'Facebook Sayfası', 'Facebook', '#1877F2', true, '[{"key":"E-posta","value":"fb@omteklazer.com","isSecret":false},{"key":"Şifre","value":"FbPass992*Omtek","isSecret":true},{"key":"Sayfa URL","value":"https://facebook.com/omteklazer","isSecret":false}]'::jsonb, '2026-09-02'),
  ('cred-3', 'cust-omtek', 'Meta Business', 'Meta Business Suite & Ads', 'Layers', '#0081FB', false, '[{"key":"Business ID","value":"948291048192019","isSecret":false},{"key":"Reklam Hesabı ID","value":"act_49201948291","isSecret":false},{"key":"Pixel ID","value":"px_839201948201","isSecret":false},{"key":"E-posta","value":"ads@omteklazer.com","isSecret":false},{"key":"Notlar","value":"Harcama limiti günlük 1.500 TL olarak sınırlandırılmıştır.","isSecret":false}]'::jsonb, '2026-09-03'),
  ('cred-4', 'cust-omtek', 'Web Sitesi', 'WordPress Yönetim Paneli', 'Globe', '#21759B', true, '[{"key":"Admin URL","value":"https://omteklazer.com/wp-admin","isSecret":false},{"key":"Kullanıcı Adı","value":"admin_omtek","isSecret":false},{"key":"Şifre","value":"Wp*LazerMaster2026#","isSecret":true}]'::jsonb, '2026-09-03'),
  ('cred-5', 'cust-omtek', 'Hosting', 'cPanel Sunucu Girişi', 'Server', '#FF6C37', false, '[{"key":"Hosting Firması","value":"Güzel Hosting","isSecret":false},{"key":"cPanel URL","value":"https://cpanel.omteklazer.com:2083","isSecret":false},{"key":"Kullanıcı Adı","value":"cpl_omtek","isSecret":false},{"key":"Şifre","value":"Cpanel*Hosting99!","isSecret":true}]'::jsonb, '2026-09-04')
ON CONFLICT (id) DO NOTHING;

-- Notlar
INSERT INTO notes (id, "customerId", "authorName", "authorRole", "authorAvatar", content, color, "createdAt")
VALUES
  ('note-1', 'cust-omtek', 'Mücahit Atıl', 'Aracı', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80', 'Müşteri içeriklerde kırmızı ağırlıklı tasarım kesinlikle istemiyor. Kurumsal kimliklerine uygun lacivert, antrasit ve altın detaylar tercih edilecek.', 'amber', '2026-09-01T11:20:00.000Z'),
  ('note-2', 'cust-omtek', 'Serdar KEKLİK', 'Admin', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80', 'Müşteri Meta reklamlarında öncelikle WhatsApp dönüşü istiyor. Form yerine doğrudan mesaj bağlantısı üzerinden fason kesim teklif talepleri toplanacak.', 'blue', '2026-09-02T14:10:00.000Z')
ON CONFLICT (id) DO NOTHING;

-- Dosyalar
INSERT INTO files (id, "customerId", name, category, size, type, description, "uploadedBy", "uploadedAt")
VALUES
  ('file-1', 'cust-omtek', 'OMTEK_Vektor_Logo.svg', 'Logo', '2.4 MB', 'svg', 'Yüksek çözünürlüklü vektörel logo (koyu ve açık zemin)', 'Özlem Kaya', '2026-09-01T10:00:00.000Z'),
  ('file-2', 'cust-omtek', 'Kurumsal_Kimlik_Rehberi.pdf', 'Kurumsal Kimlik', '8.1 MB', 'pdf', 'Pantone renk kodları, font dosyaları ve kullanım kuralları', 'Serdar KEKLİK', '2026-09-01T12:30:00.000Z'),
  ('file-3', 'cust-omtek', 'Dijital_Pazarlama_Hizmet_Sozlesmesi.pdf', 'Sözleşme', '1.2 MB', 'pdf', 'Islak imzalı 12 aylık danışmanlık ve reklam yönetimi sözleşmesi', 'Serdar KEKLİK', '2026-09-01T15:00:00.000Z'),
  ('file-4', 'cust-omtek', 'Eylul_Kampanya_Gorselleri.zip', 'Reklam Görselleri', '45.0 MB', 'zip', 'Fabrika lazer tezgahından çekilmiş ham kesim videoları ve görseller', 'Mücahit Atıl', '2026-09-05T09:20:00.000Z')
ON CONFLICT (id) DO NOTHING;

-- Yorumlar
INSERT INTO comments (id, "customerId", "userName", "userRole", "userAvatar", message, reply, "createdAt")
VALUES
  ('comm-1', 'cust-omtek', 'Özlem Kaya', 'musteri', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80', 'İlk hazırlanan gönderi tasarımlarını çok beğendik. Sadece arka plan tonunu biraz daha koyu lacivert yapabilir miyiz?', '{"userName":"Serdar KEKLİK","userRole":"admin","userAvatar":"https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80","message":"Tabii Özlem Hanım, tasarım ekibimiz tonları koyulaştırdı ve yeni önizlemeleri Dosyalar sekmesine yükledi.","createdAt":"2026-09-06T14:15:00.000Z"}'::jsonb, '2026-09-06T11:20:00.000Z'),
  ('comm-2', 'cust-omtek', 'Özlem Kaya', 'musteri', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80', 'WhatsApp reklamından dün 3 adet lazer fason kesim talebi aldık, dönüşler gayet hızlı başladı. Elinize sağlık!', NULL, '2026-09-08T09:40:00.000Z')
ON CONFLICT (id) DO NOTHING;

-- Aktiviteler
INSERT INTO activities (id, "customerId", "customerName", "userName", "actionText", type, "createdAt")
VALUES
  ('act-1', 'cust-omtek', 'OMTEK Lazer', 'Mücahit Atıl', 'Rakip analizi ve sektör hashtag listesi görevini tamamladı.', 'task_completed', '2026-09-08T09:15:00.000Z'),
  ('act-2', 'cust-omtek', 'OMTEK Lazer', 'Özlem Kaya (Müşteri)', 'Projeye yeni bir geri bildirim yorumu bıraktı.', 'comment', '2026-09-08T09:40:00.000Z'),
  ('act-3', 'cust-omtek', 'OMTEK Lazer', 'Serdar KEKLİK', 'WhatsApp dönüşüm reklamı görevini tamamladı.', 'task_completed', '2026-09-07T11:30:00.000Z'),
  ('act-4', 'cust-abc', 'ABC Mobilya', 'Serdar KEKLİK', 'ABC Mobilya projesine yeni başlangıç bilgi talebi gönderildi.', 'onboarding', '2026-09-06T15:10:00.000Z'),
  ('act-5', 'cust-omtek', 'OMTEK Lazer', 'Serdar KEKLİK', 'Meta Business hesap bilgisi güvenli kasaya eklendi.', 'credential', '2026-09-03T11:00:00.000Z')
ON CONFLICT (id) DO NOTHING;

-- Bildirimler
INSERT INTO notifications (id, title, message, read, "linkCustomerId", "createdAt")
VALUES
  ('notif-1', 'Yeni Müşteri Yorumu', 'OMTEK Lazer projesinde Özlem Kaya yeni bir yorum bıraktı.', false, 'cust-omtek', '2026-09-08T09:40:00.000Z'),
  ('notif-2', 'İşe Başlama Bilgileri Doldurulmalı', 'OMTEK Lazer için işi başlatmak üzere başlangıç bilgileri talep edildi.', false, 'cust-omtek', '2026-09-08T08:00:00.000Z')
ON CONFLICT (id) DO NOTHING;

-- Şablonlar
INSERT INTO templates (id, name, description, "taskItems")
VALUES
  ('tmpl-sosyal-medya', 'Sosyal Medya ve Meta Yönetimi (Standart Paket)', 'Yeni müşteriler için tek tıkla 14 adımlı standart sosyal medya ve reklam kurulumu.', '[{"title":"Instagram Analizi ve Profil Taraması","category":"cat-organik","priority":"normal"},{"title":"Meta Business Kurulumu ve Doğrulama","category":"cat-meta","priority":"yuksek"},{"title":"Facebook Sayfası ve Instagram Bağlantısı","category":"cat-meta","priority":"yuksek"},{"title":"Reklam Hesabı ve Ödeme Kurulumu","category":"cat-meta","priority":"yuksek"},{"title":"Profil Optimizasyonu ve Biyo Linki","category":"cat-meta","priority":"normal"},{"title":"İçerik Konsepti ve Renk Paleti","category":"cat-icerik","priority":"yuksek"},{"title":"Gönderi Tasarımları (Haftalık Şablonlar)","category":"cat-icerik","priority":"normal"},{"title":"Reels Video Planlaması","category":"cat-icerik","priority":"yuksek"},{"title":"Story Takvimi ve Etkileşim Planı","category":"cat-icerik","priority":"normal"},{"title":"İlk Reklam Kampanyası Kurulumu","category":"cat-reklam","priority":"acil"},{"title":"WhatsApp Mesaj Reklamı Kurulumu","category":"cat-reklam","priority":"acil"},{"title":"Remarketing (Yeniden Pazarlama) Kurulumu","category":"cat-reklam","priority":"yuksek"},{"title":"Organik Büyüme ve Rakip Etkileşimi","category":"cat-organik","priority":"normal"},{"title":"Aylık Yönetici Performans Raporu","category":"cat-rapor","priority":"normal"}]'::jsonb),
  ('tmpl-web-seo', 'Web Sitesi Kurulum & SEO Başlangıç Paketi', 'Kurumsal web sitesi ve arama motoru optimizasyonu görev dizisi.', '[{"title":"Domain ve Hosting Kurulumu","category":"cat-teknik","priority":"acil"},{"title":"WordPress ve Güvenlik Eklentileri Kurulumu","category":"cat-teknik","priority":"yuksek"},{"title":"Google Analytics 4 & Search Console Bağlantısı","category":"cat-teknik","priority":"yuksek"},{"title":"Sayfa İçi SEO ve Meta Açıklamaları","category":"cat-organik","priority":"normal"},{"title":"İletişim Formları ve WhatsApp Butonu Entegrasyonu","category":"cat-teknik","priority":"yuksek"}]'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- Onboarding Talepleri
INSERT INTO onboarding_requests (id, "customerId", "customerName", title, description, status, items, "completedAt", "createdAt")
VALUES
  ('req-omtek', 'cust-omtek', 'OMTEK Lazer', 'Meta & Sosyal Medya Başlangıç Bilgileri', 'İşlemlerin başlayabilmesi için lütfen aşağıdaki kurumsal logo, şifre ve iletişim bilgilerini iletiniz.', 'completed', '[{"id":"item-1","label":"Vektörel Logo Dosyası (SVG / AI / PDF)","type":"file","required":true,"value":"OMTEK_Vektor_Logo.svg","isSubmitted":true},{"id":"item-2","label":"Instagram Giriş Şifresi","type":"password","required":true,"value":"Omtek2026*Secret!","isSubmitted":true},{"id":"item-3","label":"WhatsApp İletişim Numarası","type":"text","required":true,"value":"+90 532 111 22 33","isSubmitted":true},{"id":"item-4","label":"Tasarım Renk & Konsept Tercihleri","type":"note","required":false,"value":"Kırmızı istenmiyor, lacivert ve altın tercih edilecek","isSubmitted":true}]'::jsonb, '2026-09-01T11:00:00.000Z', '2026-09-01T09:30:00.000Z'),
  ('req-abc', 'cust-abc', 'ABC Mobilya', 'E-Ticaret & Katalog Başlangıç Talepleri', 'Mobilya ürünlerinin listelenmesi ve reklamların açılması için gereklidir.', 'pending', '[{"id":"item-abc-1","label":"Yüksek Çözünürlüklü Logo Dosyası","type":"file","required":true,"value":"","isSubmitted":false},{"id":"item-abc-2","label":"WordPress / E-Ticaret Admin Şifresi","type":"password","required":true,"value":"","isSubmitted":false},{"id":"item-abc-3","label":"Öne Çıkarılacak İlk 5 Ürün ve Fiyat Listesi","type":"note","required":true,"value":"","isSubmitted":false}]'::jsonb, NULL, '2026-09-07T14:00:00.000Z')
ON CONFLICT (id) DO NOTHING;
