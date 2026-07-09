const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  // 1. Deploy USDT
  const MockUSDT = await hre.ethers.getContractFactory("MockUSDT");
  const usdt = await MockUSDT.deploy();
  await usdt.waitForDeployment();
  const usdtAddress = await usdt.getAddress();
  console.log("MockUSDT deployed to:", usdtAddress);

  // 2. Deploy SimpleSwap Router
  const SimpleSwap = await hre.ethers.getContractFactory("SimpleSwap");
  const swap = await SimpleSwap.deploy(usdtAddress);
  await swap.waitForDeployment();
  const swapAddress = await swap.getAddress();
  console.log("SimpleSwap Router deployed to:", swapAddress);

  // Object penampung alamat untuk disimpan ke JSON
  // Kita masukkan data awal (USDT dan SWAP)
  const addressMap = {
    USDT: usdtAddress,
    SWAP: swapAddress
  };

  // 3. Cetakan Token Game massal
  const TokenFactory = await hre.ethers.getContractFactory("MultiToken");
  const tokenData = [
    { name: "Zentrix Token", symbol: "ZTX", rate: 70 },    
    { name: "Agate Token", symbol: "AGT", rate: 200 },    
    { name: "Toge Token", symbol: "TOG", rate: 150 },     
    { name: "Digital Happiness", symbol: "DGH", rate: 100 }, 
    { name: "Mojiken Token", symbol: "MJK", rate: 100 }
  ];

  let deployedTokens = [
    { address: usdtAddress, symbol: "USDT", rate: 100 }
  ];

  for (const t of tokenData) {
    const token = await TokenFactory.deploy(t.name, t.symbol);
    await token.waitForDeployment();
    const tokenAddress = await token.getAddress();
    console.log(`${t.symbol} deployed to: ${tokenAddress}`);

    const tx = await swap.setTokenRate(tokenAddress, t.rate);
    await tx.wait();

    deployedTokens.push({ address: tokenAddress, symbol: t.symbol, rate: t.rate });
    
    // Otomatis masukkan alamat token yang baru dideploy ke object map
    addressMap[t.symbol] = tokenAddress;
  }

  // 4. Supply Likuiditas Awal ke Pool Swap
  console.log("\nSupplying initial liquidity to pool...");
  const liquidityAmount = hre.ethers.parseEther("500000");

  for (const token of deployedTokens) {
    const contract = await hre.ethers.getContractAt("MockUSDT", token.address);
    const approveTx = await contract.approve(swapAddress, liquidityAmount);
    await approveTx.wait();

    const addLiqTx = await swap.addLiquidity(token.address, liquidityAmount);
    await addLiqTx.wait();
  }

  // 🔥 OTOMATISASI: Simpan object alamat ke file JSON di dalam folder src frontend
  const dirPath = path.join(__dirname, "../../frontend-react/src/constants/addresses.json");
  if (!fs.existsSync(dirPath)){
      fs.mkdirSync(dirPath, { recursive: true }); // Buat folder constants jika belum ada
  }
  
  fs.writeFileSync(
    path.join(dirPath, "addresses.json"),
    JSON.stringify(addressMap, null, 2)
  );

  console.log("\n=== DEPLOYMENT TOKEN & SWAP COMPLETE ===");
  console.log("Alamat berhasil diexport otomatis ke src/constants/addresses.json");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});