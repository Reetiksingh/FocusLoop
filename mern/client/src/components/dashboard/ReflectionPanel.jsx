import { useWorkflowStore } from "../../store/useWorkflowStore";

export function ReflectionPanel() {
  const journal = useWorkflowStore(state => state.journal);
  const setJournalField = useWorkflowStore(state => state.setJournalField);
  const saveJournal = useWorkflowStore(state => state.saveJournal);
  const summary = useWorkflowStore(state => state.summary);
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
        <span className="micro-copy">{journal.dirty ? "Unsaved changes" : "Saved state is synced"}</span>
      </div>

      <div className="insight-card">
        <h3>Workflow insights</h3>
        <ul className="insight-list">
          {insights.map(line => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}
