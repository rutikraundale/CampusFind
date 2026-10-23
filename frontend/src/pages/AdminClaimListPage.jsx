import { useState, useEffect } from 'react';
import { Search, ChevronLeft, ChevronRight, Download, MapPin, Calendar } from 'lucide-react';
import AdminSidebar from '../components/AdminSidebar';
import AdminMasthead from '../components/AdminMasthead';
import { claimsAPI } from '../services/api';

const STATUS_OPTS = ['All', 'Pending', 'Approved', 'Handed Over'];
const PAGE_SIZE = 6;
const getClaimStatus = (claim) => (
  claim.workflow === 'admin_handover' && claim.handoverStatus === 'completed' && claim.handoverConfirmed
    ? 'Handed Over'
    : claim.isVerified ? 'Approved' : 'Pending'
);

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
    const adminEmail = c.processByWhichAdmin?.email || '';
    
    const matchQ = !query || 
      itemName.toLowerCase().includes(query.toLowerCase()) || 
      claimantName.toLowerCase().includes(query.toLowerCase()) || 
      adminEmail.toLowerCase().includes(query.toLowerCase()) ||
      claimId.toLowerCase().includes(query.toLowerCase());
      
    const claimStatus = getClaimStatus(c);
    const matchS = statusFilter === 'All' || 
      claimStatus === statusFilter;
      
    return matchQ && matchS;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE) || 1;
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const toggleSelect = (id) => setSelected(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);
  const toggleAll = () => setSelected(selected.length === paged.length && paged.length > 0 ? [] : paged.map(c => c._id));

  const handleExportCSV = () => {
    if (claims.length === 0) return;
    const headers = ["Claim ID", "Record Type", "Item Name", "Claimant Name", "College ID", "Category", "Location", "Date", "Status", "Processed By"];
    const rows = claims.map(c => [
      c._id,
      c.workflow === 'admin_handover' ? 'Physical handover' : 'Student claim',
      c.itemId?.title || 'Unknown',
      c.student_id?.username || 'Student',
      c.student_id?.college_id || 'N/A',
      c.itemId?.category || 'N/A',
      c.itemId?.foundAt || 'N/A',
      new Date(c.handoverConfirmedAt || c.createdAt).toLocaleDateString('en-IN'),
      getClaimStatus(c),
      c.processByWhichAdmin?.email || '—',
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
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--color-parchment)', color: 'var(--color-ink)' }}>
      <AdminSidebar />

      <main style={{ flex: 1, minWidth: 0, padding: '28px 32px 60px', overflowY: 'auto' }}>
        <AdminMasthead />
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <span style={{ fontFamily: 'var(--font-berkeleymono)', fontSize: '11px', color: 'var(--color-ash)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '4px' }}>
              RECORDS // LEDGER
            </span>
            <h1 style={{ fontFamily: 'var(--font-cursorgothic)', fontSize: '1.85rem', fontWeight: 400, color: 'var(--color-ink)', marginBottom: '4px', letterSpacing: '-0.02em' }}>
              Claims Ledger
            </h1>
            <p style={{ color: 'var(--color-driftwood)', fontSize: '13px', margin: 0 }}>
              {loading ? 'Loading...' : `${filtered.length} total records · ${claims.filter(c => getClaimStatus(c) === 'Handed Over').length} handed over by admin`}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button 
              onClick={handleExportCSV} 
              disabled={claims.length === 0} 
              className="btn-secondary" 
              style={{ padding: '8px 14px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', opacity: claims.length === 0 ? 0.45 : 1 }}
            >
              <Download size={14} /> Export CSV
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px', marginBottom: '24px' }}>
          {[
            { label: 'Total Claims', value: claims.length },
            { label: 'Pending Review', value: claims.filter(c => getClaimStatus(c) === 'Pending').length },
            { label: 'Approved Claims', value: claims.filter(c => getClaimStatus(c) === 'Approved').length },
            { label: 'Admin Handovers', value: claims.filter(c => getClaimStatus(c) === 'Handed Over').length },
          ].map(s => (
            <div key={s.label} style={{ background: 'var(--color-bone)', border: '1px solid var(--color-stone)', borderRadius: '4px', padding: '16px 20px', boxShadow: 'var(--shadow-warm)' }}>
              <p style={{ fontSize: '1.7rem', fontWeight: 400, fontFamily: 'var(--font-cursorgothic)', color: 'var(--color-ink)', margin: 0, lineHeight: 1, letterSpacing: '-0.02em' }}>{s.value}</p>
              <p style={{ fontSize: '11px', color: 'var(--color-ash)', margin: '6px 0 0', textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: 'var(--font-berkeleymono)' }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '18px', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '220px', position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-ash)' }} />
            <input 
              type="text" 
              placeholder="Search claim ID, item, claimant, or admin..." 
              value={query} 
              onChange={e => { setQuery(e.target.value); setPage(1); }}
              className="form-input"
              style={{ paddingLeft: '38px', background: '#ffffff', fontSize: '13px' }} 
            />
          </div>
          <div style={{ display: 'flex', background: 'var(--color-linen)', border: '1px solid var(--color-stone)', borderRadius: '4px', overflow: 'hidden', padding: '2px' }}>
            {STATUS_OPTS.map(s => (
              <button 
                key={s} 
                onClick={() => { setStatusFilter(s); setPage(1); }} 
                style={{ 
                  padding: '6px 14px', 
                  border: 'none', 
                  cursor: 'pointer', 
                  fontSize: '12px', 
                  fontWeight: statusFilter === s ? 500 : 400, 
                  borderRadius: '3px',
                  transition: 'all 150ms ease', 
                  background: statusFilter === s ? '#ffffff' : 'transparent', 
                  color: 'var(--color-ink)',
                  fontFamily: 'var(--font-cursorgothic)',
                  boxShadow: statusFilter === s ? 'var(--shadow-warm)' : 'none',
                }}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Table Container */}
        <div style={{ background: 'var(--color-bone)', border: '1px solid var(--color-stone)', borderRadius: '4px', overflow: 'hidden', boxShadow: 'var(--shadow-warm)' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 24px', color: 'var(--color-ash)', fontFamily: 'var(--font-berkeleymono)' }}>Loading claims data...</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="cf-table">
                <thead>
                  <tr>
                    <th style={{ width: '40px' }}>
                      <input 
                        type="checkbox" 
                        checked={selected.length === paged.length && paged.length > 0} 
                        onChange={toggleAll} 
                        style={{ accentColor: 'var(--color-ink)' }} 
                      />
                    </th>
                    <th>Claim / Handover ID</th>
                    <th>Item</th>
                    <th>Claimant</th>
                    <th>Category</th>
                    <th>Location</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Processed By</th>
                  </tr>
                </thead>
                <tbody>
                  {paged.map(claim => (
                    <tr key={claim._id}>
                      <td>
                        <input 
                          type="checkbox" 
                          checked={selected.includes(claim._id)} 
                          onChange={() => toggleSelect(claim._id)} 
                          style={{ accentColor: 'var(--color-ink)' }} 
                        />
                      </td>
                      <td>
                        <span style={{ fontFamily: 'var(--font-berkeleymono)', color: 'var(--color-ink)', fontSize: '12px' }}>
                          {claim._id?.substring(claim._id.length - 8).toUpperCase()}
                        </span>
                      </td>
                      <td>
                        <p style={{ color: 'var(--color-ink)', fontWeight: 500, fontSize: '13px', margin: 0 }}>
                          {claim.itemId?.title || 'Unknown Item'}
                        </p>
                        <p style={{ color: 'var(--color-ash)', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '3px', margin: '2px 0 0' }}>
                          <MapPin size={10} />{claim.itemId?.foundAt || 'N/A'}
                        </p>
                      </td>
                      <td>
                        <p style={{ color: 'var(--color-ink)', fontSize: '13px', fontWeight: 500, margin: 0 }}>
                          {claim.student_id?.username || 'Student'}
                        </p>
                        <p style={{ color: 'var(--color-ash)', fontSize: '11px', margin: '2px 0 0', fontFamily: 'var(--font-berkeleymono)' }}>
                          {claim.student_id?.college_id || 'N/A'}
                        </p>
                      </td>
                      <td><span className="badge" style={{ fontSize: '10px' }}>{claim.itemId?.category || 'other'}</span></td>
                      <td style={{ fontSize: '13px', color: 'var(--color-driftwood)' }}>{claim.itemId?.foundAt || 'N/A'}</td>
                      <td style={{ fontSize: '12px', color: 'var(--color-ash)', whiteSpace: 'nowrap', fontFamily: 'var(--font-berkeleymono)' }}>
                        {new Date(claim.handoverConfirmedAt || claim.createdAt).toLocaleDateString('en-IN')}
                      </td>
                      <td>
                        <span className={`badge ${getClaimStatus(claim) === 'Pending' ? 'badge-claimed' : 'badge-found'}`}>
                          {getClaimStatus(claim)}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontSize: '12px', color: 'var(--color-driftwood)' }}>
                          {claim.processByWhichAdmin?.email || (claim.workflow === 'admin_handover' ? 'Admin' : 'Student-submitted')}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {paged.length === 0 && (
                    <tr>
                      <td colSpan={9} style={{ textAlign: 'center', padding: '40px', color: 'var(--color-ash)' }}>
                        No claims matched your search filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 20px', borderTop: '1px solid var(--color-stone)' }}>
              <span style={{ fontSize: '12px', color: 'var(--color-ash)', fontFamily: 'var(--font-berkeleymono)' }}>
                Page {page} of {totalPages}
              </span>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="btn-secondary"
                  style={{ padding: '5px 10px', fontSize: '12px' }}
                >
                  <ChevronLeft size={13} /> Prev
                </button>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="btn-secondary"
                  style={{ padding: '5px 10px', fontSize: '12px' }}
                >
                  Next <ChevronRight size={13} />
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
