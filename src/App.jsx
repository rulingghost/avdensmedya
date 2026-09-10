import React, { useState } from 'react';
import { useApp } from './context/AppContext';
import Navbar from './components/layout/Navbar';
import Sidebar from './components/layout/Sidebar';
import QuickActionModal from './components/modals/QuickActionModal';
import EditProfileModal from './components/modals/EditProfileModal';
import LoginView from './components/auth/LoginView';
import DashboardView from './components/views/DashboardView';
import CustomersView from './components/views/CustomersView';
import CustomerDetailView from './components/views/CustomerDetailView';
import TasksView from './components/views/TasksView';
import TemplatesView from './components/views/TemplatesView';
import ActivitiesView from './components/views/ActivitiesView';
import ClientPortalView from './components/views/ClientPortalView';
import CommentsView from './components/views/CommentsView';
import FilesView from './components/views/FilesView';
import SettingsView from './components/views/SettingsView';
import UsersView from './components/views/UsersView';
import ContentCalendarView from './components/views/ContentCalendarView';
import WhatsAppNotificationModal from './components/modals/WhatsAppNotificationModal';
import PwaInstallPrompt from './components/common/PwaInstallPrompt';

export default function App() {
  const {
    activePage,
    currentUser,
    isLoggedIn
  } = useApp();

  const [isQuickActionOpen, setIsQuickActionOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);

  // Oturum açılmamışsa doğrudan Login ekranı gösterilir (Madde 1)
  if (!isLoggedIn) {
    return <LoginView />;
  }

  // Müşteri rolünde dashboard yerine sade Müşteri Portalı gösterilir (Madde 19)
  const isCustomer = currentUser.role === 'musteri';

  return (
    <div className="app-layout">
      {/* Sol Menü */}
      <Sidebar
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
        onOpenEditProfile={() => setIsEditProfileOpen(true)}
      />

      {/* Ana Çerçeve */}
      <div className="main-wrapper">
        {/* Üst Bar */}
        <Navbar
          onOpenQuickAction={() => setIsQuickActionOpen(true)}
          onToggleSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          onOpenEditProfile={() => setIsEditProfileOpen(true)}
        />

        {/* Ana İçerik Alanı (Rol Bazlı Katı Erişim Koruması) */}
        <main className="content-area">
          {/* 1. Müşteri Rolü: Yalnızca kendine özel portala, dosyalara, yorumlara ve görevlere erişebilir */}
          {isCustomer ? (
            <>
              {(activePage === 'dashboard' || activePage === 'customers' || activePage === 'customer-detail' || activePage === 'templates' || activePage === 'activities' || activePage === 'settings' || activePage === 'users') && (
                <ClientPortalView />
              )}
              {activePage === 'tasks' && <TasksView />}
              {activePage === 'files' && <FilesView />}
              {activePage === 'comments' && <CommentsView />}
              {activePage === 'content-calendar' && <ContentCalendarView />}
            </>
          ) : (
            /* 2. Ajans Ekibi (Admin & Aracı) */
            <>
              {activePage === 'dashboard' && (
                <DashboardView onOpenQuickAction={() => setIsQuickActionOpen(true)} />
              )}

              {activePage === 'customers' && (
                <CustomersView />
              )}

              {activePage === 'customer-detail' && (
                <CustomerDetailView onOpenWhatsAppModal={() => setIsWhatsAppModalOpen(true)} />
              )}

              {activePage === 'tasks' && (
                <TasksView />
              )}

              {/* Sosyal Medya & İçerik Takvimi (Madde 2 & 3) */}
              {activePage === 'content-calendar' && (
                <ContentCalendarView onOpenWhatsAppModal={() => setIsWhatsAppModalOpen(true)} />
              )}

              {/* Görev Şablonları Yöneticisi: SADECE Admin erişebilir */}
              {activePage === 'templates' && (
                currentUser.role === 'admin' ? (
                  <TemplatesView />
                ) : (
                  <DashboardView onOpenQuickAction={() => setIsQuickActionOpen(true)} />
                )
              )}

              {/* Ekip & Yetkili Yönetimi: SADECE Admin erişebilir */}
              {activePage === 'users' && (
                currentUser.role === 'admin' ? (
                  <UsersView />
                ) : (
                  <DashboardView onOpenQuickAction={() => setIsQuickActionOpen(true)} />
                )
              )}

              {activePage === 'activities' && (
                <ActivitiesView />
              )}

              {activePage === 'comments' && (
                <CommentsView />
              )}

              {activePage === 'files' && (
                <FilesView />
              )}

              {/* Ayarlar & Veri Sıfırlama: SADECE Admin erişebilir */}
              {activePage === 'settings' && (
                currentUser.role === 'admin' ? (
                  <SettingsView />
                ) : (
                  <DashboardView onOpenQuickAction={() => setIsQuickActionOpen(true)} />
                )
              )}
            </>
          )}
        </main>
      </div>

      {/* Hızlı İşlem Modalı */}
      <QuickActionModal
        isOpen={isQuickActionOpen}
        onClose={() => setIsQuickActionOpen(false)}
      />

      {/* Profil Düzenleme Modalı (Admin, Aracı, Müşteri için) */}
      <EditProfileModal
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
      />

      {/* WhatsApp Bildirim & Onay Modalı (Madde 3) */}
      <WhatsAppNotificationModal
        isOpen={isWhatsAppModalOpen}
        onClose={() => setIsWhatsAppModalOpen(false)}
      />

      {/* PWA Mobil & Masaüstü Kurulum Banner'ı (Madde 7) */}
      <PwaInstallPrompt />
    </div>
  );
}
