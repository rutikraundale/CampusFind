import { Link } from 'react-router-dom';
import { MapPin, Globe, Mail, Shield } from 'lucide-react';

export default function Footer() {
  return (
    <footer
      style={{
        borderTop: '1px solid var(--color-stone)',
        background: 'var(--color-parchment)',
        marginTop: 'auto',
        padding: '64px 24px 40px',
      }}
    >
      <div style={{ maxWidth: '1300px', margin: '0 auto' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '48px',
            marginBottom: '48px',
          }}
        >
          {/* Brand */}
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '14px',
              }}
            >
              <div
                style={{
                  width: '24px',
                  height: '24px',
                  background: 'var(--color-ink)',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <MapPin size={13} color="#f7f7f4" strokeWidth={2.2} />
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
            </div>
            <p
              style={{
                color: 'var(--color-driftwood)',
                fontSize: '13px',
                lineHeight: 1.6,
                maxWidth: '240px',
              }}
            >
              The verified lost and found network for college students. Reconnecting campus belongings with editorial restraint.
            </p>
            <div style={{ display: 'flex', gap: '8px', marginTop: '18px' }}>
              {[
                { icon: Shield, href: '#' },
                { icon: Globe, href: '#' },
                { icon: Mail, href: 'mailto:support@campusfind.edu' },
              ].map((item, i) => {
                const SocialIcon = item.icon;
                return (
                  <a
                    key={i}
                    href={item.href}
                    style={{
                      width: '30px',
                      height: '30px',
                      borderRadius: '4px',
                      background: 'var(--color-bone)',
                      border: '1px solid var(--color-stone)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--color-ash)',
                      transition: 'all 150ms ease',
                      textDecoration: 'none',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'var(--color-linen)';
                      e.currentTarget.style.color = 'var(--color-ink)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'var(--color-bone)';
                      e.currentTarget.style.color = 'var(--color-ash)';
                    }}
                  >
                    <SocialIcon size={14} />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Directory Navigation */}
          <div>
            <h4
              style={{
                fontFamily: 'var(--font-cursorgothic)',
                fontWeight: 500,
                color: 'var(--color-ink)',
                fontSize: '14px',
                marginBottom: '16px',
                letterSpacing: '-0.01em',
              }}
            >
              Navigation
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[
                ['Home', '/'],
                ['Browse Directory', '/search'],
                ['Report an Item', '/post-item'],
              ].map(([label, to]) => (
                <Link
                  key={to}
                  to={to}
                  style={{
                    color: 'var(--color-ash)',
                    fontSize: '13px',
                    textDecoration: 'none',
                    transition: 'color 150ms ease',
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.color = 'var(--color-ink)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.color = 'var(--color-ash)';
                  }}
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>

          {/* Account */}
          <div>
            <h4
              style={{
                fontFamily: 'var(--font-cursorgothic)',
                fontWeight: 500,
                color: 'var(--color-ink)',
                fontSize: '14px',
                marginBottom: '16px',
                letterSpacing: '-0.01em',
              }}
            >
              Account
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[
                ['Student Sign In', '/login'],
                ['Create Account', '/register'],
                ['Admin Verification', '/admin/dashboard'],
              ].map(([label, to]) => (
                <Link
                  key={to}
                  to={to}
                  style={{
                    color: 'var(--color-ash)',
                    fontSize: '13px',
                    textDecoration: 'none',
                    transition: 'color 150ms ease',
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.color = 'var(--color-ink)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.color = 'var(--color-ash)';
                  }}
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>

          {/* Campus Support */}
          <div>
            <h4
              style={{
                fontFamily: 'var(--font-cursorgothic)',
                fontWeight: 500,
                color: 'var(--color-ink)',
                fontSize: '14px',
                marginBottom: '16px',
                letterSpacing: '-0.01em',
              }}
            >
              Desk Support
            </h4>
            <p style={{ color: 'var(--color-ash)', fontSize: '13px', marginBottom: '6px' }}>
              support@campusfind.edu
            </p>
            <p style={{ color: 'var(--color-ash)', fontSize: '13px', marginBottom: '6px' }}>
              Central Desk: Mon–Fri, 9AM–6PM
            </p>
            <span
              style={{
                fontFamily: 'var(--font-berkeleymono)',
                fontSize: '11px',
                color: 'var(--color-driftwood)',
              }}
            >
              CAMPUS NETWORK v2.4
            </span>
          </div>
        </div>

        <div
          style={{
            borderTop: '1px solid var(--color-stone)',
            paddingTop: '24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <p style={{ color: 'var(--color-ash)', fontSize: '12px', margin: 0 }}>
            © 2026 CampusFind. Built with paper-like editorial clarity for campus life.
          </p>
          <p
            style={{
              color: 'var(--color-driftwood)',
              fontSize: '12px',
              fontFamily: 'var(--font-berkeleymono)',
              margin: 0,
            }}
          >
            Light Atelier Theme · Design.md
          </p>
        </div>
      </div>
    </footer>
  );
}
