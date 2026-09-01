"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const app = require("../server.js");

// Start the app on an ephemeral port for each test run.
function startServer() {
  return new Promise((resolve) => {
    const server = app.listen(0, "127.0.0.1", () => resolve(server));
  });
}

async function withServer(fn) {
  const server = await startServer();
  const { port } = server.address();
  const base = `http://127.0.0.1:${port}`;
  try {
    await fn(base);
  } finally {
    server.close();
  }
}

test("health endpoint reports ok", async () => {
  await withServer(async (base) => {
    const res = await fetch(`${base}/api/health`);
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.status, "ok");
  });
});

test("tasks can be listed, created, toggled, and deleted", async () => {
  await withServer(async (base) => {
    let res = await fetch(`${base}/api/tasks`);
    assert.equal(res.status, 200);
    const initial = await res.json();
    assert.ok(Array.isArray(initial));

    res = await fetch(`${base}/api/tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "Write tests" }),
    });
    assert.equal(res.status, 201);
    const created = await res.json();
    assert.equal(created.title, "Write tests");
    assert.equal(created.done, false);

    res = await fetch(`${base}/api/tasks/${created.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ done: true }),
    });
    assert.equal(res.status, 200);
    const toggled = await res.json();
    assert.equal(toggled.done, true);

    res = await fetch(`${base}/api/tasks/${created.id}`, { method: "DELETE" });
    assert.equal(res.status, 200);
  });
});

test("creating a task without a title is rejected", async () => {
  await withServer(async (base) => {
    const res = await fetch(`${base}/api/tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "   " }),
    });
    assert.equal(res.status, 400);
  });
});
