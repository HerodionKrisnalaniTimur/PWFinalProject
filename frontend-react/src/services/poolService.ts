import { ethers } from "ethers";

// 1. Konfigurasi Alamat Smart Contract
export const CONTRACT_ADDRESSES = {
  SWAP_CONTRACT: "0x9a641d12C1FC04ee79Ebd50C7AfD69001cdAE325",
  POOL_CONTRACT: "0x9a641d12C1FC04ee79Ebd50C7AfD69001cdAE325",

  TOKEN_USDT: "0x27055F95A340Ec69dC0a828733F29D4ad7B5959C",
  TOKEN_ZTX: "0xFf3422DDc623AacD499bb79Af41F9c6dacc4354f",
  TOKEN_AGT: "0x246aeaE378f1F70Bb470824146116687d6B7Bdab",
  TOKEN_TOG: "0x35309A0593d7E09b22Dfd9D8AC78FC545048d566",
  TOKEN_DGH: "0xFE6CAA65C8C9B74C55a2ccf29eDD74B84f49052E",
  TOKEN_MJK: "0x16EC03C615a24f2ea44Eb9DACc12E58486b5C7c3",
};

// ABI minimal ERC20 lengkap dengan pengecekan desimal dinamis
export const ERC20_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function decimals() view returns (uint8)"
];

export const MULTI_POOL_ABI = [
  "function addLiquidity(address tokenAddress,uint256 amount) external returns(bool)",
  "function removeLiquidity(address tokenAddress,uint256 amount) external",
  "function getUserLiquidity(address user,address token) view returns(uint256)",
  "function getPoolLiquidity(address token) view returns(uint256)",
  "function isSupportedToken(address tokenAddress) view returns(bool)"
];

export interface PoolToken {
  id: string;
  token: string;
}

export interface LiquidityHistoryItem {
  id: string;
  type: "add" | "remove";

  token: string;
  amount: number;

  timestamp: number;
  txHash?: string;
}

export const getAllPools = () => {
  return [
    {
      id: "USDT",
      token: "USDT"
    },
    {
      id: "ZTX",
      token: "ZTX"
    },
    {
      id: "AGT",
      token: "AGT"
    },
    {
      id: "TOG",
      token: "TOG"
    },
    {
      id: "DGH",
      token: "DGH"
    },
    {
      id: "MJK",
      token: "MJK"
    }
  ];
};

export const getProviderOrSigner = async (needSigner = false) => {
  if (typeof window === "undefined" || !window.ethereum) {
    throw new Error("MetaMask tidak terdeteksi. Silakan instal terlebih dahulu.");
  }
  const provider = new ethers.BrowserProvider(window.ethereum);
  if (needSigner) {
    return await provider.getSigner();
  }
  return provider;
};

export const fetchAllTokenBalances = async (walletAddress: string): Promise<Record<string, string>> => {
  try {
    const provider = await getProviderOrSigner();
    const balances: Record<string, string> = {};
    const tokens = ["USDT", "ZTX", "AGT", "TOG", "DGH", "MJK"];
    
    for (const symbol of tokens) {
      const tokenAddress = CONTRACT_ADDRESSES[`TOKEN_${symbol}` as keyof typeof CONTRACT_ADDRESSES];
      if (tokenAddress) {
        const contract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
        const balWei = await contract.balanceOf(walletAddress);
        const decimals = await contract.decimals().catch(() => 18);
        balances[symbol] = parseFloat(ethers.formatUnits(balWei, decimals)).toFixed(2);
      }
    }
    return balances;
  } catch (error) {
    console.error("Gagal mengambil saldo on-chain:", error);
    return { USDT: "0.00", ZTX: "0.00", AGT: "0.00", TOG: "0.00", DGH: "0.00", MJK: "0.00" };
  }
};

export const executeAddLiquidity = async (
  walletAddress: string,
  tokenSymbol: string,
  amount: string
) => {
  try {
    const signer = await getProviderOrSigner(true);

    const poolAddress =
      CONTRACT_ADDRESSES.POOL_CONTRACT;

    const tokenAddress =
      CONTRACT_ADDRESSES[
        `TOKEN_${tokenSymbol}` as keyof typeof CONTRACT_ADDRESSES
      ];

    if (!tokenAddress)
      throw new Error("Token tidak ditemukan");

    const tokenContract =
      new ethers.Contract(
        tokenAddress,
        ERC20_ABI,
        signer
      );

    const decimals =
      await tokenContract.decimals().catch(
        () => 18
      );

    const amountWei =
      ethers.parseUnits(amount, decimals);

    console.log(
      `Approving ${amount} ${tokenSymbol}`
    );

    const approveTx =
      await tokenContract.approve(
        poolAddress,
        amountWei
      );

    await approveTx.wait();

    const poolContract =
      new ethers.Contract(
        poolAddress,
        MULTI_POOL_ABI,
        signer
      );

    console.log(
      "Mengirim likuiditas..."
    );

    const tx =
      await poolContract.addLiquidity(
        tokenAddress,
        amountWei
      );

    await tx.wait();

    return {
      hash: tx.hash
    };
  } catch (error) {
    console.error(error);
    throw error;
  }
};
    

export const getLiquidityHistory = (
  walletAddress: string
): LiquidityHistoryItem[] => {
  try {
    const data = localStorage.getItem(
      `liquidity_history_${walletAddress.toLowerCase()}`
    );

    if (!data) return [];

    const parsed = JSON.parse(data);

    return parsed.filter(
      (item: any) =>
        item &&
        typeof item.token === "string" &&
        typeof item.amount === "number"
    );
  } catch (error) {
    console.error(error);
    return [];
  }
};

export const addLiquidityHistory = (
  walletAddress: string,
  token: string,
  amount: number,
  txHash?: string
) => {
  try {
    const history = getLiquidityHistory(walletAddress);
    const newItem: LiquidityHistoryItem = {
      id: `liq_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      type: "add",
      token,
      amount,
      timestamp: Date.now(),
      txHash,
    };
    history.unshift(newItem);
    localStorage.setItem(`liquidity_history_${walletAddress.toLowerCase()}`, JSON.stringify(history));
    return newItem;
  } catch (error) {
    console.error("Error adding liquidity to history:", error);
  }
  
};

export const calculateTotalStats = (
  walletAddress: string
) => {
  try {
    const history =
      getLiquidityHistory(walletAddress);

    let tvl = 0;

    const activeTokens =
      new Set<string>();

    history.forEach((item) => {
      if (
        item.type === "add" &&
        typeof item.amount === "number"
      ) {
        tvl += Number(item.amount);

        activeTokens.add(item.token);
      }
    });

    return {
      tvl,
      apr: 24.8,
      activePositions:
        activeTokens.size,
    };
  } catch (error) {
    return {
      tvl: 0,
      apr: 24.8,
      activePositions: 0,
    };
  }
};

export const getUserPositionsFromHistory = (
  walletAddress: string
): Record<
  string,
  {
    token: string;
    amount: number;
  }
> => {
  try {
    const history =
      getLiquidityHistory(walletAddress);

    const positions: Record<
      string,
      {
        token: string;
        amount: number;
      }
    > = {};

    history.forEach((item) => {
      if (
        !item ||
        typeof item.amount !==
          "number"
      )
        return;

      const key = item.token;

      if (!positions[key]) {
        positions[key] = {
          token: key,
          amount: 0,
        };
      }

      if (item.type === "add") {
        positions[key].amount +=
          Number(item.amount);
      }

      if (item.type === "remove") {
        positions[key].amount -=
          Number(item.amount);
      }
    });

    return positions;
  } catch (error) {
    console.error(error);
    return {};
  }
};

export const fetchUserLiquidity = async (walletAddress: string) => getUserPositionsFromHistory(walletAddress);
export const fetchGlobalPoolStats = async () => ({ tvl: 1254350.75, apr: 24.8, activePositions: 5 });