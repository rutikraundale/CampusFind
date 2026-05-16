import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";

const NAV_ITEMS_STUDENT = [
  { label: "Dashboard", path: "/dashboard", icon: "⊞" },
  { label: "Browse Items", path: "/items", icon: "⊙" },
  { label: "Post Item", path: "/items/post", icon: "⊕" },
  { label: "My Posts", path: "/items/my-posts", icon: "◧" },
  { label: "My Claims", path: "/claims/my-claims", icon: "✦" },
];

const NAV_ITEMS_ADMIN = [
  { label: "Dashboard", path: "/admin/dashboard", icon: "⊞" },
  { label: "Manage Items", path: "/admin/items", icon: "⊙" },
  { label: "All Claims", path: "/admin/claims", icon: "✦" },
  { label: "Verify Claim", path: "/admin/verify-claim", icon: "✔" },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropOpen, setDropOpen] = useState(false);

  const navItems = user?.role === "admin" ? NAV_ITEMS_ADMIN : NAV_ITEMS_STUDENT;

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#1a1d27]/90 backdrop-blur-md border-b border-[#2a2d3e]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-[#6c63ff] flex items-center justify-center text-white font-bold text-sm group-hover:shadow-[0_0_16px_rgba(108,99,255,0.5)] transition-shadow">
              CF
            </div>
            <span className="text-white font-semibold text-lg tracking-tight">CampusFind</span>
          </Link>

          {/* Desktop Nav */}
          {user && (
            <div className="hidden md:flex items-center gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-1.5 ${
                    isActive(item.path)
                      ? "bg-[#6c63ff] text-white shadow-[0_0_12px_rgba(108,99,255,0.35)]"
                      : "text-[#8892a4] hover:text-white hover:bg-[#2a2d3e]"
                  }`}
                >
                  <span>{item.icon}</span>
                  {item.label}
                </Link>
              ))}
            </div>
          )}

          {/* Right side */}
          <div className="flex items-center gap-3">
            {!user ? (
              <>
                <Link
                  to="/login"
                  className="text-sm font-medium text-[#8892a4] hover:text-white transition-colors px-3 py-2 rounded-lg hover:bg-[#2a2d3e]"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="text-sm font-medium bg-[#6c63ff] hover:bg-[#5a52e0] text-white px-4 py-2 rounded-lg transition-all hover:shadow-[0_0_16px_rgba(108,99,255,0.4)]"
                >
                  Register
                </Link>
              </>
            ) : (
              <div className="relative">
                <button
                  onClick={() => setDropOpen(!dropOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-[#2a2d3e] transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#6c63ff] to-[#a78bfa] flex items-center justify-center text-white text-sm font-semibold">
                    {(user.username || user.email || "U")[0].toUpperCase()}
                  </div>
                  <div className="hidden sm:block text-left">
                    <div className="text-sm font-medium text-white">{user.username || user.email}</div>
                    <div className="text-xs text-[#8892a4] capitalize">{user.role}</div>
                  </div>
                  <svg className={`w-4 h-4 text-[#8892a4] transition-transform ${dropOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {dropOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-[#1e2130] border border-[#2a2d3e] rounded-xl shadow-xl overflow-hidden animate-fade-in">
                    <Link
                      to="/profile"
                      onClick={() => setDropOpen(false)}
                      className="flex items-center gap-2 px-4 py-3 text-sm text-[#8892a4] hover:text-white hover:bg-[#2a2d3e] transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                      Profile
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                      Logout
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Mobile toggle */}
            {user && (
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="md:hidden p-2 rounded-lg text-[#8892a4] hover:text-white hover:bg-[#2a2d3e] transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {mobileOpen
                    ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  }
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && user && (
        <div className="md:hidden bg-[#1a1d27] border-t border-[#2a2d3e] px-4 py-3 space-y-1 animate-fade-in">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                isActive(item.path)
                  ? "bg-[#6c63ff] text-white"
                  : "text-[#8892a4] hover:text-white hover:bg-[#2a2d3e]"
              }`}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
