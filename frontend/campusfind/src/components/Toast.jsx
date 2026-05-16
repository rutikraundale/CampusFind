export default function Toast({ message, type }) {
  if (!message) return null;

  const typeStyles = {
    success: "bg-[rgba(16,185,129,0.1)] border-[#10B981] text-[#34D399] shadow-[0_0_20px_rgba(16,185,129,0.2)]",
    error: "bg-[rgba(239,68,68,0.1)] border-[#EF4444] text-[#F87171] shadow-[0_0_20px_rgba(239,68,68,0.2)]",
    info: "bg-[rgba(59,130,246,0.1)] border-[#3B82F6] text-[#60A5FA] shadow-[0_0_20px_rgba(59,130,246,0.2)]",
  };

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-fade-in">
      <div className={`
        neo-info-card border border-white/10 backdrop-blur-md px-[24px] py-[14px] 
        flex items-center gap-[12px] font-[500] tracking-wide text-[14px]
        ${typeStyles[type] || typeStyles.info}
      `}>
        {type === 'success' && (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
        )}
        {type === 'error' && (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
        )}
        {type === 'info' && (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        )}
        <span className="text-[#F2F4F8]">{message}</span>
      </div>
    </div>
  );
}
