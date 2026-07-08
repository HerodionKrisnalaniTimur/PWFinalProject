import { useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { motion, useMotionValue, animate } from "framer-motion";

import img1 from "../assets/blog1.png";
import img2 from "../assets/blog2.png";
import img3 from "../assets/blog3.png";
import img4 from "../assets/blog4.png";

const blogs = [
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
  const x = useMotionValue(0);
  const [active, setActive] = useState(0);

  const CARD_WIDTH = 320; // adjust sesuai width card
  const GAP = 24;

  const moveTo = (index: number) => {
    const target = -(index * (CARD_WIDTH + GAP));
    setActive(index);

    animate(x, target, {
      type: "spring",
      stiffness: 120,
      damping: 20,
    });
  };

  const next = () => {
    if (active < blogs.length - 1) {
      moveTo(active + 1);
    }
  };

  const prev = () => {
    if (active > 0) {
      moveTo(active - 1);
    }
  };

  return (
    <section className="relative py-20 mt-20 bg-gradient-to-b from-blue-700 via-blue-800 to-blue-900 overflow-hidden">

      {/* GRID BACKGROUND */}
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
      <div className="overflow-hidden px-4">
        <motion.div
          style={{ x }}
          drag="x"
          dragConstraints={{
            left: -(blogs.length - 1) * (CARD_WIDTH + GAP),
            right: 0,
          }}
          dragElastic={0.08}
          dragMomentum
          dragTransition={{
            power: 0.2,
            timeConstant: 200,
          }}
          className="flex gap-6 cursor-grab active:cursor-grabbing"
        >
          {blogs.map((item, index) => (
            <motion.div
              key={index}
              className="w-[260px] sm:w-[300px] md:w-[320px] shrink-0 bg-white rounded-2xl overflow-hidden relative"
              animate={{
                scale: active === index ? 1 : 0.92,
                opacity: active === index ? 1 : 0.5,
              }}
              transition={{ type: "spring", stiffness: 120, damping: 20 }}
              whileHover={{ scale: 1.03 }}
            >
              {/* ACTIVE GLOW */}
              {active === index && (
                <div className="absolute inset-0 bg-blue-500/10 blur-xl rounded-2xl pointer-events-none" />
              )}

              {/* IMAGE */}
              <div className="h-48 bg-black">
                <img
                  src={item.image}
                  alt={item.title}
                  draggable="false"
                  className="w-full h-full object-cover"
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
          ))}
        </motion.div>
      </div>
    </section>
  );
}