import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import SearchItemPage from './pages/SearchItemPage';
import PostItemPage from './pages/PostItemPage';
import ProfilePage from './pages/ProfilePage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminClaimListPage from './pages/AdminClaimListPage';
import AdminClaimVerificationPage from './pages/AdminClaimVerificationPage';

function ProtectedAdminRoute({ children }) {
  const userStr = localStorage.getItem('campusfind_user');
  const user = userStr ? JSON.parse(userStr) : null;
  if (!user || user.role !== 'admin') {
    return <Navigate to="/login" replace />;
  }
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/search" element={<SearchItemPage />} />
        <Route path="/post-item" element={<PostItemPage />} />
        <Route path="/profile" element={<ProfilePage />} />

        {/* Admin Routes */}
        <Route path="/admin/dashboard" element={<ProtectedAdminRoute><AdminDashboardPage /></ProtectedAdminRoute>} />
        <Route path="/admin/claims" element={<ProtectedAdminRoute><AdminClaimListPage /></ProtectedAdminRoute>} />
        <Route path="/admin/verify-claims" element={<ProtectedAdminRoute><AdminClaimVerificationPage /></ProtectedAdminRoute>} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
