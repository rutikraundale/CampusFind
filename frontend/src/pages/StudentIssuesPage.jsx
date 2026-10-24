import { useCallback, useEffect, useState } from 'react';
import { AlertCircle, CheckCircle2, Clock3, Loader, Send } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { studentIssuesAPI } from '../services/api';

const CATEGORIES = ['Item handover concern', 'Request to remove item', 'Other'];

const statusStyle = {
  Pending: { color: 'var(--color-driftwood)', icon: Clock3 },
  Solved: { color: '#23704b', icon: CheckCircle2 },
  Reject: { color: 'var(--color-crimson)', icon: AlertCircle },
};

export default function StudentIssuesPage() {
  const [issues, setIssues] = useState([]);
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [relatedItem, setRelatedItem] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadIssues = useCallback(async () => {
    setLoading(true);
    try {
      const response = await studentIssuesAPI.getMine();
      setIssues(response.data || []);
    } catch (fetchError) {
      setError(fetchError.message || 'Could not load your issues.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadIssues();
  }, [loadIssues]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');
    try {
      const response = await studentIssuesAPI.create({
        category,
        subject,
        description,
        ...(relatedItem.trim() ? { relatedItem: relatedItem.trim() } : {}),
      });
      setIssues((current) => [response.data, ...current]);
      setSubject('');
      setDescription('');
      setRelatedItem('');
      setSuccess(`Issue submitted. Save your reference ID: ${response.data.issueId}`);
    } catch (submitError) {
      setError(submitError.message || 'Could not submit your issue.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--color-parchment)', color: 'var(--color-ink)' }}>
      <Navbar />
      <main style={{ flex: 1, width: '100%', maxWidth: 1000, margin: '0 auto', padding: '40px 24px 64px' }}>
        <header style={{ marginBottom: 28 }}>
          <span style={{ fontFamily: 'var(--font-berkeleymono)', fontSize: 11, color: 'var(--color-ash)', letterSpacing: '0.08em' }}>STUDENT SUPPORT</span>
          <h1 style={{ fontFamily: 'var(--font-cursorgothic)', fontWeight: 400, fontSize: '2rem', margin: '6px 0' }}>Feedback &amp; Report an Issue</h1>
          <p style={{ color: 'var(--color-driftwood)', fontSize: 14, margin: 0 }}>Send a concern directly to the CampusFind administrators and track its status here.</p>
        </header>

        <section style={{ background: 'var(--color-bone)', border: '1px solid var(--color-stone)', borderRadius: 4, padding: 24, marginBottom: 32 }}>
          <h2 style={{ fontSize: 17, fontWeight: 500, margin: '0 0 18px' }}>Submit an issue</h2>
          <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 14 }}>
            <label style={labelStyle}>Issue type
              <select className="form-input" value={category} onChange={(event) => setCategory(event.target.value)}>
                {CATEGORIES.map((option) => <option key={option}>{option}</option>)}
              </select>
            </label>
            <label style={labelStyle}>Subject
              <input className="form-input" value={subject} onChange={(event) => setSubject(event.target.value)} maxLength={120} required placeholder="Briefly describe the issue" />
            </label>
            <label style={labelStyle}>Details
              <textarea className="form-input" value={description} onChange={(event) => setDescription(event.target.value)} maxLength={2000} required rows={5} placeholder="Include any details that will help the admin team review this issue." />
            </label>
            <label style={labelStyle}>Related item ID <span style={{ fontWeight: 400, color: 'var(--color-ash)' }}>(optional)</span>
              <input className="form-input" value={relatedItem} onChange={(event) => setRelatedItem(event.target.value)} placeholder="Paste the item ID if this concerns a directory listing" />
            </label>
            {error && <p role="alert" style={messageStyle}>{error}</p>}
            {success && <p role="status" style={{ ...messageStyle, color: '#23704b' }}>{success}</p>}
            <button className="btn-primary" type="submit" disabled={submitting} style={{ justifySelf: 'start', display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px' }}>
              {submitting ? <Loader size={15} className="animate-spin" /> : <Send size={15} />}
              {submitting ? 'Submitting…' : 'Submit issue'}
            </button>
          </form>
        </section>

        <section>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, gap: 12 }}>
            <h2 style={{ fontSize: 17, fontWeight: 500, margin: 0 }}>Your submissions</h2>
            <button type="button" className="btn-secondary" onClick={loadIssues} style={{ padding: '7px 12px', fontSize: 12 }}>Refresh status</button>
          </div>
          {loading ? <p style={{ color: 'var(--color-ash)' }}>Loading your issues…</p> : issues.length === 0 ? (
            <div style={emptyStyle}>You have not submitted any issues yet.</div>
          ) : (
            <div style={{ display: 'grid', gap: 12 }}>
              {issues.map((issue) => {
                const StatusIcon = statusStyle[issue.status]?.icon || Clock3;
                return (
                  <article key={issue._id} style={{ background: 'var(--color-bone)', border: '1px solid var(--color-stone)', borderRadius: 4, padding: 18 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', alignItems: 'flex-start' }}>
                      <div>
                        <div style={{ fontFamily: 'var(--font-berkeleymono)', fontSize: 11, color: 'var(--color-ash)', marginBottom: 6 }}>REFERENCE: {issue.issueId}</div>
                        <h3 style={{ fontSize: 16, fontWeight: 500, margin: '0 0 5px' }}>{issue.subject}</h3>
                        <p style={{ margin: '0 0 8px', color: 'var(--color-ash)', fontSize: 12 }}>{issue.category} · {new Date(issue.createdAt).toLocaleString()}</p>
                      </div>
                      <span style={{ color: statusStyle[issue.status]?.color || 'var(--color-driftwood)', display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 500 }}>
                        <StatusIcon size={15} /> {issue.status}
                      </span>
                    </div>
                    <p style={{ margin: '10px 0 0', fontSize: 14, lineHeight: 1.55, whiteSpace: 'pre-wrap' }}>{issue.description}</p>
                    {(issue.relatedItem?.title || issue.adminNote) && (
                      <div style={{ borderTop: '1px solid var(--color-stone)', marginTop: 14, paddingTop: 12, color: 'var(--color-driftwood)', fontSize: 13 }}>
                        {issue.relatedItem?.title && <p style={{ margin: '0 0 6px' }}>Related item: {issue.relatedItem.title}</p>}
                        {issue.adminNote && <p style={{ margin: 0 }}><strong>Admin update:</strong> {issue.adminNote}</p>}
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
}

const labelStyle = { display: 'grid', gap: 6, fontSize: 13, color: 'var(--color-ink)' };
const messageStyle = { color: 'var(--color-crimson)', fontSize: 13, margin: 0 };
const emptyStyle = { background: 'var(--color-bone)', border: '1px solid var(--color-stone)', padding: 24, color: 'var(--color-ash)', fontSize: 14 };
