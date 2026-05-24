import React, { useEffect, useState } from "react";
import SideBar from "../../components/SideBar";
import SwapCard from "../../components/SwapCard";
import SkeletonCard from "../../components/SkeletonCard";
import PageTransition from "../../components/PageTransition";

import { Wallet } from "lucide-react";
import { motion } from "framer-motion";
import { ethers } from "ethers"; // Pastikan ethers di-import di sini

declare global {
  interface Window {
    ethereum?: any;
  }
}

const SwapPages: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [walletAddress, setWalletAddress] = useState<string>("");

  // Simulasi loading komponen
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2200);
    return () => clearTimeout(timer);
  }, []);

  // FUNGSI UNTUK SINKRONISASI ALAMAT METAMASK AKTIF
  const syncWallet = async () => {
    if (typeof window !== "undefined" && window.ethereum) {
      try {
        // Menggunakan BrowserProvider bawaan Ethers v6 yang sangat stabil di Vite
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const currentAddress = await signer.getAddress();
        
        // Simpan alamat asli MetaMask ke state React
        setWalletAddress(currentAddress);
        console.log("MetaMask Terkoneksi & Sinkron:", currentAddress);
      } catch (error) {
        // Jika user belum connect atau menolak konfirmasi
        setWalletAddress("");
      }
    }
  };

  // DETEKSI OTOMATIS PERUBAHAN AKUN DAN REFRESH DI VITE
  useEffect(() => {
    // Jalankan sinkronisasi saat pertama kali halaman dibuka
    syncWallet();

    if (typeof window !== "undefined" && window.ethereum) {
      // LISTENER: Jika user ganti akun langsung di MetaMask, jalankan fungsi sync ulang
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length > 0) {
          syncWallet();
        } else {
          setWalletAddress("");
        }
      };

      // LISTENER: Jika user ganti jaringan (network), reload halaman
      const handleChainChanged = () => {
        window.location.reload();
      };

      window.ethereum.on("accountsChanged", handleAccountsChanged);
      window.ethereum.on("chainChanged", handleChainChanged);

      // Bersihkan listener saat halaman ditutup/pindah page
      return () => {
        if (window.ethereum.removeListener) {
          window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
          window.ethereum.removeListener("chainChanged", handleChainChanged);
        }
      };
    }
  }, []);

  // FUNGSI TOMBOL CONNECT WALLET (MEMAKSA POPUP METAMASK KELUAR)
  const connectWallet = async () => {
    if (typeof window !== "undefined" && window.ethereum) {
      try {
        // Memicu popup persetujuan MetaMask
        await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        // Setelah disetujui, ambil alamatnya dengan fungsi sinkronisasi yang ada
        await syncWallet();
      } catch (error) {
        console.error("User membatalkan koneksi wallet", error);
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
        {/* Animated Background */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <div
            className="absolute inset-0 opacity-40"
            style={{
              backgroundImage: "radial-gradient(#D1D5DB 1px, transparent 1px)",
              backgroundSize: "30px 30px",
            }}
          />
        </div>

        <SideBar />

        <main className="flex-1 flex flex-col p-4 sm:p-6 lg:p-8 z-10 relative overflow-y-auto">
          {/* Header */}
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

            {/* BUTTON CONNECT WALLET */}
            <motion.button
              onClick={connectWallet}
              whileHover={{ scale: 1.05 }}
              className="bg-white/70 backdrop-blur-lg px-4 py-3 rounded-2xl flex items-center gap-2 font-bold text-sm border border-white shadow-md cursor-pointer hover:bg-white transition-colors"
            >
              <Wallet size={16} />
              {walletAddress ? formatAddress(walletAddress) : "Connect Wallet"}
            </motion.button>
          </header>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex-1 flex flex-col items-center pt-2 sm:pt-6"
          >
            {loading ? <SkeletonCard /> : <SwapCard walletAddress={walletAddress} connectWallet={connectWallet} />}
          </motion.div>
        </main>
      </div>
    </PageTransition>
  );
};

export default SwapPages;