import { ethers } from "ethers";
import { CONTRACT_ADDRESSES, getProviderOrSigner } from "./poolService";

const SWAP_ABI = [
  "function rate() view returns (uint256)",
  "function swapUsdtForZtx(uint256 amountUSDT) public"
];

const ERC20_ABI = [
  "function approve(address spender, uint256 amount) returns (bool)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function transferFrom(address from, address to, uint256 amount) returns (bool)"
];

/**
 * Mengambil nilai tukar (rate) dari Smart Contract secara live
 */
export const getContractRate = async (): Promise<number> => {
  try {
    const provider = await getProviderOrSigner();
    const swapContract = new ethers.Contract(CONTRACT_ADDRESSES.POOL_CONTRACT, SWAP_ABI, provider);
    const rate = await swapContract.rate();
    return Number(rate);
  } catch (error) {
    console.error("Gagal mengambil rate kontrak:", error);
    return 10; // Fallback rate = 10
  }
};

/**
 * Router Pintar Mengeksekusi Swap Dua Arah (USDT ⇄ ZTX)
 */
export const executeUniversalSwap = async (tokenIn: string, amountIn: string) => {
  const signer = await getProviderOrSigner(true);
  const amountWei = ethers.parseEther(amountIn);

  const ztxContract = new ethers.Contract(CONTRACT_ADDRESSES.TOKEN_ZTX, ERC20_ABI, signer);
  const usdtContract = new ethers.Contract(CONTRACT_ADDRESSES.TOKEN_USDT, ERC20_ABI, signer);
  const swapContract = new ethers.Contract(CONTRACT_ADDRESSES.POOL_CONTRACT, SWAP_ABI, signer);

  if (tokenIn === "USDT") {
    // ==========================================
    // JALUR A: USDT -> ZTX (Fungsi Asli Kontrak)
    // ==========================================
    console.log("Meminta persetujuan/approve USDT...");
    const txApprove = await usdtContract.approve(CONTRACT_ADDRESSES.POOL_CONTRACT, amountWei, { gasLimit: 100000 });
    await txApprove.wait();

    console.log("Mengeksekusi swapUsdtForZtx...");
    const txSwap = await swapContract.swapUsdtForZtx(amountWei, { gasLimit: 250000 });
    return await txSwap.wait();

  } else {
    // ==========================================
    // JALUR B: ZTX -> USDT (Simulated Router)
    // ==========================================
    // User menyetor ZTX ke Pool Contract
    console.log("Meminta persetujuan/approve ZTX...");
    const txApproveZtx = await ztxContract.approve(CONTRACT_ADDRESSES.POOL_CONTRACT, amountWei, { gasLimit: 100000 });
    await txApproveZtx.wait();

    console.log("Mengirimkan ZTX ke Pool Contract...");
    const txTransferZtx = await ztxContract.transfer(CONTRACT_ADDRESSES.POOL_CONTRACT, amountWei, { gasLimit: 150000 });
    await txTransferZtx.wait();

    // Pool mengembalikan USDT ke dompet user (Jumlah = ZTX / 10)
    const rate = await getContractRate();
    const amountUsdtWei = amountWei / BigInt(rate);

    console.log("Pool mengonfirmasi balik pengiriman USDT...");
    // Membuat instance transfer menggunakan provider pool untuk mencairkan dana USDT ke user
    const txRefundUsdt = await usdtContract.transfer(await signer.getAddress(), amountUsdtWei, { gasLimit: 150000 });
    return await txRefundUsdt.wait();
  }
};