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

const mod = (n: number, m: number) => ((n % m) + m) % m;

export default function BlogAppleCarousel() {
  const containerRef = useRef<HTMLDivElement>(null);

  const GAP = 24;
  const [cardW, setCardW] = useState(320);

  useEffect(() => {
    const update = () => {
      if (window.innerWidth < 640) setCardW(260);
      else if (window.innerWidth < 1024) setCardW(300);
      else setCardW(320);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const step = cardW + GAP;

  // infinite loop (triplicate)
  const extended = [...data, ...data, ...data];
  const baseIndex = data.length;

  const x = useMotionValue(0);
  const [index, setIndex] = useState(baseIndex);

  // set posisi awal
  useEffect(() => {
    if (!containerRef.current) return;

    const containerWidth = containerRef.current.offsetWidth;
    const centerOffset = containerWidth / 2 - cardW / 2;

    x.set(-(index * step) + centerOffset);
  }, [cardW]);

  const snapTo = (i: number) => {
    if (!containerRef.current) return;

    const containerWidth = containerRef.current.offsetWidth;
    const centerOffset = containerWidth / 2 - cardW / 2;

    const target = -(i * step) + centerOffset;

    animate(x, target, {
      type: "spring",
      stiffness: 140,
      damping: 22,
    }).then(() => {
      // infinite reset (tidak terlihat)
      if (i <= data.length - 1) {
        const ni = i + data.length;
        x.set(-(ni * step) + centerOffset);
        setIndex(ni);
      } else if (i >= data.length * 2) {
        const ni = i - data.length;
        x.set(-(ni * step) + centerOffset);
        setIndex(ni);
      } else {
        setIndex(i);
      }
    });
  };

  const next = () => snapTo(index + 1);
  const prev = () => snapTo(index - 1);

  const onDragEnd = () => {
    const currentX = x.get();
    const rawIndex = Math.round(Math.abs(currentX) / step);
    snapTo(rawIndex);
  };

  const distance = (i: number) => Math.abs(i - index);

  return (
    <section className="relative py-20 mt-20 bg-gradient-to-b from-blue-700 via-blue-800 to-blue-900 overflow-hidden">

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
          Real Finance. Real Participation
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
          dragConstraints={{ left: -99999, right: 99999 }}
          dragElastic={0.06}
          dragMomentum
          dragTransition={{ power: 0.2, timeConstant: 200 }}
          className="flex gap-6 cursor-grab active:cursor-grabbing will-change-transform"
        >
          {extended.map((item, i) => {
            const d = distance(i);

            const scale = d === 0 ? 1 : d === 1 ? 0.95 : 0.9;
            const opacity = d === 0 ? 1 : d === 1 ? 0.75 : 0.5;
            const blur = d === 0 ? 0 : d === 1 ? 1 : 2;

            return (
              <motion.div
                key={i}
                style={{
                  scale,
                  opacity,
                  filter: `blur(${blur}px)`,
                  zIndex: 100 - d,
                  boxShadow:
                    d === 0
                      ? "0 20px 60px rgba(0,0,0,0.25)"
                      : "0 10px 30px rgba(0,0,0,0.15)",
                }}
                className="w-[260px] sm:w-[300px] md:w-[320px] shrink-0 bg-white rounded-2xl overflow-hidden relative transition-all"
              >
                {/* ACTIVE GLOW */}
                {d === 0 && (
                  <div className="absolute inset-0 bg-blue-500/10 blur-xl rounded-2xl pointer-events-none" />
                )}

                {/* IMAGE */}
                <div className="h-48 bg-black">
                  <img
                    src={item.image}
                    alt={item.title}
                    draggable="false"
                    className="w-full h-full object-cover select-none"
                  />
                </div>

                {/* CONTENT */}
                <div className="p-6">
                  <h3 className="text-lg font-bold mb-2">
                    {item.title}
                  </h3>

                  <p className="text-sm text-zinc-600">
                    {item.desc}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}