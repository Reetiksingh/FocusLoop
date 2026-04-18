import { useWorkflowStore } from "../../store/useWorkflowStore";

export function ReflectionPanel() {
  const journal = useWorkflowStore(state => state.journal);
  const setJournalField = useWorkflowStore(state => state.setJournalField);
  const saveJournal = useWorkflowStore(state => state.saveJournal);
  const insertGuidedReflection = useWorkflowStore(state => state.insertGuidedReflection);
  const summary = useWorkflowStore(state => state.summary);
  const weeklyReport = useWorkflowStore(state => state.weeklyReport);
  const tasks = useWorkflowStore(state => state.tasks);
  const activeSession = useWorkflowStore(state => state.activeSession);

  const quickWins = tasks.filter(task => task.completedWithoutFocus).length;
  const focusedTasks = tasks.filter(task => task.focusSessionCount > 0).length;

  const insights = [
    `${summary.completedTasks} of ${summary.totalTasks} tasks are complete.`,
    `${summary.focusSessions} focus session${summary.focusSessions === 1 ? "" : "s"} finished today.`,
    `${quickWins} quick task${quickWins === 1 ? "" : "s"} were completed without focus.`,
    `${focusedTasks} task${focusedTasks === 1 ? "" : "s"} moved through a deep-work session.`,
    activeSession ? `Current active session: ${activeSession.sessionType}.` : "No active session is running right now."
  ];

  return (
    <section className="panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Reflect</p>
          <h2>Reflection Panel</h2>
        </div>
        <span className="panel-hint">Turn the day into a lesson before it disappears.</span>
      </div>

      <label className="field-block">
        <span>Daily journal</span>
        <textarea
          rows="14"
          value={journal.content}
          onChange={event => setJournalField("content", event.target.value)}
          placeholder="What worked, what distracted you, and what should tomorrow borrow from today?"
        />
      </label>

      <div className="inline-actions">
        <button type="button" onClick={saveJournal}>
          Save reflection
        </button>
        <button type="button" className="ghost-button" onClick={insertGuidedReflection}>
          Use guided prompt
        </button>
        <span className="micro-copy">{journal.dirty ? "Unsaved changes" : "Saved state is synced"}</span>
      </div>

      {summary.closureNeeded ? (
        <div className="coach-card closure-card">
          <div className="coach-copy">
            <p className="eyebrow">End-of-day closure</p>
            <h3>Your tasks are done. Close the day while the signal is still fresh.</h3>
            <p className="micro-copy">
              Capture what worked, what caused friction, and what tomorrow should inherit.
            </p>
          </div>
          <div className="coach-actions">
            <button type="button" onClick={insertGuidedReflection}>
              Start guided reflection
            </button>
          </div>
        </div>
      ) : null}

      <div className="insight-card">
        <h3>Workflow insights</h3>
        <ul className="insight-list">
          {insights.map(line => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </div>

      <div className="insight-card">
        <h3>Weekly discipline report</h3>
        <p className="micro-copy">{weeklyReport.headline}</p>
        <ul className="insight-list">
          <li>{weeklyReport.totalCompletedTasks} tasks completed this week.</li>
          <li>{weeklyReport.totalFocusSessions} focus sessions completed this week.</li>
          <li>{weeklyReport.reflectionDays} reflection day{weeklyReport.reflectionDays === 1 ? "" : "s"} saved.</li>
          <li>{weeklyReport.cancelledSessions} session{weeklyReport.cancelledSessions === 1 ? "" : "s"} were cancelled.</li>
          <li>Best day this week: {weeklyReport.bestDay || "Not enough data yet"}.</li>
        </ul>
      </div>
    </section>
  );
}
