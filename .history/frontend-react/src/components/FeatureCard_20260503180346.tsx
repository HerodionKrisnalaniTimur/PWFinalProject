import { motion, useInView } from "framer-motion";
import { useRef } from "react";

type Props = {
  number: string;
  title: string;
  desc: string;
  image: string;
};

export default function FeatureCard({
  number,
  title,
  desc,
  image,
}: Props) {
  const ref = useRef(null);

  const isInView = useInView(ref, {
    margin: "-30% 0px -30% 0px", // fokus tengah layar
  });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 60 }}
      animate={{
        opacity: isInView ? 1 : 0.4,
        scale: isInView ? 1 : 0.95,
      }}
      transition={{ duration: 0.5 }}
      className={`relative rounded-2xl border p-6 sm:p-8 grid grid-cols-1 md:grid-cols-[120px_1fr] gap-6 transition-all duration-300
        ${isInView
          ? "border-blue-500 shadow-2xl bg-white"
          : "border-zinc-200 bg-zinc-100/70"
        }
      `}
    >


      {/* Glow aktif */}
      {isInView && (
        <div className="absolute inset-0 rounded-2xl bg-blue-500/10 blur-xl" />
      )}

      {/* Number */}
      <div className="absolute top-3 left-3 bg-blue-600 text-white text-xs px-2 py-1 rounded-md font-semibold">
        {number}
      </div>

      {/* ICON */}
      <div className="flex items-center justify-center md:justify-start relative z-10">
        <motion.img
          src={image}
          alt={title}
          className="w-16 sm:w-20 md:w-24"
          animate={{
            scale: isInView ? 1.1 : 1,
            rotate: isInView ? 3 : 0,
          }}
          transition={{ duration: 0.4 }}
        />
      </div>

      {/* TEXT */}
      <div className="flex flex-col justify-center text-center md:text-left relative z-10">

        <motion.h2
          className="font-medium mb-3 text-lg sm:text-xl md:text-2xl lg:text-3xl"
          animate={{
            color: isInView ? "#000" : "#555",
          }}
        >
          {title}
        </motion.h2>

        <p className="text-zinc-600 text-sm sm:text-base">
          {desc}
        </p>

      </div>
    </motion.div>
  );
}