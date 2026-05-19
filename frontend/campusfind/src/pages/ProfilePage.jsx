import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  User, 
  Mail, 
  Phone, 
  Shield, 
  CheckCircle, 
  AlertCircle, 
  MapPin, 
  Calendar, 
  Clock, 
  Trash2, 
  XCircle, 
  ExternalLink,
  ChevronRight,
  Info,
  Camera,
  Loader
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { itemsAPI, claimsAPI } from '../services/api';

export default function ProfilePage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('posts'); // 'posts' or 'claims'
  
  // Loading & Error States
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [loadingClaims, setLoadingClaims] = useState(true);
  const [posts, setPosts] = useState([]);
  const [claims, setClaims] = useState([]);
  
  // Interaction States
  const [isDeletingId, setIsDeletingId] = useState(null);
  const [isCancellingId, setIsCancellingId] = useState(null);

  // Authenticate user on load
  useEffect(() => {
    const userStr = localStorage.getItem('campusfind_user');
    if (!userStr) {
      navigate('/login', { replace: true });
      return;
    }
    try {
      const parsedUser = JSON.parse(userStr);
      setUser(parsedUser);
    } catch (e) {
      navigate('/login', { replace: true });
    }
  }, [navigate]);

  // Fetch student items & claims
  useEffect(() => {
    if (!user) return;

    const fetchPosts = async () => {
      setLoadingPosts(true);
      try {
        const res = await itemsAPI.getMyPosts();
        // Backend returns user posts in res.data or res
        setPosts(res.data || res || []);
      } catch (err) {
        console.error('Error fetching user posts:', err);
      } finally {
        setLoadingPosts(false);
      }
    };

    const fetchClaims = async () => {
      setLoadingClaims(true);
      try {
        const res = await claimsAPI.getMyClaims();
        setClaims(res.data || res || []);
      } catch (err) {
        console.error('Error fetching user claims:', err);
      } finally {
        setLoadingClaims(false);
      }
    };

    fetchPosts();
    fetchClaims();
  }, [user]);

  // Handle deleting a post
  const handleDeletePost = async (postId) => {
    if (!window.confirm('Are you sure you want to permanently remove this item listing? This action cannot be undone.')) {
      return;
    }
    setIsDeletingId(postId);
    try {
      await itemsAPI.delete(postId);
      setPosts(posts.filter(p => p._id !== postId));
      // Also refresh claims in case any active claim was tied to it
      const updatedClaims = await claimsAPI.getMyClaims();
      setClaims(updatedClaims.data || updatedClaims || []);
    } catch (err) {
      alert(err.message || 'Failed to delete listing.');
    } finally {
      setIsDeletingId(null);
    }
  };

  // Handle cancelling a claim
  const handleCancelClaim = async (claimId) => {
    if (!window.confirm('Are you sure you want to cancel your claim request for this item? The item status will revert back to Available.')) {
      return;
    }
    setIsCancellingId(claimId);
    try {
      await claimsAPI.cancel(claimId);
      setClaims(claims.filter(c => c._id !== claimId));
      // Refresh posted list to capture status reversion if owned by someone else
      const updatedPosts = await itemsAPI.getMyPosts();
      setPosts(updatedPosts.data || updatedPosts || []);
    } catch (err) {
      alert(err.message || 'Failed to cancel claim request.');
    } finally {
      setIsCancellingId(null);
    }
  };

  if (!user) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#05070E' }}>
        <Loader className="animate-spin" size={40} color="#6C63FF" />
      </div>
    );
  }

  return (
    <div className="page-wrapper" style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      background: '#05070E', 
      color: '#F2F4F8',
      minHeight: '100vh',
      fontFamily: 'Inter, sans-serif'
    }}>
      <Navbar />

      <main style={{ flex: 1, maxWidth: '1100px', width: '100%', margin: '0 auto', padding: '40px 24px' }}>
        
        {/* ─── PROFILE HEADER CARD ─── */}
        <section style={{
          background: 'radial-gradient(120% 120% at 0% 0%, rgba(108, 99, 255, 0.08) 0%, rgba(5, 7, 14, 0.6) 100%)',
          border: '1px solid rgba(108, 99, 255, 0.2)',
          borderRadius: '24px',
          padding: '36px',
          display: 'flex',
          flexDirection: 'row',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: '32px',
          marginBottom: '40px',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 10px 40px rgba(0,0,0,0.4)',
        }}>
          {/* Avatar Container */}
          <div style={{ position: 'relative' }}>
            <div style={{
              width: '100px',
              height: '100px',
              borderRadius: '24px',
              background: 'linear-gradient(135deg, #6C63FF, #A78BFA)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 30px rgba(108, 99, 255, 0.35)',
              border: '2px solid rgba(255, 255, 255, 0.1)',
            }}>
              <User size={48} color="#fff" />
            </div>
            <div style={{
              position: 'absolute',
              bottom: '-6px',
              right: '-6px',
              background: '#0A1020',
              border: '1px solid rgba(108, 99, 255, 0.4)',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#AEB6C7'
            }}>
              <Camera size={14} />
            </div>
          </div>

          {/* User Details */}
          <div style={{ flex: 1, minWidth: '260px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px', flexWrap: 'wrap' }}>
              <h2 style={{ 
                fontFamily: 'Space Grotesk, sans-serif', 
                fontWeight: 800, 
                fontSize: '1.8rem', 
                margin: 0,
                color: '#F2F4F8',
                letterSpacing: '-0.02em'
              }}>
                {user.username || user.name || 'Campus Finder'}
              </h2>
              
              {user.isEmailVerified ? (
                <span className="badge badge-success" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px 10px' }}>
                  <CheckCircle size={12} /> Verified Student
                </span>
              ) : (
                <span className="badge badge-danger" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px 10px' }}>
                  <AlertCircle size={12} /> Email Unverified
                </span>
              )}
            </div>

            <p style={{ color: '#AEB6C7', fontSize: '0.92rem', margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Shield size={14} color="#6C63FF" />
              <span>Campus Role: <strong>{user.role || 'Student'}</strong></span>
              {user.college_id && (
                <>
                  <span style={{ color: '#5A5E7A' }}>•</span>
                  <span>ID: <strong>{user.college_id}</strong></span>
                </>
              )}
            </p>

            {/* Micro Details Grid */}
            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#AEB6C7', fontSize: '0.88rem' }}>
                <Mail size={14} color="#6C63FF" />
                <span>{user.email}</span>
              </div>
              {user.mobile && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#AEB6C7', fontSize: '0.88rem' }}>
                  <Phone size={14} color="#6C63FF" />
                  <span>{user.mobile}</span>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ─── TAB NAVIGATION ─── */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          marginBottom: '32px',
          gap: '24px'
        }}>
          <button
            onClick={() => setActiveTab('posts')}
            style={{
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'posts' ? '2px solid #6C63FF' : '2px solid transparent',
              color: activeTab === 'posts' ? '#F2F4F8' : '#5A5E7A',
              padding: '12px 6px',
              fontSize: '1rem',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <span>My Posted Reports</span>
            <span style={{
              background: activeTab === 'posts' ? 'rgba(108, 99, 255, 0.15)' : 'rgba(255, 255, 255, 0.03)',
              color: activeTab === 'posts' ? '#A78BFA' : '#5A5E7A',
              padding: '2px 8px',
              borderRadius: '20px',
              fontSize: '0.75rem',
              fontWeight: 600
            }}>
              {posts.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('claims')}
            style={{
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'claims' ? '2px solid #6C63FF' : '2px solid transparent',
              color: activeTab === 'claims' ? '#F2F4F8' : '#5A5E7A',
              padding: '12px 6px',
              fontSize: '1rem',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <span>My Claim Requests</span>
            <span style={{
              background: activeTab === 'claims' ? 'rgba(108, 99, 255, 0.15)' : 'rgba(255, 255, 255, 0.03)',
              color: activeTab === 'claims' ? '#A78BFA' : '#5A5E7A',
              padding: '2px 8px',
              borderRadius: '20px',
              fontSize: '0.75rem',
              fontWeight: 600
            }}>
              {claims.length}
            </span>
          </button>
        </div>

        {/* ─── TAB CONTENT: POSTED ITEMS ─── */}
        {activeTab === 'posts' && (
          <div>
            {loadingPosts ? (
              <div style={{ textAlign: 'center', padding: '48px 0', color: '#AEB6C7' }}>
                <Loader className="animate-spin" style={{ margin: '0 auto 12px' }} size={24} color="#6C63FF" />
                <span>Loading your reported items...</span>
              </div>
            ) : posts.length === 0 ? (
              <div style={{
                background: 'rgba(255,255,255,0.01)',
                border: '1px dashed rgba(255,255,255,0.08)',
                borderRadius: '20px',
                padding: '48px 24px',
                textAlign: 'center',
                color: '#AEB6C7'
              }}>
                <AlertCircle size={36} color="#5A5E7A" style={{ marginBottom: '14px' }} />
                <h4 style={{ margin: '0 0 8px', fontSize: '1rem', color: '#F2F4F8', fontWeight: 600 }}>No Posted Listings</h4>
                <p style={{ margin: '0 0 20px', fontSize: '0.85rem', color: '#5A5E7A' }}>
                  You haven't reported any lost or found items on the campus yet.
                </p>
                <Link to="/post-item" className="btn-primary" style={{ padding: '10px 24px', textDecoration: 'none', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  Report a Found Item
                </Link>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
                {posts.map(item => (
                  <div 
                    key={item._id} 
                    style={{
                      background: 'rgba(10, 16, 32, 0.4)',
                      border: '1px solid rgba(255,255,255,0.06)',
                      borderRadius: '20px',
                      overflow: 'hidden',
                      display: 'flex',
                      flexDirection: 'column',
                      transition: 'all 0.25s ease',
                      position: 'relative',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.border = '1px solid rgba(108, 99, 255, 0.3)';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.border = '1px solid rgba(255,255,255,0.06)';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    {/* Item Thumbnail */}
                    <div style={{ height: '160px', width: '100%', position: 'relative', background: '#0F1322', overflow: 'hidden' }}>
                      <img 
                        src={item.image.startsWith('http') ? item.image : `http://localhost:5000${item.image}`}
                        alt={item.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                      <span className={`badge ${item.status === 'claimed' ? 'badge-danger' : item.status === 'pending' ? 'badge-warning' : 'badge-success'}`} style={{
                        position: 'absolute',
                        top: '16px',
                        left: '16px',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        fontSize: '0.72rem'
                      }}>
                        {item.status}
                      </span>
                    </div>

                    {/* Item Info */}
                    <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                      <span className="badge badge-neutral" style={{ alignSelf: 'flex-start', marginBottom: '8px' }}>
                        {item.category}
                      </span>

                      <h4 style={{ margin: '0 0 10px', fontSize: '1.05rem', fontWeight: 700, color: '#F2F4F8', lineHeight: 1.4 }}>
                        {item.title}
                      </h4>

                      <p style={{ margin: '0 0 16px', fontSize: '0.85rem', color: '#AEB6C7', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', lineHeight: 1.5 }}>
                        {item.description}
                      </p>

                      <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: '14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: '#5A5E7A' }}>
                          <MapPin size={12} color="#6C63FF" />
                          <span>Last Seen: {item.foundAt}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: '#5A5E7A' }}>
                          <Calendar size={12} />
                          <span>Posted: {new Date(item.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions Panel */}
                    <div style={{
                      padding: '12px 20px',
                      background: 'rgba(255,255,255,0.02)',
                      borderTop: '1px solid rgba(255,255,255,0.05)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <Link 
                        to={`/search?id=${item._id}`}
                        style={{
                          fontSize: '0.8rem',
                          fontWeight: 600,
                          color: '#A78BFA',
                          textDecoration: 'none',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        View Details <ExternalLink size={12} />
                      </Link>

                      <button
                        onClick={() => handleDeletePost(item._id)}
                        disabled={isDeletingId === item._id}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#EF4444',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '0.8rem',
                          fontWeight: 600
                        }}
                      >
                        <Trash2 size={13} />
                        {isDeletingId === item._id ? 'Deleting...' : 'Delete'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ─── TAB CONTENT: CLAIMED REQUESTS ─── */}
        {activeTab === 'claims' && (
          <div>
            {loadingClaims ? (
              <div style={{ textAlign: 'center', padding: '48px 0', color: '#AEB6C7' }}>
                <Loader className="animate-spin" style={{ margin: '0 auto 12px' }} size={24} color="#6C63FF" />
                <span>Loading your claim requests...</span>
              </div>
            ) : claims.length === 0 ? (
              <div style={{
                background: 'rgba(255,255,255,0.01)',
                border: '1px dashed rgba(255,255,255,0.08)',
                borderRadius: '20px',
                padding: '48px 24px',
                textAlign: 'center',
                color: '#AEB6C7'
              }}>
                <XCircle size={36} color="#5A5E7A" style={{ marginBottom: '14px' }} />
                <h4 style={{ margin: '0 0 8px', fontSize: '1rem', color: '#F2F4F8', fontWeight: 600 }}>No Active Claims</h4>
                <p style={{ margin: '0 0 20px', fontSize: '0.85rem', color: '#5A5E7A' }}>
                  You haven't initiated claims for any lost items.
                </p>
                <Link to="/search" className="btn-primary" style={{ padding: '10px 24px', textDecoration: 'none', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  Browse Found Items
                </Link>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {claims.map(claim => {
                  const item = claim.itemId || {};
                  return (
                    <div
                      key={claim._id}
                      style={{
                        background: 'rgba(10, 16, 32, 0.4)',
                        border: '1px solid rgba(255,255,255,0.06)',
                        borderRadius: '20px',
                        padding: '24px',
                        display: 'flex',
                        flexDirection: 'row',
                        flexWrap: 'wrap',
                        gap: '24px',
                        position: 'relative',
                        transition: 'all 0.25s ease'
                      }}
                      onMouseEnter={e => e.currentTarget.style.border = '1px solid rgba(108, 99, 255, 0.25)'}
                      onMouseLeave={e => e.currentTarget.style.border = '1px solid rgba(255,255,255,0.06)'}
                    >
                      {/* Left side: Thumbnail */}
                      <div style={{ width: '130px', height: '100px', borderRadius: '12px', overflow: 'hidden', background: '#0F1322' }}>
                        {item.image ? (
                          <img 
                            src={item.image.startsWith('http') ? item.image : `http://localhost:5000${item.image}`}
                            alt={item.title || 'Claimed item'} 
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        ) : (
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#5A5E7A' }}>
                            <Info size={24} />
                          </div>
                        )}
                      </div>

                      {/* Middle: Details */}
                      <div style={{ flex: 1, minWidth: '240px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                          <span className="badge badge-neutral">{item.category || 'General'}</span>
                          <span className={`badge ${claim.isVerified ? 'badge-success' : 'badge-warning'}`} style={{ textTransform: 'uppercase', fontWeight: 700, fontSize: '0.72rem' }}>
                            {claim.isVerified ? 'Verified / Claim Completed' : 'Pending Verification'}
                          </span>
                        </div>

                        <h4 style={{ margin: '0 0 10px', fontSize: '1.1rem', fontWeight: 700, color: '#F2F4F8' }}>
                          {item.title || 'Untitled Listing'}
                        </h4>

                        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', fontSize: '0.8rem', color: '#AEB6C7' }}>
                          {item.foundAt && (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <MapPin size={12} color="#6C63FF" /> {item.foundAt}
                            </span>
                          )}
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Clock size={12} /> Claimed: {new Date(claim.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      {/* Right side: Security claim OTP */}
                      <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        background: 'rgba(255, 255, 255, 0.02)',
                        border: '1px solid rgba(255, 255, 255, 0.04)',
                        borderRadius: '16px',
                        padding: '14px 20px',
                        minWidth: '200px',
                        textAlign: 'center'
                      }}>
                        {claim.isVerified ? (
                          <div style={{ color: '#10B981', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                            <CheckCircle size={24} />
                            <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>Item Handed Over</span>
                          </div>
                        ) : (
                          <>
                            <span style={{ fontSize: '0.75rem', color: '#AEB6C7', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <Shield size={11} color="#6C63FF" /> Claim Security Code
                            </span>
                            <span style={{ fontSize: '1.4rem', fontWeight: '800', letterSpacing: '4px', color: '#6C63FF', fontFamily: 'monospace' }}>
                              {claim.otp_code || '------'}
                            </span>
                            <span style={{ fontSize: '0.7rem', color: '#5A5E7A', marginTop: '6px', maxWidth: '160px', lineHeight: 1.4 }}>
                              Show this OTP code to the campus admin to claim the item.
                            </span>
                          </>
                        )}
                      </div>

                      {/* Action corner: cancel claim */}
                      {!claim.isVerified && (
                        <button
                          onClick={() => handleCancelClaim(claim._id)}
                          disabled={isCancellingId === claim._id}
                          style={{
                            position: 'absolute',
                            top: '20px',
                            right: '20px',
                            background: 'rgba(239, 68, 68, 0.1)',
                            border: '1px solid rgba(239, 68, 68, 0.2)',
                            borderRadius: '8px',
                            padding: '6px 12px',
                            color: '#EF4444',
                            fontSize: '0.78rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
                          }}
                        >
                          {isCancellingId === claim._id ? 'Cancelling...' : 'Cancel Claim'}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

      </main>

      <Footer />
    </div>
  );
}
