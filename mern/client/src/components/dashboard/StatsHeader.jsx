import { useAuthStore } from "../../store/useAuthStore";
import { useWorkflowStore } from "../../store/useWorkflowStore";
import { HeatmapMini } from "./HeatmapMini";

export function StatsHeader() {
  const user = useAuthStore(state => state.user);
  const logout = useAuthStore(state => state.logout);
  const selectedDate = useWorkflowStore(state => state.selectedDate);
  const setSelectedDate = useWorkflowStore(state => state.setSelectedDate);
  const summary = useWorkflowStore(state => state.summary);
  const weeklyReport = useWorkflowStore(state => state.weeklyReport);
  const heatmap = useWorkflowStore(state => state.heatmap);

  return (
    <>
      <header className="topbar">
        <div>
          <p className="eyebrow">Workflow-first productivity</p>
          <h1>Life Pro</h1>
          <p className="subtitle">Welcome back, {user?.name}. Build discipline one intentional day at a time.</p>
        </div>

        <div className="header-actions">
          <label className="field-inline">
            <span>Date</span>
            <input type="date" value={selectedDate} onChange={event => setSelectedDate(event.target.value)} />
          </label>
          <button type="button" className="ghost-button" onClick={logout}>
            Logout
          </button>
        </div>
      </header>

      <section className="summary-shell">
        <div className="summary-copy">
          <p className="eyebrow">Daily flow</p>
          <h2>Plan, execute, and close the loop without switching systems.</h2>
          <p>
            Use the top section to plan and reflect, then drop into the full-width focus panel to do the
            work.
          </p>
          <p className="micro-copy">{weeklyReport.headline}</p>
        </div>

        <div className="stats-grid">
          <article className="metric-card">
            <span className="metric-label">Tasks completed</span>
            <strong>{summary.completedTasks} / {summary.totalTasks}</strong>
          </article>
          <article className="metric-card">
            <span className="metric-label">Focus sessions</span>
            <strong>{summary.focusSessions}</strong>
          </article>
          <article className="metric-card">
            <span className="metric-label">Reflection</span>
            <strong>{summary.reflectionSaved ? "Saved" : "Open"}</strong>
          </article>
          <article className="metric-card">
            <span className="metric-label">Active streak</span>
            <strong>{summary.activeStreak} day{summary.activeStreak === 1 ? "" : "s"}</strong>
          </article>
        </div>

        <HeatmapMini items={heatmap} />
      </section>
    </>
  );
}
