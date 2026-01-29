// Utility functions for miniDEX frontend

/**
 * Format large numbers with appropriate decimals
 * @param {string|number} value - The value to format
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted value
 */
export function formatAmount(value, decimals = 6) {
  if (!value || isNaN(value)) return '0';
  const num = parseFloat(value);
  return num.toFixed(decimals);
}

/**
 * Format balance for display
 * @param {string|number} balance - The balance to format
 * @param {number} decimals - Token decimals
 * @returns {string} Formatted balance
 */
export function formatBalance(balance, decimals = 6) {
  if (!balance || isNaN(balance)) return '0.00';
  const num = parseFloat(balance) / Math.pow(10, decimals);
  return num.toFixed(2);
}

/**
 * Parse user input to raw amount
 * @param {string} input - User input
 * @param {number} decimals - Token decimals
 * @returns {string} Raw amount in wei
 */
export function parseInput(input, decimals = 6) {
  if (!input) return '0';
  const num = parseFloat(input);
  if (isNaN(num)) return '0';
  return (num * Math.pow(10, decimals)).toFixed(0);
}

/**
 * Calculate price impact percentage
 * @param {string} amountIn - Input amount
 * @param {string} amountOut - Output amount
 * @param {string} spotPrice - Spot price (1:1 for stables)
 * @returns {number} Price impact percentage
 */
export function calculatePriceImpact(amountIn, amountOut, spotPrice = 1) {
  if (!amountIn || !amountOut) return 0;
  const executionPrice = parseFloat(amountOut) / parseFloat(amountIn);
  const impact = ((spotPrice - executionPrice) / spotPrice) * 100;
  return Math.max(0, impact);
}

/**
 * Format percentage with precision
 * @param {number} value - Percentage value
 * @param {number} decimals - Decimal places
 * @returns {string} Formatted percentage
 */
export function formatPercent(value, decimals = 2) {
  if (!value || isNaN(value)) return '0%';
  return `${parseFloat(value).toFixed(decimals)}%`;
}

/**
 * Shorten wallet address
 * @param {string} address - Full wallet address
 * @returns {string} Shortened address
 */
export function shortenAddress(address) {
  if (!address || address.length < 10) return address;
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
}

/**
 * Check if address is valid
 * @param {string} address - Address to validate
 * @returns {boolean} Is valid address
 */
export function isValidAddress(address) {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

/**
 * Get token symbol from address
 * @param {string} address - Token address
 * @param {string} usdcAddr - USDC address
 * @param {string} usdtAddr - USDT address
 * @returns {string} Token symbol
 */
export function getTokenSymbol(address, usdcAddr, usdtAddr) {
  if (address?.toLowerCase() === usdcAddr?.toLowerCase()) return 'USDC';
  if (address?.toLowerCase() === usdtAddr?.toLowerCase()) return 'USDT';
  return 'UNKNOWN';
}

/**
 * Calculate slippage amount
 * @param {string} amountOut - Expected output
 * @param {number} slippagePercent - Slippage tolerance
 * @returns {string} Minimum output amount
 */
export function calculateMinAmountOut(amountOut, slippagePercent = 0.5) {
  if (!amountOut) return '0';
  const amount = parseFloat(amountOut);
  const slippage = (amount * slippagePercent) / 100;
  return (amount - slippage).toString();
}

/**
 * Format transaction fee
 * @param {string} fee - Fee in wei
 * @returns {string} Formatted fee
 */
export function formatFee(fee) {
  if (!fee || isNaN(fee)) return '0.0000015 ETH';
  const eth = parseFloat(fee) / Math.pow(10, 18);
  return `${eth.toFixed(7)} ETH`;
}

/**
 * Check if amount exceeds available balance
 * @param {string} amount - Input amount
 * @param {string} balance - Available balance
 * @returns {boolean} Is sufficient
 */
export function hasSufficientBalance(amount, balance) {
  if (!amount || !balance) return false;
  return parseFloat(amount) <= parseFloat(balance);
}
