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
  isMobileFrame: window.innerWidth > 768,
  setMobileFrame: (val) => set({ isMobileFrame: val }),
  isMobileDevice: window.innerWidth < 768,
  setMobileDevice: (val) => set({ isMobileDevice: val }),
  activeView: 'dashboard',
  setActiveView: (view) => set({ activeView: view }),
}));
