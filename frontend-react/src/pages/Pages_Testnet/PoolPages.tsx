import Sidebar from "../../components/SideBar";
import PageTransition from "../../components/PageTransition";
import AddLiquidityModal from "../../components/AddLiquidityModal"; // Pastikan impor komponen modal ini ada

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

const PoolPage = () => {
  const [loading, setLoading] = useState(true);
  const [walletAddress, setWalletAddress] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState(false); // State khusus untuk mengontrol buka/tutup modal pop-up

  // 1. Cek koneksi akun otomatis saat pertama kali dApp dibuka
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

  // 2. Listener otomatis jika user berganti akun langsung dari dalam ekstensi MetaMask
  useEffect(() => {
    if (typeof window !== "undefined" && window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length > 0) {
          setWalletAddress(accounts[0]);
          console.log("Akun wallet berganti ke:", accounts[0]);
        } else {
          setWalletAddress(""); // Jika semua akun diputus koneksinya oleh user
        }
      };

      window.ethereum.on("accountsChanged", handleAccountsChanged);

      return () => {
        window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
      };
    }
  }, []);

  // 3. Fungsi MANUAL khusus tombol pojok kanan atas: Memaksa MetaMask memunculkan daftar pilih/ganti akun
  const handleWalletAction = async () => {
    if (typeof window !== "undefined" && window.ethereum) {
      try {
        // Memaksa memunculkan pop-up pilihan daftar akun di MetaMask
        await window.ethereum.request({
          method: "wallet_requestPermissions",
          params: [{ eth_accounts: {} }],
        });

        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        
        setWalletAddress(accounts[0]);
      } catch (error: any) {
        if (error.code === 4001) {
          console.log("User membatalkan interaksi pemilihan wallet.");
        } else {
          console.error("Gagal mengonfigurasi wallet:", error);
        }
      }
    } else {
      alert("Silakan install ekstensi MetaMask terlebih dahulu!");
    }
  };

  const formatAddress = (address: string): string => {
    if (!address) return "";
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

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
              backgroundImage: "radial-gradient(#D1D5DB 1px, transparent 1px)",
              backgroundSize: "30px 30px",
            }}
          />

          <motion.div
            animate={{ x: [0, 40, 0], y: [0, -20, 0] }}
            transition={{ duration: 12, repeat: Infinity }}
            className="absolute top-10 left-10 w-72 h-72 bg-cyan-300/30 rounded-full blur-3xl"
          />

          <motion.div
            animate={{ x: [0, -30, 0], y: [0, 30, 0] }}
            transition={{ duration: 10, repeat: Infinity }}
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
                Z
              </div>
              Zentrix Pool
            </motion.button>

            {/* MURNI UNTUK WALLET: Click untuk Connect / Manual Switch Account */}
            <motion.button
              onClick={handleWalletAction}
              whileHover={{ scale: 1.05 }}
              className={`px-4 py-3 rounded-2xl flex items-center gap-2 font-bold text-sm border shadow-md cursor-pointer transition-all ${
                walletAddress 
                  ? "bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200 text-emerald-700 hover:from-emerald-100 hover:to-teal-100" 
                  : "bg-white/70 border-white text-[#1A1A1A] hover:bg-white"
              }`}
            >
              <Wallet size={16} className={walletAddress ? "text-emerald-600" : ""} />
              {walletAddress ? `${formatAddress(walletAddress)}` : "Connect Wallet"}
            </motion.button>
          </header>

          {/* Main Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-5xl mx-auto bg-white/70 backdrop-blur-2xl rounded-[32px] p-5 sm:p-8 border border-white shadow-2xl"
          >

            {/* Top Section */}
            <div className="flex flex-col lg:flex-row gap-6 lg:items-center lg:justify-between mb-10">
              <div>
                <h2 className="text-3xl font-bold flex items-center gap-3">
                  <Droplets className="text-blue-500" />
                  Liquidity Pools
                </h2>
                <p className="text-gray-500 mt-3 text-sm sm:text-base">
                  Provide liquidity to earn trading fees and passive rewards.
                </p>
              </div>

              {/* MURNI UNTUK MODAL TAMBAH LIKUIDITAS */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => {
                  if (!walletAddress) {
                    // Jika wallet belum terkoneksi, minta connect dulu sebelum modal dibuka
                    handleWalletAction();
                  } else {
                    // Jika sudah konek, buka modal input nominal likuiditas
                    setIsModalOpen(true);
                  }
                }}
                className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-6 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg cursor-pointer"
              >
                <Plus size={20} />
                Add Liquidity
              </motion.button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
              <motion.div whileHover={{ y: -5 }} className="bg-white/80 rounded-3xl p-6 shadow-md border border-white">
                <div className="flex items-center justify-between mb-5">
                  <TrendingUp className="text-green-500" />
                  <span className="text-xs font-semibold text-green-600 bg-green-100 px-2 py-1 rounded-xl">
                    +12%
                  </span>
                </div>
                <h3 className="text-gray-500 text-sm mb-2">Total APR</h3>
                <p className="text-3xl font-bold">24.8%</p>
              </motion.div>

              <motion.div whileHover={{ y: -5 }} className="bg-white/80 rounded-3xl p-6 shadow-md border border-white">
                <div className="flex items-center justify-between mb-5">
                  <Coins className="text-yellow-500" />
                </div>
                <h3 className="text-gray-500 text-sm mb-2">Total Liquidity</h3>
                <p className="text-3xl font-bold">$124K</p>
              </motion.div>

              <motion.div whileHover={{ y: -5 }} className="bg-white/80 rounded-3xl p-6 shadow-md border border-white">
                <div className="flex items-center justify-between mb-5">
                  <Droplets className="text-cyan-500" />
                </div>
                <h3 className="text-gray-500 text-sm mb-2">Your Pools</h3>
                <p className="text-3xl font-bold">0</p>
              </motion.div>
            </div>

            {/* Pool Content */}
            {loading ? (
              <div className="space-y-5 animate-pulse">
                <div className="h-24 rounded-3xl bg-gray-200"></div>
                <div className="h-24 rounded-3xl bg-gray-200"></div>
                <div className="h-24 rounded-3xl bg-gray-200"></div>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="h-56 border-2 border-dashed border-gray-200 rounded-3xl flex flex-col items-center justify-center text-gray-400 font-medium bg-[#F8F9FA]/60"
              >
                <Droplets size={42} className="mb-4 text-gray-300" />
                <p className="text-center text-sm sm:text-base">
                  You don't have any active liquidity positions.
                </p>
              </motion.div>
            )}
          </motion.div>
        </main>
      </div>

      {/* Sambungkan komponen modal pop-up ke layar */}
      <AddLiquidityModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        walletAddress={walletAddress}
      />
    </PageTransition>
  );
};

export default PoolPage;