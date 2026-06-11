import Sidebar from "../../components/Sidebar";
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

declare global {
  interface Window {
    ethereum?: any;
  }
}

const PointsPage = () => {
  const [loading, setLoading] = useState(true);
  const [walletAddress, setWalletAddress] = useState<string>("");

  // Simulasi memuat data aktivitas poin
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, [walletAddress]);

  // Cek koneksi akun otomatis saat pertama kali dApp dibuka
  useEffect(() => {
    const checkConnection = async () => {
      if (typeof window !== "undefined" && window.ethereum) {
        try {
          const accounts: string[] = await window.ethereum.request({ 
            method: "eth_accounts" 
          });
          if (accounts.length > 0) {
            setWalletAddress(accounts[0]);
          }
        } catch (error) {
          console.error("Gagal mengecek koneksi:", error);
        }
      }
    };
    checkConnection();
  }, []);

  // Listener otomatis mendeteksi pergantian akun MetaMask
  useEffect(() => {
    if (typeof window !== "undefined" && window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length > 0) {
          setWalletAddress(accounts[0]);
        } else {
          setWalletAddress("");
        }
      };

      window.ethereum.on("accountsChanged", handleAccountsChanged);
      return () => {
        window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
      };
    }
  }, []);

  // Fungsi interaktif tombol hubungkan / ganti wallet
  const handleWalletAction = async () => {
    if (typeof window !== "undefined" && window.ethereum) {
      try {
        await window.ethereum.request({
          method: "wallet_requestPermissions",
          params: [{ eth_accounts: {} }],
        });
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        setWalletAddress(accounts[0]);
      } catch (error: any) {
        console.error("Gagal mengonfigurasi wallet:", error);
      }
    } else {
      alert("Silakan install ekstensi MetaMask terlebih dahulu!");
    }
  };

  const formatAddress = (address: string): string => {
    if (!address) return "";
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-[#F8F9FA] flex text-[#1A1A1A] font-sans relative overflow-hidden">
        
        {/* Latar Belakang */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <div className="absolute inset-0 opacity-40" style={{ backgroundImage: "radial-gradient(#D1D5DB 1px, transparent 1px)", backgroundSize: "30px 30px" }} />
          <motion.div animate={{ x: [0, 40, 0], y: [0, -20, 0] }} transition={{ duration: 12, repeat: Infinity }} className="absolute top-10 left-10 w-72 h-72 bg-yellow-300/20 rounded-full blur-3xl" />
          <motion.div animate={{ x: [0, -30, 0], y: [0, 30, 0] }} transition={{ duration: 10, repeat: Infinity }} className="absolute bottom-0 right-0 w-72 h-72 bg-amber-300/20 rounded-full blur-3xl" />
        </div>

        <Sidebar />

        <main className="flex-1 flex flex-col p-4 sm:p-6 lg:p-8 z-10 relative overflow-y-auto">
          
          {/* Header Bar */}
          <header className="flex flex-col sm:flex-row justify-between sm:justify-end gap-3 mb-8">
            <motion.button whileHover={{ scale: 1.05 }} className="bg-white/70 backdrop-blur-xl px-4 py-3 rounded-2xl flex items-center gap-2 font-bold text-sm border border-white shadow-md">
              <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center text-[10px] text-white font-bold">Z</div>
              Zentrix Loyalty
            </motion.button>

            <motion.button
              onClick={handleWalletAction}
              whileHover={{ scale: 1.05 }}
              className={`px-4 py-3 rounded-2xl flex items-center gap-2 font-bold text-sm border shadow-md cursor-pointer transition-all ${
                walletAddress ? "bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200 text-emerald-700 hover:from-emerald-100 hover:to-teal-100" : "bg-white/70 border-white text-[#1A1A1A] hover:bg-white"
              }`}
            >
              <Wallet size={16} className={walletAddress ? "text-emerald-600" : ""} />
              {walletAddress ? `${formatAddress(walletAddress)}` : "Connect Wallet"}
            </motion.button>
          </header>

          {/* Grid Konten Point */}
          <div className="w-full max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Card Kiri: Total Points */}
            <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} className="bg-white/70 backdrop-blur-2xl rounded-[32px] p-6 sm:p-8 border border-white shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold flex items-center gap-2 text-gray-800"><Star className="text-yellow-500 fill-yellow-500" />Your Points</h2>
                  <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">Tier 1 Trader</span>
                </div>
                <p className="text-gray-400 text-sm font-medium">Accumulated rewards balance</p>
                <h1 className="text-5xl font-black text-gray-900 mt-2 tracking-tight">{walletAddress ? "1,250" : "0"} <span className="text-xl font-bold text-gray-400">PTS</span></h1>
              </div>
              <div className="mt-8 pt-4 border-t border-gray-100 text-xs text-gray-400 flex items-center gap-1.5"><Sparkles size={14} className="text-yellow-500" /> Points are updated every block confirmation.</div>
            </motion.div>

            {/* Card Kanan: Global Rank */}
            <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} className="bg-white/70 backdrop-blur-2xl rounded-[32px] p-6 sm:p-8 border border-white shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold flex items-center gap-2 text-gray-800"><Trophy className="text-amber-500" />Global Rank</h2>
                  <span className="text-xs font-semibold text-purple-600 bg-purple-50 px-3 py-1 rounded-full border border-purple-100">Top 5%</span>
                </div>
                <p className="text-gray-400 text-sm font-medium">Your current standing position</p>
                <h1 className="text-5xl font-black text-gray-900 mt-2 tracking-tight">#{walletAddress ? "412" : "--"} <span className="text-xl font-bold text-gray-400">of all traders</span></h1>
              </div>
              <div className="mt-8 pt-4 border-t border-gray-100 text-xs text-green-600 font-semibold flex items-center gap-1.5"><TrendingUp size={16} /> +240 rank positions gained this week.</div>
            </motion.div>
          </div>

          {/* Card Bawah: Recent Activity */}
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-5xl mx-auto mt-6 bg-white/70 backdrop-blur-2xl rounded-[32px] p-5 sm:p-8 border border-white shadow-xl">
            <h3 className="text-xl font-bold text-gray-800 mb-6">Recent Point Activity</h3>
            {loading ? (
              <div className="space-y-4 animate-pulse">
                <div className="h-16 bg-gray-200 rounded-2xl"></div>
              </div>
            ) : walletAddress ? (
              <div className="space-y-3">
                <div className="bg-[#F8F9FA]/80 p-4 rounded-2xl border border-white flex justify-between items-center shadow-sm">
                  <div>
                    <h5 className="text-sm font-bold text-gray-800">Liquidity Provision Reward</h5>
                    <p className="text-xs text-gray-400 mt-0.5">10 minutes ago • Jaringan Sepolia</p>
                  </div>
                  <span className="text-sm font-extrabold text-green-600">+150 PTS</span>
                </div>
                <div className="bg-[#F8F9FA]/80 p-4 rounded-2xl border border-white flex justify-between items-center shadow-sm">
                  <div>
                    <h5 className="text-sm font-bold text-gray-800">Token Swap Interaction</h5>
                    <p className="text-xs text-gray-400 mt-0.5">2 hours ago • Jaringan Sepolia</p>
                  </div>
                  <span className="text-sm font-extrabold text-green-600">+50 PTS</span>
                </div>
              </div>
            ) : (
              <div className="h-44 border-2 border-dashed border-gray-200 rounded-3xl flex flex-col items-center justify-center text-gray-400 font-medium bg-[#F8F9FA]/60">
                <Star size={36} className="mb-3 text-gray-300" />
                <p className="text-center text-sm">Target wallet does not have any recorded loyalty activities.</p>
              </div>
            )}
          </motion.div>
        </main>
      </div>
    </PageTransition>
  );
};

export default PointsPage;