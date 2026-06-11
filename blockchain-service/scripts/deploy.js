const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("=== MEMULAI DEPLOYMENT UTAMA DI SEPOLIA ===");
  console.log("Menggunakan akun deployer:", deployer.address);

  // 1. Deploy Zentrix Token (ZTX)
  console.log("\nDeploying Zentrix Token (ZTX)...");
  const ZentrixTokenFactory = await hre.ethers.getContractFactory("ZentrixToken");
  const ztxDeployment = await ZentrixTokenFactory.deploy(); 
  await ztxDeployment.waitForDeployment();
  const ztxAddress = await ztxDeployment.getAddress();
  console.log(`> Zentrix Token sukses di-deploy ke: ${ztxAddress}`);

  // 2. Deploy Mock USDT
  console.log("\nDeploying Mock USDT...");
  const MockUSDTFactory = await hre.ethers.getContractFactory("MockUSDT");
  const usdtDeployment = await MockUSDTFactory.deploy();
  await usdtDeployment.waitForDeployment();
  const usdtAddress = await usdtDeployment.getAddress();
  console.log(`> Mock USDT sukses di-deploy ke: ${usdtAddress}`);

  // 3. Deploy SimpleSwap Contract (Pool & Swap)
  console.log("\nDeploying SimpleSwap Contract (Pool & Swap)...");
  const SimpleSwapFactory = await hre.ethers.getContractFactory("SimpleSwap");
  const swapDeployment = await SimpleSwapFactory.deploy(ztxAddress, usdtAddress); 
  await swapDeployment.waitForDeployment();
  const swapAddress = await swapDeployment.getAddress();
  console.log(`> SimpleSwap (Pool) sukses di-deploy ke: ${swapAddress}`);

  console.log("\n=== DEPLOYMENT SELESAI SUKSES ===");
  console.log("Salin nilai di bawah ini ke file poolService.ts Anda:\n");
  console.log(`POOL_CONTRACT: "${swapAddress}",`);
  console.log(`TOKEN_ZTX: "${ztxAddress}",`);
  console.log(`TOKEN_USDT: "${usdtAddress}"`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});