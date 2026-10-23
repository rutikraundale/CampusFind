import { useEffect, useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import AdminMasthead from '../components/AdminMasthead';
import AdminSidebar from '../components/AdminSidebar';
import { itemsAPI } from '../services/api';

const dateLabel = (date) => date ? new Date(date).toLocaleDateString() : '—';

export default function AdminItemRecordsPage() {
  const [items, setItems] = useState([]);
  const [query, setQuery] = useState('');
  const [reportType, setReportType] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    itemsAPI.adminGetAll()
      .then((response) => {
        if (active) setItems(response.data || []);
      })
      .catch((requestError) => {
        if (active) setError(requestError.message || 'Could not load item records.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const filteredItems = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return items.filter((item) => {
      const type = item.reportType || 'found';
      const matchesType = reportType === 'all' || type === reportType;
      const matchesQuery = !normalizedQuery || [
        item.title,
        item.description,
        item.category,
        item.foundAt,
        item.contactEmail,
      ].some((value) => value?.toLowerCase().includes(normalizedQuery));
      return matchesType && matchesQuery;
    });
  }, [items, query, reportType]);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--color-parchment)', color: 'var(--color-ink)' }}>
      <AdminSidebar />
      <main style={{ flex: 1, minWidth: 0, padding: '28px 32px 60px', overflowY: 'auto' }}>
        <AdminMasthead />
        <div style={{ marginBottom: '22px' }}>
          <h2 style={{ margin: '0 0 5px', font: '400 24px var(--font-cursorgothic)' }}>Item registry</h2>
          <p style={{ margin: 0, color: 'var(--color-driftwood)', fontSize: '13px' }}>
            Administrative records for items reported lost or found.
          </p>
        </div>

        {error && <p role="alert" style={{ color: 'var(--color-crimson)', fontSize: '13px' }}>{error}</p>}

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '16px' }}>
          <label style={{ position: 'relative', flex: '1 1 260px' }}>
            <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-ash)' }} />
            <input
              aria-label="Search item records"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search title, description, location, or contact…"
              style={inputStyle}
            />
          </label>
          <select aria-label="Filter report type" value={reportType} onChange={(event) => setReportType(event.target.value)} style={{ ...inputStyle, width: 'auto', minWidth: '160px' }}>
            <option value="all">All report types</option>
            <option value="lost">Lost items</option>
            <option value="found">Found items</option>
          </select>
        </div>

        <div style={{ overflowX: 'auto', background: 'var(--color-bone)', border: '1px solid var(--color-stone)', borderRadius: '4px', boxShadow: 'var(--shadow-warm)' }}>
          <table className="cf-table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Report</th>
                <th>Location</th>
                <th>Status</th>
                <th>Reported</th>
                <th>Contact</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item) => {
                const type = item.reportType || 'found';
                return (
                  <tr key={item._id}>
                    <td>
                      <strong>{item.title}</strong>
                      <p style={{ margin: '3px 0 0', color: 'var(--color-driftwood)', fontSize: '11px' }}>{item.category || 'Other'}</p>
                    </td>
                    <td><span className="badge">{type === 'lost' ? 'Lost' : 'Found'}</span></td>
                    <td>{item.foundAt || '—'}</td>
                    <td>{type === 'lost' ? 'Seeking item' : item.status === 'claimed' ? 'Handed over' : 'In custody'}</td>
                    <td>{dateLabel(item.foundDate || item.createdAt)}</td>
                    <td>{item.contactEmail || '—'}</td>
                  </tr>
                );
              })}
              {!loading && filteredItems.length === 0 && (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: '36px', color: 'var(--color-ash)' }}>No item records match this search.</td></tr>
              )}
              {loading && (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: '36px', color: 'var(--color-ash)' }}>Loading registry…</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}

const inputStyle = {
  width: '100%',
  minHeight: '42px',
  padding: '9px 12px 9px 36px',
  color: 'var(--color-ink)',
  background: 'var(--color-bone)',
  border: '1px solid var(--color-stone)',
  borderRadius: '4px',
  font: '400 13px var(--font-cursorgothic)',
};
