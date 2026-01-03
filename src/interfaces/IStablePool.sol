// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title IStablePool - Interface for the StablePool contract
/// @notice Minimal interface for interacting with the USDC/USDT stable pool
interface IStablePool {
    /// @notice Emitted when liquidity is added to the pool
    event LiquidityAdded(
        address indexed provider,
        uint256 amountUSDC,
        uint256 amountUSDT,
        uint256 lpTokensMinted
    );

    /// @notice Emitted when liquidity is removed from the pool
    event LiquidityRemoved(
        address indexed provider,
        uint256 amountUSDC,
        uint256 amountUSDT,
        uint256 lpTokensBurned
    );

    /// @notice Emitted when a swap occurs
    event Swap(
        address indexed user,
        address indexed tokenIn,
        address indexed tokenOut,
        uint256 amountIn,
        uint256 amountOut,
        uint256 fee
    );

    /// @notice Add liquidity to the pool
    /// @param amountUSDC Amount of USDC to deposit
    /// @param amountUSDT Amount of USDT to deposit
    /// @param minLpTokens Minimum LP tokens to receive (slippage protection)
    /// @return lpTokens Amount of LP tokens minted
    function addLiquidity(
        uint256 amountUSDC,
        uint256 amountUSDT,
        uint256 minLpTokens
    ) external returns (uint256 lpTokens);

    /// @notice Remove liquidity from the pool
    /// @param lpTokens Amount of LP tokens to burn
    /// @param minUSDC Minimum USDC to receive (slippage protection)
    /// @param minUSDT Minimum USDT to receive (slippage protection)
    /// @return amountUSDC Amount of USDC returned
    /// @return amountUSDT Amount of USDT returned
    function removeLiquidity(
        uint256 lpTokens,
        uint256 minUSDC,
        uint256 minUSDT
    ) external returns (uint256 amountUSDC, uint256 amountUSDT);

    /// @notice Swap tokens
    /// @param tokenIn Address of input token (USDC or USDT)
    /// @param amountIn Amount of input tokens
    /// @param minAmountOut Minimum output tokens (slippage protection)
    /// @return amountOut Amount of output tokens received
    function swap(
        address tokenIn,
        uint256 amountIn,
        uint256 minAmountOut
    ) external payable returns (uint256 amountOut);

    /// @notice Get current reserves
    /// @return reserveUSDC Current USDC reserve
    /// @return reserveUSDT Current USDT reserve
    function getReserves() external view returns (uint256 reserveUSDC, uint256 reserveUSDT);

    /// @notice Calculate output amount for a swap
    /// @param tokenIn Address of input token
    /// @param amountIn Amount of input tokens
    /// @return amountOut Expected output amount
    function getAmountOut(
        address tokenIn,
        uint256 amountIn
    ) external view returns (uint256 amountOut);
}
