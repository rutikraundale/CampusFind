import { useCallback, useEffect, useState } from 'react';
import { AlertCircle, CheckCircle2, Clock3, Loader } from 'lucide-react';
import AdminSidebar from '../components/AdminSidebar';
import AdminMasthead from '../components/AdminMasthead';
import { studentIssuesAPI } from '../services/api';

const STATUSES = ['Pending', 'Solved', 'Reject'];

export default function AdminIssuesPage() {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [savingId, setSavingId] = useState('');

  const loadIssues = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await studentIssuesAPI.adminGetAll();
      setIssues(response.data || []);
    } catch (loadError) {
      setError(loadError.message || 'Could not load student issues.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;

    studentIssuesAPI.adminGetAll()
      .then((response) => {
        if (active) setIssues(response.data || []);
      })
      .catch((loadError) => {
        if (active) setError(loadError.message || 'Could not load student issues.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const updateIssue = async (issue, status, adminNote) => {
    setSavingId(issue._id);
    setError('');
    try {
      const response = await studentIssuesAPI.adminUpdateStatus(issue._id, { status, adminNote });
      setIssues((current) => current.map((entry) => entry._id === issue._id ? response.data : entry));
    } catch (updateError) {
      setError(updateError.message || 'Could not update this issue.');
    } finally {
      setSavingId('');
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--color-parchment)', color: 'var(--color-ink)' }}>
      <AdminSidebar />
      <main style={{ flex: 1, minWidth: 0, padding: '28px 32px 60px', overflowY: 'auto' }}>
        <AdminMasthead />
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 16, margin: '20px 0 24px' }}>
          <div>
            <span style={{ fontFamily: 'var(--font-berkeleymono)', fontSize: 11, color: 'var(--color-ash)', letterSpacing: '0.08em' }}>STUDENT SUPPORT // INBOX</span>
            <h1 style={{ fontFamily: 'var(--font-cursorgothic)', fontSize: '1.85rem', fontWeight: 400, margin: '6px 0' }}>Student Issues</h1>
            <p style={{ margin: 0, color: 'var(--color-driftwood)', fontSize: 13 }}>{issues.length} total submissions · {issues.filter((issue) => issue.status === 'Pending').length} pending</p>
          </div>
          <button type="button" className="btn-secondary" onClick={loadIssues} style={{ padding: '8px 13px', fontSize: 13 }}>Refresh issues</button>
        </header>
        {error && <p role="alert" style={{ color: 'var(--color-crimson)', fontSize: 13 }}>{error}</p>}
        {loading ? <p style={{ color: 'var(--color-ash)' }}>Loading issues…</p> : issues.length === 0 ? (
          <div style={{ padding: 24, background: 'var(--color-bone)', border: '1px solid var(--color-stone)', color: 'var(--color-ash)' }}>No student issues have been submitted.</div>
        ) : (
          <div style={{ display: 'grid', gap: 14 }}>
            {issues.map((issue) => (
              <IssueCard key={issue._id} issue={issue} saving={savingId === issue._id} onSave={updateIssue} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function IssueCard({ issue, saving, onSave }) {
  const [status, setStatus] = useState(issue.status);
  const [adminNote, setAdminNote] = useState(issue.adminNote || '');
  const StatusIcon = issue.status === 'Solved' ? CheckCircle2 : issue.status === 'Reject' ? AlertCircle : Clock3;

  return (
    <article style={{ background: 'var(--color-bone)', border: '1px solid var(--color-stone)', borderRadius: 4, padding: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <div>
          <span style={{ fontFamily: 'var(--font-berkeleymono)', fontSize: 11, color: 'var(--color-ash)' }}>{issue.issueId}</span>
          <h2 style={{ fontSize: 17, fontWeight: 500, margin: '5px 0' }}>{issue.subject}</h2>
          <p style={{ fontSize: 12, color: 'var(--color-driftwood)', margin: 0 }}>
            {issue.category} · {issue.submitterName || issue.submittedBy?.username} · {issue.submitterEmail || issue.submittedBy?.email}
          </p>
          <p style={{ fontSize: 12, color: 'var(--color-ash)', margin: '5px 0 0' }}>
            Submitted {new Date(issue.createdAt).toLocaleString()}
            {(issue.relatedItem?.title || issue.relatedItem) && ` · Related item: ${issue.relatedItem?.title || issue.relatedItem}`}
          </p>
        </div>
        <span style={{ display: 'inline-flex', gap: 6, alignItems: 'center', color: 'var(--color-driftwood)', fontSize: 13 }}><StatusIcon size={15} />{issue.status}</span>
      </div>
      <p style={{ fontSize: 14, lineHeight: 1.55, whiteSpace: 'pre-wrap', margin: '14px 0 18px' }}>{issue.description}</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 10, alignItems: 'end' }}>
        <label style={labelStyle}>Status
          <select className="form-input" value={status} onChange={(event) => setStatus(event.target.value)}>
            {STATUSES.map((option) => <option key={option}>{option}</option>)}
          </select>
        </label>
        <label style={labelStyle}>Admin note (visible to student)
          <input className="form-input" value={adminNote} maxLength={1000} onChange={(event) => setAdminNote(event.target.value)} placeholder="Optional update for the student" />
        </label>
        <button type="button" className="btn-primary" disabled={saving} onClick={() => onSave(issue, status, adminNote)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, padding: '10px 14px', minWidth: 104 }}>
          {saving ? <Loader size={14} className="animate-spin" /> : null}{saving ? 'Saving…' : 'Save'}
        </button>
      </div>
    </article>
  );
}

const labelStyle = { display: 'grid', gap: 6, fontSize: 12, color: 'var(--color-ash)' };
