import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import api from '../../api/client';
import useAuthStore from '../../stores/authStore';
import { Icon } from '../../legacy/LegacyIconSprite';
import { legacyPageMeta, pageFromPath, roleColors, roleLabels } from '../../legacy/legacyNav';

function formatDate(value) {
  if (!value) return '';
  try {
    return new Date(value).toLocaleDateString('ar-SA');
  } catch {
    return '';
  }
}

export default function Topbar({ openMobileSidebar, activePage: activePageProp }) {
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();
  const location = useLocation();
  const activePage = activePageProp || pageFromPath(location.pathname);
  const meta = legacyPageMeta[activePage] || legacyPageMeta.dashboard;
  const [notifOpen, setNotifOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [unread, setUnread] = useState(0);
  const [theme, setTheme] = useState(() => localStorage.getItem('sc_theme') || 'light');

  useEffect(() => {
    document.documentElement.toggleAttribute('data-theme', theme === 'dark');
    if (theme === 'dark') document.documentElement.setAttribute('data-theme', 'dark');
    else document.documentElement.removeAttribute('data-theme');
    localStorage.setItem('sc_theme', theme);
  }, [theme]);

  const load = useCallback(async () => {
    try {
      const { data } = await api.get('/api/v1/notifications');
      setItems(data.data?.data || []);
      setUnread(data.unread_count || 0);
    } catch {
      setItems([]);
      setUnread(0);
    }
  }, []);

  useEffect(() => {
    load();
    const timer = setInterval(load, 60000);
    const refreshNotifications = () => load();
    window.addEventListener('sc:notifications-updated', refreshNotifications);
    return () => {
      clearInterval(timer);
      window.removeEventListener('sc:notifications-updated', refreshNotifications);
    };
  }, [load]);

  const userName = user?.name || user?.username || 'مستخدم';
  const roleLabel = roleLabels[user?.role] || user?.role || 'عضو';
  const roleColor = roleColors[user?.role] || '#0d8a6f';
  const initial = (userName || '?').trim().charAt(0).toUpperCase();
  const countText = unread > 99 ? '99+' : unread;

  const breadcrumbs = useMemo(() => {
    if (activePage === 'dashboard') return [{ label: 'لوحة التحكم' }];
    return [{ label: 'لوحة التحكم', to: '/dashboard' }, { label: meta.title }];
  }, [activePage, meta.title]);

  const openItem = async (item) => {
    if (!item.read_at) await api.patch(`/api/v1/notifications/${item.id}/read`);
    setNotifOpen(false);
    await load();
    if (item.url) navigate(item.url);
  };

  const markAll = async () => {
    await api.post('/api/v1/notifications/mark-all-read');
    await load();
  };

  const signOut = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <>
      <div className="topbar">
        <button className="topbar-toggle" aria-label="القائمة" type="button" onClick={openMobileSidebar}>
          <Icon name="i-list" />
        </button>
        <div className="search-wrap">
          <input type="text" id="global-search" placeholder="ابحث في كل النظام..." readOnly />
          <span className="s-icon"><Icon name="i-search" /></span>
          <span className="search-kbd">⌘K</span>
        </div>
        <div className="topbar-actions">
          <button
            className="icon-btn theme-toggle-btn"
            id="theme-toggle-btn"
            title="تبديل المظهر"
            aria-label="تبديل المظهر"
            type="button"
            onClick={() => setTheme((current) => (current === 'dark' ? 'light' : 'dark'))}
          >
            <svg className="ic theme-icon-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'none' }}><circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" /></svg>
            <svg className="ic theme-icon-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>
          </button>
          <button className="icon-btn" title="السجل" aria-label="السجل" type="button"><Icon name="i-clock" /></button>
          <div className="notif-wrap" id="notif-wrap">
            <button className="icon-btn" id="notif-btn" title="الإشعارات" aria-label="الإشعارات" type="button" onClick={() => setNotifOpen((open) => !open)}>
              <Icon name="i-bell" />
              <span className="ping" id="notif-badge" style={{ display: unread ? undefined : 'none' }} />
              <span className="notif-count" id="notif-count" style={{ display: unread ? 'grid' : 'none' }}>{countText}</span>
            </button>
            <div className={`notif-dd${notifOpen ? ' show' : ''}`} id="notif-dd">
              <div className="notif-dd-head">
                <h4>الإشعارات</h4>
                <button className="notif-mark-all" id="notif-mark-all" type="button" onClick={markAll}>تعليم الكل مقروء</button>
              </div>
              <div className="notif-dd-list" id="notif-dd-list">
                {items.length ? items.slice(0, 10).map((item) => (
                  <button key={item.id} type="button" className={`notif-item${item.read_at ? '' : ' unread'}`} onClick={() => openItem(item)}>
                    <span className={`notif-icon ${item.type || 'info'}`}>!</span>
                    <span className="notif-body">
                      <span className="notif-title">{item.title}</span>
                      <span className="notif-msg">{item.body}</span>
                      <span className="notif-time">{formatDate(item.created_at)}</span>
                    </span>
                  </button>
                )) : <div style={{ padding: 30, textAlign: 'center', color: 'var(--text-3)', fontSize: 13 }}>لا توجد إشعارات</div>}
              </div>
              <div className="notif-dd-foot"><Link to="/settings#notifications" id="notif-view-all">عرض كل الإشعارات ←</Link></div>
            </div>
          </div>
          <div className="user-btn-wrap">
            <button className={`user-btn${userOpen ? ' open' : ''}`} id="user-btn" type="button" onClick={() => setUserOpen((open) => !open)}>
              <div className="user-ava" style={{ background: roleColor }}>{initial}</div>
              <div className="user-info">
                <div className="user-name">{userName}</div>
                <div className="user-role">{roleLabel}</div>
              </div>
              <span className="user-arrow"><Icon name="i-chevron-down" /></span>
            </button>
            <div className={`user-dd${userOpen ? ' show' : ''}`} id="user-dd">
              <div className="dd-header">
                <div className="top">
                  <div className="ava-big" style={{ background: roleColor }}>{initial}</div>
                  <div className="info-big">
                    <div className="name-big">{userName}</div>
                    <div className="email-big">{user?.email || user?.username}</div>
                  </div>
                </div>
                <span className="role-pill" style={{ background: '#f0fdf9', color: roleColor }}>{roleLabel}</span>
              </div>
              <div className="dd-items">
                <Link to="/settings" className="dd-item"><Icon name="i-settings" />الإعدادات</Link>
                <Link to="/dashboard" className="dd-item"><Icon name="i-home" />الرئيسية</Link>
                <div className="dd-divider" />
                <button className="dd-item danger" id="dd-logout" type="button" onClick={signOut}><Icon name="i-x" />تسجيل الخروج</button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="page-head legacy-shell-head">
        <nav className="page-head-bc" aria-label="مسار التنقل">
          {breadcrumbs.map((part, index) => (
            <span key={`${part.label}-${index}`} className="legacy-bc-part">
              {index > 0 ? <span className="bc-sep">/</span> : null}
              {part.to ? <Link className="bc-link" to={part.to}>{part.label}</Link> : <span className="bc-cur" aria-current="page">{part.label}</span>}
            </span>
          ))}
        </nav>
        <div>
          <div className="page-head-title">{meta.title}</div>
          {meta.desc ? <div className="page-head-desc">{meta.desc}</div> : null}
        </div>
      </div>
    </>
  );
}
