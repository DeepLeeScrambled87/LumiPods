// LocalStorage abstraction with type safety

const STORAGE_PREFIX = 'lumipods';

export const storage = {
  get<T>(key: string, defaultValue: T): T {
    try {
      const item = localStorage.getItem(`${STORAGE_PREFIX}-${key}`);
      return item ? (JSON.parse(item) as T) : defaultValue;
    } catch {
      return defaultValue;
    }
  },

  set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(`${STORAGE_PREFIX}-${key}`, JSON.stringify(value));
    } catch (error) {
      console.error(`Failed to save ${key} to localStorage:`, error);
    }
  },

  remove(key: string): void {
    try {
      localStorage.removeItem(`${STORAGE_PREFIX}-${key}`);
    } catch (error) {
      console.error(`Failed to remove ${key} from localStorage:`, error);
    }
  },

  clear(): void {
    try {
      const keys = Object.keys(localStorage).filter((k) => k.startsWith(STORAGE_PREFIX));
      keys.forEach((k) => localStorage.removeItem(k));
    } catch (error) {
      console.error('Failed to clear localStorage:', error);
    }
  },
};

// Storage keys enum for type safety
export const STORAGE_KEYS = {
  FAMILY: 'family',
  CURRENT_POD: 'current-pod',
  ARTIFACTS: 'artifacts',
  POINTS: 'points',
  PROGRESS: 'progress',
  SETTINGS: 'settings',
} as const;
