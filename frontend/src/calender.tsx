
import { useEffect, useMemo, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  CheckCircle2,
  Clock,
  Target,
  ListTodo,
  RefreshCw,
} from "lucide-react";
import api from "./services/api";

interface Task {
  id: string;
  title: string;
  description?: string;
  priority: string;
  status: string;
  due_at?: string;
}

interface Goal {
  id: string;
  title: string;
  description?: string;
  target_date?: string;
  progress: number;
  status: string;
}

interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  type: "task" | "goal";
  status: string;
  description?: string;
}

const Calendar = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchCalendarData = async () => {
    try {
      setLoading(true);
      setError("");

      const [taskResponse, goalResponse] = await Promise.all([
        api.get("/tasks"),
        api.get("/goals"),
      ]);

      setTasks(Array.isArray(taskResponse.data) ? taskResponse.data : []);
      setGoals(Array.isArray(goalResponse.data) ? goalResponse.data : []);
    } catch (err) {
      console.error("Calendar loading error:", err);
      setError("Unable to load calendar data. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCalendarData();
  }, []);

  const events: CalendarEvent[] = useMemo(() => {
    const taskEvents: CalendarEvent[] = tasks
      .filter((task) => task.due_at)
      .map((task) => ({
        id: task.id,
        title: task.title,
        date: task.due_at!.slice(0, 10),
        type: "task",
        status: task.status,
        description: task.description,
      }));

    const goalEvents: CalendarEvent[] = goals
      .filter((goal) => goal.target_date)
      .map((goal) => ({
        id: goal.id,
        title: goal.title,
        date: goal.target_date!,
        type: "goal",
        status: goal.status,
        description: goal.description,
      }));

    return [...taskEvents, ...goalEvents];
  }, [tasks, goals]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const monthName = currentDate.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const calendarDays = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const getDateString = (day: number) => {
    const monthString = String(month + 1).padStart(2, "0");
    const dayString = String(day).padStart(2, "0");
    return `${year}-${monthString}-${dayString}`;
  };

  const getEventsForDate = (date: string) =>
    events.filter((event) => event.date === date);

  const selectedEvents = getEventsForDate(selectedDate);

  const changeMonth = (direction: number) => {
    setCurrentDate(new Date(year, month + direction, 1));
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today.toISOString().slice(0, 10));
  };

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(
    (task) => task.status === "completed"
  ).length;
  const totalGoals = goals.length;

  if (loading) {
    return (
      <div className="calendar-page">
        <div className="calendar-loading">
          <RefreshCw size={24} className="spin" />
          <p>Loading your calendar...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="calendar-page">
      <div className="calendar-header">
        <div>
          <span className="calendar-eyebrow">PLAN YOUR DAYS</span>
          <h1>Calendar</h1>
          <p>Keep track of your tasks, goals, and important dates.</p>
        </div>

        <button className="calendar-today-button" onClick={goToToday}>
          <CalendarDays size={17} />
          Today
        </button>
      </div>

      {error && (
        <div className="calendar-error">
          {error}
          <button onClick={fetchCalendarData}>Try again</button>
        </div>
      )}

      <div className="calendar-stats">
        <div className="calendar-stat-card">
          <div className="calendar-stat-icon purple">
            <ListTodo size={21} />
          </div>
          <div>
            <span>Total Tasks</span>
            <h2>{totalTasks}</h2>
          </div>
        </div>

        <div className="calendar-stat-card">
          <div className="calendar-stat-icon green">
            <CheckCircle2 size={21} />
          </div>
          <div>
            <span>Completed Tasks</span>
            <h2>{completedTasks}</h2>
          </div>
        </div>

        <div className="calendar-stat-card">
          <div className="calendar-stat-icon orange">
            <Target size={21} />
          </div>
          <div>
            <span>Total Goals</span>
            <h2>{totalGoals}</h2>
          </div>
        </div>

        <div className="calendar-stat-card">
          <div className="calendar-stat-icon blue">
            <Clock size={21} />
          </div>
          <div>
            <span>Scheduled Events</span>
            <h2>{events.length}</h2>
          </div>
        </div>
      </div>

      <div className="calendar-layout">
        <div className="calendar-main">
          <div className="calendar-month-header">
            <div>
              <h2>{monthName}</h2>
              <p>Manage your schedule</p>
            </div>

            <div className="calendar-navigation">
              <button
                aria-label="Previous month"
                onClick={() => changeMonth(-1)}
              >
                <ChevronLeft size={20} />
              </button>

              <button
                aria-label="Next month"
                onClick={() => changeMonth(1)}
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>

          <div className="calendar-grid">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
              (day) => (
                <div className="calendar-weekday" key={day}>
                  {day}
                </div>
              )
            )}

            {calendarDays.map((day, index) => {
              if (day === null) {
                return <div className="calendar-empty" key={`empty-${index}`} />;
              }

              const dateString = getDateString(day);
              const dayEvents = getEventsForDate(dateString);
              const today = new Date().toISOString().slice(0, 10);
              const isToday = dateString === today;
              const isSelected = dateString === selectedDate;

              return (
                <button
                  key={dateString}
                  className={`calendar-day ${
                    isToday ? "calendar-day-today" : ""
                  } ${isSelected ? "calendar-day-selected" : ""}`}
                  onClick={() => setSelectedDate(dateString)}
                >
                  <span className="calendar-day-number">{day}</span>

                  <div className="calendar-event-dots">
                    {dayEvents.slice(0, 3).map((event) => (
                      <span
                        key={`${event.type}-${event.id}`}
                        className={`calendar-event-dot ${event.type}`}
                      />
                    ))}
                  </div>

                  {dayEvents.length > 0 && (
                    <span className="calendar-event-count">
                      {dayEvents.length} event
                      {dayEvents.length > 1 ? "s" : ""}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="calendar-legend">
            <span>
              <i className="calendar-event-dot task" /> Tasks
            </span>
            <span>
              <i className="calendar-event-dot goal" /> Goals
            </span>
          </div>
        </div>

        <aside className="calendar-sidebar">
          <div className="calendar-selected-heading">
            <span>YOUR SCHEDULE</span>
            <h3>
              {new Date(`${selectedDate}T00:00:00`).toLocaleDateString(
                "en-US",
                {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                }
              )}
            </h3>
          </div>

          {selectedEvents.length === 0 ? (
            <div className="calendar-empty-state">
              <div className="calendar-empty-icon">
                <CalendarDays size={28} />
              </div>
              <h4>No events scheduled</h4>
              <p>You're free on this day. Enjoy your time!</p>
            </div>
          ) : (
            <div className="calendar-event-list">
              {selectedEvents.map((event) => (
                <div
                  key={`${event.type}-${event.id}`}
                  className={`calendar-event-card ${event.type}`}
                >
                  <div className="calendar-event-card-heading">
                    <span>
                      {event.type === "task" ? (
                        <ListTodo size={17} />
                      ) : (
                        <Target size={17} />
                      )}
                    </span>

                    <span className="calendar-event-type">
                      {event.type}
                    </span>
                  </div>

                  <h4>{event.title}</h4>

                  {event.description && <p>{event.description}</p>}

                  <div className="calendar-event-footer">
                    <span>{event.status.replace("_", " ")}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </aside>
      </div>
    </div>
  );
};

export default Calendar;
