
import { useEffect, useState, type FormEvent } from "react";
import {
  Plus,
  Trash2,
  CheckCircle2,
  Circle,
  Clock,
  ListTodo,
  X,
} from "lucide-react";
import api from "./services/api";

interface Task {
  id: string;
  title: string;
  description?: string | null;
  priority: "low" | "medium" | "high";
  status: "pending" | "in_progress" | "completed";
  due_at?: string | null;
  created_at: string;
}

function Tasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState("all");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");
  const [dueAt, setDueAt] = useState("");

  const fetchTasks = async () => {
    try {
      setError("");
      const response = await api.get("/tasks");
      setTasks(response.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Unable to load tasks.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const createTask = async (e: FormEvent) => {
    e.preventDefault();

    try {
      setError("");

      await api.post("/tasks", {
        title,
        description: description || null,
        priority,
        status: "pending",
        due_at: dueAt ? new Date(dueAt).toISOString() : null,
      });

      setTitle("");
      setDescription("");
      setPriority("medium");
      setDueAt("");
      setShowForm(false);

      await fetchTasks();
    } catch (err: any) {
      setError(err.response?.data?.detail || "Unable to create task.");
    }
  };

  const updateStatus = async (task: Task) => {
    const nextStatus =
      task.status === "completed" ? "pending" : "completed";

    try {
      await api.put(`/tasks/${task.id}`, {
        status: nextStatus,
      });

      await fetchTasks();
    } catch (err: any) {
      setError(err.response?.data?.detail || "Unable to update task.");
    }
  };

  const deleteTask = async (taskId: string) => {
    if (!window.confirm("Are you sure you want to delete this task?")) {
      return;
    }

    try {
      await api.delete(`/tasks/${taskId}`);
      await fetchTasks();
    } catch (err: any) {
      setError(err.response?.data?.detail || "Unable to delete task.");
    }
  };

  const filteredTasks = tasks.filter((task) => {
    if (filter === "all") return true;
    return task.status === filter;
  });

  const completedCount = tasks.filter(
    (task) => task.status === "completed"
  ).length;

  return (
    <div className="tasks-page">
      <div className="tasks-header">
        <div>
          <span className="tasks-eyebrow">YOUR WORKSPACE</span>
          <h1>My Tasks</h1>
          <p>Organize your work. Focus on what matters.</p>
        </div>

        <button
          className="tasks-create-button"
          onClick={() => setShowForm(!showForm)}
        >
          <Plus size={18} />
          Create Task
        </button>
      </div>

      <div className="tasks-stats">
        <div className="task-stat-card">
          <ListTodo size={22} />
          <span>Total Tasks</span>
          <strong>{tasks.length}</strong>
        </div>

        <div className="task-stat-card">
          <Clock size={22} />
          <span>Pending</span>
          <strong>{tasks.filter(t => t.status === "pending").length}</strong>
        </div>

        <div className="task-stat-card">
          <CheckCircle2 size={22} />
          <span>Completed</span>
          <strong>{completedCount}</strong>
        </div>
      </div>

      {showForm && (
        <form className="task-form" onSubmit={createTask}>
          <div className="task-form-heading">
            <h2>Create a new task</h2>
            <button type="button" onClick={() => setShowForm(false)}>
              <X size={20} />
            </button>
          </div>

          <label>Task title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What do you want to accomplish?"
            maxLength={200}
            required
          />

          <label>Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add some details..."
          />

          <div className="task-form-row">
            <div>
              <label>Priority</label>
              <select
                value={priority}
                onChange={(e) =>
                  setPriority(e.target.value as "low" | "medium" | "high")
                }
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <div>
              <label>Due date</label>
              <input
                type="datetime-local"
                value={dueAt}
                onChange={(e) => setDueAt(e.target.value)}
              />
            </div>
          </div>

          <button className="tasks-submit-button" type="submit">
            Create Task
          </button>
        </form>
      )}

      {error && <div className="tasks-error">{error}</div>}

      <div className="tasks-list-card">
        <div className="tasks-list-header">
          <div>
            <h2>All Tasks</h2>
            <p>Manage your daily productivity</p>
          </div>

          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">All Tasks</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        {loading ? (
          <p className="tasks-empty">Loading your tasks...</p>
        ) : filteredTasks.length === 0 ? (
          <div className="tasks-empty">
            <ListTodo size={42} />
            <h3>No tasks found</h3>
            <p>Create your first task to get started.</p>
          </div>
        ) : (
          <div className="tasks-list">
            {filteredTasks.map((task) => (
              <div className="task-item" key={task.id}>
                <button
                  className="task-check-button"
                  onClick={() => updateStatus(task)}
                  title="Toggle completion"
                >
                  {task.status === "completed" ? (
                    <CheckCircle2 color="#7357e8" />
                  ) : (
                    <Circle />
                  )}
                </button>

                <div className="task-item-content">
                  <h3 className={task.status === "completed" ? "task-done" : ""}>
                    {task.title}
                  </h3>

                  {task.description && <p>{task.description}</p>}

                  <div className="task-item-meta">
                    <span className={`priority-${task.priority}`}>
                      {task.priority.toUpperCase()} PRIORITY
                    </span>

                    <span>{task.status.replace("_", " ")}</span>

                    {task.due_at && (
                      <span>
                        Due: {new Date(task.due_at).toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>

                <button
                  className="task-delete-button"
                  onClick={() => deleteTask(task.id)}
                  title="Delete task"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Tasks;
