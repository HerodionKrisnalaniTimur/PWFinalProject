// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IERC20 {
    function transfer(address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

contract Faucet {
    // Mapping untuk mencatat: alamat_user => alamat_token => timestamp_klaim_terakhir
    mapping(address => mapping(address => uint256)) public lastAccessTime;
    
    // Pembatasan jeda waktu tunggu (24 jam)
    uint256 public constant cooldownTime = 1 days;
    
    // Nominal token uji coba yang diberikan (100 Token dengan basis skala 18 desimal)
    uint256 public constant claimAmount = 100 * 10**18;

    event TokenClaimed(address indexed user, address indexed token, uint256 amount);

    // Fungsi utama yang dipanggil oleh frontend untuk mengklaim koin
    function requestTokens(address tokenAddress) external {
        // 1. Validasi apakah user masih dalam masa jeda waktu tunggu 24 jam
        require(
            block.timestamp >= lastAccessTime[msg.sender][tokenAddress] + cooldownTime,
            "Error: Kamu harus menunggu 24 jam sebelum mengklaim koin ini lagi!"
        );

        // 2. Validasi apakah koin cadangan di dalam brankas Faucet mencukupi
        uint256 faucetBalance = IERC20(tokenAddress).balanceOf(address(this));
        require(faucetBalance >= claimAmount, "Error: Saldo koin di Faucet habis, hubungi admin!");

        // 3. Update catatan waktu klaim terbaru milik user tersebut
        lastAccessTime[msg.sender][tokenAddress] = block.timestamp;

        // 4. Kirim koin uji coba langsung ke dompet user
        require(IERC20(tokenAddress).transfer(msg.sender, claimAmount), "Error: Pengiriman token gratis gagal");

        emit TokenClaimed(msg.sender, tokenAddress, claimAmount);
    }

    // Fungsi pembantu untuk membaca sisa waktu tunggu milik user (dalam hitungan detik)
    function getSisaWaktu(address user, address tokenAddress) external view returns (uint256) {
        if (block.timestamp >= lastAccessTime[user][tokenAddress] + cooldownTime) {
            return 0; // Sudah siap klaim kembali
        }
        return (lastAccessTime[user][tokenAddress] + cooldownTime) - block.timestamp;
    }
}