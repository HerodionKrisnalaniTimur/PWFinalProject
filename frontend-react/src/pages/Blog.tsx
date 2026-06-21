import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, animate } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";

import img1 from "../assets/blog1.png";
import img2 from "../assets/blog2.png";
import img3 from "../assets/blog3.png";
import img4 from "../assets/blog4.png";

type Item = {
  title: string;
  desc: string;
  image: string;
};

const data: Item[] = [
  {
    title: "Agate International",
    desc: "salah satu studio game terbesar di Indonesia, Agate telah melahirkan puluhan judul sukses seperti Valthirian Arc yang populer di kancah internasional. Mereka adalah pionir dalam membangun ekosistem developer profesional di tanah air.",
    image: img1,
  },
  {
    title: "Toge Productions",
    desc: "Terkenal lewat fenomena global Coffee Talk, studio ini tidak hanya menciptakan game, tetapi juga menjadi inkubator bagi developer indie lokal lainnya. Mereka sukses membawa narasi budaya lokal ke telinga pemain di seluruh dunia.",
    image: img2,
  },
  {
    title: "Digital Happiness",
    desc: "Studio di balik seri DreadOut, game horor Indonesia pertama yang sukses besar di platform global. Mereka berhasil membuktikan bahwa mitologi dan hantu lokal bisa menjadi komoditas kreatif yang sangat diminati di pasar internasional.",
    image: img3,
  },
  {
    title: "Mojiken Studio",
    desc: "game peraih penghargaan A Space for the Unbound. Dikenal karena gaya visual pixel art yang memukau dan cerita yang menyentuh hati, Mojiken membawa identitas visual khas Indonesia Timur ke level yang lebih tinggi.",
    image: img4,
  },
];

export default function BlogAppleCarousel() {
  const containerRef = useRef<HTMLDivElement>(null);

  const GAP = 24;
  const [cardW, setCardW] = useState(320);
  const [centerOffset, setCenterOffset] = useState(0);

  useEffect(() => {
    const update = () => {
      let currentCardW = 320;
      if (window.innerWidth < 640) currentCardW = 260;
      else if (window.innerWidth < 1024) currentCardW = 300;
      setCardW(currentCardW);

      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        setCenterOffset(containerWidth / 2 - currentCardW / 2);
      }
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const step = cardW + GAP;

  // 7 copies = 28 cards — enough buffer for 12+ rapid clicks in either direction
  const COPIES = 7;
  const extended = Array.from({ length: COPIES }, () => data).flat();
  const baseIndex = data.length * Math.floor(COPIES / 2); // Start at index 12

  const x = useMotionValue(0);
  const [index, setIndex] = useState(baseIndex);
  const indexRef = useRef(baseIndex);
  // When true, CSS transitions are disabled to prevent flicker during invisible reset
  const [resetting, setResetting] = useState(false);

  // Update both ref and state
  const updateIndex = (newIndex: number) => {
    indexRef.current = newIndex;
    setIndex(newIndex);
  };

  // Set initial position (center)
  useEffect(() => {
    if (centerOffset === 0) return;
    x.set(-(indexRef.current * step) + centerOffset);
  }, [centerOffset, cardW]);

  // IDLE RESET: silently reset to safe range when carousel is at rest.
  // Uses 'resetting' state to disable CSS transitions during the jump,
  // preventing the flickering that plagued the original code.
  useEffect(() => {
    if (centerOffset === 0 || step === 0) return;

    const safeMin = data.length * Math.floor(COPIES / 2);
    const safeMax = safeMin + data.length - 1;
    let timeoutId: number;

    const unsubscribe = x.on("change", () => {
      clearTimeout(timeoutId);
      timeoutId = window.setTimeout(() => {
        const currentIdx = indexRef.current;
        if (currentIdx < safeMin || currentIdx > safeMax) {
          const resetIdx = ((currentIdx - safeMin) % data.length + data.length) % data.length + safeMin;

          // 1. Disable CSS transitions
          setResetting(true);
          // 2. Jump position and index (visually identical because same data)
          x.set(-(resetIdx * step) + centerOffset);
          updateIndex(resetIdx);
          // 3. Re-enable transitions after 2 paint frames (ensures DOM has settled)
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              setResetting(false);
            });
          });
        }
      }, 250);
    });

    return () => {
      unsubscribe();
      clearTimeout(timeoutId);
    };
  }, [centerOffset, step]);

  // SNAP FUNCTION — updates index (triggers CSS transition on cards) and slides container
  const snapTo = (i: number) => {
    if (!containerRef.current || centerOffset === 0) return;

    updateIndex(i);

    const targetX = -(i * step) + centerOffset;
    animate(x, targetX, {
      type: "tween",
      duration: 0.35,
      ease: [0.22, 1, 0.36, 1],
    });
  };

  const next = () => snapTo(indexRef.current + 1);
  const prev = () => snapTo(indexRef.current - 1);

  // DRAG SNAP
  const onDragEnd = () => {
    if (!containerRef.current || centerOffset === 0) return;

    const currentX = x.get();
    const projectedIndex = (centerOffset - currentX) / step;
    const targetIndex = Math.round(projectedIndex);

    snapTo(targetIndex);
  };

  // Distance from current center card — drives card styles
  const distance = (i: number) => Math.abs(i - index);

  return (
    <section className="relative py-20 bg-gradient-to-b from-blue-700 via-blue-800 to-blue-900 overflow-hidden "id="blog">

      {/* GRID */}
      <div className="absolute inset-0 opacity-[0.05] pointer-events-none 
        bg-[linear-gradient(to_right,white_1px,transparent_1px),linear-gradient(to_bottom,white_1px,transparent_1px)] 
        bg-[size:40px_40px]" />

      {/* GLOW */}
      <div className="absolute top-[-120px] left-[-120px] w-[350px] h-[350px] bg-blue-400/30 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-120px] right-[-120px] w-[350px] h-[350px] bg-purple-500/30 blur-[120px] rounded-full" />

      {/* HEADER */}
      <div className="max-w-6xl mx-auto flex justify-between items-center mb-12 px-4">
        <h2 className="text-2xl md:text-3xl font-bold text-white">
          Real Community. Real Participation
        </h2>

        <div className="flex gap-3">
          <button
            onClick={prev}
            className="bg-white text-black p-3 rounded-lg hover:bg-gray-200 transition"
          >
            <ArrowLeft size={18} />
          </button>

          <button
            onClick={next}
            className="bg-white text-black p-3 rounded-lg hover:bg-gray-200 transition"
          >
            <ArrowRight size={18} />
          </button>
        </div>
      </div>

      {/* CAROUSEL */}
      <div ref={containerRef} className="overflow-hidden px-4">
        <motion.div
          style={{ x }}
          drag="x"
          onDragEnd={onDragEnd}
          dragConstraints={{
            left: -(extended.length * step),
            right: extended.length * step,
          }}
          dragElastic={0.08}
          dragMomentum={false}
          dragTransition={{ bounceStiffness: 200, bounceDamping: 30 }}
          className="flex gap-6 cursor-grab active:cursor-grabbing will-change-transform"
        >
          {extended.map((item, i) => {
            const d = distance(i);

            const scale = d === 0 ? 1 : d === 1 ? 0.94 : 0.88;
            const opacity = d === 0 ? 1 : d === 1 ? 0.7 : 0.45;
            const blur = d === 0 ? 0 : d === 1 ? 1.2 : 2.5;

            return (
              <div
                key={i}
                style={{
                  transform: `scale(${scale})`,
                  opacity,
                  filter: `blur(${blur}px)`,
                  zIndex: 100 - d,
                  boxShadow:
                    d === 0
                      ? "0 25px 70px rgba(0,0,0,0.35)"
                      : "0 10px 30px rgba(0,0,0,0.2)",
                  // CSS transition for smooth style changes on click;
                  // disabled during invisible reset to prevent flicker
                  transition: resetting
                    ? "none"
                    : "transform 0.3s ease-out, opacity 0.3s ease-out, filter 0.3s ease-out, box-shadow 0.3s ease-out",
                }}
                className="w-[260px] sm:w-[300px] md:w-[320px] shrink-0 bg-white rounded-2xl overflow-hidden relative"
              >
                {/* Glow overlay on center card */}
                <div
                  style={{
                    opacity: d === 0 ? 1 : 0,
                    transition: resetting ? "none" : "opacity 0.3s ease-out",
                  }}
                  className="absolute inset-0 bg-blue-500/10 blur-xl rounded-2xl pointer-events-none"
                />

                <div className="h-48 bg-black">
                  <img
                    src={item.image}
                    alt={item.title}
                    draggable="false"
                    className="w-full h-full object-cover select-none"
                  />
                </div>

                <div className="p-6">
                  <h3 className="text-lg font-bold mb-2">
                    {item.title}
                  </h3>
                  <p className="text-sm text-zinc-600">
                    {item.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}