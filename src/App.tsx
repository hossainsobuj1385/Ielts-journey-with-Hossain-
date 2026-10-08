import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { BottomNav } from './components/BottomNav';
import { HomeView } from './components/HomeView';
import { RoadmapView } from './components/RoadmapView';
import { LessonsView } from './components/LessonsView';
import { PeersView } from './components/PeersView';
import { PdfLibraryView } from './components/PdfLibraryView';
import { CommunityView } from './components/CommunityView';
import { SupportView } from './components/SupportView';
import { ProfileView } from './components/ProfileView';
import { LessonDetailModal } from './components/LessonDetailModal';
import { NotificationModal } from './components/NotificationModal';
import { TelegramSimulatorModal } from './components/TelegramSimulatorModal';
import { ShareAppModal } from './components/ShareAppModal';
import { AdminLayout } from './components/admin/AdminLayout';

function MainAppContent() {
  const { activeView, selectedLessonId, closeLesson } = useAuth();
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isUserSwitchOpen, setIsUserSwitchOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);

  // If currently inside the Admin Control Center
  if (activeView === 'admin') {
    return <AdminLayout />;
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Top Navbar */}
      <Navbar
        onOpenNotifications={() => setIsNotifOpen(true)}
        onOpenUserSwitch={() => setIsUserSwitchOpen(true)}
        onOpenShare={() => setIsShareOpen(true)}
      />

      {/* Main Student Container */}
      <main className="flex-1 max-w-2xl w-full mx-auto px-3.5 sm:px-4 py-3">
        {activeView === 'home' && <HomeView />}
        {activeView === 'roadmap' && <RoadmapView />}
        {activeView === 'lessons' && <LessonsView />}
        {activeView === 'peers' && <PeersView />}
        {activeView === 'pdfs' && <PdfLibraryView />}
        {activeView === 'community' && <CommunityView />}
        {activeView === 'support' && <SupportView />}
        {activeView === 'profile' && <ProfileView />}
      </main>

      {/* Persistent Bottom Tab Navigation */}
      <BottomNav />

      {/* Active Modals */}
      {selectedLessonId !== null && (
        <LessonDetailModal
          lessonId={selectedLessonId}
          onClose={closeLesson}
        />
      )}

      <NotificationModal
        isOpen={isNotifOpen}
        onClose={() => setIsNotifOpen(false)}
      />

      <TelegramSimulatorModal
        isOpen={isUserSwitchOpen}
        onClose={() => setIsUserSwitchOpen(false)}
      />

      <ShareAppModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainAppContent />
    </AuthProvider>
  );
}
