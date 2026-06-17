// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract MultiToken {
    string public name;
    string public symbol;
    uint8 public decimals = 18;
    uint256 public totalSupply = 1000000 * 10**18; // 1 Juta Token
    
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    // Sekarang nama dan simbol bisa ditentukan secara dinamis saat deploy
    constructor(string memory _name, string memory _symbol) {
        name = _name;
        symbol = _symbol;
        balanceOf[msg.sender] = totalSupply; 
    }

    function transfer(address to, uint256 amount) public returns (bool) {
        require(balanceOf[msg.sender] >= amount, "Saldo tidak cukup");
        balanceOf[msg.sender] -= amount;
        balanceOf[to] += amount;
        return true;
    }

    function approve(address spender, uint256 amount) public returns (bool) {
        allowance[msg.sender][spender] = amount;
        return true;
    }

    function transferFrom(address from, address to, uint256 amount) public returns (bool) {
        require(balanceOf[from] >= amount, "Saldo tidak cukup");
        require(allowance[from][msg.sender] >= amount, "Belum di-approve");
        balanceOf[from] -= amount;
        balanceOf[to] += amount;
        allowance[from][msg.sender] -= amount;
        return true;
    }
}