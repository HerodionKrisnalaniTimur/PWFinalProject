// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IERC20 {
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

contract SimpleSwap {
    IERC20 public tokenZTX;
    IERC20 public tokenUSDT;
    
    uint256 public rate = 10; 

    // Mapping untuk mencatat berapa banyak likuiditas yang disediakan oleh user
    mapping(address => uint256) public liquidityProviderZTX;
    mapping(address => uint256) public liquidityProviderUSDT;

    constructor(address _tokenZTX, address _tokenUSDT) {
        tokenZTX = IERC20(_tokenZTX);
        tokenUSDT = IERC20(_tokenUSDT);
    }

    // WAJIB ADA: Fungsi utama untuk menambahkan likuiditas ke dalam Pool
    function addLiquidity(uint256 amountZtx, uint256 amountUsdt) external returns (uint256) {
        require(amountZtx > 0 && amountUsdt > 0, "Nominal harus lebih dari 0");

        // Tarik token ZTX dari dompet user ke dalam kontrak ini
        require(tokenZTX.transferFrom(msg.sender, address(this), amountZtx), "Transfer ZTX gagal");
        
        // Tarik token USDT dari dompet user ke dalam kontrak ini
        require(tokenUSDT.transferFrom(msg.sender, address(this), amountUsdt), "Transfer USDT gagal");

        // Catat kontribusi likuiditas user
        liquidityProviderZTX[msg.sender] += amountZtx;
        liquidityProviderUSDT[msg.sender] += amountUsdt;

        return amountZtx; // Mengembalikan tanda sukses
    }

    // Fungsi Swap USDT menjadi ZTX (Mengambil dari cadangan likuiditas kontrak)
    function swapUsdtForZtx(uint256 amountUSDT) public {
        uint256 amountZTX = amountUSDT * rate;
        
        require(tokenUSDT.transferFrom(msg.sender, address(this), amountUSDT), "Gagal menarik USDT");
        require(tokenZTX.balanceOf(address(this)) >= amountZTX, "Cadangan likuiditas ZTX di Pool kosong!");
        
        require(tokenZTX.transfer(msg.sender, amountZTX), "Transfer ZTX ke user gagal");
    }
}