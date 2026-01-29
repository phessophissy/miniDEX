// Middleware pattern implementation

export class Middleware {
  constructor() {
    this.handlers = [];
  }

  use(handler) {
    this.handlers.push(handler);
    return this;
  }

  async execute(context) {
    let index = 0;

    const next = async () => {
      if (index < this.handlers.length) {
        const handler = this.handlers[index++];
        await handler(context, next);
      }
    };

    await next();
    return context;
  }
}

export class Pipeline {
  constructor(...handlers) {
    this.middleware = new Middleware();
    handlers.forEach(handler => this.middleware.use(handler));
  }

  async run(context) {
    return this.middleware.execute(context);
  }
}

// Common middleware creators
export function logging() {
  return async (context, next) => {
    console.log('Request:', context);
    await next();
    console.log('Response:', context);
  };
}

export function errorHandler() {
  return async (context, next) => {
    try {
      await next();
    } catch (error) {
      context.error = error;
      console.error('Error:', error);
    }
  };
}

export function timing() {
  return async (context, next) => {
    const start = Date.now();
    await next();
    context.duration = Date.now() - start;
  };
}
