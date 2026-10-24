import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, X, MapPin, FileText, AlertCircle, CheckCircle, Image, User, Mail, Phone, ArrowRight } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { itemsAPI } from '../services/api';

const isCampusEmail = (email) => {
  const normalized = typeof email === 'string' ? email.trim().toLowerCase() : '';
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized) && normalized.split('@')[1] === 'kbtcoe.org';
};

const normalizeMobile = (mobile) => {
  const compact = typeof mobile === 'string' ? mobile.trim().replace(/[\s()-]/g, '') : '';
  const nationalNumber = compact.startsWith('+91') ? compact.slice(3) : compact;
  return /^[6-9]\d{9}$/.test(nationalNumber) ? nationalNumber : null;
};

const CATEGORIES = ['Electronics', 'Wallet', 'ID Card', 'Books', 'Accessories', 'Clothing', 'Keys', 'Other'];
const LOCATIONS = ['Library', 'Cafeteria', 'Sports Complex', 'Hostel A', 'Hostel B', 'Hostel C', 'Hostel D', 'Auditorium', 'Block 1', 'Block 2', 'Block 3', 'Parking Area', 'Other'];
const RESPONSIBILITY_DECLARATION_VERSION = 'v1';

const initialForm = { 
  title: '', 
  category: '', 
  type: 'lost', 
  location: '', 
  description: '', 
  contactName: '', 
  contactEmail: '', 
  contactPhone: '' 
};

const validate = (form) => {
  const e = {};
  if (!form.title.trim()) e.title = 'Item title is required';
  if (!form.category) e.category = 'Select a category';
  if (!form.location) e.location = 'Select a location';
  if (!form.description.trim()) e.description = 'Description is required';
  
  return e;
};

const getInitialForm = () => {
  let user = null;
  try {
    const userStr = localStorage.getItem('campusfind_user');
    if (userStr) user = JSON.parse(userStr);
  } catch {
    user = null;
  }
  return {
    ...initialForm,
    contactName: user?.username || user?.name || '',
    contactEmail: user?.email || '',
    contactPhone: user?.mobile || user?.phone || '',
  };
};

export default function PostItemPage() {
  const navigate = useNavigate();
  const [user] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('campusfind_user') || 'null');
    } catch {
      return null;
    }
  });
  const [form, setForm] = useState(getInitialForm);
  const [errors, setErrors] = useState({});
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [apiError, setApiError] = useState('');
  const [declarationAccepted, setDeclarationAccepted] = useState(false);
  const [declarationError, setDeclarationError] = useState('');
  const [guestOtpEmail, setGuestOtpEmail] = useState('');
  const [guestOtp, setGuestOtp] = useState('');
  const [guestOtpSent, setGuestOtpSent] = useState(false);
  const [guestOtpVerified, setGuestOtpVerified] = useState(false);
  const [guestOtpLoading, setGuestOtpLoading] = useState(false);
  const [guestVerifyLoading, setGuestVerifyLoading] = useState(false);
  const [guestVerificationProof, setGuestVerificationProof] = useState('');
  const fileRef = useRef();

  const onChange = (e) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    if (errors[e.target.name]) setErrors(p => { const n = { ...p }; delete n[e.target.name]; return n; });
    setApiError('');
  };

  const handleFiles = (files) => {
    const valid = Array.from(files).filter(f => f.type.startsWith('image/')).slice(0, 4 - images.length);
    const previews = valid.map(f => ({ file: f, url: URL.createObjectURL(f), name: f.name }));
    setImages(p => [...p, ...previews].slice(0, 4));
    setApiError('');
  };

  const handleDrop = (e) => { 
    e.preventDefault(); 
    setDragActive(false);
    if (e.dataTransfer.files) {
      handleFiles(e.dataTransfer.files); 
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragActive(false);
  };

  const handleGuestOtpRequest = async () => {
    const email = form.contactEmail.trim();
    if (!isCampusEmail(email)) {
      setApiError('Use a valid @kbtcoe.org campus email address.');
      return;
    }
    setGuestOtpLoading(true);
    setApiError('');
    try {
      await itemsAPI.guestSendOtp(email.toLowerCase());
      setGuestOtpSent(true);
      setGuestOtpVerified(false);
      setGuestVerificationProof('');
      setGuestOtp('');
      setApiError('');
    } catch (err) {
      setApiError(err.message || 'Could not send verification code.');
    } finally {
      setGuestOtpLoading(false);
    }
  };

  const handleGuestOtpVerify = async () => {
    const email = form.contactEmail.trim();
    if (!isCampusEmail(email)) {
      setApiError('Use a valid @kbtcoe.org campus email address.');
      return;
    }
    if (!/^\d{6}$/.test(guestOtp.trim())) {
      setApiError('Enter the six-digit verification code.');
      return;
    }
    setGuestVerifyLoading(true);
    setApiError('');
    try {
      const response = await itemsAPI.guestVerifyOtp({ email: email.toLowerCase(), otp: guestOtp.trim() });
      const proof = response?.verificationProof || response?.data?.verificationProof;
      if (!proof) throw new Error('Verification succeeded but the proof was not returned.');
      setGuestVerificationProof(proof);
      setGuestOtpVerified(true);
      setApiError('');
    } catch (err) {
      setGuestOtpVerified(false);
      setApiError(err.message || 'Could not verify your campus email code.');
    } finally {
      setGuestVerifyLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!declarationAccepted) {
      setDeclarationError('Accept the responsibility declaration before publishing.');
      return;
    }
    const errs = validate(form);
    if (images.length === 0) {
      errs.image = 'An image of the item is required';
    }
    if (!user) {
      if (!isCampusEmail(form.contactEmail)) errs.contactEmail = 'Use your exact @kbtcoe.org campus email address';
      if (!normalizeMobile(form.contactPhone)) errs.contactPhone = 'Enter a valid 10-digit Indian mobile number';
      if (!form.contactName.trim()) errs.contactName = 'Your full name is required';
      if (!guestOtpVerified || !guestVerificationProof) {
        setApiError('Verify your college email before submitting a guest report.');
        return;
      }
    }
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    setApiError('');
    try {
      const formData = new FormData();
      formData.append('title', form.title.trim());
      formData.append('description', form.description.trim());
      formData.append('foundAt', form.location.trim());
      formData.append('reportType', form.type);
      formData.append('category', form.category.trim().toLowerCase());
      formData.append('declarationAccepted', 'true');
      formData.append('declarationVersion', RESPONSIBILITY_DECLARATION_VERSION);
      if (images.length > 0) {
        formData.append('image', images[0].file);
      }

      if (!user) {
        formData.append('reporterName', form.contactName.trim());
        formData.append('reporterEmail', form.contactEmail.trim().toLowerCase());
        formData.append('reporterPhone', normalizeMobile(form.contactPhone));
        formData.append('verificationProof', guestVerificationProof);
        await itemsAPI.guestCreate(formData);
      } else {
        await itemsAPI.create(formData);
      }
      setSuccess(true);
    } catch (err) {
      setApiError(err.message || 'Failed to report item. Please check fields and try again.');
    } finally { 
      setLoading(false); 
    }
  };

  const handlePostAnother = () => {
    setSuccess(false);
    setForm(getInitialForm());
    setImages([]);
    setDeclarationAccepted(false);
    setDeclarationError('');
  };

  if (success) return (
    <div
      className="page-wrapper"
      style={{
        minHeight: '100vh',
        display: 'flex', 
        flexDirection: 'column',
        background: 'var(--color-parchment)', 
        color: 'var(--color-ink)'
      }}
    >
      <Navbar />
      
      <div
        style={{ 
          flex: 1, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          padding: '80px 24px 80px',
        }}
      >
        <div style={{ width: '100%', maxWidth: '480px' }}>
          <div
            style={{ 
              padding: '48px 36px', 
              textAlign: 'center',
              background: 'var(--color-bone)',
              border: '1px solid var(--color-stone)',
              borderRadius: '4px',
              boxShadow: 'var(--shadow-warm)',
            }}
          >
            <div
              style={{ 
                width: '56px', 
                height: '56px', 
                background: 'var(--color-linen)', 
                border: '1px solid var(--color-stone)', 
                borderRadius: '4px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                margin: '0 auto 20px',
              }}
            >
              <CheckCircle size={28} color="var(--color-forest)" />
            </div>
            
            <h2
              style={{ 
                fontFamily: 'var(--font-cursorgothic)', 
                fontSize: '1.6rem', 
                fontWeight: 400, 
                color: 'var(--color-ink)', 
                marginBottom: '10px',
                letterSpacing: '-0.02em',
              }}
            >
              Report Dispatched
            </h2>
            <p style={{ color: 'var(--color-driftwood)', fontSize: '14px', marginBottom: '32px', lineHeight: 1.6 }}>
              Your item report has been indexed. Students searching in matching campus buildings will see it in the public directory.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button onClick={handlePostAnother} className="btn-primary" style={{ padding: '11px', width: '100%' }}>
                Report Another Item
              </button>
              
              <button onClick={() => navigate('/search')} className="btn-secondary" style={{ padding: '11px', width: '100%' }}>
                Browse Database
              </button>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );

  return (
    <div
      className="page-wrapper"
      style={{ 
        minHeight: '100vh',
        display: 'flex', 
        flexDirection: 'column',
        background: 'var(--color-parchment)', 
        color: 'var(--color-ink)',
      }}
    >
      <Navbar />

      <main
        style={{ 
          flex: 1, 
          maxWidth: '720px', 
          margin: '0 auto', 
          width: '100%', 
          padding: '48px 24px 80px',
        }}
      >
        {/* Page header */}
        <div style={{ marginBottom: '32px' }}>
          <span
            style={{ 
              fontFamily: 'var(--font-berkeleymono)',
              fontSize: '11px', 
              fontWeight: 500, 
              color: 'var(--color-ash)', 
              textTransform: 'uppercase', 
              letterSpacing: '0.08em',
              display: 'block',
              marginBottom: '8px'
            }}
          >
            TERMINAL // REPORT AN ITEM
          </span>
          <h1
            style={{ 
              fontFamily: 'var(--font-cursorgothic)', 
              fontSize: 'clamp(2rem, 4vw, 2.4rem)', 
              fontWeight: 400, 
              color: 'var(--color-ink)', 
              marginBottom: '6px',
              lineHeight: 1.1,
              letterSpacing: '-0.02em',
            }}
          >
            Report an Item
          </h1>
          <p style={{ color: 'var(--color-driftwood)', fontSize: '14px', margin: 0 }}>
            Broadcast a lost possession or report a found object to reunite the campus community.
          </p>
        </div>

        {/* Type toggle */}
        <div
          style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 1fr', 
            background: 'var(--color-linen)', 
            border: '1px solid var(--color-stone)', 
            borderRadius: '4px', 
            padding: '3px', 
            marginBottom: '24px' 
          }}
        >
          {['lost', 'found'].map(t => {
            const isActive = form.type === t;
            return (
              <button 
                key={t} 
                type="button" 
                onClick={() => setForm(f => ({ ...f, type: t }))} 
                style={{ 
                  padding: '9px', 
                  borderRadius: '3px', 
                  border: isActive ? '1px solid var(--color-stone)' : '1px solid transparent', 
                  cursor: 'pointer', 
                  fontSize: '13px', 
                  fontWeight: isActive ? 500 : 400, 
                  fontFamily: 'var(--font-cursorgothic)',
                  transition: 'all 150ms ease', 
                  background: isActive ? '#ffffff' : 'transparent', 
                  color: 'var(--color-ink)', 
                  letterSpacing: '-0.01em',
                  boxShadow: isActive ? 'var(--shadow-warm)' : 'none',
                }}
              >
                {t === 'lost' ? 'Lost Item' : 'Found Item'}
              </button>
            );
          })}
        </div>

        <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {apiError && (
            <div
              style={{
                background: '#fcebed',
                border: '1px solid #f5b8c3',
                padding: '12px 16px',
                borderRadius: '4px',
                color: 'var(--color-crimson)',
                fontSize: '13px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
              }}
            >
              <AlertCircle size={16} color="var(--color-crimson)" />
              <span>{apiError}</span>
            </div>
          )}

          {errors.image && (
            <div
              style={{
                background: '#fcebed',
                border: '1px solid #f5b8c3',
                padding: '12px 16px',
                borderRadius: '4px',
                color: 'var(--color-crimson)',
                fontSize: '13px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
              }}
            >
              <AlertCircle size={16} color="var(--color-crimson)" />
              <span>{errors.image}</span>
            </div>
          )}

          {/* Section 1: Item Details */}
          <div
            style={{ 
              padding: '24px 20px', 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '16px',
              background: 'var(--color-bone)',
              border: '1px solid var(--color-stone)',
              borderRadius: '4px',
              boxShadow: 'var(--shadow-warm)',
            }}
          >
            <h3
              style={{ 
                color: 'var(--color-ink)', 
                fontWeight: 500, 
                fontSize: '14px', 
                margin: 0, 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px',
                fontFamily: 'var(--font-cursorgothic)'
              }}
            >
              <FileText size={15} color="var(--color-ash)" /> 
              Item Details
            </h3>

            <div className="form-group">
              <label className="form-label">Item Title / Name *</label>
              <input 
                name="title" 
                type="text" 
                placeholder="e.g. Matte Black Kindle Paperwhite with Teal Case" 
                maxLength={120}
                value={form.title} 
                onChange={onChange} 
                className={`form-input ${errors.title ? 'input-error' : ''}`} 
              />
              {errors.title && <span className="error-msg">{errors.title}</span>}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
              <div className="form-group">
                <label className="form-label">Category *</label>
                <select 
                  name="category" 
                  value={form.category} 
                  onChange={onChange} 
                  className={`form-input ${errors.category ? 'input-error' : ''}`} 
                  style={{ cursor: 'pointer' }}
                >
                  <option value="">Select category</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                {errors.category && <span className="error-msg">{errors.category}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">Building / Zone *</label>
                <select 
                  name="location" 
                  value={form.location} 
                  onChange={onChange} 
                  className={`form-input ${errors.location ? 'input-error' : ''}`} 
                  style={{ cursor: 'pointer' }}
                >
                  <option value="">Select location</option>
                  {LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
                {errors.location && <span className="error-msg">{errors.location}</span>}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Description & Identifying Marks *</label>
              <textarea 
                name="description" 
                rows={4} 
                maxLength={500}
                placeholder="Detail key identifier marks: stickers, specific scratches, wallpaper, brand, exact contents, etc." 
                value={form.description} 
                onChange={onChange} 
                className={`form-input ${errors.description ? 'input-error' : ''}`} 
                style={{ resize: 'vertical', minHeight: '90px', lineHeight: 1.5 }} 
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
                {errors.description ? <span className="error-msg">{errors.description}</span> : <span />}
                <span style={{ fontSize: '11px', color: 'var(--color-ash)', fontFamily: 'var(--font-berkeleymono)' }}>
                  {form.description.length} / 500
                </span>
              </div>
            </div>
          </div>

          {/* Section 2: Photo upload */}
          <div
            style={{ 
              padding: '24px 20px',
              background: 'var(--color-bone)',
              border: '1px solid var(--color-stone)',
              borderRadius: '4px',
              boxShadow: 'var(--shadow-warm)',
            }}
          >
            <h3
              style={{ 
                color: 'var(--color-ink)', 
                fontWeight: 500, 
                fontSize: '14px', 
                marginBottom: '14px', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px',
                fontFamily: 'var(--font-cursorgothic)'
              }}
            >
              <Image size={15} color="var(--color-ash)" /> 
              Verification Media
              <span style={{ color: 'var(--color-ash)', fontWeight: 400, fontSize: '11px', fontFamily: 'var(--font-berkeleymono)' }}>(Max 4 photos)</span>
            </h3>

            <div
              onClick={() => images.length < 4 && fileRef.current.click()}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              style={{
                border: `1px dashed ${dragActive ? 'var(--color-ink)' : 'var(--color-stone)'}`,
                borderRadius: '4px',
                padding: '28px 16px',
                textAlign: 'center',
                cursor: images.length < 4 ? 'pointer' : 'default',
                background: dragActive ? 'var(--color-linen)' : '#ffffff',
                transition: 'all 150ms ease',
                marginBottom: images.length ? '14px' : '0',
              }}
            >
              <input
                ref={fileRef}
                type="file"
                multiple
                accept="image/*"
                style={{ display: 'none' }}
                onChange={e => e.target.files && handleFiles(e.target.files)}
              />
              <Upload size={22} color="var(--color-ash)" style={{ margin: '0 auto 8px', display: 'block' }} />
              <p style={{ fontSize: '13px', color: 'var(--color-ink)', margin: '0 0 2px', fontWeight: 500 }}>
                Click to browse or drop photographs here
              </p>
              <p style={{ fontSize: '11px', color: 'var(--color-ash)', margin: 0, fontFamily: 'var(--font-berkeleymono)' }}>
                PNG, JPG or WEBP up to 5MB each
              </p>
            </div>

            {images.length > 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))', gap: '8px' }}>
                {images.map((img, idx) => (
                  <div
                    key={idx}
                    style={{
                      position: 'relative',
                      borderRadius: '4px',
                      overflow: 'hidden',
                      height: '80px',
                      border: '1px solid var(--color-stone)',
                      background: '#ffffff',
                    }}
                  >
                    <img src={img.url} alt={img.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <button
                      type="button"
                      onClick={() => setImages(p => p.filter((_, i) => i !== idx))}
                      style={{
                        position: 'absolute',
                        top: '4px',
                        right: '4px',
                        background: 'rgba(38,37,30,0.7)',
                        border: 'none',
                        borderRadius: '2px',
                        color: '#ffffff',
                        width: '18px',
                        height: '18px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        padding: 0,
                      }}
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section 3: Contact details */}
          <div
            style={{ 
              padding: '24px 20px',
              background: 'var(--color-bone)',
              border: '1px solid var(--color-stone)',
              borderRadius: '4px',
              boxShadow: 'var(--shadow-warm)',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}
          >
            <h3
              style={{ 
                color: 'var(--color-ink)', 
                fontWeight: 500, 
                fontSize: '14px', 
                margin: 0, 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px',
                fontFamily: 'var(--font-cursorgothic)'
              }}
            >
              <User size={15} color="var(--color-ash)" /> 
              Campus Contact Info
            </h3>

            <div className="form-group">
              <label className="form-label">Contact Name *</label>
              <input 
                name="contactName" 
                type="text" 
                placeholder="Your full name" 
                value={form.contactName} 
                readOnly={Boolean(user)}
                onChange={onChange}
                className={`form-input ${errors.contactName ? 'input-error' : ''}`} 
              />
              {errors.contactName && <span className="error-msg">{errors.contactName}</span>}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
              <div className="form-group">
                <label className="form-label">Campus Email *</label>
                <input 
                  name="contactEmail" 
                  type="email" 
                  placeholder="student@kbtcoe.org" 
                  value={form.contactEmail} 
                  readOnly={Boolean(user)}
                  onChange={onChange}
                  className={`form-input ${errors.contactEmail ? 'input-error' : ''}`} 
                />
                {errors.contactEmail && <span className="error-msg">{errors.contactEmail}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">10-Digit Phone *</label>
                <input 
                  name="contactPhone" 
                  type="tel" 
                  placeholder="9876543210" 
                  value={form.contactPhone} 
                  readOnly={Boolean(user)}
                  onChange={onChange}
                  className={`form-input ${errors.contactPhone ? 'input-error' : ''}`} 
                />
                {errors.contactPhone && <span className="error-msg">{errors.contactPhone}</span>}
              </div>
            </div>
            {!user && (
              <div style={{ display: 'grid', gap: '12px', padding: '14px', border: '1px solid var(--color-stone)', borderRadius: '4px', background: '#ffffff' }}>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <span style={{ fontFamily: 'var(--font-berkeleymono)', fontSize: '11px', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-ash)' }}>
                    Guest verification
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <button type="button" className="btn-secondary" onClick={handleGuestOtpRequest} disabled={guestOtpLoading || !isCampusEmail(form.contactEmail)}>
                    {guestOtpLoading ? 'Sending…' : guestOtpSent ? 'Resend code' : 'Send code'}
                  </button>
                  {guestOtpSent && (
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                      <input
                        value={guestOtp}
                        onChange={(event) => setGuestOtp(event.target.value.replace(/\D/g, '').slice(0, 6))}
                        placeholder="123456"
                        maxLength={6}
                        className="form-input"
                        style={{ width: '120px', minWidth: '120px' }}
                      />
                      <button type="button" className="btn-primary" onClick={handleGuestOtpVerify} disabled={guestVerifyLoading || guestOtp.length !== 6}>
                        {guestVerifyLoading ? 'Verifying…' : 'Verify Email'}
                      </button>
                    </div>
                  )}
                </div>
                {guestOtpVerified && <p style={{ margin: 0, color: 'var(--color-verdant)', fontSize: '12px' }}>College email verified. You can now submit this report.</p>}
              </div>
            )}
            <p style={{ color: 'var(--color-driftwood)', fontSize: '12px', margin: 0 }}>
              {user
                ? 'Contact details come from your verified account and are not shown in the public directory.'
                : 'Guest reports require a verified @kbtcoe.org address before the report is accepted.'}
            </p>
          </div>

          <div
            style={{
              padding: '18px 20px',
              background: 'var(--color-bone)',
              border: '1px solid var(--color-stone)',
              borderRadius: '4px',
            }}
          >
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', color: 'var(--color-ink)', fontSize: '14px', lineHeight: 1.5 }}>
              <input
                type="checkbox"
                checked={declarationAccepted}
                onChange={(event) => {
                  setDeclarationAccepted(event.target.checked);
                  setDeclarationError('');
                }}
                style={{ marginTop: '3px' }}
                required
              />
              <span>
                I confirm this report is truthful and that I have a genuine reason to report this item.
                I understand that knowingly false or misleading reports may result in account restrictions
                and referral under campus policy.
              </span>
            </label>
            {declarationError && <span className="error-msg">{declarationError}</span>}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || !declarationAccepted}
            className="btn-primary"
            style={{
              padding: '12px 24px',
              fontSize: '14px',
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
            }}
          >
            {loading ? 'Submitting Report...' : 'Publish Item to Directory'}
            <ArrowRight size={15} />
          </button>
        </form>
      </main>

      <Footer />
    </div>
  );
}
