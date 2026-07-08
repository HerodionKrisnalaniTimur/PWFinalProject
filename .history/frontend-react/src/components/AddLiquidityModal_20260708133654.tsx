import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  X,
  ArrowDown,
  Info,
  ChevronDown,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  fetchAllTokenBalances,
  executeAddLiquidity,
  getAllPools,
  addLiquidityHistory,
} from "../services/poolService";
import { usePoints } from "../context/PointsContext";

interface AddLiquidityModalProps {
  isOpen: boolean;
  onClose: () => void;
  walletAddress: string;
  onSuccess: () => void;
  defaultPool?: string;
}

interface PoolOption {
  id: string;
  token: string;
}

interface TxStatusState {
  type: "processing" | "success" | "error";
  message: string;
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
  defaultPool = "USDT",
}) => {
  const pools = useMemo<PoolOption[]>(() => getAllPools() as PoolOption[], []);
  const [selectedToken, setSelectedToken] = useState<string>(defaultPool);
  const [amount, setAmount] = useState<string>("");
  const [balances, setBalances] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [txStatus, setTxStatus] = useState<TxStatusState | null>(null);
  const [showToast, setShowToast] = useState(false);
  const { addActivity } = usePoints();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentPool =
    pools.find((p) => p.id === selectedToken || p.token === selectedToken) ||
    pools[0];

  useEffect(() => {
    setSelectedToken((prev) =>
      prev !== defaultPool ? defaultPool : prev
    );
  }, [defaultPool]);

  const refreshBalances = async () => {
    if (walletAddress && isOpen) {
      try {
        const updated = await fetchAllTokenBalances(walletAddress);
        setBalances(updated);
      } catch (err) {
        console.error("Gagal mengambil saldo terbaru:", err);
      }
    }
  };

  useEffect(() => {
    if (!isOpen) {
      setTxStatus(null);
      setIsDropdownOpen(false);
      return;
    }
    refreshBalances();
  }, [walletAddress, isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleAmountChange = (val: string) => {
    setAmount(val);
  };

  const handleSelectToken = (token: string) => {
    setSelectedToken(token);
    setIsDropdownOpen(false);
    setAmount("");
    setTxStatus(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!walletAddress || !selectedToken || !amount) return;

    const balance = Number(balances[selectedToken] || 0);
    const amountNumber = Number(amount);

    if (Number.isNaN(amountNumber) || amountNumber <= 0) {
      setTxStatus({
        type: "error",
        message: "Nominal likuiditas harus lebih dari 0.",
      });
      return;
    }

    if (amountNumber > balance) {
      setTxStatus({
        type: "error",
        message: `Saldo ${selectedToken} Anda tidak mencukupi untuk melakukan penyetoran likuiditas ini.`,
      });
      return;
    }

    setIsSubmitting(true);
    setTxStatus({
      type: "processing",
      message:
        "Menunggu konfirmasi tanda tangan/approval transaksi di dompet MetaMask Anda...",
    });

    try {
      const res = await executeAddLiquidity(
        walletAddress,
        selectedToken,
        amount
      );

      if (res && res.hash) {
        addLiquidityHistory(
          walletAddress,
          selectedToken,
          amountNumber,
          res.hash
        );
        addActivity(
          "Liquidity Pool",
          `Provided ${amount} ${selectedToken} liquidity`,
          150,
          walletAddress,
          "Sepolia Testnet"
        );

        setTxStatus({
          type: "success",
          message: `Sukses menambahkan likuiditas!\nTx Hash: ${res.hash.slice(
            0,
            10
          )}...${res.hash.slice(-8)}`,
        });

        setShowToast(true);
        setTimeout(() => setShowToast(false), 3500);
        setAmount("");

        await refreshBalances();
        onSuccess();
        onClose();
      } else {
        setTxStatus({
          type: "error",
          message: "Gagal mengeksekusi penambahan dana ke smart contract.",
        });
      }
    } catch (error: any) {
      console.error(error);

      if (error?.code === "ACTION_REJECTED") {
        setTxStatus({
          type: "error",
          message:
            "Transaksi ditolak atau dibatalkan oleh pengguna di dalam MetaMask.",
        });
      } else if (error?.message?.includes("insufficient funds")) {
        setTxStatus({
          type: "error",
          message:
            "Dana (Gas fee ETH / Sepolia) tidak mencukupi di dompet Anda untuk membayar biaya transaksi.",
        });
      } else {
        setTxStatus({
          type: "error",
          message:
            error?.reason ||
            error?.message ||
            "Terjadi kesalahan sistem saat memproses transaksi pada EVM Smart Contract.",
        });
      }
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
          className="absolute inset-0 bg-gray-900/40 backdrop-blur-md"
          onClick={onClose}
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="bg-white rounded-[32px] w-full max-w-md p-6 shadow-2xl relative border border-gray-100 z-10 max-h-[95vh] flex flex-col"
        >
          <div className="flex justify-between items-center mb-6 shrink-0">
            <div>
              <h3 className="text-xl font-extrabold text-gray-800">
                Add Liquidity
              </h3>
              <p className="text-xs text-gray-400 font-medium mt-0.5">
                Setor dana untuk mendapatkan trading fee
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-700 bg-gray-50 rounded-xl transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-4 overflow-y-auto flex-1 pr-1 custom-scrollbar"
          >
            <div className="space-y-1.5" ref={dropdownRef}>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wide px-1">
                Select Token
              </label>

              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsDropdownOpen((prev) => !prev)}
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-between bg-gray-50/70 border border-gray-200/80 p-3.5 rounded-2xl shadow-sm text-sm font-bold text-gray-800 hover:bg-gray-100/50 transition-all text-left cursor-pointer disabled:opacity-50"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-gray-100 border border-white flex items-center justify-center">
                      <div
                        className={`w-4 h-4 rounded-full ${getTokenColor(
                          currentPool?.token || selectedToken
                        )}`}
                      />
                    </div>
                    <span>{currentPool?.token || selectedToken}</span>
                  </div>
                  <ChevronDown
                    size={16}
                    className={`text-gray-400 transition-transform duration-200 ${
                      isDropdownOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                <AnimatePresence>
                  {isDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className="absolute left-0 right-0 mt-2 bg-white border border-gray-100 rounded-2xl shadow-xl z-50 p-1 max-h-48 overflow-y-auto"
                    >
                      {pools.map((p, idx) => {
                        const isSelected =
                          currentPool?.id === p.id || selectedToken === p.token;

                        return (
                          <button
                            key={`${p.id}_${idx}`}
                            type="button"
                            onClick={() => handleSelectToken(p.token)}
                            className={`flex items-center justify-between w-full px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                              isSelected
                                ? "bg-blue-50 text-blue-600"
                                : "text-gray-700 hover:bg-gray-50"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-4 h-4 rounded-full ${getTokenColor(
                                  p.token
                                )} flex items-center justify-center text-[7px] font-bold text-white`}
                              >
                                {p.token[0]}
                              </div>
                              <span>{p.token}</span>
                            </div>
                          </button>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <div className="bg-gray-50 border border-gray-100 p-4 rounded-2xl">
              <div className="flex justify-between text-xs text-gray-400 font-bold mb-2">
                <span>Input Amount</span>
                <span>
                  Balance:{" "}
                  <span className="text-gray-700 font-black">
                    {balances[currentPool?.token || selectedToken] || "0.00"}
                  </span>
                </span>
              </div>

              <div className="flex items-center justify-between gap-3">
                <input
                  type="number"
                  step="any"
                  placeholder="0.0"
                  className="bg-transparent text-xl font-black text-gray-800 outline-none w-full [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  value={amount}
                  onChange={(e) => handleAmountChange(e.target.value)}
                  disabled={isSubmitting}
                />
                <span className="bg-white px-3 py-1.5 rounded-xl text-xs font-bold shadow-sm border border-gray-100 text-gray-700">
                  {currentPool?.token || selectedToken}
                </span>
              </div>
            </div>

            <div className="bg-blue-50/50 p-3.5 rounded-2xl text-[11px] text-blue-700 font-medium flex gap-2 border border-blue-100/50">
              <Info size={16} className="shrink-0 mt-0.5 text-blue-500" />
              <div>
                <p className="font-bold">
                  Token Pool: {currentPool?.token || selectedToken}
                </p>
                <p className="text-gray-400 mt-0.5 font-normal">
                  Dengan menyetor likuiditas, Anda akan mendapatkan bonus bagi
                  hasil fee trading.
                </p>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !amount}
              className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white py-4 rounded-2xl font-bold text-base shadow-lg transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
            >
              {isSubmitting ? "Executing Transaction..." : "Supply & Provide Funds"}
            </button>
          </form>

          <AnimatePresence>
            {txStatus && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className={`mt-4 p-3.5 rounded-2xl flex items-start gap-2.5 border text-xs leading-relaxed shrink-0 ${
                  txStatus.type === "processing"
                    ? "bg-blue-50 border-blue-100 text-blue-700"
                    : txStatus.type === "success"
                    ? "bg-emerald-50 border-emerald-100 text-emerald-800"
                    : "bg-red-50 border-red-100 text-red-700"
                }`}
              >
                {txStatus.type === "processing" ? (
                  <Loader2
                    size={15}
                    className="animate-spin shrink-0 text-blue-500 mt-0.5"
                  />
                ) : txStatus.type === "success" ? (
                  <CheckCircle2
                    size={15}
                    className="shrink-0 text-emerald-600 mt-0.5"
                  />
                ) : (
                  <AlertCircle
                    size={15}
                    className="shrink-0 text-red-500 mt-0.5"
                  />
                )}
                <div className="whitespace-pre-line break-all">
                  {txStatus.message}
                </div>
              </motion.div>
            )}
            
          </AnimatePresence>
        </motion.div>
          <AnimatePresence>
          {showToast && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-5 py-3.5 rounded-2xl shadow-xl min-w-[280px] max-w-sm"
            >
              <div className="bg-white/20 rounded-full w-8 h-8 flex items-center justify-center shrink-0">
                <CheckCircle2 size={18} className="text-white" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-sm">Likuiditas Berhasil Ditambahkan!</p>
                <p className="text-xs text-white/75 mt-0.5">Dana Anda telah masuk ke pool</p>
              </div>
              <button
                type="button"
                onClick={() => setShowToast(false)}
                className="text-white/60 hover:text-white transition-colors"
              >
                <X size={15} />
              </button>
            </motion.div>
          )}
      </AnimatePresence>
      </div>
    </AnimatePresence>
  );
};

export default AddLiquidityModal;