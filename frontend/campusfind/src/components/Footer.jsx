import { Link } from 'react-router-dom';
import { MapPin, GitBranch, MessageCircle, Mail } from 'lucide-react';

export default function Footer() {
  return (
    <footer style={{
      borderTop: '1px solid rgba(255,255,255,0.06)',
      background: 'rgba(10,11,20,0.9)',
      backdropFilter: 'blur(20px)',
      marginTop: 'auto',
      padding: '48px 24px 32px',
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '40px', marginBottom: '48px' }}>
          {/* Brand */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <div style={{ width: '32px', height: '32px', background: 'linear-gradient(135deg,#6C63FF,#A78BFA)', borderRadius: '9px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <MapPin size={16} color="#fff" />
              </div>
              <span style={{ fontFamily: 'Space Grotesk,sans-serif', fontWeight: 700, fontSize: '1.1rem', color: '#F0F0FF' }}>
                Campus<span style={{ color: '#6C63FF' }}>Find</span>
              </span>
            </div>
            <p style={{ color: '#5A5E7A', fontSize: '0.87rem', lineHeight: 1.7, maxWidth: '220px' }}>
              Connecting students to reclaim what matters most on campus.
            </p>
            <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
              {[GitBranch, MessageCircle, Mail].map((Icon, i) => (
                <a key={i} href="#" style={{
                  width: '36px', height: '36px',
                  borderRadius: '9px',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#9CA3C4',
                  transition: 'all 0.25s ease',
                  textDecoration: 'none',
                }}>
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 style={{ color: '#F0F0FF', fontWeight: 600, fontSize: '0.9rem', marginBottom: '16px', letterSpacing: '0.04em', textTransform: 'uppercase' }}>Navigation</h4>
            {[['Home', '/'], ['Browse Items', '/search'], ['Report Item', '/post-item']].map(([label, to]) => (
              <Link key={to} to={to} style={{ display: 'block', color: '#5A5E7A', fontSize: '0.87rem', marginBottom: '10px', textDecoration: 'none', transition: 'color 0.2s', fontWeight: 400 }}
                onMouseEnter={e => e.target.style.color = '#A78BFA'}
                onMouseLeave={e => e.target.style.color = '#5A5E7A'}
              >
                {label}
              </Link>
            ))}
          </div>

          {/* Account */}
          <div>
            <h4 style={{ color: '#F0F0FF', fontWeight: 600, fontSize: '0.9rem', marginBottom: '16px', letterSpacing: '0.04em', textTransform: 'uppercase' }}>Account</h4>
            {[['Login', '/login'], ['Register', '/register']].map(([label, to]) => (
              <Link key={to} to={to} style={{ display: 'block', color: '#5A5E7A', fontSize: '0.87rem', marginBottom: '10px', textDecoration: 'none', transition: 'color 0.2s', fontWeight: 400 }}
                onMouseEnter={e => e.target.style.color = '#A78BFA'}
                onMouseLeave={e => e.target.style.color = '#5A5E7A'}
              >
                {label}
              </Link>
            ))}
          </div>

          {/* Contact */}
          <div>
            <h4 style={{ color: '#F0F0FF', fontWeight: 600, fontSize: '0.9rem', marginBottom: '16px', letterSpacing: '0.04em', textTransform: 'uppercase' }}>Support</h4>
            <p style={{ color: '#5A5E7A', fontSize: '0.87rem', marginBottom: '10px' }}>support@campusfind.edu</p>
            <p style={{ color: '#5A5E7A', fontSize: '0.87rem' }}>Mon–Fri, 9AM–6PM IST</p>
          </div>
        </div>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <p style={{ color: '#5A5E7A', fontSize: '0.82rem' }}>© 2026 CampusFind. All rights reserved.</p>
          <p style={{ color: '#5A5E7A', fontSize: '0.82rem' }}>Built with ❤️ for students</p>
        </div>
      </div>
    </footer>
  );
}
