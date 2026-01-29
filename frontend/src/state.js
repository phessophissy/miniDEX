// Application state management

/**
 * Application state store
 */
export class StateManager {
  constructor() {
    this.state = this.initializeState();
    this.listeners = new Map();
  }

  /**
   * Initialize default state
   */
  initializeState() {
    return {
      // Wallet state
      wallet: {
        address: null,
        connected: false,
        network: null,
        balance: '0'
      },

      // Token balances
      balances: {
        usdc: '0',
        usdt: '0',
        lp: '0'
      },

      // Pool state
      pool: {
        reserveUSDC: '0',
        reserveUSDT: '0',
        lpTokenAddress: null,
        totalLiquidity: '0'
      },

      // Swap state
      swap: {
        tokenIn: null,
        tokenOut: null,
        amountIn: '0',
        amountOut: '0',
        minAmountOut: '0',
        slippageTolerance: 0.5,
        priceImpact: 0,
        loading: false,
        error: null
      },

      // Liquidity state
      liquidity: {
        amountUSDC: '0',
        amountUSDT: '0',
        lpTokensOut: '0',
        loading: false,
        error: null
      },

      // Transaction state
      transaction: {
        current: null,
        hash: null,
        status: null,
        confirmations: 0,
        error: null,
        history: []
      },

      // UI state
      ui: {
        activeTab: 'swap',
        activeLPTab: 'add',
        showSettings: false,
        theme: 'dark',
        notifications: [],
        modal: null
      },

      // Loading states
      loading: {
        connectingWallet: false,
        fetchingBalances: false,
        fetchingPool: false,
        calculatingOutput: false
      },

      // Settings
      settings: {
        slippageTolerance: 0.5,
        gasOptimization: true,
        showPriceImpact: true,
        autoRefresh: true
      }
    };
  }

  /**
   * Get entire state
   */
  getState() {
    return JSON.parse(JSON.stringify(this.state));
  }

  /**
   * Update state
   */
  setState(updates) {
    this.state = this.deepMerge(this.state, updates);
    this.notifyListeners();
  }

  /**
   * Get specific state value
   */
  getValue(path) {
    return this.getNestedValue(this.state, path.split('.'));
  }

  /**
   * Update specific state value
   */
  setValue(path, value) {
    const keys = path.split('.');
    const state = this.state;
    let current = state;

    for (let i = 0; i < keys.length - 1; i++) {
      current[keys[i]] = current[keys[i]] || {};
      current = current[keys[i]];
    }

    current[keys[keys.length - 1]] = value;
    this.notifyListeners();
  }

  /**
   * Subscribe to state changes
   */
  subscribe(listener) {
    const id = Math.random().toString(36);
    this.listeners.set(id, listener);
    return () => this.listeners.delete(id);
  }

  /**
   * Subscribe to specific value changes
   */
  subscribeTo(path, listener) {
    const unsubscribe = this.subscribe(() => {
      const value = this.getValue(path);
      listener(value);
    });
    return unsubscribe;
  }

  /**
   * Notify all listeners
   */
  notifyListeners() {
    this.listeners.forEach(listener => listener(this.getState()));
  }

  /**
   * Reset state to initial
   */
  reset() {
    this.state = this.initializeState();
    this.notifyListeners();
  }

  /**
   * Deep merge objects
   */
  deepMerge(target, source) {
    const output = Object.assign({}, target);

    for (const key in source) {
      if (source.hasOwnProperty(key)) {
        if (
          source[key] &&
          typeof source[key] === 'object' &&
          !Array.isArray(source[key])
        ) {
          output[key] = this.deepMerge(target[key] || {}, source[key]);
        } else {
          output[key] = source[key];
        }
      }
    }

    return output;
  }

  /**
   * Get nested value from object
   */
  getNestedValue(obj, keys) {
    let value = obj;
    for (const key of keys) {
      value = value?.[key];
    }
    return value;
  }

  /**
   * Persist state to localStorage
   */
  saveToStorage(key) {
    try {
      localStorage.setItem(key, JSON.stringify(this.state));
    } catch (error) {
      console.error('Failed to save state to localStorage:', error);
    }
  }

  /**
   * Load state from localStorage
   */
  loadFromStorage(key) {
    try {
      const saved = localStorage.getItem(key);
      if (saved) {
        this.state = this.deepMerge(this.state, JSON.parse(saved));
        this.notifyListeners();
      }
    } catch (error) {
      console.error('Failed to load state from localStorage:', error);
    }
  }

  /**
   * Clear localStorage
   */
  clearStorage(key) {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Failed to clear localStorage:', error);
    }
  }
}

// Create global state manager instance
export const stateManager = new StateManager();
