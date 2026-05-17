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

        require(tokenZTX.balanceOf(address(this)) >= amountZTX, "Contract tidak memiliki cukup ZTX");
        
        // Tarik USDT dari user ke contract
        require(tokenUSDT.transferFrom(msg.sender, address(this), amountUSDT), "Transfer USDT gagal. Pastikan sudah Approve");
        
        // Kirim ZTX dari contract ke user
        require(tokenZTX.transfer(msg.sender, amountZTX), "Transfer ZTX gagal");
    }
}