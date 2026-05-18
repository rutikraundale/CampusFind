import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Search, 
  ArrowRight, 
  MapPin, 
  Shield, 
  Zap, 
  Users, 
  Star, 
  TrendingUp, 
  Package, 
  CheckCircle, 
  Clock, 
  HelpCircle, 
  ChevronDown, 
  X, 
  Sparkles, 
  Filter,
  ArrowUpRight
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const stats = [
  { label: 'Verified Recoveries', value: '2,400+', icon: Package, color: '#6C63FF' },
  { label: 'Active Campus Members', value: '5,800+', icon: Users, color: '#4880FF' },
  { label: 'Resolution Rate', value: '94%', icon: TrendingUp, color: '#10B981' },
  { label: 'Logged Entries', value: '12K+', icon: CheckCircle, color: '#38BDF8' },
];

const categories = [
  { id: 'all', label: 'All Items' },
  { id: 'electronics', label: 'Electronics' },
  { id: 'wallet', label: 'Wallets & IDs' },
  { id: 'books', label: 'Books & Stationery' },
  { id: 'accessories', label: 'Accessories' }
];

const recentItems = [
  { 
    id: 1, 
    name: 'Black Leather Wallet', 
    category: 'wallet', 
    location: 'Library Block A (Level 2)', 
    time: '2 hrs ago', 
    status: 'found',
    desc: 'Black leather bi-fold wallet. Contains a transit pass and a college ID. Found near the quiet study booths.' 
  },
  { 
    id: 2, 
    name: 'Blue Noise Cancelling Headphones', 
    category: 'electronics', 
    location: 'Central Cafeteria', 
    time: '5 hrs ago', 
    status: 'lost',
    desc: 'Sony WH-1000XM4 headphones in a light grey carrying case. Left on one of the window side tables.' 
  },
  { 
    id: 3, 
    name: 'Student ID – CollegeID 2021CS045', 
    category: 'wallet', 
    location: 'Sports Complex Lobby', 
    time: '1 day ago', 
    status: 'found',
    desc: 'Official college ID card with registration number ending in CS045. Found near the indoor badminton court benches.' 
  },
  { 
    id: 4, 
    name: 'Silver Apple AirPods Case', 
    category: 'electronics', 
    location: 'Main Auditorium', 
    time: '1 day ago', 
    status: 'lost',
    desc: 'V2 wireless charging case for AirPods Pro. Has a tiny scratch on the metal hinge and a blue silicone loop attached.' 
  },
  { 
    id: 5, 
    name: 'Green Water Bottle (Sticker-Heavy)', 
    category: 'accessories', 
    location: 'Hostel D Common Room', 
    time: '2 days ago', 
    status: 'found',
    desc: 'HydroFlask style green metal bottle covered in various developer stickers (Figma, React, Git, VS Code). Found next to the pool table.' 
  },
  { 
    id: 6, 
    name: 'Mathematics Textbook (Arfken)', 
    category: 'books', 
    location: 'Block 3 Classroom 302', 
    time: '2 days ago', 
    status: 'lost',
    desc: 'Mathematical Methods for Physicists (7th Edition) by Arfken & Weber. Hardcover edition, slightly worn edges with pencil annotations.' 
  },
];

const faqs = [
  {
    q: 'How does CampusFind verify that I am the rightful owner of an item?',
    a: 'When you claim a found item, you are prompted to describe unique markers, upload identifying details, or provide proof like a student ID. If the verification is solid, an Admin approves it, and you get a secure one-time OTP via your registered college email to claim it at the desk.'
  },
  {
    q: 'Is there a fee for posting or retrieving lost items?',
    a: 'Absolutely not. CampusFind is 100% free and built specifically by and for the campus community to make student life easier and recover important belongings safely.'
  },
  {
    q: 'What should I do if I find someone else\'s lost item on campus?',
    a: 'Simply click "Report Item" (or "Report Found Item" in your portal), fill in the name, location found, and a short description. You can choose to hand it over to the college central desk or hold onto it until the owner contacts you.'
  },
  {
    q: 'How quickly will I get notified if my lost item is found?',
    a: 'Instantly! Our system constantly matches newly posted found items against active lost logs. The moment there\'s a likely match, you\'ll receive an in-app notice and an email alert.'
  }
];

export default function LandingPage() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [activeFaq, setActiveFaq] = useState(null);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/search');
    }
  };

  const filteredItems = recentItems.filter(item => {
    if (activeCategory === 'all') return true;
    return item.category === activeCategory;
  });

  const toggleFaq = (index) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  return (
    <div className="page-wrapper" style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      background: '#05070E', 
      color: '#F2F4F8',
      minHeight: '100vh',
      overflowX: 'hidden'
    }}>
      {/* ── Background Cyber Grid & Glows ── */}
      <div style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        backgroundImage: `
          linear-gradient(rgba(255, 255, 255, 0.015) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255, 255, 255, 0.015) 1px, transparent 1px)
        `,
        backgroundSize: '40px 40px',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'fixed',
        top: '-10%',
        left: '20%',
        width: '600px',
        height: '600px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(108, 99, 255, 0.1) 0%, transparent 70%)',
        zIndex: 0,
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'fixed',
        bottom: '10%',
        right: '10%',
        width: '500px',
        height: '500px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(72, 128, 255, 0.07) 0%, transparent 70%)',
        zIndex: 0,
        pointerEvents: 'none',
      }} />

      <Navbar />

      {/* ── HERO SECTION ── */}
      <section style={{ 
        position: 'relative',
        zIndex: 1,
        maxWidth: '1280px', 
        margin: '0 auto', 
        padding: '130px 24px 80px', 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        textAlign: 'center' 
      }}>
        {/* Cyber Pulse Indicator */}
        <div className="animate-fadeInUp" style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '10px',
          padding: '8px 18px',
          borderRadius: '9999px',
          background: 'rgba(10, 16, 32, 0.6)',
          border: '1px solid rgba(108, 99, 255, 0.3)',
          backdropFilter: 'blur(12px)',
          marginBottom: '32px',
          fontSize: '0.85rem',
          fontWeight: 600,
          color: '#AEB6C7',
          boxShadow: '0 0 20px rgba(108, 99, 255, 0.1)',
        }}>
          <span style={{ 
            display: 'block', 
            width: '8px', 
            height: '8px', 
            borderRadius: '50%', 
            background: '#10B981', 
            boxShadow: '0 0 10px #10B981',
            animation: 'pulse-glow 2s infinite'
          }} />
          <span style={{ letterSpacing: '0.05em', color: '#AEB6C7' }}>Campus Radar Active & Scanning</span>
          <Sparkles size={14} color="#6C63FF" style={{ marginLeft: '4px' }} />
        </div>

        {/* Space Grotesk Headline */}
        <h1 className="animate-fadeInUp delay-100" style={{
          fontFamily: 'Space Grotesk, sans-serif',
          fontSize: 'clamp(2.8rem, 7vw, 4.8rem)',
          fontWeight: 800,
          lineHeight: 1.1,
          letterSpacing: '-0.04em',
          color: '#F2F4F8',
          maxWidth: '900px',
          marginBottom: '24px',
        }}>
          Reclaim Your Gear.{' '}
          <span style={{ 
            background: 'linear-gradient(90deg, #6C63FF, #A78BFA, #4880FF)', 
            WebkitBackgroundClip: 'text', 
            WebkitTextFillColor: 'transparent',
            textShadow: '0 0 40px rgba(108, 99, 255, 0.2)'
          }}>
            Reconnect Your Campus.
          </span>
        </h1>

        <p className="animate-fadeInUp delay-200" style={{ 
          fontSize: '1.2rem', 
          color: '#AEB6C7', 
          maxWidth: '640px', 
          lineHeight: 1.65, 
          marginBottom: '44px' 
        }}>
          The high-tech lost & found network for college students. Report items, search logs instantly, and verify claims securely in real-time.
        </p>

        {/* Quick Actions Portal Buttons */}
        <div className="animate-fadeInUp delay-300" style={{ 
          display: 'flex', 
          gap: '20px', 
          flexWrap: 'wrap', 
          justifyContent: 'center', 
          marginBottom: '80px' 
        }}>
          <Link to="/post-item" className="btn-primary" style={{ 
            padding: '14px 34px', 
            fontSize: '1rem',
            background: 'linear-gradient(135deg, #6C63FF 0%, #4880FF 100%)',
            boxShadow: '0 0 30px rgba(108,99,255,0.3)',
          }}>
            Report Lost / Found Item
          </Link>
          <Link to="/search" className="btn-secondary" style={{ 
            padding: '14px 34px', 
            fontSize: '1rem',
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255,255,255,0.12)',
            backdropFilter: 'blur(10px)',
          }}>
            Browse Live Database
          </Link>
        </div>

        {/* Tech Glass Showcase Area */}
        <div className="animate-fadeInUp delay-400" style={{
          position: 'relative',
          width: '100%',
          maxWidth: '920px',
          background: 'linear-gradient(135deg, rgba(10, 16, 32, 0.7) 0%, rgba(5, 7, 14, 0.9) 100%)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: '24px',
          padding: '32px',
          backdropFilter: 'blur(24px)',
          boxShadow: '0 0 50px rgba(108, 99, 255, 0.15), 0 30px 60px rgba(0, 0, 0, 0.6)',
          overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '40px',
            background: 'rgba(255,255,255,0.02)',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
            display: 'flex',
            alignItems: 'center',
            padding: '0 18px',
            gap: '6px'
          }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#EF4444', display: 'inline-block' }} />
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#F59E0B', display: 'inline-block' }} />
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10B981', display: 'inline-block' }} />
            <span style={{ color: '#5A5E7A', fontSize: '0.75rem', fontFamily: 'Space Grotesk, sans-serif', marginLeft: '12px', letterSpacing: '0.1em' }}>
              CAMPUS_FIND_RADAR_PREVIEW.CF
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginTop: '24px' }}>
            {recentItems.slice(0, 3).map(item => (
              <div 
                key={item.id} 
                onClick={() => setSelectedItem(item)}
                style={{
                  padding: '20px', 
                  borderRadius: '16px',
                  background: 'rgba(255, 255, 255, 0.03)', 
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  position: 'relative',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.borderColor = 'rgba(108, 99, 255, 0.4)';
                  e.currentTarget.style.boxShadow = '0 0 30px rgba(108, 99, 255, 0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <span className={item.status === 'found' ? 'badge badge-success' : 'badge badge-warning'}>
                    {item.status}
                  </span>
                  <span style={{ fontSize: '0.78rem', color: '#AEB6C7', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Clock size={11} /> {item.time}
                  </span>
                </div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#F2F4F8', marginBottom: '8px', lineHeight: 1.4 }}>
                  {item.name}
                </h4>
                <p style={{ fontSize: '0.8rem', color: '#AEB6C7', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', marginBottom: '12px' }}>
                  {item.desc}
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '10px' }}>
                  <span style={{ fontSize: '0.75rem', color: '#5A5E7A', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <MapPin size={11} /> {item.location.split(' (')[0]}
                  </span>
                  <span style={{ fontSize: '0.78rem', color: '#6C63FF', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '2px' }}>
                    Preview <ArrowUpRight size={12} />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      

      {/* ── HOW IT WORKS (TECH FLOW) ── */}
      <section style={{ 
        position: 'relative',
        zIndex: 1,
        maxWidth: '1200px', 
        margin: '0 auto', 
        padding: '100px 24px' 
      }}>
        <div style={{ textAlign: 'center', marginBottom: '64px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 12px',
            borderRadius: '9999px',
            background: 'rgba(72,128,255,0.1)',
            border: '1px solid rgba(72,128,255,0.2)',
            fontSize: '0.78rem',
            fontWeight: 600,
            color: '#4880FF',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            marginBottom: '16px'
          }}>
            Protocol Workflow
          </div>
          <h2 style={{ 
            fontFamily: 'Space Grotesk, sans-serif', 
            fontSize: 'clamp(2rem, 5vw, 2.8rem)', 
            fontWeight: 700, 
            color: '#F2F4F8', 
            letterSpacing: '-0.03em', 
            marginBottom: '16px' 
          }}>
            How CampusFind Works
          </h2>
          <p style={{ color: '#AEB6C7', fontSize: '1.1rem', maxWidth: '580px', margin: '0 auto', lineHeight: 1.65 }}>
            A secure, automated matching ecosystem designed to safely connect items to their rightful owners.
          </p>
        </div>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
          gap: '32px',
          position: 'relative',
        }}>
          {/* Step 1 */}
          <div className="glass-card" style={{ 
            padding: '36px 28px', 
            position: 'relative',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <div style={{
              position: 'absolute',
              top: '20px',
              right: '24px',
              fontSize: '2.5rem',
              fontWeight: 900,
              fontFamily: 'Space Grotesk, sans-serif',
              color: 'rgba(108, 99, 255, 0.08)',
              userSelect: 'none'
            }}>01</div>
            <div style={{ 
              width: '48px', 
              height: '48px', 
              borderRadius: '14px', 
              background: 'rgba(108, 99, 255, 0.12)', 
              border: '1px solid rgba(108, 99, 255, 0.3)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              marginBottom: '24px',
              boxShadow: '0 0 15px rgba(108, 99, 255, 0.2)'
            }}>
              <Shield size={22} color="#6C63FF" />
            </div>
            <h3 style={{ fontWeight: 700, fontSize: '1.15rem', color: '#F2F4F8', marginBottom: '12px' }}>
              Report a Lost Item
            </h3>
            <p style={{ color: '#AEB6C7', fontSize: '0.9rem', lineHeight: 1.6 }}>
              Log lost or found items with immediate details, categories, pictures, and last-seen buildings inside your portal.
            </p>
          </div>

          {/* Step 2 */}
          <div className="glass-card" style={{ 
            padding: '36px 28px', 
            position: 'relative',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <div style={{
              position: 'absolute',
              top: '20px',
              right: '24px',
              fontSize: '2.5rem',
              fontWeight: 900,
              fontFamily: 'Space Grotesk, sans-serif',
              color: 'rgba(72, 128, 255, 0.08)',
              userSelect: 'none'
            }}>02</div>
            <div style={{ 
              width: '48px', 
              height: '48px', 
              borderRadius: '14px', 
              background: 'rgba(72, 128, 255, 0.12)', 
              border: '1px solid rgba(72, 128, 255, 0.3)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              marginBottom: '24px',
              boxShadow: '0 0 15px rgba(72, 128, 255, 0.2)'
            }}>
              <Search size={22} color="#4880FF" />
            </div>
            <h3 style={{ fontWeight: 700, fontSize: '1.15rem', color: '#F2F4F8', marginBottom: '12px' }}>
              Instant Scanning
            </h3>
            <p style={{ color: '#AEB6C7', fontSize: '0.9rem', lineHeight: 1.6 }}>
              Our engine immediately cross-references entries. If a student reports finding what you lost, you\'ll receive alerts.
            </p>
          </div>

          {/* Step 3 */}
          <div className="glass-card" style={{ 
            padding: '36px 28px', 
            position: 'relative',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <div style={{
              position: 'absolute',
              top: '20px',
              right: '24px',
              fontSize: '2.5rem',
              fontWeight: 900,
              fontFamily: 'Space Grotesk, sans-serif',
              color: 'rgba(167, 139, 250, 0.08)',
              userSelect: 'none'
            }}>03</div>
            <div style={{ 
              width: '48px', 
              height: '48px', 
              borderRadius: '14px', 
              background: 'rgba(167, 139, 250, 0.12)', 
              border: '1px solid rgba(167, 139, 250, 0.3)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              marginBottom: '24px',
              boxShadow: '0 0 15px rgba(167, 139, 250, 0.2)'
            }}>
              <Zap size={22} color="#A78BFA" />
            </div>
            <h3 style={{ fontWeight: 700, fontSize: '1.15rem', color: '#F2F4F8', marginBottom: '12px' }}>
              Claim & Verification
            </h3>
            <p style={{ color: '#AEB6C7', fontSize: '0.9rem', lineHeight: 1.6 }}>
              Provide ownership proof. Once approved by Admins, verify instantly at the collection desk with a secure email OTP.
            </p>
          </div>
        </div>
      </section>


      {/* ── FAQ SECTION ACCORDION ── */}
      <section style={{
        position: 'relative',
        zIndex: 1,
        maxWidth: '800px',
        margin: '0 auto 100px',
        padding: '0 24px'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 12px',
            borderRadius: '9999px',
            background: 'rgba(167, 139, 250, 0.1)',
            border: '1px solid rgba(167, 139, 250, 0.2)',
            fontSize: '0.78rem',
            fontWeight: 600,
            color: '#A78BFA',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            marginBottom: '16px'
          }}>
            Common Protocols
          </div>
          <h2 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '2rem', fontWeight: 700, color: '#F2F4F8' }}>
            Frequently Asked Questions
          </h2>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {faqs.map((faq, i) => (
            <div 
              key={i} 
              style={{
                background: 'rgba(10, 16, 32, 0.6)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '16px',
                overflow: 'hidden',
                transition: 'border-color 0.3s'
              }}
              onMouseEnter={(e) => {
                if (activeFaq !== i) e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
              }}
              onMouseLeave={(e) => {
                if (activeFaq !== i) e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
              }}
            >
              <button
                onClick={() => toggleFaq(i)}
                style={{
                  width: '100%',
                  padding: '20px 24px',
                  background: 'none',
                  border: 'none',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                <span style={{ 
                  fontSize: '0.98rem', 
                  fontWeight: 600, 
                  color: activeFaq === i ? '#6C63FF' : '#F2F4F8',
                  transition: 'color 0.3s'
                }}>
                  {faq.q}
                </span>
                <ChevronDown 
                  size={18} 
                  color={activeFaq === i ? '#6C63FF' : '#AEB6C7'} 
                  style={{ 
                    transform: activeFaq === i ? 'rotate(180deg)' : 'rotate(0deg)', 
                    transition: 'transform 0.3s, color 0.3s' 
                  }} 
                />
              </button>
              
              <div style={{
                maxHeight: activeFaq === i ? '300px' : '0',
                opacity: activeFaq === i ? '1' : '0',
                overflow: 'hidden',
                transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
              }}>
                <p style={{ 
                  padding: '0 24px 20px', 
                  color: '#AEB6C7', 
                  fontSize: '0.9rem', 
                  lineHeight: 1.65 
                }}>
                  {faq.a}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CALL TO ACTION BANNER ── */}
      <section style={{ 
        position: 'relative',
        zIndex: 1,
        maxWidth: '1200px', 
        margin: '0 auto', 
        padding: '0 24px 120px' 
      }}>
        <div style={{
          background: 'linear-gradient(135deg, rgba(108, 99, 255, 0.15) 0%, rgba(72, 128, 255, 0.08) 100%)',
          border: '1px solid rgba(108, 99, 255, 0.3)',
          borderRadius: '32px',
          padding: '72px 40px',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 0 50px rgba(108, 99, 255, 0.1), 0 20px 40px rgba(0, 0, 0, 0.4)'
        }}>
          <div style={{ 
            position: 'absolute', 
            top: '-100px', 
            right: '-100px', 
            width: '320px', 
            height: '320px', 
            borderRadius: '50%', 
            background: 'radial-gradient(circle, rgba(108, 99, 255, 0.2) 0%, transparent 70%)', 
            pointerEvents: 'none' 
          }} />
          <div style={{ 
            position: 'absolute', 
            bottom: '-100px', 
            left: '-100px', 
            width: '300px', 
            height: '300px', 
            borderRadius: '50%', 
            background: 'radial-gradient(circle, rgba(72, 128, 255, 0.15) 0%, transparent 70%)', 
            pointerEvents: 'none' 
          }} />

          <h2 style={{ 
            fontFamily: 'Space Grotesk, sans-serif', 
            fontSize: 'clamp(1.8rem, 5vw, 2.6rem)', 
            fontWeight: 800, 
            color: '#F2F4F8', 
            marginBottom: '20px', 
            letterSpacing: '-0.03em' 
          }}>
            Ready to Find Your Lost Belongs?
          </h2>
          <p style={{ 
            color: '#AEB6C7', 
            fontSize: '1.05rem', 
            maxWidth: '520px', 
            margin: '0 auto 40px', 
            lineHeight: 1.7 
          }}>
            Join thousands of active students and staff keeping our university campus connected and secure.
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/register" className="btn-primary" style={{ padding: '14px 40px', fontSize: '1rem' }}>
              Create Secure Profile
            </Link>
            <Link to="/search" className="btn-secondary" style={{ padding: '14px 40px', fontSize: '1rem' }}>
              Browse Items
            </Link>
          </div>
        </div>
      </section>

      {/* ── DETAILS POPUP MODAL ── */}
      {selectedItem && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(5, 7, 14, 0.85)',
          backdropFilter: 'blur(16px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px',
        }}
        onClick={() => setSelectedItem(null)}
        >
          <div style={{
            background: '#0A1020',
            border: '1px solid rgba(108, 99, 255, 0.4)',
            borderRadius: '24px',
            width: '100%',
            maxWidth: '540px',
            padding: '32px',
            boxShadow: '0 0 50px rgba(108, 99, 255, 0.25), 0 20px 40px rgba(0,0,0,0.7)',
            position: 'relative',
          }}
          onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={() => setSelectedItem(null)}
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '50%',
                width: '36px',
                height: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#AEB6C7',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#F2F4F8'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#AEB6C7'}
            >
              <X size={18} />
            </button>

            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '18px' }}>
              <span className={selectedItem.status === 'found' ? 'badge badge-success' : 'badge badge-warning'}>
                {selectedItem.status}
              </span>
              <span style={{ fontSize: '0.8rem', color: '#AEB6C7', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Clock size={12} /> {selectedItem.time}
              </span>
            </div>

            <h3 style={{ 
              fontFamily: 'Space Grotesk, sans-serif', 
              fontWeight: 700, 
              fontSize: '1.4rem', 
              color: '#F2F4F8', 
              marginBottom: '16px', 
              lineHeight: 1.3 
            }}>
              {selectedItem.name}
            </h3>

            <div style={{
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '16px',
              padding: '16px',
              marginBottom: '24px',
            }}>
              <p style={{ fontSize: '0.92rem', color: '#AEB6C7', lineHeight: 1.6, margin: 0 }}>
                {selectedItem.desc}
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '28px' }}>
              <div>
                <span style={{ fontSize: '0.78rem', color: '#5A5E7A', display: 'block', marginBottom: '4px' }}>
                  LOCATION
                </span>
                <span style={{ fontSize: '0.88rem', fontWeight: 600, color: '#F2F4F8', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <MapPin size={14} color="#6C63FF" /> {selectedItem.location}
                </span>
              </div>
              <div>
                <span style={{ fontSize: '0.78rem', color: '#5A5E7A', display: 'block', marginBottom: '4px' }}>
                  CATEGORY
                </span>
                <span className="badge badge-neutral" style={{ display: 'inline-flex' }}>
                  {selectedItem.category}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <Link 
                to="/register" 
                className="btn-primary" 
                style={{ flex: 1, padding: '12px 0', textDecoration: 'none', textAlign: 'center' }}
                onClick={() => setSelectedItem(null)}
              >
                Claim This Item
              </Link>
              <button 
                className="btn-secondary" 
                style={{ flex: 1, padding: '12px 0' }}
                onClick={() => setSelectedItem(null)}
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

