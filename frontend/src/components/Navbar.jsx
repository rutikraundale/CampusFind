import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { MapPin, Menu, X, LogOut, User } from 'lucide-react';

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
        { to: '/admin/dashboard', label: 'Dashboard' },
        { to: '/admin/claims', label: 'Claims' },
        { to: '/admin/handover', label: 'Physical Handover' },
      ]
    : [
        { to: '/', label: 'Home' },
        { to: '/search', label: 'Directory' },
        { to: '/post-item', label: 'Report Item' },
      ];

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        borderBottom: '1px solid var(--color-stone)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        background: 'rgba(247, 247, 244, 0.94)',
      }}
    >
      <nav
        style={{
          maxWidth: '1300px',
          margin: '0 auto',
          padding: '0 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '56px',
        }}
      >
        {/* Brand */}
        <Link
          to="/"
          style={{
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <div
            style={{
              width: '26px',
              height: '26px',
              background: 'var(--color-ink)',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <MapPin size={14} color="#f7f7f4" strokeWidth={2.2} />
          </div>
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

        {/* Desktop Nav Links */}
        <div
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          className="cf-nav-desktop"
        >
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              style={{
                padding: '6px 12px',
                borderRadius: '4px',
                fontSize: '13px',
                fontWeight: 400,
                textDecoration: 'none',
                transition: 'all 150ms ease',
                color: isActive(link.to) ? 'var(--color-ink)' : 'var(--color-ash)',
                background: isActive(link.to) ? 'var(--color-bone)' : 'transparent',
                border: isActive(link.to) ? '1px solid var(--color-stone)' : '1px solid transparent',
                letterSpacing: '-0.01em',
              }}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right Actions */}
        <div
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          className="cf-nav-desktop"
        >
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Link
                to={user.role === 'admin' ? '/admin/dashboard' : '/profile'}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '5px 10px',
                  borderRadius: '4px',
                  background: 'var(--color-bone)',
                  border: '1px solid var(--color-stone)',
                  textDecoration: 'none',
                }}
              >
                <div
                  style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '2px',
                    background: 'var(--color-linen)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <User size={12} color="var(--color-ink)" />
                </div>
                <span
                  style={{
                    fontSize: '13px',
                    fontWeight: 500,
                    color: 'var(--color-ink)',
                    letterSpacing: '-0.01em',
                  }}
                >
                  {user.name || user.username}
                </span>
              </Link>
              <button
                onClick={handleLogout}
                className="btn-secondary"
                style={{
                  padding: '6px 12px',
                  fontSize: '13px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer',
                }}
              >
                <LogOut size={13} />
                Sign Out
              </button>
            </div>
          ) : (
            <>
              <Link
                to="/login"
                className="btn-ghost"
                style={{ fontSize: '13px', padding: '6px 12px' }}
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="btn-primary"
                style={{ fontSize: '13px', padding: '7px 14px' }}
              >
                Register
              </Link>
            </>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="cf-nav-mobile"
          style={{
            background: 'none',
            border: '1px solid var(--color-stone)',
            cursor: 'pointer',
            color: 'var(--color-ink)',
            padding: '6px',
            borderRadius: '4px',
            display: 'none',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
        >
          {menuOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </nav>

      {/* Mobile Drawer Menu */}
      {menuOpen && (
        <div
          style={{
            padding: '16px 24px 20px',
            borderTop: '1px solid var(--color-stone)',
            background: 'var(--color-parchment)',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
            position: 'relative',
            zIndex: 1001,
            boxShadow: '0 8px 24px rgba(38, 37, 30, 0.08)',
          }}
        >
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setMenuOpen(false)}
              style={{
                padding: '10px 14px',
                borderRadius: '4px',
                fontSize: '14px',
                fontWeight: 400,
                textDecoration: 'none',
                color: isActive(link.to) ? 'var(--color-ink)' : 'var(--color-driftwood)',
                background: isActive(link.to) ? 'var(--color-bone)' : 'transparent',
                border: isActive(link.to) ? '1px solid var(--color-stone)' : '1px solid transparent',
                transition: 'all 150ms ease',
                letterSpacing: '-0.01em',
              }}
            >
              {link.label}
            </Link>
          ))}

          {user && user.role !== 'admin' && (
            <Link
              to="/profile"
              onClick={() => setMenuOpen(false)}
              style={{
                padding: '10px 14px',
                borderRadius: '4px',
                fontSize: '14px',
                fontWeight: 400,
                textDecoration: 'none',
                color: isActive('/profile') ? 'var(--color-ink)' : 'var(--color-driftwood)',
                background: isActive('/profile') ? 'var(--color-bone)' : 'transparent',
                border: isActive('/profile') ? '1px solid var(--color-stone)' : '1px solid transparent',
                transition: 'all 150ms ease',
                letterSpacing: '-0.01em',
              }}
            >
              My Account
            </Link>
          )}

          <div
            style={{
              display: 'flex',
              gap: '10px',
              marginTop: '12px',
              paddingTop: '14px',
              borderTop: '1px solid var(--color-stone)',
            }}
          >
            {user ? (
              <button
                onClick={() => {
                  handleLogout();
                  setMenuOpen(false);
                }}
                className="btn-secondary"
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                }}
              >
                <LogOut size={14} /> Sign Out
              </button>
            ) : (
              <>
                <Link
                  to="/login"
                  className="btn-secondary"
                  style={{ flex: 1, textAlign: 'center' }}
                  onClick={() => setMenuOpen(false)}
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="btn-primary"
                  style={{ flex: 1, textAlign: 'center' }}
                  onClick={() => setMenuOpen(false)}
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .cf-nav-desktop { display: none !important; }
          .cf-nav-mobile  { display: inline-flex !important; }
        }
        @media (min-width: 769px) {
          .cf-nav-mobile  { display: none !important; }
        }
      `}</style>
    </header>
  );
}
