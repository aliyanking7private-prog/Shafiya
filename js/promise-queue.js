/**
 * PromiseQueue - Ensures single concurrent request handling
 * Critical for Bytek Free Plan which crashes with multiple concurrent requests
 */
class PromiseQueue {
    constructor() {
        this.queue = [];
        this.isProcessing = false;
    }

    /**
     * Add a promise to the queue
     * @param {Function} executor - Function that returns a promise
     * @returns {Promise} The result of the queued promise
     */
    add(executor) {
        return new Promise((resolve, reject) => {
            this.queue.push({ executor, resolve, reject });
            this.process();
        });
    }

    /**
     * Process the next item in the queue
     */
    async process() {
        if (this.isProcessing || this.queue.length === 0) {
            return;
        }

        this.isProcessing = true;
        const { executor, resolve, reject } = this.queue.shift();

        try {
            // Add small delay between requests to be extra safe
            await this.delay(100);
            
            const result = await executor();
            resolve(result);
        } catch (error) {
            console.error('PromiseQueue Error:', error);
            reject(error);
        } finally {
            this.isProcessing = false;
            // Process next item after a short delay
            setTimeout(() => this.process(), 200);
        }
    }

    /**
     * Clear the queue (emergency use only)
     */
    clear() {
        this.queue = [];
        this.isProcessing = false;
    }

    /**
     * Get queue status
     */
    getStatus() {
        return {
            isProcessing: this.isProcessing,
            queueLength: this.queue.length
        };
    }

    /**
     * Utility delay function
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PromiseQueue;
} else {
    window.PromiseQueue = PromiseQueue;
}