import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import SearchItemPage from './pages/SearchItemPage';
import PostItemPage from './pages/PostItemPage';
import ProfilePage from './pages/ProfilePage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminClaimListPage from './pages/AdminClaimListPage';
import AdminHandoverPage from './pages/AdminHandoverPage';
import AddFoundItemPage from './pages/AddFoundItemPage';
import AdminItemRecordsPage from './pages/AdminItemRecordsPage';
import MobileFoundItemUploadPage from './pages/MobileFoundItemUploadPage';

function ProtectedAdminRoute({ children }) {
  let user = null;
  try {
    user = JSON.parse(localStorage.getItem('campusfind_user') || 'null');
  } catch {
    user = null;
  }
  if (!user || user.role !== 'admin') {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function StudentFacingRoute({ children }) {
  let role = null;
  try {
    role = JSON.parse(localStorage.getItem('campusfind_user') || 'null')?.role || null;
  } catch {
    localStorage.removeItem('campusfind_user');
    localStorage.removeItem('campusfind_token');
  }
  if (role === 'admin') return <Navigate to="/admin/dashboard" replace />;
  return children;
}

function DefaultRoute() {
  let role = null;
  try {
    role = JSON.parse(localStorage.getItem('campusfind_user') || 'null')?.role || null;
  } catch {
    localStorage.removeItem('campusfind_user');
    localStorage.removeItem('campusfind_token');
  }
  return <Navigate to={role === 'admin' ? '/admin/dashboard' : '/'} replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<StudentFacingRoute><LandingPage /></StudentFacingRoute>} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<StudentFacingRoute><RegisterPage /></StudentFacingRoute>} />
        <Route path="/search" element={<StudentFacingRoute><SearchItemPage /></StudentFacingRoute>} />
        <Route path="/post-item" element={<StudentFacingRoute><PostItemPage /></StudentFacingRoute>} />
        <Route path="/profile" element={<StudentFacingRoute><ProfilePage /></StudentFacingRoute>} />
        <Route path="/mobile-upload" element={<MobileFoundItemUploadPage />} />

        {/* Admin Routes */}
        <Route path="/admin/dashboard" element={<ProtectedAdminRoute><AdminDashboardPage /></ProtectedAdminRoute>} />
        <Route path="/admin/claims" element={<ProtectedAdminRoute><AdminClaimListPage /></ProtectedAdminRoute>} />
        <Route path="/admin/handover" element={<ProtectedAdminRoute><AdminHandoverPage /></ProtectedAdminRoute>} />
        <Route path="/admin/verify-claims" element={<Navigate to="/admin/handover" replace />} />
        <Route path="/admin/report" element={<ProtectedAdminRoute><AddFoundItemPage /></ProtectedAdminRoute>} />
        <Route path="/admin/records" element={<ProtectedAdminRoute><AdminItemRecordsPage /></ProtectedAdminRoute>} />
        <Route path="/admin/found-items/new" element={<Navigate to="/admin/report" replace />} />

        {/* Fallback */}
        <Route path="*" element={<DefaultRoute />} />
      </Routes>
    </BrowserRouter>
  );
}
