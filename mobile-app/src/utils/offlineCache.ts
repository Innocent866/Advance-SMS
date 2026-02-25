import AsyncStorage from '@react-native-async-storage/async-storage';

const CACHE_PREFIX = 'gt_cache_';
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

interface CacheEntry<T> {
    data: T;
    timestamp: number;
}

export const cacheSet = async <T>(key: string, data: T): Promise<void> => {
    const entry: CacheEntry<T> = { data, timestamp: Date.now() };
    await AsyncStorage.setItem(CACHE_PREFIX + key, JSON.stringify(entry));
};

export const cacheGet = async <T>(key: string): Promise<T | null> => {
    const raw = await AsyncStorage.getItem(CACHE_PREFIX + key);
    if (!raw) return null;
    const entry: CacheEntry<T> = JSON.parse(raw);
    if (Date.now() - entry.timestamp > CACHE_TTL_MS) return null;
    return entry.data;
};

export const cacheGetStale = async <T>(key: string): Promise<T | null> => {
    // Returns data even if expired — for offline fallback
    const raw = await AsyncStorage.getItem(CACHE_PREFIX + key);
    if (!raw) return null;
    return (JSON.parse(raw) as CacheEntry<T>).data;
};

// Offline action queue
const QUEUE_KEY = 'gt_offline_queue';

interface QueuedAction {
    id: string;
    method: 'POST' | 'PUT' | 'DELETE';
    url: string;
    data?: any;
    timestamp: number;
}

export const enqueueAction = async (action: Omit<QueuedAction, 'id' | 'timestamp'>): Promise<void> => {
    const raw = await AsyncStorage.getItem(QUEUE_KEY);
    const queue: QueuedAction[] = raw ? JSON.parse(raw) : [];
    queue.push({
        ...action,
        id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: Date.now(),
    });
    await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
};

export const getQueue = async (): Promise<QueuedAction[]> => {
    const raw = await AsyncStorage.getItem(QUEUE_KEY);
    return raw ? JSON.parse(raw) : [];
};

export const clearQueue = async (): Promise<void> => {
    await AsyncStorage.removeItem(QUEUE_KEY);
};
