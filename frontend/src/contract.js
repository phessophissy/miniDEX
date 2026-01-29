// Contract interaction utilities

import { ethers } from 'ethers';

/**
 * Create contract instance
 */
export async function createContractInstance(address, abi, signer) {
  try {
    return new ethers.Contract(address, abi, signer);
  } catch (error) {
    console.error('Failed to create contract instance:', error);
    throw error;
  }
}

/**
 * Check if contract exists at address
 */
export async function contractExists(address, provider) {
  try {
    const code = await provider.getCode(address);
    return code !== '0x';
  } catch (error) {
    console.error('Failed to check contract existence:', error);
    return false;
  }
}

/**
 * Get contract balance
 */
export async function getContractBalance(address, provider) {
  try {
    const balance = await provider.getBalance(address);
    return balance.toString();
  } catch (error) {
    console.error('Failed to get contract balance:', error);
    return '0';
  }
}

/**
 * Estimate gas for transaction
 */
export async function estimateGas(contract, method, params = [], value = 0) {
  try {
    const gasEstimate = await contract[method].estimateGas(...params, {
      value
    });
    return (BigInt(gasEstimate) * BigInt(110)) / BigInt(100); // 10% buffer
  } catch (error) {
    console.error('Gas estimation failed:', error);
    throw error;
  }
}

/**
 * Call contract method (read-only)
 */
export async function callContractMethod(contract, method, params = []) {
  try {
    return await contract[method](...params);
  } catch (error) {
    console.error(`Contract call failed: ${method}`, error);
    throw error;
  }
}

/**
 * Execute contract transaction
 */
export async function executeTransaction(contract, method, params = [], options = {}) {
  try {
    const tx = await contract[method](...params, options);
    return tx;
  } catch (error) {
    console.error(`Transaction failed: ${method}`, error);
    throw error;
  }
}

/**
 * Wait for transaction confirmation
 */
export async function waitForConfirmation(tx, confirmations = 1) {
  try {
    const receipt = await tx.wait(confirmations);
    return receipt;
  } catch (error) {
    console.error('Transaction confirmation failed:', error);
    throw error;
  }
}

/**
 * Get transaction status
 */
export async function getTransactionStatus(hash, provider) {
  try {
    const receipt = await provider.getTransactionReceipt(hash);

    if (!receipt) {
      return {
        status: 'pending',
        confirmations: 0,
        success: null
      };
    }

    return {
      status: receipt.status === 1 ? 'confirmed' : 'failed',
      confirmations: receipt.confirmations,
      success: receipt.status === 1,
      blockNumber: receipt.blockNumber,
      gasUsed: receipt.gasUsed.toString()
    };
  } catch (error) {
    console.error('Failed to get transaction status:', error);
    throw error;
  }
}

/**
 * Approve ERC20 token spending
 */
export async function approveToken(tokenContract, spender, amount) {
  try {
    const tx = await tokenContract.approve(spender, amount);
    return tx;
  } catch (error) {
    console.error('Token approval failed:', error);
    throw error;
  }
}

/**
 * Check token allowance
 */
export async function checkAllowance(tokenContract, owner, spender) {
  try {
    const allowance = await tokenContract.allowance(owner, spender);
    return allowance.toString();
  } catch (error) {
    console.error('Failed to check allowance:', error);
    return '0';
  }
}

/**
 * Get token balance
 */
export async function getTokenBalance(tokenContract, address) {
  try {
    const balance = await tokenContract.balanceOf(address);
    return balance.toString();
  } catch (error) {
    console.error('Failed to get token balance:', error);
    return '0';
  }
}

/**
 * Get token details
 */
export async function getTokenDetails(tokenContract) {
  try {
    const [symbol, decimals] = await Promise.all([
      tokenContract.symbol(),
      tokenContract.decimals()
    ]);

    return { symbol, decimals };
  } catch (error) {
    console.error('Failed to get token details:', error);
    return { symbol: 'UNKNOWN', decimals: 18 };
  }
}

/**
 * Parse contract error
 */
export function parseContractError(error) {
  if (error.reason) {
    return error.reason;
  }

  if (error.message?.includes('reverted')) {
    return 'Transaction reverted. Check your inputs.';
  }

  if (error.message?.includes('insufficient')) {
    return 'Insufficient balance or allowance';
  }

  return 'Contract interaction failed';
}

/**
 * Batch contract calls
 */
export async function batchContractCalls(calls) {
  try {
    const results = await Promise.all(
      calls.map(({ contract, method, params }) =>
        contract[method](...params)
      )
    );
    return results;
  } catch (error) {
    console.error('Batch contract call failed:', error);
    throw error;
  }
}

/**
 * Monitor contract event
 */
export function monitorEvent(contract, eventName, callback) {
  const listener = (...args) => {
    callback(...args);
  };

  contract.on(eventName, listener);

  // Return unsubscribe function
  return () => {
    contract.off(eventName, listener);
  };
}

/**
 * Get contract events
 */
export async function getContractEvents(contract, eventName, fromBlock, toBlock) {
  try {
    const events = await contract.queryFilter(eventName, fromBlock, toBlock);
    return events;
  } catch (error) {
    console.error('Failed to get contract events:', error);
    return [];
  }
}
