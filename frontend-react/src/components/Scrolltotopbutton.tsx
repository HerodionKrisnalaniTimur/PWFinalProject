import { useState, useEffect } from "react";
import { ArrowUp } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useLocation } from "react-router-dom";

// Jarak scroll (px) sebelum tombol mulai muncul
const SHOW_AFTER_PX = 300;

export default function ScrollToTopButton() {
  const [visible, setVisible] = useState(false);
  const location = useLocation();

  // Cuma tampil di landing page ("/")
  const isLandingPage = location.pathname === "/";

  useEffect(() => {
    if (!isLandingPage) return;

    const handleScroll = () => {
      setVisible(window.scrollY > SHOW_AFTER_PX);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // cek posisi awal (misal user reload di tengah halaman)

    return () => window.removeEventListener("scroll", handleScroll);
  }, [isLandingPage]);

  if (!isLandingPage) return null;

  // Smooth scroll manual pakai requestAnimationFrame, konsisten dengan Navbar
  const scrollToTop = () => {
    const startY = window.scrollY;
    const duration = 600;
    let startTime: number | null = null;

    const easeInOutQuad = (t: number) =>
      t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

    const step = (currentTime: number) => {
      if (startTime === null) startTime = currentTime;
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      window.scrollTo(0, startY - startY * easeInOutQuad(progress));

      if (progress < 1) {
        requestAnimationFrame(step);
      }
    };

    requestAnimationFrame(step);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          onClick={scrollToTop}
          aria-label="Scroll to top"
          initial={{ opacity: 0, y: 20, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.8 }}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          transition={{ duration: 0.25, ease: "easeInOut" }}
          className="fixed bottom-6 right-6 z-[999] w-11 h-11 sm:w-12 sm:h-12 flex items-center justify-center rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
        >
          <ArrowUp size={20} />
        </motion.button>
      )}
    </AnimatePresence>
  );
}