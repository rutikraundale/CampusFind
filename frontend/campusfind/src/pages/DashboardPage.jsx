import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { itemsAPI, claimsAPI } from "../api/services";
import Spinner from "../components/Spinner";
import ItemCard from "../components/ItemCard";
import Toast from "../components/Toast";

function StatCard({ label, value, icon, color }) {
  return (
    <div className={`bg-[#1e2130] border border-[#2a2d3e] rounded-2xl p-6 flex items-center gap-4 hover:border-[#6c63ff]/40 transition-all duration-300`}>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${color}`}>
        {icon}
      </div>
      <div>
        <div className="text-2xl font-bold text-white">{value}</div>
        <div className="text-sm text-[#8892a4]">{label}</div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [myPosts, setMyPosts] = useState([]);
  const [myClaims, setMyClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    Promise.all([
      itemsAPI.getMyPosts(),
      claimsAPI.getMyClaims(),
    ]).then(([postsRes, claimsRes]) => {
      setMyPosts(postsRes.data.data || []);
      setMyClaims(claimsRes.data.data || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id) => {
    try {
      await itemsAPI.delete(id);
      setMyPosts((prev) => prev.filter((p) => p._id !== id));
      setToast({ message: "Item deleted successfully", type: "success" });
    } catch {
      setToast({ message: "Failed to delete item", type: "error" });
    }
  };

  const stats = [
    { label: "Items Posted", value: myPosts.length, icon: "📤", color: "bg-[#6c63ff]/15" },
    { label: "Available Items", value: myPosts.filter(p => p.status === "available").length, icon: "✅", color: "bg-emerald-500/15" },
    { label: "Claims Made", value: myClaims.length, icon: "🏷️", color: "bg-amber-500/15" },
    { label: "Items Claimed", value: myClaims.filter(c => c.isVerified).length, icon: "🎉", color: "bg-blue-500/15" },
  ];

  return (
    <div className="min-h-screen bg-[#0f1117] pt-20 pb-12 px-4">
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#6c63ff] to-[#a78bfa] flex items-center justify-center text-white font-bold">
              {(user?.username || "U")[0].toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">
                Welcome back, <span className="text-[#6c63ff]">{user?.username}</span>!
              </h1>
              <p className="text-[#8892a4] text-sm">Here's what's happening with your items</p>
            </div>
          </div>
        </div>

        {loading ? <Spinner size="lg" /> : (
          <>
            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {stats.map((s) => <StatCard key={s.label} {...s} />)}
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              <Link
                to="/items/post"
                className="flex items-center gap-4 bg-[#1e2130] hover:bg-[#6c63ff]/10 border border-[#2a2d3e] hover:border-[#6c63ff]/50 rounded-2xl p-5 transition-all duration-300 group"
              >
                <div className="w-12 h-12 rounded-xl bg-[#6c63ff]/20 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">📤</div>
                <div>
                  <div className="text-white font-semibold">Post Found Item</div>
                  <div className="text-[#8892a4] text-sm">Report a new found item</div>
                </div>
                <svg className="w-5 h-5 text-[#8892a4] ml-auto group-hover:text-[#6c63ff] group-hover:translate-x-1 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
              <Link
                to="/items"
                className="flex items-center gap-4 bg-[#1e2130] hover:bg-[#6c63ff]/10 border border-[#2a2d3e] hover:border-[#6c63ff]/50 rounded-2xl p-5 transition-all duration-300 group"
              >
                <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">🔍</div>
                <div>
                  <div className="text-white font-semibold">Search Items</div>
                  <div className="text-[#8892a4] text-sm">Browse all lost & found</div>
                </div>
                <svg className="w-5 h-5 text-[#8892a4] ml-auto group-hover:text-[#6c63ff] group-hover:translate-x-1 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

            {/* My Posts */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-white font-semibold text-lg">My Posted Items</h2>
                <Link to="/items/my-posts" className="text-sm text-[#6c63ff] hover:text-[#a78bfa] transition-colors">View all →</Link>
              </div>
              {myPosts.length === 0 ? (
                <div className="bg-[#1e2130] border border-[#2a2d3e] rounded-2xl p-10 text-center text-[#8892a4]">
                  <div className="text-4xl mb-3">📭</div>
                  <p>You haven't posted any items yet.</p>
                  <Link to="/items/post" className="inline-block mt-4 text-sm text-[#6c63ff] hover:text-[#a78bfa] transition-colors">Post your first item →</Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {myPosts.slice(0, 3).map((item) => (
                    <ItemCard key={item._id} item={item} showDelete onDelete={handleDelete} />
                  ))}
                </div>
              )}
            </div>

            {/* My Claims */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-white font-semibold text-lg">My Claims</h2>
                <Link to="/claims/my-claims" className="text-sm text-[#6c63ff] hover:text-[#a78bfa] transition-colors">View all →</Link>
              </div>
              {myClaims.length === 0 ? (
                <div className="bg-[#1e2130] border border-[#2a2d3e] rounded-2xl p-10 text-center text-[#8892a4]">
                  <div className="text-4xl mb-3">🏷️</div>
                  <p>You haven't claimed any items yet.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {myClaims.slice(0, 3).map((claim) => (
                    <div key={claim._id} className="bg-[#1e2130] border border-[#2a2d3e] rounded-xl p-4 flex items-center gap-4 hover:border-[#6c63ff]/30 transition-all">
                      <div className="w-10 h-10 rounded-lg bg-[#2a2d3e] flex items-center justify-center text-lg flex-shrink-0">
                        {claim.itemId?.image ? (
                          <img src={claim.itemId.image} className="w-full h-full object-cover rounded-lg" />
                        ) : "📦"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-medium truncate">{claim.itemId?.title || "Unknown Item"}</p>
                        <p className="text-[#8892a4] text-xs">{claim.itemId?.foundAt}</p>
                      </div>
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border flex-shrink-0 ${
                        claim.isVerified
                          ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                          : "bg-amber-500/15 text-amber-400 border-amber-500/30"
                      }`}>
                        {claim.isVerified ? "Verified" : "Pending"}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
