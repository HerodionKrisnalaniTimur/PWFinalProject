// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// Interface standar ERC20 agar kontrak ini bisa berinteraksi dengan token
interface IERC20 {
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

contract SimpleSwap {
    IERC20 public tokenZTX;
    IERC20 public tokenUSDT;
    
    // Nilai tukar tetap: 1 USDT = 10 ZTX (bisa Anda sesuaikan nanti)
    uint256 public rate = 10; 

    constructor(address _tokenZTX, address _tokenUSDT) {
        tokenZTX = IERC20(_tokenZTX);
        tokenUSDT = IERC20(_tokenUSDT);
    }

    // Fungsi utama untuk menukar USDT menjadi ZTX
    function swapUsdtForZtx(uint256 amountUSDT) public {
        uint256 amountZTX = amountUSDT * rate;
    require(tokenZTX.balanceOf(msg.sender) >= amountZTX, "Saldo ZTX tidak cukup");

    require(tokenUSDT.balanceOf(msg.sender) >= amountUSDT, "Saldo USDT tidak cukup");
        
        // Kirim ZTX dari contract ke user
    require(tokenZTX.transfer(msg.sender, amountZTX), "Transfer ZTX gagal");
    }
}