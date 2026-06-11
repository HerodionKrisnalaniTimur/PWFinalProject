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
  const [txStatus, setTxStatus] = useState<{ type: "idle" | "approving" | "swapping" | "success" | "error"; message: string }>({ type: "idle", message: "" });

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

  // Alamat kontrak — pastikan ini sesuai dengan kontrak yang ter-deploy di Sepolia
  const SWAP_CONTRACT_ADDRESS = "0x264a7a4EEB939aee5968A89d376E0c68cea1E295";
  const ZTX_TOKEN_ADDRESS = "0xBf7502475Cb5DB85077a89131a76De13638CccfD"; // ← Ganti dengan alamat token ZTX yang benar

  // Fitur utama untuk mengeksekusi proses swap dengan langkah-langkah yang jelas dan terstruktur
  const handleSwapExecution = async () => {
    if (!walletAddress) {
      if (connectWallet) await connectWallet();
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      setTxStatus({ type: "error", message: "Masukkan jumlah koin yang valid!" });
      return;
    }

    if (isWrongNetwork) {
      setTxStatus({ type: "error", message: "Harap ganti ke jaringan Sepolia Testnet terlebih dahulu!" });
      return;
    }

    if (tokenIn !== "ZTX" || tokenOut !== "USDT") {
      setTxStatus({ type: "error", message: "Pair ini belum didukung. Saat ini hanya ZTX → USDT yang aktif." });
      return;
    }

    setTxStatus({ type: "idle", message: "" });

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      // LANGKAH 0: Verifikasi alamat signer sesuai dengan walletAddress yang terhubung
      const signerAddress = await signer.getAddress();
      if (signerAddress.toLowerCase() !== walletAddress.toLowerCase()) {
        setTxStatus({
          type: "error",
          message: "Alamat wallet tidak cocok. Coba disconnect dan connect ulang MetaMask.",
        });
        return;
      }

      // LANGKAH 1: Verifikasi bahwa kode kontrak swap benar-benar ada di alamat tersebut
      const contractCode = await provider.getCode(SWAP_CONTRACT_ADDRESS);
      if (contractCode === "0x") {
        setTxStatus({
          type: "error",
          message: `Tidak ada kontrak di alamat ${SWAP_CONTRACT_ADDRESS}. Periksa kembali alamat kontrak swap Anda.`,
        });
        return;
      }

      const amountInWei = ethers.parseEther(amount);

      // =====================================================================
      // LANGKAH 2: APPROVE — Izinkan kontrak swap menarik token ZTX dari wallet
      // Ini adalah langkah yang sebelumnya hilang dan menjadi penyebab revert!
      // =====================================================================
      const erc20Abi = [
        "function approve(address spender, uint256 amount) external returns (bool)",
        "function allowance(address owner, address spender) external view returns (uint256)",
        "function balanceOf(address account) external view returns (uint256)",
      ];

      const ztxToken = new ethers.Contract(ZTX_TOKEN_ADDRESS, erc20Abi, signer);

      // Cek saldo ZTX cukup
      const balance = await ztxToken.balanceOf(signerAddress);
      if (balance < amountInWei) {
        setTxStatus({
          type: "error",
          message: `Saldo ZTX tidak cukup. Saldo Anda: ${ethers.formatEther(balance)} ZTX`,
        });
        return;
      }

      // Cek allowance yang sudah ada — jika sudah cukup, skip approve untuk hemat gas
      const currentAllowance = await ztxToken.allowance(signerAddress, SWAP_CONTRACT_ADDRESS);
      if (currentAllowance < amountInWei) {
        setTxStatus({ type: "approving", message: "Langkah 1/2: Konfirmasi izin (Approve) di MetaMask..." });
        const approveTx = await ztxToken.approve(SWAP_CONTRACT_ADDRESS, amountInWei);
        await approveTx.wait();
      }

      // =====================================================================
      // LANGKAH 3: SWAP — Sekarang eksekusi swap setelah approve berhasil
      // =====================================================================
      const swapAbi = [
        "function swapZtxForUsdt(uint256 amountIn) external returns (uint256)",
      ];

      const swapContract = new ethers.Contract(SWAP_CONTRACT_ADDRESS, swapAbi, signer);

      setTxStatus({ type: "swapping", message: "Langkah 2/2: Konfirmasi transaksi Swap di MetaMask..." });

      const tx = await swapContract.swapZtxForUsdt(amountInWei, {
        gasLimit: 300000,
      });

      setTxStatus({ type: "swapping", message: `Transaksi dikirim! Menunggu konfirmasi block Sepolia... (${tx.hash.slice(0, 10)}...)` });
      const receipt = await tx.wait();

      if (receipt.status === 0) {
        // Transaksi masuk block tapi tetap revert — kemungkinan kontrak kehabisan likuiditas
        setTxStatus({
          type: "error",
          message: "Swap di-revert oleh kontrak. Kemungkinan pool USDT kehabisan likuiditas. Periksa kontrak di Sepolia Etherscan.",
        });
        return;
      }

      setTxStatus({ type: "success", message: "🎉 Swap ZTX → USDT berhasil sempurna!" });
      setAmount("");

    } catch (error: any) {
      console.error("Detail Error Transaksi:", error);

      // Parsing error yang lebih informatif
      let userMessage = "Transaksi dibatalkan atau gagal.";
      if (error.code === "ACTION_REJECTED") {
        userMessage = "Transaksi ditolak oleh pengguna di MetaMask.";
      } else if (error.code === "CALL_EXCEPTION") {
        userMessage = "Kontrak me-revert transaksi. Pastikan: (1) alamat kontrak benar, (2) pool memiliki likuiditas USDT, (3) fungsi swapZtxForUsdt ada di ABI kontrak.";
      } else if (error.code === "INSUFFICIENT_FUNDS") {
        userMessage = "Saldo ETH tidak cukup untuk membayar gas.";
      } else if (error.reason) {
        userMessage = `Gagal: ${error.reason}`;
      } else if (error.message) {
        userMessage = `Gagal: ${error.message.slice(0, 120)}`;
      }

      setTxStatus({ type: "error", message: userMessage });
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
        <div className="flex items-start gap-2 bg-orange-50/50 p-4 rounded-2xl mb-4 border border-orange-100">
          <div className="w-5 h-5 bg-orange-400 rounded-full text-white flex items-center justify-center text-xs font-bold shrink-0">!</div>
          <p className="text-[11px] text-orange-700 font-semibold leading-relaxed">
            The current network is inconsistent - please switch your wallet to Sepolia Testnet!
          </p>
        </div>
      )}

      {/* Status Transaksi */}
      {txStatus.type !== "idle" && (
        <div className={`flex items-start gap-2 p-4 rounded-2xl mb-4 border text-[11px] font-semibold leading-relaxed ${
          txStatus.type === "success"
            ? "bg-green-50/70 border-green-100 text-green-700"
            : txStatus.type === "error"
            ? "bg-red-50/70 border-red-100 text-red-700"
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

      {/* BUTTON AKSI */}
      <button 
        onClick={handleSwapExecution}
        disabled={txStatus.type === "approving" || txStatus.type === "swapping"}
        className="w-full bg-[#3366FF] hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed text-white py-5 rounded-[24px] font-bold text-lg shadow-lg shadow-blue-200 transition-all active:scale-[0.98]"
      >
        {txStatus.type === "approving"
          ? "Menyetujui Token... (1/2)"
          : txStatus.type === "swapping"
          ? "Memproses Swap... (2/2)"
          : walletAddress
          ? "Execute Swap"
          : "Connect Wallet"}
      </button>
    </div>
  );
};

export default SwapCard;