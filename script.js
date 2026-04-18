const STORAGE_KEY = "personalJournalState";
const NOTIFICATION_SOUND = "sounds/wind.mp3";

const elements = {
  datePicker: document.getElementById("date-picker"),
  focusModeToggle: document.getElementById("focus-mode-toggle"),
  workflowTitle: document.getElementById("workflow-title"),
  workflowMessage: document.getElementById("workflow-message"),
  metricCompleted: document.getElementById("metric-completed"),
  metricPomodoros: document.getElementById("metric-pomodoros"),
  metricJournal: document.getElementById("metric-journal"),
  intention: document.getElementById("day-intention"),
  taskInput: document.getElementById("new-task"),
  addTaskButton: document.getElementById("add-task"),
  taskList: document.getElementById("task-list"),
  taskSelect: document.getElementById("task-select"),
  sessionLabel: document.getElementById("session-label"),
  sessionMessage: document.getElementById("session-message"),
  timerStage: document.getElementById("timer-stage"),
  pomodoroDisplay: document.getElementById("pomodoro-display"),
  startButton: document.getElementById("start-pomodoro"),
  pauseButton: document.getElementById("pause-pomodoro"),
  resetButton: document.getElementById("reset-pomodoro"),
  skipButton: document.getElementById("skip-session"),
  focusDuration: document.getElementById("focus-duration"),
  breakDuration: document.getElementById("break-duration"),
  longBreakDuration: document.getElementById("longbreak-duration"),
  ambientSelect: document.getElementById("ambient-select"),
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
  audio: null,
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

function loadAppState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createDefaultAppState();
    const parsed = JSON.parse(raw);
    return mergeState(createDefaultAppState(), parsed);
  } catch (error) {
    console.error("Failed to load app state", error);
    return createDefaultAppState();
  }
}

function mergeState(defaultState, incomingState) {
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

function saveAppState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.app));
}

function getDayState(date = state.selectedDate) {
  if (!state.app.days[date]) {
    state.app.days[date] = {
      intention: "",
      journal: "",
      tasks: []
    };
  }

  return state.app.days[date];
}

function getSelectedDay() {
  return getDayState(state.selectedDate);
}

function getDurationsInSeconds() {
  return {
    focus: clampDuration(elements.focusDuration.value, 5, 90) * 60,
    break: clampDuration(elements.breakDuration.value, 1, 30) * 60,
    longbreak: clampDuration(elements.longBreakDuration.value, 5, 60) * 60
  };
}

function clampDuration(value, min, max) {
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed)) return min;
  return Math.max(min, Math.min(max, parsed));
}

function updateSettingsFromInputs() {
  state.app.settings.durations.focus = clampDuration(elements.focusDuration.value, 5, 90);
  state.app.settings.durations.break = clampDuration(elements.breakDuration.value, 1, 30);
  state.app.settings.durations.longbreak = clampDuration(elements.longBreakDuration.value, 5, 60);
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

function createTask(title) {
  return {
    id: `task-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
    title,
    completed: false,
    focusSessions: 0,
    createdAt: new Date().toISOString()
  };
}

function getActiveTask() {
  const tasks = getSelectedDay().tasks;
  return tasks.find(task => task.id === state.app.timer.activeTaskId) || null;
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

function startTimer() {
  if (state.isRunning) return;

  if (state.app.timer.session === "focus" && !state.app.timer.activeTaskId) {
    elements.sessionMessage.textContent = "Choose a task before starting a focus block.";
    return;
  }

  state.isRunning = true;
  state.intervalId = window.setInterval(tickTimer, 1000);
  playAmbientSound();
  renderTimer();
}

function pauseTimer() {
  if (state.intervalId) {
    window.clearInterval(state.intervalId);
    state.intervalId = null;
  }

  state.isRunning = false;
  stopAmbientSound();
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
  if (state.app.timer.remainingSeconds <= 0) {
    completeCurrentSession();
    return;
  }

  state.app.timer.remainingSeconds -= 1;
  saveAppState();
  renderTimer();
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
  if (shouldAutoStart) {
    startTimer();
  }
}

function getNextSession(currentSession) {
  if (currentSession === "focus") {
    const nextCycleCount = state.app.timer.cycleCount + 1;
    return nextCycleCount % 4 === 0 ? "longbreak" : "break";
  }

  return "focus";
}

function recordCompletedFocusSession() {
  const date = state.selectedDate;
  const activeTask = getActiveTask();

  state.app.timer.cycleCount += 1;

  if (!state.app.stats.focusSessionsByDate[date]) {
    state.app.stats.focusSessionsByDate[date] = 0;
  }

  state.app.stats.focusSessionsByDate[date] += 1;

  if (activeTask) {
    activeTask.focusSessions += 1;
  }

  saveAppState();
  render();
}

function getFocusStreak() {
  let streak = 0;
  let cursor = new Date(getToday());

  while (true) {
    const date = cursor.toISOString().split("T")[0];
    const count = state.app.stats.focusSessionsByDate[date] || 0;
    if (count <= 0) break;
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}

function playNotification() {
  const notificationAudio = new Audio(NOTIFICATION_SOUND);
  notificationAudio.currentTime = 0;
  notificationAudio.play().catch(() => {});
}

function playAmbientSound() {
  stopAmbientSound();
  const ambient = state.app.settings.ambientSound;
  if (!ambient || !state.isRunning) return;

  state.audio = new Audio(`sounds/${ambient}.mp3`);
  state.audio.loop = true;
  state.audio.volume = 0.35;
  state.audio.play().catch(() => {});
}

function stopAmbientSound() {
  if (!state.audio) return;
  state.audio.pause();
  state.audio.currentTime = 0;
  state.audio = null;
}

function renderTaskList() {
  const day = getSelectedDay();
  elements.taskList.innerHTML = "";

  if (day.tasks.length === 0) {
    const empty = document.createElement("li");
    empty.className = "task-item";
    empty.innerHTML = '<div class="task-copy"><span class="task-title">No tasks yet</span><span class="task-meta">Add 1 to 3 meaningful tasks for the day.</span></div>';
    elements.taskList.appendChild(empty);
    return;
  }

  day.tasks.forEach(task => {
    const item = document.createElement("li");
    item.className = `task-item${task.completed ? " is-done" : ""}`;

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = task.completed;
    checkbox.addEventListener("change", () => {
      task.completed = checkbox.checked;
      saveAppState();
      render();
    });

    const copy = document.createElement("div");
    copy.className = "task-copy";

    const title = document.createElement("span");
    title.className = "task-title";
    title.textContent = task.title;

    const meta = document.createElement("span");
    meta.className = "task-meta";
    meta.textContent = `${task.focusSessions} focus session${task.focusSessions === 1 ? "" : "s"}`;

    copy.append(title, meta);

    const focusButton = document.createElement("button");
    focusButton.type = "button";
    focusButton.className = "ghost-button";
    focusButton.textContent = state.app.timer.activeTaskId === task.id ? "Selected" : "Focus";
    focusButton.addEventListener("click", () => setActiveTask(task.id));

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "ghost-button";
    deleteButton.textContent = "Delete";
    deleteButton.addEventListener("click", () => {
      const dayState = getSelectedDay();
      dayState.tasks = dayState.tasks.filter(entry => entry.id !== task.id);
      if (state.app.timer.activeTaskId === task.id) {
        state.app.timer.activeTaskId = "";
      }
      saveAppState();
      render();
    });

    item.append(checkbox, copy, focusButton, deleteButton);
    elements.taskList.appendChild(item);
  });
}

function renderTaskSelect() {
  const day = getSelectedDay();
  const selectedTaskId = state.app.timer.activeTaskId;
  elements.taskSelect.innerHTML = '<option value="">Choose a task to focus on</option>';

  day.tasks
    .filter(task => !task.completed)
    .forEach(task => {
      const option = document.createElement("option");
      option.value = task.id;
      option.textContent = task.title;
      option.selected = task.id === selectedTaskId;
      elements.taskSelect.appendChild(option);
    });
}

function renderHeader() {
  const day = getSelectedDay();
  const completedCount = day.tasks.filter(task => task.completed).length;
  const focusCount = state.app.stats.focusSessionsByDate[state.selectedDate] || 0;
  const hasJournal = day.journal.trim().length > 0;

  elements.metricCompleted.textContent = `${completedCount} / ${day.tasks.length}`;
  elements.metricPomodoros.textContent = String(focusCount);
  elements.metricJournal.textContent = hasJournal ? "Saved" : "Not started";

  if (day.tasks.length === 0) {
    elements.workflowTitle.textContent = "Build momentum for today";
    elements.workflowMessage.textContent = "Start by choosing a few meaningful tasks and a clear intention for the day.";
    return;
  }

  if (completedCount < day.tasks.length) {
    elements.workflowTitle.textContent = "Protect your attention";
    elements.workflowMessage.textContent = "Pick one unfinished task, start a timer, and finish the next right thing.";
    return;
  }

  elements.workflowTitle.textContent = "Close the loop";
  elements.workflowMessage.textContent = hasJournal
    ? "Your day is captured. Review the pattern and carry one lesson into tomorrow."
    : "Your task plan is complete. End the day with a short reflection while it is still fresh.";
}

function renderTimer() {
  const session = state.app.timer.session;
  const labels = {
    focus: "Focus session",
    break: "Short break",
    longbreak: "Long break"
  };

  const activeTask = getActiveTask();
  const sessionDescriptions = {
    focus: activeTask
      ? `Working on: ${activeTask.title}`
      : "Pick a task and start a focus block.",
    break: "Step away for a few minutes before the next round.",
    longbreak: "You earned a longer reset. Recover before the next cycle."
  };

  elements.timerStage.dataset.session = session;
  elements.sessionLabel.textContent = labels[session];
  elements.sessionMessage.textContent = sessionDescriptions[session];
  elements.pomodoroDisplay.textContent = formatTime(state.app.timer.remainingSeconds);
  elements.startButton.disabled = state.isRunning;
  elements.pauseButton.disabled = !state.isRunning;
}

function renderInsights() {
  const day = getSelectedDay();
  const completedCount = day.tasks.filter(task => task.completed).length;
  const totalTasks = day.tasks.length;
  const focusCount = state.app.stats.focusSessionsByDate[state.selectedDate] || 0;
  const activeTask = getActiveTask();

  const insights = [
    `${completedCount} of ${totalTasks} tasks completed today.`,
    `${focusCount} focus session${focusCount === 1 ? "" : "s"} completed.`,
    activeTask ? `Current focus target: ${activeTask.title}.` : "No active focus target selected yet.",
    day.intention.trim() ? `Today's intention: ${day.intention.trim()}` : "Set a daily intention to guide the rest of the app flow."
  ];

  elements.insightList.innerHTML = "";
  insights.forEach(line => {
    const item = document.createElement("li");
    item.textContent = line;
    elements.insightList.appendChild(item);
  });
}

function renderJournal() {
  const journal = getSelectedDay().journal.trim();
  elements.journalStatus.textContent = journal ? "Reflection saved for this day." : "Reflection not saved yet.";
}

function renderFocusStats() {
  const focusCount = state.app.stats.focusSessionsByDate[state.selectedDate] || 0;
  const streak = getFocusStreak();
  elements.pomodoroCount.textContent = `${focusCount} session${focusCount === 1 ? "" : "s"}`;
  elements.pomodoroStreak.textContent = `${streak} day${streak === 1 ? "" : "s"}`;
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
  renderTaskList();
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

  const day = getSelectedDay();
  day.tasks.push(createTask(title));
  elements.taskInput.value = "";

  if (!state.app.timer.activeTaskId) {
    state.app.timer.activeTaskId = day.tasks[day.tasks.length - 1].id;
  }

  saveAppState();
  render();
}

function handleDateChange() {
  state.selectedDate = elements.datePicker.value || getToday();
  getDayState(state.selectedDate);

  const availableTask = getSelectedDay().tasks.find(task => task.id === state.app.timer.activeTaskId);
  if (!availableTask) {
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
    playAmbientSound();
  });

  elements.autoStartBreaks.addEventListener("change", updateSettingsFromInputs);

  elements.saveJournal.addEventListener("click", () => {
    getSelectedDay().journal = elements.journalEntry.value;
    saveAppState();
    renderJournal();
    renderHeader();
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
