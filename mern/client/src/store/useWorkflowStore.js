import { create } from "zustand";
import { persist } from "zustand/middleware";
import { api } from "../services/api";
import { getToday } from "../lib/date";

function nextPhaseAfter(sessionType, currentFocusSessions) {
  if (sessionType !== "focus") return "focus";
  return (currentFocusSessions + 1) % 4 === 0 ? "longbreak" : "break";
}

export const useWorkflowStore = create(
  persist(
    (set, get) => ({
      selectedDate: getToday(),
      tasks: [],
      journal: {
        intention: "",
        content: "",
        dirty: false
      },
      summary: {
        totalTasks: 0,
        completedTasks: 0,
        focusSessions: 0,
        reflectionSaved: false,
        activeStreak: 0
      },
      heatmap: [],
      activeTaskId: "",
      activeSession: null,
      phase: "focus",
      settings: {
        durations: {
          focus: 25,
          break: 5,
          longbreak: 15
        },
        ambientSound: "rain",
        autoStartBreaks: true
      },
      statusMessage: "",
      loading: false,
      initialized: false,

      setSelectedDate: date => set({ selectedDate: date }),

      setPhase: phase => set({ phase }),

      setActiveTaskId: activeTaskId => set({ activeTaskId }),

      setJournalField: (field, value) =>
        set(state => ({
          journal: {
            ...state.journal,
            [field]: value,
            dirty: true
          }
        })),

      setDuration: (key, value) =>
        set(state => ({
          settings: {
            ...state.settings,
            durations: {
              ...state.settings.durations,
              [key]: Math.max(0, Math.min(60, Number(value) || 0))
            }
          }
        })),

      setAmbientSound: ambientSound =>
        set(state => ({
          settings: {
            ...state.settings,
            ambientSound
          }
        })),

      setAutoStartBreaks: autoStartBreaks =>
        set(state => ({
          settings: {
            ...state.settings,
            autoStartBreaks
          }
        })),

      setStatusMessage: statusMessage => set({ statusMessage }),

      tickSession: () =>
        set(state => {
          if (!state.activeSession) return state;
          return {
            activeSession: {
              ...state.activeSession,
              remainingSeconds: Math.max(0, state.activeSession.remainingSeconds - 1)
            }
          };
        }),

      loadDay: async (date = get().selectedDate) => {
        set({ loading: true });

        try {
          const [tasksResponse, journalResponse, summaryResponse, heatmapResponse, sessionResponse] = await Promise.all([
            api.get(`/tasks?date=${date}`),
            api.get(`/journal/${date}`),
            api.get(`/stats/summary?date=${date}`),
            api.get("/stats/heatmap?days=35"),
            api.get("/sessions/active")
          ]);

          const tasks = tasksResponse.data.tasks;
          const activeSession = sessionResponse.data.session;
          const focusableTask = tasks.find(task => task.status !== "completed" && task.requiresFocus);

          set(state => ({
            tasks,
            journal: {
              intention: journalResponse.data.journal.intention,
              content: journalResponse.data.journal.content,
              dirty: false
            },
            summary: summaryResponse.data.summary,
            heatmap: heatmapResponse.data.heatmap,
            activeSession,
            activeTaskId:
              activeSession?.taskId ||
              (tasks.some(task => task.id === state.activeTaskId) ? state.activeTaskId : focusableTask?.id || ""),
            phase: activeSession?.sessionType || state.phase,
            initialized: true,
            loading: false,
            statusMessage: ""
          }));
        } catch (error) {
          set({
            loading: false,
            statusMessage: error.response?.data?.message || "Unable to load the workflow."
          });
          throw error;
        }
      },

      refreshStats: async () => {
        const date = get().selectedDate;
        const [summaryResponse, heatmapResponse] = await Promise.all([
          api.get(`/stats/summary?date=${date}`),
          api.get("/stats/heatmap?days=35")
        ]);

        set({
          summary: summaryResponse.data.summary,
          heatmap: heatmapResponse.data.heatmap
        });
      },

      addTask: async ({ title, completedWithoutFocus = false }) => {
        const response = await api.post("/tasks", {
          title,
          date: get().selectedDate,
          requiresFocus: !completedWithoutFocus,
          completedWithoutFocus
        });

        set(state => ({
          tasks: [...state.tasks, response.data.task],
          activeTaskId:
            !completedWithoutFocus && !state.activeTaskId ? response.data.task.id : state.activeTaskId,
          statusMessage: completedWithoutFocus
            ? "Task added and marked done instantly."
            : "Task added to the plan."
        }));

        await get().refreshStats();
      },

      updateTask: async (taskId, payload) => {
        const response = await api.patch(`/tasks/${taskId}`, payload);
        set(state => ({
          tasks: state.tasks.map(task => (task.id === taskId ? response.data.task : task)),
          statusMessage: "Task updated."
        }));
        await get().refreshStats();
      },

      deleteTask: async taskId => {
        await api.delete(`/tasks/${taskId}`);
        set(state => ({
          tasks: state.tasks.filter(task => task.id !== taskId),
          activeTaskId: state.activeTaskId === taskId ? "" : state.activeTaskId,
          statusMessage: "Task removed."
        }));
        await get().refreshStats();
      },

      saveJournal: async () => {
        const { journal, selectedDate } = get();
        const response = await api.put(`/journal/${selectedDate}`, {
          intention: journal.intention,
          content: journal.content
        });

        set({
          journal: {
            intention: response.data.journal.intention,
            content: response.data.journal.content,
            dirty: false
          },
          statusMessage: "Reflection saved."
        });

        await get().refreshStats();
      },

      startSession: async ({ sessionType = get().phase } = {}) => {
        const { selectedDate, activeTaskId, settings } = get();
        const focusSessionsBeforeStart = get().summary.focusSessions;
        const plannedMinutes = settings.durations[sessionType];

        if (sessionType === "focus" && !activeTaskId) {
          throw new Error("Select a task before starting focus.");
        }

        const response = await api.post("/sessions", {
          date: selectedDate,
          taskId: sessionType === "focus" ? activeTaskId : null,
          sessionType,
          plannedMinutes,
          ambientSound: settings.ambientSound
        });

        const session = response.data.session;

        if (session.status === "completed") {
          await get().loadDay(selectedDate);
          set({
            phase: nextPhaseAfter(sessionType, focusSessionsBeforeStart),
            statusMessage:
              plannedMinutes === 0
                ? "Instant session recorded."
                : "Session completed."
          });
          return session;
        }

        set({
          activeSession: session,
          phase: sessionType,
          statusMessage: `${sessionType} session started.`
        });

        return session;
      },

      pauseSession: async () => {
        const session = get().activeSession;
        if (!session) return;

        const response = await api.patch(`/sessions/${session.id}/pause`, {
          remainingSeconds: session.remainingSeconds
        });

        set({
          activeSession: response.data.session,
          statusMessage: "Session paused."
        });
      },

      resumeSession: async () => {
        const session = get().activeSession;
        if (!session) return;

        const response = await api.patch(`/sessions/${session.id}/resume`, {
          remainingSeconds: session.remainingSeconds
        });

        set({
          activeSession: response.data.session,
          statusMessage: "Session resumed."
        });
      },

      completeSession: async () => {
        const session = get().activeSession;
        if (!session) return;

        await api.patch(`/sessions/${session.id}/complete`);
        const nextPhase = nextPhaseAfter(session.sessionType, get().summary.focusSessions);

        set({
          activeSession: null,
          phase: nextPhase,
          statusMessage: "Session completed."
        });

        await get().loadDay(get().selectedDate);

        if (session.sessionType === "focus" && get().settings.autoStartBreaks) {
          try {
            await get().startSession({ sessionType: nextPhase });
          } catch (error) {
            console.error("Unable to auto-start break", error);
          }
        }
      },

      cancelSession: async () => {
        const session = get().activeSession;
        if (!session) return;

        await api.delete(`/sessions/${session.id}`);
        set({
          activeSession: null,
          phase: "focus",
          statusMessage: "Session cancelled."
        });

        await get().loadDay(get().selectedDate);
      }
    }),
    {
      name: "lifepro-workflow-ui",
      partialize: state => ({
        selectedDate: state.selectedDate,
        activeTaskId: state.activeTaskId,
        phase: state.phase,
        settings: state.settings
      })
    }
  )
);
