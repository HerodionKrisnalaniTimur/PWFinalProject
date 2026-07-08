import { ChevronDown, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  // lock scroll saat menu kebuka
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "auto";
  }, [open]);

  return (
    <header className="fixed top-0 left-0 w-full z-[999] px-4 sm:px-6 pt-4 sm:pt-5">

      {/* NAVBAR */}
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
            Build
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

      {/* 🔥 FULLSCREEN MENU */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-40 bg-white/70 backdrop-blur-xl flex flex-col justify-center items-center px-6"
            initial={{ y: "-100%", opacity: 0 }}
            animate={{ y: "0%", opacity: 1 }}
            exit={{ y: "-100%", opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
          >

            {/* Close button */}
            <button
              onClick={() => setOpen(false)}
              className="absolute top-6 right-6"
            >
              <X size={28} />
            </button>

            {/* Menu Items */}
            <div className="flex flex-col items-center gap-8 text-2xl font-medium text-zinc-900">

              {["Explore", "Learn", "Build"].map((item, i) => (
                <motion.button
                  key={item}
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="hover:tracking-widest transition-all duration-300"
                >
                  {item}
                </motion.button>
              ))}

              {/* CTA */}
              <motion.button
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mt-6 bg-blue-600 text-white px-6 py-3 rounded-xl text-base"
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