import React, { createContext, useContext, useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
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

const AppContext = createContext();

const STORAGE_KEY = 'AVDENS_WORK_STORAGE_V3';

export function AppProvider({ children }) {
  // LocalStorage senkronizasyonu
  const [data, setData] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('LocalStorage okunamadı:', e);
    }
    return {
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
  });

  // Oturum durumu (Madde 1)
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    try {
      const savedAuth = localStorage.getItem('AVDENS_WORK_LOGGED_IN');
      return savedAuth === 'true';
    } catch (e) {
      return false;
    }
  });

  // Aktif kullanıcı
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const savedUserId = localStorage.getItem('AVDENS_WORK_CURRENT_USER_ID');
      if (savedUserId) {
        const found = data.users.find(u => u.id === savedUserId);
        if (found) return found;
      }
    } catch (e) {}
    return data.users.find(u => u.role === 'admin') || INITIAL_USERS[0];
  });

  // Giriş yapan asıl kimlik (Admin yetkisi kontrolü için)
  const [authenticatedUser, setAuthenticatedUser] = useState(() => {
    try {
      const savedAuthUserId = localStorage.getItem('AVDENS_WORK_AUTH_USER_ID');
      if (savedAuthUserId) {
        const found = data.users.find(u => u.id === savedAuthUserId);
        if (found) return found;
      }
      const savedUserId = localStorage.getItem('AVDENS_WORK_CURRENT_USER_ID');
      if (savedUserId) {
        const found = data.users.find(u => u.id === savedUserId);
        if (found) return found;
      }
    } catch (e) {}
    return data.users.find(u => u.role === 'admin') || INITIAL_USERS[0];
  });

  // Seçili müşteri (Detay ekranı için)
  const [selectedCustomerId, setSelectedCustomerId] = useState('cust-omtek');

  // Aktif sayfa/sekme navigasyonu
  const [activePage, setActivePage] = useState('dashboard'); // 'dashboard' | 'customers' | 'customer-detail' | 'tasks' | 'templates' | 'activities' | 'settings'

  // Global arama sorgusu
  const [searchQuery, setSearchQuery] = useState('');

  // LocalStorage'a kaydetme
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error('LocalStorage kaydedilemedi:', e);
    }
  }, [data]);

  // Giriş Yap (Madde 1)
  // Giriş Yap (Prodüksiyon Doğrulaması)
  const login = (email, password) => {
    if (!email || !password) {
      return { success: false, message: 'Lütfen e-posta adresinizi ve şifrenizi giriniz.' };
    }

    const trimmedEmail = String(email).toLowerCase().trim();
    const user = data.users.find(u => u.email.toLowerCase().trim() === trimmedEmail);

    if (!user) {
      return { success: false, message: 'Bu e-posta adresi ile kayıtlı kullanıcı bulunamadı.' };
    }

    if (user.password && user.password !== String(password)) {
      return { success: false, message: 'Hatalı şifre girdiniz. Lütfen tekrar deneyiniz.' };
    }

    setCurrentUser(user);
    setAuthenticatedUser(user);
    setIsLoggedIn(true);
    try {
      localStorage.setItem('AVDENS_WORK_LOGGED_IN', 'true');
      localStorage.setItem('AVDENS_WORK_CURRENT_USER_ID', user.id);
      localStorage.setItem('AVDENS_WORK_AUTH_USER_ID', user.id);
    } catch (e) {}

    if (user.role === 'musteri') {
      setSelectedCustomerId(user.customerId || 'cust-omtek');
      setActivePage('dashboard');
    } else {
      setActivePage('dashboard');
    }

    return { success: true, user };
  };

  // Çıkış Yap (Madde 1)
  const logout = () => {
    setIsLoggedIn(false);
    try {
      localStorage.removeItem('AVDENS_WORK_LOGGED_IN');
      localStorage.removeItem('AVDENS_WORK_CURRENT_USER_ID');
      localStorage.removeItem('AVDENS_WORK_AUTH_USER_ID');
    } catch (e) {}
    setActivePage('dashboard');
  };

  // Profil Düzenle (Yetki & Güvenlik Denetimli)
  const updateUserProfile = (updatedFields) => {
    // Güvenlik: Kullanıcı kendi rolünü veya müşteri bağlantısını değiştiremez
    const safeFields = { ...updatedFields };
    delete safeFields.role;
    delete safeFields.customerId;

    const updatedUser = { ...currentUser, ...safeFields };
    setCurrentUser(updatedUser);
    try {
      localStorage.setItem('AVDENS_WORK_CURRENT_USER_ID', updatedUser.id);
    } catch (e) {}

    setData(prev => ({
      ...prev,
      users: prev.users.map(u => u.id === updatedUser.id ? updatedUser : u),
      // Eğer aracı ismi değiştiyse bağlı müşterilerdeki partnerName de güncellensin
      customers: updatedUser.role === 'araci'
        ? prev.customers.map(c => c.partnerId === updatedUser.id ? { ...c, partnerName: updatedUser.name } : c)
        : prev.customers
    }));
    logActivity('global', `${updatedUser.name} profil bilgilerini güncelledi.`);
    return true;
  };


  // Aktivite ekleme yardımcısı
  const logActivity = (customerId, actionText, type = 'general') => {
    const customer = data.customers.find(c => c.id === customerId);
    const newAct = {
      id: 'act-' + Date.now(),
      customerId,
      customerName: customer ? customer.companyName : 'Sistem',
      userName: currentUser.name,
      actionText,
      type,
      createdAt: new Date().toISOString()
    };
    setData(prev => ({
      ...prev,
      activities: [newAct, ...prev.activities]
    }));
  };

  // Bildirim ekleme
  const addNotification = (title, message, linkCustomerId = null) => {
    const newNotif = {
      id: 'notif-' + Date.now(),
      title,
      message,
      read: false,
      createdAt: new Date().toISOString(),
      linkCustomerId
    };
    setData(prev => ({
      ...prev,
      notifications: [newNotif, ...prev.notifications]
    }));
  };

  // Görev Tikleme / Tamamlama (Yetki Denetimli)
  const toggleTask = (taskId) => {
    // Müşteriler doğrudan ajans içi görevleri tikleyemez/kapatamaz
    if (currentUser.role === 'musteri') return;

    const task = data.tasks.find(t => t.id === taskId);
    if (!task) return;

    // Aracı yalnızca kendi müşterisinin görevini tikleyebilir
    if (currentUser.role === 'araci') {
      const isMine = data.customers.some(c => c.id === task.customerId && (c.partnerId === currentUser.id || c.partnerName?.includes(currentUser.name)));
      if (!isMine) return;
    }

    const willBeCompleted = !task.isCompleted;
    const now = new Date().toISOString();

    setData(prev => {
      const updatedTasks = prev.tasks.map(t => {
        if (t.id === taskId) {
          return {
            ...t,
            isCompleted: willBeCompleted,
            status: willBeCompleted ? 'tamamlandi' : 'devam_ediyor',
            completedAt: willBeCompleted ? now : null,
            completedBy: willBeCompleted ? currentUser.name : null
          };
        }
        return t;
      });

      return {
        ...prev,
        tasks: updatedTasks
      };
    });

    if (willBeCompleted) {
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.8 },
          colors: ['#3B82F6', '#10B981', '#F59E0B']
        });
      } catch (e) {}

      logActivity(
        task.customerId,
        `${currentUser.name} görevi tamamladı: "${task.title}"`,
        'task_completed'
      );
      addNotification(
        'Görev Tamamlandı',
        `"${task.title}" başarıyla tamamlandı. (${currentUser.name})`,
        task.customerId
      );
    } else {
      logActivity(
        task.customerId,
        `${currentUser.name} "${task.title}" görevini tekrar açtı.`,
        'task_reopened'
      );
    }
  };

  // Yeni Görev Ekle (Yetki Denetimli)
  const addTask = (taskData) => {
    if (currentUser.role === 'musteri') return null;

    const targetCustId = taskData.customerId || selectedCustomerId;
    if (currentUser.role === 'araci') {
      const isMine = data.customers.some(c => c.id === targetCustId && (c.partnerId === currentUser.id || c.partnerName?.includes(currentUser.name)));
      if (!isMine) return null;
    }

    const newTask = {
      id: 'task-' + Date.now(),
      customerId: targetCustId,
      categoryId: taskData.categoryId || 'cat-meta',
      title: taskData.title,
      description: taskData.description || '',
      assignedTo: taskData.assignedTo || currentUser.name,
      assignedRole: taskData.assignedRole || (currentUser.role === 'admin' ? 'Yönetici' : 'İş Ortağı'),
      startDate: taskData.startDate || new Date().toISOString().split('T')[0],
      dueDate: taskData.dueDate || new Date().toISOString().split('T')[0],
      priority: taskData.priority || 'normal',
      status: taskData.status || 'yapilacak',
      isCompleted: taskData.status === 'tamamlandi',
      completedAt: taskData.status === 'tamamlandi' ? new Date().toISOString() : null,
      completedBy: taskData.status === 'tamamlandi' ? currentUser.name : null,
      waitingForClient: Boolean(taskData.waitingForClient),
      waitingReason: taskData.waitingReason || ''
    };

    setData(prev => ({
      ...prev,
      tasks: [newTask, ...prev.tasks]
    }));

    logActivity(
      newTask.customerId,
      `${currentUser.name} yeni görev ekledi: "${newTask.title}"`,
      'task_created'
    );
    addNotification(
      'Yeni Görev Oluşturuldu',
      `"${newTask.title}" görevi eklendi.`,
      newTask.customerId
    );

    return newTask.id;
  };

  // Görev Düzenle (Yetki Denetimli)
  const updateTask = (taskId, updatedFields) => {
    if (currentUser.role === 'musteri') return;
    const task = data.tasks.find(t => t.id === taskId);
    if (!task) return;

    if (currentUser.role === 'araci') {
      const isMine = data.customers.some(c => c.id === task.customerId && (c.partnerId === currentUser.id || c.partnerName?.includes(currentUser.name)));
      if (!isMine) return;
    }

    setData(prev => ({
      ...prev,
      tasks: prev.tasks.map(t => (t.id === taskId ? { ...t, ...updatedFields } : t))
    }));
  };

  // Görev Sil (Yetki Denetimli)
  const deleteTask = (taskId) => {
    if (currentUser.role === 'musteri') return;
    const task = data.tasks.find(t => t.id === taskId);
    if (!task) return;

    if (currentUser.role === 'araci') {
      const isMine = data.customers.some(c => c.id === task.customerId && (c.partnerId === currentUser.id || c.partnerName?.includes(currentUser.name)));
      if (!isMine) return;
    }

    setData(prev => ({
      ...prev,
      tasks: prev.tasks.filter(t => t.id !== taskId)
    }));
    logActivity(task.customerId, `${currentUser.name} görevi sildi: "${task.title}"`);
  };

  // Yeni Müşteri Ekle (Yetki Denetimli)
  const addCustomer = (customerData, applyTemplateId = null) => {
    if (currentUser.role === 'musteri') return null;

    const newId = 'cust-' + Date.now();
    // Aracı yeni müşteri eklerse doğrudan kendisine bağlanır
    const assignedPartnerId = currentUser.role === 'araci' ? currentUser.id : customerData.partnerId;
    const partner = data.users.find(u => u.id === assignedPartnerId);

    const newCustomer = {
      id: newId,
      companyName: customerData.companyName,
      contactPerson: customerData.contactPerson,
      phone: customerData.phone,
      whatsapp: customerData.whatsapp || customerData.phone,
      email: customerData.email,
      website: customerData.website || '',
      instagram: customerData.instagram || '',
      facebook: customerData.facebook || '',
      partnerId: assignedPartnerId || null,
      partnerName: partner ? partner.name : (currentUser.role === 'araci' ? currentUser.name : 'Atanmamış'),
      status: customerData.status || 'aktif',
      projectTitle: customerData.projectTitle || 'Dijital Pazarlama ve Yönetim',
      startDate: customerData.startDate || new Date().toISOString().split('T')[0],
      description: customerData.description || '',
      createdAt: new Date().toISOString()
    };

    let templateTasks = [];
    if (applyTemplateId) {
      const template = data.templates.find(t => t.id === applyTemplateId);
      if (template) {
        templateTasks = template.taskItems.map((item, idx) => ({
          id: `task-${Date.now()}-${idx}`,
          customerId: newId,
          categoryId: item.category,
          title: item.title,
          description: `Şablondan otomatik oluşturuldu: ${template.name}`,
          assignedTo: currentUser.name,
          assignedRole: currentUser.role,
          startDate: newCustomer.startDate,
          dueDate: new Date(Date.now() + 14 * 24 * 3600 * 1000).toISOString().split('T')[0],
          priority: item.priority || 'normal',
          status: 'yapilacak',
          isCompleted: false,
          completedAt: null,
          completedBy: null,
          waitingForClient: false,
          waitingReason: ''
        }));
      }
    }

    setData(prev => ({
      ...prev,
      customers: [newCustomer, ...prev.customers],
      tasks: [...templateTasks, ...prev.tasks]
    }));

    logActivity(newId, `${currentUser.name} yeni müşteri oluşturdu: ${newCustomer.companyName}`, 'customer_created');
    addNotification('Yeni Müşteri Eklendi', `${newCustomer.companyName} başarıyla sisteme kaydedildi.`, newId);

    return newId;
  };

  // Müşteri Güncelle (Yetki Denetimli)
  const updateCustomer = (customerId, updatedFields) => {
    if (currentUser.role === 'musteri') return;
    if (currentUser.role === 'araci') {
      const isMine = data.customers.some(c => c.id === customerId && (c.partnerId === currentUser.id || c.partnerName?.includes(currentUser.name)));
      if (!isMine) return;
      // Aracı başka aracıya devredemez
      const safeFields = { ...updatedFields };
      delete safeFields.partnerId;
      delete safeFields.partnerName;
      setData(prev => ({
        ...prev,
        customers: prev.customers.map(c => (c.id === customerId ? { ...c, ...safeFields } : c))
      }));
      logActivity(customerId, `${currentUser.name} müşteri bilgilerini güncelledi.`);
      return;
    }

    setData(prev => ({
      ...prev,
      customers: prev.customers.map(c => (c.id === customerId ? { ...c, ...updatedFields } : c))
    }));
    logActivity(customerId, `${currentUser.name} müşteri bilgilerini güncelledi.`);
  };

  // Not Ekle (Yetki Denetimli)
  const addNote = (customerId, content, color = 'blue') => {
    const isAccessible = getAccessibleCustomers().some(c => c.id === customerId);
    if (!isAccessible) return;

    const newNote = {
      id: 'note-' + Date.now(),
      customerId,
      authorName: currentUser.name,
      authorRole: currentUser.role === 'admin' ? 'Admin' : currentUser.role === 'araci' ? 'Aracı' : 'Müşteri',
      authorAvatar: currentUser.avatar,
      content,
      color,
      createdAt: new Date().toISOString()
    };
    setData(prev => ({
      ...prev,
      notes: [newNote, ...prev.notes]
    }));
    logActivity(customerId, `${currentUser.name} yeni bir not ekledi.`);
  };

  // Not Sil (Yetki Denetimli)
  const deleteNote = (noteId) => {
    const note = data.notes.find(n => n.id === noteId);
    if (!note) return;

    // Müşteri yalnızca kendi notunu silebilir; Aracı yalnızca kendi erişebildiği müşterinin notunu silebilir
    if (currentUser.role === 'musteri' && note.authorName !== currentUser.name) return;
    if (currentUser.role === 'araci') {
      const isAccessible = getAccessibleCustomers().some(c => c.id === note.customerId);
      if (!isAccessible) return;
    }

    setData(prev => ({
      ...prev,
      notes: prev.notes.filter(n => n.id !== noteId)
    }));
  };

  // Hesap Bilgisi Ekle (Yetki Denetimli)
  const addCredential = (customerId, credData) => {
    if (currentUser.role === 'musteri') return;
    const isAccessible = getAccessibleCustomers().some(c => c.id === customerId);
    if (!isAccessible) return;

    const newCred = {
      id: 'cred-' + Date.now(),
      customerId,
      serviceType: credData.serviceType,
      serviceName: credData.serviceName || credData.serviceType,
      icon: credData.icon || 'Key',
      color: credData.color || '#3B82F6',
      clientVisible: Boolean(credData.clientVisible),
      fields: credData.fields || [],
      updatedAt: new Date().toISOString().split('T')[0]
    };
    setData(prev => ({
      ...prev,
      credentials: [...prev.credentials, newCred]
    }));
    logActivity(customerId, `${currentUser.name} "${newCred.serviceType}" hesap bilgisi ekledi.`, 'credential');
  };

  // Hesap Bilgisi Güncelle (Yetki Denetimli)
  const updateCredential = (credId, updatedFields) => {
    if (currentUser.role === 'musteri') return;
    const cred = data.credentials.find(c => c.id === credId);
    if (!cred) return;
    const isAccessible = getAccessibleCustomers().some(c => c.id === cred.customerId);
    if (!isAccessible) return;

    setData(prev => ({
      ...prev,
      credentials: prev.credentials.map(c => c.id === credId ? { ...c, ...updatedFields, updatedAt: new Date().toISOString().split('T')[0] } : c)
    }));
  };

  // Hesap Bilgisi Sil (Yetki Denetimli)
  const deleteCredential = (credId) => {
    if (currentUser.role === 'musteri') return;
    const cred = data.credentials.find(c => c.id === credId);
    if (!cred) return;
    const isAccessible = getAccessibleCustomers().some(c => c.id === cred.customerId);
    if (!isAccessible) return;

    setData(prev => ({
      ...prev,
      credentials: prev.credentials.filter(c => c.id !== credId)
    }));
  };

  // Dosya Yükle (Yetki Denetimli)
  const addFile = (customerId, fileData) => {
    const isAccessible = getAccessibleCustomers().some(c => c.id === customerId);
    if (!isAccessible) return;

    const newFile = {
      id: 'file-' + Date.now(),
      customerId,
      name: fileData.name,
      category: fileData.category || 'Belge',
      size: fileData.size || '1.5 MB',
      type: fileData.type || 'file',
      description: fileData.description || '',
      uploadedBy: currentUser.name,
      uploadedAt: new Date().toISOString()
    };
    setData(prev => ({
      ...prev,
      files: [newFile, ...prev.files]
    }));
    logActivity(customerId, `${currentUser.name} yeni dosya yükledi: ${newFile.name}`);
  };

  // Dosya Sil (Yetki Denetimli)
  const deleteFile = (fileId) => {
    const file = data.files.find(f => f.id === fileId);
    if (!file) return;

    if (currentUser.role === 'musteri' && file.uploadedBy !== currentUser.name) return;
    if (currentUser.role === 'araci') {
      const isAccessible = getAccessibleCustomers().some(c => c.id === file.customerId);
      if (!isAccessible) return;
    }

    setData(prev => ({
      ...prev,
      files: prev.files.filter(f => f.id !== fileId)
    }));
  };

  // Müşteri Yorumu Ekle (Yetki Denetimli)
  const addComment = (customerId, message) => {
    const isAccessible = getAccessibleCustomers().some(c => c.id === customerId);
    if (!isAccessible) return;

    const newComment = {
      id: 'comm-' + Date.now(),
      customerId,
      userName: currentUser.name,
      userRole: currentUser.role,
      userAvatar: currentUser.avatar,
      message,
      createdAt: new Date().toISOString(),
      reply: null
    };
    setData(prev => ({
      ...prev,
      comments: [newComment, ...prev.comments]
    }));
    logActivity(customerId, `${currentUser.name} yeni bir geri bildirim yorumu ekledi.`, 'comment');
    addNotification('Yeni Yorum', `${currentUser.name}: "${message.slice(0, 40)}..."`, customerId);
  };

  // Yorum Cevapla (Yalnızca Admin ve Atanmış Aracı)
  const replyComment = (commentId, replyMessage) => {
    if (currentUser.role === 'musteri') return;
    const comment = data.comments.find(c => c.id === commentId);
    if (!comment) return;
    const isAccessible = getAccessibleCustomers().some(c => c.id === comment.customerId);
    if (!isAccessible) return;

    setData(prev => ({
      ...prev,
      comments: prev.comments.map(c => {
        if (c.id === commentId) {
          return {
            ...c,
            reply: {
              userName: currentUser.name,
              userRole: currentUser.role,
              userAvatar: currentUser.avatar,
              message: replyMessage,
              createdAt: new Date().toISOString()
            }
          };
        }
        return c;
      })
    }));
  };

  // Bildirim Okundu İşaretle
  const markNotificationRead = (notifId) => {
    setData(prev => ({
      ...prev,
      notifications: prev.notifications.map(n => n.id === notifId ? { ...n, read: true } : n)
    }));
  };

  // Tüm Bildirimleri Oku
  const markAllNotificationsRead = () => {
    setData(prev => ({
      ...prev,
      notifications: prev.notifications.map(n => ({ ...n, read: true }))
    }));
  };

  // Şablonu Müşteriye Uygula (Yetki Denetimli)
  const applyTemplateToCustomer = (customerId, templateId) => {
    if (currentUser.role === 'musteri') return;
    const isAccessible = getAccessibleCustomers().some(c => c.id === customerId);
    if (!isAccessible) return;

    const template = data.templates.find(t => t.id === templateId);
    if (!template) return;

    const newTasks = template.taskItems.map((item, idx) => ({
      id: `task-${Date.now()}-${idx}`,
      customerId,
      categoryId: item.category,
      title: item.title,
      description: `Şablondan oluşturuldu: ${template.name}`,
      assignedTo: currentUser.name,
      assignedRole: currentUser.role,
      startDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 14 * 24 * 3600 * 1000).toISOString().split('T')[0],
      priority: item.priority || 'normal',
      status: 'yapilacak',
      isCompleted: false,
      completedAt: null,
      completedBy: null,
      waitingForClient: false,
      waitingReason: ''
    }));

    setData(prev => ({
      ...prev,
      tasks: [...newTasks, ...prev.tasks]
    }));

    logActivity(customerId, `${currentUser.name} "${template.name}" şablonunu projeye uyguladı (${newTasks.length} görev).`);
    addNotification('Şablon Uygulandı', `${newTasks.length} adet görev projeye dahil edildi.`, customerId);
  };

  // Yeni Şablon Oluştur (Yalnızca Admin)
  const addTemplate = (templateData) => {
    if (currentUser.role !== 'admin') return;
    const newTemplate = {
      id: 'tmpl-' + Date.now(),
      name: templateData.name,
      description: templateData.description || '',
      taskItems: templateData.taskItems || []
    };
    setData(prev => ({
      ...prev,
      templates: [newTemplate, ...prev.templates]
    }));
    logActivity('global', `${currentUser.name} yeni görev şablonu oluşturdu: "${newTemplate.name}"`);
    addNotification('Yeni Şablon Eklendi', `"${newTemplate.name}" şablonu kullanıma hazır.`);
  };

  // Şablon Düzenle (Yalnızca Admin)
  const updateTemplate = (templateId, updatedData) => {
    if (currentUser.role !== 'admin') return;
    setData(prev => ({
      ...prev,
      templates: prev.templates.map(t => t.id === templateId ? { ...t, ...updatedData } : t)
    }));
    logActivity('global', `${currentUser.name} "${updatedData.name}" şablonunu güncelledi.`);
  };

  // Şablon Sil (Yalnızca Admin)
  const deleteTemplate = (templateId) => {
    if (currentUser.role !== 'admin') return;
    const tmpl = data.templates.find(t => t.id === templateId);
    setData(prev => ({
      ...prev,
      templates: prev.templates.filter(t => t.id !== templateId)
    }));
    if (tmpl) {
      logActivity('global', `${currentUser.name} "${tmpl.name}" görev şablonunu sildi.`);
    }
  };

  // Kategori Ekle (Yalnızca Admin)
  const addCategory = (catData) => {
    if (currentUser.role !== 'admin') return;
    const newCat = {
      id: 'cat-' + Date.now(),
      name: catData.name,
      color: catData.color || '#3B82F6',
      icon: catData.icon || 'Folder'
    };
    setData(prev => ({
      ...prev,
      categories: [...prev.categories, newCat]
    }));
    logActivity('global', `${currentUser.name} yeni kategori ekledi: "${newCat.name}"`);
    return newCat.id;
  };

  // Kategori Güncelle (Yalnızca Admin)
  const updateCategory = (catId, updatedData) => {
    if (currentUser.role !== 'admin') return;
    setData(prev => ({
      ...prev,
      categories: prev.categories.map(c => c.id === catId ? { ...c, ...updatedData } : c)
    }));
    logActivity('global', `${currentUser.name} kategori güncelledi: "${updatedData.name}"`);
  };

  // Kategori Sil (Yalnızca Admin)
  const deleteCategory = (catId) => {
    if (currentUser.role !== 'admin') return;
    const cat = data.categories.find(c => c.id === catId);
    setData(prev => ({
      ...prev,
      categories: prev.categories.filter(c => c.id !== catId)
    }));
    if (cat) {
      logActivity('global', `${currentUser.name} "${cat.name}" kategorisini sildi.`);
    }
  };

  // Müşterinin Beklenen Göreve Yanıt ve Dosya Göndermesi (Yetki Denetimli)
  const submitWaitingTaskResponse = (taskId, customerId, noteText, fileData = null) => {
    // Katı Güvenlik: Müşteri yalnızca kendi firmasına yanıt verebilir
    if (currentUser.role === 'musteri' && currentUser.customerId && customerId !== currentUser.customerId) {
      return;
    }
    const isAccessible = getAccessibleCustomers().some(c => c.id === customerId);
    if (!isAccessible) return;

    const task = data.tasks.find(t => t.id === taskId);
    if (!task || task.customerId !== customerId) return;
    const customer = data.customers.find(c => c.id === customerId);

    let attachedFileName = '';
    let newFiles = [];
    if (fileData && fileData.name) {
      attachedFileName = fileData.name;
      newFiles.push({
        id: 'file-' + Date.now(),
        customerId,
        name: fileData.name,
        category: 'Müşteri Gönderisi',
        size: fileData.size || '2.5 MB',
        type: fileData.type || 'file',
        description: `Müşteri yanıtı ("${task?.title}")`,
        uploadedBy: currentUser.name,
        uploadedAt: new Date().toISOString()
      });
    }

    let newNotes = [];
    if (noteText && noteText.trim()) {
      newNotes.push({
        id: 'note-' + Date.now(),
        customerId,
        authorName: currentUser.name,
        authorRole: 'Müşteri',
        authorAvatar: currentUser.avatar,
        content: `[Görev Yanıtı - ${task?.title}]: ${noteText}${attachedFileName ? ` (Ekli Dosya: ${attachedFileName})` : ''}`,
        color: 'emerald',
        createdAt: new Date().toISOString()
      });
    }

    setData(prev => ({
      ...prev,
      tasks: prev.tasks.map(t => {
        if (t.id === taskId) {
          return {
            ...t,
            waitingForClient: false,
            waitingReason: '',
            status: 'devam_ediyor'
          };
        }
        return t;
      }),
      files: [...newFiles, ...prev.files],
      notes: [...newNotes, ...prev.notes]
    }));

    try {
      confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
    } catch (e) {}

    logActivity(customerId, `${currentUser.name} "${task?.title}" görevi için beklenen bilgi/dosyayı iletti.`);
    addNotification(
      'Müşteriden Beklenen Yanıt Geldi',
      `${customer?.companyName || 'Müşteri'}, "${task?.title}" görevi için bilgi/dosya iletti. Görev işleme alındı.`,
      customerId
    );
  };

  // Tüm Verileri Sıfırla (Yalnızca Admin)
  const clearAllData = () => {
    if (currentUser.role !== 'admin') return;
    setData(prev => ({
      users: INITIAL_USERS,
      customers: [],
      categories: prev.categories,
      tasks: [],
      credentials: [],
      notes: [],
      files: [],
      comments: [],
      activities: [{
        id: 'act-init',
        customerId: null,
        customerName: 'Sistem',
        userName: currentUser.name,
        actionText: 'Tüm sistem veritabanı sıfırlandı. Temiz çalışma alanı hazırlandı.',
        type: 'system',
        createdAt: new Date().toISOString()
      }],
      notifications: [{
        id: 'notif-cleared',
        title: 'Veritabanı Sıfırlandı',
        message: 'Tüm müşteri ve görev kayıtları başarıyla temizlendi.',
        read: false,
        createdAt: new Date().toISOString(),
        linkCustomerId: null
      }],
      templates: prev.templates,
      onboardingRequests: []
    }));
    logActivity('global', `${currentUser.name} tüm sistem verilerini sıfırladı.`);
  };

  // Admin Panelinden Aracıya Müşteri Atama (Yalnızca Admin)
  const assignPartnerToCustomer = (customerId, partnerId) => {
    if (currentUser.role !== 'admin') return;
    const partner = data.users.find(u => u.id === partnerId);
    setData(prev => ({
      ...prev,
      customers: prev.customers.map(c => {
        if (c.id === customerId) {
          return {
            ...c,
            partnerId: partner ? partner.id : null,
            partnerName: partner ? partner.name : 'Atanmamış'
          };
        }
        return c;
      })
    }));
    const customer = data.customers.find(c => c.id === customerId);
    logActivity(customerId, `${customer?.companyName} müşterisi aracı "${partner?.name}" yetkilisine atandı.`);
    addNotification('Aracı Atandı', `${customer?.companyName} için yetkili aracı ${partner?.name} olarak belirlendi.`, customerId);
  };

  // Müşteriden İstenilecek Bilgiler Talebi Oluştur (Yalnızca Admin)
  const createOnboardingRequest = (customerId, title, description, items) => {
    if (currentUser.role !== 'admin') return;
    const customer = data.customers.find(c => c.id === customerId);
    const newRequest = {
      id: 'req-' + Date.now(),
      customerId,
      customerName: customer ? customer.companyName : 'Müşteri',
      title,
      description: description || 'İşlemlerin başlayabilmesi için lütfen aşağıdaki bilgileri iletiniz.',
      status: 'pending', // 'pending' | 'completed'
      createdAt: new Date().toISOString(),
      completedAt: null,
      items: items.map((item, idx) => ({
        id: `item-${Date.now()}-${idx}`,
        label: item.label,
        type: item.type || 'text', // 'text' | 'password' | 'file' | 'note'
        required: item.required ?? true,
        value: '',
        isSubmitted: false
      }))
    };

    setData(prev => ({
      ...prev,
      onboardingRequests: [newRequest, ...prev.onboardingRequests]
    }));

    logActivity(customerId, `${customer?.companyName} projesine işe başlama bilgi talebi gönderildi.`);
    addNotification(
      'İşe Başlama Bilgileri Doldurulmalı',
      `AVDENS WORK: ${customer?.companyName} projesinin başlaması için talep edilen bilgileri doldurmanız gerekmektedir.`,
      customerId
    );
  };

  // Müşteri Tarafından Bilgilerin Gönderilmesi (Yetki Denetimli)
  const submitOnboardingData = (requestId, customerId, submittedValues) => {
    // Katı Güvenlik: Müşteri yalnızca kendi firmasının onboarding talebini doldurabilir
    if (currentUser.role === 'musteri' && currentUser.customerId && customerId !== currentUser.customerId) {
      return;
    }
    const isAccessible = getAccessibleCustomers().some(c => c.id === customerId);
    if (!isAccessible) return;

    const customer = data.customers.find(c => c.id === customerId);

    // Otomatik hesap bilgisi, dosya veya not ekle
    let newCredentials = [];
    let newFiles = [];
    let newNotes = [];

    Object.entries(submittedValues).forEach(([itemLabel, itemVal]) => {
      if (!itemVal) return;
      if (itemLabel.toLowerCase().includes('şifre') || itemLabel.toLowerCase().includes('password')) {
        newCredentials.push({
          id: 'cred-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5),
          customerId,
          serviceType: 'Sosyal Medya / Giriş',
          serviceName: itemLabel,
          icon: 'Key',
          color: '#3B82F6',
          clientVisible: true,
          fields: [
            { key: 'Giriş / Şifre', value: itemVal, isSecret: true },
            { key: 'Tarih', value: new Date().toISOString().split('T')[0], isSecret: false }
          ],
          updatedAt: new Date().toISOString().split('T')[0]
        });
      } else if (itemLabel.toLowerCase().includes('logo') || itemLabel.toLowerCase().includes('dosya')) {
        newFiles.push({
          id: 'file-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5),
          customerId,
          name: typeof itemVal === 'string' ? itemVal : 'Musteri_Yuklenen_Logo.svg',
          category: 'Logo',
          size: '3.1 MB',
          type: 'svg',
          description: 'Müşteri başlangıç formundan yüklendi.',
          uploadedBy: customer ? customer.contactPerson : 'Müşteri',
          uploadedAt: new Date().toISOString()
        });
      } else {
        newNotes.push({
          id: 'note-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5),
          customerId,
          authorName: customer ? customer.contactPerson : 'Müşteri',
          authorRole: 'Müşteri',
          authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
          content: `${itemLabel}: ${itemVal}`,
          color: 'emerald',
          createdAt: new Date().toISOString()
        });
      }
    });

    setData(prev => {
      const updatedRequests = prev.onboardingRequests.map(req => {
        if (req.id === requestId) {
          return {
            ...req,
            status: 'completed',
            completedAt: new Date().toISOString(),
            items: req.items.map(it => ({
              ...it,
              value: submittedValues[it.label] || it.value,
              isSubmitted: true
            }))
          };
        }
        return req;
      });

      return {
        ...prev,
        onboardingRequests: updatedRequests,
        credentials: [...newCredentials, ...prev.credentials],
        files: [...newFiles, ...prev.files],
        notes: [...newNotes, ...prev.notes]
      };
    });

    try {
      confetti({ particleCount: 70, spread: 80, origin: { y: 0.6 } });
    } catch (e) {}

    logActivity(customerId, `${customer?.companyName} işe başlama bilgi ve belgelerini tamamladı.`);
    addNotification(
      'Başlangıç Bilgileri Alındı 🎉',
      `${customer?.companyName} işe başlama bilgilerini doldurdu, proje operasyonu başlayabilir!`,
      customerId
    );
  };

  // JSON Dışa Aktarma (Yedekleme)
  const exportDataAsJSON = () => {
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `avdens_work_yedek_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // JSON İçe Aktarma (Yalnızca Admin)
  const importDataFromJSON = (jsonString) => {
    if (currentUser.role !== 'admin') {
      return { success: false, error: 'Bu işlem için Yönetici (Admin) yetkisi gerekmektedir.' };
    }
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed.customers && parsed.tasks) {
        setData(parsed);
        return { success: true };
      } else {
        return { success: false, error: 'Geçersiz veri yapısı' };
      }
    } catch (e) {
      return { success: false, error: 'JSON dosyası okunamadı' };
    }
  };

  // Demo Verisini Sıfırla (Yalnızca Admin)
  const resetToDefaultData = () => {
    if (currentUser.role !== 'admin') return;
    setData({
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
    });
    localStorage.removeItem(STORAGE_KEY);
  };

  // Müşteri bazlı hesaplamalar (İlerleme oranı vb.)
  const getCustomerProgress = (customerId) => {
    const customerTasks = data.tasks.filter(t => t.customerId === customerId);
    if (customerTasks.length === 0) return { total: 0, completed: 0, percentage: 0 };
    const completed = customerTasks.filter(t => t.isCompleted).length;
    const percentage = Math.round((completed / customerTasks.length) * 100);
    return {
      total: customerTasks.length,
      completed,
      percentage
    };
  };

  // Rol bazlı müşteri listesi filtresi
  const getAccessibleCustomers = () => {
    if (currentUser.role === 'admin') {
      return data.customers;
    }
    if (currentUser.role === 'araci') {
      return data.customers.filter(c => c.partnerId === currentUser.id || c.partnerName.includes(currentUser.name));
    }
    if (currentUser.role === 'musteri') {
      return data.customers.filter(c => c.id === (currentUser.customerId || 'cust-omtek'));
    }
    return data.customers;
  };

  return (
    <AppContext.Provider
      value={{
        data,
        currentUser,
        setCurrentUser,
        authenticatedUser,
        isLoggedIn,
        login,
        logout,
        updateUserProfile,
        selectedCustomerId,
        setSelectedCustomerId,
        activePage,
        setActivePage,
        searchQuery,
        setSearchQuery,
        // Eylemler
        toggleTask,
        addTask,
        updateTask,
        deleteTask,
        addCustomer,
        updateCustomer,
        addNote,
        deleteNote,
        addCredential,
        updateCredential,
        deleteCredential,
        addFile,
        deleteFile,
        addComment,
        replyComment,
        markNotificationRead,
        markAllNotificationsRead,
        applyTemplateToCustomer,
        addTemplate,
        updateTemplate,
        deleteTemplate,
        addCategory,
        updateCategory,
        deleteCategory,
        assignPartnerToCustomer,
        createOnboardingRequest,
        submitOnboardingData,
        submitWaitingTaskResponse,
        exportDataAsJSON,
        importDataFromJSON,
        resetToDefaultData,
        clearAllData,
        getCustomerProgress,
        getAccessibleCustomers
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
