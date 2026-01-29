// Web Worker manager

export class WorkerManager {
  constructor(workerScript) {
    this.workerScript = workerScript;
    this.workers = [];
    this.taskQueue = [];
    this.activeWorkers = new Set();
  }

  createWorker() {
    try {
      const worker = new Worker(this.workerScript);
      this.workers.push(worker);
      return worker;
    } catch (error) {
      console.error('Failed to create worker:', error);
      return null;
    }
  }

  async executeTask(data, transferables = []) {
    const worker = this.getAvailableWorker();

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        worker.terminate();
        reject(new Error('Worker task timeout'));
      }, 30000);

      const handler = (event) => {
        clearTimeout(timeout);
        worker.removeEventListener('message', handler);
        worker.removeEventListener('error', errorHandler);
        this.activeWorkers.delete(worker);
        resolve(event.data);
        this.processQueue();
      };

      const errorHandler = (error) => {
        clearTimeout(timeout);
        worker.removeEventListener('message', handler);
        worker.removeEventListener('error', errorHandler);
        this.activeWorkers.delete(worker);
        reject(error);
        this.processQueue();
      };

      worker.addEventListener('message', handler);
      worker.addEventListener('error', errorHandler);
      this.activeWorkers.add(worker);

      if (transferables.length > 0) {
        worker.postMessage(data, transferables);
      } else {
        worker.postMessage(data);
      }
    });
  }

  getAvailableWorker() {
    const available = this.workers.find(w => !this.activeWorkers.has(w));
    return available || this.createWorker();
  }

  processQueue() {
    if (this.taskQueue.length === 0) return;
    const { data, resolve, reject } = this.taskQueue.shift();
    this.executeTask(data).then(resolve).catch(reject);
  }

  terminate() {
    this.workers.forEach(worker => worker.terminate());
    this.workers = [];
  }

  getWorkerCount() {
    return this.workers.length;
  }

  getActiveWorkerCount() {
    return this.activeWorkers.size;
  }
}

export const workerManager = new WorkerManager();
