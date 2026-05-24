const hre = require("hardhat");

async function main() {
  // Dapatkan akun deployer (Account 4 Anda)
  const [deployer] = await hre.ethers.getSigners();
  console.log("=== MEMULAI DEPLOYMENT ALL-IN-ONE ===");
  console.log("Menggunakan akun deployer:", deployer.address);

  // 1. Deploy Zentrix Token (ZTX)
  console.log("\nDeploying Zentrix Token (ZTX)...");
  const ZentrixToken = await hre.ethers.getContractFactory("ZentrixToken");
  // Asumsi constructor membutuhkan initial supply, misal 1.000.000 token
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

  // 3. Deploy SimpleSwap Contract (Memasukkan alamat ZTX & USDT ke constructor-nya jika dibutuhkan)
  console.log("\nDeploying SimpleSwap Contract...");
  const SimpleSwap = await hre.ethers.getContractFactory("SimpleSwap");
  // Sesuaikan argumen constructor SimpleSwap Anda, biasanya meminta (addressZTX, addressUSDT)
  const swap = await SimpleSwap.deploy(ztxAddress, usdtAddress); 
  await swap.waitForDeployment();
  const swapAddress = await swap.getAddress();
  console.log(`> SimpleSwap sukses di-deploy ke: ${swapAddress}`);

  // 4. OTOMATISASI LIKUIDITAS: Kirim modal USDT ke kontrak swap agar tidak perlu script terpisah lagi!
  console.log("\nMengotomatiskan modal likuiditas...");
  const jumlahModal = hre.ethers.parseEther("1000"); // 1000 USDT
  
  const txTransfer = await usdt.transfer(swapAddress, jumlahModal);
  await txTransfer.wait();
  console.log(`> Sukses menyuntikkan ${hre.ethers.formatEther(jumlahModal)} USDT ke kontrak Swap sebagai modal.`);

  console.log("\n=== DEPLOYMENT SELESAI SINKRON ===");
  console.log(`TOKEN_ZTX=${ztxAddress}`);
  console.log(`TOKEN_USDT=${usdtAddress}`);
  console.log(`CONTRACT_SWAP=${swapAddress}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});