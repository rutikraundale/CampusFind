import { useEffect, useState, useCallback } from "react";
import { itemsAPI } from "../api/services";
import ItemCard from "../components/ItemCard";
import Spinner from "../components/Spinner";

const CATEGORIES = ["all", "electronics", "clothing", "accessories", "books", "documents", "other"];
const STATUSES = ["all", "available", "pending", "claimed"];

export default function BrowseItemsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState("all");

  const fetchItems = useCallback(() => {
    setLoading(true);
    const params = {};
    if (search) params.search = search;
    if (category !== "all") params.category = category;
    if (status !== "all") params.status = status;
    itemsAPI.getAll(params)
      .then(({ data }) => setItems(data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [search, category, status]);

  useEffect(() => {
    const delay = setTimeout(fetchItems, 400);
    return () => clearTimeout(delay);
  }, [fetchItems]);

  return (
    <div className="min-h-screen bg-[#0f1117] pt-20 pb-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-3xl font-bold text-white mb-2">Browse Lost & Found</h1>
          <p className="text-[#8892a4]">Search through all reported items on campus</p>
        </div>

        {/* Filters */}
        <div className="bg-[#1e2130] border border-[#2a2d3e] rounded-2xl p-5 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8892a4]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by title, description, or location..."
                className="w-full bg-[#0f1117] border border-[#2a2d3e] rounded-xl pl-10 pr-4 py-2.5 text-white text-sm placeholder-[#4a5568] focus:outline-none focus:border-[#6c63ff] focus:shadow-[0_0_0_3px_rgba(108,99,255,0.15)] transition-all"
              />
            </div>
            {/* Category */}
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="bg-[#0f1117] border border-[#2a2d3e] rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#6c63ff] transition-all min-w-40"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c === "all" ? "All Categories" : c.charAt(0).toUpperCase() + c.slice(1)}</option>
              ))}
            </select>
            {/* Status */}
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="bg-[#0f1117] border border-[#2a2d3e] rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#6c63ff] transition-all min-w-36"
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>{s === "all" ? "All Status" : s.charAt(0).toUpperCase() + s.slice(1)}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Results count */}
        {!loading && (
          <p className="text-[#8892a4] text-sm mb-4">
            {items.length} {items.length === 1 ? "item" : "items"} found
          </p>
        )}

        {/* Grid */}
        {loading ? (
          <Spinner size="lg" />
        ) : items.length === 0 ? (
          <div className="bg-[#1e2130] border border-[#2a2d3e] rounded-2xl p-16 text-center">
            <div className="text-5xl mb-4">🔍</div>
            <h3 className="text-white font-semibold text-lg mb-2">No items found</h3>
            <p className="text-[#8892a4] text-sm">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {items.map((item) => (
              <ItemCard key={item._id} item={item} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
