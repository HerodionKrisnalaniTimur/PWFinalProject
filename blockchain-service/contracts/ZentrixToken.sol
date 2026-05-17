// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IERC20 {
    function transfer(address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

contract ZentrixToken {
    string public name = "Zentrix";
    string public symbol = "ZTX";
    uint8 public decimals = 18;
    uint256 public totalSupply = 1000000 * 10**18; // 1 Juta Token ZTX
    mapping(address => uint256) public balanceOf;

    constructor() {
        balanceOf[msg.sender] = totalSupply; // Semua token diberikan ke pembuat kontrak
    }

    function transfer(address to, uint256 amount) public returns (bool) {
        require(balanceOf[msg.sender] >= amount, "Saldo tidak cukup");
        balanceOf[msg.sender] -= amount;
        balanceOf[to] += amount;
        return true;
    }
}