import {create} from 'zustand';
import {persist, createJSONStorage} from 'zustand/middleware';
import {zustandMMKVStorage} from '@services/storage';

interface AppState {
  bootstrapped: boolean;
  setBootstrapped: (value: boolean) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    set => ({
      bootstrapped: true,
      setBootstrapped: (value: boolean) => set({bootstrapped: value}),
    }),
    {
      name: 'app-store',
      storage: createJSONStorage(() => zustandMMKVStorage),
    },
  ),
);
