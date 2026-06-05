import { create } from "zustand";

type SessionState = {
  activeSessionId?: string;
  elapsedSeconds: number;
  interruptions: number;
  tabSwitches: number;
  setActiveSession: (id?: string) => void;
  tick: () => void;
  recordInterruption: () => void;
  recordTabSwitch: () => void;
};

export const useSessionStore = create<SessionState>((set) => ({
  elapsedSeconds: 0,
  interruptions: 0,
  tabSwitches: 0,
  setActiveSession: (id) => set({ activeSessionId: id, elapsedSeconds: 0, interruptions: 0, tabSwitches: 0 }),
  tick: () => set((state) => ({ elapsedSeconds: state.elapsedSeconds + 1 })),
  recordInterruption: () => set((state) => ({ interruptions: state.interruptions + 1 })),
  recordTabSwitch: () => set((state) => ({ tabSwitches: state.tabSwitches + 1 }))
}));
