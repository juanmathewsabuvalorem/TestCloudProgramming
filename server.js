"use strict";

const path = require("path");
const express = require("express");

const app = express();
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || "0.0.0.0";

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// In-memory task store. Sufficient for a demo; resets on restart.
let nextId = 1;
const tasks = [];

function createTask(title) {
  const task = { id: nextId++, title, done: false, createdAt: new Date().toISOString() };
  tasks.push(task);
  return task;
}

// Seed a couple of tasks so the UI is not empty on first load.
createTask("Read the project README");
createTask("Explore the Cloud Agent environment");

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", uptime: process.uptime() });
});

app.get("/api/tasks", (_req, res) => {
  res.json(tasks);
});

app.post("/api/tasks", (req, res) => {
  const title = typeof req.body?.title === "string" ? req.body.title.trim() : "";
  if (!title) {
    return res.status(400).json({ error: "title is required" });
  }
  const task = createTask(title);
  res.status(201).json(task);
});

app.patch("/api/tasks/:id", (req, res) => {
  const id = Number(req.params.id);
  const task = tasks.find((t) => t.id === id);
  if (!task) {
    return res.status(404).json({ error: "task not found" });
  }
  if (typeof req.body?.done === "boolean") {
    task.done = req.body.done;
  }
  if (typeof req.body?.title === "string" && req.body.title.trim()) {
    task.title = req.body.title.trim();
  }
  res.json(task);
});

app.delete("/api/tasks/:id", (req, res) => {
  const id = Number(req.params.id);
  const index = tasks.findIndex((t) => t.id === id);
  if (index === -1) {
    return res.status(404).json({ error: "task not found" });
  }
  const [removed] = tasks.splice(index, 1);
  res.json(removed);
});

// Only listen when run directly, so the app can be imported by tests.
if (require.main === module) {
  app.listen(PORT, HOST, () => {
    console.log(`TestCloudProgramming server listening on http://${HOST}:${PORT}`);
  });
}

module.exports = app;
