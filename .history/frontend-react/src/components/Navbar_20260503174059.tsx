import { ChevronDown, Menu, X } from "lucide-react";
import { useState } from "react";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 w-full z-50 px-4 sm:px-6 pt-4 sm:pt-5">
      
      <nav className="max-w-6xl mx-auto bg-white/80 backdrop-blur-md border border-white/60 shadow-md rounded-2xl px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">

        {/* Logo */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-3 h-3 bg-blue-600 rotate-45 rounded-sm"></div>
          <span className="font-bold text-base sm:text-lg tracking-wide">
            Zentrix
          </span>
        </div>

        {/* Desktop Menu */}
        <div className="hidden lg:flex items-center gap-6 xl:gap-8 text-sm font-medium text-zinc-700">
          <button className="flex items-center gap-1 hover:text-black transition">
            Explore <ChevronDown size={16} />
          </button>

          <button className="flex items-center gap-1 hover:text-black transition">
            Learn <ChevronDown size={16} />
          </button>

          <button className="flex items-center gap-1 hover:text-black transition">
            Build <ChevronDown size={16} />
          </button>
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-2 sm:gap-4">

          {/* CTA (hide on very small) */}
          <button className="hidden sm:block bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition">
            Join Testnet
          </button>

          {/* Hamburger */}
          <button
            onClick={() => setOpen(!open)}
            className="lg:hidden p-2 rounded-lg hover:bg-zinc-100 transition"
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>

        </div>

      </nav>

      {/* Mobile Menu */}
      {open && (
        <div className="lg:hidden mt-3 mx-auto max-w-6xl px-4 sm:px-6">
          <div className="bg-white/90 backdrop-blur-md border border-white/60 shadow-md rounded-2xl p-6 flex flex-col gap-5 text-sm font-medium text-zinc-700">

            <button className="flex items-center justify-between">
              Explore <ChevronDown size={16} />
            </button>

            <button className="flex items-center justify-between">
              Learn <ChevronDown size={16} />
            </button>

            <button className="flex items-center justify-between">
              Build <ChevronDown size={16} />
            </button>

            <button className="mt-2 bg-blue-600 text-white py-2 rounded-xl">
              Join Testnet
            </button>

          </div>
        </div>
      )}
      
    </header>
  );
}