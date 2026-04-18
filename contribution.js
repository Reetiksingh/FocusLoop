const heatmap = document.getElementById("heatmap");
const allTasks = JSON.parse(localStorage.getItem("allTasks")) || {};

function getToday() {
  return new Date().toISOString().split("T")[0];
}

function getPastNDates(n) {
  const dates = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const iso = d.toISOString().split("T")[0];
    dates.push(iso);
  }
  return dates;
}

function getStatusForDate(date) {
  const tasks = allTasks[date] || [];
  if (tasks.length === 0) return "none";

  // Assume all completed if marked by a prefix like "✔️ "
  const completed = tasks.filter(t => t.startsWith("✔️")).length;
  if (completed === tasks.length) return "full";
  if (completed > 0) return "partial";
  return "none";
}

function drawGrid() {
  const days = getPastNDates(30);
  days.forEach(date => {
    const box = document.createElement("div");
    const status = getStatusForDate(date);
    box.classList.add(status);
    box.title = `${date} - ${status}`;
    heatmap.appendChild(box);
  });
}

drawGrid();
