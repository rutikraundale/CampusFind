import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { itemsAPI } from "../api/services";

export default function HomePage() {
  const { user } = useAuth();
  const [recentItems, setRecentItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    itemsAPI.getAll({ limit: 4 })
      .then((res) => {
        setRecentItems(res.data.data || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ paddingTop: '160px' }} className="pb-20 px-6 md:px-12 max-w-7xl mx-auto flex flex-col items-center text-center">
      
      {/* Hero Section */}
      <h1 className="neo-hero-title text-white mb-6 animate-fade-in w-full">
        Lost Something on Campus?
      </h1>
      <p className="neo-hero-subtitle mb-16 max-w-2xl animate-fade-in opacity-80" style={{ animationDelay: '0.1s' }}>
        We're here to help you find and recover lost items securely and efficiently.
      </p>

      {/* Action Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full max-w-[1000px] mb-24 animate-fade-in" style={{ animationDelay: '0.2s' }}>
        <Link to="/items/post" className="neo-action-card w-full h-36 flex items-center justify-between px-8 group">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 rounded-2xl neo-icon-container flex items-center justify-center text-[#D7DCE8] group-hover:text-white transition-colors">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
            </div>
            <span className="text-xl md:text-2xl font-medium text-white/90 group-hover:text-white transition-colors tracking-tight">Upload Item</span>
          </div>
          <svg className="w-6 h-6 text-white/30 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
          </svg>
        </Link>

        <Link to="/items" className="neo-action-card w-full h-36 flex items-center justify-between px-8 group">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 rounded-2xl neo-icon-container flex items-center justify-center text-[#D7DCE8] group-hover:text-white transition-colors">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <span className="text-xl md:text-2xl font-medium text-white/90 group-hover:text-white transition-colors tracking-tight">Find Items</span>
          </div>
          <svg className="w-6 h-6 text-white/30 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>

      {/* Divider */}
      <div className="w-full max-w-5xl mb-24 flex justify-center">
        <div className="neo-divider w-full"></div>
      </div>

      {/* Bottom Info Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full max-w-[1000px] animate-fade-in text-left" style={{ animationDelay: '0.3s' }}>
        
        {/* Recent Items Section */}
        <div className="neo-info-card w-full min-h-[360px] p-8 flex flex-col items-start relative">
          <h2 className="neo-section-title text-white/90 mb-4">Recent Lost & Found Items</h2>
          <div className="w-full h-px neo-divider mb-8"></div>
          
          <div className="flex-1 w-full flex flex-col items-center justify-center text-center">
            <div className="mt-auto w-full flex justify-center">
              <Link to="/items" className="inline-flex items-center justify-center h-12 px-8 neo-btn-browse text-white font-medium tracking-tight text-base transition-colors hover:text-[#4880FF]">
                Browse Latest Items
              </Link>
            </div>
          </div>
        </div>

        {/* How It Works Section */}
        <div className="neo-info-card w-full min-h-[360px] p-8 flex flex-col items-start">
          <h2 className="neo-section-title text-white/90 mb-4">How It Works</h2>
          <div className="w-full h-px neo-divider mb-6"></div>
          
          <div className="w-full flex flex-col space-y-2">
            {[
              { step: "1. Report a Lost Item", icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg> },
              { step: "2. Search for Items", icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg> },
              { step: "3. Claim via Email OTP", icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg> }
            ].map((item, idx) => (
              <div key={idx} className="flex items-center gap-6 group h-16 border-b border-white/[0.06] last:border-0">
                <div className="w-12 h-12 rounded-full neo-step-icon flex items-center justify-center text-[#D7DCE8] group-hover:text-white transition-colors">
                  {item.icon}
                </div>
                <span className="text-lg font-medium text-[#AEB6C7] group-hover:text-white transition-colors tracking-tight">{item.step}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
