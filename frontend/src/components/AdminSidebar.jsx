import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, ClipboardList, ShieldCheck, MapPin, LogOut, PackagePlus, Archive, MessageSquareWarning } from 'lucide-react';

const navItems = [
  { to: '/admin/dashboard', label: 'Overview', icon: LayoutDashboard },
  { to: '/admin/report', label: 'Report Item', icon: PackagePlus },
  { to: '/admin/records', label: 'Item Registry', icon: Archive },
  { to: '/admin/handover', label: 'Physical Handover', icon: ShieldCheck },
  { to: '/admin/claims', label: 'Claims Ledger', icon: ClipboardList },
  { to: '/admin/issues', label: 'Student Issues', icon: MessageSquareWarning },
];

export default function AdminSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    localStorage.removeItem('campusfind_user');
    localStorage.removeItem('campusfind_token');
    navigate('/login');
  };

  return (
    <aside
      style={{
        width: '240px',
        minHeight: '100vh',
        background: 'var(--color-bone)',
        borderRight: '1px solid var(--color-stone)',
        display: 'flex',
        flexDirection: 'column',
        padding: '24px 16px',
        position: 'sticky',
        top: 0,
        height: '100vh',
        overflowY: 'auto',
        flexShrink: 0,
        zIndex: 50,
      }}
    >
      {/* Brand Logo */}
      <Link
        to="/admin/dashboard"
        style={{
          textDecoration: 'none',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '32px',
          padding: '0 6px',
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-cursorgothic)',
            fontWeight: 500,
            fontSize: '15px',
            color: 'var(--color-ink)',
            letterSpacing: '-0.02em',
          }}
        >
          CampusFind
        </span>
      </Link>

      <span
        style={{
          fontFamily: 'var(--font-berkeleymono)',
          fontSize: '11px',
          fontWeight: 500,
          color: 'var(--color-ash)',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          padding: '0 8px',
          marginBottom: '10px',
          display: 'block',
        }}
      >
       
      </span>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: '3px', flex: 1 }}>
        {navItems.map((item) => {
          const active = isActive(item.to);
          const NavIcon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '9px 12px',
                borderRadius: '4px',
                textDecoration: 'none',
                fontSize: '13px',
                fontWeight: active ? 500 : 400,
                transition: 'all 150ms ease',
                color: active ? 'var(--color-ink)' : 'var(--color-driftwood)',
                background: active ? 'var(--color-linen)' : 'transparent',
                border: active ? '1px solid var(--color-stone)' : '1px solid transparent',
                letterSpacing: '-0.01em',
              }}
            >
              <NavIcon
                size={16}
                color={active ? 'var(--color-ink)' : 'var(--color-ash)'}
                strokeWidth={1.8}
              />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <button
        onClick={handleLogout}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '9px 12px',
          borderRadius: '4px',
          background: 'var(--color-crimson)',
          border: '1px solid var(--color-stone)',
          color: 'var(--color-ink)',
          fontSize: '13px',
          fontWeight: 400,
          cursor: 'pointer',
          marginTop: '16px',
          transition: 'all 150ms ease',
          width: '100%',
          textAlign: 'left',
          letterSpacing: '-0.01em',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'var(--color-linen)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'var(--color-crimson)';
        }}
      >
        <LogOut size={14} color="var(--color-ink)" strokeWidth={1.8} />
        Sign Out
      </button>
    </aside>
  );
}
