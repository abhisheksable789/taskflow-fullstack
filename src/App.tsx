
import { useEffect, useState } from "react";
import {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
} from "./api";
import type { Task, TaskStatus, Priority } from "./api";
import "./App.css";

const statuses: TaskStatus[] = ["To Do", "In Progress", "Done"];
const priorities: Priority[] = ["Low", "Medium", "High"];

function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState("");
  const [project, setProject] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState<Priority>("Medium");
  const [status, setStatus] = useState<TaskStatus>("To Do");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [filter, setFilter] = useState<TaskStatus | "All">("All");
  const [search, setSearch] = useState("");

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

  function resetForm() {
    setTitle("");
    setProject("");
    setDueDate("");
    setPriority("Medium");
    setStatus("To Do");
    setEditingId(null);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setError("");
      setSaving(true);
      const values = {
        title,
        project,
        dueDate,
        priority,
        status,
      };

      if (editingId !== null) {
        const updated = { id: editingId, ...values };
        await updateTask(updated);
        setTasks((current) =>
          current.map((task) => (task.id === editingId ? updated : task))
        );
      } else {
        const created = await createTask(values);
        setTasks((current) => [created, ...current]);
      }
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save task");
    } finally {
      setSaving(false);
    }
  }

  function editTask(task: Task) {
    setEditingId(task.id);
    setTitle(task.title);
    setProject(task.project);
    setDueDate(task.dueDate);
    setPriority(task.priority);
    setStatus(task.status);
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
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
      if (editingId === id) resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete task");
    }
  }

  const visibleTasks = tasks.filter((task) => {
    const matchesFilter = filter === "All" || task.status === filter;
    const query = search.trim().toLowerCase();
    const matchesSearch =
      !query ||
      task.title.toLowerCase().includes(query) ||
      task.project.toLowerCase().includes(query);
    return matchesFilter && matchesSearch;
  });
  const completedCount = tasks.filter((task) => task.status === "Done").length;
  const activeCount = tasks.filter((task) => task.status !== "Done").length;
  const currentDate = new Date();
  const today = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}-${String(currentDate.getDate()).padStart(2, "0")}`;
  const overdueCount = tasks.filter(
    (task) => task.status !== "Done" && task.dueDate < today
  ).length;

  return (
    <main className="taskflow">
      <header className="app-header">
        <a className="brand" href="#top" aria-label="TaskFlow home">
          <span className="brand-mark" aria-hidden="true">T</span>
          <span>TaskFlow</span>
        </a>
        <span className="workspace-label">PERSONAL WORKSPACE</span>
      </header>

      <section className="welcome" id="top">
        <div>
          <p className="eyebrow">YOUR DAY, IN FOCUS</p>
          <h1>Make room for<br /><span>meaningful work.</span></h1>
          <p className="welcome-copy">A thoughtful place to plan, prioritize, and move things forward.</p>
        </div>
        <div className="date-stamp">
          <span className="date-dot" />
          <span>{new Intl.DateTimeFormat("en", { weekday: "long", month: "long", day: "numeric" }).format(new Date())}</span>
        </div>
      </section>

      <section className="overview" aria-label="Task overview">
        <article className="overview-item overview-total">
          <span className="overview-label">Open tasks</span>
          <strong>{activeCount.toString().padStart(2, "0")}</strong>
          <span className="overview-note">Across your workspace</span>
        </article>
        <article className="overview-item overview-done">
          <span className="overview-label">Completed</span>
          <strong>{completedCount.toString().padStart(2, "0")}</strong>
          <span className="overview-note">Good work adds up</span>
        </article>
        <article className="overview-item overview-overdue">
          <span className="overview-label">Past due</span>
          <strong>{overdueCount.toString().padStart(2, "0")}</strong>
          <span className="overview-note">Ready for your attention</span>
        </article>
      </section>

      <div className="workspace-grid">
        <section className="task-form panel" aria-labelledby="form-heading">
          <div className="panel-heading">
            <span className="section-index">01</span>
            <div>
              <h2 id="form-heading">{editingId === null ? "Capture a task" : "Edit task"}</h2>
              <p>{editingId === null ? "Get it out of your head and onto the list." : "Make your changes below."}</p>
            </div>
          </div>
          <form onSubmit={handleSubmit}>
            <label className="field field-wide">
              <span>Task name</span>
              <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="What needs to get done?" maxLength={150} required />
            </label>
            <label className="field field-wide">
              <span>Project</span>
              <input value={project} onChange={(event) => setProject(event.target.value)} placeholder="Add a project or area" maxLength={100} required />
            </label>
            <label className="field">
              <span>Due date</span>
              <input type="date" value={dueDate} onChange={(event) => setDueDate(event.target.value)} required />
            </label>
            <label className="field">
              <span>Priority</span>
              <select value={priority} onChange={(event) => setPriority(event.target.value as Priority)}>
                {priorities.map((item) => <option key={item}>{item}</option>)}
              </select>
            </label>
            <label className="field field-wide">
              <span>Status</span>
              <select value={status} onChange={(event) => setStatus(event.target.value as TaskStatus)}>
                {statuses.map((item) => <option key={item}>{item}</option>)}
              </select>
            </label>
            {error && <p role="alert" className="error field-wide">{error}</p>}
            <div className="form-actions field-wide">
              <button className="primary-button" type="submit" disabled={saving}>
                {saving ? "Saving..." : editingId === null ? "Add to tasks" : "Save changes"}
                <span aria-hidden="true">↗</span>
              </button>
              {editingId !== null && <button className="text-button" type="button" onClick={resetForm}>Cancel</button>}
            </div>
          </form>
        </section>

        <section className="task-section" aria-labelledby="tasks-heading">
          <div className="tasks-heading-row">
            <div className="panel-heading">
              <span className="section-index">02</span>
              <div>
                <h2 id="tasks-heading">Your task list</h2>
                <p>{tasks.length} {tasks.length === 1 ? "task" : "tasks"} in your workspace</p>
              </div>
            </div>
            <label className="search-field">
              <span className="search-icon" aria-hidden="true">⌕</span>
              <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Find a task" aria-label="Search tasks" />
            </label>
          </div>

          <div className="task-toolbar">
            <div className="filter-tabs" aria-label="Filter tasks by status">
              {(["All", ...statuses] as const).map((item) => (
                <button className={filter === item ? "filter-tab active" : "filter-tab"} key={item} type="button" aria-pressed={filter === item} onClick={() => setFilter(item)}>
                  {item}
                  <span>{item === "All" ? tasks.length : tasks.filter((task) => task.status === item).length}</span>
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <p className="list-message">Loading your tasks...</p>
          ) : visibleTasks.length === 0 ? (
            <div className="empty-state">
              <span className="empty-mark" aria-hidden="true">—</span>
              <h3>{tasks.length === 0 ? "A clear page." : "No matching tasks."}</h3>
              <p>{tasks.length === 0 ? "Add your first task to give the day some shape." : "Try another status or search term."}</p>
            </div>
          ) : (
            <ul className="task-list">
              {visibleTasks.map((task) => {
                const isOverdue = task.status !== "Done" && task.dueDate < today;
                return (
                  <li key={task.id} className={task.status === "Done" ? "task-item completed" : "task-item"}>
                    <span className={`priority-marker priority-${task.priority.toLowerCase()}`} aria-label={`${task.priority} priority`} />
                    <div className="task-description">
                      <strong>{task.title}</strong>
                      <div className="task-meta">
                        <span>{task.project}</span>
                        <span className="meta-divider" />
                        <span className={isOverdue ? "due-date overdue" : "due-date"}>{isOverdue ? "Overdue" : "Due"} {new Date(`${task.dueDate}T00:00:00`).toLocaleDateString("en", { month: "short", day: "numeric" })}</span>
                      </div>
                    </div>
                    <span className={`priority-label priority-text-${task.priority.toLowerCase()}`}>{task.priority}</span>
                    <select className={`status-select status-${task.status.toLowerCase().replaceAll(" ", "-")}`} aria-label={`Status for ${task.title}`} value={task.status} onChange={(event) => void changeStatus(task, event.target.value as TaskStatus)}>
                      {statuses.map((item) => <option key={item}>{item}</option>)}
                    </select>
                    <div className="task-actions">
                      <button type="button" className="action-button" onClick={() => editTask(task)} aria-label={`Edit ${task.title}`}>Edit</button>
                      <button type="button" className="action-button action-delete" onClick={() => void removeTask(task.id)} aria-label={`Delete ${task.title}`}>Delete</button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>

      <footer className="app-footer"><span>TaskFlow</span><span>Small steps. Clear progress.</span></footer>
    </main>
  );
}

export default App;
