// Error handling and user feedback utilities

/**
 * Error types for the application
 */
export const ErrorTypes = {
  WALLET_NOT_CONNECTED: 'WALLET_NOT_CONNECTED',
  NETWORK_ERROR: 'NETWORK_ERROR',
  INSUFFICIENT_BALANCE: 'INSUFFICIENT_BALANCE',
  TRANSACTION_FAILED: 'TRANSACTION_FAILED',
  INVALID_INPUT: 'INVALID_INPUT',
  APPROVAL_FAILED: 'APPROVAL_FAILED',
  GAS_ESTIMATION_FAILED: 'GAS_ESTIMATION_FAILED',
  USER_REJECTED: 'USER_REJECTED',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR'
};

/**
 * Parse Ethereum error messages
 * @param {Error} error - The error object
 * @returns {string} User-friendly error message
 */
export function parseError(error) {
  if (!error) return 'An unknown error occurred';

  // User rejection
  if (error.code === 4001 || error.message?.includes('user rejected')) {
    return 'Transaction rejected by user';
  }

  // Insufficient balance
  if (error.message?.includes('insufficient balance') ||
      error.message?.includes('Insufficient balance')) {
    return 'Insufficient balance for transaction';
  }

  // Approval issues
  if (error.message?.includes('allowance') ||
      error.message?.includes('approve')) {
    return 'Token approval failed. Please try again.';
  }

  // Slippage/price impact
  if (error.message?.includes('slippage') ||
      error.message?.includes('output amount')) {
    return 'Price slippage exceeded tolerance. Please try again.';
  }

  // Gas estimation
  if (error.message?.includes('gas') ||
      error.message?.includes('reverted')) {
    return 'Transaction may fail. Check your inputs and try again.';
  }

  // Network errors
  if (error.message?.includes('network') ||
      error.message?.includes('timeout')) {
    return 'Network error. Please check your connection and try again.';
  }

  // Fallback to error message
  return error.message || 'An error occurred. Please try again.';
}

/**
 * Create error object with context
 * @param {string} type - Error type
 * @param {string} message - Error message
 * @param {Error} originalError - Original error
 * @returns {Object} Error object
 */
export function createError(type, message, originalError = null) {
  return {
    type,
    message,
    originalError,
    timestamp: new Date().toISOString()
  };
}

/**
 * Format error for display
 * @param {Object|Error|string} error - Error to format
 * @returns {string} Formatted error message
 */
export function formatErrorMessage(error) {
  if (typeof error === 'string') {
    return error;
  }

  if (error.message) {
    return parseError(error);
  }

  return 'An unknown error occurred';
}

/**
 * Check if error is recoverable
 * @param {Object|Error} error - Error to check
 * @returns {boolean} Can user retry
 */
export function isRecoverableError(error) {
  const message = error?.message || '';

  // Non-recoverable errors
  const nonRecoverable = [
    'invalid tokens',
    'unsupported network',
    'contract not found'
  ];

  for (const msg of nonRecoverable) {
    if (message.toLowerCase().includes(msg)) {
      return false;
    }
  }

  return true;
}

/**
 * Get error severity level
 * @param {Object|Error} error - Error to check
 * @returns {string} Severity: 'low', 'medium', 'high'
 */
export function getErrorSeverity(error) {
  const message = error?.message || '';

  if (message.includes('user rejected') || message.includes('cancelled')) {
    return 'low';
  }

  if (message.includes('slippage') || message.includes('insufficient')) {
    return 'medium';
  }

  return 'high';
}

/**
 * Log error with context
 * @param {string} context - Where error occurred
 * @param {Error} error - The error
 * @param {Object} additionalInfo - Extra info
 */
export function logError(context, error, additionalInfo = {}) {
  const errorLog = {
    timestamp: new Date().toISOString(),
    context,
    message: error?.message || error,
    stack: error?.stack,
    ...additionalInfo
  };

  console.error('[MiniDEX Error]', errorLog);

  // In production, send to error tracking service
  // sendToErrorTracking(errorLog);
}

/**
 * Create retry handler
 * @param {Function} fn - Function to retry
 * @param {number} maxRetries - Maximum retry attempts
 * @param {number} delayMs - Delay between retries
 * @returns {Promise} Result of function
 */
export async function withRetry(fn, maxRetries = 3, delayMs = 1000) {
  let lastError;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delayMs * (i + 1)));
      }
    }
  }

  throw lastError;
}

/**
 * Validate transaction before sending
 * @param {Object} tx - Transaction object
 * @param {string} from - Sender address
 * @param {string} balance - User balance
 * @returns {Object} Validation result
 */
export function validateBeforeTransaction(tx, from, balance) {
  if (!from) {
    return { valid: false, error: 'Wallet not connected' };
  }

  if (!tx.value || !tx.data) {
    return { valid: false, error: 'Invalid transaction data' };
  }

  const txValue = parseFloat(tx.value);
  const userBalance = parseFloat(balance);

  if (txValue > userBalance) {
    return { valid: false, error: 'Insufficient balance for transaction' };
  }

  return { valid: true };
}
