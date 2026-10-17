
const express = require("express");
const router = express.Router();
const pool = require("./db");
const priorities = ["Low", "Medium", "High"];
const statuses = ["To Do", "In Progress", "Done"];

function validateTask(body, { applyDefaults = false } = {}) {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return { error: "A task object is required" };
  }

  const title = typeof body.title === "string" ? body.title.trim() : "";
  const project = typeof body.project === "string" ? body.project.trim() : "";
  const due_date = body.due_date;
  const priority = body.priority ?? (applyDefaults ? "Medium" : undefined);
  const status = body.status ?? (applyDefaults ? "To Do" : undefined);

  if (!title || !project || !due_date) {
    return { error: "Title, project, and due date are required" };
  }
  if (title.length > 150 || project.length > 100) {
    return { error: "Title or project name is too long" };
  }
  if (!priorities.includes(priority)) {
    return { error: "Priority must be Low, Medium, or High" };
  }
  if (!statuses.includes(status)) {
    return { error: "Status must be To Do, In Progress, or Done" };
  }
  if (
    typeof due_date !== "string" ||
    !/^\d{4}-\d{2}-\d{2}$/.test(due_date) ||
    Number.isNaN(Date.parse(`${due_date}T00:00:00.000Z`)) ||
    new Date(`${due_date}T00:00:00.000Z`).toISOString().slice(0, 10) !== due_date
  ) {
    return { error: "Due date must be a valid YYYY-MM-DD date" };
  }

  return {
    task: { title, project, priority, status, due_date },
    error: null,
  };
}

function parseTaskId(value) {
  const id = Number(value);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
}

// Get all tasks
router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM tasks ORDER BY created_at DESC"
    );
    res.json(rows);
  } catch (error) {
    console.error("Fetch tasks error:", error.message);
    res.status(500).json({ message: "Failed to fetch tasks" });
  }
});

// Create a task
router.post("/", async (req, res) => {
  try {
    const { task, error } = validateTask(req.body, { applyDefaults: true });
    if (error) {
      return res.status(400).json({ message: error });
    }

    const [result] = await pool.query(
      `INSERT INTO tasks (title, project, priority, status, due_date)
       VALUES (?, ?, ?, ?, ?)`,
      [task.title, task.project, task.priority, task.status, task.due_date]
    );

    res.status(201).json({
      id: result.insertId,
      ...task,
    });
  } catch (error) {
    console.error("Create task error:", error.message);
    res.status(500).json({ message: "Failed to create task" });
  }
});

// Update a task
router.put("/:id", async (req, res) => {
  try {
    const id = parseTaskId(req.params.id);
    if (id === null) {
      return res.status(400).json({ message: "Task id must be a positive integer" });
    }

    const { task, error } = validateTask(req.body);
    if (error) {
      return res.status(400).json({ message: error });
    }

    const [result] = await pool.query(
      `UPDATE tasks
       SET title = ?, project = ?, priority = ?, status = ?, due_date = ?
       WHERE id = ?`,
      [task.title, task.project, task.priority, task.status, task.due_date, id]
    );

    if (result.affectedRows === 0) {
      const [rows] = await pool.query("SELECT id FROM tasks WHERE id = ?", [id]);
      if (rows.length === 0) {
        return res.status(404).json({ message: "Task not found" });
      }
    }

    res.json({ message: "Task updated successfully" });
  } catch (error) {
    console.error("Update task error:", error.message);
    res.status(500).json({ message: "Failed to update task" });
  }
});

// Delete a task
router.delete("/:id", async (req, res) => {
  try {
    const id = parseTaskId(req.params.id);
    if (id === null) {
      return res.status(400).json({ message: "Task id must be a positive integer" });
    }

    const [result] = await pool.query(
      "DELETE FROM tasks WHERE id = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.json({ message: "Task deleted successfully" });
  } catch (error) {
    console.error("Delete task error:", error.message);
    res.status(500).json({ message: "Failed to delete task" });
  }
});

module.exports = router;
