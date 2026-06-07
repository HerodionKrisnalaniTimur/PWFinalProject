import { useState, useEffect } from 'react';
import { Settings, ArrowDown } from 'lucide-react';
import { ethers } from 'ethers';

const AVAILABLE_TOKENS = ["ZTX", "USDT", "USDC"];

interface SwapCardProps {
  walletAddress?: string;
  connectWallet?: () => Promise<void>;
}

const SwapCard: React.FC<SwapCardProps> = ({ walletAddress, connectWallet }) => {
  const [amount, setAmount] = useState("");
  const [tokenIn, setTokenIn] = useState("ZTX");
  const [tokenOut, setTokenOut] = useState("USDT");
  const [isWrongNetwork, setIsWrongNetwork] = useState(false);
  
  // State untuk melacak rasio harga dinamis
  const [exchangeRate, setExchangeRate] = useState<number>(1.5);

  const handleSwitch = () => {
    const temp = tokenIn;
    setTokenIn(tokenOut);
    setTokenOut(temp);
  };

  // 1. SINKRONISASI DROPDOWN & HARGA OTOMATIS
  useEffect(() => {
    if (tokenIn === tokenOut) {
      setExchangeRate(1);
      return;
    }
    // Mengatur rasio harga secara dinamis berdasarkan koin yang dipilih user
    if (tokenIn === "ZTX" && (tokenOut === "USDT" || tokenOut === "USDC")) {
      setExchangeRate(1.5); // 1 ZTX = 1.5 USDT/USDC
    } else if ((tokenIn === "USDT" || tokenIn === "USDC") && tokenOut === "ZTX") {
      setExchangeRate(1 / 1.5); // 1 USDT = 0.66 ZTX
    } else {
      setExchangeRate(1); // USDT <-> USDC (1:1)
    }
  }, [tokenIn, tokenOut]);

  // VALIDASI JARINGAN SEPOLIA AKTIF
  useEffect(() => {
    const checkNetwork = async () => {
      if (typeof window !== "undefined" && window.ethereum && walletAddress) {
        try {
          const chainId = await window.ethereum.request({ method: 'eth_chainId' });
          const isSepolia = chainId.toLowerCase() === "0xaa36a7" || chainId === "11155111";
          setIsWrongNetwork(!isSepolia);
        } catch (err) {
          console.error("Gagal mendeteksi network:", err);
        }
      } else {
        setIsWrongNetwork(false);
      }
    };
    checkNetwork();
  }, [walletAddress]);

//Fitur utama untuk mengeksekusi proses swap dengan langkah-langkah yang jelas dan terstruktur
const handleSwapExecution = async () => {
    if (!walletAddress) {
      if (connectWallet) await connectWallet();
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      alert("Masukkan jumlah koin yang valid!");
      return;
    }

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      // DEFINISI ALAMAT KONTRAK SECARA TEGAS
      const ADDR_SIMPLE_SWAP = "0x502e5a583223e5020924332a05a18f324FdaE736"; // Tempat Tukar Koin
      const ADDR_TOKEN_ZTX  = "0x1a5654F13E8691EBba39EC99fd940e4C6632786e"; // Kontrak Koin ZTX

      if (tokenIn !== "ZTX" || tokenOut !== "USDT") {
        alert("Smart contract SimpleSwap saat ini dikonfigurasi khusus untuk pair ZTX ke USDT.");
        return;
      }

      const amountInWei = ethers.parseEther(amount);

      // =================================================================
      // PROSES 1: PERSETUJUAN (APPROVE) TOKEN ZTX
      // =================================================================
      const erc20Abi = [
        "function allowance(address owner, address spender) view returns (uint256)",
        "function approve(address spender, uint256 amount) returns (bool)"
      ];
      
      const ztxContractInstance = new ethers.Contract(ADDR_TOKEN_ZTX, erc20Abi, signer);
      
      console.log("Memeriksa izin allowance token ZTX...");
      let currentAllowance = BigInt(0);
      try {
        currentAllowance = await ztxContractInstance.allowance(walletAddress, ADDR_SIMPLE_SWAP);
      } catch (e) {
        console.log("Gagal membaca allowance, abaikan dan lanjut approve.");
      }

      if (currentAllowance < amountInWei) {
   
        
        // Panggil fungsi approve langsung dari instance kontrak token ZTX
        const txApprove = await ztxContractInstance.approve(
          ADDR_SIMPLE_SWAP, 
          ethers.parseEther("1000000"), // Beri izin limit besar agar tidak berulang
          { gasLimit: 120000 }
        );
        
        alert("Menunggu konfirmasi persetujuan dari blockchain Sepolia...");
        await txApprove.wait();
        alert("Persetujuan Berhasil! Lanjut ke Langkah 2...");
      }

      // =================================================================
      // PROSES 2: TRANSAKSI SWAP UTAMA (MENGGUNAKAN INSTANCE KONTRAK SEPARASI)
      // =================================================================
      const swapAbi = [
        "function swapZtxForUsdt(uint256 amountIn) external returns (uint256)"
      ];

      // Inisialisasi kontrak baru yang terpisah total agar aman
      const swapContractInstance = new ethers.Contract(ADDR_SIMPLE_SWAP, swapAbi, signer);

      

      // Panggil fungsi swapZtxForUsdt dari instance kontrak SimpleSwap
      const txSwap = await swapContractInstance.swapZtxForUsdt(amountInWei, {
        gasLimit: 350000 
      });

      alert("Transaksi Swap terkirim! Menunggu konfirmasi block...");
      await txSwap.wait();
      
      alert("🎉 Selamat! Proses Swap ZTX ke USDT Berhasil Sempurna.");
      setAmount(""); // Reset input form
      
    } catch (error: any) {
      console.error("Detail Error Transaksi:", error);
      alert("Transaksi gagal: " + (error.reason || error.message || "Dibatalkan"));
    }
  };
  // Menghitung hasil konversi otomatis secara real-time
  const calculatedOutput = amount ? (parseFloat(amount) * exchangeRate) : 0;

  return (
    <div className="w-full max-w-[500px] bg-[#EFEFEF]/90 backdrop-blur-xl p-8 rounded-[40px] shadow-2xl border border-white/50">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold">Swap</h2>
        <Settings size={20} className="text-gray-400" />
      </div>

      {/* Input Token 1 (Asal) */}
      <div className="bg-white/60 p-6 rounded-3xl border border-white shadow-inner mb-2">
        <div className="flex justify-between items-center mb-4 text-sm font-bold">
          <div className="relative flex items-center gap-2 bg-white px-3 py-1 rounded-full shadow-sm border">
            <div className="w-5 h-5 bg-blue-700 rounded-full text-white text-[10px] flex items-center justify-center shrink-0">
              {tokenIn === "ZTX" ? "Z" : "$"}
            </div>
            <select 
              value={tokenIn}
              onChange={(e) => setTokenIn(e.target.value)}
              className="appearance-none bg-transparent outline-none font-bold cursor-pointer pr-4 z-10"
            >
              {AVAILABLE_TOKENS.map(token => (
                <option key={`in-${token}`} value={token}>{token}</option>
              ))}
            </select>
            <span className="text-[8px] text-gray-400 absolute right-3 pointer-events-none">▼</span>
          </div>
          <span className="text-gray-400 font-medium">Balance: {walletAddress ? (tokenIn === "ZTX" ? "500.00" : "100.00") : "0"}</span>
        </div>
        <input 
          type="number" 
          placeholder="0.00" 
          className="bg-transparent text-4xl w-full outline-none font-medium placeholder:text-gray-300"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
      </div>

      {/* Switch Icon */}
      <div className="flex justify-center -my-6 relative z-20">
        <div onClick={handleSwitch} className="bg-white p-3 rounded-2xl shadow-lg border border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors">
          <ArrowDown size={18} className="text-gray-400" />
        </div>
      </div>

      {/* Input Token 2 (Tujuan - Ter-sinkronisasi Otomatis) */}
      <div className="bg-white/60 p-6 rounded-3xl border border-white shadow-inner mt-2 mb-8">
        <div className="flex justify-between items-center mb-4 text-sm font-bold">
          <div className="relative flex items-center gap-2 bg-white px-3 py-1 rounded-full shadow-sm border">
            <div className="w-5 h-5 bg-blue-400 rounded-full text-white text-[10px] flex items-center justify-center font-serif shrink-0">
              {tokenOut === "ZTX" ? "Z" : "$"}
            </div>
            <select 
              value={tokenOut}
              onChange={(e) => setTokenOut(e.target.value)}
              className="appearance-none bg-transparent outline-none font-bold cursor-pointer pr-4 z-10"
            >
              {AVAILABLE_TOKENS.map(token => (
                <option key={`out-${token}`} value={token}>{token}</option>
              ))}
            </select>
            <span className="text-[8px] text-gray-400 absolute right-3 pointer-events-none">▼</span>
          </div>
          <span className="text-gray-400 font-medium">Balance: {walletAddress ? (tokenOut === "USDT" ? "500.00" : "0.00") : "0"}</span>
        </div>
        <div className="text-4xl font-medium text-gray-800">
          {amount ? calculatedOutput.toFixed(2) : "0.00"}
        </div>
      </div>

      {/* Warning Network */}
      {isWrongNetwork && (
        <div className="flex items-start gap-2 bg-orange-50/50 p-4 rounded-2xl mb-6 border border-orange-100">
          <div className="w-5 h-5 bg-orange-400 rounded-full text-white flex items-center justify-center text-xs font-bold shrink-0">!</div>
          <p className="text-[11px] text-orange-700 font-semibold leading-relaxed">
            The current network is inconsistent - please switch your wallet to Sepolia Testnet!
          </p>
        </div>
      )}

      {/* BUTTON AKSI */}
      <button 
        onClick={handleSwapExecution}
        className="w-full bg-[#3366FF] hover:bg-blue-700 text-white py-5 rounded-[24px] font-bold text-lg shadow-lg shadow-blue-200 transition-all active:scale-[0.98]"
      >
        {walletAddress ? "Execute Swap" : "Connect Wallet"}
      </button>
    </div>
  );
};

export default SwapCard;