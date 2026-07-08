// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IERC20 {
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

contract SimpleSwap {
    address public tokenUSDT;
    address public owner;

    // Mapping Alamat Token -> Nilai Token terhadap USDT (Skala Pengali basis 100)
    mapping(address => uint256) public tokenRates;
    mapping(address => bool) public isSupportedToken;

    // Mapping untuk melacak setoran likuiditas per user per token
    mapping(address => mapping(address => uint256)) public liquidityPool;

    mapping(address => uint256) public totalLiquidity;

    constructor(address _tokenUSDT) {
        tokenUSDT = _tokenUSDT;
        owner = msg.sender;
        
        // Daftarkan USDT ke dalam list dengan rate 1.0 (100)
        tokenRates[_tokenUSDT] = 100;
        isSupportedToken[_tokenUSDT] = true;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Bukan pemilik kontrak");
        _;}

    // Fungsi bagi Owner untuk mendaftarkan / memperbarui koin game baru beserta harganya
    function setTokenRate(address tokenAddress, uint256 rateInUsdtScaled) external onlyOwner {
        require(tokenAddress != address(0), "Alamat tidak valid");
        tokenRates[tokenAddress] = rateInUsdtScaled;
        isSupportedToken[tokenAddress] = true;
    }

    // Fungsi Universal untuk menambahkan likuiditas koin apa saja ke dalam Pool
    function addLiquidity(
    address tokenAddress,
    uint256 amount
        ) external returns (bool) {

            require(
                isSupportedToken[tokenAddress],
                "Token tidak didukung"
            );

            require(
                amount > 0,
                "Nominal harus lebih dari 0"
            );

            require(
                IERC20(tokenAddress).transferFrom(
                    msg.sender,
                    address(this),
                    amount
                ),
                "Transfer ke pool gagal"
            );

            liquidityPool[msg.sender][tokenAddress] += amount;

            totalLiquidity[tokenAddress] += amount;

            return true;
        }

    // FUNGSI INTI: Multi-Token Cross Swap (Bisa Swap MJK ke AGT, ZTX ke USDT, dll)
    function swap(address tokenIn, address tokenOut, uint256 amountIn) external {
        require(isSupportedToken[tokenIn] && isSupportedToken[tokenOut], "Rute token tidak didukung");
        require(amountIn > 0, "Nominal swap harus lebih dari 0");

        uint256 rateIn = tokenRates[tokenIn];
        uint256 rateOut = tokenRates[tokenOut];

        // Rumus Cross-Swap Universal Aman Desimal:
        // AmountOut = (AmountIn * RateIn) / RateOut
        uint256 amountOut = (amountIn * rateIn) / rateOut;

        // Ambil token asal dari dompet user
        require(IERC20(tokenIn).transferFrom(msg.sender, address(this), amountIn), "Gagal menarik token asal");
        
        // Periksa apakah cadangan likuiditas di dalam pool mencukupi
        require(IERC20(tokenOut).balanceOf(address(this)) >= amountOut, "Likuiditas koin tujuan di pool tidak cukup!");

        // Kirim koin hasil swap ke dompet user
        require(IERC20(tokenOut).transfer(msg.sender, amountOut), "Gagal mengirimkan koin hasil swap");
    }

    function removeLiquidity(
    address tokenAddress,
    uint256 amount
    ) external {

        require(
            liquidityPool[msg.sender][tokenAddress] >= amount,
            "Liquidity tidak cukup"
        );

        liquidityPool[msg.sender][tokenAddress] -= amount;

        totalLiquidity[tokenAddress] -= amount;

        require(
            IERC20(tokenAddress).transfer(
                msg.sender,
                amount
            ),
            "Transfer gagal"
        );
    }

    function getUserLiquidity(
    address user,
            address token
        )
            external
            view
            returns(uint256)
        {
            return liquidityPool[user][token];
        }

    function getPoolLiquidity(
    address token
    )
        external
        view
        returns(uint256)
    {
        return totalLiquidity[token];
    }
}