import Sidebar from "../../components/SideBar";
import PageTransition from "../../components/PageTransition";
import AddLiquidityModal from "../../components/AddLiquidityModal";
import PoolCard from "../../components/PoolCard"; 
import { fetchAllTokenBalances, fetchUserLiquidity, fetchGlobalPoolStats } from "../../services/poolService";

import {
  Wallet,
  Droplets,
  Plus,
  TrendingUp,
  Coins,
} from "lucide-react";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

declare global {
  interface Window {
    ethereum?: any;
  }
}

interface LiquidityPosition {
  ztx: number;
  usdt: number;
}

const PoolPage = () => {
  const [loading, setLoading] = useState(true);
  const [walletAddress, setWalletAddress] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userLiquidity, setUserLiquidity] = useState<LiquidityPosition>({ ztx: 0, usdt: 0 });
  
  // State baru untuk menampung data TVL dan APR global dari blockchain
  const [globalStats, setGlobalStats] = useState({ tvl: 0, apr: 24.8 });

  // Fungsi untuk memuat saldo likuiditas user & statistik global 
  const loadLiquidityData = async (address: string) => {
    setLoading(true);
    try {
      const [data, stats] = await Promise.all([
        fetchUserLiquidity(address),
        fetchGlobalPoolStats() // Mengambil data makro pool dari smart contract
      ]);
      setUserLiquidity(data);
      setGlobalStats(stats);
    } catch (error) {
      console.error("Gagal memuat data pool:", error);
    } finally {
      setLoading(false);
    }
  };

  // Pengecekan otomatis koneksi wallet saat halaman dimuat
  useEffect(() => {
    const checkConnection = async () => {
      if (typeof window !== "undefined" && window.ethereum) {
        try {
          const accounts: string[] = await window.ethereum.request({ 
            method: "eth_accounts" 
          });
          if (accounts.length > 0) {
            setWalletAddress(accounts[0]);
            loadLiquidityData(accounts[0]);
          } else {
            setLoading(false);
          }
        } catch (error) {
          console.error("Gagal mengecek koneksi:", error);
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };
    checkConnection();
  }, []);

  // Listener deteksi otomatis pergantian akun MetaMask
  useEffect(() => {
    if (typeof window !== "undefined" && window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length > 0) {
          setWalletAddress(accounts[0]);
          loadLiquidityData(accounts[0]);
        } else {
          setWalletAddress("");
          setUserLiquidity({ ztx: 0, usdt: 0 });
        }
      };

      window.ethereum.on("accountsChanged", handleAccountsChanged);
      return () => {
        window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
      };
    }
  }, []);

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
        loadLiquidityData(accounts[0]);
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

  const activePoolsCount = userLiquidity.ztx > 0 || userLiquidity.usdt > 0 ? 1 : 0;

  return (
    <PageTransition>
      <div className="min-h-screen bg-[#F8F9FA] flex text-[#1A1A1A] font-sans relative overflow-hidden">
        
        {/* Latar Belakang */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <div className="absolute inset-0 opacity-40" style={{ backgroundImage: "radial-gradient(#D1D5DB 1px, transparent 1px)", backgroundSize: "30px 30px" }} />
          <motion.div animate={{ x: [0, 40, 0], y: [0, -20, 0] }} transition={{ duration: 12, repeat: Infinity }} className="absolute top-10 left-10 w-72 h-72 bg-cyan-300/30 rounded-full blur-3xl" />
          <motion.div animate={{ x: [0, -30, 0], y: [0, 30, 0] }} transition={{ duration: 10, repeat: Infinity }} className="absolute bottom-0 right-0 w-72 h-72 bg-blue-300/30 rounded-full blur-3xl" />
        </div>

        <Sidebar />

        <main className="flex-1 flex flex-col p-4 sm:p-6 lg:p-8 z-10 relative overflow-y-auto custom-scrollbar">
          
          {/* Bagian Bar Atas */}
          <header className="flex flex-col sm:flex-row justify-between sm:justify-end gap-3 mb-8">
            <motion.button whileHover={{ scale: 1.05 }} className="bg-white/70 backdrop-blur-xl px-4 py-3 rounded-2xl flex items-center gap-2 font-bold text-sm border border-white shadow-md">
              <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center text-[10px] text-white font-bold">Z</div>
              Zentrix Pool
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

          {/* Dashboard Pool */}
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-5xl mx-auto bg-white/70 backdrop-blur-2xl rounded-[32px] p-5 sm:p-8 border border-white shadow-2xl">
            
            {/* Judul & Tombol Tambah Likuiditas */}
            <div className="flex flex-col lg:flex-row gap-6 lg:items-center lg:justify-between mb-10">
              <div>
                <h2 className="text-3xl font-bold flex items-center gap-3"><Droplets className="text-blue-500" />Liquidity Pools</h2>
                <p className="text-gray-500 mt-3 text-sm sm:text-base">Provide liquidity to earn trading fees and passive rewards.</p>
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => !walletAddress ? handleWalletAction() : setIsModalOpen(true)}
                className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-6 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg cursor-pointer"
              >
                <Plus size={20} />Add Liquidity
              </motion.button>
            </div>

            {/* Bagian Grid Statistik Atas (Sekarang Sudah Dinamis) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
              <motion.div whileHover={{ y: -5 }} className="bg-white/80 rounded-3xl p-6 shadow-md border border-white">
                <div className="flex items-center justify-between mb-5"><TrendingUp className="text-green-500" /><span className="text-xs font-semibold text-green-600 bg-green-100 px-2 py-1 rounded-xl">+12%</span></div>
                <h3 className="text-gray-500 text-sm mb-2">Total APR</h3>
                <p className="text-3xl font-bold">{globalStats.apr.toFixed(1)}%</p>
              </motion.div>

              <motion.div whileHover={{ y: -5 }} className="bg-white/80 rounded-3xl p-6 shadow-md border border-white">
                <div className="flex items-center justify-between mb-5"><Coins className="text-yellow-500" /></div>
                <h3 className="text-gray-500 text-sm mb-2">Total Liquidity</h3>
                <p className="text-3xl font-bold">
                  ${globalStats.tvl.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </motion.div>

              <motion.div whileHover={{ y: -5 }} className="bg-white/80 rounded-3xl p-6 shadow-md border border-white">
                <div className="flex items-center justify-between mb-5"><Droplets className="text-cyan-500" /></div>
                <h3 className="text-gray-500 text-sm mb-2">Your Pools</h3>
                <p className="text-3xl font-bold">{activePoolsCount}</p>
              </motion.div>
            </div>

            {/* Konten Pool */}
            {loading ? (
              <div className="space-y-5 animate-pulse">
                <div className="h-24 rounded-3xl bg-gray-200"></div>
              </div>
            ) : activePoolsCount > 0 ? (
              <PoolCard 
                ztxAmount={userLiquidity.ztx} 
                usdtAmount={userLiquidity.usdt} 
              />
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="h-56 border-2 border-dashed border-gray-200 rounded-3xl flex flex-col items-center justify-center text-gray-400 font-medium bg-[#F8F9FA]/60"
              >
                <Droplets size={42} className="mb-4 text-gray-300" />
                <p className="text-center text-sm sm:text-base">Target wallet does not have any active liquidity positions.</p>
              </motion.div>
            )}

          </motion.div>
        </main>
      </div>

      {/* Modal Pop-up Tambah Likuiditas */}
      <AddLiquidityModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          if (walletAddress) loadLiquidityData(walletAddress);
        }}
        walletAddress={walletAddress}
        onSuccess={() => {
          if (walletAddress) loadLiquidityData(walletAddress);
        }}
      />
    </PageTransition>
  );
};

export default PoolPage;