import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle, MapPin, User, ShieldCheck } from 'lucide-react';
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

  useEffect(() => {
    try {
      const user = JSON.parse(localStorage.getItem('campusfind_user') || 'null');
      if (user?.role === 'admin') {
        navigate('/admin/dashboard', { replace: true });
      } else if (user && user.role !== 'Student') {
        localStorage.removeItem('campusfind_user');
        localStorage.removeItem('campusfind_token');
      }
    } catch {
      localStorage.removeItem('campusfind_user');
      localStorage.removeItem('campusfind_token');
    }
  }, [navigate]);

  const onChange = (e) => {
    setForm(p => ({ ...p, [e.target.name]: e.target.value }));
    if (errors[e.target.name]) setErrors(p => ({ ...p, [e.target.name]: '' }));
    setApiError('');
  };

  const validate = () => {
    const errs = {};
    if (!form.email.trim()) errs.email = 'Email address is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Enter a valid email address';
    if (!form.password) errs.password = 'Password is required';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    setApiError('');

    try {
      const res = await authAPI.login({
        email: form.email.trim(),
        password: form.password,
        role: form.role,
      });

      const user = res.data?.user;
      const token = res.data?.accessToken;

      if (!user || !token) {
        throw new Error('Login succeeded without an access token. Please try signing in again.');
      }

      localStorage.setItem('campusfind_user', JSON.stringify({ ...user, token }));
      localStorage.setItem('campusfind_token', token);

      if (user.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/search');
      }
    } catch (err) {
      setApiError(err.message || 'Invalid credentials. Please verify your email and password.');
    } finally {
      setLoading(false);
    }
  };

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
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '64px 24px 80px',
        }}
      >
        <div style={{ width: '100%', maxWidth: '440px' }}>
          {/* Card */}
          <div
            style={{
              background: 'var(--color-bone)',
              border: '1px solid var(--color-stone)',
              borderRadius: '4px',
              padding: '36px 32px',
              boxShadow: 'var(--shadow-warm)',
            }}
          >
            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: '28px' }}>
              <Link
                to="/"
                style={{
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '20px',
                }}
              >
                <div
                  style={{
                    width: '26px',
                    height: '26px',
                    background: 'var(--color-ink)',
                    borderRadius: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <MapPin size={13} color="#f7f7f4" strokeWidth={2.2} />
                </div>
                <span
                  style={{
                    fontFamily: 'var(--font-cursorgothic)',
                    fontWeight: 500,
                    fontSize: '15px',
                    color: 'var(--color-ink)',
                    letterSpacing: '-0.02em',
                  }}
                >
                  CampusFind
                </span>
              </Link>
              <h1
                style={{
                  fontFamily: 'var(--font-cursorgothic)',
                  fontSize: '1.75rem',
                  fontWeight: 400,
                  color: 'var(--color-ink)',
                  marginBottom: '6px',
                  letterSpacing: '-0.02em',
                }}
              >
                Welcome Back
              </h1>
              <p
                style={{
                  fontFamily: 'var(--font-cursorgothic)',
                  fontSize: '14px',
                  color: 'var(--color-driftwood)',
                  margin: 0,
                }}
              >
                Sign in to your campus account
              </p>
            </div>

            {/* Role selector */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                background: 'var(--color-linen)',
                border: '1px solid var(--color-stone)',
                borderRadius: '4px',
                padding: '3px',
                marginBottom: '24px',
              }}
            >
              {[
                { id: 'student', label: 'Student Portal', icon: User },
                { id: 'admin', label: 'Administrator', icon: ShieldCheck },
              ].map((item) => {
                const RoleIcon = item.icon;
                const active = form.role === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setForm(p => ({ ...p, role: item.id }))}
                    style={{
                      padding: '8px 10px',
                      borderRadius: '3px',
                      border: active ? '1px solid var(--color-stone)' : '1px solid transparent',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: active ? 500 : 400,
                      fontFamily: 'var(--font-cursorgothic)',
                      transition: 'all 150ms ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      background: active ? '#ffffff' : 'transparent',
                      color: 'var(--color-ink)',
                      letterSpacing: '-0.01em',
                      boxShadow: active ? 'var(--shadow-warm)' : 'none',
                    }}
                  >
                    <RoleIcon size={13} />
                    {item.label}
                  </button>
                );
              })}
            </div>

            {/* Error banner */}
            {apiError && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '8px',
                  padding: '10px 12px',
                  background: '#fcebed',
                  border: '1px solid #f5b8c3',
                  borderRadius: '4px',
                  marginBottom: '18px',
                }}
              >
                <AlertCircle size={15} color="var(--color-crimson)" style={{ marginTop: '2px', flexShrink: 0 }} />
                <p style={{ color: 'var(--color-crimson)', fontSize: '13px', margin: 0, lineHeight: 1.4 }}>
                  {apiError}
                </p>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">Campus Email</label>
                <div className="form-input-wrapper">
                  <Mail size={14} className="form-input-icon" />
                  <input
                    name="email"
                    type="email"
                    placeholder="student@college.edu"
                    value={form.email}
                    onChange={onChange}
                    className={`form-input ${errors.email ? 'input-error' : ''}`}
                    autoComplete="email"
                  />
                </div>
                {errors.email && <span className="error-msg">{errors.email}</span>}
              </div>

              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label className="form-label">Password</label>
                  <a
                    href="#"
                    style={{
                      fontSize: '12px',
                      color: 'var(--color-ember)',
                      textDecoration: 'none',
                    }}
                  >
                    Forgot password?
                  </a>
                </div>
                <div className="form-input-wrapper" style={{ position: 'relative' }}>
                  <Lock size={14} className="form-input-icon" />
                  <input
                    name="password"
                    type={showPass ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={form.password}
                    onChange={onChange}
                    className={`form-input ${errors.password ? 'input-error' : ''}`}
                    autoComplete="current-password"
                    style={{ paddingRight: '40px' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: 'var(--color-ash)',
                      padding: 0,
                    }}
                    aria-label="Toggle password visibility"
                  >
                    {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {errors.password && <span className="error-msg">{errors.password}</span>}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary"
                style={{
                  width: '100%',
                  padding: '11px',
                  fontSize: '14px',
                  marginTop: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                }}
              >
                {loading ? 'Authenticating...' : 'Sign In'}
                <ArrowRight size={14} />
              </button>
            </form>

            {/* Footer link */}
            <div style={{ textAlign: 'center', marginTop: '24px', paddingTop: '18px', borderTop: '1px solid var(--color-stone)' }}>
              <p style={{ fontSize: '13px', color: 'var(--color-driftwood)', margin: 0 }}>
                Don't have an account yet?{' '}
                <Link
                  to="/register"
                  style={{
                    color: 'var(--color-ember)',
                    textDecoration: 'none',
                    fontWeight: 500,
                  }}
                >
                  Create student account
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
