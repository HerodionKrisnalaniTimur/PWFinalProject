// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract ZentrixToken {
    string public name = "Zentrix";
    string public symbol = "ZTX";
    uint8 public decimals = 18;
    uint256 public totalSupply = 1000000 * 10**18; // 1 Juta Token ZTX
    
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    constructor() {
        balanceOf[msg.sender] = totalSupply; // Semua token diberikan ke deployer
    }

    function transfer(address to, uint256 amount) public returns (bool) {
        require(balanceOf[msg.sender] >= amount, "Saldo tidak cukup");
        balanceOf[msg.sender] -= amount;
        balanceOf[to] += amount;
        return true;
    }

    // WAJIB ADA: Memberikan izin akses token ke kontrak Pool
    function approve(address spender, uint256 amount) public returns (bool) {
        allowance[msg.sender][spender] = amount;
        return true;
    }

    // WAJIB ADA: Mengizinkan kontrak Pool menarik token dari user setelah di-approve
    function transferFrom(address from, address to, uint256 amount) public returns (bool) {
        require(balanceOf[from] >= amount, "Saldo tidak cukup");
        require(allowance[from][msg.sender] >= amount, "Belum di-approve");
        balanceOf[from] -= amount;
        balanceOf[to] += amount;
        allowance[from][msg.sender] -= amount;
        return true;
    }
}