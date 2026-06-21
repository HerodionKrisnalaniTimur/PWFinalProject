import React, { useState, useEffect, useRef } from "react";
import { X, ArrowDown, Info, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { fetchAllTokenBalances, executeAddLiquidity, getAllPools, addLiquidityHistory } from "../services/poolService";

interface AddLiquidityModalProps {
  isOpen: boolean;
  onClose: () => void;
  walletAddress: string;
  onSuccess: () => void;
  defaultPool?: string;
}

const getTokenColor = (symbol: string): string => {
  const colors: Record<string, string> = {
    USDT: "bg-green-500",
    ZTX: "bg-blue-600",
    AGT: "bg-purple-600",
    TOG: "bg-amber-600",
    DGH: "bg-red-500",
    MJK: "bg-cyan-500",
  };
  return colors[symbol] || "bg-gray-500";
};

const AddLiquidityModal: React.FC<AddLiquidityModalProps> = ({ 
  isOpen, 
  onClose, 
  walletAddress, 
  onSuccess,
  defaultPool = "USDT_ZTX"
}) => {
  const [selectedPool, setSelectedPool] = useState(defaultPool);
  const [amount1, setAmount1] = useState("");
  const [amount2, setAmount2] = useState("");
  const [balances, setBalances] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const pools = getAllPools();
  const currentPool = pools.find(p => `${p.token1}_${p.token2}` === selectedPool) || pools[0];

  useEffect(() => {
    setSelectedPool(defaultPool);
  }, [defaultPool]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && walletAddress) {
      fetchAllTokenBalances(walletAddress).then(setBalances);
    }
  }, [isOpen, walletAddress]);

  const handleAmount1Change = (val: string) => {
    setAmount1(val);
    if (!val || isNaN(Number(val))) {
      setAmount2("");
    } else {
      setAmount2((Number(val) * currentPool.ratio).toFixed(4));
    }
  };

  const handleAmount2Change = (val: string) => {
    setAmount2(val);
    if (!val || isNaN(Number(val))) {
      setAmount1("");
    } else {
      setAmount1((Number(val) / currentPool.ratio).toFixed(4));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!walletAddress || !amount1 || !amount2) return;

    const bal1 = Number(balances[currentPool.token1] || 0);
    const bal2 = Number(balances[currentPool.token2] || 0);

    if (Number(amount1) > bal1 || Number(amount2) > bal2) {
      alert(`Saldo Anda tidak mencukupi untuk menambahkan likuiditas pada pool ini.`);
      return;
    }

    setIsSubmitting(true);
    try {
      // PERBAIKAN: Mengirim string langsung (amount1 & amount2) tanpa Number()
      // agar ethers.parseEther() di poolService tidak error INVALID_ARGUMENT
      const res = await executeAddLiquidity(
        walletAddress,
        currentPool.token1,
        currentPool.token2,
        amount1, 
        amount2  
      );

      if (res && res.hash) {
        // Di sini tetap menggunakan Number() karena fungsi addLiquidityHistory membutuhkan format angka
        addLiquidityHistory(
          walletAddress,
          currentPool.token1,
          currentPool.token2,
          Number(amount1),
          Number(amount2),
          res.hash
        );
        alert("Likuiditas Berhasil Ditambahkan ke Pool!");
        setAmount1("");
        setAmount2("");
        onSuccess();
        onClose();
      } else {
        alert("Gagal mengeksekusi penambahan dana.");
      }
    } catch (error) {
      console.error(error);
      alert("Terjadi kesalahan sistem saat transaksi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
          onClick={onClose}
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="bg-white rounded-[32px] w-full max-w-md p-6 shadow-2xl relative border border-gray-100 z-10"
        >
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-xl font-extrabold text-gray-800">Add Liquidity</h3>
              <p className="text-xs text-gray-400 font-medium mt-0.5">Setor dana untuk mendapatkan trading fee</p>
            </div>
            <button 
              type="button"
              onClick={onClose} 
              className="p-2 text-gray-400 hover:text-gray-700 bg-gray-50 rounded-xl transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Custom Dropdown Pool Pair */}
            <div className="space-y-1.5" ref={dropdownRef}>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wide px-1">
                Select Pair Pool
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-between bg-gray-50/70 border border-gray-200/80 p-3.5 rounded-2xl shadow-sm text-sm font-bold text-gray-800 hover:bg-gray-100/50 transition-all text-left cursor-pointer disabled:opacity-50"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex -space-x-2">
                      <div className={`w-5 h-5 rounded-full ${getTokenColor(currentPool.token1)} border border-white flex items-center justify-center text-[8px] font-bold text-white`}>
                        {currentPool.token1[0]}
                      </div>
                      <div className={`w-5 h-5 rounded-full ${getTokenColor(currentPool.token2)} border border-white flex items-center justify-center text-[8px] font-bold text-white`}>
                        {currentPool.token2[0]}
                      </div>
                    </div>
                    <span>{currentPool.token1} / {currentPool.token2} Pool</span>
                  </div>
                  <ChevronDown size={16} className={`text-gray-400 transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""}`} />
                </button>

                <AnimatePresence>
                  {isDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className="absolute left-0 right-0 mt-2 bg-white border border-gray-100 rounded-2xl shadow-xl z-50 p-1 max-h-60 overflow-y-auto"
                    >
                      {pools.map((p) => {
                        const poolKey = `${p.token1}_${p.token2}`;
                        const isSelected = selectedPool === poolKey;
                        return (
                          <button
                            key={poolKey}
                            type="button"
                            onClick={() => {
                              setSelectedPool(poolKey);
                              setIsDropdownOpen(false);
                              setAmount1("");
                              setAmount2("");
                            }}
                            className={`flex items-center justify-between w-full px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                              isSelected ? "bg-blue-50 text-blue-600" : "text-gray-700 hover:bg-gray-50"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className="flex -space-x-2">
                                <div className={`w-4 h-4 rounded-full ${getTokenColor(p.token1)} flex items-center justify-center text-[7px] font-bold text-white`}>
                                  {p.token1[0]}
                                </div>
                                <div className={`w-4 h-4 rounded-full ${getTokenColor(p.token2)} flex items-center justify-center text-[7px] font-bold text-white`}>
                                  {p.token2[0]}
                                </div>
                              </div>
                              <span>{p.token1} / {p.token2}</span>
                            </div>
                            <span className="text-[10px] text-gray-400 font-normal">Ratio: {p.ratio.toFixed(2)}</span>
                          </button>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Input Token 1 */}
            <div className="bg-gray-50 border border-gray-100 p-4 rounded-2xl">
              <div className="flex justify-between text-xs text-gray-400 font-bold mb-2">
                <span>Input Amount</span>
                <span>Balance: {balances[currentPool.token1] || "0.00"}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <input
                  type="number"
                  placeholder="0.0"
                  className="bg-transparent text-xl font-black text-gray-800 outline-none w-full [appearance:textfield] [&::-webkit-outer-spin-button]:margin-0 [&::-webkit-inner-spin-button]:margin-0"
                  value={amount1}
                  onChange={(e) => handleAmount1Change(e.target.value)}
                  disabled={isSubmitting}
                />
                <span className="bg-white px-3 py-1.5 rounded-xl text-xs font-bold shadow-sm border border-gray-100 text-gray-700">
                  {currentPool.token1}
                </span>
              </div>
            </div>

            {/* Separator icon */}
            <div className="flex justify-center -my-2 relative z-10">
              <div className="bg-white border border-gray-100 p-2 rounded-full shadow-sm text-gray-400">
                <ArrowDown size={14} />
              </div>
            </div>

            {/* Input Token 2 */}
            <div className="bg-gray-50 border border-gray-100 p-4 rounded-2xl">
              <div className="flex justify-between text-xs text-gray-400 font-bold mb-2">
                <span>Input Amount (Estimated)</span>
                <span>Balance: {balances[currentPool.token2] || "0.00"}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <input
                  type="number"
                  placeholder="0.0"
                  className="bg-transparent text-xl font-black text-gray-800 outline-none w-full [appearance:textfield] [&::-webkit-outer-spin-button]:margin-0 [&::-webkit-inner-spin-button]:margin-0"
                  value={amount2}
                  onChange={(e) => handleAmount2Change(e.target.value)}
                  disabled={isSubmitting}
                />
                <span className="bg-white px-3 py-1.5 rounded-xl text-xs font-bold shadow-sm border border-gray-100 text-gray-700">
                  {currentPool.token2}
                </span>
              </div>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50/50 p-3.5 rounded-2xl text-[11px] text-blue-700 font-medium flex gap-2 border border-blue-100/50">
              <Info size={16} className="shrink-0 mt-0.5" />
              <div>
                <p>Pool Ratio: 1 {currentPool.token1} = {currentPool.ratio.toFixed(2)} {currentPool.token2}</p>
                <p className="text-gray-400 mt-0.5">Dengan menyetor likuiditas, Anda akan mendapatkan bonus bagi hasil fee trading.</p>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white py-4 rounded-2xl font-bold text-base shadow-lg transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? "Processing..." : "Supply & Provide Funds"}
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AddLiquidityModal;