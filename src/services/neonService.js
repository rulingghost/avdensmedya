// AVDENS WORK - Neon Serverless PostgreSQL İstemci Servisi
// Vercel Serverless Functions (/api/*) ile haberleşir

const API_BASE = '/api';

async function request(endpoint, options = {}) {
  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });
    const data = await res.json();
    return data;
  } catch (err) {
    console.error(`API ${endpoint} error:`, err);
    return { success: false, error: err.message };
  }
}

// 1. Tüm verileri Neon PostgreSQL'den çek
export async function fetchNeonData() {
  return await request('/data', { method: 'GET' });
}

// 2. Veritabanını tek tıkla başlat (Tabloları ve demo verileri oluştur)
export async function initNeonDatabase(customData = null) {
  return await request('/init-db', {
    method: 'POST',
    body: customData ? JSON.stringify(customData) : JSON.stringify({})
  });
}

// 3. Neon bağlantı sağlık testi
export async function testNeonHealth() {
  return await request('/health', { method: 'GET' });
}

// 4. Mutasyon yardımcısı
async function mutate(action, payload) {
  return await request('/data', {
    method: 'POST',
    body: JSON.stringify({ action, payload })
  });
}

// --- Görevler ---
export const neonInsertTask = (task) => mutate('insertTask', task);
export const neonUpdateTask = (id, updates) => mutate('updateTask', { id, updates });
export const neonDeleteTask = (id) => mutate('deleteTask', { id });

// --- Müşteriler ---
export const neonInsertCustomer = (customer) => mutate('insertCustomer', customer);
export const neonUpdateCustomer = (id, updates) => mutate('updateCustomer', { id, updates });
export const neonDeleteCustomer = (id) => mutate('deleteCustomer', { id });

// --- Notlar ---
export const neonInsertNote = (note) => mutate('insertNote', note);
export const neonDeleteNote = (id) => mutate('deleteNote', { id });

// --- Şifre Kasası ---
export const neonInsertCredential = (credential) => mutate('insertCredential', credential);
export const neonUpdateCredential = (id, updates) => mutate('updateCredential', { id, updates });
export const neonDeleteCredential = (id) => mutate('deleteCredential', { id });

// --- Dosyalar ---
export const neonInsertFile = (file) => mutate('insertFile', file);
export const neonDeleteFile = (id) => mutate('deleteFile', { id });

// --- Yorumlar ---
export const neonInsertComment = (comment) => mutate('insertComment', comment);
export const neonUpdateComment = (id, updates) => mutate('updateComment', { id, updates });

// --- Bildirimler & Aktiviteler ---
export const neonInsertActivity = (activity) => mutate('insertActivity', activity);
export const neonInsertNotification = (notification) => mutate('insertNotification', notification);
export const neonMarkNotificationRead = (id) => mutate('markNotificationRead', { id });
export const neonMarkAllNotificationsRead = () => mutate('markAllNotificationsRead', {});

// --- Şablonlar & Kullanıcı & Onboarding ---
export const neonInsertTemplate = (template) => mutate('insertTemplate', template);
export const neonUpdateTemplate = (id, updates) => mutate('updateTemplate', { id, updates });
export const neonDeleteTemplate = (id) => mutate('deleteTemplate', { id });
export const neonInsertUser = (user) => mutate('insertUser', user);
export const neonUpdateUser = (id, updates) => mutate('updateUser', { id, updates });
export const neonDeleteUser = (id) => mutate('deleteUser', { id });
export const neonUpdateOnboardingRequest = (id, updates) => mutate('updateOnboardingRequest', { id, updates });
export const neonClearAllData = () => mutate('clearAllData', {});
