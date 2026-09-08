// AVDENS WORK - Başlangıç Veritabanı ve Demo Verileri

export const INITIAL_USERS = [
  {
    id: 'user-admin',
    name: 'Serdar KEKLİK',
    email: 'serdar@avdens.work',
    password: '123',
    role: 'admin', // 'admin' | 'araci' | 'musteri'
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    title: 'Ajans Yöneticisi',
    phone: '+90 532 900 11 22'
  },
  {
    id: 'user-araci',
    name: 'Mücahit Atıl',
    email: 'mucahit@avdens.work',
    password: '123',
    role: 'araci',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    title: 'İş Ortağı / Aracı',
    phone: '+90 533 800 33 44'
  },
  {
    id: 'user-musteri',
    name: 'Özlem Kaya',
    email: 'ozlem@omteklazer.com',
    password: '123',
    role: 'musteri',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    title: 'Firma Yetkilisi (OMTEK Lazer)',
    company: 'OMTEK Lazer',
    customerId: 'cust-omtek',
    phone: '+90 532 111 22 33'
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

export const INITIAL_CUSTOMERS = [
  {
    id: 'cust-omtek',
    companyName: 'OMTEK Lazer',
    contactPerson: 'Özlem Kaya',
    phone: '+90 532 111 22 33',
    whatsapp: '+90 532 111 22 33',
    email: 'info@omteklazer.com',
    website: 'https://omteklazer.com',
    instagram: '@omteklazer',
    facebook: 'facebook.com/omteklazer',
    partnerId: 'user-araci',
    partnerName: 'Mücahit Atıl',
    status: 'aktif', // 'aktif' | 'beklemede' | 'tamamlandi' | 'pasif'
    projectTitle: 'Instagram & Meta Yönetimi',
    startDate: '2026-09-01',
    description: 'Endüstriyel lazer kesim makineleri ve fason üretim tanıtımı için sosyal medya ve reklam yönetimi.',
    createdAt: '2026-09-01T09:00:00.000Z'
  },
  {
    id: 'cust-abc',
    companyName: 'ABC Mobilya',
    contactPerson: 'Ahmet Yılmaz',
    phone: '+90 544 222 33 44',
    whatsapp: '+90 544 222 33 44',
    email: 'info@abcmobilya.com',
    website: 'https://abcmobilya.com',
    instagram: '@abcmobilya',
    facebook: 'facebook.com/abcmobilya',
    partnerId: 'user-araci',
    partnerName: 'Mücahit Atıl',
    status: 'aktif',
    projectTitle: 'E-Ticaret & Google Ads Büyüme',
    startDate: '2026-08-15',
    description: 'Masif ahşap mobilya ürünlerinin yurt içi e-ticaret satışı ve marka bilinirliği.',
    createdAt: '2026-08-15T10:00:00.000Z'
  },
  {
    id: 'cust-xyz',
    companyName: 'XYZ Klinik & Sağlık',
    contactPerson: 'Dr. Selin Demir',
    phone: '+90 555 333 44 55',
    whatsapp: '+90 555 333 44 55',
    email: 'iletisim@xyzsaglik.com',
    website: 'https://xyzsaglik.com',
    instagram: '@xyzsaglik',
    facebook: 'facebook.com/xyzsaglik',
    partnerId: 'user-araci',
    partnerName: 'Mücahit Atıl',
    status: 'beklemede',
    projectTitle: 'Sağlık Turizmi Lead Kampanyası',
    startDate: '2026-09-05',
    description: 'Yurtdışı diş ve estetik hastaları için çok dilli lead oluşturma çalışması.',
    createdAt: '2026-09-05T14:30:00.000Z'
  }
];

export const INITIAL_TASKS = [
  // OMTEK Lazer - Meta Kurulum (5 görev - hepsi tamamlandı)
  {
    id: 'task-1',
    customerId: 'cust-omtek',
    categoryId: 'cat-meta',
    title: 'Instagram ve Facebook bağlantısını kur',
    description: 'Instagram profesyonel hesabı ile Facebook işletme sayfasını birbirine bağla.',
    assignedTo: 'Mücahit Atıl',
    startDate: '2026-09-01',
    dueDate: '2026-09-03',
    priority: 'yuksek',
    status: 'tamamlandi',
    isCompleted: true,
    completedAt: '2026-09-02T14:30:00.000Z',
    completedBy: 'Mücahit Atıl',
    waitingForClient: false,
    waitingReason: ''
  },
  {
    id: 'task-2',
    customerId: 'cust-omtek',
    categoryId: 'cat-meta',
    title: 'Facebook Sayfası bağlantısı',
    description: 'Resmi sayfa yöneticilik izinlerini tanımla.',
    assignedTo: 'Mücahit Atıl',
    startDate: '2026-09-02',
    dueDate: '2026-09-04',
    priority: 'normal',
    status: 'tamamlandi',
    isCompleted: true,
    completedAt: '2026-09-02T15:15:00.000Z',
    completedBy: 'Mücahit Atıl',
    waitingForClient: false,
    waitingReason: ''
  },
  {
    id: 'task-3',
    customerId: 'cust-omtek',
    categoryId: 'cat-meta',
    title: 'Meta Business hesabını oluştur',
    description: 'Meta Business Suite portali kurulumu ve alan adı doğrulama.',
    assignedTo: 'Serdar KEKLİK',
    startDate: '2026-09-02',
    dueDate: '2026-09-04',
    priority: 'yuksek',
    status: 'tamamlandi',
    isCompleted: true,
    completedAt: '2026-09-03T11:00:00.000Z',
    completedBy: 'Serdar KEKLİK',
    waitingForClient: false,
    waitingReason: ''
  },
  {
    id: 'task-4',
    customerId: 'cust-omtek',
    categoryId: 'cat-meta',
    title: 'Reklam hesabı kurulumu ve faturalandırma',
    description: 'Yeni reklam hesabı oluşturuldu, fatura bilgileri girildi.',
    assignedTo: 'Serdar KEKLİK',
    startDate: '2026-09-03',
    dueDate: '2026-09-05',
    priority: 'yuksek',
    status: 'tamamlandi',
    isCompleted: true,
    completedAt: '2026-09-03T16:45:00.000Z',
    completedBy: 'Serdar KEKLİK',
    waitingForClient: false,
    waitingReason: ''
  },
  {
    id: 'task-5',
    customerId: 'cust-omtek',
    categoryId: 'cat-meta',
    title: 'Profil optimizasyonu ve biyo düzenleme',
    description: 'Instagram bio metni, WhatsApp iletişim butonu ve linkler hazırlandı.',
    assignedTo: 'Mücahit Atıl',
    startDate: '2026-09-03',
    dueDate: '2026-09-05',
    priority: 'normal',
    status: 'tamamlandi',
    isCompleted: true,
    completedAt: '2026-09-04T10:20:00.000Z',
    completedBy: 'Mücahit Atıl',
    waitingForClient: false,
    waitingReason: ''
  },

  // OMTEK Lazer - İçerik (4 görev - 2 tamamlandı, 1 devam ediyor, 1 yapılacak)
  {
    id: 'task-6',
    customerId: 'cust-omtek',
    categoryId: 'cat-icerik',
    title: 'Görsel konsept ve renk paleti oluştur',
    description: 'Lacivert ve altın tonları kullanılarak kurumsal post şablonları hazırlandı.',
    assignedTo: 'Tasarım Ekibi',
    startDate: '2026-09-04',
    dueDate: '2026-09-06',
    priority: 'yuksek',
    status: 'tamamlandi',
    isCompleted: true,
    completedAt: '2026-09-05T17:00:00.000Z',
    completedBy: 'Serdar KEKLİK',
    waitingForClient: false,
    waitingReason: ''
  },
  {
    id: 'task-7',
    customerId: 'cust-omtek',
    categoryId: 'cat-icerik',
    title: 'İlk hafta gönderilerini tasarla (6 Adet)',
    description: 'Lazer kesim hassasiyeti ve fabrika tanıtım gönderileri tasarlandı.',
    assignedTo: 'Tasarım Ekibi',
    startDate: '2026-09-05',
    dueDate: '2026-09-07',
    priority: 'normal',
    status: 'tamamlandi',
    isCompleted: true,
    completedAt: '2026-09-06T13:40:00.000Z',
    completedBy: 'Serdar KEKLİK',
    waitingForClient: false,
    waitingReason: ''
  },
  {
    id: 'task-8',
    customerId: 'cust-omtek',
    categoryId: 'cat-icerik',
    title: 'Reels video kurguları ve ses planlaması',
    description: 'Atölyede çekilen ham kesim videolarının dinamik kurgusu yapılacak.',
    assignedTo: 'Tasarım Ekibi',
    startDate: '2026-09-07',
    dueDate: '2026-09-10',
    priority: 'yuksek',
    status: 'devam_ediyor',
    isCompleted: false,
    completedAt: null,
    completedBy: null,
    waitingForClient: false,
    waitingReason: ''
  },
  {
    id: 'task-9',
    customerId: 'cust-omtek',
    categoryId: 'cat-icerik',
    title: 'Haftalık Story takvimini oluştur',
    description: 'Müşteri soru-cevap ve tezgah arkası story içerikleri planlanacak.',
    assignedTo: 'Mücahit Atıl',
    startDate: '2026-09-08',
    dueDate: '2026-09-12',
    priority: 'normal',
    status: 'yapilacak',
    isCompleted: false,
    completedAt: null,
    completedBy: null,
    waitingForClient: false,
    waitingReason: ''
  },

  // OMTEK Lazer - Reklam Yönetimi (5 görev - 3 tamamlandı, 1 devam ediyor bekleyenli, 1 yapılacak)
  {
    id: 'task-10',
    customerId: 'cust-omtek',
    categoryId: 'cat-reklam',
    title: 'B2B Hedef kitleleri ve sektör filtrelerini oluştur',
    description: 'Makine imalatı, metal sanayi, mobilya aksesuarcıları hedef kitleleri kuruldu.',
    assignedTo: 'Reklam Uzmanı',
    startDate: '2026-09-05',
    dueDate: '2026-09-07',
    priority: 'yuksek',
    status: 'tamamlandi',
    isCompleted: true,
    completedAt: '2026-09-06T16:00:00.000Z',
    completedBy: 'Serdar KEKLİK',
    waitingForClient: false,
    waitingReason: ''
  },
  {
    id: 'task-11',
    customerId: 'cust-omtek',
    categoryId: 'cat-reklam',
    title: 'WhatsApp dönüşüm reklamı oluştur',
    description: 'Teklif al butonlu direkt WhatsApp mesaj kampanyası aktif edildi.',
    assignedTo: 'Reklam Uzmanı',
    startDate: '2026-09-06',
    dueDate: '2026-09-08',
    priority: 'acil',
    status: 'tamamlandi',
    isCompleted: true,
    completedAt: '2026-09-07T11:30:00.000Z',
    completedBy: 'Serdar KEKLİK',
    waitingForClient: false,
    waitingReason: ''
  },
  {
    id: 'task-12',
    customerId: 'cust-omtek',
    categoryId: 'cat-reklam',
    title: 'Instagram Doğrudan Mesaj (DM) reklamı oluştur',
    description: 'Örnek kesim numunesi talebi için DM yönlendirmeli reklam yayına alındı.',
    assignedTo: 'Reklam Uzmanı',
    startDate: '2026-09-06',
    dueDate: '2026-09-08',
    priority: 'normal',
    status: 'tamamlandi',
    isCompleted: true,
    completedAt: '2026-09-07T15:00:00.000Z',
    completedBy: 'Serdar KEKLİK',
    waitingForClient: false,
    waitingReason: ''
  },
  {
    id: 'task-13',
    customerId: 'cust-omtek',
    categoryId: 'cat-reklam',
    title: 'Remarketing (Yeniden Pazarlama) kurgusu',
    description: 'Profilimizi ve web sitemizi ziyaret edenlere özel hatırlatma kampanyası.',
    assignedTo: 'Reklam Uzmanı',
    startDate: '2026-09-08',
    dueDate: '2026-09-12',
    priority: 'acil',
    status: 'devam_ediyor',
    isCompleted: false,
    completedAt: null,
    completedBy: null,
    waitingForClient: true,
    waitingReason: 'Müşteriden ek reklam bütçesi onayı bekleniyor'
  },
  {
    id: 'task-14',
    customerId: 'cust-omtek',
    categoryId: 'cat-reklam',
    title: 'Reklam A/B test optimizasyonu yap',
    description: 'Görsel ve video reklamların tıklama başı maliyetleri karşılaştırılacak.',
    assignedTo: 'Reklam Uzmanı',
    startDate: '2026-09-10',
    dueDate: '2026-09-15',
    priority: 'yuksek',
    status: 'yapilacak',
    isCompleted: false,
    completedAt: null,
    completedBy: null,
    waitingForClient: false,
    waitingReason: ''
  },

  // OMTEK Lazer - Organik Büyüme (4 görev - 2 tamamlandı, 1 devam ediyor, 1 beklemede)
  {
    id: 'task-15',
    customerId: 'cust-omtek',
    categoryId: 'cat-organik',
    title: 'Rakip analizi ve sektör hashtag listesi',
    description: 'Bursa ve Marmara bölgesi metal işleme etiketleri belirlendi.',
    assignedTo: 'Mücahit Atıl',
    startDate: '2026-09-06',
    dueDate: '2026-09-08',
    priority: 'normal',
    status: 'tamamlandi',
    isCompleted: true,
    completedAt: '2026-09-08T09:15:00.000Z',
    completedBy: 'Mücahit Atıl',
    waitingForClient: false,
    waitingReason: ''
  },
  {
    id: 'task-16',
    customerId: 'cust-omtek',
    categoryId: 'cat-organik',
    title: 'Sektörel etkileşim çalışması',
    description: 'Hedef sanayi sayfaları ve potansiyel müşterilerle günlük etkileşim kurulması.',
    assignedTo: 'Mücahit Atıl',
    startDate: '2026-09-08',
    dueDate: '2026-09-14',
    priority: 'normal',
    status: 'devam_ediyor',
    isCompleted: false,
    completedAt: null,
    completedBy: null,
    waitingForClient: false,
    waitingReason: ''
  },
  {
    id: 'task-17',
    customerId: 'cust-omtek',
    categoryId: 'cat-organik',
    title: 'Yeni ürün ve makine tanıtım çekimi',
    description: 'Yeni 12kW fiber lazer makinesinin çalışma esnasındaki yüksek çözünürlüklü fotoğrafları.',
    assignedTo: 'Mücahit Atıl',
    startDate: '2026-09-09',
    dueDate: '2026-09-16',
    priority: 'yuksek',
    status: 'beklemede',
    isCompleted: false,
    completedAt: null,
    completedBy: null,
    waitingForClient: true,
    waitingReason: 'Müşteriden yeni makinenin çekim tarihi ve fabrika randevusu bekleniyor'
  },
  {
    id: 'task-18',
    customerId: 'cust-omtek',
    categoryId: 'cat-organik',
    title: 'Aylık performans ve büyüme raporu',
    description: 'Erişim, takipçi artışı, WhatsApp dönüşüm sayılarını içeren yönetici raporu sunulacak.',
    assignedTo: 'Serdar KEKLİK',
    startDate: '2026-09-25',
    dueDate: '2026-09-30',
    priority: 'normal',
    status: 'yapilacak',
    isCompleted: false,
    completedAt: null,
    completedBy: null,
    waitingForClient: false,
    waitingReason: ''
  }
];

export const INITIAL_CREDENTIALS = [
  {
    id: 'cred-1',
    customerId: 'cust-omtek',
    serviceType: 'Instagram',
    serviceName: 'Instagram İşletme Hesabı',
    icon: 'Instagram',
    color: '#E1306C',
    clientVisible: true,
    fields: [
      { key: 'Kullanıcı Adı', value: 'omteklazer_tr', isSecret: false },
      { key: 'E-posta', value: 'social@omteklazer.com', isSecret: false },
      { key: 'Telefon', value: '+90 532 111 22 33', isSecret: false },
      { key: 'Şifre', value: 'Omtek2026*Secret!', isSecret: true },
      { key: 'Not', value: '2FA Mücahit telefonuna bağlı.', isSecret: false }
    ],
    updatedAt: '2026-09-02'
  },
  {
    id: 'cred-2',
    customerId: 'cust-omtek',
    serviceType: 'Facebook',
    serviceName: 'Facebook Sayfası',
    icon: 'Facebook',
    color: '#1877F2',
    clientVisible: true,
    fields: [
      { key: 'E-posta', value: 'fb@omteklazer.com', isSecret: false },
      { key: 'Şifre', value: 'FbPass992*Omtek', isSecret: true },
      { key: 'Sayfa URL', value: 'https://facebook.com/omteklazer', isSecret: false }
    ],
    updatedAt: '2026-09-02'
  },
  {
    id: 'cred-3',
    customerId: 'cust-omtek',
    serviceType: 'Meta Business',
    serviceName: 'Meta Business Suite & Ads',
    icon: 'Layers',
    color: '#0081FB',
    clientVisible: false, // Müşteri göremez (Admin/Aracı özel)
    fields: [
      { key: 'Business ID', value: '948291048192019', isSecret: false },
      { key: 'Reklam Hesabı ID', value: 'act_49201948291', isSecret: false },
      { key: 'Pixel ID', value: 'px_839201948201', isSecret: false },
      { key: 'E-posta', value: 'ads@omteklazer.com', isSecret: false },
      { key: 'Notlar', value: 'Harcama limiti günlük 1.500 TL olarak sınırlandırılmıştır.', isSecret: false }
    ],
    updatedAt: '2026-09-03'
  },
  {
    id: 'cred-4',
    customerId: 'cust-omtek',
    serviceType: 'Web Sitesi',
    serviceName: 'WordPress Yönetim Paneli',
    icon: 'Globe',
    color: '#21759B',
    clientVisible: true,
    fields: [
      { key: 'Admin URL', value: 'https://omteklazer.com/wp-admin', isSecret: false },
      { key: 'Kullanıcı Adı', value: 'admin_omtek', isSecret: false },
      { key: 'Şifre', value: 'Wp*LazerMaster2026#', isSecret: true }
    ],
    updatedAt: '2026-09-03'
  },
  {
    id: 'cred-5',
    customerId: 'cust-omtek',
    serviceType: 'Hosting',
    serviceName: 'cPanel Sunucu Girişi',
    icon: 'Server',
    color: '#FF6C37',
    clientVisible: false,
    fields: [
      { key: 'Hosting Firması', value: 'Güzel Hosting', isSecret: false },
      { key: 'cPanel URL', value: 'https://cpanel.omteklazer.com:2083', isSecret: false },
      { key: 'Kullanıcı Adı', value: 'cpl_omtek', isSecret: false },
      { key: 'Şifre', value: 'Cpanel*Hosting99!', isSecret: true }
    ],
    updatedAt: '2026-09-04'
  }
];

export const INITIAL_NOTES = [
  {
    id: 'note-1',
    customerId: 'cust-omtek',
    authorName: 'Mücahit Atıl',
    authorRole: 'Aracı',
    authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    content: 'Müşteri içeriklerde kırmızı ağırlıklı tasarım kesinlikle istemiyor. Kurumsal kimliklerine uygun lacivert, antrasit ve altın detaylar tercih edilecek.',
    color: 'amber',
    createdAt: '2026-09-01T11:20:00.000Z'
  },
  {
    id: 'note-2',
    customerId: 'cust-omtek',
    authorName: 'Serdar KEKLİK',
    authorRole: 'Admin',
    authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    content: 'Müşteri Meta reklamlarında öncelikle WhatsApp dönüşü istiyor. Form yerine doğrudan mesaj bağlantısı üzerinden fason kesim teklif talepleri toplanacak.',
    color: 'blue',
    createdAt: '2026-09-02T14:10:00.000Z'
  }
];

export const INITIAL_FILES = [
  {
    id: 'file-1',
    customerId: 'cust-omtek',
    name: 'OMTEK_Vektor_Logo.svg',
    category: 'Logo',
    size: '2.4 MB',
    type: 'svg',
    description: 'Yüksek çözünürlüklü vektörel logo (koyu ve açık zemin)',
    uploadedBy: 'Özlem Kaya',
    uploadedAt: '2026-09-01T10:00:00.000Z'
  },
  {
    id: 'file-2',
    customerId: 'cust-omtek',
    name: 'Kurumsal_Kimlik_Rehberi.pdf',
    category: 'Kurumsal Kimlik',
    size: '8.1 MB',
    type: 'pdf',
    description: 'Pantone renk kodları, font dosyaları ve kullanım kuralları',
    uploadedBy: 'Serdar KEKLİK',
    uploadedAt: '2026-09-01T12:30:00.000Z'
  },
  {
    id: 'file-3',
    customerId: 'cust-omtek',
    name: 'Dijital_Pazarlama_Hizmet_Sozlesmesi.pdf',
    category: 'Sözleşme',
    size: '1.2 MB',
    type: 'pdf',
    description: 'Islak imzalı 12 aylık danışmanlık ve reklam yönetimi sözleşmesi',
    uploadedBy: 'Serdar KEKLİK',
    uploadedAt: '2026-09-01T15:00:00.000Z'
  },
  {
    id: 'file-4',
    customerId: 'cust-omtek',
    name: 'Eylul_Kampanya_Gorselleri.zip',
    category: 'Reklam Görselleri',
    size: '45.0 MB',
    type: 'zip',
    description: 'Fabrika lazer tezgahından çekilmiş ham kesim videoları ve görseller',
    uploadedBy: 'Mücahit Atıl',
    uploadedAt: '2026-09-05T09:20:00.000Z'
  }
];

export const INITIAL_COMMENTS = [
  {
    id: 'comm-1',
    customerId: 'cust-omtek',
    userName: 'Özlem Kaya',
    userRole: 'musteri',
    userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    message: 'İlk hazırlanan gönderi tasarımlarını çok beğendik. Sadece arka plan tonunu biraz daha koyu lacivert yapabilir miyiz?',
    createdAt: '2026-09-06T11:20:00.000Z',
    reply: {
      userName: 'Serdar KEKLİK',
      userRole: 'admin',
      userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      message: 'Tabii Özlem Hanım, tasarım ekibimiz tonları koyulaştırdı ve yeni önizlemeleri Dosyalar sekmesine yükledi.',
      createdAt: '2026-09-06T14:15:00.000Z'
    }
  },
  {
    id: 'comm-2',
    customerId: 'cust-omtek',
    userName: 'Özlem Kaya',
    userRole: 'musteri',
    userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    message: 'WhatsApp reklamından dün 3 adet lazer fason kesim talebi aldık, dönüşler gayet hızlı başladı. Elinize sağlık!',
    createdAt: '2026-09-08T09:40:00.000Z',
    reply: null
  }
];

export const INITIAL_ACTIVITIES = [
  {
    id: 'act-1',
    customerId: 'cust-omtek',
    customerName: 'OMTEK Lazer',
    userName: 'Mücahit Atıl',
    actionText: 'Rakip analizi ve sektör hashtag listesi görevini tamamladı.',
    type: 'task_completed',
    createdAt: '2026-09-08T09:15:00.000Z'
  },
  {
    id: 'act-2',
    customerId: 'cust-omtek',
    customerName: 'OMTEK Lazer',
    userName: 'Özlem Kaya (Müşteri)',
    actionText: 'Projeye yeni bir geri bildirim yorumu bıraktı.',
    type: 'comment',
    createdAt: '2026-09-08T09:40:00.000Z'
  },
  {
    id: 'act-3',
    customerId: 'cust-omtek',
    customerName: 'OMTEK Lazer',
    userName: 'Serdar KEKLİK',
    actionText: 'WhatsApp dönüşüm reklamı görevini tamamladı.',
    type: 'task_completed',
    createdAt: '2026-09-07T11:30:00.000Z'
  },
  {
    id: 'act-4',
    customerId: 'cust-abc',
    customerName: 'ABC Mobilya',
    userName: 'Serdar KEKLİK',
    actionText: 'ABC Mobilya projesine yeni başlangıç bilgi talebi gönderildi.',
    type: 'onboarding',
    createdAt: '2026-09-06T15:10:00.000Z'
  },
  {
    id: 'act-5',
    customerId: 'cust-omtek',
    customerName: 'OMTEK Lazer',
    userName: 'Serdar KEKLİK',
    actionText: 'Meta Business hesap bilgisi güvenli kasaya eklendi.',
    type: 'credential',
    createdAt: '2026-09-03T11:00:00.000Z'
  }
];

export const INITIAL_NOTIFICATIONS = [
  {
    id: 'notif-1',
    title: 'Yeni Müşteri Yorumu',
    message: 'OMTEK Lazer projesinde Özlem Kaya yeni bir yorum bıraktı.',
    read: false,
    createdAt: '2026-09-08T09:40:00.000Z',
    linkCustomerId: 'cust-omtek'
  },
  {
    id: 'notif-2',
    title: 'İşe Başlama Bilgileri Doldurulmalı',
    message: 'OMTEK Lazer için işi başlatmak üzere başlangıç bilgileri talep edildi.',
    read: false,
    createdAt: '2026-09-08T08:00:00.000Z',
    linkCustomerId: 'cust-omtek'
  }
];

// Görev Şablonları (Madde 24)
export const INITIAL_TEMPLATES = [
  {
    id: 'tmpl-sosyal-medya',
    name: 'Sosyal Medya ve Meta Yönetimi (Standart Paket)',
    description: 'Yeni müşteriler için tek tıkla 14 adımlı standart sosyal medya ve reklam kurulumu.',
    taskItems: [
      { title: 'Instagram Analizi ve Profil Taraması', category: 'cat-organik', priority: 'normal' },
      { title: 'Meta Business Kurulumu ve Doğrulama', category: 'cat-meta', priority: 'yuksek' },
      { title: 'Facebook Sayfası ve Instagram Bağlantısı', category: 'cat-meta', priority: 'yuksek' },
      { title: 'Reklam Hesabı ve Ödeme Kurulumu', category: 'cat-meta', priority: 'yuksek' },
      { title: 'Profil Optimizasyonu ve Biyo Linki', category: 'cat-meta', priority: 'normal' },
      { title: 'İçerik Konsepti ve Renk Paleti', category: 'cat-icerik', priority: 'yuksek' },
      { title: 'Gönderi Tasarımları (Haftalık Şablonlar)', category: 'cat-icerik', priority: 'normal' },
      { title: 'Reels Video Planlaması', category: 'cat-icerik', priority: 'yuksek' },
      { title: 'Story Takvimi ve Etkileşim Planı', category: 'cat-icerik', priority: 'normal' },
      { title: 'İlk Reklam Kampanyası Kurulumu', category: 'cat-reklam', priority: 'acil' },
      { title: 'WhatsApp Mesaj Reklamı Kurulumu', category: 'cat-reklam', priority: 'acil' },
      { title: 'Remarketing (Yeniden Pazarlama) Kurulumu', category: 'cat-reklam', priority: 'yuksek' },
      { title: 'Organik Büyüme ve Rakip Etkileşimi', category: 'cat-organik', priority: 'normal' },
      { title: 'Aylık Yönetici Performans Raporu', category: 'cat-rapor', priority: 'normal' }
    ]
  },
  {
    id: 'tmpl-web-seo',
    name: 'Web Sitesi Kurulum & SEO Başlangıç Paketi',
    description: 'Kurumsal web sitesi ve arama motoru optimizasyonu görev dizisi.',
    taskItems: [
      { title: 'Domain ve Hosting Kurulumu', category: 'cat-teknik', priority: 'acil' },
      { title: 'WordPress ve Güvenlik Eklentileri Kurulumu', category: 'cat-teknik', priority: 'yuksek' },
      { title: 'Google Analytics 4 & Search Console Bağlantısı', category: 'cat-teknik', priority: 'yuksek' },
      { title: 'Sayfa İçi SEO ve Meta Açıklamaları', category: 'cat-organik', priority: 'normal' },
      { title: 'İletişim Formları ve WhatsApp Butonu Entegrasyonu', category: 'cat-teknik', priority: 'yuksek' }
    ]
  }
];

// Müşteriden İstenilecek Bilgiler (Onboarding / Başlangıç Talepleri)
export const INITIAL_ONBOARDING_REQUESTS = [
  {
    id: 'req-omtek',
    customerId: 'cust-omtek',
    customerName: 'OMTEK Lazer',
    title: 'Meta & Sosyal Medya Başlangıç Bilgileri',
    description: 'İşlemlerin başlayabilmesi için lütfen aşağıdaki kurumsal logo, şifre ve iletişim bilgilerini iletiniz.',
    status: 'completed', // 'pending' | 'completed'
    createdAt: '2026-09-01T09:30:00.000Z',
    completedAt: '2026-09-01T11:00:00.000Z',
    items: [
      { id: 'item-1', label: 'Vektörel Logo Dosyası (SVG / AI / PDF)', type: 'file', required: true, value: 'OMTEK_Vektor_Logo.svg', isSubmitted: true },
      { id: 'item-2', label: 'Instagram Giriş Şifresi', type: 'password', required: true, value: 'Omtek2026*Secret!', isSubmitted: true },
      { id: 'item-3', label: 'WhatsApp İletişim Numarası', type: 'text', required: true, value: '+90 532 111 22 33', isSubmitted: true },
      { id: 'item-4', label: 'Tasarım Renk & Konsept Tercihleri', type: 'note', required: false, value: 'Kırmızı istenmiyor, lacivert ve altın tercih edilecek', isSubmitted: true }
    ]
  },
  {
    id: 'req-abc',
    customerId: 'cust-abc',
    customerName: 'ABC Mobilya',
    title: 'E-Ticaret & Katalog Başlangıç Talepleri',
    description: 'Mobilya ürünlerinin listelenmesi ve reklamların açılması için gereklidir.',
    status: 'pending',
    createdAt: '2026-09-07T14:00:00.000Z',
    completedAt: null,
    items: [
      { id: 'item-abc-1', label: 'Yüksek Çözünürlüklü Logo Dosyası', type: 'file', required: true, value: '', isSubmitted: false },
      { id: 'item-abc-2', label: 'WordPress / E-Ticaret Admin Şifresi', type: 'password', required: true, value: '', isSubmitted: false },
      { id: 'item-abc-3', label: 'Öne Çıkarılacak İlk 5 Ürün ve Fiyat Listesi', type: 'note', required: true, value: '', isSubmitted: false }
    ]
  }
];
