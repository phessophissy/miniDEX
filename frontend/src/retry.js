// Retry mechanism service

export class RetryService {
  constructor(options = {}) {
    this.maxRetries = options.maxRetries || 3;
    this.delay = options.delay || 1000;
    this.backoff = options.backoff || true;
    this.backoffMultiplier = options.backoffMultiplier || 2;
  }

  async execute(fn) {
    let lastError;
    let delay = this.delay;

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;

        if (attempt < this.maxRetries) {
          await this.wait(delay);

          if (this.backoff) {
            delay *= this.backoffMultiplier;
          }
        }
      }
    }

    throw lastError;
  }

  wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const retryService = new RetryService();
