// AVDENS WORK - Sistem Başlangıç Veritabanı (Temiz / Canlı Ortam)

export const INITIAL_USERS = [
  {
    id: 'user-admin',
    name: 'Serdar KEKLİK',
    email: 'serdar@a.work',
    password: '123456',
    role: 'admin', // 'admin' | 'araci' | 'musteri'
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    title: 'Ajans Yöneticisi',
    phone: '+90 532 900 11 22'
  },
  {
    id: 'user-araci',
    name: 'Ali Mücahit Atıl',
    email: 'atilglobal42@gmail.com',
    password: 'At13271327',
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    title: 'İş Ortağı / Aracı',
    phone: '05357705753'
  },
  {
    id: 'user-admin-alt',
    name: 'Serdar KEKLİK',
    email: 'serdar@avdens.work',
    password: '123',
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    title: 'Ajans Yöneticisi',
    phone: '+90 532 900 11 22'
  }
];

export const INITIAL_CATEGORIES = [
  { id: 'cat-meta', name: 'Meta Kurulum', color: '#3B82F6', icon: 'Settings' },
  { id: 'cat-icerik', name: 'İçerik Yönetimi', color: '#8B5CF6', icon: 'PenTool' },
  { id: 'cat-reklam', name: 'Reklam Yönetimi', color: '#EC4899', icon: 'Megaphone' },
  { id: 'cat-organik', name: 'Organik Büyüme', color: '#10B981', icon: 'TrendingUp' },
  { id: 'cat-teknik', name: 'Teknik İşlemler', color: '#F59E0B', icon: 'Code' },
  { id: 'cat-tasarim', name: 'Tasarım', color: '#6366F1', icon: 'Palette' },
  { id: 'cat-rapor', name: 'Raporlama', color: '#14B8A6', icon: 'BarChart3' }
];

export const INITIAL_CUSTOMERS = [];
export const INITIAL_TASKS = [];
export const INITIAL_CREDENTIALS = [];
export const INITIAL_NOTES = [];
export const INITIAL_FILES = [];
export const INITIAL_COMMENTS = [];
export const INITIAL_ACTIVITIES = [];
export const INITIAL_NOTIFICATIONS = [];
export const INITIAL_TEMPLATES = [];
export const INITIAL_ONBOARDING_REQUESTS = [];
export const INITIAL_CONTENT_POSTS = [];

