// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract GymCoin is ERC20, Ownable {
    // Exchange rates (1 GC = X ETH)
    uint256 private _sellRate; // Rate to sell tokens to users
    uint256 private _buyRate;  // Rate to buy tokens from users
    
    // Events
    event RatesUpdated(uint256 sellRate, uint256 buyRate);
    event TokensPurchased(address buyer, uint256 amountGC, uint256 amountETH);
    event TokensSold(address seller, uint256 amountGC, uint256 amountETH);
    
    constructor(uint256 initialSupply, uint256 sellRate, uint256 buyRate) ERC20("Gym Coin", "GC") {
        _mint(msg.sender, initialSupply);
        _sellRate = sellRate;
        _buyRate = buyRate;
    }
    
    // Buy GC tokens with ETH
    function buy(uint256 gcAmount) public payable {
        // Calculate ETH amount required
        uint256 ethRequired = gcAmount * _sellRate / 1 ether;
        
        // Check if enough ETH was sent
        require(msg.value >= ethRequired, "Not enough ETH sent");
        
        // Check if contract owner has enough tokens
        require(balanceOf(owner()) >= gcAmount, "Not enough tokens available");
        
        // Transfer tokens from owner to buyer
        _transfer(owner(), msg.sender, gcAmount);
        
        // Calculate and refund excess ETH if any
        uint256 excess = msg.value - ethRequired;
        if (excess > 0) {
            payable(msg.sender).transfer(excess);
        }
        
        emit TokensPurchased(msg.sender, gcAmount, ethRequired);
    }
    
    // Sell GC tokens to receive ETH
    function sell(uint256 gcAmount) public {
        // Check user has enough tokens
        require(balanceOf(msg.sender) >= gcAmount, "Not enough tokens");
        
        // Calculate ETH to return
        uint256 ethToReturn = gcAmount * _buyRate / 1 ether;
        
        // Check contract has enough ETH
        require(address(this).balance >= ethToReturn, "Contract doesn't have enough ETH");
        
        // Transfer tokens from seller to owner
        _transfer(msg.sender, owner(), gcAmount);
        
        // Transfer ETH to seller
        payable(msg.sender).transfer(ethToReturn);
        
        emit TokensSold(msg.sender, gcAmount, ethToReturn);
    }
    
    // Update exchange rates (only owner)
    function setRates(uint256 sellRate, uint256 buyRate) public onlyOwner {
        require(sellRate > 0, "Sell rate must be positive");
        require(buyRate > 0, "Buy rate must be positive");
        require(buyRate <= sellRate, "Buy rate should be less or equal to sell rate");
        
        _sellRate = sellRate;
        _buyRate = buyRate;
        
        emit RatesUpdated(sellRate, buyRate);
    }
    
    // Get current rates
    function getRates() public view returns (uint256 sellRate, uint256 buyRate) {
        return (_sellRate, _buyRate);
    }
    
    // Fund contract with ETH (for buying tokens back)
    function fundContract() public payable onlyOwner {
        // Just receive ETH
    }
    
    // Allow contract to receive ETH
    receive() external payable {}
    fallback() external payable {}
}