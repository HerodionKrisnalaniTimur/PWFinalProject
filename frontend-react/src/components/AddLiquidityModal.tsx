import React, { useState, useEffect } from "react";
import { X, ArrowDown, Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { fetchAllTokenBalances, executeAddLiquidity, getAllPools, addLiquidityHistory } from "../services/poolService";

interface AddLiquidityModalProps {
  isOpen: boolean;
  onClose: () => void;
  walletAddress: string;
  onSuccess: () => void;
}

const AddLiquidityModal: React.FC<AddLiquidityModalProps> = ({ isOpen, onClose, walletAddress, onSuccess }) => {
  const [selectedPool, setSelectedPool] = useState("USDT_ZTX");
  const [amount1, setAmount1] = useState("");
  const [amount2, setAmount2] = useState("");
  const [balances, setBalances] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const pools = getAllPools();
  const currentPool = pools.find(p => `${p.token1}_${p.token2}` === selectedPool) || pools[0];

  useEffect(() => {
    if (isOpen && walletAddress) {
      fetchAllTokenBalances(walletAddress).then((balances) => {
        const formattedBalances: Record<string, string> = {};
        Object.keys(balances).forEach(key => {
          formattedBalances[key] = parseFloat(balances[key]).toFixed(2);
        });
        setBalances(formattedBalances);
      });
    }
  }, [isOpen, walletAddress]);

  useEffect(() => {
    setAmount1("");
    setAmount2("");
  }, [selectedPool]);

  const handleAmount1Change = (val: string) => {
    setAmount1(val);
    if (val && !isNaN(parseFloat(val))) {
      setAmount2((parseFloat(val) * currentPool.ratio).toFixed(2));
    } else {
      setAmount2("");
    }
  };

  const handleAmount2Change = (val: string) => {
    setAmount2(val);
    if (val && !isNaN(parseFloat(val))) {
      setAmount1((parseFloat(val) / currentPool.ratio).toFixed(2));
    } else {
      setAmount1("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount1 || !amount2) return alert("Masukkan nominal dana!");

    setIsSubmitting(true);
    try {
      const result = await executeAddLiquidity(walletAddress, currentPool.token1, currentPool.token2, amount1, amount2);

      // Catat riwayat riil jika fungsi pembantu tersedia
      if (typeof addLiquidityHistory === "function") {
        addLiquidityHistory(
          walletAddress,
          currentPool.token1,
          currentPool.token2,
          parseFloat(amount1),
          parseFloat(amount2),
          result.hash
        );
      }

      alert("🎉 Sukses menyuntikkan likuiditas ke pool!");
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error(error);
      alert(error.reason || error.message || "Transaksi dibatalkan");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm"
          />

          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white rounded-[32px] w-full max-w-md p-6 shadow-2xl border z-10 relative text-[#1A1A1A]"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">Add Liquidity</h3>
              <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Pool Selector */}
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                <label className="text-xs font-semibold text-gray-400 mb-2 block">Select Pool Pair</label>
                <select
                  value={selectedPool}
                  onChange={(e) => setSelectedPool(e.target.value)}
                  className="w-full bg-white px-3 py-2 rounded-xl border border-gray-200 text-sm font-bold focus:outline-none"
                >
                  {pools.map(pool => (
                    <option key={`${pool.token1}_${pool.token2}`} value={`${pool.token1}_${pool.token2}`}>
                      {pool.token1} / {pool.token2}
                    </option>
                  ))}
                </select>
              </div>

              {/* Input Token 1 */}
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                <div className="flex justify-between text-xs font-semibold text-gray-400 mb-2">
                  <span>Deposit {currentPool.token1}</span>
                  <span>Balance: {balances[currentPool.token1] || "0.00"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    placeholder="0.0"
                    step="any"
                    className="bg-transparent text-2xl outline-none font-bold w-full"
                    value={amount1}
                    onChange={(e) => handleAmount1Change(e.target.value)}
                    disabled={isSubmitting}
                  />
                  <span className="bg-white px-3 py-1.5 rounded-xl text-sm font-bold shadow-sm border">
                    {currentPool.token1}
                  </span>
                </div>
              </div>

              <div className="flex justify-center -my-3">
                <div className="bg-white p-1.5 rounded-full border shadow-sm text-gray-300">
                  <ArrowDown size={14} />
                </div>
              </div>

              {/* Input Token 2 */}
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                <div className="flex justify-between text-xs font-semibold text-gray-400 mb-2">
                  <span>Deposit {currentPool.token2}</span>
                  <span>Balance: {balances[currentPool.token2] || "0.00"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    placeholder="0.0"
                    step="any"
                    className="bg-transparent text-2xl outline-none font-bold w-full"
                    value={amount2}
                    onChange={(e) => handleAmount2Change(e.target.value)}
                    disabled={isSubmitting}
                  />
                  <span className="bg-white px-3 py-1.5 rounded-xl text-sm font-bold shadow-sm border">
                    {currentPool.token2}
                  </span>
                </div>
              </div>

              {/* Info */}
              <div className="bg-blue-50/50 p-3.5 rounded-xl text-[11px] text-blue-700 font-medium flex gap-2 border border-blue-100/50">
                <Info size={16} className="shrink-0 mt-0.5" />
                <div>
                  <p>Pool Ratio: 1 {currentPool.token1} = {currentPool.ratio.toFixed(2)} {currentPool.token2}</p>
                  <p className="text-gray-400 mt-0.5">Dengan menyetor likuiditas, Anda akan mendapatkan bonus bagi hasil fee trading.</p>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white py-4 rounded-2xl font-bold text-base shadow-lg transition-all active:scale-[0.98] disabled:opacity-50"
              >
                {isSubmitting ? "Processing..." : "Supply & Provide Funds"}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default AddLiquidityModal;