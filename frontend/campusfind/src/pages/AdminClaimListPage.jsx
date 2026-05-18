import { useState, useEffect } from 'react';
import { Search, Filter, Eye, ChevronLeft, ChevronRight, Download, MapPin, Calendar, User } from 'lucide-react';
import AdminSidebar from '../components/AdminSidebar';
import { claimsAPI } from '../services/api';

const STATUS_OPTS = ['All', 'Pending', 'Approved'];
const PAGE_SIZE = 6;

const statusBadge = (isVerified) => {
  if (isVerified) return <span className="badge badge-success">Approved</span>;
  return <span className="badge badge-warning">Pending</span>;
};

export default function AdminClaimListPage() {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState([]);

  useEffect(() => {
    async function fetchClaims() {
      try {
        const res = await claimsAPI.adminGetAll();
        setClaims(res.data || res || []);
      } catch (err) {
        console.error("Error fetching admin claims:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchClaims();
  }, []);

  const filtered = claims.filter(c => {
    const itemName = c.itemId?.title || 'Unknown Item';
    const claimantName = c.student_id?.username || 'Student';
    const claimId = c._id || '';
    
    const matchQ = !query || 
      itemName.toLowerCase().includes(query.toLowerCase()) || 
      claimantName.toLowerCase().includes(query.toLowerCase()) || 
      claimId.toLowerCase().includes(query.toLowerCase());
      
    const isVerifiedStatus = c.isVerified;
    const matchS = statusFilter === 'All' || 
      (statusFilter === 'Pending' && !isVerifiedStatus) || 
      (statusFilter === 'Approved' && isVerifiedStatus);
      
    return matchQ && matchS;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const toggleSelect = (id) => setSelected(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);
  const toggleAll = () => setSelected(selected.length === paged.length && paged.length > 0 ? [] : paged.map(c => c._id));

  const handleExportCSV = () => {
    if (claims.length === 0) return;
    const headers = ["Claim ID", "Item Name", "Claimant Name", "College ID", "Category", "Location", "Date", "Status"];
    const rows = claims.map(c => [
      c._id,
      c.itemId?.title || 'Unknown',
      c.student_id?.username || 'Student',
      c.student_id?.college_id || 'N/A',
      c.itemId?.category || 'N/A',
      c.itemId?.foundAt || 'N/A',
      new Date(c.createdAt).toLocaleDateString('en-IN'),
      c.isVerified ? 'Approved' : 'Pending'
    ]);
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(e => e.map(val => `"${val}"`).join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `campusfind_claims_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', position: 'relative', background: 'var(--bg-base)' }}>
      <div className="bg-mesh" />
      <AdminSidebar />

      <main style={{ flex: 1, padding: '36px 32px', overflowY: 'auto', position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ fontFamily: 'Space Grotesk,sans-serif', fontSize: '1.7rem', fontWeight: 700, color: '#F0F0FF', marginBottom: '6px' }}>Claim List</h1>
            <p style={{ color: '#9CA3C4', fontSize: '0.88rem' }}>
              {loading ? 'Loading...' : `${filtered.length} total claims · ${claims.filter(c => !c.isVerified).length} pending review`}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={handleExportCSV} disabled={claims.length === 0} className="btn-secondary" style={{ padding: '9px 18px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', opacity: claims.length === 0 ? 0.5 : 1 }}>
              <Download size={15} /> Export CSV
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '14px', marginBottom: '28px' }}>
          {[
            { label: 'Total', value: claims.length, color: '#6C63FF' },
            { label: 'Pending', value: claims.filter(c => !c.isVerified).length, color: '#F59E0B' },
            { label: 'Approved', value: claims.filter(c => c.isVerified).length, color: '#22C55E' },
          ].map(s => (
            <div key={s.label} className="glass-card" style={{ padding: '16px 20px' }}>
              <p style={{ fontSize: '1.6rem', fontWeight: 800, fontFamily: 'Space Grotesk,sans-serif', color: s.color }}>{s.value}</p>
              <p style={{ fontSize: '0.8rem', color: '#5A5E7A', fontWeight: 500 }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '220px', position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#5A5E7A' }} />
            <input type="text" placeholder="Search by claim ID, item, or claimant..." value={query} onChange={e => { setQuery(e.target.value); setPage(1); }}
              style={{ width: '100%', padding: '11px 14px 11px 42px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#F0F0FF', fontSize: '0.88rem', outline: 'none', fontFamily: 'Inter,sans-serif' }} />
          </div>
          <div style={{ display: 'flex', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', overflow: 'hidden' }}>
            {STATUS_OPTS.map(s => (
              <button key={s} onClick={() => { setStatusFilter(s); setPage(1); }} style={{ padding: '10px 16px', border: 'none', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600, transition: 'all 0.2s', background: statusFilter === s ? 'rgba(108,99,255,0.2)' : 'transparent', color: statusFilter === s ? '#A78BFA' : '#5A5E7A' }}>{s}</button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="glass-card" style={{ overflow: 'hidden' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 24px', color: '#9CA3C4' }}>Loading claims data...</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="cf-table">
                <thead>
                  <tr>
                    <th style={{ width: '40px' }}>
                      <input type="checkbox" checked={selected.length === paged.length && paged.length > 0} onChange={toggleAll} style={{ accentColor: '#6C63FF' }} />
                    </th>
                    <th>Claim ID</th>
                    <th>Item</th>
                    <th>Claimant</th>
                    <th>Category</th>
                    <th>Location</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paged.map(claim => (
                    <tr key={claim._id}>
                      <td><input type="checkbox" checked={selected.includes(claim._id)} onChange={() => toggleSelect(claim._id)} style={{ accentColor: '#6C63FF' }} /></td>
                      <td><span style={{ fontFamily: 'monospace', color: '#A78BFA', fontSize: '0.82rem', fontWeight: 600 }}>{claim._id?.substring(claim._id.length - 8).toUpperCase()}</span></td>
                      <td>
                        <p style={{ color: '#F0F0FF', fontWeight: 500, fontSize: '0.88rem', marginBottom: '2px' }}>{claim.itemId?.title || 'Unknown Item'}</p>
                        <p style={{ color: '#5A5E7A', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '3px' }}><MapPin size={11} />{claim.itemId?.foundAt || 'N/A'}</p>
                      </td>
                      <td>
                        <p style={{ color: '#F0F0FF', fontSize: '0.87rem', fontWeight: 500, marginBottom: '2px' }}>{claim.student_id?.username || 'Student'}</p>
                        <p style={{ color: '#5A5E7A', fontSize: '0.75rem' }}>{claim.student_id?.college_id || 'N/A'}</p>
                      </td>
                      <td><span className="badge badge-neutral" style={{ textTransform: 'capitalize' }}>{claim.itemId?.category || 'other'}</span></td>
                      <td style={{ fontSize: '0.82rem', color: '#9CA3C4' }}>{claim.itemId?.foundAt || 'N/A'}</td>
                      <td style={{ fontSize: '0.82rem', color: '#9CA3C4', whiteSpace: 'nowrap' }}><Calendar size={12} style={{ display: 'inline', marginRight: '3px' }} />{new Date(claim.createdAt).toLocaleDateString('en-IN')}</td>
                      <td>{statusBadge(claim.isVerified)}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <a href="/admin/verify-claims" style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '6px 12px', borderRadius: '7px', background: 'rgba(108,99,255,0.12)', border: '1px solid rgba(108,99,255,0.25)', color: '#A78BFA', fontSize: '0.78rem', fontWeight: 600, textDecoration: 'none', transition: 'all 0.2s', cursor: 'pointer' }}>
                            <Eye size={13} /> Review
                          </a>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {paged.length === 0 && (
                    <tr>
                      <td colSpan={9} style={{ textAlign: 'center', padding: '40px', color: '#5A5E7A' }}>No claims matched your search filters.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {!loading && totalPages > 1 && (
            <div style={{ padding: '16px 24px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <p style={{ color: '#5A5E7A', fontSize: '0.82rem' }}>
                Showing {(page - 1) * PAGE_SIZE + 1} to {Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length} claims
              </p>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => setPage(p => Math.max(p - 1, 1))} disabled={page === 1} className="btn-secondary" style={{ padding: '8px 12px', display: 'flex', alignItems: 'center', gap: '4px', opacity: page === 1 ? 0.4 : 1 }}>
                  <ChevronLeft size={16} /> Prev
                </button>
                <button onClick={() => setPage(p => Math.min(p + 1, totalPages))} disabled={page === totalPages} className="btn-secondary" style={{ padding: '8px 12px', display: 'flex', alignItems: 'center', gap: '4px', opacity: page === totalPages ? 0.4 : 1 }}>
                  Next <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
