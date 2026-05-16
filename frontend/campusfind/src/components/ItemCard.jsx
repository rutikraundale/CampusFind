import { useState } from "react";

export default function ItemCard({ item, onDelete, showDelete = false }) {
  const [deleting, setDeleting] = useState(false);

  const statusColors = {
    available: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    pending:   "bg-amber-500/15 text-amber-400 border-amber-500/30",
    claimed:   "bg-blue-500/15 text-blue-400 border-blue-500/30",
  };

  const categoryIcons = {
    electronics:  "💻",
    clothing:     "👕",
    accessories:  "👜",
    books:        "📚",
    documents:    "📄",
    other:        "📦",
  };

  const handleDelete = async () => {
    setDeleting(true);
    await onDelete(item._id);
    setDeleting(false);
  };

  return (
    <div className="group bg-[#1e2130] border border-[#2a2d3e] rounded-2xl overflow-hidden hover:border-[#6c63ff]/50 hover:shadow-[0_0_24px_rgba(108,99,255,0.1)] transition-all duration-300 animate-fade-in">
      {/* Image */}
      <div className="relative h-48 bg-[#2a2d3e] overflow-hidden">
        {item.image ? (
          <img
            src={item.image}
            alt={item.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl">
            {categoryIcons[item.category] || "📦"}
          </div>
        )}
        <div className={`absolute top-3 right-3 text-xs font-semibold px-2.5 py-1 rounded-full border ${statusColors[item.status] || statusColors.available}`}>
          {item.status || "available"}
        </div>
        <div className="absolute top-3 left-3 bg-[#0f1117]/70 backdrop-blur-sm text-xs text-[#8892a4] px-2 py-1 rounded-full">
          {categoryIcons[item.category]} {item.category || "other"}
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="text-white font-semibold text-base mb-1.5 line-clamp-1 group-hover:text-[#a78bfa] transition-colors">
          {item.title}
        </h3>
        <p className="text-[#8892a4] text-sm line-clamp-2 mb-4 leading-relaxed">
          {item.description}
        </p>

        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-xs text-[#8892a4]">
            <svg className="w-3.5 h-3.5 flex-shrink-0 text-[#6c63ff]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="truncate">{item.foundAt}</span>
          </div>
          {item.postedBy && (
            <div className="flex items-center gap-2 text-xs text-[#8892a4]">
              <svg className="w-3.5 h-3.5 flex-shrink-0 text-[#6c63ff]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span>{item.postedBy.username || "Unknown"}</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-xs text-[#8892a4]">
            <svg className="w-3.5 h-3.5 flex-shrink-0 text-[#6c63ff]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>{new Date(item.createdAt).toLocaleDateString()}</span>
          </div>
        </div>

        <div className="flex gap-2">
          <a
            href={`/items/${item._id}`}
            className="flex-1 text-center text-sm font-medium bg-[#2a2d3e] hover:bg-[#6c63ff] text-[#8892a4] hover:text-white py-2 rounded-lg transition-all duration-200"
          >
            View Details
          </a>
          {showDelete && (
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="px-3 py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-colors disabled:opacity-50"
            >
              {deleting ? (
                <div className="w-4 h-4 border border-red-400 border-t-transparent rounded-full animate-spin" />
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
