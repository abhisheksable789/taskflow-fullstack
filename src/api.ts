const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api"
).replace(/\/+$/, "");

export type TaskStatus = "To Do" | "In Progress" | "Done";
export type Priority = "Low" | "Medium" | "High";

export type Task = {
  id: number;
  title: string;
  project: string;
  priority: Priority;
  status: TaskStatus;
  dueDate: string;
};

type ApiTask = Omit<Task, "dueDate"> & {
  due_date: string;
};

function normalizeTask(task: ApiTask): Task {
  return {
    id: task.id,
    title: task.title,
    project: task.project,
    priority: task.priority,
    status: task.status,
    dueDate: String(task.due_date).slice(0, 10),
  };
}

// GET: Fetch all tasks from MySQL
export async function getTasks(): Promise<Task[]> {
  const response = await fetch(`${API_BASE_URL}/tasks`);

  if (!response.ok) {
    throw new Error("Unable to load tasks from the server");
  }

  const tasks: ApiTask[] = await response.json();
  return tasks.map(normalizeTask);
}

// POST: Create a task
export async function createTask(
  task: Omit<Task, "id">
): Promise<Task> {
  const response = await fetch(`${API_BASE_URL}/tasks`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title: task.title,
      project: task.project,
      priority: task.priority,
      status: task.status,
      due_date: task.dueDate,
    }),
  });

  if (!response.ok) {
    throw new Error("Unable to create task");
  }

  const created: ApiTask = await response.json();
  return normalizeTask(created);
}

// PUT: Update an existing task
export async function updateTask(task: Task): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/tasks/${task.id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title: task.title,
      project: task.project,
      priority: task.priority,
      status: task.status,
      due_date: task.dueDate,
    }),
  });

  if (!response.ok) {
    throw new Error("Unable to update task");
  }
}

// DELETE: Delete a task
export async function deleteTask(id: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Unable to delete task");
  }
}
