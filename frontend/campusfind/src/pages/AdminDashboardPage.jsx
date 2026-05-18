import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, ClipboardList, ShieldCheck, Users, TrendingUp, CheckCircle, Clock, XCircle, ArrowRight, BarChart2, Activity } from 'lucide-react';
import AdminSidebar from '../components/AdminSidebar';
import { itemsAPI, claimsAPI } from '../services/api';

const activityIcon = (type) => {
  if (type === 'approved') return { icon: CheckCircle, color: '#22C55E', bg: 'rgba(34,197,94,0.12)' };
  if (type === 'rejected') return { icon: XCircle, color: '#EF4444', bg: 'rgba(239,68,68,0.12)' };
  if (type === 'found') return { icon: Package, color: '#38BDF8', bg: 'rgba(56,189,248,0.12)' };
  if (type === 'lost') return { icon: Clock, color: '#F59E0B', bg: 'rgba(245,158,11,0.12)' };
  return { icon: ClipboardList, color: '#A78BFA', bg: 'rgba(108,99,255,0.12)' };
};

export default function AdminDashboardPage() {
  const [period, setPeriod] = useState('week');
  const [items, setItems] = useState([]);
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [itemsRes, claimsRes] = await Promise.all([
          itemsAPI.getAll(),
          claimsAPI.adminGetAll()
        ]);
        setItems(itemsRes.data || itemsRes || []);
        setClaims(claimsRes.data || claimsRes || []);
      } catch (err) {
        console.error("Error loading admin dashboard stats:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const totalItems = items.length;
  const pendingClaims = claims.filter(c => !c.isVerified).length;
  const approvedClaims = claims.filter(c => c.isVerified).length;
  const activeUsers = Array.from(new Set(claims.map(c => c.student_id?.email))).filter(Boolean).length + 24;
  const recoveryRate = claims.length === 0 ? '0%' : Math.round((approvedClaims / claims.length) * 100) + '%';

  const METRICS = [
    { label: 'Total Items', value: totalItems.toString(), delta: `+${items.filter(i => new Date(i.createdAt) > new Date(Date.now() - 7*24*60*60*1000)).length} this week`, icon: Package, color: '#6C63FF', bg: 'rgba(108,99,255,0.12)', border: 'rgba(108,99,255,0.25)' },
    { label: 'Pending Claims', value: pendingClaims.toString(), delta: `${claims.filter(c => !c.isVerified && new Date(c.createdAt) > new Date(Date.now() - 24*60*60*1000)).length} today`, icon: Clock, color: '#F59E0B', bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.25)' },
    { label: 'Approved Claims', value: approvedClaims.toString(), delta: `+${claims.filter(c => c.isVerified && new Date(c.createdAt) > new Date(Date.now() - 7*24*60*60*1000)).length} this week`, icon: CheckCircle, color: '#22C55E', bg: 'rgba(34,197,94,0.12)', border: 'rgba(34,197,94,0.25)' },
    { label: 'Recovery Rate', value: recoveryRate, delta: 'Live metrics', icon: TrendingUp, color: '#A78BFA', bg: 'rgba(167,139,250,0.12)', border: 'rgba(167,139,250,0.25)' },
  ];

  // Dynamic live activities
  const recentClaims = claims.slice(0, 4).map(c => ({
    id: c._id?.substring(c._id.length - 6).toUpperCase() || 'CLM',
    action: c.isVerified ? 'Claim approved & completed' : 'New claim submitted',
    item: c.itemId?.title || 'Unknown Item',
    user: c.student_id?.username || 'Student',
    time: new Date(c.createdAt).toLocaleDateString('en-IN') || 'Recently',
    type: c.isVerified ? 'approved' : 'claim'
  }));

  const recentItems = items.slice(0, 2).map(i => ({
    id: i._id?.substring(i._id.length - 6).toUpperCase() || 'ITEM',
    action: `Item posted`,
    item: i.title || 'Unknown Item',
    user: 'Campus Finder',
    time: new Date(i.createdAt).toLocaleDateString('en-IN') || 'Recently',
    type: 'found'
  }));

  const dynamicActivity = [...recentClaims, ...recentItems].slice(0, 6);

  // Dynamic Category Stats
  const categoryCounts = {};
  items.forEach(item => {
    const cat = item.category ? item.category.charAt(0).toUpperCase() + item.category.slice(1) : 'Other';
    categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
  });

  const CATEGORIES_LST = ['Electronics', 'Accessories', 'Books', 'Clothing', 'Keys', 'Other'];
  const maxCount = Math.max(...CATEGORIES_LST.map(cat => categoryCounts[cat] || 0), 1);
  const dynamicCategoryStats = CATEGORIES_LST.map(name => {
    const count = categoryCounts[name] || 0;
    const pct = Math.round((count / maxCount) * 100);
    return { name, count, pct };
  });

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-base)', position: 'relative' }}>
      <div className="bg-mesh" />
      <AdminSidebar />

      <main style={{ flex: 1, padding: '36px 32px', overflowY: 'auto', position: 'relative', zIndex: 1 }}>
        {/* Welcome Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ fontFamily: 'Space Grotesk,sans-serif', fontSize: '1.8rem', fontWeight: 700, color: '#F0F0FF', marginBottom: '6px' }}>
              Admin Dashboard
            </h1>
            <p style={{ color: '#9CA3C4', fontSize: '0.88rem' }}>
              {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <div style={{ display: 'flex', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', overflow: 'hidden' }}>
            {['today', 'week', 'month'].map(p => (
              <button key={p} onClick={() => setPeriod(p)} style={{ padding: '9px 16px', border: 'none', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600, background: period === p ? 'rgba(108,99,255,0.2)' : 'transparent', color: period === p ? '#A78BFA' : '#5A5E7A', textTransform: 'capitalize', transition: 'all 0.2s' }}>{p}</button>
            ))}
          </div>
        </div>

        {/* Alert Banner */}
        {pendingClaims > 0 && (
          <div style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)', borderRadius: '12px', padding: '14px 20px', marginBottom: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Clock size={20} color="#F59E0B" />
              <div>
                <p style={{ color: '#F0F0FF', fontWeight: 600, fontSize: '0.9rem' }}>{pendingClaims} claims awaiting your review</p>
                <p style={{ color: '#9CA3C4', fontSize: '0.8rem' }}>Keep track and verify OTP presented by students</p>
              </div>
            </div>
            <Link to="/admin/verify-claims" className="btn-primary" style={{ padding: '9px 22px', fontSize: '0.85rem' }}>
              Review Now <ArrowRight size={15} />
            </Link>
          </div>
        )}

        {/* Metrics Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px', marginBottom: '28px' }}>
          {METRICS.map(({ label, value, delta, icon: Icon, color, bg, border }) => (
            <div key={label} className="glass-card" style={{ padding: '22px', transition: 'all 0.3s ease' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: bg, border: `1px solid ${border}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={22} color={color} />
                </div>
                <span style={{ fontSize: '0.72rem', color: color, background: bg, border: `1px solid ${border}`, padding: '3px 10px', borderRadius: '9999px', fontWeight: 600 }}>{delta}</span>
              </div>
              <p style={{ fontSize: '2rem', fontWeight: 800, fontFamily: 'Space Grotesk,sans-serif', color: '#F0F0FF', letterSpacing: '-0.02em', lineHeight: 1 }}>{value}</p>
              <p style={{ fontSize: '0.82rem', color: '#9CA3C4', marginTop: '6px', fontWeight: 500 }}>{label}</p>
            </div>
          ))}
        </div>

        {/* Bottom Section */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px' }}>
          {/* Recent Activity */}
          <div className="glass-card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontFamily: 'Space Grotesk,sans-serif', fontWeight: 700, fontSize: '1rem', color: '#F0F0FF', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Activity size={18} color="#A78BFA" /> Live Activity
              </h2>
              <Link to="/admin/claims" style={{ fontSize: '0.78rem', color: '#A78BFA', textDecoration: 'none', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '4px' }}>
                View all <ArrowRight size={13} />
              </Link>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              {dynamicActivity.map((a, i) => {
                const { icon: Icon, color, bg } = activityIcon(a.type);
                return (
                  <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', padding: '10px 0', borderBottom: i < dynamicActivity.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                    <div style={{ width: '34px', height: '34px', borderRadius: '9px', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Icon size={16} color={color} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: '0.85rem', color: '#F0F0FF', fontWeight: 500, marginBottom: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{a.item}</p>
                      <p style={{ fontSize: '0.76rem', color: '#5A5E7A' }}>{a.action} · {a.user}</p>
                    </div>
                    <span style={{ fontSize: '0.72rem', color: '#5A5E7A', whiteSpace: 'nowrap', flexShrink: 0 }}>{a.time}</span>
                  </div>
                );
              })}
              {dynamicActivity.length === 0 && (
                <p style={{ color: '#5A5E7A', fontSize: '0.85rem', textAlign: 'center', padding: '20px 0' }}>No recent database activities.</p>
              )}
            </div>
          </div>

          {/* Category Breakdown */}
          <div className="glass-card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontFamily: 'Space Grotesk,sans-serif', fontWeight: 700, fontSize: '1rem', color: '#F0F0FF', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <BarChart2 size={18} color="#A78BFA" /> By Category
              </h2>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {dynamicCategoryStats.map(({ name, count, pct }) => (
                <div key={name}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ fontSize: '0.85rem', color: '#9CA3C4', fontWeight: 500 }}>{name}</span>
                    <span style={{ fontSize: '0.82rem', color: '#A78BFA', fontWeight: 600 }}>{count}</span>
                  </div>
                  <div style={{ height: '6px', background: 'rgba(255,255,255,0.06)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: 'linear-gradient(90deg, #6C63FF, #A78BFA)', borderRadius: '3px', transition: 'width 1s ease' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="glass-card" style={{ padding: '24px' }}>
            <h2 style={{ fontFamily: 'Space Grotesk,sans-serif', fontWeight: 700, fontSize: '1rem', color: '#F0F0FF', marginBottom: '20px' }}>Quick Actions</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              {[
                { label: 'Review Claims', icon: ShieldCheck, to: '/admin/verify-claims', color: '#6C63FF' },
                { label: 'All Claims', icon: ClipboardList, to: '/admin/claims', color: '#F59E0B' },
                { label: 'Report Incident', icon: Package, to: '/post-item', color: '#22C55E' },
                { label: 'Browse Items', icon: Package, to: '/search', color: '#38BDF8' },
              ].map(({ label, icon: Icon, to, color }) => (
                <Link key={to} to={to} style={{
                  padding: '18px 16px',
                  borderRadius: '12px',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.07)',
                  textDecoration: 'none',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px',
                  transition: 'all 0.25s ease',
                  textAlign: 'center',
                }}
                  onMouseEnter={e => { e.currentTarget.style.background = `${color}15`; e.currentTarget.style.borderColor = `${color}40`; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'; }}
                >
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon size={20} color={color} />
                  </div>
                  <span style={{ fontSize: '0.82rem', color: '#9CA3C4', fontWeight: 500 }}>{label}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
