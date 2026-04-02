const cache = new Map();

/**
 * Simple In-Memory Cache with TTL (Time To Live)
 * @param {string} key - Cache key
 * @param {any} value - Value to store
 * @param {number} ttl - Time to live in milliseconds (default 5 mins)
 */
const set = (key, value, ttl = 300000) => {
    const expiresAt = Date.now() + ttl;
    cache.set(key, { value, expiresAt });
};

/**
 * Get value from cache
 * @param {string} key - Cache key
 * @returns {any|null} - Cached value or null if expired/not found
 */
const get = (key) => {
    const entry = cache.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
        cache.delete(key);
        return null;
    }

    return entry.value;
};

/**
 * Clear specific key or whole cache
 * @param {string} key - Optional key to clear
 */
const clear = (key) => {
    if (key) {
        cache.delete(key);
    } else {
        cache.clear();
    }
};

module.exports = { set, get, clear };
