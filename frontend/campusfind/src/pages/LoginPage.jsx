import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MapPin, Mail, Lock, Eye, EyeOff, AlertCircle, ShieldCheck, ArrowRight } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { authAPI } from '../services/api';

export default function LoginPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '', role: 'student' });
  const [errors, setErrors] = useState({});
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  const onChange = (e) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    if (errors[e.target.name]) setErrors(p => { const n = { ...p }; delete n[e.target.name]; return n; });
    setApiError('');
  };

  const validate = () => {
    const errs = {};
    if (!form.email.trim()) {
      errs.email = 'Email or Student Username is required';
    } else if (form.email.includes('@')) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
        errs.email = 'Invalid college email format';
      }
    } else {
      if (!/^[a-zA-Z0-9_]+$/.test(form.email)) {
        errs.email = 'Username must contain only letters, numbers, and underscores';
      }
    }
    
    if (!form.password) {
      errs.password = 'Password is required';
    }
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true); 
    setApiError('');
    try {
      // 1. Build backend-compliant body structure
      const requestBody = {
        password: form.password,
        role: form.role === 'student' ? 'Student' : 'admin'
      };

      if (form.email.includes('@')) {
        requestBody.email = form.email;
      } else {
        requestBody.username = form.email;
      }

      // 2. Perform live Axios authentication
      const res = await authAPI.login(requestBody);
      const { user, accessToken } = res.data;

      // 3. Persist details in session store
      localStorage.setItem('campusfind_user', JSON.stringify({
        ...user,
        token: accessToken
      }));

      // 4. Route based on role
      navigate(form.role === 'admin' ? '/admin/dashboard' : '/search');
    } catch (err) {
      setApiError(err.message || 'Invalid credentials. Please verify and try again.');
    } finally { 
      setLoading(false); 
    }
  };

  return (
    <div className="page-wrapper" style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column',
      background: '#05070E', 
      color: '#F2F4F8',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Cyber Grid background */}
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
        padding: '120px 24px 60px',
        position: 'relative',
        zIndex: 1 
      }}>
        <div style={{ width: '100%', maxWidth: '460px', position: 'relative' }}>
          
          {/* Card Border Glow */}
          <div style={{
            position: 'absolute',
            inset: '-2px',
            background: 'linear-gradient(135deg, #6C63FF 0%, #38BDF8 100%)',
            borderRadius: '26px',
            filter: 'blur(10px)',
            opacity: 0.15,
            zIndex: 0,
            pointerEvents: 'none'
          }} />

          <div className="glass-card animate-fadeInUp" style={{ 
            padding: '40px 32px',
            background: 'linear-gradient(135deg, rgba(16, 18, 31, 0.8) 0%, rgba(10, 11, 20, 0.9) 100%)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            position: 'relative',
            zIndex: 1
          }}>
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <Link to="/" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                <div style={{ 
                  width: '38px', 
                  height: '38px', 
                  background: 'linear-gradient(135deg,#6C63FF,#A78BFA)', 
                  borderRadius: '10px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  boxShadow: '0 4px 16px rgba(108,99,255,0.35)'
                }}>
                  <MapPin size={18} color="#fff" />
                </div>
                <span style={{ fontFamily: 'Space Grotesk,sans-serif', fontWeight: 700, fontSize: '1.15rem', color: '#F0F0FF' }}>
                  Campus<span style={{ color: '#6C63FF' }}>Find</span>
                </span>
              </Link>
              <h1 style={{ fontFamily: 'Space Grotesk,sans-serif', fontSize: '1.6rem', fontWeight: 700, color: '#F2F4F8', marginBottom: '6px' }}>
                Welcome Back
              </h1>
              <p style={{ color: '#AEB6C7', fontSize: '0.88rem' }}>
                Sign in to synchronize with the campus database
              </p>
            </div>

            {/* Role selector tab strip */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: '1fr 1fr', 
              background: 'rgba(5, 7, 14, 0.6)', 
              border: '1px solid rgba(255,255,255,0.06)', 
              borderRadius: '12px', 
              padding: '3px', 
              marginBottom: '28px' 
            }}>
              {['student', 'admin'].map(role => (
                <button 
                  key={role} 
                  type="button" 
                  onClick={() => setForm(f => ({ ...f, role }))} 
                  style={{ 
                    padding: '10px', 
                    borderRadius: '9px', 
                    border: 'none', 
                    cursor: 'pointer', 
                    fontSize: '0.85rem', 
                    fontWeight: 600, 
                    transition: 'all 0.25s ease', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    gap: '6px', 
                    background: form.role === role ? 'linear-gradient(135deg,#6C63FF,#A78BFA)' : 'transparent', 
                    color: form.role === role ? '#fff' : '#5A5E7A', 
                    boxShadow: form.role === role ? '0 4px 14px rgba(108,99,255,0.25)' : 'none' 
                  }}
                >
                  {role === 'admin' && <ShieldCheck size={14} />}
                  {role.charAt(0).toUpperCase() + role.slice(1)} Access
                </button>
              ))}
            </div>

            {apiError && (
              <div style={{ 
                display: 'flex', 
                gap: '10px', 
                padding: '12px 14px', 
                background: 'rgba(239,68,68,0.1)', 
                border: '1px solid rgba(239,68,68,0.25)', 
                borderRadius: '10px', 
                marginBottom: '20px' 
              }}>
                <AlertCircle size={16} color="#EF4444" style={{ flexShrink: 0, marginTop: '2px' }} />
                <p style={{ color: '#EF4444', fontSize: '0.82rem' }}>{apiError}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* Username / Email field */}
              <div className="form-group">
                <label className="form-label">College Email / Username</label>
                <div className="form-input-wrapper">
                  <Mail size={16} className="form-input-icon" />
                  <input 
                    name="email" 
                    type="text" 
                    placeholder="you@college.edu.in or registration_no" 
                    value={form.email} 
                    onChange={onChange} 
                    className={`form-input ${errors.email ? 'input-error' : ''}`} 
                  />
                </div>
                {errors.email && <span className="error-msg">{errors.email}</span>}
              </div>

              {/* Password field */}
              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label className="form-label">Security Password</label>
                  <a href="#" style={{ fontSize: '0.78rem', color: '#A78BFA', textDecoration: 'none', fontWeight: 600 }}>
                    Recover Key?
                  </a>
                </div>
                <div className="form-input-wrapper">
                  <Lock size={16} className="form-input-icon" />
                  <input 
                    name="password" 
                    type={showPass ? 'text' : 'password'} 
                    placeholder="••••••••••••" 
                    value={form.password} 
                    onChange={onChange} 
                    className={`form-input ${errors.password ? 'input-error' : ''}`} 
                    style={{ paddingRight: '48px' }} 
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPass(p => !p)} 
                    style={{ 
                      position: 'absolute', 
                      right: '14px', 
                      top: '50%', 
                      transform: 'translateY(-50%)', 
                      background: 'none', 
                      border: 'none', 
                      cursor: 'pointer', 
                      color: '#5A5E7A' 
                    }}
                  >
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.password && <span className="error-msg">{errors.password}</span>}
              </div>

              {/* Submit button */}
              <button 
                type="submit" 
                disabled={loading} 
                className="btn-primary animate-pulse-glow" 
                style={{ 
                  width: '100%', 
                  padding: '13px', 
                  fontSize: '0.92rem', 
                  marginTop: '10px',
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
                    Verifying Identity...
                  </>
                ) : (
                  <>
                    Sign In to Profile
                    <ArrowRight size={15} />
                  </>
                )}
              </button>
            </form>

            <div style={{ width: '100%', height: '1px', background: 'rgba(255,255,255,0.06)', margin: '28px 0' }} />

            <p style={{ textAlign: 'center', color: '#AEB6C7', fontSize: '0.85rem' }}>
              New to the system?{' '}
              <Link to="/register" style={{ color: '#6C63FF', textDecoration: 'none', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
                Join CampusFind <ArrowRight size={12} />
              </Link>
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      <Footer />
    </div>
  );
}
