import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Eye, User, MapPin, Calendar, Package, Phone, Mail, ChevronDown, ChevronUp, Search, AlertCircle, X } from 'lucide-react';
import AdminSidebar from '../components/AdminSidebar';
import { claimsAPI } from '../services/api';

export default function AdminClaimVerificationPage() {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [actionModal, setActionModal] = useState(null); // { claim, type }
  const [otp, setOtp] = useState('');
  const [filter, setFilter] = useState('Pending');
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
        await claimsAPI.cancel(claimId);
        setClaims(p => p.filter(c => c._id !== claimId));
      }
      setActionModal(null);
      setOtp('');
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
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--color-parchment)', color: 'var(--color-ink)' }}>
      <AdminSidebar />

      <main style={{ flex: 1, padding: '36px 36px 60px', overflowY: 'auto' }}>
        <div style={{ marginBottom: '28px' }}>
          <span style={{ fontFamily: 'var(--font-berkeleymono)', fontSize: '11px', color: 'var(--color-ash)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '4px' }}>
            SECURITY // VERIFICATION DESK
          </span>
          <h1 style={{ fontFamily: 'var(--font-cursorgothic)', fontSize: '1.85rem', fontWeight: 400, color: 'var(--color-ink)', marginBottom: '4px', letterSpacing: '-0.02em' }}>
            Claim Verification
          </h1>
          <p style={{ color: 'var(--color-driftwood)', fontSize: '13px', margin: 0 }}>
            Review student claims and verify ownership using the 6-digit OTP code presented at the central desk.
          </p>
        </div>

        {/* Summary */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px', marginBottom: '24px' }}>
          {[
            { label: 'Pending Review', value: claims.filter(c => !c.isVerified).length },
            { label: 'Verified & Completed', value: claims.filter(c => c.isVerified).length },
          ].map(s => (
            <div key={s.label} style={{ background: 'var(--color-bone)', border: '1px solid var(--color-stone)', borderRadius: '4px', padding: '16px 20px', boxShadow: 'var(--shadow-warm)' }}>
              <p style={{ fontSize: '1.7rem', fontWeight: 400, fontFamily: 'var(--font-cursorgothic)', color: 'var(--color-ink)', margin: 0, lineHeight: 1, letterSpacing: '-0.02em' }}>{s.value}</p>
              <p style={{ fontSize: '11px', color: 'var(--color-ash)', margin: '6px 0 0', textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: 'var(--font-berkeleymono)' }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '18px', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '200px', position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-ash)' }} />
            <input 
              type="text" 
              placeholder="Search claims by item or claimant..." 
              value={query} 
              onChange={e => setQuery(e.target.value)}
              className="form-input"
              style={{ paddingLeft: '38px', background: '#ffffff', fontSize: '13px' }} 
            />
          </div>
          <div style={{ display: 'flex', background: 'var(--color-linen)', border: '1px solid var(--color-stone)', borderRadius: '4px', overflow: 'hidden', padding: '2px' }}>
            {['All', 'Pending', 'Approved'].map(f => (
              <button 
                key={f} 
                onClick={() => setFilter(f)} 
                style={{ 
                  padding: '6px 14px', 
                  border: 'none', 
                  cursor: 'pointer', 
                  fontSize: '12px', 
                  fontWeight: filter === f ? 500 : 400, 
                  borderRadius: '3px',
                  background: filter === f ? '#ffffff' : 'transparent', 
                  color: 'var(--color-ink)', 
                  transition: 'all 150ms ease',
                  fontFamily: 'var(--font-cursorgothic)',
                  boxShadow: filter === f ? 'var(--shadow-warm)' : 'none',
                }}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Claim Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 24px', color: 'var(--color-ash)', fontFamily: 'var(--font-berkeleymono)' }}>Loading claims data...</div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 24px', background: 'var(--color-bone)', border: '1px solid var(--color-stone)', borderRadius: '4px' }}>
              <p style={{ color: 'var(--color-driftwood)', fontSize: '13px', margin: 0 }}>No claim records match your active query.</p>
            </div>
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
              <div key={claim._id} style={{ background: 'var(--color-bone)', border: '1px solid var(--color-stone)', borderRadius: '4px', overflow: 'hidden', boxShadow: 'var(--shadow-warm)' }}>
                {/* Header */}
                <div style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                    <span style={{ fontFamily: 'var(--font-berkeleymono)', color: 'var(--color-ink)', fontSize: '11px', background: 'var(--color-linen)', border: '1px solid var(--color-stone)', padding: '2px 6px', borderRadius: '3px' }}>
                      {shortId}
                    </span>
                    <div>
                      <p style={{ color: 'var(--color-ink)', fontWeight: 500, fontSize: '14px', margin: '0 0 2px' }}>{itemName}</p>
                      <p style={{ color: 'var(--color-ash)', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', margin: 0 }}>
                        <User size={11} />{claimantName} · {claimantRoll}
                        <span>·</span>
                        <MapPin size={11} />{foundAt}
                        <span>·</span>
                        <Calendar size={11} />{new Date(claim.createdAt).toLocaleDateString('en-IN')}
                      </p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {!claim.isVerified ? (
                      <>
                        <button 
                          onClick={() => setActionModal({ claim, type: 'approved' })} 
                          className="btn-primary" 
                          style={{ padding: '6px 12px', fontSize: '12px' }}
                        >
                          Verify OTP
                        </button>
                        <button 
                          onClick={() => setActionModal({ claim, type: 'rejected' })} 
                          className="btn-danger" 
                          style={{ padding: '6px 12px', fontSize: '12px' }}
                        >
                          Reject
                        </button>
                      </>
                    ) : (
                      <span className="badge badge-found" style={{ fontSize: '10px' }}>
                        Verified
                      </span>
                    )}
                    <button 
                      onClick={() => setExpanded(expanded === claim._id ? null : claim._id)} 
                      style={{ background: 'var(--color-linen)', border: '1px solid var(--color-stone)', borderRadius: '3px', padding: '6px 8px', cursor: 'pointer', color: 'var(--color-ink)', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px' }}
                      aria-label="Toggle details"
                    >
                      <Eye size={13} /> {expanded === claim._id ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                    </button>
                  </div>
                </div>

                {/* Expanded Detail */}
                {expanded === claim._id && (
                  <div style={{ padding: '16px 20px', borderTop: '1px solid var(--color-stone)', background: '#ffffff', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
                    {/* Item Info */}
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                      {claim.itemId?.image ? (
                        <img src={claim.itemId.image} alt={itemName} style={{ width: '70px', height: '70px', borderRadius: '4px', objectFit: 'cover', border: '1px solid var(--color-stone)' }} />
                      ) : (
                        <div style={{ width: '70px', height: '70px', borderRadius: '4px', background: 'var(--color-bone)', border: '1px solid var(--color-stone)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Package size={22} color="var(--color-ash)" />
                        </div>
                      )}
                      <div>
                        <span style={{ fontSize: '10px', fontFamily: 'var(--font-berkeleymono)', color: 'var(--color-ash)', textTransform: 'uppercase', display: 'block', marginBottom: '2px' }}>ITEM SPECIFICATION</span>
                        <p style={{ fontSize: '13px', color: 'var(--color-ink)', fontWeight: 500, margin: '0 0 2px' }}>{itemName}</p>
                        <p style={{ fontSize: '12px', color: 'var(--color-driftwood)', margin: '2px 0' }}>Category: {category}</p>
                        <p style={{ fontSize: '12px', color: 'var(--color-driftwood)', margin: '2px 0' }}>Location: {foundAt}</p>
                      </div>
                    </div>

                    {/* Claimant Contacts */}
                    <div>
                      <span style={{ fontSize: '10px', fontFamily: 'var(--font-berkeleymono)', color: 'var(--color-ash)', textTransform: 'uppercase', display: 'block', marginBottom: '2px' }}>CLAIMANT CONTACT</span>
                      <p style={{ fontSize: '13px', color: 'var(--color-ink)', fontWeight: 500, margin: '0 0 4px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <User size={12} color="var(--color-ash)" /> {claimantName} ({claimantRoll})
                      </p>
                      <p style={{ fontSize: '12px', color: 'var(--color-driftwood)', margin: '2px 0', display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <Mail size={12} /> {claimantEmail}
                      </p>
                      <p style={{ fontSize: '12px', color: 'var(--color-driftwood)', margin: '2px 0', display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <Phone size={12} /> {claimantMobile}
                      </p>
                    </div>

                    {/* Description Details */}
                    <div>
                      <span style={{ fontSize: '10px', fontFamily: 'var(--font-berkeleymono)', color: 'var(--color-ash)', textTransform: 'uppercase', display: 'block', marginBottom: '2px' }}>REPORT DESCRIPTION</span>
                      <p style={{ fontSize: '12px', color: 'var(--color-driftwood)', lineHeight: 1.5, margin: 0 }}>
                        {claim.itemId?.description || 'No detailed description provided.'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Action Verification Modal */}
        {actionModal && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(38, 37, 30, 0.45)',
              backdropFilter: 'blur(8px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1200,
              padding: '20px',
            }}
            onClick={() => setActionModal(null)}
          >
            <div
              style={{
                background: 'var(--color-bone)',
                border: '1px solid var(--color-stone)',
                borderRadius: '8px', /* Design.md modal radius: 8px */
                width: '100%',
                maxWidth: '440px',
                padding: '28px',
                boxShadow: 'var(--shadow-xl)',
                position: 'relative',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setActionModal(null)}
                style={{
                  position: 'absolute',
                  top: '16px',
                  right: '16px',
                  background: 'none',
                  border: 'none',
                  color: 'var(--color-ash)',
                  cursor: 'pointer',
                  padding: '4px',
                }}
              >
                <X size={16} />
              </button>

              <h3 style={{ fontFamily: 'var(--font-cursorgothic)', fontSize: '1.25rem', fontWeight: 500, color: 'var(--color-ink)', marginBottom: '8px', letterSpacing: '-0.015em' }}>
                {actionModal.type === 'approved' ? 'Verify Student OTP' : 'Reject Claim Request'}
              </h3>
              
              <p style={{ fontSize: '13px', color: 'var(--color-driftwood)', marginBottom: '18px', lineHeight: 1.5 }}>
                {actionModal.type === 'approved'
                  ? `Enter the 6-digit confirmation code shown by ${actionModal.claim.student_id?.username || 'the student'} at the desk.`
                  : `Are you sure you want to cancel the claim request for "${actionModal.claim.itemId?.title}"? The item will revert to Available.`
                }
              </p>

              {modalError && (
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center', color: 'var(--color-crimson)', fontSize: '12px', marginBottom: '14px', background: '#fcebed', padding: '8px 12px', borderRadius: '4px' }}>
                  <AlertCircle size={14} />
                  <span>{modalError}</span>
                </div>
              )}

              {actionModal.type === 'approved' && (
                <div className="form-group" style={{ marginBottom: '18px' }}>
                  <label className="form-label" style={{ textAlign: 'center' }}>6-Digit OTP Code</label>
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="••••••"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').substring(0, 6))}
                    style={{
                      width: '100%',
                      padding: '10px',
                      background: '#ffffff',
                      border: '1px solid var(--color-stone)',
                      borderRadius: '4px',
                      color: 'var(--color-ink)',
                      fontSize: '20px',
                      fontFamily: 'var(--font-berkeleymono)',
                      letterSpacing: '0.3em',
                      textAlign: 'center',
                      outline: 'none',
                    }}
                  />
                </div>
              )}

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={() => processAction(actionModal.claim._id, actionModal.type)}
                  disabled={processing}
                  className={actionModal.type === 'approved' ? 'btn-primary' : 'btn-danger'}
                  style={{ flex: 1, padding: '10px 0', fontSize: '13px' }}
                >
                  {processing ? 'Processing...' : actionModal.type === 'approved' ? 'Verify & Release Item' : 'Confirm Rejection'}
                </button>
                <button
                  onClick={() => setActionModal(null)}
                  className="btn-secondary"
                  style={{ flex: 1, padding: '10px 0', fontSize: '13px' }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
