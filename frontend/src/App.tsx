
import { useEffect, useState } from "react";

import {
  LayoutDashboard,
  CheckSquare,
  Target,
  Repeat,
  CalendarDays,
  BarChart3,
  Settings,
  Bell,
  Search,
  Plus,
  ArrowUpRight,
  Clock,
  Zap,
  Menu,
  X,
  Moon,
  Sun,
  BrainCircuit,
  User,
  Sparkles,
} from "lucide-react";

import api from "./services/api";

import Login from "./Login";
import Tasks from "./Tasks";
import Goals from "./Goals";
import Habits from "./Habits";
import Calendar from "./calender";
import Analytics from "./Analytics";
import SettingsPage from "./Settings";
import Profile from "./Profile";
import AIChat from "./AIChat";
import CursorGlow from "./CursorGlow";

import "./App.css";

// ========================================
// TYPES
// ========================================

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

interface UserProfile {
  id?: number | string;
  name?: string;
  full_name?: string;
  email?: string;
  profile_image?: string | null;
  avatar_url?: string;
}

// ========================================
// APP
// ========================================

function App() {
  // ========================================
  // AUTHENTICATION
  // ========================================

  const [isAuthenticated, setIsAuthenticated] = useState(
    Boolean(localStorage.getItem("access_token"))
  );

  // ========================================
  // DASHBOARD DATA
  // ========================================

  const [dashboard, setDashboard] =
    useState<DashboardData | null>(null);

  // ========================================
  // USER PROFILE
  // ========================================

  const [profile, setProfile] = useState<UserProfile>({});

  // ========================================
  // GENERAL STATE
  // ========================================

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const [menuOpen, setMenuOpen] = useState(false);

  const [activePage, setActivePage] = useState("Dashboard");

  // ========================================
  // SEARCH STATE
  // ========================================

  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);

  // ========================================
  // NOTIFICATION STATE
  // ========================================

  const [notificationsOpen, setNotificationsOpen] =
    useState(false);

  // ========================================
  // FLOATING AI ASSISTANT STATE
  // ========================================

  const [aiWidgetOpen, setAiWidgetOpen] = useState(false);

  const [aiWidgetMinimized, setAiWidgetMinimized] =
    useState(false);

  // ========================================
  // THEME STATE
  // ========================================

  const [theme, setTheme] = useState(
    () => localStorage.getItem("lifeos_theme") || "light"
  );

  // ========================================
  // APPLY AND SAVE THEME
  // ========================================

  useEffect(() => {
    const mediaQuery = window.matchMedia(
      "(prefers-color-scheme: dark)"
    );

    const applyTheme = () => {
      const resolvedTheme =
        theme === "system"
          ? mediaQuery.matches
            ? "dark"
            : "light"
          : theme;

      document.documentElement.setAttribute(
        "data-theme",
        resolvedTheme
      );

      localStorage.setItem("lifeos_theme", theme);
    };

    applyTheme();

    mediaQuery.addEventListener("change", applyTheme);

    return () => {
      mediaQuery.removeEventListener("change", applyTheme);
    };
  }, [theme]);

  // ========================================
  // TOGGLE LIGHT / DARK MODE
  // ========================================

  const toggleTheme = () => {
    setTheme((current) =>
      current === "dark" ? "light" : "dark"
    );
  };

  // ========================================
  // LOAD AUTHENTICATED USER PROFILE
  // ========================================

  useEffect(() => {
    if (!isAuthenticated) {
      setProfile({});
      return;
    }

    api
      .get("/auth/me")
      .then((response) => {
        setProfile(response.data ?? {});
      })
      .catch((err) => {
        console.error(
          "Unable to load user profile:",
          err
        );
      });
  }, [isAuthenticated]);

  // ========================================
  // LOAD DASHBOARD DATA
  // ========================================

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    setLoading(true);

    api
      .get("/dashboard/overview")
      .then((response) => {
        setDashboard(response.data);
        setError("");
      })
      .catch((err) => {
        if (err.response?.status === 401) {
          localStorage.removeItem("access_token");
          setIsAuthenticated(false);
        } else {
          setError(
            "Could not load dashboard. Please check your backend."
          );
        }
      })
      .finally(() => {
        setLoading(false);
      });
  }, [isAuthenticated]);

  // ========================================
  // LOGIN SCREEN
  // ========================================

  if (!isAuthenticated) {
    return (
      <Login
        onLoginSuccess={() => setIsAuthenticated(true)}
      />
    );
  }

  // ========================================
  // USER DISPLAY INFORMATION
  // ========================================

  const userName =
    profile.full_name ||
    profile.name ||
    profile.email ||
    "U";

  const userInitial = userName.charAt(0).toUpperCase();

  const profileImage =
    profile.profile_image || profile.avatar_url;

  // ========================================
  // SIDEBAR NAVIGATION
  // ========================================

  const navItems = [
    { label: "Dashboard", icon: LayoutDashboard },
    { label: "My Tasks", icon: CheckSquare },
    { label: "My Goals", icon: Target },
    { label: "Habits", icon: Repeat },
    { label: "Calendar", icon: CalendarDays },
    { label: "Analytics", icon: BarChart3 },
    { label: "Profile", icon: User },
    { label: "AI Assistant", icon: BrainCircuit },
  ];

  // ========================================
  // SEARCHABLE WORKSPACE PAGES
  // ========================================

  const searchablePages = [
    ...navItems,
    { label: "Settings", icon: Settings },
  ];

  // ========================================
  // FILTER SEARCH RESULTS
  // ========================================

  const filteredSearchItems = searchablePages.filter(
    (item) =>
      item.label
        .toLowerCase()
        .includes(searchQuery.trim().toLowerCase())
  );

  // ========================================
  // DASHBOARD STATISTICS
  // ========================================

  const stats = [
    {
      label: "Total Tasks",
      value: dashboard?.total_tasks ?? 0,
      detail: `${dashboard?.completed_tasks ?? 0} completed`,
      icon: CheckSquare,
      color: "purple",
    },
    {
      label: "Active Goals",
      value: dashboard?.active_goals ?? 0,
      detail: `${dashboard?.total_goals ?? 0} total goals`,
      icon: Target,
      color: "blue",
    },
    {
      label: "Active Habits",
      value: dashboard?.active_habits ?? 0,
      detail: `${dashboard?.completed_habits_today ?? 0} completed today`,
      icon: Zap,
      color: "orange",
    },
    {
      label: "In Progress",
      value: dashboard?.in_progress_tasks ?? 0,
      detail: `${dashboard?.pending_tasks ?? 0} pending tasks`,
      icon: Clock,
      color: "green",
    },
  ];

  // ========================================
  // NAVIGATION
  // ========================================

  const handleNavigation = (page: string) => {
    setActivePage(page);

    setMenuOpen(false);
    setSearchOpen(false);
    setNotificationsOpen(false);

    // Hide floating AI when opening its full page.
    if (page === "AI Assistant") {
      setAiWidgetOpen(false);
      setAiWidgetMinimized(false);
    }
  };

  // ========================================
  // OPEN FLOATING AI ASSISTANT
  // ========================================

  const openAIWidget = () => {
    setAiWidgetOpen(true);
    setAiWidgetMinimized(false);
  };

  // ========================================
  // MINIMIZE FLOATING AI ASSISTANT
  // ========================================

  const minimizeAIWidget = () => {
    setAiWidgetMinimized(true);
  };

  // ========================================
  // CLOSE FLOATING AI ASSISTANT
  // ========================================

  const closeAIWidget = () => {
    setAiWidgetOpen(false);
    setAiWidgetMinimized(false);
  };

  // ========================================
  // LOGOUT
  // ========================================

  const handleLogout = () => {
    localStorage.removeItem("access_token");

    setDashboard(null);
    setProfile({});

    setActivePage("Dashboard");

    setAiWidgetOpen(false);
    setAiWidgetMinimized(false);

    setIsAuthenticated(false);
  };

  // ========================================
  // SHARED AI DISPLAY MODE
  // ========================================

  const isAIPage = activePage === "AI Assistant";

  const showFloatingAI =
    aiWidgetOpen &&
    !aiWidgetMinimized &&
    !isAIPage;

  const showAIHost =
    isAIPage || showFloatingAI;

  // ========================================
  // RENDER
  // ========================================

  return (
    <div className="app-shell">

      {/* CURSOR GLOW AND DOT BACKGROUND */}

      <CursorGlow />

      {/* =====================================
          SIDEBAR
      ====================================== */}

      <aside
        className={`sidebar ${
          menuOpen ? "sidebar-open" : ""
        }`}
      >

        {/* LIFEOS BRAND */}

        <div className="brand">

          <div className="brand-icon">
            <BrainCircuit
              size={25}
              strokeWidth={2.2}
            />
          </div>

          <span>
            Life<span className="brand-highlight">OS</span>
          </span>

          <button
            className="mobile-close"
            onClick={() => setMenuOpen(false)}
            aria-label="Close menu"
            type="button"
          >
            <X size={20} />
          </button>

        </div>

        <div className="workspace-label">
          WORKSPACE
        </div>

        {/* NAVIGATION */}

        <nav className="sidebar-nav">

          {navItems.map((item) => {
            const Icon = item.icon;

            const isActive =
              activePage === item.label;

            return (
              <button
                key={item.label}
                className={`nav-item ${
                  isActive ? "active" : ""
                }`}
                onClick={() =>
                  handleNavigation(item.label)
                }
                type="button"
              >
                <Icon size={19} />

                <span>{item.label}</span>

                {isActive && (
                  <span className="active-dot" />
                )}
              </button>
            );
          })}

        </nav>

        {/* SIDEBAR BOTTOM */}

        <div className="sidebar-bottom">

          {/* SETTINGS */}

          <button
            className={`nav-item ${
              activePage === "Settings" ? "active" : ""
            }`}
            onClick={() => handleNavigation("Settings")}
            type="button"
          >
            <Settings size={19} />
            <span>Settings</span>
          </button>

          {/* USER PROFILE SHORTCUT */}

          <button
            className="profile-card"
            onClick={() => handleNavigation("Profile")}
            type="button"
          >
            {profileImage ? (
              <img
                src={profileImage}
                alt="Profile"
                className="avatar profile-avatar-image"
              />
            ) : (
              <div className="avatar">
                {userInitial}
              </div>
            )}

            <div className="profile-info">

              <strong>
                {profile.full_name ||
                  profile.name ||
                  "My Workspace"}
              </strong>

              <span>
                {profile.email || "Personal account"}
              </span>

            </div>

            <ArrowUpRight size={16} />

          </button>

        </div>

      </aside>

      {/* MOBILE OVERLAY */}

      {menuOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setMenuOpen(false)}
        />
      )}

      {/* =====================================
          MAIN CONTENT
      ====================================== */}

      <main className="main-content">

        {/* =====================================
            TOPBAR
        ====================================== */}

        <header className="topbar">

          <button
            className="mobile-menu"
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
            type="button"
          >
            <Menu size={22} />
          </button>

          <div className="breadcrumb">
            Workspace <span>/</span>{" "}
            <strong>{activePage}</strong>
          </div>

          <div className="topbar-actions">

            {/* SMART SEARCH */}

            <div
              className={`topbar-search ${
                searchOpen ? "search-active" : ""
              }`}
            >
              <Search
                size={18}
                className="search-icon"
              />

              <input
                type="text"
                placeholder="Search workspace..."
                value={searchQuery}
                onChange={(event) =>
                  setSearchQuery(event.target.value)
                }
                onFocus={() => {
                  setSearchOpen(true);
                  setNotificationsOpen(false);
                }}
                onKeyDown={(event) => {
                  if (
                    event.key === "Enter" &&
                    filteredSearchItems.length > 0
                  ) {
                    handleNavigation(
                      filteredSearchItems[0].label
                    );

                    setSearchQuery("");
                  }

                  if (event.key === "Escape") {
                    setSearchOpen(false);
                  }
                }}
                aria-label="Search workspace pages"
              />

              {searchQuery && (
                <button
                  className="search-clear"
                  onClick={() => setSearchQuery("")}
                  type="button"
                  aria-label="Clear search"
                >
                  <X size={15} />
                </button>
              )}

              {searchOpen && (
                <div className="search-dropdown">

                  <div className="dropdown-heading">
                    {searchQuery
                      ? "SEARCH RESULTS"
                      : "QUICK SEARCH"}
                  </div>

                  {searchQuery.trim() ? (
                    filteredSearchItems.length > 0 ? (
                      filteredSearchItems.map((item) => {
                        const Icon = item.icon;

                        return (
                          <button
                            key={item.label}
                            className="search-result"
                            onClick={() => {
                              handleNavigation(item.label);
                              setSearchQuery("");
                            }}
                            type="button"
                          >
                            <span className="search-result-icon">
                              <Icon size={17} />
                            </span>

                            <span>{item.label}</span>

                            <ArrowUpRight
                              size={15}
                              className="search-result-arrow"
                            />
                          </button>
                        );
                      })
                    ) : (
                      <div className="search-empty">

                        <Search size={20} />

                        <span>
                          No matching pages found
                        </span>

                        <small>
                          Try another search term.
                        </small>

                      </div>
                    )
                  ) : (
                    <div className="search-hint">
                      Start typing to find a page in your workspace.
                    </div>
                  )}

                </div>
              )}

            </div>

            {/* THEME TOGGLE */}

            <button
              className="icon-button theme-toggle"
              title={
                theme === "dark"
                  ? "Switch to light mode"
                  : "Switch to dark mode"
              }
              aria-label={
                theme === "dark"
                  ? "Switch to light mode"
                  : "Switch to dark mode"
              }
              onClick={toggleTheme}
              type="button"
            >
              {theme === "dark" ? (
                <Sun size={19} />
              ) : (
                <Moon size={19} />
              )}
            </button>

            {/* NOTIFICATION CENTER */}

            <div className="notification-wrapper">

              <button
                className={`icon-button notification-button ${
                  notificationsOpen
                    ? "notification-active"
                    : ""
                }`}
                title="Notifications"
                aria-label="Open notifications"
                aria-expanded={notificationsOpen}
                onClick={() => {
                  setNotificationsOpen((current) => !current);
                  setSearchOpen(false);
                }}
                type="button"
              >
                <Bell size={19} />
              </button>

              {notificationsOpen && (
                <div className="notification-dropdown">

                  <div className="notification-header">

                    <div>
                      <strong>Notifications</strong>

                      <span>
                        Stay updated with LifeOS
                      </span>
                    </div>

                    <span className="notification-count">
                      0 new
                    </span>

                  </div>

                  <div className="notification-empty">

                    <div className="notification-empty-icon">
                      <Bell size={25} />
                    </div>

                    <strong>
                      You're all caught up!
                    </strong>

                    <p>
                      You don't have any notifications right now.
                      New updates will appear here.
                    </p>

                  </div>

                  <div className="notification-footer">
                    LifeOS Notification Center
                  </div>

                </div>
              )}

            </div>

            {/* TOP PROFILE AVATAR */}

            <button
              className="top-avatar"
              type="button"
              title="Open profile"
              onClick={() => handleNavigation("Profile")}
            >
              {profileImage ? (
                <img
                  src={profileImage}
                  alt="Profile"
                  className="top-avatar-image"
                />
              ) : (
                userInitial
              )}
            </button>

            {/* LOGOUT */}

            <button
              className="icon-button"
              title="Logout"
              onClick={handleLogout}
              type="button"
            >
              <ArrowUpRight size={19} />
            </button>

          </div>

        </header>

        {/* =====================================
            DASHBOARD
        ====================================== */}

        {activePage === "Dashboard" && (
          <div className="dashboard-content">

            {/* WELCOME SECTION */}

            <section className="welcome-section">

              <div>

                <div className="eyebrow">
                  YOUR PERSONAL COMMAND CENTER
                </div>

                <h1>
                  Welcome back,{" "}
                  {profile.full_name ||
                    profile.name ||
                    "there"}!{" "}
                  <span>✦</span>
                </h1>

                <p>
                  Here's what's happening with your life today.
                </p>

              </div>

              <button
                className="primary-button"
                onClick={() => handleNavigation("My Tasks")}
                type="button"
              >
                <Plus size={18} />
                Create new
              </button>

            </section>

            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

            {/* STATISTICS */}

            <section className="stats-grid">

              {stats.map((stat) => {
                const Icon = stat.icon;

                return (
                  <div
                    className="stat-card"
                    key={stat.label}
                  >
                    <div className={`stat-icon ${stat.color}`}>
                      <Icon size={21} />
                    </div>

                    <div className="stat-label">
                      {stat.label}
                    </div>

                    <div className="stat-value">
                      {loading ? "—" : stat.value}
                    </div>

                    <div className="stat-detail">
                      {stat.detail}
                    </div>
                  </div>
                );
              })}

            </section>

            {/* DASHBOARD GRID */}

            <section className="dashboard-grid">

              {/* TASK OVERVIEW */}

              <div className="panel tasks-panel">

                <div className="panel-heading">

                  <div>
                    <h2>Task Overview</h2>
                    <p>
                      Stay on top of your productivity
                    </p>
                  </div>

                  <button
                    className="text-button"
                    onClick={() =>
                      handleNavigation("My Tasks")
                    }
                    type="button"
                  >
                    View all <ArrowUpRight size={15} />
                  </button>

                </div>

                <div className="task-progress-list">

                  {/* COMPLETED */}

                  <div className="progress-item">

                    <div className="progress-label">
                      <span>Completed</span>

                      <strong>
                        {dashboard?.completed_tasks ?? 0}
                      </strong>
                    </div>

                    <div className="progress-track">

                      <div
                        className="progress-fill purple-fill"
                        style={{
                          width: `${
                            dashboard?.total_tasks
                              ? (dashboard.completed_tasks /
                                  dashboard.total_tasks) *
                                100
                              : 0
                          }%`,
                        }}
                      />

                    </div>

                  </div>

                  {/* IN PROGRESS */}

                  <div className="progress-item">

                    <div className="progress-label">
                      <span>In Progress</span>

                      <strong>
                        {dashboard?.in_progress_tasks ?? 0}
                      </strong>
                    </div>

                    <div className="progress-track">

                      <div
                        className="progress-fill blue-fill"
                        style={{
                          width: `${
                            dashboard?.total_tasks
                              ? (dashboard.in_progress_tasks /
                                  dashboard.total_tasks) *
                                100
                              : 0
                          }%`,
                        }}
                      />

                    </div>

                  </div>

                  {/* PENDING */}

                  <div className="progress-item">

                    <div className="progress-label">
                      <span>Pending</span>

                      <strong>
                        {dashboard?.pending_tasks ?? 0}
                      </strong>
                    </div>

                    <div className="progress-track">

                      <div
                        className="progress-fill orange-fill"
                        style={{
                          width: `${
                            dashboard?.total_tasks
                              ? (dashboard.pending_tasks /
                                  dashboard.total_tasks) *
                                100
                              : 0
                          }%`,
                        }}
                      />

                    </div>

                  </div>

                </div>

                <div className="task-total">

                  <div>
                    <strong>
                      {dashboard?.total_tasks ?? 0}
                    </strong>

                    <span>
                      Total tasks in your workspace
                    </span>
                  </div>

                  <div className="total-icon">
                    <CheckSquare size={23} />
                  </div>

                </div>

              </div>

              {/* GOALS */}

              <div className="panel goals-panel">

                <div className="panel-heading">

                  <div>
                    <h2>Goals & Growth</h2>
                    <p>Keep moving forward</p>
                  </div>

                  <Target
                    size={21}
                    className="heading-icon"
                  />

                </div>

                <div className="goal-highlight">

                  <div className="goal-circle">
                    <Target size={27} />
                  </div>

                  <div>
                    <strong>
                      {dashboard?.active_goals ?? 0} Active Goals
                    </strong>

                    <span>
                      {dashboard?.completed_goals ?? 0} goals completed
                    </span>
                  </div>

                </div>

                <div className="goal-tip">

                  <Zap size={17} />

                  <div>
                    <strong>
                      Small steps, big results.
                    </strong>

                    <span>
                      Consistency is the key to progress.
                    </span>
                  </div>

                </div>

                <button
                  className="text-button"
                  onClick={() =>
                    handleNavigation("My Goals")
                  }
                  type="button"
                >
                  Manage goals <ArrowUpRight size={15} />
                </button>

              </div>

              {/* HABITS */}

              <div className="panel habits-panel">

                <div className="panel-heading">

                  <div>
                    <h2>Daily Habits</h2>
                    <p>Build your best routine</p>
                  </div>

                  <Repeat
                    size={21}
                    className="heading-icon"
                  />

                </div>

                <div className="habit-summary">

                  <div className="habit-number">
                    {dashboard?.completed_habits_today ?? 0}

                    <span>
                      {" "}
                      / {dashboard?.active_habits ?? 0}
                    </span>
                  </div>

                  <p>
                    Active habits completed today
                  </p>

                  <div className="progress-track habit-track">

                    <div
                      className="progress-fill green-fill"
                      style={{
                        width: `${
                          dashboard?.active_habits
                            ? Math.min(
                                100,
                                (dashboard.completed_habits_today /
                                  dashboard.active_habits) *
                                  100
                              )
                            : 0
                        }%`,
                      }}
                    />

                  </div>

                </div>

              </div>

              {/* FOCUS CARD */}

              <div className="panel focus-panel">

                <div className="focus-decoration">
                  ✦
                </div>

                <div className="eyebrow">
                  A LITTLE REMINDER
                </div>

                <h2>
                  Make today
                  <br />
                  count.
                </h2>

                <p>
                  Your future is created by what you do today,
                  not tomorrow.
                </p>

                <div className="focus-footer">
                  <Zap size={16} />
                  Stay focused. Keep growing.
                </div>

              </div>

            </section>

            {/* FOOTER */}

            <footer className="dashboard-footer">

              <span>LifeOS © 2026</span>

              <span>
                Built for a more intentional life
                <span className="footer-heart"> ♥</span>
              </span>

            </footer>

          </div>
        )}

        {/* =====================================
            TASKS
        ====================================== */}

        {activePage === "My Tasks" && (
          <div className="dashboard-content">
            <Tasks />
          </div>
        )}

        {/* =====================================
            GOALS
        ====================================== */}

        {activePage === "My Goals" && (
          <div className="dashboard-content">
            <Goals />
          </div>
        )}

        {/* =====================================
            HABITS
        ====================================== */}

        {activePage === "Habits" && (
          <div className="dashboard-content">
            <Habits />
          </div>
        )}

        {/* =====================================
            CALENDAR
        ====================================== */}

        {activePage === "Calendar" && (
          <div className="dashboard-content">
            <Calendar />
          </div>
        )}

        {/* =====================================
            ANALYTICS
        ====================================== */}

        {activePage === "Analytics" && (
          <div className="dashboard-content">
            <Analytics />
          </div>
        )}

        {/* =====================================
            PROFILE
        ====================================== */}

        {activePage === "Profile" && (
          <div className="dashboard-content">
            <Profile
              profile={profile}
              setProfile={setProfile}
            />
          </div>
        )}

        {/* =====================================
            SETTINGS
        ====================================== */}

        {activePage === "Settings" && (
          <div className="dashboard-content">
            <SettingsPage
              theme={theme}
              setTheme={setTheme}
              profile={profile}
              setProfile={setProfile}
            />
          </div>
        )}

        {/* =====================================
            SHARED AI ASSISTANT HOST

            Only one AIChat instance is mounted.
            This preserves its React state when
            switching between page and widget mode.
        ====================================== */}

        <div
          className={
            isAIPage
              ? "ai-shared-host ai-shared-host-page"
              : showFloatingAI
              ? "ai-shared-host ai-floating-panel"
              : "ai-shared-host ai-shared-host-hidden"
          }
          aria-hidden={!showAIHost}
        >

          <AIChat
            mode={isAIPage ? "page" : "widget"}
            onClose={closeAIWidget}
            onMinimize={minimizeAIWidget}
          />

        </div>

      </main>

      {/* =====================================
          FLOATING AI LAUNCHER
      ====================================== */}

      {!isAIPage && !showFloatingAI && (
        <button
          className="ai-floating-launcher"
          onClick={openAIWidget}
          type="button"
          title="Chat with LifeOS AI"
          aria-label="Open LifeOS AI Assistant"
        >

          <BrainCircuit size={27} />

          <span className="ai-launcher-sparkle">
            <Sparkles size={13} />
          </span>

        </button>
      )}

    </div>
  );
}

export default App;
