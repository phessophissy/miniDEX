// Token-related utilities

export class TokenUtils {
  static normalize(amount, decimals) {
    const num = parseFloat(amount);
    return (num * Math.pow(10, decimals)).toFixed(0);
  }

  static denormalize(amount, decimals) {
    const num = parseFloat(amount);
    return num / Math.pow(10, decimals);
  }

  static formatUnits(amount, decimals) {
    return this.denormalize(amount, decimals).toString();
  }

  static parseUnits(amount, decimals) {
    return this.normalize(amount, decimals);
  }

  static getTokenSymbol(address, tokens = {}) {
    for (const [symbol, tokenAddr] of Object.entries(tokens)) {
      if (tokenAddr.toLowerCase() === address.toLowerCase()) {
        return symbol;
      }
    }
    return 'UNKNOWN';
  }

  static isValidTokenAddress(address) {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  }

  static compareAddresses(addr1, addr2) {
    if (!addr1 || !addr2) return false;
    return addr1.toLowerCase() === addr2.toLowerCase();
  }
}

export const token = TokenUtils;
