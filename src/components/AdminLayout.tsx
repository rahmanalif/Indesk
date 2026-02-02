import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { cn } from '../lib/utils';
export function AdminLayout() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar - Desktop Only */}
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        toggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />

      {/* Main Content Wrapper */}
      <div className={cn(
        'flex-1 flex flex-col min-h-screen transition-all duration-300 ease-in-out',
        isSidebarCollapsed ? 'md:pl-20' : 'md:pl-64'
      )}>
        <Header isSidebarCollapsed={isSidebarCollapsed} />

        {/* Page Content */}
        <main className="flex-1 p-4 md:p-6 pt-20 md:pt-24 overflow-x-hidden">
          <div className="max-w-[1920px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 min-h-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}