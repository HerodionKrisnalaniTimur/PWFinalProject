const hrd = require("hardhat");

async function main() {
  // Alamat dompet MetaMask Anda yang ingin diisi saldo ZTX-nya
  const TARGET_WALLET = "0xdEC3152DB4B6548797CA41F0286A9d6E50499963";
  // Alamat kontrak Token ZTX Anda
  const TOKEN_ADDRESS = "0x1a5654F13E8691EBba39EC99fd940e4C6632786e";

  console.log("Menghubungkan ke provider blockchain...");
  
  // ABI Minimal untuk fungsi mint / transfer agar tidak perlu membaca folder artifacts
  const minErc20Abi = [
    "function mint(address to, uint256 amount) external",
    "function transfer(address to, uint256 amount) external returns (bool)"
  ];

  // Mengambil akun signer (deployer) yang aktif di konfigurasi hardhat.config.js Anda
  const [deployer] = await hrd.ethers.getSigners();
  console.log("Menggunakan akun pengirim:", deployer.address);

  // Inisialisasi kontrak secara langsung menggunakan alamat dan ABI manual
  const tokenContract = new hrd.ethers.Contract(TOKEN_ADDRESS, minErc20Abi, deployer);

  const amountToMint = hrd.ethers.parseEther("500"); // Jumlah yang ingin diisi: 500 ZTX
  console.log(`Mencoba mengirimkan/mencetak 500 ZTX ke dompet ${TARGET_WALLET}...`);

  let tx;
  try {
    // -----------------------------------------------------------------
    // STRATEGI A: Mencoba memanggil fungsi mint kustom terlebih dahulu
    // -----------------------------------------------------------------
    console.log("Mencoba fungsi mint()...");
    tx = await tokenContract.mint(TARGET_WALLET, amountToMint);
  } catch (error) {
    console.log("Fungsi mint() tidak tersedia atau gagal. Mengalihkan ke Strategi B...");
    
    // -----------------------------------------------------------------
    // STRATEGI B: Jika suplai koin sudah tercetak semua ke akun deployer saat awal,
    // maka kita gunakan transfer biasa untuk memindahkan koin ke MetaMask Anda.
    // -----------------------------------------------------------------
    console.log("Mencoba fungsi transfer() biasa...");
    tx = await tokenContract.transfer(TARGET_WALLET, amountToMint);
  }

  console.log("Transaksi terkirim! Menunggu konfirmasi block jaringan Sepolia...");
  await tx.wait();
  console.log(`\n🎉 BERHASIL! 500 ZTX telah sukses masuk ke dompet Anda (${TARGET_WALLET}).`);
}

main().catch((error) => {
  console.error("\n❌ Terjadi kesalahan kritis pada script:", error);
  process.exitCode = 1;
});