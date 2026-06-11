import React, { useState, useEffect } from "react";
import { X, ArrowDown, Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { fetchTokenBalances, executeAddLiquidity } from "../service/poolService";

interface AddLiquidityModalProps {
  isOpen: boolean;
  onClose: () => void;
  walletAddress: string;
  onSuccess: () => void;
}

const AddLiquidityModal: React.FC<AddLiquidityModalProps> = ({ isOpen, onClose, walletAddress, onSuccess }) => {
  const [amountZtx, setAmountZtx] = useState("");
  const [amountUsdt, setAmountUsdt] = useState("");
  const [balances, setBalances] = useState({ ztx: "0.00", usdt: "0.00" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load saldo riil saat modal dibuka
  useEffect(() => {
    if (isOpen && walletAddress) {
      fetchTokenBalances(walletAddress).then(setBalances);
    }
  }, [isOpen, walletAddress]);

const handleConfirm = async () => {
  try {
    if (!amountZtx || !amountUsdt) {
      alert("Silakan masukkan jumlah token terlebih dahulu!");
      return;
    }

    // Panggil fungsi service yang sudah kita bypass gas-nya kemarin
    await executeAddLiquidity(walletAddress, amountZtx, amountUsdt);
    
    alert("Likuiditas berhasil ditambahkan!");
    onClose(); // Tutup modal
  } catch (error: any) {
    console.error("Detail Error di Modal:", error);
    alert("Transaksi gagal! Periksa konsol browser untuk detail.");
  }
};
  const handleZtxChange = (val: string) => {
    setAmountZtx(val);
    if (val && !isNaN(parseFloat(val))) {
      setAmountUsdt((parseFloat(val) * 1.5).toFixed(2));
    } else {
      setAmountUsdt("");
    }
  };

  const handleUsdtChange = (val: string) => {
    setAmountUsdt(val);
    if (val && !isNaN(parseFloat(val))) {
      setAmountZtx((parseFloat(val) / 1.5).toFixed(2));
    } else {
      setAmountZtx("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amountZtx || !amountUsdt) return alert("Masukkan nominal dana!");
    
    setIsSubmitting(true);
    try {
      await executeAddLiquidity(walletAddress, amountZtx, amountUsdt);
      alert("🎉 Sukses menyuntikkan likuiditas ke Zentrix Pool!");
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
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose} className="fixed inset-0 bg-black/40 backdrop-blur-sm"
          />

          {/* Modal Card */}
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white rounded-[32px] w-full max-w-md p-6 shadow-2xl border z-10 relative text-[#1A1A1A]"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">Add Liquidity</h3>
              <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Input Koin 1: ZTX */}
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                <div className="flex justify-between text-xs font-semibold text-gray-400 mb-2">
                  <span>Deposit Token 1</span>
                  <span>Balance: {balances.ztx}</span>
                </div>
                <div className="flex items-center gap-2">
                  <input 
                    type="number" placeholder="0.0" step="any" className="bg-transparent text-2xl outline-none font-bold w-full"
                    value={amountZtx} onChange={(e) => handleZtxChange(e.target.value)} disabled={isSubmitting}
                  />
                  <span className="bg-white px-3 py-1.5 rounded-xl text-sm font-bold shadow-sm border">ZTX</span>
                </div>
              </div>

              <div className="flex justify-center -my-3">
                <div className="bg-white p-1.5 rounded-full border shadow-sm text-gray-300"><ArrowDown size={14} /></div>
              </div>

              {/* Input Koin 2: USDT */}
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                <div className="flex justify-between text-xs font-semibold text-gray-400 mb-2">
                  <span>Deposit Token 2 (Paired)</span>
                  <span>Balance: {balances.usdt}</span>
                </div>
                <div className="flex items-center gap-2">
                  <input 
                    type="number" placeholder="0.0" step="any" className="bg-transparent text-2xl outline-none font-bold w-full"
                    value={amountUsdt} onChange={(e) => handleUsdtChange(e.target.value)} disabled={isSubmitting}
                  />
                  <span className="bg-white px-3 py-1.5 rounded-xl text-sm font-bold shadow-sm border">USDT</span>
                </div>
              </div>

              {/* Informasi Estimasi Rate & Share */}
              <div className="bg-blue-50/50 p-3.5 rounded-xl text-[11px] text-blue-700 font-medium flex gap-2 border border-blue-100/50">
                <Info size={16} className="shrink-0 mt-0.5" />
                <div>
                  <p>Rasio Kunci: 1 ZTX = 1.50 USDT</p>
                  <p className="text-gray-400 mt-0.5">Dengan menyetor likuiditas, Anda akan mendapatkan bonus bagi hasil fee trading dari setiap swap user.</p>
                </div>
              </div>

              <button 
                type="submit" disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white py-4 rounded-2xl font-bold text-base shadow-lg transition-all active:scale-[0.98] disabled:opacity-50"
              >
                {isSubmitting ? "Processing Blockchain Trans..." : "Supply & Provide Funds"}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default AddLiquidityModal;