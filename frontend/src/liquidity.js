// Liquidity operations service

import { ethers } from 'ethers';

/**
 * Calculate LP tokens for liquidity provision
 */
export async function calculateLPTokens(
  poolContract,
  amountUSDC,
  amountUSDT
) {
  try {
    // This is a simplified calculation
    // Real implementation would depend on pool's mathematical formula
    const reserves = await poolContract.getReserves();
    const reserveUSDC = BigInt(reserves[0]);
    const reserveUSDT = BigInt(reserves[1]);

    const amount1 = BigInt(amountUSDC);
    const amount2 = BigInt(amountUSDT);

    if (reserveUSDC === 0n || reserveUSDT === 0n) {
      // Initial liquidity
      const lpTokens = amount1 + amount2;
      return lpTokens.toString();
    }

    // Simplified calculation
    const share1 = (amount1 * reserveUSDT) / (reserveUSDC + amount1);
    const share2 = (amount2 * reserveUSDT) / (reserveUSDT + amount2);

    return ((share1 + share2) / 2n).toString();
  } catch (error) {
    console.error('Failed to calculate LP tokens:', error);
    throw error;
  }
}

/**
 * Execute add liquidity transaction
 */
export async function executeAddLiquidity(
  poolContract,
  amountUSDC,
  amountUSDT,
  minLPTokens,
  options = {}
) {
  try {
    const tx = await poolContract.addLiquidity(
      amountUSDC,
      amountUSDT,
      minLPTokens,
      options
    );

    return tx;
  } catch (error) {
    console.error('Add liquidity execution failed:', error);
    throw error;
  }
}

/**
 * Execute remove liquidity transaction
 */
export async function executeRemoveLiquidity(
  poolContract,
  lpTokens,
  minUSDC,
  minUSDT,
  options = {}
) {
  try {
    const tx = await poolContract.removeLiquidity(
      lpTokens,
      minUSDC,
      minUSDT,
      options
    );

    return tx;
  } catch (error) {
    console.error('Remove liquidity execution failed:', error);
    throw error;
  }
}

/**
 * Get liquidity position details
 */
export async function getLiquidityPosition(
  poolContract,
  lpTokenContract,
  userAddress
) {
  try {
    const [reserves, lpBalance] = await Promise.all([
      poolContract.getReserves(),
      lpTokenContract.balanceOf(userAddress)
    ]);

    const totalSupply = await lpTokenContract.totalSupply();

    // Calculate user's share
    const userShare = (BigInt(lpBalance) * BigInt(100)) / BigInt(totalSupply);

    return {
      lpTokens: lpBalance.toString(),
      share: userShare.toString(),
      reserveUSDC: reserves[0].toString(),
      reserveUSDT: reserves[1].toString(),
      totalSupply: totalSupply.toString()
    };
  } catch (error) {
    console.error('Failed to get liquidity position:', error);
    throw error;
  }
}

/**
 * Calculate removal amounts
 */
export async function calculateRemovalAmounts(
  poolContract,
  lpTokens,
  lpBalance
) {
  try {
    const reserves = await poolContract.getReserves();
    const totalSupply = (await poolContract.lpTokenAddress?.then(addr =>
      // Get total supply from LP token contract
      ethers.provider?.getCode(addr).then(() => BigInt('1000000000000000000'))
    )) || BigInt('1000000000000000000');

    const share = (BigInt(lpTokens) * BigInt(100)) / BigInt(lpBalance);

    const amountUSDC = (BigInt(reserves[0]) * share) / BigInt(100);
    const amountUSDT = (BigInt(reserves[1]) * share) / BigInt(100);

    return {
      amountUSDC: amountUSDC.toString(),
      amountUSDT: amountUSDT.toString(),
      share: share.toString()
    };
  } catch (error) {
    console.error('Failed to calculate removal amounts:', error);
    throw error;
  }
}

/**
 * Estimate add liquidity gas
 */
export async function estimateAddLiquidityGas(
  poolContract,
  amountUSDC,
  amountUSDT,
  minLPTokens
) {
  try {
    const gasEstimate = await poolContract.addLiquidity.estimateGas(
      amountUSDC,
      amountUSDT,
      minLPTokens
    );

    return (BigInt(gasEstimate) * BigInt(120)) / BigInt(100); // 20% buffer
  } catch (error) {
    console.error('Gas estimation failed:', error);
    return BigInt(150000);
  }
}

/**
 * Estimate remove liquidity gas
 */
export async function estimateRemoveLiquidityGas(
  poolContract,
  lpTokens,
  minUSDC,
  minUSDT
) {
  try {
    const gasEstimate = await poolContract.removeLiquidity.estimateGas(
      lpTokens,
      minUSDC,
      minUSDT
    );

    return (BigInt(gasEstimate) * BigInt(120)) / BigInt(100); // 20% buffer
  } catch (error) {
    console.error('Gas estimation failed:', error);
    return BigInt(130000);
  }
}

/**
 * Get liquidity statistics
 */
export async function getLiquidityStatistics(poolContract, userAddress) {
  try {
    const reserves = await poolContract.getReserves();
    const lpToken = await poolContract.getLPToken();

    return {
      totalLiquidity: (BigInt(reserves[0]) + BigInt(reserves[1])).toString(),
      ratio: (BigInt(reserves[0]) / BigInt(reserves[1])).toString(),
      usdcAmount: reserves[0].toString(),
      usdtAmount: reserves[1].toString()
    };
  } catch (error) {
    console.error('Failed to get liquidity statistics:', error);
    throw error;
  }
}

/**
 * Validate liquidity addition
 */
export function validateLiquidityAddition(
  amountUSDC,
  amountUSDT,
  usdcBalance,
  usdtBalance
) {
  if (!amountUSDC || parseFloat(amountUSDC) <= 0) {
    return { valid: false, error: 'Invalid USDC amount' };
  }

  if (!amountUSDT || parseFloat(amountUSDT) <= 0) {
    return { valid: false, error: 'Invalid USDT amount' };
  }

  if (parseFloat(amountUSDC) > parseFloat(usdcBalance)) {
    return { valid: false, error: 'Insufficient USDC balance' };
  }

  if (parseFloat(amountUSDT) > parseFloat(usdtBalance)) {
    return { valid: false, error: 'Insufficient USDT balance' };
  }

  return { valid: true };
}

/**
 * Validate liquidity removal
 */
export function validateLiquidityRemoval(lpTokens, lpBalance) {
  if (!lpTokens || parseFloat(lpTokens) <= 0) {
    return { valid: false, error: 'Invalid LP token amount' };
  }

  if (parseFloat(lpTokens) > parseFloat(lpBalance)) {
    return { valid: false, error: 'Insufficient LP token balance' };
  }

  return { valid: true };
}

/**
 * Get liquidity APY estimate
 */
export async function estimateLiquidityAPY(poolContract, volume24h) {
  try {
    const reserves = await poolContract.getReserves();
    const totalLiquidity = BigInt(reserves[0]) + BigInt(reserves[1]);

    // Simplified APY calculation: (volume * fee) * 365 / liquidity
    const dailyFees = (BigInt(volume24h) * BigInt(15)) / BigInt(1000000); // 0.0000015 fee rate
    const annualFees = dailyFees * BigInt(365);
    const apy = (annualFees * BigInt(100)) / totalLiquidity;

    return parseFloat(apy.toString()) / 100;
  } catch (error) {
    console.error('Failed to estimate APY:', error);
    return 0;
  }
}
