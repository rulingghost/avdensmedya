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
  ('user-araci', 'Mücahit Atıl', 'mucahit@avdens.work', '123', 'araci', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80', 'İş Ortağı / Aracı', '+90 533 800 33 44', NULL, NULL)
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

