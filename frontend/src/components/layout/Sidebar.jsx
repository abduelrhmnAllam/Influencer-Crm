import { Link, useLocation } from 'react-router-dom';
import useAuthStore from '../../stores/authStore';
import { Icon } from '../../legacy/LegacyIconSprite';
import {
  isLegacyActive,
  legacyMainNavItems,
  legacySystemNavItems,
  roleColors,
  roleLabels,
} from '../../legacy/legacyNav';

function canSee(item, can) {
  return !item.permission || can(item.permission);
}

function NavItem({ item, active, badge, closeMobile }) {
  return (
    <Link
      to={item.path}
      className={`nav-item${active ? ' active' : ''}`}
      aria-current={active ? 'page' : undefined}
      title={item.label}
      onClick={closeMobile}
    >
      <Icon name={item.icon} />
      <span className="nav-label">{item.label}</span>
      {badge !== undefined && badge !== null && badge !== '' ? <span className="badge">{badge}</span> : null}
    </Link>
  );
}

export default function Sidebar({ closeMobile, badges = {}, onCollapse }) {
  const location = useLocation();
  const { user, can } = useAuthStore();
  const visibleMain = legacyMainNavItems.filter((item) => canSee(item, can));
  const visibleSystem = legacySystemNavItems.filter((item) => canSee(item, can));
  const userName = user?.name || user?.username || 'admin';
  const userRole = roleLabels[user?.role] || user?.role || 'مدير النظام';
  const userInitial = (userName || '?').trim().charAt(0).toUpperCase();
  const userColor = roleColors[user?.role] || '#7c3aed';

  return (
    <aside className="sidebar">
      <Link to="/dashboard" className="brand" style={{ textDecoration: 'none', color: 'inherit' }} onClick={closeMobile}>
        <div className="brand-logo">S</div>
        <div className="brand-text">
          <div className="n">
            Smart<b>Code</b>
          </div>
          <div className="s">INFLUENCER CRM V5</div>
        </div>
      </Link>

      <nav className="nav">
        {visibleMain.map((item) => (
          <NavItem
            key={item.page}
            item={item}
            active={isLegacyActive(location.pathname, item)}
            badge={badges[item.page]}
            closeMobile={closeMobile}
          />
        ))}
        {visibleSystem.length ? <div className="nav-sep" /> : null}
        {visibleSystem.map((item) => (
          <NavItem
            key={item.page}
            item={item}
            active={isLegacyActive(location.pathname, item)}
            badge={badges[item.page]}
            closeMobile={closeMobile}
          />
        ))}
      </nav>

      <button
        className="sidebar-collapse"
        id="sidebar-collapse-btn"
        title="طيّ / توسيع القائمة"
        aria-label="طيّ القائمة"
        type="button"
        onClick={onCollapse}
      >
        <Icon name="i-chevron-right" />
        <span className="nav-label">طيّ القائمة</span>
      </button>

      <div className="user-card" id="sidebar-user-card" style={{ cursor: user ? 'pointer' : 'default' }} role={user ? 'button' : undefined} tabIndex={user ? 0 : undefined}>
        <div className="avatar" style={{ background: userColor }}>
          {userInitial}
        </div>
        <div className="info">
          <div className="n">{userName}</div>
          <div className="r">{userRole}</div>
        </div>
        {user ? <Icon name="i-chevron-left" className="ic chevron" /> : null}
      </div>
    </aside>
  );
}
