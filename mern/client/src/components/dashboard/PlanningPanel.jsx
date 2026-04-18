import { useState } from "react";
import { useWorkflowStore } from "../../store/useWorkflowStore";

function TaskList({ title, count, emptyCopy, tasks, actions, selectedTaskId }) {
  return (
    <div className="task-column">
      <div className="column-header">
        <h3>{title}</h3>
        <span>{count}</span>
      </div>

      {tasks.length === 0 ? <p className="empty-copy">{emptyCopy}</p> : null}

      <div className="task-stack">
        {tasks.map(task => (
          <article
            key={task.id}
            className={`task-card ${task.status === "completed" ? "is-complete" : ""} ${
              selectedTaskId === task.id ? "is-selected" : ""
            }`}
          >
            <div>
              <div className="task-title-row">
                <strong>{task.title}</strong>
                {!task.requiresFocus ? <span className="pill">Quick task</span> : null}
                {task.completedWithoutFocus ? <span className="pill pill-success">Done without focus</span> : null}
              </div>
              <p className="micro-copy">
                {task.focusSessionCount} focus session{task.focusSessionCount === 1 ? "" : "s"} logged
              </p>
            </div>

            <div className="task-actions">
              {actions(task)}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

export function PlanningPanel() {
  const tasks = useWorkflowStore(state => state.tasks);
  const activeTaskId = useWorkflowStore(state => state.activeTaskId);
  const journal = useWorkflowStore(state => state.journal);
  const setJournalField = useWorkflowStore(state => state.setJournalField);
  const saveJournal = useWorkflowStore(state => state.saveJournal);
  const setActiveTaskId = useWorkflowStore(state => state.setActiveTaskId);
  const addTask = useWorkflowStore(state => state.addTask);
  const updateTask = useWorkflowStore(state => state.updateTask);
  const deleteTask = useWorkflowStore(state => state.deleteTask);

  const [draftTask, setDraftTask] = useState("");
  const [quickComplete, setQuickComplete] = useState(false);

  const activeTasks = tasks.filter(task => task.status !== "completed");
  const completedTasks = tasks.filter(task => task.status === "completed");

  async function handleAddTask(event) {
    event.preventDefault();
    if (!draftTask.trim()) return;

    await addTask({
      title: draftTask.trim(),
      completedWithoutFocus: quickComplete
    });

    setDraftTask("");
    setQuickComplete(false);
  }

  return (
    <section className="panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Plan</p>
          <h2>Planning Panel</h2>
        </div>
        <span className="panel-hint">Define today clearly before the focus timer starts.</span>
      </div>

      <label className="field-block">
        <span>Daily intention</span>
        <textarea
          rows="3"
          value={journal.intention}
          onChange={event => setJournalField("intention", event.target.value)}
          placeholder="What matters most about how you show up today?"
        />
      </label>

      <div className="inline-actions">
        <button type="button" className="ghost-button" onClick={saveJournal}>
          Save intention
        </button>
      </div>

      <form className="task-form" onSubmit={handleAddTask}>
        <input
          type="text"
          value={draftTask}
          onChange={event => setDraftTask(event.target.value)}
          placeholder="Add a task for today"
        />
        <button type="submit">Add task</button>
      </form>

      <label className="checkbox-row compact">
        <input type="checkbox" checked={quickComplete} onChange={event => setQuickComplete(event.target.checked)} />
        <span>Mark as done without focus</span>
      </label>

      <div className="planning-grid">
        <TaskList
          title="Active tasks"
          count={activeTasks.length}
          emptyCopy="No active tasks yet."
          tasks={activeTasks}
          selectedTaskId={activeTaskId}
          actions={task => (
            <>
              <button type="button" className="ghost-button" disabled={!task.requiresFocus} onClick={() => setActiveTaskId(task.id)}>
                {activeTaskId === task.id ? "Selected" : "Focus"}
              </button>
              <button
                type="button"
                className="ghost-button"
                onClick={() =>
                  updateTask(task.id, {
                    status: "completed",
                    completedWithoutFocus: !task.requiresFocus
                  })
                }
              >
                Done
              </button>
              <button type="button" className="ghost-button" onClick={() => deleteTask(task.id)}>
                Delete
              </button>
            </>
          )}
        />

        <TaskList
          title="Completed"
          count={completedTasks.length}
          emptyCopy="Completed tasks will appear here."
          tasks={completedTasks}
          selectedTaskId={activeTaskId}
          actions={task => (
            <>
              <button
                type="button"
                className="ghost-button"
                onClick={() =>
                  updateTask(task.id, {
                    status: "planned",
                    completedWithoutFocus: false
                  })
                }
              >
                Reopen
              </button>
            </>
          )}
        />
      </div>
    </section>
  );
}
