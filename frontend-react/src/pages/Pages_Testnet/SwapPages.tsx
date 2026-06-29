import React, { useEffect, useState } from "react";
import SideBar from "../../components/SideBar";
import SwapCard from "../../components/SwapCard";
import SkeletonCard from "../../components/SkeletonCard";
import PageTransition from "../../components/PageTransition";

import { Wallet, CheckCircle2, AlertCircle, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

declare global {
  interface Window {
    ethereum?: any;
  }
}

  const SwapPages: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [walletAddress, setWalletAddress] = useState<string>("");
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // 1. Simulasi efek loading kerangka halaman awal
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  // 2. Cek koneksi akun secara otomatis
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
          console.error("Gagal mengecek koneksi wallet:", error);
        }
      }
    };
    checkConnection();
  }, []);

  // 3. Listener Real-time untuk mendeteksi pergantian akun MetaMask
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

  // 4. Fungsi Interaktif Tombol Hubungkan / Ganti Wallet via MetaMask
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
      showToast("Silakan pasang ekstensi MetaMask terlebih dahulu!", "error");
    }
  };

  const formatAddress = (address: string): string => {
    if (!address) return "";
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-[#F8F9FA] flex text-[#1A1A1A] font-sans relative overflow-hidden">
        
        {/* Ornamen Latar Belakang */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <div className="absolute inset-0 opacity-40" style={{ backgroundImage: "radial-gradient(#D1D5DB 1px, transparent 1px)", backgroundSize: "30px 30px" }} />
          <motion.div animate={{ x: [0, 30, 0], y: [0, -40, 0] }} transition={{ duration: 14, repeat: Infinity }} className="absolute top-20 right-10 w-80 h-80 bg-purple-300/20 rounded-full blur-3xl" />
          <motion.div animate={{ x: [0, -20, 0], y: [0, 20, 0] }} transition={{ duration: 12, repeat: Infinity }} className="absolute bottom-10 left-10 w-80 h-80 bg-blue-300/20 rounded-full blur-3xl" />
        </div>

        <SideBar />

        <main className="flex-1 flex flex-col p-4 sm:p-6 lg:p-8 z-10 relative overflow-y-auto">
          
          {/* HEADER BAR ATAS */}
          <header className="flex flex-col sm:flex-row justify-between sm:justify-end gap-3 mb-8">
            <motion.button
              whileHover={{ scale: 1.05 }}
              className="bg-white/70 backdrop-blur-lg px-4 py-3 rounded-2xl flex items-center gap-2 font-bold text-sm border border-white shadow-md"
            >
              <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center text-[10px] text-white font-bold">
                Z
              </div>
              Zentrix Swap
            </motion.button>

            {/* TOMBOL HUBUNGKAN WALLET (SINKRON DENGAN POOL PAGE) */}
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

          {/* KONTEN UTAMA SWAP */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex-1 flex flex-col items-center pt-2 sm:pt-6"
          >
            {loading ? (
              <SkeletonCard />
            ) : (
              <SwapCard 
                walletAddress={walletAddress} 
                connectWallet={handleWalletAction} 
              />
            )}
          </motion.div>
        </main>
      </div>
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -24, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -24, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className={`fixed top-6 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-xl min-w-[280px] max-w-sm border ${
              toast.type === "success"
                ? "bg-gradient-to-r from-blue-600 to-cyan-500 border-blue-400 text-white"
                : "bg-white border-red-100 text-red-700"
            }`}
          >
            <div className={`rounded-full w-8 h-8 flex items-center justify-center shrink-0 ${
              toast.type === "success" ? "bg-white/20" : "bg-red-50"
            }`}>
              {toast.type === "success"
                ? <CheckCircle2 size={18} className="text-white" />
                : <AlertCircle size={18} className="text-red-500" />
              }
            </div>
            <p className="font-bold text-sm flex-1">{toast.message}</p>
            <button
              type="button"
              onClick={() => setToast(null)}
              className={`transition-colors ${
                toast.type === "success" ? "text-white/60 hover:text-white" : "text-red-300 hover:text-red-600"
              }`}
            >
              <X size={15} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </PageTransition>
  );
};

export default SwapPages;