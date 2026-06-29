const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("=== MEMULAI AMUNISI TOKEN & LIKUIDITAS ===");
  console.log("Menggunakan akun:", deployer.address);

  // Alamat hasil deploy sebelumnya
  const ztxAddress = "0x398f1beF5cdCa19DF73954437ab54FD2d650b243";
  const usdtAddress = "0x5f056C66A3E2c50d16ACE53a8EBA3080C6D5C46B";
  const swapAddress = "0x502e5a583223e5020924332a05a18f324FdaE736";

  // Ambil instance kontrak menggunakan Fully Qualified Name agar tidak error HH701
  const ZTX = await hre.ethers.getContractAt("contracts/ZentrixToken.sol:IERC20", ztxAddress);
  const USDT = await hre.ethers.getContractAt("contracts/ZentrixToken.sol:IERC20", usdtAddress);
  
  const jumlahZTX = hre.ethers.parseEther("1000"); // 1000 ZTX
  const jumlahUSDT = hre.ethers.parseEther("500");   // 500 USDT

  // --- TUGAS 1: ISI SALDO ZTX KE WALLET ---
  console.log("\n[Tugas 1] Mencetak 1000 ZTX ke dompet Anda...");
  try {
    // Mencoba memanggil fungsi mint jika tipe ERC20 mendukung minting publik/owner
    const txMint = await ZTX.mint(deployer.address, jumlahZTX);
    await txMint.wait();
    console.log("> Sukses! Saldo ZTX Anda di MetaMask kini bertambah.");
  } catch (error) {
    console.log("> Fungsi mint gagal/tidak ada. Jika total supply sudah otomatis masuk ke dompet Anda saat deploy, abaikan pesan ini.");
  }

  // --- TUGAS 2: KIRIM USDT KE KONTRAK SWAP ---
  console.log("\n[Tugas 2] Mengirim 500 USDT ke kontrak SimpleSwap...");
  try {
    const txTransfer = await USDT.transfer(swapAddress, jumlahUSDT);
    await txTransfer.wait();
    console.log("> Sukses! Kontrak SimpleSwap sekarang memiliki modal likuiditas USDT.");
  } catch (error) {
    console.error("> Gagal mengirim USDT. Pastikan dompet Anda memiliki saldo Mock USDT yang cukup sebelum mengirim.", error.message);
  }

  console.log("\n=== SEMUA SETUP SELESAI JALAN ===");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});