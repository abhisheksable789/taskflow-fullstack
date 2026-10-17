const assert = require("node:assert/strict");
const { once } = require("node:events");
const test = require("node:test");
const { app, pool } = require("../server");

test("health and task CRUD routes persist data in MySQL", async () => {
  const server = app.listen(0, "127.0.0.1");
  await once(server, "listening");
  const address = server.address();
  const baseUrl = `http://127.0.0.1:${address.port}`;
  let taskId;

  try {
    const root = await fetch(baseUrl);
    assert.equal(root.status, 200);
    assert.match(await root.text(), /TaskFlow API/);

    const health = await fetch(`${baseUrl}/api/health`);
    assert.equal(health.status, 200);
    assert.equal((await health.json()).database, true);

    const invalidCreate = await fetch(`${baseUrl}/api/tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    assert.equal(invalidCreate.status, 400);

    const invalidDate = await fetch(`${baseUrl}/api/tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: "Invalid date",
        project: "Automated test",
        priority: "High",
        status: "To Do",
        due_date: "2026-02-31",
      }),
    });
    assert.equal(invalidDate.status, 400);

    const create = await fetch(`${baseUrl}/api/tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: `Integration test ${Date.now()}`,
        project: "Automated test",
        priority: "High",
        status: "To Do",
        due_date: "2026-12-31",
      }),
    });
    assert.equal(create.status, 201);
    const created = await create.json();
    taskId = created.id;

    const listAfterCreate = await fetch(`${baseUrl}/api/tasks`);
    assert.equal(listAfterCreate.status, 200);
    assert.ok((await listAfterCreate.json()).some((task) => task.id === taskId));

    const update = await fetch(`${baseUrl}/api/tasks/${taskId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...created, status: "Done" }),
    });
    assert.equal(update.status, 200);

    const listAfterUpdate = await fetch(`${baseUrl}/api/tasks`);
    const updatedTasks = await listAfterUpdate.json();
    assert.equal(
      updatedTasks.find((task) => task.id === taskId)?.status,
      "Done"
    );

    const deletedId = taskId;
    const remove = await fetch(`${baseUrl}/api/tasks/${taskId}`, {
      method: "DELETE",
    });
    assert.equal(remove.status, 200);
    taskId = undefined;

    const missing = await fetch(`${baseUrl}/api/tasks/${deletedId}`, {
      method: "DELETE",
    });
    assert.equal(missing.status, 404);

    const missingUpdate = await fetch(`${baseUrl}/api/tasks/${deletedId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...created, status: "Done" }),
    });
    assert.equal(missingUpdate.status, 404);
  } finally {
    if (taskId !== undefined) {
      await pool.query("DELETE FROM tasks WHERE id = ?", [taskId]);
    }
    await new Promise((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
    await pool.end();
  }
});