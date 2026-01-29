// Form validation utilities for miniDEX frontend

/**
 * Validate numeric input
 * @param {string} value - Input value
 * @returns {Object} Validation result
 */
export function validateNumericInput(value) {
  if (!value) {
    return { valid: false, error: 'Amount is required' };
  }

  const num = parseFloat(value);
  if (isNaN(num)) {
    return { valid: false, error: 'Invalid number format' };
  }

  if (num <= 0) {
    return { valid: false, error: 'Amount must be greater than 0' };
  }

  if (num > Number.MAX_SAFE_INTEGER) {
    return { valid: false, error: 'Amount is too large' };
  }

  return { valid: true };
}

/**
 * Validate swap parameters
 * @param {string} amountIn - Input amount
 * @param {string} balance - User balance
 * @param {string} tokenIn - Input token address
 * @param {string} tokenOut - Output token address
 * @returns {Object} Validation result
 */
export function validateSwapParams(amountIn, balance, tokenIn, tokenOut) {
  const numValidation = validateNumericInput(amountIn);
  if (!numValidation.valid) return numValidation;

  const amount = parseFloat(amountIn);
  const availableBalance = parseFloat(balance);

  if (amount > availableBalance) {
    return { valid: false, error: 'Insufficient balance' };
  }

  if (!tokenIn || !tokenOut) {
    return { valid: false, error: 'Invalid tokens selected' };
  }

  if (tokenIn.toLowerCase() === tokenOut.toLowerCase()) {
    return { valid: false, error: 'Cannot swap identical tokens' };
  }

  return { valid: true };
}

/**
 * Validate liquidity parameters
 * @param {string} amountUSDC - USDC amount
 * @param {string} amountUSDT - USDT amount
 * @param {string} usdcBalance - USDC balance
 * @param {string} usdtBalance - USDT balance
 * @returns {Object} Validation result
 */
export function validateLiquidityParams(amountUSDC, amountUSDT, usdcBalance, usdtBalance) {
  const usdcVal = validateNumericInput(amountUSDC);
  if (!usdcVal.valid) return { valid: false, error: 'Invalid USDC amount' };

  const usdtVal = validateNumericInput(amountUSDT);
  if (!usdtVal.valid) return { valid: false, error: 'Invalid USDT amount' };

  const usdcAmount = parseFloat(amountUSDC);
  const usdtAmount = parseFloat(amountUSDT);

  if (usdcAmount > parseFloat(usdcBalance)) {
    return { valid: false, error: 'Insufficient USDC balance' };
  }

  if (usdtAmount > parseFloat(usdtBalance)) {
    return { valid: false, error: 'Insufficient USDT balance' };
  }

  return { valid: true };
}

/**
 * Validate removal liquidity parameters
 * @param {string} lpTokens - LP tokens to remove
 * @param {string} lpBalance - LP token balance
 * @returns {Object} Validation result
 */
export function validateRemovalParams(lpTokens, lpBalance) {
  const validation = validateNumericInput(lpTokens);
  if (!validation.valid) return validation;

  const amount = parseFloat(lpTokens);
  const balance = parseFloat(lpBalance);

  if (amount > balance) {
    return { valid: false, error: 'Insufficient LP tokens' };
  }

  return { valid: true };
}

/**
 * Validate slippage tolerance percentage
 * @param {number} slippage - Slippage percentage
 * @returns {Object} Validation result
 */
export function validateSlippageTolerance(slippage) {
  if (slippage === undefined || slippage === null) {
    return { valid: false, error: 'Slippage tolerance required' };
  }

  const num = parseFloat(slippage);
  if (isNaN(num)) {
    return { valid: false, error: 'Invalid slippage value' };
  }

  if (num < 0) {
    return { valid: false, error: 'Slippage cannot be negative' };
  }

  if (num > 50) {
    return { valid: false, error: 'Slippage tolerance too high (max 50%)' };
  }

  return { valid: true };
}

/**
 * Check if transaction is safe
 * @param {string} amountIn - Input amount
 * @param {string} amountOut - Output amount
 * @param {string} minAmount - Minimum acceptable output
 * @returns {Object} Safety check result
 */
export function checkTransactionSafety(amountIn, amountOut, minAmount) {
  const amount = parseFloat(amountOut);
  const minimum = parseFloat(minAmount);

  if (amount < minimum) {
    return {
      safe: false,
      warning: 'Actual output is below minimum. Transaction will revert.'
    };
  }

  return { safe: true };
}

/**
 * Validate transaction confirmation
 * @param {Object} params - Transaction parameters
 * @returns {Object} Validation result
 */
export function validateTransactionConfirmation(params) {
  const { amountIn, amountOut, minAmountOut, fee, from } = params;

  if (!amountIn || !amountOut || !minAmountOut || !fee || !from) {
    return { valid: false, error: 'Missing transaction parameters' };
  }

  if (parseFloat(amountOut) < parseFloat(minAmountOut)) {
    return { valid: false, error: 'Output is below minimum acceptable amount' };
  }

  return { valid: true };
}
