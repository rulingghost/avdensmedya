import { getSqlClient, getDatabaseUrl } from './db.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const sql = getSqlClient();
  if (!sql) {
    return res.status(400).json({
      success: false,
      error: 'DATABASE_URL veya POSTGRES_URL bulunamadı. Lütfen Vercel panelinden Neon Postgres ekleyin.'
    });
  }

  try {
    // 1. Tabloları oluştur
    await sql`
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
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS categories (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        color TEXT NOT NULL,
        icon TEXT NOT NULL
      );
    `;

    await sql`
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
    `;

    await sql`
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
    `;

    await sql`
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
    `;

    await sql`
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
    `;

    await sql`
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
    `;

    await sql`
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
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS activities (
        id TEXT PRIMARY KEY,
        "customerId" TEXT,
        "customerName" TEXT,
        "userName" TEXT NOT NULL,
        "actionText" TEXT NOT NULL,
        type TEXT DEFAULT 'general',
        "createdAt" TIMESTAMPTZ DEFAULT NOW()
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS notifications (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        message TEXT NOT NULL,
        read BOOLEAN DEFAULT FALSE,
        "linkCustomerId" TEXT,
        "createdAt" TIMESTAMPTZ DEFAULT NOW()
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS templates (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        "taskItems" JSONB DEFAULT '[]'::jsonb
      );
    `;

    await sql`
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
    `;

    // 2. Eğer özel veri gövdesi (body) gönderildiyse onu yükle, yoksa başlangıç demo verilerini yükle
    const customData = req.body && typeof req.body === 'object' && req.body.customers ? req.body : null;

    if (customData) {
      if (customData.users?.length) {
        for (const u of customData.users) {
          await sql`
            INSERT INTO users (id, name, email, password, role, avatar, title, phone, company, "customerId")
            VALUES (${u.id}, ${u.name}, ${u.email}, ${u.password}, ${u.role}, ${u.avatar || null}, ${u.title || null}, ${u.phone || null}, ${u.company || null}, ${u.customerId || null})
            ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, email = EXCLUDED.email, role = EXCLUDED.role;
          `;
        }
      }
      if (customData.customers?.length) {
        for (const c of customData.customers) {
          await sql`
            INSERT INTO customers (id, "companyName", "contactPerson", phone, whatsapp, email, website, instagram, facebook, "partnerId", "partnerName", status, "projectTitle", "startDate", description)
            VALUES (${c.id}, ${c.companyName}, ${c.contactPerson || null}, ${c.phone || null}, ${c.whatsapp || null}, ${c.email || null}, ${c.website || null}, ${c.instagram || null}, ${c.facebook || null}, ${c.partnerId || null}, ${c.partnerName || null}, ${c.status || 'aktif'}, ${c.projectTitle || null}, ${c.startDate || null}, ${c.description || null})
            ON CONFLICT (id) DO NOTHING;
          `;
        }
      }
      if (customData.tasks?.length) {
        for (const t of customData.tasks) {
          await sql`
            INSERT INTO tasks (id, "customerId", "categoryId", title, description, "assignedTo", "startDate", "dueDate", priority, status, "isCompleted", "completedAt", "completedBy", "waitingForClient", "waitingReason")
            VALUES (${t.id}, ${t.customerId}, ${t.categoryId || null}, ${t.title}, ${t.description || ''}, ${t.assignedTo || null}, ${t.startDate || null}, ${t.dueDate || null}, ${t.priority || 'normal'}, ${t.status || 'yapilacak'}, ${Boolean(t.isCompleted)}, ${t.completedAt || null}, ${t.completedBy || null}, ${Boolean(t.waitingForClient)}, ${t.waitingReason || ''})
            ON CONFLICT (id) DO NOTHING;
          `;
        }
      }
    } else {
      // Standart Başlangıç Verilerini Ekle (Yönetici, Aracı ve Kategoriler)
      await sql`
        INSERT INTO users (id, name, email, password, role, avatar, title, phone, company, "customerId")
        VALUES 
          ('user-admin', 'Serdar KEKLİK', 'serdar@avdens.work', '123', 'admin', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80', 'Ajans Yöneticisi', '+90 532 900 11 22', NULL, NULL),
          ('user-araci', 'Mücahit Atıl', 'mucahit@avdens.work', '123', 'araci', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80', 'İş Ortağı / Aracı', '+90 533 800 33 44', NULL, NULL)
        ON CONFLICT (id) DO NOTHING;
      `;

      await sql`
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
      `;
    }

    return res.status(200).json({
      success: true,
      message: 'Neon PostgreSQL veritabanı tabloları ve demo verileri başarıyla oluşturuldu.'
    });
  } catch (err) {
    console.error('init-db error:', err);
    return res.status(500).json({
      success: false,
      error: 'Veritabanı başlatılamadı: ' + err.message
    });
  }
}
