const hre = require("hardhat");

async function main() {
  // Deploy USDT sebagai Anchor Base
  const MockUSDT = await hre.ethers.getContractFactory("MockUSDT");
  const usdt = await MockUSDT.deploy();
  await usdt.waitForDeployment();
  const usdtAddress = await usdt.getAddress();
  console.log("MockUSDT deployed to:", usdtAddress);

  // Deploy SimpleSwap Router
  const SimpleSwap = await hre.ethers.getContractFactory("SimpleSwap");
  const swap = await SimpleSwap.deploy(usdtAddress);
  await swap.waitForDeployment();
  const swapAddress = await swap.getAddress();
  console.log("SimpleSwap Router deployed to:", swapAddress);

  //  Cetakan Token Game
  const TokenFactory = await hre.ethers.getContractFactory("MultiToken");

  // Daftar Koin Game dan Bobot Nilainya (Dikali 100)
  const tokenData = [
    { name: "Zentrix Token", symbol: "ZTX", rate: 70 },    // 0.7 USDT
    { name: "Agate Token", symbol: "AGT", rate: 200 },    // 2.0 USDT
    { name: "Toge Token", symbol: "TOG", rate: 150 },     // 1.5 USDT
    { name: "Digital Happiness", symbol: "DGH", rate: 100 }, // 1.0 USDT
    { name: "Mojiken Token", symbol: "MJK", rate: 50 }     // 0.5 USDT
  ];

  const deployedTokens = [
    { address: usdtAddress, symbol: "USDT", rate: 100 }
  ];

  // Loop untuk deploy massal otomatis & daftarkan harga ke Router
  for (const t of tokenData) {
    const token = await TokenFactory.deploy(t.name, t.symbol);
    await token.waitForDeployment();
    const tokenAddress = await token.getAddress();
    console.log(`${t.symbol} deployed to: ${tokenAddress}`);

    // Daftarkan alamat contract token beserta harganya ke SimpleSwap
    const tx = await swap.setTokenRate(tokenAddress, t.rate);
    await tx.wait();

    deployedTokens.push({ address: tokenAddress, symbol: t.symbol, rate: t.rate });
  }

  // Supply initial liquidity ke pool (500,000 tokens per coin)
  console.log("\nSupplying initial liquidity to pool...");
  const liquidityAmount = hre.ethers.parseEther("500000"); // 500,000 tokens

  for (const token of deployedTokens) {
    const contract = await hre.ethers.getContractAt("MockUSDT", token.address);

    // Approve swap contract
    const approveTx = await contract.approve(swapAddress, liquidityAmount);
    await approveTx.wait();

    // Transfer ke pool via addLiquidity
    const addLiqTx = await swap.addLiquidity(token.address, liquidityAmount);
    await addLiqTx.wait();

    console.log(`✓ Added ${hre.ethers.formatEther(liquidityAmount)} ${token.symbol} to pool`);
  }

  console.log("\nSemua ekosistem koin sukses terhubung on-chain dengan liquidity!");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});