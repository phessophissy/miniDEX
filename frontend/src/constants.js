// Application constants

// Network configuration
export const NETWORKS = {
  BASE: {
    id: 8453,
    name: 'Base Mainnet',
    rpcUrl: 'https://mainnet.base.org',
    currency: 'ETH',
    blockTime: 2
  },
  BASE_SEPOLIA: {
    id: 84532,
    name: 'Base Sepolia Testnet',
    rpcUrl: 'https://sepolia.base.org',
    currency: 'ETH',
    blockTime: 2
  }
};

// Token configuration
export const TOKENS = {
  USDC: {
    address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
    symbol: 'USDC',
    decimals: 6,
    icon: '💵'
  },
  USDT: {
    address: '0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2',
    symbol: 'USDT',
    decimals: 6,
    icon: '💴'
  }
};

// Pool configuration
export const POOL_CONFIG = {
  address: '0x47f4b9bDbaa5e1fB2fC4cCac446610456B406BCC',
  fee: '1500000000000', // 0.0000015 ETH
  amplificationCoefficient: 100,
  minLiquidity: '1000000' // 1 USDC worth
};

// UI Configuration
export const UI_CONFIG = {
  DEFAULT_SLIPPAGE: 0.5, // 0.5%
  MAX_SLIPPAGE: 50, // 50%
  DECIMAL_PLACES: 6,
  DISPLAY_DECIMALS: 2,
  DEBOUNCE_DELAY: 500, // ms
  TOAST_DURATION: 5000, // ms
  ANIMATION_DURATION: 300 // ms
};

// Transaction limits
export const TX_LIMITS = {
  MIN_AMOUNT: '1000000', // 1 USDC
  MAX_AMOUNT: '1000000000000000', // 1B USDC
  GAS_LIMIT: '300000',
  GAS_PRICE_MULTIPLIER: 1.1
};

// Polling configuration
export const POLLING_CONFIG = {
  BALANCE_CHECK_INTERVAL: 10000, // 10 seconds
  BLOCK_CHECK_INTERVAL: 5000, // 5 seconds
  PRICE_CHECK_INTERVAL: 15000, // 15 seconds
  TX_CONFIRMATION_TIMEOUT: 60000 // 60 seconds
};

// API endpoints
export const API_ENDPOINTS = {
  BLOCK_EXPLORER: 'https://basescan.org',
  RPC: NETWORKS.BASE.rpcUrl,
  GAS_TRACKER: 'https://api.basescan.org/api'
};

// Time constants
export const TIMES = {
  SECOND: 1000,
  MINUTE: 60 * 1000,
  HOUR: 60 * 60 * 1000,
  DAY: 24 * 60 * 60 * 1000
};

// Status codes
export const STATUS = {
  IDLE: 'idle',
  LOADING: 'loading',
  SUCCESS: 'success',
  ERROR: 'error',
  PENDING: 'pending',
  CONFIRMING: 'confirming'
};

// Transaction status
export const TX_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  FAILED: 'failed',
  EXPIRED: 'expired'
};

// Feature flags
export const FEATURES = {
  ADVANCED_SLIPPAGE: true,
  TRANSACTION_HISTORY: true,
  PRICE_IMPACT: true,
  GAS_OPTIMIZATION: true,
  MULTI_HOP: false,
  FLASH_LOANS: false
};

// Error codes
export const ERROR_CODES = {
  WALLET_NOT_CONNECTED: 'ERR_001',
  WRONG_NETWORK: 'ERR_002',
  INSUFFICIENT_BALANCE: 'ERR_003',
  INVALID_INPUT: 'ERR_004',
  TX_FAILED: 'ERR_005',
  APPROVAL_FAILED: 'ERR_006',
  GAS_ESTIMATION_FAILED: 'ERR_007',
  USER_REJECTED: 'ERR_008',
  NETWORK_ERROR: 'ERR_009',
  UNKNOWN: 'ERR_999'
};

// Default slippage options for UI
export const SLIPPAGE_OPTIONS = [
  { label: '0.1%', value: 0.1 },
  { label: '0.5%', value: 0.5 },
  { label: '1%', value: 1 },
  { label: '2%', value: 2 },
  { label: 'Custom', value: null }
];

// Price impact warnings
export const PRICE_IMPACT_LEVELS = {
  LOW: { threshold: 0.5, color: 'green', label: 'Low' },
  MEDIUM: { threshold: 2, color: 'yellow', label: 'Medium' },
  HIGH: { threshold: 5, color: 'orange', label: 'High' },
  VERY_HIGH: { threshold: 100, color: 'red', label: 'Very High' }
};

// Local storage keys
export const STORAGE_KEYS = {
  WALLET_ADDRESS: 'minidex_wallet_address',
  SLIPPAGE_TOLERANCE: 'minidex_slippage_tolerance',
  THEME: 'minidex_theme',
  TRANSACTION_HISTORY: 'minidex_tx_history',
  FAVORITE_PAIRS: 'minidex_favorite_pairs',
  SETTINGS: 'minidex_settings'
};

// Theme colors
export const THEME = {
  PRIMARY: '#2dd4bf',
  SECONDARY: '#0d9488',
  DANGER: '#ef4444',
  WARNING: '#f59e0b',
  SUCCESS: '#10b981',
  BACKGROUND: '#0f172a',
  CARD: '#1e293b',
  TEXT: '#f1f5f9'
};
