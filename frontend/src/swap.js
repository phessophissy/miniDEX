// Swap operations service

import { ethers } from 'ethers';

/**
 * Calculate swap output amount
 */
export async function calculateSwapOutput(poolContract, tokenIn, amountIn) {
  try {
    const amountOut = await poolContract.getAmountOut(tokenIn, amountIn);
    return amountOut.toString();
  } catch (error) {
    console.error('Failed to calculate swap output:', error);
    throw error;
  }
}

/**
 * Calculate price impact for swap
 */
export function calculateSwapPriceImpact(amountIn, amountOut) {
  if (!amountIn || !amountOut) return 0;

  const input = parseFloat(amountIn);
  const output = parseFloat(amountOut);

  if (input === 0) return 0;

  const perfectOutput = input; // 1:1 for stables
  const impact = ((perfectOutput - output) / perfectOutput) * 100;

  return Math.max(0, impact);
}

/**
 * Calculate minimum output with slippage
 */
export function calculateMinimumOutput(amountOut, slippagePercent) {
  if (!amountOut || slippagePercent === null) return '0';

  const amount = parseFloat(amountOut);
  const slippage = (amount * slippagePercent) / 100;
  const minimum = amount - slippage;

  return Math.max(0, minimum).toString();
}

/**
 * Execute swap transaction
 */
export async function executeSwap(
  poolContract,
  tokenIn,
  amountIn,
  minAmountOut,
  swapFee,
  options = {}
) {
  try {
    const tx = await poolContract.swap(
      tokenIn,
      amountIn,
      minAmountOut,
      {
        value: swapFee,
        ...options
      }
    );

    return tx;
  } catch (error) {
    console.error('Swap execution failed:', error);
    throw error;
  }
}

/**
 * Estimate swap gas
 */
export async function estimateSwapGas(
  poolContract,
  tokenIn,
  amountIn,
  minAmountOut,
  swapFee
) {
  try {
    const gasEstimate = await poolContract.swap.estimateGas(
      tokenIn,
      amountIn,
      minAmountOut,
      { value: swapFee }
    );

    return (BigInt(gasEstimate) * BigInt(120)) / BigInt(100); // 20% buffer
  } catch (error) {
    console.error('Gas estimation failed:', error);
    // Return default estimate
    return BigInt(100000);
  }
}

/**
 * Build swap transaction
 */
export async function buildSwapTransaction(
  poolAddress,
  tokenIn,
  amountIn,
  minAmountOut,
  swapFee
) {
  const iface = new ethers.Interface([
    'function swap(address tokenIn, uint256 amountIn, uint256 minAmountOut) external payable returns (uint256 amountOut)'
  ]);

  const data = iface.encodeFunctionData('swap', [
    tokenIn,
    amountIn,
    minAmountOut
  ]);

  return {
    to: poolAddress,
    data,
    value: swapFee
  };
}

/**
 * Simulate swap
 */
export async function simulateSwap(poolContract, tokenIn, amountIn) {
  try {
    const amountOut = await poolContract.getAmountOut(tokenIn, amountIn);
    const priceImpact = calculateSwapPriceImpact(amountIn, amountOut);

    return {
      amountOut: amountOut.toString(),
      priceImpact,
      spotPrice: 1.0
    };
  } catch (error) {
    console.error('Swap simulation failed:', error);
    throw error;
  }
}

/**
 * Get swap history for address
 */
export async function getSwapHistory(poolContract, userAddress, fromBlock, toBlock) {
  try {
    const swapEvents = await poolContract.queryFilter(
      poolContract.filters.Swap(userAddress),
      fromBlock,
      toBlock
    );

    return swapEvents.map(event => ({
      hash: event.transactionHash,
      blockNumber: event.blockNumber,
      tokenIn: event.args.tokenIn,
      tokenOut: event.args.tokenOut,
      amountIn: event.args.amountIn.toString(),
      amountOut: event.args.amountOut.toString(),
      fee: event.args.fee.toString(),
      timestamp: event.timestamp
    }));
  } catch (error) {
    console.error('Failed to get swap history:', error);
    return [];
  }
}

/**
 * Check if swap is profitable
 */
export function isSwapProfitable(amountIn, amountOut, fee) {
  const amount = parseFloat(amountIn);
  const output = parseFloat(amountOut);
  const feeAmount = parseFloat(fee);

  const profitMargin = output - amount - feeAmount;
  return profitMargin > 0;
}

/**
 * Get best rate for swap
 */
export async function getBestSwapRate(poolContract, tokenIn, amountIn) {
  try {
    const amountOut = await poolContract.getAmountOut(tokenIn, amountIn);
    const rate = parseFloat(amountOut) / parseFloat(amountIn);

    return {
      rate,
      amountOut: amountOut.toString(),
      ratePerUnit: rate.toFixed(6)
    };
  } catch (error) {
    console.error('Failed to get swap rate:', error);
    throw error;
  }
}

/**
 * Validate swap amounts
 */
export function validateSwapAmounts(amountIn, amountOut, minAmountOut) {
  if (!amountIn || parseFloat(amountIn) <= 0) {
    return { valid: false, error: 'Invalid input amount' };
  }

  if (!amountOut || parseFloat(amountOut) < parseFloat(minAmountOut)) {
    return { valid: false, error: 'Output below minimum' };
  }

  return { valid: true };
}

/**
 * Get swap statistics
 */
export async function getSwapStatistics(poolContract, tokenIn, amounts = []) {
  try {
    const stats = await Promise.all(
      amounts.map(amount => poolContract.getAmountOut(tokenIn, amount))
    );

    return stats.map((output, idx) => ({
      inputAmount: amounts[idx],
      outputAmount: output.toString(),
      priceImpact: calculateSwapPriceImpact(amounts[idx], output)
    }));
  } catch (error) {
    console.error('Failed to get swap statistics:', error);
    return [];
  }
}
