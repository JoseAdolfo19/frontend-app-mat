import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../Common/Sidebar';
import TopBar from '../Common/TopBar';
import BottomNav from '../Common/BottomNav';

const MainLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Sidebar Desktop */}
      <Sidebar />

      {/* Main Content */}
      <div className="md:ml-64 flex flex-col min-h-screen">
        <TopBar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        
        <main className="flex-1 p-6 md:p-10 max-w-7xl mx-auto w-full">
          <Outlet />
        </main>

        {/* Bottom Navigation Mobile */}
        <BottomNav />
      </div>
    </div>
  );
};

export default MainLayout;