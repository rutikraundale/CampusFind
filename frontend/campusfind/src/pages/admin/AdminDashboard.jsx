import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { adminAPI, claimsAPI } from "../../api/services";
import Spinner from "../../components/Spinner";
import { Link } from "react-router-dom";

function StatCard({ label, value, icon, sub }) {
  return (
    <div className="bg-[#1e2130] border border-[#2a2d3e] rounded-2xl p-6 hover:border-[#6c63ff]/40 transition-all duration-300">
      <div className="flex items-center justify-between mb-3">
        <span className="text-2xl">{icon}</span>
        <span className="text-2xl font-bold text-white">{value}</span>
      </div>
      <div className="text-sm font-medium text-[#8892a4]">{label}</div>
      {sub && <div className="text-xs text-[#6c63ff] mt-1">{sub}</div>}
    </div>
  );
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      adminAPI.getManagedItems(),
      claimsAPI.getAll(),
    ]).then(([itemsRes, claimsRes]) => {
      setItems(itemsRes.data.items || []);
      setClaims(claimsRes.data.data || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const available = items.filter(i => i.status === "available").length;
  const pending = items.filter(i => i.status === "pending").length;
  const claimed = items.filter(i => i.status === "claimed").length;
  const unverifiedClaims = claims.filter(c => !c.isVerified).length;

  return (
    <div className="min-h-screen bg-[#0f1117] pt-20 pb-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 animate-fade-in">
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">Admin Dashboard</h1>
            <p className="text-[#8892a4]">Welcome, <span className="text-[#6c63ff]">{user?.email}</span></p>
          </div>
          <div className="hidden sm:flex items-center gap-2 bg-[#6c63ff]/10 border border-[#6c63ff]/20 text-[#a78bfa] text-xs font-medium px-3 py-2 rounded-full">
            <span className="w-2 h-2 rounded-full bg-[#6c63ff] animate-pulse" />
            Admin Panel
          </div>
        </div>

        {loading ? <Spinner size="lg" /> : (
          <>
            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <StatCard label="Total Items" value={items.length} icon="📦" sub="All reported items" />
              <StatCard label="Available" value={available} icon="✅" sub="Ready to claim" />
              <StatCard label="Pending Claims" value={pending} icon="⏳" sub="Awaiting verification" />
              <StatCard label="Claimed" value={claimed} icon="🎯" sub="Successfully returned" />
            </div>

            {/* Pending Claims Alert */}
            {unverifiedClaims > 0 && (
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-5 mb-8 flex items-center gap-4 animate-fade-in">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400 text-xl flex-shrink-0">⚠️</div>
                <div className="flex-1">
                  <p className="text-amber-400 font-semibold">{unverifiedClaims} Pending Claim{unverifiedClaims > 1 ? "s" : ""}</p>
                  <p className="text-amber-400/70 text-sm">Students are waiting for OTP verification</p>
                </div>
                <Link to="/admin/verify-claim" className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex-shrink-0">
                  Verify Now
                </Link>
              </div>
            )}

            {/* Quick Admin Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              {[
                { label: "Verify OTP Claim", desc: "Process student claims", icon: "✔", href: "/admin/verify-claim", color: "from-[#6c63ff] to-[#a78bfa]" },
                { label: "Manage Items", desc: "Filter by category/status", icon: "⊙", href: "/admin/items", color: "from-emerald-500 to-teal-500" },
                { label: "All Claims", desc: "View complete claim list", icon: "✦", href: "/admin/claims", color: "from-amber-500 to-orange-500" },
              ].map((action) => (
                <Link key={action.href} to={action.href} className="group bg-[#1e2130] border border-[#2a2d3e] hover:border-[#6c63ff]/40 rounded-2xl p-5 transition-all duration-300 hover:shadow-[0_0_24px_rgba(108,99,255,0.1)]">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center text-white text-xl mb-4 group-hover:scale-110 transition-transform`}>
                    {action.icon}
                  </div>
                  <div className="text-white font-semibold mb-1">{action.label}</div>
                  <div className="text-[#8892a4] text-sm">{action.desc}</div>
                </Link>
              ))}
            </div>

            {/* Recent Claims */}
            <div className="bg-[#1e2130] border border-[#2a2d3e] rounded-2xl p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-white font-semibold text-lg">Recent Claims</h2>
                <Link to="/admin/claims" className="text-sm text-[#6c63ff] hover:text-[#a78bfa] transition-colors">View all →</Link>
              </div>
              <div className="space-y-3">
                {claims.slice(0, 5).map((claim) => (
                  <div key={claim._id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-[#2a2d3e] transition-colors">
                    <div className="w-10 h-10 rounded-lg bg-[#2a2d3e] overflow-hidden flex-shrink-0">
                      {claim.itemId?.image ? (
                        <img src={claim.itemId.image} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">📦</div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium truncate">{claim.itemId?.title || "Unknown"}</p>
                      <p className="text-[#8892a4] text-xs">{claim.student_id?.username || claim.student_id?.email}</p>
                    </div>
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full border flex-shrink-0 ${claim.isVerified ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" : "bg-amber-500/15 text-amber-400 border-amber-500/30"}`}>
                      {claim.isVerified ? "Verified" : "Pending"}
                    </span>
                  </div>
                ))}
                {claims.length === 0 && <p className="text-center text-[#8892a4] py-6">No claims yet.</p>}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
