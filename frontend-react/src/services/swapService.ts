import { ethers } from "ethers";
import { CONTRACT_ADDRESSES, getProviderOrSigner, ERC20_ABI } from "./poolService";

// ABI minimal untuk SimpleSwap Router Baru Anda
const MULTI_SWAP_ABI = [
  "function swap(address tokenIn, address tokenOut, uint256 amountIn) external",
  "function tokenRates(address tokenAddress) view returns (uint256)"
];

export const fetchLiveTokenRate = async (tokenSymbol: string): Promise<number> => {
  try {
    const provider = await getProviderOrSigner();
    const swapContract = new ethers.Contract(CONTRACT_ADDRESSES.POOL_CONTRACT, MULTI_SWAP_ABI, provider);
    const tokenAddress = CONTRACT_ADDRESSES[`TOKEN_${tokenSymbol}` as keyof typeof CONTRACT_ADDRESSES];
    
    if (!tokenAddress) return 1.0;
    
    const rateScaled = await swapContract.tokenRates(tokenAddress);
    return Number(rateScaled) / 100; // Kembalikan skala basis 100 ke desimal asli
  } catch (error) {
    console.error(`Gagal mengambil rate live ${tokenSymbol}:`, error);
    const fallbacks: Record<string, number> = { USDT: 1.0, ZTX: 0.7, AGT: 2.0, TOG: 1.5, DGH: 1.0, MJK: 0.5 };
    return fallbacks[tokenSymbol] || 1.0;
  }
};

export const executeOnChainMultiSwap = async (tokenInSymbol: string, tokenOutSymbol: string, amountInStr: string) => {
  const signer = await getProviderOrSigner(true);
  const amountInWei = ethers.parseEther(amountInStr);

  const tokenInAddress = CONTRACT_ADDRESSES[`TOKEN_${tokenInSymbol}` as keyof typeof CONTRACT_ADDRESSES];
  const tokenOutAddress = CONTRACT_ADDRESSES[`TOKEN_${tokenOutSymbol}` as keyof typeof CONTRACT_ADDRESSES];
  const poolAddress = CONTRACT_ADDRESSES.POOL_CONTRACT;

  if (!tokenInAddress || !tokenOutAddress) throw new Error("Alamat token tidak valid.");

  const tokenInContract = new ethers.Contract(tokenInAddress, ERC20_ABI, signer);
  const swapContract = new ethers.Contract(poolAddress, MULTI_SWAP_ABI, signer);

  console.log(`Meminta otorisasi transfer (Approve) untuk ${tokenInSymbol}...`);
  const txApprove = await tokenInContract.approve(poolAddress, amountInWei);
  await txApprove.wait();

  console.log(`Mengeksekusi swap ${tokenInSymbol} ⇄ ${tokenOutSymbol}...`);
  const txSwap = await swapContract.swap(tokenInAddress, tokenOutAddress, amountInWei);
  return await txSwap.wait();
};