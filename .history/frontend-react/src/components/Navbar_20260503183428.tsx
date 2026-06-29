import { ChevronDown, Menu, X } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  // hide navbar on scroll
  const [hidden, setHidden] = useState(false);
  const lastScrollY = useRef(0);

  // blur effect
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;

      if (currentY > lastScrollY.current && currentY > 80) {
        setHidden(true);
      } else {
        setHidden(false);
      }

      setScrolled(currentY > 20);
      lastScrollY.current = currentY;
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      {/* NAVBAR */}
      <motion.header
        animate={{ y: hidden ? -120 : 0 }}
        transition={{ duration: 0.3 }}
        className="fixed top-0 left-0 w-full z-[999] px-4 sm:px-6 pt-4"
      >
        <nav
          className={`max-w-6xl mx-auto rounded-2xl px-4 sm:px-6 py-3 flex items-center justify-between transition-all duration-300
          ${
            scrolled
              ? "bg-white/70 backdrop-blur-xl shadow-lg border border-white/40"
              : "bg-white/90 shadow-md"
          }`}
        >
          {/* LOGO */}
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-600 rotate-45 rounded-sm"></div>
            <span className="font-bold text-lg">Zentrix</span>
          </div>

          {/* DESKTOP MENU */}
          <div className="hidden lg:flex items-center gap-6 text-sm text-zinc-700">
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

          {/* RIGHT */}
          <div className="flex items-center gap-3">
            <button className="hidden sm:block bg-blue-600 text-white px-4 py-2 rounded-xl text-sm hover:bg-blue-700 transition">
              Join Testnet
            </button>

            {/* MOBILE BUTTON */}
            <button
              onClick={() => setOpen(!open)}
              className="lg:hidden p-2 rounded-lg hover:bg-zinc-100"
            >
              {open ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </nav>
      </motion.header>

      {/* MOBILE MENU */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[998] flex flex-col justify-center items-center px-6 bg-white"
            initial={{ y: "-100%" }}
            animate={{ y: 0 }}
            exit={{ y: "-100%" }}
            transition={{ duration: 0.35 }}
          >
            {/* TOP BAR */}
            <div className="absolute top-4 left-4 right-4 flex justify-between items-center bg-white/80 backdrop-blur-xl px-4 py-3 rounded-2xl shadow-md">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-600 rotate-45 rounded-sm"></div>
                <span className="font-semibold">Zentrix</span>
              </div>

              <button onClick={() => setOpen(false)}>
                <X size={20} />
              </button>
            </div>

            {/* MENU ITEMS */}
            <div className="flex flex-col items-center gap-6 text-xl font-medium text-zinc-900">

              {["Explore", "Learn", "Build"].map((item) => (
                <button
                  key={item}
                  onClick={() => setOpen(false)}
                  className="hover:text-blue-600 transition"
                >
                  {item}
                </button>
              ))}

              {/* CTA */}
              <button
                onClick={() => setOpen(false)}
                className="mt-6 bg-blue-600 text-white px-6 py-3 rounded-xl"
              >
                Join Testnet
              </button>
            </div>

          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}