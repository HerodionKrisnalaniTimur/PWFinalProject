import { ChevronDown, Menu, X } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  // 🔥 hide / show on scroll
  const [hidden, setHidden] = useState(false);
  const lastScrollY = useRef(0);

  // 🔥 blur & style on scroll
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;

      // detect scroll direction
      if (currentY > lastScrollY.current && currentY > 80) {
        setHidden(true); // scroll down → hide
      } else {
        setHidden(false); // scroll up → show
      }

      // blur effect trigger
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
        initial={{ y: 0 }}
        animate={{ y: hidden ? -120 : 0 }}
        transition={{ duration: 0.3 }}
        className="fixed top-0 left-0 w-full z-[999] px-4 sm:px-6 pt-4"
      >
        <nav
          className={`max-w-6xl mx-auto rounded-2xl px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between transition-all duration-300
          ${
            scrolled
              ? "bg-white/70 backdrop-blur-xl shadow-lg border border-white/40"
              : "bg-white/90 shadow-md"
          }`}
        >

          {/* LOGO */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-3 h-3 bg-blue-600 rotate-45 rounded-sm"></div>
            <span className="font-bold text-base sm:text-lg tracking-wide">
              Zentrix
            </span>
          </div>

          {/* DESKTOP MENU */}
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

          {/* RIGHT */}
          <div className="flex items-center gap-2 sm:gap-4">

            {/* CTA */}
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

      {/* 🔥 MOBILE FULLSCREEN MENU */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[998] bg-white flex flex-col justify-center items-center px-6"
            initial={{ y: "-100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "-100%", opacity: 0 }}
            transition={{ duration: 0.4 }}
          >

            <button
              onClick={() => setOpen(false)}
              className="absolute top-6 right-6"
            >
              <X size={28} />
            </button>

            <div className="flex flex-col gap-8 text-2xl font-medium">

              {["Explore", "Learn", "Build"].map((item, i) => (
                <motion.button
                  key={item}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  {item}
                </motion.button>
              ))}

              <button className="mt-6 bg-blue-600 text-white px-6 py-3 rounded-xl">
                Join Testnet
              </button>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}