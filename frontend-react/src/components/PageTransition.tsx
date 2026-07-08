import { motion } from "framer-motion";
import { ReactNode } from "react";

interface Props {
  children: ReactNode;
}

const PageTransition = ({ children }: Props) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 25, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -25, scale: 0.98 }}
      transition={{
        duration: 0.45,
        ease: "easeInOut",
      }}
      className="w-full"
    >
      {children}
    </motion.div>
  );
};

export default PageTransition;