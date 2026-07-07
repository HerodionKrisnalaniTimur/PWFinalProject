import React, { useState, useEffect } from "react";
import { Coins, Droplet, Loader2, CheckCircle2, AlertCircle, Wallet } from "lucide-react";
import { claimTokensFromFaucet, checkTokenCooldown } from "../../services/faucetServices";
import addressesData from "../../constants/addresses.json";
import Sidebar from "../../components/SideBar";
import PageTransition from "../../components/PageTransition";
import { motion } from "framer-motion";

// Daftar token yang tersedia di faucet
const TOKEN_METADATA = [
  { symbol: "USDT", name: "Mock USD Tether" },
  { symbol: "ZTX", name: "Zentrix Token" },
  { symbol: "AGT", name: "Agate Token" },
  { symbol: "TOG", name: "Toge Token" },
  { symbol: "DGH", name: "Digital Happiness" },
  { symbol: "MJK", name: "Mojiken Token" }
];

const AVAILABLE_FAUCETS = TOKEN_METADATA.map(({ symbol, name }) => ({
  symbol,
  name,
  address: addressesData[symbol]
}));

declare global {
  interface Window {
    ethereum?: any;
  }
}

export default function FaucetPage() {
  // State wallet (dikelola sendiri seperti halaman lain)
  const [walletAddress, setWalletAddress] = useState<string>("");
  const [loadingToken, setLoadingToken] = useState<string | null>(null);
  const [cooldowns, setCooldowns] = useState<Record<string, number>>({});
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // ─── KONEKSI WALLET ──────────────────────────────────────────────

  // Cek koneksi otomatis saat mount
  useEffect(() => {
    const checkConnection = async () => {
      if (typeof window !== "undefined" && window.ethereum) {
        try {
          const accounts: string[] = await window.ethereum.request({ method: "eth_accounts" });
          if (accounts.length > 0) setWalletAddress(accounts[0]);
        } catch (error) {
          console.error("Gagal mengecek koneksi:", error);
        }
      }
    };
    checkConnection();
  }, []);

  // Listener perubahan akun MetaMask
  useEffect(() => {
    if (typeof window !== "undefined" && window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        setWalletAddress(accounts.length > 0 ? accounts[0] : "");
      };
      window.ethereum.on("accountsChanged", handleAccountsChanged);
      return () => window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
    }
  }, []);

  // Fungsi hubungkan / ganti wallet
  const handleWalletAction = async () => {
    if (typeof window !== "undefined" && window.ethereum) {
      try {
        await window.ethereum.request({
          method: "wallet_requestPermissions",
          params: [{ eth_accounts: {} }]
        });
        const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
        setWalletAddress(accounts[0]);
      } catch (error) {
        console.error("Gagal mengonfigurasi wallet:", error);
      }
    } else {
      alert("Silakan install ekstensi MetaMask terlebih dahulu!");
    }
  };

  const formatAddress = (address: string) =>
    address ? `${address.substring(0, 6)}...${address.substring(address.length - 4)}` : "";

  // ─── COOLDOWN ────────────────────────────────────────────────────

  useEffect(() => {
    const fetchCooldowns = async () => {
      if (!walletAddress) return;
      const updated: Record<string, number> = {};
      for (const t of AVAILABLE_FAUCETS) {
        updated[t.symbol] = await checkTokenCooldown(walletAddress, t.address);
      }
      setCooldowns(updated);
    };

    fetchCooldowns();
    const interval = setInterval(fetchCooldowns, 10000);
    return () => clearInterval(interval);
  }, [walletAddress]);

  // ─── CLAIM ──────────────────────────────────────────────────────

  const handleClaim = async (symbol: string, address: string) => {
    if (!walletAddress) {
      setStatusMessage({ type: "error", text: "Silakan sambungkan dompet MetaMask Anda terlebih dahulu!" });
      return;
    }

    setLoadingToken(symbol);
    setStatusMessage(null);

    try {
      await claimTokensFromFaucet(address);
      setStatusMessage({ type: "success", text: `Sukses! 100 ${symbol} berhasil dikirim ke dompet Anda.` });
      setCooldowns((prev) => ({ ...prev, [symbol]: 86400 }));
    } catch (error: any) {
      console.error(error);
      setStatusMessage({
        type: "error",
        text: error.reason || "Transaksi ditolak atau saldo Faucet tidak mencukupi."
      });
    } finally {
      setLoadingToken(null);
    }
  };

  const formatSecondsToTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return `${h}j ${m}m`;
  };

  // ─── RENDER ─────────────────────────────────────────────────────

  return (
    <PageTransition>
      <div className="min-h-screen bg-[#F8F9FA] flex text-[#1A1A1A] font-sans relative overflow-hidden">
        {/* Latar belakang (sama dengan halaman lain) */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <div
            className="absolute inset-0 opacity-40"
            style={{
              backgroundImage: "radial-gradient(#D1D5DB 1px, transparent 1px)",
              backgroundSize: "30px 30px"
            }}
          />
          <motion.div
            animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
            transition={{ duration: 12, repeat: Infinity }}
            className="absolute top-20 left-10 w-72 h-72 bg-cyan-300/20 rounded-full blur-3xl"
          />
          <motion.div
            animate={{ x: [0, -30, 0], y: [0, 30, 0] }}
            transition={{ duration: 10, repeat: Infinity }}
            className="absolute bottom-0 right-0 w-72 h-72 bg-blue-300/20 rounded-full blur-3xl"
          />
        </div>

        <Sidebar />

        <main className="flex-1 flex flex-col p-4 sm:p-6 lg:p-8 z-10 relative overflow-y-auto">
          {/* Header Bar – sama seperti halaman lain */}
          <header className="flex flex-col sm:flex-row justify-between sm:justify-end gap-3 mb-8">
            <motion.button
              whileHover={{ scale: 1.05 }}
              className="bg-white/70 backdrop-blur-xl px-4 py-3 rounded-2xl flex items-center gap-2 font-bold text-sm border border-white shadow-md"
            >
              <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center text-[10px] text-white font-bold">Z</div>
              Zentrix Faucet
            </motion.button>

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
              {walletAddress ? formatAddress(walletAddress) : "Connect Wallet"}
            </motion.button>
          </header>

          {/* Konten Utama – kartu putih dengan gaya seragam */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-5xl mx-auto bg-white/70 backdrop-blur-2xl rounded-[32px] p-5 sm:p-8 border border-white shadow-2xl"
          >
            {/* Header Hero */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 bg-blue-500/10 rounded-xl text-blue-500">
                  <Droplet className="w-8 h-8" />
                </div>
                <h1 className="text-3xl font-extrabold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                  Testnet Core Faucet
                </h1>
              </div>
              <p className="text-gray-500 text-sm max-w-2xl">
                Ambil modal instan berupa koin gratis sebanyak <span className="text-blue-600 font-semibold">100 koin per klaim</span> untuk menguji fitur Automated Market Maker (Swap &amp; Liquidity Pool) di dApp kami.
              </p>
            </div>

            {/* Alert Status */}
            {statusMessage && (
              <div
                className={`mb-6 max-w-4xl p-4 rounded-xl border flex items-center gap-3 text-sm ${
                  statusMessage.type === "success"
                    ? "bg-green-500/10 border-green-500/30 text-green-600"
                    : "bg-red-500/10 border-red-500/30 text-red-600"
                }`}
              >
                {statusMessage.type === "success" ? (
                  <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                ) : (
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                )}
                <p>{statusMessage.text}</p>
              </div>
            )}

            {/* Grid Token Cards – gaya kartu putih seperti Pool/Points */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {AVAILABLE_FAUCETS.map((token) => {
                const isCooldown = cooldowns[token.symbol] > 0;
                const isLoading = loadingToken === token.symbol;

                return (
                  <div
                    key={token.symbol}
                    className="bg-white/80 rounded-2xl p-6 border border-gray-100 shadow-md hover:shadow-lg transition-shadow flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center font-bold text-lg text-blue-600 border border-blue-100">
                          {token.symbol}
                        </div>
                        <span className="text-xs px-3 py-1 bg-gray-100 rounded-full text-gray-600 font-medium">
                          +100 {token.symbol}
                        </span>
                      </div>
                      <h3 className="font-bold text-lg mb-1 text-gray-800">{token.name}</h3>
                      <p className="text-xs text-gray-400 font-mono truncate mb-6">{token.address}</p>
                    </div>

                    <button
                      onClick={() => handleClaim(token.symbol, token.address)}
                      disabled={isCooldown || isLoading}
                      className={`w-full py-3 rounded-xl font-semibold text-sm transition flex items-center justify-center gap-2 ${
                        isCooldown
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200"
                          : "bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white shadow-lg shadow-blue-200"
                      }`}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Memproses...
                        </>
                      ) : isCooldown ? (
                        <>Terkunci ({formatSecondsToTime(cooldowns[token.symbol])})</>
                      ) : (
                        <>
                          <Coins className="w-4 h-4" />
                          Klaim Token Uji Coba
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </main>
      </div>
    </PageTransition>
  );
}