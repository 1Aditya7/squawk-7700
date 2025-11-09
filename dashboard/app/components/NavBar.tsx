"use client";
export default function NavBar() {
  return (
    <nav className="flex items-center justify-between bg-gray-800 px-6 py-2 border-b border-gray-700 text-sm">
      <div className="font-bold tracking-wide">LOGO</div>
      <div className="flex gap-6">
        <span>UTC CLOCK</span>
        <span>IST CLOCK</span>
      </div>
      <div className="flex gap-8">
        <button className="hover:text-cyan-400">LIVE DATA</button>
        <button className="hover:text-cyan-400">ABOUT</button>
      </div>
    </nav>
  );
}
