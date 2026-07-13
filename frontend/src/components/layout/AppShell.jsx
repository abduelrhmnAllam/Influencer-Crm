import { useEffect, useState } from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import LegacyIconSprite from '../../legacy/LegacyIconSprite';

export default function AppShell({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem('sc_sidebar_collapsed') === '1');

  useEffect(() => {
    localStorage.setItem('sc_sidebar_collapsed', collapsed ? '1' : '0');
  }, [collapsed]);

  useEffect(() => {
    if (!sidebarOpen) return undefined;
    const onKeyDown = (event) => {
      if (event.key === 'Escape') setSidebarOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [sidebarOpen]);

  return (
    <div className={`app${collapsed ? ' sidebar-collapsed' : ''}`} dir="rtl">
      <LegacyIconSprite />
      <div className={`sidebar-overlay${sidebarOpen ? ' show' : ''}`} onClick={() => setSidebarOpen(false)} />
      <Sidebar
        closeMobile={() => setSidebarOpen(false)}
        onCollapse={() => setCollapsed((value) => !value)}
      />
      <main className="main">
        <Topbar openMobileSidebar={() => setSidebarOpen(true)} />
        <div className="content">
          {children}
        </div>
      </main>
    </div>
  );
}
