// Transaction history management

export class TransactionHistory {
  constructor() {
    this.transactions = this.loadFromStorage();
  }

  addTransaction(tx) {
    const transaction = {
      hash: tx.hash,
      from: tx.from,
      to: tx.to,
      type: tx.type,
      amount: tx.amount,
      status: 'pending',
      timestamp: Date.now(),
      ...tx
    };

    this.transactions.unshift(transaction);
    this.saveToStorage();
    return transaction;
  }

  updateStatus(hash, status) {
    const tx = this.transactions.find(t => t.hash === hash);
    if (tx) {
      tx.status = status;
      this.saveToStorage();
    }
  }

  getTransaction(hash) {
    return this.transactions.find(t => t.hash === hash);
  }

  getAll() {
    return this.transactions;
  }

  getRecent(limit = 10) {
    return this.transactions.slice(0, limit);
  }

  clear() {
    this.transactions = [];
    this.saveToStorage();
  }

  loadFromStorage() {
    try {
      const stored = localStorage.getItem('minidex_tx_history');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  saveToStorage() {
    try {
      localStorage.setItem('minidex_tx_history', JSON.stringify(this.transactions));
    } catch (error) {
      console.error('Failed to save transaction history:', error);
    }
  }
}

export const txHistory = new TransactionHistory();
