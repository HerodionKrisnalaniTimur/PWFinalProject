const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const filePath = path.join(__dirname, "../src/constants/addresses.json");
  
  // Validasi apakah file deploy.js sudah dijalankan sebelumnya
  if (!fs.existsSync(filePath)) {
    console.error("❌ Error: File addresses.json tidak ditemukan! Jalankan deploy.js dulu.");
    return;
  }

  // Membaca alamat koin otomatis dari file JSON
  const addressMap = JSON.parse(fs.readFileSync(filePath, "utf8"));
  console.log("Berhasil membaca alamat token dari JSON...");

  console.log("Memulai proses deploy Kontrak Faucet...");

  // 1. Deploy Smart Contract Faucet
  const FaucetFactory = await hre.ethers.getContractFactory("Faucet");
  const faucet = await FaucetFactory.deploy();
  await faucet.waitForDeployment();
  const faucetAddress = await faucet.getAddress();
  console.log("✅ Faucet Contract deployed to:", faucetAddress);

  // 2. Suntik Saldo Testnet ke Faucet
  console.log("\nMengisi saldo token ke dalam Faucet...");
  const faucetFundAmount = hre.ethers.parseEther("100000");

  // Loop semua token yang ada di file JSON kecuali alamat SWAP itu sendiri
  for (const [symbol, tokenAddress] of Object.entries(addressMap)) {
    if (symbol === "SWAP") continue; 

    const tokenContract = await hre.ethers.getContractAt("MockUSDT", tokenAddress);
    
    try {
      const transferTx = await tokenContract.transfer(faucetAddress, faucetFundAmount);
      await transferTx.wait();
      console.log(`🎁 Berhasil mengirim 100,000 ${symbol} ke Faucet.`);
    } catch (error) {
      console.error(`❌ Gagal mengisi Faucet untuk ${symbol}:`, error.message);
    }
  }

  // 🔥 OTOMATISASI: Tambahkan alamat Faucet baru ke dalam object, lalu simpan ulang ke JSON
  addressMap["FAUCET"] = faucetAddress;
  fs.writeFileSync(filePath, JSON.stringify(addressMap, null, 2));

  console.log("\n=== DEPLOYMENT FAUCET SELESAI ===");
  console.log("Alamat Faucet berhasil ditambahkan otomatis ke src/constants/addresses.json");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});