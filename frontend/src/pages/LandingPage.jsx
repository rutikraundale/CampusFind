import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  Shield,
  Zap,
  ChevronDown,
  ArrowRight,
  MapPin,
  CheckCircle,
  Clock,
  Tag
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const faqs = [
  {
    q: 'How does CampusFind verify that I am the rightful owner of an item?',
    a: "Visit the administration office with your registered CampusFind email. An administrator will verify your email and identity in person, then record the physical handover."
  },
  {
    q: 'Is there a fee for posting or retrieving lost items?',
    a: 'Absolutely not. CampusFind is 100% free and built specifically by and for the campus community to make student life easier and recover important belongings safely.'
  },
  {
    q: "What should I do if I find someone else's lost item on campus?",
    a: 'Simply click "Report Item", fill in the name, location found, and a short description. You can choose to hand it over to the college central desk or hold onto it until the owner contacts you.'
  },
  {
    q: 'How quickly will I get notified if my lost item is found?',
    a: "Instantly. Our system constantly matches newly posted found items against active lost logs. The moment there's a likely match, you'll receive an in-app notice and an email alert."
  }
];

const campusZones = [
  'Central Library',
  'Student Cafeteria',
  'Engineering Block',
  'Science Labs',
  'Sports Complex',
  'Auditorium',
  'Hostel Hub',
  'Campus Security Desk'
];

export default function LandingPage() {
  const [activeFaq, setActiveFaq] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const user = (() => {
    try { return JSON.parse(localStorage.getItem('campusfind_user')); } catch { return null; }
  })();
  const navigate = useNavigate();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const toggleFaq = (i) => {
    setActiveFaq(activeFaq === i ? null : i);
  };

  return (
    <div
      style={{
        background: 'var(--color-parchment)',
        color: 'var(--color-ink)',
        minHeight: '100vh',
        overflowX: 'hidden',
        fontFamily: 'var(--font-cursorgothic)',
      }}
    >
      <Navbar />

      {/* ── HERO SECTION ── */}
      <section
        style={{
          padding: '80px 24px 64px',
          maxWidth: '1300px',
          margin: '0 auto',
        }}
      >
        <div style={{ maxWidth: '820px' }}>
          <span
            style={{
              fontFamily: 'var(--font-berkeleymono)',
              fontSize: '12px',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: 'var(--color-ash)',
              display: 'inline-block',
              marginBottom: '16px',
            }}
          >
            CAMPUS LOST &amp; FOUND NETWORK · DIRECTORY
          </span>

          <h1
            style={{
              fontFamily: 'var(--font-cursorgothic)',
              fontSize: 'clamp(2.8rem, 6.5vw, 4.8rem)',
              fontWeight: 400,
              lineHeight: 1.05,
              color: 'var(--color-ink)',
              letterSpacing: '-0.025em',
              marginBottom: '18px',
            }}
          >
            Recover What Matters.
          </h1>

          <p
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 'clamp(1.2rem, 2.5vw, 1.55rem)',
              color: 'var(--color-driftwood)',
              lineHeight: 1.45,
              marginBottom: '32px',
              fontWeight: 400,
            }}
          >
            A calm, editorial campus directory. Report misplaced belongings, browse real-time inventory across zones, and verify claims with campus credentials.
          </p>

          {/* Quick Search */}
          <form
            onSubmit={handleSearchSubmit}
            style={{
              display: 'flex',
              alignItems: 'center',
              maxWidth: '560px',
              background: '#ffffff',
              border: '1px solid var(--color-stone)',
              borderRadius: '4px',
              padding: '3px 4px',
              marginBottom: '28px',
              boxShadow: 'var(--shadow-warm)',
            }}
          >
            <Search
              size={16}
              color="var(--color-ash)"
              style={{ marginLeft: '12px', flexShrink: 0 }}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by item name, building, or category..."
              style={{
                flex: 1,
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: 'var(--color-ink)',
                fontFamily: 'var(--font-cursorgothic)',
                fontSize: '14px',
                padding: '10px 12px',
              }}
            />
            <button
              type="submit"
              className="btn-primary"
              style={{ padding: '8px 16px', fontSize: '13px' }}
            >
              Search
            </button>
          </form>

          {/* Dual Action Group: One filled dark + One filled light */}
          <div
            style={{
              display: 'flex',
              gap: '12px',
              alignItems: 'center',
              flexWrap: 'wrap',
              marginBottom: '48px',
            }}
          >
            <Link
              to="/post-item"
              className="btn-primary"
              style={{ padding: '11px 20px', fontSize: '14px' }}
            >
              Report an Item
            </Link>
            <Link
              to="/search"
              className="btn-secondary"
              style={{ padding: '11px 20px', fontSize: '14px' }}
            >
              Browse Directory
              <ArrowRight size={14} style={{ marginLeft: '4px' }} />
            </Link>
          </div>
        </div>

        {/* ── PRODUCT MOCKUP CARD (From Design.md spec) ── */}
        <div
          style={{
            background: 'var(--color-bone)',
            borderRadius: '4px',
            border: '1px solid var(--color-stone)',
            boxShadow: 'var(--shadow-xl)',
            padding: '20px 24px 24px',
            marginTop: '20px',
          }}
        >
          {/* macOS window chrome */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingBottom: '16px',
              borderBottom: '1px solid var(--color-stone)',
              marginBottom: '16px',
            }}
          >
            <div style={{ display: 'flex', gap: '6px' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#cdcdc9' }} />
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#cdcdc9' }} />
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#cdcdc9' }} />
            </div>
            <span
              style={{
                fontFamily: 'var(--font-berkeleymono)',
                fontSize: '12px',
                color: 'var(--color-ash)',
              }}
            >
              campusfind.terminal // live-inventory.db
            </span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <span className="badge" style={{ fontSize: '10px' }}>STATUS: ONLINE</span>
            </div>
          </div>

          {/* Directory Mock Rows */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[
              { title: 'MacBook Air M2 13-inch (Space Gray)', zone: 'Central Library · 2nd Floor Study Cubicles', date: 'Today, 11:20 AM', cat: 'Electronics', status: 'found', badgeClass: 'badge-found' },
              { title: 'Black Leather Bifold Wallet with Student ID', zone: 'Student Cafeteria · South Counter', date: 'Yesterday', cat: 'Wallet', status: 'claimed', badgeClass: 'badge-claimed' },
              { title: 'Calculus Early Transcendentals Hardcover', zone: 'Engineering Block · Room 302', date: '2 days ago', cat: 'Books', status: 'available', badgeClass: 'badge-available' },
            ].map((item, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: '#ffffff',
                  border: '1px solid var(--color-stone)',
                  borderRadius: '4px',
                  padding: '12px 16px',
                  gap: '12px',
                  flexWrap: 'wrap',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: '240px' }}>
                  <span className={`badge ${item.badgeClass}`}>
                    {item.status}
                  </span>
                  <div>
                    <p style={{ margin: 0, fontSize: '13px', fontWeight: 500, color: 'var(--color-ink)' }}>
                      {item.title}
                    </p>
                    <p style={{ margin: '2px 0 0', fontSize: '12px', color: 'var(--color-ash)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <MapPin size={11} /> {item.zone}
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <span style={{ fontFamily: 'var(--font-berkeleymono)', fontSize: '11px', color: 'var(--color-driftwood)' }}>
                    {item.cat}
                  </span>
                  <span style={{ fontFamily: 'var(--font-berkeleymono)', fontSize: '11px', color: 'var(--color-ash)' }}>
                    {item.date}
                  </span>
                  <Link
                    to="/search"
                    style={{
                      fontSize: '12px',
                      color: 'var(--color-ember)',
                      textDecoration: 'none',
                      fontWeight: 500,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '2px',
                    }}
                  >
                    View <ArrowRight size={11} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CAMPUS ZONES TRUST STRIP (Design.md Logo Trust Tile row) ── */}
      <section
        style={{
          padding: '24px',
          maxWidth: '1300px',
          margin: '0 auto 64px',
        }}
      >
        <p
          style={{
            fontFamily: 'var(--font-berkeleymono)',
            fontSize: '11px',
            color: 'var(--color-ash)',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            marginBottom: '14px',
          }}
        >
          CONNECTED CAMPUS COVERAGE ZONES
        </p>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '8px',
          }}
        >
          {campusZones.map((zone, i) => (
            <div
              key={i}
              style={{
                background: 'var(--color-linen)',
                border: '1px solid var(--color-stone)',
                borderRadius: '4px',
                padding: '6px 14px',
                fontSize: '12px',
                color: 'var(--color-ink)',
                fontFamily: 'var(--font-cursorgothic)',
                fontWeight: 400,
              }}
            >
              {zone}
            </div>
          ))}
        </div>
      </section>

      {/* ── PROCESS / HOW IT WORKS ── */}
      <section
        style={{
          padding: '48px 24px 80px',
          maxWidth: '1300px',
          margin: '0 auto',
          borderTop: '1px solid var(--color-stone)',
        }}
      >
        <div style={{ maxWidth: '600px', marginBottom: '40px' }}>
          <p
            style={{
              fontFamily: 'var(--font-berkeleymono)',
              fontSize: '11px',
              textTransform: 'uppercase',
              color: 'var(--color-ash)',
              letterSpacing: '0.08em',
              marginBottom: '10px',
            }}
          >
            ARCHITECTURE // 3-STEP RECOVERY
          </p>
          <h2
            style={{
              fontSize: 'clamp(1.8rem, 3.5vw, 2.4rem)',
              color: 'var(--color-ink)',
              fontWeight: 400,
              letterSpacing: '-0.02em',
              lineHeight: 1.2,
            }}
          >
            How CampusFind Works
          </h2>
        </div>

        {/* 3 Step Cards Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '20px',
          }}
        >
          {[
            {
              num: '01',
              title: 'Report with Details',
              desc: 'Students record misplaced or recovered items with photos, precise building locations, and identifying details in the campus ledger.',
              icon: Shield,
            },
            {
              num: '02',
              title: 'Cross-Match Directory',
              desc: 'Live indexing matches descriptions and dates across campus zones. Found items automatically match with students seeking their belongings.',
              icon: Search,
            },
            {
              num: '03',
              title: 'Secure OTP Collection',
              desc: 'Visit the administration office for registered-email verification and an in-person identity check before item handover.',
              icon: Zap,
            },
          ].map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={idx}
                style={{
                  background: 'var(--color-bone)',
                  border: '1px solid var(--color-stone)',
                  borderRadius: '4px',
                  padding: '28px 24px',
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '8px',
                  }}
                >
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '4px',
                      background: 'var(--color-linen)',
                      border: '1px solid var(--color-stone)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Icon size={16} color="var(--color-ink)" />
                  </div>
                  <span
                    style={{
                      fontFamily: 'var(--font-berkeleymono)',
                      fontSize: '18px',
                      fontWeight: 500,
                      color: 'var(--color-mist)',
                    }}
                  >
                    {step.num}
                  </span>
                </div>

                <h3
                  style={{
                    fontSize: '17px',
                    fontWeight: 500,
                    color: 'var(--color-ink)',
                    margin: 0,
                  }}
                >
                  {step.title}
                </h3>
                <p
                  style={{
                    fontSize: '14px',
                    color: 'var(--color-driftwood)',
                    lineHeight: 1.6,
                    margin: 0,
                  }}
                >
                  {step.desc}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── FAQ ── */}
      <section
        style={{
          padding: '64px 24px 80px',
          maxWidth: '860px',
          margin: '0 auto',
          borderTop: '1px solid var(--color-stone)',
        }}
      >
        <div style={{ textAlign: 'left', marginBottom: '32px' }}>
          <p
            style={{
              fontFamily: 'var(--font-berkeleymono)',
              fontSize: '11px',
              textTransform: 'uppercase',
              color: 'var(--color-ash)',
              letterSpacing: '0.08em',
              marginBottom: '10px',
            }}
          >
            DOCUMENTATION // FREQUENTLY ASKED
          </p>
          <h2
            style={{
              fontSize: 'clamp(1.6rem, 3vw, 2.2rem)',
              color: 'var(--color-ink)',
              fontWeight: 400,
              letterSpacing: '-0.02em',
            }}
          >
            Frequently Asked Questions
          </h2>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {faqs.map((faq, i) => (
            <div
              key={i}
              style={{
                background: 'var(--color-bone)',
                border: '1px solid var(--color-stone)',
                borderRadius: '4px',
                overflow: 'hidden',
                transition: 'border-color 150ms ease',
              }}
            >
              <button
                onClick={() => toggleFaq(i)}
                style={{
                  width: '100%',
                  padding: '16px 20px',
                  background: 'none',
                  border: 'none',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  cursor: 'pointer',
                  textAlign: 'left',
                  gap: '16px',
                }}
              >
                <span
                  style={{
                    fontFamily: 'var(--font-cursorgothic)',
                    fontSize: '15px',
                    fontWeight: 400,
                    color: 'var(--color-ink)',
                    flex: 1,
                  }}
                >
                  {faq.q}
                </span>
                <ChevronDown
                  size={15}
                  color="var(--color-ash)"
                  style={{
                    transform: activeFaq === i ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 150ms ease',
                    flexShrink: 0,
                  }}
                />
              </button>

              {activeFaq === i && (
                <div
                  style={{
                    padding: '0 20px 18px',
                    color: 'var(--color-driftwood)',
                    fontSize: '14px',
                    lineHeight: 1.6,
                    borderTop: '1px solid var(--color-linen)',
                    paddingTop: '14px',
                  }}
                >
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── CALL TO ACTION ── */}
      <section
        style={{
          padding: '0 24px 96px',
          maxWidth: '1300px',
          margin: '0 auto',
        }}
      >
        <div
          style={{
            background: 'var(--color-bone)',
            border: '1px solid var(--color-stone)',
            borderRadius: '4px',
            padding: '56px 36px',
            textAlign: 'center',
            boxShadow: 'var(--shadow-warm)',
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-berkeleymono)',
              fontSize: '11px',
              color: 'var(--color-ash)',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              display: 'block',
              marginBottom: '12px',
            }}
          >
            START HERE
          </span>
          <h2
            style={{
              fontSize: 'clamp(1.8rem, 3.5vw, 2.4rem)',
              color: 'var(--color-ink)',
              fontWeight: 400,
              marginBottom: '16px',
              letterSpacing: '-0.02em',
            }}
          >
            Ready to find what you lost?
          </h2>
          <p
            style={{
              fontSize: '15px',
              color: 'var(--color-driftwood)',
              maxWidth: '520px',
              margin: '0 auto 32px',
              lineHeight: 1.6,
            }}
          >
            Join your campus peers. Report lost belongings, explore the public inventory, and ensure safe returns.
          </p>
          <div
            style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'center',
              flexWrap: 'wrap',
            }}
          >
            {!user && (
              <Link
                to="/register"
                className="btn-primary"
                style={{ padding: '11px 22px', fontSize: '14px' }}
              >
                Create Account
              </Link>
            )}
            <Link
              to="/search"
              className="btn-secondary"
              style={{ padding: '11px 22px', fontSize: '14px' }}
            >
              Browse Directory
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
