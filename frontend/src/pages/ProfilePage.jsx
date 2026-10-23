import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Trash2, 
  XCircle, 
  Loader,
  AlertCircle,
  Package,
  ClipboardList
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { itemsAPI, claimsAPI } from '../services/api';

export default function ProfilePage() {
  const navigate = useNavigate();
  const [user] = useState(() => {
    try {
      const userStr = localStorage.getItem('campusfind_user');
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  });
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
    if (!user) {
      navigate('/login', { replace: true });
    }
  }, [user, navigate]);

  // Fetch student items & claims
  useEffect(() => {
    if (!user) return;

    const fetchPosts = async () => {
      setLoadingPosts(true);
      try {
        const res = await itemsAPI.getMyPosts();
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
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: 'var(--color-parchment)' }}>
        <Loader className="animate-spin" size={28} color="var(--color-ink)" />
      </div>
    );
  }

  return (
    <div
      className="page-wrapper"
      style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        background: 'var(--color-parchment)', 
        color: 'var(--color-ink)',
        minHeight: '100vh',
      }}
    >
      <Navbar />

      <main style={{ flex: 1, maxWidth: '1000px', width: '100%', margin: '0 auto', padding: '48px 24px 80px' }}>
        
        {/* Header Profile Section */}
        <section
          style={{
            background: 'var(--color-bone)',
            border: '1px solid var(--color-stone)',
            borderRadius: '4px',
            padding: '28px 24px',
            display: 'flex',
            flexDirection: 'row',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: '24px',
            marginBottom: '36px',
            boxShadow: 'var(--shadow-warm)',
          }}
        >
          {/* Avatar */}
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '4px',
              background: 'var(--color-linen)',
              border: '1px solid var(--color-stone)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
          >
            <User size={30} color="var(--color-ink)" strokeWidth={1.5} />
          </div>

          {/* User Details */}
          <div style={{ flex: 1, minWidth: '240px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px', flexWrap: 'wrap' }}>
              <h1
                style={{ 
                  fontFamily: 'var(--font-cursorgothic)', 
                  fontWeight: 400, 
                  fontSize: '1.5rem', 
                  margin: 0,
                  color: 'var(--color-ink)',
                  letterSpacing: '-0.02em'
                }}
              >
                {user.username || user.name || 'Campus Student'}
              </h1>
              
              <span className={`badge ${user.isEmailVerified ? 'badge-found' : 'badge-claimed'}`}>
                {user.isEmailVerified ? 'Verified Student' : 'Email Unverified'}
              </span>
            </div>

            <p style={{ color: 'var(--color-driftwood)', fontSize: '13px', margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span>Role: <strong style={{ color: 'var(--color-ink)' }}>{user.role || 'Student'}</strong></span>
              {user.college_id && (
                <>
                  <span style={{ color: 'var(--color-stone)' }}>·</span>
                  <span>Campus ID: <strong style={{ color: 'var(--color-ink)', fontFamily: 'var(--font-berkeleymono)' }}>{user.college_id}</strong></span>
                </>
              )}
            </p>

            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-ash)', fontSize: '13px' }}>
                <Mail size={13} color="var(--color-ash)" />
                <span>{user.email}</span>
              </div>
              {user.mobile && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-ash)', fontSize: '13px' }}>
                  <Phone size={13} color="var(--color-ash)" />
                  <span>{user.mobile}</span>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Tabs */}
        <div
          style={{
            display: 'flex',
            borderBottom: '1px solid var(--color-stone)',
            marginBottom: '28px',
            gap: '24px'
          }}
        >
          <button
            onClick={() => setActiveTab('posts')}
            style={{
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'posts' ? '2px solid var(--color-ink)' : '2px solid transparent',
              color: activeTab === 'posts' ? 'var(--color-ink)' : 'var(--color-ash)',
              padding: '10px 2px',
              fontSize: '14px',
              fontWeight: activeTab === 'posts' ? 500 : 400,
              cursor: 'pointer',
              transition: 'all 150ms ease',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontFamily: 'var(--font-cursorgothic)'
            }}
          >
            <span>My Posted Reports</span>
            <span
              style={{
                background: 'var(--color-linen)',
                color: 'var(--color-ink)',
                padding: '2px 6px',
                borderRadius: '3px',
                fontSize: '11px',
                fontFamily: 'var(--font-berkeleymono)'
              }}
            >
              {posts.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('claims')}
            style={{
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'claims' ? '2px solid var(--color-ink)' : '2px solid transparent',
              color: activeTab === 'claims' ? 'var(--color-ink)' : 'var(--color-ash)',
              padding: '10px 2px',
              fontSize: '14px',
              fontWeight: activeTab === 'claims' ? 500 : 400,
              cursor: 'pointer',
              transition: 'all 150ms ease',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontFamily: 'var(--font-cursorgothic)'
            }}
          >
            <span>My Claim Requests</span>
            <span
              style={{
                background: 'var(--color-linen)',
                color: 'var(--color-ink)',
                padding: '2px 6px',
                borderRadius: '3px',
                fontSize: '11px',
                fontFamily: 'var(--font-berkeleymono)'
              }}
            >
              {claims.length}
            </span>
          </button>
        </div>

        {/* Tab 1: Posts */}
        {activeTab === 'posts' && (
          <div>
            {loadingPosts ? (
              <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--color-ash)' }}>
                <span className="skeleton" style={{ display: 'inline-block', width: '200px', height: '16px' }} />
              </div>
            ) : posts.length === 0 ? (
              <div
                style={{
                  textAlign: 'center',
                  padding: '56px 24px',
                  background: 'var(--color-bone)',
                  border: '1px solid var(--color-stone)',
                  borderRadius: '4px',
                }}
              >
                <Package size={28} color="var(--color-ash)" style={{ marginBottom: '10px' }} />
                <h3 style={{ fontSize: '16px', fontWeight: 500, color: 'var(--color-ink)', marginBottom: '4px' }}>
                  No Items Reported Yet
                </h3>
                <p style={{ color: 'var(--color-driftwood)', fontSize: '13px', margin: '0 0 18px' }}>
                  You have not published any lost or found items to the directory.
                </p>
                <Link to="/post-item" className="btn-primary" style={{ padding: '8px 16px', fontSize: '13px' }}>
                  Report an Item
                </Link>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {posts.map(post => (
                  <div
                    key={post._id}
                    style={{
                      background: 'var(--color-bone)',
                      border: '1px solid var(--color-stone)',
                      borderRadius: '4px',
                      padding: '16px 20px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '14px',
                      boxShadow: 'var(--shadow-warm)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: '240px' }}>
                      <span className={`badge ${post.status === 'found' ? 'badge-found' : post.status === 'claimed' ? 'badge-claimed' : 'badge-available'}`}>
                        {post.status || 'Active'}
                      </span>
                      <div>
                        <h4 style={{ fontSize: '15px', fontWeight: 500, color: 'var(--color-ink)', margin: '0 0 2px' }}>
                          {post.title}
                        </h4>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12px', color: 'var(--color-ash)' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <MapPin size={11} /> {post.foundAt || 'Campus'}
                          </span>
                          <span>·</span>
                          <span style={{ fontFamily: 'var(--font-berkeleymono)' }}>
                            {new Date(post.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span className="badge" style={{ fontSize: '10px' }}>{post.category || 'Item'}</span>
                      <button
                        onClick={() => handleDeletePost(post._id)}
                        disabled={isDeletingId === post._id}
                        className="btn-danger"
                        style={{ padding: '6px 12px', fontSize: '12px' }}
                      >
                        <Trash2 size={13} />
                        {isDeletingId === post._id ? 'Removing...' : 'Delete'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Claims */}
        {activeTab === 'claims' && (
          <div>
            {loadingClaims ? (
              <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--color-ash)' }}>
                <span className="skeleton" style={{ display: 'inline-block', width: '200px', height: '16px' }} />
              </div>
            ) : claims.length === 0 ? (
              <div
                style={{
                  textAlign: 'center',
                  padding: '56px 24px',
                  background: 'var(--color-bone)',
                  border: '1px solid var(--color-stone)',
                  borderRadius: '4px',
                }}
              >
                <ClipboardList size={28} color="var(--color-ash)" style={{ marginBottom: '10px' }} />
                <h3 style={{ fontSize: '16px', fontWeight: 500, color: 'var(--color-ink)', marginBottom: '4px' }}>
                  No Active Claims
                </h3>
                <p style={{ color: 'var(--color-driftwood)', fontSize: '13px', margin: '0 0 18px' }}>
                  Found items are recovered in person at the administration office after the administrator verifies your registered email and identity.
                </p>
                <Link to="/search" className="btn-secondary" style={{ padding: '8px 16px', fontSize: '13px' }}>
                  Browse Directory
                </Link>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {claims.map(claim => (
                  <div
                    key={claim._id}
                    style={{
                      background: 'var(--color-bone)',
                      border: '1px solid var(--color-stone)',
                      borderRadius: '4px',
                      padding: '16px 20px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '14px',
                      boxShadow: 'var(--shadow-warm)',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <span className={`badge ${claim.isVerified ? 'badge-found' : 'badge-claimed'}`}>
                          {claim.isVerified ? 'Approved & Recovered' : 'Pending Verification'}
                        </span>
                        <span style={{ fontFamily: 'var(--font-berkeleymono)', fontSize: '11px', color: 'var(--color-ash)' }}>
                          {claim._id?.substring(claim._id.length - 8).toUpperCase()}
                        </span>
                      </div>
                      <h4 style={{ fontSize: '15px', fontWeight: 500, color: 'var(--color-ink)', margin: 0 }}>
                        {claim.itemId?.title || 'Unknown Item'}
                      </h4>
                      <p style={{ fontSize: '12px', color: 'var(--color-ash)', margin: '2px 0 0', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Calendar size={11} /> Submitted on {new Date(claim.createdAt).toLocaleDateString()}
                      </p>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      {!claim.isVerified && (
                        <button
                          onClick={() => handleCancelClaim(claim._id)}
                          disabled={isCancellingId === claim._id}
                          className="btn-danger"
                          style={{ padding: '6px 12px', fontSize: '12px' }}
                        >
                          <XCircle size={13} />
                          {isCancellingId === claim._id ? 'Cancelling...' : 'Cancel Claim'}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
