
import { useEffect, useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area,
} from "recharts";

import {
  TrendingUp,
  CheckCircle2,
  Target,
  Repeat,
  ListTodo,
  RefreshCw,
  Award,
  Activity,
} from "lucide-react";

import api from "./services/api";

interface DashboardData {
  total_tasks: number;
  pending_tasks: number;
  in_progress_tasks: number;
  completed_tasks: number;
  total_goals: number;
  active_goals: number;
  completed_goals: number;
  total_habits: number;
  active_habits: number;
  completed_habits_today: number;
}

interface Task {
  id: string;
  title: string;
  status: string;
  created_at?: string;
  due_at?: string;
}

interface Goal {
  id: string;
  title: string;
  progress: number;
  status: string;
}

interface Habit {
  id: string;
  name: string;
  is_active: boolean;
}

const COLORS = ["#8057e8", "#4389e9", "#f2a23a"];

const Analytics = () => {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError("");

      const [dashboardResponse, taskResponse, goalResponse, habitResponse] =
        await Promise.all([
          api.get("/dashboard/overview"),
          api.get("/tasks"),
          api.get("/goals"),
          api.get("/habits"),
        ]);

      setDashboard(dashboardResponse.data);
      setTasks(Array.isArray(taskResponse.data) ? taskResponse.data : []);
      setGoals(Array.isArray(goalResponse.data) ? goalResponse.data : []);
      setHabits(Array.isArray(habitResponse.data) ? habitResponse.data : []);
    } catch (err) {
      console.error("Analytics error:", err);
      setError("Unable to load analytics. Please check your backend.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const taskCompletion = useMemo(() => {
    if (!dashboard?.total_tasks) return 0;

    return Math.round(
      (dashboard.completed_tasks / dashboard.total_tasks) * 100
    );
  }, [dashboard]);

  const goalCompletion = useMemo(() => {
    if (!dashboard?.total_goals) return 0;

    return Math.round(
      (dashboard.completed_goals / dashboard.total_goals) * 100
    );
  }, [dashboard]);

  const habitCompletion = useMemo(() => {
    if (!dashboard?.active_habits) return 0;

    return Math.min(
      100,
      Math.round(
        (dashboard.completed_habits_today / dashboard.active_habits) * 100
      )
    );
  }, [dashboard]);

  const taskChartData = [
    {
      name: "Completed",
      value: dashboard?.completed_tasks ?? 0,
    },
    {
      name: "In Progress",
      value: dashboard?.in_progress_tasks ?? 0,
    },
    {
      name: "Pending",
      value: dashboard?.pending_tasks ?? 0,
    },
  ];

  const goalChartData = goals.map((goal) => ({
    name: goal.title.length > 16
      ? goal.title.slice(0, 16) + "..."
      : goal.title,
    progress: goal.progress ?? 0,
  }));

  const weeklyData = useMemo(() => {
    const today = new Date();

    return Array.from({ length: 7 }, (_, index) => {
      const date = new Date(today);
      date.setDate(today.getDate() - (6 - index));

      const dateKey = date.toISOString().slice(0, 10);

      const completed = tasks.filter(
        (task) =>
          task.status === "completed" &&
          task.created_at?.slice(0, 10) === dateKey
      ).length;

      return {
        day: date.toLocaleDateString("en-US", {
          weekday: "short",
        }),
        completed,
      };
    });
  }, [tasks]);

  if (loading) {
    return (
      <div className="analytics-page">
        <div className="analytics-loading">
          <RefreshCw className="analytics-spin" size={25} />
          <p>Preparing your analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="analytics-page">
        <div className="analytics-error">
          <p>{error}</p>
          <button onClick={fetchAnalytics}>Try again</button>
        </div>
      </div>
    );
  }

  return (
    <div className="analytics-page">
      {/* HEADER */}
      <section className="analytics-header">
        <div>
          <span className="analytics-eyebrow">
            YOUR PERFORMANCE CENTER
          </span>

          <h1>Analytics</h1>

          <p>
            Understand your progress and build better habits every day.
          </p>
        </div>

        <button
          className="analytics-refresh-button"
          onClick={fetchAnalytics}
        >
          <RefreshCw size={17} />
          Refresh
        </button>
      </section>

      {/* STAT CARDS */}
      <section className="analytics-stats-grid">
        <div className="analytics-stat-card">
          <div className="analytics-stat-icon purple">
            <ListTodo size={21} />
          </div>
          <span>Total Tasks</span>
          <h2>{dashboard?.total_tasks ?? 0}</h2>
          <small>{taskCompletion}% completed</small>
        </div>

        <div className="analytics-stat-card">
          <div className="analytics-stat-icon green">
            <CheckCircle2 size={21} />
          </div>
          <span>Completed Tasks</span>
          <h2>{dashboard?.completed_tasks ?? 0}</h2>
          <small>Tasks finished</small>
        </div>

        <div className="analytics-stat-card">
          <div className="analytics-stat-icon orange">
            <Target size={21} />
          </div>
          <span>Active Goals</span>
          <h2>{dashboard?.active_goals ?? 0}</h2>
          <small>{goalCompletion}% goals completed</small>
        </div>

        <div className="analytics-stat-card">
          <div className="analytics-stat-icon blue">
            <Repeat size={21} />
          </div>
          <span>Active Habits</span>
          <h2>{dashboard?.active_habits ?? 0}</h2>
          <small>{habitCompletion}% completed today</small>
        </div>
      </section>

      {/* MAIN CHARTS */}
      <section className="analytics-chart-grid">
        {/* TASK DISTRIBUTION */}
        <div className="analytics-panel">
          <div className="analytics-panel-heading">
            <div>
              <h2>Task Distribution</h2>
              <p>Breakdown of your current tasks</p>
            </div>
            <Activity size={21} />
          </div>

          <div className="analytics-chart-container">
            {dashboard?.total_tasks ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={taskChartData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="45%"
                    innerRadius={65}
                    outerRadius={100}
                    paddingAngle={4}
                  >
                    {taskChartData.map((entry, index) => (
                      <Cell
                        key={entry.name}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>

                  <Tooltip />
                  <Legend verticalAlign="bottom" />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="analytics-no-data">
                No task data available yet.
              </div>
            )}
          </div>
        </div>

        {/* WEEKLY PRODUCTIVITY */}
        <div className="analytics-panel">
          <div className="analytics-panel-heading">
            <div>
              <h2>Weekly Productivity</h2>
              <p>Tasks created and completed by date</p>
            </div>
            <TrendingUp size={21} />
          </div>

          <div className="analytics-chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyData}>
                <defs>
                  <linearGradient
                    id="productivityGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="0%"
                      stopColor="#8057e8"
                      stopOpacity={0.3}
                    />
                    <stop
                      offset="95%"
                      stopColor="#8057e8"
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>

                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                />

                <XAxis dataKey="day" />
                <YAxis allowDecimals={false} />
                <Tooltip />

                <Area
                  type="monotone"
                  dataKey="completed"
                  stroke="#8057e8"
                  fill="url(#productivityGradient)"
                  strokeWidth={3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* GOALS AND PROGRESS */}
      <section className="analytics-bottom-grid">
        <div className="analytics-panel">
          <div className="analytics-panel-heading">
            <div>
              <h2>Goal Progress</h2>
              <p>Progress across your goals</p>
            </div>
            <Target size={21} />
          </div>

          {goalChartData.length > 0 ? (
            <div className="analytics-goal-chart">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={goalChartData}
                  layout="vertical"
                  margin={{
                    left: 10,
                    right: 20,
                    top: 10,
                    bottom: 10,
                  }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    horizontal={false}
                  />

                  <XAxis
                    type="number"
                    domain={[0, 100]}
                    unit="%"
                  />

                  <YAxis
                    type="category"
                    dataKey="name"
                    width={105}
                  />

                  <Tooltip formatter={(value) => [`${value}%`, "Progress"]} />

                  <Bar
                    dataKey="progress"
                    fill="#8057e8"
                    radius={[0, 7, 7, 0]}
                    barSize={18}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="analytics-no-data">
              Create your first goal to see its progress here.
            </div>
          )}
        </div>

        {/* PRODUCTIVITY SUMMARY */}
        <div className="analytics-panel">
          <div className="analytics-panel-heading">
            <div>
              <h2>Performance Summary</h2>
              <p>Your current productivity levels</p>
            </div>
            <Award size={21} />
          </div>

          <div className="analytics-progress-list">
            <div className="analytics-progress-item">
              <div className="analytics-progress-label">
                <span>Task Completion</span>
                <strong>{taskCompletion}%</strong>
              </div>

              <div className="analytics-progress-track">
                <div
                  className="analytics-progress-fill purple"
                  style={{ width: `${taskCompletion}%` }}
                />
              </div>
            </div>

            <div className="analytics-progress-item">
              <div className="analytics-progress-label">
                <span>Goal Completion</span>
                <strong>{goalCompletion}%</strong>
              </div>

              <div className="analytics-progress-track">
                <div
                  className="analytics-progress-fill orange"
                  style={{ width: `${goalCompletion}%` }}
                />
              </div>
            </div>

            <div className="analytics-progress-item">
              <div className="analytics-progress-label">
                <span>Today's Habit Completion</span>
                <strong>{habitCompletion}%</strong>
              </div>

              <div className="analytics-progress-track">
                <div
                  className="analytics-progress-fill green"
                  style={{ width: `${habitCompletion}%` }}
                />
              </div>
            </div>
          </div>

          <div className="analytics-summary-footer">
            <Award size={20} />

            <div>
              <strong>Keep showing up!</strong>
              <p>Consistency creates long-term progress.</p>
            </div>
          </div>
        </div>
      </section>

      {/* HABIT OVERVIEW */}
      <section className="analytics-panel analytics-habits-panel">
        <div className="analytics-panel-heading">
          <div>
            <h2>Habit Overview</h2>
            <p>Your active daily routines</p>
          </div>
          <Repeat size={21} />
        </div>

        {habits.filter((habit) => habit.is_active).length > 0 ? (
          <div className="analytics-habit-list">
            {habits
              .filter((habit) => habit.is_active)
              .map((habit) => (
                <div className="analytics-habit-item" key={habit.id}>
                  <div className="analytics-habit-icon">
                    <Repeat size={18} />
                  </div>

                  <div>
                    <strong>{habit.name}</strong>
                    <span>Active routine</span>
                  </div>

                  <span className="analytics-active-badge">
                    Active
                  </span>
                </div>
              ))}
          </div>
        ) : (
          <div className="analytics-no-data">
            No active habits yet. Add habits to track your routines.
          </div>
        )}
      </section>

      <footer className="analytics-footer">
        LifeOS Analytics · Your journey, measured over time.
      </footer>
    </div>
  );
};

export default Analytics;
