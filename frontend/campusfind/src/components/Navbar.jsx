import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, Menu, X, MapPin, LogOut, User, LayoutDashboard } from 'lucide-react';

export default function Navbar({ user: propUser = null }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const localUserStr = localStorage.getItem('campusfind_user');
  const localUser = localUserStr ? JSON.parse(localUserStr) : null;
  const user = propUser || localUser;

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    localStorage.removeItem('campusfind_user');
    localStorage.removeItem('campusfind_token');
    navigate('/login');
  };

  const navLinks = user?.role === 'admin'
    ? [
        { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { to: '/admin/claims', label: 'Claims', icon: User },
      ]
    : [
        { to: '/', label: 'Home' },
        { to: '/search', label: 'Browse Items' },
        { to: '/post-item', label: 'Report Item' },
        ...(user ? [{ to: '/profile', label: 'My Profile' }] : []),
      ];

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      borderBottom: '1px solid rgba(255,255,255,0.06)',
      backdropFilter: 'blur(24px)',
      WebkitBackdropFilter: 'blur(24px)',
      background: 'rgba(10,11,20,0.85)',
    }}>
      <nav style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '68px' }}>
        {/* Logo */}
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '36px', height: '36px',
            background: 'linear-gradient(135deg, #6C63FF, #A78BFA)',
            borderRadius: '10px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 16px rgba(108,99,255,0.4)',
          }}>
            <MapPin size={18} color="#fff" />
          </div>
          <span style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '1.2rem', color: '#F0F0FF', letterSpacing: '-0.02em' }}>
            Campus<span style={{ color: '#6C63FF' }}>Find</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }} className="hidden-mobile">
          {navLinks.map(link => (
            <Link
              key={link.to}
              to={link.to}
              style={{
                padding: '8px 18px',
                borderRadius: '9999px',
                fontSize: '0.9rem',
                fontWeight: 500,
                textDecoration: 'none',
                transition: 'all 0.25s ease',
                color: isActive(link.to) ? '#F0F0FF' : '#9CA3C4',
                background: isActive(link.to) ? 'rgba(108,99,255,0.2)' : 'transparent',
                border: isActive(link.to) ? '1px solid rgba(108,99,255,0.4)' : '1px solid transparent',
              }}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }} className="hidden-mobile">
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '6px 14px', borderRadius: '9999px',
                background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
              }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'linear-gradient(135deg,#6C63FF,#A78BFA)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <User size={14} color="#fff" />
                </div>
                <span style={{ fontSize: '0.85rem', fontWeight: 500, color: '#F0F0FF' }}>{user.name}</span>
              </div>
              <button onClick={handleLogout} className="btn-secondary" style={{ padding: '8px 18px' }}>
                <LogOut size={15} /> Logout
              </button>
            </div>
          ) : (
            <>
              <Link to="/login" className="btn-secondary" style={{ padding: '9px 22px' }}>Login</Link>
              <Link to="/register" className="btn-primary" style={{ padding: '9px 22px' }}>Sign Up</Link>
            </>
          )}
        </div>

        {/* Mobile Hamburger */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          style={{ display: 'none', background: 'none', border: 'none', cursor: 'pointer', color: '#F0F0FF', padding: '8px' }}
          className="show-mobile"
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {/* Mobile Menu */}
      {menuOpen && (
        <div style={{
          padding: '16px 24px 24px',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          background: 'rgba(10,11,20,0.98)',
          display: 'flex', flexDirection: 'column', gap: '8px',
        }}>
          {navLinks.map(link => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setMenuOpen(false)}
              style={{
                padding: '12px 18px',
                borderRadius: '10px',
                fontSize: '0.95rem',
                fontWeight: 500,
                textDecoration: 'none',
                color: isActive(link.to) ? '#F0F0FF' : '#9CA3C4',
                background: isActive(link.to) ? 'rgba(108,99,255,0.15)' : 'transparent',
              }}
            >
              {link.label}
            </Link>
          ))}
          <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
            {user ? (
              <button onClick={handleLogout} className="btn-secondary" style={{ flex: 1 }}>
                <LogOut size={15} /> Logout
              </button>
            ) : (
              <>
                <Link to="/login" className="btn-secondary" style={{ flex: 1, textAlign: 'center' }}>Login</Link>
                <Link to="/register" className="btn-primary" style={{ flex: 1, textAlign: 'center' }}>Sign Up</Link>
              </>
            )}
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .hidden-mobile { display: none !important; }
          .show-mobile { display: flex !important; }
        }
        @media (min-width: 769px) {
          .show-mobile { display: none !important; }
        }
      `}</style>
    </header>
  );
}
