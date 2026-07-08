import { ChevronDown, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  // Lock scroll saat mobile menu terbuka
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "auto";

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [open]);

  // Function scroll ke section
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);

    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  // Menu Items
  const menuItems = [
    {
      name: "Feature",
      id: "feature",
    },
    {
      name: "Community",
      id: "blog",
    },
    {
      name: "Contact",
      id: "footer",
    },
  ];

  return (
    <header className="fixed top-0 left-0 w-full z-[999] px-4 sm:px-6 pt-4 sm:pt-5">

      {/* NAVBAR */}
      <nav className="max-w-6xl mx-auto bg-white/80 backdrop-blur-xl border border-white/60 shadow-lg rounded-2xl px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">

        {/* Logo */}
        <motion.div
          whileHover={{ scale: 1.03 }}
          className="flex items-center gap-2 sm:gap-3 cursor-pointer"
          onClick={() => scrollToSection("hero")}
        >
          <div className="w-3 h-3 bg-blue-600 rotate-45 rounded-sm"></div>

          <span className="font-bold text-base sm:text-lg tracking-wide">
            Zentrix
          </span>
        </motion.div>

        {/* Desktop Menu */}
        <div className="hidden lg:flex items-center gap-8 text-sm font-medium text-zinc-700">

          {menuItems.map((item) => (
            <motion.button
              key={item.id}
              whileHover={{
                y: -2,
              }}
              onClick={() => scrollToSection(item.id)}
              className="relative hover:text-black transition-all duration-300"
            >
              {item.name}

              <span className="absolute left-0 -bottom-1 w-0 h-[2px] bg-blue-600 transition-all duration-300 hover:w-full"></span>
            </motion.button>
          ))}
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-2 sm:gap-4">

          {/* Desktop CTA */}
          <motion.button
            whileHover={{
              scale: 1.05,
            }}
            whileTap={{
              scale: 0.96,
            }}
            onClick={() => navigate("/swap")}
            className="hidden sm:block bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-all shadow-md"
          >
            Join Testnet
          </motion.button>

          {/* Hamburger */}
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={() => setOpen(!open)}
            className="lg:hidden p-2 rounded-xl hover:bg-zinc-100 transition"
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </motion.button>
        </div>
      </nav>

      {/* FULLSCREEN MOBILE MENU */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-40 bg-white/120 backdrop-blur-2xl flex flex-col justify-center items-center px-6"
            initial={{
              y: "-100%",
              opacity: 0,
            }}
            animate={{
              y: "0%",
              opacity: 1,
            }}
            exit={{
              y: "-100%",
              opacity: 0,
            }}
            transition={{
              duration: 0.45,
              ease: "easeInOut",
            }}
          >

            {/* Background Blur Circle */}

            <div className="absolute bottom-10 right-10 w-72 h-72 bg-cyan-300/20 rounded-full blur-3xl"></div>

            {/* Close Button */}
            <button
              onClick={() => setOpen(false)}
              className="absolute top-6 right-6 p-2 rounded-xl hover:bg-white/50 transition"
            >
              <X size={28} />
            </button>

            {/* Mobile Menu Items */}
            <div className="flex flex-col items-center gap-8 text-3xl font-semibold text-zinc-900">

              {menuItems.map((item, i) => (
                <motion.button
                  key={item.id}
                  initial={{
                    opacity: 0,
                    y: 40,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  transition={{
                    delay: i * 0.1,
                  }}
                  whileHover={{
                    scale: 1.05,
                    letterSpacing: "0.08em",
                  }}
                  onClick={() => {
                    setOpen(false);

                    setTimeout(() => {
                      scrollToSection(item.id);
                    }, 300);
                  }}
                  className="transition-all duration-300"
                >
                  {item.name}
                </motion.button>
              ))}

              {/* CTA Button */}
              <motion.button
                initial={{
                  opacity: 0,
                  y: 40,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  delay: 0.35,
                }}
                whileHover={{
                  scale: 1.05,
                }}
                whileTap={{
                  scale: 0.95,
                }}
                onClick={() => {
                  setOpen(false);
                  navigate("/swap");
                }}
                className="mt-6 bg-blue-600 hover:bg-blue-700 text-white px-7 py-3 rounded-2xl text-base font-medium shadow-lg transition-all"
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