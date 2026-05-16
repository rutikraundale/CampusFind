export default function Toast({ message, type = "success", onClose }) {
  const colors = {
    success: "bg-emerald-500/15 border-emerald-500/30 text-emerald-400",
    error:   "bg-red-500/15 border-red-500/30 text-red-400",
    info:    "bg-[#6c63ff]/15 border-[#6c63ff]/30 text-[#a78bfa]",
  };
  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl border ${colors[type]} shadow-xl backdrop-blur-sm animate-fade-in max-w-sm`}>
      <span className="text-sm font-medium leading-snug">{message}</span>
      <button onClick={onClose} className="ml-auto opacity-60 hover:opacity-100 transition-opacity text-lg leading-none">×</button>
    </div>
  );
}
