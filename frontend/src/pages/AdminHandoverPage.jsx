import { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle, LoaderCircle, MapPin, Package, RefreshCw, ShieldCheck, UserRound } from 'lucide-react';
import AdminSidebar from '../components/AdminSidebar';
import AdminMasthead from '../components/AdminMasthead';
import { claimsAPI } from '../services/api';

const savedHandoverKey = 'campusfind_admin_handover';

const unwrap = (response) => response?.data;
const readableDate = (value) => value ? new Date(value).toLocaleDateString() : 'Date not recorded';
const isCampusEmail = (email) => {
  const normalized = typeof email === 'string' ? email.trim().toLowerCase() : '';
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized) && normalized.split('@')[1] === 'kbtcoe.org';
};

export default function AdminHandoverPage() {
  const [items, setItems] = useState([]);
  const [history, setHistory] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [studentEmail, setStudentEmail] = useState('');
  const [destinationEmail, setDestinationEmail] = useState('');
  const [student, setStudent] = useState(null);
  const [handover, setHandover] = useState(null);
  const [otp, setOtp] = useState('');
  const [identityConfirmed, setIdentityConfirmed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [checkingStudent, setCheckingStudent] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [now, setNow] = useState(0);

  const refreshDirectory = async () => {
    const [itemsResponse, historyResponse] = await Promise.all([
      claimsAPI.getHandoverItems(),
      claimsAPI.getHandoverHistory(),
    ]);
    setItems(unwrap(itemsResponse) || []);
    setHistory(unwrap(historyResponse) || []);
  };

  useEffect(() => {
    const loadPage = async () => {
      setLoading(true);
      setError('');
      try {
        await refreshDirectory();
        const stored = sessionStorage.getItem(savedHandoverKey);
        if (stored) {
          try {
            const { handoverId } = JSON.parse(stored);
            const response = await claimsAPI.getHandoverSession(handoverId);
            const current = unwrap(response);
            if (current?.item && current.status !== 'cancelled') {
              setSelectedItem(current.item);
              setStudent(current.student || null);
              setDestinationEmail(current.student?.email || '');
              setHandover(current);
              if (current.status === 'completed') {
                setNotice('This physical handover has already been recorded.');
              }
            } else {
              sessionStorage.removeItem(savedHandoverKey);
            }
          } catch (restoreError) {
            sessionStorage.removeItem(savedHandoverKey);
            if (restoreError.status !== 404) {
              setError(restoreError.message || 'Could not restore the active handover session.');
            }
          }
        }
      } catch (loadError) {
        setError(loadError.message || 'Could not load the handover desk.');
      } finally {
        setLoading(false);
      }
    };
    loadPage();
  }, []);

  useEffect(() => {
    if (!handover?.resendAfter || handover.status !== 'otp_sent') return undefined;
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [handover?.resendAfter, handover?.status]);

  const resetForm = () => {
    setSelectedItem(null);
    setStudentEmail('');
    setDestinationEmail('');
    setStudent(null);
    setHandover(null);
    setOtp('');
    setIdentityConfirmed(false);
    sessionStorage.removeItem(savedHandoverKey);
  };

  const chooseItem = async (item) => {
    setError('');
    setNotice('');
    if (handover?.handoverId && ['otp_sent', 'verified'].includes(handover.status)) {
      setCancelling(true);
      try {
        await claimsAPI.cancelHandoverSession(handover.handoverId);
      } catch (cancelError) {
        setError(cancelError.message || 'Cancel the current verification before selecting another item.');
        setCancelling(false);
        return;
      }
      setCancelling(false);
    }
    resetForm();
    setSelectedItem(item);
  };

  const checkStudent = async (event) => {
    event.preventDefault();
    const normalizedEmail = studentEmail.trim();
    if (!isCampusEmail(normalizedEmail)) {
      setError('Enter a valid @kbtcoe.org CampusFind student email.');
      setStudent(null);
      setDestinationEmail('');
      return;
    }
    setCheckingStudent(true);
    setError('');
    setNotice('');
    setStudent(null);
    setDestinationEmail('');
    try {
      const response = await claimsAPI.checkHandoverStudent(normalizedEmail.toLowerCase());
      const result = unwrap(response);
      if (!result.studentExists) {
        setNotice('No CampusFind account was found. Ask the student to register before continuing.');
      } else if (!result.emailVerified) {
        setNotice('The account exists, but its registered email is not verified. The student must verify it before handover.');
      } else {
        setStudent(result.student);
        setDestinationEmail(result.student.email);
        setNotice('Verified CampusFind account found. Confirm the registered email below to send the code.');
      }
    } catch (lookupError) {
      setError(lookupError.message || 'Could not check the student account.');
    } finally {
      setCheckingStudent(false);
    }
  };

  const sendOtp = async () => {
    if (!student || !selectedItem) return;
    const normalizedDestination = destinationEmail.trim();
    if (!isCampusEmail(normalizedDestination) || normalizedDestination.toLowerCase() !== student.email.toLowerCase()) {
      setError('OTP can only be sent to the student\'s registered @kbtcoe.org email.');
      return;
    }
    setSendingOtp(true);
    setError('');
    setNotice('');
    try {
      const response = await claimsAPI.sendHandoverOtp({
        itemId: selectedItem._id,
        studentEmail: student.email,
        destinationEmail: normalizedDestination.toLowerCase(),
      });
      const result = unwrap(response);
      const active = {
        handoverId: result.handoverId,
        status: 'otp_sent',
        maskedEmail: result.maskedEmail,
        expiresAt: result.expiresAt,
        resendAfter: result.resendAfter,
        item: selectedItem,
        student,
      };
      setHandover(active);
      sessionStorage.setItem(savedHandoverKey, JSON.stringify({ handoverId: result.handoverId }));
      setOtp('');
      setNotice(`Verification code sent to ${result.maskedEmail}.`);
    } catch (sendError) {
      setError(sendError.message || 'Could not send the verification code.');
    } finally {
      setSendingOtp(false);
    }
  };

  const verifyOtp = async (event) => {
    event.preventDefault();
    if (!/^\d{6}$/.test(otp)) {
      setError('Enter the six-digit code provided by the student.');
      return;
    }
    setVerifyingOtp(true);
    setError('');
    setNotice('');
    try {
      await claimsAPI.verifyHandoverOtp({ handoverId: handover.handoverId, otp });
      const updated = { ...handover, status: 'verified' };
      setHandover(updated);
      setOtp('');
      setNotice('Email verification succeeded. Confirm the physical handover below to mark the item claimed.');
    } catch (verifyError) {
      setError(verifyError.message || 'Could not verify this code.');
    } finally {
      setVerifyingOtp(false);
    }
  };

  const confirmHandover = async () => {
    if (!identityConfirmed) {
      setError('Confirm that you checked the student’s identity and handed over the item.');
      return;
    }
    setConfirming(true);
    setError('');
    setNotice('');
    try {
      const response = await claimsAPI.confirmHandover({
        handoverId: handover.handoverId,
        identityAndHandoverConfirmed: true,
      });
      const result = unwrap(response);
      setHandover((current) => ({
        ...current,
        status: 'completed',
        handoverConfirmed: true,
        handoverConfirmedAt: result.item?.handoverAt,
      }));
      setNotice('Handover recorded. The item is now marked claimed.');
      try {
        await refreshDirectory();
      } catch (refreshError) {
        setError(`Handover recorded, but the item list could not be refreshed: ${refreshError.message}`);
      }
    } catch (confirmationError) {
      setError(confirmationError.message || 'Could not confirm the item handover.');
    } finally {
      setConfirming(false);
    }
  };

  const cancelHandover = async () => {
    if (!handover?.handoverId || !['otp_sent', 'verified'].includes(handover.status)) {
      resetForm();
      return;
    }
    setCancelling(true);
    setError('');
    try {
      await claimsAPI.cancelHandoverSession(handover.handoverId);
      resetForm();
      setNotice('Handover verification cancelled.');
    } catch (cancelError) {
      setError(cancelError.message || 'Could not cancel the handover session.');
    } finally {
      setCancelling(false);
    }
  };

  const resendRemaining = handover?.resendAfter
    ? Math.max(0, Math.ceil((new Date(handover.resendAfter).getTime() - now) / 1000))
    : 0;
  const availableCount = items.filter((item) => item.status === 'available').length;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--color-parchment)', color: 'var(--color-ink)' }}>
      <AdminSidebar />
      <main style={{ flex: 1, minWidth: 0, padding: '28px 32px 60px', overflowY: 'auto' }}>
        <AdminMasthead />
        <header style={{ marginBottom: '24px' }}>
          <span style={{ display: 'block', marginBottom: '4px', color: 'var(--color-ash)', font: '400 11px var(--font-berkeleymono)', letterSpacing: '0.08em' }}>
            ADMIN CONSOLE / PHYSICAL HANDOVER
          </span>
          <h1 style={{ margin: '0 0 5px', font: '400 28px/1.2 var(--font-cursorgothic)', letterSpacing: '-0.02em' }}>Claim &amp; handover</h1>
          <p style={{ margin: 0, color: 'var(--color-driftwood)', fontSize: '13px' }}>
            Verify the student’s registered email, then record the in-person identity check and item handover.
          </p>
        </header>

        {error && <p role="alert" style={messageStyle(true)}><AlertCircle size={15} />{error}</p>}
        {notice && <p role="status" style={messageStyle(false)}><CheckCircle size={15} />{notice}</p>}

        <section aria-labelledby="handover-items-heading">
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '12px', margin: '22px 0 12px' }}>
            <h2 id="handover-items-heading" style={{ margin: 0, fontSize: '17px' }}>Found items</h2>
            <span style={{ color: 'var(--color-ash)', font: '400 11px var(--font-berkeleymono)' }}>{availableCount} AVAILABLE</span>
          </div>
          {loading ? (
            <p style={{ color: 'var(--color-ash)', fontSize: '13px' }}>Loading item records…</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(245px, 1fr))', gap: '12px' }}>
              {items.map((item) => (
                <article key={item._id} style={cardStyle}>
                  {item.image && <img src={item.image} alt="" style={{ width: '100%', height: '132px', objectFit: 'cover', borderRadius: '4px', border: '1px solid var(--color-stone)' }} />}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                    <h3 style={{ margin: 0, fontSize: '14px' }}>{item.title}</h3>
                    <span style={statusStyle}>{item.status === 'claimed' ? 'Already claimed' : 'Available'}</span>
                  </div>
                  <p style={{ display: 'flex', gap: '5px', alignItems: 'center', margin: 0, color: 'var(--color-driftwood)', fontSize: '12px' }}>
                    <MapPin size={13} />{item.foundAt} · {readableDate(item.foundDate)}
                  </p>
                  {item.status === 'available' ? (
                    <button type="button" className="btn-primary" onClick={() => chooseItem(item)} disabled={cancelling}>
                      <Package size={14} /> Claim / Hand Over
                    </button>
                  ) : (
                    <button type="button" className="btn-secondary" disabled>Already Claimed</button>
                  )}
                </article>
              ))}
              {!items.length && <p style={{ color: 'var(--color-driftwood)', fontSize: '13px' }}>No found items are available yet.</p>}
            </div>
          )}
        </section>

        {selectedItem && (
          <section aria-labelledby="handover-form-heading" style={{ ...cardStyle, marginTop: '24px', maxWidth: '760px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px' }}>
              <div>
                <span style={{ color: 'var(--color-ash)', font: '400 10px var(--font-berkeleymono)', letterSpacing: '0.06em' }}>SELECTED ITEM</span>
                <h2 id="handover-form-heading" style={{ margin: '4px 0', fontSize: '18px' }}>{selectedItem.title}</h2>
                <p style={{ margin: 0, color: 'var(--color-driftwood)', fontSize: '12px' }}>{selectedItem.foundAt} · {readableDate(selectedItem.foundDate)}</p>
              </div>
              {(!handover || ['otp_sent', 'verified'].includes(handover.status)) && (
                <button type="button" className="found-upload-text-button" onClick={cancelHandover} disabled={cancelling}>
                  Cancel workflow
                </button>
              )}
            </div>

            {!handover && (
              <form onSubmit={checkStudent} style={{ display: 'grid', gap: '12px', marginTop: '20px' }}>
                <label style={labelStyle}>
                  Student’s CampusFind email
                  <input type="email" value={studentEmail} onChange={(event) => { setStudentEmail(event.target.value); setStudent(null); setDestinationEmail(''); setNotice(''); }} required autoComplete="email" style={inputStyle} />
                </label>
                <button type="submit" className="btn-secondary" disabled={checkingStudent || !studentEmail.trim()}>
                  {checkingStudent ? <LoaderCircle className="found-upload-spin" size={15} /> : <UserRound size={15} />}
                  {checkingStudent ? 'Checking account…' : 'Check Student'}
                </button>
                {notice.includes('register') && (
                  <p style={{ margin: 0, color: 'var(--color-driftwood)', fontSize: '13px' }}>
                    The student must create an account before the item can be handed over. Registration is available from the student portal.
                  </p>
                )}
                {student && (
                  <>
                    <p style={messageStyle(false)}><CheckCircle size={15} />Account verified: {student.username} · {student.email}</p>
                    <label style={labelStyle}>
                      Confirm registered OTP destination
                      <input type="email" value={destinationEmail} onChange={(event) => setDestinationEmail(event.target.value)} required autoComplete="off" style={inputStyle} />
                    </label>
                    <p style={{ margin: 0, color: 'var(--color-ash)', fontSize: '12px' }}>Only the verified email on this CampusFind account can receive the code.</p>
                    <button type="button" className="btn-primary" onClick={sendOtp} disabled={sendingOtp || !destinationEmail.trim()}>
                      {sendingOtp ? <LoaderCircle className="found-upload-spin" size={15} /> : <ShieldCheck size={15} />}
                      {sendingOtp ? 'Sending code…' : 'Send OTP'}
                    </button>
                  </>
                )}
              </form>
            )}

            {handover?.status === 'otp_sent' && (
              <div style={{ display: 'grid', gap: '13px', marginTop: '20px' }}>
                <p style={messageStyle(false)}><CheckCircle size={15} />Code sent to {handover.maskedEmail}. It expires {new Date(handover.expiresAt).toLocaleTimeString()}.</p>
                <form onSubmit={verifyOtp} style={{ display: 'grid', gap: '10px' }}>
                  <label style={labelStyle}>
                    Student’s six-digit email code
                    <input value={otp} onChange={(event) => setOtp(event.target.value.replace(/\D/g, '').slice(0, 6))} inputMode="numeric" autoComplete="one-time-code" maxLength={6} required style={{ ...inputStyle, maxWidth: '240px', fontFamily: 'var(--font-berkeleymono)', letterSpacing: '0.25em' }} />
                  </label>
                  <button type="submit" className="btn-primary" disabled={verifyingOtp || otp.length !== 6}>
                    {verifyingOtp ? <LoaderCircle className="found-upload-spin" size={15} /> : <CheckCircle size={15} />}
                    {verifyingOtp ? 'Verifying…' : 'Verify OTP'}
                  </button>
                </form>
                <button type="button" className="found-upload-text-button" onClick={sendOtp} disabled={sendingOtp || resendRemaining > 0}>
                  <RefreshCw size={13} />{resendRemaining > 0 ? `Resend available in ${resendRemaining}s` : sendingOtp ? 'Sending…' : 'Resend OTP'}
                </button>
              </div>
            )}

            {handover?.status === 'verified' && (
              <div style={{ display: 'grid', gap: '14px', marginTop: '20px' }}>
                <p style={messageStyle(false)}><CheckCircle size={15} />Email verified for {handover.student?.username || student?.username || 'student'}. OTP verification alone has not claimed the item.</p>
                <label style={{ display: 'flex', alignItems: 'flex-start', gap: '9px', color: 'var(--color-ink)', fontSize: '13px', lineHeight: 1.5 }}>
                  <input type="checkbox" checked={identityConfirmed} onChange={(event) => setIdentityConfirmed(event.target.checked)} />
                  I confirm that I verified the student’s identity in person and handed the item to the rightful claimant.
                </label>
                <button type="button" className="btn-primary" onClick={confirmHandover} disabled={!identityConfirmed || confirming}>
                  {confirming ? <LoaderCircle className="found-upload-spin" size={15} /> : <CheckCircle size={15} />}
                  {confirming ? 'Recording handover…' : 'Confirm Handover'}
                </button>
              </div>
            )}

            {handover?.status === 'completed' && (
              <p style={{ ...messageStyle(false), marginTop: '18px' }}><CheckCircle size={15} />Physical handover recorded on {readableDate(handover.handoverConfirmedAt)}.</p>
            )}

            {handover && !['otp_sent', 'verified', 'completed'].includes(handover.status) && (
              <div style={{ marginTop: '18px' }}>
                <p style={messageStyle(true)}><AlertCircle size={15} />This verification is {handover.status.replace('_', ' ')}. Start a new handover verification to continue.</p>
                <button type="button" className="btn-secondary" onClick={resetForm}>Start again</button>
              </div>
            )}
          </section>
        )}

        <section aria-labelledby="handover-history-heading" style={{ marginTop: '30px' }}>
          <h2 id="handover-history-heading" style={{ margin: '0 0 12px', fontSize: '17px' }}>Recent handovers</h2>
          <div style={{ ...cardStyle, padding: 0, overflow: 'hidden' }}>
            {history.length ? history.map((record) => (
              <div key={record._id} style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) auto', gap: '12px', padding: '12px 16px', borderBottom: '1px solid var(--color-linen)', alignItems: 'center' }}>
                <div>
                  <p style={{ margin: 0, fontSize: '13px' }}>{record.itemId?.title || 'Item'} · {record.student_id?.username || 'Student'}</p>
                  <p style={{ margin: '3px 0 0', color: 'var(--color-driftwood)', fontSize: '11px' }}>Confirmed by {record.processByWhichAdmin?.email || 'Admin'}</p>
                </div>
                <span style={{ color: 'var(--color-ash)', font: '400 11px var(--font-berkeleymono)' }}>{readableDate(record.handoverConfirmedAt)}</span>
              </div>
            )) : <p style={{ margin: 0, padding: '16px', color: 'var(--color-driftwood)', fontSize: '13px' }}>No completed handovers yet.</p>}
          </div>
        </section>
      </main>
    </div>
  );
}

const cardStyle = {
  display: 'grid',
  gap: '11px',
  padding: '16px',
  background: 'var(--color-bone)',
  border: '1px solid var(--color-stone)',
  borderRadius: '4px',
  boxShadow: 'var(--shadow-warm)',
};

const statusStyle = {
  padding: '3px 6px',
  color: 'var(--color-driftwood)',
  background: 'var(--color-linen)',
  border: '1px solid var(--color-stone)',
  borderRadius: '3px',
  font: '400 10px var(--font-berkeleymono)',
  whiteSpace: 'nowrap',
};

const labelStyle = {
  display: 'grid',
  gap: '6px',
  color: 'var(--color-ink)',
  fontSize: '12px',
};

const inputStyle = {
  width: '100%',
  maxWidth: '440px',
  minHeight: '40px',
  padding: '9px 11px',
  color: 'var(--color-ink)',
  background: 'var(--color-parchment)',
  border: '1px solid var(--color-stone)',
  borderRadius: '4px',
  font: '400 13px var(--font-cursorgothic)',
};

function messageStyle(isError) {
  return {
    display: 'flex',
    alignItems: 'center',
    gap: '7px',
    margin: 0,
    padding: '10px 12px',
    color: isError ? 'var(--color-crimson)' : 'var(--color-ink)',
    background: 'var(--color-parchment)',
    border: '1px solid var(--color-stone)',
    borderRadius: '4px',
    fontSize: '12px',
  };
}
