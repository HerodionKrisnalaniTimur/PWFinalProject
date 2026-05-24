import Sidebar from "../../components/SideBar";
import PageTransition from "../../components/PageTransition";
import CardConvert from "../../components/CardConvert";
import CardListConvert from "../../components/CardListConvert";
import { Wallet } from "lucide-react";
import { motion } from "framer-motion";

const ConversPage = () => {
  return (
    <PageTransition>
      <div className="min-h-screen bg-[#F8F9FA] flex text-[#1A1A1A] font-sans relative overflow-hidden">
        {/* Latar Belakang Animasi Efek Blur */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <div
            className="absolute inset-0 opacity-40"
            style={{
              backgroundImage: "radial-gradient(#D1D5DB 1px, transparent 1px)",
              backgroundSize: "30px 30px",
            }}
          />
          <motion.div
            animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
            transition={{ duration: 10, repeat: Infinity }}
            className="absolute top-20 left-10 w-72 h-72 bg-blue-300/20 rounded-full blur-3xl"
          />
          <motion.div
            animate={{ x: [0, -20, 0], y: [0, 30, 0] }}
            transition={{ duration: 8, repeat: Infinity }}
            className="absolute bottom-10 right-10 w-72 h-72 bg-cyan-300/20 rounded-full blur-3xl"
          />
        </div>

        {/* Sidebar Navigasi Kiri */}
        <Sidebar />

        {/* Area Konten Utama */}
        <main className="flex-1 flex flex-col p-4 sm:p-6 lg:p-8 z-10 relative overflow-y-auto custom-scrollbar">
          {/* Header Atas */}
          <header className="flex justify-between sm:justify-end gap-3 mb-8">
            <motion.button
              whileHover={{ scale: 1.05 }}
              className="bg-white/70 backdrop-blur-lg px-4 py-2.5 rounded-2xl flex items-center gap-2 font-bold text-sm border border-white shadow-md"
            >
              <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center text-[10px] text-white font-bold">
                Z
              </div>
              Zentrix Conversion Hub
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              className="bg-white/70 backdrop-blur-lg px-4 py-2.5 rounded-2xl flex items-center gap-2 font-bold text-sm border border-white shadow-md text-gray-400"
            >
              <Wallet size={16} />
              Wallet Disconnected
            </motion.button>
          </header>

          {/* ========================================================================= */}
          {/* PERUBAHAN UTAMA: MENGGUNAKAN items-center AGAR KONTEN RATU TENGAH         */}
          {/* ========================================================================= */}
          <div className="flex flex-col gap-8 w-full max-w-6xl mx-auto items-center pb-12">
            
            {/* 1. Card Converter Berada di Atas (Rata Tengah) */}
            <div className="w-full max-w-xl flex justify-center">
              <CardConvert />
            </div>

            {/* 2. Card List Tabel Berada Tepat di Bawahnya (Lebar Maksimal Proporsional) */}
            <div className="w-full">
              <CardListConvert />
            </div>

          </div>
        </main>
      </div>
    </PageTransition>
  );
};

export default ConversPage;