// Object pool service for resource management

export class ObjectPool {
  constructor(factory, maxSize = 10) {
    this.factory = factory;
    this.maxSize = maxSize;
    this.available = [];
    this.inUse = new Set();
  }

  acquire() {
    let obj;

    if (this.available.length > 0) {
      obj = this.available.pop();
    } else if (this.inUse.size < this.maxSize) {
      obj = this.factory.create();
    } else {
      throw new Error('Object pool is exhausted');
    }

    this.inUse.add(obj);
    return obj;
  }

  release(obj) {
    if (this.inUse.has(obj)) {
      this.inUse.delete(obj);
      if (this.factory.reset) {
        this.factory.reset(obj);
      }
      this.available.push(obj);
    }
  }

  clear() {
    this.available = [];
    this.inUse.clear();
  }

  size() {
    return this.available.length + this.inUse.size;
  }
}

export function withPooledObject(pool, fn) {
  const obj = pool.acquire();
  try {
    return fn(obj);
  } finally {
    pool.release(obj);
  }
}
