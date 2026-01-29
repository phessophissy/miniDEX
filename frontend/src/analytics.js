// Analytics and metrics tracking

/**
 * Analytics event tracker
 */
export class Analytics {
  constructor() {
    this.events = [];
    this.sessions = [];
    this.currentSession = this.createSession();
  }

  /**
   * Create new session
   */
  createSession() {
    return {
      id: Math.random().toString(36).substring(7),
      startTime: new Date(),
      events: [],
      endTime: null
    };
  }

  /**
   * Track event
   */
  trackEvent(eventName, data = {}) {
    const event = {
      name: eventName,
      timestamp: new Date(),
      data,
      sessionId: this.currentSession.id
    };

    this.events.push(event);
    this.currentSession.events.push(event);

    this.persistEvent(event);
  }

  /**
   * Track swap event
   */
  trackSwap(tokenIn, tokenOut, amountIn, amountOut, priceImpact, fee) {
    this.trackEvent('swap', {
      tokenIn,
      tokenOut,
      amountIn,
      amountOut,
      priceImpact,
      fee,
      success: true
    });
  }

  /**
   * Track liquidity event
   */
  trackLiquidity(type, amountUSDC, amountUSDT, lpTokens) {
    this.trackEvent(`liquidity_${type}`, {
      amountUSDC,
      amountUSDT,
      lpTokens,
      type
    });
  }

  /**
   * Track transaction
   */
  trackTransaction(hash, type, status) {
    this.trackEvent('transaction', {
      hash,
      type,
      status,
      timestamp: new Date()
    });
  }

  /**
   * Track error
   */
  trackError(error, context) {
    this.trackEvent('error', {
      message: error.message,
      stack: error.stack,
      context
    });
  }

  /**
   * Track user action
   */
  trackUserAction(action, details) {
    this.trackEvent('user_action', {
      action,
      ...details
    });
  }

  /**
   * Get session statistics
   */
  getSessionStats() {
    const now = new Date();
    const duration = now - this.currentSession.startTime;

    return {
      sessionId: this.currentSession.id,
      duration,
      eventCount: this.currentSession.events.length,
      eventTypes: this.getEventTypes(this.currentSession.events)
    };
  }

  /**
   * Get event statistics
   */
  getEventStats() {
    const stats = {
      totalEvents: this.events.length,
      eventTypes: {},
      timeline: {}
    };

    for (const event of this.events) {
      // Count event types
      stats.eventTypes[event.name] = (stats.eventTypes[event.name] || 0) + 1;

      // Timeline
      const hour = new Date(event.timestamp).toISOString().substring(0, 13);
      stats.timeline[hour] = (stats.timeline[hour] || 0) + 1;
    }

    return stats;
  }

  /**
   * Get swap analytics
   */
  getSwapAnalytics() {
    const swaps = this.events.filter(e => e.name === 'swap');

    if (swaps.length === 0) {
      return {
        totalSwaps: 0,
        averagePriceImpact: 0,
        totalVolume: 0
      };
    }

    const totalPriceImpact = swaps.reduce((sum, s) => sum + parseFloat(s.data.priceImpact || 0), 0);
    const totalVolume = swaps.reduce((sum, s) => sum + parseFloat(s.data.amountIn || 0), 0);

    return {
      totalSwaps: swaps.length,
      averagePriceImpact: totalPriceImpact / swaps.length,
      totalVolume: totalVolume.toString(),
      swaps: swaps
    };
  }

  /**
   * Get liquidity analytics
   */
  getLiquidityAnalytics() {
    const liquidity = this.events.filter(e => e.name.includes('liquidity'));

    if (liquidity.length === 0) {
      return {
        totalAdditions: 0,
        totalRemovals: 0,
        netLiquidity: 0
      };
    }

    const additions = liquidity.filter(e => e.name === 'liquidity_add');
    const removals = liquidity.filter(e => e.name === 'liquidity_remove');

    return {
      totalAdditions: additions.length,
      totalRemovals: removals.length,
      events: liquidity
    };
  }

  /**
   * Get performance metrics
   */
  getPerformanceMetrics() {
    return {
      sessionDuration: new Date() - this.currentSession.startTime,
      totalEvents: this.currentSession.events.length,
      eventsPerMinute: this.currentSession.events.length / ((new Date() - this.currentSession.startTime) / 60000),
      memory: performance.memory ? {
        jsHeapSizeLimit: performance.memory.jsHeapSizeLimit,
        totalJSHeapSize: performance.memory.totalJSHeapSize,
        usedJSHeapSize: performance.memory.usedJSHeapSize
      } : null
    };
  }

  /**
   * Export analytics data
   */
  export() {
    return {
      events: this.events,
      sessions: this.sessions,
      stats: {
        events: this.getEventStats(),
        swaps: this.getSwapAnalytics(),
        liquidity: this.getLiquidityAnalytics(),
        performance: this.getPerformanceMetrics()
      }
    };
  }

  /**
   * Clear events
   */
  clear() {
    this.events = [];
    this.currentSession = this.createSession();
    localStorage.removeItem('minidex_analytics');
  }

  /**
   * End session
   */
  endSession() {
    this.currentSession.endTime = new Date();
    this.sessions.push(this.currentSession);
    this.persistSession(this.currentSession);
    this.currentSession = this.createSession();
  }

  /**
   * Get event types
   */
  getEventTypes(events) {
    const types = {};
    for (const event of events) {
      types[event.name] = (types[event.name] || 0) + 1;
    }
    return types;
  }

  /**
   * Persist event to storage
   */
  persistEvent(event) {
    try {
      const events = JSON.parse(localStorage.getItem('minidex_analytics') || '[]');
      events.push(event);
      localStorage.setItem('minidex_analytics', JSON.stringify(events));
    } catch (error) {
      console.error('Failed to persist event:', error);
    }
  }

  /**
   * Persist session to storage
   */
  persistSession(session) {
    try {
      const sessions = JSON.parse(localStorage.getItem('minidex_sessions') || '[]');
      sessions.push(session);
      localStorage.setItem('minidex_sessions', JSON.stringify(sessions));
    } catch (error) {
      console.error('Failed to persist session:', error);
    }
  }
}

// Global analytics instance
export const analytics = new Analytics();
