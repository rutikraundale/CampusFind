import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, ClipboardList, ShieldCheck, MapPin, LogOut } from 'lucide-react';

const navItems = [
  { to: '/admin/dashboard', label: 'Overview Metrics', icon: LayoutDashboard },
  { to: '/admin/claims', label: 'Claim Records', icon: ClipboardList },
  { to: '/admin/verify-claims', label: 'Claim Verifications', icon: ShieldCheck },
];

export default function AdminSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    localStorage.removeItem('campusfind_user');
    navigate('/login');
  };

  return (
    <aside style={{
      width: '260px',
      minHeight: '100vh',
      background: 'linear-gradient(180deg, rgba(16, 18, 31, 0.85) 0%, rgba(10, 11, 20, 0.95) 100%)',
      borderRight: '1px solid rgba(255, 255, 255, 0.08)',
      display: 'flex',
      flexDirection: 'column',
      padding: '28px 18px',
      position: 'sticky',
      top: 0,
      height: '100vh',
      overflowY: 'auto',
      flexShrink: 0,
      zIndex: 10
    }}>
      {/* Brand Logo */}
      <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '40px', padding: '0 6px' }}>
        <div style={{ 
          width: '36px', 
          height: '36px', 
          background: 'linear-gradient(135deg,#6C63FF,#A78BFA)', 
          borderRadius: '9px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          boxShadow: '0 4px 14px rgba(108,99,255,0.3)'
        }}>
          <MapPin size={17} color="#fff" />
        </div>
        <span style={{ fontFamily: 'Space Grotesk,sans-serif', fontWeight: 700, fontSize: '1.05rem', color: '#F2F4F8' }}>
          Campus<span style={{ color: '#6C63FF' }}>Find</span>
        </span>
      </Link>

      <span style={{ 
        fontSize: '0.68rem', 
        fontWeight: 700, 
        color: '#5A5E7A', 
        textTransform: 'uppercase', 
        letterSpacing: '1.5px', 
        padding: '0 8px', 
        marginBottom: '14px',
        display: 'block'
      }}>
        Admin Dashboard
      </span>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
        {navItems.map(({ to, label, icon: Icon }) => {
          const active = isActive(to);
          return (
            <Link
              key={to}
              to={to}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 14px',
                borderRadius: '10px',
                textDecoration: 'none',
                fontSize: '0.88rem',
                fontWeight: 600,
                transition: 'all 0.25s ease',
                color: active ? '#F2F4F8' : '#AEB6C7',
                background: active ? 'rgba(108,99,255,0.14)' : 'transparent',
                border: active ? '1px solid rgba(108,99,255,0.35)' : '1px solid transparent',
                boxShadow: active ? '0 4px 20px rgba(108,99,255,0.06)' : 'none'
              }}
            >
              <Icon size={16} style={{ color: active ? '#A78BFA' : '#5A5E7A', transition: 'color 0.2s' }} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Logout Action button */}
      <button
        onClick={handleLogout}
        style={{
          display: 'flex', 
          alignItems: 'center', 
          gap: '10px',
          padding: '12px 14px',
          borderRadius: '10px',
          background: 'rgba(239, 68, 68, 0.08)',
          border: '1px solid rgba(239, 68, 68, 0.15)',
          color: '#EF4444',
          fontSize: '0.88rem',
          fontWeight: 600,
          cursor: 'pointer',
          marginTop: '16px',
          transition: 'all 0.25s ease',
        }}
        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.15)'; }}
        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.08)'; }}
      >
        <LogOut size={16} /> Exit Administrator
      </button>
    </aside>
  );
}
