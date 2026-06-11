import { ethers } from "ethers";

// 1. Konfigurasi Alamat Smart Contract
export const CONTRACT_ADDRESSES = {
  POOL_CONTRACT: "0x243333BEbd46F6aFc37B2A0D1c2028762bE1dfb8", 
  TOKEN_ZTX: "0x9FC47534cEe3550e1a0548ACBf9C0b58626963C0",
  TOKEN_USDT: "0x7Ee2A3E21CF513596c4eEC64c1BB86b03bC98F3C"
};

// 2. Deklarasi ABI Standard
const ERC20_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)"
];

const POOL_ABI = [
  "function addLiquidity(uint256 amountZtx, uint256 amountUsdt) external returns (uint256)",
  "function liquidityProviderZTX(address user) view returns (uint256)",
  "function liquidityProviderUSDT(address user) view returns (uint256)"
];

export const getProviderOrSigner = async (needSigner = false) => {
  if (typeof window === "undefined" || !window.ethereum) throw new Error("MetaMask belum terinstall");
  const provider = new ethers.BrowserProvider(window.ethereum);
  if (needSigner) return await provider.getSigner();
  return provider;
};

// 3. Fungsi Ambil Saldo Riil dari Sepolia
export const fetchTokenBalances = async (walletAddress: string) => {
  try {
    const provider = await getProviderOrSigner();
    const ztxContract = new ethers.Contract(CONTRACT_ADDRESSES.TOKEN_ZTX, ERC20_ABI, provider);
    const usdtContract = new ethers.Contract(CONTRACT_ADDRESSES.TOKEN_USDT, ERC20_ABI, provider);

    const ztxBal = await ztxContract.balanceOf(walletAddress);
    const usdtBal = await usdtContract.balanceOf(walletAddress);

    return {
      ztx: ethers.formatEther(ztxBal),
      usdt: ethers.formatEther(usdtBal)
    };
  } catch (error) {
    console.error("Gagal mengambil saldo dari blockchain:", error);
    return { ztx: "0.00", usdt: "0.00" };
  }
};

// 4. Fungsi Utama Eksekusi Tambah Likuiditas Interaktif lewat MetaMask
export const executeAddLiquidity = async (
  walletAddress: string, 
  amountZtx: string, 
  amountUsdt: string
) => {
  const signer = await getProviderOrSigner(true);
  
  const ztxContract = new ethers.Contract(CONTRACT_ADDRESSES.TOKEN_ZTX, ERC20_ABI, signer);
  const usdtContract = new ethers.Contract(CONTRACT_ADDRESSES.TOKEN_USDT, ERC20_ABI, signer);
  const poolContract = new ethers.Contract(CONTRACT_ADDRESSES.POOL_CONTRACT, POOL_ABI, signer);

  const ztxWei = ethers.parseEther(amountZtx);
  const usdtWei = ethers.parseEther(amountUsdt);

  // ALUR INTERAKSI METAMASK: Approve ZTX -> Approve USDT -> Add Liquidity
  console.log("Memulai proses transaksi...");
  
  const tx1 = await ztxContract.approve(CONTRACT_ADDRESSES.POOL_CONTRACT, ztxWei);
  await tx1.wait();
  console.log("Izin token ZTX disetujui!");

  const tx2 = await usdtContract.approve(CONTRACT_ADDRESSES.POOL_CONTRACT, usdtWei);
  await tx2.wait();
  console.log("Izin token USDT disetujui!");

  const txMain = await poolContract.addLiquidity(ztxWei, usdtWei);
  return await txMain.wait();
};

export const fetchUserLiquidity = async (walletAddress: string) => {
  try {
    const provider = await getProviderOrSigner();
    const poolContract = new ethers.Contract(CONTRACT_ADDRESSES.POOL_CONTRACT, POOL_ABI, provider);

    // Panggil mapping contract secara paralel
    const [ztxLiquidityWei, usdtLiquidityWei] = await Promise.all([
      poolContract.liquidityProviderZTX(walletAddress),
      poolContract.liquidityProviderUSDT(walletAddress)
    ]);

    return {
      ztx: parseFloat(ethers.formatEther(ztxLiquidityWei)),
      usdt: parseFloat(ethers.formatEther(usdtLiquidityWei)),
    };
  } catch (error) {
    console.error("Gagal mengambil data posisi likuiditas:", error);
    return { ztx: 0, usdt: 0 };
  }
};


// Fungsi untuk mengambil total koin yang mengendap di dalam Kontrak Pool (TVL)
export const fetchGlobalPoolStats = async () => {
  try {
    const provider = await getProviderOrSigner();
    const ztxContract = new ethers.Contract(CONTRACT_ADDRESSES.TOKEN_ZTX, ERC20_ABI, provider);
    const usdtContract = new ethers.Contract(CONTRACT_ADDRESSES.TOKEN_USDT, ERC20_ABI, provider);

    // Ambil total seluruh saldo token yang tersimpan di dalam alamat KONTRAK POOL (TVL)
    const [totalZtxWei, totalUsdtWei] = await Promise.all([
      ztxContract.balanceOf(CONTRACT_ADDRESSES.POOL_CONTRACT),
      usdtContract.balanceOf(CONTRACT_ADDRESSES.POOL_CONTRACT)
    ]);

    const totalZtx = parseFloat(ethers.formatEther(totalZtxWei));
    const totalUsdt = parseFloat(ethers.formatEther(totalUsdtWei));

    // 1. Hitung Total Liquidity (Asumsi harga fixed rate: 1 ZTX = 0.1 USDT)
    const totalLiquidityInUSD = (totalZtx * 0.1) + totalUsdt;

    // 2. Hitung APR Dinamis (Simulasi: Alokasi hadiah 25,000 USDT per tahun dibagi dengan total likuiditas)
    // Jika pool masih sangat baru/kosong, pasang default dasar 24.8%
    const alokasiRewardPertahun = 25000;
    const calculatedAPR = totalLiquidityInUSD > 0 
      ? (alokasiRewardPertahun / totalLiquidityInUSD) * 100 
      : 24.8;

    return {
      tvl: totalLiquidityInUSD,
      apr: calculatedAPR > 300 ? 300 : calculatedAPR // Batasi max APR 300% agar rasional
    };
  } catch (error) {
    console.error("Gagal mengambil statistik global pool:", error);
    return { tvl: 0, apr: 24.8 };
  }
};