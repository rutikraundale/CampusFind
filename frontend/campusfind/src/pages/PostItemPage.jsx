import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, X, MapPin, Tag, FileText, AlertCircle, CheckCircle, Image, User, Mail, Phone, Sparkles, ArrowRight } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { itemsAPI } from '../services/api';

const CATEGORIES = ['Electronics', 'Wallet', 'ID Card', 'Books', 'Accessories', 'Clothing', 'Keys', 'Other'];
const LOCATIONS = ['Library', 'Cafeteria', 'Sports Complex', 'Hostel A', 'Hostel B', 'Hostel C', 'Hostel D', 'Auditorium', 'Block 1', 'Block 2', 'Block 3', 'Parking Area', 'Other'];

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
  else if (form.description.trim().length < 20) e.description = 'Provide a descriptive explanation (min 20 characters)';
  
  if (!form.contactName.trim()) e.contactName = 'Contact name is required';
  if (!form.contactEmail.trim()) e.contactEmail = 'Email is required';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.contactEmail)) e.contactEmail = 'Invalid email address';
  
  if (!form.contactPhone.trim()) {
    e.contactPhone = 'Contact phone number is required';
  } else if (!/^\d{10}$/.test(form.contactPhone)) {
    e.contactPhone = 'Phone number must be exactly 10 digits';
  }
  return e;
};

export default function PostItemPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [apiError, setApiError] = useState('');
  const fileRef = useRef();

  // Prepopulate from localStorage on mount
  useEffect(() => {
    const userStr = localStorage.getItem('campusfind_user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setForm(f => ({
          ...f,
          contactName: user.username || user.name || '',
          contactEmail: user.email || '',
          contactPhone: user.mobile || user.phone || ''
        }));
      } catch (err) {
        console.error(err);
      }
    }
  }, []);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate(form);
    if (images.length === 0) {
      errs.image = 'An image of the item is required';
    }
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    setApiError('');
    try {
      // 1. Build multipart FormData
      const formData = new FormData();
      formData.append('title', form.title.trim());
      formData.append('description', form.description.trim());
      formData.append('foundAt', form.location.trim());
      formData.append('category', form.category.trim().toLowerCase());
      formData.append('contactPhone', form.contactPhone.trim());
      formData.append('contactEmail', form.contactEmail.trim().toLowerCase());
      
      // Since backend expect a single image file
      if (images.length > 0) {
        formData.append('image', images[0].file);
      }

      // 2. Fire live Axios upload request
      await itemsAPI.create(formData);
      setSuccess(true);
    } catch (err) {
      setApiError(err.message || 'Failed to report item. Please check fields and try again.');
    } finally { 
      setLoading(false); 
    }
  };

  const handlePostAnother = () => {
    setSuccess(false);
    // Keep user contact info but reset item fields
    const userStr = localStorage.getItem('campusfind_user');
    let prepopulated = { ...initialForm };
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        prepopulated.contactName = user.name || '';
        prepopulated.contactEmail = user.email || '';
        prepopulated.contactPhone = user.phone || '';
      } catch (e) {}
    }
    setForm(prepopulated);
    setImages([]);
  };

  if (success) return (
    <div className="page-wrapper" style={{ 
      minHeight: '100vh',
      display: 'flex', 
      flexDirection: 'column',
      background: '#05070E', 
      color: '#F2F4F8'
    }}>
      {/* Grid line background */}
      <div style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        backgroundImage: `
          linear-gradient(rgba(255, 255, 255, 0.01) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255, 255, 255, 0.01) 1px, transparent 1px)
        `,
        backgroundSize: '45px 45px',
        pointerEvents: 'none',
      }} />
      <div className="bg-mesh" />
      <Navbar />
      
      <div style={{ 
        flex: 1, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        padding: '140px 24px 80px',
        position: 'relative',
        zIndex: 1 
      }}>
        <div style={{ position: 'relative', width: '100%', maxWidth: '480px' }}>
          
          {/* Success Glow Card */}
          <div style={{
            position: 'absolute',
            inset: '-2px',
            background: form.type === 'lost' ? 'linear-gradient(135deg, #F59E0B 0%, #EF4444 100%)' : 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
            borderRadius: '26px',
            filter: 'blur(12px)',
            opacity: 0.2,
            zIndex: 0,
            pointerEvents: 'none'
          }} />

          <div className="glass-card animate-fadeInUp" style={{ 
            padding: '48px 36px', 
            textAlign: 'center',
            background: 'linear-gradient(135deg, rgba(16, 18, 31, 0.85) 0%, rgba(10, 11, 20, 0.95) 100%)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            position: 'relative',
            zIndex: 1
          }}>
            <div style={{ 
              width: '76px', 
              height: '76px', 
              background: form.type === 'lost' ? 'rgba(245,158,11,0.1)' : 'rgba(16,185,129,0.1)', 
              border: form.type === 'lost' ? '1px solid rgba(245,158,11,0.3)' : '1px solid rgba(16,185,129,0.3)', 
              borderRadius: '50%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              margin: '0 auto 24px',
              boxShadow: form.type === 'lost' ? '0 0 20px rgba(245,158,11,0.15)' : '0 0 20px rgba(16,185,129,0.15)'
            }}>
              <CheckCircle size={36} color={form.type === 'lost' ? '#F59E0B' : '#10B981'} />
            </div>
            
            <h2 style={{ fontFamily: 'Space Grotesk,sans-serif', fontSize: '1.65rem', fontWeight: 700, color: '#F2F4F8', marginBottom: '12px' }}>
              Report Dispatched
            </h2>
            <p style={{ color: '#AEB6C7', fontSize: '0.88rem', marginBottom: '32px', lineHeight: 1.6 }}>
              Your item report has been signed and compiled into our decentralized campus network. Students in matching zones will receive instant alert flags.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button onClick={handlePostAnother} className="btn-primary" style={{ 
                padding: '12px', 
                fontSize: '0.92rem', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                gap: '8px' 
              }}>
                <Sparkles size={16} /> Report Another Item
              </button>
              
              <button onClick={() => navigate('/search')} className="btn-secondary" style={{ 
                padding: '12px', 
                fontSize: '0.92rem',
                border: '1px solid rgba(255,255,255,0.08)' 
              }}>
                Browse Lost & Found Database
              </button>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );

  return (
    <div className="page-wrapper" style={{ 
      minHeight: '100vh',
      display: 'flex', 
      flexDirection: 'column',
      background: '#05070E', 
      color: '#F2F4F8',
      position: 'relative'
    }}>
      {/* Grid background */}
      <div style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        backgroundImage: `
          linear-gradient(rgba(255, 255, 255, 0.01) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255, 255, 255, 0.01) 1px, transparent 1px)
        `,
        backgroundSize: '45px 45px',
        pointerEvents: 'none',
      }} />
      <div className="bg-mesh" />

      <Navbar />

      <main style={{ 
        flex: 1, 
        maxWidth: '840px', 
        margin: '0 auto', 
        width: '100%', 
        padding: '130px 24px 80px', // Extra top padding to completely resolve navbar overlap
        position: 'relative',
        zIndex: 1 
      }}>
        
        {/* Page title area */}
        <div style={{ marginBottom: '32px' }}>
          <span style={{ 
            fontSize: '0.78rem', 
            fontWeight: 700, 
            color: '#6C63FF', 
            textTransform: 'uppercase', 
            letterSpacing: '1.5px',
            display: 'block',
            marginBottom: '6px'
          }}>
            Campus Terminal // 04
          </span>
          <h1 style={{ fontFamily: 'Space Grotesk,sans-serif', fontSize: 'clamp(1.7rem,4vw,2.3rem)', fontWeight: 700, color: '#F2F4F8', marginBottom: '8px' }}>
            Report Campus Incident
          </h1>
          <p style={{ color: '#AEB6C7', fontSize: '0.88rem' }}>
            Broadcast lost items or index recovered objects to help reunite the student community.
          </p>
        </div>

        {/* Binary Type Selector */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr 1fr', 
          background: 'rgba(5, 7, 14, 0.7)', 
          border: '1px solid rgba(255,255,255,0.06)', 
          borderRadius: '16px', 
          padding: '4px', 
          marginBottom: '28px' 
        }}>
          {['lost', 'found'].map(t => {
            const isActive = form.type === t;
            let themeBg = 'transparent';
            let shadow = 'none';
            if (isActive) {
              themeBg = t === 'lost' 
                ? 'linear-gradient(135deg,#F59E0B,#EF4444)' 
                : 'linear-gradient(135deg,#10B981,#059669)';
              shadow = t === 'lost'
                ? '0 4px 16px rgba(245,158,11,0.25)'
                : '0 4px 16px rgba(16,185,129,0.25)';
            }
            return (
              <button 
                key={t} 
                type="button" 
                onClick={() => setForm(f => ({ ...f, type: t }))} 
                style={{ 
                  padding: '14px', 
                  borderRadius: '12px', 
                  border: 'none', 
                  cursor: 'pointer', 
                  fontSize: '0.92rem', 
                  fontWeight: 700, 
                  transition: 'all 0.25s ease', 
                  background: themeBg, 
                  color: isActive ? '#fff' : '#5A5E7A', 
                  boxShadow: shadow
                }}
              >
                {t === 'lost' ? ' Report Lost Item' : ' Report Found Item'}
              </button>
            );
          })}
        </div>

        <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {apiError && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.08)',
              border: '1px solid rgba(239, 68, 68, 0.15)',
              padding: '16px 20px',
              borderRadius: '16px',
              color: '#EF4444',
              fontSize: '0.88rem',
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              fontFamily: 'system-ui, sans-serif'
            }}>
              <AlertCircle size={18} />
              <span>{apiError}</span>
            </div>
          )}

          {errors.image && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.08)',
              border: '1px solid rgba(239, 68, 68, 0.15)',
              padding: '16px 20px',
              borderRadius: '16px',
              color: '#EF4444',
              fontSize: '0.88rem',
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              fontFamily: 'system-ui, sans-serif'
            }}>
              <AlertCircle size={18} />
              <span>{errors.image}</span>
            </div>
          )}

          {/* Card 1: Core details */}
          <div className="glass-card" style={{ 
            padding: '30px 24px', 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '20px',
            background: 'linear-gradient(135deg, rgba(16, 18, 31, 0.7) 0%, rgba(10, 11, 20, 0.8) 100%)',
            border: '1px solid rgba(255,255,255,0.06)'
          }}>
            <h3 style={{ 
              color: '#F2F4F8', 
              fontWeight: 700, 
              fontSize: '0.95rem', 
              margin: 0, 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px',
              fontFamily: 'Space Grotesk, sans-serif'
            }}>
              <FileText size={17} color="#6C63FF" /> 
              Incident Specification
            </h3>

            <div className="form-group">
              <label className="form-label">Item Title / Specific Name *</label>
              <input 
                name="title" 
                type="text" 
                placeholder="e.g. Matte Black Kindle Paperwhite with Teal Leather Case" 
                value={form.title} 
                onChange={onChange} 
                className={`form-input ${errors.title ? 'input-error' : ''}`} 
              />
              {errors.title && <span className="error-msg">{errors.title}</span>}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">
                  <Tag size={13} style={{ marginRight: '4px', verticalAlign: 'middle' }} /> 
                  Category Tag *
                </label>
                <select 
                  name="category" 
                  value={form.category} 
                  onChange={onChange} 
                  className={`form-input ${errors.category ? 'input-error' : ''}`} 
                  style={{ cursor: 'pointer' }}
                >
                  <option value="" style={{ background: '#0F111E' }}>Select category tag</option>
                  {CATEGORIES.map(c => <option key={c} value={c} style={{ background: '#0F111E' }}>{c}</option>)}
                </select>
                {errors.category && <span className="error-msg">{errors.category}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">
                  <MapPin size={13} style={{ marginRight: '4px', verticalAlign: 'middle' }} /> 
                  Building / Zone *
                </label>
                <select 
                  name="location" 
                  value={form.location} 
                  onChange={onChange} 
                  className={`form-input ${errors.location ? 'input-error' : ''}`} 
                  style={{ cursor: 'pointer' }}
                >
                  <option value="" style={{ background: '#0F111E' }}>Select building location</option>
                  {LOCATIONS.map(l => <option key={l} value={l} style={{ background: '#0F111E' }}>{l}</option>)}
                </select>
                {errors.location && <span className="error-msg">{errors.location}</span>}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Description & Identifier Marks *</label>
              <textarea 
                name="description" 
                rows={4} 
                placeholder="Detail key identifier marks: sticker decals, specific scratches, wallpaper description, brand type, exact contents, etc." 
                value={form.description} 
                onChange={onChange} 
                className={`form-input ${errors.description ? 'input-error' : ''}`} 
                style={{ resize: 'vertical', minHeight: '100px', lineHeight: 1.6 }} 
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
                {errors.description ? <span className="error-msg">{errors.description}</span> : <span />}
                <span style={{ fontSize: '0.72rem', color: '#5A5E7A' }}>
                  {form.description.length} / 500 characters
                </span>
              </div>
            </div>
          </div>

          {/* Card 2: Interactive Drag & Drop Images */}
          <div className="glass-card" style={{ 
            padding: '30px 24px',
            background: 'linear-gradient(135deg, rgba(16, 18, 31, 0.7) 0%, rgba(10, 11, 20, 0.8) 100%)',
            border: '1px solid rgba(255,255,255,0.06)'
          }}>
            <h3 style={{ 
              color: '#F2F4F8', 
              fontWeight: 700, 
              fontSize: '0.95rem', 
              marginBottom: '16px', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px',
              fontFamily: 'Space Grotesk, sans-serif'
            }}>
              <Image size={17} color="#6C63FF" /> 
              Verification Media
              <span style={{ color: '#5A5E7A', fontWeight: 400, fontSize: '0.78rem' }}>(Optional, max 4 previews)</span>
            </h3>

            <div
              onClick={() => images.length < 4 && fileRef.current.click()}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              style={{ 
                border: dragActive ? '2px dashed #6C63FF' : '2px dashed rgba(108,99,255,0.22)', 
                borderRadius: '14px', 
                padding: '36px 20px', 
                textAlign: 'center', 
                cursor: images.length < 4 ? 'pointer' : 'default', 
                transition: 'all 0.25s', 
                background: dragActive ? 'rgba(108,99,255,0.06)' : 'rgba(108,99,255,0.02)' 
              }}
            >
              <Upload size={30} color={dragActive ? '#6C63FF' : '#5A5E7A'} style={{ marginBottom: '10px', transition: 'color 0.2s' }} />
              <p style={{ color: '#F2F4F8', fontSize: '0.88rem', marginBottom: '4px', fontWeight: 600 }}>
                {dragActive ? 'Drop files here!' : 'Drag & drop image files'}
              </p>
              <p style={{ color: '#AEB6C7', fontSize: '0.78rem' }}>
                or click to browse local folders (PNG, JPG up to 8MB)
              </p>
              <input 
                ref={fileRef} 
                type="file" 
                accept="image/*" 
                multiple 
                style={{ display: 'none' }} 
                onChange={e => handleFiles(e.target.files)} 
              />
            </div>

            {images.length > 0 && (
              <div style={{ display: 'flex', gap: '12px', marginTop: '18px', flexWrap: 'wrap' }}>
                {images.map((img, i) => (
                  <div key={i} style={{ position: 'relative', width: '84px', height: '84px' }}>
                    <img 
                      src={img.url} 
                      alt={img.name} 
                      style={{ 
                        width: '100%', 
                        height: '100%', 
                        objectFit: 'cover', 
                        borderRadius: '8px', 
                        border: '1px solid rgba(255,255,255,0.1)' 
                      }} 
                    />
                    <button 
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setImages(p => p.filter((_, j) => j !== i));
                      }} 
                      style={{ 
                        position: 'absolute', 
                        top: '-6px', 
                        right: '-6px', 
                        background: '#EF4444', 
                        border: 'none', 
                        borderRadius: '50%', 
                        width: '18px', 
                        height: '18px', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        cursor: 'pointer',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
                      }}
                    >
                      <X size={10} color="#fff" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Card 3: Contact details */}
          <div className="glass-card" style={{ 
            padding: '30px 24px', 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '20px',
            background: 'linear-gradient(135deg, rgba(16, 18, 31, 0.7) 0%, rgba(10, 11, 20, 0.8) 100%)',
            border: '1px solid rgba(255,255,255,0.06)'
          }}>
            <h3 style={{ 
              color: '#F2F4F8', 
              fontWeight: 700, 
              fontSize: '0.95rem', 
              margin: 0, 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px',
              fontFamily: 'Space Grotesk, sans-serif'
            }}>
              <User size={17} color="#6C63FF" /> 
              Reporter Protocol Signature
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <div className="form-input-wrapper">
                  <User size={15} className="form-input-icon" />
                  <input 
                    name="contactName" 
                    type="text" 
                    placeholder="Enter your name" 
                    value={form.contactName} 
                    onChange={onChange} 
                    className={`form-input ${errors.contactName ? 'input-error' : ''}`} 
                  />
                </div>
                {errors.contactName && <span className="error-msg">{errors.contactName}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">College Email *</label>
                <div className="form-input-wrapper">
                  <Mail size={15} className="form-input-icon" />
                  <input 
                    name="contactEmail" 
                    type="email" 
                    placeholder="you@college.edu.in" 
                    value={form.contactEmail} 
                    onChange={onChange} 
                    className={`form-input ${errors.contactEmail ? 'input-error' : ''}`} 
                  />
                </div>
                {errors.contactEmail && <span className="error-msg">{errors.contactEmail}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">Phone Prefix (Optional)</label>
                <div className="form-input-wrapper">
                  <Phone size={15} className="form-input-icon" />
                  <input 
                    name="contactPhone" 
                    type="tel" 
                    placeholder="e.g. +91 98765 43210" 
                    value={form.contactPhone} 
                    onChange={onChange} 
                    className="form-input" 
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Submit Action */}
          <button 
            type="submit" 
            disabled={loading} 
            className="btn-primary animate-pulse-glow" 
            style={{ 
              width: '100%', 
              padding: '14px', 
              fontSize: '0.95rem', 
              opacity: loading ? 0.7 : 1, 
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            {loading ? (
              <>
                <span style={{ 
                  width: '16px', 
                  height: '16px', 
                  border: '2px solid rgba(255,255,255,0.3)', 
                  borderTopColor: '#fff', 
                  borderRadius: '50%', 
                  animation: 'spin 0.8s linear infinite' 
                }} /> 
                Compiling Node Packet...
              </>
            ) : (
              <>
                Publish Incident Broadcast
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>
      </main>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
      
      <Footer />
    </div>
  );
}
