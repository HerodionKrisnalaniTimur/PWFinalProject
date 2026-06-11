import { useState, useEffect } from 'react';
import { Settings, ArrowDown } from 'lucide-react';
import { getContractRate, executeUniversalSwap } from '../service/swapService';
import { fetchTokenBalances } from '../service/poolService';

interface SwapCardProps {
  walletAddress?: string;
  connectWallet?: () => Promise<void>;
}

const SwapCard: React.FC<SwapCardProps> = ({ walletAddress, connectWallet }) => {
  const [amount, setAmount] = useState("");
  const [tokenIn, setTokenIn] = useState("USDT"); 
  const [tokenOut, setTokenOut] = useState("ZTX");
  const [contractRate, setContractRate] = useState<number>(10);
  const [balances, setBalances] = useState({ ztx: "0.00", usdt: "0.00" });
  
  const [txStatus, setTxStatus] = useState<{ 
    type: "idle" | "approving" | "swapping" | "success" | "error"; 
    message: string 
  }>({ type: "idle", message: "" });

  const loadBalances = async (address: string) => {
    try {
      const userBalances = await fetchTokenBalances(address);
      setBalances({
        ztx: parseFloat(userBalances.ztx).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
        usdt: parseFloat(userBalances.usdt).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      });
    } catch (error) {
      console.error("Gagal memuat saldo:", error);
    }
  };

  useEffect(() => {
    const initData = async () => {
      const liveRate = await getContractRate();
      setContractRate(liveRate);
      if (walletAddress) {
        await loadBalances(walletAddress);
      }
    };
    initData();
  }, [walletAddress]);

  // Fungsi switch arah diaktifkan penuh tanpa memblokir input
  const handleSwitch = () => {
    const tempIn = tokenIn;
    setTokenIn(tokenOut);
    setTokenOut(tempIn);
    setAmount(""); 
    setTxStatus({ type: "idle", message: "" });
  };

  const calculateOutput = (): string => {
    if (!amount || isNaN(Number(amount))) return "0.0";
    
    if (tokenIn === "USDT" && tokenOut === "ZTX") {
      return (Number(amount) * contractRate).toFixed(2); 
    } else if (tokenIn === "ZTX" && tokenOut === "USDT") {
      return (Number(amount) / contractRate).toFixed(2); 
    }
    return amount;
  };

  const getDisplayBalance = (token: string) => {
    return token === "USDT" ? balances.usdt : balances.ztx;
  };

  const handleSwapExecution = async () => {
    if (!walletAddress) {
      if (connectWallet) await connectWallet();
      return;
    }

    if (!amount || Number(amount) <= 0) {
      setTxStatus({ type: "error", message: "Masukkan jumlah token yang valid!" });
      return;
    }

    // Validasi Saldo Sebelum Transaksi Menguras Gas Fee
    const rawBalance = tokenIn === "USDT" 
      ? parseFloat(balances.usdt.replace(/,/g, '')) 
      : parseFloat(balances.ztx.replace(/,/g, ''));

    if (Number(amount) > rawBalance) {
      setTxStatus({ type: "error", message: `Saldo ${tokenIn} Anda tidak mencukupi untuk melakukan swap!` });
      return;
    }

    try {
      setTxStatus({ 
        type: "approving", 
        message: `Langkah 1/2: Menyetujui batas transaksi ${tokenIn} Anda di MetaMask...` 
      });
      
      // Eksekusi Universal Dua Arah
      await executeUniversalSwap(tokenIn, amount);

      setTxStatus({ 
        type: "swapping", 
        message: "Langkah 2/2: Memfinalisasi pertukaran token di blockchain..." 
      });

      setTxStatus({ 
        type: "success", 
        message: `Swap Berhasil! Anda menukar ${amount} ${tokenIn} menjadi ${calculateOutput()} ${tokenOut}.` 
      });
      
      setAmount(""); 
      await loadBalances(walletAddress); // Update otomatis saldo dompet
    } catch (error: any) {
      console.error(error);
      setTxStatus({ 
        type: "error", 
        message: error.reason || error.message || "Transaksi dibatalkan atau terjadi kegagalan jaringan Sepolia." 
      });
    }
  };

  return (
    <div className="w-full max-w-[440px] bg-white/80 backdrop-blur-xl rounded-[32px] p-6 shadow-xl border border-white/50 relative overflow-hidden">
      
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-800 tracking-tight">Swap</h3>
        <button className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-500">
          <Settings size={20} />
        </button>
      </div>

      <div className="space-y-2 relative">
        {/* INPUT TOKEN ASAL */}
        <div className="bg-[#F4F6F9] p-4 rounded-2xl border border-transparent focus-within:border-blue-500/30 transition-all">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-semibold text-gray-400">You Pay</span>
            <span className="text-xs font-medium text-gray-400">
              Balance: <span className="text-gray-600 font-semibold">{getDisplayBalance(tokenIn)}</span>
            </span>
          </div>
          <div className="flex justify-between items-center">
            <input
              type="text"
              placeholder="0.0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              disabled={txStatus.type === "approving" || txStatus.type === "swapping"}
              className="w-2/3 bg-transparent text-2xl font-bold text-gray-800 outline-none placeholder-gray-400"
            />
            <div className="bg-white px-3 py-2 rounded-xl shadow-sm border border-gray-100 font-bold text-gray-700 text-sm">
              {tokenIn}
            </div>
          </div>
        </div>

        {/* TOMBOL ARROW SWITCH */}
        <div className="absolute left-1/2 top-[41%] -translate-x-1/2 -translate-y-1/2 z-10">
          <button 
            onClick={handleSwitch}
            className="bg-white p-2.5 rounded-xl shadow-md border border-gray-100 text-[#3366FF] hover:scale-110 active:scale-95 transition-all cursor-pointer"
          >
            <ArrowDown size={16} />
          </button>
        </div>

        {/* OUTPUT TOKEN TUJUAN */}
        <div className="bg-[#F4F6F9] p-4 rounded-2xl border border-transparent">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-semibold text-gray-400">You Receive</span>
            <span className="text-xs font-medium text-gray-400">
              Balance: <span className="text-gray-600 font-semibold">{getDisplayBalance(tokenOut)}</span>
            </span>
          </div>
          <div className="flex justify-between items-center">
            <p className="text-2xl font-bold text-gray-800">
              {calculateOutput()}
            </p>
            <div className="bg-white px-3 py-2 rounded-xl shadow-sm border border-gray-100 font-bold text-gray-700 text-sm">
              {tokenOut}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 px-2 flex justify-between items-center text-xs text-gray-400 font-medium">
        <span>Price Rate</span>
        {tokenIn === "USDT" ? (
          <span>1 USDT = {contractRate} ZTX</span>
        ) : (
          <span>1 ZTX = {(1 / contractRate).toFixed(2)} USDT</span>
        )}
      </div>

      {txStatus.type !== "idle" && (
        <div className={`mt-5 p-4 rounded-2xl flex gap-3 items-center border text-[11px] font-semibold leading-relaxed ${
          txStatus.type === "success" ? "bg-green-50/70 border-green-100 text-green-700"
            : txStatus.type === "error" ? "bg-red-50/70 border-red-100 text-red-700"
            : "bg-blue-50/70 border-blue-100 text-blue-700"
        }`}>
          <div className={`w-5 h-5 rounded-full text-white flex items-center justify-center text-xs font-bold shrink-0 ${
            txStatus.type === "success" ? "bg-green-400"
              : txStatus.type === "error" ? "bg-red-400"
              : "bg-blue-400 animate-pulse"
          }`}>
            {txStatus.type === "success" ? "✓" : txStatus.type === "error" ? "✕" : "…"}
          </div>
          <p>{txStatus.message}</p>
        </div>
      )}

      <button 
        onClick={handleSwapExecution}
        disabled={txStatus.type === "approving" || txStatus.type === "swapping"}
        className="w-full bg-[#3366FF] hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed text-white py-4 px-6 rounded-2xl font-bold mt-5 shadow-lg shadow-blue-500/20 transition-all active:scale-[0.99] cursor-pointer text-center text-sm"
      >
        {!walletAddress ? "Connect Wallet" 
          : txStatus.type === "approving" ? "Approving Tokens..." 
          : txStatus.type === "swapping" ? "Swapping..." 
          : "Swap Now"}
      </button>

    </div>
  );
};

export default SwapCard;