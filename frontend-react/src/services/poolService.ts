import { ethers } from "ethers";

// 1. Konfigurasi Alamat Smart Contract Baru (Sesuaikan dengan hasil deploy terminal Anda)
export const CONTRACT_ADDRESSES = {
  POOL_CONTRACT: "0xc4049EF368100636729873Dc59261f6D6550bD0d", 
  TOKEN_USDT: "0x4eC1205c9299D5B07820Ca1E703ed5B949EBebec",    
  TOKEN_ZTX: "0xe0380d2266618Ce7e09b22e37cBDbDcF42c8A6cF",   
  TOKEN_AGT: "0x0F4775D0Bb70461b3005213a0B1e1dB4Cbe93C81",   
  TOKEN_TOG: "0x8C04CDC3E95c2090817d560956e3406bB01a0801",   
  TOKEN_DGH: "0x0FBd929Fa19f38ac66A6f87CF75f79FeF7a03069",   
  TOKEN_MJK: "0x270FF383D5C388A9b288E3B5458E2721f691A123",   
};

// 2. Deklarasi ABI Standard yang Diperluas
export const ERC20_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)"
];

// ABI Baru sesuai dengan fungsi kontrak SimpleSwap yang diperbarui
export const MULTI_POOL_ABI = [
  "function swap(address tokenIn, address tokenOut, uint256 amountIn) external",
  "function tokenRates(address tokenAddress) view returns (uint256)",
  "function isSupportedToken(address tokenAddress) view returns (bool)"
];

export const getProviderOrSigner = async (needSigner = false) => {
  if (typeof window === "undefined" || !window.ethereum) throw new Error("MetaMask belum terinstall");
  const provider = new ethers.BrowserProvider(window.ethereum);
  if (needSigner) return await provider.getSigner();
  return provider;
};

export const fetchAllTokenBalances = async (walletAddress: string) => {
  try {
    const provider = await getProviderOrSigner();

    // Siapkan instance contract untuk setiap token
    const contracts: Record<string, ethers.Contract> = {};
    const tokens = ["USDT", "ZTX", "AGT", "TOG", "DGH", "MJK"];

    tokens.forEach((symbol) => {
      const address = CONTRACT_ADDRESSES[`TOKEN_${symbol}` as keyof typeof CONTRACT_ADDRESSES];
      if (address) {
        contracts[symbol] = new ethers.Contract(address, ERC20_ABI, provider);
      }
    });

    // Panggil fungsi balanceOf secara paralel untuk menghemat performa network
    const balancesPromises = tokens.map(async (symbol) => {
      if (!contracts[symbol]) return { [symbol]: "0.00" };
      try {
        const balWei = await contracts[symbol].balanceOf(walletAddress);
        return { [symbol]: ethers.formatEther(balWei) };
      } catch {
        return { [symbol]: "0.00" };
      }
    });

    const results = await Promise.all(balancesPromises);
    return results.reduce((acc, current) => ({ ...acc, ...current }), {});
  } catch (error) {
    console.error("Gagal mengambil saldo multi-token:", error);
    return { USDT: "0.00", ZTX: "0.00", AGT: "0.00", TOG: "0.00", DGH: "0.00", MJK: "0.00" };
  }
};

export const executeAddLiquidity = async (walletAddress: string, amountZtx: string, amountUsdt: string) => {
  console.log(`Adding liquidity: ${amountZtx} ZTX + ${amountUsdt} USDT from ${walletAddress}`);
  throw new Error("Add Liquidity function not yet implemented");
};

export const fetchUserLiquidity = async (walletAddress: string) => {
  console.log(`Fetching user liquidity for ${walletAddress}`);
  return { ztx: 0, usdt: 0 };
};

export const fetchGlobalPoolStats = async () => {
  console.log("Fetching global pool stats");
  return { tvl: 0, apr: 24.8 };
};