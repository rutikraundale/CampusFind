export default function Footer() {
  return (
    <footer className="bg-[#1a1d27] border-t border-[#2a2d3e] mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#6c63ff] flex items-center justify-center text-white font-bold text-xs">CF</div>
            <span className="text-white font-semibold">CampusFind</span>
            <span className="text-[#8892a4] text-sm ml-2">© 2024</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-[#8892a4]">
            <a href="#" className="hover:text-white transition-colors">About</a>
            <a href="#" className="hover:text-white transition-colors">Contact</a>
            <a href="#" className="hover:text-white transition-colors">FAQ</a>
          </div>
          <div className="flex items-center gap-3">
            {["facebook", "twitter", "instagram"].map((social) => (
              <a key={social} href="#" className="w-8 h-8 rounded-lg bg-[#2a2d3e] hover:bg-[#6c63ff] flex items-center justify-center text-[#8892a4] hover:text-white transition-all duration-200">
                <span className="text-xs font-bold uppercase">{social[0]}</span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
