import { create } from "zustand";

export const useAppStore = create(set => ({
  auth: {
    user: null,
    status: "idle"
  },
  planner: {
    selectedDate: new Date().toISOString().split("T")[0],
    intention: "",
    tasks: []
  },
  focus: {
    activeTaskId: "",
    session: "focus",
    remainingSeconds: 25 * 60,
    isRunning: false,
    durations: {
      focus: 25,
      break: 5,
      longbreak: 15
    },
    ambientSound: ""
  },
  reflection: {
    journal: ""
  },
  stats: {
    summary: null,
    heatmap: []
  },
  setPlanner: planner => set(state => ({ planner: { ...state.planner, ...planner } })),
  setFocus: focus => set(state => ({ focus: { ...state.focus, ...focus } })),
  setReflection: reflection => set(state => ({ reflection: { ...state.reflection, ...reflection } }))
}));
