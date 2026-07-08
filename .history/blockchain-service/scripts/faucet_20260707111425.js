const hre = require("hardhat");

async function main() {
  // 🔥 TEMPELKAN ALAMAT CONTRACT HASIL RUNNING DEPLOY.JS DI SINI
  const DEPLOYED_TOKENS = {
    USDT: "0xALAMAT_USDT_ANDA_DI_SEPOLIA",
    ZTX: "0xALAMAT_ZTX_ANDA_DI_SEPOLIA",
    AGT: "0xALAMAT_AGT_ANDA_DI_SEPOLIA",
    TOG: "0xALAMAT_TOG_ANDA_DI_SEPOLIA",
    DGH: "0xALAMAT_DGH_ANDA_DI_SEPOLIA",
    MJK: "0xALAMAT_MJK_ANDA_DI_SEPOLIA"
  };

  console.log("Memulai proses deploy Kontrak Faucet...");

  // 1. Deploy Smart Contract Faucet
  const FaucetFactory = await hre.ethers.getContractFactory("Faucet");
  const faucet = await FaucetFactory.deploy();
  await faucet.waitForDeployment();
  const faucetAddress = await faucet.getAddress();
  console.log("✅ Faucet Contract deployed to:", faucetAddress);

  // 2. Suntik Saldo Testnet ke Brankas Faucet (Masing-masing 100,000 koin)
  console.log("\nMengisi saldo token ke dalam Faucet...");
  const faucetFundAmount = hre.ethers.parseEther("100000"); // 100k koin per token

  for (const [symbol, tokenAddress] of Object.entries(DEPLOYED_TOKENS)) {
    // Validasi pencegahan jika Anda lupa mengisi alamat token di atas
    if (!tokenAddress || tokenAddress.startsWith("0xALAMAT")) {
      console.log(`⚠️ Skip mengisi ${symbol} karena alamat token belum di-update.`);
      continue;
    }

    // Menggunakan template ABI MockUSDT/ERC20 untuk melakukan transfer koin
    const tokenContract = await hre.ethers.getContractAt("MockUSDT", tokenAddress);
    
    try {
      const transferTx = await tokenContract.transfer(faucetAddress, faucetFundAmount);
      await transferTx.wait();
      console.log(`🎁 Berhasil mengirim 100,000 ${symbol} ke Faucet.`);
    } catch (error) {
      console.error(`❌ Gagal mengisi Faucet untuk ${symbol}:`, error.message);
    }
  }

  console.log("\n=== DEPLOYMENT FAUCET SELESAI ===");
  console.log("Alamat Faucet Baru Anda:", faucetAddress);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});