import { ChevronDown, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Lock scroll saat mobile menu terbuka
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "auto";

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [open]);

  // Custom smooth scroll pakai requestAnimationFrame
  // (lebih reliable daripada scrollIntoView bawaan browser, terutama di Safari/iOS
  // atau saat elemen baru mount setelah navigate)
  const smoothScrollTo = (targetY: number, duration = 700) => {
    const startY = window.scrollY;
    const diff = targetY - startY;
    let startTime: number | null = null;

    const easeInOutQuad = (t: number) =>
      t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

    const step = (currentTime: number) => {
      if (startTime === null) startTime = currentTime;
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      window.scrollTo(0, startY + diff * easeInOutQuad(progress));

      if (progress < 1) {
        requestAnimationFrame(step);
      }
    };

    requestAnimationFrame(step);
  };

  // Tinggi kira-kira navbar fixed + jarak aman, biar section gak ketutup navbar
  const NAVBAR_OFFSET = 100;

  // Function scroll ke section (dengan retry kalau elemen belum ke-render)
  const scrollToSection = (id: string, retries = 5) => {
    const element = document.getElementById(id);

    if (element) {
      const targetY =
        window.scrollY + element.getBoundingClientRect().top - NAVBAR_OFFSET;
      smoothScrollTo(targetY);
    } else if (retries > 0) {
      setTimeout(() => scrollToSection(id, retries - 1), 100);
    }
  };

  // Klik logo: kalau sudah di landing page, scroll ke hero.
  // Kalau lagi di halaman lain, navigate dulu ke "/" baru scroll ke hero.
  const handleLogoClick = () => {
    if (location.pathname === "/") {
      scrollToSection("hero");
    } else {
      navigate("/");
      setTimeout(() => {
        scrollToSection("hero");
      }, 300);
    }
  };

  // Klik menu (Feature, Community, Contact, dll):
  // kalau sudah di landing page, langsung scroll ke section.
  // Kalau lagi di halaman lain, navigate dulu ke "/" baru scroll setelah halaman siap.
  const handleMenuClick = (id: string) => {
    if (location.pathname === "/") {
      scrollToSection(id);
    } else {
      navigate("/");
      setTimeout(() => {
        scrollToSection(id);
      }, 400);
    }
  };

  // Kalau lagi di halaman /news atau /admin (dan sub-route-nya), menu Feature/Community/Contact gak perlu ditampilkan
  const isNewsPage =
    location.pathname === "/news" || location.pathname.startsWith("/admin");

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
    {
  name: "Contact"
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
          onClick={handleLogoClick}
        >
          <div className="w-3 h-3 bg-blue-600 rotate-45 rounded-sm"></div>

          <span className="font-bold text-base sm:text-lg tracking-wide">
            Zentrix
          </span>
        </motion.div>

        {/* Desktop Menu */}
        {!isNewsPage && (
        <div className="hidden lg:flex items-center gap-8 text-sm font-medium text-zinc-700">

          {menuItems.map((item) => (
            <motion.button
              key={item.id}
              whileHover={{
                y: -2,
              }}
              onClick={() => handleMenuClick(item.id)}
              className="relative hover:text-black transition-all duration-300"
            >
              {item.name}

              <span className="absolute left-0 -bottom-1 w-0 h-[2px] bg-blue-600 transition-all duration-300 hover:w-full"></span>
            </motion.button>
          ))}
        </div>
        )}

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
            className="fixed inset-0 z-40 bg-white/100 backdrop-blur-2xl flex flex-col justify-center items-center px-6"
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

            {/* Close Button */}
            <button
              onClick={() => setOpen(false)}
              className="absolute top-6 right-6 p-2 rounded-xl hover:bg-white/50 transition"
            >
              <X size={28} />
            </button>

            {/* Mobile Menu Items */}
            <div className="flex flex-col items-center gap-8 text-3xl font-semibold text-zinc-900">

              {!isNewsPage && menuItems.map((item, i) => (
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

                    if (location.pathname === "/") {
                      setTimeout(() => {
                        scrollToSection(item.id);
                      }, 300);
                    } else {
                      navigate("/");
                      setTimeout(() => {
                        scrollToSection(item.id);
                      }, 500);
                    }
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