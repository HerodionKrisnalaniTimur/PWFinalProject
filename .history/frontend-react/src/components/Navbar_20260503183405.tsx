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
      className="fixed inset-0 z-[998] flex flex-col justify-center items-center px-6
      bg-gradient-to-b from-white via-white to-zinc-100"
      initial={{ y: "-100%", opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: "-100%", opacity: 0 }}
      transition={{ duration: 0.5, ease: "easeInOut" }}
    >

      {/* TOP BAR */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-center bg-white/80 backdrop-blur-xl px-4 py-3 rounded-2xl shadow-md">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-blue-600 rotate-45 rounded-sm"></div>
          <span className="font-semibold">Zentrix</span>
        </div>

        <button onClick={() => setOpen(false)}>
          ✕
        </button>
      </div>

      {/* MENU CONTENT */}
      <div className="flex flex-col items-center gap-6 text-2xl font-medium text-zinc-900">

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-sm text-zinc-500 mb-2"
        >
          Navigate
        </motion.p>

        {["Explore", "Learn", "Build"].map((item, i) => (
          <motion.button
            key={item}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="hover:text-blue-600 transition-all duration-300 hover:tracking-widest"
          >
            {item}
          </motion.button>
        ))}

        {/* CTA */}
        <motion.button
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-6 bg-blue-600 text-white px-6 py-3 rounded-xl text-base shadow-lg hover:scale-105 transition"
        >
          Join Testnet
        </motion.button>

      </div>

      {/* BACKGROUND GLOW */}
      <div className="absolute top-[-100px] left-[-100px] w-[300px] h-[300px] bg-blue-400/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-100px] right-[-100px] w-[300px] h-[300px] bg-purple-400/20 blur-[120px] rounded-full pointer-events-none" />

    </motion.div>
  )}
</AnimatePresence>
    </>
  );
}