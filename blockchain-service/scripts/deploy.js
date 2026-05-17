const hre = require("hardhat");

async function main() {
  console.log("=== MEMULAI DEPLOYMENT ALL-IN-ONE ===");

  const [deployer] = await hre.ethers.getSigners();
  console.log("Alamat dompet yang dibaca Hardhat:", deployer.address);

  // 1. Deploy Zentrix Token
  console.log("Deploying Zentrix Token (ZTX)...");
  const ZentrixToken = await hre.ethers.getContractFactory("ZentrixToken");
  const ztx = await ZentrixToken.deploy();
  await ztx.waitForDeployment();
  const ztxAddress = await ztx.getAddress();
  console.log(`> Zentrix Token di-deploy ke: ${ztxAddress}`);

  // 2. Deploy Mock USDT
  console.log("Deploying Mock USDT...");
  const MockUSDT = await hre.ethers.getContractFactory("MockUSDT");
  const usdt = await MockUSDT.deploy();
  await usdt.waitForDeployment();
  const usdtAddress = await usdt.getAddress();
  console.log(`> Mock USDT di-deploy ke: ${usdtAddress}`);

  // 3. Deploy SimpleSwap
  console.log("Deploying SimpleSwap Contract...");
  const SimpleSwap = await hre.ethers.getContractFactory("SimpleSwap");
  const swap = await SimpleSwap.deploy(ztxAddress, usdtAddress);
  await swap.waitForDeployment();
  const swapAddress = await swap.getAddress();
  console.log(`> SimpleSwap di-deploy ke: ${swapAddress}`);

  console.log("\n=== DEPLOY SELESAI ===");
  console.log(`TOKEN_ZTX=${ztxAddress}`);
  console.log(`TOKEN_USDT=${usdtAddress}`);
  console.log(`CONTRACT_SWAP=${swapAddress}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});