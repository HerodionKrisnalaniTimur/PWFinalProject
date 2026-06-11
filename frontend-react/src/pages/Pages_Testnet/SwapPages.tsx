import React, { useEffect, useState } from "react";
import SideBar from "../../components/SideBar";
import SwapCard from "../../components/SwapCard";
import SkeletonCard from "../../components/SkeletonCard";
import PageTransition from "../../components/PageTransition";

import { Wallet } from "lucide-react";
import { motion } from "framer-motion";

declare global {
  interface Window {
    ethereum?: any;
  }
}

const SwapPages: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [walletAddress, setWalletAddress] = useState<string>("");

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
      alert("Silakan pasang ekstensi MetaMask terlebih dahulu!");
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
    </PageTransition>
  );
};

export default SwapPages;