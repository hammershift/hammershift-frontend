// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title MockUSDC
 * @notice Test USDC token for Polygon Amoy testnet.
 * Matches real USDC: 6 decimals, same symbol.
 * Includes a public faucet for testers and owner mint for seeding markets.
 */
contract MockUSDC is ERC20, Ownable {
    uint256 public constant MAX_FAUCET_AMOUNT = 10_000 * 1e6; // $10,000 per call

    constructor() ERC20("USD Coin (Test)", "USDC") Ownable(msg.sender) {
        // Mint $1M to deployer for seeding initial market liquidity pools
        _mint(msg.sender, 1_000_000 * 1e6);
    }

    function decimals() public pure override returns (uint8) {
        return 6;
    }

    /// @notice Public faucet — get up to $10,000 USDC for testing
    function faucet(uint256 amount) external {
        require(amount <= MAX_FAUCET_AMOUNT, "Max faucet amount is $10,000");
        _mint(msg.sender, amount);
    }

    /// @notice Owner can mint arbitrary amounts (used to top up market seeds)
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }
}
