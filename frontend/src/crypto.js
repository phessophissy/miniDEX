// Basic encryption utilities

export class Encryption {
  static encode(str) {
    return btoa(unescape(encodeURIComponent(str)));
  }

  static decode(str) {
    try {
      return decodeURIComponent(escape(atob(str)));
    } catch {
      return null;
    }
  }

  static hash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash.toString(16);
  }

  static encrypt(text, key) {
    // Simple XOR encryption (NOT for production)
    let result = '';
    for (let i = 0; i < text.length; i++) {
      result += String.fromCharCode(text.charCodeAt(i) ^ key.charCodeAt(i % key.length));
    }
    return this.encode(result);
  }

  static decrypt(encodedText, key) {
    try {
      const text = this.decode(encodedText);
      let result = '';
      for (let i = 0; i < text.length; i++) {
        result += String.fromCharCode(text.charCodeAt(i) ^ key.charCodeAt(i % key.length));
      }
      return result;
    } catch {
      return null;
    }
  }

  static async sha256(str) {
    const encoder = new TextEncoder();
    const data = encoder.encode(str);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }
}

export const encryption = Encryption;
