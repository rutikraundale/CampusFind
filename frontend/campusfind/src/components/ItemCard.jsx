import { Link } from "react-router-dom";
import { useState } from "react";

export default function ItemCard({ item, showDelete, onDelete }) {
  const [deleting, setDeleting] = useState(false);
  
  if (!item) return null;

  const handleDelete = async () => {
    setDeleting(true);
    await onDelete(item._id);
    setDeleting(false);
  };

  return (
    <div className="neo-item-card rounded-3xl p-6 flex flex-col gap-5 animate-fade-in group transition-transform duration-300 hover:-translate-y-1">
      {/* Image container - inset */}
      <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-[#0A0E1A] shadow-[inset_0_4px_20px_rgba(0,0,0,0.5)]">
        {item.image ? (
          <img 
            src={item.image} 
            alt={item.title} 
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 opacity-80 group-hover:opacity-100" 
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-[#090D18]">
            <svg className="w-12 h-12 text-[#2A344A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
        )}
        <div className="absolute top-4 right-4 px-4 py-2 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-xs font-semibold uppercase tracking-widest text-[#F2F4F8]">
          {item.status}
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col gap-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-[#F2F4F8] font-semibold text-xl tracking-tight line-clamp-1">{item.title}</h3>
        </div>
        
        <p className="text-[#AEB6C7] text-base line-clamp-2 leading-relaxed font-normal">{item.description}</p>
        
        <div className="flex items-center gap-4 text-sm text-[#6B758E] font-medium mt-3">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            {item.foundAt}
          </div>
          <div className="flex items-center gap-2 ml-auto">
             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
             {new Date(item.createdAt).toLocaleDateString()}
          </div>
        </div>
      </div>

      {/* Footer / Actions */}
      <div className="flex items-center gap-4 mt-5">
        <Link 
          to={`/items/${item._id}`} 
          className="flex-1 text-center py-3 text-base font-medium text-white neo-btn-browse hover:text-[#4880FF] transition-colors rounded-xl"
        >
          View Details
        </Link>
        {showDelete && (
          <button 
            onClick={handleDelete}
            disabled={deleting}
            className="w-12 h-12 flex items-center justify-center neo-social-btn text-red-400 hover:text-red-300 disabled:opacity-50 transition-colors rounded-xl"
          >
            {deleting ? (
              <div className="w-5 h-5 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
