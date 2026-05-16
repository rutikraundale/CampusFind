export default function Spinner({ size = "md" }) {
  const sizes = { sm: "w-5 h-5", md: "w-8 h-8", lg: "w-12 h-12" };
  return (
    <div className="flex items-center justify-center py-8">
      <div className={`${sizes[size]} rounded-full border-2 border-[#6c63ff] border-t-transparent animate-spin`} />
    </div>
  );
}
