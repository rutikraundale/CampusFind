import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Eye, User, MapPin, Calendar, Package, Phone, Mail, ChevronDown, ChevronUp, Search, Filter } from 'lucide-react';
import AdminSidebar from '../components/AdminSidebar';
import { claimsAPI } from '../services/api';

export default function AdminClaimVerificationPage() {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [actionModal, setActionModal] = useState(null); // { claim, type }
  const [otp, setOtp] = useState('');
  const [note, setNote] = useState('');
  const [filter, setFilter] = useState('Pending'); // default to pending claims for review
  const [query, setQuery] = useState('');
  const [modalError, setModalError] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    async function loadClaims() {
      try {
        const res = await claimsAPI.adminGetAll();
        setClaims(res.data || res || []);
      } catch (err) {
        console.error("Error loading claims for verification:", err);
      } finally {
        setLoading(false);
      }
    }
    loadClaims();
  }, []);

  const processAction = async (claimId, type) => {
    setModalError('');
    setProcessing(true);
    try {
      if (type === 'approved') {
        if (!otp.trim()) {
          setModalError('6-digit OTP code is required for student verification.');
          setProcessing(false);
          return;
        }
        if (!/^\d{6}$/.test(otp.trim())) {
          setModalError('OTP must be exactly 6 digits.');
          setProcessing(false);
          return;
        }
        await claimsAPI.adminVerify(claimId, { otp_code: otp.trim() });
        setClaims(p => p.map(c => c._id === claimId ? { ...c, isVerified: true } : c));
      } else {
        // Rejection is cancellation (reverts item status and deletes claim)
        await claimsAPI.cancel(claimId);
        setClaims(p => p.filter(c => c._id !== claimId));
      }
      setActionModal(null);
      setOtp('');
      setNote('');
    } catch (err) {
      console.error(err);
      setModalError(err.message || 'Operation failed. Please verify student details and try again.');
    } finally {
      setProcessing(false);
    }
  };

  const filtered = claims.filter(c => {
    const isVerifiedStatus = c.isVerified;
    const matchF = filter === 'All' || 
      (filter === 'Pending' && !isVerifiedStatus) || 
      (filter === 'Approved' && isVerifiedStatus);

    const itemName = c.itemId?.title || 'Unknown Item';
    const claimantName = c.student_id?.username || 'Student';
    
    const matchQ = !query || 
      itemName.toLowerCase().includes(query.toLowerCase()) || 
      claimantName.toLowerCase().includes(query.toLowerCase());

    return matchF && matchQ;
  });

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-base)', position: 'relative' }}>
      <div className="bg-mesh" />
      <AdminSidebar />

      <main style={{ flex: 1, padding: '36px 32px', overflowY: 'auto', position: 'relative', zIndex: 1 }}>
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontFamily: 'Space Grotesk,sans-serif', fontSize: '1.7rem', fontWeight: 700, color: '#F0F0FF', marginBottom: '6px' }}>Claim Verification</h1>
          <p style={{ color: '#9CA3C4', fontSize: '0.88rem' }}>Review and verify student claims by typing their 6-digit verification code.</p>
        </div>

        {/* Summary */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(130px,1fr))', gap: '14px', marginBottom: '28px' }}>
          {[
            { label: 'Pending review', value: claims.filter(c => !c.isVerified).length, color: '#F59E0B' },
            { label: 'Approved & Handed over', value: claims.filter(c => c.isVerified).length, color: '#22C55E' },
          ].map(s => (
            <div key={s.label} className="glass-card" style={{ padding: '16px 20px' }}>
              <p style={{ fontSize: '1.7rem', fontWeight: 800, fontFamily: 'Space Grotesk,sans-serif', color: s.color }}>{s.value}</p>
              <p style={{ fontSize: '0.8rem', color: '#5A5E7A', fontWeight: 500 }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '200px', position: 'relative' }}>
            <Search size={15} style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', color: '#5A5E7A' }} />
            <input type="text" placeholder="Search claims..." value={query} onChange={e => setQuery(e.target.value)}
              style={{ width: '100%', padding: '10px 14px 10px 38px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', color: '#F0F0FF', fontSize: '0.87rem', outline: 'none', fontFamily: 'Inter,sans-serif' }} />
          </div>
          <div style={{ display: 'flex', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', overflow: 'hidden' }}>
            {['All', 'Pending', 'Approved'].map(f => (
              <button key={f} onClick={() => setFilter(f)} style={{ padding: '9px 15px', border: 'none', cursor: 'pointer', fontSize: '0.81rem', fontWeight: 600, background: filter === f ? 'rgba(108,99,255,0.2)' : 'transparent', color: filter === f ? '#A78BFA' : '#5A5E7A', transition: 'all 0.2s' }}>{f}</button>
            ))}
          </div>
        </div>

        {/* Claim Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 24px', color: '#9CA3C4' }}>Loading claims data...</div>
          ) : filtered.map(claim => {
            const shortId = claim._id?.substring(claim._id.length - 8).toUpperCase() || 'CLM';
            const itemName = claim.itemId?.title || 'Unknown Item';
            const claimantName = claim.student_id?.username || 'Student';
            const claimantRoll = claim.student_id?.college_id || 'N/A';
            const claimantEmail = claim.student_id?.email || 'N/A';
            const claimantMobile = claim.student_id?.mobile || 'N/A';
            const category = claim.itemId?.category || 'other';
            const foundAt = claim.itemId?.foundAt || 'N/A';
            
            return (
              <div key={claim._id} className="glass-card" style={{ overflow: 'hidden' }}>
                {/* Card Header */}
                <div style={{ padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                    <span style={{ fontFamily: 'monospace', color: '#A78BFA', fontSize: '0.82rem', fontWeight: 700, background: 'rgba(108,99,255,0.1)', padding: '3px 10px', borderRadius: '6px' }}>{shortId}</span>
                    <div>
                      <p style={{ color: '#F0F0FF', fontWeight: 600, fontSize: '0.95rem', marginBottom: '3px' }}>{itemName}</p>
                      <p style={{ color: '#5A5E7A', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                        <User size={11} />{claimantName} · {claimantRoll}
                        <span style={{ margin: '0 4px' }}>·</span>
                        <MapPin size={11} />{foundAt}
                        <span style={{ margin: '0 4px' }}>·</span>
                        <Calendar size={11} />{new Date(claim.createdAt).toLocaleDateString('en-IN')}
                      </p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {!claim.isVerified ? (
                      <>
                        <button onClick={() => setActionModal({ claim, type: 'approved' })} className="btn-success" style={{ padding: '8px 18px', fontSize: '0.83rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <CheckCircle size={15} /> Verify Claim
                        </button>
                        <button onClick={() => setActionModal({ claim, type: 'rejected' })} className="btn-danger" style={{ padding: '8px 18px', fontSize: '0.83rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <XCircle size={15} /> Reject
                        </button>
                      </>
                    ) : (
                      <span className="badge badge-success" style={{ padding: '6px 16px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <CheckCircle size={13} /> Approved
                      </span>
                    )}
                    <button onClick={() => setExpanded(expanded === claim._id ? null : claim._id)} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '8px 12px', cursor: 'pointer', color: '#9CA3C4', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.8rem' }}>
                      <Eye size={14} /> Details {expanded === claim._id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>
                  </div>
                </div>

                {/* Expanded Detail */}
                {expanded === claim._id && (
                  <div style={{ padding: '0 24px 24px', borderTop: '1px solid rgba(255,255,255,0.05)', marginTop: 0, paddingTop: '20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: '20px', animation: 'fadeIn 0.25s ease' }}>
                    {/* Item Info */}
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                      {claim.itemId?.image ? (
                        <img src={claim.itemId.image} alt={itemName} style={{ width: '100px', height: '100px', borderRadius: '10px', objectFit: 'cover', border: '1px solid rgba(255,255,255,0.08)' }} />
                      ) : (
                        <div style={{ width: '100px', height: '100px', borderRadius: '10px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Package size={30} color="#5A5E7A" />
                        </div>
                      )}
                      <div>
                        <h4 style={{ fontSize: '0.8rem', fontWeight: 700, color: '#5A5E7A', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>Item Specification</h4>
                        <p style={{ fontSize: '0.9rem', color: '#F0F0FF', fontWeight: 500 }}>{itemName}</p>
                        <p style={{ fontSize: '0.82rem', color: '#9CA3C4', marginTop: '3px' }}>Category: <span style={{ textTransform: 'capitalize' }}>{category}</span></p>
                        <p style={{ fontSize: '0.82rem', color: '#9CA3C4', marginTop: '3px' }}>Found At: {foundAt}</p>
                      </div>
                    </div>

                    {/* Claimant Contacts */}
                    <div>
                      <h4 style={{ fontSize: '0.8rem', fontWeight: 700, color: '#5A5E7A', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>Claimant Information</h4>
                      <p style={{ fontSize: '0.88rem', color: '#F0F0FF', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                        <User size={13} color="#A78BFA" /> {claimantName} ({claimantRoll})
                      </p>
                      <p style={{ fontSize: '0.82rem', color: '#9CA3C4', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                        <Mail size={13} /> {claimantEmail}
                      </p>
                      <p style={{ fontSize: '0.82rem', color: '#9CA3C4', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Phone size={13} /> {claimantMobile}
                      </p>
                    </div>

                    {/* Description Details */}
                    <div style={{ gridColumn: 'span 1' }}>
                      <h4 style={{ fontSize: '0.8rem', fontWeight: 700, color: '#5A5E7A', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>Original Item Description</h4>
                      <p style={{ color: '#9CA3C4', fontSize: '0.85rem', lineHeight: 1.6 }}>{claim.itemId?.description || 'No description provided.'}</p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {!loading && filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: '60px 24px', color: '#5A5E7A' }}>
              <Filter size={40} style={{ marginBottom: '16px', opacity: 0.5 }} />
              <p style={{ fontWeight: 600, color: '#9CA3C4', marginBottom: '6px' }}>No claims found</p>
              <p style={{ fontSize: '0.85rem' }}>Try adjusting your search or tabs.</p>
            </div>
          )}
        </div>
      </main>

      {/* Action Confirmation Modal */}
      {actionModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }} onClick={() => !processing && setActionModal(null)}>
          <div className="glass-card animate-fadeInUp" style={{ maxWidth: '460px', width: '100%', padding: '32px' }} onClick={e => e.stopPropagation()}>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: actionModal.type === 'approved' ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)', border: `1px solid ${actionModal.type === 'approved' ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}` }}>
                {actionModal.type === 'approved' ? <CheckCircle size={30} color="#22C55E" /> : <XCircle size={30} color="#EF4444" />}
              </div>
              <h3 style={{ fontFamily: 'Space Grotesk,sans-serif', fontWeight: 700, fontSize: '1.2rem', color: '#F0F0FF', marginBottom: '8px' }}>
                {actionModal.type === 'approved' ? 'Approve Claim?' : 'Reject Claim?'}
              </h3>
              <p style={{ color: '#9CA3C4', fontSize: '0.87rem' }}>
                {actionModal.type === 'approved' ? 'Type the OTP code student received on email to mark handover.' : 'Rejecting this claim will immediately cancel it and mark the item available again.'}
              </p>
            </div>
            
            {modalError && (
              <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '10px', padding: '12px 14px', color: '#F87171', fontSize: '0.83rem', marginBottom: '16px' }}>
                {modalError}
              </div>
            )}

            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '10px', padding: '12px 14px', marginBottom: '20px' }}>
              <p style={{ fontSize: '0.82rem', color: '#A78BFA', fontWeight: 600, marginBottom: '4px' }}>Claim ID: {actionModal.claim._id?.toUpperCase()}</p>
              <p style={{ fontSize: '0.87rem', color: '#F0F0FF' }}>{actionModal.claim.itemId?.title || 'Unknown Item'}</p>
              <p style={{ fontSize: '0.78rem', color: '#5A5E7A' }}>Claimed by {actionModal.claim.student_id?.username || 'Student'}</p>
            </div>

            {actionModal.type === 'approved' ? (
              <div className="form-group" style={{ marginBottom: '20px' }}>
                <label className="form-label">Student OTP Code (6 digits)</label>
                <input type="text" maxLength={6} placeholder="e.g. 123456" className="form-input" style={{ letterSpacing: '0.5em', textAlign: 'center', fontSize: '1.2rem', fontWeight: 'bold' }} value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, ''))} />
              </div>
            ) : (
              <div className="form-group" style={{ marginBottom: '20px' }}>
                <label className="form-label">Note / Rejection Reason</label>
                <textarea value={note} onChange={e => setNote(e.target.value)} placeholder="Provide optional notes for the student..." rows={3} className="form-input" style={{ resize: 'none' }} />
              </div>
            )}

            <div style={{ display: 'flex', gap: '12px' }}>
              <button disabled={processing} onClick={() => setActionModal(null)} className="btn-secondary" style={{ flex: 1, padding: '12px' }}>Cancel</button>
              <button disabled={processing} onClick={() => processAction(actionModal.claim._id, actionModal.type)} style={{ flex: 1, padding: '12px' }} className={actionModal.type === 'approved' ? 'btn-success' : 'btn-danger'}>
                {processing ? 'Processing...' : actionModal.type === 'approved' ? 'Confirm Verify' : 'Confirm Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
