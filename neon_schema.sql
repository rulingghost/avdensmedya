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
-- BAŞLANGIÇ VERİLERİ (Yönetici, Aracı ve Kategoriler)
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

