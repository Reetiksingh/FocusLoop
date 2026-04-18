import { useEffect } from "react";
import { useWorkflowStore } from "../../store/useWorkflowStore";
import { FocusPanel } from "./FocusPanel";
import { PlanningPanel } from "./PlanningPanel";
import { ReflectionPanel } from "./ReflectionPanel";
import { StatsHeader } from "./StatsHeader";

export function DashboardPage() {
  const selectedDate = useWorkflowStore(state => state.selectedDate);
  const initialized = useWorkflowStore(state => state.initialized);
  const loading = useWorkflowStore(state => state.loading);
  const statusMessage = useWorkflowStore(state => state.statusMessage);
  const loadDay = useWorkflowStore(state => state.loadDay);

  useEffect(() => {
    loadDay(selectedDate).catch(error => {
      console.error("Unable to bootstrap dashboard", error);
    });
  }, [loadDay, selectedDate]);

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
