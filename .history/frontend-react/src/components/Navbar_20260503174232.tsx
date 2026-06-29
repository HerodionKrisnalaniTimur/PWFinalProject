import { ChevronDown, Menu, X } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

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
        <div className="hidden lg:flex items-center gap-6 text-sm font-medium text-zinc-700">
          <button className="flex items-center gap-1 hover:text-black">
            Explore <ChevronDown size={16} />
          </button>
          <button className="flex items-center gap-1 hover:text-black">
            Learn <ChevronDown size={16} />
          </button>
          <button className="flex items-center gap-1 hover:text-black">
            Build <ChevronDown size={16} />
          </button>
        </div>

        {/* Right */}
        <div className="flex items-center gap-2 sm:gap-4">

          <button className="hidden sm:block bg-blue-600 text-white px-4 py-2 rounded-xl text-sm">
            Join Testnet
          </button>

          {/* Hamburger */}
          <button
            onClick={() => setOpen(!open)}
            className="lg:hidden p-2 rounded-lg hover:bg-zinc-100"
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>

        </div>
      </nav>

      {/* 🔥 Animated Mobile Menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="lg:hidden mt-3 mx-auto max-w-6xl px-4 sm:px-6"
          >
            <div className="bg-white/90 backdrop-blur-md border border-white/60 shadow-md rounded-2xl p-6 flex flex-col gap-5 text-sm font-medium text-zinc-700">

              {/* Menu Items (animated one by one) */}
              {["Explore", "Learn", "Build"].map((item, i) => (
                <motion.button
                  key={item}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-center justify-between"
                >
                  {item}
                  <ChevronDown size={16} />
                </motion.button>
              ))}

              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mt-2 bg-blue-600 text-white py-2 rounded-xl"
              >
                Join Testnet
              </motion.button>

            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </header>
  );
}