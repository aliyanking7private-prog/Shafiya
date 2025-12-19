/**
 * IndexedDB Storage Manager
 * Handles: Messages, Images, Preferences
 */

const DB_NAME = 'ShafiyaDB';
const STORE_MESSAGES = 'messages';
const STORE_IMAGES = 'images';
const STORE_PREFERENCES = 'preferences';

let db = null;

/**
 * Initialize IndexedDB
 */
export async function initDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      db = request.result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const database = event.target.result;

      // Messages store
      if (!database.objectStoreNames.contains(STORE_MESSAGES)) {
        const msgStore = database.createObjectStore(STORE_MESSAGES, { keyPath: 'id', autoIncrement: true });
        msgStore.createIndex('timestamp', 'timestamp', { unique: false });
      }

      // Images store
      if (!database.objectStoreNames.contains(STORE_IMAGES)) {
        const imgStore = database.createObjectStore(STORE_IMAGES, { keyPath: 'id', autoIncrement: true });
        imgStore.createIndex('timestamp', 'timestamp', { unique: false });
      }

      // Preferences store
      if (!database.objectStoreNames.contains(STORE_PREFERENCES)) {
        database.createObjectStore(STORE_PREFERENCES, { keyPath: 'key' });
      }
    };
  });
}

/**
 * Save message to IndexedDB
 */
export async function saveMessage(message) {
  if (!db) await initDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_MESSAGES], 'readwrite');
    const store = transaction.objectStore(STORE_MESSAGES);
    const request = store.add({
      ...message,
      timestamp: new Date().toISOString()
    });

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

/**
 * Get all messages
 */
export async function getMessages(limit = 1000) {
  if (!db) await initDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_MESSAGES], 'readonly');
    const store = transaction.objectStore(STORE_MESSAGES);
    const index = store.index('timestamp');
    const range = IDBKeyRange.lowerBound(-Infinity);
    const request = index.getAll(range, limit);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

/**
 * Clear all messages
 */
export async function clearAllMessages() {
  if (!db) await initDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_MESSAGES], 'readwrite');
    const store = transaction.objectStore(STORE_MESSAGES);
    const request = store.clear();

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

/**
 * Save image to IndexedDB
 */
export async function saveImage(imageData, url) {
  if (!db) await initDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_IMAGES], 'readwrite');
    const store = transaction.objectStore(STORE_IMAGES);
    const request = store.add({
      url,
      data: imageData,
      timestamp: new Date().toISOString(),
      size: imageData.length
    });

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

/**
 * Get all images
 */
export async function getImages() {
  if (!db) await initDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_IMAGES], 'readonly');
    const store = transaction.objectStore(STORE_IMAGES);
    const request = store.getAll();

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

/**
 * Delete image by ID
 */
export async function deleteImage(id) {
  if (!db) await initDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_IMAGES], 'readwrite');
    const store = transaction.objectStore(STORE_IMAGES);
    const request = store.delete(id);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

/**
 * Save preference
 */
export async function setPreference(key, value) {
  if (!db) await initDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_PREFERENCES], 'readwrite');
    const store = transaction.objectStore(STORE_PREFERENCES);
    const request = store.put({ key, value });

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

/**
 * Get preference
 */
export async function getPreference(key) {
  if (!db) await initDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_PREFERENCES], 'readonly');
    const store = transaction.objectStore(STORE_PREFERENCES);
    const request = store.get(key);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result?.value);
  });
}

/**
 * Hard reset - delete everything
 */
export async function hardReset() {
  if (!db) await initDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_MESSAGES, STORE_IMAGES, STORE_PREFERENCES], 'readwrite');
    
    const msgReq = transaction.objectStore(STORE_MESSAGES).clear();
    const imgReq = transaction.objectStore(STORE_IMAGES).clear();
    const prefReq = transaction.objectStore(STORE_PREFERENCES).clear();

    transaction.onerror = () => reject(transaction.error);
    transaction.oncomplete = () => resolve();
  });
}

// Clear old messages (keep last 1000 for performance)
export async function cleanupOldMessages() {
  const messages = await getMessages(2000);
  if (messages.length > 1000) {
    const toDelete = messages.slice(0, messages.length - 1000);
    if (!db) await initDB();

    const transaction = db.transaction([STORE_MESSAGES], 'readwrite');
    const store = transaction.objectStore(STORE_MESSAGES);
    toDelete.forEach(msg => store.delete(msg.id));
  }
}
