impo
import SwapCard from "/components/SwapCard";
import SkeletonCard from "/components/SkeletonCard";
import PageTransition from "/components/PageTransition";

import { Wallet } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const SwapPage = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2200);

    return () => clearTimeout(timer);
  }, []);

  return (
    <PageTransition>
      <div className="min-h-screen bg-[#F8F9FA] flex text-[#1A1A1A] font-sans relative overflow-hidden">

        {/* Animated Background */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <div
            className="absolute inset-0 opacity-40"
            style={{
              backgroundImage:
                "radial-gradient(#D1D5DB 1px, transparent 1px)",
              backgroundSize: "30px 30px",
            }}
          />

          <motion.div
            animate={{
              x: [0, 40, 0],
              y: [0, -30, 0],
            }}
            transition={{
              duration: 12,
              repeat: Infinity,
            }}
            className="absolute top-20 left-10 w-72 h-72 bg-blue-300/30 rounded-full blur-3xl"
          />

          <motion.div
            animate={{
              x: [0, -30, 0],
              y: [0, 40, 0],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
            }}
            className="absolute bottom-10 right-10 w-72 h-72 bg-cyan-300/30 rounded-full blur-3xl"
          />
        </div>

        <Sidebar />

        <main className="flex-1 flex flex-col p-4 sm:p-6 lg:p-8 z-10 relative overflow-y-auto custom-scrollbar">

          {/* Header */}
          <header className="flex flex-col sm:flex-row justify-between sm:justify-end gap-3 mb-8">

            <motion.button
              whileHover={{ scale: 1.05 }}
              className="bg-white/70 backdrop-blur-lg px-4 py-3 rounded-2xl flex items-center gap-2 font-bold text-sm border border-white shadow-md"
            >
              <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center text-[10px] text-white font-bold">
                P
              </div>
              Pharos
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              className="bg-white/70 backdrop-blur-lg px-4 py-3 rounded-2xl flex items-center gap-2 font-bold text-sm border border-white shadow-md"
            >
              <Wallet size={16} />
              0xDE34...35ff
            </motion.button>
          </header>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex-1 flex flex-col items-center pt-2 sm:pt-6"
          >
            {loading ? <SkeletonCard /> : <SwapCard />}
          </motion.div>

          {/* History */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="w-full max-w-6xl mx-auto mt-8 sm:mt-12 bg-white/60 backdrop-blur-xl rounded-3xl p-5 sm:p-8 border border-white shadow-lg"
          >
            <h3 className="text-lg sm:text-xl font-bold text-gray-700 mb-4">
              Order History
            </h3>

            <div className="h-40 border-2 border-dashed border-gray-200 rounded-2xl flex items-center justify-center text-gray-400 font-medium bg-white/50">
              No transactions found
            </div>
          </motion.div>
        </main>
      </div>
    </PageTransition>
  );
};

export default SwapPage;