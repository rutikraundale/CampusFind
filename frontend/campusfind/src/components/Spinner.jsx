export default function Spinner() {
  return (
    <div className="flex items-center justify-center w-full h-full min-h-[200px]">
      <div className="relative w-16 h-16">
        {/* Outer glowing ring */}
        <div className="absolute inset-0 rounded-full border-2 border-[rgba(48,95,255,0.2)]"></div>
        {/* Spinning inner ring */}
        <div className="absolute inset-0 rounded-full border-t-2 border-l-2 border-[#4880FF] animate-spin shadow-[0_0_15px_rgba(48,95,255,0.5)]"></div>
        {/* Center dot */}
        <div className="absolute inset-0 m-auto w-2 h-2 bg-[#4880FF] rounded-full shadow-[0_0_10px_rgba(48,95,255,0.8)]"></div>
      </div>
    </div>
  );
}
