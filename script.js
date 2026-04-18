const STORAGE_KEY = "lifeProState";
const NOTIFICATION_SOUND = "sounds/wind.mp3";
const HEATMAP_DAYS = 35;
const AMBIENT_FILES = {
  rain: "sounds/rain.mp3",
  wind: "sounds/wind.mp3",
  waterfall: "sounds/waterfall.mp3",
  snow: "sounds/snow.mp3"
};

const elements = {
  datePicker: document.getElementById("date-picker"),
  focusModeToggle: document.getElementById("focus-mode-toggle"),
  workflowTitle: document.getElementById("workflow-title"),
  workflowMessage: document.getElementById("workflow-message"),
  metricCompleted: document.getElementById("metric-completed"),
  metricPomodoros: document.getElementById("metric-pomodoros"),
  metricJournal: document.getElementById("metric-journal"),
  metricStreak: document.getElementById("metric-streak"),
  heatmapGrid: document.getElementById("heatmap-grid"),
  intention: document.getElementById("day-intention"),
  taskInput: document.getElementById("new-task"),
  addTaskButton: document.getElementById("add-task"),
  skipFocusOnAdd: document.getElementById("skip-focus-on-add"),
  taskList: document.getElementById("task-list"),
  completedTaskList: document.getElementById("completed-task-list"),
  activeTaskCount: document.getElementById("active-task-count"),
  completedTaskCount: document.getElementById("completed-task-count"),
  taskSelect: document.getElementById("task-select"),
  timerStage: document.getElementById("timer-stage"),
  sessionLabel: document.getElementById("session-label"),
  sessionMessage: document.getElementById("session-message"),
  pomodoroDisplay: document.getElementById("pomodoro-display"),
  startButton: document.getElementById("start-pomodoro"),
  pauseButton: document.getElementById("pause-pomodoro"),
  resetButton: document.getElementById("reset-pomodoro"),
  skipButton: document.getElementById("skip-session"),
  focusDuration: document.getElementById("focus-duration"),
  breakDuration: document.getElementById("break-duration"),
  longBreakDuration: document.getElementById("longbreak-duration"),
  ambientSelect: document.getElementById("ambient-select"),
  previewSound: document.getElementById("preview-sound"),
  stopSound: document.getElementById("stop-sound"),
  autoStartBreaks: document.getElementById("auto-start-breaks"),
  pomodoroCount: document.getElementById("pomodoro-count"),
  pomodoroStreak: document.getElementById("pomodoro-streak"),
  journalEntry: document.getElementById("journal-entry"),
  saveJournal: document.getElementById("save-journal"),
  journalStatus: document.getElementById("journal-status"),
  insightList: document.getElementById("insight-list")
};

const state = {
  selectedDate: getToday(),
  isRunning: false,
  intervalId: null,
  activeAudio: null,
  audioCache: {},
  app: loadAppState()
};

function getToday() {
  return new Date().toISOString().split("T")[0];
}

function createDefaultAppState() {
  return {
    settings: {
      durations: {
        focus: 25,
        break: 5,
        longbreak: 15
      },
      ambientSound: "",
      autoStartBreaks: true
    },
    ui: {
      focusMode: false
    },
    timer: {
      session: "focus",
      remainingSeconds: 25 * 60,
      cycleCount: 0,
      activeTaskId: ""
    },
    stats: {
      focusSessionsByDate: {}
    },
    days: {}
  };
}

function mergeState(defaultState, incomingState = {}) {
  return {
    ...defaultState,
    ...incomingState,
    settings: {
      ...defaultState.settings,
      ...(incomingState.settings || {}),
      durations: {
        ...defaultState.settings.durations,
        ...((incomingState.settings && incomingState.settings.durations) || {})
      }
    },
    ui: {
      ...defaultState.ui,
      ...(incomingState.ui || {})
    },
    timer: {
      ...defaultState.timer,
      ...(incomingState.timer || {})
    },
    stats: {
      ...defaultState.stats,
      ...(incomingState.stats || {})
    },
    days: incomingState.days || {}
  };
}

function loadAppState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createDefaultAppState();
    return mergeState(createDefaultAppState(), JSON.parse(raw));
  } catch (error) {
    console.error("Failed to load app state", error);
    return createDefaultAppState();
  }
}

function saveAppState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.app));
}

function createEmptyDay() {
  return {
    intention: "",
    journal: "",
    tasks: []
  };
}

function normalizeTask(task) {
  return {
    id: task.id || `task-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
    title: task.title || "",
    completed: Boolean(task.completed),
    skipFocus: Boolean(task.skipFocus),
    focusSessions: Number(task.focusSessions || 0),
    completedWithoutFocus: Boolean(task.completedWithoutFocus),
    createdAt: task.createdAt || new Date().toISOString(),
    completedAt: task.completedAt || null
  };
}

function getDayState(date = state.selectedDate) {
  if (!state.app.days[date]) {
    state.app.days[date] = createEmptyDay();
  }

  state.app.days[date].tasks = (state.app.days[date].tasks || []).map(normalizeTask);
  return state.app.days[date];
}

function getSelectedDay() {
  return getDayState(state.selectedDate);
}

function clampDuration(value) {
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed)) return 0;
  return Math.max(0, Math.min(60, parsed));
}

function getDurationsInSeconds() {
  return {
    focus: clampDuration(elements.focusDuration.value) * 60,
    break: clampDuration(elements.breakDuration.value) * 60,
    longbreak: clampDuration(elements.longBreakDuration.value) * 60
  };
}

function updateSettingsFromInputs() {
  state.app.settings.durations.focus = clampDuration(elements.focusDuration.value);
  state.app.settings.durations.break = clampDuration(elements.breakDuration.value);
  state.app.settings.durations.longbreak = clampDuration(elements.longBreakDuration.value);
  state.app.settings.ambientSound = elements.ambientSelect.value;
  state.app.settings.autoStartBreaks = elements.autoStartBreaks.checked;
  saveAppState();
}

function formatTime(totalSeconds) {
  const safeSeconds = Math.max(0, totalSeconds);
  const minutes = String(Math.floor(safeSeconds / 60)).padStart(2, "0");
  const seconds = String(safeSeconds % 60).padStart(2, "0");
  return `${minutes}:${seconds}`;
}

function createTask(title, { skipFocus = false } = {}) {
  const task = normalizeTask({
    title,
    skipFocus,
    completed: skipFocus,
    completedWithoutFocus: skipFocus,
    completedAt: skipFocus ? new Date().toISOString() : null
  });

  return task;
}

function getActiveTask() {
  return getSelectedDay().tasks.find(task => task.id === state.app.timer.activeTaskId) || null;
}

function getTaskById(taskId) {
  return getSelectedDay().tasks.find(task => task.id === taskId) || null;
}

function setActiveTask(taskId) {
  state.app.timer.activeTaskId = taskId;
  saveAppState();
  render();
}

function setSession(sessionName, { resetClock = true } = {}) {
  state.app.timer.session = sessionName;

  if (resetClock) {
    const durations = getDurationsInSeconds();
    state.app.timer.remainingSeconds = durations[sessionName];
  }

  saveAppState();
  renderTimer();
}

function ensureAudioElement(soundName) {
  if (!soundName || !AMBIENT_FILES[soundName]) return null;
  if (!state.audioCache[soundName]) {
    const audio = new Audio(AMBIENT_FILES[soundName]);
    audio.preload = "auto";
    audio.loop = true;
    audio.volume = 0.35;
    state.audioCache[soundName] = audio;
  }
  return state.audioCache[soundName];
}

function stopSound() {
  if (!state.activeAudio) return;
  state.activeAudio.pause();
  state.activeAudio.currentTime = 0;
  state.activeAudio = null;
}

function playAmbientSound({ preview = false } = {}) {
  const soundName = state.app.settings.ambientSound;
  const audio = ensureAudioElement(soundName);

  stopSound();

  if (!audio) return;
  audio.loop = !preview;
  audio.currentTime = 0;
  state.activeAudio = audio;

  audio.play().catch(error => {
    console.error("Audio playback blocked", error);
    elements.sessionMessage.textContent = "Audio playback was blocked by the browser. Try pressing preview again.";
  });

  if (preview) {
    window.setTimeout(() => {
      if (state.activeAudio === audio && !state.isRunning) {
        stopSound();
      }
    }, 8000);
  }
}

function resumeLoopingAudioIfNeeded() {
  if (!state.isRunning) return;
  if (!state.app.settings.ambientSound) return;
  playAmbientSound({ preview: false });
}

function playNotification() {
  const audio = new Audio(NOTIFICATION_SOUND);
  audio.preload = "auto";
  audio.currentTime = 0;
  audio.play().catch(() => {});
}

function startTimer() {
  if (state.isRunning) return;

  if (state.app.timer.session === "focus" && !state.app.timer.activeTaskId) {
    elements.sessionMessage.textContent = "Choose a task before starting a focus block.";
    return;
  }

  if (state.app.timer.remainingSeconds <= 0) {
    completeCurrentSession();
    return;
  }

  state.isRunning = true;
  state.intervalId = window.setInterval(tickTimer, 1000);
  resumeLoopingAudioIfNeeded();
  renderTimer();
}

function pauseTimer() {
  if (state.intervalId) {
    window.clearInterval(state.intervalId);
    state.intervalId = null;
  }

  state.isRunning = false;
  stopSound();
  renderTimer();
}

function resetTimer() {
  pauseTimer();
  setSession("focus");
}

function skipSession() {
  pauseTimer();
  completeCurrentSession();
}

function tickTimer() {
  if (state.app.timer.remainingSeconds <= 1) {
    state.app.timer.remainingSeconds = 0;
    saveAppState();
    completeCurrentSession();
    return;
  }

  state.app.timer.remainingSeconds -= 1;
  saveAppState();
  renderTimer();
}

function getNextSession(currentSession) {
  if (currentSession === "focus") {
    const nextCycleCount = state.app.timer.cycleCount + 1;
    return nextCycleCount % 4 === 0 ? "longbreak" : "break";
  }

  return "focus";
}

function markTaskCompleted(task, { withFocus = false } = {}) {
  if (!task || task.completed) return;
  task.completed = true;
  task.completedWithoutFocus = !withFocus;
  task.completedAt = new Date().toISOString();
}

function recordCompletedFocusSession() {
  const date = state.selectedDate;
  const activeTask = getActiveTask();

  state.app.timer.cycleCount += 1;
  state.app.stats.focusSessionsByDate[date] = (state.app.stats.focusSessionsByDate[date] || 0) + 1;

  if (activeTask) {
    activeTask.focusSessions += 1;
    markTaskCompleted(activeTask, { withFocus: true });
  }

  saveAppState();
  render();
}

function completeCurrentSession() {
  pauseTimer();
  const finishedSession = state.app.timer.session;

  if (finishedSession === "focus") {
    recordCompletedFocusSession();
  }

  const nextSession = getNextSession(finishedSession);
  setSession(nextSession);
  playNotification();

  const shouldAutoStart = nextSession !== "focus" && state.app.settings.autoStartBreaks;
  if (shouldAutoStart && state.app.timer.remainingSeconds > 0) {
    startTimer();
  }
}

function getActivityScore(date) {
  const day = getDayState(date);
  const completedTasks = day.tasks.filter(task => task.completed).length;
  const focusSessions = state.app.stats.focusSessionsByDate[date] || 0;
  const journalScore = day.journal.trim() ? 1 : 0;
  return completedTasks + focusSessions + journalScore;
}

function getActivityLevel(score) {
  if (score <= 0) return 0;
  if (score === 1) return 1;
  if (score <= 3) return 2;
  if (score <= 5) return 3;
  return 4;
}

function getDatesForHeatmap(totalDays) {
  const dates = [];
  for (let offset = totalDays - 1; offset >= 0; offset -= 1) {
    const date = new Date();
    date.setDate(date.getDate() - offset);
    dates.push(date.toISOString().split("T")[0]);
  }
  return dates;
}

function getActiveStreak() {
  let streak = 0;
  const cursor = new Date(getToday());

  while (true) {
    const date = cursor.toISOString().split("T")[0];
    if (getActivityScore(date) <= 0) break;
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}

function getFocusStreak() {
  let streak = 0;
  const cursor = new Date(getToday());

  while (true) {
    const date = cursor.toISOString().split("T")[0];
    if ((state.app.stats.focusSessionsByDate[date] || 0) <= 0) break;
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}

function createTaskItem(task, { completedSection = false } = {}) {
  const item = document.createElement("li");
  item.className = `task-item${task.completed ? " is-done" : ""}`;

  const copy = document.createElement("div");
  copy.className = "task-copy";

  const titleRow = document.createElement("div");
  titleRow.className = "task-title-row";

  const title = document.createElement("span");
  title.className = "task-title";
  title.textContent = task.title;

  titleRow.appendChild(title);

  if (task.skipFocus) {
    const badge = document.createElement("span");
    badge.className = "task-badge";
    badge.textContent = "No focus";
    titleRow.appendChild(badge);
  }

  if (task.completedWithoutFocus && task.completed) {
    const badge = document.createElement("span");
    badge.className = "task-badge";
    badge.textContent = "Quick win";
    titleRow.appendChild(badge);
  }

  const meta = document.createElement("span");
  meta.className = "task-meta";

  if (task.completed && task.completedWithoutFocus) {
    meta.textContent = "Completed without focus session.";
  } else if (task.completed) {
    meta.textContent = `${task.focusSessions} focus session${task.focusSessions === 1 ? "" : "s"} completed.`;
  } else {
    meta.textContent = task.skipFocus
      ? "Can be completed directly."
      : `${task.focusSessions} focus session${task.focusSessions === 1 ? "" : "s"} logged.`;
  }

  copy.append(titleRow, meta);
  item.appendChild(copy);

  const actions = document.createElement("div");
  actions.className = "task-actions";

  if (completedSection) {
    const reopenButton = document.createElement("button");
    reopenButton.type = "button";
    reopenButton.className = "ghost-button";
    reopenButton.textContent = "Reopen";
    reopenButton.addEventListener("click", () => {
      task.completed = false;
      task.completedWithoutFocus = false;
      task.completedAt = null;
      saveAppState();
      render();
    });
    actions.appendChild(reopenButton);
  } else {
    const focusButton = document.createElement("button");
    focusButton.type = "button";
    focusButton.className = "ghost-button";
    focusButton.textContent = state.app.timer.activeTaskId === task.id ? "Selected" : "Focus";
    focusButton.disabled = task.skipFocus;
    focusButton.addEventListener("click", () => setActiveTask(task.id));

    const doneButton = document.createElement("button");
    doneButton.type = "button";
    doneButton.className = "ghost-button";
    doneButton.textContent = "Done";
    doneButton.addEventListener("click", () => {
      markTaskCompleted(task, { withFocus: false });
      if (state.app.timer.activeTaskId === task.id) {
        state.app.timer.activeTaskId = "";
      }
      saveAppState();
      render();
    });

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "ghost-button";
    deleteButton.textContent = "Delete";
    deleteButton.addEventListener("click", () => {
      const day = getSelectedDay();
      day.tasks = day.tasks.filter(entry => entry.id !== task.id);
      if (state.app.timer.activeTaskId === task.id) {
        state.app.timer.activeTaskId = "";
      }
      saveAppState();
      render();
    });

    actions.append(focusButton, doneButton, deleteButton);
  }

  item.appendChild(actions);
  return item;
}

function renderTaskLists() {
  const day = getSelectedDay();
  const activeTasks = day.tasks.filter(task => !task.completed);
  const completedTasks = day.tasks.filter(task => task.completed);

  elements.taskList.innerHTML = "";
  elements.completedTaskList.innerHTML = "";
  elements.activeTaskCount.textContent = String(activeTasks.length);
  elements.completedTaskCount.textContent = String(completedTasks.length);

  if (activeTasks.length === 0) {
    const empty = document.createElement("li");
    empty.className = "task-item";
    empty.innerHTML = '<div class="task-copy"><div class="task-title-row"><span class="task-title">No active tasks</span></div><span class="task-meta">Add a task or capture a quick win.</span></div>';
    elements.taskList.appendChild(empty);
  } else {
    activeTasks.forEach(task => {
      elements.taskList.appendChild(createTaskItem(task));
    });
  }

  if (completedTasks.length === 0) {
    const empty = document.createElement("li");
    empty.className = "task-item is-done";
    empty.innerHTML = '<div class="task-copy"><div class="task-title-row"><span class="task-title">Nothing completed yet</span></div><span class="task-meta">Completed tasks will collect here.</span></div>';
    elements.completedTaskList.appendChild(empty);
  } else {
    completedTasks
      .sort((left, right) => new Date(right.completedAt || 0) - new Date(left.completedAt || 0))
      .forEach(task => {
        elements.completedTaskList.appendChild(createTaskItem(task, { completedSection: true }));
      });
  }
}

function renderTaskSelect() {
  const tasks = getSelectedDay().tasks.filter(task => !task.completed && !task.skipFocus);
  elements.taskSelect.innerHTML = '<option value="">Choose a task to focus on</option>';

  tasks.forEach(task => {
    const option = document.createElement("option");
    option.value = task.id;
    option.textContent = task.title;
    option.selected = task.id === state.app.timer.activeTaskId;
    elements.taskSelect.appendChild(option);
  });
}

function renderHeader() {
  const day = getSelectedDay();
  const completedCount = day.tasks.filter(task => task.completed).length;
  const focusCount = state.app.stats.focusSessionsByDate[state.selectedDate] || 0;
  const hasJournal = day.journal.trim().length > 0;
  const activeStreak = getActiveStreak();

  elements.metricCompleted.textContent = `${completedCount} / ${day.tasks.length}`;
  elements.metricPomodoros.textContent = String(focusCount);
  elements.metricJournal.textContent = hasJournal ? "Saved" : "Not started";
  elements.metricStreak.textContent = `${activeStreak} day${activeStreak === 1 ? "" : "s"}`;

  if (day.tasks.length === 0) {
    elements.workflowTitle.textContent = "Shape today with a clear plan";
    elements.workflowMessage.textContent = "Capture your intention, choose what matters, and then either focus deeply or close quick wins instantly.";
    return;
  }

  if (completedCount < day.tasks.length) {
    elements.workflowTitle.textContent = "Move from planning into execution";
    elements.workflowMessage.textContent = "Select one meaningful task for deep work, and finish fast tasks directly when focus is unnecessary.";
    return;
  }

  elements.workflowTitle.textContent = "Close the loop with reflection";
  elements.workflowMessage.textContent = hasJournal
    ? "Today is fully captured. Review the pattern and keep the streak alive tomorrow."
    : "Your tasks are done. Write a short reflection before the day fades.";
}

function renderHeatmap() {
  const dates = getDatesForHeatmap(HEATMAP_DAYS);
  elements.heatmapGrid.innerHTML = "";

  dates.forEach(date => {
    const score = getActivityScore(date);
    const level = getActivityLevel(score);
    const cell = document.createElement("div");
    cell.className = "heatmap-cell";
    cell.dataset.level = String(level);
    cell.title = `${date}: ${score} activity point${score === 1 ? "" : "s"}`;
    elements.heatmapGrid.appendChild(cell);
  });
}

function renderTimer() {
  const session = state.app.timer.session;
  const activeTask = getActiveTask();
  const labels = {
    focus: "Focus session",
    break: "Short break",
    longbreak: "Long break"
  };

  const descriptions = {
    focus: activeTask
      ? `Working on: ${activeTask.title}`
      : "Pick a task and start a focus block.",
    break: "Reset briefly before the next session.",
    longbreak: "Step away and recover before diving back in."
  };

  elements.timerStage.dataset.session = session;
  elements.sessionLabel.textContent = labels[session];
  elements.sessionMessage.textContent = descriptions[session];
  elements.pomodoroDisplay.textContent = formatTime(state.app.timer.remainingSeconds);
  elements.startButton.disabled = state.isRunning;
  elements.pauseButton.disabled = !state.isRunning;
}

function renderFocusStats() {
  const focusCount = state.app.stats.focusSessionsByDate[state.selectedDate] || 0;
  const streak = getFocusStreak();
  elements.pomodoroCount.textContent = `${focusCount} session${focusCount === 1 ? "" : "s"}`;
  elements.pomodoroStreak.textContent = `${streak} day${streak === 1 ? "" : "s"}`;
}

function renderJournal() {
  const hasJournal = getSelectedDay().journal.trim().length > 0;
  elements.journalStatus.textContent = hasJournal ? "Reflection saved for this day." : "Reflection not saved yet.";
}

function renderInsights() {
  const day = getSelectedDay();
  const completedCount = day.tasks.filter(task => task.completed).length;
  const quickWins = day.tasks.filter(task => task.completedWithoutFocus).length;
  const focusCount = state.app.stats.focusSessionsByDate[state.selectedDate] || 0;
  const intention = day.intention.trim();
  const activeTask = getActiveTask();

  const insights = [
    `${completedCount} of ${day.tasks.length} tasks are complete.`,
    `${focusCount} focus session${focusCount === 1 ? "" : "s"} completed today.`,
    `${quickWins} task${quickWins === 1 ? "" : "s"} closed without focus.`,
    activeTask ? `Current focus target: ${activeTask.title}.` : "No deep-work task is selected right now.",
    intention ? `Daily intention: ${intention}` : "Set a daily intention so planning and reflection connect."
  ];

  elements.insightList.innerHTML = "";
  insights.forEach(text => {
    const item = document.createElement("li");
    item.textContent = text;
    elements.insightList.appendChild(item);
  });
}

function renderFocusMode() {
  document.body.classList.toggle("focus-mode", state.app.ui.focusMode);
  elements.focusModeToggle.textContent = state.app.ui.focusMode ? "Exit Focus Mode" : "Enter Focus Mode";
}

function render() {
  const day = getSelectedDay();

  elements.datePicker.value = state.selectedDate;
  elements.intention.value = day.intention;
  elements.journalEntry.value = day.journal;
  elements.focusDuration.value = state.app.settings.durations.focus;
  elements.breakDuration.value = state.app.settings.durations.break;
  elements.longBreakDuration.value = state.app.settings.durations.longbreak;
  elements.ambientSelect.value = state.app.settings.ambientSound;
  elements.autoStartBreaks.checked = state.app.settings.autoStartBreaks;

  renderHeader();
  renderHeatmap();
  renderTaskLists();
  renderTaskSelect();
  renderTimer();
  renderFocusStats();
  renderJournal();
  renderInsights();
  renderFocusMode();
}

function addTask() {
  const title = elements.taskInput.value.trim();
  if (!title) return;

  const skipFocus = elements.skipFocusOnAdd.checked;
  const day = getSelectedDay();
  const task = createTask(title, { skipFocus });
  day.tasks.push(task);
  elements.taskInput.value = "";
  elements.skipFocusOnAdd.checked = false;

  if (!skipFocus && !state.app.timer.activeTaskId) {
    state.app.timer.activeTaskId = task.id;
  }

  saveAppState();
  render();
}

function handleDateChange() {
  state.selectedDate = elements.datePicker.value || getToday();
  getDayState(state.selectedDate);

  if (!getTaskById(state.app.timer.activeTaskId)) {
    state.app.timer.activeTaskId = "";
  }

  saveAppState();
  render();
}

function handleVisibilityChange() {
  if (!state.app.ui.focusMode || !state.isRunning) return;
  if (document.hidden) {
    pauseTimer();
    elements.sessionMessage.textContent = "Timer paused because focus mode was interrupted by leaving the tab.";
  }
}

function bindEvents() {
  elements.addTaskButton.addEventListener("click", addTask);
  elements.taskInput.addEventListener("keydown", event => {
    if (event.key === "Enter") {
      event.preventDefault();
      addTask();
    }
  });

  elements.datePicker.addEventListener("change", handleDateChange);

  elements.intention.addEventListener("input", () => {
    getSelectedDay().intention = elements.intention.value;
    saveAppState();
    renderHeader();
    renderInsights();
    renderHeatmap();
  });

  elements.taskSelect.addEventListener("change", () => setActiveTask(elements.taskSelect.value));
  elements.startButton.addEventListener("click", startTimer);
  elements.pauseButton.addEventListener("click", pauseTimer);
  elements.resetButton.addEventListener("click", resetTimer);
  elements.skipButton.addEventListener("click", skipSession);

  [elements.focusDuration, elements.breakDuration, elements.longBreakDuration].forEach(input => {
    input.addEventListener("change", () => {
      updateSettingsFromInputs();
      setSession(state.app.timer.session);
    });
  });

  elements.ambientSelect.addEventListener("change", () => {
    updateSettingsFromInputs();
    if (state.isRunning) {
      resumeLoopingAudioIfNeeded();
    }
  });

  elements.previewSound.addEventListener("click", () => {
    updateSettingsFromInputs();
    playAmbientSound({ preview: true });
  });

  elements.stopSound.addEventListener("click", stopSound);
  elements.autoStartBreaks.addEventListener("change", updateSettingsFromInputs);

  elements.saveJournal.addEventListener("click", () => {
    getSelectedDay().journal = elements.journalEntry.value;
    saveAppState();
    renderJournal();
    renderHeader();
    renderHeatmap();
    renderInsights();
  });

  elements.focusModeToggle.addEventListener("click", () => {
    state.app.ui.focusMode = !state.app.ui.focusMode;
    saveAppState();
    renderFocusMode();
  });

  document.addEventListener("visibilitychange", handleVisibilityChange);
}

function initialize() {
  getDayState(state.selectedDate);
  bindEvents();
  setSession(state.app.timer.session, { resetClock: false });
  render();
}

initialize();
