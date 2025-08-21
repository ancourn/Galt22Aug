'use client';

import { useState } from 'react';
import { Menu } from 'lucide-react';
import Header from '@/components/oxlas/Header';
import Sidebar from '@/components/oxlas/Sidebar';
import MobileSidebar from '@/components/oxlas/MobileSidebar';
import Dashboard from '@/components/oxlas/Dashboard';
import { Button } from '@/components/ui/button';

export default function Home() {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <>
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="icon"
        className="mobile-menu-button lg:hidden"
        onClick={() => setIsMobileSidebarOpen(true)}
      >
        <Menu className="h-5 w-5" />
      </Button>

      <div className="flex h-screen bg-background">
        {/* Desktop Sidebar */}
        <Sidebar className="hidden lg:flex" />
        
        {/* Mobile Sidebar */}
        <MobileSidebar
          isOpen={isMobileSidebarOpen}
          onClose={() => setIsMobileSidebarOpen(false)}
        />
        
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto p-4 lg:p-6 oxlas-main">
            <Dashboard />
          </main>
        </div>
      </div>
    </>
  );
}