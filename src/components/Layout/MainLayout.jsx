import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../Common/Sidebar';
import TopBar from '../Common/TopBar';
import BottomNav from '../Common/BottomNav';
import ChatWidget from '../Common/ChatWidget';
import OnboardingWizard from '../Common/OnboardingWizard';

const MainLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Onboarding de bienvenida para usuarios nuevos */}
      <OnboardingWizard />

      {/* Sidebar Desktop */}
      <Sidebar />

      {/* Main Content */}
      <div className="md:ml-64 flex flex-col min-h-screen">
        <TopBar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        
        <main className="flex-1 p-6 md:p-10 max-w-7xl mx-auto w-full" role="main">
          <Outlet />
        </main>

        {/* Bottom Navigation Mobile */}
        <BottomNav />
      </div>

      {/* AI Math Assistant */}
      <ChatWidget />
    </div>
  );
};

export default MainLayout;