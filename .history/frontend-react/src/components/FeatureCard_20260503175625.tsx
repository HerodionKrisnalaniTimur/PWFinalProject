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
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="relative rounded-2xl border border-zinc-300 bg-zinc-100/80 p-5 sm:p-6 md:p-8 grid grid-cols-1 md:grid-cols-[120px_1fr] gap-5 sm:gap-6"
    >

      {/* NUMBER */}
      <div className="absolute top-3 left-3 bg-blue-600 text-white text-xs px-2 py-1 rounded-md font-semibold">
        {number}
      </div>

      {/* LEFT (ICON) */}
      <div className="flex items-center justify-center md:justify-start">
        <img
          src={image}
          alt={title}
          className="w-16 sm:w-20 md:w-24 object-contain"
        />
      </div>

      {/* RIGHT (TEXT) */}
      <div className="flex flex-col justify-center text-center md:text-left">

        <h2 className="font-medium leading-tight mb-3 text-lg sm:text-xl md:text-2xl lg:text-3xl">
          {title}
        </h2>

        <p className="text-zinc-600 leading-relaxed text-sm sm:text-base max-w-xl">
          {desc}
        </p>

      </div>

    </motion.div>
  );
}