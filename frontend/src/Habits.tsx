
import { useEffect, useState, type FormEvent } from "react";
import {
  Plus,
  Repeat,
  Trash2,
  CheckCircle2,
  Flame,
  CalendarDays,
  X,
  CircleCheck,
  Clock3,
  Sparkles,
} from "lucide-react";
import api from "./services/api";

interface Habit {
  id: string;
  name: string;
  frequency: string;
  is_active: boolean;
  created_at?: string;
}

interface HabitLog {
  id: string;
  habit_id: string;
  completed_on?: string;
  completed_at?: string;
  date?: string;
}

function getTodayDate() {
  const today = new Date();

  return [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, "0"),
    String(today.getDate()).padStart(2, "0"),
  ].join("-");
}

function Habits() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [completedToday, setCompletedToday] = useState<string[]>([]);
  const [todayLogIds, setTodayLogIds] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");

  const [name, setName] = useState("");
  const [frequency, setFrequency] = useState("daily");
  const [saving, setSaving] = useState(false);

  const fetchHabits = async () => {
    try {
      setError("");

      const response = await api.get("/habits");
      const habitList: Habit[] = response.data;

      setHabits(habitList);

      const today = getTodayDate();

      const results = await Promise.all(
        habitList.map(async (habit) => {
          try {
            const logsResponse = await api.get(
              `/habits/${habit.id}/logs`
            );

            const logs: HabitLog[] = logsResponse.data;

            const todayLog = logs.find((log) => {
              const logDate =
                log.completed_on || log.date || log.completed_at;

              return logDate?.slice(0, 10) === today;
            });

            return {
              habitId: habit.id,
              logId: todayLog?.id || null,
            };
          } catch {
            return {
              habitId: habit.id,
              logId: null,
            };
          }
        })
      );

      const completedIds = results
        .filter((result) => result.logId !== null)
        .map((result) => result.habitId);

      const logIds: Record<string, string> = {};

      results.forEach((result) => {
        if (result.logId) {
          logIds[result.habitId] = result.logId;
        }
      });

      setCompletedToday(completedIds);
      setTodayLogIds(logIds);
    } catch (err) {
      console.error("Failed to load habits:", err);
      setError("Unable to load habits. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHabits();
  }, []);

  const createHabit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSaving(true);

    try {
      await api.post("/habits", {
        name,
        frequency,
        is_active: true,
      });

      setName("");
      setFrequency("daily");
      setShowForm(false);

      await fetchHabits();
    } catch (err) {
      console.error("Failed to create habit:", err);
      setError("Unable to create habit. Please check your details.");
    } finally {
      setSaving(false);
    }
  };

  const toggleHabit = async (habit: Habit) => {
    setError("");

    try {
      if (completedToday.includes(habit.id)) {
        const logId = todayLogIds[habit.id];

        if (!logId) {
          setError(
            "Today's completion log ID could not be found. Refresh and try again."
          );
          return;
        }

        await api.delete(`/habits/${habit.id}/logs/${logId}`);
      } else {
        await api.post(`/habits/${habit.id}/logs`, {
          completed_on: getTodayDate(),
        });
      }

      await fetchHabits();
    } catch (err) {
      console.error("Failed to update habit completion:", err);
      setError("Unable to update habit completion. Please try again.");
    }
  };

  const deleteHabit = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this habit?")) {
      return;
    }

    try {
      await api.delete(`/habits/${id}`);

      setHabits((current) =>
        current.filter((habit) => habit.id !== id)
      );

      setCompletedToday((current) =>
        current.filter((item) => item !== id)
      );

      setTodayLogIds((current) => {
        const updated = { ...current };
        delete updated[id];
        return updated;
      });
    } catch (err) {
      console.error("Failed to delete habit:", err);
      setError("Unable to delete habit.");
    }
  };

  const activeHabits = habits.filter((habit) => habit.is_active);
  const inactiveHabits = habits.length - activeHabits.length;

  const completedActiveCount = activeHabits.filter((habit) =>
    completedToday.includes(habit.id)
  ).length;

  const completionPercentage = activeHabits.length
    ? Math.round(
        (completedActiveCount / activeHabits.length) * 100
      )
    : 0;

  const remainingCount = Math.max(
    0,
    activeHabits.length - completedActiveCount
  );

  return (
    <div className="habits-page">
      <div className="habits-header">
        <div>
          <div className="habits-eyebrow">BUILD YOUR BEST ROUTINE</div>
          <h1>Daily Habits</h1>
          <p>Small consistent actions create remarkable results.</p>
        </div>

        <button
          className="habits-create-btn"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? <X size={18} /> : <Plus size={18} />}
          {showForm ? "Close Form" : "Create Habit"}
        </button>
      </div>

      <div className="habits-stats-grid">
        <div className="habits-stat-card">
          <div className="habits-stat-top">
            <div className="habits-stat-icon purple">
              <Repeat size={21} />
            </div>
            <span className="habits-stat-caption">YOUR ROUTINES</span>
          </div>
          <h2>{habits.length}</h2>
          <p>Total Habits</p>
        </div>

        <div className="habits-stat-card">
          <div className="habits-stat-top">
            <div className="habits-stat-icon orange">
              <Flame size={21} />
            </div>
            <span className="habits-stat-caption">CURRENT ROUTINES</span>
          </div>
          <h2>{activeHabits.length}</h2>
          <p>Active Habits</p>
        </div>

        <div className="habits-stat-card">
          <div className="habits-stat-top">
            <div className="habits-stat-icon green">
              <CircleCheck size={21} />
            </div>
            <span className="habits-stat-caption">TODAY'S WINS</span>
          </div>
          <h2>{completedActiveCount}</h2>
          <p>Completed Today</p>
        </div>

        <div className="habits-stat-card">
          <div className="habits-stat-top">
            <div className="habits-stat-icon blue">
              <Clock3 size={21} />
            </div>
            <span className="habits-stat-caption">STILL TO DO</span>
          </div>
          <h2>{remainingCount}</h2>
          <p>Remaining Today</p>
        </div>
      </div>

      <div className="habits-progress-card">
        <div className="habits-progress-top">
          <div className="habits-progress-title">
            <div className="habits-progress-icon">
              <Sparkles size={20} />
            </div>
            <div>
              <h2>Today's Progress</h2>
              <p>Every completed habit is a step forward.</p>
            </div>
          </div>

          <div className="habits-progress-number">
            {completionPercentage}%
          </div>
        </div>

        <div
          className="habits-progress-track"
          role="progressbar"
          aria-valuenow={completionPercentage}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Today's habit completion"
        >
          <div
            className="habits-progress-fill"
            style={{ width: `${completionPercentage}%` }}
          />
        </div>

        <div className="habits-progress-footer">
          <span>
            {completedActiveCount} of {activeHabits.length} active habits completed
          </span>
          <span>
            {completionPercentage === 100 && activeHabits.length > 0
              ? "All done. Excellent work!"
              : `${remainingCount} remaining`}
          </span>
        </div>
      </div>

      {showForm && (
        <form className="habits-form" onSubmit={createHabit}>
          <div className="habits-form-heading">
            <div className="habits-stat-icon purple">
              <Repeat size={21} />
            </div>
            <div>
              <h2>Create a new habit</h2>
              <p>Add a routine you want to build consistently.</p>
            </div>
          </div>

          <div className="habits-form-grid">
            <div className="habits-field">
              <label>Habit name</label>
              <input
                type="text"
                placeholder="e.g. Read for 30 minutes"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="habits-field">
              <label>Frequency</label>
              <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
              </select>
            </div>
          </div>

          <div className="habits-form-actions">
            <button
              type="button"
              className="habits-cancel-btn"
              onClick={() => setShowForm(false)}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="habits-create-btn"
              disabled={saving}
            >
              <Plus size={17} />
              {saving ? "Creating..." : "Create Habit"}
            </button>
          </div>
        </form>
      )}

      {error && <div className="habits-error">{error}</div>}

      <div className="habits-section-heading">
        <div>
          <h2>Your Habits</h2>
          <p>Show up for yourself, one day at a time.</p>
        </div>
        <span className="habits-count">{habits.length} habits</span>
      </div>

      {loading ? (
        <div className="habits-loading">Loading your habits...</div>
      ) : habits.length === 0 ? (
        <div className="habits-empty">
          <div className="habits-empty-icon">
            <Repeat size={34} />
          </div>
          <h3>Start building better habits</h3>
          <p>
            You haven't created any habits yet. Add your first routine and
            start building consistency.
          </p>
          <button
            className="habits-create-btn"
            onClick={() => setShowForm(true)}
          >
            <Plus size={18} />
            Create Your First Habit
          </button>
        </div>
      ) : (
        <div className="habits-list">
          {habits.map((habit) => {
            const completed = completedToday.includes(habit.id);

            return (
              <article className="habit-card" key={habit.id}>
                <div className="habit-card-top">
                  <div className="habit-card-icon">
                    <Repeat size={22} />
                  </div>

                  <span
                    className={`habit-status ${
                      !habit.is_active
                        ? "inactive"
                        : completed
                          ? "completed"
                          : "active"
                    }`}
                  >
                    {!habit.is_active
                      ? "Inactive"
                      : completed
                        ? "Completed"
                        : "Active"}
                  </span>

                  <button
                    className="habit-delete-btn"
                    onClick={() => deleteHabit(habit.id)}
                    title="Delete habit"
                    aria-label={`Delete ${habit.name}`}
                  >
                    <Trash2 size={17} />
                  </button>
                </div>

                <h3>{habit.name}</h3>

                <div className="habit-frequency">
                  <CalendarDays size={15} />
                  <span>
                    {habit.frequency?.charAt(0).toUpperCase()}
                    {habit.frequency?.slice(1) || "Daily"} routine
                  </span>
                </div>

                <div className="habit-card-bottom">
                  <div className="habit-completion-label">
                    <span>Today's check-in</span>
                    <strong>{completed ? "Done" : "Not completed"}</strong>
                  </div>

                  <button
                    className={`habit-check-btn ${
                      completed ? "is-completed" : ""
                    }`}
                    onClick={() => toggleHabit(habit)}
                    disabled={!habit.is_active}
                    title={
                      completed
                        ? "Undo today's completion"
                        : "Mark completed today"
                    }
                  >
                    <CheckCircle2 size={17} />
                    {completed ? "Completed" : "Mark Complete"}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {inactiveHabits > 0 && (
        <p className="habits-inactive-note">
          {inactiveHabits} inactive {inactiveHabits === 1 ? "habit" : "habits"} included in your list.
        </p>
      )}
    </div>
  );
}

export default Habits;
