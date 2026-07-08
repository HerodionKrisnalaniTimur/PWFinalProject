import { ethers } from "ethers";
// 🔥 Cukup import file JSON hasil export otomatis tadi
import contractAddresses from "../constants/addresses.json"; 

const FAUCET_CONTRACT_ADDRESS = contractAddresses.FAUCET; // 👈 Otomatis mengambil alamat Faucet

const FAUCET_ABI = [
  "function requestTokens(address tokenAddress) external",
  "function getSisaWaktu(address user, address tokenAddress) view returns (uint256)"
];

const getSigner = async () => {
  if (!window.ethereum) throw new Error("MetaMask tidak terdeteksi!");
  const provider = new ethers.BrowserProvider(window.ethereum);
  return await provider.getSigner();
};

export const checkTokenCooldown = async (walletAddress: string, tokenAddress: string): Promise<number> => {
  try {
    if (!walletAddress || !tokenAddress) return 0;
    const signer = await getSigner();
    const contract = new ethers.Contract(FAUCET_CONTRACT_ADDRESS, FAUCET_ABI, signer);
    return Number(await contract.getSisaWaktu(walletAddress, tokenAddress));
  } catch (error) {
    return 0;
  }
};

export const claimTokensFromFaucet = async (tokenAddress: string) => {
  const signer = await getSigner();
  const contract = new ethers.Contract(FAUCET_CONTRACT_ADDRESS, FAUCET_ABI, signer);
  const tx = await contract.requestTokens(tokenAddress);
  await tx.wait();
  return tx;
};