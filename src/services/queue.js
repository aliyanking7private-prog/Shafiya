/**
 * PromiseQueue - Mutex Pattern for Single Concurrent Request
 * Enforces STRICT one-request-at-a-time to prevent Bytez API free plan crashes
 */

class PromiseQueue {
  constructor() {
    this.running = false;
    this.queue = [];
  }

  /**
   * Add a function to the queue
   * @param {Function} fn - Async function to execute
   * @returns {Promise} - Resolves when function completes
   */
  async add(fn) {
    return new Promise((resolve, reject) => {
      this.queue.push({ fn, resolve, reject });
      this.process();
    });
  }

  /**
   * Process next item in queue
   * Only one function runs at a time
   */
  async process() {
    // If already running or queue is empty, stop
    if (this.running || this.queue.length === 0) {
      return;
    }

    // Mark as running
    this.running = true;

    // Get next item
    const { fn, resolve, reject } = this.queue.shift();

    try {
      // Execute function
      const result = await fn();
      resolve(result);
    } catch (error) {
      reject(error);
    } finally {
      // Mark as not running
      this.running = false;
      // Process next if available
      this.process();
    }
  }

  /**
   * Get queue status
   */
  getStatus() {
    return {
      running: this.running,
      queued: this.queue.length
    };
  }
}

export const queue = new PromiseQueue();
