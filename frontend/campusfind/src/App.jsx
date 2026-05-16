import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

// Pages
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import BrowseItemsPage from "./pages/BrowseItemsPage";
import PostItemPage from "./pages/PostItemPage";
import MyPostsPage from "./pages/MyPostsPage";
import ItemDetailPage from "./pages/ItemDetailPage";
import MyClaimsPage from "./pages/MyClaimsPage";
import ProfilePage from "./pages/ProfilePage";
import VerifyEmailPage from "./pages/VerifyEmailPage";

// Admin pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminVerifyClaim from "./pages/admin/AdminVerifyClaim";
import AdminManageItems from "./pages/admin/AdminManageItems";
import AdminAllClaims from "./pages/admin/AdminAllClaims";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="flex flex-col min-h-screen selection:bg-[rgba(48,95,255,0.3)] selection:text-white relative z-10">
          <Navbar />
          <main className="flex-1">
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/items" element={<BrowseItemsPage />} />
              <Route path="/items/:id" element={<ItemDetailPage />} />
              <Route path="/verify-email/:token" element={<VerifyEmailPage />} />

              {/* Student-protected routes */}
              <Route element={<ProtectedRoute role="Student" />}>
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/items/post" element={<PostItemPage />} />
                <Route path="/items/my-posts" element={<MyPostsPage />} />
                <Route path="/claims/my-claims" element={<MyClaimsPage />} />
                <Route path="/profile" element={<ProfilePage />} />
              </Route>

              {/* Admin-protected routes */}
              <Route element={<ProtectedRoute role="admin" />}>
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="/admin/verify-claim" element={<AdminVerifyClaim />} />
                <Route path="/admin/items" element={<AdminManageItems />} />
                <Route path="/admin/claims" element={<AdminAllClaims />} />
                <Route path="/profile" element={<ProfilePage />} />
              </Route>

              {/* Catch-all */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}
