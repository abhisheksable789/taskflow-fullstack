
import { useEffect, useState } from "react";
import {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
} from "./api";
import type { Task, TaskStatus, Priority } from "./api";
import "./App.css";

function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState("");
  const [project, setProject] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState<Priority>("Medium");
  const [status, setStatus] = useState<TaskStatus>("To Do");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    getTasks()
      .then((data) => {
        if (active) {
          setTasks(data);
          setError("");
        }
      })
      .catch((err: unknown) => {
        if (active) {
          setError(err instanceof Error ? err.message : "Could not load tasks");
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  async function handleCreate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setError("");
      const task = await createTask({
        title,
        project,
        dueDate,
        priority,
        status,
      });

      setTasks((current) => [task, ...current]);
      setTitle("");
      setProject("");
      setDueDate("");
      setPriority("Medium");
      setStatus("To Do");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create task");
    }
  }

  async function changeStatus(task: Task, nextStatus: TaskStatus) {
    try {
      setError("");
      const updated = { ...task, status: nextStatus };
      await updateTask(updated);
      setTasks((current) =>
        current.map((item) => (item.id === task.id ? updated : item))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update task");
    }
  }

  async function removeTask(id: number) {
    try {
      setError("");
      await deleteTask(id);
      setTasks((current) => current.filter((task) => task.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete task");
    }
  }

  return (
    <main className="taskflow">
      <header>
        <h1>TaskFlow</h1>
        <p>Manage your projects and tasks in one place.</p>
      </header>

      <section className="task-form">
        <h2>Create a task</h2>
        <form onSubmit={handleCreate}>
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Task title"
            required
          />
          <input
            value={project}
            onChange={(event) => setProject(event.target.value)}
            placeholder="Project name"
            required
          />
          <input
            type="date"
            value={dueDate}
            onChange={(event) => setDueDate(event.target.value)}
            required
          />

          <select
            value={priority}
            onChange={(event) => setPriority(event.target.value as Priority)}
          >
            <option>Low</option>
            <option>Medium</option>
            <option>High</option>
          </select>

          <select
            value={status}
            onChange={(event) => setStatus(event.target.value as TaskStatus)}
          >
            <option>To Do</option>
            <option>In Progress</option>
            <option>Done</option>
          </select>

          <button type="submit">Add task</button>
        </form>
      </section>

      {error && <p role="alert" className="error">{error}</p>}

      <section>
        <h2>Your tasks</h2>
        {loading ? (
          <p>Loading tasks...</p>
        ) : tasks.length === 0 ? (
          <p>No tasks yet. Create your first task above.</p>
        ) : (
          <ul className="task-list">
            {tasks.map((task) => (
              <li key={task.id} className="task-item">
                <div>
                  <strong>{task.title}</strong>
                  <p>
                    {task.project} · {task.priority} · Due {task.dueDate}
                  </p>
                </div>

                <select
                  aria-label={`Status for ${task.title}`}
                  value={task.status}
                  onChange={(event) =>
                    void changeStatus(task, event.target.value as TaskStatus)
                  }
                >
                  <option>To Do</option>
                  <option>In Progress</option>
                  <option>Done</option>
                </select>

                <button type="button" onClick={() => void removeTask(task.id)}>
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}

export default App;
