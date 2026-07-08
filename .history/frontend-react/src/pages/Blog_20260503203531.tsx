import { useRef, useState, useEffect, MouseEvent } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { motion, animate } from "framer-motion";

import img1 from "../assets/blog1.png";
import img2 from "../assets/blog2.png";
import img3 from "../assets/blog3.png";
import img4 from "../assets/blog4.png";

const initialBlogs = [
  {
    title: "Instant Payments",
    desc: "Cross-border settlements confirmed in under one second.",
    image: img1,
  },
  {
    title: "Compliant Finance",
    desc: "Digital ID, zk-KYC, and programmable AML.",
    image: img2,
  },
  {
    title: "Infrastructure Assets",
    desc: "Real-world assets accessible at internet scale.",
    image: img3,
  },
  {
    title: "Stablecoins",
    desc: "Stable assets backed by verified reserves.",
    image: img4,
  },
];

export default function Blog() {
  const scrollRef = useRef<HTMLDivElement>(null);

  const [displayBlogs, setDisplayBlogs] = useState(initialBlogs);
  const [activeIndex, setActiveIndex] = useState(0);

  const isAnimatingRef = useRef(false);

  // DRAG STATE
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeftPos, setScrollLeftPos] = useState(0);

  // AUTO CENTER FIRST
  useEffect(() => {
    setTimeout(() => scrollToIndex(0), 100);
  }, []);

  // DETECT ACTIVE CARD
  const handleScroll = () => {
    if (!scrollRef.current) return;
    if (isAnimatingRef.current || isDragging) return;

    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;

    // infinite illusion
    if (scrollLeft + clientWidth >= scrollWidth - 400) {
      setDisplayBlogs((prev) => [...prev, ...initialBlogs]);
    }

    const containerCenter = scrollLeft + clientWidth / 2;
    const cards = scrollRef.current.querySelectorAll(".blog-card");

    let closestIndex = activeIndex;
    let minDistance = Infinity;

    cards.forEach((card, index) => {
      const el = card as HTMLElement;
      const center = el.offsetLeft + el.offsetWidth / 2;
      const distance = Math.abs(containerCenter - center);

      if (distance < minDistance) {
        minDistance = distance;
        closestIndex = index;
      }
    });

    if (closestIndex !== activeIndex) {
      setActiveIndex(closestIndex);
    }
  };

  // SCROLL TO INDEX
  const scrollToIndex = (index: number) => {
    if (!scrollRef.current) return;

    const cards = scrollRef.current.querySelectorAll(".blog-card");
    if (!cards[index]) return;

    const container = scrollRef.current;
    const card = cards[index] as HTMLElement;

    const target =
      card.offsetLeft -
      container.clientWidth / 2 +
      card.offsetWidth / 2;

    isAnimatingRef.current = true;

    animate(container.scrollLeft, target, {
      type: "spring",
      stiffness: 90,
      damping: 18,
      onUpdate: (latest) => {
        if (scrollRef.current) scrollRef.current.scrollLeft = latest;
      },
      onComplete: () => {
        isAnimatingRef.current = false;
      },
    });
  };

  const scroll = (dir: "left" | "right") => {
    const newIndex =
      dir === "left"
        ? Math.max(0, activeIndex - 1)
        : activeIndex + 1;

    scrollToIndex(newIndex);
  };

  // ======================
  // DRAG (MOUSE)
  // ======================
  const handleMouseDown = (e: MouseEvent) => {
    if (isAnimatingRef.current) return;
    setIsDragging(true);
    if (!scrollRef.current) return;

    setStartX(e.pageX);
    setScrollLeftPos(scrollRef.current.scrollLeft);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || !scrollRef.current) return;

    const delta = e.pageX - startX;
    const walk = delta * 1.5;

    scrollRef.current.scrollLeft = scrollLeftPos - walk;
  };

  const stopDrag = () => {
    setIsDragging(false);

    // SNAP KE CARD TERDEKAT
    setTimeout(() => {
      scrollToIndex(activeIndex);
    }, 50);
  };

  // ======================
  // TOUCH (MOBILE)
  // ======================
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!scrollRef.current) return;

    setIsDragging(true);
    setStartX(e.touches[0].pageX);
    setScrollLeftPos(scrollRef.current.scrollLeft);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !scrollRef.current) return;

    const currentX = e.touches[0].pageX;
    const delta = currentX - startX;

    // lebih smooth
    const walk = delta * 1.6;

    scrollRef.current.scrollLeft = scrollLeftPos - walk;
  };

  return (
    <section className="relative py-16 mt-16 md:mt-24 sm:py-20 bg-gradient-to-b from-blue-700 via-blue-800 to-blue-900 overflow-hidden">

      {/* GRID BACKGROUND */}
      <div className="absolute inset-0 opacity-[0.05] pointer-events-none 
        bg-[linear-gradient(to_right,white_1px,transparent_1px),linear-gradient(to_bottom,white_1px,transparent_1px)] 
        bg-[size:40px_40px]" />

      {/* GLOW */}
      <div className="absolute top-[-120px] left-[-120px] w-[350px] h-[350px] bg-blue-400/30 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-120px] right-[-120px] w-[350px] h-[350px] bg-purple-500/30 blur-[120px] rounded-full" />

      {/* HEADER */}
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center mb-10 gap-4 px-4">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white text-center sm:text-left">
          Real Finance. Real Participation
        </h2>

        <div className="flex gap-3">
          <button
            onClick={() => scroll("left")}
            className="bg-white text-black p-2 sm:p-3 rounded-lg hover:bg-gray-200 transition"
          >
            <ArrowLeft size={18} />
          </button>

          <button
            onClick={() => scroll("right")}
            className="bg-white text-black p-2 sm:p-3 rounded-lg hover:bg-gray-200 transition"
          >
            <ArrowRight size={18} />
          </button>
        </div>
      </div>

      {/* SCROLL AREA */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={stopDrag}
        onMouseLeave={stopDrag}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={stopDrag}
        style={{ WebkitOverflowScrolling: "touch" }}
        className={`overflow-x-auto no-scrollbar cursor-grab snap-x snap-mandatory ${
          isDragging ? "cursor-grabbing" : ""
        }`}
      >
        <div className="flex gap-6 pb-10 px-[calc(50vw-140px)] sm:px-[calc(50vw-160px)] md:px-[calc(50vw-200px)]">

          {displayBlogs.map((item, index) => (
            <motion.div
              key={index}
              className="blog-card snap-center shrink-0 flex flex-col bg-white text-black rounded-2xl overflow-hidden relative
              w-[260px] sm:w-[300px] md:w-[380px]"
              animate={{
                scale: activeIndex === index ? 1 : 0.9,
                opacity: activeIndex === index ? 1 : 0.4,
              }}
              transition={{ type: "spring", stiffness: 120, damping: 20 }}
            >

              {/* GLOW ACTIVE */}
              {activeIndex === index && (
                <div className="absolute inset-0 bg-blue-500/10 blur-xl rounded-2xl pointer-events-none" />
              )}

              {/* IMAGE */}
              <div className="h-40 sm:h-48 md:h-52 bg-black">
                <img
                  src={item.image}
                  alt={item.title}
                  draggable="false"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* CONTENT */}
              <div className="p-4 sm:p-6 flex flex-col flex-grow">
                <h3 className="text-lg sm:text-xl font-bold mb-2">
                  {item.title}
                </h3>

                <p className="text-sm sm:text-base text-zinc-600 leading-relaxed">
                  {item.desc}
                </p>
              </div>

            </motion.div>
          ))}

        </div>
      </div>

      {/* HIDE SCROLLBAR */}
      <style>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>

    </section>
  );
}