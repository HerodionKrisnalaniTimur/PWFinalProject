import React, { useState, useEffect } from "react";
import { Coins, Droplet, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { claimTokensFromFaucet, checkTokenCooldown } from "../../services/faucetServices";

// Dummy List Token (Sesuaikan Alamat Token Sepolia Anda)
import addressesData from "../../constants/addresses.json";

// Daftar token yang tersedia di faucet (dengan nama)
const TOKEN_METADATA = [
  { symbol: "USDT", name: "Mock USD Tether" },
  { symbol: "ZTX", name: "Zentrix Token" },
  { symbol: "AGT", name: "Agate Token" },
  { symbol: "TOG", name: "Toge Token" },
  { symbol: "DGH", name: "Digital Happiness" },
  { symbol: "MJK", name: "Mojiken Token" }
];

// Bangun array faucet dengan alamat dari JSON
const AVAILABLE_FAUCETS = TOKEN_METADATA.map(({ symbol, name }) => ({
  symbol,
  name,
  address: addressesData[symbol]
}));


export default function FaucetPage({ walletAddress }: { walletAddress: string }) {
  const [loadingToken, setLoadingToken] = useState<string | null>(null);
  const [cooldowns, setCooldowns] = useState<Record<string, number>>({});
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Efek memuat status cooldown tiap kali dompet login terdeteksi
  useEffect(() => {
    const fetchCooldowns = async () => {
      if (!walletAddress) return;
      const updatedCooldowns: Record<string, number> = {};
      for (const t of AVAILABLE_FAUCETS) {
        const sisaDetik = await checkTokenCooldown(walletAddress, t.address);
        updatedCooldowns[t.symbol] = sisaDetik;
      }
      setCooldowns(updatedCooldowns);
    };

    fetchCooldowns();
    const interval = setInterval(fetchCooldowns, 10000); // Sinkronisasi ulang otomatis tiap 10 detik
    return () => clearInterval(interval);
  }, [walletAddress]);

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
      // Update cooldown lokal instan setelah transaksi sukses
      setCooldowns((prev) => ({ ...prev, [symbol]: 86400 })); 
    } catch (error: any) {
      console.error(error);
      setStatusMessage({ type: "error", text: error.reason || "Transaksi ditolak atau saldo Faucet tidak mencukupi." });
    } finally {
      setLoadingToken(null);
    }
  };

  // Fungsi helper format detik ke penulisan waktu Jam & Menit
  const formatSecondsToTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return `${h}j ${m}m`;
  };

  return (
    <div className="min-h-screen bg-[#0d0e12] text-white p-8 pl-28">
      {/* Header Hero */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-3 bg-blue-500/10 rounded-xl text-blue-400">
            <Droplet className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            Testnet Core Faucet
          </h1>
        </div>
        <p className="text-gray-400 text-sm max-w-xl">
          Ambil modal instan berupa koin gratis sebanyak <span className="text-blue-400 font-semibold">100 koin per klaim</span> untuk menguji fitur Automated Market Maker (Swap & Liquidity Pool) di dApp kami.
        </p>
      </div>

      {/* Alert Notifikasi Status */}
      {statusMessage && (
        <div className={`mb-6 max-w-4xl p-4 rounded-xl border flex items-center gap-3 text-sm ${
          statusMessage.type === "success" ? "bg-green-500/10 border-green-500/30 text-green-400" : "bg-red-500/10 border-red-500/30 text-red-400"
        }`}>
          {statusMessage.type === "success" ? <CheckCircle2 className="w-5 h-5 flex-shrink-0" /> : <AlertCircle className="w-5 h-5 flex-shrink-0" />}
          <p>{statusMessage.text}</p>
        </div>
      )}

      {/* Grid Token Cards Container */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl">
        {AVAILABLE_FAUCETS.map((token) => {
          const isCooldown = cooldowns[token.symbol] > 0;
          const isLoading = loadingToken === token.symbol;

          return (
            <div key={token.symbol} className="bg-[#151720] border border-gray-800 rounded-2xl p-6 hover:border-gray-700 transition duration-300 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-4">
                  <div className="w-12 h-12 rounded-full bg-blue-600/10 flex items-center justify-center font-bold text-lg text-blue-400 border border-blue-500/20">
                    {token.symbol}
                  </div>
                  <span className="text-xs px-3 py-1 bg-gray-800 rounded-full text-gray-400 font-medium">
                    +100 {token.symbol}
                  </span>
                </div>
                <h3 className="font-bold text-lg mb-1">{token.name}</h3>
                <p className="text-xs text-gray-500 font-mono truncate mb-6">{token.address}</p>
              </div>

              {/* Action Button */}
              <button
                onClick={() => handleClaim(token.symbol, token.address)}
                disabled={isCooldown || isLoading}
                className={`w-full py-3 rounded-xl font-semibold text-sm transition flex items-center justify-center gap-2 ${
                  isCooldown 
                    ? "bg-gray-800/40 text-gray-500 cursor-not-allowed border border-gray-800" 
                    : "bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/10"
                }`}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Memproses di Block...
                  </>
                ) : isCooldown ? (
                  <>
                    Terkunci ({formatSecondsToTime(cooldowns[token.symbol])})
                  </>
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
    </div>
  );
}