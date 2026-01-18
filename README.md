# MiniDex - Stablecoin Mini DEX

A minimal, gas-efficient decentralized exchange for stablecoin swaps on Base Chain Mainnet.

## Overview

MiniDex is a single-pool AMM designed exclusively for USDC/USDT swaps with near-zero slippage. The design prioritizes simplicity, readability, and correctness over feature richness.

### Key Features

- **Single Pool**: USDC/USDT only
- **Near-Zero Slippage**: Optimized stable-swap curve
- **Fixed Swap Fee**: 0.0000015 ETH per swap
- **Minimal Design**: No governance, no upgrades, no pause logic
- **Gas Efficient**: Optimized for low transaction costs

## Contract Addresses (Base Mainnet)

| Contract | Address |
|----------|---------|
| USDC | `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913` |
| USDT | `0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2` |
| StablePool | `0x47f4b9bDbaa5e1fB2fC4cCac446610456B406BCC` |

## AMM Math Explanation

### The Stable-Swap Invariant

MiniDex uses a simplified stable-swap formula optimized for stablecoin pairs. The approach combines two AMM models:

#### 1. Constant-Sum (x + y = k)
- Perfect for pegged assets
- Zero slippage at all trade sizes
- Problem: Can be fully drained in one direction

#### 2. Constant-Product (x * y = k)
- Used by Uniswap V2
- Provides infinite liquidity depth
- Problem: High slippage for stablecoin swaps

#### Our Hybrid Approach

We use an **amplified weighted average** of both models:

```
amountOut = (A * constantSumOut + constantProductOut) / (A + 1)
```

Where:
- `A = 100` (amplification coefficient)
- `constantSumOut = amountIn` (1:1 exchange)
- `constantProductOut = amountIn * reserveOut / (reserveIn + amountIn)`

**Effect**: With A=100, approximately 99% of the output follows constant-sum behavior (1:1), while 1% follows constant-product for safety at extreme imbalances.

### Mathematical Properties

For a balanced pool with 100,000 USDC and 100,000 USDT:

| Swap Size | Slippage |
|-----------|----------|
| $100 | < 0.01% |
| $1,000 | < 0.1% |
| $10,000 | < 1% |

### Decimal Handling

Both USDC and USDT use 6 decimals. Internally, we normalize to 18 decimals for calculations:

```solidity
uint256 normalizedAmount = rawAmount * 10^(18 - tokenDecimals)
```

## Frontend

The frontend is a simple web interface for interacting with the DEX.

### Running the Frontend

```bash
# Install dependencies
cd frontend
npm install

# Start development server
npm run dev
```

The frontend will be available at `http://localhost:5173`

### Features

- Connect wallet (MetaMask, etc.)
- Swap USDC ↔ USDT
- Add/Remove liquidity
- View pool reserves
- Real-time price calculations

## Integration Guide

### JavaScript/TypeScript

```javascript
import { ethers } from 'ethers';

const POOL_ADDRESS = '0x47f4b9bDbaa5e1fB2fC4cCac446610456B406BCC';
const SWAP_FEE = ethers.parseEther('0.0000015');

// Swap USDC to USDT
async function swap(signer, amountIn, minAmountOut) {
  const pool = new ethers.Contract(POOL_ADDRESS, POOL_ABI, signer);
  
  // Approve USDC first
  await usdc.approve(POOL_ADDRESS, amountIn);
  
  // Execute swap
  const tx = await pool.swap(
    USDC_ADDRESS,
    amountIn,
    minAmountOut,
    { value: SWAP_FEE }
  );
  
  return tx;
}
```

### Reading Pool State

```javascript
// Get reserves
const [reserveUSDC, reserveUSDT] = await pool.getReserves();

// Get expected output
const amountOut = await pool.getAmountOut(USDC_ADDRESS, amountIn);
```

## Security Considerations

### Implemented Protections

1. **Reentrancy Safety**: State updated before external calls
2. **Slippage Protection**: `minAmountOut` parameter on swaps
3. **Safe ERC20**: Handles non-standard tokens (USDT)
4. **Input Validation**: All inputs validated with clear revert messages
5. **No Upgrades**: Immutable contract, no proxy pattern
6. **No Admin Functions**: Cannot be rugged by owner

### Known Limitations

1. **No Oracle**: Assumes 1:1 peg, vulnerable to depeg events
2. **Single Pool**: No routing, only USDC/USDT
3. **Fixed Fee**: Cannot adjust fee without redeployment
4. **No Flash Loans**: Not implemented

## Gas Estimates

| Operation | Estimated Gas |
|-----------|---------------|
| swap | ~80,000 - 100,000 |
| addLiquidity | ~120,000 - 150,000 |
| removeLiquidity | ~100,000 - 130,000 |

## Project Structure

```
miniDex/
├── src/
│   ├── StablePool.sol      # Main AMM contract
│   ├── LPToken.sol         # LP token (ERC20)
│   └── interfaces/
│       ├── IERC20.sol      # ERC20 interface
│       └── IStablePool.sol # Pool interface
├── frontend/               # Web frontend
│   ├── index.html
│   ├── src/
│   │   └── app.js
│   └── package.json
├── foundry.toml            # Foundry config
└── README.md               # This file
```

## 🤝 Contributing

We welcome contributions to the MiniDEX project! Here's how you can help:

### Ways to Contribute
- **Smart Contract Improvements**: Optimize gas efficiency, add new features, enhance security
- **Frontend Development**: Improve the UI/UX, add new features, optimize performance
- **AMM Research**: Research and implement better stable-swap curves or liquidity mechanisms
- **Testing**: Add comprehensive test coverage for contracts and frontend
- **Documentation**: Improve README, add tutorials, create developer guides
- **Integration**: Add support for more tokens or integrate with other protocols

### Development Workflow
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Make your changes and ensure tests pass
4. Run the test suite: `forge test && cd frontend && npm test`
5. Submit a pull request with a clear description

### Code Standards
- Follow existing code patterns and Solidity best practices
- Add tests for new functionality
- Update documentation for significant changes
- Ensure backward compatibility where possible
- Use descriptive commit messages

### Smart Contract Guidelines
- Use OpenZeppelin contracts for security
- Add comprehensive test coverage with Foundry
- Optimize for gas efficiency
- Include proper error handling and revert messages
- Document complex mathematical operations

### Frontend Guidelines
- Use TypeScript for type safety
- Follow React best practices
- Ensure mobile responsiveness
- Test on multiple wallet connections
- Handle error states gracefully

### Testing
- All smart contract functions should have unit tests
- Frontend should have integration tests
- Test on both testnet and mainnet
- Include edge cases and failure scenarios

### Security Considerations
- Never modify the AMM math without thorough testing
- Be cautious with external contract calls
- Validate all user inputs
- Consider economic incentives when making changes

---

## License

MIT License
