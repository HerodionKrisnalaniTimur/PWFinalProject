import { ethers } from "ethers";

// 1. Konfigurasi Alamat Smart Contract Baru (Sesuaikan dengan hasil deploy terminal Anda)
export const CONTRACT_ADDRESSES = {
  POOL_CONTRACT: "0xb1EF5602F812D7a0199D9c2871Ac647a23319b57", 
  TOKEN_USDT: "0x9f3dC579BFFf4Ba22566711d40C1d7c4b5044294",    
  TOKEN_ZTX: "0x702B23606b5413361413B872c9A87FAa4ED4aB01",   
  TOKEN_AGT: "0x3d1471b8363cB7cC05653643D1E90cC801efE9a5",   
  TOKEN_TOG: "0x86B41B7913F4Aef9B87a4e5352Bc19200CCD4Eb3",   
  TOKEN_DGH: "0x450CE3467a8bDee4E15DE490A92fA7D07301C6C5",   
  TOKEN_MJK: "0xeA9331465117125Be948E0381970Df38bce50979",   
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


// Definisi semua pool pairs yang tersedia
const POOL_PAIRS = [
  { token1: "USDT", token2: "ZTX", ratio: 1.5 },
  { token1: "USDT", token2: "AGT", ratio: 0.5 },
  { token1: "USDT", token2: "TOG", ratio: 0.67 },
  { token1: "USDT", token2: "DGH", ratio: 1.0 },
  { token1: "USDT", token2: "MJK", ratio: 2.0 },
  { token1: "ZTX", token2: "AGT", ratio: 0.35 },
  { token1: "ZTX", token2: "TOG", ratio: 0.45 },
  { token1: "ZTX", token2: "DGH", ratio: 0.7 },
  { token1: "ZTX", token2: "MJK", ratio: 1.33 },
];

export const getAllPools = () => {
  return POOL_PAIRS;
};

export const executeAddLiquidity = async (
  walletAddress: string,
  token1Symbol: string,
  token2Symbol: string,
  amount1: string,
  amount2: string
) => {
  try {
    console.log(`Adding liquidity: ${amount1} ${token1Symbol} + ${amount2} ${token2Symbol} from ${walletAddress}`);

    const signer = await getProviderOrSigner(true);
    const poolAddress = CONTRACT_ADDRESSES.POOL_CONTRACT;

    const token1Address = CONTRACT_ADDRESSES[`TOKEN_${token1Symbol}` as keyof typeof CONTRACT_ADDRESSES];
    const token2Address = CONTRACT_ADDRESSES[`TOKEN_${token2Symbol}` as keyof typeof CONTRACT_ADDRESSES];

    if (!token1Address || !token2Address) throw new Error("Token address not found");

    const token1Contract = new ethers.Contract(token1Address, ERC20_ABI, signer);
    const token2Contract = new ethers.Contract(token2Address, ERC20_ABI, signer);

    const amount1Wei = ethers.parseEther(amount1);
    const amount2Wei = ethers.parseEther(amount2);

    // Approve token1
    console.log(`Approving ${amount1} ${token1Symbol}...`);
    let tx = await token1Contract.approve(poolAddress, amount1Wei);
    await tx.wait();

    // Approve token2
    console.log(`Approving ${amount2} ${token2Symbol}...`);
    tx = await token2Contract.approve(poolAddress, amount2Wei);
    await tx.wait();

    // TODO: Call addLiquidity function on smart contract when available
    console.log("Liquidity added successfully (mock)");
    return { hash: `0x${Date.now().toString(16)}` };
  } catch (error: any) {
    console.error("Add liquidity error:", error);
    throw error;
  }
};

export const fetchUserLiquidity = async (walletAddress: string) => {
  try {
    console.log(`Fetching user liquidity for ${walletAddress}`);
    // Mock data - akan di-update dengan data real dari smart contract
    const pairs = getAllPools();
    const liquidity: Record<string, { token1: string; token2: string; amount1: number; amount2: number }> = {};

    pairs.forEach((pair) => {
      const key = `${pair.token1}_${pair.token2}`;
      liquidity[key] = {
        token1: pair.token1,
        token2: pair.token2,
        amount1: 0,
        amount2: 0
      };
    });

    return liquidity;
  } catch (error) {
    console.error("Fetch user liquidity error:", error);
    return {};
  }
};

export const fetchGlobalPoolStats = async () => {
  console.log("Fetching global pool stats");
  return { tvl: 0, apr: 24.8 };
};

// History Management Functions
export interface LiquidityHistoryItem {
  id: string;
  token1: string;
  token2: string;
  amount1: number;
  amount2: number;
  type: "add" | "remove";
  timestamp: string;
  txHash?: string;
}

export const getLiquidityHistory = (walletAddress: string): LiquidityHistoryItem[] => {
  if (typeof window === "undefined") return [];
  try {
    const history = localStorage.getItem(`liquidity_history_${walletAddress}`);
    return history ? JSON.parse(history) : [];
  } catch {
    return [];
  }
};

export const addLiquidityHistory = (
  walletAddress: string,
  token1: string,
  token2: string,
  amount1: number,
  amount2: number,
  txHash?: string
) => {
  if (typeof window === "undefined") return;
  try {
    const history = getLiquidityHistory(walletAddress);
    const newItem: LiquidityHistoryItem = {
      id: Date.now().toString(),
      token1,
      token2,
      amount1,
      amount2,
      type: "add",
      timestamp: new Date().toLocaleString("id-ID", { hour12: false }),
      txHash,
    };
    const updated = [newItem, ...history];
    localStorage.setItem(`liquidity_history_${walletAddress}`, JSON.stringify(updated));
    window.dispatchEvent(new Event("liquidity_history_updated"));
  } catch (error) {
    console.error("Error saving liquidity history:", error);
  }
};

export const calculateTotalStats = (walletAddress: string) => {
  try {
    const history = getLiquidityHistory(walletAddress);
    let tvl = 0;
    let totalPairs = new Set<string>();

    history.forEach((item) => {
      if (item.type === "add") {
        tvl += item.amount1 + item.amount2;
        totalPairs.add(`${item.token1}_${item.token2}`);
      }
    });

    return {
      tvl: tvl,
      apr: 24.8,
      activePositions: totalPairs.size,
    };
  } catch (error) {
    console.error("Error calculating stats:", error);
    return { tvl: 0, apr: 24.8, activePositions: 0 };
  }
};

export const getUserPositionsFromHistory = (
  walletAddress: string
): Record<string, { token1: string; token2: string; amount1: number; amount2: number }> => {
  try {
    const history = getLiquidityHistory(walletAddress);
    const positions: Record<string, { token1: string; token2: string; amount1: number; amount2: number }> = {};

    history.forEach((item) => {
      const key = `${item.token1}_${item.token2}`;
      if (!positions[key]) {
        positions[key] = { token1: item.token1, token2: item.token2, amount1: 0, amount2: 0 };
      }
      if (item.type === "add") {
        positions[key].amount1 += item.amount1;
        positions[key].amount2 += item.amount2;
      } else {
        positions[key].amount1 -= item.amount1;
        positions[key].amount2 -= item.amount2;
      }
    });

    return positions;
  } catch (error) {
    console.error("Error getting user positions:", error);
    return {};
  }
};
