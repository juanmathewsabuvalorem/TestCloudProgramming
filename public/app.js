const listEl = document.getElementById("task-list");
const emptyEl = document.getElementById("empty");
const formEl = document.getElementById("task-form");
const inputEl = document.getElementById("task-input");
const statusEl = document.getElementById("status");

function setStatus(text, kind) {
  statusEl.textContent = text;
  statusEl.className = `badge badge--${kind}`;
}

async function api(path, options) {
  const res = await fetch(path, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    throw new Error(`${res.status} ${res.statusText}`);
  }
  return res.status === 204 ? null : res.json();
}

function render(tasks) {
  listEl.innerHTML = "";
  emptyEl.hidden = tasks.length > 0;

  for (const task of tasks) {
    const li = document.createElement("li");
    li.className = `task${task.done ? " task--done" : ""}`;

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "task__checkbox";
    checkbox.checked = task.done;
    checkbox.addEventListener("change", () => toggleTask(task, checkbox.checked));

    const title = document.createElement("span");
    title.className = "task__title";
    title.textContent = task.title;

    const del = document.createElement("button");
    del.className = "task__delete";
    del.setAttribute("aria-label", `Delete ${task.title}`);
    del.textContent = "×";
    del.addEventListener("click", () => deleteTask(task));

    li.append(checkbox, title, del);
    listEl.appendChild(li);
  }
}

async function loadTasks() {
  try {
    const tasks = await api("/api/tasks");
    render(tasks);
    setStatus("connected", "ok");
  } catch (err) {
    setStatus("offline", "error");
    console.error(err);
  }
}

async function addTask(title) {
  await api("/api/tasks", { method: "POST", body: JSON.stringify({ title }) });
  await loadTasks();
}

async function toggleTask(task, done) {
  await api(`/api/tasks/${task.id}`, { method: "PATCH", body: JSON.stringify({ done }) });
  await loadTasks();
}

async function deleteTask(task) {
  await api(`/api/tasks/${task.id}`, { method: "DELETE" });
  await loadTasks();
}

formEl.addEventListener("submit", async (event) => {
  event.preventDefault();
  const title = inputEl.value.trim();
  if (!title) return;
  inputEl.value = "";
  await addTask(title);
  inputEl.focus();
});

loadTasks();
