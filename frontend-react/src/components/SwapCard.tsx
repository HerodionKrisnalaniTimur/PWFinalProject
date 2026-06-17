import React, { useState, useEffect, useCallback } from "react";
import { ArrowDownUp, Info, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// JALUR IMPOR YANG BENAR & BERSIH (Murni memanggil fungsi aktif dari file service Anda)
import { fetchAllTokenBalances } from "../services/poolService";
import { fetchLiveTokenRate, executeOnChainMultiSwap } from "../services/swapService"; 
// Catatan: Jika folder Anda adalah src/services/swapService.ts, gunakan path di bawah ini:
// import { fetchLiveTokenRate, executeOnChainMultiSwap } from "../services/swapService";

interface SwapCardProps {
  walletAddress: string;
  connectWallet: () => Promise<void>;
}

const TOKENS = [
  { id: "USDT", name: "Mock USDT", color: "bg-green-500" },
  { id: "ZTX", name: "Zentrix Token", color: "bg-blue-600" },
  { id: "AGT", name: "Agate International", color: "bg-purple-600" },
  { id: "TOG", name: "Toge Productions", color: "bg-amber-600" },
  { id: "DGH", name: "Digital Happiness", color: "bg-red-500" },
  { id: "MJK", name: "Mojiken Studio", color: "bg-cyan-500" },
];

const SwapCard: React.FC<SwapCardProps> = ({ walletAddress, connectWallet }) => {
  const [tokenIn, setTokenIn] = useState<string>("USDT");
  const [tokenOut, setTokenOut] = useState<string>("ZTX");
  const [amount, setAmount] = useState<string>("");
  const [balances, setBalances] = useState<Record<string, string>>({});
  const [rates, setRates] = useState<Record<string, number>>({
    USDT: 1.0, ZTX: 0.7, AGT: 2.0, TOG: 1.5, DGH: 1.0, MJK: 0.5
  });
  const [txStatus, setTxStatus] = useState<{ type: string; message: string } | null>(null);

  // Fungsi pengambil data aman dibungkus useCallback agar lolos aturan React 19 Compiler
  const loadBlockchainData = useCallback(async (isMounted: boolean) => {
    if (!walletAddress) return;

    try {
      const realBalances = await fetchAllTokenBalances(walletAddress);
      const rateIn = await fetchLiveTokenRate(tokenIn);
      const rateOut = await fetchLiveTokenRate(tokenOut);
      
      if (isMounted) {
        const formattedBalances: Record<string, string> = {};
        Object.keys(realBalances).forEach((symbol) => {
          formattedBalances[symbol] = parseFloat(realBalances[symbol]).toFixed(2);
        });

        setBalances(formattedBalances);
        setRates((prev) => ({
          ...prev,
          [tokenIn]: rateIn,
          [tokenOut]: rateOut
        }));
      }
    } catch (error) {
      console.error("Gagal sinkronisasi data blockchain:", error);
    }
  }, [walletAddress, tokenIn, tokenOut]);

  // Hook efek terisolasi murni asinkron dengan cleanup flag
  useEffect(() => {
    let isMounted = true;

    if (walletAddress) {
      loadBlockchainData(isMounted);
    } else {
      setBalances({});
    }

    return () => {
      isMounted = false;
    };
  }, [walletAddress, loadBlockchainData]);

  const handleSwitchTokens = () => {
    setTokenIn(tokenOut);
    setTokenOut(tokenIn);
    setAmount("");
  };

  const calculateOutput = (): string => {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) return "0.0000";
    const rateIn = rates[tokenIn] || 1.0;
    const rateOut = rates[tokenOut] || 1.0;
    return ((Number(amount) * rateIn) / rateOut).toFixed(4);
  };

  const outputAmount = calculateOutput();
  const currentBalance = balances[tokenIn] || "0.00";
  const isInsufficientBalance = Number(amount) > Number(currentBalance);

  const handleSwapExecution = async () => {
    if (!walletAddress) {
      await connectWallet();
      return;
    }
    if (!amount || Number(amount) <= 0 || isInsufficientBalance) return;

    try {
      setTxStatus({
        type: "processing",
        message: `Meminta otorisasi transfer (Approve) ${tokenIn} dan mengirim transaksi swap ke Sepolia...`,
      });

      const receipt = await executeOnChainMultiSwap(tokenIn, tokenOut, amount);

      setTxStatus({
        type: "success",
        message: `Swap Berhasil! Anda menukar ${amount} ${tokenIn} menjadi ${outputAmount} ${tokenOut}.`,
      });

      const newTx = {
        id: receipt.hash || Date.now().toString(),
        tokenIn,
        tokenOut,
        amountIn: amount,
        amountOut: outputAmount,
        timestamp: new Date().toLocaleString("id-ID", { hour12: false }),
        status: "Success",
      };
      const existingHistory = JSON.parse(localStorage.getItem(`swap_history_${walletAddress}`) || "[]");
      localStorage.setItem(`swap_history_${walletAddress}`, JSON.stringify([newTx, ...existingHistory]));
      window.dispatchEvent(new Event("storage_history_updated"));

      setAmount("");
      await loadBlockchainData(true);
    } catch (error: any) {
      console.error("Kesalahan Swap On-Chain:", error);
      setTxStatus({ 
        type: "error", 
        message: error.message || "Transaksi dibatalkan atau eksekusi Smart Contract gagal." 
      });
    }
  };

  const getDirectRate = (): string => {
    const rateIn = rates[tokenIn] || 1.0;
    const rateOut = rates[tokenOut] || 1.0;
    return (rateIn / rateOut).toFixed(4);
  };

  return (
    <div className="w-full max-w-[440px] bg-white rounded-[32px] p-6 shadow-xl border border-gray-100 relative">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-gray-800">Swap Tokens</h3>
        <span className="text-[11px] bg-blue-50 text-blue-600 font-bold px-2.5 py-1 rounded-xl flex items-center gap-1">
          <Info size={12} /> Live Multi-Router
        </span>
      </div>

      {/* INPUT SEKTOR */}
      <div className="bg-[#F8F9FA] p-4 rounded-2xl border border-gray-100 mb-2">
        <div className="flex justify-between text-xs text-gray-400 font-semibold mb-2">
          <span>You Pay</span>
          <span>Balance: {currentBalance}</span>
        </div>
        <div className="flex gap-3 items-center">
          <input
            type="number"
            placeholder="0.0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            disabled={txStatus?.type === "processing"}
            className="w-full bg-transparent text-2xl font-bold text-gray-800 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
          <select
            value={tokenIn}
            onChange={(e) => {
              setTokenIn(e.target.value);
              if (e.target.value === tokenOut) setTokenOut(tokenIn);
            }}
            className="bg-white px-3 py-2 rounded-xl border border-gray-200 text-sm font-bold shadow-sm focus:outline-none cursor-pointer"
          >
            {TOKENS.map((t) => (
              <option key={t.id} value={t.id}>{t.id}</option>
            ))}
          </select>
        </div>
      </div>

      {/* REVERSE BUTTON */}
      <div className="flex justify-center -my-3 relative z-10">
        <motion.button
          onClick={handleSwitchTokens}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="bg-white p-2.5 rounded-xl shadow-md border border-gray-100 text-blue-600 hover:bg-gray-50 cursor-pointer"
        >
          <ArrowDownUp size={16} />
        </motion.button>
      </div>

      {/* OUTPUT SEKTOR */}
      <div className="bg-[#F8F9FA] p-4 rounded-2xl border border-gray-100 mt-2 mb-4">
        <div className="flex justify-between text-xs text-gray-400 font-semibold mb-2">
          <span>You Receive</span>
          <span>Balance: {balances[tokenOut] || "0.00"}</span>
        </div>
        <div className="flex gap-3 items-center">
          <div className="w-full text-2xl font-bold text-gray-800">{outputAmount}</div>
          <select
            value={tokenOut}
            onChange={(e) => {
              setTokenOut(e.target.value);
              if (e.target.value === tokenIn) setTokenIn(tokenOut);
            }}
            className="bg-white px-3 py-2 rounded-xl border border-gray-200 text-sm font-bold shadow-sm focus:outline-none cursor-pointer"
          >
            {TOKENS.map((t) => (
              <option key={t.id} value={t.id}>{t.id}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="px-2 py-2.5 bg-gray-50 rounded-xl border border-gray-100/70 space-y-1.5 text-xs text-gray-500 mb-5">
        <div className="flex justify-between">
          <span>Price Rate</span>
          <span className="font-bold text-gray-700">1 {tokenIn} = {getDirectRate()} {tokenOut}</span>
        </div>
      </div>

      {/* SUBMIT BUTTON */}
      <motion.button
        onClick={handleSwapExecution}
        disabled={txStatus?.type === "processing" || (!!walletAddress && (!amount || Number(amount) <= 0 || isInsufficientBalance))}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={`w-full py-4 rounded-2xl text-sm font-bold tracking-wide shadow-md flex items-center justify-center gap-2 cursor-pointer ${
          !walletAddress
            ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white"
            : isInsufficientBalance
            ? "bg-red-500 text-white opacity-90 cursor-not-allowed"
            : !amount || Number(amount) <= 0
            ? "bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200"
            : "bg-gradient-to-r from-emerald-600 to-teal-600 text-white"
        }`}
      >
        {txStatus?.type === "processing" && <Loader2 size={16} className="animate-spin" />}
        {!walletAddress ? "Connect Wallet" : isInsufficientBalance ? "Insufficient Balance" : !amount || Number(amount) <= 0 ? "Enter an Amount" : "Swap Assets Now"}
      </motion.button>

      {/* NOTIFICATION */}
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
              {txStatus.type !== "processing" && (
                <button onClick={() => setTxStatus(null)} className="mt-2 font-bold underline block opacity-80 hover:opacity-100 cursor-pointer">Dismiss</button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SwapCard;