import {MMKV} from 'react-native-mmkv';

export const storage = new MMKV({
  id: 'mobilecloud-storage',
});

// Adapter so Zustand's persist middleware can use MMKV synchronously.
export const zustandMMKVStorage = {
  setItem: (name: string, value: string) => {
    storage.set(name, value);
  },
  getItem: (name: string): string | null => {
    const value = storage.getString(name);
    return value ?? null;
  },
  removeItem: (name: string) => {
    storage.delete(name);
  },
};
