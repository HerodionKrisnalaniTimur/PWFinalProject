import React, { useState, useEffect, useCallback, useRef } from "react";
import { ArrowDownUp, Info, AlertCircle, CheckCircle2, Loader2, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { fetchAllTokenBalances } from "../services/poolService";
import { fetchLiveTokenRate, executeOnChainMultiSwap } from "../services/swapService";
import { usePoints } from '../context/PointsContext'; 

interface SwapCardProps {
  walletAddress: string;
  connectWallet: () => Promise<void>;
}

const TOKEN_COLORS: Record<string, string> = {
  USDT: "bg-green-500",
  ZTX: "bg-blue-600",
  AGT: "bg-purple-600",
  TOG: "bg-amber-600",
  DGH: "bg-red-500",
  MJK: "bg-cyan-500",
};

const SwapCard = ({ walletAddress, connectWallet }: SwapCardProps) => {
  const [fromToken, setFromToken] = useState("USDT");
  const [toToken, setToToken] = useState("ZTX");
  const [fromAmount, setFromAmount] = useState("");
  const [toAmount, setToAmount] = useState("");
  const [balances, setBalances] = useState<Record<string, string>>({});
  const [loadingRate, setLoadingRate] = useState(false);
  const [isSwapping, setIsSwapping] = useState(false);
  const [txStatus, setTxStatus] = useState<{ type: "processing" | "success" | "error"; message: string } | null>(null);

  const [isFromDropdownOpen, setIsFromDropdownOpen] = useState(false);
  const [isToDropdownOpen, setIsToDropdownOpen] = useState(false);
const [toast, setToast] = useState<{ show: boolean; message: string } | null>(null);
  const fromDropdownRef = useRef<HTMLDivElement>(null);
  const toDropdownRef = useRef<HTMLDivElement>(null);

  const tokenList = ["USDT", "ZTX", "AGT", "TOG", "DGH", "MJK"];
  const { addActivity } = usePoints();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (fromDropdownRef.current && !fromDropdownRef.current.contains(event.target as Node)) {
        setIsFromDropdownOpen(false);
      }
      if (toDropdownRef.current && !toDropdownRef.current.contains(event.target as Node)) {
        setIsToDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const loadBalances = useCallback(async () => {
    if (walletAddress) {
      const data = await fetchAllTokenBalances(walletAddress);
      setBalances(data);
    }
  }, [walletAddress]);

  useEffect(() => {
    const fetchAwal = async () => {
      await loadBalances();
    };
    fetchAwal();
  }, [loadBalances]);

  // PERBAIKAN UTAMA: Sinkronisasi kalkulasi konversi rate live pool
  const updateRate = useCallback(async (amount: string, from: string, to: string) => {
    if (!amount || parseFloat(amount) <= 0) {
      setToAmount("");
      return;
    }
    setLoadingRate(true);
    try {
      // Ambil rate masing-masing token secara on-chain terpisah sesuai aturan swapService
      const rateFrom = await fetchLiveTokenRate(from);
      const rateTo = await fetchLiveTokenRate(to);
      
      if (rateTo > 0) {
        // Terapkan rumus konversi multi-token: (Jumlah Input * Rate Asal) / Rate Tujuan
        const estimatedAmount = (parseFloat(amount) * rateFrom) / rateTo;
        setToAmount(estimatedAmount.toFixed(4));
      } else {
        setToAmount("0.0000");
      }
    } catch (e) {
      console.error("Gagal sinkronisasi kalkulasi konversi:", e);
      setToAmount("");
    } finally {
      setLoadingRate(false);
    }
  }, []);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      updateRate(fromAmount, fromToken, toToken);
    }, 500);
    return () => clearTimeout(delayDebounce);
  }, [fromAmount, fromToken, toToken, updateRate]);

  const handleSwitchTokens = () => {
    setFromToken(toToken);
    setToToken(fromToken);
    setFromAmount(toAmount);
    setToAmount(fromAmount);
  };

  const handleSwapExecute = async () => {
    if (!walletAddress) {
      connectWallet();
      return;
    }
    if (!fromAmount || parseFloat(fromAmount) <= 0) return;

    setIsSwapping(true);
    setTxStatus({ type: "processing", message: `Swapping ${fromAmount} ${fromToken} to ${toToken}...` });

    try {
      // Memanggil swapService dengan parameter yang sesuai
      await executeOnChainMultiSwap(fromToken, toToken, fromAmount);
      
      setTxStatus({ 
        type: "success", 
        message: `Berhasil Swap! Transaksi Anda telah dikonfirmasi` 
      });

      addActivity("Swap", `Swapped ${fromAmount} ${fromToken} to ${toToken}`, 50, walletAddress, "Sepolia Testnet");
      setFromAmount("");
      setToAmount("");
      loadBalances();
    } catch (error: any) {
      console.error("Detail error saat swap:", error);
      setTxStatus({ 
        type: "error", 
        message: error.message || "Transaksi gagal atau ditolak di Blockchain." 
      });
    } finally {
      setIsSwapping(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white/70 backdrop-blur-2xl rounded-[32px] p-6 border border-white shadow-2xl relative">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-extrabold text-gray-800 tracking-tight">Swap Tokens</h3>
        <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-xl border border-blue-100">
          Instant Execution
        </span>
      </div>

      <div className="space-y-2 relative">
        {/* INPUT FROM */}
        <div className="bg-gray-50/60 border border-gray-100 p-4 rounded-2xl">
          <div className="flex justify-between text-xs text-gray-400 font-bold mb-2">
            <span>From</span>
            <span>Balance: {balances[fromToken] || "0.00"}</span>
          </div>
          <div className="flex items-center justify-between gap-3 relative">
            <input
              type="number"
              placeholder="0.0"
              className="bg-transparent text-2xl font-black text-gray-800 outline-none w-full [appearance:textfield] [&::-webkit-outer-spin-button]:margin-0 [&::-webkit-inner-spin-button]:margin-0"
              value={fromAmount}
              onChange={(e) => setFromAmount(e.target.value)}
              disabled={isSwapping}
            />
            
            <div className="relative" ref={fromDropdownRef}>
              <button
                type="button"
                onClick={() => setIsFromDropdownOpen(!isFromDropdownOpen)}
                disabled={isSwapping}
                className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl shadow-sm border border-gray-100 text-sm font-bold text-gray-800 hover:bg-gray-50 transition-all cursor-pointer disabled:opacity-50"
              >
                <div className={`w-3.5 h-3.5 rounded-full ${TOKEN_COLORS[fromToken] || "bg-gray-400"}`} />
                {fromToken}
                <ChevronDown size={14} className={`text-gray-400 transition-transform duration-200 ${isFromDropdownOpen ? "rotate-180" : ""}`} />
              </button>

              <AnimatePresence>
                {isFromDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 mt-2 w-32 bg-white/95 backdrop-blur-lg border border-gray-100 rounded-2xl shadow-xl z-50 p-1 max-h-52 overflow-y-auto"
                  >
                    {tokenList.map((token) => (
                      <button
                        key={token}
                        type="button"
                        onClick={() => {
                          setFromToken(token);
                          setIsFromDropdownOpen(false);
                        }}
                        className={`flex items-center gap-2 w-full px-3 py-2 rounded-xl text-left text-xs font-bold transition-all ${
                          fromToken === token ? "bg-blue-50 text-blue-600" : "text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        <div className={`w-2.5 h-2.5 rounded-full ${TOKEN_COLORS[token] || "bg-gray-400"}`} />
                        {token}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* SWAP ICON BUTTON */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
          <motion.button
            whileHover={{ scale: 1.1, rotate: 180 }}
            whileTap={{ scale: 0.9 }}
            type="button"
            onClick={handleSwitchTokens}
            className="bg-white border border-gray-100 p-3 rounded-full shadow-md text-blue-500 hover:text-blue-600 cursor-pointer"
          >
            <ArrowDownUp size={16} />
          </motion.button>
        </div>

        {/* INPUT TO */}
        <div className="bg-gray-50/60 border border-gray-100 p-4 rounded-2xl pt-6">
          <div className="flex justify-between text-xs text-gray-400 font-bold mb-2">
            <span>To (Estimated)</span>
            <span>Balance: {balances[toToken] || "0.00"}</span>
          </div>
          <div className="flex items-center justify-between gap-3 relative">
            <div className="w-full relative flex items-center">
              <input
                type="text"
                placeholder="0.0"
                className="bg-transparent text-2xl font-black text-gray-800 outline-none w-full"
                value={toAmount}
                readOnly
              />
              {loadingRate && <Loader2 size={16} className="animate-spin text-gray-400 absolute right-2" />}
            </div>

            <div className="relative" ref={toDropdownRef}>
              <button
                type="button"
                onClick={() => setIsToDropdownOpen(!isToDropdownOpen)}
                disabled={isSwapping}
                className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl shadow-sm border border-gray-100 text-sm font-bold text-gray-800 hover:bg-gray-50 transition-all cursor-pointer disabled:opacity-50"
              >
                <div className={`w-3.5 h-3.5 rounded-full ${TOKEN_COLORS[toToken] || "bg-gray-400"}`} />
                {toToken}
                <ChevronDown size={14} className={`text-gray-400 transition-transform duration-200 ${isToDropdownOpen ? "rotate-180" : ""}`} />
              </button>

              <AnimatePresence>
                {isToDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 mt-2 w-32 bg-white/95 backdrop-blur-lg border border-gray-100 rounded-2xl shadow-xl z-50 p-1 max-h-52 overflow-y-auto"
                  >
                    {tokenList.map((token) => (
                      <button
                        key={token}
                        type="button"
                        onClick={() => {
                          setToToken(token);
                          setIsToDropdownOpen(false);
                        }}
                        className={`flex items-center gap-2 w-full px-3 py-2 rounded-xl text-left text-xs font-bold transition-all ${
                          toToken === token ? "bg-blue-50 text-blue-600" : "text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        <div className={`w-2.5 h-2.5 rounded-full ${TOKEN_COLORS[token] || "bg-gray-400"}`} />
                        {token}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER INFO */}
      <div className="mt-4 bg-blue-50/40 p-3.5 rounded-2xl border border-blue-100/50 flex gap-2 text-[11px] text-blue-700 font-medium">
        <Info size={14} className="shrink-0 mt-0.5" />
        <p>Slippage Tolerance: <span className="font-bold text-gray-700">0.5%</span>. Hasil akhir yang didapatkan otomatis menyesuaikan rate liquidity pool ter-update.</p>
      </div>

      {/* ACTION BUTTON */}
      <motion.button
        whileTap={{ scale: 0.98 }}
        onClick={handleSwapExecute}
        disabled={isSwapping || (!walletAddress ? false : !fromAmount)}
        className="w-full mt-4 bg-gradient-to-r from-blue-600 to-cyan-500 text-white py-4 rounded-2xl font-bold text-base shadow-lg transition-all disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
      >
        {!walletAddress ? "Connect Wallet" : isSwapping ? "Executing Swap..." : "Swap Tokens"}
      </motion.button>

      {/* STATUS BLOCK */}
      <AnimatePresence>
        {txStatus && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className={`mt-4 p-4 rounded-2xl flex items-start gap-3 border text-xs leading-relaxed ${
              txStatus.type === "processing" ? "bg-blue-50 border-blue-100 text-blue-700" : txStatus.type === "success" ? "bg-emerald-50 border-emerald-100 text-emerald-800" : "bg-red-50 border-red-100 text-red-700"
            }`}
          >
            {txStatus.type === "processing" ? <Loader2 size={16} className="animate-spin shrink-0 text-blue-500 mt-0.5" /> : txStatus.type === "success" ? <CheckCircle2 size={16} className="shrink-0 text-emerald-600 mt-0.5" /> : <AlertCircle size={16} className="shrink-0 text-red-500 mt-0.5" />}
            <div className="flex-1">
              <p className="font-bold mb-0.5">{txStatus.type === "processing" ? "Transaction Pending" : txStatus.type === "success" ? "Success" : "Error"}</p>
              <p className="opacity-90">{txStatus.message}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SwapCard;