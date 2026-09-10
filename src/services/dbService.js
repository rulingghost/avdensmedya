import { getSupabase } from '../lib/supabase';
import {
  INITIAL_USERS,
  INITIAL_CUSTOMERS,
  INITIAL_CATEGORIES,
  INITIAL_TASKS,
  INITIAL_CREDENTIALS,
  INITIAL_NOTES,
  INITIAL_FILES,
  INITIAL_COMMENTS,
  INITIAL_ACTIVITIES,
  INITIAL_NOTIFICATIONS,
  INITIAL_TEMPLATES,
  INITIAL_ONBOARDING_REQUESTS
} from '../data/initialData';

// Tüm verileri Supabase tablolarından çek
export async function fetchAllData() {
  const supabase = getSupabase();
  if (!supabase) {
    return { success: false, isConfigured: false, error: 'Supabase yapılandırılmamış' };
  }

  try {
    const [
      usersRes,
      customersRes,
      categoriesRes,
      tasksRes,
      credentialsRes,
      notesRes,
      filesRes,
      commentsRes,
      activitiesRes,
      notificationsRes,
      templatesRes,
      onboardingRes
    ] = await Promise.all([
      supabase.from('users').select('*'),
      supabase.from('customers').select('*').order('createdAt', { ascending: false }),
      supabase.from('categories').select('*'),
      supabase.from('tasks').select('*').order('createdAt', { ascending: false }),
      supabase.from('credentials').select('*').order('createdAt', { ascending: false }),
      supabase.from('notes').select('*').order('createdAt', { ascending: false }),
      supabase.from('files').select('*').order('uploadedAt', { ascending: false }),
      supabase.from('comments').select('*').order('createdAt', { ascending: false }),
      supabase.from('activities').select('*').order('createdAt', { ascending: false }),
      supabase.from('notifications').select('*').order('createdAt', { ascending: false }),
      supabase.from('templates').select('*'),
      supabase.from('onboarding_requests').select('*').order('createdAt', { ascending: false })
    ]);

    // Hata kontrolü
    const errors = [
      usersRes.error,
      customersRes.error,
      categoriesRes.error,
      tasksRes.error
    ].filter(Boolean);

    if (errors.length > 0) {
      console.warn('Veritabanından bazı tablolar okunamadı:', errors[0]);
      return { 
        success: false, 
        isConfigured: true, 
        error: errors[0].message,
        tableMissing: errors[0].code === '42P01' 
      };
    }

    // Tablolar mevcut ama henüz boş mu?
    const hasData = (customersRes.data && customersRes.data.length > 0) || (tasksRes.data && tasksRes.data.length > 0);

    return {
      success: true,
      isConfigured: true,
      isEmpty: !hasData,
      data: {
        users: usersRes.data || [],
        customers: customersRes.data || [],
        categories: categoriesRes.data || [],
        tasks: tasksRes.data || [],
        credentials: credentialsRes.data || [],
        notes: notesRes.data || [],
        files: filesRes.data || [],
        comments: commentsRes.data || [],
        activities: activitiesRes.data || [],
        notifications: notificationsRes.data || [],
        templates: templatesRes.data || [],
        onboardingRequests: onboardingRes.data || []
      }
    };
  } catch (err) {
    console.error('Supabase fetchAllData hatası:', err);
    return { success: false, isConfigured: true, error: err.message };
  }
}

// -------------------------------------------------------------
// SEED (Başlangıç Verilerini Supabase'e Yükle)
// -------------------------------------------------------------
export async function seedDatabase(customData = null) {
  const supabase = getSupabase();
  if (!supabase) throw new Error('Supabase bağlı değil.');

  const source = customData || {
    users: INITIAL_USERS,
    customers: INITIAL_CUSTOMERS,
    categories: INITIAL_CATEGORIES,
    tasks: INITIAL_TASKS,
    credentials: INITIAL_CREDENTIALS,
    notes: INITIAL_NOTES,
    files: INITIAL_FILES,
    comments: INITIAL_COMMENTS,
    activities: INITIAL_ACTIVITIES,
    notifications: INITIAL_NOTIFICATIONS,
    templates: INITIAL_TEMPLATES,
    onboardingRequests: INITIAL_ONBOARDING_REQUESTS
  };

  try {
    if (source.users?.length) {
      await supabase.from('users').upsert(source.users);
    }
    if (source.categories?.length) {
      await supabase.from('categories').upsert(source.categories);
    }
    if (source.customers?.length) {
      await supabase.from('customers').upsert(source.customers);
    }
    if (source.tasks?.length) {
      await supabase.from('tasks').upsert(source.tasks);
    }
    if (source.credentials?.length) {
      await supabase.from('credentials').upsert(source.credentials);
    }
    if (source.notes?.length) {
      await supabase.from('notes').upsert(source.notes);
    }
    if (source.files?.length) {
      await supabase.from('files').upsert(source.files);
    }
    if (source.comments?.length) {
      await supabase.from('comments').upsert(source.comments);
    }
    if (source.activities?.length) {
      await supabase.from('activities').upsert(source.activities);
    }
    if (source.notifications?.length) {
      await supabase.from('notifications').upsert(source.notifications);
    }
    if (source.templates?.length) {
      await supabase.from('templates').upsert(source.templates);
    }
    if (source.onboardingRequests?.length) {
      await supabase.from('onboarding_requests').upsert(source.onboardingRequests);
    }
    return { success: true };
  } catch (err) {
    console.error('Seed hatası:', err);
    throw err;
  }
}

// -------------------------------------------------------------
// GÖREV İŞLEMLERİ (TASKS)
// -------------------------------------------------------------
export async function dbInsertTask(task) {
  const supabase = getSupabase();
  if (!supabase) return null;
  const { data, error } = await supabase.from('tasks').insert(task).select().single();
  if (error) console.error('dbInsertTask error:', error);
  return data;
}

export async function dbUpdateTask(taskId, updates) {
  const supabase = getSupabase();
  if (!supabase) return null;
  const { data, error } = await supabase.from('tasks').update(updates).eq('id', taskId).select().single();
  if (error) console.error('dbUpdateTask error:', error);
  return data;
}

export async function dbDeleteTask(taskId) {
  const supabase = getSupabase();
  if (!supabase) return null;
  const { error } = await supabase.from('tasks').delete().eq('id', taskId);
  if (error) console.error('dbDeleteTask error:', error);
  return !error;
}

// -------------------------------------------------------------
// MÜŞTERİ İŞLEMLERİ (CUSTOMERS)
// -------------------------------------------------------------
export async function dbInsertCustomer(customer) {
  const supabase = getSupabase();
  if (!supabase) return null;
  const { data, error } = await supabase.from('customers').insert(customer).select().single();
  if (error) console.error('dbInsertCustomer error:', error);
  return data;
}

export async function dbUpdateCustomer(customerId, updates) {
  const supabase = getSupabase();
  if (!supabase) return null;
  const { data, error } = await supabase.from('customers').update(updates).eq('id', customerId).select().single();
  if (error) console.error('dbUpdateCustomer error:', error);
  return data;
}

export async function dbDeleteCustomer(customerId) {
  const supabase = getSupabase();
  if (!supabase) return null;
  // İlişkili görevleri, notları, kasayı da sil
  await supabase.from('tasks').delete().eq('customerId', customerId);
  await supabase.from('notes').delete().eq('customerId', customerId);
  await supabase.from('credentials').delete().eq('customerId', customerId);
  await supabase.from('files').delete().eq('customerId', customerId);
  await supabase.from('comments').delete().eq('customerId', customerId);
  const { error } = await supabase.from('customers').delete().eq('id', customerId);
  if (error) console.error('dbDeleteCustomer error:', error);
  return !error;
}

// -------------------------------------------------------------
// NOT İŞLEMLERİ (NOTES)
// -------------------------------------------------------------
export async function dbInsertNote(note) {
  const supabase = getSupabase();
  if (!supabase) return null;
  const { data, error } = await supabase.from('notes').insert(note).select().single();
  if (error) console.error('dbInsertNote error:', error);
  return data;
}

export async function dbDeleteNote(noteId) {
  const supabase = getSupabase();
  if (!supabase) return null;
  const { error } = await supabase.from('notes').delete().eq('id', noteId);
  if (error) console.error('dbDeleteNote error:', error);
  return !error;
}

// -------------------------------------------------------------
// ŞİFRE KASASI (CREDENTIALS)
// -------------------------------------------------------------
export async function dbInsertCredential(credential) {
  const supabase = getSupabase();
  if (!supabase) return null;
  const { data, error } = await supabase.from('credentials').insert(credential).select().single();
  if (error) console.error('dbInsertCredential error:', error);
  return data;
}

export async function dbUpdateCredential(credentialId, updates) {
  const supabase = getSupabase();
  if (!supabase) return null;
  const { data, error } = await supabase.from('credentials').update(updates).eq('id', credentialId).select().single();
  if (error) console.error('dbUpdateCredential error:', error);
  return data;
}

export async function dbDeleteCredential(credentialId) {
  const supabase = getSupabase();
  if (!supabase) return null;
  const { error } = await supabase.from('credentials').delete().eq('id', credentialId);
  if (error) console.error('dbDeleteCredential error:', error);
  return !error;
}

// -------------------------------------------------------------
// DOSYALAR (FILES)
// -------------------------------------------------------------
export async function dbInsertFile(file) {
  const supabase = getSupabase();
  if (!supabase) return null;
  const { data, error } = await supabase.from('files').insert(file).select().single();
  if (error) console.error('dbInsertFile error:', error);
  return data;
}

export async function dbDeleteFile(fileId) {
  const supabase = getSupabase();
  if (!supabase) return null;
  const { error } = await supabase.from('files').delete().eq('id', fileId);
  if (error) console.error('dbDeleteFile error:', error);
  return !error;
}

// -------------------------------------------------------------
// YORUMLAR (COMMENTS)
// -------------------------------------------------------------
export async function dbInsertComment(comment) {
  const supabase = getSupabase();
  if (!supabase) return null;
  const { data, error } = await supabase.from('comments').insert(comment).select().single();
  if (error) console.error('dbInsertComment error:', error);
  return data;
}

export async function dbUpdateComment(commentId, updates) {
  const supabase = getSupabase();
  if (!supabase) return null;
  const { data, error } = await supabase.from('comments').update(updates).eq('id', commentId).select().single();
  if (error) console.error('dbUpdateComment error:', error);
  return data;
}

// -------------------------------------------------------------
// AKTİVİTELER & BİLDİRİMLER
// -------------------------------------------------------------
export async function dbInsertActivity(activity) {
  const supabase = getSupabase();
  if (!supabase) return null;
  const { data, error } = await supabase.from('activities').insert(activity).select().single();
  if (error) console.error('dbInsertActivity error:', error);
  return data;
}

export async function dbInsertNotification(notification) {
  const supabase = getSupabase();
  if (!supabase) return null;
  const { data, error } = await supabase.from('notifications').insert(notification).select().single();
  if (error) console.error('dbInsertNotification error:', error);
  return data;
}

export async function dbMarkNotificationRead(notificationId) {
  const supabase = getSupabase();
  if (!supabase) return null;
  const { error } = await supabase.from('notifications').update({ read: true }).eq('id', notificationId);
  if (error) console.error('dbMarkNotificationRead error:', error);
  return !error;
}

export async function dbMarkAllNotificationsRead() {
  const supabase = getSupabase();
  if (!supabase) return null;
  const { error } = await supabase.from('notifications').update({ read: true }).eq('read', false);
  if (error) console.error('dbMarkAllNotificationsRead error:', error);
  return !error;
}

// -------------------------------------------------------------
// ŞABLONLAR & KULLANICILAR & ONBOARDING
// -------------------------------------------------------------
export async function dbInsertTemplate(template) {
  const supabase = getSupabase();
  if (!supabase) return null;
  const { data, error } = await supabase.from('templates').insert(template).select().single();
  if (error) console.error('dbInsertTemplate error:', error);
  return data;
}

export async function dbUpdateTemplate(templateId, updates) {
  const supabase = getSupabase();
  if (!supabase) return null;
  const { data, error } = await supabase.from('templates').update(updates).eq('id', templateId).select().single();
  if (error) console.error('dbUpdateTemplate error:', error);
  return data;
}

export async function dbDeleteTemplate(templateId) {
  const supabase = getSupabase();
  if (!supabase) return null;
  const { error } = await supabase.from('templates').delete().eq('id', templateId);
  if (error) console.error('dbDeleteTemplate error:', error);
  return !error;
}

export async function dbUpdateUser(userId, updates) {
  const supabase = getSupabase();
  if (!supabase) return null;
  const { data, error } = await supabase.from('users').update(updates).eq('id', userId).select().single();
  if (error) console.error('dbUpdateUser error:', error);
  return data;
}

export async function dbUpdateOnboardingRequest(requestId, updates) {
  const supabase = getSupabase();
  if (!supabase) return null;
  const { data, error } = await supabase.from('onboarding_requests').update(updates).eq('id', requestId).select().single();
  if (error) console.error('dbUpdateOnboardingRequest error:', error);
  return data;
}

// -------------------------------------------------------------
// REALTIME SUBSCRIPTION (GERÇEK ZAMANLI SENKRONİZASYON)
// -------------------------------------------------------------
export function subscribeToRealtimeChanges(onUpdate) {
  const supabase = getSupabase();
  if (!supabase) return () => {};

  const channel = supabase
    .channel('avdens-realtime-all')
    .on('postgres_changes', { event: '*', schema: 'public' }, (payload) => {
      if (typeof onUpdate === 'function') {
        onUpdate(payload);
      }
    })
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
