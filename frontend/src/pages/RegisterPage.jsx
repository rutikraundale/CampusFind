import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  User, 
  Mail, 
  Phone, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  AlertCircle, 
  CheckCircle, 
  Building,
  MapPin,
  RotateCcw
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { authAPI } from '../services/api';

const initialForm = {
  username: '',
  email: '',
  college_id: '',
  mobile: '',
  password: '',
  confirmPassword: '',
};
const STUDENT_EMAIL_DOMAIN = 'kbtcoe.org';

const normalizeMobile = (mobile) => {
  const compact = mobile.trim().replace(/[\s()-]/g, '');
  const nationalNumber = compact.startsWith('+91') ? compact.slice(3) : compact;
  return /^[6-9]\d{9}$/.test(nationalNumber);
};

const isCampusEmail = (email) => {
  const normalized = email.trim().toLowerCase();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized) &&
    normalized.split('@')[1] === STUDENT_EMAIL_DOMAIN;
};

export default function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  
  // Registration flow state
  const [step, setStep] = useState(1); // 1 = form, 2 = otp verification
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // OTP state
  const [otp, setOtp] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState('');

  const onChange = (e) => {
    setForm(p => ({ ...p, [e.target.name]: e.target.value }));
    if (errors[e.target.name]) setErrors(p => ({ ...p, [e.target.name]: '' }));
    setApiError('');
  };

  const getPasswordStrength = (pass) => {
    let score = 0;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    return score;
  };

  const validate = () => {
    const errs = {};
    if (!form.username.trim()) errs.username = 'Full name is required';
    if (!form.email.trim()) errs.email = 'Campus email is required';
    else if (!isCampusEmail(form.email)) errs.email = 'Use your exact @kbtcoe.org campus email address';
    if (!form.college_id.trim()) errs.college_id = 'College ID is required';
    if (!form.mobile.trim()) errs.mobile = 'Mobile number is required';
    else if (!normalizeMobile(form.mobile)) errs.mobile = 'Enter a valid 10-digit Indian mobile number';
    if (!form.password) errs.password = 'Password is required';
    else if (form.password.length < 8) errs.password = 'Password must be at least 8 characters';
    else if (new TextEncoder().encode(form.password).length > 72) errs.password = 'Password must be no more than 72 bytes';
    if (form.password !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match';
    return errs;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    setApiError(''); 

    try {
      await authAPI.register({
        username: form.username.trim(),
        email: form.email.trim().toLowerCase(),
        college_id: form.college_id.trim(),
        mobile: form.mobile.trim(),
        password: form.password,
      });

      setSuccessMessage('Registration initiated. Enter the 6-digit OTP sent to your campus email.');
      setStep(2);
    } catch (err) {
      setApiError(err.message || 'Registration failed. Please check details and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) {
      setOtpError('Please enter a valid 6-digit verification code.');
      return;
    }

    setOtpLoading(true);
    setOtpError('');

    try {
      const verification = await authAPI.verifyOTP({
        email: form.email.trim().toLowerCase(),
        otp: otp.trim(),
      });

      const user = verification.data?.user;
      const token = verification.data?.accessToken;
      if (!user || !token) {
        throw new Error('Email verified, but sign-in could not be completed. Please sign in.');
      }

      localStorage.setItem('campusfind_user', JSON.stringify({ ...user, token }));
      localStorage.setItem('campusfind_token', token);
      navigate('/search');
    } catch (err) {
      setOtpError(err.message || 'Invalid verification code. Please try again.');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setResendLoading(true);
    setResendSuccess('');
    setOtpError('');

    try {
      const response = await authAPI.resendOTP({ email: form.email.trim().toLowerCase() });
      setResendSuccess(response.message || 'If a registration is pending, a new code will be sent.');
    } catch (err) {
      setOtpError(err.message || 'Failed to resend code.');
    } finally {
      setResendLoading(false);
    }
  };

  const strength = getPasswordStrength(form.password);

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
        <div style={{ width: '100%', maxWidth: '520px' }}>
          <div
            style={{
              background: 'var(--color-bone)',
              border: '1px solid var(--color-stone)',
              borderRadius: '4px',
              padding: '36px 32px',
              boxShadow: 'var(--shadow-warm)',
            }}
          >
            {/* Logo & Header */}
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
                {step === 1 ? 'Create an Account' : 'Verify Campus Email'}
              </h1>
              <p
                style={{
                  fontFamily: 'var(--font-cursorgothic)',
                  fontSize: '14px',
                  color: 'var(--color-driftwood)',
                  margin: 0,
                }}
              >
                {step === 1 ? 'Join the campus lost & found network' : `Enter the 6-digit verification code sent to ${form.email}`}
              </p>
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

            {/* Success message */}
            {successMessage && step === 2 && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '8px',
                  padding: '10px 12px',
                  background: '#e5ede7',
                  border: '1px solid #b8d4c5',
                  borderRadius: '4px',
                  marginBottom: '18px',
                }}
              >
                <CheckCircle size={15} color="var(--color-forest)" style={{ marginTop: '2px', flexShrink: 0 }} />
                <p style={{ color: 'var(--color-forest)', fontSize: '13px', margin: 0, lineHeight: 1.4 }}>
                  {successMessage}
                </p>
              </div>
            )}

            {step === 1 ? (
              /* Step 1: Registration Form */
              <form onSubmit={handleRegister} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <div className="form-input-wrapper">
                    <User size={14} className="form-input-icon" />
                    <input
                      name="username"
                      type="text"
                      placeholder="Alex Morgan"
                      value={form.username}
                      onChange={onChange}
                      className={`form-input ${errors.username ? 'input-error' : ''}`}
                    />
                  </div>
                  {errors.username && <span className="error-msg">{errors.username}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label">Campus Email *</label>
                  <div className="form-input-wrapper">
                    <Mail size={14} className="form-input-icon" />
                    <input
                      name="email"
                      type="email"
                      placeholder="alex.m@kbtcoe.org"
                      value={form.email}
                      onChange={onChange}
                      className={`form-input ${errors.email ? 'input-error' : ''}`}
                    />
                  </div>
                  <span style={{ color: 'var(--color-driftwood)', fontSize: '12px' }}>
                    Registration is limited to addresses ending exactly in @kbtcoe.org.
                  </span>
                  {errors.email && <span className="error-msg">{errors.email}</span>}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
                  <div className="form-group">
                    <label className="form-label">College Roll / ID *</label>
                    <div className="form-input-wrapper">
                      <Building size={14} className="form-input-icon" />
                      <input
                        name="college_id"
                        type="text"
                        placeholder="CS2026-042"
                        value={form.college_id}
                        onChange={onChange}
                        className={`form-input ${errors.college_id ? 'input-error' : ''}`}
                      />
                    </div>
                    {errors.college_id && <span className="error-msg">{errors.college_id}</span>}
                  </div>

                  <div className="form-group">
                    <label className="form-label">10-Digit Mobile *</label>
                    <div className="form-input-wrapper">
                      <Phone size={14} className="form-input-icon" />
                      <input
                        name="mobile"
                        type="tel"
                        placeholder="9876543210 or +91 9876543210"
                        value={form.mobile}
                        onChange={onChange}
                        className={`form-input ${errors.mobile ? 'input-error' : ''}`}
                      />
                    </div>
                    {errors.mobile && <span className="error-msg">{errors.mobile}</span>}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Password *</label>
                  <div className="form-input-wrapper" style={{ position: 'relative' }}>
                    <Lock size={14} className="form-input-icon" />
                    <input
                      name="password"
                      type={showPass ? 'text' : 'password'}
                      placeholder="Min 8 characters"
                      value={form.password}
                      onChange={onChange}
                      className={`form-input ${errors.password ? 'input-error' : ''}`}
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

                  {/* Password strength */}
                  {form.password && (
                    <div style={{ marginTop: '6px' }}>
                      <div style={{ height: '3px', background: 'var(--color-linen)', borderRadius: '2px', display: 'flex', gap: '3px' }}>
                        {[1, 2, 3, 4].map((stepIdx) => (
                          <div
                            key={stepIdx}
                            style={{
                              flex: 1,
                              height: '100%',
                              borderRadius: '2px',
                              background: strength >= stepIdx ? (strength > 2 ? 'var(--color-forest)' : 'var(--color-amber)') : 'transparent',
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">Confirm Password *</label>
                  <div className="form-input-wrapper" style={{ position: 'relative' }}>
                    <Lock size={14} className="form-input-icon" />
                    <input
                      name="confirmPassword"
                      type={showConfirm ? 'text' : 'password'}
                      placeholder="Re-enter password"
                      value={form.confirmPassword}
                      onChange={onChange}
                      className={`form-input ${errors.confirmPassword ? 'input-error' : ''}`}
                      style={{ paddingRight: '40px' }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      style={{
                        position: 'absolute',
                        right: '12px',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: 'var(--color-ash)',
                        padding: 0,
                      }}
                      aria-label="Toggle confirm password visibility"
                    >
                      {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                  {errors.confirmPassword && <span className="error-msg">{errors.confirmPassword}</span>}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary"
                  style={{
                    width: '100%',
                    padding: '11px',
                    fontSize: '14px',
                    marginTop: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                  }}
                >
                  {loading ? 'Sending Verification Code...' : 'Continue to Email Verification'}
                  <ArrowRight size={14} />
                </button>
              </form>
            ) : (
              /* Step 2: OTP Verification */
              <form onSubmit={handleVerifyOTP} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label" style={{ textAlign: 'center' }}>Enter 6-Digit Code</label>
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="••••••"
                    value={otp}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '').substring(0, 6);
                      setOtp(val);
                      setOtpError('');
                    }}
                    style={{
                      width: '100%',
                      padding: '12px',
                      background: '#ffffff',
                      border: '1px solid var(--color-stone)',
                      borderRadius: '4px',
                      color: 'var(--color-ink)',
                      fontSize: '22px',
                      fontFamily: 'var(--font-berkeleymono)',
                      letterSpacing: '0.35em',
                      textAlign: 'center',
                      outline: 'none',
                    }}
                  />
                  {otpError && <span className="error-msg" style={{ textAlign: 'center' }}>{otpError}</span>}
                </div>

                {resendSuccess && (
                  <p style={{ color: 'var(--color-forest)', fontSize: '12px', textAlign: 'center', margin: 0 }}>
                    {resendSuccess}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={otpLoading}
                  className="btn-primary"
                  style={{
                    width: '100%',
                    padding: '11px',
                    fontSize: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                  }}
                >
                  {otpLoading ? 'Verifying...' : 'Verify & Enter CampusFind'}
                  <ArrowRight size={14} />
                </button>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setStep(1);
                      setOtp('');
                      setOtpError('');
                      setResendSuccess('');
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--color-ash)',
                      cursor: 'pointer',
                      fontSize: '12px',
                    }}
                  >
                    ← Edit Details
                  </button>
                  <button
                    type="button"
                    onClick={handleResendOTP}
                    disabled={resendLoading}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--color-ember)',
                      cursor: 'pointer',
                      fontSize: '12px',
                      textDecoration: 'underline',
                    }}
                  >
                    {resendLoading ? 'Sending...' : 'Resend Code'}
                  </button>
                </div>
              </form>
            )}

            {/* Footer link */}
            <div style={{ textAlign: 'center', marginTop: '24px', paddingTop: '18px', borderTop: '1px solid var(--color-stone)' }}>
              <p style={{ fontSize: '13px', color: 'var(--color-driftwood)', margin: 0 }}>
                Already registered?{' '}
                <Link
                  to="/login"
                  style={{
                    color: 'var(--color-ember)',
                    textDecoration: 'none',
                    fontWeight: 500,
                  }}
                >
                  Sign in here
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
