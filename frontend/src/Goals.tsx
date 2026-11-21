
import { useEffect, useState, type FormEvent } from "react";
import {
  Plus,
  Target,
  Trash2,
  CalendarDays,
  Flag,
  Trophy,
  CircleCheck,
  Clock3,
  X,
  ArrowUpRight,
} from "lucide-react";
import api from "./services/api";

interface Goal {
  id: string;
  title: string;
  description: string;
  target_date: string;
  progress: number;
  status: string;
  created_at: string;
}

function Goals() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [targetDate, setTargetDate] = useState("");

  const fetchGoals = async () => {
    try {
      setError("");
      const response = await api.get("/goals");
      setGoals(response.data);
    } catch {
      setError("Unable to load goals. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  const createGoal = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    try {
      await api.post("/goals", {
        title,
        description,
        target_date: targetDate,
        progress: 0,
        status: "active",
      });

      setTitle("");
      setDescription("");
      setTargetDate("");
      setShowForm(false);

      await fetchGoals();
    } catch {
      setError("Unable to create goal. Please check your details.");
    }
  };

  const deleteGoal = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this goal?")) {
      return;
    }

    try {
      await api.delete(`/goals/${id}`);
      setGoals((current) => current.filter((goal) => goal.id !== id));
    } catch {
      setError("Unable to delete goal.");
    }
  };

  const completedGoals = goals.filter(
    (goal) => goal.status?.toLowerCase() === "completed"
  ).length;

  const activeGoals = goals.filter(
    (goal) => goal.status?.toLowerCase() !== "completed"
  ).length;

  const averageProgress =
    goals.length > 0
      ? Math.round(
          goals.reduce(
            (total, goal) => total + Math.min(100, Math.max(0, goal.progress ?? 0)),
            0
          ) / goals.length
        )
      : 0;

  const formatDate = (date: string) => {
    if (!date) return "No target date";

    return new Date(`${date}T00:00:00`).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getStatus = (goal: Goal) => {
    if (goal.status?.toLowerCase() === "completed") return "completed";
    if (goal.progress > 0) return "in-progress";
    return "not-started";
  };

  return (
    <div className="goals-page">
      <div className="goals-header">
        <div>
          <div className="goals-eyebrow">YOUR PERSONAL JOURNEY</div>
          <h1>My Goals</h1>
          <p>Turn your ambitions into achievements, one step at a time.</p>
        </div>

        <button
          className="goals-create-btn"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? <X size={18} /> : <Plus size={18} />}
          {showForm ? "Close Form" : "Create Goal"}
        </button>
      </div>

      <div className="goals-stats-grid">
        <div className="goals-stat-card">
          <div className="goals-stat-top">
            <div className="goals-stat-icon purple">
              <Target size={21} />
            </div>
            <span className="goals-stat-caption">ALL YOUR GOALS</span>
          </div>
          <h2>{goals.length}</h2>
          <p>Total Goals</p>
        </div>

        <div className="goals-stat-card">
          <div className="goals-stat-top">
            <div className="goals-stat-icon blue">
              <Flag size={21} />
            </div>
            <span className="goals-stat-caption">IN PROGRESS</span>
          </div>
          <h2>{activeGoals}</h2>
          <p>Active Goals</p>
        </div>

        <div className="goals-stat-card">
          <div className="goals-stat-top">
            <div className="goals-stat-icon green">
              <Trophy size={21} />
            </div>
            <span className="goals-stat-caption">ACHIEVEMENTS</span>
          </div>
          <h2>{completedGoals}</h2>
          <p>Completed Goals</p>
        </div>

        <div className="goals-stat-card">
          <div className="goals-stat-top">
            <div className="goals-stat-icon orange">
              <ArrowUpRight size={21} />
            </div>
            <span className="goals-stat-caption">OVERALL PROGRESS</span>
          </div>
          <h2>{averageProgress}%</h2>
          <p>Average Progress</p>
        </div>
      </div>

      {showForm && (
        <form className="goals-form" onSubmit={createGoal}>
          <div className="goals-form-heading">
            <div className="goals-stat-icon purple">
              <Target size={21} />
            </div>
            <div>
              <h2>Create a new goal</h2>
              <p>Define what you want to accomplish.</p>
            </div>
          </div>

          <div className="goals-form-grid">
            <div className="goals-field">
              <label>Goal title</label>
              <input
                type="text"
                placeholder="e.g. Complete AWS certification"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="goals-field">
              <label>Target date</label>
              <input
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                required
              />
            </div>

            <div className="goals-field goals-field-full">
              <label>Description</label>
              <textarea
                placeholder="Describe your goal and what success looks like..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <div className="goals-form-actions">
            <button type="button" className="goals-cancel-btn" onClick={() => setShowForm(false)}>
              Cancel
            </button>
            <button type="submit" className="goals-create-btn">
              <Plus size={17} />
              Create Goal
            </button>
          </div>
        </form>
      )}

      {error && <div className="goals-error">{error}</div>}

      <div className="goals-section-heading">
        <div>
          <h2>Your Goals</h2>
          <p>Keep track of everything you're working towards.</p>
        </div>
        <span className="goals-count">{goals.length} goals</span>
      </div>

      {loading ? (
        <div className="goals-loading">Loading your goals...</div>
      ) : goals.length === 0 ? (
        <div className="goals-empty">
          <div className="goals-empty-icon">
            <Target size={34} />
          </div>
          <h3>Your journey starts here</h3>
          <p>You haven't created any goals yet. Add your first goal and start making progress.</p>
          <button className="goals-create-btn" onClick={() => setShowForm(true)}>
            <Plus size={18} />
            Create Your First Goal
          </button>
        </div>
      ) : (
        <div className="goals-list">
          {goals.map((goal) => {
            const progress = Math.min(100, Math.max(0, goal.progress ?? 0));
            const status = getStatus(goal);

            return (
              <article className="goal-card" key={goal.id}>
                <div className="goal-card-top">
                  <div className="goal-card-icon">
                    <Target size={22} />
                  </div>

                  <span className={`goal-status ${status}`}>
                    {status === "completed" && <CircleCheck size={14} />}
                    {status === "in-progress" && <Clock3 size={14} />}
                    {status === "completed"
                      ? "Completed"
                      : status === "in-progress"
                      ? "In Progress"
                      : "Not Started"}
                  </span>

                  <button
                    className="goal-delete-btn"
                    onClick={() => deleteGoal(goal.id)}
                    title="Delete goal"
                    aria-label={`Delete ${goal.title}`}
                  >
                    <Trash2 size={17} />
                  </button>
                </div>

                <h3>{goal.title}</h3>
                <p className="goal-description">
                  {goal.description || "No description provided."}
                </p>

                <div className="goal-date">
                  <CalendarDays size={15} />
                  <span>Target date: {formatDate(goal.target_date)}</span>
                </div>

                <div className="goal-progress-area">
                  <div className="goal-progress-heading">
                    <span>Goal progress</span>
                    <strong>{progress}%</strong>
                  </div>

                  <div
                    className="goal-progress-track"
                    role="progressbar"
                    aria-valuenow={progress}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`${goal.title} progress`}
                  >
                    <div
                      className="goal-progress-fill"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Goals;
