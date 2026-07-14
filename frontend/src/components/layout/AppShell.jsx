import { useEffect, useState } from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import LegacyIconSprite from '../../legacy/LegacyIconSprite';
import api from '../../api/client';

export default function AppShell({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem('sc_sidebar_collapsed') === '1');
  const [badges, setBadges] = useState({});

  useEffect(() => {
    const fetchBadges = async () => {
      try {
        const [
          influencersRes,
          publishersRes,
          customersRes,
          campaignsRes,
          financeRes,
          contentRes
        ] = await Promise.all([
          api.get('/api/v1/influencers', { params: { type: 'influencer', per_page: 1 } }).catch(() => ({ data: { meta: { total: 0 } } })),
          api.get('/api/v1/influencers', { params: { type: 'publisher', per_page: 1 } }).catch(() => ({ data: { meta: { total: 0 } } })),
          api.get('/api/v1/customers', { params: { per_page: 1 } }).catch(() => ({ data: { meta: { total: 0 } } })),
          api.get('/api/v1/campaigns', { params: { per_page: 1 } }).catch(() => ({ data: { meta: { total: 0 } } })),
          api.get('/api/v1/transfers', { params: { per_page: 1 } }).catch(() => ({ data: { meta: { total: 0 } } })),
          api.get('/api/v1/contents', { params: { per_page: 1 } }).catch(() => ({ data: { meta: { total: 0 } } }))
        ]);
        
        const formatCount = (count) => {
          if (!count) return null;
          return count > 1000 ? `${(count / 1000).toFixed(1)}k` : count;
        };

        const getCount = (res) => res?.data?.meta?.total || res?.data?.total || 0;

        setBadges({
          influencers: formatCount(getCount(influencersRes)),
          publishers: formatCount(getCount(publishersRes)),
          customers: formatCount(getCount(customersRes)),
          'orders-campaigns': formatCount(getCount(campaignsRes)),
          finance: formatCount(getCount(financeRes)),
          content: formatCount(getCount(contentRes)),
          requests: '12', 
          'ugc-admin': '18', 
        });
      } catch (err) {
        console.error('Failed to load badge stats', err);
      }
    };
    fetchBadges();
  }, []);

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
        badges={badges}
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
