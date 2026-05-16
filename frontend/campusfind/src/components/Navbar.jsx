import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dropOpen, setDropOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 neo-nav" style={{ height: '88px' }}>
      <div className="max-w-[1280px] mx-auto flex items-center justify-between transition-all duration-300 w-full h-full px-6 md:px-12">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <svg className="w-8 h-8 text-[#EAECEF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <span className="text-[1.8rem] md:text-[2rem] font-[600] tracking-[-0.03em] text-[#EAECEF]">CampusFind</span>
        </Link>

        <div className="flex items-center gap-4 md:gap-6">
          {!user ? (
            <>
              <Link to="/login" className="hidden md:flex items-center justify-center text-[16px] font-medium text-white/90 neo-btn-login rounded-[14px] hover:text-white transition-colors" style={{ height: '52px', padding: '0 34px', minWidth: '110px' }}>
                Login
              </Link>
              <Link to="/register" className="flex items-center justify-center text-[16px] font-medium text-white neo-btn-register rounded-[14px]" style={{ height: '52px', padding: '0 34px', minWidth: '130px' }}>
                Register
              </Link>
            </>
          ) : (
            <div className="relative">
              <button 
                onClick={() => setDropOpen(!dropOpen)}
                className="flex items-center gap-3 px-4 neo-btn-login rounded-xl group"
                style={{ height: '52px' }}
              >
                <div className="w-8 h-8 rounded-full neo-icon-container flex items-center justify-center text-[#D7DCE8] font-bold text-sm">
                  {user.username?.[0].toUpperCase()}
                </div>
                <span className="hidden md:block text-[#D7DCE8] font-medium group-hover:text-white transition-colors">{user.username}</span>
                <svg className={`w-4 h-4 text-white/40 transition-transform ${dropOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {dropOpen && (
                <div className="absolute right-0 mt-3 w-48 neo-info-card border border-white/10 overflow-hidden p-2 z-50 shadow-2xl">
                  <Link to="/dashboard" className="block px-4 py-3 text-sm text-[#D7DCE8] hover:text-white hover:bg-white/5 rounded-xl transition-colors">Dashboard</Link>
                  <Link to="/profile" className="block px-4 py-3 text-sm text-[#D7DCE8] hover:text-white hover:bg-white/5 rounded-xl transition-colors">Profile</Link>
                  <div className="h-px bg-white/5 my-1"></div>
                  <button 
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-3 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-colors"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
