import { useEffect, useRef, useState } from "react";
import { formatMinutes } from "../../lib/date";
import { useWorkflowStore } from "../../store/useWorkflowStore";

const SOUND_OPTIONS = [
  { label: "None", value: "" },
  { label: "Rain", value: "rain" },
  { label: "Wind", value: "wind" },
  { label: "Waterfall", value: "waterfall" },
  { label: "Snow", value: "snow" }
];

const PHASE_OPTIONS = [
  { label: "Focus", value: "focus" },
  { label: "Short Break", value: "break" },
  { label: "Long Break", value: "longbreak" }
];

export function FocusPanel() {
  const tasks = useWorkflowStore(state => state.tasks);
  const activeTaskId = useWorkflowStore(state => state.activeTaskId);
  const activeSession = useWorkflowStore(state => state.activeSession);
  const phase = useWorkflowStore(state => state.phase);
  const settings = useWorkflowStore(state => state.settings);
  const summary = useWorkflowStore(state => state.summary);
  const setPhase = useWorkflowStore(state => state.setPhase);
  const setActiveTaskId = useWorkflowStore(state => state.setActiveTaskId);
  const setDuration = useWorkflowStore(state => state.setDuration);
  const setAmbientSound = useWorkflowStore(state => state.setAmbientSound);
  const setAutoStartBreaks = useWorkflowStore(state => state.setAutoStartBreaks);
  const startSession = useWorkflowStore(state => state.startSession);
  const pauseSession = useWorkflowStore(state => state.pauseSession);
  const resumeSession = useWorkflowStore(state => state.resumeSession);
  const completeSession = useWorkflowStore(state => state.completeSession);
  const cancelSession = useWorkflowStore(state => state.cancelSession);
  const updateTask = useWorkflowStore(state => state.updateTask);
  const setStatusMessage = useWorkflowStore(state => state.setStatusMessage);

  const loopAudioRef = useRef(null);
  const previewAudioRef = useRef(null);
  const [audioError, setAudioError] = useState("");

  const focusableTasks = tasks.filter(task => task.status !== "completed" && task.requiresFocus);
  const activeTask = focusableTasks.find(task => task.id === activeTaskId) || null;
  const displayedSeconds = activeSession?.remainingSeconds ?? settings.durations[phase] * 60;
  const running = activeSession?.status === "running";
  const paused = activeSession?.status === "paused";
  const coach = summary.coach;

  useEffect(() => {
    if (!activeSession || activeSession.status !== "running") {
      return undefined;
    }

    const interval = window.setInterval(() => {
      const currentSession = useWorkflowStore.getState().activeSession;

      if (!currentSession) {
        window.clearInterval(interval);
        return;
      }

      if (currentSession.remainingSeconds <= 1) {
        window.clearInterval(interval);
        useWorkflowStore
          .getState()
          .completeSession()
          .catch(error => {
            console.error("Unable to complete session", error);
          });
        return;
      }

      useWorkflowStore.getState().tickSession();
    }, 1000);

    return () => window.clearInterval(interval);
  }, [activeSession?.id, activeSession?.status]);

  useEffect(() => {
    const loopAudio = loopAudioRef.current || new Audio();
    loopAudioRef.current = loopAudio;
    loopAudio.volume = 0.35;

    if (!running || !settings.ambientSound) {
      loopAudio.pause();
      loopAudio.currentTime = 0;
      return;
    }

    loopAudio.src = `/sounds/${settings.ambientSound}.mp3`;
    loopAudio.loop = true;
    loopAudio.play().catch(error => {
      console.error("Ambient sound playback failed", error);
      setAudioError("Browser blocked auto-play. Use Preview Sound once to enable audio.");
    });

    return () => {
      loopAudio.pause();
      loopAudio.currentTime = 0;
    };
  }, [running, settings.ambientSound]);

  async function handleStart() {
    try {
      setAudioError("");
      await startSession({ sessionType: phase });
    } catch (error) {
      setStatusMessage(error.message || "Unable to start the session.");
    }
  }

  async function handlePreviewSound() {
    setAudioError("");

    try {
      if (running) {
        setAudioError("Pause the current session before previewing a different sound.");
        return;
      }

      stopAllAudio();

      if (previewAudioRef.current) {
        previewAudioRef.current.pause();
        previewAudioRef.current.currentTime = 0;
      }

      if (!settings.ambientSound) {
        setAudioError("Choose a sound first.");
        return;
      }

      const audio = new Audio(`/sounds/${settings.ambientSound}.mp3`);
      audio.volume = 0.35;
      previewAudioRef.current = audio;
      await audio.play();
    } catch (error) {
      console.error("Preview playback failed", error);
      setAudioError("Sound preview failed. Check the sound files inside client/public/sounds.");
    }
  }

  function stopAllAudio() {
    if (loopAudioRef.current) {
      loopAudioRef.current.pause();
      loopAudioRef.current.currentTime = 0;
    }

    if (previewAudioRef.current) {
      previewAudioRef.current.pause();
      previewAudioRef.current.currentTime = 0;
    }
  }

  return (
    <section className="panel focus-panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Focus</p>
          <h2>Focus Panel</h2>
        </div>
        <span className="panel-hint">Deep work, instant tasks, breaks, and ambient sound all live here.</span>
      </div>

      <div className="phase-tabs">
        {PHASE_OPTIONS.map(option => (
          <button
            key={option.value}
            type="button"
            disabled={Boolean(activeSession)}
            className={phase === option.value ? "active" : ""}
            onClick={() => setPhase(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>

      <div className="focus-layout">
        <div className="focus-main">
          <label className="field-block">
            <span>Task in progress</span>
            <select value={activeTaskId} onChange={event => setActiveTaskId(event.target.value)} disabled={phase !== "focus"}>
              <option value="">Choose a task to focus on</option>
              {focusableTasks.map(task => (
                <option key={task.id} value={task.id}>
                  {task.title}
                </option>
              ))}
            </select>
          </label>

          <div className="timer-stage" data-phase={phase}>
            <p className="eyebrow">{phase === "focus" ? "Execution" : "Recovery"}</p>
            <div className="timer-value">{formatMinutes(displayedSeconds)}</div>
            <p className="micro-copy">
              {phase === "focus"
                ? activeTask
                  ? `Currently targeting: ${activeTask.title}`
                  : "Select a task before starting a focus block."
                : "Break sessions help protect your next focus block."}
            </p>
          </div>

          <div className="control-row">
            {!running && !paused ? <button type="button" onClick={handleStart}>Start</button> : null}
            {running ? (
              <button type="button" className="ghost-button" onClick={pauseSession}>
                Pause
              </button>
            ) : null}
            {paused ? (
              <button type="button" onClick={resumeSession}>
                Resume
              </button>
            ) : null}
            {(running || paused) ? (
              <button type="button" className="ghost-button" onClick={completeSession}>
                Complete
              </button>
            ) : null}
            {(running || paused) ? (
              <button type="button" className="ghost-button" onClick={cancelSession}>
                Cancel
              </button>
            ) : null}
            {phase === "focus" && activeTask ? (
              <button
                type="button"
                className="ghost-button"
                onClick={() =>
                  updateTask(activeTask.id, {
                    status: "completed",
                    completedWithoutFocus: false
                  })
                }
              >
                Mark task done
              </button>
            ) : null}
          </div>
        </div>

        <aside className="focus-side">
          <div className="duration-grid">
            <label className="field-block">
              <span>Focus minutes</span>
              <input
                type="number"
                min="0"
                max="60"
                value={settings.durations.focus}
                onChange={event => setDuration("focus", event.target.value)}
              />
            </label>

            <label className="field-block">
              <span>Short break</span>
              <input
                type="number"
                min="0"
                max="60"
                value={settings.durations.break}
                onChange={event => setDuration("break", event.target.value)}
              />
            </label>

            <label className="field-block">
              <span>Long break</span>
              <input
                type="number"
                min="0"
                max="60"
                value={settings.durations.longbreak}
                onChange={event => setDuration("longbreak", event.target.value)}
              />
            </label>
          </div>

          <div className={`coach-card ${coach.rescueMode ? "rescue-card" : ""}`}>
            <div className="coach-copy">
              <p className="eyebrow">{coach.rescueMode ? "Focus rescue mode" : "Smart recommendation"}</p>
              <h3>{coach.rescueMode ? "Shrink the target and rebuild momentum." : "Your current rhythm looks stable."}</h3>
              <p className="micro-copy">{coach.rescueMessage}</p>
            </div>
            <div className="coach-actions">
              <button type="button" className="ghost-button" onClick={() => setDuration("focus", coach.recommendedFocusMinutes)}>
                Use {coach.recommendedFocusMinutes} min focus
              </button>
            </div>
          </div>

          <label className="field-block">
            <span>Ambient sound</span>
            <select value={settings.ambientSound} onChange={event => setAmbientSound(event.target.value)}>
              {SOUND_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <div className="control-row">
            <button type="button" className="ghost-button" onClick={handlePreviewSound} disabled={running}>
              Preview sound
            </button>
            <button type="button" className="ghost-button" onClick={stopAllAudio}>
              Stop sound
            </button>
          </div>

          <label className="checkbox-row compact">
            <input
              type="checkbox"
              checked={settings.autoStartBreaks}
              onChange={event => setAutoStartBreaks(event.target.checked)}
            />
            <span>Auto-start breaks after focus</span>
          </label>

          {audioError ? <p className="form-error">{audioError}</p> : null}

          <p className="micro-copy">Keyboard: `Space` start/pause, `Esc` cancel, `1/2/3` switch phase when idle.</p>

          <div className="focus-stats">
            <article className="metric-card">
              <span className="metric-label">Today</span>
              <strong>{summary.focusSessions} session{summary.focusSessions === 1 ? "" : "s"}</strong>
            </article>
            <article className="metric-card">
              <span className="metric-label">Resume state</span>
              <strong>{activeSession ? activeSession.status : "Ready"}</strong>
            </article>
          </div>
        </aside>
      </div>
    </section>
  );
}
