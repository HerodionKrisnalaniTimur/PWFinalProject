import { motion } from "framer-motion";

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
  return (
    <motion.div
      initial={{ opacity: 0, y: 60, scale: 0.96 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: false, amount: 0.3 }}
      transition={{ duration: 0.7 }}
      className="rounded-2xl sm:rounded-3xl border border-zinc-200 bg-white shadow-lg sm:shadow-xl p-6 sm:p-8 lg:p-10 grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 lg:gap-10"
    >

      {/* LEFT */}
      <div className="flex flex-col items-center md:items-start text-center md:text-left">
        
        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-md bg-blue-700 text-white flex items-center justify-center font-bold mb-4 sm:mb-6">
          {number}
        </div>

        <img
          src={image}
          alt={title}
          className="w-20 sm:w-28 md:w-32 h-auto object-contain"
        />
      </div>

      {/* RIGHT */}
      <div className="flex flex-col justify-center text-center md:text-left">
        
        <h2 className="font-light leading-tight mb-4 sm:mb-6 text-2xl sm:text-3xl md:text-4xl lg:text-5xl">
          {title}
        </h2>

        <p className="text-zinc-600 leading-relaxed text-sm sm:text-base md:text-lg">
          {desc}
        </p>

      </div>
    </motion.div>
  );
}