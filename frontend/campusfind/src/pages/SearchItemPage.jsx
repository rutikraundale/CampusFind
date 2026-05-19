import { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  MapPin, 
  X, 
  SlidersHorizontal, 
  Tag, 
  Calendar,
  Grid,
  List,
  Clock,
  ArrowRight,
  Sparkles,
  Info,
  CheckCircle,
  HelpCircle,
  AlertCircle
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { itemsAPI, claimsAPI, authAPI } from '../services/api';

const CATEGORIES = [
  { id: 'All', label: 'All Categories' },
  { id: 'Electronics', label: 'Electronics' },
  { id: 'Wallet', label: 'Wallets & Cards' },
  { id: 'ID Card', label: 'Student IDs' },
  { id: 'Books', label: 'Books & Notes' },
  { id: 'Accessories', label: 'Accessories' },
  { id: 'Clothing', label: 'Clothing & Gear' },
  { id: 'Keys', label: 'Keys & Fobs' },
  { id: 'Other', label: 'Other Items' }
];

const LOCATIONS = [
  'All Locations', 
  'Central Library', 
  'Student Cafeteria', 
  'Sports Complex', 
  'Hostel Blocks', 
  'Main Auditorium', 
  'Science Building', 
  'Engineering Block',
  'Main Parking Area'
];

const STATUSES = ['All', 'Available', 'Claimed'];

export default function SearchItemPage() {
  const navigate = useNavigate();
  const locationState = useLocation();
  
  // Parse query parameters
  const queryParams = new URLSearchParams(locationState.search);
  const initialSearchQuery = queryParams.get('q') || '';
  const initialCategory = queryParams.get('category') || 'All';

  const [query, setQuery] = useState(initialSearchQuery);
  const [category, setCategory] = useState(initialCategory);
  const [status, setStatus] = useState('All');
  const [location, setLocation] = useState('All Locations');
  const [showFiltersMobile, setShowFiltersMobile] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [selectedItem, setSelectedItem] = useState(null);

  // Live listings state
  const [rawItems, setRawItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Live Claim state
  const [claimReason, setClaimReason] = useState('');
  const [isClaiming, setIsClaiming] = useState(false);
  const [claimSuccess, setClaimSuccess] = useState(false);
  const [generatedClaimOtp, setGeneratedClaimOtp] = useState('');
  const [claimError, setClaimError] = useState('');
  const [showClaimForm, setShowClaimForm] = useState(false);

  // OTP state hooks for unverified users trying to claim
  const [showOtpVerification, setShowOtpVerification] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpError, setOtpError] = useState('');
  const [otpSuccessMsg, setOtpSuccessMsg] = useState('');
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [resendingOtp, setResendingOtp] = useState(false);

  const handleVerifyClaimOtp = async (e) => {
    if (e) e.preventDefault();
    if (!otpCode || otpCode.trim().length !== 6) {
      setOtpError('Please enter a valid 6-digit OTP code.');
      return;
    }
    setVerifyingOtp(true);
    setOtpError('');
    setOtpSuccessMsg('');
    try {
      const userStr = localStorage.getItem('campusfind_user');
      const loggedInUser = userStr ? JSON.parse(userStr) : null;
      if (!loggedInUser) throw new Error('User session not found.');

      await authAPI.verifyOTP({ email: loggedInUser.email, otp: otpCode.trim() });
      
      // Update local storage to reflect email is verified
      const updatedUser = { ...loggedInUser, isEmailVerified: true };
      localStorage.setItem('campusfind_user', JSON.stringify(updatedUser));

      setOtpSuccessMsg('Email verified successfully! Opening claim form...');
      setTimeout(() => {
        setShowOtpVerification(false);
        setShowClaimForm(true);
        setOtpSuccessMsg('');
        setOtpCode('');
      }, 1500);
    } catch (err) {
      setOtpError(err.message || 'OTP verification failed. Please try again.');
    } finally {
      setVerifyingOtp(false);
    }
  };

  const handleResendClaimOtp = async () => {
    setResendingOtp(true);
    setOtpError('');
    setOtpSuccessMsg('');
    try {
      const userStr = localStorage.getItem('campusfind_user');
      const loggedInUser = userStr ? JSON.parse(userStr) : null;
      if (!loggedInUser) throw new Error('User session not found.');

      await authAPI.resendOTP({ email: loggedInUser.email });
      setOtpSuccessMsg('A new OTP has been dispatched to your email.');
    } catch (err) {
      setOtpError(err.message || 'Failed to resend verification OTP.');
    } finally {
      setResendingOtp(false);
    }
  };

  // 1. Fetch live listings from backend on component mount
  const fetchAllListings = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await itemsAPI.getAll();
      setRawItems(res.data || []);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to load active campus inventory.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllListings();
  }, []);

  // Sync search state with URL if it changes from outside (e.g. from nav or hero)
  useEffect(() => {
    setQuery(initialSearchQuery);
    if (initialCategory !== 'All') {
      setCategory(initialCategory);
    }
  }, [initialSearchQuery, initialCategory]);

  // 2. Map database schema fields to UI card structure
  const itemsList = rawItems.map(item => ({
    id: item._id,
    name: item.title,
    category: item.category ? (item.category.charAt(0).toUpperCase() + item.category.slice(1)) : 'Other',
    location: item.foundAt || 'Campus',
    date: item.createdAt ? item.createdAt.substring(0, 10) : new Date().toISOString().substring(0, 10),
    time: item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'Just now',
    status: item.status || 'available',
    desc: item.description,
    image: item.image,
    contactEmail: item.contactEmail,
    contactPhone: item.contactPhone,
    postedBy: item.postedBy
  }));

  const filtered = itemsList.filter(item => {
    const matchQuery = !query || 
      item.name.toLowerCase().includes(query.toLowerCase()) || 
      item.desc.toLowerCase().includes(query.toLowerCase()) ||
      item.category.toLowerCase().includes(query.toLowerCase());
    const matchCat = category === 'All' || item.category === category;
    const matchStatus = status === 'All' || (status === 'Available' ? item.status === 'available' : item.status === 'claimed');
    const matchLoc = location === 'All Locations' || item.location.toLowerCase().includes(location.toLowerCase());
    return matchQuery && matchCat && matchStatus && matchLoc;
  });

  const activeFiltersCount = [
    category !== 'All',
    status !== 'All',
    location !== 'All Locations'
  ].filter(Boolean).length;

  const handleClearAll = () => {
    setCategory('All');
    setStatus('All');
    setLocation('All Locations');
    setQuery('');
    navigate('/search');
  };

  const handleFileClaim = async () => {
    setIsClaiming(true);
    setClaimError('');
    setClaimSuccess(false);
    setGeneratedClaimOtp('');
    try {
      // live claims creation via claims API
      const res = await claimsAPI.create(selectedItem.id);
      
      if (res.data && res.data.otp_code) {
        setGeneratedClaimOtp(res.data.otp_code);
      }
      
      setClaimSuccess(true);
      setClaimReason('');
      setShowClaimForm(false);
      // reload live database listings
      fetchAllListings();
    } catch (err) {
      setClaimError(err.message || 'Failed to file claim request.');
    } finally {
      setIsClaiming(false);
    }
  };

  const handleCloseModal = () => {
    setSelectedItem(null);
    setShowClaimForm(false);
    setClaimReason('');
    setClaimSuccess(false);
    setGeneratedClaimOtp('');
    setClaimError('');
    setShowOtpVerification(false);
    setOtpCode('');
    setOtpError('');
    setOtpSuccessMsg('');
  };

  return (
    <div className="page-wrapper" style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      background: '#05070E', 
      color: '#F2F4F8',
      minHeight: '100vh',
      position: 'relative'
    }}>
      {/* Cyber Grid background */}
      <div style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        backgroundImage: `
          linear-gradient(rgba(255, 255, 255, 0.012) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255, 255, 255, 0.012) 1px, transparent 1px)
        `,
        backgroundSize: '40px 40px',
        pointerEvents: 'none',
      }} />
      <div className="bg-mesh" />

      <Navbar />

      <main style={{ 
        flex: 1, 
        maxWidth: '1280px', 
        margin: '0 auto', 
        width: '100%', 
        padding: '120px 24px 60px',
        position: 'relative',
        zIndex: 1
      }}>
        
        {/* Header Grid */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'flex-start', 
          marginBottom: '32px',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <div>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 12px',
              borderRadius: '9999px',
              background: 'rgba(108, 99, 255, 0.1)',
              border: '1px solid rgba(108, 99, 255, 0.25)',
              fontSize: '0.78rem',
              fontWeight: 600,
              color: '#A78BFA',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              marginBottom: '12px'
            }}>
              <Sparkles size={12} color="#6C63FF" style={{ animation: 'pulse-glow 2s infinite' }} />
              Live Database Scanning
            </div>
            <h1 style={{ 
              fontFamily: 'Space Grotesk, sans-serif', 
              fontSize: 'clamp(2rem, 5vw, 2.6rem)', 
              fontWeight: 800, 
              color: '#F2F4F8', 
              letterSpacing: '-0.03em', 
              marginBottom: '6px' 
            }}>
              Browse Campus Logs
            </h1>
            <p style={{ color: '#AEB6C7', fontSize: '0.92rem' }}>
              Real-time directory of active lost and found reports.
            </p>
          </div>

          {/* Quick Stats Summary */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            borderRadius: '16px',
            padding: '12px 20px',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            gap: '16px'
          }}>
            <div style={{ textAlign: 'right' }}>
              <span style={{ display: 'block', fontSize: '0.75rem', color: '#5A5E7A', fontWeight: 600, letterSpacing: '0.05em' }}>MATCHED ITEMS</span>
              <span style={{ fontSize: '1.25rem', fontWeight: 700, color: '#10B981', fontFamily: 'Space Grotesk, sans-serif' }}>
                {filtered.length} <span style={{ fontSize: '0.85rem', color: '#AEB6C7', fontWeight: 400 }}>indexed</span>
              </span>
            </div>
            <div style={{ width: '1px', height: '32px', background: 'rgba(255,255,255,0.08)' }} />
            <div>
              <span style={{ display: 'block', fontSize: '0.75rem', color: '#5A5E7A', fontWeight: 600, letterSpacing: '0.05em' }}>RADAR STATUS</span>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#38BDF8', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#38BDF8', display: 'inline-block', boxShadow: '0 0 8px #38BDF8' }} />
                ACTIVE
              </span>
            </div>
          </div>
        </div>

        {/* Search controls row */}
        <div style={{ 
          display: 'flex', 
          gap: '12px', 
          marginBottom: '28px', 
          flexWrap: 'wrap' 
        }}>
          {/* Main search bar */}
          <div style={{ flex: 1, minWidth: '280px', position: 'relative' }}>
            <Search size={18} style={{ 
              position: 'absolute', 
              left: '16px', 
              top: '50%', 
              transform: 'translateY(-50%)', 
              color: '#AEB6C7' 
            }} />
            <input
              type="text"
              placeholder="Search items by name, description, tags..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              style={{ 
                width: '100%', 
                padding: '14px 16px 14px 48px', 
                background: 'rgba(15, 17, 23, 0.7)', 
                border: '1px solid rgba(255,255,255,0.1)', 
                borderRadius: '14px', 
                color: '#F0F0FF', 
                fontSize: '0.95rem', 
                outline: 'none', 
                transition: 'all 0.3s', 
                fontFamily: 'Inter,sans-serif' 
              }}
              onFocus={e => {
                e.target.style.borderColor = '#6C63FF';
                e.target.style.boxShadow = '0 0 15px rgba(108, 99, 255, 0.2)';
              }}
              onBlur={e => {
                e.target.style.borderColor = 'rgba(255,255,255,0.1)';
                e.target.style.boxShadow = 'none';
              }}
            />
            {query && (
              <button 
                onClick={() => setQuery('')}
                style={{
                  position: 'absolute',
                  right: '16px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: '#5A5E7A',
                  cursor: 'pointer'
                }}
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Mobile Filter Toggle */}
          <button 
            onClick={() => setShowFiltersMobile(p => !p)} 
            className="btn-secondary show-mobile" 
            style={{ 
              padding: '12px 20px', 
              display: 'none', 
              alignItems: 'center', 
              gap: '8px' 
            }}
          >
            <SlidersHorizontal size={17} /> 
            Filters 
            {activeFiltersCount > 0 && (
              <span style={{ 
                background: '#6C63FF', 
                color: '#fff', 
                borderRadius: '50%', 
                width: '18px', 
                height: '18px', 
                fontSize: '0.7rem', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center' 
              }}>{activeFiltersCount}</span>
            )}
          </button>

          {/* Grid / List View Toggle */}
          <div style={{ 
            display: 'flex', 
            background: 'rgba(15, 17, 23, 0.8)', 
            border: '1px solid rgba(255, 255, 255, 0.1)', 
            borderRadius: '12px', 
            overflow: 'hidden',
            padding: '2px'
          }}>
            <button 
              onClick={() => setViewMode('grid')} 
              style={{ 
                padding: '10px 14px', 
                border: 'none', 
                cursor: 'pointer', 
                background: viewMode === 'grid' ? 'rgba(108,99,255,0.15)' : 'transparent', 
                color: viewMode === 'grid' ? '#F0F0FF' : '#5A5E7A', 
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.2s'
              }}
            >
              <Grid size={15} />
              <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>Grid</span>
            </button>
            <button 
              onClick={() => setViewMode('list')} 
              style={{ 
                padding: '10px 14px', 
                border: 'none', 
                cursor: 'pointer', 
                background: viewMode === 'list' ? 'rgba(108,99,255,0.15)' : 'transparent', 
                color: viewMode === 'list' ? '#F0F0FF' : '#5A5E7A', 
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.2s'
              }}
            >
              <List size={15} />
              <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>List</span>
            </button>
          </div>
        </div>

        {/* Outer Split Layout Container */}
        <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '32px' }} className="search-layout">
          
          {/* ── DESKTOP SIDEBAR FILTERS ── */}
          <aside className="hidden-mobile" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="glass-card" style={{ 
              padding: '24px', 
              border: '1px solid rgba(255, 255, 255, 0.08)',
              background: 'rgba(10, 16, 32, 0.5)',
              backdropFilter: 'blur(20px)',
              position: 'sticky',
              top: '100px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#F2F4F8', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Filter size={16} color="#6C63FF" />
                  Search Filters
                </span>
                {activeFiltersCount > 0 && (
                  <button 
                    onClick={handleClearAll}
                    style={{ background: 'none', border: 'none', color: '#EF4444', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer' }}
                  >
                    Reset
                  </button>
                )}
              </div>

              {/* Status Selector */}
              <div className="form-group" style={{ marginBottom: '20px' }}>
                <label className="form-label">REPORT STATUS</label>
                <div style={{ display: 'flex', gap: '6px' }}>
                  {STATUSES.map(st => (
                    <button
                      key={st}
                      onClick={() => setStatus(st)}
                      style={{
                        flex: 1,
                        padding: '8px 4px',
                        borderRadius: '8px',
                        border: '1px solid',
                        borderColor: status === st ? 'rgba(108, 99, 255, 0.4)' : 'rgba(255, 255, 255, 0.08)',
                        background: status === st ? 'rgba(108, 99, 255, 0.15)' : 'rgba(255,255,255,0.02)',
                        color: status === st ? '#F2F4F8' : '#AEB6C7',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Category Filter List */}
              <div className="form-group" style={{ marginBottom: '20px' }}>
                <label className="form-label">CATEGORY</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => setCategory(cat.id)}
                      style={{
                        padding: '10px 12px',
                        borderRadius: '10px',
                        border: 'none',
                        textAlign: 'left',
                        background: category === cat.id ? 'rgba(108, 99, 255, 0.15)' : 'transparent',
                        color: category === cat.id ? '#F2F4F8' : '#AEB6C7',
                        fontSize: '0.85rem',
                        fontWeight: category === cat.id ? 600 : 500,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        transition: 'all 0.2s',
                        borderLeft: category === cat.id ? '3px solid #6C63FF' : '3px solid transparent'
                      }}
                      onMouseEnter={e => {
                        if (category !== cat.id) e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
                      }}
                      onMouseLeave={e => {
                        if (category !== cat.id) e.currentTarget.style.background = 'transparent';
                      }}
                    >
                      <span>{cat.label}</span>
                      {category === cat.id && <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#6C63FF' }} />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Location Select */}
              <div className="form-group">
                <label className="form-label">
                  <MapPin size={12} style={{ display: 'inline', marginRight: '4px' }} />
                  BUILDING / ZONE
                </label>
                <select 
                  value={location} 
                  onChange={e => setLocation(e.target.value)} 
                  className="form-input" 
                  style={{ cursor: 'pointer', fontSize: '0.85rem', background: 'rgba(15, 17, 23, 0.8)' }}
                >
                  {LOCATIONS.map(loc => (
                    <option key={loc} value={loc} style={{ background: '#0F1117', color: '#F2F4F8' }}>{loc}</option>
                  ))}
                </select>
              </div>
            </div>
          </aside>

          {/* ── ITEMS WORKSPACE (GRID / LIST) ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Active filters chips list */}
            {activeFiltersCount > 0 && (
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8rem', color: '#5A5E7A', fontWeight: 600, letterSpacing: '0.05em' }}>ACTIVE FILTERS:</span>
                {category !== 'All' && (
                  <span className="badge badge-purple" style={{ padding: '6px 12px', fontSize: '0.75rem' }}>
                    Category: {category}
                    <button onClick={() => setCategory('All')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', marginLeft: '6px' }}><X size={12} /></button>
                  </span>
                )}
                {status !== 'All' && (
                  <span className={status === 'Found' ? 'badge badge-success' : 'badge badge-warning'} style={{ padding: '6px 12px', fontSize: '0.75rem' }}>
                    Status: {status}
                    <button onClick={() => setStatus('All')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', marginLeft: '6px' }}><X size={12} /></button>
                  </span>
                )}
                {location !== 'All Locations' && (
                  <span className="badge badge-info" style={{ padding: '6px 12px', fontSize: '0.75rem' }}>
                    Zone: {location}
                    <button onClick={() => setLocation('All Locations')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', marginLeft: '6px' }}><X size={12} /></button>
                  </span>
                )}
                <button 
                  onClick={handleClearAll}
                  style={{ fontSize: '0.78rem', color: '#EF4444', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, marginLeft: '4px' }}
                >
                  Clear All
                </button>
              </div>
            )}

            {/* Results Grid / List */}
            {filtered.length === 0 ? (
              <div className="glass-card" style={{ 
                textAlign: 'center', 
                padding: '80px 24px', 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                justifyContent: 'center',
                background: 'rgba(10, 16, 32, 0.4)',
                border: '1px solid rgba(255,255,255,0.06)'
              }}>
                <div style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: 'rgba(239, 68, 68, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '20px'
                }}>
                  <AlertCircle size={32} color="#EF4444" />
                </div>
                <h3 style={{ color: '#F2F4F8', fontWeight: 700, fontSize: '1.2rem', marginBottom: '8px', fontFamily: 'Space Grotesk, sans-serif' }}>
                  No Matches Registered
                </h3>
                <p style={{ color: '#AEB6C7', fontSize: '0.9rem', maxWidth: '380px', lineHeight: 1.6, marginBottom: '24px' }}>
                  Your search criteria or active filters returned 0 matching results across the campus database.
                </p>
                <button onClick={handleClearAll} className="btn-secondary">
                  Reset Search Directory
                </button>
              </div>
            ) : viewMode === 'grid' ? (
              /* Grid Layout */
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: '20px' }} className="animate-fadeIn">
                {filtered.map(item => (
                  <div 
                    key={item.id} 
                    className="glass-card" 
                    onClick={() => setSelectedItem(item)}
                    style={{ 
                      padding: '20px', 
                      display: 'flex', 
                      flexDirection: 'column', 
                      gap: '14px',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      background: 'linear-gradient(135deg, rgba(10, 16, 32, 0.65) 0%, rgba(5, 7, 14, 0.8) 100%)',
                      cursor: 'pointer',
                      position: 'relative',
                      overflow: 'hidden',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.transform = 'translateY(-4px)';
                      e.currentTarget.style.borderColor = 'rgba(108, 99, 255, 0.4)';
                      e.currentTarget.style.boxShadow = '0 0 25px rgba(108, 99, 255, 0.15)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    {/* Header badge */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span className={item.status === 'found' ? 'badge badge-success' : 'badge badge-warning'}>
                        {item.status}
                      </span>
                      <span style={{ fontSize: '0.78rem', color: '#5A5E7A', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={12} /> {item.time}
                      </span>
                    </div>

                    {/* Card Content */}
                    <div style={{ flex: 1 }}>
                      <h4 style={{ fontWeight: 700, fontSize: '0.98rem', color: '#F2F4F8', marginBottom: '8px', lineHeight: 1.4 }}>
                        {item.name}
                      </h4>
                      <p style={{ 
                        fontSize: '0.82rem', 
                        color: '#AEB6C7', 
                        lineHeight: 1.5, 
                        overflow: 'hidden', 
                        textOverflow: 'ellipsis', 
                        display: '-webkit-box', 
                        WebkitLineClamp: 3, 
                        WebkitBoxOrient: 'vertical' 
                      }}>
                        {item.desc}
                      </p>
                    </div>

                    {/* Footer */}
                    <div style={{ 
                      display: 'flex', 
                      flexDirection: 'column', 
                      gap: '10px',
                      borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                      paddingTop: '12px'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '0.75rem', color: '#5A5E7A', display: 'flex', alignItems: 'center', gap: '4px', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                          <MapPin size={12} color="#6C63FF" /> {item.location.split(' (')[0]}
                        </span>
                        <span className="badge badge-neutral" style={{ fontSize: '0.7rem' }}>
                          {item.category}
                        </span>
                      </div>
                      
                      <button 
                        style={{ 
                          width: '100%', 
                          padding: '9px 0', 
                          fontSize: '0.82rem',
                          background: item.status === 'found' ? 'linear-gradient(135deg, #6C63FF 0%, #4880FF 100%)' : 'rgba(255,255,255,0.03)',
                          border: item.status === 'found' ? 'none' : '1px solid rgba(255,255,255,0.1)',
                          color: '#fff',
                          fontWeight: 600,
                          borderRadius: '10px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          transition: 'all 0.2s'
                        }}
                      >
                        {item.status === 'found' ? 'Claim & Recover' : 'Report Details'}
                        <ArrowRight size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* List Layout */
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }} className="animate-fadeIn">
                {filtered.map(item => (
                  <div 
                    key={item.id} 
                    className="glass-card" 
                    onClick={() => setSelectedItem(item)}
                    style={{ 
                      padding: '16px 20px', 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '20px', 
                      flexWrap: 'wrap',
                      background: 'rgba(10, 16, 32, 0.55)',
                      border: '1px solid rgba(255,255,255,0.06)',
                      cursor: 'pointer',
                      transition: 'all 0.25s ease'
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.borderColor = 'rgba(108, 99, 255, 0.4)';
                      e.currentTarget.style.boxShadow = '0 0 20px rgba(108, 99, 255, 0.1)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.06)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <span className={item.status === 'found' ? 'badge badge-success' : 'badge badge-warning'} style={{ minWidth: '70px', justifyContent: 'center' }}>
                      {item.status}
                    </span>
                    <div style={{ flex: 1, minWidth: '220px' }}>
                      <h4 style={{ fontWeight: 700, color: '#F2F4F8', fontSize: '0.95rem', marginBottom: '4px' }}>{item.name}</h4>
                      <p style={{ color: '#AEB6C7', fontSize: '0.8rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '420px' }}>{item.desc}</p>
                    </div>
                    <span className="badge badge-neutral">{item.category}</span>
                    <span style={{ fontSize: '0.8rem', color: '#5A5E7A', minWidth: '130px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <MapPin size={13} color="#6C63FF" /> {item.location}
                    </span>
                    <span style={{ fontSize: '0.8rem', color: '#5A5E7A', minWidth: '90px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={13} /> {item.time}
                    </span>
                    <button className={item.status === 'found' ? 'btn-primary' : 'btn-secondary'} style={{ padding: '8px 16px', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                      {item.status === 'found' ? 'Claim' : 'Info'}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* ── MOBILE SIDEBAR MODAL FILTERS ── */}
      {showFiltersMobile && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(5, 7, 14, 0.85)',
          backdropFilter: 'blur(16px)',
          display: 'flex',
          justifyContent: 'flex-end',
          zIndex: 1000
        }}
        onClick={() => setShowFiltersMobile(false)}
        >
          <div style={{
            background: '#0A1020',
            borderLeft: '1px solid rgba(108, 99, 255, 0.3)',
            width: '100%',
            maxWidth: '320px',
            height: '100%',
            padding: '32px 24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '24px',
            boxShadow: '-10px 0 30px rgba(0,0,0,0.5)'
          }}
          onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '1rem', fontWeight: 700, color: '#F2F4F8' }}>Filters</span>
              <button 
                onClick={() => setShowFiltersMobile(false)}
                style={{ background: 'none', border: 'none', color: '#AEB6C7', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Status */}
            <div className="form-group">
              <label className="form-label">REPORT STATUS</label>
              <div style={{ display: 'flex', gap: '6px' }}>
                {STATUSES.map(st => (
                  <button
                    key={st}
                    onClick={() => setStatus(st)}
                    style={{
                      flex: 1,
                      padding: '10px 4px',
                      borderRadius: '8px',
                      border: '1px solid',
                      borderColor: status === st ? 'rgba(108, 99, 255, 0.4)' : 'rgba(255, 255, 255, 0.08)',
                      background: status === st ? 'rgba(108, 99, 255, 0.15)' : 'rgba(255,255,255,0.02)',
                      color: status === st ? '#F2F4F8' : '#AEB6C7',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Category */}
            <div className="form-group">
              <label className="form-label">CATEGORY</label>
              <select 
                value={category} 
                onChange={e => setCategory(e.target.value)} 
                className="form-input" 
                style={{ cursor: 'pointer' }}
              >
                {CATEGORIES.map(cat => (
                  <option key={cat.id} value={cat.id} style={{ background: '#0F1117' }}>{cat.label}</option>
                ))}
              </select>
            </div>

            {/* Location */}
            <div className="form-group">
              <label className="form-label">LOCATION ZONE</label>
              <select 
                value={location} 
                onChange={e => setLocation(e.target.value)} 
                className="form-input" 
                style={{ cursor: 'pointer' }}
              >
                {LOCATIONS.map(loc => (
                  <option key={loc} value={loc} style={{ background: '#0F1117' }}>{loc}</option>
                ))}
              </select>
            </div>

            <div style={{ marginTop: 'auto', display: 'flex', gap: '12px' }}>
              <button 
                onClick={handleClearAll} 
                className="btn-secondary" 
                style={{ flex: 1, padding: '12px 0' }}
              >
                Reset
              </button>
              <button 
                onClick={() => setShowFiltersMobile(false)} 
                className="btn-primary" 
                style={{ flex: 1, padding: '12px 0' }}
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── DETAILS POPUP MODAL ── */}
      {selectedItem && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(5, 7, 14, 0.85)',
          backdropFilter: 'blur(16px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px',
        }}
        onClick={handleCloseModal}
        >
          <div style={{
            background: '#0A1020',
            border: '1px solid rgba(108, 99, 255, 0.4)',
            borderRadius: '24px',
            width: '100%',
            maxWidth: '540px',
            padding: '32px',
            boxShadow: '0 0 50px rgba(108, 99, 255, 0.25), 0 20px 40px rgba(0,0,0,0.7)',
            position: 'relative',
            animation: 'fadeInUp 0.3s ease-out'
          }}
          onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={handleCloseModal}
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '50%',
                width: '36px',
                height: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#AEB6C7',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#F2F4F8'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#AEB6C7'}
            >
              <X size={18} />
            </button>

            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '18px' }}>
              <span className={
                selectedItem.status === 'available' ? 'badge badge-success' :
                selectedItem.status === 'pending' ? 'badge badge-warning' : 'badge badge-danger'
              }>
                {selectedItem.status.toUpperCase()}
              </span>
              <span style={{ fontSize: '0.8rem', color: '#AEB6C7', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Clock size={12} /> {selectedItem.time}
              </span>
            </div>

            <h3 style={{ 
              fontFamily: 'Space Grotesk, sans-serif', 
              fontWeight: 800, 
              fontSize: '1.4rem', 
              color: '#F2F4F8', 
              marginBottom: '16px', 
              lineHeight: 1.3 
            }}>
              {selectedItem.name}
            </h3>

            {/* Display Item Image if uploaded */}
            {selectedItem.image && (
              <div style={{
                width: '100%',
                maxHeight: '200px',
                borderRadius: '16px',
                overflow: 'hidden',
                marginBottom: '20px',
                border: '1px solid rgba(255,255,255,0.08)'
              }}>
                <img 
                  src={selectedItem.image.startsWith('http') ? selectedItem.image : `http://localhost:5000${selectedItem.image}`}
                  alt={selectedItem.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              </div>
            )}

            <div style={{
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '16px',
              padding: '18px',
              marginBottom: '24px',
            }}>
              <p style={{ fontSize: '0.92rem', color: '#AEB6C7', lineHeight: 1.6, margin: 0 }}>
                {selectedItem.desc}
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '28px' }}>
              <div>
                <span style={{ fontSize: '0.78rem', color: '#5A5E7A', display: 'block', marginBottom: '4px', fontWeight: 600 }}>
                  LAST SEEN ZONE
                </span>
                <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#F2F4F8', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <MapPin size={14} color="#6C63FF" /> {selectedItem.location}
                </span>
              </div>
              <div>
                <span style={{ fontSize: '0.78rem', color: '#5A5E7A', display: 'block', marginBottom: '4px', fontWeight: 600 }}>
                  LOG CATEGORY
                </span>
                <span className="badge badge-neutral" style={{ display: 'inline-flex' }}>
                  {selectedItem.category}
                </span>
              </div>
            </div>

            {/* Claims workflow panel */}
            {(() => {
              const userStr = localStorage.getItem('campusfind_user');
              const loggedInUser = userStr ? JSON.parse(userStr) : null;

              if (!loggedInUser) {
                return (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%' }}>
                    <p style={{ fontSize: '0.85rem', color: '#AEB6C7', textAlign: 'center', margin: '0 0 10px' }}>
                      You must be registered as a student to file ownership claims or retrieve contact info.
                    </p>
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <Link 
                        to="/login" 
                        className="btn-primary" 
                        style={{ flex: 1, padding: '12px 0', textDecoration: 'none', textAlign: 'center' }}
                        onClick={handleCloseModal}
                      >
                        Sign In to Claim
                      </Link>
                      <button 
                        className="btn-secondary" 
                        style={{ flex: 1, padding: '12px 0' }}
                        onClick={handleCloseModal}
                      >
                        Dismiss Window
                      </button>
                    </div>
                  </div>
                );
              }

              if (showOtpVerification) {
                return (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', width: '100%' }}>
                    <div style={{
                      padding: '10px 12px',
                      background: 'rgba(108, 99, 255, 0.1)',
                      border: '1px solid rgba(108, 99, 255, 0.25)',
                      borderRadius: '12px',
                      fontSize: '0.82rem',
                      color: '#A78BFA',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      <Info size={16} />
                      <span>Security Verification Required</span>
                    </div>
                    
                    <p style={{ fontSize: '0.85rem', color: '#AEB6C7', margin: '4px 0', lineHeight: 1.5 }}>
                      To protect lost items, claims are restricted to verified campus emails. Please enter the 6-digit code sent to <strong>{loggedInUser.email}</strong>.
                    </p>

                    <form onSubmit={handleVerifyClaimOtp} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div className="form-group">
                        <input 
                          type="text" 
                          placeholder="Enter 6-digit security code"
                          value={otpCode}
                          onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, '').substring(0, 6);
                            setOtpCode(val);
                            setOtpError('');
                          }}
                          style={{
                            width: '100%',
                            padding: '12px',
                            background: 'rgba(5, 7, 14, 0.6)',
                            border: '1px solid rgba(108, 99, 255, 0.3)',
                            borderRadius: '12px',
                            color: '#F2F4F8',
                            fontSize: '1.1rem',
                            fontWeight: 'bold',
                            letterSpacing: '6px',
                            textAlign: 'center',
                            outline: 'none',
                          }}
                        />
                      </div>

                      {otpError && (
                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center', color: '#EF4444', fontSize: '0.78rem' }}>
                          <AlertCircle size={14} />
                          <span>{otpError}</span>
                        </div>
                      )}

                      {otpSuccessMsg && (
                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center', color: '#10B981', fontSize: '0.78rem' }}>
                          <CheckCircle size={14} />
                          <span>{otpSuccessMsg}</span>
                        </div>
                      )}

                      <div style={{ display: 'flex', gap: '12px', marginTop: '6px' }}>
                        <button 
                          type="submit"
                          className="btn-primary" 
                          style={{ flex: 1, padding: '12px 0' }}
                          disabled={verifyingOtp}
                        >
                          {verifyingOtp ? 'Verifying...' : 'Verify Code'}
                        </button>
                        <button 
                          type="button"
                          className="btn-secondary" 
                          style={{ flex: 1, padding: '12px 0' }}
                          onClick={() => { setShowOtpVerification(false); setOtpError(''); setOtpSuccessMsg(''); }}
                        >
                          Cancel
                        </button>
                      </div>
                    </form>

                    <div style={{ textAlign: 'center', marginTop: '4px' }}>
                      <span style={{ fontSize: '0.85rem', color: '#5A5E7A' }}>
                        Didn't receive the code?{' '}
                        <button 
                          type="button"
                          onClick={handleResendClaimOtp}
                          disabled={resendingOtp}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#6C63FF',
                            fontWeight: 600,
                            cursor: 'pointer',
                            padding: 0,
                            fontSize: '0.85rem',
                            textDecoration: 'underline'
                          }}
                        >
                          {resendingOtp ? 'Resending...' : 'Resend OTP'}
                        </button>
                      </span>
                    </div>
                  </div>
                );
              }

              if (claimSuccess) {
                return (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%', textAlign: 'center' }}>
                    <div style={{ color: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '0.95rem', fontWeight: 600 }}>
                      <CheckCircle size={18} /> Claim OTP Dispatched!
                    </div>
                    <p style={{ fontSize: '0.85rem', color: '#AEB6C7', margin: 0, lineHeight: 1.5 }}>
                      A secure One-Time Password (OTP) has been dispatched to your email address. Show this OTP to the campus administrator to verify and finalize your claim.
                    </p>
                    {generatedClaimOtp && (
                      <div style={{
                        background: 'rgba(108, 99, 255, 0.08)',
                        border: '1px dashed rgba(108, 99, 255, 0.4)',
                        borderRadius: '16px',
                        padding: '16px',
                        margin: '14px 0',
                      }}>
                        <span style={{ display: 'block', fontSize: '0.75rem', color: '#AEB6C7', marginBottom: '6px', fontWeight: 600, letterSpacing: '0.5px' }}>TESTING CODE (DEV ONLY)</span>
                        <span style={{ fontSize: '1.6rem', fontWeight: '800', letterSpacing: '6px', color: '#6C63FF' }}>{generatedClaimOtp}</span>
                      </div>
                    )}
                    <button 
                      className="btn-secondary" 
                      style={{ padding: '12px 0', width: '100%', marginTop: '8px' }}
                      onClick={handleCloseModal}
                    >
                      Close Window
                    </button>
                  </div>
                );
              }

              if (selectedItem.status === 'claimed') {
                return (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%', textAlign: 'center' }}>
                    <div style={{ color: '#EF4444', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '0.95rem', fontWeight: 600 }}>
                      <AlertCircle size={18} /> Item already Claimed
                    </div>
                    <button 
                      className="btn-secondary" 
                      style={{ padding: '12px 0', width: '100%' }}
                      onClick={handleCloseModal}
                    >
                      Dismiss Window
                    </button>
                  </div>
                );
              }

              if (showClaimForm) {
                return (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
                    <div style={{
                      padding: '14px',
                      background: 'rgba(108, 99, 255, 0.05)',
                      border: '1px solid rgba(108, 99, 255, 0.15)',
                      borderRadius: '16px',
                      color: '#AEB6C7',
                      fontSize: '0.85rem',
                      lineHeight: '1.5'
                    }}>
                      <div style={{ color: '#A78BFA', fontWeight: 700, marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Info size={14} />
                        Claim OTP Verification Flow
                      </div>
                      To complete this claim, we will generate a secure One-Time Password (OTP) and send it to your email. You must present this OTP to a campus administrator to verify ownership and collect your item.
                    </div>
                    {claimError && (
                      <span style={{ color: '#EF4444', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <AlertCircle size={12} /> {claimError}
                      </span>
                    )}
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <button 
                        className="btn-primary" 
                        style={{ flex: 1, padding: '12px 0' }}
                        onClick={handleFileClaim}
                        disabled={isClaiming}
                      >
                        {isClaiming ? 'Sending OTP...' : 'Send Claim OTP'}
                      </button>
                      <button 
                        className="btn-secondary" 
                        style={{ flex: 1, padding: '12px 0' }}
                        onClick={() => { setShowClaimForm(false); setClaimError(''); }}
                      >
                        Back
                      </button>
                    </div>
                  </div>
                );
              }

              const isOwner = selectedItem.postedBy === loggedInUser.id || selectedItem.postedBy === loggedInUser._id;

              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    {isOwner ? (
                      <div style={{ flex: 1, textAlign: 'center', color: '#AEB6C7', fontSize: '0.85rem', padding: '10px' }}>
                        You posted this item report. You can manage claims for this item from your Dashboard.
                      </div>
                    ) : (
                      <button 
                        className="btn-primary" 
                        style={{ flex: 1, padding: '12px 0' }}
                        onClick={async () => {
                          if (!loggedInUser.isEmailVerified) {
                            setShowOtpVerification(true);
                            setOtpError('');
                            setOtpSuccessMsg('Sending verification OTP...');
                            try {
                              await authAPI.resendOTP({ email: loggedInUser.email });
                              setOtpSuccessMsg('A 6-digit verification code has been dispatched to your email.');
                            } catch (err) {
                              setOtpError(err.message || 'Failed to dispatch OTP email.');
                              setOtpSuccessMsg('');
                            }
                          } else {
                            setShowClaimForm(true);
                          }
                        }}
                      >
                        File Ownership Claim
                      </button>
                    )}
                    <button 
                      className="btn-secondary" 
                      style={{ flex: 1, padding: '12px 0' }}
                      onClick={handleCloseModal}
                    >
                      Dismiss Window
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* Media query styling for layout split */}
      <style>{`
        @media (max-width: 768px) {
          .search-layout {
            grid-template-columns: 1fr !important;
          }
          .hidden-mobile {
            display: none !important;
          }
          .show-mobile {
            display: flex !important;
          }
        }
      `}</style>

      <Footer />
    </div>
  );
}

