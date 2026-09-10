import { createClient } from '@supabase/supabase-js';

// Varsayılan ortam değişkenlerini oku (.env dosyasından)
const envUrl = import.meta.env.VITE_SUPABASE_URL || '';
const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Kullanıcının UI (Ayarlar) üzerinden girdiği dinamik anahtarları kontrol et
function getStoredCredentials() {
  try {
    const customUrl = localStorage.getItem('AVDENS_CUSTOM_SUPABASE_URL');
    const customKey = localStorage.getItem('AVDENS_CUSTOM_SUPABASE_ANON_KEY');
    if (customUrl && customKey) {
      return { url: customUrl.trim(), anonKey: customKey.trim(), source: 'custom' };
    }
  } catch (e) {}

  if (envUrl && envKey && !envUrl.includes('your-project-id')) {
    return { url: envUrl.trim(), anonKey: envKey.trim(), source: 'env' };
  }

  return { url: '', anonKey: '', source: 'none' };
}

let activeConfig = getStoredCredentials();
let supabaseInstance = null;

function initClient() {
  activeConfig = getStoredCredentials();
  if (activeConfig.url && activeConfig.anonKey) {
    try {
      supabaseInstance = createClient(activeConfig.url, activeConfig.anonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true
        },
        realtime: {
          params: {
            eventsPerSecond: 10
          }
        }
      });
    } catch (err) {
      console.error('Supabase istemcisi başlatılamadı:', err);
      supabaseInstance = null;
    }
  } else {
    supabaseInstance = null;
  }
  return supabaseInstance;
}

// İlk başlatma
initClient();

export const supabase = supabaseInstance;

export function getSupabase() {
  if (!supabaseInstance) {
    initClient();
  }
  return supabaseInstance;
}

export function getSupabaseConfig() {
  const current = getStoredCredentials();
  return {
    url: current.url,
    anonKey: current.anonKey ? current.anonKey.slice(0, 10) + '...' + current.anonKey.slice(-6) : '',
    rawAnonKey: current.anonKey,
    isConfigured: Boolean(current.url && current.anonKey),
    source: current.source
  };
}

export function saveCustomConfig(url, anonKey) {
  try {
    if (url && anonKey) {
      localStorage.setItem('AVDENS_CUSTOM_SUPABASE_URL', url.trim());
      localStorage.setItem('AVDENS_CUSTOM_SUPABASE_ANON_KEY', anonKey.trim());
    } else {
      localStorage.removeItem('AVDENS_CUSTOM_SUPABASE_URL');
      localStorage.removeItem('AVDENS_CUSTOM_SUPABASE_ANON_KEY');
    }
    initClient();
    return { success: true };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

export async function testSupabaseConnection(overrideUrl, overrideKey) {
  try {
    let client = supabaseInstance;
    if (overrideUrl && overrideKey) {
      client = createClient(overrideUrl.trim(), overrideKey.trim());
    }

    if (!client) {
      return { success: false, message: 'Supabase URL ve Anon Key girilmemiş.' };
    }

    // Basit bir SELECT sorgusuyla bağlantıyı test et
    const { data, error } = await client.from('categories').select('count', { count: 'exact', head: true });
    
    if (error) {
      // Eğer tablo henüz oluşturulmadıysa ama yetkilendirme sağlandıysa
      if (error.code === '42P01') { // undefined_table
        return { 
          success: true, 
          tableMissing: true, 
          message: 'Supabase bağlantısı başarılı! Ancak tablolar henüz oluşturulmamış. Lütfen SQL şemasını çalıştırın.' 
        };
      }
      return { success: false, message: `Hata: ${error.message}` };
    }

    return { success: true, tableMissing: false, message: 'Supabase PostgreSQL veritabanı bağlantısı AKTİF ve çalışıyor!' };
  } catch (e) {
    return { success: false, message: `Bağlantı hatası: ${e.message}` };
  }
}
