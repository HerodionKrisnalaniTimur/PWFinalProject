import { motion } from "framer-motion";
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
  const cardRef = useRef<HTMLDivElement>(null);

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 60, scale: 0.96 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.6, ease: "easeOut" }}

      whileHover={{ y: -8 }}
      className="group relative rounded-2xl border border-zinc-200/60 bg-white/70 backdrop-blur-xl p-6 sm:p-8 grid grid-cols-1 md:grid-cols-[120px_1fr] gap-6 transition-all duration-300 hover:shadow-2xl"
    >

      {/* Glow background */}
      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition duration-500 bg-gradient-to-r from-blue-500/10 via-transparent to-purple-500/10 blur-xl" />

      {/* Number */}
      <div className="absolute top-3 left-3 bg-blue-600 text-white text-xs px-2 py-1 rounded-md font-semibold shadow">
        {number}
      </div>

      {/* LEFT ICON */}
      <div className="flex items-center justify-center md:justify-start relative">
        
        {/* subtle pulse */}
        <motion.div
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ repeat: Infinity, duration: 3 }}
          className="absolute w-20 h-20 bg-blue-500/10 rounded-full blur-xl"
        />

        <motion.img
          src={image}
          alt={title}
          className="relative w-16 sm:w-20 md:w-24 object-contain"
          whileHover={{ rotate: 5, scale: 1.1 }}
          transition={{ type: "spring", stiffness: 200 }}
        />
      </div>

      {/* RIGHT TEXT */}
      <div className="flex flex-col justify-center text-center md:text-left relative z-10">

        <motion.h2
          className="font-medium leading-tight mb-3 text-lg sm:text-xl md:text-2xl lg:text-3xl"
          whileHover={{ letterSpacing: "0.02em" }}
        >
          {title}
        </motion.h2>

        <p className="text-zinc-600 leading-relaxed text-sm sm:text-base max-w-xl">
          {desc}
        </p>

      </div>
    </motion.div>
  );
}