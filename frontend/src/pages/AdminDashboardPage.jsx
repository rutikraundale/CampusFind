import { useState, useEffect, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Package, ClipboardList, ShieldCheck, TrendingUp, CheckCircle, Clock, ArrowRight, BarChart2, Activity } from 'lucide-react';
import AdminSidebar from '../components/AdminSidebar';
import AdminMasthead from '../components/AdminMasthead';
import { itemsAPI, claimsAPI } from '../services/api';

export default function AdminDashboardPage() {
  const location = useLocation();
  const [period, setPeriod] = useState('week');
  const [items, setItems] = useState([]);
  const [claims, setClaims] = useState([]);

  useEffect(() => {
    async function loadData() {
      try {
        const [itemsRes, claimsRes] = await Promise.all([
          itemsAPI.adminGetAll(),
          claimsAPI.adminGetAll()
        ]);
        setItems(itemsRes.data || itemsRes || []);
        setClaims(claimsRes.data || claimsRes || []);
      } catch (err) {
        console.error("Error loading admin dashboard stats:", err);
      }
    }
    loadData();
  }, []);

  const foundItems = items.filter((item) => (item.reportType || 'found') === 'found');
  const availableItems = foundItems.filter((item) => item.status === 'available').length;

  const metrics = useMemo(() => {
    const lostReports = items.filter((item) => item.reportType === 'lost').length;
    const foundReports = items.filter((item) => (item.reportType || 'found') === 'found');
    const available = foundReports.filter((item) => item.status === 'available').length;
    const handedOver = foundReports.filter((item) => item.status === 'claimed').length;
    const totalItems = items.length;

    // Stable week/day cutoffs based on item dates
    return [
      { label: 'Total Items Indexed', value: totalItems.toString(), delta: 'Directory Log', icon: Package },
      { label: 'Available for Handover', value: available.toString(), delta: 'In-Person Process', icon: Clock },
      { label: 'Handed Over', value: handedOver.toString(), delta: 'Confirmed', icon: CheckCircle },
      { label: 'Lost Item Reports', value: lostReports.toString(), delta: 'Open Reports', icon: TrendingUp },
    ];
  }, [items]);

  // Live activities
  const recentClaims = claims.slice(0, 4).map(c => ({
    id: c._id?.substring(c._id.length - 6).toUpperCase() || 'CLM',
    action: c.isVerified ? 'Claim approved' : 'Claim submitted',
    item: c.itemId?.title || 'Unknown Item',
    user: c.student_id?.username || 'Student',
    time: new Date(c.createdAt).toLocaleDateString('en-IN') || 'Recent',
    type: c.isVerified ? 'approved' : 'claim'
  }));

  const recentItems = items.slice(0, 2).map(i => ({
    id: i._id?.substring(i._id.length - 6).toUpperCase() || 'ITEM',
    action: 'Item reported',
    item: i.title || 'Unknown Item',
    user: 'Campus Finder',
    time: new Date(i.createdAt).toLocaleDateString('en-IN') || 'Recent',
    type: 'found'
  }));

  const dynamicActivity = [...recentClaims, ...recentItems].slice(0, 6);

  // Category Stats
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
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--color-parchment)', color: 'var(--color-ink)' }}>
      <AdminSidebar />

      <main style={{ flex: 1, minWidth: 0, padding: '28px 32px 60px', overflowY: 'auto'  }}>
        <AdminMasthead />
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            
            <p style={{ color: 'var(--color-driftwood)', fontSize: '13px', margin: 0 }}>
              {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>

          {location.state?.notice && (
            <div role="status" style={{ background: 'var(--color-bone)', border: '1px solid var(--color-stone)', borderRadius: '4px', padding: '12px 16px', marginBottom: '20px', color: 'var(--color-ink)', fontSize: '13px' }}>
              {location.state.notice}
            </div>
          )}
          
          <div style={{ display: 'flex', background: 'var(--color-linen)', border: '1px solid var(--color-stone)', borderRadius: '4px', overflow: 'hidden', padding: '2px' }}>
            {['today', 'week', 'month'].map(p => (
              <button 
                key={p} 
                onClick={() => setPeriod(p)} 
                style={{ 
                  padding: '6px 12px', 
                  border: 'none', 
                  cursor: 'pointer', 
                  fontSize: '12px', 
                  fontWeight: period === p ? 500 : 400, 
                  borderRadius: '3px',
                  background: period === p ? '#ffffff' : 'transparent', 
                  color: 'var(--color-ink)', 
                  textTransform: 'capitalize', 
                  transition: 'all 150ms ease',
                  fontFamily: 'var(--font-cursorgothic)',
                  boxShadow: period === p ? 'var(--shadow-warm)' : 'none',
                }}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Pending Claims Alert */}
        {availableItems > 0 && (
          <div style={{ 
            background: 'var(--color-bone)', 
            border: '1px solid var(--color-stone)', 
            borderRadius: '4px', 
            padding: '16px 20px', 
            marginBottom: '24px', 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            flexWrap: 'wrap', 
            gap: '12px',
            boxShadow: 'var(--shadow-warm)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Clock size={18} color="var(--color-amber)" />
              <div>
                <p style={{ color: 'var(--color-ink)', fontWeight: 500, fontSize: '14px', margin: 0 }}>
                  {availableItems} found items available for handover
                </p>
                <p style={{ color: 'var(--color-driftwood)', fontSize: '13px', margin: '2px 0 0' }}>
                  Confirm the student’s registered email, then record the in-person identity check and handover
                </p>
              </div>
            </div>
            <Link to="/admin/handover" className="btn-primary" style={{ padding: '7px 14px', fontSize: '13px' }}>
              Open Handover Desk <ArrowRight size={13} />
            </Link>
          </div>
        )}

        {/* Metrics Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px', marginBottom: '28px' }}>
          {metrics.map((m) => {
            const MetricIcon = m.icon;
            return (
              <div key={m.label} style={{ 
                background: 'var(--color-bone)', 
                border: '1px solid var(--color-stone)', 
                borderRadius: '4px', 
                padding: '20px', 
                boxShadow: 'var(--shadow-warm)',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '4px', background: 'var(--color-linen)', border: '1px solid var(--color-stone)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <MetricIcon size={16} color="var(--color-ink)" />
                  </div>
                  <span className="badge" style={{ fontSize: '10px' }}>{m.delta}</span>
                </div>
                <p style={{ fontSize: '2rem', fontWeight: 400, fontFamily: 'var(--font-cursorgothic)', color: 'var(--color-ink)', lineHeight: 1, margin: '0 0 6px', letterSpacing: '-0.02em' }}>
                  {m.value}
                </p>
                <p style={{ fontSize: '13px', color: 'var(--color-driftwood)', margin: 0 }}>{m.label}</p>
              </div>
            );
          })}
        </div>

        {/* Bottom Section */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
          {/* Recent Activity */}
          <div style={{ background: 'var(--color-bone)', border: '1px solid var(--color-stone)', borderRadius: '4px', padding: '22px', boxShadow: 'var(--shadow-warm)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <h2 style={{ fontWeight: 500, fontSize: '15px', color: 'var(--color-ink)', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                <Activity size={15} color="var(--color-ash)" /> Recent Activity
              </h2>
              <Link to="/admin/claims" style={{ fontSize: '12px', color: 'var(--color-ember)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '3px', fontWeight: 500 }}>
                View all <ArrowRight size={12} />
              </Link>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {dynamicActivity.map((a, i) => (
                <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'center', padding: '10px 0', borderBottom: i < dynamicActivity.length - 1 ? '1px solid var(--color-linen)' : 'none' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '4px', background: 'var(--color-linen)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <ClipboardList size={13} color="var(--color-ink)" />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: '13px', color: 'var(--color-ink)', fontWeight: 500, margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{a.item}</p>
                    <p style={{ fontSize: '12px', color: 'var(--color-ash)', margin: '2px 0 0' }}>{a.action} · {a.user}</p>
                  </div>
                  <span style={{ fontSize: '11px', color: 'var(--color-ash)', whiteSpace: 'nowrap', flexShrink: 0, fontFamily: 'var(--font-berkeleymono)' }}>{a.time}</span>
                </div>
              ))}
              {dynamicActivity.length === 0 && (
                <p style={{ color: 'var(--color-ash)', fontSize: '13px', textAlign: 'center', padding: '24px 0' }}>No recent activity.</p>
              )}
            </div>
          </div>

          {/* Category Breakdown */}
          <div style={{ background: 'var(--color-bone)', border: '1px solid var(--color-stone)', borderRadius: '4px', padding: '22px', boxShadow: 'var(--shadow-warm)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <h2 style={{ fontWeight: 500, fontSize: '15px', color: 'var(--color-ink)', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                <BarChart2 size={15} color="var(--color-ash)" /> Inventory by Category
              </h2>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {dynamicCategoryStats.map(({ name, count, pct }) => (
                <div key={name}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontSize: '13px', color: 'var(--color-driftwood)' }}>{name}</span>
                    <span style={{ fontSize: '12px', color: 'var(--color-ink)', fontFamily: 'var(--font-berkeleymono)' }}>{count}</span>
                  </div>
                  <div style={{ height: '4px', background: 'var(--color-linen)', borderRadius: '2px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: 'var(--color-ink)', borderRadius: '2px', transition: 'width 0.6s ease' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div style={{ background: 'var(--color-bone)', border: '1px solid var(--color-stone)', borderRadius: '4px', padding: '22px', boxShadow: 'var(--shadow-warm)' }}>
            <h2 style={{ fontWeight: 500, fontSize: '15px', color: 'var(--color-ink)', marginBottom: '16px', margin: 0 }}>Console Actions</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '14px' }}>
              {[
                { label: 'Report Item', icon: Package, to: '/admin/report' },
                { label: 'Physical Handover', icon: ShieldCheck, to: '/admin/handover' },
                { label: 'Item Registry', icon: Package, to: '/admin/records' },
                { label: 'Claims Ledger', icon: ClipboardList, to: '/admin/claims' },
              ].map((action) => {
                const ActionIcon = action.icon;
                return (
                  <Link key={action.to} to={action.to} style={{
                    padding: '14px 10px',
                    borderRadius: '4px',
                    background: 'var(--color-parchment)',
                    border: '1px solid var(--color-stone)',
                    textDecoration: 'none',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
                    transition: 'all 150ms ease',
                    textAlign: 'center',
                  }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--color-border-strong)'; e.currentTarget.style.background = 'var(--color-linen)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--color-stone)'; e.currentTarget.style.background = 'var(--color-parchment)'; }}
                  >
                    <ActionIcon size={16} color="var(--color-ink)" strokeWidth={1.8} />
                    <span style={{ fontSize: '12px', color: 'var(--color-ink)', fontWeight: 500 }}>{action.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
