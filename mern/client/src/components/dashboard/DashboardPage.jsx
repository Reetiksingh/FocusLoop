import { useEffect } from "react";
import { useWorkflowStore } from "../../store/useWorkflowStore";
import { FocusPanel } from "./FocusPanel";
import { PlanningPanel } from "./PlanningPanel";
import { ReflectionPanel } from "./ReflectionPanel";
import { StatsHeader } from "./StatsHeader";

function isTypingTarget(target) {
  if (!(target instanceof HTMLElement)) return false;
  const tagName = target.tagName;
  return tagName === "INPUT" || tagName === "TEXTAREA" || tagName === "SELECT" || target.isContentEditable;
}

export function DashboardPage() {
  const selectedDate = useWorkflowStore(state => state.selectedDate);
  const initialized = useWorkflowStore(state => state.initialized);
  const loading = useWorkflowStore(state => state.loading);
  const statusMessage = useWorkflowStore(state => state.statusMessage);
  const loadDay = useWorkflowStore(state => state.loadDay);
  const dismissStatusMessage = useWorkflowStore(state => state.dismissStatusMessage);

  useEffect(() => {
    loadDay(selectedDate).catch(error => {
      console.error("Unable to bootstrap dashboard", error);
    });
  }, [loadDay, selectedDate]);

  useEffect(() => {
    if (!statusMessage) return undefined;
    const timeout = window.setTimeout(() => dismissStatusMessage(), 3600);
    return () => window.clearTimeout(timeout);
  }, [dismissStatusMessage, statusMessage]);

  useEffect(() => {
    function handleKeydown(event) {
      if (isTypingTarget(event.target)) {
        if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
          useWorkflowStore.getState().saveJournal().catch(error => {
            console.error("Unable to save reflection from keyboard shortcut", error);
          });
        }
        return;
      }

      const workflow = useWorkflowStore.getState();

      if (event.key === " ") {
        event.preventDefault();
        if (workflow.activeSession?.status === "running") {
          workflow.pauseSession();
        } else if (workflow.activeSession?.status === "paused") {
          workflow.resumeSession();
        } else {
          workflow.startSession({ sessionType: workflow.phase }).catch(error => {
            console.error("Unable to start session from keyboard shortcut", error);
          });
        }
      }

      if (event.key === "Escape" && workflow.activeSession) {
        workflow.cancelSession().catch(error => {
          console.error("Unable to cancel session from keyboard shortcut", error);
        });
      }

      if (!workflow.activeSession && ["1", "2", "3"].includes(event.key)) {
        const nextPhase = { 1: "focus", 2: "break", 3: "longbreak" }[event.key];
        workflow.setPhase(nextPhase);
      }
    }

    window.addEventListener("keydown", handleKeydown);
    return () => window.removeEventListener("keydown", handleKeydown);
  }, []);

  if (!initialized && loading) {
    return <div className="screen-center">Loading your dashboard...</div>;
  }

  return (
    <div className="app-shell">
      <StatsHeader />

      {statusMessage ? <div className="status-banner">{statusMessage}</div> : null}

      <main className="dashboard-grid">
        <PlanningPanel />
        <ReflectionPanel />
      </main>

      <FocusPanel />
    </div>
  );
}
