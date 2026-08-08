import { create } from 'zustand';

interface UIState {
  isMobileFrame: boolean;
  setMobileFrame: (val: boolean) => void;
  isMobileDevice: boolean;
  setMobileDevice: (val: boolean) => void;
  activeView: string;
  setActiveView: (view: string) => void;
}

export const useUIStore = create<UIState>((set) => ({
  // TransConet is a phone-only application. No desktop/mobile simulator mode.
  isMobileFrame: false,
  setMobileFrame: () => set({ isMobileFrame: false }),
  isMobileDevice: true,
  setMobileDevice: () => set({ isMobileDevice: true }),
  activeView: 'dashboard',
  setActiveView: (view) => set({ activeView: view }),
}));
