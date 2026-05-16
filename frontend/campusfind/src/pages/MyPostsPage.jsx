import { useEffect, useState } from "react";
import { itemsAPI } from "../api/services";
import ItemCard from "../components/ItemCard";
import Spinner from "../components/Spinner";
import Toast from "../components/Toast";

export default function MyPostsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    itemsAPI.getMyPosts()
      .then(({ data }) => setItems(data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id) => {
    try {
      await itemsAPI.delete(id);
      setItems((prev) => prev.filter((i) => i._id !== id));
      setToast({ message: "Item deleted.", type: "success" });
    } catch {
      setToast({ message: "Failed to delete.", type: "error" });
    }
  };

  const stats = {
    total: items.length,
    available: items.filter(i => i.status === "available").length,
    pending: items.filter(i => i.status === "pending").length,
    claimed: items.filter(i => i.status === "claimed").length,
  };

  return (
    <div className="min-h-screen bg-[#0f1117] pt-20 pb-12 px-4">
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 animate-fade-in">
          <h1 className="text-3xl font-bold text-white mb-2">My Posted Items</h1>
          <p className="text-[#8892a4]">Manage all your found item reports</p>
        </div>

        {!loading && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
            {[
              { label: "Total", value: stats.total, color: "text-white" },
              { label: "Available", value: stats.available, color: "text-emerald-400" },
              { label: "Pending", value: stats.pending, color: "text-amber-400" },
              { label: "Claimed", value: stats.claimed, color: "text-blue-400" },
            ].map(({ label, value, color }) => (
              <div key={label} className="bg-[#1e2130] border border-[#2a2d3e] rounded-xl p-4 text-center">
                <div className={`text-xl font-bold ${color}`}>{value}</div>
                <div className="text-xs text-[#8892a4] mt-1">{label}</div>
              </div>
            ))}
          </div>
        )}

        {loading ? (
          <Spinner size="lg" />
        ) : items.length === 0 ? (
          <div className="bg-[#1e2130] border border-[#2a2d3e] rounded-2xl p-16 text-center text-[#8892a4]">
            <div className="text-5xl mb-4">📭</div>
            <h3 className="text-white font-semibold text-lg mb-2">No posts yet</h3>
            <p className="text-sm mb-6">Start by posting a found item.</p>
            <a href="/items/post" className="inline-block bg-[#6c63ff] hover:bg-[#5a52e0] text-white px-6 py-3 rounded-xl font-medium transition-all">Post Item</a>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {items.map((item) => (
              <ItemCard key={item._id} item={item} showDelete onDelete={handleDelete} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
