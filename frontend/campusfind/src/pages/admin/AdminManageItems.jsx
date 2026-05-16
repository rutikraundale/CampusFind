import { useEffect, useState, useCallback } from "react";
import { adminAPI } from "../../api/services";
import Spinner from "../../components/Spinner";

const CATEGORIES = ["all", "electronics", "clothing", "accessories", "books", "documents", "other"];
const STATUSES = ["all", "available", "pending", "claimed"];

export default function AdminManageItems() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ category: "all", status: "all", startDate: "", endDate: "" });

  const fetchItems = useCallback(() => {
    setLoading(true);
    const params = {};
    if (filters.category !== "all") params.category = filters.category;
    if (filters.status !== "all") params.status = filters.status;
    if (filters.startDate) params.startDate = filters.startDate;
    if (filters.endDate) params.endDate = filters.endDate;
    adminAPI.getManagedItems(params)
      .then(({ data }) => setItems(data.items || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [filters]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const statusColors = {
    available: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    pending:   "bg-amber-500/15 text-amber-400 border-amber-500/30",
    claimed:   "bg-blue-500/15 text-blue-400 border-blue-500/30",
  };

  return (
    <div className="min-h-screen bg-[#0f1117] pt-20 pb-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 animate-fade-in">
          <h1 className="text-3xl font-bold text-white mb-2">Manage Items</h1>
          <p className="text-[#8892a4]">Filter and review all reported lost & found items</p>
        </div>

        {/* Filters */}
        <div className="bg-[#1e2130] border border-[#2a2d3e] rounded-2xl p-5 mb-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <select
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              className="bg-[#0f1117] border border-[#2a2d3e] rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#6c63ff] transition-all"
            >
              {CATEGORIES.map(c => <option key={c} value={c}>{c === "all" ? "All Categories" : c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
            </select>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="bg-[#0f1117] border border-[#2a2d3e] rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#6c63ff] transition-all"
            >
              {STATUSES.map(s => <option key={s} value={s}>{s === "all" ? "All Status" : s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
            </select>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
              className="bg-[#0f1117] border border-[#2a2d3e] rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#6c63ff] transition-all"
            />
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
              className="bg-[#0f1117] border border-[#2a2d3e] rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#6c63ff] transition-all"
            />
          </div>
        </div>

        {/* Count */}
        {!loading && (
          <p className="text-[#8892a4] text-sm mb-4">{items.length} items found</p>
        )}

        {/* Table */}
        {loading ? <Spinner size="lg" /> : items.length === 0 ? (
          <div className="bg-[#1e2130] border border-[#2a2d3e] rounded-2xl p-16 text-center text-[#8892a4]">
            <div className="text-5xl mb-4">📭</div>
            <p>No items match the filters.</p>
          </div>
        ) : (
          <div className="bg-[#1e2130] border border-[#2a2d3e] rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#2a2d3e]">
                    {["Item", "Category", "Location", "Posted By", "Date", "Status"].map((h) => (
                      <th key={h} className="text-left px-5 py-4 text-xs font-semibold text-[#8892a4] uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, i) => (
                    <tr key={item._id} className={`border-b border-[#2a2d3e] hover:bg-[#2a2d3e]/50 transition-colors ${i === items.length - 1 ? "border-none" : ""}`}>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-[#2a2d3e] overflow-hidden flex-shrink-0">
                            {item.image
                              ? <img src={item.image} className="w-full h-full object-cover" />
                              : <div className="w-full h-full flex items-center justify-center text-sm">📦</div>
                            }
                          </div>
                          <span className="text-white font-medium text-sm line-clamp-1 max-w-40">{item.title}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-sm text-[#8892a4] capitalize">{item.category}</td>
                      <td className="px-5 py-4 text-sm text-[#8892a4] max-w-32 truncate">{item.foundAt}</td>
                      <td className="px-5 py-4 text-sm text-[#8892a4]">{item.postedBy?.username || item.postedBy?.name || "—"}</td>
                      <td className="px-5 py-4 text-sm text-[#8892a4]">{new Date(item.createdAt).toLocaleDateString()}</td>
                      <td className="px-5 py-4">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${statusColors[item.status] || statusColors.available}`}>
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
