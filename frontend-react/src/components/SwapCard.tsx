import { useState, useEffect } from 'react';
import { Settings, ArrowDown } from 'lucide-react';
import { ethers } from 'ethers'; // Pastikan ethers sudah ter-import

const AVAILABLE_TOKENS = ["ZTX", "USDT", "USDC"];

// Tambahkan Interface Props agar bisa menerima data walletAddress dari SwapPages
interface SwapCardProps {
  walletAddress?: string;
  connectWallet?: () => Promise<void>;
}

const SwapCard: React.FC<SwapCardProps> = ({ walletAddress, connectWallet }) => {
  const [amount, setAmount] = useState("");
  const [tokenIn, setTokenIn] = useState("ZTX");
  const [tokenOut, setTokenOut] = useState("USDT");
  const [isWrongNetwork, setIsWrongNetwork] = useState(false);

  const handleSwitch = () => {
    const temp = tokenIn;
    setTokenIn(tokenOut);
    setTokenOut(temp);
  };

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

  // FUNGSI UTAMA SWAP KE BLOCKCHAIN
  const handleSwapExecution = async () => {
    // Jika wallet belum terhubung, minta connect terlebih dahulu
    if (!walletAddress) {
      if (connectWallet) await connectWallet();
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      alert("Masukkan jumlah koin yang valid!");
      return;
    }

    try {
      // Inisialisasi Provider Ethers v6 dari MetaMask
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      // MEMASUKKAN ALAMAT KONTRAK HASIL DEPLOY ANDA
      const CONTRACT_ADDRESS = "0x502e5a583223e5020924332a05a18f324FdaE736";
      
      // Sesuaikan ABI dengan nama fungsi swap di dalam SimpleSwap.sol Anda
      const CONTRACT_ABI = [
        "function swapZtxForUsdt(uint256 amountIn) external returns (uint256)"
      ];

      const swapContract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      
      // Konversi input angka biasa ke format Wei (18 desimal)
      const amountInWei = ethers.parseEther(amount);

      console.log(`Mengirim perintah swap ke smart contract untuk ${amount} ZTX...`);
      
      // Memicu jendela popup MetaMask keluar
      const tx = await swapContract.swapZtxForUsdt(amountInWei);
      alert("Transaksi berhasil dikirim ke Sepolia Network! Menunggu konfirmasi block...");
      
      // Tunggu hingga transaksi dikonfirmasi oleh validator blockchain
      await tx.wait();
      alert("Selamat! Proses Swap Berhasil Masuk ke Block.");
      setAmount(""); // Reset form input
      
    } catch (error: any) {
      console.error("Detail Error Transaksi:", error);
      alert("Transaksi gagal: " + (error.reason || error.message));
    }
  };

  return (
    <div className="w-full max-w-[500px] bg-[#EFEFEF]/90 backdrop-blur-xl p-8 rounded-[40px] shadow-2xl border border-white/50">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold">Swap</h2>
        <Settings size={20} className="text-gray-400" />
      </div>

      {/* Input Token 1 */}
      <div className="bg-white/60 p-6 rounded-3xl border border-white shadow-inner mb-2">
        <div className="flex justify-between items-center mb-4 text-sm font-bold">
          <div className="relative flex items-center gap-2 bg-white px-3 py-1 rounded-full shadow-sm border">
            <div className="w-5 h-5 bg-blue-700 rounded-full text-white text-[10px] flex items-center justify-center shrink-0">Z</div>
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
          <span className="text-gray-400 font-medium">Balance: {walletAddress ? "100.00" : "0"}</span>
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

      {/* Input Token 2 */}
      <div className="bg-white/60 p-6 rounded-3xl border border-white shadow-inner mt-2 mb-8">
        <div className="flex justify-between items-center mb-4 text-sm font-bold">
          <div className="relative flex items-center gap-2 bg-white px-3 py-1 rounded-full shadow-sm border">
            <div className="w-5 h-5 bg-blue-400 rounded-full text-white text-[10px] flex items-center justify-center font-serif shrink-0">$</div>
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
          <span className="text-gray-400 font-medium">Balance: 0</span>
        </div>
        <div className="text-4xl font-medium text-gray-800">
          {amount ? (parseFloat(amount) * 1.5).toFixed(2) : "-"}
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