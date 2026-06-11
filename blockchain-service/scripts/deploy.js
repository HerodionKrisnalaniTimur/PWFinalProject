const hre = require("hardhat");

async function main() {
  // Dapatkan akun deployer (Account default Hardhat)
  const [deployer] = await hre.ethers.getSigners();
  console.log("=== MEMULAI DEPLOYMENT ALL-IN-ONE (SWAP & POOL) ===");
  console.log("Menggunakan akun deployer:", deployer.address);

  // 1. Deploy Zentrix Token (ZTX)
  console.log("\nDeploying Zentrix Token (ZTX)...");
  const ZentrixToken = await hre.ethers.getContractFactory("ZentrixToken");
  const ztx = await ZentrixToken.deploy(); 
  await ztx.waitForDeployment();
  const ztxAddress = await ztx.getAddress();
  console.log(`> Zentrix Token sukses di-deploy ke: ${ztxAddress}`);

  // 2. Deploy Mock USDT
  console.log("\nDeploying Mock USDT...");
  const MockUSDT = await hre.ethers.getContractFactory("MockUSDT");
  const usdt = await MockUSDT.deploy();
  await usdt.waitForDeployment();
  const usdtAddress = await usdt.getAddress();
  console.log(`> Mock USDT sukses di-deploy ke: ${usdtAddress}`);

  // 3. Deploy SimpleSwap Contract (Bertindak sebagai Pool sekaligus Swap)
  console.log("\nDeploying SimpleSwap Contract (Pool & Swap)...");
  const SimpleSwap = await hre.ethers.getContractFactory("SimpleSwap");
  // Mengirimkan kedua alamat token ke dalam constructor SimpleSwap
  const swap = await SimpleSwap.deploy(ztxAddress, usdtAddress); 
  await swap.waitForDeployment();
  const swapAddress = await swap.getAddress();
  console.log(`> SimpleSwap (Pool) sukses di-deploy ke: ${swapAddress}`);

  // 4. OTOMATISASI LIKUIDITAS AWAL (Suntikan Dana Pool Pertama)
  console.log("\nMengotomatiskan penyediaan modal likuiditas awal...");
  
  const jumlahZTXModal = hre.ethers.parseEther("5000");  // 5000 ZTX
  const jumlahUSDTModal = hre.ethers.parseEther("5000"); // 5000 USDT

  // Memberikan izin (Approve) agar kontrak bisa menarik token dari wallet deployer
  console.log("-> Menyetujui akses token ZTX...");
  const approveZtxTx = await ztx.approve(swapAddress, jumlahZTXModal);
  await approveZtxTx.wait();

  console.log("-> Menyetujui akses token USDT...");
  const approveUsdtTx = await usdt.approve(swapAddress, jumlahUSDTModal);
  await approveUsdtTx.wait();

  // Memanggil fungsi Liquidity di Smart Contract Anda
  // Catatan: Sesuaikan nama fungsi di bawah jika di contract Anda namanya 'addLiquidityInitial' atau sejenisnya
  try {
    console.log("-> Menyuntikkan likuiditas awal ke Pool...");
    const txLiquidity = await swap.addLiquidity(jumlahZTXModal, jumlahUSDTModal);
    await txLiquidity.wait();
    console.log(`> Sukses menyediakan Pool awal sebesar 5000 ZTX dan 5000 USDT.`);
  } catch (error) {
    console.log("-> Prosedur alternatif: Melakukan transfer token manual langsung ke alamat kontrak...");
    const tx1 = await ztx.transfer(swapAddress, jumlahZTXModal);
    await tx1.wait();
    const tx2 = await usdt.transfer(swapAddress, jumlahUSDTModal);
    await tx2.wait();
    console.log(`> Sukses menyuntikkan dana langsung ke alamat kontrak Swap/Pool.`);
  }

  console.log("\n=== DEPLOYMENT SELESAI SINKRON ===");
  console.log("Salin nilai di bawah ini ke file poolService.ts Anda:\n");
  console.log(`UNIT_CONTRACT: "${swapAddress}",`);
  console.log(`TOKEN_ZTX: "${ztxAddress}",`);
  console.log(`TOKEN_USDT: "${usdtAddress}"`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});