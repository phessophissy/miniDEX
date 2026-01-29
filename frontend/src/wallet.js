// Wallet and provider management

import { ethers } from 'ethers';

/**
 * Check if MetaMask is installed
 */
export function isMetaMaskInstalled() {
  return window.ethereum !== undefined;
}

/**
 * Get provider
 */
export async function getProvider() {
  if (!isMetaMaskInstalled()) {
    throw new Error('MetaMask not found. Please install it.');
  }
  return new ethers.BrowserProvider(window.ethereum);
}

/**
 * Connect wallet
 */
export async function connectWallet() {
  try {
    if (!isMetaMaskInstalled()) {
      throw new Error('Please install MetaMask');
    }

    const provider = await getProvider();
    const accounts = await window.ethereum.request({
      method: 'eth_requestAccounts'
    });

    if (!accounts || accounts.length === 0) {
      throw new Error('No accounts found');
    }

    return accounts[0];
  } catch (error) {
    console.error('Failed to connect wallet:', error);
    throw error;
  }
}

/**
 * Get connected account
 */
export async function getConnectedAccount() {
  try {
    const provider = await getProvider();
    const signer = await provider.getSigner();
    return await signer.getAddress();
  } catch (error) {
    return null;
  }
}

/**
 * Get signer
 */
export async function getSigner() {
  try {
    const provider = await getProvider();
    return await provider.getSigner();
  } catch (error) {
    console.error('Failed to get signer:', error);
    throw error;
  }
}

/**
 * Get network information
 */
export async function getNetworkInfo() {
  try {
    const provider = await getProvider();
    const network = await provider.getNetwork();
    return {
      chainId: network.chainId,
      name: network.name,
      ensAddress: network.ensAddress
    };
  } catch (error) {
    console.error('Failed to get network info:', error);
    throw error;
  }
}

/**
 * Get user balance
 */
export async function getUserBalance(address) {
  try {
    const provider = await getProvider();
    const balance = await provider.getBalance(address);
    return balance.toString();
  } catch (error) {
    console.error('Failed to get balance:', error);
    return '0';
  }
}

/**
 * Check if on correct network
 */
export async function isOnCorrectNetwork(expectedChainId) {
  try {
    const { chainId } = await getNetworkInfo();
    return chainId === expectedChainId;
  } catch (error) {
    return false;
  }
}

/**
 * Switch network
 */
export async function switchNetwork(chainId) {
  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: `0x${chainId.toString(16)}` }]
    });
    return true;
  } catch (error) {
    if (error.code === 4902) {
      // Network not added, try to add it
      return await addNetwork(chainId);
    }
    throw error;
  }
}

/**
 * Add network to MetaMask
 */
export async function addNetwork(chainId) {
  const networks = {
    8453: {
      chainId: '0x2105',
      chainName: 'Base Mainnet',
      nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
      rpcUrls: ['https://mainnet.base.org'],
      blockExplorerUrls: ['https://basescan.org']
    },
    84532: {
      chainId: '0x14a34',
      chainName: 'Base Sepolia',
      nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
      rpcUrls: ['https://sepolia.base.org'],
      blockExplorerUrls: ['https://sepolia-explorer.base.org']
    }
  };

  const network = networks[chainId];
  if (!network) {
    throw new Error('Unsupported network');
  }

  try {
    await window.ethereum.request({
      method: 'wallet_addEthereumChain',
      params: [network]
    });
    return true;
  } catch (error) {
    console.error('Failed to add network:', error);
    throw error;
  }
}

/**
 * Set up wallet event listeners
 */
export function setupWalletListeners(callbacks = {}) {
  const {
    onAccountsChanged = null,
    onChainChanged = null,
    onDisconnect = null
  } = callbacks;

  if (!isMetaMaskInstalled()) return () => {};

  if (onAccountsChanged) {
    window.ethereum.on('accountsChanged', onAccountsChanged);
  }

  if (onChainChanged) {
    window.ethereum.on('chainChanged', onChainChanged);
  }

  if (onDisconnect) {
    window.ethereum.on('disconnect', onDisconnect);
  }

  // Return cleanup function
  return () => {
    if (onAccountsChanged) {
      window.ethereum.removeListener('accountsChanged', onAccountsChanged);
    }
    if (onChainChanged) {
      window.ethereum.removeListener('chainChanged', onChainChanged);
    }
    if (onDisconnect) {
      window.ethereum.removeListener('disconnect', onDisconnect);
    }
  };
}

/**
 * Format wallet address
 */
export function formatAddress(address) {
  if (!address || address.length < 10) return address;
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
}

/**
 * Validate address
 */
export function isValidAddress(address) {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

/**
 * Is address equal (case-insensitive)
 */
export function addressEquals(addr1, addr2) {
  if (!addr1 || !addr2) return false;
  return addr1.toLowerCase() === addr2.toLowerCase();
}

/**
 * Check wallet balance against amount
 */
export async function hasSufficientBalance(address, requiredAmount) {
  try {
    const balance = await getUserBalance(address);
    return BigInt(balance) >= BigInt(requiredAmount);
  } catch (error) {
    return false;
  }
}

/**
 * Get gas price
 */
export async function getGasPrice() {
  try {
    const provider = await getProvider();
    const feeData = await provider.getFeeData();
    return {
      gasPrice: feeData.gasPrice?.toString() || '0',
      maxFeePerGas: feeData.maxFeePerGas?.toString() || '0',
      maxPriorityFeePerGas: feeData.maxPriorityFeePerGas?.toString() || '0'
    };
  } catch (error) {
    console.error('Failed to get gas price:', error);
    return {
      gasPrice: '0',
      maxFeePerGas: '0',
      maxPriorityFeePerGas: '0'
    };
  }
}

/**
 * Estimate transaction cost
 */
export async function estimateTransactionCost(gasLimit) {
  try {
    const gasPrice = await getGasPrice();
    const cost = BigInt(gasLimit) * BigInt(gasPrice.gasPrice);
    return cost.toString();
  } catch (error) {
    return '0';
  }
}
