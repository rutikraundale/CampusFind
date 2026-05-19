import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MapPin, User, Mail, Lock, Eye, EyeOff, GraduationCap, Phone, AlertCircle, ArrowRight } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { authAPI } from '../services/api';

const validate = (form) => {
  const errors = {};
  if (!form.username.trim()) {
    errors.username = 'Username is required';
  } else if (!/^[a-zA-Z0-9_]+$/.test(form.username)) {
    errors.username = 'Username must contain only alphanumeric characters and underscores';
  }

  if (!form.email.trim()) {
    errors.email = 'College email is required';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = 'Invalid email address format';
  }

  if (!form.CollegeID.trim()) {
    errors.CollegeID = 'College ID is required';
  }

  if (!form.phone.trim()) {
    errors.phone = 'Phone number is required';
  } else if (!/^\d{10}$/.test(form.phone)) {
    errors.phone = 'Phone number must be exactly 10 digits';
  }

  if (!form.password) {
    errors.password = 'Password is required';
  } else if (form.password.length < 6) {
    errors.password = 'Password must be at least 6 characters long';
  }

  if (!form.confirmPassword) {
    errors.confirmPassword = 'Confirm password is required';
  } else if (form.confirmPassword !== form.password) {
    errors.confirmPassword = 'Passwords do not match';
  }

  return errors;
};

export default function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', CollegeID: '', email: '', phone: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  // OTP flow states
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const onChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    if (errors[e.target.name]) setErrors(prev => { const n = { ...prev }; delete n[e.target.name]; return n; });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate(form);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true); 
    setApiError('');
    try {
      // 1. Build backend-compliant body structure with correct key mapping
      const requestBody = {
        username: form.username,
        college_id: form.CollegeID,
        email: form.email,
        password: form.password,
        mobile: form.phone
      };

      // 2. Perform live Axios registration call
      const res = await authAPI.register(requestBody);

      // Store unverified student details in localStorage
      localStorage.setItem('campusfind_user', JSON.stringify({
        ...res.data,
        role: 'student',
        token: null
      }));

      // 3. Show OTP screen instead of direct login redirection
      setIsOtpSent(true);
      setSuccessMsg('Verification OTP has been sent to your email.');
      setTimeout(() => setSuccessMsg(''), 5000);
    } catch (err) {
      setApiError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp || otp.trim().length !== 6) {
      setOtpError('Please enter a valid 6-digit OTP code.');
      return;
    }
    setVerifying(true);
    setOtpError('');
    setSuccessMsg('');
    try {
      const res = await authAPI.verifyOTP({ email: form.email, otp: otp.trim() });
      
      // Update verified user details in localStorage
      const userStr = localStorage.getItem('campusfind_user');
      if (userStr) {
        const storedUser = JSON.parse(userStr);
        storedUser.isEmailVerified = true;
        if (res.data && res.data.user) {
          Object.assign(storedUser, res.data.user);
          if (res.data.accessToken) {
            storedUser.token = res.data.accessToken;
          }
        }
        localStorage.setItem('campusfind_user', JSON.stringify(storedUser));
      } else if (res.data && res.data.user) {
        localStorage.setItem('campusfind_user', JSON.stringify({
          ...res.data.user,
          token: res.data.accessToken,
          role: 'student'
        }));
      }

      setSuccessMsg('Email verified successfully! Account is now active. Redirecting...');
      setTimeout(() => {
        navigate('/search');
      }, 2000);
    } catch (err) {
      setOtpError(err.message || 'OTP verification failed. Please try again.');
    } finally {
      setVerifying(false);
    }
  };

  const handleResendOtp = async () => {
    setResending(true);
    setOtpError('');
    setSuccessMsg('');
    try {
      await authAPI.resendOTP({ email: form.email });
      setSuccessMsg('A new OTP code has been successfully dispatched to your email.');
      setTimeout(() => setSuccessMsg(''), 5000);
    } catch (err) {
      setOtpError(err.message || 'Failed to resend verification OTP. Please try again.');
    } finally {
      setResending(false);
    }
  };

  const strength = form.password.length === 0 ? 0 : form.password.length < 6 ? 1 : form.password.length < 10 ? 2 : 3;
  const strengthColor = ['#5A5E7A', '#EF4444', '#F59E0B', '#22C55E'][strength];
  const strengthLabel = ['', 'Weak Secure-Key', 'Moderate Secure-Key', 'Highly Encrypted Key'][strength];

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
        <div style={{ width: '100%', maxWidth: '520px', position: 'relative' }}>
          
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
            {!isOtpSent ? (
              <>
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                  <div style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
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
                  </div>
                  <h1 style={{ fontFamily: 'Space Grotesk,sans-serif', fontSize: '1.6rem', fontWeight: 700, color: '#F2F4F8', marginBottom: '6px' }}>
                    Create Campus Account
                  </h1>
                  <p style={{ color: '#AEB6C7', fontSize: '0.88rem' }}>
                    Register to post claims and recover lost property
                  </p>
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

                <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                  
                  {/* Username field */}
                  <div className="form-group">
                    <label className="form-label">Username</label>
                    <div className="form-input-wrapper">
                      <User size={16} className="form-input-icon" />
                      <input 
                        name="username" 
                        type="text" 
                        placeholder="e.g. alexxyz" 
                        value={form.username} 
                        onChange={onChange} 
                        className={`form-input ${errors.username ? 'input-error' : ''}`} 
                      />
                    </div>
                    {errors.username && <span className="error-msg">{errors.username}</span>}
                  </div>

                  {/* Email field */}
                  <div className="form-group">
                    <label className="form-label">Email Address</label>
                    <div className="form-input-wrapper">
                      <Mail size={16} className="form-input-icon" />
                      <input 
                        name="email" 
                        type="email" 
                        placeholder="you@gmail.com" 
                        value={form.email} 
                        onChange={onChange} 
                        className={`form-input ${errors.email ? 'input-error' : ''}`} 
                      />
                    </div>
                    {errors.email && <span className="error-msg">{errors.email}</span>}
                  </div>

                  {/* College ID & Phone in Two Column */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div className="form-group">
                      <label className="form-label">College Email ID</label>
                      <div className="form-input-wrapper">
                        <GraduationCap size={16} className="form-input-icon" />
                        <input 
                          name="CollegeID" 
                          type="text" 
                          placeholder="kbtug123@kbtcoe.org" 
                          value={form.CollegeID} 
                          onChange={onChange} 
                          className={`form-input ${errors.CollegeID ? 'input-error' : ''}`} 
                        />
                      </div>
                      {errors.CollegeID && <span className="error-msg">{errors.CollegeID}</span>}
                    </div>

                    <div className="form-group">
                      <label className="form-label">Phone Number</label>
                      <div className="form-input-wrapper">
                        <Phone size={16} className="form-input-icon" />
                        <input 
                          name="phone" 
                          type="tel" 
                          placeholder="9876543210" 
                          value={form.phone} 
                          onChange={onChange} 
                          className={`form-input ${errors.phone ? 'input-error' : ''}`} 
                        />
                      </div>
                      {errors.phone && <span className="error-msg">{errors.phone}</span>}
                    </div>
                  </div>

                  {/* Password field */}
                  <div className="form-group">
                    <label className="form-label">Secure Access Password</label>
                    <div className="form-input-wrapper">
                      <Lock size={16} className="form-input-icon" />
                      <input 
                        name="password" 
                        type={showPass ? 'text' : 'password'} 
                        placeholder="Minimum 8 characters" 
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
                    {form.password && (
                      <div style={{ marginTop: '8px' }}>
                        <div style={{ display: 'flex', gap: '4px', marginBottom: '4px' }}>
                          {[1,2,3].map(i => (
                            <div 
                              key={i} 
                              style={{ 
                                height: '3px', 
                                flex: 1, 
                                borderRadius: '2px', 
                                background: strength >= i ? strengthColor : 'rgba(255,255,255,0.08)', 
                                transition: 'background 0.3s' 
                              }} 
                            />
                          ))}
                        </div>
                        <span style={{ fontSize: '0.72rem', color: strengthColor }}>{strengthLabel}</span>
                      </div>
                    )}
                    {errors.password && <span className="error-msg">{errors.password}</span>}
                  </div>

                  {/* Confirm Password field */}
                  <div className="form-group">
                    <label className="form-label">Confirm Password</label>
                    <div className="form-input-wrapper">
                      <Lock size={16} className="form-input-icon" />
                      <input 
                        name="confirmPassword" 
                        type={showConfirm ? 'text' : 'password'} 
                        placeholder="Confirm secure password" 
                        value={form.confirmPassword} 
                        onChange={onChange} 
                        className={`form-input ${errors.confirmPassword ? 'input-error' : ''}`} 
                        style={{ paddingRight: '48px' }} 
                      />
                      <button 
                        type="button" 
                        onClick={() => setShowConfirm(p => !p)} 
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
                        {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    {errors.confirmPassword && <span className="error-msg">{errors.confirmPassword}</span>}
                  </div>

                  <p style={{ fontSize: '0.78rem', color: '#5A5E7A', lineHeight: 1.5, marginTop: '4px' }}>
                    By signing up, you agree to our{' '}
                    <a href="#" style={{ color: '#6C63FF', textDecoration: 'none' }}>Terms of Service</a> and{' '}
                    <a href="#" style={{ color: '#6C63FF', textDecoration: 'none' }}>Data Protection Policy</a>.
                  </p>

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
                        Sending OTP...
                      </>
                    ) : (
                      <>
                        Complete Registration
                        <ArrowRight size={15} />
                      </>
                    )}
                  </button>
                </form>
              </>
            ) : (
              <>
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                  <div style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
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
                      <Mail size={18} color="#fff" />
                    </div>
                    <span style={{ fontFamily: 'Space Grotesk,sans-serif', fontWeight: 700, fontSize: '1.15rem', color: '#F0F0FF' }}>
                      Verify<span style={{ color: '#6C63FF' }}>Email</span>
                    </span>
                  </div>
                  <h1 style={{ fontFamily: 'Space Grotesk,sans-serif', fontSize: '1.6rem', fontWeight: 700, color: '#F2F4F8', marginBottom: '6px' }}>
                    Security Verification
                  </h1>
                  <p style={{ color: '#AEB6C7', fontSize: '0.88rem', lineHeight: '1.4' }}>
                    Enter the 6-digit OTP code sent to <strong style={{ color: '#F2F4F8' }}>{form.email}</strong>
                  </p>
                </div>

                {successMsg && (
                  <div style={{ 
                    display: 'flex', 
                    gap: '10px', 
                    padding: '12px 14px', 
                    background: 'rgba(34,197,94,0.1)', 
                    border: '1px solid rgba(34,197,94,0.25)', 
                    borderRadius: '10px', 
                    marginBottom: '20px' 
                  }}>
                    <div style={{ 
                      width: '16px', 
                      height: '16px', 
                      borderRadius: '50%', 
                      background: '#22C55E', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      flexShrink: 0,
                      marginTop: '2px'
                    }}>
                      <span style={{ color: '#05070E', fontSize: '10px', fontWeight: 'bold' }}>✓</span>
                    </div>
                    <p style={{ color: '#22C55E', fontSize: '0.82rem' }}>{successMsg}</p>
                  </div>
                )}

                {otpError && (
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
                    <p style={{ color: '#EF4444', fontSize: '0.82rem' }}>{otpError}</p>
                  </div>
                )}

                <form onSubmit={handleVerifyOtp} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                  
                  {/* OTP input field */}
                  <div className="form-group">
                    <label className="form-label" style={{ letterSpacing: '0.5px' }}>One-Time Password (OTP)</label>
                    <div className="form-input-wrapper">
                      <Lock size={16} className="form-input-icon" />
                      <input 
                        name="otp" 
                        type="text" 
                        maxLength="6"
                        placeholder="• • • • • •" 
                        value={otp} 
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, ''); // numeric only
                          setOtp(val);
                          if (otpError) setOtpError('');
                        }} 
                        className={`form-input ${otpError ? 'input-error' : ''}`}
                        style={{ 
                          textAlign: 'center', 
                          fontSize: '1.25rem', 
                          letterSpacing: '8px', 
                          fontFamily: 'monospace',
                          fontWeight: 'bold',
                          paddingLeft: '32px'
                        }}
                      />
                    </div>
                  </div>

                  {/* Verify button */}
                  <button 
                    type="submit" 
                    disabled={verifying} 
                    className="btn-primary animate-pulse-glow" 
                    style={{ 
                      width: '100%', 
                      padding: '13px', 
                      fontSize: '0.92rem', 
                      marginTop: '10px',
                      opacity: verifying ? 0.7 : 1, 
                      cursor: verifying ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px'
                    }}
                  >
                    {verifying ? (
                      <>
                        <span style={{ 
                          width: '16px', 
                          height: '16px', 
                          border: '2px solid rgba(255,255,255,0.3)', 
                          borderTopColor: '#fff', 
                          borderRadius: '50%', 
                          animation: 'spin 0.8s linear infinite' 
                        }} /> 
                        Verifying Code...
                      </>
                    ) : (
                      <>
                        Verify & Complete Registration
                        <ArrowRight size={15} />
                      </>
                    )}
                  </button>
                </form>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', fontSize: '0.82rem' }}>
                  <button 
                    type="button"
                    disabled={resending}
                    onClick={handleResendOtp}
                    style={{ 
                      background: 'none', 
                      border: 'none', 
                      color: resending ? '#5A5E7A' : '#6C63FF', 
                      cursor: resending ? 'not-allowed' : 'pointer',
                      fontWeight: 600,
                      padding: '4px 0',
                      transition: 'color 0.2s'
                    }}
                  >
                    {resending ? 'Sending code...' : 'Resend OTP'}
                  </button>
                  <button 
                    type="button"
                    onClick={() => {
                      setIsOtpSent(false);
                      setOtp('');
                      setOtpError('');
                      setSuccessMsg('');
                    }}
                    style={{ 
                      background: 'none', 
                      border: 'none', 
                      color: '#AEB6C7', 
                      cursor: 'pointer',
                      fontWeight: 500,
                      padding: '4px 0'
                    }}
                  >
                    Edit Email Address
                  </button>
                </div>
              </>
            )}

            <div style={{ width: '100%', height: '1px', background: 'rgba(255,255,255,0.06)', margin: '28px 0' }} />

            <p style={{ textAlign: 'center', color: '#AEB6C7', fontSize: '0.85rem' }}>
              Already registered?{' '}
              <Link to="/login" style={{ color: '#6C63FF', textDecoration: 'none', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
                Sign In to Profile <ArrowRight size={12} />
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
