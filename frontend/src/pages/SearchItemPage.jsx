import { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { 
  Search, 
  MapPin, 
  X, 
  SlidersHorizontal, 
  Grid, 
  List, 
  ArrowRight, 
  AlertCircle,
  Tag,
  Clock
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { itemsAPI } from '../services/api';

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

const STATUSES = ['All', 'Available', 'Claimed', 'Lost'];

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isCurrent = true;
    const loadListings = async () => {
      try {
        const response = await itemsAPI.getAll();
        if (isCurrent) {
          setRawItems(response.data || []);
          setError('');
        }
      } catch (fetchError) {
        if (isCurrent) {
          console.error(fetchError);
          setError(fetchError.message || 'Failed to load active campus directory.');
        }
      } finally {
        if (isCurrent) setLoading(false);
      }
    };
    loadListings();
    return () => {
      isCurrent = false;
    };
  }, []);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    setQuery(initialSearchQuery);
    if (initialCategory !== 'All') {
      setCategory(initialCategory);
    }
  }, [initialSearchQuery, initialCategory]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const itemsList = rawItems.map(item => ({
    id: item._id,
    name: item.title,
    category: item.category ? (item.category.charAt(0).toUpperCase() + item.category.slice(1)) : 'Other',
    location: item.foundAt || 'Campus',
    date: (item.foundDate || item.createdAt) ? (item.foundDate || item.createdAt).substring(0, 10) : new Date().toISOString().substring(0, 10),
    time: item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'Recent',
    reportType: item.reportType || 'found',
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
    const matchStatus = status === 'All' ||
      (status === 'Available' && item.reportType === 'found' && item.status === 'available') ||
      (status === 'Claimed' && item.reportType === 'found' && item.status === 'claimed') ||
      (status === 'Lost' && item.reportType === 'lost');
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

  const handleCloseModal = () => {
    setSelectedItem(null);
  };

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

      <main
        style={{
          flex: 1,
          maxWidth: '1300px',
          margin: '0 auto',
          width: '100%',
          padding: '48px 24px 80px',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: '32px',
            flexWrap: 'wrap',
            gap: '16px',
          }}
        >
          <div>
            <span
              style={{
                fontFamily: 'var(--font-berkeleymono)',
                fontSize: '11px',
                fontWeight: 500,
                color: 'var(--color-ash)',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                display: 'block',
                marginBottom: '8px',
              }}
            >
              DIRECTORY // LIVE INVENTORY
            </span>
            <h1
              style={{
                fontFamily: 'var(--font-cursorgothic)',
                fontSize: 'clamp(2rem, 4vw, 2.6rem)',
                fontWeight: 400,
                color: 'var(--color-ink)',
                lineHeight: 1.1,
                marginBottom: '6px',
                letterSpacing: '-0.02em',
              }}
            >
              Campus Inventory
            </h1>
            <p style={{ color: 'var(--color-driftwood)', fontSize: '14px', margin: 0 }}>
              Live, verified log of lost and found items recorded across campus departments.
            </p>
          </div>

          {error && (
            <p role="alert" style={{ color: 'var(--color-crimson)', fontSize: '13px', margin: 0 }}>
              {error}
            </p>
          )}

          {/* Quick Counter */}
          <div
            style={{
              background: 'var(--color-bone)',
              border: '1px solid var(--color-stone)',
              borderRadius: '4px',
              padding: '10px 18px',
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              boxShadow: 'var(--shadow-warm)',
            }}
          >
            <div style={{ textAlign: 'right' }}>
              <span
                style={{
                  display: 'block',
                  fontFamily: 'var(--font-berkeleymono)',
                  fontSize: '10px',
                  color: 'var(--color-ash)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                }}
              >
                INDEXED
              </span>
              <span
                style={{
                  fontSize: '18px',
                  fontWeight: 500,
                  color: 'var(--color-ink)',
                  fontFamily: 'var(--font-berkeleymono)',
                }}
              >
                {filtered.length}
              </span>
            </div>
            <div style={{ width: '1px', height: '24px', background: 'var(--color-stone)' }} />
            <div>
              <span
                style={{
                  display: 'block',
                  fontFamily: 'var(--font-berkeleymono)',
                  fontSize: '10px',
                  color: 'var(--color-ash)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                }}
              >
                NETWORK
              </span>
              <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--color-forest)' }}>
                Active
              </span>
            </div>
          </div>
        </div>

        {/* Search controls row */}
        <div
          style={{
            display: 'flex',
            gap: '12px',
            marginBottom: '28px',
            flexWrap: 'wrap',
            alignItems: 'center',
          }}
        >
          {/* Main search bar */}
          <div style={{ flex: 1, minWidth: '280px', position: 'relative' }}>
            <Search
              size={15}
              style={{
                position: 'absolute',
                left: '14px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--color-ash)',
              }}
            />
            <input
              type="text"
              placeholder="Search by name, description, category, or location..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="form-input"
              style={{
                paddingLeft: '40px',
                paddingRight: query ? '36px' : '14px',
                background: '#ffffff',
              }}
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'var(--color-ash)',
                  cursor: 'pointer',
                  padding: 0,
                }}
                aria-label="Clear query"
              >
                <X size={15} />
              </button>
            )}
          </div>

          {/* Mobile Filter Toggle */}
          <button
            onClick={() => setShowFiltersMobile((p) => !p)}
            className="btn-secondary cf-search-mobile-btn"
            style={{
              padding: '9px 14px',
              display: 'none',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <SlidersHorizontal size={14} />
            Filters
            {activeFiltersCount > 0 && (
              <span
                style={{
                  background: 'var(--color-ink)',
                  color: 'var(--color-parchment)',
                  borderRadius: '2px',
                  padding: '1px 5px',
                  fontSize: '10px',
                  fontFamily: 'var(--font-berkeleymono)',
                }}
              >
                {activeFiltersCount}
              </span>
            )}
          </button>

          {/* Grid / List Toggle */}
          <div
            style={{
              display: 'flex',
              background: 'var(--color-bone)',
              border: '1px solid var(--color-stone)',
              borderRadius: '4px',
              overflow: 'hidden',
              padding: '2px',
            }}
          >
            <button
              onClick={() => setViewMode('grid')}
              style={{
                padding: '6px 10px',
                border: 'none',
                cursor: 'pointer',
                background: viewMode === 'grid' ? 'var(--color-linen)' : 'transparent',
                color: 'var(--color-ink)',
                borderRadius: '3px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                transition: 'all 150ms ease',
              }}
            >
              <Grid size={13} />
              <span style={{ fontSize: '12px', fontWeight: 500 }}>Grid</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              style={{
                padding: '6px 10px',
                border: 'none',
                cursor: 'pointer',
                background: viewMode === 'list' ? 'var(--color-linen)' : 'transparent',
                color: 'var(--color-ink)',
                borderRadius: '3px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                transition: 'all 150ms ease',
              }}
            >
              <List size={13} />
              <span style={{ fontSize: '12px', fontWeight: 500 }}>List</span>
            </button>
          </div>
        </div>

        {/* Split Layout */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '240px 1fr',
            gap: '32px',
          }}
          className="search-split-layout"
        >
          {/* Desktop Sidebar Filters */}
          <aside
            className="cf-search-sidebar"
            style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}
          >
            <div
              style={{
                padding: '20px',
                border: '1px solid var(--color-stone)',
                background: 'var(--color-bone)',
                borderRadius: '4px',
                position: 'sticky',
                top: '80px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '16px',
                  paddingBottom: '10px',
                  borderBottom: '1px solid var(--color-stone)',
                }}
              >
                <span
                  style={{
                    fontFamily: 'var(--font-berkeleymono)',
                    fontSize: '11px',
                    fontWeight: 500,
                    color: 'var(--color-ash)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                  }}
                >
                  FILTER OPTIONS
                </span>
                {activeFiltersCount > 0 && (
                  <button
                    onClick={handleClearAll}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--color-ember)',
                      fontSize: '11px',
                      cursor: 'pointer',
                      fontFamily: 'var(--font-berkeleymono)',
                    }}
                  >
                    Reset
                  </button>
                )}
              </div>

              {/* Status Selector */}
              <div className="form-group" style={{ marginBottom: '18px' }}>
                <label className="form-label">Status</label>
                <div style={{ display: 'flex', gap: '3px' }}>
                  {STATUSES.map((st) => (
                    <button
                      key={st}
                      onClick={() => setStatus(st)}
                      style={{
                        flex: 1,
                        padding: '6px 4px',
                        borderRadius: '3px',
                        border: '1px solid',
                        borderColor: status === st ? 'var(--color-ink)' : 'var(--color-stone)',
                        background: status === st ? 'var(--color-linen)' : '#ffffff',
                        color: 'var(--color-ink)',
                        fontSize: '12px',
                        fontWeight: status === st ? 500 : 400,
                        cursor: 'pointer',
                        transition: 'all 150ms ease',
                      }}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Category */}
              <div className="form-group" style={{ marginBottom: '18px' }}>
                <label className="form-label">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="form-input"
                  style={{ cursor: 'pointer', fontSize: '13px' }}
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Location */}
              <div className="form-group">
                <label className="form-label">Campus Zone</label>
                <select
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="form-input"
                  style={{ cursor: 'pointer', fontSize: '13px' }}
                >
                  {LOCATIONS.map((loc) => (
                    <option key={loc} value={loc}>
                      {loc}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </aside>

          {/* Results Area */}
          <div>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '80px 24px', color: 'var(--color-ash)' }}>
                <span
                  style={{
                    width: '24px',
                    height: '24px',
                    border: '2px solid var(--color-stone)',
                    borderTopColor: 'var(--color-ink)',
                    borderRadius: '50%',
                    display: 'inline-block',
                    animation: 'spin 0.8s linear infinite',
                    marginBottom: '12px',
                  }}
                />
                <p style={{ fontSize: '13px', fontFamily: 'var(--font-berkeleymono)' }}>Loading directory records...</p>
              </div>
            ) : filtered.length === 0 ? (
              <div
                style={{
                  textAlign: 'center',
                  padding: '64px 24px',
                  background: 'var(--color-bone)',
                  border: '1px solid var(--color-stone)',
                  borderRadius: '4px',
                }}
              >
                <AlertCircle size={26} color="var(--color-ash)" style={{ marginBottom: '12px' }} />
                <h3 style={{ color: 'var(--color-ink)', fontWeight: 400, fontSize: '17px', marginBottom: '6px' }}>
                  No Items Found
                </h3>
                <p style={{ color: 'var(--color-driftwood)', fontSize: '14px', maxWidth: '340px', margin: '0 auto 18px', lineHeight: 1.5 }}>
                  No campus listings matched your active filters or query.
                </p>
                <button onClick={handleClearAll} className="btn-secondary" style={{ padding: '8px 16px', fontSize: '13px' }}>
                  Reset Filters
                </button>
              </div>
            ) : viewMode === 'grid' ? (
              /* Grid Layout */
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))',
                  gap: '16px',
                }}
              >
                {filtered.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setSelectedItem(item)}
                    style={{
                      padding: '18px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px',
                      border: '1px solid var(--color-stone)',
                      background: 'var(--color-bone)',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      transition: 'all 150ms ease',
                      boxShadow: 'var(--shadow-warm)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'var(--color-border-strong)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(38, 37, 30, 0.06)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'var(--color-stone)';
                      e.currentTarget.style.boxShadow = 'var(--shadow-warm)';
                    }}
                  >
                    {/* Header badge */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span className={`badge ${item.reportType === 'lost' ? 'badge-claimed' : item.status === 'claimed' ? 'badge-claimed' : 'badge-found'}`}>
                        {item.reportType === 'lost' ? 'Lost report' : item.status === 'claimed' ? 'Handed over' : 'Found'}
                      </span>
                      <span style={{ fontSize: '11px', color: 'var(--color-ash)', fontFamily: 'var(--font-berkeleymono)' }}>
                        {item.time}
                      </span>
                    </div>

                    {/* Content */}
                    <div style={{ flex: 1 }}>
                      <h4 style={{ fontWeight: 500, fontSize: '15px', color: 'var(--color-ink)', marginBottom: '6px', lineHeight: 1.4 }}>
                        {item.name}
                      </h4>
                      <p
                        style={{
                          fontSize: '13px',
                          color: 'var(--color-driftwood)',
                          lineHeight: 1.5,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          margin: 0,
                        }}
                      >
                        {item.desc}
                      </p>
                    </div>

                    {/* Footer */}
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '10px',
                        borderTop: '1px solid var(--color-linen)',
                        paddingTop: '12px',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '12px', color: 'var(--color-ash)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <MapPin size={12} /> {item.location.split(' (')[0]}
                        </span>
                        <span className="badge" style={{ fontSize: '10px' }}>
                          {item.category}
                        </span>
                      </div>

                      <button
                        className={item.reportType === 'found' && item.status === 'available' ? 'btn-primary' : 'btn-secondary'}
                        style={{
                          width: '100%',
                          padding: '7px 0',
                          fontSize: '13px',
                          justifyContent: 'center',
                        }}
                      >
                        View Details
                        <ArrowRight size={12} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* List Layout */
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {filtered.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setSelectedItem(item)}
                    style={{
                      padding: '12px 18px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px',
                      flexWrap: 'wrap',
                      background: 'var(--color-bone)',
                      border: '1px solid var(--color-stone)',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      transition: 'all 150ms ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'var(--color-border-strong)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'var(--color-stone)';
                    }}
                  >
                    <span
                      className={`badge ${item.reportType === 'lost' ? 'badge-claimed' : item.status === 'claimed' ? 'badge-claimed' : 'badge-found'}`}
                      style={{ minWidth: '70px', justifyContent: 'center' }}
                    >
                      {item.reportType === 'lost' ? 'Lost report' : item.status === 'claimed' ? 'Handed over' : 'Found'}
                    </span>
                    <div style={{ flex: 1, minWidth: '220px' }}>
                      <h4 style={{ fontWeight: 500, color: 'var(--color-ink)', fontSize: '14px', marginBottom: '2px' }}>
                        {item.name}
                      </h4>
                      <p
                        style={{
                          color: 'var(--color-driftwood)',
                          fontSize: '12px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          maxWidth: '420px',
                          margin: 0,
                        }}
                      >
                        {item.desc}
                      </p>
                    </div>
                    <span className="badge" style={{ fontSize: '10px' }}>{item.category}</span>
                    <span style={{ fontSize: '12px', color: 'var(--color-ash)', minWidth: '120px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <MapPin size={11} /> {item.location}
                    </span>
                    <span style={{ fontSize: '11px', color: 'var(--color-ash)', minWidth: '80px', fontFamily: 'var(--font-berkeleymono)' }}>
                      {item.time}
                    </span>
                    <button
                      className={item.reportType === 'found' && item.status === 'available' ? 'btn-primary' : 'btn-secondary'}
                      style={{ padding: '6px 12px', fontSize: '12px' }}
                    >
                      View
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Mobile Filters Drawer */}
      {showFiltersMobile && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(38, 37, 30, 0.45)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            justifyContent: 'flex-end',
            zIndex: 1100,
          }}
          onClick={() => setShowFiltersMobile(false)}
        >
          <div
            style={{
              background: 'var(--color-parchment)',
              borderLeft: '1px solid var(--color-stone)',
              width: '100%',
              maxWidth: '320px',
              height: '100%',
              padding: '24px 20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '18px',
              boxShadow: 'var(--shadow-xl)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span
                style={{
                  fontFamily: 'var(--font-berkeleymono)',
                  fontSize: '12px',
                  fontWeight: 500,
                  color: 'var(--color-ink)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                }}
              >
                Filters
              </span>
              <button
                onClick={() => setShowFiltersMobile(false)}
                style={{ background: 'none', border: 'none', color: 'var(--color-ash)', cursor: 'pointer', padding: 0 }}
                aria-label="Close filters"
              >
                <X size={18} />
              </button>
            </div>

            {/* Status */}
            <div className="form-group">
              <label className="form-label">Status</label>
              <div style={{ display: 'flex', gap: '3px' }}>
                {STATUSES.map((st) => (
                  <button
                    key={st}
                    onClick={() => setStatus(st)}
                    style={{
                      flex: 1,
                      padding: '8px 4px',
                      borderRadius: '3px',
                      border: '1px solid',
                      borderColor: status === st ? 'var(--color-ink)' : 'var(--color-stone)',
                      background: status === st ? 'var(--color-linen)' : '#ffffff',
                      color: 'var(--color-ink)',
                      fontSize: '12px',
                      fontWeight: 500,
                      cursor: 'pointer',
                    }}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Category */}
            <div className="form-group">
              <label className="form-label">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="form-input"
                style={{ cursor: 'pointer' }}
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Location */}
            <div className="form-group">
              <label className="form-label">Campus Zone</label>
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="form-input"
                style={{ cursor: 'pointer' }}
              >
                {LOCATIONS.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ marginTop: 'auto', display: 'flex', gap: '10px' }}>
              <button
                onClick={handleClearAll}
                className="btn-secondary"
                style={{ flex: 1, padding: '9px 0', fontSize: '13px' }}
              >
                Reset
              </button>
              <button
                onClick={() => setShowFiltersMobile(false)}
                className="btn-primary"
                style={{ flex: 1, padding: '9px 0', fontSize: '13px' }}
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Item Details / Claim Modal */}
      {selectedItem && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(38, 37, 30, 0.45)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1200,
            padding: '20px',
          }}
          onClick={handleCloseModal}
        >
          <div
            style={{
              background: 'var(--color-bone)',
              border: '1px solid var(--color-stone)',
              borderRadius: '8px', /* Design.md modal radius: 8px */
              width: '100%',
              maxWidth: '520px',
              padding: '28px',
              position: 'relative',
              boxShadow: 'var(--shadow-xl)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={handleCloseModal}
              style={{
                position: 'absolute',
                top: '18px',
                right: '18px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--color-ash)',
                padding: '4px',
              }}
              aria-label="Close modal"
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-ink)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--color-ash)')}
            >
              <X size={16} />
            </button>

            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '12px' }}>
              <span className={`badge ${selectedItem.reportType === 'lost' ? 'badge-claimed' : selectedItem.status === 'claimed' ? 'badge-claimed' : 'badge-found'}`}>
                {selectedItem.reportType === 'lost' ? 'Lost report' : selectedItem.status === 'claimed' ? 'Handed over' : 'Found'}
              </span>
              <span style={{ fontSize: '11px', color: 'var(--color-ash)', fontFamily: 'var(--font-berkeleymono)' }}>
                {selectedItem.time}
              </span>
            </div>

            <h3
              style={{
                fontFamily: 'var(--font-cursorgothic)',
                fontWeight: 500,
                fontSize: '1.25rem',
                color: 'var(--color-ink)',
                marginBottom: '14px',
                lineHeight: 1.3,
                letterSpacing: '-0.015em',
              }}
            >
              {selectedItem.name}
            </h3>

            {/* Item Image */}
            {selectedItem.image && (
              <div
                style={{
                  width: '100%',
                  maxHeight: '200px',
                  borderRadius: '4px',
                  overflow: 'hidden',
                  marginBottom: '16px',
                  border: '1px solid var(--color-stone)',
                  background: '#ffffff',
                }}
              >
                <img
                  src={selectedItem.image.startsWith('http') ? selectedItem.image : `http://localhost:5000${selectedItem.image}`}
                  alt={selectedItem.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              </div>
            )}

            <div
              style={{
                background: '#ffffff',
                border: '1px solid var(--color-stone)',
                borderRadius: '4px',
                padding: '14px',
                marginBottom: '18px',
              }}
            >
              <p style={{ fontSize: '13px', color: 'var(--color-driftwood)', lineHeight: 1.6, margin: 0 }}>
                {selectedItem.desc}
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '22px' }}>
              <div>
                <span style={{ fontSize: '10px', color: 'var(--color-ash)', display: 'block', marginBottom: '3px', fontFamily: 'var(--font-berkeleymono)', textTransform: 'uppercase' }}>
                  ZONE
                </span>
                <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--color-ink)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <MapPin size={12} /> {selectedItem.location}
                </span>
              </div>
              <div>
                <span style={{ fontSize: '10px', color: 'var(--color-ash)', display: 'block', marginBottom: '3px', fontFamily: 'var(--font-berkeleymono)', textTransform: 'uppercase' }}>
                  CATEGORY
                </span>
                <span className="badge">
                  {selectedItem.category}
                </span>
              </div>
            </div>

            <div style={{ display: 'grid', gap: '12px' }}>
              <p style={{ margin: 0, color: 'var(--color-driftwood)', fontSize: '13px', lineHeight: 1.6 }}>
                {selectedItem.reportType === 'lost'
                  ? 'This item has been reported lost. Contact the administration office if you have information about it.'
                  : selectedItem.status === 'claimed'
                    ? 'This item has already been handed over to its verified claimant.'
                    : 'To recover this found item, visit the administration office for in-person email and identity verification.'}
              </p>
              <button onClick={handleCloseModal} className="btn-secondary" style={{ padding: '10px 0', fontSize: '13px' }}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 820px) {
          .cf-search-sidebar { display: none !important; }
          .cf-search-mobile-btn { display: inline-flex !important; }
          .search-split-layout { grid-template-columns: 1fr !important; }
        }
      `}</style>

      <Footer />
    </div>
  );
}
