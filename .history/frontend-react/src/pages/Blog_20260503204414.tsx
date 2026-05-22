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
  { title: "Instant Payments", desc: "Cross-border settlements under one second.", image: img1 },
  { title: "Compliant Finance", desc: "Digital ID, zk-KYC, programmable AML.", image: img2 },
  { title: "Infrastructure Assets", desc: "Real-world assets at internet scale.", image: img3 },
  { title: "Stablecoins", desc: "Backed by verified reserves.", image: img4 },
];

// helper modulo (biar index selalu valid)
const mod = (n: number, m: number) => ((n % m) + m) % m;

export default function BlogAppleCarousel() {
  // --- layout config ---
  const GAP = 24;
  const BASE_W = 320; // desktop default
  const [cardW, setCardW] = useState(BASE_W);

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

  // --- infinite loop via triple array (no visible duplicate) ---
  const extended = [...data, ...data, ...data];
  const baseIndex = data.length; // mulai dari tengah

  // --- motion state ---
  const x = useMotionValue(0);
  const [index, setIndex] = useState(baseIndex);

  // set posisi awal (center di item tengah)
  useEffect(() => {
    x.set(-index * step);
  }, [index, step, x]);

  // snap ke index tertentu (auto-center)
  const snapTo = (i: number) => {
    const target = -i * step;
    animate(x, target, {
      type: "spring",
      stiffness: 140,
      damping: 22,
    }).then(() => {
      // reset ke middle band supaya “infinite” tanpa terlihat lompat
      if (i <= data.length - 1) {
        const ni = i + data.length;
        x.set(-ni * step);
        setIndex(ni);
      } else if (i >= data.length * 2) {
        const ni = i - data.length;
        x.set(-ni * step);
        setIndex(ni);
      } else {
        setIndex(i);
      }
    });
  };

  const next = () => snapTo(index + 1);
  const prev = () => snapTo(index - 1);

  // setelah drag selesai → cari index terdekat (auto center)
  const onDragEnd = (_: any, info: any) => {
    const currentX = x.get();
    const raw = Math.round(Math.abs(currentX) / step);
    snapTo(raw);
  };

  // hitung jarak dari center untuk efek depth + blur
  const distanceFromCenter = (i: number) => Math.abs(i - index);

  return (
    <section className="relative py-20 mt-20 bg-gradient-to-b from-blue-700 via-blue-800 to-blue-900 overflow-hidden">
      {/* grid subtle */}
      <div className="absolute inset-0 opacity-[0.05] pointer-events-none 
        bg-[linear-gradient(to_right,white_1px,transparent_1px),linear-gradient(to_bottom,white_1px,transparent_1px)] 
        bg-[size:40px_40px]" />

      {/* glow */}
      <div className="absolute top-[-120px] left-[-120px] w-[350px] h-[350px] bg-blue-400/30 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-120px] right-[-120px] w-[350px] h-[350px] bg-purple-500/30 blur-[120px] rounded-full" />

      {/* header */}
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

      {/* carousel */}
      <div className="overflow-hidden px-4">
        <motion.div
          style={{ x }}
          drag="x"
          onDragEnd={onDragEnd}
          dragConstraints={{ left: -99999, right: 99999 }} // biar bebas, nanti disnap
          dragElastic={0.06}
          dragMomentum
          dragTransition={{ power: 0.2, timeConstant: 200 }}
          className="flex gap-6 cursor-grab active:cursor-grabbing will-change-transform"
        >
          {extended.map((item, i) => {
            const d = distanceFromCenter(i);

            // scale depth (3D feel)
            const scale = d === 0 ? 1 : d === 1 ? 0.92 : 0.86;

            // opacity falloff
            const opacity = d === 0 ? 1 : d === 1 ? 0.65 : 0.35;

            // blur sisi
            const blur = d === 0 ? 0 : d === 1 ? 2 : 4;

            // z-index biar yang tengah di atas
            const z = 100 - d;

            return (
              <motion.div
                key={i}
                style={{
                  scale,
                  opacity,
                  filter: `blur(${blur}px)`,
                  zIndex: z,
                }}
                className="w-[260px] sm:w-[300px] md:w-[320px] shrink-0 bg-white rounded-2xl overflow-hidden relative"
                transition={{ type: "spring", stiffness: 140, damping: 22 }}
              >
                {/* active glow */}
                {d === 0 && (
                  <div className="absolute inset-0 bg-blue-500/10 blur-xl rounded-2xl pointer-events-none" />
                )}

                {/* image */}
                <div className="h-48 bg-black">
                  <img
                    src={item.image}
                    alt={item.title}
                    draggable="false"
                    className="w-full h-full object-cover select-none"
                  />
                </div>

                {/* content */}
                <div className="p-6">
                  <h3 className="text-lg font-bold mb-2">{item.title}</h3>
                  <p className="text-sm text-zinc-600">{item.desc}</p>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}