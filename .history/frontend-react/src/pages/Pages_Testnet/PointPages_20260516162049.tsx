import Sidebar from "../../components/SideBar";
import PageTransition from "../../components/PageTransition";

import {
  Wallet,
  Star,
  Trophy,
  Sparkles,
  TrendingUp,
} from "lucide-react";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const PointsPage = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1800);

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
              y: [0, -20, 0],
            }}
            transition={{
              duration: 12,
              repeat: Infinity,
            }}
            className="absolute top-0 left-0 w-72 h-72 bg-yellow-300/30 rounded-full blur-3xl"
          />

          <motion.div
            animate={{
              x: [0, -40, 0],
              y: [0, 40, 0],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
            }}
            className="absolute bottom-0 right-0 w-72 h-72 bg-blue-300/30 rounded-full blur-3xl"
          />
        </div>

        <Sidebar />

        <main className="flex-1 flex flex-col p-4 sm:p-6 lg:p-8 z-10 relative overflow-y-auto custom-scrollbar">

          {/* Header */}
          <header className="flex flex-col sm:flex-row justify-between sm:justify-end gap-3 mb-8">

            <motion.button
              whileHover={{ scale: 1.05 }}
              className="bg-white/70 backdrop-blur-xl px-4 py-3 rounded-2xl flex items-center gap-2 font-bold text-sm border border-white shadow-md"
            >
              <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center text-[10px] text-white font-bold">
                P
              </div>
              Pharos
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              className="bg-white/70 backdrop-blur-xl px-4 py-3 rounded-2xl flex items-center gap-2 font-bold text-sm border border-white shadow-md"
            >
              <Wallet size={16} />
              Connect MetaMask
            </motion.button>
          </header>

          {/* Main */}
          <div className="flex-1 flex flex-col items-center">

            {/* Cards */}
            <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-6">

              {/* Points Card */}
              <motion.div
                initial={{ opacity: 0, x: -40 }}
                animate={{ opacity: 1, x: 0 }}
                whileHover={{ y: -5 }}
                className="bg-gradient-to-br from-blue-600 via-cyan-500 to-blue-400 rounded-[32px] p-6 sm:p-8 shadow-2xl text-white relative overflow-hidden"
              >

                <motion.div
                  animate={{
                    rotate: 360,
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 20,
                    ease: "linear",
                  }}
                  className="absolute -top-10 -right-10 opacity-10"
                >
                  <Sparkles size={180} />
                </motion.div>

                <div className="relative z-10">

                  <div className="flex items-center gap-2 text-blue-100 font-medium mb-4">
                    <Star size={20} fill="currentColor" />
                    Total Points
                  </div>

                  {loading ? (
                    <div className="space-y-4 animate-pulse">
                      <div className="h-14 bg-white/20 rounded-2xl w-52"></div>
                      <div className="h-4 bg-white/20 rounded-xl w-40"></div>
                    </div>
                  ) : (
                    <>
                      <h2 className="text-5xl sm:text-6xl font-extrabold tracking-tight mb-3">
                        12,450
                      </h2>

                      <p className="text-sm text-blue-100/80">
                        Keep swapping to earn more rewards!
                      </p>
                    </>
                  )}
                </div>
              </motion.div>

              {/* Rank Card */}
              <motion.div
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                whileHover={{ y: -5 }}
                className="bg-white/80 backdrop-blur-2xl rounded-[32px] p-6 sm:p-8 border border-white shadow-xl flex flex-col justify-center items-center text-center"
              >

                <motion.div
                  animate={{
                    y: [0, -8, 0],
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 2.5,
                  }}
                >
                  <Trophy
                    size={64}
                    className="text-yellow-500 mb-5"
                  />
                </motion.div>

                <h3 className="text-3xl font-bold text-gray-700">
                  Gold Tier
                </h3>

                <p className="text-gray-400 mt-3">
                  Top 5% of all traders
                </p>

                <div className="mt-6 flex items-center gap-2 text-green-600 font-semibold">
                  <TrendingUp size={18} />
                  +240 this week
                </div>
              </motion.div>
            </div>

            {/* Activity */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="w-full max-w-5xl mt-8 bg-white/70 backdrop-blur-2xl rounded-[32px] p-5 sm:p-8 border border-white shadow-xl"
            >

              <h3 className="text-2xl font-bold text-gray-700 mb-6">
                Recent Point Activity
              </h3>

              {loading ? (
                <div className="space-y-4 animate-pulse">

                  <div className="h-20 bg-gray-200 rounded-2xl"></div>

                  <div className="h-20 bg-gray-200 rounded-2xl"></div>

                  <div className="h-20 bg-gray-200 rounded-2xl"></div>

                </div>
              ) : (
                <div className="h-52 border-2 border-dashed border-gray-200 rounded-3xl flex items-center justify-center text-gray-400 font-medium bg-[#F8F9FA]/50">
                  No recent activity
                </div>
              )}
            </motion.div>
          </div>
        </main>
      </div>
    </PageTransition>
  );
};

export default PointsPage;