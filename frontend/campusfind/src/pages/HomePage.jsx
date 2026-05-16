import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";
import { itemsAPI } from "../api/services";
import ItemCard from "../components/ItemCard";
import Spinner from "../components/Spinner";

const HOW_IT_WORKS = [
  { icon: "📋", label: "Report a Lost Item", desc: "Post found items with photo and location." },
  { icon: "🔍", label: "Search for Items", desc: "Browse or search through the lost & found board." },
  { icon: "📧", label: "Claim via Email OTP", desc: "Verify ownership securely with OTP." },
];

export default function HomePage() {
  const { user } = useAuth();
  const [recentItems, setRecentItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    itemsAPI.getAll({ status: "available" }).then(({ data }) => {
      setRecentItems(data.data?.slice(0, 4) || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-[#0f1117]">
      {/* Hero */}
      <section className="pt-28 pb-16 px-4 text-center">
        <div className="max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#6c63ff]/10 border border-[#6c63ff]/20 text-[#a78bfa] text-xs font-medium mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-[#6c63ff] animate-pulse" />
            Campus Lost & Found Platform
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4 leading-tight">
            Lost Something on <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#6c63ff] to-[#a78bfa]">Campus?</span>
          </h1>
          <p className="text-[#8892a4] text-lg mb-10 max-w-xl mx-auto">
            We're here to help you find and recover lost items quickly and securely.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/items/post"
              className="group flex items-center justify-center gap-3 bg-[#1e2130] hover:bg-[#6c63ff] border border-[#2a2d3e] hover:border-[#6c63ff] text-white px-8 py-4 rounded-xl font-medium transition-all duration-300 hover:shadow-[0_0_24px_rgba(108,99,255,0.35)]"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              Upload Item
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
            <Link
              to="/items"
              className="group flex items-center justify-center gap-3 bg-[#1e2130] hover:bg-[#2a2d3e] border border-[#2a2d3e] text-white px-8 py-4 rounded-xl font-medium transition-all duration-300"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Find Items
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="pb-12 px-4">
        <div className="max-w-4xl mx-auto grid grid-cols-3 gap-4">
          {[
            { label: "Items Posted", value: "500+" },
            { label: "Items Returned", value: "350+" },
            { label: "Happy Students", value: "1K+" },
          ].map((stat) => (
            <div key={stat.label} className="bg-[#1e2130] border border-[#2a2d3e] rounded-xl p-5 text-center">
              <div className="text-2xl font-bold text-[#6c63ff] mb-1">{stat.value}</div>
              <div className="text-xs text-[#8892a4]">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Main content */}
      <section className="pb-16 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Items */}
          <div className="lg:col-span-2 bg-[#1e2130] border border-[#2a2d3e] rounded-2xl p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-white font-semibold text-lg">Recent Lost & Found Items</h2>
                <div className="w-12 h-0.5 bg-[#6c63ff] rounded mt-1" />
              </div>
              <Link to="/items" className="text-sm text-[#6c63ff] hover:text-[#a78bfa] transition-colors flex items-center gap-1">
                View all
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

            {loading ? (
              <Spinner />
            ) : recentItems.length === 0 ? (
              <div className="text-center py-12 text-[#8892a4]">
                <div className="text-4xl mb-3">📭</div>
                <p>No items yet. Be the first to post!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {recentItems.map((item) => (
                  <ItemCard key={item._id} item={item} />
                ))}
              </div>
            )}

            <div className="mt-6 pt-4 border-t border-[#2a2d3e]">
              <Link
                to="/items"
                className="w-full flex items-center justify-center gap-2 bg-[#2a2d3e] hover:bg-[#6c63ff] text-white py-3 rounded-xl font-medium transition-all duration-200 hover:shadow-[0_0_16px_rgba(108,99,255,0.3)]"
              >
                Browse Latest Items
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>

          {/* How It Works */}
          <div className="bg-[#1e2130] border border-[#2a2d3e] rounded-2xl p-6">
            <h2 className="text-white font-semibold text-lg mb-2">How It Works</h2>
            <div className="w-12 h-0.5 bg-[#6c63ff] rounded mb-6" />
            <div className="space-y-5">
              {HOW_IT_WORKS.map((step, i) => (
                <div key={i} className="flex items-start gap-4 group">
                  <div className="w-11 h-11 rounded-xl bg-[#2a2d3e] flex items-center justify-center text-xl flex-shrink-0 group-hover:bg-[#6c63ff]/20 group-hover:shadow-[0_0_12px_rgba(108,99,255,0.2)] transition-all">
                    {step.icon}
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">
                      {i + 1}. {step.label}
                    </p>
                    <p className="text-[#8892a4] text-xs mt-0.5 leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {!user && (
              <div className="mt-8 pt-6 border-t border-[#2a2d3e]">
                <p className="text-[#8892a4] text-sm mb-4">Join to start posting or claiming items</p>
                <Link
                  to="/register"
                  className="block w-full text-center bg-[#6c63ff] hover:bg-[#5a52e0] text-white py-3 rounded-xl font-medium transition-all hover:shadow-[0_0_16px_rgba(108,99,255,0.35)]"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
