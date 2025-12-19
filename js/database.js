/**
 * Database Manager for IndexedDB operations
 * Handles chat history, memories, gallery, and app state
 */

class DatabaseManager {
    constructor() {
        this.dbName = 'ShafiyaDB';
        this.version = 1;
        this.db = null;
    }

    /**
     * Initialize the database
     */
    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.version);

            request.onerror = () => {
                console.error('Database open error:', request.error);
                reject(request.error);
            };

            request.onsuccess = () => {
                this.db = request.result;
                console.log('Database initialized successfully');
                resolve(this.db);
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;

                // Chat messages store
                if (!db.objectStoreNames.contains('chatMessages')) {
                    const chatStore = db.createObjectStore('chatMessages', { 
                        keyPath: 'id',
                        autoIncrement: true 
                    });
                    chatStore.createIndex('timestamp', 'timestamp');
                    chatStore.createIndex('type', 'type');
                    chatStore.createIndex('mood', 'mood');
                }

                // Memories store
                if (!db.objectStoreNames.contains('memories')) {
                    const memoryStore = db.createObjectStore('memories', { 
                        keyPath: 'id',
                        autoIncrement: true 
                    });
                    memoryStore.createIndex('timestamp', 'timestamp');
                    memoryStore.createIndex('importance', 'importance');
                }

                // Gallery images store
                if (!db.objectStoreNames.contains('gallery')) {
                    const galleryStore = db.createObjectStore('gallery', { 
                        keyPath: 'id',
                        autoIncrement: true 
                    });
                    galleryStore.createIndex('timestamp', 'timestamp');
                    galleryStore.createIndex('type', 'type');
                }

                // App state store
                if (!db.objectStoreNames.contains('appState')) {
                    const stateStore = db.createObjectStore('appState', { 
                        keyPath: 'key' 
                    });
                }

                console.log('Database schema created');
            };
        });
    }

    /**
     * Add a message to chat history
     */
    async addChatMessage(message) {
        return this.transaction('chatMessages', 'readwrite', (store) => {
            const messageData = {
                ...message,
                timestamp: Date.now(),
                id: undefined // Let autoIncrement handle it
            };
            return store.add(messageData);
        });
    }

    /**
     * Get chat messages
     */
    async getChatMessages(limit = 100, offset = 0) {
        return this.transaction('chatMessages', 'readonly', (store) => {
            return new Promise((resolve, reject) => {
                const index = store.index('timestamp');
                const direction = 'prev'; // Newest first
                const request = index.openCursor(null, direction);
                const messages = [];
                let count = 0;

                request.onsuccess = (event) => {
                    const cursor = event.target.result;
                    if (cursor && count < limit + offset) {
                        if (count >= offset) {
                            messages.push(cursor.value);
                        }
                        count++;
                        cursor.continue();
                    } else {
                        resolve(messages);
                    }
                };

                request.onerror = () => {
                    reject(request.error);
                };
            });
        });
    }

    /**
     * Clear all chat messages
     */
    async clearChatMessages() {
        return this.transaction('chatMessages', 'readwrite', (store) => {
            return store.clear();
        });
    }

    /**
     * Add a memory
     */
    async addMemory(memory) {
        return this.transaction('memories', 'readwrite', (store) => {
            const memoryData = {
                ...memory,
                timestamp: Date.now(),
                id: undefined
            };
            return store.add(memoryData);
        });
    }

    /**
     * Get memories
     */
    async getMemories(limit = 50) {
        return this.transaction('memories', 'readonly', (store) => {
            return new Promise((resolve, reject) => {
                const index = store.index('timestamp');
                const direction = 'prev';
                const request = index.openCursor(null, direction);
                const memories = [];

                request.onsuccess = (event) => {
                    const cursor = event.target.result;
                    if (cursor && memories.length < limit) {
                        memories.push(cursor.value);
                        cursor.continue();
                    } else {
                        resolve(memories);
                    }
                };

                request.onerror = () => {
                    reject(request.error);
                };
            });
        });
    }

    /**
     * Add image to gallery
     */
    async addGalleryImage(imageData) {
        return this.transaction('gallery', 'readwrite', (store) => {
            const imageRecord = {
                ...imageData,
                timestamp: Date.now(),
                id: undefined
            };
            return store.add(imageRecord);
        });
    }

    /**
     * Get gallery images
     */
    async getGalleryImages(limit = 100) {
        return this.transaction('gallery', 'readonly', (store) => {
            return new Promise((resolve, reject) => {
                const index = store.index('timestamp');
                const direction = 'prev';
                const request = index.openCursor(null, direction);
                const images = [];

                request.onsuccess = (event) => {
                    const cursor = event.target.result;
                    if (cursor && images.length < limit) {
                        images.push(cursor.value);
                        cursor.continue();
                    } else {
                        resolve(images);
                    }
                };

                request.onerror = () => {
                    reject(request.error);
                };
            });
        });
    }

    /**
     * Get app state
     */
    async getAppState(key) {
        return this.transaction('appState', 'readonly', (store) => {
            return new Promise((resolve, reject) => {
                const request = store.get(key);
                
                request.onsuccess = () => {
                    resolve(request.result ? request.result.value : null);
                };

                request.onerror = () => {
                    reject(request.error);
                };
            });
        });
    }

    /**
     * Set app state
     */
    async setAppState(key, value) {
        return this.transaction('appState', 'readwrite', (store) => {
            return store.put({ key, value });
        });
    }

    /**
     * Get current mood
     */
    async getCurrentMood() {
        const mood = await this.getAppState('currentMood');
        return mood || 100;
    }

    /**
     * Set current mood
     */
    async setCurrentMood(mood) {
        return this.setAppState('currentMood', mood);
    }

    /**
     * Update mood based on recent activity
     */
    async updateMoodFromMessages(recentMessages) {
        let mood = await this.getCurrentMood();
        
        // Simple mood calculation based on message sentiment
        for (const msg of recentMessages.slice(-5)) { // Check last 5 messages
            if (msg.type === 'user') {
                const content = msg.content.toLowerCase();
                
                // Negative words that decrease mood
                const negativeWords = ['ignore', 'busy', 'tired', 'later', 'no', 'not now'];
                if (negativeWords.some(word => content.includes(word))) {
                    mood -= 10;
                }
                
                // Positive words that increase mood
                const positiveWords = ['love', 'miss', 'want', 'good', 'nice', 'beautiful'];
                if (positiveWords.some(word => content.includes(word))) {
                    mood += 5;
                }
            }
        }
        
        // Keep mood between 0 and 100
        mood = Math.max(0, Math.min(100, mood));
        
        await this.setCurrentMood(mood);
        return mood;
    }

    /**
     * Create a memory from significant chat moments
     */
    async createMemoryFromChat(messageContent, type = 'general') {
        // Simple logic to create memories from significant messages
        if (messageContent.length > 50 && Math.random() > 0.7) { // 30% chance for long messages
            const memory = {
                type: type,
                content: messageContent.substring(0, 200) + (messageContent.length > 200 ? '...' : ''),
                importance: Math.random() > 0.5 ? 'medium' : 'low'
            };
            
            await this.addMemory(memory);
            return memory;
        }
        return null;
    }

    /**
     * Hard reset - clear all data
     */
    async hardReset() {
        const storeNames = ['chatMessages', 'memories', 'gallery', 'appState'];
        
        return Promise.all(storeNames.map(storeName => 
            this.transaction(storeName, 'readwrite', (store) => store.clear())
        ));
    }

    /**
     * Get database statistics
     */
    async getStats() {
        const chatCount = await this.transaction('chatMessages', 'readonly', (store) => {
            return new Promise((resolve) => {
                const request = store.count();
                request.onsuccess = () => resolve(request.result);
            });
        });

        const memoryCount = await this.transaction('memories', 'readonly', (store) => {
            return new Promise((resolve) => {
                const request = store.count();
                request.onsuccess = () => resolve(request.result);
            });
        });

        const galleryCount = await this.transaction('gallery', 'readonly', (store) => {
            return new Promise((resolve) => {
                const request = store.count();
                request.onsuccess = () => resolve(request.result);
            });
        });

        return {
            chatMessages: chatCount,
            memories: memoryCount,
            gallery: galleryCount,
            total: chatCount + memoryCount + galleryCount
        };
    }

    /**
     * Execute database transaction
     */
    async transaction(storeName, mode, operation) {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(new Error('Database not initialized'));
                return;
            }

            const transaction = this.db.transaction([storeName], mode);
            const store = transaction.objectStore(storeName);
            
            transaction.oncomplete = () => resolve();
            transaction.onerror = () => reject(transaction.error);
            transaction.onabort = () => reject(transaction.error);

            try {
                const result = operation(store);
                if (result instanceof IDBRequest) {
                    result.onsuccess = () => resolve(result.result);
                    result.onerror = () => reject(result.error);
                }
            } catch (error) {
                reject(error);
            }
        });
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DatabaseManager;
} else {
    window.DatabaseManager = DatabaseManager;
}